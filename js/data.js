/**
 * STRESK DASHBOARD — Data layer (live Google Sheet CSV)
 */

/* ──────────────────────────────────────────
   Sparkline: last 6 calendar months, count of go-lives (actual_live_date)
────────────────────────────────────────── */
function buildSparklineFromLiveLaunches(projects) {
    const now = new Date();
    const pts = [];
    for (let m = 5; m >= 0; m--) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const y = d.getFullYear();
        const mo = d.getMonth();
        const n = projects.filter(p => {
            if (!p.actual_live_date) return false;
            const a = parseSmartDate(p.actual_live_date);
            if (isNaN(a.getTime())) return false;
            return a.getFullYear() === y && a.getMonth() === mo;
        }).length;
        pts.push(n);
    }
    return pts;
}

/* ──────────────────────────────────────────
   CSV HEADER MAPPING (tolerates extra columns, header names)
────────────────────────────────────────── */
function normalizeHeaderKey(h) {
    if (h == null) return null;
    const t = String(h).replace(/^\uFEFF/, '').trim();
    if (!t) return null;
    return t.toLowerCase().replace(/\s+/g, '_');
}

function headerCellToField(key) {
    if (!key) return null;
    const aliases = {
        project_id:        ['project_id', 'id'],
        project_name:      ['project_name', 'name', 'title'],
        owner:             ['owner', 'pm'],
        client:            ['page_name', 'client'],
        page_owner:        ['page_owner'],
        stage:             ['stage', 'phase'],
        status:            ['status', 'health'],
        ba:                ['ba'],
        progress:          ['progress', 'pct', 'percent', '%'],
        start_date:        ['start_date', 'start'],
        release_date:      ['release_date', 'release', 'target_date', 'target'],
        priority:          ['priority'],
        cms:               ['cms', 'stack'],
        tags:              ['tags', 'categories'],
        notes:             ['notes', 'comments'],
        developer:         ['developer', 'dev'],
        qa_engineer:       ['qa', 'qa_engineer', 'q_a'],
        total_pages:       ['total_pages', 'total_page'],
        completed_pages:   ['completed_pages', 'complete_pages', 'done_pages'],
        page_priority:     ['page_priority'],
        actual_live_date:  ['actual_live_date', 'go_live', 'live_date'],
        current_page:      ['current_page', 'current page'],
        detail_gid:        ['detail_gid', 'sibling_gid', 'tab_gid', 'project_tab_gid'],
        detail_csv_url:    ['detail_csv_url', 'sibling_csv_url', 'project_sibling_url'],
    };
    for (const [field, list] of Object.entries(aliases)) {
        if (list.includes(key)) return field;
    }
    return null;
}

function buildFieldIndexMap(headerLine) {
    const cells = parseCSVLine(headerLine);
    const map = {};
    cells.forEach((raw, i) => {
        const k = normalizeHeaderKey(raw);
        if (!k) return;
        const field = headerCellToField(k);
        if (field != null && map[field] === undefined) map[field] = i;
    });
    return map;
}

function col(cols, fieldMap, leg, key) {
    const fromMap = fieldMap[key];
    if (fromMap !== undefined && cols[fromMap] != null) return String(cols[fromMap]).trim();
    const j = leg[key];
    if (j !== undefined && cols[j] != null) return String(cols[j]).trim();
    return '';
}

/* ──────────────────────────────────────────
   CSV PARSER
────────────────────────────────────────── */

/** Split CSV text into logical lines, respecting quoted fields that span newlines (Alt+Enter in Sheets). */
function splitCSVLines(text) {
    const lines = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '"') {
            inQuotes = !inQuotes;
            current += ch;
        } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
            if (ch === '\r' && text[i + 1] === '\n') i++;
            if (current.trim()) lines.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    if (current.trim()) lines.push(current);
    return lines;
}

