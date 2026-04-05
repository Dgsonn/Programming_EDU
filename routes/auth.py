from flask import Blueprint, jsonify, request, session, redirect
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
    if not user or user['password'] != password:
        return jsonify({'error': 'Email hoặc mật khẩu không đúng'}), 401
    session['user_id'] = user['id']
    return jsonify({'ok': True, 'name': user['name']})


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
        (name, email, password, 'Học viên')
    )
    conn.commit()
    user = conn.execute('SELECT id FROM users WHERE email=?', (email,)).fetchone()
    session['user_id'] = user['id']
    conn.close()
    return jsonify({'ok': True})


@auth_bp.route('/auth/logout')
def logout():
    session.clear()
    return redirect('/')
