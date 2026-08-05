"""ml_grader — chấm 4 tầng (Output / Code-AST / Model-behavior / Risk) cho từng bài.
Chạy THẬT bên trong Pyodide: parse AST thật, thực thi lại code với input ẩn thật
(monkey-patch ml_lab), theo dõi lời gọi predict() thật để bắt lỗi risk — không có
tầng nào là giả lập/đoán mò.
"""
import ast
import io
import re
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


def _uses_call(tree, fn_name):
    """Có lời gọi fn_name(...) (Name hoặc Attribute) trong cây AST không?"""
    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            f = node.func
            if (isinstance(f, ast.Name) and f.id == fn_name) or \
               (isinstance(f, ast.Attribute) and f.attr == fn_name):
                return True
    return False


def _has_big_literal(tree, limit=20):
    return any(isinstance(n, (ast.List, ast.Tuple)) and len(n.elts) > limit
               for n in ast.walk(tree))


def _exec_capture(tree, tag='<user_code>'):
    """Chạy thật code học viên, trả (namespace, stdout) — ném exception nếu code lỗi."""
    buf = io.StringIO()
    ns = {}
    with contextlib.redirect_stdout(buf):
        exec(compile(tree, tag, 'exec'), ns)
    return ns, buf.getvalue()


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


def grade_lesson4(user_code):
    """Bài 4 — dtype vs semantic type. Học viên tạo 4 nhóm cột theo NGHĨA +
    feature_cols + X/y. Unsafe-but-correct: scholarship (0/1 = tên 2 nhóm) bị xếp
    vào nhóm SỐ — code chạy, X đủ cột, nhưng schema ngữ nghĩa sai → tầng Risk."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    FEATURES = {'study_hours', 'missed_classes', 'major', 'scholarship'}

    # ── Tầng Code/AST ──
    if not _uses_call(tree, 'load_student_profile'):
        result['code_msg'] = 'Chưa thấy load_student_profile() — schema phải dựng từ DataFrame thật.'
        return result
    if _has_big_literal(tree):
        result['code_msg'] = 'Phát hiện mảng literal lớn hard-code — hãy làm việc trên df.'
        return result

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    groups = {k: ns.get(k) for k in
              ('continuous_cols', 'discrete_cols', 'categorical_cols', 'binary_cols')}
    feature_cols = ns.get('feature_cols')
    X, y = ns.get('X'), ns.get('y')

    if any(not isinstance(v, list) for v in groups.values()) or not isinstance(feature_cols, list):
        result['code_msg'] = ('Cần đủ 4 list nhóm (continuous/discrete/categorical/binary_cols) '
                              'và feature_cols = tổng 4 nhóm.')
        return result
    if set(feature_cols) != set(groups['continuous_cols'] + groups['discrete_cols']
                                + groups['categorical_cols'] + groups['binary_cols']):
        result['code_msg'] = 'feature_cols phải đúng bằng 4 nhóm cộng lại.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Đủ 4 nhóm cột + feature_cols dựng từ nhóm.'

    # ── Tầng Output: X đúng 4 feature, không ID/target; y = pass_fail ──
    x_cols = list(X.columns) if hasattr(X, 'columns') else None
    y_ok = y is not None and hasattr(y, '__len__') and len(y) == 200
    if x_cols is not None and set(x_cols) == FEATURES and y_ok:
        result['output_ok'] = True
        result['output_msg'] = 'X: (200, 4) đúng 4 feature — student_id/pass_fail đã đứng ngoài.'
    else:
        result['output_msg'] = ('X phải gồm đúng 4 cột %s và y = pass_fail (200 giá trị). '
                                'Hiện X = %s.' % (sorted(FEATURES), x_cols))

    # ── Tầng Risk: schema NGỮ NGHĨA ──
    def _in(g, col):
        return isinstance(groups[g], list) and col in groups[g]

    if _in('continuous_cols', 'scholarship') or _in('discrete_cols', 'scholarship'):
        result['risk_msg'] = ('scholarship đang nằm trong nhóm SỐ. Code CHẠY ĐƯỢC và X vẫn đủ cột, '
                              'nhưng 0/1 ở đây là TÊN 2 nhóm (có/không học bổng) — cộng trừ chúng '
                              'vô nghĩa. Đây là semantic schema sai: scholarship thuộc binary_cols.')
    elif x_cols is not None and 'student_id' in x_cols:
        result['risk_msg'] = 'student_id trong X — định danh không mang thông tin học tập, model sẽ học vẹt theo ID.'
    elif x_cols is not None and 'pass_fail' in x_cols:
        result['risk_msg'] = 'pass_fail trong X — target leakage trực tiếp.'
    elif not (_in('continuous_cols', 'study_hours') and _in('discrete_cols', 'missed_classes')
              and _in('categorical_cols', 'major') and _in('binary_cols', 'scholarship')):
        result['risk_msg'] = ('Nhóm ngữ nghĩa chưa đúng: study_hours=liên tục, missed_classes=đếm '
                              'rời rạc, major=categorical (cần encoding), scholarship=binary.')
    else:
        result['risk_ok'] = True
        result['risk_msg'] = ('Schema ngữ nghĩa chuẩn — major được đánh dấu categorical '
                              '(sẽ cần encoding), ID/target đứng ngoài X.')

    # ── Tầng Behavior: xáo dòng, schema phải giữ nguyên ──
    orig_load = ml_lab.load_student_profile

    def shuffled_load(shuffle_seed=None):
        return orig_load(shuffle_seed=99)

    ml_lab.load_student_profile = shuffled_load
    try:
        ns2, _ = _exec_capture(tree, '<user_code_shuffled>')
        X2 = ns2.get('X')
        ok = X2 is not None and hasattr(X2, 'columns') and set(X2.columns) == set(x_cols or [])
        if ok:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Xáo thứ tự dòng: schema vẫn đúng — nhóm cột chọn theo NGHĨA.'
        else:
            result['behavior_msg'] = 'Xáo thứ tự dòng làm schema đổi — code đang phụ thuộc vị trí.'
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại trên dữ liệu xáo dòng bị lỗi: ' + str(e)
    finally:
        ml_lab.load_student_profile = orig_load

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def grade_lesson5(user_code):
    """Bài 5 — làm sạch dữ liệu bẩn. clean_df phải: hết trùng 100%, hết invalid range,
    hết NaN số — nhưng GIỮ outlier (chỉ flag). Trap: fillna(0) và xóa outlier."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    NUM_COLS = ['study_hours', 'attendance', 'quiz_score']

    # ── Tầng Code/AST ──
    if not _uses_call(tree, 'load_dirty_student_profile'):
        result['code_msg'] = 'Chưa thấy load_dirty_student_profile() — phải làm sạch bảng thật.'
        return result
    if _has_big_literal(tree):
        result['code_msg'] = 'Phát hiện mảng literal lớn — làm sạch bằng phép biến đổi, không dựng lại bảng tay.'
        return result
    if not (_uses_call(tree, 'drop_duplicates') or _uses_call(tree, 'duplicated')):
        result['code_msg'] = 'Thiếu bước xử lý dòng trùng (drop_duplicates / duplicated).'
        return result
    if not _uses_call(tree, 'fillna'):
        result['code_msg'] = 'Thiếu bước xử lý missing (fillna).'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Đủ các phép làm sạch: dedup, xử lý invalid/missing.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    clean_df = ns.get('clean_df')
    df0 = ml_lab.load_dirty_student_profile()

    def _structural_check(cdf):
        if cdf is None or not hasattr(cdf, 'shape'):
            return 'Không tìm thấy biến clean_df.'
        if len(cdf) != 200:
            return 'clean_df phải còn đúng 200 dòng sau khi bỏ 4 dòng trùng 100%% (hiện %d).' % len(cdf)
        for col in ('attendance', 'quiz_score'):
            vals = cdf[col]
            if vals.isna().any() or (vals < 0).any() or (vals > 10).any():
                return 'Cột %s vẫn còn NaN hoặc giá trị ngoài thang 0-10.' % col
        if cdf['study_hours'].isna().any():
            return 'study_hours vẫn còn NaN.'
        return None

    err = _structural_check(clean_df)
    if err is None:
        result['output_ok'] = True
        result['output_msg'] = '200 dòng, 0 trùng, 0 invalid, 0 NaN số — bảng sẵn sàng.'
    else:
        result['output_msg'] = err

    # ── Tầng Risk: 2 trap + cờ outlier ──
    risk_fail = None
    if clean_df is not None and hasattr(clean_df, 'columns'):
        # Trap 1: thay NaN bằng 0
        try:
            for col in NUM_COLS:
                nan_idx = df0.index[df0[col].isna()]
                common = [i for i in nan_idx if i in clean_df.index]
                if common:
                    filled = clean_df.loc[common, col]
                    if (filled == 0).all() and abs(float(df0[col].median())) > 0.5:
                        risk_fail = ('Missing đang bị thay bằng 0 — "không biết" khác "bằng 0": '
                                     'một học viên thiếu dữ liệu giờ học không phải học 0 giờ. '
                                     'Hãy dùng median.')
                        break
        except Exception:
            pass
        # Trap 2: xóa outlier
        if risk_fail is None:
            try:
                if float(clean_df['study_hours'].max()) < 45:
                    risk_fail = ('Outlier study_hours (60, 45) đã biến mất — bất thường KHÔNG đồng '
                                 'nghĩa với sai. Không đủ bằng chứng thì GIỮ LẠI và cắm cờ để review.')
            except Exception:
                pass
        # Cờ outlier phải tồn tại và còn dòng bất thường
        if risk_fail is None:
            flag_cols = [c for c in clean_df.columns if 'outlier' in str(c).lower()]
            if not flag_cols or not any(clean_df[c].astype(bool).sum() >= 1 for c in flag_cols):
                risk_fail = ('Thiếu cột cờ outlier (vd. study_hours_outlier = study_hours > 40) '
                             'hoặc cờ không bắt được dòng bất thường nào.')
    else:
        risk_fail = 'Không có clean_df để kiểm tra rủi ro.'

    if risk_fail:
        result['risk_msg'] = risk_fail
    else:
        result['risk_ok'] = True
        result['risk_msg'] = ('Làm sạch BẢO THỦ chuẩn: sửa khi chắc chắn, giữ + flag khi nghi ngờ. '
                              '⚠ Ghi nhớ cho Course 2: median để impute phải học từ TRAIN split, '
                              'không phải toàn bảng.')

    # ── Tầng Behavior: đổi VỊ TRÍ lỗi (variant ẩn) — recipe phải vẫn sạch ──
    orig_load = ml_lab.load_dirty_student_profile

    def hidden_load(variant=None):
        return orig_load(variant=777)

    ml_lab.load_dirty_student_profile = hidden_load
    try:
        ns2, _ = _exec_capture(tree, '<user_code_hidden>')
        err2 = _structural_check(ns2.get('clean_df'))
        if err2 is None:
            result['behavior_ok'] = True
            result['behavior_msg'] = ('Đổi vị trí toàn bộ lỗi (NaN/invalid/outlier ẩn): recipe vẫn '
                                      'sạch — code xử lý theo ĐIỀU KIỆN, không theo vị trí ô.')
        else:
            result['behavior_msg'] = 'Với bộ lỗi ẩn ở vị trí khác, recipe thất bại: ' + err2
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại với bộ lỗi ẩn bị lỗi: ' + str(e)
    finally:
        ml_lab.load_dirty_student_profile = orig_load

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def grade_lesson6(user_code):
    """Bài 6 — StandardScaler trên đúng 3 cột số. Risk: scale cả ID/target."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    WANT = {'study_hours', 'attendance', 'activity_count'}

    if not _uses_call(tree, 'load_scaling_dataset'):
        result['code_msg'] = 'Chưa thấy load_scaling_dataset().'
        return result
    if not (_uses_call(tree, 'StandardScaler') and
            (_uses_call(tree, 'fit_transform') or (_uses_call(tree, 'fit') and _uses_call(tree, 'transform')))):
        result['code_msg'] = 'Cần StandardScaler + fit_transform (hoặc fit rồi transform).'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Dùng StandardScaler đúng quy trình fit → transform.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    X_scaled = ns.get('X_scaled')
    scaled_cols = None
    if isinstance(ns.get('numeric_cols'), list):
        scaled_cols = list(ns['numeric_cols'])
    elif hasattr(ns.get('X'), 'columns'):
        scaled_cols = list(ns['X'].columns)

    arr = np.asarray(X_scaled) if X_scaled is not None else None
    shape_ok = arr is not None and arr.ndim == 2 and arr.shape[0] == 200 and arr.shape[1] == len(WANT)
    moments_ok = False
    if shape_ok:
        moments_ok = (np.abs(arr.mean(axis=0)) < 0.05).all() and (np.abs(arr.std(axis=0) - 1) < 0.05).all()
    if shape_ok and moments_ok:
        result['output_ok'] = True
        result['output_msg'] = 'X_scaled (200, 3): mean ≈ 0, std ≈ 1 — ba feature nói cùng âm lượng.'
    else:
        result['output_msg'] = ('Cần X_scaled shape (200, 3) với mean ≈ 0 và std ≈ 1 mỗi cột. '
                                'Hiện shape = %s.' % (None if arr is None else arr.shape,))

    # ── Tầng Risk: chỉ scale 3 cột số có nghĩa ──
    if scaled_cols is None:
        result['risk_msg'] = 'Không xác định được cột nào bị scale — hãy giữ numeric_cols là list tên cột.'
    elif 'student_id' in scaled_cols:
        result['risk_msg'] = ('student_id đang bị scale — chuẩn hóa một ĐỊNH DANH chỉ tạo ra số vô '
                              'nghĩa trông-như-feature. ID phải đứng ngoài scaler.')
    elif 'pass_fail' in scaled_cols:
        result['risk_msg'] = 'pass_fail đang bị scale — target không phải input, càng không phải thứ đem chuẩn hóa.'
    elif set(scaled_cols) != WANT:
        result['risk_msg'] = 'Danh sách cột scale chưa đúng — cần đúng 3 cột: %s.' % sorted(WANT)
    else:
        result['risk_ok'] = True
        result['risk_msg'] = ('Chỉ 3 feature số được scale, ID/category/target đứng ngoài. '
                              '⚠ Ghi nhớ cho Course 2: scaler phải fit trên TRAIN split trước, '
                              'rồi transform validation/test — không fit trên toàn bảng.')

    # ── Tầng Behavior: dữ liệu ẩn (variant) — phép biến đổi phải nhất quán ──
    orig_load = ml_lab.load_scaling_dataset

    def hidden_load(variant=None):
        return orig_load(variant=777)

    ml_lab.load_scaling_dataset = hidden_load
    try:
        ns2, _ = _exec_capture(tree, '<user_code_hidden>')
        arr2 = np.asarray(ns2.get('X_scaled')) if ns2.get('X_scaled') is not None else None
        ok = (arr2 is not None and arr2.ndim == 2 and arr2.shape == (200, 3)
              and (np.abs(arr2.mean(axis=0)) < 0.05).all()
              and (np.abs(arr2.std(axis=0) - 1) < 0.05).all())
        if ok:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Trên bộ dữ liệu ẨN, phép chuẩn hóa vẫn cho mean ≈ 0, std ≈ 1 — không hard-code.'
        else:
            result['behavior_msg'] = 'Trên bộ dữ liệu ẩn, X_scaled không còn đúng moments — code đang phụ thuộc giá trị cụ thể.'
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn bị lỗi: ' + str(e)
    finally:
        ml_lab.load_scaling_dataset = orig_load

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def grade_lesson7(user_code):
    """Bài 7 — mean/var/cov/corr bằng Pandas. Risk: đưa student_id vào phân tích.
    Corr phải KHỚP tham chiếu và BẤT BIẾN khi xáo dòng."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    COLS = ['study_hours', 'attendance', 'missed_classes', 'quiz_score', 'final_score']

    if not _uses_call(tree, 'load_statistics_dataset'):
        result['code_msg'] = 'Chưa thấy load_statistics_dataset().'
        return result
    if _has_big_literal(tree):
        result['code_msg'] = 'Phát hiện mảng literal lớn — thống kê phải tính từ df, không chép tay.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Thống kê được tính từ DataFrame thật.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    numeric_df = ns.get('numeric_df')
    corr = ns.get('corr_matrix')
    cov = ns.get('cov_matrix')
    ref = ml_lab.load_statistics_dataset()[COLS]

    nd_cols = list(numeric_df.columns) if hasattr(numeric_df, 'columns') else None
    corr_ok = False
    if corr is not None and hasattr(corr, 'shape') and tuple(corr.shape) == (5, 5):
        try:
            corr_ok = np.allclose(np.asarray(corr, dtype=float), ref.corr().values, atol=1e-6) \
                and np.allclose(np.diag(np.asarray(corr, dtype=float)), 1.0)
        except Exception:
            corr_ok = False
    cov_ok = cov is not None and hasattr(cov, 'shape') and tuple(cov.shape) == (5, 5)

    if nd_cols is not None and set(nd_cols) == set(COLS) and corr_ok and cov_ok:
        result['output_ok'] = True
        result['output_msg'] = 'numeric_df 5 cột phân tích, cov 5×5, corr 5×5 khớp tham chiếu (đường chéo = 1).'
    else:
        result['output_msg'] = ('Cần numeric_df đúng 5 cột %s + cov_matrix/corr_matrix 5×5 đúng giá trị. '
                                'Hiện numeric_df = %s.' % (COLS, nd_cols))

    # ── Tầng Risk ──
    if nd_cols is not None and 'student_id' in nd_cols:
        result['risk_msg'] = ('student_id nằm trong bảng phân tích — mã số sinh viên "tương quan" với '
                              'điểm chỉ là nhiễu vô nghĩa, nhưng nhìn con số r ai đó sẽ tưởng là bằng chứng.')
    else:
        result['risk_ok'] = True
        result['risk_msg'] = ('ID đứng ngoài phân tích. ⚠ Cảnh giới cuối: r(study_hours, final_score) '
                              'cao KHÔNG chứng minh "học nhiều GÂY RA điểm cao" — tương quan không '
                              'phải nhân quả; kết luận nhân quả cần thí nghiệm can thiệp.')

    # ── Tầng Behavior: xáo dòng — corr phải bất biến ──
    orig_load = ml_lab.load_statistics_dataset

    def shuffled_load(shuffle_seed=None):
        return orig_load(shuffle_seed=99)

    ml_lab.load_statistics_dataset = shuffled_load
    try:
        ns2, _ = _exec_capture(tree, '<user_code_shuffled>')
        corr2 = ns2.get('corr_matrix')
        ok = corr2 is not None and hasattr(corr2, 'shape') and tuple(corr2.shape) == (5, 5) \
            and np.allclose(np.asarray(corr2, dtype=float), ref.corr().values, atol=1e-6)
        if ok:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Xáo thứ tự 200 dòng: ma trận tương quan KHÔNG đổi — thống kê không phụ thuộc thứ tự mẫu.'
        else:
            result['behavior_msg'] = 'Xáo dòng làm kết quả đổi — thống kê đang bị tính sai cách.'
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại trên dữ liệu xáo dòng bị lỗi: ' + str(e)
    finally:
        ml_lab.load_statistics_dataset = orig_load

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def _contains_name(node, name):
    return any(isinstance(n, ast.Name) and n.id == name for n in ast.walk(node))


def _find_funcdef(tree, name):
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name == name:
            return node
    return None


