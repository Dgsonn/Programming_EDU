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

---

## BÀI 3 (2026-07-19) — "Dataset trong mắt model — X và y" (spec C1-L3 tr.18-21)

4 quyết định user (AskUserQuestion): **rename cột dataset `quiz_score` → `midterm_score` TẬN GỐC (ml_lab + grader — DEVIATION spec API, grader không check tên feature nên an toàn)** · **hero = sim ỐNG KÍNH BẢNG tương tác (bấm DÒNG/CỘT/Ô thật — đúng spec Dataset Lens)** · **map 2 NHÁNH nhiệm vụ (branch layout tái dùng)** · **nhúng đủ 200 dòng thật (badge/phân bố truthful)**.

### Spec fidelity + engine
- Step 1 Dataset Lens → `renderTableLens` (component mới hệ shell): bảng 8 dòng đầu thật + đơn vị dưới tên cột; click số-thứ-tự/tên-cột/ô → highlight + thẻ SAMPLE/ATTRIBUTE/VALUE + checklist ✓; đủ 3 → banner "200 dòng = 200 SAMPLE" (completion rule spec). Step 2: MCQ 200-samples + MCQ vai-trò-không-cố-định (misconception spec) + minigame gán vai trò 5 cột (Round A). Step 3: 2 round bắt buộc = 2 nhánh NHIỆM VỤ A/B, scene mới `roles_split` (bảng 200 dòng tô 3 vai trò: X tím · y vàng · BỎ gạch + lý do; side X (200×3) + y kèm DTYPE **int 0/1 ↔ float đổi theo nhiệm vụ** — đúng chi tiết spec). Step 4 = grade_lesson3 có sẵn (xáo dòng hidden; bẫy unsafe-but-correct final_score trong X — suite xác nhận tầng Risk bắt cả 2 pha).
- Grader messages sửa "tuần 3" → "tuần 8" (3 chỗ) + quiz_score → midterm_score (1 chỗ) — đồng bộ bối cảnh.
- **ml_worker.fetchText → `cache:'no-store'`** + worker URL `?v=2` (ml_engine): rename cột là thay đổi CHỨC NĂNG trong ml_lab — bản cache cũ sẽ chấm sai lệch bài.
- Hydrate typed-Python: **nháy đơn → nháy kép** (chỉ nhánh ml_pipeline — df['pass_fail'] gõ tay từng bị chấm sai oan; SQL không đụng). Dense cột phải mở rộng điều kiện: zones ≥5 HOẶC blocks ≥7 (B3: 4 zones + 7 khối pandas dài).

### Bẫy leak (3 mồi trong kho + 2 pha step 4)
`X_a` chứa final_score (future leak) · `y_a = midterm_score` (target nhầm) · `X_b` chứa pass_fail (target leak — narration giải thích pass_fail SINH RA TỪ final_score ≥ 50). Suite: gõ leak → pill dòng 1 + nhánh A đỏ; kéo mồi target-leak → dòng 3 + nhánh B đỏ; step 4 nộp bẫy → Risk nêu "leak... tuần 8".

### Gotchas mới (rollout)
- Layout tlens 2 cột (bảng + thẻ 250px) từng CẮT MẤT cột pass_fail — bảng 6 cột cần trọn chiều ngang → thẻ giải nghĩa chuyển xuống DƯỚI bảng. Screenshot-soi bắt được, suite DOM không thấy.
- 200 dòng nhúng thẳng content (~8KB) chạy êm: explorer badge 200 rows + phân bố thật 56/144; bảng scene cuộn trong stage-body.

### Verify (verify_b3.js — 32/32 · 0 pageerror ×2 lượt)
Ống kính 3 click + banner; explorer 200 rows + note 2 TARGET nêu leak; map fit zoom 0.797 + cột phải 413/413; gõ nháy ĐƠN đúng → normalize → máy chạy 2 nhánh (int → float); done + replay; echo 4 dòng; step 4 bẫy rồi đúng 4/4 + modal; regression B1-ML map dọc + B2-ML 3 nhánh + Basic + NC sạch.

---

## ĐỢT 5 (2026-07-19) — feedback user 5 điểm trên Bài 1-3 (sau khi duyệt sơ Bài 3)

