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

---

## ĐỢT 4 (2026-07-19) — tuần 8 + midterm, gõ-code sống lại, auto-fit map

User feedback sau đợt 3: (1) step 3 phải zoom 50% mới thấy hết; (2) không còn gõ code để chạy pipeline được; (3) Schema Explorer còn tip SQL "SUM trong SELECT"; (4) "quiz 1" → điểm giữa kỳ hợp bối cảnh hơn; (5) tuần 3 quá sớm để dự đoán → tuần 7/8. 3 quyết định user (AskUserQuestion): **auto co map theo màn hình (giữ bố cục)** · **tuần 8 + rename cột `quiz_score` → `midterm_score`** · **gõ thắng kéo lúc Run**.

### Bối cảnh mới (đồng bộ toàn bài)
- TUẦN 8 của kỳ 15 tuần; thi giữa kỳ tuần 7 vừa chấm → `midterm_score` /100 (giá trị 40-95 giữ nguyên — thang khớp); còn 7 tuần can thiệp. Timeline thêm `marks:[{week:7, icon:'📝'}]` (renderParadigmVisual hỗ trợ mốc sự kiện chung).
- Grader KHÔNG đụng tên cột (load_study_data trả mảng numpy) → rename chỉ chạm display JS + docstring ml_lab. Lưu ý rollout: dataset bài sau (200 dòng, thang 0-10) vẫn tên `quiz_score` — soát bối cảnh từng bài khi build.
- Schema Explorer (`table_explorer.js`): cột khai `note` (HTML) → thay tip SQL mặc định. ML: 3 feature + 1 label giải nghĩa đúng vai trò; khóa DB không khai note → tip SUM/LIKE nguyên vẹn.

### Gõ-code chạy pipeline (3 bug chồng nhau → luật "gõ thắng kéo")
1. Nút Run MLFlowMap từng `disabled` khi zone trống → **click trên button disabled không phát event** → delegation hydrate không bao giờ chạy. Fix: nút luôn sống; thiếu input → pill nhắc.
2. `updateIDEFromBlocks` join token bằng dấu cách (chuẩn SQL 1 câu) → kéo thả echo Python thành 1 dòng 96 ký tự → hydrate (đòi ≥4 dòng) vĩnh viễn fail. Fix: bài `ml_pipeline` echo mỗi zone 1 dòng, join `\n` (`#ide-code` thừa kế `white-space:pre` nên hiển thị chuẩn).
3. Hydrate return sớm khi đã có block ở zone → gõ đè bị nuốt. Fix: `hydrateZonesFromTypedSQL(force)` — force chỉ từ click Run: code gõ đủ dòng GHI ĐÈ zones (skip nếu text == echo, để giữ block objects + bank); ghi đè thì clear `step3Placed` + unlock pill như reset. Blur/updateTruckGrid giữ luật cũ (chỉ hydrate khi trống).
4. Bonus: focus editor tự dọn dòng mồi `-- Query…`/`# Code Python…` (quirk shell cũ, áp cả SQL lẫn ML).

### Auto-fit map (phương án user chọn: giữ bố cục, co theo màn hình)
- `fitScale()` trong ml_flow_map.js dùng **CSS `zoom`** (không phải transform — transform giữ layout box gốc, bù width lại reflow ra chiều cao khác số đã đo → nút Run từng bị xén mất). Đo theo **content box của `#drag-game-mount`** (mount có padding 18×2 + `overflow:hidden` — chính là clip thật; đo theo chiều cao cột là sai chuẩn). Vòng lặp hội tụ ≤3 lần; sàn k=0.5; refit khi resize + mỗi lần sân khấu đổi cảnh (debounce 120ms).
- `.mlf-root` cần `flex:none` (mount là flex container → root từng bị bóp chiều cao, content tràn box làm mọi phép đo sai).
- `.mlf-dock` bỏ sticky (sticky + co từng đè dock lên 3 node giữa flow); `.mlf-stage-body` max-height 200 cuộn trong; trim link/padding. Kết quả đo: **1366×768 → k=0.608, nút Run 641..665 (clip edge 692)** · **1536×864 → k=0.70**. Đánh đổi đã báo user: chữ trên map nhỏ ở màn thấp.

### Verify (verify_pilot3.js — 32/32 · 0 pageerror)
Tuần 8/mốc giữa kỳ/hook; sạch quiz + tuần 3 + từ khóa SQL toàn trang; explorer note Feature/Label; fit lọt cột cả idle lẫn done; Run trống → pill nhắc; gõ sai → pill số dòng (không lộ đáp án) + editor giữ nhiều dòng; gõ lại đúng không cần reset → máy chạy; kéo 8 khối → echo 4 DÒNG; gõ đè sau kéo → chấm theo code gõ (bẫy predict(X) báo dòng 4); step 4 Pyodide 4/4 + modal; regression Basic B1 (map SQL + tip SUM + typed SQL run + focus-clear seed) + NC plan_visual. Screenshot tự soi: idle fit đủ 5 node + bảng + nút Run; máy chạy cảnh split X/y; done confetti + tri thức lộ đủ.

