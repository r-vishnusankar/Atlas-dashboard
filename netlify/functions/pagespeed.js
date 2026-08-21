const { run, jsonResponse } = require("./lib/pagespeed");

exports.config = { timeout: 26 };

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { "Cache-Control": "no-store" }, body: "" };
  }
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { ok: false, error: "Method Not Allowed" });
  }
  const qs = event.queryStringParameters || {};
  const result = await run(qs.url || "", qs.strategy || "mobile");
  const status = result.ok ? 200 : (result.status || 502);
  return jsonResponse(status, result);
};
