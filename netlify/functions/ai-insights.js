const { callGroq, jsonResponse } = require("./lib/groq");

const MAX_REQUEST_BYTES = 64_000;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { "Cache-Control": "no-store" }, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, error: "Method Not Allowed" });
  }

  const raw = event.body || "";
  if (raw.length > MAX_REQUEST_BYTES) {
    return jsonResponse(400, { ok: false, error: "Request body too large" });
  }

  let data;
  try {
    data = JSON.parse(raw || "{}");
  } catch (_) {
    return jsonResponse(400, { ok: false, error: "Invalid JSON body" });
  }

  if (!data || typeof data.payload !== "object" || Array.isArray(data.payload)) {
    return jsonResponse(400, { ok: false, error: "Expected JSON { type, payload }" });
  }

  const insightType = String(data.type || "").trim();
  const result = await callGroq(insightType, data.payload);
  return jsonResponse(result.ok ? 200 : 502, result);
};
