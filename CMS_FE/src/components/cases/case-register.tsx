import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CaseDetailDialog } from "@/components/cases/case-detail-dialog";
import { CaseFormDialog } from "@/components/cases/case-form-dialog";
import { CaseTable } from "@/components/cases/case-table";
import { AddCaseLauncher } from "@/components/cases/add-case-launcher";
import { ReportExportBar } from "@/components/reports/report-export-bar";
import { PageHeader } from "@/components/topbar";
import { Panel } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/cases/auth-context";
import { useCaseStore } from "@/lib/cases/case-store";
import {
  CASE_CATEGORY_LABELS,
  formatCourtLabel,
} from "@/lib/cases/courts";
import { useCourts } from "@/lib/cases/use-courts";
import { buildCourtCategoryRegisterReport, buildPendingHearingsReport } from "@/lib/reports/builders";
import type { CaseCategory, CaseRecord, CourtDefinition, CourtLayer } from "@/lib/cases/types";
import { cn } from "@/lib/utils";

type ConfirmKind = "single" | "selected" | "all" | null;

export function CaseRegisterPage({
  court,
  category,
  layer,
}: {
  court: CourtDefinition;
  category: CaseCategory;
  layer: CourtLayer;
}) {
  const { can, user } = useAuth();
  const navigate = useNavigate();
  const { getForCourtCategory, addCase, updateCase, deleteCase, deleteCases, clearCourtCategory, ready, error } =
    useCaseStore();
  const { internal, external } = useCourts(layer);

  const courts = layer === "internal" ? internal : external;
  const rows = getForCourtCategory(court.id, category);
  const basePath = layer === "internal" ? ("/internal" as const) : ("/external" as const);
  const registerTo =
    layer === "internal"
      ? ("/internal/$courtId/$category" as const)
      : ("/external/$courtId/$category" as const);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailRow, setDetailRow] = useState<CaseRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editRow, setEditRow] = useState<CaseRecord | null>(null);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
  const [deleteTarget, setDeleteTarget] = useState<CaseRecord | null>(null);

  const selectedCount = selectedIds.length;
  const canCreate = can("cases:create");
  const canEdit = can("cases:edit");
  const canDelete = can("cases:delete");

  const confirmCopy = useMemo(() => {
    if (confirmKind === "single") {
      return {
        title: "Delete this case?",
        body: `Remove ${deleteTarget?.caseNo ?? "this record"} from ${formatCourtLabel(court.name)} · ${CASE_CATEGORY_LABELS[category]}.`,
      };
    }
    if (confirmKind === "selected") {
      return {
        title: `Delete ${selectedCount} selected case${selectedCount === 1 ? "" : "s"}?`,
        body: "Selected records will be removed from this register in the database.",
      };
    }
    return {
      title: `Clear all ${CASE_CATEGORY_LABELS[category]}?`,
      body: `Deletes every record under ${formatCourtLabel(court.name)} for ${CASE_CATEGORY_LABELS[category]} (${rows.length} total).`,
    };
  }, [confirmKind, deleteTarget, selectedCount, court.name, category, rows.length]);

  function openCreate() {
    setFormMode("create");
    setEditRow(null);
    setFormOpen(true);
  }

  function openEdit(row: CaseRecord) {
    setFormMode("edit");
    setEditRow(row);
    setFormOpen(true);
  }

  function runDelete() {
    void (async () => {
      try {
        if (confirmKind === "single" && deleteTarget) {
          await deleteCase(deleteTarget.id);
          setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
          toast.success(`Deleted ${deleteTarget.caseNo}`);
        } else if (confirmKind === "selected") {
          await deleteCases(selectedIds);
          toast.success(`Deleted ${selectedCount} case${selectedCount === 1 ? "" : "s"}`);
          setSelectedIds([]);
        } else if (confirmKind === "all") {
          const removed = await clearCourtCategory(court.id, category);
          setSelectedIds([]);
          toast.success(`Cleared ${removed} record${removed === 1 ? "" : "s"}`);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Delete failed");
      } finally {
        setConfirmKind(null);
        setDeleteTarget(null);
      }
    })();
  }

  return (
    <div className="space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6">
      <PageHeader
        title={formatCourtLabel(court.name)}
        description={`${CASE_CATEGORY_LABELS[category]} · ${layer === "internal" ? "Internal" : "External"} Courts · ${rows.length} records`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link to={basePath}>All {layer} courts</Link>
            </Button>
            {canCreate ? (
              <Button className="rounded-full bg-brand-gradient font-semibold" onClick={openCreate}>
                <Plus className="size-4" />
                Add case
              </Button>
            ) : (
              <p className="self-center text-xs text-muted-foreground">Sign in as Admin to add cases</p>
            )}
          </div>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 p-3 sm:flex-row sm:items-end sm:justify-between sm:p-4">
        <div className="space-y-1.5">
          <label htmlFor="court-switcher" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Court / office
          </label>
          <select
            id="court-switcher"
            className="h-9 w-full min-w-[16rem] rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-auto"
            value={court.id}
            onChange={(e) => {
              const next = courts.find((c) => c.id === e.target.value);
              if (!next) return;
              const nextCategory = next.categories.includes(category) ? category : next.categories[0]!;
              void navigate({
                to: registerTo,
                params: { courtId: next.id, category: nextCategory },
              });
            }}
          >
            {courts.map((c) => (
              <option key={c.id} value={c.id}>
                {formatCourtLabel(c.name)}
              </option>
            ))}
          </select>
        </div>
        <p className="max-w-xl text-xs text-muted-foreground">
          Open a category tab, then use <strong>Add case</strong>, row actions (view / edit / delete), or select rows for
          bulk delete. Staff can edit; Admin and Super Admin can create and delete.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {court.categories.map((cat) => (
          <Button
            key={cat}
            asChild
            size="sm"
            variant={cat === category ? "default" : "outline"}
            className={cn("rounded-full", cat === category && "bg-brand-gradient")}
          >
            <Link to={registerTo} params={{ courtId: court.id, category: cat }}>
              {CASE_CATEGORY_LABELS[cat]}
            </Link>
          </Button>
        ))}
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Could not load cases ({error}). Refresh after checking the API connection.
        </p>
      ) : null}
      {!ready && !error ? (
        <p className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Loading case register…
        </p>
      ) : null}

      {can("cases:view") ? (
        <ReportExportBar
          compact
          title={`${CASE_CATEGORY_LABELS[category]} register export`}
          description="Official cause list / register for this court and category."
          buildPayload={() => buildCourtCategoryRegisterReport(court, category, rows, user)}
          extras={[
            {
              label: "Pending hearings",
              formats: ["pdf", "csv"],
              buildPayload: () =>
                buildPendingHearingsReport(rows, user, {
                  courtName: court.name,
                  category,
                }),
            },
          ]}
        />
      ) : null}

      <Panel
        title={`${CASE_CATEGORY_LABELS[category]} — case register`}
        action={
          <div className="flex flex-wrap gap-2">
            {canCreate ? (
              <Button
                type="button"
                size="sm"
                className="rounded-full bg-brand-gradient font-semibold"
                onClick={openCreate}
              >
                <Plus className="size-3.5" />
                Add case
              </Button>
            ) : null}
            {canDelete ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={selectedCount === 0}
                  onClick={() => setConfirmKind("selected")}
                >
                  <Trash2 className="size-3.5" />
                  Delete selected ({selectedCount})
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full text-destructive hover:text-destructive"
                  disabled={rows.length === 0}
                  onClick={() => setConfirmKind("all")}
                >
                  Clear category
                </Button>
              </>
            ) : null}
          </div>
        }
      >
        {rows.length === 0 && canCreate ? (
          <div className="mb-4 rounded-xl border border-dashed border-primary/40 bg-primary-soft/30 px-4 py-6 text-center">
            <p className="text-sm font-semibold text-foreground">No records in this category yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create the first case for {formatCourtLabel(court.name)} · {CASE_CATEGORY_LABELS[category]}.
            </p>
            <Button className="mt-3 rounded-full bg-brand-gradient font-semibold" onClick={openCreate}>
              <Plus className="size-4" />
              Add first case
            </Button>
          </div>
        ) : null}
        <CaseTable
          cases={rows}
          canEdit={canEdit}
          canDelete={canDelete}
          selectable={canDelete}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onView={(row) => {
            setDetailRow(row);
            setDetailOpen(true);
          }}
          onEdit={openEdit}
          onDelete={(row) => {
            setDeleteTarget(row);
            setConfirmKind("single");
          }}
        />
      </Panel>

      {canCreate ? (
        <AddCaseLauncher
          floating
          label="Add case"
          defaultLayer={layer}
          presetCourtId={court.id}
          presetCategory={category}
        />
      ) : null}

      <CaseDetailDialog open={detailOpen} onOpenChange={setDetailOpen} caseRecord={detailRow} />

      <CaseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        court={court}
        category={category}
        initial={editRow}
        onSubmit={async (values) => {
          if (formMode === "create") {
            const created = await addCase(values);
            toast.success(`Added ${created.caseNo}`);
            return;
          }
          if (values.id) {
            await updateCase(values.id, values);
            toast.success(`Updated ${values.caseNo}`);
          }
        }}
      />

      <AlertDialog
        open={confirmKind !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmKind(null);
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent className="border-border bg-card sm:rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmCopy.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmCopy.body}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-card text-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={runDelete}
            >
              Confirm delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
