import CloseIcon from '@mui/icons-material/Close';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LoginIcon from '@mui/icons-material/Login';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import { Link as RouterLink } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useLanguage } from '../../../hooks/useLanguage';
import { useThemeMode } from '../../../hooks/useThemeMode';

export const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export const LandingNavbar = () => {
  const { t, language, setLanguage, direction } = useLanguage();
  const { mode, toggleMode } = useThemeMode();
  const { isAuthenticated, user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const links = [
    { id: 'home', label: t('landingPage.navHome') },
    { id: 'services', label: t('landingPage.navServices') },
    { id: 'how-it-works', label: t('landingPage.navHowItWorks') },
    { id: 'availability', label: t('landingPage.navAvailability') },
    { id: 'gallery', label: t('landingPage.navGallery') },
    { id: 'faq', label: t('landingPage.navFaq') },
    { id: 'contact', label: t('landingPage.navContact') }
  ];

  const accountTarget = user?.role === 'patient' ? '/reservations' : '/dashboard';
  const nextLanguage = language === 'en' ? 'ar' : 'en';

  const goTo = (id: string) => {
    setDrawerOpen(false);
    scrollToSection(id);
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(22,38,45,0.85)' : 'rgba(255,255,255,0.88)'),
          backdropFilter: 'blur(12px)'
        }}
      >
        <Toolbar dir="ltr" sx={{ gap: 1, minHeight: { xs: 64, md: 72 }, maxWidth: 1536, width: '100%', mx: 'auto' }}>
          <IconButton
            aria-label={t('landingPage.openMenu')}
            sx={{ display: { lg: 'none' } }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <Box
            component="button"
            type="button"
            onClick={() => goTo('home')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              border: 0,
              background: 'none',
              cursor: 'pointer',
              color: 'inherit',
              p: 0,
              minWidth: 0
            }}
          >
            <Box
              component="img"
              src="/logo-emblem.png"
              alt="Doleh Clinic logo"
              sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}
            />
            <Typography variant="h6" noWrap sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 800 }}>
              {t('common.appName')}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', lg: 'flex' }, mx: 'auto' }}>
            {links.map((link) => (
              <Button key={link.id} color="inherit" onClick={() => goTo(link.id)}>
                {link.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ flexGrow: { xs: 1, lg: 0 } }} />

          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title={language === 'en' ? t('common.arabic') : t('common.english')}>
              <Button
                color="inherit"
                startIcon={<LanguageIcon />}
                onClick={() => setLanguage(nextLanguage)}
                sx={{ minWidth: 0 }}
              >
                {language === 'en' ? 'عربي' : 'EN'}
              </Button>
            </Tooltip>
            <Tooltip title={mode === 'light' ? t('common.darkMode') : t('common.lightMode')}>
              <IconButton
                aria-label={mode === 'light' ? t('common.darkMode') : t('common.lightMode')}
                onClick={toggleMode}
                color="inherit"
              >
                {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
              </IconButton>
            </Tooltip>
            <Button
              component={RouterLink}
              to={isAuthenticated ? accountTarget : '/login'}
              variant="outlined"
              startIcon={<LoginIcon />}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              {isAuthenticated ? t('landingPage.dashboardLink') : t('common.login')}
            </Button>
            <Button variant="contained" onClick={() => goTo('reserve-now')} sx={{ display: { xs: 'none', lg: 'inline-flex' } }}>
              {t('landingPage.navBook')}
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} anchor="left">
        <Box dir="ltr" sx={{ width: 280 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Box component="img" src="/logo-emblem.png" alt="" sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#fff' }} />
              <Typography variant="h6">{t('common.appName')}</Typography>
            </Stack>
            <IconButton aria-label={t('landingPage.closeMenu')} onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider />
          <List dir={direction}>
            {links.map((link) => (
              <ListItemButton key={link.id} onClick={() => goTo(link.id)}>
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <Stack spacing={1.5} sx={{ p: 2 }}>
            <Button variant="contained" size="large" onClick={() => goTo('reserve-now')}>
              {t('landingPage.navBook')}
            </Button>
            <Button
              component={RouterLink}
              to={isAuthenticated ? accountTarget : '/login'}
              variant="outlined"
              size="large"
              startIcon={<LoginIcon />}
            >
              {isAuthenticated ? t('landingPage.dashboardLink') : t('common.login')}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};
