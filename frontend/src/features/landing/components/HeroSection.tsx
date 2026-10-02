import { keyframes } from '@emotion/react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import TranslateIcon from '@mui/icons-material/Translate';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { Box, Button, Chip, Container, Skeleton, Stack, Typography } from '@mui/material';
import { ReactElement } from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import { useTodayReservationsOverview } from '../../reservations/api';
import { Reveal } from './Reveal';
import { scrollToSection } from './LandingNavbar';

const slowZoom = keyframes`
  from { transform: scale(1); }
  to { transform: scale(1.12); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 var(--pulse-color); }
  70% { box-shadow: 0 0 0 12px rgba(0,0,0,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
`;

const LiveStatusCard = () => {
  const { t } = useLanguage();
  const overviewQuery = useTodayReservationsOverview();
  const overview = overviewQuery.data;
  const running = Boolean(overview?.sessionInProgress);
  const color = running ? '#ff9800' : '#4caf50';

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: 5,
        color: '#fff',
        bgcolor: 'rgba(12, 28, 35, 0.72)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.35)'
      }}
    >
      <Typography variant="overline" sx={{ opacity: 0.75, letterSpacing: 1.5 }}>
        {t('landingPage.liveStatus')}
      </Typography>

      {overviewQuery.isLoading ? (
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Skeleton variant="text" width="70%" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
          <Skeleton variant="text" width="90%" sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
        </Stack>
      ) : overviewQuery.isError || !overview ? (
        <Typography sx={{ mt: 1, opacity: 0.85 }}>{t('landingPage.statusUnavailable')}</Typography>
      ) : (
        <>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
            <Box
              sx={{
                '--pulse-color': `${color}99`,
                width: 14,
                height: 14,
                flexShrink: 0,
                borderRadius: '50%',
                bgcolor: color,
                animation: `${pulse} 1.8s infinite`
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {running ? t('landingPage.sessionRunningTitle') : t('landingPage.clinicFreeTitle')}
            </Typography>
          </Stack>
          <Typography sx={{ mt: 1.5, opacity: 0.85 }}>
            {running ? t('landingPage.sessionRunningHint') : t('landingPage.clinicFreeHint')}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2.5 }}>
            <Chip
              size="small"
              label={
                overview.totalToday
                  ? t('landingPage.bookedToday', { count: overview.totalToday })
                  : t('landingPage.noBookingsToday')
              }
              sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.14)' }}
            />
            {overview.upcomingToday ? (
              <Chip
                size="small"
                label={t('landingPage.upcomingToday', { count: overview.upcomingToday })}
                sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.14)' }}
              />
            ) : null}
          </Stack>
        </>
      )}

      <Button
        fullWidth
        variant="contained"
        color="secondary"
        size="large"
        startIcon={<AccessTimeIcon />}
        onClick={() => scrollToSection('availability')}
        sx={{ mt: 3, color: '#06302c' }}
      >
        {t('landingPage.viewTimes')}
      </Button>
    </Box>
  );
};

const perks: Array<{ key: string; icon: ReactElement }> = [
  { key: 'landingPage.perkOnline', icon: <EventAvailableIcon fontSize="small" /> },
  { key: 'landingPage.perkPlans', icon: <VolunteerActivismIcon fontSize="small" /> },
  { key: 'landingPage.perkConfirm', icon: <TaskAltIcon fontSize="small" /> },
  { key: 'landingPage.perkBilingual', icon: <TranslateIcon fontSize="small" /> }
];

export const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <Box id="home" sx={{ position: 'relative', overflow: 'hidden', color: '#fff', scrollMarginTop: 72 }}>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('/login-background.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: `${slowZoom} 24s ease-in-out infinite alternate`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(10,38,48,0.92) 0%, rgba(18,78,96,0.78) 55%, rgba(31,111,139,0.55) 100%)'
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          py: { xs: 6, md: 11 },
          display: 'grid',
          gap: { xs: 4, md: 6 },
          gridTemplateColumns: { xs: '1fr', lg: '1.3fr 1fr' },
          alignItems: 'center'
        }}
      >
        <Reveal>
          <Stack spacing={3} alignItems="flex-start">
            <Chip
              label={t('landingPage.heroBadge')}
              sx={{ color: '#fff', bgcolor: 'rgba(77,182,172,0.3)', border: '1px solid rgba(255,255,255,0.25)', fontWeight: 700 }}
            />
            <Typography variant="h1" sx={{ fontSize: { xs: '2.1rem', sm: '2.9rem', md: '3.6rem' }, fontWeight: 800, lineHeight: 1.2 }}>
              {t('landingPage.title')}
            </Typography>
            <Typography sx={{ maxWidth: 620, fontSize: { xs: '1rem', md: '1.2rem' }, color: 'rgba(255,255,255,0.86)' }}>
              {t('landingPage.subtitle')}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button variant="contained" color="secondary" size="large" onClick={() => scrollToSection('reserve-now')} sx={{ color: '#06302c', px: 4 }}>
                {t('landingPage.bookNow')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => scrollToSection('services')}
                sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', px: 4 }}
              >
                {t('landingPage.navServices')}
              </Button>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ pt: 1 }}>
              {perks.map((perk) => (
                <Stack key={perk.key} direction="row" spacing={0.75} alignItems="center" sx={{ opacity: 0.92 }}>
                  {perk.icon}
                  <Typography variant="body2" fontWeight={600}>
                    {t(perk.key as 'landingPage.perkOnline')}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Reveal>

        <Reveal delay={150}>
          <LiveStatusCard />
        </Reveal>
      </Container>
    </Box>
  );
};
