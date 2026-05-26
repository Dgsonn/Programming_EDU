from flask import Blueprint, jsonify, request
from models import get_db, MissionRepository
from utils import api_login_required, current_user_id

stats_bp = Blueprint('stats', __name__)


def parse_time_spent(value) -> float:
    if value is None or value == '':
        return 0.0
    s = str(value).replace('h', '').strip()
    if not s:
        return 0.0
    try:
        result = float(s)
    except ValueError:
        return 0.0
    if result < 0:
        return 0.0
    if result > 24:
        return 24.0
    return result


@stats_bp.route('/api/stats', methods=['GET'])
@api_login_required
def get_stats():
    uid   = current_user_id()
    conn  = get_db()
    user  = conn.execute('SELECT streak, certificates FROM users WHERE id=%s', (uid,)).fetchone()
    count = conn.execute(
        'SELECT COUNT(*) AS n FROM enrollments WHERE user_id=%s', (uid,)
    ).fetchone()['n']
    rows  = conn.execute(
        'SELECT progress, time_spent FROM enrollments WHERE user_id=%s', (uid,)
    ).fetchall()
    conn.close()
    avg_progress = round(sum(r['progress'] for r in rows) / len(rows)) if rows else 0
    total_hours  = sum(parse_time_spent(r.get('time_spent')) for r in rows)
    return jsonify({
        'enrolledCount': count,
        'avgProgress':   avg_progress,
        'totalHours':    str(round(total_hours, 1)) + 'h',
        'streakDays':    user['streak'],
        'certificates':  user['certificates']
    })

# # Đáp án đúng cho từng khóa học — đã được chuyển vào bảng missions (DB)
# Xem MissionRepository trong models.py

@stats_bp.route('/api/mission/complete', methods=['POST'])
@api_login_required
def complete_mission():
    data       = request.get_json() or {}
    # Frontend gửi mission_id = course_id (string), dùng verify_answer_by_course()
    # để backward-compatible — không cần sửa JS phía client.
    mission_id = data.get('mission_id', '')
    condition  = data.get('condition', '')
    action     = data.get('action', '')

    if not mission_id:
        return jsonify({'success': False, 'message': 'Thiếu mission_id'}), 400

    mission = MissionRepository.verify_answer_by_course(mission_id, condition, action)
    if not mission:
        return jsonify({'success': False, 'message': 'Câu trả lời chưa đúng, thử lại nhé!'})

    xp_reward = mission['xp_reward']
    uid  = current_user_id()
    conn = get_db()
    conn.execute(
        'UPDATE users SET gems = gems + %s, xp = xp + %s, streak = streak + 1 WHERE id=%s',
        (xp_reward, xp_reward, uid)
    )
    user = conn.execute('SELECT gems, xp, streak FROM users WHERE id=%s', (uid,)).fetchone()
    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': 'Hoàn thành nhiệm vụ!',
        'gems':    user['gems'],
        'xp':      user['xp'],
        'streak':  user['streak'],
    })