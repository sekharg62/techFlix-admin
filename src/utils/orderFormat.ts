import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { OrderStatus, PaymentMethodType, PaymentRecordStatus, PaymentStatus } from '../types/order';

dayjs.extend(relativeTime);

const bdt = new Intl.NumberFormat('en-BD', { maximumFractionDigits: 2 });

export const formatBDT = (value: number | null | undefined) => `৳${bdt.format(Number(value || 0))}`;

export const formatCompactBDT = (value: number) => {
  if (Math.abs(value) >= 100000) return `৳${(value / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  if (Math.abs(value) >= 1000) return `৳${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `৳${value}`;
};

export const formatDateTime = (value?: string | null) => (value ? dayjs(value).format('DD MMM YYYY, h:mm A') : '—');
export const formatDate = (value?: string | null) => (value ? dayjs(value).format('DD MMM YYYY') : '—');
export const fromNow = (value?: string | null) => (value ? dayjs(value).fromNow() : '');

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; color: ChipColor; description: string }> = {
  PENDING: { label: 'Pending', color: 'warning', description: 'Waiting for payment verification' },
  PROCESSING: { label: 'Processing', color: 'info', description: 'Paid — preparing license keys' },
  DELIVERED: { label: 'Delivered', color: 'success', description: 'All items delivered to the customer' },
  CANCELLED: { label: 'Cancelled', color: 'default', description: 'Order was cancelled' },
  REFUNDED: { label: 'Refunded', color: 'secondary', description: 'Payment returned to the customer' },
};

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; color: ChipColor }> = {
  PENDING_VERIFICATION: { label: 'Awaiting verification', color: 'warning' },
  PAID: { label: 'Paid', color: 'success' },
  REJECTED: { label: 'Rejected', color: 'error' },
  REFUNDED: { label: 'Refunded', color: 'secondary' },
};

export const PAYMENT_RECORD_META: Record<PaymentRecordStatus, { label: string; color: ChipColor }> = {
  PENDING: { label: 'Pending', color: 'warning' },
  VERIFIED: { label: 'Verified', color: 'success' },
  REJECTED: { label: 'Rejected', color: 'error' },
};

export const PAYMENT_METHOD_META: Record<PaymentMethodType, { label: string; color: string }> = {
  BKASH: { label: 'bKash', color: '#E2136E' },
  NAGAD: { label: 'Nagad', color: '#F6921E' },
  ROCKET: { label: 'Rocket', color: '#8C3494' },
};

/** Status changes an admin may pick manually (mirrors the backend workflow). */
export const nextStatuses = (status: OrderStatus, paymentStatus: PaymentStatus): OrderStatus[] => {
  switch (status) {
    case 'PENDING':
      return ['CANCELLED']; // PROCESSING happens by verifying the payment
    case 'PROCESSING':
      return ['DELIVERED', 'CANCELLED'];
    case 'DELIVERED':
      return ['REFUNDED'];
    case 'CANCELLED':
      return paymentStatus === 'PAID' ? ['REFUNDED'] : []; // paid, then cancelled → money must be returned
    default:
      return [];
  }
};

export const ORDER_FLOW: OrderStatus[] = ['PENDING', 'PROCESSING', 'DELIVERED'];

/** "Mobile · 3 Months" when the item was bought from a product variant, otherwise just the plan name. */
export const itemPlanLabel = (item: { variantName?: string | null; planName: string }) =>
  item.variantName ? `${item.variantName} · ${item.planName}` : item.planName;
