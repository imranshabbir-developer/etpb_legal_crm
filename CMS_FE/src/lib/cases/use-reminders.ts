import { useCallback, useEffect, useState } from "react";

import { fetchReminders, type ReminderItem, type RemindersPayload } from "@/lib/api/reminders";
import { useAuth } from "@/lib/cases/auth-context";
import { useCaseStore } from "@/lib/cases/case-store";
import { CASE_CATEGORY_LABELS } from "@/lib/cases/courts";
import type { ReminderTiming, ReminderType } from "@/lib/api/reminders";

export const REMINDER_META: Record<
  ReminderType,
  { label: string; className: string }
> = {
  overdue: {
    label: "Overdue",
    className: "bg-destructive/15 text-destructive",
  },
  hearing: {
    label: "Hearing",
    className: "bg-primary-soft text-primary-deep",
  },
  pending: {
    label: "Pending",
    className: "bg-warning/40 text-foreground",
  },
  restraining: {
    label: "Restraining",
    className: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  },
  direction: {
    label: "Direction",
    className: "bg-sky-500/15 text-sky-800 dark:text-sky-300",
  },
  decided: {
    label: "Decided",
    className: "bg-muted text-muted-foreground",
  },
};

export const REMINDER_TIMING_META: Record<
  ReminderTiming,
  { label: string; className: string }
> = {
  overdue: { label: "Overdue", className: "bg-destructive/15 text-destructive" },
  today: { label: "Today", className: "bg-destructive text-destructive-foreground" },
  tomorrow: { label: "Tomorrow", className: "bg-orange-500/20 text-orange-800 dark:text-orange-200" },
  "two-days": { label: "In 2 days", className: "bg-warning/50 text-foreground" },
  upcoming: { label: "Upcoming", className: "bg-primary-soft text-primary-deep" },
  missing: { label: "Date required", className: "bg-muted text-muted-foreground" },
};

export function reminderRegisterPath(item: Pick<ReminderItem, "layer" | "courtId" | "caseCategory">) {
  const base = item.layer === "internal" ? "/internal" : "/external";
  return `${base}/${encodeURIComponent(item.courtId)}/${encodeURIComponent(item.caseCategory)}`;
}

export function useReminders(options?: { daysAhead?: number; limit?: number }) {
  const { token, ready: authReady, can } = useAuth();
  const { cases } = useCaseStore();
  const [data, setData] = useState<RemindersPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token || !can("cases:view")) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchReminders(token, {
        daysAhead: options?.daysAhead ?? 3650,
        limit: options?.limit ?? 100,
      });
      setData(payload);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load reminders");
    } finally {
      setLoading(false);
    }
  }, [can, options?.daysAhead, options?.limit, token]);

  useEffect(() => {
    if (!authReady) return;
    void reload();
  }, [authReady, reload, cases]);

  return {
    items: data?.items ?? [],
    counts: data?.counts ?? {
      total: 0,
      overdue: 0,
      hearing: 0,
      pending: 0,
      restraining: 0,
      direction: 0,
      today: 0,
      tomorrow: 0,
      inTwoDays: 0,
      upcoming: 0,
    },
    daysAhead: data?.daysAhead ?? options?.daysAhead ?? 3650,
    loading,
    error,
    reload,
    categoryLabel: (category: keyof typeof CASE_CATEGORY_LABELS) => CASE_CATEGORY_LABELS[category],
  };
}
