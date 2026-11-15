export type OrderStatus = 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING_VERIFICATION' | 'PAID' | 'REJECTED' | 'REFUNDED';
export type PaymentMethodType = 'BKASH' | 'NAGAD' | 'ROCKET';
export type PaymentRecordStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface AdminRef {
  id: string;
  name: string | null;
  email: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  country: string | null;
  createdAt: string;
  updatedAt: string;
  orderCount?: number;
  totalSpent?: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  planId: string | null;
  productName: string;
  productSlug: string;
  productImgUrl: string | null;
  planName: string;
  planDurationDays: number | null;
  planValidity: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  deliveryDetails: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethodType;
  senderNumber: string;
  trxId: string;
  amount: number;
  status: PaymentRecordStatus;
  verifiedById: string | null;
  verifiedBy?: AdminRef | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string | null;
  changedBy?: AdminRef | null;
  createdAt: string;
}

export interface OrderSummary {
  id: string;
  seq: number;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  country: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  currency: string;
  subtotal: number;
  discount: number;
  total: number;
  customerNote: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  deliveredAt: string | null;
  cancelledAt: string | null;
  items: Pick<OrderItem, 'id' | 'productName' | 'planName' | 'quantity' | 'deliveredAt'>[];
  payments: Pick<Payment, 'id' | 'method' | 'trxId' | 'senderNumber' | 'status'>[];
}

export interface OrderDetail extends Omit<OrderSummary, 'items' | 'payments'> {
  customer: Customer;
  items: OrderItem[];
  payments: Payment[];
  statusHistory: OrderStatusHistoryEntry[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type StatusCounts = Record<OrderStatus | 'ALL', number>;

export interface OrderListQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  method?: PaymentMethodType;
  search?: string;
  from?: string;
  to?: string;
  sortOrder?: 'asc' | 'desc';
  customerId?: string;
}

export interface OrderListResponse {
  success: boolean;
  data: OrderSummary[];
  statusCounts: StatusCounts;
  pagination: Pagination;
}

export interface PaymentWithOrder extends Payment {
  order: Pick<
    OrderSummary,
    'id' | 'orderNumber' | 'customerName' | 'customerEmail' | 'customerPhone' | 'total' | 'status' | 'paymentStatus'
  >;
}

export interface CustomerDetail extends Customer {
  orders: (Omit<OrderSummary, 'items' | 'payments'> & {
    items: Pick<OrderItem, 'productName' | 'planName' | 'quantity'>[];
  })[];
}

export interface PaymentMethodConfig {
  id: string;
  method: PaymentMethodType;
  accountNumber: string;
  accountType: string;
  instructions: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsSeriesPoint {
  date: string;
  orders: number;
  paidOrders: number;
  revenue: number;
}

export interface DashboardAnalytics {
  range: { from: string; to: string; days: number; timezone: string; previous: { from: string; to: string } };
  currency: string;
  summary: {
    totalOrders: number;
    paidOrders: number;
    revenue: number;
    cancelledOrders: number;
    uniqueCustomers: number;
    averageOrderValue: number;
    newCustomers: number;
  };
  trends: {
    totalOrders: number | null;
    revenue: number | null;
    paidOrders: number | null;
    averageOrderValue: number | null;
  };
  pendingPaymentVerifications: number;
  series: AnalyticsSeriesPoint[];
  ordersByStatus: Record<OrderStatus, number>;
  paymentMethods: { method: PaymentMethodType; count: number; amount: number }[];
  topProducts: { productId: string | null; productName: string; quantity: number; revenue: number }[];
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}
