"""Run: python run.py   (from services/resource-api)

By default runs WITHOUT reload (stable). Set RESOURCE_API_RELOAD=1 for hot reload.
"""
import os

import uvicorn

from app.config import get_settings

if __name__ == "__main__":
    settings = get_settings()
    reload = os.environ.get("RESOURCE_API_RELOAD", "0").strip() in ("1", "true", "True", "yes")
    # PaaS (Render) sets PORT and expects 0.0.0.0
    port = int(os.environ.get("PORT") or settings.port)
    host = os.environ.get("HOST") or ("0.0.0.0" if os.environ.get("PORT") else settings.host)
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
    )
