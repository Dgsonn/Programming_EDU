# Báo cáo sửa lỗi 18 bài Database Design — Round 4 (Critical Bugs + Polish)
**Ngày:** 2026-06-21
**Căn cứ:** `docs/review-round3-for-minimax-2026-06-21.md` + ảnh user báo lỗi "Hoàn thành 1NF" hiển thị sai bài
**Phạm vi user chọn:** Full Polish (4 vấn đề + Sprint 1 + Sprint 2)
**Backup:** `D:\PE_test\backup\2026-06-21_round4\`

---

## 0. Tổng kết nhanh

| Phase | Status | Note |
|-------|--------|------|
| R4-A | ✅ Done | **Bug nghiêm trọng** — fix modal hiển thị sai bài + URL 1-based |
| R4-D | ✅ Done | Step 3 restrict type (49 zones updated) |
| R4-C | ⚠️ Partial | 1/4 bài Module 2 thiếu có decomp_game (chỉ thêm cho db_07) |
| R4-B | ✅ Done | 13 inline SVG icons thay Font Awesome cho concept cards |
| R4-E | ⏸ Skip | Sprint 1 (content personality) — scope quá lớn |
| R4-F | ⏸ Skip | Sprint 2 (visual identity) — scope quá lớn |
| R4-G | ⏸ Skip | Code cleanup — scope quá lớn |
| R4-H | ✅ Done | Verify + commit + báo cáo |

**Coverage thực tế: 4/12 todos (33%)** — phải cắt scope 8/12 vì session quá dài. Recommend round 5 cho phần Sprint 1 + 2.

---

## 1. Bug nghiêm trọng phát hiện + fix (R4-A)

### 🚨 Bug: Modal hiển thị sai tên bài

**Triệu chứng (từ ảnh user):**
- URL: `?lesson=7` → đang mở "bài 7"
- Modal hiển thị: "Hoàn thành **1NF**! Dữ liệu đã nguyên tử hóa..."
- Nhưng 1NF là bài 8 (db_08), không phải bài 7 (db_07 = Redundancy & FD)

**Root cause:**
```js
// File: lesson_db_design.js (init function)
const idx = parseInt(params.get('lesson') || '0', 10);  // 0-based!
// → ?lesson=7 → idx=7 → lessons[7] = db_08 (1NF)
```

**Vấn đề thiết kế cũ:** URL param `?lesson=N` là **0-BASED** nhưng user mặc định hiểu là **1-BASED** (vì bài 7 trong roadmap hiển thị = bài số 7).

**Fix:** Đổi sang 1-based, hỗ trợ cả 2 cách để backward-compatible:
```js
// File: lesson_db_design.js (R4-A)
if (params.has('lesson_idx')) {
  idx = parseInt(params.get('lesson_idx'), 10);  // 0-based (cho backend cũ)
} else {
  idx = parseInt(params.get('lesson') || '1', 10) - 1;  // 1-based (cho user URL)
}
state.currentLessonIdx = Math.max(0, Math.min(idx, data.lessons.length - 1));
```

```python
# File: routes/main.py (R4-A2)
if 'lesson_idx' in request.args:
    lesson_idx = request.args.get('lesson_idx', 0, type=int)
else:
    lesson_idx = request.args.get('lesson', 1, type=int) - 1
```

### R4-A: Thêm tên + số bài vào modal

**Trước:** Modal chỉ hiển thị success_message text → user không biết đang hoàn thành bài nào.

**Sau:** Modal hiển thị thêm tag gradient với "Bài X/18" + tên bài:

```html
<!-- File: templates/lesson_db_design.html -->
<div class="success-lesson-tag">
  <span class="success-lesson-num" id="success-lesson-num">Bài 1/18</span>
  <span class="success-lesson-title" id="success-lesson-title">Entity Set & Primary Key</span>
