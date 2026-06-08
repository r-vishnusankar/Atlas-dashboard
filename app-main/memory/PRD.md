# Stresk Dashboard — PRD

## Original Problem Statement
Client-grade live project tracking dashboard ("Mission Control for 100+ projects"),
inspired by Google Material 3 / Linear / Google Cloud Console. Data sourced from
a **published Google Sheet (CSV)** — no backend. 5 views (Overview, Projects,
Pipeline, Alerts, Timeline), smart alert engine, search + filter + sort, auto
refresh, optional PIN gate, CSV export, Kanban drag-drop. Design language:
Google Blue (#1A73E8), Inter font, white/#F8F9FA surfaces, status traffic lights
(green/amber/red).

## User Choices (2026-02-21)
- Ship with mock data + easy config for a later Google Sheet URL
- PIN gate **enabled** by default (PIN: `1234`)
- Tech: enterprise React SPA (existing CRA + shadcn env) — no backend
- Build all 5 views in v1
- Include CSV export + Kanban drag-drop (visual only)

## Personas
- **Head of Delivery / PMO** — scans Mission Control every morning, jumps to Alerts
- **Project managers** — live Kanban + filter their owned projects
- **Clients / execs (read-only)** — PIN-gated share of the board
- **Ops / finance** — exports filtered CSV for reporting

## Architecture
- Frontend-only React 19 SPA (CRA + craco, shadcn UI, recharts, lucide, sonner)
- No backend (FastAPI `/api/` untouched but unused)
- Data layer: `lib/data.js` fetches a published Google Sheet CSV; falls back
  to seeded mock data (`lib/mockData.js`, 32 deterministic projects) when
  `CONFIG.SHEET_URL` is empty
- Client state: `context/DashboardContext.jsx` (projects, filters, refresh)
- Auto-refresh poll every 60s; localStorage cache with 5-minute TTL
- Optional PIN gate uses `sessionStorage` key `stresk.unlocked`

## What's implemented (2026-02-21)
- ✅ PIN gate (4-digit OTP, demo-unlock helper, session persistence)
- ✅ Sidebar + header shell (Inter font, Google palette, responsive)
- ✅ Overview: 4 KPI cards (count-up), pipeline funnel, status donut,
  top-alerts strip, recent activity
- ✅ Projects grid: 32 cards with progress bars, priority badges, stage pills,
  countdowns, status-colored left borders
- ✅ Filter bar: stage/status/priority/owner + sort + clear
- ✅ Global search across name/client/owner/tags
- ✅ Pipeline Kanban: 5 columns, HTML5 drag-drop (visual, toast)
- ✅ Alerts center: overdue / at-risk / stalled / upcoming groups
- ✅ Timeline Gantt: month header, colored bars, TODAY marker
- ✅ Project detail side sheet on any card click
- ✅ Header actions: refresh (toast), CSV export, print, live last-updated
- ✅ Google Sheet CSV template at `/public/stresk_sheet_template.csv`
- ✅ Mock data engine with hero profiles so alerts light up
- ✅ 26/26 functional tests pass (1 UI fix applied — Recharts donut width)

## Setup — go live with a Google Sheet
1. Use the column order in `/public/stresk_sheet_template.csv`
2. File → Share → Publish to web → pick sheet → **CSV** → Publish
3. Paste the URL into `src/config.js` → `CONFIG.SHEET_URL`
4. Reload — the "mock" pill in the header changes to "sheet"

## Backlog (prioritised)
### P1 — next likely iteration
- Public share link with token in URL (no PIN, read-only)
- Persist drag-drop visual moves across refreshes
- Per-project history / changelog pane in the side sheet
- Export the current view as PDF (styled print)

### P2
- Google Sheets API v4 mode (API key) for faster filtering and multi-tab
- Dark theme variant (tokens already CSS-var'd)
- Fuzzy-ranked search (currently substring)
- Bulk selection + tag/status edits (requires write-back)
- Workspace multi-tenant: switch between different sheet URLs

### P3
- Realtime via WebSockets / Firestore instead of polling
- Slack / email digests of daily alerts
- Per-owner workload heatmap
