import csv
import io
from datetime import date

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.auth import require_service_token
from app.db import get_db
from app.models import Allocation, AllocationHistory, Employee, EmployeeSkill, ProjectCatalog
from app.reco import demand_forecast, util_trend
from app.services import is_project_staffable, utilization_pct

router = APIRouter(prefix="/reports", tags=["reports"], dependencies=[Depends(require_service_token)])


def _csv_response(filename: str, headers: list[str], rows: list[list]) -> StreamingResponse:
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(headers)
    writer.writerows(rows)
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/utilization")
def report_utilization(format: str = "csv", db: Session = Depends(get_db)):
    employees = list(
        db.scalars(select(Employee).where(Employee.active.is_(True)).options(selectinload(Employee.skills))).all()
    )
    rows = [
        [
            e.employee_code or "",
            e.full_name,
            e.department or "",
            e.designation or "",
            e.availability_status,
            utilization_pct(db, e.id),
        ]
        for e in employees
    ]
    if format == "json":
        return [
            {
                "code": r[0], "name": r[1], "department": r[2], "designation": r[3],
                "availability": r[4], "utilization_pct": r[5],
            }
            for r in rows
        ]
    return _csv_response(
        f"utilization-{date.today().isoformat()}.csv",
        ["code", "name", "department", "designation", "availability", "utilization_pct"],
        rows,
    )


@router.get("/bench")
def report_bench(format: str = "csv", db: Session = Depends(get_db)):
    employees = list(db.scalars(select(Employee).where(Employee.active.is_(True))).all())
    rows = []
    for e in employees:
        if not is_project_staffable(e):
            continue
        if utilization_pct(db, e.id) <= 0:
            rows.append([e.employee_code or "", e.full_name, e.department or "", e.designation or ""])
    if format == "json":
        return [{"code": r[0], "name": r[1], "department": r[2], "designation": r[3]} for r in rows]
    return _csv_response(
        f"bench-{date.today().isoformat()}.csv",
        ["code", "name", "department", "designation"],
        rows,
    )


@router.get("/allocations")
def report_allocations(format: str = "csv", db: Session = Depends(get_db)):
    allocs = list(db.scalars(select(Allocation).where(Allocation.status.in_(("Active", "Planned")))).all())
    emp_map = {e.id: e for e in db.scalars(select(Employee)).all()}
    rows = []
    for a in allocs:
        e = emp_map.get(a.employee_id)
        rows.append([
            e.full_name if e else a.employee_id,
            a.project_external_id,
            a.workspace_id,
            a.allocation_pct,
            a.project_role or "",
            a.start_date.isoformat() if a.start_date else "",
            a.end_date.isoformat() if a.end_date else "",
            a.status,
        ])
    if format == "json":
        keys = ["employee", "project_external_id", "workspace_id", "allocation_pct", "role", "start", "end", "status"]
        return [dict(zip(keys, r)) for r in rows]
    return _csv_response(
        f"allocations-{date.today().isoformat()}.csv",
        ["employee", "project_external_id", "workspace_id", "allocation_pct", "role", "start", "end", "status"],
        rows,
    )


@router.get("/allocation-history")
def report_history(format: str = "csv", db: Session = Depends(get_db)):
    rows_db = list(db.scalars(select(AllocationHistory).order_by(AllocationHistory.created_at.desc()).limit(2000)).all())
    emp_map = {e.id: e for e in db.scalars(select(Employee)).all()}
    rows = []
    for h in rows_db:
        e = emp_map.get(h.employee_id)
        rows.append([
            e.full_name if e else h.employee_id,
            h.project_external_id,
            h.allocation_pct,
            h.status,
            h.actor or "",
            h.reason or "",
            h.created_at.isoformat() if h.created_at else "",
        ])
    if format == "json":
        keys = ["employee", "project", "pct", "status", "actor", "reason", "at"]
        return [dict(zip(keys, r)) for r in rows]
    return _csv_response(
        f"allocation-history-{date.today().isoformat()}.csv",
        ["employee", "project", "pct", "status", "actor", "reason", "at"],
        rows,
    )


