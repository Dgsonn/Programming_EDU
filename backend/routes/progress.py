from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Enrollment
from data import COURSES_BY_ID

progress_bp = Blueprint("progress", __name__)


@progress_bp.get("")
@jwt_required()
def get_progress():
    user_id = int(get_jwt_identity())
    enrollments = Enrollment.query.filter_by(user_id=user_id).all()

    result = []
    for e in enrollments:
        course = COURSES_BY_ID.get(e.course_id)
        if not course:
            continue
        item = {
            **e.to_dict(),
            "title": course["title"],
            "subtitle": course["subtitle"],
            "color": course["color"],
            "accent_color": course["accent_color"],
            "total_lessons": course["lessons"],
            "duration": course["duration"],
        }
        result.append(item)

    return jsonify(result)


@progress_bp.put("/<course_id>")
@jwt_required()
def update_progress(course_id: str):
    user_id = int(get_jwt_identity())
    enrollment = Enrollment.query.filter_by(user_id=user_id, course_id=course_id).first()
    if not enrollment:
        return jsonify({"error": "Chưa đăng ký khóa học này"}), 404

    data = request.get_json()
    if "progress" in data:
        enrollment.progress = max(0, min(100, int(data["progress"])))
    if "time_spent_hours" in data:
        enrollment.time_spent_hours = float(data["time_spent_hours"])
    if "completed_lessons" in data:
        enrollment.completed_lessons = int(data["completed_lessons"])
    if "last_lesson" in data:
        enrollment.last_lesson = str(data["last_lesson"])
    if "next_lesson" in data:
        enrollment.next_lesson = str(data["next_lesson"])

    db.session.commit()
    return jsonify(enrollment.to_dict())
