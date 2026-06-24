import os
import threading
import psycopg2
import psycopg2.extras
from contextlib import contextmanager
from dotenv import load_dotenv
from psycopg2.pool import ThreadedConnectionPool

from config import DATABASE_URL

# Phòng vệ: nếu module này được import độc lập (không qua app.py/config.py
# đã chạy load_dotenv() trước), đảm bảo .env vẫn được nạp. Idempotent, không hại.
load_dotenv()

_DATABASE_URL = DATABASE_URL or os.getenv('DATABASE_URL')
_pool = None

# TCP keepalive + timeout cho connection tới Neon (Postgres serverless ở xa).
# Giữ link TCP "sống" để Neon proxy / OS không âm thầm drop connection idle,
# và connect_timeout để query không treo vô hạn khi compute đang được đánh thức.
_CONN_KWARGS = dict(
    connect_timeout=10,
    keepalives=1,
    keepalives_idle=30,
    keepalives_interval=10,
    keepalives_count=5,
)


def _get_pool():
    """Lazy-init và trả về ThreadedConnectionPool."""
    global _pool
    if _pool is None:
        if not _DATABASE_URL:
            raise RuntimeError('DATABASE_URL chưa được cấu hình trong .env')
        _pool = ThreadedConnectionPool(
            minconn=2, maxconn=10, dsn=_DATABASE_URL, **_CONN_KWARGS
        )
    return _pool


_keepalive_started = False


def start_keepalive(interval=240):
    """Khởi động 1 luồng nền ping 'SELECT 1' định kỳ để giữ compute Neon
    không tự suspend khi idle — nguyên nhân khiến request đầu sau khi rảnh
    (vd: quay lại từ /admin) mất 5-10s để 'đánh thức' DB.

    Idempotent: gọi nhiều lần chỉ tạo đúng 1 luồng. Tắt bằng DB_KEEPALIVE_PING=0.
    """
    global _keepalive_started
    if _keepalive_started:
        return
    if os.getenv('DB_KEEPALIVE_PING', '1') == '0':
        return
    _keepalive_started = True

    stop = threading.Event()

    def _ping_loop():
        while not stop.wait(interval):
            try:
                conn = _checkout_healthy_conn()
                try:
                    cur = conn.cursor()
                    cur.execute('SELECT 1')
                    cur.close()
                finally:
                    _get_pool().putconn(conn)
            except Exception:
                pass  # nuốt lỗi: ping chỉ để giữ ấm, không được làm crash app

    t = threading.Thread(target=_ping_loop, name='db-keepalive', daemon=True)
    t.start()


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


def _checkout_healthy_conn():
    """Lấy 1 connection còn sống từ pool.

    Neon đóng connection idle *giữa các request*, nên ta health-check (SELECT 1)
    đúng MỘT lần lúc lấy connection ra khỏi pool. KHÔNG check lại trước mỗi query —
    connection không thể chết giữa 2 query cách nhau micro-giây trong cùng request,
    và mỗi SELECT 1 thừa là một round-trip tới DB từ xa (~50-300ms) nhân đôi độ trễ.
    """
    pool = _get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
    except Exception:
        try:
            conn.close()
        except Exception:
            pass
        pool.putconn(conn, close=True)
        conn = pool.getconn()
    return conn


class _ConnWrapper:
    """Bọc psycopg2 connection để expose API conn.execute() giống sqlite3."""
    def __init__(self, conn):
        self._conn = conn

    def execute(self, sql, params=()):
        cur = self._conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(sql, params)
        return _CursorWrapper(cur)

    def commit(self):
        self._conn.commit()

    def close(self):
        _get_pool().putconn(self._conn)

def get_db():
    """Backward-compatible: trả về _ConnWrapper, close() sẽ trả conn về pool.

    Connection được health-check 1 lần lúc checkout (xem _checkout_healthy_conn).
    """
    return _ConnWrapper(_checkout_healthy_conn())


@contextmanager
def get_db_connection():
    """Context manager trả về raw psycopg2 connection từ pool."""
    pool = _get_pool()
    conn = _checkout_healthy_conn()
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