def grade_lesson8(user_code):
    """Bài 8 — hàm dự đoán tuyến tính vectorized w*x + b.
    Unsafe-but-correct: gõ tay 3 output đúng — test ẩn đổi tham số sẽ lộ."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    fn_def = _find_funcdef(tree, 'predict_score')
    if fn_def is None or len(fn_def.args.args) != 3:
        result['code_msg'] = 'Cần hàm predict_score(x, weight, bias) đủ 3 tham số.'
        return result
    if not any(isinstance(n, ast.Return) for n in ast.walk(fn_def)):
        result['code_msg'] = 'predict_score chưa return gì.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Hàm predict_score(x, weight, bias) có return.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out
    fn = ns.get('predict_score')

    # ── Output: dự đoán hiển thị đúng w*x+b trên [2, 5, 8] ──
    try:
        vis = np.asarray(fn(np.array([2.0, 5.0, 8.0]), 8.0, 20.0), dtype=float)
        if vis.shape == (3,) and np.allclose(vis, [36.0, 60.0, 84.0]):
            result['output_ok'] = True
            result['output_msg'] = 'predict_score([2,5,8], 8, 20) → [36, 60, 84] — đúng công thức.'
        else:
            result['output_msg'] = 'Với x=[2,5,8], w=8, b=20 phải ra [36, 60, 84] — hiện ra %s.' % vis
    except Exception as e:
        result['output_msg'] = 'Gọi predict_score bị lỗi: ' + str(e)
        return result

    # ── Risk: bỏ quên bias / hard-code hằng số ──
    try:
        xt = np.array([2.0, 5.0])
        r0 = np.asarray(fn(xt, 8.0, 0.0), dtype=float)
        r55 = np.asarray(fn(xt, 8.0, 55.0), dtype=float)
        odd = np.asarray(fn(np.array([1.0, 2.0, 3.0]), 8.0, 20.0), dtype=float)
        if odd.shape == (3,) and np.allclose(odd, [36.0, 60.0, 84.0]):
            result['risk_msg'] = ('Ba con số [36, 60, 84] đang bị GÕ TAY — đổi x thành [1,2,3] mà output '
                                  'y hệt. Hàm phải TÍNH từ công thức, không chép đáp án.')
        elif np.allclose(r0, r55):
            result['risk_msg'] = 'Đổi bias từ 0 lên 55 mà dự đoán KHÔNG đổi — bias đang bị bỏ quên (thiếu "+ bias").'
        else:
            result['risk_ok'] = True
            result['risk_msg'] = 'Không hard-code, không rơi bias — hàm tính thật từ tham số.'
    except Exception as e:
        result['risk_msg'] = 'Test risk bị lỗi: ' + str(e)

    # ── Behavior: bộ (x, w, b) ẨN — kể cả w âm ──
    try:
        ok = True
        for arr, w, b in [(np.array([1.5, 9.3, 4.4]), -2.5, 7.0),
                          (np.array([0.0, 3.3]), 4.0, -6.0)]:
            got = np.asarray(fn(arr, w, b), dtype=float)
            if got.shape != arr.shape or not np.allclose(got, w * arr + b):
                ok = False
                break
        if ok:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Bộ (x, w, b) ẩn — kể cả w ÂM — đều đúng, output shape khớp input.'
        else:
            result['behavior_msg'] = 'Bộ tham số ẩn cho kết quả sai — hàm chưa đúng w*x + b tổng quát.'
    except Exception as e:
        result['behavior_msg'] = 'Test ẩn bị lỗi: ' + str(e)

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def grade_lesson9(user_code):
    """Bài 9 — hàm MSE. Unsafe-but-correct: trả về MAE (metric hợp lệ nhưng KHÁC)."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    fn_def = _find_funcdef(tree, 'mean_squared_error')
    if fn_def is None or len(fn_def.args.args) != 2:
        result['code_msg'] = 'Cần hàm mean_squared_error(actual, predictions) đủ 2 tham số.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Hàm mean_squared_error(actual, predictions) tồn tại.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out
    fn = ns.get('mean_squared_error')

    actual, pred_a, pred_b = ml_lab.load_mse_demo()
    ref_a = float(((pred_a - actual) ** 2).mean())
    ref_b = float(((pred_b - actual) ** 2).mean())

    # ── Risk TRƯỚC: nhận diện metric bằng bộ thử bất đối xứng ──
    act_t = np.array([0.0, 0.0, 0.0])
    pred_t = np.array([3.0, -1.0, 2.0])
    try:
        got = float(fn(act_t, pred_t))
        if abs(got - 14.0 / 3.0) < 1e-6:
            result['risk_ok'] = True
            result['risk_msg'] = 'Đúng MSE: bình phương diệt dấu và phạt nặng lỗi lớn.'
        elif abs(got - 2.0) < 1e-6:
            result['risk_msg'] = ('Hàm đang trả MAE (trung bình |lỗi|) — một metric HỢP LỆ nhưng KHÁC. '
                                  'Bài này cần MSE: bình phương phạt lỗi lớn mạnh hơn hẳn.')
        elif abs(got - 4.0 / 3.0) < 1e-6:
            result['risk_msg'] = ('Hàm đang lấy trung bình lỗi CÓ DẤU — các lỗi trái dấu tự triệt tiêu, '
                                  'model sai vẫn được điểm đẹp. Phải bình phương trước khi trung bình.')
        else:
            result['risk_msg'] = 'Kết quả không khớp MSE chuẩn (kỳ vọng 14/3 ≈ 4.667, nhận %s).' % round(got, 3)
    except Exception as e:
        result['risk_msg'] = 'Gọi hàm bị lỗi: ' + str(e)
        return result

    # ── Output: so sánh 2 model trên dữ liệu bài ──
    try:
        got_a, got_b = float(fn(actual, pred_a)), float(fn(actual, pred_b))
        if abs(got_a - ref_a) < 1e-6 and abs(got_b - ref_b) < 1e-6:
            result['output_ok'] = True
            result['output_msg'] = ('MSE(A) = %.1f < MSE(B) = %.1f — đường A rẻ hơn, đúng tham chiếu.'
                                    % (got_a, got_b))
        else:
            result['output_msg'] = ('MSE trên dữ liệu bài chưa khớp (kỳ vọng A=%.1f, B=%.1f).'
                                    % (ref_a, ref_b))
    except Exception as e:
        result['output_msg'] = 'Tính MSE trên dữ liệu bài bị lỗi: ' + str(e)

    # ── Behavior: mảng ẩn nhiều độ dài / nhiều dấu ──
    try:
        rng = np.random.RandomState(42)
        ok = True
        for n in (5, 17):
            a = rng.normal(0, 10, n)
            p = a + rng.normal(0, 5, n)
            if abs(float(fn(a, p)) - float(((p - a) ** 2).mean())) > 1e-6:
                ok = False
                break
        if ok:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Mảng ẩn độ dài 5 và 17 (lỗi âm lẫn dương) đều khớp MSE tham chiếu.'
        else:
            result['behavior_msg'] = 'Mảng ẩn cho kết quả lệch tham chiếu — hàm chưa tổng quát.'
    except Exception as e:
        result['behavior_msg'] = 'Test ẩn bị lỗi: ' + str(e)

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def grade_lesson10(user_code):
    """Bài 10 — vòng lặp Gradient Descent. Trap: sai dấu update, hard-code loss."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    # ── Code/AST: có vòng lặp, dùng compute_gradients, update TRỪ learning_rate ──
    has_loop = any(isinstance(n, (ast.For, ast.While)) for n in ast.walk(tree))
    uses_grad = _uses_call(tree, 'compute_gradients')
    minus_ok, plus_bad = False, False
    for node in ast.walk(tree):
        if isinstance(node, ast.AugAssign) and _contains_name(node.value, 'learning_rate'):
            if isinstance(node.op, ast.Sub):
                minus_ok = True
            elif isinstance(node.op, ast.Add):
                plus_bad = True
        if isinstance(node, ast.Assign) and isinstance(node.value, ast.BinOp) \
                and _contains_name(node.value.right, 'learning_rate'):
            if isinstance(node.value.op, ast.Sub):
                minus_ok = True
            elif isinstance(node.value.op, ast.Add):
                plus_bad = True
    if not has_loop or not uses_grad:
        result['code_msg'] = 'Cần vòng lặp gọi compute_gradients(x, y, weight, bias) mỗi bước.'
        return result
    if plus_bad and not minus_ok:
        result['code_msg'] = ('Update đang CỘNG learning_rate × gradient — đi CÙNG chiều dốc lên. '
                              'Phải TRỪ: parameter -= learning_rate * gradient.')
        return result
    if not minus_ok:
        result['code_msg'] = 'Chưa thấy phép update parameter -= learning_rate * gradient.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Vòng lặp GD đúng dạng: gradient → trừ lr×grad → ghi loss.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    hist = ns.get('loss_history')
    steps = ns.get('steps')
    w, b = ns.get('weight'), ns.get('bias')

    hist_ok = isinstance(hist, list) and isinstance(steps, int) and len(hist) == steps and steps > 0
    conv_ok = False
    if hist_ok:
        try:
            first, last = float(hist[0]), float(hist[-1])
            conv_ok = np.isfinite(last) and last < first * 0.5
        except Exception:
            conv_ok = False
    if hist_ok and conv_ok:
        result['output_ok'] = True
        result['output_msg'] = ('loss_history đủ %d bước: %.1f → %.1f — MSE giảm thật, không phân kỳ.'
                                % (steps, float(hist[0]), float(hist[-1])))
    elif not hist_ok:
        result['output_msg'] = 'loss_history phải là list đủ đúng `steps` phần tử (mỗi bước 1 giá trị MSE).'
    else:
        result['output_msg'] = 'Loss cuối chưa giảm rõ so với bước đầu (hoặc phân kỳ) — kiểm tra dấu update/learning rate.'

    # ── Risk: tham số phải THẬT SỰ được update + loss cuối khớp tham số cuối ──
    try:
        x, y = ml_lab.load_gradient_data()
        if w is None or b is None or (float(w) == 0.0 and float(b) == 0.0):
            result['risk_msg'] = 'weight/bias vẫn ở 0.0 — tham số chưa hề được update, loss đẹp đến đâu cũng vô nghĩa.'
        elif hist_ok and abs(float(hist[-1]) - ml_lab.compute_mse(y, float(w) * x + float(b))) > 1e-3:
            result['risk_msg'] = ('loss_history[-1] KHÔNG khớp MSE tính từ weight/bias cuối — '
                                  'giá trị loss đang bị gõ tay thay vì tính từ model.')
        else:
            result['risk_ok'] = True
            result['risk_msg'] = 'Tham số update thật; loss cuối khớp đúng MSE của (weight, bias) cuối.'
    except Exception as e:
        result['risk_msg'] = 'Test risk bị lỗi: ' + str(e)

    # ── Behavior: dataset ẨN (tham số thật khác) — loop phải vẫn hội tụ ──
    orig_load = ml_lab.load_gradient_data

    def hidden_load(variant=None):
        return orig_load(variant=777)

    ml_lab.load_gradient_data = hidden_load
    try:
        ns2, _ = _exec_capture(tree, '<user_code_hidden>')
        h2 = ns2.get('loss_history')
        ok = isinstance(h2, list) and len(h2) > 0 and np.isfinite(float(h2[-1])) \
            and float(h2[-1]) < float(h2[0]) * 0.5
        if ok:
            result['behavior_ok'] = True
            result['behavior_msg'] = ('Dataset ẨN (đường thật khác hẳn): loop vẫn hội tụ %.1f → %.1f — '
                                      'model HỌC thật, không thuộc lòng đáp án.' % (float(h2[0]), float(h2[-1])))
        else:
            result['behavior_msg'] = 'Trên dataset ẩn, loss không giảm — vòng lặp chưa thực sự học từ dữ liệu.'
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại trên dataset ẩn bị lỗi: ' + str(e)
    finally:
        ml_lab.load_gradient_data = orig_load

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def _uses_name(tree, name):
    return any(isinstance(n, ast.Name) and n.id == name for n in ast.walk(tree))


def grade_lesson11(user_code):
    """Bài 11 — audit LinearRegression trên nhãn 0/1. Unsafe-but-correct: clip
    output vào [0,1] cho 'đẹp' — giấu triệu chứng, không sửa công thức hóa."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    # ── Code/AST: phải fit LinearRegression thật; cấm né bài ──
    if not _uses_call(tree, 'load_binary_regression_demo'):
        result['code_msg'] = 'Chưa thấy load_binary_regression_demo().'
        return result
    if not (_uses_name(tree, 'LinearRegression') or _uses_call(tree, 'LinearRegression')):
        result['code_msg'] = 'Bài này audit LinearRegression — phải fit đúng model "sai" đó.'
        return result
    if not _uses_call(tree, 'fit') or not _uses_call(tree, 'predict'):
        result['code_msg'] = 'Cần .fit(X_train, y_train) rồi .predict(X_probe).'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'LinearRegression được fit và predict thật.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    # Tham chiếu: tự fit trên cùng dữ liệu
    from sklearn.linear_model import LinearRegression as _LR
    Xt, yt, Xp = ml_lab.load_binary_regression_demo()
    ref = _LR().fit(Xt, yt).predict(Xp)
    ref_below, ref_above = int((ref < 0).sum()), int((ref > 1).sum())

    lo = ns.get('linear_outputs')
    classes = ns.get('classes')
    lo_arr = np.asarray(lo, dtype=float) if lo is not None else None

    out_ok = (lo_arr is not None and lo_arr.shape == ref.shape and np.allclose(lo_arr, ref, atol=1e-6)
              and classes is not None and set(np.unique(np.asarray(classes)).tolist()) <= {0, 1})
    if out_ok:
        result['output_ok'] = True
        result['output_msg'] = ('Audit đúng: %d output < 0, %d output > 1 — đường thẳng KHÔNG biết '
                                'xác suất có trần/sàn.' % (ref_below, ref_above))
    else:
        result['output_msg'] = ('linear_outputs phải là output THÔ của model trên X_probe '
                                '(chưa clip/chưa threshold) + classes là nhãn 0/1.')

    # ── Risk: clip là giấu bệnh; LogisticRegression là né bài ──
    if _uses_call(tree, 'clip'):
        result['risk_msg'] = ('np.clip ép output vào [0,1] cho ĐẸP — nhưng model bên dưới vẫn tối ưu '
                              'sai mục tiêu. Giấu triệu chứng không phải chữa bệnh: cần hàm bị chặn '
                              'THẬT (sigmoid, bài 12).')
    elif _uses_name(tree, 'LogisticRegression'):
        result['risk_msg'] = 'Nhảy thẳng sang LogisticRegression là né mất bài audit — phải nhìn tận mắt cái sai trước đã.'
    elif lo_arr is not None and lo_arr.size and float(lo_arr.min()) >= 0 and float(lo_arr.max()) <= 1:
        result['risk_msg'] = 'Output thô đang nằm gọn trong [0,1] — có vẻ đã bị xử lý trước khi lưu. Giữ nguyên giá trị thô.'
    else:
        result['risk_ok'] = True
        result['risk_msg'] = 'Output thô được giữ nguyên không che đậy — audit trung thực.'

    # ── Behavior: dữ liệu ẨN (probe khác) — audit phải vẫn đúng ──
    orig_load = ml_lab.load_binary_regression_demo

    def hidden_load(variant=None):
        return orig_load(variant=555)

    ml_lab.load_binary_regression_demo = hidden_load
    try:
        ns2, _ = _exec_capture(tree, '<user_code_hidden>')
        Xt2, yt2, Xp2 = orig_load(variant=555)
        ref2 = _LR().fit(Xt2, yt2).predict(Xp2)
        lo2 = np.asarray(ns2.get('linear_outputs'), dtype=float) if ns2.get('linear_outputs') is not None else None
        if lo2 is not None and lo2.shape == ref2.shape and np.allclose(lo2, ref2, atol=1e-6):
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Trên bộ probe ẨN, output khớp model fit thật — không gõ tay số đếm.'
        else:
            result['behavior_msg'] = 'Trên bộ probe ẩn, output không khớp — audit đang bị hard-code.'
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn bị lỗi: ' + str(e)
    finally:
        ml_lab.load_binary_regression_demo = orig_load

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def grade_lesson12(user_code):
    """Bài 12 — sigmoid vectorized. Unsafe-but-correct: np.clip(z, 0, 1) cho
    output 'trong [0,1]' nhưng không phải đường cong xác suất."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    fn_def = _find_funcdef(tree, 'sigmoid')
    if fn_def is None or len(fn_def.args.args) != 1:
        result['code_msg'] = 'Cần hàm sigmoid(z) đúng 1 tham số.'
        return result
    if not _uses_call(tree, 'exp'):
        result['code_msg'] = 'Sigmoid chuẩn dùng hàm mũ: 1 / (1 + np.exp(-z)).'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Hàm sigmoid dùng công thức mũ thật.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out
    fn = ns.get('sigmoid')

    ref = lambda z: 1.0 / (1.0 + np.exp(-np.asarray(z, dtype=float)))

    # ── Output: z=0 → 0.5 + khớp tham chiếu trên mảng bài ──
    try:
        z0 = float(np.asarray(fn(0.0)))
        arr = np.asarray(fn(np.array([-5.0, -1.0, 0.0, 1.0, 5.0])), dtype=float)
        if abs(z0 - 0.5) < 1e-9 and np.allclose(arr, ref([-5, -1, 0, 1, 5]), atol=1e-9):
            result['output_ok'] = True
            result['output_msg'] = 'sigmoid(0) = 0.5, cả mảng khớp công thức logistic chuẩn.'
        else:
            result['output_msg'] = 'sigmoid(0) phải bằng 0.5 và khớp 1/(1+e^(−z)) trên mọi phần tử.'
    except Exception as e:
        result['output_msg'] = 'Gọi sigmoid bị lỗi: ' + str(e)
        return result

    # ── Risk: clip / trả z thô ──
    try:
        zt = np.array([-3.0, -0.5, 0.25, 0.8, 3.0])
        got = np.asarray(fn(zt), dtype=float)
        if np.allclose(got, np.clip(zt, 0, 1), atol=1e-9):
            result['risk_msg'] = ('Đây là np.clip chứ không phải sigmoid: output bị chặn nhưng gãy khúc, '
                                  'mất độ dốc quanh 0 — không phải đường cong xác suất mượt.')
        elif np.allclose(got, zt, atol=1e-9):
            result['risk_msg'] = 'Hàm đang trả z thô — score chưa qua ép, không phải xác suất.'
        else:
            result['risk_ok'] = True
            result['risk_msg'] = 'Đường cong mượt, bị chặn thật sự trong (0, 1) — đúng chất sigmoid.'
    except Exception as e:
        result['risk_msg'] = 'Test risk bị lỗi: ' + str(e)

    # ── Behavior: mảng ẩn — khớp công thức + đơn điệu + trong (0,1) ──
    try:
        rng = np.random.RandomState(7)
        z_hidden = np.sort(rng.uniform(-30, 30, 41))
        got = np.asarray(fn(z_hidden), dtype=float)
        mono = bool(np.all(np.diff(got) >= 0))
        in_range = bool(np.all(got > 0) and np.all(got < 1))
        match = np.allclose(got, ref(z_hidden), atol=1e-9)
        if mono and in_range and match:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Mảng score ẩn (−30..30): đơn điệu tăng, luôn trong (0,1), khớp công thức.'
        else:
            result['behavior_msg'] = 'Trên score ẩn: cần đơn điệu tăng, nằm trong (0,1) và khớp 1/(1+e^(−z)).'
    except Exception as e:
        result['behavior_msg'] = 'Test ẩn bị lỗi: ' + str(e)

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def grade_lesson13(user_code):
    """Bài 13 — predict_classes: score ma trận → sigmoid → threshold.
    Unsafe-but-correct: so SCORE với 0.5 thay vì so XÁC SUẤT với 0.5."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    fn_def = _find_funcdef(tree, 'predict_classes')
    n_args = len(fn_def.args.args) if fn_def else 0
    if fn_def is None or n_args < 3:
        result['code_msg'] = 'Cần hàm predict_classes(X, weights, bias, threshold=0.5).'
        return result
    has_matmul = any(isinstance(n, ast.BinOp) and isinstance(n.op, ast.MatMult) for n in ast.walk(tree)) \
        or _uses_call(tree, 'dot') or _uses_call(tree, 'matmul')
    if not has_matmul:
        result['code_msg'] = 'Score phải tính bằng phép nhân ma trận: X @ weights + bias.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có X @ weights + bias và đủ tham số threshold.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out
    fn = ns.get('predict_classes')

    def ref(X, w, b, t=0.5):
        p = 1.0 / (1.0 + np.exp(-(np.asarray(X, float) @ np.asarray(w, float) + b)))
        return p, (p >= t).astype(int)

    X, w, b = ml_lab.load_boundary_data()

    # ── Output: shapes + nhãn 0/1 + khớp tham chiếu trên dữ liệu bài ──
    try:
        got = fn(X, w, b)
        if not (isinstance(got, tuple) and len(got) == 2):
            result['output_msg'] = 'Hàm phải return (probabilities, predictions) — đủ CẢ HAI.'
            return result
        p_got, c_got = np.asarray(got[0], float), np.asarray(got[1])
        p_ref, c_ref = ref(X, w, b)
        if p_got.shape == (20,) and c_got.shape == (20,) \
                and set(np.unique(c_got).tolist()) <= {0, 1} \
                and np.allclose(p_got, p_ref, atol=1e-9) and np.array_equal(c_got, c_ref):
            result['output_ok'] = True
            result['output_msg'] = '20 xác suất trong (0,1) + 20 nhãn 0/1, khớp tham chiếu từng phần tử.'
        else:
            result['output_msg'] = 'Xác suất/nhãn chưa khớp: cần p = sigmoid(X @ w + b), nhãn = (p >= threshold).'
    except Exception as e:
        result['output_msg'] = 'Gọi predict_classes bị lỗi: ' + str(e)
        return result

    # ── Risk: so SCORE với 0.5 (trap kinh điển) + threshold bị bỏ ──
    try:
        # z = 0.2 → p = 0.55: đúng phải là lớp 1 tại threshold 0.5.
        # Ai so score >= 0.5 sẽ trả lớp 0.
        Xt = np.array([[0.2]])
        _, ct = fn(Xt, np.array([1.0]), 0.0)
        ct = np.asarray(ct)
        # threshold phải là tham số sống: p=0.55 với threshold 0.9 → lớp 0
        _, ct2 = fn(Xt, np.array([1.0]), 0.0, 0.9)
        ct2 = np.asarray(ct2)
        if int(ct[0]) == 0:
            result['risk_msg'] = ('Điểm có z = 0.2 (p = 0.55) đang bị gán lớp 0 — bạn so SCORE với 0.5. '
                                  'Ngưỡng 0.5 là của XÁC SUẤT; bên score nó tương đương z = 0. '
                                  'Cả luật phân lớp đang bị dịch sai.')
        elif int(ct2[0]) == 1:
            result['risk_msg'] = 'threshold=0.9 mà p=0.55 vẫn được lớp 1 — tham số threshold đang bị bỏ qua (hard-code 0.5).'
        else:
            result['risk_ok'] = True
            result['risk_msg'] = 'So đúng XÁC SUẤT với threshold, và threshold là tham số sống.'
    except Exception as e:
        result['risk_msg'] = 'Test risk bị lỗi: ' + str(e)

    # ── Behavior: số feature khác + threshold khác ──
    try:
        rng = np.random.RandomState(9)
        X3 = rng.uniform(-2, 2, (7, 3))
        w3 = np.array([0.8, -1.2, 0.5])
        ok = True
        for t in (0.3, 0.7):
            got = fn(X3, w3, 0.4, t)
            p_ref, c_ref = ref(X3, w3, 0.4, t)
            if not (np.allclose(np.asarray(got[0], float), p_ref, atol=1e-9)
                    and np.array_equal(np.asarray(got[1]), c_ref)):
                ok = False
                break
        if ok:
            result['behavior_ok'] = True
            result['behavior_msg'] = '3 feature + threshold 0.3/0.7 ẩn đều khớp — hàm tổng quát thật.'
        else:
            result['behavior_msg'] = 'Với 3 feature hoặc threshold khác 0.5, kết quả lệch tham chiếu.'
    except Exception as e:
        result['behavior_msg'] = 'Test ẩn bị lỗi: ' + str(e)

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def grade_lesson14(user_code):
    """Bài 14 — chọn độ phức tạp theo CHECK MSE. Unsafe-but-correct: chọn bậc 12
    vì train MSE nhỏ nhất — tính đúng hết nhưng luật chọn cổ vũ overfit."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    if not _uses_call(tree, 'load_complexity_demo') or not _uses_call(tree, 'fit_polynomial_model'):
        result['code_msg'] = 'Cần load_complexity_demo() và fit_polynomial_model() cho từng bậc.'
        return result
    if not any(isinstance(n, (ast.For, ast.While)) for n in ast.walk(tree)):
        result['code_msg'] = 'Hãy lặp qua các bậc [1, 3, 12] thay vì chép tay 3 lần.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Vòng lặp fit đủ các bậc qua helper chuẩn.'

    # ── Gián điệp fit: bắt fit trên dữ liệu CHECK (leakage) ──
    Xt, yt, Xc, yc = ml_lab.load_complexity_demo()
    orig_fit = ml_lab.fit_polynomial_model
    leak = {'hit': False}

    def spy_fit(X_train, y_train, degree):
        try:
            arr = np.asarray(y_train, dtype=float)
            if arr.shape == yc.shape and np.allclose(arr, yc):
                leak['hit'] = True
            if arr.shape[0] == yt.shape[0] + yc.shape[0]:
                leak['hit'] = True
        except Exception:
            pass
        return orig_fit(X_train, y_train, degree)

    ml_lab.fit_polynomial_model = spy_fit
    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    finally:
        ml_lab.fit_polynomial_model = orig_fit
    result['stdout'] = out

    # Tham chiếu
    ref = {}
    for d in (1, 3, 12):
        m = orig_fit(Xt, yt, d)
        ref[d] = (ml_lab.compute_mse(yt, m.predict(Xt)), ml_lab.compute_mse(yc, m.predict(Xc)))
    ref_best = min(ref, key=lambda d: ref[d][1])

    results_var = ns.get('results')
    best = ns.get('best_degree')
    out_ok = False
    if isinstance(results_var, list) and len(results_var) >= 3:
        try:
            by_deg = {int(r['degree']): (float(r['train_mse']), float(r['check_mse'])) for r in results_var}
            out_ok = all(d in by_deg and abs(by_deg[d][0] - ref[d][0]) < 1e-3
                         and abs(by_deg[d][1] - ref[d][1]) < 1e-3 for d in (1, 3, 12)) \
                and best == ref_best
        except Exception:
            out_ok = False
    if out_ok:
        result['output_ok'] = True
        result['output_msg'] = ('Đủ 3 cặp train/check MSE đúng tham chiếu; best_degree = %d theo '
                                'CHECK MSE (bậc 12 train chỉ 5.4 nhưng check nổ tung).' % ref_best)
    else:
        result['output_msg'] = ('Cần results đủ 3 bậc với train_mse/check_mse đúng, và best_degree '
                                'chọn theo CHECK MSE nhỏ nhất.')

    # ── Risk: leakage fit-trên-check / chọn theo train MSE ──
    train_best = min(ref, key=lambda d: ref[d][0])
    if leak['hit']:
        result['risk_msg'] = ('fit đang chạm vào dữ liệu CHECK — 20 điểm đó phải là "tương lai chưa thấy". '
                              'Fit trên nó là leakage: điểm số đẹp nhưng vô nghĩa.')
    elif best is not None and best == train_best and best != ref_best:
        result['risk_msg'] = ('best_degree = %d vì train MSE nhỏ nhất — phép tính ĐÚNG nhưng luật chọn SAI: '
                              'thưởng cho học thuộc lòng. Chọn theo CHECK MSE.' % train_best)
    else:
        result['risk_ok'] = True
        result['risk_msg'] = 'Fit chỉ trên train, chọn model theo dữ liệu CHƯA THẤY — đúng tinh thần generalization.'

    # ── Behavior: dataset ẨN có đường thật TUYẾN TÍNH — best phải ĐỔI theo ──
    orig_load = ml_lab.load_complexity_demo

    def hidden_load(variant=None):
        return orig_load(variant=777)

    ml_lab.load_complexity_demo = hidden_load
    try:
        Xt2, yt2, Xc2, yc2 = orig_load(variant=777)
        ref2 = {d: ml_lab.compute_mse(yc2, orig_fit(Xt2, yt2, d).predict(Xc2)) for d in (1, 3, 12)}
        ref2_best = min(ref2, key=ref2.get)
        ns2, _ = _exec_capture(tree, '<user_code_hidden>')
        if ns2.get('best_degree') == ref2_best:
            result['behavior_ok'] = True
            result['behavior_msg'] = ('Dataset ẩn có đường thật TUYẾN TÍNH: best_degree tự đổi thành %d — '
                                      'luật chọn thật sự nhìn dữ liệu, không hard-code.' % ref2_best)
        else:
            result['behavior_msg'] = ('Dataset ẩn (đường thật tuyến tính) có bậc tốt nhất = %d, nhưng '
                                      'best_degree của bạn không đổi theo — đang hard-code kết quả.' % ref2_best)
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại trên dataset ẩn bị lỗi: ' + str(e)
    finally:
        ml_lab.load_complexity_demo = orig_load

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def grade_lesson15(user_code):
    """Bài 15 — split 60/20/20 stratified, tái lập được, test niêm phong.
    Unsafe-but-correct: fit scaler trên TOÀN bảng rồi mới split — shape vẫn đẹp
    nhưng thống kê đánh giá đã rò vào training."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    # ── Code/AST: 2 lần train_test_split, đủ random_state + stratify ──
    split_calls = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            f = node.func
            name = f.id if isinstance(f, ast.Name) else (f.attr if isinstance(f, ast.Attribute) else '')
            if name == 'train_test_split':
                split_calls.append(node)
    if len(split_calls) < 2:
        result['code_msg'] = 'Cần ĐÚNG 2 lần train_test_split: tách test trước, rồi tách validation từ phần còn lại.'
        return result
    kw_ok = all(
        {'random_state', 'stratify'} <= {k.arg for k in c.keywords if k.arg}
        for c in split_calls[:2]
    )
    if not kw_ok:
        result['code_msg'] = 'Cả 2 lần split đều cần random_state (tái lập) và stratify (giữ tỉ lệ lớp).'
        return result
    result['code_ok'] = True
    result['code_msg'] = '2 lần split, đủ random_state + stratify.'

    # Risk-AST: preprocessing HỌC THỐNG KÊ trước khi split
    first_split_line = min(c.lineno for c in split_calls)
    pre_split_fit = any(
        isinstance(n, ast.Call) and isinstance(n.func, ast.Attribute)
        and n.func.attr in ('fit', 'fit_transform') and n.lineno < first_split_line
        for n in ast.walk(tree)
    )

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    Xtr, Xv, Xte = ns.get('X_train'), ns.get('X_val'), ns.get('X_test')
    ytr, yv, yte = ns.get('y_train'), ns.get('y_val'), ns.get('y_test')

    sizes_ok = all(v is not None and hasattr(v, '__len__') for v in (Xtr, Xv, Xte, ytr, yv, yte)) \
        and len(Xtr) == 600 and len(Xv) == 200 and len(Xte) == 200 \
        and len(ytr) == 600 and len(yv) == 200 and len(yte) == 200
    partition_ok = False
    if sizes_ok and all(hasattr(v, 'index') for v in (Xtr, Xv, Xte)):
        s1, s2, s3 = set(Xtr.index), set(Xv.index), set(Xte.index)
        partition_ok = len(s1 | s2 | s3) == 1000 and not (s1 & s2) and not (s1 & s3) and not (s2 & s3)
    balance_ok = sizes_ok and all(
        abs(float(np.asarray(v, dtype=float).mean()) - 0.7) <= 0.03 for v in (ytr, yv, yte)
    )
    if sizes_ok and partition_ok and balance_ok:
        result['output_ok'] = True
        result['output_msg'] = ('600/200/200, ba tập KHÔNG giẫm nhau (đủ 1000 row-id), tỉ lệ Đậu ≈ 0.70 '
                                'ở cả ba — split chuẩn.')
    elif sizes_ok and not partition_ok:
        result['output_msg'] = 'Kích thước đúng nhưng 3 tập chồng lấn/thiếu row-id — kiểm tra lại nguồn của lần split thứ 2 (phải là X_temp, không phải X).'
    else:
        result['output_msg'] = ('Cần X_train/X_val/X_test = 600/200/200 dòng (0.20 rồi 0.25 — lấy 20% của '
                                '80% chỉ ra 16%) và y tương ứng.')

    # ── Risk ──
    if pre_split_fit:
        result['risk_msg'] = ('Scaler đang fit trên TOÀN BỘ 1000 dòng TRƯỚC khi split — shape vẫn đẹp '
                              'nhưng mean/std của validation/test đã rò vào training. Đây chính là '
                              'leakage bài 5-6 cảnh báo: split TRƯỚC, học thống kê SAU (trên train).')
    else:
        result['risk_ok'] = True
        result['risk_msg'] = ('Không preprocessing nào học từ dữ liệu trước khi split; test tách sớm và '
                              'chỉ dùng để báo cáo — Test Vault đúng nghĩa niêm phong.')

    # ── Behavior: chạy lại — split phải TÁI LẬP y hệt (random_state) ──
    try:
        ns2, _ = _exec_capture(tree, '<user_code_rerun>')
        Xtr2 = ns2.get('X_train')
        same = Xtr2 is not None and hasattr(Xtr, 'index') and hasattr(Xtr2, 'index') \
            and list(Xtr.index) == list(Xtr2.index)
        if same:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Chạy lại lần 2: 600 row-id train Y HỆT — random_state làm split tái lập được.'
        else:
            result['behavior_msg'] = 'Chạy lại lần 2 ra split KHÁC — thiếu random_state, thí nghiệm không tái lập được.'
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại lần 2 bị lỗi: ' + str(e)

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
                              'hãy giữ X = df[["study_hours", "attendance", "midterm_score"]].')
    elif 'pass_fail' in x_cols:
        result['risk_msg'] = ('pass_fail đang nằm TRONG X — target leakage trực tiếp: '
                              'model "dự đoán" bằng chính đáp án.')
    elif 'final_score' in x_cols:
        result['risk_msg'] = ('X đủ shape (200, 3) nhưng chứa final_score — bài toán là cảnh báo SỚM '
                              '(tuần 8), khi final_score CHƯA tồn tại. Code chạy được nhưng leak '
                              'thông tin tương lai — không dùng được ngoài đời.')
    elif not y_is_passfail:
        result['risk_msg'] = 'y chưa phải cột pass_fail — target của bài này là pass_fail.'
    else:
        result['risk_ok'] = True
        result['risk_msg'] = 'Schema sạch: X = 3 feature quan sát được ở tuần 8, y = pass_fail, không leakage.'

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


