import { apiClient } from './apiClient';

export const paymentService = {
  simulatePayment: async (method: string, amount: number, orderId: string): Promise<{ success: boolean; transactionId: string }> => {
    return apiClient.post('/payments/charge', { orderId, amount, method });
  }
};
