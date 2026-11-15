import React, { useEffect, useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  // Phones and small tablets: sidebar becomes a slide-in drawer instead of a fixed column.
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const [open, setOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebarOpen');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the page changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleDrawer = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
      return;
    }
    setOpen((prev: boolean) => {
      const newState = !prev;
      try {
        localStorage.setItem('sidebarOpen', JSON.stringify(newState));
      } catch {
        // storage unavailable — keep the in-memory state
      }
      return newState;
    });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header open={isMobile ? false : open} isMobile={isMobile} toggleDrawer={toggleDrawer} />
      <Sidebar
        open={isMobile ? true : open}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        toggleDrawer={toggleDrawer}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          width: '100%',
          minWidth: 0,
          overflowX: 'hidden',
        }}
      >
        {/* Toolbar spacing for the fixed Header */}
        <Toolbar />

        {/* Router content will render here */}
        <Outlet />
      </Box>
    </Box>
  );
};
