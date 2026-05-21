from flask import Flask
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect
from config import Config, ALLOWED_ORIGINS
from models import init_db
from routes import register_blueprints

app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = Config.SECRET_KEY
CORS(app, resources={
    r"/api/*": {
        "origins": ALLOWED_ORIGINS,
        "supports_credentials": True,
    }
})
CSRFProtect(app)

register_blueprints(app)
init_db()   

if __name__ == '__main__':
    app.run(debug=Config.DEBUG, port=Config.PORT)
