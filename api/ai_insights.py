"""
Groq-backed narrative insights for Atlas dashboard.
Reads structured metrics only — never replaces deterministic KPI/alert math.
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "llama-3.3-70b-versatile"
MAX_BODY_BYTES = 48_000
ALLOWED_TYPES = frozenset({
    "analytics_summary",
    "predictive_summary",
    "project_brief",
    "overview_brief",
    "intelligence_brief",
    "capacity_summary",
})

SYSTEM_PROMPT = """You are a senior delivery analytics advisor for a software project portfolio dashboard.
Rules:
- Use ONLY facts present in the JSON payload. Never invent project names, dates, or numbers.
- If data is missing, say "insufficient data" for that point.
- Be concise: 2-4 short paragraphs max for section briefs; 1 short paragraph + bullets for predictive_summary.
- Prioritize actionable risks (overdue, likely miss, stalled, conflicts, bottlenecks).
- Reference velocity forecast (diffDays) as "velocity model" not as your own prediction.
- Do not mention APIs, models, or that you are an AI.
Output plain text with optional markdown bullets (**bold** sparingly). No JSON in the response."""


def is_configured() -> bool:
    return bool((os.environ.get("GROQ_API_KEY") or "").strip())


def get_model() -> str:
    return (os.environ.get("GROQ_MODEL") or DEFAULT_MODEL).strip() or DEFAULT_MODEL


def _user_prompt(insight_type: str, payload: dict[str, Any]) -> str:
    compact = json.dumps(payload, separators=(",", ":"), default=str)
    if len(compact) > MAX_BODY_BYTES:
        compact = compact[:MAX_BODY_BYTES] + "…(truncated)"
    guides = {
        "analytics_summary": (
            "Write an executive analytics brief: on-time rate, delays, pipeline health, "
            "30d velocity, stage bottlenecks, client risks, top likely-miss projects, and 3 prioritized actions."
        ),
        "project_brief": (
            "Write a delivery brief for this single project: status, schedule risk, progress, "
            "roadmap summary if present, and 2-3 concrete next steps."
        ),
        "overview_brief": (
            "Write a weekly mission-control brief: overdue, likely miss, releasing soon, stalled, "
            "resource conflicts, bottleneck stage, and top 3 actions for the PM."
        ),
        "predictive_summary": (
            "Interpret the velocity-model forecast in likely_miss and on_track lists. "
            "Explain which projects are most at risk of missing target, why (progress vs dates), "
            "and 2-3 portfolio-level actions. Do not repeat every row — focus on patterns."
        ),
        "intelligence_brief": (
            "Executive resource intelligence brief: projects needing attention (scores), "
            "who frees in 30d, 30/60/90 utilization, business intake slots (small/medium/large), "
            "bench risk and hiring signal. Answer: what needs attention, capacity for new work, hire or bench. "
            "Cite only payload numbers."
        ),
        "capacity_summary": (
            "Summarize role utilization and freeing resources for the next 30-90 days. "
            "Highlight shortages, bench periods, and 2 staffing recommendations."
        ),
    }
    return f"Insight type: {insight_type}\nTask: {guides.get(insight_type, 'Summarize the portfolio.')}\n\nDATA:\n{compact}"


def call_groq(insight_type: str, payload: dict[str, Any]) -> dict[str, Any]:
    api_key = (os.environ.get("GROQ_API_KEY") or "").strip()
    if not api_key:
        return {"ok": False, "error": "GROQ_API_KEY not configured", "text": None}

    if insight_type not in ALLOWED_TYPES:
        return {"ok": False, "error": f"Unknown insight type: {insight_type}", "text": None}

    if not isinstance(payload, dict):
        return {"ok": False, "error": "payload must be a JSON object", "text": None}

    body = {
        "model": get_model(),
        "temperature": 0.2,
        "max_tokens": 900,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _user_prompt(insight_type, payload)},
        ],
    }
    req = urllib.request.Request(
        GROQ_URL,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            # Groq/Cloudflare rejects Python-urllib default UA (403 / error 1010)
            "User-Agent": "Atlas-Dashboard/1.0 (Groq-Insights)",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            raw = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="replace")[:500]
        return {"ok": False, "error": f"Groq HTTP {e.code}: {detail}", "text": None}
    except Exception as e:
        return {"ok": False, "error": str(e), "text": None}

    try:
        text = raw["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError):
        return {"ok": False, "error": "Unexpected Groq response shape", "text": None}

    return {"ok": True, "text": text, "error": None, "model": get_model()}


def health() -> dict[str, Any]:
    return {
        "ok": True,
        "enabled": is_configured(),
        "model": get_model() if is_configured() else None,
    }
