import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { CaseFormDialog } from "@/components/cases/case-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/cases/auth-context";
import { useCaseStore } from "@/lib/cases/case-store";
import {
  CASE_CATEGORY_LABELS,
  formatCourtLabel,
} from "@/lib/cases/courts";
import { useCourts } from "@/lib/cases/use-courts";
import type { CaseCategory, CourtDefinition, CourtLayer } from "@/lib/cases/types";
import { cn } from "@/lib/utils";

type AddCaseLauncherProps = {
  label?: string;
  className?: string;
  size?: "default" | "sm" | "lg";
  defaultLayer?: CourtLayer;
  /** When set, skip picker and open the form for this court/category */
  presetCourtId?: string;
  presetCategory?: CaseCategory;
  floating?: boolean;
};

/**
 * Visible entry point for Admin / Super Admin to add case records
 * without needing to already be deep inside a category register.
 */
export function AddCaseLauncher({
  label = "Add case",
  className,
  size = "default",
  defaultLayer = "internal",
  presetCourtId,
  presetCategory,
  floating = false,
}: AddCaseLauncherProps) {
  const { can } = useAuth();
  const { addCase } = useCaseStore();
  const { internal, external } = useCourts();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [layer, setLayer] = useState<CourtLayer>(defaultLayer);

  const internalList = internal;
  const externalList = external;
  const courts = layer === "internal" ? internalList : externalList;

  const [courtId, setCourtId] = useState(presetCourtId ?? "");

  const selectedCourt = useMemo(
    () => courts.find((c) => c.id === courtId) ?? courts[0],
    [courtId, courts],
  );
  const [category, setCategory] = useState<CaseCategory>(
    presetCategory ?? "decided-cases",
  );

  useEffect(() => {
    if (!selectedCourt) return;
    if (!courtId) setCourtId(selectedCourt.id);
    if (!selectedCourt.categories.includes(category)) {
      setCategory(selectedCourt.categories[0]!);
    }
  }, [category, courtId, selectedCourt]);

  function findCourt(
    id: string,
    list: CourtDefinition[] = [...internalList, ...externalList],
  ) {
    return list.find((c) => c.id === id);
  }

  if (!can("cases:create")) return null;

  function openFlow() {
    if (presetCourtId && presetCategory) {
      const court = findCourt(presetCourtId);
      if (court) {
        setLayer(court.layer);
        setCourtId(court.id);
        setCategory(presetCategory);
        setFormOpen(true);
        return;
      }
    }
    setLayer(defaultLayer);
    const list = defaultLayer === "internal" ? internalList : externalList;
    if (!list.length) {
      toast.error("No active courts are available from the database");
      return;
    }
    setCourtId(list[0].id);
    setCategory(list[0].categories[0]!);
    setPickerOpen(true);
  }

  function continueToForm() {
    const court = findCourt(courtId, courts);
    if (!court || !court.categories.includes(category)) {
      toast.error("Choose a valid court and category");
      return;
    }
    setPickerOpen(false);
    setFormOpen(true);
  }

  return (
    <>
      <Button
        type="button"
        size={size}
        className={cn(
          floating
            ? "fixed bottom-20 right-4 z-40 rounded-full bg-brand-gradient px-5 py-6 font-semibold shadow-lg md:bottom-6"
            : "rounded-full bg-brand-gradient font-semibold",
          className,
        )}
        onClick={openFlow}
      >
        <Plus className="size-4" />
        {label}
      </Button>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-md border-border bg-card sm:rounded-xl">
          <DialogHeader className="pr-8 text-left">
            <DialogTitle className="text-foreground">Add case record</DialogTitle>
            <p className="text-xs font-medium text-muted-foreground">
              Choose Internal or External court, then the category register for this case.
            </p>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">Layer</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/25"
                value={layer}
                onChange={(e) => {
                  const next = e.target.value as CourtLayer;
                  setLayer(next);
                  const list = next === "internal" ? internalList : externalList;
                  setCourtId(list[0]?.id ?? "");
                  if (list[0]) setCategory(list[0].categories[0]!);
                }}
              >
                <option value="internal">Internal Courts</option>
                <option value="external">External Courts</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">Court / office</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/25"
                value={courtId}
                onChange={(e) => {
                  const id = e.target.value;
                  setCourtId(id);
                  const court = findCourt(id, courts);
                  if (court) setCategory(court.categories[0]!);
                }}
              >
                {courts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {formatCourtLabel(c.name)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">Category</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/25"
                value={category}
                onChange={(e) => setCategory(e.target.value as CaseCategory)}
              >
                {(selectedCourt?.categories ?? []).map((cat) => (
                  <option key={cat} value={cat}>
                    {CASE_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setPickerOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="rounded-full bg-brand-gradient font-semibold" onClick={continueToForm}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedCourt ? (
        <CaseFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          mode="create"
          court={selectedCourt}
          category={category}
          onSubmit={async (payload) => {
            try {
              await addCase(payload);
              toast.success("Case added");
              setFormOpen(false);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed to add case");
            }
          }}
        />
      ) : null}
    </>
  );
}