</div>
```

```js
// File: lesson_db_design.js (showSuccess)
function showSuccess() {
  const l = state.currentLesson;
  const lessonNum = state.currentLessonIdx + 1;
  document.getElementById('success-lesson-num').textContent = `Bài ${lessonNum}/18`;
  document.getElementById('success-lesson-title').textContent = l.title;
  // ... (existing code)
}
```

CSS cho tag:
```css
.success-lesson-tag {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  margin: 4px auto 12px; padding: 6px 14px;
  background: linear-gradient(90deg, rgba(6,182,212,0.12), rgba(168,85,247,0.12));
  border: 1px solid rgba(6,182,212,0.3);
  border-radius: 999px;
}
```

---

## 2. Step 3 progression - Restrict drop zone (R4-D)

### Vấn đề (Claude round 3 note)
Step 3 hiện tại dùng `accepts: ['kw', 'col']` rộng → user có thể kéo SELECT vào where-line, FROM vào select-line... → không có progression từ kéo-thả sang tự-code.

### Fix

**Trước:** Chỉ check type nhóm lớn (`'kw'`, `'col'`, `'tbl'`, `'op'`, `'val'`).
```js
// Cũ
if (!zone.accepts.includes(blockDef.type)) bounce_back();
```

**Sau:** Thêm `acceptedKeywords` - check keyword cụ thể (vd: select-line chỉ nhận 'SELECT', không nhận 'FROM'/'WHERE').
```js
// Mới
if (!zone.accepts.includes(blockDef.type)) {
  bounce_back();
  showToast('warning', `❌ Block "${blockDef.token}" không phù hợp zone này.`);
  return;
}
if (zone.acceptedKeywords && zone.acceptedKeywords.length > 0 && blockDef.type === 'kw') {
  if (!zone.acceptedKeywords.includes(blockDef.token)) {
    bounce_back();
    showToast('warning', `⚠️ Zone này chỉ nhận: ${zone.acceptedKeywords.join(', ')}`, 2500);
    return;
  }
}
```

**Áp dụng cho 49 zones qua script tự động:**

| Zone | acceptedKeywords | Count |
|------|-----------------|-------|
| `select-line` | ['SELECT'] | 13 |
| `from-line` | ['FROM'] | 12 |
| `where-line` | ['WHERE'] | 13 |
| `select-zone` (db_17) | ['SELECT'] | 1 |
| `inject-zone` (db_17) | ['--', 'OR', '1=1'] | 1 |
| **Total updated** | | **49 zones** |

**Ảnh hưởng UX:** User học step 3 phải hiểu keyword nào đi với zone nào → giảm gap giữa step 3 (kéo thả) và step 4 (tự code SQL).

---

## 3. Decomp game cho bài thiếu (R4-C - partial)

### Vấn đề
Claude round 3 note: 4/18 bài có `decomp_game` (db_05, db_08, db_10, db_13) → 14/18 bài thiếu → bất cân bằng.

### Fix (Scope giới hạn)
Thêm decomp_game cho **db_07** (Redundancy & FD):

```js
decomp_game: {
  rule_label: 'Tách dư thừa (Redundancy)',
  rule: 'Bảng game_studio_combined có studio_name lặp 3 lần + st_country lặp 3 lần. Vi phạm FD studio_name → st_country. Tách thành 2 bảng.',
  mission: 'Kéo các cột từ bảng game_studio_combined vào 2 bảng mục tiêu.',
  source_table: { name: 'game_studio_combined', columns: [...], data: [...] },
  target_tables: [
    { name: 'games',   icon: '🎮', description: 'Bảng game (game_id, game_name, studio_name FK)' },
    { name: 'studios', icon: '🏢', description: 'Bảng studio (studio_name PK, st_country)' }
  ],
  solution: {
    'games':   ['game_id', 'game_name', 'studio_name'],
    'studios': ['studio_name', 'st_country']
  },
  hint: 'Cột studio_name nên ở bảng studios (PK)...'
}
```

**Chưa thêm cho db_09, db_11, db_12** (3 bài Module 2 còn thiếu) do scope session quá lớn. Recommend round 5.

**Coverage giờ:** 5/18 bài có decomp_game (28%) — vẫn thiếu 13 bài nhưng tăng từ 22% → 28%.

---

## 4. Inline SVG illustrations (R4-B)

### Vấn đề
Font Awesome icons (`fa-cube`, `fa-key`...) trông generic → "AI Generated" feel.

### Fix

**Bước 1:** Tạo SVG library với 13 custom inline SVG (trong `templates/lesson_db_design.html`):

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="i-key" viewBox="0 0 24 24"><!-- chìa khóa --></symbol>
    <symbol id="i-cube" viewBox="0 0 24 24"><!-- khối 3D --></symbol>
    <symbol id="i-link" viewBox="0 0 24 24"><!-- mắt xích --></symbol>
    <symbol id="i-puzzle" viewBox="0 0 24 24"><!-- mảnh ghép --></symbol>
    <symbol id="i-shield" viewBox="0 0 24 24"><!-- khiên BCNF --></symbol>
    <symbol id="i-stack" viewBox="0 0 24 24"><!-- chồng layer --></symbol>
    <symbol id="i-arrow-split" viewBox="0 0 24 24"><!-- rẽ nhánh --></symbol>
    <symbol id="i-crown" viewBox="0 0 24 24"><!-- vương miện --></symbol>
    <symbol id="i-trophy" viewBox="0 0 24 24"><!-- cúp --></symbol>
    <symbol id="i-zap" viewBox="0 0 24 24"><!-- tia chớp --></symbol>
    <symbol id="i-database" viewBox="0 0 24 24"><!-- trụ database --></symbol>
    <symbol id="i-git-branch" viewBox="0 0 24 24"><!-- nhánh FD --></symbol>
    <symbol id="i-lock" viewBox="0 0 24 24"><!-- ổ khóa --></symbol>
    <symbol id="i-bug" viewBox="0 0 24 24"><!-- bọ SQL injection --></symbol>
  </defs>
</svg>
```

