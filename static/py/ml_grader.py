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
