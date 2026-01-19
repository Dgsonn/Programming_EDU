from flask import Blueprint, render_template, session, redirect, url_for, jsonify, request
from models import User, Course, UserCourseProgress
from extensions import db
import datetime

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')

@profile_bp.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('auth.auth_page'))
    
    user = User.query.get(session['user_id'])
    
    # Calculate Total Time Learning (sum of all courses)
    # Using the backref 'progress' from UserCourseProgress
    total_minutes = sum([p.time_spent for p in user.progress])
    hours = total_minutes // 60
    minutes = total_minutes % 60
    time_display = f"{hours}h {minutes}m"
    
    # Get Course Progress Details
    courses_data = []
    all_courses = Course.query.all()
    
    for course in all_courses:
        progress = UserCourseProgress.query.filter_by(user_id=user.id, course_id=course.id).first()
        
        # Calculate percentage
        # Note: len(course.lessons) might be expensive if many courses, but okay for MVP
        total_lessons = len(course.lessons)
        completed = progress.completed_lessons if progress else 0
        
        # Avoid division by zero
        percent = int((completed / total_lessons * 100)) if total_lessons > 0 else 0
        percent = min(percent, 100) # Cap at 100%
        
        time_spent = progress.time_spent if progress else 0
        c_hours = time_spent // 60
        c_minutes = time_spent % 60
        
        courses_data.append({
            'course': course,
            'percent': percent,
            'time': f"{c_hours}h {c_minutes}m",
            'last_accessed': progress.last_accessed if progress else None
        })

    # Sort courses: Active ones first
    courses_data.sort(key=lambda x: x['last_accessed'] if x['last_accessed'] else datetime.datetime.min, reverse=True)

    # Determine Badge/Level logic
    badges = []
    if user.xp >= 0:
        badges.append({'name': 'Tân binh', 'icon': 'fa-seedling', 'color': 'text-green-500', 'desc': 'Bắt đầu hành trình'})
    if user.xp >= 100:
        badges.append({'name': 'Tập sự', 'icon': 'fa-shield-cat', 'color': 'text-blue-500', 'desc': 'Đạt 100 XP'})
    if user.xp >= 500:
        badges.append({'name': 'Chuyên gia', 'icon': 'fa-medal', 'color': 'text-purple-500', 'desc': 'Đạt 500 XP'})
    if user.xp >= 1000:
        badges.append({'name': 'Huyền thoại', 'icon': 'fa-crown', 'color': 'text-yellow-500', 'desc': 'Đạt 1000 XP'})

    # Current Badge (Highest)
    current_badge = badges[-1] if badges else {'name': 'Chưa có', 'icon': 'fa-circle', 'color': 'text-gray-400'}

    return render_template('profile.html', 
                           user=user, 
                           time_display=time_display, 
                           courses_data=courses_data,
                           badges=badges,
                           current_badge=current_badge)

@profile_bp.route('/api/update_time', methods=['POST'])
def update_time():
    if 'user_id' not in session:
        return jsonify({'success': False}), 401
        
    data = request.json
    course_id = data.get('course_id')
    minutes = data.get('minutes', 1)
    
    if not course_id:
        return jsonify({'success': False, 'msg': 'Missing course_id'})
        
    progress = UserCourseProgress.query.filter_by(user_id=session['user_id'], course_id=course_id).first()
    
    if not progress:
        progress = UserCourseProgress(user_id=session['user_id'], course_id=course_id, time_spent=0)
        db.session.add(progress)
        
    progress.time_spent += minutes
    progress.last_accessed = datetime.datetime.now()
    db.session.commit()
    
    return jsonify({'success': True})
