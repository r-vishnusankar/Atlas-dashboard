from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.auth import require_service_token
from app.db import get_db
from app.models import Employee, EmployeeSkill
from app.schemas import (
    EmployeeCreate,
    EmployeeImportRequest,
    EmployeeOut,
    EmployeeUpdate,
)
from app.services import employee_to_dict, normalize_name, refresh_availability

router = APIRouter(prefix="/employees", tags=["employees"], dependencies=[Depends(require_service_token)])


def _set_workspace_ids(emp: Employee, ids: list[str] | None) -> None:
    emp.workspace_ids = ",".join(ids) if ids else None


def _replace_skills(db: Session, emp: Employee, skills) -> None:
    emp.skills.clear()
    db.flush()
    for s in skills or []:
        emp.skills.append(
            EmployeeSkill(
                skill_name=s.skill_name,
                skill_category=s.skill_category,
                proficiency=s.proficiency,
            )
        )


@router.get("", response_model=list[EmployeeOut])
def list_employees(
    q: str | None = None,
    department: str | None = None,
    availability: str | None = None,
    active: bool | None = True,
    db: Session = Depends(get_db),
):
    stmt = select(Employee).options(selectinload(Employee.skills))
    if active is not None:
        stmt = stmt.where(Employee.active.is_(active))
    if department:
        stmt = stmt.where(Employee.department == department)
    if availability:
        stmt = stmt.where(Employee.availability_status == availability)
    rows = list(db.scalars(stmt.order_by(Employee.full_name)).all())
    if q:
        ql = q.lower()
        rows = [
            e for e in rows
            if ql in (e.full_name or "").lower()
            or ql in (e.department or "").lower()
            or ql in (e.designation or "").lower()
            or ql in (e.employee_code or "").lower()
        ]
    return [employee_to_dict(db, e) for e in rows]


@router.post("", response_model=EmployeeOut, status_code=201)
def create_employee(body: EmployeeCreate, db: Session = Depends(get_db)):
    emp = Employee(
        employee_code=body.employee_code,
        full_name=body.full_name.strip(),
        email=body.email,
        department=body.department,
        designation=body.designation,
        role_family=body.role_family or "Developer",
        seniority=body.seniority,
        years_experience=body.years_experience,
        years_at_company=body.years_at_company,
        external_experience=body.external_experience,
        availability_status=body.availability_status or "Bench",
        manager_employee_id=body.manager_employee_id,
        active=body.active,
    )
    _set_workspace_ids(emp, body.workspace_ids)
    db.add(emp)
    db.flush()
    if body.skills:
        _replace_skills(db, emp, body.skills)
    refresh_availability(db, emp)
    db.commit()
    db.refresh(emp)
    emp = db.scalar(select(Employee).options(selectinload(Employee.skills)).where(Employee.id == emp.id))
    return employee_to_dict(db, emp)


@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = db.scalar(select(Employee).options(selectinload(Employee.skills)).where(Employee.id == employee_id))
    if not emp:
        raise HTTPException(404, "Employee not found")
    return employee_to_dict(db, emp)


@router.patch("/{employee_id}", response_model=EmployeeOut)
def update_employee(employee_id: str, body: EmployeeUpdate, db: Session = Depends(get_db)):
    emp = db.scalar(select(Employee).options(selectinload(Employee.skills)).where(Employee.id == employee_id))
    if not emp:
        raise HTTPException(404, "Employee not found")
    data = body.model_dump(exclude_unset=True)
    data.pop("skills", None)
    ws = data.pop("workspace_ids", None)
    for k, v in data.items():
        setattr(emp, k, v)
    if ws is not None:
        _set_workspace_ids(emp, ws)
    if body.skills is not None:
        _replace_skills(db, emp, body.skills)
    emp.updated_at = datetime.now(timezone.utc)
    refresh_availability(db, emp)
    db.commit()
    emp = db.scalar(select(Employee).options(selectinload(Employee.skills)).where(Employee.id == emp.id))
    return employee_to_dict(db, emp)


