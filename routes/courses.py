from flask import Blueprint, jsonify, request
from models import get_db
from utils import api_login_required, current_user_id

courses_bp = Blueprint('courses', __name__)


@courses_bp.route('/api/courses', methods=['GET'])
@api_login_required
def get_courses():
    uid = current_user_id()
    q = request.args.get('q', '').strip()
    level = request.args.get('level', '').strip()
    languages = request.args.getlist('language')

    where_clauses = []
    params = [uid]

    if q:
        q_lower = q.lower()
        if q_lower == 'c' or q_lower == 'c++':
            where_clauses.append(
                '(c.title ILIKE %s OR c.subtitle ILIKE %s OR c.description ILIKE %s OR c.tag ILIKE %s)'
            )
            params.extend(['%c / c++%', '%c / c++%', '%c / c++%', '%c / c++%'])
        else:
            query_value = f"%{q}%"
            where_clauses.append(
                '(c.title ILIKE %s OR c.subtitle ILIKE %s OR c.description ILIKE %s OR c.tag ILIKE %s)'
            )
            params.extend([query_value] * 4)

    if level and level != 'all':
        if level == 'Cơ bản':
            where_clauses.append('c.level ILIKE %s')
            params.append('%cơ bản%')
        elif level == 'Trung cấp':
            where_clauses.append('c.level ILIKE %s')
            params.append('%trung cấp%')
        elif level == 'Nâng cao':
            where_clauses.append('c.level ILIKE %s')
            params.append('%nâng cao%')
        elif level == 'Phù hợp người mới':
            where_clauses.append('c.level ILIKE %s')
            params.append('%phù hợp người mới%')


    lang_clauses = []
    for lang in languages:
        if lang == 'Python':
            lang_clauses.append('(c.title ILIKE %s OR c.tag ILIKE %s)')
            params.extend(['%python%', '%python%'])
        elif lang == 'JS':
            lang_clauses.append(
                '(c.title ILIKE %s OR c.tag ILIKE %s OR c.subtitle ILIKE %s)'
            )
            params.extend(['%js%', '%js%', '%javascript%'])
        elif lang == 'Java':
            lang_clauses.append('(c.title ILIKE %s OR c.tag ILIKE %s)')
            params.extend(['%java%', '%java%'])
        elif lang == 'SQL':
            lang_clauses.append(
                '(c.title ILIKE %s OR c.tag ILIKE %s OR c.description ILIKE %s)'
            )
            params.extend(['%sql%', '%sql%', '%sql%'])

    if lang_clauses:
        where_clauses.append('(' + ' OR '.join(lang_clauses) + ')')

    query = '''
        SELECT c.*,
               CASE WHEN e.course_id IS NOT NULL THEN 1 ELSE 0 END AS enrolled
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.user_id = %s
    '''
    if where_clauses:
        query += ' WHERE ' + ' AND '.join(where_clauses)

    conn = get_db()
    rows = conn.execute(query, tuple(params)).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d['enrolled'] = bool(d['enrolled'])
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
    try:
        course = conn.execute('SELECT id, title FROM courses WHERE id=?', (course_id,)).fetchone()
        if not course:
            return jsonify({'error': 'Không tìm thấy khóa học'}), 404
        first_lesson = 'Bài 1: ' + dict(course)['title']
        conn.execute("INSERT INTO enrollments ... ON CONFLICT DO NOTHING", ...)
        conn.commit()
    finally:
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