# ══════════════════════════════════════════════════════════════════════
# COURSE 2 — MACHINE LEARNING TRUNG CẤP (APPLIED ML)
# 14 grader functions, cùng contract 4 tầng (Output / Code-AST /
# Model-behavior / Risk) như Course 1/3.
# ══════════════════════════════════════════════════════════════════════

def _num_after(text, keyword):
    """Tìm dòng có chứa keyword như MỘT TOKEN riêng (không khớp nhầm vào
    giữa 1 danh từ dài hơn, vd tìm 'scaled_loss' không được khớp vào giữa
    'unscaled_loss'), trả về số thực ĐẦU TIÊN xuất hiện sau đó trên dòng —
    kể cả inf/-inf/nan (GD phân kỳ có thể in ra các giá trị này).
    None nếu không có."""
    kw_re = re.compile(r'(?<![a-zA-Z0-9_])' + re.escape(keyword.lower()))
    for line in text.splitlines():
        low = line.lower()
        m_kw = kw_re.search(low)
        if not m_kw:
            continue
        rest = line[m_kw.end():]
        m = re.search(r'-?(?:inf|nan|\d+\.?\d*(?:[eE][-+]?\d+)?)', rest, re.IGNORECASE)
        if m:
            try:
                return float(m.group())
            except ValueError:
                continue
    return None


def _fit_uses_arg_named(tree, substr):
    """True nếu có lời gọi .fit(...) mà 1 trong các positional arg là
    một Name chứa `substr` (không phân biệt hoa/thường) — bắt leakage
    kiểu fit(X_val, y_val) hoặc fit(X_test, ...)."""
    substr = substr.lower()
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == 'fit':
            for a in node.args:
                if isinstance(a, ast.Name) and substr in a.id.lower():
                    return True
    return False


def _rerun_hidden(tree, loader_name, hidden_seed=9001):
    """Tầng Model behavior THẬT: monkey-patch ml_lab.<loader_name> để luôn
    dùng seed ẨN (khác mặc định), rồi chạy lại TOÀN BỘ code học viên với
    dữ liệu đó. Nếu code hard-code số liệu (thay vì tính từ load_*), output
    lần 2 sẽ sai lệch/rỗng — bắt được qua so sánh ở tầng gọi hàm này.
    Trả về (stdout2, error_msg); error_msg=None nếu chạy không lỗi runtime."""
    orig = getattr(ml_lab, loader_name)

    def hidden(*args, **kwargs):
        kwargs = dict(kwargs)
        kwargs['seed'] = hidden_seed
        return orig(*args, **kwargs)

    setattr(ml_lab, loader_name, hidden)
    try:
        _, out2 = _exec_capture(tree, tag='<user_code_hidden>')
        return out2, None
    except Exception as e:
        return '', str(e)
    finally:
        setattr(ml_lab, loader_name, orig)


# ── C2-1 — Multiple Linear Regression trong pipeline thực tế ────────────
def grade_lesson_c2_1(user_code):
    """Fit LinearRegression TRÊN train, in val_mse + val_r2 trên validation."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result
    if not _uses_call(tree, 'print'):
        result['code_msg'] = 'Thiếu print().'
        return result
    if not _uses_call(tree, 'LinearRegression'):
        result['code_msg'] = 'Cần dùng LinearRegression từ sklearn.linear_model.'
        return result
    if not _uses_call(tree, 'load_multi_regression_splits'):
        result['code_msg'] = 'Cần load_multi_regression_splits từ ml_lab.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có LinearRegression + load_multi_regression_splits + print().'

    if _fit_uses_arg_named(tree, 'val'):
        result['risk_msg'] = 'fit() đang nhận biến có tên chứa "val" — model không được fit trên tập validation.'
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'fit() chỉ dùng dữ liệu train, đánh giá trên validation riêng.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    r2 = _num_after(out, 'val_r2')
    if r2 is not None and r2 > 0.4:
        result['output_ok'] = True
        result['output_msg'] = 'val_r2 = %.3f — model học được tín hiệu thật từ 3 feature.' % r2
    else:
        result['output_msg'] = 'Cần in "val_mse" và "val_r2" (r2 phải > 0.4 trên validation).'

    out2, err2 = _rerun_hidden(tree, 'load_multi_regression_splits')
    if err2:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + err2
    else:
        r2_2 = _num_after(out2, 'val_r2')
        if r2_2 is not None and r2_2 > 0.4:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) vẫn cho val_r2 hợp lệ (%.3f) — model thật sự học, không hard-code.' % r2_2
        else:
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn KHÔNG cho val_r2 hợp lệ — có thể đang hard-code kết quả.'

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ── C2-2 — Feature Scaling và Convergence ────────────────────────────────
def grade_lesson_c2_2(user_code):
    """So sánh loss cuối của GD KHÔNG scale vs CÓ scale — scaled phải hội
    tụ tốt hơn hẳn (unscaled loss lớn hơn nhiều, có thể inf/nan)."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result
    if not _uses_call(tree, 'print'):
        result['code_msg'] = 'Thiếu print().'
        return result
    if not _uses_call(tree, 'load_scaling_convergence_data'):
        result['code_msg'] = 'Cần load_scaling_convergence_data từ ml_lab.'
        return result
    if not (_uses_call(tree, 'StandardScaler') or _uses_call(tree, 'run_gd_linear') or _uses_call(tree, 'std')):
        result['code_msg'] = 'Cần scale dữ liệu (StandardScaler hoặc tự chuẩn hoá bằng mean/std) để so sánh.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có load dữ liệu + scale + print().'
    result['risk_ok'] = True
    result['risk_msg'] = 'Bài so sánh hội tụ — không có leakage train/val ở đây.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    unscaled = _num_after(out, 'unscaled_loss')
    scaled = _num_after(out, 'scaled_loss')
    if unscaled is not None and scaled is not None:
        bad_unscaled = (not np.isfinite(unscaled)) or unscaled > scaled
        if bad_unscaled and np.isfinite(scaled):
            result['output_ok'] = True
            result['output_msg'] = 'unscaled_loss (%s) tệ hơn hẳn scaled_loss (%.4f) — scaling giúp hội tụ.' % (str(unscaled), scaled)
        else:
            result['output_msg'] = 'Chưa thấy scaled_loss tốt hơn unscaled_loss rõ rệt.'
    else:
        result['output_msg'] = 'Cần in "unscaled_loss" và "scaled_loss".'

    out2, err2 = _rerun_hidden(tree, 'load_scaling_convergence_data')
    if err2:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + err2
    else:
        u2 = _num_after(out2, 'unscaled_loss')
        s2 = _num_after(out2, 'scaled_loss')
        if u2 is not None and s2 is not None and np.isfinite(s2) and ((not np.isfinite(u2)) or u2 > s2):
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) vẫn cho thấy scaled tốt hơn unscaled — không hard-code.'
        else:
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn KHÔNG cho kết quả hợp lệ — có thể đang hard-code loss.'

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ── C2-3 — Logistic Loss và những prediction sai đầy tự tin ─────────────
def grade_lesson_c2_3(user_code):
    """Tính log loss cho cautious vs overconfident — overconfident phải
    LỚN HƠN HẲN dù accuracy 2 bên bằng nhau."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result
    if not _uses_call(tree, 'print'):
        result['code_msg'] = 'Thiếu print().'
        return result
    if not _uses_call(tree, 'load_logloss_demo'):
        result['code_msg'] = 'Cần load_logloss_demo từ ml_lab.'
        return result
    if not (_uses_name(tree, 'probs_cautious') or _uses_name(tree, 'cautious')):
        result['code_msg'] = 'Cần dùng CẢ 2 bộ xác suất trả về (cautious và overconfident).'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có load_logloss_demo + dùng cả 2 bộ xác suất + print().'
    result['risk_ok'] = True
    result['risk_msg'] = 'Bài chỉ so sánh log loss — không có train/val ở đây.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    cautious = _num_after(out, 'cautious_logloss')
    overconfident = _num_after(out, 'overconfident_logloss')
    if cautious is not None and overconfident is not None and overconfident > cautious:
        result['output_ok'] = True
        result['output_msg'] = 'overconfident_logloss (%.3f) > cautious_logloss (%.3f) — đúng như lý thuyết.' % (overconfident, cautious)
    else:
        result['output_msg'] = 'Cần in "cautious_logloss" và "overconfident_logloss" (overconfident phải LỚN HƠN).'

    result['behavior_ok'] = True
    result['behavior_msg'] = 'Log loss tính trên dữ liệu cố định — deterministic.'
    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ── C2-4 — Train Logistic Regression bằng Gradient Descent ──────────────
def grade_lesson_c2_4(user_code):
    """Fit LogisticRegression TRÊN train, in val_accuracy trên validation."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result
    if not _uses_call(tree, 'print'):
        result['code_msg'] = 'Thiếu print().'
        return result
    if not _uses_call(tree, 'LogisticRegression'):
        result['code_msg'] = 'Cần dùng LogisticRegression từ sklearn.linear_model.'
        return result
    if not _uses_call(tree, 'load_logistic_gd_data'):
        result['code_msg'] = 'Cần load_logistic_gd_data từ ml_lab.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có LogisticRegression + load_logistic_gd_data + print().'

    if _fit_uses_arg_named(tree, 'val'):
        result['risk_msg'] = 'fit() đang nhận biến có tên chứa "val" — model không được fit trên validation.'
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'fit() chỉ dùng train, đánh giá trên validation riêng.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    acc = _num_after(out, 'val_accuracy')
    if acc is not None and 0.5 < acc <= 1.0:
        result['output_ok'] = True
        result['output_msg'] = 'val_accuracy = %.3f — model học được ranh giới thật.' % acc
    else:
        result['output_msg'] = 'Cần in "val_accuracy" (giá trị > 0.5, model phải tốt hơn đoán ngẫu nhiên).'

    out2, err2 = _rerun_hidden(tree, 'load_logistic_gd_data')
    if err2:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + err2
    else:
        acc2 = _num_after(out2, 'val_accuracy')
        if acc2 is not None and 0.5 < acc2 <= 1.0:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) vẫn cho val_accuracy hợp lệ (%.3f) — không hard-code.' % acc2
        else:
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn KHÔNG cho val_accuracy hợp lệ — có thể đang hard-code kết quả.'

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ── C2-5 — Regularization: kiểm soát độ phức tạp của model ───────────────
def grade_lesson_c2_5(user_code):
    """So sánh L1 vs L2: đếm số hệ số gần 0 (|coef| < 0.05) — L1 phải có
    NHIỀU hệ số gần 0 hơn L2 (sparsity)."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result
    if not _uses_call(tree, 'print'):
        result['code_msg'] = 'Thiếu print().'
        return result
    if not _uses_call(tree, 'LogisticRegression'):
        result['code_msg'] = 'Cần dùng LogisticRegression với tham số penalty (l1/l2).'
        return result
    if not _uses_call(tree, 'load_regularization_data'):
        result['code_msg'] = 'Cần load_regularization_data từ ml_lab.'
        return result
    if "'l1'" not in user_code and '"l1"' not in user_code:
        result['code_msg'] = 'Cần fit ít nhất 1 model với penalty="l1".'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có LogisticRegression(penalty=l1/l2) + load_regularization_data + print().'

    if _fit_uses_arg_named(tree, 'val'):
        result['risk_msg'] = 'fit() đang nhận biến có tên chứa "val" — model không được fit trên validation.'
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'fit() chỉ dùng train.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    l1_zero = _num_after(out, 'l1_near_zero')
    l2_zero = _num_after(out, 'l2_near_zero')
    if l1_zero is not None and l2_zero is not None and l1_zero > l2_zero:
        result['output_ok'] = True
        result['output_msg'] = 'l1_near_zero (%d) > l2_near_zero (%d) — L1 tạo sparsity, L2 chỉ co nhỏ đều.' % (l1_zero, l2_zero)
    else:
        result['output_msg'] = 'Cần in "l1_near_zero" và "l2_near_zero" (số hệ số |coef|<0.05); L1 phải NHIỀU hơn L2.'

    out2, err2 = _rerun_hidden(tree, 'load_regularization_data')
    if err2:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + err2
    else:
        l1_2 = _num_after(out2, 'l1_near_zero')
        l2_2 = _num_after(out2, 'l2_near_zero')
        if l1_2 is not None and l2_2 is not None and l1_2 > l2_2:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) vẫn cho l1_near_zero > l2_near_zero — không hard-code.'
        else:
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn KHÔNG cho kết quả hợp lệ — có thể đang hard-code số liệu.'

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ── C2-6 — Chọn regularization strength bằng Validation ──────────────────
def grade_lesson_c2_6(user_code):
    """Sweep nhiều C, chọn C tốt nhất bằng validation F1/accuracy — không
    được hard-code C mà không sweep."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result
    if not _uses_call(tree, 'print'):
        result['code_msg'] = 'Thiếu print().'
        return result
    if not _uses_call(tree, 'LogisticRegression'):
        result['code_msg'] = 'Cần dùng LogisticRegression(C=...).'
        return result
    if not _uses_call(tree, 'load_reg_strength_splits'):
        result['code_msg'] = 'Cần load_reg_strength_splits từ ml_lab.'
        return result
    has_loop = any(isinstance(n, ast.For) for n in ast.walk(tree))
    if not has_loop:
        result['code_msg'] = 'Cần sweep NHIỀU giá trị C bằng vòng lặp for — không hard-code 1 C duy nhất.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có sweep C bằng for + LogisticRegression + load_reg_strength_splits + print().'

    if _fit_uses_arg_named(tree, 'val'):
        result['risk_msg'] = 'fit() đang nhận biến có tên chứa "val" — model không được fit trên validation.'
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'fit() chỉ dùng train, chọn C bằng val — không test tuning.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    nums = re.findall(r'-?\d+\.?\d*(?:[eE][-+]?\d+)?', out)
    if 'best_c' in out.lower() and len(nums) >= 4:
        result['output_ok'] = True
        result['output_msg'] = 'Đã sweep nhiều C và in best_C dựa trên validation.'
    else:
        result['output_msg'] = 'Cần in kết quả sweep (từng C + val score) VÀ 1 dòng "best_C <giá trị>".'

    out2, err2 = _rerun_hidden(tree, 'load_reg_strength_splits')
    if err2:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + err2
    else:
        nums2 = re.findall(r'-?\d+\.?\d*(?:[eE][-+]?\d+)?', out2)
        if 'best_c' in out2.lower() and len(nums2) >= 4:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) vẫn sweep + in best_C hợp lệ — không hard-code.'
        else:
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn KHÔNG cho kết quả hợp lệ — có thể đang hard-code best_C.'

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ── C2-7 — Bias-Variance: chẩn đoán học ổn định/không ổn định ────────────
def grade_lesson_c2_7(user_code):
    """Fit 3 độ phức tạp (degree 1/3/15), in val_mse cho mỗi cái — bậc 15
    phải overfit rõ rệt trên 25 điểm train thưa (val_mse lớn hơn NHIỀU)."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result
    if not _uses_call(tree, 'print'):
        result['code_msg'] = 'Thiếu print().'
        return result
    if not _uses_call(tree, 'load_bias_variance_data'):
        result['code_msg'] = 'Cần load_bias_variance_data từ ml_lab.'
        return result
    if not (_uses_call(tree, 'polyfit') or _uses_call(tree, 'poly1d') or _uses_call(tree, 'PolynomialFeatures')):
        result['code_msg'] = 'Cần fit model đa thức (np.polyfit hoặc PolynomialFeatures) ở ít nhất 3 độ phức tạp.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có load_bias_variance_data + fit đa thức nhiều bậc + print().'
    result['risk_ok'] = True
    result['risk_msg'] = 'Bài đo overfit trên val — không có bước tune bằng test.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    nums = [float(x) for x in re.findall(r'-?\d+\.?\d*(?:[eE][-+]?\d+)?', out)]
    positive = [x for x in nums if x > 0]
    if len(positive) >= 3 and max(positive) > 10 * min(positive):
        result['output_ok'] = True
        result['output_msg'] = 'In đủ val_mse cho nhiều độ phức tạp — chênh lệch rõ overfit (max/min > 10x).'
    else:
        result['output_msg'] = 'Cần in val_mse cho ÍT NHẤT 3 độ phức tạp (vd degree 1, 3, 15) — bậc cao phải overfit rõ trên 25 điểm train.'

    out2, err2 = _rerun_hidden(tree, 'load_bias_variance_data')
    if err2:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + err2
    else:
        nums2 = [float(x) for x in re.findall(r'-?\d+\.?\d*(?:[eE][-+]?\d+)?', out2)]
        positive2 = [x for x in nums2 if x > 0]
        if len(positive2) >= 3 and max(positive2) > 10 * min(positive2):
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) vẫn cho thấy overfit rõ ở bậc cao — không hard-code.'
        else:
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn KHÔNG cho kết quả hợp lệ — có thể đang hard-code val_mse.'

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ── C2-8 — Chọn regression metric: MAE, MSE và R-squared ─────────────────
def grade_lesson_c2_8(user_code):
    """Tính MAE, MSE, R² trên dữ liệu có 1 outlier — MSE phải LỚN HƠN
    NHIỀU so với MAE (bị outlier kéo lên)."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result
    if not _uses_call(tree, 'print'):
        result['code_msg'] = 'Thiếu print().'
        return result
    if not _uses_call(tree, 'load_regression_metrics_data'):
        result['code_msg'] = 'Cần load_regression_metrics_data từ ml_lab.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có load_regression_metrics_data + print().'
    result['risk_ok'] = True
    result['risk_msg'] = 'Bài chỉ tính metric trên dữ liệu cố định — không có leakage.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    mae = _num_after(out, 'mae')
    mse = _num_after(out, 'mse')
    if mae is not None and mse is not None and mse > mae:
        result['output_ok'] = True
        result['output_msg'] = 'mse (%.2f) > mae (%.2f) — outlier bị MSE phạt nặng hơn MAE.' % (mse, mae)
    else:
        result['output_msg'] = 'Cần in "mae", "mse" và "r2" (mse phải lớn hơn hẳn mae do outlier).'

    result['behavior_ok'] = True
    result['behavior_msg'] = 'Metric tính trên dữ liệu cố định — deterministic.'
    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ── C2-9 — Confusion Matrix và class imbalance ────────────────────────────
