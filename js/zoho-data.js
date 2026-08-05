/**
 * Valoriz Zoho — timelog CSV parse, team mapping, aggregations
 */

const ZOHO_TEAM_COLORS = {
    'Development':         { color: '#3B82F6', glow: 'rgba(59,130,246,0.45)' },
    'QA':                  { color: '#10B981', glow: 'rgba(16,185,129,0.45)' },
    'Business Analysis':   { color: '#A78BFA', glow: 'rgba(167,139,250,0.45)' },
    'Project Management':  { color: '#F59E0B', glow: 'rgba(245,158,11,0.45)' },
    'Overhead':            { color: '#94A3B8', glow: 'rgba(148,163,184,0.4)' },
    'Other':               { color: '#64748B', glow: 'rgba(100,116,139,0.4)' },
};

function isZohoWorkspace(ws) {
    return !!(ws && ws.integrationType === 'zoho_timelog');
}

function zohoStorageKey(workspaceId) {
    return `atlas_zoho_timelog_${workspaceId || 'valoriz-zoho'}`;
}

function getTeamForJob(jobName) {
    const map = CONFIG.ZOHO_JOB_TEAM_MAP || {};
    const key = String(jobName || '').trim();
    return map[key] || CONFIG.ZOHO_DEFAULT_TEAM || 'Other';
}

/** Parse Zoho export date DD-MM-YYYY */
function parseZohoDate(raw) {
    const s = String(raw || '').trim();
    if (!s) return null;
    const m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (m) {
        const d = new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
        return isNaN(d.getTime()) ? null : d;
    }
    const d2 = parseSmartDate(s);
    return d2 && !isNaN(d2.getTime()) ? d2 : null;
}

function formatZohoHours(h) {
    const n = Number(h) || 0;
    return n % 1 === 0 ? `${n}h` : `${n.toFixed(1)}h`;
}

