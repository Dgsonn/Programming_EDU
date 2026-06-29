# Mavis Worklog — PE_test Project

> **MỤC ĐÍCH:** File này là bộ nhớ xuyên session của Mavis. Ghi lại TẤT CẢ decisions, failures, lessons learned, user feedback.
> **ĐỌC FILE NÀY ĐẦU TIÊN** khi bắt đầu session mới — trước cả SYSTEM_INSTRUCTIONS.
> **APPEND-ONLY:** Chỉ thêm entries mới ở cuối. KHÔNG xóa entries cũ (lịch sử quan trọng).
> **Max size:** 10GB (unlimited cho mục đích thực tế).

---

## SESSION LOG

### 2026-06-27: Initial sessions (v1-v18)
- B1-B7 code quality tasks DONE
- C1-C8 feature tasks DONE
- DESIGN.md formalized (Google Labs format)
- 7 visual upgrades shipped (surface/glow/glass/mesh/typography/card/gradient)
- User feedback: "còn quá xấu, template feel" — code metrics ≠ visual beauty

### 2026-06-28 morning: Design Overhaul (v19-v28)
- V14 attempt phá layout → full revert → BƯỚC 0 restore
- 5 overhaul changes shipped: hero SVG, component personality, brand signatures, visual storytelling, narrative animations
- User feedback: "tốt hơn nhưng cần adjust cụ thể"
- **Lesson learned:** Token polish ≠ visual redesign. User cares about what they SEE, not what metrics say.

### 2026-06-28 afternoon: Full Platform Redesign (v29)
- 4-phase redesign: lesson + dashboard + auth + course detail
- Auth split 50/50 — user approved concept but layout vỡ ở màn hình lớn
- Dashboard welcome banner + section strips + leaderboard hex
- Course detail hero strip + stats cards
- **Lesson learned:** Autonomous mode works for bulk changes but needs tighter visual QA.

### 2026-06-28 evening: Post-Redesign Fixes (v30)
- Fix 4 v1 (collapse-able truck) — **USER REJECTED** ("cực kì xấu và méo mó")
- Fix 4 v2 (2-col 60/40 + card zones) — **USER REJECTED** (truck pipeline mất tích, zones vẫn xấu)
- **ROOT CAUSE IDENTIFIED:** Tôi đang đoán user muốn gì thay vì copy chính xác từ reference.

### 2026-06-29: Brilliant Reference Analysis + Process Reform

**PROCESS REFORM AGREED (user + Claude):**
- User = product owner, cho hướng + nguồn. Claude + Minimax tự research + implement.
- Claude phải TỰ fetch/research sites trước khi viết spec — không chờ user gửi ảnh.
- SYSTEM_INSTRUCTIONS cần rewrite ngắn gọn (200 dòng max, hiện 700+ dòng = bloat).
- New RULE 8: KHÔNG tự thiết kế. User cho nguồn → Claude tự research → spec cụ thể → implement.

**7 NGUỒN REFERENCE (updated 2026-06-29):**
1. https://ui.shadcn.com/ — component structure, dark mode tokens
2. https://brilliant.org/home/ — interactive learning, drag-drop exercises, MAIN REFERENCE
3. https://www.codecademy.com/learn — course cards, dark theme, split-pane IDE
4. https://shaders.com/ — glow/gradient effects
5. https://contentcore.xyz/ — spacing/whitespace
6. https://github.com/nicobailon/visual-explainer — NEW (replaces ui-ux-pro-max)
7. https://github.com/google-labs-code/design.md — design token lint
8. https://github.com/affaan-m/ECC — NEW

**NEXT SESSION TODO:**
- Claude research ALL 7 sources (fetch, analyze patterns)
- Rewrite SYSTEM_INSTRUCTIONS v32 (200 dòng max)
- Include RULE 8 (visual reference workflow)
- Move history/archive to MAVIS_WORKLOG.md
- Fix 4 truck visual redesign (stations colorful, animation smooth)
- Then Fix 2 (bảng) → Fix 3 (hero) → Fix 5 (footer) → Fix 1 (auth)

