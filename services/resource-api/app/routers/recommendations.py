from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import require_service_token
from app.db import get_db
from app.models import Employee
from app.reco import recommend_for_employee
from app.services import is_project_staffable, utilization_pct

router = APIRouter(prefix="/recommendations", tags=["recommendations"], dependencies=[Depends(require_service_token)])


class RecoRequest(BaseModel):
    attention: dict = Field(default_factory=dict)
    workspace_id: str | None = None
    limit: int = 5


@router.get("/available/{employee_id}")
def get_recommendations(
    employee_id: str,
    workspace_id: str | None = None,
    limit: int = 5,
    db: Session = Depends(get_db),
):
    result = recommend_for_employee(
        db, employee_id, attention_map={}, workspace_id=workspace_id, limit=limit
    )
    if not result.get("ok"):
        raise HTTPException(404, result.get("error") or "Not found")
    return result


@router.post("/available/{employee_id}")
def post_recommendations(
    employee_id: str,
    body: RecoRequest,
    db: Session = Depends(get_db),
):
    """Pass Atlas attention map for better scoring."""
    result = recommend_for_employee(
        db,
        employee_id,
        attention_map=body.attention or {},
        workspace_id=body.workspace_id,
        limit=body.limit or 5,
    )
    if not result.get("ok"):
        raise HTTPException(404, result.get("error") or "Not found")
    return result


@router.post("/bench")
def recommend_bench(
    body: RecoRequest,
    db: Session = Depends(get_db),
):
    """Top suggestions for every bench / low-util employee."""
    employees = list(db.scalars(select(Employee).where(Employee.active.is_(True))).all())
    results = []
    for emp in employees:
        if not is_project_staffable(emp):
            continue
        util = utilization_pct(db, emp.id)
        if util > 40:
            continue
        rec = recommend_for_employee(
            db,
            emp.id,
            attention_map=body.attention or {},
            workspace_id=body.workspace_id,
            limit=body.limit or 5,
        )
        if rec.get("ok") and rec.get("suggestions"):
            results.append(rec)
    return {"ok": True, "count": len(results), "employees": results}
