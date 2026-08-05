"""ml_lab — thư viện mô phỏng cho khóa Machine Learning (PE Web).
Nạp vào Pyodide virtual FS lúc worker khởi tạo; học viên `from ml_lab import ...`
đúng như trong spec. Mỗi bài mở rộng file này bằng dataset + wrapper riêng.
"""
import copy
import numpy as np
import pandas as pd

# ── Bài 1 — Machine Learning vs Traditional Programming ─────────────────────
# Dataset: 12 học viên, 3 feature (study_hours, attendance, midterm_score), target pass_fail.
# Bối cảnh Bài 1: tuần 8 của kỳ 15 tuần — midterm_score = điểm giữa kỳ /100 (thi tuần 7).
_STUDY_X = np.array([
    [2, 55, 45], [8, 95, 85], [1, 50, 40], [9, 98, 90], [3, 60, 50],
    [7, 92, 80], [2, 58, 48], [8, 96, 88], [4, 70, 60], [9, 99, 95],
    [1, 52, 42], [6, 88, 78],
], dtype=float)
_STUDY_Y = np.array([0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1])


def load_study_data(seed=None):
    """Trả về X, y, X_new — 12 học viên lịch sử + 1 học viên mới cần dự đoán.
    seed (tuỳ chọn, dùng cho hidden test): đổi X_new sang 1 điểm khác trong dữ liệu."""
    X_new = np.array([[7.0, 90.0, 82.0]])
    if seed is not None:
        rng = np.random.RandomState(seed)
        idx = rng.randint(0, len(_STUDY_X))
        jitter = rng.uniform(-1.5, 1.5, size=3)
        X_new = (_STUDY_X[idx] + jitter).reshape(1, -1)
    return _STUDY_X.copy(), _STUDY_Y.copy(), X_new


class SimpleClassifier:
    """Wrapper fit/predict tối giản — khoảng cách tới tâm mỗi lớp (nearest-centroid).
    Đủ để dạy đúng workflow fit→predict mà không cần giải thích thuật toán ở Bài 1."""

    def __init__(self):
        self._fitted = False
        self._mean_pos = None
        self._mean_neg = None

    def fit(self, X, y):
        X = np.asarray(X, dtype=float)
        y = np.asarray(y)
        if X.shape[0] != y.shape[0]:
            raise ValueError("X và y phải có cùng số dòng")
        if len(np.unique(y)) < 2:
            raise ValueError("y cần có cả lớp 0 và lớp 1 để fit")
        self._mean_pos = X[y == 1].mean(axis=0)
        self._mean_neg = X[y == 0].mean(axis=0)
        self._fitted = True
        return self

    def predict(self, X_new):
        if not self._fitted:
            raise RuntimeError("Phải gọi fit(X, y) trước khi predict — model chưa được huấn luyện.")
        X_new = np.asarray(X_new, dtype=float)
        if X_new.ndim == 1:
            X_new = X_new.reshape(1, -1)
        d_pos = np.linalg.norm(X_new - self._mean_pos, axis=1)
        d_neg = np.linalg.norm(X_new - self._mean_neg, axis=1)
        return (d_pos < d_neg).astype(int)


# ── Bài 2 — Regression / Classification / Clustering trên CÙNG 1 bảng feature ─
# Dataset: 24 học viên, cùng 3 feature; final_score sinh theo công thức cố định
# để y_score (liên tục) và y_label (0/1) luôn nhất quán với nhau.
_FULL_X = np.array([
    [2.0, 55, 45], [8.0, 95, 85], [1.0, 50, 40], [9.0, 98, 90],
    [3.0, 60, 50], [7.0, 92, 80], [2.5, 58, 48], [8.5, 96, 88],
    [4.0, 70, 60], [9.5, 99, 95], [1.5, 52, 42], [6.0, 88, 78],
    [5.0, 75, 65], [3.5, 65, 55], [7.5, 90, 82], [2.0, 62, 44],
    [6.5, 85, 72], [4.5, 72, 58], [8.0, 93, 86], [1.0, 48, 38],
    [5.5, 80, 70], [9.0, 97, 92], [3.0, 66, 52], [7.0, 89, 76],
], dtype=float)
_FULL_SCORE = np.clip(
    5.5 * _FULL_X[:, 0] + 0.30 * _FULL_X[:, 1] + 0.25 * _FULL_X[:, 2] - 12.0,
    0, 100
).round(1)
_FULL_LABEL = (_FULL_SCORE >= 50).astype(int)


def load_study_data_full(seed=None):
    """Trả về X, y_score, y_label, X_new — cùng 1 bảng feature, 2 target khả dĩ.
    y_score: final_score liên tục (regression). y_label: pass_fail 0/1 (classification)."""
    X_new = np.array([[6.5, 85.0, 74.0]])
    if seed is not None:
        rng = np.random.RandomState(seed)
        idx = rng.randint(0, len(_FULL_X))
        jitter = rng.uniform(-1.0, 1.0, size=3)
        X_new = (_FULL_X[idx] + jitter).reshape(1, -1)
    return _FULL_X.copy(), _FULL_SCORE.copy(), _FULL_LABEL.copy(), X_new


class SimpleRegressor:
    """Hồi quy tuyến tính tối giản (least squares) — hợp đồng: predict trả SỐ THỰC."""

    def __init__(self):
        self._fitted = False
        self._w = None

    def fit(self, X, y):
        X = np.asarray(X, dtype=float)
        y = np.asarray(y, dtype=float)
        if X.shape[0] != y.shape[0]:
            raise ValueError("X và y phải có cùng số dòng")
        A = np.hstack([X, np.ones((X.shape[0], 1))])
        self._w, _, _, _ = np.linalg.lstsq(A, y, rcond=None)
        self._fitted = True
        return self

    def predict(self, X_new):
        if not self._fitted:
            raise RuntimeError("Phải gọi fit(X, y) trước khi predict — model chưa được huấn luyện.")
        X_new = np.asarray(X_new, dtype=float)
        if X_new.ndim == 1:
            X_new = X_new.reshape(1, -1)
        A = np.hstack([X_new, np.ones((X_new.shape[0], 1))])
        return np.round(A @ self._w, 1)


class SimpleClusterer:
    """K-means tối giản, init tất định (không random) — hợp đồng: fit_predict(X)
    trả Cluster ID 0..k-1; ID chỉ là tên gọi tùy ý, KHÔNG có thứ tự."""

    def __init__(self, k=3):
        self.k = int(k)
        self._centers = None

    def fit_predict(self, X):
        X = np.asarray(X, dtype=float)
        if X.shape[0] < self.k:
            raise ValueError("Cần ít nhất k dòng dữ liệu để chia k cụm")
        order = np.argsort(X.sum(axis=1))
        idx = order[np.linspace(0, len(X) - 1, self.k).astype(int)]
        centers = X[idx].astype(float)
        labels = np.zeros(len(X), dtype=int)
        for _ in range(20):
            d = np.linalg.norm(X[:, None, :] - centers[None, :, :], axis=2)
            labels = d.argmin(axis=1)
            for j in range(self.k):
                if np.any(labels == j):
                    centers[j] = X[labels == j].mean(axis=0)
        self._centers = centers
        return labels


# ── Bài 3 — Raw DataFrame, X và y ────────────────────────────────────────────
def load_student_dataframe(shuffle_seed=None):
    """Trả về DataFrame 200 dòng × 5 cột: study_hours, attendance, midterm_score,
    final_score, pass_fail. Sinh tất định (seed cố định) — mọi học viên thấy cùng dữ liệu.
    (2026-07-19: cột điểm đổi tên quiz_score → midterm_score đồng bộ bối cảnh tuần 8
    của Bài 1-2 — spec API gốc ghi quiz_score, deviation có ghi trong doc audit.)
    shuffle_seed (grader dùng): xáo thứ tự dòng để kiểm schema không phụ thuộc vị trí."""
    rng = np.random.RandomState(4242)
    n = 200
    study_hours = np.round(rng.uniform(0.5, 10.0, n), 1)
    attendance = np.round(rng.uniform(40, 100, n), 0)
    midterm_score = np.round(np.clip(6.5 * study_hours + rng.normal(0, 12, n) + 18, 0, 100), 0)
    final_score = np.round(np.clip(
        4.5 * study_hours + 0.25 * attendance + 0.35 * midterm_score + rng.normal(0, 6, n),
        0, 100), 0)
    pass_fail = (final_score >= 50).astype(int)
    df = pd.DataFrame({
        'study_hours': study_hours,
        'attendance': attendance,
        'midterm_score': midterm_score,
        'final_score': final_score,
        'pass_fail': pass_fail,
    })
    if shuffle_seed is not None:
        df = df.sample(frac=1.0, random_state=shuffle_seed).reset_index(drop=True)
    return df


# ── Bài 8 — Đường dự đoán tuyến tính đầu tiên ────────────────────────────────
# 12 điểm quanh y = 7x + 25 (noise σ=3) — TRÙNG KHỚP scatter hiển thị ở Step 1/3.
_LINEAR_X = np.array([1.3, 1.5, 2.0, 2.7, 2.8, 3.3, 3.4, 4.6, 4.9, 5.9, 6.7, 8.7])
_LINEAR_Y = np.array([34.0, 30.0, 38.0, 45.0, 47.0, 43.0, 50.0, 56.0, 66.0, 63.0, 69.0, 80.0])


def load_linear_intro_data():
    """Trả về x (study_hours), y (final_score) — 12 học viên, 1 feature."""
    return _LINEAR_X.copy(), _LINEAR_Y.copy()


