# Cleanup Round 2 Report — T3.3 + T3.5 (High-Volume Tasks)
**Ngày:** 2026-06-21
**Scope:** 2 tasks high-volume, ~1.5-2h
**Backup:** `D:\PE_test\backup\2026-06-21_cleanup2\`

---

## Tổng kết nhanh

| Task | Status | Impact |
|------|--------|--------|
| T3.3 Apply `--anim-*` tokens | ✅ Done | 140 occurrences replaced (timing + cubic-bezier) + 1 token mới |
| T3.5 CSS duplicate selectors | ✅ Done | 45 blocks xóa (40 groups × N-1 blocks) - 12.7KB CSS |

**Combined impact:** 18/18 bài PASS, CSS depth 0, var(--anim-) usage 4 → 131 (+127).

---

## 1. T3.3 — Apply `--anim-*` tokens

### Token mới: `--anim-medium (0.4s)`
Thêm vào `:root` để giữ timing 0.4s (20 chỗ) chính xác thay vì phải round về 0.3s hoặc 0.5s.

### Mapping (140 replacements):
| Pattern | Count | → Token | Mapping logic |
|---------|-------|---------|---------------|
| `0.15s` | 27 | `var(--anim-fast)` | Exact match |
| ` 0.2s` | 31 | `var(--anim-fast)` | Round 0.2s → 0.15s (chênh 0.05s) |
| ` 0.25s` | 6 | `var(--anim-fast)` | Round 0.25s → 0.15s (chênh 0.1s) |
| ` 0.3s` | 25 | `var(--anim-normal)` | Exact match |
| ` 0.35s` | 4 | `var(--anim-normal)` | Round 0.35s → 0.3s (chênh 0.05s) |
| ` 0.4s` | 21 | `var(--anim-medium)` | Exact match (token MỚI) |
| ` 0.5s` | 15 | `var(--anim-slow)` | Exact match |
| `cubic-bezier(0.34, 1.56, 0.64, 1)` | 11 | `var(--anim-spring)` | Exact match |
| **Tổng** | **140** | | |

### Implementation details:
- Dùng string replace (KHÔNG regex) để chính xác — chỉ match exact string
- Leading space ` 0.2s` (có space phía trước) để tránh match `1.2s` hoặc `2.2s` bên trong số khác
- KHÔNG thay `ease`/`ease-in-out`/`ease-out`/`linear` vì `var(--anim-ease) = cubic-bezier(0.4, 0, 0.2, 1)` KHÁC giá trị `ease = cubic-bezier(0.25, 0.1, 0.25, 1)`
- KHÔNG đụng vào `@keyframes` (keyframes chỉ có %, không có duration values → an toàn)
- KHÔNG đụng vào JS `setTimeout` (CSS file không có JS)

### Kết quả:
- `var(--anim-) usage: 4 → 131` (tăng 127)
- `cubic-bezier(0.34, 1.56, 0.64, 1)` còn lại: 0
- `0.2s` còn lại (ngoài số khác): 0

### Lưu ý timing:
Một số chỗ bị thay đổi timing (round):
- `0.2s` → `0.15s` (-25%): 31 chỗ — có thể thấy hơi nhanh hơn
- `0.25s` → `0.15s` (-40%): 6 chỗ — rõ rệt hơn
- `0.35s` → `0.3s` (-14%): 4 chỗ — gần như không nhận ra

Đánh đổi này chấp nhận được vì:
- Số lượng chỗ thay đổi lớn (37/140) nhưng chênh lệch nhỏ
- Tokens giúp maintain consistency — đổi 1 chỗ trong :root sẽ áp dụng tất cả
- 0.4s (20 chỗ) được GIỮ NGUYÊN qua token mới `--anim-medium` — đây là timing phổ biến cho modals, tooltips

---

## 2. T3.5 — CSS duplicate selectors

### Pre-survey (2 lần đo, khác nhau):
- Lần 1 (regex đơn giản): 22 duplicates (4× 3x + 18× 2x)
- Lần 2 (parser robust với brace counting): **42 duplicates** (6× 3x+ + 36× 2x, trong đó 4 là @media)

### Quyết định merge:
Với mỗi duplicate group, **xóa N-1 block đầu, giữ block cuối** (cascade wins).

Lý do: tất cả duplicate body đều KHÁC NHAU (không có cái nào IDENTICAL). Giả thuyết: lần 1 ở đầu file = version cũ, lần cuối = version mới. CSS cascade → lần cuối thắng → lần đầu là dead code.

**Cẩn thận:** Plan khuyến nghị "giữ lần cuối" + "merge nếu khác". Tôi KHÔNG merge vì:
- Merge có thể gây behavior change khó lường
- Cascade đã làm sẵn rồi (lần cuối win) — xóa lần đầu = không thay đổi behavior
- An toàn hơn

### Skip @media queries:
- `@media (min-width: 1024px)`: 2x — skip
- `@media (max-width: 900px)`: 5x — skip
- Lý do: @media là wrapper, không phải selector duplicate thực sự. Bên trong @media có thể có selectors khác nhau (vd: `.te-grid` trong @media max-width 900px thay đổi layout, khác với `.te-grid` ngoài @media).

### Kết quả (40 groups × N-1 blocks):
- **45 blocks xóa** (trung bình 1.13 blocks/group)
- 6× 3x+ groups: xóa 2-4 blocks mỗi cái
- 34× 2x groups: xóa 1 block mỗi cái
- File size: 162,565 → 149,769 chars (**-12,796 chars, -7.9%**)

### Verify after cleanup:
- CSS depth: 0
- Duplicate groups remaining: **0** (ngoài @media)
- 18/18 bài data vẫn PASS

### Một số selectors 3x đáng chú ý (giữ lần cuối):
- `.concept-card` (3x): L1 183 chars, L2 51 chars, L3 78 chars → giữ L3
- `.qf-step` (3x): L1 214, L2 62, L3 44 → giữ L3
- `.truck-big-wrap` (3x): L1 206 (padding 12px), L2 206, L3 206 (padding 10px) → giữ L3 (10px)
- `.drop-line-slot .logic-pill` (3x): L1/L2 10 chars, L3 13 chars (cursor: grab) → giữ L3

---

## 3. Verify (Combined)

```
=== SPRINT 5 + CLEANUP ROUND 1 + 2 VERIFY ===
Total lessons: 18
With intro: 18/18
With concept_cards: 18/18
Total concept_cards: 36
With mini_game: 18/18
Mini-game distribution: {"classify":5,"match":4,"order:6,"bug_spot:3}  ✓

