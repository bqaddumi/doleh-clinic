import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { useLanguage } from '../../../hooks/useLanguage';
import { Reveal } from './Reveal';
import { Section, SectionHeading } from './ServicesSection';

const faqs = [1, 2, 3, 4, 5] as const;

export const FaqSection = () => {
  const { t } = useLanguage();

  return (
    <Section id="faq" tinted>
      <SectionHeading title={t('landingPage.faqTitle')} subtitle={t('landingPage.faqSubtitle')} />
      <Box sx={{ maxWidth: 820, mx: 'auto' }}>
        {faqs.map((number) => (
          <Reveal key={number} delay={number * 60}>
            <Accordion
              disableGutters
              elevation={0}
              defaultExpanded={number === 1}
              sx={{
                mb: 1.5,
                borderRadius: '16px !important',
                border: '1px solid',
                borderColor: 'divider',
                '&::before': { display: 'none' },
                overflow: 'hidden'
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 0.5 }}>
                <Typography fontWeight={700}>{t(`landingPage.faq${number}Q` as 'landingPage.faq1Q')}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 2.5 }}>
                <Typography color="text.secondary">{t(`landingPage.faq${number}A` as 'landingPage.faq1A')}</Typography>
              </AccordionDetails>
            </Accordion>
          </Reveal>
        ))}
      </Box>
    </Section>
  );
};
