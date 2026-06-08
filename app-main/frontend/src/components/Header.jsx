import React, { useEffect, useState } from "react";
import { Search, RefreshCw, Menu, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { useDashboard } from "@/context/DashboardContext";
import { relativeTime, exportCSV } from "@/lib/helpers";
import { Button } from "@/components/ui/button";

export default function Header({ onMenu }) {
  const { filters, updateFilter, refresh, loading, lastUpdate, source, filtered } =
    useDashboard();
  const [, force] = useState(0);

  // Re-render the "updated X ago" label every 10 seconds.
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 10_000);
    return () => clearInterval(t);
  }, []);

  const handleRefresh = async () => {
    await refresh();
    toast.success("Projects refreshed", { description: source === "mock" ? "Using mock data" : "Synced from Google Sheet" });
  };

  const handleExport = () => {
    exportCSV(filtered, `stresk-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success(`Exported ${filtered.length} projects`);
  };

  return (
    <header className="stresk-header" data-testid="header">
      <button
        className="stresk-icon-btn md:hidden"
        onClick={onMenu}
        aria-label="Open menu"
        data-testid="header-menu-btn"
      >
        <Menu size={18} />
      </button>

      <div className="stresk-search">
        <Search size={16} className="icon" />
        <input
          type="text"
          placeholder="Search projects, clients, owners, tags…"
          value={filters.search}
          onChange={(e) => updateFilter({ search: e.target.value })}
          data-testid="global-search"
        />
      </div>

      <div className="stresk-header-actions">
        <div className="stresk-updated" data-testid="last-updated">
          <span className="dot" />
          <span className="hidden sm:inline">
            {loading ? "Syncing…" : `Updated ${relativeTime(lastUpdate)}`}
          </span>
          {source && (
            <span
              className="pill ghost"
              style={{ marginLeft: 4 }}
              data-testid="source-pill"
            >
              {source}
            </span>
          )}
        </div>

        <button
          className="stresk-icon-btn"
          onClick={() => window.print()}
          aria-label="Print"
          data-testid="print-btn"
        >
          <Printer size={17} />
        </button>
        <button
          className="stresk-icon-btn"
          onClick={handleExport}
          aria-label="Export CSV"
          data-testid="export-btn"
        >
          <Download size={17} />
        </button>
        <Button
          variant="default"
          size="sm"
          onClick={handleRefresh}
          className="gap-2 h-9 rounded-[10px] bg-[var(--stresk-primary)] hover:bg-[var(--stresk-primary-600)]"
          data-testid="refresh-btn"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </header>
  );
}
