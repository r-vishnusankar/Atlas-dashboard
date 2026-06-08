"""Static file server + optional Groq AI proxy (no-cache headers)."""
import http.server
import json
import os
import socketserver
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)

try:
    from dotenv import load_dotenv
    load_dotenv(ROOT / ".env")
except ImportError:
    pass

try:
    from api import ai_insights
except ImportError:
    ai_insights = None


class AtlasHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass

    def _send_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", 0) or 0)
        if length <= 0 or length > 64_000:
            return None
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return None

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/ai/health":
            if ai_insights is None:
                self._send_json(503, {"ok": False, "enabled": False, "error": "AI module unavailable"})
                return
            self._send_json(200, ai_insights.health())
            return
        return super().do_GET()

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/ai/insights":
            if ai_insights is None:
                self._send_json(503, {"ok": False, "error": "AI module unavailable"})
                return
            data = self._read_json_body()
            if not data or not isinstance(data.get("payload"), dict):
                self._send_json(400, {"ok": False, "error": "Expected JSON { type, payload }"})
                return
            insight_type = str(data.get("type") or "").strip()
            result = ai_insights.call_groq(insight_type, data["payload"])
            status = 200 if result.get("ok") else 502
            self._send_json(status, result)
            return
        self.send_error(405, "Method Not Allowed")


def _resolve_port():
    if len(sys.argv) > 1:
        return int(sys.argv[1])
    env_port = (os.environ.get("PORT") or "").strip()
    if env_port.isdigit():
        return int(env_port)
    return 8083


port = _resolve_port()

with socketserver.TCPServer(("0.0.0.0", port), AtlasHandler) as httpd:
    ai_status = "on" if ai_insights and ai_insights.is_configured() else "off (set GROQ_API_KEY in .env)"
    print(f"Serving on http://localhost:{port}  (no-cache mode, AI {ai_status})")
    httpd.serve_forever()
