import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Dialog, IconButton } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import { Reveal } from './Reveal';
import { Section, SectionHeading } from './ServicesSection';

const posters = [
  'restore-movement',
  'proper-assessment',
  'myth-vs-fact',
  'neck-pain-warning',
  'band-exercises',
  'assessment-room',
  'dont-ignore-signs',
  'pain-is-treatable',
  'shoulder-assessment',
  'small-steps',
  'start-today',
  'health-tip-water'
].map((name) => `/gallery/${name}.jpg`);

const AUTO_ADVANCE_MS = 4500;

export const GallerySection = () => {
  const { t, direction } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sign = direction === 'rtl' ? -1 : 1;

  const scrollByCard = useCallback(
    (step: 1 | -1) => {
      const track = trackRef.current;

      if (!track) {
        return;
      }

      const card = track.firstElementChild as HTMLElement | null;
      const distance = (card?.offsetWidth ?? 300) + 20;
      const atEnd = Math.abs(track.scrollLeft) + track.clientWidth >= track.scrollWidth - 8;
      const atStart = Math.abs(track.scrollLeft) <= 8;

      if (step === 1 && atEnd) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (step === -1 && atStart) {
        track.scrollTo({ left: sign * track.scrollWidth, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: sign * step * distance, behavior: 'smooth' });
      }
    },
    [sign]
  );

  useEffect(() => {
    if (paused || openIndex !== null) {
      return;
    }

    const timer = window.setInterval(() => scrollByCard(1), AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [openIndex, paused, scrollByCard]);

  const showNeighbor = (step: 1 | -1) =>
    setOpenIndex((current) => (current === null ? null : (current + step + posters.length) % posters.length));

  const arrowSx = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    bgcolor: 'background.paper',
    boxShadow: 3,
    '&:hover': { bgcolor: 'background.paper' },
    display: { xs: 'none', sm: 'inline-flex' }
  } as const;

  return (
    <Section id="gallery" tinted>
      <SectionHeading title={t('landingPage.galleryTitle')} subtitle={t('landingPage.gallerySubtitle')} />
      <Reveal>
        <Box
          sx={{ position: 'relative' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => window.setTimeout(() => setPaused(false), AUTO_ADVANCE_MS)}
        >
          <IconButton
            aria-label={t('landingPage.galleryPrevious')}
            onClick={() => scrollByCard(-1)}
            sx={{ ...arrowSx, insetInlineStart: -12 }}
          >
            {direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
          <IconButton
            aria-label={t('landingPage.galleryNext')}
            onClick={() => scrollByCard(1)}
            sx={{ ...arrowSx, insetInlineEnd: -12 }}
          >
            {direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>

          <Box
            ref={trackRef}
            sx={{
              display: 'flex',
              gap: '20px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              py: 1.5
            }}
          >
            {posters.map((src, index) => (
              <Box
                key={src}
                component="button"
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={t('landingPage.galleryPoster', { number: index + 1 })}
                sx={{
                  flexShrink: 0,
                  height: { xs: 340, md: 420 },
                  p: 0,
                  border: 0,
                  borderRadius: 4,
                  overflow: 'hidden',
                  cursor: 'zoom-in',
                  scrollSnapAlign: 'start',
                  bgcolor: 'background.paper',
                  boxShadow: '0 8px 24px rgba(31,111,139,0.18)',
                  transition: 'transform 250ms ease, box-shadow 250ms ease',
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 36px rgba(31,111,139,0.3)' }
                }}
              >
                <Box
                  component="img"
                  src={src}
                  alt={t('landingPage.galleryPoster', { number: index + 1 })}
                  loading="lazy"
                  sx={{ height: '100%', width: 'auto', display: 'block' }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Reveal>

      <Dialog
        open={openIndex !== null}
        onClose={() => setOpenIndex(null)}
        maxWidth="md"
        slotProps={{ paper: { sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'visible', m: 1 } } }}
      >
        {openIndex !== null ? (
          <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
            <Box
              component="img"
              src={posters[openIndex]}
              alt={t('landingPage.galleryPoster', { number: openIndex + 1 })}
              sx={{ maxWidth: '100%', maxHeight: '88vh', borderRadius: 3, display: 'block' }}
            />
            <IconButton
              aria-label={t('landingPage.galleryClose')}
              onClick={() => setOpenIndex(null)}
              sx={{ position: 'absolute', top: 8, insetInlineEnd: 8, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}
            >
              <CloseIcon />
            </IconButton>
            <IconButton
              aria-label={t('landingPage.galleryPrevious')}
              onClick={() => showNeighbor(-1)}
              sx={{ position: 'absolute', top: 'calc(50% - 20px)', insetInlineStart: 8, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}
            >
              {direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
            <IconButton
              aria-label={t('landingPage.galleryNext')}
              onClick={() => showNeighbor(1)}
              sx={{ position: 'absolute', top: 'calc(50% - 20px)', insetInlineEnd: 8, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}
            >
              {direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Box>
        ) : null}
      </Dialog>
    </Section>
  );
};
