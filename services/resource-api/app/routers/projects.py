import re
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import require_service_token
from app.db import get_db
from app.models import ProjectCatalog
from app.reco import auto_release_completed_projects
from app.schemas import ProjectCreate, ProjectOut, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"], dependencies=[Depends(require_service_token)])


def _slug_id(name: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", (name or "project").lower()).strip("-") or "project"
    return f"rm-{base[:40]}-{uuid.uuid4().hex[:8]}"


def _normalize_activity_type(value: str | None) -> str:
    raw = (value or "project").strip().lower()
    if raw in ("operational", "operation", "ops", "non_project", "non-project", "internal"):
        return "operational"
    return "project"


def _project_out(row: ProjectCatalog) -> dict:
    source = "manual" if str(row.external_id or "").startswith("rm-") else "synced"
    return {
        "id": row.id,
        "external_id": row.external_id,
        "workspace_id": row.workspace_id,
        "name": row.name,
        "client": row.client,
        "stage": row.stage,
        "status": row.status,
        "priority": row.priority,
        "release_date": row.release_date,
        "pm_employee_id": row.pm_employee_id,
        "activity_type": _normalize_activity_type(getattr(row, "activity_type", None)),
        "synced_at": row.synced_at,
        "source": source,
    }


@router.get("", response_model=list[ProjectOut])
def list_projects(
    workspace_id: str | None = None,
    include_completed: bool = Query(default=False),
    activity_type: str | None = Query(default=None, description="project | operational"),
    db: Session = Depends(get_db),
):
    stmt = select(ProjectCatalog)
    if workspace_id:
        stmt = stmt.where(ProjectCatalog.workspace_id == workspace_id)
    rows = list(db.scalars(stmt.order_by(ProjectCatalog.name)).all())
    if not include_completed:
        done = {"live", "completed", "done", "closed"}
        rows = [r for r in rows if (r.stage or "").lower() not in done]
    if activity_type:
        want = _normalize_activity_type(activity_type)
        rows = [r for r in rows if _normalize_activity_type(getattr(r, "activity_type", None)) == want]
    return [_project_out(r) for r in rows]


@router.post("", response_model=ProjectOut, status_code=201)
def create_project(body: ProjectCreate, db: Session = Depends(get_db)):
    name = (body.name or "").strip()
    if not name:
        raise HTTPException(400, "name is required")
    ws = (body.workspace_id or "").strip()
    if not ws:
        raise HTTPException(400, "workspace_id is required")

    external_id = (body.external_id or "").strip() or _slug_id(name)
    existing = db.scalar(
        select(ProjectCatalog).where(
            ProjectCatalog.workspace_id == ws,
            ProjectCatalog.external_id == external_id,
        )
    )
    if existing:
        raise HTTPException(409, f"Project already exists: {external_id}")

    row = ProjectCatalog(
        external_id=external_id,
        workspace_id=ws,
        name=name,
        client=body.client,
        stage=body.stage or "Planning",
        status=body.status or "on_track",
        priority=body.priority or "Medium",
        release_date=body.release_date,
        pm_employee_id=body.pm_employee_id,
        activity_type=_normalize_activity_type(body.activity_type),
        synced_at=datetime.now(timezone.utc),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _project_out(row)


@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(project_id: str, body: ProjectUpdate, db: Session = Depends(get_db)):
    row = db.get(ProjectCatalog, project_id)
    if not row:
        # allow lookup by external_id within any workspace
        row = db.scalar(select(ProjectCatalog).where(ProjectCatalog.external_id == project_id))
    if not row:
        raise HTTPException(404, "Project not found")

    data = body.model_dump(exclude_unset=True)
    if "activity_type" in data:
        data["activity_type"] = _normalize_activity_type(data.get("activity_type"))
    for k, v in data.items():
        setattr(row, k, v)
    row.synced_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(row)

    stage = (row.stage or "").lower()
    if stage in ("live", "completed", "done", "closed"):
        auto_release_completed_projects(db, workspace_id=row.workspace_id)
        try:
            from app.email_worker import process_outbox
            process_outbox(db, limit=50)
        except Exception:
            pass

    return _project_out(row)


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: str, db: Session = Depends(get_db)):
    row = db.get(ProjectCatalog, project_id)
    if not row:
        row = db.scalar(select(ProjectCatalog).where(ProjectCatalog.external_id == project_id))
    if not row:
        raise HTTPException(404, "Project not found")
    return _project_out(row)


@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    release_allocations: bool = Query(default=True),
    db: Session = Depends(get_db),
):
    from app.email_worker import process_outbox
    from app.models import Allocation, Employee
    from app.notify import enqueue_release_notifications
    from app.services import refresh_availability, write_history

    row = db.get(ProjectCatalog, project_id)
    if not row:
        row = db.scalar(select(ProjectCatalog).where(ProjectCatalog.external_id == project_id))
    if not row:
        raise HTTPException(404, "Project not found")

    released = 0
    if release_allocations:
        allocs = list(
            db.scalars(
                select(Allocation).where(
                    Allocation.workspace_id == row.workspace_id,
                    Allocation.project_external_id == row.external_id,
                    Allocation.status.in_(("Active", "Planned")),
                )
            ).all()
        )
        now = datetime.now(timezone.utc)
        for alloc in allocs:
            alloc.status = "Released"
            alloc.updated_at = now
            write_history(db, alloc, actor="system", reason="project_deleted")
            emp = db.get(Employee, alloc.employee_id)
            if emp:
                refresh_availability(db, emp)
                enqueue_release_notifications(
                    db,
                    emp,
                    project_external_id=alloc.project_external_id,
                    project_name=row.name,
                    reason="project_deleted",
                    workspace_id=row.workspace_id,
                )
            released += 1

    db.delete(row)
    db.commit()
    if released:
        try:
            process_outbox(db, limit=50)
        except Exception:
            pass
    return {"ok": True, "deleted": project_id, "allocations_released": released}
