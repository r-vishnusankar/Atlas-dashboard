from fastapi import Depends, Header, HTTPException

from app.config import get_settings


def require_service_token(
    x_resource_token: str | None = Header(default=None, alias="X-Resource-Token"),
) -> None:
    expected = (get_settings().resource_service_token or "").strip()
    if not expected:
        return
    if not x_resource_token or x_resource_token.strip() != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing X-Resource-Token")
