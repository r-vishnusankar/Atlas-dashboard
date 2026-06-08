import React, { useMemo, useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import FilterBar from "@/components/FilterBar";
import ProjectDetailSheet from "@/components/ProjectDetailSheet";
import {
  STAGES,
  STAGE_COLOR,
  STATUS_COLOR,
  initials,
  avatarColor,
  countdownLabel,
  countdownTone,
} from "@/lib/helpers";
import { toast } from "sonner";

export default function PipelineView() {
  const { filtered } = useDashboard();
  const [dragging, setDragging] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [localMoves, setLocalMoves] = useState({}); // id -> stage override (visual)
  const [active, setActive] = useState(null);

  const projectsByStage = useMemo(() => {
    const map = Object.fromEntries(STAGES.map((s) => [s, []]));
    filtered.forEach((p) => {
      const stage = localMoves[p.project_id] || p.stage;
      if (!map[stage]) map[stage] = [];
      map[stage].push({ ...p, stage });
    });
    return map;
  }, [filtered, localMoves]);

  const handleDrop = (toStage, project) => {
    setDropTarget(null);
    setDragging(null);
    if (!project || project.stage === toStage) return;
    setLocalMoves((prev) => ({ ...prev, [project.project_id]: toStage }));
    toast(`Moved "${project.project_name}" to ${toStage}`, {
      description: "Visual only — Google Sheet is not mutated.",
    });
  };

  return (
    <div className="space-y-6" data-testid="pipeline-view">
      <div>
        <div className="stresk-page-title">Pipeline</div>
        <div className="stresk-page-sub">
          Drag cards between stages. Changes are visual-only (read-only sheet).
        </div>
      </div>

      <FilterBar />

      <div
        className="grid gap-4 overflow-x-auto scrollbar-thin"
        style={{ gridTemplateColumns: `repeat(${STAGES.length}, minmax(220px, 1fr))` }}
      >
        {STAGES.map((stage) => {
          const items = projectsByStage[stage] || [];
          const avg = items.length
            ? Math.round(
                items.reduce((a, b) => a + b.progress, 0) / items.length,
              )
            : 0;
          return (
            <div
              key={stage}
              className={"kanban-col " + (dropTarget === stage ? "drop-target" : "")}
              onDragOver={(e) => {
                e.preventDefault();
                setDropTarget(stage);
              }}
              onDragLeave={() => setDropTarget((t) => (t === stage ? null : t))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(stage, dragging);
              }}
              data-testid={`kanban-col-${stage}`}
            >
              <div className="kanban-col-head">
                <span
                  className="pill-dot"
                  style={{ background: STAGE_COLOR[stage], width: 10, height: 10 }}
                />
                <div className="name">{stage}</div>
                <span className="count" data-testid={`kanban-count-${stage}`}>
                  {items.length}
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--stresk-text-muted)",
                  marginBottom: 6,
                  letterSpacing: "0.02em",
                }}
              >
                avg progress <span className="mono">{avg}%</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((p) => (
                  <div
                    key={p.project_id}
                    className={
                      "kanban-card " +
                      (dragging?.project_id === p.project_id ? "dragging" : "")
                    }
                    draggable
                    onDragStart={() => setDragging(p)}
                    onDragEnd={() => {
                      setDragging(null);
                      setDropTarget(null);
                    }}
                    onClick={() => setActive(p)}
                    data-testid={`kanban-card-${p.project_id}`}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        lineHeight: 1.3,
                        marginBottom: 6,
                      }}
                    >
                      {p.project_name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--stresk-text-muted)",
                        marginBottom: 8,
                      }}
                    >
                      {p.client}
                    </div>
                    <div className="progress-track" style={{ marginBottom: 8 }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${p.progress}%`,
                          background: STATUS_COLOR[p.status],
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 6,
                      }}
                    >
                      <div
                        className="avatar sm"
                        style={{ background: avatarColor(p.owner) }}
                        title={p.owner}
                      >
                        {initials(p.owner)}
                      </div>
                      <span className={`countdown ${countdownTone(p)}`} style={{ fontSize: 11 }}>
                        {countdownLabel(p)}
                      </span>
                    </div>
                  </div>
                ))}
                {items.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: "var(--stresk-text-subtle)",
                      padding: "28px 0",
                    }}
                  >
                    No projects
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <ProjectDetailSheet project={active} onOpenChange={(v) => !v && setActive(null)} />
    </div>
  );
}
