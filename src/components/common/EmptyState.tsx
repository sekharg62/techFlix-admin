import React from 'react';
import { Box, Typography } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action, compact }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 1,
      py: compact ? 3 : 7,
      px: 2,
      color: 'text.secondary',
      height: '100%',
    }}
  >
    <Box sx={{ color: 'primary.main', opacity: 0.45, '& svg': { fontSize: compact ? 36 : 52 } }}>
      {icon || <InboxIcon />}
    </Box>
    <Typography variant={compact ? 'body2' : 'subtitle1'} sx={{ fontWeight: 700, color: 'text.primary' }}>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" sx={{ maxWidth: 360 }}>
        {description}
      </Typography>
    )}
    {action && <Box sx={{ mt: 1 }}>{action}</Box>}
  </Box>
);
