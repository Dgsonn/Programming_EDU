# ML REWORK — Pilot Bài 1 trong shell DB Design (2026-07-18)

Bối cảnh: Course 1 ML v1 (6 commit 66a8c3a→37d2094) bị reject vì tự chế UI song song thay vì
theo bố cục khóa DB Design. 4 quyết định user (AskUserQuestion 2026-07-18):
1. **Giữ engine, thay toàn bộ vỏ** — Pyodide + chấm 4 tầng + datasets giữ ngầm; UI làm lại đúng anatomy shell.
2. **Step 3 = map pipeline + sim xen kẽ** — bài quy trình dùng map ML PIPELINE; bài trực giác dùng sim làm cột trái.
3. **Chuẩn nội dung mới áp cho ML trước** (định nghĩa "bạn sẽ học gì" + visual khớp 100% số liệu + audit spec/sách); 3 khóa DB sửa đợt sau.
4. **Quy trình**: concept summary (đã duyệt) → pilot Bài 1 → user duyệt visual → rollout 14 bài theo module.

## 1. Kiến trúc pilot (đúng pattern TC/NC)

| Lớp | Cách làm |
|---|---|
| Route | `/lesson/ml` → `lesson_db_design.html` với `course_id='ml'` (routes/main.py — như TC/NC) |
| Data | `lesson_content_ml.js` viết lại theo schema shell → `window.LESSON_CONTENT['ml']`; hero SVG trong `window.HERO_SVGS_ML` (lookup additive trong renderLessonHero) |
| Module colors | MODULE_COLORS 10-14 (Violet/Pink/Blue/Amber/Green — 5 module ML, cùng cơ chế accent NC) |
| Step 1 | Shell chuẩn: story ticket → **khung "Bạn sẽ học gì" MỚI** (`step_1.you_will_learn`, mount `#you-will-learn` — data-driven, bài DB chưa khai = ẩn) → hero SVG → 3 concept cards → sim `paradigm_visual` (renderer mới trong chuỗi dispatch sim NC) → TableExplorer (Schema + Sample Data 12 dòng) → mission card |
| Step 2 | MCQ ×2 + mini-game chips/bins chuẩn shell (T/E/P sort) |
| Step 3 | Map DÒNG CHẢY: 5 trạm Kho→DATASET→MODEL→TRAIN→PREDICT (zone tự khai `station{}` — hạ tầng M6-TC); block bank 8 mảnh Python → 4 numbered zones; chấm bằng `expected_zones` + full-match `normFullS3` (không qua parser SQL); **hiệu ứng data theo trạm = `zone.ml_effect`** (additive trong drag_game.executeStation — trạm PREDICT thay bảng bằng hồ sơ mới + cột dự đoán); **hybrid gõ tay**: `step_3.ml_pipeline` → hydrateZonesFromTypedSQL nhánh Python (1 dòng = 1 zone, bỏ import/print/comment) |
| Step 4 | 3 cột Codecademy của shell: cột 1 Đề (scenario/real_world/steps/hint 4 mức), cột 2 CodeMirror **python-mode** + Console, cột 3 = **bảng chấm 4 tầng** (Output/Code-AST/Behavior/Risk) thay "Kết quả truy vấn". Chấm qua `window.MLEngine` (ml_engine.js → ml_worker.js Pyodide, giữ nguyên) → pass = confetti + success modal chuẩn (XP labels ML) |
| Header | Hearts + streak + player pill + report (shell) + **pill Python runtime** (chỉ ml) |
| Điều hướng | Tự do như DB (bỏ khóa cứng của bản cũ) |

**Quyết định lệch concept summary (có chủ đích, cần user biết):** editor Step 4 dùng
**CodeMirror python-mode thay Monaco**. Lý do: Monaco là phần NHÌN THẤY (editor chrome khác
hẳn shell), trong khi lệnh gốc là "y hệt bố cục DB Design" — CodeMirror + material-darker là
editor của toàn shell. Engine thật sự ngầm (Pyodide/worker/grader) giữ nguyên 100%.

## 2. Fidelity với spec ChatGPT (C1-LESSON 1, trang 9-12 PDF)

