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
