import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { hasPermission, type Permission } from "@/lib/cases/permissions";
import { clearSession, readSession, saveSession } from "@/lib/cases/session";
import type { SessionUser, UserRole } from "@/lib/cases/types";

type AuthContextValue = {
  user: SessionUser | null;
  role: UserRole | null;
  ready: boolean;
  login: (user: SessionUser) => void;
  logout: () => void;
  can: (permission: Permission) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() =>
    typeof window !== "undefined" ? readSession() : null,
  );
  const [ready, setReady] = useState(() => typeof window !== "undefined");

  useEffect(() => {
    setUser(readSession());
    setReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      ready,
      login: (next) => {
        saveSession(next);
        setUser(next);
      },
      logout: () => {
        clearSession();
        setUser(null);
      },
      can: (permission) => (user ? hasPermission(user.role, permission) : false),
    }),
    [user, ready],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