function parseCSV(csvText) {
    const text = String(csvText).replace(/^\uFEFF/, '').trim();
    const lines = splitCSVLines(text);
    if (lines.length < 2) return [];

    const fieldMap0 = buildFieldIndexMap(lines[0]);
    const hasHeader = fieldMap0.project_id != null || fieldMap0.project_name != null;
    const fieldMap = hasHeader ? fieldMap0 : {};
    const startRow = hasHeader ? 1 : 0;
    const leg = CONFIG.COLUMN_MAP;
    const projects = [];

    for (let i = startRow; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        const c = (key) => hasHeader ? col(cols, fieldMap, leg, key) : (cols[leg[key]] != null ? String(cols[leg[key]]).trim() : '');

        if (hasHeader) {
            if (!c('project_id') && !c('project_name')) continue;
        } else {
            if (!cols[leg.project_id] && !cols[leg.project_name]) continue;
        }

        const rawProgressStr = (c('progress') || '').trim();
        const hasManualProgress = rawProgressStr !== '';
        const raw_progress = parseInt(rawProgressStr || '0', 10);
        const project = {
            id:           c('project_id') || `PRJ-${String(i).padStart(3,'0')}`,
            name:         c('project_name') || 'Unnamed Project',
            owner:        c('owner') || 'Unassigned',
            client:       c('client') || '—',
            stage:        normalizeStage(c('stage') || 'Planning'),
            status:       normalizeStatus(c('status') || 'on_track'),
            progress:     isNaN(raw_progress) ? 0 : Math.min(100, Math.max(0, raw_progress)),
            start_date:   c('start_date') || '',
            release_date: c('release_date') || '',
            priority:     normalizePriority(c('priority') || 'Medium'),
            ba:           c('ba') || '—',
            page_owner:   c('page_owner') || '—',
            cms:          c('cms') || '—',
            developer:    c('developer') || 'Unassigned',
            qa_engineer:  c('qa_engineer') || 'Unassigned',
            total_pages:     parseInt(c('total_pages') || '0', 10) || 0,
            completed_pages: parseInt(c('completed_pages') || '0', 10) || 0,
            page_priority:   normalizePagePriority(c('page_priority') || 'P2'),
            actual_live_date: c('actual_live_date') || '',
            current_page:   c('current_page') || '',
            detail_gid:     (c('detail_gid') || '').trim(),
            detail_csv_url: (c('detail_csv_url') || '').trim(),
            tags:         (c('tags') || '').split(',').map(t => t.trim()).filter(Boolean),
            notes:        c('notes') || '',
        };

        // ── Smart Progress Logic ──
        // Priority 1: page-based when manual progress is empty
        // Priority 2: manual % from the progress column
        // Priority 3: stage-based baseline
        const manualWins = typeof featureOn === 'function' && featureOn('SMART_PROGRESS_MANUAL_WINS');
        const usePageRatio = manualWins ? !hasManualProgress : !raw_progress;
        if (project.total_pages > 0 && project.completed_pages > 0 && usePageRatio) {
            project.progress = Math.round((project.completed_pages / project.total_pages) * 100);
        } else if (manualWins ? !hasManualProgress : !raw_progress) {
            const stageMap = { 'Backlog':0, 'Planning':15, 'Development':50, 'QA':80, 'Release':95, 'Live':100 };
            project.progress = stageMap[project.stage] || 0;
        }
        // else: keep manually-entered raw_progress (explicit Project tab % wins over page ratio)

        projects.push(project);
    }
    return projects;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuotes = !inQuotes; }
        else if (ch === ',' && !inQuotes) { result.push(current.replace(/"/g,'')); current = ''; }
        else { current += ch; }
    }
    result.push(current.replace(/"/g,''));
    return result;
}

function normalizePagePriority(s) {
    const t = String(s || '').trim();
    if (/^p[0-2]$/i.test(t)) return t.charAt(0).toUpperCase() + t.charAt(1).toLowerCase();
    return t || 'P2';
}

function normalizeStage(s) {
    const raw = (s || '').trim();
    const low = raw.toLowerCase();
    const m = { 'backlog':'Backlog','not started':'Backlog','queued':'Backlog','todo':'Backlog','planning':'Planning','development':'Development','dev':'Development','qa':'QA','testing':'QA','streak_qa':'QA','streak - qa':'QA','release':'Release','staging':'Release','live':'Live','done':'Live','completed':'Live' };
    if (m[low]) return m[low];

    // Underscores in sheet values (e.g. Streak_QA) — treat like spaces for token matching
    const seg = low.replace(/_/g, ' ');

    // Composite stages (e.g. "Streak -Dev, Live", "Streak_QA", "Live -CR") — active phase wins
    const hasQa      = /\bqa\b/.test(seg) || seg.includes('testing') || /streak\s*[-–]?\s*qa/.test(seg);
    const hasDev     = !hasQa && (
        (seg.includes('streak') && (/-dev\b|\bdev\b/.test(seg) || seg.includes('development')))
        || seg.includes('development')
        || /(?:^|[,\s-])-?\s*dev\b/.test(seg)
        || /\bui\s*[-–]?\s*dev\b/.test(seg)
        || /\bstory\s*[-–]?\s*req\b/.test(seg)
    );
    const hasPlan    = seg.includes('planning') || seg.includes('backlog') || seg.includes('not started') || seg.includes('queued') || seg.includes('todo');
    const hasRelease = seg.includes('release') || seg.includes('staging');
    const hasCr      = seg.includes('-cr') || /\bcr\b/.test(seg) || seg.includes('change request');
    const hasHyper   = seg.includes('hyper');

    if (hasQa) return 'QA';
    if (hasDev) return 'Development';
    if (hasRelease) return 'Release';
    if (hasPlan) return 'Planning';
    if (hasCr || hasHyper) return 'Release';
    if (seg.includes('live')) return 'Live';
    if (seg.includes('backlog')) return 'Backlog';
    return 'Backlog';
}

/** Split a multi-name assignee field into individual trimmed names. */
function splitAssigneeNames(raw) {
    return String(raw || '').split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
}

/** Names that must not appear in the resource / availability map */
function isValidResourceName(name) {
    const n = String(name || '').trim();
    if (!n) return false;
    const low = n.toLowerCase();
    return !['unassigned', '—', '-', 'none', 'n/a', 'na', 'tbd', 'null', 'nil'].includes(low);
}

/** UI labels for resource availability (popover, cards, suggestions) */
function getResourceAvailability(person, today) {
    const t = today ? startOfDay(today) : startOfDay(new Date());
    const hasActive = person.activeCount > 0;
    const activeAssignments = (person.assignments || []).filter(a => !a.completed);

    if (!person.freeFrom) {
        if (hasActive) return { label: 'Release date TBD', chipClass: 'res-free-chip--tbd', popClass: 'res-pop-chip--tbd', status: 'unknown' };
        if (person.assignments && person.assignments.length) {
            return { label: 'Available now', chipClass: 'res-free-chip--now', popClass: 'res-pop-chip--now', status: 'now' };
        }
        return { label: 'No date set', chipClass: '', popClass: '', status: 'none' };
    }

    const ff = startOfDay(person.freeFrom);
    if (!hasActive) {
        return { label: 'Available now', chipClass: 'res-free-chip--now', popClass: 'res-pop-chip--now', status: 'now' };
    }

    if (featureOn('RESOURCE_FREE_FROM_FIX') && activeAssignments.length) {
        const allDated = activeAssignments.every(a => a.end && !isNaN(a.end.getTime()));
        const maxEndMs = allDated
            ? Math.max(...activeAssignments.map(a => startOfDay(a.end).getTime()))
            : null;
        if (maxEndMs != null && maxEndMs < t.getTime()) {
            return {
                label: `Free now · ${person.activeCount} overdue`,
                chipClass: 'res-free-chip--now',
                popClass: 'res-pop-chip--now',
                status: 'now_overdue',
            };
        }
    }

    if (ff <= t) {
        return { label: 'Available now', chipClass: 'res-free-chip--now', popClass: 'res-pop-chip--now', status: 'now' };
    }
    const days = Math.ceil((ff - t) / 86400000);
    if (days <= 14) {
        return { label: `Free in ${days}d`, chipClass: 'res-free-chip--soon', popClass: 'res-pop-chip--soon', status: 'soon', days };
    }
    const short = ff.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { label: `Free ${short}`, chipClass: '', popClass: '', status: 'future', days };
}
function normalizeStatus(s) {
    const raw = String(s || '').trim();
    if (!raw || /^status$/i.test(raw)) return 'on_track';
    const m = { 'on_track':'on_track','on track':'on_track','good':'on_track','green':'on_track','at_risk':'at_risk','at risk':'at_risk','risk':'at_risk','yellow':'at_risk','delayed':'delayed','delay':'delayed','overdue':'delayed','red':'delayed','blocked':'delayed' };
    return m[raw.toLowerCase()] || 'on_track';
}
function normalizePriority(s) {
    const m = { 'high':'High','medium':'Medium','med':'Medium','low':'Low' };
    return m[s.toLowerCase()] || 'Medium';
}

/* ──────────────────────────────────────────
   SMART ALERT ENGINE
   Computes alerts from project data — no manual flags
────────────────────────────────────────── */
function getPrioritizedAlerts(alerts, limit = 6) {
    const seen = new Set();
    const out  = [];
    for (const key of ['overdue', 'at_risk', 'stalled', 'upcoming']) {
        for (const p of alerts[key] || []) {
            if (seen.has(p.id)) continue;
            seen.add(p.id);
            out.push(p);
            if (out.length >= limit) return out;
        }
    }
    return out;
}

function alertTotalCount(alerts) {
    return getUniqueAlertProjects(alerts).length;
}

/** Primary alert bucket for a project (priority: overdue → at_risk → stalled → upcoming) */
function alertBucketFor(projectId, alerts) {
    if (!alerts || !projectId) return null;
    if (alerts.overdue.some(p => p.id === projectId)) return 'overdue';
    if (alerts.at_risk.some(p => p.id === projectId)) return 'at_risk';
    if (alerts.stalled.some(p => p.id === projectId)) return 'stalled';
    if (alerts.upcoming.some(p => p.id === projectId)) return 'upcoming';
    return null;
}

function getUniqueAlertProjects(alerts) {
    return getPrioritizedAlerts(alerts, 9999);
}

/**
 * Velocity-based completion forecast (shared by Alerts at_risk bucket and Analytics).
 * Returns null when dates/progress are insufficient to project.
 */
function computeCompletionPrediction(project, today) {
    const t = today ? startOfDay(today) : startOfDay(new Date());
    const ns = normalizeStage(project?.stage || '');
    const dispProg = projectDisplayProgress(project);
    if (ns === 'Live' || !dispProg || dispProg <= 0 || !project.start_date || !project.release_date) return null;
    const start = parseSmartDate(project.start_date);
    const target = parseSmartDate(project.release_date);
    if (!start || !target || isNaN(start.getTime()) || isNaN(target.getTime())) return null;
    const daysElapsed = Math.max(1, Math.round((t - start) / 86400000));
    const plannedDays = Math.max(1, Math.round((target - start) / 86400000));
    const totalDaysEst = Math.min(
        Math.round(daysElapsed / (dispProg / 100)),
        plannedDays + 365
    );
    const projected = new Date(start.getTime() + totalDaysEst * 86400000);
    const diffDays = Math.round((projected - target) / 86400000);
    return { diffDays, projected, target, progress: dispProg, stage: ns };
}

function computeAlerts(projects) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threshold = CONFIG.UPCOMING_DAYS_THRESHOLD ?? 7;
    const stalledPct = CONFIG.STALLED_PROGRESS_THRESHOLD ?? 30;
    const stalledDays = CONFIG.STALLED_DAYS_THRESHOLD ?? 30;
    const minSlack = CONFIG.PREDICTIVE_ALERT_MIN_SLACK_DAYS ?? 0;

    const overdue   = [];
    const at_risk   = [];
    const upcoming  = [];
    const stalled   = [];

    function already(id, list) {
        return list.some(x => x.id === id);
    }

    projects.forEach(p => {
        if (p.stage === 'Live') return;
        if (featureOn('CLICKUP_DONE_STATUS') && p.clickupComplete) return;

        const postLive = typeof projectIsPostLive === 'function' && projectIsPostLive(p, today);

        const release = p.release_date ? parseSmartDate(p.release_date) : null;
        const start   = p.start_date ? parseSmartDate(p.start_date) : null;
        const hasRelease = release && !isNaN(release.getTime());
        const daysToRelease = hasRelease ? Math.ceil((release - today) / 86400000) : null;
        const daysOld = start && !isNaN(start.getTime()) ? Math.ceil((today - start) / 86400000) : null;
        const enriched = { ...p, daysToRelease: daysToRelease ?? null };

        if (hasRelease && daysToRelease < 0) {
            if (!postLive) {
                overdue.push({ ...enriched, daysOverdue: Math.abs(daysToRelease) });
            }
        } else {
            const releaseSoon = daysToRelease !== null && daysToRelease <= threshold && daysToRelease >= 0;
            const pred = computeCompletionPrediction(p, today);
            if (pred && pred.diffDays > minSlack) {
                at_risk.push({
                    ...enriched,
                    diffDays: pred.diffDays,
                    projected: pred.projected,
                    target: pred.target,
                    predProgress: pred.progress,
                });
            } else if (releaseSoon && !postLive) {
                upcoming.push(enriched);
            }
        }

        if (projectDisplayProgress(p) < stalledPct && daysOld && daysOld > stalledDays
            && !['Planning', 'Backlog', 'Live'].includes(p.stage)
            && !already(p.id, at_risk)    // skip if already flagged as likely-miss
            && !already(p.id, overdue)    // skip if already flagged as overdue
            && !already(p.id, stalled)) {
            stalled.push({ ...enriched });
        }
    });

    return { overdue, at_risk, upcoming, stalled };
}

/* ──────────────────────────────────────────
   LIVE DATA — published Google Sheet CSV only
   Accepts an optional sheetUrl override so the workspace switcher can
   load from any workspace's sheet without touching CONFIG.
────────────────────────────────────────── */
/** Append a timestamp query param so Google/CDN returns fresh CSV on every fetch. */
function sheetFetchUrl(url) {
    const u = String(url || '').trim();
    if (!u) return u;
    try {
        const parsed = new URL(u);
        parsed.searchParams.set('_', String(Date.now()));
        return parsed.toString();
    } catch (_) {
        const sep = u.includes('?') ? '&' : '?';
        return `${u}${sep}_=${Date.now()}`;
    }
}

const SHEET_FETCH_OPTIONS = { cache: 'no-store' };

/* ──────────────────────────────────────────
   CLICKUP INTEGRATION ENGINE
   ────────────────────────────────────────── */
function clickUpListName(task) {
    const list = task?.list?.name;
    const folder = task?.folder?.name;
    return String(list || folder || '').trim();
}

/** ClickUp list status + API type → finished work (COMPLETE column, closed tasks). */
function clickUpTaskIsDone(task) {
    const statusName = String(task?.status?.status || '').trim().toLowerCase();
    const statusType = String(task?.status?.type || '').trim().toLowerCase();
    if (statusType === 'closed') return true;
    if (task?.date_closed) return true;
    const exact = ['complete', 'completed', 'done', 'closed', 'cancelled', 'canceled'];
    if (exact.includes(statusName)) return true;
    if (/\b(complete|closed|done)\b/.test(statusName) && !statusName.includes('incomplete')) return true;
    return false;
}

/** Pre-map ClickUp list statuses (TO DO / IN PROGRESS / COMPLETE) before sheet-style normalizeStage. */
function clickUpStageFromStatus(statusStr, isDone) {
    if (isDone) return 'Live';
    const low = String(statusStr || '').trim().toLowerCase();
    const map = {
        'to do': 'Backlog',
        'todo': 'Backlog',
        'open': 'Backlog',
        'in progress': 'Development',
        'in review': 'QA',
        'review': 'QA',
        'complete': 'Live',
        'completed': 'Live',
        'closed': 'Live',
        'done': 'Live',
    };
    if (map[low]) return map[low];
    return normalizeStage(statusStr || 'Planning');
}

function clickUpMaxTasks() {
    const n = parseInt(CONFIG.CLICKUP_MAX_TASKS, 10);
    return Number.isFinite(n) && n > 0 ? n : 200;
}

function clickUpPageSize() {
    const n = parseInt(CONFIG.CLICKUP_PAGE_SIZE, 10);
    return Number.isFinite(n) && n > 0 ? Math.min(n, 100) : 100;
}

function clickUpAuthHeaders(token) {
    return { Authorization: String(token || '').trim() };
}

/**
 * ClickUp returns max 100 tasks per page. Paginate until last_page or CLICKUP_MAX_TASKS.
 */
async function clickUpFetchTaskPages(urlBuilder, token, label) {
    const maxTasks = clickUpMaxTasks();
    const pageSize = clickUpPageSize();
    const seen = new Set();
    const all = [];
    let page = 0;
    let lastPage = false;

    while (!lastPage && all.length < maxTasks) {
        const url = urlBuilder(page);
        const res = await fetch(url, { headers: clickUpAuthHeaders(token), cache: 'no-store' });
        if (!res.ok) {
            return { ok: false, status: res.status, tasks: all };
        }
        const data = await res.json();
        const batch = Array.isArray(data?.tasks) ? data.tasks : [];
        batch.forEach(task => {
            const id = task?.id;
            if (id != null && seen.has(id)) return;
            if (id != null) seen.add(id);
            if (all.length < maxTasks) all.push(task);
        });
        lastPage = data?.last_page === true || batch.length < pageSize;
        if (!batch.length) break;
        page += 1;
    }

    if (all.length >= maxTasks && !lastPage) {
        console.log(`[Atlas] ClickUp ${label}: capped at ${maxTasks} tasks (raise CLICKUP_MAX_TASKS in config.js for more).`);
    }
    return { ok: true, tasks: all, pages: page + 1 };
}

async function loadClickUpTasks(listId, token) {
    if (!listId || listId === 'clickup_mock' || !token) {
        console.log('[Atlas] Utilizing ClickUp mock data fallback.');
        return getClickUpMockData();
    }
    const auth = token.trim();
    const baseQs = 'subtasks=true&include_closed=true';
    try {
        const listResult = await clickUpFetchTaskPages(
            (page) => `https://api.clickup.com/api/v2/list/${listId}/task?${baseQs}&page=${page}`,
            auth,
            `list ${listId}`
        );
        if (listResult.ok && listResult.tasks.length) {
            console.log(`[Atlas] ClickUp list: ${listResult.tasks.length} tasks (${listResult.pages} page(s))`);
            return listResult.tasks;
        }

        console.log(`[Atlas] ClickUp list fetch empty or failed (${listResult.status || 'n/a'}). Attempting Space fetch for ID: ${listId}...`);

        const teamResponse = await fetch('https://api.clickup.com/api/v2/team', {
            headers: clickUpAuthHeaders(auth),
            cache: 'no-store',
        });
        if (!teamResponse.ok) {
            throw new Error(`Failed to fetch authorized ClickUp teams: HTTP ${teamResponse.status}`);
        }
        const teamData = await teamResponse.json();
        if (!teamData.teams || teamData.teams.length === 0) {
            throw new Error('No authorized teams found for ClickUp token.');
        }
        const teamId = teamData.teams[0].id;

        const spaceResult = await clickUpFetchTaskPages(
            (page) => `https://api.clickup.com/api/v2/team/${teamId}/task?space_ids[]=${listId}&${baseQs}&page=${page}`,
            auth,
            `space ${listId}`
        );
        if (spaceResult.ok && spaceResult.tasks.length) {
            console.log(`[Atlas] ClickUp space: ${spaceResult.tasks.length} tasks (${spaceResult.pages} page(s))`);
            return spaceResult.tasks;
        }
        return getClickUpMockData();
    } catch (e) {
        console.warn('[Atlas] ClickUp fetch failed, falling back to mock data:', e);
        return getClickUpMockData();
    }
}

function mapClickUpTaskToProject(task) {
    const id = task.id || `CU-${Math.random().toString(36).substr(2, 9)}`;
    const name = task.name || 'Unnamed ClickUp Task';
    const useListClient = featureOn('CLICKUP_LIST_AS_CLIENT');
    const useDoneStatus = featureOn('CLICKUP_DONE_STATUS');
    const isDone = useDoneStatus && clickUpTaskIsDone(task);
    const listLabel = clickUpListName(task);

    // Parse timestamps (ClickUp timestamps are Unix millisecond strings)
    const parseTs = (ts) => {
        if (!ts) return '';
        const d = new Date(parseInt(ts, 10));
        return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    };

    const start_date = parseTs(task.start_date);
    const release_date = parseTs(task.due_date);
    const statusRaw = task.status?.status || 'Planning';

    const stage = useDoneStatus
        ? clickUpStageFromStatus(statusRaw, isDone)
        : normalizeStage(statusRaw);
    const status = isDone
        ? 'on_track'
        : normalizeStatus(statusRaw || 'on_track');
    
    let owner = 'Unassigned';
    let developer = 'Unassigned';
    let qa_engineer = 'Unassigned';
    let ba = '—';
    let client = useListClient && listLabel ? listLabel : '—';
    let progress = 0;
    let priority = 'Medium';
    let total_pages = 0;
    let completed_pages = 0;
    let actual_live_date = '';
    let notes = task.description || '';
    let tags = (task.tags || []).map(t => t.name || t);

    // Map Assignees
    if (task.assignees && task.assignees.length > 0) {
        owner = task.assignees[0].username || task.assignees[0].email || 'Unassigned';
        if (task.assignees.length > 1) {
            developer = task.assignees[1].username || task.assignees[1].email || 'Unassigned';
        }
        if (task.assignees.length > 2) {
            qa_engineer = task.assignees[2].username || task.assignees[2].email || 'Unassigned';
        }
    }

    // Map Custom Fields
    if (task.custom_fields && Array.isArray(task.custom_fields)) {
        task.custom_fields.forEach(f => {
            const fname = (f.name || '').toLowerCase().replace(/[\s_-]+/g, '');
            const val = f.value;
            if (val == null || val === '') return;

            if (fname === 'owner' || fname === 'pm') {
                owner = String(val);
            } else if (fname === 'developer' || fname === 'dev') {
                developer = String(val);
            } else if (fname === 'qa' || fname === 'qaengineer') {
                qa_engineer = String(val);
            } else if (fname === 'ba' || fname === 'businessanalyst') {
                ba = String(val);
            } else if (fname === 'client' || fname === 'pagename') {
                if (val) client = String(val);
            } else if (fname === 'progress' || fname === 'percent' || fname === 'progress%') {
                progress = parseInt(val) || 0;
            } else if (fname === 'priority') {
                priority = String(val);
            } else if (fname === 'totalpages') {
                total_pages = parseInt(val) || 0;
            } else if (fname === 'completedpages') {
                completed_pages = parseInt(val) || 0;
            } else if (fname === 'actuallivedate' || fname === 'golivedate') {
                actual_live_date = String(val);
            }
        });
    }

    // Progress inference fallback
    if (progress === 0) {
        if (stage === 'Live' || isDone) progress = 100;
        else if (total_pages > 0) {
            progress = Math.round((completed_pages / total_pages) * 100);
        }
    } else if (isDone && progress < 100) {
        progress = 100;
    }

    if (useDoneStatus && isDone && !actual_live_date) {
        const closed = parseTs(task.date_closed) || parseTs(task.date_done);
        actual_live_date = closed || release_date || new Date().toISOString().split('T')[0];
    }

    const out = {
        id,
        name,
        owner,
        client,
        stage,
        status,
        progress,
        start_date,
        release_date,
        priority: normalizePriority(priority),
        ba,
        page_owner: owner,
        cms: '—',
        developer,
        qa_engineer,
        total_pages,
        completed_pages,
        page_priority: 'P2',
        actual_live_date,
        current_page: '',
        detail_gid: '',
        detail_csv_url: '',
        notes,
        tags,
        hasManualProgress: true,
        roadmap: {
            hasSibling: false
        },
    };
    if (useDoneStatus) out.clickupComplete = !!isDone;
    if (useListClient && listLabel) out.clickupList = listLabel;
    return out;
}

function getClickUpMockData() {
    const today = new Date();
    const getOffsetDateStr = (days) => {
        const d = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
        return String(d.getTime());
    };

    return [
        {
            id: 'cu-seo-opt',
            name: 'SEO Optimization Strategy',
            list: { name: 'Valoriz' },
            status: { status: 'in progress', type: 'custom' },
            start_date: getOffsetDateStr(-18),
            due_date: getOffsetDateStr(12),
            description: 'Audit backlink profile, perform keyword gap analysis, and optimize top meta tags.',
            assignees: [{ username: 'Alice Johnson' }, { username: 'Bob Smith' }],
            tags: ['SEO', 'Marketing'],
            custom_fields: [
                { name: 'Client', value: 'Google Search' },
                { name: 'BA', value: 'Charlie Lee' },
                { name: 'QA Engineer', value: 'Charlie Lee' },
                { name: 'Total Pages', value: '15' },
                { name: 'Completed Pages', value: '9' }
            ]
        },
        {
            id: 'cu-ppc-launch',
            name: 'PPC Campaign Launch',
            list: { name: 'Streak' },
            status: { status: 'to do', type: 'open' },
            start_date: getOffsetDateStr(-10),
            due_date: getOffsetDateStr(3),
            description: 'Launch Q2 search and display campaigns on Google Ads and Meta Ads.',
            assignees: [{ username: 'Alice Johnson' }],
            tags: ['PPC', 'Paid Ads'],
            custom_fields: [
                { name: 'Client', value: 'AdWords Corp' },
                { name: 'Progress', value: '90' },
                { name: 'Priority', value: 'High' }
            ]
        },
        {
            id: 'cu-soc-strat',
            name: 'Social Media Strategy',
            status: { status: 'Planning' },
            start_date: getOffsetDateStr(-2),
            due_date: getOffsetDateStr(45),
            description: 'Formulate dynamic organic social media calendar and content marketing themes.',
            assignees: [{ username: 'Bob Smith' }],
            tags: ['Social', 'Organic'],
            custom_fields: [
                { name: 'Client', value: 'LinkedIn/Insta' },
                { name: 'Progress', value: '15' },
                { name: 'Priority', value: 'Low' }
            ]
        },
        {
            id: 'cu-web-audit',
            name: 'Website Audit & Content Refactoring',
            list: { name: 'Valoriz' },
            status: { status: 'complete', type: 'closed' },
            date_closed: getOffsetDateStr(-15),
            start_date: getOffsetDateStr(-60),
            due_date: getOffsetDateStr(-15),
            description: 'Completed full-site speed audit and rewrote outdated landing page copies.',
            assignees: [{ username: 'Alice Johnson' }, { username: 'Bob Smith' }],
            tags: ['Performance', 'Content'],
            custom_fields: [
                { name: 'Client', value: 'SaaS Inc' },
                { name: 'Actual Live Date', value: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
            ]
        },
        {
            id: 'cu-email-auto',
            name: 'Email Newsletter Automation',
            status: { status: 'QA' },
            start_date: getOffsetDateStr(-30),
            due_date: getOffsetDateStr(-8),
            description: 'Implement HubSpot automated customer onboarding flows and trigger templates.',
            assignees: [{ username: 'Alice Johnson' }, { username: 'Bob Smith' }, { username: 'Charlie Lee' }],
            tags: ['HubSpot', 'Automation'],
            custom_fields: [
                { name: 'Client', value: 'CRM Marketing' },
                { name: 'Progress', value: '75' },
                { name: 'Status', value: 'delayed' }
            ]
        }
    ];
}

async function loadProjects(sheetUrl) {
    const ws = (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    if (ws.integrationType === 'clickup') {
        console.log(`[Atlas] Loading ClickUp workspace: ${ws.name}`);
        const tasks = await loadClickUpTasks(ws.clickupListId, ws.clickupToken);
        const projects = tasks.map(mapClickUpTaskToProject);
        console.log(`[Atlas] Loaded ${projects.length} ClickUp tasks as projects ✓`);
        return { projects, source: 'clickup' };
    }

    const url = (sheetUrl || CONFIG.SHEET_CSV_URL || '').trim();
    if (!url) {
        console.error('[Atlas] No sheet URL configured for this workspace.');
        return { projects: [], source: 'error' };
    }
    const response = await fetch(sheetFetchUrl(url), SHEET_FETCH_OPTIONS);
    if (!response.ok) throw new Error(`Sheet fetch failed: ${response.status}`);
    const projects = parseCSV(await response.text());
    console.log(`[Atlas] Loaded ${projects.length} projects ✓`);
    return { projects, source: 'sheets' };
}

/* ──────────────────────────────────────────
   SIBLING TAB — second CSV (any column layout)
────────────────────────────────────────── */
function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Build published CSV URL for a sheet tab by gid (same document as workspace sheet).
 */
function buildDetailSheetCsvUrl(gid, sheetBaseUrl) {
    const g = String(gid == null ? '' : gid).trim();
    if (!g) return null;
    const base = (sheetBaseUrl || CONFIG.SHEET_CSV_URL || '').trim();
    if (!base) return null;
    try {
        const u = new URL(base);
        u.searchParams.set('output', 'csv');
        u.searchParams.set('gid', g);
        return u.toString();
    } catch (e) {
        console.warn('[Atlas] buildDetailSheetCsvUrl failed:', e);
        return null;
    }
}

/**
 * First row = headers, remaining rows = data (sibling tab can use any shape).
 */
function parseGenericTableCSV(csvText) {
    const text = String(csvText).replace(/^\uFEFF/, '').trim();
    if (!text) return { headers: [], rows: [] };
    const lines = splitCSVLines(text);
    if (lines.length === 0) return { headers: [], rows: [] };
    const headers = parseCSVLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        rows.push(parseCSVLine(lines[i]));
    }
    return { headers, rows };
}

/**
 * Fetches optional sibling published CSV. Prefer project.detail_csv_url, else build from detail_gid.
 */
async function loadProjectSiblingData(project, sheetBaseUrl) {
    const customUrl = (project.detail_csv_url || '').trim();
    const gid = (project.detail_gid || '').trim();
    const url = customUrl
        ? customUrl
        : (gid ? buildDetailSheetCsvUrl(gid, sheetBaseUrl) : '');
    if (!url) {
        return { hasSibling: false, source: 'none' };
    }
    try {
        const response = await fetch(sheetFetchUrl(url), SHEET_FETCH_OPTIONS);
        if (!response.ok) {
            return { hasSibling: true, source: 'error', error: `HTTP ${response.status}` };
        }
        const table = parseGenericTableCSV(await response.text());
        return { hasSibling: true, source: 'ok', table };
    } catch (e) {
        return { hasSibling: true, source: 'error', error: e.message || 'Network error' };
    }
}

/* ──────────────────────────────────────────
   SIBLING ROADMAP METRICS (Delivery progress)
   Same logic as project detail page — shared with Overview / Directory.
────────────────────────────────────────── */
function normalizeHeaderForMatch(h) {
    if (h == null) return '';
    return String(h).replace(/^\uFEFF/, '').trim().toLowerCase().replace(/\s+/g, '_');
}

function findSiblingTitleColumnIndex(headers) {
    const titleKeys = ['project_name', 'page_name', 'name', 'title', 'milestone'];
    for (const key of titleKeys) {
        const idx = headers.findIndex((h) => normalizeHeaderForMatch(h) === key);
        if (idx >= 0) return idx;
    }
    return 0;
}

function findSiblingCol(hlist, aliases) {
    for (const fk of aliases) {
        const want = normalizeHeaderForMatch(fk.replace(/\s+/g, '_'));
        const idx = hlist.findIndex((h) => normalizeHeaderForMatch(h) === want);
        if (idx >= 0) return idx;
    }
    return -1;
}

function roadmapCell(row, idx) {
    if (idx < 0 || !row) return '';
    const v = row[idx];
    return v != null && String(v).trim() !== '' ? String(v).trim() : '';
}

/**
 * Delivery progress from sibling tab rows (avg of row progress; blank rows skipped).
 */
function computeRoadmapMetrics(p, hlist, rows) {
    const idxStage = findSiblingCol(hlist, ['stage', 'phase']);
    const idxProgress = findSiblingCol(hlist, ['progress', 'pct', 'percent', '%']);
    const idxOwner = findSiblingCol(hlist, ['owner', 'page_owner', 'pm', 'lead']);
    const idxStatus = findSiblingCol(hlist, ['status', 'health']);
    const ti = hlist.length ? findSiblingTitleColumnIndex(hlist) : 0;
    let live = 0;
    let inprog = 0;
    let pending = 0;
    let pctSum = 0;
    let pctN = 0;

    rows.forEach((row) => {
        if (!row.some(cell => cell && String(cell).trim())) return;

        const st = normalizeStage(idxStage >= 0 ? roadmapCell(row, idxStage) : '');
        const rawSt = idxStage >= 0 ? roadmapCell(row, idxStage).toLowerCase() : '';
        if (st === 'Live' || rawSt.includes('live') || rawSt.includes('done') || rawSt.includes('completed')) {
            live += 1;
        } else if (
            st === 'Backlog' || st === 'Planning' ||
            rawSt.includes('pend') || rawSt.includes('planned') ||
            rawSt.includes('to do') || rawSt.includes('todo')
        ) {
            pending += 1;
        } else {
            inprog += 1;
        }

        const ps = idxProgress >= 0 ? roadmapCell(row, idxProgress) : '';
        const n = parseInt(ps, 10);
        pctSum += (!isNaN(n)) ? Math.min(100, Math.max(0, n)) : 0;
        pctN += 1;
    });

    const total = pctN;
    const avgPct = pctN > 0 ? Math.round(pctSum / pctN) : (p.progress || 0);
    const funnelStage = computeDominantFunnelStage(hlist, rows);
    return { ti, idxStage, idxStatus, idxProgress, idxOwner, total, live, inprog, pending, avgPct, funnelStage };
}

/**
 * Per-page people assignments from sibling tab rows (Developer / QA / Page owner columns).
 * Each entry: { person, role, page, stage, status, start, end, completed } — dates as raw strings.
 */
function computeSiblingAssignments(hlist, rows) {
    const ti = hlist.length ? findSiblingTitleColumnIndex(hlist) : 0;
    const idxStage   = findSiblingCol(hlist, ['stage', 'phase']);
    const idxStatus  = findSiblingCol(hlist, ['status', 'health']);
    const idxStart   = findSiblingCol(hlist, ['start_date', 'project_start_date']);
    const idxRelease = findSiblingCol(hlist, ['release_date', 'planned_release_date', 'release', 'target_date']);
    const idxLive    = findSiblingCol(hlist, ['actual_live_date', 'live_date', 'go_live', 'live']);
    const roleCols = [
        { role: 'Developer',  idx: findSiblingCol(hlist, ['developer', 'dev']) },
        { role: 'QA',         idx: findSiblingCol(hlist, ['qa', 'qa_engineer', 'q_a']) },
        { role: 'Page owner', idx: findSiblingCol(hlist, ['page_owner']) },
    ].filter(rc => rc.idx >= 0);
    if (!roleCols.length) return [];

    const out = [];
    rows.forEach(row => {
        if (!row.some(cell => cell && String(cell).trim())) return;
        const rawStage = idxStage >= 0 ? roadmapCell(row, idxStage) : '';
        const stage = normalizeStage(rawStage);
        const low = rawStage.toLowerCase();
        const rowDone = stage === 'Live' || low.includes('live') || low.includes('done') || low.includes('completed');
        const base = {
            page:   roadmapCell(row, ti),
            stage,
            status: idxStatus >= 0 ? roadmapCell(row, idxStatus) : '',
            start:  idxStart >= 0 ? roadmapCell(row, idxStart) : '',
            end:    rowDone
                ? (roadmapCell(row, idxLive) || roadmapCell(row, idxRelease))
                : roadmapCell(row, idxRelease),
            completed: rowDone,
        };
        roleCols.forEach(rc => {
            const v = roadmapCell(row, rc.idx);
            if (!isValidResourceName(v)) return;
            out.push({ person: v, role: rc.role, ...base });
        });
    });
    return out;
}

/** Most common normalized stage across sibling rows (e.g. Streak_QA → QA for funnel). */
function computeDominantFunnelStage(hlist, rows) {
    const idxStage = findSiblingCol(hlist, ['stage', 'phase']);
    if (idxStage < 0) return null;
    const counts = {};
    rows.forEach((row) => {
        if (!row.some(cell => cell && String(cell).trim())) return;
        const raw = roadmapCell(row, idxStage);
        if (!raw) return;
        const st = normalizeStage(raw);
        counts[st] = (counts[st] || 0) + 1;
    });
    const entries = Object.entries(counts);
    if (!entries.length) return null;
    const FUNNEL_ORDER = ['Backlog', 'Planning', 'Development', 'QA', 'Release', 'Live'];
    entries.sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return FUNNEL_ORDER.indexOf(a[0]) - FUNNEL_ORDER.indexOf(b[0]);
    });
    return entries[0][0];
}

/** Stage for funnel / pipeline / filters: dominant sibling stage when linked, else master tab. */
function projectFunnelStage(p) {
    if (featureOn('SIBLING_FUNNEL_STAGE') && p?.roadmap?.hasSibling && p.roadmap.funnelStage) {
        return p.roadmap.funnelStage;
    }
    return p?.stage ?? 'Backlog';
}

/** Progress % for UI: sibling Delivery avg when available, else master Project tab. */
function projectDisplayProgress(p) {
    if (featureOn('SIBLING_LIST_PROGRESS') && p?.roadmap?.hasSibling && p.roadmap.avgPct != null) {
        return p.roadmap.avgPct;
    }
    return p?.progress ?? 0;
}

function projectSiblingFetchFailed(p) {
    return featureOn('SIBLING_FETCH_FAIL_BADGE')
        && projectHasSiblingLink(p)
        && p?.roadmap?.source === 'error';
}

function projectHasSiblingLink(p) {
    return !!((p.detail_gid || '').trim() || (p.detail_csv_url || '').trim());
}

/**
 * After master CSV load, fetch sibling tabs and attach roadmap metrics for list/overview views.
 */
async function enrichProjectsWithSiblingMetrics(projects, sheetBaseUrl) {
    const base = (sheetBaseUrl || '').trim();
    const list = Array.isArray(projects) ? projects.map(p => ({ ...p })) : [];
    const linked = list.filter(projectHasSiblingLink);
    const CONCURRENCY = 4;

    for (let i = 0; i < linked.length; i += CONCURRENCY) {
        const batch = linked.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map(async (p) => {
            const idx = list.findIndex(x => x.id === p.id);
            if (idx < 0) return;
            try {
                const sib = await loadProjectSiblingData(p, base);
                if (sib.source === 'ok' && sib.table?.headers?.length && sib.table.rows?.length) {
                    const rm = computeRoadmapMetrics(p, sib.table.headers, sib.table.rows);
                    const assignments = computeSiblingAssignments(sib.table.headers, sib.table.rows);
                    list[idx].roadmap = { hasSibling: true, source: 'sibling', ...rm, assignments };
                } else if (sib.hasSibling && sib.source === 'error') {
                    list[idx].roadmap = { hasSibling: false, source: 'error' };
                }
            } catch (e) {
                console.warn('[Atlas] Sibling enrich failed for', p.id, e);
                list[idx].roadmap = { hasSibling: false, source: 'error' };
            }
        }));
    }
    return list;
}

