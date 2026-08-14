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

import {
  clearCourtCategoryApi,
  createCaseApi,
  deleteCaseApi,
  deleteCasesApi,
  fetchAllCases,
  updateCaseApi,
} from "@/lib/api/cases";
import { useAuth } from "@/lib/cases/auth-context";
import type { CaseCategory, CaseRecord, CourtLayer } from "@/lib/cases/types";

type CaseStoreValue = {
  cases: CaseRecord[];
  ready: boolean;
  fromApi: boolean;
  error: string | null;
  reload: () => Promise<void>;
  getForCourtCategory: (courtId: string, category: CaseCategory) => CaseRecord[];
  countForCourt: (courtId: string, category?: CaseCategory) => number;
  countByLayer: (layer: CourtLayer) => number;
  countByCategory: (category: CaseCategory) => number;
  addCase: (
    record: Omit<CaseRecord, "id" | "srNo"> & { id?: string; srNo?: number },
  ) => Promise<CaseRecord>;
  updateCase: (id: string, patch: Partial<CaseRecord>) => Promise<CaseRecord | null>;
  deleteCase: (id: string) => Promise<void>;
  deleteCases: (ids: string[]) => Promise<void>;
  clearCourtCategory: (courtId: string, category: CaseCategory) => Promise<number>;
};

const CaseStoreContext = createContext<CaseStoreValue | null>(null);

export function CaseProvider({ children }: { children: ReactNode }) {
  const { token, ready: authReady } = useAuth();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [fromApi, setFromApi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) {
      setCases([]);
      setFromApi(false);
      setError(null);
      setReady(true);
      return;
    }

    try {
      setError(null);
      const data = await fetchAllCases(token);
      setCases(data);
      setFromApi(true);
    } catch (err) {
      setFromApi(false);
      setError(err instanceof Error ? err.message : "Failed to load cases");
      setCases([]);
    } finally {
      setReady(true);
    }
  }, [token]);

  useEffect(() => {
    if (!authReady) return;
    void reload();
  }, [authReady, reload]);

  useEffect(() => {
    if (!authReady || !token) return;

    const refreshInterval = window.setInterval(() => {
      void reload();
    }, 30_000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void reload();
    };

    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [authReady, reload, token]);

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
    async (input: Omit<CaseRecord, "id" | "srNo"> & { id?: string; srNo?: number }) => {
      if (!token) throw new Error("Authentication required");
      const created = await createCaseApi(token, input);
      setCases((prev) => [...prev, created]);
      return created;
    },
    [token],
  );

  const updateCase = useCallback(
    async (id: string, patch: Partial<CaseRecord>) => {
      if (!token) throw new Error("Authentication required");
      const updated = await updateCaseApi(token, id, patch);
      setCases((prev) => prev.map((row) => (row.id === id ? updated : row)));
      return updated;
    },
    [token],
  );

  const deleteCase = useCallback(
    async (id: string) => {
      if (!token) throw new Error("Authentication required");
      await deleteCaseApi(token, id);
      setCases((prev) => prev.filter((row) => row.id !== id));
    },
    [token],
  );

  const deleteCases = useCallback(
    async (ids: string[]) => {
      if (!token) throw new Error("Authentication required");
      await deleteCasesApi(token, ids);
      const set = new Set(ids);
      setCases((prev) => prev.filter((row) => !set.has(row.id)));
    },
    [token],
  );

  const clearCourtCategory = useCallback(
    async (courtId: string, category: CaseCategory) => {
      if (!token) throw new Error("Authentication required");
      const result = await clearCourtCategoryApi(token, courtId, category);
      setCases((prev) =>
        prev.filter((row) => !(row.courtId === courtId && row.caseCategory === category)),
      );
      return result.removed;
    },
    [token],
  );

  const value = useMemo<CaseStoreValue>(
    () => ({
      cases,
      ready,
      fromApi,
      error,
      reload,
      getForCourtCategory,
      countForCourt,
      countByLayer: countByLayerFn,
      countByCategory: countByCategoryFn,
      addCase,
      updateCase,
      deleteCase,
      deleteCases,
      clearCourtCategory,
    }),
    [
      cases,
      ready,
      fromApi,
      error,
      reload,
      getForCourtCategory,
      countForCourt,
      countByLayerFn,
      countByCategoryFn,
      addCase,
      updateCase,
      deleteCase,
      deleteCases,
      clearCourtCategory,
    ],
  );

  return createElement(CaseStoreContext.Provider, { value }, children);
}

export function useCaseStore() {
  const ctx = useContext(CaseStoreContext);
  if (!ctx) throw new Error("useCaseStore must be used within CaseProvider");
  return ctx;
}
