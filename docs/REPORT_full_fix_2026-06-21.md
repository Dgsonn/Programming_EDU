# Báo cáo sửa lỗi 18 bài Database Design — 2026-06-21 (Full Comprehensive)

**Người thực hiện:** Mavis (mavis)
**Căn cứ:** `docs/review-for-minimax-2026-06-21.md` (Claude review)
**Phạm vi:** Comprehensive (P0 + P1 + P2 + P3) theo user chọn
**Backup:** `D:\PE_test\backup\2026-06-21_full_fix\`

---

## 1. Tổng kết thay đổi

### Phase 1 — Critical (P0): Fix 16/18 bài Step 4 trống
- **Vấn đề gốc:** 16 bài có `challenge_type: 'fill_blank'` hoặc `'bug_fix'` nhưng thiếu `template`/`blanks` → pane render trống (đúng triệu chứng ảnh 2 user chụp).
- **Fix:** Đổi tất cả 17 bài (trừ db_03) sang `challenge_type: 'full_ide'` + tạo `starter` cho 13 bài thiếu (db_07 → db_18 + db_13 nâng cấp SQL Boss Battle).
- **Bonus fix:** 3 bài step_2 có format lẫn lộn (db_08, db_10, db_11 — vừa `mcq:[]` vừa flat `question/options`) → xóa flat duplicate.

### Phase 2 — P0: Thêm visual cho db_10, db_11, db_13
- 3 bài trước đó thiếu hoàn toàn `step_1.visual` → user chỉ thấy text + concept cards, không có schema/data_preview.
- Thêm diagram (before/after NF) + schema + data_preview cho 3 bài.

### Phase 3 — P0: Fix db_13 MCQ flat → array format
- `step_2` chỉ có FLAT `question/options` → không match MCQ renderer.
- Convert sang `mcq: [{question, options}]` + thêm câu MCQ thứ 2 (junction table).

### Phase 4 — P0: Thêm mini_game cho db_18
- `step_2` chỉ có MCQ, không có mini_game.
- Thêm classify mini_game: 7 thẻ hash algorithm (md5/sha1/sha256/bcrypt/argon2/scrypt/plain) → 2 bin (safe/unsafe).

### Phase 5 — P1: Consistency
- ✅ Nâng hints lên 4 levels cho 8 bài đang có 3 levels (db_10, db_11, db_13, db_14, db_15, db_16, db_17, db_18) — thêm level 1 conceptual hint.
- ✅ Thêm option thứ 4 cho 10 câu MCQ bài 14-18 (đang chỉ 3 options).
- ✅ Thêm `step_4.schema` cho 4 bài thiếu: db_05 (dlc_content), db_06 (game), db_09 (loans), db_12 (course_instructor).
- ✅ Đã có sẵn `challenge_type` cho 8 bài từ Phase 1 (db_10 → db_18).

### Phase 6 — P2: Content quality
- ✅ Chuẩn hóa lon/lat db_15: data trước dùng `(lat, lon)`, concept_card + MCQ + step_3 đều dùng `(lon, lat)` → đổi data_preview + step_4.data sang `(lon, lat)` để khớp với convention.
- ✅ Nâng cấp SQL Boss Battle db_13: từ `SELECT username, country FROM users WHERE is_premium = true` (đơn giản) → multi-table JOIN + GROUP BY + ORDER BY + LIMIT 3 (top 3 user premium có nhiều post nhất).
- ⏸️ Nội dung 1NF/2NF db_08: SKIP — sau khi đọc kỹ, content hiện tại đã đúng 1NF atomic (tách multivalued), không có vấn đề như review nói.

### Phase 7 — P3: Polish
- ✅ Xóa dispatch duplicate trong `lesson_db_design.js`: `renderMiniGameDispatcher` (dead code, không được gọi) → xóa. Giữ lại dispatch trong `renderMiniGame` (line ~463).
- ✅ Thêm `:focus-visible` accessibility CSS: ring outline 2px primary + box-shadow khi dùng bàn phím (Tab), không hiện khi click chuột.
- ✅ Thêm ARIA labels cho ER diagram SVG: `role="img"` + `aria-label` cho `<svg>` và từng `<rect class="er-entity-rect">` + connector.
- ⏸️ Xóa CSS dead code (~250 dòng duplicate): SKIP — đã detect 27 duplicate selectors trong 5757 dòng CSS, nhưng xóa tự động rủi ro cao (có thể phá style), cần test thực tế từng cái. Khuyến nghị: làm trong session sau với screenshot diff.

---

## 2. Files đã thay đổi

| File | Thay đổi | Backup |
|------|----------|--------|
| `static/js/lesson_content.js` | +18 bài: challenge_type, starter, MCQ, mini_game, hints, schema, visual cho 3 bài | ✅ |
| `static/js/lesson_db_design.js` | -14 dòng (dispatch duplicate), +ARIA cho SVG | ✅ |
| `static/css/lesson_db_design.css` | +25 dòng (:focus-visible) | ✅ |

Không đụng: `templates/lesson_db_design.html`, các file khác.

---

## 3. Syntax check

```
lesson_content.js: OK (length 203556)
lesson_db_design.js: OK (length 127204)
```

---

## 4. Hướng dẫn test từng bài (18 bài)

Vào http://localhost:5000/db-design và test qua từng bài:

### Test flow chung cho mỗi bài:
1. **Step 1 (Lý thuyết):**
   - Có concept_cards (2 thẻ) hiển thị đẹp
   - Có hình minh họa (diagram) — 18 bài đều có
   - Có schema + data_preview (cả db_10, db_11, db_13)
2. **Step 2 (MCQ + Mini-game):**
   - 2 câu MCQ có 4 options (bài 14-18 đã fix)
   - Mini-game có và tương tác được (db_18 đã thêm)
3. **Step 3 (Drag-drop SQL):**
   - Kéo thả block SQL → build query đúng
4. **Step 4 (Code editor):**
   - Editor CodeMirror hiển thị **CÓ NỘI DUNG** (quan trọng nhất! toàn bộ 18 bài giờ có starter)
   - Click Run/Submit → so sánh với expected_sql
   - Click tab "Gợi ý" → hiện 4 levels (bài 10-18 đã nâng cấp)

### Bài đặc biệt cần test kỹ:

| Bài | Điểm test |
|-----|-----------|
| db_01 | Editor có starter (-- Tìm name + price...) — ảnh 2 cũ |
| db_02 | Editor có starter với AS age |
| db_03 | full_ide với starter mặc định |
| db_04 | full_ide (đã đổi từ bug_fix) |
| db_05 | step_4 có schema dlc_content + starter |
| db_06 | step_4 có schema game + starter JOIN |
| db_07 | step_4 có starter + schema từ step_1 |
| db_08 | step_2 đã sạch (không còn flat question) |
| db_09 | step_4 có schema loans + starter |
| db_10 | step_1 CÓ visual (diagram + schema + data_preview) |
| db_11 | step_1 CÓ visual + step_2 sạch |
| db_12 | step_4 có schema course_instructor + starter |
| db_13 | **BOSS BATTLE** — multi-table JOIN + GROUP BY + LIMIT 3 |
| db_14 | step_2 MCQ 4 options + step_4 hints 4 levels |
| db_15 | **lon/lat đồng bộ** — data dùng `(lon, lat)` |
| db_16 | step_2 MCQ 4 options |
| db_17 | step_2 MCQ 4 options |
| db_18 | **CÓ mini_game** classify hash algorithm |

---

## 5. Đề xuất tiếp theo (P3 deferred)

1. **CSS dead code** — cần screenshot diff từng lesson để biết duplicate nào unused, KHÔNG xóa đại được.
2. **Light mode** — CSS hiện dark-only, user có muốn thêm light toggle?
3. **Adaptive difficulty** — backend `/api/progress` + `user_lesson_progress` table.
4. **i18n** — khi cần EN translation, dùng pattern `i18n('lesson.db_01.intro')`.

---

*Đã commit: xem `git log` (nếu đã commit). Nếu cần rollback: copy file từ `backup/2026-06-21_full_fix/`.*
