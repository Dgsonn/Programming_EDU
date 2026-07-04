# TC/NC Implementation Plan — GameHub Saga (2026-07-04)

**Nguồn chân lý nội dung:** `DATABASE_DESIGN_3_COURSE_RECOMMENDATION.md` v3 + §8 Saga (syllabus 21+25 bài đã chốt, KHÔNG bàn lại).
**File này:** kế hoạch THI CÔNG — kiến trúc shell, pipeline nội dung, xử lý engine, thứ tự build.

## 0. Quyết định đã chốt (user 2026-07-04)
1. **Concept cards = Hybrid** — per-lesson như Basic; riêng NC Module 8 dùng card CHEN GIỮA bài (route `/card/<id>` — làm ở pha NC, không chặn TC).
2. **Ticket đánh số tiếp nối**: TC = **#21–#41** (GameHub Community), NC = **#42–#66** (GameHub Marketplace). Release theo sản phẩm: Community v1.0/v2.0/v3.0 (hết M4/M5/M6), Marketplace tương tự M7/M8/M9.
3. **Shell trước, tc_01 sau** — dựng khung chạy được rồi đổ content.
4. **UI y hệt Basic** — tái dùng 100% template + renderer + CSS; TUYỆT ĐỐI không fork giao diện (user muốn tối ưu 1 giao diện duy nhất).

## 1. Kiến trúc shell TC (thứ tự thi công)

| # | Việc | File | Ghi chú |
|---|---|---|---|
| 1 | Data file mới `lesson_content_tc.js` — `window.LESSON_CONTENT['db_design_tc']` | static/js/ | Tách file vì lesson_content.js đã ~5.5k dòng; cùng schema 4-step |
| 2 | Parameterize course: `init()` đọc course id từ `<body data-course>` (template var) thay vì hardcode `'db_design'` | lesson_db_design.js + template | Fallback `'db_design'` → Basic không đổi hành vi |
| 3 | Route: `_LESSON_TEMPLATES['db_design_tc'] = 'lesson_db_design.html'` + truyền `course_id` vào template + `<script src=lesson_content_tc.js>` conditional | routes/main.py, template | |
| 4 | Per-course config thay số hardcode: `COURSE_CFG = { db_design: {chapterEnds:[7,14,20], releases:['v1.0','v2.0','v3.0 — RA MẮT TOÀN CẦU'], modules:{1:amber,2:indigo,3:emerald}}, db_design_tc: {chapterEnds:[4,10,20(+boss=21)], releases:['Community v1.0','v2.0','v3.0'], modules:{4:?,5:?,6:?}} }` | lesson_db_design.js (triggerModuleCelebration, module accent) | Màu module 4-6: chọn bằng skill design-system/ui-ux-pro-max, PHẢI cùng dark palette hiện có |
| 5 | Course card TC trên dashboard/courses + roadmap page (bản sao course_db_design đọc theo course id) | course pages | Khóa mở khi Basic tốt nghiệp? (mặc định: mở tự do, hiện badge "Phần 2") |
| 6 | Progress/enrollment: course_id mới trong bảng enrollments — kiểm tra schema DB hiện có trước khi thêm | routes + db | |

**Định nghĩa xong shell:** `?lesson=1` của `db_design_tc` chạy đủ 4 step với 1 bài placeholder tc_01, overlay cuối module hiện "SHIP … COMMUNITY v1.0", Basic không thay đổi 1 pixel (regression test bằng audit_full.js).

## 2. Engine — xử lý cú pháp TC/NC mà PE_runSQL không chạy được

