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
        client:            ['page_name', 'client', 'current_page', 'current page'],
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
        const rawStageCell = (c('stage') || '').trim() || 'Planning';
        const project = {
            id:           c('project_id') || `PRJ-${String(i).padStart(3,'0')}`,
            name:         c('project_name') || 'Unnamed Project',
            owner:        c('owner') || 'Unassigned',
            client:       c('client') || '—',
            rawStage:     rawStageCell,
            stage:        normalizeStage(rawStageCell),
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
    const m = { 'backlog':'Backlog','not started':'Backlog','queued':'Backlog','todo':'Backlog','planning':'Planning','development':'Development','dev':'Development','qa':'QA','testing':'QA','streak_qa':'QA','streak - qa':'QA','release':'Release','staging':'Release','ready for live':'Release','live':'Live','done':'Live','completed':'Live' };
    if (m[low]) return m[low];

    // Underscores in sheet values (e.g. Streak_QA) — treat like spaces for token matching
    const seg = low.replace(/_/g, ' ');

    if (/ready\s*for\s*live/.test(seg)) return 'Release';

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

/** Unique team members from owner, developer, QA, BA, page owner (sheet columns). */
function projectTeamMembers(project, max = 6) {
    const fields = [
        project?.owner,
        project?.developer,
        project?.qa_engineer,
        project?.ba,
        project?.page_owner,
    ];
    const names = [];
    const seen = new Set();
    for (const raw of fields) {
        for (const n of splitAssigneeNames(raw)) {
            if (!isValidResourceName(n)) continue;
            const key = n.toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);
            names.push(n);
        }
    }
    return max ? names.slice(0, max) : names;
}

/** Names that must not appear in the resource / availability map */
function isValidResourceName(name) {
    const n = String(name || '').trim();
    if (!n) return false;
    const low = n.toLowerCase();
    return !['unassigned', '—', '-', 'none', 'n/a', 'na', 'tbd', 'null', 'nil'].includes(low);
}

/** Assignments that drive Free vs On work (sibling tab when present, else project fallback). */
function getAvailabilityAssignments(person) {
    const all = person.assignments || [];
    const sibling = all.filter(a => a.source === 'sibling');
    const pool = sibling.length ? sibling : all;
    return pool.filter(a => !a.completed);
}

/** Active sibling pages for subtitle (release_date from Delivery tab). */
function getActiveSiblingPages(person) {
    const pages = [];
    (person.assignments || [])
        .filter(a => a.source === 'sibling' && !a.completed)
        .forEach(a => {
            (a.siblingPages || []).filter(p => !p.completed).forEach(p => pages.push(p));
        });
    return pages;
}

function formatReleaseSubtitle(pages, today) {
    if (!pages.length) return '';
    const t = today ? startOfDay(today) : startOfDay(new Date());
    const sorted = [...pages].sort((a, b) => {
        const da = a.releaseDate ? parseSmartDate(a.releaseDate) : null;
        const db = b.releaseDate ? parseSmartDate(b.releaseDate) : null;
        const ma = da && !isNaN(da.getTime()) ? startOfDay(da).getTime() : 9e15;
        const mb = db && !isNaN(db.getTime()) ? startOfDay(db).getTime() : 9e15;
        return ma - mb;
    });
    const p = sorted[0];
    const pageName = p.page || 'Page';
    if (!p.releaseDate || isPlaceholderDate(p.releaseDate)) {
        return `${pageName} · release TBD`;
    }
    const d = startOfDay(parseSmartDate(p.releaseDate));
    if (isNaN(d.getTime())) return `${pageName} · release TBD`;
    const short = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const overdue = d.getTime() < t.getTime();
    const suffix = overdue ? ' · overdue' : '';
    if (pages.length > 1) {
        return `${pageName} · release ${short}${suffix} (+${pages.length - 1} more)`;
    }
    return `${pageName} · release ${short}${suffix}`;
}

function formatFallbackAvailabilitySubtitle(activeAssignments, today) {
    const a = activeAssignments[0];
    if (!a) return '';
    const name = a.projectName || 'Project';
    if (a.end && !isNaN(a.end.getTime())) {
        const short = a.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const overdue = startOfDay(a.end).getTime() < startOfDay(today).getTime();
        return `${name} · release ${short}${overdue ? ' · overdue' : ''}`;
    }
    return `${name} · release TBD`;
}

/** UI labels for resource availability — two states: Free vs On work (sibling-first). */
function getResourceAvailability(person, today) {
    const t = today ? startOfDay(today) : startOfDay(new Date());
    const active = getAvailabilityAssignments(person);
    const hasSibling = (person.assignments || []).some(a => a.source === 'sibling');

    if (!active.length) {
        return {
            label: 'Free',
            chipClass: 'res-free-chip--now',
            popClass: 'res-pop-chip--now',
            status: 'free',
            subtitle: '',
        };
    }

    const siblingPages = hasSibling ? getActiveSiblingPages(person) : [];
    const subtitle = siblingPages.length
        ? formatReleaseSubtitle(siblingPages, t)
        : formatFallbackAvailabilitySubtitle(active, t);

    return {
        label: 'On work',
        chipClass: 'res-free-chip--work',
        popClass: 'res-pop-chip--work',
        status: 'on_work',
        subtitle,
    };
}

/**
 * Team Allocation Match By Person — shared matching core (Database roster + Delivery rows).
 * One sheet row → assignments from Developer, QA, page_owner columns.
 * Stage Live = done; otherwise On work for that row.
 */
function computeSiblingPersonMatches(projects, rosterEmployees) {
    const roster = uniqueRosterEmployees(rosterEmployees);
    const resolveName = buildRosterNameResolver(roster);
    const peopleMap = {};

    roster.forEach(emp => {
        const name = String(emp.name || '').trim();
        if (!name) return;
        peopleMap[name] = { name, rows: [], activeRows: [], fromRoster: true };
    });

    const rows = [];
    const projectsList = Array.isArray(projects) ? projects : [];
    let projectsWithSibling = 0;

    projectsList.forEach(p => {
        if (!p.roadmap?.hasSibling || !Array.isArray(p.roadmap.assignments)) return;
        projectsWithSibling += 1;
        p.roadmap.assignments.forEach(sa => {
            splitAssigneeNames(sa.person).forEach(rawPerson => {
                if (!isValidResourceName(rawPerson)) return;
                const person = resolveName(rawPerson);
                rows.push({
                    projectId:   p.id,
                    projectName: p.name || p.id,
                    page:        sa.page || '—',
                    person,
                    role:        sa.role,
                    stage:       sa.stage || '',
                    status:      sa.status || '',
                    startDate:   sa.start || '',
                    releaseDate: sa.end || '',
                    completed:   !!sa.completed,
                    active:      !sa.completed,
                });
            });
        });
    });

    const peopleMapFromRows = {};
    rows.forEach(r => {
        if (!peopleMapFromRows[r.person]) {
            peopleMapFromRows[r.person] = { name: r.person, rows: [], activeRows: [] };
        }
        peopleMapFromRows[r.person].rows.push(r);
        if (r.active) peopleMapFromRows[r.person].activeRows.push(r);
    });

    Object.entries(peopleMapFromRows).forEach(([name, data]) => {
        if (!peopleMap[name]) return;
        peopleMap[name].rows = peopleMap[name].rows.concat(data.rows);
        peopleMap[name].activeRows = peopleMap[name].activeRows.concat(data.activeRows);
    });

    const people = Object.values(peopleMap).map(p => ({
        ...p,
        status: p.activeRows.length ? 'on_work' : 'free',
        activeProjectCount: new Set(p.activeRows.map(r => r.projectId)).size,
    })).sort((a, b) => {
        if (a.status !== b.status) return a.status === 'on_work' ? -1 : 1;
        return a.name.localeCompare(b.name);
    });

    return { rows, people, peopleMap, projectsWithSibling };
}

function buildSiblingAllocationData(projects, rosterEmployees) {
    const { rows, people, projectsWithSibling } = computeSiblingPersonMatches(projects, rosterEmployees);

    const byProject = {};
    rows.forEach(r => {
        if (!byProject[r.projectId]) {
            byProject[r.projectId] = {
                id: r.projectId,
                name: r.projectName,
                rows: [],
                activeRows: [],
                people: new Set(),
            };
        }
        byProject[r.projectId].rows.push(r);
        if (r.active) {
            byProject[r.projectId].activeRows.push(r);
            byProject[r.projectId].people.add(r.person);
        }
    });

    const projectsActive = Object.values(byProject)
        .filter(p => p.activeRows.length)
        .map(p => ({
            id: p.id,
            name: p.name,
            activeRows: p.activeRows,
            people: [...p.people].sort((a, b) => a.localeCompare(b)),
            rowCount: p.activeRows.length,
        }))
        .sort((a, b) => b.rowCount - a.rowCount || a.name.localeCompare(b.name));

    const stats = {
        onWork: people.filter(p => p.status === 'on_work').length,
        free: people.filter(p => p.status === 'free').length,
        totalPeople: people.length,
        activeRows: rows.filter(r => r.active).length,
        totalRows: rows.length,
        projectsWithSibling,
        projectsWithActiveWork: projectsActive.length,
    };

    return { rows, people, stats, projectsActive, byProject };
}

/** Conflicts, freeFrom, activeCount — shared by buildResourceMap and delivery adapter. */
function applyResourceMapDerivedFields(map) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    Object.values(map || {}).forEach(person => {
        const active = (person.assignments || []).filter(a => !a.completed);
        person.activeCount = new Set(active.map(a => a.projectId)).size;

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

        person.conflicts = person.conflicts || [];
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

        if (!active.length) {
            person.freeFrom = (person.assignments || []).length ? new Date(today) : null;
        } else {
            const allDated = active.every(a => a.end && !isNaN(a.end.getTime()));
            if (allDated) {
                const maxEndMs = Math.max(...active.map(a => startOfDay(a.end).getTime()));
                if (featureOn('RESOURCE_FREE_FROM_FIX')) {
                    person.freeFrom = maxEndMs < today.getTime()
                        ? null
                        : startOfDay(new Date(maxEndMs));
                } else {
                    person.freeFrom = startOfDay(new Date(maxEndMs));
                }
            } else {
                person.freeFrom = null;
            }
        }
    });

    return map;
}

/**
 * Adapt Team Allocation Match By Person → resourceMap shape for Resources Delivery UI.
 * Matching rules identical to computeSiblingPersonMatches; this only shapes data for RI widgets.
 */
function buildResourceMapFromPersonMatches(allocationData, projects) {
    const map = {};
    const projectById = {};
    (projects || []).forEach(p => { projectById[p.id] = p; });

    (allocationData?.people || []).forEach(p => {
        map[p.name] = {
            name: p.name,
            assignments: [],
            activeCount: 0,
            conflicts: [],
            freeFrom: null,
        };
    });

    (allocationData?.people || []).forEach(p => {
        const person = map[p.name];
        if (!person) return;

        const merged = {};
        (p.rows || []).forEach(r => {
            const key = `${r.projectId}|${r.role}`;
            const cur = merged[key] || (merged[key] = {
                projectId: r.projectId,
                projectName: r.projectName,
                role: r.role,
                pages: 0,
                activePages: 0,
                start: null,
                endActive: null,
                endDone: null,
                allDone: true,
                stage: r.stage,
                pagesList: [],
                status: 'on_track',
            });
            cur.pages += 1;
            cur.pagesList.push({
                page: r.page,
                releaseDate: r.releaseDate,
                stage: r.stage,
                completed: r.completed,
            });
            const start = r.startDate ? parseSmartDate(r.startDate) : null;
            if (start && !isNaN(start.getTime()) && (!cur.start || startOfDay(start) < cur.start)) {
                cur.start = startOfDay(start);
            }
            const end = r.releaseDate ? parseSmartDate(r.releaseDate) : null;
            const endOk = end && !isNaN(end.getTime()) ? startOfDay(end) : null;
            if (r.completed) {
                if (endOk && (!cur.endDone || endOk > cur.endDone)) cur.endDone = endOk;
            } else {
                cur.allDone = false;
                cur.activePages += 1;
                cur.stage = r.stage;
                if (endOk && (!cur.endActive || endOk > cur.endActive)) cur.endActive = endOk;
            }
            const st = normalizeStatus(r.status);
            if (st === 'delayed') cur.status = 'delayed';
            else if (st === 'at_risk' && cur.status !== 'delayed') cur.status = 'at_risk';
        });

        Object.values(merged).forEach(m => {
            const completed = m.allDone;
            let end = completed ? (m.endDone || m.endActive) : m.endActive;
            const proj = projectById[m.projectId];
            if (!end && proj) {
                const pe = projectAssignmentEnd(proj);
                if (pe && !isNaN(pe.getTime())) end = pe;
            }
            let start = m.start;
            if (!start && proj?.start_date) {
                const ps = parseSmartDate(proj.start_date);
                if (ps && !isNaN(ps.getTime())) start = startOfDay(ps);
            }
            person.assignments.push({
                projectId:   m.projectId,
                projectName: m.projectName,
                role:        m.role,
                start:       start && !isNaN(start.getTime()) ? start : null,
                end:         end && !isNaN(end.getTime()) ? startOfDay(end) : null,
                status:      m.status,
                stage:       completed ? 'Live' : (m.stage || normalizeStage(proj?.stage || '')),
                completed,
                pages:       m.pages,
                activePages: m.activePages,
                siblingPages: m.pagesList,
                source:      'sibling',
            });
        });
    });

    return applyResourceMapDerivedFields(map);
}

