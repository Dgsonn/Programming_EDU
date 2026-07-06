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

---

# ADDENDUM ĐỢT 2 (2026-07-05): nc_02 + nc_03 + Card B/C

User chốt 4/4 recommended: cụm nc_02+nc_03 · slider RAM thật trong plan visual · cost = đếm block/cú nhảy quy ms theo bảng giá sách (HDD 2018: seek 4ms, block 0,1ms — ghi rõ minh họa) · step-4 nc_02 = fill_blank tự tính.

## nc_02 — Ticket #43 "Vì sao query có giá?" (Ch 15.2)
- Kịch bản PART_6 nguyên văn: cùng query (300 đơn seller rải rác trong orders 100.000 đơn ≈ 1.000 block): Plan A Seq Scan = 1 seek + 1.000 block = **104ms**; Plan B Index = 300 cú nhảy × 4,1ms = **1.230ms** → optimizer chọn A dù đọc gấp 3 dữ liệu (twist đảo nc_01).
- renderPlanVisual v2 (backward-compat, nc_01 không đổi): `price{seek_ms,block_ms,note}` bảng giá; `tree.io{access:seq|random,seeks,blocks}` → tổng 💸 trên cây; `ram_slider{table_blocks}` → kéo M block cache: disk_blocks=blocks×(1−M/N), seq giữ 1 seek, random seeks giảm theo — cost live (sách 15.2: worst vs expected khi buffer lớn; RAM tT<1μs ≈ miễn phí).
- Step 3 = lập HÓA ĐƠN I/O (4 zone: A-seek/A-transfer/B/chốt sổ + khối bịa "nhảy hay liền cũng 0,1ms"); step 4 fill_blank tính 104/1230/A (template không SELECT → neutral render path có sẵn).
- Card B nc_card_cpu_vs_io (SSD tS≈90μs → cú nhảy rẻ ~44 lần, số block KHÔNG đổi; optimizer hiện đại không chỉ nhìn I/O) + quiz.

## nc_03 — Ticket #44 "Full Scan vs Index Scan" (Ch 15.3)
- Hook: CÙNG query lịch sử mua lúc nhanh lúc chậm — khách 20 đơn (index 82ms thắng sít) vs VIP 5.000 đơn (5.000 cú nhảy = 20.500ms ≫ seq 104ms; sách A4: "worse than linear search"). Plan visual: 2 cây, chosen = Seq Scan (đảo kỳ vọng), KHÔNG slider.
- Step 3 = 4 access path (tra PK nhảy 1 phát / khách ít đơn / VIP phản chủ / luật "secondary chỉ đáng khi lấy RẤT ÍT") + khối bịa "cứ có index là dùng"; step 4 full_ide conjunctive (probe OK: `WHERE buyer_id=88 AND status='delivered'` → 2 dòng) — plan mô phỏng "Index Scan → Filter" trong context (1 index + filter phần còn lại, đúng 15.3 complex selection).
- Card C nc_card_bitmap_scan (đánh dấu block chứa match rồi quét liền mạch — thoát n cú nhảy khi match nhiều) + quiz.
- Điểm treo ghi báo cáo: PART_6 còn Card D "Secondary Can Be Bad" đặt sau Bài 3 — nội dung đã dạy TRONG nc_03 và trùng ý card cầu TC "Index có phải lúc nào cũng thắng?" → đề xuất bỏ/chờ user quyết.

---

# ADDENDUM ĐỢT 3 (2026-07-05): nc_04 + nc_05 (Card D đã chốt BỎ)

User chốt 4/4 recommended: cụm nc_04+nc_05 (giữa 2 bài không có card — Card E sau bài 6) · sort sim BẤM-TỪNG-BƯỚC ở step 1 · nc_04 fill_blank tính run/pass + nc_05 full_ide JOIN thật · plan visual 3 cây cho 3 join mode. Card D bỏ theo đề xuất đợt 2 (user "Được").

