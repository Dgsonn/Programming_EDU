"""
db/repositories/achievements.py
─────────────────────────────────────────────────────────────
Logic trao thành tích (achievements) dùng chung.

check_and_award_achievements(user_id, conn) nhận conn wrapper (từ get_db())
để chạy CHUNG transaction với caller — caller tự commit sau khi gọi.
"""


def _get_metrics(user_id, conn):
    """Gom số liệu thật của user để so với điều kiện achievement."""
    user = conn.execute(
        'SELECT streak, xp FROM users WHERE id=%s', (user_id,)
    ).fetchone()
    lesson_row = conn.execute(
        "SELECT COUNT(*) AS n FROM lesson_progress WHERE user_id=%s AND status='completed'",
        (user_id,)
    ).fetchone()
    course_row = conn.execute(
        'SELECT COUNT(*) AS n FROM enrollments WHERE user_id=%s AND progress >= 100',
        (user_id,)
    ).fetchone()
    return {
        'lesson_count':    lesson_row['n'] if lesson_row else 0,
        'streak_days':     (user['streak'] if user else 0) or 0,
        'xp_total':        (user['xp'] if user else 0) or 0,
        'course_complete': course_row['n'] if course_row else 0,
    }


def check_and_award_achievements(user_id, conn):
    """So điều kiện từng achievement với số liệu thật, insert user_achievements
    nếu đạt và chưa có. Trả về danh sách achievement VỪA được trao (có thể rỗng).
    KHÔNG commit — caller chịu trách nhiệm commit."""
    metrics = _get_metrics(user_id, conn)

    rows = conn.execute(
        'SELECT id, code, name, icon, condition_type, condition_value FROM achievements'
    ).fetchall()

    newly_awarded = []
    for a in rows:
        value = metrics.get(a['condition_type'])
        if value is None or value < a['condition_value']:
            continue
        # ON CONFLICT DO NOTHING + RETURNING: chỉ trả row khi thật sự insert mới
        inserted = conn.execute(
            '''INSERT INTO user_achievements (user_id, achievement_id)
               VALUES (%s, %s)
               ON CONFLICT (user_id, achievement_id) DO NOTHING
               RETURNING achievement_id''',
            (user_id, a['id'])
        ).fetchone()
        if inserted:
            newly_awarded.append({
                'code': a['code'],
                'name': a['name'],
                'icon': a['icon'],
            })
    return newly_awarded
