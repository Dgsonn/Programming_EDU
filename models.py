import os
import psycopg2
import psycopg2.extras
from contextlib import contextmanager
from dotenv import load_dotenv
from psycopg2.pool import ThreadedConnectionPool

load_dotenv()

_DATABASE_URL = os.getenv('DATABASE_URL')
_pool = None


def _get_pool():
    """Lazy-init và trả về ThreadedConnectionPool."""
    global _pool
    if _pool is None:
        if not _DATABASE_URL:
            raise RuntimeError('DATABASE_URL chưa được cấu hình trong .env')
        _pool = ThreadedConnectionPool(minconn=2, maxconn=10, dsn=_DATABASE_URL)
    return _pool


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
        _get_pool().putconn(self._conn)


def get_db():
    """Backward-compatible: trả về _ConnWrapper, close() sẽ trả conn về pool."""
    return _ConnWrapper(_get_pool().getconn())


@contextmanager
def get_db_connection():
    """Context manager trả về raw psycopg2 connection từ pool."""
    pool = _get_pool()
    conn = pool.getconn()
    try:
        yield conn
    finally:
        pool.putconn(conn)


@contextmanager
def get_db_cursor(commit=False):
    """Context manager trả về RealDictCursor. Cursor luôn close trong finally."""
    with get_db_connection() as conn:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        try:
            yield cur
            if commit:
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            cur.close()


def init_db():
    pool = _get_pool()
    conn = pool.getconn()
    c = conn.cursor()

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
                 'static/images/cpp.svg',     'Phù hợp người mới',    '40 giờ', '12.4K', 4.8,  85, '#4A9EE0', '#2D7FC1', 'HỆ THỐNG & NHÚNG'),
                ('python',  'Python',     'Đa năng & AI',
                 'Làm chủ Python để xây dựng web, phân tích dữ liệu, AI/ML và tự động hóa.',
                 'static/images/python.svg',  'Phù hợp người mới',    '55 giờ', '28.7K', 4.9, 120, '#E84545', '#C83232', 'AI & DATA SCIENCE'),
                ('java',    'Java',       'Backend & Enterprise',
                 'Xây dựng ứng dụng doanh nghiệp với Java OOP, Spring Boot và microservices.',
                 'static/images/java.svg',    'Trung cấp',             '60 giờ', '18.2K', 4.7, 110, '#4A9EE0', '#E84545', 'BACKEND & ENTERPRISE'),
                ('htmlcss', 'HTML / CSS', 'Nền tảng Web',
                 'Tạo giao diện web đẹp, responsive với HTML5 hiện đại và CSS3 nâng cao.',
                 'static/images/htmlcss.svg', 'Phù hợp người mới',    '30 giờ', '35.1K', 4.9,  70, '#E84545', '#4A9EE0', 'WEB DEVELOPMENT'),
            ]
            c.executemany(
                'INSERT INTO courses VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
                courses_seed
            )

        c.execute("""
            UPDATE courses
            SET level = 'Phù hợp người mới'
            WHERE level ILIKE '%mọi cấp độ%'
               OR level ILIKE '%người mới%'
               OR level ILIKE '%cơ bản → nâng cao%'
               OR level ILIKE '%cơ bản -> nâng cao%'
               OR level ILIKE '%cơ bản%nâng cao%'
               OR level ILIKE '%Cơ bản%Nâng cao%'
               OR level ILIKE '%Cơ bản% → Nâng cao%'
               OR level ILIKE '%Cơ bản%–%Nâng cao%'
               OR level ILIKE '%Cơ bản%->%Nâng cao%'
        """)

        c.execute("""
            UPDATE courses SET level = 'Cơ bản'
            WHERE level ILIKE '%cơ bản%'
              AND level NOT ILIKE '%mọi cấp độ%'
              AND level NOT ILIKE '%người mới%'
        """)

        c.execute("""
            UPDATE courses SET level = 'Nâng cao'
            WHERE level ILIKE '%nâng cao%'
              AND level NOT ILIKE '%mọi cấp độ%'
        """)

        c.execute("""
            UPDATE courses SET level = 'Trung cấp'
            WHERE level ILIKE '%trung cấp%'
              AND level NOT ILIKE '%mọi cấp độ%'
        """)

        conn.commit()

    finally:
        c.execute('SELECT pg_advisory_unlock(123456789)')
        c.close()
        _get_pool().putconn(conn)

    print('[DB] NeonDB initialized (levels normalized)')