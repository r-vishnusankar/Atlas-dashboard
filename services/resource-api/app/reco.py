"""Background jobs, utilization snapshots, and project recommendations."""

from __future__ import annotations

import json
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Allocation, Employee, ProjectCatalog, UtilSnapshot
from app.notify import enqueue_release_notifications
from app.services import (
    ACTIVE_STATUSES,
    compute_dashboard,
    is_project_staffable,
    refresh_availability,
    utilization_pct,
    write_history,
)

_DONE_STAGES = {"live", "completed", "done", "closed", "archived"}


def _is_delivery_project(p: ProjectCatalog) -> bool:
    activity = (getattr(p, "activity_type", None) or "project").strip().lower()
    return activity not in {"operational", "operation", "ops", "non_project", "non-project", "internal"}


def _release_allocation(
    db: Session,
    alloc: Allocation,
    *,
    reason: str,
    attention_map: dict | None = None,
    notify: bool = True,
) -> None:
    if alloc.status == "Released":
        return
    alloc.status = "Released"
    alloc.updated_at = datetime.now(timezone.utc)
    write_history(db, alloc, actor="system", reason=reason)
    emp = db.get(Employee, alloc.employee_id)
    if emp:
        refresh_availability(db, emp)
        if notify:
            enqueue_release_notifications(
                db,
                emp,
                project_external_id=alloc.project_external_id,
                reason=reason,
                workspace_id=alloc.workspace_id,
                attention_map=attention_map,
            )


def auto_release_ended(db: Session, attention_map: dict | None = None) -> dict:
    """Release active allocations whose end_date is before today."""
    today = date.today()
    rows = list(
        db.scalars(
            select(Allocation).where(
                Allocation.status.in_(tuple(ACTIVE_STATUSES)),
                Allocation.end_date.is_not(None),
                Allocation.end_date < today,
            )
        ).all()
    )
    for alloc in rows:
        _release_allocation(db, alloc, reason="auto_release_end_date", attention_map=attention_map)
    if rows:
        db.commit()
    return {"released": len(rows)}


def auto_release_completed_projects(
    db: Session,
    workspace_id: str | None = None,
    attention_map: dict | None = None,
) -> dict:
    """Release allocations tied to projects marked Live / completed."""
    stmt = select(ProjectCatalog)
    if workspace_id:
        stmt = stmt.where(ProjectCatalog.workspace_id == workspace_id)
    projects = list(db.scalars(stmt).all())
    done_ext = {
        p.external_id
        for p in projects
        if (p.stage or "").lower() in _DONE_STAGES or (p.status or "").lower() in _DONE_STAGES
    }
    if not done_ext:
        return {"released": 0, "projects": 0}

    alloc_stmt = select(Allocation).where(
        Allocation.status.in_(tuple(ACTIVE_STATUSES)),
        Allocation.project_external_id.in_(done_ext),
    )
    if workspace_id:
        alloc_stmt = alloc_stmt.where(Allocation.workspace_id == workspace_id)
    rows = list(db.scalars(alloc_stmt).all())
    for alloc in rows:
        _release_allocation(
            db,
            alloc,
            reason="auto_release_project_completed",
            attention_map=attention_map,
        )
    if rows:
        db.commit()
    return {"released": len(rows), "projects": len(done_ext)}


def take_util_snapshot(db: Session) -> dict:
    """Persist one dashboard row per calendar day (upsert by date)."""
    today = date.today()
    dash = compute_dashboard(db)
    row = db.scalar(select(UtilSnapshot).where(UtilSnapshot.snapshot_date == today))
    if row:
        row.total_employees = dash["total_employees"]
        row.allocated = dash["allocated"]
        row.bench = dash["bench"]
        row.avg_utilization_pct = dash["avg_utilization_pct"]
        row.over_allocated = dash["over_allocated"]
    else:
        row = UtilSnapshot(
            snapshot_date=today,
            total_employees=dash["total_employees"],
            allocated=dash["allocated"],
            bench=dash["bench"],
            avg_utilization_pct=dash["avg_utilization_pct"],
            over_allocated=dash["over_allocated"],
        )
        db.add(row)
    db.commit()
    return {"snapshot_date": today.isoformat(), **dash}


