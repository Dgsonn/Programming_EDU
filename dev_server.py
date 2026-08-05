"""
dev_server.py — Minimal Flask server for testing lesson_db_design page
NO DATABASE REQUIRED. Uses mock user/enrollment data via context processors.

Run:  python dev_server.py
Then: http://localhost:9001/courses/db_design
      http://localhost:9001/lesson/db_design
      http://localhost:9001/lesson/db_design?lesson=0  (Bài 1)

This server ONLY serves templates from `templates/` and static files from
`static/`. It does NOT import the full app.py (which requires DATABASE_URL).
"""
import os
from flask import Flask, render_template, url_for

ROOT = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(ROOT, 'templates'),
    static_folder=os.path.join(ROOT, 'static'),
)
app.secret_key = 'dev-only-secret-key-not-for-prod'


def csrf_token():
    return 'dev-csrf-token'


# Make csrf_token and url_for available to all templates
app.jinja_env.globals['csrf_token'] = csrf_token


# ── Mock data (in lieu of DB) ────────────────────────────────────────────────
MOCK_USER = {
    'id': 1,
    'name': 'Nguyễn Văn An',
    'email': 'an.nguyen@usth.edu.vn',
    'role': 'Học viên',
    'streak': 12,
    'gems': 230,
    'xp': 1480,
    'level': 4,
    'hearts': 3,
    'last_study_date': '2026-06-18',
}

MOCK_ENROLLMENT = {
    'progress': 18,
    'completed_lessons': 11,
    'time_spent': '4h 20m',
}


@app.context_processor
def inject_mock_data():
    """Inject mock data into all templates."""
    return {
        'user_name': MOCK_USER['name'],
        'streak': MOCK_USER['streak'],
        'streak_active': True,
        'gems': MOCK_USER['gems'],
        'xp': MOCK_USER['xp'],
        'enrollment': MOCK_ENROLLMENT,
        'mock_user': MOCK_USER,
    }


# ── Routes ───────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('landing.html')


@app.route('/courses/<course_id>')
def course_detail(course_id):
    if course_id == 'db_design':
        return render_template('course_db_design.html',
                               enrollment=MOCK_ENROLLMENT,
                               user_name=MOCK_USER['name'],
                               streak=MOCK_USER['streak'])
    # Generic course detail (use existing course_detail.html)
    return render_template('course_detail.html', course_id=course_id,
                           **_inject_kwargs())


@app.route('/lesson/<course_id>')
def lesson_view(course_id):
    from flask import request
    lesson_idx = request.args.get('lesson', 0, type=int)

    templates = {
        'python': 'lesson_python.html',
        'java': 'lesson_java.html',
        'htmlcss': 'lesson_htmlcss.html',
        'db_design': 'lesson_db_design.html',
        'db_design_tc': 'lesson_db_design.html',
        'db_design_nc': 'lesson_db_design.html',
        'ml': 'lesson_db_design.html',
        'ml_intermediate': 'lesson_db_design.html',
        'ml_advanced': 'lesson_db_design.html',
    }
    template = templates.get(course_id)
    if not template:
        return f"<h1>No lesson template for {course_id}</h1>", 404

    return render_template(template,
                           lesson_idx=lesson_idx,
                           course_id=course_id,
                           **_inject_kwargs())


def _inject_kwargs():
    return {
        'user_name': MOCK_USER['name'],
        'streak': MOCK_USER['streak'],
        'streak_active': True,
        'gems': MOCK_USER['gems'],
        'xp': MOCK_USER['xp'],
    }


@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html',
                           streak=MOCK_USER['streak'],
                           streak_active=True,
                           gems=MOCK_USER['gems'],
                           user_name=MOCK_USER['name'])


# ── Health check ─────────────────────────────────────────────────────────────
@app.route('/health')
def health():
    return {'status': 'ok', 'mock_user': MOCK_USER}


if __name__ == '__main__':
    print('=' * 60)
    print('  Programming EDU — DEV SERVER (no DB)')
    print('=' * 60)
    print(f'  Course detail:  http://localhost:9001/courses/db_design')
    print(f'  Lesson page:    http://localhost:9001/lesson/db_design')
    print(f'  Lesson Bài 1:   http://localhost:9001/lesson/db_design?lesson=0')
    print(f'  Health check:   http://localhost:9001/health')
    print('=' * 60)
    app.run(host='0.0.0.0', port=9001, debug=True, use_reloader=False)
