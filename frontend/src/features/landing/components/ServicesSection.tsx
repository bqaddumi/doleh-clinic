import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import BoltIcon from '@mui/icons-material/Bolt';
import ElderlyIcon from '@mui/icons-material/Elderly';
import HealingIcon from '@mui/icons-material/Healing';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import { Box, Container, Stack, Typography } from '@mui/material';
import { ReactElement, ReactNode } from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import { Reveal } from './Reveal';

export const SectionHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <Stack spacing={1} sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center', alignItems: 'center' }}>
    <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.4rem' }, fontWeight: 800 }}>
      {title}
    </Typography>
    <Box sx={{ width: 56, height: 4, borderRadius: 2, bgcolor: 'secondary.main' }} />
    <Typography color="text.secondary" sx={{ maxWidth: 560 }}>
      {subtitle}
    </Typography>
  </Stack>
);

export const Section = ({ id, children, tinted = false }: { id: string; children: ReactNode; tinted?: boolean }) => (
  <Box
    id={id}
    component="section"
    sx={{
      py: { xs: 6, md: 9 },
      scrollMarginTop: 72,
      bgcolor: tinted ? (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(31,111,139,0.05)') : 'transparent'
    }}
  >
    <Container maxWidth="xl">{children}</Container>
  </Box>
);

const services: Array<{ title: string; text: string; icon: ReactElement }> = [
  { title: 'landingPage.serviceBackTitle', text: 'landingPage.serviceBackText', icon: <AccessibilityNewIcon fontSize="large" /> },
  { title: 'landingPage.serviceSportsTitle', text: 'landingPage.serviceSportsText', icon: <SportsSoccerIcon fontSize="large" /> },
  { title: 'landingPage.serviceRehabTitle', text: 'landingPage.serviceRehabText', icon: <HealingIcon fontSize="large" /> },
  { title: 'landingPage.serviceJointsTitle', text: 'landingPage.serviceJointsText', icon: <AccessibilityIcon fontSize="large" /> },
  { title: 'landingPage.serviceNeuroTitle', text: 'landingPage.serviceNeuroText', icon: <BoltIcon fontSize="large" /> },
  { title: 'landingPage.serviceElderlyTitle', text: 'landingPage.serviceElderlyText', icon: <ElderlyIcon fontSize="large" /> }
];

type Key = 'landingPage.serviceBackTitle';

export const ServicesSection = () => {
  const { t } = useLanguage();

  return (
    <Section id="services">
      <SectionHeading title={t('landingPage.servicesTitle')} subtitle={t('landingPage.servicesSubtitle')} />
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
        {services.map((service, index) => (
          <Reveal key={service.title} delay={(index % 3) * 100}>
            <Box
              sx={{
                height: '100%',
                p: 3.5,
                borderRadius: 4,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 18px rgba(31,111,139,0.06)',
                transition: 'transform 250ms ease, box-shadow 250ms ease, border-color 250ms ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  borderColor: 'secondary.main',
                  boxShadow: '0 16px 36px rgba(31,111,139,0.18)'
                },
                '&:hover .service-icon': { bgcolor: 'primary.main', color: '#fff' }
              }}
            >
              <Box
                className="service-icon"
                sx={{
                  width: 64,
                  height: 64,
                  mb: 2.5,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 3,
                  color: 'primary.main',
                  bgcolor: 'rgba(31,111,139,0.12)',
                  transition: 'background-color 250ms ease, color 250ms ease'
                }}
              >
                {service.icon}
              </Box>
              <Typography variant="h6" gutterBottom>
                {t(service.title as Key)}
              </Typography>
              <Typography color="text.secondary">{t(service.text as Key)}</Typography>
            </Box>
          </Reveal>
        ))}
      </Box>
    </Section>
  );
};
