import { Alert, Card, CardContent } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { PageHeader } from '../../../components/PageHeader';
import { useLanguage } from '../../../hooks/useLanguage';
import { getErrorMessage } from '../../../lib/format';
import { PatientForm } from '../components/PatientForm';
import {
  PatientPayload,
  useCreatePatient,
  usePatientDetails,
  useUpdatePatient
} from '../api';

interface PatientFormPageProps {
  patientId?: string;
}

export const PatientFormPage = ({ patientId }: PatientFormPageProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isEdit = Boolean(patientId);
  const { data, isLoading } = usePatientDetails(patientId || '');
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient(patientId || '');

  const mutation = isEdit ? updateMutation : createMutation;

  const handleSubmit = async (values: PatientPayload) => {
    const patient = isEdit
      ? await updateMutation.mutateAsync(values)
      : await createMutation.mutateAsync(values);

    await navigate({
      to: '/patients/$patientId',
      params: { patientId: patient._id }
    });
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? t('common.editPatient') : t('common.addPatient')}
        subtitle={t('patientsPage.formSubtitle')}
      />
      {mutation.isError ? <Alert severity="error">{getErrorMessage(mutation.error)}</Alert> : null}
      <Card>
        <CardContent>
          {isEdit && isLoading ? (
            <LoadingScreen />
          ) : (
            <PatientForm
              defaultValues={data?.patient}
              onSubmit={handleSubmit}
              isSubmitting={mutation.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
