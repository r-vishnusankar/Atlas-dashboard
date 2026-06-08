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

## Security

- API key stays in server `.env` only (listed in `.gitignore`)
- Browser calls same-origin `POST /api/ai/insights` only
