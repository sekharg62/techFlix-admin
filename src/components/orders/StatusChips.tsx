import React from 'react';
import { Box, Chip, Tooltip, alpha } from '@mui/material';
import type { OrderStatus, PaymentMethodType, PaymentRecordStatus, PaymentStatus } from '../../types/order';
import {
  ORDER_STATUS_META,
  PAYMENT_METHOD_META,
  PAYMENT_RECORD_META,
  PAYMENT_STATUS_META,
} from '../../utils/orderFormat';

const chipSx = { fontWeight: 700, borderRadius: '8px', fontSize: '0.82rem', letterSpacing: '0.02em' } as const;

export const OrderStatusChip: React.FC<{ status: OrderStatus; size?: 'small' | 'medium' }> = ({
  status,
  size = 'small',
}) => {
  const meta = ORDER_STATUS_META[status];
  return (
    <Tooltip title={meta.description}>
      <Chip label={meta.label} color={meta.color} size={size} variant="filled" sx={chipSx} />
    </Tooltip>
  );
};

export const PaymentStatusChip: React.FC<{ status: PaymentStatus; size?: 'small' | 'medium' }> = ({
  status,
  size = 'small',
}) => {
  const meta = PAYMENT_STATUS_META[status];
  return <Chip label={meta.label} color={meta.color} size={size} variant="outlined" sx={chipSx} />;
};

export const PaymentRecordChip: React.FC<{ status: PaymentRecordStatus }> = ({ status }) => {
  const meta = PAYMENT_RECORD_META[status];
  return <Chip label={meta.label} color={meta.color} size="small" variant="outlined" sx={chipSx} />;
};

export const PaymentMethodBadge: React.FC<{ method: PaymentMethodType }> = ({ method }) => {
  const meta = PAYMENT_METHOD_META[method];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1,
        py: 0.25,
        borderRadius: '6px',
        fontSize: '0.82rem',
        lineHeight: 1.6,
        fontWeight: 700,
        color: meta.color,
        backgroundColor: alpha(meta.color, 0.12),
        border: `1px solid ${alpha(meta.color, 0.3)}`,
        whiteSpace: 'nowrap',
      }}
    >
      <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: meta.color }} />
      {meta.label}
    </Box>
  );
};
