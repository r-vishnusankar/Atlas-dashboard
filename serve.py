"""Static file server + Groq AI proxy + Resource API sidecar (no-cache headers).

One command:
  python serve.py

Starts Atlas on :8083 and the Resource Tracker API on :8090, and proxies
  /api/resource/*  →  http://127.0.0.1:8090/api/*
so the UI can use a same-origin base URL.
"""
import http.server
import json
import os
import socketserver
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)

RESOURCE_API_DIR = ROOT / "services" / "resource-api"
RESOURCE_API_HOST = os.environ.get("RESOURCE_API_HOST", "127.0.0.1")
RESOURCE_API_PORT = int(os.environ.get("RESOURCE_API_PORT", "8090") or "8090")
RESOURCE_API_UPSTREAM = f"http://{RESOURCE_API_HOST}:{RESOURCE_API_PORT}"
_resource_proc = None

try:
    from dotenv import load_dotenv
    load_dotenv(ROOT / ".env")
except ImportError:
    pass

try:
    from api import ai_insights
except ImportError:
    ai_insights = None


def _resource_python() -> Path:
    win = RESOURCE_API_DIR / ".venv" / "Scripts" / "python.exe"
    nix = RESOURCE_API_DIR / ".venv" / "bin" / "python"
    if win.exists():
        return win
    if nix.exists():
        return nix
    return Path(sys.executable)


def _port_open(host: str, port: int, timeout: float = 0.4) -> bool:
    import socket
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def start_resource_api() -> bool:
    """Spawn Resource API if not already listening. Returns True if reachable."""
    global _resource_proc
    if os.environ.get("RESOURCE_API_AUTOSTART", "1").strip() in ("0", "false", "False"):
        return _port_open(RESOURCE_API_HOST, RESOURCE_API_PORT)

    if _port_open(RESOURCE_API_HOST, RESOURCE_API_PORT):
        print(f"Resource API already on {RESOURCE_API_UPSTREAM}", flush=True)
        return True

    if not RESOURCE_API_DIR.exists():
        print(f"Resource API folder missing: {RESOURCE_API_DIR}")
        return False

    py = _resource_python()
    env = os.environ.copy()
    # Apply Resource API .env to the child only (avoid PORT=8090 leaking into Atlas)
    try:
        from dotenv import dotenv_values
        for key, val in (dotenv_values(RESOURCE_API_DIR / ".env") or {}).items():
            if val is not None and val != "":
                env[key] = val
    except ImportError:
        pass
    env["HOST"] = RESOURCE_API_HOST
    env["PORT"] = str(RESOURCE_API_PORT)
    # Stable by default — set RESOURCE_API_RELOAD=1 for hot reload
    env.setdefault("RESOURCE_API_RELOAD", "0")

    log_path = RESOURCE_API_DIR / "api_startup.log"
    try:
        log_file = open(log_path, "a", encoding="utf-8")
        _resource_proc = subprocess.Popen(
            [str(py), "run.py"],
            cwd=str(RESOURCE_API_DIR),
            env=env,
            stdout=log_file,
            stderr=subprocess.STDOUT,
        )
    except Exception as e:
        print(f"Failed to start Resource API: {e}")
        return False

    for _ in range(40):
        if _port_open(RESOURCE_API_HOST, RESOURCE_API_PORT):
            print(f"Resource API started on {RESOURCE_API_UPSTREAM}  (pid {_resource_proc.pid})")
            return True
        if _resource_proc.poll() is not None:
            tail = ""
            try:
                if log_path.exists():
                    tail = log_path.read_text(encoding="utf-8", errors="replace")[-800:]
            except OSError:
                pass
            print("Resource API exited early — run: cd services/resource-api && .venv\\Scripts\\python run.py")
            if tail.strip():
                print(f"  Last log lines:\n{tail.strip()}")
            return False
        time.sleep(0.25)

    print("Resource API did not become ready in time")
    return False


