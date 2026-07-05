# NC SHELL + nc_01 PILOT — SPEC (2026-07-05)

User chốt (AskUserQuestion 2026-07-05, 4/4 recommended):
1. **Phạm vi**: Shell + nc_01 pilot 10/10 + Card A → DỪNG duyệt (quy trình pilot Bài 1).
2. **Step 3 nc_01**: Pipeline 4 trạm trên bản đồ DÒNG CHẢY (đúng nguyên văn Interaction chính PART_6).
3. **Plan visual**: Component MỚI cây plan trực quan (node + mũi tên + số dòng chảy) — visual chính 10 bài M1; console step 4 vẫn EXPLAIN text mô phỏng khi cần (dev-tool thật).
4. **Card**: Nâng `/card` thêm micro quiz client-side (PART_6 bắt buộc: 1 visual + ≤4 dòng + 1 quiz + feedback).

## Nguồn nội dung (đã đối chiếu)

- **PART_6 Bài 1** (roadmap p4): dạy sâu — pipeline 3 bước (parsing & translation / optimization / evaluation); SQL dịch sang dạng nội bộ; 1 query nhiều cách chạy; plan = algorithm/index cụ thể; engine chạy plan. KHÔNG dạy: compiler chi tiết, recursive views, algebra formalism đầy đủ. Output learner: hiểu pipeline + **phân biệt SQL text và execution plan**. Interaction: kéo SQL qua 4 trạm Parser → Algebra Tree → Optimizer → Evaluation Engine, mỗi trạm reveal một phần plan; UI hiện cùng 1 query với 2 plan khả dĩ.
- **Sách 15.1** (p718-720): parser soát syntax + tên bảng + view expansion → parse tree → algebra expression; ví dụ 2 cây σ/Π hoán vị cho `salary < 75000`; **evaluation primitive** = phép toán algebra + chú thích cách chạy; **plan** = chuỗi primitive; engine chạy plan; optimizer chọn plan rẻ nhất dựa **statistics**; optimizer KHÔNG chạy thử — ước lượng.
- **Format 5 Layers PART_6** ↔ khung 4 step: Layer 0+1 → step 1 (primer + plan visual), Layer 2 → step 3 (drag 4 trạm), Layer 3 → reveal_hints "💡 BẠN VỪA XÂY", Layer 4 → step 4 challenge. Step 2 MCQ là chuẩn nhà (TC đã dùng).

## Thiết kế

### Thế giới: GameHub Marketplace (Ticket #42+, module 7-9)
- nc_01 = **Ticket #42**. Bảng lõi M1: `listings(listing_id PK, item_name, category, price INT gem, seller_id FK)` 40.000 dòng (mẫu 4-5).
- Query xương sống bài 1: `SELECT item_name, price FROM listings WHERE price < 100;` (ô search "vật phẩm rẻ") — 2 cây: π→σ (khiêng hết rồi lọc) vs σ→π (lọc sớm) = bản dịch trực tiếp ví dụ sách p719.

### nc_01 — 4 step
- **Step 1**: primer nhà-hàng (order = SQL nói MÓN GÌ; thu ngân soát = parser; bếp trưởng dịch công thức = algebra; chọn cách nấu nhanh nhất = optimizer; phụ bếp nấu = engine). `step_1.plan_visual` (component mới): query + 2 cây side-by-side, số dòng chảy trên mũi tên (40.000 vs 1.204 — visual cost TRƯỚC công thức, đúng luật PART_6), badge "✓ Optimizer chọn". Schema panel = listings.
- **Step 2**: 2 MCQ (chuyện gì xảy ra NGAY SAU khi bấm Run → parser; vì sao nhiều plan mà vẫn phải đau đầu chọn → chi phí khác nhau, kết quả y hệt) + classify "khâu DỊCH vs khâu QUYẾT & CHẠY".
- **Step 3**: bản đồ 4 trạm (🛂 tiếp nhận / 🌳 bản dịch / ⚖️ bàn cân / 🏃 xưởng chạy), 5 khối (1 bịa: "chạy thử TẤT CẢ plan rồi giữ cái nhanh nhất" — misconception optimizer). Mỗi trạm drop đúng → reveal_hints nhả MỘT PHẦN plan thật (✓ syntax → cây algebra → optimizer so 2 plan → plan chạy, 1.204 dòng về đích). Zones không spoil tên trạm (placeholder dạng câu hỏi).
- **Step 4**: `mcq_code` — 4 "tấm thẻ" cho query MỚI (`category='armor' AND price<500`): SQL text / cây algebra / **execution plan (đúng)** / bảng kết quả. Kiểm đúng output learner "phân biệt SQL text và execution plan"; KHÁC hẳn câu hỏi step 3 (anti-boredom rule). Không đụng engine SQL → không cần probe.
- Hero SVG nc_01: dây chuyền 4 trạm + ngã ba 2 plan ở optimizer.

### Component `renderPlanVisual` (lesson_db_design.js + CSS)
- Data: `step_1.plan_visual = { query, trees: [{ name, note, chosen, nodes: [{op, kind: scan|filter|project|join, detail, rows}] }] }` — nodes đáy→đỉnh (leaf = bảng, root = kết quả), mũi tên ↑ mang badge số dòng.
- Mount: `<div id="plan-visual-mount" hidden>` sau `#primer-svg-mount`; bài không có plan_visual → hidden (Basic/TC không đổi).
- Tái dùng nc_02-10: thêm `cost` trên node sau này (field optional), tree nhiều nhánh (children lồng nhau — v1 chuỗi thẳng đủ cho nc_01, KHÔNG YAGNI cây n-nhánh vội, nhưng markup để dạng mảng node cho phép nâng).

### Card A — `nc_card_evaluation_primitive` (sau nc_01)
- Đúng format PART_6: 1 visual metaphor (cùng 1 phép σ, 2 "động cơ": quét tuần tự vs tra index) + ≤4 dòng + **micro quiz 1 câu** + feedback. `quiz` schema: `{question, options: [{label, correct, feedback}]}` — render client-side trong concept_card.html, chọn 1 phát khóa, không progress.
- CTA → `/courses/db_design_nc` (nc_02 chưa có). `back_href` per-card (concept_card đang hardcode về TC).

### Shell
- `lesson_content_nc.js`: `LESSON_CONTENT['db_design_nc']` (lessons: [nc_01], concept_cards: [Card A]).
- routes `_LESSON_TEMPLATES` += db_design_nc (restart Flask); template += script nc + plan-visual-mount; concept_card.html += script nc.
- `COURSE_MILESTONES.db_design_nc`: trophies {10:1, 20:2}, graduation 25, ship 'MARKETPLACE v(mod−6).0'.
- `MODULE_COLORS` 7/8/9: #818CF8 Indigo (Engine) / #FB7185 Rose (Concurrency) / #34D399 Emerald (Recovery).

### Verify (tương tác thật)
Login → /lesson/db_design_nc?lesson=1: story + hero + plan visual 2 cây; step 2 trả lời đúng/sai thật; step 3 kéo 5 khối (khối bịa bị từ chối, 4 trạm reveal); step 4 click 4 option (sai trước → highlight + explain, reset, đúng → success + link Card A); /card/nc_card_evaluation_primitive: quiz sai → feedback, quiz đúng → feedback ✓; regression: 1 bài Basic + tc_16 + tc_21 boss + card TC còn nguyên; 0 pageerror.