# ── Bài 9 — MSE demo ─────────────────────────────────────────────────────────
def load_mse_demo():
    """Trả về actual, predictions_a (ŷ = 8x + 20), predictions_b (ŷ = 4x + 45)
    trên cùng 12 học viên — A tốt hơn B rõ rệt theo MSE."""
    actual = _LINEAR_Y.copy()
    pred_a = np.round(8.0 * _LINEAR_X + 20.0, 1)
    pred_b = np.round(4.0 * _LINEAR_X + 45.0, 1)
    return actual, pred_a, pred_b


# ── Bài 10 — Gradient Descent ────────────────────────────────────────────────
def load_gradient_data(variant=None):
    """40 điểm (x, y) quanh y = 8x + 20 (noise σ=4). variant (grader dùng):
    dataset ẨN với tham số thật khác — bắt bài hard-code kết quả."""
    if variant is None:
        rng = np.random.RandomState(1901)
        x = np.round(rng.uniform(0.5, 9.5, 40), 1)
        y = np.round(8.0 * x + 20.0 + rng.normal(0, 4, 40), 1)
    else:
        rng = np.random.RandomState(variant)
        x = np.round(rng.uniform(0.5, 9.5, 40), 1)
        y = np.round(5.0 * x + 30.0 + rng.normal(0, 4, 40), 1)
    return x, y


def compute_mse(actual, predictions):
    """MSE = trung bình bình phương lỗi."""
    actual = np.asarray(actual, dtype=float)
    predictions = np.asarray(predictions, dtype=float)
    return float(((predictions - actual) ** 2).mean())


def compute_gradients(x, y, weight, bias):
    """Trả về (grad_w, grad_b) của MSE với ŷ = weight*x + bias."""
    x = np.asarray(x, dtype=float)
    y = np.asarray(y, dtype=float)
    err = weight * x + bias - y
    return float(2.0 * (err * x).mean()), float(2.0 * err.mean())


# ── Bài 11 — LinearRegression trên nhãn 0/1 (audit công thức hóa sai) ────────
def load_binary_regression_demo(variant=None):
    """X_train (60,1) study_hours + y_train 0/1, X_probe (12,1) TRẢI RỘNG HƠN
    khoảng train (kể cả x âm/x rất lớn) để lộ output không bị chặn."""
    rng = np.random.RandomState(variant if variant is not None else 1101)
    x = np.round(rng.uniform(0.5, 9.5, 60), 1)
    p_true = 1.0 / (1.0 + np.exp(-(1.1 * x - 5.5)))
    y = (rng.uniform(0, 1, 60) < p_true).astype(int)
    X_train = x.reshape(-1, 1)
    probe = np.array([-2.0, -0.5, 0.5, 1.5, 3.0, 4.5, 5.5, 7.0, 8.5, 10.5, 12.0, 14.0])
    if variant is not None:
        probe = probe + rng.uniform(-0.4, 0.4, probe.shape)
    return X_train, y, probe.reshape(-1, 1)


# ── Bài 12 — Sigmoid ─────────────────────────────────────────────────────────
def load_sigmoid_scores():
    """Mảng score tuyến tính z dùng trong bài sigmoid."""
    return np.array([-4.0, -1.6, 0.0, 1.6, 4.0])


# ── Bài 13 — Decision boundary 2 feature ─────────────────────────────────────
def load_boundary_data():
    """Trả về X (20, 2), weights (2,), bias — demo ranh giới tuyến tính 2D
    (2 feature: study_hours, quiz_score thang 0-10)."""
    rng = np.random.RandomState(1301)
    X = np.round(rng.uniform(0.5, 9.5, (20, 2)), 1)
    weights = np.array([1.2, -1.0])
    bias = -2.0
    return X, weights.copy(), float(bias)


# ── Bài 14 — Underfit / Good fit / Overfit (đa thức bậc 1/3/12) ──────────────
class _PolyModel:
    """Model đa thức đã fit — hợp đồng .predict(X) như mọi model khác."""

    def __init__(self, coeffs):
        self._p = np.poly1d(coeffs)

    def predict(self, X):
        return self._p(np.asarray(X, dtype=float))


def load_complexity_demo(variant=None):
    """X_train (24,), y_train, X_check (20,), y_check.
    Mặc định: đường thật BẬC 3 → bậc 3 thắng theo check MSE.
    variant (grader dùng): đường thật TUYẾN TÍNH → bậc tốt nhất ĐỔI thành 1 —
    bắt bài hard-code best_degree."""
    rng = np.random.RandomState(1400 if variant is None else variant)
    X_train = np.round(np.sort(rng.uniform(0, 10, 24)), 2)
    X_check = None
    if variant is None:
        truth = lambda x: 0.15 * (x - 2) * (x - 6) * (x - 9) + 40
    else:
        truth = lambda x: 5.0 * x + 20.0
    y_train = np.round(truth(X_train) + rng.normal(0, 3, 24), 1)
    X_check = np.round(np.sort(rng.uniform(0, 10, 20)), 2)
    y_check = np.round(truth(X_check) + rng.normal(0, 3, 20), 1)
    return X_train, y_train, X_check, y_check


def fit_polynomial_model(X_train, y_train, degree):
    """Fit đa thức bậc `degree` (np.polyfit) — trả model có .predict()."""
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter('ignore')
        coeffs = np.polyfit(np.asarray(X_train, dtype=float),
                            np.asarray(y_train, dtype=float), int(degree))
    return _PolyModel(coeffs)


def mean_squared_error(actual, predictions):
    """Alias MSE (đúng tên hàm học viên tự viết ở Bài 9)."""
    return compute_mse(actual, predictions)


# ── Bài 15 — Train / Validation / Test split ─────────────────────────────────
def load_split_dataset():
    """DataFrame X (1000, 3) + Series y nhị phân 70/30. Index 0..999 là row-id
    ổn định — grader dùng để kiểm tra 3 tập không giẫm chân nhau."""
    rng = np.random.RandomState(1500)
    n = 1000
    X = pd.DataFrame({
        'study_hours': np.round(rng.uniform(0.5, 10.0, n), 1),
        'attendance': np.round(rng.uniform(0, 10, n), 1),
        'quiz_score': np.round(rng.uniform(0, 10, n), 1),
    })
    y = pd.Series(np.zeros(n, dtype=int), name='pass_fail')
    y.iloc[rng.choice(n, 700, replace=False)] = 1
    return X, y


# ── Bài 4 — Storage dtype vs semantic type ───────────────────────────────────
def load_student_profile(shuffle_seed=None):
    """DataFrame 200 dòng × 6 cột minh họa 'cùng int64 nhưng nghĩa khác nhau':
    student_id (định danh), study_hours (liên tục), missed_classes (đếm rời rạc),
    major (nominal), scholarship (binary 0/1), pass_fail (target)."""
    rng = np.random.RandomState(1401)
    n = 200
    study_hours = np.round(rng.uniform(0.5, 10.0, n), 1)
    # B4 đợt 7: ép int64 tường minh — poisson/astype(int) ra int32 trên Windows nhưng
    # int64 trên Pyodide; bài giảng dạy "3 cột CÙNG int64" nên dtype phải ổn định mọi nền.
    missed_classes = rng.poisson(3, n).clip(0, 12).astype(np.int64)
    major = np.array(['ICT', 'DS', 'Space'])[rng.randint(0, 3, n)]
    scholarship = (rng.uniform(0, 1, n) < 0.3).astype(np.int64)
    score = 6.0 * study_hours - 1.5 * missed_classes + 3.0 * scholarship + rng.normal(0, 8, n) + 25
    pass_fail = (score >= 50).astype(int)
    df = pd.DataFrame({
        'student_id': np.arange(20520001, 20520001 + n),
        'study_hours': study_hours,
        'missed_classes': missed_classes,
        'major': major,
        'scholarship': scholarship,
        'pass_fail': pass_fail,
    })
    if shuffle_seed is not None:
        df = df.sample(frac=1.0, random_state=shuffle_seed).reset_index(drop=True)
    return df


# ── Bài 5 — Dữ liệu bẩn có kiểm soát ─────────────────────────────────────────
def load_dirty_student_profile(variant=None):
    """DataFrame 204 dòng chứa đúng các lỗi có kiểm soát: 4 dòng trùng 100%,
    NaN rải ở 3 cột số, attendance/quiz_score vượt thang 0-10, major sai chính tả
    ('ITC'), và 2 outlier study_hours (60, 45) — bất thường nhưng CÓ THỂ thật.
    variant (grader dùng): đổi VỊ TRÍ lỗi để bắt code hard-code theo vị trí."""
    rng = np.random.RandomState(1501)
    n = 200
    study_hours = np.round(rng.uniform(0.5, 12.0, n), 1)
    attendance = np.round(rng.uniform(2.0, 10.0, n), 1)
    quiz_score = np.round(rng.uniform(1.0, 10.0, n), 1)
    major = np.array(['ICT', 'DS', 'Space'])[rng.randint(0, 3, n)]
    pass_fail = ((4.0 * study_hours + 3.0 * attendance + 3.5 * quiz_score) >= 60).astype(int)
    df = pd.DataFrame({
        'student_id': np.arange(20520001, 20520001 + n),
        'study_hours': study_hours.astype(object),
        'attendance': attendance.astype(object),
        'quiz_score': quiz_score.astype(object),
        'major': major,
        'pass_fail': pass_fail,
    })
    pos = np.random.RandomState(variant if variant is not None else 1502)
    # NaN: 3 cột số, mỗi cột 3 ô — đặt ở các dòng KHÔNG bị nhân bản
    for col in ['study_hours', 'attendance', 'quiz_score']:
        for i in pos.choice(np.arange(10, 190), size=3, replace=False):
            df.at[int(i), col] = np.nan
    # Invalid range (thang 0-10): attendance=12, quiz_score=15
    df.at[int(pos.choice(np.arange(10, 190))), 'attendance'] = 12.0
    df.at[int(pos.choice(np.arange(10, 190))), 'quiz_score'] = 15.0
    # Category sai chính tả
    for i in pos.choice(np.arange(10, 190), size=2, replace=False):
        df.at[int(i), 'major'] = 'ITC'
    # Outlier nghi ngờ nhưng có thể thật — KHÔNG được xóa, chỉ flag
    i1, i2 = pos.choice(np.arange(10, 190), size=2, replace=False)
    df.at[int(i1), 'study_hours'] = 60.0
    df.at[int(i2), 'study_hours'] = 45.0
    # 4 dòng trùng 100% (copy 4 dòng đầu xuống cuối) → 204 dòng
    df = pd.concat([df, df.iloc[[0, 1, 2, 3]]], ignore_index=True)
    for col in ['study_hours', 'attendance', 'quiz_score']:
        df[col] = pd.to_numeric(df[col])
    return df


