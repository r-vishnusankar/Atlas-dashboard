import uuid
from datetime import date, datetime, timezone

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    employee_code: Mapped[str | None] = mapped_column(String(64), index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    department: Mapped[str | None] = mapped_column(String(128))
    designation: Mapped[str | None] = mapped_column(String(128))
    role_family: Mapped[str | None] = mapped_column(String(64), default="Developer")
    seniority: Mapped[str | None] = mapped_column(String(32))
    years_experience: Mapped[float | None] = mapped_column(Float)
    years_at_company: Mapped[float | None] = mapped_column(Float)
    external_experience: Mapped[float | None] = mapped_column(Float)
    availability_status: Mapped[str] = mapped_column(String(40), default="Bench")
    manager_employee_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("employees.id"), nullable=True)
    workspace_ids: Mapped[str | None] = mapped_column(Text)  # comma-separated
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)

    skills: Mapped[list["EmployeeSkill"]] = relationship(back_populates="employee", cascade="all, delete-orphan")
    allocations: Mapped[list["Allocation"]] = relationship(
        back_populates="employee",
        foreign_keys="Allocation.employee_id",
        cascade="all, delete-orphan",
    )


class EmployeeSkill(Base):
    __tablename__ = "employee_skills"
    __table_args__ = (UniqueConstraint("employee_id", "skill_name", name="uq_emp_skill"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    skill_name: Mapped[str] = mapped_column(String(128), nullable=False)
    skill_category: Mapped[str | None] = mapped_column(String(64))
    proficiency: Mapped[int] = mapped_column(Integer, default=3)

    employee: Mapped["Employee"] = relationship(back_populates="skills")


class ProjectCatalog(Base):
    __tablename__ = "projects_catalog"
    __table_args__ = (UniqueConstraint("workspace_id", "external_id", name="uq_ws_project"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    external_id: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    client: Mapped[str | None] = mapped_column(String(128))
    stage: Mapped[str | None] = mapped_column(String(64))
    status: Mapped[str | None] = mapped_column(String(64))
    priority: Mapped[str | None] = mapped_column(String(32))
    release_date: Mapped[str | None] = mapped_column(String(32))
    pm_employee_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("employees.id"), nullable=True)
    # project = delivery project; operational = HR / Marketing / internal function
    activity_type: Mapped[str] = mapped_column(String(32), default="project", index=True)
    synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class Allocation(Base):
    __tablename__ = "allocations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    project_external_id: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    allocation_pct: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    project_role: Mapped[str | None] = mapped_column(String(64))
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(32), default="Active")  # Planned/Active/Completed/Released
    reporting_manager_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("employees.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)

    employee: Mapped["Employee"] = relationship(back_populates="allocations", foreign_keys=[employee_id])


class AllocationHistory(Base):
    __tablename__ = "allocation_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    allocation_id: Mapped[str | None] = mapped_column(String(36), index=True)
    employee_id: Mapped[str] = mapped_column(String(36), index=True)
    project_external_id: Mapped[str] = mapped_column(String(128))
    workspace_id: Mapped[str] = mapped_column(String(64))
    allocation_pct: Mapped[int] = mapped_column(Integer)
    project_role: Mapped[str | None] = mapped_column(String(64))
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(32))
    actor: Mapped[str | None] = mapped_column(String(128))
    reason: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class NotificationOutbox(Base):
    __tablename__ = "notification_outbox"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    event_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    payload_json: Mapped[str] = mapped_column(Text, nullable=False)
    to_email: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(32), default="pending")  # pending/sent/failed
    retries: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class NotifySettings(Base):
    """Singleton-ish row for resource notification emails (editable from Atlas Settings)."""
    __tablename__ = "notify_settings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default="default")
    resource_manager_emails: Mapped[str | None] = mapped_column(Text)  # comma-separated
    staffing_contact_emails: Mapped[str | None] = mapped_column(Text)  # shown to employees
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class LeaveDay(Base):
    """Phase 5: leave/holiday impacting capacity (simple date range)."""
    __tablename__ = "leave_days"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    leave_type: Mapped[str] = mapped_column(String(64), default="Leave")  # Leave / Holiday
    notes: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class UtilSnapshot(Base):
    """Weekly utilization snapshot for trend reports."""
    __tablename__ = "util_snapshots"
    __table_args__ = (UniqueConstraint("snapshot_date", name="uq_util_snap_date"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    total_employees: Mapped[int] = mapped_column(Integer, default=0)
    allocated: Mapped[int] = mapped_column(Integer, default=0)
    bench: Mapped[int] = mapped_column(Integer, default=0)
    avg_utilization_pct: Mapped[int] = mapped_column(Integer, default=0)
    over_allocated: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class RecommendationRun(Base):
    __tablename__ = "recommendation_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    suggestions_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
