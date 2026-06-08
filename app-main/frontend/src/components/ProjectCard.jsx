import React, { useEffect, useState } from "react";
import {
  STATUS_COLOR,
  STATUS_LABEL,
  STAGE_COLOR,
  PRIORITY_COLOR,
  initials,
  avatarColor,
  countdownLabel,
  countdownTone,
  formatDate,
} from "@/lib/helpers";

export default function ProjectCard({ project, onClick, compact = false }) {
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setFill(project.progress), 40);
    return () => clearTimeout(t);
  }, [project.progress]);

  const tone = countdownTone(project);

  return (
    <div
      className="stresk-card project-card"
      onClick={onClick}
      data-testid={`project-card-${project.project_id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onClick) onClick(e);
      }}
    >
      <span className="left-border" style={{ background: STATUS_COLOR[project.status] }} />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="name" title={project.project_name}>
            {project.project_name}
          </div>
          <div className="client">{project.client}</div>
        </div>
        <span
          className="pill"
          title={`${project.priority} priority`}
          style={{
            background: "var(--stresk-bg)",
            color: PRIORITY_COLOR[project.priority],
            borderColor: "var(--stresk-border)",
          }}
          data-testid={`priority-${project.project_id}`}
        >
          <span
            className="pill-dot"
            style={{ background: PRIORITY_COLOR[project.priority] }}
          />
          {project.priority}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          className="avatar sm"
          style={{ background: avatarColor(project.owner) }}
          title={project.owner}
        >
          {initials(project.owner)}
        </div>
        <div style={{ fontSize: 12, color: "var(--stresk-text-muted)" }}>
          {project.owner}
        </div>
        <span
          className="pill"
          style={{
            marginLeft: "auto",
            background: `${STAGE_COLOR[project.stage]}14`,
            color: STAGE_COLOR[project.stage],
          }}
        >
          <span
            className="pill-dot"
            style={{ background: STAGE_COLOR[project.stage] }}
          />
          {project.stage}
        </span>
      </div>

      <div>
        <div className="progress-label">
          <span>{STATUS_LABEL[project.status]}</span>
          <span className="mono">{project.progress}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${fill}%`,
              background: STATUS_COLOR[project.status],
            }}
          />
        </div>
      </div>

      {!compact && project.tags?.length ? (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {project.tags.slice(0, 3).map((t) => (
            <span key={t} className="tag-chip">
              {t}
            </span>
          ))}
          {project.tags.length > 3 ? (
            <span className="tag-chip">+{project.tags.length - 3}</span>
          ) : null}
        </div>
      ) : null}

      <div className="footer">
        <span style={{ fontSize: 11, color: "var(--stresk-text-subtle)" }}>
          {formatDate(project.release_date)}
        </span>
        <span className={`countdown ${tone}`} data-testid={`countdown-${project.project_id}`}>
          {countdownLabel(project)}
        </span>
      </div>
    </div>
  );
}
