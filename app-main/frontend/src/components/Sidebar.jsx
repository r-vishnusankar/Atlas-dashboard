import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  LayoutGrid,
  Columns3,
  Bell,
  CalendarRange,
  X,
} from "lucide-react";
import { CONFIG } from "@/config";
import { useDashboard } from "@/context/DashboardContext";
import { computeAlerts } from "@/lib/helpers";

const ITEMS = [
  { to: "/", label: "Overview", icon: LayoutDashboard, key: "overview", end: true },
  { to: "/projects", label: "Projects", icon: LayoutGrid, key: "projects" },
  { to: "/pipeline", label: "Pipeline", icon: Columns3, key: "pipeline" },
  { to: "/alerts", label: "Alerts", icon: Bell, key: "alerts" },
  { to: "/timeline", label: "Timeline", icon: CalendarRange, key: "timeline" },
];

export default function Sidebar({ open, onClose }) {
  const { projects } = useDashboard();
  const counts = useMemo(() => {
    const alerts = computeAlerts(projects);
    return {
      overview: projects.length,
      projects: projects.length,
      pipeline: projects.filter((p) => p.stage !== "Live").length,
      alerts: alerts.overdue.length + alerts.atRisk.length,
      timeline: projects.length,
    };
  }, [projects]);

  return (
    <aside
      className={"stresk-sidebar " + (open ? "is-open" : "")}
      data-testid="sidebar"
    >
      <div className="stresk-brand" data-testid="brand">
        <div className="stresk-brand-mark">S</div>
        <div className="stresk-brand-text">
          <div className="name">{CONFIG.APP_NAME}</div>
          <div className="sub">{CONFIG.APP_TAGLINE}</div>
        </div>
        <button
          className="stresk-icon-btn md:hidden ml-auto"
          onClick={onClose}
          aria-label="Close menu"
          data-testid="sidebar-close"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="stresk-nav scrollbar-thin">
        <div className="stresk-nav-section">Workspace</div>
        {ITEMS.map(({ to, label, icon: Icon, key, end }) => (
          <NavLink
            key={key}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              "stresk-nav-link" + (isActive ? " active" : "")
            }
            data-testid={`nav-${key}`}
          >
            <Icon size={17} />
            <span>{label}</span>
            <span className="count-chip" data-testid={`nav-count-${key}`}>
              {counts[key] ?? 0}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="stresk-sidebar-footer">
        <div style={{ fontWeight: 600, color: "var(--stresk-text-muted)", marginBottom: 2 }}>
          Data source
        </div>
        <div>
          {CONFIG.SHEET_URL
            ? "Google Sheet (live)"
            : "Mock data — paste your Sheet URL in js/config to go live"}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 10,
            flexWrap: "wrap",
          }}
        >
          <a
            href="/stresk_template.xlsx"
            download
            className="stresk-nav-link"
            style={{
              fontSize: 12,
              padding: "6px 10px",
              background: "var(--stresk-primary-50)",
              color: "var(--stresk-primary-600)",
              fontWeight: 600,
            }}
            data-testid="download-xlsx"
          >
            Excel template
          </a>
          <a
            href="/stresk_sheet_template.csv"
            download
            className="stresk-nav-link"
            style={{
              fontSize: 12,
              padding: "6px 10px",
              background: "var(--stresk-bg)",
              color: "var(--stresk-text-muted)",
              fontWeight: 600,
            }}
            data-testid="download-csv"
          >
            CSV template
          </a>
        </div>
      </div>
    </aside>
  );
}
