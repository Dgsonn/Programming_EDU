# BOSS nc_25 "Engine Under Fire" — Design Spec (2026-07-08)

Bài 25 = **tốt nghiệp** khóa NC (GameHub Marketplace). Ship **MARKETPLACE v3.0**.
Chốt concept với user (4 câu): **War-room SEV-1** · **3 mặt trận + 1 tổng hợp** ·
**tái dùng sim làm callback** · **tắt reveal-hint + qua CẢ 4 case mới ship + biên bản sự cố + xếp hạng kỹ sư**.

Vỏ graduation ĐÃ khai sẵn (`COURSE_MILESTONES.db_design_nc`): eyebrow "GAMEHUB MARKETPLACE v3.0 — RA MẮT",
gradSub đã nhắc đúng 3 mặt trận. Vỏ boss `l.boss` + `applyBossSkin/updateBossStamps` tái dùng nguyên từ tc_21.

---

## 1. Vỏ tự sự — War-room SEV-1

**Ticket #66 · 🚨 SEV-1 · Ngày ra mắt v3.0.** Đối tác đổ về, sàn quá tải. Người học = **kỹ sư on-call**
bước vào phòng chỉ huy sự cố; 3 báo động đỏ nổ cùng lúc, phải dập từng đám rồi ship bản vá.

`l.boss = { code:'SEV-1 · ENGINE UNDER FIRE', nav:['Mặt trận 1','Mặt trận 2','Mặt trận 3','Ship v3.0'], cases:[…4…] }`
→ stepper đổi thành "Mặt trận 1-4", mỗi step-pane có thẻ war-room (tái dùng `.case-file-card`, case 3-4 slim).
`tag`=mã báo động, `title`=triệu chứng, `suspect`→đổi nhãn thành 🔎 **Nghi vấn kỹ thuật**, `brief`=mô tả,
`clue`=**manh mối nối sang mặt trận sau** (dây chuyền: chậm→tranh chấp→sập→ship).

## 2. Bốn mặt trận (4 step reskin) — số liệu canonical giữ nguyên toàn khóa

**Thế giới:** listings 40.000 dòng · orders 100.000 (~1.000 block) · `price<100`→1.204 dòng ·
ví A=Quỹ Sàn 1000 / B=DragonForge 2000 / C=NightRaven 700 · HDD tS=4ms/tT=0,1ms · Kiếm Rồng #3001.

### Mặt trận 1 — M7 "Trang săn hàng treo 8 giây" (step 1, sim)
- **Triệu chứng:** ngày ra mắt bulk-load thêm listing, trang `WHERE price < 100` bỗng chọn **Seq Scan 40.000
  dòng = ~8000ms** thay vì Index 82ms → khách bỏ giỏ.
- **Nghi vấn:** sau bulk-load **sổ thống kê chưa ANALYZE** → optimizer est sai số dòng → chọn Seq oan
  (callback nc_10 Card H "histogram lấy mẫu định kỳ, có thể cũ" + nc_03 access-path hòa vốn).
- **Callback sim:** `plan_visual` (2 cây: Seq 8000ms vs Index 82ms, costbar). Native step-1 sim — không code mới.
- **Qua mặt trận:** engage sim + đọc verdict "chạy ANALYZE → est đúng → Index" → sang MT2. `clue` để lại:
  *"Trang nhanh rồi, nhưng lượt xem tăng vọt → 1000 người CÙNG bấm mua 1 món…"*

### Mặt trận 2 — M8 "1000 người tranh 1 Mythic" (step 2, MCQ×2 + mini-game)
- **Triệu chứng:** món **Mythic Kiếm Rồng #3001** (v1=500) — 1000 request mua đồng thời, 2 người cùng
  thấy "còn hàng" → **bán trùng / lost update**.
- **MCQ (2):** (a) vì sao 2 người cùng mua được? (bẫy: "server chậm" vs đúng "đọc-rồi-ghi không nguyên tử");
  (b) chọn cơ chế đúng: `SELECT … FOR UPDATE` giữ chỗ vs khóa-cả-bảng (callback nc_11/nc_20 version-check).
- **Mini-game (match):** nối cơ chế ↔ hệ quả — lost update / khóa X / FOR UPDATE / version-check
  (dùng grader match ĐÃ VÁ hôm nay — có `solution` đầy đủ).
- **Qua mặt trận:** MCQ + mini đúng → MT3. `clue`: *"Chốt được 1 người mua… nhưng ĐÚNG LÚC charge tiền thì SERVER SẬP."*

### Mặt trận 3 — M9 "Server sập giữa thanh toán" (step 3, kéo-thả)
- **Triệu chứng:** giữa lúc trừ ví (A 1000→500 mua Mythic) **server sập**. Sau khi bật lại: ví đúng phải là bao nhiêu?
- **Kéo-thả (zone đặc thù `expected_zones`):** dựng lại **quy trình phục hồi WAL/ARIES 3-pass** —
  các khối: *log ra stable TRƯỚC data · ANALYSIS tìm RedoLSN · REDO bản đã commit · UNDO giao dịch dở (CLR)*
  → callback nc_23 (WAL) + nc_24 (ARIES). Sai thứ tự (data trước log) = zone đỏ.
