import os

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    # Đường dẫn DB
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'codemaster.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Secret Key
    SECRET_KEY = 'super_secret_key_2026'