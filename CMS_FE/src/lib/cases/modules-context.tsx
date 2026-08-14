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

import { fetchModules, updateModules, type ModuleFlags } from "@/lib/api/settings";
import { useAuth } from "@/lib/cases/auth-context";

const DEFAULT_MODULES: ModuleFlags = {
  showInternalModule: true,
  showExternalModule: true,
  showChartsModule: true,
};

type ModulesContextValue = {
  modules: ModuleFlags;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  saveModules: (next: ModuleFlags) => Promise<ModuleFlags>;
};

const ModulesContext = createContext<ModulesContextValue | null>(null);

export function ModulesProvider({ children }: { children: ReactNode }) {
  const { token, ready: authReady } = useAuth();
  const [modules, setModules] = useState<ModuleFlags>(DEFAULT_MODULES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) {
      setModules(DEFAULT_MODULES);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchModules(token);
      setModules({ ...DEFAULT_MODULES, ...data });
      setError(null);
    } catch (err) {
      setModules(DEFAULT_MODULES);
      setError(err instanceof Error ? err.message : "Failed to load module settings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authReady) return;
    void reload();
  }, [authReady, reload]);

  const saveModules = useCallback(
    async (next: ModuleFlags) => {
      if (!token) throw new Error("Authentication required");
      const saved = await updateModules(token, next);
      setModules({ ...DEFAULT_MODULES, ...saved });
      return saved;
    },
    [token],
  );

  const value = useMemo(
    () => ({ modules, loading, error, reload, saveModules }),
    [modules, loading, error, reload, saveModules],
  );

  return createElement(ModulesContext.Provider, { value }, children);
}

export function useModules() {
  const ctx = useContext(ModulesContext);
  if (!ctx) throw new Error("useModules must be used within ModulesProvider");
  return ctx;
}
