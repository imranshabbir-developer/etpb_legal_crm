import { apiRequest } from "@/lib/api/client";
import type { CaseCategory, CaseRecord, CourtLayer } from "@/lib/cases/types";

export type CasesQuery = {
  layer?: CourtLayer;
  courtId?: string;
  category?: CaseCategory;
  q?: string;
  page?: number;
  limit?: number;
};

export type CasesPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type CasesListResult = {
  items: CaseRecord[];
  pagination?: CasesPagination;
};

function toQuery(params?: CasesQuery) {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.layer) search.set("layer", params.layer);
  if (params.courtId) search.set("courtId", params.courtId);
  if (params.category) search.set("category", params.category);
  if (params.q) search.set("q", params.q);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function normalizeList(
  data: CaseRecord[] | { items: CaseRecord[]; pagination?: CasesPagination },
): CasesListResult {
  if (Array.isArray(data)) return { items: data };
  return {
    items: Array.isArray(data.items) ? data.items : [],
    pagination: data.pagination,
  };
}

/** List cases. When `page`/`limit` are set, uses server pagination. */
export async function fetchCases(token: string, params?: CasesQuery) {
  const data = await apiRequest<CaseRecord[] | { items: CaseRecord[]; pagination?: CasesPagination }>(
    `/cases${toQuery(params)}`,
    { token },
  );
  return normalizeList(data);
}

/** Load every page via `?page=&limit=` so FE uses the paginated API while keeping a full live set. */
export async function fetchAllCases(token: string, params?: Omit<CasesQuery, "page" | "limit">) {
  const limit = 100;
  const first = await fetchCases(token, { ...params, page: 1, limit });
  if (!first.pagination || first.pagination.pages <= 1) {
    return first.items;
  }

  const pages = first.pagination.pages;
  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) =>
      fetchCases(token, { ...params, page: index + 2, limit }),
    ),
  );
  return [...first.items, ...rest.flatMap((page) => page.items)];
}

export function fetchCaseById(token: string, id: string) {
  return apiRequest<CaseRecord>(`/cases/${encodeURIComponent(id)}`, { token });
}

export function createCaseApi(
  token: string,
  payload: Omit<CaseRecord, "id" | "srNo"> & { id?: string; srNo?: number },
) {
  return apiRequest<CaseRecord>("/cases", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateCaseApi(token: string, id: string, patch: Partial<CaseRecord>) {
  return apiRequest<CaseRecord>(`/cases/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(patch),
  });
}

export function deleteCaseApi(token: string, id: string) {
  return apiRequest<{ id: string }>(`/cases/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
  });
}

export function deleteCasesApi(token: string, ids: string[]) {
  return apiRequest<{ removed: number }>("/cases", {
    method: "DELETE",
    token,
    body: JSON.stringify({ ids }),
  });
}

export function clearCourtCategoryApi(token: string, courtId: string, category: CaseCategory) {
  const qs = new URLSearchParams({ courtId, category });
  return apiRequest<{ removed: number }>(`/cases?${qs.toString()}`, {
    method: "DELETE",
    token,
  });
}