/* ──────────────────────────────────────────
   FEATURE FLAGS & POST-LIVE DATE HELPERS
────────────────────────────────────────── */
function featureOn(key) {
    const flags = CONFIG.FEATURE_FLAGS;
    if (!flags || !(key in flags)) return true;
    return flags[key] === true;
}

function projectIsPostLive(project, today) {
    return featureOn('POST_LIVE_DATE_RULES') && hasPastGoLive(project, today);
}

/** Shipped UX: Live stage or post-live CR/hypercare with past actual_live_date. */
function projectCountsAsShipped(project, today) {
    if (normalizeStage(project?.stage || '') === 'Live') return true;
    return projectIsPostLive(project, today);
}

/** Recently Live / insights badge — avoids misleading early/late vs updated CR release_date. */
function getLaunchTimingBadge(project, today) {
    if (!isValidParsedDate(project?.actual_live_date)) return { badge: '', badgeColor: '' };
    if (projectIsPostLive(project, today)) {
        return { badge: 'Shipped', badgeColor: '#1E8E3E' };
    }
    if (!isValidParsedDate(project.release_date)) return { badge: '', badgeColor: '' };
    const tgt = startOfDay(parseSmartDate(project.release_date));
    const act = startOfDay(parseSmartDate(project.actual_live_date));
    if (isNaN(tgt.getTime()) || isNaN(act.getTime())) return { badge: '', badgeColor: '' };
    const diff = Math.round((tgt - act) / 86400000);
    if (diff > 0) return { badge: `${diff}d early`, badgeColor: '#1E8E3E' };
    if (diff < 0) return { badge: `${Math.abs(diff)}d late`, badgeColor: '#D93025' };
    return { badge: 'on time', badgeColor: '#1E8E3E' };
}

