# Groq AI Insights (optional)

Atlas keeps **all KPIs, alerts, and predictions deterministic** in `js/data.js`. Groq adds **read-only narrative** on top — it never changes counts or alert membership.

## Setup

1. `pip install -r requirements.txt` (optional `python-dotenv`)
2. Copy `.env.example` → `.env` and set `GROQ_API_KEY` (put the real key in **`.env` only**, not in `.env.example`)
3. Restart: `python serve.py` (default **http://localhost:8083** — or `PORT` in `.env`, or `python serve.py 9000`)
4. Hard-refresh the dashboard at that URL (not port 8080 unless you pass it explicitly)

## Disable without removing code

In `js/config.js` → `FEATURE_FLAGS`:

```javascript
AI_INSIGHTS: false,              // no Groq UI or API calls
RESOURCE_INTELLIGENCE: false,  // no Intelligence nav, scores, or capacity forecast
```

Deterministic KPIs, alerts, and Predictive Completion still work when AI or Intelligence flags are off.

## Where it appears

| View | Type | Data sent |
|------|------|-----------|
| Analytics → **Predictive Completion** | `predictive_summary` | Same velocity rows as the card (likely miss / on track lists) |
| Analytics (via `mountAnalytics`) | routes to Predictive Completion AI only |
| **Intelligence** | `intelligence_brief` | Attention scores, capacity 30/60/90, intake slots, hiring/bench flags |
| Resources | `capacity_summary` | Role utilization weeks, freeing in 30d |
| Overview | `overview_brief` | Alert counts, conflicts, top risks (+ intelligence summary when enabled) |
| Project detail | `project_brief` | Single project + velocity forecast + roadmap summary |

Responses are cached in `sessionStorage` for 15 minutes per workspace snapshot.

## Netlify (production)

The static site on Netlify uses **serverless functions** in `netlify/functions/` so the same `/api/ai/*` paths work without `serve.py`.

### 1. Add env vars on Netlify

1. [Netlify](https://app.netlify.com) → your site → **Site configuration** → **Environment variables**
2. Add:
   - **`GROQ_API_KEY`** — your Groq key (same value as local `.env`)
   - **`GROQ_MODEL`** (optional) — e.g. `llama-3.3-70b-versatile`
3. **Deploys** → **Trigger deploy** → **Deploy site** (new deploy required after adding secrets)

CLI alternative:

```bash
netlify env:set GROQ_API_KEY "gsk_your_key_here"
netlify env:set GROQ_MODEL "llama-3.3-70b-versatile"
```

### 2. How it works

| Path | Function |
|------|----------|
| `GET /api/ai/health` | `netlify/functions/ai-health.js` |
| `POST /api/ai/insights` | `netlify/functions/ai-insights.js` |

`netlify.toml` rewrites those URLs to `/.netlify/functions/…` (before the SPA `index.html` catch-all).

### 3. Verify on live site

Open DevTools → Network:

1. Load Overview or Analytics with `AI_INSIGHTS: true`
2. You should see `GET /api/ai/health` → `{ "ok": true, "enabled": true, … }`
3. AI cards should call `POST /api/ai/insights` and return narrative text

If `enabled: false`, the key is missing or the site was not redeployed after setting env vars.

**Local dev** still uses `python serve.py` + `.env` — Netlify functions run only on Netlify (or `netlify dev`).

## Security

- API key stays in server `.env` (local) or **Netlify env vars** (production) — never in frontend JS
- Browser calls same-origin `POST /api/ai/insights` only
