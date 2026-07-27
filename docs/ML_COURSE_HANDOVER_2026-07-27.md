# BẢN CHUYỂN GIAO — Hạ tầng & công nghệ khóa ML (Course 1 cơ bản, 15 bài)

> Mục đích: để thành viên khác **tiếp tục dựng khóa Trung cấp (Course 2) và Nâng cao (Course 3)**
> bằng đúng bộ khung, component và quy trình đã dùng cho 15 bài cơ bản.
> Trạng thái: Course 1 cơ bản **15/15 bài XONG** (M1–M5), đã audit 4 chiều, commit local nhánh `experiment`.

---

## 0. TL;DR — người mới cần biết ngay

- Mọi bài ML **tái dùng chung một "shell" 4 bước** của khóa DB Design (`templates/lesson_db_design.html`
  + `static/js/lesson_db_design.js` + `static/css/lesson_db_design.css`). Bài ML = **1 object dữ liệu**
  trong `static/js/lesson_content_ml.js`, KHÔNG viết trang riêng.
- Mỗi bài có **4 bước cố định**: ① Lý thuyết (hero + glossary + concept cards) · ② Trắc nghiệm (3 MCQ +
  1 mini-game) · ③ Kéo-thả "map 3 trạm" · ④ Tự code (Python thật chấm bằng Pyodide).
- **Engine số thật** ở `static/py/ml_lab.py` (các hàm `load_*`), **grader** ở `static/py/ml_grader.py`
  (`grade_lessonN`). Mọi con số hiển thị PHẢI tính được từ engine — không bịa.
- Quy trình 1 bài: **nghiên cứu spec + engine/grader → HỎI user 3 câu thiết kế → build → verify
  (Playwright ×2 sạch + đa viewport + TỰ SOI ẢNH) → commit local → báo cáo → CHỜ DUYỆT.**
- Chạy local: `python app.py` (cổng **9000**), Playwright cần `NODE_PATH=d:/PE_test/node_modules`.

---

## 1. Kiến trúc shell (4 bước)

**File:** `templates/lesson_db_design.html` (khung + slot), `static/js/lesson_db_design.js` (toàn bộ
logic render 4 bước), `static/css/lesson_db_design.css` (style). Route: `/lesson/<course_id>`
(`routes/main.py`), ML dùng `?course=ml` → `data-course="ml"` → CSS `.course-ml`. `?lesson=N` là **1-based**.

**Các slot của Bước 1** (theo thứ tự dọc, đều data-driven từ object bài học):
```
#story-banner       ← story {tag, hook}         (dải ticket kể chuyện xuyên khóa)
#you-will-learn     ← step_1.you_will_learn      (3 outcomes "Xong bài này bạn sẽ…")
#ml-glossary        ← step_1.glossary[6]         (6 thẻ định nghĩa thuật ngữ — CHUẨN: đúng 6)
#lesson-hero        ← step_1.<hero lens cfg>     (1 component tương tác/bài — xem §3)
#concept-cards-hero ← step_1.concept_cards[3]    (3 thẻ khái niệm)
TableExplorer       ← step_1.visual.schema/data  (bảng dữ liệu cột + preview)
mission             ← step_1.mission
```
Bước 2/3/4 render từ `step_2` / `step_3` / `step_4` tương ứng.

**Điểm khớp bắt buộc** (nếu bỏ sót → hỏng lặng): xem §3 (guard hero) và §6 (hydrate step-3).

---

## 2. Mô hình dữ liệu 1 bài (`lesson_content_ml.js`)

Mỗi bài là 1 object trong mảng `ML_COURSE_CONTENT.lessons`, id `c1_lN` (Course 1, lesson N).
Khung đầy đủ (copy từ 1 bài gần nhất, vd `c1_l15`, rồi thay nội dung):

