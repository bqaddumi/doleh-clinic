import { Alert, Card, CardContent } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { PageHeader } from '../../../components/PageHeader';
import { useLanguage } from '../../../hooks/useLanguage';
import { getErrorMessage } from '../../../lib/format';
import { usePatients } from '../../patients/api';
import { ReportForm } from '../components/ReportForm';
import {
  ReportPayload,
  useCreateReport,
  useReportDetails,
  useUpdateReport
} from '../api';

interface ReportFormPageProps {
  reportId?: string;
  presetPatientId?: string;
}

export const ReportFormPage = ({ reportId, presetPatientId }: ReportFormPageProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isEdit = Boolean(reportId);
  const patientsQuery = usePatients({
    search: '',
    page: 1,
    limit: 100,
    sortBy: 'fullName',
    sortOrder: 'asc'
  });
  const reportQuery = useReportDetails(reportId || '');
  const createMutation = useCreateReport();
  const updateMutation = useUpdateReport(reportId || '');
  const mutation = isEdit ? updateMutation : createMutation;

  if (patientsQuery.isLoading || (isEdit && reportQuery.isLoading)) {
    return <LoadingScreen />;
  }

  const handleSubmit = async (values: ReportPayload) => {
    const report = isEdit
      ? await updateMutation.mutateAsync(values)
      : await createMutation.mutateAsync(values);

    await navigate({
      to: '/reports/$reportId',
      params: { reportId: report._id }
    });
  };

  const report = reportQuery.data;
  const patientId =
    typeof report?.patientId === 'string' ? report.patientId : report?.patientId?._id;

  return (
    <div>
      <PageHeader
        title={isEdit ? t('common.editReport') : t('common.addReport')}
        subtitle={t('reportsPage.formSubtitle')}
      />
      {mutation.isError ? <Alert severity="error">{getErrorMessage(mutation.error)}</Alert> : null}
      <Card>
        <CardContent>
          <ReportForm
            patients={patientsQuery.data?.items || []}
            defaultValues={{
              patientId: presetPatientId || patientId || '',
              date: report?.date ? report.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
              diagnosis: report?.diagnosis,
              treatmentPlan: report?.treatmentPlan,
              sessionNotes: report?.sessionNotes,
              progress: report?.progress,
              attachmentsText: report?.attachments?.join('\n')
            }}
            onSubmit={handleSubmit}
            isSubmitting={mutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};
