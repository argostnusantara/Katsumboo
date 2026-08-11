// src/types/user.ts

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'admin';
  createdAt?: string;
  password?: string;
  avatar?: string; // Base64 data URL
}

export type UserAccount = User;