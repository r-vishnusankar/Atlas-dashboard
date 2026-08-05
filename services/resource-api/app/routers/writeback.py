"""Optional write-back stubs (Phase 5) — does not mutate Sheets/ClickUp yet."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.auth import require_service_token

router = APIRouter(prefix="/writeback", tags=["writeback"], dependencies=[Depends(require_service_token)])


class WritebackAssignee(BaseModel):
    project_external_id: str
    workspace_id: str
    role: str  # Developer / QA / Owner / Content Creator
    employee_name: str
    dry_run: bool = True


@router.post("/assignee")
def writeback_assignee(body: WritebackAssignee):
    """
    Future: push assignee into Google Sheets / ClickUp.
    v1 returns a planned action only (safe dry-run).
    """
    return {
        "ok": True,
        "dry_run": True,
        "message": "Write-back not enabled yet — action recorded as planned only.",
        "planned": {
            "project_external_id": body.project_external_id,
            "workspace_id": body.workspace_id,
            "role": body.role,
            "employee_name": body.employee_name,
        },
    }
