# Atlas — Project Mission Control · Documentation (v5.0)

> **Atlas** is a static, zero-backend project management dashboard.  
> It turns one or more Google Sheets into a live, role-aware mission control for your product & engineering team.

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Architecture](#2-architecture)
3. [File Structure](#3-file-structure)
4. [Configuration Reference (`config.js`)](#4-configuration-reference)
5. [Multi-Workspace Setup](#5-multi-workspace-setup)
6. [RBAC — Users, Roles & Permissions](#6-rbac--users-roles--permissions)
7. [Settings Board (Runtime RBAC Management)](#7-settings-board-runtime-rbac-management)
8. [Data Structure — Google Sheet Columns](#8-data-structure--google-sheet-columns)
9. [Smart Progress Logic](#9-smart-progress-logic)
10. [Dashboard Views](#10-dashboard-views)
11. [Auto-Refresh & Data Loading](#11-auto-refresh--data-loading)
12. [**Data Fields & Calculations (all pages)**](./DATA_AND_CALCULATIONS.md) — full field + formula reference
13. [Custom Dropdown System (AtlasDD)](#12-custom-dropdown-system-atlasdd)
14. [UI & Theme System](#13-ui--theme-system)
15. [Deployment](#14-deployment)
16. [Changelog](#15-changelog)

---

## 1. Quick Start

### Prerequisites
- Any modern browser (Chrome, Firefox, Edge, Safari)
- Python 3 (for local dev server) **or** any static file server

### Run Locally
```powershell
# From the project root (default port 8083)
python serve.py
# Open http://localhost:8083

# Or override: python serve.py 9000  — or set PORT=9000 in .env
```

### Default Login Credentials

| Name    | Role      | PIN  |
|---------|-----------|------|
| Admin   | admin     | 0000 |
| Alice   | manager   | 1111 |
| Bob     | developer | 2222 |
| Charlie | qa        | 3333 |

> Change these in `js/config.js` under `USERS`. See [Section 6](#6-rbac--users-roles--permissions).

### Login background image

The login screen uses a full-bleed photo background (office workspace by default).

| Item | Location |
|------|----------|
| Image folder | `assets/backgrounds/` |
| Default file | `assets/backgrounds/login-default.png` |
| Config key | `LOGIN_BACKGROUND` in `js/config.js` |

To use your own image: add it to `assets/backgrounds/`, set `LOGIN_BACKGROUND: 'assets/backgrounds/your-file.jpg'`, and refresh. See `assets/backgrounds/README.md` for details.

---

## 2. Architecture

Atlas is a **fully static, single-page application**. No server, no database, no build step.

```
Browser
  └─ index.html
       ├─ css/  (design tokens, layout, components, animations)
       └─ js/
            ├─ config.js     — all settings live here
            ├─ auth.js       — RBAC session management
            ├─ data.js       — Google Sheets CSV fetch & parse
            ├─ state.js      — reactive app state
            ├─ charts.js     — SVG chart renderers
            ├─ components.js — view HTML renderers
            └─ app.js        — boot, router, event bus
```

**Data flow:**
1. `App.init()` checks RBAC → shows login screen if needed.
2. After login, `bootAsUser()` fetches the active workspace's Google Sheet CSV.
3. `AppState` holds parsed projects; views render from state.
4. Every 60 s (and on tab focus), a cache-busted fetch updates `AppState` and **re-renders** the current view (scroll preserved).
5. Manual **Refresh** uses the same path; all widgets recalculate from the latest sheet rows.

---

## 3. File Structure

```
streak dashboard/
├── index.html                ← Single entry point
├── serve.py                  ← Local dev server (Python 3)
├── netlify.toml              ← Netlify deployment config
│
├── css/
│   ├── design-system.css     ← CSS variables, color tokens, typography
│   ├── animations.css        ← Keyframes: viewFadeIn, cardPopIn, toastIn…
│   ├── layout.css            ← App shell, sidebar, workspace switcher, AtlasDD
│   └── components.css        ← All component styles + login screen
│
├── js/
│   ├── config.js             ← ★ MAIN CONFIG — workspaces, users, roles, columns
│   ├── auth.js               ← Login UI, session (sessionStorage), RBAC checks
│   ├── data.js               ← CSV fetch, row parser, escapeHtml, loadProjects()
│   ├── state.js              ← AppState singleton (projects, filters, workspace)
│   ├── charts.js             ← Donut chart, funnel chart (pure SVG)
│   ├── components.js         ← renderOverview, renderDirectory, renderPipeline,
│   │                            renderAnalytics, renderSettings, renderFilterBar,
│   │                            atlasDD() helper
│   └── app.js                ← App, AtlasDD, SettingsCtrl controllers
│
├── DASHBOARD_DOCUMENTATION.md   ← This file
└── GOOGLE_SHEETS_GUIDE.md       ← Sheet column setup guide
```

---

## 4. Configuration Reference

All settings live in `js/config.js`. The object is **frozen** at runtime — no accidental mutations.

```js
const CONFIG = {

    // ── RBAC ────────────────────────────────────────────
    RBAC_ENABLED: true,      // false = skip login entirely
    USERS: [ ... ],          // see Section 6
    ROLES: { ... },          // see Section 6

    // ── Multi-Workspace ──────────────────────────────────
    WORKSPACES: [ ... ],     // see Section 5
    DEFAULT_WORKSPACE: 'streak',

    // ── Legacy single-sheet (backward compat) ───────────
    SHEET_CSV_URL: '...',

    // ── Behaviour ───────────────────────────────────────
    REFRESH_INTERVAL_MS: 60_000,   // background auto-refresh (ms)
    CUSTOM_SELECTS: true,          // false = revert to native <select>
    DEFAULT_SORT: 'release_date',  // release_date | progress | name | priority
    PROJECT_PAGE_LAYOUT: 'devtrack', // 'devtrack' | 'classic'
    UPCOMING_DAYS_THRESHOLD: 7,    // alert "Releasing soon" window (days)
    UPCOMING_LAUNCH_DAYS: 30,      // Overview "Upcoming Launches" horizon
    RECENTLY_LIVE_DAYS: 90,        // Overview "Recently Live" look-back
    STALLED_PROGRESS_THRESHOLD: 30,
    STALLED_DAYS_THRESHOLD: 30,

    // ── Column Mapping ───────────────────────────────────
    COLUMN_MAP: { ... },     // see Section 8

    // ── App Meta ─────────────────────────────────────────
    APP_NAME: 'Atlas',
    APP_VERSION: '1.0.0',
    TEAM_NAME: 'Product & Engineering',
};
```

---

## 5. Multi-Workspace Setup

Atlas supports **multiple client projects**, each connected to its own Google Sheet. A dropdown in the top-left sidebar lets you switch between them.

### Adding a Workspace

Edit the `WORKSPACES` array in `config.js`:

```js
WORKSPACES: [
    {
        id:       'akeneo',       // unique slug (used in URLs + RBAC)
        name:     'Akeneo',       // display name in switcher
        sheetUrl: 'https://docs.google.com/spreadsheets/d/e/XXXX/pub?output=csv',
    },
    {
        id:       'zyric',
        name:     'Zyric',
        sheetUrl: '',             // leave empty → shows "Not configured" toast
    },
    // …more workspaces
],
DEFAULT_WORKSPACE: 'akeneo',   // loaded on first visit
```

### How it Works
- The active workspace ID is persisted in `localStorage` — last selection survives refresh.
- Users can only see workspaces their role grants access to (controlled via `workspaces` on each user).
- If a user's saved workspace is not in their allowed list, Atlas auto-redirects them to their first allowed workspace on login.

### Publishing a Google Sheet as CSV
1. Open the sheet → **File → Share → Publish to web**
2. Select the tab → select **"Comma-separated values (.csv)"**
3. Click **Publish** → copy the URL
4. Paste into `sheetUrl` above

---

## 6. RBAC — Users, Roles & Permissions

### Overview
Atlas ships with full client-side RBAC. Login is **manual** (name picker + PIN) — no OAuth required. Session is stored in `sessionStorage` and expires when the tab closes.

### Defining Users

```js
USERS: [
    {
        id:         'alice',      // used as session key
        name:       'Alice',      // displayed in dropdown + sidebar chip
        role:       'manager',    // must match a key in ROLES
        pin:        '1111',       // 4+ digit PIN (stored as string)
        workspaces: '*',          // '*' = all  |  ['streak','akeneo'] = restricted
    },
    {
        id:         'bob',
        name:       'Bob',
        role:       'developer',
        pin:        '2222',
        workspaces: ['streak'],
    },
],
```

### Defining Roles

```js
ROLES: {
    admin: {
        views:   '*',      // access all sidebar views
        actions: '*',      // all toolbar actions
    },
    manager: {
        views:   ['overview','projects','pipeline','alerts','resources','timeline','analytics','intelligence'],
        actions: ['export','refresh','switchWorkspace','theme'],
    },
    developer: {
        views:   ['overview','projects','pipeline','timeline'],
        actions: ['refresh'],
    },
    qa: {
        views:   ['overview','projects','alerts'],
        actions: ['refresh'],
    },
},
```

**Available `views`:** `overview` `projects` `pipeline` `alerts` `resources` `timeline` `analytics` `intelligence` `settings`

**Available `actions`:** `export` `refresh` `switchWorkspace` `theme`

### RBAC Enforcement at Runtime
- **Sidebar nav items** hidden if `canAccessView()` returns false.
- **Toolbar buttons** (Export, Refresh, Theme) hidden per `canPerformAction()`.
- **Workspace switcher** hidden if user has only one workspace and no `switchWorkspace` action.
- **Direct URL navigation** (`#analytics`) blocked by `navigate()` guard — redirected to first allowed view.
- **Settings page** only visible to `admin` role.

### Disabling RBAC
Set `RBAC_ENABLED: false` in `config.js` — login screen is skipped and all features are accessible.

---

## 7. Settings Board (Runtime RBAC Management)

Admins can manage users and roles **without editing code** via the Settings page (sidebar → ⚙ Settings, admin-only).

### What you can do

| Feature | Description |
|---------|-------------|
| Add user | Creates a new user row with name, role, PIN |
| Edit name/PIN | Inline input in the users table |
| Change role | Dropdown per user row |
| Toggle workspaces | Chip buttons to grant/revoke workspace access |
| Delete user | Removes user (non-admin only — prevents admin self-lock) |
| Save | Persists changes to `localStorage` (survives refresh) |
| Reset to defaults | Clears `localStorage` overrides — reverts to `config.js` values |

### Storage
- Settings overrides are stored in `localStorage` under key `atlas_rbac_config`.
- On load, `Auth.liveConfig()` merges `localStorage` overrides on top of `config.js` defaults.
- To wipe runtime overrides: open Settings → click **Reset to defaults**, or run `localStorage.removeItem('atlas_rbac_config')` in the browser console.

---

## 8. Data Structure — Google Sheet Columns

The sheet must have **21 columns** matching this mapping (can be configured in `COLUMN_MAP`):

| Col | Field | Required | Description |
|:---:|:------|:--------:|:------------|
| A | `project_id` | ✓ | Unique ID, e.g. `PRJ-001` |
| B | `project_name` | ✓ | Name of the website/project |
| C | `owner` | ✓ | Internal Account Manager / PM |
| D | `client` | ✓ | Client / company name (used as "page_name") |
| E | `page_owner` | — | Secondary owner or stakeholder |
| F | `stage` | ✓ | `Backlog` `Planning` `Development` `QA` `Release` `Live` |
| G | `status` | ✓ | `on_track` `at_risk` `delayed` |
| H | `ba` | — | Business Analyst assigned |
| I | `progress` | — | Manual % (0–100) — overridden by page counts if present |
| J | `start_date` | — | `DD-MM-YYYY` or `YYYY-MM-DD` |
| K | `release_date` | — | Targeted launch date |
| L | `priority` | — | `High` `Medium` `Low` |
| M | `cms` | — | CMS type (WordPress, Shopify, etc.) |
| N | `tags` | — | Comma-separated categories |
| O | `notes` | — | Free-text internal notes |
| P | `developer` | — | Lead developer |
| Q | `qa_engineer` | — | Lead QA engineer |
| R | `total_pages` | — | Total page count in the build |
| S | `completed_pages` | — | Finalized page count |
| T | `page_priority` | — | Individual page priority rank (P0–P2) |
| U | `actual_live_date` | — | Real go-live date (used in Analytics) |

> Column letters are zero-indexed in `COLUMN_MAP` (A = 0, B = 1, …). Change the mapping in `config.js` if your sheet uses a different layout.

**Full reference:** [DATA_AND_CALCULATIONS.md](./DATA_AND_CALCULATIONS.md) — every sheet field, normalization rule, shared engines (`computeAlerts`, `computeCompletionPrediction`, `computeResourceIntelligence`, `computeOverviewDateMetrics`, `buildResourceMap`), **per-page** widget formulas (Overview, Directory, Pipeline, Alerts, Resources, Intelligence, Timeline, Analytics, Project detail, Login), and silent refresh behavior.

---

## 9. Smart Progress Logic

Progress calculation follows a strict priority hierarchy per project row:

```
1. Page-Based   → if total_pages > 0 AND completed_pages > 0 AND progress cell empty:
                  progress = (completed_pages / total_pages) × 100
2. Manual       → if progress column has any value (including 0): use it directly
3. Stage-Based  → fallback baseline by stage:
                   Backlog=0%, Planning=15%, Development=50%, QA=80%, Release=95%, Live=100%
```

Manual progress wins over page-ratio when the cell is filled in. Stage baseline applies only when progress is empty.

**List/overview progress** uses `projectDisplayProgress()` when `FEATURE_FLAGS.SIBLING_LIST_PROGRESS` is true — see [FEATURE_FLAGS.md](./FEATURE_FLAGS.md). **Project detail** uses the same `computeRoadmapMetrics` formula for “Delivery progress”.

Post-live CR/hypercare date rules (`POST_LIVE_DATE_RULES`) prevent false overdue when `actual_live_date` is in the past.

---

## 10. Dashboard Views

### Overview — The Cockpit
Bento-grid bird's-eye view: health/velocity/14-day rings, smart insights, **attention score chips** (when Resource Intelligence is on), needs attention, **Upcoming Launches** (`release_date`, next 30d), **Recently Live** (`actual_live_date`, last 90d, Live or post-live CR), deadline monitor tabs, week strip, stage funnel, team workload (all roles), and team availability. Optional Groq **AI Mission Brief** (`overview_brief`). Date widgets use `computeOverviewDateMetrics(AppState.allProjects)` on every render — see [DATA_AND_CALCULATIONS.md](./DATA_AND_CALCULATIONS.md).

### Directory
Dense searchable card grid of all projects. Supports multi-dimensional filtering:
- **Stage** filter (Backlog → Live)
- **Status** filter (On Track / At Risk / Delayed)
- **Project** filter (by client name)
- **Developer** filter
- **QA** filter
- **Sort** (Release Date / Progress / Priority / Name A-Z)

All filter controls use the **AtlasDD** custom popover dropdown (see Section 12).

### Pipeline
Dual-mode view:
- **Board**: Kanban columns grouped by stage.
- **Timeline**: Gantt-style date range view across a 4-month window.

### Alerts & Risk Centre
Auto-computed risk triage — no manual tagging needed:

| Alert | Trigger |
|-------|---------|
| 🔴 Overdue | Valid `release_date` in the past + stage ≠ Live |
| 🟡 Likely to miss | Velocity forecast: projected finish after target (`diffDays > PREDICTIVE_ALERT_MIN_SLACK_DAYS`, default 0); not overdue |
| 🔵 Releasing soon | Release within `UPCOMING_DAYS_THRESHOLD` days (default 7), not overdue and not in likely-miss |
| ⚠ Stalled | Progress &lt; `STALLED_PROGRESS_THRESHOLD`% (default 30) + started &gt; `STALLED_DAYS_THRESHOLD` days ago + not Planning/Backlog/Live |

Overview **Alerts** tab shows a prioritized mix (overdue → likely miss → stalled → upcoming). Sidebar alert count = **unique** flagged projects. Sheet `status` is for pills/filters only; placeholder `status` values are treated as `on_track`. Analytics **Predictive Completion** uses the same forecast as **Likely to miss** alerts. With Resource Intelligence, alert cards show an **Attention** score and buckets sort by score.

### Resources
Team workload grid, availability calendar, conflict detection, assignment suggestions. When **Resource Intelligence** is on: 30/60/90 capacity mini-chart and link to Intelligence view; assignment ends may use velocity-projected dates (`RESOURCE_USE_PROJECTED_END`).

**Availability rules** (computed in `buildResourceMap`, any sheet data):
- A person is **active** on distinct non-Live projects (composite stages like `Streak -Dev, Live` or `Live -CR` stay active).
- **`freeFrom`** = latest `release_date` across active projects, only when **every** active project has a dated release; otherwise `null` (shown as “Release date TBD”).
- **Conflicts** = overlapping date ranges on **different** projects (same person, two roles on one project does not count).
- Placeholder names (`None`, `Unassigned`, `TBD`, etc.) are excluded from the people map.

### Timeline
Full project calendar with date-range bars.

### Analytics
Performance reporting:
- Monthly launch velocity chart.
- Developer delivery performance (speed runners vs. bottlenecks).
- Delivery variance: `actual_live_date − release_date`.
- **Predictive Completion** + optional Groq `predictive_summary` (same velocity math as Alerts).

### Intelligence *(Manager / Admin when RBAC allows)*
Predictive resource and portfolio hub (`#intelligence`, `FEATURE_FLAGS.RESOURCE_INTELLIGENCE`):
- **Attention scores** (0–100) per non-Live project from alerts, velocity slip, workload, sibling backlog.
- **Resource release** list (next 30d) from dated assignments + projected ends.
- **Availability heatmap** and **30/60/90 utilization** by role (project-count capacity model).
- **Business intake** slots (small / medium / large) from free headcount by role.
- Optional Groq **`intelligence_brief`** executive narrative.

Overview shows top attention chips; Alerts sort by score; Directory shows critical/high tier pills.

### Settings *(Admin only)*
Runtime RBAC management — see [Section 7](#7-settings-board-runtime-rbac-management).

---

## 11. Auto-Refresh & Data Loading

- The dashboard auto-fetches the active sheet every **60 seconds** (`REFRESH_INTERVAL_MS`), with cache-busting on the CSV URL (`?_timestamp`).
- **Every successful fetch** (boot, manual refresh, auto-refresh, tab focus after 5s): master CSV → **`enrichProjectsWithSiblingMetrics`** (parallel sibling tabs) → `AppState.setProjects()` → `computeAlerts()` → **`computeResourceIntelligence()`** (if enabled) → **`renderCurrentView()`** so metrics stay in sync with the sheet.
- **Silent refresh** (`refresh(true)` — auto-refresh and tab focus): uses a **soft** re-render (`App._softRender`): scroll position preserved, no boot loading overlay, Overview rings/bars do not re-animate from zero, Groq narrative blocks are not reset to “Generating…”, project detail updates in place without the loading skeleton. See [DATA_AND_CALCULATIONS.md](./DATA_AND_CALCULATIONS.md) §6.
- **Manual refresh** (toolbar button): normal re-render + success toast + refresh icon spin.
- On workspace switch: full fetch + re-render (loading overlay).
- On error: toast notification; UI keeps the **last successful fetch** in memory until the next load.
- Overview date widgets always call `computeOverviewDateMetrics(AppState.allProjects)` at render time — see [DATA_AND_CALCULATIONS.md](./DATA_AND_CALCULATIONS.md).

---

## 12. Custom Dropdown System (AtlasDD)

All dropdowns in Atlas use a fully custom JavaScript popover — **not** native `<select>` — so they look and animate identically across all browsers and OS themes.

### Themes
| Theme | Used for | CSS class |
|-------|----------|-----------|
| Dark | Login screen | `.atlas-dd` (default) |
| Light | Filter toolbar, settings, project picker | `.atlas-dd atlas-dd--light` |

The light theme auto-flips to dark when `[data-theme="dark"]` is active on `<html>`.

### Revert to Native Selects
Set `CUSTOM_SELECTS: false` in `config.js` — all dropdowns revert to plain `<select>` elements instantly.

### Keyboard Support
- `Click` / `Enter` on trigger opens menu.
- `Escape` closes the open menu and returns focus to trigger.
- `:focus-visible` ring on trigger for screen-reader / keyboard navigation.

### Adding a New Dropdown (Developer Note)
Use the `atlasDD()` helper in `components.js`:

```js
atlasDD(
    'my-dd-id',                   // unique HTML id
    [{ value: 'a', label: 'A' }], // items array
    currentValue,                 // '' for no selection
    'Placeholder text',           // shown when nothing selected
    'filter:stage',               // action: 'filter:<key>' | 'sort' | 'login-user' | 'sibling-page' | 'settings-role:N'
    'atlas-dd--sort'              // optional extra CSS class
)
```

---

## 13. UI & Theme System

### Themes
Atlas ships with **light** and **dark** themes.
- Toggle via the 🌙 button in the top toolbar.
- Persisted in `localStorage` under `streakjs_theme`.
- Applied as `data-theme="dark"` on `<html>`.

### Design Tokens
All colours, spacing, shadows, and border radii are CSS custom properties defined in `css/design-system.css`. Override them there to rebrand the dashboard.

### Sidebar User Chip
When logged in, the sidebar footer shows a colour-coded avatar, the user's name, and their role label.

### Toast Notifications
Non-blocking pop-up messages for data load status, errors, and workspace switches. They slide in from the right and auto-dismiss after 4 s (errors: 8 s).

---

## 14. Deployment

### Netlify (Recommended)
1. Drag-and-drop the project folder onto [app.netlify.com](https://app.netlify.com).
2. `netlify.toml` is already configured with `Cache-Control: no-store` headers to prevent stale JS/CSS.

### Any Static Host (Vercel, GitHub Pages, S3, etc.)
Upload the folder contents. No build process, no `npm install`.

### Local Dev Server
```powershell
python serve.py 8083       # binds to 0.0.0.0 with no-cache headers
```
Change port as needed — any free port works.

### Important: CORS & Google Sheets
The CSV fetch uses `fetch()` — Google's published CSV endpoint supports cross-origin requests. No proxy needed.

---

## 15. Changelog

### v5.0 (May 2026) — Current
- **App renamed** from "Streak.js" to **Atlas**.
- **Multi-workspace switcher**: dropdown in sidebar top-left; each workspace has its own Google Sheet URL.
- **RBAC system**: manual login (name + PIN), `sessionStorage` session, role-based view/action gating.
- **Settings Board**: admin UI to add/edit/delete users, change roles, toggle workspace access at runtime — no code edits needed. Persisted in `localStorage`.
- **AtlasDD**: fully custom popover dropdown system replacing all native `<select>` elements. Dark + light themes, keyboard accessible, `Escape` to close, `:focus-visible` ring.
- **Project filter** added to Directory and Pipeline filter toolbars.
- **Live data refresh**: cache-busted sheet fetch; auto-refresh and tab-focus refetch; **silent soft re-render** (no visible page flicker on background updates).
- **Resource Intelligence** (`#intelligence`): attention scores, capacity 30/60/90, intake slots, release forecast; upgrades on Overview, Alerts, Resources, Directory.
- **Groq AI layer** (optional): `overview_brief`, `predictive_summary`, `intelligence_brief`, `capacity_summary`, `project_brief` via `python serve.py`.
- **Predictive alerts**: “Likely to miss” uses `computeCompletionPrediction` (same as Analytics Predictive Completion).
- **DATA_AND_CALCULATIONS.md**: full field-by-field and per-page calculation reference (including Intelligence engines).
- **Login page overhaul**: custom dropdown, card entrance animation, min-height parity with PIN field, WCAG-improved contrast, fixed-height error area, mobile-responsive padding.
- **Bug fixes**: stale dropdown on logout, duplicate event listeners on re-login, PIN whitespace edge case, RBAC event-listener leak, missing UI elements (loading overlay, toast container, hamburger button).

### v4.0
- Smart Progress Logic (page-based → manual → stage fallback).
- Analytics view (delivery variance, velocity chart).
- Kanban + Timeline pipeline modes.
- Multi-filter toolbar (Stage, Status, Developer, QA, Sort).
- Alert triage engine (Overdue, At Risk, Stalled, Upcoming).
- Dark / light theme toggle.

### v3.0
- Roadmap / project detail page (devtrack + classic layouts).
- Sibling page picker for multi-tab sheets.
- Export button (CSV download of filtered view).

### v2.0
- Google Sheets CSV integration.
- AppState singleton; filter + sort state.
- Auto-refresh with configurable interval.

### v1.0
- Initial static dashboard with mock data.

---

*Atlas v5.0 · Product & Engineering Mission Control*
