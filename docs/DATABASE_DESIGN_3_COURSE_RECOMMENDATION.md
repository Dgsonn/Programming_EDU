# Database Design Series — Recommendation v3 (chốt)

**Ngày:** 2026-07-01
**Loại:** Đề xuất tổng thể (KHÔNG sửa code PE_test, KHÔNG sửa file khác)
**Trạng thái:** Đã chốt — Basic (giữ nguyên), Trung cấp (3 modules), Nâng cao (3 modules)
**Cập nhật:** Thay thế hoàn toàn v1 (Version A/B cũ) bằng v3 (đã chốt modules, project threads, format).

---

## 📌 EXECUTIVE SUMMARY

| Khóa | Modules | Bài core | Cards | Project | Format | Tổng XP |
|---|---|---|---|---|---|---|
| **Basic** (đã có, KHÔNG đổi) | 3 — Modeling / Normalization / App | 20 | ~40 (per-lesson) | Game Catalog | 4-step | ~1,200 |
| **Trung cấp** (chốt v3) | 3 — Advanced SQL / Big Data / Storage-Index | 21 | 12 (mixed) | **USTH Social Network** | 4-step | ~2,650 |
| **Nâng cao** (chốt v3) | 3 — Engine / Concurrency / Recovery | 25 | 22 (mixed) | **USTH E-Commerce** | 4-step | ~3,640 |

**Độ khó tăng đều:** ~50 → ~126 → ~146 XP/bài. Thời lượng/bài NC lớn hơn vì tích hợp 3 sub-module.

---

## 1. AUDIT BASIC — ĐÃ ĐỦ

Basic hiện tại (20 bài, db_01–db_20) **100% cover Part 2 + Part 3 PDF + mở rộng**:
- ✅ Part 2 (10 topics) → 13 bài + 2NF, 4NF, Boss Battle (3 bài mở rộng)
- ✅ Part 3 (5 topics) → 5 bài 1:1 mapping
- ⚠️ Gap: **Ch 5 — Advanced SQL** (Triggers, Functions, Recursive Queries) — Basic KHÔNG cover
- ⚠️ Gap: **Ch 10–14 (Part 4–5)** và **Ch 15–19 (Part 6–7)** — Basic KHÔNG cover (đúng vì planning)

→ **Kết luận:** Basic giữ nguyên, không thêm gì. Advanced SQL gap → đưa vào **Module 4** (đầu Trung cấp).

---

## 2. TRUNG CẤP = 3 MODULES

```
MODULE 4 — Advanced SQL (Ch 5)              ← FILL GAP từ audit (Triggers, Functions, Recursive CTE)
  ├── tc_01 — SQL từ ngôn ngữ lập trình (JDBC/ODBC, Embedded, Cursor)
  ├── tc_02 — Functions & Stored Procedures
  ├── tc_03 — Trigger — database tự phản ứng
  └── tc_04 — Recursive Queries (WITH RECURSIVE, CTE)

MODULE 5 — Big Data & Analytics (Part 4)
  ├── tc_05 — Star Schema (Fact + Dim)
  ├── tc_06 — ROLLUP & CUBE
  ├── tc_07 — MapReduce (chia task, gom kết quả)
  ├── tc_08 — JSON Document Store / MongoDB
  ├── tc_09 — OLAP Slice-Dice-Drilldown
  └── tc_10 — Tumbling Windows (Streaming)

MODULE 6 — Storage, Indexing & Performance (Part 5)
  ├── tc_11 — Storage Hierarchy
  ├── tc_12 — Sequential vs Random Access
  ├── tc_13 — Buffer Manager
  ├── tc_14 — Record Layout & Heap File
  ├── tc_15 — Row-Store vs Column-Store
  ├── tc_16 — Index cơ bản (Search Key)
  ├── tc_17 — Dense/Sparse/Clustering/Secondary
  ├── tc_18 — B+-Tree (Lookup + Range)
  ├── tc_19 — Composite & Bitmap Index
  └── tc_20 — Capstone: Index × EXPLAIN Storage

🏁 Boss Battle
  └── tc_boss — "Social Graph Detective"
```

