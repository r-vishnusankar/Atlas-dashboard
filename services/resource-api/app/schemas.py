from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator


class SkillIn(BaseModel):
    skill_name: str
    skill_category: str | None = None
    proficiency: int = Field(default=3, ge=1, le=5)


class SkillOut(SkillIn):
    id: str


class EmployeeCreate(BaseModel):
    employee_code: str | None = None
    full_name: str
    email: str | None = None
    department: str | None = None
    designation: str | None = None
    role_family: str | None = "Developer"
    seniority: str | None = None
    years_experience: float | None = None
    years_at_company: float | None = None
    external_experience: float | None = None
    availability_status: str | None = "Bench"
    manager_employee_id: str | None = None
    workspace_ids: list[str] | None = None
    active: bool = True
    skills: list[SkillIn] | None = None


class EmployeeUpdate(BaseModel):
    employee_code: str | None = None
    full_name: str | None = None
    email: str | None = None
    department: str | None = None
    designation: str | None = None
    role_family: str | None = None
    seniority: str | None = None
    years_experience: float | None = None
    years_at_company: float | None = None
    external_experience: float | None = None
    availability_status: str | None = None
    manager_employee_id: str | None = None
    workspace_ids: list[str] | None = None
    active: bool | None = None
    skills: list[SkillIn] | None = None


class EmployeeOut(BaseModel):
    id: str
    employee_code: str | None
    full_name: str
    email: str | None
    department: str | None
    designation: str | None
    role_family: str | None
    seniority: str | None
    years_experience: float | None
    years_at_company: float | None
    external_experience: float | None
    availability_status: str
    project_staffable: bool = True
    manager_employee_id: str | None
    workspace_ids: list[str]
    active: bool
    utilization_pct: int = 0
    skills: list[SkillOut] = []
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class AllocationCreate(BaseModel):
    employee_id: str
    project_external_id: str
    workspace_id: str
    allocation_pct: int = Field(default=100, ge=1, le=100)
    project_role: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str = "Active"
    reporting_manager_id: str | None = None
    actor: str | None = None
    reason: str | None = None
    strict: bool = False  # if True, reject when over 100% FTE


class AllocationUpdate(BaseModel):
    allocation_pct: int | None = Field(default=None, ge=1, le=100)
    project_role: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str | None = None
    reporting_manager_id: str | None = None
    actor: str | None = None
    reason: str | None = None
    strict: bool = False


class AllocationOut(BaseModel):
    id: str
    employee_id: str
    project_external_id: str
    workspace_id: str
    allocation_pct: int
    project_role: str | None
    start_date: date | None
    end_date: date | None
    status: str
    reporting_manager_id: str | None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    warnings: list[str] = []

    model_config = {"from_attributes": True}


class AllocationHistoryOut(BaseModel):
    id: str
    allocation_id: str | None
    employee_id: str
    project_external_id: str
    workspace_id: str
    allocation_pct: int
    project_role: str | None
    start_date: date | None
    end_date: date | None
    status: str
    actor: str | None
    reason: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectSyncItem(BaseModel):
    external_id: str
    name: str
    client: str | None = None
    stage: str | None = None
    status: str | None = None
    priority: str | None = None
    release_date: str | None = None
    pm_employee_id: str | None = None


class ProjectSyncRequest(BaseModel):
    workspace_id: str
    projects: list[ProjectSyncItem]


class ProjectCreate(BaseModel):
    name: str
    workspace_id: str
    external_id: str | None = None
    client: str | None = None
    stage: str | None = "Planning"
    status: str | None = "on_track"
    priority: str | None = "Medium"
    release_date: str | None = None
    pm_employee_id: str | None = None
    activity_type: str | None = "project"  # project | operational


class ProjectUpdate(BaseModel):
    name: str | None = None
    client: str | None = None
    stage: str | None = None
    status: str | None = None
    priority: str | None = None
    release_date: str | None = None
    pm_employee_id: str | None = None
    activity_type: str | None = None  # project | operational


class ProjectOut(BaseModel):
    id: str
    external_id: str
    workspace_id: str
    name: str
    client: str | None = None
    stage: str | None = None
    status: str | None = None
    priority: str | None = None
    release_date: str | None = None
    pm_employee_id: str | None = None
    activity_type: str = "project"
    synced_at: datetime | None = None
    source: str = "catalog"  # catalog | manual (hint for UI)

    model_config = {"from_attributes": True}


class EmployeeImportItem(BaseModel):
    employee_code: str | None = None
    full_name: str
    email: str | None = None
    department: str | None = None
    designation: str | None = None
    role_family: str | None = None
    years_experience: float | None = None
    years_at_company: float | None = None
    external_experience: float | None = None
    workspace_ids: list[str] | None = None


class EmployeeImportRequest(BaseModel):
    employees: list[EmployeeImportItem]
    upsert_by: str = "name"  # name | code

    @field_validator("upsert_by")
    @classmethod
    def _upsert(cls, v: str) -> str:
        if v not in ("name", "code"):
            raise ValueError("upsert_by must be name or code")
        return v


class DashboardOut(BaseModel):
    total_employees: int
    staffable_employees: int | None = None
    allocated: int
    bench: int
    partially_allocated: int
    fully_allocated: int
    avg_utilization_pct: int
    active_allocations: int
    projects_in_catalog: int
    over_allocated: int
    freeing_30d: int


class ApiMeta(BaseModel):
    ok: bool = True
    detail: Any = None
