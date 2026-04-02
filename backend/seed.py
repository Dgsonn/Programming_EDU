"""
Chạy file này một lần để tạo user mẫu và dữ liệu ban đầu:
    python seed.py
"""
from werkzeug.security import generate_password_hash
from app import create_app
from models import db, User, Enrollment, NotificationSetting, RoadmapItemProgress
from data import SEED_ENROLLMENTS, SEED_NOTIFICATIONS, SEED_ROADMAP_PROGRESS


def seed():
    app = create_app()
    with app.app_context():
        db.create_all()

        # Xoá user cũ nếu tồn tại để seed lại
        existing = User.query.filter_by(email="caovannhan@email.com").first()
        if existing:
            RoadmapItemProgress.query.filter_by(user_id=existing.id).delete()
            NotificationSetting.query.filter_by(user_id=existing.id).delete()
            Enrollment.query.filter_by(user_id=existing.id).delete()
            db.session.delete(existing)
            db.session.commit()
            print("Đã xoá user cũ.")

        # Tạo user mẫu
        user = User(
            name="Cao Văn Nhân",
            email="caovannhan@email.com",
            password_hash=generate_password_hash("123456"),
            phone="0901 234 567",
            dob="27/08/2000",
            language="vi",
            avatar_seed="programming",
            streak_days=12,
            hours_today=3.5,
            certificates_count=1,
        )
        db.session.add(user)
        db.session.flush()

        # Enrollments
        for e in SEED_ENROLLMENTS:
            db.session.add(Enrollment(user_id=user.id, **e))

        # Notification settings
        for n in SEED_NOTIFICATIONS:
            db.session.add(NotificationSetting(user_id=user.id, key=n["key"], enabled=n["enabled"]))

        # Roadmap progress
        for r in SEED_ROADMAP_PROGRESS:
            db.session.add(RoadmapItemProgress(user_id=user.id, **r))

        db.session.commit()
        print("✅ Seed thành công!")
        print("   Email   : caovannhan@email.com")
        print("   Password: 123456")


if __name__ == "__main__":
    seed()
