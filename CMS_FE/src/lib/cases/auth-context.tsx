import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { fetchMe, loginRequest } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { hasPermission, type Permission } from "@/lib/cases/permissions";
import {
  clearSession,
  readSession,
  readToken,
  saveSession,
  toSessionUser,
} from "@/lib/cases/session";
import type { SessionUser, UserRole } from "@/lib/cases/types";

type AuthContextValue = {
  user: SessionUser | null;
  role: UserRole | null;
  token: string | null;
  ready: boolean;
  login: (input: { email: string; password: string; role?: UserRole }) => Promise<SessionUser>;
  logout: () => void;
  can: (permission: Permission) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() =>
    typeof window !== "undefined" ? readSession() : null,
  );
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? readToken() : null,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const existingToken = readToken();
      const existingUser = readSession();

      if (!existingToken) {
        clearSession();
        if (!cancelled) {
          setUser(null);
          setToken(null);
          setReady(true);
        }
        return;
      }

      try {
        const profile = await fetchMe(existingToken);
        if (cancelled) return;
        const nextUser = toSessionUser(profile);
        saveSession(nextUser, existingToken);
        setUser(nextUser);
        setToken(existingToken);
      } catch (error) {
        if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) {
          clearSession();
          if (!cancelled) {
            setUser(null);
            setToken(null);
          }
        } else if (existingUser) {
          // Keep cached session if API is temporarily unreachable.
          if (!cancelled) {
            setUser(existingUser);
            setToken(existingToken);
          }
        } else {
          clearSession();
          if (!cancelled) {
            setUser(null);
            setToken(null);
          }
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: { email: string; password: string; role?: UserRole }) => {
    const result = await loginRequest(input);
    const nextUser = toSessionUser(result.user);
    saveSession(nextUser, result.token);
    setUser(nextUser);
    setToken(result.token);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      token,
      ready,
      login,
      logout,
      can: (permission) => {
        if (!user) return false;
        if (user.permissions?.length) {
          return user.permissions.includes(permission);
        }
        return hasPermission(user.role, permission);
      },
    }),
    [user, token, ready, login, logout],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