# ── Bài 6 — Scale mismatch ───────────────────────────────────────────────────
def load_scaling_dataset(variant=None):
    """DataFrame 200 dòng: 3 feature số với range chênh nhau hàng trăm lần
    (study_hours 0-10, attendance 0-100, activity_count 0-2000) + ID,
    category và target — để bài học 'đơn vị to át tiếng' và StandardScaler."""
    rng = np.random.RandomState(variant if variant is not None else 1601)
    n = 200
    study_hours = np.round(rng.uniform(0.5, 10.0, n), 1)
    attendance = np.round(rng.uniform(40, 100, n), 0)
    activity_count = np.round(rng.uniform(0, 2000, n), 0)
    major = np.array(['ICT', 'DS', 'Space'])[rng.randint(0, 3, n)]
    pass_fail = ((5.0 * study_hours + 0.3 * attendance + rng.normal(0, 8, n)) >= 55).astype(int)
    return pd.DataFrame({
        'student_id': np.arange(20520001, 20520001 + n),
        'study_hours': study_hours,
        'attendance': attendance,
        'activity_count': activity_count,
        'major': major,
        'pass_fail': pass_fail,
    })


# ── Bài 7 — Thống kê mô tả & quan hệ tuyến tính ─────────────────────────────
def load_statistics_dataset(shuffle_seed=None):
    """DataFrame 200 dòng: 5 cột phân tích + ID. Tương quan được DỰNG CÓ CHỦ ĐÍCH:
    quiz_score & study_hours quan hệ mạnh với final_score, missed_classes ngược
    chiều, student_id vô nghĩa — corr bất biến khi xáo dòng."""
    rng = np.random.RandomState(1701)
    n = 200
    study_hours = np.round(rng.uniform(0.5, 10.0, n), 1)
    attendance = np.round(np.clip(4.0 + 0.35 * study_hours + rng.normal(0, 1.8, n), 0, 10), 1)
    missed_classes = np.clip(np.round(9 - 0.7 * study_hours + rng.normal(0, 1.6, n)), 0, 12).astype(int)
    quiz_score = np.round(np.clip(1.0 + 0.85 * study_hours + rng.normal(0, 1.0, n), 0, 10), 1)
    final_score = np.round(np.clip(
        0.8 + 0.42 * study_hours + 0.18 * attendance + 0.45 * quiz_score
        - 0.12 * missed_classes + rng.normal(0, 0.7, n), 0, 10), 1)
    # Chuẩn hóa thang cho khớp toàn khóa (đổi tuyến tính ×10 → MỌI tương quan BẤT BIẾN):
    #   attendance → % (0-100) như B1-3/B6 · final_score → /100 như B2-3/B8-10.
    attendance = np.round(attendance * 10.0, 1)
    final_score = np.round(final_score * 10.0, 1)
    df = pd.DataFrame({
        'student_id': np.arange(20520001, 20520001 + n),
        'study_hours': study_hours,
        'attendance': attendance,
        'missed_classes': missed_classes,
        'quiz_score': quiz_score,
        'final_score': final_score,
    })
    if shuffle_seed is not None:
        df = df.sample(frac=1.0, random_state=shuffle_seed).reset_index(drop=True)
    return df


# ══════════════════════════════════════════════════════════════════════
# COURSE 2 — MACHINE LEARNING TRUNG CẤP (APPLIED ML)
# 14 lessons · 4 modules. Mỗi bài có load_* trả về đúng shape/dtype;
# grader gọi qua ml_grader.grade_lesson_c2_*.
# ══════════════════════════════════════════════════════════════════════

# ── Bài C2-1 — Multiple Linear Regression trong pipeline thực tế ────────
def load_multi_regression_splits(seed=0):
    """300 học viên × 3 feature (study_hours, attendance, sleep_h) →
    final_score liên tục. 70/30 split. Bài yêu cầu fit LinearRegression
    TRÊN TRAIN, đánh giá trên VAL (không leak val vào fit)."""
    rng = np.random.RandomState(1601 + seed)
    n = 300
    study_hours = rng.uniform(0.5, 10.0, n)
    attendance = rng.uniform(40, 100, n)
    sleep_h = rng.uniform(4.0, 9.5, n)
    noise = rng.normal(0, 5.0, n)
    final_score = np.clip(
        4.2 * study_hours + 0.35 * attendance + 1.8 * sleep_h - 10.0 + noise, 0, 100
    )
    X = np.column_stack([study_hours, attendance, sleep_h])
    n_tr = int(n * 0.7)
    return X[:n_tr], X[n_tr:], final_score[:n_tr], final_score[n_tr:]


# ── Bài C2-2 — Feature Scaling và Convergence ────────────────────────────
def load_scaling_convergence_data(seed=0):
    """200 mẫu × 2 feature LỆCH THANG ĐO RẤT XA: study_hours (0.5-10) vs
    family_income (15,000-90,000). Target readiness_score phụ thuộc CẢ 2
    cột. Nếu không scale, gradient descent hội tụ rất chậm/không ổn định
    vì income lấn át hoàn toàn gradient của study_hours."""
    rng = np.random.RandomState(1602 + seed)
    n = 200
    study_hours = rng.uniform(0.5, 10.0, n)
    family_income = rng.uniform(15000, 90000, n)
    noise = rng.normal(0, 1.5, n)
    readiness = 3.0 * study_hours + 0.00035 * family_income + noise
    X = np.column_stack([study_hours, family_income])
    return X, readiness


def run_gd_linear(X, y, lr=0.01, n_iter=200):
    """GD tối giản cho Linear Regression 2-feature (không bias riêng —
    X phải có cột bias nếu cần). Trả về (weights, loss_history).
    Dùng để SO SÁNH hội tụ scaled vs unscaled — KHÔNG phải lời giải bài,
    học viên tự viết vòng lặp GD của mình trong Step 4."""
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    n, d = X.shape
    w = np.zeros(d)
    b = 0.0
    loss_history = []
    for _ in range(int(n_iter)):
        pred = X @ w + b
        err = pred - y
        loss_history.append(float((err ** 2).mean()))
        grad_w = (2.0 / n) * (X.T @ err)
        grad_b = (2.0 / n) * err.sum()
        w -= lr * grad_w
        b -= lr * grad_b
    return w, b, loss_history


# ── Bài C2-3 — Logistic Loss và những prediction sai đầy tự tin ─────────
def load_logloss_demo():
    """6 nhãn thật + 2 bộ xác suất dự đoán CÙNG SỐ LƯỢNG dự đoán sai
    (2/6 theo ngưỡng 0.5) nhưng ĐỘ TỰ TIN khác hẳn nhau — 'cautious' sai
    nhưng không chắc chắn, 'overconfident' sai mà rất chắc chắn.
    Log loss của overconfident phải LỚN HƠN NHIỀU dù accuracy bằng nhau."""
    y_true = np.array([1, 1, 0, 0, 1, 0])
    probs_cautious = np.array([0.60, 0.55, 0.40, 0.45, 0.40, 0.55])
    probs_overconfident = np.array([0.60, 0.55, 0.40, 0.45, 0.05, 0.97])
    return y_true, probs_cautious, probs_overconfident


# ── Bài C2-4 — Train Logistic Regression bằng Gradient Descent ──────────
def load_logistic_gd_data(seed=0):
    """300 mẫu × 2 feature, ranh giới gần-tuyến tính (noise vừa phải) —
    đủ để LogisticRegression học tốt nhưng không tách 100% hoàn hảo.
    70/30 split."""
    rng = np.random.RandomState(1604 + seed)
    n = 300
    X = rng.normal(0, 1.5, size=(n, 2))
    z = 1.4 * X[:, 0] - 1.1 * X[:, 1] + 0.3
    p = 1.0 / (1.0 + np.exp(-z))
    y = (rng.uniform(0, 1, n) < p).astype(int)
    n_tr = int(n * 0.7)
    return X[:n_tr], X[n_tr:], y[:n_tr], y[n_tr:]


# ── Bài C2-5 — Regularization: kiểm soát độ phức tạp của model ──────────
def load_regularization_data(seed=0):
    """400 mẫu × 30 feature — CHỈ 5 cột đầu (0-4) thật sự quyết định nhãn,
    25 cột còn lại (5-29) là nhiễu thuần. L1 mạnh nên đẩy hệ số 25 cột
    nhiễu về gần 0; L2 chỉ co nhỏ đều, không triệt tiêu. 70/30 split."""
    rng = np.random.RandomState(1605 + seed)
    n, d = 400, 30
    X = rng.normal(0, 1, size=(n, d))
    true_w = np.array([1.5, -1.2, 1.0, 0.8, -0.9])
    z = X[:, :5] @ true_w
    p = 1.0 / (1.0 + np.exp(-z))
    y = (rng.uniform(0, 1, n) < p).astype(int)
    n_tr = int(n * 0.7)
    return X[:n_tr], X[n_tr:], y[:n_tr], y[n_tr:]


