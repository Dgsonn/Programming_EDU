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


_MOCK_SKILLS = [
    {
        'id': 'python-core', 'title': 'Python Core', 'icon': '🐍',
        'skills': [
            {
                'id': 'py-syntax', 'title': 'Cú pháp cơ bản',
                'sub_skills': [
                    {'title': 'Biến và kiểu dữ liệu', 'done': True},
                    {'title': 'Toán tử và biểu thức', 'done': True},
                    {'title': 'Chuỗi (string)', 'done': True},
                    {'title': 'List, Tuple, Dict, Set', 'done': True},
                ],
            },
            {
                'id': 'py-control', 'title': 'Cấu trúc điều khiển',
                'sub_skills': [
                    {'title': 'if / elif / else', 'done': True},
                    {'title': 'Vòng lặp for & while', 'done': True},
                    {'title': 'break / continue', 'done': False},
                    {'title': 'List comprehension', 'done': False},
                ],
            },
            {
                'id': 'py-func', 'title': 'Hàm & Module',
                'sub_skills': [
                    {'title': 'Định nghĩa và gọi hàm', 'done': True},
                    {'title': '*args / **kwargs', 'done': False},
                    {'title': 'Lambda & decorator', 'done': False},
                    {'title': 'Import module', 'done': False},
                ],
            },
            {
                'id': 'py-oop', 'title': 'Lập trình hướng đối tượng',
                'sub_skills': [
                    {'title': 'Class & Object', 'done': False},
                    {'title': 'Kế thừa (inheritance)', 'done': False},
                    {'title': 'Đa hình (polymorphism)', 'done': False},
                    {'title': 'Dunder methods', 'done': False},
                ],
            },
        ],
    },
    {
        'id': 'web-dev', 'title': 'Phát triển Web', 'icon': '🌐',
        'skills': [
            {
                'id': 'html5', 'title': 'HTML5',
                'sub_skills': [
                    {'title': 'Cấu trúc tài liệu HTML', 'done': True},
                    {'title': 'Thẻ semantic', 'done': True},
                    {'title': 'Form & input', 'done': True},
                    {'title': 'Web Accessibility', 'done': False},
                ],
            },
            {
                'id': 'css3', 'title': 'CSS3',
                'sub_skills': [
                    {'title': 'Box model & selectors', 'done': True},
                    {'title': 'Flexbox', 'done': True},
                    {'title': 'CSS Grid', 'done': True},
                    {'title': 'Animation & transition', 'done': False},
                ],
            },
            {
                'id': 'responsive', 'title': 'Responsive Design',
                'sub_skills': [
                    {'title': 'Media queries', 'done': True},
                    {'title': 'Mobile-first approach', 'done': False},
                    {'title': 'Fluid typography', 'done': False},
                ],
            },
        ],
    },
    {
        'id': 'java-core', 'title': 'Java Core', 'icon': '☕',
        'skills': [
            {
                'id': 'java-basics', 'title': 'Java cơ bản',
                'sub_skills': [
                    {'title': 'Kiểu dữ liệu nguyên thủy', 'done': False},
                    {'title': 'Mảng & chuỗi', 'done': False},
                    {'title': 'Vòng lặp & điều kiện', 'done': False},
                ],
            },
            {
                'id': 'java-oop', 'title': 'OOP với Java',
                'sub_skills': [
                    {'title': 'Class & Interface', 'done': False},
                    {'title': 'Abstract class', 'done': False},
                    {'title': 'Collections Framework', 'done': False},
                ],
            },
        ],
    },
    {
        'id': 'algorithms', 'title': 'Thuật toán & CTDL', 'icon': '⚙️',
        'skills': [
            {
                'id': 'algo-basic', 'title': 'Thuật toán cơ bản',
                'sub_skills': [
                    {'title': 'Sắp xếp (Bubble, Selection, Insertion)', 'done': True},
                    {'title': 'Tìm kiếm nhị phân', 'done': True},
                    {'title': 'Đệ quy', 'done': False},
                    {'title': 'Độ phức tạp Big-O', 'done': False},
                ],
            },
            {
                'id': 'data-struct', 'title': 'Cấu trúc dữ liệu',
                'sub_skills': [
                    {'title': 'Stack & Queue', 'done': True},
                    {'title': 'Linked List', 'done': False},
                    {'title': 'Tree & Graph', 'done': False},
                    {'title': 'Hash Table', 'done': False},
                ],
            },
        ],
    },
]


def _calc_progress(sub_skills):
    if not sub_skills:
        return 0
    done = sum(1 for s in sub_skills if s['done'])
    return round(done * 100 / len(sub_skills))


@courses_bp.route('/api/skills', methods=['GET'])
@api_login_required
def get_skills():
    result = []
    for bk in _MOCK_SKILLS:
        skills_out = []
        for sk in bk['skills']:
            prog = _calc_progress(sk['sub_skills'])
            skills_out.append({
                'id': sk['id'],
                'title': sk['title'],
                'progress': prog,
                'sub_skills': sk['sub_skills'],
            })
        total_subs = sum(len(sk['sub_skills']) for sk in bk['skills'])
        done_subs  = sum(s['done'] for sk in bk['skills'] for s in sk['sub_skills'])
        overall    = round(done_subs * 100 / total_subs) if total_subs else 0
        result.append({
            'id': bk['id'],
            'title': bk['title'],
            'icon': bk['icon'],
            'progress': overall,
            'skills': skills_out,
        })
    return jsonify({'skill_sets': result})
