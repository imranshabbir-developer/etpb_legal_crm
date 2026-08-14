import { apiRequest } from "@/lib/api/client";
import type { UserRole } from "@/lib/cases/types";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Inactive";
  role: UserRole;
  roleName: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export function fetchUsers(token: string) {
  return apiRequest<ApiUser[]>("/users", { token });
}

export function createUser(
  token: string,
  payload: {
    name: string;
    email: string;
    password: string;
    role: "admin" | "staff";
    status?: "Active" | "Inactive";
  },
) {
  return apiRequest<ApiUser>("/users", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateUserStatus(token: string, id: string, status: "Active" | "Inactive") {
  return apiRequest<ApiUser>(`/users/${id}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
}

export function updateUser(
  token: string,
  id: string,
  payload: {
    name?: string;
    email?: string;
    password?: string;
    role?: "admin" | "staff";
    status?: "Active" | "Inactive";
  },
) {
  return apiRequest<ApiUser>(`/users/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function changePassword(
  token: string,
  payload: { currentPassword: string; newPassword: string },
) {
  return apiRequest<{ changed: boolean }>("/auth/change-password", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}
