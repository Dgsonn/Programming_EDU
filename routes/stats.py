from flask import Blueprint, jsonify
from models import get_db
from utils import api_login_required, current_user_id

stats_bp = Blueprint('stats', __name__)


@stats_bp.route('/api/stats', methods=['GET'])
@api_login_required
def get_stats():
    uid   = current_user_id()
    conn  = get_db()
    user  = conn.execute('SELECT streak, certificates FROM users WHERE id=?', (uid,)).fetchone()
    count = conn.execute(
        'SELECT COUNT(*) AS n FROM enrollments WHERE user_id=?', (uid,)
    ).fetchone()['n']
    rows  = conn.execute(
        'SELECT progress, time_spent FROM enrollments WHERE user_id=?', (uid,)
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
