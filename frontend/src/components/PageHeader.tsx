import { Box, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => {
  const { direction } = useLanguage();

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: direction === 'rtl' ? 'flex-end' : 'flex-start', sm: 'center' }}
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box sx={{ textAlign: direction === 'rtl' ? 'right' : 'left', width: '100%' }}>
        <Typography variant="h4">{title}</Typography>
        {subtitle ? <Typography color="text.secondary">{subtitle}</Typography> : null}
      </Box>
      {action ? (
        <Box
          sx={{
            width: { xs: '100%', sm: 'auto' },
            display: 'flex',
            justifyContent: direction === 'rtl' ? { xs: 'flex-end', sm: 'flex-start' } : 'flex-start'
          }}
        >
          {action}
        </Box>
      ) : null}
    </Stack>
  );
};
