import { apiClient } from './apiClient';
import type { UserAccount } from '../types';

export const authService = {
  // Real Google Sign-In backend integration
  loginWithGoogleReal: async (credential: string): Promise<{ user: UserAccount; token: string; refreshToken: string }> => {
    const data: any = await apiClient.post('/auth/google', { credential });
    return { user: data.user, token: data.accessToken || data.token, refreshToken: data.refreshToken };
  },

  // Legacy fallback (redirect to google OAuth)
  loginWithGoogle: async (): Promise<{ user: UserAccount; token: string; refreshToken: string }> => {
    throw new Error('Metode login Google lama tidak didukung. Harap gunakan tombol Google resmi.');
  },

  login: async (email: string, password: string): Promise<{ user: UserAccount; token: string; refreshToken: string }> => {
    const data: any = await apiClient.post('/auth/login', { email, password });
    return { user: data.user, token: data.accessToken || data.token, refreshToken: data.refreshToken };
  },

  register: async (name: string, email: string, phone: string, address: string, password: string): Promise<{ user: UserAccount; token: string; refreshToken: string }> => {
    const data: any = await apiClient.post('/auth/register', { name, email, phone, address, password });
    return { user: data.user, token: data.accessToken || data.token, refreshToken: data.refreshToken };
  },

  updateProfile: async (_userId: string, name: string, phone: string, address: string, avatar?: string): Promise<UserAccount> => {
    const data: any = await apiClient.patch('/users/me', { name, phone, address, avatar });
    return data;
  }
};
