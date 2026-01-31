"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";

export interface User {
  _id: string;
  name?: string;
  email: string;
  role: "user" | "admin";
  collegeName?: string;
  domain?: string;
  bio?: string;
  ratings: number;
  follower: string[];
  following: string[];
  skillsToTeach: string[];
  skillsToLearn: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  Register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  loginWithToken: (accessToken: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// Helper to safely access localStorage
const getStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
};

const setStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
};

const removeStorageItem = (key: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH CURRENT USER ---------------- */
  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await authAPI.get("/user/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- INIT AUTH ---------------- */
  useEffect(() => {
    const storedToken = getStorageItem("accessToken");

    if (storedToken) {
      setToken(storedToken);
      authAPI.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${storedToken}`;

      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [fetchCurrentUser]);

  /* ---------------- LOGIN ---------------- */
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await authAPI.post("/auth/login", { email, password });

      const { accessToken, refreshToken } = res.data.tokens;

      setStorageItem("accessToken", accessToken);
      setStorageItem("refreshToken", refreshToken);

      setToken(accessToken);
      authAPI.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;

      await fetchCurrentUser();

      toast.success("Logged in successfully");
      router.push("/");
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
      setLoading(false);
      return false;
    }
  };

  const Register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.post('/auth/signup', { name, email, password });

      if (response.data?.user) {
        toast.success('Registered successfully. Please login.');
        return { success: true };
      }

      return { success: false, message: response.data?.message || 'Registration failed' };
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = () => {
    removeStorageItem("accessToken");
    removeStorageItem("refreshToken");

    setUser(null);
    setToken(null);

    delete authAPI.defaults.headers.common["Authorization"];

    toast.success("Logged out");
    router.push("/login");
  };

  /* ---------------- REFRESH TOKEN ---------------- */
  const refreshToken = async () => {
    try {
      const storedRefreshToken = getStorageItem("refreshToken");
      if (!storedRefreshToken) return;

      const res = await authAPI.post("/auth/refresh", {
        refreshToken: storedRefreshToken,
      });

      const newAccessToken = res.data.accessToken;
      setToken(newAccessToken);

      setStorageItem("accessToken", newAccessToken);
      authAPI.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${newAccessToken}`;

      return newAccessToken;
    } catch {
      logout();
    }
  };

  /* ---------------- LOGIN WITH TOKEN ---------------- */
  const loginWithToken = useCallback(
    async (accessToken: string) => {
      const storedToken = getStorageItem("accessToken");
      if (storedToken === accessToken) return;

      setStorageItem("accessToken", accessToken);
      setToken(accessToken);
      authAPI.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;

      setLoading(true);
      await fetchCurrentUser();
      setLoading(false);
    },
    [fetchCurrentUser]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        Register,
        loginWithToken,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};