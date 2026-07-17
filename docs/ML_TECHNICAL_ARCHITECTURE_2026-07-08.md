# ML Course Technical Architecture — Phase B khung sườn
*Nháp kỹ thuật trước khi build pilot Course 1 Lesson 1. Không phụ thuộc kết quả audit nội dung (Phase A) — đây là phần runtime, course-agnostic.*

## 1. Ràng buộc từ codebase hiện tại (đã khảo sát)
- **Không có build step** (không package.json/npm/webpack) — mọi thư viện nạp qua CDN `<script>` trong `templates/base.html`, giống FontAwesome/Google Fonts hiện có.
- **Route pattern**: `routes/main.py` map `course_slug → template` (dòng ~410, ~423) — course DB Design dùng `templates/course_db_design.html` + `templates/lesson_db_design.html` + `static/js/course_db_design.js` + `static/js/lesson_db_design.js`. ML course sẽ theo cùng khuôn: `course_ml.html` / `lesson_ml.html` / `course_ml.js` / `lesson_ml.js` — **route mới, KHÔNG đụng route DB Design**.
- **`templates/lesson_python.html`** đã tồn tại nhưng không liên quan (chỉ mission-tracking đơn giản, không chạy code) — bỏ qua, không tái dùng.
- Grader hiện tại (DB courses) là JS thuần chấm chuỗi SQL — **không tái dùng được** cho ML (cần chạy Python thật, chấm hành vi model).

## 2. Runtime — nạp Python thật trong trình duyệt
- **Pyodide** (CDN, ví dụ `cdn.jsdelivr.net/pyodide/v0.26.x/full/pyodide.js`) chạy trong **Web Worker riêng** (không block UI thread) — đúng theo spec "Browser Pyodide in a Web Worker".
- Worker nạp sẵn `numpy, pandas, scikit-learn, matplotlib` qua `pyodide.loadPackage(...)` (Pyodide có các gói này build sẵn cho WASM).
- Course 3 Lesson 43 cần **PyTorch CPU** — Pyodide KHÔNG có PyTorch build sẵn cho WASM (rất nặng/không ổn định) → theo spec "remote CPU only where PyTorch adds clear learning value": bài đó cần **server-side sandbox riêng** (không chạy trong Pyodide), khác hẳn 42 bài kia. Cần xử lý riêng khi tới Course 3 Module 5.
- **`ml_lab` module**: 1 file Python (`ml_lab.py`) chứa các hàm/class mock (`load_study_data`, `SimpleClassifier`, `SimpleRegressor`, `SimpleClusterer`...) theo đúng API spec từng bài — nạp vào Pyodide FS lúc worker khởi tạo (`pyodide.FS.writeFile`), học viên `from ml_lab import ...` như trong spec.

## 3. Editor — Step 4 "Full Python IDE"
- **Monaco Editor** (CDN `cdn.jsdelivr.net/npm/monaco-editor@.../min/vs/loader.js`), Python syntax highlighting built-in.
- Tái dùng pattern hiện có của `.CodeMirror` trong DB courses (1 instance/step, `setValue`/`getValue`) nhưng đổi sang Monaco API tương đương.

## 4. ExperimentSpec — nguồn sự thật duy nhất (Step 3)
```js
// Shape tối thiểu (mở rộng dần theo từng bài — Step 3 chỉ sync 1 chiều Visual→Code, KHÔNG parse ngược)
ExperimentSpec = {
  dataset: 'study_workflow_demo_v1',
  features: ['study_hours','attendance','quiz_score'],  // roles: feature/target/excluded
  target: 'pass_fail',
  task: 'classification',        // regression | classification | clustering
  model: { type:'LogisticRegression', params:{} },
  split: null,                    // C1 chưa cần; C2+ có train/val/test ratio
  preprocessing: [],               // ['scale','impute'...] — thêm dần theo module
}
```
- Step 3 UI (kéo-thả) SỬA `ExperimentSpec` → auto-generate code preview (template string ghép theo spec) → học viên xem, KHÔNG gõ tay ở bước này (đúng khóa "Visual → Code one-way, MVP").
- Step 4 code CHẠY THẬT qua Pyodide, KHÔNG đọc lại `ExperimentSpec` — độc lập (đúng spec: 2 luồng tách biệt).

## 5. Grading — 4 tầng (bắt buộc cả 4, không rút gọn)
| Tầng | Cách chấm | Ví dụ |
|---|---|---|
| **Output** | So kết quả in ra / giá trị trả về | prediction hợp lệ cho X_new |
| **Code/AST** | Parse Python bằng `ast` module (chạy TRONG Pyodide, vì cần Python thật để parse Python) | `fit` gọi trước `predict`; không hard-code hằng số |
| **Model behavior** | Chạy lại với input ẩn (hidden test), so hành vi không so giá trị cứng | prediction đổi theo X_new ẩn |
| **Risk** | Quét pattern nguy hiểm (target leakage, no-refit-on-validation...) | target nằm trong X → fail dù output đúng |
- Cả 4 tầng chạy **trong cùng 1 lần execute** ở Worker, trả về 1 object kết quả JSON cho main thread render (Output tab / Model tab / Checks tab — đúng UI spec).
- **Submit** (khác Run): theo spec có thể gọi thêm "ephemeral server verifier" (hidden tests, resource limit, network disabled) — **hoãn cho pilot v1** (chạy client-side đủ cho Course 1; server verifier tính sau khi có nhiều bài hơn, đúng nguyên tắc "rẻ, tăng dần theo nhu cầu" đã áp dụng cho phần ML recommender).

## 6. Badge / checkpoint
- Tái dùng cơ chế `state.hearts`/XP/badge đã có trong `lesson_db_design.js` (progress/score/badge only — đúng "Persistence" rule của spec: không lưu model/notebook/runtime state, chỉ lưu điểm+badge vào NeonDB như các khóa khác).

## 7. Quyết định còn treo cho pilot Lesson 1 (chốt khi build)
- Format 1 file `lesson_content_ml.js` (giống `lesson_content.js`/`_tc`/`_nc`) chứa cả 43 bài dần dần, hay 1 file JSON riêng do độ phức tạp field (ExperimentSpec, ml_lab API code) khác hẳn cấu trúc step_1-4 của DB course?
- **Đề xuất: file JS riêng, cấu trúc field random theo đúng shape spec** (khác cấu trúc DB, không ép chung 1 format) — tránh máy móc tái dùng sai chỗ.

## 8. Việc CHƯA làm ở bước này (chờ Phase A xong)
Nội dung thật của Lesson 1 (Course 1) sẽ chờ báo cáo audit_course1.md — nếu phát hiện gap ở đúng Lesson 1 thì vá vào bản build pilot luôn, tránh build xong rồi sửa lại.
