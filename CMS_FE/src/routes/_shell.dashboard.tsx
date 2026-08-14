import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Scale,
  Landmark,
  Gavel,
  FileWarning,
  ClipboardList,
  AlarmClock,
  Bell,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/topbar";
import { Panel, StatCard } from "@/components/stat-card";
import { AddCaseLauncher } from "@/components/cases/add-case-launcher";
import { CourtCaseBlock } from "@/components/cases/court-case-block";
import { ReportExportBar } from "@/components/reports/report-export-bar";
import { Button } from "@/components/ui/button";
import { fetchDashboardSummary, type DashboardSummary } from "@/lib/api/dashboard";
import { useAuth } from "@/lib/cases/auth-context";
import { useCaseStore } from "@/lib/cases/case-store";
import { ROLE_LABELS } from "@/lib/cases/permissions";
import {
  buildDashboardPositionReport,
  buildExecutivePackReport,
  buildPendingHearingsReport,
} from "@/lib/reports/builders";
import { useCourts } from "@/lib/cases/use-courts";
import { useModules } from "@/lib/cases/modules-context";
import { REMINDER_TIMING_META, useReminders } from "@/lib/cases/use-reminders";
import { useNotifications } from "@/lib/cases/use-notifications";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — IPS CRM Management" },
      {
        name: "description",
        content: "Overview of IPS internal and external court cases.",
      },
    ],
  }),
  component: DashboardPage,
});

const PIE_COLORS = ["#1f6b45", "#2f9d63", "#3ddc84", "#e8c547"];

