import type { User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type RoleName = 'DRIVER' | 'FUEL_ATTENDANT' | 'ADMIN' | null;

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
  token: 'token',
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
        if (t) setToken(t);
        if (u) setUser(JSON.parse(u));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
