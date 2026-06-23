import os
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

    def _ensure_connected(self):
        try:
            cur = self._conn.cursor()
            cur.execute("SELECT 1")
            cur.close()
        except Exception:
            try:
                self._conn.close()
            except Exception:
                pass
            _get_pool().putconn(self._conn, close=True)
            self._conn = _get_pool().getconn()

    def execute(self, sql, params=()):
        self._ensure_connected()
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
