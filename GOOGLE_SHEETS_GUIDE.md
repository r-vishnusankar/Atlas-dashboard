# Google Sheets Integration Guide — Atlas Dashboard

> This guide covers how to connect one or more Google Sheets to Atlas, including column setup, publishing, and multi-workspace configuration.

---

## Quick Reference

| Step | What to do |
|------|-----------|
| 1 | Create your Google Sheet with the correct 21 columns |
| 2 | Publish it as CSV (File → Share → Publish to web) |
| 3 | Paste the URL into `WORKSPACES` in `js/config.js` |
| 4 | Reload the dashboard |

---

## Step 1 — Sheet Column Layout

Your sheet must have **headers in Row 1** matching these names (case-insensitive aliases are also accepted by the parser):

| Col | Header name | Required | Allowed values |
|:---:|-------------|:--------:|----------------|
| A | `project_id` | ✓ | Any unique string, e.g. `PRJ-001` |
| B | `project_name` | ✓ | Free text |
| C | `owner` | ✓ | Person's full name |
| D | `client` | ✓ | Client / company name |
| E | `page_owner` | — | Secondary owner name |
| F | `stage` | ✓ | `Backlog` `Planning` `Development` `QA` `Release` `Live` |
| G | `status` | ✓ | `on_track` `at_risk` `delayed` |
| H | `ba` | — | Business Analyst name |
| I | `progress` | — | `0`–`100` (number, no % sign) — overridden by page counts |
| J | `start_date` | — | `DD-MM-YYYY` or `YYYY-MM-DD` |
| K | `release_date` | — | Same date format |
| L | `priority` | — | `High` `Medium` `Low` |
| M | `cms` | — | e.g. `WordPress`, `Shopify` |
| N | `tags` | — | Comma-separated, e.g. `React, E-commerce` |
| O | `notes` | — | Free text |
| P | `developer` | — | Lead developer name |
| Q | `qa_engineer` | — | Lead QA engineer name |
| R | `total_pages` | — | Integer — total pages in the build |
| S | `completed_pages` | — | Integer — pages signed off |
| T | `page_priority` | — | `P0` `P1` `P2` |
| U | `actual_live_date` | — | Same date format — used in Analytics |

> **Tip:** Columns R & S (`total_pages` / `completed_pages`) drive the **Smart Progress** calculation. If they are filled in, they override the manual `progress` column automatically.

---

## Step 2 — Publish the Sheet as CSV

1. Open your Google Sheet.
2. Go to **File → Share → Publish to web**.
3. In the **first dropdown**, select your data tab (e.g. `Sheet1`).
4. In the **second dropdown**, select **"Comma-separated values (.csv)"**.
5. Click **Publish** → confirm if prompted.
6. Copy the URL — it looks like:
   ```
   https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?output=csv
   ```

> **Important:** Each tab you want to use must be published separately. The URL includes `gid=XXXXXXX` for a specific tab, or defaults to the first tab if omitted.

---

## Step 3 — Connect to Atlas (Single or Multi-Workspace)

Open `js/config.js` and update the `WORKSPACES` array:

```js
WORKSPACES: [
    {
        id:       'akeneo',
        name:     'Akeneo',
        sheetUrl: 'https://docs.google.com/spreadsheets/d/e/XXXXX/pub?output=csv',
    },
    {
        id:       'zyric',
        name:     'Zyric',
        sheetUrl: 'https://docs.google.com/spreadsheets/d/e/YYYYY/pub?output=csv',
    },
    {
        id:       'streak',
        name:     'Streak',
        sheetUrl: 'https://docs.google.com/spreadsheets/d/e/ZZZZZ/pub?output=csv',
    },
    {
        id:       'nexus',
        name:     'Nexus',
        sheetUrl: '',    // leave empty if not yet connected — shows a toast warning
    },
],
DEFAULT_WORKSPACE: 'streak',   // loaded on first visit / session restore
```

Each workspace has its own independent sheet. Switching workspaces in the UI fetches the selected sheet fresh.

---

## Step 4 — Verify

1. Start the local server: `python serve.py 8083`
2. Open `http://localhost:8083`, log in.
3. The sidebar footer should show a green **"Sheets Live"** dot.
4. If you see **"Not configured"** or a toast error, double-check the `sheetUrl` — make sure it ends with `?output=csv` and is the published (not editor) URL.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| "Could not load sheet" toast | Wrong URL or sheet not published | Re-publish and copy the new URL |
| Dashboard loads but shows 0 projects | Headers don't match column map | Check Row 1 headers against the table above |
| Progress shows 0% even though I filled column I | `total_pages` column (R) has a value — it takes priority | Clear column R/S, or fill them correctly |
| Data is stale | Browser cached old CSV | Click the manual **Refresh** button; or hard-refresh (`Ctrl+Shift+R`) |
| Sheet shows old data after editing | Google takes ~1 min to update the published CSV | Wait a moment then hit Refresh |

---

## Auto-Refresh Interval

The dashboard silently re-fetches the active sheet in the background every 60 seconds by default. Change it in `config.js`:

```js
REFRESH_INTERVAL_MS: 60_000,    // 60 seconds (default)
REFRESH_INTERVAL_MS: 30_000,    // 30 seconds
REFRESH_INTERVAL_MS: 300_000,   // 5 minutes
```

Background refreshes **do not re-render the page** — they only update internal state and metadata counters. The view refreshes only on a manual Refresh click or workspace switch.

---

## Using a Different Column Order

If your sheet has columns in a different order, update `COLUMN_MAP` in `config.js` — values are **zero-indexed** column positions:

```js
COLUMN_MAP: {
    project_id:      0,    // column A
    project_name:    1,    // column B
    owner:           2,    // column C
    client:          3,    // column D
    page_owner:      4,    // column E
    stage:           5,    // column F
    status:          6,    // column G
    ba:              7,    // column H
    progress:        8,    // column I
    start_date:      9,    // column J
    release_date:   10,    // column K
    priority:       11,    // column L
    cms:            12,    // column M
    tags:           13,    // column N
    notes:          14,    // column O
    developer:      15,    // column P
    qa_engineer:    16,    // column Q
    total_pages:    17,    // column R
    completed_pages:18,    // column S
    page_priority:  19,    // column T
    actual_live_date:20,   // column U
},
```

---

## File Structure (for reference)

```
streak dashboard/
├── index.html
├── serve.py                  ← python serve.py <port>
├── netlify.toml
├── css/
│   ├── design-system.css
│   ├── animations.css
│   ├── layout.css
│   └── components.css
├── js/
│   ├── config.js             ← ★ Configure workspaces, users, roles here
│   ├── auth.js               ← Login, session, RBAC checks
│   ├── data.js               ← CSV fetch + parser
│   ├── state.js              ← App state (projects, filters, workspace)
│   ├── charts.js             ← SVG chart renderers
│   ├── components.js         ← View renderers + atlasDD() helper
│   └── app.js                ← Boot, router, AtlasDD, SettingsCtrl
├── DASHBOARD_DOCUMENTATION.md
└── GOOGLE_SHEETS_GUIDE.md    ← This file
```

---

*Atlas v5.0 · Google Sheets Integration Guide*
