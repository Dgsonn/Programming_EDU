import sqlite3
from config import Config


def get_db():
    conn = sqlite3.connect(Config.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id           INTEGER PRIMARY KEY,
        name         TEXT,
        email        TEXT,
        phone        TEXT,
        birthday     TEXT,
        role         TEXT    DEFAULT 'Học viên',
        password     TEXT    DEFAULT '123456',
        streak       INTEGER DEFAULT 12,
        certificates INTEGER DEFAULT 1
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

    c.execute('''CREATE TABLE IF NOT EXISTS notifications (
        user_id        INTEGER PRIMARY KEY,
        email_notif    INTEGER DEFAULT 1,
        push_notif     INTEGER DEFAULT 0,
        study_remind   INTEGER DEFAULT 1,
        content_update INTEGER DEFAULT 0
    )''')

    if not c.execute('SELECT 1 FROM users').fetchone():
        c.execute(
            "INSERT INTO users VALUES (1,'Cao Văn Nhân','caovannhan@email.com','0901 234 567','27/08/2000','Học viên','123456',12,1)"
        )

    if not c.execute('SELECT 1 FROM notifications').fetchone():
        c.execute("INSERT INTO notifications VALUES (1,1,0,1,0)")

    if not c.execute('SELECT 1 FROM courses').fetchone():
        courses_seed = [
            ('cpp',     'C / C++',    'Lập trình hệ thống',
             'Học lập trình từ nền tảng với C/C++, hiểu bộ nhớ, con trỏ và cấu trúc dữ liệu.',
             'static/images/cpp.svg',     'Cơ bản → Nâng cao',   '40 giờ', '12.4K', 4.8,  85, '#4A9EE0','#2D7FC1','HỆ THỐNG & NHÚNG'),
            ('python',  'Python',     'Đa năng & AI',
             'Làm chủ Python để xây dựng web, phân tích dữ liệu, AI/ML và tự động hóa.',
             'static/images/python.svg',  'Mọi cấp độ',           '55 giờ', '28.7K', 4.9, 120, '#E84545','#C83232','AI & DATA SCIENCE'),
            ('java',    'Java',       'Backend & Enterprise',
             'Xây dựng ứng dụng doanh nghiệp với Java OOP, Spring Boot và microservices.',
             'static/images/java.svg',    'Trung cấp',            '60 giờ', '18.2K', 4.7, 110, '#4A9EE0','#E84545','BACKEND & ENTERPRISE'),
            ('htmlcss', 'HTML / CSS', 'Nền tảng Web',
             'Tạo giao diện web đẹp, responsive với HTML5 hiện đại và CSS3 nâng cao.',
             'static/images/htmlcss.svg', 'Người mới bắt đầu',   '30 giờ', '35.1K', 4.9,  70, '#E84545','#4A9EE0','WEB DEVELOPMENT'),
        ]
        c.executemany('INSERT INTO courses VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', courses_seed)

        enrollments_seed = [
            (1, 'cpp',     42, 36, '16.8h', 'Bài 36: Con trỏ và cấu trúc', 'Bài 37: Hàm đệ quy'),
            (1, 'htmlcss', 15, 10,  '4.5h', 'Bài 10: CSS Flexbox',          'Bài 11: CSS Grid'),
        ]
        c.executemany('INSERT INTO enrollments VALUES (?,?,?,?,?,?,?)', enrollments_seed)

    conn.commit()
    conn.close()