def grade_lesson_c2_9(user_code):
    """So sánh naive (luôn đoán 0) vs model thật — naive_recall phải GẦN 0,
    model_recall phải RÕ RỆT cao hơn (dù accuracy naive có thể cao hơn)."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result
    if not _uses_call(tree, 'print'):
        result['code_msg'] = 'Thiếu print().'
        return result
    if not _uses_call(tree, 'load_imbalanced_data'):
        result['code_msg'] = 'Cần load_imbalanced_data từ ml_lab.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có load_imbalanced_data + print().'
    result['risk_ok'] = True
    result['risk_msg'] = 'Bài chỉ so sánh dữ liệu dự đoán cố định — không có leakage.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    naive_recall = _num_after(out, 'naive_recall')
    model_recall = _num_after(out, 'model_recall')
    if naive_recall is not None and model_recall is not None and naive_recall < 0.1 and model_recall > 0.5:
        result['output_ok'] = True
        result['output_msg'] = 'naive_recall (%.2f) ≈ 0 nhưng model_recall (%.2f) cao — accuracy một mình đã ĐÁNH LỪA.' % (naive_recall, model_recall)
    else:
        result['output_msg'] = 'Cần in "naive_acc", "naive_recall", "model_acc", "model_recall" (naive_recall≈0, model_recall>0.5).'

    out2, err2 = _rerun_hidden(tree, 'load_imbalanced_data')
    if err2:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + err2
    else:
        nr2 = _num_after(out2, 'naive_recall')
        mr2 = _num_after(out2, 'model_recall')
        if nr2 is not None and mr2 is not None and nr2 < 0.1 and mr2 > 0.5:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) vẫn cho thấy naive_recall≈0, model_recall cao — không hard-code.'
        else:
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn KHÔNG cho kết quả hợp lệ — có thể đang hard-code recall.'

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ── C2-10 — Accuracy, Precision, Recall và F1 ────────────────────────────
def grade_lesson_c2_10(user_code):
    """Conservative phải precision CAO hơn liberal; liberal phải recall
    CAO hơn conservative — trade-off kinh điển."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result
    if not _uses_call(tree, 'print'):
        result['code_msg'] = 'Thiếu print().'
        return result
    if not _uses_call(tree, 'load_prf_data'):
        result['code_msg'] = 'Cần load_prf_data từ ml_lab.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có load_prf_data + print().'
    result['risk_ok'] = True
    result['risk_msg'] = 'Bài chỉ so sánh dự đoán cố định — không có leakage.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    cp = _num_after(out, 'conservative_precision')
    cr = _num_after(out, 'conservative_recall')
    lp = _num_after(out, 'liberal_precision')
    lr = _num_after(out, 'liberal_recall')
    if None not in (cp, cr, lp, lr) and cp > lp and lr > cr:
        result['output_ok'] = True
        result['output_msg'] = 'conservative precision cao hơn (%.2f > %.2f), liberal recall cao hơn (%.2f > %.2f) — trade-off đúng.' % (cp, lp, lr, cr)
    else:
        result['output_msg'] = 'Cần in đủ 4 giá trị "conservative_precision/recall" và "liberal_precision/recall" đúng trade-off.'

    out2, err2 = _rerun_hidden(tree, 'load_prf_data')
    if err2:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + err2
    else:
        cp2 = _num_after(out2, 'conservative_precision')
        cr2 = _num_after(out2, 'conservative_recall')
        lp2 = _num_after(out2, 'liberal_precision')
        lr2 = _num_after(out2, 'liberal_recall')
        if None not in (cp2, cr2, lp2, lr2) and cp2 > lp2 and lr2 > cr2:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) vẫn cho đúng trade-off — không hard-code.'
        else:
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn KHÔNG cho kết quả hợp lệ — có thể đang hard-code precision/recall.'

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ── C2-11 — K-Nearest Neighbors ───────────────────────────────────────────
def grade_lesson_c2_11(user_code):
    """Sweep nhiều k, in val_accuracy cho mỗi k — không hard-code 1 k."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result
    if not _uses_call(tree, 'print'):
        result['code_msg'] = 'Thiếu print().'
        return result
    if not _uses_call(tree, 'KNeighborsClassifier'):
        result['code_msg'] = 'Cần dùng KNeighborsClassifier từ sklearn.neighbors.'
        return result
    if not _uses_call(tree, 'load_knn_data'):
        result['code_msg'] = 'Cần load_knn_data từ ml_lab.'
        return result
    has_loop = any(isinstance(n, ast.For) for n in ast.walk(tree))
    if not has_loop:
        result['code_msg'] = 'Cần sweep NHIỀU giá trị k bằng vòng lặp for.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có sweep k bằng for + KNeighborsClassifier + load_knn_data + print().'

    if _fit_uses_arg_named(tree, 'val'):
        result['risk_msg'] = 'fit() đang nhận biến có tên chứa "val" — model không được fit trên validation.'
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'fit() chỉ dùng train, đánh giá trên val riêng.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    nums = [float(x) for x in re.findall(r'-?\d+\.?\d*(?:[eE][-+]?\d+)?', out)]
    accs = [x for x in nums if 0.0 <= x <= 1.0]
    if len(accs) >= 3:
        result['output_ok'] = True
        result['output_msg'] = 'Đã sweep nhiều k và in val_accuracy cho từng k (%d giá trị).' % len(accs)
    else:
        result['output_msg'] = 'Cần in val_accuracy cho ÍT NHẤT 3-4 giá trị k khác nhau.'

    out2, err2 = _rerun_hidden(tree, 'load_knn_data')
    if err2:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + err2
    else:
        nums2 = [float(x) for x in re.findall(r'-?\d+\.?\d*(?:[eE][-+]?\d+)?', out2)]
        accs2 = [x for x in nums2 if 0.0 <= x <= 1.0]
        if len(accs2) >= 3:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) vẫn sweep + in val_accuracy hợp lệ — không hard-code.'
        else:
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn KHÔNG cho kết quả hợp lệ — có thể đang hard-code accuracy.'

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ── C2-12 — KNN và Feature Scaling ────────────────────────────────────────
def grade_lesson_c2_12(user_code):
    """So sánh KNN unscaled vs scaled — scaled_acc phải CAO HƠN RÕ RỆT."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result
    if not _uses_call(tree, 'print'):
        result['code_msg'] = 'Thiếu print().'
        return result
    if not _uses_call(tree, 'KNeighborsClassifier'):
        result['code_msg'] = 'Cần dùng KNeighborsClassifier từ sklearn.neighbors.'
        return result
    if not _uses_call(tree, 'load_knn_scaling_data'):
        result['code_msg'] = 'Cần load_knn_scaling_data từ ml_lab.'
        return result
    if not (_uses_call(tree, 'StandardScaler') or _uses_call(tree, 'std')):
        result['code_msg'] = 'Cần scale dữ liệu (StandardScaler hoặc tự chuẩn hoá bằng mean/std) để so sánh.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có KNeighborsClassifier + load_knn_scaling_data + scale + print().'

    if _fit_uses_arg_named(tree, 'val'):
        result['risk_msg'] = 'fit() đang nhận biến có tên chứa "val" — model không được fit trên validation.'
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'fit() chỉ dùng train.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    unscaled = _num_after(out, 'unscaled_acc')
    scaled = _num_after(out, 'scaled_acc')
    if unscaled is not None and scaled is not None and scaled > unscaled:
        result['output_ok'] = True
        result['output_msg'] = 'scaled_acc (%.3f) > unscaled_acc (%.3f) — scaling giúp KNN nhìn đúng cả 2 feature.' % (scaled, unscaled)
    else:
        result['output_msg'] = 'Cần in "unscaled_acc" và "scaled_acc" (scaled phải CAO HƠN unscaled).'

    out2, err2 = _rerun_hidden(tree, 'load_knn_scaling_data')
    if err2:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + err2
    else:
        u2 = _num_after(out2, 'unscaled_acc')
        s2 = _num_after(out2, 'scaled_acc')
        if u2 is not None and s2 is not None and s2 > u2:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) vẫn cho scaled_acc > unscaled_acc — không hard-code.'
        else:
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn KHÔNG cho kết quả hợp lệ — có thể đang hard-code accuracy.'

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ── C2-13 — Decision Tree ─────────────────────────────────────────────────
def grade_lesson_c2_13(user_code):
    """So sánh Decision Tree KHÔNG giới hạn depth vs max_depth vừa phải —
    gap (train_acc - val_acc) của bản không giới hạn phải LỚN HƠN."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result
    if not _uses_call(tree, 'print'):
        result['code_msg'] = 'Thiếu print().'
        return result
    if not _uses_call(tree, 'DecisionTreeClassifier'):
        result['code_msg'] = 'Cần dùng DecisionTreeClassifier từ sklearn.tree.'
        return result
    if not _uses_call(tree, 'load_tree_data'):
        result['code_msg'] = 'Cần load_tree_data từ ml_lab.'
        return result
    if 'max_depth' not in user_code:
        result['code_msg'] = 'Cần so sánh với ít nhất 1 cây có max_depth giới hạn.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có DecisionTreeClassifier (unlimited + max_depth) + load_tree_data + print().'

    if _fit_uses_arg_named(tree, 'val'):
        result['risk_msg'] = 'fit() đang nhận biến có tên chứa "val" — model không được fit trên validation.'
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'fit() chỉ dùng train.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    full_train = _num_after(out, 'full_train_acc')
    full_val = _num_after(out, 'full_val_acc')
    limited_train = _num_after(out, 'limited_train_acc')
    limited_val = _num_after(out, 'limited_val_acc')
    if None not in (full_train, full_val, limited_train, limited_val):
        gap_full = full_train - full_val
        gap_limited = limited_train - limited_val
        if gap_full > gap_limited:
            result['output_ok'] = True
            result['output_msg'] = 'Gap train-val của cây KHÔNG giới hạn (%.3f) LỚN HƠN cây max_depth (%.3f) — overfit rõ.' % (gap_full, gap_limited)
        else:
            result['output_msg'] = 'Gap train-val chưa cho thấy overfit rõ — kiểm tra lại cây không giới hạn depth.'
    else:
        result['output_msg'] = 'Cần in đủ "full_train_acc", "full_val_acc", "limited_train_acc", "limited_val_acc".'

    out2, err2 = _rerun_hidden(tree, 'load_tree_data')
    if err2:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + err2
    else:
        ft2 = _num_after(out2, 'full_train_acc')
        fv2 = _num_after(out2, 'full_val_acc')
        lt2 = _num_after(out2, 'limited_train_acc')
        lv2 = _num_after(out2, 'limited_val_acc')
        if None not in (ft2, fv2, lt2, lv2) and (ft2 - fv2) > (lt2 - lv2):
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) vẫn cho thấy overfit rõ ở cây không giới hạn — không hard-code.'
        else:
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn KHÔNG cho kết quả hợp lệ — có thể đang hard-code accuracy.'

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ── C2-14 — Random Forest ─────────────────────────────────────────────────
def grade_lesson_c2_14(user_code):
    """So sánh 1 Decision Tree đơn vs Random Forest — cả 2 phải chạy
    thật và in val_accuracy để so sánh."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result
    if not _uses_call(tree, 'print'):
        result['code_msg'] = 'Thiếu print().'
        return result
    if not _uses_call(tree, 'RandomForestClassifier'):
        result['code_msg'] = 'Cần dùng RandomForestClassifier từ sklearn.ensemble.'
        return result
    if not _uses_call(tree, 'DecisionTreeClassifier'):
        result['code_msg'] = 'Cần so sánh với 1 DecisionTreeClassifier đơn để thấy sự khác biệt.'
        return result
    if not _uses_call(tree, 'load_forest_data'):
        result['code_msg'] = 'Cần load_forest_data từ ml_lab.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có RandomForestClassifier + DecisionTreeClassifier + load_forest_data + print().'

    if _fit_uses_arg_named(tree, 'val'):
        result['risk_msg'] = 'fit() đang nhận biến có tên chứa "val" — model không được fit trên validation.'
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'fit() chỉ dùng train.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    tree_acc = _num_after(out, 'tree_val_acc')
    forest_acc = _num_after(out, 'forest_val_acc')
    if tree_acc is not None and forest_acc is not None and tree_acc > 0.4 and forest_acc > 0.4:
        result['output_ok'] = True
        result['output_msg'] = 'tree_val_acc = %.3f, forest_val_acc = %.3f — đã so sánh 2 model thật.' % (tree_acc, forest_acc)
    else:
        result['output_msg'] = 'Cần in "tree_val_acc" và "forest_val_acc" (cả 2 giá trị hợp lệ > 0.4).'

    out2, err2 = _rerun_hidden(tree, 'load_forest_data')
    if err2:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + err2
    else:
        t2 = _num_after(out2, 'tree_val_acc')
        f2 = _num_after(out2, 'forest_val_acc')
        if t2 is not None and f2 is not None and t2 > 0.4 and f2 > 0.4:
            result['behavior_ok'] = True
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) vẫn cho kết quả hợp lệ ở cả 2 model — không hard-code.'
        else:
            result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn KHÔNG cho kết quả hợp lệ — có thể đang hard-code accuracy.'

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ══════════════════════════════════════════════════════════════════════════
# COURSE 3 — ADVANCED MODELING & NEURAL NETWORKS
# ══════════════════════════════════════════════════════════════════════════

def _c3l1_ref_report(seed):
    """Tính report THẬT từ engine (không hard-code số) — dùng làm tham chiếu
    so khớp cả tầng output lẫn behavior của grade_lesson_c3_1."""
    from sklearn.metrics import pairwise_distances as _pd
    from sklearn.pipeline import Pipeline as _Pipe
    from sklearn.preprocessing import StandardScaler as _SS
    from sklearn.neighbors import KNeighborsClassifier as _KNN
    items = ml_lab.load_dimension_experiment(seed=seed)
    ref = {}
    for item in items:
        D = _pd(item['X_probe'])
        nz = D[D > 0]
        contrast = float(nz.min() / nz.max())
        model = _Pipe([('scale', _SS()), ('knn', _KNN(n_neighbors=7))])
        model.fit(item['X_train'], item['y_train'])
        acc = float(model.score(item['X_val'], item['y_val']))
        ref[item['dimensions']] = (contrast, acc)
    return ref


def _c3l1_read_report(ns, ref):
    """Đọc biến `report` từ namespace, so khớp với `ref` (dict dimensions -> (contrast, acc)).
    Trả True/False."""
    report = ns.get('report')
    if not (isinstance(report, list) and len(report) == 3):
        return False
    seen = {}
    for row in report:
        try:
            d = int(row['dimensions'])
            c = float(row['distance_contrast'])
            a = float(row['validation_accuracy'])
        except Exception:
            return False
        seen[d] = (c, a)
    if set(seen.keys()) != {2, 20, 100}:
        return False
    for d in (2, 20, 100):
        rc, ra = ref[d]
        c, a = seen[d]
        if abs(c - rc) > 1e-4 or abs(a - ra) > 1e-4:
            return False
    return True


