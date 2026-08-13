import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

import { CourtCaseBlock } from "@/components/cases/court-case-block";
import { AddCaseLauncher } from "@/components/cases/add-case-launcher";
import { ReportExportBar } from "@/components/reports/report-export-bar";
import { PageHeader } from "@/components/topbar";
import { Panel } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/cases/auth-context";
import { useCaseStore } from "@/lib/cases/case-store";
import { EXTERNAL_COURTS } from "@/lib/cases/courts";
import { buildLayerSummaryReport } from "@/lib/reports/builders";

export const Route = createFileRoute("/_shell/external/")({
  head: () => ({
    meta: [
      { title: "External Courts — IPS" },
      {
        name: "description",
        content:
          "IPS external courts: Federal Constitutional Court, Supreme Court, High Court, District & Session Court, Civil Court, Federal Service Tribunal, Other Courts.",
      },
    ],
  }),
  component: ExternalCourtsPage,
});

function ExternalCourtsPage() {
  const { can, user } = useAuth();
  const { cases, countByLayer } = useCaseStore();

  return (
    <div className="space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6">
      <PageHeader
        title="External Courts"
        description={`Total external records: ${countByLayer("external")}. Most forums track Restraining Order and Direction Cases; Other Courts also track Decided and Pending Cases.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <AddCaseLauncher label="Add case" defaultLayer="external" />
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        }
      />

      {can("cases:view") ? (
        <ReportExportBar
          title="External Courts — official summary"
          description="Forum-wise totals for restraining, direction, and (where applicable) decided/pending matters."
          buildPayload={() => buildLayerSummaryReport("external", EXTERNAL_COURTS, cases, user)}
        />
      ) : null}

      <Panel title="How to work this register">
        <ol className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
          <li className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
            <span className="font-semibold text-foreground">1. Pick a court</span>
            <p className="mt-1 text-xs">From Constitutional Court through Other Courts.</p>
          </li>
          <li className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              2. Open a category <Eye className="size-3.5" />
            </span>
            <p className="mt-1 text-xs">Use the ochre category cells — only categories defined for that court appear.</p>
          </li>
          <li className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              3. Add / edit <Plus className="size-3.5" /> <Pencil className="size-3.5" />
            </span>
            <p className="mt-1 text-xs">
              {can("cases:create") ? "Admin+ can add cases." : "Ask Admin to add cases."} Staff can update fields.
            </p>
          </li>
          <li className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              4. Delete <Trash2 className="size-3.5" />
            </span>
            <p className="mt-1 text-xs">Admin+ can delete one, selected, or clear the open category.</p>
          </li>
        </ol>
      </Panel>

      <Panel title="External court case categories">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {EXTERNAL_COURTS.map((court) => (
            <CourtCaseBlock key={court.id} court={court} />
          ))}
        </div>
      </Panel>

      <AddCaseLauncher floating label="Add case" defaultLayer="external" />
    </div>
  );
}
