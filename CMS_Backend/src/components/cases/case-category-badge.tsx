import { CASE_CATEGORY_LABELS } from "@/lib/cases/courts";
import type { CaseCategory } from "@/lib/cases/types";
import { cn } from "@/lib/utils";

const styles: Record<CaseCategory, string> = {
  "decided-cases": "bg-primary-soft text-primary-deep border-primary/20",
  "pending-cases": "bg-warning/20 text-foreground border-warning/40",
  "restraining-order": "bg-destructive/10 text-destructive border-destructive/20",
  "direction-cases": "bg-secondary text-secondary-foreground border-border",
};

export function CaseCategoryBadge({ category }: { category: CaseCategory }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        styles[category],
      )}
    >
      {CASE_CATEGORY_LABELS[category]}
    </span>
  );
}
