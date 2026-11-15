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
  toggleDrawer: () => void;
}

const drawerWidth = 240;

export const Header: React.FC<HeaderProps> = ({ open, toggleDrawer }) => {
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
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={toggleDrawer}
          edge="start"
          sx={{ marginRight: 5, ...(open && { display: 'none' }) }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
          TechFlix <span className="text-primary-main">Admin</span>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            <Avatar alt={user?.name} src={user?.avatar} sx={{ width: 36, height: 36 }} />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
