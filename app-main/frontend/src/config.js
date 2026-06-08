// Stresk Dashboard Configuration
// -----------------------------------------------------------------------------
// To connect to a live Google Sheet:
//   1. Create a sheet with the required columns (see /template in README)
//   2. File → Share → Publish to web → choose sheet → CSV → Publish
//   3. Paste the .../pub?output=csv URL below into SHEET_URL
// Leave SHEET_URL empty to use the built-in mock data (32 sample projects).

export const CONFIG = {
  APP_NAME: "Stresk",
  APP_TAGLINE: "Mission Control",

  // Empty string = use built-in mock data.
  SHEET_URL: "",

  // Auto-refresh polling interval (ms). Set to 0 to disable.
  REFRESH_INTERVAL: 60_000,

  // Optional PIN gate. Simple client-side lock (not a security boundary).
  PIN_ENABLED: true,
  PIN_CODE: "1234",

  // Cache key + TTL for localStorage persistence.
  CACHE_KEY: "stresk.projects.cache.v1",
  CACHE_TTL_MS: 5 * 60_000,
};

export default CONFIG;
