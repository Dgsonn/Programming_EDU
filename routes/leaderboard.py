"""
routes/leaderboard.py
─────────────────────────────────────────────────────────────
API BXH cho dashboard:
  - weekly  : top user theo XP tuần (hiện tạm lấy theo xp tích lũy)
  - streak  : top user theo streak dài nhất
  - friends : BXH những người user đang follow (bảng user_follows)

GET /api/leaderboard?type=weekly|streak|friends
"""
from flask import Blueprint, request, jsonify

from db import get_db
from utils import api_login_required, current_user_id

leaderboard_bp = Blueprint('leaderboard', __name__)

# ── Medal emoji theo hạng ────────────────────────────────────
MEDALS = {1: '🥇', 2: '🥈', 3: '🥉'}

AVATAR_BY_INITIAL = {
    'A': '🧑‍💻', 'B': '👩‍🎓', 'C': '🧑‍💼', 'D': '👨‍🔬', 'E': '👩‍🔬',
    'F': '🧑‍🎨', 'G': '👨‍🎨', 'H': '👩‍🚀', 'I': '🧑‍🚀', 'J': '👨‍🚀',
    'K': '🧝', 'L': '🧙', 'M': '🧛', 'N': '🦸', 'O': '🦹',
    'P': '👨‍⚕️', 'Q': '👩‍⚕️', 'R': '🧑‍⚕️', 'S': '👨‍🌾', 'T': '👩‍🌾',
    'U': '🧑‍🌾', 'V': '👨‍🍳', 'W': '👩‍🍳', 'X': '🧑‍🍳', 'Y': '👨‍🔧',
    'Z': '👩‍🔧',
}


def _avatar_for(name: str) -> str:
    """Lấy avatar emoji theo chữ cái đầu của tên."""
    if not name:
        return '🧑'
    initial = name.strip()[0].upper()
    return AVATAR_BY_INITIAL.get(initial, '🧑')


def _attach_medal(entries: list) -> list:
    """Gán medal emoji cho top 3."""
    for e in entries:
        e['medal'] = MEDALS.get(e['rank'], '')
    return entries


def _fetch_top_weekly(uid: int, limit: int = 10):
    """Top N theo XP kiếm được TRONG TUẦN NÀY (từ thứ 2), tính từ user_daily_xp_logs.
    Đây là BXH tuần thật theo ERD v2.1 — thay cho cách cũ lấy tạm XP tích luỹ."""
    conn = get_db()
    try:
        top_rows = conn.execute(
            '''SELECT u.id, u.name, COALESCE(SUM(l.xp_earned), 0) AS wxp
               FROM user_daily_xp_logs l
               JOIN users u ON u.id = l.user_id
               WHERE l.log_date >= date_trunc('week', CURRENT_DATE)::date
               GROUP BY u.id, u.name
               ORDER BY wxp DESC, u.name ASC
               LIMIT %s''',
            (limit,)
        ).fetchall()

        me_row = conn.execute(
            '''SELECT COALESCE(SUM(xp_earned), 0) AS wxp
               FROM user_daily_xp_logs
               WHERE user_id = %s AND log_date >= date_trunc('week', CURRENT_DATE)::date''',
            (uid,)
        ).fetchone()
        me_name_row = conn.execute('SELECT id, name FROM users WHERE id=%s', (uid,)).fetchone()
        rank_row = conn.execute(
            '''SELECT COUNT(*) + 1 AS r FROM (
                   SELECT user_id, SUM(xp_earned) AS wxp FROM user_daily_xp_logs
                   WHERE log_date >= date_trunc('week', CURRENT_DATE)::date
                   GROUP BY user_id
               ) t WHERE t.wxp > %s''',
            (me_row['wxp'],)
        ).fetchone()
    finally:
        conn.close()

    top_list = [
        {
            'rank':   idx + 1,
            'id':     r['id'],
            'name':   r['name'] or f'User #{r["id"]}',
            'avatar': _avatar_for(r['name'] or ''),
            'value':  r['wxp'] or 0,
        }
        for idx, r in enumerate(top_rows)
    ]
    _attach_medal(top_list)

    me = None
    if me_name_row:
        me = {
            'rank':   rank_row['r'] if me_row['wxp'] else (len(top_list) + 1),
            'id':     me_name_row['id'],
            'name':   me_name_row['name'] or f'User #{me_name_row["id"]}',
            'avatar': _avatar_for(me_name_row['name'] or ''),
            'value':  me_row['wxp'] or 0,
        }
    return top_list, me


