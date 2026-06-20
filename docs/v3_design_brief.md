# V3 Design Brief — Vietnamese SQL Lesson Redesign

> **Mục đích:** Brief nghiên cứu cho team 3-agent redesign trang `lesson_db_design.html`. Implementers sẽ dùng brief này để design + build.
> **Ngày tạo:** 2026-06-18
> **Author:** Researcher
> **Trạng thái:** Advisory (chưa phải code)

---

## Bối cảnh dự án

- Trang lesson: `D:\PE_test\templates\lesson_db_design.html` (Vietnamese, 4-step pipeline)
- Step 1: Theory (Brilliant-inspired text + schema panel)
- Step 2: MCQ (Duolingo-style)
- Step 3: Drag-query với **Truck Grid 8x6** đã có sẵn trong `static/js/drag_game.js` (~440 dòng)
- Step 4: Pure code editor (LeetCode-style)
- User muốn drag-query step phải "feel" như Brilliant puzzle: có character animate theo code user build

---

## Section 1 — Top 5 Brilliant.org UX patterns áp dụng được cho SQL learning

Brilliant (do studio ustwo thiết kế "Game Feel North Star") có 5 pattern cốt lõi mà họ gọi là **"learn-by-doing"** thay vì "learn-by-reading":

### 1. Interactive visual concept-exploration ("Concepts that click")
**Pattern:** Mỗi concept là một micro-widget user **chạm/thử trực tiếp** được ngay (slider, drag, toggle), không phải đọc giải thích rồi mới làm.
**Áp dụng SQL:** Ở Step 1, thay vì show schema table tĩnh → cho user click vào 1 row để "highlight" nó, kéo slider để lọc theo `genre`, hoặc click header column để sort. Tạo cảm giác "chơi với data" trước khi viết query.
**Ví dụ tham khảo:** Brilliant's "Visual Algebra" — bạn kéo một biến trên trục số, equation thay đổi real-time.

### 2. Step-by-step intuition building ("Work through problems step-by-step")
**Pattern:** Problem được chia thành **3-5 micro-step**, mỗi step là một lựa chọn nhỏ hoặc một tương tác. User không bao giờ bị "frozen" trước blank canvas.
**Áp dụng SQL:** Step 3 đã có 3 drop-zones (SELECT/FROM/WWHERE). Mỗi khi user đặt đúng 1 block → truck di chuyển 1 ô → user thấy ngay "à, FROM là điểm bắt đầu". Đây chính là core của Truck Grid concept — **đã đúng hướng**.
**Ví dụ tham khảo:** Brilliant's "Thinking in Code" — mỗi lesson là một chuỗi micro-puzzle, không phải một bài tập lớn.

### 3. Variable inspector / state panel
**Pattern:** Bên cạnh puzzle luôn có 1 panel hiển thị **state hiện tại** của chương trình (variable values, current position, output buffer). User thấy code → state mapping rõ ràng.
**Áp dụng SQL:** Truck Grid cần thêm 1 panel mini bên cạnh map hiển thị: `current_table = game_catalog`, `selected_cols = [name, price]`, `filtered_rows = 2/4`. Khi truck di chuyển, panel update theo.
**Ví dụ tham khảo:** Brilliant's algorithm puzzles — luôn có "Variables" panel hiển thị `i=3, sum=12, list=[1,5,7]`.

### 4. Whimsical in-lesson celebrations
**Pattern:** Mỗi lần user làm đúng → micro-celebration (particle, character dance, sound chime). Brilliant gọi đây là **"in-lesson flourishes that celebrate success"** — quan trọng để giữ dopamine loop.
**Áp dụng SQL:** Khi user đặt đúng block → truck "vui vẻ" bounce + sparkle. Khi hoàn thành cả query → confetti + truck "đập tay" với output cell. (Drag_game.js hiện đã có confetti nhưng chưa có mid-step micro-celebration.)
**Ví dụ tham khảo:** Brilliant's "correct answer" particle burst, không quá loud nhưng satisfying.