/** Directory / cards: release countdown with post-live CR wording (never “Xd overdue” after go-live). */
function getProjectReleaseRelative(project, today) {
    if (!project?.release_date || isPlaceholderDate(project.release_date)) {
        return { text: 'No date', cls: 'ok', daysText: '', overdue: false };
    }
    const t = today ? startOfDay(today) : startOfDay(new Date());
    const d = startOfDay(parseSmartDate(project.release_date));
    if (isNaN(d.getTime())) return { text: project.release_date, cls: 'ok', daysText: '', overdue: false };
    const diff = Math.ceil((d - t) / 86400000);

    if (projectIsPostLive(project, t)) {
        if (diff < 0) {
            return {
                text: formatDate(project.release_date),
                cls: 'ok',
                daysText: `${Math.abs(diff)}d since CR target`,
                overdue: false,
                postLive: true,
            };
        }
        if (diff === 0) {
            return { text: 'Today', cls: 'upcoming', daysText: 'CR due today', urgent: true, overdue: false, postLive: true };
        }
        if (diff <= 7) {
            return {
                text: formatDate(project.release_date),
                cls: 'upcoming',
                daysText: `CR due in ${diff}d`,
                urgent: diff <= 3,
                overdue: false,
                postLive: true,
            };
        }
        return {
            text: formatDate(project.release_date),
            cls: 'ok',
            daysText: `CR due in ${diff}d`,
            overdue: false,
            postLive: true,
        };
    }

    if (diff < 0) {
        return { text: formatDate(project.release_date), cls: 'overdue', daysText: `${Math.abs(diff)}d overdue`, overdue: true };
    }
    if (diff === 0) return { text: 'Today', cls: 'upcoming', daysText: 'today!', urgent: true, overdue: false };
    if (diff <= 7) return { text: formatDate(project.release_date), cls: 'upcoming', daysText: `in ${diff}d`, urgent: true, overdue: false };
    if (diff <= 30) return { text: formatDate(project.release_date), cls: 'ok', daysText: `in ${diff}d`, overdue: false };
    return { text: formatDate(project.release_date), cls: 'ok', daysText: `in ${diff}d`, overdue: false };
}

