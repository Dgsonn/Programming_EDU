from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth')
def auth_page():
    # Chú ý: url_for('main.index') vì index nằm ở blueprint 'main'
    if 'user_id' in session: return redirect(url_for('main.index'))
    return render_template('login.html')

@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('main.index'))

@auth_bp.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    
    if user and check_password_hash(user.password_hash, data.get('password')):
        session['user_id'] = user.id
        redirect_url = '/welcome/onboarding' if (not user.role) else '/'
        return jsonify({'success': True, 'redirect': redirect_url})
        
    return jsonify({'success': False, 'msg': 'Sai tài khoản hoặc mật khẩu'})

@auth_bp.route('/api/register', methods=['POST'])
def api_register():
    data = request.json
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'success': False, 'msg': 'Tên đã tồn tại'})
    
    hashed = generate_password_hash(data.get('password'))
    user = User(username=data.get('username'), password_hash=hashed)
    db.session.add(user)
    db.session.commit()
    
    session['user_id'] = user.id
    return jsonify({'success': True, 'redirect': '/welcome/onboarding'})