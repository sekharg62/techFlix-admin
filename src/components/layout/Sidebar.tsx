import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Divider, 
  IconButton, 
  Box,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  RateReview as RateReviewIcon,
  ViewCarousel as ViewCarouselIcon,
  Category as CategoryIcon,
  Web as WebIcon,
  NotificationsActive as AlertsIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const drawerWidth = 240;

interface SidebarProps {
  open: boolean;
  toggleDrawer: () => void;
  /** Phone/tablet: render as a slide-in drawer controlled by mobileOpen. */
  isMobile?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Products', icon: <InventoryIcon />, path: '/dashboard/products' },
  { text: 'Categories', icon: <CategoryIcon />, path: '/dashboard/categories' },
  { text: 'Orders', icon: <ShoppingCartIcon />, path: '/dashboard/orders' },
  { text: 'Subscription Alerts', icon: <AlertsIcon />, path: '/dashboard/subscription-alerts' },
  { text: 'Customers', icon: <PeopleIcon />, path: '/dashboard/customers' },
  { text: 'Reviews', icon: <RateReviewIcon />, path: '/dashboard/reviews' },
  { text: 'Hero Slides', icon: <ViewCarouselIcon />, path: '/dashboard/hero-slides' },
  { text: 'Home Sections', icon: <WebIcon />, path: '/dashboard/home-sections' },
  { text: 'Payment Methods', icon: <SettingsIcon />, path: '/dashboard/settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ open, toggleDrawer, isMobile = false, mobileOpen = false, onMobileClose }) => {
  const theme = useTheme();
  const location = useLocation();
  const { logout } = useUser();
  // Highlight parent items on nested routes (e.g. /dashboard/orders/TF-000001)
  const isActive = (path: string) =>
    path === '/dashboard' ? location.pathname === path : location.pathname.startsWith(path);

  const content = (
    <>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-end' : 'center',
          px: [1],
        }}
      >
        <IconButton onClick={isMobile ? onMobileClose : toggleDrawer} aria-label={isMobile ? 'Close menu' : 'Toggle sidebar'}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <Box sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  ...(isActive(item.path) && {
                    bgcolor: `${theme.palette.primary.main}1a`,
                    borderRight: `3px solid ${theme.palette.primary.main}`,
                  }),
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: isActive(item.path) ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    color: isActive(item.path) ? 'primary.main' : 'inherit',
                    '& .MuiTypography-root': {
                      fontWeight: isActive(item.path) ? 600 : 400,
                    }
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={logout}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: 'error.main',
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                sx={{ 
                  opacity: open ? 1 : 0,
                  color: 'error.main',
                }} 
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </>
  );

  return (
    isMobile ? (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            backgroundImage: 'none',
          },
        }}
      >
        {content}
      </Drawer>
    ) : (
      <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : theme.spacing(7),
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : theme.spacing(7),
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
          }),
          overflowX: 'hidden',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
        {content}
      </Drawer>
    )
  );
};
