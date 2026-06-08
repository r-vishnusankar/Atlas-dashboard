import React, { useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { STAGES, STATUSES, PRIORITIES, STATUS_LABEL } from "@/lib/helpers";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowUpDown, X } from "lucide-react";

function MultiSelect({ label, options, selected, onChange, testId, labelMap }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-full border-[var(--stresk-border)] bg-white hover:bg-[var(--stresk-bg)] gap-2 font-medium"
          data-testid={testId}
        >
          <span>{label}</span>
          {selected.length ? (
            <span
              className="pill"
              style={{
                background: "var(--stresk-primary-50)",
                color: "var(--stresk-primary-600)",
                padding: "1px 7px",
                fontSize: 10,
              }}
            >
              {selected.length}
            </span>
          ) : null}
          <ChevronDown size={14} className="text-[var(--stresk-text-muted)]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt}
            checked={selected.includes(opt)}
            onCheckedChange={(checked) => {
              if (checked) onChange([...selected, opt]);
              else onChange(selected.filter((x) => x !== opt));
            }}
          >
            {labelMap?.[opt] ?? opt}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const SORT_OPTIONS = [
  { value: "release", label: "Release date" },
  { value: "progress", label: "Progress" },
  { value: "name", label: "Name (A–Z)" },
  { value: "priority", label: "Priority" },
];

export default function FilterBar() {
  const { projects, filters, updateFilter, resetFilters } = useDashboard();

  const owners = useMemo(
    () => Array.from(new Set(projects.map((p) => p.owner))).sort(),
    [projects],
  );

  const hasActive =
    filters.stages.length ||
    filters.statuses.length ||
    filters.owners.length ||
    filters.priorities.length ||
    filters.search.trim();

  return (
    <div
      className="stresk-card"
      style={{ padding: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}
      data-testid="filter-bar"
    >
      <MultiSelect
        label="Stage"
        options={STAGES}
        selected={filters.stages}
        onChange={(v) => updateFilter({ stages: v })}
        testId="filter-stage"
      />
      <MultiSelect
        label="Status"
        options={STATUSES}
        selected={filters.statuses}
        onChange={(v) => updateFilter({ statuses: v })}
        labelMap={STATUS_LABEL}
        testId="filter-status"
      />
      <MultiSelect
        label="Priority"
        options={PRIORITIES}
        selected={filters.priorities}
        onChange={(v) => updateFilter({ priorities: v })}
        testId="filter-priority"
      />
      <MultiSelect
        label="Owner"
        options={owners}
        selected={filters.owners}
        onChange={(v) => updateFilter({ owners: v })}
        testId="filter-owner"
      />

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full gap-2 border-[var(--stresk-border)] bg-white hover:bg-[var(--stresk-bg)]"
              data-testid="sort-btn"
            >
              <ArrowUpDown size={14} />
              Sort: {SORT_OPTIONS.find((s) => s.value === filters.sortBy)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SORT_OPTIONS.map((o) => (
              <DropdownMenuCheckboxItem
                key={o.value}
                checked={filters.sortBy === o.value}
                onCheckedChange={() => updateFilter({ sortBy: o.value })}
              >
                {o.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActive ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-full text-[var(--stresk-text-muted)]"
            onClick={resetFilters}
            data-testid="reset-filters"
          >
            <X size={14} className="mr-1" /> Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
