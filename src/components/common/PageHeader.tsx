import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  before?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, before }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      alignItems: { xs: 'flex-start', md: 'center' },
      justifyContent: 'space-between',
      gap: 2,
      mb: 3,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
      {before}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary', fontFamily: 'inherit' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" component="div" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {actions && <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>{actions}</Box>}
  </Box>
);
