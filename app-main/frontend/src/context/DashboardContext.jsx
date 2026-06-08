import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CONFIG } from "@/config";
import { fetchProjects } from "@/lib/data";
import { applyFilters } from "@/lib/helpers";

const DashboardContext = createContext(null);

const DEFAULT_FILTERS = {
  search: "",
  stages: [],
  statuses: [],
  owners: [],
  priorities: [],
  sortBy: "release",
};

export function DashboardProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const load = useCallback(async (opts) => {
    setLoading(true);
    setError(null);
    try {
      const { projects: p, source: s, ts } = await fetchProjects(opts);
      setProjects(p);
      setSource(s);
      setLastUpdate(ts);
    } catch (err) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load({ preferCache: true });
    // initial full fetch after a short delay (so cached render shows first)
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  // Auto-refresh.
  useEffect(() => {
    if (!CONFIG.REFRESH_INTERVAL) return undefined;
    timerRef.current = setInterval(() => {
      load();
    }, CONFIG.REFRESH_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [load]);

  const filtered = useMemo(() => applyFilters(projects, filters), [projects, filters]);

  const updateFilter = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const value = useMemo(
    () => ({
      projects,
      filtered,
      loading,
      source,
      lastUpdate,
      error,
      filters,
      updateFilter,
      resetFilters,
      refresh: () => load(),
    }),
    [projects, filtered, loading, source, lastUpdate, error, filters, updateFilter, resetFilters, load],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