def _fetch_top_by(uid: int, order_col: str, limit: int = 10):
    """
    Lấy top N users theo cột order_col, kèm rank user hiện tại.
    order_col phải là tên cột hợp lệ trong bảng users.
    """
    if order_col not in ('xp', 'streak'):
        return None, None  # tránh SQL injection

    conn = get_db()
    try:
        # Top 10
        top_rows = conn.execute(
            f'SELECT id, name, xp, streak FROM users '
            f'ORDER BY {order_col} DESC, name ASC LIMIT %s',
            (limit,)
        ).fetchall()

        # Rank của user hiện tại (nếu chưa có trong top)
        me_row = conn.execute(
            f'SELECT id, name, xp, streak, '
            f'  (SELECT COUNT(*) + 1 FROM users u2 '
            f'   WHERE u2.{order_col} > u.{order_col}) AS my_rank '
            f'FROM users u WHERE id = %s',
            (uid,)
        ).fetchone()
    finally:
        conn.close()

    top_list = [
        {
            'rank':   idx + 1,
            'id':     r['id'],
            'name':   r['name'] or f'User #{r["id"]}',
            'avatar': _avatar_for(r['name'] or ''),
            'value':  r[order_col] or 0,
        }
        for idx, r in enumerate(top_rows)
    ]
    _attach_medal(top_list)

    me = None
    if me_row:
        me = {
            'rank':  me_row['my_rank'] or (len(top_list) + 1),
            'id':    me_row['id'],
            'name':  me_row['name'] or f'User #{me_row["id"]}',
            'avatar': _avatar_for(me_row['name'] or ''),
            'value': me_row[order_col] or 0,
        }

    return top_list, me


def _build_friends(uid: int, user_name: str, user_xp: int):
    """BXH bạn bè THẬT: JOIN user_follows (follower = user hiện tại) với users.
    Trộn user hiện tại vào, sort theo XP, trả về top 10 + vị trí user."""
    conn = get_db()
    try:
        rows = conn.execute(
            '''SELECT u.id, u.name, u.xp, u.streak
               FROM user_follows f
               JOIN users u ON u.id = f.followee_id
               WHERE f.follower_id = %s''',
            (uid,)
        ).fetchall()
    finally:
        conn.close()

    friends = [
        {
            'id':     r['id'],
            'name':   r['name'] or f'User #{r["id"]}',
            'avatar': _avatar_for(r['name'] or ''),
            'xp':     r['xp'] or 0,
            'streak': r['streak'] or 0,
        }
        for r in rows
    ]
    merged = friends + [{
        'id':     uid,
        'name':   user_name or 'Bạn',
        'avatar': _avatar_for(user_name or ''),
        'xp':     user_xp,
        'streak': 0,
    }]
    merged.sort(key=lambda x: -x['xp'])

    # Tìm rank user hiện tại
    me_rank = next((i + 1 for i, f in enumerate(merged) if f['id'] == uid), len(merged) + 1)

    # Nếu user có trong top 10 thì trả thẳng, ngược lại trả top 10 + me ở dưới
    top = merged[:10]
    entries = [
        {
            'rank':   i + 1,
            'id':     f['id'],
            'name':   f['name'],
            'avatar': f['avatar'],
            'value':  f['xp'],
        }
        for i, f in enumerate(top)
    ]
    _attach_medal(entries)

    me_block = {
        'rank':   me_rank,
        'id':     uid,
        'name':   user_name or 'Bạn',
        'avatar': _avatar_for(user_name or ''),
        'value':  user_xp,
    }
    # Đánh dấu "is me" trong entries nếu user lọt top
    for e in entries:
        if e['id'] == uid:
            e['isMe'] = True
            break
    return entries, me_block


@leaderboard_bp.route('/api/leaderboard', methods=['GET'])
@api_login_required
def get_leaderboard():
    """Trả về BXH theo type: weekly | streak | friends."""
    lb_type = (request.args.get('type') or 'weekly').lower()
    uid     = current_user_id()

    # Lấy thông tin user hiện tại
    conn = get_db()
    me_row = conn.execute(
        'SELECT id, name, xp, streak FROM users WHERE id=%s', (uid,)
    ).fetchone()
    conn.close()

    me_name = (me_row['name'] if me_row else '') or 'Bạn'
    me_xp   = (me_row['xp']   if me_row else 0) or 0

    if lb_type == 'weekly':
        entries, me = _fetch_top_weekly(uid)
        unit, label = 'XP', 'Tuần này'
    elif lb_type == 'streak':
        entries, me = _fetch_top_by(uid, 'streak')
        unit, label = 'ngày', 'Chuỗi dài nhất'
    elif lb_type == 'friends':
        entries, me = _build_friends(uid, me_name, me_xp)
        unit, label = 'XP', 'Bạn bè'
    else:
        return jsonify({'error': f'type không hợp lệ: {lb_type}'}), 400

    return jsonify({
        'type':    lb_type,
        'unit':    unit,
        'label':   label,
        'entries': entries,
        'me':      me,
    })
