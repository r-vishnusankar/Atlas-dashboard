# Atlas — Data Fields & Calculations Reference

> **Source of truth:** Published Google Sheet CSV for the active workspace (`CONFIG.WORKSPACES[].sheetUrl`).  
> **Runtime store:** `AppState.allProjects` (replaced on every fetch; no project-data cache in `localStorage`).  
> **Recalculation:** `AppState.setProjects()` → `computeAlerts()` → `computeResourceIntelligence()` (when `RESOURCE_INTELLIGENCE`); views read live rows at render time.

See also: [DASHBOARD_DOCUMENTATION.md](./DASHBOARD_DOCUMENTATION.md) for setup, RBAC, and deployment.

---

## Table of Contents

1. [Data pipeline](#1-data-pipeline)
2. [Master sheet — all fields](#2-master-sheet--all-fields)
3. [Parsing & derived fields](#3-parsing--derived-fields)
4. [Normalization rules](#4-normalization-rules)
5. [Config thresholds](#5-config-thresholds)
6. [Shared calculation engines](#6-shared-calculation-engines)
7. [Calculations by page](#7-calculations-by-page)
8. [Project detail — sibling tab](#8-project-detail--sibling-tab)
9. [Login screen](#9-login-screen)
10. [Date parsing](#10-date-parsing)

---

## 1. Data pipeline

```
Google Sheet (published CSV, cache-busted)
    → loadProjects()           [js/data.js]
    → parseCSV()               header map + COLUMN_MAP fallback
    → normalizeStage/Status/Priority, smart progress
    → AppState.setProjects()
         ├─ allProjects[]
         ├─ alerts = computeAlerts(allProjects)
         └─ lastUpdated, dataSource
    → renderCurrentView()      every boot / refresh / auto-refresh / tab focus
         └─ per-view functions read AppState.allProjects (and alerts)
```

| Trigger | Fetches sheet? | Re-renders UI? |
|---------|----------------|----------------|
| Boot / login | Yes | Yes |
| Manual refresh | Yes | Yes (scroll preserved) |
| Auto-refresh (60s) | Yes | Yes |
| Tab visible again (≥5s since last fetch) | Yes | Yes |
| Workspace switch | Yes | Yes |
| Navigate between views | No | Yes (from current `AppState`) |
| Overview deadline tabs (Alerts / Overdue / 30d) | No | Partial (task list only) |
| Auto-refresh / tab focus (`refresh(true)`) | Yes | Yes — **soft** re-render (no full-page flash; scroll preserved; AI text kept) |

---

## 2. Master sheet — all fields

Headers are matched by name (case-insensitive, spaces → `_`). If the first row has `project_id` or `project_name`, **header mapping** is used; otherwise legacy **column letters** from `CONFIG.COLUMN_MAP` apply.

| Internal field | Sheet aliases (headers) | Legacy col | Type | Used for |
|----------------|-------------------------|:----------:|------|----------|
| `project_id` | `project_id`, `id` | A | string | Identity, links, export |
| `project_name` | `project_name`, `name`, `title` | B | string | Display name (required row) |
| `owner` | `owner`, `pm` | C | string | Cards, resources, filters, login team count |
| `client` | `page_name`, `client` | D | string | Display, search, client filter, scorecard |
| `page_owner` | `page_owner` | E | string | Resource map |
| `stage` | `stage`, `phase` | F | string → normalized | Pipeline, funnel, alerts skip Live, filters |
| `status` | `status`, `health` | G | string → normalized | Health pills, at-risk alerts, KPIs |
| `ba` | `ba` | H | string | Resource map, project detail |
| `progress` | `progress`, `pct`, `percent`, `%` | I | 0–100 | Bars, stalled, predictive, sort |
| `start_date` | `start_date`, `start` | J | date string | Duration, stalled, timeline, resources |
| `release_date` | `release_date`, `release`, `target_date`, `target` | K | date string | Launches, overdue, alerts, timeline end |
| `priority` | `priority` | L | High/Medium/Low | Sort, filter, client scorecard |
| `cms` | `cms`, `stack` | M | string | Project detail aside |
| `tags` | `tags`, `categories` | N | comma-list | Search, project detail |
| `notes` | `notes`, `comments` | O | string | Project detail |
| `developer` | `developer`, `dev` | P | string | Resource map, filters |
| `qa_engineer` | `qa`, `qa_engineer`, `q_a` | Q | string | Resource map, filters |
| `total_pages` | `total_pages`, `total_page` | R | int | Progress override, directory, roadmap fallback |
| `completed_pages` | `completed_pages`, `complete_pages`, `done_pages` | S | int | Progress override, directory |
| `page_priority` | `page_priority` | T | P0–P2 | Directory tag |
| `actual_live_date` | `actual_live_date`, `go_live`, `live_date` | U | date string | Recently live, analytics, calendar |
| `current_page` | `current_page`, `current page` | — | string | Parsed; limited UI use |
| `detail_gid` | `detail_gid`, `sibling_gid`, `tab_gid`, … | — | string | Sibling CSV URL (tab id) |
| `detail_csv_url` | `detail_csv_url`, `sibling_csv_url`, … | — | URL | Overrides `detail_gid` for sibling fetch |

**Not stored:** Raw stage string after parse (only normalized `stage` is kept).

---

## 3. Parsing & derived fields

### Smart progress (`parseCSV`)

Applied per row after column read:

| Priority | Condition | `progress` value |
|:--------:|-----------|------------------|
| 1 | `total_pages > 0` AND `completed_pages > 0` AND manual `progress` cell **empty** | `round(completed / total × 100)` |
| 2 | Manual `progress` cell has any value (including `0`) | Use manual 0–100 |
| 3 | Else empty manual | Stage baseline: Backlog 0%, Planning 15%, Development 50%, QA 80%, Release 95%, Live 100% |

### Sibling enrichment (`enrichProjectsWithSiblingMetrics`)

After the master Project tab CSV loads (boot, refresh, workspace switch):

1. For each row with `detail_gid` or `detail_csv_url`, fetch the sibling tab (concurrency 4).
2. Run `computeRoadmapMetrics` on sibling headers/rows.
3. Attach `project.roadmap = { hasSibling, avgPct, total, live, inprog, pending, … }`.

**Display progress** (`projectDisplayProgress(p)`):

| Condition | UI % |
|-----------|------|
| `p.roadmap.hasSibling` and `avgPct` computed | Sibling Delivery avg (same as project detail “Delivery progress”) |
| Else | Master Project tab `progress` |

Used on: Overview rings/bars, Directory, Pipeline, Timeline labels, Analytics (avg, predictive, dev velocity), `AppState.avgProgress`, stalled alerts, sort-by-progress.

Project detail still fetches the full sibling table on navigation/refresh for the roadmap grid; list views use the enriched `roadmap` snapshot.

**Stage funnel / pipeline** (`projectFunnelStage`): when `SIBLING_FUNNEL_STAGE` is on, uses the **most common** normalized stage from sibling tab rows (e.g. all `Streak_QA` → project counts under **QA**), else master Project tab `stage`.

### Feature flags (revertable)

All hardening toggles live in `js/config.js` → `CONFIG.FEATURE_FLAGS`. See [FEATURE_FLAGS.md](./FEATURE_FLAGS.md).

**ClickUp (Digital Marketing workspace)** — `js/data.js` → `mapClickUpTaskToProject`:

| Flag | Behavior |
|------|----------|
| `CLICKUP_LIST_AS_CLIENT` | ClickUp list name (sidebar project, e.g. Valoriz) → `client`; custom **Client** field overrides when set. |
| `CLICKUP_DONE_STATUS` | Status **COMPLETE** / `status.type === closed` / `date_closed` → `stage: Live`, `clickupComplete`, skipped in `computeAlerts`; go-live from `date_closed` or due date. |

**ClickUp volume:** `CONFIG.CLICKUP_MAX_TASKS` (default **200**) — paginates 100 tasks/page until cap or `last_page`. Raise in `js/config.js` if you need more.

### Enriched alert rows (`computeAlerts`)

Copied onto alert list items:

| Field | Formula |
|-------|---------|
| `daysToRelease` | `ceil(release_date - today)` in days, or `null` |
| `daysOverdue` | `abs(daysToRelease)` when overdue |
| `daysOld` | `ceil(today - start_date)` when start valid |
| `diffDays` | Predictive slip: `projected − target` in days (at_risk bucket only) |
| `projected` | Velocity-based projected completion date |
| `target` | Parsed `release_date` |
| `predProgress` | `projectDisplayProgress` used in the forecast |

### Overview date metrics (`computeOverviewDateMetrics`)

Computed at render from `AppState.allProjects` (not persisted):

| Output | Rule |
|--------|------|
| `upcomingLaunches` | `qualifiesAsUpcomingLaunch` (see §6) |
| `recentlyLive` | `qualifiesAsRecentlyLive` (see §6) |
| `critical14d` | Valid `release_date` in [today, today+14] |
| `milestones30d` | Same as upcoming 30d + `daysToRelease` |

### Resource map person (`buildResourceMap`)

Per person name (from owner, developer, qa, ba, page_owner):

| Field | Meaning |
|-------|---------|
| `assignments[]` | Per project: `start`, `end`, `stage`, `status`, `completed` |
| `activeCount` | Distinct non-Live project IDs |
| `conflicts[]` | Overlapping windows on **different** projects |
| `freeFrom` | Latest `end` among **active** (non-shipped) projects when all have dates; else `null`. With `RESOURCE_FREE_FROM_FIX`: shipped = Live or past `actual_live_date`; `freeFrom` never before today. |

Assignment `end` date:

- **Live** + valid `actual_live_date` → `actual_live_date`
- Else valid `release_date` → `release_date`
- Else `null` (blocks “fully dated” free-from)

---

## 4. Normalization rules

### `stage` (`normalizeStage`)

| Input pattern | Normalized |
|---------------|------------|
| Exact map: backlog, planning, development, qa, release, live, … | Fixed stage name |
| Contains **qa** / testing / **Streak_QA** / **Streak - QA** | `QA` (checked **before** dev/streak; `_` = space) |
| Contains dev/streak/-dev / UI -Dev / Story - Req | `Development` |
| Contains release/staging | `Release` |
| Contains -cr / change request / hyper | `Release` |
| Contains live (after above) | `Live` |
| Default | `Backlog` |

**Note:** `Live -CR` → `Release` (CR wins). Used for “Recently Live” via `hasPastGoLive` (Release + past `actual_live_date`).

### `status` (`normalizeStatus`)

| Input | Result |
|-------|--------|
| Empty, or literal `status` | `on_track` |
| on track, good, green | `on_track` |
| at risk, risk, yellow | `at_risk` |
| delayed, overdue, red, blocked | `delayed` |
| Unknown | `on_track` |

### `priority` (`normalizePriority`)

`high` → High, `medium`/`med` → Medium, `low` → Low, else Medium.

### `page_priority` (`normalizePagePriority`)

`p0`/`p1`/`p2` → P0/P1/P2.

---

## 5. Config thresholds

| Key | Default | Used in |
|-----|---------|---------|
| `UPCOMING_DAYS_THRESHOLD` | 7 | Alert bucket “Releasing soon” |
| `UPCOMING_LAUNCH_DAYS` | 30 | Overview Upcoming Launches, 30d milestones |
| `RECENTLY_LIVE_DAYS` | 90 | Overview Recently Live |
| `STALLED_PROGRESS_THRESHOLD` | 30 | Stalled alert (progress %) |
| `STALLED_DAYS_THRESHOLD` | 30 | Stalled alert (days since start) |
| `PREDICTIVE_ALERT_MIN_SLACK_DAYS` | 0 | Likely-miss alert: flag when `diffDays` exceeds this |
| `REFRESH_INTERVAL_MS` | 60000 | Auto sheet fetch |

**Resource Intelligence** (`CONFIG` objects, see `js/config.js`):

| Key | Purpose |
|-----|---------|
| `ATTENTION_WEIGHTS` | Weights for `computeAttentionScore` (overdue, at_risk, diffDays, workload, etc.) |
| `CAPACITY.maxProjectsPerPerson` | Per-role project-count cap (Developer, QA, BA, Owner, Page owner) |
| `CAPACITY.lowUtilThreshold` | Fraction (e.g. 0.4) — weeks below → bench risk signal |
| `INTAKE.small` / `medium` / `large` | `{ heads, days, roles }` for business intake slot counts |

**Feature flags:** `RESOURCE_INTELLIGENCE`, `RESOURCE_USE_PROJECTED_END`, `AI_INSIGHTS` — see [FEATURE_FLAGS.md](./FEATURE_FLAGS.md).

---

## 6. Shared calculation engines

### `computeCompletionPrediction(project)` — `js/data.js`

Shared velocity forecast (Alerts **at_risk** bucket and Analytics). Returns `null` when Live, missing dates, or `projectDisplayProgress ≤ 0`.

| Output | Formula |
|--------|---------|
| `diffDays` | `round(projected − target)` in days |
| `projected` | `start + round(daysElapsed / (progress/100))` days (capped) |
| `target` | Parsed `release_date` |
| `progress` | `projectDisplayProgress(project)` |

### `computeAlerts(projects)` — `js/data.js`

Skips projects with `stage === 'Live'`. `alertTotalCount` = **unique** flagged projects (`getUniqueAlertProjects`), not sum of bucket sizes.

| Bucket | Conditions (all non-Live) |
|--------|---------------------------|
| **overdue** | Valid `release_date` AND `daysToRelease < 0` (excludes post-live CR) |
| **at_risk** | Not overdue AND `computeCompletionPrediction` has `diffDays > PREDICTIVE_ALERT_MIN_SLACK_DAYS` |
| **upcoming** | Not overdue, not in at_risk: release in [0, `UPCOMING_DAYS_THRESHOLD`] days |
| **stalled** | `projectDisplayProgress < STALLED_PROGRESS_THRESHOLD` AND `daysOld > STALLED_DAYS_THRESHOLD` AND stage not Planning/Backlog/Live |

Sheet `status` (`at_risk` / `delayed`) does **not** drive alert buckets; it remains on Directory cards and filters only.

### `qualifiesAsUpcomingLaunch(p, today, windowDays)`

- `stage !== 'Live'`
- `release_date` valid (not TBD)
- `release_date` ∈ [today, today + windowDays]

### `qualifiesAsRecentlyLive` / `hasPastGoLive`

- Valid `actual_live_date` ≤ today
- `stage === 'Live'` OR `stage === 'Release'` (post-live CR)
- Live date within last `RECENTLY_LIVE_DAYS`
- **Excludes** Dev/Planning with pre-filled live dates (not Live/Release stage)

### `calcProjectDuration(p)` — `js/components.js`

| Case | End date |
|------|----------|
| Live + valid `actual_live_date` | `actual_live_date` |
| In progress | Today |
| Missing/invalid `start_date` | `null` |

### `calcHealthScore()` — Overview hero

- Pool: all projects where `stage !== 'Live'`
- `score = round((total - unique alert projects) / total × 100)`
- Unique alerts = `getPrioritizedAlerts` deduped by project id

### `AppState` getters — `js/state.js`

| Getter | Calculation |
|--------|-------------|
| `filteredProjects` | Search + filters + `sortProjects` |
| `liveCount` | `stage === 'Live'` count |
| `inProgress` | stage not Live or Planning |
| `avgProgress` | Mean of `projectDisplayProgress(p)` |
| `stageCounts` | Count per Planning…Live |
| `uniqueOwners/Devs/QAs/Clients` | Distinct field values |
| `resourceMap` | `buildResourceMap(allProjects)` (cached when intelligence on) |
| `getAnalyticsData()` | Monthly live counts; variance `release - actual` for Live rows |
| `attentionRanked` | `computeAttentionRanked` — non-Live projects with 0–100 score |
| `capacityForecast` | `computeRoleCapacityForecast` — weekly utilization by role (~90d) |
| `intakeRecommendation` | `computeBusinessIntakeCapacity` — small/medium/large slot counts |
| `intelligenceSummary` | Executive KPI object for Intelligence view + AI payload |

### Resource Intelligence (`FEATURE_FLAGS.RESOURCE_INTELLIGENCE`) — `js/data.js`

Recomputed in `AppState.setProjects()` via `computeResourceIntelligence()`.

#### `computeAttentionScore(project)`

Weighted score (cap 100), tier `critical` | `high` | `medium` | `low`. Factors: alert bucket, `computeCompletionPrediction.diffDays`, owner/dev workload & conflicts, sibling `pending/total`, sheet `delayed` (minor). Weights in `CONFIG.ATTENTION_WEIGHTS`.

#### `projectAssignmentEnd` + `RESOURCE_USE_PROJECTED_END`

When flag on, active assignment end uses `max(release_date, projected)` from velocity model so resource release aligns with Predictive Completion.

#### `computeRoleCapacityForecast`

Per role (Developer, QA, BA, Owner, Page owner): 13 weekly buckets; utilization % = active assignments / `CONFIG.CAPACITY.maxProjectsPerPerson[role]`. Summary: bench risk weeks (util below `lowUtilThreshold`), shortage weeks, `freeingNext30`.

#### `computeBusinessIntakeCapacity`

Counts people free per role at 30/60/90d horizons; intake slots = `min(role free counts)` per `CONFIG.INTAKE` spec.

### Silent background refresh (`App.refresh(true)`) — `js/app.js`

Does **not** show the boot loading overlay. Updates data then re-renders with `App._softRender`:

| Behavior | Detail |
|----------|--------|
| DOM swap | `_setViewContent()` — preserves scroll, optional `min-height`, class `content-area--soft-update` (no CSS animations) |
| Overview | Skips 60ms ring/bar animation; `_applyViewPaint()` applies fills immediately |
| Groq cards | `opts.soft` — keeps existing `.ai-insights-text` (no “Generating…” flash) |
| Project detail | `_silentRefreshProjectPage()` — no loading skeleton; in-place HTML swap |
| Sidebar | `updateSidebarMeta()` only updates counts/text nodes |

Manual refresh (`refresh(false)`) uses normal render + toast + spinner on the refresh button.

---

## 7. Calculations by page

### Overview (`renderOverview`)

Uses **`AppState.allProjects`** for date widgets (not `filteredProjects`).

| Widget | Fields | Logic |
|--------|--------|-------|
| **Pipeline Health ring** | `stage`, `alerts` | `calcHealthScore()` |
| **30-day Velocity** | `actual_live_date` | `buildVelocitySparkline(6)` — count go-lives per calendar month; hero shows sum of last 2 months |
| **Next 14 Days ring** | `release_date` | `computeOverviewDateMetrics().critical14d` |
| **Hero stats** | `status`, alerts | on_track count; `alertAtRiskCount`; `alertOverdueCount` |
| **Smart insights** | all + alerts + `resourceMap` | Overdue/upcoming/at-risk/stalled counts; conflicts; last shipped; bottleneck stage; `avgProgress` |
| **Attention scores** (RI on) | `attentionRanked` | Top 3 critical/high chips → link to Intelligence |
| **Needs Attention** | `alerts` | Top 5 `getPrioritizedAlerts`; progress ring via `projectDisplayProgress` |
| **Team workload** (RI on) | `resourceMap` | Top 6 people by `activeCount` (all roles), not owners only |
| **Upcoming Launches** | `release_date`, `stage` | Top 4 of `upcomingLaunches`; countdown days; progress bar via `projectDisplayProgress` |
| **Recently Live** | `actual_live_date`, `stage`, `release_date` | Top 3 `recentlyLive`; early/late badge: `release - actual` days |
| **Deadline Monitor — Alerts** | `alerts` | `getPrioritizedAlerts(6)` |
| **Deadline Monitor — Overdue** | `alerts.overdue` | Full overdue list |
| **Deadline Monitor — 30d Ahead** | `release_date` | `milestones30d` slice(6) |
| **This Week strip** | `release_date`, `alerts` | Mon–Sun dots; week release count |
| **Stage funnel** | `stage`, `alerts` | Count per stage; overdue/alert chips |
| **Team status grid** | `owner`, `status`, `resourceMap` | Per-owner workload |
| **Availability / freeing** | `resourceMap` | `freeFrom`, conflicts |
| **Donut / release histogram** | `release_date` | Distribution of release dates |

### Directory / Projects (`renderProjects`)

Input: **`AppState.filteredProjects`** (search, filters, sort).

| UI element | Fields |
|------------|--------|
| Card stage/status | `stage`, `status` |
| Alert pill | `alertBucketFor(id, alerts)` |
| Attention pill (RI on) | `attentionTier` critical/high via `getAttentionForProject` |
| Time chips (live) | `start_date`, `actual_live_date`, `calcProjectDuration` |
| Time chips (active) | `start_date`, `release_date`, `getRelativeDate` |
| Pages | `total_pages`, `completed_pages`, `page_priority` |
| Progress bar | `projectDisplayProgress(p)`, `status` |
| Avatar | `owner` |
| Sort options | `release_date`, `progress`, `priority`, `name` |

**Filters:** `stage`, `status`, `owner`, `priority`, `developer`, `qa`, `client`  
**Search:** `name`, `client`, `owner`, `id`, `tags`

### Pipeline (`renderPipeline`)

Input: **`filteredProjects`**.

| Mode | Fields |
|------|--------|
| **Kanban columns** | `stage` (group), `id`, `name`, `status`, `total_pages`, `completed_pages`, `page_priority`, `release_date`, `progress` |
| **Timeline (embedded)** | See Timeline |

### Alerts (`renderAlerts`)

Source: **`AppState.alerts`** (rebuilt on every `setProjects`).

| Section | Card reason (via `alertCardReason`) |
|---------|-------------------------------------|
| Overdue | `Xd overdue` · target date |
| Likely to miss | `+diffDays projected slip` · proj vs target · progress % |
| Stalled | `% after Nd` · stalled copy |
| Upcoming | `in Xd` · release approaching |
| Sort order (RI on) | `attentionScore` descending within each bucket |
| Card badge (RI on) | `Attention {score}` on each alert card |

### Resources (`renderResources`)

Source: **`AppState.resourceMap`** (computed getter).

| Section | Fields |
|---------|--------|
| People cards | `assignments` (from owner/dev/qa/ba/page_owner), `conflicts`, `freeFrom`, `activeCount` |
| Conflict detail | Overlap days between project windows (`start_date`, `release_date` or `actual_live_date`) |
| Availability calendar | `freeFrom` per person |
| Unassigned callout | Projects missing owner/dev/qa |
| Capacity mini (RI on) | `capacityForecast` — Dev/QA/BA bars at 30/60/90d week indices |
| AI capacity (optional) | Groq `capacity_summary` embed |

### Intelligence (`renderIntelligence`)

Requires `FEATURE_FLAGS.RESOURCE_INTELLIGENCE`. Source: `AppState.intelligenceSummary`, `attentionRanked`, `capacityForecast`, `intakeRecommendation`.

| Section | Data |
|---------|------|
| Executive KPI strip | critical/high counts, freeing 30d, avg util %, intake slots, bench/hire signal |
| Projects needing attention | Top 12 `attentionRanked` (score, tier, reasons) |
| Resource release 30d | `capacityForecast.summary.freeingNext30` |
| Availability heatmap | 13 weekly cells per role (`utilizationPct`) |
| Utilization 30/60/90 | Week indices 0, 4, 12 per role |
| Business opportunity | `intake.small` / `medium` / `large` |
| AI brief (optional) | Groq `intelligence_brief` |

### Timeline — Gantt (`renderTimeline`)

Input: **`filteredProjects`** (Gantt) or **`allProjects`** (calendar mode toggle).

| Element | Fields |
|---------|--------|
| Bar start | `start_date` (fallback: today) |
| Bar end | `release_date` (fallback: today+30d) |
| Bar label | `progress`, `status` |
| Row meta | `name`, `stage` |
| Sort | `start_date` |

### Timeline — Calendar (`renderTimelineCalendar`)

Input: **`allProjects`**.

| Event type | Field | Color |
|------------|-------|-------|
| Go-live | `actual_live_date` | Green |
| Release | `release_date` | Red |
| Start | `start_date` | Blue |

Summary: future release count, future start count, total live events.

### Analytics (`renderAnalytics`)

Input: **`AppState.allProjects`**.

| Section | Fields | Formula |
|---------|--------|---------|
| **On-Time Rate** | `release_date`, `actual_live_date`, `stage` | Live projects where `actual <= release` / all live with both dates |
| **Avg Delay** | same | Mean `(actual - release)` days for late lives |
| **Pipeline Health** | `stage`, `status` | % active (not Live/Backlog) with `status === on_track` |
| **Velocity 30d** | `actual_live_date` | Live count in last 30 days |
| **Delivery Velocity chart** | `actual_live_date`, `release_date` | Per month (6 mo): on-time vs late go-live |
| **Stage heatmap** | `stage`, `start_date` | Count per stage; avg days since `start_date` (non-Live) |
| **Client scorecard** | `client`, `stage`, `priority`, dates | Active/live counts; on-time %; delay; H/M/L counts |
| **Predictive completion** | `start_date`, `release_date`, `progress`, `status`, `stage` | `computeCompletionPrediction` / `buildPredictiveList`; optional Groq `predictive_summary` |
| **Team leaderboards** | `getAnalyticsData()` | Variance `release - actual` for Live; speed runners / laggards |

### Project detail (`renderProjectPage`)

**Master row:** all project fields above.

**Sibling tab** (optional second CSV via `detail_gid` / `detail_csv_url`):

| Master fields | Sibling-driven |
|---------------|----------------|
| Header, meta, milestones | Roadmap table from arbitrary columns |
| KPI cards | `computeRoadmapMetrics` OR `computeMetricsFromMaster` |

`computeMetricsFromMaster` uses: `total_pages`, `completed_pages`, `stage`, `progress`.

`computeRoadmapMetrics` uses sibling columns (by header alias): `stage`, `status`, `progress`, title column.

**Aside panel fields:** `client`, `owner`, `ba`, `developer`, `qa_engineer`, `cms`, `progress`, `release_date`, `actual_live_date`, `notes`, `tags`, `calcProjectDuration`.

### Settings

No sheet calculations — RBAC in `localStorage` only.

### Sidebar / global chrome

| Element | Source |
|---------|--------|
| Nav counts | `allProjects.length`, pipeline non-terminal count, `alertTotalCount`, live count |
| Sync indicator | `dataSource`, `lastUpdated` |
| Search | Filters `filteredProjects` on projects/pipeline/timeline views |

---

## 8. Project detail — sibling tab

Fetched separately: `loadProjectSiblingData(project, sheetBaseUrl)` → published CSV.

| Master field | Role |
|--------------|------|
| `detail_csv_url` | Full URL (preferred) |
| `detail_gid` | Tab id → built URL from **active workspace** `sheetUrl` (or `CONFIG.SHEET_CSV_URL`) |

Sibling sheet: **any columns**; headers matched by alias (e.g. `stage`, `progress`, `developer`). Row metrics override master KPIs when rows exist. List/overview views pre-fetch siblings via `enrichProjectsWithSiblingMetrics` so progress matches detail without opening each project.

---

## 9. Login screen

| Stat | Fields | Logic |
|------|--------|-------|
| Active projects | `stage` | Count where `stage !== 'Live'` |
| Team members | `owner`, `developer`, `qa_engineer`, `ba`, `page_owner` | Unique non-empty names |

Always **fresh fetch** from login workspace sheet URL (`_lpFetchLoginStats`).

---

## 10. Date parsing

`parseSmartDate(str)` — `js/data.js`

| Format | Example | Notes |
|--------|---------|-------|
| Placeholder | TBD, N/A, — | Invalid |
| Sheets serial | `45413` | Days since 1899-12-30 |
| ISO | `2026-05-31` | |
| DD-Mon-YYYY | `20-Mar-2026` | Local calendar date |
| DD-MM-YYYY / DD/MM/YYYY | `10-04-2026` | **Day first** (10 April) |
| Fallback | `new Date(str)` | Browser parse |

Comparisons use `startOfDay()` where noted to avoid timezone drift.

**Early / late badge:** `round((release_date - actual_live_date) / 1 day)` — positive = shipped before target.

---

## Quick reference — which fields drive alerts & dates

| Business question | Primary fields |
|-------------------|----------------|
| When is it launching? | `release_date`, `stage` |
| Did it ship? | `actual_live_date`, `stage` |
| Is it late? | `release_date`, `stage`, today |
| Is it stuck? | `progress`, `start_date`, `stage` |
| Is it unhealthy? | `status` |
| Who is overloaded? | `owner`, `developer`, `qa_engineer`, `ba`, `page_owner`, `start_date`, `release_date`, `actual_live_date`, `stage` |
| How complete is it? | `total_pages`, `completed_pages`, `progress`, `stage` |

---

*Last aligned with codebase: Overview live refresh, `computeOverviewDateMetrics`, `qualifiesAsRecentlyLive` / `hasPastGoLive`.*
