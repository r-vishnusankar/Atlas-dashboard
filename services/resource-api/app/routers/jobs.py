from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth import require_service_token
from app.db import get_db
from app.email_worker import process_outbox
from app.reco import (
    auto_release_completed_projects,
    auto_release_ended,
    take_util_snapshot,
)

router = APIRouter(prefix="/jobs", tags=["jobs"], dependencies=[Depends(require_service_token)])


class AttentionPayload(BaseModel):
    attention: dict = Field(default_factory=dict)
    workspace_id: str | None = None


@router.post("/process-outbox")
def job_process_outbox(limit: int = 50, db: Session = Depends(get_db)):
    return {"ok": True, **process_outbox(db, limit=limit)}


@router.post("/auto-release")
def job_auto_release(
    workspace_id: str | None = None,
    body: AttentionPayload = Body(default_factory=AttentionPayload),
    db: Session = Depends(get_db),
):
    attention = body.attention or {}
    ws = workspace_id or body.workspace_id
    ended = auto_release_ended(db, attention_map=attention)
    completed = auto_release_completed_projects(db, workspace_id=ws, attention_map=attention)
    mail = process_outbox(db, limit=100)
    return {"ok": True, "end_date": ended, "completed_projects": completed, "outbox": mail}


@router.post("/util-snapshot")
def job_util_snapshot(db: Session = Depends(get_db)):
    return {"ok": True, **take_util_snapshot(db)}


@router.post("/run-daily")
def job_run_daily(
    workspace_id: str | None = None,
    body: AttentionPayload = Body(default_factory=AttentionPayload),
    db: Session = Depends(get_db),
):
    """Convenience: auto-release + outbox + util snapshot."""
    attention = body.attention or {}
    ws = workspace_id or body.workspace_id
    ended = auto_release_ended(db, attention_map=attention)
    completed = auto_release_completed_projects(db, workspace_id=ws, attention_map=attention)
    mail = process_outbox(db, limit=100)
    snap = take_util_snapshot(db)
    return {
        "ok": True,
        "end_date": ended,
        "completed_projects": completed,
        "outbox": mail,
        "snapshot": snap,
    }
