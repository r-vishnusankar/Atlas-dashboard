/**
 * Atlas ↔ Resource Tracker API bridge (full Phase 0–5 client).
 * Graceful degrade: if API is down, sheet Manager view keeps working.
 */
const ResourceApi = (() => {
    function cfg() {
        return (typeof CONFIG !== 'undefined' && CONFIG.RESOURCE_API) || {};
    }

    function enabled() {
        const c = cfg();
        if (c.ENABLED === false) return false;
        if (typeof featureOn === 'function' && !featureOn('RESOURCE_TRACKER')) return false;
        return !!(c.BASE_URL || '').trim();
    }

    function baseUrl() {
        return String(cfg().BASE_URL || '').replace(/\/$/, '');
    }

    /** Normalize path: BASE /api/resource + /api/health → /api/resource/health */
    function joinUrl(path) {
        const base = baseUrl();
        let p = String(path || '');
        if (!p.startsWith('/')) p = '/' + p;
        if (base.endsWith('/api/resource') || base.endsWith('/api/resource/')) {
            if (p.startsWith('/api/')) p = p.slice(4); // drop leading /api
        }
        return `${base}${p}`;
    }

    function headers(json = true) {
        const h = {};
        if (json) h['Content-Type'] = 'application/json';
        const token = (cfg().TOKEN || '').trim();
        if (token) h['X-Resource-Token'] = token;
        return h;
    }

    function formatError(err) {
        if (err == null) return 'error';
        if (typeof err === 'string') return err;
        if (err.detail) {
            if (typeof err.detail === 'string') return err.detail;
            if (err.detail.message) return err.detail.message + (err.detail.warnings ? ` (${err.detail.warnings.join('; ')})` : '');
            try { return JSON.stringify(err.detail); } catch (_) { /* */ }
        }
        if (err.message) return err.message;
        try { return JSON.stringify(err); } catch (_) { return String(err); }
    }

    async function request(path, opts = {}) {
        if (!enabled()) return { ok: false, skipped: true };
        const url = joinUrl(path);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), cfg().TIMEOUT_MS || 12000);
        try {
            const method = (opts.method || 'GET').toUpperCase();
            const res = await fetch(url, {
                ...opts,
                headers: { ...headers(method !== 'GET' && !(opts.body instanceof FormData)), ...(opts.headers || {}) },
                signal: controller.signal,
            });
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('text/csv')) {
                const blob = await res.blob();
                if (!res.ok) return { ok: false, status: res.status, error: res.statusText };
                return { ok: true, status: res.status, blob, filename: _filenameFromCd(res.headers.get('content-disposition')) };
            }
            const text = await res.text();
            let data = null;
            try { data = text ? JSON.parse(text) : null; } catch (_) { data = { raw: text }; }
            if (!res.ok) {
                return { ok: false, status: res.status, error: formatError(data) || res.statusText, data };
            }
            return { ok: true, status: res.status, data };
        } catch (e) {
            return { ok: false, error: e.name === 'AbortError' ? 'timeout' : (e.message || 'network error') };
        } finally {
            clearTimeout(timeout);
        }
    }

    function _filenameFromCd(cd) {
        if (!cd) return 'report.csv';
        const m = /filename=\"?([^\";]+)\"?/i.exec(cd);
        return m ? m[1] : 'report.csv';
    }

    async function health() { return request('/api/health'); }

    async function syncProjects(workspaceId, projects) {
        const payload = {
            workspace_id: workspaceId || 'default',
            projects: (projects || []).map(p => ({
                external_id: String(p.id || p.project_id || ''),
                name: p.name || 'Untitled',
                client: p.client || null,
                stage: p.stage || null,
                status: p.status || null,
                priority: p.priority || null,
                release_date: p.release_date || p.releaseDate || null,
            })).filter(p => p.external_id),
        };
        return request('/api/sync/projects', { method: 'POST', body: JSON.stringify(payload) });
    }

    async function importEmployees(employees, workspaceId) {
        const payload = {
            upsert_by: 'name',
            employees: (employees || []).map(e => ({
                employee_code: e.employeeCode || e.employee_code || null,
                full_name: e.name || e.full_name,
                department: e.department || null,
                designation: e.designation || null,
                role_family: e.roleFamily || e.role_family || null,
                years_at_company: e.yearsAtCompany ?? e.years_at_company ?? null,
                external_experience: e.externalExperience ?? e.external_experience ?? null,
                years_experience: e.totalExperience ?? e.years_experience ?? null,
                workspace_ids: workspaceId ? [workspaceId] : null,
            })).filter(e => e.full_name),
        };
        return request('/api/employees/import', { method: 'POST', body: JSON.stringify(payload) });
    }

    async function dashboard() { return request('/api/dashboard/resources'); }

    async function listEmployees(params = {}) {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') q.set(k, v); });
        const qs = q.toString();
        return request(`/api/employees${qs ? `?${qs}` : ''}`);
    }

    async function getEmployee(id) { return request(`/api/employees/${encodeURIComponent(id)}`); }

    async function patchEmployee(id, body) {
        return request(`/api/employees/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) });
    }

    async function deleteEmployee(id, { hard = true } = {}) {
        const q = hard ? 'hard=true' : 'hard=false';
        return request(`/api/employees/${encodeURIComponent(id)}?${q}`, { method: 'DELETE' });
    }

    async function listAllocations(params = {}) {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') q.set(k, v); });
        const qs = q.toString();
        return request(`/api/allocations${qs ? `?${qs}` : ''}`);
    }

    async function createAllocation(body) {
        return request('/api/allocations', { method: 'POST', body: JSON.stringify(body) });
    }

    async function updateAllocation(id, body) {
        return request(`/api/allocations/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) });
    }

    async function releaseAllocation(id, actor, reason) {
        const q = new URLSearchParams();
        if (actor) q.set('actor', actor);
        if (reason) q.set('reason', reason);
        const qs = q.toString();
        return request(`/api/allocations/${encodeURIComponent(id)}/release${qs ? `?${qs}` : ''}`, { method: 'POST' });
    }

    async function allocationHistory(employeeId) {
        return request(`/api/allocations/history/${encodeURIComponent(employeeId)}`);
    }

    function buildAttentionMap(projects, attentionRanked) {
        const map = {};
        (projects || []).forEach(p => {
            const id = String(p.id || '');
            if (!id) return;
            map[id] = {
                overdue: !!(p.alerts && p.alerts.overdue),
                attention_tier: p.attentionTier || null,
                attention_score: p.attentionScore || 0,
                status: p.status,
                stage: p.stage,
            };
        });
        (attentionRanked || []).forEach(p => {
            const id = String(p.id || '');
            if (!id) return;
            map[id] = {
                ...(map[id] || {}),
                attention_tier: p.attentionTier || map[id]?.attention_tier,
                attention_score: p.attentionScore || map[id]?.attention_score || 0,
                overdue: !!(p.alerts && p.alerts.overdue) || map[id]?.overdue,
            };
        });
        return map;
    }

    async function recommendationsFor(employeeId, opts = {}) {
        const body = {
            attention: opts.attention || {},
            workspace_id: opts.workspaceId || null,
            limit: opts.limit || 5,
        };
        return request(`/api/recommendations/available/${encodeURIComponent(employeeId)}`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async function recommendationsBench(opts = {}) {
        return request('/api/recommendations/bench', {
            method: 'POST',
            body: JSON.stringify({
                attention: opts.attention || {},
                workspace_id: opts.workspaceId || null,
                limit: opts.limit || 5,
            }),
        });
    }

    async function runDailyJobs(workspaceId, attention = null) {
        const q = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : '';
        return request(`/api/jobs/run-daily${q}`, {
            method: 'POST',
            body: JSON.stringify({
                attention: attention || {},
                workspace_id: workspaceId || null,
            }),
        });
    }

    async function getNotifySettings() {
        return request('/api/settings/notifications');
    }

    async function saveNotifySettings(body) {
        return request('/api/settings/notifications', {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    async function downloadReport(type, params = {}) {
        const q = new URLSearchParams({ format: 'csv', ...params });
        const res = await request(`/api/reports/${type}?${q}`);
        if (!res.ok || !res.blob) return res;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(res.blob);
        a.download = res.filename || `${type}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
        return { ok: true };
    }

    async function utilTrend(days = 90) {
        return request(`/api/reports/util-trend?days=${days}`);
    }

    async function demandForecast(workspaceId) {
        const q = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : '';
        return request(`/api/reports/demand-forecast${q}`);
    }

    async function createLeave(body) {
        return request('/api/leave', { method: 'POST', body: JSON.stringify(body) });
    }

    async function listLeave(employeeId) {
        const q = employeeId ? `?employee_id=${encodeURIComponent(employeeId)}` : '';
        return request(`/api/leave${q}`);
    }

    async function listProjects(params = {}) {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v != null && v !== '') q.set(k, String(v));
        });
        const qs = q.toString();
        return request(`/api/projects${qs ? `?${qs}` : ''}`);
    }

    async function createProject(body) {
        return request('/api/projects', { method: 'POST', body: JSON.stringify(body) });
    }

    async function updateProject(id, body) {
        return request(`/api/projects/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) });
    }

    async function deleteProject(id) {
        return request(`/api/projects/${encodeURIComponent(id)}?release_allocations=true`, { method: 'DELETE' });
    }

    return {
        enabled, health, syncProjects, importEmployees, dashboard,
        listEmployees, getEmployee, patchEmployee, deleteEmployee,
        listAllocations, createAllocation, updateAllocation, releaseAllocation, allocationHistory,
        listProjects, createProject, updateProject, deleteProject,
        buildAttentionMap, recommendationsFor, recommendationsBench,
        runDailyJobs, getNotifySettings, saveNotifySettings, downloadReport, utilTrend, demandForecast,
        createLeave, listLeave, request, formatError,
    };
})();
