const API_BASE = (import.meta.env["VITE_API_URL"] || "http://127.0.0.1:4000/api").replace(/\/$/, "");

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  details?: unknown;
};

export class ApiClientError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });

  const body = (await res.json().catch(() => ({}))) as ApiResponse<T> & { message?: string };
  if (!res.ok || body.success === false) {
    throw new ApiClientError(res.status, body.message || "Request failed", body.details);
  }

  return body.data;
}

export { API_BASE };
