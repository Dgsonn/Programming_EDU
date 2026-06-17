"""
routes/leaderboard.py
─────────────────────────────────────────────────────────────
API BXH cho dashboard:
  - weekly  : top user theo XP tuần (hiện tạm lấy theo xp tích lũy)
  - streak  : top user theo streak dài nhất
  - friends : mock data (chưa có hệ thống follow thật)

GET /api/leaderboard?type=weekly|streak|friends
"""
from flask import Blueprint, request, jsonify

from models import get_db
from utils import api_login_required, current_user_id

leaderboard_bp = Blueprint('leaderboard', __name__)

# ── Medal emoji theo hạng ────────────────────────────────────
MEDALS = {1: '🥇', 2: '🥈', 3: '🥉'}

# ── Mock "bạn bè" — dùng tạm khi chưa có hệ thống follow ───
# Cấu trúc giống shape của bảng users thật: name, avatar, xp, streak
MOCK_FRIENDS = [
    {'name': 'Nguyễn Minh Anh',  'avatar': '👩‍💻', 'xp': 1850, 'streak': 12},
    {'name': 'Trần Quốc Bảo',    'avatar': '🧑‍🎓', 'xp': 1620, 'streak': 8},
    {'name': 'Lê Hồng Phương',   'avatar': '👩‍🔬', 'xp': 1480, 'streak': 15},
    {'name': 'Phạm Đức Huy',     'avatar': '🧑‍💼', 'xp': 1320, 'streak': 6},
    {'name': 'Hoàng Thùy Linh',  'avatar': '👩‍🎨', 'xp': 1190, 'streak': 9},
    {'name': 'Vũ Đăng Khoa',     'avatar': '🧑‍🚀', 'xp': 1050, 'streak': 4},
    {'name': 'Đỗ Thanh Tùng',    'avatar': '👨‍🔧', 'xp': 920,  'streak': 7},
    {'name': 'Bùi Khánh An',     'avatar': '🧝‍♀️', 'xp': 780,  'streak': 3},
    {'name': 'Mai Phương Thúy',   'avatar': '👩‍⚕️', 'xp': 650,  'streak': 5},
    {'name': 'Đinh Công Minh',   'avatar': '🧔', 'xp': 510,  'streak': 2},
]

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
    """Mock BXH bạn bè. Trộn user hiện tại vào, sort, trả về top 10 + vị trí user."""
    me = {
        'id':    uid,
        'name':  user_name or 'Bạn',
        'avatar': _avatar_for(user_name or ''),
        'value': user_xp,
    }
    merged = MOCK_FRIENDS + [{
        'name':   me['name'],
        'avatar': me['avatar'],
        'xp':     me['value'],
        'streak': 0,
    }]
    merged.sort(key=lambda x: -x['xp'])

    # Tìm rank user hiện tại
    me_rank = next((i + 1 for i, f in enumerate(merged) if f['name'] == me['name']), len(merged) + 1)

    # Nếu user có trong top 10 thì trả thẳng, ngược lại trả top 10 + me ở dưới
    top = merged[:10]
    entries = [
        {
            'rank':   i + 1,
            'id':     None,  # mock
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
        'name':   me['name'],
        'avatar': me['avatar'],
        'value':  me['value'],
    }
    # Đánh dấu "is me" trong entries nếu user lọt top
    for e in entries:
        if e['name'] == me['name'] and e['value'] == me['value']:
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
        entries, me = _fetch_top_by(uid, 'xp')
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