/* ──────────────────────────────────────────
   HELPER UTILITIES
────────────────────────────────────────── */
function getRelativeDate(dateStr) {
    if (!dateStr) return { text: 'No date', cls: 'ok', daysText: '' };
    const today = new Date(); today.setHours(0,0,0,0);
    const d = parseSmartDate(dateStr);
    const diff = Math.ceil((d - today) / 86400000);

    if (diff < 0)  return { text: formatDate(dateStr), cls: 'overdue',  daysText: `${Math.abs(diff)}d overdue`, overdue: true };
    if (diff === 0) return { text: 'Today',             cls: 'upcoming', daysText: 'today!', urgent: true };
    if (diff <= 7)  return { text: formatDate(dateStr), cls: 'upcoming', daysText: `in ${diff}d`, urgent: true };
    if (diff <= 30) return { text: formatDate(dateStr), cls: 'ok',       daysText: `in ${diff}d` };
    return { text: formatDate(dateStr), cls: 'ok', daysText: `in ${diff}d` };
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = parseSmartDate(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

function formatDateShort(dateStr) {
    if (!dateStr) return '—';
    const d = parseSmartDate(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month:'short', day:'numeric' });
}

/** Local calendar midnight — avoids timezone off-by-one on date-only values. */
function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

/** Google Sheets / Excel serial (days since 1899-12-30). */
function parseSheetsSerial(n) {
    const whole = Math.floor(n);
    const frac  = n - whole;
    return new Date(Date.UTC(1899, 11, 30) + whole * 86400000 + Math.round(frac * 86400000));
}

function isPlaceholderDate(str) {
    const t = String(str || '').trim();
    return !t || /^tbd$/i.test(t) || /^n\/?a$/i.test(t) || t === '—';
}

function parseSmartDate(str) {
    if (!str) return new Date(NaN);
    const t = String(str).trim();
    if (isPlaceholderDate(t)) return new Date(NaN);

    // Sheets sometimes exports dates as serial numbers (e.g. 45413)
    if (/^\d+(\.\d+)?$/.test(t)) {
        const n = parseFloat(t);
        if (n >= 1 && n < 1000000) return parseSheetsSerial(n);
    }

    // ISO YYYY-MM-…
    if (t.includes('-') && t.split('-')[0].length === 4) return new Date(t);

    // DD-Mon-YYYY (e.g. 20-Mar-2026) or 1-May-2026
    const mon = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };
    const mmm = t.match(/^(\d{1,2})-([A-Za-z]{3,9})-(\d{4})$/);
    if (mmm) {
        const d = parseInt(mmm[1], 10);
        const monthKey = mmm[2].toLowerCase().slice(0, 3);
        const mo = mon[monthKey];
        if (mo === undefined) return new Date(NaN);
        return new Date(parseInt(mmm[3], 10), mo, d);
    }

    // DD-MM-YYYY or DD/MM/YYYY (numeric)
    const parts = t.split(/[-/]/);
    if (parts.length === 3) {
        const a = parseInt(parts[0], 10);
        const b = parseInt(parts[1], 10);
        const c = parseInt(parts[2], 10);
        if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
            if (b <= 12 && a <= 31) {
                return new Date(c, b - 1, a);
            }
        }
    }
    return new Date(t);
}

