import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CASE_CATEGORY_LABELS, formatCourtLabel } from "@/lib/cases/courts";
import type { CaseCategory, CaseRecord, CourtDefinition } from "@/lib/cases/types";
import { cn } from "@/lib/utils";

type FormState = Omit<CaseRecord, "id" | "srNo" | "courtId" | "layer" | "nameOfCourt" | "caseCategory">;

type FieldDef = {
  key: keyof FormState;
  label: string;
  colSpan?: 1 | 2;
  input?: "text" | "date";
};

type StepDef = {
  id: string;
  title: string;
  subtitle: string;
  fields: FieldDef[];
};

const emptyForm = (): FormState => ({
  caseNo: "",
  dateOfInstitution: "",
  propertyLandDemandNo: "",
  lotNo: "",
  areaMeasuring: "",
  propertyLandStatus: "",
  caseTitled: "",
  nameOfCounsel: "",
  dateOfEntrustmentToCounsel: "",
  todayCourtProceedings: "",
  nextDateOfHearing: "",
  nextDateProceedings: "",
  dateOfDecision: "",
  decidedInFavourOfIps: "",
  decidedAgainstIps: "",
  fillingOfAppeal: "",
  dateGistOfProceedings: "",
  proceedingDate: "",
  previousDate: "",
  requirementForNextDateOfHearing: "",
  feePaid: "",
  feePayable: "",
  caseStatus: "",
  stage: "",
  shortOrder: "",
  finalOrder: "",
  remarks: "",
});

/** Multi-step wizard covering all 30 IPS columns (locked fields shown on step 1). */
const STEPS: StepDef[] = [
  {
    id: "identity",
    title: "Case identity",
    subtitle: "Columns 1–4, 9–10",
    fields: [
      { key: "caseNo", label: "(2) Case No." },
      { key: "dateOfInstitution", label: "(3) Date of Institution", input: "date" },
      { key: "caseTitled", label: "(9) Case Titled", colSpan: 2 },
    ],
  },
  {
    id: "property",
    title: "Property / land",
    subtitle: "Columns 5–8",
    fields: [
      { key: "propertyLandDemandNo", label: "(5) Property / Land Demand No." },
      { key: "lotNo", label: "(6) Lot No." },
      { key: "areaMeasuring", label: "(7) Area Measuring" },
      { key: "propertyLandStatus", label: "(8) Property / Land Status" },
    ],
  },
  {
    id: "counsel",
    title: "Counsel & hearings",
    subtitle: "Columns 11–15",
    fields: [
      { key: "nameOfCounsel", label: "(11) Name of Counsel" },
      {
        key: "dateOfEntrustmentToCounsel",
        label: "(12) Date of Entrustment to Counsel",
        input: "date",
      },
      { key: "todayCourtProceedings", label: "(13) Today Court Proceedings", colSpan: 2 },
      { key: "nextDateOfHearing", label: "(14) Next Date of Hearing", input: "date" },
      { key: "nextDateProceedings", label: "(15) Next Date Proceedings" },
    ],
  },
  {
    id: "proceedings",
    title: "Proceedings & decision",
    subtitle: "Columns 16–23, 28–29",
    fields: [
      { key: "dateOfDecision", label: "(16) Date of Decision", input: "date" },
      { key: "decidedInFavourOfIps", label: "(17) Decided in Favour of IPS" },
      { key: "decidedAgainstIps", label: "(18) Decided Against IPS" },
      { key: "fillingOfAppeal", label: "(19) Filling of Appeal" },
      { key: "dateGistOfProceedings", label: "(20) Date / Gist of Proceedings", colSpan: 2 },
      { key: "proceedingDate", label: "(21) Proceeding Date", input: "date" },
      { key: "previousDate", label: "(22) Previous Date", input: "date" },
      { key: "requirementForNextDateOfHearing", label: "(23) Requirement For Next Date of Hearing", colSpan: 2 },
      { key: "shortOrder", label: "(28) Short Order", colSpan: 2 },
      { key: "finalOrder", label: "(29) Final Order", colSpan: 2 },
    ],
  },
  {
    id: "status",
    title: "Fees, status & remarks",
    subtitle: "Columns 24–27, 30",
    fields: [
      { key: "feePaid", label: "(24) Fee Paid" },
      { key: "feePayable", label: "(25) Fee Payable" },
      { key: "caseStatus", label: "(26) Case Status" },
      { key: "stage", label: "(27) Stage" },
      { key: "remarks", label: "(30) Remarks", colSpan: 2 },
    ],
  },
];

