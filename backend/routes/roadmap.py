from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, RoadmapItemProgress

roadmap_bp = Blueprint("roadmap", __name__)

VALID_STATUSES = {"completed", "in-progress", "not-started"}


@roadmap_bp.get("/progress")
@jwt_required()
def get_progress():
    user_id = int(get_jwt_identity())
    rows = RoadmapItemProgress.query.filter_by(user_id=user_id).all()
    # Trả về dict { "roadmap_id:item_id": status }
    result = {f"{r.roadmap_id}:{r.item_id}": r.status for r in rows}
    return jsonify(result)


@roadmap_bp.put("/<roadmap_id>/items/<item_id>")
@jwt_required()
def update_item(roadmap_id: str, item_id: str):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    status = data.get("status", "not-started")

    if status not in VALID_STATUSES:
        return jsonify({"error": f"status phải là một trong {VALID_STATUSES}"}), 400

    row = RoadmapItemProgress.query.filter_by(
        user_id=user_id, roadmap_id=roadmap_id, item_id=item_id
    ).first()

    if row:
        row.status = status
    else:
        row = RoadmapItemProgress(
            user_id=user_id, roadmap_id=roadmap_id, item_id=item_id, status=status
        )
        db.session.add(row)

    db.session.commit()
    return jsonify(row.to_dict())
