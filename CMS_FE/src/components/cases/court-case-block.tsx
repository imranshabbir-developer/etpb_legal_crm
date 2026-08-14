import { Link } from "@tanstack/react-router";

import { EditCourtDialog } from "@/components/cases/edit-court-dialog";
import { CASE_CATEGORY_LABELS, formatCourtLabel } from "@/lib/cases/courts";
import type { DashboardCourtCounts } from "@/lib/api/dashboard";
import { useCaseStore } from "@/lib/cases/case-store";
import type { CaseCategory, CourtDefinition } from "@/lib/cases/types";
import { cn } from "@/lib/utils";

export function CourtCaseBlock({
  court,
  counts,
  onCourtUpdated,
}: {
  court: CourtDefinition;
  /** Prefer live `/dashboard/summary` byCourt when provided (dashboard). */
  counts?: DashboardCourtCounts | null;
  onCourtUpdated?: () => void;
}) {
  const { countForCourt } = useCaseStore();
  const registerTo =
    court.layer === "internal"
      ? ("/internal/$courtId/$category" as const)
      : ("/external/$courtId/$category" as const);

  const totalCases = counts?.total ?? countForCourt(court.id);
  const categoryTotal = (category: CaseCategory) =>
    counts?.byCategory?.[category] ?? countForCourt(court.id, category);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
      <div className="relative bg-primary px-3 py-2.5 text-center">
        <p className="text-[11px] font-bold uppercase tracking-wide text-primary-foreground sm:text-xs">
          {formatCourtLabel(court.name)}
        </p>
        <p className="mt-0.5 text-[10px] text-primary-foreground/80">{totalCases} total cases</p>
        <div className="absolute right-1.5 top-1.5">
          <EditCourtDialog court={court} onUpdated={onCourtUpdated} />
        </div>
      </div>
      <div className="bg-primary-soft px-3 py-1.5 text-center text-[11px] font-bold uppercase tracking-wide text-primary-deep">
        Cases — open a category, or use Add case
      </div>
      <div
        className={cn(
          "grid gap-px bg-border/50",
          court.categories.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {court.categories.map((category) => {
          const total = categoryTotal(category);
          return (
            <Link
              key={category}
              to={registerTo}
              params={{ courtId: court.id, category }}
              className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1 bg-warning/80 px-2 py-3 text-center transition-colors hover:bg-warning"
            >
              <span className="text-[11px] font-semibold leading-tight text-foreground">
                {CASE_CATEGORY_LABELS[category]}
              </span>
              <span className="text-sm font-bold text-primary-deep">{total}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