def util_trend(db: Session, days: int = 90) -> list[dict]:
    cut = date.today() - timedelta(days=max(1, min(days, 365)))
    rows = list(
        db.scalars(
            select(UtilSnapshot)
            .where(UtilSnapshot.snapshot_date >= cut)
            .order_by(UtilSnapshot.snapshot_date.asc())
        ).all()
    )
    return [
        {
            "date": r.snapshot_date.isoformat(),
            "total_employees": r.total_employees,
            "allocated": r.allocated,
            "bench": r.bench,
            "avg_utilization_pct": r.avg_utilization_pct,
            "over_allocated": r.over_allocated,
        }
        for r in rows
    ]


def demand_forecast(db: Session, workspace_id: str | None = None) -> list[dict]:
    """Simple monthly demand from open projects with release dates."""
    stmt = select(ProjectCatalog)
    if workspace_id:
        stmt = stmt.where(ProjectCatalog.workspace_id == workspace_id)
    projects = list(db.scalars(stmt).all())
    open_projects = [
        p
        for p in projects
        if _is_delivery_project(p)
        and (p.stage or "").lower() not in _DONE_STAGES
        and (p.status or "").lower() not in _DONE_STAGES
    ]
    buckets: dict[str, list[str]] = {}
    for p in open_projects:
        month = "unknown"
        if p.release_date:
            try:
                d = datetime.fromisoformat(str(p.release_date).replace("Z", "+00:00")[:10]).date()
                month = d.strftime("%Y-%m")
            except ValueError:
                month = str(p.release_date)[:7] if len(str(p.release_date)) >= 7 else "unknown"
        buckets.setdefault(month, []).append(p.name or p.external_id)

    out = []
    for month in sorted(buckets.keys()):
        names = buckets[month]
        out.append(
            {
                "month": month,
                "projects": len(names),
                "heads_needed_est": max(1, len(names) // 2),
                "names": names[:8],
            }
        )
    return out


def _attention_score(project_ext: str, attention_map: dict) -> float:
    if not attention_map:
        return 0.0
    entry = attention_map.get(project_ext) or attention_map.get(str(project_ext))
    if not entry:
        return 0.0
    if isinstance(entry, (int, float)):
        return float(entry)
    if isinstance(entry, dict):
        return float(entry.get("score") or entry.get("attention") or 0)
    return 0.0


def recommend_for_employee(
    db: Session,
    employee_id: str,
    *,
    attention_map: dict | None = None,
    workspace_id: str | None = None,
    limit: int = 5,
) -> dict:
    emp = db.get(Employee, employee_id)
    if not emp or not emp.active:
        return {"ok": False, "error": "Employee not found"}
    if not is_project_staffable(emp):
        return {
            "ok": True,
            "employee_id": emp.id,
            "employee_name": emp.full_name,
            "utilization_pct": utilization_pct(db, emp.id),
            "suggestions": [],
            "excluded": True,
            "reason": "Leadership / director — not project staffed",
        }

    attention_map = attention_map or {}
    util = utilization_pct(db, emp.id)
    if util >= 100:
        return {"ok": True, "employee_id": emp.id, "utilization_pct": util, "suggestions": []}

    stmt = select(ProjectCatalog)
    if workspace_id:
        stmt = stmt.where(ProjectCatalog.workspace_id == workspace_id)
    projects = list(db.scalars(stmt).all())

    active_ext = {
        a.project_external_id
        for a in db.scalars(
            select(Allocation).where(
                Allocation.employee_id == emp.id,
                Allocation.status.in_(tuple(ACTIVE_STATUSES)),
            )
        ).all()
    }

    role = (emp.designation or emp.role_family or "").lower()
    scored = []
    for p in projects:
        if not _is_delivery_project(p):
            continue
        if p.external_id in active_ext:
            continue
        stage = (p.stage or "").lower()
        if stage in _DONE_STAGES:
            continue
        score = 10.0 + _attention_score(p.external_id, attention_map)
        if role and p.name and role.split()[0] in (p.name or "").lower():
            score += 5
        if (p.priority or "").lower() in ("high", "critical", "p0", "p1"):
            score += 8
        elif (p.priority or "").lower() in ("medium", "p2"):
            score += 3
        scored.append((score, p))

    scored.sort(key=lambda x: (-x[0], x[1].name or ""))
    suggestions = []
    for score, p in scored[: max(1, min(limit, 20))]:
        suggestions.append(
            {
                "project_external_id": p.external_id,
                "project_name": p.name,
                "client": p.client,
                "stage": p.stage,
                "release_date": p.release_date,
                "score": round(score, 1),
                "reason": "Open project match",
            }
        )

    return {
        "ok": True,
        "employee_id": emp.id,
        "employee_name": emp.full_name,
        "utilization_pct": util,
        "suggestions": suggestions,
    }
