import { Box, CircularProgress } from '@mui/material';

export const LoadingScreen = () => (
  <Box
    sx={{
      minHeight: '40vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <CircularProgress />
  </Box>
);
