import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models import db
from routes.auth import auth_bp
from routes.courses import courses_bp
from routes.progress import progress_bp
from routes.roadmap import roadmap_bp
from routes.user import user_bp

# Thư mục dist/ được build từ `npm run build`
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dist")


def create_app() -> Flask:
    app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path="")
    app.config.from_object(Config)

    # Extensions
    db.init_app(app)
    JWTManager(app)
    # CORS chỉ cần thiết khi chạy dev (frontend port 5173 khác backend port 5000)
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    # Blueprints
    app.register_blueprint(auth_bp,     url_prefix="/api/auth")
    app.register_blueprint(courses_bp,  url_prefix="/api/courses")
    app.register_blueprint(progress_bp, url_prefix="/api/progress")
    app.register_blueprint(roadmap_bp,  url_prefix="/api/roadmap")
    app.register_blueprint(user_bp,     url_prefix="/api/user")

    # Serve React app (production) — mọi route không phải /api/* đều trả về index.html
    if os.path.isdir(FRONTEND_DIST):
        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve_frontend(path: str):
            file_path = os.path.join(FRONTEND_DIST, path)
            if path and os.path.isfile(file_path):
                return send_from_directory(FRONTEND_DIST, path)
            return send_from_directory(FRONTEND_DIST, "index.html")

    # Tạo bảng nếu chưa tồn tại
    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
