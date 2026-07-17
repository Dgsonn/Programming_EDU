# ML Curriculum — Coverage Audit v2 (bổ sung Appendix F/G/H/I gốc)
*Audit toàn diện 43/43 bài × 8 nguồn (6 sách tham khảo + USTH spine đã có trong Appendix J), thực hiện 2026-07-18 bằng 4 agent đọc sâu song song, đối chiếu concept-by-concept có trích trang. Không chỉ tin mục lục — mọi gap dưới đây đều đọc chương thật, đối chiếu nội dung bài học thật.*

## Tóm tắt điều hành

| | Course 1 (15 bài) | Course 2 (14 bài) | Course 3 (14 bài) | **Tổng (43 bài)** |
|---|---|---|---|---|
| Gap tìm được | 4 | 7 | 6 (3a) + 8 (3b) + 1 (eigenvector, đã biết) = **15** | **26** |
| High severity | 2 | ~3 | 2 (3a) + 2 (3b) + 1 (eigenvector) = 5 | **~10** |
| Bài không có gap | 11/15 | 7/14 | 3/9 (3a) không tính NN | — |

**Tất cả 26 gap đều là "patch cộng thêm" (1 thẻ khái niệm / 1-2 câu / 1 dòng code thêm) — KHÔNG bài nào cần viết lại từ đầu.** Đây là verdict thống nhất của cả 4 agent độc lập.

## Phát hiện xuyên suốt quan trọng nhất: 1 pattern lặp lại ở CẢ 3 khóa

Không phải gap rời rạc — có **1 khuôn mẫu hệ thống** lặp lại độc lập ở cả 4 báo cáo (agent không được mớm trước, trừ ví dụ PCA/eigenvector gốc):

> **"Dạy ĐÚNG thao tác (gọi API, đọc biểu đồ, chấm đúng) nhưng bỏ qua CƠ CHẾ toán/hình học đằng sau."**

| Bài | Dạy được (thao tác) | Bỏ qua (cơ chế) |
|---|---|---|
| C3 L2 — PCA | `sklearn.decomposition.PCA` fit/transform | Eigenvector/eigenvalue, phân tích ma trận hiệp phương sai |
| C1 L12 — Sigmoid | Công thức bóp số vào [0,1] | Log-odds/logit — lý do TẠI SAO chính là hàm này |
| C1 L14 — Overfit | Quan sát đường cong train/val | Bias-variance decomposition (ISLR gọi là *"chủ đề quan trọng nhất sách"*) |
| C3 L1 — Curse of dimensionality | Đo khoảng cách KNN co lại | Cơ chế hình học (thể tích siêu cầu→0, tập trung ở vỏ mỏng) |
| C2 L14 — Random Forest | Bootstrap + random feature subset | Decorrelation — lý do TẠI SAO nó thắng Bagging thường |
| C2 L5 — L1/L2 Regularization | "L1=sparse, L2=smooth" (học thuộc) | Hình học kim cương vs hình tròn (ISLR Fig 6.7) |
| C3 L11 — Vanishing gradient | Lab "Gradient Flow Console" TỰ tái hiện hiện tượng | Chưa 1 lần gọi tên hay giải thích nguyên nhân (chain rule) |
| C3 L14 — Adam/weight_decay | **Code chấm điểm thật** dùng Adam | 0 giải thích cơ chế — nặng hơn "thiếu", vì học viên bị bắt dùng đúng thứ chưa được dạy |

8/26 gap thuộc đúng 1 khuôn mẫu này — đây là **ưu tiên vá số 1**, không phải 8 việc rời rạc mà là 1 loại lỗ hổng hệ thống cần 1 nguyên tắc chung khi viết patch: *mỗi lần dạy 1 API, luôn kèm 1 câu "vì sao nó hoạt động"*.

**Ghi chú cấu trúc quan trọng**: Appendix F gốc từng nói *"mathematical foundation chapters are Bridge Packs, not a duplicate math course"* — nhưng nội dung Bridge Pack thực tế **không xuất hiện ở đâu trong 208 trang** (chỉ được nhắc như "Prerequisite: Bridge A linear algebra checklist"). Nghĩa là lỗ hổng "thiếu cơ chế" này **đã được kiến trúc sư liệu dự định giải quyết bằng Bridge Pack, nhưng Bridge Pack đó chưa được viết** — cần xác nhận với bạn: Bridge Pack là 1 tài liệu riêng CHƯA tồn tại (cần viết mới), hay đã có ở đâu đó tôi chưa thấy?

