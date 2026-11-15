import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  SwapHoriz as StatusIcon,
  MoreVert as MoreIcon,
  DeleteOutlined as DeleteIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { orderService, paymentService } from '../services/orderService';
import { getErrorMessage } from '../services/apiClient';
import type { OrderDetail, OrderItem, OrderStatus, Payment } from '../types/order';
import { PageHeader } from '../components/common/PageHeader';
import { CopyButton } from '../components/common/CopyButton';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { OrderStatusChip, PaymentStatusChip } from '../components/orders/StatusChips';
import { OrderProgressTracker } from '../components/orders/OrderProgressTracker';
import { OrderNextAction } from '../components/orders/OrderNextAction';
import { OrderItemsCard } from '../components/orders/OrderItemsCard';
import { PaymentsCard } from '../components/orders/PaymentsCard';
import { VerifyPaymentDialog, RejectPaymentDialog } from '../components/orders/PaymentReviewDialogs';
import { CustomerCard, OrderSummaryCard, AdminNoteCard } from '../components/orders/OrderSideCards';
import { OrderActivityTimeline } from '../components/orders/OrderActivityTimeline';
import { UpdateStatusDialog } from '../components/orders/UpdateStatusDialog';
import { formatDateTime, nextStatuses } from '../utils/orderFormat';

export const OrderDetails: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const itemsRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [verifying, setVerifying] = useState<Payment | null>(null);
  const [rejecting, setRejecting] = useState<Payment | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError('');
      try {
        setOrder(await orderService.getById(id));
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load order'));
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    load();
  }, [load]);

  /** Run a mutation that returns the updated order. */
  const mutate = async (fn: () => Promise<OrderDetail>, success: string) => {
    setBusy(true);
    try {
      setOrder(await fn());
      toast.success(success);
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err));
      load(true);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const goBack = () => {
    // Return to the list with its filters if we came from there
    if ((location.state as { fromList?: boolean } | null)?.fromList) navigate(-1);
    else navigate('/dashboard/orders');
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={280} height={48} />
        <Skeleton variant="text" width={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              <Skeleton variant="rounded" height={150} sx={{ borderRadius: '16px' }} />
              <Skeleton variant="rounded" height={260} sx={{ borderRadius: '16px' }} />
              <Skeleton variant="rounded" height={200} sx={{ borderRadius: '16px' }} />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
              <Skeleton variant="rounded" height={220} sx={{ borderRadius: '16px' }} />
              <Skeleton variant="rounded" height={220} sx={{ borderRadius: '16px' }} />
            </Stack>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box>
        <Button startIcon={<BackIcon />} onClick={goBack} sx={{ mb: 2 }}>
          Back to orders
        </Button>
        <Alert
          severity="error"
          sx={{ borderRadius: '12px' }}
          action={
            <Button color="inherit" onClick={() => load()}>
              Retry
            </Button>
          }
        >
          {error || 'Order not found'}
        </Alert>
      </Box>
    );
  }

  const canChangeStatus = nextStatuses(order.status, order.paymentStatus).length > 0;

  return (
    <Box>
      <PageHeader
        before={
          <Tooltip title="Back to orders">
            <IconButton onClick={goBack} sx={{ border: 1, borderColor: 'divider' }}>
              <BackIcon />
            </IconButton>
          </Tooltip>
        }
        title={
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            Order {order.orderNumber}
            <CopyButton value={order.orderNumber} label="Copy order number" />
          </Box>
        }
        subtitle={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <OrderStatusChip status={order.status} />
            <PaymentStatusChip status={order.paymentStatus} />
            <Box component="span">Placed {formatDateTime(order.createdAt)}</Box>
          </Box>
        }
        actions={
          <>
            <Tooltip title="Refresh">
              <IconButton onClick={() => load(true)} sx={{ border: 1, borderColor: 'divider' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<StatusIcon />}
              onClick={() => setStatusOpen(true)}
              disabled={!canChangeStatus}
            >
              Update status
            </Button>
            <IconButton
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={{ border: 1, borderColor: 'divider' }}
              aria-label="More actions"
            >
              <MoreIcon />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
              <MenuItem
                disabled={order.status !== 'CANCELLED'}
                onClick={() => {
                  setMenuAnchor(null);
                  setDeleteOpen(true);
                }}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                {order.status === 'CANCELLED' ? 'Delete order' : 'Delete (cancel first)'}
              </MenuItem>
            </Menu>
          </>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            <OrderProgressTracker order={order} />
            <OrderNextAction
              order={order}
              onVerify={setVerifying}
              onScrollToItems={() => itemsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            />
            <Box ref={itemsRef} sx={{ scrollMarginTop: 80 }}>
              <OrderItemsCard
                order={order}
                onDeliver={(item: OrderItem, details: string) =>
                  mutate(
                    () => orderService.deliverItem(order.id, item.id, details),
                    item.deliveredAt ? 'Delivery details updated' : 'Item delivered'
                  )
                }
              />
            </Box>
            <PaymentsCard order={order} onVerify={setVerifying} onReject={setRejecting} />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <CustomerCard order={order} />
            <OrderSummaryCard order={order} />
            <AdminNoteCard
              order={order}
              onSave={async (note) => {
                await mutate(() => orderService.updateNote(order.id, note), 'Note saved');
              }}
            />
            <OrderActivityTimeline order={order} />
          </Stack>
        </Grid>
      </Grid>

      <VerifyPaymentDialog
        payment={verifying}
        orderTotal={order.total}
        loading={busy}
        onClose={() => setVerifying(null)}
        onConfirm={async () => {
          if (!verifying) return;
          const ok = await mutate(() => paymentService.verify(verifying.id), 'Payment verified — order is now Processing');
          if (ok) setVerifying(null);
        }}
      />
      <RejectPaymentDialog
        payment={rejecting}
        loading={busy}
        onClose={() => setRejecting(null)}
        onConfirm={async (reason) => {
          if (!rejecting) return;
          const ok = await mutate(() => paymentService.reject(rejecting.id, reason), 'Payment rejected');
          if (ok) setRejecting(null);
        }}
      />
      <UpdateStatusDialog
        open={statusOpen}
        order={order}
        loading={busy}
        onClose={() => setStatusOpen(false)}
        onConfirm={async (status: OrderStatus, note: string) => {
          const ok = await mutate(() => orderService.updateStatus(order.id, status, note), 'Order status updated');
          if (ok) setStatusOpen(false);
        }}
      />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete order?"
        description={`Order ${order.orderNumber} and all its payments and history will be permanently removed.`}
        confirmLabel="Delete permanently"
        confirmColor="error"
        loading={busy}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          setBusy(true);
          try {
            await orderService.remove(order.id);
            toast.success('Order deleted');
            navigate('/dashboard/orders', { replace: true });
          } catch (err) {
            toast.error(getErrorMessage(err));
          } finally {
            setBusy(false);
          }
        }}
      />
    </Box>
  );
};
