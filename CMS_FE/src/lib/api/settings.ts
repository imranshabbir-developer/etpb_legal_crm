import { apiRequest } from "@/lib/api/client";
import type { UserRole } from "@/lib/cases/types";

export type SettingsProfile = {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Inactive";
  role: UserRole;
  roleName: string | null;
  permissions: string[];
};

export type ModuleFlags = {
  showInternalModule: boolean;
  showExternalModule: boolean;
  showChartsModule: boolean;
};

export function fetchSettingsProfile(token: string) {
  return apiRequest<SettingsProfile>("/settings/profile", { token });
}

export function updateSettingsProfile(
  token: string,
  payload: { name?: string; email?: string },
) {
  return apiRequest<SettingsProfile>("/settings/profile", {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateSettingsPassword(
  token: string,
  payload: { currentPassword: string; newPassword: string },
) {
  return apiRequest<{ changed: boolean }>("/settings/password", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function fetchModules(token: string) {
  return apiRequest<ModuleFlags>("/settings/modules", { token });
}

export function updateModules(token: string, payload: ModuleFlags) {
  return apiRequest<ModuleFlags>("/settings/modules", {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}
