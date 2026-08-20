from collections.abc import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

settings = get_settings()
_db_url = settings.sqlalchemy_url
_is_sqlite = _db_url.startswith("sqlite")
_engine_kwargs = {"future": True, "pool_pre_ping": True}
if _is_sqlite:
    _engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    _engine_kwargs["pool_size"] = 5
    _engine_kwargs["max_overflow"] = 10
engine = create_engine(_db_url, **_engine_kwargs)

if _is_sqlite:
    @event.listens_for(engine, "connect")
    def _sqlite_fk(dbapi_conn, _):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    _migrate_sqlite_columns()


def _migrate_sqlite_columns() -> None:
    """Add new columns on existing SQLite DBs (create_all does not alter)."""
    if not _is_sqlite:
        return
    with engine.begin() as conn:
        cols = {row[1] for row in conn.exec_driver_sql("PRAGMA table_info(projects_catalog)").fetchall()}
        if "activity_type" not in cols:
            conn.exec_driver_sql(
                "ALTER TABLE projects_catalog ADD COLUMN activity_type VARCHAR(32) DEFAULT 'project'"
            )
            conn.exec_driver_sql(
                "UPDATE projects_catalog SET activity_type = 'project' WHERE activity_type IS NULL OR activity_type = ''"
            )
