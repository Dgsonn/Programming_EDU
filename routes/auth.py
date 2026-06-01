from flask import Blueprint, jsonify, request, session, redirect
from werkzeug.security import generate_password_hash, check_password_hash
from models import get_db
from validators import validate_email_field, validate_password_field, validate_name_field, validate_phone_field
from extensions import limiter

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data       = request.get_json() or {}
    identifier = (data.get('email') or data.get('phone') or '').strip()
    password   = data.get('password', '')
    errors = {}
    if not identifier:
        errors['email'] = 'Email hoặc số điện thoại không được để trống'
    elif '@' in identifier:
        if err := validate_email_field(identifier):
            errors['email'] = err
    else:
        if err := validate_phone_field(identifier):
            errors['email'] = err
    if not password:
        errors['password'] = 'Mật khẩu không được để trống'
    if errors:
        return jsonify({'errors': errors}), 400
    conn = get_db()
    if '@' in identifier:
        user = conn.execute('SELECT * FROM users WHERE email=%s', (identifier,)).fetchone()
    else:
        user = conn.execute('SELECT * FROM users WHERE phone=%s', (identifier,)).fetchone()
    conn.close()
    if not user:
        return jsonify({'error': 'Email/số điện thoại hoặc mật khẩu không đúng'}), 401

    stored = user['password']
    if not stored:
        return jsonify({'error': 'Email/số điện thoại hoặc mật khẩu không đúng'}), 401
    is_hashed = stored.startswith(('pbkdf2:', 'scrypt:'))
    if is_hashed:
        ok = check_password_hash(stored, password)
    else:
        ok = (stored == password)
        if ok:
            new_hash = generate_password_hash(password)
            conn2 = get_db()
            conn2.execute('UPDATE users SET password=%s WHERE id=%s', (new_hash, user['id']))
            conn2.commit()
            conn2.close()

    if not ok:
        return jsonify({'error': 'Email/số điện thoại hoặc mật khẩu không đúng'}), 401
    session['user_id'] = user['id']
    needs_questionnaire = not bool(user['questionnaire_completed'])
    return jsonify({'ok': True, 'name': user['name'], 'needs_questionnaire': needs_questionnaire})


@auth_bp.route('/auth/register', methods=['POST'])
@limiter.limit("3 per minute")
def register():
    data     = request.get_json()
    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip()
    phone    = data.get('phone', '').strip()
    password = data.get('password', '')
    
    # kiểm tra limit giới hạn số từ nhập cho các ô khi register
    errors = {}
    if err := validate_name_field(name):
        errors['name'] = err
    if not email and not phone:
        msg = 'Vui lòng nhập email hoặc số điện thoại'
        errors['email'] = msg
        errors['phone'] = msg
    else:
        if email:
            if err := validate_email_field(email):
                errors['email'] = err
        if phone:
            if err := validate_phone_field(phone):
                errors['phone'] = err
    if err := validate_password_field(password):
        errors['password'] = err
    if errors:
        return jsonify({'errors': errors}), 400 
    
    conn = get_db()
    
    #kiểm tra xem 1 trong 2 ô phone or email đã được nhập hay chưa
    if email:
        if conn.execute('SELECT id FROM users WHERE email=%s', (email,)).fetchone():
            conn.close()
            return jsonify({'errors': {'email': 'Email đã được sử dụng'}}), 400

    if phone:
        if conn.execute('SELECT id FROM users WHERE phone=%s', (phone,)).fetchone():
            conn.close()
            return jsonify({'errors': {'phone': 'Số điện thoại đã được sử dụng'}}), 400
        
    try:
        user = conn.execute(
            'INSERT INTO users (name, email, phone, password, role) VALUES (%s, %s, %s, %s, %s) RETURNING id, questionnaire_completed',
            (name, email if email else None, phone if phone else None, generate_password_hash(password), 'Học viên')
        ).fetchone()
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify({'error': f'Lỗi hệ thống khi đăng ký: {str(e)}'}), 500
        
    session['user_id'] = user['id']
    conn.close()
    
    needs_questionnaire = not bool(user['questionnaire_completed'])
    return jsonify({'ok': True, 'needs_questionnaire': needs_questionnaire})


@auth_bp.route('/auth/logout')
def logout():
    session.clear()
    return redirect('/')
