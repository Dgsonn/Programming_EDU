import json
from flask import Blueprint, jsonify, request
from db import get_db
from utils import api_login_required, current_user_id

roadmap_bp = Blueprint('roadmap', __name__)


@roadmap_bp.route('/api/roadmaps', methods=['GET'])
@api_login_required
def get_roadmaps():
    conn = get_db()
    rows = conn.execute(
        """SELECT id, title, icon, color, mermaid_def,
                  COALESCE(nodes_json, '{}') AS nodes_json
           FROM roadmaps
           ORDER BY CASE id
               WHEN 'frontend' THEN 0
               WHEN 'backend'  THEN 1
               WHEN 'python'   THEN 2
               WHEN 'cpp'      THEN 3
               ELSE 4
           END"""
    ).fetchall()
    conn.close()
    result = []
    for r in rows:
        item = dict(r)
        item['nodes'] = json.loads(item.pop('nodes_json') or '{}')
        result.append(item)
    return jsonify(result)


@roadmap_bp.route('/api/roadmap', methods=['GET'])
@api_login_required
def get_roadmap():
    uid  = current_user_id()
    conn = get_db()
    rows = conn.execute(
        'SELECT item_id FROM roadmap_progress WHERE user_id=%s AND done=1', (uid,)
    ).fetchall()
    conn.close()
    return jsonify({'doneItems': [r['item_id'] for r in rows]})


@roadmap_bp.route('/api/me/roadmap', methods=['GET'])
@api_login_required
def get_my_roadmap():
    uid  = current_user_id()
    conn = get_db()
    row  = conn.execute(
        'SELECT mermaid_def FROM user_roadmaps WHERE user_id=%s', (uid,)
    ).fetchone()
    conn.close()
    return jsonify({'mermaid_def': row['mermaid_def'] if row else ''})


@roadmap_bp.route('/api/me/roadmap', methods=['POST'])
@api_login_required
def save_my_roadmap():
    uid  = current_user_id()
    body = request.get_json(silent=True) or {}
    mdef = body.get('mermaid_def', '')
    conn = get_db()
    conn.execute(
        '''INSERT INTO user_roadmaps (user_id, mermaid_def) VALUES (%s, %s)
           ON CONFLICT (user_id) DO UPDATE SET mermaid_def = EXCLUDED.mermaid_def''',
        (uid, mdef)
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@roadmap_bp.route('/api/me/roadmap/ai', methods=['POST'])
@api_login_required
def ai_generate_roadmap():
    return jsonify({'error': 'Premium', 'message': 'Tính năng này chỉ dành cho tài khoản Premium'}), 402


@roadmap_bp.route('/api/roadmap/<item_id>', methods=['PUT'])
@api_login_required
def update_roadmap(item_id):
    uid  = current_user_id()
    done = int(request.get_json().get('done', False))
    conn = get_db()
    conn.execute(
        '''INSERT INTO roadmap_progress VALUES (%s,%s,%s)
           ON CONFLICT(user_id, item_id) DO UPDATE SET done=excluded.done''',
        (uid, item_id, done)
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})