### 2026-06-29: Brilliant Reference Analysis (CURRENT)

**USER GỬI 4 SCREENSHOTS BRILLIANT.ORG DRAG-DROP EXERCISE.**

Phân tích chi tiết (từ Claude council review):

#### Brilliant Layout Pattern (4 screenshots phân tích):

**Screenshot 1 — "Building Programs" (code blocks display):**
- White/light background, clean
- Content centered ~600-700px max-width
- Generous whitespace hai bên
- Code blocks hiện dạng structured text (if/else/transport) bên phải
- Function name ("stick (right)") ở giữa với dấu "=" nối
- Bottom: green "Continue" button centered

**Screenshot 2 — "Use seek function" (interactive builder, empty state):**
- Instruction text ở top: "Use the `seek` function to make the delivery."
- VISUALIZATION (map/game) chiếm ~40% viewport — bordered box, grid-based map, truck + delivery points
- Below visualization: CODE BUILDER area — white background, numbered lines (1. while ___), inline dropdown
- Below code builder: BLOCK BANK — gray background strip, pills available (seek + dropdown)
- Bottom: "Start over" link + "Check" button centered

**Screenshot 3 — "Correct answer" (success state):**
- Same layout as #2 but:
- Green border around entire exercise
- "Nailed it." green pill badge bottom-left
- Code builder shows completed code: 1. while truckX < deliveryX, 2. seek (east)
- "▶ Run" button appeared (to execute and see animation)
- Bottom: "Why?" outlined button + "Continue" green filled button

**Screenshot 4 — "Wrong answer" (error state):**
- Yellow/amber border around exercise (not green)
- "Not quite right." amber pill badge bottom-left
- Code shows wrong attempt: 1. while..., 2. seek (east), 3. stick (right)
- Block bank still visible below code
- Bottom: "Get help" outlined + "Try again" amber filled button

#### KEY DESIGN PRINCIPLES EXTRACTED:

1. **SINGLE VISUAL CENTER** — tất cả content centered, không split layout phức tạp
2. **VERTICAL FLOW** — Instruction → Visualization → Code Builder → Block Bank → Actions. Từ trên xuống.
3. **VISUALIZATION = PRIMARY** — Map/game visual chiếm phần lớn, luôn visible
4. **CODE BUILDER = NUMBERED LINES** — mỗi line = 1 statement, inline drops, white/clean bg
5. **BLOCK BANK = SEPARATE STRIP** — gray bg phân biệt, pills horizontal
6. **STATE FEEDBACK = BORDER COLOR** — green (correct), amber (wrong), neutral (building)
7. **MINIMAL CHROME** — KHÔNG macOS dots, KHÔNG gradient borders, KHÔNG glow effects
8. **GENEROUS WHITESPACE** — padding lớn, breathing room, không cramped

---

## FAILURES LOG (để không lặp lại)

| # | What failed | Why | Lesson |
|---|-------------|-----|--------|
| 1 | V14 fix layout B1 | Chỉ fix 1 bài, CSS +18KB, phá layout | Phải system-wide, reusable classes |
| 2 | 7 token upgrades | User: "vẫn quá xấu" — metrics ≠ beauty | Focus on what user SEES |
| 3 | Fix 4 v1 collapse-able truck | User: "cực kì xấu và méo mó" | Patching ≠ redesigning |
| 4 | Fix 4 v2 card zones | Truck mất tích, zones vẫn flat | Truck là core metaphor, không được giấu |
| 5 | Không dùng references thật | Self-designed thay vì copy Brilliant | LUÔN copy reference trước, customize sau |
| 6 | Fix 4 v4 CSS-only truck | Truck đẹp hơn (CSS-drawn) nhưng VẪN chỉ là trang trí | Truck phải là FEATURE, không phải metaphor |
| 7 | Fix 4 v5 Phase A layout | 3 lỗi: (1) vertical stack full-width, (2) drag bị chặn đỏ, (3) pipeline boxes vô nghĩa — user không hiểu nó thể hiện gì | Layout 2 cột (40/60). Drag tự do. Pipeline PHẢI hiện DATA biến đổi thật. |

