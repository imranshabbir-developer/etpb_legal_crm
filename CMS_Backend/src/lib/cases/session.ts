import type { AppUser, SessionUser, UserRole } from "@/lib/cases/types";

const SESSION_KEY = "ips.session";

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
  return { name: found.name, email: found.email, role: found.role };
}

export function saveSession(user: SessionUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
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
