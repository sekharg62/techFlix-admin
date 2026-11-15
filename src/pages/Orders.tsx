import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  ChevronRight as ChevronIcon,
  FilterAltOff as ResetIcon,
  HourglassTop as PendingIcon,
  ReceiptLong as OrdersIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { orderService } from '../services/orderService';
import { getErrorMessage } from '../services/apiClient';
import type {
  OrderStatus,
  OrderSummary,
  PaymentMethodType,
  PaymentStatus,
  Pagination,
  StatusCounts,
} from '../types/order';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { EmptyState } from '../components/common/EmptyState';
import { DateRangeFilter } from '../components/common/DateRangeFilter';
import { ALL_TIME, presetRange } from '../utils/dateRange';
import type { DateRange, PresetKey } from '../utils/dateRange';
import { dataGridSx } from '../components/common/dataGridSx';
import { OrderStatusChip, PaymentMethodBadge, PaymentStatusChip } from '../components/orders/StatusChips';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  ORDER_STATUS_META,
  PAYMENT_METHOD_META,
  PAYMENT_STATUS_META,
  formatBDT,
  formatDateTime,
  fromNow,
} from '../utils/orderFormat';

const STATUS_TABS: (OrderStatus | 'ALL')[] = ['ALL', 'PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const readRange = (params: URLSearchParams): DateRange => {
  const preset = (params.get('range') || 'all') as PresetKey;
  if (preset === 'all') return ALL_TIME;
  if (preset === 'custom') return { from: params.get('from') || '', to: params.get('to') || '', preset };
  return presetRange(preset);
};

