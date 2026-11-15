import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  Link,
  List,
  ListItemButton,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Public as CountryIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { customerService } from '../services/orderService';
import { getErrorMessage } from '../services/apiClient';
import type { Customer, CustomerDetail, Pagination } from '../types/order';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { EmptyState } from '../components/common/EmptyState';
import { CopyButton } from '../components/common/CopyButton';
import { dataGridSx } from '../components/common/dataGridSx';
import { OrderStatusChip } from '../components/orders/StatusChips';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { formatBDT, formatDate, fromNow, itemPlanLabel } from '../utils/orderFormat';

export const Customers: React.FC = () => {
  const theme = useTheme();
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('customer');

  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim(), 400);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });

  const [rows, setRows] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await customerService.list({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: search || undefined,
      });
      setRows(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load customers'));
    } finally {
      setLoading(false);
    }
  }, [paginationModel, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPaginationModel((m) => ({ ...m, page: 0 }));
  }, [search]);

  const openCustomer = (id: string | null) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id) next.set('customer', id);
        else next.delete('customer');
        return next;
      },
      { replace: true }
    );

  const columns = useMemo<GridColDef<Customer>[]>(
    () => [
      {
        field: 'fullName',
        headerName: 'Customer',
        flex: 1.4,
        minWidth: 220,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700 }}>
              {row.fullName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, lineHeight: 1.3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                {row.fullName}
              </Typography>
              <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }} noWrap>
                {row.email}
              </Typography>
            </Box>
          </Box>
        ),
      },
      { field: 'whatsapp', headerName: 'WhatsApp', flex: 0.8, minWidth: 140, sortable: false },
      {
        field: 'orderCount',
        headerName: 'Orders',
        flex: 0.5,
        minWidth: 90,
        sortable: false,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {row.orderCount ?? 0}
          </Typography>
        ),
      },
      {
        field: 'totalSpent',
        headerName: 'Total spent',
        flex: 0.7,
        minWidth: 120,
        sortable: false,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {formatBDT(row.totalSpent)}
          </Typography>
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Joined',
        flex: 0.7,
        minWidth: 120,
        sortable: false,
        renderCell: ({ row }) => <span title={formatDate(row.createdAt)}>{fromNow(row.createdAt)}</span>,
      },
    ],
    []
  );

  return (
    <Box>
      <PageHeader
        title="Customers"
        subtitle="Everyone who has placed an order, with their history and lifetime value."
        actions={
          <Tooltip title="Refresh">
            <IconButton onClick={load} sx={{ border: 1, borderColor: 'divider' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />

      <SectionCard noPadding>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search name, email or WhatsApp"
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
          <Typography variant="body2" sx={{ color: 'text.secondary', ml: 'auto' }}>
            {pagination ? `${pagination.total} customer${pagination.total === 1 ? '' : 's'}` : ''}
          </Typography>
        </Box>
        {error && (
          <Alert severity="error" sx={{ m: 2, borderRadius: '10px' }}>
            {error}
          </Alert>
        )}
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          rowCount={pagination?.total ?? 0}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          disableColumnMenu
          rowHeight={64}
          autoHeight
          onRowClick={({ row }) => openCustomer(row.id)}
          slots={{
            noRowsOverlay: () => (
              <EmptyState
                icon={<PeopleIcon />}
                title={search ? 'No customers match your search' : 'No customers yet'}
                description={search ? 'Try another name, email or number.' : 'Customers are created automatically at checkout.'}
              />
            ),
          }}
          sx={dataGridSx(theme)}
        />
      </SectionCard>

      <CustomerDrawer
        customerId={selectedId}
        onClose={() => openCustomer(null)}
        onUpdated={(c) => setRows((prev) => prev.map((r) => (r.id === c.id ? { ...r, ...c } : r)))}
      />
    </Box>
  );
};

const CustomerDrawer: React.FC<{
  customerId: string | null;
  onClose: () => void;
  onUpdated: (customer: Customer) => void;
}> = ({ customerId, onClose, onUpdated }) => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!customerId) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    customerService
      .getById(customerId)
      .then((c) => !cancelled && setCustomer(c))
      .catch((err) => !cancelled && setError(getErrorMessage(err, 'Failed to load customer')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  return (
    <Drawer
      anchor="right"
      open={Boolean(customerId)}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 460 }, backgroundImage: 'none' } } }}
    >
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Customer
        </Typography>
        <Box>
          {customer && (
            <Tooltip title="Edit customer">
              <IconButton onClick={() => setEditOpen(true)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton onClick={onClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ p: 2.5, overflowY: 'auto' }}>
        {loading && !customer ? (
          <Stack spacing={2}>
            <Skeleton variant="circular" width={56} height={56} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="rounded" height={90} />
            <Skeleton variant="rounded" height={200} />
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : customer ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 22, fontWeight: 800 }}>
                {customer.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {customer.fullName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Customer since {formatDate(customer.createdAt)}
                </Typography>
              </Box>
            </Box>

            <Stack spacing={1.25} sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Link href={`mailto:${customer.email}`} underline="hover" color="inherit" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
                  {customer.email}
                </Link>
                <CopyButton value={customer.email} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {customer.whatsapp}
                </Typography>
                <CopyButton value={customer.whatsapp} />
              </Box>
              {customer.country && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <CountryIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2">{customer.country}</Typography>
                </Box>
              )}
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3 }}>
              <Stat label="Orders" value={String(customer.orderCount ?? customer.orders.length)} />
              <Stat label="Total spent" value={formatBDT(customer.totalSpent)} />
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
              Order history
            </Typography>
            <Divider />
            {customer.orders.length === 0 ? (
              <EmptyState compact title="No orders" />
            ) : (
              <List disablePadding>
                {customer.orders.map((o) => (
                  <ListItemButton
                    key={o.id}
                    onClick={() => navigate(`/dashboard/orders/${o.orderNumber}`)}
                    sx={{ px: 1, py: 1.25, borderBottom: 1, borderColor: 'divider', gap: 1.5 }}
                  >
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {o.orderNumber}
                      </Typography>
                      <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }} noWrap>
                        {o.items.map((i) => `${i.productName} (${itemPlanLabel(i)})`).join(', ')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {formatDate(o.createdAt)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {formatBDT(o.total)}
                      </Typography>
                      <OrderStatusChip status={o.status} />
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            )}
          </>
        ) : null}
      </Box>

      {customer && (
        <EditCustomerDialog
          open={editOpen}
          customer={customer}
          onClose={() => setEditOpen(false)}
          onSaved={(c) => {
            setCustomer((prev) => (prev ? { ...prev, ...c } : prev));
            onUpdated(c);
            setEditOpen(false);
          }}
        />
      )}
    </Drawer>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ p: 1.75, borderRadius: '12px', border: 1, borderColor: 'divider' }}>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography variant="h6" sx={{ fontWeight: 800 }}>
      {value}
    </Typography>
  </Box>
);

const EditCustomerDialog: React.FC<{
  open: boolean;
  customer: Customer;
  onClose: () => void;
  onSaved: (customer: Customer) => void;
}> = ({ open, customer, onClose, onSaved }) => {
  const [form, setForm] = useState({ fullName: '', email: '', whatsapp: '', country: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        fullName: customer.fullName,
        email: customer.email,
        whatsapp: customer.whatsapp,
        country: customer.country || '',
      });
    }
  }, [open, customer]);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await customerService.update(customer.id, form);
      toast.success('Customer updated');
      onSaved(updated);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form, label: string) => (
    <TextField fullWidth label={label} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
  );

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit customer</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {field('fullName', 'Full name')}
          {field('email', 'Email')}
          {field('whatsapp', 'WhatsApp')}
          {field('country', 'Country')}
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Past orders keep the details entered at checkout.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={saving} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={save}
          disabled={saving || !form.fullName.trim() || !form.email.trim() || !form.whatsapp.trim()}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