# ── Bài C2-6 — Chọn regularization strength bằng Validation ─────────────
def load_reg_strength_splits(seed=0):
    """500 mẫu × 20 feature — 4 cột đầu (0-3) thật sự quyết định nhãn,
    16 cột còn lại là nhiễu. C quá lớn (regularization yếu) → overfit
    nhiễu; C quá nhỏ (regularization mạnh) → underfit. C tối ưu nằm
    ở khoảng giữa, CHỈ tìm được bằng validation F1, không đoán mù."""
    rng = np.random.RandomState(1606 + seed)
    n, d = 500, 20
    X = rng.normal(0, 1, size=(n, d))
    true_w = np.array([1.2, -1.0, 0.9, -0.8])
    z = X[:, :4] @ true_w
    p = 1.0 / (1.0 + np.exp(-z))
    y = (rng.uniform(0, 1, n) < p).astype(int)
    n_tr = int(n * 0.7)
    return X[:n_tr], X[n_tr:], y[:n_tr], y[n_tr:]


# ── Bài C2-7 — Bias-Variance: chẩn đoán học ổn định/không ổn định ───────
def load_bias_variance_data(seed=0):
    """X_train THƯA (25 điểm — dễ overfit bậc cao), X_val DÀY (200 điểm)
    trên cùng khoảng. Đường thật là bậc 3 — model bậc 1 underfit (bias
    cao), bậc 15 overfit (variance cao trên 25 điểm thưa), bậc 3 vừa."""
    rng = np.random.RandomState(1607 + seed)
    truth = lambda x: 0.12 * (x - 2) * (x - 5) * (x - 8) + 35
    X_train = np.sort(rng.uniform(0, 10, 25))
    y_train = truth(X_train) + rng.normal(0, 3.0, 25)
    X_val = np.sort(rng.uniform(0, 10, 200))
    y_val = truth(X_val) + rng.normal(0, 3.0, 200)
    return X_train, y_train, X_val, y_val


# ── Bài C2-8 — Chọn regression metric: MAE, MSE và R-squared ────────────
def load_regression_metrics_data():
    """10 cặp (actual, prediction) SÁT NHAU, TRỪ 1 OUTLIER (index 7) lệch
    rất xa. MSE bị outlier đó kéo lên mạnh hơn hẳn MAE — minh hoạ trực
    tiếp vì sao chọn metric ảnh hưởng đến cách 'model tốt' được định nghĩa."""
    actual = np.array([50.0, 62.0, 71.0, 45.0, 80.0, 55.0, 68.0, 90.0, 73.0, 58.0])
    predictions = np.array([52.0, 60.0, 69.0, 47.0, 78.0, 57.0, 66.0, 40.0, 75.0, 56.0])
    return actual, predictions


# ── Bài C2-9 — Confusion Matrix và class imbalance ───────────────────────
def load_imbalanced_data(seed=0):
    """1000 mẫu, mất cân bằng NẶNG: 950 lớp 0, 50 lớp 1. y_pred_naive =
    LUÔN đoán 0 → accuracy = 0.950 nhưng VÔ DỤNG (recall = 0). y_pred_model
    = classifier thật, bắt đúng 40/50 positive (10 false negative) + 45
    false positive trong 950 negative → accuracy = 0.945, THẤP HƠN naive,
    nhưng recall = 0.8 — hữu ích hơn nhiều. Đây chính là cái bẫy: accuracy
    một mình có thể xếp hạng SAI classifier nào thật sự tốt hơn."""
    rng = np.random.RandomState(1609 + seed)
    n_neg, n_pos = 950, 50
    n = n_neg + n_pos
    y_true = np.array([0] * n_neg + [1] * n_pos)
    y_pred_naive = np.zeros(n, dtype=int)

    # Model thật: bắt đúng 40/50 positive (10 false negative), 45 false positive trong negative.
    y_pred_model = np.zeros(n, dtype=int)
    pos_idx = np.arange(n_neg, n)
    caught_pos = rng.choice(pos_idx, size=40, replace=False)
    y_pred_model[caught_pos] = 1
    neg_idx = np.arange(0, n_neg)
    false_pos = rng.choice(neg_idx, size=45, replace=False)
    y_pred_model[false_pos] = 1
    return y_true, y_pred_naive, y_pred_model


# ── Bài C2-10 — Accuracy, Precision, Recall và F1 ────────────────────────
def load_prf_data(seed=0):
    """100 mẫu (30 positive, 70 negative) + 2 classifier trade-off ngược
    nhau: 'conservative' đoán positive RẤT ÍT nhưng gần như luôn đúng khi
    đoán (precision cao, recall thấp); 'liberal' đoán positive RẤT NHIỀU,
    bắt gần hết positive thật nhưng lẫn nhiều false positive (recall cao,
    precision thấp)."""
    rng = np.random.RandomState(1610 + seed)
    n_pos, n_neg = 30, 70
    y_true = np.array([1] * n_pos + [0] * n_neg)
    pos_idx = np.arange(0, n_pos)
    neg_idx = np.arange(n_pos, n_pos + n_neg)

    y_pred_conservative = np.zeros(n_pos + n_neg, dtype=int)
    caught = rng.choice(pos_idx, size=10, replace=False)
    y_pred_conservative[caught] = 1
    fp = rng.choice(neg_idx, size=1, replace=False)
    y_pred_conservative[fp] = 1

    y_pred_liberal = np.zeros(n_pos + n_neg, dtype=int)
    caught2 = rng.choice(pos_idx, size=28, replace=False)
    y_pred_liberal[caught2] = 1
    fp2 = rng.choice(neg_idx, size=35, replace=False)
    y_pred_liberal[fp2] = 1

    return y_true, y_pred_conservative, y_pred_liberal


# ── Bài C2-11 — K-Nearest Neighbors ───────────────────────────────────────
def load_knn_data(seed=0):
    """300 mẫu × 2 feature, 2 cụm GẦN NHAU với overlap thật (std=1.6, tâm
    cách nhau ~3.1) — đủ nhiễu để accuracy THAY ĐỔI THEO k thật sự (k=1
    bắt nhiễu biên, k rất lớn có thể oversmooth) thay vì mọi k đều
    perfect. 70/30 split."""
    rng = np.random.RandomState(1611 + seed)
    n = 300
    n0, n1 = n // 2, n - n // 2
    X0 = rng.normal(loc=[3.0, 3.0], scale=1.6, size=(n0, 2))
    X1 = rng.normal(loc=[5.2, 5.2], scale=1.6, size=(n1, 2))
    X = np.vstack([X0, X1])
    y = np.array([0] * n0 + [1] * n1)
    idx = rng.permutation(n)
    X, y = X[idx], y[idx]
    n_tr = int(n * 0.7)
    return X[:n_tr], X[n_tr:], y[:n_tr], y[n_tr:]


# ── Bài C2-12 — KNN và Feature Scaling ───────────────────────────────────
def load_knn_scaling_data(seed=0):
    """300 mẫu × 2 feature LỆCH THANG ĐO: study_hours (0.5-10, TÍN HIỆU
    MẠNH cho nhãn) và family_income (15,000-90,000, tín hiệu YẾU). Không
    scale → khoảng cách Euclidean bị income (thang hàng chục nghìn) ÁP
    ĐẢO hoàn toàn study_hours, dù income chỉ đóng góp NHỎ vào nhãn thật
    → KNN unscaled gần như đoán ngẫu nhiên. Scale đúng cách → accuracy
    tăng rõ rệt. Trả UNSCALED, học viên tự scale."""
    rng = np.random.RandomState(1612 + seed)
    n = 300
    study_hours = rng.uniform(0.5, 10.0, n)
    family_income = rng.uniform(15000, 90000, n)
    z = 1.4 * (study_hours - 5.0) / 3.0 + 0.15 * (family_income - 52000.0) / 22000.0
    p = 1.0 / (1.0 + np.exp(-z))
    y = (rng.uniform(0, 1, n) < p).astype(int)
    X = np.column_stack([study_hours, family_income])
    n_tr = int(n * 0.7)
    return X[:n_tr], X[n_tr:], y[:n_tr], y[n_tr:]


# ── Bài C2-13 — Decision Tree ──────────────────────────────────────────
def load_tree_data(seed=0):
    """500 mẫu × 5 feature (study_hours, attendance, quiz_score, sleep_h,
    screen_time_h). Nhãn có TƯƠNG TÁC phi tuyến (kiểu XOR nhẹ giữa 2
    feature) — Decision Tree không giới hạn depth sẽ overfit rõ (train
    acc ~100%, val acc thấp hơn hẳn); max_depth vừa phải thu hẹp gap."""
    rng = np.random.RandomState(1613 + seed)
    n = 500
    study_hours = rng.uniform(0.5, 10.0, n)
    attendance = rng.uniform(40, 100, n)
    quiz_score = rng.uniform(0, 10, n)
    sleep_h = rng.uniform(4.0, 9.5, n)
    screen_time_h = rng.uniform(0.5, 8.0, n)
    high_effort = (study_hours > 5.5).astype(int)
    high_attend = (attendance > 75).astype(int)
    interaction = (high_effort != high_attend).astype(int)  # XOR-ish
    z = 1.1 * interaction + 0.4 * (quiz_score - 5) - 0.15 * (screen_time_h - 4)
    p = 1.0 / (1.0 + np.exp(-z))
    y = (rng.uniform(0, 1, n) < p).astype(int)
    X = np.column_stack([study_hours, attendance, quiz_score, sleep_h, screen_time_h])
    names = ['study_hours', 'attendance', 'quiz_score', 'sleep_h', 'screen_time_h']
    n_tr = int(n * 0.7)
    return X[:n_tr], X[n_tr:], y[:n_tr], y[n_tr:], names


