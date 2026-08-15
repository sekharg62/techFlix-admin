import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const DashboardLayout: React.FC = () => {
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleDrawer = () => {
    setOpen((prev: boolean) => {
      const newState = !prev;
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header open={open} toggleDrawer={toggleDrawer} />
      <Sidebar open={open} toggleDrawer={toggleDrawer} />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: '100%',
          overflowX: 'hidden'
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
