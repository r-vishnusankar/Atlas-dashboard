"""
Google PageSpeed Insights proxy for Atlas.
Returns a slim report for the project homepage (or another public http(s) URL).
Optional PAGESPEED_API_KEY raises Google quota; the API works without a key too.
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

GOOGLE_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
ALLOWED_STRATEGIES = frozenset({"mobile", "desktop"})
CATEGORIES = ("performance", "accessibility", "best-practices", "seo")
TIMEOUT_S = 90

_FORBIDDEN_HOSTS = frozenset({"localhost", "127.0.0.1", "0.0.0.0", "::1"})


def has_api_key() -> bool:
    return bool((os.environ.get("PAGESPEED_API_KEY") or "").strip())


def _is_private_host(host: str) -> bool:
    h = (host or "").lower().strip()
    if not h or h in _FORBIDDEN_HOSTS or h.endswith(".local") or h.endswith(".internal"):
        return True
    parts = h.split(".")
    if len(parts) == 4 and all(p.isdigit() for p in parts):
        a, b = int(parts[0]), int(parts[1])
        if a == 10 or a == 127:
            return True
        if a == 192 and b == 168:
            return True
        if a == 172 and 16 <= b <= 31:
            return True
        if a == 169 and b == 254:
            return True
    return False


def validate_url(raw: str) -> str | None:
    t = (raw or "").strip()
    if not t:
        return None
    try:
        u = urllib.parse.urlparse(t)
    except Exception:
        return None
    if u.scheme not in ("http", "https"):
        return None
    host = (u.hostname or "").lower()
    if not host or "." not in host or _is_private_host(host):
        return None
    return u.geturl()


def _audit(audits: dict, key: str) -> dict | None:
    a = audits.get(key) or {}
    if not a:
        return None
    return {
        "display": a.get("displayValue") or "",
        "value": a.get("numericValue"),
        "score": a.get("score"),
    }


def _cat_score(cats: dict, key: str) -> int | None:
    s = (cats.get(key) or {}).get("score")
    if s is None:
        return None
    try:
        return int(round(float(s) * 100))
    except (TypeError, ValueError):
        return None


def _field_metric(metrics: dict, key: str) -> dict | None:
    m = metrics.get(key) or {}
    if not m:
        return None
    return {
        "percentile": m.get("percentile"),
        "category": m.get("category"),
    }


def slim_report(psi: dict[str, Any], strategy: str) -> dict[str, Any]:
    lh = psi.get("lighthouseResult") or {}
    cats = lh.get("categories") or {}
    audits = lh.get("audits") or {}
    crux = (psi.get("loadingExperience") or {}).get("metrics") or {}
    return {
        "ok": True,
        "url": psi.get("id") or "",
        "strategy": strategy,
        "fetchedAt": psi.get("analysisUTCTimestamp") or lh.get("fetchTime") or "",
        "scores": {
            "performance": _cat_score(cats, "performance"),
            "accessibility": _cat_score(cats, "accessibility"),
            "bestPractices": _cat_score(cats, "best-practices"),
            "seo": _cat_score(cats, "seo"),
        },
        "metrics": {
            "fcp": _audit(audits, "first-contentful-paint"),
            "lcp": _audit(audits, "largest-contentful-paint"),
            "tbt": _audit(audits, "total-blocking-time"),
            "cls": _audit(audits, "cumulative-layout-shift"),
            "si": _audit(audits, "speed-index"),
            "tti": _audit(audits, "interactive"),
            "inp": _audit(audits, "interaction-to-next-paint"),
        },
        "field": {
            "lcp": _field_metric(crux, "LARGEST_CONTENTFUL_PAINT_MS"),
            "inp": _field_metric(crux, "INTERACTION_TO_NEXT_PAINT")
            or _field_metric(crux, "FIRST_INPUT_DELAY_MS"),
            "cls": _field_metric(crux, "CUMULATIVE_LAYOUT_SHIFT_SCORE"),
        },
    }


def run(url: str, strategy: str = "mobile") -> dict[str, Any]:
    clean = validate_url(url)
    if not clean:
        return {"ok": False, "status": 400, "error": "A public http(s) website URL is required"}
    strat = (strategy or "mobile").strip().lower()
    if strat not in ALLOWED_STRATEGIES:
        strat = "mobile"

    params = [("url", clean), ("strategy", strat)]
    for cat in CATEGORIES:
        params.append(("category", cat))
    key = (os.environ.get("PAGESPEED_API_KEY") or "").strip()
    if key:
        params.append(("key", key))

    endpoint = GOOGLE_ENDPOINT + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(endpoint, method="GET", headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_S) as resp:
            raw = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        msg = f"PageSpeed API error ({e.code})"
        try:
            err = json.loads(body)
            msg = (err.get("error") or {}).get("message") or msg
        except Exception:
            pass
        return {"ok": False, "status": e.code if e.code >= 400 else 502, "error": msg}
    except Exception as e:
        return {"ok": False, "status": 502, "error": f"PageSpeed request failed ({e})"}

    if not isinstance(raw, dict) or not raw.get("lighthouseResult"):
        err = (raw.get("error") or {}).get("message") if isinstance(raw, dict) else None
        return {"ok": False, "status": 502, "error": err or "PageSpeed returned no Lighthouse result"}
    return slim_report(raw, strat)
