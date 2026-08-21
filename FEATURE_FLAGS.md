# Feature Flags — Atlas Dashboard

All flags live in `js/config.js → CONFIG.FEATURE_FLAGS`. Set any to `false` to revert that individual behavior.

---

## Active Flags

| Flag | Default | What it controls |
|------|---------|-----------------|
| `SIBLING_LIST_PROGRESS` | `true` | Overview/Directory progress % comes from sibling Delivery tab average (avgPct); falls back to master Project tab % |
| `POST_LIVE_DATE_RULES` | `true` | Post-live CR projects (stage=Release + past actual_live_date) don't trigger "overdue" alerts; shown as "Shipped" in Recently Live |
| `SIBLING_FETCH_FAIL_BADGE` | `true` | Directory pill badge when sibling tab fetch fails (falls back to master %) |
| `SMART_PROGRESS_MANUAL_WINS` | `true` | Empty progress cell → page-ratio or stage baseline; explicit cell value always wins (including `0`) |
| `LOGIN_WS_FILTER_BY_USER` | `true` | Login workspace picker filtered to the selected user's allowed workspaces |
| `LOGIN_WS_SUBTITLE_FIX` | `true` | Login picker subtitle reads "Workspace" (not "Primary workspace") |
| `RESOURCE_FREE_FROM_FIX` | `true` | Post-live = done for capacity; `freeFrom` clamped to today when all active ends have passed |
| `SIBLING_FUNNEL_STAGE` | `true` | Stage funnel / pipeline column driven by dominant sibling tab Stage when linked |
| `AI_INSIGHTS` | `true` | Groq narrative insights (requires GROQ_API_KEY in .env + `python serve.py`). Off = zero UI/API calls |
| `RESOURCE_INTELLIGENCE` | `true` | Resource Intelligence engines, Intelligence view, attention scores, capacity forecast |
| `RESOURCE_TRACKER` | `true` | Resources page: Delivery / Manager switch + roster from Resource-management sheet |
| `RESOURCE_USE_PROJECTED_END` | `true` | Resource assignment end = `max(release_date, velocity-projected)` |
| `CLICKUP_LIST_AS_CLIENT` | `true` | ClickUp: list name (Valoriz, Streak, …) → project `client` for filters/cards |
| `CLICKUP_DONE_STATUS` | `true` | ClickUp: COMPLETE/closed → Live, skip overdue alerts; go-live inferred from date_closed |
| `CLICKUP_SUBTASK_ENRICH` | `true` | ClickUp: enrich tasks with subtasks → roadmap.pages (page-level funnel/analytics) |
| `SIBLING_RESOURCE_MAP` | `true` | Resource map built from sibling tab rows (per-page Developer/QA/Page owner); master row fallback |
| `PROJECT_WEBSITE_PREVIEW` | `true` | Directory thumbnails + Visit website. Uses Project tab `preview_image` when set; otherwise auto-screenshot of `website_url` |
| `PAGESPEED_INSIGHTS` | `true` | Project page: Google PageSpeed Insights for the live site. Defaults to the homepage (`website_url`). Optional `PAGESPEED_API_KEY` in `.env` |
| `SILENT_REFRESH_REPAINT` | `false` | Auto/tab silent refresh repaints the current view. Off = fetch sheet data only (sidebar counts update; no `#content-area` DOM swap). Manual Refresh always repaints |

---

## Audit Fixes (2026-06-16)

| Flag | Default | Bug fixed |
|------|---------|-----------|
| `SIBLING_AVG_PCT_EXCLUDE_BLANK` | `true` | **#1/#10** Only count sibling/subtask rows with a non-blank progress value in avgPct. Prevents blank rows dragging the delivery-progress average toward 0 |
| `CLICKUP_PAGE_OWNER_FIX` | `true` | **#2** ClickUp tasks get `page_owner='—'` instead of copying the owner field. Stops the first assignee appearing twice in the resource map (Owner + Page owner) |
| `HEALTH_SCORE_UNIFIED` | `true` | **#3** Pipeline Health card headline % and bar widths both use non-Live projects as denominator, matching the hero ring formula. Both numbers agree |
| `AT_RISK_ZERO_PROGRESS` | `true` | **#5** Projects with 0% progress within the upcoming-deadline window are flagged `at_risk` (likely miss) instead of just "releasing soon" |
| `SPARKLINE_MONTH_FIX` | `true` | **#9** Velocity sparkline uses today as the end boundary for the current-month bucket; go-lives this month counted correctly (was always 0) |

---

## Calculation Notes

### Pipeline Health — three places, intentionally different formulas

| Location | Pool | Formula | Signal |
|----------|------|---------|--------|
| Overview hero ring (`calcHealthScore`) | Non-Live projects | `(nonLive − unique alert projects) / nonLive × 100` | Algorithmic alert-based |
| Overview Pipeline Health card (`renderPipelineHealthCard`) | Non-Live projects (with `HEALTH_SCORE_UNIFIED`) | Same formula; bars also use non-Live denominator | Matches hero ring |
| Analytics KPI (`renderAnalytics`) | Active projects (non-Live AND non-Backlog) | `on_track_status_projects / active × 100` | Sheet `status` field |

The Analytics "Pipeline Health" uses the sheet `status` column (`on_track`/`at_risk`/`delayed`), not the alert engine — it measures user-set health vs algorithmic detection.

### avgProgress

`AppState.avgProgress` = mean of `projectDisplayProgress(p)` across **all** projects, including Live (100% each). The KPI strip label "across all projects" reflects this. Active-only average can be derived by filtering `stage !== 'Live'` if needed.

### liveCount vs stage pipeline "Live"

`AppState.liveCount` uses `projectCountsAsShipped(p)` which includes post-live CR projects (stage=Release + past actual_live_date). The stage funnel uses literal `stage === 'Live'`. With `POST_LIVE_DATE_RULES` on, `liveCount` can be higher than the funnel "Live" count — this is intentional.
