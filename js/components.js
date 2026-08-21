/**
 * STREAK.JS v3 — Components Render
 * 2026 Reference Aesthetic: Clean, Pastel, Highly Rounded, Geometric layout.
 */

const STAGES = ['Backlog', 'Planning', 'Development', 'QA', 'Release', 'Live'];

/* ══════════════════════════════════════════
   ICONS (SVG)
══════════════════════════════════════════ */
const Icons = {
    search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
    bell: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    settings: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>',
    home: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    board: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',
    list: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    chart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    logout: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    math: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19V5a2 2 0 0 1 2-2h13.4a1.5 1.5 0 0 1 1.5 1.5v14.4A2.6 2.6 0 0 1 18.3 21H6a2 2 0 0 1-2-2z"/><path d="M9 13h6M12 10v6M12 5v2M12 17v2"/></svg>',
    lit: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    music: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    globe: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    handshake: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"/><path d="M12 17v-5"/><path d="M8 8l4-4 4 4"/></svg>',
    checkIcon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>',
    alert: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    users: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    calendar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    trendUp: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    briefcase: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
    checkCircle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    zap: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    pause: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
};

/** Section title with a professional SVG icon (no emoji). */
function sectionTitleWithIcon(iconSvg, label) {
    return `<span class="ui-title-with-icon">${iconSvg}<span>${label}</span></span>`;
}

const PASTELS = ['bg-peach', 'bg-violet', 'bg-mint', 'bg-blue', 'bg-yellow'];

function getStatusPastel(status) {
    if (status === 'delayed') return 'bg-red';
    if (status === 'at_risk') return 'bg-yellow';
    if (status === 'on_track') return 'bg-mint';
    return 'bg-blue';
}

/** CSS class for Directory card status chip (Stresk / Material green for on track). */
function directoryStatusPillClass(status) {
    if (status === 'delayed') return 'directory-pill directory-pill--bad';
    if (status === 'at_risk') return 'directory-pill directory-pill--risk';
    if (status === 'on_track') return 'directory-pill directory-pill--ok';
    return 'directory-pill directory-pill--neutral';
}

/** Progress bar fill — matches app-main `STATUS_COLOR` / ProjectCard (inline on `.progress-fill`). */
function streskStatusBarColor(status) {
    if (status === 'at_risk') return '#F9AB00';
    if (status === 'delayed') return '#D93025';
    return '#1E8E3E';
}

/** Sibling row progress only has a % — banded status palette. */
function streskBandedProgressColor(pct) {
    if (pct >= 70) return '#1E8E3E';
    if (pct >= 35) return '#F9AB00';
    return '#D93025';
}

/* ══════════════════════════════════════════
   PROJECT DURATION HELPER
══════════════════════════════════════════ */
/**
 * Calculate how long a project has been (or was) running.
 * - completed (stage === 'Live' AND actual_live_date is valid): start_date → actual_live_date
 * - in-progress (everything else): start_date → today
 * We deliberately ignore actual_live_date for non-Live projects because that
 * column is often pre-filled with unrelated dates in the source sheet.
 * Returns null if start_date is missing/invalid or duration would be negative.
 */
function calcProjectDuration(p) {
    const start = p.start_date ? parseSmartDate(p.start_date) : null;
    if (!start || isNaN(start.getTime())) return null;

    const isLive     = normalizeStage(p.stage || '') === 'Live';
    const liveRaw    = isLive && p.actual_live_date && !/^tbd$/i.test(String(p.actual_live_date).trim())
        ? parseSmartDate(p.actual_live_date) : null;
    const completed  = !!(liveRaw && !isNaN(liveRaw.getTime()));
    const endDate    = completed ? liveRaw : new Date();

    const days = Math.round((endDate - start) / 86400000);
    if (days < 0) return null;

    let text;
    if (days >= 365)      text = `${(days / 365).toFixed(1)}y`;
    else if (days >= 30)  text = `${Math.round(days / 30)}mo`;
    else                  text = `${days}d`;

    return { days, text, completed };
}

/* ══════════════════════════════════════════
   OVERVIEW HELPERS
══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   OVERVIEW v2 — PRO INTELLIGENCE LAYER
   All helpers prefixed ov_ / renderOv
══════════════════════════════════════════ */

/** Pipeline health score 0-100 from alert-free share of active projects */
function calcHealthScore() {
    const all     = AppState.allProjects.filter(p => {
        if (typeof getProjectLifecycle === 'function' && getProjectLifecycle(p).phase === 'post_live') return false;
        return p.stage !== 'Live';
    });
    const total   = all.length || 1;
    const flagged = getUniqueAlertProjects(AppState.alerts).length;
    const score   = Math.max(0, Math.min(100, Math.round(((total - flagged) / total) * 100)));
    const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Critical';
    const color = score >= 80 ? '#1E8E3E' : score >= 60 ? '#1A73E8' : score >= 40 ? '#F9AB00' : '#D93025';
    const bg    = score >= 80 ? 'rgba(30,142,62,0.08)'   : score >= 60 ? 'rgba(26,115,232,0.08)'
                : score >= 40 ? 'rgba(249,171,0,0.08)'  : 'rgba(217,48,37,0.08)';
    return { score, label, color, bg };
}

function alertBadgeMeta(bucket) {
    const map = {
        overdue:  { label: 'Overdue',         color: '#D93025', bg: 'rgba(217,48,37,0.08)' },
        at_risk:  { label: 'Likely miss',     color: '#F59E0B', bg: 'rgba(249,171,0,0.08)' },
        stalled:  { label: 'Stalled',         color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
        upcoming: { label: 'Releasing soon',  color: '#EC4899', bg: 'rgba(236,72,153,0.08)' },
        delivery_sync: { label: 'Tab sync failed', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
    };
    return map[bucket] || { label: 'Alert', color: '#F59E0B', bg: 'rgba(249,171,0,0.08)' };
}

function directoryAlertMeta(alertBucket) {
    if (!alertBucket) return null;
    return alertBadgeMeta(alertBucket);
}

/** Bucket-specific primary/secondary lines for alert cards and overview rows. */
function alertCardReason(p, bucket) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const fmtShort = (d) => d && !isNaN(d.getTime())
        ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '—';
    switch (bucket) {
        case 'overdue':
            return {
                primary: p.daysToRelease != null && p.daysToRelease < 0
                    ? `${Math.abs(p.daysToRelease)}d overdue`
                    : (p.daysOverdue != null ? `${p.daysOverdue}d overdue` : '—'),
                secondary: `Target: ${formatDateShort(p.release_date)}`,
            };
        case 'at_risk': {
            const tgt = p.target || (p.release_date ? parseSmartDate(p.release_date) : null);
            const pct = p.predProgress != null ? p.predProgress : projectDisplayProgress(p);
            return {
                primary: tgt && !isNaN(tgt.getTime()) ? `Target ${fmtShort(tgt)}` : 'Likely miss',
                secondary: `${pct}% complete`,
            };
        }
        case 'stalled': {
            const prog = projectDisplayProgress(p) || 0;
            const st = p.start_date ? parseSmartDate(p.start_date) : null;
            const daysOld = st && !isNaN(st.getTime()) ? Math.ceil((today - st) / 86400000) : null;
            return {
                primary: daysOld != null ? `${prog}% after ${daysOld}d` : `${prog}%`,
                secondary: 'Stalled: low progress since start',
            };
        }
        case 'upcoming':
            return {
                primary: p.daysToRelease == null ? '—'
                    : p.daysToRelease === 0 ? 'Today!'
                    : `in ${p.daysToRelease}d`,
                secondary: 'Release approaching (on track)',
            };
        default:
            return {
                primary: p.daysToRelease == null ? '—'
                    : p.daysToRelease < 0 ? `${Math.abs(p.daysToRelease)}d overdue`
                    : p.daysToRelease === 0 ? 'Today!'
                    : `in ${p.daysToRelease}d`,
                secondary: formatDateShort(p.release_date),
            };
    }
}

/** Count projects shipped in last N months → array [oldest…newest] */
function buildVelocitySparkline(months = 6) {
    const today = new Date(); today.setHours(0,0,0,0);
    const buckets = Array.from({ length: months }, (_, i) => {
        const d = new Date(today.getFullYear(), today.getMonth() - (months - 1 - i), 1);
        return { label: d.toLocaleString('en-US', { month: 'short' }), count: 0 };
    });
    AppState.allProjects.forEach(p => {
        if (!p.actual_live_date) return;
        const d = parseSmartDate(p.actual_live_date);
        if (!d || isNaN(d.getTime())) return;
        const mIdx = buckets.findIndex((_, i) => {
            const bStart = new Date(today.getFullYear(), today.getMonth() - (months - 1 - i), 1);
            // Bug #9 fix: for the current month (last bucket), use today as end so go-lives
            // this month are counted. Previously bEnd resolved to last day of prior month.
            const bEnd = (featureOn('SPARKLINE_MONTH_FIX') && i === months - 1)
                ? today
                : new Date(today.getFullYear(), today.getMonth() - (months - 1 - i - 1), 0);
            return d >= bStart && d <= bEnd;
        });
        if (mIdx >= 0) buckets[mIdx].count++;
    });
    return buckets;
}

/** Smart insight cards derived from live data */
function buildSmartInsights() {
    const all    = AppState.allProjects;
    const today  = new Date(); today.setHours(0,0,0,0);
    const alerts = AppState.alerts;
    const resMap = AppState.resourceMap;

    const insights = [];

    // 1. Overdue
    if (alerts.overdue.length) {
        insights.push({ icon: Icons.alert, count: alerts.overdue.length, text: `project${alerts.overdue.length > 1 ? 's' : ''} overdue`, severity: 'critical', onclick: "App.navigate('alerts')", detail: alerts.overdue[0]?.name });
    }

    // 2. Releasing soon (alert engine)
    if (alerts.upcoming.length) {
        insights.push({ icon: Icons.calendar, count: alerts.upcoming.length, text: `releasing soon`, severity: 'warning', onclick: "App.navigate('alerts')", detail: alerts.upcoming[0]?.name });
    }

    // 2b. Predictive likely miss (alert engine)
    if (alerts.at_risk.length) {
        insights.push({ icon: Icons.alert, count: alerts.at_risk.length, text: `likely to miss deadline`, severity: 'warning', onclick: "App.navigate('alerts')", detail: alerts.at_risk[0]?.name });
    }

    // 3. Resource conflicts
    const conflictCount = Object.values(resMap).filter(p => p.conflicts.length > 0).length;
    if (conflictCount) {
        insights.push({ icon: Icons.zap, count: conflictCount, text: `resource conflict${conflictCount > 1 ? 's' : ''}`, severity: 'warning', onclick: "App.navigate('resources')", detail: 'Check bandwidth' });
    }

    // 4. Recently shipped
    const lastShipped = computeOverviewDateMetrics(all, today).recentlyLive[0];
    if (lastShipped) {
        const { badge, badgeColor } = getLaunchTimingBadge(lastShipped, today);
        insights.push({ icon: Icons.checkCircle, count: null, text: `last shipped${badge ? ' · ' + badge : ''}`, severity: 'success', onclick: `App.handleCardClick('${lastShipped.id}')`, detail: lastShipped.name });
    }

    // 5. Stalled projects
    if (alerts.stalled?.length) {
        insights.push({ icon: Icons.pause, count: alerts.stalled.length, text: `stalled project${alerts.stalled.length > 1 ? 's' : ''}`, severity: 'info', onclick: "App.navigate('alerts')", detail: 'No recent progress' });
    }

    // 6. Stage bottleneck (stage with most alert-flagged projects)
    const stagePressure = {};
    getUniqueAlertProjects(alerts).forEach(p => {
        const w = alertBucketFor(p.id, alerts) === 'overdue' ? 2 : 1;
        stagePressure[p.stage] = (stagePressure[p.stage] || 0) + w;
    });
    const bottleneck = Object.entries(stagePressure).sort((a, b) => b[1] - a[1])[0];
    if (bottleneck && bottleneck[1] >= 2) {
        insights.push({ icon: Icons.alert, count: null, text: `bottleneck: ${bottleneck[0]}`, severity: 'critical', onclick: "App.navigate('pipeline')", detail: `${bottleneck[1]} issues` });
    }

    // 7. Avg progress this month
    const avg = AppState.avgProgress;
    insights.push({ icon: '📊', count: avg + '%', text: 'avg progress', severity: 'neutral', onclick: "App.navigate('analytics')", detail: `across ${all.length} projects` });

    return insights;
}

function renderOverviewHero() {
    const hs  = calcHealthScore();
    const CIRC = 314.16; // 2π×50
    const offset = +(CIRC * (1 - hs.score / 100)).toFixed(2);

    // Velocity
    const spark = buildVelocitySparkline(6);
    const maxV  = Math.max(...spark.map(b => b.count), 1);
    const totalShipped30 = spark.slice(-2).reduce((s, b) => s + b.count, 0);
    const sparkBars = spark.map((b, i) => {
        const h = Math.max(4, Math.round((b.count / maxV) * 52));
        const isLast = i === spark.length - 1;
        return `<div class="ov-spark-bar" style="height:${h}px;${isLast ? 'background:var(--accent-primary);' : ''}" title="${b.label}: ${b.count} shipped"></div>`;
    }).join('');

    const dateMetrics = computeOverviewDateMetrics(AppState.allProjects);
    const today = dateMetrics.today;
    const critical = dateMetrics.critical14d;
    const critPct  = Math.min(100, Math.round((critical.length / Math.max(AppState.allProjects.length, 1)) * 100 * 3));
    const critColor = critical.length > 3 ? '#D93025' : critical.length > 1 ? '#F9AB00' : '#1A73E8';
    const critOffset = +(CIRC * (1 - critPct / 100)).toFixed(2);

    return `
    <div class="ov-hero">

        <!-- Health Score Ring -->
        <div class="ov-hero-card" style="background:${hs.bg}; border-color:${hs.color}30;" onclick="App.navigate('analytics')" title="Go to Analytics">
            <div class="ov-hero-eyebrow">Pipeline Health</div>
            <div class="ov-hero-body">
                <div class="ov-ring-wrap">
                    <svg viewBox="0 0 120 120" width="100" height="100" class="ov-ring-svg">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="12"/>
                        <circle cx="60" cy="60" r="50" fill="none" stroke="${hs.color}" stroke-width="12"
                            stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}"
                            stroke-linecap="round" transform="rotate(-90 60 60)"
                            class="ov-ring-arc" data-offset="${offset}"/>
                    </svg>
                    <div class="ov-ring-label" style="color:${hs.color}">
                        <div class="ov-ring-num">${hs.score}</div>
                        <div class="ov-ring-sub">${hs.label}</div>
                    </div>
                </div>
                <div class="ov-hero-right">
                    <div class="ov-hero-stat"><span class="ov-s-num" style="color:#1E8E3E">${AppState.allProjects.filter(p=>p.status==='on_track').length}</span><span class="ov-s-lbl">on track</span></div>
                    <div class="ov-hero-stat"><span class="ov-s-num" style="color:#F9AB00">${AppState.alertAtRiskCount}</span><span class="ov-s-lbl">likely miss</span></div>
                    <div class="ov-hero-stat"><span class="ov-s-num" style="color:#D93025">${AppState.alertOverdueCount}</span><span class="ov-s-lbl">overdue</span></div>
                </div>
            </div>
        </div>

        <!-- Velocity Sparkline -->
        <div class="ov-hero-card" onclick="App.navigate('analytics')" title="Go to Analytics">
            <div class="ov-hero-eyebrow">30-day Velocity</div>
            <div style="display:flex; align-items:flex-end; gap:16px; margin-top:8px;">
                <div>
                    <div class="ov-hero-bignum" style="color:var(--accent-primary)">${totalShipped30}</div>
                    <div class="ov-hero-bignumsub">projects shipped</div>
                </div>
                <div class="ov-spark-track">${sparkBars}</div>
            </div>
            <div class="ov-spark-labels">${spark.map(b => `<span>${b.label}</span>`).join('')}</div>
            <div class="ov-hero-footer">Total live: <strong>${AppState.liveCount}</strong></div>
        </div>

        <!-- Critical Urgency Ring -->
        <div class="ov-hero-card" style="${critical.length > 3 ? 'background:rgba(217,48,37,0.07);border-color:rgba(217,48,37,0.25);' : ''}" onclick="App.navigate('alerts')" title="View Alerts">
            <div class="ov-hero-eyebrow">Next 14 Days</div>
            <div class="ov-hero-body">
                <div class="ov-ring-wrap">
                    <svg viewBox="0 0 120 120" width="90" height="90" class="ov-ring-svg">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="12"/>
                        <circle cx="60" cy="60" r="50" fill="none" stroke="${critColor}" stroke-width="12"
                            stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}"
                            stroke-linecap="round" transform="rotate(-90 60 60)"
                            class="ov-ring-arc" data-offset="${critOffset}"/>
                    </svg>
                    <div class="ov-ring-label" style="color:${critColor}">
                        <div class="ov-ring-num" style="font-size:28px">${critical.length}</div>
                        <div class="ov-ring-sub">releases</div>
                    </div>
                </div>
                <div class="ov-hero-right">
                    ${critical.slice(0,3).map(p => {
                        const d = parseSmartDate(p.release_date); d.setHours(0,0,0,0);
                        const days = Math.ceil((d - today) / 86400000);
                        return `<div class="ov-crit-item" onclick="event.stopPropagation();App.handleCardClick('${p.id}')">
                            <span class="ov-crit-days" style="color:${days<=3?'#D93025':days<=7?'#F9AB00':'#1A73E8'}">${days}d</span>
                            <span class="ov-crit-name">${escapeHtml(p.name.length>18?p.name.slice(0,17)+'…':p.name)}</span>
                        </div>`;
                    }).join('')}
                    ${critical.length > 3 ? `<div style="font-size:10px;color:var(--text-muted);margin-top:4px;">+${critical.length-3} more</div>` : ''}
                </div>
            </div>
        </div>
    </div>`;
}

function renderInsightStrip() {
    const insights = buildSmartInsights();
    if (!insights.length) return '';

    const colorMap = {
        critical: { bg: 'rgba(217,48,37,0.08)',  border: 'rgba(217,48,37,0.2)',  text: '#D93025' },
        warning:  { bg: 'rgba(249,171,0,0.08)',   border: 'rgba(249,171,0,0.25)', text: '#b45309' },
        success:  { bg: 'rgba(30,142,62,0.08)',   border: 'rgba(30,142,62,0.2)',  text: '#1E8E3E' },
        info:     { bg: 'rgba(26,115,232,0.08)',  border: 'rgba(26,115,232,0.2)', text: '#1A73E8' },
        neutral:  { bg: 'var(--bg-subtle)',        border: 'var(--border-light)',  text: 'var(--text-secondary)' },
    };

    const cards = insights.map(ins => {
        const c = colorMap[ins.severity] || colorMap.neutral;
        const iconHtml = ins.icon
            ? `<div class="ov-insight-icon" style="color:${c.text}" aria-hidden="true">${ins.icon}</div>`
            : '';
        return `
        <div class="ov-insight-card" style="background:${c.bg};border-color:${c.border};"
             onclick="${ins.onclick}" title="${escapeHtml(ins.detail || '')}">
            ${iconHtml}
            <div class="ov-insight-body">
                ${ins.count !== null ? `<div class="ov-insight-count" style="color:${c.text}">${ins.count}</div>` : ''}
                <div class="ov-insight-text">${ins.text}</div>
                ${ins.detail ? `<div class="ov-insight-detail">${escapeHtml(ins.detail)}</div>` : ''}
            </div>
            <div class="ov-insight-arrow" style="color:${c.text}">→</div>
        </div>`;
    }).join('');

    return `<div class="ov-insight-strip">${cards}</div>`;
}

/** Stacked avatars for owner + developer + QA + BA on overview cards. */
function renderProjectTeamAvatars(project, maxShow = 3) {
    const team = typeof projectTeamMembers === 'function' ? projectTeamMembers(project, maxShow + 3) : [];
    if (!team.length) {
        const fallback = project?.owner || '?';
        return `<div class="ov-risk-avatar" style="background:${stringToColor(fallback)}" title="${escapeHtml(fallback)}">${getInitials(fallback)}</div>`;
    }
    const shown = team.slice(0, maxShow);
    const extra = team.length - shown.length;
    const avatars = shown.map((name, i) =>
        `<div class="ov-risk-avatar ov-team-avatar" style="background:${stringToColor(name)};z-index:${10 - i}" title="${escapeHtml(name)}">${getInitials(name)}</div>`
    ).join('');
    const more = extra > 0
        ? `<span class="ov-team-more" title="${escapeHtml(team.slice(maxShow).join(', '))}">+${extra}</span>`
        : '';
    return `<div class="ov-team-avatars" title="${escapeHtml(team.join(', '))}">${avatars}${more}</div>`;
}

function renderAtRiskNow() {
    const today = new Date(); today.setHours(0,0,0,0);
    const risky = getPrioritizedAlerts(AppState.alerts, 5);

    if (!risky.length) return `
    <div class="ov-section-header"><h2 class="ov-section-title">Needs Attention</h2></div>
    <div class="ov-empty-state">All projects are on track</div>`;

    const CIRC_SM = 163;
    const rows = risky.map(p => {
        const bucket = alertBucketFor(p.id, AppState.alerts);
        const meta   = alertBadgeMeta(bucket);
        const team   = typeof projectTeamMembers === 'function' ? projectTeamMembers(p) : [];
        const prog   = projectDisplayProgress(p) || 0;
        const pOffset = +(CIRC_SM * (1 - prog / 100)).toFixed(1);
        const reason = alertCardReason(p, bucket);

        // Hide projected slip on Needs Attention cards (unreliable for low-progress projects).
        let daysText = bucket === 'at_risk' ? '' : reason.primary;
        let daysColor = 'var(--text-muted)';
        if (bucket === 'overdue') daysColor = '#D93025';
        else if (bucket === 'stalled') daysColor = '#3B82F6';
        else if (p.daysToRelease != null) {
            daysColor = p.daysToRelease < 0 ? '#D93025' : p.daysToRelease <= 3 ? '#F59E0B' : 'var(--text-muted)';
        }

        const teamHint = team.length > 1
            ? `<span style="font-size:10px;color:var(--text-muted);">${team.length} people</span>`
            : '';

        const stageLabel = typeof getProjectLifecycle === 'function'
            ? getProjectLifecycle(p).displayLabel
            : p.stage;

        return `
        <div class="ov-risk-item" style="border-left:3px solid ${meta.color};background:${meta.bg};"
             onclick="App.handleCardClick('${p.id}')">
            <div class="ov-risk-ring-wrap">
                <svg viewBox="0 0 60 60" width="44" height="44">
                    <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(0,0,0,0.07)" stroke-width="6"/>
                    <circle cx="30" cy="30" r="26" fill="none" stroke="${meta.color}" stroke-width="6"
                        stroke-dasharray="${CIRC_SM}" stroke-dashoffset="${pOffset}"
                        stroke-linecap="round" transform="rotate(-90 30 30)"/>
                </svg>
                <div class="ov-risk-ring-pct" style="color:${meta.color}">${prog}%</div>
            </div>
            <div class="ov-risk-info">
                <div class="ov-risk-name">${escapeHtml(p.name)}</div>
                <div class="ov-risk-meta">
                    <span class="ov-risk-badge" style="background:${meta.color}22;color:${meta.color};">${meta.label}</span>
                    <span style="font-size:11px;color:var(--text-muted);">${escapeHtml(stageLabel)}</span>
                    ${teamHint}
                </div>
            </div>
            <div class="ov-risk-right">
                ${daysText ? `<div class="ov-risk-days" style="color:${daysColor}">${daysText}</div>` : ''}
                ${renderProjectTeamAvatars(p)}
            </div>
        </div>`;
    }).join('');

    return `
    <div class="ov-section-header">
        <h2 class="ov-section-title">Needs Attention</h2>
        <span class="ov-section-badge ov-section-badge--red">${risky.length}</span>
    </div>
    <div class="ov-risk-list">${rows}</div>`;
}

function renderUpcomingLaunches() {
    const horizon = CONFIG.UPCOMING_LAUNCH_DAYS ?? 30;
    const { today, upcomingLaunches } = computeOverviewDateMetrics(AppState.allProjects);
    const upcoming = upcomingLaunches.slice(0, 4);

    if (!upcoming.length) return '';

    const cards = upcoming.map(p => {
        const d = startOfDay(parseSmartDate(p.release_date));
        const days = Math.ceil((d - today) / 86400000);
        const dispProg = projectDisplayProgress(p);
        const urgColor = days <= 3 ? '#D93025' : days <= 7 ? '#F9AB00' : '#1A73E8';
        const urgBg    = days <= 3 ? 'rgba(217,48,37,0.08)' : days <= 7 ? 'rgba(249,171,0,0.07)' : 'rgba(26,115,232,0.07)';
        const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const init = getInitials(p.owner);
        const avc  = stringToColor(p.owner);

        return `
        <div class="ov-launch-card" style="border-top:3px solid ${urgColor};background:${urgBg};"
             onclick="App.handleCardClick('${p.id}')">
            <div class="ov-launch-head">
                <div class="ov-launch-days" style="color:${urgColor}">${days === 0 ? 'Today' : `${days}d`}</div>
                <div class="ov-launch-date">${dateLabel}</div>
            </div>
            <div class="ov-launch-name">${escapeHtml(p.name)}</div>
            <div class="ov-launch-meta">
                <span class="ov-launch-client">${escapeHtml(p.client || '—')}</span>
                <div class="ov-launch-avatar" style="background:${avc}" title="${escapeHtml(p.owner)}">${init}</div>
            </div>
            <div class="ov-launch-bar" title="${dispProg}% complete">
                <div style="width:${dispProg}%;height:3px;background:${urgColor};border-radius:99px;transition:width 0.8s;"></div>
            </div>
        </div>`;
    }).join('');

    return `
    <div class="ov-section-header" style="margin-top:24px;">
        <h2 class="ov-section-title">Upcoming Launches</h2>
        <span class="ov-section-badge ov-section-badge--blue">${upcoming.length} · next ${horizon}d</span>
    </div>
    <div class="ov-launch-grid">${cards}</div>`;
}

function renderStageFunnel() {
    const ws = (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    const funnel = typeof getFunnelStageCounts === 'function'
        ? getFunnelStageCounts()
        : { stages: getFunnelStages ? getFunnelStages(ws) : ['Planning','Development','QA','Release','Live'], counts: AppState.stageCounts, overdueByStage: {}, alertByStage: {}, total: 0 };
    const { stages, counts, overdueByStage, alertByStage } = funnel;
    const stageColors = typeof getFunnelStageColors === 'function'
        ? getFunnelStageColors(ws)
        : {
            Planning: '#8B5CF6', Development: '#1A73E8', QA: '#F9AB00',
            Release: '#EF4444', Live: '#1E8E3E',
        };
    const maxCount = Math.max(...stages.map(s => counts[s] || 0), 1);

    const rows = stages.map(s => {
        const count    = counts[s] || 0;
        const overdueN = overdueByStage[s] || 0;
        const alertN   = alertByStage[s] || 0;
        const pct      = Math.round((count / maxCount) * 100);
        const color    = stageColors[s] || 'var(--accent-primary)';
        const safeStage = String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `
        <div class="ov-funnel-row" onclick="App.analyticsDrill('stage','${safeStage}')">
            <div class="ov-funnel-label">${s}</div>
            <div class="ov-funnel-track">
                <div class="ov-funnel-fill" style="width:0%;background:${color};" data-fill="${pct}"></div>
            </div>
            <div class="ov-funnel-right">
                <span class="ov-funnel-count">${count}</span>
                ${overdueN ? `<span class="ov-funnel-chip ov-funnel-chip--red">${overdueN}</span>` : ''}
                ${alertN ? `<span class="ov-funnel-chip ov-funnel-chip--amber">${alertN}</span>` : ''}
            </div>
        </div>`;
    }).join('');

    const unitLabel = typeof deliveryUnitWord === 'function' ? deliveryUnitWord(true) : 'pages';
    const isClickUp = typeof isClickUpWorkspace === 'function' && isClickUpWorkspace(ws);
    const emptyHint = isClickUp
        ? 'Tasks appear by ClickUp status. Add subtasks for deliverable-level funnel counts.'
        : 'No linked delivery pages yet.';
    const body = funnel.total
        ? rows
        : `<div class="ov-funnel-empty">${emptyHint}</div>`;

    return `
    <div class="ov-section-header">
        <h2 class="ov-section-title">Stage Funnel</h2>
        <span class="ov-section-badge">${funnel.total || 0} ${unitLabel}</span>
    </div>
    <div class="card-light ov-funnel-card${funnel.total ? '' : ' ov-funnel-card--empty'}">${body}</div>`;
}

function renderTeamStatusGrid() {
    const resMap = AppState.resourceMap;
    const ownerMap = {};
    AppState.allProjects.forEach(p => {
        const name = (p.owner || '').trim();
        if (!name || name === 'Unassigned') return;
        if (!ownerMap[name]) ownerMap[name] = { name, total: 0, delayed: 0, atRisk: 0 };
        ownerMap[name].total++;
        if (p.status === 'delayed')  ownerMap[name].delayed++;
        else if (p.status === 'at_risk') ownerMap[name].atRisk++;
    });
    const owners = Object.values(ownerMap).sort((a, b) => b.total - a.total).slice(0, 10);
    if (!owners.length) return '';

    const chips = owners.map(o => {
        const init    = getInitials(o.name);
        const avc     = stringToColor(o.name);
        const rEntry  = resMap[o.name];
        const hasConflict = rEntry && rEntry.conflicts.length > 0;
        const ringColor   = hasConflict ? '#D93025' : o.delayed ? '#F9AB00' : '#1E8E3E';
        const ringLabel   = hasConflict ? 'Conflict' : o.delayed ? `${o.delayed} delayed` : `${o.total} active`;

        return `
        <div class="ov-person-chip" onclick="App.setFilterAndNavigate('owner','${escapeHtml(o.name)}','projects')"
             title="${escapeHtml(o.name)} · ${ringLabel}">
            <div class="ov-person-avatar-wrap" style="--ring:${ringColor};">
                <div class="ov-person-avatar" style="background:${avc}">${init}</div>
                <div class="ov-person-ring" style="border-color:${ringColor};"></div>
            </div>
            <div class="ov-person-name">${escapeHtml(o.name.split(' ')[0])}</div>
            <div class="ov-person-count" style="color:${ringColor};">${o.total}</div>
        </div>`;
    }).join('');

    return `
    <div class="ov-section-header" style="margin-top:20px;">
        <h2 class="ov-section-title">Team Status</h2>
        <a class="ov-section-link" onclick="App.navigate('resources')">Full view →</a>
    </div>
    <div class="ov-person-grid">${chips}</div>`;
}

/* Legacy helpers kept for backward-compat / other callers */
function renderKpiStrip() {
    const total   = AppState.totalProjects;
    const live    = AppState.liveCount;
    const inprog  = AppState.inProgress;
    const overdue = AppState.alertOverdueCount;
    const atRisk  = AppState.alertAtRiskCount;
    const avg     = AppState.avgProgress;

    const tiles = [
        { label: 'Total Projects', value: total,       sub: 'all tracked',              cls: '',                              onclick: "App.navigate('projects')" },
        { label: 'Live',           value: live,        sub: 'shipped',                  cls: 'kpi-tile--live',                onclick: "App.setFilterAndNavigate('stage','Live','projects')" },
        { label: 'In Progress',    value: inprog,      sub: 'active delivery',          cls: '',                              onclick: "App.navigate('pipeline')" },
        { label: 'Overdue',        value: overdue,     sub: overdue > 0 ? 'needs attention' : 'all clear',  cls: overdue > 0 ? 'kpi-tile--delayed' : '',  pulse: overdue > 0, onclick: "App.navigate('alerts')" },
        { label: 'Likely Miss',    value: atRisk,      sub: atRisk > 0  ? 'projected late'  : 'all clear',  cls: atRisk  > 0 ? 'kpi-tile--risk'    : '',  onclick: "App.navigate('alerts')" },
        { label: 'Avg. Progress',  value: avg + '%',   sub: 'across all projects',      cls: 'kpi-tile--progress', isProgress: true, progress: avg, onclick: '' },
    ];

    const tileHtml = tiles.map(t => `
        <div class="kpi-tile ${t.cls}" ${t.onclick ? `onclick="${t.onclick}" style="cursor:pointer"` : ''}>
            <div class="kpi-tile__label">${t.label}${t.pulse ? '<span class="kpi-pulse"></span>' : ''}</div>
            <div class="kpi-tile__value">${t.value}</div>
            ${t.isProgress ? `<div class="kpi-tile__bar"><div class="kpi-tile__bar-fill" style="width:${t.progress}%"></div></div>` : ''}
            <div class="kpi-tile__sub">${t.sub}</div>
        </div>`).join('');

    return `<div class="kpi-strip">${tileHtml}</div>`;
}

function renderPipelineHealthCard() {
    const all     = AppState.allProjects;
    const total   = all.length || 1;
    // Use non-Live pool as denominator for bar percentages — matches the headline "on track %" formula
    // (HEALTH_SCORE_UNIFIED aligns hero ring + card headline; bars must use the same pool).
    const nonLiveTotal = Math.max(all.filter(p => p.stage !== 'Live').length, 1);
    const barDenom = featureOn('HEALTH_SCORE_UNIFIED') ? nonLiveTotal : total;
    const flagged = new Set(getUniqueAlertProjects(AppState.alerts).map(p => p.id));
    const onTrack = all.filter(p => !flagged.has(p.id) && p.stage !== 'Live').length;
    const overdue = AppState.alertOverdueCount;
    const atRisk  = AppState.alertAtRiskCount;
    const upcoming = AppState.alertUpcomingCount;
    const stalled = AppState.alertStalledCount;

    // Average completion time from projects that have both start_date and actual_live_date
    const completedDurations = all
        .map(p => calcProjectDuration(p))
        .filter(d => d && d.completed);
    const avgDays = completedDurations.length
        ? Math.round(completedDurations.reduce((s, d) => s + d.days, 0) / completedDurations.length)
        : null;
    let avgDurText = '';
    if (avgDays !== null) {
        if (avgDays >= 365)     avgDurText = `${(avgDays / 365).toFixed(1)}y avg`;
        else if (avgDays >= 30) avgDurText = `${Math.round(avgDays / 30)}mo avg`;
        else                    avgDurText = `${avgDays}d avg`;
    }

    const rows = [
        { label: 'On Track', count: onTrack, color: '#1E8E3E' },
        { label: 'Overdue',  count: overdue, color: '#D93025' },
        { label: 'Likely Miss', count: atRisk, color: '#F59E0B' },
        { label: 'Releasing Soon', count: upcoming, color: '#EC4899' },
        { label: 'Stalled',  count: stalled, color: '#3B82F6' },
    ];

    const rowsHtml = rows.map(r => {
        const pct = Math.round((r.count / barDenom) * 100);
        return `
        <div class="health-row">
            <div class="health-row__label" style="color:${r.color}">${r.label}</div>
            <div class="health-row__track">
                <div class="health-row__fill" style="width:0%;background:${r.color}" data-fill="${pct}"></div>
            </div>
            <div class="health-row__count">${r.count}</div>
        </div>`;
    }).join('');

    return `
    <div class="card-dark pipeline-health-card">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px;">
            <div>
                <div style="font-size:16px; font-weight:700; margin-bottom:4px;">Pipeline Health</div>
                <div style="font-size:13px; opacity:0.6; display:flex; align-items:center; gap:10px;">
                    <span>${total} projects tracked</span>
                    ${avgDurText ? `<span style="color:rgba(255,255,255,0.5); font-size:11px;">·</span><span style="font-size:11px; font-weight:700; color:rgba(255,255,255,0.5);">${avgDurText} to ship</span>` : ''}
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:28px; font-weight:900; line-height:1;">${Math.round(onTrack / barDenom * 100)}%</div>
                <div style="font-size:11px; opacity:0.6; margin-top:2px;">on track</div>
            </div>
        </div>
        <div class="health-rows">${rowsHtml}</div>
    </div>`;
}

function renderOverviewLiveRow(p, today) {
    const init = getInitials(p.owner);
    const avc  = stringToColor(p.owner);
    const lc   = typeof getProjectLifecycle === 'function' ? getProjectLifecycle(p) : null;
    const dur  = calcProjectDuration(p);
    const durText = dur ? ` · ${dur.text} to build` : '';
    const { badge, badgeColor } = getLaunchTimingBadge(p, today);
    const dateMeta = isValidParsedDate(p.actual_live_date)
        ? formatDateShort(p.actual_live_date)
        : (lc?.phase === 'post_live' ? lc.displayLabel : '—');
    const rightBadge = lc?.phase === 'post_live'
        ? `<div class="live-row__badge" style="color:#1E8E3E;background:rgba(30,142,62,0.12);">${escapeHtml(lc.displayLabel)}</div>`
        : (badge ? `<div class="live-row__badge" style="color:${badgeColor};background:${badgeColor}22;">${badge}</div>` : '');
    return `
        <div class="live-row" onclick="App.handleCardClick('${p.id}')">
            <div class="live-row__avatar" style="background:${avc}">${init}</div>
            <div class="live-row__info">
                <div class="live-row__name">${escapeHtml(p.name)}</div>
                <div class="live-row__meta">${escapeHtml(p.client || '—')} · ${escapeHtml(dateMeta)}${durText}</div>
            </div>
            ${rightBadge}
        </div>`;
}

function renderRecentLive() {
    const { recentlyLive } = computeOverviewDateMetrics(AppState.allProjects);
    const today = startOfDay(new Date());
    const live = recentlyLive.slice(0, 3);

    if (!live.length) return '';

    const rows = live.map(p => renderOverviewLiveRow(p, today)).join('');

    return `
    <div>
        <h2 class="section-label" style="margin-top:8px; display:flex; align-items:center; gap:8px;">
            Recently Live
            <span style="font-size:11px; background:rgba(30,142,62,0.15); color:#1E8E3E; padding:3px 8px; border-radius:99px; font-weight:700;">${live.length}</span>
        </h2>
        <div class="live-list">${rows}</div>
    </div>`;
}

function renderThisWeekStrip() {
    const today = new Date(); today.setHours(0,0,0,0);
    const dow   = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));

    const DAY_LABELS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

    const cells = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        d.setHours(0,0,0,0);
        const isToday    = d.getTime() === today.getTime();
        const isWeekend  = i >= 5;
        const releases   = AppState.allProjects.filter(p => {
            if (!p.release_date) return false;
            const rd = parseSmartDate(p.release_date);
            if (isNaN(rd.getTime())) return false;
            const rd2 = new Date(rd); rd2.setHours(0,0,0,0);
            return rd2.getTime() === d.getTime();
        });
        const dots = releases.map(p => {
            const bucket = alertBucketFor(p.id, AppState.alerts);
            const dotCls = bucket === 'overdue' ? 'delayed' : bucket === 'at_risk' ? 'at_risk' : bucket === 'stalled' ? 'on_track' : p.status;
            return `<span class="week-dot week-dot--${dotCls}" title="${escapeHtml(p.name)}${bucket ? ' · ' + alertBadgeMeta(bucket).label : ''}"></span>`;
        }).join('') || '<span class="week-dot week-dot--empty"></span>';

        return `
        <div class="week-cell ${isToday ? 'week-cell--today' : ''} ${isWeekend ? 'week-cell--weekend' : ''} ${releases.length ? 'week-cell--has-release' : ''}">
            <div class="week-cell__day">${DAY_LABELS[i]}</div>
            <div class="week-cell__date">${d.getDate()}</div>
            <div class="week-cell__dots">${dots}</div>
        </div>`;
    }).join('');

    const weekEnd = new Date(monday); weekEnd.setDate(monday.getDate() + 6);
    const weekReleases = AppState.allProjects.filter(p => {
        if (!p.release_date) return false;
        const rd = parseSmartDate(p.release_date); if (isNaN(rd.getTime())) return false;
        return rd >= monday && rd <= weekEnd;
    }).length;

    return `
    <div>
        <h2 class="section-label" style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
            This Week
            ${weekReleases ? `<span style="font-size:11px; background:var(--bg-yellow); color:#b45309; padding:3px 8px; border-radius:99px; font-weight:700;">${weekReleases} release${weekReleases > 1 ? 's' : ''}</span>` : ''}
        </h2>
        <div class="week-strip card-light" style="padding:14px 16px; border-radius:16px;">
            <div class="week-cells">${cells}</div>
        </div>
    </div>`;
}

function renderTeamWorkload() {
    const resMap = AppState.resourceMap;
    const people = Object.values(resMap)
        .filter(p => p.activeCount > 0 || p.conflicts?.length)
        .sort((a, b) => b.activeCount - a.activeCount)
        .slice(0, 6);
    if (!people.length) return '';
    const maxCount = people[0].activeCount || 1;

    const rows = people.map(o => {
        const init    = getInitials(o.name);
        const avc     = stringToColor(o.name);
        const barPct  = Math.round((o.activeCount / maxCount) * 100);
        const hasConflict = o.conflicts?.length > 0;
        const roles = [...new Set(o.assignments.filter(a => !a.completed).map(a => a.role))].slice(0, 2).join(', ');

        let alertBadge = '';
        if (hasConflict)    alertBadge = `<span class="workload-badge workload-badge--conflict" onclick="event.stopPropagation();App.navigate('resources')">&#9888; conflict</span>`;
        else if (o.activeCount >= 3) alertBadge = `<span class="workload-badge workload-badge--risk">${o.activeCount} active</span>`;

        return `
        <div class="workload-row" onclick="App.setFilterAndNavigate('owner','${escapeHtml(o.name)}','projects')">
            <div class="workload-row__avatar" style="background:${avc}">${init}</div>
            <div class="workload-row__body">
                <div class="workload-row__top">
                    <div class="workload-row__name">${escapeHtml(o.name)}</div>
                    <div class="workload-row__right">
                        <span class="workload-count">${o.activeCount} project${o.activeCount !== 1 ? 's' : ''}</span>
                        ${alertBadge}
                    </div>
                </div>
                <div class="workload-bar">
                    <div class="workload-bar__fill" style="width:0%" data-fill="${barPct}"></div>
                </div>
                ${roles ? `<div class="workload-roles">${escapeHtml(roles)}</div>` : ''}
            </div>
        </div>`;
    }).join('');

    return `
    <div>
        <h2 class="section-label" style="margin-bottom:12px;">Team Workload</h2>
        <div class="card-light workload-card">${rows}</div>
    </div>`;
}

function renderFreeingSoon() {
    const today = new Date(); today.setHours(0,0,0,0);
    const resMap = AppState.resourceMap;
    const people = Object.values(resMap)
        .filter(p => p.freeFrom && p.freeFrom > today && p.activeCount > 0)
        .sort((a, b) => a.freeFrom - b.freeFrom)
        .slice(0, 3);
    if (!people.length) return '';

    const rows = people.map(p => {
        const init = getInitials(p.name);
        const avc  = stringToColor(p.name);
        const days = Math.ceil((p.freeFrom - today) / 86400000);
        const dateLabel = p.freeFrom.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const urgency   = days <= 7 ? 'res-free-chip--soon' : days <= 14 ? 'res-free-chip--near' : '';
        const roleList  = [...new Set(p.assignments.filter(a => !a.completed).map(a => a.role))].join(', ');
        return `
        <div class="res-freeing-row" onclick="App.navigate('resources')">
            <div class="res-freeing-avatar" style="background:${avc}">${init}</div>
            <div class="res-freeing-info">
                <div class="res-freeing-name">${escapeHtml(p.name)}</div>
                <div class="res-freeing-role">${escapeHtml(roleList)}</div>
            </div>
            <div class="res-free-chip ${urgency}">free ${dateLabel}</div>
        </div>`;
    }).join('');

    // count total people with conflicts
    const conflictCount = Object.values(resMap).filter(p => p.conflicts.length > 0).length;

    return `
    <div>
        <h2 class="section-label" style="margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            Availability
            ${conflictCount ? `<span class="res-conflict-count" onclick="App.navigate('resources')" style="cursor:pointer">${conflictCount} conflict${conflictCount > 1 ? 's' : ''}</span>` : ''}
        </h2>
        <div class="card-light res-freeing-card">${rows}</div>
    </div>`;
}

function buildOverviewTaskRows(tab) {
    let list = [];
    const dateMetrics = computeOverviewDateMetrics(AppState.allProjects);

    if (tab === 'overdue') {
        list = AppState.alerts.overdue;
    } else if (tab === 'milestones') {
        list = dateMetrics.milestones30d.slice(0, 6);
    } else if (tab === 'alerts') {
        list = getPrioritizedAlerts(AppState.alerts, 6);
    } else {
        list = AppState.alerts.upcoming.slice(0, 5);
    }

    if (!list.length) {
        const msg = tab === 'overdue' ? 'No overdue projects.'
            : tab === 'milestones' ? 'No releases in the next 30 days.'
            : tab === 'alerts' ? 'No active alerts.'
            : 'No upcoming deadlines.';
        return `<div class="task-meta" style="padding:12px 0;">${msg}</div>`;
    }

    const iconKeys = ['globe', 'handshake', 'lit', 'math', 'music'];
    return list.map((p, i) => {
        const bg      = PASTELS[(i + 2) % PASTELS.length];
        const iconKey = iconKeys[i % iconKeys.length];
        const bucket  = tab === 'alerts' ? alertBucketFor(p.id, AppState.alerts) : (tab === 'overdue' ? 'overdue' : 'upcoming');
        const reason  = alertCardReason(p, bucket);
        const daysText  = reason.primary;
        const daysColor = bucket === 'overdue' ? 'var(--status-delayed)'
            : bucket === 'at_risk' ? 'var(--status-at-risk)'
            : bucket === 'stalled' ? '#3B82F6'
            : (p.daysToRelease != null && p.daysToRelease < 0) ? 'var(--status-delayed)'
            : (p.daysToRelease != null && p.daysToRelease <= 3) ? 'var(--status-at-risk)'
            : 'var(--text-muted)';
        return `
        <div class="task-item" onclick="App.handleCardClick('${p.id}')" style="cursor:pointer">
            <div class="task-icon-wrap ${bg}">${Icons[iconKey]}</div>
            <div class="task-info">
                <div class="task-title">${escapeHtml(p.name)}</div>
                <div class="task-meta">${escapeHtml(p.owner)} · <span style="color:${daysColor};font-weight:700;">${daysText}</span></div>
            </div>
        </div>`;
    }).join('');
}

function renderDonutLegend() {
    const counts = AppState.stageCounts;
    const stages = [
        { name: 'Planning',    color: 'var(--stage-planning)' },
        { name: 'Development', color: 'var(--stage-dev)'      },
        { name: 'QA',          color: 'var(--stage-qa)'       },
        { name: 'Release',     color: 'var(--stage-release)'  },
        { name: 'Live',        color: 'var(--stage-live)'     },
    ];
    const items = stages.map(s => `
        <div class="donut-legend-item">
            <span class="donut-legend-dot" style="background:${s.color}"></span>
            <span class="donut-legend-name">${s.name}</span>
            <span class="donut-legend-count">${counts[s.name] || 0}</span>
        </div>`).join('');
    return `<div class="donut-legend">${items}</div>`;
}

/* ══════════════════════════════════════════
   VIEW: OVERVIEW v2 — Pro Mission Control
══════════════════════════════════════════ */
function renderOverview(projects) {
    // Animate arcs + bars after paint (skip on silent background refresh to avoid flicker)
    if (typeof App !== 'undefined' && !App._softRender) {
        setTimeout(() => {
            requestAnimationFrame(() => {
                if (typeof App !== 'undefined' && App._applyViewPaint) {
                    const root = document.getElementById('content-area');
                    App._applyViewPaint(root);
                }
            });
        }, 60);
    }

    const dateMetrics = computeOverviewDateMetrics(AppState.allProjects);
    const today = dateMetrics.today;
    const recentLive = dateMetrics.recentlyLive.slice(0, 3);

    const recentLiveRows = recentLive.map(p => renderOverviewLiveRow(p, today)).join('');

    return `
    <!-- ── Hero Metrics ── -->
    ${renderOverviewHero()}

    <!-- ── Smart Insights ── -->
    ${renderInsightStrip()}

    ${renderOverviewAttentionStrip()}

    <!-- ── Main 2-col ── -->
    <div class="ov-main-grid">

        <!-- LEFT 60% -->
        <div class="ov-main-left">
            ${renderAtRiskNow()}
            ${renderUpcomingLaunches()}

            ${recentLive.length ? `
            <div class="ov-section-header" style="margin-top:24px;">
                <h2 class="ov-section-title">Recently Live</h2>
                <span class="ov-section-badge ov-section-badge--green">${recentLive.length}</span>
            </div>
            <div class="live-list">${recentLiveRows}</div>` : ''}

            <!-- Deadline tabs -->
            <div class="ov-section-header" style="margin-top:24px;">
                <h2 class="ov-section-title">Deadline Monitor</h2>
                <div class="filter-tabs" style="margin:0;">
                    <div class="filter-tab active" onclick="App.setOverviewTab('alerts', this)">Alerts</div>
                    <div class="filter-tab" onclick="App.setOverviewTab('overdue', this)">Overdue</div>
                    <div class="filter-tab" onclick="App.setOverviewTab('milestones', this)">30d Ahead</div>
                </div>
            </div>
            <div class="task-list" id="overview-task-list">${buildOverviewTaskRows('alerts')}</div>
        </div>

        <!-- RIGHT 40% -->
        <div class="ov-main-right">
            ${renderThisWeekStrip()}
            ${renderStageFunnel()}
            ${renderTeamStatusGrid()}
            ${renderFreeingSoon()}
        </div>
    </div>`;
}

/* ══════════════════════════════════════════
   CALENDAR RENDER (Right Column logic attached later)
══════════════════════════════════════════ */
function initCalendar() {
    const grid = document.getElementById('cal-grid-body');
    const label = document.getElementById('cal-month-label');
    if(!grid) return;

    // Current month; release dots from project release_date values.
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    
    if (label) label.textContent = `${monthNames[month]} ${year}`;

    const daysInMonth = new Date(year, month+1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();

    const daysLabels = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    let html = daysLabels.map(d => `<div class="cal-day-label">${d}</div>`).join('');

    // Find days with releases
    const releaseDays = AppState.allProjects.filter(p=>p.release_date).map(p => {
        const d = parseSmartDate(p.release_date);
        if(d.getMonth()===month && d.getFullYear()===year) return d.getDate();
        return null;
    }).filter(x=>x);

    // Padding before
    let dNum = new Date(year, month, 0).getDate() - startDay + 1;
    for(let i=0; i<startDay; i++) {
        html += `<div class="cal-date muted">${dNum++}</div>`;
    }

    // Days in month
    for(let d=1; d<=daysInMonth; d++) {
        let cls = 'cal-date';
        if(d === today.getDate()) cls += ' active';
        if(releaseDays.includes(d)) cls += ' has-release';
        
        // Pass click to show pop-up
        html += `<div class="cal-date ${cls}" onclick="App.showReleasesOnDate(${year}, ${month}, ${d}, this)">${d}</div>`;
    }

    grid.innerHTML = html;
}

/* ══════════════════════════════════════════
   VIEW: DIRECTORY (Projects)
══════════════════════════════════════════ */
function projectWebsiteUrl(p) {
    if (typeof featureOn === 'function' && !featureOn('PROJECT_WEBSITE_PREVIEW')) return '';
    return typeof normalizeWebsiteUrl === 'function'
        ? normalizeWebsiteUrl(p?.website_url)
        : String(p?.website_url || '').trim();
}

function renderVisitWebsiteBtn(p) {
    const url = projectWebsiteUrl(p);
    if (!url) return '';
    const host = typeof websiteHostname === 'function' ? websiteHostname(url) : '';
    return `<a class="streak-pd-action-btn streak-pd-action-btn--site" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" title="Open ${escapeHtml(host || url)}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        Visit website
    </a>`;
}

function renderDirectorySiteThumb(p) {
    if (typeof featureOn === 'function' && !featureOn('PROJECT_WEBSITE_PREVIEW')) return '';
    const url = projectWebsiteUrl(p);
    const src = typeof projectThumbSrc === 'function' ? projectThumbSrc(p) : '';
    if (!src && !url) return '';
    const host = url && typeof websiteHostname === 'function' ? websiteHostname(url) : '';
    const shotFallback = (p.preview_image && url && typeof websitePreviewSrc === 'function')
        ? websitePreviewSrc(url)
        : '';
    const onErr = shotFallback
        ? `if(this.dataset.fallback){const n=this.dataset.fallback; delete this.dataset.fallback; this.src=n;}else{this.style.display='none'; this.parentElement.classList.add('is-fallback');}`
        : `this.style.display='none'; this.parentElement.classList.add('is-fallback');`;
    return `
        <div class="directory-card__thumb">
            ${src ? `<img src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async"${shotFallback ? ` data-fallback="${escapeHtml(shotFallback)}"` : ''}
                onerror="${onErr}">` : ''}
            <div class="directory-card__thumb-fallback">${escapeHtml(host || p.name || 'Website')}</div>
            ${url ? `<a class="directory-card__visit" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"
               onclick="event.stopPropagation();" title="Open ${escapeHtml(host || url)}">Visit ↗</a>` : ''}
        </div>`;
}

function renderProjects(projects) {
    let html = `
    <div class="directory-header">
        <h2 class="directory-title">Directory</h2>
    </div>
    ${renderFilterBar()}
    <div class="directory-grid">`;

    projects.forEach((p, i) => {
        const statusPill = directoryStatusPillClass(p.status);
        const stLabel    = statusLabel(p.status);
        const dur        = calcProjectDuration(p);
        const shipped    = projectCountsAsShipped(p);
        const alertBucket = alertBucketFor(p.id, AppState.alerts);
        const alertMeta   = directoryAlertMeta(alertBucket);
        const syncMeta    = projectSiblingFetchFailed(p) ? alertBadgeMeta('delivery_sync') : null;

        // Time stats row
        let timeStats = '';
        if (shipped && dur) {
            // Completed: "took X to build"
            const durLabel = dur.days >= 30
                ? `${dur.text} (${dur.days}d) to build`
                : `${dur.days} day${dur.days !== 1 ? 's' : ''} to build`;
            timeStats = `
            <div class="dc-time-stats">
                <span class="dc-time-chip dc-time-chip--done">&#10003; ${durLabel}</span>
            </div>`;
        } else if (!shipped && (dur || p.release_date)) {
            // In-progress: "Xd in" + release / CR milestone chip
            const chips = [];
            if (dur) {
                chips.push(`<span class="dc-time-chip dc-time-chip--running">${dur.text} in</span>`);
            }
            if (p.release_date && !/^tbd$/i.test(String(p.release_date).trim())) {
                const rel = getProjectReleaseRelative(p);
                const chipCls = rel.overdue ? 'dc-time-chip--overdue' : rel.urgent ? 'dc-time-chip--soon' : 'dc-time-chip--ok';
                const chipTxt = rel.daysText || '';
                if (chipTxt) chips.push(`<span class="dc-time-chip ${chipCls}">${chipTxt}</span>`);
            }
            if (chips.length) timeStats = `<div class="dc-time-stats">${chips.join('')}</div>`;
        }

        const dispProg = projectDisplayProgress(p);
        const siteThumb = renderDirectorySiteThumb(p);
        html += `
        <div class="directory-card card-light${siteThumb ? ' directory-card--has-site' : ''}" onclick="App.handleCardClick('${p.id}')">
            ${siteThumb}
            <div class="directory-card__badges">
                 <div class="directory-pill directory-pill--stage">${projectFunnelStage(p)}</div>
                 <div class="${statusPill}">${stLabel}</div>
                 ${alertMeta ? `<div class="directory-pill" style="background:${alertMeta.bg};color:${alertMeta.color};border:1px solid ${alertMeta.color}40;">${alertMeta.label}</div>` : ''}
                 ${syncMeta ? `<div class="directory-pill" style="background:${syncMeta.bg};color:${syncMeta.color};border:1px solid ${syncMeta.color}40;">${syncMeta.label}</div>` : ''}
                 ${intelligenceEnabled() ? renderAttentionTierPill(getAttentionForProject(p.id, AppState.attentionRanked)?.attentionTier) : ''}
            </div>
            <h3 class="directory-card__name">${p.name}</h3>
            <div class="directory-card__divider" aria-hidden="true"></div>
            <p class="directory-card__client">${p.client || '—'}</p>
            ${timeStats}
            ${p.total_pages > 0 ? `
            <div class="directory-card__meta">
                 <span class="directory-tag">Pages: ${p.completed_pages}/${p.total_pages}</span>
                 <span class="directory-tag">${p.page_priority}</span>
            </div>` : ''}
            
            <div class="directory-card__footer">
                <div>
                   <div class="directory-card__progress-label">Progress: ${dispProg}%</div>
                   <div class="directory-card__bar" role="progressbar" aria-valuenow="${dispProg}" aria-valuemin="0" aria-valuemax="100">
                       <div class="directory-card__bar-fill" style="width:${dispProg}%; background:${streskStatusBarColor(p.status)};"></div>
                   </div>
                </div>
                <div class="directory-card__avatar" title="${(p.owner || '').replace(/"/g, '&quot;')}">${getInitials(p.owner)}</div>
            </div>
        </div>`;
    });

    html += `</div>`;
    return html;
}

/* ══════════════════════════════════════════
   VIEW: PIPELINE Kanban
══════════════════════════════════════════ */
function renderPipeline(projects) {
    let html = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
        <h2 class="section-label" style="font-size:28px">Pipeline</h2>
    </div>
    ${renderFilterBar(true)}`;

    if(AppState.pipelineMode === 'timeline') {
        html += renderTimeline(projects);
        return html;
    }

    html += `<div class="pipeline-layout">`;

    STAGES.forEach((stage, i) => {
        const pjs = projects.filter(p => projectFunnelStage(p) === stage);
        const colBg = PASTELS[i % PASTELS.length];

        let cards = pjs.map(p => {
            const statusColor = getStatusPastel(p.status).replace('bg-', '');
            const dispProg = projectDisplayProgress(p);
            const siteUrl = projectWebsiteUrl(p);
            
            return `
            <div class="kanban-card" onclick="App.handleCardClick('${p.id}')">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px">
                    <div style="font-size:11px; font-weight:var(--fw-bold); color:var(--text-muted);">${p.id}</div>
                    <div style="width:8px; height:8px; border-radius:50%; background:var(--bg-${statusColor})"></div>
                </div>
                <div style="font-size:14px; font-weight:var(--fw-heavy); margin-bottom:12px;">${p.name}</div>
                ${siteUrl ? `<a class="kanban-site-link" href="${escapeHtml(siteUrl)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">Visit site ↗</a>` : ''}
                ${p.total_pages > 0 ? `<div style="font-size:10px; font-weight:bold; color:var(--text-muted); margin-bottom:12px;">Pages: ${p.completed_pages}/${p.total_pages} (${p.page_priority})</div>` : ''}
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <span style="font-size:12px; font-weight:var(--fw-bold); display:flex; align-items:center; gap:4px">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                       ${formatDateShort(p.release_date)}
                    </span>
                    <span class="pill ${getStatusPastel(p.status)}" style="padding:4px 8px; font-size:10px; color:var(--text-primary)">${dispProg}%</span>
                </div>
            </div>`;
        }).join('');

        if(!pjs.length) cards = `<div style="text-align:center; padding:16px; color:var(--text-muted); font-size:13px; font-weight:500;">Empty</div>`;

        html += `
        <div class="pipeline-col">
            <div class="col-head">
                <span>${stage}</span>
                <span style="color:var(--text-muted)">${pjs.length}</span>
            </div>
            ${cards}
        </div>`;
    });

    html += `</div>`;
    return html;
}

/* ══════════════════════════════════════════
   FILTER BAR — AtlasDD custom popovers
══════════════════════════════════════════ */

/** Build a custom AtlasDD popover dropdown (no native <select>). */
function atlasDD(id, items, currentValue, placeholder, action, extraClass = '') {
    const chkSvg  = `<svg class="atlas-dd-chk" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    const chevron = `<svg class="atlas-dd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
    const active  = (currentValue !== null && currentValue !== '' && currentValue !== undefined);
    const label   = active ? (items.find(it => it.value === currentValue) || {}).label || placeholder : placeholder;

    const itemsHtml = items.map(it => {
        const on = (it.value === currentValue);
        return `<div class="atlas-dd-item${on ? ' atlas-dd-item--on' : ''}"
                     data-dd-id="${escapeHtml(id)}"
                     data-dd-val="${escapeHtml(String(it.value))}"
                     data-dd-label="${escapeHtml(it.label)}"
                     data-dd-action="${escapeHtml(action)}"
                     data-val="${escapeHtml(String(it.value))}">
                    ${chkSvg}${escapeHtml(it.label)}</div>`;
    }).join('');

    return `
    <div id="${id}" class="atlas-dd atlas-dd--light${active ? ' atlas-dd--active' : ''}${extraClass ? ' ' + extraClass : ''}">
        <div class="atlas-dd-trigger" data-dd-id="${escapeHtml(id)}" role="button" tabindex="0" aria-haspopup="listbox">
            <span class="atlas-dd-value">${escapeHtml(label)}</span>${chevron}
        </div>
        <div id="${id}-menu" class="atlas-dd-menu" style="display:none">${itemsHtml}</div>
    </div>`;
}

function renderFilterBar(showTimelineToggle = false) {
    const f       = AppState.filters;
    const devs    = AppState.uniqueDevs.map(d => ({ value: d, label: d }));
    const qas     = AppState.uniqueQAs.map(q  => ({ value: q, label: q }));
    const clients = AppState.uniqueClients.map(c => ({ value: c, label: c }));

    const stageItems  = [{ value: '', label: 'All Stages' },   ...STAGES.map(s => ({ value: s, label: s }))];
    const statusItems = [{ value: '', label: 'All Statuses' }, { value: 'on_track', label: 'On Track' }, { value: 'at_risk', label: 'At Risk' }, { value: 'delayed', label: 'Delayed' }];
    const devItems    = [{ value: '', label: 'All Developers' }, ...devs];
    const qaItems     = [{ value: '', label: 'All QA' }, ...qas];
    const clientItems = [{ value: '', label: 'All Projects' }, ...clients];
    const sortItems   = [{ value: 'release_date', label: 'Sort: Release Date' }, { value: 'progress', label: 'Sort: Progress' }, { value: 'priority', label: 'Sort: Priority' }, { value: 'name', label: 'Sort: Name A-Z' }];

    if (CONFIG.CUSTOM_SELECTS) {
        return `
        <div class="filter-toolbar directory-toolbar" style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:24px; background:var(--bg-card); color:var(--text-primary); border:1px solid var(--border-light); padding:12px; border-radius:12px; box-shadow:var(--shadow-card)">
            ${showTimelineToggle ? `
            <div style="display:flex; gap:8px; border-right:1px solid var(--border-light); padding-right:16px;">
                <button class="pill ${AppState.pipelineMode !== 'timeline' ? 'dark' : 'light'}" onclick="App.setPipelineMode('kanban')">Board</button>
                <button class="pill ${AppState.pipelineMode === 'timeline' ? 'dark' : 'light'}" onclick="App.setPipelineMode('timeline')">Timeline</button>
            </div>` : ''}
            ${atlasDD('fdd-stage',   stageItems,  f.stage      || '', 'All Stages',   'filter:stage')}
            ${atlasDD('fdd-status',  statusItems, f.status     || '', 'All Statuses', 'filter:status')}
            ${clients.length ? atlasDD('fdd-client', clientItems, f.client || '', 'All Projects',  'filter:client') : ''}
            ${atlasDD('fdd-dev',     devItems,    f.developer  || '', 'All Developers', 'filter:developer')}
            ${atlasDD('fdd-qa',      qaItems,     f.qa         || '', 'All QA',       'filter:qa')}
            ${atlasDD('fdd-sort',    sortItems,   AppState.sort,     AppState.sort || 'Sort',  'sort', 'atlas-dd--sort')}
            ${AppState.hasActiveFilters() ? `<button class="pill" style="background:#FFE1E1; color:#D80000" onclick="App.clearFilters(); App.renderCurrentView();">Clear Filters</button>` : ''}
        </div>`;
    }

    /* Fallback — native selects (CONFIG.CUSTOM_SELECTS = false) */
    const ownerOps  = AppState.uniqueOwners.map(o => `<option value="${o}" ${f.owner===o?'selected':''}>${o}</option>`).join('');
    const devOps    = devs.map(d => `<option value="${d.value}" ${f.developer===d.value?'selected':''}>${d.label}</option>`).join('');
    const qaOps     = qas.map(q  => `<option value="${q.value}"  ${f.qa===q.value?'selected':''}>${q.label}</option>`).join('');
    const clientOps = clients.map(c => `<option value="${escapeHtml(c.value)}" ${f.client===c.value?'selected':''}>${escapeHtml(c.label)}</option>`).join('');
    const nv        = 'style="border:none;outline:none;background:transparent;font-weight:var(--fw-bold);cursor:pointer"';
    return `
    <div class="filter-toolbar directory-toolbar" style="display:flex; gap:16px; align-items:center; flex-wrap:wrap; margin-bottom:24px; background:var(--bg-card); color:var(--text-primary); border:1px solid var(--border-light); padding:12px; border-radius:12px; box-shadow:var(--shadow-card)">
        ${showTimelineToggle ? `
        <div style="display:flex; gap:8px; border-right:1px solid var(--border-light); padding-right:16px;">
            <button class="pill ${AppState.pipelineMode !== 'timeline' ? 'dark' : 'light'}" onclick="App.setPipelineMode('kanban')">Board</button>
            <button class="pill ${AppState.pipelineMode === 'timeline' ? 'dark' : 'light'}" onclick="App.setPipelineMode('timeline')">Timeline</button>
        </div>` : ''}
        <select ${nv} onchange="App.setFilter('stage',this.value||null)"><option value="">All Stages</option>${STAGES.map(s=>`<option value="${s}" ${f.stage===s?'selected':''}>${s}</option>`).join('')}</select>
        <select ${nv} onchange="App.setFilter('status',this.value||null)"><option value="">All Statuses</option><option value="on_track" ${f.status==='on_track'?'selected':''}>On Track</option><option value="at_risk" ${f.status==='at_risk'?'selected':''}>At Risk</option><option value="delayed" ${f.status==='delayed'?'selected':''}>Delayed</option></select>
        ${clientOps?`<select ${nv} onchange="App.setFilter('client',this.value||null)"><option value="">All Projects</option>${clientOps}</select>`:''}
        <select ${nv} onchange="App.setFilter('developer',this.value||null)"><option value="">All Developers</option>${devOps}</select>
        <select ${nv} onchange="App.setFilter('qa',this.value||null)"><option value="">All QA</option>${qaOps}</select>
        <select ${nv} style="margin-left:auto" onchange="App.setSort(this.value)"><option value="release_date" ${AppState.sort==='release_date'?'selected':''}>Sort: Release Date</option><option value="progress" ${AppState.sort==='progress'?'selected':''}>Sort: Progress</option><option value="priority" ${AppState.sort==='priority'?'selected':''}>Sort: Priority</option><option value="name" ${AppState.sort==='name'?'selected':''}>Sort: Name A-Z</option></select>
        ${AppState.hasActiveFilters() ? `<button class="pill" style="background:#FFE1E1; color:#D80000" onclick="App.clearFilters(); App.renderCurrentView();">Clear Filters</button>` : ''}
    </div>`;
}

function sortAlertsByAttention(list) {
    if (!intelligenceEnabled()) return list;
    return [...list].sort((a, b) => {
        const sa = getAttentionForProject(a.id, AppState.attentionRanked)?.attentionScore ?? 0;
        const sb = getAttentionForProject(b.id, AppState.attentionRanked)?.attentionScore ?? 0;
        return sb - sa;
    });
}

function renderAlerts() {
    const { overdue, at_risk, upcoming, stalled } = AppState.alerts;
    
    let html = `
    <h2 class="section-label" style="font-size:28px">Alerts & risk center</h2>
    <div style="font-size:14px; color:var(--text-muted); margin-bottom:24px">Auto-computed from project dates, stage, and progress.${intelligenceEnabled() ? ' Sorted by attention score when available.' : ''}</div>`;

    if (!overdue.length && !at_risk.length && !upcoming.length && !stalled.length) {
         return html + `<div class="card-light">All clear. No alerts.</div>`;
    }

    const mapList = (list, bucket, title, countLabel, colorHex, iconSvg, pastelClass) => {
        if(!list.length) return '';
        return `
        <div style="margin-bottom:32px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span style="color:${colorHex}; display:flex; align-items:center;">${iconSvg}</span>
                <span style="font-size:14px; font-weight:var(--fw-bold); color:${colorHex}; margin-right:4px">${title}</span>
                <span class="pill" style="font-size:11px; padding:2px 8px; background:rgba(0,0,0,0.05); color:var(--text-muted)">${list.length}</span>
            </div>
            <div style="font-size:11px; color:var(--text-muted); text-transform:none; margin-bottom:12px;">${countLabel}</div>
            
            <div style="display:flex; flex-wrap:wrap; gap:16px; padding-bottom:16px;">
                ${list.map(p => {
                    const reason = alertCardReason(p, bucket);
                    const att = intelligenceEnabled() ? getAttentionForProject(p.id, AppState.attentionRanked) : null;
                    const scoreBadge = att ? `<div style="font-size:10px;font-weight:700;color:${attentionTierMeta(att.attentionTier).color};margin-bottom:4px;">Attention ${att.attentionScore}</div>` : '';
                    return `
                    <div style="background:var(--bg-card); display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:8px; border:1px solid var(--border-light); border-left:4px solid ${colorHex}; width:calc(25% - 12px); min-width:260px; box-shadow:var(--shadow-card); cursor:pointer;" onclick="App.handleCardClick('${p.id}')">
                        <div class="${pastelClass}" style="width:36px; height:36px; border-radius:50%; display:flex; justify-content:center; align-items:center; color:${colorHex}; font-size:12px; font-weight:bold; flex-shrink:0;">
                            ${getInitials(p.owner)}
                        </div>
                        <div style="flex:1; overflow:hidden;">
                            <div style="font-size:13px; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--text-primary); margin-bottom:2px;">${escapeHtml(p.name)}</div>
                            <div style="font-size:11px; color:var(--text-muted);">${escapeHtml(p.client || '—')} · ${escapeHtml(p.owner || '—')}</div>
                        </div>
                        <div style="text-align:right; max-width:120px;">
                            ${scoreBadge}
                            <div style="font-size:11px; font-weight:bold; color:${colorHex}; margin-bottom:2px;">${reason.primary}</div>
                            <div style="font-size:10px; color:var(--text-muted); line-height:1.3;">${reason.secondary}</div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    };

    const overdueIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    const atRiskIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
    const stalledIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`;
    const upcomingIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><polyline points="12 6 12 12 16 14"></polyline></svg>`;

    html += mapList(sortAlertsByAttention(overdue), 'overdue', 'Overdue', 'Past their release date and not yet live.', '#EF4444', overdueIcon, 'bg-red');
    const soonDays = CONFIG.UPCOMING_DAYS_THRESHOLD ?? 7;
    html += mapList(sortAlertsByAttention(at_risk), 'at_risk', 'Likely to miss', 'Projects flagged as likely to miss their target release date based on progress and timeline.', '#F59E0B', atRiskIcon, 'bg-yellow');
    html += mapList(sortAlertsByAttention(stalled), 'stalled', 'Stalled', `Under ${CONFIG.STALLED_PROGRESS_THRESHOLD ?? 30}% progress despite being started ${CONFIG.STALLED_DAYS_THRESHOLD ?? 30}+ days ago.`, '#3B82F6', stalledIcon, 'bg-blue');
    html += mapList(sortAlertsByAttention(upcoming), 'upcoming', `Releasing soon (next ${soonDays} days)`, 'On track but release date is approaching.', '#EC4899', upcomingIcon, 'bg-violet');

    return html;
}

/* ══════════════════════════════════════════
   VIEW: RESOURCES — People Intelligence
══════════════════════════════════════════ */
/* ──────────────────────────────────────────
   AVAILABILITY CALENDAR
────────────────────────────────────────── */
function renderAvailabilityCalendar(resMap) {
    const today = new Date(); today.setHours(0,0,0,0);
    const DAY_LABELS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

    // Build date → [person] map
    const freeMap = {}; // "YYYY-MM-DD" → [person]
    const freeNow = []; // people already free
    function localKey(dt) {
        return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
    }
    function keyToLocalDate(k) {
        const [y,m,d] = k.split('-').map(Number);
        return new Date(y, m-1, d);
    }

    Object.values(resMap).forEach(p => {
        const avail = getResourceAvailability(p, today);
        if (avail.status === 'free') {
            freeNow.push(p);
            return;
        }
        if (!p.freeFrom) return;
        const d = new Date(p.freeFrom); d.setHours(0,0,0,0);
        if (d <= today) return;
        const key = localKey(d);
        if (!freeMap[key]) freeMap[key] = [];
        freeMap[key].push(p);
    });

    // Summary stats
    const conflictCount  = Object.values(resMap).filter(p => p.conflicts.length > 0).length;
    const freeThisMonth  = Object.entries(freeMap).filter(([k]) => {
        const d = keyToLocalDate(k);
        return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
    }).reduce((s,[,arr]) => s + arr.length, 0) + freeNow.length;
    const freeSoon14     = Object.entries(freeMap).filter(([k]) => {
        const d = keyToLocalDate(k);
        return (d - today) <= 14 * 86400000;
    }).reduce((s,[,arr]) => s + arr.length, 0) + freeNow.length;

    const statsHTML = `
    <div class="res-cal-stats">
        <span class="res-cal-stat res-cal-stat--green">
            <span class="res-cal-stat-num">${freeThisMonth}</span> free this month
        </span>
        <span class="res-cal-stat-sep">·</span>
        <span class="res-cal-stat res-cal-stat--blue">
            <span class="res-cal-stat-num">${freeNow.length}</span> available now
        </span>
        <span class="res-cal-stat-sep">·</span>
        <span class="res-cal-stat ${conflictCount ? 'res-cal-stat--red' : 'res-cal-stat--muted'}">
            <span class="res-cal-stat-num">${conflictCount}</span> conflict${conflictCount !== 1 ? 's' : ''}
        </span>
    </div>`;

    // "Free now" row
    let freeNowHTML = '';
    if (freeNow.length) {
        const chips = freeNow.map(p => {
            const avc  = stringToColor(p.name);
            const init = getInitials(p.name);
            return `<span class="res-cal-name-chip" style="background:${avc}" title="${escapeHtml(p.name)}">${init}</span>`;
        }).join('');
        freeNowHTML = `
        <div class="res-cal-freenow">
            <span class="res-cal-freenow-label">Free now</span>
            <div class="res-cal-freenow-chips">${chips}</div>
            <div class="res-cal-freenow-names">${freeNow.map(p => escapeHtml(p.name)).join(', ')}</div>
        </div>`;
    }

    // Render a single month grid
    function renderMonth(year, month) {
        const monthName = new Date(year, month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        // First day of month (0=Sun..6=Sat) → convert to Mon-based (0=Mon..6=Sun)
        const firstDay  = new Date(year, month, 1).getDay();
        const startOffset = (firstDay === 0 ? 6 : firstDay - 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let cells = [];
        // Empty cells before day 1
        for (let i = 0; i < startOffset; i++) cells.push(`<div class="res-cal-day res-cal-day--empty"></div>`);

        for (let d = 1; d <= daysInMonth; d++) {
            const thisDate = new Date(year, month, d); thisDate.setHours(0,0,0,0);
            const key      = localKey(thisDate);
            const isPast   = thisDate < today;
            const isToday  = thisDate.getTime() === today.getTime();
            const people   = freeMap[key] || [];

            let chipsHTML = '';
            if (people.length) {
                const visible = people.slice(0, 2);
                const overflow = people.length - visible.length;
                chipsHTML = visible.map(p => {
                    const avc  = stringToColor(p.name);
                    const init = getInitials(p.name);
                    return `<span class="res-cal-chip" style="background:${avc}" title="${escapeHtml(p.name)}">${init}</span>`;
                }).join('');
                if (overflow > 0) chipsHTML += `<span class="res-cal-chip res-cal-chip--more">+${overflow}</span>`;
            }

            const nameList = people.map(p => p.name).join(', ');
            const clickable = people.length > 0;

            cells.push(`
            <div class="res-cal-day ${isPast ? 'res-cal-day--past' : ''} ${isToday ? 'res-cal-day--today' : ''} ${people.length ? 'res-cal-day--has-free' : ''}"
                ${clickable ? `onclick="App.highlightResCard(${JSON.stringify(people.map(p=>p.name))})" title="${escapeHtml(nameList)}"` : ''}>
                <div class="res-cal-day-num">${d}</div>
                ${chipsHTML ? `<div class="res-cal-chips">${chipsHTML}</div>` : ''}
            </div>`);
        }

        return `
        <div class="res-cal-month">
            <div class="res-cal-month-name">${monthName}</div>
            <div class="res-cal-grid">
                ${DAY_LABELS.map(l => `<div class="res-cal-dow">${l}</div>`).join('')}
                ${cells.join('')}
            </div>
        </div>`;
    }

    const m0 = today.getMonth();
    const y0 = today.getFullYear();
    const m1 = (m0 + 1) % 12;
    const y1 = m0 === 11 ? y0 + 1 : y0;

    return `
    <div class="res-cal-wrap card-light">
        ${statsHTML}
        ${freeNowHTML}
        <div class="res-cal-months">
            ${renderMonth(y0, m0)}
            ${renderMonth(y1, m1)}
        </div>
        <div class="res-cal-legend">
            <span class="res-cal-legend-item"><span class="res-cal-day-num-demo res-cal-day--today-demo">13</span> Today</span>
            <span class="res-cal-legend-item"><span class="res-cal-chip-demo" style="background:#4285F4">AV</span> Person free on this date</span>
            <span class="res-cal-legend-item"><span class="res-cal-chip-demo res-cal-chip-demo--more">+2</span> More people</span>
        </div>
    </div>`;
}

function renderAvailPopoverContent() {
    const resMap  = AppState.resourceMap;
    const today   = new Date(); today.setHours(0,0,0,0);
    const people  = Object.values(resMap).sort((a, b) => {
        const af = a.freeFrom ? a.freeFrom.getTime() : 9e12;
        const bf = b.freeFrom ? b.freeFrom.getTime() : 9e12;
        return af - bf;
    }).slice(0, 6);

    if (!people.length) return `<div class="res-pop-empty">No resource data yet.</div>`;

    return people.map(p => {
        const init  = getInitials(p.name);
        const avc   = stringToColor(p.name);
        const avail = getResourceAvailability(p, today);
        const barW = Math.min(100, p.activeCount * 25);
        const hasConflict = p.conflicts.length > 0;
        return `
        <div class="res-pop-row">
            <div class="res-pop-avatar" style="background:${avc}">${init}</div>
            <div class="res-pop-info">
                <div class="res-pop-name">${escapeHtml(p.name)}${hasConflict ? ` <span class="res-pop-cfl ui-inline-icon" aria-label="Conflict">${Icons.alert}</span>` : ''}</div>
                <div class="res-pop-bar-wrap"><div class="res-pop-bar" style="width:${barW}%"></div></div>
                ${avail.subtitle ? `<div class="res-pop-sub">${escapeHtml(avail.subtitle)}</div>` : ''}
            </div>
            <span class="res-pop-chip ${avail.popClass}">${escapeHtml(avail.label)}</span>
        </div>`;
    }).join('');
}

/* ══════════════════════════════════════════
   RESOURCE TABLE VIEW — compact people grid
   Rendered alongside cards; toggled via App.setResPeopleView
══════════════════════════════════════════ */
function renderPeopleTable(people, today, WINDOW, statusColor, statusLabel, fmtDate, daysLeft, pct) {
    const statusIcon = {
        on_track: `<span style="color:#1E8E3E;font-size:9px;">●</span>`,
        at_risk:  `<span style="color:#F9AB00;font-size:9px;">●</span>`,
        delayed:  `<span style="color:#D93025;font-size:9px;">●</span>`,
    };

    const rows = people.map(p => {
        const init = getInitials(p.name);
        const avc  = stringToColor(p.name);
        const hasConflict = p.conflicts.length > 0;
        const avail = getResourceAvailability(p, today);
        const chipText = avail.label || '—';
        const chipCls  = avail.chipClass || '';

        // Load severity
        const loadLvl  = p.activeCount >= 3 ? 'high' : p.activeCount >= 2 ? 'med' : 'low';
        const loadLabel = p.activeCount >= 3 ? 'High load' : p.activeCount >= 2 ? 'Busy' : 'Light';

        // Completed count
        const completedCount = p.assignments.filter(a => a.completed).length;

        // Active assignments → project pills
        const activeAssignments = p.assignments
            .filter(a => !a.completed)
            .sort((a, b) => {
                if (a.start && b.start) return a.start - b.start;
                return 0;
            });

        const projectPills = activeAssignments.map(a => {
            const dl2 = a.end ? daysLeft(a.end) : null;
            const sColor = statusColor[a.status] || '#888';
            const sLabel = statusLabel[a.status] || a.status || '';
            const daysStr = dl2 === null ? '' : dl2 < 0 ? `${Math.abs(dl2)}d over` : `${dl2}d`;
            const overdue  = dl2 !== null && dl2 < 0;
            const isConflict = p.conflicts.some(c => c.projectIdA === a.projectId || c.projectIdB === a.projectId);
            return `
            <div class="res-tbl-pill ${isConflict ? 'res-tbl-pill--conflict' : ''}" onclick="App.handleCardClick('${a.projectId}')" title="${escapeHtml(a.projectName)} (${sLabel}${daysStr ? ' · ' + daysStr : ''})">
                <span class="res-tbl-pill-dot" style="background:${sColor}"></span>
                <span class="res-tbl-pill-name">${escapeHtml(a.projectName)}</span>
                <span class="res-tbl-pill-role">${escapeHtml(a.role)}</span>
                ${daysStr ? `<span class="res-tbl-pill-days ${overdue ? 'res-tbl-pill-days--over' : ''}">${daysStr}</span>` : ''}
                ${isConflict ? `<span class="res-tbl-pill-warn ui-inline-icon" aria-label="Conflict">${Icons.alert}</span>` : ''}
            </div>`;
        }).join('');

        const noPills = !activeAssignments.length
            ? `<span style="font-size:12px;color:var(--text-muted);font-style:italic;">No active projects</span>`
            : '';

        return `
        <tr class="res-tbl-row ${hasConflict ? 'res-tbl-row--conflict' : ''}">
            <!-- Person -->
            <td class="res-tbl-cell res-tbl-cell--person">
                <div class="res-tbl-avatar" style="background:${avc}">${init}</div>
                <div class="res-tbl-name-wrap">
                    <div class="res-tbl-name">${escapeHtml(p.name)}</div>
                    <div class="res-tbl-counts">${p.activeCount} active · ${completedCount} done${hasConflict ? ` · <span style="color:#D93025;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><span class="ui-inline-icon">${Icons.alert}</span>${p.conflicts.length} conflict</span>` : ''}</div>
                </div>
            </td>
            <!-- Load -->
            <td class="res-tbl-cell res-tbl-cell--load">
                <span class="res-load-pill res-load-pill--${loadLvl}">${loadLabel}</span>
            </td>
            <!-- Availability -->
            <td class="res-tbl-cell res-tbl-cell--avail">
                <span class="res-free-chip ${chipCls}" style="font-size:10px;padding:2px 8px;">${escapeHtml(chipText)}</span>
                ${avail.subtitle ? `<div class="res-tbl-avail-sub">${escapeHtml(avail.subtitle)}</div>` : ''}
            </td>
            <!-- Active projects (pills) -->
            <td class="res-tbl-cell res-tbl-cell--projects">
                <div class="res-tbl-pills">${projectPills}${noPills}</div>
            </td>
        </tr>`;
    }).join('');

    return `
    <table class="res-tbl" aria-label="People workload table">
        <thead>
            <tr class="res-tbl-head">
                <th class="res-tbl-th res-tbl-th--person">Person</th>
                <th class="res-tbl-th">Load</th>
                <th class="res-tbl-th">Available</th>
                <th class="res-tbl-th res-tbl-th--projects">Active Projects (next ${WINDOW}d)</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>`;
}

function renderResources() {
    const trackerOn = typeof featureOn === 'function' && featureOn('RESOURCE_TRACKER');
    const mode = trackerOn ? (AppState.resourcesViewMode || 'delivery') : 'delivery';
    const switcher = trackerOn ? `
    <div class="res-mode-switch" role="tablist" aria-label="Resources view mode">
        <button type="button" role="tab" class="res-mode-btn ${mode === 'delivery' ? 'res-mode-btn--active' : ''}"
            aria-selected="${mode === 'delivery'}" onclick="App.setResourcesViewMode('delivery')">
            <span class="ui-inline-icon" aria-hidden="true">${Icons.list}</span>
            Delivery view
        </button>
        <button type="button" role="tab" class="res-mode-btn ${mode === 'manager' ? 'res-mode-btn--active' : ''}"
            aria-selected="${mode === 'manager'}" onclick="App.setResourcesViewMode('manager')">
            <span class="ui-inline-icon" aria-hidden="true">${Icons.users}</span>
            Manager view
        </button>
    </div>` : '';

    const body = mode === 'manager'
        ? renderResourcesManagerView()
        : renderResourcesDelivery();

    return `
    <div class="res-page ${mode === 'manager' ? 'res-page--manager' : ''}">
        ${switcher}
        ${body}
    </div>`;
}

/* ══════════════════════════════════════════
   DELIVERY ALLOCATION — Database names + Delivery tabs (shared by Resources delivery + Team allocation)
══════════════════════════════════════════ */
function renderSiblingAllocationView(opts = {}) {
    const title = opts.title || 'Team allocation';
    const subtitle = opts.subtitle
        || 'Names from <strong>Database</strong> sheet. Work from Delivery tabs only — Stage <strong>Live</strong> = done.';
    const data = AppState.siblingAllocation;
    const stats = data.stats || {};
    const view = AppState.allocationView || 'people';
    const filter = AppState.allocationFilter || 'all';
    const searchQ = String(AppState.allocationSearch || '').trim().toLowerCase();

    const matchesSearch = (name) => !searchQ || String(name || '').toLowerCase().includes(searchQ);

    const statBar = `
    <div class="alloc-stats">
        <div class="alloc-stat alloc-stat--work">
            <span class="alloc-stat-num">${stats.onWork || 0}</span>
            <span class="alloc-stat-lbl">On work</span>
        </div>
        <div class="alloc-stat alloc-stat--free">
            <span class="alloc-stat-num">${stats.free || 0}</span>
            <span class="alloc-stat-lbl">Free</span>
        </div>
        <div class="alloc-stat">
            <span class="alloc-stat-num">${stats.activeRows || 0}</span>
            <span class="alloc-stat-lbl">Open pages</span>
        </div>
        <div class="alloc-stat">
            <span class="alloc-stat-num">${stats.projectsWithSibling || 0}</span>
            <span class="alloc-stat-lbl">Delivery tabs</span>
        </div>
    </div>`;

    const viewTabs = ['people', 'projects'].map(v => {
        const lbl = v === 'people' ? 'By person' : 'By project';
        return `<button type="button" class="alloc-tab ${view === v ? 'alloc-tab--active' : ''}"
            onclick="App.setAllocationView('${v}')">${lbl}</button>`;
    }).join('');

    const filterPills = [
        ['all', 'All'],
        ['on_work', 'On work'],
        ['free', 'Free'],
    ].map(([id, lbl]) => `
        <button type="button" class="alloc-filter ${filter === id ? 'alloc-filter--active' : ''}"
            onclick="App.setAllocationFilter('${id}')">${lbl}</button>`).join('');

    function statusChip(active) {
        return active
            ? '<span class="alloc-chip alloc-chip--work">On work</span>'
            : '<span class="alloc-chip alloc-chip--free">Free</span>';
    }

    function projectPills(rows) {
        const names = [...new Set((rows || []).map(r => r.projectName).filter(Boolean))];
        if (!names.length) return '<span class="alloc-muted">—</span>';
        return names.map(n => `<span class="alloc-proj-pill">${escapeHtml(n)}</span>`).join('');
    }

    let body = '';
    const effectiveView = view === 'rows' ? 'people' : view;

    if (effectiveView === 'people') {
        let people = (data.people || []).filter(p => matchesSearch(p.name));
        if (filter === 'on_work') people = people.filter(p => p.status === 'on_work');
        if (filter === 'free') people = people.filter(p => p.status === 'free');

        if (!people.length) {
            body = `<div class="alloc-empty">No people match this filter.${stats.totalPeople ? '' : ' Load projects with Delivery tabs first.'}</div>`;
        } else {
            body = `<div class="alloc-table-wrap"><table class="alloc-table" aria-label="Team allocation by person">
                <thead><tr>
                    <th>Person</th><th>Status</th><th>Projects</th>
                </tr></thead><tbody>
                ${people.map(p => {
                    const init = getInitials(p.name);
                    const avc = stringToColor(p.name);
                    const activeRows = p.activeRows || [];
                    return `<tr>
                        <td><div class="alloc-person"><span class="alloc-avatar" style="background:${avc}">${init}</span>${escapeHtml(p.name)}</div></td>
                        <td>${statusChip(p.status === 'on_work')}</td>
                        <td class="alloc-proj-cell">${projectPills(activeRows)}</td>
                    </tr>`;
                }).join('')}
                </tbody></table></div>`;
        }
    } else if (effectiveView === 'projects') {
        let projects = (data.projectsActive || []).filter(p =>
            !searchQ || p.name.toLowerCase().includes(searchQ) || p.people.some(n => n.toLowerCase().includes(searchQ))
        );
        if (filter === 'free') projects = [];

        if (!projects.length) {
            body = `<div class="alloc-empty">${filter === 'free' ? 'Projects view shows only active work — switch to By person for Free list.' : 'No projects with open Delivery rows.'}</div>`;
        } else {
            body = `<div class="alloc-table-wrap"><table class="alloc-table" aria-label="Team allocation by project">
                <thead><tr>
                    <th>Project</th><th>People on work</th><th>Open pages</th>
                </tr></thead><tbody>
                ${projects.map(p => {
                    const peopleStr = p.people.map(n => escapeHtml(n)).join(', ');
                    return `<tr>
                        <td><button type="button" class="alloc-link" onclick="App.handleCardClick('${escapeHtml(p.id)}')">${escapeHtml(p.name)}</button></td>
                        <td>${peopleStr || '—'}</td>
                        <td>${p.rowCount}</td>
                    </tr>`;
                }).join('')}
                </tbody></table></div>`;
        }
    }

    return `
    <div class="alloc-page">
        <header class="alloc-head">
            <div>
                <h1 class="alloc-title">${escapeHtml(title)}</h1>
                <p class="alloc-sub">${subtitle}</p>
            </div>
        </header>
        ${statBar}
        <div class="alloc-toolbar">
            <div class="alloc-tabs" role="tablist">${viewTabs}</div>
            <div class="alloc-filters">${filterPills}</div>
            <input type="search" class="alloc-search" placeholder="Search name, project, page…"
                value="${escapeHtml(AppState.allocationSearch || '')}"
                oninput="App.setAllocationSearch(this.value)" />
        </div>
        ${body}
    </div>`;
}

function renderTeamAllocation() {
    return renderSiblingAllocationView({
        title: 'Team allocation',
    });
}

function getManagerRoster() {
    return typeof enrichResourceRoster === 'function'
        ? enrichResourceRoster(AppState.resourceRoster || [], AppState.resourceMap)
        : (AppState.resourceRoster || []);
}

function asRmList(val) {
    return Array.isArray(val) ? val : [];
}

function findRmSheetPerson(emp, roster) {
    const name = emp?.full_name || emp?.name || '';
    const list = roster || [];
    const key = typeof normalizePersonKey === 'function' ? normalizePersonKey(name) : String(name).toLowerCase();
    const byKey = list.find(r => r.nameKey === key || (typeof normalizePersonKey === 'function' && normalizePersonKey(r.name) === key));
    if (byKey) return byKey;
    if (typeof personNamesSoftMatch === 'function') {
        return list.find(r => personNamesSoftMatch(name, r.name)) || null;
    }
    return null;
}

/** True bench: not on delivery work, and not assigned via Resource API FTE. */
function isRmAvailableNow(emp, roster) {
    if (!emp || !isRmProjectStaffable(emp) || isRmLeadershipRole(emp)) return false;
    if ((Number(emp.utilization_pct) || 0) > 0) return false;
    const st = String(emp.availability_status || emp.availability || '');
    if (st && /full|partial/i.test(st) && !/bench|available/i.test(st)) return false;
    const sheet = findRmSheetPerson(emp, roster);
    if (sheet && sheet.availability && sheet.availability !== 'Bench') return false;
    return true;
}

function listRmAvailablePeople(roster, apiEmps, apiOnline) {
    const list = (apiOnline && (apiEmps || []).length)
        ? apiEmps.filter(e => isRmAvailableNow(e, roster))
        : (roster || []).filter(e =>
            e.availability === 'Bench' && isRmProjectStaffable(e) && !isRmLeadershipRole(e));
    return list.slice().sort((a, b) =>
        String(a.full_name || a.name || '').localeCompare(String(b.full_name || b.name || '')));
}

function renderResourcesManagerView() {
    const status = AppState.resourceRosterStatus || 'idle';
    const meta = AppState.resourceRosterMeta || {};
    const tab = AppState.resourcesManagerTab || 'dashboard';
    const roster = getManagerRoster();
    const apiEmps = asRmList(AppState.resourceApiEmployees);
    const apiOnline = AppState.resourceApiStatus === 'online';
    const dash = apiOnline && AppState.resourceApiMeta?.dashboard;
    const dashOk = !!(dash && typeof dash === 'object' && Number.isFinite(Number(dash.total_employees)));
    const apiHasFte = !!(dashOk && ((Number(dash.allocated) || 0) > 0 || (Number(dash.active_allocations) || 0) > 0));
    const sheetSum = typeof computeResourceRosterSummary === 'function'
        ? computeResourceRosterSummary(roster)
        : { total: roster.length, allocated: 0, bench: 0, partial: 0, conflicts: 0, freeing30: 0, avgUtil: 0, byDepartment: {} };
    const availablePeople = listRmAvailablePeople(roster, apiEmps, apiOnline);
    const summary = {
        ...sheetSum,
        bench: availablePeople.length,
        conflicts: sheetSum.conflicts,
        overAllocated: apiHasFte
            ? Math.max(sheetSum.conflicts || 0, Number(dash.over_allocated) || 0)
            : sheetSum.conflicts,
        freeing30: apiHasFte ? (Number(dash.freeing_30d) || sheetSum.freeing30) : sheetSum.freeing30,
        fromApi: false,
    };

    if (status === 'loading' && !roster.length && !apiEmps.length) {
        return `
        <div class="rm-manager">
            <div class="rm-manager-head">
                <h2 class="rm-manager-title">Resource management</h2>
                <p class="rm-manager-sub">Loading company roster…</p>
            </div>
            <div class="rm-empty">Loading roster…</div>
        </div>`;
    }

    if (meta.error && !roster.length && !apiEmps.length) {
        return `
        <div class="rm-manager">
            <div class="rm-manager-head">
                <h2 class="rm-manager-title">Resource management</h2>
                <p class="rm-manager-sub">Company roster from the Resource-management sibling sheet.</p>
            </div>
            <div class="rm-empty rm-empty--error">${escapeHtml(meta.error)}</div>
            <button type="button" class="btn btn-secondary" onclick="App.reloadResourceRoster()">Retry</button>
        </div>`;
    }

    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'employees', label: 'Employees' },
        { id: 'projects', label: 'Projects' },
        { id: 'allocations', label: 'Allocations' },
        { id: 'bench', label: 'Available' },
        { id: 'reports', label: 'Reports' },
    ];
    const tabBar = tabs.map(t => `
        <button type="button" class="rm-tab ${tab === t.id ? 'rm-tab--active' : ''}"
            onclick="App.setResourcesManagerTab('${t.id}')">${t.label}</button>
    `).join('');

    let panel = '';
    if (tab === 'employees') panel = renderRmEmployeesTab(roster, apiEmps, apiOnline);
    else if (tab === 'projects') panel = renderRmProjectsTab(apiOnline);
    else if (tab === 'allocations') panel = renderRmAllocationsTab(roster, apiOnline);
    else if (tab === 'bench') panel = renderRmBenchTab(roster, apiOnline);
    else if (tab === 'reports') panel = renderRmReportsTab(roster, summary, apiOnline);
    else panel = renderRmDashboardTab(roster, summary, apiOnline);

    const src = meta.source ? escapeHtml(meta.source) : 'Resource-management';
    const count = summary.total;
    const apiStatus = AppState.resourceApiStatus || 'idle';
    const apiMeta = AppState.resourceApiMeta || {};
    const canManage = typeof App !== 'undefined' && App.canManageResources && App.canManageResources();
    const brief = getRmCapacityBrief(summary);

    let statusDot = 'rm-status-dot--idle';
    let statusLabel = 'Connecting…';
    if (apiStatus === 'online') {
        statusDot = 'rm-status-dot--on';
        statusLabel = 'Live staffing data';
    } else if (apiStatus === 'offline') {
        statusDot = 'rm-status-dot--off';
        statusLabel = 'Offline — sheet roster only';
    }

    const adminMenu = `
        <details class="rm-admin-menu">
            <summary class="rm-admin-menu-btn" title="Admin tools">Admin</summary>
            <div class="rm-admin-menu-panel">
                <div class="rm-admin-menu-meta">
                    <span class="rm-status-dot ${statusDot}"></span>
                    ${escapeHtml(statusLabel)}
                    ${apiStatus === 'online' && apiMeta.dashboard?.total_employees != null
                        ? ` · ${apiMeta.dashboard.total_employees} in roster`
                        : ''}
                </div>
                <button type="button" class="rm-admin-menu-item" onclick="App.syncResourceApi({ silent: false })">Sync staffing data</button>
                ${apiOnline ? `<button type="button" class="rm-admin-menu-item" onclick="App.runResourceDailyJobs()">Run daily jobs</button>` : ''}
                <button type="button" class="rm-admin-menu-item" onclick="App.reloadResourceRoster()">Refresh roster sheet</button>
                ${apiStatus === 'offline' && apiMeta.hint
                    ? `<p class="rm-admin-menu-hint">${escapeHtml(apiMeta.hint)}</p>`
                    : ''}
                <p class="rm-admin-menu-hint">Source: ${src}</p>
            </div>
        </details>`;

    const primaryActions = canManage && apiOnline ? `
        <button type="button" class="rm-btn-secondary" onclick="App.openProjectPaneCreate()">+ Project</button>
        <button type="button" class="rm-btn-primary" onclick="App.openAllocModal()">+ Allocate</button>
    ` : '';

    const drawer = renderRmEmployeeDrawer(apiEmps, apiOnline);
    const assignDrawer = renderRmAssignPeopleDrawerIfOpen();

    return `
    <div class="rm-manager">
        <div class="rm-manager-head">
            <div class="rm-manager-head-copy">
                <h2 class="rm-manager-title">Resource management</h2>
                <p class="rm-manager-sub rm-manager-sub--brief rm-manager-sub--${brief.tone}">${escapeHtml(brief.text)}</p>
                <p class="rm-manager-meta">
                    <span class="rm-status-dot ${statusDot}"></span>
                    ${count} people · ${escapeHtml(statusLabel)}
                </p>
            </div>
            <div class="rm-manager-actions">
                ${primaryActions}
                ${adminMenu}
            </div>
        </div>
        <div class="rm-tabs">${tabBar}</div>
        <div class="rm-panel">${panel}</div>
        ${drawer}
    </div>
    ${assignDrawer}`;
}

/** Merge Resource API catalog + main Project tab (sibling sheet) for Manager Projects UI. */
function getRmMergedProjects() {
    const byExt = new Map();
    asRmList(AppState.resourceApiProjects).forEach(p => {
        const ext = String(p.external_id || '').trim();
        if (!ext) return;
        byExt.set(ext, {
            ...p,
            catalogId: p.id,
            external_id: ext,
            activity_type: p.activity_type || 'project',
        });
    });
    (AppState.allProjects || []).forEach(p => {
        const ext = String(p.id || '').trim();
        if (!ext) return;
        const cur = byExt.get(ext);
        if (cur) {
            cur.name = p.name || cur.name;
            cur.client = p.client || cur.client;
            cur.stage = p.stage || cur.stage;
            cur.status = p.status || cur.status;
            cur.priority = p.priority || cur.priority;
            cur.release_date = p.release_date || p.releaseDate || cur.release_date;
            if (cur.source !== 'manual') cur.source = 'synced';
        } else {
            byExt.set(ext, {
                catalogId: null,
                id: null,
                external_id: ext,
                workspace_id: AppState.activeWorkspaceId || 'default',
                name: p.name || ext,
                client: p.client || '',
                stage: p.stage || '',
                status: p.status || '',
                priority: p.priority || '',
                release_date: p.release_date || p.releaseDate || '',
                activity_type: 'project',
                source: 'sheet',
                synced_at: null,
            });
        }
    });
    return [...byExt.values()].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

function findRmMergedProject(selectedId, externalId) {
    const merged = getRmMergedProjects();
    if (selectedId) {
        const hit = merged.find(p => p.catalogId === selectedId || p.id === selectedId);
        if (hit) return hit;
    }
    const ext = externalId || AppState.resourceSelectedProjectExternalId;
    if (ext) return merged.find(p => p.external_id === ext) || null;
    return null;
}

/** Merge Atlas delivery projects + Resource API catalog for allocate dropdowns. */
function getRmAllocatableProjects() {
    const byId = new Map();
    asRmList(AppState.resourceApiProjects).forEach(p => {
        const id = p.external_id || p.id;
        if (!id) return;
        byId.set(String(id), {
            id: String(id),
            name: p.name || id,
            stage: p.stage || '',
            client: p.client || '',
            source: p.source || 'catalog',
            release_date: p.release_date || '',
            status: p.status || '',
            priority: p.priority || '',
            catalogId: p.id,
        });
    });
    (AppState.allProjects || []).forEach(p => {
        const id = String(p.id || '');
        if (!id) return;
        if (!byId.has(id)) {
            byId.set(id, {
                id,
                name: p.name || id,
                stage: p.stage || '',
                client: p.client || '',
                source: 'atlas',
                release_date: p.release_date || '',
                status: p.status || '',
                priority: p.priority || '',
            });
        } else {
            const cur = byId.get(id);
            if (!cur.name && p.name) cur.name = p.name;
        }
    });
    const done = new Set(['live', 'completed', 'done', 'closed']);
    return [...byId.values()]
        .filter(p => !done.has(String(p.stage || '').toLowerCase()))
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

function formatRmStatusLabel(emp) {
    const d = String(emp?.designation || '').toLowerCase();
    if (/admin|director|head|lead|manager|vp|chief|principal/.test(d)) return 'Admin';
    const avail = String(emp?.availability_status || '').toLowerCase();
    if (/leadership|non.?project|excluded/.test(avail)) return 'Leadership';
    if (/bench|available|guest/.test(avail)) return 'Guest';
    return 'Member';
}

function isRmProjectStaffable(emp) {
    if (!emp) return false;
    if (emp.project_staffable === false) return false;
    const name = (typeof normalizePersonKey === 'function'
        ? normalizePersonKey(emp.full_name || emp.name)
        : String(emp.full_name || emp.name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim());
    const configured = (typeof CONFIG !== 'undefined' && CONFIG.RESOURCE_API && CONFIG.RESOURCE_API.NON_PROJECT_STAFF_NAMES) || [];
    const excluded = new Set(configured.map(n =>
        (typeof normalizePersonKey === 'function' ? normalizePersonKey(n) : String(n).toLowerCase().trim())
    ).filter(Boolean));
    if (excluded.has(name)) return false;
    if (name.startsWith('madhulal') || name.startsWith('sharmiq') || name.startsWith('sharmiw')) return false;
    if (/\bdirector\b/i.test(String(emp.designation || ''))) return false;
    return true;
}

function formatRmJoinedLabel(emp) {
    if (emp?.created_at) {
        const d = new Date(emp.created_at);
        if (!Number.isNaN(d.getTime())) {
            return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
    }
    if (emp?.years_at_company != null) return `${emp.years_at_company}y tenure`;
    return '—';
}

function getRmStatusDotClass(emp) {
    const avail = String(emp?.availability_status || '').toLowerCase();
    if (/bench|available/.test(avail)) return 'rm-user-dot--away';
    if (/partial/.test(avail)) return 'rm-user-dot--partial';
    return 'rm-user-dot--active';
}

function getRmEmployeeTeamsLabel(employeeId, allocs, projectMap) {
    const mine = (allocs || []).filter(a =>
        a.employee_id === employeeId && String(a.status || 'Active').toLowerCase() !== 'released');
    if (!mine.length) return '—';
    const names = mine.map(a => {
        const p = projectMap[a.project_external_id];
        const n = p?.name || a.project_external_id || '';
        return String(n).split(/[\s/\-]+/)[0].slice(0, 8).toUpperCase();
    }).filter(Boolean);
    if (!names.length) return '—';
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} + ${names.length - 2}`;
}

function renderRmUserCell(emp) {
    const name = emp?.full_name || '—';
    const sub = emp?.email || emp.employee_code || emp.department || '—';
    return `
    <div class="rm-user-cell">
        <div class="rm-user-avatar-wrap">
            <div class="rm-avatar rm-avatar--user" style="background:${stringToColor(name)}">${getInitials(name)}</div>
            <span class="rm-user-dot ${getRmStatusDotClass(emp)}" aria-hidden="true"></span>
        </div>
        <div class="rm-user-text">
            <div class="rm-user-name">${escapeHtml(name)}</div>
            <div class="rm-user-email">${escapeHtml(sub)}</div>
        </div>
    </div>`;
}

function formatRmAvailStatus(emp, alreadyOnProject) {
    const signal = formatRmAvailSignal(emp, alreadyOnProject);
    return { label: signal.label, cls: signal.tone === 'ok' ? 'rm-assign-status--ok' : 'rm-assign-status--busy' };
}

function formatRmAvailSignal(emp, alreadyOnThisProject) {
    if (alreadyOnThisProject) {
        return { label: 'Already assigned', tone: 'busy' };
    }
    const allocs = asRmList(AppState.resourceApiAllocations).filter(a =>
        String(a.employee_id) === String(emp?.id) && String(a.status || 'Active').toLowerCase() !== 'released');
    const catalog = Object.fromEntries(asRmList(AppState.resourceApiProjects).map(p => [String(p.external_id || p.id), p]));
    const sheet = Object.fromEntries((AppState.allProjects || []).map(p => [String(p.id), p]));
    if (allocs.length) {
        const a = allocs[0];
        const proj = catalog[String(a.project_external_id)] || sheet[String(a.project_external_id)] || {};
        const pname = proj.name || a.project_external_id || 'a project';
        const pct = Number(a.allocation_pct) || 0;
        return { label: `Allocated · ${pname} (${pct}%)`, tone: 'busy' };
    }
    if ((Number(emp?.utilization_pct) || 0) > 0) {
        return { label: `Allocated · ${emp.utilization_pct}%`, tone: 'busy' };
    }
    return { label: 'Available', tone: 'ok' };
}

function getRmAssignOverLimitNames(employeeIds, extraPct) {
    const pct = Number(extraPct) || 0;
    const lookup = Object.fromEntries(asRmList(AppState.resourceApiEmployees).map(e => [String(e.id), e]));
    return (employeeIds || []).map(String).filter(id => {
        const emp = lookup[id];
        const used = Number(emp?.utilization_pct) || 0;
        return used + pct > 100;
    }).map(id => lookup[id]?.full_name || id);
}

function getRmProjectFte(externalId, allocs) {
    return (allocs || [])
        .filter(a => a.project_external_id === externalId && String(a.status || '').toLowerCase() !== 'released')
        .reduce((s, a) => s + (Number(a.allocation_pct) || 0), 0);
}

function getRmProjectsKpis(projects, allocs) {
    const dash = AppState.resourceApiMeta?.dashboard || {};
    const emps = asRmList(AppState.resourceApiEmployees);
    const allocList = asRmList(allocs);
    const projectList = asRmList(projects);
    return {
        totalPeople: dash.total_employees ?? emps.length,
        activeProjects: projectList.length,
        totalFte: Math.round(allocList.reduce((s, a) => s + (Number(a.allocation_pct) || 0), 0) / 10) / 10,
        utilization: dash.avg_utilization_pct ?? 0,
        openRoles: dash.bench ?? emps.filter(e => isRmProjectStaffable(e) && /bench|available/i.test(e.availability_status || '')).length,
    };
}

function formatRmProjectStageBadge(p) {
    const raw = String(p.stage || p.status || 'Active').replace(/_/g, ' ');
    const lower = raw.toLowerCase();
    let cls = 'rm-proj-badge--progress';
    if (/plan|draft|new/.test(lower)) cls = 'rm-proj-badge--plan';
    if (/complete|done|live|closed|archived/.test(lower)) cls = 'rm-proj-badge--done';
    return `<span class="rm-proj-badge ${cls}">${escapeHtml(raw)}</span>`;
}

function renderRmProjectIcon(name) {
    return `<span class="rm-proj-icon" style="background:${stringToColor(name || 'P')}">${getInitials(name || 'P')}</span>`;
}

function renderRmFteCell(pctSum, peopleCount) {
    const sum = Number(pctSum) || 0;
    const fte = Math.round((sum / 100) * 10) / 10;
    const people = peopleCount != null
        ? peopleCount
        : (sum > 0 ? Math.max(1, Math.round(sum / 100)) : 0);
    if (!people && fte <= 0) {
        return `<div class="rm-fte-cell"><span class="rm-fte-pct rm-fte-pct--empty">—</span></div>`;
    }
    return `<div class="rm-fte-cell">
        <span class="rm-fte-pct">${fte} FTE</span>
        <span class="rm-fte-sub">${people} ${people === 1 ? 'person' : 'people'}</span>
    </div>`;
}

/** @deprecated use renderRmFteCell — kept as thin wrapper for any leftover callers */
function renderRmFteBar(pct, peopleCount) {
    return renderRmFteCell(pct, peopleCount);
}

function getRmCapacityBrief(summary) {
    const util = Number(summary.avgUtil) || 0;
    const over = Number(summary.overAllocated != null ? summary.overAllocated : summary.conflicts) || 0;
    const bench = Number(summary.bench) || 0;
    const allocated = Number(summary.allocated) || 0;
    if (over > 0) {
        return {
            tone: 'risk',
            text: `${over} ${over === 1 ? 'person is' : 'people are'} overbooked — review allocations before taking on new work.`,
        };
    }
    if (bench === 0 && util >= 90) {
        return {
            tone: 'tight',
            text: `Capacity is tight — ${util}% average utilization and no one available right now.`,
        };
    }
    if (bench >= 5) {
        return {
            tone: 'ok',
            text: `Capacity looks healthy — ${bench} available for new work, ${allocated} on delivery.`,
        };
    }
    return {
        tone: 'ok',
        text: `${allocated} on delivery · ${bench} available · ${util}% average utilization.`,
    };
}

function renderRmAvatarStack(ids, empMap, max = 4) {
    const list = (ids || []).filter(Boolean);
    if (!list.length) return `<span class="rm-av-stack-empty">—</span>`;
    const shown = list.slice(0, max);
    const extra = list.length - shown.length;
    const avatars = shown.map(id => {
        const e = empMap[id];
        const name = e?.full_name || id;
        return `<span class="rm-av-stack-item" style="background:${stringToColor(name)}" title="${escapeHtml(name)}">${getInitials(name)}</span>`;
    }).join('');
    const more = extra > 0 ? `<span class="rm-av-stack-more">+${extra}</span>` : '';
    return `<div class="rm-av-stack">${avatars}${more}</div>`;
}

function daysUntilRelease(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    return Math.ceil((d - new Date()) / 86400000);
}

function getRmActivityType(p) {
    const raw = String(p?.activity_type || 'project').toLowerCase().trim();
    if (raw === 'operational' || raw === 'operation' || raw === 'ops' || raw === 'non_project' || raw === 'non-project' || raw === 'internal') {
        return 'operational';
    }
    return 'project';
}

function isRmDeliveryProject(p) {
    return getRmActivityType(p) === 'project';
}

function formatRmActivityBadge(p) {
    if (getRmActivityType(p) === 'operational') {
        return `<span class="rm-proj-type-badge rm-proj-type-badge--ops">Operational</span>`;
    }
    return `<span class="rm-proj-active-badge rm-proj-active-badge--sm">Active project</span>`;
}

function filterRmProjectsByView(projects, view) {
    const done = new Set(['live', 'completed', 'done', 'closed', 'archived']);
    const v = view === 'all' ? 'active' : (view || 'active');
    let list = [...projects];
    if (v === 'archived') {
        list = list.filter(p =>
            done.has(String(p.stage || '').toLowerCase())
            || done.has(String(p.status || '').toLowerCase()));
    } else if (v === 'operational') {
        list = list.filter(p => getRmActivityType(p) === 'operational'
            && !done.has(String(p.stage || '').toLowerCase())
            && !done.has(String(p.status || '').toLowerCase()));
    } else if (v === 'recent') {
        list = list.filter(p => isRmDeliveryProject(p));
        list.sort((a, b) =>
            String(b.synced_at || b.release_date || '').localeCompare(String(a.synced_at || a.release_date || '')));
        list = list.slice(0, 30);
        return list;
    } else {
        // active (default): delivery projects only, not archived
        list = list.filter(p => isRmDeliveryProject(p)
            && !done.has(String(p.stage || '').toLowerCase())
            && !done.has(String(p.status || '').toLowerCase()));
    }
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

function renderRmAssignPickTable(employees, options) {
    const {
        selected = new Set(),
        alreadyOn = new Set(),
        emptyMessage = 'No employees loaded.',
        draftPct = 100,
    } = options || {};

    if (!employees.length) {
        return `<div class="rm-empty rm-empty--inline">${escapeHtml(emptyMessage)}</div>`;
    }

    const rows = employees.map(e => {
        const empId = String(e.id);
        const on = selected.has(empId);
        const already = alreadyOn.has(empId) || alreadyOn.has(e.id);
        const status = formatRmAvailStatus(e, already);
        const role = e.designation || e.role_family || 'Developer';
        return `
        <tr class="rm-assign-row ${on ? 'rm-assign-row--on' : ''} ${already ? 'rm-assign-row--already' : ''}"
            data-id="${escapeHtml(empId)}"
            onclick="App.toggleAllocEmployeeRow('${escapeHtml(empId)}', event)">
            <td class="rm-assign-check" onclick="event.stopPropagation()">
                <input type="checkbox" name="employee_ids" value="${escapeHtml(empId)}"
                    ${on ? 'checked' : ''}
                    aria-label="Select ${escapeHtml(e.full_name)}"
                    onclick="event.stopPropagation()"
                    onchange="App.toggleAllocEmployee('${escapeHtml(empId)}', this.checked)" />
            </td>
            <td>${renderRmUserCell(e)}</td>
            <td class="rm-assign-muted">${escapeHtml(role)}</td>
            <td><span class="rm-assign-status ${status.cls}">${escapeHtml(status.label)}</span></td>
            <td class="rm-assign-action" onclick="event.stopPropagation()">
                <button type="button" class="rm-link" onclick="App.selectResourceEmployee('${escapeHtml(empId)}')">View</button>
            </td>
        </tr>`;
    }).join('');

    const allSelected = employees.length > 0 && employees.every(e => selected.has(String(e.id)));
    const someSelected = employees.some(e => selected.has(String(e.id)));

    return `
    <div class="rm-assign-table-wrap">
        <table class="rm-assign-table">
            <thead>
                <tr>
                    <th class="rm-assign-check">
                        <input type="checkbox" title="Select all visible"
                            aria-label="Select all visible people"
                            ${allSelected ? 'checked' : ''}
                            ${someSelected && !allSelected ? 'data-indeterminate="1"' : ''}
                            onchange="App.selectVisibleAllocPeople(this.checked)" />
                    </th>
                    <th>People</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    </div>`;
}

function renderRmProjectsKpiRow(kpis) {
    const cards = [
        { icon: Icons.users, val: kpis.totalPeople, label: 'Total People', sub: 'Active resources' },
        { icon: Icons.briefcase, val: kpis.activeProjects, label: 'Active Projects', sub: 'Across all clients' },
        { icon: Icons.chart, val: kpis.totalFte, label: 'Total FTE', sub: 'People-capacity assigned' },
        { icon: Icons.trendUp, val: `${kpis.utilization}%`, label: 'Utilization', sub: 'Company wide' },
        { icon: Icons.zap, val: kpis.openRoles, label: 'Open Roles', sub: 'Needs allocation' },
    ];
    return `<div class="rm-proj-kpi-row">${cards.map(c => `
        <div class="rm-proj-kpi card-light">
            <div class="rm-proj-kpi-icon ui-inline-icon">${c.icon}</div>
            <div class="rm-proj-kpi-body">
                <div class="rm-proj-kpi-val">${c.val}</div>
                <div class="rm-proj-kpi-label">${c.label}</div>
                <div class="rm-proj-kpi-sub">${c.sub}</div>
            </div>
        </div>`).join('')}
    </div>`;
}

function renderRmProjectsInsights(projects, allocs, kpis) {
    const dash = AppState.resourceApiMeta?.dashboard || {};
    const total = Math.max(1, dash.total_employees || kpis.totalPeople || 1);
    const billable = Math.round(((dash.allocated || 0) / total) * 100);
    const bench = Math.round(((dash.bench || 0) / total) * 100);
    const partial = Math.max(0, 100 - billable - bench);

    const upcoming = [...projects]
        .filter(p => p.release_date)
        .sort((a, b) => String(a.release_date).localeCompare(String(b.release_date)))
        .slice(0, 5);

    const upcomingRows = upcoming.length ? upcoming.map(p => {
        const days = daysUntilRelease(p.release_date);
        let badgeCls = 'rm-release-badge--far';
        if (days != null && days <= 7) badgeCls = 'rm-release-badge--urgent';
        else if (days != null && days <= 30) badgeCls = 'rm-release-badge--soon';
        const badge = days != null ? `${days} days` : '—';
        return `<div class="rm-release-row">
            <div>
                <div class="rm-release-name">${escapeHtml(p.name)}</div>
                <div class="rm-release-date">${escapeHtml(p.release_date)}</div>
            </div>
            <span class="rm-release-badge ${badgeCls}">${badge}</span>
        </div>`;
    }).join('') : `<div class="rm-empty rm-empty--inline">No upcoming releases</div>`;

    const insights = [];
    const due30 = upcoming.filter(p => {
        const d = daysUntilRelease(p.release_date);
        return d != null && d >= 0 && d <= 30;
    }).length;
    if (due30) insights.push({ icon: Icons.calendar, text: `${due30} project${due30 > 1 ? 's are' : ' is'} due in the next 30 days` });
    if (dash.over_allocated) insights.push({ icon: Icons.alert, text: `${dash.over_allocated} people are over-allocated` });
    if (dash.freeing_30d) insights.push({ icon: Icons.users, text: `${dash.freeing_30d} people freeing up in 30 days` });
    if (!insights.length) insights.push({ icon: Icons.checkCircle, text: 'Staffing looks healthy — no urgent alerts' });

    const insightRows = insights.map(i => `
        <div class="rm-insight-row">
            <span class="rm-insight-icon ui-inline-icon">${i.icon}</span>
            <span>${escapeHtml(i.text)}</span>
        </div>`).join('');

    return `
    <div class="rm-proj-insights">
        <div class="rm-proj-insight card-light">
            <h4 class="rm-proj-insight-title">Resource Utilization</h4>
            <div class="rm-donut-wrap">
                <div class="rm-donut" style="background:conic-gradient(var(--accent-primary) 0 ${billable}%, #94a3b8 ${billable}% ${billable + partial}%, #e2e8f0 ${billable + partial}% 100%)">
                    <div class="rm-donut-hole">
                        <strong>${kpis.utilization}%</strong>
                        <span>Utilized</span>
                    </div>
                </div>
                <div class="rm-donut-legend">
                    <div><span class="rm-legend-dot rm-legend-dot--bill"></span> Billable ${billable}%</div>
                    <div><span class="rm-legend-dot rm-legend-dot--partial"></span> Partial ${partial}%</div>
                    <div><span class="rm-legend-dot rm-legend-dot--bench"></span> Bench ${bench}%</div>
                </div>
            </div>
        </div>
        <div class="rm-proj-insight card-light">
            <h4 class="rm-proj-insight-title">Upcoming Releases</h4>
            <div class="rm-release-list">${upcomingRows}</div>
        </div>
        <div class="rm-proj-insight card-light">
            <h4 class="rm-proj-insight-title">Quick Insights</h4>
            <div class="rm-insight-list">${insightRows}</div>
        </div>
    </div>`;
}

function renderRmUserPickTable(employees, options) {
    const {
        selected = new Set(),
        alreadyOn = new Set(),
        allocs = [],
        projectMap = {},
        emptyMessage = 'No employees loaded.',
    } = options || {};

    if (!employees.length) {
        return `<div class="rm-empty rm-empty--inline">${escapeHtml(emptyMessage)}</div>`;
    }

    const rows = employees.map(e => {
        const on = selected.has(e.id);
        const already = alreadyOn.has(e.id);
        const teams = getRmEmployeeTeamsLabel(e.id, allocs, projectMap);
        return `
        <tr class="rm-user-pick-row ${on ? 'rm-user-pick-row--on' : ''} ${already ? 'rm-user-pick-row--already' : ''}"
            data-id="${escapeHtml(e.id)}"
            onclick="App.toggleAllocEmployeeRow('${escapeHtml(e.id)}', event)">
            <td class="rm-user-pick-check" onclick="event.stopPropagation()">
                <input type="checkbox" name="employee_ids" value="${escapeHtml(e.id)}"
                    ${on ? 'checked' : ''}
                    aria-label="Select ${escapeHtml(e.full_name)}"
                    onchange="App.toggleAllocEmployee('${escapeHtml(e.id)}', this.checked)" />
            </td>
            <td class="rm-user-pick-name">${renderRmUserCell(e)}</td>
            <td class="rm-user-pick-muted">${escapeHtml(formatRmStatusLabel(e))}</td>
            <td class="rm-user-pick-muted">${escapeHtml(formatRmJoinedLabel(e))}</td>
            <td class="rm-user-pick-muted rm-user-pick-teams">${escapeHtml(teams)}</td>
        </tr>`;
    }).join('');

    return `
    <div class="rm-user-pick-wrap">
        <table class="rm-user-pick-table">
            <thead>
                <tr>
                    <th class="rm-user-pick-check" aria-label="Select"></th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Teams</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    </div>`;
}

function renderRmAssignPeopleDrawerIfOpen() {
    if (!AppState.resourceAllocDrawerOpen) return '';
    const p = findRmMergedProject(AppState.resourceSelectedProjectId, AppState.resourceSelectedProjectExternalId);
    if (!p) return '';
    const extId = p.external_id || p.id;
    const allocs = asRmList(AppState.resourceApiAllocations).filter(a => a.project_external_id === extId);
    return renderRmAssignPeopleDrawer(p, extId, allocs);
}

function renderRmAssignRosterList(employees, options) {
    const {
        selected = new Set(),
        alreadyOn = new Set(),
        emptyMessage = 'No people to add.',
    } = options || {};

    if (!employees.length) {
        return `<div class="rm-assign-roster-empty" role="status">${escapeHtml(emptyMessage)}</div>`;
    }

    return `<ul class="rm-assign-roster" role="list">${employees.map(e => {
        const empId = String(e.id);
        const already = alreadyOn.has(empId) || alreadyOn.has(e.id);
        const on = selected.has(empId);
        const signal = formatRmAvailSignal(e, already);
        const statusCls = signal.tone === 'ok' ? 'rm-assign-status--ok' : 'rm-assign-status--busy';
        const name = e.full_name || '—';
        const role = e.designation || e.role_family || '—';
        return `
        <li class="rm-assign-person ${on ? 'rm-assign-person--on' : ''} ${already ? 'rm-assign-person--disabled' : ''}"
            data-id="${escapeHtml(empId)}">
            <label class="rm-assign-person-row">
                <input type="checkbox" name="employee_ids" value="${escapeHtml(empId)}"
                    ${on ? 'checked' : ''} ${already ? 'disabled' : ''}
                    aria-label="Select ${escapeHtml(name)}"
                    onchange="App.toggleAllocEmployee('${escapeHtml(empId)}', this.checked)" />
                <span class="rm-avatar rm-avatar--user" style="background:${stringToColor(name)}" aria-hidden="true">${getInitials(name)}</span>
                <span class="rm-assign-person-text">
                    <span class="rm-assign-person-name">${escapeHtml(name)}</span>
                    <span class="rm-assign-person-role">${escapeHtml(role)}</span>
                    <span class="rm-assign-status ${statusCls}">${escapeHtml(signal.label)}</span>
                </span>
            </label>
        </li>`;
    }).join('')}</ul>`;
}

function renderRmAssignPeopleDrawer(project, extId, allocs) {
    const draft = AppState.resourceAllocDraft || {
        selectedEmployeeIds: [],
        allocationPct: 100,
        projectRole: '',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
        strict: false,
    };
    const selected = new Set((draft.selectedEmployeeIds || []).map(String));
    const peopleQ = String(AppState.resourceAllocPeopleFilter || '').trim().toLowerCase();
    const roleQ = String(AppState.resourceAllocRoleFilter || '').trim().toLowerCase();
    const showAll = !!AppState.resourceAllocShowAll;
    const alreadyOnProject = new Set(
        asRmList(allocs)
            .filter(a => String(a.status || '').toLowerCase() !== 'released')
            .map(a => String(a.employee_id))
    );

    let employees = [...asRmList(AppState.resourceApiEmployees)].filter(isRmProjectStaffable);
    if (peopleQ) {
        employees = employees.filter(e =>
            String(e.full_name || '').toLowerCase().includes(peopleQ)
            || String(e.email || '').toLowerCase().includes(peopleQ)
            || String(e.department || '').toLowerCase().includes(peopleQ)
            || String(e.designation || '').toLowerCase().includes(peopleQ));
    }
    if (roleQ) {
        employees = employees.filter(e =>
            String(e.designation || e.role_family || '').toLowerCase().includes(roleQ));
    }
    employees.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

    const addable = employees.filter(e => !alreadyOnProject.has(String(e.id)));
    const roster = showAll ? employees : addable;
    const hasQuery = !!(peopleQ || roleQ);
    let emptyMessage = 'Sync API to load employees.';
    if (asRmList(AppState.resourceApiEmployees).filter(isRmProjectStaffable).length) {
        if (!roster.length && !addable.length && !hasQuery) {
            emptyMessage = 'Everyone who can be assigned is already on this project.';
        } else if (!roster.length) {
            emptyMessage = 'No people match.';
        }
    }

    const roles = [...new Set(asRmList(AppState.resourceApiEmployees).map(e => e.designation || e.role_family).filter(Boolean))].sort();
    const roleOpts = `<option value="">All roles</option>${roles.map(r =>
        `<option value="${escapeHtml(r)}" ${roleQ === String(r).toLowerCase() ? 'selected' : ''}>${escapeHtml(r)}</option>`
    ).join('')}`;

    const n = selected.size;
    const pct = Number(draft.allocationPct) || 100;
    const totalPct = n * pct;
    const overNames = getRmAssignOverLimitNames([...selected], pct);
    const blocked = n > 0 && !!draft.strict && overNames.length > 0;
    const assignDisabled = n === 0 || blocked;
    const assignTitle = n === 0
        ? 'Select at least one person'
        : (blocked ? `Can't assign — ${overNames.join(', ')} would exceed 100% FTE` : 'Assign selected people');
    const reasonText = blocked ? `Can't assign — ${overNames.join(', ')} would exceed 100% FTE` : '';
    const projectName = project?.name || 'this project';

    const configBar = n > 0 ? `
        <div class="rm-assign-config" id="rm-assign-config">
            <div class="rm-assign-config-fields">
                <label>FTE % (each)
                    <input type="number" min="1" max="100" value="${pct}"
                        oninput="App.setAllocDraftPct(this.value); const h=this.form.querySelector('[name=allocation_pct]'); if(h)h.value=this.value" />
                </label>
                <label>Role override
                    <input type="text" placeholder="Defaults to each person's designation" value="${escapeHtml(draft.projectRole || '')}"
                        oninput="this.form.querySelector('[name=project_role]').value=this.value;App.ensureAllocDraft().projectRole=this.value" />
                </label>
            </div>
            <label class="rm-check">
                <input type="checkbox" name="strict" ${draft.strict ? 'checked' : ''}
                    onchange="App.setAllocDraftStrict(this.checked)" />
                Reject if anyone would exceed 100% FTE
            </label>
        </div>` : '';

    return `
    <div class="rm-drawer-backdrop rm-assign-drawer-backdrop" onclick="if(event.target===this)App.closeAssignPeopleDrawer()">
        <aside id="rm-assign-people-panel" class="rm-drawer rm-assign-drawer card-light" role="dialog" aria-modal="true" aria-labelledby="rm-assign-drawer-title">
            <form class="rm-assign-drawer-form" onsubmit="event.preventDefault();App.submitAllocModal(this)">
                <input type="hidden" name="project_external_id" value="${escapeHtml(extId)}" />
                <input type="hidden" name="allocation_pct" value="${pct}" />
                <input type="hidden" name="project_role" value="${escapeHtml(draft.projectRole || '')}" />
                <input type="hidden" name="start_date" value="${escapeHtml(draft.startDate || '')}" />
                <input type="hidden" name="end_date" value="${escapeHtml(draft.endDate || '')}" />
                <header class="rm-assign-drawer-head">
                    <h3 id="rm-assign-drawer-title">Assign people to ${escapeHtml(projectName)}</h3>
                    <button type="button" class="rm-modal-close" aria-label="Close" title="Close" onclick="App.closeAssignPeopleDrawer()">×</button>
                </header>
                <div class="rm-assign-drawer-tools">
                    <input class="rm-search rm-alloc-people-search" type="search" placeholder="Search people…"
                        value="${escapeHtml(AppState.resourceAllocPeopleFilter || '')}"
                        oninput="App.setResourceAllocPeopleFilter(this.value)" />
                    <select class="rm-proj-role-filter" aria-label="Filter by role" onchange="App.setResourceAllocRoleFilter(this.value)">${roleOpts}</select>
                    <label class="rm-check rm-assign-showall">
                        <input type="checkbox" ${showAll ? 'checked' : ''} onchange="App.toggleAllocShowAll(this.checked)" />
                        Show all
                    </label>
                </div>
                <div class="rm-assign-drawer-list">
                    ${renderRmAssignRosterList(roster, {
                        selected,
                        alreadyOn: alreadyOnProject,
                        emptyMessage,
                    })}
                </div>
                ${configBar}
                <footer class="rm-assign-drawer-foot">
                    <div class="rm-assign-foot-copy">
                        <div id="rm-assign-foot-summary">${n} ${n === 1 ? 'person' : 'people'} selected · Total ${totalPct}% FTE</div>
                        <div id="rm-assign-foot-reason" class="rm-assign-reason" ${reasonText ? '' : 'hidden'}>${escapeHtml(reasonText)}</div>
                    </div>
                    <div class="rm-assign-foot-actions">
                        <button type="button" class="rm-proj-btn-ghost" onclick="App.closeAssignPeopleDrawer()">Cancel</button>
                        <button type="submit" class="rm-proj-btn-primary" id="rm-assign-submit"
                            ${assignDisabled ? 'disabled' : ''}
                            title="${escapeHtml(assignTitle)}"
                            aria-disabled="${assignDisabled ? 'true' : 'false'}">Assign</button>
                    </div>
                </footer>
            </form>
        </aside>
    </div>`;
}

function renderRmProjectPane(apiOnline) {
    if (!apiOnline) return '';
    const mode = AppState.resourceProjectPaneMode || 'empty';
    const selectedId = AppState.resourceSelectedProjectId;

    if (mode === 'create' || mode === 'edit') {
        const f = AppState.resourceProjectForm || {};
        const isEdit = mode === 'edit';
        return `
        <div class="rm-proj-detail card-light">
            <div class="rm-proj-detail-head">
                <h3 class="rm-proj-detail-title">${isEdit ? 'Edit project' : 'New project'}</h3>
            </div>
            <form class="rm-form rm-proj-detail-body" onsubmit="event.preventDefault();App.submitProjectModal(this)">
                <label>Name
                    <input name="name" type="text" required placeholder="Project or activity name" value="${escapeHtml(f.name || '')}" />
                </label>
                <label>Type
                    <select name="activity_type">
                        <option value="project" ${(f.activityType || 'project') === 'project' ? 'selected' : ''}>Active project</option>
                        <option value="operational" ${(f.activityType || '') === 'operational' ? 'selected' : ''}>Operational activity (HR, Marketing, internal)</option>
                    </select>
                </label>
                <label>Client
                    <input name="client" type="text" placeholder="Optional" value="${escapeHtml(f.client || '')}" />
                </label>
                <label>Target release
                    <input name="release_date" type="date" value="${escapeHtml(f.releaseDate || '')}" />
                </label>
                ${isEdit ? '' : `<label class="rm-check"><input type="checkbox" name="allocate_after" checked /> Open detail after saving</label>`}
                <p class="rm-hint">${isEdit
                    ? 'Operational activities stay off the Active Projects list and project planning views.'
                    : 'Use Operational for ongoing functions like HR or Marketing — not delivery projects.'}</p>
                <div class="rm-proj-detail-foot">
                    ${isEdit && f.id ? `<button type="button" class="rm-proj-btn-danger" onclick='App.deleteResourceProject(${JSON.stringify(f.id)}, ${JSON.stringify(f.name || '')})'>Delete</button>` : ''}
                    <button type="button" class="btn btn-secondary" onclick="App.cancelProjectPane()">Cancel</button>
                    <button type="button" class="rm-proj-btn-primary" onclick="this.closest('.rm-proj-detail').querySelector('form').requestSubmit()">${isEdit ? 'Save changes' : 'Add'}</button>
                </div>
            </form>
        </div>`;
    }

    if (mode === 'detail' && (selectedId || AppState.resourceSelectedProjectExternalId)) {
        const p = findRmMergedProject(selectedId, AppState.resourceSelectedProjectExternalId)
            || asRmList(AppState.resourceApiProjects).find(x => x.id === selectedId);
        if (!p) {
            return `<div class="rm-proj-detail card-light"><div class="rm-pane-empty">Project not found.</div></div>`;
        }
        const extId = p.external_id || p.id;
        const allocs = asRmList(AppState.resourceApiAllocations).filter(a => a.project_external_id === extId);
        const projectFte = getRmProjectFte(extId, allocs);
        const daysLeft = daysUntilRelease(p.release_date);
        const empMap = Object.fromEntries(asRmList(AppState.resourceApiEmployees).map(e => [String(e.id), e]));
        const activeAllocs = allocs.filter(a => String(a.status || '').toLowerCase() !== 'released');
        const assignedRows = activeAllocs.length ? activeAllocs.map(a => {
            const emp = empMap[String(a.employee_id)];
            const name = emp?.full_name || a.employee_id;
            const dept = emp?.department || '—';
            const role = a.project_role || emp?.designation || '—';
            const pct = Number(a.allocation_pct) || 0;
            const start = a.start_date ? escapeHtml(String(a.start_date).slice(0, 10)) : '—';
            return `<tr>
                <td>
                    <div class="rm-emp-cell">
                        <div class="rm-avatar rm-avatar--user" style="background:${stringToColor(name)}">${getInitials(name)}</div>
                        <div>
                            <div class="rm-list-name">${escapeHtml(name)}</div>
                            <div class="rm-list-meta">${escapeHtml(dept)}</div>
                        </div>
                    </div>
                </td>
                <td>${escapeHtml(role)}</td>
                <td><strong>${pct}%</strong></td>
                <td><span class="rm-pill">${escapeHtml(a.status || 'Active')}</span></td>
                <td>${start}</td>
                <td class="rm-proj-actions-cell">
                    <button type="button" class="rm-icon-btn" title="Edit FTE %" aria-label="Edit FTE % for ${escapeHtml(name)}"
                        onclick='App.editAllocPct(${JSON.stringify(a.id)}, ${pct})'>${Icons.settings}</button>
                    <button type="button" class="rm-icon-btn rm-icon-btn--danger" title="Remove from project" aria-label="Remove ${escapeHtml(name)} from project"
                        onclick='App.releaseApiAllocation(${JSON.stringify(a.id)}, ${JSON.stringify(name)})'>${Icons.logout}</button>
                </td>
            </tr>`;
        }).join('') : '';

        const isOps = getRmActivityType(p) === 'operational';
        const typeBadge = isOps
            ? `<span class="rm-proj-type-badge rm-proj-type-badge--ops">Operational</span>`
            : `<span class="rm-proj-active-badge">Active project</span>`;
        const catId = p.catalogId || (p.source && p.source !== 'sheet' ? p.id : null)
            || (asRmList(AppState.resourceApiProjects).find(x => String(x.external_id) === String(extId)) || {}).id
            || null;
        const daysOverdue = daysLeft != null && daysLeft < 0;
        const daysVal = daysLeft == null ? '—' : Math.abs(daysLeft);
        const daysLbl = daysLeft == null ? 'Days left' : (daysOverdue ? 'Overdue' : 'Days left');
        const assignTrigger = `<button type="button" class="rm-proj-btn-primary" id="rm-assign-people-trigger"
            onclick="App.openAssignPeopleDrawer()">+ Assign people</button>`;
        const assignCta = `<button type="button" class="rm-proj-btn-primary" onclick="App.openAssignPeopleDrawer()">+ Assign people</button>`;

        const assignedBody = activeAllocs.length ? `
            <div class="rm-table-wrap rm-proj-assigned-table">
                <table class="rm-table">
                    <thead>
                        <tr>
                            <th>Employee</th><th>Role</th><th>FTE %</th><th>Status</th><th>Start Date</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${assignedRows}</tbody>
                </table>
            </div>` : `
            <div class="rm-assigned-empty">
                <div class="rm-assigned-empty-icon ui-inline-icon" aria-hidden="true">${Icons.users}</div>
                <p class="rm-assigned-empty-title">No one is assigned to this project yet.</p>
                <p class="rm-hint">Add people to staff this work.</p>
                ${assignCta}
            </div>`;

        const actions = catId ? `
            <div class="rm-proj-action-group">
                <button type="button" class="rm-proj-btn-ghost" onclick='App.setProjectActivityType(${JSON.stringify(catId)}, ${JSON.stringify(isOps ? 'project' : 'operational')})'>
                    Mark as ${isOps ? 'Active project' : 'Operational'}
                </button>
                <button type="button" class="rm-proj-btn-ghost" onclick="App.openProjectPaneEdit('${escapeHtml(catId)}')">Edit</button>
            </div>
            <details class="rm-proj-row-menu rm-proj-row-menu--danger-slot">
                <summary class="rm-proj-menu-btn" title="More actions" aria-label="More actions">⋯</summary>
                <div class="rm-proj-row-menu-panel">
                    <button type="button" class="rm-proj-row-menu-item rm-proj-row-menu-item--danger"
                        onclick='App.deleteResourceProject(${JSON.stringify(catId)}, ${JSON.stringify(p.name || '')})'>Delete project</button>
                </div>
            </details>` : `
            <div class="rm-proj-action-group">
                <button type="button" class="rm-proj-btn-ghost" onclick="App.syncResourceApi({ silent: false })">Sync to enable</button>
            </div>`;

        return `
        <div class="rm-proj-staff">
            <div class="rm-proj-detail card-light">
                <div class="rm-proj-detail-head">
                    <div class="rm-proj-detail-hero">
                        ${renderRmProjectIcon(p.name)}
                        <div>
                            <div class="rm-proj-detail-name-row">
                                <h1 class="rm-proj-detail-title">${escapeHtml(p.name)}</h1>
                                ${typeBadge}
                            </div>
                            <p class="rm-proj-detail-sub">${isOps ? 'Internal / operational activity' : `Release: ${escapeHtml(p.release_date || '—')}`}</p>
                        </div>
                    </div>
                    <div class="rm-proj-detail-actions">${actions}</div>
                </div>
                <div class="rm-proj-detail-stats">
                    <div><span class="rm-proj-stat-val">${activeAllocs.length}</span><span class="rm-proj-stat-lbl">Assigned</span></div>
                    <div><span class="rm-proj-stat-val">${projectFte}%</span><span class="rm-proj-stat-lbl">FTE</span></div>
                    <div class="${daysOverdue ? 'rm-proj-stat--overdue' : ''}"><span class="rm-proj-stat-val">${daysVal}</span><span class="rm-proj-stat-lbl">${daysLbl}</span></div>
                    <div class="rm-proj-stat-badge">${formatRmProjectStageBadge(p)}</div>
                </div>

                <div class="rm-proj-assigned">
                    <div class="rm-proj-assign-head">
                        <h4>Assigned team${activeAllocs.length ? ` <span class="rm-heading-count">(${activeAllocs.length})</span>` : ''}</h4>
                        ${assignTrigger}
                    </div>
                    ${assignedBody}
                </div>
            </div>
        </div>`;
    }

    return `
    <div class="rm-proj-detail card-light rm-proj-detail--empty">
        <div class="rm-pane-empty">
            <p class="rm-pane-empty-title">Select a project</p>
            <p class="rm-hint">Choose a project from the list to view staffing and assign people.</p>
            <button type="button" class="rm-proj-btn-primary" onclick="App.openProjectPaneCreate()">+ New Project</button>
        </div>
    </div>`;
}

function renderRmProjectsTab(apiOnline) {
    if (!apiOnline) {
        return `<div class="rm-empty">Start the Resource API to add and manage staffing projects.</div>`;
    }
    const pageKind = AppState.resourcesManagerProjectPage || 'list';
    const hasSel = !!(AppState.resourceSelectedProjectId || AppState.resourceSelectedProjectExternalId);
    if (pageKind === 'create'
        || (pageKind === 'detail' && (hasSel || AppState.resourceProjectPaneMode === 'edit'))) {
        return renderRmProjectStaffPage(apiOnline);
    }
    const q = String(AppState.resourceProjectFilter || '').trim().toLowerCase();
    const listView = AppState.resourceProjectListView || 'active';
    const page = Math.max(1, AppState.resourceProjectPage || 1);
    const pageSize = 50;
    const allocs = AppState.resourceApiAllocations || [];
    const empMap = Object.fromEntries(asRmList(AppState.resourceApiEmployees).map(e => [e.id, e]));
    const selectedId = AppState.resourceSelectedProjectId;
    const selectedExt = AppState.resourceSelectedProjectExternalId;

    let projects = filterRmProjectsByView(getRmMergedProjects(), listView);
    if (q) {
        projects = projects.filter(p =>
            String(p.name || '').toLowerCase().includes(q)
            || String(p.client || '').toLowerCase().includes(q)
            || String(p.external_id || '').toLowerCase().includes(q));
    }

    const kpis = getRmProjectsKpis(projects, allocs);
    const totalPages = Math.max(1, Math.ceil(projects.length / pageSize));
    const safePage = Math.min(page, totalPages);
    if (safePage !== page) AppState.resourceProjectPage = safePage;
    const pageProjects = projects.slice((safePage - 1) * pageSize, safePage * pageSize);

    const subTabs = [
        { id: 'active', label: 'Active Projects' },
        { id: 'operational', label: 'Operational' },
        { id: 'recent', label: 'Recent' },
        { id: 'archived', label: 'Archived' },
    ];
    const subTabBar = subTabs.map(t => `
        <button type="button" class="rm-proj-subtab ${listView === t.id || (t.id === 'active' && listView === 'all') ? 'rm-proj-subtab--active' : ''}"
            onclick="App.setResourceProjectListView('${t.id}')">${t.label}</button>
    `).join('');

    const rows = pageProjects.length ? pageProjects.map(p => {
        const extId = p.external_id || p.id;
        const projAllocs = allocs.filter(a => a.project_external_id === extId && String(a.status || '').toLowerCase() !== 'released');
        const peopleIds = projAllocs.map(a => a.employee_id);
        const fte = getRmProjectFte(extId, allocs);
        const isSelected = (p.catalogId && selectedId === p.catalogId) || selectedExt === extId;
        const catArg = p.catalogId ? escapeHtml(p.catalogId) : '';
        const catId = p.catalogId
            || (asRmList(AppState.resourceApiProjects).find(x => String(x.external_id) === String(extId)) || {}).id
            || '';
        const isOps = getRmActivityType(p) === 'operational';
        return `<tr class="rm-proj-row ${isSelected ? 'rm-proj-row--selected' : ''}"
                onclick="App.selectRmProject('${catArg}', '${escapeHtml(extId)}')">
            <td class="rm-proj-name-col">
                <div class="rm-proj-name-cell">
                    ${renderRmProjectIcon(p.name)}
                    <div>
                        <div class="rm-proj-name-line">
                            <span class="rm-proj-name">${escapeHtml(p.name)}</span>
                            ${formatRmActivityBadge(p)}
                        </div>
                    </div>
                </div>
            </td>
            <td class="rm-proj-muted${p.client ? '' : ' rm-proj-muted--empty'}">${escapeHtml(p.client || (isOps ? 'Internal' : 'No client'))}</td>
            <td class="rm-proj-muted">${escapeHtml(p.release_date || '—')}</td>
            <td>${renderRmAvatarStack(peopleIds, empMap)}</td>
            <td>${renderRmFteCell(fte, peopleIds.length)}</td>
            <td>${formatRmProjectStageBadge(p)}</td>
            <td class="rm-proj-action-col" onclick="event.stopPropagation()">
                <details class="rm-proj-row-menu">
                    <summary class="rm-proj-menu-btn" title="Actions" aria-label="Project actions">⋯</summary>
                    <div class="rm-proj-row-menu-panel">
                        <button type="button" class="rm-proj-row-menu-item" onclick='App.openAllocModal("", ${JSON.stringify(extId)})'>Allocate</button>
                        ${catId ? `<button type="button" class="rm-proj-row-menu-item" onclick='App.setProjectActivityType(${JSON.stringify(catId)}, ${JSON.stringify(isOps ? 'project' : 'operational')})'>Mark as ${isOps ? 'Active project' : 'Operational'}</button>` : ''}
                        ${catId
                            ? `<button type="button" class="rm-proj-row-menu-item rm-proj-row-menu-item--danger" onclick='App.deleteResourceProject(${JSON.stringify(catId)}, ${JSON.stringify(p.name || '')})'>Delete</button>`
                            : `<button type="button" class="rm-proj-row-menu-item" disabled title="Sync API first">Delete</button>`}
                    </div>
                </details>
            </td>
        </tr>`;
    }).join('') : `<tr><td colspan="7" class="rm-empty">${q ? 'No matches.' : (listView === 'operational' ? 'No operational activities yet. Mark an item as Operational from the row menu or Edit.' : 'No active projects yet.')}</td></tr>`;

    const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1).map(n =>
        `<button type="button" class="rm-proj-page-btn ${n === safePage ? 'rm-proj-page-btn--active' : ''}"
            onclick="App.setResourceProjectPage(${n})">${n}</button>`
    ).join('');

    const from = projects.length ? (safePage - 1) * pageSize + 1 : 0;
    const to = Math.min(safePage * pageSize, projects.length);
    const noun = listView === 'operational' ? 'activities' : 'projects';

    return `
    <div class="rm-proj-page">
        ${renderRmProjectsKpiRow(kpis)}
        <div class="rm-proj-list card-light">
            <div class="rm-proj-list-head">
                <div class="rm-proj-subtabs">${subTabBar}</div>
                <div class="rm-proj-list-toolbar">
                    <div class="rm-proj-search-wrap">
                        <span class="ui-inline-icon rm-proj-search-icon">${Icons.search}</span>
                        <input class="rm-search rm-project-search rm-proj-search-input" type="search" placeholder="Search…"
                            value="${escapeHtml(AppState.resourceProjectFilter || '')}"
                            oninput="App.setResourceProjectFilter(this.value)" />
                    </div>
                    <button type="button" class="rm-proj-btn-primary" onclick="App.openProjectPaneCreate()">+ New</button>
                </div>
            </div>
            <div class="rm-proj-table-wrap">
                <table class="rm-proj-table">
                    <thead>
                        <tr>
                            <th>Name</th><th>Client</th><th>Release</th><th>People</th>
                            <th>Staffing</th><th>Status</th><th></th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <div class="rm-proj-pagination">
                <span>Showing ${from} to ${to} of ${projects.length} ${noun}</span>
                <div class="rm-proj-page-btns">${pageNums}</div>
            </div>
        </div>
    </div>`;
}

function renderRmProjectStaffPage(apiOnline) {
    const mode = AppState.resourceProjectPaneMode;
    const pageKind = AppState.resourcesManagerProjectPage;
    const isCreate = pageKind === 'create' || mode === 'create';
    const isEdit = mode === 'edit';
    const title = isCreate ? 'New project' : (isEdit ? 'Edit project' : '');
    return `
    <div class="rm-proj-page rm-proj-page--staff">
        <div class="rm-proj-page-nav">
            <button type="button" class="rm-proj-back" onclick="App.backToRmProjectsList()">← Projects</button>
            ${title ? `<h2 class="rm-proj-page-title">${escapeHtml(title)}</h2>` : ''}
        </div>
        <div class="rm-proj-page-body">${renderRmProjectPane(apiOnline)}</div>
    </div>`;
}

function renderRmEmployeeDrawer(apiEmps, apiOnline) {
    const id = AppState.resourceSelectedEmployeeId;
    if (!id || !apiOnline) return '';
    const emp = (apiEmps || []).find(e => e.id === id);
    if (!emp) return '';
    const allocs = asRmList(AppState.resourceApiAllocations).filter(a => a.employee_id === id);
    const allocRows = allocs.length ? allocs.map(a => {
        const proj = getRmAllocatableProjects().find(p => p.id === a.project_external_id)
            || asRmList(AppState.resourceApiProjects).find(p => p.external_id === a.project_external_id)
            || (AppState.allProjects || []).find(p => p.id === a.project_external_id);
        const name = proj ? (proj.name || proj.external_id) : a.project_external_id;
        return `<div class="rm-list-row">
            <div class="rm-list-main">
                <div class="rm-list-name">${escapeHtml(name)}</div>
                <div class="rm-list-meta">${a.allocation_pct}% · ${escapeHtml(a.project_role || '—')} · ${escapeHtml(a.status)}</div>
            </div>
            <button type="button" class="rm-link" onclick="App.releaseApiAllocation('${escapeHtml(a.id)}')">Release</button>
        </div>`;
    }).join('') : `<div class="rm-empty">No active FTE allocations</div>`;

    return `
    <div class="rm-drawer-backdrop" onclick="if(event.target===this)App.selectResourceEmployee(null)">
        <aside class="rm-drawer card-light">
            <div class="rm-modal-head">
                <h3>${escapeHtml(emp.full_name)}</h3>
                <button type="button" class="rm-modal-close" onclick="App.selectResourceEmployee(null)">×</button>
            </div>
            <p class="rm-list-meta">${escapeHtml(emp.department || '—')} · ${escapeHtml(emp.designation || '—')}</p>
            <p class="rm-report-body">Util ${emp.utilization_pct || 0}% · ${escapeHtml(emp.availability_status || '—')}
                ${emp.years_experience != null ? ` · ${emp.years_experience}y exp` : ''}</p>
            <div class="rm-emp-drawer-actions">
                ${isRmProjectStaffable(emp)
                    ? `<button type="button" class="streak-pd-action-btn" onclick="App.openAllocModal('${escapeHtml(emp.id)}')">Allocate to project</button>`
                    : `<span class="rm-hint">Director / leadership — not assigned to delivery projects</span>`}
                <button type="button" class="rm-proj-btn-danger" onclick='App.deleteResourceEmployee(${JSON.stringify(emp.id)}, ${JSON.stringify(emp.full_name || '')})'>Delete employee</button>
            </div>
            <h4 class="rm-card-title" style="margin-top:16px;">Active FTE</h4>
            <div class="rm-list">${allocRows}</div>
        </aside>
    </div>`;
}

function renderRmDashboardTab(roster, summary, apiOnline) {
    const brief = getRmCapacityBrief(summary);
    const over = summary.overAllocated != null ? summary.overAllocated : summary.conflicts;
    const full = Math.max(0, (summary.allocated || 0) - (summary.partial || 0));
    const partial = summary.partial || 0;
    const bench = summary.bench || 0;
    const staffable = Math.max(1, full + partial + bench);
    const fullPct = Math.round((full / staffable) * 100);
    const partialPct = Math.round((partial / staffable) * 100);
    const benchPct = Math.max(0, 100 - fullPct - partialPct);

    const kpis = [
        {
            val: `${summary.avgUtil || 0}%`,
            label: 'Avg utilization',
            sub: summary.fromApi ? 'Delivery capacity' : 'From delivery load',
            tone: (summary.avgUtil || 0) >= 95 ? 'tight' : 'neutral',
            action: null,
        },
        {
            val: bench,
            label: 'Available now',
            sub: 'Ready for new work',
            tone: bench === 0 ? 'tight' : 'ok',
            action: "App.setResourcesManagerTab('bench')",
        },
        {
            val: over || 0,
            label: 'Overbooked',
            sub: 'Need rebalancing',
            tone: (over || 0) > 0 ? 'risk' : 'ok',
            action: "App.setResourcesManagerTab('employees')",
        },
        {
            val: summary.freeing30 || 0,
            label: 'Freeing in 30 days',
            sub: 'Upcoming capacity',
            tone: 'neutral',
            action: null,
        },
    ];

    const kpiHtml = kpis.map(k => {
        const cls = `rm-lead-kpi rm-lead-kpi--${k.tone}${k.action ? ' rm-lead-kpi--click' : ''}`;
        const inner = `
            <div class="rm-lead-kpi-val">${k.val}</div>
            <div class="rm-lead-kpi-lbl">${k.label}</div>
            <div class="rm-lead-kpi-sub">${k.sub}</div>`;
        if (k.action) {
            return `<button type="button" class="${cls}" onclick="${k.action}">${inner}</button>`;
        }
        return `<div class="${cls}">${inner}</div>`;
    }).join('');

    const mixHtml = `
        <div class="rm-cap-mix">
            <div class="rm-cap-donut" style="background:conic-gradient(
                #137333 0 ${fullPct}%,
                #1a73e8 ${fullPct}% ${fullPct + partialPct}%,
                #94a3b8 ${fullPct + partialPct}% 100%)">
                <div class="rm-cap-donut-inner">
                    <strong>${summary.allocated || 0}</strong>
                    <span>on work</span>
                </div>
            </div>
            <ul class="rm-cap-legend">
                <li><span class="rm-cap-swatch" style="background:#137333"></span> Fully allocated · ${full}</li>
                <li><span class="rm-cap-swatch" style="background:#1a73e8"></span> Split across projects · ${partial}</li>
                <li><span class="rm-cap-swatch" style="background:#94a3b8"></span> Available · ${bench}</li>
            </ul>
        </div>`;

    const attention = (AppState.attentionRanked || [])
        .filter(p => p.attentionTier === 'critical' || p.attentionTier === 'high' || p.attentionTier === 'medium')
        .slice(0, 6);
    const attentionHtml = attention.length ? attention.map(p => {
        const m = typeof attentionTierMeta === 'function'
            ? attentionTierMeta(p.attentionTier)
            : { color: '#b45309', bg: 'rgba(249,171,0,0.1)', label: p.attentionTier };
        const reason = (p.attentionReasons || [])[0] || 'Needs staffing attention';
        return `
        <button type="button" class="rm-lead-row" onclick="App.handleCardClick('${escapeHtml(p.id)}')">
            <div class="rm-lead-row-main">
                <div class="rm-lead-row-title">${escapeHtml(p.name)}</div>
                <div class="rm-lead-row-meta">${escapeHtml(p.stage || '')} · ${escapeHtml(reason)}</div>
            </div>
            <span class="rm-pill" style="background:${m.bg};color:${m.color}">${escapeHtml(m.label || p.attentionTier)}</span>
        </button>`;
    }).join('') : `<div class="rm-empty">No high-attention projects right now.</div>`;

    const availablePeople = apiOnline
        ? listRmAvailablePeople(roster, asRmList(AppState.resourceApiEmployees), true).slice(0, 8)
        : roster.filter(e => e.availability === 'Bench' && isRmProjectStaffable(e) && !isRmLeadershipRole(e)).slice(0, 8);

    const availableHtml = availablePeople.length ? availablePeople.map(e => {
        const name = e.full_name || e.name;
        const id = e.id;
        const dept = e.department || '—';
        const desig = e.designation || e.role || '—';
        return `
        <div class="rm-lead-row rm-lead-row--static">
            <div class="rm-avatar" style="background:${stringToColor(name)}">${getInitials(name)}</div>
            <div class="rm-lead-row-main">
                <div class="rm-lead-row-title">${escapeHtml(name)}</div>
                <div class="rm-lead-row-meta">${escapeHtml(dept)} · ${escapeHtml(desig)}</div>
            </div>
            ${apiOnline && typeof App !== 'undefined' && App.canManageResources && App.canManageResources()
                ? `<button type="button" class="rm-link" onclick="App.openAllocModal('${escapeHtml(id)}')">Assign</button>`
                : `<span class="rm-pill rm-pill--bench">Available</span>`}
        </div>`;
    }).join('') : `<div class="rm-empty">Nobody available right now.</div>`;

    const upcoming = roster
        .filter(e => e.freeFrom && e.activeCount > 0)
        .sort((a, b) => a.freeFrom - b.freeFrom)
        .slice(0, 6);
    const upcomingHtml = upcoming.length ? upcoming.map(e => `
        <div class="rm-lead-row rm-lead-row--static">
            <div class="rm-avatar" style="background:${stringToColor(e.name)}">${getInitials(e.name)}</div>
            <div class="rm-lead-row-main">
                <div class="rm-lead-row-title">${escapeHtml(e.name)}</div>
                <div class="rm-lead-row-meta">${escapeHtml(e.designation || '')} · ${e.activeCount} active</div>
            </div>
            <div class="rm-lead-row-right">Free ${e.freeFrom.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        </div>`).join('') : `<div class="rm-empty">No dated roll-offs yet.</div>`;

    const depts = Object.entries(summary.byDepartment || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, n]) => `
            <div class="rm-dept-row">
                <span class="rm-dept-name">${escapeHtml(name)}</span>
                <div class="rm-dept-track"><div class="rm-dept-fill" style="width:${Math.round((n / Math.max(summary.total, 1)) * 100)}%"></div></div>
                <span class="rm-dept-n">${n}</span>
            </div>`).join('');

    const trend = AppState.resourceUtilTrend || [];
    const demand = AppState.resourceDemandForecast || [];
    const insightExtras = [];
    if (trend.length) {
        insightExtras.push(`
        <div class="card-light rm-card">
            <h3 class="rm-card-title">Utilization trend</h3>
            <div class="rm-trend">
                ${trend.slice(-12).map(t => {
                    const h = Math.max(4, Math.round((t.avg_utilization_pct || 0) / 100 * 48));
                    return `<div class="rm-trend-bar" title="${escapeHtml(t.date)}: ${t.avg_utilization_pct}%" style="height:${h}px"></div>`;
                }).join('')}
            </div>
            <div class="rm-list-meta">Last ${Math.min(12, trend.length)} snapshots</div>
        </div>`);
    }
    if (demand.length) {
        insightExtras.push(`
        <div class="card-light rm-card">
            <h3 class="rm-card-title">Demand by release month</h3>
            <div class="rm-list">${demand.slice(0, 6).map(d => `
                <div class="rm-list-row">
                    <div class="rm-list-main">
                        <div class="rm-list-name">${escapeHtml(d.month)}</div>
                        <div class="rm-list-meta">${(d.names || []).slice(0, 2).map(escapeHtml).join(', ') || '—'}</div>
                    </div>
                    <div class="rm-list-right">${d.projects} proj · ~${d.heads_needed_est} heads</div>
                </div>`).join('')}</div>
        </div>`);
    }

    return `
    <section class="rm-lead-hero card-light">
        <div class="rm-lead-hero-copy">
            <p class="rm-lead-eyebrow">Workforce capacity</p>
            <h3 class="rm-lead-headline">${escapeHtml(brief.text)}</h3>
        </div>
        <div class="rm-lead-kpi-grid">${kpiHtml}</div>
    </section>

    <div class="rm-lead-grid">
        <div class="card-light rm-card">
            <div class="rm-card-head">
                <h3 class="rm-card-title">Capacity mix</h3>
                <button type="button" class="rm-link" onclick="App.setResourcesManagerTab('employees')">View people</button>
            </div>
            ${mixHtml}
        </div>
        <div class="card-light rm-card">
            <div class="rm-card-head">
                <h3 class="rm-card-title">Needs attention</h3>
                <button type="button" class="rm-link" onclick="App.setResourcesManagerTab('projects')">Projects</button>
            </div>
            <div class="rm-lead-list">${attentionHtml}</div>
        </div>
    </div>

    <div class="rm-lead-grid">
        <div class="card-light rm-card">
            <div class="rm-card-head">
                <h3 class="rm-card-title">Available for new work (${availablePeople.length}${bench > availablePeople.length ? ` of ${bench}` : ''})</h3>
                <button type="button" class="rm-link" onclick="App.setResourcesManagerTab('bench')">See all</button>
            </div>
            <div class="rm-lead-list">${availableHtml}</div>
        </div>
        <div class="card-light rm-card">
            <div class="rm-card-head">
                <h3 class="rm-card-title">Freeing soon</h3>
            </div>
            <div class="rm-lead-list">${upcomingHtml}</div>
        </div>
    </div>

    <div class="rm-lead-grid">
        <div class="card-light rm-card">
            <h3 class="rm-card-title">Team size by department</h3>
            <div class="rm-dept-list">${depts || '<div class="rm-empty">No departments</div>'}</div>
        </div>
        ${insightExtras[0] || `
        <div class="card-light rm-card rm-card--hint">
            <h3 class="rm-card-title">Insights</h3>
            <p class="rm-hint" style="margin:0;">Utilization trend and demand forecast appear here after Sync and daily jobs have run.</p>
        </div>`}
    </div>
    ${insightExtras.length > 1 ? `<div class="rm-lead-grid">${insightExtras.slice(1).join('')}</div>` : ''}`;
}

function renderRmEmployeesTab(roster, apiEmps, apiOnline) {
    const q = String(AppState.resourceRosterFilter || '').trim().toLowerCase();
    const deptF = String(AppState.resourceEmpDeptFilter || '').trim().toLowerCase();
    const roleF = String(AppState.resourceEmpRoleFilter || '').trim().toLowerCase();
    const availF = String(AppState.resourceEmpAvailFilter || '').trim().toLowerCase();
    const useApi = apiOnline && (apiEmps || []).length;
    const list = useApi
        ? (apiEmps || []).map(e => ({
            id: e.id,
            name: e.full_name,
            employeeCode: e.employee_code || '—',
            department: e.department || '—',
            designation: e.designation || '—',
            yearsAtCompany: e.years_at_company,
            totalExperience: e.years_experience,
            availability: e.availability_status || 'Bench',
            utilPct: e.utilization_pct || 0,
            activeCount: 0,
            assignments: [],
            api: true,
        }))
        : roster;

    let filtered = list;
    if (q) {
        filtered = filtered.filter(e =>
            String(e.name || '').toLowerCase().includes(q)
            || String(e.department || '').toLowerCase().includes(q)
            || String(e.designation || '').toLowerCase().includes(q)
            || String(e.employeeCode || '').toLowerCase().includes(q));
    }
    if (deptF) {
        filtered = filtered.filter(e => String(e.department || '').toLowerCase() === deptF);
    }
    if (roleF) {
        filtered = filtered.filter(e => String(e.designation || '').toLowerCase() === roleF);
    }
    if (availF === 'bench') {
        filtered = filtered.filter(e => (e.utilPct || 0) <= 0 || /bench|available/i.test(e.availability || ''));
    } else if (availF === 'partial') {
        filtered = filtered.filter(e => (e.utilPct || 0) > 0 && (e.utilPct || 0) < 100);
    } else if (availF === 'full') {
        filtered = filtered.filter(e => (e.utilPct || 0) >= 100 || /full/i.test(e.availability || ''));
    }

    const depts = [...new Set(list.map(e => e.department).filter(d => d && d !== '—'))].sort((a, b) => a.localeCompare(b));
    const roles = [...new Set(list.map(e => e.designation).filter(d => d && d !== '—'))].sort((a, b) => a.localeCompare(b));
    const filtersOn = !!(q || deptF || roleF || availF);

    const rows = filtered.map(e => {
        const apiEmp = useApi ? (apiEmps.find(x => x.id === e.id) || null) : null;
        const staffable = useApi ? isRmProjectStaffable(apiEmp || e) : true;
        const availCls = /leadership/i.test(e.availability) || !staffable ? 'full'
            : /bench|available/i.test(e.availability) ? 'bench'
            : /full/i.test(e.availability) || (e.utilPct || 0) >= 100 ? 'full' : 'partial';
        const exp = e.totalExperience != null ? `${e.totalExperience}y total` : '—';
        const tenure = e.yearsAtCompany != null ? `${e.yearsAtCompany}y here` : '—';
        const click = useApi ? `onclick="App.selectResourceEmployee('${escapeHtml(e.id)}')"` : '';
        return `
        <tr class="rm-emp-row ${useApi ? 'rm-emp-row--click' : ''}" ${click}>
            <td>${useApi ? renderRmUserCell(apiEmp || { full_name: e.name, employee_code: e.employeeCode, department: e.department }) : `
                <div class="rm-emp-cell">
                    <div class="rm-avatar rm-avatar--user" style="background:${stringToColor(e.name)}">${getInitials(e.name)}</div>
                    <div>
                        <div class="rm-list-name">${escapeHtml(e.name)}</div>
                        <div class="rm-list-meta">#${escapeHtml(String(e.employeeCode))}</div>
                    </div>
                </div>`}
            </td>
            <td>${escapeHtml(e.department)}</td>
            <td>${escapeHtml(e.designation)}</td>
            <td>${tenure}<div class="rm-list-meta">${exp}</div></td>
            <td><span class="rm-pill rm-pill--${availCls}">${escapeHtml(!staffable && !/leadership/i.test(e.availability) ? 'Leadership' : e.availability)}</span></td>
            <td>
                <div class="rm-util-wrap">
                    <div class="rm-util-track"><div class="rm-util-fill" style="width:${Math.min(100, e.utilPct)}%"></div></div>
                    <span>${e.utilPct}%</span>
                </div>
            </td>
            <td>${useApi
                ? `<span class="rm-emp-actions" onclick="event.stopPropagation()">
                    ${staffable ? `<button type="button" class="rm-link" onclick="App.openAllocModal('${escapeHtml(e.id)}')">Allocate</button>` : `<span class="rm-list-meta">Leadership</span>`}
                    <button type="button" class="rm-link rm-link--danger" onclick='App.deleteResourceEmployee(${JSON.stringify(e.id)}, ${JSON.stringify(e.name || '')})'>Delete</button>
                   </span>`
                : (e.assignments || []).slice(0, 2).map(a => escapeHtml(a.projectName)).join(', ') || '—'}</td>
        </tr>`;
    }).join('');

    return `
    <div class="rm-toolbar rm-emp-filters">
        <input class="rm-search" type="search" placeholder="Search name, department, designation…"
            value="${escapeHtml(AppState.resourceRosterFilter || '')}"
            oninput="App.setResourceRosterFilter(this.value)" />
        <select class="rm-select" aria-label="Filter by department" onchange="App.setResourceEmpDeptFilter(this.value)">
            <option value="">All departments</option>
            ${depts.map(d => `<option value="${escapeHtml(d)}" ${deptF === d.toLowerCase() ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('')}
        </select>
        <select class="rm-select" aria-label="Filter by designation" onchange="App.setResourceEmpRoleFilter(this.value)">
            <option value="">All designations</option>
            ${roles.map(r => `<option value="${escapeHtml(r)}" ${roleF === r.toLowerCase() ? 'selected' : ''}>${escapeHtml(r)}</option>`).join('')}
        </select>
        <select class="rm-select" aria-label="Filter by availability" onchange="App.setResourceEmpAvailFilter(this.value)">
            <option value="">All availability</option>
            <option value="bench" ${availF === 'bench' ? 'selected' : ''}>Bench / available</option>
            <option value="partial" ${availF === 'partial' ? 'selected' : ''}>Partial</option>
            <option value="full" ${availF === 'full' ? 'selected' : ''}>Fully allocated</option>
        </select>
        <button type="button" class="rm-proj-btn-ghost" ${filtersOn ? '' : 'disabled'} onclick="App.clearResourceEmpFilters()">Reset</button>
        <span class="rm-toolbar-meta">${filtered.length} of ${list.length}${useApi ? ' · FTE DB' : ' · sheet'}</span>
    </div>
    <div class="rm-table-wrap card-light">
        <table class="rm-table">
            <thead>
                <tr>
                    <th>Employee</th><th>Department</th><th>Designation</th>
                    <th>Experience</th><th>Status</th><th>Utilization</th><th>${useApi ? 'Actions' : 'Projects'}</th>
                </tr>
            </thead>
            <tbody>${rows || `<tr><td colspan="7" class="rm-empty">No employees match filters.</td></tr>`}</tbody>
        </table>
    </div>`;
}

function renderRmAllocationsTab(roster, apiOnline) {
    const q = String(AppState.resourceAllocListFilter || '').trim().toLowerCase();
    const projectF = String(AppState.resourceAllocListProjectFilter || '').trim();
    const deptF = String(AppState.resourceAllocListDeptFilter || '').trim().toLowerCase();
    const roleF = String(AppState.resourceAllocListRoleFilter || '').trim().toLowerCase();
    const statusF = String(AppState.resourceAllocListStatusFilter || '').trim().toLowerCase();
    const filtersOn = !!(q || projectF || deptF || roleF || statusF);

    if (apiOnline && asRmList(AppState.resourceApiAllocations).length >= 0) {
        const allocs = AppState.resourceApiAllocations || [];
        const empMap = Object.fromEntries(asRmList(AppState.resourceApiEmployees).map(e => [e.id, e]));
        const catalog = Object.fromEntries(asRmList(AppState.resourceApiProjects).map(p => [p.external_id, p]));
        const projMap = Object.fromEntries((AppState.allProjects || []).map(p => [p.id, p]));

        const enriched = allocs.map(a => {
            const emp = empMap[a.employee_id];
            const proj = catalog[a.project_external_id] || projMap[a.project_external_id];
            return {
                a,
                empName: emp ? emp.full_name : a.employee_id,
                dept: emp?.department || '',
                projName: proj ? (proj.name || a.project_external_id) : a.project_external_id,
                projExt: a.project_external_id,
                role: (a.project_role && a.project_role !== 'Developer')
                    ? a.project_role
                    : (emp?.designation || a.project_role || ''),
                status: a.status || '',
            };
        });

        const projects = [...new Map(enriched.map(r => [r.projExt, r.projName])).entries()]
            .sort((a, b) => String(a[1]).localeCompare(String(b[1])));
        const depts = [...new Set(enriched.map(r => r.dept).filter(Boolean))].sort((a, b) => a.localeCompare(b));
        const roles = [...new Set(enriched.map(r => r.role).filter(Boolean))].sort((a, b) => a.localeCompare(b));
        const statuses = [...new Set(enriched.map(r => r.status).filter(Boolean))].sort((a, b) => a.localeCompare(b));

        let filtered = enriched;
        if (q) {
            filtered = filtered.filter(r =>
                String(r.empName || '').toLowerCase().includes(q)
                || String(r.projName || '').toLowerCase().includes(q)
                || String(r.role || '').toLowerCase().includes(q)
                || String(r.dept || '').toLowerCase().includes(q)
                || String(r.projExt || '').toLowerCase().includes(q));
        }
        if (projectF) filtered = filtered.filter(r => String(r.projExt) === projectF);
        if (deptF) filtered = filtered.filter(r => String(r.dept || '').toLowerCase() === deptF);
        if (roleF) filtered = filtered.filter(r => String(r.role || '').toLowerCase() === roleF);
        if (statusF) filtered = filtered.filter(r => String(r.status || '').toLowerCase() === statusF);

        filtered.sort((x, y) => String(x.empName).localeCompare(String(y.empName))
            || String(x.projName).localeCompare(String(y.projName)));

        const body = filtered.length ? filtered.map(r => {
            const a = r.a;
            return `<tr>
                <td>
                    <div class="rm-list-name">${escapeHtml(r.empName)}</div>
                    ${r.dept ? `<div class="rm-list-meta">${escapeHtml(r.dept)}</div>` : ''}
                </td>
                <td>${escapeHtml(r.projName)}</td>
                <td>${escapeHtml(r.role || '—')}</td>
                <td><strong>${a.allocation_pct}%</strong></td>
                <td>${a.start_date || '—'}</td>
                <td>${a.end_date || '—'}</td>
                <td><span class="rm-pill">${escapeHtml(a.status || '—')}</span></td>
                <td><button type="button" class="rm-link" onclick="App.releaseApiAllocation('${escapeHtml(a.id)}')">Release</button></td>
            </tr>`;
        }).join('') : `<tr><td colspan="8" class="rm-empty">${filtersOn ? 'No allocations match filters.' : 'No FTE allocations yet. Add a project, then Allocate.'}</td></tr>`;

        return `
        <div class="rm-toolbar rm-emp-filters rm-alloc-list-filters">
            <input class="rm-search rm-alloc-list-search" type="search" placeholder="Search employee, project, role…"
                value="${escapeHtml(AppState.resourceAllocListFilter || '')}"
                oninput="App.setResourceAllocListFilter(this.value)" />
            <select class="rm-select" aria-label="Filter by project" onchange="App.setResourceAllocListProjectFilter(this.value)">
                <option value="">All projects</option>
                ${projects.map(([id, name]) => `<option value="${escapeHtml(id)}" ${projectF === id ? 'selected' : ''}>${escapeHtml(name)}</option>`).join('')}
            </select>
            <select class="rm-select" aria-label="Filter by department" onchange="App.setResourceAllocListDeptFilter(this.value)">
                <option value="">All departments</option>
                ${depts.map(d => `<option value="${escapeHtml(d)}" ${deptF === d.toLowerCase() ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('')}
            </select>
            <select class="rm-select" aria-label="Filter by role" onchange="App.setResourceAllocListRoleFilter(this.value)">
                <option value="">All roles</option>
                ${roles.map(r => `<option value="${escapeHtml(r)}" ${roleF === r.toLowerCase() ? 'selected' : ''}>${escapeHtml(r)}</option>`).join('')}
            </select>
            <select class="rm-select" aria-label="Filter by status" onchange="App.setResourceAllocListStatusFilter(this.value)">
                <option value="">All statuses</option>
                ${statuses.map(s => `<option value="${escapeHtml(s)}" ${statusF === s.toLowerCase() ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
            </select>
            <button type="button" class="rm-proj-btn-ghost" ${filtersOn ? '' : 'disabled'} onclick="App.clearResourceAllocListFilters()">Reset</button>
            <span class="rm-toolbar-meta">${filtered.length} of ${enriched.length}</span>
            <button type="button" class="rm-proj-btn-primary" onclick="App.openAllocModal()">+ New allocation</button>
        </div>
        <div class="rm-table-wrap card-light">
            <table class="rm-table">
                <thead>
                    <tr><th>Employee</th><th>Project</th><th>Role</th><th>FTE</th><th>Start</th><th>End</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>${body}</tbody>
            </table>
        </div>`;
    }

    const rows = [];
    roster.forEach(e => {
        (e.assignments || []).forEach(a => {
            rows.push({ emp: e, a });
        });
    });

    let filteredSheet = rows;
    if (q) {
        filteredSheet = filteredSheet.filter(({ emp, a }) =>
            String(emp.name || '').toLowerCase().includes(q)
            || String(a.projectName || '').toLowerCase().includes(q)
            || String(a.role || emp.roleFamily || '').toLowerCase().includes(q)
            || String(emp.department || '').toLowerCase().includes(q));
    }
    if (deptF) {
        filteredSheet = filteredSheet.filter(({ emp }) => String(emp.department || '').toLowerCase() === deptF);
    }
    if (roleF) {
        filteredSheet = filteredSheet.filter(({ emp, a }) =>
            String(a.role || emp.roleFamily || '').toLowerCase() === roleF);
    }
    if (statusF) {
        filteredSheet = filteredSheet.filter(({ a }) => String(a.status || '').toLowerCase() === statusF);
    }
    filteredSheet.sort((x, y) => (x.emp.name || '').localeCompare(y.emp.name || ''));

    const sheetDepts = [...new Set(rows.map(({ emp }) => emp.department).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const sheetRoles = [...new Set(rows.map(({ emp, a }) => a.role || emp.roleFamily).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const sheetStatuses = [...new Set(rows.map(({ a }) => a.status).filter(Boolean))].sort((a, b) => a.localeCompare(b));

    const body = filteredSheet.length ? filteredSheet.map(({ emp, a }) => {
        const start = a.start && !isNaN(a.start.getTime())
            ? a.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
        const end = a.end && !isNaN(a.end.getTime())
            ? a.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
        return `
        <tr>
            <td>${escapeHtml(emp.name)}</td>
            <td><button type="button" class="rm-link" onclick="App.handleCardClick('${escapeHtml(a.projectId)}')">${escapeHtml(a.projectName)}</button></td>
            <td>${escapeHtml(a.role || emp.roleFamily)}</td>
            <td>${start}</td>
            <td>${end}</td>
            <td>${escapeHtml(statusLabel(a.status) || a.status || '—')}</td>
        </tr>`;
    }).join('') : `<tr><td colspan="6" class="rm-empty">${filtersOn ? 'No allocations match filters.' : 'No active allocations matched from delivery data. Start the Resource API for FTE allocate/release.'}</td></tr>`;

    return `
    <p class="rm-hint">Sheet mode — derived from delivery assignees. Start Resource API (:8090) for formal FTE %.</p>
    <div class="rm-toolbar rm-emp-filters rm-alloc-list-filters">
        <input class="rm-search rm-alloc-list-search" type="search" placeholder="Search employee, project, role…"
            value="${escapeHtml(AppState.resourceAllocListFilter || '')}"
            oninput="App.setResourceAllocListFilter(this.value)" />
        <select class="rm-select" aria-label="Filter by department" onchange="App.setResourceAllocListDeptFilter(this.value)">
            <option value="">All departments</option>
            ${sheetDepts.map(d => `<option value="${escapeHtml(d)}" ${deptF === String(d).toLowerCase() ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('')}
        </select>
        <select class="rm-select" aria-label="Filter by role" onchange="App.setResourceAllocListRoleFilter(this.value)">
            <option value="">All roles</option>
            ${sheetRoles.map(r => `<option value="${escapeHtml(r)}" ${roleF === String(r).toLowerCase() ? 'selected' : ''}>${escapeHtml(r)}</option>`).join('')}
        </select>
        <select class="rm-select" aria-label="Filter by status" onchange="App.setResourceAllocListStatusFilter(this.value)">
            <option value="">All statuses</option>
            ${sheetStatuses.map(s => `<option value="${escapeHtml(s)}" ${statusF === String(s).toLowerCase() ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
        </select>
        <button type="button" class="rm-proj-btn-ghost" ${filtersOn ? '' : 'disabled'} onclick="App.clearResourceAllocListFilters()">Reset</button>
        <span class="rm-toolbar-meta">${filteredSheet.length} of ${rows.length}</span>
    </div>
    <div class="rm-table-wrap card-light">
        <table class="rm-table">
            <thead>
                <tr><th>Employee</th><th>Project</th><th>Role</th><th>Start</th><th>End</th><th>Status</th></tr>
            </thead>
            <tbody>${body}</tbody>
        </table>
    </div>`;
}

function isRmLeadershipRole(emp) {
    const avail = String(emp?.availability_status || emp?.availability || '').toLowerCase();
    if (/leadership|non.?project|excluded/.test(avail)) return true;
    const desig = String(emp?.designation || emp?.role || '').toLowerCase();
    if (/\b(director|head|manager|lead|vp|chief|principal|admin)\b/.test(desig)) return true;
    return false;
}

function renderRmBenchTab(roster, apiOnline) {
    const bench = listRmAvailablePeople(roster, asRmList(AppState.resourceApiEmployees), apiOnline);

    const recoPack = AppState.resourceBenchRecos;
    const recoByEmp = {};
    ((recoPack && recoPack.employees) || []).forEach(r => {
        recoByEmp[r.employee_id] = r.suggestions || [];
    });

    const benchRows = bench.length ? bench.map(e => {
        const name = e.full_name || e.name;
        const id = e.id;
        const dept = e.department || '—';
        const desig = e.designation || '—';
        const suggestions = recoByEmp[id] || [];
        const sugHtml = suggestions.slice(0, 3).map(s => `
            <div class="rm-reco">
                <button type="button" class="rm-link" onclick="App.handleCardClick('${escapeHtml(s.project_external_id)}')">${escapeHtml(s.name)}</button>
                <span class="rm-list-meta">score ${s.score} · ${(s.reasons || []).slice(0, 2).map(escapeHtml).join(', ')}</span>
                ${apiOnline ? `<button type="button" class="rm-link" onclick="App.allocateFromRecommendation('${escapeHtml(id)}','${escapeHtml(s.project_external_id)}')">Allocate</button>` : ''}
            </div>`).join('');
        return `
        <div class="rm-bench-card card-light">
            <div class="rm-list-row">
                <div class="rm-avatar" style="background:${stringToColor(name)}">${getInitials(name)}</div>
                <div class="rm-list-main">
                    <div class="rm-list-name">${escapeHtml(name)}</div>
                    <div class="rm-list-meta">${escapeHtml(dept)} · ${escapeHtml(desig)}</div>
                </div>
                ${apiOnline ? `<button type="button" class="rm-link" onclick="App.openAllocModal('${escapeHtml(id)}')">Allocate</button>` : ''}
            </div>
            ${sugHtml ? `<div class="rm-reco-list"><div class="rm-list-meta" style="margin-bottom:6px;">Recommended next projects</div>${sugHtml}</div>` : ''}
        </div>`;
    }).join('') : `<div class="rm-empty">Nobody on bench.</div>`;

    const attention = (AppState.attentionRanked || []).slice(0, 8);
    const recRows = attention.length ? attention.map(p => {
        const m = typeof attentionTierMeta === 'function' ? attentionTierMeta(p.attentionTier) : { color: '#b45309', bg: 'rgba(249,171,0,0.1)' };
        return `
        <div class="rm-list-row rm-list-row--click" onclick="App.handleCardClick('${p.id}')">
            <div class="rm-list-main">
                <div class="rm-list-name">${escapeHtml(p.name)}</div>
                <div class="rm-list-meta">${escapeHtml(p.stage)} · ${escapeHtml((p.attentionReasons || [])[0] || 'Needs staffing attention')}</div>
            </div>
            <span class="rm-pill" style="background:${m.bg};color:${m.color}">${escapeHtml(p.attentionTier || 'risk')}</span>
        </div>`;
    }).join('') : `<div class="rm-empty">No high-attention projects right now.</div>`;

    return `
    <div class="rm-two-col">
        <div>
            <h3 class="rm-card-title">Available for new work (${bench.length})</h3>
            <div class="rm-bench-grid">${benchRows}</div>
        </div>
        <div class="card-light rm-card">
            <h3 class="rm-card-title">Projects needing support</h3>
            <p class="rm-hint" style="margin-top:0;">From Attention scores (delivery).</p>
            <div class="rm-list">${recRows}</div>
        </div>
    </div>`;
}

function renderRmReportsTab(roster, summary, apiOnline) {
    const deptLines = Object.entries(summary.byDepartment || {})
        .sort((a, b) => b[1] - a[1])
        .map(([d, n]) => `${d}: ${n}`).join('\n');

    const apiBtns = apiOnline ? `
        <button type="button" class="streak-pd-action-btn" onclick="App.downloadResourceApiReport('utilization')">API utilization CSV</button>
        <button type="button" class="streak-pd-action-btn" onclick="App.downloadResourceApiReport('bench')">API bench CSV</button>
        <button type="button" class="streak-pd-action-btn" onclick="App.downloadResourceApiReport('allocations')">API allocations CSV</button>
        <button type="button" class="streak-pd-action-btn" onclick="App.downloadResourceApiReport('allocation-history')">API history CSV</button>
        <button type="button" class="streak-pd-action-btn" onclick="App.downloadResourceApiReport('skill-matrix')">Skill / designation CSV</button>
        <button type="button" class="streak-pd-action-btn" onclick="App.downloadResourceApiReport('department')">Department CSV</button>
        <button type="button" class="streak-pd-action-btn" onclick="App.downloadResourceApiReport('project-staffing')">Project staffing CSV</button>
        <button type="button" class="streak-pd-action-btn" onclick="App.downloadResourceApiReport('demand-forecast')">Demand forecast CSV</button>
    ` : `<p class="rm-hint">Start Resource API for full report suite.</p>`;

    const demand = AppState.resourceDemandForecast || [];
    const demandPre = demand.map(d => `${d.month}: ${d.projects} projects, ~${d.heads_needed_est} heads`).join('\n');

    return `
    <div class="rm-report-grid">
        <div class="card-light rm-card">
            <h3 class="rm-card-title">Utilization snapshot</h3>
            <p class="rm-report-body">${summary.allocated} on projects · ${summary.bench} bench · avg util ${summary.avgUtil}%</p>
            <button type="button" class="streak-pd-action-btn" onclick="App.exportResourceRosterCsv('all')">Export sheet roster CSV</button>
        </div>
        <div class="card-light rm-card">
            <h3 class="rm-card-title">Bench report</h3>
            <p class="rm-report-body">${summary.bench} people available / bench.</p>
            <button type="button" class="streak-pd-action-btn" onclick="App.exportResourceRosterCsv('bench')">Export sheet bench CSV</button>
        </div>
        <div class="card-light rm-card">
            <h3 class="rm-card-title">Department allocation</h3>
            <pre class="rm-report-pre">${escapeHtml(deptLines || '—')}</pre>
        </div>
        <div class="card-light rm-card">
            <h3 class="rm-card-title">API reports</h3>
            <div class="rm-report-actions">${apiBtns}</div>
        </div>
        <div class="card-light rm-card">
            <h3 class="rm-card-title">Demand forecast</h3>
            <pre class="rm-report-pre">${escapeHtml(demandPre || 'Sync API to compute release-month demand.')}</pre>
        </div>
        <div class="card-light rm-card">
            <h3 class="rm-card-title">Skill / designation</h3>
            <p class="rm-report-body">Designation counts from sheet; skills via API when added on employee profiles.</p>
            <button type="button" class="streak-pd-action-btn" onclick="App.exportResourceRosterCsv('designation')">Export by designation CSV</button>
        </div>
    </div>`;
}

function renderResourcesDelivery() {
    const resMap    = AppState.resourceDeliveryMap || {};
    const people    = Object.values(resMap).sort((a, b) => b.activeCount - a.activeCount);
    const today     = new Date(); today.setHours(0,0,0,0);
    const WINDOW    = 120; // days to display
    const horizon   = new Date(today); horizon.setDate(today.getDate() + WINDOW);
    const horizonMs = horizon - today;

    if (!people.length) {
        const rosterLoading = AppState.databaseRosterStatus === 'loading';
        const msg = rosterLoading
            ? 'Loading people from Database sheet…'
            : 'No people on the Database sheet yet. Publish the Database tab and refresh.';
        return `<div style="padding:40px;text-align:center;color:var(--text-muted);">${escapeHtml(msg)}</div>`;
    }

    /* ─ helpers ─ */
    function pct(date) {
        if (!date) return null;
        const ms = date - today;
        if (ms < 0)          return 0;
        if (ms > horizonMs)  return 100;
        return +(ms / horizonMs * 100).toFixed(2);
    }
    function fmtDate(d) {
        if (!d || isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    function daysLeft(d) {
        if (!d) return null;
        return Math.ceil((d - today) / 86400000);
    }
    const statusLabel = { on_track: 'On Track', at_risk: 'At Risk', delayed: 'Delayed' };
    const statusColor = { on_track: '#1E8E3E', at_risk: '#F9AB00', delayed: '#D93025' };
    const statusBg    = { on_track: 'rgba(30,142,62,0.12)', at_risk: 'rgba(249,171,0,0.13)', delayed: 'rgba(217,48,37,0.1)' };

    /* ─ Axis header ─ */
    const axisHTML = [0, 30, 60, 90, 120].map(d => {
        const dt  = new Date(today); dt.setDate(today.getDate() + d);
        const lbl = d === 0 ? 'Today' : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `<div class="res-axis-tick" style="left:${Math.round(d / WINDOW * 100)}%">${lbl}</div>`;
    }).join('');

    /* ── A. Conflict Alerts ── */
    const CONFLICT_PREVIEW = 2; // show first N pairs; rest behind Shrink / Show more
        const conflicted = people.filter(p => (p.conflicts || []).length > 0);
    let conflictHTML = '';
    if (conflicted.length) {
        conflictHTML = `<div class="res-conflict-grid">` + conflicted.map((p, pi) => {
            const init = getInitials(p.name);
            const avc  = stringToColor(p.name);
            const cardId = `res-cfl-${pi}`;
            const renderPair = (c) => {
                const oStart = c.overlapStart ? fmtDate(c.overlapStart) : '—';
                const oEnd   = c.overlapEnd   ? fmtDate(c.overlapEnd)   : '—';
                return `
                <div class="res-cfl-pair">
                    <div class="res-cfl-badge">&#9888; ${c.overlapDays} day overlap · ${oStart} → ${oEnd}</div>
                    <div class="res-cfl-projs">
                        <div class="res-cfl-proj-row" onclick="App.handleCardClick('${c.projectIdA}')">
                            <span class="res-cfl-bullet res-cfl-bullet--A"></span>
                            <div>
                                <div class="res-cfl-proj-name">${escapeHtml(c.projectA)}</div>
                                <div class="res-cfl-proj-role">${escapeHtml(c.roleA)}</div>
                            </div>
                            <span class="res-cfl-arrow">↗</span>
                        </div>
                        <div class="res-cfl-proj-row" onclick="App.handleCardClick('${c.projectIdB}')">
                            <span class="res-cfl-bullet res-cfl-bullet--B"></span>
                            <div>
                                <div class="res-cfl-proj-name">${escapeHtml(c.projectB)}</div>
                                <div class="res-cfl-proj-role">${escapeHtml(c.roleB)}</div>
                            </div>
                            <span class="res-cfl-arrow">↗</span>
                        </div>
                    </div>
                </div>`;
            };
            const preview = p.conflicts.slice(0, CONFLICT_PREVIEW).map(renderPair).join('');
            const rest = p.conflicts.slice(CONFLICT_PREVIEW);
            const moreBlock = rest.length
                ? `<div class="res-cfl-more" id="${cardId}-more" hidden>${rest.map(renderPair).join('')}</div>
                   <button type="button" class="res-cfl-toggle" id="${cardId}-btn"
                     onclick="App.toggleConflictCard('${cardId}', ${rest.length})"
                     aria-expanded="false">
                     <span class="res-cfl-toggle__more">Show ${rest.length} more</span>
                     <span class="res-cfl-toggle__less">Shrink</span>
                   </button>`
                : '';
            return `
            <div class="res-conflict-card" id="${cardId}">
                <div class="res-conflict-header">
                    <div class="res-conflict-avatar" style="background:${avc}">${init}</div>
                    <div>
                        <div class="res-conflict-name">${escapeHtml(p.name)}</div>
                        <div class="res-conflict-sub">${p.conflicts.length} conflict${p.conflicts.length > 1 ? 's' : ''} · ${p.activeCount} active project${p.activeCount !== 1 ? 's' : ''}</div>
                    </div>
                    ${p.freeFrom
                        ? `<div class="res-cfl-free-from">free ${p.freeFrom <= today ? 'now' : fmtDate(p.freeFrom)}</div>`
                        : p.activeCount > 0 ? `<div class="res-cfl-free-from">release TBD</div>` : ''}
                </div>
                ${preview}
                ${moreBlock}
            </div>`;
        }).join('') + `</div>`;
    }

    /* ── B. Person cards with labelled timeline bars ── */
    const personCards = people.map(p => {
        const init = getInitials(p.name);
        const avc  = stringToColor(p.name);
        const hasConflict = p.conflicts.length > 0;

        // Conflict set for highlighting
        const conflictProjIds = new Set(
            p.conflicts.flatMap(c => [c.projectIdA, c.projectIdB])
        );

        // Sort active first, then completed
        const sorted = [...p.assignments].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (a.start && b.start) return a.start - b.start;
            return 0;
        });

        // Summary stats
        const activeAssignments  = sorted.filter(a => !a.completed);
        const avail = getResourceAvailability(p, today);
        const chipText = avail.status === 'now' ? 'free now' : avail.label;
        const freeChip = avail.label
            ? `<span class="res-free-chip ${avail.chipClass}">${escapeHtml(chipText)}</span>`
            : '';

        // One labelled bar per assignment
        const barRows = sorted.map(a => {
            const leftPct  = pct(a.start && a.start > today ? a.start : (a.start ? today : today));
            const rightPct = pct(a.end);
            const isInWindow = a.end && a.end >= today && rightPct !== null && rightPct > (leftPct ?? 0);
            const sColor = statusColor[a.status] || '#888';
            const sBg    = statusBg[a.status]    || 'rgba(100,100,100,0.1)';
            const isConflict = conflictProjIds.has(a.projectId);
            const dl2 = a.end ? daysLeft(a.end) : null;

            const dateRange = `${a.start ? fmtDate(a.start) : '?'} → ${a.end ? fmtDate(a.end) : 'TBD'}`;
            const daysInfo  = a.completed ? 'Completed'
                : dl2 === null ? '' : dl2 < 0 ? `${Math.abs(dl2)}d overdue` : `${dl2}d left`;

            // Bar segment for timeline (only if end is in future)
            let barHTML = '';
            if (isInWindow && leftPct !== null && rightPct !== null) {
                const width = Math.max(rightPct - leftPct, 1);
                barHTML = `<div class="res-proj-bar ${isConflict && !a.completed ? 'res-proj-bar--conflict' : ''}"
                    style="left:${leftPct}%;width:${width}%;background:${a.completed ? '#9aa0a6' : sColor};"
                    title="${escapeHtml(a.projectName)}"></div>`;
            }

            return `
            <div class="res-proj-row ${a.completed ? 'res-proj-row--done' : ''} ${isConflict && !a.completed ? 'res-proj-row--conflict' : ''}">
                <div class="res-proj-meta">
                    <div class="res-proj-top">
                        <span class="res-proj-name" onclick="App.handleCardClick('${a.projectId}')">${escapeHtml(a.projectName)}</span>
                        ${isConflict && !a.completed ? `<span class="res-proj-conflict-badge"><span class="ui-inline-icon">${Icons.alert}</span> conflict</span>` : ''}
                        ${a.completed ? `<span class="res-proj-done-badge">✓ live</span>` : ''}
                    </div>
                    <div class="res-proj-bottom">
                        <span class="res-proj-role-tag">${escapeHtml(a.role)}</span>
                        <span class="res-proj-dates">${dateRange}</span>
                        ${!a.completed ? `<span class="res-proj-status-dot" style="background:${sColor}"></span><span class="res-proj-status-lbl" style="color:${sColor}">${statusLabel[a.status] || a.status || '—'}</span>` : ''}
                        ${daysInfo ? `<span class="res-proj-days ${dl2 !== null && dl2 < 0 ? 'res-proj-days--over' : ''}">${daysInfo}</span>` : ''}
                    </div>
                </div>
                <div class="res-proj-timeline">
                    <div class="res-proj-track">
                        ${barHTML || `<span class="res-proj-no-window">${a.completed ? 'Completed' : 'Outside 120-day window'}</span>`}
                    </div>
                </div>
            </div>`;
        }).join('');

        // Give each card a stable ID based on person name
        const cardId   = 'res-card-' + p.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
        // Cards with conflicts start expanded; others start collapsed
        const expanded = hasConflict;

        return `
        <div class="res-person-card ${hasConflict ? 'res-person-card--conflict' : ''}" id="${cardId}">
            <div class="res-person-header" onclick="App.toggleResCard('${cardId}')" style="cursor:pointer;">
                <div class="res-person-avatar" style="background:${avc}">${init}</div>
                <div class="res-person-info">
                    <div class="res-person-name">${escapeHtml(p.name)}</div>
                    <div class="res-person-stats">
                        <span>${p.activeCount} active project${p.activeCount !== 1 ? 's' : ''}</span>
                        <span class="res-person-sep">·</span>
                        <span>${sorted.filter(a => a.completed).length} completed</span>
                        ${hasConflict ? `<span class="res-person-sep">·</span><span style="color:#D93025;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><span class="ui-inline-icon">${Icons.alert}</span>${p.conflicts.length} conflict${p.conflicts.length > 1 ? 's' : ''}</span>` : ''}
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                    ${freeChip}
                    <span class="res-load-pill res-load-pill--${p.activeCount >= 3 ? 'high' : p.activeCount >= 2 ? 'med' : 'low'}">${p.activeCount >= 3 ? 'High load' : p.activeCount >= 2 ? 'Busy' : 'Light'}</span>
                    <button class="res-expand-btn" onclick="event.stopPropagation();App.toggleResCard('${cardId}')" aria-label="Toggle details">
                        <svg class="res-expand-icon ${expanded ? 'res-expand-icon--open' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                </div>
            </div>

            <!-- Detail panel — hidden until chevron clicked -->
            <div class="res-detail-panel ${expanded ? 'res-detail-panel--open' : ''}">
                <div class="res-detail-inner">
                    <div class="res-timeline-header">
                        <div class="res-th-label"></div>
                        <div class="res-th-axis">${axisHTML}</div>
                    </div>
                    <div class="res-proj-list">${barRows}</div>
                </div>
            </div>
        </div>`;
    }).join('');

    /* ── C. Assignment Suggestions ── */
    const unassigned = AppState.allProjects.filter(p => {
        const ns = normalizeStage(p.stage || '');
        return ['Backlog','Planning'].includes(ns) &&
               splitAssigneeNames(p.developer).every(n => !isValidResourceName(n));
    });

    let suggestHTML = '';
    if (unassigned.length) {
        const workRole = typeof getPrimaryWorkRole === 'function' ? getPrimaryWorkRole() : 'Developer';
        const devPeople = people.filter(p =>
            p.assignments.some(a => a.role === workRole)
        ).sort((a, b) => {
            if (a.activeCount !== b.activeCount) return a.activeCount - b.activeCount;
            const aReady = a.activeCount === 0 || (a.freeFrom && a.freeFrom <= today);
            const bReady = b.activeCount === 0 || (b.freeFrom && b.freeFrom <= today);
            if (aReady !== bReady) return aReady ? -1 : 1;
            if (!a.freeFrom && a.activeCount > 0) return 1;
            if (!b.freeFrom && b.activeCount > 0) return -1;
            const af = a.freeFrom ? a.freeFrom.getTime() : 9e15;
            const bf = b.freeFrom ? b.freeFrom.getTime() : 9e15;
            return af - bf;
        });

        suggestHTML = unassigned.map(p => {
            const best = devPeople.find(d => d.activeCount === 0 || d.freeFrom) || devPeople[0];
            if (!best) return '';
            const init     = getInitials(best.name);
            const avc      = stringToColor(best.name);
            const avail    = getResourceAvailability(best, today);
            const freeStr  = avail.status === 'now' ? 'available now'
                : avail.status === 'unknown' ? 'release date TBD'
                : avail.status === 'soon' || avail.status === 'future'
                    ? `available from ${fmtDate(best.freeFrom)}`
                    : 'available';
            return `
            <div class="res-suggestion-row" onclick="App.handleCardClick('${p.id}')">
                <div class="res-suggestion-project">
                    <div class="res-sug-name">${escapeHtml(p.name)}</div>
                    <div class="res-sug-meta">${escapeHtml(p.stage)} · ${escapeHtml(p.client || '—')}</div>
                </div>
                <div class="res-suggestion-arrow">→</div>
                <div class="res-suggestion-person">
                    <div class="res-sug-avatar" style="background:${avc}">${init}</div>
                    <div>
                        <div class="res-sug-pname">${escapeHtml(best.name)}</div>
                        <div class="res-sug-free">${freeStr} · ${best.activeCount} active project${best.activeCount !== 1 ? 's' : ''}</div>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    const conflictCount = conflicted.length;

    let capacityMiniHTML = '';
    if (intelligenceEnabled()) {
        const cap = AppState.deliveryCapacityForecast;
        const roles = cap.roles || {};
        const intelRoles = typeof getIntelRoles === 'function' ? getIntelRoles() : ['Developer', 'QA', 'BA'];
        capacityMiniHTML = `
        <section class="res-section">
            <h3 class="res-section__title">Capacity forecast (30 / 60 / 90 days)</h3>
            <div class="res-cap-mini-grid">
                ${[0, 4, 12].map((weekIdx, i) => {
                    const label = [30, 60, 90][i];
                    const rows = intelRoles.map(role => {
                        const w = roles[role]?.weeks?.[weekIdx];
                        const pct = w?.utilizationPct ?? 0;
                        return `<div class="res-cap-mini-row"><span>${escapeHtml(role)}</span><div class="res-cap-mini-track"><div style="width:${pct}%"></div></div><span>${pct}%</span></div>`;
                    }).join('');
                    return `<div class="res-cap-mini-card card-light"><div class="res-cap-mini-title">${label}d</div>${rows}</div>`;
                }).join('')}
            </div>
            <button type="button" class="ov-link-btn" style="margin-top:8px;" onclick="App.navigate('intelligence')">Full Intelligence dashboard →</button>
        </section>`;
        if (typeof AiInsights !== 'undefined' && featureOn('AI_INSIGHTS')) {
            capacityMiniHTML += AiInsights.capacityShellHtml('ai-capacity-insights');
        }
    }

    return `
    <div style="padding:0 0 40px;">

        <!-- Page header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px;">
            <div>
                <h2 style="font-size:26px;font-weight:800;color:var(--text-primary);margin:0 0 4px;">Resource Intelligence</h2>
                <div style="font-size:13px;color:var(--text-muted);">${people.length} people · ${AppState.allProjects.filter(p=>normalizeStage(p.stage||'')!=='Live').length} active projects${intelligenceEnabled() ? ' · projected ends when forecast available' : ''}</div>
            </div>
            ${conflictCount
                ? `<div style="background:rgba(217,48,37,0.1);border:1px solid rgba(217,48,37,0.3);border-radius:12px;padding:8px 16px;font-size:13px;font-weight:700;color:#D93025;display:inline-flex;align-items:center;gap:8px;"><span class="ui-inline-icon">${Icons.alert}</span>${conflictCount} scheduling conflict${conflictCount>1?'s':''} detected</div>`
                : `<div style="background:rgba(30,142,62,0.1);border:1px solid rgba(30,142,62,0.2);border-radius:12px;padding:8px 16px;font-size:13px;font-weight:700;color:#1E8E3E;">✓ No conflicts detected</div>`}
        </div>

        ${capacityMiniHTML}

        <section class="res-section">
            <h3 class="res-section__title">Availability Calendar</h3>
            ${renderAvailabilityCalendar(resMap)}
        </section>

        ${conflictCount ? `
        <section class="res-section">
            <h3 class="res-section__title">${sectionTitleWithIcon(Icons.alert, 'Scheduling Conflicts')}</h3>
            ${conflictHTML}
        </section>` : ''}

        <section class="res-section">
            <div class="res-ppl-section-header">
                <h3 class="res-section__title" style="margin:0;">People · Parallel Work · Availability (next ${WINDOW} days)</h3>
                <div class="res-view-toggle" id="res-view-toggle">
                    <button class="res-vt-btn res-vt-btn--active" id="res-vt-table" onclick="App.setResPeopleView('table')" title="Table view">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="21"/></svg>
                        Table
                    </button>
                    <button class="res-vt-btn" id="res-vt-cards" onclick="App.setResPeopleView('cards')" title="Card view">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="8" rx="2"/><rect x="2" y="13" width="20" height="8" rx="2"/></svg>
                        Cards
                    </button>
                </div>
            </div>

            <!-- TABLE VIEW -->
            <div id="res-people-table-view" class="res-people-table-wrap card-light">
                ${renderPeopleTable(people, today, WINDOW, statusColor, statusLabel, fmtDate, daysLeft, pct)}
            </div>

            <!-- CARDS VIEW (original — hidden by default) -->
            <div id="res-people-cards-view" style="display:none;">
                ${personCards}
            </div>
        </section>

        ${suggestHTML ? `
        <section class="res-section">
            <h3 class="res-section__title">Assignment Suggestions</h3>
            <div class="res-suggestions card-light">${suggestHTML}</div>
        </section>` : ''}
    </div>`;
}

/* ── Shared Timeline toolbar ── */
function renderTimelineToolbar(mode) {
    const zoom = AppState.timelineZoom || 6;
    return `
    <div class="view-header" style="margin-bottom:12px;">
        <h1 class="view-title">Timeline</h1>
    </div>
    <div class="tl-toolbar">
        <div class="tl-view-tabs">
            <button class="tl-tab ${mode === 'gantt' ? 'tl-tab--active' : ''}" onclick="App.setTimelineMode('gantt')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                Gantt
            </button>
            <button class="tl-tab ${mode === 'calendar' ? 'tl-tab--active' : ''}" onclick="App.setTimelineMode('calendar')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Calendar
            </button>
        </div>
        ${mode === 'gantt' ? `
        <div class="tl-zoom-tabs">
            <span style="font-size:11px;color:var(--text-muted);font-weight:600;margin-right:6px;">Zoom:</span>
            ${[3,6,12].map(m => `<button class="tl-zoom-btn ${zoom===m?'tl-zoom-btn--active':''}" onclick="App.setTimelineZoom(${m})">${m}mo</button>`).join('')}
        </div>` : ''}
    </div>`;
}

function renderTimeline(projects) {
    if (!projects.length) return `
    ${renderTimelineToolbar('gantt')}
    <div class="card-light" style="padding:32px;text-align:center;color:var(--text-muted);">No projects found for timeline.</div>`;

    // Fix 1: use parseSmartDate for sorting so non-standard formats sort correctly
    const sorted = [...projects].sort((a, b) => {
        const da = a.start_date ? parseSmartDate(a.start_date) : new Date('9999');
        const db = b.start_date ? parseSmartDate(b.start_date) : new Date('9999');
        const ta = isNaN(da.getTime()) ? 9e12 : da.getTime();
        const tb = isNaN(db.getTime()) ? 9e12 : db.getTime();
        return ta - tb;
    });

    const today      = new Date(); today.setHours(0,0,0,0);
    const zoom       = AppState.timelineZoom || 6;
    const startRange = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endRange   = new Date(today.getFullYear(), today.getMonth() + (zoom - 1), 0);
    const rangeMs    = endRange - startRange;

    // Fix 2: precompute todayPct as plain number, use single calc() with no nesting
    const todayPct = +((today - startRange) / rangeMs * 100).toFixed(3);
    // left = 216px fixed column + todayPct% of the track — expressed without nesting:
    // left = 216*(1 - todayPct/100)px + todayPct% = calc(Xpx + Y%)
    const todayLineLeft = `calc(${(216 * (1 - todayPct / 100)).toFixed(2)}px + ${todayPct.toFixed(3)}%)`;

    // Month headers (dynamic based on zoom)
    let headersHtml = '';
    for (let m = 0; m < zoom; m++) {
        const d = new Date(startRange.getFullYear(), startRange.getMonth() + m, 1);
        headersHtml += `<div style="flex:1;text-align:center;font-weight:var(--fw-bold);color:var(--text-muted);font-size:${zoom > 6 ? '10' : '12'}px;border-left:1px solid var(--border-light);padding:10px 0;">${d.toLocaleDateString('en-US',{month:'short',year: zoom > 6 ? '2-digit' : '2-digit'})}</div>`;
    }

    const rowsHtml = sorted.map(p => {
        const dstart = p.start_date ? parseSmartDate(p.start_date) : today;
        const dend   = p.release_date ? parseSmartDate(p.release_date) : new Date(today.getTime() + 86400000 * 30);

        // Fix 5: guard against bad data where end < start
        const safeStart = isNaN(dstart.getTime()) ? today : dstart;
        const safeEnd   = isNaN(dend.getTime()) || dend < safeStart ? new Date(safeStart.getTime() + 86400000 * 14) : dend;

        const normStart = Math.max(safeStart.getTime(), startRange.getTime());
        const normEnd   = Math.min(safeEnd.getTime(),   endRange.getTime());

        let leftPct = 0, widthPct = 0;
        const inRange = normEnd > startRange.getTime() && normStart < endRange.getTime() && normEnd > normStart;
        if (inRange) {
            leftPct  = +((normStart - startRange) / rangeMs * 100).toFixed(2);
            widthPct = +((normEnd   - normStart)  / rangeMs * 100).toFixed(2);
        }

        const bgClass  = getStatusPastel(p.status);
        const statusLbl = (p.status || '').replace(/_/g, ' ');

        // Fix 4: only show text inside bar if wide enough (>12%)
        const dispProg = projectDisplayProgress(p);
        const barLabel = widthPct > 12
            ? `<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${dispProg}% · ${statusLbl}</span>`
            : '';

        // Fix 6: show "outside window" hint for fully invisible bars
        const outOfRange = !inRange && (safeEnd < startRange || safeStart > endRange);
        const rangeHint  = outOfRange
            ? `<span style="font-size:10px;color:var(--text-muted);padding-left:8px;display:inline-flex;align-items:center;gap:4px;"><span class="ui-inline-icon">${Icons.calendar}</span>${safeStart < startRange ? 'before' : 'after'} window</span>`
            : '';

        const isLive = normalizeStage(p.stage || '') === 'Live';

        return `
        <div class="tl-row" onclick="App.handleCardClick('${p.id}')">
            <div class="tl-label">
                <div class="tl-name">${escapeHtml(p.name)}</div>
                <div class="tl-meta">
                    <span class="tl-stage-dot" style="background:${bgClass === 'status-on_track' ? '#1E8E3E' : bgClass === 'status-at_risk' ? '#F9AB00' : '#D93025'}"></span>
                    ${escapeHtml(p.stage)} ${isLive ? '✓' : ''}
                </div>
            </div>
            <div class="tl-track">
                ${widthPct > 0 ? `
                <div class="tl-bar ${bgClass}" style="left:${leftPct}%;width:${widthPct}%;" title="${escapeHtml(p.name)} · ${safeStart.toLocaleDateString('en-US',{month:'short',day:'numeric'})} → ${safeEnd.toLocaleDateString('en-US',{month:'short',day:'numeric'})}">
                    ${barLabel}
                </div>` : ''}
                ${rangeHint}
            </div>
        </div>`;
    }).join('');

    return `
    ${renderTimelineToolbar('gantt')}
    <div class="card-light tl-wrap">
        <div class="tl-header">
            <div class="tl-header-label">Project <span style="font-weight:400;opacity:0.6;">(${sorted.length})</span></div>
            <div class="tl-header-months">${headersHtml}</div>
        </div>
        <div class="tl-body">
            ${rowsHtml}
            <div class="tl-today-line" style="left:${todayLineLeft};">
                <span class="tl-today-label">Today</span>
            </div>
        </div>
    </div>`;
}

/* ══════════════════════════════════════════
   VIEW: ANALYTICS dashboard
   Shows efficiency leaderboard and monthly trends.
══════════════════════════════════════════ */
/* ══════════════════════════════════════════
   ANALYTICS — helper computations
══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   TIMELINE — CALENDAR VIEW (12 months, all events)
══════════════════════════════════════════ */
function renderTimelineCalendar(projects) {
    const today = new Date(); today.setHours(0,0,0,0);
    const DAY_LABELS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

    // Build event map: "YYYY-MM-DD" → [{ type, project }]
    // type: 'live' | 'release' | 'start'
    // Use local YYYY-MM-DD to avoid UTC/IST offset shifting the date
    function localDateKey(dt) {
        return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
    }

    const events = {}; // key → []
    function addEvent(rawDate, type, p) {
        if (!rawDate) return;
        const d = parseSmartDate(rawDate);
        if (!d || isNaN(d.getTime())) return;
        d.setHours(0,0,0,0);
        const key = localDateKey(d);
        if (!events[key]) events[key] = [];
        events[key].push({ type, project: p, date: d });
    }
    projects.forEach(p => {
        addEvent(p.actual_live_date, 'live',    p);
        addEvent(p.release_date,    'release',  p);
        addEvent(p.start_date,      'start',    p);
    });

    // Show 12 months: current month - 2 to + 9
    const months = [];
    for (let i = -2; i <= 9; i++) {
        months.push(new Date(today.getFullYear(), today.getMonth() + i, 1));
    }

    // Summary counts
    const liveCount    = Object.values(events).flat().filter(e => e.type === 'live').length;
    const releaseCount = Object.values(events).flat().filter(e => e.type === 'release' && e.date >= today).length;
    const startCount   = Object.values(events).flat().filter(e => e.type === 'start'   && e.date >= today).length;

    function renderCalMonth(monthDate) {
        const yr  = monthDate.getFullYear();
        const mo  = monthDate.getMonth();
        const daysInMonth = new Date(yr, mo + 1, 0).getDate();
        const firstDow    = new Date(yr, mo, 1).getDay(); // 0=Sun
        const startOffset = firstDow === 0 ? 6 : firstDow - 1; // Mon-based

        const monthName = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        let cells = [];
        for (let i = 0; i < startOffset; i++) cells.push(`<div class="tlc-day tlc-day--empty"></div>`);

        for (let d = 1; d <= daysInMonth; d++) {
            const thisDate = new Date(yr, mo, d); thisDate.setHours(0,0,0,0);
            const key      = localDateKey(thisDate);
            const dayEvts  = events[key] || [];
            const isToday  = thisDate.getTime() === today.getTime();
            const isPast   = thisDate < today;

            const liveEvts    = dayEvts.filter(e => e.type === 'live');
            const releaseEvts = dayEvts.filter(e => e.type === 'release');
            const startEvts   = dayEvts.filter(e => e.type === 'start');
            const hasEvt      = dayEvts.length > 0;

            // Dots row: up to 3 dots total
            const dots = [
                ...liveEvts.slice(0,2).map(()    => `<span class="tlc-dot tlc-dot--live"></span>`),
                ...releaseEvts.slice(0,2).map(()  => `<span class="tlc-dot tlc-dot--release"></span>`),
                ...startEvts.slice(0,1).map(()    => `<span class="tlc-dot tlc-dot--start"></span>`),
            ].slice(0,4).join('');

            const tooltip = dayEvts.map(e =>
                `${e.type === 'live' ? 'Live' : e.type === 'release' ? 'Release' : 'Start'} · ${e.project.name}`
            ).join('&#10;');

            const clickAttr = hasEvt
                ? `onclick="App.showCalendarDay('${key}')" title="${escapeHtml(tooltip)}" style="cursor:pointer"`
                : '';

            cells.push(`
            <div class="tlc-day ${isPast ? 'tlc-day--past' : ''} ${isToday ? 'tlc-day--today' : ''} ${hasEvt ? 'tlc-day--has-event' : ''}" ${clickAttr}>
                <div class="tlc-day-num">${d}</div>
                ${dots ? `<div class="tlc-dots">${dots}</div>` : ''}
            </div>`);
        }

        return `
        <div class="tlc-month">
            <div class="tlc-month-name">${monthName}</div>
            <div class="tlc-grid">
                ${DAY_LABELS.map(l => `<div class="tlc-dow">${l}</div>`).join('')}
                ${cells.join('')}
            </div>
        </div>`;
    }

    const calMonths = months.map(renderCalMonth).join('');

    return `
    ${renderTimelineToolbar('calendar')}

    <div class="tlc-summary-strip">
        <div class="tlc-summary-item tlc-summary-item--live">
            <span class="tlc-dot tlc-dot--live"></span>
            <span class="tlc-summary-num">${liveCount}</span> went live
        </div>
        <div class="tlc-summary-item tlc-summary-item--release">
            <span class="tlc-dot tlc-dot--release"></span>
            <span class="tlc-summary-num">${releaseCount}</span> upcoming deadlines
        </div>
        <div class="tlc-summary-item tlc-summary-item--start">
            <span class="tlc-dot tlc-dot--start"></span>
            <span class="tlc-summary-num">${startCount}</span> upcoming starts
        </div>
        <div style="margin-left:auto;font-size:11px;color:var(--text-muted);">Click any highlighted date to see projects</div>
    </div>

    <div class="tlc-months-grid">${calMonths}</div>

    <div id="tlc-day-panel" class="tlc-day-panel" style="display:none;"></div>`;
}

function buildVelocityData() {
    const today = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push({ year: d.getFullYear(), month: d.getMonth(),
            label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
            onTime: 0, late: 0 });
    }
    getAnalyticsUnits().forEach(p => {
        if (!p.actual_live_date) return;
        const live = parseSmartDate(p.actual_live_date);
        if (isNaN(live.getTime())) return;
        const slot = months.find(m => m.year === live.getFullYear() && m.month === live.getMonth());
        if (!slot) return;
        const rel = p.release_date ? parseSmartDate(p.release_date) : null;
        if (rel && !isNaN(rel.getTime()) && live <= rel) slot.onTime++;
        else slot.late++;
    });
    return months;
}

function buildStageHeatmap() {
    // Global benchmark: avg actual days spent in each stage, learned from delivery units
    // (sibling pages for Sheets, subtasks for ClickUp when enriched).
    const ws = (typeof AppState !== 'undefined' && AppState.activeWorkspace) || {};
    const flowDef = typeof getWorkspaceStageFlow === 'function' ? getWorkspaceStageFlow(ws) : [];
    const flow = flowDef.length ? flowDef.map(f => f.stage) : ((typeof STAGE_FLOW !== 'undefined') ? STAGE_FLOW.map(f => f.stage) : []);
    const agg = {};
    flow.forEach(s => agg[s] = { stage: s, totalDays: 0, count: 0, ongoing: 0, pipelineTotal: 0, pipelineCount: 0 });

    getAnalyticsUnits().forEach(u => {
        (u.stageDurations || []).forEach(d => {
            if (!agg[d.stage]) agg[d.stage] = { stage: d.stage, totalDays: 0, count: 0, ongoing: 0, pipelineTotal: 0, pipelineCount: 0 };
            agg[d.stage].totalDays += d.days;
            agg[d.stage].count += 1;
            if (d.ongoing) agg[d.stage].ongoing += 1;
        });
        if (u.reachedLive && agg['Live']) {
            agg['Live'].count += 1;
            const total = u.pipelineActualDays ?? u.pipelineExpectedDays;
            if (total != null) {
                agg['Live'].pipelineTotal += total;
                agg['Live'].pipelineCount += 1;
            }
        }
    });

    const order = flow.length ? flow : Object.keys(agg);
    return order.map(s => {
        const a = agg[s];
        const isLive = s === 'Live';
        const avgDays = isLive
            ? (a.pipelineCount ? Math.round(a.pipelineTotal / a.pipelineCount) : 0)
            : (a.count ? Math.round(a.totalDays / a.count) : 0);
        return { stage: s, isLive, count: isLive ? a.count : a.count, avgDays, ongoing: a.ongoing };
    }).filter(r => r.count > 0);
}

function buildClientScorecard() {
    const clients = {};
    getAnalyticsUnits().forEach(p => {
        const c = (p.client || 'Unknown').trim();
        if (!clients[c]) clients[c] = { name: c, active: 0, live: 0, onTime: 0, liveCount: 0, delayDays: 0, delayCount: 0, H: 0, M: 0, L: 0 };
        const ns = normalizeStage(p.stage || '');
        if (ns === 'Live') {
            clients[c].live++;
            if (p.release_date && p.actual_live_date) {
                const rel  = parseSmartDate(p.release_date);
                const live = parseSmartDate(p.actual_live_date);
                if (!isNaN(rel.getTime()) && !isNaN(live.getTime())) {
                    clients[c].liveCount++;
                    const diff = Math.round((live - rel) / 86400000);
                    if (diff <= 0) clients[c].onTime++;
                    else { clients[c].delayDays += diff; clients[c].delayCount++; }
                }
            }
        } else {
            clients[c].active++;
        }
        const pri = (p.priority || '').toLowerCase();
        if (pri === 'high') clients[c].H++;
        else if (pri === 'low') clients[c].L++;
        else clients[c].M++;
    });
    return Object.values(clients)
        .sort((a, b) => (b.active + b.live) - (a.active + a.live));
}

function buildPredictiveList() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const results = [];
    getAnalyticsUnits().forEach(p => {
        const pred = computeCompletionPrediction(p, today);
        if (!pred) return;
        results.push({
            id: p.id,
            name: p.name,
            progress: pred.progress,
            target: pred.target,
            projected: pred.projected,
            diffDays: pred.diffDays,
            status: p.status,
            stage: pred.stage,
        });
    });
    return results.sort((a, b) => b.diffDays - a.diffDays);
}

/** Optional AI insight shell — no-op when AI_INSIGHTS flag is off. */
function renderAiInsightsShell(mountId, title, subtitle) {
    if (typeof featureOn !== 'function' || !featureOn('AI_INSIGHTS')) return '';
    if (typeof AiInsights === 'undefined') return '';
    return AiInsights.shellHtml(mountId, title, subtitle);
}

/** PageSpeed Insights panel — homepage of website_url by default. */
function renderPageSpeedPanel(p) {
    if (typeof featureOn === 'function' && !featureOn('PAGESPEED_INSIGHTS')) return '';
    if (typeof PageSpeed === 'undefined') return '';
    return PageSpeed.shellHtml(p);
}

/* ══════════════════════════════════════════
   VIEW: ANALYTICS (full redesign)
══════════════════════════════════════════ */
function renderAnalytics() {
    const today    = new Date(); today.setHours(0,0,0,0);
    const unitPlur = typeof deliveryUnitWord === 'function' ? deliveryUnitWord(true) : 'pages';
    // Analytics works on per-page delivery units from the sibling sheet (Streak projects),
    // falling back to the master row only for unlinked / ClickUp items.
    const projects = getAnalyticsUnits();
    const liveProjs = projects.filter(p => normalizeStage(p.stage||'') === 'Live');

    /* ── Section 1: KPI strip ── */
    const liveWithDates = liveProjs.filter(p => p.release_date && p.actual_live_date);
    const onTimeCount   = liveWithDates.filter(p => {
        const rel  = parseSmartDate(p.release_date);
        const live = parseSmartDate(p.actual_live_date);
        return !isNaN(rel.getTime()) && !isNaN(live.getTime()) && live <= rel;
    }).length;
    const onTimeRate = liveWithDates.length ? Math.round(onTimeCount / liveWithDates.length * 100) : 0;

    const delayedLive = liveWithDates.filter(p => {
        const rel  = parseSmartDate(p.release_date);
        const live = parseSmartDate(p.actual_live_date);
        return !isNaN(rel.getTime()) && !isNaN(live.getTime()) && live > rel;
    });
    const avgDelay = delayedLive.length
        ? Math.round(delayedLive.reduce((s,p) => {
            const diff = Math.round((parseSmartDate(p.actual_live_date) - parseSmartDate(p.release_date)) / 86400000);
            return s + diff;
          }, 0) / delayedLive.length)
        : 0;

    const activeProjs   = projects.filter(p => !['Live','Backlog'].includes(normalizeStage(p.stage||'')));
    const onTrackActive = activeProjs.filter(p => p.status === 'on_track').length;
    const pipelineHealth = activeProjs.length ? Math.round(onTrackActive / activeProjs.length * 100) : 0;

    const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(today.getDate() - 30);
    const velocity30 = liveProjs.filter(p => {
        if (!p.actual_live_date) return false;
        const d = parseSmartDate(p.actual_live_date);
        return !isNaN(d.getTime()) && d >= thirtyDaysAgo && d <= today;
    }).length;

    const kpiHTML = `
    <div class="an-kpi-strip">
        <div class="an-kpi-tile an-kpi-tile--click ${onTimeRate >= 70 ? 'an-kpi-tile--green' : onTimeRate >= 40 ? 'an-kpi-tile--amber' : 'an-kpi-tile--red'}" onclick="App.analyticsDrill('ontime')">
            <div class="an-kpi-label">On-Time Rate</div>
            <div class="an-kpi-value">${onTimeRate}%</div>
            <div class="an-kpi-sub">${onTimeCount} of ${liveWithDates.length} live ${unitPlur}</div>
        </div>
        <div class="an-kpi-tile an-kpi-tile--click ${avgDelay === 0 ? 'an-kpi-tile--green' : avgDelay <= 7 ? 'an-kpi-tile--amber' : 'an-kpi-tile--red'}" onclick="App.analyticsDrill('delayed')">
            <div class="an-kpi-label">Avg Delay</div>
            <div class="an-kpi-value">${avgDelay > 0 ? '+' + avgDelay + 'd' : '0d'}</div>
            <div class="an-kpi-sub">${delayedLive.length} delayed deliveries</div>
        </div>
        <div class="an-kpi-tile an-kpi-tile--click ${pipelineHealth >= 60 ? 'an-kpi-tile--green' : pipelineHealth >= 30 ? 'an-kpi-tile--amber' : 'an-kpi-tile--red'}" onclick="App.analyticsDrill('pipeline')">
            <div class="an-kpi-label">Pipeline Health</div>
            <div class="an-kpi-value">${pipelineHealth}%</div>
            <div class="an-kpi-sub">${onTrackActive} of ${activeProjs.length} on track</div>
        </div>
        <div class="an-kpi-tile an-kpi-tile--click an-kpi-tile--blue" onclick="App.analyticsDrill('velocity30')">
            <div class="an-kpi-label">Velocity (30d)</div>
            <div class="an-kpi-value">${velocity30}</div>
            <div class="an-kpi-sub">${unitPlur} went live</div>
        </div>
    </div>`;

    /* ── Section 2: Delivery Velocity chart ── */
    const velData = buildVelocityData();
    const maxBar  = Math.max(...velData.map(m => m.onTime + m.late), 1);
    const curMonth = today.getMonth();
    const curYear  = today.getFullYear();

    const velBars = velData.map(m => {
        const total   = m.onTime + m.late;
        const barH    = Math.round((total / maxBar) * 100);
        const onPct   = total ? Math.round(m.onTime / total * 100) : 0;
        const isCur   = m.month === curMonth && m.year === curYear;
        const clickAttr = total ? ` onclick="App.analyticsDrill('velocity','${m.year}-${m.month}')"` : '';
        return `
        <div class="an-vel-col${total ? ' an-vel-col--click' : ''}"${clickAttr} title="${total ? 'Click to see launches in ' + m.label : ''}">
            <div class="an-vel-count">${total || ''}</div>
            <div class="an-vel-bar-wrap">
                <div class="an-vel-bar ${isCur ? 'an-vel-bar--current' : ''}" style="height:${barH}%;">
                    ${total ? `<div class="an-vel-bar-ontime" style="height:${onPct}%"></div>` : ''}
                </div>
            </div>
            <div class="an-vel-label">${m.label}</div>
            ${total ? `<div class="an-vel-sub">${m.onTime}✓ ${m.late ? m.late+'✗' : ''}</div>` : '<div class="an-vel-sub"></div>'}
        </div>`;
    }).join('');

    const velocityHTML = `
    <div class="an-section card-light">
        <div class="an-section-header">
            <div class="an-section-title">Delivery Velocity</div>
            <div class="an-section-sub">Monthly launches · last 6 months</div>
        </div>
        <div class="an-vel-legend">
            <span class="an-vel-legend-dot an-vel-legend-dot--on"></span> On time
            <span class="an-vel-legend-dot an-vel-legend-dot--late" style="margin-left:12px;"></span> Late
        </div>
        <div class="an-vel-chart">${velBars}</div>
    </div>`;

    /* ── Section 3: Stage Heatmap (global stage-duration benchmark) ── */
    const heatmap    = buildStageHeatmap();
    const maxAvg     = Math.max(...heatmap.filter(s => !s.isLive).map(s => s.avgDays), 1);
    const FLOW_COLORS = {
        'Planning':'#A78BFA', 'Content':'#A78BFA', 'Story Req':'#818CF8',
        'UI Dev':'#60A5FA', 'Streak Dev':'#3B82F6', 'Streak QA':'#34D399', 'Live':'#10B981',
        'Brief':'#A78BFA', 'Design':'#60A5FA', 'Review':'#34D399', 'Publish':'#10B981',
    };

    const heatRows = heatmap.map(s => {
        const barW   = s.isLive
            ? (s.avgDays ? Math.min(100, Math.round((s.avgDays / Math.max(maxAvg, s.avgDays)) * 100)) : 100)
            : Math.round((s.avgDays / maxAvg) * 100);
        const isHot  = s.avgDays > 21 && !s.isLive;
        const color  = FLOW_COLORS[s.stage] || '#888';
        const safe   = escapeHtml(String(s.stage).replace(/\\/g, '\\\\').replace(/'/g, "\\'"));
        const ongoingNote = s.ongoing ? ` · ${s.ongoing} active` : '';
        const dayLabel = s.isLive
            ? (s.avgDays ? `avg ${s.avgDays}d end-to-end` : `${s.count} live`)
            : (s.avgDays ? `avg ${s.avgDays}d` : '—');
        return `
        <div class="an-heat-row an-heat-row--click" onclick="App.analyticsDrill('stagetime','${safe}')" title="Click to see per-page days in ${escapeHtml(s.stage)}${ongoingNote}">
            <div class="an-heat-stage" title="${escapeHtml(s.stage)}">${escapeHtml(s.stage)}</div>
            <div class="an-heat-track">
                <div class="an-heat-bar" style="width:${barW || 4}%;background:${color};"></div>
            </div>
            <div class="an-heat-count" title="${s.count} page(s) contributed${ongoingNote}">${s.count}</div>
            <div class="an-heat-days ${isHot ? 'an-heat-days--hot' : ''}">${dayLabel}</div>
        </div>`;
    }).join('');

    const heatmapHTML = `
    <div class="an-section card-light${!heatRows ? ' an-section--empty' : ''}">
        <div class="an-section-header">
            <div class="an-section-title">Stage Heatmap</div>
            <div class="an-section-sub">Predictive benchmark · avg days per stage from all live + active ${unitPlur}</div>
        </div>
        <div class="an-heat-list">${heatRows || `<div class="an-empty-compact">${(typeof isClickUpWorkspace === 'function' && isClickUpWorkspace(AppState?.activeWorkspace)) ? 'No stage duration dates found. Add start/due/closed dates on ClickUp tasks and subtasks.' : 'No stage transition dates found in sibling sheets.'}</div>`}</div>
        <div class="an-heat-hint">avg Nd = learned from real dates · includes ongoing time for active ${unitPlur} · red = avg &gt;21 days</div>
    </div>`;

    /* ── Section 4: Client Scorecard ── */
    const clients = buildClientScorecard();
    const clientRows = clients.map(c => {
        const total       = c.active + c.live;
        const onTimePct   = c.liveCount ? Math.round(c.onTime / c.liveCount * 100) : '—';
        const avgDel      = c.delayCount ? '+' + Math.round(c.delayDays / c.delayCount) + 'd' : '—';
        const priStr      = [c.H ? `${c.H}H` : '', c.M ? `${c.M}M` : '', c.L ? `${c.L}L` : ''].filter(Boolean).join(' · ');
        const healthColor = typeof onTimePct === 'number'
            ? onTimePct >= 70 ? '#1E8E3E' : onTimePct >= 40 ? '#b45309' : '#D93025'
            : 'var(--text-muted)';
        return `
        <div class="an-client-row" onclick="App.setFilterAndNavigate('client','${escapeHtml(c.name)}','projects')">
            <div class="an-client-name">
                <div class="an-client-avatar" style="background:${stringToColor(c.name)}">${getInitials(c.name)}</div>
                <span>${escapeHtml(c.name)}</span>
            </div>
            <div class="an-client-cell">${c.active}</div>
            <div class="an-client-cell">${c.live}</div>
            <div class="an-client-cell" style="color:${healthColor};font-weight:700;">${typeof onTimePct === 'number' ? onTimePct + '%' : '—'}</div>
            <div class="an-client-cell ${c.delayCount ? 'an-client-cell--red' : ''}">${avgDel}</div>
            <div class="an-client-cell an-client-pri">${priStr}</div>
        </div>`;
    }).join('');

    const clientHTML = `
    <div class="an-section card-light">
        <div class="an-section-header">
            <div class="an-section-title">Client Scorecard</div>
            <div class="an-section-sub">Click a row to filter projects by client</div>
        </div>
        <div class="an-client-table">
            <div class="an-client-head">
                <div class="an-client-name">Client</div>
                <div class="an-client-cell">Active</div>
                <div class="an-client-cell">Live</div>
                <div class="an-client-cell">On-Time %</div>
                <div class="an-client-cell">Avg Delay</div>
                <div class="an-client-cell">Priority</div>
            </div>
            ${clientRows || '<div style="padding:20px;color:var(--text-muted);font-size:13px;">No client data.</div>'}
        </div>
    </div>`;

    /* ── Section 5: Predictive Completion ── */
    const predictions = buildPredictiveList();
    const minSlack = CONFIG.PREDICTIVE_ALERT_MIN_SLACK_DAYS ?? 0;
    const atRisk = predictions.filter(p => p.diffDays > minSlack).slice(0, 6);
    const onTrack = predictions.filter(p => p.diffDays <= 0).slice(0, 4);

    const predRows = (list, emptyMsg) => list.map(p => {
        const isOver  = p.diffDays > 0;
        const barColor = p.status === 'delayed' ? '#D93025' : p.status === 'at_risk' ? '#F9AB00' : '#1E8E3E';
        const tgtLabel = p.target.toLocaleDateString('en-US',{month:'short',day:'numeric'});
        const prjLabel = p.projected.toLocaleDateString('en-US',{month:'short',day:'numeric'});
        return `
        <div class="an-pred-row" onclick="App.handleCardClick('${p.id}')">
            <div class="an-pred-meta">
                <div class="an-pred-name">${escapeHtml(p.name)}</div>
                <div class="an-pred-stage">${escapeHtml(p.stage)}</div>
            </div>
            <div class="an-pred-bar-wrap">
                <div class="an-pred-bar" style="width:${p.progress}%;background:${barColor};"></div>
                <div class="an-pred-pct">${p.progress}%</div>
            </div>
            <div class="an-pred-dates">
                <span class="an-pred-target">Target: ${tgtLabel}</span>
                <span class="an-pred-proj ${isOver ? 'an-pred-proj--over' : 'an-pred-proj--ok'}">
                    Proj: ${prjLabel} ${isOver ? `(+${p.diffDays}d)` : `(−${Math.abs(p.diffDays)}d)`}
                </span>
            </div>
        </div>`;
    }).join('') || `<div class="an-pred-empty">${emptyMsg}</div>`;

    const aiPredictiveShell = (typeof AiInsights !== 'undefined' && typeof featureOn === 'function' && featureOn('AI_INSIGHTS'))
        ? AiInsights.predictiveShellHtml('ai-predictive-insights')
        : '';

    const predEmpty = !atRisk.length && !onTrack.length;
    const predictiveHTML = `
    <div class="an-section card-light an-section--predictive${predEmpty ? ' an-section--empty' : ''}">
        <div class="an-section-header">
            <div class="an-section-title">Predictive Completion</div>
            <div class="an-section-sub">Velocity forecast from progress rate · projected vs target · same math as Alerts → Likely miss</div>
        </div>
        ${aiPredictiveShell}
        ${atRisk.length ? `<div class="an-pred-group-label an-pred-group-label--risk">Will likely miss deadline</div>${predRows(atRisk, '')}` : ''}
        ${onTrack.length ? `<div class="an-pred-group-label an-pred-group-label--ok">On track to hit deadline</div>${predRows(onTrack, '')}` : ''}
        ${predEmpty ? `<div class="an-pred-empty an-empty-compact">Not enough progress data to predict. Add start_date, release_date and progress values.</div>` : ''}
    </div>`;

    /* ── Section 6: Team Efficiency Leaderboards ── */
    const data         = AppState.getAnalyticsData();
    const speedRows2 = data.speedRunners.length ? data.speedRunners.map(r => `
        <div class="an-lb-row an-lb-row--good" onclick="App.handleCardClick('${r.id}')">
            <div class="an-lb-info" style="flex:1">
                <div class="an-lb-name">${escapeHtml(r.name)}</div>
                ${r.owner ? `<div style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:2px;">${escapeHtml(r.owner)}</div>` : ''}
            </div>
            <div class="an-lb-badge an-lb-badge--green">${r.variance}d early</div>
        </div>`).join('')
        : '<div class="an-lb-empty">No completed projects with matching dates.</div>';

    const lagRows2 = data.laggards.length ? data.laggards.map(r => `
        <div class="an-lb-row an-lb-row--bad" onclick="App.handleCardClick('${r.id}')">
            <div class="an-lb-info" style="flex:1">
                <div class="an-lb-name">${escapeHtml(r.name)}</div>
                ${r.owner ? `<div style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:2px;">${escapeHtml(r.owner)}</div>` : ''}
            </div>
            <div class="an-lb-badge an-lb-badge--red">${Math.abs(r.variance)}d late</div>
        </div>`).join('')
        : '<div class="an-lb-empty">No delayed deliveries recorded.</div>';

    // Developer velocity: avg progress across active projects
    const devMap = {};
    projects.filter(p => normalizeStage(p.stage||'') !== 'Live').forEach(p => {
        splitAssigneeNames(p.developer).filter(n => isValidResourceName(n)).forEach(dev => {
            if (!devMap[dev]) devMap[dev] = { name: dev, total: 0, count: 0 };
            devMap[dev].total += projectDisplayProgress(p) || 0;
            devMap[dev].count++;
        });
    });
    const devList = Object.values(devMap)
        .filter(d => d.count > 0 && d.name && d.name !== 'Unassigned' && d.name !== '—' && d.name.trim() !== '')
        .sort((a, b) => (b.total / b.count) - (a.total / a.count))
        .slice(0, 5);

    const devRows = devList.length ? devList.map((d, i) => {
        const avg  = Math.round(d.total / d.count);
        const avc  = stringToColor(d.name);
        const init = getInitials(d.name);
        return `
        <div class="an-lb-row" onclick="App.analyticsDrill('developer','${escapeHtml(d.name)}')" title="Click to see ${escapeHtml(d.name)}'s active pages">
            <div class="an-lb-avatar" style="background:${avc}">${init}</div>
            <div class="an-lb-info">
                <div class="an-lb-name">${escapeHtml(d.name)}</div>
                <div class="an-lb-bar-wrap"><div class="an-lb-bar" style="width:${avg}%;background:${avc}"></div></div>
            </div>
            <div class="an-lb-badge an-lb-badge--blue">${avg}% avg</div>
        </div>`;
    }).join('') : `<div class="an-lb-empty">No ${(typeof isContentCreatorWorkspace === 'function' && isContentCreatorWorkspace()) ? 'content creator' : 'developer'} data.</div>`;

    const leaderboardHTML = `
    <div class="an-lb-grid">
        <div class="an-section card-dark an-section--dark">
            <div class="an-section-header an-section-header--dark">
                <div class="an-section-title">Elite Speed-Runners</div>
                <div class="an-section-sub">Beat their release target</div>
            </div>
            ${speedRows2}
        </div>
        <div class="an-section card-dark an-section--dark">
            <div class="an-section-header an-section-header--dark">
                <div class="an-section-title">Efficiency Bottlenecks</div>
                <div class="an-section-sub">Highest delivery variance</div>
            </div>
            ${lagRows2}
        </div>
        <div class="an-section card-light">
            <div class="an-section-header">
                <div class="an-section-title">${(typeof isContentCreatorWorkspace === 'function' && isContentCreatorWorkspace()) ? 'Content Creator Velocity' : 'Developer Velocity'}</div>
                <div class="an-section-sub">Avg progress on active ${(typeof isContentCreatorWorkspace === 'function' && isContentCreatorWorkspace()) ? 'campaigns' : 'projects'}</div>
            </div>
            ${devRows}
        </div>
    </div>`;

    /* ── Assemble ── */
    return `
    <div class="view-header">
        <h1 class="view-title">Analytics</h1>
        <p class="view-subtitle">Delivery performance, pipeline health, and team intelligence.</p>
    </div>

    ${kpiHTML}

    <div class="an-top-grid">
        ${velocityHTML}
        ${heatmapHTML}
    </div>

    ${clientHTML}

    <div class="an-bottom-grid">
        ${predictiveHTML}
        <div style="display:flex;flex-direction:column;gap:0;">
            ${leaderboardHTML}
        </div>
    </div>`;
}

function initOverviewCharts() {
    // 1. Go-live velocity — last 6 months (actual_live_date from sheet)
    const pts = buildSparklineFromLiveLaunches(AppState.allProjects);
    renderSparkline('chart-sparkline', pts, '#10B981');

    // 2. Donut
    const counts = AppState.stageCounts;
    const donutData = [
        { label: 'Planning', value: counts['Planning'] || 0, color: 'var(--stage-planning)' },
        { label: 'Dev',      value: counts['Development'] || 0, color: 'var(--stage-dev)' },
        { label: 'QA',       value: counts['QA'] || 0, color: 'var(--stage-qa)' },
        { label: 'Live',     value: counts['Live'] || 0, color: 'var(--stage-live)' },
    ];
    renderDonutChart('chart-donut', donutData, String(AppState.funnelPageTotal));

    // 3. Stage Bar
    renderStageBar('chart-stage-bar', AppState.stageCounts, AppState.funnelPageTotal || AppState.totalProjects);
}

/* ══════════════════════════════════════════
   VIEW: PROJECT (master row + optional sibling tab CSV)
══════════════════════════════════════════ */
function renderProjectPageLoading() {
    const classic = typeof CONFIG !== 'undefined' && CONFIG.PROJECT_PAGE_LAYOUT === 'classic';
    const pageClass = classic ? 'streak-project-page--refined' : 'streak-project-page--devtrack';
    const shellClass = classic ? 'streak-pd-shell' : 'streak-pd-shell streak-pd-shell--devtrack';
    return `
    <div class="streak-project-page ${pageClass}">
        <div class="${shellClass}">
            <div style="min-height:200px; display:flex; align-items:center; justify-content:center; padding:48px; background:var(--bg-card); border:1px solid var(--border-light); border-radius:16px;">
                <div class="skeleton" style="height:20px; width:min(40%, 320px); border-radius:8px; background:var(--bg-subtle)"></div>
            </div>
        </div>
    </div>`;
}

function renderProjectNotFound() {
    return `
    <div class="streak-project-page streak-project-page--refined">
        <div class="streak-pd-shell">
            <div class="streak-pd-card" style="padding:36px;">
                <h2 style="font-size:21px; color:var(--text-primary); margin:0 0 8px;">Project not found</h2>
                <p style="color:var(--text-muted); font-size:15px; line-height:1.55; margin:0 0 24px;">This link may be outdated or the row was removed from the sheet.</p>
                <button type="button" class="streak-pd-back streak-pd-back--text" onclick="App.navigate('projects')"><span class="streak-pd-back__icon" aria-hidden="true">←</span> Back to directory</button>
            </div>
        </div>
    </div>`;
}

function pickSiblingRowTitle(row, titleIdx, nCol) {
    if (row[titleIdx] != null && String(row[titleIdx]).trim() !== '') {
        return String(row[titleIdx]).trim();
    }
    for (let i = 0; i < nCol; i++) {
        if (row[i] != null && String(row[i]).trim() !== '') return String(row[i]).trim();
    }
    return 'Untitled';
}

/** Vertical milestone track (past / active / upcoming) matching reference sidebar. */
function renderVerticalStageFlow(stageRaw) {
    const cur = normalizeStage(stageRaw || '');
    let idx = STAGES.indexOf(cur);
    if (idx < 0) idx = 0;
    const items = STAGES.map((label, i) => {
        const sub = i < idx ? 'past' : i === idx ? 'here' : 'next';
        const active = i === idx ? '<span class="streak-ms-v__active">Active now</span>' : '';
        return `
        <div class="streak-ms-v__row streak-ms-v__row--${sub}">
            <div class="streak-ms-v__track"><span class="streak-ms-v__dot" aria-hidden="true"></span></div>
            <div class="streak-ms-v__text">
                <span class="streak-ms-v__name">${escapeHtml(label)}</span>
                ${active}
            </div>
        </div>`;
    }).join('');
    return `<div class="streak-ms-v" aria-label="Milestone timeline for ${escapeHtml(cur)}">${items}</div>`;
}

function buildAsideMetaStrip(hlist, row) {
    const pairs = [];
    function tryPush(aliases, displayLabel) {
        const idx = findSiblingCol(hlist, aliases);
        if (idx < 0) return;
        const v = roadmapCell(row, idx);
        if (!v) return;
        pairs.push({ label: displayLabel, value: v });
    }
    tryPush(['developer', 'dev'], 'Developer');
    tryPush(['qa_engineer', 'qa'], 'QA lead');
    tryPush(['cms', 'stack'], 'CMS');
    tryPush(['risk', 'risk_assessment'], 'Risk');
    if (!pairs.length) return '';
    const inner = pairs
        .map(
            ({ label, value }) => `
        <div class="streak-pd-aside-meta-row">
            <span class="streak-pd-aside-meta-label">${escapeHtml(label)}</span>
            <span class="streak-pd-aside-meta-value">${escapeHtml(value)}</span>
        </div>`
        )
        .join('');
    return `<div class="streak-pd-aside-meta">${inner}</div>`;
}

function buildDevTrackAsidePanels(hlist, rows, titleIdx, nCol) {
    const idxStageCol = findSiblingCol(hlist, ['stage', 'phase']);
    return rows
        .map((row, i) => {
            const title = pickSiblingRowTitle(row, titleIdx, nCol);
            const stageRaw = idxStageCol >= 0 ? roadmapCell(row, idxStageCol) : '';
            const init = getInitials(title.slice(0, 32));
            const avc = stringToColor(title);
            const vis = i === 0 ? 'block' : 'none';
            const grid = buildSiblingRowFieldsHTML(hlist, row, titleIdx, nCol);
            const meta = buildAsideMetaStrip(hlist, row);
            const stageLabel = stageRaw ? escapeHtml(stageRaw) : 'No stage';
            const rowKicker = `Page ${i + 1} of ${rows.length} · ${stageLabel}`;
            return `
        <div class="streak-sibling-panel streak-pd-aside-panel" data-sibling-index="${i}" style="display:${vis}">
            <header class="streak-pd-aside-sticky-zone">
                <div class="streak-pd-aside-hero">
                    <div class="streak-pd-aside-avatar" style="background:${avc}">${init}</div>
                    <div>
                        <h2 class="streak-pd-aside-name">${escapeHtml(title)}</h2>
                        <p class="streak-pd-aside-kicker">${rowKicker}</p>
                    </div>
                </div>
                ${meta}
            </header>
            <div class="streak-pd-aside-scroll-body">
                <div class="streak-pd-aside-milestone">
                    <h4 class="streak-pd-aside-h">Milestone timeline</h4>
                    ${renderVerticalStageFlow(stageRaw)}
                </div>
                <div class="streak-pd-aside-gridwrap">
                    <h4 class="streak-pd-aside-h">All fields</h4>
                    <div class="sib-grouped-wrap">${grid}</div>
                </div>
            </div>
        </div>`;
        })
        .join('');
}

function renderRoadmapTableHTML(hlist, rows, rm, nCol) {
    const { ti, idxStage, idxStatus, idxProgress, idxOwner } = rm;
    const tbody = rows
        .map((row, i) => {
            const pg =
                ti >= 0 && ti < nCol
                    ? roadmapCell(row, ti)
                    : pickSiblingRowTitle(row, ti >= 0 ? ti : 0, nCol);
            const owRaw = idxOwner >= 0 ? roadmapCell(row, idxOwner) : '—';
            const stRaw = idxStage >= 0 ? roadmapCell(row, idxStage) : '';
            const normalized = normalizeStage(stRaw || '');
            const staRaw = idxStatus >= 0 ? roadmapCell(row, idxStatus) : '';
            const staKey = siblingStatusKeyFromValue(staRaw || '');
            const progStr = idxProgress >= 0 ? roadmapCell(row, idxProgress) : '';
            let bar = '<span class="streak-roadmap-dash">—</span>';
            const pn = parseInt(progStr, 10);
            if (!isNaN(pn)) {
                const pct = Math.min(100, Math.max(0, pn));
                bar = `
                <div class="streak-roadmap-progress">
                    <div class="streak-roadmap-progress-bar" aria-hidden="true">
                        <span style="width:${pct}%"></span>
                    </div>
                    <span class="streak-roadmap-progress-pct">${pct}%</span>
                </div>`;
            }
            const stPill =
                normalized && normalized !== 'Backlog'
                    ? `<span class="stage-pill streak-roadmap-stage ${stageClass(normalized)}">${escapeHtml(stRaw || normalized)}</span>`
                    : `<span class="stage-pill streak-roadmap-stage">${escapeHtml(stRaw || '—')}</span>`;
            const stat = staRaw
                ? `<span class="status-badge streak-roadmap-status ${staKey}">${escapeHtml(staRaw)}</span>`
                : `<span class="streak-roadmap-dash">—</span>`;
            const sel = i === 0 ? ' streak-roadmap-row--selected' : '';
            return `
        <tr class="streak-roadmap-row${sel}" role="button" tabindex="0" data-index="${i}" data-sibling-index="${i}"
            onclick="App.showSiblingPageDetail(${i})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();App.showSiblingPageDetail(${i})}">
            <td class="streak-roadmap-cell-title">${escapeHtml(pg || '—')}</td>
            <td>${escapeHtml(owRaw)}</td>
            <td>${stPill}</td>
            <td>${stat}</td>
            <td class="streak-roadmap-cell-progress">${bar}</td>
        </tr>`;
        })
        .join('');
    const thead = `
    <thead>
        <tr>
            <th scope="col">Page name</th>
            <th scope="col">Owner</th>
            <th scope="col">Stage</th>
            <th scope="col">Status</th>
            <th scope="col" class="streak-roadmap-th-progress">Progress</th>
        </tr>
    </thead>`;
    return `<table class="streak-roadmap-table">${thead}<tbody>${tbody}</tbody></table>`;
}

function siblingStatusKeyFromValue(val) {
    const s = String(val || '').toLowerCase();
    if (s.includes('at_risk') || s.includes('at risk') || s.includes('yellow') || s.includes('risk')) return 'at_risk';
    if (s.includes('delay') || s.includes('overdue') || s.includes('red') || s.includes('blocked')) return 'delayed';
    if (s.includes('track') || s === 'on track' || s.includes('on_track') || s === 'green' || s === 'good') return 'on_track';
    if (s === 'status' || s === '') return 'on_track';
    return 'on_track';
}

function renderSiblingFieldCell(label, headerNorm, raw) {
    const v = raw != null ? String(raw) : '';
    if (headerNorm === 'status' || headerNorm === 'health') {
        const k = siblingStatusKeyFromValue(v);
        return `
        <div class="streak-sibling-field">
            <div class="streak-sibling-field-label">${escapeHtml(label)}</div>
            <div class="streak-sibling-field-value">
                <span class="status-badge ${k}">${escapeHtml(v || statusLabel(k))}</span>
            </div>
        </div>`;
    }
    if (headerNorm === 'stage' || headerNorm === 'phase') {
        const st = normalizeStage(v || '—');
        return `
        <div class="streak-sibling-field">
            <div class="streak-sibling-field-label">${escapeHtml(label)}</div>
            <div class="streak-sibling-field-value">
                <span class="stage-pill ${stageClass(st)}">${escapeHtml(v || st)}</span>
            </div>
        </div>`;
    }
    if (headerNorm === 'progress' || headerNorm === 'pct' || headerNorm === '%' || headerNorm === 'percent') {
        const n = parseInt(v, 10);
        if (!isNaN(n) && v.trim() !== '') {
            const pct = Math.min(100, Math.max(0, n));
            const fillBg = streskBandedProgressColor(pct);
            return `
            <div class="streak-sibling-field streak-sibling-field--full">
                <div class="streak-sibling-field-label">${escapeHtml(label)}</div>
                <div class="streak-sibling-field-value">
                    <div class="progress-section" style="margin:0">
                        <div class="progress-row">
                            <span class="progress-label" style="font-size:12px">Progress</span>
                            <span class="progress-value" style="font-size:16px">${pct}%</span>
                        </div>
                        <div class="progress-track" style="height:8px; margin-top:6px">
                            <div class="progress-fill" style="width:0%; background:${fillBg}" data-fill="${pct}"></div>
                        </div>
                    </div>
                </div>
            </div>`;
        }
    }
    return `
        <div class="streak-sibling-field">
            <div class="streak-sibling-field-label">${escapeHtml(label)}</div>
            <div class="streak-sibling-field-value streak-sibling-field-text">${escapeHtml(v)}</div>
        </div>`;
}

/* ─── smart-grouped sibling field renderer ─────────────────── */
function buildSiblingRowFieldsHTML(hlist, row, titleIdx, nCol) {
    const TEAM_KW   = ['developer','qa','designer','marketing','writer','ui_developer','owner','lead','pm','ba','content_writer'];
    const DATE_KW   = ['_date','_start','_end','release','live','launch','deadline','delivery','start_date','end_date'];
    const SKIP_KW   = ['status','stage','progress','title','name','page_name','id','index'];

    const teamF = [], dateF = [], infoF = [];

    for (let i = 0; i < nCol; i++) {
        if (i === titleIdx) continue;
        const label = hlist[i] ? String(hlist[i]).trim() : `Column ${i + 1}`;
        const hn    = normalizeHeaderForMatch(hlist[i]);
        const raw   = row[i] != null ? String(row[i]).trim() : '';
        const entry = { label, hn, raw, idx: i };
        if (SKIP_KW.some(k => hn === k))                  continue;
        if (TEAM_KW.some(k => hn.includes(k)))            { teamF.push(entry); continue; }
        if (DATE_KW.some(k => hn.includes(k)))            { dateF.push(entry); continue; }
        infoF.push(entry);
    }

    let html = '';
    const nonEmptyTeam = teamF.filter(f => f.raw);
    if (nonEmptyTeam.length) html += renderSiblingTeamBlock(nonEmptyTeam);
    if (dateF.length)        html += renderSiblingPhaseTimeline(dateF);
    const nonEmptyInfo = infoF.filter(f => f.raw);
    if (nonEmptyInfo.length) html += renderSiblingInfoBlock(nonEmptyInfo);
    if (!html) html = '<div style="padding:16px;color:var(--text-muted);font-size:13px;">No additional data for this row.</div>';
    return html;
}

function renderSiblingTeamBlock(fields) {
    const rows = fields.map(f => {
        const init = getInitials(f.raw);
        const avc  = stringToColor(f.raw);
        return `
        <div class="sib-team-row">
            <div class="sib-team-avatar" style="background:${avc}">${init}</div>
            <div class="sib-team-info">
                <div class="sib-team-name">${escapeHtml(f.raw)}</div>
                <div class="sib-team-role">${escapeHtml(f.label)}</div>
            </div>
        </div>`;
    }).join('');
    return `<div class="sib-section"><div class="sib-section__label">Team</div><div class="sib-team-list">${rows}</div></div>`;
}

function renderSiblingPhaseTimeline(dateFields) {
    const PHASES = [
        { label: 'Planning',  color: '#80868b', keys: ['project_start','start_date','planning','story_req','planned_release'] },
        { label: 'Content',   color: '#1a73e8', keys: ['content'] },
        { label: 'UI Design', color: '#a142f4', keys: ['ui_start','ui_end','ui_'] },
        { label: 'Dev',       color: '#f9ab00', keys: ['dev_start','dev_end','dev_'] },
        { label: 'QA',        color: '#e37400', keys: ['qa_start','qa_end','qa_'] },
        { label: 'Release',   color: '#1e8e3e', keys: ['live','actual','release','launch','deadline','delivery'] },
    ];
    const used = new Set();
    const phaseGroups = PHASES.map(ph => ({
        ...ph,
        dates: dateFields.filter(f => !used.has(f.idx) && ph.keys.some(k => f.hn.includes(k)) && (used.add(f.idx), true)),
    })).filter(ph => ph.dates.length);
    const unmatched = dateFields.filter(f => !used.has(f.idx));
    if (unmatched.length) phaseGroups.push({ label: 'Other', color: '#9aa0a6', dates: unmatched });
    if (!phaseGroups.length) return '';

    const items = phaseGroups.map((ph, i) => {
        const isLast = i === phaseGroups.length - 1;
        const dateItems = ph.dates.map(d => {
            const val = d.raw && !/^tbd$/i.test(d.raw) && d.raw !== '—'
                ? (() => { const p = parseSmartDate(d.raw); return isNaN(p.getTime()) ? d.raw : formatDateShort(d.raw); })()
                : '—';
            const hasVal = val !== '—';
            return `<div class="sib-phase-date-item ${hasVal ? '' : 'sib-phase-date-item--empty'}">
                <span class="sib-phase-date-label">${escapeHtml(d.label)}</span>
                <span class="sib-phase-date-val">${escapeHtml(val)}</span>
            </div>`;
        }).join('');
        return `
        <div class="sib-phase-row${isLast ? ' sib-phase-row--last' : ''}">
            <div class="sib-phase-track">
                <div class="sib-phase-dot" style="background:${ph.color}"></div>
                ${!isLast ? '<div class="sib-phase-line"></div>' : ''}
            </div>
            <div class="sib-phase-body">
                <div class="sib-phase-name" style="color:${ph.color}">${escapeHtml(ph.label)}</div>
                <div class="sib-phase-dates">${dateItems}</div>
            </div>
        </div>`;
    }).join('');

    return `<div class="sib-section"><div class="sib-section__label">Phase Timeline</div><div class="sib-timeline">${items}</div></div>`;
}

function renderSiblingInfoBlock(fields) {
    const rows = fields.map(f => {
        // progress bar special case
        if ((f.hn === 'progress' || f.hn === 'pct' || f.hn === 'percent') && /^\d+$/.test(f.raw)) {
            const pct = Math.min(100, Math.max(0, parseInt(f.raw, 10)));
            return `
            <div class="sib-info-row sib-info-row--progress">
                <div class="sib-info-label">${escapeHtml(f.label)}</div>
                <div class="sib-info-value" style="display:flex;align-items:center;gap:8px;">
                    <div style="flex:1;height:6px;background:var(--border-hair);border-radius:99px;overflow:hidden;">
                        <div style="height:100%;width:${pct}%;background:${streskBandedProgressColor(pct)};border-radius:99px;"></div>
                    </div>
                    <span style="font-size:12px;font-weight:700;">${pct}%</span>
                </div>
            </div>`;
        }
        return `
        <div class="sib-info-row">
            <div class="sib-info-label">${escapeHtml(f.label)}</div>
            <div class="sib-info-value">${escapeHtml(f.raw)}</div>
        </div>`;
    }).join('');
    return `<div class="sib-section"><div class="sib-section__label">Details</div><div class="sib-info-list">${rows}</div></div>`;
}

/**
 * Sibling tab: page picker + “Selected page” (sticky header) + one card per row.
 * @returns {{ controls: string, panels: string }}
 */
function buildSiblingLineItemsParts(headers, rows) {
    const nCol = headers.length
        ? headers.length
        : (rows.length ? Math.max(...rows.map((r) => r.length), 0) : 0);
    if (!nCol) return { controls: '', panels: '' };
    const hlist = headers.length
        ? headers
        : Array.from({ length: nCol }, (_, i) => `Column ${i + 1}`);

    const titleIdx = findSiblingTitleColumnIndex(hlist);
    const titles = rows.map((row) => pickSiblingRowTitle(row, titleIdx, nCol));
    const initialTitle = titles[0] != null ? String(titles[0]) : '—';

    const currentPageBlock = `
        <div class="streak-pd-sibling-current" id="streak-pd-sibling-current" aria-live="polite">
            <span class="streak-pd-sibling-title-label">Selected page</span>
            <span class="streak-pd-sibling-title-text" id="streak-pd-sibling-current-title">${escapeHtml(initialTitle)}</span>
        </div>`;

    const onePanel = (row, i) => {
        const grid = buildSiblingRowFieldsHTML(hlist, row, titleIdx, nCol);
        const vis = i === 0 ? 'block' : 'none';
        return `
        <div class="streak-sibling-panel streak-pd-sibling-panel" data-sibling-index="${i}" style="display:${vis}">
            <div class="sib-grouped-wrap">${grid}</div>
        </div>`;
    };

    const panelsInner = rows.map((row, i) => onePanel(row, i)).join('');

    if (rows.length === 1) {
        return {
            controls: currentPageBlock,
            panels: `
        <div id="streak-sibling-panels" class="streak-sibling-panels">
            ${panelsInner}
        </div>`,
        };
    }

    const sibItems = titles.map((t, i) => ({ value: String(i), label: t }));

    const siblingPickerHtml = CONFIG.CUSTOM_SELECTS
        ? atlasDD('atlas-dd-sibling-page', sibItems, '0', titles[0] || 'Page', 'sibling-page')
        : `<select id="streak-sibling-page-select" class="streak-sibling-page-select" autocomplete="off" onchange="App.showSiblingPageDetail(this.selectedIndex)">${sibItems.map(it=>`<option value="${it.value}">${escapeHtml(it.label)}</option>`).join('')}</select>`;

    return {
        controls: `
    <div class="streak-sibling-picker-wrap">
        <label class="streak-sibling-picker-label">Page</label>
        ${siblingPickerHtml}
    </div>
    ${currentPageBlock}`,
        panels: `
    <div id="streak-sibling-panels" class="streak-sibling-panels">
        ${panelsInner}
    </div>`,
    };
}

/** Pipeline: segmented green bar between stage nodes; labels on second row */
function renderStageFlow(currentStage) {
    let idx = STAGES.indexOf(currentStage);
    if (idx < 0) idx = 0;
    const rail = [];
    STAGES.forEach((label, i) => {
        if (i > 0) {
            rail.push(
                `<span class="streak-pd-rail-seg streak-pd-rail-seg--${idx >= i ? 'on' : 'off'}" aria-hidden="true"></span>`
            );
        }
        const dot = idx > i ? 'past' : idx === i ? 'here' : 'next';
        rail.push(`<span class="streak-pd-rail-pin streak-pd-rail-pin--${dot}" aria-hidden="true"></span>`);
    });

    const caps = STAGES.map((label, i) => {
        const cur = i === idx ? ' is-current' : '';
        return `<span class="streak-pd-rail-cap${cur}">${escapeHtml(label)}</span>`;
    }).join('');

    return `
    <div class="streak-pd-rail-wrap" aria-label="Delivery pipeline (${escapeHtml(STAGES[idx])})">
        <div class="streak-pd-rail-line">${rail.join('')}</div>
        <div class="streak-pd-rail-caps">${caps}</div>
    </div>`;
}

function buildStreakPdDl(rows) {
    return rows
        .map(
            ([label, val]) => `
            <div class="streak-pd-dl__row">
                <dt class="streak-pd-dl__dt">${escapeHtml(label)}</dt>
                <dd class="streak-pd-dl__dd">${escapeHtml(String(val))}</dd>
            </div>`
        )
        .join('');
}

function streakPdChipStatus(status, label) {
    return `<span class="streak-pd-chip streak-pd-chip--status streak-pd-chip--status-${escapeHtml(status)}">${escapeHtml(label)}</span>`;
}

function streakPdChipMuted(text) {
    return `<span class="streak-pd-chip streak-pd-chip--muted">${escapeHtml(text)}</span>`;
}

function streakPdChipPri(priority) {
    const pri = String(priority).toLowerCase();
    return `<span class="streak-pd-chip streak-pd-chip--pri streak-pd-chip--pri-${pri}">${escapeHtml(String(priority))} priority</span>`;
}

/** KPI numbers when roadmap rows exist; else derived from master project row only. */
function computeMetricsFromMaster(p) {
    const totalRows = Math.max(0, parseInt(String(p.total_pages ?? 0), 10) || 0);
    const done = Math.max(0, parseInt(String(p.completed_pages ?? 0), 10) || 0);
    const st = normalizeStage(p.stage || '');
    const funnel = p.funnelStage || (typeof projectFunnelStage === 'function' ? projectFunnelStage(p) : st);
    const total = totalRows > 0 ? totalRows : 1;
    // ClickUp tasks often have completed_pages=0 even when status is Live — trust stage.
    let live = Math.min(done, total);
    if ((st === 'Live' || funnel === 'Live') && live < 1) live = Math.min(1, total);
    const pendingStages = ['Backlog', 'Planning', 'Brief'];
    const pending = (pendingStages.includes(st) || pendingStages.includes(funnel))
        ? Math.min(1, Math.max(total - live, 0) || (live ? 0 : 1))
        : 0;
    const inprog = Math.max(0, total - live - pending);

    return {
        total,
        live,
        inprog,
        pending,
        avgPct: projectDisplayProgress(p),
    };
}

function buildRoadmapLegendHTML(opts = {}) {
    if (opts.clickup) {
        return `
    <div class="streak-roadmap-legend" aria-hidden="true">
        <span><i class="streak-leg streak-leg--live"></i> Live</span>
        <span><i class="streak-leg streak-leg--dev"></i> In progress</span>
        <span><i class="streak-leg streak-leg--design"></i> Brief / plan</span>
    </div>`;
    }
    return `
    <div class="streak-roadmap-legend" aria-hidden="true">
        <span><i class="streak-leg streak-leg--live"></i> Ship / live</span>
        <span><i class="streak-leg streak-leg--dev"></i> Active dev</span>
        <span><i class="streak-leg streak-leg--design"></i> Planned</span>
    </div>`;
}

/**
 * Fallback right column when sibling tab is absent or unavailable — master row + vertical milestones.
 */
function buildMasterAsideOnlyPanel(p, rel) {
    const init = getInitials(p.owner);
    const avc = stringToColor(p.owner);
    const relFg =
        rel.cls === 'overdue' ? 'var(--tone-overdue-text)' : rel.cls === 'upcoming' ? 'var(--tone-upcoming-text)' : 'var(--text-primary)';
    const shortRows = [
        ['Site / scope', p.client],
        ['Project owner', p.owner],
        ['BA', p.ba || '—'],
        ['Developer', p.developer],
        ['QA', p.qa_engineer],
        ['CMS', p.cms],
        ['Delivery', `${projectDisplayProgress(p)}%`],
        [
            'Target go-live',
            p.release_date && !/^tbd$/i.test(String(p.release_date).trim()) ? formatDate(p.release_date) : '—',
        ],
        ...(p.actual_live_date && !/^tbd$/i.test(String(p.actual_live_date).trim())
            ? [['Actual live date', formatDate(p.actual_live_date)]]
            : []),
        ...(() => {
            const dur = calcProjectDuration(p);
            if (!dur) return [];
            const label = dur.completed ? 'Total duration' : 'Running for';
            const val   = dur.days >= 30
                ? `${dur.text} (${dur.days} days)`
                : `${dur.days} day${dur.days !== 1 ? 's' : ''}`;
            return [[label, val]];
        })(),
    ];

    let notesBlk = '';
    if (p.notes) {
        notesBlk = `<div class="streak-pd-devtrack-notes">${escapeHtml(p.notes)}</div>`;
    }

    let tagsBlk = '';
    if (p.tags && p.tags.length) {
        tagsBlk = `
        <div class="streak-pd-tags streak-pd-devtrack-tags">${p.tags.map((t) => `<span class="streak-pd-tag">${escapeHtml(t)}</span>`).join('')}</div>`;
    }

    return `
    <div class="streak-sibling-panel streak-pd-aside-panel" style="display:block">
        <header class="streak-pd-aside-sticky-zone">
            <div class="streak-pd-aside-hero">
                <div class="streak-pd-aside-avatar" style="background:${avc}">${init}</div>
                <div>
                    <h2 class="streak-pd-aside-name">${escapeHtml(p.name)}</h2>
                    <p class="streak-pd-aside-kicker">Master project · <span style="color:${relFg}">${escapeHtml(rel.daysText ? rel.daysText + ' vs release' : 'schedule')}</span></p>
                </div>
            </div>
            <div class="streak-pd-devtrack-dl streak-pd-devtrack-dl--compact">${buildStreakPdDl(shortRows)}</div>
            <button type="button" class="streak-pd-aside-back" onclick="App.navigate('projects')">← Back to directory</button>
        </header>
        <div class="streak-pd-aside-scroll-body">
            <div class="streak-pd-aside-milestone">
                <h4 class="streak-pd-aside-h">Milestone timeline</h4>
                ${renderVerticalStageFlow(p.stage)}
            </div>
            ${notesBlk}
            ${tagsBlk}
        </div>
    </div>`;
}

/**
 * Snapshot grid shown in the roadmap section when no sibling tab is configured.
 * Replaces the developer-facing placeholder message with actual project data.
 */
function buildProjectSnapshot(p) {
    const fields = [
        { label: 'Project ID',     value: p.id },
        { label: 'Client / scope', value: p.client || '—' },
        { label: 'Stage',          value: p.stage || '—' },
        { label: 'Status',         value: statusLabel(p.status) },
        { label: 'Priority',       value: p.page_priority || p.priority || '—' },
        { label: 'Progress',       value: `${projectDisplayProgress(p)}%` },
        { label: 'Start date',     value: p.start_date ? formatDate(p.start_date) : '—' },
        { label: 'Target go-live', value: p.release_date && !/^tbd$/i.test(String(p.release_date).trim()) ? formatDate(p.release_date) : '—' },
        { label: 'Owner',          value: p.owner || '—' },
        { label: 'BA',             value: p.ba || '—' },
        { label: 'Developer',      value: p.developer || '—' },
        { label: 'QA',             value: p.qa_engineer || '—' },
        { label: 'CMS',            value: p.cms || '—' },
        ...(p.total_pages > 0 ? [
            { label: 'Total pages',     value: String(p.total_pages) },
            { label: 'Completed pages', value: String(p.completed_pages || 0) },
        ] : []),
        ...(p.actual_live_date && !/^tbd$/i.test(String(p.actual_live_date).trim())
            ? [{ label: 'Actual live date', value: formatDate(p.actual_live_date) }]
            : []),
        ...(() => {
            const dur = calcProjectDuration(p);
            if (!dur) return [];
            const label = dur.completed ? 'Total duration' : 'Running for';
            const val   = dur.days >= 30
                ? `${dur.text} (${dur.days} days)`
                : `${dur.days} day${dur.days !== 1 ? 's' : ''}`;
            return [{ label, value: val }];
        })(),
        ...(p.notes ? [{ label: 'Notes', value: p.notes }] : []),
    ].filter(f => f.value && f.value !== '—');

    const cells = fields.map(f => `
        <div class="streak-snapshot-field">
            <div class="streak-snapshot-label">${escapeHtml(f.label)}</div>
            <div class="streak-snapshot-value">${escapeHtml(f.value)}</div>
        </div>`).join('');

    return `
    <div class="streak-snapshot-grid">${cells}</div>
    <p class="streak-snapshot-hint">Connect a sibling tab via <code>detail_gid</code> or <code>detail_csv_url</code> to unlock the full roadmap table.</p>`;
}

function renderClickUpDeliverablesTableHTML(pages) {
    if (!pages || !pages.length) {
        return '<p class="streak-roadmap-placeholder">No subtasks on this ClickUp task yet.</p>';
    }
    const tbody = pages.map((pg, i) => {
        const pct = pg.progress || 0;
        const stageLabel = pg.funnelStage || pg.rawStage || pg.stage || '—';
        const normalized = normalizeStage(pg.stage || '');
        const bar = `
            <div class="streak-roadmap-progress">
                <div class="streak-roadmap-progress-bar" aria-hidden="true">
                    <span style="width:${pct}%"></span>
                </div>
                <span class="streak-roadmap-progress-pct">${pct}%</span>
            </div>`;
        const stPill = `<span class="stage-pill streak-roadmap-stage ${stageClass(normalized)}">${escapeHtml(stageLabel)}</span>`;
        const stat = pg.status
            ? `<span class="status-badge streak-roadmap-status ${siblingStatusKeyFromValue(pg.status)}">${escapeHtml(pg.status)}</span>`
            : '<span class="streak-roadmap-dash">—</span>';
        const sel = i === 0 ? ' streak-roadmap-row--selected' : '';
        return `
        <tr class="streak-roadmap-row${sel}" role="button" tabindex="0" data-index="${i}" data-sibling-index="${i}"
            onclick="App.showSiblingPageDetail(${i})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();App.showSiblingPageDetail(${i})}">
            <td class="streak-roadmap-cell-title">${escapeHtml(pg.page || '—')}</td>
            <td>${escapeHtml(pg.developer || '—')}</td>
            <td>${stPill}</td>
            <td>${stat}</td>
            <td>${pg.release ? escapeHtml(formatDate(pg.release)) : '<span class="streak-roadmap-dash">—</span>'}</td>
            <td class="streak-roadmap-cell-progress">${bar}</td>
        </tr>`;
    }).join('');
    return `
    <div class="streak-roadmap-table-wrap">
        <table class="streak-roadmap-table" aria-label="ClickUp deliverables">
            <thead><tr>
                <th>Deliverable</th><th>Assignee</th><th>Stage</th><th>Status</th><th>Due</th><th>Progress</th>
            </tr></thead>
            <tbody>${tbody}</tbody>
        </table>
    </div>`;
}

function buildClickUpAsidePanels(p, detail, pages) {
    const rel = getRelativeDate(p.release_date);
    const relFg = rel.overdue ? 'var(--status-delayed)' : 'var(--text-muted)';
    const init = getInitials(p.owner);
    const avc = stringToColor(p.owner);

    let checklistsHtml = '';
    if (detail.checklists && detail.checklists.length) {
        const items = detail.checklists.map(cl => {
            const rows = (cl.items || []).map(it => `
                <li class="streak-cu-check-item ${it.resolved ? 'streak-cu-check-item--done' : ''}">
                    ${it.resolved ? '✓' : '○'} ${escapeHtml(it.name || '')}
                </li>`).join('');
            return `<div class="streak-cu-checklist"><div class="streak-cu-checklist-name">${escapeHtml(cl.name || 'Checklist')}</div><ul>${rows}</ul></div>`;
        }).join('');
        checklistsHtml = `<div class="streak-pd-aside-block"><h4 class="streak-pd-aside-h">Checklists</h4>${items}</div>`;
    }

    let customFieldsHtml = '';
    const cfs = (detail.customFields || []).filter(f => f.value != null && f.value !== '');
    if (cfs.length) {
        const rows = cfs.map(f => `
            <div class="streak-pd-devtrack-dl-row">
                <dt>${escapeHtml(f.name || '')}</dt>
                <dd>${escapeHtml(String(f.value))}</dd>
            </div>`).join('');
        customFieldsHtml = `<div class="streak-pd-aside-block"><h4 class="streak-pd-aside-h">Custom fields</h4><dl class="streak-pd-devtrack-dl streak-pd-devtrack-dl--compact">${rows}</dl></div>`;
    }

    let tagsBlk = '';
    const tags = detail.tags || p.tags || [];
    if (tags.length) {
        tagsBlk = `<div class="streak-pd-tags streak-pd-devtrack-tags">${tags.map(t => `<span class="streak-pd-tag">${escapeHtml(typeof t === 'string' ? t : (t.name || t))}</span>`).join('')}</div>`;
    }

    const pagePanels = (pages || []).map((pg, i) => {
        const display = i === 0 ? 'block' : 'none';
        return `
        <div class="streak-sibling-panel streak-pd-aside-panel" data-sibling-index="${i}" style="display:${display}">
            <header class="streak-pd-aside-sticky-zone">
                <div class="streak-pd-aside-hero">
                    <div class="streak-pd-aside-avatar" style="background:${stringToColor(pg.developer || p.owner)}">${getInitials(pg.developer || p.owner)}</div>
                    <div>
                        <h2 class="streak-pd-aside-name">${escapeHtml(pg.page || 'Deliverable')}</h2>
                        <p class="streak-pd-aside-kicker">${escapeHtml(pg.rawStage || pg.stage || '')} · ${pg.progress || 0}%</p>
                    </div>
                </div>
            </header>
            <div class="streak-pd-aside-scroll-body">
                ${buildStreakPdDl([
                    ['Assignee', pg.developer || '—'],
                    ['Due', pg.release ? formatDate(pg.release) : '—'],
                    ['Status', pg.status || '—'],
                    ['Progress', `${pg.progress || 0}%`],
                ])}
            </div>
        </div>`;
    }).join('');

    const pageSelect = pages && pages.length > 1 ? `
        <label class="streak-pd-aside-h" for="streak-sibling-page-select">Deliverable</label>
        <select id="streak-sibling-page-select" class="streak-pd-aside-select" onchange="App.showSiblingPageDetail(this.selectedIndex)">
            ${pages.map((pg, i) => `<option value="${i}">${escapeHtml(pg.page || `Item ${i + 1}`)}</option>`).join('')}
        </select>` : '';

    const openLink = detail.url
        ? `<a class="streak-pd-action-btn" href="${escapeHtml(detail.url)}" target="_blank" rel="noopener">Open in ClickUp ↗</a>`
        : '';

    return `
    <div id="streak-sibling-panels" class="streak-sibling-panels streak-pd-aside-panels-inner">
        ${pages && pages.length ? pagePanels : `
        <div class="streak-sibling-panel streak-pd-aside-panel" style="display:block">
            <header class="streak-pd-aside-sticky-zone">
                <div class="streak-pd-aside-hero">
                    <div class="streak-pd-aside-avatar" style="background:${avc}">${init}</div>
                    <div>
                        <h2 class="streak-pd-aside-name">${escapeHtml(p.name)}</h2>
                        <p class="streak-pd-aside-kicker">ClickUp task · <span style="color:${relFg}">${escapeHtml(rel.daysText ? rel.daysText + ' vs due' : 'schedule')}</span></p>
                    </div>
                </div>
                ${openLink}
                <button type="button" class="streak-pd-aside-back" onclick="App.navigate('projects')">← Back to directory</button>
            </header>
            <div class="streak-pd-aside-scroll-body">
                ${checklistsHtml}
                ${customFieldsHtml}
                ${tagsBlk}
                ${p.notes ? `<div class="streak-pd-devtrack-notes">${escapeHtml(p.notes)}</div>` : ''}
            </div>
        </div>`}
        ${pages && pages.length ? `
        <div class="streak-sibling-panel streak-pd-aside-panel streak-pd-aside-panel--nav" style="display:block;margin-top:12px;">
            ${pageSelect}
            ${openLink}
            <button type="button" class="streak-pd-aside-back" onclick="App.navigate('projects')">← Back to directory</button>
        </div>` : ''}
    </div>`;
}

function buildClickUpTaskSnapshot(p, detail) {
    const stageLabel = p.funnelStage
        || (typeof projectFunnelStage === 'function' ? projectFunnelStage(p) : null)
        || p.rawStage
        || p.stage
        || '—';
    const rawHint = (p.rawStage && String(p.rawStage).toLowerCase() !== String(stageLabel).toLowerCase())
        ? ` (${p.rawStage})`
        : '';
    const creatorMode = typeof isContentCreatorWorkspace === 'function' && isContentCreatorWorkspace();
    const peopleLabel = creatorMode
        ? ((typeof getContentCreatorRoleName === 'function' ? getContentCreatorRoleName() : 'Content Creator'))
        : 'Owner';
    const peopleValue = creatorMode
        ? (p.developer && p.developer !== 'Unassigned' ? p.developer : (p.owner || '—'))
        : (p.owner || '—');

    const fields = [
        { label: 'Task ID', value: p.id },
        { label: 'Client', value: p.client || '—' },
        { label: 'Stage', value: `${stageLabel}${rawHint}` },
        { label: 'Status', value: statusLabel(p.status) },
        { label: 'Progress', value: `${projectDisplayProgress(p)}%` },
        { label: 'Due date', value: p.release_date ? formatDate(p.release_date) : '—' },
        { label: peopleLabel, value: peopleValue },
    ].filter(f => f.value && f.value !== '—');

    const cells = fields.map(f => `
        <div class="streak-snapshot-field">
            <div class="streak-snapshot-label">${escapeHtml(f.label)}</div>
            <div class="streak-snapshot-value">${escapeHtml(f.value)}</div>
        </div>`).join('');

    let extra = '';
    if (detail.description || p.notes) {
        extra += `<div class="streak-pd-devtrack-notes streak-snapshot-notes">${escapeHtml(detail.description || p.notes)}</div>`;
    }

    return `
    <div class="streak-snapshot-block">
        <div class="streak-snapshot-grid">${cells}</div>
        ${extra}
        <div class="streak-snapshot-footer">
            <p class="streak-snapshot-hint">Add subtasks in ClickUp to unlock deliverable-level funnel and analytics.</p>
        </div>
    </div>`;
}

/**
 * Shared data for both project layouts (switch via CONFIG.PROJECT_PAGE_LAYOUT).
 * @param {object} p
 * @param {object} siblingResult
 */
function buildProjectPageViewModel(p, siblingResult) {
    const rel = getRelativeDate(p.release_date);

    let roadmapInner = buildProjectSnapshot(p);

    /** @type {string} */
    let asidePanels = buildMasterAsideOnlyPanel(p, rel);

    let mm = computeMetricsFromMaster(p);
    let kTotal = mm.total || (mm.live + mm.inprog + mm.pending || 1);
    let kLive = mm.live;
    let kProg = mm.inprog;
    let kPend = mm.pending;
    let kAvg = mm.avgPct;

    let hasRoadmapRows = false;

    const oneSentence = statusLabel(p.status);

    let siblingWarning = '';

    /** @type {{ controls: string, panels: string } | null} */
    let classicSibling = null;

    if (siblingResult.source === 'error') {
        siblingWarning = `<div class="streak-roadmap-banner streak-roadmap-banner--warn">${escapeHtml(siblingResult.error || 'Could not load line items')}</div>`;
    } else if (siblingResult.clickup && siblingResult.pages && siblingResult.pages.length) {
        kTotal = siblingResult.total || siblingResult.pages.length;
        kLive = siblingResult.live;
        kProg = siblingResult.inprog;
        kPend = siblingResult.pending;
        kAvg = siblingResult.avgPct;
        roadmapInner = siblingWarning + renderClickUpDeliverablesTableHTML(siblingResult.pages);
        asidePanels = buildClickUpAsidePanels(p, siblingResult, siblingResult.pages);
        hasRoadmapRows = true;
    } else if (siblingResult.clickup) {
        roadmapInner = buildClickUpTaskSnapshot(p, siblingResult);
        asidePanels = buildClickUpAsidePanels(p, siblingResult, []);
        hasRoadmapRows = false;
    } else if (siblingResult.hasSibling && siblingResult.table) {
        const { headers, rows } = siblingResult.table;
        const nCol = headers.length
            ? headers.length
            : rows.length
              ? Math.max(...rows.map((r) => r.length), 0)
              : 0;
        const hlist =
            headers.length > 0
                ? headers
                : nCol > 0
                  ? Array.from({ length: nCol }, (_, i) => `Column ${i + 1}`)
                  : [];

        if (nCol > 0 && rows.length > 0) {
            const titleIdx = findSiblingTitleColumnIndex(hlist);
            const rm = computeRoadmapMetrics(p, hlist, rows);
            kTotal = rm.total;
            kLive = rm.live;
            kProg = rm.inprog;
            kPend = rm.pending;
            kAvg = rm.avgPct;

            roadmapInner = siblingWarning + renderRoadmapTableHTML(hlist, rows, rm, nCol);
            asidePanels = `
            <div id="streak-sibling-panels" class="streak-sibling-panels streak-pd-aside-panels-inner">
                ${buildDevTrackAsidePanels(hlist, rows, titleIdx, nCol)}
            </div>`;
            classicSibling = buildSiblingLineItemsParts(hlist, rows);
            hasRoadmapRows = true;
        } else if (nCol > 0 && !rows.length) {
            roadmapInner = `<p class="streak-roadmap-placeholder">The linked tab is published but has no rows yet.</p>`;
        }
    }

    if (siblingResult.source === 'error' && !hasRoadmapRows) {
        roadmapInner = siblingWarning + roadmapInner;
    }

    const isClickUp = !!(siblingResult.clickup
        || (typeof isClickUpWorkspace === 'function' && isClickUpWorkspace(AppState?.activeWorkspace)));

    return {
        rel,
        roadmapInner,
        asidePanels,
        kTotal,
        kLive,
        kProg,
        kPend,
        kAvg,
        hasRoadmapRows,
        oneSentence,
        siblingWarning,
        classicSibling,
        masterProgress: projectDisplayProgress(p),
        isClickUp,
        clickupUrl: siblingResult.url || p.clickupMeta?.url || '',
    };
}

function renderProjectPageDevtrack(p, vm) {
    const metricCard = (label, value, sub) => `
        <div class="streak-pd-metric">
            <div class="streak-pd-metric__label">${escapeHtml(label)}</div>
            <div class="streak-pd-metric__value">${escapeHtml(String(value))}</div>
            ${sub ? `<div class="streak-pd-metric__sub">${sub}</div>` : ''}
        </div>`;

    const clickUp = !!vm.isClickUp;
    const hasRows = !!vm.hasRoadmapRows;
    const metrics = clickUp
        ? [
            metricCard(hasRows ? 'Deliverables' : 'Tasks', vm.kTotal, hasRows ? 'subtasks on this campaign' : 'this ClickUp task'),
            metricCard('Live', vm.kLive, 'completed / live'),
            metricCard('In progress', vm.kProg, 'active delivery'),
            metricCard('Pending', vm.kPend, 'brief & planning'),
            metricCard('Progress', `${hasRows ? vm.kAvg : vm.masterProgress}%`, hasRows ? 'avg from deliverables' : 'task progress'),
        ].join('')
        : [
            metricCard('Total pages', vm.kTotal, 'rows in roadmap'),
            metricCard('Pages live', vm.kLive, 'stage at Live'),
            metricCard('In progress', vm.kProg, 'active delivery'),
            metricCard('Pending / plan', vm.kPend, 'backlog & planning'),
            metricCard('Delivery progress', `${hasRows ? vm.kAvg : vm.masterProgress}%`, hasRows ? 'avg from roadmap rows' : 'master project %'),
        ].join('');

    const roadmapTitle = clickUp
        ? (hasRows ? 'Deliverables' : 'Campaign details')
        : 'Development roadmap';
    const roadmapSub = clickUp
        ? (hasRows
            ? 'Select a deliverable to update the details panel.'
            : 'Overview of this ClickUp task. Add subtasks for a deliverable table.')
        : 'Select a row to update the page details panel.';
    const legend = hasRows || !clickUp ? buildRoadmapLegendHTML({ clickup: clickUp }) : '';
    const openClickUp = clickUp && vm.clickupUrl
        ? `<a class="streak-pd-action-btn" href="${escapeHtml(vm.clickupUrl)}" target="_blank" rel="noopener" title="Open in ClickUp">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        Open in ClickUp
                    </a>`
        : '';

    return `
    <div class="streak-project-page streak-project-page--devtrack">
        <div class="streak-pd-shell streak-pd-shell--devtrack">
            <nav class="streak-pd-toprow" aria-label="Project navigation">
                <button type="button" class="streak-pd-back streak-pd-back--text" onclick="App.navigate('projects')">
                    <span class="streak-pd-back__icon" aria-hidden="true">←</span>
                    All projects
                </button>
                <span class="streak-pd-crumb">${escapeHtml(p.id)}</span>
                <div class="streak-pd-toprow-actions">
                    ${renderVisitWebsiteBtn(p)}
                    <button type="button" class="streak-pd-action-btn" onclick="App.copyProjectLink('${escapeHtml(p.id)}')" title="Copy link to this project">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        Copy link
                    </button>
                    ${openClickUp}
                    ${!clickUp && CONFIG.SHEET_CSV_URL ? `<a class="streak-pd-action-btn" href="${CONFIG.SHEET_CSV_URL.replace(/pub\?output=csv.*/, 'edit')}" target="_blank" rel="noopener" title="Open source sheet">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        Open in Sheets
                    </a>` : ''}
                </div>
            </nav>

            <header class="streak-pd-devtrack-header">
                <p class="streak-pd-devtrack-hi">Projects <span class="streak-pd-devtrack-sep">/</span> ${escapeHtml(p.id)}</p>
                <h1 class="streak-pd-devtrack-title">${escapeHtml(p.name)}</h1>
                <p class="streak-pd-devtrack-sub">${escapeHtml(p.client || '—')} · ${escapeHtml(vm.oneSentence)}</p>
                <div class="streak-pd-metrics">${metrics}</div>
            </header>

            ${renderPageSpeedPanel(p)}

            <div class="streak-pd-devtrack-split">
                <section class="streak-pd-devtrack-main" aria-labelledby="roadmap-h">
                    <div class="streak-pd-roadmap-card">
                        <div class="streak-roadmap-card-head">
                            <div>
                                <h2 id="roadmap-h" class="streak-roadmap-h">${roadmapTitle}</h2>
                                <p class="streak-roadmap-sub">${roadmapSub}</p>
                            </div>
                            ${legend}
                        </div>
                        <div class="${hasRows ? 'streak-roadmap-table-wrap' : 'streak-roadmap-body'}">
                            ${vm.roadmapInner}
                        </div>
                    </div>
                </section>
                <aside class="streak-pd-detail-aside" aria-label="${clickUp ? 'Task details' : 'Page details'}">
                    ${vm.asidePanels}
                </aside>
            </div>
        </div>
    </div>`;
}

function renderProjectPageClassic(p, vm) {
    const normSt = normalizeStage(p.stage || '');
    const releaseEmph =
        p.release_date && !/^tbd$/i.test(String(p.release_date).trim())
            ? formatDate(p.release_date)
            : '—';
    const init = getInitials(p.owner);
    const avc = stringToColor(p.owner);

    const chips = [
        streakPdChipStatus(p.status, vm.oneSentence),
        streakPdChipMuted(escapeHtml(normSt)),
        streakPdChipPri(p.page_priority),
    ].join('');

    let tagsBlk = '';
    if (p.tags && p.tags.length) {
        tagsBlk = `
        <section class="streak-pd-panel streak-pd-panel--inline" aria-label="Tags">
            <span class="streak-pd-panel__inline-label">Tags</span>
            <div class="streak-pd-taglist">${p.tags.map((t) => `<span class="streak-pd-tag">${escapeHtml(t)}</span>`).join('')}</div>
        </section>`;
    }

    let notesBlk = '';
    if (p.notes && String(p.notes).trim()) {
        notesBlk = `
        <section class="streak-pd-panel streak-pd-panel--note" aria-label="Notes">
            <div class="streak-pd-panel__h">Notes</div>
            <div class="streak-pd-notebody">${escapeHtml(p.notes)}</div>
        </section>`;
    }

    const scopeRows = [
        ['Site / scope', p.client || '—'],
        ...(projectWebsiteUrl(p)
            ? [['Website', websiteHostname(projectWebsiteUrl(p)) || projectWebsiteUrl(p)]]
            : []),
        ['Start', p.start_date && String(p.start_date).trim() ? formatDate(p.start_date) : '—'],
        [
            'Target go-live',
            p.release_date && !/^tbd$/i.test(String(p.release_date).trim()) ? formatDate(p.release_date) : '—',
        ],
        ...(p.actual_live_date && !/^tbd$/i.test(String(p.actual_live_date).trim())
            ? [['Actual live date', formatDate(p.actual_live_date)]]
            : []),
        ...(() => {
            const dur = calcProjectDuration(p);
            if (!dur) return [];
            const label = dur.completed ? 'Total duration' : 'Running for';
            const val   = dur.days >= 30
                ? `${dur.text} (${dur.days} days)`
                : `${dur.days} day${dur.days !== 1 ? 's' : ''}`;
            return [[label, val]];
        })(),
    ];
    const teamRows = [
        ['Project owner', p.owner],
        ['Page owner', p.page_owner || '—'],
        ['BA', p.ba || '—'],
        ['Developer', p.developer || '—'],
        ['QA', p.qa_engineer || '—'],
        ['CMS', p.cms || '—'],
    ];

    let lineItemsBody = '';
    if (vm.classicSibling && vm.hasRoadmapRows) {
        lineItemsBody = `
        <div class="streak-pd-lineitems-sticky">
            ${vm.classicSibling.controls}
        </div>
        <div class="streak-pd-lineitems-body">
            ${vm.classicSibling.panels}
        </div>`;
    } else if (!vm.hasRoadmapRows) {
        lineItemsBody = `
        <div class="streak-pd-panel">
            <div class="streak-pd-block-title">Milestone timeline</div>
            ${renderVerticalStageFlow(p.stage)}
        </div>`;
    }

    return `
    <div class="streak-project-page streak-project-page--refined">
        <div class="streak-pd-shell">
            <nav class="streak-pd-topbar streak-pd-topbar--flex" aria-label="Project navigation">
                <button type="button" class="streak-pd-back" onclick="App.navigate('projects')">← Back to directory</button>
                <div class="streak-pd-toprow-actions">
                    ${renderVisitWebsiteBtn(p)}
                    <button type="button" class="streak-pd-action-btn" onclick="App.copyProjectLink('${escapeHtml(p.id)}')" title="Copy link to this project">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        Copy link
                    </button>
                    ${CONFIG.SHEET_CSV_URL ? `<a class="streak-pd-action-btn" href="${CONFIG.SHEET_CSV_URL.replace(/pub\?output=csv.*/, 'edit')}" target="_blank" rel="noopener">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        Open in Sheets
                    </a>` : ''}
                </div>
            </nav>

            <div class="streak-pd">
                <section class="streak-pd-intro" aria-labelledby="proj-title">
                    <div>
                        <p class="streak-pd-kicker">${escapeHtml(p.id)}</p>
                        <h1 id="proj-title" class="streak-pd-title streak-pd-title--compact">${escapeHtml(p.name)}</h1>
                        <div class="streak-pd-intro__chips">${chips}</div>
                    </div>
                    <div class="streak-pd-intro__meter">
                        <div class="streak-pd-meter__label">
                            <span class="streak-pd-meter__word">Delivery progress</span>
                            <span class="streak-pd-meter__pct">${vm.hasRoadmapRows ? vm.kAvg : vm.masterProgress}%</span>
                        </div>
                        <div class="progress-track streak-pd-meter-track">
                            <div class="progress-fill" style="width:0%;background:${streskStatusBarColor(p.status)}" data-fill="${vm.hasRoadmapRows ? vm.kAvg : vm.masterProgress}"></div>
                        </div>
                    </div>
                </section>

                <div class="streak-pd-stagepipe-wrap">${renderStageFlow(normSt)}</div>

                <div class="streak-pd-pulse" aria-label="Snapshot">
                    <div class="streak-pd-pulsecard streak-pd-pulsecard--accent" data-status="${escapeHtml(p.status)}">
                        <div class="streak-pd-pulsecard__ttl">Target release</div>
                        <div class="streak-pd-pulsecard__emph streak-pd-pulsecard__emph--date">${escapeHtml(releaseEmph)}</div>
                        <p class="streak-pd-pulsecard__hint">${escapeHtml(vm.rel.daysText || '')}</p>
                    </div>
                    <div class="streak-pd-pulsecard">
                        <div class="streak-pd-pulsecard__ttl">Health</div>
                        <div class="streak-pd-pulsecard__emph streak-pd-pulsecard__emph--status">${escapeHtml(vm.oneSentence)}</div>
                        <p class="streak-pd-pulsecard__hint">${escapeHtml(vm.rel.daysText ? vm.rel.daysText + ' to release' : 'No release date set')}</p>
                    </div>
                    <div class="streak-pd-pulsecard">
                        <div class="streak-pd-pulsecard__ttl">Project owner</div>
                        <div class="streak-pd-leadrow">
                            <div class="streak-pd-avatar-mini" style="background:${avc}">${init}</div>
                            <div class="streak-pd-leadname">${escapeHtml(p.owner)}</div>
                        </div>
                    </div>
                </div>

                ${renderPageSpeedPanel(p)}

                <section class="streak-pd-panel" aria-labelledby="scope-h">
                    <h2 id="scope-h" class="streak-pd-panel__h">Scope &amp; timeline</h2>
                    <div class="streak-pd-dl">${buildStreakPdDl(scopeRows)}</div>
                </section>
                <section class="streak-pd-panel" aria-labelledby="team-h">
                    <h2 id="team-h" class="streak-pd-panel__h">People &amp; tooling</h2>
                    <div class="streak-pd-dl">${buildStreakPdDl(teamRows)}</div>
                </section>
                ${tagsBlk}
                ${notesBlk}

                <section class="streak-pd-subsection streak-pd-lineitems" aria-labelledby="line-h">
                    <div class="streak-pd-panel__h" style="margin-bottom:14px;font-size:14px;color:var(--text-primary);letter-spacing:normal;text-transform:none" id="line-h">
                        Development roadmap &amp; line items</div>
                    <p class="streak-pd-lineintro streak-pd-lineintro--muted">${vm.hasRoadmapRows ? 'Select a roadmap row or use the page control to inspect fields for that line.' : vm.siblingWarning ? 'Roadmap linked tab had an issue — details below.' : 'Roadmap pulls from your linked sibling tab when configured on the sheet.'}</p>
                    <div class="streak-roadmap-table-wrap" style="margin-top:14px">${vm.roadmapInner}</div>
                    ${lineItemsBody}
                </section>
            </div>
        </div>
    </div>`;
}

function renderProjectPage(p, siblingResult) {
    const vm = buildProjectPageViewModel(p, siblingResult);
    if (CONFIG.PROJECT_PAGE_LAYOUT === 'classic') {
        return renderProjectPageClassic(p, vm);
    }
    return renderProjectPageDevtrack(p, vm);
}

/* ══════════════════════════════════════════════════════════
   VIEW: INTELLIGENCE — Resource & forecasting hub
══════════════════════════════════════════════════════════ */
function attentionTierMeta(tier) {
    const map = {
        critical: { label: 'Critical', color: '#D93025', bg: 'rgba(217,48,37,0.12)' },
        high:     { label: 'High',     color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
        medium:   { label: 'Medium',   color: '#1A73E8', bg: 'rgba(26,115,232,0.1)' },
        low:      { label: 'Low',      color: '#5F6368', bg: 'rgba(0,0,0,0.05)' },
    };
    return map[tier] || map.low;
}

function renderAttentionTierPill(tier) {
    if (!intelligenceEnabled() || !tier || tier === 'low') return '';
    const m = attentionTierMeta(tier);
    return `<span class="intel-tier-pill" style="background:${m.bg};color:${m.color};border:1px solid ${m.color}40;">${m.label}</span>`;
}

function renderOverviewAttentionStrip() {
    if (!intelligenceEnabled()) return '';
    const top = AppState.attentionRanked.filter(p => p.attentionTier === 'critical' || p.attentionTier === 'high').slice(0, 3);
    if (!top.length) return '';
    const chips = top.map(p => {
        const m = attentionTierMeta(p.attentionTier);
        return `
        <div class="ov-attn-chip" onclick="App.handleCardClick('${p.id}')" style="border-color:${m.color}40;">
            <span class="ov-attn-score" style="color:${m.color}">${p.attentionScore}</span>
            <div class="ov-attn-body">
                <div class="ov-attn-name">${escapeHtml(p.name)}</div>
                <div class="ov-attn-reason">${escapeHtml((p.attentionReasons || [])[0] || '')}</div>
            </div>
        </div>`;
    }).join('');
    return `
    <div class="ov-attn-strip-wrap">
        <div class="ov-section-header" style="margin-bottom:8px;">
            <h2 class="ov-section-title">Attention scores</h2>
            <button type="button" class="ov-link-btn" onclick="App.navigate('intelligence')">Open Intelligence →</button>
        </div>
        <div class="ov-attn-strip">${chips}</div>
    </div>`;
}

function renderIntelligence() {
    if (!intelligenceEnabled()) {
        return `
        <div class="view-header">
            <div class="view-title">Intelligence</div>
            <div class="view-subtitle">Enable RESOURCE_INTELLIGENCE in config to use predictive resource intelligence.</div>
        </div>`;
    }

    const today = new Date(); today.setHours(0,0,0,0);
    function fmtDate(d) {
        if (!d || isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    const intel = AppState.deliveryIntelligence || {};
    const sum = intel.intelligenceSummary || AppState.intelligenceSummary || {};
    const ranked = (intel.attentionRanked || AppState.attentionRanked).slice(0, 12);
    const cap = intel.capacityForecast || AppState.capacityForecast;
    const intake = intel.intakeRecommendation || AppState.intakeRecommendation || {};
    const creatorMode = typeof isContentCreatorWorkspace === 'function' && isContentCreatorWorkspace();
    const primaryRole = typeof getPrimaryWorkRole === 'function' ? getPrimaryWorkRole() : 'Developer';
    const intakeTiers = intake.tiers || {};

    const kpiTiles = [
        { 
            label: 'At-Risk Projects', 
            value: sum.attention_critical ?? 0, 
            sub: 'Need immediate manager review', 
            cls: (sum.attention_critical > 0) ? 'intel-kpi--risk' : '' 
        },
        { 
            label: 'Staff Freeing Up (30d)', 
            value: sum.freeing_next_30 ?? 0, 
            sub: 'Ready for new assignments soon', 
            cls: '' 
        },
        { 
            label: 'Average Team Workload', 
            value: `${sum.avg_utilization_pct ?? 0}%`, 
            sub: 'Healthy target is 60% to 80%', 
            cls: '' 
        },
        { 
            label: 'Safe Small Starts', 
            value: intake.small ?? 0, 
            sub: creatorMode
                ? `1 ${primaryRole} · 30-day campaign`
                : '1 Developer · 30-day project', 
            cls: (intake.small ?? 0) === 0 ? 'intel-kpi--muted' : '' 
        },
        { 
            label: 'Safe Medium Starts', 
            value: intake.medium ?? 0, 
            sub: creatorMode
                ? `2 ${primaryRole}s · 60-day campaign`
                : '2 Devs + QA · 60-day project', 
            cls: (intake.medium ?? 0) === 0 ? 'intel-kpi--muted' : '' 
        },
        { 
            label: 'Hiring Advisor', 
            value: sum.bench_risk ? 'Bench Risk (Idle)' : (sum.hiring_signal ? 'Hire Recommended' : 'Staffing Balanced'), 
            sub: sum.hiring_signal ? 'Workload is high; role shortage' : 'Staff capacity matches workload', 
            cls: sum.hiring_signal ? 'intel-kpi--warn' : '' 
        },
    ].map(k => `
        <div class="intel-kpi-tile card-light ${k.cls}" style="display:flex;flex-direction:column;justify-content:space-between;min-height:100px;">
            <div>
                <div class="intel-kpi-val" style="font-size:24px;line-height:1.2;margin-bottom:2px;">${k.value}</div>
                <div class="intel-kpi-lbl" style="font-size:12px;font-weight:700;color:var(--text-primary);letter-spacing:normal;text-transform:none;margin:0;">${k.label}</div>
            </div>
            <div class="intel-kpi-sub" style="font-size:11px;color:var(--text-muted);margin-top:6px;line-height:1.3;">${k.sub}</div>
        </div>`).join('');

    const attentionRows = ranked.length ? ranked.map(p => {
        const m = attentionTierMeta(p.attentionTier);
        const reasons = (p.attentionReasons || []).join(' · ');
        
        // Simple human-readable explanation of risk level
        const riskLabel = p.attentionTier === 'critical' ? 'Critical Risk' : p.attentionTier === 'high' ? 'High Risk' : p.attentionTier === 'medium' ? 'Medium Risk' : 'Low Risk';
        
        return `
        <div class="intel-attn-row" onclick="App.handleCardClick('${p.id}')" style="align-items:center;">
            <div class="intel-attn-score" style="background:${m.bg};color:${m.color};display:flex;flex-direction:column;justify-content:center;align-items:center;line-height:1.1;border-radius:10px;">
                <span style="font-size:16px;font-weight:800;">${p.attentionScore}</span>
                <span style="font-size:8px;text-transform:uppercase;font-weight:700;opacity:0.8;">Risk</span>
            </div>
            <div class="intel-attn-main" style="margin-left:4px;">
                <div class="intel-attn-name" style="font-size:14px;font-weight:700;">${escapeHtml(p.name)}</div>
                <div class="intel-attn-meta" style="font-size:11px;margin-top:2px;">Stage: <strong>${escapeHtml(p.stage)}</strong> &nbsp;·&nbsp; Lead: <strong>${escapeHtml(p.owner || '—')}</strong></div>
                <div class="intel-attn-reasons" style="font-size:11px;color:#d93025;margin-top:4px;font-weight:500;display:flex;align-items:flex-start;gap:6px;"><span class="ui-inline-icon" aria-hidden="true">${Icons.alert}</span><span>${escapeHtml(reasons)}</span></div>
            </div>
            <span class="intel-tier-pill" style="background:${m.bg};color:${m.color};border:1px solid ${m.color}40;font-size:10px;font-weight:700;padding:4px 8px;border-radius:8px;">${riskLabel}</span>
        </div>`;
    }).join('') : `<div class="intel-empty intel-empty--ok"><span class="ui-inline-icon" aria-hidden="true">${Icons.checkCircle}</span> All active projects are running smoothly. No scored risks.</div>`;

    const releaseTab = AppState.intelReleaseTab || 'now';
    const freeNowList = (cap.summary?.freeNow || []);
    const freeing30List = (cap.summary?.freeingNext30 || []);
    const releasePeople = releaseTab === '30d' ? freeing30List : freeNowList;

    function renderIntelReleaseRow(p, mode) {
        const init = getInitials(p.name);
        const avc  = stringToColor(p.name);
        const chipClass = mode === 'now' ? 'res-free-chip--now' : 'res-free-chip--work';
        const chipLabel = mode === 'now'
            ? 'Available now'
            : (p.freeFrom ? `Available ${fmtDate(parseSmartDate(p.freeFrom))}` : 'Available soon');
        return `
        <div class="intel-release-row">
            <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
                <div class="res-tbl-avatar" style="background:${avc};width:30px;height:30px;font-size:10px;font-weight:700;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${init}</div>
                <div style="min-width:0;">
                    <div class="intel-release-name" style="font-weight:700;font-size:13px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(p.name)}</div>
                    <div class="intel-release-roles" style="font-size:11px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml((p.roles || []).join(', '))}</div>
                </div>
            </div>
            <div class="res-free-chip ${chipClass}" style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;white-space:nowrap;">
                ${escapeHtml(chipLabel)}
            </div>
        </div>`;
    }

    const releaseEmpty = releaseTab === '30d'
        ? 'Nobody is scheduled to roll off projects in the next 30 days.'
        : 'No team members are free right now.';
    const releaseHTML = releasePeople.length
        ? releasePeople.slice(0, 15).map(p => renderIntelReleaseRow(p, releaseTab)).join('')
        : `<div class="intel-empty">${releaseEmpty}</div>`;

    const releaseTabs = [
        ['now', 'Free now', freeNowList.length],
        ['30d', 'Free in 30 days', freeing30List.length],
    ].map(([id, lbl, count]) => `
        <button type="button" class="tl-tab ${releaseTab === id ? 'tl-tab--active' : ''}"
            onclick="App.setIntelReleaseTab('${id}')">${escapeHtml(lbl)} <span class="intel-release-tab-count">${count}</span></button>`).join('');

    const roles = cap.roles || {};
    const intelRoles = typeof getIntelRoles === 'function' ? getIntelRoles() : ['Developer', 'QA', 'BA', 'Owner', 'Page owner'];
    const heatHTML = intelRoles.map(role => {
        const r = roles[role];
        if (!r || !r.weeks?.length) return '';
        const cells = r.weeks.slice(0, 13).map(w => {
            const u = w.utilizationPct;
            // green (low load), blue (moderate), yellow (busy), red (fully booked)
            const bg = u >= 85 ? '#D93025' : u >= 60 ? '#F9AB00' : u >= 40 ? '#1A73E8' : '#1E8E3E';
            const op = u === 0 ? 0.08 : 0.25 + (u / 100) * 0.75;
            const weekLabel = `Week of ${fmtDate(new Date(today.getTime() + w.weekIndex * 7 * 24 * 60 * 60 * 1000))}`;
            return `<div class="intel-heat-cell" title="${role} (${weekLabel}): ${u}% busy" style="background:${bg};opacity:${op};cursor:help;"></div>`;
        }).join('');
        return `
        <div class="intel-heat-row" style="margin-bottom:8px;">
            <div class="intel-heat-role" style="font-weight:700;font-size:12px;width:110px;">${escapeHtml(role)}</div>
            <div class="intel-heat-cells">${cells}</div>
        </div>`;
    }).join('');

    const utilHorizons = [30, 60, 90].map(days => {
        const weekIdx = Math.min(12, Math.floor(days / 7));
        const bars = intelRoles.map(role => {
            const w = roles[role]?.weeks?.[weekIdx];
            const pct = w?.utilizationPct ?? 0;
            const barBg = pct >= 85 ? '#D93025' : pct >= 60 ? '#F9AB00' : '#1A73E8';
            return `
            <div class="intel-util-bar-row" style="grid-template-columns: 85px 1fr 35px;gap:10px;margin-bottom:8px;">
                <span class="intel-util-lbl" style="font-weight:600;font-size:11px;">${escapeHtml(role)}</span>
                <div class="intel-util-track" style="height:8px;border-radius:4px;background:var(--border-light);overflow:hidden;"><div class="intel-util-fill" style="width:${pct}%;background:${barBg};height:100%;border-radius:4px;"></div></div>
                <span class="intel-util-pct" style="font-weight:700;font-size:11px;text-align:right;">${pct}%</span>
            </div>`;
        }).join('');
        return `
        <div class="intel-util-card card-light" style="padding:18px;border-radius:16px;">
            <div class="intel-util-title" style="font-size:14px;font-weight:800;margin-bottom:14px;border-bottom:1px solid var(--border-light);padding-bottom:6px;">${sectionTitleWithIcon(Icons.trendUp, `Workload in ${days} days`)}</div>
            ${bars}
        </div>`;
    }).join('');

    const intakeCardDefs = creatorMode
        ? [
            { key: 'small',  label: 'Small campaigns',  need: `1 ${primaryRole}`,  lasts: '30 days' },
            { key: 'medium', label: 'Medium campaigns', need: `2 ${primaryRole}s`, lasts: '60 days' },
            { key: 'large',  label: 'Large programs',   need: `3 ${primaryRole}s`, lasts: '90 days' },
        ]
        : [
            { key: 'small',  label: 'Small projects',  need: '1 Developer',           lasts: '30 days' },
            { key: 'medium', label: 'Medium projects', need: '2 Developers + 1 QA',  lasts: '60 days' },
            { key: 'large',  label: 'Large programs',  need: 'Dev + QA + BA',         lasts: '90 days' },
        ];

    const intakeCards = intakeCardDefs.map(c => {
        const tier = intakeTiers[c.key] || {};
        const slots = intake[c.key] ?? tier.slots ?? 0;
        const free = tier.minFree != null ? tier.minFree : null;
        const heads = tier.heads || 1;
        const days = tier.days || (c.key === 'large' ? 90 : c.key === 'medium' ? 60 : 30);
        const tone = slots <= 0 ? 'zero' : slots === 1 ? 'tight' : 'ok';
        const mathLine = free != null
            ? `${free} free × ${days}d window ÷ ${heads} required = ${slots}`
            : `${slots} slot${slots === 1 ? '' : 's'} available`;
        return `
        <div class="intel-intake-card intel-intake-card--${tone}">
            <div class="intel-intake-num">${slots}</div>
            <div class="intel-intake-lbl">${escapeHtml(c.label)}</div>
            <div class="intel-intake-need">${escapeHtml(c.need)} · ${escapeHtml(c.lasts)}</div>
            <div class="intel-intake-math">${escapeHtml(mathLine)}</div>
            <div class="intel-intake-status">${slots <= 0 ? 'No safe capacity' : slots === 1 ? 'Limited capacity' : 'Open to start'}</div>
        </div>`;
    }).join('');

    const aiShell = (typeof AiInsights !== 'undefined' && featureOn('AI_INSIGHTS'))
        ? AiInsights.shellHtml('ai-intelligence-insights', 'Executive Summary Brief', 'AI recommendation narrative based on staffing, client load, and project timelines — numbers below are unchanged.')
        : '';

    return `
    <div style="padding:0 0 40px;">
        <!-- Page header -->
        <div style="margin-bottom:24px;">
            <h1 style="font-size:26px;font-weight:800;color:var(--text-primary);margin:0 0 6px;">Resource & Capacity Intelligence</h1>
            <div style="font-size:13px;color:var(--text-muted);max-width:800px;line-height:1.5;">
                This page translates team data and project timelines into plain-English management decisions. It predicts workload capacity, alerts you to high-risk projects, and recommends when it is safe to start new business opportunities.
            </div>
        </div>

        ${aiShell}

        <div class="intel-kpi-strip">${kpiTiles}</div>

        <div class="intel-grid">
            <!-- Projects attention card -->
            <div class="intel-section card-light" style="border-radius:18px;padding:20px;">
                <div class="intel-section-head" style="margin-bottom:16px;border-bottom:1px solid var(--border-light);padding-bottom:10px;">
                    <h2 class="intel-section-title" style="font-size:16px;font-weight:800;color:var(--text-primary);">${sectionTitleWithIcon(Icons.alert, 'Projects Needing Focus')}</h2>
                    <span class="intel-section-sub" style="font-size:12px;line-height:1.4;color:var(--text-muted);margin-top:4px;display:block;">
                        These projects have high risk scores due to milestones slipping, resource constraints, or heavy backlogs.
                    </span>
                </div>
                <div class="intel-attn-list">${attentionRows}</div>
            </div>

            <!-- Resource release card -->
            <div class="intel-section card-light" style="border-radius:18px;padding:20px;">
                <div class="intel-section-head" style="margin-bottom:12px;border-bottom:1px solid var(--border-light);padding-bottom:10px;">
                    <h2 class="intel-section-title" style="font-size:16px;font-weight:800;color:var(--text-primary);">${sectionTitleWithIcon(Icons.users, 'Team Availability')}</h2>
                    <span class="intel-section-sub" style="font-size:12px;line-height:1.4;color:var(--text-muted);margin-top:4px;display:block;">
                        ${releaseTab === '30d'
                            ? 'Team members finishing active Delivery work within the next 30 days (by sibling release date).'
                            : 'Team members with no active Delivery assignments today (Database roster · Match By Person).'}
                    </span>
                </div>
                <div class="tl-view-tabs intel-release-tabs" style="margin-bottom:14px;">${releaseTabs}</div>
                <div class="intel-release-list">${releaseHTML}</div>
            </div>
        </div>

        <!-- Heatmap card -->
        <div class="intel-section card-light" style="margin-top:20px;border-radius:18px;padding:20px;">
            <div class="intel-section-head" style="margin-bottom:16px;border-bottom:1px solid var(--border-light);padding-bottom:10px;">
                <h2 class="intel-section-title" style="font-size:16px;font-weight:800;color:var(--text-primary);">${sectionTitleWithIcon(Icons.calendar, 'Role Busy-ness Calendar')}</h2>
                <span class="intel-section-sub" style="font-size:12px;line-height:1.4;color:var(--text-muted);margin-top:4px;display:block;">
                    Expected weekly workload for each role over the next 3 months. Hover over cells to see details.
                </span>
            </div>
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px;flex-wrap:wrap;font-size:11px;color:var(--text-muted);">
                <div style="display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:12px;height:12px;background:#1E8E3E;border-radius:2px;"></span> Light Load (&lt;40%)</div>
                <div style="display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:12px;height:12px;background:#1A73E8;border-radius:2px;"></span> Healthy Load (40-60%)</div>
                <div style="display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:12px;height:12px;background:#F9AB00;border-radius:2px;"></span> High Load (60-85%)</div>
                <div style="display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:12px;height:12px;background:#D93025;border-radius:2px;"></span> Fully Booked (&gt;85%)</div>
            </div>
            <div class="intel-heat-grid">${heatHTML || '<div class="intel-empty">No role assignments to forecast.</div>'}</div>
        </div>

        <!-- Outlook grids -->
        <div class="intel-util-grid" style="margin-top:20px;">${utilHorizons}</div>

        <!-- Business opportunity card -->
        <div class="intel-section card-light intel-intake-section" style="margin-top:20px;border-radius:18px;padding:20px;">
            <div class="intel-section-head" style="margin-bottom:16px;border-bottom:1px solid var(--border-light);padding-bottom:10px;">
                <h2 class="intel-section-title" style="font-size:16px;font-weight:800;color:var(--text-primary);">${sectionTitleWithIcon(Icons.briefcase, 'Safe business intake')}</h2>
                <span class="intel-section-sub" style="font-size:12px;line-height:1.4;color:var(--text-muted);margin-top:4px;display:block;">
                    How many new ${creatorMode ? 'campaigns' : 'projects'} you can start without overloading ${escapeHtml(primaryRole.toLowerCase())} capacity. Uses the same free-headcount signal as the busy-ness calendar — not a separate guess.
                </span>
            </div>
            <div class="intel-intake-grid">${intakeCards}</div>
        </div>
    </div>`;
}


/* ══════════════════════════════════════════════════════════
   PERFORMANCE — Zoho timelog (leadership executive view)
   ══════════════════════════════════════════════════════════ */
function renderPerformanceUploadEmpty() {
    return `
    <div class="perf-doc">
        <div class="perf-doc-block perf-doc-block--empty">
            <h1 class="perf-doc-title">Project Command Center</h1>
            <p class="perf-doc-lead">Connect Zoho timelog data to see project health, risks, ownership, and delivery outcomes in one leadership-ready view.</p>
            <div class="perf-empty-actions">
                <button type="button" class="btn btn-primary" onclick="App.triggerZohoUpload()">Upload timelog CSV</button>
                <button type="button" class="btn btn-secondary" onclick="App.loadZohoSample()">Preview with sample project (Soukya)</button>
            </div>
            <div class="perf-dropzone" id="perf-dropzone"
                 ondragover="event.preventDefault(); this.classList.add('perf-dropzone--over')"
                 ondragleave="this.classList.remove('perf-dropzone--over')"
                 ondrop="App.handleZohoDrop(event)">
                <span>Drag and drop a Zoho Projects timelog export here</span>
            </div>
        </div>
    </div>`;
}

function renderPerformanceAttentionItem(item) {
    const sev = item.severity || 'medium';
    if (sev === 'none') {
        return `
        <div class="perf-callout perf-callout--ok">
            <div class="perf-callout-title">${escapeHtml(item.title)}</div>
            <p class="perf-callout-body">${escapeHtml(item.detail)}</p>
        </div>`;
    }
    return `
    <div class="perf-callout perf-callout--${sev}">
        <div class="perf-callout-title">${escapeHtml(item.title)}</div>
        <p class="perf-callout-body">${escapeHtml(item.detail)}</p>
    </div>`;
}

function renderPerformance() {
    const entries = AppState.filteredTimelogEntries;
    if (!AppState.timelogEntries.length) return renderPerformanceUploadEmpty();

    const allEntries = AppState.timelogEntries;
    const f = AppState.timelogFilters;
    const brief = computeLeadershipBrief(entries, allEntries, {
        projectName: f.project,
        clientName: entries[0]?.client,
        filters: f,
    });

    const totalH = brief.totalHours || 1;
    const maxJobH = Math.max(...brief.jobAgg.map(j => j.hours), 1);
    const maxWeekH = Math.max(...brief.weekAgg.map(w => w.total), 1);

    const projects = AppState.timelogMeta?.projects || [...new Set(allEntries.map(e => e.project).filter(Boolean))];
    const teams = [...new Set(allEntries.map(e => e.team))].sort();
    const people = [...new Set(allEntries.map(e => e.person))].sort();

    const sel = (name, val, options, allLabel) => {
        const opts = [`<option value="">${allLabel}</option>`]
            .concat(options.map(o => `<option value="${escapeHtml(o)}" ${val === o ? 'selected' : ''}>${escapeHtml(o)}</option>`));
        return `<select class="perf-filter-select" onchange="App.setTimelogFilter('${name}', this.value || null)">${opts.join('')}</select>`;
    };

    const approvalOpts = ['all', 'Approved', 'Rejected', 'Not Submitted'].map(s => {
        const v = s === 'all' ? 'all' : s;
        const selVal = f.approvalStatus || 'Approved';
        return `<option value="${v}" ${selVal === v ? 'selected' : ''}>${s === 'all' ? 'All records' : s}</option>`;
    }).join('');

    const legendHTML = brief.teamAgg.map(({ team, hours }) => {
        const pal = ZOHO_TEAM_COLORS[team] || ZOHO_TEAM_COLORS.Other;
        const pct = Math.round((hours / totalH) * 100);
        return `
        <div class="perf-legend-item">
            <span class="perf-legend-dot" style="background:${pal.color}"></span>
            <span class="perf-legend-label">${escapeHtml(team)}</span>
            <span class="perf-legend-val">${formatZohoHours(hours)} · ${pct}%</span>
        </div>`;
    }).join('');

    const weekBars = brief.weekAgg.map(w => {
        const barH = Math.round((w.total / maxWeekH) * 100);
        const segments = Object.entries(w.teams)
            .sort((a, b) => b[1] - a[1])
            .map(([team, h]) => {
                const pct = w.total ? (h / w.total) * 100 : 0;
                const pal = ZOHO_TEAM_COLORS[team] || ZOHO_TEAM_COLORS.Other;
                return `<div class="perf-week-seg" style="height:${pct}%;background:${pal.color}" title="${escapeHtml(team)}: ${formatZohoHours(h)}"></div>`;
            }).join('');
        return `
        <div class="perf-week-col" title="Week of ${escapeHtml(w.label)}: ${formatZohoHours(w.total)}">
            <div class="perf-week-count">${w.total ? formatZohoHours(w.total) : ''}</div>
            <div class="perf-week-bar-wrap">
                <div class="perf-week-bar" style="height:${barH}%">${segments}</div>
            </div>
            <div class="perf-week-label">${escapeHtml(w.label)}</div>
        </div>`;
    }).join('');

    const ownerRows = brief.ownership.map(p => {
        const pct = Math.round((p.hours / totalH) * 100);
        const barW = Math.min(100, pct);
        return `
        <div class="perf-owner-row">
            <div class="perf-owner-name">${escapeHtml(p.person)}<span class="perf-owner-meta">${escapeHtml(p.primaryTeam)}</span></div>
            <div class="perf-owner-bar-wrap"><div class="perf-owner-bar" data-fill="${barW}" style="width:0%"></div></div>
            <div class="perf-owner-stat">${formatZohoHours(p.hours)} · ${pct}%</div>
        </div>`;
    }).join('');

    const milestoneRows = brief.milestones.length
        ? brief.milestones.map(m => `
        <div class="perf-milestone-row">
            <div class="perf-milestone-name">${escapeHtml(m.name)}</div>
            <div class="perf-milestone-track"><div class="perf-milestone-fill" data-fill="${m.pct}" style="width:0%"></div></div>
            <div class="perf-milestone-stat">${formatZohoHours(m.hours)} · ${m.pct}%</div>
        </div>`).join('')
        : `<p class="perf-muted">No page-level delivery milestones in this period. Effort may be tracked under functional workstreams.</p>`;

    const outcomeRows = brief.outcomes.map(o => `
        <div class="perf-outcome-row">
            <span class="perf-outcome-label">${escapeHtml(o.label)}</span>
            <span class="perf-outcome-hours">${formatZohoHours(o.hours)}</span>
        </div>`).join('');

    const focusBars = brief.focusAreas.map(j => {
        const w = Math.round((j.hours / maxJobH) * 100);
        return `
        <div class="perf-job-row">
            <div class="perf-job-label" title="${escapeHtml(j.name)}">${escapeHtml(j.name)}</div>
            <div class="perf-job-track"><div class="perf-job-fill" data-fill="${w}" style="width:0%"></div></div>
            <div class="perf-job-hours">${formatZohoHours(j.hours)}</div>
        </div>`;
    }).join('');

    const depRows = brief.dependencies.map(d => `
        <div class="perf-dep-row">
            <div class="perf-dep-title">${escapeHtml(d.title)}</div>
            <p class="perf-dep-body">${escapeHtml(d.detail)}</p>
        </div>`).join('');

    const decisionRows = brief.decisions.map(d => `
        <li class="perf-decision-item">${escapeHtml(d)}</li>`).join('');

    const detailRows = entries.slice().sort((a, b) => (b.dateObj || 0) - (a.dateObj || 0)).map(e => `
        <tr>
            <td>${escapeHtml(e.date)}</td>
            <td>${escapeHtml(e.person)}</td>
            <td><span class="perf-team-pill perf-team-pill--sm">${escapeHtml(e.team)}</span></td>
            <td>${escapeHtml(leadershipJobLabel(e.job_name))}</td>
            <td>${escapeHtml(leadershipWorkItemLabel(e.work_item))}</td>
            <td class="perf-num">${formatZohoHours(e.hours)}</td>
            <td><span class="perf-status perf-status--${String(e.approval_status).toLowerCase().replace(/\s+/g, '-')}">${escapeHtml(e.approval_status || '—')}</span></td>
            <td class="perf-desc" title="${escapeHtml(e.description)}">${escapeHtml(e.description || '—')}</td>
        </tr>`).join('');

    const loadedAt = AppState.timelogMeta?.loadedAt
        ? new Date(AppState.timelogMeta.loadedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        : null;

    return `
    <div class="perf-doc">
        <header class="perf-doc-header">
            <div class="perf-doc-header-main">
                <div class="perf-doc-eyebrow">Executive project view</div>
                <h1 class="perf-doc-title">${escapeHtml(brief.projectName)}</h1>
                <div class="perf-doc-meta">
                    ${brief.clientName ? `<span class="perf-meta-chip">${escapeHtml(brief.clientName)}</span>` : ''}
                    <span class="perf-meta-chip perf-meta-chip--${brief.health}">${escapeHtml(brief.healthLabel)}</span>
                    <span class="perf-meta-chip">${escapeHtml(formatZohoDateRange(brief.minDate, brief.maxDate))}</span>
                    ${loadedAt ? `<span class="perf-meta-muted">Data refreshed ${escapeHtml(loadedAt)}</span>` : ''}
                </div>
            </div>
            <div class="perf-doc-header-actions">
                <button type="button" class="btn btn-secondary btn-sm" onclick="App.triggerZohoUpload()">Update data</button>
                <button type="button" class="btn btn-ghost btn-sm" onclick="App.exportTimelogCSV()">Export register</button>
            </div>
        </header>

        <div class="perf-exec-banner perf-exec-banner--${brief.health}">
            <div class="perf-exec-banner-label">Executive summary</div>
            <p class="perf-exec-banner-text">${escapeHtml(brief.narrative)}</p>
        </div>

        <div class="perf-toolbar">
            ${sel('project', f.project, projects, 'All projects')}
            ${sel('team', f.team, teams, 'All functions')}
            ${sel('person', f.person, people, 'All owners')}
            <select class="perf-filter-select" onchange="App.setTimelogFilter('approvalStatus', this.value === 'all' ? 'all' : this.value)">${approvalOpts}</select>
            <button type="button" class="btn btn-ghost btn-sm" onclick="App.clearTimelogFilters()">Reset</button>
        </div>

        <div class="perf-metrics-row">
            <div class="perf-metric">
                <div class="perf-metric-label">Investment to date</div>
                <div class="perf-metric-value">${formatZohoHours(brief.totalHours)}</div>
                <div class="perf-metric-hint">Billable effort logged</div>
            </div>
            <div class="perf-metric">
                <div class="perf-metric-label">Team engaged</div>
                <div class="perf-metric-value">${brief.people}</div>
                <div class="perf-metric-hint">Active contributors</div>
            </div>
            <div class="perf-metric">
                <div class="perf-metric-label">Delivery focus</div>
                <div class="perf-metric-value">${brief.productiveRatio}%</div>
                <div class="perf-metric-hint">Core delivery vs overhead</div>
            </div>
            <div class="perf-metric">
                <div class="perf-metric-label">Effort pace</div>
                <div class="perf-metric-value">${escapeHtml(brief.velocityLabel)}</div>
                <div class="perf-metric-hint">~${formatZohoHours(brief.avgWeekly)}/week avg</div>
            </div>
            ${brief.pendingHours > 0 ? `
            <div class="perf-metric perf-metric--warn">
                <div class="perf-metric-label">Approval backlog</div>
                <div class="perf-metric-value">${formatZohoHours(brief.pendingHours)}</div>
                <div class="perf-metric-hint">${brief.pendingPct}% of all records</div>
            </div>` : ''}
        </div>

        <div class="perf-layout">
            <div class="perf-layout-main">
                <section class="perf-doc-block">
                    <h2 class="perf-section-title">Resource allocation</h2>
                    <p class="perf-section-desc">How investment is distributed across delivery functions — use this to validate staffing matches priorities.</p>
                    <div class="perf-alloc-grid">
                        <div id="perf-team-donut" class="perf-donut-slot"></div>
                        <div class="perf-legend">${legendHTML}</div>
                    </div>
                </section>

                <section class="perf-doc-block">
                    <h2 class="perf-section-title">Effort trend</h2>
                    <p class="perf-section-desc">${escapeHtml(brief.velocityDetail)}</p>
                    <div class="perf-week-chart">${weekBars || '<p class="perf-muted">No dated activity in the current filter.</p>'}</div>
                </section>

                <section class="perf-doc-block">
                    <h2 class="perf-section-title">Delivery milestones</h2>
                    <p class="perf-section-desc">Page-level deliverables and where effort has concentrated — proxy for progress on scoped outcomes.</p>
                    <div class="perf-milestone-list">${milestoneRows}</div>
                </section>

                <section class="perf-doc-block">
                    <h2 class="perf-section-title">Workstream focus</h2>
                    <p class="perf-section-desc">Top areas consuming time, translated from operational job codes into business-readable labels.</p>
                    <div class="perf-job-chart">${focusBars || '<p class="perf-muted">No activity recorded.</p>'}</div>
                </section>

                <section class="perf-doc-block">
                    <h2 class="perf-section-title">Key outcomes &amp; activities</h2>
                    <p class="perf-section-desc">What the team is actually producing — integration, validation, client engagement, and defect work.</p>
                    <div class="perf-outcome-list">${outcomeRows || '<p class="perf-muted">No work-item detail available.</p>'}</div>
                </section>

                <section class="perf-doc-block perf-doc-block--collapse">
                    <button type="button" class="perf-detail-toggle" onclick="App.toggleTimelogDetail()">
                        <span>Activity register · ${entries.length} records</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="${AppState.timelogDetailOpen ? 'perf-chevron--open' : ''}"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <p class="perf-section-desc" style="margin-top:0">Full audit trail for finance and PMO — expand for line-level detail.</p>
                    <div class="perf-detail-table-wrap" style="display:${AppState.timelogDetailOpen ? 'block' : 'none'}">
                        <table class="perf-table perf-table--detail">
                            <thead>
                                <tr><th>Date</th><th>Owner</th><th>Function</th><th>Workstream</th><th>Activity</th><th>Effort</th><th>Status</th><th>Notes</th></tr>
                            </thead>
                            <tbody>${detailRows}</tbody>
                        </table>
                    </div>
                </section>
            </div>

            <aside class="perf-layout-aside">
                <section class="perf-doc-block">
                    <h2 class="perf-section-title">Needs attention</h2>
                    <p class="perf-section-desc">Issues that may affect delivery confidence, billing, or resourcing decisions.</p>
                    <div class="perf-callout-list">${brief.attention.map(renderPerformanceAttentionItem).join('')}</div>
                </section>

                <section class="perf-doc-block">
                    <h2 class="perf-section-title">Recommended decisions</h2>
                    <p class="perf-section-desc">Suggested leadership actions based on current data signals.</p>
                    <ul class="perf-decision-list">${decisionRows}</ul>
                </section>

                <section class="perf-doc-block">
                    <h2 class="perf-section-title">Ownership</h2>
                    <p class="perf-section-desc">Team of ${brief.people} — top contributor at ${brief.concentrationPct}%; full breakdown below.</p>
                    <div class="perf-owner-list">${ownerRows}</div>
                </section>

                <section class="perf-doc-block">
                    <h2 class="perf-section-title">Delivery dependencies</h2>
                    <p class="perf-section-desc">Cross-functional handoffs implied by effort patterns.</p>
                    <div class="perf-dep-list">${depRows}</div>
                </section>

                <section class="perf-doc-block perf-doc-block--muted">
                    <h2 class="perf-section-title">Project snapshot</h2>
                    <dl class="perf-snapshot">
                        <div class="perf-snapshot-row"><dt>Client</dt><dd>${escapeHtml(brief.clientName || '—')}</dd></div>
                        <div class="perf-snapshot-row"><dt>Reporting period</dt><dd>${escapeHtml(formatZohoDateRange(brief.minDate, brief.maxDate))}</dd></div>
                        <div class="perf-snapshot-row"><dt>Engineering share</dt><dd>${brief.devPct}%</dd></div>
                        <div class="perf-snapshot-row"><dt>QA share</dt><dd>${brief.qaPct}%</dd></div>
                        <div class="perf-snapshot-row"><dt>Coordination overhead</dt><dd>${brief.overheadPct}%</dd></div>
                        <div class="perf-snapshot-row"><dt>Data source</dt><dd>${escapeHtml(AppState.timelogMeta?.fileName || 'Zoho timelog')}</dd></div>
                    </dl>
                </section>
            </aside>
        </div>
    </div>`;
}


/* ══════════════════════════════════════════════════════════
   HELP & DOCUMENTATION — SaaS Metric Explainer
   ══════════════════════════════════════════════════════════ */
function renderHelp() {
    return `
    <div style="padding:0 0 40px; max-width: 900px; margin: 0 auto;">
        <!-- Page header -->
        <div style="margin-bottom:32px;">
            <h1 style="font-size:26px;font-weight:800;color:var(--text-primary);margin:0 0 6px;">📚 Help & Documentation</h1>
            <div style="font-size:13px;color:var(--text-muted);line-height:1.5;">
                This guide explains the underlying formulas, alert systems, predictive projections, and data structures that power the Atlas dashboard.
            </div>
        </div>

        <!-- Section 1: Progress Calculations -->
        <div class="card-light" style="padding:24px; border-radius:18px; margin-bottom:20px;">
            <h2 style="font-size:18px; font-weight:800; color:var(--text-primary); margin:0 0 10px; display:flex; align-items:center; gap:8px;">
                ⚙️ Project Progress Calculations
            </h2>
            <div style="font-size:13px; color:var(--text-secondary); line-height:1.6; margin-bottom:16px;">
                Atlas supports two models for tracking a project's completion progress, depending on whether it has a detailed sub-sheet:
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                <div style="background:var(--border-light); padding:16px; border-radius:12px;">
                    <h3 style="font-size:13px; font-weight:700; margin:0 0 6px; color:var(--text-primary);">A. Simple Progress (Master Tab)</h3>
                    <p style="font-size:12px; color:var(--text-muted); margin:0; line-height:1.5;">
                        If a project has no linked detailed sibling tab, progress is read directly from the manually entered percentage in the <strong>Progress (%)</strong> column of the main spreadsheet.
                    </p>
                </div>
                <div style="background:var(--border-light); padding:16px; border-radius:12px;">
                    <h3 style="font-size:13px; font-weight:700; margin:0 0 6px; color:var(--text-primary);">B. Sibling Tab Average (Delivery)</h3>
                    <p style="font-size:12px; color:var(--text-muted); margin:0; line-height:1.5;">
                        When a detailed sub-sheet is linked (via <code>detail_gid</code> or <code>detail_csv_url</code>), progress is automatically calculated as the average of the progress percentages of all subtask rows:
                    </p>
                    <div style="font-family:monospace; font-size:11px; background:var(--bg-dark); padding:8px; border-radius:6px; margin-top:8px; text-align:center; color:var(--text-primary);">
                        Avg Progress = Math.round(Sum(Row Progresses) / Count(Rows))
                    </div>
                </div>
            </div>
        </div>

        <!-- Section 2: Attention & Risk Engine -->
        <div class="card-light" style="padding:24px; border-radius:18px; margin-bottom:20px;">
            <h2 style="font-size:18px; font-weight:800; color:var(--text-primary); margin:0 0 10px; display:flex; align-items:center; gap:8px;">
                ${sectionTitleWithIcon(Icons.alert, 'Attention & Risk Engine')}
            </h2>
            <div style="font-size:13px; color:var(--text-secondary); line-height:1.6; margin-bottom:16px;">
                The <strong>Attention Score</strong> (0 to 100) measures how much a project needs immediate review. Points are assigned for compounding risk factors, defined in <code>CONFIG.ATTENTION_WEIGHTS</code>:
            </div>
            
            <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left; color:var(--text-secondary);">
                <thead>
                    <tr style="border-bottom:2px solid var(--border-light); font-weight:700; color:var(--text-primary);">
                        <th style="padding:8px 0;">Risk Indicator</th>
                        <th style="padding:8px 0; text-align:right;">Default Points</th>
                        <th style="padding:8px 0; padding-left:16px;">Trigger Criteria</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom:1px solid var(--border-light);">
                        <td style="padding:8px 0; font-weight:600;">Overdue Target Date</td>
                        <td style="padding:8px 0; text-align:right; color:#D93025; font-weight:700;">+40 pts</td>
                        <td style="padding:8px 0; padding-left:16px;">Current date has passed the project's release target.</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--border-light);">
                        <td style="padding:8px 0; font-weight:600;">Velocity Prediction Delay</td>
                        <td style="padding:8px 0; text-align:right; color:#D93025; font-weight:700;">+28 pts</td>
                        <td style="padding:8px 0; padding-left:16px;">Historic pace indicates target release date will be missed.</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--border-light);">
                        <td style="padding:8px 0; font-weight:600;">Stalled Progress</td>
                        <td style="padding:8px 0; text-align:right; color:#F9AB00; font-weight:700;">+22 pts</td>
                        <td style="padding:8px 0; padding-left:16px;">Active for &gt;30 days but has made less than 30% progress.</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--border-light);">
                        <td style="padding:8px 0; font-weight:600;">Scheduling Conflict</td>
                        <td style="padding:8px 0; text-align:right; color:#F9AB00; font-weight:700;">+14 pts</td>
                        <td style="padding:8px 0; padding-left:16px;">Assigned staff is double-booked on overlapping dates.</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--border-light);">
                        <td style="padding:8px 0; font-weight:600;">Staff Overloaded</td>
                        <td style="padding:8px 0; text-align:right;">+5 pts / proj</td>
                        <td style="padding:8px 0; padding-left:16px;">Assigned resources have &ge; 2 active projects (max +12 pts).</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--border-light);">
                        <td style="padding:8px 0; font-weight:600;">Large Scope Backlog</td>
                        <td style="padding:8px 0; text-align:right;">+10 pts</td>
                        <td style="padding:8px 0; padding-left:16px;">Over 50% of the mapped subtasks/pages are still pending.</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--border-light);">
                        <td style="padding:8px 0; font-weight:600;">Delayed Status Flag</td>
                        <td style="padding:8px 0; text-align:right;">+6 pts</td>
                        <td style="padding:8px 0; padding-left:16px;">Project status is explicitly marked as "delayed".</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--border-light);">
                        <td style="padding:8px 0; font-weight:600;">Launch Impending</td>
                        <td style="padding:8px 0; text-align:right;">+8 pts</td>
                        <td style="padding:8px 0; padding-left:16px;">Target release date falls within the next 30 days.</td>
                    </tr>
                </tbody>
            </table>

            <div style="margin-top:16px; display:flex; gap:8px; flex-wrap:wrap;">
                <span style="font-size:11px; font-weight:700; background:#D930251F; color:#D93025; padding:4px 8px; border-radius:6px;">Critical Risk: Score &ge; 70</span>
                <span style="font-size:11px; font-weight:700; background:#F9AB001F; color:#B06000; padding:4px 8px; border-radius:6px;">High Risk: Score 50 - 69</span>
                <span style="font-size:11px; font-weight:700; background:#1A73E81F; color:#1A73E8; padding:4px 8px; border-radius:6px;">Medium Risk: Score 30 - 49</span>
                <span style="font-size:11px; font-weight:700; background:#1E8E3E1F; color:#1E8E3E; padding:4px 8px; border-radius:6px;">Low Risk: Score &lt; 30</span>
            </div>
        </div>

        <!-- Section 3: Projections & Timelines -->
        <div class="card-light" style="padding:24px; border-radius:18px; margin-bottom:20px;">
            <h2 style="font-size:18px; font-weight:800; color:var(--text-primary); margin:0 0 10px; display:flex; align-items:center; gap:8px;">
                ${sectionTitleWithIcon(Icons.trendUp, 'Predictive Timeline & Velocity')}
            </h2>
            <div style="font-size:13px; color:var(--text-secondary); line-height:1.6; margin-bottom:16px;">
                How does Atlas project project completion dates dynamically?
            </div>
            
            <ul style="font-size:12px; color:var(--text-muted); line-height:1.6; padding-left:20px; margin:0 0 16px;">
                <li style="margin-bottom:8px;">
                    <strong style="color:var(--text-primary);">Pace (Velocity):</strong> Calculates the rate of work finished per day since the project started:
                    <div style="font-family:monospace; font-size:11px; background:var(--bg-dark); padding:6px; border-radius:6px; display:inline-block; margin-top:4px; color:var(--text-primary);">
                        Velocity = Completed Pages / Days Elapsed Since Start Date
                    </div>
                </li>
                <li style="margin-bottom:8px;">
                    <strong style="color:var(--text-primary);">Remaining Days:</strong> Projected time needed to complete all outstanding work:
                    <div style="font-family:monospace; font-size:11px; background:var(--bg-dark); padding:6px; border-radius:6px; display:inline-block; margin-top:4px; color:var(--text-primary);">
                        Remaining Days = (Total Pages - Completed Pages) / Velocity
                    </div>
                </li>
                <li>
                    <strong style="color:var(--text-primary);">Projected End Date:</strong> Added to today's date to find the velocity-projected completion. If this date exceeds the target release date, a "miss" alert triggers.
                </li>
            </ul>
        </div>

        <!-- Section 4: Resource Load and Intake -->
        <div class="card-light" style="padding:24px; border-radius:18px;">
            <h2 style="font-size:18px; font-weight:800; color:var(--text-primary); margin:0 0 10px; display:flex; align-items:center; gap:8px;">
                ${sectionTitleWithIcon(Icons.users, 'Resource Utilization & Intake')}
            </h2>
            <div style="font-size:13px; color:var(--text-secondary); line-height:1.6; margin-bottom:16px;">
                Atlas builds weekly capacity slots to optimize staffing and avoid developer burnout.
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                <div style="background:var(--border-light); padding:16px; border-radius:12px;">
                    <h3 style="font-size:13px; font-weight:700; margin:0 0 6px; color:var(--text-primary);">Resource Allocation Dates</h3>
                    <p style="font-size:12px; color:var(--text-muted); margin:0; line-height:1.5;">
                        Assignments start at the project's <strong>Start Date</strong> and end at the project's <strong>Projected End Date</strong> (or target release date, whichever is later, depending on configuration). If a project is complete/shipped, its resources are freed immediately.
                    </p>
                </div>
                <div style="background:var(--border-light); padding:16px; border-radius:12px;">
                    <h3 style="font-size:13px; font-weight:700; margin:0 0 6px; color:var(--text-primary);">New Intake Slots Formula</h3>
                    <p style="font-size:12px; color:var(--text-muted); margin:0; line-height:1.5;">
                        Intake capacity scans the upcoming 90 days. If key staffing roles are below the utilization target, the advisor recommends taking on additional slots:
                    </p>
                    <ul style="font-size:11px; padding-left:14px; margin-top:6px; color:var(--text-muted); margin:0;">
                        <li><strong>Small Projects:</strong> 1 Developer needed for 30 days.</li>
                        <li><strong>Medium Projects:</strong> 2 Developers + 1 QA needed for 60 days.</li>
                        <li><strong>Large Programs:</strong> 3+ Mixed Roles needed for 90 days.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>`;
}


/* ══════════════════════════════════════════════════════════
   SETTINGS — RBAC Management Board
══════════════════════════════════════════════════════════ */
function renderSettings() {
    const ALL_VIEWS   = ['overview','projects','pipeline','alerts','resources','timeline','analytics','intelligence','performance'];
    const ALL_ACTIONS = ['export','refresh','switchWorkspace','theme'];
    const ALL_WS      = (CONFIG.WORKSPACES || []).map(w => w.id);

    const users = Auth.getUsers();
    const roles = Auth.getRoles();
    const roleNames = Object.keys(roles);

    // ── Users Table ──────────────────────────────────────
    const usersRows = users.map((u, i) => {
        const wsAll     = u.workspaces === '*';
        const wsArr     = wsAll ? ALL_WS : (Array.isArray(u.workspaces) ? u.workspaces : []);

        const roleOptions = roleNames.map(r =>
            `<option value="${r}" ${u.role === r ? 'selected' : ''}>${r.charAt(0).toUpperCase()+r.slice(1)}</option>`
        ).join('');
        const roleItems = roleNames.map(r => ({ value: r, label: r.charAt(0).toUpperCase()+r.slice(1) }));

        return `
        <tr class="stg-table-row" data-user-index="${i}">
            <td class="stg-td">
                <input class="stg-input stg-input--sm" value="${escapeHtml(u.displayName || u.name)}" data-field="name" data-idx="${i}" onchange="SettingsCtrl.updateUser(${i},'name',this.value)" />
            </td>
            <td class="stg-td">
                ${CONFIG.CUSTOM_SELECTS
                    ? atlasDD(`stg-role-dd-${i}`, roleItems, u.role, u.role, `settings-role:${i}`)
                    : `
                <select class="stg-select stg-select--sm" data-field="role" data-idx="${i}" onchange="SettingsCtrl.updateUser(${i},'role',this.value)">
                    ${roleOptions}
                </select>`}
            </td>
            <td class="stg-td">
                <div class="stg-pin-wrap">
                    <input class="stg-input stg-input--sm stg-input--pin" type="password" value="${escapeHtml(String(u.pin))}" data-field="pin" data-idx="${i}" onchange="SettingsCtrl.updateUser(${i},'pin',this.value)" maxlength="20" autocomplete="off" />
                    <button class="stg-pin-eye" onclick="SettingsCtrl.togglePinView(this)" tabindex="-1" type="button">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                </div>
            </td>
            <td class="stg-td">
                <div class="stg-ws-chips" id="stg-ws-chips-${i}">
                    <label class="stg-chip ${wsAll ? 'stg-chip--on' : ''}" onclick="SettingsCtrl.toggleWsAll(${i},this)">
                        All
                    </label>
                    ${(CONFIG.WORKSPACES || []).map(w => `
                    <label class="stg-chip ${!wsAll && wsArr.includes(w.id) ? 'stg-chip--on' : ''}" data-ws="${w.id}" onclick="SettingsCtrl.toggleWs(${i},'${w.id}',this)">
                        ${escapeHtml(w.name)}
                    </label>`).join('')}
                </div>
            </td>
            <td class="stg-td stg-td--action">
                <button class="stg-icon-btn stg-icon-btn--danger" onclick="SettingsCtrl.deleteUser(${i})" title="Remove user">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
            </td>
        </tr>`;
    }).join('');

    // ── Roles Grid ───────────────────────────────────────
    const viewLabels   = { overview:'Overview', projects:'Projects', pipeline:'Pipeline', alerts:'Alerts', resources:'Resources', timeline:'Timeline', analytics:'Analytics', performance:'Performance' };
    const actionLabels = { export:'Export CSV', refresh:'Refresh Data', switchWorkspace:'Switch Workspace', theme:'Toggle Theme' };

    const rolesGrid = roleNames.map(roleName => {
        const rc       = roles[roleName] || {};
        const isAdmin  = roleName === 'admin';
        const viewsAll = rc.views   === '*';
        const actsAll  = rc.actions === '*';
        const viewsArr = viewsAll ? ALL_VIEWS : (Array.isArray(rc.views)   ? rc.views   : []);
        const actsArr  = actsAll  ? ALL_ACTIONS : (Array.isArray(rc.actions) ? rc.actions : []);

        const viewBoxes = ALL_VIEWS.map(v => `
            <label class="stg-check-label ${viewsAll || viewsArr.includes(v) ? 'stg-check-label--on' : ''}">
                <input type="checkbox" class="stg-check" ${viewsAll || viewsArr.includes(v) ? 'checked' : ''}
                    ${isAdmin ? 'disabled' : ''}
                    onchange="SettingsCtrl.toggleRoleView('${roleName}','${v}',this.checked)" />
                ${viewLabels[v] || v}
            </label>`).join('');

        const actionBoxes = ALL_ACTIONS.map(a => `
            <label class="stg-check-label ${actsAll || actsArr.includes(a) ? 'stg-check-label--on' : ''}">
                <input type="checkbox" class="stg-check" ${actsAll || actsArr.includes(a) ? 'checked' : ''}
                    ${isAdmin ? 'disabled' : ''}
                    onchange="SettingsCtrl.toggleRoleAction('${roleName}','${a}',this.checked)" />
                ${actionLabels[a] || a}
            </label>`).join('');

        return `
        <div class="stg-role-card" id="stg-role-${roleName}">
            <div class="stg-role-header">
                <span class="stg-role-name">${roleName.charAt(0).toUpperCase()+roleName.slice(1)}</span>
                ${isAdmin ? '<span class="stg-role-badge">Full Access</span>' : ''}
            </div>

            <div class="stg-role-section">
                <div class="stg-role-section-title">Pages / Views</div>
                <div class="stg-checks">${viewBoxes}</div>
            </div>

            <div class="stg-role-section">
                <div class="stg-role-section-title">Actions</div>
                <div class="stg-checks">${actionBoxes}</div>
            </div>
        </div>`;
    }).join('');

    // ── Workspaces Table ──────────────────────────────────
    const workspacesRows = (CONFIG.WORKSPACES || []).map((w, i) => {
        const isClickUp = w.integrationType === 'clickup';
        return `
        <tr class="stg-table-row" data-ws-index="${i}">
            <td class="stg-td" style="vertical-align: middle;">
                <input class="stg-input stg-input--sm" value="${escapeHtml(w.name)}" placeholder="Workspace Name"
                    onchange="SettingsCtrl.updateWorkspace(${i}, 'name', this.value)" style="width: 140px;" />
            </td>
            <td class="stg-td" style="vertical-align: middle;">
                <select class="stg-select stg-select--sm" onchange="SettingsCtrl.updateWorkspace(${i}, 'integrationType', this.value)" style="width: 140px; padding: 6px 10px; border-radius: 8px;">
                    <option value="google_sheets" ${w.integrationType === 'google_sheets' ? 'selected' : ''}>Google Sheets</option>
                    <option value="clickup" ${w.integrationType === 'clickup' ? 'selected' : ''}>ClickUp App</option>
                </select>
            </td>
            <td class="stg-td">
                ${isClickUp ? `
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <input class="stg-input stg-input--sm" value="${escapeHtml(w.clickupListId || '')}" placeholder="List ID (or 'clickup_mock')"
                        onchange="SettingsCtrl.updateWorkspace(${i}, 'clickupListId', this.value)" style="flex: 1; min-width: 140px;" />
                    <input class="stg-input stg-input--sm" type="password" value="${escapeHtml(w.clickupToken || '')}" placeholder="Personal API Token"
                        onchange="SettingsCtrl.updateWorkspace(${i}, 'clickupToken', this.value)" style="flex: 1; min-width: 160px;" />
                </div>
                ` : `
                <input class="stg-input stg-input--sm" value="${escapeHtml(w.sheetUrl || '')}" placeholder="Published CSV URL"
                    onchange="SettingsCtrl.updateWorkspace(${i}, 'sheetUrl', this.value)" style="width: 100%;" />
                `}
            </td>
            <td class="stg-td stg-td--action" style="vertical-align: middle;">
                <button class="stg-icon-btn stg-icon-btn--danger" onclick="SettingsCtrl.deleteWorkspace(${i})" title="Remove workspace">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
            </td>
        </tr>`;
    }).join('');

    return `
    <div class="view-container stg-root">
        <div class="view-header" style="margin-bottom:28px;">
            <div class="view-title">Access & Permissions</div>
            <div class="view-subtitle">Manage users, roles, and what each role can access. Changes save instantly.</div>
        </div>

        <!-- ── Users Section ─────────────────────────────── -->
        <div class="stg-section">
            <div class="stg-section-header">
                <div>
                    <div class="stg-section-title">Users</div>
                    <div class="stg-section-sub">Who can log in and what they can access</div>
                </div>
                <button class="stg-btn stg-btn--primary" onclick="SettingsCtrl.addUser()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add User
                </button>
            </div>

            <div class="stg-table-wrap">
                <table class="stg-table">
                    <thead>
                        <tr>
                            <th class="stg-th">Name</th>
                            <th class="stg-th">Role</th>
                            <th class="stg-th">PIN</th>
                            <th class="stg-th">Workspace Access</th>
                            <th class="stg-th"></th>
                        </tr>
                    </thead>
                    <tbody id="stg-users-tbody">
                        ${usersRows}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ── Roles Section ─────────────────────────────── -->
        <div class="stg-section" style="margin-top:36px;">
            <div class="stg-section-header">
                <div>
                    <div class="stg-section-title">Role Permissions</div>
                    <div class="stg-section-sub">Control which pages and actions each role can access</div>
                </div>
                <button class="stg-btn stg-btn--outline" onclick="SettingsCtrl.resetToDefaults()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Reset to Defaults
                </button>
            </div>
            <div class="stg-roles-grid">
                ${rolesGrid}
            </div>
        </div>

        <!-- ── Workspaces Section ───────────────────────────── -->
        <div class="stg-section" style="margin-top:36px; border-top: 1px solid var(--border-light); padding-top: 28px;">
            <div class="stg-section-header">
                <div>
                    <div class="stg-section-title">Workspaces & Data Integrations</div>
                    <div class="stg-section-sub">Configure where each workspace loads its dashboard data (Google Sheets vs. ClickUp App)</div>
                </div>
                <button class="stg-btn stg-btn--primary" onclick="SettingsCtrl.addWorkspace()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Workspace
                </button>
            </div>
            
            <div class="stg-table-wrap">
                <table class="stg-table">
                    <thead>
                        <tr>
                            <th class="stg-th" style="width: 160px;">Workspace Name</th>
                            <th class="stg-th" style="width: 160px;">Integration Type</th>
                            <th class="stg-th">Source Configurations</th>
                            <th class="stg-th" style="width: 50px;"></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${workspacesRows}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ── Resource notifications ───────────────────────── -->
        <div class="stg-section" style="margin-top:36px; border-top: 1px solid var(--border-light); padding-top: 28px;">
            <div class="stg-section-header">
                <div>
                    <div class="stg-section-title">Resource release emails</div>
                    <div class="stg-section-sub">Update anytime. On release, employees get active projects + contact emails; resource managers get Needs-attention allocate suggestions.</div>
                </div>
                <button class="stg-btn stg-btn--primary" type="button" onclick="SettingsCtrl.saveNotifyEmails()">
                    Save emails
                </button>
            </div>
            <div class="stg-notify-grid" style="display:grid; gap:16px; max-width:720px;">
                <label class="stg-field" style="display:flex; flex-direction:column; gap:6px;">
                    <span class="stg-role-section-title">Resource manager emails</span>
                    <span class="stg-section-sub">Comma-separated. Receive release alerts with suggested projects to allocate.</span>
                    <textarea id="stg-rm-emails" class="stg-input" rows="3" placeholder="rm@company.com, lead@company.com"
                        style="width:100%; min-height:72px; resize:vertical; padding:10px 12px; border-radius:8px; font:inherit;">${escapeHtml((typeof AppState !== 'undefined' && AppState.notifySettings && AppState.notifySettings.resource_manager_emails) || '')}</textarea>
                </label>
                <label class="stg-field" style="display:flex; flex-direction:column; gap:6px;">
                    <span class="stg-role-section-title">Staffing contact emails (shown to employees)</span>
                    <span class="stg-section-sub">Comma-separated contacts included in the employee release email. Paste addresses anytime; employee recipients come from the roster.</span>
                    <textarea id="stg-contact-emails" class="stg-input" rows="4" placeholder="staffing@company.com, hr@company.com"
                        style="width:100%; min-height:96px; resize:vertical; padding:10px 12px; border-radius:8px; font:inherit;">${escapeHtml((typeof AppState !== 'undefined' && AppState.notifySettings && AppState.notifySettings.staffing_contact_emails) || '')}</textarea>
                </label>
                <div class="stg-section-sub" id="stg-notify-status">For now release emails list active projects (department filter later).</div>
            </div>
        </div>
    </div>`;
}
