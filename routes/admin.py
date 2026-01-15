from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from werkzeug.security import check_password_hash
from extensions import db
from models import User, Course, Interaction

# Tạo nhóm route có tiền tố /admin
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    if session.get('is_admin'): return redirect(url_for('admin.dashboard'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        
        # 1. Check Hardcoded
        is_hardcoded = (username == 'admin' and password == 'admin')

        # 2. Check Database User
        # Cho phép đăng nhập nếu password đúng VÀ (là user 'admin' HOẶC có role='admin')
        is_db_valid = False
        is_correct_pass = False

        if user and check_password_hash(user.password_hash, password):
            is_correct_pass = True
            if user.username == 'admin' or user.role == 'admin':
                is_db_valid = True

        if is_hardcoded or is_db_valid:
            session['is_admin'] = True
            session['user_id'] = user.id if user else None
            return redirect(url_for('admin.dashboard'))
        else:
            if is_correct_pass:
                flash('Tài khoản này không có quyền Admin!', 'error')
            else:
                flash('Sai tài khoản hoặc mật khẩu!', 'error')
            
    return render_template('admin_login.html')

@admin_bp.route('/dashboard')
def dashboard():
    if not session.get('is_admin'): return redirect(url_for('admin.login'))

    current_user = None
    if 'user_id' in session: current_user = User.query.get(session['user_id'])
    # Tạo user ảo nếu đăng nhập cứng
    if not current_user: current_user = type('obj', (object,), {'username': 'Super Admin', 'role': 'admin'})

    all_users = User.query.all()
    courses = Course.query.all()
    
    admins = [u for u in all_users if u.username == 'admin']
    others = [u for u in all_users if u.username != 'admin']
    others.sort(key=lambda x: x.id)
    sorted_users = admins + others
    
    stats = {'users': len(all_users), 'courses': len(courses), 'interactions': Interaction.query.count()}
    return render_template('admin_dashboard.html', admin=current_user, users=sorted_users, courses=courses, stats=stats)

@admin_bp.route('/logout')
def logout():
    session.pop('is_admin', None)
    return redirect(url_for('admin.login'))

@admin_bp.route('/user/delete/<int:user_id>', methods=['POST'])
def delete_user(user_id):
    if not session.get('is_admin'): return redirect(url_for('admin.login'))
    user = User.query.get_or_404(user_id)
    if user.username == 'admin':
        flash('Không thể xóa Admin!', 'error')
    else:
        try:
            db.session.delete(user)
            db.session.commit()
            flash('Đã xóa user!', 'success')
        except: flash('Lỗi khi xóa.', 'error')
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/user/edit/<int:user_id>', methods=['POST'])
def edit_user(user_id):
    if not session.get('is_admin'): return redirect(url_for('admin.login'))
    user = User.query.get_or_404(user_id)
    
    user.role = request.form.get('role') or user.role
    user.level = request.form.get('level') or user.level
    xp = request.form.get('xp')
    if xp: user.xp = int(xp)
    
    try:
        db.session.commit()
        flash('Cập nhật thành công!', 'success')
    except: flash('Lỗi cập nhật.', 'error')
    return redirect(url_for('admin.dashboard'))