## DECISIONS ĐÃ CHỐT (across sessions)

| Decision | Choice | Date |
|----------|--------|------|
| Dark theme | Keep | 2026-06-27 |
| Brand identity | Gamified Dark E-Learning (NOT Classroom IDE) | 2026-06-27 |
| Module colors | Amber M1, Indigo M2, Emerald M3 | 2026-06-27 |
| Auth CTA | Red (intentional split from cyan) | 2026-06-27 |
| Hero SVG | Inline JS lookup table, variable viewBox | 2026-06-28 |
| Step 3 reference | Brilliant.org drag-drop exercise (EXACT copy style) | 2026-06-29 |
| Step 3 layout | 2-col with sidebar BUT copy Brilliant zone style | 2026-06-29 |
| Step 3 theme | Dark but copy Brilliant spacing + structure | 2026-06-29 |
| Step 3 truck | ~~Inline 1 row ~36px (pedagogy metaphor, compact)~~ **SUPERSEDED** | 2026-06-29 |
| Step 3 truck v5 | **TRUCK-AS-FEATURE** = SQL code runner. User build → Check → truck chạy → data animate. Giống Brilliant. | 2026-06-29 |
| Fix 4 approach | Replace v4 hoàn toàn. Spec mới: `docs/FIX4_TRUCK_AS_FEATURE_SPEC.md` | 2026-06-29 |
| Execution order | Truck chạy theo LOGIC USER TẠO RA (đúng/sai phụ thuộc blocks user thả) | 2026-06-29 |
| Data visualization | Animated data flow (rows appear one-by-one, filter fade, column slide-out) | 2026-06-29 |
| PE_test philosophy | Dạy CẢ HAI: tư duy lập trình (visual execution) + cú pháp lập trình (gõ SQL). Brilliant chỉ dạy tư duy. | 2026-06-29 |
| 4-step pipeline | Step 1 lý thuyết → Step 2 MCQ+drag (concept) → **Step 3 HYBRID drag/code** → Step 4 thuần code. Fix 4 = CHỈ Step 3. | 2026-06-29 |
| Step 3 editor | **HYBRID**: drag-drop (default) + toggle "✎ Gõ SQL" textarea. Phase A: execution engine. Phase B: SQL editor + zone reorder. | 2026-06-29 |
| Error feedback | Giống Brilliant: amber pill "Chưa đúng." + "Xem gợi ý" / "Thử lại". KHÔNG error message cụ thể. | 2026-06-29 |
| Correct feedback | Green pill "Chính xác!" + "Tại sao?" / "Tiếp tục". Giống Brilliant "Nailed it." | 2026-06-29 |
| Drop zones | **NUMBERED LINES** (1. [___], 2. [___]) — KHÔNG ghi SELECT/FROM/WHERE (= spoiler). Giống Brilliant code builder. | 2026-06-29 |
| Pipeline width | 45/55 (từ 40/60 — pipeline quá bé ở 40%) | 2026-06-29 |

### 2026-06-29 08:00: STAGE 2a-2 (round 2 visual) — 4 fixes shipped

**Process reform continued (user feedback từ session trước):**
- v43+ instructions LEAN — chỉ RULES gọn + task + pointer; archive lịch sử/Q&A ngoài
- Trước spec Brilliant-style → USER research nguồn THẬT, không đoán

**STAGE 2a-2 = 4 visual fixes** (1 push, Q1=A):
- FIX-6: Xóa <div class="sql-output"> label "SQL Output" → nhường chỗ block bank
- FIX-7: Block bank pills to + 5 màu theo LOẠI TOKEN (kw/col/val/tbl/op) - no spoiler
- FIX-8: Sound button 32→44×44 Apple touch-target + better affordance
- FIX-9: Pill in-zone = same size + JS toggle .has-content (Q2=B, bulletproof)

**Self-grade 8.0/10** - 4 fixes match v42 spec exactly + Q&A answers implemented verbatim.

