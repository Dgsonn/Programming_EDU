# TODO / Changelog

---

## [2026-05-24] UI tiến độ bài học – course_detail.html

**File:** `templates/course_detail.html`

### 1. Gameboard connector line
- Thêm wrapper `<div class="cd-lesson-list">` bao quanh các lesson trong mỗi module.
- CSS `.cd-lesson-list::before` vẽ đường dọc màu xám (`#E5E7EB`) nối các node bài học, tạo cảm giác lộ trình học kiểu gameboard (tham khảo Level Gameboard Brilliant – v1 đơn giản, list dọc).
- Dark mode: đường nối chuyển sang `#334155`.

### 2. Pulse animation cho bài đang học
- `.cd-lesson.current .cd-lesson-icon` có `box-shadow` + `@keyframes lesson-pulse` nhấp nháy nhẹ mỗi 2 giây để nổi bật bài ▶ đang học.

### 3. Fix nút "Tiếp tục học" (lần 1)
- Hàm `goLesson()` trước đây dùng `enrollment.completed_lessons` (số đếm) → có thể nhảy sai bài.
- Đã sửa: ưu tiên `document.getElementById('current-lesson').click()` – click thẳng vào phần tử bài đang học trong danh sách, fallback về index cũ nếu không tìm thấy.

---

## [2026-05-24] Fix lỗi trang chi tiết không load được

**File:** `routes/main.py`

### 4. Fix placeholder SQL sai kiểu
- Query enrollment tại `course_detail()` dùng `?` (SQLite syntax) thay vì `%s` (PostgreSQL).
- **Lỗi:** Mở trang `/courses/<course_id>` bị crash server.
- **Sửa:** Đổi `WHERE user_id = ? AND course_id = ?` → `WHERE user_id = %s AND course_id = %s`.

---

## [2026-05-24] Fix nút "Tiếp tục học" ở trang chi tiết không vào được bài học

**Files:** `routes/main.py`, `templates/course_detail.html`

### 5. Thay 3 route lesson riêng lẻ bằng 1 route chung
- Trước: 3 route cứng `/lesson/python`, `/lesson/java`, `/lesson/htmlcss` — không có `/lesson/cpp` → 404.
- Sau: 1 route chung `/lesson/<course_id>` với mapping `_LESSON_TEMPLATES` và `_LESSON_URLS`.

### 6. Đồng bộ URL bài học giữa dashboard và trang chi tiết
- **Nguyên nhân gốc:** `course_detail.html` hardcode `/lesson/{{ course.id }}`, trong khi `main.js` dùng `COURSE_URLS` map (`cpp → /interface`). Khóa C++ bị redirect sai về `/courses/cpp`.
- **Sửa `routes/main.py`:**
  - Thêm `_LESSON_URLS` dict khớp với `COURSE_URLS` trong `main.js`.
  - Route `/lesson/cpp` redirect đúng về `/interface`.
  - Truyền biến `lesson_url` vào template `course_detail.html`.
- **Sửa `templates/course_detail.html`:**
  - Link từng bài học đổi từ hardcode `/lesson/{{ course.id }}` sang `{{ lesson_url }}`.
  - JS: thêm `const LESSON_URL = "{{ lesson_url }}"` và `goLesson()` dùng `LESSON_URL` thay vì tự ghép chuỗi.

---

## Trạng thái icon bài học (giữ nguyên)

| Icon | Class | Ý nghĩa |
|------|-------|---------|
| ✓ | `done` | Hoàn thành |
| ▶ | `current` | Đang học |
| ○ | `locked` | Chưa mở |
