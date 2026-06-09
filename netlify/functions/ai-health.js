const { health, jsonResponse } = require("./lib/groq");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { "Cache-Control": "no-store" }, body: "" };
  }
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { ok: false, error: "Method Not Allowed" });
  }
  return jsonResponse(200, health());
};