- **Qua mặt trận:** dựng đúng chuỗi → MT4. `clue`: *"3 đám cháy đã dập. Giờ gói tất cả thành 1 lệnh mua AN TOÀN rồi ship."*

### Mặt trận 4 — TỔNG HỢP "Ship v3.0" (step 4, tự code)
- **Nhiệm vụ:** viết **1 câu mua Mythic an toàn** hội đủ 3 bài học:
  `SELECT price FROM listings WHERE listing_id = 3001 FOR UPDATE;`
  — tra theo **PK có index** (M7 nhanh) + **FOR UPDATE** giữ chỗ (M8 hết bán trùng); WAL/redo-undo (M9)
  đảm bảo an toàn khi sập (giải thích trong biên bản).
- **Grader:** validateSQL — cần đúng bảng/where + **clause `forUpdate`** (đã có từ đợt 11). Thiếu FOR UPDATE →
  "câu đọc không giữ chỗ — vẫn bán trùng"; bọc cột/không index → nhắc M7.
- **Submit đúng → nổ overlay graduation MARKETPLACE v3.0** (có sẵn) + **BIÊN BẢN SỰ CỐ**.

## 3. Khác lesson thường (4 điểm user chốt)

1. **Tắt reveal-hint:** không set `step_3.reveal_strip` (mặc định NC đã tắt) → không mớm gợi ý.
2. **Qua CẢ 4 mặt trận mới ship:** MT2 (MCQ+mini) · MT3 (kéo-thả) · MT4 (code) đều phải ĐÚNG mới đi tiếp;
   MT1 engage sim. Cổng cứng: **chặn `goToStep(n+1)` khi case n chưa pass** (state.bossCleared[n]) — *code mới nhỏ*.
   Submit MT4 đúng = điều kiện cuối nổ graduation (cơ chế có sẵn).
3. **Biên bản sự cố (Incident Report)** — *component mới nhỏ*, render trong overlay graduation (thay/bổ sung recap):
   3 dòng root-cause + bản vá:
   - 🔥 **M7** Query treo 8s → *thống kê cũ, est mù* → **ANALYZE + Index** (8000ms→82ms)
   - 🔥 **M8** Bán trùng Mythic → *đọc-ghi không nguyên tử* → **SELECT … FOR UPDATE**
   - 🔥 **M9** Sập giữa charge → *WAL log-trước-data + ARIES 3-pass* → **ví phục hồi về số đúng**
4. **Xếp hạng kỹ sư (SRE rank)** — theo **số lần sai** trong cả boss (đếm qua tim mất / retry, state có sẵn):
   0 sai = **Staff SRE** ("dập lửa không rơi giọt mồ hôi") · 1-2 = **Senior** · 3+ = **On-call sống sót**.
   Khung SRE thật (năng lực xử-lý-sự-cố), KHÔNG phải điểm XP màu mè — tôn trọng [[feedback_no-over-gamify]].

## 4. Kiểm kê code

**Tái dùng (0 code mới):** vỏ `l.boss`/applyBossSkin · plan_visual · grader match/validateSQL(forUpdate) ·
overlay graduation + gradEyebrow/Title/Sub · zone đặc thù expected_zones.
**Code mới (nhỏ, khu trú):** (a) cổng cứng qua-case-mới-đi-tiếp (`state.bossCleared`, chặn goToStep);
(b) component **Biên bản sự cố + SRE rank** trong overlay graduation (chỉ bật khi `l.boss` + graduation);
(c) đổi nhãn "Nghi vấn" → "Nghi vấn kỹ thuật" cho vỏ war-room (1 dòng optional).

## 5. Repoint nợ khi ship
- Card J `nc_card_physical_logical_undo` CTA → `?lesson=25` (hiện trỏ course).
- Card Lock-vs-MVCC: giữ (đã trỏ ?lesson=19) — KHÔNG cần đổi.

## 6. Verify (real interaction)
- Drive 4 mặt trận: sim MT1 → MCQ+match MT2 → kéo-thả MT3 → code MT4 submit → overlay v3.0 + biên bản + rank.
- Cổng cứng: thử đi tiếp khi chưa pass → bị chặn; pass → mở.
- Rank: chạy 2 lần (0 sai → Staff; cố sai 3 lần → On-call sống sót).
- Hero SVG đo getBBox sạch (Emerald). Rotation step-4: nc_24 fill_blank → nc_25 full_ide ✓.
- Regression: nc_20 trophy v2.0 vẫn nổ; bài 21-24 không nổ overlay giữa.
