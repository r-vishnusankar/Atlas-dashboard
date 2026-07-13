/**
 * STRESK — App Controller
 * Boot, routing, event binding, auto-refresh
 */

const App = {

    refreshTimer:   null,
    _metaTimer:     null,   // updateLastUpdated interval — cleared on re-login
    _eventsBound:   false,  // guard: bindGlobalEvents runs only once
    _lastLiveFetch: 0,     // ms — debounce tab-focus refetch
    _softRender:    false, // true during silent data refresh (no flash / no AI reset)

    async init() {
        // Setup Theme first so there's no flash
        const savedTheme = localStorage.getItem('streakjs_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Build login form user list (always, so it's ready)
        Auth.buildLoginForm();

        // If RBAC is enabled and user is not logged in, show login screen
        if (CONFIG.RBAC_ENABLED && !Auth.isLoggedIn()) {
            Auth.showLoginScreen();
            return; // Wait for login — bootAsUser() will be called after
        }

        // Already logged in (session restored) — apply RBAC to UI
        this.updateSidebarUserChip();
        this.applyRBACToUI();
        await this._bootDashboard();
    },

    /** Called after successful login (or directly on init if already logged in) */
    async bootAsUser(user) {
        // Enforce workspace access — if saved workspace is not allowed, switch to first allowed one
        const allowed = Auth.allowedWorkspaceIds();
        if (!allowed.includes(AppState.activeWorkspaceId)) {
            const first = (CONFIG.WORKSPACES || []).find(w => allowed.includes(w.id));
            if (first) AppState.setWorkspace(first.id);
        }
        this.updateSidebarUserChip();
        this.applyRBACToUI();
        await this._bootDashboard();
    },

    async _loadLiveProjects() {
        const ws = AppState.activeWorkspace;
        const { projects, source } = await loadProjects(AppState.activeSheetUrl);
        let enriched = projects;
        if (ws.integrationType === 'clickup' && typeof featureOn === 'function' && featureOn('CLICKUP_SUBTASK_ENRICH')) {
            enriched = await enrichClickUpWithSubtasks(projects, ws.clickupToken, ws);
        } else if (typeof featureOn === 'function' && featureOn('SIBLING_LIST_PROGRESS')) {
            enriched = await enrichProjectsWithSiblingMetrics(projects, AppState.activeSheetUrl);
        }
        AppState.setProjects(enriched, source);
        this._lastLiveFetch = Date.now();
        const roadmapCount = enriched.filter(p => p.roadmap?.hasSibling).length;
        return { projects: enriched, source, roadmapCount };
    },

    async _bootDashboard() {
        this.showLoader();
        this.renderWorkspaceSwitcher();

        if (isZohoWorkspace(AppState.activeWorkspace)) {
            return this._bootZohoDashboard();
        }

        try {
            const { projects, source, roadmapCount } = await this._loadLiveProjects();

            this.hideLoader();
            this.updateSidebarMeta();
            this.updateNavAlertBadge();
            this.bindGlobalEvents();
            this.startAutoRefresh();

            this.syncStateFromHash();
            this.renderCurrentView();

            if (source === 'error') {
                this.toast('Set the sheet URL for this workspace in js/config.js.', 'error', 8000);
            } else if (projects.length === 0) {
                this.toast('Sheet loaded but no project rows found. Check headers and data.', 'warning', 6000);
            } else {
                const ws = AppState.activeWorkspace;
                const rm = roadmapCount
                    ? (ws.integrationType === 'clickup'
                        ? ` · ${roadmapCount} with subtasks`
                        : ` · ${roadmapCount} delivery tabs`)
                    : '';
                this.toast(`${AppState.activeWorkspace.name} — ${projects.length} projects loaded${rm}`, 'success');
            }

        } catch (err) {
            console.error('[Atlas] Boot error:', err);
            AppState.setProjects([], 'error');
            this.hideLoader();
            this.updateSidebarMeta();
            this.bindGlobalEvents();
            this.startAutoRefresh();
            this.syncStateFromHash();
            this.renderCurrentView();
            this.toast('Could not load sheet. Check network and the workspace URL.', 'error', 8000);
        }
    },

    async _bootZohoDashboard() {
        AppState.restoreTimelogsFromStorage();
        AppState.setProjects([], 'zoho');

        this.hideLoader();
        this.updateSidebarMeta();
        this.bindGlobalEvents();
        this.applyRBACToUI();
        this.applyWorkspaceNav();
        this.updateZohoHeaderUI();

        const hashView = (location.hash || '').replace(/^#/, '').split('/')[0];
        if (!hashView || hashView === 'overview' || !Auth.canAccessView(hashView)) {
            AppState.setView('performance');
            if (!location.hash || location.hash === '#overview') {
                history.replaceState(null, '', '#performance');
            }
        }

        this.syncStateFromHash();
        this.renderCurrentView();

        if (AppState.timelogEntries.length) {
            this.toast(`${AppState.activeWorkspace.name} — ${AppState.timelogEntries.length} timelog rows loaded`, 'success');
        } else {
            this.toast('Upload a Zoho timelog CSV or load the sample dataset.', 'info', 6000);
        }
    },

    async _ingestZohoCsvText(text, fileName) {
        const { entries, projects, clients } = parseZohoTimelog(text);
        if (!entries.length) {
            throw new Error('No timelog rows found in CSV.');
        }
        AppState.setTimelogData(entries, { fileName, projects, clients });
        AppState.persistTimelogsToStorage();
        AppState.setView('performance');
        history.pushState(null, '', '#performance');
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.toggle('active', el.dataset.view === 'performance');
        });
        this.updateSidebarMeta();
        this.renderCurrentView();
        this.toast(`Loaded ${entries.length} timelog rows${projects.length ? ` · ${projects.join(', ')}` : ''}`, 'success');
    },

    triggerZohoUpload() {
        const input = document.getElementById('zoho-csv-input');
        if (input) {
            input.value = '';
            input.click();
        }
    },

    async handleZohoFile(file) {
        if (!file) return;
        try {
            const text = await file.text();
            await this._ingestZohoCsvText(text, file.name);
        } catch (err) {
            console.error('[Zoho] Upload error:', err);
            this.toast(err.message || 'Failed to parse timelog CSV.', 'error', 6000);
        }
    },

    handleZohoDrop(event) {
        event.preventDefault();
        const zone = document.getElementById('perf-dropzone');
        if (zone) zone.classList.remove('perf-dropzone--over');
        const file = event.dataTransfer?.files?.[0];
        if (file) this.handleZohoFile(file);
    },

    async loadZohoSample() {
        try {
            const url = CONFIG.ZOHO_SAMPLE_CSV_URL || 'Timelogs.csv';
            const res = await fetch(url);
            if (!res.ok) throw new Error('Sample file not found.');
            await this._ingestZohoCsvText(await res.text(), 'Timelogs.csv (sample)');
        } catch (err) {
            console.error('[Zoho] Sample load error:', err);
            this.toast('Could not load sample timelog.', 'error');
        }
    },

    setTimelogFilter(key, value) {
        if (key === 'approvalStatus') {
            AppState.setTimelogFilters({ approvalStatus: value || 'Approved' });
        } else {
            AppState.setTimelogFilters({ [key]: value || null });
        }
        this.renderCurrentView();
    },

    clearTimelogFilters() {
        AppState.clearTimelogFilters();
        if (AppState.timelogMeta?.projects?.length === 1) {
            AppState.setTimelogFilters({ project: AppState.timelogMeta.projects[0] });
        }
        this.renderCurrentView();
    },

    toggleTimelogDetail() {
        AppState.timelogDetailOpen = !AppState.timelogDetailOpen;
        this.renderCurrentView();
    },

    exportTimelogCSV() {
        const rows = AppState.filteredTimelogEntries;
        if (!rows.length) {
            this.toast('No timelog rows to export.', 'warning');
            return;
        }
        exportTimelogEntriesCSV(rows);
        this.toast(`Exported ${rows.length} timelog rows`, 'success');
    },

    _paintPerformanceCharts() {
        const entries = AppState.filteredTimelogEntries;
        if (!entries.length) return;
        const teamAgg = aggregateByTeam(entries);
        renderDonutChart('perf-team-donut', teamDonutData(teamAgg), 'Hours');
    },

    applyWorkspaceNav() {
        const zoho = AppState.isZohoActive;
        const zohoViews = ['performance', 'help', 'settings'];
        document.querySelectorAll('.nav-item[data-view]').forEach(el => {
            const view = el.dataset.view;
            if (view === 'settings') return;
            if (zoho && !zohoViews.includes(view)) {
                el.style.display = 'none';
            } else if (!zoho && view === 'performance') {
                el.style.display = 'none';
            }
        });
    },

    updateZohoHeaderUI() {
        const zoho = AppState.isZohoActive;
        const searchBox = document.querySelector('.search-box');
        const btnRefresh = document.getElementById('btn-refresh');
        const btnUpload = document.getElementById('btn-zoho-upload');
        const btnAvail = document.getElementById('btn-avail');
        const title = document.getElementById('header-title');

        if (searchBox) searchBox.style.display = zoho ? 'none' : '';
        if (btnRefresh) btnRefresh.style.display = zoho ? 'none' : '';
        if (btnAvail) btnAvail.style.display = zoho ? 'none' : '';
        if (btnUpload) btnUpload.style.display = zoho ? '' : 'none';
        if (title && zoho) title.textContent = 'Project Command Center';
    },

    /* ══════════════════════════════════════════
       RBAC — UI GATING
    ══════════════════════════════════════════ */

    /** Show the logged-in user chip in the sidebar footer */
    updateSidebarUserChip() {
        const user = Auth.currentUser;
        const chip     = document.getElementById('sidebar-user-chip');
        const avatar   = document.getElementById('sidebar-user-avatar');
        const nameEl   = document.getElementById('sidebar-user-name');
        const roleEl   = document.getElementById('sidebar-user-role');

        if (!chip) return;

        if (!CONFIG.RBAC_ENABLED || !user) {
            chip.style.display = 'none';
            return;
        }

        chip.style.display = 'flex';
        const liveUser = Auth.getUsers().find(u => u.id === user.id);
        const label    = Auth.userDisplayName(liveUser || user);
        if (avatar)  avatar.textContent  = (label || '?')[0].toUpperCase();
        if (nameEl)  nameEl.textContent  = label || 'Unknown';
        if (roleEl)  roleEl.textContent  = (user.role || '').charAt(0).toUpperCase() + (user.role || '').slice(1);
    },

    /**
     * Hide nav items, action buttons, and other UI elements that the
     * current user's role doesn't grant access to.
     */
    applyRBACToUI() {
        if (!CONFIG.RBAC_ENABLED) return;

        const ALL_VIEWS = ['overview', 'projects', 'pipeline', 'alerts', 'resources', 'timeline', 'analytics', 'intelligence', 'performance', 'help'];

        // Sidebar nav items
        ALL_VIEWS.forEach(view => {
            const el = document.querySelector(`.nav-item[data-view="${view}"]`);
            if (!el) return;
            el.style.display = Auth.canAccessView(view) ? '' : 'none';
        });

        this.applyWorkspaceNav();
        this.updateZohoHeaderUI();

        // Action buttons in header
        const btnExport  = document.getElementById('btn-export');
        const btnRefresh = document.getElementById('btn-refresh');
        const btnTheme   = document.querySelector('.icon-btn[onclick*="toggleTheme"]');
        const btnAvail   = document.getElementById('btn-avail');

        if (btnExport)  btnExport.style.display  = Auth.canPerformAction('export')  ? '' : 'none';
        if (btnRefresh) btnRefresh.style.display = Auth.canPerformAction('refresh') ? '' : 'none';
        if (btnTheme)   btnTheme.style.display   = Auth.canPerformAction('theme')   ? '' : 'none';

        // Workspace switcher — hide entirely if user only has one workspace
        const wsContainer = document.getElementById('workspace-switcher');
        const allowedWs = Auth.allowedWorkspaceIds();
        if (wsContainer) {
            wsContainer.style.display = (allowedWs.length <= 1 && !Auth.canPerformAction('switchWorkspace')) ? 'none' : '';
        }

        // Settings nav — admin only
        const navSettings = document.getElementById('nav-settings');
        if (navSettings) {
            navSettings.style.display = (Auth.currentUser?.role === 'admin') ? '' : 'none';
        }
    },

    /* ══════════════════════════════════════════
       WORKSPACE SWITCHER
    ══════════════════════════════════════════ */
    renderWorkspaceSwitcher() {
        const container = document.getElementById('workspace-switcher');
        if (!container) return;
        // Only show workspaces the current user can access
        const allowedIds = Auth.allowedWorkspaceIds();
        const workspaces = (CONFIG.WORKSPACES || []).filter(w => allowedIds.includes(w.id));
        const active = AppState.activeWorkspace;

        container.innerHTML = `
        <div class="ws-label">Project</div>
        <div class="ws-trigger" id="ws-trigger" onclick="App.toggleWorkspaceMenu()" title="Switch project" tabindex="0">
            <div class="ws-trigger-dot"></div>
            <span class="ws-trigger-name">${active ? active.name : 'Select project'}</span>
            <svg class="ws-trigger-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="ws-menu" id="ws-menu" style="display:none">
            ${workspaces.map(w => {
                const isActive = w.id === AppState.activeWorkspaceId;
                const isConfigured = w.integrationType === 'clickup'
                    ? (w.clickupListId && w.clickupListId !== '')
                    : w.integrationType === 'zoho_timelog'
                    ? true
                    : !!w.sheetUrl;
                return `
                <div class="ws-menu-item ${isActive ? 'ws-menu-item--active' : ''} ${!isConfigured ? 'ws-menu-item--unconfigured' : ''}"
                     onclick="App.switchWorkspace('${w.id}')"
                     title="${!isConfigured ? 'Configure this workspace in Settings' : w.name}">
                    ${isActive ? `<span class="ws-menu-check"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>` : ''}
                    <div class="ws-menu-dot ${isConfigured ? 'ws-menu-dot--on' : 'ws-menu-dot--off'}"></div>
                    <span class="ws-menu-item-label">${w.name}</span>
                    ${!isConfigured ? '<span class="ws-menu-tag">Not set up</span>' : ''}
                </div>`;
            }).join('')}
        </div>`;
    },

    toggleWorkspaceMenu() {
        const menu    = document.getElementById('ws-menu');
        const trigger = document.getElementById('ws-trigger');
        if (!menu) return;
        const isOpen = menu.style.display !== 'none';
        menu.style.display = isOpen ? 'none' : 'block';
        trigger && trigger.classList.toggle('ws-trigger--open', !isOpen);
        if (!isOpen) {
            const close = (e) => {
                if (!e.target.closest('#workspace-switcher')) {
                    menu.style.display = 'none';
                    trigger && trigger.classList.remove('ws-trigger--open');
                    document.removeEventListener('click', close);
                }
            };
            setTimeout(() => document.addEventListener('click', close), 0);
        }
    },

    async switchWorkspace(id) {
        const ws = (CONFIG.WORKSPACES || []).find(w => w.id === id);
        if (!ws) return;
        if (!Auth.canAccessWorkspace(id)) {
            this.toast('You do not have access to this workspace.', 'error');
            return;
        }

        // Close the menu
        const menu = document.getElementById('ws-menu');
        if (menu) menu.style.display = 'none';
        const trigger = document.getElementById('ws-trigger');
        if (trigger) trigger.classList.remove('ws-trigger--open');

        const isConfigured = ws.integrationType === 'clickup'
            ? (ws.clickupListId && ws.clickupListId !== '')
            : ws.integrationType === 'zoho_timelog'
            ? true
            : !!ws.sheetUrl;
        if (!isConfigured) {
            this.toast(`${ws.name} is not set up yet. Add its ${ws.integrationType === 'clickup' ? 'clickupListId' : 'sheetUrl'} in Settings or config.js.`, 'warning', 5000);
            return;
        }

        if (id === AppState.activeWorkspaceId) return; // already active

        AppState.setWorkspace(id);
        AppState.clearFilters();
        AppState.detailProjectId = null;

        // Re-render switcher to show new active
        this.renderWorkspaceSwitcher();

        // Stop old auto-refresh
        if (this.refreshTimer) clearInterval(this.refreshTimer);

        if (isZohoWorkspace(ws)) {
            AppState.restoreTimelogsFromStorage();
            AppState.setProjects([], 'zoho');
            AppState.setView('performance');
            location.hash = 'performance';
            this.hideLoader();
            this.updateSidebarMeta();
            this.applyRBACToUI();
            this.renderCurrentView();
            const n = AppState.timelogEntries.length;
            this.toast(`Switched to ${ws.name}${n ? ` — ${n} timelog rows` : ' — upload a CSV to begin'}`, 'success');
            return;
        }

        AppState.setView('overview');
        location.hash = 'overview';

        this.showLoader();
        try {
            const { projects, source, roadmapCount } = await this._loadLiveProjects();
            this.hideLoader();
            this.updateSidebarMeta();
            this.updateNavAlertBadge();
            this.startAutoRefresh();
            this.applyRBACToUI();
            this.renderCurrentView();
            const rm = roadmapCount ? ` · ${roadmapCount} delivery tabs` : '';
            this.toast(`Switched to ${ws.name} — ${projects.length} projects${rm}`, 'success');
        } catch (err) {
            AppState.setProjects([], 'error');
            this.hideLoader();
            this.updateSidebarMeta();
            this.renderCurrentView();
            this.toast(`Failed to load ${ws.name}. Check the sheet URL.`, 'error', 6000);
        }
    },

    /* ══════════════════════════════════════════
       NAVIGATION / ROUTING
    ══════════════════════════════════════════ */
    parseHash() {
        const raw = (location.hash || '#overview').replace(/^#/, '').trim();
        const m = raw.match(/^project\/(.+)$/i);
        if (m) {
            return { projectId: decodeURIComponent(m[1].trim()), view: null };
        }
        const view = (raw.split('/')[0] || 'overview');
        return { projectId: null, view };
    },

    syncStateFromHash() {
        const validViews = ['overview', 'projects', 'pipeline', 'alerts', 'resources', 'timeline', 'analytics', 'intelligence', 'performance', 'help', 'settings'];
        const r = this.parseHash();
        if (r.projectId) {
            AppState.detailProjectId = r.projectId;
            AppState.setView('project');
            document.querySelectorAll('.nav-item').forEach(el => {
                el.classList.toggle('active', el.dataset.view === 'projects');
            });
        } else {
            AppState.detailProjectId = null;
            let view = r.view;
            if (!validViews.includes(view)) view = 'overview';
            if (AppState.isZohoActive && !['performance', 'help', 'settings'].includes(view)) {
                view = Auth.canAccessView('performance') ? 'performance' : (validViews.find(v => Auth.canAccessView(v)) || 'help');
            }
            // RBAC guard
            if (!Auth.canAccessView(view)) {
                view = validViews.find(v => Auth.canAccessView(v)) || 'overview';
            }
            AppState.setView(view);
            document.querySelectorAll('.nav-item').forEach(el => {
                el.classList.toggle('active', el.dataset.view === view);
            });
        }
    },

    navigate(view, pushHash = true) {
        const validViews = ['overview', 'projects', 'pipeline', 'alerts', 'resources', 'timeline', 'analytics', 'intelligence', 'performance', 'help', 'settings'];
        if (!validViews.includes(view)) view = 'overview';
        // Settings is admin-only
        if (view === 'settings' && Auth.currentUser?.role !== 'admin') view = 'overview';
        // RBAC guard — redirect to first allowed view
        if (view !== 'settings' && !Auth.canAccessView(view)) {
            const fallback = validViews.find(v => v !== 'settings' && Auth.canAccessView(v)) || 'overview';
            view = fallback;
        }

        AppState.detailProjectId = null;
        AppState.setView(view);
        if (pushHash) history.pushState(null, '', `#${view}`);

        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.toggle('active', el.dataset.view === view);
        });

        this.renderCurrentView();
        this.updateSidebarMeta();
        const ca = document.getElementById('content-area');
        if (ca) ca.scrollTop = 0;
    },

    openProjectDetailPage(projectId) {
        const p = AppState.allProjects.find(x => x.id === projectId);
        if (!p) {
            this.toast('Project not found', 'error');
            return;
        }
        history.pushState(null, '', `#project/${encodeURIComponent(projectId)}`);
        this.syncStateFromHash();
        this.renderCurrentView();
        const ca = document.getElementById('content-area');
        if (ca) ca.scrollTop = 0;
        this.closeMobileSidebar();
    },

    /** Sibling tab: show one page’s detail at a time (dropdown in project view). */
    showSiblingPageDetail(index) {
        const n = parseInt(index, 10);
        if (isNaN(n) || n < 0) return;
        const container = document.getElementById('streak-sibling-panels');
        if (!container) return;
        const panels = container.querySelectorAll('.streak-sibling-panel');
        panels.forEach((el, i) => {
            el.style.display = i === n ? 'block' : 'none';
        });
        const sel = document.getElementById('streak-sibling-page-select');
        if (sel && sel.options.length) sel.selectedIndex = Math.min(n, sel.options.length - 1);
        const titleEl = document.getElementById('streak-pd-sibling-current-title');
        if (titleEl && sel && sel.options[n]) titleEl.textContent = sel.options[n].textContent;
        document.querySelectorAll('.streak-roadmap-row').forEach((row) => {
            const ri = parseInt(row.getAttribute('data-index'), 10);
            if (!isNaN(ri)) row.classList.toggle('streak-roadmap-row--selected', ri === n);
        });
    },

    /**
     * Project detail uses a full-width, single-page scroll “canvas” in the main column.
     */
    setProjectPageLayoutClass(isProject) {
        const el = document.getElementById('content-area');
        const scrollWrap = document.querySelector('.content-area-scrollable');
        if (el) el.classList.toggle('content-area--project-page', isProject);
        if (scrollWrap) scrollWrap.classList.toggle('content-area-scrollable--project', isProject);
    },

    _applyViewPaint(root) {
        if (!root) return;
        root.querySelectorAll('.ov-ring-arc[data-offset]').forEach(el => {
            el.style.strokeDashoffset = el.dataset.offset;
        });
        root.querySelectorAll('.ov-funnel-fill[data-fill], .workload-bar__fill[data-fill], .health-row__fill[data-fill], .progress-fill[data-fill], .perf-job-fill[data-fill], .perf-owner-bar[data-fill], .perf-milestone-fill[data-fill]').forEach(el => {
            if (el.dataset.fill != null) el.style.width = el.dataset.fill + '%';
        });
    },

    _setViewContent(root, html) {
        const scrollEl = document.querySelector('.content-area-scrollable');
        const scrollTop = scrollEl ? scrollEl.scrollTop : 0;
        const soft = this._softRender;

        if (soft) {
            root.classList.add('content-area--soft-update');
            if (scrollEl) scrollEl.classList.add('content-area-scrollable--soft-update');
        }

        const prevH = root.offsetHeight;
        if (soft && prevH > 0) root.style.minHeight = prevH + 'px';

        root.innerHTML = html;
        this._applyViewPaint(root);

        if (scrollEl) scrollEl.scrollTop = scrollTop;

        if (soft) {
            requestAnimationFrame(() => {
                if (scrollEl) scrollEl.scrollTop = scrollTop;
                root.style.minHeight = '';
                root.classList.remove('content-area--soft-update');
                if (scrollEl) scrollEl.classList.remove('content-area-scrollable--soft-update');
            });
        }
    },

    _aiMountOpts() {
        return { soft: this._softRender };
    },

    async _silentRefreshProjectPage() {
        const wantId = AppState.detailProjectId;
        const p = AppState.allProjects.find(x => x.id === wantId);
        const root = document.getElementById('content-area');
        if (!p || !root) return;

        if (!root.querySelector('.streak-project-page')) {
            this.renderCurrentView({ soft: true });
            return;
        }

        const sib = await loadProjectDetailData(p, AppState.activeSheetUrl, AppState.activeWorkspace);
        if (AppState.currentView !== 'project' || AppState.detailProjectId !== wantId) return;

        const scrollEl = document.querySelector('.content-area-scrollable');
        const scrollTop = scrollEl ? scrollEl.scrollTop : 0;

        this._softRender = true;
        this._setViewContent(root, renderProjectPage(p, sib));

        if (typeof AiInsights !== 'undefined' && typeof featureOn === 'function' && featureOn('AI_INSIGHTS')) {
            const pageRoot = root.querySelector('.streak-project-page');
            if (pageRoot && !document.getElementById('ai-project-insights')) {
                pageRoot.insertAdjacentHTML('afterbegin', AiInsights.shellHtml(
                    'ai-project-insights',
                    'AI Delivery Brief',
                    'Interpretation of this project metrics and velocity forecast only.'
                ));
            }
            requestAnimationFrame(() => AiInsights.mountProject(wantId, this._aiMountOpts()));
        }

        if (scrollEl) scrollEl.scrollTop = scrollTop;
        this._softRender = false;
    },

    renderCurrentView(opts = {}) {
        const root = document.getElementById('content-area');
        if (!root) return;

        const wasSoft = this._softRender;
        if (opts.soft) this._softRender = true;

        AtlasDD.closeAll();

        root.classList.toggle('content-area--performance', AppState.currentView === 'performance');
        this.setProjectPageLayoutClass(AppState.currentView === 'project');

        const aiOpts = this._aiMountOpts();

        switch (AppState.currentView) {
            case 'overview':
                this._setViewContent(root, renderOverview(AppState.filteredProjects));
                break;
            case 'projects':
                this._setViewContent(root, renderProjects(AppState.filteredProjects));
                break;
            case 'pipeline':
                this._setViewContent(root, renderPipeline(AppState.filteredProjects));
                break;
            case 'alerts':
                this._setViewContent(root, renderAlerts());
                break;
            case 'resources':
                this._setViewContent(root, renderResources());
                this._restoreResPeopleView();
                if (typeof AiInsights !== 'undefined') {
                    requestAnimationFrame(() => AiInsights.mountCapacity(aiOpts));
                }
                break;
            case 'timeline':
                this._setViewContent(root, AppState.timelineMode === 'calendar'
                    ? renderTimelineCalendar(AppState.allProjects)
                    : renderTimeline(AppState.filteredProjects));
                break;
            case 'analytics':
                this._setViewContent(root, renderAnalytics());
                if (typeof AiInsights !== 'undefined') {
                    requestAnimationFrame(() => AiInsights.mountAnalytics(aiOpts));
                }
                break;
            case 'intelligence':
                this._setViewContent(root, renderIntelligence());
                if (typeof AiInsights !== 'undefined') {
                    requestAnimationFrame(() => AiInsights.mountIntelligence(aiOpts));
                }
                break;
            case 'performance':
                this._setViewContent(root, renderPerformance());
                requestAnimationFrame(() => this._paintPerformanceCharts());
                break;
            case 'help':
                this._setViewContent(root, renderHelp());
                break;
            case 'settings':
                this._setViewContent(root, renderSettings());
                break;
            case 'project': {
                const wantId = AppState.detailProjectId;
                const p = AppState.allProjects.find(x => x.id === wantId);
                if (opts.soft && p && root.querySelector('.streak-project-page')) {
                    this._silentRefreshProjectPage();
                    break;
                }
                this._setViewContent(root, renderProjectPageLoading());
                (async () => {
                    if (!p) {
                        if (AppState.currentView !== 'project' || AppState.detailProjectId !== wantId) return;
                        const r = document.getElementById('content-area');
                        if (r) this._setViewContent(r, renderProjectNotFound());
                        return;
                    }
                    const sib = await loadProjectDetailData(p, AppState.activeSheetUrl, AppState.activeWorkspace);
                    if (AppState.currentView !== 'project' || AppState.detailProjectId !== wantId) return;
                    const p2 = AppState.allProjects.find(x => x.id === wantId);
                    const r2 = document.getElementById('content-area');
                    if (r2 && p2) {
                        this._setViewContent(r2, renderProjectPage(p2, sib));
                        if (typeof AiInsights !== 'undefined' && typeof featureOn === 'function' && featureOn('AI_INSIGHTS')) {
                            const pageRoot = r2.querySelector('.streak-project-page');
                            if (pageRoot) {
                                pageRoot.insertAdjacentHTML('afterbegin', AiInsights.shellHtml(
                                    'ai-project-insights',
                                    'AI Delivery Brief',
                                    'Interpretation of this project’s metrics and velocity forecast only.'
                                ));
                            }
                            requestAnimationFrame(() => AiInsights.mountProject(wantId, aiOpts));
                        }
                    }
                })();
                break;
            }
        }

        if (opts.soft) this._softRender = wasSoft;
        else this._softRender = false;
    },

    /* ══════════════════════════════════════════
       FILTER & SEARCH ACTIONS
    ══════════════════════════════════════════ */
    setFilter(key, value) {
        if (value === null || value === '') {
            AppState.filters[key] = null;
        } else {
            AppState.setFilter(key, value);
        }
        this.renderCurrentView();
    },

    setSort(key) {
        AppState.setSort(key);
        this.renderCurrentView();
    },

    clearFilters() {
        AppState.clearFilters();
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        this.renderCurrentView();
    },

    setPipelineMode(mode) {
        AppState.setPipelineMode(mode);
        this.renderCurrentView();
    },

    toggleTheme() {
        const doc = document.documentElement;
        const current = doc.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        doc.setAttribute('data-theme', next);
        localStorage.setItem('streakjs_theme', next);
    },

    showReleasesOnDate(year, month, dNum, el) {
        // Find projects releasing on this date
        const matches = AppState.allProjects.filter(p => {
             if(!p.release_date) return false;
             const dr = parseSmartDate(p.release_date);
             if (!dr || isNaN(dr.getTime())) return false;
             return dr.getFullYear() === year && dr.getMonth() === month && dr.getDate() === dNum;
        });

        if (!matches.length) {
            this.toast(`No releases scheduled for ${month+1}/${dNum}/${year}`, 'info');
            return;
        }

        // Highlight selected
        document.querySelectorAll('.cal-date').forEach(n => n.style.backgroundColor = '');
        el.style.backgroundColor = 'var(--bg-peach)';
        el.style.color = 'var(--text-primary)';

        // Open modal or just toast for now (since we have a detail modal)
        if (matches.length === 1) {
             this.openProjectDetailPage(matches[0].id);
        } else {
             this.toast(`${matches.length} projects releasing on this date. Open first…`, 'info');
             this.openProjectDetailPage(matches[0].id);
        }
    },

    /* ══════════════════════════════════════════
       CARD CLICK — jump to project in projects grid
    ══════════════════════════════════════════ */
    handleCardClick(projectId) {
        this.openProjectDetailPage(projectId);
    },

    /* ══════════════════════════════════════════
       ANALYTICS DRILL-DOWN — click a chart element to see the underlying pages
    ══════════════════════════════════════════ */
    analyticsDrill(type, value, extra) {
        if (typeof getAnalyticsDrillUnits !== 'function') return;
        const { title, subtitle, units } = getAnalyticsDrillUnits(type, value, extra);
        this.openAnalyticsModal(title, subtitle, units);
    },

    openAnalyticsModal(title, subtitle, units) {
        this.closeAnalyticsModal();
        const esc = (typeof escapeHtml === 'function') ? escapeHtml : (s => String(s == null ? '' : s));
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const fmt = (s) => {
            if (!s) return '—';
            const d = parseSmartDate(s);
            return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        };

        const rows = (units && units.length) ? units.map(u => {
            const start = u.start_date ? parseSmartDate(u.start_date) : null;
            const ageDays = (start && !isNaN(start.getTime()))
                ? Math.max(0, Math.round((today - start) / 86400000)) : null;
            const stageKey = String(u.stage || '').toLowerCase().replace(/[^a-z]/g, '');
            const stageLabel = u.rawStage || u.stage || '—';
            const dev = (typeof splitAssigneeNames === 'function' ? splitAssigneeNames(u.developer) : [])
                .filter(n => typeof isValidResourceName !== 'function' || isValidResourceName(n));
            return `
            <div class="an-drill-row" onclick="App.closeAnalyticsModal();App.openProjectDetailPage('${esc(u.id)}')" title="Open ${esc(u.projectName || u.name)}">
                <div class="an-drill-main">
                    <div class="an-drill-proj">${esc(u.projectName || u.name || '—')}</div>
                    ${u.page ? `<div class="an-drill-page">${esc(u.page)}</div>` : ''}
                    ${dev.length ? `<div class="an-drill-dev">${esc(dev.join(', '))}</div>` : ''}
                </div>
                <span class="an-drill-chip an-drill-chip--${stageKey}" title="Normalized: ${esc(u.stage || '—')}">${esc(stageLabel)}</span>
                <div class="an-drill-metric">
                    ${u.drillMetric
                        ? `<span class="an-drill-pct">${esc(u.drillMetric)}</span>`
                        : `<span class="an-drill-pct">${u.progress != null ? u.progress + '%' : '—'}</span>${ageDays != null ? `<span class="an-drill-age">${ageDays}d old</span>` : ''}`}
                </div>
                <div class="an-drill-dates">
                    <span>Rel: ${fmt(u.release_date)}</span>
                    <span>Live: ${fmt(u.actual_live_date)}</span>
                </div>
                <span class="an-drill-arrow">→</span>
            </div>`;
        }).join('') : '<div class="an-drill-empty">No matching pages found.</div>';

        const overlay = document.createElement('div');
        overlay.className = 'an-drill-overlay';
        overlay.id = 'an-drill-overlay';
        overlay.innerHTML = `
        <div class="an-drill-modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
            <div class="an-drill-head">
                <div class="an-drill-head-text">
                    <div class="an-drill-title">${esc(title)}</div>
                    ${subtitle ? `<div class="an-drill-sub">${esc(subtitle)}</div>` : ''}
                </div>
                <button class="an-drill-close" onclick="App.closeAnalyticsModal()" aria-label="Close">✕</button>
            </div>
            <div class="an-drill-list">${rows}</div>
        </div>`;
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.closeAnalyticsModal(); });
        document.body.appendChild(overlay);

        this._drillEscHandler = (e) => { if (e.key === 'Escape') this.closeAnalyticsModal(); };
        document.addEventListener('keydown', this._drillEscHandler);
    },

    closeAnalyticsModal() {
        const el = document.getElementById('an-drill-overlay');
        if (el) el.remove();
        if (this._drillEscHandler) {
            document.removeEventListener('keydown', this._drillEscHandler);
            this._drillEscHandler = null;
        }
    },

    copyProjectLink(projectId) {
        const url = location.origin + location.pathname + `#project/${encodeURIComponent(projectId)}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => this.toast('Link copied to clipboard', 'success'));
        } else {
            const ta = document.createElement('textarea');
            ta.value = url;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            this.toast('Link copied to clipboard', 'success');
        }
    },

    /* ══════════════════════════════════════════
       OVERVIEW — Tab switcher for Upcoming Deadlines
    ══════════════════════════════════════════ */
    /* ── Availability popover ── */
    toggleAvailPopover(btn) {
        const pop = document.getElementById('res-avail-popover');
        if (!pop) return;
        const isOpen = pop.style.display === 'block';
        if (isOpen) {
            this.closeAvailPopover();
            return;
        }
        const today   = new Date(); today.setHours(0,0,0,0);
        const resMap  = AppState.resourceMap;
        const conflictCount = Object.values(resMap).filter(p => p.conflicts.length > 0).length;
        const freeCount = Object.values(resMap).filter(p => p.freeFrom && p.freeFrom > today && Math.ceil((p.freeFrom - today)/86400000) <= 14).length +
                          Object.values(resMap).filter(p => p.freeFrom && p.freeFrom <= today).length;

        pop.innerHTML = `
        <div class="res-pop-header">
            <span class="res-pop-title">Team Availability</span>
            ${conflictCount ? `<span class="res-pop-cfl-badge">${conflictCount} conflict${conflictCount>1?'s':''}</span>` : ''}
        </div>
        ${renderAvailPopoverContent()}
        <div class="res-pop-footer" onclick="App.closeAvailPopover();App.navigate('resources')">
            View full Resources →
        </div>`;
        pop.style.display = 'block';

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', this._availOutsideHandler = (e) => {
                const popEl = document.getElementById('res-avail-popover');
                const btnEl = document.getElementById('btn-avail');
                if (popEl && !popEl.contains(e.target) && btnEl && !btnEl.contains(e.target)) {
                    this.closeAvailPopover();
                }
            });
        }, 0);
    },

    closeAvailPopover() {
        const pop = document.getElementById('res-avail-popover');
        if (pop) pop.style.display = 'none';
        if (this._availOutsideHandler) {
            document.removeEventListener('click', this._availOutsideHandler);
            this._availOutsideHandler = null;
        }
    },

    /* Highlight person cards on the Resources page (scroll to first match) */
    highlightResCard(names) {
        if (AppState.currentView !== 'resources') {
            this.navigate('resources');
            setTimeout(() => this.highlightResCard(names), 350);
            return;
        }
        names.forEach(name => {
            const id  = 'res-card-' + name.replace(/\s+/g,'-').replace(/[^a-zA-Z0-9-]/g,'');
            const el  = document.getElementById(id);
            if (!el) return;
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Open it and flash
            const panel = el.querySelector('.res-detail-panel');
            const icon  = el.querySelector('.res-expand-icon');
            if (panel && !panel.classList.contains('res-detail-panel--open')) {
                panel.classList.add('res-detail-panel--open');
                if (icon) icon.classList.add('res-expand-icon--open');
            }
            el.classList.add('res-person-card--flash');
            setTimeout(() => el.classList.remove('res-person-card--flash'), 1200);
        });
    },

    /* Update the availability badge count in the header button */
    updateAvailBadge() {
        const badge = document.getElementById('avail-btn-badge');
        if (!badge || !AppState.allProjects.length) return;
        const today      = new Date(); today.setHours(0,0,0,0);
        const resMap     = AppState.resourceMap;
        const conflicts  = Object.values(resMap).filter(p => p.conflicts.length > 0).length;
        const freeSoon   = Object.values(resMap).filter(p => p.freeFrom && Math.ceil((p.freeFrom - today)/86400000) <= 14).length;
        if (conflicts > 0) {
            badge.textContent = conflicts;
            badge.className   = 'avail-btn-badge avail-btn-badge--red';
            badge.style.display = 'flex';
        } else if (freeSoon > 0) {
            badge.textContent = freeSoon;
            badge.className   = 'avail-btn-badge avail-btn-badge--green';
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    },

    setTimelineMode(mode) {
        AppState.setTimelineMode(mode);
        this.renderCurrentView();
    },

    setTimelineZoom(months) {
        AppState.setTimelineZoom(parseInt(months, 10));
        this.renderCurrentView();
    },

    showCalendarDay(dateKey) {
        const panel = document.getElementById('tlc-day-panel');
        if (!panel) return;

        // Build event list for this date
        // Parse as LOCAL date (not UTC) to avoid timezone-offset issues
        const projects = AppState.allProjects;
        const [yr, mo, dy] = dateKey.split('-').map(Number);
        const d = new Date(yr, mo - 1, dy); d.setHours(0,0,0,0);
        const label = d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

        const entries = [];
        projects.forEach(p => {
            const check = (raw, type) => {
                if (!raw) return;
                const pd = parseSmartDate(raw); if (!pd || isNaN(pd.getTime())) return;
                pd.setHours(0,0,0,0);
                if (pd.getTime() === d.getTime()) entries.push({ type, project: p });
            };
            check(p.actual_live_date, 'live');
            check(p.release_date,    'release');
            check(p.start_date,      'start');
        });

        if (!entries.length) { panel.style.display = 'none'; return; }

        const typeLabel = { live: '🟢 Went Live', release: '🔴 Release Deadline', start: '🔵 Project Start' };
        const rows = entries.map(e => `
        <div class="tlc-panel-row" onclick="App.handleCardClick('${e.project.id}')">
            <span class="tlc-panel-type">${typeLabel[e.type]}</span>
            <span class="tlc-panel-name">${escapeHtml(e.project.name)}</span>
            <span class="tlc-panel-stage">${escapeHtml(e.project.stage)}</span>
            <span class="tlc-panel-arrow">→</span>
        </div>`).join('');

        panel.innerHTML = `
        <div class="tlc-panel-header">
            <span class="tlc-panel-date">${label}</span>
            <span style="font-size:12px;color:var(--text-muted);">${entries.length} event${entries.length > 1 ? 's' : ''}</span>
            <button onclick="document.getElementById('tlc-day-panel').style.display='none'" class="tlc-panel-close">✕</button>
        </div>
        ${rows}`;
        panel.style.display = 'block';
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },

    toggleResCard(cardId) {
        const card  = document.getElementById(cardId);
        if (!card) return;
        const panel  = card.querySelector('.res-detail-panel');
        const icon   = card.querySelector('.res-expand-icon');
        if (!panel) return;
        const isOpen = panel.classList.contains('res-detail-panel--open');
        panel.classList.toggle('res-detail-panel--open', !isOpen);
        if (icon) icon.classList.toggle('res-expand-icon--open', !isOpen);
    },

    /** Expand / shrink scheduling-conflict pairs (Show more ↔ Shrink). */
    toggleConflictCard(cardId, hiddenCount) {
        const more = document.getElementById(cardId + '-more');
        const btn  = document.getElementById(cardId + '-btn');
        if (!more || !btn) return;
        const open = more.hasAttribute('hidden');
        if (open) more.removeAttribute('hidden');
        else more.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.classList.toggle('res-cfl-toggle--open', open);
        const n = hiddenCount || more.querySelectorAll('.res-cfl-pair').length;
        const moreEl = btn.querySelector('.res-cfl-toggle__more');
        if (moreEl) moreEl.textContent = 'Show ' + n + ' more';
    },

    /** Switch the People section between 'table' (default) and 'cards' (original). */
    setResPeopleView(mode) {
        const tableEl = document.getElementById('res-people-table-view');
        const cardsEl = document.getElementById('res-people-cards-view');
        const btnT    = document.getElementById('res-vt-table');
        const btnC    = document.getElementById('res-vt-cards');
        if (!tableEl || !cardsEl) return;

        if (mode === 'cards') {
            tableEl.style.display = 'none';
            cardsEl.style.display = '';
            if (btnT) btnT.classList.remove('res-vt-btn--active');
            if (btnC) btnC.classList.add('res-vt-btn--active');
        } else {
            cardsEl.style.display = 'none';
            tableEl.style.display = '';
            if (btnC) btnC.classList.remove('res-vt-btn--active');
            if (btnT) btnT.classList.add('res-vt-btn--active');
        }
        try { localStorage.setItem('streakjs_res_view', mode); } catch(_) {}
    },

    /** Restore saved resource people view preference after render. */
    _restoreResPeopleView() {
        try {
            const saved = localStorage.getItem('streakjs_res_view') || 'table';
            this.setResPeopleView(saved);
        } catch(_) {}
    },

    setOverviewTab(tab, clickedEl) {
        // Update active tab style
        if (clickedEl) {
            const tabs = clickedEl.closest('.filter-tabs');
            if (tabs) tabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            clickedEl.classList.add('active');
        }
        // Re-render task list
        const list = document.getElementById('overview-task-list');
        if (list) list.innerHTML = buildOverviewTaskRows(tab);
    },

    /* ══════════════════════════════════════════
       NAVIGATE with a pre-set filter applied
    ══════════════════════════════════════════ */
    setFilterAndNavigate(filterKey, filterValue, view) {
        AppState.clearFilters();
        AppState.setFilter(filterKey, filterValue);
        this.navigate(view);
    },

    goToProject(projectId) {
        AppState.clearFilters();
        this.navigate('projects');
        // Scroll to the card
        setTimeout(() => {
            const card = document.querySelector(`[data-id="${projectId}"]`);
            if (card) {
                card.scrollIntoView({ behavior:'smooth', block:'center' });
                card.style.boxShadow = '0 0 0 3px #1A73E888';
                setTimeout(() => card.style.boxShadow = '', 2000);
            }
        }, 100);
    },

    /* ══════════════════════════════════════════
       DATA REFRESH
    ══════════════════════════════════════════ */
    /** Restore scroll after re-render (Overview animates bars/rings at ~60ms). */
    _restoreScrollPosition(scrollEl, scrollTop) {
        if (!scrollEl) return;
        const apply = () => { scrollEl.scrollTop = scrollTop; };
        apply();
        requestAnimationFrame(() => {
            apply();
            requestAnimationFrame(apply);
        });
        setTimeout(apply, 80);
    },

    async refresh(silent = false) {
        if (!silent) {
            const btn = document.getElementById('btn-refresh');
            if (btn) btn.querySelector('svg').classList.add('spinning');
        }

        const scrollEl = document.querySelector('.content-area-scrollable');
        const scrollTop = scrollEl ? scrollEl.scrollTop : 0;

        try {
            const { projects, source, roadmapCount } = await this._loadLiveProjects();

            if (silent && AppState.currentView === 'project') {
                await this._silentRefreshProjectPage();
            } else {
                this._softRender = !!silent;
                this.renderCurrentView({ soft: silent });
                this._softRender = false;
                this._restoreScrollPosition(scrollEl, scrollTop);
            }

            this.updateSidebarMeta();
            this.updateNavAlertBadge();
            this.updateLastUpdated();

            if (!silent) {
                const time = new Date().toLocaleTimeString();
                if (source === 'error' || !AppState.activeSheetUrl) {
                    this.toast('No sheet URL for this workspace. Set it in js/config.js.', 'error', 6000);
                } else if (projects.length === 0) {
                    this.toast('Sheet loaded but no project rows found.', 'warning', 5000);
                } else {
                    const rm = roadmapCount ? ` · ${roadmapCount} delivery tabs` : '';
                    this.toast(`Refreshed ${projects.length} projects${rm} · ${time}`, 'success');
                }
            }
        } catch (err) {
            console.error('[Atlas] Refresh failed:', err);
            if (!silent) this.toast('Refresh failed. Check connection.', 'error');
        } finally {
            if (!silent) {
                const btn = document.getElementById('btn-refresh');
                if (btn) btn.querySelector('svg')?.classList.remove('spinning');
            }
        }
    },

    startAutoRefresh() {
        if (this.refreshTimer) clearInterval(this.refreshTimer);
        if (this._metaTimer)   clearInterval(this._metaTimer);
        if (AppState.isZohoActive) {
            this.updateLastUpdated();
            return;
        }
        this.refreshTimer = setInterval(() => this.refresh(true), CONFIG.REFRESH_INTERVAL_MS);
        this._metaTimer   = setInterval(() => this.updateLastUpdated(), 30_000);
        this.updateLastUpdated();
    },

    updateLastUpdated() {
        const el = document.getElementById('last-updated-text');
        if (!el || !AppState.lastUpdated) return;
        const secs = Math.round((Date.now() - AppState.lastUpdated.getTime()) / 1000);
        
        let text = '';
        if (secs < 60) text = 'Updated just now';
        else if (secs < 3600) text = `Updated ${Math.round(secs/60)}m ago`;
        else text = `Updated at ${AppState.lastUpdated.toLocaleTimeString()}`;
        
        if (el.textContent !== text) el.textContent = text;
    },

    /* ══════════════════════════════════════════
       SIDEBAR META
    ══════════════════════════════════════════ */
    updateSidebarMeta() {
        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el && el.textContent !== String(val)) {
                el.textContent = val;
            }
        };
        
        // Basic Checks
        if (AppState.isZohoActive) {
            const n = AppState.timelogEntries.length;
            const approved = AppState.filteredTimelogEntries.length;
            set('count-performance', approved || n);
            const syncText = document.getElementById('sync-text');
            const syncDot  = document.getElementById('sync-dot');
            if (syncText) syncText.textContent = n ? 'Timelog loaded' : 'Awaiting upload';
            if (syncDot) syncDot.style.background = n ? 'var(--status-success)' : 'var(--status-warning)';
            return;
        }

        if (!AppState.allProjects) return;

        set('count-overview', AppState.allProjects.length);
        set('count-projects', AppState.allProjects.length);
        const pipeCount = AppState.allProjects.filter(p => !['Backlog','Live'].includes(p.stage)).length;
        set('count-pipeline', pipeCount);
        
        set('count-alerts', AppState.alertTotalCount);
        set('count-timeline', AppState.allProjects.length);
        set('count-analytics', AppState.allProjects.filter(p => p.stage === 'Live').length);
        const intelCrit = intelligenceEnabled()
            ? (AppState.intelligenceSummary?.attention_critical ?? 0)
            : 0;
        set('count-intelligence', intelCrit || AppState.attentionRanked.filter(p => p.attentionTier === 'high').length);
        const conflictCount = Object.values(AppState.resourceMap).filter(p => p.conflicts.length > 0).length;
        set('count-resources', conflictCount || Object.keys(AppState.resourceMap).length);
        this.updateAvailBadge();

        // Data source indicator
        const syncText = document.getElementById('sync-text');
        const syncDot  = document.getElementById('sync-dot');
        
        if (syncText) {
            const label = AppState.dataSource === 'error' ? 'Not connected' : 'Sheets Live';
            if (syncText.textContent !== label) syncText.textContent = label;
        }
        if (syncDot) {
            const ok = AppState.dataSource === 'sheets' && AppState.allProjects.length > 0;
            syncDot.style.background = ok ? 'var(--status-success)' : 'var(--status-warning)';
        }
    },

    updateNavAlertBadge() {
        // Redundant now that we have counts, but we can use it on the Alerts tab link specifically if we want a red dot
        const dot = document.getElementById('nav-alert-dot');
        if (!dot) return;
        const critical = AppState.alertTotalCount;
        dot.style.display = critical > 0 ? 'block' : 'none';
    },

    /* ══════════════════════════════════════════
       EVENT BINDING
    ══════════════════════════════════════════ */
    bindGlobalEvents() {
        if (this._eventsBound) return; // prevent duplicate listeners on re-login
        this._eventsBound = true;

        AtlasDD.init();

        // Refetch published sheet when user returns to this tab (debounced)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState !== 'visible') return;
            if (AppState.isZohoActive) return;
            if (!AppState.activeSheetUrl) return;
            const minGap = 5000;
            if (Date.now() - this._lastLiveFetch < minGap) return;
            this.refresh(true);
        });

        // Sidebar nav
        document.getElementById('sidebar-nav').addEventListener('click', e => {
            const item = e.target.closest('.nav-item');
            if (item) {
                e.preventDefault();
                this.navigate(item.dataset.view);
                // Close mobile sidebar
                this.closeMobileSidebar();
            }
        });

        // Search input (debounced)
        let searchTimer;
        document.getElementById('search-input').addEventListener('input', e => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                AppState.setSearch(e.target.value);
                if (['projects','pipeline','timeline'].includes(AppState.currentView)) {
                    this.renderCurrentView();
                } else if (e.target.value.trim()) {
                    this.navigate('projects');
                }
            }, 220);
        });

        // Keyboard shortcut: Cmd+K / Ctrl+K → focus search
        document.addEventListener('keydown', e => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('search-input').focus();
                document.getElementById('search-input').select();
            }
            if (e.key === 'Escape') {
                const modal = document.querySelector('.streak-modal-backdrop');
                if (modal) { modal.remove(); return; }
                document.getElementById('search-input')?.blur();
            }
        });

        // Refresh button
        const btnRefresh = document.getElementById('btn-refresh');
        if (btnRefresh) btnRefresh.addEventListener('click', () => this.refresh());

        // Export button
        const btnExport = document.getElementById('btn-export');
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                if (AppState.isZohoActive && AppState.currentView === 'performance') {
                    this.exportTimelogCSV();
                    return;
                }
                exportToCSV(AppState.allProjects);
                this.toast(`Exported ${AppState.allProjects.length} projects to CSV`, 'success');
            });
        }

        const zohoInput = document.getElementById('zoho-csv-input');
        if (zohoInput) {
            zohoInput.addEventListener('change', e => {
                const file = e.target.files?.[0];
                if (file) this.handleZohoFile(file);
            });
        }

        const btnZohoUpload = document.getElementById('btn-zoho-upload');
        if (btnZohoUpload) btnZohoUpload.addEventListener('click', () => this.triggerZohoUpload());

        // Mobile hamburger
        const hamburgerBtn = document.getElementById('hamburger-btn');
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('open');
                document.getElementById('sidebar-overlay').classList.toggle('visible');
            });
        }

        // Sidebar overlay click → close
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => this.closeMobileSidebar());

        // Browser back/forward
        window.addEventListener('popstate', () => {
            this.syncStateFromHash();
            this.renderCurrentView();
            this.updateSidebarMeta();
        });
    },

    closeMobileSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('visible');
    },

    /* ══════════════════════════════════════════
       LOADING OVERLAY
    ══════════════════════════════════════════ */
    showLoader() {
        const el = document.getElementById('loading-overlay');
        if (el) el.classList.remove('hidden');
    },

    hideLoader() {
        const el = document.getElementById('loading-overlay');
        if (!el) return;
        setTimeout(() => el.classList.add('hidden'), 800);
    },

    /* ══════════════════════════════════════════
       TOAST NOTIFICATIONS
    ══════════════════════════════════════════ */
    toast(message, type = 'default', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '✓', error: '✕', warning: '⚠', info: 'ℹ', default: '•'
        };
        toast.innerHTML = `<span style="font-size:16px">${icons[type] || '•'}</span><span>${message}</span>`;
        toast.addEventListener('click', () => toast.remove());
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.25s ease forwards';
            setTimeout(() => toast.remove(), 250);
        }, duration);
    },
};

/* ══════════════════════════════════════════
   ATLAS DROPDOWN — Custom popover select
   Replaces native <select> everywhere.
   Actions: 'filter:<key>', 'sort', 'sibling-page', 'settings-role:N'
══════════════════════════════════════════ */
const AtlasDD = (() => {
    let _openId = null;
    let _bound  = false;

    function _menuEl(id) {
        return document.getElementById(`${id}-menu`);
    }

    function _clearMenuStyles(menu) {
        if (!menu) return;
        menu.style.display = 'none';
        menu.style.position = '';
        menu.style.top = '';
        menu.style.left = '';
        menu.style.minWidth = '';
        menu.style.width = '';
        menu.style.zIndex = '';
        menu.classList.remove('atlas-dd-menu--open');
    }

    function _reattachMenu(menu) {
        if (!menu || !menu._atlasDdPlaceholder) return;
        const ph = menu._atlasDdPlaceholder;
        if (ph.parentNode) ph.parentNode.insertBefore(menu, ph);
        ph.remove();
        delete menu._atlasDdPlaceholder;
    }

    function _positionMenu(menu, trigger) {
        const rect = trigger.getBoundingClientRect();
        const gap = 6;
        let top = rect.bottom + gap;
        const left = rect.left;
        menu.style.position = 'fixed';
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        menu.style.minWidth = `${Math.max(rect.width, 120)}px`;
        menu.style.width = 'max-content';
        menu.style.zIndex = '10050';
        requestAnimationFrame(() => {
            const mh = menu.offsetHeight;
            if (top + mh > window.innerHeight - 8) {
                menu.style.top = `${Math.max(8, rect.top - mh - gap)}px`;
            }
        });
    }

    function _portalMenu(menu) {
        if (menu._atlasDdPlaceholder) return;
        const ph = document.createComment('atlas-dd-anchor');
        menu.parentNode.insertBefore(ph, menu);
        menu._atlasDdPlaceholder = ph;
        document.body.appendChild(menu);
    }

    function closeAll() {
        _openId = null;
        document.querySelectorAll('.atlas-dd-menu').forEach(menu => {
            _reattachMenu(menu);
            _clearMenuStyles(menu);
        });
        document.querySelectorAll('.atlas-dd-trigger').forEach(t => {
            t.classList.remove('atlas-dd-trigger--open');
        });
    }

    function toggle(id) {
        const dd = document.getElementById(id);
        const menu = _menuEl(id);
        const trigger = dd && dd.querySelector('.atlas-dd-trigger');
        if (!dd || !menu || !trigger) return;

        if (_openId === id) {
            closeAll();
            return;
        }

        closeAll();
        _portalMenu(menu);
        menu.style.display = 'block';
        menu.classList.add('atlas-dd-menu--open');
        _positionMenu(menu, trigger);
        trigger.classList.add('atlas-dd-trigger--open');
        _openId = id;
    }

    function pick(id, value, label, action) {
        const dd = document.getElementById(id);
        const menu = _menuEl(id);
        if (dd) {
            const labelEl = dd.querySelector('.atlas-dd-value');
            if (labelEl) labelEl.textContent = label;
            dd.classList.toggle('atlas-dd--active', value !== '' && value != null);
        }
        const itemRoot = menu || dd;
        if (itemRoot) {
            itemRoot.querySelectorAll('.atlas-dd-item').forEach(item => {
                const on = (item.dataset.ddVal ?? item.dataset.val ?? '') === String(value);
                item.classList.toggle('atlas-dd-item--on', on);
                const chk = item.querySelector('.atlas-dd-chk');
                if (chk) chk.style.visibility = on ? 'visible' : 'hidden';
            });
        }
        closeAll();

        if (action === 'sort') {
            App.setSort(value);
        } else if (action === 'sibling-page') {
            App.showSiblingPageDetail(value);
        } else if (action.startsWith('settings-role:')) {
            const idx = parseInt(action.split(':')[1], 10);
            if (!isNaN(idx)) SettingsCtrl.updateUser(idx, 'role', value);
        } else if (action.startsWith('filter:')) {
            App.setFilter(action.replace('filter:', ''), value || null);
        }
    }

    function init() {
        if (_bound) return;
        _bound = true;

        document.addEventListener('click', (e) => {
            const item = e.target.closest('.atlas-dd-item');
            if (item) {
                e.preventDefault();
                e.stopPropagation();
                pick(
                    item.dataset.ddId,
                    item.dataset.ddVal ?? '',
                    item.dataset.ddLabel ?? '',
                    item.dataset.ddAction ?? ''
                );
                return;
            }

            const trigger = e.target.closest('.atlas-dd-trigger');
            if (trigger && trigger.dataset.ddId) {
                e.preventDefault();
                e.stopPropagation();
                toggle(trigger.dataset.ddId);
                return;
            }

            if (_openId) closeAll();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && _openId) {
                closeAll();
            }
        });
    }

    return { init, toggle, pick, closeAll };
})();

window.AtlasDD = AtlasDD;
AtlasDD.init();

/* ══════════════════════════════════════════
   SETTINGS CONTROLLER
   Manages the RBAC settings board.
   Works on a deep-cloned live config draft;
   every change is persisted to localStorage immediately.
══════════════════════════════════════════ */
const SettingsCtrl = (() => {
    // Deep clone the live config into a mutable draft
    function getDraft() {
        return {
            users: JSON.parse(JSON.stringify(Auth.getUsers())),
            roles: JSON.parse(JSON.stringify(Auth.getRoles())),
        };
    }

    function persist(draft) {
        Auth.saveSettings(draft.users, draft.roles);
    }

    function persistWorkspaces() {
        localStorage.setItem('atlas_workspaces', JSON.stringify(CONFIG.WORKSPACES));
        // Force state refresh of active sheet URL
        AppState.activeWorkspaceId = AppState.activeWorkspaceId;
    }

    function rerender() {
        AtlasDD.closeAll();
        const root = document.getElementById('content-area');
        if (root && AppState.currentView === 'settings') {
            root.innerHTML = renderSettings();
        }
        // Re-apply RBAC gating in case current user's permissions changed
        App.applyRBACToUI();
        App.updateSidebarUserChip();
    }

    return {
        // ── Users ─────────────────────────────────────

        addUser() {
            const draft = getDraft();
            const id = 'user_' + Date.now();
            // Default to least-privilege role; skip 'admin' as the default
            const roleKeys = Object.keys(draft.roles);
            const defaultRole = roleKeys.find(r => r !== 'admin') || roleKeys[0] || 'developer';
            draft.users.push({
                id,
                name: 'New User',
                displayName: 'New User',
                role: defaultRole,
                pin: '0000',
                workspaces: '*',
            });
            persist(draft);
            rerender();
            App.toast('User added', 'success');
        },

        deleteUser(idx) {
            const draft = getDraft();
            const u = draft.users[idx];
            if (!u) return;
            // Prevent deleting yourself
            const me = Auth.currentUser;
            if (me && u.id === me.id) { App.toast('Cannot delete your own account.', 'error'); return; }
            draft.users.splice(idx, 1);
            persist(draft);
            rerender();
            App.toast('User removed', 'success');
        },

        updateUser(idx, field, value) {
            const draft = getDraft();
            if (!draft.users[idx]) return;
            const v = String(value).trim();
            if (field === 'name') {
                draft.users[idx].name = v;
                draft.users[idx].displayName = v;
            } else {
                draft.users[idx][field] = value;
            }
            persist(draft);
            Auth.refreshLoginIdentityGrid();
        },

        toggleWsAll(idx, el) {
            const draft = getDraft();
            if (!draft.users[idx]) return;
            const isNowAll = !el.classList.contains('stg-chip--on');
            draft.users[idx].workspaces = isNowAll ? '*' : [];
            persist(draft);
            rerender();
        },

        toggleWs(idx, wsId, el) {
            const draft = getDraft();
            if (!draft.users[idx]) return;
            let ws = draft.users[idx].workspaces;
            if (ws === '*') ws = (CONFIG.WORKSPACES || []).map(w => w.id);
            if (!Array.isArray(ws)) ws = [];
            if (ws.includes(wsId)) {
                const next = ws.filter(id => id !== wsId);
                if (next.length === 0) {
                    App.toast('At least one workspace must be assigned.', 'warning');
                    return; // reject — don't allow empty workspace access
                }
                ws = next;
            } else {
                ws.push(wsId);
            }
            draft.users[idx].workspaces = ws;
            persist(draft);
            rerender();
        },

        togglePinView(btn) {
            const wrap  = btn.closest('.stg-pin-wrap');
            const input = wrap && wrap.querySelector('input');
            if (!input) return;
            input.type = input.type === 'password' ? 'text' : 'password';
        },

        // ── Roles ─────────────────────────────────────

        toggleRoleView(roleName, viewId, checked) {
            const draft = getDraft();
            const rc = draft.roles[roleName];
            if (!rc || rc.views === '*') return;
            if (!Array.isArray(rc.views)) rc.views = [];
            if (checked) { if (!rc.views.includes(viewId)) rc.views.push(viewId); }
            else         { rc.views = rc.views.filter(v => v !== viewId); }
            persist(draft);
            this._flashRole(roleName);
        },

        toggleRoleAction(roleName, action, checked) {
            const draft = getDraft();
            const rc = draft.roles[roleName];
            if (!rc || rc.actions === '*') return;
            if (!Array.isArray(rc.actions)) rc.actions = [];
            if (checked) { if (!rc.actions.includes(action)) rc.actions.push(action); }
            else         { rc.actions = rc.actions.filter(a => a !== action); }
            persist(draft);
            this._flashRole(roleName);
        },

        _flashRole(roleName) {
            const card = document.getElementById(`stg-role-${roleName}`);
            if (!card) return;
            card.classList.add('stg-role-card--saved');
            setTimeout(() => card.classList.remove('stg-role-card--saved'), 700);
            App.toast('Permission updated', 'success', 1500);
        },

        addWorkspace() {
            const id = 'ws_' + Date.now();
            CONFIG.WORKSPACES.push({
                id,
                name: 'New Workspace',
                displayName: 'New Workspace Dashboard',
                integrationType: 'google_sheets',
                sheetUrl: '',
                clickupListId: '',
                clickupToken: ''
            });
            persistWorkspaces();
            rerender();
            App.toast('Workspace added', 'success');
        },

        deleteWorkspace(idx) {
            const ws = CONFIG.WORKSPACES[idx];
            if (!ws) return;
            if (CONFIG.WORKSPACES.length <= 1) {
                App.toast('Cannot delete the last workspace.', 'error');
                return;
            }
            if (AppState.activeWorkspaceId === ws.id) {
                const other = CONFIG.WORKSPACES.find(w => w.id !== ws.id);
                if (other) {
                    AppState.setWorkspace(other.id);
                }
            }
            CONFIG.WORKSPACES.splice(idx, 1);
            persistWorkspaces();
            rerender();
            App.toast('Workspace removed', 'success');
        },

        updateWorkspace(idx, field, value) {
            const ws = CONFIG.WORKSPACES[idx];
            if (!ws) return;
            ws[field] = String(value).trim();
            if (field === 'name') {
                ws.displayName = ws.name + ' Dashboard';
            }
            persistWorkspaces();
            rerender();
        },

        resetToDefaults() {
            if (!confirm('Reset all roles to default settings? This cannot be undone.')) return;
            Auth.resetSettings();
            rerender();
            App.toast('Reset to defaults', 'info');
        },
    };
})();

/* ══════════════════════════════════════════
   BOOT ON DOM READY
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => App.init());