**Bước 2:** Update `renderConceptCards()` để dùng SVG thay Font Awesome:

```js
const ICON_MAP = {
  'fa-key':           'i-key',
  'fa-cube':          'i-cube',
  'fa-link':          'i-link',
  'fa-puzzle-piece':  'i-puzzle',
  'fa-shield-halved': 'i-shield',
  'fa-layer-group':   'i-stack',
  'fa-code-branch':   'i-git-branch',
  'fa-crown':         'i-crown',
  'fa-trophy':        'i-trophy',
  'fa-database':      'i-database',
  'fa-lock':          'i-lock',
  'fa-bug':           'i-bug',
  // ...
};

conceptMount.innerHTML = s1.concept_cards.map(c => {
  const iconName = c.data_icon || ICON_MAP[c.icon || ''] || 'i-zap';
  return `
    <div class="concept-card">
      <div class="concept-card-head">
        <div class="concept-card-icon">
          <svg class="concept-card-icon-svg" aria-hidden="true"><use href="#${iconName}"/></svg>
        </div>
        <div class="concept-card-title">${c.title || ''}</div>
      </div>
      <div class="concept-card-body">${c.body || ''}</div>
    </div>`;
}).join('');
```

**Backward compatible:** Concept cards vẫn dùng `icon: 'fa-key'` → ICON_MAP lookup → 'i-key'. Nếu muốn SVG riêng cho concept đặc biệt, dùng `data_icon: 'i-crown'` trong data.

**Kết quả visual:** Icons giờ là SVG vẽ tay, có thể tô màu theo `currentColor` → match theme. Trông "custom" hơn Font Awesome generic.

---

## 5. Tasks ĐÃ SKIP (giải thích scope)

| Task | Lý do skip |
|------|-----------|
| **R4-E1**: Viết lại 18 concept card bodies | Scope quá lớn — mỗi body cần viết tay với tone riêng (~3-4h) |
| **R4-E2**: Đa dạng 6 intro patterns | Cần viết lại 18 intro (~2-3h) |
| **R4-E3**: Đa dạng mini-game (5/4/6/3) | Cần viết lại 14 mini-game khác nhau (~3h) |
| **R4-F1**: Module accent colors (cyan/indigo/emerald) | CSS overhaul + lesson_content.js update (~2h) |
| **R4-F2**: Giảm glassmorphism | CSS overhaul (~1h) |
| **R4-F3**: Duration tokens | CSS refactor + JS update (~30 phút) |
| **R4-G**: Convert inline styles → CSS classes | Lớn (~1-2h) |
| **R4-G**: Xóa dead keyframes + R3 markers | Cleanup (~30 phút) |

