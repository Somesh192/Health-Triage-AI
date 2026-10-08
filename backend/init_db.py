"""
Database Initialization Script
Creates all tables and initializes default data
"""

from app.core.database import engine, Base, SessionLocal
from app.models import User, UserRole
from app.core.security import get_password_hash


def init_db():
    """Initialize database with all tables and default data"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Tables created successfully")

    # Create default admin user
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            print("Creating default admin user...")
            admin = User(
                id="admin-001",
                username="admin",
                email="admin@healthtriage.ai",
                full_name="System Administrator",
                hashed_password=get_password_hash("admin"),  # Change in production!
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("[OK] Default admin user created (username: admin, password: admin)")
        else:
            print("[INFO] Admin user already exists")

        # Create a test nurse user
        nurse = db.query(User).filter(User.username == "nurse").first()
        if not nurse:
            print("Creating test nurse user...")
            nurse = User(
                id="nurse-001",
                username="nurse",
                email="nurse@healthtriage.ai",
                full_name="Test Nurse",
                hashed_password=get_password_hash("nurse"),
                role=UserRole.NURSE,
                is_active=True
            )
            db.add(nurse)
            db.commit()
            db.refresh(nurse)
            print("[OK] Test nurse user created (username: nurse, password: nurse)")
        else:
            print("[INFO] Nurse user already exists")

        # Create a test medical officer
        mo = db.query(User).filter(User.username == "mo").first()
        if not mo:
            print("Creating test medical officer...")
            mo = User(
                id="mo-001",
                username="mo",
                email="mo@healthtriage.ai",
                full_name="Test Medical Officer",
                hashed_password=get_password_hash("mo"),
                role=UserRole.MEDICAL_OFFICER,
                is_active=True
            )
            db.add(mo)
            db.commit()
            db.refresh(mo)
            print("[OK] Test medical officer created (username: mo, password: mo)")
        else:
            print("[INFO] Medical officer already exists")

    except Exception as e:
        print(f"[ERROR] Error creating default users: {e}")
        db.rollback()
    finally:
        db.close()

    print("\n[OK] Database initialization complete!")


if __name__ == "__main__":
    init_db()
