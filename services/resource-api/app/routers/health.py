from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
def health(db: Session = Depends(get_db)):
    db_ok = True
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_ok = False
        return {
            "ok": False,
            "service": "resource-api",
            "database": "error",
            "error": str(e),
        }
    settings = get_settings()
    return {
        "ok": True,
        "service": "resource-api",
        "database": "ok",
        "auth_required": bool(settings.resource_service_token.strip()),
        "db_backend": "sqlite" if settings.database_url.startswith("sqlite") else "postgres",
    }