```js
{
  id: 'c1_lN', index: N, title, subtitle, module, module_title,
  estimated_minutes: 19, xp_reward: 50, drag_type: 'chip', challenge_type: 'full_ide',
  story: { tag: '🎯 StudyLab · Ticket #NN · <MỐC MODULE>', hook: '…' },
  achievement: { name, desc },
  step_1: {
    you_will_learn: { lead, outcomes: [3] },
    glossary: [6],            // { term, vi, accent, def, ex, out }
    primer: { goal:[3], intro:'', example },
    intro, concept_cards: [3],// { icon, title, body }
    <hero_lens>: { … },        // 1 trong các cfg ở §3
    visual: { schema:{table_name, columns[]}, data_preview:[] },
    mission
  },
  step_2: { mcq: [3], mini_game: {…} },
  step_3: {
    ml_pipeline: true,
    blocks: [ {type:'py', token, slot} × (3 đúng + 2 bẫy) ],
    drop_zones: [ {id, accepts:['py'], multi:false} × 3 ],
    ml_flow: { brand, layout:'branch', run_label, source, done_note, stations:[3] },
    expected_sql, expected_zones:{…}, reveal_hints:{…}
  },
  drag_map: { brand, table_sub, idle_sub, run_label, table:{name, columns, dataRows} },
  step_4: {
    prompt,
    context: { scenario, real_world, steps:[4], hint_explore, expected },
    hints: [4],               // level 1-4, level 4 = đáp án đầy đủ
    grader_fn: 'grade_lessonN', success_message, xp_reward
  }
}
```

Thêm bài mới: chèn object trước dòng stub `{ id: 'c1_l(N+1)', … }` và XÓA stub tương ứng
(để tránh trùng id — 2 object cùng id sẽ tạo bài rác ở index đó).

**Bump version** trong `templates/lesson_db_design.html` mỗi khi sửa asset (bust cache):
`lesson_content_ml.js?v=…`, `lesson_db_design.js?v=…`, `ml_flow_map.js?v=…`, `lesson_db_design.css?v=…`.

---

## 3. Họ "hero lens" — 1 component tương tác/bài

**Mỗi bài có đúng 1 hero** render vào `#lesson-hero`, viết trong `lesson_db_design.js`.
Thêm 1 lens cần **3 chỗ khớp nhau**:

1. **Hàm render** `renderXLens(mount, cfg)` — vẽ SVG/HTML từ `cfg`, gắn event (slider, toggle, riddle).
2. **Guard** (`renderLessonHero()`, ~dòng 2011): thêm `|| s1cur.x_lens` vào điều kiện `return` để
   guard KHÔNG ghi đè hero khi bài có lens (nếu quên → hero bị xóa trắng).
3. **Dispatch** trong `renderStep1()`: thêm nhánh `else if (s1.x_lens) { renderXLens(#lesson-hero, s1.x_lens); … }`.

**Kho lens đã có (14 bài)** — dùng lại hoặc tham khảo pattern:
| Bài | Lens cfg key | Ý tưởng tương tác |
|---|---|---|
| B1 | `paradigm_visual` | luật vs pattern |
| B3 | `table_lens` | DataFrame trong mắt model |
| B4 | `dtype_lens` | kiểu lưu trữ vs nghĩa |
| B5 | `quality_lens` | 4 loại lỗi dữ liệu |
| B6 | `scale_lens` | equalizer âm lượng + demo khoảng cách |
| B7 | `corr_lens` | 5 thanh \|r\| + scatter 200 điểm (auto-scale trục y) |
| B8 | `line_lens` | kéo w,b — đường sống trên scatter |
| B9 | `cost_lens` | lỗi thành ô vuông diện tích, đồng hồ MSE |
| B10 | `gd_lens` | phòng tập GD (lr slider + Train chạy live JS) |
| B11 | `linreg_audit` | scatter 0/1 + đường thò khỏi [0,1] |
| B12 | `sigmoid_lens` | máy ép x→z→p + lớp phủ đường thẳng B11 |
| B13 | `boundary_lens` | canvas 2D + w1/w2/bias xoay/tịnh tiến (half-plane clip) |
| B14 | `complexity_lens`| thanh bậc morph đường + 2 đồng hồ train/check MSE |
| B15 | `split_lens` | 3 phòng Train/Val/Test (HTML card) + toggle rò rỉ |

**Nguyên tắc vẽ hero (rút ra qua 15 bài):**
- **Real numbers**: mọi số/điểm nhúng phải tính từ engine (§4). Với dữ liệu lớn, nhúng mảng đã tính
  sẵn (vd corr_lens 200 điểm) — nhưng phải khớp seed engine để r = hero = grader.
