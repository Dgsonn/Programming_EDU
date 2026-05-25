from flask import Flask, jsonify
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect
from config import Config, ALLOWED_ORIGINS
from models import init_db
from routes import register_blueprints
from routes.auth import auth_bp
from extensions import limiter

app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = Config.SECRET_KEY
CORS(app, resources={
    r"/api/*": {
        "origins": ALLOWED_ORIGINS,
        "supports_credentials": True,
    }
})

csrf = CSRFProtect()
csrf.init_app(app)
limiter.init_app(app)

register_blueprints(app)
csrf.exempt(auth_bp)
init_db()

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({'error': 'Quá nhiều yêu cầu, vui lòng thử lại sau'}), 429

if __name__ == '__main__':
    app.run(debug=Config.DEBUG, port=Config.PORT)
