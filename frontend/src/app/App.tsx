import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeModeProvider } from '../contexts/ThemeModeContext';
import { useLanguage } from '../hooks/useLanguage';
import { useThemeMode } from '../hooks/useThemeMode';
import { useAuth } from '../hooks/useAuth';
import { createAppRouter } from './router';
import { buildTheme } from './theme';

const queryClient = new QueryClient();

const AppRouter = () => {
  const auth = useAuth();
  const [router] = useState(() =>
    createAppRouter(queryClient, {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading
    })
  );

  router.update({
    context: {
      queryClient,
      auth: {
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading
      }
    }
  });

  useEffect(() => {
    void router.invalidate();
  }, [auth.isAuthenticated, auth.isLoading, router]);

  return <RouterProvider router={router} />;
};

const AppProviders = () => {
  const { direction } = useLanguage();
  const { mode } = useThemeMode();
  const theme = useMemo(() => buildTheme(direction, mode), [direction, mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export const App = () => (
  <LanguageProvider>
    <ThemeModeProvider>
      <AppProviders />
    </ThemeModeProvider>
  </LanguageProvider>
);