@router.delete("/{employee_id}")
def delete_employee(
    employee_id: str,
    hard: bool = Query(True, description="Permanently delete (default). Set false to deactivate only."),
    db: Session = Depends(get_db),
):
    from app.models import Allocation, ProjectCatalog

    emp = db.scalar(select(Employee).options(selectinload(Employee.skills)).where(Employee.id == employee_id))
    if not emp:
        raise HTTPException(404, "Employee not found")

    if not hard:
        emp.active = False
        emp.updated_at = datetime.now(timezone.utc)
        refresh_availability(db, emp)
        db.commit()
        return {"ok": True, "soft": True, "id": employee_id, "full_name": emp.full_name}

    alloc_ids = list(db.scalars(select(Allocation.id).where(Allocation.employee_id == employee_id)).all())
    alloc_count = len(alloc_ids)

    # Clear optional FKs that reference this employee (non-cascade)
    for other in db.scalars(select(Employee).where(Employee.manager_employee_id == employee_id)).all():
        other.manager_employee_id = None
    for proj in db.scalars(select(ProjectCatalog).where(ProjectCatalog.pm_employee_id == employee_id)).all():
        proj.pm_employee_id = None
    for alloc in db.scalars(select(Allocation).where(Allocation.reporting_manager_id == employee_id)).all():
        alloc.reporting_manager_id = None

    name = emp.full_name
    db.delete(emp)
    db.commit()
    return {
        "ok": True,
        "hard": True,
        "id": employee_id,
        "full_name": name,
        "allocations_removed": alloc_count,
    }


@router.post("/import")
def import_employees(body: EmployeeImportRequest, db: Session = Depends(get_db)):
    """Upsert employees from Resource-management sheet (or any roster dump)."""
    created = updated = 0
    existing = list(db.scalars(select(Employee)).all())
    by_name = {normalize_name(e.full_name): e for e in existing}
    by_code = {str(e.employee_code).strip(): e for e in existing if e.employee_code}

    for item in body.employees:
        name = item.full_name.strip()
        if not name:
            continue
        match = None
        if body.upsert_by == "code" and item.employee_code:
            match = by_code.get(str(item.employee_code).strip())
        if not match:
            match = by_name.get(normalize_name(name))

        years = item.years_experience
        if years is None and (item.years_at_company is not None or item.external_experience is not None):
            years = (item.years_at_company or 0) + (item.external_experience or 0)

        if match:
            match.full_name = name
            if item.employee_code:
                match.employee_code = item.employee_code
            if item.email is not None:
                match.email = item.email
            if item.department is not None:
                match.department = item.department
            if item.designation is not None:
                match.designation = item.designation
            if item.role_family is not None:
                match.role_family = item.role_family
            if years is not None:
                match.years_experience = years
            if item.years_at_company is not None:
                match.years_at_company = item.years_at_company
            if item.external_experience is not None:
                match.external_experience = item.external_experience
            if item.workspace_ids is not None:
                _set_workspace_ids(match, item.workspace_ids)
            match.active = True
            match.updated_at = datetime.now(timezone.utc)
            refresh_availability(db, match)
            updated += 1
        else:
            emp = Employee(
                employee_code=item.employee_code,
                full_name=name,
                email=item.email,
                department=item.department,
                designation=item.designation,
                role_family=item.role_family or "Developer",
                years_experience=years,
                years_at_company=item.years_at_company,
                external_experience=item.external_experience,
                availability_status="Bench",
                active=True,
            )
            _set_workspace_ids(emp, item.workspace_ids)
            db.add(emp)
            db.flush()
            by_name[normalize_name(name)] = emp
            if emp.employee_code:
                by_code[str(emp.employee_code).strip()] = emp
            created += 1

    db.commit()
    return {"ok": True, "created": created, "updated": updated, "total": created + updated}
