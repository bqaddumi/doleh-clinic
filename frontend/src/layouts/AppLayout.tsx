import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useState } from 'react';
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useThemeMode } from '../hooks/useThemeMode';

export const AppLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { language, setLanguage, t } = useLanguage();
  const { mode, toggleMode } = useThemeMode();
  const navigationItems = [
    { label: t('common.dashboard'), to: '/' },
    { label: t('common.patients'), to: '/patients' },
    { label: t('common.reports'), to: '/reports' }
  ] as const;

  const navContent = (
    <List sx={{ minWidth: 220 }}>
      {navigationItems.map((item) => (
        <ListItemButton
          key={item.to}
          selected={pathname === item.to || pathname.startsWith(`${item.to}/`)}
          onClick={async () => {
            setDrawerOpen(false);
            await navigate({ to: item.to });
          }}
        >
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2 }}>
          <IconButton sx={{ display: { md: 'none' } }} onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1, minWidth: 0 }}>
            <Box
              component="img"
              src="/doleh-clinic-logo.jpg"
              alt="Doleh Clinic logo"
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper'
              }}
            />
            <Typography variant="h6" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t('common.appName')}
            </Typography>
          </Box>
          <Typography color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.fullName}
          </Typography>
          <Button color="inherit" startIcon={mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />} onClick={toggleMode}>
            {mode === 'light' ? t('common.darkMode') : t('common.lightMode')}
          </Button>
          <Button
            color="inherit"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          >
            {language === 'en' ? t('common.arabic') : t('common.english')}
          </Button>
          <Button
            color="inherit"
            onClick={async () => {
              logout();
              await navigate({ to: '/login' });
            }}
          >
            {t('common.logout')}
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{ display: { md: 'none' } }}>
        {navContent}
      </Drawer>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '240px 1fr' }, gap: 3 }}>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>{navContent}</Box>
          <Outlet />
        </Box>
      </Container>
    </Box>
  );
};
