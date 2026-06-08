import React, { useMemo, useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import FilterBar from "@/components/FilterBar";
import ProjectDetailSheet from "@/components/ProjectDetailSheet";
import { STAGE_COLOR, STATUS_COLOR, formatDate } from "@/lib/helpers";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function TimelineView() {
  const { filtered } = useDashboard();
  const [active, setActive] = useState(null);

  const { bounds, months, today } = useMemo(() => {
    if (!filtered.length) {
      const now = new Date();
      return {
        bounds: { start: now, end: now },
        months: [],
        today: now,
      };
    }
    const dates = filtered.flatMap((p) => [new Date(p.start_date), new Date(p.release_date)])
      .filter((d) => !Number.isNaN(d.getTime()));
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));
    // pad by ~1 month on each side
    min.setDate(1);
    max.setMonth(max.getMonth() + 1, 0);
    const months = [];
    const cur = new Date(min);
    while (cur <= max) {
      months.push(new Date(cur));
      cur.setMonth(cur.getMonth() + 1);
    }
    return { bounds: { start: min, end: max }, months, today: new Date() };
  }, [filtered]);

  const total = Math.max(1, bounds.end - bounds.start);
  const pctFor = (d) => Math.max(0, Math.min(100, ((new Date(d) - bounds.start) / total) * 100));
  const todayPct = pctFor(today);

  const rows = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => new Date(a.release_date) - new Date(b.release_date),
      ),
    [filtered],
  );

  return (
    <div className="space-y-6" data-testid="timeline-view">
      <div>
        <div className="stresk-page-title">Timeline</div>
        <div className="stresk-page-sub">
          Horizontal Gantt of {filtered.length} projects by release date.
        </div>
      </div>

      <FilterBar />

      <div className="stresk-card" style={{ padding: 20, overflowX: "auto" }}>
        <div style={{ minWidth: 720 }}>
          {/* month header */}
          <div className="timeline-row" style={{ borderBottom: "1px solid var(--stresk-border)" }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--stresk-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Project
            </div>
            <div style={{ position: "relative", height: 24 }}>
              {months.map((m, i) => {
                const left = pctFor(m);
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${left}%`,
                      top: 0,
                      fontSize: 11,
                      color: "var(--stresk-text-subtle)",
                      fontWeight: 500,
                    }}
                  >
                    {MONTH_LABELS[m.getMonth()]}{" "}
                    <span style={{ opacity: 0.6 }}>
                      '{String(m.getFullYear()).slice(-2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {rows.length === 0 ? (
            <div
              style={{
                padding: "48px 0",
                textAlign: "center",
                color: "var(--stresk-text-muted)",
              }}
            >
              No projects match the current filters.
            </div>
          ) : (
            rows.map((p) => {
              const left = pctFor(p.start_date);
              const right = pctFor(p.release_date);
              const width = Math.max(2, right - left);
              return (
                <div
                  key={p.project_id}
                  className="timeline-row"
                  onClick={() => setActive(p)}
                  style={{ cursor: "pointer" }}
                  data-testid={`timeline-row-${p.project_id}`}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.project_name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--stresk-text-muted)",
                      }}
                    >
                      {p.client} · {p.stage} ·{" "}
                      <span style={{ color: STATUS_COLOR[p.status], fontWeight: 600 }}>
                        {p.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="timeline-track">
                    <div
                      className="timeline-bar"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        background: STAGE_COLOR[p.stage],
                        boxShadow: `inset 0 0 0 1px ${STAGE_COLOR[p.stage]}`,
                      }}
                      title={`${formatDate(p.start_date)} → ${formatDate(p.release_date)}`}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {formatDate(p.release_date)}
                      </span>
                    </div>
                    <div className="timeline-today" style={{ left: `${todayPct}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ProjectDetailSheet project={active} onOpenChange={(v) => !v && setActive(null)} />
    </div>
  );
}