function defaultsForCategory(category: CaseCategory): Partial<FormState> {
  switch (category) {
    case "decided-cases":
      return { caseStatus: "Decided", stage: "Disposed", nextDateOfHearing: "—" };
    case "pending-cases":
      return { caseStatus: "Pending", stage: "Evidence" };
    case "restraining-order":
      return { caseStatus: "Restraining Order", stage: "Stay / Injunction" };
    case "direction-cases":
      return { caseStatus: "Direction", stage: "Compliance / Directions" };
  }
}

export function CaseFormDialog({
  open,
  onOpenChange,
  mode,
  court,
  category,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  court: CourtDefinition;
  category: CaseCategory;
  initial?: CaseRecord | null;
  onSubmit: (
    values: Omit<CaseRecord, "id" | "srNo"> & { id?: string; srNo?: number },
  ) => void | Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!open) return;
    setError("");
    setStep(0);
    if (mode === "edit" && initial) {
      const { id: _id, srNo: _sr, courtId: _c, layer: _l, nameOfCourt: _n, caseCategory: _cat, ...rest } =
        initial;
      setForm(rest);
      return;
    }
    setForm({ ...emptyForm(), ...defaultsForCategory(category) });
  }, [open, mode, initial, category]);

  const title = useMemo(
    () =>
      mode === "create"
        ? `Add case — ${CASE_CATEGORY_LABELS[category]}`
        : `Edit case — ${initial?.caseNo ?? ""}`,
    [mode, category, initial?.caseNo],
  );

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep(index: number): string | null {
    if (index === 0) {
      if (!form.caseNo.trim()) return "Case No. is required.";
      if (!form.caseTitled.trim()) return "Case Titled is required.";
    }
    return null;
  }

  function goNext() {
    const message = validateStep(step);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSave() {
    for (let i = 0; i < STEPS.length; i++) {
      const message = validateStep(i);
      if (message) {
        setError(message);
        setStep(i);
        return;
      }
    }
    try {
      await onSubmit({
        ...(mode === "edit" && initial ? { id: initial.id, srNo: initial.srNo } : {}),
        ...form,
        caseCategory: category,
        nameOfCourt: court.name,
        courtId: court.id,
        layer: court.layer,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save case");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="case-form-modal flex max-h-[92vh] w-[min(44rem,calc(100vw-1.5rem))] max-w-4xl flex-col gap-0 overflow-hidden border border-emerald-950/15 bg-[#f3f6f4] p-0 shadow-2xl dark:border-emerald-100/10 dark:bg-[#101813] sm:rounded-xl">
        <DialogHeader className="space-y-0 border-b border-emerald-950/10 bg-white px-5 pb-4 pt-5 pr-12 text-left dark:border-emerald-100/10 dark:bg-[#17211b]">
          <DialogTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {title}
          </DialogTitle>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {formatCourtLabel(court.name)} · {CASE_CATEGORY_LABELS[category]} · All 30 register columns
          </p>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <span>
                Step {step + 1} of {STEPS.length}
              </span>
              <span className="text-primary-deep">{current.title}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <ol className="mt-3 hidden gap-1.5 sm:grid sm:grid-cols-5">
              {STEPS.map((item, index) => {
                const done = index < step;
                const active = index === step;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (index < step) {
                          setError("");
                          setStep(index);
                        }
                      }}
                      className={cn(
                        "flex w-full items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left transition-colors",
                        active && "border-primary/35 bg-primary-soft/60",
                        done && "border-border bg-white dark:bg-[#1b2720]",
                        !active && !done && "border-transparent bg-[#e6eee9] text-muted-foreground dark:bg-[#1b2720]",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                          active && "bg-primary text-primary-foreground",
                          done && "bg-primary/80 text-primary-foreground",
                          !active && !done && "bg-muted text-muted-foreground",
                        )}
                      >
                        {done ? <Check className="size-3" /> : index + 1}
                      </span>
                      <span
                        className={cn(
                          "truncate text-[10px] font-semibold leading-tight",
                          active ? "text-primary-deep" : done ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {item.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#f3f6f4] px-5 py-4 dark:bg-[#101813]">
          <div className="mb-4 rounded-lg border border-emerald-950/10 bg-white px-3.5 py-3 shadow-sm dark:border-emerald-100/10 dark:bg-[#17211b]">
            <p className="text-[11px] font-bold uppercase tracking-wide text-foreground">{current.title}</p>
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{current.subtitle}</p>
          </div>

          {step === 0 ? (
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <LockedField
                label="(1) Sr. No."
                value={mode === "edit" && initial ? String(initial.srNo) : "Auto-assigned on save"}
              />
              <LockedField label="(4) Case Category" value={CASE_CATEGORY_LABELS[category]} />
              <LockedField
                label="(10) Name of Court"
                value={formatCourtLabel(court.name)}
                className="sm:col-span-2"
              />
            </div>
          ) : null}

          <div className="grid gap-3.5 sm:grid-cols-2">
            {current.fields.map((field) => (
              <div
                key={field.key}
                className={cn("space-y-1.5", field.colSpan === 2 && "sm:col-span-2")}
              >
                <Label htmlFor={field.key} className="text-xs font-semibold text-foreground/80">
                  {field.label}
                </Label>
                {field.input === "date" ? (
                  <DatePicker
                    id={field.key}
                    value={form[field.key]}
                    onChange={(value) => setField(field.key, value)}
                    placeholder={`Select ${field.label.replace(/^\(\d+\)\s*/, "").toLowerCase()}`}
                  />
                ) : (
                  <Input
                    id={field.key}
                    type="text"
                    value={form[field.key]}
                    onChange={(e) => setField(field.key, e.target.value)}
                    className="h-10 rounded-lg border-emerald-950/15 bg-white text-foreground shadow-sm focus-visible:border-primary focus-visible:ring-primary/25 dark:border-emerald-100/15 dark:bg-[#17211b]"
                  />
                )}
              </div>
            ))}
          </div>

          {error ? <p className="mt-3 text-xs font-medium text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="gap-2 border-t border-emerald-950/10 bg-white px-5 py-3.5 dark:border-emerald-100/10 dark:bg-[#17211b] sm:justify-between">
          <p className="hidden max-w-[16rem] text-[11px] leading-snug text-muted-foreground sm:block">
            (1) Sr. No. is assigned automatically. (4) Category and (10) Court stay locked to this register.
          </p>
          <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-emerald-950/15 bg-white dark:border-emerald-100/15 dark:bg-[#17211b]"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-emerald-950/15 bg-white dark:border-emerald-100/15 dark:bg-[#17211b]"
                onClick={goBack}
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>
            ) : null}
            {!isLast ? (
              <Button
                type="button"
                className="rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                onClick={goNext}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                className="rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                onClick={handleSave}
              >
                {mode === "create" ? "Save case" : "Update case"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LockedField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-semibold text-foreground/80">{label}</Label>
      <div className="flex h-10 items-center rounded-lg border border-emerald-950/15 bg-[#e5f0e9] px-3 text-sm font-medium text-foreground dark:border-emerald-100/15 dark:bg-[#1b2a21]">
        {value}
      </div>
    </div>
  );
}
