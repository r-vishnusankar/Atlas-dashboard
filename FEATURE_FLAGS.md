# Feature flags (revertable fixes)

All behavioral fixes from the sibling-progress and hardening pass are gated in **`js/config.js`** → **`CONFIG.FEATURE_FLAGS`**.

Set any flag to **`false`**, bump script `?v=` in `index.html`, hard-refresh — that slice of behavior reverts without undoing other fixes.

| Flag | Default | When `true` | When `false` (revert) |
|------|---------|-------------|------------------------|
| `SIBLING_LIST_PROGRESS` | `true` | Boot/refresh fetches sibling tabs; Overview/Directory/Pipeline use Delivery avg | Master Project tab `%` only; no parallel sibling fetches on list load |
| `POST_LIVE_DATE_RULES` | `true` | Post-live projects (`actual_live_date` + Live/Release) skip false overdue; Directory shows shipped chips; Recently Live shows “Shipped” not early/late vs CR date | Old rules: `Live -CR` can show “Xd overdue”; duplicate Upcoming + Recently Live |
| `SIBLING_FETCH_FAIL_BADGE` | `true` | Directory pill “Delivery tab sync failed” when gid fetch errors | Silent fallback to master `%` |
| `SMART_PROGRESS_MANUAL_WINS` | `true` | Empty progress cell → page ratio / stage baseline; explicit `0` kept | Legacy: `0` treated as empty → page ratio can override |
| `LOGIN_WS_FILTER_BY_USER` | `true` | Login workspace list filtered by selected user RBAC | All workspaces shown before login |
| `LOGIN_WS_SUBTITLE_FIX` | `true` | Subtitle “Workspace” | “Primary workspace” |
| `RESOURCE_FREE_FROM_FIX` | `true` | Post-live projects don’t block capacity; `freeFrom` ≥ today; overdue label | Legacy Live-only completed; past `freeFrom` with active work |
| `SIBLING_FUNNEL_STAGE` | `true` | Funnel/pipeline stage from dominant sibling `Stage` column | Master Project tab `stage` only |
| `AI_INSIGHTS` | `true` | Optional Groq narrative cards (Analytics, Overview, Project) via `serve.py` | No AI UI or API calls; all deterministic metrics unchanged |
| `RESOURCE_INTELLIGENCE` | `true` | Intelligence view, attention scores, capacity 30/60/90, intake slots, Overview/Alerts/Resources upgrades | Legacy resource map only; no `#intelligence` nav features |
| `RESOURCE_USE_PROJECTED_END` | `true` | Assignment end = max(release, velocity `projected`) for `freeFrom` | Release date only for resource timelines |
| `CLICKUP_LIST_AS_CLIENT` | `true` | Digital Marketing: ClickUp **list** name (Valoriz, Streak, …) → `client` for filters/cards | `client` from custom field / `—` only |
| `CLICKUP_DONE_STATUS` | `true` | **COMPLETE** / `closed` → `Live`, no overdue alerts; `date_closed` → go-live | Old mapping: `complete` ≠ Live; past due dates stay overdue |

**Silent auto-refresh** (60s / tab focus) is not a separate flag: `App.refresh(true)` always uses soft re-render (scroll preserved, no AI loading flash). See [DATA_AND_CALCULATIONS.md](./DATA_AND_CALCULATIONS.md) §6.

See [GROQ_AI_SETUP.md](./GROQ_AI_SETUP.md) for API key setup.

## Quick revert examples

**Revert only sibling progress (keep date fixes):**
```javascript
SIBLING_LIST_PROGRESS: false,
```

**Revert post-live CR date logic (Oscar-style sheet `Live` stage still works):**
```javascript
POST_LIVE_DATE_RULES: false,
```

**Revert only ClickUp list grouping (keep COMPLETE / overdue fix):**
```javascript
CLICKUP_LIST_AS_CLIENT: false,
```

**Revert only ClickUp done-status / overdue fix (keep list as client):**
```javascript
CLICKUP_DONE_STATUS: false,
```

**Revert all ClickUp mapping improvements:**
```javascript
CLICKUP_LIST_AS_CLIENT: false,
CLICKUP_DONE_STATUS: false,
```

**Revert everything to pre-hardening behavior:**
```javascript
FEATURE_FLAGS: {
    SIBLING_LIST_PROGRESS: false,
    POST_LIVE_DATE_RULES: false,
    SIBLING_FETCH_FAIL_BADGE: false,
    SMART_PROGRESS_MANUAL_WINS: false,
    LOGIN_WS_FILTER_BY_USER: false,
    LOGIN_WS_SUBTITLE_FIX: false,
},
```

## Git revert

Each flag maps to isolated commits in the same release; you can also `git revert` the hardening commit and keep only `SIBLING_LIST_PROGRESS` if you prefer branch-level rollback.
