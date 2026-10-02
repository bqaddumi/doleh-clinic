import FacebookIcon from '@mui/icons-material/Facebook';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Box, Button, Container, Divider, IconButton, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from '@tanstack/react-router';
import { useLanguage } from '../../../hooks/useLanguage';
import { FACEBOOK_URL, WHATSAPP_URL } from './ContactSection';
import { scrollToSection } from './LandingNavbar';

export const LandingFooter = () => {
  const { t } = useLanguage();
  const links = [
    { id: 'services', label: t('landingPage.navServices') },
    { id: 'availability', label: t('landingPage.navAvailability') },
    { id: 'gallery', label: t('landingPage.navGallery') },
    { id: 'faq', label: t('landingPage.navFaq') },
    { id: 'contact', label: t('landingPage.navContact') },
    { id: 'reserve-now', label: t('landingPage.navBook') }
  ];

  return (
    <Box component="footer" sx={{ bgcolor: '#0c2a35', color: '#fff', pt: 7, pb: 3 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr 1fr' } }}>
          <Stack spacing={2}>
            <Box
              component="img"
              src="/doleh-clinic-logo.jpg"
              alt="Doleh Clinic logo"
              sx={{ width: 150, borderRadius: 3, bgcolor: '#fff' }}
            />
            <Typography sx={{ opacity: 0.8, maxWidth: 360 }}>{t('landingPage.footerTagline')}</Typography>
          </Stack>

          <Stack spacing={1} alignItems="flex-start">
            <Typography variant="subtitle1" fontWeight={800}>
              {t('landingPage.footerLinks')}
            </Typography>
            {links.map((link) => (
              <Button key={link.id} color="inherit" size="small" sx={{ opacity: 0.85, px: 0 }} onClick={() => scrollToSection(link.id)}>
                {link.label}
              </Button>
            ))}
            <Button component={RouterLink} to="/login" color="inherit" size="small" sx={{ opacity: 0.85, px: 0 }}>
              {t('landingPage.staffLogin')}
            </Button>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={800}>
              {t('landingPage.footerHours')}
            </Typography>
            <Typography sx={{ opacity: 0.85 }}>{t('landingPage.footerDays')}</Typography>
            <Typography sx={{ opacity: 0.85, pt: 1 }}>{t('landingPage.address')}</Typography>
            <Typography
              component="a"
              dir="ltr"
              href={`tel:${t('landingPage.phoneNumber')}`}
              sx={{ opacity: 0.85, color: 'inherit', textDecoration: 'none', alignSelf: 'flex-start', fontWeight: 700 }}
            >
              {t('landingPage.phoneNumber')}
            </Typography>
            <Button
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              startIcon={<WhatsAppIcon />}
              sx={{ opacity: 0.85, px: 0, alignSelf: 'flex-start' }}
            >
              {t('landingPage.whatsapp')}
            </Button>
            <Button
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              startIcon={<FacebookIcon />}
              sx={{ opacity: 0.85, px: 0, alignSelf: 'flex-start' }}
            >
              {t('landingPage.facebookPage')}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.15)' }} />
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {t('landingPage.footerRights', { year: new Date().getFullYear() })}
          </Typography>
          <IconButton
            aria-label={t('landingPage.backToTop')}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)', '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' } }}
          >
            <KeyboardArrowUpIcon />
          </IconButton>
        </Stack>
      </Container>
    </Box>
  );
};
