/**
 * Atlas PageSpeed Insights — Google PSI scores on the project page.
 * Defaults to the project homepage (website_url). Cache in sessionStorage.
 */
const PageSpeed = {
    _inflight: new Map(),

    isFeatureOn() {
        return typeof featureOn === "function" && featureOn("PAGESPEED_INSIGHTS");
    },

    apiBase() {
        return (CONFIG.PSI && CONFIG.PSI.API_BASE) || "/api/psi";
    },

    googleEndpoint() {
        return (CONFIG.PSI && CONFIG.PSI.GOOGLE_ENDPOINT)
            || "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
    },

    cacheTtlMs() {
        return (CONFIG.PSI && CONFIG.PSI.CACHE_TTL_MS) || 3600000;
    },

    timeoutMs() {
        return (CONFIG.PSI && CONFIG.PSI.TIMEOUT_MS) || 90000;
    },

    defaultStrategy() {
        return (CONFIG.PSI && CONFIG.PSI.DEFAULT_STRATEGY) || "mobile";
    },

    homepageUrl(project) {
        const raw = project?.website_url;
        if (typeof normalizeWebsiteUrl === "function") return normalizeWebsiteUrl(raw);
        return String(raw || "").trim();
    },

    resolveAnalyzeUrl(homeUrl, pageKey, customRaw) {
        const home = String(homeUrl || "").trim();
        if (pageKey !== "custom") return home;
        const custom = String(customRaw || "").trim();
        if (!custom) return home;
        if (/^https?:\/\//i.test(custom)) {
            return typeof normalizeWebsiteUrl === "function" ? normalizeWebsiteUrl(custom) : custom;
        }
        try {
            const origin = new URL(home).origin;
            const path = custom.startsWith("/") ? custom : `/${custom}`;
            return origin + path;
        } catch (_) {
            return home;
        }
    },

    _cacheKey(url, strategy) {
        return `atlas_psi_${strategy}_${url}`;
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
            return entry.data;
        } catch (_) {
            return null;
        }
    },

    _writeCache(key, data) {
        try {
            sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
        } catch (_) { /* quota */ }
    },

    _audit(audits, key) {
        const a = (audits && audits[key]) || null;
        if (!a) return null;
        return { display: a.displayValue || "", value: a.numericValue, score: a.score };
    },

    _catScore(cats, key) {
        const s = cats && cats[key] && cats[key].score;
        if (s == null || Number.isNaN(Number(s))) return null;
        return Math.round(Number(s) * 100);
    },

    _fieldMetric(metrics, key) {
        const m = (metrics && metrics[key]) || null;
        if (!m) return null;
        return { percentile: m.percentile, category: m.category };
    },

    slimGoogle(psi, strategy) {
        const lh = psi.lighthouseResult || {};
        const cats = lh.categories || {};
        const audits = lh.audits || {};
        const crux = (psi.loadingExperience && psi.loadingExperience.metrics) || {};
        return {
            ok: true,
            url: psi.id || "",
            strategy,
            fetchedAt: psi.analysisUTCTimestamp || lh.fetchTime || "",
            scores: {
                performance: this._catScore(cats, "performance"),
                accessibility: this._catScore(cats, "accessibility"),
                bestPractices: this._catScore(cats, "best-practices"),
                seo: this._catScore(cats, "seo"),
            },
            metrics: {
                fcp: this._audit(audits, "first-contentful-paint"),
                lcp: this._audit(audits, "largest-contentful-paint"),
                tbt: this._audit(audits, "total-blocking-time"),
                cls: this._audit(audits, "cumulative-layout-shift"),
                si: this._audit(audits, "speed-index"),
                tti: this._audit(audits, "interactive"),
                inp: this._audit(audits, "interaction-to-next-paint"),
            },
            field: {
                lcp: this._fieldMetric(crux, "LARGEST_CONTENTFUL_PAINT_MS"),
                inp: this._fieldMetric(crux, "INTERACTION_TO_NEXT_PAINT")
                    || this._fieldMetric(crux, "FIRST_INPUT_DELAY_MS"),
                cls: this._fieldMetric(crux, "CUMULATIVE_LAYOUT_SHIFT_SCORE"),
            },
        };
    },

    async _fetchWithTimeout(url) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs());
        try {
            return await fetch(url, { cache: "no-store", signal: controller.signal });
        } finally {
            clearTimeout(timer);
        }
    },

    async _fetchGoogle(url, strategy) {
        const params = new URLSearchParams();
        params.set("url", url);
        params.set("strategy", strategy);
        ["performance", "accessibility", "best-practices", "seo"].forEach((c) => params.append("category", c));
        const res = await this._fetchWithTimeout(`${this.googleEndpoint()}?${params.toString()}`);
        const raw = await res.json().catch(() => ({}));
        if (!res.ok) {
            const msg = (raw.error && raw.error.message) || `PageSpeed API error (${res.status})`;
            return { ok: false, error: msg };
        }
        if (!raw || !raw.lighthouseResult) {
            const msg = (raw.error && raw.error.message) || "PageSpeed returned no Lighthouse result";
            return { ok: false, error: msg };
        }
        return this.slimGoogle(raw, strategy);
    },

    async fetchReport(url, strategy, { force } = {}) {
        const key = this._cacheKey(url, strategy);
        if (!force) {
            const cached = this._readCache(key);
            if (cached) return { ...cached, cached: true };
        }
        if (this._inflight.has(key)) return this._inflight.get(key);

        const job = (async () => {
            try {
                const proxyUrl = `${this.apiBase()}?url=${encodeURIComponent(url)}&strategy=${encodeURIComponent(strategy)}`;
                const res = await this._fetchWithTimeout(proxyUrl);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.ok) {
                        this._writeCache(key, data);
                        return data;
                    }
                    if (data && data.error && res.status !== 404 && res.status !== 405) {
                        return { ok: false, error: data.error };
                    }
                }
            } catch (_) { /* fall through to Google */ }

            try {
                const data = await this._fetchGoogle(url, strategy);
                if (data && data.ok) this._writeCache(key, data);
                return data;
            } catch (err) {
                const aborted = err && (err.name === "AbortError" || /aborted/i.test(String(err)));
                return {
                    ok: false,
                    error: aborted
                        ? "Analysis timed out — try Refresh in a moment"
                        : (err.message || "Could not reach PageSpeed Insights"),
                };
            }
        })();

        this._inflight.set(key, job);
        try {
            return await job;
        } finally {
            this._inflight.delete(key);
        }
    },

    scoreBand(n) {
        if (n == null || Number.isNaN(Number(n))) return "na";
        if (n >= 90) return "good";
        if (n >= 50) return "mid";
        return "poor";
    },

    metricBand(kind, valueMs) {
        if (valueMs == null || Number.isNaN(Number(valueMs))) return "na";
        const v = Number(valueMs);
        if (kind === "lcp") return v <= 2500 ? "good" : v <= 4000 ? "mid" : "poor";
        if (kind === "fcp") return v <= 1800 ? "good" : v <= 3000 ? "mid" : "poor";
        if (kind === "tbt") return v <= 200 ? "good" : v <= 600 ? "mid" : "poor";
        if (kind === "si") return v <= 3400 ? "good" : v <= 5800 ? "mid" : "poor";
        if (kind === "cls") return v <= 0.1 ? "good" : v <= 0.25 ? "mid" : "poor";
        if (kind === "inp") return v <= 200 ? "good" : v <= 500 ? "mid" : "poor";
        return "na";
    },

    reportUrl(url, strategy) {
        const qs = new URLSearchParams({ url, form_factor: strategy === "desktop" ? "desktop" : "mobile" });
        return `https://pagespeed.web.dev/analysis?${qs.toString()}`;
    },

    _ring(score, label) {
        const n = score == null ? null : Number(score);
        const band = this.scoreBand(n);
        const dash = n == null ? 0 : Math.max(0, Math.min(100, n));
        const shown = n == null ? "—" : String(n);
        return `
        <div class="psi-gauge psi-gauge--${band}">
            <svg class="psi-ring" viewBox="0 0 36 36" aria-hidden="true">
                <path class="psi-ring__track" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="psi-ring__fill" stroke-dasharray="${dash}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            </svg>
            <div class="psi-gauge__score">${shown}</div>
            <div class="psi-gauge__label">${escapeHtml(label)}</div>
        </div>`;
    },

    _metricChip(label, metric, kind) {
        if (!metric) return "";
        const display = metric.display || (metric.value != null ? String(metric.value) : "—");
        const band = this.metricBand(kind, metric.value);
        return `<div class="psi-chip psi-chip--${band}">
            <span class="psi-chip__lbl">${escapeHtml(label)}</span>
            <span class="psi-chip__val">${escapeHtml(display)}</span>
        </div>`;
    },

    _fieldChip(label, field) {
        if (!field || field.percentile == null) return "";
        const cat = String(field.category || "").toLowerCase();
        const band = cat === "fast" ? "good" : cat === "average" ? "mid" : cat === "slow" ? "poor" : "na";
        return `<div class="psi-chip psi-chip--${band}">
            <span class="psi-chip__lbl">${escapeHtml(label)} (field)</span>
            <span class="psi-chip__val">${escapeHtml(String(field.percentile))}</span>
        </div>`;
    },

    renderReport(data, analyzedUrl, strategy) {
        const s = data.scores || {};
        const m = data.metrics || {};
        const field = data.field || {};
        const host = typeof websiteHostname === "function" ? websiteHostname(analyzedUrl) : analyzedUrl;
        const cached = data.cached ? `<span class="psi-tag">cached</span>` : "";
        const reportHref = this.reportUrl(analyzedUrl, strategy);
        const chips = [
            this._metricChip("LCP", m.lcp, "lcp"),
            this._metricChip("INP / TBT", m.inp || m.tbt, m.inp ? "inp" : "tbt"),
            this._metricChip("CLS", m.cls, "cls"),
            this._metricChip("FCP", m.fcp, "fcp"),
            this._metricChip("Speed Index", m.si, "si"),
        ].join("");
        const fieldBits = [
            this._fieldChip("LCP", field.lcp),
            this._fieldChip("INP", field.inp),
            this._fieldChip("CLS", field.cls),
        ].join("");
        return `
        <div class="psi-scores">
            ${this._ring(s.performance, "Performance")}
            ${this._ring(s.accessibility, "Accessibility")}
            ${this._ring(s.bestPractices, "Best Practices")}
            ${this._ring(s.seo, "SEO")}
        </div>
        <div class="psi-chips">${chips}</div>
        ${fieldBits ? `<div class="psi-chips psi-chips--field">${fieldBits}</div>` : ""}
        <div class="psi-foot">
            <span class="psi-foot__url" title="${escapeHtml(analyzedUrl)}">${escapeHtml(host || analyzedUrl)}</span>
            ${cached}
            <a class="psi-foot__link" href="${escapeHtml(reportHref)}" target="_blank" rel="noopener noreferrer">Full report ↗</a>
        </div>`;
    },

    shellHtml(project) {
        if (!this.isFeatureOn()) return "";
        const home = this.homepageUrl(project);
        const host = home && typeof websiteHostname === "function" ? websiteHostname(home) : "";
        const strat = this.defaultStrategy();
        return `
        <section class="psi-panel" id="psi-panel" data-psi-project="${escapeHtml(project?.id || "")}" data-psi-home="${escapeHtml(home)}">
            <header class="psi-head">
                <div class="psi-head__copy">
                    <h2 class="psi-title">PageSpeed Insights</h2>
                    <p class="psi-sub">${home
                        ? `Lab scores for the live site — homepage of ${escapeHtml(host || home)} by default.`
                        : "Add a website URL on the Project tab to analyze the homepage."}</p>
                </div>
                <div class="psi-head__controls">
                    <label class="psi-page-label">
                        <span class="sr-only">Page</span>
                        <select class="psi-page-select" data-psi-page ${home ? "" : "disabled"}>
                            <option value="home" selected>Homepage</option>
                            <option value="custom">Other URL…</option>
                        </select>
                    </label>
                    <div class="psi-strategy" role="group" aria-label="Device">
                        <button type="button" class="psi-seg${strat === "mobile" ? " is-active" : ""}" data-psi-strategy="mobile">Mobile</button>
                        <button type="button" class="psi-seg${strat === "desktop" ? " is-active" : ""}" data-psi-strategy="desktop">Desktop</button>
                    </div>
                    <button type="button" class="psi-refresh" data-psi-refresh ${home ? "" : "disabled"}>Refresh</button>
                </div>
            </header>
            <div class="psi-custom" data-psi-custom hidden>
                <input class="psi-custom__input" type="url" data-psi-custom-url placeholder="https://example.com/about or /about" ${home ? "" : "disabled"}>
                <button type="button" class="psi-refresh" data-psi-analyze>Analyze</button>
            </div>
            <div class="psi-body" data-psi-body>
                <div class="psi-placeholder">${home ? "Loading PageSpeed Insights…" : "No website URL on this project yet."}</div>
            </div>
        </section>`;
    },

    _currentStrategy(panel) {
        const active = panel.querySelector(".psi-seg.is-active");
        return (active && active.getAttribute("data-psi-strategy")) || this.defaultStrategy();
    },

    _hasReport(body) {
        return !!(body && body.querySelector(".psi-scores"));
    },

    async _run(panel, { force, soft } = {}) {
        const body = panel.querySelector("[data-psi-body]");
        if (!body) return;
        const home = panel.getAttribute("data-psi-home") || "";
        if (!home) {
            body.innerHTML = `<div class="psi-empty">Add a <code>website_url</code> on the Project tab to run PageSpeed Insights on the homepage.</div>`;
            return;
        }
        if (soft && this._hasReport(body) && !force) return;

        const pageKey = (panel.querySelector("[data-psi-page]") || {}).value || "home";
        const customRaw = (panel.querySelector("[data-psi-custom-url]") || {}).value || "";
        const url = this.resolveAnalyzeUrl(home, pageKey, customRaw);
        if (!url) {
            body.innerHTML = `<div class="psi-empty">Enter a public page URL to analyze.</div>`;
            return;
        }
        const strategy = this._currentStrategy(panel);
        const gen = (Number(panel.dataset.psiGen) || 0) + 1;
        panel.dataset.psiGen = String(gen);
        const label = pageKey === "custom" ? "this page" : "the homepage";
        body.innerHTML = `<div class="psi-loading">
            <span class="psi-spinner" aria-hidden="true"></span>
            Analyzing ${escapeHtml(label)} (${escapeHtml(strategy)}) — usually 15–30 seconds.
        </div>`;

        const data = await this.fetchReport(url, strategy, { force });
        if (panel.dataset.psiGen !== String(gen)) return;

        if (data && data.ok) {
            body.innerHTML = this.renderReport(data, data.url || url, strategy);
        } else {
            const reportHref = this.reportUrl(url, strategy);
            body.innerHTML = `<div class="psi-error">
                ${escapeHtml(data && data.error ? data.error : "Could not load PageSpeed Insights")}.
                <a href="${escapeHtml(reportHref)}" target="_blank" rel="noopener noreferrer">Open in PageSpeed Insights ↗</a>
            </div>`;
        }
    },

    _bind(panel) {
        if (!panel || panel.dataset.psiBound) return;
        panel.dataset.psiBound = "1";

        const pageSel = panel.querySelector("[data-psi-page]");
        const customRow = panel.querySelector("[data-psi-custom]");
        const customInput = panel.querySelector("[data-psi-custom-url]");

        if (pageSel) {
            pageSel.addEventListener("change", () => {
                const isCustom = pageSel.value === "custom";
                if (customRow) customRow.hidden = !isCustom;
                if (!isCustom) this._run(panel, { force: false });
            });
        }
        panel.querySelectorAll("[data-psi-strategy]").forEach((btn) => {
            btn.addEventListener("click", () => {
                panel.querySelectorAll("[data-psi-strategy]").forEach((b) => b.classList.toggle("is-active", b === btn));
                this._run(panel, { force: false });
            });
        });
        const refresh = panel.querySelector("[data-psi-refresh]");
        if (refresh) {
            refresh.addEventListener("click", () => this._run(panel, { force: true }));
        }
        const analyze = panel.querySelector("[data-psi-analyze]");
        if (analyze) {
            analyze.addEventListener("click", () => this._run(panel, { force: true }));
        }
        if (customInput) {
            customInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    this._run(panel, { force: true });
                }
            });
        }
    },

    mount(projectId, opts = {}) {
        if (!this.isFeatureOn()) return;
        const panel = document.getElementById("psi-panel");
        if (!panel) return;
        if (projectId && panel.getAttribute("data-psi-project") !== String(projectId)) return;
        this._bind(panel);
        this._run(panel, opts);
    },
};
