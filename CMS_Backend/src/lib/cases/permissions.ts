import type { UserRole } from "@/lib/cases/types";

export const ROLE_LABELS: Record<UserRole, string> = {
  "super-admin": "Super Admin",
  admin: "Admin",
  staff: "Staff",
};

export type Permission =
  | "cases:view"
  | "cases:create"
  | "cases:edit"
  | "cases:delete"
  | "users:view"
  | "users:manage-staff"
  | "users:manage-admin"
  | "settings:view"
  | "settings:manage"
  | "modules:configure";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  staff: ["cases:view", "cases:edit", "settings:view"],
  admin: [
    "cases:view",
    "cases:create",
    "cases:edit",
    "cases:delete",
    "users:view",
    "users:manage-staff",
    "users:manage-admin",
    "settings:view",
    "settings:manage",
    "modules:configure",
  ],
  "super-admin": [
    "cases:view",
    "cases:create",
    "cases:edit",
    "cases:delete",
    "users:view",
    "users:manage-staff",
    "users:manage-admin",
    "settings:view",
    "settings:manage",
    "modules:configure",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canManageRole(actor: UserRole, target: UserRole): boolean {
  if (actor === "super-admin") return target !== "super-admin";
  if (actor === "admin") return target === "staff" || target === "admin";
  return false;
}