### Feedback gốc
1. B1 step 3: map ổn nhưng drop-zone/kho "thu bé lại trông khá xấu".
2. B1 step 1: hero lỗi (sim bị cắt).
3. B2 step 1: ngữ cảnh học viên mới ↔ 24 hồ sơ chưa rõ; thiếu định nghĩa regression/clustering; "bảng dính quá, xấu".
4. B3 step 1: thiếu định nghĩa rõ ràng.
5. B3 step 3: lỗi như ảnh (kho chữ mộc + nén xấu).

### Chẩn đoán gốc rễ (probe 1366×768 + 1920×950)
- **Hero box legacy**: `.lesson-hero` gốc là hộp SVG `max-width:720px + max-height:400px + aspect-ratio:3/2 + overflow:hidden`; override `.course-ml` (đợt 3) chỉ reset display/padding — **B1 tràn 623/400 (cắt nút Chạy), B3 tràn 475/400 (cắt banner lens), B2 "vừa" 401/400 nhưng 3 luồng bị ép bẹp trong 720px = "bảng dính"**.
- **`.pill-py` không tồn tại trong CSS**: khối ML type 'py' → pill trần không nền/viền = "đống chữ" ở kho (cả 3 bài, mọi cỡ màn).
- **Dense sai 2 tầng**: trigger `blocks>=7` bắt nhầm B1 (10 khối NGẮN ~102 ký tự); CSS nén áp mọi cỡ màn (1920×950 pill vẫn 11.5px).

### Quyết định user (AskUserQuestion)
1. B2 ngữ cảnh: **Persona + sơ đồ 2 khóa** (Minh — khóa NÀY tuần 8; cohort strip: khóa trước đủ đáp án = tài liệu HỌC ─quy luật→ Minh cần DỰ ĐOÁN).
2. Định nghĩa: **Dải ĐỊNH NGHĨA đầu step 1** (sau hook, TRƯỚC sim) — format chuẩn mọi bài ML: term + tên Việt + định nghĩa 1 câu + ví dụ đời thường + output.
3. Kho khối dài: **giữ wrap tự do** (chỉ tăng cỡ + chip style; không xếp 1 khối/dòng).

### Việc đã làm
- CSS `?v=9`: (1) `.course-ml .lesson-hero` unclip (max-width/height none, aspect auto, overflow visible, tắt ::before/::after glow); (2) `.logic-pill.pill-py` skin chip dev-tool (nền slate color-mix + inset ring + chấm cyan — cùng DNA FIX-7, 1 màu cho mọi khối python); (3) dense 3 tier: gắt @≤800, vừa @≤840, **trung bình @841–1040** (probe 1920×950: B2 6-zone full-size tràn 662/595 → tier 12.5px/40px → 595/595), thả full @>1040 + lưới an toàn `overflow-y:auto`; (4) hero B2 3 luồng nới gap/padding + media ≥1500px; (5) `.pgv-cohort*` strip; (6) `.ml-glossary*` component; (7) marks nowrap; (8) `:has(4 thẻ)` glossary → 2×2.
- JS shell `?v=17`: dense trigger đổi sang **tổng ký tự khối ≥220 || zones ≥5** (B1 102 ký tự → thoát dense, về sizing đợt 4 đã verify); `renderParadigmVisual` thêm `cfg.cohort`; renderer `#ml-glossary` (data-driven `step_1.glossary`, ẩn khi bài chưa khai — 3 khóa DB không đụng).
- Template: mount `#ml-glossary` giữa you-will-learn và hero.
- Content `?v=8`: B1/B2/B3 bỏ `ywl.defs` 1 dòng → `glossary` đầy đủ (B1 5 thẻ: truyền thống/ML/model/fit→predict/T·E·P; B2 4 thẻ: supervised/regression/classification/clustering; B3 6 thẻ: DataFrame/sample/feature/X/y/leakage). B2 persona **Minh** xuyên suốt: hook (khóa trước đã thi xong ↔ Minh khóa này tuần 8), intro, cohort, node cuối 2 luồng supervised "Minh (X_new) → …", ml_flow xnew/profile "Minh · 6.5h · 85% · giữa kỳ 74", narration classification, step_4 scenario (hidden test = thay hồ sơ Minh).

