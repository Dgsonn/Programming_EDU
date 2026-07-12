from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from db import get_db
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
        WHERE e.user_id = %s
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


@courses_bp.route('/api/courses-enrolled', methods=['GET'])
@api_login_required
def get_courses_and_enrolled():
    """Trả về courses + enrolled detail trong 1 query, 1 request."""
    uid   = current_user_id()
    icons = {'cpp': '📘', 'htmlcss': '📗', 'python': '📙', 'java': '📕'}
    conn  = get_db()

    rows = conn.execute('''
        SELECT c.id, c.title, c.subtitle, c.description, c.image, c.level,
               c.duration, c.students, c.rating, c.lessons,
               c.color, c.accent_color, c.tag,
               CASE WHEN e.course_id IS NOT NULL THEN 1 ELSE 0 END AS enrolled,
               e.progress, e.completed_lessons,
               e.time_spent, e.last_lesson, e.next_lesson
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.user_id = %s
    ''', (uid,)).fetchall()
    conn.close()

    courses_list  = []
    enrolled_list = []
    for r in rows:
        d = dict(r)
        enrolled     = bool(d['enrolled'])
        accent_color = d.pop('accent_color')
        d['enrolled']    = enrolled
        d['accentColor'] = accent_color
        courses_list.append(d)
        if enrolled:
            enrolled_list.append({
                'id':               d['id'],
                'title':            d['title'],
                'subtitle':         d['subtitle'],
                'color':            d['color'],
                'accentColor':      accent_color,
                'progress':         d['progress']          or 0,
                'completedLessons': d['completed_lessons'] or 0,
                'totalLessons':     d['lessons'],
                'duration':         d['duration'],
                'timeSpent':        d['time_spent']  or '0h',
                'lastLesson':       d['last_lesson'] or '',
                'nextLesson':       d['next_lesson'] or '',
                'icon':             icons.get(d['id'], '📘'),
            })

    return jsonify({'courses': courses_list, 'enrolled': enrolled_list})


@courses_bp.route('/api/courses/<course_id>/enroll', methods=['POST'])
@api_login_required
def enroll(course_id):
    uid    = current_user_id()
    conn   = get_db()
    try:
        course = conn.execute('SELECT id, title FROM courses WHERE id=%s', (course_id,)).fetchone()
        if not course:
            return jsonify({'error': 'Không tìm thấy khóa học'}), 404
        first_lesson = 'Bài 1: ' + dict(course)['title']
        conn.execute(
            '''INSERT INTO enrollments (user_id, course_id, progress, completed_lessons,
                                       time_spent, last_lesson, next_lesson)
               VALUES (%s, %s, 0, 0, '0h', '', %s)
               ON CONFLICT (user_id, course_id) DO NOTHING''',
            (uid, course_id, first_lesson)
        )
        # Re-enroll sau khi unenroll: lesson_progress (nguồn thật) vẫn giữ tiến độ
        # cũ — tính lại cache để dashboard không hiển thị 0% sai.
        done_row = conn.execute(
            '''SELECT COUNT(*) AS n,
                      COALESCE(SUM(COALESCE(l.estimated_minutes, 15)), 0) AS minutes
               FROM lesson_progress lp
               JOIN lessons l ON l.id = lp.lesson_id
               WHERE lp.user_id=%s AND lp.course_id=%s AND lp.status='completed' ''',
            (uid, course_id)
        ).fetchone()
        if done_row['n']:
            total = conn.execute(
                'SELECT lessons FROM courses WHERE id=%s', (course_id,)
            ).fetchone()['lessons'] or 0
            done     = done_row['n']
            progress = min(100, round(done * 100 / total)) if total else 0
            conn.execute(
                'UPDATE enrollments SET completed_lessons=%s, progress=%s, time_spent=%s '
                'WHERE user_id=%s AND course_id=%s',
                (done, progress, str(round(done_row['minutes'] / 60, 1)) + 'h',
                 uid, course_id)
            )
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True})


@courses_bp.route('/api/courses/<course_id>/enroll', methods=['DELETE'])
@api_login_required
def unenroll(course_id):
    uid  = current_user_id()
    conn = get_db()
    conn.execute('DELETE FROM enrollments WHERE user_id=%s AND course_id=%s', (uid, course_id))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@courses_bp.route('/api/course/rating', methods=['POST'])
