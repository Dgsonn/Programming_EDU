import json
from flask import Blueprint, jsonify, request
from db import get_db
from utils import api_login_required, current_user_id
from routes.user import _pick_roadmap_template

roadmap_bp = Blueprint('roadmap', __name__)

_TEMPLATE_ORDER = """
    ORDER BY CASE id
        WHEN 'frontend' THEN 0
        WHEN 'backend'  THEN 1
        WHEN 'python'   THEN 2
        WHEN 'cpp'      THEN 3
        ELSE 4
    END"""


@roadmap_bp.route('/api/roadmaps', methods=['GET'])
@api_login_required
def get_roadmaps():
    """Trả về lộ trình THỰC TẾ cho user dựa trên phiếu khảo sát gần nhất.
    Nếu chưa làm khảo sát -> trả tất cả template để user tự chọn."""
    uid  = current_user_id()
    conn = get_db()

    survey = conn.execute(
        'SELECT data_json FROM surveys WHERE user_id=%s ORDER BY id DESC LIMIT 1',
        (uid,)
    ).fetchone()

    matched_id = None
    if survey and survey['data_json']:
        data = survey['data_json']
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except (ValueError, TypeError):
                data = {}
        if isinstance(data, dict):
            matched_id = _pick_roadmap_template(data)

    base = ("SELECT id, title, icon, color, mermaid_def, "
            "COALESCE(nodes_json, '{}'::jsonb) AS nodes_json, "
            "COALESCE(edges_json, '[]'::jsonb) AS edges_json "
            "FROM roadmaps WHERE user_id IS NULL")
    if matched_id:
        rows = conn.execute(base + " AND id=%s", (matched_id,)).fetchall()
    else:
        rows = conn.execute(base + _TEMPLATE_ORDER).fetchall()
    conn.close()

    result = []
    for r in rows:
        item = dict(r)
        # JSONB -> psycopg trả dict sẵn, không cần json.loads
        item['nodes'] = item.pop('nodes_json') or {}
        item['edges'] = item.pop('edges_json') or []
        result.append(item)
    return jsonify(result)


@roadmap_bp.route('/api/roadmap', methods=['GET'])
@api_login_required
def get_roadmap():
    uid        = current_user_id()
    roadmap_id = request.args.get('roadmap_id')
    conn = get_db()
    if roadmap_id:
        rows = conn.execute(
            'SELECT item_id FROM roadmap_progress '
            'WHERE user_id=%s AND roadmap_id=%s AND done=TRUE',
            (uid, roadmap_id)
        ).fetchall()
    else:
        rows = conn.execute(
            'SELECT item_id FROM roadmap_progress WHERE user_id=%s AND done=TRUE', (uid,)
        ).fetchall()
    conn.close()
    return jsonify({'doneItems': [r['item_id'] for r in rows]})


@roadmap_bp.route('/api/me/roadmap', methods=['GET'])
@api_login_required
def get_my_roadmap():
    uid  = current_user_id()
    conn = get_db()
    row  = conn.execute(
        "SELECT mermaid_def, title, icon, color, "
        "COALESCE(nodes_json, '{}'::jsonb) AS nodes_json, "
        "COALESCE(edges_json, '[]'::jsonb) AS edges_json "
        "FROM roadmaps "
        "WHERE user_id=%s AND source IN ('generated','custom') "
        "ORDER BY updated_at DESC LIMIT 1",
        (uid,)
    ).fetchone()
    conn.close()
    if not row:
        return jsonify({'mermaid_def': '', 'nodes': {}, 'edges': []})
    return jsonify({
        'mermaid_def': row['mermaid_def'] or '',
        'title':       row['title'],
        'icon':        row['icon'],
        'color':       row['color'],
        # JSONB -> psycopg trả dict/list sẵn, không cần json.loads
        'nodes':       row['nodes_json'] or {},
        'edges':       row['edges_json'] or [],
    })


@roadmap_bp.route('/api/me/roadmap', methods=['POST'])
@api_login_required
def save_my_roadmap():
    uid  = current_user_id()
    body = request.get_json(silent=True) or {}
    mdef = body.get('mermaid_def', '')
    rid  = f'u{uid}_custom'
    conn = get_db()
    conn.execute(
        '''INSERT INTO roadmaps (id, user_id, source, mermaid_def, updated_at)
           VALUES (%s, %s, 'custom', %s, now())
           ON CONFLICT (id) DO UPDATE
               SET mermaid_def = EXCLUDED.mermaid_def, updated_at = now()''',
        (rid, uid, mdef)
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
    body = request.get_json(silent=True) or {}
    done = bool(body.get('done', False))
    roadmap_id = body.get('roadmap_id')
    if not roadmap_id:
        return jsonify({'error': 'roadmap_id là bắt buộc'}), 400
    conn = get_db()
    conn.execute(
        '''INSERT INTO roadmap_progress (user_id, roadmap_id, item_id, done, completed_at)
           VALUES (%s,%s,%s,%s, CASE WHEN %s THEN now() END)
           ON CONFLICT (user_id, roadmap_id, item_id) DO UPDATE
               SET done=EXCLUDED.done, completed_at=EXCLUDED.completed_at''',
        (uid, roadmap_id, item_id, done, done)
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})