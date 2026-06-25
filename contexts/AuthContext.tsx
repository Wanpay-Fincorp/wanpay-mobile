import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '@/lib/api';
import type { User as AppUser } from '@/lib/types';

const TOKEN_KEY = 'wanpay_access_token';
const REFRESH_KEY = 'wanpay_refresh_token';
const USER_KEY = 'wanpay_user';

interface AuthContextType {
  user: AppUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string, refreshToken: string | undefined, user: AppUser) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (storedToken) setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch {
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (accessToken: string, refreshToken: string | undefined, appUser: AppUser) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, accessToken),
      refreshToken ? SecureStore.setItemAsync(REFRESH_KEY, refreshToken) : Promise.resolve(),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(appUser)),
    ]);
    setToken(accessToken);
    setUser(appUser);
  }, []);

  const signOut = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await api.get<AppUser>('/users/me');
      setUser(userData);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
    } catch {
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
