import { apiRequest } from "@/lib/api/client";
import type { CaseCategory, CourtLayer } from "@/lib/cases/types";

export type ReminderType =
  | "overdue"
  | "hearing"
  | "pending"
  | "restraining"
  | "direction"
  | "decided";

export type ReminderTiming =
  | "overdue"
  | "today"
  | "tomorrow"
  | "two-days"
  | "upcoming"
  | "missing";

export type ReminderItem = {
  id: string;
  type: ReminderType;
  title: string;
  body: string;
  caseId: string;
  caseNo: string;
  courtId: string;
  layer: CourtLayer;
  caseCategory: CaseCategory;
  nextDateOfHearing: string;
  dueInDays: number | null;
  timing: ReminderTiming;
  dueLabel: string;
};

export type RemindersPayload = {
  daysAhead: number;
  counts: {
    total: number;
    overdue: number;
    hearing: number;
    pending: number;
    restraining: number;
    direction: number;
    today: number;
    tomorrow: number;
    inTwoDays: number;
    upcoming: number;
  };
  items: ReminderItem[];
};

export function fetchReminders(
  token: string,
  params?: { daysAhead?: number; limit?: number },
) {
  const search = new URLSearchParams();
  if (params?.daysAhead) search.set("daysAhead", String(params.daysAhead));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return apiRequest<RemindersPayload>(`/reminders${qs ? `?${qs}` : ""}`, { token });
}
