import os

class Config:
    DB_PATH    = os.path.join(os.path.dirname(__file__), 'database', 'edu.db')
    SECRET_KEY = 'edu-secret-key-change-in-production'
    DEBUG      = True
    PORT       = 5000
