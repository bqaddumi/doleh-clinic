import { createTheme } from '@mui/material/styles';
import { ThemeMode } from '../contexts/ThemeModeContext';

export const buildTheme = (direction: 'ltr' | 'rtl', mode: ThemeMode) =>
  createTheme({
    direction,
    palette: {
      mode,
      primary: {
        main: '#1f6f8b'
      },
      secondary: {
        main: '#4db6ac'
      },
      background: {
        default: mode === 'dark' ? '#0f1c22' : '#f3f7f9',
        paper: mode === 'dark' ? '#16262d' : '#ffffff'
      },
      text: {
        primary: mode === 'dark' ? '#ecf6f8' : '#1b2c33',
        secondary: mode === 'dark' ? '#a8c0c9' : '#607d8b'
      },
      divider: mode === 'dark' ? 'rgba(172, 205, 214, 0.14)' : 'rgba(27, 44, 51, 0.12)'
    },
    shape: {
      borderRadius: 14
    },
    typography: {
      fontFamily:
        direction === 'rtl'
          ? '"Tajawal", "Segoe UI", "Helvetica Neue", sans-serif'
          : '"Segoe UI", "Helvetica Neue", sans-serif',
      h4: {
        fontWeight: 700
      },
      h5: {
        fontWeight: 700
      },
      h6: {
        fontWeight: 700
      }
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            backgroundImage: 'none',
            border: mode === 'dark' ? '1px solid rgba(172, 205, 214, 0.08)' : 'none'
          }
        }
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true
        },
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none'
          }
        }
      }
    }
  });
