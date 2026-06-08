// -----------------------------------------------------------------------------
// Data layer: fetch from a published Google Sheet CSV (or fall back to mock).
// -----------------------------------------------------------------------------
import { CONFIG } from "@/config";
import { csvToProjects } from "@/lib/helpers";
import { MOCK_PROJECTS } from "@/lib/mockData";

const readCache = () => {
  try {
    const raw = localStorage.getItem(CONFIG.CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.ts || Date.now() - parsed.ts > CONFIG.CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeCache = (projects, source) => {
  try {
    localStorage.setItem(
      CONFIG.CACHE_KEY,
      JSON.stringify({ ts: Date.now(), projects, source }),
    );
  } catch {
    /* quota exceeded — ignore */
  }
};

/**
 * Fetch the current project list.
 * @param {{ preferCache?: boolean }} opts
 * @returns {Promise<{projects: Array, source: 'sheet'|'mock'|'cache', ts: number}>}
 */
export async function fetchProjects({ preferCache = false } = {}) {
  if (preferCache) {
    const cached = readCache();
    if (cached) {
      return { projects: cached.projects, source: "cache", ts: cached.ts };
    }
  }

  if (CONFIG.SHEET_URL) {
    try {
      const res = await fetch(CONFIG.SHEET_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
      const text = await res.text();
      const projects = csvToProjects(text);
      if (!projects.length) throw new Error("Empty sheet");
      writeCache(projects, "sheet");
      return { projects, source: "sheet", ts: Date.now() };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[stresk] Sheet fetch failed, using mock data.", err);
    }
  }

  const projects = MOCK_PROJECTS;
  writeCache(projects, "mock");
  return { projects, source: "mock", ts: Date.now() };
}
