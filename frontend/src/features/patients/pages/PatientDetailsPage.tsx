import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { PageHeader } from '../../../components/PageHeader';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatDate, getErrorMessage } from '../../../lib/format';
import { usePatientDetails } from '../api';

export const PatientDetailsPage = ({ patientId }: { patientId: string }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data, isLoading, isError, error } = usePatientDetails(patientId);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !data) {
    return <Alert severity="error">{getErrorMessage(error)}</Alert>;
  }

  const { patient, reports } = data;

  return (
    <div>
      <PageHeader
        title={patient.fullName}
        subtitle={t('patientsPage.patientSubtitle', { condition: patient.condition })}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate({ to: '/reports/new', search: { patientId: patient._id } })}
            >
              {t('common.addReport')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() =>
                navigate({
                  to: '/patients/$patientId/edit',
                  params: { patientId: patient._id }
                })
              }
            >
              {t('common.editPatient')}
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography><strong>{t('common.phone')}:</strong> {patient.phone}</Typography>
                <Typography><strong>{t('common.age')}:</strong> {patient.age}</Typography>
                <Typography><strong>{t('common.gender')}:</strong> {t(`common.${patient.gender}` as const)}</Typography>
                <Typography><strong>{t('common.address')}:</strong> {patient.address || t('common.notAvailable')}</Typography>
                <Typography><strong>{t('common.lastVisit')}:</strong> {formatDate(patient.lastVisit)}</Typography>
                <Typography><strong>{t('common.notes')}:</strong> {patient.notes || t('common.notAvailable')}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('common.reports')}
              </Typography>
              <Stack spacing={2}>
                {reports.map((report) => (
                  <Card key={report._id} variant="outlined">
                    <CardContent>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <div>
                          <Typography fontWeight={700}>{formatDate(report.date)}</Typography>
                          <Typography color="text.secondary">{report.diagnosis}</Typography>
                        </div>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={t(`common.${report.progress}` as const)} color="primary" variant="outlined" />
                          <Button
                            onClick={() =>
                              navigate({
                                to: '/reports/$reportId',
                                params: { reportId: report._id }
                              })
                            }
                          >
                            {t('common.view')}
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
                {!reports.length ? (
                  <Typography color="text.secondary">{t('patientsPage.reportsEmpty')}</Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};