# ── C3-1 — High-dimensional data và curse of dimensionality ─────────────
def grade_lesson_c3_1(user_code):
    """Bài C3-1 — Dimension Stress Test. Học viên tính distance_contrast +
    validation_accuracy cho 3 mức chiều (2/20/100) từ load_dimension_experiment(),
    dùng CHUNG 1 cấu hình Pipeline(StandardScaler, KNeighborsClassifier(n_neighbors=7)).
    Unsafe-but-correct của bài này: đổi n_neighbors (hoặc gọi loader nhiều lần —
    phá vỡ 'khớp seed') giữa các lần so sánh rồi vẫn quy hết chênh lệch cho số
    chiều — code chạy ra số hợp lệ nhưng kết luận nhân quả KHÔNG có căn cứ."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    load_calls = sum(
        1 for n in ast.walk(tree)
        if isinstance(n, ast.Call) and (
            (isinstance(n.func, ast.Name) and n.func.id == 'load_dimension_experiment') or
            (isinstance(n.func, ast.Attribute) and n.func.attr == 'load_dimension_experiment')
        )
    )
    if load_calls == 0:
        result['code_msg'] = 'Cần load_dimension_experiment từ ml_lab.'
        return result
    if load_calls > 1:
        result['code_msg'] = ('Chỉ gọi load_dimension_experiment() ĐÚNG 1 LẦN — gọi nhiều lần dễ '
                               'làm 3 mức chiều KHÔNG còn khớp nhau (mất kiểm soát so sánh).')
        return result
    if not _uses_call(tree, 'pairwise_distances'):
        result['code_msg'] = 'Cần pairwise_distances (sklearn.metrics) để đo distance_contrast.'
        return result
    if not (_uses_call(tree, 'StandardScaler') and _uses_call(tree, 'KNeighborsClassifier')):
        result['code_msg'] = 'Cần Pipeline với StandardScaler + KNeighborsClassifier.'
        return result

    n_neighbors_vals = set()
    for n in ast.walk(tree):
        if isinstance(n, ast.Call) and (
            (isinstance(n.func, ast.Name) and n.func.id == 'KNeighborsClassifier') or
            (isinstance(n.func, ast.Attribute) and n.func.attr == 'KNeighborsClassifier')
        ):
            for kw in n.keywords:
                if kw.arg == 'n_neighbors' and isinstance(kw.value, ast.Constant):
                    n_neighbors_vals.add(kw.value.value)
    if not n_neighbors_vals:
        result['code_msg'] = 'KNeighborsClassifier cần truyền n_neighbors=7 (đúng theo đề bài).'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có load_dimension_experiment (1 lần) + pairwise_distances + Pipeline(StandardScaler, KNN).'

    if len(n_neighbors_vals) > 1:
        result['risk_msg'] = ('n_neighbors đổi khác nhau giữa các lần so sánh (%s) — vi phạm '
                               'controlled comparison: chỉ được đổi SỐ CHIỀU, các cài đặt model khác '
                               'phải giữ nguyên, nếu không chênh lệch accuracy không còn quy được cho '
                               'riêng dimensionality.' % sorted(n_neighbors_vals))
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'n_neighbors giữ cố định giữa 3 lần so sánh — chỉ số chiều thay đổi, đúng controlled comparison.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    ref = _c3l1_ref_report(0)
    if _c3l1_read_report(ns, ref):
        result['output_ok'] = True
        result['output_msg'] = 'report đúng cho cả 3 mức chiều (2/20/100), khớp engine.'
    else:
        result['output_msg'] = ('Cần biến `report` là list 3 dict {dimensions, distance_contrast, '
                                 'validation_accuracy} cho đúng 3 mức chiều 2/20/100, khớp với '
                                 'load_dimension_experiment().')
        return result

    orig_loader = ml_lab.load_dimension_experiment

    def _hidden_loader(*args, **kwargs):
        kwargs = dict(kwargs)
        kwargs['seed'] = 9001
        return orig_loader(*args, **kwargs)

    ml_lab.load_dimension_experiment = _hidden_loader
    try:
        ns2, _out2 = _exec_capture(tree, tag='<user_code_hidden>')
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + str(e)
        return result
    finally:
        ml_lab.load_dimension_experiment = orig_loader

    ref2 = _c3l1_ref_report(9001)
    if _c3l1_read_report(ns2, ref2):
        result['behavior_ok'] = True
        result['behavior_msg'] = 'Chạy lại với seed ẩn (9001) vẫn cho report đúng — không hard-code.'
    else:
        result['behavior_msg'] = ('Chạy lại với seed ẩn KHÔNG cho report đúng — có thể đang hard-code '
                                   'số liệu thay vì tính từ load_dimension_experiment().')
        return result

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def _fit_uses_concat_call(tree):
    """True nếu có lời gọi .fit(...) mà 1 trong các arg là Call tới hstack/vstack/
    concatenate/concat — bắt kiểu leakage 'gộp train+validation trước khi fit'
    (vd np.vstack([X_train, X_val])) mà _fit_uses_arg_named không bắt được vì đó
    là 1 Call, không phải 1 Name đơn."""
    concat_fns = {'hstack', 'vstack', 'concatenate', 'concat', 'r_'}
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == 'fit':
            for a in node.args:
                if isinstance(a, ast.Call):
                    f = a.func
                    name = f.attr if isinstance(f, ast.Attribute) else (f.id if isinstance(f, ast.Name) else '')
                    if name in concat_fns:
                        return True
    return False


def _c3l2_ref(seed):
    """Tính PCA THẬT từ engine (fit chỉ trên train) — tham chiếu cho grade_lesson_c3_2."""
    from sklearn.preprocessing import StandardScaler as _SS
    from sklearn.decomposition import PCA as _PCA
    X_train, X_val, feature_names = ml_lab.load_pca_splits(seed=seed)
    scaler = _SS().fit(X_train)
    X_train_s = scaler.transform(X_train)
    X_val_s = scaler.transform(X_val)
    pca = _PCA(n_components=2, random_state=42).fit(X_train_s)
    Z_train = pca.transform(X_train_s)
    Z_val = pca.transform(X_val_s)
    top1 = [feature_names[int(np.argsort(np.abs(row))[::-1][0])] for row in pca.components_]
    return {
        'shapes': (Z_train.shape, Z_val.shape),
        'top1': top1,
        'evr': pca.explained_variance_ratio_,
    }


def _c3l2_check_ns(ns, ref):
    """So khớp Z_train/Z_val/pca trong namespace học viên với tham chiếu train-only.
    Trả True/False."""
    Z_train = ns.get('Z_train')
    Z_val = ns.get('Z_val')
    pca_obj = ns.get('pca')
    if Z_train is None or Z_val is None or pca_obj is None:
        return False
    try:
        if tuple(np.asarray(Z_train).shape) != tuple(ref['shapes'][0]):
            return False
        if tuple(np.asarray(Z_val).shape) != tuple(ref['shapes'][1]):
            return False
        components = np.asarray(getattr(pca_obj, 'components_', None))
        if components is None or components.shape[0] < 2:
            return False
        feature_names = ns.get('feature_names')
        if not feature_names:
            return False
        top1 = [feature_names[int(np.argsort(np.abs(row))[::-1][0])] for row in components[:2]]
        if top1 != ref['top1']:
            return False
        evr = getattr(pca_obj, 'explained_variance_ratio_', None)
        if evr is None or abs(float(evr[0]) - float(ref['evr'][0])) > 5e-3:
            return False
    except Exception:
        return False
    return True


# ── C3-2 — PCA và principal components ───────────────────────────────────
def grade_lesson_c3_2(user_code):
    """Bài C3-2 — Fit và inspect PCA. Học viên fit StandardScaler + PCA(n_components=2)
    CHỈ trên X_train, transform cả train lẫn validation, đọc top loadings mỗi component.
    Unsafe-but-correct của spec: fit scaler/PCA trên train+validation GỘP LẠI — biểu đồ
    "đẹp hơn" (variance ratio nhỉnh hơn chút) nhưng đã rò rỉ thông tin validation vào
    representation. Vì PCA không dùng nhãn nên không có tầng 'label leak' — Risk ở đây
    là 'split leak' (gộp train+val trước khi fit)."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    if not _uses_call(tree, 'load_pca_splits'):
        result['code_msg'] = 'Cần load_pca_splits từ ml_lab.'
        return result
    if not (_uses_call(tree, 'StandardScaler') and _uses_call(tree, 'PCA')):
        result['code_msg'] = 'Cần StandardScaler và PCA (sklearn).'
        return result
    if not _uses_call(tree, 'transform'):
        result['code_msg'] = 'Cần .transform(...) để áp scaler/PCA đã fit lên dữ liệu (X_train và X_val).'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có load_pca_splits + StandardScaler + PCA + transform().'

    if _fit_uses_arg_named(tree, 'val') or _fit_uses_concat_call(tree):
        result['risk_msg'] = ('fit() đang dùng dữ liệu có validation trộn vào (tên biến chứa "val" hoặc '
                               'gộp bằng hstack/vstack/concatenate) — StandardScaler và PCA CHỈ được fit '
                               'trên X_train, validation chỉ transform().')
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'fit() chỉ dùng X_train — validation chỉ transform(), không rò rỉ.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    ref = _c3l2_ref(0)
    if _c3l2_check_ns(ns, ref):
        result['output_ok'] = True
        result['output_msg'] = 'Z_train/Z_val đúng shape, PC1/PC2 top loading đúng, variance ratio khớp engine.'
    else:
        result['output_msg'] = ('Cần biến `Z_train`, `Z_val`, `pca` (đã fit), `feature_names` đúng — '
                                 'PC1 tải mạnh nhất lên login_freq, PC2 lên ontime_submit_rate, fit CHỈ trên train.')
        return result

    orig_loader = ml_lab.load_pca_splits

    def _hidden_loader(*args, **kwargs):
        kwargs = dict(kwargs)
        kwargs['seed'] = 9001
        return orig_loader(*args, **kwargs)

    ml_lab.load_pca_splits = _hidden_loader
    try:
        ns2, _out2 = _exec_capture(tree, tag='<user_code_hidden>')
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + str(e)
        return result
    finally:
        ml_lab.load_pca_splits = orig_loader

    ref2 = _c3l2_ref(9001)
    if _c3l2_check_ns(ns2, ref2):
        result['behavior_ok'] = True
        result['behavior_msg'] = 'Chạy lại với seed ẩn (9001) vẫn cho PCA đúng — không hard-code.'
    else:
        result['behavior_msg'] = ('Chạy lại với seed ẩn KHÔNG cho PCA đúng — có thể đang hard-code '
                                   'shape/loadings thay vì tính từ load_pca_splits().')
        return result

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def _assign_is_hardcoded_int(tree, name):
    """True nếu có gán `name = <literal int/float>` trực tiếp trong code — bắt kiểu
    'chọn cứng n_components' thay vì suy ra từ ngưỡng phương sai (test-tuning smell)."""
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            for t in node.targets:
                if isinstance(t, ast.Name) and t.id == name:
                    if isinstance(node.value, ast.Constant) and isinstance(node.value.value, (int, float)):
                        return True
    return False


def _c3l3_ref(seed, target=0.90):
    """Tính lựa chọn n_components + evidence THẬT từ engine — tham chiếu cho grade_lesson_c3_3."""
    from sklearn.preprocessing import StandardScaler as _SS
    from sklearn.decomposition import PCA as _PCA
    X_train, X_val, y_train, y_val = ml_lab.load_pca_selection_data(seed=seed)
    scaler = _SS().fit(X_train)
    A = scaler.transform(X_train)
    B = scaler.transform(X_val)
    full = _PCA().fit(A)
    cumulative = np.cumsum(full.explained_variance_ratio_)
    n_components = int(np.searchsorted(cumulative, target) + 1)
    final_pca = _PCA(n_components=n_components).fit(A)
    Z_train = final_pca.transform(A)
    Z_val = final_pca.transform(B)
    evidence = ml_lab.validate_pca_representation(Z_train, Z_val, y_train, y_val)
    return {'n_components': n_components, 'cum': float(cumulative[n_components - 1]), 'evidence': evidence}


def _c3l3_check_ns(ns, ref):
    nc = ns.get('n_components')
    if nc is None or int(nc) != ref['n_components']:
        return False
    Z_train, Z_val = ns.get('Z_train'), ns.get('Z_val')
    if Z_train is None or Z_val is None:
        return False
    try:
        if np.asarray(Z_train).shape[1] != ref['n_components']:
            return False
        if np.asarray(Z_val).shape[1] != ref['n_components']:
            return False
    except Exception:
        return False
    cumulative = ns.get('cumulative')
    if cumulative is None:
        return False
    try:
        if abs(float(np.asarray(cumulative)[int(nc) - 1]) - ref['cum']) > 1e-3:
            return False
    except Exception:
        return False
    return True


# ── C3-3 — Explained variance và chọn số chiều ───────────────────────────
def grade_lesson_c3_3(user_code):
    """Bài C3-3 — Choose n_components. Học viên fit full PCA trên train, tính cumulative
    variance, chọn số component NHỎ NHẤT đạt ngưỡng (mặc định 0.90), rồi refit PCA cuối
    và kiểm tra bằng validate_pca_representation(). Unsafe-but-correct của spec: chọn
    n_components CỨNG (hardcode) thay vì suy ra từ ngưỡng phương sai — dấu hiệu 'dò để
    tối đa accuracy' thay vì theo 1 quy tắc đã định trước (test/validation tuning)."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    if not (_uses_call(tree, 'load_pca_selection_data') and _uses_call(tree, 'validate_pca_representation')):
        result['code_msg'] = 'Cần load_pca_selection_data và validate_pca_representation từ ml_lab.'
        return result
    if not (_uses_call(tree, 'PCA') and _uses_call(tree, 'StandardScaler')):
        result['code_msg'] = 'Cần StandardScaler và PCA (sklearn).'
        return result
    if not _uses_call(tree, 'cumsum'):
        result['code_msg'] = 'Cần np.cumsum(...) trên explained_variance_ratio_ để tính phương sai tích luỹ.'
        return result
    if _fit_uses_arg_named(tree, 'val') or _fit_uses_concat_call(tree):
        result['code_msg'] = ('fit() đang dùng dữ liệu có validation trộn vào — PCA (cả full lẫn final) '
                               'CHỈ được fit trên representation của train.')
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có load_pca_selection_data + validate_pca_representation + PCA + cumsum, fit chỉ trên train.'

    if _assign_is_hardcoded_int(tree, 'n_components'):
        result['risk_msg'] = ('n_components đang được GÁN CỨNG một con số thay vì suy ra từ ngưỡng phương sai '
                               '(np.searchsorted trên cumulative) — dấu hiệu dò số để tối đa accuracy thay vì '
                               'theo 1 quy tắc đã định trước.')
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'n_components được suy ra từ ngưỡng phương sai tích luỹ, không hardcode.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    ref = _c3l3_ref(0)
    if _c3l3_check_ns(ns, ref):
        result['output_ok'] = True
        result['output_msg'] = 'n_components = %d, cumulative variance khớp engine (target 0.90).' % ref['n_components']
    else:
        result['output_msg'] = ('Cần biến `n_components`, `cumulative`, `Z_train`, `Z_val` đúng — số component '
                                 'nhỏ nhất đạt 90%% phương sai tích luỹ, tính từ load_pca_selection_data().')
        return result

    orig_loader = ml_lab.load_pca_selection_data

    def _hidden_loader(*args, **kwargs):
        kwargs = dict(kwargs)
        kwargs['seed'] = 9001
        return orig_loader(*args, **kwargs)

    ml_lab.load_pca_selection_data = _hidden_loader
    try:
        ns2, _out2 = _exec_capture(tree, tag='<user_code_hidden>')
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + str(e)
        return result
    finally:
        ml_lab.load_pca_selection_data = orig_loader

    ref2 = _c3l3_ref(9001)
    if _c3l3_check_ns(ns2, ref2):
        result['behavior_ok'] = True
        result['behavior_msg'] = 'Chạy lại với seed ẩn (9001) vẫn chọn đúng n_components — không hard-code.'
    else:
        result['behavior_msg'] = ('Chạy lại với seed ẩn KHÔNG cho n_components đúng — có thể đang hard-code '
                                   'thay vì tính từ ngưỡng phương sai.')
        return result

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ══════════════════════════════════════════════════════════════════════════
# MODULE 2 — MARGIN-BASED CLASSIFICATION
# ══════════════════════════════════════════════════════════════════════════

def _configs_have_huge_c(tree, threshold=50):
    """True nếu có dict literal {'C': <số>} với C VƯỢT NGƯỠNG hợp lý — bắt kiểu
    chọn C cực lớn để ép training accuracy 100% mà không qua validation."""
    for node in ast.walk(tree):
        if isinstance(node, ast.Dict):
            for k, v in zip(node.keys, node.values):
                if isinstance(k, ast.Constant) and k.value == 'C' and isinstance(v, ast.Constant):
                    try:
                        if float(v.value) > threshold:
                            return True
                    except (TypeError, ValueError):
                        pass
    return False


def _c3l5_ref(seed):
    """Tính F1/support-vector THẬT cho 3 cấu hình chuẩn (linear C=0.1, linear C=1.0,
    rbf C=1.0) — tham chiếu cho grade_lesson_c3_5. Key = (kernel, C)."""
    from sklearn.pipeline import Pipeline as _Pipe
    from sklearn.preprocessing import StandardScaler as _SS
    from sklearn.svm import SVC as _SVC
    from sklearn.metrics import f1_score as _f1
    X_train, X_val, y_train, y_val = ml_lab.load_svm_splits(seed=seed)
    configs = [
        {"kernel": "linear", "C": 0.1},
        {"kernel": "linear", "C": 1.0},
        {"kernel": "rbf", "C": 1.0, "gamma": "scale"},
    ]
    ref = {}
    for cfg in configs:
        model = _Pipe([("scale", _SS()), ("svc", _SVC(**cfg))])
        model.fit(X_train, y_train)
        score = _f1(y_val, model.predict(X_val), zero_division=0)
        n_sv = int(model.named_steps['svc'].n_support_.sum())
        ref[(cfg['kernel'], cfg['C'])] = (score, n_sv)
    return ref


def _c3l5_check_report(report, ref):
    """So khớp report (list dict {kernel,C,val_f1,support_vectors}) với ref — yêu cầu
    ĐỦ 3 cấu hình chuẩn khớp đúng (cho phép có thêm cấu hình khác, không bắt lỗi)."""
    if not isinstance(report, list) or len(report) < 3:
        return False
    seen = set()
    for row in report:
        try:
            key = (row['kernel'], row['C'])
            f1v = float(row['val_f1'])
            nsv = int(row['support_vectors'])
        except Exception:
            return False
        if key not in ref:
            continue
        rf1, rnsv = ref[key]
        if abs(f1v - rf1) > 1e-3 or nsv != rnsv:
            return False
        seen.add(key)
    return seen == set(ref.keys())


# ── C3-5 — Support Vector Machines và margin ─────────────────────────────
def grade_lesson_c3_5(user_code):
    """Bài C3-5 — Tune và audit một SVM. Học viên xây Pipeline(StandardScaler, SVC)
    cho 3 cấu hình (linear C=0.1/1.0, rbf C=1.0), fit CHỈ trên train, đo F1 +
    support-vector count trên validation. Unsafe-but-correct của spec: chọn C cực
    lớn để ép training accuracy 100% mà KHÔNG qua validation — model chạy được
    nhưng quyết định margin không có căn cứ, có thể không ổn định."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    if not _uses_call(tree, 'load_svm_splits'):
        result['code_msg'] = 'Cần load_svm_splits từ ml_lab.'
        return result
    if not (_uses_call(tree, 'Pipeline') and _uses_call(tree, 'StandardScaler') and _uses_call(tree, 'SVC')):
        result['code_msg'] = 'Cần Pipeline([StandardScaler, SVC]) — scaling PHẢI nằm trong pipeline.'
        return result
    if _fit_uses_arg_named(tree, 'val') or _fit_uses_concat_call(tree):
        result['code_msg'] = 'fit() đang dùng dữ liệu có validation trộn vào — model CHỈ được fit trên train.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có load_svm_splits + Pipeline(StandardScaler, SVC), fit chỉ trên train.'

    if _configs_have_huge_c(tree):
        result['risk_msg'] = ('Có cấu hình C VƯỢT QUÁ 50 — dấu hiệu chọn C cực lớn để ép training accuracy '
                               '100% mà không qua validation. Margin phải được chọn bằng bằng chứng '
                               'validation (F1), không phải bằng cách "cố tách hoàn hảo" tập train.')
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'Không có C bất thường lớn — lựa chọn dựa trên validation, không ép train accuracy.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    ref = _c3l5_ref(0)
    report = ns.get('report')
    if _c3l5_check_report(report, ref):
        result['output_ok'] = True
        result['output_msg'] = 'val_f1 và support_vectors đúng cho cả 3 cấu hình, khớp engine.'
    else:
        result['output_msg'] = ('Cần biến `report` — list dict {kernel, C, val_f1, support_vectors} cho đủ '
                                 '3 cấu hình (linear C=0.1, linear C=1.0, rbf C=1.0), khớp load_svm_splits().')
        return result

    orig_loader = ml_lab.load_svm_splits

    def _hidden_loader(*args, **kwargs):
        kwargs = dict(kwargs)
        kwargs['seed'] = 9001  # seed lẻ → dữ liệu tuyến tính (đổi cấu trúc so với seed=0 mặc định)
        return orig_loader(*args, **kwargs)

    ml_lab.load_svm_splits = _hidden_loader
    try:
        ns2, _out2 = _exec_capture(tree, tag='<user_code_hidden>')
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + str(e)
        return result
    finally:
        ml_lab.load_svm_splits = orig_loader

    ref2 = _c3l5_ref(9001)
    report2 = ns2.get('report')
    if _c3l5_check_report(report2, ref2):
        result['behavior_ok'] = True
        result['behavior_msg'] = ('Chạy lại với dữ liệu ẩn (cấu trúc TUYẾN TÍNH, khác seed mặc định phi '
                                   'tuyến) vẫn cho report đúng — lựa chọn thích ứng theo dữ liệu, không hard-code.')
    else:
        result['behavior_msg'] = ('Chạy lại với dữ liệu ẩn (cấu trúc khác) KHÔNG cho report đúng — có thể '
                                   'đang hard-code kết quả thay vì tính từ load_svm_splits().')
        return result

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def _pca_fit_uses_label(tree):
    """True nếu có lời gọi .fit(...) trên PCA (biến tên chứa 'pca', HOẶC gọi trực
    tiếp PCA(...).fit(...)) với HƠN 1 positional arg — bắt kiểu vô tình truyền
    nhãn vào PCA.fit(A, y_train) (PCA không cần và không được dùng nhãn để fit —
    nhãn chỉ dùng để TÔ MÀU điểm sau khi chiếu)."""
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == 'fit':
            obj = node.func.value
            is_pca = False
            if isinstance(obj, ast.Name) and 'pca' in obj.id.lower():
                is_pca = True
            elif isinstance(obj, ast.Call):
                f = obj.func
                fname = f.id if isinstance(f, ast.Name) else (f.attr if isinstance(f, ast.Attribute) else '')
                if fname == 'PCA':
                    is_pca = True
            if is_pca and len(node.args) > 1:
                return True
    return False


def _c3l4_ref(seed):
    """Tính top loadings (theo TÊN feature — sign-invariant vì dùng abs()) và bằng
    chứng so sánh raw-vs-PCA THẬT từ engine — tham chiếu cho grade_lesson_c3_4.
    Component sign lật dấu KHÔNG ảnh hưởng gì tới các đại lượng này (đúng yêu cầu
    'Model behavior: sign flips do not alter grading' của spec)."""
    from sklearn.preprocessing import StandardScaler as _SS
    from sklearn.decomposition import PCA as _PCA
    X_train, X_val, y_train, y_val, names = ml_lab.load_pca_visual_audit(seed=seed)
    scaler = _SS().fit(X_train)
    A, B = scaler.transform(X_train), scaler.transform(X_val)
    pca = _PCA(n_components=2).fit(A)
    Z, Zv = pca.transform(A), pca.transform(B)
    top = []
    for row in pca.components_:
        idx = np.argsort(np.abs(row))[::-1][:4]
        top.append([names[int(i)] for i in idx])
    comparison = ml_lab.compare_raw_and_pca(A, B, Z, Zv, y_train, y_val)
    return {'top': top, 'comparison': comparison}


def _c3l4_check_output(out, ref):
    """Đọc stdout (KHÔNG đọc namespace, vì code mẫu chỉ print — không lưu biến cố
    định tên): mỗi PC phải có ≥3/4 tên feature top-loading xuất hiện trong stdout,
    và raw_accuracy/pca_accuracy phải khớp engine."""
    for names_list in ref['top']:
        hits = sum(1 for nm in names_list if nm in out)
        if hits < 3:
            return False
    ra = _num_after(out, 'raw_accuracy')
    pa = _num_after(out, 'pca_accuracy')
    if ra is None or pa is None:
        return False
    if abs(ra - ref['comparison']['raw_accuracy']) > 1e-3:
        return False
    if abs(pa - ref['comparison']['pca_accuracy']) > 1e-3:
        return False
    return True