**Tổng:** 4 + 6 + 10 + 1 Boss = **21 bài core** + 12 concept cards

---

## 3. NÂNG CAO = 3 MODULES

```
MODULE 7 — Engine Room (Part 6, Ch 15–16)
  ├── nc_01 — SQL → Execution Plan (parser → algebra → optimizer)
  ├── nc_02 — Cost: Block Transfer + Random I/O + Memory
  ├── nc_03 — Full Scan vs Index Scan
  ├── nc_04 — External Sort-Merge
  ├── nc_05 — Join I: Nested / Block / Indexed Nested Loop
  ├── nc_06 — Join II: Merge + Hash Join
  ├── nc_07 — Aggregation: Sort-based vs Hash-based
  ├── nc_08 — Materialization vs Pipelining
  ├── nc_09 — Optimizer: Pushdown, Join Reorder
  └── nc_10 — Cost-Based Optimizer + EXPLAIN + Materialized Views

MODULE 8 — Concurrency Control (Part 7 Ch 18)
  ├── nc_11 — Vì sao transaction chạy đồng thời gây lỗi
  ├── nc_12 — S/X Locks — Compatibility Matrix
  ├── nc_13 — 2PL — Growing & Shrinking
  ├── nc_14 — Deadlock + Wait-for Graph
  ├── nc_15 — Multiple Granularity + Intention Lock
  ├── nc_16 — Phantom Phenomenon + Index Locking
  ├── nc_17 — Optimistic Concurrency (Read/Validate/Write)
  ├── nc_18 — MVCC + Snapshot Isolation
  ├── nc_19 — Lost Update + Write Skew + FOR UPDATE
  └── nc_20 — Version Number (cho User Interaction)
       ⭐ 1 concept card chen giữa nc_18 → nc_19: "Lock vs MVCC"

MODULE 9 — Crash Recovery (Part 7 Ch 19)
  ├── nc_21 — Failure Classification + Volatile/Non-volatile Storage
  ├── nc_22 — Log Records + Commit Point
  ├── nc_23 — WAL + Checkpoint + Crash Recovery
  └── nc_24 — ARIES Overview (LSN, PageLSN, DirtyPageTable)

🏁 Boss Battle
  └── nc_boss — "Engine Under Fire" (query chậm + 100 concurrent users + crash)
```

**Tổng:** 10 + 10 + 4 + 1 Boss = **25 bài core** + 22 concept cards

---

## 4. PROJECT THREADS — 1 APP / KHÓA

### 🟡 TC Project: **"USTH Social Network"**

Schema: `user / post / comment / follow / like` (Facebook-style)

| Module | App dùng vào |
|---|---|
| **M4-Adv SQL** | Recursive CTE duyệt cây comment · Trigger auto-update `post.like_count` · Stored Procedure `delete_user` gom xóa |
| **M5-Big Data** | Star Schema `fact_post_action(user_id, post_id, date_id, action_type, count)` · OLAP Cube cắt theo ngày/tháng · MapReduce đếm like theo giờ · JSON lưu `user.bio` · Tumbling Window "5 phút qua user nào đăng >20 posts" |
| **M6-Storage/Index** | Buffer/Storage giải thích "feed load chậm" · B+-tree index `(author_id, created_at DESC)` cho timeline · Bitmap cho `post.tags[]` · Capstone EXPLAIN "top 5 hot posts của tôi + bạn bè" |

### 🔴 NC Project: **"USTH E-Commerce"** (Shopee-style)

Schema: `product / customer / cart / orders / inventory / payment`

| Module | App dùng vào |
|---|---|
| **M7-Engine** | Query "search product + filter + sort" qua Plan/Cost/Scan/Sort/Join · EXPLAIN cache Materialized View cho dashboard "top 10 bán chạy tháng" |
| **M8-Concurrency** | 2 user cùng `UPDATE inventory ... WHERE product_id=X` → S/X Lock + 2PL · Deadlock "User A→order1, User B→order2 đổi chiều" · MVCC cho stock khi checkout · Lost Update → FOR UPDATE · Version Number cho cart suy nghĩ 5 phút |
| **M9-Recovery** | Crash mid-`UPDATE orders SET status='paid'` → log records · WAL đảm bảo payment đã commit không mất · ARIES check "orders pending từ 03:47 sáng nay" |

