import LoginIcon from '@mui/icons-material/Login';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography
} from '@mui/material';
import { Link as RouterLink } from '@tanstack/react-router';
import { DataTable } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import { LoadingScreen } from '../../components/LoadingScreen';
import { useLanguage } from '../../hooks/useLanguage';
import { formatDateTime, getErrorMessage } from '../../lib/format';
import { TodayReservationQueueItem } from '../../types';
import { PublicReservationForm } from '../reservations/components/PublicReservationForm';
import { useTodayReservationsOverview } from '../reservations/api';
import { Alert, Chip } from '@mui/material';

const statusColorMap = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'error'
} as const;

export const LandingPage = () => {
  const { t } = useLanguage();
  const overviewQuery = useTodayReservationsOverview();

  if (overviewQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (overviewQuery.isError) {
    return <Alert severity="error">{getErrorMessage(overviewQuery.error)}</Alert>;
  }

  const currentSession = overviewQuery.data?.currentSession || null;
  const todaysReservations = overviewQuery.data?.todaysReservations || [];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, rgba(18,39,48,1) 0%, rgba(17,31,39,1) 45%, rgba(246,248,249,1) 45%, rgba(246,248,249,1) 100%)'
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Stack spacing={3}>
              <Box sx={{ color: 'common.white', pt: 2 }}>
                <Typography variant="h2" sx={{ fontSize: { xs: '2.2rem', md: '3.5rem' }, fontWeight: 800, mb: 2 }}>
                  {t('landingPage.title')}
                </Typography>
                <Typography variant="h6" sx={{ maxWidth: 700, color: 'rgba(255,255,255,0.8)' }}>
                  {t('landingPage.subtitle')}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
                  <Button component={RouterLink} to="/login" variant="contained" size="large" startIcon={<LoginIcon />}>
                    {t('common.login')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ color: 'common.white', borderColor: 'rgba(255,255,255,0.35)' }}
                    onClick={() => document.getElementById('reserve-now')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {t('reservationsPage.requestReservation')}
                  </Button>
                </Stack>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ borderRadius: 4 }}>
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">
                        {t('landingPage.currentSession')}
                      </Typography>
                      {currentSession ? (
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          <Typography variant="h4">{currentSession.fullName}</Typography>
                          <Typography color="text.secondary">{formatDateTime(currentSession.scheduledAt)}</Typography>
                          <Chip label={`${t('landingPage.queueNumber')}: ${currentSession.queuePosition}`} color="primary" sx={{ width: 'fit-content' }} />
                        </Stack>
                      ) : (
                        <Typography sx={{ mt: 1 }}>{t('landingPage.noCurrentSession')}</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ borderRadius: 4 }}>
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">
                        {t('landingPage.todayQueue')}
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        {todaysReservations.length}
                      </Typography>
                      <Typography color="text.secondary">{t('landingPage.todayQueueHint')}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Card id="reserve-now" sx={{ borderRadius: 5 }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h5" gutterBottom>
                  {t('landingPage.reserveTitle')}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  {t('landingPage.reserveSubtitle')}
                </Typography>
                <PublicReservationForm />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: 5 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h5" gutterBottom>
                  {t('landingPage.todaysReservations')}
                </Typography>
                {todaysReservations.length ? (
                  <DataTable<TodayReservationQueueItem>
                    rowKey={(row) => row._id}
                    rows={todaysReservations}
                    columns={[
                      { key: 'queue', header: t('landingPage.queueNumber'), render: (row) => row.queuePosition },
                      { key: 'name', header: t('patientsPage.fullName'), render: (row) => row.fullName },
                      { key: 'time', header: t('reservationsPage.reservationDateTime'), render: (row) => formatDateTime(row.scheduledAt) },
                      {
                        key: 'status',
                        header: t('common.status'),
                        render: (row) => <Chip size="small" color={statusColorMap[row.status]} label={t(`common.${row.status}` as const)} />
                      }
                    ]}
                  />
                ) : (
                  <EmptyState
                    title={t('landingPage.noReservationsTitle')}
                    description={t('landingPage.noReservationsDescription')}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
