import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'edu-secret-key-change-in-production')
    DEBUG      = True
    PORT       = 5000
