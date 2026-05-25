# TODO — Frontend Programming EDU

> Branch: `test` | Cập nhật: 2026-05-26

---

## ✅ Đã hoàn thành

- [x] **Trang chi tiết khóa học** — UI tiến độ bài học
- [x] **Trang Theo dõi kỹ năng** — bộ kỹ năng, kỹ năng con, badge trạng thái (Đạt / Cần ôn / Chưa bắt đầu)
- [x] **Donut chart cho mỗi Bộ kỹ năng** — CSS `conic-gradient`, % ở tâm, sub-text `X/Y kỹ năng đạt`, dark mode
- [x] **Trang Lộ trình — Mermaid flowchart TD từ DB**
  - Cài CDN `mermaid@11` + `svg-pan-zoom@3.6.1`
  - Thêm bảng `roadmaps` trong DB, seed 4 lộ trình (Frontend, Backend, Python & AI, C/C++) với cột `mermaid_def` chứa chuỗi flowchart TD
  - Thêm API endpoint `GET /api/roadmaps` trong `routes/roadmap.py`
  - Sửa `main.js`: xóa data hardcode ROADMAPS, fetch `_eduRoadmaps` từ API, render qua `mermaid.render()`, pan/zoom bằng `svgPanZoom`
  - `mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' })`
  - v1 chỉ đọc — không có toggle node
  - Lazy-load diagram khi navigate vào trang Lộ trình

---

## 📋 Backlog

<!-- Thêm task mới vào đây -->
