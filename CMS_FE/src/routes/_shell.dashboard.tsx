import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Scale,
  Landmark,
  Gavel,
  FileWarning,
  ClipboardList,
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
import { useAuth } from "@/lib/cases/auth-context";
import { useCaseStore } from "@/lib/cases/case-store";
import { EXTERNAL_COURTS, INTERNAL_COURTS } from "@/lib/cases/courts";
import { casesByMonth } from "@/lib/cases/mock-cases";
import { ROLE_LABELS } from "@/lib/cases/permissions";
import {
  buildDashboardPositionReport,
  buildExecutivePackReport,
} from "@/lib/reports/builders";
import type { CaseCategory } from "@/lib/cases/types";

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

/* Mid greens read on both light and dark dashboard surfaces */
const PIE_COLORS = ["#1f6b45", "#2f9d63", "#3ddc84", "#e8c547"];

function DashboardPage() {
  const { user, can } = useAuth();
  const { cases, countByLayer, countByCategory } = useCaseStore();
  const monthly = useMemo(() => casesByMonth(), []);
  const split = useMemo(() => {
    const keys: CaseCategory[] = [
      "decided-cases",
      "pending-cases",
      "restraining-order",
      "direction-cases",
    ];
    const labels = {
      "decided-cases": "Decided",
      "pending-cases": "Pending",
      "restraining-order": "Restraining",
      "direction-cases": "Direction",
    } as const;
    return keys.map((key) => ({
      key,
      name: labels[key],
      value: countByCategory(key),
    }));
  }, [cases, countByCategory]);

  const internalTotal = countByLayer("internal");
  const externalTotal = countByLayer("external");
  const pending = countByCategory("pending-cases");
  const decided = countByCategory("decided-cases");
  const restraining = countByCategory("restraining-order");
  const direction = countByCategory("direction-cases");
  const total = cases.length;

  return (
    <div className="space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6">
      <PageHeader
        title="CRM Management Dashboard"
        description={
          user
            ? `Signed in as ${user.name} (${ROLE_LABELS[user.role]}). Managing cases for Evacuee Trust Property Board — https://ips.gov.pk/`
            : "Evacuee Trust Property Board — Legal CRM Management System"
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <AddCaseLauncher label="Add case record" />
            {can("users:view") ? (
              <Button asChild variant="outline" className="rounded-full font-semibold">
                <Link to="/users">Manage users</Link>
              </Button>
            ) : null}
          </div>
        }
      />

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
          extras={
            user?.role === "admin" || user?.role === "super-admin"
              ? [
                  {
                    label: "Executive pack (PDF)",
                    formats: ["pdf"],
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
              : undefined
          }
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          featured
          icon={<Landmark className="size-5" />}
          label="Internal Courts"
          value={String(internalTotal)}
          progress={Math.min(100, (internalTotal / Math.max(total, 1)) * 100)}
          caption="Federal Secretary to Asst. / Dy. Administrator"
          trend={8}
        />
        <StatCard
          icon={<Scale className="size-5" />}
          label="External Courts"
          value={String(externalTotal)}
          progress={Math.min(100, (externalTotal / Math.max(total, 1)) * 100)}
          caption="Constitutional Court to Other Courts"
          trend={5}
        />
        <StatCard
          icon={<ClipboardList className="size-5" />}
          label="Pending Cases"
          value={String(pending)}
          progress={Math.min(100, (pending / Math.max(total, 1)) * 100)}
          caption="Active pending case records"
          trend={3}
        />
        <StatCard
          icon={<Gavel className="size-5" />}
          label="Decided Cases"
          value={String(decided)}
          progress={Math.min(100, (decided / Math.max(total, 1)) * 100)}
          caption="Disposed / decided matters"
          trend={6}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          icon={<FileWarning className="size-5" />}
          label="Restraining Order"
          value={String(restraining)}
          progress={40}
          caption="Stay / injunction matters"
          trend={2}
        />
        <StatCard
          icon={<Scale className="size-5" />}
          label="Direction Cases"
          value={String(direction)}
          progress={35}
          caption="Court direction / compliance matters"
          trend={4}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Monthly case load — Internal vs External">
          <div className="h-64 w-full">
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
          </div>
        </Panel>

        <Panel title="Case categories distribution">
          <div className="h-64 w-full">
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
          </div>
        </Panel>
      </div>

      <Panel
        title="Internal Courts"
        action={
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to="/internal">Open internal overview</Link>
          </Button>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {INTERNAL_COURTS.map((court) => (
            <CourtCaseBlock key={court.id} court={court} />
          ))}
        </div>
      </Panel>

      <Panel
        title="External Courts"
        action={
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to="/external">Open external overview</Link>
          </Button>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {EXTERNAL_COURTS.map((court) => (
            <CourtCaseBlock key={court.id} court={court} />
          ))}
        </div>
      </Panel>
    </div>
  );
}