## Ma trận gap đầy đủ (26 dòng, xếp theo mức độ nghiêm trọng)

### 🔴 High severity (10)

| # | Bài | Gap | Nguồn | Patch đề xuất |
|---|---|---|---|---|
| 1 | C3 L2 — PCA | 0 lần nhắc eigenvector/eigenvalue | MML Ch.4.2 (tr.105) + Ch.10.4 (tr.333) | Thêm 1 card "vì sao đúng hướng này": eigenvector của ma trận hiệp phương sai |
| 2 | C3 L14 — NN Experiment | Adam + weight_decay là **code chấm điểm thật**, 0 giải thích | Bishop §7.3.3 (tr.223-224), §9.2 (tr.260) | 2 câu trước Step 4: Adam = momentum+adaptive step; weight_decay = L2 penalty (đã học ở C2 L5) |
| 3 | C3 L11 — Activation/Gradient Flow | "Vanishing gradient" **không hề nằm trong cả Appendix G kế hoạch** dù có hẳn 1 lab tái hiện hiện tượng | Bishop §6.2.3 (tr.182), §7.4.2 (tr.227) | 1 dòng misconception-feedback đặt tên hiện tượng + nối sang cơ chế chain-rule ở Bài 13 |
| 4 | C2 L6 — Chọn λ bằng Validation | K-fold CV = **0 kết quả tuyệt đối** trong cả Course 2, dùng 1 lần chia cố định thay vì đúng kỹ thuật chuẩn | ISLP §6.2.3 (tr.227), Watt §7.3.2 (tr.209-211) | Thêm biến thể k-fold vào Step 4 (đã tự nhận "PASS WITH PATCH" trong Appendix I nhưng patch chưa viết) |
| 5 | C2 L7 — Bias-Variance | Không nối được bias-variance của MÔ HÌNH sang bias-variance của CHÍNH kỹ thuật resampling (k-fold vs single-split) | ISLP §5.1.1/§5.1.4 (tr.176-184) | 1 card đối chiếu "resample lặp lại" (đã có) vs k-fold chuẩn |
| 6 | C2 L10 — Precision/Recall/F1 | ROC/AUC chỉ 1 dòng ghi chú, KHÔNG phải lab như Appendix G hứa | Tan §5.7.2 (tr.298-301) | Thêm sub-exercise thật: sweep threshold, vẽ TPR/FPR, tính AUC |
| 7 | C1 L12 — Sigmoid | Dạy như "công thức bóp số", không hề nhắc log-odds/logit | ISLR §4.3.1 (tr.131-132) | 1 concept-check nối z ↔ log-odds |
| 8 | C1 L14 — Underfit/Overfit | Chẩn đoán chỉ bằng quan sát đường cong, không gọi tên bias/variance | ISLR §2.2.2 (tr.33-36) | 1 khung "mô hình cứng luôn sai giống nhau (bias) vs mô hình mềm dao động theo mẫu train (variance)" |
| 9 | C3 L1 — Curse of Dimensionality | Chỉ đo hiệu ứng thực nghiệm, không giải thích cơ chế hình học | Zaki Ch.6 §6.3-6.6 (tr.184-195) | 1 card thể tích siêu cầu/siêu hộp co lại theo d |
| 10 | C3 L8 — Chọn k & đánh giá cluster | Thiếu Davies-Bouldin + Calinski-Harabasz — 2 metric chuẩn, 1 dòng sklearn, nằm NGAY trong chương sách mà bài tự trích dẫn | Zaki Ch.17.2-17.3 (tr.494-502) | Thêm 2 metric vào "k Selection Console" đã có |

### 🟡 Medium (13)

