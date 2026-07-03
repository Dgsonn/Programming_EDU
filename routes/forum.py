from flask import Blueprint, jsonify, request
from db import get_db
from utils import api_login_required, current_user_id, _is_admin

forum_bp = Blueprint('forum', __name__)

_CATEGORIES = ('question', 'share', 'discuss')
_REACTIONS = ('like', 'love', 'haha', 'wow', 'sad', 'angry')


def _notify_mentions(conn, post_id, actor_id, content, parent_id):
    """Tạo thông báo cho user được @nhắc trong bình luận.

    Hai nguồn mention:
      1. Reply: người viết reply @nhắc tác giả comment cha -> thông báo cho họ.
      2. @tên gõ trong nội dung: khớp với tên hiển thị của những người ĐÃ tham gia
         bài viết đó (tác giả bài + người từng bình luận) — tập giới hạn nên khớp
         chính xác, tránh quét toàn bộ user và tránh trùng tên mơ hồ.
    Không tự thông báo cho chính mình.
    """
    actor = conn.execute('SELECT name FROM users WHERE id=%s', (actor_id,)).fetchone()
    actor_name = (actor['name'] if actor else '') or 'Ai đó'

    # target_id -> ('comment_reply'|'mention')
    targets = {}

    if parent_id:
        prow = conn.execute(
            'SELECT user_id FROM comments WHERE id=%s', (parent_id,)
        ).fetchone()
        if prow and prow['user_id'] and prow['user_id'] != actor_id:
            targets[prow['user_id']] = 'comment_reply'

    if '@' in (content or ''):
        parts = conn.execute(
            '''SELECT DISTINCT u.id, u.name FROM users u
               WHERE u.id IN (
                   SELECT user_id FROM comments WHERE post_id=%s AND user_id IS NOT NULL
                   UNION
                   SELECT user_id FROM posts WHERE id=%s AND user_id IS NOT NULL
               )''',
            (post_id, post_id)
        ).fetchall()
        for p in parts:
            if p['id'] == actor_id or not p['name']:
                continue
            if ('@' + p['name']) in content:
                targets.setdefault(p['id'], 'mention')

    snippet = (content or '').strip()
    if len(snippet) > 120:
        snippet = snippet[:117] + '...'
    for uid, ntype in targets.items():
        title = (f'{actor_name} đã trả lời bình luận của bạn'
                 if ntype == 'comment_reply'
                 else f'{actor_name} đã nhắc đến bạn trong một bình luận')
        conn.execute(
            '''INSERT INTO notifications (user_id, type, title, body, ref_type, ref_id)
               VALUES (%s, %s, %s, %s, 'post', %s)''',
            (uid, ntype, title, snippet, post_id)
        )


def _zero_reactions():
    """Dict 6 loại cảm xúc, tất cả = 0 — nền để overlay số đếm thật lên."""
    return {k: 0 for k in _REACTIONS}


def _reaction_map(conn, table, id_col, ids, uid):
    """Trả (counts_by_id, my_by_id) cho post_likes/comment_likes.
       counts_by_id[id] = {6 keys}, my_by_id[id] = reaction_type | None.
       Một query GROUP BY + một query my_reaction, scoped theo ids (không N+1)."""
    ids = list(ids)
    counts = {i: _zero_reactions() for i in ids}
    my = {i: None for i in ids}
    if not ids:
        return counts, my
    rows = conn.execute(
        f'SELECT {id_col}, reaction_type, count(*) AS n FROM {table} '
        f'WHERE {id_col} = ANY(%s) GROUP BY {id_col}, reaction_type',
        (ids,)
    ).fetchall()
    for r in rows:
        counts[r[id_col]][r['reaction_type']] = r['n']
    mine = conn.execute(
        f'SELECT {id_col}, reaction_type FROM {table} '
        f'WHERE {id_col} = ANY(%s) AND user_id = %s',
        (ids, uid)
    ).fetchall()
    for r in mine:
        my[r[id_col]] = r['reaction_type']
    return counts, my


