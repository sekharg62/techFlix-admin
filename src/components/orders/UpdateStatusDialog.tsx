import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Radio, RadioGroup, FormControlLabel, TextField, Typography } from '@mui/material';
import { ConfirmDialog } from '../common/ConfirmDialog';
import type { OrderDetail, OrderStatus } from '../../types/order';
import { ORDER_STATUS_META, nextStatuses } from '../../utils/orderFormat';
import { OrderStatusChip } from './StatusChips';

interface UpdateStatusDialogProps {
  open: boolean;
  order: OrderDetail;
  loading: boolean;
  onClose: () => void;
  onConfirm: (status: OrderStatus, note: string) => void;
}

const WARNINGS: Partial<Record<OrderStatus, string>> = {
  CANCELLED: 'Cancelling is final. The order cannot be reopened.',
  REFUNDED: 'Only mark as refunded after you have returned the money to the customer.',
};

export const UpdateStatusDialog: React.FC<UpdateStatusDialogProps> = ({ open, order, loading, onClose, onConfirm }) => {
  const options = useMemo(() => nextStatuses(order.status, order.paymentStatus), [order.status, order.paymentStatus]);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setStatus(options[0] ?? '');
      setNote('');
    }
  }, [open, options]);

  const undelivered = order.items.filter((i) => !i.deliveredAt).length;
  const needsReason = status === 'CANCELLED' || status === 'REFUNDED';

  return (
    <ConfirmDialog
      open={open}
      title="Update order status"
      confirmLabel="Update status"
      confirmColor={status === 'CANCELLED' ? 'error' : 'primary'}
      loading={loading}
      confirmDisabled={!status || (needsReason && !note.trim())}
      onClose={onClose}
      onConfirm={() => status && onConfirm(status, note.trim())}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Current status:
        </Typography>
        <OrderStatusChip status={order.status} />
      </Box>

      {options.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: '10px' }}>
          This order is {ORDER_STATUS_META[order.status].label.toLowerCase()} — no further status changes are possible.
        </Alert>
      ) : (
        <>
          {order.status === 'PENDING' && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}>
              To move this order to Processing, verify its payment.
            </Alert>
          )}
          <RadioGroup value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
            {options.map((s) => (
              <FormControlLabel
                key={s}
                value={s}
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {ORDER_STATUS_META[s].label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {ORDER_STATUS_META[s].description}
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', mb: 1, '& .MuiRadio-root': { pt: 0.5 } }}
              />
            ))}
          </RadioGroup>

          {status === 'DELIVERED' && undelivered > 0 && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: '10px' }}>
              {undelivered} item{undelivered === 1 ? ' is' : 's are'} not delivered yet. Deliver every item first.
            </Alert>
          )}
          {status && WARNINGS[status] && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: '10px' }}>
              {WARNINGS[status]}
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            minRows={2}
            label={needsReason ? 'Reason (required)' : 'Note (optional)'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
        </>
      )}
    </ConfirmDialog>
  );
};
