import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import FilterBar from "@/components/FilterBar";
import ProjectCard from "@/components/ProjectCard";
import ProjectDetailSheet from "@/components/ProjectDetailSheet";
import { FolderSearch } from "lucide-react";

export default function ProjectsView() {
  const { filtered, projects } = useDashboard();
  const [active, setActive] = useState(null);

  return (
    <div className="space-y-6" data-testid="projects-view">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="stresk-page-title">Projects</div>
          <div className="stresk-page-sub">
            {filtered.length} of {projects.length} projects shown
          </div>
        </div>
      </div>

      <FilterBar />

      {filtered.length === 0 ? (
        <div
          className="stresk-card"
          style={{
            padding: 48,
            textAlign: "center",
            color: "var(--stresk-text-muted)",
          }}
          data-testid="projects-empty"
        >
          <FolderSearch size={28} style={{ margin: "0 auto 10px" }} />
          <div style={{ fontWeight: 600, color: "var(--stresk-text)" }}>
            No projects match your filters
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            Try clearing filters or adjusting your search.
          </div>
        </div>
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
          data-testid="projects-grid"
        >
          {filtered.map((p) => (
            <ProjectCard
              key={p.project_id}
              project={p}
              onClick={() => setActive(p)}
            />
          ))}
        </div>
      )}

      <ProjectDetailSheet
        project={active}
        onOpenChange={(v) => !v && setActive(null)}
      />
    </div>
  );
}
