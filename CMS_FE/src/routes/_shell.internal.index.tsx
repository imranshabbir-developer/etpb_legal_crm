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
import { INTERNAL_COURTS } from "@/lib/cases/courts";
import { buildLayerSummaryReport } from "@/lib/reports/builders";

export const Route = createFileRoute("/_shell/internal/")({
  head: () => ({
    meta: [
      { title: "Internal Courts — IPS" },
      {
        name: "description",
        content:
          "IPS internal courts: Federal Secretary, Joint Secretary, Chairman, Administrator, Assistant / Deputy Administrator.",
      },
    ],
  }),
  component: InternalCourtsPage,
});

function InternalCourtsPage() {
  const { can, user } = useAuth();
  const { cases, countByLayer } = useCaseStore();

  return (
    <div className="space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6">
      <PageHeader
        title="Internal Courts"
        description={`Total internal records: ${countByLayer("internal")}. Hierarchy: Federal Secretary → Joint Secretary → Chairman → Administrator → Assistant / Deputy Administrator.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <AddCaseLauncher label="Add case" defaultLayer="internal" />
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        }
      />

      {can("cases:view") ? (
        <ReportExportBar
          title="Internal Courts — official summary"
          description="Court-wise totals for decided, pending, restraining and direction matters."
          buildPayload={() => buildLayerSummaryReport("internal", INTERNAL_COURTS, cases, user)}
        />
      ) : null}

      <Panel title="How to work this register">
        <ol className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
          <li className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
            <span className="font-semibold text-foreground">1. Pick a court</span>
            <p className="mt-1 text-xs">Choose Federal Secretary through Asst. / Dy. Administrator below.</p>
          </li>
          <li className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              2. Open a category <Eye className="size-3.5" />
            </span>
            <p className="mt-1 text-xs">Decided, Pending, Restraining Order, or Direction Cases.</p>
          </li>
          <li className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              3. Add / edit <Plus className="size-3.5" /> <Pencil className="size-3.5" />
            </span>
            <p className="mt-1 text-xs">
              {can("cases:create") ? "Admin+ can add cases." : "Ask Admin to add cases."} Staff can edit proceedings.
            </p>
          </li>
          <li className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              4. Delete <Trash2 className="size-3.5" />
            </span>
            <p className="mt-1 text-xs">Admin+ can delete one row, selected rows, or clear a category.</p>
          </li>
        </ol>
      </Panel>

      <Panel title="Internal court case categories">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {INTERNAL_COURTS.map((court) => (
            <CourtCaseBlock key={court.id} court={court} />
          ))}
        </div>
      </Panel>

      <AddCaseLauncher floating label="Add case" defaultLayer="internal" />
    </div>
  );
}