---

## BÀI 2 (2026-07-19) — "Bài toán ML này thuộc loại nào?" (spec C1-L2 tr.13-17)

4 quyết định user (AskUserQuestion): **map 1 bảng → 3 NHÁNH song song** · **kéo-thả = GHÉP MODEL↔TARGET, kho có 3 mồi bẫy sai cặp** · **hero 3 luồng chạy được (bỏ dải timeline, ngữ cảnh tuần 8 nằm trong story)** · **step 4 editor trống như Bài 1**.

### Spec fidelity
- Goal spec: chọn loại bài toán theo CÂU HỎI + Ý NGHĨA target, không theo dtype. Step 1 "same data, three questions" → hero 3 luồng pgv (67.7 / 1·ĐẬU / 3 nhóm 9·5·10) + so kèo. Step 2 output-sorting (6 chip → 3 bin hợp đồng output) + 2 MCQ đúng misconception spec (0/1 = tên lớp; clustering không dùng target dù bảng còn nguyên cột). Step 3 ba round bắt buộc (spec) = 3 nhánh cùng chạy step machine. Step 4 = regression + classification (spec: clustering chỉ read-only ở step 3) — grade_lesson2 4 tầng có sẵn, bẫy unsafe-but-correct regressor←y_label (suite xác nhận tầng Risk bắt).
- SỐ THẬT từ ml_lab (content v1 cũ ghi 71.8 là SAI — đã thay): REG w=[5.476, 0.297, 0.257, −12.05] → đóng góp 35.6+25.2+19.0−12.0 = **67.7**; CLF 24hv chân dung ĐẬU [7.4h·91%·81] vs RỚT [2.6h·60%·48], Δ **9.3 vs 36.2** → 1·ĐẬU; CLUSTER k=3 labels thật 24 dòng, sĩ số **9/5/10**, tâm [2.2h·57%·46]/[5.1h·76%·65]/[8.0h·94%·85]. Bảng 24 dòng × 5 cột (midterm_score nhất quán Bài 1; final_score tồn tại vì khóa trước đã thi xong — giải thích trong hook Ticket #02).

### Hạ tầng mới (ml_flow_map.js — Bài 1 nguyên vẹn, suite regression xác nhận)
- `cfg.layout: 'branch'`: source node → `.mlf-split` (3 mũi tên) → `.mlf-branch-row` grid 3 cột. Map NGẮN hơn map dọc → auto-fit k=0.80 @1366×768 (Bài 1 vẫn 0.61).
- `station.zones[]` (1 trạm ôm nhiều zone) + `stKey()` + `stationIndexForZone()` — số dòng sai map đúng NHÁNH đỏ (gõ sai cặp dòng 1,3 → trạm REGRESSION đỏ).
- 2 result_kind mới: `reg_sum` (node: điểm ? → ≈67.7 + chuỗi đóng góp; scene: thanh đóng góp w·x từng feature — đúng ruột least squares) và `clusters` (node: 3 chip nhóm màu; scene: bảng 24 dòng tô 3 màu nhóm THẬT, 2 cột target GẠCH BỎ 🚫, 3 thẻ tâm + note ID tùy ý). CLF tái dùng `nearest` của Bài 1 với số 24-hv.
- Stage-foot + pill Run-trống data-driven theo `zoneIds.length` + `cfg.run_label` (từng hardcode "4 dòng"/"Chạy Pipeline" — lộ khi soi screenshot).

### Gotchas mới (ghi cho rollout)
- `.pgv-wrap` auto-fit minmax(300px) chỉ vừa 2 luồng @~770px — 3 luồng bị rớt hàng 2+1: fix `:has(.pgv-flow:nth-child(3))` ép 3 cột + nén chữ.
- Cột phải 6 zones + 9 khối DÀI (khối Bài 2 ~2× Bài 1) từng tràn 155px @768: class `ml-zones-dense` (renderStep3 toggle khi ≥5 zone) + nén pill/zone/gap → editor khít 413/413.
- Suite đo pgv so-kèo phải chờ theo điều kiện (luồng 4 nút chạy ~3s), không chờ cứng.

### Verify (verify_b2.js — 31/31 · 0 pageerror)
Hero 3 luồng + so kèo; explorer 5 cột 2 TARGET; sạch quiz/tuần-3/SQL; map fit (zoom 0.80, cột phải 413/413); gõ SAI CẶP → dòng 1,3 + nhánh REG đỏ không lộ đáp án; gõ đúng không reset → 3 scene số thật; kéo 6 khối → echo 6 dòng; kéo MỒI BẪY → bắt dòng 1; step 4 bẫy Risk bị bắt rồi bản đúng 4/4 + modal; regression Bài 1 ML map dọc + Basic B1 + NC sạch. Screenshot tự soi: idle 3 nhánh, scene cluster gạch target, hero 3 cột.
