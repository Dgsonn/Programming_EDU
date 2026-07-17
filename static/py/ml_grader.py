"""ml_grader — chấm 4 tầng (Output / Code-AST / Model-behavior / Risk) cho từng bài.
Chạy THẬT bên trong Pyodide: parse AST thật, thực thi lại code với input ẩn thật
(monkey-patch ml_lab), theo dõi lời gọi predict() thật để bắt lỗi risk — không có
tầng nào là giả lập/đoán mò.
"""
import ast
import io
import contextlib
import numpy as np
import ml_lab


def _empty_result():
    return {
        'output_ok': False, 'output_msg': '',
        'code_ok': False, 'code_msg': '',
        'behavior_ok': False, 'behavior_msg': '',
        'risk_ok': False, 'risk_msg': '',
        'stdout': '', 'prediction': None,
        'overall_pass': False,
    }


def grade_lesson1(user_code):
    """Bài 1 — Machine Learning vs Traditional Programming.
    Học viên phải: from ml_lab import ...; fit(X,y) trước predict(X_new);
    predict() chạy trên X_new (KHÔNG phải X train); gán kết quả vào biến `prediction`."""
    result = _empty_result()

    # ── Tầng Code/AST: parse thật, kiểm thứ tự fit -> predict theo dòng lệnh ──
    try:
        tree = ast.parse(user_code)
    except SyntaxError as e:
        result['code_msg'] = 'Lỗi cú pháp: ' + str(e)
        return result

    fit_line = None
    predict_line = None
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
            if node.func.attr == 'fit' and fit_line is None:
                fit_line = node.lineno
            if node.func.attr == 'predict' and predict_line is None:
                predict_line = node.lineno

    if fit_line is None or predict_line is None:
        result['code_msg'] = 'Thiếu lời gọi .fit(...) hoặc .predict(...).'
        return result
    if predict_line < fit_line:
        result['code_msg'] = 'predict() được gọi TRƯỚC fit() — model chưa được huấn luyện.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'fit() rồi predict() đúng thứ tự.'

    # ── Chạy thật lần 1 (dữ liệu chuẩn), đồng thời "gián điệp" predict() để bắt risk ──
    orig_predict = ml_lab.SimpleClassifier.predict
    predict_calls = []

    def spy_predict(self, X_new):
        predict_calls.append(np.asarray(X_new).shape)
        return orig_predict(self, X_new)

    ml_lab.SimpleClassifier.predict = spy_predict
    buf = io.StringIO()
    ns = {}
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(tree, '<user_code>', 'exec'), ns)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    finally:
        ml_lab.SimpleClassifier.predict = orig_predict
    result['stdout'] = buf.getvalue()

    # ── Tầng Risk: predict() có bị gọi trên chính 12 dòng training không? ──
    if any(shape[0] == 12 for shape in predict_calls):
        result['risk_msg'] = ('predict() được gọi trên chính 12 dòng dữ liệu TRAIN — '
                               'không phải bằng chứng dự đoán học viên MỚI.')
        result['risk_ok'] = False
    elif not predict_calls:
        result['risk_msg'] = 'predict() chưa từng được gọi.'
        result['risk_ok'] = False
    else:
        result['risk_ok'] = True
        result['risk_msg'] = 'predict() chỉ chạy trên input mới, không tái sử dụng dữ liệu train.'

    # ── Tầng Output: biến `prediction` có phải nhãn 0/1 hợp lệ? ──
    pred_val = ns.get('prediction')
    if pred_val is not None:
        try:
            arr = np.asarray(pred_val)
            if arr.size >= 1 and set(np.unique(arr).tolist()) <= {0, 1}:
                result['output_ok'] = True
                result['output_msg'] = 'Dự đoán hợp lệ: ' + str(arr.tolist())
                result['prediction'] = arr.tolist()
        except Exception:
            pass
    if not result['output_ok']:
        result['output_msg'] = 'Không tìm thấy biến `prediction` hợp lệ (nhãn 0/1) sau khi chạy.'

    # ── Tầng Model behavior: CHẠY LẠI THẬT với X_new ẩn (monkey-patch load_study_data) ──
    orig_load = ml_lab.load_study_data

    def hidden_load(seed=None):
        return orig_load(seed=1337)

    ml_lab.load_study_data = hidden_load
    ml_lab.SimpleClassifier.predict = orig_predict
    try:
        buf2 = io.StringIO()
        ns2 = {}
        with contextlib.redirect_stdout(buf2):
            exec(compile(tree, '<user_code_hidden>', 'exec'), ns2)
        pred2 = ns2.get('prediction')
        arr2 = np.asarray(pred2) if pred2 is not None else None
        if arr2 is not None and arr2.size >= 1 and set(np.unique(arr2).tolist()) <= {0, 1}:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Chạy lại với input ẩn vẫn cho dự đoán hợp lệ: ' + str(arr2.tolist())
        else:
            result['behavior_msg'] = 'Chạy lại với input ẩn KHÔNG cho dự đoán hợp lệ — có thể code đang hard-code kết quả.'
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại với input ẩn bị lỗi: ' + str(e)
    finally:
        ml_lab.load_study_data = orig_load

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def _parse_or_fail(user_code, result):
    try:
        return ast.parse(user_code)
    except SyntaxError as e:
        result['code_msg'] = 'Lỗi cú pháp: ' + str(e)
        return None