/** Valid parsed release / go-live date (not TBD, not garbage). */
function isValidParsedDate(str) {
    if (isPlaceholderDate(str)) return false;
    const d = parseSmartDate(str);
    return d && !isNaN(d.getTime());
}

/**
 * Go-live already happened (actual_live_date on or before today).
 * Ignores pre-filled live dates on active Dev/Planning rows (common sheet mistake).
 */
function hasPastGoLive(project, today) {
    if (!isValidParsedDate(project.actual_live_date)) return false;
    const live = startOfDay(parseSmartDate(project.actual_live_date));
    const t    = today ? startOfDay(today) : startOfDay(new Date());
    if (live > t) return false;
    if (project.stage === 'Live') return true;
    // Post-live CR / hypercare (e.g. "Live -CR" → normalized Release)
    if (project.stage === 'Release') return true;
    return false;
}

/** Overview "Upcoming Launches" — target release in the next N days, not yet Live. */
function qualifiesAsUpcomingLaunch(project, today, windowDays) {
    const days = windowDays ?? (CONFIG.UPCOMING_LAUNCH_DAYS ?? 30);
    if (project.stage === 'Live') return false;
    if (projectIsPostLive(project, today)) return false;
    if (!isValidParsedDate(project.release_date)) return false;
    const t   = today ? startOfDay(today) : startOfDay(new Date());
    const end = new Date(t);
    end.setDate(t.getDate() + days);
    const rel = startOfDay(parseSmartDate(project.release_date));
    return rel >= t && rel <= end;
}

/** Overview "Recently Live" — shipped in the last N days. */
function qualifiesAsRecentlyLive(project, today, windowDays) {
    const days = windowDays ?? (CONFIG.RECENTLY_LIVE_DAYS ?? 90);
    if (!hasPastGoLive(project, today)) return false;
    const t    = today ? startOfDay(today) : startOfDay(new Date());
    const live = startOfDay(parseSmartDate(project.actual_live_date));
    const cutoff = new Date(t);
    cutoff.setDate(t.getDate() - days);
    return live >= cutoff;
}

/**
 * Single pass over live sheet rows — all Overview date widgets derive from this.
 * Pass AppState.allProjects after every fetch/refresh (never a cached snapshot).
 */
function computeOverviewDateMetrics(projects, today) {
    const t = today ? startOfDay(today) : startOfDay(new Date());
    const launchHorizon = CONFIG.UPCOMING_LAUNCH_DAYS ?? 30;
    const liveLookback  = CONFIG.RECENTLY_LIVE_DAYS ?? 90;
    const list = Array.isArray(projects) ? projects : [];

    const upcomingLaunches = list
        .filter(p => qualifiesAsUpcomingLaunch(p, t, launchHorizon))
        .sort((a, b) => parseSmartDate(a.release_date) - parseSmartDate(b.release_date));

    const recentlyLive = list
        .filter(p => qualifiesAsRecentlyLive(p, t, liveLookback))
        .sort((a, b) => parseSmartDate(b.actual_live_date) - parseSmartDate(a.actual_live_date));

    const in14 = new Date(t);
    in14.setDate(t.getDate() + 14);
    const critical14d = list.filter(p => {
        if (projectIsPostLive(p, t)) return false;
        if (!isValidParsedDate(p.release_date)) return false;
        const rel = startOfDay(parseSmartDate(p.release_date));
        return rel >= t && rel <= in14;
    });

    const milestones30d = list
        .filter(p => qualifiesAsUpcomingLaunch(p, t, launchHorizon))
        .sort((a, b) => parseSmartDate(a.release_date) - parseSmartDate(b.release_date))
        .map(p => ({
            ...p,
            daysToRelease: Math.ceil(
                (startOfDay(parseSmartDate(p.release_date)) - t) / 86400000
            ),
        }));

    return { today: t, upcomingLaunches, recentlyLive, critical14d, milestones30d };
}

