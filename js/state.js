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
        const ws = this.activeWorkspace;
        if (!ws) return CONFIG.SHEET_CSV_URL || '';
        if (ws.integrationType === 'clickup' || ws.integrationType === 'zoho_timelog') {
            return (ws.sheetUrl || '').trim();
        }
        return (ws.sheetUrl || CONFIG.SHEET_CSV_URL || '').trim();
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
    /** Intelligence tab + Delivery capacity — Team Allocation matching via Database roster. */
    _intelligenceDelivery: null,
    _resourceDeliveryMap: null,
    /** Resources page: 'delivery' (existing) | 'manager' (company roster tracker) */
    resourcesViewMode: (() => {
        const saved = localStorage.getItem('atlas_resources_view_mode');
        return saved === 'manager' ? 'manager' : 'delivery';
    })(),
    resourcesManagerTab: (() => {
        const saved = localStorage.getItem('atlas_resources_manager_tab');
        const ok = ['dashboard', 'employees', 'projects', 'allocations', 'bench', 'reports'];
        return ok.includes(saved) ? saved : 'dashboard';
    })(),
    resourceRoster: [],
    resourceRosterMeta: null,  // { loadedAt, source, error }
    resourceRosterStatus: 'idle', // idle | loading | ready | error
    /** Team allocation name list — Database tab only (not Resource-management). */
    databaseRoster: [],
    databaseRosterMeta: null,
    databaseRosterStatus: 'idle',
    resourceRosterFilter: '',
    resourceEmpDeptFilter: '',
    resourceEmpRoleFilter: '',
    resourceEmpAvailFilter: '',
    /** Resource Tracker API shadow sync status */
    resourceApiStatus: 'idle', // idle | online | offline
    resourceApiMeta: null,     // health / last sync info
    notifySettings: (() => {
        try {
            return JSON.parse(localStorage.getItem('atlas_notify_settings') || 'null') || {
                resource_manager_emails: '',
                staffing_contact_emails: '',
            };
        } catch {
            return { resource_manager_emails: '', staffing_contact_emails: '' };
        }
    })(),
    resourceApiEmployees: [],  // from API when online
    resourceApiAllocations: [],
    resourceApiProjects: [],   // catalog projects (synced + manually added)
    resourceBenchRecos: null,  // { employees: [...] }
    resourceUtilTrend: [],
    resourceDemandForecast: [],
    resourceSelectedEmployeeId: null,
    /** Projects tab master-detail */
    resourceSelectedProjectId: null,   // catalog row id (UUID)
    resourceSelectedProjectExternalId: null, // sheet external id when not yet in API
    resourceProjectPaneMode: 'empty', // empty | create | edit | detail
    /** Projects tab full pages: list | detail | create (explicit; do not derive from selection). */
    resourcesManagerProjectPage: 'list',
    resourceProjectForm: null,        // { id, externalId, name, client, releaseDate }
    resourceAllocDraft: null,         // { selectedEmployeeIds, allocationPct, projectRole, startDate, endDate, strict }
    resourceAllocDrawerOpen: false,
    resourceAllocShowAll: false,
    resourceProjectFilter: '',
    resourceProjectListView: 'active', // active | operational | recent | archived
    resourceProjectPage: 1,
    resourceAllocPeopleFilter: '',
    resourceAllocRoleFilter: '',
    /** Allocations tab list filters */
    resourceAllocListFilter: '',
    resourceAllocListProjectFilter: '',
    resourceAllocListDeptFilter: '',
    resourceAllocListRoleFilter: '',
    resourceAllocListStatusFilter: '',

    /** Team Allocation page (sibling sheet only) */
    allocationView: 'people',   // people | projects | rows
    allocationFilter: 'all',    // all | on_work | free
    allocationSearch: '',

    /** Intelligence → Team Availability card */
    intelReleaseTab: (() => {
        const saved = localStorage.getItem('atlas_intel_release_tab');
        return saved === '30d' ? '30d' : 'now';
    })(),

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
    /** Alias for delivery sheet projects (Project tab). */
    get projects() { return this.allProjects; },

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
                (p.website_url || '').toLowerCase().includes(q) ||
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
            if (!isNaN(date.getTime())) {  // Bug #6 fix: use .getTime() — consistent with rest of codebase
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

    /** Resources Delivery view — Team Allocation Match By Person + RI UI adapter. */
    get resourceDeliveryMap() {
        if (this._resourceDeliveryMap) return this._resourceDeliveryMap;
        const roster = this.databaseRoster || [];
        const ws = this.activeWorkspace;
        const clickupFallback = typeof isContentCreatorWorkspace === 'function'
            && isContentCreatorWorkspace(ws)
            && typeof buildResourceMap === 'function';
        if (!roster.length && clickupFallback) {
            this._resourceDeliveryMap = buildResourceMap(this.allProjects);
            return this._resourceDeliveryMap;
        }
        const alloc = this.siblingAllocation;
        this._resourceDeliveryMap = typeof buildResourceMapFromPersonMatches === 'function'
            ? buildResourceMapFromPersonMatches(alloc, this.allProjects)
            : {};
        return this._resourceDeliveryMap;
    },

    get siblingAllocation() {
        const roster = this.databaseRoster || [];
        return typeof buildSiblingAllocationData === 'function'
            ? buildSiblingAllocationData(this.allProjects, roster)
            : { rows: [], people: [], stats: {}, projectsActive: [], byProject: {} };
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

    /**
     * Resource & Capacity Intelligence — same Match By Person roster + Delivery matching
     * as Team Allocation / Resources Delivery. Falls back to master-map intelligence until
     * Database roster loads.
     */
    get deliveryIntelligence() {
        if (this._intelligenceDelivery) return this._intelligenceDelivery;
        const roster = this.databaseRoster || [];
        if (!roster.length) {
            if (typeof isContentCreatorWorkspace === 'function' && isContentCreatorWorkspace(this.activeWorkspace)
                && typeof buildResourceMap === 'function') {
                const resourceMap = buildResourceMap(this.allProjects);
                this._intelligenceDelivery = typeof computeResourceIntelligenceWithMap === 'function'
                    ? computeResourceIntelligenceWithMap(this.allProjects, this.alerts, resourceMap)
                    : (this._intelligence || {});
                return this._intelligenceDelivery;
            }
            return this._intelligence || {};
        }
        const resourceMap = typeof buildResourceMapFromPersonMatches === 'function'
            ? buildResourceMapFromPersonMatches(this.siblingAllocation, this.allProjects)
            : {};
        this._intelligenceDelivery = typeof computeResourceIntelligenceWithMap === 'function'
            ? computeResourceIntelligenceWithMap(this.allProjects, this.alerts, resourceMap)
            : (this._intelligence || {});
        return this._intelligenceDelivery;
    },

    get deliveryCapacityForecast() {
        return this.deliveryIntelligence?.capacityForecast
            ?? { roles: {}, summary: {}, horizons: [30, 60, 90] };
    },

    get deliveryIntelligenceSummary() {
        return this.deliveryIntelligence?.intelligenceSummary ?? null;
    },

    get deliveryAttentionRanked() {
        return this.deliveryIntelligence?.attentionRanked ?? [];
    },

    get deliveryIntakeRecommendation() {
        return this.deliveryIntelligence?.intakeRecommendation
            ?? { small: 0, medium: 0, large: 0, byHorizon: {} };
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
        this.clearDerivedCaches();
        if (typeof Auth !== 'undefined' && Auth.invalidateLoginStatsCache) {
            Auth.invalidateLoginStatsCache();
        }
    },

    /** Drop in-memory derived maps (delivery intelligence, resource delivery). */
    clearDerivedCaches() {
        this._resourceDeliveryMap = null;
        this._intelligenceDelivery = null;
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

    setResourcesViewMode(mode) {
        this.resourcesViewMode = mode === 'manager' ? 'manager' : 'delivery';
        localStorage.setItem('atlas_resources_view_mode', this.resourcesViewMode);
    },

    setResourcesManagerTab(tab) {
        const ok = ['dashboard', 'employees', 'projects', 'allocations', 'bench', 'reports'];
        this.resourcesManagerTab = ok.includes(tab) ? tab : 'dashboard';
        localStorage.setItem('atlas_resources_manager_tab', this.resourcesManagerTab);
    },

    setResourcesManagerProjectPage(page) {
        const ok = ['list', 'detail', 'create'];
        this.resourcesManagerProjectPage = ok.includes(page) ? page : 'list';
    },

    setAllocationView(view) {
        const ok = ['people', 'projects', 'rows'];
        this.allocationView = ok.includes(view) ? view : 'people';
        localStorage.setItem('atlas_allocation_view', this.allocationView);
    },

    setAllocationFilter(filter) {
        const ok = ['all', 'on_work', 'free'];
        this.allocationFilter = ok.includes(filter) ? filter : 'all';
        localStorage.setItem('atlas_allocation_filter', this.allocationFilter);
    },

    setAllocationSearch(q) {
        this.allocationSearch = String(q || '');
    },

    setIntelReleaseTab(tab) {
        this.intelReleaseTab = tab === '30d' ? '30d' : 'now';
        localStorage.setItem('atlas_intel_release_tab', this.intelReleaseTab);
    },

    setResourceRoster(list, meta) {
        this.resourceRoster = Array.isArray(list) ? list : [];
        this.resourceRosterMeta = meta || null;
        this.resourceRosterStatus = meta?.error ? 'error' : (this.resourceRoster.length ? 'ready' : 'ready');
    },

    setDatabaseRoster(list, meta) {
        this.databaseRoster = Array.isArray(list) ? list : [];
        this.databaseRosterMeta = meta || null;
        this.databaseRosterStatus = meta?.error ? 'error' : 'ready';
        this.clearDerivedCaches();
    },

    hasActiveFilters() {
        return this.search.trim() ||
               Object.values(this.filters).some(v => v !== null);
    },
};
