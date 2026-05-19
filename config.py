import os

class Config:
    DB_PATH    = os.path.join(os.path.dirname(__file__), 'database', 'edu.db')
    FLASK_ENV  = os.environ.get('FLASK_ENV', 'development')
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if FLASK_ENV == 'production' and not SECRET_KEY:
        raise RuntimeError('SECRET_KEY phải được thiết lập trong production')
    if not SECRET_KEY:
        SECRET_KEY = 'edu-secret-key-change-in-production'
    # Read FLASK_DEBUG from environment: '1' enables debug, otherwise disabled.
    DEBUG      = os.environ.get('FLASK_DEBUG', '0') == '1'
    PORT       = 9000