PE_runSQL chỉ chạy SELECT-family. Chiến lược 3 tầng (tiền lệ Basic đã dùng cho ST_DWithin/ORM/`%s`):
1. **Chạy được** (GROUP BY/JOIN/CTE-giả-lập bằng bảng phụ…) → chạy thật, hiện bảng kết quả.
2. **Không chạy được nhưng hợp lệ** (CREATE TRIGGER, CREATE PROCEDURE, WITH RECURSIVE, ROLLUP/CUBE, EXPLAIN…) → `{pending}` + validateSQL string-match làm cổng chấm. Với bài có kết quả minh hoạ quan trọng → dùng `equiv_sql` (bài 16/17/19 Basic đã có cơ chế) để hiện bảng kết quả tương đương.
3. **Thuần khái niệm** (Buffer, B+-tree, WAL, ARIES, Deadlock) → step-3/4 đổi dạng: step-3 dùng zone đặc thù (như chain-zone/inject-zone Basic), step-4 = fill_blank/bug_fix (challenge_type đã hỗ trợ) thay vì full_ide. KHÔNG cố nhét SQL vào chỗ không có SQL.

Mỗi bài TC khi draft PHẢI ghi rõ tầng nào; expected_sql luôn phải qua được `PE_runSQL` không-error (ok hoặc pending) — đây là gate tự động trong pipeline.

## 3. Pipeline nội dung mỗi bài (chuẩn Bài-1, đúc từ Basic)
Checklist bắt buộc (tự verify bằng Playwright trước khi đánh dấu xong):
- [ ] `story {tag: '🎫 GameHub Community · Ticket #NN', hook}` — đúng luật saga (bảng thật, không đơn vị thời gian, kết bằng nhiệm vụ, `<em>` khớp hero)
- [ ] Hero SVG đúng đề + đúng domain Community (KHÔNG chữ A/B/C suông; bảng thật user/post/comment/follow/like)
- [ ] Concept cards có citation Silberschatz (chương Part 4-7 tương ứng)
- [ ] MCQ 2 câu, mỗi câu ĐÚNG 1 correct, distractor có explanation; verify độc lập trước khi commit
- [ ] Mini-game 1 type phù hợp (classify/match/order/bug_spot)
- [ ] Step-3: zone chuẩn nếu là SQL; zone đặc thù nếu khái niệm; expected_sql chạy auto-solve được (audit script)
- [ ] Step-4: context 5 khối {scenario, real_world, steps, hint_explore, expected} + hints 4 mức + tầng engine ghi rõ; **Step 4 ≠ Step 3 và khó hơn thật**
- [ ] XP ~126/bài (theo doc v3)

## 4. Schema GameHub Community (TC project)
`users(user_id, username, country, joined_at)` · `posts(post_id, user_id, content, created_at, like_count)` · `comments(comment_id, post_id, user_id, parent_comment_id, content)` · `follows(follower_id, followee_id)` · `likes(user_id, post_id, liked_at)` · M5 thêm `fact_post_action(user_id, post_id, date_id, action_type, count)` + `dim_date`. (Đúng schema Minimax v3, chỉ đổi vỏ.)

## 5. Thứ tự build + checkpoint duyệt
1. **Shell** (§1, mục 1-4 trước — 5/6 sau nếu cần sớm) → user xem placeholder chạy thật.
2. **tc_01 draft** (SQL từ ngôn ngữ lập trình — JDBC/Embedded/Cursor; Ticket #21 mở màn Community: "GameHub tuyển bạn dựng backend cho mạng cộng đồng — câu SQL đầu tiên phải gọi được TỪ CODE") → **user duyệt giọng + format** ⏸️
3. M4 còn lại (tc_02-04) → checkpoint ⏸️ → M5 (6 bài) → M6 (10 bài) → tc_boss → TC done.
4. NC: route `/card/<id>` (Hybrid) + M7-M9 theo cùng pipeline.

## 6. Rủi ro & guard
- **Đừng đụng Basic**: mọi thay đổi shared file (lesson_db_design.js, CSS) phải chạy lại `audit_full.js` trên Basic (regression gate).
- Trùng concept Basic↔TC: tc_08 (JSON Document Store) phải dạy góc NoSQL/document — KHÔNG lặp db_14 (JSONB path) → hook nối tiếp: "settings JSONB hồi Ticket #15 giờ lớn thành cả document store".
- lesson_content_tc.js cũng cần `node --check` + engine gate trong CI tay.
