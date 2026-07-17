# ML Bridge Pack — Nền tảng Toán & Quy trình cho khóa Machine Learning

*Tài liệu phụ lục tra cứu, viết 2026-07-18. Đây là phần "Bridge Pack" mà Appendix F của spec gốc
(ML_Curriculum_Production_Specification) dự định nhưng chưa từng được viết — Coverage Audit v2
xác nhận nội dung này không tồn tại trong 208 trang spec. Bản này phủ nền tảng cho Course 1 → 2;
sẽ mở rộng phần đại số tuyến tính nâng cao (eigenvector/SVD) khi build Course 3.*

**Cách dùng**: mỗi mục = 1 khái niệm → trực giác → nối thẳng vào bài học cụ thể trong khóa.
Không phải giáo trình toán — chỉ là cây cầu đủ chắc để đi qua.

---

## PHẦN A — Đại số tuyến tính tối thiểu

### A1. Vector = một dòng dữ liệu
Một học viên `[7.5, 90, 82]` (giờ học, điểm danh, quiz) là một **vector** — một điểm trong không
gian 3 chiều. Khoảng cách giữa 2 học viên = độ "giống nhau" của họ.
→ *Đây là lý do Bài 6 phải scale: một trục đo bằng nghìn sẽ nuốt các trục đo bằng chục.*

### A2. Ma trận X = chồng N vector lên nhau
`X` shape `(200, 3)` = 200 học viên × 3 thuộc tính. **Dòng = mẫu, cột = thuộc tính** (Bài 3).
Mọi model trong khóa chỉ "nhìn thấy" thế giới qua ma trận này.

### A3. Phép nhân `X @ w + b` = chấm điểm hàng loạt
```
scores = X @ w + b        # (200,3) @ (3,) + số  →  (200,)
```
Mỗi dòng: `score = w₁x₁ + w₂x₂ + w₃x₃ + b` — một **tổng có trọng số**: mỗi thuộc tính "bỏ phiếu"
với trọng lượng wᵢ, b là điểm khởi tại.
→ *Bài 8 (1 feature: w·x + b), Bài 13 (nhiều feature: X @ w + b). Toàn bộ deep learning về sau
cũng chỉ là phép này xếp chồng nhiều tầng.*

### A4. Hình học: (w₁, w₂) là VECTOR PHÁP TUYẾN của ranh giới
Tập điểm có `w₁x₁ + w₂x₂ + b = 0` là một đường thẳng. Đổi tỉ lệ w₁/w₂ → đường **xoay**;
đổi b → đường **tịnh tiến** song song. Dấu của score cho biết điểm nằm phía nào.
→ *Bài 13 — boundary tuner chính là thí nghiệm sờ tận tay định lý này.*

---

## PHẦN B — Thống kê mô tả (nguyên liệu của Bài 7, 9, 14)

### B1. Mean — tâm của phân phối
`mean = Σxᵢ / n`. Chỉ nói TÂM, không nói gì về độ trải. Hai lớp cùng mean 6.2 có thể khác nhau
một trời một vực (Bài 7).

### B2. Variance & Std — độ trải quanh tâm
`var = mean((x − mean)²)` — trung bình bình phương độ lệch; `std = √var` (trả về đúng đơn vị gốc).
→ *Chính là mẫu số của standardization Bài 6: z = (x − mean)/std = "cách tâm mấy std".*

### B3. Covariance — chiều đồng biến của MỘT CẶP biến
`cov(x, y) = mean((x − x̄)(y − ȳ))`. Dấu đọc được (dương = cùng chiều), độ lớn thì dính đơn vị
(giờ×điểm) nên **không so sánh được giữa các cặp**.

### B4. Correlation — covariance đã chuẩn hóa
`r = cov(x, y) / (std_x · std_y)` ∈ [−1, 1]. So sánh được mọi cặp. Hai cảnh giới (Bài 7):
- r chỉ đo quan hệ **TUYẾN TÍNH** (hình chữ U hoàn hảo vẫn cho r ≈ 0);
- **r cao không chứng minh nhân quả** — kết luận nhân quả cần thí nghiệm can thiệp.

### B5. MSE và R² — hai cách đọc cùng một lỗi
`MSE = mean((ŷ − y)²)` — đơn vị bình phương, khó cảm (Bài 9).
`R² = 1 − MSE_model / MSE_baseline`, trong đó baseline = "đoán mọi người bằng mean" — mà
MSE của baseline **chính là variance của y** (nối B2!). R² ∈ [0, 1]: "model giải thích bao nhiêu
% biến thiên". Thang đọc được cho người không làm ML.

---

## PHẦN C — Giải tích cho Gradient Descent (nguyên liệu của Bài 10)

### C1. Đạo hàm = độ dốc tại chỗ đứng
`f'(w)` trả lời: "nhích w lên một chút thì f đổi bao nhiêu, theo chiều nào?"
Dương = dốc lên phía trước; âm = dốc xuống.

