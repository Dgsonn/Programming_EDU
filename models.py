import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

_DATABASE_URL = os.getenv('DATABASE_URL')


class _CursorWrapper:
    """Bọc psycopg2 RealDictCursor để hoạt động giống sqlite3 cursor."""
    def __init__(self, cursor):
        self._cur = cursor

    def fetchone(self):
        return self._cur.fetchone()

    def fetchall(self):
        return self._cur.fetchall()

    def __iter__(self):
        return iter(self._cur)


class _ConnWrapper:
    """Bọc psycopg2 connection để expose API conn.execute() giống sqlite3."""
    def __init__(self, conn):
        self._conn = conn

    def execute(self, sql, params=()):
        sql = sql.replace('?', '%s')
        cur = self._conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(sql, params)
        return _CursorWrapper(cur)

    def commit(self):
        self._conn.commit()

    def close(self):
        self._conn.close()


def get_db():
    if not _DATABASE_URL:
        raise RuntimeError('DATABASE_URL chưa được cấu hình trong .env')
    return _ConnWrapper(psycopg2.connect(_DATABASE_URL))


def init_db():
    if not _DATABASE_URL:
        raise RuntimeError('DATABASE_URL chưa được cấu hình trong .env')
    conn = psycopg2.connect(_DATABASE_URL)
    c = conn.cursor()

    # Acquire advisory lock to prevent concurrent init_db() runs
    c.execute('SELECT pg_advisory_lock(123456789)')

    try:
        c.execute('''CREATE TABLE IF NOT EXISTS users (
            id                      SERIAL PRIMARY KEY,
            name                    TEXT,
            email                   TEXT UNIQUE,
            phone                   TEXT    DEFAULT '',
            birthday                TEXT    DEFAULT '',
            role                    TEXT    DEFAULT 'Học viên',
            password                TEXT,
            streak                  INTEGER DEFAULT 0,
            certificates            INTEGER DEFAULT 0,
            gems                    INTEGER DEFAULT 0,
            xp                      INTEGER DEFAULT 0,
            questionnaire_completed INTEGER DEFAULT 0
        )''')

        try:
            c.execute('ALTER TABLE users ALTER COLUMN password TYPE VARCHAR(512)')
        except Exception:
            conn.rollback()
            
            

        for col, definition in (
            ('gems',                    'INTEGER DEFAULT 0'),
            ('xp',                      'INTEGER DEFAULT 0'),
            ('questionnaire_completed', 'INTEGER DEFAULT 0'),
        ):
            try:
                c.execute(f'ALTER TABLE users ADD COLUMN IF NOT EXISTS {col} {definition}')
            except Exception:
                conn.rollback()
               

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

        c.execute('''CREATE TABLE IF NOT EXISTS roadmap_progress (
            user_id INTEGER,
            item_id TEXT,
            done    INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, item_id)
        )''')

        c.execute('''CREATE TABLE IF NOT EXISTS surveys (
            id         SERIAL PRIMARY KEY,
            user_id    INTEGER,
            data_json  TEXT,
            created_at TEXT
        )''')

        c.execute('SELECT 1 FROM courses LIMIT 1')
        if not c.fetchone():
            courses_seed = [
                ('cpp',     'C / C++',    'Lập trình hệ thống',
                 'Học lập trình từ nền tảng với C/C++, hiểu bộ nhớ, con trỏ và cấu trúc dữ liệu.',
                 'static/images/cpp.svg',     'Cơ bản → Nâng cao',    '40 giờ', '12.4K', 4.8,  85, '#4A9EE0', '#2D7FC1', 'HỆ THỐNG & NHÚNG'),
                ('python',  'Python',     'Đa năng & AI',
                 'Làm chủ Python để xây dựng web, phân tích dữ liệu, AI/ML và tự động hóa.',
                 'static/images/python.svg',  'Mọi cấp độ',            '55 giờ', '28.7K', 4.9, 120, '#E84545', '#C83232', 'AI & DATA SCIENCE'),
                ('java',    'Java',       'Backend & Enterprise',
                 'Xây dựng ứng dụng doanh nghiệp với Java OOP, Spring Boot và microservices.',
                 'static/images/java.svg',    'Trung cấp',             '60 giờ', '18.2K', 4.7, 110, '#4A9EE0', '#E84545', 'BACKEND & ENTERPRISE'),
                ('htmlcss', 'HTML / CSS', 'Nền tảng Web',
                 'Tạo giao diện web đẹp, responsive với HTML5 hiện đại và CSS3 nâng cao.',
                 'static/images/htmlcss.svg', 'Người mới bắt đầu',    '30 giờ', '35.1K', 4.9,  70, '#E84545', '#4A9EE0', 'WEB DEVELOPMENT'),
            ]
            c.executemany(
                'INSERT INTO courses VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
                courses_seed
            )

        conn.commit()
    finally:
        c.execute('SELECT pg_advisory_unlock(123456789)')
        conn.close()

    print('[DB] NeonDB initialized')