@api_login_required
def rate_course():
    uid = current_user_id()
    data = request.get_json(silent=True) or {}
    course_id = data.get('course_id')
    rating = data.get('rating')

    if not course_id:
        return jsonify({'error': 'Thiếu course_id'}), 400

    conn = get_db()
    try:
        course = conn.execute('SELECT id FROM courses WHERE id=%s', (course_id,)).fetchone()
        if not course:
            return jsonify({'error': 'Không tìm thấy khóa học'}), 404

        enrolled = conn.execute(
            'SELECT 1 FROM enrollments WHERE user_id=%s AND course_id=%s',
            (uid, course_id)
        ).fetchone()
        if not enrolled:
            return jsonify({'error': 'Bạn chưa đăng ký khóa học này'}), 403

        if not isinstance(rating, int) or isinstance(rating, bool) or rating < 1 or rating > 5:
            return jsonify({'error': 'Đánh giá phải là số nguyên từ 1 đến 5'}), 400

        conn.execute(
            '''INSERT INTO course_ratings (user_id, course_id, rating, created_at)
               VALUES (%s, %s, %s, %s)
               ON CONFLICT (user_id, course_id)
               DO UPDATE SET rating = EXCLUDED.rating, created_at = EXCLUDED.created_at''',
            (uid, course_id, rating, datetime.now(timezone.utc).isoformat())
        )
        conn.commit()
    finally:
        conn.close()

    return jsonify({'ok': True})


@courses_bp.route('/api/course/<course_id>/rating', methods=['GET'])
@api_login_required
def get_course_rating(course_id):
    conn = get_db()
    course = conn.execute('SELECT id FROM courses WHERE id=%s', (course_id,)).fetchone()
    if not course:
        conn.close()
        return jsonify({'error': 'Không tìm thấy khóa học'}), 404

    row = conn.execute(
        'SELECT AVG(rating) AS avg_rating, COUNT(*) AS rating_count '
        'FROM course_ratings WHERE course_id=%s',
        (course_id,)
    ).fetchone()
    conn.close()

    avg_raw = row['avg_rating']
    average = round(float(avg_raw), 1) if avg_raw is not None else None
    return jsonify({'average': average, 'count': row['rating_count']})




def _calc_progress(sub_skills):
    if not sub_skills:
        return 0
    done = sum(1 for s in sub_skills if s['done'])
    return round(done * 100 / len(sub_skills))


# Icon hiển thị cho skill set theo course (trang Kỹ năng)
_SKILL_SET_ICONS = {'db_design': '🏗️', 'db_design_tc': '🌐', 'db_design_nc': '⚙️'}


@courses_bp.route('/api/skills', methods=['GET'])
@api_login_required
def get_skills():
    """Kỹ năng THẬT gắn với user (2026-07-09, thay _MOCK_SKILLS):
    skill set = khóa học · skill = module · sub_skill = bài học.
    'done' đọc từ lesson_progress của chính user (JOIN theo user_id) —
    metadata bài/module seed sẵn trong bảng lessons (db/lessons_seed.py)."""
    uid = current_user_id()
    conn = get_db()
    try:
        rows = conn.execute(
            '''SELECT l.course_id, l.module, l.title, l.sort_order,
                      c.title AS course_title,
                      (lp.status = 'completed') AS done
               FROM lessons l
               JOIN courses c ON c.id = l.course_id
               LEFT JOIN lesson_progress lp
                      ON lp.lesson_id = l.id AND lp.user_id = %s
               WHERE l.module <> '' AND l.module IS NOT NULL
               ORDER BY l.course_id, l.sort_order''',
            (uid,)
        ).fetchall()
    finally:
        conn.close()

    # Gom course → module → bài (dict giữ thứ tự insert = sort_order)
    sets = {}
    for r in rows:
        cid = r['course_id']
        st = sets.setdefault(cid, {
            'id': cid,
            'title': r['course_title'],
            'icon': _SKILL_SET_ICONS.get(cid, '📘'),
            '_modules': {},
        })
        st['_modules'].setdefault(r['module'], []).append(
            {'title': 'Bài ' + str(r['sort_order']) + ': ' + r['title'], 'done': bool(r['done'])}
        )

    result = []
    for st in sets.values():
        skills_out = []
        for m_idx, (m_title, subs) in enumerate(st['_modules'].items(), 1):
            skills_out.append({
                'id': st['id'] + '-m' + str(m_idx),
                'title': m_title,
                'progress': _calc_progress(subs),
                'sub_skills': subs,
            })
        total_subs = sum(len(sk['sub_skills']) for sk in skills_out)
        done_subs  = sum(s['done'] for sk in skills_out for s in sk['sub_skills'])
        result.append({
            'id': st['id'],
            'title': st['title'],
            'icon': st['icon'],
            'progress': round(done_subs * 100 / total_subs) if total_subs else 0,
            'skills': skills_out,
        })
    # Cơ bản → Trung cấp → Nâng cao
    order = {'db_design': 0, 'db_design_tc': 1, 'db_design_nc': 2}
    result.sort(key=lambda s: order.get(s['id'], 99))
    return jsonify({'skill_sets': result})
