from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Enrollment
from data import COURSES, COURSES_BY_ID

courses_bp = Blueprint("courses", __name__)


@courses_bp.get("")
@jwt_required()
def get_courses():
    user_id = int(get_jwt_identity())
    enrollments = {e.course_id for e in Enrollment.query.filter_by(user_id=user_id).all()}

    result = []
    for c in COURSES:
        course = dict(c)
        course["enrolled"] = c["id"] in enrollments
        # Thêm progress nếu đã đăng ký
        if course["enrolled"]:
            enrollment = Enrollment.query.filter_by(user_id=user_id, course_id=c["id"]).first()
            course["progress"] = enrollment.progress if enrollment else 0
        else:
            course["progress"] = 0
        result.append(course)

    return jsonify(result)


@courses_bp.get("/<course_id>")
@jwt_required()
def get_course(course_id: str):
    user_id = int(get_jwt_identity())
    course = COURSES_BY_ID.get(course_id)
    if not course:
        return jsonify({"error": "Không tìm thấy khóa học"}), 404

    result = dict(course)
    enrollment = Enrollment.query.filter_by(user_id=user_id, course_id=course_id).first()
    result["enrolled"] = enrollment is not None
    result["progress"] = enrollment.progress if enrollment else 0
    return jsonify(result)


@courses_bp.post("/<course_id>/enroll")
@jwt_required()
def enroll(course_id: str):
    user_id = int(get_jwt_identity())
    if course_id not in COURSES_BY_ID:
        return jsonify({"error": "Không tìm thấy khóa học"}), 404

    existing = Enrollment.query.filter_by(user_id=user_id, course_id=course_id).first()
    if existing:
        return jsonify({"error": "Đã đăng ký khóa học này"}), 409

    from models import db
    enrollment = Enrollment(
        user_id=user_id,
        course_id=course_id,
        next_lesson=f"Bài 1: Giới thiệu {COURSES_BY_ID[course_id]['title']}",
    )
    db.session.add(enrollment)
    db.session.commit()
    return jsonify({"message": "Đăng ký thành công"}), 201
