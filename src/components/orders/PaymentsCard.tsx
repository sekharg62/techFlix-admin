import React from 'react';
import { Alert, Box, Button, Divider, Stack, Typography } from '@mui/material';
import {
  Payments as PaymentsIcon,
  CheckCircle as VerifyIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';
import type { OrderDetail, Payment } from '../../types/order';
import { SectionCard } from '../common/SectionCard';
import { CopyButton } from '../common/CopyButton';
import { PaymentMethodBadge, PaymentRecordChip } from './StatusChips';
import { formatBDT, formatDateTime, fromNow } from '../../utils/orderFormat';

interface PaymentsCardProps {
  order: OrderDetail;
  onVerify: (payment: Payment) => void;
  onReject: (payment: Payment) => void;
}

export const PaymentsCard: React.FC<PaymentsCardProps> = ({ order, onVerify, onReject }) => {
  const canReview = order.status === 'PENDING';

  return (
    <SectionCard
      title="Payments"
      subtitle={`${order.payments.length} submission${order.payments.length === 1 ? '' : 's'}`}
      icon={<PaymentsIcon fontSize="small" />}
      noPadding
    >
      {order.payments.length === 0 && (
        <Typography variant="body2" sx={{ p: 2.5, color: 'text.secondary' }}>
          No payment submitted.
        </Typography>
      )}
      {order.payments.map((payment, index) => {
        const mismatch = Number(payment.amount) !== Number(order.total);
        return (
          <Box key={payment.id}>
            {index > 0 && <Divider />}
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PaymentMethodBadge method={payment.method} />
                  <PaymentRecordChip status={payment.status} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }} title={formatDateTime(payment.createdAt)}>
                  Submitted {fromNow(payment.createdAt)}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                <Field label="Transaction ID">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      {payment.trxId}
                    </Typography>
                    <CopyButton value={payment.trxId} label="Copy TrxID" />
                  </Box>
                </Field>
                <Field label="Sender number">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {payment.senderNumber}
                    </Typography>
                    <CopyButton value={payment.senderNumber} label="Copy number" />
                  </Box>
                </Field>
                <Field label="Amount">
                  <Typography variant="body2" sx={{ fontWeight: 700, color: mismatch ? 'warning.main' : 'text.primary' }}>
                    {formatBDT(payment.amount)}
                  </Typography>
                </Field>
              </Box>

              {payment.status === 'REJECTED' && payment.rejectionReason && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: '10px' }}>
                  Rejected{payment.verifiedBy ? ` by ${payment.verifiedBy.name || payment.verifiedBy.email}` : ''}:{' '}
                  {payment.rejectionReason}
                </Alert>
              )}
              {payment.status === 'VERIFIED' && (
                <Typography variant="caption" component="p" sx={{ mt: 1.5, color: 'success.main' }}>
                  Verified {payment.verifiedAt ? formatDateTime(payment.verifiedAt) : ''}
                  {payment.verifiedBy ? ` by ${payment.verifiedBy.name || payment.verifiedBy.email}` : ''}
                </Typography>
              )}

              {payment.status === 'PENDING' && canReview && (
                <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                  <Button variant="contained" color="success" startIcon={<VerifyIcon />} onClick={() => onVerify(payment)}>
                    Verify payment
                  </Button>
                  <Button variant="outlined" color="error" startIcon={<RejectIcon />} onClick={() => onReject(payment)}>
                    Reject
                  </Button>
                </Stack>
              )}
            </Box>
          </Box>
        );
      })}
    </SectionCard>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Box>
    <Typography variant="caption" component="div" sx={{ color: 'text.secondary', mb: 0.25 }}>
      {label}
    </Typography>
    {children}
  </Box>
);
