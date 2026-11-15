import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  useTheme as useMuiTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useThemeContext } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';

interface HeaderProps {
  open: boolean;
  isMobile?: boolean;
  toggleDrawer: () => void;
}

const drawerWidth = 240;

export const Header: React.FC<HeaderProps> = ({ open, isMobile = false, toggleDrawer }) => {
  const muiTheme = useMuiTheme();
  const { mode, toggleTheme } = useThemeContext();
  const { user } = useUser();

  const handleToggleTheme = () => {
    toggleTheme();
    toast.success(`Switched to ${mode === 'dark' ? 'Light' : 'Dark'} mode`, {
      icon: () => (mode === 'dark' ? '☀️' : '🌙'),
    });
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: muiTheme.zIndex.drawer + 1,
        transition: muiTheme.transitions.create(['width', 'margin'], {
          easing: muiTheme.transitions.easing.sharp,
          duration: muiTheme.transitions.duration.leavingScreen,
        }),
        backgroundColor: muiTheme.palette.background.paper,
        color: muiTheme.palette.text.primary,
        boxShadow: 'none',
        borderBottom: `1px solid ${muiTheme.palette.divider}`,
        ...(open && {
          marginLeft: drawerWidth,
          width: `calc(100% - ${drawerWidth}px)`,
          transition: muiTheme.transitions.create(['width', 'margin'], {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.enteringScreen,
          }),
        }),
      }}
    >
      <Toolbar sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
        <IconButton
          color="inherit"
          aria-label="open menu"
          onClick={toggleDrawer}
          edge="start"
          sx={{ mr: { xs: 1, md: 5 }, ...(open && !isMobile && { display: 'none' }) }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
          TechFlix <span className="text-primary-main">Admin</span>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 } }}>
          <IconButton color="inherit" onClick={handleToggleTheme}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role === 'admin' ? 'Administrator' : 'Manager'}
              </Typography>
            </Box>
            <Avatar alt={user?.name} src={user?.avatar} sx={{ width: { xs: 32, sm: 36 }, height: { xs: 32, sm: 36 } }} />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
