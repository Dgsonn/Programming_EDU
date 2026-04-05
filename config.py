import os

class Config:
    DB_PATH = os.path.join(os.path.dirname(__file__), 'database', 'edu.db')
    DEBUG   = True
    PORT    = 5000
