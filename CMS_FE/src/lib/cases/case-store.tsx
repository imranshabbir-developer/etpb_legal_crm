import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { mockCases } from "@/lib/cases/mock-cases";
import type { CaseCategory, CaseRecord, CourtLayer } from "@/lib/cases/types";

const STORAGE_KEY = "ips.cases.v1";

type CaseStoreValue = {
  cases: CaseRecord[];
  ready: boolean;
  getForCourtCategory: (courtId: string, category: CaseCategory) => CaseRecord[];
  countForCourt: (courtId: string, category?: CaseCategory) => number;
  countByLayer: (layer: CourtLayer) => number;
  countByCategory: (category: CaseCategory) => number;
  addCase: (record: Omit<CaseRecord, "id" | "srNo"> & { id?: string; srNo?: number }) => CaseRecord;
  updateCase: (id: string, patch: Partial<CaseRecord>) => CaseRecord | null;
  deleteCase: (id: string) => void;
  deleteCases: (ids: string[]) => void;
  clearCourtCategory: (courtId: string, category: CaseCategory) => number;
  resetToSeed: () => void;
};

const CaseStoreContext = createContext<CaseStoreValue | null>(null);

function loadCases(): CaseRecord[] {
  if (typeof window === "undefined") return mockCases;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(mockCases);
    const parsed = JSON.parse(raw) as CaseRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) return structuredClone(mockCases);
    return parsed;
  } catch {
    return structuredClone(mockCases);
  }
}

function persist(cases: CaseRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

function nextSrNo(cases: CaseRecord[]) {
  return cases.reduce((max, row) => Math.max(max, row.srNo), 0) + 1;
}

export function CaseProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<CaseRecord[]>(mockCases);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCases(loadCases());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    persist(cases);
  }, [cases, ready]);

  const getForCourtCategory = useCallback(
    (courtId: string, category: CaseCategory) =>
      cases.filter((c) => c.courtId === courtId && c.caseCategory === category),
    [cases],
  );

  const countForCourt = useCallback(
    (courtId: string, category?: CaseCategory) =>
      cases.filter((c) => c.courtId === courtId && (category ? c.caseCategory === category : true))
        .length,
    [cases],
  );

  const countByLayerFn = useCallback(
    (layer: CourtLayer) => cases.filter((c) => c.layer === layer).length,
    [cases],
  );

  const countByCategoryFn = useCallback(
    (category: CaseCategory) => cases.filter((c) => c.caseCategory === category).length,
    [cases],
  );

  const addCase = useCallback(
    (input: Omit<CaseRecord, "id" | "srNo"> & { id?: string; srNo?: number }) => {
      const record: CaseRecord = {
        ...input,
        id: input.id ?? `case-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        srNo: input.srNo ?? nextSrNo(cases),
      };
      setCases((prev) => [...prev, record]);
      return record;
    },
    [cases],
  );

  const updateCase = useCallback((id: string, patch: Partial<CaseRecord>) => {
    let updated: CaseRecord | null = null;
    setCases((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        updated = { ...row, ...patch, id: row.id };
        return updated;
      }),
    );
    return updated;
  }, []);

  const deleteCase = useCallback((id: string) => {
    setCases((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const deleteCases = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setCases((prev) => prev.filter((row) => !set.has(row.id)));
  }, []);

  const clearCourtCategory = useCallback((courtId: string, category: CaseCategory) => {
    let removed = 0;
    setCases((prev) => {
      const next = prev.filter((row) => !(row.courtId === courtId && row.caseCategory === category));
      removed = prev.length - next.length;
      return next;
    });
    return removed;
  }, []);

  const resetToSeed = useCallback(() => {
    setCases(structuredClone(mockCases));
  }, []);

  const value = useMemo<CaseStoreValue>(
    () => ({
      cases,
      ready,
      getForCourtCategory,
      countForCourt,
      countByLayer: countByLayerFn,
      countByCategory: countByCategoryFn,
      addCase,
      updateCase,
      deleteCase,
      deleteCases,
      clearCourtCategory,
      resetToSeed,
    }),
    [
      cases,
      ready,
      getForCourtCategory,
      countForCourt,
      countByLayerFn,
      countByCategoryFn,
      addCase,
      updateCase,
      deleteCase,
      deleteCases,
      clearCourtCategory,
      resetToSeed,
    ],
  );

  return createElement(CaseStoreContext.Provider, { value }, children);
}

export function useCaseStore() {
  const ctx = useContext(CaseStoreContext);
  if (!ctx) throw new Error("useCaseStore must be used within CaseProvider");
  return ctx;
}
