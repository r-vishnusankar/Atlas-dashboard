"""Release notification helpers — employee + resource manager emails."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Employee, NotifySettings, ProjectCatalog
from app.services import enqueue_notification

_DONE = {"live", "completed", "done", "closed", "archived"}


def parse_emails(raw: str | None) -> list[str]:
    if not raw:
        return []
    out: list[str] = []
    seen: set[str] = set()
    for part in str(raw).replace(";", ",").split(","):
        email = part.strip()
        if not email or "@" not in email:
            continue
        key = email.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(email)
    return out


def get_notify_settings(db: Session) -> NotifySettings:
    row = db.get(NotifySettings, "default")
    if not row:
        row = NotifySettings(id="default", resource_manager_emails="", staffing_contact_emails="")
        db.add(row)
        db.flush()
    return row


def save_notify_settings(
    db: Session,
    *,
    resource_manager_emails: str | None = None,
    staffing_contact_emails: str | None = None,
) -> NotifySettings:
    row = get_notify_settings(db)
    if resource_manager_emails is not None:
        row.resource_manager_emails = ",".join(parse_emails(resource_manager_emails))
    if staffing_contact_emails is not None:
        row.staffing_contact_emails = ",".join(parse_emails(staffing_contact_emails))
    db.flush()
    return row


def _is_delivery(p: ProjectCatalog) -> bool:
    activity = (getattr(p, "activity_type", None) or "project").strip().lower()
    return activity not in {"operational", "operation", "ops", "non_project", "non-project", "internal"}


def list_active_delivery_projects(db: Session, workspace_id: str | None = None, limit: int = 20) -> list[dict]:
    stmt = select(ProjectCatalog)
    if workspace_id:
        stmt = stmt.where(ProjectCatalog.workspace_id == workspace_id)
    rows = list(db.scalars(stmt.order_by(ProjectCatalog.name)).all())
    out = []
    for p in rows:
        if not _is_delivery(p):
            continue
        stage = (p.stage or "").lower()
        status = (p.status or "").lower()
        if stage in _DONE or status in _DONE:
            continue
        out.append(
            {
                "name": p.name,
                "external_id": p.external_id,
                "stage": p.stage,
                "priority": p.priority,
                "client": p.client,
            }
        )
        if len(out) >= limit:
            break
    return out


def list_attention_projects(
    db: Session,
    attention_map: dict | None = None,
    workspace_id: str | None = None,
    limit: int = 10,
) -> list[dict]:
    """Rank open delivery projects using Atlas attention map when provided."""
    attention_map = attention_map or {}
    active = list_active_delivery_projects(db, workspace_id=workspace_id, limit=200)
    scored = []
    for p in active:
        entry = attention_map.get(p["external_id"]) or attention_map.get(str(p["external_id"])) or {}
        if isinstance(entry, (int, float)):
            score = float(entry)
            tier = "medium" if score >= 40 else "low"
        elif isinstance(entry, dict):
            score = float(
                entry.get("score")
                or entry.get("attention")
                or entry.get("attention_score")
                or 0
            )
            tier = str(
                entry.get("tier")
                or entry.get("attention_tier")
                or ("high" if score >= 60 else "medium" if score >= 40 else "low")
            )
        else:
            score = 0.0
            tier = "low"
        # Prefer priority when no attention score yet
        pri = (p.get("priority") or "").lower()
        if score <= 0 and pri in ("high", "critical", "p0", "p1"):
            score = 50
            tier = "high"
        scored.append({**p, "attention_score": round(score, 1), "attention_tier": tier})
    scored.sort(key=lambda x: (-x["attention_score"], x["name"] or ""))
    # Prefer projects that need attention; if none scored, still return top active
    needs = [p for p in scored if p["attention_score"] > 0 or p["attention_tier"] in ("critical", "high", "medium")]
    return (needs or scored)[:limit]


def enqueue_release_notifications(
    db: Session,
    emp: Employee | None,
    *,
    project_external_id: str,
    reason: str = "released",
    project_name: str | None = None,
    workspace_id: str | None = None,
    attention_map: dict | None = None,
) -> dict:
    """Queue employee + resource-manager emails for a release."""
    if not emp:
        return {"employee": 0, "managers": 0}

    settings = get_notify_settings(db)
    contacts = parse_emails(settings.staffing_contact_emails)
    managers = parse_emails(settings.resource_manager_emails)
    ws = workspace_id
    if not project_name or not ws:
        cat = db.scalar(select(ProjectCatalog).where(ProjectCatalog.external_id == project_external_id))
        if cat:
            project_name = project_name or cat.name
            ws = ws or cat.workspace_id
    active_projects = list_active_delivery_projects(db, workspace_id=ws, limit=15)
    attention_projects = list_attention_projects(
        db, attention_map=attention_map, workspace_id=ws, limit=10
    )
    proj_label = project_name or project_external_id

    queued_emp = 0
    if emp.email:
        enqueue_notification(
            db,
            "released_to_employee",
            {
                "employee_id": emp.id,
                "employee_name": emp.full_name,
                "project_external_id": project_external_id,
                "project_name": proj_label,
                "reason": reason,
                "active_projects": active_projects,
                "contact_emails": contacts,
            },
            to_email=emp.email,
        )
        queued_emp = 1

    queued_mgr = 0
    for email in managers:
        enqueue_notification(
            db,
            "released_to_manager",
            {
                "employee_id": emp.id,
                "employee_name": emp.full_name,
                "employee_email": emp.email,
                "employee_department": emp.department,
                "employee_designation": emp.designation,
                "project_external_id": project_external_id,
                "project_name": proj_label,
                "reason": reason,
                "attention_projects": attention_projects,
            },
            to_email=email,
        )
        queued_mgr += 1

    return {"employee": queued_emp, "managers": queued_mgr}