def _toggle_reaction(table, id_col, parent_table, row_id, reaction):
    """Logic chung cho react post lẫn comment. Toggle: react cùng loại -> gỡ;
       loại khác -> upsert. Trả (status_code, json_dict)."""
    if reaction not in _REACTIONS:
        return 400, {'error': 'Loại cảm xúc không hợp lệ'}
    conn = get_db()
    try:
        exists = conn.execute(
            f'SELECT id FROM {parent_table} WHERE id=%s', (row_id,)
        ).fetchone()
        if not exists:
            label = 'bài viết' if parent_table == 'posts' else 'bình luận'
            return 404, {'error': f'Không tìm thấy {label}'}
        uid = current_user_id()
        cur = conn.execute(
            f'SELECT reaction_type FROM {table} WHERE {id_col}=%s AND user_id=%s',
            (row_id, uid)
        ).fetchone()
        if cur and cur['reaction_type'] == reaction:
            conn.execute(
                f'DELETE FROM {table} WHERE {id_col}=%s AND user_id=%s', (row_id, uid)
            )
            my_reaction = None
        else:
            conn.execute(
                f'''INSERT INTO {table} ({id_col}, user_id, reaction_type)
                    VALUES (%s, %s, %s)
                    ON CONFLICT ({id_col}, user_id)
                    DO UPDATE SET reaction_type = EXCLUDED.reaction_type, created_at = now()''',
                (row_id, uid, reaction)
            )
            my_reaction = reaction
        # posts giữ cache tổng like_count; comments không có cache -> bỏ qua
        if parent_table == 'posts':
            conn.execute(
                'UPDATE posts SET like_count = '
                '(SELECT count(*) FROM post_likes WHERE post_id=%s) WHERE id=%s',
                (row_id, row_id)
            )
        rows = conn.execute(
            f'SELECT reaction_type, count(*) AS n FROM {table} '
            f'WHERE {id_col}=%s GROUP BY reaction_type', (row_id,)
        ).fetchall()
        conn.commit()
    finally:
        conn.close()
    reactions = _zero_reactions()
    for r in rows:
        reactions[r['reaction_type']] = r['n']
    return 200, {'ok': True, 'reactions': reactions, 'my_reaction': my_reaction}


def _paging():
    """Đọc page/per_page từ query string, trả (page, per_page, offset)."""
    page = max(1, request.args.get('page', 1, type=int))
    per_page = min(50, max(1, request.args.get('per_page', 10, type=int)))
    return page, per_page, (page - 1) * per_page


def _can_modify(conn, table, row_id):
    """Trả (row, error_response). Chủ sở hữu HOẶC admin mới được sửa/xóa."""
    row = conn.execute(f'SELECT user_id FROM {table} WHERE id=%s', (row_id,)).fetchone()
    if not row:
        label = 'bài viết' if table == 'posts' else 'bình luận'
        return None, (jsonify({'error': f'Không tìm thấy {label}'}), 404)
    uid = current_user_id()
    if row['user_id'] != uid and not _is_admin(uid):
        return None, (jsonify({'error': 'Không có quyền chỉnh sửa nội dung này'}), 403)
    return row, None


# ───────────────────────── Bài viết ─────────────────────────

@forum_bp.route('/api/posts', methods=['GET'])
@api_login_required
def list_posts():
    page, per_page, offset = _paging()
    category = (request.args.get('category') or '').strip()
    sort = request.args.get('sort', 'newest')

    conds = []
    params = []
    if category and category in _CATEGORIES:
        conds.append('p.category = %s')
        params.append(category)
    if request.args.get('mine'):
        conds.append('p.user_id = %s')
        params.append(current_user_id())
    where = ('WHERE ' + ' AND '.join(conds)) if conds else ''

    order = {
        'oldest': 'p.created_at ASC',
        'likes':  'p.like_count DESC, p.created_at DESC',
    }.get(sort, 'p.created_at DESC')

    conn = get_db()
    try:
        count_where = where.replace('p.', '')
        total = conn.execute(
            f'SELECT COUNT(*) AS n FROM posts {count_where}', tuple(params)
        ).fetchone()['n']

        rows = conn.execute(
            f'''SELECT p.id, p.user_id, p.category, p.title, p.content,
                       p.like_count, p.created_at, p.updated_at,
                       u.name AS author_name
                FROM posts p
                LEFT JOIN users u ON u.id = p.user_id
                {where}
                ORDER BY {order}
                LIMIT %s OFFSET %s''',
            tuple(params) + (per_page, offset)
        ).fetchall()

        posts = [dict(r) for r in rows]
        ids = [p['id'] for p in posts]
        counts, my = _reaction_map(conn, 'post_likes', 'post_id', ids, current_user_id())
        cmt_counts = {i: 0 for i in ids}
        if ids:
            for r in conn.execute(
                'SELECT post_id, count(*) AS n FROM comments '
                'WHERE post_id = ANY(%s) AND parent_comment_id IS NULL GROUP BY post_id',
                (ids,)
            ).fetchall():
                cmt_counts[r['post_id']] = r['n']
        for p in posts:
            p['reactions'] = counts[p['id']]
            p['my_reaction'] = my[p['id']]
            p['comment_count'] = cmt_counts[p['id']]
    finally:
        conn.close()

    return jsonify({
        'posts': posts,
        'page': page,
        'per_page': per_page,
        'total': total,
        'total_pages': (total + per_page - 1) // per_page,
    })