### C2. Gradient = đạo hàm theo TỪNG tham số, gói lại
Cost MSE(w, b) là một "địa hình". Gradient `(∂MSE/∂w, ∂MSE/∂b)` chỉ hướng **dốc lên nhanh nhất**
→ muốn xuống đáy: đi **ngược** gradient. Đó là toàn bộ dấu trừ trong `w -= α · grad` (Bài 10).

Với MSE của đường thẳng, tính tay được (chain rule 1 lớp):
```
∂MSE/∂w = 2 · mean((ŷ − y) · x)      ∂MSE/∂b = 2 · mean(ŷ − y)
```
— đúng công thức trong `compute_gradients` của `ml_lab`.

### C3. Learning rate α — độ dài bước chân
Gradient chọn HƯỚNG, α chọn ĐỘ DÀI. Ba chế độ (Bài 10 console): α nhỏ = bò mãi không tới;
α vừa = hội tụ êm; α lớn = nhảy QUA đáy, mỗi bước văng xa hơn → loss bùng nổ.
*(Course 3 sẽ nâng cấp: momentum, Adam — nhưng lõi vẫn là C1-C3.)*

---

## PHẦN D — Mũ, log và log-odds (nguyên liệu của Bài 12)

### D1. e^z và log
`e ≈ 2.718`; `exp(z) = e^z` luôn dương, tăng cực nhanh. `log` là hàm ngược: `log(e^z) = z`,
biến phép NHÂN thành phép CỘNG.

### D2. Odds — tỉ lệ cược
`odds = p / (1 − p)`: p = 0.5 → odds 1:1; p = 0.832 → odds ≈ 4.95 (cược 5 ăn 1).
Odds chạy từ 0 đến ∞ — vẫn lệch một phía.

### D3. Log-odds — và lý do sigmoid KHÔNG phải công thức tùy hứng
`z = log(p / (1 − p))` chạy trên TOÀN BỘ trục thực — đối xứng, không bị chặn. Vậy nên mô hình
tuyến tính hóa **log-odds** (thứ có thể chạy tự do như X @ w + b), rồi giải ngược ra p:
```
z = log(p/(1−p))   ⟺   p = 1/(1 + e^(−z)) = sigmoid(z)
```
Sigmoid chỉ là **hàm ngược của log-odds** (ISLR §4.3.1). Mỗi +1 điểm z = nhân odds với e.
→ *Bài 12 — đây là câu trả lời đầy đủ cho "vì sao đúng là hàm này".*

---

## PHẦN E — Bridge Pack B1–B4 theo spec gốc (ôn nhanh trước Course 2)

| Pack | Nội dung | Ôn ở bài |
|---|---|---|
| **B1 — Python + Pandas** | `df.shape`, `df.columns`, chọn cột `df[["a","b"]]` / `df["y"]`, `dtypes`, `unique`, `isna`, `fillna`, `between`, `isin` | Bài 3, 4, 5 |
| **B2 — Quy trình ML** | Công thức bất biến: nạp dữ liệu → `fit(X_train, y_train)` → `predict(X_new)` → metric. Fit TRƯỚC predict; predict trên dữ liệu MỚI | Bài 1, 2, 8 |
| **B3 — Split & scale an toàn** | 60/20/20 stratified (0.20 rồi 0.25), `random_state`; MỌI thống kê học được (mean/std/median-impute) chỉ fit trên TRAIN | Bài 5, 6, 15 |
| **B4 — Suy luận Linear/Logistic** | `ŷ = X @ w + b` (hồi quy); `p = sigmoid(X @ w + b)`, nhãn = `p ≥ threshold`; ranh giới tại z = 0 | Bài 8, 12, 13 |

**Chẩn đoán vào Course 2** (theo spec): 8 câu concept (loại bài toán, X/y, scaling, MSE, sigmoid,
overfit, leakage split) + 2 bài code ngắn + 2 câu risk. Trượt phần nào → ôn đúng pack đó, không
bắt học lại cả Course 1.

---

## Phụ lục — Bản đồ "cơ chế toán" đã vá inline trong Course 1

| Gap audit | Vá tại | Nội dung |
|---|---|---|
| #12 Ordinal vs Nominal (Zaki §1.2) | Bài 4, Step 2 | satisfaction {Thấp<Vừa<Cao}: so sánh được, cộng trừ không |
| #11 R² (ISLR §3.1.3) | Bài 9, Step 2 + tổng kết | R² = 1 − MSE/var(y), nối variance Bài 7 |
| #7 Log-odds (ISLR §4.3.1) | Bài 12, Step 2 | sigmoid = hàm ngược của log-odds (chi tiết ở Phần D) |
| #8 Bias/Variance (ISLR §2.2.2) | Bài 14, Step 2 | cứng = bias (sai cùng kiểu), mềm = variance (dao động theo mẫu) |
