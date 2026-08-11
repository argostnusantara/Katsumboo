// src/types/inbox.ts

export interface InboxMessage {
  id: string;
  userId: string;       // target user ID, or 'all' for broadcast
  type: 'voucher' | 'info' | 'promo';
  title: string;
  body: string;
  voucherCode?: string;
  isRead: boolean;
  createdAt: string;
}
