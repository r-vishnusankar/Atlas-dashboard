from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = f"sqlite:///{(ROOT / 'resource_tracker.db').as_posix()}"
    resource_service_token: str = ""
    cors_origins: str = "http://localhost:8083,http://127.0.0.1:8083"
    host: str = "127.0.0.1"
    port: int = 8090

    # Email (Phase 2) — if SMTP unset, messages are written to outbox_mail.log
    resource_emails: bool = True
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "atlas-resources@localhost"
    smtp_use_tls: bool = True
    notify_fallback_email: str = ""  # used when employee has no email

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
