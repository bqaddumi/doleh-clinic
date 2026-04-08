import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { PageHeader } from '../../../components/PageHeader';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatDate, getErrorMessage } from '../../../lib/format';
import { useReportDetails } from '../api';

export const ReportDetailsPage = ({ reportId }: { reportId: string }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data, isLoading, isError, error } = useReportDetails(reportId);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !data) {
    return <Alert severity="error">{getErrorMessage(error)}</Alert>;
  }

  const patient = typeof data.patientId === 'string' ? null : data.patientId;

  return (
    <div>
      <PageHeader
        title={t('reportsPage.detailsTitle')}
        subtitle={t('reportsPage.sessionDate', { date: formatDate(data.date) })}
        action={
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() =>
              navigate({
                to: '/reports/$reportId/edit',
                params: { reportId: data._id }
              })
            }
          >
            {t('common.editReport')}
          </Button>
        }
      />

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography><strong>{t('reportsPage.detailsPatient')}:</strong> {patient?.fullName || t('common.unknownPatient')}</Typography>
            <Typography><strong>{t('reportsPage.detailsDiagnosis')}:</strong> {data.diagnosis}</Typography>
            <Typography><strong>{t('reportsPage.detailsTreatment')}:</strong> {data.treatmentPlan}</Typography>
            <Typography><strong>{t('reportsPage.detailsSessionNotes')}:</strong> {data.sessionNotes}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography><strong>{t('reportsPage.detailsProgress')}:</strong></Typography>
              <Chip label={t(`common.${data.progress}` as const)} color="primary" variant="outlined" />
            </Stack>
            <div>
              <Typography fontWeight={700}>{t('common.attachments')}</Typography>
              {data.attachments?.length ? (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {data.attachments.map((attachment) => (
                    <a key={attachment} href={attachment} target="_blank" rel="noreferrer">
                      {attachment}
                    </a>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">{t('common.noAttachments')}</Typography>
              )}
            </div>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
};