## nc_04 — Ticket #45 External Sort-Merge (Ch 15.4)
- `renderSortVisual` (component mới, mount chung #plan-visual-mount qua `step_1.sort_visual`): mô hình thu nhỏ ĐÚNG Fig 15.4 sách — 12 block, M=3 → learner bấm 4 mẻ "nạp & sort" sinh 4 run → ra lệnh merge từng cặp (RAM 3 = 2 đường vào + 1 ra → 2 PASS) → output sort tăng dần. Số thật trong bài: 1.000 block, M=100 → 10 run → 1 pass (fill_blank 10/100/1).
- Step 3: 4 trạm nạp-mẻ/ghi-run/merge-N-way/thêm-pass; khối bịa = "nối đuôi các run khỏi merge" (misconception concatenate).

## nc_05 — Ticket #46 Join I (Ch 15.5.1-3)
- Retcon chuẩn hóa: orders bỏ item_name chép tay (di sản nc_03) → listing_id FK — story nối saga chuẩn hóa Basic; JOIN từ đây là bắt buộc.
- Plan visual 3 CÂY (pv-trees--wide): NLJ 303 seek + 120.003 block = 13.212ms · BNLJ 6 + 1.203 = 144ms ✓ chosen · INLJ 303 + 303 = 1.242ms. Twist: index KHÔNG thắng (inner 400 block quá nhỏ); phình 1 triệu món → INLJ lật — nhất quán triết lý nc_03. NLJ vs BNLJ: CÙNG 12 triệu phép so, chỉ khác I/O (nuance sách 15.5.2).
- Step 4 full_ide JOIN alias (probe_join j1 OK): SELECT o.order_id, l.item_name, o.total … WHERE o.buyer_id = 88.

## Engine guard mới (probe_join j3 — silent wrong)
`ORDER BY alias.cột` (vd `ORDER BY o.total`) bị engine NUỐT IM LẶNG → thêm reCheck scanUnsupportedTokens chặn pending-neutral (cùng lớp UPPER/ROLLUP). Không expected_sql nào dùng dạng này; tc_08 equiv_sql chạy ngoài scan — không ảnh hưởng (row-order equiv tc_08 vốn cosmetic).

---

# ADDENDUM ĐỢT 4 (2026-07-06): nc_06 + nc_07 + Card E

User chốt 4/4 recommended: cụm nc_06+nc_07 · sim hash build/probe BẤM-TỪNG-BƯỚC (component mới, cùng ngôn ngữ lệnh với sort sim) · nc_06 fill_blank tính hóa đơn + nc_07 full_ide GROUP BY thật · Card E "Hash Join & Skew" sau bài 6, CTA → bài 7.

## Số liệu canonical đợt 4 (giữ nhất quán NC world: orders 1.000 block · listings 400 block · M=100 · tS=4ms · tT=0,1ms; convention nhà: 1 lượt đọc liền mạch = 1 cú nhảy)
- Bài toán nc_06: báo cáo TOÀN SÀN mỗi đơn kèm tên món (orders ⋈ listings, không WHERE) — outer 3 block của Ticket #46 không còn.
- **BNLJ** (outer = listings 400 → 4 mẻ 100): 400 + 4×1.000 = 4.400 block + 8 nhảy = **472ms** (đương kim từ bài 5).
- **Sort-Merge chưa sort**: sort orders 3.000 (công thức br(2p+1), p=1 — nối bài 4) + ghi 1.000 + sort listings 1.200 + ghi 400 + merge đọc 1.400 = 7.000 block ≈ **≈820ms** → thua. NHƯNG 2 file ĐÃ sort theo listing_id: 1.400 block + 2 nhảy = **148ms**.
- **Grace Hash** (M=100): nh = 400/100 = **4 cặp xô**; 3(br+bs) = **4.200 block** + 18 nhảy = **492ms** — sát BNLJ, chưa knock-out.
- **Hash build-vừa-RAM** (báo cáo chỉ món <100 gem → build 1.204 dòng ≈ 12 block, số nc_01): br+bs = **1.400 block** + 2 nhảy = **148ms** — không cần sort.
- Twist kép: 2 nhà vô địch CÙNG GIÁ 148ms, khác ĐIỀU KIỆN (đã-sort → merge; build nhỏ → hash). Phình kho listings ×10 (4.000 block): BNLJ (outer orders 10 mẻ) 41.000 block ≈ 4.180ms vs grace hash 3×5.000 = 15.000 ≈ 1.668ms → hash knock-out khi CẢ HAI bảng đều to (đúng 15.5.5.4).
- nc_07: GROUP BY seller_id trên orders — **2.000 seller ≈ 20 block ô kết quả VỪA RAM** → hash-agg on-the-fly: đọc 1 lượt + cộng dồn ô = **1.000 block + 1 nhảy = 104ms** (sách 15.6.5: br transfers + 1 seek; ĐÚNG GIÁ seq scan nc_02 — "GROUP BY cả sàn giá bằng 1 lần quét"). Sort-agg: 3.000 block + 12 nhảy ≈ **348ms**, bonus kết quả RA ĐÃ XẾP. Nhóm KHÔNG vừa RAM (khách × ngày ≈ 1,2 triệu ô): phải chia xô ra đĩa như bài 6 → ≈3br.

## nc_06 — Ticket #47 "Join II: Merge Join & Hash Join" (Ch 15.5.4-5)
- `renderHashVisual` (mount chung #plan-visual-mount, nhánh `step_1.hash_visual`): mini-world 8 món listings → hash(id%4) 4 xô (xô 1 nhận 3 món — lệch nhẹ, chú thích dẫn Card E) + 6 đơn orders probe từng nhịp: mở ĐÚNG xô, so thật trong xô (đơn #9005→3007 cùng xô 3 với 3011 nhưng KHÔNG khớp — dạy "cùng xô chưa chắc khớp"). Click-driven như sort sim: 4 nhịp build (2 món/nhịp) → 3 nhịp probe (2 đơn/nhịp) → done/reset.
- Step 3 zones hj-hash/hj-build/hj-probe/hj-rule + bịa "Sort cả 2 bảng trước khi chia xô cho chắc" (hash KHÔNG cần sort — điểm bán hàng). Mini-game order 5 bước grace hash.
- Step 4 fill_blank tự tính: nh=**4** · grace 3(br+bs)=**4200** · build-vừa-RAM=**1400** (template pseudo-code → neutral path).
- Card E nc_card_hash_skew: xô lệch (Skin súng Neon 3004 chiếm 30.000 đơn → xô ~300 block > RAM); sách trị: tăng nh + fudge ~20% / overflow resolution (băm lại xô bằng hash khác) / avoidance; 1 GIÁ TRỊ chiếm trọn xô → băm lại VÔ ÍCH (mọi bản sao cùng hash) → fallback BNLJ riêng xô đó. Quiz đúng = "băm lại không cứu được cùng-giá-trị". CTA → bài 7.

## nc_07 — Ticket #48 "Aggregation & DISTINCT bằng Sort/Hash" (Ch 15.6.1 + 15.6.5)
- Plan visual v2 tái dùng: 2 cây Sort-Agg (3.000 block · 12 nhảy · 348ms) vs Hash-Agg on-the-fly (1.000 + 1 nhảy · 104ms ✓ CHỌN), KHÔNG slider. Story "Bảng vàng seller" leaderboard.
- Step 3 zones ag-scan/ag-hash/ag-update/ag-out + bịa "Gom HẾT đơn từng seller vào RAM rồi mới cộng" (on-the-fly chỉ giữ 1 Ô/nhóm — sum/count/min/max/avg; avg = sum÷count lúc đổ sổ). Mini-game classify SORT-AGG vs HASH-AGG (bonus sort: kết quả ra đã xếp).
- Step 4 full_ide: `SELECT seller_id, SUM(total) FROM orders GROUP BY seller_id;` — probe_groupby g1-g8: GROUP BY/SUM/COUNT(*)/WHERE/HAVING/ORDER BY SUM()/AVG đều ĐÚNG. DISTINCT dạy ở step 1/3 (cùng máy GROUP BY, SQL mặc định giữ trùng) nhưng KHÔNG cho gõ (guard).

## Engine guard mới (probe_groupby g5 — silent wrong)
`SELECT DISTINCT` trả cột "DISTINCT col" với mọi dòng RỖNG, không khử trùng → thêm reCheck chặn pending-neutral (cùng lớp UPPER/ORDER-BY-alias). Không expected_sql nào ở Basic/TC/NC dùng DISTINCT (đã grep).

---

# ADDENDUM ĐỢT 5 (2026-07-06): nc_08 + nc_09 + Card F/G

User chốt 4/4 recommended: cụm nc_08+nc_09 · sim CHẢY-TUPLE bấm-từng-bước cho nc_08 (cây 3 toán tử scan → σ → π, 2 chế độ materialize vs pipeline) · nc_08 mcq_code + nc_09 fill_blank · chuỗi card F (Iterator) → G (Blocking) → bài 9 (cả 2 card đặt sau bài 8, overlay hiện 2 link).

## nc_08 — Ticket #49 "Materialization vs Pipelining" (Ch 15.7)
- Hook: sao kê Ticket #47 đúng hóa đơn nhưng màn hình TRẮNG rồi mới hiện — đối thủ hiện dòng đầu ngay. 2 lợi ích pipeline theo sách 15.7.2: (1) bỏ tiền ghi+đọc temp; (2) dòng đầu trả sớm khi root nối pipeline với input.
- `renderFlowVisual` (mount chung, `step_1.flow_visual`): mini-world 6 món (3 đậu σ price<100: Kiếm 45/Mũ 35/Khiên 80), PER=2 món/nhịp. Mode GHI TẠM: 3 nhịp scan+σ đổ TEMP (đĩa) → 2 nhịp "π đọc temp" → output (dòng đầu NHỊP 4, temp 3 ghi + 3 đọc); mode PIPELINE: 3 nhịp, món đậu bay thẳng lên π-OUTPUT (dòng đầu NHỊP 1, temp 0). Chạy đủ 2 mode → status so sánh.
- Step 3 = dây chuyền demand-driven 4 trạm (scan nhả khi được HỎI / σ xét ngay trên dòng chảy / π cắt cột không chờ đủ bảng / root trả dòng đầu khi kho CHƯA đọc xong) + khối bịa "mỗi toán tử chạy XONG rồi ghi bảng tạm" (= materialize — đúng khái niệm, sai dây chuyền).
- Step 4 mcq_code: cây `π ← SORT ← σ ← SeqScan` (ORDER BY price món <100) — chọn đúng mô tả: σ/π pipeline được nhưng SORT chặn giữa 2 pha (15.7.2.2: tạo-run nhận dòng chảy vào, merge nhả dòng chảy ra, chặn nằm GIỮA); bẫy: "tăng work_mem thì sort hết blocking" (sai — blocking là bản chất logic, không phải thiếu RAM).
- Card F nc_card_iterator: open()/next()/close(), demand-driven = KÉO từ đỉnh (Volcano — executor Postgres); producer-driven = ĐẨY từ đáy (hệ compile machine-code chuộng). Quiz: ai khởi xướng? = root gọi next() xuống. CTA → /card/nc_card_blocking.
- Card G nc_card_blocking: sort = blocking điển hình (dòng bé nhất có thể nằm CUỐI) nhưng chặn chỉ nằm GIỮA 2 pha (run-gen pipeline với input, merge pipeline với output); hash join: build blocking / probe chảy. Quiz: sort giữa cây có giết pipeline cả cây không? = Không. CTA → bài 9.

## nc_09 — Ticket #50 "Optimizer: Pushdown, Join Reorder & né Cartesian" (Ch 16.1-16.2)
- Hook: dev viết query vụng (join hết rồi lọc), DBA không sửa chữ nào — optimizer tự VIẾT LẠI nhờ luật tương đương (16.2.1). Map ví dụ Music của sách sang GameHub: "đơn hàng các món của seller DragonForge".
- **Số canonical mới**: sellers = 2.000 seller ≈ 20 block (khớp nc_07); mật độ: 40.000 listings / 2.000 seller = 20 món/seller · 100.000 orders / 40.000 món = 2,5 đơn/món. Cây VỤNG: (listings ⋈ orders) = 100.000 dòng ghép → ⋈ sellers → 100.000 → σ → 50: hai tầng trung gian ~200.000 dòng. Cây SAU pushdown+reorder: σ(sellers) = **1** → ⋈ listings = **20** → ⋈ orders = **50** — meter 200.000 vs 71. Quên điều kiện nối (cartesian) sellers × listings = **80 TRIỆU** dòng trung gian.
- Step 1 = plan_visual 2 cây (VỤNG vs SAU BIẾN ĐỔI, rows badge trên mũi tên là nhân vật chính; io minh họa ≈580ms vs ≈159ms ghi chú ước lượng). Step 3 = 4 nước biến đổi (đẩy σ xuống / xuất phát từ bảng-sau-lọc nhỏ nhất / π pushdown cắt cột sớm / né cartesian) + bịa "đảo join phải xin phép dev — sợ đổi kết quả" (luật tương đương đảm bảo CÙNG kết quả). Step 2 mini-game order 5 bước biến đổi.
- Step 4 fill_blank pseudo-code (không SELECT → neutral): điền 1 / 20 / 50.
- Success tease nc_10: làm sao optimizer BIẾT 1 dòng/20 món mà không chạy thử? → statistics/histograms/EXPLAIN (bài 10, Cards H/I).

---

# ADDENDUM ĐỢT 6 (2026-07-06): nc_10 + Card H/I/J — KHÉP MODULE 7

User chốt 4/4 recommended: nc_10 + 3 card cuối khép module 7 (trophy MARKETPLACE v1.0) · HISTOGRAM TƯƠNG TÁC (component thứ tư) · step-4 bug_fix "sửa query làm optimizer mù" · chuỗi card H → I → J → trang khóa học.

## nc_10 — Ticket #51 "Cost-Based Optimizer: Statistics, Histograms, EXPLAIN & MV" (Ch 16.3-16.5)
- Trả lời câu treo bài 9: con số 1/20/50 lấy từ CATALOG STATISTICS (n dòng, n block, n distinct) + HISTOGRAM. Sách 16.3.1: equi-width vs equi-depth (equi-depth ưu hơn); không sổ → giả định ĐỀU.
- **Histogram bins canonical (orders.total)**: [0-100) 30.000 · [100-500) 40.000 · [500-1k) 15.000 · [1k-5k) 10.000 · [5k-10k) 4.980 · [≥10k) **20** — tổng 100.000 ✓. Điểm hòa vốn index ≈ 25 đơn (104/4,1 — khớp nc_03). Đoán đều = 100.000/6 ≈ 16.667/bin; cột bị bọc biểu thức → không tra được sổ → default ⅓ ≈ 33.333.
- `renderHistVisual` (mount chung, `step_1.hist_visual`): 6 cột bấm được; click bin → panel so 2 kịch bản: 📗 TRA SỔ (ước = count bin → index N×4,1ms vs seq 104ms → verdict theo hòa vốn 25) vs 📕 KHÔNG SỔ (đoán đều 16.667 → luôn seq — bin 20 đơn mất cơ hội index 82ms).
- Step 3 = 4 trạm CBO: sổ thống kê → ước selectivity (KHÔNG chạy thử) → gắn giá các plan ứng viên (bảng giá bài 2) → chọn rẻ nhất + EXPLAIN in bản án; khối bịa "sổ tự cập nhật theo TỪNG INSERT" (sai — sampling định kỳ, Card H).
- Step 4 **bug_fix** (khung tc_20): báo cáo whale `WHERE total + 0 > 10000` → optimizer KHÔNG tra được histogram trên cột bị bọc → est ⅓ kho ≈ 33.333 → Seq Scan; sửa dòng 2 thành `WHERE total > 10000` → Index Scan rows=20 est/82ms. Góc dạy KHÁC tc_20 (tc_20: hàm bọc làm INDEX mù; nc_10: biểu thức bọc làm ESTIMATE mù — cùng gốc sargable). Materialized view nằm ở concept card 3 + mcq 2 (bảng vàng seller tính sẵn — đọc ~20 block thay 1.000; giá = maintenance/refresh khi ghi).

## Engine guard mới (probe nc_10 — silent wrong)
`WHERE … cột±số` (total + 0, total * 1) → engine trả bảng RỖNG im lặng → reCheck `\bwhere\b[^;]*col [+-*/] số` chặn pending. Đã grep: không expected/hint nào dùng số học trong WHERE (tc_03 là UPDATE — guard UPDATE chặn trước); buggy của nc_10 chạy thử sẽ ra pending thay vì bảng rỗng (đúng pattern tc_20/UPPER).

## Card H → I → J (đều đặt sau bài 10, chuỗi như F→G)
- **H Histograms & ANALYZE**: sổ = lấy MẪU + cập nhật ĐỊNH KỲ (ANALYZE/autovacuum) — có thể CŨ; bulk load nửa đêm → sáng plan lỗi thời → chạy ANALYZE. CTA → I.
- **I Top-K**: ORDER BY … LIMIT 10 không cần sort trọn — heap top-10 hoặc đi ngược index nhặt đúng 10 dòng; hóa giải sort-blocking bài 8. CTA → J.
- **J Join Minimization / Shared Scan**: SELECT không đụng cột listings + FK NOT NULL→PK đảm bảo 1-1 → optimizer CẮT listings khỏi plan; nhiều query cùng quét bảng to → đi chung MỘT chuyến scan. CTA → /courses/db_design_nc "Hết Module 7 ✓ · Hẹn Module 8: Giao dịch & Concurrency".
- Trophy: submit nc_10 → COURSE_MILESTONES db_design_nc {10:1} → overlay MARKETPLACE v1.0 (verify phải bắt).