### Verify
- 3 suite: **B1 32/32 · B2 31/31 · B3 32/32 — 0 pageerror**, regression Basic B1 SQL + NC + B1-ML map dọc + B2-ML branch sạch.
- Probe số: hero hết clip cả 3 bài (560/560 · 551/551 · 475/475); B1 s3 thoát dense (pill 13.5px, zone 44px, editor 413/413@768); B2/B3 s3 khít 413/413@768 (zoom 0.824) và 595/595@950.
- Screenshot soi mắt: b1_hero_top (timeline marks 1 dòng/mốc, 2 luồng đủ nút Chạy), gloss_b1/b2_v2/b3 (2×2 B2 cân), sm_b1_s3 (kho chip đẹp), lg2_b2/b3_s3 (kho hết cắt sau tier trung bình — bug này CHÍNH probe bắt được, suite cũ không có case 950px).

### Gotcha ghi sổ
- Hero unclip là fix NỀN cho mọi bài ML sau — component sống render vào `#lesson-hero` sẽ không bao giờ vừa hộp ảnh 720×400.
- Ngưỡng dense theo COUNT khối là sai bản chất — độ dài text mới quyết định; đã đổi sang tổng ký tự.
- Template đổi phải RESTART Flask (Jinja cache) — probe đầu tưởng glossary "missing".

---

## ĐỢT 6 (2026-07-20) — audit trình tự 4 step + 3 cải tiến user chốt

### Audit trình tự (walkthrough cả 4 step × 3 bài, tương tác thật)
- Step 1 thứ tự chuẩn: story → outcomes → glossary → hero sim → concept cards → explorer → mission.
- Step 2 flow lành mạnh: sai mất tim + tip giải thích bản chất + highlight đáp án; xong MCQ mời mini-game; CTA inline chỉ mở sau mini-game; footer tự do (user chốt GIỮ — triết lý Brilliant).
- Không sót từ vựng SQL/quiz cũ; step 3/4 giữ nguyên kết quả đợt 5.

### Bug tìm ra & vá: MCQ option escape toàn bộ HTML
- `renderMCQQuestion` nhánh default dùng `escapeHtml(opt.text)` → **3 option ML + 30 option Basic** viết `<code>` inline hiện NGUYÊN CHỮ tag cho học viên (VD Basic B1: `<code>WHERE id = 101</code>`). Đã vá renderer: escape xong re-enable DUY NHẤT `&lt;code&gt;`/`&lt;/code&gt;` — mọi tag khác vẫn chặn. Basic tự lành (verify cả 2 khóa, raw=false).
- explanation fields sạch (0 bài dính) — chỉ option text.

### 3 cải tiến (user chốt 2026-07-20)
1. **Persona "mỗi ticket 1 nhân vật"**: B1 = **Lan** (7h · 90% · giữa kỳ 82, khóa này) phủ hook / node sim 'Lan (khóa này)' / mission 'predict cho Lan' / map profile 'Lan · 7h…' / step-4 prompt+expected ("thay hồ sơ Lan bằng hồ sơ khác"). Minh giữ riêng B2 (số liệu khác nhau → 2 người khác nhau). B3 bảng 200 người, không persona đơn.
2. **MCQ câu 3 ôn glossary** mỗi bài: B1 "model.fit(X, y) làm gì?" (fit vs predict); B2 "loại nào UNSUPERVISED?" (clustering); B3 "99% lab nhưng đời thật vô dụng, code không báo lỗi = ?" (leakage). Đủ 4 option + explanation từng option (wrong-tip UX dùng).
3. **Gate footer giữ tự do** — không đổi code.

### Verify
- Probe đợt 6: Lan đủ 4 step; counter (1/3) cả 3 bài; trả lời đúng 3 câu liên tiếp → banner mời mini-game (trình tự nguyên vẹn); 0 pageerror.
- 3 suite đầy đủ: **32 + 31 + 32 pass · 0 pageerror**, regression Basic/NC/B1-B2-ML sạch.
- Versions: shell v18 · content v9.

---

## ĐỢT 7 (2026-07-20) — BÀI 4 "Hiểu kiểu dữ liệu trước khi train" (spec C1-L4, mở màn M2)