### 5. Reset / Iterate / Try-again as core loop
**Pattern:** Mọi puzzle đều có nút **"Start over"** rất nổi bật. Brilliant muốn user biết rằng **fail là free, thử lại là encouraged**. Đây là chìa khoá giảm "math anxiety" (93% adults bị theo IES study).
**Áp dụng SQL:** Nút "Bắt đầu lại" (đã có trong `lesson_db_design.html` line 280) cần được **làm to và dễ thấy hơn**. Khi user sai → không trừ điểm ngay, mà hiện inline hint ("Thử thêm điều kiện WHERE đi!") rồi cho retry.
**Ví dụ tham khảo:** Brilliant — fail không bao giờ là "game over", luôn là "thử lại với hint".

---

## Section 2 — So sánh 3 game concepts cho drag-query

| Tiêu chí | 🤖 Robot DB City | 🚚 Truck Grid (current) | ⚙️ Pipeline Conveyor |
|---|---|---|---|
| **Engagement** | Cao — robot mascot tạo emotional bond, "peek in windows" là moment tò mò | Trung bình-cao — abstract grid ít emotional, nhưng rõ ràng về logic flow | Trung bình — conveyor ít narrative, dễ nhàm |
| **Cognitive clarity** | Thấp — metaphor "building = table" hơi xa; user phải map nhiều lớp (building → table → window → column) | **Cao** — grid + truck + cells map 1-1 với khái niệm SQL (warehouse = source, output = result). Khớp Brilliant's "state panel" pattern | Trung bình — pipeline dễ hiểu về thứ tự, nhưng FROM/SELECT/WHERE trở thành "stations" mơ hồ |
| **Visual complexity** | Cao — cần vẽ city, building textures, windows, robot animations | Thấp-trung bình — grid + sprite + highlight (đã có sẵn) | Trung bình — cần conveyor belt tiles, station icons, row sprites |
| **Time to implement** | 4-5 ngày (asset city + robot sprite + window logic) | **1-2 ngày polish** (đã có `drag_game.js` 440 dòng) | 3-4 ngày (conveyor animation + station states) |
| **Animation potential** | Cao — robot walk cycle, peek animation, "pick up row" gesture | Trung bình — truck drive + bounce (limited by grid) | Cao — rows chạy trên belt, station reject/accept animation rất satisfying |
| **Fit for lesson context** | Tốt cho **kids/beginner**, nhưng nặng visual có thể làm loãng SQL concept | **Rất tốt** — trực tiếp dạy data flow, học sinh IT sẽ thấy "đây là cách query thật sự chạy" | Tốt cho **intermediate** — cần user đã hiểu SQL cơ bản mới thấy pipeline logic |
| **Reusability across lessons** | Thấp — mỗi bài cần city layout khác nhau (game_catalog vs accounts vs orders...) | **Cao** — grid dynamic, có thể swap table data cho mỗi lesson (đã design sẵn trong code) | Trung bình — cần redesign conveyor cho mỗi schema |
| **Risk** | Scope creep dễ thành "game hay nhưng dạy ít SQL" | Có thể bị chê "không flashy" → cần bù bằng micro-celebrations (Brilliant pattern #4) | Animation belt khó làm mượt nếu dùng CSS only |

---

## Section 3 — RECOMMENDATION: **Truck Grid** (giữ & polish concept hiện tại)

### Lý do (3 bullets):

1. **"Don't fix what works" + Brilliant pattern alignment**: Truck Grid concept **đã có sẵn 440 dòng code hoạt động**, đã implement đúng Brilliant pattern #2 (step-by-step intuition) và #3 (variable inspector hook có sẵn). Robot City và Conveyor sẽ tốn 3-5 ngày rework, trong khi polish Truck Grid chỉ cần 1-2 ngày để đạt Brilliant quality bar.

2. **Pedagogical fit cao nhất cho SQL**: Grid map với Warehouse → columns → filtered rows → Output **ánh xạ 1-1 với data flow thật của SQL execution** (FROM → SELECT → WHERE → result set). Học sinh nhìn truck chạy sẽ hiểu "ah, query là một pipeline vật lý qua data". Robot City dùy-warm nhưng metaphor quá xa (window = column là hack). Conveyor đúng hướng execution nhưng visual nặng, dễ làm loãng concept.

3. **Reusability cho toàn bộ curriculum**: Code hiện tại đã design dynamic (table data swap được theo lesson). Khi Bài 2-12 dùng schema khác (accounts, orders, products...), chỉ cần đổi `DEFAULT_TABLE` constant — không cần redesign city/conveyor. Đây là **architectural advantage** quan trọng nhất.

### Cải tiến cụ thể cần làm khi polish (theo Brilliant patterns):
- **Pattern #1 (interactive):** Click vào 1 data row trên grid → highlight + show "this row would be selected if WHERE genre='Action'"
- **Pattern #3 (state panel):** Thêm mini-panel bên phải map hiển thị `FROM=`, `SELECT=`, `WHERE=`, `rows=2/4`
- **Pattern #4 (celebration):** Mỗi block đặt đúng → truck bounce + 1 spark particle (không đợi cả query xong mới celebrate)
- **Pattern #5 (reset):** Nút "Bắt đầu lại" to hơn, đặt ở góc map, đổi text thành "🔄 Thử query khác"

---

## Section 4 — Mini bar chart / visualization ideas cho Step 1

Step 1 hiện đang là text + schema panel tĩnh. Để match Brilliant "concepts that click", cần thêm visualization tương tác. 5 ideas (từ nhẹ → nặng):

### Idea 1 — **"Row counter" animated bar chart** (đơn giản nhất, đề xuất chính)
- Hiển thị bar chart đếm rows theo giá trị của 1 column (vd: `genre` → "Action": 1, "Action RPG": 1, "Rogue-like": 1, "Card Game": 1)
- User click vào bar → highlight rows tương ứng trong schema table bên cạnh
- **Use case:** Dạy khái niệm "value distribution" và "filtering by value" (tiền đề của WHERE)
- **Effort:** 0.5 ngày (Chart.js inline)

### Idea 2 — **"Primary key sparkle" — animated highlight**
- Khi user hover vào 1 cell trong cột `id` → cell phát sáng + số "số duy nhất" hiện ra ("acc_id = 56 → chỉ tồn tại 1 lần trong bảng")
- **Use case:** Dạy khái niệm Primary Key (UNIQUE constraint) một cách visceral thay vì đọc định nghĩa
- **Effort:** 0.5 ngày (CSS animation + tooltip)

### Idea 3 — **"Column sorter" — drag column header để sort**
- User kéo header `price` lên/xuống → data rows sắp xếp lại theo animation
- **Use case:** Dạy khái niệm "ORDER BY" + "data type" (sort string vs number)
- **Effort:** 1 ngày (sort logic + animation)

### Idea 4 — **"Cardinality donut" — mini donut chart**
- Hiển thị donut chart "Bảng này có 4 rows × 4 columns = 16 cells, trong đó 4 rows là duy nhất"
- Hover vào segment → tooltip giải thích cardinality concept
- **Use case:** Dạy khái niệm "cardinality" / "unique" cho Foreign Key bài sau
- **Effort:** 1 ngày (Chart.js donut)

### Idea 5 — **"Entity-relationship mini-map"** (nặng nhất)
- 2-3 table nhỏ hiển thị cạnh nhau, có đường nối vẽ relationship
- Click vào 1 row ở table A → các row liên quan ở table B highlight
- **Use case:** Setup cho bài Foreign Key / JOIN sau này
- **Effort:** 2-3 ngày (cần build riêng)

### Đề xuất thứ tự implement:
1. **Idea 1 (bar chart)** — dễ nhất, max impact, teach WHERE ngay từ Step 1
2. **Idea 2 (PK sparkle)** — perfect cho bài 1 (Primary Key)
3. **Idea 5** — dành cho bài JOIN/FK sau (không cần làm ngay)

---

## Section 5 — Navigation patterns recommendation

### Hiện trạng:
- **Top progress bar** (line 37-62): 4 dots nối nhau bằng connector, có check icon khi complete
- **Bottom footer** (line 103-124): "Quay lại" / indicator / "Tiếp theo" + keyboard hint `← →`
- **Player card** (line 85-100): floating left, có thể collide với content trên mobile

### Đề xuất: **KEEP BOTH (top + bottom) + add keyboard shortcuts** — đây là pattern chuẩn của LeetCode/Brilliant

#### Lý do giữ cả 2:
- **Top progress bar = "Where am I in the journey"** (sense of position) — user glance nhanh biết mình ở step nào
- **Bottom footer = "What do I do next"** (action zone) — user đã đọc xong Step 1, tự nhiên scroll xuống thấy nút "Tiếp theo"
- Bỏ 1 trong 2 sẽ phá flow: bỏ top → user mất phương hướng; bỏ bottom → user đọc xong không biết bấm gì

#### Cải tiến cụ thể:
1. **Top progress bar → clickable** (hiện đang chỉ visual, không click được): Click vào step đã complete để quay lại. Bước tương lai: cần update JS trong `lesson_db_design.js` để bind click handler
2. **Bottom footer → add keyboard shortcut**:
   - `←` Quay lại step trước (đã có hint ở line 115-117, cần đảm bảo `window.navBack()` handle case ở step 1)
   - `→` Tiếp theo (chỉ work khi current step đã "complete" — vd Step 2 cần trả lời đúng MCQ mới cho next)
   - `1-4` Jump trực tiếp đến step (nếu step đó unlocked) — power user feature
   - `R` Reset drag-query (gọi `window.DragGame.reset()`)
3. **Visual distinction**:
   - Top bar: step **current** = glow + pulse animation
   - Top bar: step **completed** = green check + clickable
   - Top bar: step **locked/future** = grey, không click
   - Bottom: button "Tiếp theo" = disabled state khi chưa complete step
4. **Mobile consideration**:
   - Top bar collapse thành "Step 2/4: Kéo thả" nếu width < 600px
   - Bottom footer sticky luôn hiển thị (đã là sticky theo CSS)

### Don't do:
- ❌ Bỏ top bar vì "có footer rồi" — mất sense of journey
- ❌ Clickable cho future steps (chỉ complete steps) — tránh skip content
- ❌ Floating nav ở giữa — che content
- ❌ Hamburger menu — overkill cho 4 steps

---

## Appendix — Quick reference cho implementers

### File locations:
- HTML: `D:\PE_test\templates\lesson_db_design.html`
- Drag game: `D:\PE_test\static\js\drag_game.js` (existing, Truck Grid concept)
- Lesson content data: `D:\PE_test\static\js\lesson_content.js`
- CSS: `D:\PE_test\static\css\lesson_db_design.css`

### External libs đã load:
- CodeMirror 6 (SQL editor Step 4)
- canvas-confetti (celebration)
- Font Awesome 6
- Google Fonts (Inter + JetBrains Mono)

### Không cần:
- Database (Flask static-friendly)
- Backend changes (trang lesson là pure frontend)
- Auth changes (đã có)

### Có thể cần thêm:
- Chart.js (nếu implement Idea 1/4) — 1 CDN line
- Small CSS tweaks cho micro-celebrations

---

## TL;DR cho Designer + Implementer

1. **Drag-query concept:** Stick with **Truck Grid**, polish theo 4 Brilliant patterns (#1, #3, #4, #5)
2. **Step 1 viz:** Add **"Row counter" animated bar chart** (Idea 1) — ưu tiên cao nhất
3. **Navigation:** Giữ cả top + bottom, **make top clickable cho completed steps**, add keyboard shortcuts `← → R 1-4`
4. **Time budget đề xuất:** 1-2 ngày polish Truck Grid + 0.5 ngày bar chart + 0.5 ngày nav improvements = **~3 ngày total**
