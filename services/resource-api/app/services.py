from __future__ import annotations

import json
import re
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models import Allocation, AllocationHistory, Employee, NotificationOutbox, ProjectCatalog


ACTIVE_STATUSES = {"Active", "Planned"}

# Directors / leadership who are not assigned to delivery projects.
# Keep names normalized via normalize_name(); also match designation "Director".
NON_PROJECT_NAME_KEYS = {
    "ashish thomas",
    "madhulal m g",
    "madhulal",
    "sharmiq kollathodi",
    "sharmiw kollathodi",
}


def normalize_name(name: str) -> str:
    return " ".join("".join(c.lower() if c.isalnum() or c.isspace() else " " for c in (name or "")).split())


def is_project_staffable(emp: Employee | None) -> bool:
    """False for directors / named leadership who should not appear on bench or project assign pools."""
    if not emp:
        return False
    key = normalize_name(emp.full_name)
    if key in NON_PROJECT_NAME_KEYS:
        return False
    if key.startswith("madhulal") or key.startswith("sharmiq") or key.startswith("sharmiw"):
        return False
    desig = (emp.designation or "").lower()
    # Word-boundary match for Director (covers "Director", "Associate Director", etc.)
    if re.search(r"\bdirector\b", desig):
        return False
    return True


def _dates_overlap(a_start: date | None, a_end: date | None, b_start: date | None, b_end: date | None) -> bool:
    """Treat missing start as far past, missing end as far future."""
    far_past = date(1970, 1, 1)
    far_future = date(9999, 12, 31)
    a0, a1 = a_start or far_past, a_end or far_future
    b0, b1 = b_start or far_past, b_end or far_future
    return a0 <= b1 and b0 <= a1


def active_allocations_for(db: Session, employee_id: str) -> list[Allocation]:
    return list(
        db.scalars(
            select(Allocation).where(
                Allocation.employee_id == employee_id,
                Allocation.status.in_(tuple(ACTIVE_STATUSES)),
            )
        ).all()
    )


def utilization_pct(db: Session, employee_id: str, on: date | None = None) -> int:
    on = on or date.today()
    total = 0
    for a in active_allocations_for(db, employee_id):
        if _dates_overlap(a.start_date, a.end_date, on, on):
            total += int(a.allocation_pct or 0)
    return total


def over_allocation_warnings(
    db: Session,
    employee_id: str,
    *,
    allocation_pct: int,
    start_date: date | None,
    end_date: date | None,
    exclude_allocation_id: str | None = None,
) -> list[str]:
    warnings: list[str] = []
    peak = allocation_pct
    for a in active_allocations_for(db, employee_id):
        if exclude_allocation_id and a.id == exclude_allocation_id:
            continue
        if _dates_overlap(a.start_date, a.end_date, start_date, end_date):
            peak += int(a.allocation_pct or 0)
    if peak > 100:
        warnings.append(f"Overlapping FTE totals {peak}% (over 100%).")
    return warnings


def refresh_availability(db: Session, employee: Employee) -> None:
    if not is_project_staffable(employee):
        employee.availability_status = "Leadership"
        employee.updated_at = datetime.now(timezone.utc)
        return
    util = utilization_pct(db, employee.id)
    if util <= 0:
        employee.availability_status = "Bench"
    elif util >= 100:
        employee.availability_status = "Fully Allocated"
    else:
        employee.availability_status = "Partially Allocated"
    employee.updated_at = datetime.now(timezone.utc)


def write_history(
    db: Session,
    alloc: Allocation,
    *,
    actor: str | None = None,
    reason: str | None = None,
) -> AllocationHistory:
    row = AllocationHistory(
        allocation_id=alloc.id,
        employee_id=alloc.employee_id,
        project_external_id=alloc.project_external_id,
        workspace_id=alloc.workspace_id,
        allocation_pct=alloc.allocation_pct,
        project_role=alloc.project_role,
        start_date=alloc.start_date,
        end_date=alloc.end_date,
        status=alloc.status,
        actor=actor,
        reason=reason,
    )
    db.add(row)
    return row


def enqueue_notification(
    db: Session,
    event_type: str,
    payload: dict,
    to_email: str | None = None,
) -> NotificationOutbox:
    row = NotificationOutbox(
        event_type=event_type,
        payload_json=json.dumps(payload),
        to_email=to_email,
        status="pending",
    )
    db.add(row)
    return row


def employee_to_dict(db: Session, emp: Employee) -> dict:
    util = utilization_pct(db, emp.id)
    ws = [w for w in (emp.workspace_ids or "").split(",") if w]
    staffable = is_project_staffable(emp)
    return {
        "id": emp.id,
        "employee_code": emp.employee_code,
        "full_name": emp.full_name,
        "email": emp.email,
        "department": emp.department,
        "designation": emp.designation,
        "role_family": emp.role_family,
        "seniority": emp.seniority,
        "years_experience": emp.years_experience,
        "years_at_company": emp.years_at_company,
        "external_experience": emp.external_experience,
        "availability_status": emp.availability_status,
        "project_staffable": staffable,
        "manager_employee_id": emp.manager_employee_id,
        "workspace_ids": ws,
        "active": emp.active,
        "utilization_pct": util,
        "skills": [
            {
                "id": s.id,
                "skill_name": s.skill_name,
                "skill_category": s.skill_category,
                "proficiency": s.proficiency,
            }
            for s in (emp.skills or [])
        ],
        "created_at": emp.created_at,
        "updated_at": emp.updated_at,
    }


def compute_dashboard(db: Session) -> dict:
    employees = list(
        db.scalars(select(Employee).where(Employee.active.is_(True)).options(selectinload(Employee.skills))).all()
    )
    staffable = [e for e in employees if is_project_staffable(e)]
    allocated = bench = partial = full = over = freeing = 0
    util_sum = 0
    today = date.today()
    cut = today + timedelta(days=30)

    for e in staffable:
        util = utilization_pct(db, e.id)
        util_sum += util
        if util <= 0:
            bench += 1
        else:
            allocated += 1
            if util >= 100:
                full += 1
            else:
                partial += 1
            if util > 100:
                over += 1
        for a in active_allocations_for(db, e.id):
            if a.end_date and today < a.end_date <= cut:
                freeing += 1
                break

    active_allocs = db.scalar(
        select(func.count()).select_from(Allocation).where(Allocation.status.in_(tuple(ACTIVE_STATUSES)))
    ) or 0
    projects = db.scalar(select(func.count()).select_from(ProjectCatalog)) or 0
    n = len(staffable) or 1

    return {
        "total_employees": len(employees),
        "staffable_employees": len(staffable),
        "allocated": allocated,
        "bench": bench,
        "partially_allocated": partial,
        "fully_allocated": full,
        "avg_utilization_pct": round(util_sum / n),
        "active_allocations": int(active_allocs),
        "projects_in_catalog": int(projects),
        "over_allocated": over,
        "freeing_30d": freeing,
    }


def refresh_non_project_staff_statuses(db: Session) -> int:
    """Ensure directors / excluded leadership use Leadership availability (not Bench)."""
    updated = 0
    for emp in db.scalars(select(Employee).where(Employee.active.is_(True))).all():
        if not is_project_staffable(emp) and emp.availability_status != "Leadership":
            emp.availability_status = "Leadership"
            emp.updated_at = datetime.now(timezone.utc)
            updated += 1
    if updated:
        db.commit()
    return updated