function formatZohoDateRange(minDate, maxDate) {
    if (!minDate || !maxDate) return '—';
    const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${fmt(minDate)} – ${fmt(maxDate)}`;
}

function personDisplayName(entry) {
    const first = String(entry.first_name || '').trim();
    const last = String(entry.last_name || '').trim();
    const combined = `${first} ${last}`.trim();
    return combined || entry.email || entry.employee_id || 'Unknown';
}

function buildZohoFieldIndex(headerCells) {
    const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const idx = {};
    headerCells.forEach((h, i) => {
        const n = norm(h);
        if (n === 'date') idx.date = i;
        else if (n === 'client name') idx.client = i;
        else if (n === 'project name') idx.project = i;
        else if (n === 'job name') idx.job_name = i;
        else if (n === 'employee id') idx.employee_id = i;
        else if (n === 'email id') idx.email = i;
        else if (n === 'first name') idx.first_name = i;
        else if (n === 'last name') idx.last_name = i;
        else if (n === 'work item') idx.work_item = i;
        else if (n === 'hour(s)' || n === 'hours') idx.hours = i;
        else if (n === 'hours(hh:mm)') idx.hours_display = i;
        else if (n === 'billing status') idx.billing_status = i;
        else if (n === 'approval status') idx.approval_status = i;
        else if (n === 'description') idx.description = i;
    });
    return idx;
}

function parseZohoTimelog(csvText) {
    const text = String(csvText).replace(/^\uFEFF/, '').trim();
    const lines = splitCSVLines(text);
    if (lines.length < 2) return { entries: [], projects: [], clients: [] };

    const headers = parseCSVLine(lines[0]);
    const fieldMap = buildZohoFieldIndex(headers);
    if (fieldMap.hours == null && fieldMap.date == null) {
        throw new Error('Unrecognized Zoho timelog format. Expected columns like Date, Project Name, Job Name, Hour(s).');
    }

    const c = (cols, key) => {
        const i = fieldMap[key];
        return i != null && cols[i] != null ? String(cols[i]).trim() : '';
    };

    const entries = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        const hoursRaw = c(cols, 'hours');
        const hours = parseFloat(hoursRaw);
        if (!c(cols, 'date') && !c(cols, 'project') && !hoursRaw) continue;

        const jobName = c(cols, 'job_name');
        entries.push({
            date: c(cols, 'date'),
            dateObj: parseZohoDate(c(cols, 'date')),
            client: c(cols, 'client'),
            project: c(cols, 'project'),
            job_name: jobName,
            team: getTeamForJob(jobName),
            employee_id: c(cols, 'employee_id'),
            email: c(cols, 'email'),
            first_name: c(cols, 'first_name'),
            last_name: c(cols, 'last_name'),
            person: personDisplayName({
                first_name: c(cols, 'first_name'),
                last_name: c(cols, 'last_name'),
                email: c(cols, 'email'),
                employee_id: c(cols, 'employee_id'),
            }),
            work_item: c(cols, 'work_item'),
            hours: isNaN(hours) ? 0 : hours,
            hours_display: c(cols, 'hours_display'),
            billing_status: c(cols, 'billing_status'),
            approval_status: c(cols, 'approval_status'),
            description: c(cols, 'description'),
        });
    }

    const projects = [...new Set(entries.map(e => e.project).filter(Boolean))].sort();
    const clients = [...new Set(entries.map(e => e.client).filter(Boolean))].sort();
    return { entries, projects, clients };
}

function filterTimelogEntries(entries, filters = {}) {
    let list = entries || [];
    if (filters.project) list = list.filter(e => e.project === filters.project);
    if (filters.team) list = list.filter(e => e.team === filters.team);
    if (filters.person) list = list.filter(e => e.person === filters.person);
    if (filters.approvalStatus && filters.approvalStatus !== 'all') {
        list = list.filter(e => e.approval_status === filters.approvalStatus);
    }
    if (filters.dateFrom) {
        const from = filters.dateFrom instanceof Date ? filters.dateFrom : parseZohoDate(filters.dateFrom);
        if (from) list = list.filter(e => e.dateObj && e.dateObj >= from);
    }
    if (filters.dateTo) {
        const to = filters.dateTo instanceof Date ? filters.dateTo : parseZohoDate(filters.dateTo);
        if (to) {
            to.setHours(23, 59, 59, 999);
            list = list.filter(e => e.dateObj && e.dateObj <= to);
        }
    }
    return list;
}

function sumHours(entries) {
    return (entries || []).reduce((s, e) => s + (e.hours || 0), 0);
}

function aggregateByTeam(entries) {
    const map = {};
    (entries || []).forEach(e => {
        const t = e.team || CONFIG.ZOHO_DEFAULT_TEAM;
        map[t] = (map[t] || 0) + e.hours;
    });
    return Object.entries(map)
        .map(([team, hours]) => ({ team, hours }))
        .sort((a, b) => b.hours - a.hours);
}

function aggregateByPerson(entries) {
    const map = {};
    const teamHours = {};
    (entries || []).forEach(e => {
        const p = e.person;
        map[p] = (map[p] || 0) + e.hours;
        if (!teamHours[p]) teamHours[p] = {};
        const t = e.team || CONFIG.ZOHO_DEFAULT_TEAM;
        teamHours[p][t] = (teamHours[p][t] || 0) + e.hours;
    });
    return Object.entries(map)
        .map(([person, hours]) => {
            const teams = teamHours[person] || {};
            const primaryTeam = Object.entries(teams).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
            return { person, hours, primaryTeam };
        })
        .sort((a, b) => b.hours - a.hours);
}

function aggregateByJobName(entries) {
    const map = {};
    (entries || []).forEach(e => {
        const j = e.job_name || '—';
        map[j] = (map[j] || 0) + e.hours;
    });
    return Object.entries(map)
        .map(([job_name, hours]) => ({ job_name, hours }))
        .sort((a, b) => b.hours - a.hours);
}

/** Monday-start week key YYYY-Www */
function zohoWeekKey(dateObj) {
    if (!dateObj) return 'unknown';
    const d = new Date(dateObj);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    const weekStart = d;
    const label = weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return { key: weekStart.toISOString().slice(0, 10), label, weekStart };
}

function aggregateByWeek(entries) {
    const weeks = {};
    (entries || []).forEach(e => {
        if (!e.dateObj) return;
        const wk = zohoWeekKey(e.dateObj);
        if (!weeks[wk.key]) weeks[wk.key] = { key: wk.key, label: wk.label, weekStart: wk.weekStart, teams: {}, total: 0 };
        const bucket = weeks[wk.key];
        bucket.total += e.hours;
        const t = e.team || CONFIG.ZOHO_DEFAULT_TEAM;
        bucket.teams[t] = (bucket.teams[t] || 0) + e.hours;
    });
    return Object.values(weeks).sort((a, b) => a.weekStart - b.weekStart);
}

function computeTimelogSummary(entries, allEntries) {
    const totalHours = sumHours(entries);
    const all = allEntries || entries;
    const people = new Set((entries || []).map(e => e.person)).size;
    const productive = (CONFIG.ZOHO_PRODUCTIVE_TEAMS || []);
    const productiveHours = (entries || [])
        .filter(e => productive.includes(e.team))
        .reduce((s, e) => s + e.hours, 0);
    const productiveRatio = totalHours ? Math.round((productiveHours / totalHours) * 100) : 0;

    const dates = (entries || []).map(e => e.dateObj).filter(Boolean);
    const minDate = dates.length ? new Date(Math.min(...dates)) : null;
    const maxDate = dates.length ? new Date(Math.max(...dates)) : null;

    const pendingHours = sumHours((all || []).filter(e =>
        e.approval_status === 'Rejected' || e.approval_status === 'Not Submitted'
    ));

    return {
        totalHours,
        people,
        productiveRatio,
        productiveHours,
        minDate,
        maxDate,
        pendingHours,
        entryCount: (entries || []).length,
    };
}

function teamDonutData(teamAgg) {
    return teamAgg.map(({ team, hours }) => {
        const pal = ZOHO_TEAM_COLORS[team] || ZOHO_TEAM_COLORS.Other;
        return { label: team, value: Math.round(hours * 10) / 10, color: pal.color, glowColor: pal.glow };
    });
}

/** Leadership-friendly labels for Zoho job names */
function leadershipJobLabel(jobName) {
    const map = {
        'UI Development': 'Product Engineering',
        'Testing': 'Quality Assurance',
        'BA': 'Business Analysis',
        'Project Management': 'Program Governance',
        'Internal Meetings & Discussions': 'Coordination & Planning',
        'DSM': 'Team Sync (Daily Stand-up)',
        'Home Page': 'Homepage Delivery',
        'About Us Page': 'About Us Delivery',
        'Other Pages': 'Secondary Pages Delivery',
        'Services Page': 'Services Page Delivery',
    };
    return map[String(jobName || '').trim()] || String(jobName || '').trim() || 'Other';
}

/** Leadership-friendly labels for work items */
function leadershipWorkItemLabel(item) {
    const map = {
        'Streak Implementation': 'Platform Integration',
        'Backend development': 'Backend Engineering',
        'Test Execution': 'Quality Validation',
        'Manual testing': 'Manual QA',
        'Bug management': 'Defect Resolution',
        'Internal Discussion': 'Stakeholder Alignment',
        'Client Communication': 'Client Engagement',
        'code review': 'Code Review',
        'Work Item-Default': 'General Delivery',
    };
    const key = String(item || '').trim();
    return map[key] || key || 'General Delivery';
}

const ZOHO_DELIVERY_MILESTONE_JOBS = new Set([
    'Home Page', 'About Us Page', 'Other Pages', 'Services Page',
]);

function aggregateByWorkItem(entries) {
    const map = {};
    (entries || []).forEach(e => {
        const label = leadershipWorkItemLabel(e.work_item);
        map[label] = (map[label] || 0) + e.hours;
    });
    return Object.entries(map)
        .map(([label, hours]) => ({ label, hours }))
        .sort((a, b) => b.hours - a.hours);
}

function computeLeadershipBrief(entries, allEntries, options = {}) {
    const summary = computeTimelogSummary(entries, allEntries);
    const teamAgg = aggregateByTeam(entries);
    const personAgg = aggregateByPerson(entries);
    const weekAgg = aggregateByWeek(entries);
    const jobAgg = aggregateByJobName(entries);
    const outcomeAgg = aggregateByWorkItem(entries);

    const projectName = options.projectName
        || (options.filters?.project)
        || entries[0]?.project
        || 'Project';
    const clientName = options.clientName || entries[0]?.client || '';

    const totalH = summary.totalHours || 0;
    const allH = sumHours(allEntries);
    const pendingPct = allH ? Math.round((summary.pendingHours / allH) * 100) : 0;
    const overheadH = teamAgg.find(t => t.team === 'Overhead')?.hours || 0;
    const overheadPct = totalH ? Math.round((overheadH / totalH) * 100) : 0;

    const topPerson = personAgg[0];
    const concentrationPct = topPerson && totalH ? Math.round((topPerson.hours / totalH) * 100) : 0;

    let velocityTrend = 'stable';
    let velocityLabel = 'Steady pace';
    let velocityDetail = 'Weekly effort is consistent with prior periods.';
    if (weekAgg.length >= 2) {
        const recent = weekAgg.slice(-2).reduce((s, w) => s + w.total, 0);
        const priorSlice = weekAgg.length >= 4 ? weekAgg.slice(-4, -2) : weekAgg.slice(0, Math.max(0, weekAgg.length - 2));
        const prior = priorSlice.reduce((s, w) => s + w.total, 0);
        if (prior > 0) {
            const change = Math.round(((recent - prior) / prior) * 100);
            if (change > 15) {
                velocityTrend = 'accelerating';
                velocityLabel = 'Accelerating';
                velocityDetail = `Effort up ~${change}% vs the previous two weeks — team is scaling delivery.`;
            } else if (change < -15) {
                velocityTrend = 'slowing';
                velocityLabel = 'Slowing';
                velocityDetail = `Effort down ~${Math.abs(change)}% vs the previous two weeks — confirm whether work is winding down or logging is incomplete.`;
            }
        }
    }

    const attention = [];
    const decisions = [];

    if (summary.pendingHours > 0) {
        attention.push({
            severity: pendingPct >= 20 ? 'high' : 'medium',
            title: 'Timesheet approval backlog',
            detail: `${formatZohoHours(summary.pendingHours)} (${pendingPct}% of all logged time) is rejected or not submitted. This can delay billing and distort performance reporting.`,
        });
        decisions.push('Ask PMO to resolve rejected timesheets before the next leadership review.');
    }
    if (summary.people === 1 && concentrationPct >= 45) {
        attention.push({
            severity: 'high',
            title: 'Single-contributor delivery risk',
            detail: `${topPerson.person} is the only logged contributor (${concentrationPct}% of effort).`,
        });
        decisions.push('Confirm whether other team members should be logging time or assigned to this project.');
    } else if (summary.people >= 2 && concentrationPct >= 50) {
        const others = personAgg.slice(1, 4).map(p => p.person.split(' ')[0]).join(', ');
        attention.push({
            severity: concentrationPct >= 65 ? 'medium' : 'low',
            title: 'Uneven workload across team',
            detail: `Team of ${summary.people} active — ${topPerson.person} logs the most time (${concentrationPct}%)${others ? `; also contributing: ${others}${personAgg.length > 4 ? ', …' : ''}` : ''}.`,
        });
        decisions.push('Review workload balance — ensure critical paths are not blocked on one person.');
    }
    if (overheadPct > 22) {
        attention.push({
            severity: 'medium',
            title: 'Coordination overhead is elevated',
            detail: `${overheadPct}% of effort goes to meetings and stand-ups. Review whether cadence still matches delivery needs.`,
        });
    }
    if (summary.productiveRatio < 65 && totalH > 0) {
        attention.push({
            severity: 'medium',
            title: 'Delivery focus below target',
            detail: `${summary.productiveRatio}% of time is on core delivery (engineering, QA, analysis, PM). Leadership target is typically 70%+.`,
        });
        decisions.push('Rebalance meeting load or re-scope non-delivery activities for the next sprint cycle.');
    }
    if (velocityTrend === 'slowing') {
        attention.push({
            severity: 'low',
            title: 'Effort trend is declining',
            detail: velocityDetail,
        });
    }

    if (!attention.length) {
        attention.push({
            severity: 'none',
            title: 'No critical issues flagged',
            detail: 'Effort allocation, ownership spread, and timesheet hygiene look acceptable for this reporting window.',
        });
    }

    if (!decisions.length) {
        decisions.push('Continue current resourcing plan and review again at the next milestone checkpoint.');
        decisions.push('Validate that Zoho timelogs stay approved weekly to keep this view accurate.');
    }

    let health = 'healthy';
    let healthLabel = 'On Track';
    if (attention.some(a => a.severity === 'high') || concentrationPct >= 55 || summary.productiveRatio < 55) {
        health = 'at-risk';
        healthLabel = 'At Risk';
    } else if (attention.some(a => a.severity === 'medium')) {
        health = 'attention';
        healthLabel = 'Monitor';
    }

    const devH = teamAgg.find(t => t.team === 'Development')?.hours || 0;
    const qaH = teamAgg.find(t => t.team === 'QA')?.hours || 0;
    const devPct = totalH ? Math.round((devH / totalH) * 100) : 0;
    const qaPct = totalH ? Math.round((qaH / totalH) * 100) : 0;

    const periodDays = summary.minDate && summary.maxDate
        ? Math.max(1, Math.ceil((summary.maxDate - summary.minDate) / 86400000) + 1)
        : 0;
    const avgWeekly = weekAgg.length ? Math.round(totalH / weekAgg.length) : 0;

    const narrative = totalH
        ? `${projectName}${clientName ? ` for ${clientName}` : ''} has invested ${formatZohoHours(totalH)} across ${summary.people} team members over ${formatZohoDateRange(summary.minDate, summary.maxDate)}. `
          + `${devPct}% of effort supports product engineering and ${qaPct}% quality assurance. `
          + `Delivery focus is ${summary.productiveRatio}% with ${velocityLabel.toLowerCase()} weekly effort (~${formatZohoHours(avgWeekly)}/week).`
        : 'Upload timelog data to generate an executive project brief.';

    const milestones = jobAgg
        .filter(j => ZOHO_DELIVERY_MILESTONE_JOBS.has(j.job_name))
        .map(j => ({
            name: leadershipJobLabel(j.job_name),
            hours: j.hours,
            pct: totalH ? Math.round((j.hours / totalH) * 100) : 0,
        }));

    const focusAreas = jobAgg.slice(0, 8).map(j => ({
        name: leadershipJobLabel(j.job_name),
        hours: j.hours,
        pct: totalH ? Math.round((j.hours / totalH) * 100) : 0,
    }));

    const outcomes = outcomeAgg.slice(0, 6);

    const dependencies = [];
    if (devH > 0 && qaH > 0) {
        dependencies.push({
            title: 'Engineering → Quality Assurance',
            detail: `Build output (${formatZohoHours(devH)}) must flow into QA (${formatZohoHours(qaH)}) for release readiness.`,
        });
    }
    const baH = teamAgg.find(t => t.team === 'Business Analysis')?.hours || 0;
    if (baH > 0 && devH > 0) {
        dependencies.push({
            title: 'Business Analysis → Engineering',
            detail: `Requirements and client alignment (${formatZohoHours(baH)}) feed the ${formatZohoHours(devH)} engineering effort.`,
        });
    }
    if (!dependencies.length && totalH > 0) {
        dependencies.push({
            title: 'Cross-functional delivery',
            detail: 'Multiple functions are contributing; confirm handoffs are documented in your project plan.',
        });
    }

    return {
        ...summary,
        projectName,
        clientName,
        health,
        healthLabel,
        narrative,
        attention,
        decisions,
        velocityTrend,
        velocityLabel,
        velocityDetail,
        concentrationPct,
        overheadPct,
        pendingPct,
        milestones,
        focusAreas,
        outcomes,
        dependencies,
        ownership: personAgg,
        teamAgg,
        weekAgg,
        jobAgg,
        periodDays,
        avgWeekly,
        devPct,
        qaPct,
    };
}

function persistZohoTimelogs(workspaceId, payload) {
    try {
        localStorage.setItem(zohoStorageKey(workspaceId), JSON.stringify(payload));
    } catch (e) {
        console.warn('[Zoho] Could not persist timelogs:', e);
    }
}

function loadZohoTimelogsFromStorage(workspaceId) {
    try {
        const raw = localStorage.getItem(zohoStorageKey(workspaceId));
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.warn('[Zoho] Could not load timelogs:', e);
        return null;
    }
}

function exportTimelogEntriesCSV(entries) {
    const headers = ['Date', 'Client', 'Project', 'Person', 'Team', 'Job Name', 'Work Item', 'Hours', 'Billing Status', 'Approval Status', 'Description'];
    const rows = (entries || []).map(e => [
        e.date, e.client, e.project, e.person, e.team, e.job_name, e.work_item,
        e.hours, e.billing_status, e.approval_status, e.description,
    ]);
    const esc = (v) => {
        const s = String(v == null ? '' : v);
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `zoho-timelog-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
}