@forum_bp.route('/api/posts', methods=['POST'])
@api_login_required
def create_post():
    data = request.get_json(silent=True) or {}
    content = (data.get('content') or '').strip()
    if not content:
        return jsonify({'error': 'Nội dung không được để trống'}), 400

    category = data.get('category', 'discuss')
    if category not in _CATEGORIES:
        category = 'discuss'
    title = (data.get('title') or '').strip()

    conn = get_db()
    try:
        row = conn.execute(
            '''INSERT INTO posts (user_id, category, title, content)
               VALUES (%s, %s, %s, %s) RETURNING id''',
            (current_user_id(), category, title, content)
        ).fetchone()
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True, 'id': row['id']})


@forum_bp.route('/api/posts/<int:post_id>', methods=['GET'])
@api_login_required
def get_post(post_id):
    conn = get_db()
    row = conn.execute(
        '''SELECT p.id, p.user_id, p.category, p.title, p.content,
                  p.like_count, p.created_at, p.updated_at,
                  u.name AS author_name
           FROM posts p
           LEFT JOIN users u ON u.id = p.user_id
           WHERE p.id = %s''',
        (post_id,)
    ).fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Không tìm thấy bài viết'}), 404
    post = dict(row)
    counts, my = _reaction_map(conn, 'post_likes', 'post_id', [post_id], current_user_id())
    cmt = conn.execute(
        'SELECT count(*) AS n FROM comments WHERE post_id=%s AND parent_comment_id IS NULL',
        (post_id,)
    ).fetchone()
    conn.close()
    post['reactions'] = counts[post_id]
    post['my_reaction'] = my[post_id]
    post['comment_count'] = cmt['n']
    return jsonify(post)


@forum_bp.route('/api/posts/<int:post_id>/react', methods=['POST'])
@api_login_required
def react_post(post_id):
    data = request.get_json(silent=True) or {}
    reaction = (data.get('reaction') or '').strip()
    status, payload = _toggle_reaction('post_likes', 'post_id', 'posts', post_id, reaction)
    return jsonify(payload), status


@forum_bp.route('/api/posts/<int:post_id>', methods=['PUT'])
@api_login_required
def update_post(post_id):
    data = request.get_json(silent=True) or {}
    fields = {}
    if 'title' in data:
        fields['title'] = (data.get('title') or '').strip()
    if 'content' in data:
        content = (data.get('content') or '').strip()
        if not content:
            return jsonify({'error': 'Nội dung không được để trống'}), 400
        fields['content'] = content
    if 'category' in data:
        category = data.get('category')
        if category not in _CATEGORIES:
            return jsonify({'error': 'Danh mục không hợp lệ'}), 400
        fields['category'] = category
    if not fields:
        return jsonify({'error': 'Không có dữ liệu để cập nhật'}), 400

    conn = get_db()
    try:
        _, err = _can_modify(conn, 'posts', post_id)
        if err:
            return err
        set_clause = ', '.join(f'{col}=%s' for col in fields)
        conn.execute(
            f'UPDATE posts SET {set_clause}, updated_at=now() WHERE id=%s',
            tuple(fields.values()) + (post_id,)
        )
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True})


@forum_bp.route('/api/posts/<int:post_id>', methods=['DELETE'])
@api_login_required
def delete_post(post_id):
    conn = get_db()
    try:
        _, err = _can_modify(conn, 'posts', post_id)
        if err:
            return err
        conn.execute('DELETE FROM posts WHERE id=%s', (post_id,))
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True})


# ───────────────────────── Bình luận ─────────────────────────