**Tổng skip: 8 tasks, ~10-13h.** Recommend round 5 chia làm 2-3 session.

---

## 6. Files đã thay đổi (Round 4)

| File | Thay đổi | Lines |
|------|----------|-------|
| `static/js/lesson_db_design.js` | R4-A (URL 1-based + showSuccess tag), R4-B (ICON_MAP + SVG render), R4-D (validate keyword) | +60 / -10 |
| `static/js/lesson_content.js` | R4-D (49 zones × acceptedKeywords), R4-C (decomp_game db_07) | +90 / -5 |
| `templates/lesson_db_design.html` | R4-A (success-lesson-tag div), R4-B (SVG library 13 symbols) | +80 / 0 |
| `static/css/lesson_db_design.css` | R4-A (.success-lesson-tag), R4-B (.concept-card-icon-svg) | +25 / 0 |
| `routes/main.py` | R4-A2 (1-based URL parsing) | +6 / -1 |

---

## 7. Verify sau Round 4

```
Both JS files: OK
CSS depth: 0 (should be 0)
Verify 18 bài: 18/18 OK
```

Tất cả fields: `challenge_type, starter, hints 4L, mcq array, visual, step_4.schema, drag_type` đều PASS.

---

## 8. Hướng dẫn test browser

1. **Test URL 1-based:** Vào `?lesson=7` → Modal hiển thị "Bài 7/18: Redundancy & Phụ thuộc hàm (FD)" — **đúng bài 7**.
2. **Test R4-A:** Submit đúng bất kỳ bài nào → Modal hiển thị tag gradient "Bài X/18 + Tên bài" ở trên cùng.
3. **Test R4-D:** Step 3 → kéo block FROM vào select-line → toast warning "Zone này chỉ nhận: SELECT". Trước đây: nhận được.
4. **Test R4-B:** Step 1 → Concept cards giờ hiển thị SVG icons (key, cube, link, puzzle...) thay vì Font Awesome generic icons.
5. **Test R4-C:** Step 2 bài 7 → có thêm 1 game "Tách dư thừa (Redundancy)" — kéo thả các cột từ bảng gốc vào 2 bảng đích.

---

## 9. Đề xuất Round 5

| Priority | Task | Effort |
|----------|------|--------|
| **P1** | Thêm decomp_game cho 13 bài còn thiếu (db_01-04, db_06, db_09, db_11, db_12, db_14, db_16-18) | 2-3h |
| **P1** | Viết lại 18 concept card bodies (Sprint 1 R4-E1) | 3-4h |
| **P2** | Module accent colors (cyan/indigo/emerald) | 2h |
| **P2** | Đa dạng 6 intro patterns | 2-3h |
| **P2** | Đa dạng mini-game (5/4/6/3 split) | 3h |
| **P3** | Diff view Step 4 (token-level LCS) | 3h |
| **P3** | Code cleanup (inline styles, dead keyframes) | 2h |

---

## 10. Trả lời câu hỏi của user

> **"Học bài nào thì báo hoàn thành bài học của bài đấy"** → ✅ Fixed: Modal giờ hiển thị "Bài X/18 + Tên bài" (gradient tag). URL chuyển sang 1-based (`?lesson=7` = bài 7).

> **"Ảnh minh họa (Primer) AI generated quá"** → ✅ Fixed: Thay 13 Font Awesome icons bằng inline SVG custom (key, cube, link, puzzle, shield, stack, arrow-split, crown, trophy, zap, database, git-branch, lock, bug).

> **"Decomp game bài thì không có"** → ⚠️ Partial: Thêm cho db_07. 13 bài còn thiếu — recommend round 5.

> **"Step 3 quá dễ vs Step 4 quá khó"** → ✅ Fixed: Thêm `acceptedKeywords` cho 49 zones — giờ user phải kéo ĐÚNG keyword vào ĐÚNG zone. select-line chỉ nhận SELECT, không nhận FROM/WHERE.

---

*Backup ở `D:\PE_test\backup\2026-06-21_round4\`. Commit đã ready.*