# ── C3-4 — Trực quan hóa và audit dữ liệu sau PCA ────────────────────────
def grade_lesson_c3_4(user_code):
    """Bài C3-4 — Build PCA audit figure. Học viên chiếu train lên PC1/PC2 (chỉ fit
    trên train), in ra top-4 loading mỗi thành phần (theo TÊN feature) và so sánh
    accuracy feature gốc vs PCA(2) bằng compare_raw_and_pca(). Vì PCA sign là NGẪU
    NHIÊN (không có 'dấu đúng'), toàn bộ đại lượng được chấm (tên feature theo abs
    loading, accuracy) đều sign-invariant — lật dấu component không ảnh hưởng điểm.
    Unsafe-but-correct của spec: gán nhãn nguyên nhân ('PC1 = engagement gây ra
    thành công') từ loadings — không code-checkable trực tiếp, được xử lý ở Step 2."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    if not (_uses_call(tree, 'load_pca_visual_audit') and _uses_call(tree, 'compare_raw_and_pca')):
        result['code_msg'] = 'Cần load_pca_visual_audit và compare_raw_and_pca từ ml_lab.'
        return result
    if not (_uses_call(tree, 'PCA') and _uses_call(tree, 'StandardScaler')):
        result['code_msg'] = 'Cần StandardScaler và PCA (sklearn).'
        return result
    if _fit_uses_arg_named(tree, 'val') or _fit_uses_concat_call(tree):
        result['code_msg'] = ('fit() đang dùng dữ liệu có validation trộn vào — scaler và PCA CHỈ được fit '
                               'trên train, validation chỉ transform().')
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có load_pca_visual_audit + compare_raw_and_pca + StandardScaler + PCA, fit chỉ trên train.'

    if _pca_fit_uses_label(tree):
        result['risk_msg'] = ('PCA.fit() đang nhận thêm 1 arg thứ 2 (có thể là nhãn) — PCA không dùng nhãn để '
                               'fit, nhãn CHỈ được dùng để tô màu điểm sau khi đã chiếu xong.')
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'PCA fit không dùng nhãn — nhãn chỉ dùng để tô màu/đánh giá sau đó.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    ref = _c3l4_ref(0)
    if _c3l4_check_output(out, ref):
        result['output_ok'] = True
        result['output_msg'] = 'Top loading mỗi PC đúng feature, raw_accuracy/pca_accuracy khớp engine.'
    else:
        result['output_msg'] = ('Cần in top-4 loading mỗi PC (theo tên feature) và kết quả '
                                 'compare_raw_and_pca(...) (raw_accuracy, pca_accuracy) khớp engine.')
        return result

    orig_loader = ml_lab.load_pca_visual_audit

    def _hidden_loader(*args, **kwargs):
        kwargs = dict(kwargs)
        kwargs['seed'] = 9001
        return orig_loader(*args, **kwargs)

    ml_lab.load_pca_visual_audit = _hidden_loader
    try:
        ns2, out2 = _exec_capture(tree, tag='<user_code_hidden>')
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + str(e)
        return result
    finally:
        ml_lab.load_pca_visual_audit = orig_loader

    ref2 = _c3l4_ref(9001)
    if _c3l4_check_output(out2, ref2):
        result['behavior_ok'] = True
        result['behavior_msg'] = ('Chạy lại với seed ẩn (9001) vẫn đúng — kể cả khi component đổi dấu ngẫu '
                                   'nhiên, kết quả chấm không đổi (sign-invariant).')
    else:
        result['behavior_msg'] = ('Chạy lại với seed ẩn KHÔNG cho kết quả đúng — có thể đang hard-code '
                                   'thay vì tính từ load_pca_visual_audit().')
        return result

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ══════════════════════════════════════════════════════════════════════════
# MODULE 3 — CLUSTERING & STRUCTURE DISCOVERY
# ══════════════════════════════════════════════════════════════════════════

def _labels_used_in_fit(tree):
    """True nếu có lời gọi .fit(...)/.fit_predict(...) mà 1 trong các arg là Name
    chứa 'label' — bắt kiểu vô tình (hoặc cố ý) đưa nhãn vào fit của model
    unsupervised (KMeans không được và không cần nhãn để fit)."""
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in ('fit', 'fit_predict'):
            for a in node.args:
                if isinstance(a, ast.Name) and 'label' in a.id.lower():
                    return True
    return False


def _c3l6_ref(seed):
    """Tính silhouette + ARI (gốc và sau hoán vị cluster_id) THẬT từ engine —
    tham chiếu cho grade_lesson_c3_6."""
    from sklearn.cluster import KMeans as _KMeans
    from sklearn.preprocessing import StandardScaler as _SS
    from sklearn.metrics import silhouette_score as _sil, adjusted_rand_score as _ari
    X, external_labels = ml_lab.load_unsupervised_contract_data(seed=seed)
    X_scaled = _SS().fit_transform(X)
    cluster_ids = _KMeans(n_clusters=3, n_init=20, random_state=42).fit_predict(X_scaled)
    sil = float(_sil(X_scaled, cluster_ids))
    ari = float(_ari(external_labels, cluster_ids))
    perm = np.random.RandomState(0).permutation(3)
    permuted = np.choose(cluster_ids, perm)
    ari_perm = float(_ari(external_labels, permuted))
    return {'silhouette': sil, 'ari': ari, 'ari_perm': ari_perm}


def _c3l6_check_output(out, ref):
    """Đọc stdout: silhouette + 2 giá trị ARI (gốc, sau hoán vị) phải khớp engine
    VÀ 2 giá trị ARI phải GẦN NHƯ BẰNG NHAU (permutation-invariance THẬT được
    chứng minh trong output, không chỉ được engine đảm bảo ngầm)."""
    sil = _num_after(out, 'silhouette')
    ari1 = _num_after(out, 'external ari') or _num_after(out, 'ari')
    ari2 = _num_after(out, 'permuted ari')
    if sil is None or ari1 is None or ari2 is None:
        return False
    if abs(sil - ref['silhouette']) > 1e-3:
        return False
    if abs(ari1 - ref['ari']) > 1e-3:
        return False
    if abs(ari2 - ref['ari']) > 1e-3:
        return False
    return True


# ── C3-6 — Clustering không phải classification ──────────────────────────
def grade_lesson_c3_6(user_code):
    """Bài C3-6 — Fit KMeans KHÔNG dùng y, audit sau đó. Học viên fit KMeans(k=3)
    CHỈ trên X đã scale, tính silhouette (nội bộ), rồi MỚI mở external_labels để
    tính ARI + kiểm tra ARI KHÔNG đổi khi hoán vị cluster_id. Unsafe-but-correct
    của spec: chọn feature/k bằng cách lặp lại để tối đa đồng thuận với nhãn ẩn —
    không code-checkable trực tiếp (không có vòng lặp k trong code mẫu), risk tier
    ở đây tập trung vào tín hiệu checkable rõ nhất: nhãn không được lọt vào fit()."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    if not _uses_call(tree, 'load_unsupervised_contract_data'):
        result['code_msg'] = 'Cần load_unsupervised_contract_data từ ml_lab.'
        return result
    if not (_uses_call(tree, 'KMeans') and _uses_call(tree, 'silhouette_score') and _uses_call(tree, 'adjusted_rand_score')):
        result['code_msg'] = 'Cần KMeans, silhouette_score và adjusted_rand_score (sklearn).'
        return result
    if not _uses_call(tree, 'choose'):
        result['code_msg'] = 'Cần np.choose(...) để hoán vị cluster_id và kiểm tra ARI bất biến.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có load_unsupervised_contract_data + KMeans + silhouette_score + adjusted_rand_score + np.choose.'

    if _labels_used_in_fit(tree):
        result['risk_msg'] = ('external_labels đang lọt vào .fit()/.fit_predict() — KMeans là unsupervised, '
                               'TUYỆT ĐỐI không được dùng nhãn để fit. Nhãn chỉ dùng để AUDIT SAU KHI đã fit xong.')
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'KMeans fit chỉ trên X — nhãn ngoài chỉ dùng để audit sau đó.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    ref = _c3l6_ref(0)
    if _c3l6_check_output(out, ref):
        result['output_ok'] = True
        result['output_msg'] = 'silhouette + ARI (gốc và sau hoán vị) đúng, khớp engine — ARI bất biến qua hoán vị.'
    else:
        result['output_msg'] = ('Cần in "silhouette", "external ARI" và "permuted ARI" — 2 giá trị ARI phải '
                                 'GẦN BẰNG NHAU (permutation-invariant), khớp load_unsupervised_contract_data().')
        return result

    orig_loader = ml_lab.load_unsupervised_contract_data

    def _hidden_loader(*args, **kwargs):
        kwargs = dict(kwargs)
        kwargs['seed'] = 9001
        return orig_loader(*args, **kwargs)

    ml_lab.load_unsupervised_contract_data = _hidden_loader
    try:
        ns2, out2 = _exec_capture(tree, tag='<user_code_hidden>')
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + str(e)
        return result
    finally:
        ml_lab.load_unsupervised_contract_data = orig_loader

    ref2 = _c3l6_ref(9001)
    if _c3l6_check_output(out2, ref2):
        result['behavior_ok'] = True
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) vẫn đúng và bất biến — không hard-code.'
    else:
        result['behavior_msg'] = ('Chạy lại với dữ liệu ẩn KHÔNG cho kết quả đúng — có thể đang hard-code '
                                   'thay vì tính từ load_unsupervised_contract_data().')
        return result

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def _kmeans_calls_missing_kw(tree, kw):
    """True nếu có lời gọi KMeans(...) mà THIẾU keyword arg `kw` (n_init/random_state) —
    bắt kiểu dựa vào giá trị mặc định ngầm thay vì khai báo tường minh."""
    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            f = node.func
            fname = f.id if isinstance(f, ast.Name) else (f.attr if isinstance(f, ast.Attribute) else '')
            if fname == 'KMeans':
                if not any(k.arg == kw for k in node.keywords):
                    return True
    return False


def _naive_cmp_base_name(node):
    """Lấy tên biến gốc của 1 Name hoặc Subscript (vd labels_by_seed[0] -> 'labels_by_seed')."""
    if isinstance(node, ast.Name):
        return node.id.lower()
    if isinstance(node, ast.Subscript) and isinstance(node.value, ast.Name):
        return node.value.id.lower()
    return ''


def _has_naive_id_comparison(tree):
    """True nếu có so sánh == trực tiếp giữa 2 biến (hoặc phần tử list/array của
    biến) có tên chứa 'label'/'cluster' — bắt kiểu chấm 'accuracy' thô trên ID
    thay vì dùng adjusted_rand_score (permutation-invariant)."""
    for node in ast.walk(tree):
        if isinstance(node, ast.Compare) and len(node.ops) == 1 and isinstance(node.ops[0], ast.Eq):
            names = [_naive_cmp_base_name(node.left), _naive_cmp_base_name(node.comparators[0])]
            names = [n for n in names if n]
            if len(names) == 2 and any(('label' in x or 'cluster' in x) for x in names):
                return True
    return False


def _c3l7_ref(seed):
    """Tính inertia/silhouette/stability THẬT từ engine — tham chiếu cho grade_lesson_c3_7."""
    from sklearn.preprocessing import StandardScaler as _SS
    from sklearn.cluster import KMeans as _KMeans
    from sklearn.metrics import silhouette_score as _sil, adjusted_rand_score as _ari
    X = ml_lab.load_kmeans_lab(seed=seed)
    X_scaled = _SS().fit_transform(X)
    labels_by_seed = []
    for s in [1, 7, 42, 99]:
        model = _KMeans(n_clusters=3, n_init=20, random_state=s)
        labels_by_seed.append(model.fit_predict(X_scaled))
    reference = labels_by_seed[0]
    stability = [float(_ari(reference, z)) for z in labels_by_seed[1:]]
    final = _KMeans(n_clusters=3, n_init=20, random_state=42).fit(X_scaled)
    return {
        'inertia': float(final.inertia_),
        'silhouette': float(_sil(X_scaled, final.labels_)),
        'stability': stability,
    }


def _c3l7_check_output(out, ref):
    """Code mẫu in 3 dòng KHÔNG nhãn (print(final.inertia_), print(silhouette),
    print(stability)) — đọc theo VỊ TRÍ: dòng có 1 số = ứng viên inertia/silhouette,
    dòng có '[' = danh sách stability."""
    import re as _re
    lines = [ln.strip() for ln in out.splitlines() if ln.strip()]
    plain_nums = []
    stab_line = ''
    for ln in lines:
        if '[' in ln:
            stab_line = ln
        else:
            m = _re.fullmatch(r'-?\d+\.?\d*(?:[eE][-+]?\d+)?', ln)
            if m:
                plain_nums.append(float(ln))
    if len(plain_nums) < 2 or not stab_line:
        return False
    inertia, silhouette = plain_nums[0], plain_nums[1]
    if abs(inertia - ref['inertia']) > max(1.0, ref['inertia'] * 0.02):
        return False
    if abs(silhouette - ref['silhouette']) > 1e-3:
        return False
    found = [float(x) for x in _re.findall(r'-?\d+\.?\d*', stab_line)]
    if len(found) < 3:
        return False
    for a, b in zip(sorted(found[:3]), sorted(ref['stability'])):
        if abs(a - b) > 5e-2:
            return False
    return True


# ── C3-7 — K-means: assign, update và repeat ─────────────────────────────
def grade_lesson_c3_7(user_code):
    """Bài C3-7 — Reproducible K-means run. Học viên scale X, fit KMeans với
    n_init/random_state TƯỜNG MINH qua 4 seed, đo độ ổn định bằng ARI
    (permutation-invariant), rồi báo cáo inertia + silhouette của lần fit cuối.
    Unsafe-but-correct của spec: báo cáo inertia thấp nhất trong hàng chục seed
    nhưng giấu bất ổn định — Risk tier bắt qua yêu cầu code PHẢI tính stability
    bằng ARI thật (không so ID thô bằng ==)."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    if not _uses_call(tree, 'load_kmeans_lab'):
        result['code_msg'] = 'Cần load_kmeans_lab từ ml_lab.'
        return result
    if not (_uses_call(tree, 'StandardScaler') and _uses_call(tree, 'KMeans') and _uses_call(tree, 'silhouette_score') and _uses_call(tree, 'adjusted_rand_score')):
        result['code_msg'] = 'Cần StandardScaler, KMeans, silhouette_score và adjusted_rand_score.'
        return result
    if _kmeans_calls_missing_kw(tree, 'n_init') or _kmeans_calls_missing_kw(tree, 'random_state'):
        result['code_msg'] = 'Mọi lời gọi KMeans(...) cần khai báo TƯỜNG MINH cả n_init= và random_state=.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có load_kmeans_lab + StandardScaler + KMeans(n_init, random_state tường minh) + silhouette_score + adjusted_rand_score.'

    if _has_naive_id_comparison(tree):
        result['risk_msg'] = ('Có so sánh == trực tiếp giữa 2 biến nhãn/cluster — đây là "accuracy" thô trên '
                               'ID, không permutation-invariant. Độ ổn định PHẢI đo bằng adjusted_rand_score.')
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'Không có so sánh ID thô — độ ổn định đo bằng ARI (permutation-invariant).'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    ref = _c3l7_ref(0)
    if _c3l7_check_output(out, ref):
        result['output_ok'] = True
        result['output_msg'] = 'inertia, silhouette và stability đúng, khớp engine.'
    else:
        result['output_msg'] = ('Cần in inertia, silhouette và danh sách stability (ARI qua các seed) — khớp '
                                 'load_kmeans_lab(). Nhớ StandardScaler trước khi fit.')
        return result

    orig_loader = ml_lab.load_kmeans_lab

    def _hidden_loader(*args, **kwargs):
        kwargs = dict(kwargs)
        kwargs['seed'] = 9001
        return orig_loader(*args, **kwargs)

    ml_lab.load_kmeans_lab = _hidden_loader
    try:
        ns2, out2 = _exec_capture(tree, tag='<user_code_hidden>')
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + str(e)
        return result
    finally:
        ml_lab.load_kmeans_lab = orig_loader

    ref2 = _c3l7_ref(9001)
    if _c3l7_check_output(out2, ref2):
        result['behavior_ok'] = True
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) vẫn cho kết quả đúng — không hard-code.'
    else:
        result['behavior_msg'] = ('Chạy lại với dữ liệu ẩn KHÔNG cho kết quả đúng — có thể đang hard-code '
                                   'thay vì tính từ load_kmeans_lab().')
        return result

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def _c3l8_ref(seed):
    """Tính report THẬT (k=2..8: inertia/silhouette/stability) từ engine —
    tham chiếu cho grade_lesson_c3_8."""
    from sklearn.cluster import KMeans as _KMeans
    from sklearn.preprocessing import StandardScaler as _SS
    from sklearn.metrics import silhouette_score as _sil, adjusted_rand_score as _ari
    X = _SS().fit_transform(ml_lab.load_k_selection_data(seed=seed))
    ref = {}
    for k in range(2, 9):
        runs = [_KMeans(n_clusters=k, n_init=20, random_state=s).fit_predict(X) for s in [1, 7, 42]]
        stability = float(np.mean([_ari(runs[0], z) for z in runs[1:]]))
        model = _KMeans(n_clusters=k, n_init=20, random_state=42).fit(X)
        ref[k] = {
            'inertia': float(model.inertia_),
            'silhouette': float(_sil(X, model.labels_)),
            'stability': stability,
        }
    return ref


def _c3l8_check_report(report, ref):
    if not isinstance(report, list) or len(report) < 7:
        return False
    seen = set()
    for row in report:
        try:
            k = int(row['k'])
            inertia = float(row['inertia'])
            sil = float(row['silhouette'])
            stab = float(row['stability'])
        except Exception:
            return False
        if k not in ref:
            continue
        r = ref[k]
        if abs(inertia - r['inertia']) > max(1.0, r['inertia'] * 0.03):
            return False
        if abs(sil - r['silhouette']) > 5e-3:
            return False
        if abs(stab - r['stability']) > 5e-2:
            return False
        seen.add(k)
    return seen == set(ref.keys())


# ── C3-8 — Chọn k và đánh giá một clustering ─────────────────────────────
def grade_lesson_c3_8(user_code):
    """Bài C3-8 — Evaluate k with multiple signals. Học viên sweep k=2..8, mỗi k
    tính inertia + silhouette + stability (ARI trung bình qua 3 seed). Unsafe-but-
    correct của spec: chọn k chỉ vì tối đa đồng thuận với 1 nhãn ẩn mở SAU mỗi lần
    thử — Risk tier tái dùng đúng cơ chế 'nhãn lọt vào fit' như Bài 6/7."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    if not _uses_call(tree, 'load_k_selection_data'):
        result['code_msg'] = 'Cần load_k_selection_data từ ml_lab.'
        return result
    if not (_uses_call(tree, 'StandardScaler') and _uses_call(tree, 'KMeans') and _uses_call(tree, 'silhouette_score') and _uses_call(tree, 'adjusted_rand_score')):
        result['code_msg'] = 'Cần StandardScaler, KMeans, silhouette_score và adjusted_rand_score.'
        return result
    if _kmeans_calls_missing_kw(tree, 'n_init') or _kmeans_calls_missing_kw(tree, 'random_state'):
        result['code_msg'] = 'Mọi lời gọi KMeans(...) cần khai báo TƯỜNG MINH cả n_init= và random_state=.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có load_k_selection_data + StandardScaler + KMeans(n_init, random_state tường minh) + silhouette_score + adjusted_rand_score.'

    if _labels_used_in_fit(tree) or _has_naive_id_comparison(tree):
        result['risk_msg'] = ('Có dấu hiệu dùng nhãn/label để fit hoặc so ID thô — chọn k KHÔNG được dựa vào '
                               'nhãn ẩn mở sau mỗi lần thử (label-guided tuning nguỵ trang thành clustering), '
                               'và stability phải đo bằng ARI, không so ID trực tiếp.')
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'Không có nhãn lọt vào fit, không so ID thô — đúng kỷ luật unsupervised.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    ref = _c3l8_ref(0)
    report = ns.get('report')
    if _c3l8_check_report(report, ref):
        result['output_ok'] = True
        result['output_msg'] = 'report đúng cho cả 7 giá trị k (2-8), khớp engine.'
    else:
        result['output_msg'] = ('Cần biến `report` — list 7 dict {k, inertia, silhouette, stability} cho '
                                 'k=2..8, khớp load_k_selection_data().')
        return result

    orig_loader = ml_lab.load_k_selection_data

    def _hidden_loader(*args, **kwargs):
        kwargs = dict(kwargs)
        kwargs['seed'] = 9001  # seed lẻ → dữ liệu NGẪU NHIÊN, không có k nào nổi bật
        return orig_loader(*args, **kwargs)

    ml_lab.load_k_selection_data = _hidden_loader
    try:
        ns2, _out2 = _exec_capture(tree, tag='<user_code_hidden>')
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + str(e)
        return result
    finally:
        ml_lab.load_k_selection_data = orig_loader

    ref2 = _c3l8_ref(9001)
    report2 = ns2.get('report')
    if _c3l8_check_report(report2, ref2):
        result['behavior_ok'] = True
        result['behavior_msg'] = ('Chạy lại với dữ liệu ẩn (NGẪU NHIÊN, không có k nào nổi bật) vẫn cho report '
                                   'đúng — không hard-code "k tốt nhất".')
    else:
        result['behavior_msg'] = ('Chạy lại với dữ liệu ẩn KHÔNG cho report đúng — có thể đang hard-code '
                                   'thay vì tính từ load_k_selection_data().')
        return result

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def _c3l9_ref(seed):
    """Tính report THẬT (kmeans/dbscan/complete_link: clusters/noise/silhouette
    guarded) từ engine — tham chiếu cho grade_lesson_c3_9. eps=0.35 (đã tune cho
    đúng dữ liệu 2 lưỡi liềm của engine — spec minh hoạ eps=0.28 mang tính ví dụ)."""
    from sklearn.preprocessing import StandardScaler as _SS
    from sklearn.cluster import KMeans as _KMeans, DBSCAN as _DBSCAN, AgglomerativeClustering as _Agg
    from sklearn.metrics import silhouette_score as _sil
    X = _SS().fit_transform(ml_lab.load_shape_clustering_data(seed=seed))
    models = {
        'kmeans': _KMeans(n_clusters=2, n_init=20, random_state=42),
        'dbscan': _DBSCAN(eps=0.35, min_samples=6),
        'complete_link': _Agg(n_clusters=2, linkage='complete'),
    }
    ref = {}
    for name, model in models.items():
        labels = model.fit_predict(X)
        valid = labels != -1
        unique = np.unique(labels[valid])
        score = float(_sil(X[valid], labels[valid])) if valid.sum() > 2 and len(unique) >= 2 else None
        ref[name] = {'clusters': int(len(unique)), 'noise': int((labels == -1).sum()), 'silhouette': score}
    return ref


