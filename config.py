import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:9000').split(',')
WTF_CSRF_TIME_LIMIT = 3600
DATABASE_URL = os.environ.get('DATABASE_URL')

class Config:
    DB_PATH    = os.path.join(os.path.dirname(__file__), 'database', 'edu.db')
    FLASK_ENV  = os.environ.get('FLASK_ENV', 'development')
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        # Mavis P0#3 (2026-07-04): không fallback hardcode nữa — dev thiếu SECRET_KEY thì
        # sinh khóa ngẫu nhiên per-process (session mất khi restart — chấp nhận ở dev);
        # production bắt buộc phải set, không có thì chết sớm.
        if FLASK_ENV == 'production':
            raise RuntimeError('SECRET_KEY phải được thiết lập trong production')
        import secrets as _secrets
        SECRET_KEY = _secrets.token_hex(32)
    DEBUG      = os.environ.get('FLASK_DEBUG', '0') == '1'
    SEND_FILE_MAX_AGE_DEFAULT = 0
    PORT       = 9000
    SESSION_COOKIE_SECURE = True if FLASK_ENV == 'production' else False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=8)
    WTF_CSRF_CHECK_DEFAULT     = False
    RATELIMIT_STORAGE_URI      = os.environ.get('REDIS_URL', 'memory://')

    GOOGLE_CLIENT_ID     = os.environ.get('GOOGLE_CLIENT_ID', '')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
    FACEBOOK_CLIENT_ID     = os.environ.get('FACEBOOK_CLIENT_ID', '')
    FACEBOOK_CLIENT_SECRET = os.environ.get('FACEBOOK_CLIENT_SECRET', '')
