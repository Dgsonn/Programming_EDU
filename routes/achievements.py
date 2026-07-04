"""
routes/achievements.py
─────────────────────────────────────────────────────────────
API thành tích (achievements):
  GET /api/achievements — toàn bộ achievement + trạng thái đã đạt/chưa
                          của user hiện tại.
"""
from flask import Blueprint, jsonify

from db import get_db
from utils import api_login_required, current_user_id

achievements_bp = Blueprint('achievements', __name__)


@achievements_bp.route('/api/achievements', methods=['GET'])
@api_login_required
def get_achievements():
    uid  = current_user_id()
    conn = get_db()
    try:
        rows = conn.execute(
            '''SELECT a.id, a.code, a.name, a.description, a.icon,
                      a.condition_type, a.condition_value, ua.awarded_at
               FROM achievements a
               LEFT JOIN user_achievements ua
                      ON ua.achievement_id = a.id AND ua.user_id = %s
               ORDER BY a.id''',
            (uid,)
        ).fetchall()
    finally:
        conn.close()

    result = []
    for r in rows:
        d = dict(r)
        d['conditionType']  = d.pop('condition_type')
        d['conditionValue'] = d.pop('condition_value')
        awarded_at          = d.pop('awarded_at')
        d['awardedAt']      = awarded_at.isoformat() if awarded_at else None
        d['unlocked']       = awarded_at is not None
        result.append(d)

    return jsonify({
        'achievements':  result,
        'unlockedCount': sum(1 for d in result if d['unlocked']),
        'totalCount':    len(result),
    })
