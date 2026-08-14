import { createFileRoute, Link } from "@tanstack/react-router";

import { CourtCaseBlock } from "@/components/cases/court-case-block";
import { AddCaseLauncher } from "@/components/cases/add-case-launcher";
import { AddCourtDialog } from "@/components/cases/add-court-dialog";
import { ReportExportBar } from "@/components/reports/report-export-bar";
import { PageHeader } from "@/components/topbar";
import { Panel } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/cases/auth-context";
import { useCaseStore } from "@/lib/cases/case-store";
import { useCourts } from "@/lib/cases/use-courts";
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
  const { cases } = useCaseStore();
  const { internal, loading, error, reload } = useCourts("internal");

  return (
    <div className="space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6">
      <PageHeader
        title="Internal Courts"
        actions={
          <div className="flex flex-wrap gap-2">
            <AddCourtDialog layer="internal" onCreated={() => void reload()} />
            <AddCaseLauncher label="Add case" defaultLayer="internal" />
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        }
      />

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Could not load courts from database ({error}). Refresh after checking the API connection.
        </p>
      ) : null}

      {can("cases:view") ? (
        <ReportExportBar
          title="Internal Courts — official summary"
          description="Court-wise totals for decided, pending, restraining and direction matters."
          buildPayload={() => buildLayerSummaryReport("internal", internal, cases, user)}
        />
      ) : null}

      <Panel title={`Internal court case categories (${internal.length})`}>
        {loading && internal.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading courts from database...</p>
        ) : internal.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active internal courts. Use <strong>Add court</strong> (Admin+) or run `npm run db:seed` in CMS_BE.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {internal.map((court) => (
              <CourtCaseBlock key={court.id} court={court} onCourtUpdated={() => void reload()} />
            ))}
          </div>
        )}
      </Panel>

      <AddCaseLauncher floating label="Add case" defaultLayer="internal" />
    </div>
  );
}
