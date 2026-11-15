import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  NotificationsActive as AlertsIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { subscriptionAlertService } from '../services/orderService';
import { getErrorMessage } from '../services/apiClient';
import type { AlertBucket, AlertSummary, Pagination, SubscriptionAlert } from '../types/order';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { EmptyState } from '../components/common/EmptyState';
import { dataGridSx } from '../components/common/dataGridSx';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { formatDate, itemPlanLabel } from '../utils/orderFormat';

type Tone = 'error' | 'warning' | 'info' | 'success' | 'default';

const BUCKETS: { key: AlertBucket; label: string; hint: string; tone: Tone }[] = [
  { key: '1', label: '1 day left', hint: 'Ends within 24 hours', tone: 'error' },
  { key: '3', label: '≤ 3 days', hint: 'Ends within 3 days', tone: 'error' },
  { key: '5', label: '≤ 5 days', hint: 'Ends within 5 days', tone: 'warning' },
  { key: '7', label: '≤ 7 days', hint: 'Ends this week', tone: 'warning' },
  { key: '15', label: '≤ 15 days', hint: 'Ends within 15 days', tone: 'info' },
  { key: '30', label: '≤ 30 days', hint: 'Ends this month', tone: 'info' },
  { key: 'expired', label: 'Expired', hint: 'Ended in the last 30 days', tone: 'default' },
];

const isBucket = (v: string | null): v is AlertBucket => BUCKETS.some((b) => b.key === v);

const toneFor = (daysLeft: number | null): Tone => {
  if (daysLeft === null) return 'default';
  if (daysLeft <= 0) return 'default';
  if (daysLeft <= 3) return 'error';
  if (daysLeft <= 7) return 'warning';
  if (daysLeft <= 15) return 'info';
  return 'success';
};

const daysLeftLabel = (daysLeft: number | null) => {
  if (daysLeft === null) return '—';
  if (daysLeft <= 0) return daysLeft === 0 ? 'Expired today' : `Expired ${-daysLeft} day${daysLeft === -1 ? '' : 's'} ago`;
  return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
};

/** wa.me needs the number in international form without "+" (Bangladesh: 01XXXXXXXXX → 8801XXXXXXXXX). */
const waNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880')) return digits;
  if (digits.startsWith('0')) return `88${digits}`;
  return digits;
};

const reminderText = (row: SubscriptionAlert) => {
  const plan = `${row.productName} (${itemPlanLabel(row)})`;
  const when =
    row.daysLeft !== null && row.daysLeft > 0
      ? `ends in ${row.daysLeft} day${row.daysLeft === 1 ? '' : 's'}${row.expiresAt ? ` (${formatDate(row.expiresAt)})` : ''}`
      : `has ended${row.expiresAt ? ` on ${formatDate(row.expiresAt)}` : ''}`;
  return [
    `Hello ${row.order.customerName},`,
    `Your ${plan} subscription from TECH FLIX ${when}.`,
    `Order: ${row.order.orderNumber}`,
    'Reply here to renew and keep watching without interruption. Thank you!',
  ].join('\n');
};

