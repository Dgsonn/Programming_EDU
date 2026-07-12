# -*- coding: utf-8 -*-
"""
Phase 1 - Buoc 1: Export lesson content tu 3 file JS sang content/courses/.../lessons/*.json

Note: may nay khong co Node.js nen dung dukpy (Duktape JS engine nhung trong Python)
thay cho script .mjs — cung cach tiep can: eval file JS trong moi truong gia lap
`window = {}` roi doc window.LESSON_CONTENT ra.

Idempotent: chay lai bao nhieu lan cung ghi de dung noi dung, khong tao trung.

Usage:  python scripts/export_js_to_json.py
"""
import json
import sys
from pathlib import Path

import dukpy

ROOT = Path(__file__).resolve().parent.parent
JS_FILES = [
    ROOT / "static" / "js" / "lesson_content.js",       # db_design (20 bai)
    ROOT / "static" / "js" / "lesson_content_tc.js",    # db_design_tc (21 bai)
    ROOT / "static" / "js" / "lesson_content_nc.js",    # db_design_nc (25 bai)
]
OUT_ROOT = ROOT / "content" / "courses"

COURSE_LEVEL_FIELDS = ["course_id", "course_title", "accent_color", "module_color", "total_lessons"]

# Cau truc lesson chuan (theo prompt_phase1_lesson_storage.md)
EXPECTED_LESSON_KEYS = {
    "id", "index", "title", "subtitle", "module", "module_title",
    "estimated_minutes", "xp_reward", "project_piece", "story", "achievement",
    "step_1", "step_2", "step_3", "step_4",
}
REQUIRED_LESSON_KEYS = {"id", "title", "step_1", "step_2", "step_3", "step_4"}


def load_lesson_content(js_path: Path) -> dict:
    """Eval 1 file JS trong sandbox voi window = {} va tra ve window.LESSON_CONTENT."""
    src = js_path.read_text(encoding="utf-8")
    code = "var window = {};\n" + src + "\nJSON.stringify(window.LESSON_CONTENT);"
    result = dukpy.evaljs(code)
    if not result:
        raise RuntimeError(f"{js_path.name}: eval xong nhung window.LESSON_CONTENT rong")
    return json.loads(result)


def main() -> int:
    all_courses: dict = {}
    for js_path in JS_FILES:
        if not js_path.exists():
            print(f"[LOI] Khong tim thay file: {js_path}")
            return 1
        content = load_lesson_content(js_path)
        for course_id, course in content.items():
            if course_id in all_courses:
                print(f"[LOI] course_id '{course_id}' xuat hien o nhieu file JS")
                return 1
            all_courses[course_id] = (js_path.name, course)

    total_files = 0
    anomalies = []

    for course_id, (src_name, course) in all_courses.items():
        lessons = course.get("lessons") or []
        declared = course.get("total_lessons")

        course_dir = OUT_ROOT / course_id
        lessons_dir = course_dir / "lessons"
        lessons_dir.mkdir(parents=True, exist_ok=True)

        # course.json — chi field course-level, khong gom mang lessons
        course_meta = {k: course.get(k) for k in COURSE_LEVEL_FIELDS if k in course}
        extra_course_keys = set(course.keys()) - set(COURSE_LEVEL_FIELDS) - {"lessons"}
        if extra_course_keys:
            anomalies.append(f"[{course_id}] course co field la (van giu trong course.json): {sorted(extra_course_keys)}")
            for k in extra_course_keys:
                course_meta[k] = course[k]
        (course_dir / "course.json").write_text(
            json.dumps(course_meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        total_files += 1

        seen_ids = set()
        for i, lesson in enumerate(lessons):
            lid = lesson.get("id")
            if not lid:
                anomalies.append(f"[{course_id}] lesson index {i} KHONG co field 'id' — bo qua, KHONG export")
                continue
            if lid in seen_ids:
                anomalies.append(f"[{course_id}] lesson id '{lid}' bi TRUNG — file sau ghi de file truoc")
            seen_ids.add(lid)

            missing = REQUIRED_LESSON_KEYS - set(lesson.keys())
            if missing:
                anomalies.append(f"[{course_id}/{lid}] thieu field bat buoc: {sorted(missing)}")
            extra = set(lesson.keys()) - EXPECTED_LESSON_KEYS
            if extra:
                anomalies.append(f"[{course_id}/{lid}] field ngoai cau truc chuan (van export nguyen ven): {sorted(extra)}")

            (lessons_dir / f"{lid}.json").write_text(
                json.dumps(lesson, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
            )
            total_files += 1

        exported = len(seen_ids)
        status = "OK" if exported == declared else "LECH!"
        print(f"{course_id:<16} (tu {src_name}): total_lessons khai bao = {declared}, "
              f"export thuc te = {exported} file lesson  [{status}]")

    print(f"\nTong so file da ghi: {total_files} (gom {len(all_courses)} course.json)")

    if anomalies:
        print(f"\n=== BAT THUONG PHAT HIEN ({len(anomalies)}) — liet ke, KHONG tu sua ===")
        for a in anomalies:
            print("  - " + a)
    else:
        print("\nKhong phat hien lesson nao co cau truc bat thuong.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
