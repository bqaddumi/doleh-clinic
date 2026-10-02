import { Box, Stack, Typography } from '@mui/material';
import { useLanguage } from '../../../hooks/useLanguage';
import { Reveal } from './Reveal';
import { Section, SectionHeading } from './ServicesSection';

const steps = [
  { title: 'landingPage.step1Title', text: 'landingPage.step1Text' },
  { title: 'landingPage.step2Title', text: 'landingPage.step2Text' },
  { title: 'landingPage.step3Title', text: 'landingPage.step3Text' }
] as const;

export const HowItWorksSection = () => {
  const { t, language } = useLanguage();
  const numberFormat = new Intl.NumberFormat(language === 'ar' ? 'ar' : 'en');

  return (
    <Section id="how-it-works" tinted>
      <SectionHeading title={t('landingPage.howTitle')} subtitle={t('landingPage.howSubtitle')} />
      <Box sx={{ display: 'grid', gap: { xs: 4, md: 6 }, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, alignItems: 'center' }}>
        <Reveal>
          <Box
            sx={{
              position: 'relative',
              minHeight: { xs: 240, md: 420 },
              height: '100%',
              borderRadius: 5,
              overflow: 'hidden',
              backgroundImage: `url('/login-background.webp')`,
              backgroundSize: 'cover',
              backgroundPosition: '30% 70%',
              boxShadow: '0 20px 50px rgba(31,111,139,0.25)'
            }}
          >
            <Box
              component="img"
              src="/logo-emblem.png"
              alt=""
              sx={{
                position: 'absolute',
                insetInlineEnd: 20,
                bottom: 20,
                width: 84,
                height: 84,
                borderRadius: '50%',
                bgcolor: '#fff',
                p: 0.5,
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}
            />
          </Box>
        </Reveal>

        <Stack spacing={3}>
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 120}>
              <Stack
                direction="row"
                spacing={2.5}
                alignItems="center"
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'transform 250ms ease',
                  '&:hover': { transform: 'translateX(6px)' },
                  '[dir="rtl"] &:hover': { transform: 'translateX(-6px)' }
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '50%',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    background: 'linear-gradient(135deg, #1f6f8b, #4db6ac)'
                  }}
                >
                  {numberFormat.format(index + 1)}
                </Box>
                <Box>
                  <Typography variant="h6">{t(step.title)}</Typography>
                  <Typography color="text.secondary">{t(step.text)}</Typography>
                </Box>
              </Stack>
            </Reveal>
          ))}
        </Stack>
      </Box>
    </Section>
  );
};
