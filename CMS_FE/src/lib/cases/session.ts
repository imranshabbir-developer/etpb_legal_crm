import type { AuthUser } from "@/lib/api/auth";
import type { AppUser, SessionUser, UserRole } from "@/lib/cases/types";

const SESSION_KEY = "ips.session";
const TOKEN_KEY = "ips.token";

/** Demo credentials used only to prefill the login form for seeded users. */
export const DEMO_PASSWORDS: Record<UserRole, string> = {
  "super-admin": "SuperAdmin@123",
  admin: "Admin@123",
  staff: "Staff@123",
};

export const DEMO_USERS: AppUser[] = [
  {
    id: "u-sa",
    name: "Super Admin",
    email: "superadmin@ips.gov.pk",
    role: "super-admin",
    status: "Active",
  },
  {
    id: "u-ad",
    name: "IPS Admin",
    email: "admin@ips.gov.pk",
    role: "admin",
    status: "Active",
  },
  {
    id: "u-st",
    name: "Case Staff",
    email: "staff@ips.gov.pk",
    role: "staff",
    status: "Active",
  },
  {
    id: "u-st2",
    name: "Records Officer",
    email: "records@ips.gov.pk",
    role: "staff",
    status: "Active",
  },
];

export function roleDemoUser(role: UserRole): SessionUser {
  const found = DEMO_USERS.find((u) => u.role === role)!;
  return {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
    roleName: found.name,
    permissions: [],
  };
}

export function toSessionUser(user: AuthUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleName: user.roleName,
    permissions: user.permissions || [],
  };
}

export function saveSession(user: SessionUser, token?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
}

export function readSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