| Spec | Nội dung pilot | Ghi chú |
|---|---|---|
| Lesson goal: rule vs learned, T-E-P, 5-node flow, fit trước predict | you_will_learn.outcomes = đúng 3 goal; defs định nghĩa 3 khái niệm | Chuẩn mới đặt goal NGAY đầu bài |
| Step 1 "split screen compares known rule vs early-warning" + 2 rounds | `paradigm_visual` 2 luồng HIỆN SẴN cạnh nhau, ▶ chạy animation từng nút, đủ 2 → so kèo | Bỏ pattern "Mở luồng" giấu nội dung (nguyên nhân trang trống v1) |
| Step 1 completion "classify early-warning as ML" | Chuyển thành MCQ Q1 của Step 2 | Shell không có gate trong step 1 — micro-check sống đúng chỗ của shell (Bước 2) |
| Step 2 Check 1: 6 cards → T/E/P | mini_game chips/bins: 6 thẻ → 3 ô T/E/P, có solution map | Đúng 6/3 |
| Step 2 Check 2: classify scenarios + misconception feedback | MCQ Q1 (rule vs ML) + Q2 (Experience); options chứa đúng 2 misconception spec: "học viên mới chưa nhãn ≠ Experience", "sĩ số ≠ Performance" | explanation từng option |
| Step 3: progressive builder Dataset→Features/Target→Train→New→Predict | Map 5 trạm (Kho = bảng nguồn 12 dòng, 4 trạm pipeline); Run → truck chạy tuần tự, trạm PREDICT hiện hồ sơ mới + "1 · ĐẬU" | Spec "New Student xuất hiện sau Train": map thể hiện bằng THỨ TỰ trạm — dữ liệu chảy qua TRAIN rồi mới tới PREDICT |
| Step 3 code preview | query.sql/solution.py hybrid của shell (updateIDEFromBlocks) — code hiện dần theo block đặt | Vượt spec (spec: hidden until requested) |
| Step 4: script fit/predict, hidden tests đổi X_new | grade_lesson1 giữ nguyên (verified E2E từ v1): fit-trước-predict AST, no-constant, hidden X_new variants, risk predict(X) | Unsafe-but-correct case = đúng spec: predict(X) qua Output nhưng rớt Risk |
| Runtime: Pyodide worker, numpy/pandas/sklearn, 12 rows | ml_worker.js + ml_lab.load_study_data giữ nguyên | — |
| Badge "ML Problem Framer" | achievement + success modal | — |

## 3. Số liệu — mọi visual khớp dữ liệu thật (chuẩn mới)

`ml_lab.load_study_data()` (chạy đối chiếu 2026-07-18):
- X = 12×3 đúng như data_preview/drag_map trong content (2.0/55/45 … 6.0/88/78)
- y = [0,1,0,1,0,1,0,1,0,1,0,1] — hiển thị "0 · Rớt"/"1 · Đậu"
- X_new = [7.0, 90.0, 82.0] → predict = **1 (ĐẬU)** — dùng nhất quán ở hero SVG, sim, trạm PREDICT, context Step 4.

Pattern nêu trong bridge text ("≥ 6 giờ đều Đậu, < 5 giờ đều Rớt") đúng với 12 dòng: Đậu = {8,9,7,8,9,6}h; Rớt = {2,1,3,2,4,1}h.

## 4. Nền sách (đối chiếu giáo trình)

- **T-E-P** = định nghĩa học máy của Tom Mitchell (1997) — khung được cả Bishop (Deep Learning: Foundations & Concepts, Ch.1) và Watt (ML Refined, Ch.1) dùng khi mở đầu; spec chọn đúng khung này.
- **Rule-based vs learned** = cách mở đầu kinh điển của Bishop Ch.1 (ví dụ chữ số viết tay: luật thủ công thất bại → học từ examples). Ví dụ StudyLab giữ đúng cấu trúc: luật chạy được khi input đủ, học khi luật không viết nổi.
- **Fit-trước-predict + dự đoán trên dữ liệu mới** = quy ước supervised learning ISLR §2.1 (train vs unseen data); bẫy predict(X) chính là "training error ≠ test error" dạng sơ khai — sẽ được đào sâu ở Bài 14 (đã vá gap #8 bias/variance).
- Coverage Audit v2: Bài 1 KHÔNG có gap — 4 gap Course 1 nằm ở Bài 4/9/12/14, sẽ vá lại khi rework tới các bài đó (nội dung vá đã có từ v1).

## 5. Trạng thái & việc còn lại

- Bài 2-15 = stub (shell hiện "Nội dung đang cập nhật" + nút bỏ qua) — rollout theo module sau duyệt.
- Trang `/courses/ml` giữ nguyên (đã theo layout course_db_design); polish ảnh card robot → SVG cùng họ 3 card DB: để đợt rollout.
- COURSE_MILESTONES/trophy cho ML (SHIP STUDYLAB v1.0…): thêm khi khép module 1 (Bài 3) trong rollout.
- Files v1 không còn được route tới (lesson_ml.html, lesson_ml.js, lesson_ml.css, ml_grader/ml_lab GIỮ — engine dùng chung); dọn file chết sau khi rollout ổn định.
