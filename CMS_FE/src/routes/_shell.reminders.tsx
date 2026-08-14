import { createFileRoute, Link } from "@tanstack/react-router";
import { AlarmClock, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/topbar";
import { Panel } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  REMINDER_META,
  REMINDER_TIMING_META,
  useReminders,
} from "@/lib/cases/use-reminders";
import type { ReminderItem, ReminderTiming } from "@/lib/api/reminders";
import { CASE_CATEGORY_LABELS, formatCourtLabel } from "@/lib/cases/courts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/reminders")({
  head: () => ({
    meta: [{ title: "Reminders — IPS CRM Management" }],
  }),
  component: RemindersPage,
});

function OpenRegisterButton({ item }: { item: ReminderItem }) {
  if (item.layer === "internal") {
    return (
      <Button asChild size="sm" variant="outline" className="shrink-0 rounded-full">
        <Link
          to="/internal/$courtId/$category"
          params={{ courtId: item.courtId, category: item.caseCategory }}
        >
          Open register
        </Link>
      </Button>
    );
  }
  return (
    <Button asChild size="sm" variant="outline" className="shrink-0 rounded-full">
      <Link
        to="/external/$courtId/$category"
        params={{ courtId: item.courtId, category: item.caseCategory }}
      >
        Open register
      </Link>
    </Button>
  );
}

function RemindersPage() {
  const [filter, setFilter] = useState<"all" | ReminderTiming>("all");
  const { items, counts, loading, error, reload } = useReminders({
    daysAhead: 3650,
    limit: 150,
  });
  const visibleItems = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.timing === filter)),
    [filter, items],
  );

  return (
    <div className="space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6">
      <PageHeader
        title="Reminders"
        description={`Live case events remain visible until their date passes or the case is completed. They move through In 2 days → Tomorrow → Today → Overdue whenever a user logs in or refreshes.`}
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => void reload()}
            disabled={loading}
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {[
          { label: "Total", value: counts.total },
          { label: "Today", value: counts.today },
          { label: "Tomorrow", value: counts.tomorrow },
          { label: "In 2 days", value: counts.inTwoDays },
          { label: "All upcoming", value: counts.upcoming },
          { label: "Overdue", value: counts.overdue },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-soft"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-extrabold">{card.value}</p>
          </div>
        ))}
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Could not load reminders ({error}).
        </p>
      ) : null}

      <Panel title={`Active reminders (${visibleItems.length})`}>
        <div className="mb-3 flex flex-wrap gap-2">
          {[
            { value: "all", label: "All active" },
            { value: "two-days", label: "In 2 days" },
            { value: "tomorrow", label: "Tomorrow" },
            { value: "today", label: "Today" },
            { value: "upcoming", label: "All upcoming" },
            { value: "overdue", label: "Overdue" },
            { value: "missing", label: "Missing date" },
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={filter === option.value ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setFilter(option.value as "all" | ReminderTiming)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        {loading && items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading reminders from database…</p>
        ) : visibleItems.length === 0 ? (
          <div className="flex flex-col items-start gap-2 py-6 text-sm text-muted-foreground">
            <AlarmClock className="size-5 text-primary" />
            <p>No reminders right now. Update next hearing dates on case registers to generate them.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {visibleItems.map((item) => {
              const meta = REMINDER_META[item.type];
              const timingMeta = REMINDER_TIMING_META[item.timing];
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          meta.className,
                        )}
                      >
                        {meta.label}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          timingMeta.className,
                        )}
                      >
                        {item.dueLabel}
                      </span>
                      <p className="truncate text-sm font-semibold">{item.title}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.body}</p>
                    <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                      {formatCourtLabel(item.courtId.replace(/-/g, " "))} ·{" "}
                      {CASE_CATEGORY_LABELS[item.caseCategory]}
                      {item.nextDateOfHearing ? ` · ${item.nextDateOfHearing}` : ""}
                    </p>
                  </div>
                  <OpenRegisterButton item={item} />
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
