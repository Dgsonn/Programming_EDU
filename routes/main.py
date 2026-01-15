from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from extensions import db
from models import User, Course, Lesson, Interaction, UserCourseProgress
from utils import parse_interaction, validate_answer
import json
import datetime

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    if 'user_id' not in session:
        return render_template('landing.html')
    
    user = User.query.get(session['user_id'])
    if not user:
        session.clear()
        return redirect(url_for('main.index'))

    if (not user.role or not user.level) and user.username != 'admin':
        return redirect(url_for('main.onboarding_page'))
    
    # --- GET DATA FOR DASHBOARD AND PROFILE TAB ---
    courses = Course.query.all()
    
    # 1. Calculate Total Time & Profile Stats
    total_minutes = sum([p.time_spent for p in user.progress])
    hours = total_minutes // 60
    minutes = total_minutes % 60
    time_display = f"{hours}h {minutes}m"
    
    # 2. Get Course Progress Details for Profile Tab
    courses_data = []
    for course in courses:
        progress = UserCourseProgress.query.filter_by(user_id=user.id, course_id=course.id).first()
        total_lessons = len(course.lessons)
        completed = progress.completed_lessons if progress else 0
        percent = int((completed / total_lessons * 100)) if total_lessons > 0 else 0
        percent = min(percent, 100)
        time_spent = progress.time_spent if progress else 0
        c_hours = time_spent // 60
        c_minutes = time_spent % 60
        
        courses_data.append({
            'course': course,
            'percent': percent,
            'time': f"{c_hours}h {c_minutes}m",
            'last_accessed': progress.last_accessed if progress else None
        })
    courses_data.sort(key=lambda x: x['last_accessed'] if x['last_accessed'] else datetime.datetime.min, reverse=True)

    # 3. Determine Badges
    badges = []
    if user.xp >= 0: badges.append({'name': 'Tân binh', 'icon': 'fa-seedling', 'color': 'text-green-500', 'desc': 'Bắt đầu hành trình'})
    if user.xp >= 100: badges.append({'name': 'Tập sự', 'icon': 'fa-shield-cat', 'color': 'text-blue-500', 'desc': 'Đạt 100 XP'})
    if user.xp >= 500: badges.append({'name': 'Chuyên gia', 'icon': 'fa-medal', 'color': 'text-purple-500', 'desc': 'Đạt 500 XP'})
    if user.xp >= 1000: badges.append({'name': 'Huyền thoại', 'icon': 'fa-crown', 'color': 'text-yellow-500', 'desc': 'Đạt 1000 XP'})
    
    current_badge = badges[-1] if badges else {'name': 'Chưa có', 'icon': 'fa-circle', 'color': 'text-gray-400'}

    return render_template('DashBoard.html', 
                           user=user, 
                           courses=courses, 
                           time_display=time_display,
                           courses_data=courses_data,
                           badges=badges,
                           current_badge=current_badge)

@main_bp.route('/welcome/onboarding')
def onboarding_page():
    if 'user_id' not in session: return redirect(url_for('auth.auth_page'))
    return render_template('onboarding.html')

@main_bp.route('/lesson/<int:lesson_id>')
def learn_lesson(lesson_id):
    if 'user_id' not in session: return redirect(url_for('auth.auth_page'))
    lesson = Lesson.query.get_or_404(lesson_id)
    interactions = Interaction.query.filter_by(lesson_id=lesson.id).order_by(Interaction.order).all()
    data_list = [parse_interaction(i) for i in interactions]
    return render_template('learning_interface.html', lesson=lesson, initial_data=json.dumps(data_list))

@main_bp.route('/api/save-onboarding', methods=['POST'])
def save_onboarding():
    if 'user_id' not in session: return jsonify({'success': False}), 401
    data = request.json
    user = User.query.get(session['user_id'])
    user.role = data.get('role')
    user.level = data.get('level')
    db.session.commit()
    return jsonify({'success': True})

@main_bp.route('/api/submit_answer', methods=['POST'])
def submit_answer():
    if 'user_id' not in session: return jsonify({'error': 'Unauthorized'}), 401
    data = request.json
    interaction = Interaction.query.get(data.get('interaction_id'))
    is_correct, explanation = validate_answer(interaction, data.get('answer'))
    if is_correct:
        user = User.query.get(session['user_id'])
        user.xp += 10
        db.session.commit()
    return jsonify({'correct': is_correct, 'explanation': explanation})