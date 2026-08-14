import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/cases/auth-context";
import { useCaseStore } from "@/lib/cases/case-store";
import { CASE_CATEGORY_LABELS } from "@/lib/cases/courts";
import type { CaseRecord } from "@/lib/cases/types";
import { cn } from "@/lib/utils";

function matchesQuery(row: CaseRecord, q: string) {
  const hay = [
    row.caseNo,
    row.caseTitled,
    row.nameOfCounsel,
    row.propertyLandDemandNo,
    row.nameOfCourt,
    row.caseStatus,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export function CaseSearch({ className, inputClassName }: { className?: string; inputClassName?: string }) {
  const { can } = useAuth();
  const { cases, ready } = useCaseStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [] as CaseRecord[];
    return cases.filter((row) => matchesQuery(row, q)).slice(0, 8);
  }, [cases, query]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  if (!can("cases:view")) return null;

  function goToCase(row: CaseRecord) {
    setOpen(false);
    setQuery("");
    const to = row.layer === "internal" ? "/internal/$courtId/$category" : "/external/$courtId/$category";
    void navigate({
      to,
      params: { courtId: row.courtId, category: row.caseCategory },
    });
  }

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "Enter" && results[0]) {
            e.preventDefault();
            goToCase(results[0]!);
          }
        }}
        placeholder={ready ? "Search case no, title, counsel…" : "Loading cases…"}
        disabled={!ready}
        className={cn("pl-9", inputClassName)}
        aria-label="Search cases"
        aria-expanded={open}
        aria-controls="case-search-results"
      />
      {open && query.trim().length >= 2 ? (
        <div
          id="case-search-results"
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 overflow-hidden rounded-xl border border-border/60 bg-card/95 shadow-soft backdrop-blur-xl"
          role="listbox"
        >
          {results.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-muted-foreground">No matching cases.</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {results.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    role="option"
                    className="flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors hover:bg-primary-soft/50"
                    onClick={() => goToCase(row)}
                  >
                    <span className="truncate text-sm font-semibold">{row.caseNo}</span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {row.caseTitled || "Untitled"} · {CASE_CATEGORY_LABELS[row.caseCategory]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