function DashboardPage() {
  const { user, can, token } = useAuth();
  const { cases, ready: casesReady, fromApi, error: casesError } = useCaseStore();
  const { internal, external, reload: reloadCourts, loading: courtsLoading, error: courtsError } =
    useCourts();
  const { modules } = useModules();
  const { items: reminderItems, counts: reminderCounts } = useReminders({ limit: 6 });
  const { unreadCount: notificationUnread } = useNotifications();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setSummary(null);
      setSummaryError(null);
      setSummaryLoading(false);
      return;
    }
    let cancelled = false;
    setSummaryLoading(true);
    void fetchDashboardSummary(token)
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
          setSummaryError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSummary(null);
          setSummaryError(err instanceof Error ? err.message : "Failed to load dashboard summary");
        }
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, cases]);

  const monthly = summary?.monthly ?? [];
  const split = useMemo(
    () => (summary?.categorySplit ?? []).filter((entry) => entry.value > 0),
    [summary],
  );
  const trends = summary?.trends;

  const internalTotal = summary?.byLayer.internal ?? 0;
  const externalTotal = summary?.byLayer.external ?? 0;
  const pending = summary?.byCategory["pending-cases"] ?? 0;
  const decided = summary?.byCategory["decided-cases"] ?? 0;
  const restraining = summary?.byCategory["restraining-order"] ?? 0;
  const direction = summary?.byCategory["direction-cases"] ?? 0;
  const total = summary?.total ?? 0;
  const activeReminders = reminderCounts.total;
  const statsReady = Boolean(summary) && !summaryLoading;

  return (
    <div className="space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6">
      <PageHeader
        title="CRM Management Dashboard"
        description={
          user
            ? `Signed in as ${user.name} (${ROLE_LABELS[user.role]}). ${
                statsReady
                  ? `Live database: ${total} cases.`
                  : summaryLoading
                    ? "Loading live dashboard totals…"
                    : summaryError
                      ? "Dashboard summary unavailable."
                      : fromApi && casesReady
                        ? "Connecting to dashboard analytics…"
                        : "Connecting to case database…"
              } Evacuee Trust Property Board — https://ips.gov.pk/`
            : "Evacuee Trust Property Board — Legal CRM Management System"
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <AddCaseLauncher label="Add case record" />
            {can("cases:view") ? (
              <Button asChild variant="outline" className="rounded-full font-semibold">
                <Link to="/reminders">Reminders</Link>
              </Button>
            ) : null}
            {can("users:view") ? (
              <Button asChild variant="outline" className="rounded-full font-semibold">
                <Link to="/users">Manage users</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      {summaryError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Could not load dashboard summary ({summaryError}). Check the API connection, then refresh.
        </p>
      ) : null}
      {casesError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Could not load cases for reports ({casesError}). Totals still use `/dashboard/summary` when available.
        </p>
      ) : null}
      {courtsError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Could not load courts ({courtsError}). Refresh after checking the API connection.
        </p>
      ) : null}
      {summaryLoading && !summary ? (
        <p className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Loading live dashboard aggregates from PostgreSQL…
        </p>
      ) : null}

      {can("cases:view") ? (
        <ReportExportBar
          title="Official reports & exports"
          description="Consolidated case position in Government of the Punjab / ETPB letterhead style. Use Executive pack for Board/Chairman briefing (Admin+)."
          buildPayload={() =>
            buildDashboardPositionReport(cases, user, {
              internal: internalTotal,
              external: externalTotal,
              pending,
              decided,
              restraining,
              direction,
            })
          }
          extras={[
            {
              label: "Pending hearings (PDF)",
              formats: ["pdf"],
              buildPayload: () => buildPendingHearingsReport(cases, user),
            },
            ...(user?.role === "admin" || user?.role === "super-admin"
              ? [
                  {
                    label: "Executive pack (PDF)",
                    formats: ["pdf"] as const,
                    buildPayload: () =>
                      buildExecutivePackReport(cases, user, {
                        internal: internalTotal,
                        external: externalTotal,
                        pending,
                        decided,
                        restraining,
                        direction,
                      }),
                  },
                ]
              : []),
          ]}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          featured
          icon={<Landmark className="size-5" />}
          label="Internal Courts"
          value={statsReady ? String(internalTotal) : "—"}
          progress={statsReady ? Math.min(100, (internalTotal / Math.max(total, 1)) * 100) : 0}
          caption="Federal Secretary to Asst. / Dy. Administrator"
          trend={trends?.internal}
        />
        <StatCard
          icon={<Scale className="size-5" />}
          label="External Courts"
          value={statsReady ? String(externalTotal) : "—"}
          progress={statsReady ? Math.min(100, (externalTotal / Math.max(total, 1)) * 100) : 0}
          caption="Constitutional Court to Other Courts"
          trend={trends?.external}
        />
        <StatCard
          icon={<ClipboardList className="size-5" />}
          label="Pending Cases"
          value={statsReady ? String(pending) : "—"}
          progress={statsReady ? Math.min(100, (pending / Math.max(total, 1)) * 100) : 0}
          caption="Active pending case records"
          trend={trends?.pending}
        />
        <StatCard
          icon={<Gavel className="size-5" />}
          label="Decided Cases"
          value={statsReady ? String(decided) : "—"}
          progress={statsReady ? Math.min(100, (decided / Math.max(total, 1)) * 100) : 0}
          caption="Disposed / decided matters"
          trend={trends?.decided}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          icon={<FileWarning className="size-5" />}
          label="Restraining Order"
          value={statsReady ? String(restraining) : "—"}
          progress={statsReady ? Math.min(100, (restraining / Math.max(total, 1)) * 100) : 0}
          caption="Stay / injunction matters"
          trend={trends?.restraining}
        />
        <StatCard
          icon={<Scale className="size-5" />}
          label="Direction Cases"
          value={statsReady ? String(direction) : "—"}
          progress={statsReady ? Math.min(100, (direction / Math.max(total, 1)) * 100) : 0}
          caption="Court direction / compliance matters"
          trend={trends?.direction}
        />
      </div>

      {can("cases:view") ? (
        <div className="grid gap-3 lg:grid-cols-[0.8fr_0.8fr_1.4fr]">
          <StatCard
            icon={<AlarmClock className="size-5" />}
            label="Active reminders"
            value={String(activeReminders)}
            progress={Math.min(100, (activeReminders / Math.max(total || activeReminders, 1)) * 100)}
            caption={`${summary?.upcomingHearings ?? 0} hearings in next 30 days · ${reminderCounts.today} today`}
          />
          <StatCard
            icon={<Bell className="size-5" />}
            label="Unread notifications"
            value={String(notificationUnread)}
            progress={Math.min(100, (notificationUnread / Math.max(activeReminders || notificationUnread, 1)) * 100)}
            caption="Persistent read state for your account"
          />
          <Panel
            title="Upcoming reminders"
            action={
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link to="/reminders">View all</Link>
              </Button>
            }
          >
            {reminderItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming or overdue hearing reminders from live case dates.
              </p>
            ) : (
              <ul className="space-y-2">
                {reminderItems.map((item) => {
                  const timingMeta = REMINDER_TIMING_META[item.timing];
                  return (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">{item.title}</p>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                          {item.body}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                          timingMeta.className,
                        )}
                      >
                        {item.dueLabel}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      ) : null}

      {modules.showChartsModule ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Panel title="Monthly case load — Internal vs External">
            <div className="h-64 w-full">
              {!statsReady ? (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {summaryLoading ? "Loading monthly series…" : "No dashboard summary yet."}
                </p>
              ) : monthly.length === 0 ? (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No institution dates in the database for the last 6 months.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly} barGap={4}>
                    <CartesianGrid vertical={false} stroke="rgb(45 212 122 / 0.12)" strokeDasharray="4 7" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis tickLine={false} axisLine={false} fontSize={11} width={28} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="internal" name="Internal" fill="#2f9d63" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="external" name="External" fill="#3ddc84" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>

          <Panel title="Case categories distribution">
            <div className="h-64 w-full">
              {!statsReady ? (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {summaryLoading ? "Loading category split…" : "No dashboard summary yet."}
                </p>
              ) : split.length === 0 ? (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No cases in the database yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={split} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {split.map((entry, index) => (
                        <Cell key={entry.key} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>
        </div>
      ) : null}

      {modules.showInternalModule ? (
        <Panel
          title="Internal Courts"
          action={
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link to="/internal">Open internal overview</Link>
            </Button>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {internal.length === 0 ? (
              <p className="text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
                {courtsLoading
                  ? "Loading internal courts…"
                  : "No active internal courts. Admin can add courts from Internal Courts."}
              </p>
            ) : (
              internal.map((court) => (
                <CourtCaseBlock
                  key={court.id}
                  court={court}
                  counts={summary?.byCourt?.[court.id] ?? null}
                  onCourtUpdated={() => void reloadCourts()}
                />
              ))
            )}
          </div>
        </Panel>
      ) : null}

      {modules.showExternalModule ? (
        <Panel
          title="External Courts"
          action={
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link to="/external">Open external overview</Link>
            </Button>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {external.length === 0 ? (
              <p className="text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
                {courtsLoading
                  ? "Loading external courts…"
                  : "No active external courts. Admin can add courts from External Courts."}
              </p>
            ) : (
              external.map((court) => (
                <CourtCaseBlock
                  key={court.id}
                  court={court}
                  counts={summary?.byCourt?.[court.id] ?? null}
                  onCourtUpdated={() => void reloadCourts()}
                />
              ))
            )}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
