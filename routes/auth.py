from flask import Blueprint, jsonify, request, session, redirect
from werkzeug.security import generate_password_hash, check_password_hash
from models import get_db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data     = request.get_json()
    email    = data.get('email', '').strip()
    password = data.get('password', '')
    if not email or not password:
        return jsonify({'error': 'Vui lòng nhập đầy đủ thông tin'}), 400
    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE email=?', (email,)).fetchone()
    conn.close()
    print(f'[DEBUG] email={email!r}, user_found={user is not None}')
    if user:
        pw_check = check_password_hash(user['password'], password)
        print(f'[DEBUG] pw_check={pw_check}, hash_prefix={user["password"][:20]}')
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Email hoặc mật khẩu không đúng'}), 401
    session['user_id'] = user['id']
    needs_questionnaire = not bool(user['questionnaire_completed'])
    return jsonify({'ok': True, 'name': user['name'], 'needs_questionnaire': needs_questionnaire})


@auth_bp.route('/auth/register', methods=['POST'])
def register():
    data     = request.get_json()
    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip()
    password = data.get('password', '')
    if not name or not email or not password:
        return jsonify({'error': 'Vui lòng nhập đầy đủ thông tin'}), 400
    conn = get_db()
    if conn.execute('SELECT id FROM users WHERE email=?', (email,)).fetchone():
        conn.close()
        return jsonify({'error': 'Email đã được sử dụng'}), 400
    conn.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
        (name, email, generate_password_hash(password), 'Học viên')
    )
    conn.commit()
    user = conn.execute('SELECT id, questionnaire_completed FROM users WHERE email=?', (email,)).fetchone()
    session['user_id'] = user['id']
    conn.close()
    needs_questionnaire = not bool(user['questionnaire_completed'])
    return jsonify({'ok': True, 'needs_questionnaire': needs_questionnaire})


@auth_bp.route('/auth/logout')
def logout():
    session.clear()
    return redirect('/')