### Spec → shell (user chốt 3 quyết định)
- **Hero = ỐNG KÍNH DTYPE + câu đố chốt** (mở rộng ống kính Bài 3): `renderDtypeLens` — bấm từng THẺ CỘT lật dtype LƯU TRỮ vs NGHĨA THẬT + hành động modeling; xem đủ 4 thẻ bắt buộc (student_id/study_hours/missed_classes/scholarship) → mở câu đố completion-rule spec "3 cột cùng int64 — cột nào SỐ ĐẾM thật?" (chọn missed_classes). Bug bắt được khi soi screenshot: `.dlens-reveal{display:flex}` override thuộc tính `hidden` → thẻ lộ nghĩa NGAY khi chưa bấm → vá `.dlens-reveal[hidden]{display:none}`.
- **Story = FILE MỚI** (Ticket #04, phòng đào tạo gửi student_profile chuẩn bị model thế hệ 2) — bảng ĐỘC LẬP với student_history Bài 3, tránh mâu thuẫn số liệu 2 bảng cùng cột.
- **Step 3 = map 3 TRẠM = 3 VÒNG spec** (VÒNG 1 VAI TRÒ roles_split · VÒNG 2 PHÂN NHÓM KIỂU type_groups · VÒNG 3 ĐÓNG GÓI readiness) — tinh thần progressive nằm ở sân khấu diễn theo vòng, giữ anatomy shell (7 dòng schema + 3 mồi bẫy), KHÔNG cần cơ chế gating zone mới.

### Shell mở rộng (ml_flow_map v5)
- 2 result_kind mới: **type_groups** (chip 4 nhóm + scene bảng tô 4 màu ngữ nghĩa cont/disc/cat/bin, cột ID/target mờ đi) và **readiness** (thẻ READINESS CARD: X/y chốt + cột loại + cảnh báo encoding + verdict).
- CSS: `.dlens*` (ống kính dtype), `.mlf-chip.tg-*` + `.hl-tg-*` (tô bảng), `.mlf-readiness` (thẻ chốt). Tier dense mới cho 7 zones (`:has(.drop-line:nth-child(7))`) — B4 nhiều hơn B2 1 zone.

### Dataset (ml_lab.load_student_profile seed 1401 — mọi số tính từ engine)
- 200 dòng × 6 cột: student_id (định danh, không lặp) · study_hours (float, liên tục) · missed_classes (int64, đếm, TB 3.0) · major (object: DS 70 · ICT 66 · Space 64) · scholarship (int64 0/1, 25% có) · pass_fail (target: 113 Đậu · 87 Rớt).
- Ép `.astype(np.int64)` tường minh cho missed_classes/scholarship — bài dạy "3 cột CÙNG int64" nên dtype phải ổn định Windows (int32) ↔ Pyodide (int64).
- Grader `grade_lesson4` đã tồn tại từ trước (semantic 4 tầng) — khớp đáp án; unsafe-but-correct: scholarship vào nhóm SỐ → Risk bắt.

### Content c1_l4 (thay stub) — theo chuẩn đợt 5-6
- glossary 6 thẻ (dtype/continuous/discrete/categorical/binary/identifier) + 3 concept card + explorer 6 cột (note giải nghĩa từng vai) + 200 dòng thật.
- Step 2: **3 MCQ** (int64 3 số phận · tuổi làm-tròn vẫn continuous · ôn glossary: vì sao loại student_id dù lab điểm cao) + minigame 6 cột → 3 ngăn ĐO/ĐẾM/TÊN.
- Step 4 (≠ step 3): thêm khảo sát `df.dtypes` + `unique()` trước khi dựng schema; real_world = vụ model X-quang học từ mã máy chụp.

### Verify
- **verify_b4.js: 30/30 pass · 0 pageerror** — hero lật thẻ + câu đố (sai student_id → fb, đúng missed_classes → done), 3 MCQ (1/3), map 3 vòng branch (7 zone/10 khối fit), 3 scene (roles/type_groups/readiness) qua gõ đúng, decoy student_id → dòng 1 + VÒNG 2 đỏ, grade_lesson4 bẫy scholarship (Risk) rồi đúng 4/4 + modal.
- Regression: **B1 32 · B2 31 · B3 32 — tất cả 0 pageerror**; Basic B1 SQL + NC sạch.
- Screenshot soi mắt: hero (reveal fix), 3 scene VÒNG, bank 10 pill đủ hiện.
- Versions: css v12 · content v10 · shell v19 · ml_flow_map v5.

### Gotcha
- `hidden` attribute LUÔN thua `display:flex/grid/block` set trực tiếp — mọi element ẩn-mặc-định phải kèm `[hidden]{display:none}` nếu có rule display. (Chỉ `.dlens-reveal` dính; `.dlens-riddle`/`.tlens-done` dùng display block mặc định nên `hidden` ăn.)
- Bài có 7 zone là ngưỡng chật nhất 4 bài — `overflow-y:auto` trên `.course-ml .step3-editor` là lưới an toàn; đo `edScroll>edClient` ~34px nhưng grid-row cao hơn nên hiển thị đủ (không cắt).

---

## ĐỢT 8 (2026-07-20) — AUDIT TOÀN DIỆN 4 bài + vá 5 lỗi (buttons/UI/scaling/design/nội dung/a11y)

### Phương pháp
Đi tự động 4 step × 4 bài ở 1366×768 + 1920×1080 (buttons, hero fit, map fit, step-4 IDE, footer nav, hearts) + tự chơi minigame end-to-end; rồi audit MỞ RỘNG (user chốt): a11y (icon-label, focus ring, contrast WCAG, tab), viewport tablet/nhỏ (1024/820/768), reduced-motion + hover.

### Sạch (xác nhận)
0 pageerror mọi viewport; mọi button hoạt động; footer Quay lại/Tiếp theo nhất quán 4 bài; 4 hero fit không clip; minigame kéo-thả đúng; step-4 IDE 3 cột gọn; icon-only buttons đều có title/aria; focus ring hiện (outline 2px + cyan glow); số liệu giảng dạy khớp engine.

### 5 lỗi vá (user chốt hướng)
1. **Bài 4 kho khối bị cắt ở màn cao** (dense chỉ nén ≤840px → @1920 7 zone full-size tràn 772/725, hàng cuối kho bị solution.py che). Fix: base 7-zone (`:has(.drop-line:nth-child(7))`) nén nhẹ 46px MỌI màn + tier 841-1040 nén 32px (900px từng tràn 640/545) + ≤840/≤800 nén tiếp. Kết quả: 1080→725/725, 900→545/545, 768→432/398 (overflow-y:auto absorbed, hiện đủ).
2. **Bài 4 MCQ câu 2 dùng cột `age` giả định** (không có trong student_profile). Đổi sang cột THẬT: giả sử LÀM TRÒN `study_hours` (6.5→7) — vẫn dạy "số nguyên chưa chắc là đếm / phép đo làm tròn vẫn continuous" nhưng bám dataset; đồng bộ concept card.
3. **Confetti nổ dù prefers-reduced-motion** (celebrate() chưa gate, khác triggerSparkleRain). Fix: early-return khi matchMedia reduce → xác nhận screenshot hết confetti.
4. **Scroll ngang @1024** (CHỈ khóa ML — `.ml-runtime-pill` 227px đẩy header-right 1178>1024; DB không dính vì không có pill). Fix: @max-width 1180px ẩn nhãn pill, giữ chấm trạng thái + title → hết scroll ngang mọi step @1024.
5. **Tương phản chữ phụ <4.5 AA**: `.pgv-sub` 3.5:1 + `.ml-gloss-ex` 3.9:1 (text-500 #64748B) → nâng text-400 (#94A3B8 ~6.7:1), bold đẩy text-300. (`.te-col-type` "1:1" là false-positive của thuật toán đo trên nền 8%-alpha cùng hue — render thật ~6:1.)

### Verify
- 4 suite: **B4 30 · B1 32 · B2 31 · B3 32 — 0 pageerror**.
- Re-audit mở rộng: @1024 hết scroll ngang mọi step (Bài 1+4); contrast pgv-sub/gloss-ex hết cờ; reduced-motion hết confetti (screenshot).
- B4 fit 3 chiều cao: 1080/900 khít tuyệt đối, 768 absorbed.
- Versions: css v14 · content v11 · shell v20.

### Gotcha
- `hidden` thua `display` — đã ghi (đợt 7).
- Nén dense theo chiều cao phải có tier cho MỌI dải (≤800/≤840/841-1040/>1040) khi bài ở ngưỡng zone chật nhất (7 zone) — thiếu 1 dải là tràn ở đúng dải đó (900px từng lọt lưới).
- Pill runtime ML là phần tử DUY NHẤT khóa ML thêm vào header → thủ phạm scroll ngang màn hẹp; khóa DB sạch.