export const SubscriptionAlerts: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const bucketParam = params.get('bucket');
  const bucket: AlertBucket = isBucket(bucketParam) ? bucketParam : '5';
  const page = Math.max(0, Number(params.get('page') || 1) - 1);
  const pageSize = Number(params.get('limit') || 25);

  const [searchInput, setSearchInput] = useState(params.get('q') || '');
  const search = useDebouncedValue(searchInput.trim(), 400);

  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [rows, setRows] = useState<SubscriptionAlert[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const update = useCallback(
    (changes: Record<string, string | null>, resetPage = true) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
          if (resetPage) next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  useEffect(() => {
    if ((params.get('q') || '') !== search) update({ q: search || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to new debounced input
  }, [search]);

  // Summary is one small query; it only reloads on refresh, not on every page/filter change.
  const loadSummary = useCallback(async () => {
    try {
      setSummary(await subscriptionAlertService.summary());
    } catch {
      // the list below shows the error
    }
  }, []);

  const q = params.get('q') || '';
  const loadList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await subscriptionAlertService.list({ bucket, page: page + 1, limit: pageSize, search: q || undefined });
      setRows(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load subscription alerts'));
    } finally {
      setLoading(false);
    }
  }, [bucket, page, pageSize, q]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const refresh = () => {
    loadSummary();
    loadList();
  };

  const columns = useMemo<GridColDef<SubscriptionAlert>[]>(
    () => [
      {
        field: 'daysLeft',
        headerName: 'Time left',
        minWidth: 160,
        flex: 0.8,
        sortable: false,
        renderCell: ({ row }) => {
          const tone = toneFor(row.daysLeft);
          return (
            <Chip
              size="small"
              label={daysLeftLabel(row.daysLeft)}
              color={tone === 'default' ? 'default' : tone}
              variant={tone === 'default' ? 'outlined' : 'filled'}
              sx={{ fontWeight: 700, borderRadius: '6px' }}
            />
          );
        },
      },
      {
        field: 'customer',
        headerName: 'Customer',
        minWidth: 200,
        flex: 1.2,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={{ lineHeight: 1.3, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {row.order.customerName}
            </Typography>
            <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }} noWrap>
              {row.order.customerPhone} · {row.order.customerEmail}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'product',
        headerName: 'Subscription',
        minWidth: 210,
        flex: 1.3,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={{ lineHeight: 1.3, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {row.productName}
            </Typography>
            <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }} noWrap>
              {itemPlanLabel(row)}
              {row.quantity > 1 ? ` × ${row.quantity}` : ''}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'expiresAt',
        headerName: 'Started → Ends',
        minWidth: 200,
        flex: 1,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={{ lineHeight: 1.3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.expiresAt ? formatDate(row.expiresAt) : '—'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              from {row.deliveredAt ? formatDate(row.deliveredAt) : '—'}
              {row.planDurationDays ? ` · ${row.planDurationDays} days` : ''}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'order',
        headerName: 'Order',
        minWidth: 120,
        flex: 0.6,
        sortable: false,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.order.orderNumber}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: '',
        width: 150,
        sortable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => (
          <Button
            size="small"
            variant="contained"
            startIcon={<WhatsAppIcon />}
            href={`https://wa.me/${waNumber(row.order.customerPhone)}?text=${encodeURIComponent(reminderText(row))}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#1ebe5b' }, borderRadius: '4px', fontWeight: 700 }}
          >
            Remind
          </Button>
        ),
      },
    ],
    []
  );

  const onPagination = (model: GridPaginationModel) => {
    update({ page: model.page > 0 ? String(model.page + 1) : null, limit: String(model.pageSize) }, false);
  };

  const active = BUCKETS.find((b) => b.key === bucket)!;

  return (
    <Box>
      <PageHeader
        title="Subscription Alerts"
        subtitle="Customers whose plan ends soon, counted from the delivery date plus the plan's validity days."
        actions={
          <Tooltip title="Refresh">
            <IconButton onClick={refresh} sx={{ border: 1, borderColor: 'divider' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />

      {/* Bucket cards: click to filter */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)', lg: 'repeat(7, 1fr)' },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        {BUCKETS.map((b) => {
          const selected = b.key === bucket;
          const color = b.tone === 'default' ? theme.palette.text.secondary : theme.palette[b.tone].main;
          return (
            <Paper
              key={b.key}
              component="button"
              type="button"
              elevation={0}
              onClick={() => update({ bucket: b.key === '5' ? null : b.key })}
              sx={{
                p: 1.75,
                textAlign: 'left',
                cursor: 'pointer',
                font: 'inherit',
                color: 'inherit',
                borderRadius: '12px',
                border: `1.5px solid ${selected ? color : theme.palette.divider}`,
                bgcolor: selected ? alpha(color, 0.1) : 'background.paper',
                transition: 'all 0.15s ease',
                '&:hover': { borderColor: color },
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color, display: 'block' }}>
                {b.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2, my: 0.25 }}>
                {summary ? summary[b.key] : '–'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {b.hint}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      <SectionCard noPadding>
        <Box sx={{ p: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mr: 'auto' }}>
            {active.label} · {active.hint.toLowerCase()}
            {pagination ? ` (${pagination.total})` : ''}
          </Typography>
          <TextField
            size="small"
            placeholder="Search name, email, phone, order # or product"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ flex: '1 1 280px', maxWidth: 400 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchInput('')} aria-label="Clear search">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ m: 2, borderRadius: '10px' }}
            action={
              <Button color="inherit" onClick={loadList}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          rowCount={pagination?.total ?? 0}
          paginationMode="server"
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={onPagination}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          disableColumnMenu
          rowHeight={68}
          autoHeight
          onRowClick={({ row }) => navigate(`/dashboard/orders/${row.order.orderNumber}`, { state: { fromList: true } })}
          slots={{
            noRowsOverlay: () => (
              <EmptyState
                icon={<AlertsIcon />}
                title={q ? 'No matches' : 'Nothing here'}
                description={
                  q
                    ? 'Try a different name, phone or order number.'
                    : 'No delivered subscriptions fall in this window. Plans without a duration (days) are not tracked.'
                }
              />
            ),
          }}
          sx={dataGridSx(theme)}
        />
      </SectionCard>
    </Box>
  );
};
