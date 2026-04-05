from flask import Flask
from flask_cors import CORS
from config import Config
from models import init_db
from routes import register_blueprints

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

register_blueprints(app)

if __name__ == '__main__':
    init_db()
    app.run(debug=Config.DEBUG, port=Config.PORT)
