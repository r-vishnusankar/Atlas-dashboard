// -----------------------------------------------------------------------------
// Shared helpers: enums, formatters, CSV parse/export, alert engine.
// -----------------------------------------------------------------------------

export const STAGES = ["Planning", "Development", "QA", "Release", "Live"];
export const STATUSES = ["on_track", "at_risk", "delayed"];
export const PRIORITIES = ["High", "Medium", "Low"];

export const STAGE_COLOR = {
  Planning: "#80868B",
  Development: "#1A73E8",
  QA: "#A142F4",
  Release: "#F9AB00",
  Live: "#1E8E3E",
};

export const STATUS_COLOR = {
  on_track: "#1E8E3E",
  at_risk: "#F9AB00",
  delayed: "#D93025",
};

export const STATUS_LABEL = {
  on_track: "On Track",
  at_risk: "At Risk",
  delayed: "Delayed",
};

export const PRIORITY_COLOR = {
  High: "#D93025",
  Medium: "#F9AB00",
  Low: "#1E8E3E",
};

// ---------- identity / visuals ------------------------------------------------
export const initials = (name = "") =>
  name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const AVATAR_PALETTE = [
  "#1A73E8",
  "#1E8E3E",
  "#A142F4",
  "#F9AB00",
  "#D93025",
  "#24C1E0",
  "#F538A0",
  "#0F9D58",
  "#E8710A",
  "#3949AB",
];

export const avatarColor = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
};

// ---------- dates -------------------------------------------------------------
export const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const daysBetween = (a, b) =>
  Math.round((new Date(a) - new Date(b)) / 86_400_000);

export const daysToRelease = (p) => daysBetween(p.release_date, today());
export const daysSinceStart = (p) => daysBetween(today(), p.start_date);

export const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const countdownLabel = (p) => {
  if (p.stage === "Live") return "Live";
  const d = daysToRelease(p);
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  if (d <= 7) return `in ${d}d`;
  if (d <= 30) return `in ${d}d`;
  const weeks = Math.round(d / 7);
  return `in ~${weeks}w`;
};

export const countdownTone = (p) => {
  if (p.stage === "Live") return "live";
  const d = daysToRelease(p);
  if (d < 0) return "danger";
  if (d <= 7) return "warning";
  return "muted";
};

// ---------- alert engine ------------------------------------------------------
export const computeAlerts = (projects) => {
  const t = today();
  const overdue = [];
  const atRisk = [];
  const stalled = [];
  const upcoming = [];

  projects.forEach((p) => {
    const release = new Date(p.release_date);
    const daysLeft = daysBetween(release, t);
    const isLive = p.stage === "Live";

    if (!Number.isNaN(release.getTime()) && release < t && !isLive) {
      overdue.push({ ...p, _days: -daysLeft });
    } else if (
      !Number.isNaN(release.getTime()) &&
      daysLeft >= 0 &&
      daysLeft <= 7 &&
      !["Release", "Live"].includes(p.stage)
    ) {
      atRisk.push({ ...p, _days: daysLeft });
    } else if (daysLeft > 7 && daysLeft <= 14 && !isLive) {
      upcoming.push({ ...p, _days: daysLeft });
    }

    if (p.progress < 30 && daysSinceStart(p) > 30 && !isLive) {
      stalled.push(p);
    }
  });

  overdue.sort((a, b) => b._days - a._days);
  atRisk.sort((a, b) => a._days - b._days);
  upcoming.sort((a, b) => a._days - b._days);

  return { overdue, atRisk, stalled, upcoming };
};

// ---------- CSV ---------------------------------------------------------------
export const parseCSV = (text) => {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i += 2;
        continue;
      }
      if (c === '"') {
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
};

export const csvToProjects = (csv) => {
  const rows = parseCSV(csv).filter((r) => r.some((c) => c && c.trim() !== ""));
  if (!rows.length) return [];
  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((x) => x.trim().toLowerCase());
  return dataRows.map((r) => {
    const o = {};
    headers.forEach((k, idx) => {
      o[k] = (r[idx] ?? "").trim();
    });
    const rawStatus = (o.status || "on_track").toLowerCase().replace(/\s+/g, "_");
    const status = STATUSES.includes(rawStatus) ? rawStatus : "on_track";
    return {
      project_id: o.project_id || "",
      project_name: o.project_name || "(untitled)",
      owner: o.owner || "—",
      stage: STAGES.includes(o.stage) ? o.stage : "Planning",
      status,
      progress: clampPct(Number(o.progress)),
      start_date: o.start_date || "",
      release_date: o.release_date || "",
      priority: PRIORITIES.includes(o.priority) ? o.priority : "Medium",
      client: o.client || "—",
      tags: (o.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes: o.notes || "",
      updated_at: o.updated_at || new Date().toISOString(),
    };
  });
};

const clampPct = (n) => {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
};

export const exportCSV = (projects, filename = "stresk-export.csv") => {
  const headers = [
    "project_id",
    "project_name",
    "owner",
    "stage",
    "status",
    "progress",
    "start_date",
    "release_date",
    "priority",
    "client",
    "tags",
    "notes",
  ];
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  projects.forEach((p) =>
    lines.push(
      headers
        .map((h) => {
          if (h === "tags") return esc((p.tags || []).join(", "));
          return esc(p[h]);
        })
        .join(","),
    ),
  );
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ---------- filter / sort -----------------------------------------------------
export const applyFilters = (projects, { search, stages, statuses, owners, priorities, sortBy }) => {
  const q = (search || "").trim().toLowerCase();
  let out = projects.filter((p) => {
    if (q) {
      const hay = `${p.project_name} ${p.client} ${p.owner} ${(p.tags || []).join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (stages?.length && !stages.includes(p.stage)) return false;
    if (statuses?.length && !statuses.includes(p.status)) return false;
    if (owners?.length && !owners.includes(p.owner)) return false;
    if (priorities?.length && !priorities.includes(p.priority)) return false;
    return true;
  });
  const sorters = {
    release: (a, b) => new Date(a.release_date) - new Date(b.release_date),
    progress: (a, b) => b.progress - a.progress,
    name: (a, b) => a.project_name.localeCompare(b.project_name),
    priority: (a, b) => {
      const order = { High: 0, Medium: 1, Low: 2 };
      return order[a.priority] - order[b.priority];
    },
  };
  out.sort(sorters[sortBy] || sorters.release);
  return out;
};

export const relativeTime = (ts) => {
  if (!ts) return "—";
  const diff = Math.max(0, (Date.now() - ts) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};
