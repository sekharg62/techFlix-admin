import React, { useEffect, useState } from 'react';
import { Alert, Box, Chip, Stack, TextField, Typography } from '@mui/material';
import { ConfirmDialog } from '../common/ConfirmDialog';
import type { Payment } from '../../types/order';
import { PAYMENT_METHOD_META, formatBDT } from '../../utils/orderFormat';

const REJECT_REASONS = ['Transaction ID not found', 'Amount does not match', 'Duplicate transaction', 'Wrong account'];

interface VerifyPaymentDialogProps {
  payment: Payment | null;
  orderTotal: number;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const VerifyPaymentDialog: React.FC<VerifyPaymentDialogProps> = ({
  payment,
  orderTotal,
  loading,
  onConfirm,
  onClose,
}) => {
  const mismatch = payment ? Number(payment.amount) !== Number(orderTotal) : false;
  return (
    <ConfirmDialog
      open={Boolean(payment)}
      title="Verify payment"
      confirmLabel="Yes, payment received"
      confirmColor="success"
      loading={loading}
      onConfirm={onConfirm}
      onClose={onClose}
      description="Check your merchant app before confirming. The order will move to Processing."
    >
      {payment && (
        <Stack spacing={1.25}>
          <Row label="Method" value={PAYMENT_METHOD_META[payment.method].label} />
          <Row label="Transaction ID" value={payment.trxId} mono />
          <Row label="Sender number" value={payment.senderNumber} mono />
          <Row label="Amount" value={formatBDT(payment.amount)} />
          {mismatch && (
            <Alert severity="warning" sx={{ borderRadius: '10px' }}>
              Payment amount differs from the order total ({formatBDT(orderTotal)}).
            </Alert>
          )}
        </Stack>
      )}
    </ConfirmDialog>
  );
};

const Row: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: mono ? 'monospace' : undefined }}>
      {value}
    </Typography>
  </Box>
);

interface RejectPaymentDialogProps {
  payment: Payment | null;
  loading: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export const RejectPaymentDialog: React.FC<RejectPaymentDialogProps> = ({ payment, loading, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (payment) setReason('');
  }, [payment]);

  return (
    <ConfirmDialog
      open={Boolean(payment)}
      title="Reject payment"
      confirmLabel="Reject payment"
      confirmColor="error"
      loading={loading}
      confirmDisabled={!reason.trim()}
      onConfirm={() => onConfirm(reason.trim())}
      onClose={onClose}
      description={
        payment ? (
          <>
            The customer will see this reason on the tracking page and can submit a new transaction ID for{' '}
            <strong>{payment.trxId}</strong>.
          </>
        ) : undefined
      }
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {REJECT_REASONS.map((r) => (
          <Chip
            key={r}
            label={r}
            size="small"
            clickable
            color={reason === r ? 'error' : 'default'}
            variant={reason === r ? 'filled' : 'outlined'}
            onClick={() => setReason(r)}
          />
        ))}
      </Box>
      <TextField
        autoFocus
        fullWidth
        multiline
        minRows={2}
        label="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        slotProps={{ htmlInput: { maxLength: 300 } }}
      />
    </ConfirmDialog>
  );
};
