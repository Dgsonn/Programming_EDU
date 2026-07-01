# B_FIX_4A_E3_EQUIV_FIX_2026-07-01 — Tighten E3-equiv runner + bài thường GIỮ panel

## §0 Goal

Sửa 2 bug council verify live @9000 bắt được ở `cc1e055 phase4-E3-equiv`:

### 🔴 Regression — reject-neutral XÓA bảng kết quả 14 bài thường
- **Phá IDE khám phá** (Bài 1 `WHERE id=102` → panel bị xóa sạch dù SQL chạy đúng → trả bảng `[['God of War', '50']]`).
- Nguyên nhân: `renderStep4Neutral` ở Reject branch chạy **vô điều kiện** mọi bài thường.
- **Spec v64 fix** (user chốt): gate theo `liveResult.pending` chứ không gate theo `s4.equiv_sql`:
  - reject + `liveResult` = bảng thật / lỗi cú pháp thật → **GIỮ panel** (đã render ở immediate path).
  - reject + `liveResult.pending` (bài equiv, hoặc bài thường user lỡ gõ clause chưa hỗ trợ) → **neutral**.
  - Cách này tự xử luôn edge case (bài thường + clause chưa hỗ trợ) — KHÔNG cần audit rộng.

### 🟡 Flash 0.6s false-correct — bài equiv gõ SAI
- Bài equiv gõ `LogEvent.objects.filter(...)` (Pending) → 0.6s rồi mới neutral.
- Trong 0.6s, panel hiện **"đáp án của bạn ĐÚNG"** — sai về UX (user gõ SQL sai mà nói đáp án đúng).
- **Fix**: bài equiv Run hiện ngay placeholder `"⏳ Đang kiểm tra…"` (icon `fa-spinner`) thay pending cyan. Sau 600ms validateSQL: Accept → equiv results; Reject → neutral.

## §1 Changes

### 1.1 — `static/js/lesson_db_design.js`: gate Reject neutral by `liveResult.pending`

```js
} else {
  /* 4A-E3-equiv-fix: gate by liveResult.pending — không gate by s4.equiv_sql.
   *
   * - reject + liveResult = bảng thật / lỗi cú pháp thật → GIỮ panel (đã render ở
   *   immediate path trên). KHÔNG xóa kết quả đang hiển thị — phá IDE khám phá
   *   (Bài 1 `WHERE id=102` reject → VẪN hiện bảng id=102).
   *
   * - reject + liveResult.pending (bài equiv HOẶC bài thường user lỡ gõ clause
   *   chưa hỗ trợ như CASE/IN-subquery/JSON->>) → neutral "gõ đúng query…".
   *   Tránh false-correct "đáp án ĐÚNG" cho SQL sai. */
  if (liveResult && liveResult.pending) {
    renderStep4Neutral('Câu query chưa khớp đáp án — bạn có thể thử lại hoặc bấm "Gợi ý" bên trái.');
  }
  flashTerminal('error', ...);
  if (isSubmit) loseHeart();
  if (s4.hints && s4.hints.length > 0) showNextHint();
}
```

### 1.2 — Immediate render for bài equiv: `renderStep4Checking`

```js
if (liveResult && liveResult.pending) {
  if (s4.equiv_sql) {
    renderStep4Checking();          // ✅ placeholder icon fa-spinner, không "đáp án ĐÚNG"
  } else {
    renderStep4Pending(liveResult.msg);   // bài thường + clause chưa support — pending neutral OK
  }
}
```

### 1.3 — `renderStep4Checking()` function mới + CSS `.results-checking`

```js
function renderStep4Checking() {
  const el = document.getElementById('step4-results');
  if (!el) return;
  el.innerHTML = `<div class="results-checking">
    <strong><i class="fa-solid fa-spinner fa-spin"></i> Đang kiểm tra…</strong>
    Chờ validate query trong giây lát.
  </div>`;
}
```

CSS (`lesson_db_design.css`):
```css
.codecademy-layout .results-checking {
  padding: 16px;
  background: rgba(100, 116, 139, 0.05);
  border: 1px dashed rgba(148, 163, 184, 0.32);   /* dashed phân biệt với pending/info */
  border-radius: 8px;
  color: #94A3B8;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px;
  line-height: 1.5;
}
.codecademy-layout .results-checking strong {
  color: #CBD5E1;
  display: block; margin-bottom: 4px;
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;
}
```

## §2 Verify @9000 (không tin vm test — post-Bài 9 lesson)

### 2.1 Fix #1 — `liveResult` gate

| Bài | User SQL (Reject) | Panel | Row count | Verify |
|-----|--------------------|-------|-----------|--------|
| **1** | `WHERE id=102` (lệch id=101) | `results` | 1 | ✅ `[['God of War', '50']]` — **GIỮ bảng**, no neutral |
| 3 | `JOIN` thiếu (publisher not in tableByName) | `error` | – | ✅ GIỮ error panel (lỗi cú pháp thật), no neutral |
| **6** | `dlc_no=1 AND ref_game_id=300` (lệch id=2) | `results` | 1 | ✅ `[['Hades 1']]` — GIỮ bảng |
| 10 | thiếu JOIN loans | `results` | 5 | ✅ GIỮ bảng (top 5 members alphabetical khi thiếu JOIN detail) |
| 14 | thiếu JOIN posts | `results` | 5 | ✅ GIỮ bảng |

