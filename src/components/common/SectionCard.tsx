import React from 'react';
import { Box, Paper, Typography, alpha, useTheme } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface SectionCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
  sx?: SxProps<Theme>;
}

/** Card shell used across the order/dashboard screens so every panel looks the same. */
export const SectionCard: React.FC<SectionCardProps> = ({ title, subtitle, icon, action, children, noPadding, sx }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={[
        {
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: isDark ? '#121216' : '#ffffff',
          border: `1px solid ${isDark ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
          display: 'flex',
          flexDirection: 'column',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {(title || action) && (
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            borderBottom: `1px solid ${isDark ? alpha('#ffffff', 0.06) : alpha('#000000', 0.06)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            {icon && <Box sx={{ display: 'flex', color: 'primary.main' }}>{icon}</Box>}
            <Box sx={{ minWidth: 0 }}>
              {title && (
                <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700, lineHeight: 1.3, color: 'text.primary', fontFamily: 'inherit', fontSize: '1rem', letterSpacing: 0 }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="caption" component="p" sx={{ color: 'text.secondary' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {action}
        </Box>
      )}
      <Box sx={{ p: noPadding ? 0 : 2.5, flexGrow: 1 }}>{children}</Box>
    </Paper>
  );
};
