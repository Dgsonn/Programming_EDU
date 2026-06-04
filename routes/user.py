import json
from datetime import datetime
from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from models import get_db
from utils import api_login_required, current_user_id
from validators import validate_name_field, validate_email_field, validate_phone_field, validate_password_field

user_bp = Blueprint('user', __name__)


@user_bp.route('/api/user', methods=['GET'])
@api_login_required
def get_user():
    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE id=%s', (current_user_id(),)).fetchone()
    conn.close()
    if not user:
        return jsonify({}), 404
    user = dict(user)
    user['is_new_user'] = not bool(user.get('questionnaire_completed'))
    user['first_login'] = user['is_new_user']
    return jsonify(user)


@user_bp.route('/api/user', methods=['PUT'])
@api_login_required
def update_user():
    data     = request.get_json()
    name     = (data.get('name')  or '').strip()
    email    = (data.get('email') or '').strip()
    phone    = (data.get('phone') or '').strip()
    birthday = (data.get('birthday') or '').strip()

    errors = {}
    if err := validate_name_field(name):
        errors['name'] = err
    if err := validate_email_field(email):
        errors['email'] = err
    if err := validate_phone_field(phone):
        errors['phone'] = err
    if errors:
        return jsonify({'errors': errors}), 400

    conn = get_db()
    conn.execute(
        'UPDATE users SET name=%s, email=%s, phone=%s, birthday=%s WHERE id=%s',
        (name, email, phone, birthday, current_user_id())
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
    errors = {}
    if err := validate_password_field(new_pw, label='Mật khẩu mới'):
        errors['new'] = err
    if errors:
        return jsonify({'errors': errors}), 400
    conn = get_db()
    user = conn.execute('SELECT password FROM users WHERE id=%s', (current_user_id(),)).fetchone()
    stored = user['password'] if user else None
    if not stored:
        conn.close()
        return jsonify({'error': 'Mật khẩu hiện tại không đúng'}), 401
    is_hashed = stored.startswith(('pbkdf2:', 'scrypt:'))
    pw_ok = check_password_hash(stored, current) if is_hashed else (stored == current)
    if not pw_ok:
        conn.close()
        return jsonify({'error': 'Mật khẩu hiện tại không đúng'}), 401
    conn.execute('UPDATE users SET password=%s WHERE id=%s', (generate_password_hash(new_pw), current_user_id()))
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
        'INSERT INTO surveys (user_id, data_json, created_at) VALUES (%s,%s,%s)',
        (current_user_id(), json.dumps(data, ensure_ascii=False), datetime.utcnow().isoformat())
    )
    conn.execute(
        'UPDATE users SET questionnaire_completed=1 WHERE id=%s',
        (current_user_id(),)
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
