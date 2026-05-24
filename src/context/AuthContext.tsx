import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { httpClient } from '../services/http';
import { loginUser, logoutUser, registerUser, validateAuthToken, type AuthUser } from '../services/authApi';

export interface AuthenticatedUser extends AuthUser {
  name: string;
  balance: number;
}

interface AuthContextType {
  user: AuthenticatedUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  validateToken: () => Promise<boolean>;
  updateBalance: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapAuthenticatedUser(user: AuthUser): AuthenticatedUser {
  return {
    ...user,
    id: String(user.id),
    name: user.username,
    balance: 10000,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateToken = useCallback(async () => {
    const storedToken = httpClient.getAuthToken();

    if (!storedToken) {
      setUser(null);
      setToken(null);
      return false;
    }

    const result = await validateAuthToken();

    if (result.success && result.data?.user) {
      setUser(mapAuthenticatedUser(result.data.user));
      setToken(storedToken);
      return true;
    }

    httpClient.setAuthToken(null);
    setUser(null);
    setToken(null);
    return false;
  }, []);

  useEffect(() => {
    const restore = async () => {
      setIsLoading(true);
      await validateToken();
      setIsLoading(false);
    };

    void restore();
  }, [validateToken]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser(email, password);

    if (result.success && result.data?.user && result.data?.token) {
      httpClient.setAuthToken(result.data.token);
      setToken(result.data.token);
      setUser(mapAuthenticatedUser(result.data.user));

      return {
        success: true,
        message: 'Login realizado com sucesso',
      };
    }

    return {
      success: false,
      error: result.error || 'Falha ao autenticar o usuário',
    };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await registerUser(name, email, password);

    if (result.success && result.data?.user && result.data?.token) {
      httpClient.setAuthToken(result.data.token);
      setToken(result.data.token);
      setUser(mapAuthenticatedUser(result.data.user));

      return {
        success: true,
        message: 'Cadastro realizado com sucesso',
      };
    }

    return {
      success: false,
      error: result.error || 'Falha ao registrar o usuário',
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // O logout é seguro mesmo se o endpoint não responder rapidamente.
    }

    httpClient.setAuthToken(null);
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    await validateToken();
  }, [validateToken]);

  const updateBalance = useCallback(async (amount: number) => {
    if (!user) {
      return;
    }

    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      return {
        ...currentUser,
        balance: Math.max(0, currentUser.balance + amount),
      };
    });
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      refreshUser,
      validateToken,
      updateBalance,
    }),
    [isLoading, login, logout, refreshUser, token, updateBalance, user, validateToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}