function formatAllocReleaseDate(raw) {
    if (!raw || isPlaceholderDate(raw)) return 'TBD';
    const d = parseSmartDate(raw);
    if (isNaN(d.getTime())) return String(raw);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
 * Progress % for velocity forecasts.
 * Sibling roadmap avg can be diluted by many not-started pages (e.g. 0/37 live → ~11%),
 * which makes slip explode (+500d). Prefer the master sheet % in that case.
 */
function predictionProgress(project) {
    const master = Math.round(parseFloat(project?.progress) || 0);
    const disp = typeof projectDisplayProgress === 'function'
        ? projectDisplayProgress(project)
        : master;
    const pages = Number(project?.roadmap?.total)
        || parseInt(String(project?.total_pages ?? 0), 10)
        || 0;
    const done = Number(project?.roadmap?.live)
        || parseInt(String(project?.completed_pages ?? 0), 10)
        || 0;
    if (master > 0 && pages >= 5 && done <= Math.max(1, pages * 0.05) && disp > 0 && disp < master) {
        return master;
    }
    return disp > 0 ? disp : master;
}

/**
 * Velocity-based completion forecast (shared by Alerts at_risk bucket and Analytics).
 * Returns null when dates/progress are insufficient to project.
 *
 * High progress: project finish from historical velocity (start + elapsed / rate).
 * Low progress: velocity explodes (11% → +500d); instead project remaining work at
 * the original planned pace from today — a stable “days behind plan” style slip.
 */
function computeCompletionPrediction(project, today) {
    const t = today ? startOfDay(today) : startOfDay(new Date());
    const ns = normalizeStage(project?.stage || '');
    const dispProg = predictionProgress(project);
    if (ns === 'Live' || !dispProg || dispProg <= 0 || !project.start_date || !project.release_date) return null;

    const start = startOfDay(parseSmartDate(project.start_date));
    const target = startOfDay(parseSmartDate(project.release_date));
    if (!start || !target || isNaN(start.getTime()) || isNaN(target.getTime())) return null;
    if (target.getTime() <= start.getTime()) return null;

    const daysElapsed = Math.max(1, Math.round((t - start) / 86400000));
    const plannedDays = Math.max(1, Math.round((target - start) / 86400000));

    const maxPipe = typeof MAX_PIPELINE_DAYS !== 'undefined' ? MAX_PIPELINE_DAYS : 730;
    if (daysElapsed > maxPipe * 2) return null;

    const rate = dispProg / 100;
    const velocityTotal = Math.round(daysElapsed / rate);
    const velocitySlip = velocityTotal - plannedDays;

    // Below ~25% complete, historical velocity is not trustworthy for end dates.
    const lowConfidence = dispProg < 25 && velocitySlip > plannedDays;

    let projected;
    let diffDays;
    let capped = false;
    if (lowConfidence) {
        const remainingAtPlan = Math.round(plannedDays * (1 - rate));
        projected = new Date(t.getTime() + remainingAtPlan * 86400000);
        diffDays = Math.round((projected - target) / 86400000);
    } else {
        const maxEst = Math.max(plannedDays + maxPipe, maxPipe * 2);
        const totalDaysEst = Math.min(Math.max(daysElapsed, velocityTotal), maxEst);
        projected = new Date(start.getTime() + totalDaysEst * 86400000);
        diffDays = Math.round((projected - target) / 86400000);
        capped = velocityTotal > maxEst;
    }

    return {
        diffDays,
        projected,
        target,
        progress: dispProg,
        stage: ns,
        capped,
    };
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
        if (typeof getProjectLifecycle === 'function' && getProjectLifecycle(p).phase === 'post_live') return;

        const release = p.release_date ? parseSmartDate(p.release_date) : null;
        const start   = p.start_date ? parseSmartDate(p.start_date) : null;
        const hasRelease = release && !isNaN(release.getTime());
        const daysToRelease = hasRelease ? Math.ceil((release - today) / 86400000) : null;
        const daysOld = start && !isNaN(start.getTime()) ? Math.ceil((today - start) / 86400000) : null;
        const enriched = { ...p, daysToRelease: daysToRelease ?? null };

        if (hasRelease && daysToRelease < 0) {
            overdue.push({ ...enriched, daysOverdue: Math.abs(daysToRelease) });
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
                    capped: !!pred.capped,
                });
            } else if (
                // Bug #5 fix: 0% progress + imminent deadline → at_risk (prediction returns null for 0% progress)
                featureOn('AT_RISK_ZERO_PROGRESS')
                && projectDisplayProgress(p) <= 0
                && releaseSoon
            ) {
                at_risk.push({
                    ...enriched,
                    diffDays: 0,
                    projected: new Date(today.getTime() + threshold * 86400000),
                    target: release,
                    predProgress: 0,
                });
            } else if (releaseSoon) {
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
function clickUpStageFromStatus(statusStr, isDone, ws) {
    if (isDone) return 'Live';
    const low = String(statusStr || '').trim().toLowerCase();
    const workspace = ws || (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    const customMap = workspace.clickupStatusMap;
    if (customMap && customMap[low]) return customMap[low];
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

/** Map status to workspace clickupStageFlow step (heatmap) or normalized funnel bucket. */
function clickUpFlowStage(statusStr, isDone, ws) {
    if (isDone) return 'Live';
    const low = String(statusStr || '').trim().toLowerCase();
    const flow = getWorkspaceStageFlow(ws);
    if (isClickUpWorkspace(ws) && flow.length) {
        const flowMap = {
            'brief': 'Brief', 'planning': 'Brief', 'to do': 'Brief', 'todo': 'Brief', 'open': 'Brief',
            'content': 'Content', 'in progress': 'Content',
            'design': 'Design',
            'review': 'Review', 'in review': 'Review', 'qa': 'Review',
            'publish': 'Publish', 'staging': 'Publish', 'release': 'Publish',
        };
        if (flowMap[low]) return flowMap[low];
        const workspace = ws || (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
        if (workspace.clickupStatusMap && workspace.clickupStatusMap[low]) {
            const norm = workspace.clickupStatusMap[low];
            const normToFlow = {
                Planning: 'Brief', Development: 'Content', QA: 'Review', Release: 'Publish', Live: 'Live', Backlog: 'Brief',
            };
            if (normToFlow[norm]) return normToFlow[norm];
        }
    }
    return clickUpStageFromStatus(statusStr, isDone, ws);
}

function parseClickUpTimestamp(ts) {
    if (!ts) return '';
    const d = new Date(parseInt(ts, 10));
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
}

/** Progress from checklist items when Progress custom field is empty. */
function clickUpChecklistProgress(checklists) {
    if (!Array.isArray(checklists) || !checklists.length) return null;
    let total = 0;
    let done = 0;
    checklists.forEach(cl => {
        (cl.items || []).forEach(item => {
            total += 1;
            if (item.resolved) done += 1;
        });
    });
    return total ? Math.round((done / total) * 100) : null;
}

function clickUpAssigneeName(assignees, index) {
    const a = assignees && assignees[index];
    if (!a) return '';
    return String(a.username || a.email || a.name || '').trim();
}

/** All valid assignee display names from a ClickUp assignees array. */
function clickUpAllAssigneeNames(assignees) {
    if (!Array.isArray(assignees) || !assignees.length) return [];
    const out = [];
    const seen = new Set();
    assignees.forEach(a => {
        const n = String(a?.username || a?.email || a?.name || '').trim();
        if (!isValidResourceName(n)) return;
        const key = n.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        out.push(n);
    });
    return out;
}

function isClickUpWorkspace(ws) {
    return !!(ws && ws.integrationType === 'clickup');
}

/**
 * Digital Marketing / ClickUp — people roster from task + subtask assignees
 * when no Database Google Sheet is configured for the workspace.
 */
function buildClickUpAssigneeRoster(projects, ws) {
    const workspace = ws || (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    const role = getContentCreatorRoleName(workspace);
    const seen = new Set();
    const employees = [];

    function add(name) {
        const trimmed = String(name || '').trim();
        if (!isValidResourceName(trimmed)) return;
        const key = normalizePersonKey(trimmed);
        if (!key || seen.has(key)) return;
        seen.add(key);
        employees.push({
            id: `cu-${key.replace(/\s+/g, '-')}`,
            name: trimmed,
            nameKey: key,
            department: '—',
            designation: '—',
            roleFamily: role,
            intelRoles: [role],
            fromClickUp: true,
        });
    }

    (projects || []).forEach(p => {
        splitAssigneeNames(p.developer).forEach(add);
        splitAssigneeNames(p.owner).forEach(add);
        (p.roadmap?.assignments || []).forEach(sa => {
            splitAssigneeNames(sa.person).forEach(add);
        });
    });

    return employees.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Digital Marketing (and similar ClickUp workspaces): all people are Content Creators.
 * Streak / Sheets keep engineering roles (Developer, QA, BA, …).
 */
function isContentCreatorWorkspace(ws) {
    const w = ws || (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    if (w.roleModel === 'content_creator' || w.peopleModel === 'content_creators') return true;
    if (w.id === 'digital_marketing') return true;
    return false;
}

function getContentCreatorRoleName(ws) {
    const w = ws || (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    return (w.contentCreatorRole && String(w.contentCreatorRole).trim()) || 'Content Creator';
}

/** Roles used by Resource Intelligence / capacity for the active workspace. */
function getIntelRoles(ws) {
    if (isContentCreatorWorkspace(ws)) {
        return [getContentCreatorRoleName(ws)];
    }
    return ['Developer', 'QA', 'BA', 'Owner', 'Page owner'];
}

/** Primary work role for assignment suggestions (Developer vs Content Creator). */
function getPrimaryWorkRole(ws) {
    if (isContentCreatorWorkspace(ws)) return getContentCreatorRoleName(ws);
    return 'Developer';
}

/** Streak uses STAGE_FLOW; ClickUp workspaces may define clickupStageFlow. */
function getWorkspaceStageFlow(ws) {
    const w = ws || (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    if (isClickUpWorkspace(w) && Array.isArray(w.clickupStageFlow) && w.clickupStageFlow.length) {
        return w.clickupStageFlow;
    }
    return typeof STAGE_FLOW !== 'undefined' ? STAGE_FLOW : [];
}

/** Overview funnel stage order — engineering pipeline vs ClickUp marketing flow. */
const STREAK_FUNNEL_STAGES = ['Planning', 'Development', 'QA', 'Release', 'Live'];

function getFunnelStages(ws) {
    const w = ws || (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    if (isClickUpWorkspace(w) && Array.isArray(w.clickupStageFlow) && w.clickupStageFlow.length) {
        return w.clickupStageFlow.map(f => f.stage);
    }
    return STREAK_FUNNEL_STAGES.slice();
}

/** Bar colors for Overview Stage Funnel (aligned with Analytics heatmap). */
function getFunnelStageColors(ws) {
    const w = ws || (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    if (isClickUpWorkspace(w) && w.clickupStageFlow?.length) {
        return {
            Brief: '#A78BFA', Content: '#818CF8', Design: '#60A5FA',
            Review: '#34D399', Publish: '#10B981', Live: '#1E8E3E',
        };
    }
    return {
        Planning: '#8B5CF6', Development: '#1A73E8', QA: '#F9AB00',
        Release: '#EF4444', Live: '#1E8E3E',
    };
}

/** Label for analytics/funnel units: pages (Sheets) vs tasks/deliverables (ClickUp). */
function deliveryUnitWord(plural) {
    const ws = (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    if (!isClickUpWorkspace(ws)) return plural ? 'pages' : 'page';
    const projects = (typeof AppState !== 'undefined' && AppState.allProjects) || [];
    const hasDeliverables = projects.some(p =>
        p.roadmap?.source === 'clickup' && Array.isArray(p.roadmap?.pages) && p.roadmap.pages.length
    );
    if (hasDeliverables) return plural ? 'deliverables' : 'deliverable';
    return plural ? 'tasks' : 'task';
}

function pluralDeliveryUnits(n) {
    const w = deliveryUnitWord(n !== 1);
    return `${n} ${w}`;
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

function mapClickUpTaskToProject(task, ws) {
    const workspace = ws || (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    const id = task.id || `CU-${Math.random().toString(36).substr(2, 9)}`;
    const name = task.name || 'Unnamed ClickUp Task';
    const useListClient = featureOn('CLICKUP_LIST_AS_CLIENT');
    const useDoneStatus = featureOn('CLICKUP_DONE_STATUS');
    const isDone = useDoneStatus && clickUpTaskIsDone(task);
    const listLabel = clickUpListName(task);

    const parseTs = parseClickUpTimestamp;

    const start_date = parseTs(task.start_date);
    const release_date = parseTs(task.due_date);
    const statusRaw = task.status?.status || 'Planning';

    const stage = useDoneStatus
        ? clickUpStageFromStatus(statusRaw, isDone, workspace)
        : normalizeStage(statusRaw);
    let status = isDone
        ? 'on_track'
        : normalizeStatus(statusRaw || 'on_track');
    
    const creatorMode = isContentCreatorWorkspace(workspace);
    const allAssignees = clickUpAllAssigneeNames(task.assignees);
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
    let customHealth = '';

    if (creatorMode) {
        // All ClickUp assignees are Content Creators — store joined names in developer
        // so existing analytics/resource paths that read `developer` keep working.
        owner = allAssignees[0] || 'Unassigned';
        developer = allAssignees.length ? allAssignees.join(', ') : 'Unassigned';
        qa_engineer = '—';
        ba = '—';
    } else if (task.assignees && task.assignees.length > 0) {
        owner = clickUpAssigneeName(task.assignees, 0) || 'Unassigned';
        developer = clickUpAssigneeName(task.assignees, 1) || 'Unassigned';
        qa_engineer = clickUpAssigneeName(task.assignees, 2) || 'Unassigned';
    }

    if (task.custom_fields && Array.isArray(task.custom_fields)) {
        task.custom_fields.forEach(f => {
            const fname = (f.name || '').toLowerCase().replace(/[\s_-]+/g, '');
            const val = f.value;
            if (val == null || val === '') return;

            if (fname === 'owner' || fname === 'pm') {
                owner = String(val);
            } else if (!creatorMode && (fname === 'developer' || fname === 'dev')) {
                developer = String(val);
            } else if (!creatorMode && (fname === 'qa' || fname === 'qaengineer')) {
                qa_engineer = String(val);
            } else if (!creatorMode && (fname === 'ba' || fname === 'businessanalyst')) {
                ba = String(val);
            } else if (fname === 'client' || fname === 'pagename') {
                if (val) client = String(val);
            } else if (fname === 'progress' || fname === 'percent' || fname === 'progress%') {
                progress = parseInt(val, 10) || 0;
            } else if (fname === 'priority') {
                priority = String(val);
            } else if (fname === 'totalpages') {
                total_pages = parseInt(val, 10) || 0;
            } else if (fname === 'completedpages') {
                completed_pages = parseInt(val, 10) || 0;
            } else if (fname === 'actuallivedate' || fname === 'golivedate') {
                actual_live_date = String(val);
            } else if (fname === 'status' || fname === 'health') {
                customHealth = String(val);
            }
        });
    }

    if (customHealth && !isDone) {
        status = normalizeStatus(customHealth);
    }

    const clPct = clickUpChecklistProgress(task.checklists);
    if (progress === 0) {
        if (stage === 'Live' || isDone) progress = 100;
        else if (total_pages > 0) {
            progress = Math.round((completed_pages / total_pages) * 100);
        } else if (clPct != null) {
            progress = clPct;
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
        rawStage: statusRaw,
        funnelStage: clickUpFlowStage(statusRaw, isDone, workspace),
        status,
        progress,
        start_date,
        release_date,
        priority: normalizePriority(priority),
        ba,
        page_owner: featureOn('CLICKUP_PAGE_OWNER_FIX') ? '—' : owner,  // Bug #2 fix: avoid double-counting in resource map
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
        clickupMeta: {
            url: task.url || '',
            checklists: task.checklists || [],
            subtasks: task.subtasks || [],
            customFields: task.custom_fields || [],
        },
    };
    if (useDoneStatus) out.clickupComplete = !!isDone;
    if (useListClient && listLabel) out.clickupList = listLabel;
    out._clickupRaw = task;
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
            tags: [{ name: 'SEO' }, { name: 'Marketing' }],
            checklists: [{
                name: 'SEO checklist',
                items: [
                    { name: 'Sitemap submitted', resolved: true },
                    { name: 'Robots.txt updated', resolved: true },
                    { name: 'Core Web Vitals pass', resolved: false },
                ],
            }],
            subtasks: [
                {
                    id: 'cu-seo-sub-1',
                    name: 'Keyword gap analysis',
                    status: { status: 'complete', type: 'closed' },
                    date_closed: getOffsetDateStr(-8),
                    start_date: getOffsetDateStr(-18),
                    due_date: getOffsetDateStr(-8),
                    assignees: [{ username: 'Bob Smith' }],
                },
                {
                    id: 'cu-seo-sub-2',
                    name: 'Meta tag optimization',
                    status: { status: 'in progress', type: 'custom' },
                    start_date: getOffsetDateStr(-10),
                    due_date: getOffsetDateStr(5),
                    assignees: [{ username: 'Alice Johnson' }],
                },
                {
                    id: 'cu-seo-sub-3',
                    name: 'Backlink audit report',
                    status: { status: 'to do', type: 'open' },
                    due_date: getOffsetDateStr(12),
                    assignees: [{ username: 'Bob Smith' }],
                },
            ],
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
    const urlArg = String(sheetUrl || '').trim();

    // ClickUp workspace must not fall through to the Streak SHEET_CSV_URL.
    if (ws.integrationType === 'clickup') {
        console.log(`[Atlas] Loading ClickUp workspace: ${ws.name}`);
        const tasks = await loadClickUpTasks(ws.clickupListId, ws.clickupToken);
        const projects = tasks.map(t => mapClickUpTaskToProject(t, ws));
        console.log(`[Atlas] Loaded ${projects.length} ClickUp tasks as projects ✓`);
        return { projects, source: 'clickup' };
    }

    const url = (urlArg || (ws.sheetUrl || '') || CONFIG.SHEET_CSV_URL || '').trim();
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
        u.searchParams.set('single', 'true');
        return u.toString();
    } catch (e) {
        console.warn('[Atlas] buildDetailSheetCsvUrl failed:', e);
        return null;
    }
}

/** Normalize person name for roster ↔ delivery resource map matching. */
function normalizePersonKey(name) {
    return String(name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Prefer the longer / more complete display name when merging aliases. */
function pickPersonDisplayName(a, b) {
    const ta = String(a || '').trim();
    const tb = String(b || '').trim();
    if (!ta) return tb;
    if (!tb) return ta;
    const at = normalizePersonKey(ta).split(' ').filter(Boolean);
    const bt = normalizePersonKey(tb).split(' ').filter(Boolean);
    return bt.length > at.length ? tb : ta;
}

/** True when two normalized name keys refer to the same person (abbreviated vs full name). */
function personNameTokens(key) {
    return String(key || '').split(' ').filter(t => t.length > 0);
}

/** Shorter name is an exact token-prefix of longer (min 2 tokens); never merge first-name-only. */
function personKeysSoftMatch(ak, bk) {
    if (!ak || !bk) return false;
    if (ak === bk) return true;
    const at = personNameTokens(ak);
    const bt = personNameTokens(bk);
    function isTokenSubset(sub, sup) {
        if (sub.length < 2 || sub.length >= sup.length) return false;
        for (let i = 0; i < sub.length; i++) {
            if (sub[i] !== sup[i]) return false;
        }
        return true;
    }
    return isTokenSubset(at, bt) || isTokenSubset(bt, at);
}

function personNamesSoftMatch(a, b) {
    return personKeysSoftMatch(normalizePersonKey(a), normalizePersonKey(b));
}

/** One row per person when the same person appears with spacing variants. */
function uniqueRosterEmployees(employees) {
    const byCompact = new Map();
    (employees || []).forEach(emp => {
        const name = String(emp.name || '').trim();
        if (!name) return;
        const compact = normalizePersonKey(name).replace(/\s+/g, '');
        if (!compact) return;
        const cur = byCompact.get(compact);
        if (!cur) {
            byCompact.set(compact, { ...emp, name });
            return;
        }
        cur.name = pickPersonDisplayName(cur.name, name);
    });
    return [...byCompact.values()];
}

/** Match Delivery-tab spelling → exact Name from Database sheet. */
function buildRosterNameResolver(employees) {
    const entries = uniqueRosterEmployees(employees)
        .map(emp => String(emp.name || '').trim())
        .filter(Boolean)
        .map(exact => ({
            exact,
            key: normalizePersonKey(exact),
            compact: normalizePersonKey(exact).replace(/\s+/g, ''),
        }));

    return function resolveDeliveryName(raw) {
        const trimmed = String(raw || '').trim();
        if (!trimmed || !entries.length) return trimmed;
        const key = normalizePersonKey(trimmed);
        const compact = key.replace(/\s+/g, '');

        for (const e of entries) {
            if (e.key === key) return e.exact;
        }
        for (const e of entries) {
            if (e.compact && e.compact === compact) return e.exact;
        }
        for (const e of entries) {
            if (personKeysSoftMatch(key, e.key)) return e.exact;
        }
        return trimmed;
    };
}

/** Merge duplicate person entries that differ only by name spelling / length. */
function consolidateResourceMapPeople(map) {
    const names = Object.keys(map);
    const used = new Set();
    names.forEach(name => {
        if (used.has(name)) return;
        const group = [name];
        used.add(name);
        const nk = normalizePersonKey(name);
        names.forEach(other => {
            if (used.has(other)) return;
            if (personKeysSoftMatch(nk, normalizePersonKey(other))) {
                group.push(other);
                used.add(other);
            }
        });
        if (group.length <= 1) return;
        const canonical = group.reduce((best, n) => pickPersonDisplayName(best, n), group[0]);
        const merged = map[canonical] || {
            name: canonical, assignments: [], activeCount: 0, conflicts: [], freeFrom: null,
        };
        merged.name = canonical;
        group.forEach(n => {
            if (n === canonical || !map[n]) return;
            merged.assignments.push(...map[n].assignments);
            merged.conflicts.push(...map[n].conflicts);
            delete map[n];
        });
        map[canonical] = merged;
    });
}

/** Guess role family from designation / department for capacity caps. */
function roleFamilyFromDesignation(designation, department) {
    const d = `${designation || ''} ${department || ''}`.toLowerCase();
    if (/\bqa\b|quality/.test(d)) return 'QA';
    if (/\bba\b|business analyst|product owner/.test(d)) return 'BA';
    if (/marketing|branding|content|seo|social/.test(d)) return 'Content Creator';
    if (/ui|ux|design/.test(d)) return 'Developer';
    if (/devops|sre|infra/.test(d)) return 'Developer';
    if (/project management|delivery|engineering manager|scrum/.test(d)) return 'Owner';
    if (/director|leadership|hr|finance/.test(d)) return 'Owner';
    if (/software|developer|engineer|architect|technical/.test(d)) return 'Developer';
    return 'Developer';
}

function getResourceManagementConfig(ws) {
    const w = ws || (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    return w.resourceManagement || CONFIG.RESOURCE_MANAGEMENT || null;
}

function getResourceManagementSheetUrl(ws) {
    const cfg = getResourceManagementConfig(ws);
    if (!cfg) return '';
    if (cfg.csvUrl) return String(cfg.csvUrl).trim();
    const w = ws || (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    const base = w.sheetUrl || CONFIG.SHEET_CSV_URL || '';
    if (cfg.gid) return buildDetailSheetCsvUrl(cfg.gid, base) || '';
    return '';
}

function getDatabaseSheetConfig(ws) {
    const w = ws || (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    return w.database || CONFIG.DATABASE || null;
}

function getDatabaseSheetUrl(ws) {
    const cfg = getDatabaseSheetConfig(ws);
    if (!cfg) return '';
    if (cfg.csvUrl) return String(cfg.csvUrl).trim();
    const w = ws || (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    const base = w.sheetUrl || CONFIG.SHEET_CSV_URL || '';
    if (cfg.gid) return buildDetailSheetCsvUrl(cfg.gid, base) || '';
    return '';
}

/**
 * Parse Database tab — unique people from Developer, QA, Project Owner - BA, Marketing/SEO columns.
 * Each person carries intelRoles[] for capacity / intake pools.
 */
function parseDatabaseSheetCSV(csvText) {
    const table = parseGenericTableCSV(csvText);
    const headers = table.headers || [];
    const hlist = headers.map(h => normalizeHeaderForMatch(h));
    const roleColumns = [
        { idx: findSiblingCol(hlist, ['developer', 'dev']), role: 'Developer' },
        { idx: findSiblingCol(hlist, ['qa', 'qa_engineer', 'q_a']), role: 'QA' },
        { idx: findSiblingCol(hlist, ['project owner - ba', 'project_owner_-_ba', 'page_owner', 'ba']), role: 'BA' },
        { idx: findSiblingCol(hlist, ['marketing/seo', 'marketing_seo', 'marketing', 'seo']), role: 'Page owner' },
    ].filter(rc => rc.idx >= 0);

    const byKey = new Map();
    roleColumns.forEach(({ idx, role }) => {
        (table.rows || []).forEach(row => {
            const raw = roadmapCell(row, idx);
            splitAssigneeNames(raw).forEach(name => {
                const trimmed = String(name || '').trim();
                if (!isValidResourceName(trimmed)) return;
                const key = normalizePersonKey(trimmed);
                if (!key) return;
                let emp = byKey.get(key);
                if (!emp) {
                    emp = {
                        id: `db-${key.replace(/\s+/g, '-')}`,
                        name: trimmed,
                        nameKey: key,
                        department: '—',
                        designation: '—',
                        roleFamily: role === 'Developer' ? 'Developer' : role,
                        intelRoles: new Set(),
                        fromDatabase: true,
                    };
                    byKey.set(key, emp);
                }
                emp.intelRoles.add(role);
                if (role === 'Developer') emp.roleFamily = 'Developer';
            });
        });
    });

    return [...byKey.values()]
        .map(e => ({ ...e, intelRoles: [...e.intelRoles].sort() }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Parse Resource-management tab CSV into employee roster rows.
 * Expected columns: Sl.No, Name, Department, Designation, Years at Valoriz, External Experience
 */
function parseResourceManagementCSV(csvText) {
    const table = parseGenericTableCSV(csvText);
    const headers = table.headers || [];
    const norm = headers.map(h => normalizeHeaderForMatch(h));
    const idx = (aliases) => {
        for (const a of aliases) {
            const i = norm.indexOf(a);
            if (i >= 0) return i;
        }
        return -1;
    };
    const iNo = idx(['sl_no', 'sl.no', 'sno', 'si_no', 'id', 'employee_id', 'emp_id']);
    const iName = idx(['name', 'employee_name', 'full_name', 'employee']);
    const iDept = idx(['department', 'dept', 'team']);
    const iDesig = idx(['designation', 'title', 'role', 'job_title']);
    const iYears = idx(['years_at_valoriz', 'years_at_company', 'company_years', 'tenure']);
    const iExt = idx(['external_experience', 'prior_experience', 'total_experience', 'experience']);

    if (iName < 0) return [];

    return (table.rows || []).map((row, rowIdx) => {
        const name = String(row[iName] || '').trim();
        if (!name) return null;
        const department = iDept >= 0 ? String(row[iDept] || '').trim() : '';
        const designation = iDesig >= 0 ? String(row[iDesig] || '').trim() : '';
        const yearsAtCompany = iYears >= 0 ? parseFloat(String(row[iYears] || '').replace(/,/g, '')) : null;
        const externalExp = iExt >= 0 ? parseFloat(String(row[iExt] || '').replace(/,/g, '')) : null;
        const totalExp = (Number.isFinite(yearsAtCompany) ? yearsAtCompany : 0)
            + (Number.isFinite(externalExp) ? externalExp : 0);
        const code = iNo >= 0 && String(row[iNo] || '').trim()
            ? String(row[iNo]).trim()
            : String(rowIdx + 1);
        return {
            id: `emp-${code}-${normalizePersonKey(name).replace(/\s+/g, '-')}`,
            employeeCode: code,
            name,
            nameKey: normalizePersonKey(name),
            department: department || '—',
            designation: designation || '—',
            yearsAtCompany: Number.isFinite(yearsAtCompany) ? yearsAtCompany : null,
            externalExperience: Number.isFinite(externalExp) ? externalExp : null,
            totalExperience: totalExp > 0 ? Math.round(totalExp * 10) / 10 : null,
            roleFamily: roleFamilyFromDesignation(designation, department),
        };
    }).filter(Boolean);
}

/**
 * Join roster employees with delivery resource map (projects, conflicts, freeFrom).
 */
function enrichResourceRoster(employees, resourceMap) {
    const map = resourceMap || {};
    const byKey = {};
    Object.values(map).forEach(p => {
        const k = normalizePersonKey(p.name);
        if (k) byKey[k] = p;
    });

    return (employees || []).map(emp => {
        let person = byKey[emp.nameKey];
        if (!person) {
            person = Object.values(map).find(p =>
                personNamesSoftMatch(emp.name, p.name)
            ) || null;
        }

        const activeCount = person ? (person.activeCount || 0) : 0;
        const assignments = person
            ? (person.assignments || []).filter(a => !a.completed)
            : [];
        const conflicts = person ? (person.conflicts || []) : [];
        const maxCap = typeof getRoleCapacityMax === 'function'
            ? getRoleCapacityMax(emp.roleFamily)
            : 2;
        const utilPct = maxCap > 0
            ? Math.min(100, Math.round((activeCount / maxCap) * 100))
            : 0;

        let availability = 'Bench';
        if (activeCount <= 0) availability = 'Bench';
        else if (utilPct >= 85) availability = 'Fully Allocated';
        else availability = 'Partially Allocated';

        return {
            ...emp,
            matchedDeliveryName: person ? person.name : null,
            activeCount,
            assignments,
            conflicts,
            freeFrom: person ? person.freeFrom : null,
            utilPct,
            availability,
            maxCapacity: maxCap,
        };
    });
}

function computeResourceRosterSummary(roster) {
    const list = roster || [];
    const byDept = {};
    let allocated = 0;
    let bench = 0;
    let partial = 0;
    let conflicts = 0;
    let freeing30 = 0;
    const today = typeof startOfDay === 'function' ? startOfDay(new Date()) : new Date();
    const cut = today.getTime() + 30 * 86400000;

    list.forEach(e => {
        byDept[e.department] = (byDept[e.department] || 0) + 1;
        if (e.availability === 'Bench') bench += 1;
        else if (e.availability === 'Fully Allocated') allocated += 1;
        else {
            partial += 1;
            allocated += 1;
        }
        if (e.conflicts && e.conflicts.length) conflicts += 1;
        if (e.freeFrom && e.freeFrom.getTime && e.freeFrom.getTime() <= cut && e.activeCount > 0) {
            freeing30 += 1;
        }
    });

    const avgUtil = list.length
        ? Math.round(list.reduce((s, e) => s + (e.utilPct || 0), 0) / list.length)
        : 0;

    return {
        total: list.length,
        allocated,
        bench,
        partial,
        conflicts,
        freeing30,
        avgUtil,
        byDepartment: byDept,
    };
}

async function loadResourceManagementRoster(ws) {
    if (typeof featureOn === 'function' && !featureOn('RESOURCE_TRACKER')) {
        return { employees: [], meta: { skipped: true } };
    }
    const url = getResourceManagementSheetUrl(ws);
    if (!url) {
        return { employees: [], meta: { error: 'Resource-management sheet not configured for this workspace.' } };
    }
    try {
        const response = await fetch(sheetFetchUrl(url), SHEET_FETCH_OPTIONS);
        if (!response.ok) {
            return { employees: [], meta: { error: `HTTP ${response.status} loading Resource-management sheet.` } };
        }
        const employees = parseResourceManagementCSV(await response.text());
        const cfg = getResourceManagementConfig(ws) || {};
        return {
            employees,
            meta: {
                loadedAt: new Date().toISOString(),
                source: cfg.tabName || 'Resource-management',
                count: employees.length,
                url,
            },
        };
    } catch (e) {
        return { employees: [], meta: { error: e.message || 'Failed to load Resource-management sheet.' } };
    }
}

async function loadDatabaseSheetRoster(ws) {
    const url = getDatabaseSheetUrl(ws);
    if (!url) {
        return { employees: [], meta: { error: 'Database sheet not configured for this workspace.' } };
    }
    try {
        const response = await fetch(sheetFetchUrl(url), SHEET_FETCH_OPTIONS);
        if (!response.ok) {
            return { employees: [], meta: { error: `HTTP ${response.status} loading Database sheet.` } };
        }
        const employees = parseDatabaseSheetCSV(await response.text());
        const cfg = getDatabaseSheetConfig(ws) || {};
        return {
            employees,
            meta: {
                loadedAt: new Date().toISOString(),
                source: cfg.tabName || 'Database',
                count: employees.length,
                url,
            },
        };
    } catch (e) {
        return { employees: [], meta: { error: e.message || 'Failed to load Database sheet.' } };
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

/** Milestone columns live after Planning — avoids matching page-level Start_date / start_date. */
function findSiblingMilestoneCol(hlist, aliases) {
    const planIdx = findSiblingCol(hlist, ['planning', 'planning_date']);
    const startAt = planIdx >= 0 ? planIdx : 0;
    for (const fk of aliases) {
        const want = normalizeHeaderForMatch(fk.replace(/\s+/g, '_'));
        for (let i = startAt; i < hlist.length; i++) {
            if (normalizeHeaderForMatch(hlist[i]) === want) return i;
        }
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
        // Bug #1 fix: only count rows with a real progress value — blank rows were pulling
        // the average toward 0 (pctN incremented even when ps was empty).
        if (!isNaN(n) || !featureOn('SIBLING_AVG_PCT_EXCLUDE_BLANK')) {
            pctSum += !isNaN(n) ? Math.min(100, Math.max(0, n)) : 0;
            pctN += 1;
        }
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
        const rowDone = stage === 'Live';
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

/**
 * Ordered delivery pipeline. Each sibling row has a date column per milestone marking
 * when the page *entered* that stage. Time spent in a stage = (next milestone date − this
 * milestone date). Aliases cover the two sheet schemas seen in the wild:
 *   - newer: Planning, Start, Story_Req, UI_Dev, Streak_Dev, Streak_QA, Live
 *   - older: Planning_Date, Content Start Date, Story_Req_Date, UI_Start_Date,
 *            Dev_Start_Date, QA_Start_Date, Actual Live Date
 */
const STAGE_FLOW = [
    { stage: 'Planning',   aliases: ['planning', 'planning_date'] },
    { stage: 'Content',    aliases: ['start', 'start_date', 'content_start_date', 'content_start'] },
    { stage: 'Story Req',  aliases: ['story_req', 'story_req_date'] },
    { stage: 'UI Dev',     aliases: ['ui_dev', 'ui_start_date', 'ui_start'] },
    { stage: 'Streak Dev', aliases: ['streak_dev', 'dev_start_date', 'dev_start'] },
    { stage: 'Streak QA',  aliases: ['streak_qa', 'qa_start_date', 'qa_start'] },
    { stage: 'Live',       aliases: ['live', 'actual_live_date', 'go_live', 'live_date'] },
];

/**
 * Planned delivery expectation per stage: days between consecutive milestone dates on the
 * sibling row (each column = planned date the page enters that stage). Does NOT use today.
 */
function computeRowStageExpectations(row, flowCols, yearHint) {
    const dates = {};
    flowCols.forEach(fc => {
        if (fc.idx < 0) return;
        const raw = roadmapCell(row, fc.idx);
        if (!raw) return;
        const ms = parseMilestoneMs(raw, yearHint);
        if (!isNaN(ms)) dates[fc.stage] = ms;
    });
    const expectations = [];
    for (let i = 0; i < flowCols.length - 1; i++) {
        const stage = flowCols[i].stage;
        const next = flowCols[i + 1].stage;
        const ms0 = dates[stage];
        const ms1 = dates[next];
        if (ms0 == null || ms1 == null) continue;
        const days = Math.round((ms1 - ms0) / 86400000);
        if (days >= 0) expectations.push({ stage, days });
    }
    let pipelineExpectedDays = null;
    if (dates['Planning'] != null && dates['Live'] != null) {
        const total = Math.round((dates['Live'] - dates['Planning']) / 86400000);
        if (total >= 0) pipelineExpectedDays = total;
    }
    return { expectations, reachedLive: dates['Live'] != null, pipelineExpectedDays };
}

/** Max sane duration for one stage interval / full pipeline (guards bad sheet dates). */
const MAX_STAGE_DAYS = 180;
const MAX_PIPELINE_DAYS = 730;

const MONTH_PARSE = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };

function milestoneYearHint(row, idxRelease, idxStart, idxLive) {
    for (const idx of [idxLive, idxRelease, idxStart]) {
        if (idx < 0) continue;
        const d = parseSmartDate(roadmapCell(row, idx));
        if (!isNaN(d.getTime()) && d.getFullYear() >= 2020) return d.getFullYear();
    }
    return new Date().getFullYear();
}

/** Parse a milestone cell; fills missing year from release/live/start on the same row. */
function parseMilestoneMs(raw, yearHint) {
    const t = String(raw || '').trim();
    if (!t || isPlaceholderDate(t)) return NaN;
    const partial = t.match(/^(\d{1,2})-([A-Za-z]{3,9})$/i);
    if (partial && yearHint) {
        const mo = MONTH_PARSE[partial[2].toLowerCase().slice(0, 3)];
        if (mo !== undefined) {
            return startOfDay(new Date(yearHint, mo, parseInt(partial[1], 10))).getTime();
        }
    }
    const d = parseSmartDate(t);
    return isNaN(d.getTime()) ? NaN : startOfDay(d).getTime();
}

function pushStageDuration(durations, stage, days, ongoing) {
    if (days < 0 || days > MAX_STAGE_DAYS) return;
    durations.push({ stage, days, ongoing: !!ongoing });
}

/**
 * Map sibling row Stage column value to a STAGE_FLOW pipeline step (for duration logic).
 */
function mapToFlowStage(rawStage) {
    const low = String(rawStage || '').trim().toLowerCase().replace(/_/g, ' ');
    if (!low || low === 'to do' || low === 'todo' || low.includes('backlog') || low.includes('not started')) return 'Planning';
    if (/\blive\b|done|completed/.test(low)) return 'Live';
    if (/streak\s*[-–]?\s*qa|\bqa\b|testing/.test(low)) return 'Streak QA';
    if (/streak\s*[-–]?\s*dev|\bdev\b|development/.test(low)) return 'Streak Dev';
    if (/ui\s*[-–]?\s*dev/.test(low)) return 'UI Dev';
    if (/story/.test(low)) return 'Story Req';
    if (/planning|plan\b/.test(low)) return 'Planning';
    if (/\bstart\b|content/.test(low)) return 'Content';
    if (/release|staging|hyper|-cr\b|\bcr\b/.test(low)) return 'Streak QA';
    return null;
}

/**
 * Actual time spent in each pipeline stage, learned from sibling milestone dates.
 * - Completed stages: next milestone − this milestone (only after the page has reached the next stage).
 * - Current stage (active pages): today − entry date (ongoing).
 * - Live pages: all filled intervals through go-live; no ongoing.
 */
function computeRowStageDurations(row, flowCols, todayMs, rawStage, rowCompleted, liveDateRaw, yearHint) {
    const dates = {};
    flowCols.forEach(fc => {
        if (fc.idx < 0) return;
        const raw = roadmapCell(row, fc.idx);
        if (!raw) return;
        const ms = parseMilestoneMs(raw, yearHint);
        if (!isNaN(ms)) dates[fc.stage] = ms;
    });
    if (rowCompleted && liveDateRaw && dates['Live'] == null) {
        const ms = parseMilestoneMs(liveDateRaw, yearHint);
        if (!isNaN(ms)) dates['Live'] = ms;
    }

    const flowStages = flowCols.map(fc => fc.stage);
    const currentFlow = mapToFlowStage(rawStage);
    let currentIdx = currentFlow ? flowStages.indexOf(currentFlow) : -1;
    const isLive = rowCompleted || currentFlow === 'Live';
    const reachedLive = isLive || dates['Live'] != null;

    if (currentIdx < 0 && !isLive) {
        // Unknown stage label — infer from last dated milestone before gaps
        for (let i = flowStages.length - 1; i >= 0; i--) {
            if (dates[flowStages[i]] != null) { currentIdx = i; break; }
        }
    }

    const durations = [];
    for (let i = 0; i < flowCols.length - 1; i++) {
        const stage = flowCols[i].stage;
        const next = flowCols[i + 1].stage;
        const ms0 = dates[stage];
        if (ms0 == null) continue;

        if (isLive && dates[next] != null) {
            const days = Math.round((dates[next] - ms0) / 86400000);
            pushStageDuration(durations, stage, days, false);
            continue;
        }

        if (currentIdx >= 0) {
            if (i < currentIdx && dates[next] != null) {
                const days = Math.round((dates[next] - ms0) / 86400000);
                pushStageDuration(durations, stage, days, false);
            } else if (i === currentIdx) {
                const days = Math.round((todayMs - ms0) / 86400000);
                pushStageDuration(durations, stage, days, true);
                break;
            }
        }
    }

    let pipelineActualDays = null;
    const sumDur = durations.reduce((s, d) => s + d.days, 0);
    if (reachedLive && dates['Planning'] != null && dates['Live'] != null) {
        const span = Math.round((dates['Live'] - dates['Planning']) / 86400000);
        if (span >= 0 && span <= MAX_PIPELINE_DAYS) pipelineActualDays = span;
    }
    if (pipelineActualDays == null && sumDur > 0 && sumDur <= MAX_PIPELINE_DAYS) {
        pipelineActualDays = sumDur;
    }

    return { durations, reachedLive, pipelineActualDays };
}

/**
 * Per-page delivery records from sibling tab rows (one entry per page row).
 * Used by the Analytics page so metrics reflect page-level delivery, not the master row.
 * Each entry: { page, stage, status, start, release, live, progress, completed }.
 * Dates are raw strings; `live` is only set for completed (gone-live) pages.
 */
function computeSiblingPages(hlist, rows) {
    const ti         = hlist.length ? findSiblingTitleColumnIndex(hlist) : 0;
    const idxStage   = findSiblingCol(hlist, ['stage', 'phase']);
    const idxStatus  = findSiblingCol(hlist, ['status', 'health']);
    const idxStart   = findSiblingCol(hlist, ['start_date', 'project_start_date', 'start']);
    const idxRelease = findSiblingCol(hlist, ['release_date', 'planned_release_date', 'release', 'target_date']);
    const idxLive    = findSiblingCol(hlist, ['actual_live_date', 'live_date', 'go_live', 'live']);
    const idxProgress = findSiblingCol(hlist, ['progress', 'pct', 'percent', '%']);
    const idxDev     = findSiblingCol(hlist, ['developer', 'dev']);
    const idxQa      = findSiblingCol(hlist, ['qa', 'qa_engineer', 'q_a']);
    const flowCols   = STAGE_FLOW.map(f => ({ stage: f.stage, idx: findSiblingMilestoneCol(hlist, f.aliases) }));
    const todayMs    = startOfDay(new Date()).getTime();

    const out = [];
    rows.forEach(row => {
        if (!row.some(cell => cell && String(cell).trim())) return;
        const rawStage = idxStage >= 0 ? roadmapCell(row, idxStage) : '';
        const stage = normalizeStage(rawStage);
        const low = rawStage.toLowerCase();
        const completed = stage === 'Live' || low.includes('live') || low.includes('done') || low.includes('completed');
        const ps = idxProgress >= 0 ? roadmapCell(row, idxProgress) : '';
        const n = parseInt(ps, 10);
        const yearHint = milestoneYearHint(row, idxRelease, idxStart, idxLive);
        const liveRaw = completed && idxLive >= 0 ? roadmapCell(row, idxLive) : '';
        const { durations, reachedLive: reachedActual, pipelineActualDays } = computeRowStageDurations(row, flowCols, todayMs, rawStage, completed, liveRaw, yearHint);
        const { expectations, reachedLive: reachedPlan, pipelineExpectedDays } = computeRowStageExpectations(row, flowCols, yearHint);
        const reachedLive = reachedActual || reachedPlan;
        out.push({
            page:      roadmapCell(row, ti),
            stage,
            rawStage:  rawStage || stage,
            status:    idxStatus >= 0 ? roadmapCell(row, idxStatus) : '',
            start:     idxStart >= 0 ? roadmapCell(row, idxStart) : '',
            release:   idxRelease >= 0 ? roadmapCell(row, idxRelease) : '',
            // Only treat a page as gone-live when its stage says so (avoids pre-filled live dates).
            live:      completed && idxLive >= 0 ? roadmapCell(row, idxLive) : '',
            progress:  !isNaN(n) ? Math.min(100, Math.max(0, n)) : 0,
            developer: idxDev >= 0 ? roadmapCell(row, idxDev) : '',
            qa:        idxQa >= 0 ? roadmapCell(row, idxQa) : '',
            completed,
            stageExpectations: expectations,
            stageDurations: durations,
            pipelineExpectedDays,
            pipelineActualDays,
            reachedLive,
        });
    });
    return out;
}

/** Map a delivery unit to an Overview funnel bucket (workspace-aware). */
function funnelBucketFromUnit(u, ws) {
    const w = ws || (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    if (u?.funnelStage) return u.funnelStage;
    if (isClickUpWorkspace(w)) {
        const raw = u?.rawStage || u?.stage || '';
        const done = !!(u?.reachedLive || u?.completed || normalizeStage(u?.stage || '') === 'Live');
        return clickUpFlowStage(raw, done, w);
    }
    let bucket = normalizeStage(u?.stage || u?.rawStage || '');
    if (bucket === 'Backlog') bucket = 'Planning';
    return bucket;
}

/**
 * Stage Funnel + Overview charts: page counts grouped by pipeline stage.
 * Streak projects → sibling sheet pages; ClickUp / unlinked → one master row each.
 */
function getFunnelStageCounts() {
    const ws = (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    const stages = getFunnelStages(ws);
    const counts = {};
    const overdueByStage = {};
    const alertByStage = {};
    stages.forEach(s => {
        counts[s] = 0;
        overdueByStage[s] = 0;
        alertByStage[s] = 0;
    });

    const today = startOfDay(new Date());
    const units = typeof getAnalyticsUnits === 'function' ? getAnalyticsUnits() : [];

    units.forEach(u => {
        const bucket = funnelBucketFromUnit(u, ws);
        if (!counts.hasOwnProperty(bucket)) return;
        counts[bucket]++;

        if (bucket === 'Live') return;

        const rel = u.release_date ? parseSmartDate(u.release_date) : null;
        const isOverdue = rel && !isNaN(rel.getTime()) && rel < today;
        const st = u.status || '';
        const isAlert = st === 'at_risk' || st === 'delayed';

        if (isOverdue) overdueByStage[bucket]++;
        else if (isAlert) alertByStage[bucket]++;
    });

    return { stages, counts, overdueByStage, alertByStage, total: units.length };
}

/**
 * Analytics "delivery units": page-level rows from the sibling Delivery tab when a project
 * has one (Streak Google-Sheet projects), else the master project row (ClickUp / unlinked).
 * Units are project-shaped so the Analytics builders can treat each like a project.
 */
function getAnalyticsUnits() {
    const projects = (typeof AppState !== 'undefined' && AppState.allProjects) ? AppState.allProjects : [];
    const ws = (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    const units = [];
    projects.forEach(p => {
        const pages = (p.roadmap?.hasSibling && Array.isArray(p.roadmap.pages) && p.roadmap.pages.length)
            ? p.roadmap.pages : null;
        if (pages) {
            pages.forEach(pg => {
                if (!pg.page) return;
                const done = !!(pg.completed || pg.reachedLive || normalizeStage(pg.stage || '') === 'Live');
                const funnelStage = pg.funnelStage
                    || (isClickUpWorkspace(ws)
                        ? clickUpFlowStage(pg.rawStage || pg.stage || '', done, ws)
                        : funnelBucketFromUnit({ stage: pg.stage, rawStage: pg.rawStage }, ws));
                units.push({
                    id:               p.id,
                    name:             `${p.name} · ${pg.page}`,
                    projectName:      p.name,
                    page:             pg.page,
                    client:           p.client,
                    priority:         p.priority,
                    owner:            p.owner,
                    stage:            pg.stage,
                    rawStage:         pg.rawStage || pg.stage,
                    funnelStage,
                    status:           normalizeStatus(pg.status),
                    developer:        pg.developer,
                    qa_engineer:      pg.qa,
                    start_date:       pg.start,
                    release_date:     pg.release,
                    actual_live_date: pg.live,
                    progress:         pg.progress,
                    stageExpectations: pg.stageExpectations || [],
                    stageDurations:   pg.stageDurations || [],
                    pipelineExpectedDays: pg.pipelineExpectedDays,
                    pipelineActualDays: pg.pipelineActualDays,
                    reachedLive:      done,
                    completed:        !!pg.completed,
                    isPage:           true,
                });
            });
        } else {
            const rawStage = (p.rawStage || p.stage || '').trim();
            const done = !!(p.clickupComplete || normalizeStage(p.stage || '') === 'Live');
            const funnelStage = p.funnelStage
                || (isClickUpWorkspace(ws)
                    ? clickUpFlowStage(rawStage, done, ws)
                    : funnelBucketFromUnit({ stage: p.stage, rawStage }, ws));
            units.push({
                id:               p.id,
                name:             p.name,
                projectName:      p.name,
                page:             '',
                client:           p.client,
                priority:         p.priority,
                owner:            p.owner,
                stage:            normalizeStage(p.stage || ''),
                rawStage:         rawStage || normalizeStage(p.stage || ''),
                funnelStage,
                status:           normalizeStatus(p.status),
                developer:        p.developer,
                qa_engineer:      p.qa_engineer,
                start_date:       p.start_date,
                release_date:     p.release_date,
                actual_live_date: p.actual_live_date,
                progress:         typeof projectDisplayProgress === 'function' ? projectDisplayProgress(p) : (p.progress || 0),
                stageExpectations: [],
                stageDurations:   [],
                reachedLive:      done,
                isPage:           false,
            });
        }
    });
    return units;
}

/**
 * Drill-down selector for Analytics charts. Given a chart element (type + value),
 * returns the underlying delivery-page units so the UI can show *what* the numbers are,
 * not just the count. Mirrors the filters used by each Analytics builder.
 * @returns {{ title:string, subtitle:string, units:Array }}
 */
function getAnalyticsDrillUnits(type, value, extra) {
    const units = getAnalyticsUnits();
    const ns = s => normalizeStage(s || '');
    const pd = parseSmartDate;
    const uSing = typeof deliveryUnitWord === 'function' ? deliveryUnitWord(false) : 'page';
    const uPlur = typeof deliveryUnitWord === 'function' ? deliveryUnitWord(true) : 'pages';
    const pluralUnit = (n) => `${n} ${n !== 1 ? uPlur : uSing}`;
    let list = [];
    let title = 'Details';
    let subtitle = '';

    switch (type) {
        case 'stage':
            list = units.filter(u => {
                const bucket = typeof funnelBucketFromUnit === 'function'
                    ? funnelBucketFromUnit(u)
                    : ns(u.stage);
                return bucket === value;
            });
            title = `${value} — ${pluralUnit(list.length)}`;
            subtitle = `Delivery ${uPlur} currently in this stage`;
            break;

        case 'rawstage':
            list = units.filter(u => (u.rawStage || u.stage || '').trim() === value);
            title = `${value} — ${pluralUnit(list.length)}`;
            subtitle = isClickUpWorkspace(AppState?.activeWorkspace)
                ? `${uPlur.charAt(0).toUpperCase() + uPlur.slice(1)} whose ClickUp status is exactly this value`
                : 'Pages whose sheet stage is exactly this value';
            break;

        case 'stagetime': {
            const out = [];
            units.forEach(u => {
                if (value === 'Live') {
                    if (u.reachedLive) {
                        const total = u.pipelineActualDays ?? u.pipelineExpectedDays;
                        out.push({
                            ...u,
                            drillMetric: total != null ? `${total}d total` : 'live',
                        });
                    }
                    return;
                }
                const d = (u.stageDurations || []).find(x => x.stage === value);
                if (d) out.push({ ...u, drillMetric: `${d.days}d${d.ongoing ? ' ⏳' : ''}` });
            });
            out.sort((a, b) => {
                const na = parseInt(String(a.drillMetric), 10) || 0;
                const nb = parseInt(String(b.drillMetric), 10) || 0;
                return nb - na;
            });
            list = out;
            title = `${value} benchmark — ${pluralUnit(list.length)}`;
            subtitle = `Actual days in this stage (completed intervals + ongoing for active ${uPlur})`;
            break;
        }

        case 'velocity': {
            const [yy, mm] = String(value).split('-').map(Number);
            list = units.filter(u => {
                if (!u.actual_live_date) return false;
                const d = pd(u.actual_live_date);
                return !isNaN(d.getTime()) && d.getFullYear() === yy && d.getMonth() === mm;
            });
            if (extra === 'ontime' || extra === 'late') {
                list = list.filter(u => {
                    const d = pd(u.actual_live_date);
                    const rel = u.release_date ? pd(u.release_date) : null;
                    const onTime = rel && !isNaN(rel.getTime()) && d <= rel;
                    return extra === 'ontime' ? onTime : !onTime;
                });
            }
            const lbl = isNaN(yy) ? value : new Date(yy, mm, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
            title = `Launched in ${lbl} — ${list.length}`;
            subtitle = extra === 'ontime' ? 'On-time go-lives'
                : extra === 'late' ? 'Late go-lives'
                : 'All go-lives this month';
            break;
        }

        case 'developer':
            list = units.filter(u => ns(u.stage) !== 'Live'
                && splitAssigneeNames(u.developer).some(n => n === value));
            title = `${value} — ${pluralUnit(list.length)} active`;
            subtitle = `Active (non-Live) ${uPlur} assigned to this developer`;
            break;

        case 'ontime':
            list = units.filter(u => {
                if (ns(u.stage) !== 'Live' || !u.release_date || !u.actual_live_date) return false;
                const rel = pd(u.release_date), live = pd(u.actual_live_date);
                return !isNaN(rel.getTime()) && !isNaN(live.getTime()) && live <= rel;
            });
            title = `On-time deliveries — ${list.length}`;
            subtitle = `Live ${uPlur} that met their due date`;
            break;

        case 'delayed':
            list = units.filter(u => {
                if (ns(u.stage) !== 'Live' || !u.release_date || !u.actual_live_date) return false;
                const rel = pd(u.release_date), live = pd(u.actual_live_date);
                return !isNaN(rel.getTime()) && !isNaN(live.getTime()) && live > rel;
            });
            title = `Delayed deliveries — ${list.length}`;
            subtitle = `Live ${uPlur} that missed their due date`;
            break;

        case 'velocity30': {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const ago = new Date(today); ago.setDate(today.getDate() - 30);
            list = units.filter(u => {
                if (ns(u.stage) !== 'Live' || !u.actual_live_date) return false;
                const d = pd(u.actual_live_date);
                return !isNaN(d.getTime()) && d >= ago && d <= today;
            });
            title = `Went live in last 30 days — ${list.length}`;
            subtitle = 'Recent go-lives';
            break;
        }

        case 'pipeline':
            list = units.filter(u => !['Live', 'Backlog'].includes(ns(u.stage)));
            if (extra === 'ontrack') list = list.filter(u => u.status === 'on_track');
            title = `Active pipeline — ${pluralUnit(list.length)}`;
            subtitle = extra === 'ontrack' ? `On-track active ${uPlur}` : `All active (non-Live) ${uPlur}`;
            break;

        default:
            list = units;
            title = `All pages — ${list.length}`;
    }

    return { title, subtitle, units: list };
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
    const ws = (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    if (isClickUpWorkspace(ws)) {
        if (p?.funnelStage) return p.funnelStage;
        const raw = p?.rawStage || '';
        const done = !!(p?.clickupComplete || normalizeStage(p?.stage || '') === 'Live');
        return clickUpFlowStage(raw, done, ws);
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

async function fetchClickUpTaskDetail(taskId, token) {
    if (!taskId || !token || token === 'clickup_mock') return null;
    try {
        const res = await fetch(
            `https://api.clickup.com/api/v2/task/${taskId}?include_subtasks=true`,
            { headers: clickUpAuthHeaders(token), cache: 'no-store' }
        );
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.warn('[Atlas] ClickUp task detail fetch failed:', taskId, e);
        return null;
    }
}

/** Map one ClickUp subtask to sibling-page shape for analytics/funnel/resources. */
function mapClickUpSubtaskToPage(subtask, parent, ws) {
    const useDoneStatus = featureOn('CLICKUP_DONE_STATUS');
    const isDone = useDoneStatus && clickUpTaskIsDone(subtask);
    const statusRaw = subtask.status?.status || '';
    const stage = clickUpStageFromStatus(statusRaw, isDone, ws);
    const flowStage = clickUpFlowStage(statusRaw, isDone, ws);
    const completed = isDone || stage === 'Live';
    const start = parseClickUpTimestamp(subtask.start_date);
    const release = parseClickUpTimestamp(subtask.due_date);
    const live = completed
        ? (parseClickUpTimestamp(subtask.date_closed) || parseClickUpTimestamp(subtask.date_done) || release)
        : '';
    const todayMs = startOfDay(new Date()).getTime();
    const startMs = start ? parseSmartDate(start)?.getTime() : NaN;
    const liveMs = live ? parseSmartDate(live)?.getTime() : NaN;
    const durations = [];
    if (!isNaN(startMs)) {
        const endMs = !isNaN(liveMs) ? liveMs : todayMs;
        const days = Math.min(
            typeof MAX_STAGE_DAYS !== 'undefined' ? MAX_STAGE_DAYS : 180,
            Math.max(0, Math.round((endMs - startMs) / 86400000))
        );
        durations.push({ stage: flowStage || stage || 'Development', days, ongoing: !completed });
    }
    let pipelineActualDays = null;
    if (!isNaN(startMs) && !isNaN(liveMs)) {
        pipelineActualDays = Math.round((liveMs - startMs) / 86400000);
    }
    let progress = completed ? 100 : 0;
    const clPct = clickUpChecklistProgress(subtask.checklists);
    if (clPct != null && !completed) progress = clPct;

    const creatorMode = isContentCreatorWorkspace(ws);
    const allAssignees = clickUpAllAssigneeNames(subtask.assignees);

    return {
        page:      subtask.name || 'Subtask',
        stage,
        rawStage:  statusRaw || stage,
        funnelStage: flowStage,
        status:    normalizeStatus(statusRaw || parent?.status || ''),
        start,
        release,
        live,
        progress,
        developer: creatorMode
            ? (allAssignees.length ? allAssignees.join(', ') : '')
            : clickUpAssigneeName(subtask.assignees, 0),
        qa:        creatorMode ? '' : clickUpAssigneeName(subtask.assignees, 1),
        creators:  creatorMode ? allAssignees : undefined,
        completed,
        stageExpectations: [],
        stageDurations: durations,
        pipelineExpectedDays: null,
        pipelineActualDays,
        reachedLive: completed,
    };
}

function computeClickUpSubtaskPages(subtasks, parent, ws) {
    if (!Array.isArray(subtasks) || !subtasks.length) return [];
    return subtasks.map(st => mapClickUpSubtaskToPage(st, parent, ws));
}

function computeClickUpRoadmapFromPages(parent, pages, ws) {
    const workspace = ws || (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    let live = 0;
    let inprog = 0;
    let pending = 0;
    let pctSum = 0;
    let pctCountCU = 0;  // Bug #10 fix: separate denominator — only count subtasks with real progress
    pages.forEach(pg => {
        const fs = pg.funnelStage || clickUpFlowStage(pg.rawStage || pg.stage || '', pg.completed, workspace);
        const st = isClickUpWorkspace(workspace) ? fs : normalizeStage(pg.stage || '');
        if (pg.completed || st === 'Live') live += 1;
        else if (st === 'Backlog' || st === 'Planning' || st === 'Brief') pending += 1;
        else inprog += 1;
        // Bug #10 fix: exclude not-started subtasks (progress=0, not complete) from avg
        // when flag is on; mirrors Bug #1 fix in computeRoadmapMetrics.
        if (!featureOn('SIBLING_AVG_PCT_EXCLUDE_BLANK') || pg.completed || pg.progress > 0) {
            pctSum += pg.progress || 0;
            pctCountCU += 1;
        }
    });
    const total = pages.length;
    const avgPct = pctCountCU > 0 ? Math.round(pctSum / pctCountCU) : (parent.progress || 0);
    const stageCounts = {};
    pages.forEach(pg => {
        const b = pg.funnelStage
            || (isClickUpWorkspace(workspace)
                ? clickUpFlowStage(pg.rawStage || pg.stage || '', pg.completed, workspace)
                : normalizeStage(pg.stage || ''));
        stageCounts[b] = (stageCounts[b] || 0) + 1;
    });
    let funnelStage = parent.funnelStage || parent.stage;
    let maxN = 0;
    Object.entries(stageCounts).forEach(([s, n]) => {
        if (n > maxN) { maxN = n; funnelStage = s; }
    });
    return { total, live, inprog, pending, avgPct, funnelStage };
}

function computeClickUpSubtaskAssignments(pages, ws) {
    const out = [];
    const creatorMode = isContentCreatorWorkspace(ws);
    const creatorRole = getContentCreatorRoleName(ws);
    pages.forEach(pg => {
        const base = {
            page: pg.page,
            stage: pg.stage,
            status: pg.status,
            start: pg.start,
            end: pg.completed ? (pg.live || pg.release) : pg.release,
            completed: pg.completed,
        };
        if (creatorMode) {
            const names = Array.isArray(pg.creators) && pg.creators.length
                ? pg.creators
                : splitAssigneeNames(pg.developer);
            names.forEach(n => {
                if (!isValidResourceName(n)) return;
                out.push({ person: n, role: creatorRole, ...base });
            });
            return;
        }
        if (isValidResourceName(pg.developer)) {
            out.push({ person: pg.developer, role: 'Developer', ...base });
        }
        if (isValidResourceName(pg.qa)) {
            out.push({ person: pg.qa, role: 'QA', ...base });
        }
    });
    return out;
}

/**
 * After ClickUp load, expand tasks with subtasks into roadmap.pages (Streak sibling parity).
 */
async function enrichClickUpWithSubtasks(projects, token, ws) {
    if (!featureOn('CLICKUP_SUBTASK_ENRICH')) return projects;
    const list = Array.isArray(projects) ? projects.map(p => ({ ...p })) : [];
    const CONCURRENCY = 4;
    const needDetail = [];

    list.forEach((p, idx) => {
        const raw = p._clickupRaw;
        const subs = raw?.subtasks || p.clickupMeta?.subtasks || [];
        if (!subs.length && raw?.id && (raw.subtasks_count > 0 || raw.subtasks?.length === 0)) {
            needDetail.push({ idx, id: raw.id });
        }
    });

    for (let i = 0; i < needDetail.length; i += CONCURRENCY) {
        const batch = needDetail.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map(async ({ idx, id }) => {
            const detail = await fetchClickUpTaskDetail(id, token);
            if (detail?.subtasks?.length) {
                list[idx]._clickupRaw = { ...list[idx]._clickupRaw, subtasks: detail.subtasks };
                if (list[idx].clickupMeta) list[idx].clickupMeta.subtasks = detail.subtasks;
            }
        }));
    }

    list.forEach((p, idx) => {
        const raw = p._clickupRaw;
        const subs = raw?.subtasks || p.clickupMeta?.subtasks || [];
        if (!subs.length) {
            delete list[idx]._clickupRaw;
            return;
        }
        const pages = computeClickUpSubtaskPages(subs, p, ws);
        const assignments = computeClickUpSubtaskAssignments(pages, ws);
        const rm = computeClickUpRoadmapFromPages(p, pages, ws);
        list[idx].roadmap = {
            hasSibling: true,
            source: 'clickup',
            ...rm,
            assignments,
            pages,
        };
        delete list[idx]._clickupRaw;
    });

    const enriched = list.filter(p => p.roadmap?.source === 'clickup').length;
    if (enriched) console.log(`[Atlas] ClickUp: ${enriched} tasks enriched with subtask deliverables`);
    return list;
}

/** Build pseudo-table for ClickUp deliverables (reuses sibling roadmap UI). */
function buildClickUpDeliverablesTable(pages) {
    const headers = ['Deliverable', 'Stage', 'Status', 'Assignee', 'Due', 'Progress'];
    const rows = (pages || []).map(pg => [
        pg.page || '',
        pg.rawStage || pg.stage || '',
        pg.status || '',
        pg.developer || '',
        pg.release || '',
        pg.progress != null ? `${pg.progress}%` : '',
    ]);
    return { headers, rows };
}

/**
 * Project detail loader — sibling CSV for Sheets, ClickUp subtasks/meta for ClickUp.
 */
async function loadProjectDetailData(project, sheetBaseUrl, ws) {
    const workspace = ws || (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    if (isClickUpWorkspace(workspace)) {
        return loadClickUpProjectDetail(project, workspace.clickupToken, workspace);
    }
    return loadProjectSiblingData(project, sheetBaseUrl);
}

async function loadClickUpProjectDetail(project, token, ws) {
    let pages = project.roadmap?.pages || [];
    let checklists = project.clickupMeta?.checklists || [];
    let subtasks = project.clickupMeta?.subtasks || [];
    let customFields = project.clickupMeta?.customFields || [];
    let url = project.clickupMeta?.url || '';

    if (!pages.length && project.id && token && token !== 'clickup_mock') {
        const detail = await fetchClickUpTaskDetail(project.id, token);
        if (detail) {
            subtasks = detail.subtasks || subtasks;
            checklists = detail.checklists || checklists;
            customFields = detail.custom_fields || customFields;
            url = detail.url || url;
            if (subtasks.length) {
                pages = computeClickUpSubtaskPages(subtasks, project, ws);
            }
        }
    } else if (subtasks.length && !pages.length) {
        pages = computeClickUpSubtaskPages(subtasks, project, ws);
    }

    if (!pages.length && !subtasks.length) {
        return {
            hasSibling: false,
            source: 'clickup',
            clickup: true,
            description: project.notes || '',
            tags: project.tags || [],
            checklists,
            customFields,
            url,
        };
    }

    const table = buildClickUpDeliverablesTable(pages);
    const rm = computeClickUpRoadmapFromPages(project, pages, ws);
    return {
        hasSibling: true,
        source: 'clickup',
        clickup: true,
        table,
        pages,
        ...rm,
        description: project.notes || '',
        tags: project.tags || [],
        checklists,
        customFields,
        url,
    };
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
                    const pages = computeSiblingPages(sib.table.headers, sib.table.rows);
                    list[idx].roadmap = { hasSibling: true, source: 'sibling', ...rm, assignments, pages };
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
   PROJECT LIFECYCLE (raw stage — source of truth for overdue)
────────────────────────────────────────── */

function canonicalizeRawStage(raw) {
    return String(raw || '').trim().toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Explicit post-Go-Live stages from the Project / Delivery sheets (raw values only). */
function isPostGoLiveRawStage(raw) {
    const s = canonicalizeRawStage(raw);
    if (!s) return false;
    if (/hyper\s*[-–]?\s*care|hypercare/.test(s)) return true;
    if (/^hot\s*[-–]?\s*fix\b/.test(s)) return true;
    if (/^live\s*[-–]?\s*cr\b/.test(s) || s === 'live cr') return true;
    if (s === 'live') return true;
    if (/live/.test(s) && /hyper/.test(s)) return true;
    return false;
}

function postGoLiveDisplayLabel(raw) {
    const s = canonicalizeRawStage(raw);
    if (/hyper/.test(s)) return 'Live / Hypercare';
    if (/hot\s*[-–]?\s*fix/.test(s)) return 'Live / Hot-Fix';
    if (/live\s*[-–]?\s*cr/.test(s) || s === 'live cr') return 'Live / CR';
    return 'Live';
}

function preLiveDisplayLabel(raw) {
    const s = canonicalizeRawStage(raw);
    if (!s) return '—';
    if (s === 'planning') return 'Planning';
    if (/story/.test(s) && /req/.test(s)) return 'Story / Requirements';
    if (/ui/.test(s) && /dev/.test(s)) return 'UI Development';
    if (/streak/.test(s) && /dev/.test(s)) return 'Development';
    if ((/streak/.test(s) && /qa/.test(s)) || s === 'qa') return 'QA';
    if (/^hold\b/.test(s)) return 'Hold';
    return String(raw || '').trim() || '—';
}

function postGoLiveRank(raw) {
    const s = canonicalizeRawStage(raw);
    if (/hyper/.test(s)) return 4;
    if (/hot\s*[-–]?\s*fix/.test(s)) return 3;
    if (/live\s*[-–]?\s*cr/.test(s) || s === 'live cr') return 2;
    return 1;
}

function pickStrongestPostGoLiveRaw(rawStages) {
    let best = '';
    let bestRank = 0;
    (rawStages || []).forEach(raw => {
        if (!isPostGoLiveRawStage(raw)) return;
        const rank = postGoLiveRank(raw);
        if (rank > bestRank) {
            bestRank = rank;
            best = String(raw || '').trim();
        }
    });
    return best;
}

function isPlaceholderPageName(page) {
    const t = String(page || '').trim();
    return !t || /^(-|—|tbd|n\/a)$/i.test(t);
}

/** Named, non-empty Delivery rows — same spirit as sibling page parsing. */
function getRelevantDeliveryPages(project) {
    const pages = project?.roadmap?.pages;
    if (!Array.isArray(pages)) return [];
    return pages.filter(pg => !isPlaceholderPageName(pg?.page));
}

/**
 * Project lifecycle from raw master stage + relevant Delivery page raw stages.
 * POST-LIVE projects are never overdue based on original release_date alone.
 */
function getProjectLifecycle(project) {
    const masterRaw = String(project?.rawStage ?? project?.stage ?? '').trim();

    if (isPostGoLiveRawStage(masterRaw)) {
        return {
            phase: 'post_live',
            source: 'master',
            rawStage: masterRaw,
            displayLabel: postGoLiveDisplayLabel(masterRaw),
            isOverdueEligible: false,
        };
    }

    const relevant = getRelevantDeliveryPages(project);
    if (!relevant.length) {
        return {
            phase: 'pre_live',
            source: 'master',
            rawStage: masterRaw,
            displayLabel: preLiveDisplayLabel(masterRaw),
            isOverdueEligible: true,
        };
    }

    const classified = relevant.map(pg => {
        const raw = String(pg?.rawStage ?? pg?.stage ?? '').trim();
        return { raw, postLive: raw ? isPostGoLiveRawStage(raw) : false };
    });
    const allPostLive = classified.every(x => x.postLive);
    const anyPostLive = classified.some(x => x.postLive);

    if (allPostLive) {
        const strongest = pickStrongestPostGoLiveRaw(classified.map(x => x.raw));
        return {
            phase: 'post_live',
            source: 'delivery_fallback',
            rawStage: strongest || masterRaw,
            displayLabel: postGoLiveDisplayLabel(strongest || masterRaw),
            isOverdueEligible: false,
        };
    }

    return {
        phase: 'pre_live',
        source: anyPostLive ? 'delivery_mixed' : 'master',
        rawStage: masterRaw,
        displayLabel: preLiveDisplayLabel(masterRaw),
        isOverdueEligible: true,
    };
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
    if (!featureOn('POST_LIVE_DATE_RULES')) return false;
    return getProjectLifecycle(project).phase === 'post_live';
}

/** Shipped UX: explicit post-go-live lifecycle stages. */
function projectCountsAsShipped(project, today) {
    return getProjectLifecycle(project).phase === 'post_live';
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

/** Local YYYY-MM-DD (no UTC shift). */
function formatDateIsoLocal(d) {
    if (!d || isNaN(d.getTime())) return null;
    const x = startOfDay(d);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, '0');
    const day = String(x.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
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

    // Reject partial dates like "13-Feb" — JS would guess year 2001 and break stage math.
    if (/^\d{1,2}-[A-Za-z]{3,9}$/i.test(t)) return new Date(NaN);

    return new Date(t);
}

/** Valid parsed release / go-live date (not TBD, not garbage). */
function isValidParsedDate(str) {
    if (isPlaceholderDate(str)) return false;
    const d = parseSmartDate(str);
    return d && !isNaN(d.getTime());
}

/**
 * Post-go-live lifecycle (raw stage driven). actual_live_date is metadata only.
 */
function hasPastGoLive(project, today) {
    if (!featureOn('POST_LIVE_DATE_RULES')) return false;
    return getProjectLifecycle(project).phase === 'post_live';
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

/** Overview live panel — post-go-live lifecycle projects visible on Overview. */
function qualifiesAsRecentlyLive(project, today, windowDays) {
    const lc = typeof getProjectLifecycle === 'function' ? getProjectLifecycle(project) : null;
    if (!lc || lc.phase !== 'post_live') return false;

    const raw = canonicalizeRawStage(lc.rawStage);
    // Active post-go-live support — always show (e.g. Hyper-Care without master actual_live_date).
    if (/hyper|hot\s*[-–]?\s*fix|live\s*[-–]?\s*cr/.test(raw)) return true;

    const relevant = getRelevantDeliveryPages(project);
    if (!isValidParsedDate(project.actual_live_date)
        && relevant.length > 0
        && relevant.every(pg => {
            const rs = String(pg?.rawStage ?? pg?.stage ?? '').trim();
            return rs && isPostGoLiveRawStage(rs);
        })) {
        return true;
    }

    if (!isValidParsedDate(project.actual_live_date)) return false;

    const days = windowDays ?? (CONFIG.RECENTLY_LIVE_DAYS ?? 90);
    const t    = today ? startOfDay(today) : startOfDay(new Date());
    const live = startOfDay(parseSmartDate(project.actual_live_date));
    const cutoff = new Date(t);
    cutoff.setDate(t.getDate() - days);
    return live >= cutoff;
}

function overviewLiveSortTime(project) {
    if (isValidParsedDate(project?.actual_live_date)) {
        return parseSmartDate(project.actual_live_date).getTime();
    }
    if (isValidParsedDate(project?.release_date)) {
        return parseSmartDate(project.release_date).getTime();
    }
    return 0;
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
        .sort((a, b) => overviewLiveSortTime(b) - overviewLiveSortTime(a));

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
    const nameRegistry = {};

    function resolvePersonName(raw) {
        const trimmed = String(raw || '').trim();
        const key = normalizePersonKey(trimmed);
        if (!key) return trimmed;

        for (const [ek, canonical] of Object.entries(nameRegistry)) {
            if (personKeysSoftMatch(key, ek)) {
                const best = pickPersonDisplayName(canonical, trimmed);
                nameRegistry[key] = best;
                nameRegistry[ek] = best;
                nameRegistry[normalizePersonKey(best)] = best;
                if (best !== canonical) {
                    if (map[canonical] && map[best]) {
                        map[best].assignments.push(...map[canonical].assignments);
                        map[best].conflicts.push(...map[canonical].conflicts);
                        delete map[canonical];
                    } else if (map[canonical] && !map[best]) {
                        map[best] = map[canonical];
                        map[best].name = best;
                        delete map[canonical];
                    }
                }
                return best;
            }
        }
        nameRegistry[key] = trimmed;
        return trimmed;
    }

    function isPersonCovered(name, coveredSet) {
        if (!coveredSet || !coveredSet.size) return false;
        const key = normalizePersonKey(name);
        for (const c of coveredSet) {
            if (personKeysSoftMatch(key, normalizePersonKey(c))) return true;
        }
        return false;
    }

    function ensurePerson(rawName) {
        const n = resolvePersonName(rawName);
        if (!map[n]) map[n] = { name: n, assignments: [], activeCount: 0, conflicts: [], freeFrom: null };
        else map[n].name = n;
        return map[n];
    }

    function push(name, role, project, excludeSet) {
        if (!isValidResourceName(name)) return;
        splitAssigneeNames(name).forEach(n => {
            if (!isValidResourceName(n)) return;
            if (isPersonCovered(n, excludeSet)) return;
            const person = ensurePerson(n);

            const stageNorm = normalizeStage(project.stage || '');
            const completed = projectAssignmentCompleted(project);
            const start     = project.start_date ? parseSmartDate(project.start_date) : null;
            const end       = projectAssignmentEnd(project);

            person.assignments.push({
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
                    pagesList: [],
                });
                cur.pages += 1;
                cur.pagesList.push({
                    page:        sa.page,
                    releaseDate: sa.end,
                    stage:       sa.stage,
                    completed:   sa.completed,
                });
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

        const projEnd   = projectAssignmentEnd(project);
        const projStart = project.start_date ? parseSmartDate(project.start_date) : null;
        const covered = new Set();

        Object.values(merged).forEach(m => {
            const canonical = resolvePersonName(m.name);
            covered.add(canonical);
            const person = ensurePerson(m.name);
            // Page-level stage is the source of truth: a person is only done when ALL
            // their pages are Live. A Live master row does NOT free someone who still
            // has pages in Dev/QA (e.g. a post-live CR with new pages in progress).
            const completed = m.allDone;
            let end = completed ? (m.endDone || m.endActive) : m.endActive;
            if (!end) end = projEnd && !isNaN(projEnd.getTime()) ? projEnd : null;
            let start = m.start || (projStart && !isNaN(projStart.getTime()) ? startOfDay(projStart) : null);

            person.assignments.push({
                projectId:   project.id,
                projectName: project.name,
                role:        m.role,
                start,
                end,
                status:      project.status,
                stage:       completed ? 'Live' : (m.stage || normalizeStage(project.stage || '')),
                completed,
                pages:        m.pages,
                activePages:  m.activePages,
                siblingPages: m.pagesList || [],
                source:       'sibling',
            });
        });
        return covered;
    }

    const creatorMode = isContentCreatorWorkspace();
    const creatorRole = getContentCreatorRoleName();

    projects.forEach(p => {
        const sib = featureOn('SIBLING_RESOURCE_MAP')
            && p.roadmap?.hasSibling
            && Array.isArray(p.roadmap.assignments) && p.roadmap.assignments.length
            ? p.roadmap.assignments : null;

        if (creatorMode) {
            // Digital Marketing: every assignee is a Content Creator (no Owner/BA/Dev/QA split).
            if (sib) {
                const covered = pushSiblingAssignments(p, sib);
                push(p.developer, creatorRole, p, covered);
            } else {
                push(p.developer, creatorRole, p);
                // Fallback: if developer empty, still count primary owner as creator.
                if (!isValidResourceName(p.developer) && isValidResourceName(p.owner)) {
                    push(p.owner, creatorRole, p);
                }
            }
            return;
        }

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

    consolidateResourceMapPeople(map);

    return applyResourceMapDerivedFields(map);
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

/** Default engineering roles; prefer getIntelRoles() for workspace-aware lists. */
const INTEL_ROLES = ['Developer', 'QA', 'BA', 'Owner', 'Page owner'];

function getRoleCapacityMax(role) {
    const m = CONFIG.CAPACITY?.maxProjectsPerPerson || {};
    return m[role] != null ? m[role] : 2;
}

function getActiveIntelRoles() {
    return typeof getIntelRoles === 'function' ? getIntelRoles() : INTEL_ROLES;
}

function getActiveIntakeConfig() {
    const ws = (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    if (ws.intake && typeof ws.intake === 'object') return ws.intake;
    return CONFIG.INTAKE || {};
}

/**
 * Per-project attention score 0–100, tier, and human-readable reasons.
 */
function computeAttentionScore(project, alerts, resourceMap, today) {
    if (!intelligenceEnabled()) return null;
    if (typeof getProjectLifecycle === 'function' && getProjectLifecycle(project).phase === 'post_live') return null;
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

/** Roles this person counts toward for Intelligence capacity (Database columns + delivery assignments). */
function getPersonIntelRoles(person, intelRoles, rosterByName) {
    const roles = new Set();
    (person?.assignments || []).forEach(a => {
        if (a.role && intelRoles.includes(a.role)) roles.add(a.role);
    });
    const emp = rosterByName?.[person?.name] || rosterByName?.[normalizePersonKey(person?.name || '')];
    if (emp?.intelRoles) {
        emp.intelRoles.forEach(r => { if (intelRoles.includes(r)) roles.add(r); });
    }
    return roles;
}

/** Active assignment periods overlapping a calendar week (dated rows only). */
function countRoleOverlapInWeek(person, role, weekStart, weekEnd) {
    let overlap = 0;
    (person?.assignments || []).forEach(a => {
        if (a.completed || a.role !== role) return;
        if (!a.start || !a.end || isNaN(a.start.getTime()) || isNaN(a.end.getTime())) return;
        if (a.start <= weekEnd && a.end >= weekStart) overlap += 1;
    });
    return overlap;
}

function buildRosterByName(rosterEmployees) {
    const map = {};
    (rosterEmployees || []).forEach(emp => {
        if (emp.name) map[emp.name] = emp;
        if (emp.nameKey) map[emp.nameKey] = emp;
    });
    return map;
}

/**
 * Role-based utilization forecast for next ~90 days (13 weekly buckets).
 */
function computeRoleCapacityForecast(projects, resourceMap, horizons, rosterEmployees) {
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

    const intelRoles = typeof getIntelRoles === 'function' ? getIntelRoles() : INTEL_ROLES;
    const rosterByName = buildRosterByName(
        rosterEmployees
        || (typeof AppState !== 'undefined' ? AppState.databaseRoster : null)
        || []
    );
    const rolePeople = {};
    intelRoles.forEach(role => { rolePeople[role] = new Set(); });

    Object.values(resourceMap || {}).forEach(person => {
        getPersonIntelRoles(person, intelRoles, rosterByName).forEach(role => {
            rolePeople[role].add(person.name);
        });
    });

    const roles = {};
    let benchRiskWeeks = 0;
    let shortageWeeks = 0;
    const freeingNext30 = [];
    const freeNow = [];

    function releaseRoles(person) {
        const active = [...new Set((person.assignments || []).filter(a => !a.completed).map(a => a.role))];
        if (active.length) return active;
        const any = [...new Set((person.assignments || []).map(a => a.role).filter(Boolean))];
        return any.length ? any : ['—'];
    }

    const cut30 = today.getTime() + 30 * 86400000;
    Object.values(resourceMap).forEach(person => {
        const activeCount = person.activeCount || 0;
        if (activeCount === 0) {
            freeNow.push({
                name: person.name,
                freeFrom: formatDateIsoLocal(today),
                roles: releaseRoles(person),
                activeCount: 0,
            });
            return;
        }
        if (!person.freeFrom || isNaN(person.freeFrom.getTime())) return;
        const ff = startOfDay(person.freeFrom).getTime();
        if (ff >= today.getTime() && ff <= cut30) {
            freeingNext30.push({
                name: person.name,
                freeFrom: formatDateIsoLocal(person.freeFrom),
                roles: releaseRoles(person),
                activeCount,
            });
        }
    });
    freeNow.sort((a, b) => a.name.localeCompare(b.name));
    freeingNext30.sort((a, b) => (a.freeFrom || '').localeCompare(b.freeFrom || '') || a.name.localeCompare(b.name));

    intelRoles.forEach(role => {
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
                const distinct = countRoleOverlapInWeek(person, role, weekStart, weekEnd);
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

    return {
        roles,
        horizons: horizons || [30, 60, 90],
        summary: {
            benchRiskWeeks,
            shortageWeeks,
            freeNow: freeNow.slice(0, 50),
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
/**
 * Safe business intake: how many new projects of each size can start without
 * overloading the roles that project size needs.
 *
 * Logic (aligned with the Role Busy-ness heatmap):
 * 1. For each tier (small / medium / large), look at the required roles + headcount
 *    and the project duration (30 / 60 / 90 days) from workspace intake config.
 * 2. Over every week in that duration, read freeHeadcount from the capacity forecast
 *    (people in that role with no overlapping assignment that week).
 * 3. Take the *minimum* free headcount across those weeks — capacity must hold for
 *    the whole project, not just week 1.
 * 4. Slots = floor(minFree / headsRequired). If the heatmap is fully booked (0 free
 *    every week), intake is 0.
 */
function computeBusinessIntakeCapacity(resourceMap, capacityForecast, rosterEmployees) {
    if (!intelligenceEnabled()) {
        return {
            small: 0, medium: 0, large: 0,
            byHorizon: {}, tiers: {}, narrativeInputs: {}, explanation: '',
        };
    }

    const today = startOfDay(new Date());
    const ws = (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    const intake = (ws.intake && typeof ws.intake === 'object') ? ws.intake : (CONFIG.INTAKE || {});
    const intelRoles = typeof getIntelRoles === 'function' ? getIntelRoles(ws) : INTEL_ROLES;
    const primaryRole = typeof getPrimaryWorkRole === 'function' ? getPrimaryWorkRole(ws) : 'Developer';
    const rosterByName = buildRosterByName(rosterEmployees || (typeof AppState !== 'undefined' ? AppState.databaseRoster : []) || []);
    const byHorizon = { 30: {}, 60: {}, 90: {} };

    function peopleInRolePool(role) {
        const fromForecast = capacityForecast?.roles?.[role]?.people;
        if (Array.isArray(fromForecast) && fromForecast.length) return fromForecast;
        return Object.values(resourceMap || {})
            .filter(p => getPersonIntelRoles(p, intelRoles, rosterByName).has(role))
            .map(p => p.name);
    }

    /** Person has zero dated assignment overlap in role for every week through horizonDays. */
    function personFreeForHorizon(name, role, horizonDays) {
        const person = resourceMap[name];
        if (!person) return false;
        const weekCount = Math.max(1, Math.ceil(horizonDays / 7));
        for (let i = 0; i < weekCount; i++) {
            const wsDay = new Date(today);
            wsDay.setDate(wsDay.getDate() + i * 7);
            const weekStart = weekStartMonday(wsDay);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            if (countRoleOverlapInWeek(person, role, weekStart, weekEnd) > 0) return false;
        }
        return true;
    }

    /** Free people in a role for the full horizon — min weekly freeHeadcount from forecast. */
    function freeAcrossHorizon(role, horizonDays) {
        const weeks = capacityForecast?.roles?.[role]?.weeks;
        if (Array.isArray(weeks) && weeks.length) {
            const n = Math.max(1, Math.min(weeks.length, Math.ceil(horizonDays / 7)));
            const slice = weeks.slice(0, n);
            return Math.min(...slice.map(w => Number(w.freeHeadcount) || 0));
        }
        return peopleInRolePool(role).filter(name => personFreeForHorizon(name, role, horizonDays)).length;
    }

    [30, 60, 90].forEach(days => {
        intelRoles.forEach(role => {
            byHorizon[days][role] = freeAcrossHorizon(role, days);
        });
    });

    function tierSlots(tierKey) {
        const spec = intake[tierKey];
        if (!spec) {
            return { slots: 0, heads: 1, days: 30, roles: [primaryRole], freeByRole: {}, limitingRole: primaryRole };
        }
        const heads = Math.max(1, parseInt(spec.heads, 10) || 1);
        const days = spec.days || 30;
        const roles = (Array.isArray(spec.roles) && spec.roles.length) ? spec.roles : [primaryRole];
        const freeByRole = {};
        let limitingRole = roles[0];
        let minFree = Infinity;
        roles.forEach(r => {
            const free = byHorizon[days]?.[r] ?? freeAcrossHorizon(r, days);
            freeByRole[r] = free;
            if (free < minFree) {
                minFree = free;
                limitingRole = r;
            }
        });
        if (!Number.isFinite(minFree)) minFree = 0;
        const slots = Math.floor(minFree / heads);
        return { slots, heads, days, roles, freeByRole, limitingRole, minFree };
    }

    const smallT = tierSlots('small');
    const mediumT = tierSlots('medium');
    const largeT = tierSlots('large');

    const creatorMode = typeof isContentCreatorWorkspace === 'function' && isContentCreatorWorkspace(ws);
    const roleWord = creatorMode ? (primaryRole + 's') : 'specialists';
    let explanation = '';
    if (smallT.slots === 0 && mediumT.slots === 0 && largeT.slots === 0) {
        explanation = `No safe intake right now — ${roleWord.toLowerCase()} have no free capacity across the next planning windows (same signal as the busy-ness calendar above).`;
    } else {
        explanation = `Slots = free ${primaryRole} headcount sustained for the whole project length ÷ people required per project. Example: ${smallT.minFree} free for ${smallT.days}d ÷ ${smallT.heads} = ${smallT.slots} small.`;
    }

    return {
        small: smallT.slots,
        medium: mediumT.slots,
        large: largeT.slots,
        byHorizon,
        tiers: { small: smallT, medium: mediumT, large: largeT },
        explanation,
        narrativeInputs: {
            devFree30: byHorizon[30].Developer || byHorizon[30][primaryRole] || 0,
            qaFree60: byHorizon[60].QA || byHorizon[60][primaryRole] || 0,
            primaryFree30: byHorizon[30][primaryRole] || 0,
            primaryRole,
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

/** Recompute intelligence artifacts from a given resourceMap (shared by master + delivery engines). */
function computeResourceIntelligenceWithMap(projects, alerts, resourceMap) {
    if (!intelligenceEnabled()) {
        return {
            attentionRanked: [],
            capacityForecast: { roles: {}, summary: {}, horizons: [30, 60, 90] },
            intakeRecommendation: { small: 0, medium: 0, large: 0, byHorizon: {} },
            intelligenceSummary: null,
            resourceMap: resourceMap || {},
        };
    }
    const map = resourceMap || {};
    const roster = (typeof AppState !== 'undefined' && AppState.databaseRoster) || [];
    const attentionRanked = computeAttentionRanked(projects, alerts, map);
    const capacityForecast = computeRoleCapacityForecast(projects, map, undefined, roster);
    const intakeRecommendation = computeBusinessIntakeCapacity(map, capacityForecast, roster);
    const intelligenceSummary = buildIntelligenceSummary(
        projects, alerts, map, attentionRanked, capacityForecast, intakeRecommendation
    );
    return { attentionRanked, capacityForecast, intakeRecommendation, intelligenceSummary, resourceMap: map };
}

/** Recompute all intelligence artifacts (call from AppState.setProjects). Uses project-master resource map. */
function computeResourceIntelligence(projects, alerts) {
    const resourceMap = buildResourceMap(projects);
    return computeResourceIntelligenceWithMap(projects, alerts, resourceMap);
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
