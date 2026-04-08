import { zodResolver } from '@hookform/resolvers/zod';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useThemeMode } from '../../hooks/useThemeMode';
import { getErrorMessage } from '../../lib/format';

type FormValues = {
  email: string;
  password: string;
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { mode, toggleMode } = useThemeMode();
  const [error, setError] = useState('');
  const schema = z.object({
    email: z.string().email(t('validation.validEmail')),
    password: z.string().min(6, t('validation.passwordMin'))
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'admin@clinic.local',
      password: 'Admin123!'
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError('');
      await login(values);
      await navigate({ to: '/' });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        background:
          mode === 'dark'
            ? 'linear-gradient(135deg, #0f1c22 0%, #14262e 50%, #0f2127 100%)'
            : 'linear-gradient(135deg, #e8f3f6 0%, #f8fbfc 50%, #dfeff1 100%)'
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 460 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  component="img"
                  src="/doleh-clinic-logo.jpg"
                  alt="Doleh Clinic logo"
                  sx={{
                    width: 72,
                    height: 72,
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: '3px solid',
                    borderColor: 'rgba(31, 111, 139, 0.14)',
                    bgcolor: 'background.paper'
                  }}
                />
                <Typography variant="h4" gutterBottom>
                  {t('loginPage.title')}
                </Typography>
              </Stack>
              <Stack spacing={1}>
                <Button
                  startIcon={mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                  onClick={toggleMode}
                >
                  {mode === 'light' ? t('common.darkMode') : t('common.lightMode')}
                </Button>
                <Button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}>
                  {language === 'en' ? t('common.arabic') : t('common.english')}
                </Button>
              </Stack>
            </Stack>

            <Typography color="text.secondary">
              {t('loginPage.subtitle')}
            </Typography>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('common.email')}
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="password"
                  label={t('common.password')}
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  fullWidth
                />
              )}
            />

            <Button size="large" variant="contained" onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? t('common.signingIn') : t('common.login')}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
