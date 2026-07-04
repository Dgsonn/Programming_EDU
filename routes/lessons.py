"""
routes/lessons.py
─────────────────────────────────────────────────────────────
API tiến độ bài học — nguồn thật là bảng lesson_progress,
enrollments chỉ là cache tổng (completed_lessons / progress).

POST /api/lessons/<lesson_no>/complete
  Body JSON: { "courseId": "db_design", "quizScore": 90, "xpEarned": 50,
               "lessonTitle": "Entity Set & Primary Key" }
  lesson_no là SỐ THỨ TỰ bài trong khóa (1-based) — frontend hiện chỉ biết
  index, không biết PK bảng lessons; route tự resolve/tạo row lessons tương ứng.
"""
from datetime import date, timedelta

from flask import Blueprint, jsonify, request

from db import get_db
from db.repositories.achievements import check_and_award_achievements
from utils import api_login_required, current_user_id

lessons_bp = Blueprint('lessons', __name__)


def _resolve_lesson_id(conn, course_id, lesson_no, title):
    """Tìm lesson theo (course_id, sort_order); nếu chưa có (bảng lessons chỉ
    được nhập qua trang admin, có thể rỗng) thì tạo stub để giữ FK hợp lệ."""
    row = conn.execute(
        'SELECT id FROM lessons WHERE course_id=%s AND sort_order=%s LIMIT 1',
        (course_id, lesson_no)
    ).fetchone()
    if row:
        return row['id']
    row = conn.execute(
        '''INSERT INTO lessons (course_id, title, sort_order)
           VALUES (%s, %s, %s) RETURNING id''',
        (course_id, title or f'Bài {lesson_no}', lesson_no)
    ).fetchone()
    return row['id']


@lessons_bp.route('/api/lessons/<int:lesson_no>/complete', methods=['POST'])
@api_login_required
def complete_lesson(lesson_no):
    data      = request.get_json(silent=True) or {}
    course_id = data.get('courseId') or data.get('course_id')
    if not course_id:
        return jsonify({'error': 'Thiếu courseId'}), 400

    quiz_score = data.get('quizScore')
    if quiz_score is not None and not isinstance(quiz_score, int):
        quiz_score = None
    xp_earned = data.get('xpEarned')
    if not isinstance(xp_earned, int) or xp_earned < 0 or xp_earned > 500:
        xp_earned = 50  # mặc định an toàn, chống client gửi XP tùy ý

    uid  = current_user_id()
    conn = get_db()
    try:
        course = conn.execute(
            'SELECT id, lessons FROM courses WHERE id=%s', (course_id,)
        ).fetchone()
        if not course:
            return jsonify({'error': 'Không tìm thấy khóa học'}), 404

        lesson_id = _resolve_lesson_id(conn, course_id, lesson_no, data.get('lessonTitle'))

        # Đã completed rồi thì không cộng XP lần nữa (chống spam F5 modal)
        existed = conn.execute(
            "SELECT 1 FROM lesson_progress WHERE user_id=%s AND lesson_id=%s AND status='completed'",
            (uid, lesson_id)
        ).fetchone()

        conn.execute(
            '''INSERT INTO lesson_progress
                   (user_id, lesson_id, course_id, status, quiz_score, xp_earned, completed_at)
               VALUES (%s, %s, %s, 'completed', %s, %s, now())
               ON CONFLICT (user_id, lesson_id) DO UPDATE SET
                   status       = 'completed',
                   quiz_score   = COALESCE(EXCLUDED.quiz_score, lesson_progress.quiz_score),
                   xp_earned    = GREATEST(EXCLUDED.xp_earned, lesson_progress.xp_earned),
                   completed_at = COALESCE(lesson_progress.completed_at, EXCLUDED.completed_at)''',
            (uid, lesson_id, course_id, quiz_score, xp_earned)
        )

        # Tính lại cache enrollments từ nguồn thật lesson_progress
        done_row = conn.execute(
            "SELECT COUNT(*) AS n FROM lesson_progress "
            "WHERE user_id=%s AND course_id=%s AND status='completed'",
            (uid, course_id)
        ).fetchone()
        completed_count = done_row['n']
        total_lessons   = course['lessons'] or 0
        progress = min(100, round(completed_count * 100 / total_lessons)) if total_lessons else 0
        conn.execute(
            '''UPDATE enrollments
               SET completed_lessons = %s,
                   progress          = %s,
                   completed_at      = CASE WHEN %s >= 100 THEN COALESCE(completed_at, now())
                                            ELSE completed_at END
               WHERE user_id=%s AND course_id=%s''',
            (completed_count, progress, progress, uid, course_id)
        )

        gained = 0
        if not existed:
            gained = xp_earned
            today = date.today()
            user = conn.execute(
                'SELECT streak, last_study_date FROM users WHERE id=%s', (uid,)
            ).fetchone()
            last_date = user['last_study_date'] if user else None
            if last_date is None or last_date < today - timedelta(days=1):
                new_streak = 1
            elif last_date == today:
                new_streak = user['streak']
            else:
                new_streak = user['streak'] + 1
            conn.execute(
                'UPDATE users SET xp = xp + %s, gems = gems + %s, streak = %s, '
                'last_study_date = %s WHERE id=%s',
                (gained, gained, new_streak, today, uid)
            )
            # Log XP theo ngày (nguồn cho leaderboard tuần) — upsert cộng dồn
            conn.execute(
                '''INSERT INTO user_daily_xp_logs (user_id, log_date, xp_earned)
                   VALUES (%s, %s, %s)
                   ON CONFLICT (user_id, log_date)
                   DO UPDATE SET xp_earned = user_daily_xp_logs.xp_earned + EXCLUDED.xp_earned''',
                (uid, today, gained)
            )

        newly_awarded = check_and_award_achievements(uid, conn)
        conn.commit()
    finally:
        conn.close()

    return jsonify({
        'ok':                True,
        'completedLessons':  completed_count,
        'progress':          progress,
        'xpGained':          gained,
        'newAchievements':   newly_awarded,
    })