def stop_resource_api():
    global _resource_proc
    if _resource_proc and _resource_proc.poll() is None:
        try:
            _resource_proc.terminate()
            _resource_proc.wait(timeout=5)
        except Exception:
            try:
                _resource_proc.kill()
            except Exception:
                pass
    _resource_proc = None


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
        try:
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except (ConnectionAbortedError, BrokenPipeError, ConnectionResetError):
            pass

    def _read_body(self, max_len: int = 8_000_000):
        length = int(self.headers.get("Content-Length", 0) or 0)
        if length <= 0:
            return b""
        if length > max_len:
            return None
        return self.rfile.read(length)

    def _read_json_body(self):
        raw = self._read_body(64_000)
        if not raw:
            return None
        try:
            return json.loads(raw.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return None

    def _proxy_resource_api(self):
        """Proxy /api/resource/<path> → upstream /api/<path>."""
        full = self.path  # includes query
        path_only = full.split("?", 1)[0]
        suffix = path_only[len("/api/resource"):] or "/"
        if not suffix.startswith("/"):
            suffix = "/" + suffix
        # Map /api/resource/health → /api/health
        upstream_path = "/api" + suffix
        if "?" in full:
            upstream_path += "?" + full.split("?", 1)[1]
        url = RESOURCE_API_UPSTREAM + upstream_path

        body = b""
        if self.command in ("POST", "PUT", "PATCH", "DELETE"):
            body = self._read_body()
            if body is None:
                self._send_json(413, {"ok": False, "error": "Body too large"})
                return

        headers = {}
        ct = self.headers.get("Content-Type")
        if ct:
            headers["Content-Type"] = ct
        token = self.headers.get("X-Resource-Token")
        if token:
            headers["X-Resource-Token"] = token

        req = urllib.request.Request(url, data=body if body else None, headers=headers, method=self.command)
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read()
                self.send_response(resp.status)
                ctype = resp.headers.get("Content-Type", "application/json")
                self.send_header("Content-Type", ctype)
                cd = resp.headers.get("Content-Disposition")
                if cd:
                    self.send_header("Content-Disposition", cd)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            data = e.read()
            self.send_response(e.code)
            self.send_header("Content-Type", e.headers.get("Content-Type", "application/json"))
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self._send_json(502, {
                "ok": False,
                "error": f"Resource API unreachable ({e}). Is it running on {RESOURCE_API_UPSTREAM}?",
            })

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path.startswith("/api/resource"):
            return self._proxy_resource_api()
        if path == "/api/ai/health":
            if ai_insights is None:
                self._send_json(503, {"ok": False, "enabled": False, "error": "AI module unavailable"})
                return
            self._send_json(200, ai_insights.health())
            return
        return super().do_GET()

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if path.startswith("/api/resource"):
            return self._proxy_resource_api()
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

    def do_PATCH(self):
        if self.path.split("?", 1)[0].startswith("/api/resource"):
            return self._proxy_resource_api()
        self.send_error(405, "Method Not Allowed")

    def do_DELETE(self):
        if self.path.split("?", 1)[0].startswith("/api/resource"):
            return self._proxy_resource_api()
        self.send_error(405, "Method Not Allowed")

    def do_PUT(self):
        if self.path.split("?", 1)[0].startswith("/api/resource"):
            return self._proxy_resource_api()
        self.send_error(405, "Method Not Allowed")


def _resolve_port():
    if len(sys.argv) > 1:
        return int(sys.argv[1])
    # Use ATLAS_PORT only — ignore generic PORT (Resource API / shells often set PORT=8090)
    env_port = (os.environ.get("ATLAS_PORT") or "").strip()
    if env_port.isdigit():
        return int(env_port)
    return 8083


def main():
    port = _resolve_port()
    api_ok = start_resource_api()
    ai_status = "on" if ai_insights and ai_insights.is_configured() else "off (set GROQ_API_KEY in .env)"
    api_status = "on" if api_ok else "off (cd services/resource-api && python run.py)"
    print(f"Serving on http://localhost:{port}  (no-cache · AI {ai_status} · Resource API {api_status})", flush=True)
    if api_ok:
        print(f"  Resource proxy: http://localhost:{port}/api/resource/health -> {RESOURCE_API_UPSTREAM}/api/health", flush=True)

    try:
        with socketserver.ThreadingTCPServer(("0.0.0.0", port), AtlasHandler) as httpd:
            httpd.daemon_threads = True
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down…")
    finally:
        # Only stop if we spawned it
        if _resource_proc is not None:
            stop_resource_api()


if __name__ == "__main__":
    main()