# ── Bài C2-14 — Random Forest ──────────────────────────────────────────
def load_forest_data(seed=0):
    """600 mẫu × 8 feature — CHỈ 3 cột đầu thật sự quyết định nhãn, 5 cột
    còn lại là nhiễu (nhiều nhiễu hơn Bài 13 để lộ rõ variance cao của
    1 cây đơn). Random Forest (nhiều cây, bootstrap + feature subsampling)
    phải cho val accuracy ỔN ĐỊNH HƠN và thường CAO HƠN 1 Decision Tree
    đơn không giới hạn depth."""
    rng = np.random.RandomState(1614 + seed)
    n, d = 600, 8
    X = rng.normal(0, 1, size=(n, d))
    true_w = np.array([1.3, -1.1, 0.95])
    z = X[:, :3] @ true_w
    p = 1.0 / (1.0 + np.exp(-z))
    y = (rng.uniform(0, 1, n) < p).astype(int)
    names = ['f%d' % i for i in range(d)]
    n_tr = int(n * 0.7)
    return X[:n_tr], X[n_tr:], y[:n_tr], y[n_tr:], names


# ══════════════════════════════════════════════════════════════════════════
# COURSE 3 — ADVANCED MODELING & NEURAL NETWORKS
# Spec: docs/ML_Curriculum_Course_1_2_3_Revised_with_Coverage_Audit.pdf (trang 137-208)
#     + docs/ML_Exercise_Bank_Courses_1_2_3_Full.pdf (trang 120-188).
# ══════════════════════════════════════════════════════════════════════════

# ── Bài C3-1 — High-dimensional data và curse of dimensionality ────────────
def load_dimension_experiment(seed=0, dims=(2, 20, 100), n_samples=320):
    """StudyLab Dimension Stress Test — 3 thí nghiệm KHỚP NHAU (dims 2/20/100):
    CÙNG n_samples, CÙNG 2 feature tín hiệu (focus_score, practice_score) và CÙNG
    quy luật nhãn logistic — chỉ số chiều NHIỄU thêm vào là khác nhau (kiểm soát
    đúng 1 biến, đúng tinh thần MS-4 'controlled comparison'). Nhiễu lấy từ 1 pool
    chung theo thứ tự cột → dims=20 và dims=100 LỒNG đúng cùng noise base, không
    phải random riêng biệt mỗi lần.

    Trả list dict theo dims: X_train, y_train, X_val, y_val (70/30 split) và
    X_probe (70 mẫu đầu, CHƯA scale — dùng đo distance-contrast thô, đúng hiện
    tượng concentration: min/max pairwise distance tiến về 1 khi chiều tăng).
    `seed` đổi → mẫu khác nhưng pattern (contrast tăng, KNN val-acc giảm dần)
    vẫn giữ nguyên → grader dùng seed ẩn để chặn hard-code (behavior tier)."""
    rng = np.random.RandomState(2601 + seed)
    n = n_samples
    X_informative = rng.normal(0, 1, size=(n, 2))
    true_w = np.array([1.4, -1.1])
    z = X_informative @ true_w
    p = 1.0 / (1.0 + np.exp(-z))
    y = (rng.uniform(0, 1, n) < p).astype(int)
    n_tr = int(n * 0.7)
    max_dim = max(dims)
    noise_pool = rng.normal(0, 1, size=(n, max_dim - 2))
    items = []
    for d in dims:
        X = X_informative[:, :d] if d <= 2 else np.hstack([X_informative, noise_pool[:, :d - 2]])
        items.append({
            'dimensions': d,
            'X_train': X[:n_tr], 'y_train': y[:n_tr],
            'X_val': X[n_tr:], 'y_val': y[n_tr:],
            'X_probe': X[:70],
        })
    return items


# ── Bài C3-2 — PCA và principal components ──────────────────────────────
def load_pca_splits(seed=0):
    """StudyLab behavior dataset — 300 học sinh × 15 feature hành vi học tập, sinh từ
    2 NHÂN TỐ ẨN (engagement, consistency) + nhiễu, mỗi feature 1 thang đo KHÁC NHAU
    (đơn vị lệch nhau — cố ý, để bài yêu cầu quyết định có standardize hay không).
    KHÔNG có target — PCA không cần (và không được dùng) nhãn.

    2 nhân tố ẩn tạo ra đúng 2 "cụm" feature tương quan mạnh:
    - engagement: login_freq, video_watch_min, resource_downloads, session_len_min…
    - consistency: ontime_submit_rate, streak_days, quiz_attempts…
    → PC1 (~61-62% variance) tải mạnh nhất lên login_freq; PC2 (~18-19%) tải mạnh nhất
    lên ontime_submit_rate — ổn định qua nhiều seed (grader dùng để chặn hard-code)."""
    rng = np.random.RandomState(3101 + seed)
    n = 300
    engagement = rng.normal(0, 1, n)
    consistency = rng.normal(0, 1, n)
    feature_names = [
        'login_freq', 'video_watch_min', 'forum_posts', 'quiz_attempts', 'resource_downloads',
        'session_len_min', 'streak_days', 'ontime_submit_rate', 'revisit_rate', 'note_taking_freq',
        'help_requests', 'peer_replies', 'bookmark_count', 'search_queries', 'practice_reruns',
    ]
    loadings_engagement = np.array([1.2, 1.1, 0.9, 0.3, 0.8, 1.0, 0.2, 0.1, 0.4, 0.7, 0.3, 0.6, 0.5, 0.6, 0.4])
    loadings_consistency = np.array([0.2, 0.1, 0.1, 0.9, 0.2, 0.1, 1.3, 1.2, 0.3, 0.2, 0.1, 0.1, 0.2, 0.1, 0.9])
    noise = rng.normal(0, 0.4, size=(n, 15))
    scale = np.array([3, 5, 2, 1, 4, 10, 1, 0.1, 0.3, 2, 1, 2, 3, 2, 1])
    X = (engagement[:, None] * loadings_engagement[None, :] +
         consistency[:, None] * loadings_consistency[None, :] + noise) * scale
    n_tr = int(n * 0.7)
    return X[:n_tr], X[n_tr:], feature_names


# ── Bài C3-3 — Explained variance và chọn số chiều ──────────────────────
def load_pca_selection_data(seed=0):
    """400 học sinh × 40 feature, sinh từ 6 NHÂN TỐ ẨN với phương sai GIẢM DẦN
    (3.0, 2.2, 1.6, 1.1, 0.8, 0.5) — mô phỏng đúng "phổ phương sai" thật của PCA.
    QUAN TRỌNG: nhãn pass_fail chỉ phụ thuộc nhân tố ẩn #4 và #5 — hai nhân tố
    PHƯƠNG SAI THẤP NHẤT. Đây là cốt lõi misconception của bài: giữ được nhiều
    phương sai (nhân tố #1-3) không đồng nghĩa giữ được tín hiệu dự đoán nhãn."""
    rng = np.random.RandomState(4201 + seed)
    n, d, n_factors = 400, 40, 6
    factor_std = np.array([3.0, 2.2, 1.6, 1.1, 0.8, 0.5])
    factors = rng.normal(0, 1, size=(n, n_factors)) * factor_std
    loadings = rng.normal(0, 1, size=(n_factors, d))
    noise = rng.normal(0, 0.6, size=(n, d))
    X = factors @ loadings + noise
    z = 1.3 * factors[:, 3] - 1.1 * factors[:, 4]
    p = 1.0 / (1.0 + np.exp(-z))
    y = (rng.uniform(0, 1, n) < p).astype(int)
    n_tr = int(n * 0.7)
    return X[:n_tr], X[n_tr:], y[:n_tr], y[n_tr:]


def validate_pca_representation(Z_train, Z_val, y_train, y_val):
    """Probe downstream CỐ ĐỊNH (LogisticRegression) — dùng để đánh giá 1 biểu diễn
    PCA (Z_train/Z_val) có còn hữu ích cho nhãn hay không, tách biệt với việc nó
    giữ được bao nhiêu % phương sai. Trả dict {val_accuracy, val_f1}."""
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import accuracy_score, f1_score
    clf = LogisticRegression(max_iter=1000).fit(Z_train, y_train)
    pred = clf.predict(Z_val)
    return {
        'val_accuracy': float(accuracy_score(y_val, pred)),
        'val_f1': float(f1_score(y_val, pred)),
    }


