/**
 * Google PageSpeed Insights proxy helpers (mirrors api/pagespeed.py).
 */
const GOOGLE_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const ALLOWED_STRATEGIES = new Set(["mobile", "desktop"]);
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];
const TIMEOUT_MS = 90_000;
const FORBIDDEN_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function hasApiKey() {
  return Boolean((process.env.PAGESPEED_API_KEY || "").trim());
}

function isPrivateHost(host) {
  const h = String(host || "").toLowerCase().trim();
  if (!h || FORBIDDEN_HOSTS.has(h) || h.endsWith(".local") || h.endsWith(".internal")) return true;
  const parts = h.split(".");
  if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p))) {
    const a = Number(parts[0]);
    const b = Number(parts[1]);
    if (a === 10 || a === 127) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true;
  }
  return false;
}

function validateUrl(raw) {
  const t = String(raw || "").trim();
  if (!t) return null;
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    const host = (u.hostname || "").toLowerCase();
    if (!host || !host.includes(".") || isPrivateHost(host)) return null;
    return u.href;
  } catch (_) {
    return null;
  }
}

function audit(audits, key) {
  const a = (audits && audits[key]) || null;
  if (!a) return null;
  return {
    display: a.displayValue || "",
    value: a.numericValue,
    score: a.score,
  };
}

function catScore(cats, key) {
  const s = cats && cats[key] && cats[key].score;
  if (s == null || Number.isNaN(Number(s))) return null;
  return Math.round(Number(s) * 100);
}

function fieldMetric(metrics, key) {
  const m = (metrics && metrics[key]) || null;
  if (!m) return null;
  return { percentile: m.percentile, category: m.category };
}

function slimReport(psi, strategy) {
  const lh = psi.lighthouseResult || {};
  const cats = lh.categories || {};
  const audits = lh.audits || {};
  const crux = (psi.loadingExperience && psi.loadingExperience.metrics) || {};
  return {
    ok: true,
    url: psi.id || "",
    strategy,
    fetchedAt: psi.analysisUTCTimestamp || lh.fetchTime || "",
    scores: {
      performance: catScore(cats, "performance"),
      accessibility: catScore(cats, "accessibility"),
      bestPractices: catScore(cats, "best-practices"),
      seo: catScore(cats, "seo"),
    },
    metrics: {
      fcp: audit(audits, "first-contentful-paint"),
      lcp: audit(audits, "largest-contentful-paint"),
      tbt: audit(audits, "total-blocking-time"),
      cls: audit(audits, "cumulative-layout-shift"),
      si: audit(audits, "speed-index"),
      tti: audit(audits, "interactive"),
      inp: audit(audits, "interaction-to-next-paint"),
    },
    field: {
      lcp: fieldMetric(crux, "LARGEST_CONTENTFUL_PAINT_MS"),
      inp: fieldMetric(crux, "INTERACTION_TO_NEXT_PAINT")
        || fieldMetric(crux, "FIRST_INPUT_DELAY_MS"),
      cls: fieldMetric(crux, "CUMULATIVE_LAYOUT_SHIFT_SCORE"),
    },
  };
}

async function run(url, strategy) {
  const clean = validateUrl(url);
  if (!clean) {
    return { ok: false, status: 400, error: "A public http(s) website URL is required" };
  }
  let strat = String(strategy || "mobile").trim().toLowerCase();
  if (!ALLOWED_STRATEGIES.has(strat)) strat = "mobile";

  const params = new URLSearchParams();
  params.set("url", clean);
  params.set("strategy", strat);
  CATEGORIES.forEach((c) => params.append("category", c));
  const key = (process.env.PAGESPEED_API_KEY || "").trim();
  if (key) params.set("key", key);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${GOOGLE_ENDPOINT}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    const raw = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (raw.error && raw.error.message) || `PageSpeed API error (${res.status})`;
      return { ok: false, status: res.status >= 400 ? res.status : 502, error: msg };
    }
    if (!raw || !raw.lighthouseResult) {
      const msg = (raw.error && raw.error.message) || "PageSpeed returned no Lighthouse result";
      return { ok: false, status: 502, error: msg };
    }
    return slimReport(raw, strat);
  } catch (err) {
    const aborted = err && (err.name === "AbortError" || /aborted/i.test(String(err)));
    return {
      ok: false,
      status: 502,
      error: aborted ? "PageSpeed timed out — try again in a moment" : `PageSpeed request failed (${err.message || err})`,
    };
  } finally {
    clearTimeout(timer);
  }
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(payload),
  };
}

module.exports = {
  hasApiKey,
  run,
  slimReport,
  validateUrl,
  jsonResponse,
};
