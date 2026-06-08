// -----------------------------------------------------------------------------
// Seeded mock data: 32 varied projects with dates relative to "today".
// Ensures the dashboard looks live out-of-the-box (alerts, countdowns, etc).
// -----------------------------------------------------------------------------

const PROJECT_NAMES = [
  "Acme Corp Website",
  "Nimbus Health Patient Portal",
  "Orbital Labs Admin Dashboard",
  "Ironclad Finance Mobile App",
  "Lumina Retail Checkout 2.0",
  "Vertex Analytics Pipeline",
  "Polaris Media CMS Migration",
  "Glider Logistics Tracker",
  "Aster Robotics Control Panel",
  "Brightwave Edu LMS",
  "Cascade Energy Billing Rewrite",
  "Delphi Legal Contract AI",
  "Helios Solar Monitor",
  "Kestrel HR Onboarding",
  "Lotus Hospitality Booking",
  "Meridian Bank Open API",
  "Northwind Inventory Sync",
  "Onyx Insurance Claims Portal",
  "Quartz Gaming Leaderboards",
  "Rivet Manufacturing IoT",
  "Stellar Telecom Self-Service",
  "Tidepool Fitness App",
  "Umbra Security Audit Tool",
  "Vanta Compliance Sync",
  "Willow Gardens Store",
  "Xenon Travel Itineraries",
  "Yonder Social Feed",
  "Zephyr Auto Service Hub",
  "Cobalt Studio Portfolio",
  "Ember Podcast Platform",
  "Fable Reader App",
  "Gemstone Marketplace",
];

const CLIENTS = [
  "Acme Corp",
  "Nimbus Health",
  "Orbital Labs",
  "Ironclad Finance",
  "Lumina Retail",
  "Vertex Analytics",
  "Polaris Media",
  "Glider Logistics",
  "Aster Robotics",
  "Brightwave Edu",
  "Cascade Energy",
  "Delphi Legal",
  "Helios Solar",
  "Kestrel HR",
  "Lotus Hospitality",
  "Meridian Bank",
  "Northwind Co.",
  "Onyx Insurance",
  "Quartz Gaming",
  "Rivet Mfg.",
  "Stellar Telecom",
  "Tidepool Inc.",
  "Umbra Security",
  "Vanta",
  "Willow Gardens",
  "Xenon Travel",
  "Yonder",
  "Zephyr Auto",
  "Cobalt Studio",
  "Ember Media",
  "Fable",
  "Gemstone",
];

const OWNERS = [
  "Sarah K.",
  "Marcus T.",
  "Priya R.",
  "Diego N.",
  "Aya M.",
  "Liam O.",
  "Zoe F.",
  "Ravi S.",
  "Nora W.",
  "Elif D.",
  "Kenji H.",
  "Maya P.",
];

const TAGS = [
  "E-commerce",
  "React",
  "AI",
  "Mobile",
  "API",
  "Dashboard",
  "Internal",
  "GDPR",
  "Payments",
  "Analytics",
  "SEO",
  "Migration",
  "Onboarding",
  "Multi-tenant",
  "Realtime",
  "B2B",
  "B2C",
];

const STAGES = ["Planning", "Development", "QA", "Release", "Live"];
const STATUSES = ["on_track", "at_risk", "delayed"];
const PRIORITIES = ["High", "Medium", "Low"];

const NOTES = [
  "Waiting on content from client marketing team.",
  "Third-party API rate limits being reviewed.",
  "Security review scheduled for next week.",
  "Designs signed off — implementation in progress.",
  "Dependency upgrade required before ship.",
  "Smoke tests passing on staging.",
  "Client requested scope additions.",
  "Load testing in progress.",
  "",
  "Awaiting stakeholder approval.",
  "Roll-forward migration plan drafted.",
  "Localization pending for 3 markets.",
];

// Deterministic seeded PRNG so mock data is stable across reloads.
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(7);

const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const pickMany = (arr, min = 1, max = 3) => {
  const n = min + Math.floor(rand() * (max - min + 1));
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rand() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
};

const addDays = (base, n) => {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const toISODate = (d) => d.toISOString().slice(0, 10);

// Hand-shaped stage → progress window so cards feel realistic.
const progressForStage = (stage) => {
  const ranges = {
    Planning: [2, 20],
    Development: [20, 65],
    QA: [55, 85],
    Release: [75, 98],
    Live: [100, 100],
  };
  const [lo, hi] = ranges[stage];
  return lo + Math.floor(rand() * (hi - lo + 1));
};

// Sprinkle specific "hero" profiles so alerts light up meaningfully.
const HERO_PROFILES = [
  { stage: "Development", status: "delayed", offsetDays: -12, priority: "High" },
  { stage: "QA", status: "at_risk", offsetDays: 3, priority: "High" },
  { stage: "Development", status: "at_risk", offsetDays: 6, priority: "Medium" },
  { stage: "Planning", status: "delayed", offsetDays: -5, priority: "High" },
  { stage: "Release", status: "on_track", offsetDays: 9, priority: "High" },
  { stage: "Live", status: "on_track", offsetDays: -30, priority: "Low" },
  { stage: "Live", status: "on_track", offsetDays: -65, priority: "Medium" },
  { stage: "Development", status: "on_track", offsetDays: 42, priority: "Medium" },
  { stage: "Development", status: "on_track", offsetDays: 60, priority: "High" },
  { stage: "QA", status: "on_track", offsetDays: 14, priority: "Medium" },
];

export function generateMockProjects() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const list = [];
  for (let i = 0; i < PROJECT_NAMES.length; i++) {
    const name = PROJECT_NAMES[i];
    let stage;
    let status;
    let offset;
    let priority;

    if (i < HERO_PROFILES.length) {
      ({ stage, status, offsetDays: offset, priority } = HERO_PROFILES[i]);
    } else {
      stage = pick(STAGES);
      status = pick(STATUSES);
      offset = -45 + Math.floor(rand() * 150); // -45 ... +105 days
      priority = pick(PRIORITIES);
    }

    // Live projects keep their release in the past; others respect offset.
    const releaseDate =
      stage === "Live"
        ? addDays(now, Math.min(offset, -14))
        : addDays(now, offset);

    // Start date = release - 30..120 days.
    const startOffset = -(30 + Math.floor(rand() * 90));
    const startDate = addDays(new Date(releaseDate), startOffset);

    const progress =
      status === "delayed" && stage !== "Live"
        ? Math.max(5, progressForStage(stage) - 20)
        : progressForStage(stage);

    // Updated within last 10 days.
    const updatedHoursAgo = Math.floor(rand() * 240);
    const updatedAt = new Date(
      Date.now() - updatedHoursAgo * 3_600_000,
    ).toISOString();

    list.push({
      project_id: `PRJ-${String(i + 1).padStart(3, "0")}`,
      project_name: name,
      owner: pick(OWNERS),
      stage,
      status,
      progress,
      start_date: startDate,
      release_date: releaseDate,
      priority,
      client: CLIENTS[i] || pick(CLIENTS),
      tags: pickMany(TAGS, 1, 3),
      notes: pick(NOTES),
      updated_at: updatedAt,
    });
  }
  // Sort so "most recently updated" feels natural.
  list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  return list;
}

// Also expose as a pre-computed constant for convenience.
export const MOCK_PROJECTS = generateMockProjects();

// Re-export today helper used by tests.
export const TODAY_ISO = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
})();

// eslint-disable-next-line no-unused-vars
const _unused = toISODate; // keep helper alive for future use
