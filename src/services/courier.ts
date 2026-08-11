import { apiClient } from './apiClient';

export const courierService = {
  getCouriers: async (): Promise<any[]> => {
    return apiClient.get('/shipping/couriers');
  },
  createCourier: async (data: { name: string; phone: string; vehicleType: string; isActive?: boolean }): Promise<any> => {
    return apiClient.post('/shipping/couriers', data);
  },
  updateCourier: async (id: string, data: any): Promise<any> => {
    return apiClient.put(`/shipping/couriers/${id}`, data);
  },
  deleteCourier: async (id: string): Promise<any> => {
    return apiClient.delete(`/shipping/couriers/${id}`);
  }
};
