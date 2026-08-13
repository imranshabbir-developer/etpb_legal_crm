import { useMemo, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { CaseCategoryBadge } from "@/components/cases/case-category-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CASE_COLUMNS } from "@/lib/cases/case-columns";
import { CASE_CATEGORY_LABELS } from "@/lib/cases/courts";
import type { CaseRecord } from "@/lib/cases/types";

const LIST_KEYS = [
  "srNo",
  "caseNo",
  "dateOfInstitution",
  "caseTitled",
  "nameOfCounsel",
  "nextDateOfHearing",
  "caseStatus",
  "stage",
] as const satisfies ReadonlyArray<keyof CaseRecord>;

const LIST_COLUMNS = CASE_COLUMNS.filter((col) =>
  (LIST_KEYS as readonly string[]).includes(col.key),
);

type CaseTableProps = {
  cases: CaseRecord[];
  canEdit?: boolean;
  canDelete?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onView?: (row: CaseRecord) => void;
  onEdit?: (row: CaseRecord) => void;
  onDelete?: (row: CaseRecord) => void;
};

function cellValue(row: CaseRecord, key: keyof CaseRecord) {
  if (key === "caseCategory") return CASE_CATEGORY_LABELS[row.caseCategory];
  const value = row[key];
  return value === "" || value == null ? "—" : String(value);
}

export function CaseTable({
  cases,
  canEdit = false,
  canDelete = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
}: CaseTableProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cases;
    return cases.filter((c) =>
      [
        c.caseNo,
        c.caseTitled,
        c.nameOfCounsel,
        c.nameOfCourt,
        c.caseStatus,
        c.propertyLandDemandNo,
        c.lotNo,
        c.remarks,
        CASE_CATEGORY_LABELS[c.caseCategory],
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [cases, query]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((row) => selectedIds.includes(row.id));

  function toggleAll(checked: boolean) {
    if (!onSelectionChange) return;
    if (checked) {
      const merged = new Set([...selectedIds, ...filtered.map((r) => r.id)]);
      onSelectionChange([...merged]);
      return;
    }
    const drop = new Set(filtered.map((r) => r.id));
    onSelectionChange(selectedIds.filter((id) => !drop.has(id)));
  }

  function toggleOne(id: string, checked: boolean) {
    if (!onSelectionChange) return;
    if (checked) onSelectionChange([...selectedIds, id]);
    else onSelectionChange(selectedIds.filter((x) => x !== id));
  }

  const colSpan = LIST_COLUMNS.length + (selectable ? 1 : 0) + 1;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by case no, title, counsel, status…"
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring sm:max-w-sm"
        />
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {cases.length} · Open a row to see all 30 fields
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable ? (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={(v) => toggleAll(v === true)}
                    aria-label="Select all visible cases"
                  />
                </TableHead>
              ) : null}
              {LIST_COLUMNS.map((col) => (
                <TableHead key={col.key} className="whitespace-nowrap">
                  {col.short}
                </TableHead>
              ))}
              <TableHead className="sticky right-0 bg-card text-right shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.12)]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-8 text-center text-sm text-muted-foreground">
                  No cases in this register. Use Add case to create the first record.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow key={row.id} data-state={selectedIds.includes(row.id) ? "selected" : undefined}>
                  {selectable ? (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onCheckedChange={(v) => toggleOne(row.id, v === true)}
                        aria-label={`Select ${row.caseNo}`}
                      />
                    </TableCell>
                  ) : null}
                  {LIST_COLUMNS.map((col) => (
                    <TableCell
                      key={col.key}
                      className={col.key === "caseTitled" ? "min-w-[14rem] max-w-[18rem]" : "whitespace-nowrap"}
                    >
                      {col.key === "caseTitled" ? (
                        <div>
                          <p className="truncate font-medium">{row.caseTitled}</p>
                          <CaseCategoryBadge category={row.caseCategory} />
                        </div>
                      ) : col.key === "caseNo" ? (
                        <span className="font-semibold">{cellValue(row, col.key)}</span>
                      ) : (
                        cellValue(row, col.key)
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="sticky right-0 bg-card text-right shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.12)]">
                    <div className="inline-flex items-center gap-1">
                      <Button type="button" size="icon" variant="ghost" title="View all fields" onClick={() => onView?.(row)}>
                        <Eye className="size-4" />
                      </Button>
                      {canEdit ? (
                        <Button type="button" size="icon" variant="ghost" title="Edit case" onClick={() => onEdit?.(row)}>
                          <Pencil className="size-4" />
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          title="Delete case"
                          onClick={() => onDelete?.(row)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
