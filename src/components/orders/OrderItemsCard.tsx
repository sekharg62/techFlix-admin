import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  Inventory2 as ItemsIcon,
  Key as KeyIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
  CheckCircle as DoneIcon,
} from '@mui/icons-material';
import type { OrderDetail, OrderItem } from '../../types/order';
import { SectionCard } from '../common/SectionCard';
import { CopyButton } from '../common/CopyButton';
import { formatBDT, formatDateTime, itemPlanLabel } from '../../utils/orderFormat';

interface OrderItemsCardProps {
  order: OrderDetail;
  onDeliver: (item: OrderItem, details: string) => Promise<boolean>;
}

export const OrderItemsCard: React.FC<OrderItemsCardProps> = ({ order, onDeliver }) => {
  const [editing, setEditing] = useState<OrderItem | null>(null);
  const delivered = order.items.filter((i) => i.deliveredAt).length;
  const canDeliver = order.paymentStatus === 'PAID' && (order.status === 'PROCESSING' || order.status === 'DELIVERED');
  const blockedReason =
    order.paymentStatus !== 'PAID'
      ? 'Verify the payment before delivering items'
      : `Items cannot be delivered while the order is ${order.status.toLowerCase()}`;

  return (
    <SectionCard
      title="Items"
      subtitle={`${delivered} of ${order.items.length} delivered`}
      icon={<ItemsIcon fontSize="small" />}
      noPadding
    >
      <LinearProgress
        variant="determinate"
        value={order.items.length ? (delivered / order.items.length) * 100 : 0}
        color="success"
        sx={{ height: 3 }}
      />
      {order.items.map((item, index) => (
        <Box key={item.id}>
          {index > 0 && <Divider />}
          <ItemRow
            item={item}
            canDeliver={canDeliver}
            blockedReason={blockedReason}
            onEdit={() => setEditing(item)}
          />
        </Box>
      ))}
      <DeliverItemDialog
        item={editing}
        onClose={() => setEditing(null)}
        onSave={async (details) => {
          if (!editing) return;
          const ok = await onDeliver(editing, details);
          if (ok) setEditing(null);
        }}
      />
    </SectionCard>
  );
};

const ItemRow: React.FC<{ item: OrderItem; canDeliver: boolean; blockedReason: string; onEdit: () => void }> = ({
  item,
  canDeliver,
  blockedReason,
  onEdit,
}) => {
  const [revealed, setRevealed] = useState(false);
  const isDelivered = Boolean(item.deliveredAt);

  return (
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Avatar
          variant="rounded"
          src={item.productImgUrl || undefined}
          alt={item.productName}
          sx={{ width: 52, height: 52, borderRadius: '10px', bgcolor: 'action.hover' }}
        >
          {item.productName.charAt(0)}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>
                {item.productName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {itemPlanLabel(item)}
                {item.planValidity ? ` · ${item.planValidity}` : ''}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {formatBDT(item.lineTotal)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {item.quantity} × {formatBDT(item.unitPrice)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {isDelivered ? (
              <Chip
                icon={<DoneIcon />}
                label={`Delivered ${formatDateTime(item.deliveredAt)}`}
                color="success"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            ) : (
              <Chip label="Not delivered" size="small" color="warning" variant="outlined" sx={{ fontWeight: 600 }} />
            )}
            <Tooltip title={canDeliver ? '' : blockedReason}>
              <span>
                <Button
                  size="small"
                  variant={isDelivered ? 'text' : 'contained'}
                  startIcon={<KeyIcon />}
                  onClick={onEdit}
                  disabled={!canDeliver}
                >
                  {isDelivered ? 'Edit delivery' : 'Deliver key'}
                </Button>
              </span>
            </Tooltip>
          </Box>

          {isDelivered && item.deliveryDetails && (
            <Box
              sx={(theme) => ({
                mt: 1.5,
                p: 1.5,
                borderRadius: '10px',
                backgroundColor: alpha(theme.palette.success.main, 0.06),
                border: `1px dashed ${alpha(theme.palette.success.main, 0.35)}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
              })}
            >
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  m: 0,
                  fontFamily: 'inherit',
                  flexGrow: 1,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  filter: revealed ? 'none' : 'blur(5px)',
                  userSelect: revealed ? 'text' : 'none',
                  transition: 'filter 0.2s',
                }}
              >
                {item.deliveryDetails}
              </Typography>
              <Tooltip title={revealed ? 'Hide' : 'Reveal'}>
                <IconButton size="small" onClick={() => setRevealed((v) => !v)} sx={{ p: 0.5 }}>
                  {revealed ? <HideIcon sx={{ fontSize: 16 }} /> : <ShowIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </Tooltip>
              <CopyButton value={item.deliveryDetails} label="Copy delivery details" />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const DeliverItemDialog: React.FC<{
  item: OrderItem | null;
  onClose: () => void;
  onSave: (details: string) => Promise<void>;
}> = ({ item, onClose, onSave }) => {
  const [details, setDetails] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) setDetails(item.deliveryDetails || '');
  }, [item]);

  const submit = async () => {
    setSaving(true);
    try {
      await onSave(details.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(item)} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{item?.deliveryDetails ? 'Edit delivery' : 'Deliver item'}</DialogTitle>
      <DialogContent>
        {item && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            {item.productName} — {itemPlanLabel(item)} × {item.quantity}
          </Typography>
        )}
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={4}
          label="License key / account credentials"
          placeholder={'e.g.\nEmail: user@example.com\nPassword: ••••••\nProfile: 2'}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          helperText="Only admins can see this. The order is marked Delivered automatically once every item has a key."
         
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={saving} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={saving || !details.trim()}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <KeyIcon />}
        >
          {item?.deliveryDetails ? 'Save changes' : 'Mark as delivered'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