export const Orders: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // Filters are stored in the URL so they survive navigation and can be shared
  const status = (params.get('status') || 'ALL') as OrderStatus | 'ALL';
  const paymentStatus = (params.get('paymentStatus') || '') as PaymentStatus | '';
  const method = (params.get('method') || '') as PaymentMethodType | '';
  const range = readRange(params);
  const page = Math.max(0, Number(params.get('page') || 1) - 1);
  const pageSize = Number(params.get('limit') || 25);

  const q = params.get('q') || '';
  const [searchInput, setSearchInput] = useState(q);
  const search = useDebouncedValue(searchInput.trim(), 400);

  const [rows, setRows] = useState<OrderSummary[]>([]);
  const [counts, setCounts] = useState<StatusCounts | null>(null);
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

  // Sync debounced search into the URL
  useEffect(() => {
    if (q !== search) update({ q: search || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to new debounced input
  }, [search]);

  const query = useMemo(
    () => ({
      page: page + 1,
      limit: pageSize,
      status: status === 'ALL' ? undefined : status,
      paymentStatus: paymentStatus || undefined,
      method: method || undefined,
      search: q || undefined,
      // Local-day boundaries sent as ISO so the server filters in the admin's timezone
      from: range.from ? dayjs(range.from).startOf('day').toISOString() : undefined,
      to: range.to ? dayjs(range.to).endOf('day').toISOString() : undefined,
    }),
    [page, pageSize, status, paymentStatus, method, q, range.from, range.to]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await orderService.list(query);
      setRows(res.data);
      setCounts(res.statusCounts);
      setPagination(res.pagination);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load orders'));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const hasFilters = Boolean(paymentStatus || method || q || range.preset !== 'all');

  const columns = useMemo<GridColDef<OrderSummary>[]>(
    () => [
      {
        field: 'orderNumber',
        headerName: 'Order',
        minWidth: 140,
        flex: 0.8,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={{ lineHeight: 1.3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.orderNumber}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }} title={formatDateTime(row.createdAt)}>
              {fromNow(row.createdAt)}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'customerName',
        headerName: 'Customer',
        minWidth: 190,
        flex: 1.2,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={{ lineHeight: 1.3, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {row.customerName}
            </Typography>
            <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }} noWrap>
              {row.customerEmail}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'items',
        headerName: 'Items',
        minWidth: 190,
        flex: 1.2,
        sortable: false,
        renderCell: ({ row }) => {
          const first = row.items[0];
          const delivered = row.items.filter((i) => i.deliveredAt).length;
          return (
            <Box sx={{ lineHeight: 1.3, minWidth: 0 }}>
              <Typography variant="body2" noWrap>
                {first ? `${first.productName} · ${first.planName}` : '—'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {row.items.length > 1 ? `+${row.items.length - 1} more · ` : ''}
                {delivered}/{row.items.length} delivered
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'total',
        headerName: 'Total',
        minWidth: 110,
        flex: 0.6,
        sortable: false,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {formatBDT(row.total)}
          </Typography>
        ),
      },
      {
        field: 'paymentStatus',
        headerName: 'Payment',
        minWidth: 200,
        flex: 1,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {row.payments[0] && <PaymentMethodBadge method={row.payments[0].method} />}
            <PaymentStatusChip status={row.paymentStatus} />
          </Box>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 120,
        flex: 0.6,
        sortable: false,
        renderCell: ({ row }) => <OrderStatusChip status={row.status} />,
      },
      {
        field: 'open',
        headerName: '',
        width: 48,
        sortable: false,
        disableColumnMenu: true,
        renderCell: () => <ChevronIcon sx={{ color: 'text.secondary' }} />,
      },
    ],
    []
  );

  const onPagination = (model: GridPaginationModel) => {
    update({ page: model.page > 0 ? String(model.page + 1) : null, limit: String(model.pageSize) }, false);
  };

  return (
    <Box>
      <PageHeader
        title="Orders"
        subtitle="Verify payments, deliver license keys and track every order."
        actions={
          <Tooltip title="Refresh">
            <IconButton onClick={load} sx={{ border: 1, borderColor: 'divider' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />

      {/* Quick shortcut to the verification queue */}
      {paymentStatus !== 'PENDING_VERIFICATION' && (
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<PendingIcon />}
            label="Show payments awaiting verification"
            onClick={() => update({ paymentStatus: 'PENDING_VERIFICATION', status: null })}
            color="warning"
            variant="outlined"
            clickable
            sx={{ fontWeight: 600 }}
          />
        </Box>
      )}

      <SectionCard noPadding>
        <Tabs
          value={status}
          onChange={(_, v) => update({ status: v === 'ALL' ? null : v })}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 1.5, borderBottom: 1, borderColor: 'divider' }}
        >
          {STATUS_TABS.map((s) => (
            <Tab
              key={s}
              value={s}
              sx={{ textTransform: 'none', fontWeight: 600, minHeight: 52 }}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {s === 'ALL' ? 'All' : ORDER_STATUS_META[s].label}
                  <Badge
                    badgeContent={counts ? counts[s] : 0}
                    showZero
                    max={9999}
                    color={s === 'PENDING' && counts?.PENDING ? 'warning' : 'default'}
                    sx={{
                      '& .MuiBadge-badge': {
                        position: 'static',
                        transform: 'none',
                        fontWeight: 700,
                        bgcolor: s === 'PENDING' && counts?.PENDING ? undefined : 'action.selected',
                        color: s === 'PENDING' && counts?.PENDING ? undefined : 'text.primary',
                      },
                    }}
                  />
                </Box>
              }
            />
          ))}
        </Tabs>

        {/* Filter bar */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <TextField
            size="small"
            placeholder="Search order #, name, email, phone or TrxID"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ flex: '1 1 300px', maxWidth: 420 }}
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
          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel id="payment-status-label">Payment status</InputLabel>
            <Select
              labelId="payment-status-label"
              label="Payment status"
              value={paymentStatus}
              onChange={(e) => update({ paymentStatus: e.target.value || null })}
            >
              <MenuItem value="">Any</MenuItem>
              {(Object.keys(PAYMENT_STATUS_META) as PaymentStatus[]).map((s) => (
                <MenuItem key={s} value={s}>
                  {PAYMENT_STATUS_META[s].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="method-label">Method</InputLabel>
            <Select
              labelId="method-label"
              label="Method"
              value={method}
              onChange={(e) => update({ method: e.target.value || null })}
            >
              <MenuItem value="">Any</MenuItem>
              {(Object.keys(PAYMENT_METHOD_META) as PaymentMethodType[]).map((m) => (
                <MenuItem key={m} value={m}>
                  {PAYMENT_METHOD_META[m].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <DateRangeFilter
            value={range}
            allowAllTime
            onChange={(r) =>
              update({
                range: r.preset === 'all' ? null : r.preset,
                from: r.preset === 'custom' ? r.from : null,
                to: r.preset === 'custom' ? r.to : null,
              })
            }
          />
          {hasFilters && (
            <Button
              color="inherit"
              startIcon={<ResetIcon />}
              onClick={() => {
                setSearchInput('');
                update({ paymentStatus: null, method: null, q: null, range: null, from: null, to: null });
              }}
            >
              Reset
            </Button>
          )}
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ m: 2, borderRadius: '10px' }}
            action={
              <Button color="inherit" onClick={load}>
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
          onRowClick={({ row }) => navigate(`/dashboard/orders/${row.orderNumber}`, { state: { fromList: true } })}
          slots={{
            noRowsOverlay: () => (
              <EmptyState
                icon={<OrdersIcon />}
                title={hasFilters || status !== 'ALL' ? 'No orders match these filters' : 'No orders yet'}
                description={
                  hasFilters || status !== 'ALL'
                    ? 'Try a different status, date range or search term.'
                    : 'Orders placed on the storefront will appear here.'
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
