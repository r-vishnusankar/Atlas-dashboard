/**
 * Groq proxy — mirrors api/ai_insights.py for Netlify Functions.
 * GROQ_API_KEY and optional GROQ_MODEL come from Netlify env vars.
 */
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const MAX_BODY_BYTES = 48_000;

const ALLOWED_TYPES = new Set([
  "analytics_summary",
  "predictive_summary",
  "project_brief",
  "overview_brief",
  "intelligence_brief",
  "capacity_summary",
]);

const SYSTEM_PROMPT = `You are a senior delivery analytics advisor for a software project portfolio dashboard.
Rules:
- Use ONLY facts present in the JSON payload. Never invent project names, dates, or numbers.
- If data is missing, say "insufficient data" for that point.
- Be concise: 2-4 short paragraphs max for section briefs; 1 short paragraph + bullets for predictive_summary.
- Prioritize actionable risks (overdue, likely miss, stalled, conflicts, bottlenecks).
- Reference velocity forecast (diffDays) as "velocity model" not as your own prediction.
- Do not mention APIs, models, or that you are an AI.
Output plain text with optional markdown bullets (**bold** sparingly). No JSON in the response.`;

function isConfigured() {
  return Boolean((process.env.GROQ_API_KEY || "").trim());
}

function getModel() {
  return (process.env.GROQ_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL;
}

function userPrompt(insightType, payload) {
  let compact = JSON.stringify(payload);
  if (compact.length > MAX_BODY_BYTES) {
    compact = compact.slice(0, MAX_BODY_BYTES) + "…(truncated)";
  }
  const guides = {
    analytics_summary:
      "Write an executive analytics brief: on-time rate, delays, pipeline health, " +
      "30d velocity, stage bottlenecks, client risks, top likely-miss projects, and 3 prioritized actions.",
    project_brief:
      "Write a delivery brief for this single project: status, schedule risk, progress, " +
      "roadmap summary if present, and 2-3 concrete next steps.",
    overview_brief:
      "Write a weekly mission-control brief: overdue, likely miss, releasing soon, stalled, " +
      "resource conflicts, bottleneck stage, and top 3 actions for the PM.",
    predictive_summary:
      "Interpret the velocity-model forecast in likely_miss and on_track lists. " +
      "Explain which projects are most at risk of missing target, why (progress vs dates), " +
      "and 2-3 portfolio-level actions. Do not repeat every row — focus on patterns.",
    intelligence_brief:
      "Executive resource intelligence brief: projects needing attention (scores), " +
      "who frees in 30d, 30/60/90 utilization, business intake slots (small/medium/large), " +
      "bench risk and hiring signal. Answer: what needs attention, capacity for new work, hire or bench. " +
      "Cite only payload numbers.",
    capacity_summary:
      "Summarize role utilization and freeing resources for the next 30-90 days. " +
      "Highlight shortages, bench periods, and 2 staffing recommendations.",
  };
  const task = guides[insightType] || "Summarize the portfolio.";
  return `Insight type: ${insightType}\nTask: ${task}\n\nDATA:\n${compact}`;
}

async function callGroq(insightType, payload) {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  if (!apiKey) {
    return { ok: false, error: "GROQ_API_KEY not configured", text: null };
  }
  if (!ALLOWED_TYPES.has(insightType)) {
    return { ok: false, error: `Unknown insight type: ${insightType}`, text: null };
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "payload must be a JSON object", text: null };
  }

  const body = {
    model: getModel(),
    temperature: 0.2,
    max_tokens: 900,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt(insightType, payload) },
    ],
  };

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "Atlas-Dashboard/1.0 (Groq-Insights)",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45_000),
    });

    const rawText = await res.text();
    if (!res.ok) {
      const detail = rawText.slice(0, 500);
      return { ok: false, error: `Groq HTTP ${res.status}: ${detail}`, text: null };
    }

    const raw = JSON.parse(rawText);
    const text = raw?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return { ok: false, error: "Unexpected Groq response shape", text: null };
    }
    return { ok: true, text, error: null, model: getModel() };
  } catch (err) {
    return { ok: false, error: err.message || String(err), text: null };
  }
}

function health() {
  return {
    ok: true,
    enabled: isConfigured(),
    model: isConfigured() ? getModel() : null,
  };
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
  callGroq,
  health,
  jsonResponse,
};
