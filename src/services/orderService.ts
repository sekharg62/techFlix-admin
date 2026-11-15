import { apiClient } from './apiClient';
import type {
  Customer,
  CustomerDetail,
  DashboardAnalytics,
  OrderDetail,
  OrderListQuery,
  OrderListResponse,
  OrderStatus,
  Pagination,
  PaymentMethodConfig,
  PaymentMethodType,
  PaymentRecordStatus,
  PaymentWithOrder,
  RecentOrder,
} from '../types/order';

type Envelope<T> = { success: boolean; message?: string; data: T };

const clean = <T extends object>(params?: T) =>
  params
    ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))
    : undefined;

export const orderService = {
  list: async (params?: OrderListQuery) => {
    const res = await apiClient.get<OrderListResponse>('/orders', { params: clean(params) });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<Envelope<OrderDetail>>(`/orders/${encodeURIComponent(id)}`);
    return res.data.data;
  },

  updateStatus: async (id: string, status: OrderStatus, note?: string) => {
    const res = await apiClient.patch<Envelope<OrderDetail>>(`/orders/${id}/status`, { status, note });
    return res.data.data;
  },

  updateNote: async (id: string, adminNote: string) => {
    const res = await apiClient.patch<Envelope<OrderDetail>>(`/orders/${id}/note`, { adminNote });
    return res.data.data;
  },

  deliverItem: async (orderId: string, itemId: string, deliveryDetails: string) => {
    const res = await apiClient.patch<Envelope<OrderDetail>>(`/orders/${orderId}/items/${itemId}/deliver`, {
      deliveryDetails,
    });
    return res.data.data;
  },

  remove: async (id: string) => {
    await apiClient.delete(`/orders/${id}`);
  },
};

export const paymentService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: PaymentRecordStatus;
    method?: PaymentMethodType;
    search?: string;
  }) => {
    const res = await apiClient.get<{ success: boolean; data: PaymentWithOrder[]; pagination: Pagination }>(
      '/payments',
      { params: clean(params) }
    );
    return res.data;
  },

  verify: async (paymentId: string) => {
    const res = await apiClient.patch<Envelope<OrderDetail>>(`/payments/${paymentId}/verify`);
    return res.data.data;
  },

  reject: async (paymentId: string, reason: string) => {
    const res = await apiClient.patch<Envelope<OrderDetail>>(`/payments/${paymentId}/reject`, { reason });
    return res.data.data;
  },
};

export const customerService = {
  list: async (params?: { page?: number; limit?: number; search?: string; sortOrder?: 'asc' | 'desc' }) => {
    const res = await apiClient.get<{ success: boolean; data: Customer[]; pagination: Pagination }>('/customers', {
      params: clean(params),
    });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<Envelope<CustomerDetail>>(`/customers/${id}`);
    return res.data.data;
  },

  update: async (id: string, payload: Partial<Pick<Customer, 'fullName' | 'email' | 'whatsapp' | 'country'>>) => {
    const res = await apiClient.patch<Envelope<Customer>>(`/customers/${id}`, payload);
    return res.data.data;
  },
};

export const paymentMethodService = {
  list: async () => {
    const res = await apiClient.get<Envelope<PaymentMethodConfig[]>>('/payment-methods');
    return res.data.data;
  },

  save: async (
    method: PaymentMethodType,
    payload: Pick<PaymentMethodConfig, 'accountNumber' | 'accountType' | 'isActive'> & { instructions?: string }
  ) => {
    const res = await apiClient.put<Envelope<PaymentMethodConfig>>(`/payment-methods/${method}`, payload);
    return res.data.data;
  },

  remove: async (method: PaymentMethodType) => {
    await apiClient.delete(`/payment-methods/${method}`);
  },
};

export const dashboardService = {
  analytics: async (from: string, to: string) => {
    const res = await apiClient.get<Envelope<DashboardAnalytics>>('/dashboard/analytics', { params: { from, to } });
    return res.data.data;
  },

  recentOrders: async () => {
    const res = await apiClient.get<Envelope<{ recentOrders: RecentOrder[] }>>('/dashboard/stats');
    return res.data.data.recentOrders;
  },
};
