from flask import Blueprint, jsonify
from models import get_db
from utils import api_login_required, current_user_id

courses_bp = Blueprint('courses', __name__)


@courses_bp.route('/api/courses', methods=['GET'])
@api_login_required
def get_courses():
    uid  = current_user_id()
    conn = get_db()
    rows = conn.execute('''
        SELECT c.*,
               CASE WHEN e.course_id IS NOT NULL THEN 1 ELSE 0 END AS enrolled
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.user_id = ?
    ''', (uid,)).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d['enrolled']    = bool(d['enrolled'])
        d['accentColor'] = d.pop('accent_color')
        result.append(d)
    return jsonify(result)


@courses_bp.route('/api/enrolled', methods=['GET'])
@api_login_required
def get_enrolled():
    uid   = current_user_id()
    icons = {'cpp': '📘', 'htmlcss': '📗', 'python': '📙', 'java': '📕'}
    conn  = get_db()
    rows  = conn.execute('''
        SELECT c.id, c.title, c.subtitle, c.color, c.accent_color,
               e.progress, e.completed_lessons,
               c.lessons AS total_lessons, c.duration,
               e.time_spent, e.last_lesson, e.next_lesson
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = ?
    ''', (uid,)).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d['accentColor']      = d.pop('accent_color')
        d['totalLessons']     = d.pop('total_lessons')
        d['completedLessons'] = d.pop('completed_lessons')
        d['timeSpent']        = d.pop('time_spent')
        d['lastLesson']       = d.pop('last_lesson')
        d['nextLesson']       = d.pop('next_lesson')
        d['icon']             = icons.get(d['id'], '📘')
        result.append(d)
    return jsonify(result)


@courses_bp.route('/api/courses/<course_id>/enroll', methods=['POST'])
@api_login_required
def enroll(course_id):
    uid    = current_user_id()
    conn   = get_db()
    course = conn.execute('SELECT id, title FROM courses WHERE id=?', (course_id,)).fetchone()
    if not course:
        conn.close()
        return jsonify({'error': 'Không tìm thấy khóa học'}), 404
    exists = conn.execute(
        'SELECT 1 FROM enrollments WHERE user_id=? AND course_id=?', (uid, course_id)
    ).fetchone()
    if not exists:
        first_lesson = 'Bài 1: ' + dict(course)['title']
        conn.execute(
            'INSERT INTO enrollments VALUES (?,?,0,0,"0h","",?)',
            (uid, course_id, first_lesson)
        )
        conn.commit()
    conn.close()
    return jsonify({'ok': True})


@courses_bp.route('/api/courses/<course_id>/enroll', methods=['DELETE'])
@api_login_required
def unenroll(course_id):
    uid  = current_user_id()
    conn = get_db()
    conn.execute('DELETE FROM enrollments WHERE user_id=? AND course_id=?', (uid, course_id))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
