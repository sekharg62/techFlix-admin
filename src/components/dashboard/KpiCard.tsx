import React from 'react';
import { Box, Paper, Skeleton, Tooltip, Typography, alpha, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: number | null; // % change vs previous period; null = no previous data
  caption?: string;
  loading?: boolean;
  accent?: string;
  invertTrend?: boolean; // e.g. cancellations: up is bad
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, trend, caption, loading, accent, invertTrend }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const color = accent || theme.palette.primary.main;

  let trendColor: string = theme.palette.text.secondary;
  let TrendIcon = TrendingFlat;
  if (typeof trend === 'number' && trend !== 0) {
    const good = invertTrend ? trend < 0 : trend > 0;
    trendColor = good ? theme.palette.success.main : theme.palette.error.main;
    TrendIcon = trend > 0 ? TrendingUp : TrendingDown;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: '16px',
        backgroundColor: isDark ? '#121216' : '#ffffff',
        border: `1px solid ${isDark ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: alpha(color, 0.08),
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, position: 'relative' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {title}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            p: 1,
            borderRadius: '10px',
            color,
            backgroundColor: alpha(color, 0.14),
            '& svg': { fontSize: 20 },
          }}
        >
          {icon}
        </Box>
      </Box>
      {loading ? (
        <>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="40%" />
        </>
      ) : (
        <>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.75, position: 'relative' }}>
            {value}
          </Typography>
          {trend !== undefined && (
            <Tooltip title={caption || ''}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: trendColor }}>
                <TrendIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {trend === null ? 'New' : `${trend > 0 ? '+' : ''}${trend}%`}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  vs previous period
                </Typography>
              </Box>
            </Tooltip>
          )}
        </>
      )}
    </Paper>
  );
};