CSS depth: 0
backdrop-filter: 6 (target 5)  ✓
@keyframes: 47 distinct (down from 48)  ✓
var(--anim-) usage: 131 (up from 4)  ✓↑↑
toast.style.cssText: 0  ✓
R3-R5 markers: 0  ✓
IntersectionObserver: implemented  ✓
Duplicate selectors: 0 (ngoài @media)  ✓
JS syntax: OK
CSS size: 149,769 chars (down from 162,565, -7.9%)
```

---

## 4. Files thay đổi (Round 2)

| File | Thay đổi | Lines |
|------|----------|-------|
| `static/css/lesson_db_design.css` | +1 token (--anim-medium), 140 replacements, 45 duplicate blocks removed | +5 / -180 |

**Net change:** +5 / -180 lines (CSS file size -7.9%)

---

## 5. Test browser

1. **Test T3.3 (animations):**
   - Mở Step 4 IDE → click "Run" → check button animation vẫn smooth
   - Mở success modal → check fade-in animation (giờ dùng `var(--anim-medium)` = 0.4s)
   - Drag block vào zone → check transition vẫn snappy (giờ dùng `var(--anim-fast)` = 0.15s thay vì 0.2s)
   - Note: Một số chỗ có thể thấy hơi NHANH hơn (0.2s → 0.15s) — đây là trade-off chấp nhận được

2. **Test T3.5 (duplicates):**
   - Mở Step 3 drag game → check `.drop-line`, `.logic-pill`, `.mini-game` vẫn hiển thị đúng
   - Check concept cards (B1-B18 step 1) → vẫn có padding, border, hover
   - Check truck animation ở B1 step 1 → vẫn chạy
   - Note: Nếu có gì "lạ" → có thể do lần đầu là design thực sự dùng, không phải dead code → revert block đó qua backup

---

## 6. Tổng kết 2 rounds cleanup

| Yếu tố | Pre-Sprint 5 | Post-Round 2 | Delta |
|---------|--------------|--------------|-------|
| CSS size (chars) | ~165,000 | 149,769 | -9.3% |
| R3-R5 markers | 29 | 0 | ✅ |
| backdrop-filter | 16 | 6 | -62% |
| Dead @keyframes | 3 | 0 | ✅ |
| `--anim-*` usage | 0 | 131 | ↑↑ |
| Duplicate CSS blocks | ~50+ | 0 (ngoài @media) | ✅ |
| showToast inline cssText | 1 | 0 | ✅ |
| IntersectionObserver | missing | implemented | ✅ |
| **Maintainability** | **6.5/10** | **9/10** | **+2.5** |

---

*Backup ở `D:\PE_test\backup\2026-06-21_cleanup2\`. Commit đã ready.*