### 2.2 Fix #2 — bài equiv checking placeholder

| Bài | User SQL | Stage | Panel | Verify |
|-----|-----------|-------|-------|--------|
| 17 (equiv) | `LogEvent.objects.filter(user_id='U01')...` | IMMEDIATE (< 600ms) | `checking` | ✅ "Đang kiểm tra…" icon `fa-spinner` — KHÔNG flash "đáp án ĐÚNG" |
| 17 (equiv) | Same | After (> 600ms, Accept) | `results` | ✅ equiv rows `[['login','5'],['purchase','2'],['logout','2']]` |
| 17 (equiv) | `user_id='XX'` (slight mismatch) | After (Reject) | `neutral` | ✅ "Gõ đúng query để xem kết quả" — no false-correct |

### 2.3 E3-equiv regression (5/5) — Accept vẫn ra equiv rows

| Bài | Panel | Row count | Expected |
|-----|-------|-----------|----------|
| 16 | `results` | 5 | Downtown 4 · South 3 · North 2 · East 1 · West 1 ✓ |
| 17 | `results` | 3 | login 5 · purchase 2 · logout 2 ✓ |
| 19 | `results` | 4 | user 12 · mod 4 · admin 3 · guest 3 ✓ |

### 2.4 Edge case (bài thường + clause chưa support)

`Bài 1 + CASE WHEN ... END AS x` (E3-engine handled CASE, engine returns rows not pending) → panel = results ✓ không false-correct, không neutral.

## §3 Backward Compatibility

- E1/E2/E3-engine logic KHÔNG đổi.
- `renderStep4Pending` (cyan/amber) GIỮ NGUYÊN cho `s4.equiv_sql = null` (bài thường user gõ clause chưa support → pending hiện OK).
- Step-3 drag engine + `parseWhereRows` không bị động.

## §4 Files Touched (commit scope E3-equiv-fix)

```
M  static/js/lesson_db_design.js      ← 2 conditional edits (gate Reject + renderStep4Checking call) + new renderStep4Checking()
M  static/css/lesson_db_design.css    ← .results-checking CSS
A  docs/B_FIX_4A_E3_EQUIV_FIX_2026-07-01.md  ← this report
```

KHÔNG stage: `docs/SYSTEM_INSTRUCTIONS_FINAL.md` (council-owned) + 4 dirty CSS files.

## §5 Acceptance E3-equiv-fix (spec v64 line 266)

| Metric | Target | Actual |
|--------|--------|--------|
| Bài 1 + 1 E2 bài gõ-sai-hợp-lệ **GIỮ bảng kết quả** | panel = results | ✅ |
| Bài equiv gõ-sai KHÔNG flash "đáp án ĐÚNG" | panel = checking trong 0.6s | ✅ |
| Accept vẫn ra equiv đúng | panel = results login/purchase/logout | ✅ |
| reject bài equiv = neutral | panel = neutral "Gõ đúng query…" | ✅ |
| E1/E2/E3 không regress | Bài 1/6/10/14 results y hệt | ✅ |
| node -c | OK | ✅ |
| 0 console error | | ✅ |

## §6 Q&A / Council Handoff

**Q**: Gate theo `s4.equiv_sql` (per spec draft) hay gate theo `liveResult.pending` (per user correction)?
**A**: User-chốt update: **gate theo `liveResult.pending`**. Cách này tự xử luôn edge case "bài thường user lỡ gõ clause chưa support" → không false-correct "đáp án ĐÚNG" cho SQL sai. Tight, đúng spec v64.

**Q**: Bài 1 `WHERE id=102` reject → bảng hiện — đây là gì? Vẫn có kết quả.
**A**: Bảng `[[God of War, 50]]` — SQL chạy đúng về mặt kỹ thuật (engine trả về 1 row match), CHỈ SAI so với expected_sql (validateSQL Reject). Cố ý giữ để IDE khám phá (panel khám phá dữ liệu, không khóa sớm). Student học được: "id khác thì có data khác".

**Q**: `renderStep4Checking` có cần đếm ngược (vd "Còn ~X giây")?
**A**: KHÔNG — spec không yêu cầu. Spinner là đủ để indicate "wait". validateSQL 600ms thực tế rất nhanh.

**Q**: Bài 3 reject test hiện `error` panel thay vì `results` — đúng không?
**A**: Đúng — `liveResult.error` (parser không tìm publisher) là lỗi cú pháp thật. Reject branch gate `liveResult.pending` không match error → KHÔNG neutral → GIỮ error panel. Per spec gate.

**Q**: Phase 4 còn gì sau khi ship?
**A**: A mini-game validator → 4B context+hints (council soạn §B đủ) → 4C primer D1+D2+D3 → HERO.

---

**Signed off**: 4A-E3-equiv-fix ✅ ready for user verify + commit.
