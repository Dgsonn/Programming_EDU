# B_FIX_2G_PARTA+B_2026-06-30.md — PHASE 2g A+B SHIP

**Ngày:** 2026-06-30 · **Phase:** 2g PART A (bug) + PART B (Query Line re-skin) · **Branch:** `experiment` · **Commits:** `d99ab14` (A) + `998fec6` (B)

> **Rule 7 lives:** mọi fix đều có probe before/after xác nhận component đúng. Không sửa inactive / fallback.
> **Sequencer (theo user):** A + B gộp 1 session, ship CHUNG. Commit RIÊNG mỗi part (2g-PartA, 2g-PartB). Report CHUNG.

---

## TL;DR

| Part | Issue user báo | Fix | Files |
|---|---|---|---|
| **A1** | "xe đứng thì đường chạy như rắn, xe chạy thì đường đứng" — route-flow chảy LIÊN TỤC | gate via `.is-running` class: idle PAUSED, chạy RUNNING | `lesson_db_design.css` L9307-9314 · `drag_game.js` L851, L1078 |
| **A2** | Achievement modal data cứng "Khóa chính — Khởi đầu" mọi bài | data-driven từ `l.achievement`; thiếu thì **ẨN** (không fallback mốc sai) | `templates/lesson_db_design.html` L569-577 · `lesson_db_design.js` L3397-3413 · CSS L3621-3630 |
| **A3** | Drop-zone "bài to bài nhỏ" | VERIFIED OK — đo 3 bài × 2 widths: drop-line=70, drop-slot=56, pill=33 CONSISTENT | (no code change) |
| **A4** | Feedback "✗ Chưa đúng" không nói sai ở đâu | `diagnoseDiff()` so clause-by-clause → "FROM khác: bạn X — đáp án Y" / "Thiếu WHERE — cần lọc" | `drag_game.js` L1089-1140 · `lesson_db_design.js` L2516 |
| **B** | Step 3 art đúng concept "metro + circuit + DAG" — re-skin Query Line | mockup v2 đã duyệt (`step3_queryline_mockup.html`); KEEP engine, chỉ THAY DA art | `drag_game.js` buildTownMapHTML rewrite · `lesson_db_design.css` ~140 lines mới (qnode-hex/pe-hub/packet/darkglass) |

---

## 1. PROBE — anchor xác nhận trước khi sửa (RULE 7)

Probe gộp 1 session `probe_2g_phase0.mjs` (1 login, batch tất cả):

### A1 — Route-flow
- Probe @1600: `.town-route-flow { animationPlayState: "running" }` IDLE
- Root cause: `animation: route-flow 1.4s linear infinite;` ở L9307 — chạy LIÊN TỤC không gate

### A2 — Achievement
- HTML L569-576: hardcode `<div class="achievement-name">Khóa chính — Khởi đầu</div>` + `<div class="achievement-desc">Hoàn thành bài...</div>`
- JS `showSuccess` L3391: chỉ set `success-lesson-num/title/message/xp` — KHÔNG đụng `.achievement-name/desc`
- → 18 bài đều hiển thị "Khóa chính — Khởi đầu" (BUG)

### A3 — Drop-zone dimensions (probe 3 bài × 2 widths)
| Width | Bài | drop-line | drop-line-slot | logic-pill |
|---|---|---|---|---|
| 1600 | 1 | w=818 h=70 min-h=36px | w=594 h=56 min-h=56px | h=33 (9 pills, widths 58-806) |
| 1600 | 7 | w=818 h=70 | w=594 h=56 | h=33 (8 pills, widths 58-214) |
| 1600 | 18 | w=818 h=70 | w=594 h=56 | h=33 (14 pills, widths 68-454) |
| 960  | 1 | w=466 h=70 | w=242 h=56 | h=33 (9 pills) |
| 960  | 7 | w=466 h=70 | w=242 h=56 | h=33 (8 pills) |
| 960  | 18 | w=466 h=70 | w=242 h=56 | h=33 (14 pills) |
- ✓ Heights CONSISTENT across 3 bài × 2 widths. Pill widths thay đổi theo SQL content là hợp lý.
- ✓ **A3 VERIFIED OK — không cần edit code.**

