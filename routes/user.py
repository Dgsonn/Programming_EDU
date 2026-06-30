import json
from datetime import datetime
from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from psycopg2.extras import Json
from db import get_db
from utils import api_login_required, current_user_id
from validators import validate_name_field, validate_email_field, validate_phone_field, validate_password_field

user_bp = Blueprint('user', __name__)


def _pick_roadmap_template(data):
    """Chọn template lộ trình phù hợp nhất từ câu trả lời khảo sát."""
    career = (data.get('career_target') or '').lower()
    langs  = (data.get('language') or '').lower()
    domain = (data.get('domain') or '').lower()

    if 'frontend' in career:
        return 'frontend'
    if 'backend' in career or 'devops' in career or 'sre' in career:
        return 'backend'
    if 'ai' in career or 'ml' in career or 'data' in career:
        return 'python'
    if 'fullstack' in career:
        return 'frontend'

    # fallback theo ngôn ngữ ưa thích
    if 'c/c++' in langs or 'c++' in langs:
        return 'cpp'
    if 'python' in langs:
        return 'python'
    if 'javascript' in langs:
        return 'frontend'
    if 'java' in langs:
        return 'backend'

    # fallback theo lĩnh vực quan tâm
    if 'ai' in domain or 'machine learning' in domain or 'data' in domain:
        return 'python'
    if 'embedded' in domain or 'iot' in domain:
        return 'cpp'
    if 'web' in domain:
        return 'frontend'

    return 'frontend'


def _generate_user_roadmap(conn, uid, survey_id, data):
    """Tạo lộ trình cá nhân (source='generated') cho user bằng cách sao chép template
    khớp với khảo sát. Idempotent theo id 'u<uid>_generated'."""
    tmpl_id = _pick_roadmap_template(data)
    tmpl = conn.execute(
        'SELECT title, icon, color, nodes_json, edges_json, mermaid_def '
        'FROM roadmaps WHERE id=%s AND user_id IS NULL',
        (tmpl_id,)
    ).fetchone()
    if not tmpl:
        return
    rid = f'u{uid}_generated'
    conn.execute(
        '''INSERT INTO roadmaps
               (id, user_id, source, generated_from_survey_id,
                title, icon, color, nodes_json, edges_json, mermaid_def, updated_at)
           VALUES (%s, %s, 'generated', %s, %s, %s, %s, %s, %s, %s, now())
           ON CONFLICT (id) DO UPDATE SET
               generated_from_survey_id = EXCLUDED.generated_from_survey_id,
               title       = EXCLUDED.title,
               icon        = EXCLUDED.icon,
               color       = EXCLUDED.color,
               nodes_json  = EXCLUDED.nodes_json,
               edges_json  = EXCLUDED.edges_json,
               mermaid_def = EXCLUDED.mermaid_def,
               updated_at  = now()''',
        (rid, uid, survey_id, tmpl['title'], tmpl['icon'], tmpl['color'],
         Json(tmpl['nodes_json']), Json(tmpl['edges_json']), tmpl['mermaid_def'])
    )


@user_bp.route('/api/user', methods=['GET'])
@api_login_required
def get_user():
    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE id=%s', (current_user_id(),)).fetchone()
    conn.close()
    if not user:
        return jsonify({}), 404
    user = dict(user)
    user['is_new_user'] = not bool(user.get('questionnaire_completed'))
    user['first_login'] = user['is_new_user']
    return jsonify(user)


@user_bp.route('/api/user', methods=['PUT'])
@api_login_required
def update_user():
    data     = request.get_json()
    name     = (data.get('name')  or '').strip()
    email    = (data.get('email') or '').strip()
    phone    = (data.get('phone') or '').strip()
    birthday = (data.get('birthday') or '').strip()

    errors = {}
    if err := validate_name_field(name):
        errors['name'] = err
    if err := validate_email_field(email):
        errors['email'] = err
    if err := validate_phone_field(phone):
        errors['phone'] = err
    if errors:
        return jsonify({'errors': errors}), 400

    conn = get_db()
    conn.execute(
        'UPDATE users SET name=%s, email=%s, phone=%s, birthday=%s WHERE id=%s',
        (name, email, phone, birthday, current_user_id())
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@user_bp.route('/api/user/password', methods=['PUT'])
@api_login_required
def change_password():
    data    = request.get_json()
    current = data.get('current', '')
    new_pw  = data.get('new', '')
    errors = {}
    if err := validate_password_field(new_pw, label='Mật khẩu mới'):
        errors['new'] = err
    if errors:
        return jsonify({'errors': errors}), 400
    conn = get_db()
    user = conn.execute('SELECT password FROM users WHERE id=%s', (current_user_id(),)).fetchone()
    stored = user['password'] if user else None
    if not stored:
        conn.close()
        return jsonify({'error': 'Mật khẩu hiện tại không đúng'}), 401
    is_hashed = stored.startswith(('pbkdf2:', 'scrypt:'))
    pw_ok = check_password_hash(stored, current) if is_hashed else (stored == current)
    if not pw_ok:
        conn.close()
        return jsonify({'error': 'Mật khẩu hiện tại không đúng'}), 401
    conn.execute('UPDATE users SET password=%s WHERE id=%s', (generate_password_hash(new_pw), current_user_id()))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@user_bp.route('/api/survey', methods=['POST'])
@api_login_required
def save_survey():
    data = request.get_json()
    if not isinstance(data, dict):
        return jsonify({'error': 'Dữ liệu khảo sát không hợp lệ'}), 400
    uid  = current_user_id()
    conn = get_db()
    survey = conn.execute(
        'INSERT INTO surveys (user_id, data_json, created_at) VALUES (%s,%s,%s) RETURNING id',
        (uid, json.dumps(data, ensure_ascii=False), datetime.utcnow().isoformat())
    ).fetchone()
    conn.execute(
        'UPDATE users SET questionnaire_completed=1 WHERE id=%s',
        (uid,)
    )
    # Tự sinh lộ trình cá nhân cho user mới dựa trên khảo sát
    _generate_user_roadmap(conn, uid, survey['id'], data)
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