@forum_bp.route('/api/posts/<int:post_id>/comments', methods=['GET'])
@api_login_required
def list_comments(post_id):
    page, per_page, offset = _paging()
    conn = get_db()
    try:
        post = conn.execute('SELECT id FROM posts WHERE id=%s', (post_id,)).fetchone()
        if not post:
            return jsonify({'error': 'Không tìm thấy bài viết'}), 404

        # Phân trang 2 tầng: chỉ đếm/trang theo comment gốc (top-level), reply
        # được lấy kèm theo cha (không tính vào per_page) để không bị lạc trang.
        total = conn.execute(
            'SELECT COUNT(*) AS n FROM comments '
            'WHERE post_id=%s AND parent_comment_id IS NULL', (post_id,)
        ).fetchone()['n']

        top = conn.execute(
            '''SELECT c.id, c.post_id, c.user_id, c.parent_comment_id, c.content,
                      c.created_at, c.updated_at, u.name AS author_name
               FROM comments c
               LEFT JOIN users u ON u.id = c.user_id
               WHERE c.post_id = %s AND c.parent_comment_id IS NULL
               ORDER BY c.created_at ASC
               LIMIT %s OFFSET %s''',
            (post_id, per_page, offset)
        ).fetchall()
        top_ids = [r['id'] for r in top]

        replies = []
        if top_ids:
            replies = conn.execute(
                '''SELECT c.id, c.post_id, c.user_id, c.parent_comment_id, c.content,
                          c.created_at, c.updated_at, u.name AS author_name
                   FROM comments c
                   LEFT JOIN users u ON u.id = c.user_id
                   WHERE c.parent_comment_id = ANY(%s)
                   ORDER BY c.created_at ASC''',
                (top_ids,)
            ).fetchall()

        comments = [dict(r) for r in top] + [dict(r) for r in replies]
        cids = [c['id'] for c in comments]
        counts, my = _reaction_map(conn, 'comment_likes', 'comment_id', cids, current_user_id())
        for c in comments:
            c['reactions'] = counts[c['id']]
            c['my_reaction'] = my[c['id']]
    finally:
        conn.close()

    return jsonify({
        'comments': comments,
        'page': page,
        'per_page': per_page,
        'total': total,
        'total_pages': (total + per_page - 1) // per_page,
    })


@forum_bp.route('/api/posts/<int:post_id>/comments', methods=['POST'])
@api_login_required
def create_comment(post_id):
    data = request.get_json(silent=True) or {}
    content = (data.get('content') or '').strip()
    if not content:
        return jsonify({'error': 'Nội dung không được để trống'}), 400

    parent_id = data.get('parent_comment_id')

    conn = get_db()
    try:
        post = conn.execute('SELECT id FROM posts WHERE id=%s', (post_id,)).fetchone()
        if not post:
            return jsonify({'error': 'Không tìm thấy bài viết'}), 404
        if parent_id is not None:
            # Chỉ cho lồng 1 cấp: comment cha phải thuộc cùng post VÀ không phải là reply
            parent = conn.execute(
                'SELECT parent_comment_id FROM comments WHERE id=%s AND post_id=%s',
                (parent_id, post_id)
            ).fetchone()
            if not parent:
                return jsonify({'error': 'Không tìm thấy bình luận cha'}), 404
            if parent['parent_comment_id'] is not None:
                return jsonify({'error': 'Không thể trả lời một trả lời'}), 400
        uid = current_user_id()
        row = conn.execute(
            '''INSERT INTO comments (post_id, user_id, parent_comment_id, content)
               VALUES (%s, %s, %s, %s) RETURNING id''',
            (post_id, uid, parent_id, content)
        ).fetchone()
        _notify_mentions(conn, post_id, uid, content, parent_id)
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True, 'id': row['id']})


@forum_bp.route('/api/comments/<int:comment_id>/react', methods=['POST'])
@api_login_required
def react_comment(comment_id):
    data = request.get_json(silent=True) or {}
    reaction = (data.get('reaction') or '').strip()
    status, payload = _toggle_reaction(
        'comment_likes', 'comment_id', 'comments', comment_id, reaction)
    return jsonify(payload), status


@forum_bp.route('/api/comments/<int:comment_id>', methods=['PUT'])
@api_login_required
def update_comment(comment_id):
    data = request.get_json(silent=True) or {}
    content = (data.get('content') or '').strip()
    if not content:
        return jsonify({'error': 'Nội dung không được để trống'}), 400

    conn = get_db()
    try:
        _, err = _can_modify(conn, 'comments', comment_id)
        if err:
            return err
        conn.execute(
            'UPDATE comments SET content=%s, updated_at=now() WHERE id=%s',
            (content, comment_id)
        )
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True})


@forum_bp.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@api_login_required
def delete_comment(comment_id):
    conn = get_db()
    try:
        _, err = _can_modify(conn, 'comments', comment_id)
        if err:
            return err
        conn.execute('DELETE FROM comments WHERE id=%s', (comment_id,))
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True})