- **Câu đố (riddle)** ẩn ban đầu, mở sau khi user tương tác (kéo slider/toggle) → chống bỏ qua.
  Chọn đúng → done-banner; sai → feedback theo từng đáp án sai.
- **Trục biểu đồ auto-scale theo data** — TUYỆT ĐỐI không hardcode ymax (bug đã gặp ở corr_lens:
  hardcode ymax=10 làm scatter vỡ khi đổi thang final_score sang /100).
- **A11y**: `:focus-visible` cho control, `prefers-reduced-motion` cho animation (vd gd_lens chạy
  đồng bộ thay vì animate khi reduced-motion).

---

## 4. Engine số thật + Grader (Pyodide)

**Engine** `static/py/ml_lab.py`: mỗi bài có 1+ hàm `load_*` trả DataFrame/array + đôi khi model
helper (`SimpleRegressor`, `SimpleClassifier`, `fit_polynomial_model`, `compute_mse`,
`compute_gradients`…). Nhiều loader nhận `variant`/`shuffle_seed` để grader tạo **dataset ẩn** bắt
hard-code. Seed cố định (vd 1701, 1901…) → số tái lập.

**Grader** `static/py/ml_grader.py`: `grade_lessonN(user_code)` chấm **4 tầng** trả bool + msg:
- **code** (AST): có đúng hàm/vòng lặp/phép toán cần thiết (vd `X @ w`, `def sigmoid`, 2× `train_test_split`).
- **output**: chạy code người dùng, so kết quả với tham chiếu tính từ engine.
- **risk**: bắt **"unsafe-but-correct"** — code chạy đúng shape/số nhưng SAI bản chất (leakage,
  so score với 0.5 thay vì xác suất, chọn theo train MSE, clip thay sigmoid…). Đây là **linh hồn**
  của khóa: mỗi bài có 1 cạm bẫy "đúng mà sai".
- **behavior**: chạy lại trên dataset ẩn/variant/threshold khác → bắt hard-code.

`overall_pass = code & output & risk & behavior`. Pyodide worker (`ml_worker.js`) preload
`numpy, pandas, scikit-learn`.

**Bẫy trong Step-3 (blocks slot t1/t2)** nên khớp đúng 2 case mà tầng Risk (hoặc Code) của grader
chặn — để "kéo bẫy vào map" và "gõ bẫy ở step-4" cho cùng một bài học.

**Doctrine real-numbers:** trước khi viết content, chạy engine bằng Python tính TẤT CẢ số sẽ hiển thị.
Khi audit, đối chiếu ngược. (Trong đợt audit: agent đề xuất "67.8" nhưng engine thật = 67.749→67.7 —
LUÔN verify đề xuất bằng engine, đừng tin số bằng mắt.)

---

## 5. Map "3 trạm" (Step 3) — `ml_flow_map.js`

Bước 3 là 1 "pipeline map": nguồn dữ liệu → **3 trạm** (mỗi trạm 1 zone kéo-thả 1 dòng code) →
mỗi trạm có 1 "scene" trực quan (`result_kind`). File `static/js/ml_flow_map.js`:
- `cfg = lesson.step_3.ml_flow`, `table = lesson.drag_map.table`.
- Mỗi station: `{ zones:[id], icon, label, sub, result_kind, <data>, note, narration }`.
- Thêm 1 scene: thêm nhánh `if (k === 'my_kind')` ở **2 nơi** — hàm node-chip (badge nhỏ trên node)
  và `sceneHTML` (khung lớn khi chạy trạm).

**Scene đã có** (`result_kind`): reg_sum, nearest, clusters, roles_split, type_groups, readiness,
quality_counts, scale_select/scale_stats, stat_select/stat_matrix, regline, mse_step, gd_curve,
**linaudit, sigmoid_pipe, boundary_2d, complexity_fit, split_rooms**.

**Gotcha layout sân khấu:** scene biểu đồ (`.mlf-reg-svg`) và lưới (`.mlf-sgt-grid`) phải để lọt
CẢ biểu đồ LẪN note trong `.mlf-stage-body` — đã chốt `.mlf-reg-svg{max-height:210px}` +
`.mlf-stage-body:has(.mlf-reg-svg,.mlf-sgt-grid){max-height:320px}`. Bảng dài → dùng **lưới ô**
(vd sigmoid_pipe table) thay vì bảng cuộn.

