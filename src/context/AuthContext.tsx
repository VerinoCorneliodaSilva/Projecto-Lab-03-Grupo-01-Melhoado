import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { authApi, userApi, ApiResponse } from '../services/api';
import { UserRecord } from '../services/database';

interface AuthContextType {
  user: UserRecord | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<ApiResponse>;
  register: (name: string, email: string, password: string) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateBalance: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Recuperar sessão ao carregar
  useEffect(() => {
    const restore = async () => {
      const storedToken = localStorage.getItem('cn_token');
      if (storedToken) {
        const result = await authApi.validateSession(storedToken);
        if (result.success && result.data) {
          setUser(result.data);
          setToken(storedToken);
        } else {
          localStorage.removeItem('cn_token');
        }
      }
      setIsLoading(false);
    };
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    if (result.success && result.data) {
      setUser(result.data.user);
      setToken(result.data.token);
      localStorage.setItem('cn_token', result.data.token);
    }
    return result;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await authApi.register(name, email, password);
    if (result.success && result.data) {
      setUser(result.data.user);
      setToken(result.data.token);
      localStorage.setItem('cn_token', result.data.token);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      await authApi.logout(token);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('cn_token');
  }, [token]);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    const result = await userApi.getProfile(user.id);
    if (result.success && result.data) {
      setUser(result.data);
    }
  }, [user]);

  const updateBalance = useCallback(async (amount: number) => {
    if (!user) return;
    const result = await userApi.updateBalance(user.id, amount);
    if (result.success && result.data) {
      setUser(result.data);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
