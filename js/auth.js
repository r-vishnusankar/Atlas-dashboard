/**
 * Atlas — Auth & RBAC
 * Handles manual login (user selection + PIN), session management,
 * and role-based permission checks for views, workspaces, and actions.
 *
 * Session is stored in sessionStorage — clears automatically when
 * the browser tab/window is closed.
 */

const Auth = (() => {
    const SESSION_KEY  = 'atlas_session';
    const RBAC_KEY     = 'atlas_rbac_config';

    /** Label shown on login cards, sidebar, etc. (settings + login must stay in sync) */
    function userDisplayName(user) {
        if (!user) return '';
        return String(user.displayName || user.name || '').trim();
    }

    // ── Session helpers ──────────────────────────────
    function saveSession(user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
            id: user.id,
            role: user.role,
            name: user.name,
            displayName: userDisplayName(user),
        }));
    }

    /** Re-read live RBAC user and refresh session (after settings name change) */
    function refreshSessionFromLiveConfig() {
        const sess = loadSession();
        if (!sess) return;
        const live = liveConfig().users.find(u => u.id === sess.id);
        if (live) saveSession(live);
    }

    function clearSession() {
        sessionStorage.removeItem(SESSION_KEY);
    }

    function loadSession() {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    // ── RBAC config storage (localStorage overrides CONFIG) ──
    function loadRbacConfig() {
        try {
            const raw = localStorage.getItem(RBAC_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function saveRbacConfig(cfg) {
        localStorage.setItem(RBAC_KEY, JSON.stringify(cfg));
    }

    /**
     * config.js is the source of truth for built-in users' workspace access.
     * Settings used to persist Admin as ['streak'] and that snapshot then
     * replaced CONFIG.USERS on every load — that is why Digital Marketing vanished.
     */
    function withFileWorkspaceAccess(users) {
        const fileUsers = CONFIG.USERS || [];
        return (users || []).map(su => {
            const fu = fileUsers.find(u => u.id === su.id);
            if (!fu) return su;
            return Object.assign({}, su, { workspaces: fu.workspaces });
        });
    }

    function migrateStaleWorkspaceAccess() {
        const stored = loadRbacConfig();
        if (!stored || !Array.isArray(stored.users)) return;
        const users = withFileWorkspaceAccess(stored.users);
        const changed = JSON.stringify(users.map(u => [u.id, u.workspaces]))
            !== JSON.stringify(stored.users.map(u => [u.id, u.workspaces]));
        if (changed) saveRbacConfig(Object.assign({}, stored, { users }));
    }

    migrateStaleWorkspaceAccess();

    /** Merged live config: Settings may overlay name/pin; workspace access always comes from config.js. */
    function liveConfig() {
        const stored = loadRbacConfig();
        const fileUsers = CONFIG.USERS || [];
        const fileRoles = CONFIG.ROLES || {};
        if (!stored || !stored.users) {
            return { users: fileUsers, roles: stored && stored.roles ? stored.roles : fileRoles };
        }
        const storedById = new Map(stored.users.map(u => [u.id, u]));
        const fileIds = new Set(fileUsers.map(u => u.id));
        const users = fileUsers.map(fu => {
            const su = storedById.get(fu.id);
            if (!su) return fu;
            return Object.assign({}, fu, su, { id: fu.id, role: fu.role, workspaces: fu.workspaces });
        });
        stored.users.forEach(su => {
            if (su && su.id && !fileIds.has(su.id)) users.push(su);
        });
        return {
            users,
            roles: stored.roles || fileRoles,
        };
    }

    // ── Public API ───────────────────────────────────
    return {

        /** Returns the logged-in user object (id, name, displayName, role) or null */
        get currentUser() {
            return loadSession();
        },

        userDisplayName,

        /** Returns true if a valid session exists */
        isLoggedIn() {
            if (!CONFIG.RBAC_ENABLED) return true;
            return loadSession() !== null;
        },

        /**
         * Attempt login. Returns { ok: true } on success or { ok: false, error: string }.
         * @param {string} userId - user id from CONFIG.USERS or localStorage override
         * @param {string} pin    - entered PIN
         */
        login(userId, pin) {
            const { users } = liveConfig();
            const user = users.find(u => u.id === userId);
            if (!user) return { ok: false, error: 'User not found.' };
            if (String(user.pin) !== String(pin).trim()) return { ok: false, error: 'Incorrect PIN.' };
            saveSession(user);
            return { ok: true, user };
        },

        /** Clear the session and show the login screen */
        logout() {
            clearSession();
            this.showLoginScreen();
        },

        // ── RBAC live config access ───────────────────

        /** Returns the merged live users list */
        getUsers() { return liveConfig().users; },

        /** Returns the merged live roles map */
        getRoles() { return liveConfig().roles; },

        /** Save updated users + roles back to localStorage */
        saveSettings(users, roles) {
            saveRbacConfig({ users: withFileWorkspaceAccess(users), roles });
            refreshSessionFromLiveConfig();
        },

        /** Refresh login identity cards from latest saved users */
        refreshLoginIdentityGrid() {
            this._lpBuildIdentityGrid();
        },

        /** Reset to CONFIG defaults (clears localStorage override) */
        resetSettings() {
            localStorage.removeItem(RBAC_KEY);
        },

        // ── RBAC checks ──────────────────────────────

        /** Returns the role config for the current user */
        _roleConfig() {
            const u = loadSession();
            if (!u) return null;
            return liveConfig().roles[u.role] || null;
        },

        /**
         * Returns true if the current user can access the given sidebar view.
         * @param {string} viewId - e.g. 'overview', 'analytics'
         */
        canAccessView(viewId) {
            if (!CONFIG.RBAC_ENABLED) return true;
            if (viewId === 'help') return true;
            const rc = this._roleConfig();
            if (!rc) return false;
            if (rc.views === '*') return true;
            return Array.isArray(rc.views) && rc.views.includes(viewId);
        },

        /**
         * Returns true if the current user can access the given workspace.
         * @param {string} workspaceId - e.g. 'streak', 'akeneo'
         */
        canAccessWorkspace(workspaceId) {
            if (!CONFIG.RBAC_ENABLED) return true;
            const u = loadSession();
            if (!u) return false;
            const { users } = liveConfig();
            const userDef = users.find(x => x.id === u.id);
            if (!userDef) return false;
            if (userDef.workspaces === '*') return true;
            return Array.isArray(userDef.workspaces) && userDef.workspaces.includes(workspaceId);
        },

        /**
         * Returns true if the current user can perform the given action.
         * @param {string} action - e.g. 'export', 'refresh', 'switchWorkspace', 'theme'
         */
        canPerformAction(action) {
            if (!CONFIG.RBAC_ENABLED) return true;
            const rc = this._roleConfig();
            if (!rc) return false;
            if (rc.actions === '*') return true;
            return Array.isArray(rc.actions) && rc.actions.includes(action);
        },

        /** Returns list of workspace ids the current user can access */
        allowedWorkspaceIds() {
            const all = (CONFIG.WORKSPACES || []).map(w => w.id);
            if (!CONFIG.RBAC_ENABLED) return all;
            const u = loadSession();
            if (!u) return [];
            const { users } = liveConfig();
            const userDef = users.find(x => x.id === u.id);
            if (!userDef) return [];
            if (userDef.role === 'admin' || userDef.workspaces === '*') return all;
            const fileUser = (CONFIG.USERS || []).find(x => x.id === userDef.id);
            if (fileUser && (fileUser.workspaces === '*' || fileUser.role === 'admin')) return all;
            return Array.isArray(userDef.workspaces) ? userDef.workspaces : [];
        },

        // ── Login UI (v2 split-panel) ─────────────────────────────

        /** Private state for the login panel */
        _lpSelectedUserId: '',
        _lpSelectedWsId:   '',
        _lpClockTimer:     null,
        _lpPinsVisible:    false,

        /** Deterministic colour for an id string */
        _lpColor(id) {
            const user = (this.getUsers() || []).find(u => u.id === id);
            if (user && user.avatarColor) return user.avatarColor;
            const ws = (CONFIG.WORKSPACES || []).find(w => w.id === id);
            if (ws && ws.color) return ws.color;
            const wsColors = { akeneo: '#8B5CF6', zyric: '#0EA5E9', streak: '#EF4444', nexus: '#F59E0B' };
            if (wsColors[id]) return wsColors[id];
            const palette = ['#6366F1','#8B5CF6','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444','#14B8A6'];
            let h = 0;
            for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xFFFF;
            return palette[h % palette.length];
        },

        _lpWsLabel(ws) {
            return ws.displayName || (ws.name + ' Dashboard');
        },

        showLoginScreen() {
            const overlay = document.getElementById('login-overlay');
            if (!overlay) return;
            overlay.style.display = 'flex';
            document.body.classList.add('atlas-login-open');

            // Clear error + re-enable submit (may stay disabled after successful login)
            const errEl = document.getElementById('login-error');
            const btnEl = document.getElementById('login-btn');
            if (errEl) errEl.textContent = '';
            if (btnEl) btnEl.disabled = false;

            // Reset PIN boxes
            document.querySelectorAll('.lp-pin-box').forEach(b => { b.value = ''; b.classList.remove('lp-pin-filled'); });

            // Restore or reset identity selection
            let remembered = localStorage.getItem('atlas_remember_user') || '';
            if (!remembered && typeof CONFIG !== 'undefined' && CONFIG.LOGIN_DEFAULT_USER) {
                remembered = CONFIG.LOGIN_DEFAULT_USER;
            }
            this._lpSelectedUserId = remembered;
            document.querySelectorAll('.lp-identity-card').forEach(card => {
                const isSelected = card.dataset.userId === remembered;
                card.classList.toggle('lp-identity-card--selected', isSelected);
                const chk = card.querySelector('.lp-identity-check');
                if (chk) chk.style.display = isSelected ? 'flex' : 'none';
            });

            // Focus first card or PIN
            setTimeout(() => {
                if (remembered) {
                    const firstBox = document.querySelector('.lp-pin-box');
                    if (firstBox) firstBox.focus();
                } else {
                    const firstCard = document.querySelector('.lp-identity-card');
                    if (firstCard) firstCard.focus();
                }
            }, 80);

            // Start live clock
            this._lpStartClock();

            // Login screen workspace default (design: Akeneo Dashboard)
            if (typeof CONFIG !== 'undefined' && CONFIG.LOGIN_DEFAULT_WORKSPACE) {
                this._lpSelectedWsId = CONFIG.LOGIN_DEFAULT_WORKSPACE;
                this._lpBuildWsPicker();
            }

            // Populate left panel stats from live sheet (not RBAC user count)
            this._lpFetchLoginStats();
        },

        hideLoginScreen() {
            const overlay = document.getElementById('login-overlay');
            if (overlay) overlay.style.display = 'none';
            document.body.classList.remove('atlas-login-open');
            if (this._lpClockTimer) { clearInterval(this._lpClockTimer); this._lpClockTimer = null; }
        },

        /** Called by the login form submit button */
        submitLogin() {
            const errEl = document.getElementById('login-error');
            const btnEl = document.getElementById('login-btn');
            const userId = (this._lpSelectedUserId || '').trim();

            // Assemble PIN from individual boxes
            const boxes = document.querySelectorAll('.lp-pin-box');
            const pin   = Array.from(boxes).map(b => b.value).join('').trim();

            if (!userId) {
                if (errEl) errEl.textContent = 'Please choose your identity.';
                return;
            }
            if (!pin) {
                if (errEl) errEl.textContent = 'Please enter your PIN.';
                if (boxes[0]) boxes[0].focus();
                return;
            }

            if (btnEl) btnEl.disabled = true;
            if (errEl) errEl.textContent = '';

            const result = this.login(userId, pin);

            if (result.ok) {
                // Persist "remember" selection
                const remChk = document.getElementById('login-remember');
                if (remChk && remChk.checked) {
                    localStorage.setItem('atlas_remember_user', userId);
                } else {
                    localStorage.removeItem('atlas_remember_user');
                }
                // Apply selected workspace preference
                if (this._lpSelectedWsId) {
                    AppState.setWorkspace(this._lpSelectedWsId);
                }
                this.hideLoginScreen();
                App.bootAsUser(result.user);
            } else {
                if (errEl) errEl.textContent = result.error;
                // Shake effect + clear boxes
                boxes.forEach(b => { b.value = ''; b.classList.remove('lp-pin-filled'); });
                if (boxes[0]) boxes[0].focus();
                if (btnEl) btnEl.disabled = false;
            }
        },

        /** Build the full v2 login form — identity cards, PIN boxes, workspace picker, clock */
        buildLoginForm() {
            this._applyLoginBackground();
            this._lpBuildIdentityGrid();
            this._lpBuildWsPicker();
            this._lpSetupPinBoxes();
            this._lpSetupPinToggle();
            this._lpStartClock();
            this._lpFetchLoginStats();

            // Pre-check remember checkbox
            const remembered = localStorage.getItem('atlas_remember_user') || '';
            const remChk = document.getElementById('login-remember');
            if (remChk) remChk.checked = !!remembered;
        },

        /** Apply login background from CONFIG.LOGIN_BACKGROUND */
        _applyLoginBackground() {
            const rel = (typeof CONFIG !== 'undefined' && CONFIG.LOGIN_BACKGROUND)
                ? CONFIG.LOGIN_BACKGROUND
                : 'assets/backgrounds/login-default.png';
            const url = new URL(rel, window.location.href).href;
            const bgEl = document.getElementById('login-bg');
            if (bgEl) bgEl.src = url;
        },

        _lpBuildIdentityGrid() {
            const grid = document.getElementById('login-identity-grid');
            if (!grid) return;
            const users = this.getUsers();
            let remembered = localStorage.getItem('atlas_remember_user') || '';
            if (remembered && !users.some(u => u.id === remembered)) {
                localStorage.removeItem('atlas_remember_user');
                remembered = '';
            }
            if (!remembered && typeof CONFIG !== 'undefined' && CONFIG.LOGIN_DEFAULT_USER) {
                remembered = CONFIG.LOGIN_DEFAULT_USER;
            }
            this._lpSelectedUserId = remembered;

            const chkSvg = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
            const esc = (typeof escapeHtml === 'function') ? escapeHtml : (s => String(s));

            grid.innerHTML = users.map(u => {
                const label = userDisplayName(u);
                const initials = label.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                const color = u.avatarColor || this._lpColor(u.id);
                const isSelected = u.id === remembered;
                const roleLabel = u.roleLabel || ((u.role || '').charAt(0).toUpperCase() + (u.role || '').slice(1));

                return `<div class="lp-identity-card${isSelected ? ' lp-identity-card--selected' : ''}"
                             data-user-id="${esc(u.id)}"
                             tabindex="0"
                             onclick="Auth._lpSelectIdentity(this)"
                             onkeydown="Auth._lpIdentityKeydown(event, this)">
                    <div class="lp-identity-check" style="display:${isSelected ? 'flex' : 'none'}">${chkSvg}</div>
                    <div class="lp-identity-avatar" style="background:${color}">${esc(initials)}</div>
                    <div class="lp-identity-body">
                        <div class="lp-identity-name">${esc(label)}</div>
                        <div class="lp-identity-role">${esc(roleLabel)}</div>
                    </div>
                </div>`;
            }).join('');
        },

        _lpIdentityKeydown(e, cardEl) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this._lpSelectIdentity(cardEl);
            }
        },

        _lpSelectIdentity(cardEl) {
            const chkSvg = `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
            document.querySelectorAll('.lp-identity-card').forEach(c => {
                c.classList.remove('lp-identity-card--selected');
                const chk = c.querySelector('.lp-identity-check');
                if (chk) chk.style.display = 'none';
            });
            cardEl.classList.add('lp-identity-card--selected');
            let chk = cardEl.querySelector('.lp-identity-check');
            if (!chk) {
                chk = document.createElement('div');
                chk.className = 'lp-identity-check';
                chk.innerHTML = chkSvg;
                cardEl.prepend(chk);
            }
            chk.style.display = 'flex';
            Auth._lpSelectedUserId = cardEl.dataset.userId || '';

            if (typeof featureOn === 'function' && featureOn('LOGIN_WS_FILTER_BY_USER')) {
                Auth._lpBuildWsPicker();
            }

            // Advance focus to first PIN box
            const firstBox = document.querySelector('.lp-pin-box');
            if (firstBox) setTimeout(() => firstBox.focus(), 50);

            // Clear error
            const errEl = document.getElementById('login-error');
            if (errEl) errEl.textContent = '';
        },

        _lpLoginWorkspaces() {
            const all = CONFIG.WORKSPACES || [];
            if (typeof featureOn !== 'function' || !featureOn('LOGIN_WS_FILTER_BY_USER')) return all;
            const userId = Auth._lpSelectedUserId;
            const users = typeof Auth.getUsers === 'function' ? Auth.getUsers() : (CONFIG.USERS || []);
            const user = users.find(u => u.id === userId);
            if (!user || user.workspaces === '*') return all;
            const allowed = Array.isArray(user.workspaces) ? user.workspaces : [];
            const filtered = all.filter(w => allowed.includes(w.id));
            return filtered.length ? filtered : all;
        },

        _lpBuildWsPicker() {
            const wrap = document.getElementById('login-ws-picker');
            if (!wrap) return;

            const workspaces = Auth._lpLoginWorkspaces();
            if (!workspaces.length) return;

            let activeId = Auth._lpSelectedWsId
                || (typeof CONFIG !== 'undefined' && CONFIG.LOGIN_DEFAULT_WORKSPACE)
                || AppState.activeWorkspaceId
                || CONFIG.DEFAULT_WORKSPACE
                || workspaces[0].id;
            if (!workspaces.some(w => w.id === activeId)) {
                activeId = workspaces[0].id;
            }
            this._lpSelectedWsId = activeId;

            const chevron = `<svg class="lp-ws-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`;
            const chkSvg  = `<svg class="lp-ws-menu-chk" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
            const wsDesc  = (typeof featureOn === 'function' && featureOn('LOGIN_WS_SUBTITLE_FIX')) ? 'Workspace' : 'Primary workspace';

            const renderPicker = (activeWs) => {
                const color = Auth._lpColor(activeWs.id);
                const itemsHtml = workspaces.map(ws => `
                    <div class="lp-ws-menu-item${ws.id === activeWs.id ? ' lp-ws-menu-item--active' : ''}"
                         onclick="Auth._lpPickWs(${JSON.stringify(ws.id)})">
                        <div class="lp-ws-icon" style="background:${Auth._lpColor(ws.id)}">${ws.name[0]}</div>
                        <div class="lp-ws-info">
                            <div class="lp-ws-name">${Auth._lpWsLabel(ws)}</div>
                        </div>
                        ${ws.id === activeWs.id ? chkSvg : ''}
                    </div>`).join('');

                wrap.innerHTML = `
                    <div class="lp-ws-picker" onclick="Auth._lpToggleWsMenu()" id="lp-ws-trigger">
                        <div class="lp-ws-icon" style="background:${color}">${activeWs.name[0]}</div>
                        <div class="lp-ws-info">
                            <div class="lp-ws-name">${Auth._lpWsLabel(activeWs)}</div>
                            <div class="lp-ws-desc">${wsDesc}</div>
                        </div>
                        ${chevron}
                    </div>`;
                wrap._itemsHtml = itemsHtml;
            };

            const active = workspaces.find(w => w.id === activeId) || workspaces[0];
            renderPicker(active);
        },

        _lpToggleWsMenu() {
            const wrap    = document.getElementById('login-ws-picker');
            const trigger = document.getElementById('lp-ws-trigger');
            if (!wrap || !trigger) return;

            const existing = wrap.querySelector('.lp-ws-menu');
            if (existing) {
                existing.remove();
                trigger.classList.remove('lp-ws-picker--open');
                return;
            }
            const menu = document.createElement('div');
            menu.className = 'lp-ws-menu';
            menu.innerHTML = wrap._itemsHtml || '';
            wrap.appendChild(menu);
            trigger.classList.add('lp-ws-picker--open');

            setTimeout(() => {
                document.addEventListener('click', function handler(e) {
                    if (!wrap.contains(e.target)) {
                        menu.remove();
                        trigger.classList.remove('lp-ws-picker--open');
                        document.removeEventListener('click', handler);
                    }
                });
            }, 0);
        },

        _lpPickWs(wsId) {
            Auth._lpSelectedWsId = wsId;
            const ws = (CONFIG.WORKSPACES || []).find(w => w.id === wsId);
            if (ws) Auth._lpBuildWsPicker();
            this._lpFetchLoginStats();
        },

        /** Sheet URL for login stat preview (selected workspace, else first connected workspace) */
        _lpStatsSheetUrl() {
            const wsId = this._lpSelectedWsId
                || (typeof CONFIG !== 'undefined' && CONFIG.LOGIN_DEFAULT_WORKSPACE)
                || (typeof CONFIG !== 'undefined' && CONFIG.DEFAULT_WORKSPACE);
            const ws = (CONFIG.WORKSPACES || []).find(w => w.id === wsId);
            if (ws && (ws.sheetUrl || '').trim()) return ws.sheetUrl.trim();
            const fallback = (CONFIG.WORKSPACES || []).find(w => (w.sheetUrl || '').trim());
            if (fallback) return fallback.sheetUrl.trim();
            return (CONFIG.SHEET_CSV_URL || '').trim();
        },

        _lpCountActiveProjects(projects) {
            return (projects || []).filter(p => p.stage && p.stage !== 'Live').length;
        },

        /** Unique people on projects (matches dashboard team view, not RBAC login users) */
        _lpCountTeamMembers(projects) {
            const people = new Set();
            (projects || []).forEach(p => {
                ['owner', 'developer', 'qa_engineer', 'ba', 'page_owner'].forEach(key => {
                    const name = (p[key] || '').trim();
                    if (name) people.add(name.toLowerCase());
                });
            });
            return people.size;
        },

        invalidateLoginStatsCache() {
            this._lpStatsCache = null;
        },

        async _lpFetchLoginStats() {
            const projEl = document.getElementById('login-stat-projects');
            const usrEl  = document.getElementById('login-stat-users');
            if (!projEl && !usrEl) return;

            if (projEl) projEl.textContent = '…';
            if (usrEl)  usrEl.textContent  = '…';

            const url = this._lpStatsSheetUrl();
            if (!url || typeof loadProjects !== 'function') {
                this._lpStatsCache = {
                    activeProjects: 0,
                    teamMembers:    (this.getUsers() || []).length,
                };
                this._lpUpdateStats();
                return;
            }

            try {
                const { projects } = await loadProjects(url);
                this._lpStatsCache = {
                    activeProjects: this._lpCountActiveProjects(projects),
                    teamMembers:    this._lpCountTeamMembers(projects),
                };
            } catch (e) {
                console.warn('[Atlas] Login stats fetch failed:', e);
                this._lpStatsCache = null;
            }
            this._lpUpdateStats();
        },

        _lpSetupPinBoxes() {
            if (Auth._lpPinSetup) return;
            Auth._lpPinSetup = true;

            const boxes = document.querySelectorAll('.lp-pin-box');
            boxes.forEach((box, i) => {
                box.addEventListener('input', e => {
                    const val = e.target.value.replace(/\D/g, '');
                    e.target.value = val ? val[val.length - 1] : '';
                    e.target.classList.toggle('lp-pin-filled', !!e.target.value);

                    if (e.target.value && i < boxes.length - 1) boxes[i + 1].focus();

                    // Auto-submit if all filled
                    const allFilled = Array.from(boxes).every(b => b.value);
                    if (allFilled) setTimeout(() => Auth.submitLogin(), 60);
                });

                box.addEventListener('keydown', e => {
                    if (e.key === 'Backspace' && !e.target.value && i > 0) {
                        boxes[i - 1].value = '';
                        boxes[i - 1].classList.remove('lp-pin-filled');
                        boxes[i - 1].focus();
                    }
                    if (e.key === 'Enter') Auth.submitLogin();
                });

                box.addEventListener('paste', e => {
                    e.preventDefault();
                    const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
                    boxes.forEach((b, j) => {
                        b.value = pasted[j] || '';
                        b.classList.toggle('lp-pin-filled', !!b.value);
                    });
                    const last = Math.min(pasted.length, boxes.length) - 1;
                    if (boxes[last]) boxes[last].focus();
                });
            });
        },

        _lpSetupPinToggle() {
            if (Auth._lpToggleSetup) return;
            Auth._lpToggleSetup = true;

            const toggleBtn = document.getElementById('pin-toggle-btn');
            if (!toggleBtn) return;

            toggleBtn.addEventListener('click', () => {
                Auth._lpPinsVisible = !Auth._lpPinsVisible;
                const type = Auth._lpPinsVisible ? 'text' : 'password';
                document.querySelectorAll('.lp-pin-box').forEach(b => b.type = type);
                toggleBtn.innerHTML = Auth._lpPinsVisible
                    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
                    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
            });
        },

        _lpStartClock() {
            if (this._lpClockTimer) { clearInterval(this._lpClockTimer); this._lpClockTimer = null; }
            const tick = () => {
                const el = document.getElementById('login-clock');
                if (!el) return;
                const now = new Date();
                const h   = now.getHours() % 12 || 12;
                const m   = String(now.getMinutes()).padStart(2, '0');
                const a   = now.getHours() >= 12 ? 'PM' : 'AM';
                el.textContent = `${h}:${m} ${a}`;
            };
            tick();
            this._lpClockTimer = setInterval(tick, 1000);
        },

        _lpUpdateStats() {
            const projEl = document.getElementById('login-stat-projects');
            const usrEl  = document.getElementById('login-stat-users');
            const cache  = this._lpStatsCache;

            if (projEl) {
                if (cache != null) projEl.textContent = cache.activeProjects;
                else if (typeof AppState !== 'undefined' && AppState.allProjects?.length) {
                    projEl.textContent = this._lpCountActiveProjects(AppState.allProjects);
                } else projEl.textContent = '—';
            }
            if (usrEl) {
                if (cache != null) usrEl.textContent = cache.teamMembers;
                else if (typeof AppState !== 'undefined' && AppState.allProjects?.length) {
                    usrEl.textContent = this._lpCountTeamMembers(AppState.allProjects);
                } else usrEl.textContent = '—';
            }
        },

        _showForgotPin() {
            const errEl = document.getElementById('login-error');
            if (errEl) errEl.textContent = 'Contact your admin to reset your PIN.';
        },
    };
})();
