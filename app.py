import logging

from flask import Flask, g, jsonify, request
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect

from config import Config, ALLOWED_ORIGINS
from extensions import limiter
from models import init_db
from routes import register_blueprints
from routes.auth import auth_bp
from utils.logging import init_request_id, log_5xx, setup_logging

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

# ── Logging & request-id ───────────────────────────────────────────────────
setup_logging(app)
init_request_id(app)

# ── Blueprints ─────────────────────────────────────────────────────────────
register_blueprints(app)
csrf.exempt(auth_bp)
init_db()

# ── Logger dùng trong module này ───────────────────────────────────────────
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helper: tạo JSON error response nhất quán
# ---------------------------------------------------------------------------
def _error_response(status: int, message: str, detail: str | None = None):
    payload = {
        "error": {
            "status": status,
            "message": message,
        }
    }
    if detail:
        payload["error"]["detail"] = detail

    try:
        payload["request_id"] = g.get("request_id", "-")
    except RuntimeError:
        payload["request_id"] = "-"

    return jsonify(payload), status


# ---------------------------------------------------------------------------
# Error handlers
# ---------------------------------------------------------------------------

@app.errorhandler(400)
def bad_request(e):
    return _error_response(400, "Yêu cầu không hợp lệ", str(e.description) if hasattr(e, "description") else None)


@app.errorhandler(401)
def unauthorized(e):
    return _error_response(401, "Chưa xác thực — vui lòng đăng nhập")


@app.errorhandler(403)
def forbidden(e):
    return _error_response(403, "Không có quyền truy cập tài nguyên này")


@app.errorhandler(404)
def not_found(e):
    return _error_response(404, "Không tìm thấy tài nguyên", request.path)


@app.errorhandler(429)
def ratelimit_handler(e):
    return _error_response(429, "Quá nhiều yêu cầu — vui lòng thử lại sau", str(e.description) if hasattr(e, "description") else None)


@app.errorhandler(500)
def internal_error(e):
    log_5xx(logger, exc=e, message="HTTP 500 Internal Server Error")
    return _error_response(500, "Lỗi máy chủ nội bộ — chúng tôi đang xử lý")


@app.errorhandler(Exception)
def unhandled_exception(e):
    """Bắt mọi exception chưa được xử lý, log kèm stack trace rồi trả 500."""
    log_5xx(logger, exc=e, message=f"Unhandled exception: {type(e).__name__}")
    return _error_response(500, "Lỗi không xác định — vui lòng thử lại sau")


if __name__ == "__main__":
    app.run(debug=Config.DEBUG, port=Config.PORT)
