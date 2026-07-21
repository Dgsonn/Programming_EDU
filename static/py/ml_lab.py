"""ml_lab — thư viện mô phỏng cho khóa Machine Learning (PE Web).
Nạp vào Pyodide virtual FS lúc worker khởi tạo; học viên `from ml_lab import ...`
đúng như trong spec. Mỗi bài mở rộng file này bằng dataset + wrapper riêng.
"""
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
    (study_hours 0-10, attendance_rate 0-100, activity_count 0-2000) + ID,
    category và target — để bài học 'đơn vị to át tiếng' và StandardScaler."""
    rng = np.random.RandomState(variant if variant is not None else 1601)
    n = 200
    study_hours = np.round(rng.uniform(0.5, 10.0, n), 1)
    attendance_rate = np.round(rng.uniform(40, 100, n), 0)
    activity_count = np.round(rng.uniform(0, 2000, n), 0)
    major = np.array(['ICT', 'DS', 'Space'])[rng.randint(0, 3, n)]
    pass_fail = ((5.0 * study_hours + 0.3 * attendance_rate + rng.normal(0, 8, n)) >= 55).astype(int)
    return pd.DataFrame({
        'student_id': np.arange(20520001, 20520001 + n),
        'study_hours': study_hours,
        'attendance_rate': attendance_rate,
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