---

## 6. Hydrate Step-3 (gotcha quan trọng)

Khi user tự gõ code ở Step-3, shell tách `ideCode.innerText` theo `\n` và **LỌC BỎ** các dòng bắt
đầu bằng `print(`, `import `, `from `, `#`, `--`; yêu cầu `pyLines.length >= số zone`. Hệ quả:
- **Token của một zone TUYỆT ĐỐI không được là `print(...)` / `import ...`** (sẽ bị lọc → hydrate
  fail). Nếu cần dòng "kiểm/niêm phong", dùng `assert …` hoặc gán biến (vd B15 zone 3 dùng `assert`).
- `expected_zones` phải có đúng số token = số `drop_zones`; token khớp CHÍNH XÁC chuỗi.

---

## 7. Quy tắc no-spoiler

`step_4.context` phần **TRƯỚC** chuỗi "Muốn soi trước" (gồm `scenario` + `real_world` + `steps`)
KHÔNG được chứa code đáp án cuối (vd `p = sigmoid(X @ w + b)`, `train_test_split(X, y, test_size=…)`,
`>= 0.5).astype`, `min(results, key=…)`). Mô tả bằng **khái niệm**. `hints[]` (nhất là level 3-4)
được phép chứa code — đó là chỗ để lộ dần.

---

## 8. Quy trình build 1 bài (bắt buộc)

1. **Nghiên cứu**: đọc spec 2 PDF (`docs/ML_Curriculum_*` + `docs/ML_Exercise_Bank_*`, dùng PyMuPDF —
   `pdftoppm` không có trên máy), đọc engine `load_*` + grader `grade_lessonN` của bài, **chạy Python
   tính trước mọi số thật** (+ trường hợp bẫy/outlier).
2. **HỎI user 3 câu thiết kế** (AskUserQuestion): (a) hero lens nào, (b) nội dung nhấn gì (đủ
   micro-skill + misconception của spec), (c) mạch map 3 trạm. **Không tự quyết — user chốt.**
3. **Build**: clone khung bài gần nhất → thay content; viết renderXLens + guard + dispatch; viết
   scene ml_flow_map; thêm CSS; bump version.
4. **Test grader server-side** (Python): đáp án `hints[3]` → 4/4; 2 bẫy → fail đúng tầng.
5. **Verify E2E**: viết `verify_bN.js` (Playwright) chạy trọn 4 step + regression các bài trước +
   Basic + NC. Chạy **≥2 lượt sạch**. Đa viewport 1920/1536/1024/768 (hero/map fit, 0 h-scroll).
   **TỰ MỞ ẢNH CHỤP RA NHÌN** hero + từng scene — suite DOM PASS vẫn giấu lỗi trực quan (đã gặp
   nhiều lần: nhãn đè, biểu đồ bị cắt, scatter vỡ, nhãn phía sai bên).
6. **Commit LOCAL** (chỉ file bài học, KHÔNG đụng file rác working-tree); báo cáo tiếng Việt; **STOP
   chờ duyệt**. **Push chỉ khi user cho phép rõ ràng, chỉ nhánh `experiment`.**

---

## 9. Chạy & verify (môi trường)

- Flask: `python app.py` → `http://127.0.0.1:9000` (KHÔNG phải 5000).
- **Tiến trình Flask cũ giữ cổng + rate-limiter cạn → route lesson trả 429 GIẢ dù server mới vừa
  chạy.** Luôn `Get-Process python | Stop-Process -Force` rồi mới start.
- Limiter mặc định 50 req/giờ theo IP (in-memory, restart = reset) → **restart Flask trước mỗi suite**.
- Playwright: script ở scratchpad phải chạy với `NODE_PATH=d:/PE_test/node_modules`.
- Login test: POST `/auth/login` `{email:'audit@example.com', password:'AuditPass123'}` với CSRF token.
- Thông báo background task "exit 255/127" khi kill Flask = artifact của kill, không phải lỗi app.
- Có skill `verify` (project) mô tả recipe này.

---

## 10. Schema feature CANONICAL (chốt sau audit — Course 2/3 phải theo)

