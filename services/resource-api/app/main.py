from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import init_db
from app.routers import (
    allocations,
    dashboard,
    employees,
    health,
    jobs,
    leave,
    projects,
    recommendations,
    reports,
    sync,
    writeback,
)
from app.routers import settings as settings_router

API_PREFIX = "/api"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    try:
        from app.db import SessionLocal
        from app.services import refresh_non_project_staff_statuses

        with SessionLocal() as db:
            refresh_non_project_staff_statuses(db)
    except Exception:
        pass
    yield


app = FastAPI(title="Atlas Resource API", version="1.0.0", lifespan=lifespan)

cfg = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=cfg.cors_origin_list,
    allow_origin_regex=r"https://.*\.netlify\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=API_PREFIX)
app.include_router(projects.router, prefix=API_PREFIX)
app.include_router(employees.router, prefix=API_PREFIX)
app.include_router(allocations.router, prefix=API_PREFIX)
app.include_router(sync.router, prefix=API_PREFIX)
app.include_router(dashboard.router, prefix=API_PREFIX)
app.include_router(jobs.router, prefix=API_PREFIX)
app.include_router(reports.router, prefix=API_PREFIX)
app.include_router(recommendations.router, prefix=API_PREFIX)
app.include_router(leave.router, prefix=API_PREFIX)
app.include_router(writeback.router, prefix=API_PREFIX)
app.include_router(settings_router.router, prefix=API_PREFIX)
