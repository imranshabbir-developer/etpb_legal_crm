import { apiRequest } from "@/lib/api/client";
import type { CaseCategory } from "@/lib/cases/types";

export type DashboardCourtCounts = {
  total: number;
  byCategory: Record<CaseCategory, number>;
};

export type DashboardTrends = {
  internal: number;
  external: number;
  pending: number;
  decided: number;
  restraining: number;
  direction: number;
  total: number;
};

export type DashboardSummary = {
  total: number;
  byLayer: { internal: number; external: number };
  byCategory: Record<CaseCategory, number>;
  byCourt: Record<string, DashboardCourtCounts>;
  monthly: { month: string; internal: number; external: number }[];
  upcomingHearings: number;
  trends: DashboardTrends;
  categorySplit: { key: CaseCategory; name: string; value: number }[];
};

export function fetchDashboardSummary(token: string) {
  return apiRequest<DashboardSummary>("/dashboard/summary", { token });
}
