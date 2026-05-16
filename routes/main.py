from flask import Blueprint, render_template, redirect
from utils import login_required, current_user_id
from models import get_db

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def landing():
    return render_template('landing.html')


@main_bp.route('/login')
def login_page():
    return render_template('login.html')


@main_bp.route('/register')
def register_page():
    return render_template('register.html')


@main_bp.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

def _user_stats():
    conn = get_db()
    user = conn.execute('SELECT streak, gems FROM users WHERE id=?', (current_user_id(),)).fetchone()
    conn.close()
    return {'streak': user['streak'], 'gems': user['gems']}


@main_bp.route('/interface')
@login_required
def interface():
    return render_template('interface.html', **_user_stats())


@main_bp.route('/lesson/python')
@login_required
def lesson_python():
    return render_template('lesson_python.html', **_user_stats())


@main_bp.route('/lesson/java')
@login_required
def lesson_java():
    return render_template('lesson_java.html', **_user_stats())


@main_bp.route('/lesson/htmlcss')
@login_required
def lesson_htmlcss():
    return render_template('lesson_htmlcss.html', **_user_stats())
