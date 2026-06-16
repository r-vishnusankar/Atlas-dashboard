/**
 * STRESK — App State
 * Single source of truth for all UI state
 */

const AppState = {
    currentView:   'overview',
    detailProjectId: null, // set when hash is #project/:id
    allProjects:   [],

    // ── Workspace (project switcher) ───────────────────
    activeWorkspaceId: (() => {
        const saved = localStorage.getItem('streakjs_workspace');
        const ids = (CONFIG.WORKSPACES || []).map(w => w.id);
        return (saved && ids.includes(saved)) ? saved : (CONFIG.DEFAULT_WORKSPACE || ids[0] || '');
    })(),

    get activeWorkspace() {
        return (CONFIG.WORKSPACES || []).find(w => w.id === this.activeWorkspaceId) || CONFIG.WORKSPACES[0];
    },

    get activeSheetUrl() {
        return (this.activeWorkspace && this.activeWorkspace.sheetUrl) || CONFIG.SHEET_CSV_URL || '';
    },

    setWorkspace(id) {
        this.activeWorkspaceId = id;
        localStorage.setItem('streakjs_workspace', id);
    },
    filters: {
        stage:    null,   // 'Planning' | 'Development' | 'QA' | 'Release' | 'Live' | null
        status:   null,   // 'on_track' | 'at_risk' | 'delayed' | null
        owner:    null,   // owner name string | null
        priority: null,   // 'High' | 'Medium' | 'Low' | null
        developer: null,
        qa:        null,
        client:    null,  // page_name / client string | null
    },
    search:      '',
    sort:        CONFIG.DEFAULT_SORT,
    lastUpdated: null,
    dataSource:  'sheets',  // 'sheets' | 'error'
    alerts:      { overdue:[], at_risk:[], upcoming:[], stalled:[] },
    _intelligence: null,
    pipelineMode:  'kanban',  // 'kanban' | 'timeline'
    timelineMode:  'gantt',   // 'gantt' | 'calendar'
    timelineZoom:  6,          // months to show in gantt: 3 | 6 | 12

    // ── Zoho timelog (valoriz-zoho workspace) ─────────
    timelogEntries: [],
    timelogMeta:    null,  // { loadedAt, fileName, projects, clients }
    timelogFilters: {
        project:        null,
        team:           null,
        person:         null,
        approvalStatus: 'Approved',
    },
    timelogDetailOpen: false,

    get isZohoActive() {
        return isZohoWorkspace(this.activeWorkspace);
    },

    get filteredTimelogEntries() {
        return filterTimelogEntries(this.timelogEntries, this.timelogFilters);
    },

    get timelogSummary() {
        return computeTimelogSummary(this.filteredTimelogEntries, this.timelogEntries);
    },

    setTimelogFilters(patch) {
        this.timelogFilters = { ...this.timelogFilters, ...patch };
    },

    clearTimelogFilters() {
        this.timelogFilters = {
            project: null,
            team: null,
            person: null,
            approvalStatus: 'Approved',
        };
    },

    setTimelogData(entries, meta = {}) {
        this.timelogEntries = entries || [];
        this.timelogMeta = {
            loadedAt: new Date().toISOString(),
            fileName: meta.fileName || null,
            projects: meta.projects || [...new Set((entries || []).map(e => e.project).filter(Boolean))],
            clients: meta.clients || [...new Set((entries || []).map(e => e.client).filter(Boolean))],
        };
        if (this.timelogMeta.projects.length === 1 && !this.timelogFilters.project) {
            this.timelogFilters.project = this.timelogMeta.projects[0];
        }
    },

    restoreTimelogsFromStorage() {
        if (!this.isZohoActive) return false;
        const stored = loadZohoTimelogsFromStorage(this.activeWorkspaceId);
        if (!stored || !Array.isArray(stored.entries)) return false;
        this.timelogEntries = stored.entries;
        this.timelogMeta = stored.meta || null;
        return this.timelogEntries.length > 0;
    },

    persistTimelogsToStorage() {
        if (!this.isZohoActive) return;
        persistZohoTimelogs(this.activeWorkspaceId, {
            entries: this.timelogEntries,
            meta: this.timelogMeta,
        });
    },

    clearTimelogs() {
        this.timelogEntries = [];
        this.timelogMeta = null;
        this.clearTimelogFilters();
        try {
            localStorage.removeItem(zohoStorageKey(this.activeWorkspaceId));
        } catch (e) { /* ignore */ }
    },

    // ── Computed ──────────────────────────────
    get filteredProjects() {
        let projects = [...this.allProjects];

        // Search
        if (this.search.trim()) {
            const q = this.search.toLowerCase();
            projects = projects.filter(p =>
                p.name.toLowerCase().includes(q)   ||
                p.client.toLowerCase().includes(q) ||
                p.owner.toLowerCase().includes(q)  ||
                p.id.toLowerCase().includes(q)     ||
                (p.tags || []).some(t => t.toLowerCase().includes(q))
            );
        }

        // Filters
        if (this.filters.stage)     projects = projects.filter(p => projectFunnelStage(p) === this.filters.stage);
        if (this.filters.status)    projects = projects.filter(p => p.status === this.filters.status);
        if (this.filters.owner)     projects = projects.filter(p => splitAssigneeNames(p.owner).includes(this.filters.owner));
        if (this.filters.priority)  projects = projects.filter(p => p.priority === this.filters.priority);
        if (this.filters.developer) projects = projects.filter(p => splitAssigneeNames(p.developer).includes(this.filters.developer));
        if (this.filters.qa)        projects = projects.filter(p => splitAssigneeNames(p.qa_engineer).includes(this.filters.qa));
        if (this.filters.client)    projects = projects.filter(p => p.client === this.filters.client);

        // Sort
        return sortProjects(projects, this.sort);
    },

    // ── KPI Computations ───────────────────────
    get totalProjects()    { return this.allProjects.length; },
    get liveCount()        { return this.allProjects.filter(p => projectCountsAsShipped(p)).length; },
    get inProgress()       { return this.allProjects.filter(p => !['Live','Planning'].includes(p.stage)).length; },
    get delayedCount()     { return this.allProjects.filter(p => p.status === 'delayed').length; },
    get atRiskCount()      { return this.allProjects.filter(p => p.status === 'at_risk').length; },
    get alertOverdueCount()   { return this.alerts.overdue.length; },
    get alertAtRiskCount()    { return this.alerts.at_risk.length; },
    get alertUpcomingCount()  { return this.alerts.upcoming.length; },
    get alertStalledCount()   { return this.alerts.stalled.length; },
    get alertTotalCount()     { return alertTotalCount(this.alerts); },
    get completedCount()   { return this.allProjects.filter(p => p.stage === 'Live').length; },
    get avgProgress() {
        if (!this.allProjects.length) return 0;
        return Math.round(this.allProjects.reduce((s, p) => s + projectDisplayProgress(p), 0) / this.allProjects.length);
    },

    // Stage counts — sibling pages grouped by pipeline stage (see getFunnelStageCounts)
    get stageCounts() {
        return typeof getFunnelStageCounts === 'function'
            ? getFunnelStageCounts().counts
            : {};
    },
    get funnelPageTotal() {
        return typeof getFunnelStageCounts === 'function'
            ? getFunnelStageCounts().total
            : this.allProjects.length;
    },

    // Unique owners for filter (split multi-name cells into individual names)
    get uniqueOwners()  { return [...new Set(this.allProjects.flatMap(p => splitAssigneeNames(p.owner)).filter(s => isValidResourceName(s)))].sort(); },
    get uniqueDevs()    { return [...new Set(this.allProjects.flatMap(p => splitAssigneeNames(p.developer)).filter(s => isValidResourceName(s)))].sort(); },
    get uniqueQAs()     { return [...new Set(this.allProjects.flatMap(p => splitAssigneeNames(p.qa_engineer)).filter(s => isValidResourceName(s)))].sort(); },
    get uniqueClients() { return [...new Set(this.allProjects.map(p => p.client).filter(Boolean))].sort(); },

    // ── Analytics ──────────────────────────────
    getAnalyticsData() {
        // Page-level delivery units from the sibling sheet (Streak), master row otherwise.
        const units = typeof getAnalyticsUnits === 'function' ? getAnalyticsUnits() : this.allProjects;
        // 1. Monthly Live Trends
        const liveByMonth = {};
        units.filter(p => p.actual_live_date).forEach(p => {
            const date = parseSmartDate(p.actual_live_date);
            if (!isNaN(date)) {
                const month = date.toLocaleString('default', { month: 'short' });
                liveByMonth[month] = (liveByMonth[month] || 0) + 1;
            }
        });

        // 2. Efficiency Leaderboard (Variance against release_date)
        const varianceList = units
            .filter(p => normalizeStage(p.stage || '') === 'Live' && p.release_date && p.actual_live_date)
            .map(p => {
                const target = parseSmartDate(p.release_date);
                const actual = parseSmartDate(p.actual_live_date);
                if (isNaN(target) || isNaN(actual)) return null;
                const diffDays = Math.round((target - actual) / (1000 * 60 * 60 * 24));
                return { id: p.id, name: p.name, owner: p.owner || '', variance: diffDays };
            })
            .filter(v => v !== null)
            .sort((a, b) => b.variance - a.variance); // High variance (early) first

        return { 
            trends: liveByMonth,
            speedRunners: varianceList.filter(v => v.variance > 0).slice(0, 3), // Top 3 early
            laggards: varianceList.filter(v => v.variance < 0).reverse().slice(0, 3) // Top 3 delayed (magnitude)
        };
    },

    // ── Resource Intelligence ──────────────────
    get resourceMap() {
        if (this._intelligence?.resourceMap) return this._intelligence.resourceMap;
        return buildResourceMap(this.allProjects);
    },

    get attentionRanked() {
        return this._intelligence?.attentionRanked ?? [];
    },

    get capacityForecast() {
        return this._intelligence?.capacityForecast ?? { roles: {}, summary: {}, horizons: [30, 60, 90] };
    },

    get intakeRecommendation() {
        return this._intelligence?.intakeRecommendation ?? { small: 0, medium: 0, large: 0, byHorizon: {} };
    },

    get intelligenceSummary() {
        return this._intelligence?.intelligenceSummary ?? null;
    },

    // ── Mutations ──────────────────────────────
    setProjects(projects, source = 'sheets') {
        this.allProjects = projects;
        this.dataSource = source;
        this.lastUpdated = new Date();
        // Always recompute from the latest sheet rows (no persisted KPI cache)
        this.alerts = computeAlerts(this.allProjects);
        this._intelligence = typeof computeResourceIntelligence === 'function'
            ? computeResourceIntelligence(this.allProjects, this.alerts)
            : null;
        if (typeof Auth !== 'undefined' && Auth.invalidateLoginStatsCache) {
            Auth.invalidateLoginStatsCache();
        }
    },

    setView(view) {
        this.currentView = view;
    },

    setPipelineMode(mode) {
        this.pipelineMode = mode;
    },

    setTimelineMode(mode) { this.timelineMode = mode; },
    setTimelineZoom(z)    { this.timelineZoom = z; },

    setSearch(query) {
        this.search = query;
    },

    setFilter(key, value) {
        // Toggle off if same value
        this.filters[key] = (this.filters[key] === value) ? null : value;
    },

    clearFilters() {
        this.filters = { stage:null, status:null, owner:null, priority:null, developer:null, qa:null, client:null };
        this.search = '';
    },

    setSort(key) {
        this.sort = key;
    },

    hasActiveFilters() {
        return this.search.trim() ||
               Object.values(this.filters).some(v => v !== null);
    },
};
