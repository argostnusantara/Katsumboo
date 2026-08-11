// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserSession } from '../types/auth';
import type { UserAccount } from '../types';

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserAccount | null;
  token: string | null;
  loginGlobal: (session: UserSession) => void;
  logoutGlobal: () => void;
  updateUserGlobal: (updatedUser: UserAccount) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'katsumboo_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const syncSession = () => {
      // Prioritize sessionStorage (tab-isolated) over localStorage
      const rawSession = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      if (rawSession) {
        try {
          const session: any = JSON.parse(rawSession);
          const validToken = session?.token || session?.accessToken;
          if (session && session.user && validToken) {
            const validRole = String(session.user.role || 'customer').toLowerCase() as 'customer' | 'admin';
            const normalizedUser: UserAccount = {
              ...session.user,
              role: validRole,
              name: session.user.name || session.user.email?.split('@')[0] || 'User',
            };
            setIsLoggedIn(true);
            setUser(normalizedUser);
            setToken(validToken);
            // Ensure current tab's sessionStorage holds this session
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
          } else {
            sessionStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(SESSION_KEY);
            setIsLoggedIn(false);
            setUser(null);
            setToken(null);
          }
        } catch (e) {
          console.error('Failed to parse user session', e);
          sessionStorage.removeItem(SESSION_KEY);
          localStorage.removeItem(SESSION_KEY);
          setIsLoggedIn(false);
          setUser(null);
          setToken(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    syncSession();
    // Do NOT add window.addEventListener('storage', ...) so that tabs don't overwrite each other's session!
  }, []);

  const loginGlobal = (session: UserSession) => {
    setIsLoggedIn(true);
    setUser(session.user);
    setToken(session.token);
    // Save to tab-isolated sessionStorage so each tab can maintain its own role (User vs Admin)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  };

  const logoutGlobal = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  };

  const updateUserGlobal = (updatedUser: UserAccount) => {
    setUser(updatedUser);
    const rawSession = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (rawSession) {
      try {
        const session: UserSession = JSON.parse(rawSession);
        session.user = updatedUser;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } catch (e) {
        console.error('Failed to update persisted user session', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, loginGlobal, logoutGlobal, updateUserGlobal, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};