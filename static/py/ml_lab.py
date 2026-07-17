"""ml_lab — thư viện mô phỏng cho khóa Machine Learning (PE Web).
Nạp vào Pyodide virtual FS lúc worker khởi tạo; học viên `from ml_lab import ...`
đúng như trong spec. Mỗi bài mở rộng file này bằng dataset + wrapper riêng.
"""
import numpy as np
import pandas as pd

# ── Bài 1 — Machine Learning vs Traditional Programming ─────────────────────
# Dataset: 12 học viên, 3 feature (study_hours, attendance, quiz_score), target pass_fail.
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
    """Trả về DataFrame 200 dòng × 5 cột: study_hours, attendance, quiz_score,
    final_score, pass_fail. Sinh tất định (seed cố định) — mọi học viên thấy cùng dữ liệu.
    shuffle_seed (grader dùng): xáo thứ tự dòng để kiểm schema không phụ thuộc vị trí."""
    rng = np.random.RandomState(4242)
    n = 200
    study_hours = np.round(rng.uniform(0.5, 10.0, n), 1)
    attendance = np.round(rng.uniform(40, 100, n), 0)
    quiz_score = np.round(np.clip(6.5 * study_hours + rng.normal(0, 12, n) + 18, 0, 100), 0)
    final_score = np.round(np.clip(
        4.5 * study_hours + 0.25 * attendance + 0.35 * quiz_score + rng.normal(0, 6, n),
        0, 100), 0)
    pass_fail = (final_score >= 50).astype(int)
    df = pd.DataFrame({
        'study_hours': study_hours,
        'attendance': attendance,
        'quiz_score': quiz_score,
        'final_score': final_score,
        'pass_fail': pass_fail,
    })
    if shuffle_seed is not None:
        df = df.sample(frac=1.0, random_state=shuffle_seed).reset_index(drop=True)
    return df
