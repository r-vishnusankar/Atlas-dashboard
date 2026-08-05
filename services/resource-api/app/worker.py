"""Run daily jobs once: python -m app.worker"""
from app.db import SessionLocal, init_db
from app.email_worker import process_outbox
from app.reco import auto_release_completed_projects, auto_release_ended, take_util_snapshot


def main():
    init_db()
    db = SessionLocal()
    try:
        print("auto-release end_date:", auto_release_ended(db))
        print("auto-release completed:", auto_release_completed_projects(db))
        print("outbox:", process_outbox(db, limit=100))
        print("snapshot:", take_util_snapshot(db))
    finally:
        db.close()


if __name__ == "__main__":
    main()
