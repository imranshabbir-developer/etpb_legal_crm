import { apiRequest } from "@/lib/api/client";
import type { CaseCategory, CourtLayer } from "@/lib/cases/types";

export type NotificationMeta = {
  source?: string;
  caseNo?: string;
  courtId?: string;
  layer?: CourtLayer;
  caseCategory?: CaseCategory;
  nextDateOfHearing?: string;
  dueInDays?: number | null;
  timing?: string;
  dueLabel?: string;
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  meta: NotificationMeta;
  caseId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsPayload = {
  unreadCount: number;
  items: NotificationItem[];
};

export function fetchNotifications(token: string) {
  return apiRequest<NotificationsPayload>("/notifications", { token });
}

export function markNotificationRead(token: string, id: string) {
  return apiRequest<NotificationItem>(`/notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
    token,
  });
}

export function markAllNotificationsRead(token: string) {
  return apiRequest<{ updated: number }>("/notifications/read-all", {
    method: "POST",
    token,
  });
}
