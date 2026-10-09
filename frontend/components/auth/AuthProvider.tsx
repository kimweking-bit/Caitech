"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchMe, loginUser, registerUser } from "@/lib/api/auth";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth/tokens";
import type { AuthUser, RegisterPayload } from "@/types/api";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const access = getAccessToken();
    if (!access && !getRefreshToken()) {
      setUser(null);
      return;
    }
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      setUser(null);
      clearTokens();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!getAccessToken() && !getRefreshToken()) {
          if (!cancelled) setUser(null);
          return;
        }
        const me = await fetchMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) {
          setUser(null);
          clearTokens();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const onClear = () => {
      setUser(null);
      clearTokens();
    };
    window.addEventListener("caitech:auth-cleared", onClear);
    return () => {
      cancelled = true;
      window.removeEventListener("caitech:auth-cleared", onClear);
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const tokens = await loginUser(username, password);
    setTokens(tokens.access, tokens.refresh);
    const me = await fetchMe();
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await registerUser(payload);
    // Backend returns user only — login next
    const tokens = await loginUser(payload.username, payload.password);
    setTokens(tokens.access, tokens.refresh);
    const me = await fetchMe();
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
