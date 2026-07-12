"""
db/seed_lesson_content.py
─────────────────────────────────────────────────────────────
Đồng bộ nội dung bài học từ static/js/lesson_content*.js vào DB
(lessons.content_json + lesson_code/subtitle/estimated_minutes) — ERD v2.2.

Nguồn chân lý của nội dung tương tác vẫn là các file JS (FE render trực tiếp);
DB giữ bản sao để backend dùng được (quiz ôn tập FE-06 đọc step_2, trang Kỹ năng,
API thống kê...). Sync theo hash: chỉ ghi lại khi file JS đổi, nên gọi trong
init_db() mỗi startup gần như miễn phí.

Chạy tay:  python -m db.seed_lesson_content
"""
import hashlib
import json
import os

from psycopg2.extras import Json

_JS_FILES = (
    'static/js/lesson_content.js',
    'static/js/lesson_content_tc.js',
    'static/js/lesson_content_nc.js',
)

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _load_lesson_content():
    """Eval các file JS trong V8 (py-mini-racer) và trả về dict LESSON_CONTENT.

    Trả None nếu thiếu py_mini_racer hoặc file lỗi — caller tự quyết định bỏ qua.
    """
    try:
        from py_mini_racer import MiniRacer
    except ImportError:
        return None

    ctx = MiniRacer()
    ctx.eval('var window = {};')
    for rel in _JS_FILES:
        path = os.path.join(_BASE_DIR, rel)
        if not os.path.exists(path):
            continue
        with open(path, encoding='utf-8') as f:
            ctx.eval(f.read())
    raw = ctx.eval('JSON.stringify(window.LESSON_CONTENT || {})')
    return json.loads(raw)


def sync_lesson_content(conn, c):
    """Upsert content_json cho từng khóa có trong LESSON_CONTENT.

    Idempotent + rẻ: so sha256 của JSON từng khóa với courses.content_meta
    ->>'content_hash'; trùng thì bỏ qua khóa đó. conn/c là connection/cursor
    đang mở của init_db (KHÔNG commit ở đây — init_db commit chung).
    Trả về dict {course_id: số bài đã sync} để log.
    """
    data = _load_lesson_content()
    if not data:
        return {}

    synced = {}
    for course_id, course in data.items():
        lessons = course.get('lessons') or []
        if not lessons:
            continue

        payload = json.dumps(lessons, sort_keys=True, ensure_ascii=False)
        content_hash = hashlib.sha256(payload.encode('utf-8')).hexdigest()

        c.execute("SELECT content_meta->>'content_hash' AS h FROM courses WHERE id=%s",
                  (course_id,))
        row = c.fetchone()
        if row is None:
            continue  # khóa chưa tồn tại trong DB — không tự tạo course ở đây
        old_hash = row['h'] if isinstance(row, dict) else row[0]
        if old_hash == content_hash:
            continue

        n = 0
        for lesson in lessons:
            code  = lesson.get('id')
            order = lesson.get('index')
            if not code or not isinstance(order, int):
                continue
            # Match theo (course_id, sort_order) — cùng khóa upsert mà
            # schema.py dùng cho metadata, giữ nguyên id để không gãy FK
            # lesson_progress. lesson_code được set để về sau match ổn định.
            c.execute(
                '''UPDATE lessons SET
                       lesson_code       = %s,
                       title             = COALESCE(%s, title),
                       subtitle          = %s,
                       estimated_minutes = %s,
                       xp_reward         = COALESCE(%s, xp_reward),
                       content_json      = %s,
                       updated_at        = now()
                   WHERE course_id = %s AND sort_order = %s''',
                (code, lesson.get('title'), lesson.get('subtitle'),
                 lesson.get('estimated_minutes'), lesson.get('xp_reward'),
                 Json(lesson), course_id, order)
            )
            if c.rowcount == 0:
                c.execute(
                    '''INSERT INTO lessons
                           (course_id, sort_order, lesson_code, title, subtitle,
                            estimated_minutes, xp_reward, content_json, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s, now())''',
                    (course_id, order, code, lesson.get('title') or f'Bài {order}',
                     lesson.get('subtitle'), lesson.get('estimated_minutes'),
                     lesson.get('xp_reward') or 0, Json(lesson))
                )
            n += 1

        c.execute(
            '''UPDATE courses SET content_meta =
                   COALESCE(content_meta, '{}'::jsonb) || %s::jsonb
               WHERE id = %s''',
            (json.dumps({
                'content_hash':  content_hash,
                'total_lessons': len(lessons),
                'accent_color':  course.get('accent_color'),
                'synced_at':     None,  # đặt bên dưới bằng SQL now() cho đúng giờ DB
            }), course_id)
        )
        c.execute(
            """UPDATE courses SET content_meta =
                   jsonb_set(content_meta, '{synced_at}', to_jsonb(now()::text))
               WHERE id = %s""",
            (course_id,)
        )
        synced[course_id] = n

    return synced


def main():
    """Chạy standalone: mở connection riêng, commit, in kết quả."""
    from db.connection import _get_pool
    pool = _get_pool()
    conn = pool.getconn()
    try:
        c = conn.cursor()
        result = sync_lesson_content(conn, c)
        conn.commit()
        if result:
            for cid, n in result.items():
                print(f'[SEED] {cid}: {n} bài đã sync content_json')
        else:
            print('[SEED] Không có gì để sync (hash trùng hoặc thiếu py_mini_racer)')
    finally:
        pool.putconn(conn)


if __name__ == '__main__':
    main()
