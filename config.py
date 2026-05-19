import os

class Config:
    DB_PATH    = os.path.join(os.path.dirname(__file__), 'database', 'edu.db')
    SECRET_KEY = 'edu-secret-key-change-in-production'
    # Read FLASK_DEBUG from environment: '1' enables debug, otherwise disabled.
    DEBUG      = os.environ.get('FLASK_DEBUG', '0') == '1'
    PORT       = 9000
