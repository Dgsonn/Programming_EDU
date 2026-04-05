from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'edu.db')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id       INTEGER PRIMARY KEY,
        name     TEXT,
        email    TEXT,
        phone    TEXT,
        birthday TEXT,
        role     TEXT DEFAULT 'Học viên'
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS courses (
        id           TEXT PRIMARY KEY,
        title        TEXT,
        subtitle     TEXT,
        description  TEXT,
        image        TEXT,
        level        TEXT,
        duration     TEXT,
        students     TEXT,
        rating       REAL,
        lessons      INTEGER,
        color        TEXT,
        accent_color TEXT,
        tag          TEXT
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS enrollments (
        user_id           INTEGER,
        course_id         TEXT,
        progress          INTEGER DEFAULT 0,
        completed_lessons INTEGER DEFAULT 0,
        time_spent        TEXT    DEFAULT '0h',
        last_lesson       TEXT    DEFAULT '',
        next_lesson       TEXT    DEFAULT '',
        PRIMARY KEY (user_id, course_id)
    )''')

    # Seed nếu chưa có dữ liệu
    if not c.execute('SELECT 1 FROM users').fetchone():
        c.execute(
            "INSERT INTO users VALUES (1,'Cao Văn Nhân','caovannhan@email.com','0901 234 567','27/08/2000','Học viên')"
        )

    if not c.execute('SELECT 1 FROM courses').fetchone():
        courses_seed = [
            ('cpp',     'C / C++',    'Lập trình hệ thống',
             'Học lập trình từ nền tảng với C/C++, hiểu bộ nhớ, con trỏ và cấu trúc dữ liệu.',
             'images/cpp.svg',     'Cơ bản → Nâng cao',   '40 giờ', '12.4K', 4.8,  85, '#4A9EE0','#2D7FC1','HỆ THỐNG & NHÚNG'),
            ('python',  'Python',     'Đa năng & AI',
             'Làm chủ Python để xây dựng web, phân tích dữ liệu, AI/ML và tự động hóa.',
             'images/python.svg',  'Mọi cấp độ',           '55 giờ', '28.7K', 4.9, 120, '#E84545','#C83232','AI & DATA SCIENCE'),
            ('java',    'Java',       'Backend & Enterprise',
             'Xây dựng ứng dụng doanh nghiệp với Java OOP, Spring Boot và microservices.',
             'images/java.svg',    'Trung cấp',            '60 giờ', '18.2K', 4.7, 110, '#4A9EE0','#E84545','BACKEND & ENTERPRISE'),
            ('htmlcss', 'HTML / CSS', 'Nền tảng Web',
             'Tạo giao diện web đẹp, responsive với HTML5 hiện đại và CSS3 nâng cao.',
             'images/htmlcss.svg', 'Người mới bắt đầu',   '30 giờ', '35.1K', 4.9,  70, '#E84545','#4A9EE0','WEB DEVELOPMENT'),
        ]
        c.executemany('INSERT INTO courses VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', courses_seed)

        enrollments_seed = [
            (1, 'cpp',     42, 36, '16.8h', 'Bài 36: Con trỏ và cấu trúc', 'Bài 37: Hàm đệ quy'),
            (1, 'htmlcss', 15, 10,  '4.5h', 'Bài 10: CSS Flexbox',          'Bài 11: CSS Grid'),
        ]
        c.executemany('INSERT INTO enrollments VALUES (?,?,?,?,?,?,?)', enrollments_seed)

    conn.commit()
    conn.close()


# ── User ────────────────────────────────────────────────────────────────────

@app.route('/api/user', methods=['GET'])
def get_user():
    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE id = 1').fetchone()
    conn.close()
    return jsonify(dict(user))


@app.route('/api/user', methods=['PUT'])
def update_user():
    data = request.get_json()
    conn = get_db()
    conn.execute(
        'UPDATE users SET name=?, email=?, phone=?, birthday=? WHERE id=1',
        (data.get('name'), data.get('email'), data.get('phone'), data.get('birthday'))
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# ── Courses ──────────────────────────────────────────────────────────────────

@app.route('/api/courses', methods=['GET'])
def get_courses():
    conn = get_db()
    rows = conn.execute('''
        SELECT c.*,
               CASE WHEN e.course_id IS NOT NULL THEN 1 ELSE 0 END AS enrolled
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.user_id = 1
    ''').fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d['enrolled']    = bool(d['enrolled'])
        d['accentColor'] = d.pop('accent_color')
        result.append(d)
    return jsonify(result)


@app.route('/api/enrolled', methods=['GET'])
def get_enrolled():
    icons = {'cpp': '📘', 'htmlcss': '📗', 'python': '📙', 'java': '📕'}
    conn  = get_db()
    rows  = conn.execute('''
        SELECT c.id, c.title, c.subtitle, c.color, c.accent_color,
               e.progress, e.completed_lessons,
               c.lessons AS total_lessons, c.duration,
               e.time_spent, e.last_lesson, e.next_lesson
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = 1
    ''').fetchall()
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


@app.route('/api/courses/<course_id>/enroll', methods=['POST'])
def enroll(course_id):
    conn   = get_db()
    course = conn.execute('SELECT id, title FROM courses WHERE id=?', (course_id,)).fetchone()
    if not course:
        conn.close()
        return jsonify({'error': 'Không tìm thấy khóa học'}), 404
    exists = conn.execute(
        'SELECT 1 FROM enrollments WHERE user_id=1 AND course_id=?', (course_id,)
    ).fetchone()
    if not exists:
        first_lesson = 'Bài 1: ' + dict(course)['title']
        conn.execute(
            'INSERT INTO enrollments VALUES (1,?,0,0,"0h","",?)',
            (course_id, first_lesson)
        )
        conn.commit()
    conn.close()
    return jsonify({'ok': True})


@app.route('/api/courses/<course_id>/enroll', methods=['DELETE'])
def unenroll(course_id):
    conn = get_db()
    conn.execute('DELETE FROM enrollments WHERE user_id=1 AND course_id=?', (course_id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# ── Stats ────────────────────────────────────────────────────────────────────

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn  = get_db()
    count = conn.execute(
        'SELECT COUNT(*) AS n FROM enrollments WHERE user_id=1'
    ).fetchone()['n']
    rows  = conn.execute(
        'SELECT progress, time_spent FROM enrollments WHERE user_id=1'
    ).fetchall()
    conn.close()
    avg_progress = round(sum(r['progress'] for r in rows) / len(rows)) if rows else 0
    total_hours  = sum(float(r['time_spent'].replace('h','')) for r in rows)
    return jsonify({
        'enrolledCount': count,
        'avgProgress':   avg_progress,
        'totalHours':    str(round(total_hours, 1)) + 'h'
    })


if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)