import { apiClient } from './apiClient';

export const userService = {
  getUsers: async (): Promise<any[]> => {
    return apiClient.get('/users');
  }
};
