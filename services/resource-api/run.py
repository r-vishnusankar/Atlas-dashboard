"""Run: python run.py   (from services/resource-api)

By default runs WITHOUT reload (stable). Set RESOURCE_API_RELOAD=1 for hot reload.
"""
import os

import uvicorn

from app.config import get_settings

if __name__ == "__main__":
    settings = get_settings()
    reload = os.environ.get("RESOURCE_API_RELOAD", "0").strip() in ("1", "true", "True", "yes")
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=reload,
    )
