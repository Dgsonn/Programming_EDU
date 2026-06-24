"""
utils package
─────────────
Giữ backward-compatible: mọi import cũ kiểu
    from utils import login_required, api_login_required, current_user_id
vẫn hoạt động bình thường.
"""

from functools import wraps
from flask import session, jsonify, redirect


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return redirect('/login')
        return f(*args, **kwargs)
    return decorated


def api_login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Chưa đăng nhập'}), 401
        return f(*args, **kwargs)
    return decorated


def _is_admin(user_id):
    from db import get_db
    conn = get_db()
    row = conn.execute('SELECT role FROM users WHERE id=%s', (user_id,)).fetchone()
    conn.close()
    return bool(row) and row['role'] == 'admin'


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return redirect('/login')
        if not _is_admin(session['user_id']):
            return redirect('/dashboard')
        return f(*args, **kwargs)
    return decorated


def api_admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Chưa đăng nhập'}), 401
        if not _is_admin(session['user_id']):
            return jsonify({'error': 'Không có quyền truy cập'}), 403
        return f(*args, **kwargs)
    return decorated


def current_user_id():
    return session.get('user_id')
