from flask import Blueprint, render_template, redirect
from utils import login_required

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