| # | Bài | Gap ngắn gọn |
|---|---|---|
| 11 | C1 L9 — MSE | Thiếu R² làm chỉ số chuẩn hóa dễ hiểu (ISLR §3.1.3) — trong khi Bài 7 đã dạy variance, đủ nguyên liệu |
| 12 | C1 L4 — Data types | Có "nominal" nhưng thiếu "ordinal" đối chứng (Zaki §1.2) |
| 13 | C2 L14 — Random Forest | Bootstrap+random-subset chỉ "quan sát", thiếu lý do decorrelation (ISLP §8.2.2, Tan §5.6.6) |
| 14 | C2 L5 — L1/L2 | Học thuộc "L1 sparse/L2 smooth", thiếu hình học kim cương-vs-tròn (ISLR Fig 6.7) |
| 15 | C2 L13 — Decision Tree | Cùng gốc gap K-fold (single-split thay vì K-fold, mức độ thấp hơn vì ngoài phạm vi Appendix G hứa) |
| 16 | C3 L3 — Explained variance | Chưa nối "reconstruction MSE" và "cumulative variance" là CÙNG 1 con số (Zaki §7.2.3) — đúng chương bài tự trích |
| 17 | C3 L4 — Biplot | Nguồn trích "biplot" nhưng thực chất chỉ scatter+bảng riêng, chưa phải biplot thật (mũi tên chồng lên scatter, ISLR Fig 10.1) |
| 18 | C3 L8 — Clusterability | Thiếu phép thử định lượng có-cụm-thật-không (Hopkins statistic, Tan §8.5.6) |
| 19 | C3 L9 — Hierarchical | Thiếu Ward's linkage — chính là default của `AgglomerativeClustering` mà bài dùng | 
| 20 | C3 L11 — Init/Symmetry breaking | Có dial "initial scale" nhưng chưa giải thích vì sao init-toàn-0 làm hỏng mạng |
| 21 | C3 L10→11 | Thiếu universal approximation theorem — vế đối của "1 perceptron thua XOR" đã dạy ở Bài 10 |
| 22 | C3 L13→14 | Chưa nối tường minh "loss.backward() = đúng phép nhân chain-rule bạn code tay ở Bài 13" |
| 23 | C3 L14 — Mini-batch | Chỉ là 1 thanh trượt, chưa giải thích lý do thống kê chọn batch size |

### 🟢 Low (3)
| # | Bài | Gap |
|---|---|---|
| 24 | C2 L13 | Gap phụ trùng K-fold, ưu tiên thấp |
| 25 | C3 L10 | Thiếu màu sắc lịch sử Minsky-Papert (tùy chọn, không kỹ thuật) |
| 26 | C3 L14 — Dropout | Đã biết trước (Appendix G có kế hoạch) — chỉ ghi nhận Bài 14 chưa liên kết ngược tới thẻ dropout khi thẻ đó được viết |

## Đối chiếu với Appendix G gốc (13 "mandatory concept lab" đã hứa)

| Patch Appendix G đã hứa | Đã viết vào bài thật? |
|---|---|
| K-fold Cross-Validation (C2 M3) | ❌ Xác nhận 0 kết quả — patch #4 |
| ROC/AUC (C2 M4) | ❌ Chỉ 1 dòng, không phải lab — patch #6 |
| SVD-PCA connection (C3 M1) | Chưa kiểm — nằm ngoài phạm vi 4 agent (thuộc Bridge Pack/checkpoint riêng) |
| Softmax, init, mini-batch, Adam, dropout, weight-decay (C3 M4-M5) | ❌ Xác nhận: Adam+weight_decay đã là code chấm điểm KHÔNG giải thích (nặng hơn "thiếu"); dropout 0% có mặt; softmax chỉ mức nhận-diện-tên; init có dial nhưng thiếu lý do |

→ **Cả 2 patch Appendix G tự nhận "PASS WITH PATCH" (K-fold CV, ROC/AUC) đều xác nhận chưa viết — không phải suy đoán, đã grep 0 kết quả tuyệt đối.**

## Việc KHÔNG cần vá (đã kiểm, đúng phạm vi Basic/Intermediate/Advanced)
Kernel PCA, GMM/EM, spectral clustering, SVM dual/KKT, hồi quy đa biến nâng cao, kiểm định giả thuyết, LDA/KNN lý thuyết, CNN/RNN/Transformer — tất cả đã bị loại có chủ đích (Appendix H), agent xác nhận lại đúng, không đề xuất thêm.

## Khuyến nghị thứ tự vá
1. **10 gap High trước** — đặc biệt #2 (Adam/weight_decay đang là code chấm điểm mù) và #4/#6 (2 patch Appendix G tự nhận nợ) — độ rủi ro cao nhất vì ảnh hưởng trực tiếp việc chấm điểm/tự tin sai của học viên.
2. Bài 1 (Course 1) **không có gap** → an toàn build pilot ngay, không cần chờ vá.
3. 13 Medium có thể vá song song với build kỹ thuật (không chặn pilot).
4. 3 Low để cuối hoặc bỏ qua nếu thiếu thời gian.
