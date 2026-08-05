"""Outbound email for notification_outbox. SMTP if configured, else file log."""
from __future__ import annotations

import json
import logging
import smtplib
from datetime import datetime, timezone
from email.message import EmailMessage
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import NotificationOutbox

logger = logging.getLogger("resource-api.email")
LOG_FILE = Path(__file__).resolve().parents[1] / "outbox_mail.log"


def _fmt_project_lines(projects: list, *, with_score: bool = False) -> str:
    if not projects:
        return "  (none listed right now)\n"
    lines = []
    for p in projects:
        name = p.get("name") or p.get("project_name") or p.get("external_id") or "Project"
        stage = p.get("stage") or ""
        extra = f" · {stage}" if stage else ""
        if with_score and p.get("attention_score") is not None:
            extra += f" · attention {p.get('attention_score')} ({p.get('attention_tier') or '—'})"
        lines.append(f"  • {name}{extra}")
    return "\n".join(lines) + "\n"


def _render_email(event_type: str, payload: dict) -> tuple[str, str]:
    name = payload.get("employee_name") or "Team member"
    project = payload.get("project_name") or payload.get("project_external_id") or "a project"
    pct = payload.get("allocation_pct")

    if event_type == "allocated":
        subject = f"Allocated to {project}"
        body = (
            f"Hi {name},\n\n"
            f"You have been allocated to project '{project}'"
            + (f" at {pct}% FTE" if pct is not None else "")
            + ".\n\n— Atlas Resource Management\n"
        )
    elif event_type in ("released", "released_to_employee"):
        contacts = payload.get("contact_emails") or []
        active = payload.get("active_projects") or []
        contact_block = (
            "\n".join(f"  • {c}" for c in contacts)
            if contacts
            else "  (contact emails not configured yet — ask your resource manager)"
        )
        subject = f"Released from {project}"
        body = (
            f"Hi {name},\n\n"
            f"Your allocation on '{project}' has been released"
            + (f" ({payload.get('reason')})" if payload.get("reason") else "")
            + ".\n\n"
            f"Active projects you can explore next:\n"
            f"{_fmt_project_lines(active)}"
            f"\nWho to contact for staffing:\n{contact_block}\n\n"
            f"— Atlas Resource Management\n"
        )
    elif event_type == "released_to_manager":
        dept = payload.get("employee_department") or "—"
        desig = payload.get("employee_designation") or "—"
        emp_email = payload.get("employee_email") or "—"
        attention = payload.get("attention_projects") or []
        subject = f"Released: {name} available for allocation"
        body = (
            f"Resource update\n\n"
            f"{name} ({desig}, {dept}) was released from '{project}'"
            + (f" — {payload.get('reason')}" if payload.get("reason") else "")
            + ".\n"
            f"Employee email: {emp_email}\n\n"
            f"Suggested projects to allocate them to (Needs attention / priority):\n"
            f"{_fmt_project_lines(attention, with_score=True)}"
            f"\n— Atlas Resource Management\n"
        )
    elif event_type == "recommendation_digest":
        subject = "Bench recommendations digest"
        body = (
            f"Hi,\n\n"
            f"Recommendations for {name}:\n"
            f"{json.dumps(payload.get('suggestions') or [], indent=2)}\n\n"
            f"— Atlas Resource Management\n"
        )
    else:
        subject = f"Resource event: {event_type}"
        body = json.dumps(payload, indent=2)
    return subject, body


def _send_smtp(to_email: str, subject: str, body: str) -> None:
    settings = get_settings()
    msg = EmailMessage()
    msg["From"] = settings.smtp_from
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as smtp:
        if settings.smtp_use_tls:
            smtp.starttls()
        if settings.smtp_user:
            smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.send_message(msg)


def _send_file(to_email: str, subject: str, body: str) -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(
            f"\n--- {datetime.now(timezone.utc).isoformat()} ---\n"
            f"To: {to_email}\nSubject: {subject}\n{body}\n"
        )


def deliver_one(row: NotificationOutbox) -> bool:
    settings = get_settings()
    if not settings.resource_emails:
        row.status = "skipped"
        return True
    try:
        payload = json.loads(row.payload_json or "{}")
    except json.JSONDecodeError:
        payload = {}
    to_email = (row.to_email or settings.notify_fallback_email or "").strip()
    if not to_email:
        to_email = "noreply@local.dev"
    subject, body = _render_email(row.event_type, payload)
    try:
        if settings.smtp_host:
            _send_smtp(to_email, subject, body)
        else:
            _send_file(to_email, subject, body)
        row.status = "sent"
        row.sent_at = datetime.now(timezone.utc)
        return True
    except Exception as e:
        logger.exception("Failed to send notification %s: %s", row.id, e)
        row.status = "failed"
        row.retries = int(row.retries or 0) + 1
        return False


def process_outbox(db: Session, limit: int = 50) -> dict:
    rows = list(
        db.scalars(
            select(NotificationOutbox)
            .where(NotificationOutbox.status == "pending")
            .order_by(NotificationOutbox.created_at.asc())
            .limit(limit)
        ).all()
    )
    sent = failed = 0
    for row in rows:
        if deliver_one(row):
            sent += 1
        else:
            failed += 1
    if rows:
        db.commit()
    return {"processed": len(rows), "sent": sent, "failed": failed}
