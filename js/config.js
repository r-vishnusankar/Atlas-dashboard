/**
 * STRESK DASHBOARD — Configuration
 * ─────────────────────────────────────────────────────────
 * To connect to a live Google Sheet:
 *
 *  1. Open your Google Sheet
 *  2. File → Share → Publish to web
 *  3. Choose "Entire Document" and "Comma-separated values (.csv)"
 *  4. Click Publish and copy the URL
 *  5. Paste it as SHEET_CSV_URL below
 *
 * Sheet must have headers matching COLUMN_MAP (or the header aliases in data.js).
 * Optional on the **Project** tab: **detail_gid** (tab id for a sibling detail sheet) or
 * **detail_csv_url** (full published CSV URL to that tab; overrides detail_gid when set).
 * ─────────────────────────────────────────────────────────
 */

const CONFIG = {

    // ── RBAC — Users & Roles ────────────────────────────
    // Add team members here. Each user has: id, name, role, pin, workspaces.
    // workspaces: '*' = all  |  array of workspace ids = restricted access
    // Roles control which sidebar views and actions are available.
    RBAC_ENABLED: true,

    USERS: [
        { id: 'admin', name: 'Admin', displayName: 'Admin User', role: 'admin', roleLabel: 'Admin', pin: '0000', workspaces: '*', avatarColor: '#0D9488' },
        { id: 'alice', name: 'Alice', displayName: 'Alice Johnson', role: 'manager', roleLabel: 'Manager', pin: '1111', workspaces: '*', avatarColor: '#6366F1' },
        { id: 'bob', name: 'Bob', displayName: 'Bob Smith', role: 'developer', roleLabel: 'Developer', pin: '2222', workspaces: ['streak'], avatarColor: '#3B82F6' },
        { id: 'charlie', name: 'Charlie', displayName: 'Charlie Lee', role: 'qa', roleLabel: 'QA Engineer', pin: '3333', workspaces: ['streak'], avatarColor: '#EC4899' },
    ],

    // Role definitions: views = sidebar nav items, actions = toolbar buttons
    ROLES: {
        admin: {
            views: '*',   // all views (includes intelligence)
            actions: '*',   // export, refresh, switchWorkspace, theme
        },
        manager: {
            views: ['overview', 'projects', 'pipeline', 'alerts', 'resources', 'timeline', 'analytics', 'intelligence', 'performance'],
            actions: ['export', 'refresh', 'switchWorkspace', 'theme'],
        },
        developer: {
            views: ['overview', 'projects', 'pipeline', 'timeline'],
            actions: ['refresh'],
        },
        qa: {
            views: ['overview', 'projects', 'alerts'],
            actions: ['refresh'],
        },
    },

    // ── Multi-Workspace (Project Switcher) ──────────────
    // Add each client/project here. `sheetUrl` = published Google Sheet CSV URL.
    // File → Share → Publish to web → Comma-separated values (.csv)
    // Leave sheetUrl as '' for projects not yet connected — the switcher will show them as "Not configured".
    WORKSPACES: [
        {
            id: 'akeneo',
            name: 'Akeneo',
            displayName: 'Akeneo Dashboard',
            integrationType: 'google_sheets',
            sheetUrl: '',
        },
        {
            id: 'zyric',
            name: 'Zyric',
            integrationType: 'google_sheets',
            sheetUrl: '',
        },
        {
            id: 'streak',
            name: 'Streak',
            integrationType: 'google_sheets',
            sheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTAf7ftXa5lnlMJ0uZdHUldiGeQH2qGJeRu5FRJkQ-0_2WStLPRmPEQSFT-FqJjL5mitonbzE_u2-ov/pub?output=csv',
            /**
             * Company roster tab (Resource-management) — Manager view in Resources.
             * Publish that tab to web (CSV) in the same spreadsheet.
             */
            resourceManagement: {
                gid: '1655970411',
                tabName: 'Resource-management',
            },
        },
        {
            id: 'nexus',
            name: 'Nexus',
            integrationType: 'google_sheets',
            sheetUrl: '',
        },
        {
            id: 'digital_marketing',
            name: 'Digital Marketing',
            displayName: 'Digital Marketing Dashboard',
            integrationType: 'clickup',
            clickupListId: '90166990133',
            clickupToken: 'pk_101076116_FZ2GAK8V6OHUBNON5WCKM8FZE5EYQYDV',
            sheetUrl: '',
            /**
             * People model: every ClickUp assignee is a Content Creator (no Dev/QA/BA).
             * Resources + Analytics reuse Streak engines with this single role.
             */
            roleModel: 'content_creator',
            contentCreatorRole: 'Content Creator',
            /** Intake slots for Intelligence (Content Creator headcount). */
            intake: {
                small:  { heads: 1, days: 30, roles: ['Content Creator'] },
                medium: { heads: 2, days: 60, roles: ['Content Creator'] },
                large:  { heads: 3, days: 90, roles: ['Content Creator'] },
            },
            /** ClickUp list status → normalized pipeline stage (lowercase keys). */
            clickupStatusMap: {
                'to do': 'Backlog',
                'todo': 'Backlog',
                'open': 'Backlog',
                'planning': 'Planning',
                'brief': 'Planning',
                'in progress': 'Development',
                'content': 'Development',
                'design': 'Development',
                'in review': 'QA',
                'review': 'QA',
                'qa': 'QA',
                'staging': 'Release',
                'publish': 'Release',
                'complete': 'Live',
                'completed': 'Live',
                'closed': 'Live',
                'done': 'Live',
            },
            /** Marketing pipeline for heatmap benchmarks (separate from Streak STAGE_FLOW). */
            clickupStageFlow: [
                { stage: 'Brief',    aliases: ['brief', 'brief_date', 'planning'] },
                { stage: 'Content',  aliases: ['content', 'content_start', 'start_date'] },
                { stage: 'Design',   aliases: ['design', 'design_start'] },
                { stage: 'Review',   aliases: ['review', 'in_review'] },
                { stage: 'Publish',  aliases: ['publish', 'release', 'staging'] },
                { stage: 'Live',     aliases: ['live', 'actual_live_date', 'go_live', 'date_closed'] },
            ],
        },
        {
            id: 'valoriz-zoho',
            name: 'Valoriz Zoho',
            displayName: 'Valoriz Zoho — Timelog Performance',
            integrationType: 'zoho_timelog',
            sheetUrl: '',
        },
    ],

    // Zoho timelog: Job Name → team for performance rollups
    ZOHO_JOB_TEAM_MAP: {
        'UI Development': 'Development',
        'Home Page': 'Development',
        'About Us Page': 'Development',
        'Other Pages': 'Development',
        'Services Page': 'Development',
        'Testing': 'QA',
        'BA': 'Business Analysis',
        'Project Management': 'Project Management',
        'Internal Meetings & Discussions': 'Overhead',
        'DSM': 'Overhead',
    },
    ZOHO_DEFAULT_TEAM: 'Other',

    /** Teams counted as productive (excludes Overhead) for productive-ratio KPI */
    ZOHO_PRODUCTIVE_TEAMS: ['Development', 'QA', 'Business Analysis', 'Project Management'],

    /** Sample timelog for demo (relative to index.html) */
    ZOHO_SAMPLE_CSV_URL: 'Timelogs.csv',

    // Default workspace to load on first visit (uses localStorage to remember last selection)
    DEFAULT_WORKSPACE: 'streak',

    // Login screen defaults — use a workspace with sheetUrl so stats match the dashboard
    LOGIN_DEFAULT_WORKSPACE: 'streak',
    LOGIN_DEFAULT_USER: 'alice',

    // ── Google Sheets Integration ───────────────────────
    // Legacy single-sheet URL — kept for backward compatibility; overridden by active workspace.
    SHEET_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTAf7ftXa5lnlMJ0uZdHUldiGeQH2qGJeRu5FRJkQ-0_2WStLPRmPEQSFT-FqJjL5mitonbzE_u2-ov/pub?output=csv',

    // Auto-refresh interval in milliseconds (60s default)
    REFRESH_INTERVAL_MS: 60_000,

    // ── Column Mapping ──────────────────────────────────
    // Maps sheet column letters (0-indexed) to data fields.
    COLUMN_MAP: {
        project_id: 0,   // A
        project_name: 1,   // B
        owner: 2,   // C
        client: 3,   // D (mapped to page_name)
        page_owner: 4,   // E
        stage: 5,   // F
        status: 6,   // G
        ba: 7,   // H
        progress: 8,   // I
        start_date: 9,   // J
        release_date: 10,  // K
        priority: 11,  // L
        cms: 12,  // M
        tags: 13,  // N
        notes: 14,  // O
        developer: 15,  // P
        qa_engineer: 16,  // Q
        total_pages: 17,  // R
        completed_pages: 18, // S
        page_priority: 19, // T
        actual_live_date: 20, // U
    },

    // ── UI Preferences ──────────────────────────────────
    PIN_ENABLED: false,
    PIN_CODE: '2026',

    // Set to false to revert ALL dropdowns back to plain native <select> style
    CUSTOM_SELECTS: true,

    // Login screen background — path relative to index.html
    // Drop images in assets/backgrounds/ and point here (jpg, png, webp)
    LOGIN_BACKGROUND: 'assets/backgrounds/login-default.png',

    // Default sort
    DEFAULT_SORT: 'release_date', // release_date | progress | name | priority

    /**
     * Project detail screen layout. Switch here to restore the other experience without losing code.
     * - devtrack: split view (roadmap table + right “page details” rail) — current default
     * - classic: single-column card (intro, pipeline, pulse, then roadmap + line-item fields below)
     */
    PROJECT_PAGE_LAYOUT: 'devtrack', // 'devtrack' | 'classic'

    // Release within this many days (inclusive) → "Releasing soon" (upcoming) or at-risk if status flagged
    UPCOMING_DAYS_THRESHOLD: 7,

    // Overview widgets
    UPCOMING_LAUNCH_DAYS: 30,   // "Upcoming Launches" horizon
    RECENTLY_LIVE_DAYS: 90,   // "Recently Live" look-back window
    // Stalled: progress below this % and started more than STALLED_DAYS_THRESHOLD days ago
    STALLED_PROGRESS_THRESHOLD: 30,
    STALLED_DAYS_THRESHOLD: 30,
    /** Predictive "likely miss" alert: flag when projected slip (diffDays) exceeds this (0 = any slip). */
    PREDICTIVE_ALERT_MIN_SLACK_DAYS: 0,

    /** ClickUp API: max tasks to load (API returns 100/page; we paginate until this cap or last_page). */
    CLICKUP_MAX_TASKS: 200,
    CLICKUP_PAGE_SIZE: 100,

    /**
     * Revertable feature flags — set any to `false` to restore prior behavior.
     * See FEATURE_FLAGS.md for what each flag controls.
     */
    FEATURE_FLAGS: {
        /** List/overview progress from sibling Delivery tab avg (enrich on load/refresh). */
        SIBLING_LIST_PROGRESS: true,
        /** Post-live CR: no false overdue; shipped directory chips; fix Recently Live badges. */
        POST_LIVE_DATE_RULES: true,
        /** Directory pill when detail_gid tab fetch fails (falls back to master %). */
        SIBLING_FETCH_FAIL_BADGE: true,
        /** parseCSV: empty progress cell vs explicit 0 (manual % wins when cell filled). */
        SMART_PROGRESS_MANUAL_WINS: true,
        /** Login workspace picker filtered by selected user's workspaces. */
        LOGIN_WS_FILTER_BY_USER: true,
        /** Login picker subtitle copy ("Workspace" vs "Primary workspace"). */
        LOGIN_WS_SUBTITLE_FIX: true,
        /** Resources: post-live = done; freeFrom clamped to today when all active ends passed. */
        RESOURCE_FREE_FROM_FIX: true,
        /** Stage funnel / pipeline column from dominant sibling tab Stage when linked. */
        SIBLING_FUNNEL_STAGE: true,
        /** Groq narrative insights (requires GROQ_API_KEY in .env + python serve.py). Off = zero UI/API calls. */
        AI_INSIGHTS: true,
        /** Resource Intelligence engines, Intelligence view, attention scores, capacity forecast. */
        RESOURCE_INTELLIGENCE: true,
        /** Resources page: Delivery | Manager switch + roster from Resource-management sheet. */
        RESOURCE_TRACKER: true,
        /** Use max(release_date, velocity projected) for resource assignment end dates. */
        RESOURCE_USE_PROJECTED_END: true,
        /** ClickUp: map list name (Valoriz, Streak, …) to project `client` for filters/cards. */
        CLICKUP_LIST_AS_CLIENT: true,
        /** ClickUp: COMPLETE/closed → Live, skip overdue alerts; infer go-live from date_closed. */
        CLICKUP_DONE_STATUS: true,
        /** ClickUp: enrich tasks with subtasks → roadmap.pages (page-level funnel/analytics). */
        CLICKUP_SUBTASK_ENRICH: true,
        /** Resource map from sibling tab rows (per-page Developer/QA/Page owner); master row fallback. */
        SIBLING_RESOURCE_MAP: true,

        // ── Audit fixes (2026-06-16) — set to false to revert individually ──
        /** Bug #1/#10: Only count sibling/subtask rows that have a non-blank progress value in avgPct.
         *  Prevents blank rows from dragging the delivery-progress average toward 0. */
        SIBLING_AVG_PCT_EXCLUDE_BLANK: true,
        /** Bug #2: ClickUp tasks get page_owner='—' instead of copying the owner field.
         *  Stops the first assignee appearing twice in the resource map (Owner + Page owner). */
        CLICKUP_PAGE_OWNER_FIX: true,
        /** Bug #3: Pipeline Health card on Overview uses the same formula as the hero ring
         *  (non-Live projects as denominator) so both numbers agree. */
        HEALTH_SCORE_UNIFIED: true,
        /** Bug #5: Projects with 0% progress that are within the upcoming-deadline window
         *  are flagged as at_risk (likely miss) instead of just 'releasing soon'. */
        AT_RISK_ZERO_PROGRESS: true,
        /** Bug #9: Velocity sparkline uses today as the end boundary for the current-month
         *  bucket, so go-lives this month are counted correctly (was always showing 0). */
        SPARKLINE_MONTH_FIX: true,
    },

    /** Per-project attention score weights (0–100 cap). */
    ATTENTION_WEIGHTS: {
        overdue: 40,
        at_risk: 28,
        stalled: 22,
        upcoming: 8,
        diffDaysPerDay: 2,
        diffDaysCap: 18,
        conflict: 14,
        workloadPerProject: 5,
        workloadCap: 12,
        siblingBacklog: 10,
        delayedStatus: 6,
    },

    /** Project-count capacity model per role (not FTE hours). */
    CAPACITY: {
        maxProjectsPerPerson: {
            Developer: 2,
            QA: 3,
            BA: 2,
            Owner: 3,
            'Page owner': 2,
            /** Digital Marketing (ClickUp) — all assignees share this role. */
            'Content Creator': 3,
        },
        lowUtilThreshold: 0.4,
    },

    /** New business intake slots from free headcount (deterministic). */
    INTAKE: {
        small: { heads: 1, days: 30, roles: ['Developer'] },
        medium: { heads: 2, days: 60, roles: ['Developer', 'QA'] },
        large: { heads: 3, days: 90, roles: ['Developer', 'QA', 'BA'] },
    },

    /** Optional AI layer — does not change deterministic KPIs or alerts when disabled. */
    AI: {
        API_BASE: '/api/ai',
        CACHE_TTL_MS: 900000,
    },

    /**
     * Resource Tracker API (Phase 0+).
     * Default: same-origin proxy via serve.py → /api/resource/*
     * Fallback direct: http://127.0.0.1:8090 if you run the API alone.
     */
    RESOURCE_API: {
        ENABLED: true,
        BASE_URL: '/api/resource',
        TOKEN: '',  // match RESOURCE_SERVICE_TOKEN in services/resource-api/.env
        TIMEOUT_MS: 12000,
        /** Directors / leadership — never show on Bench or project assign pools. */
        NON_PROJECT_STAFF_NAMES: [
            'Ashish Thomas',
            'Madhulal M G',
            'Madhulal',
            'Sharmiq Kollathodi',
            'Sharmiw',
        ],
    },

    // ── App Meta ────────────────────────────────────────
    APP_NAME: 'Atlas',
    APP_VERSION: '1.0.0',
    TEAM_NAME: 'Product & Engineering',
};

// Load workspaces from localStorage if present BEFORE freezing
try {
    const storedWorkspaces = localStorage.getItem('atlas_workspaces');
    if (storedWorkspaces) {
        CONFIG.WORKSPACES = JSON.parse(storedWorkspaces);
    }
} catch (e) {
    console.error('[Atlas] Failed to load workspaces from localStorage:', e);
}

// Freeze so config is never accidentally mutated
Object.freeze(CONFIG);
Object.freeze(CONFIG.COLUMN_MAP);
Object.freeze(CONFIG.ROLES);
Object.freeze(CONFIG.FEATURE_FLAGS);
Object.freeze(CONFIG.AI);
Object.freeze(CONFIG.ATTENTION_WEIGHTS);
Object.freeze(CONFIG.CAPACITY);
Object.freeze(CONFIG.INTAKE);
Object.freeze(CONFIG.RESOURCE_API);
Object.freeze(CONFIG.ZOHO_JOB_TEAM_MAP);
Object.freeze(CONFIG.ZOHO_PRODUCTIVE_TEAMS);
