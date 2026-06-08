import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  daysBetween,
} from "@/lib/helpers";

export default function ProjectDetailSheet({ project, onOpenChange }) {
  const open = Boolean(project);
  if (!project) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }

  const tone = countdownTone(project);
  const totalDays = daysBetween(project.release_date, project.start_date) || 1;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-lg overflow-y-auto scrollbar-thin"
        data-testid="project-detail-sheet"
      >
        <SheetHeader className="text-left">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="pill"
              style={{
                background: `${STAGE_COLOR[project.stage]}14`,
                color: STAGE_COLOR[project.stage],
              }}
            >
              <span className="pill-dot" style={{ background: STAGE_COLOR[project.stage] }} />
              {project.stage}
            </span>
            <span
              className="pill"
              style={{
                background: "var(--stresk-bg)",
                color: STATUS_COLOR[project.status],
              }}
            >
              <span className="pill-dot" style={{ background: STATUS_COLOR[project.status] }} />
              {STATUS_LABEL[project.status]}
            </span>
            <span
              className="pill"
              style={{
                background: "var(--stresk-bg)",
                color: PRIORITY_COLOR[project.priority],
              }}
            >
              {project.priority} priority
            </span>
          </div>
          <SheetTitle className="text-[22px] leading-tight">
            {project.project_name}
          </SheetTitle>
          <SheetDescription className="text-[13px]">
            {project.project_id} · {project.client}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 text-sm">
          <div>
            <div className="stresk-section-title" style={{ marginBottom: 8 }}>
              Progress
            </div>
            <div className="flex items-center gap-3">
              <div className="progress-track" style={{ flex: 1, height: 8 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${project.progress}%`,
                    background: STATUS_COLOR[project.status],
                  }}
                />
              </div>
              <span className="mono font-semibold">{project.progress}%</span>
            </div>
            <div
              className="flex items-center justify-between mt-2"
              style={{ fontSize: 12, color: "var(--stresk-text-muted)" }}
            >
              <span>{formatDate(project.start_date)}</span>
              <span className={`countdown ${tone}`}>{countdownLabel(project)}</span>
              <span>{formatDate(project.release_date)}</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--stresk-text-subtle)", marginTop: 4 }}>
              Total duration: {totalDays} days
            </div>
          </div>

          <div>
            <div className="stresk-section-title" style={{ marginBottom: 8 }}>
              Team
            </div>
            <div className="flex items-center gap-3">
              <div
                className="avatar lg"
                style={{ background: avatarColor(project.owner) }}
              >
                {initials(project.owner)}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{project.owner}</div>
                <div style={{ color: "var(--stresk-text-muted)", fontSize: 12 }}>
                  Project owner
                </div>
              </div>
            </div>
          </div>

          {project.tags?.length ? (
            <div>
              <div className="stresk-section-title" style={{ marginBottom: 8 }}>
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <span key={t} className="tag-chip">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {project.notes ? (
            <div>
              <div className="stresk-section-title" style={{ marginBottom: 8 }}>
                Notes
              </div>
              <div
                style={{
                  background: "var(--stresk-bg)",
                  border: "1px solid var(--stresk-border)",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 13,
                  color: "var(--stresk-text)",
                  lineHeight: 1.55,
                }}
              >
                {project.notes}
              </div>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
