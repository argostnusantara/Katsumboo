// src/types/order.ts
import type { CartItem } from './cart';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  grandTotal: number;
  paymentMethod: 'BCA Transfer' | 'SeaBank Transfer' | 'QRIS' | 'GoPay' | 'ShopeePay';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  status: 'Pending' | 'Cooking' | 'Shipping' | 'Completed' | 'Cancelled';
  date: string;
  courierName?: string;
  courierPhone?: string;
  distanceKm?: number;
  mapCoords?: { x: number; y: number };
  platform: 'Katsumboo Direct' | 'GoFood' | 'ShopeeFood';
  voucherCode?: string;
  statusTimestamps?: {
    pending?: string;
    cooking?: string;
    shipping?: string;
    completed?: string;
  };
  reviews?: {
    rating: number;
    comment: string;
    date: string;
  };
}

export interface Voucher {
  id: string;
  code: string;
  type: 'fixed' | 'percent' | 'free_shipping';
  value: number;
  minPurchase: number;
  description: string;
  maxUses: number;
  usedByUserIds: string[];
  sentToUserIds: string[];
  createdAt: string;
  expiresAt?: string;
}
