import { keyframes } from '@emotion/react';
import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useActiveBanners } from '../features/banners/api';
import { useLanguage } from '../hooks/useLanguage';

const scrollFromRight = keyframes`
  from { left: 100%; }
  to { left: -100%; }
`;

const scrollFromLeft = keyframes`
  from { left: -100%; }
  to { left: 100%; }
`;

export const ScrollingBanner = () => {
  const { data } = useActiveBanners();
  const { direction, language } = useLanguage();

  const text = useMemo(() => {
    if (!data?.length) {
      return '';
    }

    return data
      .map((banner) => (language === 'ar' ? banner.messageAr || banner.messageEn : banner.messageEn || banner.messageAr))
      .join('        •        ');
  }, [data, language]);

  if (!text) {
    return null;
  }

  const duration = Math.max(18, text.length * 0.18);

  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        overflow: 'hidden',
        height: 40,
        '&:hover span': { animationPlayState: 'paused' }
      }}
    >
      <Typography
        component="span"
        sx={{
          position: 'absolute',
          top: '50%',
          whiteSpace: 'nowrap',
          fontWeight: 600,
          transform: 'translateY(-50%)',
          animation: `${direction === 'rtl' ? scrollFromLeft : scrollFromRight} ${duration}s linear infinite`
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};
