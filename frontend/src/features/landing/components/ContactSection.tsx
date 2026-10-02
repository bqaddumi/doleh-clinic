import CallIcon from '@mui/icons-material/Call';
import FacebookIcon from '@mui/icons-material/Facebook';
import PlaceIcon from '@mui/icons-material/Place';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Box, Button, Stack, Typography } from '@mui/material';
import { ReactElement } from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import { Reveal } from './Reveal';
import { Section, SectionHeading } from './ServicesSection';

export const WHATSAPP_URL = 'https://wa.me/972598440175';
export const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61588868278347';

const ContactCard = ({ icon, title, children }: { icon: ReactElement; title: string; children: React.ReactNode }) => (
  <Stack
    spacing={1.5}
    alignItems="flex-start"
    sx={{ height: '100%', p: 3.5, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
  >
    <Box
      sx={{ width: 56, height: 56, display: 'grid', placeItems: 'center', borderRadius: 3, color: '#fff', background: 'linear-gradient(135deg, #1f6f8b, #4db6ac)' }}
    >
      {icon}
    </Box>
    <Typography variant="h6">{title}</Typography>
    {children}
  </Stack>
);

export const ContactSection = () => {
  const { t } = useLanguage();
  const phone = t('landingPage.phoneNumber');
  const address = t('landingPage.address');

  return (
    <Section id="contact">
      <SectionHeading title={t('landingPage.contactTitle')} subtitle={t('landingPage.contactSubtitle')} />
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
        <Reveal>
          <ContactCard icon={<CallIcon fontSize="large" />} title={t('landingPage.callUs')}>
            <Typography dir="ltr" variant="h5" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              {phone}
            </Typography>
            <Button variant="contained" href={`tel:${phone}`} startIcon={<CallIcon />}>
              {t('landingPage.callUs')}
            </Button>
            <Button
              variant="outlined"
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<WhatsAppIcon />}
              sx={{ color: '#128c7e', borderColor: '#128c7e' }}
            >
              {t('landingPage.whatsappUs')}
            </Button>
          </ContactCard>
        </Reveal>
        <Reveal delay={100}>
          <ContactCard icon={<PlaceIcon fontSize="large" />} title={t('landingPage.locationLabel')}>
            <Typography color="text.secondary">{address}</Typography>
            <Button
              variant="outlined"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('شارع سفيان عمارة سختيان, Nablus, Palestine')}`}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<PlaceIcon />}
            >
              {t('landingPage.openInMaps')}
            </Button>
          </ContactCard>
        </Reveal>
        <Reveal delay={200}>
          <ContactCard icon={<ScheduleIcon fontSize="large" />} title={t('landingPage.hoursLabel')}>
            <Typography color="text.secondary">{t('landingPage.footerDays')}</Typography>
          </ContactCard>
        </Reveal>
        <Reveal delay={300}>
          <ContactCard icon={<FacebookIcon fontSize="large" />} title={t('landingPage.followUs')}>
            <Typography color="text.secondary">{t('landingPage.followUsHint')}</Typography>
            <Button variant="outlined" href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" startIcon={<FacebookIcon />}>
              {t('landingPage.facebookPage')}
            </Button>
          </ContactCard>
        </Reveal>
      </Box>
    </Section>
  );
};