# ── Bài C3-4 — Trực quan hóa và audit dữ liệu sau PCA ───────────────────
def load_pca_visual_audit(seed=0):
    """300 học sinh × 20 feature hành vi học tập, sinh từ 4 nhân tố ẩn (phương sai
    2.5/1.6/1.0/0.6). Nhãn pass_fail phụ thuộc CHỦ YẾU nhân tố ẩn #1 (phương sai CAO
    NHẤT) → PC1/PC2 "trông sạch": biểu đồ 2D cho thấy tách lớp khá rõ, và
    accuracy downstream trên PCA(2) gần bằng trên feature gốc.

    CỐ Ý để bài học: dù biểu đồ đẹp và accuracy hợp lý, PC1 tải lên NHIỀU feature
    hành vi khác nhau (không phải 1 feature "engagement" duy nhất) — gán nhãn
    nguyên nhân ("PC1 = mức độ tương tác gây ra thành công") vẫn là suy diễn quá đà,
    PCA chỉ cho biết TƯƠNG QUAN qua tổ hợp tuyến tính, không phải quan hệ nhân quả."""
    rng = np.random.RandomState(5301 + seed)
    n, d, n_factors = 300, 20, 4
    factor_std = np.array([2.5, 1.6, 1.0, 0.6])
    factors = rng.normal(0, 1, size=(n, n_factors)) * factor_std
    loadings = rng.normal(0, 1, size=(n_factors, d))
    noise = rng.normal(0, 0.5, size=(n, d))
    X = factors @ loadings + noise
    z = 1.1 * factors[:, 0]
    p = 1.0 / (1.0 + np.exp(-z))
    y = (rng.uniform(0, 1, n) < p).astype(int)
    names = [
        'login_freq', 'video_watch_min', 'forum_posts', 'quiz_attempts', 'resource_downloads',
        'session_len_min', 'streak_days', 'ontime_submit_rate', 'revisit_rate', 'note_taking_freq',
        'help_requests', 'peer_replies', 'bookmark_count', 'search_queries', 'practice_reruns',
        'chat_messages', 'doc_edits', 'poll_votes', 'group_joins', 'error_retries',
    ]
    n_tr = int(n * 0.7)
    return X[:n_tr], X[n_tr:], y[:n_tr], y[n_tr:], names


def compare_raw_and_pca(A_train, A_val, Z_train, Z_val, y_train, y_val):
    """Đầu dò downstream CỐ ĐỊNH (LogisticRegression), so sánh accuracy khi dùng
    FEATURE GỐC (đã chuẩn hoá) so với PCA(2) — bằng chứng CÓ hay KHÔNG PCA làm
    mất khả năng dự đoán, tách biệt hoàn toàn khỏi việc biểu đồ có "đẹp" hay không."""
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import accuracy_score
    clf_raw = LogisticRegression(max_iter=1000).fit(A_train, y_train)
    clf_pca = LogisticRegression(max_iter=1000).fit(Z_train, y_train)
    return {
        'raw_accuracy': float(accuracy_score(y_val, clf_raw.predict(A_val))),
        'pca_accuracy': float(accuracy_score(y_val, clf_pca.predict(Z_val))),
    }


# ══════════════════════════════════════════════════════════════════════════
# MODULE 2 — MARGIN-BASED CLASSIFICATION
# ══════════════════════════════════════════════════════════════════════════

# ── Bài C3-5 — Support Vector Machines và margin ────────────────────────
def load_svm_splits(seed=0):
    """300 mẫu, 2 chiều (đủ để "lát cắt 2D" CHÍNH LÀ toàn bộ feature — không cần
    chọn 2 trong nhiều chiều). Seed CHẴN → 2 vòng tròn đồng tâm (phi tuyến, linear
    SVC thất bại rõ — F1 ~0.4, RBF đạt F1=1.0 với ÍT support vector hơn hẳn).
    Seed LẺ → 2 cụm Gauss tách biệt tuyến tính (linear SVC đã đủ, F1~1.0 với ÍT
    support vector hơn RBF — chọn linear vì đơn giản hơn mà không thua metric).
    Cố ý luân phiên theo seed để grader kiểm tra 'lựa chọn chính đáng thay đổi
    theo cấu trúc dữ liệu ẩn' (Model behavior của spec), không hard-code theo 1 kernel."""
    rng = np.random.RandomState(6401 + seed)
    n = 300
    nonlinear = (seed % 2 == 0)
    n0 = n // 2
    n1 = n - n0
    if nonlinear:
        r0 = rng.normal(1.5, 0.3, n0)
        th0 = rng.uniform(0, 2 * np.pi, n0)
        X0 = np.stack([r0 * np.cos(th0), r0 * np.sin(th0)], axis=1)
        r1 = rng.normal(3.5, 0.3, n1)
        th1 = rng.uniform(0, 2 * np.pi, n1)
        X1 = np.stack([r1 * np.cos(th1), r1 * np.sin(th1)], axis=1)
    else:
        X0 = rng.normal([-2, -2], 1.0, size=(n0, 2))
        X1 = rng.normal([2, 2], 1.0, size=(n1, 2))
    X = np.vstack([X0, X1])
    y = np.array([0] * n0 + [1] * n1)
    idx = rng.permutation(n)
    X, y = X[idx], y[idx]
    n_tr = int(n * 0.7)
    return X[:n_tr], X[n_tr:], y[:n_tr], y[n_tr:]


# ══════════════════════════════════════════════════════════════════════════
# MODULE 3 — CLUSTERING & STRUCTURE DISCOVERY
# ══════════════════════════════════════════════════════════════════════════

# ── Bài C3-6 — Clustering không phải classification ─────────────────────
def load_unsupervised_contract_data(seed=0):
    """240 học sinh × 2 feature hành vi (activity_score, consistency_score), 3 cụm
    Gauss tách khá rõ. Trả (X, external_labels) — external_labels là nhãn "niêm
    phong" chỉ dùng để AUDIT SAU KHI fit, TUYỆT ĐỐI không được đưa vào KMeans.fit().

    QUAN TRỌNG: thứ tự cluster_id mà KMeans trả về là NGẪU NHIÊN/tuỳ khởi tạo —
    không có gì đảm bảo cluster_id=0 khớp external_labels=0. Đây chính là cơ sở
    thật cho misconception của bài: ID là nhãn triển khai, hoán vị được."""
    rng = np.random.RandomState(7201 + seed)
    n = 240
    n_each = n // 3
    c0 = rng.normal([-3, -2], 0.8, size=(n_each, 2))
    c1 = rng.normal([0, 1], 0.8, size=(n_each, 2))
    c2 = rng.normal([3, -1], 0.8, size=(n - 2 * n_each, 2))
    X = np.vstack([c0, c1, c2])
    external_labels = np.array([0] * n_each + [1] * n_each + [2] * (n - 2 * n_each))
    idx = rng.permutation(len(X))
    return X[idx], external_labels[idx]


# ── Bài C3-7 — K-means: assign, update và repeat ─────────────────────────
def load_kmeans_lab(seed=0):
    """300 học sinh × 2 feature (activity_score, engagement_minutes) — 3 cụm Gauss
    tách khá rõ (globular — đúng giả định hình cầu của K-means). CỐ Ý để feature
    thứ 2 lệch thang đo ×20 lần so với feature thứ 1 — chưa scale sẽ cho inertia
    một con số KHỔNG LỒ, không đọc được, và có thể lệch centroid nếu chỉ chạy
    n_init=1 (dễ kẹt local minimum)."""
    rng = np.random.RandomState(8401 + seed)
    n = 300
    n_each = n // 3
    c0 = rng.normal([-3, -2], 0.9, size=(n_each, 2))
    c1 = rng.normal([0, 2], 0.9, size=(n_each, 2))
    c2 = rng.normal([3, -2], 0.9, size=(n - 2 * n_each, 2))
    X = np.vstack([c0, c1, c2])
    X[:, 1] = X[:, 1] * 20  # feature 2 lệch thang đo — buộc phải StandardScaler trước khi fit
    idx = rng.permutation(len(X))
    return X[idx]


def load_kmeans_crescent():
    """200 điểm hình 2 lưỡi liềm lồng nhau (non-globular) — K-means (giả định cụm
    hình cầu/lồi) THẤT BẠI rõ trên hình dạng này dù vẫn chạy ra số hợp lệ. Trả
    (X, true_shape_labels) — true_shape_labels chỉ dùng để MINH HOẠ thất bại,
    không phải nhãn để fit."""
    rng = np.random.RandomState(8501)
    n = 200
    n0 = n // 2
    t0 = rng.uniform(0, np.pi, n0)
    x0 = np.stack([np.cos(t0), np.sin(t0)], axis=1) + rng.normal(0, 0.08, (n0, 2))
    n1 = n - n0
    t1 = rng.uniform(0, np.pi, n1)
    x1 = np.stack([1 - np.cos(t1), 1 - np.sin(t1) - 0.5], axis=1) + rng.normal(0, 0.08, (n1, 2))
    X = np.vstack([x0, x1])
    true_shape_labels = np.array([0] * n0 + [1] * n1)
    return X, true_shape_labels


# ── Bài C3-8 — Chọn k và đánh giá một clustering ─────────────────────────
def load_k_selection_data(seed=0):
    """320 mẫu, 2 chiều. Seed CHẴN → 4 cụm Gauss tách RÕ (elbow + silhouette đồng
    thuận rõ ràng ở k=4). Seed LẺ → toạ độ NGẪU NHIÊN ĐỀU (không có cấu trúc cụm
    thật) — silhouette THẤP và GẦN NHƯ PHẲNG ở mọi k, trong khi stability (ARI
    giữa các seed) vẫn có thể cao giả tạo (KMeans luôn tìm ra 1 cách chia nào đó).
    Đây chính là minh hoạ THẬT cho misconception của bài: thuật toán có thể "tìm
    thấy" cụm ngay cả trên dữ liệu ngẫu nhiên — 1 k được chọn không chứng minh
    cụm tự nhiên tồn tại."""
    rng = np.random.RandomState(9101 + seed)
    n = 320
    if seed % 2 == 0:
        n_each = n // 4
        centers = [[-3, -3], [-3, 3], [3, 3], [3, -3]]
        parts = [rng.normal(c, 0.7, size=(n_each, 2)) for c in centers]
        X = np.vstack(parts)
    else:
        X = rng.uniform(-4, 4, size=(n, 2))
    idx = rng.permutation(len(X))
    return X[idx]