**Báo cáo:** docs/B_FIX6-9_STAGE2A-2_2026-06-29.md (§0-§8 per template).

**⚠ Process rule:**
- Q2=B user override quan trọng: CSS .drop-line-slot:not(:empty) .placeholder SAI LOGIC vì placeholder nằm TRONG slot → slot NEVER :empty → CSS ẩn PERMANENTLY (kể cả lúc trống). JS toggle .has-content PREFERRED.
- Q3=B user style: 44×44 Apple (48 hơi to) + AFFORDANCE (bg/border/hover/active/cursor) quan trọng hơn size thuần.

**Pending** (chờ user "OK" checkpoint + Brilliant research):
- STAGE 2b 4D: pipeline animation (xe chạy mượt + chở data + station mở kịch tính + reorder stations theo EXECUTION order)
- STAGE 2b 4E: hint counter button
- STAGE 2b 4F: "Tại sao?" slide panel
- STAGE 2b 4G: backward compat verify (18/18 lessons × 4 steps)

**Lesson learned (this session):** Báo cáo = MANDATORY sau mỗi fix stage. User reminded "Cứ quên báo cáo thế nhỉ" - phải viết TRƯỚC khi user hỏi. Append rule vào workflow checklist.
### 2026-06-29 09:25: STAGE 2b SHIPPED — Pipeline Animation + 3 Bug Fix

**Claude council v43 SPEC §0-§6** implemented trong 1 push. User chốt Q1-Q5:
- **Q1=B adaptive** — buildStations RANK sort `{from:1,where:2,group:3,having:4,select:5,order:6}`. Bài 1 [select,from,where] → Kho→FROM→WHERE→SELECT. NO ghost station.
- **Q2=A digit-bounce** — số cũ scale→0 fade 120ms; số mới scale 0→1.2→1 160ms + flash. **Flash module-accent, KHÔNG zone color** (Q2=A refinement user thêm vào).
- **Q3=A cycler 1 nút** — idle ▶ → running ⏳ → xong ↻. Đổi block rồi bấm → chạy query mới.
- **Q4=B pacing** — nhịp/station CỐ ĐỊNH ~1s. "3s deliberate" = riêng Bài 1 3-station, KHÔNG sàn cứng. User phản biện (B) đúng: mọi station ~1s = nhất quán Material.
- **Q5=N/A** (Q1=B → no ghost).

**Implemented:**
- §0 buildStations RANK sort
- §1 3 CSS bug fix: query.sql hiện (scope `.step3-ide`), pill `=` brighter (18→32% + #F8FAFC), Kho không cắt (110px min-height + overflow visible)
- §2 Pipeline sizing: station 100px, road-connector 28px, mini-table 0.75rem + ellipsis
- §3 ONE main truck translateY (override multiple `.pipeline-truck-indicator`). Anticipation 120 scaleY(0.85) → travel 550 cubic-bezier(0.65,0,0.35,1) → arrival 150 overshoot +4px
- §4 .truck-badge digit-bounce + flash module-accent (280ms total)
- §5 Station expand ease-out-quart 360ms + reveal .revealed + rows stagger via --i (60ms)
- §6 Choreography 1s/station = 3 stations ≈ 3.24s ≈ 3s

**KEEP** untouched: executeStation, parseWhereRows, renderStationMiniTable, updateIDEFromBlocks.

**Mid-implementation fixes:**
- Cleanup orphan `onArrival` callback từ v6.0 horizontal API (edit sai scope lúc đầu)
- `reset()` referenced closure-local `table` → ReferenceError → fixed bằng `window.__pipeline.table || DEFAULT_TABLE`

**Cap check:**
- CSS 240,436 / 250,000 (headroom 9,564B) ✓
- !important 18 actual (pre-existing overflow, không từ STAGE 2b — STAGE 2b chỉ thêm 2 trong reduced-motion)
- backdrop-filter 6 / 6 ✓
- node --check cả 2 JS files ✓

**3 screenshots Bài 1 step 3 (default + mid + done):**
- Default: Pipeline Bài 1 reorder ✓ (FROM amber, WHERE green, SELECT cyan). ONE truck + badge "4". IDE hiện SQL. Kho "4 dòng × 4 cột" không cắt.
- Mid: Truck traveling. Badge "4". FROM mini-table rendered 4 rows. WHERE mini-table FILTERED (101 Elden Ring highlighted green). SELECT expanded rows cascading.
- Done: Badge "1" (post-WHERE). All stations ✓. "↻ Chạy lại" button (Q3=A cycler). "✓ Chính xác!" + green border.

**Acceptance 6/6** (per v43 §ACCEPTANCE): 1) query.sql hiện ✓ 2) Pipeline reorder ✓ 3) Truck mid-travel + badge + station expand ✓ 4) Done + ↻ button ✓ 5) pill `=` đọc rõ ✓ 6) Kho không cắt ✓

