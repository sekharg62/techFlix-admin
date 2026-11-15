import React, { useEffect, useMemo, useState } from 'react';
import { Box, Skeleton, ToggleButton, ToggleButtonGroup, Typography, alpha, useTheme } from '@mui/material';
import { ShowChart as ChartIcon } from '@mui/icons-material';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import type { AnalyticsSeriesPoint } from '../../types/order';
import { SectionCard } from '../common/SectionCard';
import { EmptyState } from '../common/EmptyState';
import { formatBDT, formatCompactBDT } from '../../utils/orderFormat';

dayjs.extend(isoWeek);

type Granularity = 'day' | 'week' | 'month';

interface ChartPoint {
  key: string;
  label: string;
  tooltipLabel: string;
  orders: number;
  paidOrders: number;
  revenue: number;
}

const bucket = (series: AnalyticsSeriesPoint[], granularity: Granularity): ChartPoint[] => {
  const map = new Map<string, ChartPoint>();
  series.forEach((p) => {
    const d = dayjs(p.date);
    let key = p.date;
    let label = d.format('DD MMM');
    let tooltipLabel = d.format('ddd, DD MMM YYYY');
    if (granularity === 'week') {
      const start = d.startOf('isoWeek');
      key = start.format('YYYY-MM-DD');
      label = start.format('DD MMM');
      tooltipLabel = `Week of ${start.format('DD MMM YYYY')}`;
    } else if (granularity === 'month') {
      key = d.format('YYYY-MM');
      label = d.format('MMM YY');
      tooltipLabel = d.format('MMMM YYYY');
    }
    const existing = map.get(key) || { key, label, tooltipLabel, orders: 0, paidOrders: 0, revenue: 0 };
    existing.orders += p.orders;
    existing.paidOrders += p.paidOrders;
    existing.revenue += p.revenue;
    map.set(key, existing);
  });
  return [...map.values()];
};

const defaultGranularity = (days: number): Granularity => (days > 120 ? 'month' : days > 45 ? 'week' : 'day');

interface OrdersTrendChartProps {
  series: AnalyticsSeriesPoint[];
  loading?: boolean;
}

export const OrdersTrendChart: React.FC<OrdersTrendChartProps> = ({ series, loading }) => {
  const theme = useTheme();
  const [granularity, setGranularity] = useState<Granularity>(defaultGranularity(series.length));

  useEffect(() => {
    setGranularity(defaultGranularity(series.length));
  }, [series.length]);

  const data = useMemo(() => bucket(series, granularity), [series, granularity]);
  const hasData = data.some((d) => d.orders > 0);

  const axisColor = theme.palette.text.secondary;
  const gridColor = alpha(theme.palette.text.primary, 0.08);
  const barColor = theme.palette.mode === 'dark' ? '#5b8def' : '#3b6fd8';
  const lineColor = theme.palette.primary.main;

  return (
    <SectionCard
      title="Orders & revenue"
      subtitle="Bars show orders placed, the line shows verified revenue"
      icon={<ChartIcon fontSize="small" />}
      action={
        <ToggleButtonGroup
          size="small"
          exclusive
          value={granularity}
          onChange={(_, v: Granularity | null) => v && setGranularity(v)}
          aria-label="Chart granularity"
        >
          <ToggleButton value="day" disabled={series.length > 120} sx={{ px: 1.5, textTransform: 'none' }}>
            Daily
          </ToggleButton>
          <ToggleButton value="week" sx={{ px: 1.5, textTransform: 'none' }}>
            Weekly
          </ToggleButton>
          <ToggleButton value="month" sx={{ px: 1.5, textTransform: 'none' }}>
            Monthly
          </ToggleButton>
        </ToggleButtonGroup>
      }
    >
      <Box sx={{ height: 340 }}>
        {loading ? (
          <Skeleton variant="rounded" height="100%" sx={{ borderRadius: '12px' }} />
        ) : !hasData ? (
          <EmptyState
            icon={<ChartIcon />}
            title="No orders in this period"
            description="Pick a wider date range to see trends."
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: axisColor, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                minTickGap={20}
              />
              <YAxis
                yAxisId="orders"
                allowDecimals={false}
                tick={{ fill: axisColor, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <YAxis
                yAxisId="revenue"
                orientation="right"
                tick={{ fill: axisColor, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatCompactBDT(v)}
                width={56}
              />
              <Tooltip
                cursor={{ fill: alpha(theme.palette.text.primary, 0.05) }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0].payload as ChartPoint;
                  return (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '10px',
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        boxShadow: 3,
                        minWidth: 180,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {point.tooltipLabel}
                      </Typography>
                      <TooltipRow color={barColor} label="Orders" value={String(point.orders)} />
                      <TooltipRow color={alpha(barColor, 0.5)} label="Paid orders" value={String(point.paidOrders)} />
                      <TooltipRow color={lineColor} label="Revenue" value={formatBDT(point.revenue)} />
                    </Box>
                  );
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={32}
                iconType="circle"
                wrapperStyle={{ fontSize: 12, color: axisColor }}
              />
              <Bar yAxisId="orders" dataKey="orders" name="Orders" fill={barColor} radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke={lineColor}
                strokeWidth={2.5}
                dot={data.length <= 31 ? { r: 3, fill: lineColor } : false}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Box>
    </SectionCard>
  );
};

const TooltipRow: React.FC<{ color: string; label: string; value: string }> = ({ color, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75 }}>
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
    <Typography variant="body2" sx={{ flexGrow: 1 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 700 }}>
      {value}
    </Typography>
  </Box>
);
