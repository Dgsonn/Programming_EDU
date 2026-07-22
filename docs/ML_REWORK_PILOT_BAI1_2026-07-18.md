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

---

## ĐỢT 9 (2026-07-20) — BÀI 5 "Làm sạch dữ liệu bẩn" (spec C1-L5 tr.27-30)

### Spec → shell (user chốt 4 quyết định)
- **Story = BẢN XUẤT THÔ hệ điểm 10** (Ticket #05): attendance/quiz_score chấm /10 như sổ điểm VN → giá trị 12/15 HIỂN NHIÊN nhập nhầm; giải thích bẩn do gộp nguồn + nhập tay. Persona neo dòng lỗi: **Hùng** (chuyên cần 12/10) + **Mai** (60 giờ/tuần — cắm cờ, không xóa).
- **Hero = ỐNG KÍNH LỖI + câu đố chốt** (`renderQualityLens` mới): bảng 8 dòng, 5 ô/dòng lỗi tô 5 màu theo loại (thiếu đỏ · sai phạm vi cam · sai danh mục vàng · nghi ngờ tím · trùng viền cyan), bấm ô → thẻ LOẠI + BẰNG CHỨNG + HÀNH ĐỘNG; đủ 5 loại → câu đố completion-rule spec "Mai 60h: XÓA hay CẮM CỜ?" (đúng = CẮM CỜ).
- **Step 3 = map 4 TRẠM + BẢNG ĐẾM** (`result_kind: quality_counts` mới): 5 chỉ số (dòng·trùng·sai·thiếu·cờ) before→after mỗi vòng, chỉ số đổi tô màu (giảm=xanh, tăng=vàng). Khoảnh khắc đắt: VÒNG 2 **thiếu TĂNG 9→11 có chủ đích** (sai→NaN) rồi về 0 sau median; VÒNG 4 cờ 0→2, outlier VẪN CÒN. 2 mồi bẫy: fillna(0) + lọc bỏ outlier.
- Số 100% từ engine (seed 1501): 204→200 dòng · missing 9→11→0 · invalid 4 (12, 15, 2×ITC) · outlier 60/45 · median study 6.0 / att 6.4 / quiz 4.9.

### Grader (có sẵn, khớp spec): grade_lesson5
4 tầng; trap Risk: fillna(0) ("không biết ≠ bằng 0") + xóa outlier ("bất thường ≠ sai"); cột cờ bắt buộc; Behavior đổi VỊ TRÍ lỗi (variant 777); Risk pass kèm ⚠ Course-2: median phải học từ TRAIN split.

### Verify — verify_b5.js: 31/31 pass · 0 pageerror (2 lượt sạch)
Hero 5 loại + đố sai/đúng; 3 MCQ (1/3) gồm misconception spec "cùng ID khác số ≠ trùng"; minigame lỗi→hành động (SỬA/ĐIỀN/CẮM CỜ); map 4 vòng đủ 4 bảng đếm; kéo bẫy fillna(0) → dòng 5 + VÒNG 3 đỏ; step 4: trap fillna(0) → Risk đỏ, trap xóa outlier → Risk đỏ, bản đúng 4/4 + nhắc TRAIN split + modal. Regression B1 dọc/B2/B3/B4 + Basic + NC sạch.

### Fix trong đợt
- MCQ option escape: không (renderer đã vá đợt 6). Step-4 CÁC BƯỚC từng lộ code đáp án (drop_duplicates().copy()) → viết lại mô tả không-code.
- Tier nén mới cho bài "kho ≥8 pill DÀI" (B5 mỗi pill 1 hàng ~70 ký tự, từng tràn 462/398): dùng **#block-bank (ID)** trong selector để thắng specificity rule generic có #drop-zones trong :has() — bài học: rule trong :has() chứa ID thì mọi override phải ≥ ID đó. Pill cuối hiện đủ (516≤523).
- Guard `:not(:has(.drop-line:nth-child(7)))` để tier 8-pill không đè tier 7-zone của B4 (B4 probe độc lập: pill cuối 507≤523, editor 398/398 — còn tốt hơn trước).

### Gotcha môi trường (ghi sổ)
- **Rate-limiter 50 req/giờ trên route lesson** — chạy suite lặp nhiều lượt sẽ 429 (page trắng, hero null, dễ tưởng bug). Limiter in-memory → RESTART Flask là reset. Budget lượt chạy suite.
- Tài khoản audit có cờ needs_questionnaire (POST /api/survey để tắt) — không phải nguyên nhân 429 nhưng đã dọn luôn.
- Versions: css v18 · content v13 · shell v21 · flowmap v6.

---

## ĐỢT 10 (2026-07-21) — BÀI 6 "Scale feature — không để 1 đơn vị lấn át" (spec C1-L6, M2)

### Spec → shell (user chốt 4 quyết định)
- **Hero = ỐNG KÍNH ÂM LƯỢNG + demo khoảng cách** (`renderScaleLens` mới): equalizer 3 feature với chiều cao ∝ σ THẬT (study 2.72 · attendance 17.69 · activity_count 556 → activity nuốt trọn track, 2 cột kia thành sliver); nút **▶ SCALE** lật cả equalizer (3 thanh về cùng cao σ 1.0) LẪN bảng đóng góp khoảng cách. Demo 2 học viên **Nam** (study 3.1 · LMS 1 971 · **Rớt**) vs **Linh** (study 10 · LMS 152 · **Đậu**): thô → activity chiếm **99.97%**, study **0.001%** (át tiếng); scale → study **31.2%**, activity 51.9% (nghe được). Câu đố chốt "cột nào lấn át khi CHƯA scale" (đúng = activity_count).
- **Dạy song song Min-Max vs StandardScaler** (user chốt): glossary 6 thẻ (SCALE·STANDARDSCALER z=(x−μ)/σ·MIN-MAX [0,1]·FEATURE DOMINANCE·FIT vs TRANSFORM·STD σ) + concept card so 2 scaler + MCQ #2 test robustness ("outlier kéo Min-Max về gần 0, Standard ít bị"). Exercise vẫn StandardScaler (khớp grader).
- **Persona tôi chọn khớp seed 1601** (user chốt): soi dữ liệu thật → Nam = 20520135 (activity cao + study thấp + Rớt) làm "vẫy LMS"; Linh = 20520048 (study 10 · Đậu) làm "chăm thật". Cặp cho khoảng cách thô 1 819, contrib activity 99.97% (số 100% từ engine + sklearn).
- **Step 3 = map 3 TRẠM + 2 mồi bẫy** (user chốt): CHỌN 3 cột số (`scale_select` mới: pick 3 + exclude ID/major/target kèm lý do) → FIT+TRANSFORM (`scale_stats` transform: equalizer ngang σ→1) → KIỂM (`scale_stats` verify: 3 thẻ mean0/std1 ✓). Bẫy: scale student_id · scale pass_fail (`df[numeric_cols + ["pass_fail"]]`).

### Engine + grader (có sẵn, khớp spec)
- `load_scaling_dataset` seed 1601, 200 dòng: study_hours σ2.72/μ5.22 · attendance_rate σ17.69/μ68.5 · activity_count σ556/μ949 (chênh **204×**) · student_id (ID) · major (ICT68/DS67/Space65) · pass_fail (Đậu64/Rớt136).
- `grade_lesson6` 4 tầng: cần StandardScaler + fit_transform, X_scaled (200,3) mean≈0/std≈1, `numeric_cols` = đúng {study,attendance,activity}; Risk bắt scale student_id / pass_fail; Behavior variant 777 (không hard-code); Risk pass kèm ⚠ Course-2 fit-trên-TRAIN-split. Test server-side: CORRECT→4/4; TRAP_ID→risk_ok False nêu đích danh; TRAP_TARGET→output (200,4) fail.
- scikit-learn ĐÃ nạp sẵn trong ml_worker (`loadPackage(['numpy','pandas','scikit-learn'])`) → Run step 4 chạy StandardScaler trong Pyodide OK. Dispatch grader_fn generic (`ml_grader.grade_lesson6`), không allowlist.

### Verify — verify_b6.js: 34/34 pass · 0 pageerror (2 lượt sạch)
Hero equalizer raw (activity σ556 cao vống, riddle ẩn) → bấm thanh hiện dải/σ/μ → SCALE (3 thanh đều σ1.0 + contrib study 31% + riddle mở) → đố sai study_hours (feedback) → đúng activity_count (done); glossary 6; explorer 6 cột. 3 MCQ (1/3) + minigame 3 ngăn SCALE/ENCODE/NGOÀI. Map 3 trạm: scale_select (3 pick + 3 ban) → transform (σ→1) → verify (mean0/std1). Kéo bẫy scale ID → chấm bắt. Step 4: trap ID → Risk "ĐỊNH DANH/vô nghĩa"; bản đúng 4/4 + TRAIN split + modal. Regression B1-B5 ML + Basic + NC sạch. Multi-viewport 1920/1536/1024/768: 0 h-scroll, hero+map fit (zoom tự co 0.70@1024).

### Fix trong đợt
- **Hydrate lọc bỏ dòng `print(...)`** (`!/^print\s*\(/.test(t)` — coi print là echo boilerplate): zone 3 "KIỂM" ban đầu là print → bị lọc → còn 2 dòng < 3 zone → hydrate trả false, gõ-code không chạy. B5 không dính vì không có zone print. Sửa: đổi zone 3 sang câu lệnh GÁN thật `means, stds = X_scaled.mean(axis=0).round(2), X_scaled.std(axis=0).round(2)` (đúng nghĩa "tính giá trị kiểm chứng", không bị lọc). KHÔNG đụng bộ lọc shell (dùng chung mọi bài).
- **Pill Python dài bị cắt ellipsis ở ≤900px**: 2 pill `X_scaled = StandardScaler().fit_transform(df[...` trùng phần đầu → cắt cùng chỗ thì không phân biệt nổi bản đúng vs bẫy t2. Vá gọn: `@media (max-width:900px){ .course-ml .block-bank .logic-pill{ white-space:normal; overflow:visible; word-break:break-word } }` — chỉ ML, màn hẹp pill WRAP đủ token. Desktop (1366+) pill vẫn 1 hàng, hiện đủ 100%.
- Step-4 CÁC BƯỚC từng lộ nguyên dòng `StandardScaler().fit_transform(df[numeric_cols])` → viết lại mô tả không-code (fit→transform khái niệm); hints level 2-4 vẫn giữ code.

### Component mới tái dùng được
- `renderScaleLens` (hero): equalizer σ + demo khoảng cách, toggle raw↔scaled 1 nút lật cả 2 khối, reduced-motion gate transition.
- `scale_select` + `scale_stats` (ml_flow_map result_kind): node compact + scene; scale_stats mode 'transform' (equalizer ngang) / 'verify' (grid mean0/std1).
- Màu 3 feature dùng chung hero+map: --scf-0 sky / --scf-1 green / --scf-2 amber (activity = màu "loud").

### Versions: css v19 · content v15 · shell v22 · flowmap v7.

---

## ĐỢT 11 (2026-07-21) — BÀI 7 "Đọc dữ liệu bằng thống kê cơ bản" (spec C1-L7, M2)

### Spec → shell (user chốt 4 quyết định)
- **Hero = ỐNG KÍNH TƯƠNG QUAN + scatter** (`renderCorrLens` mới): 5 thanh |r| với final_score (study +0.95 · quiz +0.93 · missed −0.75 · attendance +0.60 · student_id +0.03), tô màu theo dấu (dương xanh / âm đỏ / ≈0 xám); bấm 1 thanh → **scatter 200 điểm THẬT** (SVG, chia sẻ trục y=final_score) + **đường xu hướng least-squares** tính client-side + số r. student_id = phản ví dụ (mây tản, đường gần phẳng). Câu đố chốt tương quan≠nhân quả.
- **Dạy sâu "tương quan ≠ nhân quả"** (user chốt): concept card + glossary "TƯƠNG QUAN ≠ NHÂN QUẢ" (ví dụ kem↔đuối nước do mùa hè) + MCQ #3 (phòng đào tạo ép giờ học từ r=0.95 — sai vì biến ẩn) + done-banner hero nhắc lại ví dụ đời + biến ẩn. Đây là thông điệp Risk-pass của grade_lesson7.
- **Ngữ cảnh phòng đào tạo hỏi "yếu tố nào liên quan điểm cuối kỳ?"** (user chốt): Ticket #07, phân tích tương quan 200 SV để trả lời rồi CẢNH BÁO đừng ra chính sách nhân quả. data_preview neo SV thật (20520020 bám trend cao, 20520016 thấp, 20520004 lệch trên).
- **Step 3 = map 3 TRẠM khớp grader** (user chốt): CHỌN 5 cột số (`stat_select` — pick 5 + exclude student_id) → COV (`stat_matrix` mode cov: bảng 5×5 số trần, phụ thuộc đơn vị) → CORR (`stat_matrix` mode corr: **heatmap 5×5 tô màu [−1,1]**, cột final_score tô vàng, đọc study 0.95>quiz 0.93>missed −0.75>att 0.60). Bẫy: numeric_df=df (đưa ID vào) · corr_matrix=numeric_df.cov() (nhầm cov thành corr).

### Engine + grader (có sẵn, khớp spec)
- `load_statistics_dataset` seed 1701, 200 dòng: study/attendance/missed_classes/quiz/final_score tương quan DỰNG CÓ CHỦ ĐÍCH; student_id nhiễu (r≈0.03); corr bất biến khi xáo dòng (shuffle_seed). Số 100% từ engine: r 0.95/0.93/−0.75/0.60, cov(study,final)=7.3, mean/std final 6.15/2.67.
- `grade_lesson7` 4 tầng: numeric_df 5 cột (loại ID) + cov_matrix 5×5 + corr_matrix 5×5 khớp ref.corr() (đường chéo=1); chặn `_has_big_literal` (không chép tay); Risk bắt student_id trong bảng; Behavior xáo dòng (seed 99) corr bất biến; Risk pass = tương quan≠nhân quả. Test server-side: CORRECT 4/4; TRAP_ID risk_ok False "mã số nhiễu".

### Verify — verify_b7.js: 31/31 pass · 0 pageerror (2 lượt sạch)
Hero 5 thanh + scatter 200 circle (auto vẽ study), bấm missed → r−0.75 + riddle mở, sai "đã chứng minh" → feedback biến ẩn, đúng "ĐI CÙNG" → done kem/đuối nước; glossary 6; explorer 6 cột. 3 MCQ (1/3 đọc r âm) + minigame 4 ngăn THUẬN mạnh/vừa/NGHỊCH/VÔ NGHĨA. Map 3 trạm: stat_select (5+1) → cov 5×5 → corr heatmap 5×5 (final vàng, đọc 0.95). Bẫy numeric_df=df → chấm bắt. Step 4: trap ID → Risk "nhiễu vô nghĩa"; bản đúng 4/4 + nhân quả + modal. Regression B1-B6 + Basic + NC sạch. Multi-viewport 1920/1536/1024/768: 5 bars + 200 circles, 0 h-scroll, map fit.

### Component mới tái dùng được
- `renderCorrLens` (hero): thanh |r| + scatter SVG 200 điểm + trend line least-squares client-side; scatter chia sẻ trục y để nhúng gọn (5 mảng x + 1 mảng y = ~3.8KB thay vì 200 cặp × 5).
- `stat_select` (chọn cột phân tích, loại ID) + `stat_matrix` (heatmap 5×5, mode 'cov' số trần / 'corr' tô màu [−1,1] rgba theo |r|, cột highlight vàng) — ml_flow_map result_kind.

### Fix trong đợt
- Không có lỗi hydrate/pill lần này: zone 3 (corr) là câu GÁN (không phải print) nên qua bộ lọc; pill dài `numeric_df = df[[...]]` tự wrap ở ≤900px nhờ rule ĐỢT 10. Scatter 200 điểm mẫu-đầy-đủ (không lấy mẫu 50 — mẫu 50 từng lệch r attendance 0.72 vs full 0.60) để r khớp mọi nơi.

### Versions: css v20 · content v16 · shell v23 · flowmap v8.

---

## ĐỢT 12 (2026-07-21) — BÀI 8 "Vẽ đường dự đoán đầu tiên" (spec C1-L8, M3 — mở màn Hồi quy tuyến tính)

### Spec → shell (user chốt 3 quyết định)
- **Hero = ỐNG KÍNH ĐƯỜNG** (`renderLineLens` mới): scatter 12 điểm thật + đường ŷ=w·x+b + **đoạn lệch residual dọc (cam)**; 2 thanh trượt **ĐỘ DỐC w** & **ĐIỂM CẮT b** kéo live → đường nghiêng/dịch, **TỔNG LỖI (SSE) cập nhật** (init w4/b30 = 925 → nút "đường khớp nhất" w6.6/b25 = 144). Câu đố dự đoán (học 5 giờ → 6.6·5+25=58; bẫy 25=chỉ b, 6.6=chỉ w). Đường clip vào khung (giao với 4 cạnh) để không tràn khi dốc.
- **Bắc cầu MSE/GD bằng câu hỏi mở** (user chốt): hero đo tổng lỗi + nút khớp-nhất để learner tự mò rồi so máy; concept card #3 + done-banner đặt câu hỏi "làm sao MÁY tự tìm w,b tốt nhất?" → Bài 9 đo lỗi (MSE), Bài 10 tự chỉnh (GD).
- **Step 3 = map 3 TRẠM** (user chốt): THAM SỐ (weight,bias định nghĩa đường) → DỰ ĐOÁN (y_pred = weight*x+bias, vectorized) → SO LỆCH (errors = ŷ−y, đoạn residual + tổng lỗi, dẫn Bài 9). `regline` result_kind mới (mode params/predict/residual) — vẽ scatter+đường TỪ table.dataRows (không nhúng lại điểm). Bẫy: quên bias · đảo w,b.

### Engine + grader (có sẵn, khớp spec)
- `load_linear_intro_data()` — 12 điểm quanh y=7x+25 (best-fit thật w=6.6/b=25.5, SSE≈144). y thang 100 (30–80), khác bộ 200 của Bài 7 (bộ demo nhỏ riêng cho hồi quy).
- `grade_lesson8` 4 tầng: cần hàm `predict_score(x, weight, bias)` return w*x+b vectorized; Output [2,5,8]·8·20→[36,60,84]; Risk bắt hard-code (x=[1,2,3] ra y hệt) hoặc quên bias (b=0 vs 55 giống nhau); Behavior bộ ẩn cả **w âm**. Test server-side: CORRECT 4/4, TRAP_bias/TRAP_hardcode → risk_ok False.

### Verify — verify_b8.js: 32/32 pass · 0 pageerror (2 lượt sạch)
Hero: svg 12 circle + đường + 2 slider + nút khớp-nhất; kéo w → eq+SSE đổi + riddle mở; khớp-nhất → 6.6·x+25; đố sai 25 → feedback, đúng 58 → done. Glossary 6; explorer 2 cột. 3 MCQ (w dốc/predict 50/residual −5) + minigame 3 ngăn w/b/ŷ. Map 3 trạm regline (params đường / predict 12 điểm ŷ xanh / residual đoạn cam + tổng lỗi). Bẫy quên bias → chấm bắt. Step4: trap quên bias → Risk; bản đúng 4/4 (bộ ẩn w âm) + Bài 9 MSE + modal. Regression B1-B7 + Basic + NC sạch. Multi-viewport 1920/1536/1024/768: 12 circle + 2 slider, 0 h-scroll, map fit.

### Fix trong đợt
- **Leak check bắt scenario lộ công thức**: step_4.context.scenario từng chứa nguyên `weight * x + bias` (luôn hiện) → suite bắt → viết lại "công thức đường thẳng (nhân trọng số rồi CỘNG bias)". Các bài trước chỉ lộ ở `steps`; lần này lọt ở `scenario` — nhớ soi CẢ scenario/real_world/steps (phần trước "Muốn soi trước").
- regline vẽ TỪ table.dataRows (drag_map.table) → không nhúng lại 12 điểm ở station config (chỉ w,b,mode,note).

### Component mới tái dùng được
- `renderLineLens` (hero): scatter + đường w·x+b + residual + 2 slider live + SSE + nút best-fit + clip đường vào khung.
- `regline` (ml_flow_map result_kind): mode params (đường) / predict (điểm ŷ trên đường) / residual (đoạn lệch + SSE); dùng chung cho cả 3 trạm.

### Versions: css v21 · content v17 · shell v24 · flowmap v9.

---

## ĐỢT 13 (2026-07-21) — AUDIT TOÀN KHÓA CƠ BẢN ML (B1-B8) vs 2 BẢN GIÁO TRÌNH + PUSH experiment

### Phương pháp (user chốt)
Đọc trọn 2 bản giáo trình user làm: **ML_Curriculum_Course_1_2_3_Revised_with_Coverage_Audit.pdf** (L1-L8, tr.9-43) + **ML_Exercise_Bank_Courses_1_2_3_Full.pdf** (Course 1, tr.3-62). Đối chiếu 20 keypoint spec (lesson goals, completion rules, misconception feedback, risk checks, API) với nội dung B1-B8 đã build; E2E đầy đủ 4 step cả 8 bài; vá hết → verify → push.

### Kết quả đối chiếu: 17/20 keypoint ĐÃ PHỦ, 3 lỗ hổng + 1 điểm bổ sung → VÁ
- ĐÃ PHỦ: L1 T-E-P + 3-scenario rule/ML + sĩ-số-không-phải-metric + học-viên-mới-không-phải-Experience; L2 output-type matching + cluster IDs tùy ý + 0/1 vẫn categorical; L3 200-samples + future-leakage + raw-vs-X ("DataFrame là cái KHO"); L4 missed_classes count + major encoding; L5 CẮM CỜ; L6 scaling-không-xóa-outlier; L7 mean-vs-spread + caveat "tuyến tính"; L8 w âm (step 4).
- VÁ 1 (L6): misconception spec "standardized values có thể ÂM" chưa dạy → glossary STANDARDSCALER thêm "giá trị DƯỚI trung bình cho z ÂM — bình thường, không phải lỗi" + out "z có thể âm hoặc >1".
- VÁ 2 (L8): lesson goal #4 "unconstrained line may predict outside 0-100" chưa dạy → concept card 1 thêm "ŷ=8·x+20, x=12 → 116 vượt thang 100; đường thẳng cứ thẳng mãi".
- VÁ 3 (L8): spec "bias không phải error term / social bias" chưa dạy → glossary BIAS thêm "⚠ KHÔNG phải 'thiên vị' hay sai số — chỉ là tham số vị trí".
- VÁ 4 (L8, MS-2 weight SIGN): hero slider w_min 0→−4 cho kéo w ÂM (renderLineLens vốn xử lý được — lineSeg giao 4 cạnh); glossary WEIGHT thêm "w ÂM → đường đi XUỐNG". Probe: w=−2 → đường lộn ngược, SSE 14 858 vs 144 (dạy fit tồi bằng mắt).

### E2E toàn khóa: 253/253 pass · 0 fail · 0 pageerror
B1 32/32 · B2 31/31 · B3 32/32 · B4 30/30 · B5 31/31 · B6 34/34 · B7 31/31 · B8 32/32 (chạy 4 batch, restart Flask giữa batch tránh rate-limit 50/giờ). Content v18.

### Deviations đã được user duyệt từ trước (KHÔNG phải lỗi)
Hero lens thay "guided visual 3-screen" spec (user chốt từng bài); B1 tuần-3→giữa-kỳ tuần 7/8 (đợt 4); B4 MCQ cột thật thay completed_courses/download_speed giả (đợt 8); B7 step-3 3-trạm thay 4-round (user chốt, mean/var vẫn phủ ở glossary); exercise-bank ghi activity 0-5000 nhưng curriculum + engine đều 0-2000 (theo curriculum).

---

## ĐỢT 14 (2026-07-22) — BÀI 9 "Đo lỗi model bằng MSE" (spec C1-L9, M3)

### Spec → shell (user chốt 3 quyết định)
- **Hero = ỐNG KÍNH CHI PHÍ** (`renderCostLens` mới): scatter 12 điểm + đường; mỗi lỗi → **Ô VUÔNG diện tích = lỗi²** (rect side = |residual| px → area ∝ error²); đồng hồ MSE sống (xanh thấp / đỏ cao); nút đổi **đường A (8x+20, MSE 20.9) ↔ B (4x+45, MSE 127.6)** — A ô nhỏ xanh, B ô to vống đỏ; dải **cancellation** (−8/+8 cộng = 0 nhưng bình phương → MSE 64); RMSE = √MSE (A 4.6 · B 11.3 điểm). Câu đố chốt "tổng CÓ DẤU ≈ 0 ≠ hoàn hảo" (spec Step 1).
- **Map = 3 TRẠM** (user chốt): LỆCH (errors = pred − actual, đoạn cam) → BÌNH PHƯƠNG (squared = errors², ô vuông) → TRUNG BÌNH → MSE (mse = squared.mean() + so A/B bằng 2 thanh). `mse_step` result_kind mới (mode residual/squared dùng lại .mlf-reg-* + compare = 2 thanh MSE A/B, A best xanh). Bẫy: quên bình phương (errors.mean → triệt tiêu) · abs (MAE).
- **Dạy cả 2** (user chốt): phạt-lỗi-lớn (ô vuông to) + đơn vị điểm² → RMSE (glossary + concept card + meter hiện √).

### Engine + grader (có sẵn, khớp spec)
- `load_mse_demo()` — actual (12 điểm), pred_a (8x+20), pred_b (4x+45). MSE_A 20.9 < MSE_B 127.6 (tính live, số 100% thật).
- `grade_lesson9` 4 tầng: cần `mean_squared_error(actual, predictions)`; Risk dùng bộ bất đối xứng [0,0,0]/[3,-1,2] → MSE 14/3, bắt **MAE** (=2) và **lỗi có dấu triệt tiêu** (=4/3); Output MSE_A<MSE_B; Behavior mảng ẩn dài 5/17. Test server-side: CORRECT 4/4 · TRAP_MAE/TRAP_signed → risk_ok False đúng thông điệp.

### Verify — verify_b9.js: 33/33 pass · 0 pageerror (2 lượt sạch)
Hero: 12 circle + 12 rect + 2 tab + meter + cancel; A→MSE 20.9/RMSE 4.6, đổi B→127.6 đỏ + riddle mở; đố sai "tổng≈0=hoàn hảo" → fb triệt tiêu, đúng "Sai—triệt tiêu" → done. Glossary 6; explorer 2 cột. 3 MCQ (residual +5 · vì sao bình phương · MSE 16.67) + minigame 3 ngăn MSE/TRIỆT TIÊU/MAE. Map 3 trạm (residual đoạn cam / squared 12 ô vuông / compare 2 thanh A best). Bẫy errors.mean() → chấm bắt. Step4: trap MAE → Risk; bản đúng 4/4 (mảng ẩn) + Bài 10 GD + modal. Regression B1-B8 + Basic + NC sạch. Multi-viewport 1920/1536/1024/768: 12 circle + 12 rect, 0 h-scroll, map fit.

### Fix trong đợt
- **renderCostLens dùng `esc(` (hàm của ml_flow_map, KHÔNG có trong lesson_db_design.js)** → PAGEERROR "esc is not defined", rect=0. Các giá trị là số (w,b,cancel) → thay bằng raw (không cần escape). GHI SỔ: shell dùng `escapeHtml`, ml_flow_map dùng `esc` — không lẫn.
- Flask treo giữa chừng (page.goto /login timeout dù curl 200) sau nhiều lượt chạy trong phiên → RESTART sạch là hết (khác 429: 429 trả nhanh, treo là hang). Ghi sổ cùng nhóm gotcha rate-limiter.

### Component mới tái dùng được
- `renderCostLens` (hero): scatter + đường + ô vuông lỗi² + đồng hồ MSE + đổi nhiều đường + cancellation strip.
- `mse_step` (ml_flow_map result_kind): mode residual (đoạn) / squared (ô vuông) / compare (2 thanh MSE, best xanh) — vẽ từ table.dataRows.

### Versions: css v22 · content v19 · shell v25 · flowmap v10.

---

## ĐỢT 15 (2026-07-22) — BÀI 10 "Gradient Descent — model tự chỉnh đường" (spec C1-L10, ĐÓNG chương M3)

### Spec → shell (user chốt 3 quyết định)
- **Hero = PHÒNG TẬP GRADIENT DESCENT** (`renderGdLens` mới): 2 panel — trái scatter 40 điểm + đường ŷ=w·x+b, phải LOSS CURVE. Thanh **LEARNING RATE** + 3 preset (🐌 quá NHỎ 0.002 · ✅ VỪA 0.02 · 💥 quá LỚN 0.04) + nút **▶ Train** chạy 60 bước GD **live trong JS** (khớp compute_gradients: 2·mean(err·x), 2·mean(err)): đường TỰ nhích về khớp, loss curve tụt. α vừa → mượt (hội tụ xanh), α lớn → loss VĂNG lên kịch trần (💥 PHÂN KỲ đỏ, đường w=−105 văng khỏi khung). Reduced-motion → chạy đồng bộ. Câu đố chốt "vì sao TRỪ chứ không CỘNG" (gradient chỉ hướng TĂNG → trừ = đi ngược).
- **Khép trilogy M3 rõ** (user chốt): story Ticket #10 "KHÉP CHƯƠNG M3" nối B8 (chọn tay w,b) → B9 (đo MSE) → B10 (GD tự hạ MSE); concept card #3 + done-banner + success tổng kết "đường → MSE → GD = cách gần như MỌI model học" + mở sang M4 phân loại.
- **Step 3 = map 3 TRẠM** (user chốt): GRADIENT (regline residual w=2,b=5 đường tệ — "đo độ dốc chi phí") → UPDATE (regline w=5.5,b=12 đường nhích về khớp — "trừ lr×grad đi NGƯỢC") → LẶP+LOSS (`gd_curve` mới — chạy GD live từ table 200 bước, loss curve tụt 887→26, đường cuối ŷ=9.8·x+11). Bẫy: cộng thay trừ (phân kỳ) · gõ tay loss.

### Engine + grader (có sẵn, khớp spec)
- `load_gradient_data` (40 điểm, đường thật ~8x+20, variant 777=~5x+30) + `compute_gradients` + `compute_mse`. Số thật: lr 0.002 quá nhỏ (60 bước 2816→64), 0.01-0.02 vừa (887→48 / 69→35), 0.04 phân kỳ (→345 757); reference lr=0.01/200 → 887→26.
- `grade_lesson10` 4 tầng: cần vòng lặp gọi compute_gradients + update phép TRỪ learning_rate×gradient (bắt CỘNG=plus_bad), loss_history==steps hội tụ (cuối<đầu×0.5); Risk bắt w,b=0 chưa update / loss hard-code; Behavior variant ẩn hội tụ. Test server-side: CORRECT 4/4, TRAP cộng→fail output/behavior, TRAP hardcode→fail code.

### Verify — verify_b10.js: 34/34 pass · 0 pageerror (2 lượt sạch)
Hero: 2 svg + lr slider + 3 preset + Train; Train (reduced-motion sync) → loss curve polyline + 60 bước + hội tụ + riddle mở; preset 💥 → is-diverged + PHÂN KỲ; đố sai Cộng → feedback, đúng NGƯỢC → done khép chương. Glossary 6; explorer 2 cột. 3 MCQ (hướng update GIẢM w / chẩn lr phân kỳ / số học 2−0.1·(−10)=3) + minigame 3 ngăn lr. Map 3 trạm: gradient residual → update residual → gd_curve loss (887→26). Bẫy cộng → chấm bắt. Step4: trap cộng → fail; bản đúng 4/4 (variant ẩn hội tụ) + modal khép chương + Bài 11 sigmoid. Regression B1-B9 + Basic + NC sạch. Multi-viewport 1920/1536/1024/768: 2 svg + 3 preset, 0 h-scroll, map fit.

### Fix trong đợt
- Suite fail 1 (33/34) do THỨ TỰ test: check "nhắc khép chương" chạy TRƯỚC khi success modal hiện (message nằm trong modal xuất hiện sau ~1.6s) → đổi sang check SAU modal-open. Không phải bug lesson (screenshot xác nhận modal đủ chữ).
- Ghi sổ (visual honest): map loss curve lr=0.01 có cú tụt đầu rất dốc (gradient khổng lồ ở w=0: 3475→887→69 trong ~5 bước) rồi phẳng dài — ĐÚNG bản chất GD, giữ khớp reference 887→26; hero dùng lr=0.02/60 cho đường cong mượt làm bề mặt dạy chính.

### Component mới tái dùng được
- `renderGdLens` (hero): GD live JS + scatter/đường/loss-curve 2 panel + lr slider + presets + Train animate (setTimeout 32ms, reduced-motion sync) + diverge detect + clip đường.
- `gd_curve` (ml_flow_map result_kind) + helper `gdRun(lr,steps)` chạy GD từ table.dataRows → loss curve; dùng lại .mlf-reg-head/.mlf-reg-svg.

### Trạng thái khóa: Course 1 cơ bản 10/15 bài xong (M1-M2-M3 trọn). Versions: css v23 · content v20 · shell v26 · flowmap v11.

---

## ĐỢT 16 (2026-07-22) — BÀI 11 "Vì sao Linear Regression không phân loại được" (spec C1-L11, MỞ MÀN M4)

### Spec → shell (user chốt 3 quyết định)
- **Hero = ỐNG KÍNH XÁC SUẤT VÔ LÝ** (`renderLinregAudit` mới): scatter 60 nhãn 0/1 (32 Rớt hàng y=0 · 28 Đậu hàng y=1), dải xanh **[0,1] = xác suất hợp lệ**, hai vùng đỏ ngoài dải, đường fit ŷ = 0.1386·x − 0.1861 **thò khỏi dải ở cả hai đầu**, 12 marker probe (đỏ khi ngoài dải) + **thanh trượt x** với phán quyết realtime. Mặc định x=14 → 1.75 → "❌ KHÔNG phải xác suất — 175% ?!"; kéo vào vùng hợp lệ mới **mở câu đố** (3 lựa chọn: BỊ CHẶN đúng · "rất chắc chắn đậu" · "làm tròn về 1.0"). Chọn "làm tròn" → phản hồi *clip = giấu triệu chứng*; chọn đúng → done-banner mở sang sigmoid Bài 12.
- **Đủ cả 3 kênh dạy** (user chốt): MCQ + concept card + câu đố hero cùng đánh vào một ý — output không bị chặn thì không thể là xác suất.
- **Step 3 = map 3 TRẠM** (user chốt): FIT (`linaudit` mode fit — đường trên nhãn 0/1, "fit không lỗi") → OUTPUT THÔ (mode probe — 12 marker, đếm **3 điểm < 0 · 3 điểm > 1**) → THRESHOLD (mode threshold — ngưỡng 0.5, ranh giới x≈4.95, note *có nhãn dùng được nhưng không có xác suất tin được*). Bẫy: `np.clip(...)` (giấu triệu chứng) và `LogisticRegression` (né bài — bài này phải fit đúng model "sai" đó).

### Số thật từ engine (không có số bịa)
60 dòng train → `ŷ = 0.1386·x − 0.1861`; 12 probe → `[−0.46, −0.26, −0.12, 0.02, 0.23, 0.44, 0.58, 0.78, 0.99, 1.27, 1.48, 1.75]` = **3 dưới 0, 3 trên 1**; ranh giới quyết định x ≈ 4.95. Demo outlier (thêm x=30, y=1): hệ số 0.139 → 0.075, ranh giới 4.95 → 5.45, sai lớp 5 → 7.

### Grader
`grade_lesson11` 4 tiêu chí. Test server-side: CORRECT → 4/4; TRAP `np.clip` → **Risk fail** ("giấu triệu chứng"); TRAP `LogisticRegression` → **code fail** ("phải fit đúng model 'sai' đó").

### Verify — verify_b11.js: 35/35 pass · 0 pageerror (2 lượt sạch, lượt 2 sau khi vá shell ĐỢT 17)
Step 1: title + Ticket #11 + 1.75/−0.46; glossary 6; hero svg + 60 điểm + 12 marker + slider, riddle ẩn; x=14 → verdict ❌ + đếm 3/3; kéo x=5 → ✅ + riddle mở; sai "làm tròn" → feedback clip; đúng "BỊ CHẶN" → done sigmoid + khóa lựa chọn; explorer 2 cột. Step 2: 3 MCQ + minigame 2 ngăn. Step 3: 4 node branch + 3 zone + 5 khối, 3 trạm đúng số, bẫy clip → chấm bắt sai. Step 4: CÁC BƯỚC không lộ code, trap clip fail, bản đúng 4/4, modal nhắc Bài 12. Regression B1-B10 ML + Basic B1 + NC nc_01 sạch. Multi-viewport 1920/1536/1024/768: hero svg + slider trong màn, riddle mở đủ 3 lựa chọn, 0 h-scroll, map fit + Run trong màn.

### Component mới tái dùng được
- `renderLinregAudit` (hero): dải hợp lệ + vùng ngoài dải + scatter nhị phân + đường + marker probe + slider phán quyết + câu đố có mồi bẫy.
- `linaudit` (ml_flow_map result_kind) 3 mode fit/probe/threshold, dùng lại `.mlf-reg-head`/`.mlf-reg-svg`.

---

## ĐỢT 17 (2026-07-22) — VÁ SHELL: cảnh biểu đồ trong map bị cắt đáy (B8/B9/B10/B11)

**Phát hiện bằng cách tự soi ảnh chụp của chính mình** (không phải suite bắt được — suite chỉ kiểm sự tồn tại trong DOM).

- **Triệu chứng**: `.mlf-stage-body { max-height: 200px }` (chỉnh cho BẢNG NGUỒN lúc idle) trong khi SVG cảnh render ~277px → **~28% đáy rơi vào vùng cuộn**: mất trục x, mất các điểm y thấp, và ở Bài 11 **mất luôn nửa bằng chứng "3 điểm < 0"** — chip nói có 3 điểm dưới 0 nhưng người học không nhìn thấy điểm nào.
- **Chẩn sai lần 1**: nới thân lên 300px → vẫn cắt, và cắt NHIỀU HƠN ở màn rộng (112px @1920 vs 29px @1024). Lý do: chiều cao SVG = bề rộng cột × tỉ lệ viewBox, nên chặn theo pixel trên THÂN không bao giờ đủ.
- **Vá đúng**: chặn thẳng trên SVG — `.mlf-reg-svg { max-height: 276px }` + thân 320px cho cảnh biểu đồ (`:has(.mlf-reg-svg)`, giữ nguyên 200px cho bảng nguồn). `preserveAspectRatio` mặc định (meet) thu nhỏ TRỌN nội dung vào khung: không méo, không cắt, đúng ở mọi bề rộng cột.
- **Vá kèm**: nhãn trục y trên cùng đè tiêu đề trục (số `90` chồng chữ `final_score` ở B8/B9) — nới `padT` và đưa tiêu đề lên hàng riêng (`y=11`) ở cả 4 họ cảnh regline/mse/gd_curve/linaudit.
- **Verify**: cảnh hiện TRỌN (kiểm nhãn trục x nằm trong thân) **12/12** = B8/B9/B10/B11 × 1920/1536/1024, cột map vẫn fit, nút Run vẫn trong màn, 0 h-scroll, 0 pageerror. Suite B11 chạy lại sau vá: 35/35.
- **Bài học**: verify bằng suite DOM là chưa đủ cho component trực quan — phải **tự mở ảnh chụp ra nhìn**, và nhìn đúng cái phần tử đang dạy (ở đây là nửa dưới của biểu đồ).

### Trạng thái khóa: Course 1 cơ bản 11/15 bài xong (M1-M2-M3 trọn + M4 mở màn). Versions: css v25 · content v21 · shell v27 · flowmap v13.
