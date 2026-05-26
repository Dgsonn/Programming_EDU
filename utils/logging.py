"""
utils/logging.py
----------------
Cấu hình logging tập trung cho ứng dụng:
  - RotatingFileHandler ghi JSON vào logs/app.log
  - Mỗi bản ghi JSON gồm: timestamp, level, logger, request_id, message, ...extra
  - Middleware gắn request_id (UUID) vào Flask g + response header X-Request-ID
  - Helper log_5xx() ghi ERROR kèm full stack trace + request_id
"""

import json
import logging
import os
import traceback
import uuid
from logging.handlers import RotatingFileHandler

from flask import g, request

# ---------------------------------------------------------------------------
# Hằng số
# ---------------------------------------------------------------------------
LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "logs")
LOG_FILE = os.path.join(LOG_DIR, "app.log")
LOG_MAX_BYTES = 10 * 1024 * 1024   # 10 MB mỗi file
LOG_BACKUP_COUNT = 5                # giữ tối đa 5 file xoay vòng


# ---------------------------------------------------------------------------
# JSON Formatter
# ---------------------------------------------------------------------------
class JsonFormatter(logging.Formatter):
    """Chuyển mọi LogRecord thành một dòng JSON."""

    def format(self, record: logging.LogRecord) -> str:
        # Lấy request_id từ Flask g nếu đang trong request context
        try:
            request_id = g.get("request_id", "-")
        except RuntimeError:
            # Ngoài request context (startup, CLI…)
            request_id = "-"

        payload: dict = {
            "timestamp": self.formatTime(record, self.datefmt or "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "request_id": request_id,
            "message": record.getMessage(),
        }

        # Đính kèm stack trace nếu có exception
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)

        # Đính kèm stack_trace nếu được truyền qua extra={"stack_trace": ...}
        if hasattr(record, "stack_trace"):
            payload["stack_trace"] = record.stack_trace  # type: ignore[attr-defined]

        # Bất kỳ trường extra nào khác
        for key, val in record.__dict__.items():
            if key not in {
                "args", "asctime", "created", "exc_info", "exc_text",
                "filename", "funcName", "id", "levelname", "levelno",
                "lineno", "module", "msecs", "message", "msg", "name",
                "pathname", "process", "processName", "relativeCreated",
                "stack_info", "stack_trace", "thread", "threadName",
            } and not key.startswith("_"):
                payload[key] = val

        return json.dumps(payload, ensure_ascii=False)


# ---------------------------------------------------------------------------
# Thiết lập handler & logger gốc
# ---------------------------------------------------------------------------
def setup_logging(app) -> None:
    """
    Gọi một lần trong factory/app.py sau khi tạo Flask app.

    Thêm RotatingFileHandler ghi JSON vào logs/app.log.
    Level ghi file: DEBUG khi DEBUG=True, ngược lại INFO.
    """
    os.makedirs(LOG_DIR, exist_ok=True)

    file_handler = RotatingFileHandler(
        LOG_FILE,
        maxBytes=LOG_MAX_BYTES,
        backupCount=LOG_BACKUP_COUNT,
        encoding="utf-8",
    )
    file_handler.setFormatter(JsonFormatter())
    file_handler.setLevel(logging.DEBUG if app.debug else logging.INFO)

    # Gắn vào root logger để bắt tất cả (kể cả werkzeug, sqlalchemy…)
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG if app.debug else logging.INFO)

    # Tránh thêm trùng handler khi app reload (Flask debug mode)
    if not any(isinstance(h, RotatingFileHandler) for h in root_logger.handlers):
        root_logger.addHandler(file_handler)

    app.logger.info("Logging khởi tạo xong — ghi vào %s", LOG_FILE)


# ---------------------------------------------------------------------------
# Middleware: gắn request_id
# ---------------------------------------------------------------------------
def init_request_id(app) -> None:
    """
    Đăng ký before/after request hooks để:
      - Sinh UUID request_id và lưu vào Flask g
      - Trả về header X-Request-ID trong mọi response
    """

    @app.before_request
    def _assign_request_id():
        g.request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())

    @app.after_request
    def _attach_request_id_header(response):
        try:
            response.headers["X-Request-ID"] = g.get("request_id", "-")
        except RuntimeError:
            pass
        return response


# ---------------------------------------------------------------------------
# Helper: log 5xx kèm stack trace
# ---------------------------------------------------------------------------
def log_5xx(logger: logging.Logger, exc: BaseException | None = None, message: str = "Server Error") -> None:
    """
    Ghi một bản ghi ERROR kèm:
      - message mô tả lỗi
      - stack_trace đầy đủ (nếu có exception)
      - request info: method, path
      - request_id từ Flask g
    """
    extra: dict = {}

    try:
        extra["http_method"] = request.method
        extra["path"] = request.path
        extra["remote_addr"] = request.remote_addr
    except RuntimeError:
        pass  # Ngoài request context

    if exc is not None:
        extra["stack_trace"] = traceback.format_exc()
        logger.error(message, exc_info=exc, extra=extra)
    else:
        extra["stack_trace"] = traceback.format_stack()
        logger.error(message, extra=extra)
