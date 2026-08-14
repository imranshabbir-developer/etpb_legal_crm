import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
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
import { updateCourtApi } from "@/lib/api/courts";
import { useAuth } from "@/lib/cases/auth-context";
import { CASE_CATEGORY_LABELS } from "@/lib/cases/courts";
import type { CaseCategory, CourtDefinition } from "@/lib/cases/types";

const ALL_CATEGORIES: CaseCategory[] = [
  "decided-cases",
  "pending-cases",
  "restraining-order",
  "direction-cases",
];

export function EditCourtDialog({
  court,
  onUpdated,
}: {
  court: CourtDefinition;
  onUpdated?: () => void;
}) {
  const { can, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(court.name);
  const [categories, setCategories] = useState<CaseCategory[]>(court.categories);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(court.name);
    setCategories(court.categories);
  }, [court]);

  if (!can("courts:manage")) return null;

  function toggleCategory(category: CaseCategory) {
    setCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  async function save(isActive = true) {
    if (!token) return;
    if (name.trim().length < 2 || categories.length === 0) {
      toast.error("Court name and at least one category are required");
      return;
    }
    setSaving(true);
    try {
      await updateCourtApi(token, court.id, {
        name: name.trim(),
        categories,
        isActive,
      });
      toast.success(isActive ? "Court updated" : "Court deactivated");
      setOpen(false);
      onUpdated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update court");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 rounded-full px-2 text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
        onClick={() => setOpen(true)}
      >
        <Pencil className="size-3.5" />
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-border bg-card sm:rounded-xl">
          <DialogHeader className="pr-8 text-left">
            <DialogTitle>Edit court / office</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Court / office name</Label>
              <input
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Categories</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {ALL_CATEGORIES.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 rounded-lg border border-border/60 px-2.5 py-2 text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={categories.includes(category)}
                      onChange={() => toggleCategory(category)}
                    />
                    {CASE_CATEGORY_LABELS[category]}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="rounded-full text-destructive"
              disabled={saving}
              onClick={() => void save(false)}
            >
              Deactivate
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={saving}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-full bg-brand-gradient font-semibold"
                disabled={saving}
                onClick={() => void save(true)}
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
