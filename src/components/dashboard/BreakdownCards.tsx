import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  LinearProgress,
  List,
  ListItemButton,
  Skeleton,
  Typography,
  Button,
  alpha,
  useTheme,
} from '@mui/material';
import {
  DonutLarge as DonutIcon,
  AccountBalanceWallet as WalletIcon,
  EmojiEvents as TrophyIcon,
  ReceiptLong as RecentIcon,
} from '@mui/icons-material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { DashboardAnalytics, OrderStatus, RecentOrder } from '../../types/order';
import { SectionCard } from '../common/SectionCard';
import { EmptyState } from '../common/EmptyState';
import { OrderStatusChip } from '../orders/StatusChips';
import { ORDER_STATUS_META, PAYMENT_METHOD_META, formatBDT, fromNow } from '../../utils/orderFormat';

// ── Orders by status (donut) ─────────────────────────────

export const StatusBreakdownCard: React.FC<{
  counts?: DashboardAnalytics['ordersByStatus'];
  loading?: boolean;
  dateQuery: string;
}> = ({ counts, loading, dateQuery }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const colors: Record<OrderStatus, string> = {
    PENDING: theme.palette.warning.main,
    PROCESSING: theme.palette.info.main,
    DELIVERED: theme.palette.success.main,
    CANCELLED: theme.palette.grey[500],
    REFUNDED: theme.palette.secondary.main,
  };
  const data = counts
    ? (Object.keys(counts) as OrderStatus[]).map((s) => ({ status: s, name: ORDER_STATUS_META[s].label, value: counts[s] }))
    : [];
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <SectionCard title="Orders by status" icon={<DonutIcon fontSize="small" />} sx={{ height: '100%' }}>
      {loading ? (
        <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto' }} />
      ) : total === 0 ? (
        <EmptyState compact title="No orders in this period" />
      ) : (
        <>
          <Box sx={{ height: 180, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.filter((d) => d.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data
                    .filter((d) => d.value > 0)
                    .map((d) => (
                      <Cell key={d.status} fill={colors[d.status]} />
                    ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 10,
                  }}
                  itemStyle={{ color: theme.palette.text.primary }}
                />
              </PieChart>
            </ResponsiveContainer>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {total}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                orders
              </Typography>
            </Box>
          </Box>
          <List dense disablePadding sx={{ mt: 1.5 }}>
            {data.map((d) => (
              <ListItemButton
                key={d.status}
                onClick={() => navigate(`/dashboard/orders?status=${d.status}&${dateQuery}`)}
                sx={{ borderRadius: '8px', px: 1 }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: colors[d.status], mr: 1.5 }} />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {d.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, mr: 1 }}>
                  {d.value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', width: 40, textAlign: 'right' }}>
                  {total ? Math.round((d.value / total) * 100) : 0}%
                </Typography>
              </ListItemButton>
            ))}
          </List>
        </>
      )}
    </SectionCard>
  );
};

// ── Revenue by payment method ────────────────────────────

export const PaymentMethodsCard: React.FC<{ methods?: DashboardAnalytics['paymentMethods']; loading?: boolean }> = ({
  methods,
  loading,
}) => {
  const total = (methods || []).reduce((sum, m) => sum + m.amount, 0);
  const all = (Object.keys(PAYMENT_METHOD_META) as (keyof typeof PAYMENT_METHOD_META)[]).map(
    (method) => methods?.find((m) => m.method === method) || { method, count: 0, amount: 0 }
  );

  return (
    <SectionCard title="Revenue by method" subtitle="Verified payments" icon={<WalletIcon fontSize="small" />} sx={{ height: '100%' }}>
      {loading ? (
        [0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={44} sx={{ mb: 1.5, borderRadius: '10px' }} />)
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
          {all.map((m) => {
            const meta = PAYMENT_METHOD_META[m.method];
            const pct = total ? (m.amount / total) * 100 : 0;
            return (
              <Box key={m.method}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: meta.color }}>
                    {meta.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatBDT(m.amount)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(meta.color, 0.12),
                    '& .MuiLinearProgress-bar': { bgcolor: meta.color, borderRadius: 4 },
                  }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {m.count} payment{m.count === 1 ? '' : 's'} · {Math.round(pct)}%
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </SectionCard>
  );
};

// ── Top products ─────────────────────────────────────────

export const TopProductsCard: React.FC<{ products?: DashboardAnalytics['topProducts']; loading?: boolean }> = ({
  products,
  loading,
}) => {
  const theme = useTheme();
  const max = Math.max(1, ...(products || []).map((p) => p.revenue));

  return (
    <SectionCard title="Top products" subtitle="By verified revenue" icon={<TrophyIcon fontSize="small" />} sx={{ height: '100%' }}>
      {loading ? (
        [0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={40} sx={{ mb: 1.5, borderRadius: '10px' }} />)
      ) : !products?.length ? (
        <EmptyState compact title="No sales yet" description="Verified orders will rank products here." />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {products.map((p, index) => (
            <Box key={`${p.productId}-${p.productName}`} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: 13,
                  flexShrink: 0,
                  color: index === 0 ? '#000' : 'text.primary',
                  bgcolor: index === 0 ? '#f5c518' : 'action.selected',
                }}
              >
                {index + 1}
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {p.productName}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>
                    {formatBDT(p.revenue)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(p.revenue / max) * 100}
                    sx={{
                      flexGrow: 1,
                      height: 5,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': { borderRadius: 3 },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                    {p.quantity} sold
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </SectionCard>
  );
};

// ── Recent orders ────────────────────────────────────────

export const RecentOrdersCard: React.FC<{ orders?: RecentOrder[]; loading?: boolean }> = ({ orders, loading }) => {
  const navigate = useNavigate();
  return (
    <SectionCard
      title="Recent orders"
      icon={<RecentIcon fontSize="small" />}
      noPadding
      sx={{ height: '100%' }}
      action={
        <Button size="small" onClick={() => navigate('/dashboard/orders')}>
          View all
        </Button>
      }
    >
      {loading ? (
        <Box sx={{ p: 2 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={44} sx={{ mb: 1, borderRadius: '10px' }} />
          ))}
        </Box>
      ) : !orders?.length ? (
        <EmptyState compact title="No orders yet" />
      ) : (
        <List disablePadding>
          {orders.map((o) => (
            <ListItemButton
              key={o.id}
              onClick={() => navigate(`/dashboard/orders/${o.orderNumber}`)}
              sx={{ px: 2.5, py: 1.25, gap: 2, borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                  {o.customerName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                  {o.orderNumber} · {fromNow(o.createdAt)}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatBDT(o.total)}
              </Typography>
              <OrderStatusChip status={o.status} />
            </ListItemButton>
          ))}
        </List>
      )}
    </SectionCard>
  );
};
