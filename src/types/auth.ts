// src/types/auth.ts
import type { User } from './user';

export interface UserSession {
  token: string;
  user: User;
}

export interface AuthState {
  isLoggedIn: boolean;
  session: UserSession | null;
  loading: boolean;
  error: string | null;
}