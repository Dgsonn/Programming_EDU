# AUDIT — Khóa Trung cấp (21 bài) đối chiếu giáo trình gốc

**Ngày:** 2026-07-05 · **Người yêu cầu:** user ("càng trùng khớp càng tốt")
**Nguồn chuẩn:** Silberschatz et al., *Database System Concepts* 7th ed. 2019 (bản PDF đầy đủ 1373 trang trong docs/) · PART_6 (giáo trình biên soạn Ch 15–16) · PART_7 (giáo trình biên soạn Ch 18–19) · DATABASE_DESIGN_3_COURSE_RECOMMENDATION.md v3.
**Phương pháp:** trích text 21 mục sách liên quan (scratchpad/book/*.txt, pypdf), so KHÁI NIỆM + THUẬT NGỮ + CON SỐ + trích dẫn chương của từng bài; lệch nhỏ sửa ngay (quyền user giao), verify lại bằng tương tác thật.

---

## 1. BẢNG VERDICT 21 BÀI

| Bài | Mục sách | Verdict | Ghi chú |
|---|---|---|---|
| tc_01 JDBC/Cursor | 5.1 | ✅ KHỚP | getConnection → PreparedStatement → executeQuery → ResultSet.next() → close: đúng flow Figure 5.1; ODBC ✓; injection/2-kênh ✓ |
| tc_02 Function/Procedure | 5.2 | ✅ KHỚP (cú pháp Postgres có chủ đích) | Sách dùng `begin declare … end`; bài dùng dạng gọn `RETURNS INT RETURN (query)` + `LANGUAGE SQL AS $$…$$` — đã ghi rõ "Postgres 14+" trong bài, nhất quán định hướng PostgreSQL-style của PART_6 |
| tc_03 Trigger | 5.3 | ✅ KHỚP | Sự kiện + FOR EACH ROW/STATEMENT + NEW/OLD = referencing new/old row của sách; vỏ EXECUTE FUNCTION là dialect Postgres (có chủ đích) |
| tc_04 Recursive | 5.4 | ✅ KHỚP + **fix hint** | Sách xác nhận dạng `with recursive` dùng **union all** (p247, footnote 8); base/recursive query = anchor/bước đệ quy; monotonic/fixed-point ✓. ĐÃ SỬA: lý do chọn UNION ALL trong reveal_hint (bỏ "dừng sớm" sai; thêm: UNION khử trùng lặp chỉ đáng khi đồ thị có chu trình) |
| tc_05 Star Schema | 11.2 | ✅ KHỚP + **fix citation** | fact/dimension tables, measure vs dimension attributes, ETL: đúng nguyên văn 11.2.4. ĐÃ SỬA trích dẫn: Ch 11 tên thật là "Data Analytics" (§11.2 Data Warehousing) |
| tc_06 ROLLUP/CUBE | 11.3 + 5.5 | ✅ KHỚP | Tầng (a,b)→(a)→(); NULL đại diện "all" — sách: "null value in place of all"; CUBE = 2ⁿ groupings ✓ |
| tc_07 MapReduce | 10.3 | ✅ KHỚP | map emit (khóa,1) / shuffle gom theo khóa / reduce cộng dồn = word-count mẫu của sách (emit(word,1)); data skew ✓ |
| tc_08 Document Store | 10.2 | ✅ KHỚP | Sách: document store = key-value store nhận JSON, MongoDB đại diện ✓. Embed vs Reference = mở rộng công nghiệp CÓ CHỦ ĐÍCH (không mâu thuẫn sách) |
| tc_09 OLAP | 11.3 | ⚠️→✅ **ĐÃ SỬA thuật ngữ DICE** | Sách: slicing = cố định giá trị một chiều; **dicing = cố định giá trị NHIỀU chiều** — bài cũ dạy dice = "GROUP BY nhiều cột" (sai). Đã định nghĩa lại toàn bài (primer/card/MCQ/mini-game/mission/hints); GROUP BY giờ gọi đúng là "chiều hiển thị" (pivot/cross-tab). SQL + chấm điểm không đổi. Drill-down/roll-up/pivot vốn đã đúng sách |
| tc_10 Tumbling | 10.5 | ⚠️→✅ **ĐÃ SỬA thuật ngữ HOPPING** | Sách tách 4 loại: tumbling / **hopping** (bề rộng cố định, tính theo nhịp, chờm) / sliding (quanh TỪNG sự kiện) / session. Bài cũ gọi "5 phút tính lại mỗi phút" là sliding — theo sách đó là HOPPING. Đã thêm hopping vào card + viết lại MCQ 2 (hopping = đáp án đúng, sliding thành mồi nhử có giải thích chuẩn). Tumbling khít/nửa-mở ✓, session (timeout + max duration) ✓ |
| tc_11 Storage Hierarchy | 12.1–12.2 | ✅ KHỚP | Volatile/non-volatile ✓; số liệu trễ khớp bậc độ lớn sách (seek 4–10ms, SSD ~µs); đơn vị trang/block ✓ |
| tc_12 Seq vs Random | 12.3 + 12.6 | ✅ KHỚP | seek + rotational latency + transfer đúng 3 thành phần; "sort vị trí trước khi đọc" + elevator = 12.6 nguyên bản; SSD vẫn ưu sequential ✓. Fiction io_benchmark (100 random ≈ 1s trên HDD) đúng bậc độ lớn (100 × ~10ms) |
| tc_13 Buffer | 13.5 | ⚠️→✅ **ĐÃ SỬA nuance MRU** | LRU/hit-miss/pin ✓. Sách 13.5.2 trình bày MRU là TỐI ƯU cho pattern quét vòng lặp ("LRU's faults") — bài cũ gán MRU "thường tệ/giả mạo". Đã thêm nửa câu trả lại ngữ cảnh (MRU có đất diễn thật, NC gặp lại ở JOIN); đáp án bài không đổi (flow feed → LRU vẫn đúng) |
| tc_14 Slotted Page | 13.2.2 | ✅ KHỚP | Header/entries mọc xuôi/free space giữa/records mọc ngược; dòng dời trong trang nhờ indirection ("no pointers point directly to records"); grow/shrink ✓ |
| tc_15 Row vs Column | 13.6 | ✅ KHỚP | Mỗi cột file riêng + nén; fetch nhiều cột đắt; hợp analytics, thua OLTP — khớp 13.6 gần nguyên văn |
| tc_16 Index cơ bản | 14.1 | ✅ KHỚP | search key, index entry (khóa, con trỏ), chi phí ghi/không gian ✓ |
| tc_17 Dense/Sparse | 14.2 | ✅ KHỚP NGUYÊN VĂN | "Secondary indices must be dense; a clustering index may be sparse" — đúng từng chữ với nội dung bài; clustering/nonclustering(secondary) ✓ |
| tc_18 B+-Tree | 14.3 | ✅ KHỚP | fanout = số con trỏ/node (sách định nghĩa đúng từ này); chiều cao ⌈log⌈n/2⌉(N)⌉, ví dụ sách log₅₀(1M)=4 node — bài nói "3-4 tầng" ✓; lá móc bằng Pₙ ✓; balanced/tách node ✓ |
| tc_19 Composite/Bitmap | 14.6 + 14.9 | ✅ KHỚP | 14.6.2 "Indices on Multiple Keys" — composite search key, thứ tự từ điển, leftmost ✓; bitmap cho cột ít giá trị + AND/OR bit ✓ (sách 14.9). "Bitmap ghi-đắt → hợp kho" = mở rộng công nghiệp có chủ đích |
| tc_20 Capstone EXPLAIN | 15.2 + 16.1 + PART_6 | ⚠️→✅ **ĐÃ SỬA selectivity** | Cost = block transfers + seeks ✓ (15.2); Postgres-style EXPLAIN đúng chỉ đạo PART_6 ("chỉ cần PostgreSQL/MySQL-style làm demo"). LỆCH ĐÃ SỬA: mô phỏng cũ cho Index Scan lấy 31% bảng (310k/1M) nhanh gấp 20 lần — mâu thuẫn 15.3 (lấy tỷ lệ lớn → linear scan thắng) và Card D PART_6 ("Secondary Index Can Be Bad"). Đã hạ ước lượng còn 38k (3,8%) ở hero + step-1 + MCQ, thêm caveat "lấy gần cả bảng thì Seq Scan mới là đường rẻ — planner tự so cost" vào card + explanation. Sargable (hàm bọc cột) = mở rộng thực chiến có chủ đích, không mâu thuẫn sách |
| tc_21 Boss | tổng hợp | ✅ KHỚP | HAVING (Ch 3/5) + recursive UNION ALL (5.4) + composite prefix (14.6) + đọc EXPLAIN — toàn recap các mục đã audit ở trên |

**Tổng:** 16 khớp thẳng · 5 lệch nhỏ đã sửa ngay (tc_04 hint, tc_09 dice, tc_10 hopping, tc_13 MRU, tc_20 selectivity) + 1 fix trích dẫn (tc_05). **Không có lệch lớn cấp khái niệm phải làm lại.**
**Verify sau sửa:** tc_09 9/9 · tc_10 10/10 (overlay v2.0 vẫn lên) · tc_13 11/11 · tc_20 12/12 — tương tác thật, 0 pageerror.

---

## 2. MỞ RỘNG CÓ CHỦ ĐÍCH (không phải lệch — giữ nguyên)

| Chỗ | Nội dung | Căn cứ |
|---|---|---|
| tc_02/03 | Cú pháp Postgres (`$$…$$`, `EXECUTE FUNCTION`) thay vì SQL-standard `begin atomic` | PART_6 chốt dùng PostgreSQL-style; bài có ghi chú rõ |
| tc_08 | Embed vs Reference | Thiết kế document-model công nghiệp; sách chỉ giới thiệu document store mức khái quát |
| tc_13 | "hit ratio", ring buffer Postgres | Thuật ngữ vận hành thực tế, cùng chiều với sách |
| tc_20 | "Sargable"/hàm bọc cột làm index mù | Thực chiến Postgres; PART_6 Bài 3 + Card D cùng tinh thần |
| Toàn khóa | Số liệu fiction (GameHub 2M dòng, 9s, 6,2s…) | Đúng bậc độ lớn với số liệu sách (seek ms, SSD µs, RAM ns) |

## 3. ĐỐI CHIẾU ROADMAP NC (chuẩn bị cho khóa tiếp)

- **PART_6 Roadmap MVP: 10 bài core** — khớp **1:1** với nc_01–nc_10 của recommendation v3 (cùng tên, cùng nguồn chương 15.1→16.5). Kèm **10 concept cards A–J** chen giữa.
- **PART_7 Roadmap MVP: 14 bài core** — khớp **1:1** với nc_11–nc_24 (M8 10 bài Ch 18 + M9 4 bài Ch 19). Kèm **12 concept cards A–L**.
- Tổng cards NC = 22 = đúng con số "22 concept cards" của recommendation. ✅
- ⚠️ **1 điểm treo khi draft NC:** recommendation §3 ghi card "Lock vs MVCC" chen giữa nc_18→nc_19, nhưng danh sách card PART_7 không có card tên này (gần nhất: Card F — Degree-Two/Cursor Stability sau Bài 10). → Chốt với user khi draft M8: thêm card Lock-vs-MVCC riêng hay coi nội dung đó thuộc bài nc_18.
- PART_6 mục "Có thể bỏ": số tốc độ thiết bị 2018, công thức cost chi tiết, EXPLAIN vendor khác Postgres — TC hiện KHÔNG phạm mục nào.

## 4. KẾT LUẬN

TC 21/21 bài bám giáo trình ở mức **khớp nguyên văn với các định nghĩa then chốt** (dense/sparse/clustering, slotted page, fanout, measure/dimension, emit(word,1), seek/rotate/transfer…), các mở rộng đều có chủ đích và có căn cứ PART_6. 5 điểm lệch tìm được đều ở tầng thuật ngữ/số liệu mô phỏng, đã sửa và verify lại trong ngày. Roadmap NC đã khớp sẵn với 2 file giáo trình — draft NC có thể bám thẳng PART_6/PART_7 (kèm 22 cards qua route /card/<id> đang xây ở vòng trả nợ).