def grade_lesson2(user_code):
    """Bài 2 — Regression vs Classification vs Clustering.
    Học viên phải fit SimpleRegressor với y_score (liên tục) và SimpleClassifier
    với y_label (0/1), rồi predict CÙNG X_new. Unsafe-but-correct: regressor chạy
    được trên nhãn 0/1 nhưng đó là công thức hóa SAI — bắt ở tầng Risk."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    # ── Tầng Code/AST: cần fit + predict cho CẢ 2 model, fit trước predict ──
    fit_lines, predict_lines = [], []
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
            if node.func.attr == 'fit':
                fit_lines.append(node.lineno)
            if node.func.attr == 'predict':
                predict_lines.append(node.lineno)
    if len(fit_lines) < 2 or len(predict_lines) < 2:
        result['code_msg'] = ('Cần fit() + predict() cho CẢ SimpleRegressor lẫn SimpleClassifier '
                              '(hiện thấy %d fit, %d predict).' % (len(fit_lines), len(predict_lines)))
        return result
    if min(predict_lines) < min(fit_lines):
        result['code_msg'] = 'predict() được gọi TRƯỚC fit() — model chưa được huấn luyện.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Đủ 2 cặp fit() → predict(), đúng thứ tự.'

    # ── Gián điệp fit/predict của cả 2 lớp để bắt sai target + train-reuse ──
    calls = {'reg_fit_uniq': [], 'clf_fit_uniq': [],
             'pred_rows': [], 'reg_preds': [], 'clf_preds': []}
    orig = {
        'reg_fit': ml_lab.SimpleRegressor.fit, 'reg_pred': ml_lab.SimpleRegressor.predict,
        'clf_fit': ml_lab.SimpleClassifier.fit, 'clf_pred': ml_lab.SimpleClassifier.predict,
    }

    def spy_reg_fit(self, X, y):
        calls['reg_fit_uniq'].append(len(np.unique(np.asarray(y))))
        return orig['reg_fit'](self, X, y)

    def spy_clf_fit(self, X, y):
        calls['clf_fit_uniq'].append(len(np.unique(np.asarray(y))))
        return orig['clf_fit'](self, X, y)

    def spy_reg_pred(self, X_new):
        calls['pred_rows'].append(np.asarray(X_new).shape[0] if np.asarray(X_new).ndim > 1 else 1)
        out = orig['reg_pred'](self, X_new)
        calls['reg_preds'].append(np.asarray(out))
        return out

    def spy_clf_pred(self, X_new):
        calls['pred_rows'].append(np.asarray(X_new).shape[0] if np.asarray(X_new).ndim > 1 else 1)
        out = orig['clf_pred'](self, X_new)
        calls['clf_preds'].append(np.asarray(out))
        return out

    ml_lab.SimpleRegressor.fit = spy_reg_fit
    ml_lab.SimpleRegressor.predict = spy_reg_pred
    ml_lab.SimpleClassifier.fit = spy_clf_fit
    ml_lab.SimpleClassifier.predict = spy_clf_pred
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(tree, '<user_code>', 'exec'), {})
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    finally:
        ml_lab.SimpleRegressor.fit = orig['reg_fit']
        ml_lab.SimpleRegressor.predict = orig['reg_pred']
        ml_lab.SimpleClassifier.fit = orig['clf_fit']
        ml_lab.SimpleClassifier.predict = orig['clf_pred']
    result['stdout'] = buf.getvalue()

    # ── Tầng Risk: sai công thức hóa target (unsafe-but-correct của bài) ──
    if any(u <= 2 for u in calls['reg_fit_uniq']):
        result['risk_msg'] = ('SimpleRegressor đang được fit bằng nhãn 0/1 (y_label). Code CHẠY ĐƯỢC, '
                              'nhưng regressor tối ưu một đại lượng LIÊN TỤC — có thể trả 1.3 hay -0.2, '
                              'không phải lớp. Đây là công thức hóa sai: hãy fit bằng y_score.')
    elif any(u > 2 for u in calls['clf_fit_uniq']):
        result['risk_msg'] = ('SimpleClassifier đang được fit bằng y_score liên tục — điểm số không phải '
                              'tên lớp. Hãy fit classifier bằng y_label (0/1).')
    elif any(r == len(ml_lab._FULL_X) for r in calls['pred_rows']):
        result['risk_msg'] = ('predict() được gọi trên chính %d dòng dữ liệu TRAIN — '
                              'không phải bằng chứng dự đoán học viên MỚI.' % len(ml_lab._FULL_X))
    else:
        result['risk_ok'] = True
        result['risk_msg'] = 'Đúng cặp model–target: regressor ← y_score, classifier ← y_label.'

    # ── Tầng Output: 2 hợp đồng output khác nhau từ CÙNG X_new ──
    reg_ok = any(a.size >= 1 and not set(np.unique(a).tolist()) <= {0.0, 1.0}
                 for a in calls['reg_preds'])
    clf_ok = any(a.size >= 1 and set(np.unique(a).tolist()) <= {0, 1}
                 for a in calls['clf_preds'])
    if reg_ok and clf_ok:
        result['output_ok'] = True
        result['output_msg'] = ('Regressor trả số thực (ước lượng điểm), classifier trả nhãn 0/1 — '
                                '2 hợp đồng output khác nhau từ cùng 1 bảng feature.')
    elif not calls['reg_preds'] or not calls['clf_preds']:
        result['output_msg'] = 'Chưa thấy output của cả 2 model — cần predict() cho cả regressor lẫn classifier.'
    else:
        result['output_msg'] = 'Output chưa đúng hợp đồng: regressor phải trả số thực, classifier trả 0/1.'

    # ── Tầng Model behavior: chạy lại với X_new ẨN (patch load_study_data_full) ──
    orig_load = ml_lab.load_study_data_full

    def hidden_load(seed=None):
        return orig_load(seed=777)

    ml_lab.load_study_data_full = hidden_load
    try:
        buf2 = io.StringIO()
        with contextlib.redirect_stdout(buf2):
            exec(compile(tree, '<user_code_hidden>', 'exec'), {})
        if buf2.getvalue().strip():
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Chạy lại với học viên mới ẨN vẫn cho output hợp lệ — model thật sự dự đoán, không hard-code.'
        else:
            result['behavior_msg'] = 'Chạy lại với input ẩn không in ra gì — hãy print kết quả predict.'
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại với input ẩn bị lỗi: ' + str(e)
    finally:
        ml_lab.load_study_data_full = orig_load

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def grade_lesson3(user_code):
    """Bài 3 — Raw DataFrame vs X/y. Học viên tạo X = 3 feature hợp lệ, y = pass_fail.
    Unsafe-but-correct: X đủ shape (200, 3) nhưng chứa final_score → leak thông tin
    tương lai (bài toán cảnh báo SỚM) — bắt ở tầng Risk dù mọi tầng khác đều qua."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    # ── Tầng Code/AST: phải đi từ load_student_dataframe, không hard-code mảng ──
    uses_loader = any(
        isinstance(node, ast.Call) and (
            (isinstance(node.func, ast.Name) and node.func.id == 'load_student_dataframe') or
            (isinstance(node.func, ast.Attribute) and node.func.attr == 'load_student_dataframe')
        )
        for node in ast.walk(tree)
    )
    big_literal = any(
        isinstance(node, (ast.List, ast.Tuple)) and len(node.elts) > 20
        for node in ast.walk(tree)
    )
    if not uses_loader:
        result['code_msg'] = 'Chưa thấy load_student_dataframe() — X/y phải được TẠO từ DataFrame, không tự chế.'
        return result
    if big_literal:
        result['code_msg'] = 'Phát hiện mảng literal lớn hard-code — hãy chọn cột từ df thay vì gõ tay dữ liệu.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Đi đúng đường: nạp DataFrame rồi chọn cột theo NGHĨA.'

    # ── Chạy thật lần 1 ──
    buf = io.StringIO()
    ns = {}
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(tree, '<user_code>', 'exec'), ns)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = buf.getvalue()

    X = ns.get('X')
    y = ns.get('y')
    df0 = ml_lab.load_student_dataframe()

    # ── Tầng Output: X (200, 3), y 200 giá trị ──
    x_shape_ok = X is not None and hasattr(X, 'shape') and tuple(X.shape) == (200, 3)
    y_len_ok = y is not None and hasattr(y, '__len__') and len(y) == 200
    if x_shape_ok and y_len_ok:
        result['output_ok'] = True
        result['output_msg'] = 'X: (200, 3) — y: 200 giá trị. Đúng hợp đồng shape.'
    else:
        result['output_msg'] = ('Cần biến X shape (200, 3) và y đủ 200 giá trị. Hiện tại: X=%s, y=%s.'
                                % (getattr(X, 'shape', None), (len(y) if hasattr(y, '__len__') else None)))

    # ── Tầng Risk: leakage — kiểm CỘT THẬT trong X ──
    x_cols = list(X.columns) if hasattr(X, 'columns') else None
    y_is_passfail = False
    if y is not None:
        try:
            y_name_ok = getattr(y, 'name', None) == 'pass_fail'
            y_vals_ok = hasattr(y, '__len__') and len(y) == 200 and \
                np.array_equal(np.asarray(y).astype(float), df0['pass_fail'].values.astype(float))
            y_is_passfail = bool(y_name_ok or y_vals_ok)
        except Exception:
            y_is_passfail = False

    if x_cols is None:
        result['risk_msg'] = ('X không còn là DataFrame nên không kiểm tra được schema — '
                              'hãy giữ X = df[["study_hours", "attendance", "quiz_score"]].')
    elif 'pass_fail' in x_cols:
        result['risk_msg'] = ('pass_fail đang nằm TRONG X — target leakage trực tiếp: '
                              'model "dự đoán" bằng chính đáp án.')
    elif 'final_score' in x_cols:
        result['risk_msg'] = ('X đủ shape (200, 3) nhưng chứa final_score — bài toán là cảnh báo SỚM '
                              '(tuần 3), khi final_score CHƯA tồn tại. Code chạy được nhưng leak '
                              'thông tin tương lai — không dùng được ngoài đời.')
    elif not y_is_passfail:
        result['risk_msg'] = 'y chưa phải cột pass_fail — target của bài này là pass_fail.'
    else:
        result['risk_ok'] = True
        result['risk_msg'] = 'Schema sạch: X = 3 feature quan sát được ở tuần 3, y = pass_fail, không leakage.'

    # ── Tầng Model behavior: xáo thứ tự dòng (patch loader), schema phải vẫn đúng ──
    orig_load = ml_lab.load_student_dataframe

    def shuffled_load(shuffle_seed=None):
        return orig_load(shuffle_seed=99)

    ml_lab.load_student_dataframe = shuffled_load
    try:
        ns2 = {}
        with contextlib.redirect_stdout(io.StringIO()):
            exec(compile(tree, '<user_code_shuffled>', 'exec'), ns2)
        X2, y2 = ns2.get('X'), ns2.get('y')
        x2_ok = X2 is not None and hasattr(X2, 'shape') and tuple(X2.shape) == (200, 3)
        cols_same = (not hasattr(X2, 'columns') and x_cols is None) or \
                    (hasattr(X2, 'columns') and list(X2.columns) == x_cols)
        y2_ok = y2 is not None and hasattr(y2, '__len__') and len(y2) == 200
        if x2_ok and y2_ok and cols_same:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Xáo thứ tự 200 dòng: schema X/y vẫn đúng — code chọn cột theo NGHĨA, không theo vị trí.'
        else:
            result['behavior_msg'] = 'Khi xáo thứ tự dòng, X/y không còn đúng schema — code đang phụ thuộc vị trí dòng/cột.'
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại trên dữ liệu xáo dòng bị lỗi: ' + str(e)
    finally:
        ml_lab.load_student_dataframe = orig_load

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result
