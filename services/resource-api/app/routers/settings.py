"""Notification settings for release / staffing emails."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth import require_service_token
from app.db import get_db
from app.notify import get_notify_settings, parse_emails, save_notify_settings

router = APIRouter(prefix="/settings", tags=["settings"], dependencies=[Depends(require_service_token)])


class NotifySettingsIn(BaseModel):
    resource_manager_emails: str | None = None
    staffing_contact_emails: str | None = None


class NotifySettingsOut(BaseModel):
    resource_manager_emails: str = ""
    staffing_contact_emails: str = ""
    resource_manager_emails_list: list[str] = []
    staffing_contact_emails_list: list[str] = []
    updated_at: datetime | None = None


def _out(row) -> dict:
    rm = row.resource_manager_emails or ""
    sc = row.staffing_contact_emails or ""
    return {
        "resource_manager_emails": rm,
        "staffing_contact_emails": sc,
        "resource_manager_emails_list": parse_emails(rm),
        "staffing_contact_emails_list": parse_emails(sc),
        "updated_at": row.updated_at,
    }


@router.get("/notifications", response_model=NotifySettingsOut)
def get_notifications(db: Session = Depends(get_db)):
    return _out(get_notify_settings(db))


@router.put("/notifications", response_model=NotifySettingsOut)
def put_notifications(body: NotifySettingsIn, db: Session = Depends(get_db)):
    row = save_notify_settings(
        db,
        resource_manager_emails=body.resource_manager_emails,
        staffing_contact_emails=body.staffing_contact_emails,
    )
    row.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(row)
    return _out(row)
