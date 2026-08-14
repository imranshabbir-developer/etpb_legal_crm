import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/topbar";
import { Panel } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import type { NotificationItem } from "@/lib/api/notifications";
import { CASE_CATEGORY_LABELS, formatCourtLabel } from "@/lib/cases/courts";
import { useNotifications } from "@/lib/cases/use-notifications";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/notifications_")({
  head: () => ({
    meta: [{ title: "Notifications — IPS CRM Management" }],
  }),
  component: NotificationsPage,
});

function OpenCaseButton({ item, onOpen }: { item: NotificationItem; onOpen: () => void }) {
  const meta = item.meta;
  if (meta.layer === "internal" && meta.courtId && meta.caseCategory) {
    return (
      <Button asChild size="sm" variant="outline" className="shrink-0 rounded-full">
        <Link
          to="/internal/$courtId/$category"
          params={{ courtId: meta.courtId, category: meta.caseCategory }}
          onClick={onOpen}
        >
          Open register
        </Link>
      </Button>
    );
  }
  if (meta.layer === "external" && meta.courtId && meta.caseCategory) {
    return (
      <Button asChild size="sm" variant="outline" className="shrink-0 rounded-full">
        <Link
          to="/external/$courtId/$category"
          params={{ courtId: meta.courtId, category: meta.caseCategory }}
          onClick={onOpen}
        >
          Open register
        </Link>
      </Button>
    );
  }
  return null;
}

function NotificationsPage() {
  const { items, unreadCount, loading, error, reload, markRead, markAllRead } = useNotifications();

  async function readAll() {
    try {
      const result = await markAllRead();
      toast.success(`${result.updated} notification${result.updated === 1 ? "" : "s"} marked read`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not mark notifications read");
    }
  }

  return (
    <div className="space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6">
      <PageHeader
        title="Notifications"
        description="Persistent hearing alerts generated from live case dates. Read state is stored separately for your account."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => void reload()} disabled={loading}>
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button type="button" variant="outline" className="rounded-full" onClick={() => void readAll()} disabled={!unreadCount}>
              <CheckCheck className="size-4" />
              Mark all read
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Total</p>
          <p className="mt-1 text-2xl font-extrabold">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Unread</p>
          <p className="mt-1 text-2xl font-extrabold">{unreadCount}</p>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Could not load notifications ({error}).
        </p>
      ) : null}

      <Panel title={`Inbox (${items.length})`}>
        {loading && items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading notifications from database…</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-start gap-2 py-6 text-sm text-muted-foreground">
            <Bell className="size-5 text-primary" />
            <p>No notifications. Active case dates will generate alerts automatically.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {items.map((item) => (
              <li key={item.id} className={cn("flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between", !item.readAt && "bg-primary-soft/10")}>
                <div className="min-w-0 px-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("size-2 rounded-full", item.readAt ? "bg-muted-foreground/30" : "bg-primary")} />
                    <p className={cn("truncate text-sm", !item.readAt && "font-semibold")}>{item.title}</p>
                    {item.meta.dueLabel ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">{item.meta.dueLabel}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.body}</p>
                  {item.meta.courtId && item.meta.caseCategory ? (
                    <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                      {formatCourtLabel(item.meta.courtId.replace(/-/g, " "))} · {CASE_CATEGORY_LABELS[item.meta.caseCategory]}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 px-2">
                  {!item.readAt ? (
                    <Button type="button" size="sm" variant="ghost" className="rounded-full" onClick={() => void markRead(item.id)}>
                      Mark read
                    </Button>
                  ) : null}
                  <OpenCaseButton item={item} onOpen={() => {
                    if (!item.readAt) void markRead(item.id);
                  }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
