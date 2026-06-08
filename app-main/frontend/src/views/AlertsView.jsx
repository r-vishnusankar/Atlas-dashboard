import React, { useMemo, useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { computeAlerts, countdownLabel, formatDate, initials, avatarColor } from "@/lib/helpers";
import { AlertTriangle, Clock, TrendingDown, CheckCircle2 } from "lucide-react";
import ProjectDetailSheet from "@/components/ProjectDetailSheet";

function AlertGroup({ title, tone, description, projects, onOpen, testId, icon: Icon }) {
  const colorMap = {
    danger: "var(--stresk-danger)",
    warning: "#b26b00",
    info: "var(--stresk-primary-600)",
    success: "var(--stresk-success)",
  };
  const color = colorMap[tone] || "var(--stresk-text-muted)";

  return (
    <section className="space-y-3" data-testid={testId}>
      <div className="flex items-end justify-between">
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 600,
              color,
              fontSize: 15,
            }}
          >
            <Icon size={18} /> {title}{" "}
            <span
              style={{
                background: `${color}18`,
                color,
                padding: "2px 9px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
              }}
              data-testid={`${testId}-count`}
            >
              {projects.length}
            </span>
          </div>
          <div
            style={{ color: "var(--stresk-text-muted)", fontSize: 13, marginTop: 2 }}
          >
            {description}
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div
          className="stresk-card"
          style={{
            padding: 18,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "var(--stresk-success)",
            fontSize: 13,
          }}
        >
          <CheckCircle2 size={16} /> None right now — you're clear.
        </div>
      ) : (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
        >
          {projects.map((p) => (
            <div
              key={p.project_id}
              className="stresk-card"
              style={{ padding: 14, cursor: "pointer", borderLeft: `4px solid ${color}` }}
              onClick={() => onOpen(p)}
              data-testid={`${testId}-item-${p.project_id}`}
            >
              <div style={{ display: "flex", gap: 12 }}>
                <div
                  className="avatar"
                  style={{ background: avatarColor(p.owner) }}
                >
                  {initials(p.owner)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.project_name}</div>
                  <div style={{ fontSize: 12, color: "var(--stresk-text-muted)" }}>
                    {p.client} · {p.owner}
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    fontSize: 12,
                    color,
                  }}
                >
                  {countdownLabel(p)}
                  <div
                    style={{
                      fontWeight: 500,
                      color: "var(--stresk-text-subtle)",
                      marginTop: 2,
                    }}
                  >
                    {formatDate(p.release_date)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function AlertsView() {
  const { projects } = useDashboard();
  const alerts = useMemo(() => computeAlerts(projects), [projects]);
  const [active, setActive] = useState(null);

  return (
    <div className="space-y-8" data-testid="alerts-view">
      <div>
        <div className="stresk-page-title">Alerts & risk center</div>
        <div className="stresk-page-sub">
          Auto-computed from project dates, stage, and progress.
        </div>
      </div>

      <AlertGroup
        title="Overdue"
        tone="danger"
        description="Past their release date and not yet live."
        projects={alerts.overdue}
        onOpen={setActive}
        testId="alerts-overdue"
        icon={AlertTriangle}
      />

      <AlertGroup
        title="At risk"
        tone="warning"
        description="≤ 7 days to release and not yet in Release/Live."
        projects={alerts.atRisk}
        onOpen={setActive}
        testId="alerts-atrisk"
        icon={Clock}
      />

      <AlertGroup
        title="Stalled"
        tone="info"
        description="Under 30% progress despite being started 30+ days ago."
        projects={alerts.stalled}
        onOpen={setActive}
        testId="alerts-stalled"
        icon={TrendingDown}
      />

      <AlertGroup
        title="Upcoming (7–14 days)"
        tone="info"
        description="Approaching release — prepare cutover checklists."
        projects={alerts.upcoming}
        onOpen={setActive}
        testId="alerts-upcoming"
        icon={Clock}
      />

      <ProjectDetailSheet project={active} onOpenChange={(v) => !v && setActive(null)} />
    </div>
  );
}
