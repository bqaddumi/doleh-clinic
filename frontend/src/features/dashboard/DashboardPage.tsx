import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { ReactElement } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingScreen } from '../../components/LoadingScreen';
import { PageHeader } from '../../components/PageHeader';
import { useLanguage } from '../../hooks/useLanguage';
import { formatDate, getErrorMessage } from '../../lib/format';
import { useDashboardStats } from './api';
import { DonutSummary, MiniBarChart, ProgressChart } from './DashboardCharts';

const StatCard = ({
  title,
  value,
  icon
}: {
  title: string;
  value: number;
  icon: ReactElement;
}) => (
  <Card>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <div>
          <Typography color="text.secondary">{title}</Typography>
          <Typography variant="h4">{value}</Typography>
        </div>
        <Chip icon={icon} label={title} color="primary" variant="outlined" />
      </Stack>
    </CardContent>
  </Card>
);

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { t, direction } = useLanguage();
  const { data, isLoading, isError, error } = useDashboardStats();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return <Alert severity="error">{getErrorMessage(error)}</Alert>;
  }

  return (
    <div>
      <PageHeader
        title={t('common.dashboard')}
        subtitle={t('dashboardPage.subtitle')}
        action={
          <Stack
            direction="row"
            sx={{
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: direction === 'rtl' ? 'flex-end' : 'flex-start'
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate({ to: '/patients/new' })}
            >
              {t('common.addPatient')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate({ to: '/reports/new', search: { patientId: '' } })}
            >
              {t('common.addReport')}
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatCard title={t('common.totalPatients')} value={data?.totalPatients ?? 0} icon={<GroupIcon />} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatCard title={t('common.totalReports')} value={data?.totalReports ?? 0} icon={<AssignmentIcon />} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('common.recentPatients')}
              </Typography>
              {data?.recentPatients.length ? (
                <List disablePadding>
                  {data.recentPatients.map((patient) => (
                    <ListItem
                      key={patient._id}
                      sx={{ px: 0, cursor: 'pointer' }}
                      onClick={() =>
                        navigate({
                          to: '/patients/$patientId',
                          params: { patientId: patient._id }
                        })
                      }
                    >
                      <ListItemText
                        primary={patient.fullName}
                        secondary={`${patient.condition} • ${t('dashboardPage.lastVisitLabel')}: ${formatDate(patient.lastVisit)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <EmptyState
                  title={t('dashboardPage.noPatientsTitle')}
                  description={t('dashboardPage.noPatientsDescription')}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboardPage.reportsTrend')}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {t('dashboardPage.reportsTrendSubtitle')}
              </Typography>
              <MiniBarChart data={data?.charts.reportTrend ?? []} color="#1f6f8b" />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3.5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboardPage.progressOverview')}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {t('dashboardPage.progressOverviewSubtitle')}
              </Typography>
              <ProgressChart
                data={(data?.charts.progressBreakdown ?? []).map((item) => ({
                  label: t(`common.${item.label}` as const),
                  value: item.value
                }))}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3.5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboardPage.conditionsOverview')}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {t('dashboardPage.conditionsOverviewSubtitle')}
              </Typography>
              <DonutSummary data={data?.charts.conditionBreakdown ?? []} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};
