import { apiRequest } from "@/lib/api/client";
import type { UserRole } from "@/lib/cases/types";

export type ApiRole = {
  id: string;
  name: string;
  slug: UserRole;
  description: string | null;
  permissions: string[];
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Inactive";
  role: UserRole;
  roleName: string;
  permissions: string[];
};

export type LoginResponse = {
  token: string;
  tokenType: string;
  expiresIn: string;
  user: AuthUser;
};

export function fetchRoles() {
  return apiRequest<ApiRole[]>("/roles");
}

export function loginRequest(payload: { email: string; password: string; role?: UserRole }) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMe(token: string) {
  return apiRequest<AuthUser>("/auth/me", { token });
}
