# Atlas Resource Tracker API

## Recommended: start with Atlas

```powershell
# From repo root — starts UI :8083 AND Resource API :8090
python serve.py
```

Atlas proxies `/api/resource/*` → `http://127.0.0.1:8090/api/*`.

## Standalone

```powershell
cd services/resource-api
.\.venv\Scripts\activate
python run.py
```

Health: http://127.0.0.1:8090/api/health  
Docs: http://127.0.0.1:8090/docs  

Set `RESOURCE_API_RELOAD=1` for hot reload (off by default).

## Production (Render)

Team-facing Atlas (atlas-qa) talks to this API at `https://atlas-resource-api.onrender.com`.

1. Sign in at [render.com](https://render.com) with the GitHub account that owns `Atlas-dashboard`.
2. **New → Blueprint** → select this repo (`render.yaml` at the root).
3. Apply. Wait until `atlas-resource-api` is Live.
4. If Render gives a hostname other than `atlas-resource-api.onrender.com`, set that URL in `js/config.js` `RESOURCE_API.BASE_URL` and redeploy Netlify.

First request after idle can take 30–50s (free instance spin-up). Atlas waits up to 60s on Netlify.

Leave `RESOURCE_SERVICE_TOKEN` empty on Render unless you also set `CONFIG.RESOURCE_API.TOKEN` in the dashboard JS.