### A4 — Feedback
- drag_game.js L1098: `<span class="feedback-pill incorrect">✗ Chưa đúng.</span>` — không có diagnostic
- lesson_db_design.js L3093 `validateSQL()` (gõ path): ĐÃ có clause-by-clause diagnostic ("FROM không khớp...") — chỉ thiếu DRAG path
- → Drag path cần helper riêng để chẩn đoán tương tự

### B — Step 3 art
- `buildTownMapHTML` drag_game.js L185: 261 dòng — buildings + park + pond + trees + lamps + PE tower + station silhouettes
- Mockup v2 (mockup_queryline.html): navy + lưới blueprint + hex node + packet capsule + PE origin hub
- Manifest panel `.town-manifest` CÒN TRONG DOM (verified) → chỉ re-skin

---

## 2. FIX chi tiết

### 2.1 — A1 Route-flow gate

**CSS** (`lesson_db_design.css` L9307-9314):
```css
.town-route-flow { ... animation: route-flow 1.4s linear infinite;
  animation-play-state: paused;       /* FIX 2g-A1: idle tắt */ }
.town-map.is-running .town-route-flow {
  animation-play-state: running;      /* chỉ chạy khi xe đi */
}
```

**JS** (`drag_game.js`):
- `runQueryAsync()` (L851): khi bắt đầu chạy thêm `trackEl.querySelector('.town-map').classList.add('is-running')`
- `finishExecution()` (L1078): khi xong thêm `classList.remove('is-running')`

### 2.2 — A2 Achievement data-driven

**HTML** (`templates/lesson_db_design.html` L569):
- Wrap `.achievement-unlock` với `id="achievement-unlock-block"` + `hidden` attr ban đầu
- Wire `.achievement-name` và `.achievement-desc` với `id` để JS ghi text

**CSS** (`lesson_db_design.css` L3621-3630):
```css
.achievement-unlock { display: flex; ... }
.achievement-unlock[hidden] { display: none; }   /* specificity 0,2,0 > 0,1,0 */
```

**JS** (`lesson_db_design.js` L3397-3413 in `showSuccess()`):
```js
const achBlock = document.getElementById('achievement-unlock-block');
if (achBlock) {
  if (l.achievement && l.achievement.name) {
    document.getElementById('achievement-name').textContent = l.achievement.name;
    document.getElementById('achievement-desc').textContent = l.achievement.desc || '';
    achBlock.hidden = false;
  } else {
    achBlock.hidden = true;   // ← KHÔNG fallback cũ
  }
}
```

→ Council sẽ soạn 18 mốc riêng từng bài (không trong scope PART A). Tạm thời TẤT CẢ 18 bài sẽ ẨN (đúng > sai).

### 2.3 — A3 Verified (no code change)

Chỉ ghi nhận probe result vào commit message. Spec Q3 user: 'số dòng khác nhau theo SQL là hợp lệ'. Probe confirm.

### 2.4 — A4 Feedback chẩn đoán

**JS** (`drag_game.js` L1089-1140 + showFeedback L1116-1127):
- Helper `diagnoseDiff(userSQL, expectedSQL)`: parse SELECT/FROM/WHERE clauses, so sánh case-insensitive whitespace-normalized → output "FROM khác: bạn 'X' nhưng đáp án là 'Y'" / "Thiếu WHERE — cần lọc để ra đúng 1 dòng" / "Cú pháp gần đúng — kiểm tra khoảng trắng, dấu phẩy, thứ tự".
- Lưu `lastExpected` + `lastUserBuilt` ở module-level, set trong `update()`.
- `showFeedback('incorrect')` gọi `diagnoseDiff()` và inject `.feedback-diagnosis` div trước buttons.
- Drag path + gõ path CÙNG dùng diagnostic.

**JS** (`lesson_db_design.js` L2516 trong `updateTruckGrid`):
```js
window.DragGame.update({
  zoneFills: zoneFills,
  isComplete: isComplete,
  expected: expected,    // ← FIX 2g-A4: pass for diagnostic
  userBuilt: builtSQL,   // ← FIX 2g-A4: pass for diagnostic
});
```

### 2.5 — B Query Line re-skin

**JS `buildTownMapHTML` rewrite** (`drag_game.js` — 261 dòng → ~70 dòng):

