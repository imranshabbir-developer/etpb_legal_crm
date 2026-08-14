import { apiRequest } from "@/lib/api/client";
import type { CaseCategory, CourtDefinition, CourtLayer } from "@/lib/cases/types";

export type ApiCourt = CourtDefinition & {
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export function fetchCourts(layer?: CourtLayer) {
  const query = layer ? `?layer=${layer}` : "";
  return apiRequest<ApiCourt[]>(`/courts${query}`);
}

export function fetchCourtById(id: string) {
  return apiRequest<ApiCourt>(`/courts/${encodeURIComponent(id)}`);
}

export function createCourtApi(
  token: string,
  payload: {
    name: string;
    layer: CourtLayer;
    categories: CaseCategory[];
    slug?: string;
    sortOrder?: number;
  },
) {
  return apiRequest<ApiCourt>("/courts", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateCourtApi(
  token: string,
  id: string,
  payload: {
    name?: string;
    categories?: CaseCategory[];
    sortOrder?: number;
    isActive?: boolean;
  },
) {
  return apiRequest<ApiCourt>(`/courts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function toCourtDefinition(court: ApiCourt): CourtDefinition {
  return {
    id: court.id,
    name: court.name,
    layer: court.layer,
    categories: court.categories as CaseCategory[],
  };
}
