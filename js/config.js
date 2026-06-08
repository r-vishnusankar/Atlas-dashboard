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
            views: ['overview', 'projects', 'pipeline', 'alerts', 'resources', 'timeline', 'analytics', 'intelligence'],
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
        },
    ],

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
        /** Use max(release_date, velocity projected) for resource assignment end dates. */
        RESOURCE_USE_PROJECTED_END: true,
        /** ClickUp: map list name (Valoriz, Streak, …) to project `client` for filters/cards. */
        CLICKUP_LIST_AS_CLIENT: true,
        /** ClickUp: COMPLETE/closed → Live, skip overdue alerts; infer go-live from date_closed. */
        CLICKUP_DONE_STATUS: true,
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