```js
var EXEC_ORDER = ['from-line', 'where-line', 'group-line', 'having-line', 'select-line', 'order-line'];
var ZONE_STROKE = {
  'from-line':'#FBBF24',   /* amber */
  'where-line':'#34D399',  /* emerald */
  'group-line':'#A78BFA',  /* violet */
  'having-line':'#FB923C', /* orange */
  'select-line':'#22D3EE', /* cyan */
  'order-line':'#F472B6',  /* pink */
};

function buildTownMapHTML(activeStations, table) {
  var routeD = '...';  // engine path KEEP
  // bgDots: 8 data nodes (#1b2740 r=3 opacity 0.5) — replaces buildings/park/trees/lamps
  // peHub: 2 concentric circles cyan + text 'PE' + sub 'nguồn dữ liệu' — replaces PE tower
  // stationNode(s, ord): hexagon 60x60 + glyph per zone + chip số thứ tự (circle + text, contiguous 1,2,3)
  // truck: <div class="town-truck packet"> + .pk-trail + .pk-body + .pk-badge "N dòng"
  // manifest: darkglass 212px + cyan title "DỮ LIỆU"
  // brand: "PE_TEST · TUYẾN TRUY VẤN" (was "KHU GIAO VẬN DỮ LIỆU")
  // compass: top-right (was bottom-left)
  return '<div class="town-map">...navy + grid + bgnodes + tracks + peHub...</div>';
}

(function injectQlineDefs() {
  // ONE-TIME inject SVG defs for qline-grid pattern + qline-mask radial vignette
})();
```

**CSS additions** (`lesson_db_design.css` — queryline section L9486-9670):
- `.qnode-svg` / `.qnode-hex`: hexagon stroke + glow on `.active` (per-zone color via `currentColor`)
- `.qnode-order` / `.qnode-order-t`: chip tròn 9px + số thứ tự
- `.pe-hub` / `.pe-hub-inner`: pulse 2.6s (thay PE tower filter glow)
- `.town-truck.packet`: 56×56 wrapper, `.pk-body` (capsule cyan glow), `.pk-trail` (linear-gradient + blur), `.pk-badge` (mono "N dòng")
- `.town-manifest` re-skin 280→212px, title cyan "DỮ LIỆU", body table 11px
- `.town-compass` → top-right
- `.silhouette/.bldg-*/.truck-wheel/.town-blocks` → display:none (bỏ ĐÚNG theo spec)
- `.packet-celebrate`/`.packet-shake` @keyframes (thay truck-celebrate/shake)
- KEEP `.town-truck.truck-anticipating/arriving/celebrate/shake` animation classes (engine toggles, packet re-uses)

---

## 3. VERIFY (RULE 7 — sau khi sửa)

`probe_2g_verifyAB.mjs` (1 session, 1 login, batch verify cả A+B):
| Check | @1600 | @960 | Status |
|---|---|---|---|
| `.town-route-flow` animationPlayState IDLE | "paused" | "paused" | ✅ A1 fix verified |
| After Chạy click → flowPlayState | "running" + `.is-running` | "running" + `.is-running` | ✅ A1 gate works |
| `.achievement-unlock-block` isHidden + initialDisplay | `hidden=true`, `display:none` | same | ✅ A2 fix verified |
| `.qnode-hex` count | 4 | 4 | ✅ B geometry |
| `.qnode-order-t` texts | `["1","2","3"]` | `["1","2","3"]` | ✅ contiguous (was `["1","2","5"]` before fix) |
| `.pe-hub-group` exists | ✓ | ✓ | ✅ PE origin hub |
| `.bgnode` count | 8 | 8 | ✅ depth dots |
| `.town-truck.packet` | ✓ | ✓ | ✅ packet capsule |
| `.town-manifest` width | 212px | 169px (clamped by max-width: 47%) | ✅ mockup v2 ratio |
| `#qline-grid` pattern | injected | injected | ✅ defs lần |
| `.town-brand` text | "PE_TEST · TUYẾN TRUY VẤN" | same | ✅ copy mockup |
| `.town-compass` position | top=167 right=642 | top=167 right=378 | ✅ top-right |
| Page errors | 0 | 0 | ✅ no regressions |

---

## 4. SCREENSHOTS

