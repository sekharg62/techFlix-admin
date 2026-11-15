import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import {
  Payments as RevenueIcon,
  ShoppingCart as OrdersIcon,
  Verified as PaidIcon,
  Calculate as AovIcon,
  PersonAdd as CustomersIcon,
  Refresh as RefreshIcon,
  HourglassTop as PendingIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { dashboardService } from '../services/orderService';
import { getErrorMessage } from '../services/apiClient';
import type { DashboardAnalytics, RecentOrder } from '../types/order';
import { PageHeader } from '../components/common/PageHeader';
import { DateRangeFilter } from '../components/common/DateRangeFilter';
import { presetRange } from '../utils/dateRange';
import type { DateRange } from '../utils/dateRange';
import { KpiCard } from '../components/dashboard/KpiCard';
import { OrdersTrendChart } from '../components/dashboard/OrdersTrendChart';
import {
  PaymentMethodsCard,
  RecentOrdersCard,
  StatusBreakdownCard,
  TopProductsCard,
} from '../components/dashboard/BreakdownCards';
import { formatBDT } from '../utils/orderFormat';

const STORAGE_KEY = 'techflix_dashboard_range';

const loadRange = (): DateRange => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as DateRange | null;
    if (saved?.preset && saved.preset !== 'custom' && saved.preset !== 'all') return presetRange(saved.preset);
    if (saved?.preset === 'custom' && saved.from && saved.to) return saved;
  } catch {
    // ignore
  }
  return presetRange('30d');
};

export const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState<DateRange>(loadRange);
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [recent, setRecent] = useState<RecentOrder[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [analytics, recentOrders] = await Promise.all([
        dashboardService.analytics(range.from, range.to),
        dashboardService.recentOrders(),
      ]);
      setData(analytics);
      setRecent(recentOrders);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to]);

  useEffect(() => {
    load();
  }, [load]);

  const changeRange = (r: DateRange) => {
    setRange(r);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
    } catch {
      // ignore
    }
  };

  const s = data?.summary;
  const t = data?.trends;
  const days = data?.range.days ?? 0;
  const prevCaption = data
    ? `Compared with ${dayjs(data.range.previous.from).format('DD MMM')} – ${dayjs(data.range.previous.to).format('DD MMM YYYY')}`
    : '';
  const dateQuery =
    range.preset === 'custom' ? `range=custom&from=${range.from}&to=${range.to}` : `range=${range.preset}`;
  const initialLoading = loading && !data;

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle={
          data
            ? `${dayjs(data.range.from).format('DD MMM YYYY')} – ${dayjs(data.range.to).format('DD MMM YYYY')} · ${days} day${days === 1 ? '' : 's'}`
            : 'Store performance overview'
        }
        actions={
          <>
            <DateRangeFilter value={range} onChange={changeRange} />
            <Tooltip title="Refresh">
              <IconButton onClick={load} sx={{ border: 1, borderColor: 'divider' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </>
        }
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: '12px' }}
          action={
            <Button color="inherit" onClick={load}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {data && data.pendingPaymentVerifications > 0 && (
        <Alert
          severity="warning"
          icon={<PendingIcon />}
          sx={{ mb: 3, borderRadius: '12px', alignItems: 'center' }}
          action={
            <Button
              color="inherit"
              variant="outlined"
              size="small"
              onClick={() => navigate('/dashboard/orders?paymentStatus=PENDING_VERIFICATION')}
            >
              Review now
            </Button>
          }
        >
          <Typography variant="body2" component="span" sx={{ fontWeight: 700 }}>
            {data.pendingPaymentVerifications} payment{data.pendingPaymentVerifications === 1 ? '' : 's'} waiting for
            verification.
          </Typography>{' '}
          Customers are waiting for their keys.
        </Alert>
      )}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <KpiCard
            title="Revenue"
            value={formatBDT(s?.revenue)}
            icon={<RevenueIcon />}
            trend={t?.revenue}
            caption={prevCaption}
            loading={initialLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <KpiCard
            title="Total orders"
            value={String(s?.totalOrders ?? 0)}
            icon={<OrdersIcon />}
            trend={t?.totalOrders}
            caption={prevCaption}
            loading={initialLoading}
            accent="#5b8def"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <KpiCard
            title="Paid orders"
            value={String(s?.paidOrders ?? 0)}
            icon={<PaidIcon />}
            trend={t?.paidOrders}
            caption={prevCaption}
            loading={initialLoading}
            accent="#2e7d32"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <KpiCard
            title="Avg. order value"
            value={formatBDT(s?.averageOrderValue)}
            icon={<AovIcon />}
            trend={t?.averageOrderValue}
            caption={prevCaption}
            loading={initialLoading}
            accent="#f6921e"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, lg: 2.4 }}>
          <KpiCard
            title="New customers"
            value={String(s?.newCustomers ?? 0)}
            icon={<CustomersIcon />}
            loading={initialLoading}
            accent="#8c3494"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <OrdersTrendChart series={data?.series || []} loading={initialLoading} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StatusBreakdownCard counts={data?.ordersByStatus} loading={initialLoading} dateQuery={dateQuery} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <TopProductsCard products={data?.topProducts} loading={initialLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <PaymentMethodsCard methods={data?.paymentMethods} loading={initialLoading} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <RecentOrdersCard orders={recent} loading={loading && !recent} />
        </Grid>
      </Grid>
    </Box>
  );
};
