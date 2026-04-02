from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), default="")
    dob = db.Column(db.String(20), default="")
    language = db.Column(db.String(10), default="vi")
    avatar_seed = db.Column(db.String(100), default="programming")
    streak_days = db.Column(db.Integer, default=0)
    hours_today = db.Column(db.Float, default=0.0)
    certificates_count = db.Column(db.Integer, default=0)

    enrollments = db.relationship("Enrollment", backref="user", lazy=True)
    notification_settings = db.relationship("NotificationSetting", backref="user", lazy=True)
    roadmap_progress = db.relationship("RoadmapItemProgress", backref="user", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "dob": self.dob,
            "language": self.language,
            "avatar_seed": self.avatar_seed,
            "streak_days": self.streak_days,
            "hours_today": self.hours_today,
            "certificates_count": self.certificates_count,
        }


class Enrollment(db.Model):
    __tablename__ = "enrollments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.String(20), nullable=False)
    progress = db.Column(db.Integer, default=0)
    time_spent_hours = db.Column(db.Float, default=0.0)
    completed_lessons = db.Column(db.Integer, default=0)
    last_lesson = db.Column(db.String(200), default="")
    next_lesson = db.Column(db.String(200), default="")

    __table_args__ = (db.UniqueConstraint("user_id", "course_id"),)

    def to_dict(self):
        return {
            "course_id": self.course_id,
            "progress": self.progress,
            "time_spent_hours": self.time_spent_hours,
            "completed_lessons": self.completed_lessons,
            "last_lesson": self.last_lesson,
            "next_lesson": self.next_lesson,
        }


class NotificationSetting(db.Model):
    __tablename__ = "notification_settings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    key = db.Column(db.String(50), nullable=False)
    enabled = db.Column(db.Boolean, default=True)

    __table_args__ = (db.UniqueConstraint("user_id", "key"),)

    def to_dict(self):
        return {"key": self.key, "enabled": self.enabled}


class RoadmapItemProgress(db.Model):
    __tablename__ = "roadmap_progress"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    roadmap_id = db.Column(db.String(50), nullable=False)
    item_id = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default="not-started")

    __table_args__ = (db.UniqueConstraint("user_id", "roadmap_id", "item_id"),)

    def to_dict(self):
        return {
            "roadmap_id": self.roadmap_id,
            "item_id": self.item_id,
            "status": self.status,
        }