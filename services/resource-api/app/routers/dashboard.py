from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import require_service_token
from app.db import get_db
from app.schemas import DashboardOut
from app.services import compute_dashboard

router = APIRouter(prefix="/dashboard", tags=["dashboard"], dependencies=[Depends(require_service_token)])


@router.get("/resources", response_model=DashboardOut)
def resources_dashboard(db: Session = Depends(get_db)):
    return compute_dashboard(db)
