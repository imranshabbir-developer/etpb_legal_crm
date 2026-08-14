import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createCourtApi } from "@/lib/api/courts";
import { useAuth } from "@/lib/cases/auth-context";
import { CASE_CATEGORY_LABELS } from "@/lib/cases/courts";
import type { CaseCategory, CourtLayer } from "@/lib/cases/types";
import { cn } from "@/lib/utils";

const ALL_CATEGORIES: CaseCategory[] = [
  "decided-cases",
  "pending-cases",
  "restraining-order",
  "direction-cases",
];

const INTERNAL_DEFAULT: CaseCategory[] = [...ALL_CATEGORIES];
const EXTERNAL_DEFAULT: CaseCategory[] = ["restraining-order", "direction-cases"];

type AddCourtDialogProps = {
  layer: CourtLayer;
  onCreated?: () => void;
  className?: string;
};

export function AddCourtDialog({ layer, onCreated, className }: AddCourtDialogProps) {
  const { can, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<CaseCategory[]>(
    layer === "internal" ? INTERNAL_DEFAULT : EXTERNAL_DEFAULT,
  );
  const [saving, setSaving] = useState(false);

  if (!can("courts:manage")) return null;

  function toggleCategory(cat: CaseCategory) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  async function handleCreate() {
    if (!token) {
      toast.error("Please sign in again");
      return;
    }
    if (name.trim().length < 2) {
      toast.error("Enter a court / office name");
      return;
    }
    if (categories.length === 0) {
      toast.error("Select at least one category");
      return;
    }

    setSaving(true);
    try {
      await createCourtApi(token, {
        name: name.trim(),
        layer,
        categories,
      });
      toast.success("Court added to database");
      setOpen(false);
      setName("");
      setCategories(layer === "internal" ? INTERNAL_DEFAULT : EXTERNAL_DEFAULT);
      onCreated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create court");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={cn("rounded-full font-semibold", className)}
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        Add court
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-border bg-card sm:rounded-xl">
          <DialogHeader className="pr-8 text-left">
            <DialogTitle className="text-foreground">
              Add {layer === "internal" ? "internal" : "external"} court
            </DialogTitle>
            <p className="text-xs font-medium text-muted-foreground">
              Creates a new court in the database. Category links and case registers will use this
              court immediately.
            </p>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">Court / office name</Label>
              <input
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/25"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  layer === "internal" ? "e.g. ADDITIONAL ADMINISTRATOR" : "e.g. TRIBUNAL XYZ"
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">Categories</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {ALL_CATEGORIES.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2 text-xs font-medium"
                  >
                    <input
                      type="checkbox"
                      checked={categories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    {CASE_CATEGORY_LABELS[cat]}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-brand-gradient font-semibold"
              onClick={() => void handleCreate()}
              disabled={saving}
            >
              {saving ? "Saving..." : "Create court"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