---

## 5. FORMAT + CONCEPT CARDS

### Format: **4-step** (giống Basic)

```js
{
  id: 'tc_01',                          // 'tc_' hoặc 'nc_' prefix
  index, title, subtitle,
  module: 4,                            // M4 = Advanced SQL
  estimated_minutes, xp_reward,
  step_1: { primer, intro, visual, concept_cards },
  step_2: { question, options, mini_game },
  step_3: { blocks, drop_zones, expected_sql, reveal_hints },
  step_4: { prompt, schema, expected_sql, hints, success_message }
}
```

→ **Schema không đổi** so với Basic. Không cần sửa `lesson_content.js`, templates, `routes/main.py` cho phần core.

### Concept Cards: **HYBRID** (đề xuất)

| Giai đoạn | Option | Lý do |
|---|---|---|
| Basic | 1 (per-lesson) | đã có |
| TC M4, M5 | 1 | đơn giản, đủ |
| TC M6 | 1 (chính) + 1–2 card **2** ở cuối | thử bridge sang Boss |
| NC M7 | 1 (chính) + 1 card **2** ở Bài 10 | "Top-K Optimization" trước EXPLAIN |
| **NC M8** ⭐ | **Mostly 2** | Pedagogical quan trọng: "Lock vs MVCC" chen trước Bài 19 Lost Update |
| NC M9 | 2 cho card lớn (WAL/Force-No-Force), 1 cho mini card |  |

**Option 2 (interleaved) là gì?**

Card là 1 entry riêng trong `lesson_content.js` với field `type: 'concept_card'`, chen giữa 2 bài:
- Effort thêm: **~3.5–4 ngày dev** (route `/card/<id>`, template `concept_card.html`, progress riêng)
- Lợi: bridge "Lock vs MVCC" trước khi vào Lost Update → pedagogy tốt hơn nhiều
- So với Option 1 (per-lesson): không cần code thêm nhưng mất pedagogical quality ở M8

---

## 6. CAM KẾT — FILES KHÔNG SỬA

| File | Trạng thái |
|---|---|
| `D:\PE_test\static\js\lesson_content.js` | **KHÔNG sửa** — chờ council review draft đầu tiên |
| `D:\PE_test\templates\course_db_*.html` | **KHÔNG sửa** — chờ layout |
| `D:\PE_test\routes\main.py` | **KHÔNG sửa** — chờ route (nếu Hybrid) |
| `D:\PE_test\docs\CURRICULUM_CONTENT_2026-06-30.md` | **KHÔNG sửa** — file council |
| File này (`DATABASE_DESIGN_3_COURSE_RECOMMENDATION.md`) | OK — ghi chép đề xuất |

---

## 7. NEXT STEP

1. **User confirm Q5** (Hybrid vs pure Option 1) → final decision concept cards
2. Sau confirm: **Draft Bài tc_01** (SQL từ ngôn ngữ lập trình — JDBC/ODBC, Embedded SQL, Cursor) — đây là bài đầu Module 4, fill gap Advanced SQL
3. Draft sau khi viết xong → gửi council review → user feedback → implement
4. Tuần tự: tc_01 → ... → tc_boss → nc_01 → ... → nc_boss

**Effort estimate (nếu Hybrid):**
- Basic: 0 (đã xong)
- TC 21 bài: ~12–15 ngày dev (~0.7 ngày/bài)
- NC 25 bài: ~18–22 ngày dev (nặng hơn vì concurrency/recovery)
- Hybrid cards: +3.5–4 ngày dev
- Boss Battles × 2: +3–4 ngày
- **Tổng: ~37–45 ngày dev = ~7–9 tuần full-time**

---

## APPENDIX — THAY ĐỔI vs v1/v2