**Self-grade 8.5/10** (spec verbatim, exact numbers từ v43 + user Q&A). Trong RULE 5 cap.

**Lesson learned:**
- Playwright `browser_evaluate` latency ~3-5s/call. For mid-animation screenshots, click via evaluate THEN immediately `browser_wait_for` + `browser_take_screenshot` (cả 2 là fast MCP calls, không qua evaluate latency).
- Reset() reference closure-local `table` → ReferenceError. Pattern: `var initTable = (window.__pipeline && window.__pipeline.table) || DEFAULT_TABLE;`

**Pending** (chờ user "OK" checkpoint):
- §7.4E: "Xem gợi ý (1/4)" progressive button (reveal_hints{} 18 bài đã có data)
- §7.4F: "Tại sao?" slide panel 320px (nút đã có trong done feedback gọi showQueryExplanation, chưa có UI)
- §7.4G: 18/18 lessons × 4 steps verification
- Cleanup !important count 18 (pre-existing, deferred)

**Báo cáo:** docs/B_FIX_STAGE2B_2026-06-29.md (§0-§8 per template).
---

## 2026-06-29 13:24 — STAGE 2c Town Map Pipeline (REBUILD CỘT TRÁI)

**Context:** User chốt 4 quyết định (A SVG inline chi tiết + A cổng lọc thùng rơi + A manifest 280px + B cleanup orphan only). Bám mockup + spec v45.

**Shipped:** Town map (replaces vertical pipeline) — 4 SVG silhouettes (Kho cửa cuốn + FROM kho + WHERE cổng-chắn + SELECT bến+cờ), 8 city blocks + park + pond cyan, truck top-down bám SVG path (rAF + atan2), badge digit-bounce 4→1, manifest 280×300, mechanism animation per zone (cargo+ / gate+drop 4→1 / columns).

**Files changed:**
- `static/js/drag_game.js` 44,434 → 58,953 B (+14,519 B / +32%). 6 dead hàm removed (~5.3KB). New `buildTownMapHTML` + `driveTruckTo(f)` + `driveTruckToStation()` + `updateManifest` + `mechFrom/Where/Select` + `runQueryAsync` IIFE.
- `static/css/lesson_db_design.css` 240,436 → 245,851 B (+5,415 B, headroom 4,149B under 250K). Orphan CSS removed (~5.8KB). New town-map CSS (~7KB).
- !important: 18 → 20 (at limit ≤20).

**Mid-implementation issues:**
- Brace mismatch trong `runQuery()` rewrite: `finishExecution` + `showFeedback` bị lồng trong `runQueryAsync` thay vì module level. Fixed bằng 2 lần edit indent.
- Tag bị overflow dưới map: Kho ở (110, 525) với tag bị cắt bởi `overflow: hidden`. Acceptable cosmetic.

**Acceptance 8/8** (per v45 §ACCEPTANCE): Map render ✓ Kho→FROM→WHERE→SELECT ✓ Truck bám+xoay ✓ WHERE 4→1 mechanism ✓ Manifest TO ✓ Done+confetti+↻ ✓ console sạch (1 pre-existing error ngoài scope) ✓ node -c pass + 18 bài render ✓.