@router.get("/skill-matrix")
def report_skills(format: str = "csv", db: Session = Depends(get_db)):
    skills = list(db.scalars(select(EmployeeSkill)).all())
    emp_map = {e.id: e for e in db.scalars(select(Employee)).all()}
    rows = [
        [
            (emp_map[s.employee_id].full_name if s.employee_id in emp_map else s.employee_id),
            s.skill_name,
            s.skill_category or "",
            s.proficiency,
        ]
        for s in skills
    ]
    # Also designation matrix fallback when no skills
    if not rows:
        for e in emp_map.values():
            rows.append([e.full_name, e.designation or "—", "designation", ""])
    if format == "json":
        return [{"employee": r[0], "skill": r[1], "category": r[2], "proficiency": r[3]} for r in rows]
    return _csv_response(
        f"skill-matrix-{date.today().isoformat()}.csv",
        ["employee", "skill", "category", "proficiency"],
        rows,
    )


@router.get("/department")
def report_department(format: str = "csv", db: Session = Depends(get_db)):
    employees = list(db.scalars(select(Employee).where(Employee.active.is_(True))).all())
    counts: dict[str, dict] = {}
    for e in employees:
        d = e.department or "—"
        c = counts.setdefault(d, {"department": d, "total": 0, "bench": 0, "avg_util": 0, "_util_sum": 0})
        c["total"] += 1
        util = utilization_pct(db, e.id)
        c["_util_sum"] += util
        if is_project_staffable(e) and util <= 0:
            c["bench"] += 1
    rows = []
    for c in counts.values():
        c["avg_util"] = round(c["_util_sum"] / max(c["total"], 1))
        rows.append([c["department"], c["total"], c["bench"], c["avg_util"]])
    if format == "json":
        return [{"department": r[0], "total": r[1], "bench": r[2], "avg_util": r[3]} for r in rows]
    return _csv_response(
        f"department-{date.today().isoformat()}.csv",
        ["department", "total", "bench", "avg_util"],
        rows,
    )


@router.get("/project-staffing")
def report_staffing(format: str = "csv", db: Session = Depends(get_db)):
    projects = list(db.scalars(select(ProjectCatalog)).all())
    allocs = list(db.scalars(select(Allocation).where(Allocation.status.in_(("Active", "Planned")))).all())
    by_proj: dict[tuple, list] = {}
    for a in allocs:
        by_proj.setdefault((a.workspace_id, a.project_external_id), []).append(a)
    emp_map = {e.id: e for e in db.scalars(select(Employee)).all()}
    rows = []
    for p in projects:
        alist = by_proj.get((p.workspace_id, p.external_id), [])
        names = ", ".join(
            (emp_map[a.employee_id].full_name if a.employee_id in emp_map else a.employee_id) for a in alist
        )
        fte = sum(a.allocation_pct for a in alist)
        rows.append([p.name, p.workspace_id, p.stage or "", p.release_date or "", len(alist), fte, names])
    if format == "json":
        keys = ["project", "workspace", "stage", "release", "headcount", "fte_sum", "people"]
        return [dict(zip(keys, r)) for r in rows]
    return _csv_response(
        f"project-staffing-{date.today().isoformat()}.csv",
        ["project", "workspace", "stage", "release", "headcount", "fte_sum", "people"],
        rows,
    )


@router.get("/demand-forecast")
def report_demand(workspace_id: str | None = None, format: str = "json", db: Session = Depends(get_db)):
    data = demand_forecast(db, workspace_id=workspace_id)
    if format == "csv":
        rows = [[d["month"], d["projects"], d["heads_needed_est"], "; ".join(d.get("names") or [])] for d in data]
        return _csv_response(
            f"demand-forecast-{date.today().isoformat()}.csv",
            ["month", "open_projects", "heads_needed_est", "sample_projects"],
            rows,
        )
    return JSONResponse(data)


@router.get("/util-trend")
def report_util_trend(days: int = 90, db: Session = Depends(get_db)):
    return util_trend(db, days=days)