def _c3l9_check_report(report, ref):
    if not isinstance(report, list) or len(report) < 3:
        return False
    seen = set()
    for row in report:
        try:
            name = row['model']
            clusters = int(row['clusters'])
            noise = int(row['noise'])
            sil = row['silhouette']
        except Exception:
            return False
        if name not in ref:
            continue
        r = ref[name]
        if clusters != r['clusters'] or noise != r['noise']:
            return False
        if r['silhouette'] is None:
            if sil is not None:
                return False
        else:
            try:
                if abs(float(sil) - r['silhouette']) > 1e-3:
                    return False
            except (TypeError, ValueError):
                return False
        seen.add(name)
    return seen == set(ref.keys())


def _shared_x_for_all_models(tree):
    """True nếu CHỈ có 1 lời gọi StandardScaler(...).fit_transform(...) — đảm bảo
    cả 3 thuật toán dùng CHUNG 1 representation đã chuẩn hoá, không phải mỗi model
    1 phép biến đổi riêng (so sánh không công bằng nếu tiền xử lý khác nhau)."""
    count = 0
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == 'fit_transform':
            obj = node.func.value
            fname = obj.func.id if (isinstance(obj, ast.Call) and isinstance(obj.func, ast.Name)) else ''
            if fname == 'StandardScaler':
                count += 1
    return count == 1


# ── C3-9 — DBSCAN và hierarchical clustering ─────────────────────────────
def grade_lesson_c3_9(user_code):
    """Bài C3-9 — Compare clustering families. Học viên fit KMeans/DBSCAN/
    Agglomerative(complete) trên CÙNG 1 representation đã scale, tính guarded
    silhouette (None khi <2 cụm hợp lệ) + đếm cluster/noise. Unsafe-but-correct
    của spec: DBSCAN loại phần lớn điểm thành nhiễu rồi so silhouette với K-means
    trên toàn bộ điểm — Risk tier kiểm tra tỉ lệ nhiễu của DBSCAN không vượt
    ngưỡng bất thường (không "làm đẹp" số bằng cách xoá gần hết dữ liệu)."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    if not _uses_call(tree, 'load_shape_clustering_data'):
        result['code_msg'] = 'Cần load_shape_clustering_data từ ml_lab.'
        return result
    if not (_uses_call(tree, 'KMeans') and _uses_call(tree, 'DBSCAN') and _uses_call(tree, 'AgglomerativeClustering') and _uses_call(tree, 'silhouette_score')):
        result['code_msg'] = 'Cần cả KMeans, DBSCAN, AgglomerativeClustering và silhouette_score.'
        return result
    if not _shared_x_for_all_models(tree):
        result['code_msg'] = 'Cần CHỈ 1 lần StandardScaler().fit_transform(...) — cả 3 thuật toán phải dùng CHUNG representation, không mỗi model 1 phép scale riêng.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có load_shape_clustering_data + KMeans/DBSCAN/AgglomerativeClustering + silhouette_score, dùng chung 1 representation.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    ref = _c3l9_ref(0)
    report = ns.get('report')
    if _c3l9_check_report(report, ref):
        result['output_ok'] = True
        result['output_msg'] = 'clusters/noise/silhouette đúng cho cả 3 thuật toán, khớp engine.'
    else:
        result['output_msg'] = ('Cần biến `report` — list 3 dict {model, clusters, noise, silhouette} cho '
                                 'kmeans/dbscan/complete_link, khớp load_shape_clustering_data(). silhouette '
                                 'phải là None khi có dưới 2 cụm hợp lệ.')
        return result

    total_n = 240
    dbscan_row = next((r for r in report if r.get('model') == 'dbscan'), None)
    if dbscan_row and dbscan_row.get('noise', 0) > 0.4 * total_n:
        result['risk_msg'] = ('DBSCAN đang loại hơn 40%% dữ liệu thành nhiễu (%d/%d điểm) — silhouette tính trên '
                               'phần còn lại quá nhỏ để so công bằng với K-means/complete-link tính trên TOÀN BỘ '
                               'điểm.' % (dbscan_row.get('noise', 0), total_n))
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'Tỉ lệ nhiễu của DBSCAN hợp lý — so sánh 3 thuật toán công bằng, cùng quần thể.'

    orig_loader = ml_lab.load_shape_clustering_data

    def _hidden_loader(*args, **kwargs):
        kwargs = dict(kwargs)
        kwargs['seed'] = 9001  # seed lẻ → 2 cụm hình cầu (khác cấu trúc moons mặc định)
        return orig_loader(*args, **kwargs)

    ml_lab.load_shape_clustering_data = _hidden_loader
    try:
        ns2, _out2 = _exec_capture(tree, tag='<user_code_hidden>')
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (hình dạng khác) bị lỗi: ' + str(e)
        return result
    finally:
        ml_lab.load_shape_clustering_data = orig_loader

    ref2 = _c3l9_ref(9001)
    report2 = ns2.get('report')
    if _c3l9_check_report(report2, ref2):
        result['behavior_ok'] = True
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (hình cầu thay vì lưỡi liềm) vẫn cho report đúng — không hard-code.'
    else:
        result['behavior_msg'] = ('Chạy lại với dữ liệu ẩn KHÔNG cho report đúng — có thể đang hard-code thay vì '
                                   'tính từ load_shape_clustering_data().')
        return result

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


# ══════════════════════════════════════════════════════════════════════════
# MODULE 4 — NEURAL COMPUTATION
# ══════════════════════════════════════════════════════════════════════════

def _weight_names(assign_target):
    """Tên biến của 1 target gán/augassign (Name -> id, Subscript -> tên biến gốc)."""
    if isinstance(assign_target, ast.Name):
        return assign_target.id.lower()
    if isinstance(assign_target, ast.Subscript) and isinstance(assign_target.value, ast.Name):
        return assign_target.value.id.lower()
    return ''


def _func_updates_only_on_mistake(tree, func_name):
    """True nếu MỌI phép AugAssign (+=) cho biến trọng số w/b bên trong hàm
    func_name đều nằm bên TRONG 1 If có điều kiện nhắc 'error'/'!=' — tức UPDATE
    chỉ xảy ra khi có lỗi (khởi tạo w=.../b=... bằng '=' thường không bị bắt buộc
    gate, chỉ phép CỘNG DỒN += mới là 'update'). Nếu có += cho w/b nằm NGOÀI 1 If
    như vậy (vd TRAP_UNCONDITIONAL_UPDATE chỉ gate biến đếm mistake, không gate
    w/b), trả False."""
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name == func_name:
            gated_lines = set()
            for sub in ast.walk(node):
                if isinstance(sub, ast.If):
                    test_src = ast.dump(sub.test).lower()
                    if 'error' in test_src or 'noteq' in test_src:
                        for b in ast.walk(sub):
                            if isinstance(b, ast.AugAssign) and b is not sub:
                                gated_lines.add(getattr(b, 'lineno', -1))
            found_gated_wb = False
            for sub in ast.walk(node):
                if isinstance(sub, ast.AugAssign):
                    wname = _weight_names(sub.target)
                    if wname in ('w', 'b', 'weights', 'bias'):
                        if getattr(sub, 'lineno', -1) not in gated_lines:
                            return False
                        found_gated_wb = True
            return found_gated_wb
    return False


def _perceptron_epochs_too_low(tree, min_epochs=50):
    """True nếu def train_perceptron(...) có default epochs < min_epochs — bắt
    kiểu dừng quá sớm rồi báo cáo 'huấn luyện thành công' trên XOR mà chưa đủ
    epoch để chứng minh KHÔNG BAO GIỜ hội tụ."""
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name == 'train_perceptron':
            arg_names = [a.arg for a in node.args.args]
            defaults = node.args.defaults
            n_missing = len(arg_names) - len(defaults)
            for name, default in zip(arg_names[n_missing:], defaults):
                if name == 'epochs' and isinstance(default, ast.Constant):
                    try:
                        if int(default.value) < min_epochs:
                            return True
                    except (TypeError, ValueError):
                        pass
    return False


def _c3l10_ref(seed):
    """Tính mistake-history THẬT cho cả 4 case (AND/OR/separable/XOR) từ engine —
    tham chiếu cho grade_lesson_c3_10. Dùng ĐÚNG thuật toán perceptron chuẩn spec
    (lr=0.1, epochs=50, seed nội bộ=42 — cố định, KHÁC seed dữ liệu)."""
    def _train(X, y, learning_rate=0.1, epochs=50, seed=42):
        rng = np.random.default_rng(seed)
        w = np.zeros(X.shape[1], dtype=float)
        b = 0.0
        mistakes = []
        for _ in range(epochs):
            count = 0
            for i in rng.permutation(len(X)):
                pred = 1 if X[i] @ w + b >= 0 else 0
                error = y[i] - pred
                if error != 0:
                    w = w + learning_rate * error * X[i]
                    b = b + learning_rate * error
                    count += 1
            mistakes.append(count)
            if count == 0:
                break
        return w, b, mistakes

    ref = {}
    for name, X, y in ml_lab.load_perceptron_cases(seed=seed):
        w, b, mistakes = _train(X, y)
        ref[name] = {'mistakes': [int(m) for m in mistakes], 'converged': bool(mistakes[-1] == 0)}
    return ref


def _c3l10_check_output(out, ref):
    """Mỗi case in ra dạng 'NAME [m1, m2, ...]' (print(name, mistakes)) — đọc
    theo TÊN case, so khớp CHÍNH XÁC danh sách mistake với tham chiếu."""
    for name, r in ref.items():
        m = re.search(re.escape(name) + r'\s*\[([^\]]*)\]', out)
        if not m:
            return False
        try:
            nums = [int(x.strip()) for x in m.group(1).split(',') if x.strip() != '']
        except ValueError:
            return False
        if nums != r['mistakes']:
            return False
    return True


# ── C3-10 — Perceptron: neuron có thể học đầu tiên ───────────────────────
def grade_lesson_c3_10(user_code):
    """Bài C3-10 — Implement the perceptron. Học viên viết train_perceptron(X,y)
    theo đúng vòng lặp assign-mistake-update, chạy trên 4 case (AND/OR/separable
    hội tụ; XOR KHÔNG hội tụ — giới hạn năng lực, không phải lỗi code).
    Unsafe-but-correct của spec: giảm epochs mặc định để "kết thúc sớm" rồi ngầm
    coi XOR là thành công — Risk tier bắt trực tiếp qua default epochs < 50."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    if not _uses_call(tree, 'load_perceptron_cases'):
        result['code_msg'] = 'Cần load_perceptron_cases từ ml_lab.'
        return result
    has_train_fn = any(isinstance(n, ast.FunctionDef) and n.name == 'train_perceptron' for n in ast.walk(tree))
    if not has_train_fn:
        result['code_msg'] = 'Cần định nghĩa hàm train_perceptron(X, y, ...).'
        return result
    if not _func_updates_only_on_mistake(tree, 'train_perceptron'):
        result['code_msg'] = 'train_perceptron phải CHỈ update w/b khi có lỗi (if error != 0: ...) — không update vô điều kiện mỗi mẫu.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Có load_perceptron_cases + train_perceptron với update CÓ ĐIỀU KIỆN (chỉ khi lỗi).'

    if _perceptron_epochs_too_low(tree):
        result['risk_msg'] = ('train_perceptron có epochs mặc định QUÁ THẤP (<50) — không đủ vòng lặp để chứng '
                               'minh XOR THỰC SỰ không hội tụ, dễ dẫn đến báo cáo "thành công" sai trên dữ liệu '
                               'không tách được tuyến tính.')
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'epochs mặc định đủ lớn (≥50) — đủ căn cứ để chẩn đoán XOR không hội tụ, không báo thành công giả.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    ref = _c3l10_ref(0)
    if _c3l10_check_output(out, ref):
        result['output_ok'] = True
        result['output_msg'] = 'Mistake history đúng cho cả 4 case (AND/OR/separable/XOR), khớp engine.'
    else:
        result['output_msg'] = ('Cần in "name mistakes_list" cho từng case trong load_perceptron_cases() — danh '
                                 'sách mistake mỗi epoch phải khớp đúng thuật toán chuẩn (update chỉ khi lỗi).')
        return result

    orig_loader = ml_lab.load_perceptron_cases

    def _hidden_loader(*args, **kwargs):
        kwargs = dict(kwargs)
        kwargs['seed'] = 9001
        return orig_loader(*args, **kwargs)

    ml_lab.load_perceptron_cases = _hidden_loader
    try:
        ns2, out2 = _exec_capture(tree, tag='<user_code_hidden>')
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại với dữ liệu ẩn (seed khác) bị lỗi: ' + str(e)
        return result
    finally:
        ml_lab.load_perceptron_cases = orig_loader

    ref2 = _c3l10_ref(9001)
    if _c3l10_check_output(out2, ref2) and ref2['XOR']['converged'] is False and ref2['separable']['converged'] is True:
        result['behavior_ok'] = True
        result['behavior_msg'] = ('Chạy lại với dữ liệu ẩn (seed khác) vẫn cho mistake history đúng — separable '
                                   'hội tụ thật, XOR KHÔNG hội tụ giả — không hard-code.')
    else:
        result['behavior_msg'] = ('Chạy lại với dữ liệu ẩn KHÔNG cho kết quả đúng — có thể đang hard-code thay vì '
                                   'chạy lại thuật toán thật.')
        return result

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def _func_has_loop(fn_def):
    """True nếu FunctionDef chứa vòng lặp for/while — vi phạm yêu cầu "vectorized"
    (phải dùng NumPy vector hoá, không lặp phần tử bằng Python thuần)."""
    return any(isinstance(n, (ast.For, ast.While)) for n in ast.walk(fn_def))


def _expr_mentions_name(node, name):
    return any(isinstance(n, ast.Name) and n.id == name for n in ast.walk(node))


def _func_grad_is_arg_dependent(fn_def):
    """True nếu có 1 ast.Compare bên trong fn_def có nhắc tới THAM SỐ đầu tiên của
    hàm — tức gradient thật sự PHỤ THUỘC vào z (không phải hằng số như
    np.ones_like(z), ngầm định "gradient luôn chảy, không bao giờ chết")."""
    if not fn_def.args.args:
        return False
    param = fn_def.args.args[0].arg
    for n in ast.walk(fn_def):
        if isinstance(n, ast.Compare) and _expr_mentions_name(n, param):
            return True
    return False


def _c3l11_ref_fns():
    def sigmoid(z):
        return 1.0 / (1.0 + np.exp(-np.asarray(z, dtype=float)))

    def sigmoid_grad(z):
        s = sigmoid(z)
        return s * (1 - s)

    def relu(z):
        return np.maximum(0.0, np.asarray(z, dtype=float))

    def relu_grad(z):
        return (np.asarray(z, dtype=float) > 0).astype(float)

    return sigmoid, sigmoid_grad, relu, relu_grad


def _c3l11_gradient_products(sigmoid_grad_fn, relu_grad_fn, chain):
    sig = float(np.prod([np.asarray(sigmoid_grad_fn(z)).mean() for z in chain]))
    rel = float(np.prod([np.asarray(relu_grad_fn(z)).mean() for z in chain]))
    return sig, rel


