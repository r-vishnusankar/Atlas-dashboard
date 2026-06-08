import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  Activity,
  Flame,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import {
  STAGES,
  STAGE_COLOR,
  STATUS_COLOR,
  STATUS_LABEL,
  computeAlerts,
  initials,
  avatarColor,
  relativeTime,
  countdownLabel,
} from "@/lib/helpers";
import KPICard from "@/components/KPICard";
import ProjectCard from "@/components/ProjectCard";
import ProjectDetailSheet from "@/components/ProjectDetailSheet";

export default function OverviewView() {
  const { projects } = useDashboard();
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  const stats = useMemo(() => {
    const total = projects.length;
    const live = projects.filter((p) => p.stage === "Live").length;
    const inProgress = projects.filter(
      (p) => !["Live"].includes(p.stage) && p.status !== "delayed",
    ).length;
    const delayed = projects.filter((p) => p.status === "delayed").length;
    return { total, live, inProgress, delayed };
  }, [projects]);

  const stageCounts = useMemo(() => {
    const map = Object.fromEntries(STAGES.map((s) => [s, 0]));
    projects.forEach((p) => {
      if (map[p.stage] !== undefined) map[p.stage]++;
    });
    return map;
  }, [projects]);

  const statusPie = useMemo(() => {
    const counts = { on_track: 0, at_risk: 0, delayed: 0 };
    projects.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts).map(([k, v]) => ({
      name: STATUS_LABEL[k],
      value: v,
      key: k,
    }));
  }, [projects]);

  const alerts = useMemo(() => computeAlerts(projects), [projects]);
  const maxStage = Math.max(1, ...Object.values(stageCounts));

  const recent = useMemo(
    () =>
      [...projects]
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 5),
    [projects],
  );

  return (
    <div className="space-y-8" data-testid="overview-view">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="stresk-page-title">Mission Control</div>
          <div className="stresk-page-sub">
            What needs attention right now across {projects.length} projects
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div
        className="grid gap-4 stagger-in"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <KPICard
          label="Total projects"
          value={stats.total}
          accent="var(--stresk-primary)"
          icon={Activity}
          trend={`${stats.live} live · ${projects.length - stats.live} active`}
          testId="kpi-total"
        />
        <KPICard
          label="Live"
          value={stats.live}
          accent="var(--stresk-success)"
          icon={CheckCircle2}
          trend="Released & running"
          testId="kpi-live"
        />
        <KPICard
          label="In progress"
          value={stats.inProgress}
          accent="#1a73e8"
          icon={Flame}
          trend="Planning → Release"
          testId="kpi-inprogress"
        />
        <KPICard
          label="Delayed"
          value={stats.delayed}
          accent="var(--stresk-danger)"
          icon={AlertTriangle}
          trend={stats.delayed ? "Needs recovery plan" : "All on schedule"}
          testId="kpi-delayed"
        />
      </div>

      {/* Pipeline funnel + Status donut */}
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" }}
      >
        <div className="stresk-card" style={{ padding: 22, minWidth: 0 }} data-testid="pipeline-funnel">
          <div className="flex items-center justify-between mb-4">
            <div className="stresk-section-title" style={{ marginBottom: 0 }}>
              Pipeline funnel
            </div>
            <button
              className="text-[12px] text-[var(--stresk-primary-600)] font-semibold hover:underline flex items-center gap-1"
              onClick={() => navigate("/pipeline")}
            >
              Open pipeline <ArrowRight size={13} />
            </button>
          </div>
          <div className="flex gap-3">
            {STAGES.map((s) => {
              const count = stageCounts[s];
              const pct = Math.round((count / maxStage) * 100);
              return (
                <div key={s} className="pipeline-stage" data-testid={`stage-${s}`}>
                  <div className="label">{s}</div>
                  <div className="count" style={{ color: STAGE_COLOR[s] }}>
                    {count}
                  </div>
                  <div
                    className="bar"
                    style={{ background: STAGE_COLOR[s], width: `${Math.max(8, pct)}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="stresk-card" style={{ padding: 22, minWidth: 0 }} data-testid="status-donut">
          <div className="stresk-section-title">Status breakdown</div>
          <div style={{ width: "100%", height: 210, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPie}
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  paddingAngle={3}
                  stroke="none"
                >
                  {statusPie.map((entry) => (
                    <Cell key={entry.key} fill={STATUS_COLOR[entry.key]} />
                  ))}
                </Pie>
                <RTooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--stresk-border)",
                    boxShadow: "var(--stresk-elev-2)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around mt-1">
            {statusPie.map((s) => (
              <div key={s.key} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--stresk-text-muted)",
                  }}
                >
                  {s.name}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: STATUS_COLOR[s.key],
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top alerts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="stresk-section-title" style={{ marginBottom: 0 }}>
            Top alerts
          </div>
          <button
            className="text-[12px] text-[var(--stresk-primary-600)] font-semibold hover:underline flex items-center gap-1"
            onClick={() => navigate("/alerts")}
            data-testid="view-all-alerts"
          >
            View all <ArrowRight size={13} />
          </button>
        </div>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
        >
          {[...alerts.overdue.slice(0, 3), ...alerts.atRisk.slice(0, 3)]
            .slice(0, 6)
            .map((p) => {
              const isOverdue = p._days && p._days > 0 && alerts.overdue.includes(p);
              return (
                <div
                  key={p.project_id}
                  className={
                    "alert-strip-card " + (isOverdue ? "danger" : "warning")
                  }
                  onClick={() => setActive(p)}
                  style={{ cursor: "pointer" }}
                  data-testid={`alert-item-${p.project_id}`}
                >
                  <AlertTriangle
                    size={18}
                    color={isOverdue ? "var(--stresk-danger)" : "#b26b00"}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {p.project_name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--stresk-text-muted)",
                      }}
                    >
                      {p.client} · {p.owner} · {countdownLabel(p)}
                    </div>
                  </div>
                </div>
              );
            })}
          {!alerts.overdue.length && !alerts.atRisk.length ? (
            <div
              className="stresk-card"
              style={{ padding: 16, color: "var(--stresk-success)" }}
              data-testid="no-alerts"
            >
              <CheckCircle2 size={18} style={{ display: "inline", marginRight: 8 }} />
              All clear — no overdue or at-risk projects.
            </div>
          ) : null}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <div className="stresk-section-title">Recent activity</div>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
        >
          {recent.map((p) => (
            <div
              key={p.project_id}
              className="stresk-card"
              style={{ padding: 14, display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}
              onClick={() => setActive(p)}
              data-testid={`recent-${p.project_id}`}
            >
              <div className="avatar" style={{ background: avatarColor(p.owner) }}>
                {initials(p.owner)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{p.project_name}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--stresk-text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Clock size={11} />
                  {relativeTime(new Date(p.updated_at).getTime())} ·{" "}
                  {p.stage}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* hidden proof of card styling; also used by detail sheet */}
      <ProjectDetailSheet
        project={active}
        onOpenChange={(v) => !v && setActive(null)}
      />

      {/* eslint-disable-next-line no-unused-vars */}
      {false && <ProjectCard project={projects[0]} />}
    </div>
  );
}
