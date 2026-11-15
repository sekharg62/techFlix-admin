import React from 'react';
import { Alert, AlertTitle, Button } from '@mui/material';
import type { OrderDetail, Payment } from '../../types/order';
import { PAYMENT_METHOD_META, formatBDT } from '../../utils/orderFormat';

interface OrderNextActionProps {
  order: OrderDetail;
  onVerify: (payment: Payment) => void;
  onScrollToItems: () => void;
}

/** Tells the admin exactly what the order needs next. */
export const OrderNextAction: React.FC<OrderNextActionProps> = ({ order, onVerify, onScrollToItems }) => {
  const pendingPayment = order.payments.find((p) => p.status === 'PENDING');
  const undelivered = order.items.filter((i) => !i.deliveredAt).length;

  if (order.status === 'PENDING' && pendingPayment) {
    return (
      <Alert
        severity="warning"
        sx={{ borderRadius: '12px', alignItems: 'center' }}
        action={
          <Button color="inherit" variant="outlined" size="small" onClick={() => onVerify(pendingPayment)}>
            Review payment
          </Button>
        }
      >
        <AlertTitle sx={{ fontWeight: 700 }}>Next step: verify payment</AlertTitle>
        Check {PAYMENT_METHOD_META[pendingPayment.method].label} for {formatBDT(pendingPayment.amount)} from{' '}
        <strong>{pendingPayment.senderNumber}</strong> (TrxID <strong>{pendingPayment.trxId}</strong>).
      </Alert>
    );
  }

  if (order.status === 'PENDING' && order.paymentStatus === 'REJECTED') {
    return (
      <Alert severity="error" sx={{ borderRadius: '12px' }}>
        <AlertTitle sx={{ fontWeight: 700 }}>Waiting for the customer</AlertTitle>
        The last payment was rejected. The customer can submit a new transaction ID from the tracking page — or cancel
        the order if it should not continue.
      </Alert>
    );
  }

  if (order.status === 'PROCESSING' && undelivered > 0) {
    return (
      <Alert
        severity="info"
        sx={{ borderRadius: '12px', alignItems: 'center' }}
        action={
          <Button color="inherit" variant="outlined" size="small" onClick={onScrollToItems}>
            Go to items
          </Button>
        }
      >
        <AlertTitle sx={{ fontWeight: 700 }}>Next step: deliver {undelivered === 1 ? 'the item' : `${undelivered} items`}</AlertTitle>
        Payment is verified. Add the license key or account details for each item to complete the order.
      </Alert>
    );
  }

  if (order.status === 'DELIVERED') {
    return (
      <Alert severity="success" sx={{ borderRadius: '12px' }}>
        <AlertTitle sx={{ fontWeight: 700 }}>Order complete</AlertTitle>
        Every item has been delivered to {order.customerName}.
      </Alert>
    );
  }

  return null;
};
