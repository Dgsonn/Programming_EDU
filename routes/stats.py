from flask import Blueprint, jsonify, request
from datetime import date, timedelta
from db import get_db, MissionRepository
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
    uid  = current_user_id()
    conn = get_db()
    # Query 1: gộp user info + enrollment count vào 1 JOIN (giảm 1 round-trip)
    summary = conn.execute('''
        SELECT u.streak, u.certificates, u.last_study_date,
               COUNT(e.course_id) AS enrolled_count
        FROM users u
        LEFT JOIN enrollments e ON e.user_id = u.id
        WHERE u.id = %s
        GROUP BY u.id, u.streak, u.certificates, u.last_study_date
    ''', (uid,)).fetchone()
    # Query 2: lấy progress + time_spent để tính avg và tổng giờ
    rows = conn.execute(
        'SELECT progress, time_spent FROM enrollments WHERE user_id=%s', (uid,)
    ).fetchall()
    conn.close()
    avg_progress  = round(sum(r['progress'] for r in rows) / len(rows)) if rows else 0
    total_hours   = sum(parse_time_spent(r.get('time_spent')) for r in rows)
    last_date     = summary['last_study_date']
    streak_active = (last_date == date.today()) if last_date else False
    return jsonify({
        'enrolledCount': summary['enrolled_count'],
        'avgProgress':   avg_progress,
        'totalHours':    str(round(total_hours, 1)) + 'h',
        'streakDays':    summary['streak'],
        'streakActive':  streak_active,
        'certificates':  summary['certificates']
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
    user = conn.execute('SELECT gems, xp, streak, last_study_date FROM users WHERE id=%s', (uid,)).fetchone()

    today = date.today()
    last_date = user['last_study_date']

    if last_date is None or last_date < today - timedelta(days=1):
        # Bỏ học hơn 1 ngày → reset chuỗi về 1
        new_streak = 1
    elif last_date == today:
        # Đã học hôm nay → giữ nguyên chuỗi
        new_streak = user['streak']
    else:
        # Học hôm qua → tăng chuỗi
        new_streak = user['streak'] + 1

    conn.execute(
        'UPDATE users SET gems = gems + %s, xp = xp + %s, streak = %s, last_study_date = %s WHERE id=%s',
        (xp_reward, xp_reward, new_streak, today, uid)
    )
    user = conn.execute('SELECT gems, xp, streak FROM users WHERE id=%s', (uid,)).fetchone()
    conn.commit()
    conn.close()

    return jsonify({
        'success':      True,
        'message':      'Hoàn thành nhiệm vụ!',
        'gems':         user['gems'],
        'xp':           user['xp'],
        'streak':       user['streak'],
        'streak_active': True,
    })


@stats_bp.route('/api/streak/review-quiz-status', methods=['GET'])
@api_login_required
def review_quiz_status():
    uid  = current_user_id()
    conn = get_db()
    user = conn.execute('SELECT streak FROM users WHERE id=%s', (uid,)).fetchone()
    conn.close()

    streak = user['streak'] if user else 0
    return jsonify({
        'streak':         streak,
        'is_unlocked':    streak >= 5,
        'days_remaining': max(0, 5 - streak),
    })