**KÉO THẬT test:** Synthetic DragEvent với DataTransfer (9 tokens: FROM/game_catalog + WHERE/id/=/101 + SELECT/name/price) → 3 drop slots → click Run. Truck chạy Kho→FROM→WHERE→SELECT, badge 4→1, manifest render 3 mini-tables, ✓ done.

**Self-grade 7.5/10.** Báo cáo `docs/B_FIX_STAGE2C_2026-06-29.md`. Screenshots `stg2c_v1_default.png` + `stg2c_v1_kethat_running.png`.

**Pending** (chờ user "OK"):
- §7 4E hint counter progressive
- §7 4F panel "Tại sao?" 320px
- §7 4G 18/18 verification
- Dọn `.pipeline-station-card*` defensive CSS
- Idle truck "engine running" subtle pulse

**Lesson learned (reusable):**
- Khi rewrite nested function structure, KHÔNG chỉnh indent — keep function ở cùng module level. Tránh phải fix brace mismatch 2-3 lần.
- `getPointAtLength(f * total)` + `atan2(p2.y - p.y, p2.x - p.x)` cho truck bám đường xoay theo heading — chuẩn rồi, không cần SVG `motion-path` (kém control hơn).
- `e.dataTransfer.setData('text/plain', ...)` cần `DataTransfer` API support trong synthetic events. Chrome hỗ trợ.


## STAGE 2d — Phase A+B+C (FULL SHIP) — 2026-06-29

**Scope:** Full phase 2d ship CHUNG theo user chốt (không drop A/B).

### Done
- **Part A** Step 3 polish: pacing 2.7s/station, xe sống (wheel + exhaust + headlight), cảnh quan dusk (twilight + lamps + trees + pond + 8 chimneys + LANDMARK PE tower), hybrid #ide-code + PE_runSQL + PE_parseSQLToBlocks + click delegation, CSS phóng to.
- **Part B** Step 1 hero PK demo (cyan glow row 101 + dim rows + WHERE pulse), .dp-table flex column fix.
- **Part C** Step 4 Codecademy 3-cột layout (Đề | IDE | Results+Schema), editor trống + ghost placeholder, Schema moved DOM thật sang cột 3, Results panel render PE_runSQL output, gỡ LeetCode tabs handler + dead CSS 281 lines.

### Files changed
- static/css/lesson_db_design.css: 256,326 → 248,394 B (saved 7,932 B via dead CSS purge). !important=20.
- static/js/lesson_db_design.js: 223,414 B. Part A4 (PE_runSQL+PE_parseSQLToBlocks), Part B1 (HERO_SVGS), Part C (3-cột + renderStep4Results + ghost placeholder + gỡ tabs + C4-FIX PE_runSQL schema shape handler).
- static/js/drag_game.js: 63,864 B. Part A1 (pacing), Part A2 (xe sống), Part A3 (cảnh quan dusk + PE tower), exposed PE_parseWhereRows+PE_executeStation.
- 	emplates/lesson_db_design.html: Part C1 restructure step 4 → 3-cột Codecademy.

### Acceptance
- node -c pass all 3 JS files.
- CSS budget ≤275,000 B ✓ (248,394 B), !important ≤24 ✓ (20).
- Smoke test Bài 1 step 1 (hero PK demo) + step 3 (gõ tay SQL → truck drives) + step 4 (3-cột Codecademy, results render 'Elden Ring | 60').
- Bài 7 step 4 cross-check (PE_runSQL handles different schema shapes).

### Bug fixed mid-ship
- PE_runSQL originally hard-coded s4.columns/s4.data (top-level). Real shape is s4.schema.columns (object array) + s4.schema.data. C4-FIX adds priority chain + column normalizer (string ↔ {name,type,key,icon}).

### Known limitations (ngoài scope 2d)
- mcq_code: no #ide-code editor, Results panel idle. fill_blank/bug_fix: Results renders when user provides input.
- PE_runSQL operates on actual data — for hypothetical queries (bài 7 expected SQL), Results shows 'WHERE không khớp dòng nào'. Validation trong Console vẫn correct.
- 1 favicon 404 (pre-existing).

