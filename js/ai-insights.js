/**
 * Atlas AI Insights — optional Groq narratives over deterministic metrics.
 * Never mutates AppState or replaces computeAlerts / computeCompletionPrediction.
 */
const AiInsights = {
    _health: null,
    _healthAt: 0,
    _inflight: new Map(),

    isFeatureOn() {
        return typeof featureOn === "function" && featureOn("AI_INSIGHTS");
    },

    apiBase() {
        return (CONFIG.AI && CONFIG.AI.API_BASE) || "/api/ai";
    },

    cacheTtlMs() {
        return (CONFIG.AI && CONFIG.AI.CACHE_TTL_MS) || 900000;
    },

    async checkHealth(force) {
        if (!this.isFeatureOn()) return { enabled: false };
        const now = Date.now();
        if (!force && this._health && now - this._healthAt < 60000) return this._health;
        try {
            const res = await fetch(`${this.apiBase()}/health`, { cache: "no-store" });
            if (!res.ok) {
                this._health = { enabled: false };
            } else {
                this._health = await res.json();
            }
        } catch (_) {
            this._health = { enabled: false };
        }
        this._healthAt = now;
        return this._health;
    },

    async isAvailable() {
        if (!this.isFeatureOn()) return false;
        const h = await this.checkHealth(false);
        return !!h.enabled;
    },

    _cacheKey(type, payload) {
        const ws = (typeof AppState !== "undefined" && AppState.activeWorkspaceId) || "default";
        let hash = 0;
        const s = JSON.stringify(payload);
        for (let i = 0; i < s.length; i++) hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
        return `atlas_ai_${ws}_${type}_${hash}`;
    },

    _readCache(key) {
        try {
            const raw = sessionStorage.getItem(key);
            if (!raw) return null;
            const entry = JSON.parse(raw);
            if (!entry || Date.now() - entry.ts > this.cacheTtlMs()) {
                sessionStorage.removeItem(key);
                return null;
            }
            return entry.text;
        } catch (_) {
            return null;
        }
    },

    _writeCache(key, text) {
        try {
            sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), text }));
        } catch (_) { /* quota */ }
    },

    _formatAiText(text) {
        if (!text) return "";
        const esc = typeof escapeHtml === "function" ? escapeHtml(text) : text;
        const lines = esc.split("\n");
        const processedLines = [];
        let inList = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            const listMatch = line.match(/^[\*\-•]\s+(.*)$/);

            if (listMatch) {
                if (!inList) {
                    processedLines.push('<ul class="ai-insights-list">');
                    inList = true;
                }
                let content = listMatch[1];
                content = content.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
                processedLines.push(`<li>${content}</li>`);
            } else {
                if (inList) {
                    processedLines.push('</ul>');
                    inList = false;
                }
                let content = lines[i];
                content = content.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
                processedLines.push(content);
            }
        }
        if (inList) {
            processedLines.push('</ul>');
        }

        let finalHtml = processedLines.join('\n');
        finalHtml = finalHtml.replace(/\n/g, '<br>');
        finalHtml = finalHtml.replace(/<br>\s*(<\/?ul[^>]*>|<\/?li>)/g, '$1');
        finalHtml = finalHtml.replace(/(<\/?ul[^>]*>|<\/?li>)\s*<br>/g, '$1');
        return finalHtml;
    },

    async fetchInsight(type, payload, opts) {
        const options = opts || {};
        const key = this._cacheKey(type, payload);
        if (!options.skipCache) {
            const cached = this._readCache(key);
            if (cached) return { ok: true, text: cached, cached: true };
        }
        if (this._inflight.has(key)) return this._inflight.get(key);

        const promise = (async () => {
            try {
                const res = await fetch(`${this.apiBase()}/insights`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    cache: "no-store",
                    body: JSON.stringify({ type, payload }),
                });
                const data = await res.json();
                if (data.ok && data.text) {
                    this._writeCache(key, data.text);
                }
                return data;
            } catch (e) {
                return { ok: false, error: e.message || "Network error" };
            } finally {
                this._inflight.delete(key);
            }
        })();
        this._inflight.set(key, promise);
        return promise;
    },

    /* ── Payload builders (read-only snapshots) ── */

    buildAnalyticsPayload() {
        const projects = AppState.allProjects || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const alerts = AppState.alerts || { overdue: [], at_risk: [], upcoming: [], stalled: [] };
        const minSlack = CONFIG.PREDICTIVE_ALERT_MIN_SLACK_DAYS ?? 0;
        const predictions = typeof buildPredictiveList === "function" ? buildPredictiveList() : [];
        const likelyMiss = predictions.filter((p) => p.diffDays > minSlack).slice(0, 12);
        const heatmap = typeof buildStageHeatmap === "function" ? buildStageHeatmap() : [];
        const clients = typeof buildClientScorecard === "function" ? buildClientScorecard().slice(0, 10) : [];
        const vel = typeof buildVelocityData === "function" ? buildVelocityData() : [];
        const liveProjs = projects.filter((p) => normalizeStage(p.stage || "") === "Live");
        const liveWithDates = liveProjs.filter((p) => p.release_date && p.actual_live_date);
        const onTimeCount = liveWithDates.filter((p) => {
            const rel = parseSmartDate(p.release_date);
            const live = parseSmartDate(p.actual_live_date);
            return rel && live && !isNaN(rel.getTime()) && !isNaN(live.getTime()) && live <= rel;
        }).length;
        const onTimeRate = liveWithDates.length ? Math.round((onTimeCount / liveWithDates.length) * 100) : null;

        return {
            workspace: AppState.activeWorkspaceId,
            generated_at: today.toISOString().slice(0, 10),
            project_count: projects.length,
            kpis: {
                on_time_rate_pct: onTimeRate,
                live_with_dates: liveWithDates.length,
                alert_overdue: alerts.overdue.length,
                alert_likely_miss: alerts.at_risk.length,
                alert_upcoming: alerts.upcoming.length,
                alert_stalled: alerts.stalled.length,
                unique_alerts: typeof getUniqueAlertProjects === "function"
                    ? getUniqueAlertProjects(alerts).length
                    : null,
                avg_progress_pct: AppState.avgProgress,
            },
            likely_miss: likelyMiss.map((p) => ({
                name: p.name,
                stage: p.stage,
                progress_pct: p.progress,
                diff_days: p.diffDays,
                target: p.target ? p.target.toISOString().slice(0, 10) : null,
                projected: p.projected ? p.projected.toISOString().slice(0, 10) : null,
            })),
            overdue: (alerts.overdue || []).slice(0, 8).map((p) => ({
                name: p.name,
                days_overdue: p.daysOverdue ?? (p.daysToRelease != null ? Math.abs(p.daysToRelease) : null),
                owner: p.owner,
            })),
            stage_heatmap: heatmap.map((s) => ({
                stage: s.stage,
                count: s.count,
                avg_days: s.avgDays,
            })),
            clients: clients.map((c) => ({
                name: c.name,
                active: c.active,
                live: c.live,
                on_time_pct: c.liveCount ? Math.round((c.onTime / c.liveCount) * 100) : null,
            })),
            velocity_months: vel.map((m) => ({
                label: m.label,
                on_time: m.onTime,
                late: m.late,
            })),
            note: "Velocity diffDays from computeCompletionPrediction; alert buckets from computeAlerts.",
        };
    },

    buildProjectPayload(project) {
        if (!project) return {};
        const pred = typeof computeCompletionPrediction === "function"
            ? computeCompletionPrediction(project)
            : null;
        const bucket = typeof alertBucketFor === "function"
            ? alertBucketFor(project.id, AppState.alerts)
            : null;
        const prog = typeof projectDisplayProgress === "function"
            ? projectDisplayProgress(project)
            : project.progress;
        const rm = project.roadmap || {};
        return {
            id: project.id,
            name: project.name,
            client: project.client,
            owner: project.owner,
            stage: project.stage,
            status: project.status,
            progress_pct: prog,
            release_date: project.release_date,
            start_date: project.start_date,
            actual_live_date: project.actual_live_date,
            alert_bucket: bucket,
            velocity_forecast: pred ? {
                diff_days: pred.diffDays,
                projected: pred.projected ? pred.projected.toISOString().slice(0, 10) : null,
                target: pred.target ? pred.target.toISOString().slice(0, 10) : null,
            } : null,
            roadmap: rm.hasSibling ? {
                total: rm.total,
                live: rm.live,
                in_progress: rm.inprog,
                pending: rm.pending,
                avg_pct: rm.avgPct,
            } : null,
        };
    },

    buildPredictivePayload() {
        const minSlack = CONFIG.PREDICTIVE_ALERT_MIN_SLACK_DAYS ?? 0;
        const predictions = typeof buildPredictiveList === "function" ? buildPredictiveList() : [];
        const likelyMiss = predictions.filter((p) => p.diffDays > minSlack);
        const onTrack = predictions.filter((p) => p.diffDays <= 0);
        const mapRow = (p) => ({
            name: p.name,
            stage: p.stage,
            progress_pct: p.progress,
            diff_days: p.diffDays,
            target: p.target ? p.target.toISOString().slice(0, 10) : null,
            projected: p.projected ? p.projected.toISOString().slice(0, 10) : null,
            status: p.status,
        });
        return {
            workspace: AppState.activeWorkspaceId,
            model: "velocity_forecast",
            formula_note: "projected_finish = start + (elapsed_days / (progress/100)); diff_days = projected - target",
            likely_miss_count: likelyMiss.length,
            on_track_count: onTrack.length,
            likely_miss: likelyMiss.slice(0, 10).map(mapRow),
            on_track: onTrack.slice(0, 6).map(mapRow),
        };
    },

    buildOverviewPayload() {
        const alerts = AppState.alerts || {};
        const resMap = AppState.resourceMap || {};
        const conflicts = Object.values(resMap).filter((p) => p.conflicts && p.conflicts.length > 0).length;
        const base = {
            workspace: AppState.activeWorkspaceId,
            project_count: (AppState.allProjects || []).length,
            overdue_count: (alerts.overdue || []).length,
            likely_miss_count: (alerts.at_risk || []).length,
            upcoming_count: (alerts.upcoming || []).length,
            stalled_count: (alerts.stalled || []).length,
            resource_conflicts: conflicts,
            avg_progress_pct: AppState.avgProgress,
            top_overdue: (alerts.overdue || []).slice(0, 5).map((p) => p.name),
            top_likely_miss: (alerts.at_risk || []).slice(0, 5).map((p) => ({
                name: p.name,
                diff_days: p.diffDays,
            })),
        };
        if (typeof intelligenceEnabled === 'function' && intelligenceEnabled()) {
            base.intelligence = AppState.intelligenceSummary;
            base.top_attention = (AppState.attentionRanked || []).slice(0, 5).map((p) => ({
                name: p.name,
                score: p.attentionScore,
                tier: p.attentionTier,
            }));
        }
        return base;
    },

    buildIntelligencePayload() {
        const sum = AppState.intelligenceSummary || {};
        const intake = AppState.intakeRecommendation || {};
        const cap = AppState.capacityForecast || {};
        return {
            workspace: AppState.activeWorkspaceId,
            summary: sum,
            intake_slots: { small: intake.small, medium: intake.medium, large: intake.large },
            top_attention: (AppState.attentionRanked || []).slice(0, 8).map((p) => ({
                name: p.name,
                score: p.attentionScore,
                tier: p.attentionTier,
                reasons: p.attentionReasons,
                stage: p.stage,
            })),
            freeing_next_30: (cap.summary?.freeingNext30 || []).slice(0, 8),
            utilization_by_role: Object.fromEntries(
                ['Developer', 'QA', 'BA'].map((role) => {
                    const w = cap.roles?.[role]?.weeks?.[0];
                    return [role, w ? w.utilizationPct : null];
                })
            ),
            bench_risk: sum.bench_risk,
            hiring_signal: sum.hiring_signal,
        };
    },

    buildCapacityPayload() {
        const cap = AppState.capacityForecast || {};
        const roles = cap.roles || {};
        return {
            workspace: AppState.activeWorkspaceId,
            horizons: cap.horizons || [30, 60, 90],
            roles: Object.fromEntries(
                Object.entries(roles).map(([role, data]) => [
                    role,
                    {
                        max_per_person: data.maxPerPerson,
                        week_0_util_pct: data.weeks?.[0]?.utilizationPct,
                        week_4_util_pct: data.weeks?.[4]?.utilizationPct,
                        week_12_util_pct: data.weeks?.[12]?.utilizationPct,
                        people: (data.people || []).length,
                    },
                ])
            ),
            freeing_next_30: (cap.summary?.freeingNext30 || []).slice(0, 10),
            bench_risk_weeks: cap.summary?.benchRiskWeeks,
            shortage_weeks: cap.summary?.shortageWeeks,
        };
    },

    /* ── UI shells (additive DOM only) ── */

    /** Compact AI block embedded inside Predictive Completion card */
    predictiveShellHtml(mountId) {
        if (!this.isFeatureOn()) return "";
        return `
        <div class="ai-predictive-insight" id="${mountId}" data-ai-mount="${mountId}">
            <div class="ai-predictive-insight__head">
                <span class="ai-predictive-insight__title">AI forecast interpretation</span>
                <button type="button" class="ai-insights-btn ai-insights-btn--sm" data-ai-refresh="${mountId}">Refresh</button>
            </div>
            <div class="ai-predictive-insight__body" data-ai-body="${mountId}">
                <div class="ai-insights-placeholder">Checking AI…</div>
            </div>
        </div>`;
    },

    shellHtml(mountId, title, subtitle) {
        return `
        <div class="ai-insights-card card-light" id="${mountId}" data-ai-mount="${mountId}">
            <div class="ai-insights-head">
                <div>
                    <div class="ai-insights-title">${escapeHtml(title)}</div>
                    <div class="ai-insights-sub">${escapeHtml(subtitle)}</div>
                </div>
                <button type="button" class="ai-insights-btn" data-ai-refresh="${mountId}">Refresh</button>
            </div>
            <div class="ai-insights-body" data-ai-body="${mountId}">
                <div class="ai-insights-placeholder">Checking AI availability…</div>
            </div>
        </div>`;
    },

    _hasRenderedInsight(body) {
        return !!(body && (body.querySelector('.ai-insights-text') || body.querySelector('.ai-insights-error') || body.querySelector('.ai-insights-off')));
    },

    async _renderInto(mountId, type, payloadBuilder, title, opts = {}) {
        const mount = document.getElementById(mountId);
        if (!mount) return;
        const body = mount.querySelector(`[data-ai-body="${mountId}"]`);
        const btn = mount.querySelector(`[data-ai-refresh="${mountId}"]`);
        if (!body) return;

        if (opts.soft && this._hasRenderedInsight(body)) return;

        const available = await this.isAvailable();
        if (!available) {
            body.innerHTML = `<div class="ai-insights-off">AI insights off — add <code>GROQ_API_KEY</code> to <code>.env</code> and restart <code>python serve.py</code>. Deterministic metrics unchanged.</div>`;
            if (btn) btn.style.display = "none";
            return;
        }
        if (btn) btn.style.display = "";

        body.innerHTML = `<div class="ai-insights-loading">Generating ${escapeHtml(title)}…</div>`;
        const payload = payloadBuilder.call(this);
        const result = await this.fetchInsight(type, payload);
        if (result.ok && result.text) {
            const tag = result.cached ? '<span class="ai-insights-tag">cached</span>' : "";
            body.innerHTML = `<div class="ai-insights-text">${this._formatAiText(result.text)}</div>${tag}`;
        } else {
            body.innerHTML = `<div class="ai-insights-error">${escapeHtml(result.error || "Could not generate insight")}. Charts and alerts are still accurate.</div>`;
        }
    },

    _bindRefresh(mountId, type, payloadBuilder, title) {
        const mount = document.getElementById(mountId);
        if (!mount || mount.dataset.aiBound) return;
        mount.dataset.aiBound = "1";
        const btn = mount.querySelector(`[data-ai-refresh="${mountId}"]`);
        if (btn) {
            btn.addEventListener("click", () => {
                const key = this._cacheKey(type, payloadBuilder.call(this));
                try { sessionStorage.removeItem(key); } catch (_) {}
                this._renderInto(mountId, type, payloadBuilder, title);
            });
        }
    },

    mountAnalytics(opts = {}) {
        if (!this.isFeatureOn()) return;
        this.mountPredictive(opts);
    },

    mountPredictive(opts = {}) {
        if (!this.isFeatureOn()) return;
        const mountId = "ai-predictive-insights";
        this._renderInto(mountId, "predictive_summary", this.buildPredictivePayload, "forecast insight", opts);
        this._bindRefresh(mountId, "predictive_summary", this.buildPredictivePayload, "forecast insight");
    },

    mountOverview(opts = {}) {
        if (!this.isFeatureOn()) return;
        const mountId = "ai-overview-insights";
        this._renderInto(mountId, "overview_brief", this.buildOverviewPayload, "mission brief", opts);
        this._bindRefresh(mountId, "overview_brief", this.buildOverviewPayload, "mission brief");
    },

    mountProject(projectId, opts = {}) {
        if (!this.isFeatureOn()) return;
        const mountId = "ai-project-insights";
        const p = AppState.allProjects.find((x) => x.id === projectId);
        if (!p) return;
        const builder = () => this.buildProjectPayload(p);
        this._renderInto(mountId, "project_brief", builder, "project brief", opts);
        this._bindRefresh(mountId, "project_brief", builder, "project brief");
    },

    capacityShellHtml(mountId) {
        if (!this.isFeatureOn()) return "";
        return `
        <div class="ai-predictive-insight" id="${mountId}" data-ai-mount="${mountId}" style="margin-top:12px;">
            <div class="ai-predictive-insight__head">
                <span class="ai-predictive-insight__title">AI capacity summary</span>
                <button type="button" class="ai-insights-btn ai-insights-btn--sm" data-ai-refresh="${mountId}">Refresh</button>
            </div>
            <div class="ai-predictive-insight__body" data-ai-body="${mountId}">
                <div class="ai-insights-placeholder">Checking AI…</div>
            </div>
        </div>`;
    },

    mountIntelligence(opts = {}) {
        if (!this.isFeatureOn()) return;
        const mountId = "ai-intelligence-insights";
        this._renderInto(mountId, "intelligence_brief", this.buildIntelligencePayload, "executive brief", opts);
        this._bindRefresh(mountId, "intelligence_brief", this.buildIntelligencePayload, "executive brief");
    },

    mountCapacity(opts = {}) {
        if (!this.isFeatureOn()) return;
        const mountId = "ai-capacity-insights";
        if (!document.getElementById(mountId)) return;
        this._renderInto(mountId, "capacity_summary", this.buildCapacityPayload, "capacity summary", opts);
        this._bindRefresh(mountId, "capacity_summary", this.buildCapacityPayload, "capacity summary");
    },
};