# ── Bài C3-9 — DBSCAN và hierarchical clustering ─────────────────────────
def load_shape_clustering_data(seed=0):
    """240 mẫu, 2 chiều. Seed CHẴN → 2 lưỡi liềm lồng nhau (non-globular — DBSCAN
    theo mật độ nhận diện ĐÚNG hình dạng, KMeans/complete-link cắt SAI qua 2 đầu
    lưỡi liềm dù silhouette của chúng lại CAO HƠN — đúng "metric guardrail" của
    bài: silhouette thiên vị cụm lồi/gọn, không phản ánh đúng hình dạng thật).
    Seed LẺ → 2 cụm Gauss tách rõ (globular — cả 3 thuật toán đều đồng thuận,
    dùng để kiểm tra 'lựa chọn thuật toán thích ứng theo cấu trúc dữ liệu ẩn')."""
    rng = np.random.RandomState(9301 + seed)
    n = 240
    if seed % 2 == 0:
        n0 = n // 2
        t0 = rng.uniform(0, np.pi, n0)
        x0 = np.stack([np.cos(t0), np.sin(t0)], axis=1) + rng.normal(0, 0.08, (n0, 2))
        n1 = n - n0
        t1 = rng.uniform(0, np.pi, n1)
        x1 = np.stack([1 - np.cos(t1), 1 - np.sin(t1) - 0.5], axis=1) + rng.normal(0, 0.08, (n1, 2))
        X = np.vstack([x0, x1])
    else:
        n0 = n // 2
        c0 = rng.normal([-2.5, -2.5], 0.6, size=(n0, 2))
        c1 = rng.normal([2.5, 2.5], 0.6, size=(n - n0, 2))
        X = np.vstack([c0, c1])
    idx = rng.permutation(len(X))
    return X[idx]


# ══════════════════════════════════════════════════════════════════════════
# MODULE 4 — NEURAL COMPUTATION
# ══════════════════════════════════════════════════════════════════════════

# ── Bài C3-10 — Perceptron: neuron có thể học đầu tiên ───────────────────
def load_perceptron_cases(seed=0):
    """Trả list 4 case (name, X, y) — KHÔNG dùng sklearn, chỉ NumPy thuần (đúng
    tinh thần Module 4: tự lập trình cơ chế neuron, không gọi thư viện model có
    sẵn). AND/OR: 4 điểm nhị phân {0,1}² — TÁCH ĐƯỢC tuyến tính, perceptron hội
    tụ. XOR: cũng 4 điểm nhị phân nhưng KHÔNG tách được tuyến tính — perceptron
    KHÔNG BAO GIỜ hội tụ (giới hạn năng lực model, không phải lỗi code).
    'separable': 2 cụm Gauss tách rõ trong không gian liên tục — hội tụ rất nhanh."""
    rng = np.random.RandomState(1001 + seed)
    X_and = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
    y_and = np.array([0, 0, 0, 1])
    X_or = X_and.copy()
    y_or = np.array([0, 1, 1, 1])
    X_xor = X_and.copy()
    y_xor = np.array([0, 1, 1, 0])
    n = 30
    c0 = rng.normal([-1.5, -1.5], 0.5, size=(n, 2))
    c1 = rng.normal([1.5, 1.5], 0.5, size=(n, 2))
    X_sep = np.vstack([c0, c1])
    y_sep = np.array([0] * n + [1] * n)
    idx = rng.permutation(len(X_sep))
    X_sep, y_sep = X_sep[idx], y_sep[idx]
    return [
        ('AND', X_and, y_and),
        ('OR', X_or, y_or),
        ('separable', X_sep, y_sep),
        ('XOR', X_xor, y_xor),
    ]


# ── Bài C3-11 — Activation functions and gradient flow ───────────────────
def load_activation_chain(seed=0):
    """Trả list 10 mảng preactivation (mỗi mảng shape (200,16)) — mô phỏng tín
    hiệu đi qua 10 lớp Dense KHÔNG chuẩn hoá (scale=1.6, không Xavier), sigmoid
    feed-forward giữa các lớp. KHÔNG cố tình ép sigmoid bão hoà cực trị — vanishing
    gradient hiện ra một cách THẬT qua việc TÍCH DỒN nhiều số <1 (mỗi sigmoid_grad
    mean ~0.18-0.23/lớp, nhân dồn 10 lớp → ~2e-7), trong khi ReLU (mỗi lớp ~50%
    'chết' vì không có bias) tích dồn chậm hơn nhiều (~0.5^10 ≈ 6e-4) — KHÁC BIỆT
    THẬT ~3000 lần ở depth=10, không phải số dựng sẵn."""
    rng = np.random.RandomState(2001 + seed)
    n, width, scale, n_layers = 200, 16, 1.6, 10
    a = rng.normal(0, 1.0, size=(n, width))
    chain = []
    for _ in range(n_layers):
        W = rng.normal(0, scale / np.sqrt(width), size=(width, width))
        z = a @ W
        chain.append(z)
        a = 1.0 / (1.0 + np.exp(-z))
    return chain


# ── Bài C3-12 — Feedforward through a neural network ─────────────────────
def load_forward_pass_case(seed=0):
    """Trả (X, params) — batch THẬT m=5 mẫu, n_in=3 feature, n_hidden=4. params =
    {W1(3,4), b1(4,), W2(4,1), b2(1,)} — kích thước TƯƠNG THÍCH đúng contract
    forward_two_layer chuẩn spec (Z1=X@W1+b1, A1=relu(Z1), Z2=A1@W2+b2,
    P=sigmoid(Z2)). Trọng số scale nhỏ (0.6/0.1) để A1 có cả zero (dead-ReLU thật,
    không giả lập) lẫn dương — khớp chủ đề Bài 11."""
    rng = np.random.RandomState(3001 + seed)
    m, n_in, n_hidden = 5, 3, 4
    X = rng.normal(0, 1.0, size=(m, n_in))
    W1 = rng.normal(0, 0.6, size=(n_in, n_hidden))
    b1 = rng.normal(0, 0.1, size=(n_hidden,))
    W2 = rng.normal(0, 0.6, size=(n_hidden, 1))
    b2 = rng.normal(0, 0.1, size=(1,))
    return X, {'W1': W1, 'b1': b1, 'W2': W2, 'b2': b2}


# ── Bài C3-13 — Backpropagation and gradient checking ─────────────────────
def load_backprop_case(seed=0):
    """Trả (y, probabilities, params, cache) — batch THẬT m=5, n_in=3, n_hidden=4
    (CÙNG kiến trúc Bài 12). probabilities/cache đến từ 1 forward pass THẬT
    (ReLU ẩn, sigmoid output) trên params/X đã sinh — cache hợp lệ, khớp đúng
    contract backward_two_layer chuẩn spec."""
    rng = np.random.RandomState(4001 + seed)
    m, n_in, n_hidden = 5, 3, 4
    X = rng.normal(0, 1.0, size=(m, n_in))
    W1 = rng.normal(0, 0.6, size=(n_in, n_hidden))
    b1 = rng.normal(0, 0.1, size=(n_hidden,))
    W2 = rng.normal(0, 0.6, size=(n_hidden, 1))
    b2 = rng.normal(0, 0.1, size=(1,))
    y = rng.randint(0, 2, size=(m,)).astype(float)
    Z1 = X @ W1 + b1
    A1 = np.maximum(0.0, Z1)
    Z2 = A1 @ W2 + b2
    P = (1.0 / (1.0 + np.exp(-Z2))).reshape(-1)
    params = {'W1': W1, 'b1': b1, 'W2': W2, 'b2': b2}
    cache = {'X': X, 'Z1': Z1, 'A1': A1, 'Z2': Z2}
    return y, P, params, cache


def _c3l13_forward_loss(params, X, y):
    Z1 = X @ params['W1'] + params['b1']
    A1 = np.maximum(0.0, Z1)
    Z2 = A1 @ params['W2'] + params['b2']
    P = (1.0 / (1.0 + np.exp(-Z2))).reshape(-1)
    eps = 1e-12
    return float(-np.mean(y * np.log(P + eps) + (1 - y) * np.log(1 - P + eps)))


def gradient_check(params, grads, y, X, epsilon=1e-5, n_check=3, seed=0):
    """Finite-difference gradient checking — với MỖI tham số (W1/b1/W2/b2),
    chọn ngẫu nhiên (seed cố định, tái lập được) n_check phần tử, nhiễu ±epsilon,
    tính lại loss BCE bằng forward pass THẬT, so central-difference numerical
    gradient với grads[tên] analytical — trả relative error LỚN NHẤT mỗi tham số."""
    rng = np.random.RandomState(5001 + seed)
    rel_errors = {}
    for name in params:
        arr = params[name]
        n_pick = min(n_check, arr.size)
        flat_idx = rng.choice(arr.size, size=n_pick, replace=False)
        errs = []
        for idx in flat_idx:
            orig = arr.flat[idx]
            arr.flat[idx] = orig + epsilon
            loss_plus = _c3l13_forward_loss(params, X, y)
            arr.flat[idx] = orig - epsilon
            loss_minus = _c3l13_forward_loss(params, X, y)
            arr.flat[idx] = orig
            numgrad = (loss_plus - loss_minus) / (2 * epsilon)
            anagrad = float(np.asarray(grads[name]).flat[idx])
            denom = max(abs(numgrad), abs(anagrad), 1e-8)
            errs.append(abs(numgrad - anagrad) / denom)
        rel_errors[name] = float(max(errs))
    return rel_errors


