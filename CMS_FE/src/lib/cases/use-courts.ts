import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchCourts, toCourtDefinition } from "@/lib/api/courts";
import type { CourtDefinition, CourtLayer } from "@/lib/cases/types";

type UseCourtsResult = {
  courts: CourtDefinition[];
  internal: CourtDefinition[];
  external: CourtDefinition[];
  loading: boolean;
  fromApi: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

export function useCourts(layer?: CourtLayer): UseCourtsResult {
  const [courts, setCourts] = useState<CourtDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromApi, setFromApi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCourts(layer);
      setCourts(data.map(toCourtDefinition));
      setFromApi(true);
    } catch (err) {
      setCourts([]);
      setFromApi(false);
      setError(err instanceof Error ? err.message : "Failed to load courts");
    } finally {
      setLoading(false);
    }
  }, [layer]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
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
  }, [reload]);

  const internal = useMemo(
    () => courts.filter((c) => c.layer === "internal"),
    [courts],
  );
  const external = useMemo(
    () => courts.filter((c) => c.layer === "external"),
    [courts],
  );

  return { courts, internal, external, loading, fromApi, error, reload };
}
