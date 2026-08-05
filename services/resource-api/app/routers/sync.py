from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import require_service_token
from app.db import get_db
from app.models import ProjectCatalog
from app.reco import auto_release_completed_projects
from app.schemas import ProjectSyncRequest

router = APIRouter(prefix="/sync", tags=["sync"], dependencies=[Depends(require_service_token)])


@router.post("/projects")
def sync_projects(body: ProjectSyncRequest, db: Session = Depends(get_db)):
    """Upsert thin project catalog mirror from Atlas; auto-release when Live."""
    upserted = 0
    now = datetime.now(timezone.utc)
    existing = {
        (p.workspace_id, p.external_id): p
        for p in db.scalars(
            select(ProjectCatalog).where(ProjectCatalog.workspace_id == body.workspace_id)
        ).all()
    }

    for item in body.projects:
        key = (body.workspace_id, item.external_id)
        row = existing.get(key)
        if row:
            row.name = item.name
            row.client = item.client
            row.stage = item.stage
            row.status = item.status
            row.priority = item.priority
            row.release_date = item.release_date
            if item.pm_employee_id is not None:
                row.pm_employee_id = item.pm_employee_id
            row.synced_at = now
        else:
            row = ProjectCatalog(
                external_id=item.external_id,
                workspace_id=body.workspace_id,
                name=item.name,
                client=item.client,
                stage=item.stage,
                status=item.status,
                priority=item.priority,
                release_date=item.release_date,
                pm_employee_id=item.pm_employee_id,
                synced_at=now,
            )
            db.add(row)
            existing[key] = row
        upserted += 1

    db.commit()
    released = auto_release_completed_projects(db, workspace_id=body.workspace_id)
    mail = {"processed": 0}
    if released.get("released"):
        try:
            from app.email_worker import process_outbox

            mail = process_outbox(db, limit=100)
        except Exception:
            pass
    return {
        "ok": True,
        "workspace_id": body.workspace_id,
        "upserted": upserted,
        "catalog_size": len(existing),
        "auto_released": released.get("released", 0),
        "outbox": mail,
    }
