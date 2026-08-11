import { apiClient } from './apiClient';

export const inboxService = {
  getMessages: async (): Promise<any[]> => {
    return apiClient.get('/notifications');
  },
  getUnreadCount: async (): Promise<{ count: number }> => {
    return apiClient.get('/notifications/unread-count');
  },
  markRead: async (id: string): Promise<any> => {
    return apiClient.patch(`/notifications/${id}/read`);
  },
  markAllRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },
  broadcast: async (title: string, body: string, type = 'info'): Promise<void> => {
    await apiClient.post('/notifications/broadcast', { title, body, type });
  },
  createMessage: async (msg: { type: string; title: string; body: string; voucherCode?: string }): Promise<any> => {
    return apiClient.post('/notifications', msg);
  }
};
