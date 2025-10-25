"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  Register: (userData: { name: string; email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize token & user from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  // Set axios auth header whenever token changes
  useEffect(() => {
    if (token) {
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete authAPI.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Redirect to login if no token and not loading
  useEffect(() => {
    if (!loading && !token) {
      toast.error("Please login to continue");
      router.push("/login");
    }
  }, [loading, token, router]);

  // Login
  const login: AuthContextType['login'] = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.post('/auth/login', { email, password });
      const { tokens, user: userData } = response.data;

      if (tokens && userData) {
        setToken(tokens.accessToken);
        setUser(userData);

        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));

        toast.success('Logged in successfully');
        return { success: true };
      }
      return { success: false, message: response.data?.message };
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to login');
      return { success: false, message: err.response?.data?.message || 'Failed to login' };
    } finally {
      setLoading(false);
    }
  };

  // Register
  const Register: AuthContextType['Register'] = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.post('/auth/signup', userData);
      if (response.data?.user) {
        toast.success('Registered successfully. Please login.');
        return { success: true };
      }
      return { success: false, message: response.data?.message };
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete authAPI.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
    router.push("/login");
  };

  // Refresh token
  const refreshToken = async (): Promise<string | undefined> => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) return undefined;

      const response = await authAPI.post('/auth/refresh', { refreshToken: storedRefreshToken });
      if (response.data?.accessToken) {
        setToken(response.data.accessToken);
        localStorage.setItem('accessToken', response.data.accessToken);
        return response.data.accessToken;
      }
    } catch (err) {
      console.error('Refresh token failed', err);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, Register, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};
