import { CASE_COLUMNS } from "@/lib/cases/case-columns";
import { CASE_CATEGORY_LABELS, formatCourtLabel } from "@/lib/cases/courts";
import type { CaseRecord } from "@/lib/cases/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CaseDetailDialog({
  open,
  onOpenChange,
  caseRecord,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseRecord: CaseRecord | null;
}) {
  if (!caseRecord) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden border-border bg-muted/40 p-0 shadow-2xl sm:rounded-xl">
        <DialogHeader className="border-b border-border bg-card px-5 py-4 pr-12 text-left">
          <DialogTitle className="text-base font-bold leading-snug text-foreground sm:text-lg">
            {caseRecord.caseNo} — {caseRecord.caseTitled}
          </DialogTitle>
          <p className="mt-1.5 text-xs font-medium text-muted-foreground">
            {formatCourtLabel(caseRecord.nameOfCourt)} · {CASE_CATEGORY_LABELS[caseRecord.caseCategory]}
          </p>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] px-5 py-4">
          <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {CASE_COLUMNS.map((col) => {
              const raw = caseRecord[col.key];
              const value =
                col.key === "caseCategory"
                  ? CASE_CATEGORY_LABELS[caseRecord.caseCategory]
                  : String(raw ?? "—");
              return (
                <div
                  key={col.key}
                  className="rounded-lg border border-border bg-card px-3.5 py-2.5 shadow-sm"
                >
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {col.label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold leading-snug text-foreground">
                    {value || "—"}
                  </dd>
                </div>
              );
            })}
          </dl>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
