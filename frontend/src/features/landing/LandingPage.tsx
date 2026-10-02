import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { Box, Card, CardContent, Chip, Fab, Stack, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { ScrollingBanner } from '../../components/ScrollingBanner';
import { useLanguage } from '../../hooks/useLanguage';
import { parseDateValue } from '../../lib/slots';
import { PublicReservationForm } from '../reservations/components/PublicReservationForm';
import { AvailabilitySection } from './components/AvailabilitySection';
import { ContactSection } from './components/ContactSection';
import { FaqSection } from './components/FaqSection';
import { GallerySection } from './components/GallerySection';
import { HeroSection } from './components/HeroSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { LandingFooter } from './components/LandingFooter';
import { LandingNavbar, scrollToSection } from './components/LandingNavbar';
import { Reveal } from './components/Reveal';
import { Section, SectionHeading, ServicesSection } from './components/ServicesSection';

export const LandingPage = () => {
  const { t, language } = useLanguage();
  const [slot, setSlot] = useState<{ date: string; time: string; nonce: number } | null>(null);

  const handleSelectSlot = useCallback((date: string, time: string) => {
    setSlot((current) => ({ date, time, nonce: (current?.nonce ?? 0) + 1 }));
    window.setTimeout(() => scrollToSection('reserve-now'), 150);
  }, []);

  const slotLabel = useMemo(() => {
    if (!slot) {
      return '';
    }

    const date = new Intl.DateTimeFormat(language === 'ar' ? 'ar' : 'en', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(parseDateValue(slot.date));

    return t('landingPage.slotSelected', { date, time: slot.time });
  }, [language, slot, t]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <LandingNavbar />
      <ScrollingBanner />
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <AvailabilitySection selectedSlot={slot} onSelectSlot={handleSelectSlot} />

      <Section id="reserve-now" tinted>
        <SectionHeading title={t('landingPage.reserveTitle')} subtitle={t('landingPage.reserveSubtitle')} />
        <Reveal>
          <Card sx={{ maxWidth: 720, mx: 'auto', borderRadius: 5, boxShadow: '0 16px 48px rgba(31,111,139,0.16)' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack spacing={2.5}>
                {slot ? <Chip color="success" icon={<EventAvailableIcon />} label={slotLabel} sx={{ alignSelf: 'flex-start', fontWeight: 700 }} /> : null}
                <PublicReservationForm presetSlot={slot} />
                <Typography variant="caption" color="text.secondary">
                  {t('landingPage.reserveNote')}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Reveal>
      </Section>

      <GallerySection />
      <FaqSection />
      <ContactSection />
      <LandingFooter />

      <Fab
        variant="extended"
        color="primary"
        onClick={() => scrollToSection('reserve-now')}
        sx={{ display: { xs: 'inline-flex', md: 'none' }, position: 'fixed', bottom: 20, insetInlineEnd: 20, zIndex: 1200 }}
      >
        <EventAvailableIcon sx={{ marginInlineEnd: 1 }} />
        {t('landingPage.navBook')}
      </Fab>
    </Box>
  );
};
