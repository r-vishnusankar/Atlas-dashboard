/**
 * STREAK.JS v2 — SVG Charts & Data Viz
 * Glowing donut, sparklines, animated counters, bento mini rings
 */

/* ──────────────────────────────────────────
   ANIMATED COUNTER
────────────────────────────────────────── */
function animateCounter(el, target, duration = 1200) {
    if (!el) return;
    const start = performance.now();
    const from  = parseInt(el.textContent, 10) || 0;

    function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 4); // Quartic ease out
        el.textContent = Math.round(from + (target - from) * eased);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
    }
    requestAnimationFrame(step);
}

/* ──────────────────────────────────────────
   GLOWING DONUT CHART (SVG)
   data = [{ label, value, color, glowColor }]
────────────────────────────────────────── */
function renderDonutChart(containerId, data, centerLabel = 'Total') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const size    = 180;
    const cx      = size / 2;
    const cy      = size / 2;
    const radius  = 70;
    const strokeW = 14;
    const circumference = 2 * Math.PI * radius;

    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) {
        container.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="var(--border-light)" stroke-width="${strokeW}"/>
        </svg>`;
        return;
    }

    let offset = 0;
    const segments = [];

    data.forEach(({ label, value, color, glowColor }) => {
        if (value === 0) return;
        const pct   = value / total;
        const dash  = pct * circumference;
        const gap   = circumference - dash;
        segments.push({ label, value, color, glowColor, dash, gap, offset });
        offset += dash;
    });

    // We add filters for the glow
    const svgSegments = segments.map((s, i) => {
        const dashStroke = `${s.dash} ${s.gap}`;
        const rotate     = (s.offset / circumference) * 360 - 90;
        return `
            <circle cx="${cx}" cy="${cy}" r="${radius}"
                fill="none" stroke="${s.color}" stroke-width="${strokeW}"
                stroke-dasharray="${dashStroke}" stroke-dashoffset="0"
                transform="rotate(${rotate}, ${cx}, ${cy})"
                stroke-linecap="round"
                style="animation: donutDraw 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.15}s both; 
                       filter: drop-shadow(0 0 8px ${s.glowColor || s.color}); cursor:pointer;">
                <title>${s.label}: ${s.value}</title>
            </circle>
        `;
    }).join('');

    container.innerHTML = `
        <style>
            @keyframes donutDraw {
                from { stroke-dasharray: 0 ${circumference}; }
            }
        </style>
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none"
                    stroke="var(--bg-input)" stroke-width="${strokeW}"/>
            ${svgSegments}
            <text x="${cx}" y="${cy - 2}" text-anchor="middle"
                  font-size="32" font-weight="900" fill="var(--text-primary)">
                ${total}
            </text>
            <text x="${cx}" y="${cy + 18}" text-anchor="middle"
                  font-size="12" font-weight="600" fill="var(--text-tertiary)"
                  letter-spacing="1">
                ${centerLabel.toUpperCase()}
            </text>
        </svg>`;
}

/* ──────────────────────────────────────────
   SPARKLINE RENDERER
   For bento velocity / trend cards
────────────────────────────────────────── */
function renderSparkline(containerId, points, color = 'var(--accent)') {
    const container = document.getElementById(containerId);
    if (!container || !points || points.length < 2) return;

    const width  = container.clientWidth || 200;
    const height = container.clientHeight || 60;
    
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    
    const stepX = width / (points.length - 1);
    
    const coords = points.map((p, i) => {
        const x = i * stepX;
        const y = height - ((p - min) / range) * (height - 10) - 5; // 5px padding
        return `${x},${y}`;
    });
    
    // Create fill path (closes back to bottom)
    const fillCoords = `0,${height} ${coords.join(' ')} ${width},${height}`;

    container.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
            <defs>
                <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${color}" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <polygon points="${fillCoords}" fill="url(#glowGrad)" style="animation: viewFadeIn 1s ease both"/>
            <polyline points="${coords.join(' ')}" fill="none" stroke="${color}" stroke-width="2" 
                      stroke-linecap="round" stroke-linejoin="round"
                      style="filter: drop-shadow(0 2px 4px ${color});"/>
            <!-- Current Value Dot -->
            <circle cx="${coords[coords.length-1].split(',')[0]}" cy="${coords[coords.length-1].split(',')[1]}" 
                    r="4" fill="var(--bg-surface)" stroke="${color}" stroke-width="2"
                    style="filter: drop-shadow(0 0 6px ${color}); animation: pulseRing 2s infinite alternate;" />
        </svg>
    `;
}

/* ──────────────────────────────────────────
   STAGE PROGRESS BAR
────────────────────────────────────────── */
function renderStageBar(containerId, stageCounts, total) {
    const container = document.getElementById(containerId);
    if (!container || !total) return;

    const stages = [
        { key:'Backlog',     color:'var(--stage-backlog)' },
        { key:'Planning',    color:'var(--stage-planning)' },
        { key:'Development', color:'var(--stage-dev)' },
        { key:'QA',          color:'var(--stage-qa)' },
        { key:'Release',     color:'var(--stage-release)' },
        { key:'Live',        color:'var(--stage-live)' },
    ];

    const segments = stages.map(s => {
        const pct = (stageCounts[s.key] || 0) / total * 100;
        if (pct === 0) return '';
        return `<div style="width:${pct}%; background:${s.color}; height:100%; min-width:2px; border-right:1px solid var(--bg-card);" title="${s.key}: ${stageCounts[s.key] || 0}"></div>`;
    }).join('');

    container.innerHTML = `
        <div style="display:flex; height:12px; border-radius:var(--radius-full); overflow:hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);">
            ${segments}
        </div>`;
}

/* ──────────────────────────────────────────
   MINI PROGRESS RING (Kanban Header)
────────────────────────────────────────── */
function renderMiniRing(pct, color = 'currentColor', size = 32) {
    const r  = (size - 6) / 2;
    const c  = size / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg); filter: drop-shadow(0 0 4px ${color});">
            <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--border-default)" stroke-width="4"/>
            <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${color}" stroke-width="4"
                    stroke-dasharray="${dash} ${circ - dash}" stroke-linecap="round"
                    style="transition: stroke-dasharray 1s var(--ease-spring);"/>
        </svg>`;
}
