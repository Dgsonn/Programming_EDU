import json
from datetime import datetime
from flask import Blueprint, jsonify, request
from models import get_db
from utils import api_login_required, current_user_id

user_bp = Blueprint('user', __name__)


@user_bp.route('/api/user', methods=['GET'])
@api_login_required
def get_user():
    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE id=?', (current_user_id(),)).fetchone()
    conn.close()
    return jsonify(dict(user))


@user_bp.route('/api/user', methods=['PUT'])
@api_login_required
def update_user():
    data = request.get_json()
    conn = get_db()
    conn.execute(
        'UPDATE users SET name=?, email=?, phone=?, birthday=? WHERE id=?',
        (data.get('name'), data.get('email'), data.get('phone'), data.get('birthday'), current_user_id())
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@user_bp.route('/api/user/password', methods=['PUT'])
@api_login_required
def change_password():
    data    = request.get_json()
    current = data.get('current', '')
    new_pw  = data.get('new', '')
    if not new_pw:
        return jsonify({'error': 'Mật khẩu mới không được để trống'}), 400
    conn = get_db()
    user = conn.execute('SELECT password FROM users WHERE id=?', (current_user_id(),)).fetchone()
    if user['password'] != current:
        conn.close()
        return jsonify({'error': 'Mật khẩu hiện tại không đúng'}), 401
    conn.execute('UPDATE users SET password=? WHERE id=?', (new_pw, current_user_id()))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@user_bp.route('/api/survey', methods=['POST'])
@api_login_required
def save_survey():
    data = request.get_json()
    if not isinstance(data, dict):
        return jsonify({'error': 'Dữ liệu khảo sát không hợp lệ'}), 400
    conn = get_db()
    conn.execute(
        'INSERT INTO surveys (user_id, data_json, created_at) VALUES (?,?,?)',
        (current_user_id(), json.dumps(data, ensure_ascii=False), datetime.utcnow().isoformat())
    )
    conn.execute(
        'UPDATE users SET questionnaire_completed=1 WHERE id=?',
        (current_user_id(),)
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