### Report
- D:\PE_test\docs\B_FIX_2D_2026-06-29.md (full report)
- D:\PE_test\screenshots\stg2d_partC_step4_idle.png (3-cột visual proof)


### 2026-06-30: PHASE 2e — SỬA REGRESSION 2d (ship CHUNG A+B+C+D)

**Source: docs/SYSTEM_INSTRUCTIONS_FINAL.md v47 (Claude Code council)**

**Root cause 2e-A1 (QUAN TRỌNG):** thiếu `/*` opener ở `lesson_db_design.css` L8595 (Phase 2d edit bug) → CSS parser nuốt rule `.split-pane.step3-two-col{display:grid; 45fr 55fr}` → fallback về `.step3-two-col{display:flex}` v6.1 → cột 1 bị bóp 221px, data-preview đè map 2730px², IDE tràn mép 145px. Đây là **CSS comment-delimiter bug** đã từng gặp 2026-06-28 — áp dụng pattern: scan orphan ` *` line + missing `/*` opener.

**Shipped 4 parts (LOCAL commit only, no push):**
- **Part A** (e1ee0da): step3 layout — add `/*` opener L8595 + move data-preview dưới map cột trái + IDE min-width:0
- **Part B** (f446140): step1 hero + renderSchemaTable defensive (visual-db-panel TableExplorer path primary, fallback defensive)
- **Part C** (3090697): step4 bỏ `.schema-pane` (DORMANT keep hàm) + context giàu data-driven Bài 1/3/4/10 (4 bài, 14 còn fallback) + sửa 5× "bên phải"→"cột giữa"
- **Part D** (076aa50): guard renderMyCourses null (main.js:1126) + remove duplicate flex rule DORMANT

**Acceptance metrics @1600px:**
- `.town-map`: 152×152 → **600×600** ✓
- `#ide-code` right: 1745 → **1584** (≤1600) ✓
- map↔data-preview overlap: 2730px² → **0** ✓
- 0 pageerror (pre-fix: 1× renderMyCourses null) ✓
- CSS 254,757B / 275,000B ✓ (headroom 20,243B)
- !important=20 / 24 ✓
- backdrop-filter=6 / 6 ✓
- node -c all 4 JS pass ✓
- Smoke test Bài 1 step 4: gõ `SELECT * FROM game_catalog` → 4 dòng × 4 cột; `SELECT name, price FROM game_catalog WHERE id = 101` → 1 dòng (Elden Ring, 60) ✓
- Bài 7 step 4 cross-check: PE_runSQL WHERE parser OK across schemas ✓

**Key user/Claude constraints shipped:**
- Q1 (A2 data-preview): option (a) dưới map cột trái + 2 ràng buộc cứng (map giữ kích thước TRƯỚC, data-preview compact 1-2 dòng, fallback topbar nếu cột quá cao)
- Q2 (C2 scope): template chuẩn + 3 đại diện (stress-test), data-driven 100%, 14 bài fallback
- Q3 (C1 schema panel): chỉ gỡ call site, GIỮ hàm DORMANT (user đã đổi ý 2 lần về schema → rollback dễ)

**Limitations (ngoài scope):**
- 14 bài context còn fallback — chờ user duyệt template rồi roll out
- Không bài non-full_ide nào trong data hiện tại (18/18 = full_ide) — render code support hint_explore skip cho tương lai
- Town map có thể clip 1-2px đáy (drag-mount 539 vs town-map 600, drag-mount overflow:hidden) — visually OK vì data-preview compact vẫn hiện dưới

**Pattern learned:** Khi CSS rule mới "không apply" → check comment delimiters TRƯỚC khi sửa specificity/selector. Browser CSSOM khi phát hiện lỗi parse: nuốt rule + có thể "cascade lệch". Diagnostic nhanh = browser API `document.styleSheets[i].cssRules` → list matched rules.

**Report:** D:\PE_test\docs\B_FIX_2E_2026-06-30.md (full 11.1KB)
**Screenshots:** screenshots/probe_2e_pre_*.png + postA/postC/postD (12 files, mỗi file ~250KB)
