from flask import Blueprint, jsonify, request
from models import get_db
from utils import api_login_required, current_user_id

stats_bp = Blueprint('stats', __name__)


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
    total_hours  = sum(float(r['time_spent'].replace('h', '')) for r in rows)
    return jsonify({
        'enrolledCount': count,
        'avgProgress':   avg_progress,
        'totalHours':    str(round(total_hours, 1)) + 'h',
        'streakDays':    user['streak'],
        'certificates':  user['certificates']
    })

# Đáp án đúng cho từng khóa học
MISSIONS = {
    'cpp':     {'condition': 'pin < 20',   'action': 'charge()'},
    'python':  {'condition': 'km <= 10',   'action': 'deliver_now()'},
    'java':    {'condition': 'age >= 18',  'action': 'access_granted()'},
    'htmlcss': {'condition': 'width < 768','action': 'mobile_view()'},
}

@stats_bp.route('/api/mission/complete', methods=['POST'])
@api_login_required
def complete_mission():
    data       = request.get_json() or {}
    mission_id = data.get('mission_id', 'cpp')
    condition  = data.get('condition', '')
    action     = data.get('action', '')

    correct = MISSIONS.get(mission_id)
    if not correct or condition != correct['condition'] or action != correct['action']:
        return jsonify({'success': False, 'message': 'Câu trả lời chưa đúng, thử lại nhé!'})

    uid  = current_user_id()
    conn = get_db()
    conn.execute(
        'UPDATE users SET gems = gems + 50, xp = xp + 50, streak = streak + 1 WHERE id=%s',
        (uid,)
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