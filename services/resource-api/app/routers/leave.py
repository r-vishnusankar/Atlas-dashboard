from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import require_service_token
from app.db import get_db
from app.models import Employee, LeaveDay

router = APIRouter(prefix="/leave", tags=["leave"], dependencies=[Depends(require_service_token)])


class LeaveCreate(BaseModel):
    employee_id: str
    start_date: date
    end_date: date
    leave_type: str = "Leave"
    notes: str | None = None


@router.get("")
def list_leave(employee_id: str | None = None, db: Session = Depends(get_db)):
    stmt = select(LeaveDay)
    if employee_id:
        stmt = stmt.where(LeaveDay.employee_id == employee_id)
    rows = list(db.scalars(stmt.order_by(LeaveDay.start_date.desc())).all())
    return [
        {
            "id": r.id,
            "employee_id": r.employee_id,
            "start_date": r.start_date,
            "end_date": r.end_date,
            "leave_type": r.leave_type,
            "notes": r.notes,
        }
        for r in rows
    ]


@router.post("", status_code=201)
def create_leave(body: LeaveCreate, db: Session = Depends(get_db)):
    if not db.get(Employee, body.employee_id):
        raise HTTPException(404, "Employee not found")
    if body.end_date < body.start_date:
        raise HTTPException(400, "end_date before start_date")
    row = LeaveDay(
        employee_id=body.employee_id,
        start_date=body.start_date,
        end_date=body.end_date,
        leave_type=body.leave_type,
        notes=body.notes,
    )
    db.add(row)
    emp = db.get(Employee, body.employee_id)
    if emp and body.start_date <= date.today() <= body.end_date:
        emp.availability_status = "On Leave"
    db.commit()
    db.refresh(row)
    return {
        "id": row.id,
        "employee_id": row.employee_id,
        "start_date": row.start_date,
        "end_date": row.end_date,
        "leave_type": row.leave_type,
        "notes": row.notes,
    }


@router.delete("/{leave_id}")
def delete_leave(leave_id: str, db: Session = Depends(get_db)):
    row = db.get(LeaveDay, leave_id)
    if not row:
        raise HTTPException(404, "Leave not found")
    db.delete(row)
    db.commit()
    return {"ok": True}