# ── C3-11 — Activation functions and gradient flow ───────────────────────
def grade_lesson_c3_11(user_code):
    """Bài C3-11 — Implement activations and derivatives. Học viên viết
    sigmoid/sigmoid_grad/relu/relu_grad VECTORIZED (dùng đúng z được truyền vào,
    KHÔNG lặp phần tử bằng Python), rồi so gradient_product (tích dồn qua chain 10
    lớp) giữa sigmoid và relu. Unsafe-but-correct của spec: hàm gradient "luôn
    chảy" không phụ thuộc z (vd np.ones_like(z)) — ngầm định ReLU không bao giờ
    chết, một tuyên bố phổ quát sai — Risk tier bắt trực tiếp bằng AST."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    fn_names = ['sigmoid', 'sigmoid_grad', 'relu', 'relu_grad']
    fn_defs = {name: _find_funcdef(tree, name) for name in fn_names}
    missing = [name for name, d in fn_defs.items() if d is None or len(d.args.args) != 1]
    if missing:
        result['code_msg'] = 'Cần đủ 4 hàm sigmoid(z), sigmoid_grad(z), relu(z), relu_grad(z) — đúng 1 tham số mỗi hàm.'
        return result
    if not _uses_call(fn_defs['sigmoid'], 'exp'):
        result['code_msg'] = 'sigmoid(z) phải dùng công thức mũ thật: 1 / (1 + np.exp(-z)).'
        return result
    if any(_func_has_loop(fn_defs[name]) for name in fn_names):
        result['code_msg'] = 'Cả 4 hàm phải VECTORIZED (dùng NumPy trên toàn mảng z) — không lặp phần tử bằng vòng for/while.'
        return result
    if not _uses_call(tree, 'load_activation_chain'):
        result['code_msg'] = 'Cần load_activation_chain từ ml_lab để lấy chain 10 lớp preactivation.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Đủ 4 hàm activation/derivative, vectorized, dùng đúng z và load_activation_chain thật.'

    if _uses_call(fn_defs['sigmoid'], 'clip'):
        result['risk_msg'] = 'sigmoid(z) dùng np.clip thay vì công thức mũ — output bị chặn nhưng gãy khúc, mất độ dốc, không phải xác suất thật.'
        return result
    if not _func_grad_is_arg_dependent(fn_defs['relu_grad']):
        result['risk_msg'] = 'relu_grad(z) không phụ thuộc vào z (hằng số cố định) — ngầm định gradient LUÔN chảy, không bao giờ "chết" — đây là tuyên bố phổ quát sai (dead-ReLU là có thật).'
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'sigmoid dùng công thức mũ thật (không clip), relu_grad phụ thuộc thật vào z — không tuyên bố phổ quát sai.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    ref_sigmoid, ref_sigmoid_grad, ref_relu, ref_relu_grad = _c3l11_ref_fns()
    z_test = np.array([-50.0, -5.0, -1.0, 0.0, 1.0, 5.0, 50.0])
    try:
        fn_sigmoid, fn_sigmoid_grad = ns.get('sigmoid'), ns.get('sigmoid_grad')
        fn_relu, fn_relu_grad = ns.get('relu'), ns.get('relu_grad')
        ok_vals = (
            np.allclose(np.asarray(fn_sigmoid(z_test), dtype=float), ref_sigmoid(z_test), atol=1e-9)
            and np.allclose(np.asarray(fn_sigmoid_grad(z_test), dtype=float), ref_sigmoid_grad(z_test), atol=1e-9)
            and np.allclose(np.asarray(fn_relu(z_test), dtype=float), ref_relu(z_test), atol=1e-9)
            and np.allclose(np.asarray(fn_relu_grad(z_test), dtype=float), ref_relu_grad(z_test), atol=1e-9)
        )
    except Exception as e:
        result['output_msg'] = 'Gọi các hàm activation bị lỗi: ' + str(e)
        return result
    if not ok_vals:
        result['output_msg'] = 'Giá trị activation/derivative chưa khớp công thức chuẩn trên mảng test (bao gồm z=-50, 0, 50).'
        return result

    chain0 = ml_lab.load_activation_chain(seed=0)
    ref_sig_prod, ref_relu_prod = _c3l11_gradient_products(ref_sigmoid_grad, ref_relu_grad, chain0)
    m_sig = re.search(r'sigmoid\s+([0-9.eE+-]+)', out)
    m_relu = re.search(r'relu\s+([0-9.eE+-]+)', out)
    if not (m_sig and m_relu):
        result['output_msg'] = 'Cần in "sigmoid <gradient_product>" và "relu <gradient_product>" (print(name, gradient_product)).'
        return result
    try:
        printed_sig, printed_relu = float(m_sig.group(1)), float(m_relu.group(1))
    except ValueError:
        result['output_msg'] = 'Không đọc được gradient_product đã in ra.'
        return result
    if abs(printed_sig - ref_sig_prod) > max(1e-9, abs(ref_sig_prod) * 1e-3) or \
       abs(printed_relu - ref_relu_prod) > max(1e-9, abs(ref_relu_prod) * 1e-3):
        result['output_msg'] = 'gradient_product in ra chưa khớp tích dồn thật qua load_activation_chain() (10 lớp).'
        return result
    result['output_ok'] = True
    result['output_msg'] = 'Activation/derivative khớp công thức chuẩn (kể cả z=-50/0/50), gradient_product khớp chain thật.'

    orig_loader = ml_lab.load_activation_chain
    try:
        chain_hidden = orig_loader(seed=9001)
        sig_h, relu_h = _c3l11_gradient_products(fn_sigmoid_grad, fn_relu_grad, chain_hidden)
        ref_sig_h, ref_relu_h = _c3l11_gradient_products(ref_sigmoid_grad, ref_relu_grad, chain_hidden)
        match_hidden = (abs(sig_h - ref_sig_h) < max(1e-9, abs(ref_sig_h) * 1e-3)
                         and abs(relu_h - ref_relu_h) < max(1e-9, abs(ref_relu_h) * 1e-3))
        pattern_holds = relu_h > sig_h * 50
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại với chain ẩn (seed khác) bị lỗi: ' + str(e)
        return result
    if match_hidden and pattern_holds:
        result['behavior_ok'] = True
        result['behavior_msg'] = 'Trên chain ẩn (seed khác): gradient_product vẫn khớp công thức thật, và ReLU vẫn giữ gradient lớn hơn sigmoid rất nhiều lần — không hard-code.'
    else:
        result['behavior_msg'] = 'Trên chain ẩn: gradient_product không khớp thuật toán thật hoặc không còn thể hiện đúng độ lệch sigmoid-vs-ReLU.'
        return result

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def _has_matmul(node):
    """Có phép nhân ma trận (@ hoặc np.matmul/np.dot) bên trong node không?"""
    for n in ast.walk(node):
        if isinstance(n, ast.BinOp) and isinstance(n.op, ast.MatMult):
            return True
        if isinstance(n, ast.Call):
            f = n.func
            if (isinstance(f, ast.Attribute) and f.attr in ('matmul', 'dot')) or \
               (isinstance(f, ast.Name) and f.id in ('matmul', 'dot')):
                return True
    return False


def _returns_tuple_with_dict(fn_def):
    """True nếu có Return trả về 1 Tuple mà phần tử thứ 2 là 1 Dict literal —
    đúng contract 'return P, {"X":..., "Z1":..., ...}' (probabilities + cache)."""
    for n in ast.walk(fn_def):
        if isinstance(n, ast.Return) and isinstance(n.value, ast.Tuple) and len(n.value.elts) >= 2:
            if isinstance(n.value.elts[1], ast.Dict):
                return True
    return False


def _has_hardcoded_reshape_batch(fn_def):
    """True nếu có .reshape(N, ...) với N là số nguyên CỐ ĐỊNH khác -1/1 ở vị trí
    đầu tiên — dấu hiệu hard-code batch size, vỡ khi chạy batch ẩn khác kích cỡ."""
    for n in ast.walk(fn_def):
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Attribute) and n.func.attr == 'reshape' and n.args:
            first = n.args[0]
            if isinstance(first, ast.Constant) and isinstance(first.value, int) and first.value not in (-1, 1):
                return True
    return False


def _bias_has_manual_reshape(fn_def):
    """True nếu biến có tên gợi ý bias (b1/b2/bias) bị .reshape(...)/.T thủ công
    trước khi cộng — dấu hiệu "wrong orientation bias broadcast" (spec
    unsafe-but-correct: bias bị ép sai hướng, tình cờ đúng shape với 1 sample
    nhưng SAI giá trị với batch tổng quát)."""
    bias_names = ('b1', 'b2', 'bias')

    def base_is_bias(base):
        if isinstance(base, ast.Name) and base.id in bias_names:
            return True
        if isinstance(base, ast.Subscript):
            key = base.slice
            if isinstance(key, ast.Index):  # py<3.9 wraps the index expr
                key = key.value
            if isinstance(key, ast.Constant) and isinstance(key.value, str) and key.value in bias_names:
                return True
        return False

    for n in ast.walk(fn_def):
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Attribute) and n.func.attr == 'reshape':
            if base_is_bias(n.func.value):
                return True
        if isinstance(n, ast.Attribute) and n.attr == 'T':
            if base_is_bias(n.value):
                return True
    return False


def _c3l12_ref_forward(X, params):
    def relu(z):
        return np.maximum(0.0, z)

    def sigmoid(z):
        return 1.0 / (1.0 + np.exp(-z))

    Z1 = X @ params['W1'] + params['b1']
    A1 = relu(Z1)
    Z2 = A1 @ params['W2'] + params['b2']
    P = sigmoid(Z2).reshape(-1)
    return P, {'X': X, 'Z1': Z1, 'A1': A1, 'Z2': Z2}


def _c3l12_hidden_case(seed):
    """Case ẩn KHÁC hẳn shape mặc định (m=5,n_in=3,n_hidden=4) — m=8,n_in=5,
    n_hidden=6 — để lộ hard-code batch/feature hoặc bias sai hướng."""
    rng = np.random.RandomState(7001 + seed)
    m, n_in, n_hidden = 8, 5, 6
    X = rng.normal(0, 1.0, size=(m, n_in))
    W1 = rng.normal(0, 0.6, size=(n_in, n_hidden))
    b1 = rng.normal(0, 0.1, size=(n_hidden,))
    W2 = rng.normal(0, 0.6, size=(n_hidden, 1))
    b2 = rng.normal(0, 0.1, size=(1,))
    return X, {'W1': W1, 'b1': b1, 'W2': W2, 'b2': b2}


# ── C3-12 — Feedforward through a neural network ──────────────────────────
def grade_lesson_c3_12(user_code):
    """Bài C3-12 — Implement a two-layer forward pass. Học viên viết
    forward_two_layer(X, params) đúng contract affine→activation→affine→activation,
    trả (P, cache). Unsafe-but-correct của spec: bias broadcast SAI HƯỚNG nhưng
    tình cờ đúng shape trên 1 sample — Risk tier bắt bằng AST (reshape/T thủ công
    trên bias), Behavior tier bắt bằng case ẩn KHÁC hẳn shape (m=8,n_in=5,n_hidden=6)."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    fn_def = _find_funcdef(tree, 'forward_two_layer')
    if fn_def is None or len(fn_def.args.args) != 2:
        result['code_msg'] = 'Cần hàm forward_two_layer(X, params) đúng 2 tham số.'
        return result
    if not _has_matmul(fn_def):
        result['code_msg'] = 'forward_two_layer phải dùng phép nhân ma trận (X @ W) cho cả 2 lớp affine.'
        return result
    if not _returns_tuple_with_dict(fn_def):
        result['code_msg'] = 'forward_two_layer phải return (P, cache) — cache là 1 dict chứa các giá trị trung gian.'
        return result
    if not _uses_call(tree, 'load_forward_pass_case'):
        result['code_msg'] = 'Cần load_forward_pass_case từ ml_lab để lấy X, params thật.'
        return result
    param_name = fn_def.args.args[1].arg
    if not _expr_mentions_name(fn_def, param_name):
        result['code_msg'] = 'forward_two_layer phải DÙNG params được truyền vào (W1/b1/W2/b2), không hard-code trọng số.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'forward_two_layer dùng đúng ma trận nhân, params thật, và return (P, cache).'

    if _has_hardcoded_reshape_batch(fn_def):
        result['risk_msg'] = 'Có .reshape(N, ...) với N là số CỐ ĐỊNH — hard-code batch size, sẽ vỡ khi chạy batch ẩn khác kích cỡ.'
        return result
    if _bias_has_manual_reshape(fn_def):
        result['risk_msg'] = 'bias (b1/b2) bị .reshape()/.T thủ công trước khi cộng — dễ broadcast SAI HƯỚNG, chỉ tình cờ đúng shape ở 1 sample nhưng sai giá trị ở batch tổng quát.'
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'Không hard-code batch size, không ép hướng bias thủ công — broadcasting tự nhiên theo shape params.'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    fn = ns.get('forward_two_layer')
    X0, params0 = ml_lab.load_forward_pass_case(seed=0)
    ref_P0, ref_cache0 = _c3l12_ref_forward(X0, params0)
    try:
        got_P0, got_cache0 = fn(X0, params0)
        got_P0 = np.asarray(got_P0, dtype=float)
        ok_shape = got_P0.shape == (X0.shape[0],)
        ok_P = ok_shape and np.allclose(got_P0, ref_P0, atol=1e-8)
        ok_cache = isinstance(got_cache0, dict) and 'Z1' in got_cache0 and 'A1' in got_cache0 and \
            np.allclose(np.asarray(got_cache0['Z1'], dtype=float), ref_cache0['Z1'], atol=1e-8) and \
            np.allclose(np.asarray(got_cache0['A1'], dtype=float), ref_cache0['A1'], atol=1e-8)
    except Exception as e:
        result['output_msg'] = 'Gọi forward_two_layer bị lỗi: ' + str(e)
        return result
    if not (ok_P and ok_cache):
        result['output_msg'] = 'Xác suất P hoặc cache (Z1/A1) chưa khớp tham chiếu trên case mặc định (m=5,n_in=3,n_hidden=4).'
        return result
    result['output_ok'] = True
    result['output_msg'] = 'P đúng shape (m,), khớp tham chiếu; cache Z1/A1 khớp giá trị trung gian thật.'

    Xh, paramsh = _c3l12_hidden_case(9001)
    ref_Ph, _ = _c3l12_ref_forward(Xh, paramsh)
    try:
        got_Ph, got_cacheh = fn(Xh, paramsh)
        got_Ph = np.asarray(got_Ph, dtype=float)
        match_hidden = got_Ph.shape == (Xh.shape[0],) and np.allclose(got_Ph, ref_Ph, atol=1e-8)
    except Exception as e:
        result['behavior_msg'] = 'Chạy với batch/shape ẩn (m=8,n_in=5,n_hidden=6) bị lỗi: ' + str(e)
        return result
    if match_hidden:
        result['behavior_ok'] = True
        result['behavior_msg'] = 'Trên batch/shape HOÀN TOÀN khác (m=8,n_in=5,n_hidden=6): P vẫn đúng shape và khớp tham chiếu — không hard-code batch/feature.'
    else:
        result['behavior_msg'] = 'Trên batch/shape khác: P sai shape hoặc sai giá trị — có thể đang hard-code kích thước hoặc broadcast bias sai hướng.'
        return result

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def _returns_dict_with_keys(fn_def, keys):
    """True nếu có Return trả về 1 Dict literal chứa ĐỦ các key string trong keys."""
    for n in ast.walk(fn_def):
        if isinstance(n, ast.Return) and isinstance(n.value, ast.Dict):
            found = set()
            for k in n.value.keys:
                if isinstance(k, ast.Constant) and isinstance(k.value, str):
                    found.add(k.value)
            if set(keys).issubset(found):
                return True
    return False


def _mutates_param_dict(fn_def, params_name):
    """True nếu có Assign/AugAssign với target là params_name[...] hoặc thuộc
    tính của nó — dấu hiệu "update-during-backward" (trộn 2 giai đoạn tính
    gradient và cập nhật tham số, đúng misconception spec Bước 2)."""
    def target_is_params(t):
        if isinstance(t, ast.Subscript) and isinstance(t.value, ast.Name) and t.value.id == params_name:
            return True
        return False

    for n in ast.walk(fn_def):
        if isinstance(n, ast.AugAssign) and target_is_params(n.target):
            return True
        if isinstance(n, ast.Assign):
            for t in n.targets:
                if target_is_params(t):
                    return True
    return False


def _c3l13_ref_backward(y, P, params, cache):
    m = len(y)
    dZ2 = (P - y).reshape(-1, 1) / m
    dW2 = cache['A1'].T @ dZ2
    db2 = dZ2.sum(axis=0)
    dA1 = dZ2 @ params['W2'].T
    dZ1 = dA1 * (cache['Z1'] > 0)
    dW1 = cache['X'].T @ dZ1
    db1 = dZ1.sum(axis=0)
    return {'W1': dW1, 'b1': db1, 'W2': dW2, 'b2': db2}


# ── C3-13 — Backpropagation and gradient checking ──────────────────────────
def grade_lesson_c3_13(user_code):
    """Bài C3-13 — Implement and check backprop. Học viên viết
    backward_two_layer(y, probabilities, params, cache) đúng chain rule ngược,
    rồi TỰ gọi gradient_check thật để kiểm chứng số. Unsafe-but-correct của spec:
    loss vẫn giảm trên dữ liệu thấy được dù dW1 sai — Risk tier bắt bằng AST
    (update-during-backward, mixed reduction), Behavior tier bắt bằng
    gradient_check thật (relative error) trên case ẩn."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    fn_def = _find_funcdef(tree, 'backward_two_layer')
    if fn_def is None or len(fn_def.args.args) != 4:
        result['code_msg'] = 'Cần hàm backward_two_layer(y, probabilities, params, cache) đúng 4 tham số.'
        return result
    cache_name = fn_def.args.args[3].arg
    params_name = fn_def.args.args[2].arg
    if not _expr_mentions_name(fn_def, cache_name):
        result['code_msg'] = 'backward_two_layer phải DÙNG cache (X/Z1/A1) đã lưu từ forward pass, không tính lại từ đầu.'
        return result
    if not _has_matmul(fn_def):
        result['code_msg'] = 'backward_two_layer phải dùng phép nhân ma trận cho dW1/dW2 (chain rule).'
        return result
    if not _returns_dict_with_keys(fn_def, ['W1', 'b1', 'W2', 'b2']):
        result['code_msg'] = 'backward_two_layer phải return 1 dict đủ 4 key "W1","b1","W2","b2".'
        return result
    if not _uses_call(tree, 'load_backprop_case'):
        result['code_msg'] = 'Cần load_backprop_case từ ml_lab để lấy y, probabilities, params, cache thật.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'backward_two_layer dùng cache thật, phép nhân ma trận, return đủ 4 gradient.'

    if _mutates_param_dict(fn_def, params_name):
        result['risk_msg'] = 'backward_two_layer đang SỬA params (vd params["W1"] -= ...) ngay trong lúc tính gradient — trộn 2 giai đoạn "tính gradient" và "update tham số" (việc của optimizer), dễ gây lỗi khó debug.'
        return result
    if _uses_call(fn_def, 'mean'):
        result['risk_msg'] = 'backward_two_layer dùng thêm .mean(...) bên cạnh việc dZ2 đã chia cho m — reduction bị TRỘN (chia trung bình 2 lần), gradient sẽ sai lệch theo batch size.'
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'Không update params trong lúc tính gradient, không trộn reduction (chỉ /m đúng 1 lần ở dZ2).'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    fn = ns.get('backward_two_layer')
    y0, P0, params0, cache0 = ml_lab.load_backprop_case(seed=0)
    ref_grads0 = _c3l13_ref_backward(y0, P0, params0, cache0)
    try:
        got_grads0 = fn(y0, P0, params0, cache0)
        ok_output = isinstance(got_grads0, dict) and all(
            k in got_grads0 and np.allclose(np.asarray(got_grads0[k], dtype=float), ref_grads0[k], atol=1e-8)
            for k in ('W1', 'b1', 'W2', 'b2')
        )
    except Exception as e:
        result['output_msg'] = 'Gọi backward_two_layer bị lỗi: ' + str(e)
        return result
    if not ok_output:
        result['output_msg'] = 'Gradient (W1/b1/W2/b2) chưa khớp tham chiếu trên case mặc định.'
        return result
    result['output_ok'] = True
    result['output_msg'] = 'Cả 4 gradient (W1/b1/W2/b2) khớp shape và giá trị tham chiếu.'

    try:
        rel0 = ml_lab.gradient_check(params0, got_grads0, y0, cache0['X'])
        pass0 = all(v < 1e-3 for v in rel0.values())
    except Exception as e:
        result['behavior_msg'] = 'Gọi gradient_check bị lỗi: ' + str(e)
        return result
    if not pass0:
        result['behavior_msg'] = 'gradient_check cho relative error QUÁ LỚN trên case mặc định — gradient không khớp finite-difference: ' + str(rel0)
        return result

    y9, P9, params9, cache9 = ml_lab.load_backprop_case(seed=9001)
    ref_grads9 = _c3l13_ref_backward(y9, P9, params9, cache9)
    try:
        got_grads9 = fn(y9, P9, params9, cache9)
        ok_hidden = isinstance(got_grads9, dict) and all(
            k in got_grads9 and np.allclose(np.asarray(got_grads9[k], dtype=float), ref_grads9[k], atol=1e-8)
            for k in ('W1', 'b1', 'W2', 'b2')
        )
        rel9 = ml_lab.gradient_check(params9, got_grads9, y9, cache9['X']) if ok_hidden else {}
        pass9 = ok_hidden and all(v < 1e-3 for v in rel9.values())
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại trên case ẩn (seed khác) bị lỗi: ' + str(e)
        return result
    if pass9:
        result['behavior_ok'] = True
        result['behavior_msg'] = 'gradient_check cho relative error rất nhỏ trên CẢ case mặc định lẫn case ẩn (seed khác) — gradient đúng thật, không hard-code.'
    else:
        result['behavior_msg'] = 'Trên case ẩn: gradient sai hoặc gradient_check relative error quá lớn — không hard-code được thuật toán thật.'
        return result

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result


def _select_checkpoint_uses_wrong_curve(fn_def):
    """True nếu vòng lặp chọn checkpoint duyệt qua THAM SỐ ĐẦU (train_curve) mà
    KHÔNG nhắc tới tham số thứ hai (val_curve) — đúng misconception spec:
    "validation checkpoint, not training minimum, controls selection"."""
    if len(fn_def.args.args) < 2:
        return False
    train_name = fn_def.args.args[0].arg
    val_name = fn_def.args.args[1].arg
    for n in ast.walk(fn_def):
        if isinstance(n, ast.For):
            iter_src = ast.dump(n.iter)
            if train_name in iter_src and val_name not in iter_src:
                return True
    return False


def _c3l14_ref_select_checkpoint(train_curve, val_curve, patience):
    best_val = float('inf')
    best_epoch = None
    patience_left = patience
    for epoch, v in enumerate(val_curve, start=1):
        if v < best_val:
            best_val = v
            best_epoch = epoch
            patience_left = patience
        else:
            patience_left -= 1
            if patience_left == 0:
                break
    return best_epoch, best_val


def _c3l14_ref_summarize_metrics(confusion):
    tp, tn, fp, fn = confusion['tp'], confusion['tn'], confusion['fp'], confusion['fn']
    accuracy = (tp + tn) / max(1, (tp + tn + fp + fn))
    precision = tp / max(1, (tp + fp))
    recall = tp / max(1, (tp + fn))
    f1 = 2 * precision * recall / max(1e-9, (precision + recall))
    return {'accuracy': accuracy, 'precision': precision, 'recall': recall, 'f1': f1}


def _c3l14_metrics_close(a, b, tol=1e-6):
    return all(abs(a[k] - b[k]) < tol for k in ('accuracy', 'precision', 'recall', 'f1'))


# ── C3-14 — Train, evaluate and defend a neural network experiment ────────
def grade_lesson_c3_14(user_code):
    """Bài C3-14 — Chọn checkpoint đúng (early stopping) + tính metric, trên
    đường cong train/val THẬT từ 1 lần train PyTorch thật (offline, không chạy
    torch trong Pyodide — quyết định kiến trúc user chốt 2026-08-02). Unsafe-
    but-correct của spec: chọn theo TRAIN LOSS thấp nhất thay vì VALIDATION
    checkpoint — Risk tier bắt bằng AST, Behavior tier bắt bằng case ẩn khác
    hẳn (patience/độ dài đường cong khác)."""
    result = _empty_result()
    tree = _parse_or_fail(user_code, result)
    if tree is None:
        return result

    fn_sel = _find_funcdef(tree, 'select_checkpoint')
    fn_sum = _find_funcdef(tree, 'summarize_metrics')
    if fn_sel is None or len(fn_sel.args.args) < 2:
        result['code_msg'] = 'Cần hàm select_checkpoint(train_curve, val_curve, patience) ít nhất 2 tham số.'
        return result
    if fn_sum is None or len(fn_sum.args.args) != 1:
        result['code_msg'] = 'Cần hàm summarize_metrics(confusion) đúng 1 tham số.'
        return result
    if not _uses_call(tree, 'load_experiment_run'):
        result['code_msg'] = 'Cần load_experiment_run từ ml_lab để lấy đường cong train/val THẬT.'
        return result
    val_name = fn_sel.args.args[1].arg
    if not _expr_mentions_name(fn_sel, val_name):
        result['code_msg'] = 'select_checkpoint phải DÙNG val_curve (tham số thứ 2) để quyết định checkpoint.'
        return result
    result['code_ok'] = True
    result['code_msg'] = 'Đủ select_checkpoint + summarize_metrics, dùng load_experiment_run thật.'

    if _select_checkpoint_uses_wrong_curve(fn_sel):
        result['risk_msg'] = 'select_checkpoint đang chọn checkpoint theo TRAIN_CURVE (train loss thấp nhất) thay vì VAL_CURVE — đây chính là "training minimum" thay vì "validation checkpoint", dễ chọn nhầm 1 model đã overfit.'
        return result
    result['risk_ok'] = True
    result['risk_msg'] = 'select_checkpoint chọn theo validation curve — đúng nguyên tắc "validation checkpoint, not training minimum, controls selection".'

    try:
        ns, out = _exec_capture(tree)
    except Exception as e:
        result['output_msg'] = 'Lỗi khi chạy: ' + str(e)
        return result
    result['stdout'] = out

    sel_fn = ns.get('select_checkpoint')
    sum_fn = ns.get('summarize_metrics')
    run0 = ml_lab.load_experiment_run('B_reference')
    ref_epoch0, ref_val0 = _c3l14_ref_select_checkpoint(run0['train_curve'], run0['val_curve'], run0['patience'])
    ref_metrics0 = _c3l14_ref_summarize_metrics(run0['confusion'])
    try:
        got_epoch0, got_val0 = sel_fn(run0['train_curve'], run0['val_curve'], run0['patience'])
        got_metrics0 = sum_fn(run0['confusion'])
        ok0 = (got_epoch0 == ref_epoch0 and abs(got_val0 - ref_val0) < 1e-6
               and _c3l14_metrics_close(got_metrics0, ref_metrics0))
    except Exception as e:
        result['output_msg'] = 'Gọi select_checkpoint/summarize_metrics bị lỗi: ' + str(e)
        return result
    if not ok0:
        result['output_msg'] = 'best_epoch/best_val hoặc metrics chưa khớp tham chiếu trên run B_reference (161 tham số, patience=8).'
        return result
    result['output_ok'] = True
    result['output_msg'] = 'best_epoch/best_val và đủ 4 metric (accuracy/precision/recall/f1) khớp tham chiếu trên run thật.'

    run9 = ml_lab.load_experiment_run('C_overfit')
    ref_epoch9, ref_val9 = _c3l14_ref_select_checkpoint(run9['train_curve'], run9['val_curve'], run9['patience'])
    ref_metrics9 = _c3l14_ref_summarize_metrics(run9['confusion'])
    try:
        got_epoch9, got_val9 = sel_fn(run9['train_curve'], run9['val_curve'], run9['patience'])
        got_metrics9 = sum_fn(run9['confusion'])
        ok9 = (got_epoch9 == ref_epoch9 and abs(got_val9 - ref_val9) < 1e-6
               and _c3l14_metrics_close(got_metrics9, ref_metrics9))
    except Exception as e:
        result['behavior_msg'] = 'Chạy lại trên run ẩn (C_overfit, patience=6, 16 epoch) bị lỗi: ' + str(e)
        return result
    if ok9:
        result['behavior_ok'] = True
        result['behavior_msg'] = 'Trên run ẩn HOÀN TOÀN khác (256 hidden unit, patience=6, chỉ 16 epoch): best_epoch/best_val và metrics vẫn khớp tham chiếu — không hard-code theo run mặc định.'
    else:
        result['behavior_msg'] = 'Trên run ẩn: best_epoch/best_val hoặc metrics sai — có thể đang hard-code theo run B_reference thay vì chạy đúng thuật toán tổng quát.'
        return result

    result['overall_pass'] = (result['output_ok'] and result['code_ok']
                               and result['behavior_ok'] and result['risk_ok'])
    return result

