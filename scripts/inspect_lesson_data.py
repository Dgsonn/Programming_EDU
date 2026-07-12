# -*- coding: utf-8 -*-
"""Doc du lieu bai hoc tu DB va xuat ra docs/lesson_data_sample.md de xem cau truc.

Chay: python scripts/inspect_lesson_data.py
Read-only: chi SELECT, khong sua DB.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import get_db_cursor

OUT_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                        'docs', 'lesson_data_sample.md')

MAX_LIST_ITEMS = 3  # cat bot mang dai trong content_json cho de doc


def truncate_json(obj, max_items=MAX_LIST_ITEMS):
    """Rut gon cac mang dai, giu nguyen cau truc."""
    if isinstance(obj, dict):
        return {k: truncate_json(v, max_items) for k, v in obj.items()}
    if isinstance(obj, list):
        if len(obj) > max_items:
            return [truncate_json(x, max_items) for x in obj[:max_items]] + [
                f"... (con {len(obj) - max_items} phan tu nua, tong {len(obj)})"
            ]
        return [truncate_json(x, max_items) for x in obj]
    return obj


def main():
    with get_db_cursor() as cur:
        # Tong quan: so lesson theo course
        cur.execute('''
            SELECT c.id AS course_id, c.title AS course_title,
                   COUNT(l.id) AS total_lessons,
                   COUNT(l.content_json) AS with_content_json
            FROM courses c
            LEFT JOIN lessons l ON l.course_id = c.id
            GROUP BY c.id, c.title
            ORDER BY c.id
        ''')
        overview = cur.fetchall()

        # Ban ghi mau: moi course lay 2 lesson dau tien co content_json
        cur.execute('''
            SELECT * FROM (
                SELECT l.id, l.course_id, l.lesson_code, l.title, l.subtitle,
                       l.module, l.sort_order, l.lesson_type, l.estimated_minutes,
                       l.xp_reward, l.is_free_preview, l.content_json,
                       l.created_at, l.updated_at,
                       ROW_NUMBER() OVER (PARTITION BY l.course_id ORDER BY l.sort_order) AS rn
                FROM lessons l
                WHERE l.content_json IS NOT NULL
            ) t WHERE rn <= 2
            ORDER BY course_id, sort_order
        ''')
        samples = cur.fetchall()

    lines = []
    lines.append('# Dữ liệu bài học trong DB — bản chụp mẫu\n')
    lines.append('> File này do `scripts/inspect_lesson_data.py` sinh ra từ dữ liệu **thật** trong NeonDB.\n')

    lines.append('## 1. Cấu trúc bảng `lessons`\n')
    lines.append('| Cột | Kiểu | Ý nghĩa |')
    lines.append('|---|---|---|')
    lines.append('| `id` | SERIAL PK | Khóa chính |')
    lines.append('| `course_id` | TEXT FK → courses | Khóa học chứa bài |')
    lines.append('| `module` | TEXT | Mã module (nhóm bài) |')
    lines.append('| `title` / `subtitle` | TEXT | Tiêu đề / phụ đề |')
    lines.append('| `content` | TEXT | Nội dung text cũ (legacy) |')
    lines.append('| `sort_order` | INTEGER | Thứ tự bài trong khóa |')
    lines.append('| `lesson_type` | TEXT | Loại bài (mặc định `reading`) |')
    lines.append('| `xp_reward` | INTEGER | XP thưởng khi hoàn thành |')
    lines.append('| `is_free_preview` | BOOLEAN | Cho xem thử miễn phí |')
    lines.append('| `lesson_code` | TEXT | Mã bài (unique theo course) |')
    lines.append('| `content_json` | **JSONB** | Toàn bộ nội dung bài học tương tác (steps 1-4) |')
    lines.append('| `estimated_minutes` | INTEGER | Thời lượng ước tính |')
    lines.append('| `created_at` / `updated_at` | TIMESTAMP | Thời gian tạo / đồng bộ |')
    lines.append('')
    lines.append('`content_json` được đồng bộ từ `static/js/lesson_content*.js` bằng `python -m db.seed_lesson_content` '
                 '(mỗi lesson object trong JS được ghi nguyên vẹn vào cột này).\n')

    lines.append('## 2. Tổng quan số lượng\n')
    lines.append('| Course ID | Tên khóa | Số bài | Có content_json |')
    lines.append('|---|---|---|---|')
    for r in overview:
        lines.append(f"| `{r['course_id']}` | {r['course_title']} | {r['total_lessons']} | {r['with_content_json']} |")
    lines.append('')

    lines.append('## 3. Bản ghi mẫu (2 bài đầu mỗi khóa, mảng dài đã rút gọn)\n')
    for r in samples:
        lines.append(f"### Lesson #{r['id']} — {r['title']}\n")
        lines.append('| Trường | Giá trị |')
        lines.append('|---|---|')
        for col in ('course_id', 'lesson_code', 'subtitle', 'module', 'sort_order',
                    'lesson_type', 'estimated_minutes', 'xp_reward', 'is_free_preview',
                    'created_at', 'updated_at'):
            lines.append(f"| `{col}` | {r[col]} |")
        lines.append('')
        cj = truncate_json(r['content_json'])
        lines.append('**content_json:**\n')
        lines.append('```json')
        lines.append(json.dumps(cj, ensure_ascii=False, indent=2, default=str))
        lines.append('```\n')

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f'Da ghi {len(samples)} ban ghi mau -> {OUT_PATH}')


if __name__ == '__main__':
    main()
