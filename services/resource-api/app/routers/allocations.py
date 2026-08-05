from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import require_service_token
from app.db import get_db
from app.models import Allocation, AllocationHistory, Employee
from app.schemas import AllocationCreate, AllocationHistoryOut, AllocationOut, AllocationUpdate
from app.email_worker import process_outbox
from app.notify import enqueue_release_notifications
from app.services import (
    enqueue_notification,
    is_project_staffable,
    over_allocation_warnings,
    refresh_availability,
    write_history,
)

router = APIRouter(prefix="/allocations", tags=["allocations"], dependencies=[Depends(require_service_token)])


def _alloc_out(alloc: Allocation, warnings: list[str] | None = None) -> dict:
    return {
        "id": alloc.id,
        "employee_id": alloc.employee_id,
        "project_external_id": alloc.project_external_id,
        "workspace_id": alloc.workspace_id,
        "allocation_pct": alloc.allocation_pct,
        "project_role": alloc.project_role,
        "start_date": alloc.start_date,
        "end_date": alloc.end_date,
        "status": alloc.status,
        "reporting_manager_id": alloc.reporting_manager_id,
        "created_at": alloc.created_at,
        "updated_at": alloc.updated_at,
        "warnings": warnings or [],
    }


@router.get("", response_model=list[AllocationOut])
def list_allocations(
    employee_id: str | None = None,
    workspace_id: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    stmt = select(Allocation)
    if employee_id:
        stmt = stmt.where(Allocation.employee_id == employee_id)
    if workspace_id:
        stmt = stmt.where(Allocation.workspace_id == workspace_id)
    if status:
        stmt = stmt.where(Allocation.status == status)
    rows = list(db.scalars(stmt.order_by(Allocation.updated_at.desc())).all())
    return [_alloc_out(a) for a in rows]


@router.post("", response_model=AllocationOut, status_code=201)
def create_allocation(body: AllocationCreate, db: Session = Depends(get_db)):
    emp = db.get(Employee, body.employee_id)
    if not emp:
        raise HTTPException(404, "Employee not found")
    if not is_project_staffable(emp):
        raise HTTPException(
            400,
            detail="Directors / leadership are not assigned to delivery projects",
        )

    warnings = over_allocation_warnings(
        db,
        body.employee_id,
        allocation_pct=body.allocation_pct,
        start_date=body.start_date,
        end_date=body.end_date,
    )
    if body.strict and warnings:
        raise HTTPException(409, detail={"message": "Over-allocated", "warnings": warnings})

    alloc = Allocation(
        employee_id=body.employee_id,
        project_external_id=body.project_external_id,
        workspace_id=body.workspace_id,
        allocation_pct=body.allocation_pct,
        project_role=body.project_role,
        start_date=body.start_date,
        end_date=body.end_date,
        status=body.status or "Active",
        reporting_manager_id=body.reporting_manager_id,
    )
    db.add(alloc)
    db.flush()
    write_history(db, alloc, actor=body.actor, reason=body.reason or "created")
    refresh_availability(db, emp)
    enqueue_notification(
        db,
        "allocated",
        {
            "employee_id": emp.id,
            "employee_name": emp.full_name,
            "project_external_id": alloc.project_external_id,
            "allocation_pct": alloc.allocation_pct,
        },
        to_email=emp.email,
    )
    db.commit()
    db.refresh(alloc)
    return _alloc_out(alloc, warnings)


@router.patch("/{allocation_id}", response_model=AllocationOut)
def update_allocation(allocation_id: str, body: AllocationUpdate, db: Session = Depends(get_db)):
    alloc = db.get(Allocation, allocation_id)
    if not alloc:
        raise HTTPException(404, "Allocation not found")
    emp = db.get(Employee, alloc.employee_id)

    data = body.model_dump(exclude_unset=True)
    actor = data.pop("actor", None)
    reason = data.pop("reason", None)
    strict = data.pop("strict", False)

    for k, v in data.items():
        setattr(alloc, k, v)
    alloc.updated_at = datetime.now(timezone.utc)

    warnings = over_allocation_warnings(
        db,
        alloc.employee_id,
        allocation_pct=alloc.allocation_pct,
        start_date=alloc.start_date,
        end_date=alloc.end_date,
        exclude_allocation_id=alloc.id,
    )
    if strict and warnings:
        raise HTTPException(409, detail={"message": "Over-allocated", "warnings": warnings})

    write_history(db, alloc, actor=actor, reason=reason or "updated")
    if emp:
        refresh_availability(db, emp)
    db.commit()
    db.refresh(alloc)
    return _alloc_out(alloc, warnings)


@router.post("/{allocation_id}/release", response_model=AllocationOut)
def release_allocation(
    allocation_id: str,
    actor: str | None = None,
    reason: str | None = "released",
    db: Session = Depends(get_db),
):
    alloc = db.get(Allocation, allocation_id)
    if not alloc:
        raise HTTPException(404, "Allocation not found")
    emp = db.get(Employee, alloc.employee_id)
    alloc.status = "Released"
    alloc.updated_at = datetime.now(timezone.utc)
    write_history(db, alloc, actor=actor, reason=reason)
    if emp:
        refresh_availability(db, emp)
        enqueue_release_notifications(
            db,
            emp,
            project_external_id=alloc.project_external_id,
            reason=reason or "released",
            workspace_id=alloc.workspace_id,
        )
    db.commit()
    db.refresh(alloc)
    try:
        process_outbox(db, limit=20)
    except Exception:
        pass
    return _alloc_out(alloc)


@router.get("/history/{employee_id}", response_model=list[AllocationHistoryOut])
def allocation_history(employee_id: str, db: Session = Depends(get_db)):
    rows = list(
        db.scalars(
            select(AllocationHistory)
            .where(AllocationHistory.employee_id == employee_id)
            .order_by(AllocationHistory.created_at.desc())
        ).all()
    )
    return rows
