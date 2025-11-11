import { validateToken } from '@/api/auth';
import type { User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type RoleName = 'DRIVER' | 'PUMP_ATTENDANT' | 'ADMIN' | 'OMC_ADMIN' | null;

interface AuthState {
  user: User | null;
  token: string | null;
  role: RoleName;
  setAuth: (payload: { user: User | null; token: string | null }) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEYS = {
  token: 'access_token',
  user: 'user',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.token),
          AsyncStorage.getItem(STORAGE_KEYS.user),
        ]);
        
        if (t && u) {
          // If we have both token and user data, set them and validate later
          setToken(t);
          setUser(JSON.parse(u));
          
          // Validate token in background (don't block loading)
          validateTokenInBackground(t);
        } else if (t) {
          // Only token exists, clear it
          await AsyncStorage.removeItem(STORAGE_KEYS.token);
        } else if (u) {
          // Only user data exists, clear it
          await AsyncStorage.removeItem(STORAGE_KEYS.user);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const validateTokenInBackground = async (token: string) => {
    try {
      // Set the token for this request
      const api = (await import('@/api/index')).default;
      api.defaults.headers.Authorization = `Bearer ${token}`;
      
      // Use the validate endpoint to check token validity
      const validation = await validateToken();
      if (validation.success) {
        console.log('Token validation successful');
        // Update user data with fresh data from backend
        setUser(validation.user);
      } else {
        throw new Error('Token validation failed');
      }
    } catch (error) {
      // Token validation failed, clear storage
      console.log('Token validation failed, clearing storage');
      await AsyncStorage.multiRemove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
      setToken(null);
      setUser(null);
    }
  };

  const setAuth = async ({ user, token }: { user: User | null; token: string | null }) => {
    setUser(user);
    setToken(token);
    if (token) await AsyncStorage.setItem(STORAGE_KEYS.token, token);
    else await AsyncStorage.removeItem(STORAGE_KEYS.token);
    if (user) await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    else await AsyncStorage.removeItem(STORAGE_KEYS.user);
  };

  const logout = async () => {
    await setAuth({ user: null, token: null });
  };

  const value = useMemo<AuthState>(() => ({
    user,
    token,
    role: user?.role?.name ?? null,
    setAuth,
    logout,
    loading,
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
