import React from 'react';
import { Alert, Box, Step, StepLabel, Stepper, Typography } from '@mui/material';
import type { OrderDetail, OrderStatus } from '../../types/order';
import { formatDateTime } from '../../utils/orderFormat';
import { SectionCard } from '../common/SectionCard';
import { LocalShipping as TrackIcon } from '@mui/icons-material';

const firstTimeReached = (order: OrderDetail, status: OrderStatus) =>
  order.statusHistory.find((h) => h.toStatus === status)?.createdAt ?? null;

/** Visual tracker: Placed → Payment verified → Delivering → Delivered. */
export const OrderProgressTracker: React.FC<{ order: OrderDetail }> = ({ order }) => {
  const deliveredCount = order.items.filter((i) => i.deliveredAt).length;
  const verifiedPayment = order.payments.find((p) => p.status === 'VERIFIED');
  const reachedProcessing = Boolean(firstTimeReached(order, 'PROCESSING'));
  const reachedDelivered = Boolean(firstTimeReached(order, 'DELIVERED'));

  // How far the order got along the happy path
  let progress = 1; // order placed
  if (reachedProcessing || order.paymentStatus === 'PAID') progress = 2;
  if (reachedProcessing && deliveredCount > 0) progress = 3;
  if (reachedDelivered) progress = 4;

  const terminated = order.status === 'CANCELLED' || order.status === 'REFUNDED';
  const paymentRejected = order.status === 'PENDING' && order.paymentStatus === 'REJECTED';

  const steps = [
    { label: 'Order placed', caption: formatDateTime(order.createdAt) },
    {
      label: paymentRejected ? 'Payment rejected' : progress >= 2 ? 'Payment verified' : 'Verify payment',
      caption: verifiedPayment?.verifiedAt
        ? formatDateTime(verifiedPayment.verifiedAt)
        : paymentRejected
          ? 'Waiting for customer to resend'
          : 'Awaiting verification',
      error: paymentRejected,
    },
    {
      label: 'Delivering keys',
      caption: `${deliveredCount} of ${order.items.length} item${order.items.length === 1 ? '' : 's'} delivered`,
    },
    { label: 'Delivered', caption: order.deliveredAt ? formatDateTime(order.deliveredAt) : 'Not yet' },
  ];

  return (
    <SectionCard title="Order tracking" icon={<TrackIcon fontSize="small" />}>
      {terminated && (
        <Alert severity={order.status === 'CANCELLED' ? 'warning' : 'info'} sx={{ mb: 2.5, borderRadius: '10px' }}>
          This order was <strong>{order.status === 'CANCELLED' ? 'cancelled' : 'refunded'}</strong>
          {order.status === 'CANCELLED' && order.cancelledAt ? ` on ${formatDateTime(order.cancelledAt)}` : ''}.
          {order.status === 'CANCELLED' && order.paymentStatus === 'PAID'
            ? ' The payment was already verified — return the money and mark the order as refunded.'
            : ''}
          {(() => {
            const note = [...order.statusHistory].reverse().find((h) => h.toStatus === order.status)?.note;
            return note ? ` Reason: ${note}` : '';
          })()}
        </Alert>
      )}
      <Stepper activeStep={progress} alternativeLabel sx={{ opacity: terminated ? 0.6 : 1 }}>
        {steps.map((step, index) => (
          <Step key={step.label} completed={index < progress}>
            <StepLabel
              error={step.error}
              optional={
                <Typography variant="caption" component="div" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                  {step.caption}
                </Typography>
              }
            >
              <Box component="span" sx={{ fontWeight: 600 }}>
                {step.label}
              </Box>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </SectionCard>
  );
};
