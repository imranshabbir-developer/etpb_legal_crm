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
      <DialogContent className="flex max-h-[92vh] w-[min(44rem,calc(100vw-1.5rem))] max-w-3xl flex-col gap-0 overflow-hidden border border-emerald-950/15 bg-[#f3f6f4] p-0 shadow-2xl dark:border-emerald-100/10 dark:bg-[#101813] sm:rounded-xl">
        <DialogHeader className="space-y-0 border-b border-emerald-950/10 bg-white px-5 pb-4 pt-5 pr-12 text-left dark:border-emerald-100/10 dark:bg-[#17211b]">
          <DialogTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {caseRecord.caseNo} — {caseRecord.caseTitled}
          </DialogTitle>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {formatCourtLabel(caseRecord.nameOfCourt)} · {CASE_CATEGORY_LABELS[caseRecord.caseCategory]}
          </p>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] bg-[#f3f6f4] px-5 py-4 dark:bg-[#101813]">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CASE_COLUMNS.map((col) => {
              const raw = caseRecord[col.key];
              const value =
                col.key === "caseCategory"
                  ? CASE_CATEGORY_LABELS[caseRecord.caseCategory]
                  : String(raw ?? "—");
              return (
                <div
                  key={col.key}
                  className="rounded-lg border border-emerald-950/10 bg-white px-3.5 py-3 shadow-sm dark:border-emerald-100/10 dark:bg-[#17211b]"
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
