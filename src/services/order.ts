import { apiClient } from './apiClient';
import type { Order, Voucher } from '../types';

// ─── Helper: Normalize backend order response to frontend Order type ───────────
// Backend returns 'orderItems' but frontend type uses 'items'
const normalizeOrder = (raw: any): Order => {
  return {
    ...raw,
    items: Array.isArray(raw.items)
      ? raw.items
      : Array.isArray(raw.orderItems)
        ? raw.orderItems
        : [],
    status: raw.status || 'Pending',
    paymentStatus: raw.paymentStatus || 'Pending',
    subtotal: raw.subtotal ?? 0,
    discount: raw.discount ?? 0,
    shippingFee: raw.shippingFee ?? 0,
    grandTotal: raw.grandTotal ?? 0,
  };
};

const normalizeOrders = (rawList: any[]): Order[] => {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(normalizeOrder);
};

export const orderService = {
  getOrders: async (): Promise<Order[]> => {
    const data = await apiClient.get('/orders/my');
    return normalizeOrders(data as any);
  },

  getOrderById: async (id: string): Promise<Order> => {
    const data = await apiClient.get(`/orders/${id}`);
    return normalizeOrder(data);
  },

  getAllOrdersAdmin: async (): Promise<Order[]> => {
    const data = await apiClient.get('/orders');
    return normalizeOrders(data as any);
  },

  createOrder: async (orderData: Omit<Order, 'id' | 'date'>): Promise<Order> => {
    const data = await apiClient.post('/orders', orderData);
    return normalizeOrder(data);
  },

  updateOrderStatus: async (orderId: string, status: Order['status'], courierName?: string, courierPhone?: string): Promise<boolean> => {
    await apiClient.patch(`/orders/${orderId}/status`, { status, courierName, courierPhone });
    return true;
  },

  submitOrderReview: async (orderId: string, rating: number, comment: string): Promise<boolean> => {
    await apiClient.post(`/orders/${orderId}/review`, { rating, comment });
    return true;
  },

  getVouchers: async (): Promise<Voucher[]> => {
    // Vouchers can be visible via backend /coupons
    return apiClient.get('/coupons');
  },

  createVoucher: async (voucher: Voucher): Promise<Voucher> => {
    return apiClient.post('/coupons', voucher);
  },

  validateVoucher: async (code: string, subtotal: number): Promise<{ valid: boolean; discount: number; coupon: any }> => {
    return apiClient.get(`/coupons/validate?code=${code}&subtotal=${subtotal}`);
  },

  sendVoucherToUserInbox: async (couponId: string, userId: string): Promise<void> => {
    await apiClient.post(`/coupons/${couponId}/send`, { userId });
  }
};