# ── Bài C3-14 — Train, evaluate and defend a neural network experiment ────
# QUYẾT ĐỊNH KIẾN TRÚC (user chốt 2026-08-02): Pyodide/WASM KHÔNG có PyTorch build
# sẵn, và app này KHÔNG có backend remote-sandbox để chạy code tuỳ ý phía server
# (rủi ro bảo mật + hạ tầng mới, ngoài phạm vi). Thay vì build sandbox mới, bài
# này dùng đường cong train/val THẬT từ 1 lần train PyTorch THẬT được chạy NGOÀI
# app (offline, venv scratch — KHÔNG phải giả lập/số dựng sẵn) — học viên tự lắp
# lại ĐÚNG thuật toán chọn checkpoint (early stopping) + tính metric trên số liệu
# THẬT này, thay vì tự chạy lại toàn bộ vòng lặp train (đòi hỏi torch).
# MLP nhị phân: nn.Sequential(Linear(8,hidden), ReLU, Linear(hidden,1)), Adam,
# BCEWithLogitsLoss, weight_decay theo từng candidate — dataset tabular nhị phân
# (sklearn make_classification, 260 mẫu, seed cố định), early stopping patience-based.
_C3L14_RUNS = {
    'A_underfit': {
        'hidden': 2, 'n_params': 21, 'patience': 8,
        'train_curve': [
            0.77, 0.7647, 0.7591, 0.755, 0.7501, 0.7463, 0.7421, 0.7383, 0.7349, 0.7323,
            0.7289, 0.7262, 0.7237, 0.7207, 0.7178, 0.716, 0.7135, 0.7114, 0.7098, 0.7077,
            0.706, 0.7039, 0.7019, 0.7005, 0.6984, 0.6968, 0.6948, 0.6931, 0.6912, 0.6901,
            0.6879, 0.6861, 0.6844, 0.6824, 0.6804, 0.6786, 0.6767, 0.6745, 0.6724, 0.6698,
            0.6676, 0.6652, 0.6626, 0.6599, 0.6569, 0.6545, 0.6518, 0.6487, 0.6462, 0.6428,
            0.6401, 0.6367, 0.6339, 0.6305, 0.6268, 0.6236, 0.62, 0.6165, 0.6129, 0.6097,
            0.6051, 0.6014, 0.5976, 0.5938, 0.5899, 0.5862, 0.5819, 0.5777, 0.5747, 0.5701,
            0.5659, 0.5624, 0.558, 0.5552, 0.5507, 0.5465, 0.5439, 0.5397, 0.5365, 0.5323,
        ],
        'val_curve': [
            0.7951, 0.789, 0.7828, 0.7775, 0.7721, 0.767, 0.7623, 0.7581, 0.7538, 0.7503,
            0.7468, 0.7431, 0.7399, 0.7367, 0.7335, 0.7305, 0.7277, 0.7252, 0.7224, 0.7201,
            0.7174, 0.7148, 0.7124, 0.7102, 0.7078, 0.7049, 0.7025, 0.6997, 0.6973, 0.6945,
            0.6917, 0.6889, 0.6857, 0.6834, 0.6801, 0.6769, 0.6738, 0.6709, 0.6674, 0.664,
            0.6608, 0.6575, 0.6543, 0.6508, 0.6471, 0.6434, 0.6395, 0.6356, 0.632, 0.6282,
            0.6242, 0.6198, 0.6155, 0.6116, 0.6073, 0.6034, 0.5988, 0.5949, 0.5908, 0.5866,
            0.5821, 0.578, 0.5738, 0.5694, 0.5658, 0.5614, 0.5571, 0.5528, 0.5486, 0.5446,
            0.541, 0.5369, 0.5333, 0.5294, 0.5259, 0.5219, 0.5181, 0.5143, 0.5109, 0.5073,
        ],
        'confusion': {'tp': 11, 'tn': 32, 'fp': 2, 'fn': 20},
    },
    'B_reference': {
        'hidden': 16, 'n_params': 161, 'patience': 8,
        'train_curve': [
            0.7134, 0.6882, 0.6672, 0.6454, 0.6279, 0.6094, 0.5927, 0.5779, 0.5634, 0.5499,
            0.5361, 0.5242, 0.5133, 0.5032, 0.4921, 0.4816, 0.4718, 0.4628, 0.454, 0.4455,
            0.4388, 0.4307, 0.4229, 0.4165, 0.4113, 0.4055, 0.3997, 0.3957, 0.3911, 0.3855,
            0.3826, 0.3789, 0.3763, 0.3715, 0.369, 0.3671, 0.3632, 0.3613, 0.3583, 0.3566,
            0.3551, 0.3517, 0.3507, 0.3492, 0.346, 0.344, 0.3431, 0.3414, 0.3407, 0.3385,
            0.3376, 0.337, 0.3329, 0.3334, 0.3304, 0.3297, 0.3293, 0.327, 0.3248, 0.3255,
            0.3231, 0.3218, 0.3191, 0.3185, 0.3182, 0.3159, 0.3156, 0.3135, 0.314, 0.3112,
            0.3119,
        ],
        'val_curve': [
            0.6675, 0.6513, 0.6355, 0.6218, 0.6088, 0.5967, 0.5856, 0.5743, 0.5636, 0.5531,
            0.5432, 0.5329, 0.5231, 0.5131, 0.5035, 0.4937, 0.4845, 0.4757, 0.4665, 0.4585,
            0.4507, 0.4432, 0.4362, 0.43, 0.4236, 0.4179, 0.4125, 0.4071, 0.4027, 0.3982,
            0.3939, 0.3901, 0.3865, 0.3834, 0.38, 0.3774, 0.375, 0.3725, 0.3703, 0.3684,
            0.366, 0.3645, 0.3628, 0.3618, 0.3606, 0.3594, 0.3586, 0.3574, 0.3566, 0.3559,
            0.3546, 0.3546, 0.3538, 0.3531, 0.3528, 0.3526, 0.3523, 0.3522, 0.3515, 0.351,
            0.3511, 0.3509, 0.3506, 0.3507, 0.351, 0.3512, 0.3508, 0.3513, 0.3513, 0.3522,
            0.3524,
        ],
        'confusion': {'tp': 24, 'tn': 29, 'fp': 5, 'fn': 7},
    },
    'C_overfit': {
        'hidden': 256, 'n_params': 2561, 'patience': 6,
        'train_curve': [
            0.6386, 0.4801, 0.4154, 0.3835, 0.3573, 0.3412, 0.3304, 0.3161, 0.303, 0.2919,
            0.2878, 0.2715, 0.2669, 0.2543, 0.2487, 0.2376,
        ],
        'val_curve': [
            0.5546, 0.4776, 0.4167, 0.3866, 0.3651, 0.3569, 0.3523, 0.3512, 0.3489, 0.3488,
            0.351, 0.3494, 0.3568, 0.3591, 0.3659, 0.3638,
        ],
        'confusion': {'tp': 24, 'tn': 29, 'fp': 5, 'fn': 7},
    },
    'C_no_earlystop': {
        'hidden': 256, 'n_params': 2561, 'patience': 9999,
        'train_curve': [
            0.6386, 0.4801, 0.4154, 0.3835, 0.3573, 0.3412, 0.3304, 0.3161, 0.303, 0.2919,
            0.2878, 0.2715, 0.2669, 0.2543, 0.2487, 0.2376, 0.2295, 0.2241, 0.2172, 0.2094,
            0.2064, 0.1958, 0.1897, 0.1848, 0.1793, 0.1737, 0.1697, 0.1643, 0.1607, 0.1558,
            0.1521, 0.1478, 0.146, 0.1416, 0.1372, 0.1325, 0.1314, 0.1268, 0.1239, 0.1199,
            0.1187, 0.1158, 0.1122, 0.1109, 0.1082, 0.1038, 0.1025, 0.1, 0.0982, 0.0963,
            0.0931, 0.0928, 0.0885, 0.0887, 0.0859, 0.0845, 0.0831, 0.081, 0.0779, 0.0783,
        ],
        'val_curve': [
            0.5546, 0.4776, 0.4167, 0.3866, 0.3651, 0.3569, 0.3523, 0.3512, 0.3489, 0.3488,
            0.351, 0.3494, 0.3568, 0.3591, 0.3659, 0.3638, 0.3659, 0.3709, 0.3736, 0.378,
            0.3881, 0.3895, 0.3915, 0.3967, 0.4027, 0.4025, 0.4067, 0.4082, 0.416, 0.4218,
            0.4201, 0.4227, 0.4239, 0.4237, 0.4328, 0.4373, 0.4357, 0.4279, 0.4375, 0.4443,
            0.4335, 0.4358, 0.4455, 0.4495, 0.4414, 0.4461, 0.4545, 0.4492, 0.4473, 0.4534,
            0.4454, 0.4539, 0.4475, 0.4451, 0.4523, 0.4644, 0.4614, 0.463, 0.4617, 0.4614,
        ],
        'confusion': {'tp': 24, 'tn': 29, 'fp': 5, 'fn': 7},
    },
}


def load_experiment_run(name='B_reference'):
    """Trả dict {train_curve, val_curve, patience, confusion, n_params, hidden} —
    số THẬT từ 1 lần train PyTorch THẬT (MLP nhị phân, Adam, BCEWithLogitsLoss)
    chạy NGOÀI app (offline). 4 candidate: A_underfit (hidden=2, quá ít tham số),
    B_reference (hidden=16, cấu hình chuẩn spec, early-stop đúng lúc), C_overfit
    (hidden=256, không weight_decay, early-stop CỨU được nhờ patience thấp),
    C_no_earlystop (CÙNG C_overfit nhưng patience=9999 — train_loss tụt xuống
    0.078 trong khi val_loss BẬT NGƯỢC từ 0.349 lên 0.461 — overfit thật)."""
    return copy.deepcopy(_C3L14_RUNS[name])