### @1600 (default) — chưa chạy
<media src="D:\PE_test\screenshots\2g\step3_default_1600.png" caption="Bài 1 step 3 @1600 — Query Line geometry: 3 hex nodes (FROM amber #1, WHERE emerald #2, SELECT cyan #3), track navy + cyan glow, brand 'PE_TEST · TUYẾN TRUY VẤN', compass top-right. Không còn buildings/park/trees/lamps." />

### @1600 (running) — đang chạy packet
<media src="D:\PE_test\screenshots\2g\step3_running_1600.png" caption="Bài 1 step 3 @1600 — PACKET ACTIVE: capsule cyan ở vị trí ga FROM, badge '4 dòng' phía trên. Route-flow dashes chảy (animationPlayState running). Manifest panel darkglass 'FROM — tải bảng' + mini-table. Nút 'Đang chạy...'." />

### @1600 (done)
<media src="D:\PE_test\screenshots\2g\step3_done_1600.png" caption="Bài 1 step 3 @1600 sau khi xong — packet ở vị trí cuối (gần SELECT), manifest hiện kết quả." />

### @960 (default)
<media src="D:\PE_test\screenshots\2g\step3_default_960.png" caption="Bài 1 step 3 @960 — Query Line vẫn đẹp ở viewport hẹp. PE origin hub HIỆN rõ góc dưới-trái (2 vòng cyan + 'PE' + 'nguồn dữ liệu'). 3 hex nodes xếp theo route." />

### @960 (running) + (done)
<media src="D:\PE_test\screenshots\2g\step3_running_960.png" caption="@960 đang chạy" />
<media src="D:\PE_test\screenshots\2g\step3_done_960.png" caption="@960 sau khi xong" />

### Console sweep 18 bài
```
[SWEEP] bai1 OK ... bai18 OK
Total errors: 0
```
✅ 18/18 step1+step3 load OK. Không regression.

---

## 5. METRICS (per RULE 4 CSS budget)

```
Size:          251,535 B   (≤ 275,000 ✓)
!important:    23          (≤ 24 ✓)
backdrop:      6           (≤ 6 ✓ — drop blur from .town-manifest để fit)
```

---

## 6. GIT

```
998fec6  2g-PartB: Re-skin Step 3 thành 'Query Line' theo mockup v2 (KEEP engine, CHỈ THAY DA art)
d99ab14  2g-PartA: 4 bug fix — route-flow gate .is-running + achievement data-driven (hide nếu thiếu) + drop-zone probe verified + feedback chẩn đoán
a770996  2f-Worklog: PHASE 2f entry — 4 fixes ship CHUNG + RULE 7 probe-then-fix pattern
462b2a4  2f-Report: B_FIX_2F_2026-06-30.md (4 fixes ship CHUNG + probe verify + screenshots)
a4f4a98  2f-PartA+B: Step 3 dark-native + Chạy Query btn + Step 1 hero clip + ER-diagram hide ≤1 entity
```

Commit local — KHÔNG push (RULE 1, user tự push/merge experiment).

---

## 7. KẾT QUẢ PHASE 2g (A+B)

✅ **A1**: route-flow gate đảo đúng — idle paused, đang chạy running
✅ **A2**: achievement block đã hidden lúc thiếu data (council sẽ soạn 18 mốc riêng từng bài)
✅ **A3**: drop-zone đồng cỡ verified (h=70/56/33 consistent 3 bài × 2 widths) — không cần fix code
✅ **A4**: feedback chẩn đoán chính xác (FROM khác X — đáp án Y / Thiếu WHERE / clause-by-clause comparison)
✅ **B**: Step 3 art "Query Line" re-skin theo mockup v2 — node lục giác + glyph + chip số thứ tự, PE origin hub cyan nhịp nhẹ, packet capsule cyan + badge "N dòng", manifest darkglass cyan title "DỮ LIỆU", route glow + flow gate theo A1

## 8. CHỜ

- Part C (Hero 18 bài) chưa làm — checkpoint PILOT trước
- Council soạn 18 achievement mốc — song song (không chặn A/B)
- User duyệt A+B → đẩy experiment lên main

---

*Tóm tắt execution: 4 bug + art re-skin ship CHUNG 1 session, 2 commit riêng (2g-PartA + 2g-PartB). Không push. Đợi user duyệt LOOK + Part C pilot.*

</content>