| Mục | v1/v2 (cũ) | v3 (chốt) | Lý do |
|---|---|---|---|
| Version A vs B | 2 versions để user chọn | 1 version duy nhất | user đã chốt modules |
| Module breakdown | TC gộp Part 4+5 thành 14 bài | TC 3 modules = 21 bài | user yêu cầu chia module như Basic |
| Advanced SQL | Thiếu (audit flag) | **Module 4 đầu TC** | fill gap mà v1/v2 bỏ sót |
| Project threads | "USTH X Lab" generic | Social Network (TC) + E-Commerce (NC) | user confirm chốt |
| Format | 4-step vs 5-layer | 4-step (giống Basic) | user confirm Option 1 |
| Concept cards | chưa rõ | **Hybrid** (NC M8 dùng Option 2) | cần Q5 |
| Curriculum tables | dài, lặp lại chi tiết | 1 dòng/bài | rút gọn |
| Open questions | Q1-Q5 | chỉ Q5 còn lại | Q1-Q4 đã giải |

---

**Cập nhật cuối:** 2026-07-01. Còn 1 câu Q5 cần user confirm (Hybrid cards). Sau Q5, bắt đầu draft tc_01.

---

## 8. SAGA UPDATE (2026-07-04) — 3 KHÓA = 1 CÂU CHUYỆN DÀI (user chốt)

Basic đã ship hệ storytelling **Ticket + Release** (pace-neutral): người học = kỹ sư dữ liệu đầu tiên của **GameHub**; mỗi bài = 1 ticket, xong chương = ship v1.0/v2.0, tốt nghiệp = **v3.0 ra mắt toàn cầu**. User chốt: story TC/NC là **phần tiếp theo của cùng câu chuyện** (subsequent stories), không phải universe mới.

### Đề xuất đổi VỎ project (schema Minimax GIỮ NGUYÊN, chỉ đổi tên/bối cảnh):

| Khóa | Vỏ cũ (v3) | Vỏ mới (saga) | Nối tiếp thế nào |
|---|---|---|---|
| Basic | Game Catalog | **GameHub** (đã ship) | Phần 1: xây nền tảng từ 0 → v3.0 |
| Trung cấp | USTH Social Network | **GameHub Community** | Phần 2: sau v3.0, GameHub xây mạng cộng đồng riêng (user/post/comment/follow/like — đúng schema v3). Boss #14 của Basic (audit diễn đàn **GuildBoard** cho khách) chính là foreshadow: "học từ khách để xây sản phẩm của mình". |
| Nâng cao | USTH E-Commerce | **GameHub Marketplace** | Phần 3: mở chợ giao dịch vật phẩm/game (product/cart/orders/inventory/payment — đúng schema v3) → triệu giao dịch đồng thời = đúng đất diễn engine/concurrency/recovery. |

### Chống trùng đã xử lý phía Basic (commit 2026-07-04):
- Boss #14: "mạng xã hội gamers" → **diễn đàn GuildBoard** (forum, KHÔNG follow/like/graph) — nhường "social network" cho TC.
- Ticket #11: "sàn phụ kiện GearShop" → **chuỗi cyber-café GamerBrew** — nhường "e-commerce Shopee-style" cho NC.
- Ticket #09: "trường đại học" → **học viện đào tạo game thủ** — nhường vỏ đại học (USTH) nếu TC/NC còn dùng.
- Basic không đụng concept Part 4–7 (đã audit §1); các context step-4 chỉ nhắc brand analogy, không dạy trước engine/index/concurrency.

### Quy tắc kế thừa cho TC/NC khi draft:
1. Tiếp tục hệ **Ticket + Release** (đánh số tiếp: TC = Ticket #21…, release v4.x? — hoặc reset theo sản phẩm mới "Community v1.0"; QUYẾT KHI DRAFT tc_01).
2. Không đơn vị thời gian của người học (đã là luật từ Basic).
3. Nhân vật liên tục: người học từ "kỹ sư dữ liệu đầu tiên" (Basic) → lead engineer của Community (TC) → architect của Marketplace (NC).