Mỗi TÊN feature ⇔ MỘT thang, xuyên khóa:
| Feature | Thang | Ghi chú |
|---|---|---|
| `study_hours` | 0–10 (giờ/tuần) | nhất quán mọi bài |
| `attendance` | **% 0–100** | (đã đổi `attendance_rate`→`attendance` ở B6; rescale B7 /10→%) |
| `quiz_score` | **/10** | quiz ngắn — KHÁC midterm |
| `midterm_score` | **/100** | thi giữa kỳ — feature RIÊNG, không lẫn quiz |
| `final_score` | **/100** | mục tiêu hồi quy (đã rescale B7 /10→/100) |
| `missed_classes` | đếm 0–12 | |
| `activity_count` | 0–2000 | (spec ghi 0–5000 — deviation đã duyệt) |
| `pass_fail` | 0/1 (70% Đậu ở bài split) | target phân loại |

**Lưu ý kỹ thuật khi đổi thang:** tương quan `r` BẤT BIẾN với phép ×hằng số → rescale tuyến tính
không phá grader chấm theo corr (vd grade_lesson7). Nhưng phải rescale ĐỒNG BỘ engine + mảng nhúng
content + trục biểu đồ (đừng để hardcode ymax).

---

## 11. Cấu trúc khóa cơ bản (đã xong, để tham chiếu khi nối mạch Course 2/3)

- **M1 — Định khung** (B1 ML vs lập trình · B2 3 loại bài toán · B3 DataFrame X/y)
- **M2 — Dữ liệu sẵn sàng** (B4 kiểu dữ liệu · B5 làm sạch · B6 scale · B7 tương quan)
- **M3 — Hồi quy tuyến tính** (B8 đường dự đoán · B9 MSE · B10 Gradient Descent)
- **M4 — Phân loại Logistic** (B11 vì sao linreg fail · B12 sigmoid · B13 decision boundary)
- **M5 — Tổng quát hóa** (B14 underfit/overfit · B15 train/val/test split)

Story xuyên suốt: **Ticket #01→#15** tại "USTH StudyLab", có mốc MỞ MÀN/KHÉP CHƯƠNG mỗi module.
Mỗi bài đều: 6 glossary · 3 concept card · 3 MCQ · 1 mini-game · map 3 trạm · 1 grader 4 tầng.

---

## 12. Backlog / việc còn mở

- **Course 2 (Trung cấp) & Course 3 (Nâng cao)**: spec đã có trong 2 PDF (`ML_Curriculum_*` +
  `ML_Exercise_Bank_*`, phần Course 2/3). Engine nhiều bài đã có sẵn trong `ml_lab.py` (kiểm trước).
- Trophy / COURSE_MILESTONES cho khóa ML (hiện dùng của DB Design).
- Card robot khóa ML ở trang course-page.
- Dọn file chết `lesson_ml.*` (nếu còn).
- File verify (`verify_bN.js`, `vp_bN.js`) đang ở scratchpad — cân nhắc đưa vào repo `tests/`.

---

## 13. Danh mục file chính

| File | Vai trò |
|---|---|
| `templates/lesson_db_design.html` | khung 4-step + slot + version asset |
| `static/js/lesson_db_design.js` | logic render 4 step + **mọi renderXLens hero** |
| `static/js/lesson_content_ml.js` | **15 object bài học** (nội dung + số nhúng) |
| `static/js/ml_flow_map.js` | map 3 trạm + **các scene result_kind** |
| `static/css/lesson_db_design.css` | style shell + mọi lens (`.tlens`, `.mlf-*`, `.<lens>-*`) |
| `static/py/ml_lab.py` | **engine** — `load_*` + model helper |
| `static/py/ml_grader.py` | **grader** — `grade_lesson1..15` (4 tầng) |
| `static/js/ml_worker.js` | Pyodide worker (numpy/pandas/sklearn) |
| `routes/main.py` | route `/lesson/<course_id>` |
| `docs/ML_REWORK_PILOT_BAI1_2026-07-18.md` | nhật ký build từng đợt (ĐỢT 1→28) — chi tiết từng bài |

---

*Tài liệu này là điểm khởi đầu; nguồn chi tiết nhất theo từng bài nằm ở
`docs/ML_REWORK_PILOT_BAI1_2026-07-18.md` (mỗi ĐỢT = 1 bài, có số thật + quyết định user + fix).*
