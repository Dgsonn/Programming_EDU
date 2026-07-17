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

    WANT = {'study_hours', 'attendance_rate', 'activity_count'}

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