// Deterministic color for a string (owner avatar background)
function stringToColor(str) {
    const colors = [
        '#1A73E8','#34A853','#EA4335','#FBBC04',
        '#9C27B0','#FF6D00','#00BFA5','#F06292',
        '#5C6BC0','#26A69A',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function getInitials(name) {
    return name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
}

function stageClass(stage) {
    return stage.toLowerCase().replace(/\s+/g, '-');
}

function statusLabel(status) {
    const map = { on_track:'On Track', at_risk:'At Risk', delayed:'Delayed' };
    return map[status] || status;
}

function priorityOrder(p) {
    return { High:0, Medium:1, Low:2 }[p] ?? 1;
}

function sortProjects(projects, sortKey) {
    return [...projects].sort((a, b) => {
        switch (sortKey) {
            case 'release_date': {
                const da = a.release_date ? parseSmartDate(a.release_date) : new Date('9999');
                const db = b.release_date ? parseSmartDate(b.release_date) : new Date('9999');
                const ta = isNaN(da.getTime()) ? 9e12 : da.getTime();
                const tb = isNaN(db.getTime()) ? 9e12 : db.getTime();
                return ta - tb;
            }
            case 'progress':  return projectDisplayProgress(b) - projectDisplayProgress(a);
            case 'name':      return a.name.localeCompare(b.name);
            case 'priority':  return priorityOrder(a.priority) - priorityOrder(b.priority);
            case 'status': {
                const so = { delayed:0, at_risk:1, on_track:2 };
                return (so[a.status]??2) - (so[b.status]??2);
            }
            default: return 0;
        }
    });
}

/* ──────────────────────────────────────────
   RESOURCE MAP — cross-project people intelligence
────────────────────────────────────────── */

/** Assignment treated as complete for capacity (Live or already shipped / post-live CR). */
function projectAssignmentCompleted(project) {
    if (!featureOn('RESOURCE_FREE_FROM_FIX')) {
        return normalizeStage(project.stage || '') === 'Live';
    }
    if (normalizeStage(project.stage || '') === 'Live') return true;
    return hasPastGoLive(project);
}

/** End of person's involvement on a project (for timeline + freeFrom). */
function projectAssignmentEnd(project) {
    const liveDate = isValidParsedDate(project.actual_live_date)
        ? startOfDay(parseSmartDate(project.actual_live_date)) : null;
    const relDate = isValidParsedDate(project.release_date)
        ? startOfDay(parseSmartDate(project.release_date)) : null;
    const completed = projectAssignmentCompleted(project);

    if (completed) {
        if (liveDate && !isNaN(liveDate.getTime())) return liveDate;
        if (relDate && !isNaN(relDate.getTime())) return relDate;
        return null;
    }
    if (relDate && !isNaN(relDate.getTime())) {
        let end = relDate;
        if (featureOn('RESOURCE_USE_PROJECTED_END')) {
            const pred = computeCompletionPrediction(project);
            if (pred?.projected && !isNaN(pred.projected.getTime())) {
                const projEnd = startOfDay(pred.projected);
                if (projEnd > end) end = projEnd;
            }
        }
        return end;
    }
    return null;
}

/**
 * Builds a map of every person (across owner/developer/qa_engineer/ba/page_owner)
 * to the projects they are involved in, with overlap/conflict detection.
 *
 * Returns: Map<name, { name, assignments, activeCount, conflicts, freeFrom }>
 *   assignment: { projectId, projectName, role, start, end, status, stage, completed }
 *   conflict:   { projectA, projectB, overlapDays, role }
 *   freeFrom:   Date | null
 */
function buildResourceMap(projects) {
    const map = {};

    function ensurePerson(n) {
        if (!map[n]) map[n] = { name: n, assignments: [], activeCount: 0, conflicts: [], freeFrom: null };
        return map[n];
    }

    function push(name, role, project, excludeSet) {
        if (!isValidResourceName(name)) return;
        splitAssigneeNames(name).forEach(n => {
            if (!isValidResourceName(n)) return;
            if (excludeSet && excludeSet.has(n)) return;
            ensurePerson(n);

            const stageNorm = normalizeStage(project.stage || '');
            const completed = projectAssignmentCompleted(project);
            const start     = project.start_date ? parseSmartDate(project.start_date) : null;
            const end       = projectAssignmentEnd(project);

            map[n].assignments.push({
                projectId:   project.id,
                projectName: project.name,
                role,
                start:       start && !isNaN(start.getTime()) ? startOfDay(start) : null,
                end:         end && !isNaN(end.getTime()) ? startOfDay(end) : null,
                status:      project.status,
                stage:       stageNorm,
                completed,
            });
        });
    }

    /**
     * Sibling tab rows → one merged assignment per person+role on the project.
     * Active pages drive the window; person is busy until their last active page's release.
     * Returns the set of people covered so master-row fallback can skip them.
     */
    function pushSiblingAssignments(project, siblingAssignments) {
        const merged = {};
        siblingAssignments.forEach(sa => {
            splitAssigneeNames(sa.person).forEach(n => {
                if (!isValidResourceName(n)) return;
                const key = `${n}|${sa.role}`;
                const cur = merged[key] || (merged[key] = {
                    name: n, role: sa.role, pages: 0, activePages: 0,
                    start: null, endActive: null, endDone: null, allDone: true, stage: sa.stage,
                });
                cur.pages += 1;
                const start = sa.start ? parseSmartDate(sa.start) : null;
                if (start && !isNaN(start.getTime()) && (!cur.start || start < cur.start)) cur.start = startOfDay(start);
                const end = sa.end ? parseSmartDate(sa.end) : null;
                const endOk = end && !isNaN(end.getTime()) ? startOfDay(end) : null;
                if (sa.completed) {
                    if (endOk && (!cur.endDone || endOk > cur.endDone)) cur.endDone = endOk;
                } else {
                    cur.allDone = false;
                    cur.activePages += 1;
                    cur.stage = sa.stage;
                    if (endOk && (!cur.endActive || endOk > cur.endActive)) cur.endActive = endOk;
                }
            });
        });

        const projCompleted = projectAssignmentCompleted(project);
        const projEnd   = projectAssignmentEnd(project);
        const projStart = project.start_date ? parseSmartDate(project.start_date) : null;
        const covered = new Set();

        Object.values(merged).forEach(m => {
            covered.add(m.name);
            ensurePerson(m.name);
            const completed = projCompleted || m.allDone;
            let end = completed ? (m.endDone || m.endActive) : m.endActive;
            if (!end) end = projEnd && !isNaN(projEnd.getTime()) ? projEnd : null;
            let start = m.start || (projStart && !isNaN(projStart.getTime()) ? startOfDay(projStart) : null);

            map[m.name].assignments.push({
                projectId:   project.id,
                projectName: project.name,
                role:        m.role,
                start,
                end,
                status:      project.status,
                stage:       completed ? 'Live' : (m.stage || normalizeStage(project.stage || '')),
                completed,
                pages:       m.pages,
                activePages: m.activePages,
                source:      'sibling',
            });
        });
        return covered;
    }

    projects.forEach(p => {
        const sib = featureOn('SIBLING_RESOURCE_MAP')
            && p.roadmap?.hasSibling
            && Array.isArray(p.roadmap.assignments) && p.roadmap.assignments.length
            ? p.roadmap.assignments : null;

        push(p.owner, 'Owner', p);
        push(p.ba,    'BA',    p);

        if (sib) {
            // Page-level roles come from the sibling tab; master row only fills in
            // people the sibling tab doesn't mention (e.g. master-only Developer).
            const covered = pushSiblingAssignments(p, sib);
            push(p.developer,   'Developer',  p, covered);
            push(p.qa_engineer, 'QA',         p, covered);
            push(p.page_owner,  'Page owner', p, covered);
        } else {
            push(p.developer,   'Developer',  p);
            push(p.qa_engineer, 'QA',         p);
            push(p.page_owner,  'Page owner', p);
        }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    Object.values(map).forEach(person => {
        const active = person.assignments.filter(a => !a.completed);
        person.activeCount = new Set(active.map(a => a.projectId)).size;

        // One timeline window per project (earliest start → latest end) for conflict checks
        const byProject = {};
        active.forEach(a => {
            if (!a.start || !a.end) return;
            const cur = byProject[a.projectId];
            if (!cur) {
                byProject[a.projectId] = { ...a };
                return;
            }
            if (a.start < cur.start) cur.start = a.start;
            if (a.end > cur.end) cur.end = a.end;
        });
        const windows = Object.values(byProject);

        for (let i = 0; i < windows.length; i++) {
            for (let j = i + 1; j < windows.length; j++) {
                const a = windows[i], b = windows[j];
                if (a.projectId === b.projectId) continue;
                if (a.start <= b.end && a.end >= b.start) {
                    const overlapStart = a.start > b.start ? a.start : b.start;
                    const overlapEnd   = a.end   < b.end   ? a.end   : b.end;
                    const overlapDays  = Math.max(0, Math.round((overlapEnd - overlapStart) / 86400000));
                    if (overlapDays > 0) {
                        person.conflicts.push({
                            projectA:    a.projectName,
                            projectIdA:  a.projectId,
                            roleA:       a.role,
                            projectB:    b.projectName,
                            projectIdB:  b.projectId,
                            roleB:       b.role,
                            overlapDays,
                            overlapStart,
                            overlapEnd,
                        });
                    }
                }
            }
        }

        // Free when every active project has an end date; date = latest end (not before today)
        if (!active.length) {
            if (person.assignments.length) person.freeFrom = new Date(today);
        } else {
            const allDated = active.every(a => a.end && !isNaN(a.end.getTime()));
            if (allDated) {
                const maxEndMs = Math.max(...active.map(a => startOfDay(a.end).getTime()));
                const freeMs = featureOn('RESOURCE_FREE_FROM_FIX')
                    ? Math.max(maxEndMs, today.getTime())
                    : maxEndMs;
                person.freeFrom = startOfDay(new Date(freeMs));
            } else {
                person.freeFrom = null;
            }
        }
    });

    return map;
}

/* ──────────────────────────────────────────
   RESOURCE INTELLIGENCE — attention, capacity, intake
────────────────────────────────────────── */

function intelligenceEnabled() {
    return featureOn('RESOURCE_INTELLIGENCE');
}

function getAttentionWeights() {
    return CONFIG.ATTENTION_WEIGHTS || {};
}

const INTEL_ROLES = ['Developer', 'QA', 'BA', 'Owner', 'Page owner'];

function getRoleCapacityMax(role) {
    const m = CONFIG.CAPACITY?.maxProjectsPerPerson || {};
    return m[role] != null ? m[role] : 2;
}

/**
 * Per-project attention score 0–100, tier, and human-readable reasons.
 */
function computeAttentionScore(project, alerts, resourceMap, today) {
    if (!intelligenceEnabled()) return null;
    if (normalizeStage(project?.stage || '') === 'Live') return null;

    const w = getAttentionWeights();
    let score = 0;
    const reasons = [];
    const t = today ? startOfDay(today) : startOfDay(new Date());

    const bucket = alertBucketFor(project.id, alerts);
    if (bucket === 'overdue') {
        score += w.overdue || 40;
        reasons.push('Release date passed');
    } else if (bucket === 'at_risk') {
        score += w.at_risk || 28;
        reasons.push('Velocity forecast: likely miss');
    } else if (bucket === 'stalled') {
        score += w.stalled || 22;
        reasons.push('Stalled progress');
    } else if (bucket === 'upcoming') {
        score += w.upcoming || 8;
        reasons.push('Releasing soon');
    }

    const pred = computeCompletionPrediction(project, t);
    if (pred && pred.diffDays > (CONFIG.PREDICTIVE_ALERT_MIN_SLACK_DAYS ?? 0)) {
        const pts = Math.min(w.diffDaysCap || 18, pred.diffDays * (w.diffDaysPerDay || 2));
        score += pts;
        if (!reasons.some(r => r.includes('Projected'))) {
            reasons.push(`Projected +${pred.diffDays}d vs target`);
        }
    }

    const people = [...splitAssigneeNames(project.owner), ...splitAssigneeNames(project.developer)].filter(n => isValidResourceName(n));
    people.forEach(name => {
        const person = resourceMap[name];
        if (!person) return;
        if (person.activeCount >= 2) {
            score += Math.min(w.workloadCap || 12, person.activeCount * (w.workloadPerProject || 5));
            reasons.push(`${name}: ${person.activeCount} active projects`);
        }
        if (person.conflicts?.length) {
            score += w.conflict || 14;
            reasons.push('Scheduling conflict on team');
        }
    });

    const rm = project.roadmap;
    if (rm?.hasSibling && rm.total > 0) {
        const ratio = rm.pending / rm.total;
        if (ratio >= 0.5) {
            score += w.siblingBacklog || 10;
            reasons.push(`Page backlog ${rm.pending}/${rm.total}`);
        }
    }

    if (project.status === 'delayed') {
        score += w.delayedStatus || 6;
        reasons.push('Status marked delayed');
    }

    score = Math.min(100, Math.round(score));
    let tier = 'low';
    if (score >= 70) tier = 'critical';
    else if (score >= 50) tier = 'high';
    else if (score >= 30) tier = 'medium';

    return { score, tier, reasons: [...new Set(reasons)].slice(0, 4) };
}

/** All non-Live projects with attention fields, highest score first. */
function computeAttentionRanked(projects, alerts, resourceMap) {
    if (!intelligenceEnabled()) return [];
    const today = new Date();
    return projects
        .map(p => {
            const att = computeAttentionScore(p, alerts, resourceMap, today);
            if (!att) return null;
            return {
                ...p,
                attentionScore: att.score,
                attentionTier: att.tier,
                attentionReasons: att.reasons,
            };
        })
        .filter(Boolean)
        .sort((a, b) => b.attentionScore - a.attentionScore);
}

function getAttentionForProject(projectId, ranked) {
    if (!ranked?.length) return null;
    return ranked.find(p => p.id === projectId) || null;
}

function weekStartMonday(d) {
    const x = startOfDay(d);
    const day = x.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    x.setDate(x.getDate() + diff);
    return x;
}

/**
 * Role-based utilization forecast for next ~90 days (13 weekly buckets).
 */
function computeRoleCapacityForecast(projects, resourceMap, horizons) {
    if (!intelligenceEnabled()) return { roles: {}, summary: {}, horizons: horizons || [30, 60, 90] };

    const today = startOfDay(new Date());
    const lowThresh = (CONFIG.CAPACITY?.lowUtilThreshold ?? 0.4) * 100;
    const weekCount = 13;
    const weeks = [];
    for (let i = 0; i < weekCount; i++) {
        const ws = new Date(today);
        ws.setDate(ws.getDate() + i * 7);
        weeks.push(weekStartMonday(ws));
    }

    const rolePeople = {};
    INTEL_ROLES.forEach(role => { rolePeople[role] = new Set(); });

    Object.values(resourceMap).forEach(person => {
        person.assignments.forEach(a => {
            if (a.completed) return;
            if (INTEL_ROLES.includes(a.role)) rolePeople[a.role].add(person.name);
        });
    });

    const roles = {};
    let benchRiskWeeks = 0;
    let shortageWeeks = 0;
    const freeingNext30 = [];

    INTEL_ROLES.forEach(role => {
        const names = [...rolePeople[role]];
        const max = getRoleCapacityMax(role);
        const weekRows = weeks.map((weekStart, wi) => {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            let utilSum = 0;
            let utilN = 0;
            let freeHeadcount = 0;
            let overCapacity = 0;

            names.forEach(name => {
                const person = resourceMap[name];
                if (!person) return;
                let overlap = 0;
                person.assignments.forEach(a => {
                    if (a.completed || a.role !== role) return;
                    if (!a.start || !a.end) {
                        overlap = Math.max(overlap, person.activeCount);
                        return;
                    }
                    if (a.start <= weekEnd && a.end >= weekStart) overlap += 1;
                });
                const distinct = overlap || (person.activeCount > 0 ? person.activeCount : 0);
                const util = Math.min(100, Math.round((distinct / max) * 100));
                if (distinct === 0) freeHeadcount += 1;
                else {
                    utilSum += util;
                    utilN += 1;
                    if (distinct > max) overCapacity += 1;
                }
            });

            const utilizationPct = utilN ? Math.round(utilSum / utilN) : 0;
            if (utilizationPct < lowThresh && names.length > 0) benchRiskWeeks += 1;
            if (overCapacity > 0) shortageWeeks += 1;

            return {
                weekStart: weekStart.toISOString().slice(0, 10),
                weekIndex: wi,
                utilizationPct,
                freeHeadcount,
                overCapacity,
                headcount: names.length,
            };
        });

        roles[role] = { weeks: weekRows, maxPerPerson: max, people: names };
    });

    const cut30 = today.getTime() + 30 * 86400000;
    Object.values(resourceMap).forEach(person => {
        if (!person.freeFrom && person.activeCount > 0) return;
        const ff = person.freeFrom ? person.freeFrom.getTime() : today.getTime();
        if (ff <= cut30) {
            const rolesOn = [...new Set(person.assignments.filter(a => !a.completed).map(a => a.role))];
            freeingNext30.push({
                name: person.name,
                freeFrom: person.freeFrom ? person.freeFrom.toISOString().slice(0, 10) : today.toISOString().slice(0, 10),
                roles: rolesOn.length ? rolesOn : ['—'],
                activeCount: person.activeCount,
            });
        }
    });
    freeingNext30.sort((a, b) => (a.freeFrom || '').localeCompare(b.freeFrom || ''));

    return {
        roles,
        horizons: horizons || [30, 60, 90],
        summary: {
            benchRiskWeeks,
            shortageWeeks,
            freeingNext30: freeingNext30.slice(0, 20),
            avgUtilizationPct: _avgUtilAcrossRoles(roles),
        },
    };
}

function _avgUtilAcrossRoles(roles) {
    let sum = 0;
    let n = 0;
    Object.values(roles).forEach(r => {
        const first = r.weeks?.[0];
        if (first) { sum += first.utilizationPct; n += 1; }
    });
    return n ? Math.round(sum / n) : 0;
}

/**
 * Business intake slots from projected availability by role.
 */
function computeBusinessIntakeCapacity(resourceMap) {
    if (!intelligenceEnabled()) {
        return { small: 0, medium: 0, large: 0, byHorizon: {}, narrativeInputs: {} };
    }

    const today = startOfDay(new Date());
    const intake = CONFIG.INTAKE || {};
    const byHorizon = { 30: {}, 60: {}, 90: {} };

    function countFreeInRole(role, horizonDays) {
        const cut = today.getTime() + horizonDays * 86400000;
        let n = 0;
        Object.values(resourceMap).forEach(person => {
            const hasRole = person.assignments.some(a =>
                !a.completed && a.role === role
            ) || person.assignments.some(a => a.role === role);
            if (!hasRole && person.assignments.every(a => a.role !== role)) return;

            const actsInRole = person.assignments.filter(a => !a.completed && a.role === role);
            if (!actsInRole.length && person.assignments.some(a => a.role === role)) {
                n += 1;
                return;
            }
            if (!actsInRole.length) return;

            const allDated = actsInRole.every(a => a.end);
            if (!allDated && person.activeCount > 0) return;
            const ff = person.freeFrom ? person.freeFrom.getTime() : null;
            if (person.activeCount === 0 || (ff && ff <= cut)) n += 1;
        });
        return n;
    }

    [30, 60, 90].forEach(days => {
        INTEL_ROLES.forEach(role => {
            byHorizon[days][role] = countFreeInRole(role, days);
        });
    });

    function slotCount(tierKey) {
        const spec = intake[tierKey];
        if (!spec) return 0;
        const horizon = spec.days || 30;
        const counts = (spec.roles || ['Developer']).map(r => byHorizon[horizon][r] || 0);
        return Math.min(...counts);
    }

    return {
        small: slotCount('small'),
        medium: slotCount('medium'),
        large: slotCount('large'),
        byHorizon,
        narrativeInputs: {
            devFree30: byHorizon[30].Developer || 0,
            qaFree60: byHorizon[60].QA || 0,
        },
    };
}

/** Executive KPI strip for Intelligence view and AI payload. */
function buildIntelligenceSummary(projects, alerts, resourceMap, attentionRanked, capacityForecast, intake) {
    const critical = attentionRanked.filter(p => p.attentionTier === 'critical').length;
    const high = attentionRanked.filter(p => p.attentionTier === 'high').length;
    const freeing30 = (capacityForecast?.summary?.freeingNext30 || []).length;
    const avgUtil = capacityForecast?.summary?.avgUtilizationPct ?? 0;
    const benchRisk = (capacityForecast?.summary?.benchRiskWeeks || 0) > 2;
    const shortage = (capacityForecast?.summary?.shortageWeeks || 0) > 0;
    const hiringSignal = shortage && avgUtil > 85;

    return {
        workspace: AppState?.activeWorkspaceId,
        project_count: projects.length,
        attention_critical: critical,
        attention_high: high,
        freeing_next_30: freeing30,
        avg_utilization_pct: avgUtil,
        intake_small: intake?.small ?? 0,
        intake_medium: intake?.medium ?? 0,
        intake_large: intake?.large ?? 0,
        bench_risk: benchRisk,
        hiring_signal: hiringSignal,
        alert_likely_miss: alerts?.at_risk?.length ?? 0,
        resource_conflicts: Object.values(resourceMap).filter(p => p.conflicts?.length).length,
    };
}

/** Recompute all intelligence artifacts (call from AppState.setProjects). */
function computeResourceIntelligence(projects, alerts) {
    if (!intelligenceEnabled()) {
        return {
            attentionRanked: [],
            capacityForecast: { roles: {}, summary: {}, horizons: [30, 60, 90] },
            intakeRecommendation: { small: 0, medium: 0, large: 0, byHorizon: {} },
            intelligenceSummary: null,
        };
    }
    const resourceMap = buildResourceMap(projects);
    const attentionRanked = computeAttentionRanked(projects, alerts, resourceMap);
    const capacityForecast = computeRoleCapacityForecast(projects, resourceMap);
    const intakeRecommendation = computeBusinessIntakeCapacity(resourceMap);
    const intelligenceSummary = buildIntelligenceSummary(
        projects, alerts, resourceMap, attentionRanked, capacityForecast, intakeRecommendation
    );
    return { attentionRanked, capacityForecast, intakeRecommendation, intelligenceSummary, resourceMap };
}

function exportToCSV(projects) {
    const headers = [
        'project_id','project_name','owner','page_name','page_owner',
        'stage','status','BA','progress','start_date','release_date',
        'priority','CMS','tags','notes','developer','qa_engineer',
        'total_pages','completed_pages','page_priority','actual_live_date'
    ];
    
    const rows = projects.map(p => [
        p.id, p.name, p.owner, p.client, p.page_owner,
        p.stage, p.status, p.ba, p.progress, p.start_date, p.release_date,
        p.priority, p.cms, (p.tags||[]).join('; '), p.notes,
        p.developer, p.qa_engineer, p.total_pages, p.completed_pages,
        p.page_priority, p.actual_live_date
    ]);

    const csvContent = [headers, ...rows]
        .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `stresk_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
