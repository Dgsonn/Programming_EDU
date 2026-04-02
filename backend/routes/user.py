from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, NotificationSetting, Enrollment

user_bp = Blueprint("user", __name__)


@user_bp.get("/profile")
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = db.get_or_404(User, user_id)
    return jsonify(user.to_dict())


@user_bp.put("/profile")
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = db.get_or_404(User, user_id)
    data = request.get_json()

    allowed = ("name", "phone", "dob", "language", "avatar_seed")
    for field in allowed:
        if field in data:
            setattr(user, field, str(data[field]).strip())

    db.session.commit()
    return jsonify(user.to_dict())


@user_bp.get("/stats")
@jwt_required()
def get_stats():
    user_id = int(get_jwt_identity())
    user = db.get_or_404(User, user_id)
    enrolled_count = Enrollment.query.filter_by(user_id=user_id).count()

    return jsonify({
        "courses_enrolled": enrolled_count,
        "hours_today": user.hours_today,
        "streak_days": user.streak_days,
        "certificates_count": user.certificates_count,
    })


@user_bp.get("/notifications")
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    settings = NotificationSetting.query.filter_by(user_id=user_id).all()
    return jsonify({s.key: s.enabled for s in settings})


@user_bp.put("/notifications")
@jwt_required()
def update_notifications():
    user_id = int(get_jwt_identity())
    data = request.get_json()  # { "email": true, "push": false, ... }

    for key, enabled in data.items():
        setting = NotificationSetting.query.filter_by(user_id=user_id, key=key).first()
        if setting:
            setting.enabled = bool(enabled)
        else:
            db.session.add(NotificationSetting(user_id=user_id, key=key, enabled=bool(enabled)))

    db.session.commit()
    settings = NotificationSetting.query.filter_by(user_id=user_id).all()
    return jsonify({s.key: s.enabled for s in settings})


@user_bp.put("/change-password")
@jwt_required()
def change_password():
    from werkzeug.security import check_password_hash, generate_password_hash
    user_id = int(get_jwt_identity())
    user = db.get_or_404(User, user_id)
    data = request.get_json()

    current = data.get("current_password", "")
    new_pw = data.get("new_password", "")

    if not check_password_hash(user.password_hash, current):
        return jsonify({"error": "Mật khẩu hiện tại không đúng"}), 401

    if len(new_pw) < 6:
        return jsonify({"error": "Mật khẩu mới phải có ít nhất 6 ký tự"}), 400

    user.password_hash = generate_password_hash(new_pw)
    db.session.commit()
    return jsonify({"message": "Đổi mật khẩu thành công"})
