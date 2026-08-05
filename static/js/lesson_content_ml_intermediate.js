/* lesson_content_ml_intermediate.js — Course 2 (Machine Learning Trung Cấp / Applied ML).
 * Cùng schema "shell" với lesson_content_ml.js — renderer
 * dùng chung là lesson_db_design.js (KHÔNG có renderer riêng).
 * Anatomy 4 bước / bài:
 *   step_1: you_will_learn + glossary + primer + concept_cards
 *   step_2: mcq[] + mini_game (classify: chips/bins/solution)
 *   step_3: ml_pipeline:true — blocks/drop_zones (kéo hoặc gõ Python) + expected_zones + reveal_hints
 *   step_4: Full Python IDE (Pyodide, chấm 4 tầng) — prompt/context/hints/grader_fn
 * Grader mapping: step_4.grader_fn → static/py/ml_grader.py:grade_lesson_c2_N.
 * Data loaders: static/py/ml_lab.py:load_* (COURSE 2 section). */

window.LESSON_CONTENT = window.LESSON_CONTENT || {};
window.HERO_SVGS_ML = window.HERO_SVGS_ML || {};

window.LESSON_CONTENT['ml_intermediate'] = {
  course_id: 'ml_intermediate',
  course_title: 'Machine Learning Trung Cấp',
  accent_color: '#60A5FA',
  module_color: '#60A5FA',
  total_lessons: 14,
  lessons: [
    // ╔══════════════════════════════════════════════════════════╗
    // ║  M1 — LINEAR MODELS IN PRACTICE                          ║
    // ╚══════════════════════════════════════════════════════════╝
    {
      id: 'c2_l1',
      index: 1,
      title: 'Multiple Linear Regression trong một pipeline thực tế',
      subtitle: 'Nhiều feature, đúng quy trình train → validate',
      module: 1,
      module_title: 'M1 · Linear Models in Practice',
      estimated_minutes: 22,
      xp_reward: 60,
      achievement: { name: 'Pipeline Builder', desc: 'Fit Multiple Regression đúng quy trình — train riêng, validate riêng.' },
      story: {
        tag: '📊 StudyLab · Applied ML Lab',
        hook: 'Course 1, model của bạn chỉ nhìn 1 feature (study_hours) để dự đoán final_score. Nhưng StudyLab có sẵn attendance và sleep_h — bỏ phí 2 tín hiệu có ích. Bây giờ bạn build một pipeline THẬT: nhiều feature cùng lúc, và quan trọng hơn — fit model TRÊN TRAIN, đánh giá TRÊN VALIDATION, không được để 2 tập này giẫm chân nhau.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Fit Multiple Linear Regression với nhiều feature cùng lúc bằng scikit-learn.',
            'Đánh giá model trên một validation set TÁCH RIÊNG khỏi train — không leak.',
            'Đọc hệ số hồi quy (coefficient) để biết feature nào đóng góp nhiều nhất.',
          ],
        },
        glossary: [
          { term: 'Multiple Linear Regression', vi: 'Hồi quy tuyến tính đa biến', def: 'Mở rộng Linear Regression: dự đoán target từ TỔ HỢP TUYẾN TÍNH của nhiều feature cùng lúc, mỗi feature có 1 hệ số riêng.', out: 'ŷ = w1·x1 + w2·x2 + w3·x3 + b' },
          { term: 'Train / Validation split', vi: 'Tách tập huấn luyện / kiểm định', def: 'Chia dữ liệu thành 2 phần: train để MODEL học, validation để KIỂM TRA model học tốt đến đâu trên dữ liệu nó chưa thấy.' },
          { term: 'Coefficient', vi: 'Hệ số hồi quy', def: 'Trọng số của mỗi feature trong phương trình — hệ số càng lớn (trị tuyệt đối), feature đó càng ảnh hưởng mạnh đến dự đoán.' },
        ],
        primer: {
          goal: ['Fit LinearRegression với 3 feature: study_hours, attendance, sleep_h.', 'Đánh giá bằng MSE + R² trên validation, không phải train.'],
          intro: '<p>Một pipeline "thật" không chỉ là gọi <code>.fit()</code> — nó là kỷ luật: dữ liệu train KHÔNG BAO GIỜ được dùng để đánh giá, vì model luôn "học thuộc" train tốt hơn dữ liệu thật sự chưa thấy. Validation set mô phỏng "học viên mới" mà model chưa từng gặp.</p>',
          example: '',
        },
        concept_cards: [
          { icon: 'fa-layer-group', title: '3 feature cùng lúc', body: 'study_hours, attendance, sleep_h — mỗi cột đóng góp một phần vào dự đoán final_score.' },
          { icon: 'fa-scissors', title: 'Tách train/validation', body: '70% dữ liệu để model học (fit), 30% để đánh giá (predict + so sánh) — không trộn lẫn.' },
          { icon: 'fa-magnifying-glass-chart', title: 'Đọc hệ số', body: 'coef_ lớn nhất cho biết feature nào StudyLab nên chú ý nhất khi tư vấn học viên.' },
        ],
        visual: {
          schema: {
            table_name: 'multi_regression_students',
            columns: [
              { name: 'study_hours', type: 'FLOAT', key: '' },
              { name: 'attendance', type: 'INT', key: '' },
              { name: 'sleep_h', type: 'FLOAT', key: '' },
              { name: 'final_score', type: 'FLOAT', key: '' },
            ],
          },
          data_preview: [
            ['6.5', '88', '7.1', '74.2'],
            ['3.0', '60', '5.8', '48.5'],
            ['8.2', '95', '7.6', '82.1'],
            ['2.1', '48', '5.0', '38.0'],
          ],
        },
      },
      step_2: {
        mcq: [
          {
            question: 'Vì sao PHẢI đánh giá model trên validation set thay vì chính train set?',
            options: [
              { id: 'a', text: 'Vì model luôn "học thuộc" dữ liệu train tốt hơn — đánh giá trên train sẽ luôn cho kết quả lạc quan giả tạo', correct: true, explanation: 'Đúng — đây là lý do cốt lõi của việc tách train/validation.' },
              { id: 'b', text: 'Vì scikit-learn không cho phép predict trên chính dữ liệu train', correct: false, explanation: 'sklearn hoàn toàn cho phép — vấn đề không phải kỹ thuật mà là Ý NGHĨA của con số đánh giá.' },
              { id: 'c', text: 'Vì train set luôn có ít dữ liệu hơn validation set', correct: false, explanation: 'Thường NGƯỢC LẠI — train set thường LỚN hơn (vd 70% vs 30%).' },
              { id: 'd', text: 'Vì LinearRegression chỉ hỗ trợ 1 feature khi predict trên train', correct: false, explanation: 'LinearRegression hỗ trợ nhiều feature ở cả fit và predict — không có giới hạn này.' },
            ],
          },
          {
            question: 'Trong Multiple Linear Regression, hệ số (coefficient) của một feature cho biết điều gì?',
            options: [
              { id: 'a', text: 'Mức độ đóng góp của feature đó vào dự đoán — hệ số lớn (trị tuyệt đối) nghĩa là ảnh hưởng mạnh', correct: true, explanation: 'Chính xác — đây là cách đọc coef_ cơ bản (giả định các feature đã ở thang đo tương đương).' },
              { id: 'b', text: 'Thứ tự cột của feature đó trong DataFrame', correct: false, explanation: 'Thứ tự cột không liên quan đến hệ số — hệ số phản ánh MỐI QUAN HỆ giữa feature và target.' },
              { id: 'c', text: 'Số lượng giá trị null trong cột đó', correct: false, explanation: 'Không liên quan — đó là vấn đề chất lượng dữ liệu, khác với hệ số hồi quy.' },
              { id: 'd', text: 'Luôn là một số dương', correct: false, explanation: 'Hệ số có thể ÂM — nghĩa là feature đó có quan hệ NGƯỢC CHIỀU với target.' },
            ],
          },
        ],
        mini_game: {
          title: 'Thực hành nào ĐÚNG trong một pipeline Multiple Regression?',
          instruction: 'Xếp mỗi thực hành vào đúng nhóm.',
          chips: [
            { id: 'chip-fittrain', label: 'fit() model CHỈ trên tập train' },
            { id: 'chip-evalval', label: 'Đánh giá MSE/R² trên tập validation riêng' },
            { id: 'chip-fitval', label: 'fit() model trên CẢ train và validation gộp lại' },
            { id: 'chip-evaltrain', label: 'Đánh giá model bằng chính dữ liệu đã dùng để train' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-fittrain': 'dung', 'chip-evalval': 'dung', 'chip-fitval': 'sai', 'chip-evaltrain': 'sai' },
          success_html: '✅ fit() chỉ trên train, đánh giá trên validation riêng — kỷ luật cốt lõi của mọi pipeline ML.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Build pipeline: fit LinearRegression trên train, đánh giá MSE + R² trên validation.',
        blocks: [
          { type: 'py', token: 'from sklearn.linear_model import LinearRegression', slot: 'z1a' },
          { type: 'py', token: 'from ml_lab import load_multi_regression_splits', slot: 'z1b' },
          { type: 'py', token: 'X_train, X_val, y_train, y_val =', slot: 'z2a' },
          { type: 'py', token: 'load_multi_regression_splits()', slot: 'z2b' },
          { type: 'py', token: 'model =', slot: 'z3a' },
          { type: 'py', token: 'LinearRegression().fit(X_train, y_train)', slot: 'z3b' },
          { type: 'py', token: 'pred =', slot: 'z4a' },
          { type: 'py', token: 'model.predict(X_val)', slot: 'z4b' },
        ],
        drop_zones: [
          { id: 'l1-import', accepts: ['py'], multi: true },
          { id: 'l1-load', accepts: ['py'], multi: true },
          { id: 'l1-fit', accepts: ['py'], multi: true },
          { id: 'l1-predict', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'l1-import': 'from sklearn.linear_model import LinearRegression from ml_lab import load_multi_regression_splits',
          'l1-load': 'X_train, X_val, y_train, y_val = load_multi_regression_splits()',
          'l1-fit': 'model = LinearRegression().fit(X_train, y_train)',
          'l1-predict': 'pred = model.predict(X_val)',
        },
        reveal_hints: {
          'l1-import': 'Import <strong>LinearRegression</strong> và <strong>load_multi_regression_splits</strong>.',
          'l1-load': 'Nạp 4 mảng: <strong>X_train, X_val, y_train, y_val</strong>.',
          'l1-fit': 'Fit CHỈ trên train: <strong>LinearRegression().fit(X_train, y_train)</strong>.',
          'l1-predict': 'Predict trên validation: <strong>model.predict(X_val)</strong>.',
        },
        expected_sql: 'from sklearn.linear_model import LinearRegression from ml_lab import load_multi_regression_splits X_train, X_val, y_train, y_val = load_multi_regression_splits() model = LinearRegression().fit(X_train, y_train) pred = model.predict(X_val)',
      },
      drag_map: {
        brand: 'DÒNG CHẢY APPLIED ML LAB',
        table_sub: 'DataFrame nguồn · 3 feature sinh viên',
        idle_sub: 'Bấm ▶ để chạy pipeline',
        run_label: '▶ Chạy Pipeline',
        table: {
          name: 'multi_regression_students',
          columns: ['study_hours', 'attendance', 'sleep_h', 'final_score'],
          dataRows: [
            ['6.5', '88', '7.1', '74.2'],
            ['3.0', '60', '5.8', '48.5'],
            ['8.2', '95', '7.6', '82.1'],
            ['2.1', '48', '5.0', '38.0'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Fit <code>LinearRegression</code> trên train, đánh giá trên validation. In <code>val_mse</code> và <code>val_r2</code>.</p>',
        context: {
          scenario: 'StudyLab muốn nâng cấp model dự đoán final_score từ 1 feature lên 3 feature — nhưng phải chứng minh model thật sự tốt hơn bằng validation, không phải "trông có vẻ đúng".',
          real_world: 'Giống việc luyện thi thử trước khi thi thật — bạn không chấm điểm bài luyện tập rồi tuyên bố "sẵn sàng thi 10 điểm". Phải làm một đề CHƯA TỪNG LUYỆN (validation) để biết trình độ thật.',
          steps: [
            'Load 4 mảng: <code>load_multi_regression_splits()</code>.',
            'Fit <code>LinearRegression()</code> CHỈ trên <code>X_train, y_train</code>.',
            'Predict trên <code>X_val</code> — KHÔNG predict lại trên X_train.',
            'In <code>val_mse</code> và <code>val_r2</code> — R² càng gần 1 càng tốt.',
          ],
          hint_explore: 'Muốn xem shape dữ liệu? Gõ <code>print(X_train.shape, X_val.shape)</code> rồi Run.',
          expected: 'Console in val_mse (một số dương) và val_r2 (nên > 0.4, thường ~0.7-0.9 với dữ liệu này).',
        },
        hints: [
          { level: 1, text: 'Dùng <code>from sklearn.linear_model import LinearRegression</code>.' },
          { level: 2, text: 'Fit: <code>model = LinearRegression().fit(X_train, y_train)</code> — chỉ truyền train.' },
          { level: 3, text: 'MSE: <code>((y_val - pred)**2).mean()</code>. R²: <code>model.score(X_val, y_val)</code> (sklearn tính sẵn) hoặc tự tính bằng công thức 1 - SS_res/SS_tot.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>from sklearn.linear_model import LinearRegression<br>from ml_lab import load_multi_regression_splits<br>X_train, X_val, y_train, y_val = load_multi_regression_splits()<br>model = LinearRegression().fit(X_train, y_train)<br>pred = model.predict(X_val)<br>val_mse = ((y_val - pred)**2).mean()<br>val_r2 = model.score(X_val, y_val)<br>print("val_mse", val_mse, "val_r2", val_r2)</code>' },
        ],
        grader_fn: 'grade_lesson_c2_1',
        success_message: 'Bạn đã build pipeline Multiple Regression đúng cách — fit trên train, đánh giá trung thực trên validation.',
        xp_reward: 60,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.linear_model import LinearRegression',
      },
    },

    {
      id: 'c2_l2',
      index: 2,
      title: 'Feature Scaling và Convergence',
      subtitle: 'Thang đo lệch nhau làm Gradient Descent hội tụ chậm hoặc phân kỳ',
      module: 1,
      module_title: 'M1 · Linear Models in Practice',
      estimated_minutes: 22,
      xp_reward: 60,
      achievement: { name: 'Convergence Tuner', desc: 'Chứng minh scaling giúp gradient descent hội tụ ổn định.' },
      story: {
        tag: '📊 StudyLab · Applied ML Lab',
        hook: 'Bạn thêm feature family_income (15,000 – 90,000) bên cạnh study_hours (0.5 – 10). Chạy gradient descent với learning rate như cũ — loss KHÔNG giảm, nó NỔ TUNG thành vô cực. Vấn đề không phải learning rate "sai" — mà là 2 feature lệch thang đo hàng chục nghìn lần khiến gradient của income áp đảo hoàn toàn gradient của study_hours.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Giải thích vì sao feature lệch thang đo lớn làm gradient descent hội tụ chậm hoặc phân kỳ.',
            'Chuẩn hoá dữ liệu bằng StandardScaler (hoặc tự tính mean/std) trước khi chạy GD.',
            'So sánh trực tiếp loss curve KHÔNG scale vs CÓ scale trên cùng dữ liệu.',
          ],
        },
        glossary: [
          { term: 'Convergence', vi: 'Sự hội tụ', def: 'Trạng thái loss giảm dần và ổn định về một giá trị nhỏ qua các vòng lặp gradient descent — ngược với PHÂN KỲ (loss tăng vọt/vô cực).' },
          { term: 'Feature scaling', vi: 'Chuẩn hoá đặc trưng', def: 'Đưa các feature về cùng một thang đo (thường mean=0, std=1) trước khi train — đặc biệt quan trọng với các thuật toán dựa trên gradient hoặc khoảng cách.' },
          { term: 'Learning rate quá lớn (so với thang đo)', vi: 'Tốc độ học không phù hợp thang đo', def: 'Một learning rate "an toàn" cho feature nhỏ có thể gây bước nhảy khổng lồ trên feature có thang đo lớn — dẫn đến phân kỳ.' },
        ],
        primer: {
          goal: ['Chạy GD trên dữ liệu chưa scale, quan sát loss.', 'Scale rồi chạy lại GD, so sánh trực tiếp.'],
          intro: '<p>Gradient descent cập nhật trọng số theo <code>w -= lr * gradient</code>. Nếu 1 feature có thang đo hàng chục nghìn (family_income) và 1 feature khác chỉ 0-10 (study_hours), gradient của income sẽ LỚN HƠN RẤT NHIỀU — cùng 1 learning rate sẽ khiến trọng số của income nhảy quá xa mỗi bước, làm loss phân kỳ thay vì hội tụ.</p>',
          example: '',
        },
        concept_cards: [
          { icon: 'fa-triangle-exclamation', title: 'Chưa scale', body: 'family_income (hàng chục nghìn) áp đảo gradient — loss có thể tăng vọt đến vô cực (inf) chỉ sau vài bước.' },
          { icon: 'fa-scale-balanced', title: 'Đã scale', body: 'Cả 2 feature cùng thang đo (mean=0, std=1) — gradient descent hội tụ mượt, ổn định.' },
          { icon: 'fa-chart-line', title: 'So sánh loss curve', body: 'Cùng learning rate, cùng số vòng lặp — chỉ khác việc CÓ hay KHÔNG scale trước.' },
        ],
        visual: {
          schema: {
            table_name: 'gd_convergence_report',
            columns: [
              { name: 'iteration', type: 'INT', key: '' },
              { name: 'loss_raw', type: 'VARCHAR', key: '' },
              { name: 'loss_scaled', type: 'FLOAT', key: '' },
            ],
          },
          data_preview: [
            ['0', '1327.4', '1327.4'],
            ['10', 'overflow', '156.2'],
            ['50', 'inf', '2.12'],
          ],
        },
      },
      step_2: {
        mcq: [
          {
            question: 'Vì sao gradient descent DỄ PHÂN KỲ khi 2 feature lệch thang đo rất xa (vd 0-10 vs 15,000-90,000)?',
            options: [
              { id: 'a', text: 'Vì gradient của feature thang đo lớn cũng lớn hơn nhiều — cùng 1 learning rate gây bước nhảy quá xa cho feature đó', correct: true, explanation: 'Chính xác — đây là cơ chế toán học của vấn đề.' },
              { id: 'b', text: 'Vì gradient descent không hỗ trợ nhiều hơn 1 feature', correct: false, explanation: 'Gradient descent hỗ trợ bao nhiêu feature cũng được — vấn đề là THANG ĐO, không phải số lượng.' },
              { id: 'c', text: 'Vì Python không tính được số lớn hơn 10,000', correct: false, explanation: 'Python/NumPy xử lý số lớn hoàn toàn bình thường — vấn đề là bản chất thuật toán GD, không phải giới hạn ngôn ngữ.' },
              { id: 'd', text: 'Vì cần ít nhất 1000 mẫu dữ liệu mới chạy được GD', correct: false, explanation: 'Số lượng mẫu không liên quan đến vấn đề phân kỳ do lệch thang đo.' },
            ],
          },
          {
            question: 'StandardScaler biến đổi mỗi cột về dạng nào?',
            options: [
              { id: 'a', text: 'mean = 0, std = 1 (chuẩn hoá theo phân phối)', correct: true, explanation: 'Đúng — đây là định nghĩa của StandardScaler (z-score normalization).' },
              { id: 'b', text: 'Khoảng giá trị [0, 1] (min-max)', correct: false, explanation: 'Đó là MinMaxScaler — StandardScaler dùng mean/std, không phải min/max.' },
              { id: 'c', text: 'Số nguyên (int) thay vì số thực', correct: false, explanation: 'StandardScaler không đổi kiểu dữ liệu — nó chỉ thay đổi GIÁ TRỊ theo mean/std.' },
              { id: 'd', text: 'Sắp xếp lại thứ tự các dòng dữ liệu', correct: false, explanation: 'Scaling không đụng đến THỨ TỰ dòng — nó chỉ biến đổi GIÁ TRỊ của từng cột.' },
            ],
          },
        ],
        mini_game: {
          title: 'Statement nào ĐÚNG về feature scaling & convergence?',
          instruction: 'Xếp mỗi statement vào đúng nhóm.',
          chips: [
            { id: 'chip-diverge', label: 'Feature lệch thang đo lớn có thể làm GD phân kỳ (loss → inf)' },
            { id: 'chip-scale-first', label: 'Nên scale TRƯỚC khi chạy gradient descent với nhiều feature' },
            { id: 'chip-noeffect', label: 'Thang đo của feature không ảnh hưởng gì đến gradient descent' },
            { id: 'chip-alwaysbig', label: 'Learning rate lớn luôn luôn tốt bất kể thang đo feature' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-diverge': 'dung', 'chip-scale-first': 'dung', 'chip-noeffect': 'sai', 'chip-alwaysbig': 'sai' },
          success_html: '✅ Scaling trước GD là thực hành chuẩn — tránh phân kỳ do lệch thang đo giữa các feature.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Chạy GD KHÔNG scale, rồi CÓ scale — so sánh loss cuối cùng.',
        blocks: [
          { type: 'py', token: 'from ml_lab import load_scaling_convergence_data, run_gd_linear', slot: 'z1a' },
          { type: 'py', token: 'X, y =', slot: 'z2a' },
          { type: 'py', token: 'load_scaling_convergence_data()', slot: 'z2b' },
          { type: 'py', token: 'w, b, hist_raw =', slot: 'z3a' },
          { type: 'py', token: 'run_gd_linear(X, y, lr=0.0000005, n_iter=50)', slot: 'z3b' },
          { type: 'py', token: 'Xs =', slot: 'z4a' },
          { type: 'py', token: '(X - X.mean(axis=0)) / X.std(axis=0)', slot: 'z4b' },
        ],
        drop_zones: [
          { id: 'l2-import', accepts: ['py'], multi: true },
          { id: 'l2-load', accepts: ['py'], multi: true },
          { id: 'l2-rawgd', accepts: ['py'], multi: true },
          { id: 'l2-scale', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'l2-import': 'from ml_lab import load_scaling_convergence_data, run_gd_linear',
          'l2-load': 'X, y = load_scaling_convergence_data()',
          'l2-rawgd': 'w, b, hist_raw = run_gd_linear(X, y, lr=0.0000005, n_iter=50)',
          'l2-scale': 'Xs = (X - X.mean(axis=0)) / X.std(axis=0)',
        },
        reveal_hints: {
          'l2-import': 'Import <strong>load_scaling_convergence_data</strong> và <strong>run_gd_linear</strong>.',
          'l2-load': 'Nạp dữ liệu: <strong>X, y = load_scaling_convergence_data()</strong>.',
          'l2-rawgd': 'Chạy GD trên dữ liệu THÔ với learning rate rất nhỏ (vẫn có thể phân kỳ!).',
          'l2-scale': 'Scale bằng tay: <strong>(X - X.mean(axis=0)) / X.std(axis=0)</strong>.',
        },
        expected_sql: 'from ml_lab import load_scaling_convergence_data, run_gd_linear X, y = load_scaling_convergence_data() w, b, hist_raw = run_gd_linear(X, y, lr=0.0000005, n_iter=50) Xs = (X - X.mean(axis=0)) / X.std(axis=0)',
      },
      drag_map: {
        brand: 'DÒNG CHẢY APPLIED ML LAB',
        table_sub: 'Loss theo vòng lặp · raw vs scaled',
        idle_sub: 'Bấm ▶ để chạy GD',
        run_label: '▶ Chạy Gradient Descent',
        table: {
          name: 'gd_convergence_report',
          columns: ['iteration', 'loss_raw', 'loss_scaled'],
          dataRows: [
            ['0', '1327.4', '1327.4'],
            ['10', 'overflow', '156.2'],
            ['50', 'inf', '2.12'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Chạy gradient descent KHÔNG scale (<code>raw_loss</code>) và CÓ scale (<code>scaled_loss</code>). In cả hai. <code>unscaled_loss</code> phải TỆ HƠN HẲN.</p>',
        context: {
          scenario: 'family_income (hàng chục nghìn) và study_hours (0-10) cùng dùng để dự đoán "độ sẵn sàng" — nhưng chạy GD thẳng trên dữ liệu thô sẽ phân kỳ.',
          real_world: 'Giống việc đo 1 vật bằng "mét" và 1 vật khác bằng "milimét" rồi cộng trực tiếp 2 con số lại — đơn vị khác nhau khiến con số lớn (milimét) áp đảo hoàn toàn, dù về ý nghĩa vật lý 2 phép đo có thể ngang nhau.',
          steps: [
            'Load dữ liệu: <code>load_scaling_convergence_data()</code>.',
            'Chạy <code>run_gd_linear(X, y, lr=0.0000005, n_iter=50)</code> — dữ liệu THÔ. Lấy loss cuối cùng làm <code>unscaled_loss</code>.',
            'Scale <code>X</code> bằng mean/std (hoặc StandardScaler).',
            'Chạy lại <code>run_gd_linear(Xs, y, lr=0.1, n_iter=50)</code> trên dữ liệu ĐÃ scale. Lấy loss cuối làm <code>scaled_loss</code>. In cả 2.',
          ],
          hint_explore: 'Muốn xem thang đo 2 cột? Gõ <code>print(X.min(axis=0), X.max(axis=0))</code> rồi Run.',
          expected: 'unscaled_loss rất lớn hoặc <code>inf</code> (phân kỳ); scaled_loss là một số nhỏ, hữu hạn (vd ~2.1).',
        },
        hints: [
          { level: 1, text: '<code>run_gd_linear</code> trả về <code>(w, b, loss_history)</code> — lấy phần tử CUỐI của loss_history.' },
          { level: 2, text: 'Scale bằng tay: <code>Xs = (X - X.mean(axis=0)) / X.std(axis=0)</code>, hoặc dùng <code>StandardScaler().fit_transform(X)</code>.' },
          { level: 3, text: 'Learning rate PHẢI khác nhau giữa 2 lần chạy: rất nhỏ (vd 0.0000005) cho dữ liệu thô, bình thường (vd 0.1) cho dữ liệu đã scale.' },
        ],
        grader_fn: 'grade_lesson_c2_2',
        success_message: 'Bạn đã chứng minh bằng số liệu thật: scaling giúp gradient descent hội tụ ổn định thay vì phân kỳ.',
        xp_reward: 60,
        starter_hint: '💡 Bắt đầu bằng: from ml_lab import load_scaling_convergence_data, run_gd_linear',
      },
    },
    // ╔══════════════════════════════════════════════════════════╗
    // ║  M2 — LOGISTIC REGRESSION & REGULARIZATION               ║
    // ╚══════════════════════════════════════════════════════════╝
    {
      id: 'c2_l3',
      index: 3,
      title: 'Logistic Loss và những prediction sai đầy tự tin',
      subtitle: 'Log loss phạt nặng dự đoán sai mà rất chắc chắn',
      module: 2,
      module_title: 'M2 · Logistic Regression & Regularization',
      estimated_minutes: 22,
      xp_reward: 60,
      achievement: { name: 'Confident-Wrong Hunter', desc: 'Chứng minh log loss phạt nặng dự đoán sai đầy tự tin.' },
      story: {
        tag: '📊 StudyLab · Applied ML Lab',
        hook: 'Hai model cùng dự đoán sai 2/6 học viên (cùng accuracy). Model A nói "tôi không chắc lắm" (xác suất gần 0.5) khi sai. Model B nói "tôi CHẮC CHẮN 97%" khi sai. Cả 2 đều sai như nhau về accuracy — nhưng model B đáng sợ hơn nhiều: nó SAI mà vẫn TỰ TIN tuyệt đối. Log loss là thước đo duy nhất trong 2 metric này thực sự "nhìn thấy" sự khác biệt đó.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Tính log loss (binary cross-entropy) bằng công thức toán học.',
            'Chứng minh 2 model cùng accuracy có thể có log loss khác nhau RẤT NHIỀU.',
            'Giải thích vì sao log loss phạt nặng các dự đoán sai mà tự tin cao.',
          ],
        },
        glossary: [
          { term: 'Log loss (Binary Cross-Entropy)', vi: 'Hàm mất mát logarit', def: 'Đo "khoảng cách" giữa xác suất dự đoán và nhãn thật — càng dự đoán sai VÀ tự tin, log loss càng lớn (tiến tới vô cực khi dự đoán 0% hoặc 100% sai hoàn toàn).', out: '-(y·log(p) + (1-y)·log(1-p))' },
          { term: 'Overconfident prediction', vi: 'Dự đoán quá tự tin', def: 'Xác suất dự đoán rất gần 0 hoặc 1 — nếu đúng thì tốt, nhưng nếu SAI thì bị phạt cực nặng bởi log loss.' },
          { term: 'Accuracy vs Log loss', vi: 'Độ chính xác vs Log loss', def: 'Accuracy chỉ đếm số dự đoán đúng/sai (nhị phân) — log loss còn quan tâm ĐỘ TỰ TIN của mỗi dự đoán, thông tin mà accuracy hoàn toàn bỏ qua.' },
        ],
        primer: {
          goal: ['Tính log loss cho 2 bộ dự đoán cùng accuracy.', 'So sánh trực tiếp: bộ nào bị phạt nặng hơn và vì sao.'],
          intro: '<p>Accuracy chỉ hỏi "đúng hay sai?" — một câu hỏi nhị phân, thô. Log loss hỏi thêm "bạn tự tin đến mức nào?" — nếu bạn SAI mà tự tin 97%, log loss coi đó là một lỗi NGHIÊM TRỌNG hơn nhiều so với SAI mà chỉ tự tin 55%, dù cả 2 đều tính là "1 lần sai" trong accuracy.</p>',
          example: '',
        },
        concept_cards: [
          { icon: 'fa-face-meh', title: 'Model thận trọng (cautious)', body: 'Sai 2/6, nhưng xác suất luôn gần 0.5 khi sai — "biết mình có thể sai".' },
          { icon: 'fa-face-flushed', title: 'Model quá tự tin (overconfident)', body: 'Sai CÙNG 2/6 học viên, nhưng xác suất 0.05 hoặc 0.97 — "chắc chắn tuyệt đối" mà vẫn sai.' },
          { icon: 'fa-scale-unbalanced', title: 'Log loss khác biệt rõ rệt', body: 'Cùng accuracy, nhưng overconfident có log loss cao hơn hẳn — đây là thông tin accuracy KHÔNG thấy được.' },
        ],
        visual: {
          schema: {
            table_name: 'logloss_comparison',
            columns: [
              { name: 'model', type: 'VARCHAR', key: 'PK' },
              { name: 'accuracy', type: 'FLOAT', key: '' },
              { name: 'log_loss', type: 'FLOAT', key: '' },
            ],
          },
          data_preview: [
            ['cautious', '0.667', '0.655'],
            ['overconfident', '0.667', '1.453'],
          ],
        },
      },
      step_2: {
        mcq: [
          {
            question: '2 model cùng accuracy (cùng số dự đoán đúng/sai), nhưng model B luôn dự đoán với xác suất cực đoan (gần 0 hoặc 1). Log loss của model B so với model A (dự đoán ôn hoà hơn) sẽ như thế nào NẾU B sai ở những điểm nó tự tin?',
            options: [
              { id: 'a', text: 'Log loss của B cao hơn HẲN — bị phạt nặng vì sai mà tự tin', correct: true, explanation: 'Đúng — đây chính là cơ chế bảo vệ của log loss trước các dự đoán "liều lĩnh".' },
              { id: 'b', text: 'Log loss của B luôn bằng A vì accuracy bằng nhau', correct: false, explanation: 'Log loss KHÔNG chỉ phụ thuộc accuracy — nó phụ thuộc GIÁ TRỊ xác suất, nên có thể khác xa nhau dù accuracy bằng nhau.' },
              { id: 'c', text: 'Log loss của B thấp hơn vì tự tin luôn được thưởng điểm', correct: false, explanation: 'Tự tin chỉ được "thưởng" khi ĐÚNG — khi SAI, tự tin cao bị phạt nặng hơn, không phải được thưởng.' },
              { id: 'd', text: 'Không thể so sánh log loss giữa 2 model khác nhau', correct: false, explanation: 'Log loss hoàn toàn so sánh được giữa các model — đó chính là mục đích của nó.' },
            ],
          },
          {
            question: 'Vì sao log loss thường được ưu tiên hơn accuracy khi đánh giá một model xác suất (probabilistic model)?',
            options: [
              { id: 'a', text: 'Vì log loss đánh giá cả CHẤT LƯỢNG của xác suất dự đoán, không chỉ nhãn cuối cùng (đúng/sai)', correct: true, explanation: 'Chính xác — đây là lý do log loss là lựa chọn phổ biến khi cần đánh giá độ tin cậy của model, không chỉ độ chính xác.' },
              { id: 'b', text: 'Vì log loss dễ tính hơn accuracy', correct: false, explanation: 'Log loss thực ra PHỨC TẠP hơn về mặt công thức — accuracy chỉ là phép đếm đơn giản.' },
              { id: 'c', text: 'Vì accuracy không áp dụng được cho bài toán phân loại', correct: false, explanation: 'Accuracy hoàn toàn áp dụng được cho phân loại — đó chính là use case phổ biến nhất của nó.' },
              { id: 'd', text: 'Vì log loss luôn cho giá trị nhỏ hơn accuracy', correct: false, explanation: '2 đại lượng này đo những thứ khác nhau, không có quan hệ "lớn hơn/nhỏ hơn" cố định.' },
            ],
          },
        ],
        mini_game: {
          title: 'Statement nào ĐÚNG về Log Loss?',
          instruction: 'Xếp mỗi statement vào đúng nhóm.',
          chips: [
            { id: 'chip-penalize', label: 'Log loss phạt nặng dự đoán SAI mà TỰ TIN cao' },
            { id: 'chip-sameacc', label: '2 model cùng accuracy luôn có log loss bằng nhau' },
            { id: 'chip-caremore', label: 'Log loss quan tâm đến giá trị xác suất, không chỉ nhãn 0/1 cuối cùng' },
            { id: 'chip-rewardconf', label: 'Tự tin cao luôn được thưởng, bất kể đúng hay sai' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-penalize': 'dung', 'chip-sameacc': 'sai', 'chip-caremore': 'dung', 'chip-rewardconf': 'sai' },
          success_html: '✅ Log loss phạt nặng "sai mà tự tin" — thông tin mà accuracy hoàn toàn bỏ lỡ.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Tính log loss cho 2 bộ dự đoán cùng accuracy — so sánh cautious vs overconfident.',
        blocks: [
          { type: 'py', token: 'import numpy as np', slot: 'z1a' },
          { type: 'py', token: 'from ml_lab import load_logloss_demo', slot: 'z1b' },
          { type: 'py', token: 'y_true, probs_cautious, probs_overconfident =', slot: 'z2a' },
          { type: 'py', token: 'load_logloss_demo()', slot: 'z2b' },
          { type: 'py', token: 'def logloss(y, p):', slot: 'z3a' },
          { type: 'py', token: 'p = np.clip(p, 1e-9, 1-1e-9); return -(y*np.log(p)+(1-y)*np.log(1-p)).mean()', slot: 'z3b' },
          { type: 'py', token: 'cautious_logloss =', slot: 'z4a' },
          { type: 'py', token: 'logloss(y_true, probs_cautious)', slot: 'z4b' },
        ],
        drop_zones: [
          { id: 'l3-import', accepts: ['py'], multi: true },
          { id: 'l3-load', accepts: ['py'], multi: true },
          { id: 'l3-def', accepts: ['py'], multi: true },
          { id: 'l3-compute', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'l3-import': 'import numpy as np from ml_lab import load_logloss_demo',
          'l3-load': 'y_true, probs_cautious, probs_overconfident = load_logloss_demo()',
          'l3-def': 'def logloss(y, p): p = np.clip(p, 1e-9, 1-1e-9); return -(y*np.log(p)+(1-y)*np.log(1-p)).mean()',
          'l3-compute': 'cautious_logloss = logloss(y_true, probs_cautious)',
        },
        reveal_hints: {
          'l3-import': 'Import <strong>numpy</strong> và <strong>load_logloss_demo</strong>.',
          'l3-load': 'Nạp 3 giá trị: <strong>y_true, probs_cautious, probs_overconfident</strong>.',
          'l3-def': 'Định nghĩa hàm log loss — nhớ <strong>np.clip</strong> để tránh log(0).',
          'l3-compute': 'Tính log loss cho bộ cautious trước.',
        },
        expected_sql: 'import numpy as np from ml_lab import load_logloss_demo y_true, probs_cautious, probs_overconfident = load_logloss_demo() def logloss(y, p): p = np.clip(p, 1e-9, 1-1e-9); return -(y*np.log(p)+(1-y)*np.log(1-p)).mean() cautious_logloss = logloss(y_true, probs_cautious)',
      },
      drag_map: {
        brand: 'DÒNG CHẢY APPLIED ML LAB',
        table_sub: 'So sánh cautious vs overconfident',
        idle_sub: 'Bấm ▶ để tính log loss',
        run_label: '▶ Tính Log Loss',
        table: {
          name: 'logloss_comparison',
          columns: ['model', 'accuracy', 'log_loss'],
          dataRows: [
            ['cautious', '0.667', '0.655'],
            ['overconfident', '0.667', '1.453'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Tính log loss cho <code>probs_cautious</code> và <code>probs_overconfident</code>. In <code>cautious_logloss</code> và <code>overconfident_logloss</code>.</p>',
        context: {
          scenario: 'StudyLab cần chọn giữa 2 model cùng accuracy — bạn phải chứng minh bằng log loss rằng chúng KHÔNG tương đương nhau về chất lượng.',
          real_world: 'Giống việc so sánh 2 bác sĩ chẩn đoán cùng số ca đúng/sai — nhưng bác sĩ A luôn nói "có thể là..." còn bác sĩ B luôn tuyên bố "CHẮC CHẮN 100%". Khi cả 2 sai, bác sĩ B nguy hiểm hơn nhiều vì sự tự tin sai lầm có thể dẫn đến quyết định sai lệch.',
          steps: [
            'Load 3 giá trị: <code>load_logloss_demo()</code>.',
            'Định nghĩa hàm <code>logloss(y, p)</code> — dùng <code>np.clip(p, 1e-9, 1-1e-9)</code> để tránh log(0).',
            'Tính <code>cautious_logloss</code> từ <code>probs_cautious</code>.',
            'Tính <code>overconfident_logloss</code> từ <code>probs_overconfident</code>. In cả 2 — overconfident phải LỚN HƠN HẲN.',
          ],
          hint_explore: 'Muốn xem accuracy của cả 2 bộ trước? Gõ <code>print(((probs_cautious>0.5).astype(int)==y_true).mean())</code> rồi Run.',
          expected: 'Console in cautious_logloss (~0.65) và overconfident_logloss (~1.45) — dù accuracy 2 bộ bằng nhau (0.667).',
        },
        hints: [
          { level: 1, text: 'Công thức: <code>logloss = -(y*log(p) + (1-y)*log(1-p)).mean()</code>.' },
          { level: 2, text: 'Luôn <code>np.clip(p, 1e-9, 1-1e-9)</code> TRƯỚC khi tính log — tránh log(0) = -inf.' },
          { level: 3, text: 'Áp dụng hàm cho CẢ 2 bộ xác suất: <code>probs_cautious</code> và <code>probs_overconfident</code>, in cả 2 kết quả.' },
        ],
        grader_fn: 'grade_lesson_c2_3',
        success_message: 'Bạn đã chứng minh: cùng accuracy nhưng log loss khác xa nhau — sai mà tự tin bị phạt nặng hơn nhiều.',
        xp_reward: 60,
        starter_hint: '💡 Bắt đầu bằng: from ml_lab import load_logloss_demo',
      },
    },

    {
      id: 'c2_l4',
      index: 4,
      title: 'Train Logistic Regression bằng Gradient Descent',
      subtitle: 'Từ log loss đến một classifier thật',
      module: 2,
      module_title: 'M2 · Logistic Regression & Regularization',
      estimated_minutes: 23,
      xp_reward: 60,
      achievement: { name: 'Confident-Wrong Hunter', desc: 'Train Logistic Regression đúng quy trình train/validate.' },
      story: {
        tag: '📊 StudyLab · Applied ML Lab',
        hook: 'Bạn vừa hiểu log loss đo lỗi thế nào. Bây giờ dùng chính log loss đó làm MỤC TIÊU tối ưu: LogisticRegression trong scikit-learn tìm trọng số w, b sao cho log loss trên train là NHỎ NHẤT, bằng gradient descent nội bộ. Việc của bạn: fit đúng quy trình và chứng minh model học được ranh giới thật trên validation.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Fit LogisticRegression bằng scikit-learn — hiểu nó tối ưu log loss bằng gradient descent nội bộ.',
            'Đánh giá classifier bằng validation accuracy, không phải train.',
            'Kết nối lại: log loss (bài trước) chính là hàm mục tiêu logistic regression tối thiểu hoá.',
          ],
        },
        glossary: [
          { term: 'Decision boundary', vi: 'Ranh giới quyết định', def: 'Đường (hoặc siêu phẳng) mà LogisticRegression học được để phân tách 2 lớp — điểm nằm 2 phía cho dự đoán khác nhau.' },
          { term: 'predict vs predict_proba', vi: 'Dự đoán nhãn vs dự đoán xác suất', def: '<code>predict()</code> trả nhãn 0/1 (đã áp ngưỡng 0.5); <code>predict_proba()</code> trả xác suất thô — chứa nhiều thông tin hơn (liên hệ trực tiếp đến log loss bài trước).' },
          { term: 'Gradient descent nội bộ', vi: 'GD bên trong solver', def: 'Khi gọi <code>.fit()</code>, LogisticRegression ngầm chạy gradient descent (hoặc biến thể) để tìm w, b tối thiểu hoá log loss trên train — bạn không thấy vòng lặp, nhưng nó đang chạy.' },
        ],
        primer: {
          goal: ['Fit LogisticRegression trên train.', 'Đánh giá val_accuracy trên validation.'],
          intro: '<p>LogisticRegression KHÔNG phải một thuật toán tách biệt khỏi Linear Regression — nó là Linear Regression + hàm sigmoid + một hàm mất mát khác (log loss thay vì MSE). Khi bạn gọi <code>.fit(X, y)</code>, bên trong nó đang chạy đúng loại gradient descent bạn học ở Course 1, chỉ khác mục tiêu tối ưu.</p>',
          example: '',
        },
        concept_cards: [
          { icon: 'fa-wave-square', title: 'Sigmoid + Log loss', body: 'LogisticRegression = tổ hợp tuyến tính → sigmoid → tối thiểu hoá log loss bằng GD.' },
          { icon: 'fa-code-branch', title: 'predict vs predict_proba', body: 'predict() cho nhãn 0/1; predict_proba() cho xác suất — dùng cái nào tuỳ mục đích.' },
          { icon: 'fa-scissors', title: 'Train riêng, validate riêng', body: 'Cùng kỷ luật Bài 1: fit trên train, đo val_accuracy trên validation.' },
        ],
        visual: {
          schema: {
            table_name: 'logistic_gd_report',
            columns: [
              { name: 'metric', type: 'VARCHAR', key: 'PK' },
              { name: 'value', type: 'VARCHAR', key: '' },
            ],
          },
          data_preview: [
            ['train_accuracy', '~0.80'],
            ['val_accuracy', '~0.75'],
          ],
        },
      },
      step_2: {
        mcq: [
          {
            question: 'Khi gọi <code>LogisticRegression().fit(X, y)</code>, bên trong nó đang làm gì?',
            options: [
              { id: 'a', text: 'Chạy gradient descent (hoặc biến thể) để tìm w, b tối thiểu hoá log loss trên dữ liệu train', correct: true, explanation: 'Đúng — đây chính xác là những gì solver của LogisticRegression làm ngầm.' },
              { id: 'b', text: 'Đếm số lần mỗi nhãn xuất hiện rồi lấy nhãn phổ biến nhất', correct: false, explanation: 'Đó là một baseline ngây thơ (majority classifier), không phải cách LogisticRegression hoạt động.' },
              { id: 'c', text: 'Tìm kiếm brute-force qua mọi tổ hợp w, b có thể', correct: false, explanation: 'Brute-force sẽ cực kỳ chậm với không gian liên tục — LogisticRegression dùng gradient descent (tối ưu có hướng), không phải brute-force.' },
              { id: 'd', text: 'Sao chép nhãn y trực tiếp làm dự đoán', correct: false, explanation: 'Đó sẽ là "học thuộc lòng" (overfit hoàn toàn), không phải cách LogisticRegression học tổng quát hoá.' },
            ],
          },
          {
            question: 'Khác biệt giữa <code>model.predict(X)</code> và <code>model.predict_proba(X)</code> là gì?',
            options: [
              { id: 'a', text: 'predict() trả nhãn 0/1 (đã áp ngưỡng), predict_proba() trả xác suất thô trước khi áp ngưỡng', correct: true, explanation: 'Chính xác — predict_proba() giữ nhiều thông tin hơn, liên hệ trực tiếp đến log loss.' },
              { id: 'b', text: 'predict() nhanh hơn predict_proba() 10 lần', correct: false, explanation: 'Không có sự khác biệt tốc độ đáng kể — khác biệt là Ý NGHĨA của output, không phải hiệu năng.' },
              { id: 'c', text: 'predict_proba() chỉ dùng được cho bài toán hồi quy', correct: false, explanation: 'predict_proba() dùng cho CLASSIFICATION — nó trả xác suất thuộc mỗi lớp, không áp dụng cho regression.' },
              { id: 'd', text: 'predict() và predict_proba() luôn cho kết quả giống hệt nhau', correct: false, explanation: 'Chúng trả về KIỂU DỮ LIỆU khác nhau — nhãn rời rạc vs xác suất liên tục.' },
            ],
          },
        ],
        mini_game: {
          title: 'Ghép mỗi khái niệm với đúng vai trò trong Logistic Regression',
          instruction: 'Kéo mỗi thẻ vào đúng nhóm vai trò.',
          chips: [
            { id: 'chip-sigmoid', label: 'Biến tổ hợp tuyến tính thành xác suất (0-1)' },
            { id: 'chip-logloss', label: 'Hàm mục tiêu mà .fit() cố gắng tối thiểu hoá' },
            { id: 'chip-gd', label: 'Cơ chế tìm w, b tối ưu bên trong .fit()' },
          ],
          bins: [
            { id: 'sigmoid', label: 'Sigmoid', correct: 'true' },
            { id: 'objective', label: 'Hàm mục tiêu (Log loss)', correct: 'true' },
            { id: 'optimizer', label: 'Cơ chế tối ưu (Gradient Descent)', correct: 'true' },
          ],
          solution: { 'chip-sigmoid': 'sigmoid', 'chip-logloss': 'objective', 'chip-gd': 'optimizer' },
          success_html: '✅ Sigmoid biến score thành xác suất, log loss là mục tiêu, gradient descent là cách tìm w/b tối ưu.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Fit LogisticRegression trên train, đánh giá val_accuracy trên validation.',
        blocks: [
          { type: 'py', token: 'from sklearn.linear_model import LogisticRegression', slot: 'z1a' },
          { type: 'py', token: 'from ml_lab import load_logistic_gd_data', slot: 'z1b' },
          { type: 'py', token: 'X_train, X_val, y_train, y_val =', slot: 'z2a' },
          { type: 'py', token: 'load_logistic_gd_data()', slot: 'z2b' },
          { type: 'py', token: 'model =', slot: 'z3a' },
          { type: 'py', token: 'LogisticRegression().fit(X_train, y_train)', slot: 'z3b' },
          { type: 'py', token: 'val_accuracy =', slot: 'z4a' },
          { type: 'py', token: 'model.score(X_val, y_val)', slot: 'z4b' },
        ],
        drop_zones: [
          { id: 'l4-import', accepts: ['py'], multi: true },
          { id: 'l4-load', accepts: ['py'], multi: true },
          { id: 'l4-fit', accepts: ['py'], multi: true },
          { id: 'l4-score', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'l4-import': 'from sklearn.linear_model import LogisticRegression from ml_lab import load_logistic_gd_data',
          'l4-load': 'X_train, X_val, y_train, y_val = load_logistic_gd_data()',
          'l4-fit': 'model = LogisticRegression().fit(X_train, y_train)',
          'l4-score': 'val_accuracy = model.score(X_val, y_val)',
        },
        reveal_hints: {
          'l4-import': 'Import <strong>LogisticRegression</strong> và <strong>load_logistic_gd_data</strong>.',
          'l4-load': 'Nạp 4 mảng: <strong>X_train, X_val, y_train, y_val</strong>.',
          'l4-fit': 'Fit CHỈ trên train: <strong>LogisticRegression().fit(X_train, y_train)</strong>.',
          'l4-score': 'Đo accuracy trên validation: <strong>model.score(X_val, y_val)</strong>.',
        },
        expected_sql: 'from sklearn.linear_model import LogisticRegression from ml_lab import load_logistic_gd_data X_train, X_val, y_train, y_val = load_logistic_gd_data() model = LogisticRegression().fit(X_train, y_train) val_accuracy = model.score(X_val, y_val)',
      },
      drag_map: {
        brand: 'DÒNG CHẢY APPLIED ML LAB',
        table_sub: 'Logistic Regression · train → validate',
        idle_sub: 'Bấm ▶ để train classifier',
        run_label: '▶ Train Logistic Regression',
        table: {
          name: 'logistic_gd_report',
          columns: ['metric', 'value'],
          dataRows: [
            ['train_accuracy', '~0.80'],
            ['val_accuracy', '~0.75'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Fit <code>LogisticRegression</code> trên train. In <code>val_accuracy</code> trên validation.</p>',
        context: {
          scenario: 'StudyLab cần một classifier thật để phân loại học viên nguy cơ — bạn đã hiểu log loss, giờ dùng nó thông qua LogisticRegression có sẵn.',
          real_world: 'Đây chính là bước tiếp theo tự nhiên sau khi hiểu log loss ở bài trước: LogisticRegression không phải "hộp đen bí ẩn" — nó CHÍNH LÀ thuật toán tối thiểu hoá log loss bạn vừa tính tay.',
          steps: [
            'Load 4 mảng: <code>load_logistic_gd_data()</code>.',
            'Fit <code>LogisticRegression()</code> CHỈ trên <code>X_train, y_train</code>.',
            'Đánh giá bằng <code>model.score(X_val, y_val)</code> — trả về accuracy trực tiếp.',
            'In <code>val_accuracy</code>.',
          ],
          hint_explore: 'Muốn xem xác suất dự đoán? Gõ <code>print(model.predict_proba(X_val)[:5])</code> rồi Run.',
          expected: 'Console in val_accuracy — nên > 0.5 (tốt hơn đoán ngẫu nhiên), thường ~0.7-0.85 với dữ liệu này.',
        },
        hints: [
          { level: 1, text: 'Dùng <code>from sklearn.linear_model import LogisticRegression</code>.' },
          { level: 2, text: 'Fit: <code>model = LogisticRegression().fit(X_train, y_train)</code> — chỉ truyền train.' },
          { level: 3, text: '<code>model.score(X, y)</code> tự động tính accuracy — không cần tự viết công thức.' },
        ],
        grader_fn: 'grade_lesson_c2_4',
        success_message: 'Bạn đã train Logistic Regression đúng quy trình — hiểu nó đang tối ưu log loss bằng gradient descent.',
        xp_reward: 60,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.linear_model import LogisticRegression',
      },
    },

    {
      id: 'c2_l5',
      index: 5,
      title: 'Regularization: kiểm soát độ phức tạp của model',
      subtitle: 'L1 tạo sparsity, L2 chỉ co nhỏ đều',
      module: 2,
      module_title: 'M2 · Logistic Regression & Regularization',
      estimated_minutes: 23,
      xp_reward: 70,
      achievement: { name: 'Regularization Tuner', desc: 'So sánh L1 vs L2 — hiểu vì sao L1 tạo sparsity còn L2 thì không.' },
      story: {
        tag: '📊 StudyLab · Applied ML Lab',
        hook: 'Dataset của bạn có 30 feature — nhưng chỉ 5 cột đầu THẬT SỰ liên quan đến nhãn, 25 cột còn lại là nhiễu thuần. Nếu không kiểm soát, LogisticRegression có thể "cố gắng dùng" cả 25 cột nhiễu đó để fit training tốt hơn (overfit). Regularization là cách phạt model vì dùng hệ số quá lớn — và L1 còn làm được điều đặc biệt: đẩy hệ số của feature vô dụng về ĐÚNG 0.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Giải thích regularization kiểm soát độ phức tạp model bằng cách phạt hệ số lớn.',
            'Phân biệt L1 (Lasso-style — tạo sparsity) với L2 (Ridge-style — chỉ co nhỏ đều).',
            'Đếm số hệ số bị đẩy về gần 0 để chứng minh L1 "chọn feature" tự động.',
          ],
        },
        glossary: [
          { term: 'Regularization', vi: 'Điều chuẩn hoá', def: 'Kỹ thuật thêm một "hình phạt" vào hàm mất mát dựa trên độ lớn của hệ số — ngăn model học hệ số quá lớn (dấu hiệu overfit).' },
          { term: 'L1 (Lasso-style)', vi: 'Phạt L1', def: 'Phạt theo TỔNG TRỊ TUYỆT ĐỐI của hệ số — có xu hướng đẩy hệ số của feature ít quan trọng về ĐÚNG 0 (sparsity, tự động chọn feature).' },
          { term: 'L2 (Ridge-style)', vi: 'Phạt L2', def: 'Phạt theo TỔNG BÌNH PHƯƠNG của hệ số — co nhỏ TẤT CẢ hệ số một cách đều đặn, hiếm khi đưa về đúng 0.' },
        ],
        primer: {
          goal: ['Fit LogisticRegression với penalty="l1" và "l2" trên cùng dữ liệu.', 'Đếm số hệ số |coef| < 0.05 ở mỗi loại.'],
          intro: '<p>Không có regularization, model có thể "tận dụng" mọi feature nó thấy, kể cả nhiễu, để fit train tốt hơn — nhưng đó là overfit, không phải học thật. Regularization thêm một "cái giá" cho việc dùng hệ số lớn. L1 và L2 phạt theo 2 cách khác nhau, dẫn đến hành vi rất khác: L1 thường XOÁ SẠCH feature vô dụng (hệ số = 0), L2 chỉ làm chúng NHỎ LẠI (không về 0).</p>',
          example: '',
        },
        concept_cards: [
          { icon: 'fa-shield-halved', title: 'Regularization = phạt hệ số lớn', body: 'Model bị "đánh thuế" khi dùng hệ số lớn — khuyến khích model đơn giản hơn.' },
          { icon: 'fa-eraser', title: 'L1: sparsity', body: 'Đẩy hệ số của feature ít quan trọng về ĐÚNG 0 — tự động "chọn" feature quan trọng.' },
          { icon: 'fa-compress', title: 'L2: co nhỏ đều', body: 'Làm TẤT CẢ hệ số nhỏ lại một chút, nhưng hiếm khi về đúng 0.' },
        ],
        visual: {
          schema: {
            table_name: 'regularization_report',
            columns: [
              { name: 'penalty', type: 'VARCHAR', key: 'PK' },
              { name: 'n_features', type: 'INT', key: '' },
              { name: 'near_zero_coefs', type: 'VARCHAR', key: '' },
            ],
          },
          data_preview: [
            ['l1', '30', '~20'],
            ['l2', '30', '~2'],
          ],
        },
      },
      step_2: {
        mcq: [
          {
            question: 'Vì sao L1 regularization thường tạo ra nhiều hệ số BẰNG 0, còn L2 thì hiếm khi?',
            options: [
              { id: 'a', text: 'L1 phạt theo trị tuyệt đối (hình học tạo góc nhọn tại 0) khiến nghiệm tối ưu thường rơi đúng vào 0; L2 phạt theo bình phương (hình tròn mượt) nên chỉ co nhỏ dần, hiếm khi chạm đúng 0', correct: true, explanation: 'Đúng — đây là giải thích hình học kinh điển về sự khác biệt L1 vs L2.' },
              { id: 'b', text: 'L1 chỉ hỗ trợ tối đa 5 feature, các feature thừa tự động bị xoá', correct: false, explanation: 'L1 không có giới hạn số feature — nó hoạt động với bất kỳ số lượng feature nào, cơ chế là do bản chất hình học của phạt.' },
              { id: 'c', text: 'L2 là phiên bản lỗi thời của L1, không còn dùng trong thực tế', correct: false, explanation: 'Cả L1 và L2 đều được dùng rộng rãi tuỳ tình huống — L2 (Ridge) đặc biệt tốt khi các feature tương quan với nhau.' },
              { id: 'd', text: 'Không có sự khác biệt thật sự giữa L1 và L2 về mặt số học', correct: false, explanation: 'Có sự khác biệt rõ rệt và có thể đo được (đếm số hệ số gần 0) — đây chính là nội dung bài học.' },
            ],
          },
          {
            question: 'Regularization giúp giải quyết vấn đề gì?',
            options: [
              { id: 'a', text: 'Ngăn model "lạm dụng" hệ số lớn để fit quá sát dữ liệu train, kể cả nhiễu — giảm overfit', correct: true, explanation: 'Chính xác — đây là mục đích cốt lõi của mọi kỹ thuật regularization.' },
              { id: 'b', text: 'Tăng tốc độ tính toán của model lên nhiều lần', correct: false, explanation: 'Regularization không nhắm đến tốc độ — mục tiêu là kiểm soát ĐỘ PHỨC TẠP của model để tránh overfit.' },
              { id: 'c', text: 'Tự động làm sạch dữ liệu bị thiếu (missing values)', correct: false, explanation: 'Đó là việc của data cleaning — regularization xử lý HÀNH VI của model, không xử lý chất lượng dữ liệu đầu vào.' },
              { id: 'd', text: 'Đảm bảo model luôn đạt 100% accuracy trên train', correct: false, explanation: 'Ngược lại — regularization thường làm accuracy TRAIN giảm nhẹ (đổi lấy khả năng tổng quát hoá tốt hơn trên val/test).' },
            ],
          },
        ],
        mini_game: {
          title: 'L1 hay L2? Ghép mỗi mô tả với đúng loại regularization',
          instruction: 'Kéo mỗi mô tả vào đúng nhóm.',
          chips: [
            { id: 'chip-abs', label: 'Phạt theo tổng trị tuyệt đối của hệ số' },
            { id: 'chip-sq', label: 'Phạt theo tổng bình phương của hệ số' },
            { id: 'chip-zero', label: 'Có xu hướng đẩy hệ số về ĐÚNG 0 (sparsity)' },
            { id: 'chip-shrink', label: 'Co nhỏ TẤT CẢ hệ số đều đặn, hiếm khi về 0' },
          ],
          bins: [
            { id: 'l1', label: 'L1', correct: 'true' },
            { id: 'l2', label: 'L2', correct: 'true' },
          ],
          solution: { 'chip-abs': 'l1', 'chip-sq': 'l2', 'chip-zero': 'l1', 'chip-shrink': 'l2' },
          success_html: '✅ L1 = trị tuyệt đối + sparsity. L2 = bình phương + co nhỏ đều.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Fit L1 và L2, đếm số hệ số |coef| < 0.05 ở mỗi loại — L1 phải nhiều hơn.',
        blocks: [
          { type: 'py', token: 'import numpy as np', slot: 'z1a' },
          { type: 'py', token: 'from sklearn.linear_model import LogisticRegression', slot: 'z1b' },
          { type: 'py', token: 'from ml_lab import load_regularization_data', slot: 'z2a' },
          { type: 'py', token: 'X_train, X_val, y_train, y_val =', slot: 'z2b' },
          { type: 'py', token: 'model_l1 =', slot: 'z3a' },
          { type: 'py', token: "LogisticRegression(penalty='l1', solver='liblinear', C=0.5).fit(X_train, y_train)", slot: 'z3b' },
          { type: 'py', token: 'model_l2 =', slot: 'z4a' },
          { type: 'py', token: "LogisticRegression(penalty='l2', C=0.5).fit(X_train, y_train)", slot: 'z4b' },
        ],
        drop_zones: [
          { id: 'l5-import', accepts: ['py'], multi: true },
          { id: 'l5-load', accepts: ['py'], multi: true },
          { id: 'l5-l1', accepts: ['py'], multi: true },
          { id: 'l5-l2', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'l5-import': 'import numpy as np from sklearn.linear_model import LogisticRegression',
          'l5-load': 'from ml_lab import load_regularization_data X_train, X_val, y_train, y_val =',
          'l5-l1': "model_l1 = LogisticRegression(penalty='l1', solver='liblinear', C=0.5).fit(X_train, y_train)",
          'l5-l2': "model_l2 = LogisticRegression(penalty='l2', C=0.5).fit(X_train, y_train)",
        },
        reveal_hints: {
          'l5-import': 'Import <strong>numpy</strong> và <strong>LogisticRegression</strong>.',
          'l5-load': 'Nạp dữ liệu 30 feature (chỉ 5 cột đầu thật sự quan trọng).',
          'l5-l1': "L1 CẦN <strong>solver='liblinear'</strong> (không phải mọi solver hỗ trợ L1).",
          'l5-l2': 'L2 là penalty mặc định của LogisticRegression.',
        },
        expected_sql: "import numpy as np from sklearn.linear_model import LogisticRegression from ml_lab import load_regularization_data X_train, X_val, y_train, y_val = model_l1 = LogisticRegression(penalty='l1', solver='liblinear', C=0.5).fit(X_train, y_train) model_l2 = LogisticRegression(penalty='l2', C=0.5).fit(X_train, y_train)",
      },
      drag_map: {
        brand: 'DÒNG CHẢY APPLIED ML LAB',
        table_sub: 'So sánh sparsity L1 vs L2',
        idle_sub: 'Bấm ▶ để so sánh',
        run_label: '▶ So sánh L1 vs L2',
        table: {
          name: 'regularization_report',
          columns: ['penalty', 'n_features', 'near_zero_coefs'],
          dataRows: [
            ['l1', '30', '~20'],
            ['l2', '30', '~2'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Fit LogisticRegression với <code>penalty="l1"</code> và <code>penalty="l2"</code>. Đếm hệ số |coef| &lt; 0.05 mỗi loại. In <code>l1_near_zero</code> và <code>l2_near_zero</code>.</p>',
        context: {
          scenario: 'Dataset 30 feature nhưng chỉ 5 cột đầu thật sự liên quan — bạn cần chứng minh L1 "phát hiện" được điều đó tự động, còn L2 thì không.',
          real_world: 'Giống việc dọn tủ quần áo: L1 giống "vứt hẳn" những món không mặc bao giờ (về 0 hoàn toàn); L2 giống "gấp gọn lại cho đỡ chiếm chỗ" nhưng vẫn giữ tất cả (co nhỏ, không xoá).',
          steps: [
            'Load 4 mảng: <code>load_regularization_data()</code> — cột 0-4 thật, cột 5-29 nhiễu.',
            'Fit <code>LogisticRegression(penalty="l1", solver="liblinear", C=0.5)</code> trên train.',
            'Fit <code>LogisticRegression(penalty="l2", C=0.5)</code> trên train.',
            'Đếm <code>(np.abs(model.coef_) < 0.05).sum()</code> cho mỗi model. In <code>l1_near_zero</code> và <code>l2_near_zero</code> — L1 phải NHIỀU HƠN.',
          ],
          hint_explore: 'Muốn xem toàn bộ hệ số? Gõ <code>print(model_l1.coef_)</code> rồi Run.',
          expected: 'l1_near_zero rõ ràng LỚN HƠN l2_near_zero — chứng minh L1 tạo sparsity, L2 thì không.',
        },
        hints: [
          { level: 1, text: 'L1 CẦN <code>solver="liblinear"</code> — không phải solver mặc định nào cũng hỗ trợ penalty L1.' },
          { level: 2, text: 'Hệ số nằm trong <code>model.coef_</code> (shape (1, n_features) cho binary classification).' },
          { level: 3, text: 'Đếm hệ số gần 0: <code>(np.abs(model.coef_) < 0.05).sum()</code>.' },
        ],
        grader_fn: 'grade_lesson_c2_5',
        success_message: 'Bạn đã chứng minh bằng số liệu: L1 tạo sparsity (nhiều hệ số về 0), L2 chỉ co nhỏ đều.',
        xp_reward: 70,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.linear_model import LogisticRegression',
      },
    },

    {
      id: 'c2_l6',
      index: 6,
      title: 'Chọn regularization strength bằng Validation',
      subtitle: 'C quá lớn overfit, C quá nhỏ underfit — validation quyết định',
      module: 2,
      module_title: 'M2 · Logistic Regression & Regularization',
      estimated_minutes: 23,
      xp_reward: 70,
      achievement: { name: 'Regularization Tuner', desc: 'Sweep C bằng validation, không đoán mù.' },
      story: {
        tag: '📊 StudyLab · Applied ML Lab',
        hook: 'Tham số C trong LogisticRegression điều khiển ĐỘ MẠNH của regularization — nhưng theo chiều NGƯỢC: C càng LỚN, regularization càng YẾU (model tự do dùng hệ số lớn, dễ overfit). C càng NHỎ, regularization càng MẠNH (model bị ép đơn giản, dễ underfit). Không có "C đúng" cố định — chỉ có C tốt nhất CHO DỮ LIỆU CỤ THỂ, tìm bằng validation.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Hiểu tham số C điều khiển độ mạnh regularization theo chiều NGƯỢC (C nhỏ = regularization mạnh).',
            'Sweep nhiều giá trị C, đo validation F1/accuracy cho từng giá trị.',
            'Chọn C tối ưu bằng bằng chứng validation — không đoán mù, không dùng test.',
          ],
        },
        glossary: [
          { term: 'C (Inverse regularization strength)', vi: 'Nghịch đảo độ mạnh regularization', def: 'Tham số của LogisticRegression — C NHỎ nghĩa là regularization MẠNH (ép hệ số nhỏ); C LỚN nghĩa là regularization YẾU (hệ số tự do hơn).', ex: 'Nhiều tài liệu/thuật toán khác (Ridge, Lasso) gọi đại lượng này là <strong>alpha</strong> — nhưng alpha đi THEO CHIỀU NGƯỢC LẠI với C: alpha NHỎ = regularization YẾU, alpha LỚN = regularization MẠNH. Quy tắc: <code>C ≈ 1/alpha</code>. Bài này dùng LogisticRegression nên sweep theo C; bản chất "chọn độ mạnh regularization bằng validation" là HOÀN TOÀN GIỐNG việc sweep alpha.' },
          { term: 'Underfit do regularization mạnh', vi: 'Underfit vì phạt quá tay', def: 'Khi C quá nhỏ, model bị ép đơn giản đến mức không học được cả những pattern thật sự có ích — val accuracy thấp dù train cũng thấp.' },
          { term: 'Hyperparameter sweep', vi: 'Quét siêu tham số', def: 'Thử nhiều giá trị của một tham số (không được học tự động, phải chọn bởi người) và đo hiệu năng trên validation để chọn giá trị tốt nhất.' },
        ],
        primer: {
          goal: ['Sweep C = [0.01, 0.1, 1, 10, 100].', 'Đo val F1 cho mỗi C, chọn C tốt nhất.'],
          intro: '<p>C KHÔNG có một giá trị "đúng" phổ quát — nó phụ thuộc vào dữ liệu cụ thể. C quá lớn (regularization yếu) → model overfit train, val kém. C quá nhỏ (regularization mạnh) → model quá đơn giản, cả train lẫn val đều kém (underfit). C tối ưu nằm ở đâu đó GIỮA — chỉ tìm được bằng cách THỬ và ĐO trên validation.</p>',
          example: '',
        },
        concept_cards: [
          { icon: 'fa-arrow-down', title: 'C nhỏ → regularization mạnh', body: 'Model bị ép đơn giản — có thể underfit nếu quá nhỏ.' },
          { icon: 'fa-arrow-up', title: 'C lớn → regularization yếu', body: 'Model tự do hơn — dễ overfit nếu quá lớn.' },
          { icon: 'fa-magnifying-glass', title: 'Sweep + Validation', body: 'Thử nhiều C, đo val F1 mỗi cái, chọn C có val F1 cao nhất — không đoán mù.' },
        ],
        visual: {
          schema: {
            table_name: 'c_sweep_report',
            columns: [
              { name: 'C', type: 'FLOAT', key: '' },
              { name: 'val_f1', type: 'FLOAT', key: '' },
            ],
          },
          data_preview: [
            ['0.01', '0.61'],
            ['0.1', '0.74'],
            ['1', '0.81'],
            ['10', '0.78'],
            ['100', '0.72'],
          ],
        },
      },
      step_2: {
        mcq: [
          {
            question: 'Tham số C trong LogisticRegression hoạt động theo chiều nào?',
            options: [
              { id: 'a', text: 'C càng NHỎ, regularization càng MẠNH (model bị ép đơn giản hơn)', correct: true, explanation: 'Đúng — đây là quy ước của sklearn: C là NGHỊCH ĐẢO của độ mạnh regularization.' },
              { id: 'b', text: 'C càng NHỎ, regularization càng YẾU', correct: false, explanation: 'Ngược lại — C nhỏ nghĩa là hệ số phạt (1/C) lớn, tức regularization MẠNH hơn.' },
              { id: 'c', text: 'C không liên quan gì đến regularization, chỉ ảnh hưởng tốc độ train', correct: false, explanation: 'C chính là tham số CHÍNH điều khiển độ mạnh regularization trong LogisticRegression.' },
              { id: 'd', text: 'C luôn phải bằng 1.0, không được thay đổi', correct: false, explanation: 'C hoàn toàn có thể (và NÊN) được sweep qua nhiều giá trị để tìm giá trị tối ưu cho dữ liệu cụ thể.' },
            ],
          },
          {
            question: 'Cách chọn C nào là ĐÚNG?',
            options: [
              { id: 'a', text: 'Sweep nhiều giá trị C, đo val F1/accuracy cho mỗi giá trị, chọn C có kết quả val tốt nhất', correct: true, explanation: 'Chính xác — đây là cách chọn hyperparameter dựa trên bằng chứng, không đoán mù.' },
              { id: 'b', text: 'Luôn chọn C=1.0 vì đó là giá trị mặc định của sklearn', correct: false, explanation: 'Giá trị mặc định chỉ là điểm khởi đầu hợp lý — KHÔNG đảm bảo là tối ưu cho MỌI dataset.' },
              { id: 'c', text: 'Chọn C sao cho train accuracy đạt gần 100%', correct: false, explanation: 'Train accuracy cao có thể chỉ là dấu hiệu OVERFIT — không phải tiêu chí chọn C tốt.' },
              { id: 'd', text: 'Chọn C ngẫu nhiên vì mọi giá trị C đều cho kết quả tương đương', correct: false, explanation: 'Các giá trị C khác nhau CÓ THỂ cho kết quả val rất khác nhau — không hề tương đương.' },
            ],
          },
        ],
        mini_game: {
          title: 'Hậu quả nào đi với C quá lớn / C quá nhỏ?',
          instruction: 'Xếp mỗi hậu quả vào đúng nhóm.',
          chips: [
            { id: 'chip-overfit', label: 'Model overfit train, val kém đi' },
            { id: 'chip-underfit', label: 'Model quá đơn giản, cả train lẫn val đều kém' },
            { id: 'chip-weak', label: 'Regularization quá YẾU' },
            { id: 'chip-strong', label: 'Regularization quá MẠNH' },
          ],
          bins: [
            { id: 'clon', label: 'C quá LỚN', correct: 'true' },
            { id: 'cnho', label: 'C quá NHỎ', correct: 'true' },
          ],
          solution: { 'chip-overfit': 'clon', 'chip-weak': 'clon', 'chip-underfit': 'cnho', 'chip-strong': 'cnho' },
          success_html: '✅ C lớn → regularization yếu → dễ overfit. C nhỏ → regularization mạnh → dễ underfit.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Sweep C = [0.01, 0.1, 1, 10, 100], đo val F1, chọn C tốt nhất.',
        blocks: [
          { type: 'py', token: 'from sklearn.linear_model import LogisticRegression', slot: 'z1a' },
          { type: 'py', token: 'from sklearn.metrics import f1_score', slot: 'z1b' },
          { type: 'py', token: 'from ml_lab import load_reg_strength_splits', slot: 'z2a' },
          { type: 'py', token: 'X_train, X_val, y_train, y_val =', slot: 'z2b' },
          { type: 'py', token: 'for C in [0.01, 0.1, 1, 10, 100]:', slot: 'z3a' },
          { type: 'py', token: 'model = LogisticRegression(C=C, max_iter=1000).fit(X_train, y_train)', slot: 'z3b' },
          { type: 'py', token: 'val_f1 =', slot: 'z4a' },
          { type: 'py', token: 'f1_score(y_val, model.predict(X_val))', slot: 'z4b' },
        ],
        drop_zones: [
          { id: 'l6-import', accepts: ['py'], multi: true },
          { id: 'l6-load', accepts: ['py'], multi: true },
          { id: 'l6-sweep', accepts: ['py'], multi: true },
          { id: 'l6-eval', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'l6-import': 'from sklearn.linear_model import LogisticRegression from sklearn.metrics import f1_score',
          'l6-load': 'from ml_lab import load_reg_strength_splits X_train, X_val, y_train, y_val =',
          'l6-sweep': 'for C in [0.01, 0.1, 1, 10, 100]: model = LogisticRegression(C=C, max_iter=1000).fit(X_train, y_train)',
          'l6-eval': 'val_f1 = f1_score(y_val, model.predict(X_val))',
        },
        reveal_hints: {
          'l6-import': 'Import <strong>LogisticRegression</strong> và <strong>f1_score</strong>.',
          'l6-load': 'Nạp dữ liệu 20 feature (4 cột đầu thật sự quan trọng).',
          'l6-sweep': 'Sweep 5 giá trị C — fit model MỚI cho mỗi C.',
          'l6-eval': 'Đo F1 trên validation cho mỗi C.',
        },
        expected_sql: 'from sklearn.linear_model import LogisticRegression from sklearn.metrics import f1_score from ml_lab import load_reg_strength_splits X_train, X_val, y_train, y_val = for C in [0.01, 0.1, 1, 10, 100]: model = LogisticRegression(C=C, max_iter=1000).fit(X_train, y_train) val_f1 = f1_score(y_val, model.predict(X_val))',
      },
      drag_map: {
        brand: 'DÒNG CHẢY APPLIED ML LAB',
        table_sub: 'Sweep C · val F1',
        idle_sub: 'Bấm ▶ để sweep C',
        run_label: '▶ Sweep C',
        table: {
          name: 'c_sweep_report',
          columns: ['C', 'val_f1'],
          dataRows: [
            ['0.01', '0.61'],
            ['0.1', '0.74'],
            ['1', '0.81'],
            ['10', '0.78'],
            ['100', '0.72'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Sweep C = [0.01, 0.1, 1, 10, 100]. In từng C + val F1, rồi in dòng <code>best_C &lt;giá trị&gt;</code> dựa trên validation.</p>',
        context: {
          scenario: 'StudyLab cần chọn đúng độ mạnh regularization cho model — không được đoán, phải có bằng chứng từ validation.',
          real_world: 'Giống việc chỉnh độ nhạy của một cái phanh xe — quá nhạy (C lớn, regularization yếu) xe giật cục theo mọi rung động nhỏ (overfit nhiễu); quá lì (C nhỏ, regularization mạnh) xe không phản ứng kịp khi cần (underfit). Độ nhạy đúng phải được TEST THỬ, không đoán.',
          steps: [
            'Load 4 mảng: <code>load_reg_strength_splits()</code>.',
            'Vòng lặp <code>for C in [0.01, 0.1, 1, 10, 100]:</code>.',
            'Với mỗi C: fit <code>LogisticRegression(C=C, max_iter=1000)</code> trên train, đo F1 trên val. In C và val F1.',
            'Sau vòng lặp, in <code>best_C &lt;giá trị C có val F1 cao nhất&gt;</code>.',
          ],
          hint_explore: 'Muốn xem shape dữ liệu? Gõ <code>print(X_train.shape)</code> rồi Run.',
          expected: 'Console in 5 dòng (C, val F1) rồi 1 dòng "best_C ..." — F1 thường đạt đỉnh ở C vừa phải (không phải cực trị của dải sweep).',
        },
        hints: [
          { level: 1, text: 'Loop: <code>for C in [0.01, 0.1, 1, 10, 100]:</code>.' },
          { level: 2, text: 'Mỗi vòng: fit model MỚI với <code>C=C</code>, tính <code>f1_score(y_val, model.predict(X_val))</code>.' },
          { level: 3, text: 'Lưu lại (C, F1) tốt nhất qua vòng lặp — in <code>"best_C", best_c</code> sau khi sweep xong.' },
        ],
        grader_fn: 'grade_lesson_c2_6',
        success_message: 'Bạn đã chọn regularization strength bằng validation — không đoán mù, có bằng chứng.',
        xp_reward: 70,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.linear_model import LogisticRegression',
      },
    },
    // ╔══════════════════════════════════════════════════════════╗
    // ║  M3 — MODEL EVALUATION & DIAGNOSIS                       ║
    // ╚══════════════════════════════════════════════════════════╝
    {
      id: 'c2_l7',
      index: 7,
      title: 'Bias-Variance: chẩn đoán việc học ổn định và không ổn định',
      subtitle: 'Bậc 1 underfit, bậc 15 overfit, bậc 3 vừa đủ',
      module: 3,
      module_title: 'M3 · Model Evaluation & Diagnosis',
      estimated_minutes: 24,
      xp_reward: 70,
      achievement: { name: 'Bias-Variance Diagnostician', desc: 'Chẩn đoán underfit/overfit qua learning curve thật.' },
      story: {
        tag: '📊 StudyLab · Applied ML Lab',
        hook: 'Chỉ 25 học viên đủ dữ liệu cho một thí nghiệm mới. Bạn fit 3 model: đường thẳng (bậc 1), đường cong vừa (bậc 3), đường cong cực kỳ phức tạp (bậc 15). Trên 25 điểm train, bậc 15 fit GẦN NHƯ HOÀN HẢO. Nhưng đưa nó ra 200 điểm validation nó chưa từng thấy — sai số TĂNG VỌT hàng nghìn lần. Đó chính là overfit: học thuộc lòng thay vì học quy luật.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Fit model ở nhiều độ phức tạp khác nhau (bậc đa thức 1, 3, 15) trên cùng dữ liệu.',
            'Đọc learning curve để phân biệt underfit (bias cao) và overfit (variance cao).',
            'Chọn độ phức tạp "vừa đủ" bằng validation, không chỉ nhìn train.',
          ],
        },
        glossary: [
          { term: 'Bias (Underfit)', vi: 'Độ lệch (học chưa đủ)', def: 'Model quá đơn giản để nắm được quy luật thật — sai số CAO trên CẢ train lẫn validation.' },
          { term: 'Variance (Overfit)', vi: 'Phương sai (học quá mức)', def: 'Model quá phức tạp, "học thuộc" cả nhiễu trong train — sai số THẤP trên train nhưng CAO trên validation.' },
          { term: 'Bias-Variance Trade-off', vi: 'Đánh đổi Bias-Variance', def: 'Giảm bias (model phức tạp hơn) thường làm tăng variance, và ngược lại — điểm cân bằng tốt nhất tìm được bằng validation.' },
        ],
        primer: {
          goal: ['Fit đa thức bậc 1, 3, 15 trên 25 điểm train thưa.', 'So sánh val_mse của cả 3 để chẩn đoán.'],
          intro: '<p>Với chỉ 25 điểm dữ liệu, một đường cong bậc 15 có đủ "tự do" để LUỒN QUA từng điểm training gần như chính xác — nhưng đường cong đó ngoằn ngoèo vô nghĩa giữa các điểm, hoàn toàn không phản ánh quy luật thật. Đưa nó ra dữ liệu mới, sai số bùng nổ. Đây là ví dụ kinh điển nhất về overfit.</p>',
          example: '',
        },
        concept_cards: [
          { icon: 'fa-minus', title: 'Bậc 1 (underfit)', body: 'Đường thẳng quá đơn giản — không nắm được độ cong thật của dữ liệu. Sai cả train lẫn val.' },
          { icon: 'fa-wave-square', title: 'Bậc 3 (vừa đủ)', body: 'Khớp với độ phức tạp thật của quy luật — val_mse thấp nhất trong 3 lựa chọn.' },
          { icon: 'fa-bolt', title: 'Bậc 15 (overfit)', body: 'Fit gần hoàn hảo trên 25 điểm train, nhưng val_mse TĂNG VỌT hàng nghìn lần — học thuộc, không học quy luật.' },
        ],
        visual: {
          schema: {
            table_name: 'bias_variance_report',
            columns: [
              { name: 'degree', type: 'INT', key: '' },
              { name: 'val_mse', type: 'VARCHAR', key: '' },
              { name: 'note', type: 'VARCHAR', key: '' },
            ],
          },
          data_preview: [
            ['1', '~18.0', 'underfit — đường thẳng quá đơn giản'],
            ['3', '~13.9', 'vừa đủ — val_mse thấp nhất'],
            ['15', '~33674', 'overfit nghiêm trọng — luồn qua từng điểm train'],
          ],
        },
      },
      step_2: {
        mcq: [
          {
            question: 'Model bậc 15 fit gần hoàn hảo trên 25 điểm train (train_mse ≈ 0) nhưng val_mse tăng vọt lên hàng nghìn. Đây là dấu hiệu của gì?',
            options: [
              { id: 'a', text: 'Overfit — model học thuộc dữ liệu train (kể cả nhiễu), không tổng quát hoá được', correct: true, explanation: 'Đúng — gap cực lớn giữa train_mse thấp và val_mse cao là dấu hiệu kinh điển của overfit (variance cao).' },
              { id: 'b', text: 'Underfit — model quá đơn giản để học pattern', correct: false, explanation: 'Ngược lại — model bậc 15 QUÁ PHỨC TẠP, không phải quá đơn giản. Underfit sẽ cho train_mse CŨNG cao.' },
              { id: 'c', text: 'Dữ liệu validation bị lỗi, cần loại bỏ', correct: false, explanation: 'Không có bằng chứng dữ liệu lỗi — đây là hành vi HOÀN TOÀN BÌNH THƯỜNG của một model bị overfit.' },
              { id: 'd', text: 'np.polyfit tính sai công thức ở bậc cao', correct: false, explanation: 'np.polyfit tính đúng — vấn đề là bản chất TOÁN HỌC của việc fit đa thức bậc cao trên ít điểm dữ liệu, không phải lỗi hàm.' },
            ],
          },
          {
            question: 'Cách chọn độ phức tạp model (vd bậc đa thức) hợp lý nhất là gì?',
            options: [
              { id: 'a', text: 'Thử nhiều độ phức tạp, chọn độ phức tạp có val_mse THẤP NHẤT — không chỉ nhìn train_mse', correct: true, explanation: 'Chính xác — val_mse phản ánh khả năng tổng quát hoá thật, train_mse có thể đánh lừa (luôn giảm khi tăng độ phức tạp).' },
              { id: 'b', text: 'Luôn chọn độ phức tạp cao nhất có thể để đảm bảo fit tốt nhất', correct: false, explanation: 'Đây chính là cái bẫy overfit — độ phức tạp cao nhất thường cho val_mse TỆ NHẤT, không phải tốt nhất.' },
              { id: 'c', text: 'Luôn chọn bậc 1 vì đơn giản luôn an toàn', correct: false, explanation: 'Bậc 1 có thể underfit nếu quy luật thật phức tạp hơn tuyến tính — "đơn giản" không tự động "an toàn".' },
              { id: 'd', text: 'Chọn độ phức tạp sao cho train_mse = 0 chính xác', correct: false, explanation: 'train_mse = 0 gần như luôn là dấu hiệu overfit nghiêm trọng, không phải mục tiêu tốt.' },
            ],
          },
        ],
        mini_game: {
          title: 'Underfit hay Overfit? Xếp đúng nhóm',
          instruction: 'Xếp mỗi hiện tượng vào đúng nhóm.',
          chips: [
            { id: 'chip-hightrainval', label: 'Sai số CAO trên cả train lẫn validation' },
            { id: 'chip-lowtrainhighval', label: 'Sai số THẤP trên train nhưng CAO trên validation' },
            { id: 'chip-simple', label: 'Model quá đơn giản so với quy luật thật' },
            { id: 'chip-complex', label: 'Model quá phức tạp, học thuộc cả nhiễu' },
          ],
          bins: [
            { id: 'underfit', label: 'Underfit (Bias cao)', correct: 'true' },
            { id: 'overfit', label: 'Overfit (Variance cao)', correct: 'true' },
          ],
          solution: { 'chip-hightrainval': 'underfit', 'chip-simple': 'underfit', 'chip-lowtrainhighval': 'overfit', 'chip-complex': 'overfit' },
          success_html: '✅ Underfit: sai cả 2 tập, model quá đơn giản. Overfit: sai train thấp nhưng val cao, model quá phức tạp.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Fit đa thức bậc 1, 3, 15 trên train — in val_mse cho từng bậc.',
        blocks: [
          { type: 'py', token: 'import numpy as np', slot: 'z1a' },
          { type: 'py', token: 'from ml_lab import load_bias_variance_data', slot: 'z1b' },
          { type: 'py', token: 'X_train, y_train, X_val, y_val =', slot: 'z2a' },
          { type: 'py', token: 'load_bias_variance_data()', slot: 'z2b' },
          { type: 'py', token: 'for degree in [1, 3, 15]:', slot: 'z3a' },
          { type: 'py', token: 'coeffs = np.polyfit(X_train, y_train, degree)', slot: 'z3b' },
          { type: 'py', token: 'pred = np.poly1d(coeffs)(X_val)', slot: 'z4a' },
          { type: 'py', token: 'val_mse = ((y_val - pred)**2).mean()', slot: 'z4b' },
        ],
        drop_zones: [
          { id: 'l7-import', accepts: ['py'], multi: true },
          { id: 'l7-load', accepts: ['py'], multi: true },
          { id: 'l7-fit', accepts: ['py'], multi: true },
          { id: 'l7-eval', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'l7-import': 'import numpy as np from ml_lab import load_bias_variance_data',
          'l7-load': 'X_train, y_train, X_val, y_val = load_bias_variance_data()',
          'l7-fit': 'for degree in [1, 3, 15]: coeffs = np.polyfit(X_train, y_train, degree)',
          'l7-eval': 'pred = np.poly1d(coeffs)(X_val) val_mse = ((y_val - pred)**2).mean()',
        },
        reveal_hints: {
          'l7-import': 'Import <strong>numpy</strong> và <strong>load_bias_variance_data</strong>.',
          'l7-load': 'Nạp 4 mảng: <strong>X_train, y_train, X_val, y_val</strong>.',
          'l7-fit': 'Fit đa thức: <strong>for degree in [1, 3, 15]: np.polyfit(...)</strong>.',
          'l7-eval': 'Predict trên val, tính MSE cho từng bậc.',
        },
        expected_sql: 'import numpy as np from ml_lab import load_bias_variance_data X_train, y_train, X_val, y_val = load_bias_variance_data() for degree in [1, 3, 15]: coeffs = np.polyfit(X_train, y_train, degree) pred = np.poly1d(coeffs)(X_val) val_mse = ((y_val - pred)**2).mean()',
      },
      drag_map: {
        brand: 'DÒNG CHẢY APPLIED ML LAB',
        table_sub: 'val_mse theo độ phức tạp',
        idle_sub: 'Bấm ▶ để fit 3 độ phức tạp',
        run_label: '▶ Fit đa thức',
        table: {
          name: 'bias_variance_report',
          columns: ['degree', 'val_mse', 'note'],
          dataRows: [
            ['1', '~18.0', 'underfit — đường thẳng quá đơn giản'],
            ['3', '~13.9', 'vừa đủ — val_mse thấp nhất'],
            ['15', '~33674', 'overfit nghiêm trọng — luồn qua từng điểm train'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Fit đa thức bậc 1, 3, 15 trên train. In val_mse cho MỖI bậc — bậc 15 phải overfit rõ rệt (val_mse lớn hơn nhiều so với bậc 1, 3).</p>',
        context: {
          scenario: 'StudyLab chỉ có 25 điểm dữ liệu cho một thí nghiệm — bạn cần chứng minh độ phức tạp nào phù hợp, không chỉ đoán.',
          real_world: 'Giống việc may một bộ đồ "vừa khít" một người cụ thể (overfit) so với đo theo SIZE chuẩn (underfit nếu quá rộng) — bộ đồ vừa khít 1 người sẽ KHÔNG mặc vừa cho bất kỳ ai khác, dù nó "hoàn hảo" cho đúng người đó.',
          steps: [
            'Load 4 mảng: <code>load_bias_variance_data()</code> — 25 điểm train, 200 điểm val.',
            'Vòng lặp <code>for degree in [1, 3, 15]:</code>.',
            'Fit <code>np.polyfit(X_train, y_train, degree)</code>, predict trên X_val bằng <code>np.poly1d(coeffs)</code>.',
            'In <code>degree</code> và <code>val_mse</code> cho mỗi bậc.',
          ],
          hint_explore: 'Muốn xem train_mse để so sánh? Gõ thêm <code>train_mse = ((y_train - np.poly1d(coeffs)(X_train))**2).mean()</code> rồi print.',
          expected: 'Console in 3 dòng (degree, val_mse) — bậc 15 phải có val_mse LỚN HƠN HẲN (hàng trăm/nghìn lần) so với bậc 1 và 3.',
        },
        hints: [
          { level: 1, text: '<code>np.polyfit(X_train, y_train, degree)</code> trả về hệ số đa thức.' },
          { level: 2, text: '<code>np.poly1d(coeffs)</code> biến hệ số thành một hàm gọi được — <code>p(X_val)</code> cho dự đoán.' },
          { level: 3, text: 'In cả 3 dòng (degree=1, 3, 15) — đừng chỉ in 1 bậc, cần so sánh cả 3 mới thấy overfit rõ.' },
        ],
        grader_fn: 'grade_lesson_c2_7',
        success_message: 'Bạn đã chẩn đoán bias-variance bằng số liệu thật — bậc 15 overfit rõ rệt trên 25 điểm thưa.',
        xp_reward: 70,
        starter_hint: '💡 Bắt đầu bằng: from ml_lab import load_bias_variance_data',
      },
    },

    {
      id: 'c2_l8',
      index: 8,
      title: 'Chọn regression metric: MAE, MSE và R-squared',
      subtitle: 'MSE bị outlier kéo lệch nhiều hơn MAE',
      module: 3,
      module_title: 'M3 · Model Evaluation & Diagnosis',
      estimated_minutes: 22,
      xp_reward: 60,
      achievement: { name: 'Metric Chooser', desc: 'Chọn đúng metric cho đúng bối cảnh — hiểu MAE/MSE/R² khác nhau thế nào.' },
      story: {
        tag: '📊 StudyLab · Applied ML Lab',
        hook: '10 dự đoán, 9 cái rất gần thực tế — chỉ 1 cái lệch cực xa (dự đoán 40, thực tế 90). MAE (trung bình trị tuyệt đối lỗi) coi cái lệch đó như MỘT lỗi trong nhiều lỗi. MSE (trung bình BÌNH PHƯƠNG lỗi) coi nó như một QUẢ BOM — lỗi 50 bị bình phương thành 2500, kéo cả trung bình lên hàng chục lần. Cùng 1 bộ dự đoán, 2 con số kể 2 câu chuyện khác hẳn nhau.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Tính MAE, MSE, R² cho cùng một bộ dự đoán.',
            'Giải thích vì sao MSE nhạy cảm với outlier hơn MAE (do phép bình phương).',
            'Chọn metric phù hợp tuỳ bối cảnh: MAE khi muốn "công bằng" với mọi lỗi, MSE khi muốn phạt nặng lỗi lớn.',
          ],
        },
        glossary: [
          { term: 'MAE (Mean Absolute Error)', vi: 'Sai số tuyệt đối trung bình', def: 'Trung bình của trị tuyệt đối các lỗi — mọi lỗi được tính "công bằng" theo độ lớn thực của nó, không khuếch đại.', out: 'mean(|actual - pred|)' },
          { term: 'MSE (Mean Squared Error)', vi: 'Sai số bình phương trung bình', def: 'Trung bình của BÌNH PHƯƠNG các lỗi — lỗi lớn bị khuếch đại rất mạnh (lỗi gấp đôi → đóng góp gấp 4 lần vào MSE).', out: 'mean((actual - pred)²)' },
          { term: 'R² (R-squared)', vi: 'Hệ số xác định', def: 'Tỉ lệ phương sai của target mà model giải thích được, so với việc chỉ dự đoán bằng giá trị trung bình — 1.0 là hoàn hảo, có thể ÂM nếu model tệ hơn cả baseline trung bình.' },
        ],
        primer: {
          goal: ['Tính MAE, MSE, R² trên cùng 10 dự đoán có 1 outlier.', 'So sánh mức độ outlier ảnh hưởng đến mỗi metric.'],
          intro: '<p>MAE và MSE trông giống nhau (đều là "trung bình lỗi") nhưng phản ứng RẤT KHÁC với outlier. Vì MSE bình phương lỗi trước khi lấy trung bình, một lỗi lớn (vd 50) đóng góp 2500 vào tổng — gấp hàng trăm lần đóng góp của các lỗi nhỏ (vd lỗi 2 chỉ đóng góp 4). MAE không có sự khuếch đại này.</p>',
          example: '',
        },
        concept_cards: [
          { icon: 'fa-scale-balanced', title: 'MAE — công bằng', body: 'Mỗi lỗi đóng góp đúng theo độ lớn thực — 1 outlier không áp đảo toàn bộ.' },
          { icon: 'fa-bomb', title: 'MSE — khuếch đại lỗi lớn', body: 'Bình phương làm lỗi lớn "nổ tung" — 1 outlier có thể chi phối gần hết giá trị MSE.' },
          { icon: 'fa-percent', title: 'R² — so với baseline', body: 'So sánh model với việc "chỉ đoán trung bình" — có thể ÂM nếu model tệ hơn cả không làm gì.' },
        ],
        visual: {
          schema: {
            table_name: 'regression_metrics_report',
            columns: [
              { name: 'index', type: 'INT', key: '' },
              { name: 'actual', type: 'FLOAT', key: '' },
              { name: 'predicted', type: 'FLOAT', key: '' },
              { name: 'abs_error', type: 'VARCHAR', key: '' },
            ],
          },
          data_preview: [
            ['0', '50.0', '52.0', '2.0'],
            ['7', '90.0', '40.0', '50.0 ← outlier'],
            ['9', '58.0', '56.0', '2.0'],
          ],
        },
      },
      step_2: {
        mcq: [
          {
            question: 'Vì sao MSE bị ảnh hưởng bởi outlier NHIỀU HƠN MAE?',
            options: [
              { id: 'a', text: 'Vì MSE bình phương lỗi trước khi lấy trung bình — lỗi lớn bị khuếch đại theo cấp số nhân (lỗi gấp đôi → đóng góp gấp 4)', correct: true, explanation: 'Chính xác — đây là cơ chế toán học của sự khác biệt.' },
              { id: 'b', text: 'Vì MSE chỉ tính trên 1 điểm dữ liệu duy nhất', correct: false, explanation: 'MSE tính trung bình trên TẤT CẢ điểm dữ liệu, giống MAE — khác biệt là CÁCH tính từng lỗi (bình phương vs trị tuyệt đối), không phải số điểm.' },
              { id: 'c', text: 'Vì MAE không tính được khi có outlier', correct: false, explanation: 'MAE hoàn toàn tính được với outlier — nó chỉ đơn giản KHÔNG khuếch đại outlier như MSE.' },
              { id: 'd', text: 'Vì MSE và MAE thực ra là cùng 1 công thức, chỉ khác tên gọi', correct: false, explanation: 'Đây là 2 công thức khác nhau rõ rệt: MSE dùng bình phương, MAE dùng trị tuyệt đối.' },
            ],
          },
          {
            question: 'R² âm (âm, không phải gần 0) nghĩa là gì?',
            options: [
              { id: 'a', text: 'Model dự đoán TỆ HƠN cả việc chỉ đoán bằng giá trị trung bình của target', correct: true, explanation: 'Đúng — đây là ý nghĩa toán học của R² âm, một dấu hiệu model đang hoạt động rất kém.' },
              { id: 'b', text: 'Model có lỗi cú pháp và không chạy được', correct: false, explanation: 'R² âm là một kết quả TOÁN HỌC HỢP LỆ, không phải lỗi chạy code.' },
              { id: 'c', text: 'Cần nhân R² với -1 để đọc đúng giá trị', correct: false, explanation: 'R² âm được đọc trực tiếp — không cần biến đổi gì thêm, nó thật sự có nghĩa là "tệ hơn baseline".' },
              { id: 'd', text: 'R² luôn nằm trong khoảng [0, 1], không thể âm', correct: false, explanation: 'R² CÓ THỂ âm — nó không bị giới hạn dưới 0 như nhiều người lầm tưởng.' },
            ],
          },
        ],
        mini_game: {
          title: 'Metric nào phù hợp với mục tiêu nào?',
          instruction: 'Xếp mỗi tình huống vào đúng metric nên ưu tiên.',
          chips: [
            { id: 'chip-fair', label: 'Muốn mọi lỗi được đánh giá công bằng theo độ lớn thực' },
            { id: 'chip-penalize-big', label: 'Muốn phạt nặng các lỗi lớn hơn hẳn lỗi nhỏ' },
            { id: 'chip-compare-baseline', label: 'Muốn biết model tốt hơn baseline "đoán trung bình" bao nhiêu' },
          ],
          bins: [
            { id: 'mae', label: 'MAE', correct: 'true' },
            { id: 'mse', label: 'MSE', correct: 'true' },
            { id: 'r2', label: 'R²', correct: 'true' },
          ],
          solution: { 'chip-fair': 'mae', 'chip-penalize-big': 'mse', 'chip-compare-baseline': 'r2' },
          success_html: '✅ MAE = công bằng. MSE = phạt nặng lỗi lớn. R² = so với baseline trung bình.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Tính MAE, MSE, R² trên 10 dự đoán có 1 outlier — so sánh mức chênh lệch.',
        blocks: [
          { type: 'py', token: 'import numpy as np', slot: 'z1a' },
          { type: 'py', token: 'from ml_lab import load_regression_metrics_data', slot: 'z1b' },
          { type: 'py', token: 'actual, predictions =', slot: 'z2a' },
          { type: 'py', token: 'load_regression_metrics_data()', slot: 'z2b' },
          { type: 'py', token: 'mae =', slot: 'z3a' },
          { type: 'py', token: 'np.abs(actual - predictions).mean()', slot: 'z3b' },
          { type: 'py', token: 'mse =', slot: 'z4a' },
          { type: 'py', token: '((actual - predictions)**2).mean()', slot: 'z4b' },
        ],
        drop_zones: [
          { id: 'l8-import', accepts: ['py'], multi: true },
          { id: 'l8-load', accepts: ['py'], multi: true },
          { id: 'l8-mae', accepts: ['py'], multi: true },
          { id: 'l8-mse', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'l8-import': 'import numpy as np from ml_lab import load_regression_metrics_data',
          'l8-load': 'actual, predictions = load_regression_metrics_data()',
          'l8-mae': 'mae = np.abs(actual - predictions).mean()',
          'l8-mse': 'mse = ((actual - predictions)**2).mean()',
        },
        reveal_hints: {
          'l8-import': 'Import <strong>numpy</strong> và <strong>load_regression_metrics_data</strong>.',
          'l8-load': 'Nạp 2 mảng: <strong>actual, predictions</strong>.',
          'l8-mae': 'MAE: <strong>np.abs(actual - predictions).mean()</strong>.',
          'l8-mse': 'MSE: <strong>((actual - predictions)**2).mean()</strong>.',
        },
        expected_sql: 'import numpy as np from ml_lab import load_regression_metrics_data actual, predictions = load_regression_metrics_data() mae = np.abs(actual - predictions).mean() mse = ((actual - predictions)**2).mean()',
      },
      drag_map: {
        brand: 'DÒNG CHẢY APPLIED ML LAB',
        table_sub: '10 dự đoán · 1 outlier tại index 7',
        idle_sub: 'Bấm ▶ để tính metric',
        run_label: '▶ Tính MAE / MSE / R²',
        table: {
          name: 'regression_metrics_report',
          columns: ['index', 'actual', 'predicted', 'abs_error'],
          dataRows: [
            ['0', '50.0', '52.0', '2.0'],
            ['7', '90.0', '40.0', '50.0 ← outlier'],
            ['9', '58.0', '56.0', '2.0'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Tính <code>mae</code>, <code>mse</code>, <code>r2</code> trên dữ liệu có 1 outlier. In cả 3 — mse phải LỚN HƠN HẲN mae.</p>',
        context: {
          scenario: 'StudyLab có 10 dự đoán, 1 cái lệch rất xa — bạn cần chứng minh MSE và MAE "kể chuyện khác nhau" về cùng 1 bộ dữ liệu.',
          real_world: 'Giống việc đo "độ hài lòng trung bình" của 10 khách hàng — nếu 9 người hài lòng nhẹ và 1 người CỰC KỲ tức giận, "trung bình cộng" (MAE-style) vẫn coi đó là 1 phàn nàn, nhưng "trung bình bình phương mức độ giận" (MSE-style) sẽ khiến 1 khách đó chi phối toàn bộ báo cáo.',
          steps: [
            'Load 2 mảng: <code>load_regression_metrics_data()</code>.',
            'Tính <code>mae = np.abs(actual - predictions).mean()</code>.',
            'Tính <code>mse = ((actual - predictions)**2).mean()</code>.',
            'Tính <code>r2</code> = 1 - SS_res/SS_tot (hoặc <code>from sklearn.metrics import r2_score</code>). In cả 3.',
          ],
          hint_explore: 'Muốn xem lỗi từng điểm? Gõ <code>print(np.abs(actual - predictions))</code> rồi Run — tìm điểm lệch xa nhất.',
          expected: 'Console in mae (~6.8), mse (~253.6 — LỚN HƠN HẲN mae do outlier), và r2 (có thể ÂM do outlier quá lớn so với phương sai target).',
        },
        hints: [
          { level: 1, text: 'MAE: <code>np.abs(actual - predictions).mean()</code>.' },
          { level: 2, text: 'MSE: <code>((actual - predictions)**2).mean()</code> — chú ý dấu ngoặc bao quanh phép trừ trước khi bình phương.' },
          { level: 3, text: 'R²: <code>1 - ((actual-predictions)**2).sum() / ((actual-actual.mean())**2).sum()</code>.' },
        ],
        grader_fn: 'grade_lesson_c2_8',
        success_message: 'Bạn đã chứng minh: MSE bị outlier kéo lệch mạnh hơn MAE rất nhiều — chọn metric phải cân nhắc bối cảnh.',
        xp_reward: 60,
        starter_hint: '💡 Bắt đầu bằng: from ml_lab import load_regression_metrics_data',
      },
    },

    {
      id: 'c2_l9',
      index: 9,
      title: 'Confusion Matrix và class imbalance',
      subtitle: 'Accuracy cao có thể là một classifier vô dụng',
      module: 3,
      module_title: 'M3 · Model Evaluation & Diagnosis',
      estimated_minutes: 23,
      xp_reward: 70,
      achievement: { name: 'Metric Chooser', desc: 'Phát hiện cái bẫy accuracy dưới class imbalance.' },
      story: {
        tag: '📊 StudyLab · Applied ML Lab',
        hook: '1000 học viên, chỉ 50 người thật sự "nguy cơ rớt" (5%). Một classifier NGU NGỐC — luôn đoán "không nguy cơ" cho MỌI người — đạt accuracy 95%! Nghe có vẻ ấn tượng, nhưng nó VÔ DỤNG HOÀN TOÀN: nó không bao giờ phát hiện được 1 ca nguy cơ nào. Một model THẬT, bắt được 40/50 ca nguy cơ, lại có accuracy THẤP HƠN (94.5%) — nhưng hữu ích hơn gấp bội.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Xây dựng confusion matrix (TP/FP/FN/TN) từ dự đoán và nhãn thật.',
            'Chứng minh accuracy có thể ĐÁNH LỪA nghiêm trọng khi dữ liệu mất cân bằng lớp.',
            'Dùng recall để phát hiện một classifier "vô dụng nhưng accuracy cao".',
          ],
        },
        glossary: [
          { term: 'Confusion Matrix', vi: 'Ma trận nhầm lẫn', def: 'Bảng 2×2 (cho bài toán nhị phân) đếm 4 trường hợp: True Positive, False Positive, False Negative, True Negative — nền tảng của mọi metric phân loại.' },
          { term: 'Class imbalance', vi: 'Mất cân bằng lớp', def: 'Khi một lớp chiếm đa số áp đảo (vd 95% vs 5%) — accuracy trở nên KHÔNG ĐÁNG TIN CẬY vì một classifier "lười" (luôn đoán lớp đa số) vẫn đạt accuracy cao.' },
          { term: 'Recall (Sensitivity)', vi: 'Độ nhạy / Độ phủ', def: 'Tỉ lệ các trường hợp DƯƠNG TÍNH thật được model phát hiện đúng — recall=0 nghĩa là model không bao giờ bắt được ca dương tính nào, dù accuracy có thể vẫn cao.', out: 'TP / (TP + FN)' },
        ],
        primer: {
          goal: ['So sánh naive classifier (luôn đoán 0) với model thật.', 'Chứng minh accuracy cao KHÔNG đảm bảo hữu ích khi mất cân bằng lớp.'],
          intro: '<p>Khi 95% dữ liệu thuộc 1 lớp, "luôn đoán lớp đó" đã cho accuracy 95% — mà không cần học BẤT KỲ điều gì. Đây chính là cái bẫy accuracy dưới class imbalance: một con số cao KHÔNG tự động nghĩa là model tốt. Phải nhìn thêm recall (và precision) để biết model có thực sự "nhìn thấy" lớp thiểu số hay không.</p>',
          example: '',
        },
        concept_cards: [
          { icon: 'fa-ban', title: 'Naive: luôn đoán 0', body: 'Accuracy 95% — nhưng recall = 0. Không bao giờ phát hiện được 1 ca nguy cơ nào.' },
          { icon: 'fa-magnifying-glass', title: 'Model thật: bắt 40/50 ca', body: 'Accuracy 94.5% (THẤP HƠN naive!) nhưng recall = 0.8 — hữu ích hơn nhiều.' },
          { icon: 'fa-triangle-exclamation', title: 'Bẫy accuracy', body: 'Accuracy một mình có thể xếp hạng SAI classifier nào thật sự tốt hơn dưới class imbalance.' },
        ],
        visual: {
          schema: {
            table_name: 'imbalance_comparison',
            columns: [
              { name: 'classifier', type: 'VARCHAR', key: 'PK' },
              { name: 'accuracy', type: 'FLOAT', key: '' },
              { name: 'recall', type: 'FLOAT', key: '' },
            ],
          },
          data_preview: [
            ['naive (luôn đoán 0)', '0.950', '0.000'],
            ['model thật', '0.945', '0.800'],
          ],
        },
      },
      step_2: {
        mcq: [
          {
            question: 'Một classifier LUÔN đoán "lớp 0" trên dữ liệu 95% lớp 0 / 5% lớp 1 đạt accuracy 95%. Điều này có nghĩa model đó TỐT không?',
            options: [
              { id: 'a', text: 'Không — nó chỉ đơn giản lợi dụng sự mất cân bằng lớp, hoàn toàn không phát hiện được lớp 1 (recall = 0)', correct: true, explanation: 'Đúng — đây chính là bẫy accuracy dưới class imbalance.' },
              { id: 'b', text: 'Có — accuracy 95% luôn là một kết quả xuất sắc bất kể ngữ cảnh', correct: false, explanation: 'Accuracy cao KHÔNG tự động nghĩa là tốt — phải xem xét CẢ recall/precision, đặc biệt khi lớp mất cân bằng.' },
              { id: 'c', text: 'Không thể kết luận gì nếu chỉ biết accuracy', correct: false, explanation: 'Thực ra CÓ THỂ kết luận nhiều — accuracy cao BẤT THƯỜNG cùng imbalance nặng là dấu hiệu cảnh báo rất rõ ràng cần kiểm tra recall.' },
              { id: 'd', text: 'Có, miễn là accuracy trên 90%', correct: false, explanation: 'Ngưỡng accuracy đơn thuần không nói lên gì về tính hữu ích thật — 1 model vô dụng vẫn có thể vượt ngưỡng 90% dễ dàng dưới imbalance.' },
            ],
          },
          {
            question: 'Recall = 0 trong khi accuracy vẫn cao — điều này tiết lộ gì về model?',
            options: [
              { id: 'a', text: 'Model không bao giờ phát hiện đúng được bất kỳ trường hợp dương tính (positive) thật nào', correct: true, explanation: 'Đúng — đây chính là ý nghĩa của recall = 0, một tín hiệu nghiêm trọng mà accuracy một mình che giấu.' },
              { id: 'b', text: 'Model bị lỗi cú pháp khi tính toán', correct: false, explanation: 'Recall=0 là kết quả TOÁN HỌC hợp lệ (không phải lỗi runtime) khi model không bắt được ca dương tính nào.' },
              { id: 'c', text: 'Dữ liệu test có vấn đề, cần thu thập lại', correct: false, explanation: 'Vấn đề nằm ở HÀNH VI của model (không học được gì về lớp thiểu số), không nhất thiết là lỗi dữ liệu.' },
              { id: 'd', text: 'Model đang overfit nghiêm trọng', correct: false, explanation: 'Đây là dấu hiệu ngược lại — model quá "lười" (underfit đến mức không học gì về lớp thiểu số), không phải overfit.' },
            ],
          },
        ],
        mini_game: {
          title: 'Naive classifier hay Model thật? Ghép đúng đặc điểm',
          instruction: 'Kéo mỗi đặc điểm vào đúng nhóm.',
          chips: [
            { id: 'chip-highacc', label: 'Accuracy cao NHẤT (95%) nhưng vô dụng' },
            { id: 'chip-zerorecall', label: 'Recall = 0 — không bao giờ phát hiện lớp thiểu số' },
            { id: 'chip-loweraccbetter', label: 'Accuracy thấp hơn (94.5%) nhưng recall cao (0.8)' },
            { id: 'chip-usable', label: 'Thực sự hữu ích để phát hiện ca nguy cơ' },
          ],
          bins: [
            { id: 'naive', label: 'Naive (luôn đoán 0)', correct: 'true' },
            { id: 'model', label: 'Model thật', correct: 'true' },
          ],
          solution: { 'chip-highacc': 'naive', 'chip-zerorecall': 'naive', 'chip-loweraccbetter': 'model', 'chip-usable': 'model' },
          success_html: '✅ Naive thắng về accuracy nhưng vô dụng (recall=0). Model thật thua accuracy nhưng hữu ích thật (recall cao).',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'So sánh naive classifier vs model thật — in accuracy + recall cho cả 2.',
        blocks: [
          { type: 'py', token: 'from ml_lab import load_imbalanced_data', slot: 'z1a' },
          { type: 'py', token: 'y_true, y_pred_naive, y_pred_model =', slot: 'z2a' },
          { type: 'py', token: 'load_imbalanced_data()', slot: 'z2b' },
          { type: 'py', token: 'def recall(y, p):', slot: 'z3a' },
          { type: 'py', token: 'tp = ((p==1)&(y==1)).sum(); fn = ((p==0)&(y==1)).sum(); return tp/(tp+fn)', slot: 'z3b' },
          { type: 'py', token: 'naive_acc =', slot: 'z4a' },
          { type: 'py', token: '(y_true == y_pred_naive).mean()', slot: 'z4b' },
        ],
        drop_zones: [
          { id: 'l9-import', accepts: ['py'], multi: true },
          { id: 'l9-load', accepts: ['py'], multi: true },
          { id: 'l9-def', accepts: ['py'], multi: true },
          { id: 'l9-acc', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'l9-import': 'from ml_lab import load_imbalanced_data',
          'l9-load': 'y_true, y_pred_naive, y_pred_model = load_imbalanced_data()',
          'l9-def': 'def recall(y, p): tp = ((p==1)&(y==1)).sum(); fn = ((p==0)&(y==1)).sum(); return tp/(tp+fn)',
          'l9-acc': 'naive_acc = (y_true == y_pred_naive).mean()',
        },
        reveal_hints: {
          'l9-import': 'Import <strong>load_imbalanced_data</strong>.',
          'l9-load': 'Nạp 3 mảng: <strong>y_true, y_pred_naive, y_pred_model</strong>.',
          'l9-def': 'Định nghĩa hàm recall: <strong>TP / (TP + FN)</strong>.',
          'l9-acc': 'Tính accuracy naive trước — sẽ RẤT CAO dù vô dụng.',
        },
        expected_sql: 'from ml_lab import load_imbalanced_data y_true, y_pred_naive, y_pred_model = load_imbalanced_data() def recall(y, p): tp = ((p==1)&(y==1)).sum(); fn = ((p==0)&(y==1)).sum(); return tp/(tp+fn) naive_acc = (y_true == y_pred_naive).mean()',
      },
      drag_map: {
        brand: 'DÒNG CHẢY APPLIED ML LAB',
        table_sub: 'Naive vs Model thật · 1000 học viên (50 nguy cơ)',
        idle_sub: 'Bấm ▶ để so sánh',
        run_label: '▶ So sánh 2 classifier',
        table: {
          name: 'imbalance_comparison',
          columns: ['classifier', 'accuracy', 'recall'],
          dataRows: [
            ['naive (luôn đoán 0)', '0.950', '0.000'],
            ['model thật', '0.945', '0.800'],
          ],
        },
      },
      step_4: {
        prompt: '<p>So sánh naive vs model thật. In <code>naive_acc</code>, <code>naive_recall</code>, <code>model_acc</code>, <code>model_recall</code>.</p>',
        context: {
          scenario: 'StudyLab cần chứng minh với ban lãnh đạo rằng "accuracy cao" không phải lúc nào cũng là thước đo đúng để chọn model phát hiện nguy cơ rớt môn.',
          real_world: 'Giống một máy dò kim loại ở sân bay CHƯA BAO GIỜ báo động — nó "đúng" với 99.9% hành khách (không ai mang kim loại), nhưng hoàn toàn vô dụng cho MỤC ĐÍCH THẬT của nó: phát hiện trường hợp hiếm nhưng quan trọng.',
          steps: [
            'Load 3 mảng: <code>load_imbalanced_data()</code>.',
            'Định nghĩa hàm <code>recall(y, p)</code> và <code>acc(y, p)</code> (hoặc dùng trực tiếp <code>(y==p).mean()</code>).',
            'Tính <code>naive_acc</code>, <code>naive_recall</code> cho <code>y_pred_naive</code>.',
            'Tính <code>model_acc</code>, <code>model_recall</code> cho <code>y_pred_model</code>. In cả 4 giá trị.',
          ],
          hint_explore: 'Muốn xem phân bố lớp? Gõ <code>import numpy as np; print(np.bincount(y_true))</code> rồi Run.',
          expected: 'naive_acc (~0.95) CAO HƠN model_acc (~0.945), nhưng naive_recall (~0) THẤP HƠN HẲN model_recall (~0.8) — nghịch lý accuracy.',
        },
        hints: [
          { level: 1, text: 'Accuracy: <code>(y_true == y_pred).mean()</code>.' },
          { level: 2, text: 'Recall: <code>TP / (TP + FN)</code> — chỉ tính trên các trường hợp y_true == 1.' },
          { level: 3, text: 'In đủ 4 giá trị: naive_acc, naive_recall, model_acc, model_recall — so sánh CẢ 2 metric mới thấy được nghịch lý.' },
        ],
        grader_fn: 'grade_lesson_c2_9',
        success_message: 'Bạn đã phát hiện cái bẫy accuracy dưới class imbalance — model "kém accuracy hơn" lại hữu ích hơn nhiều.',
        xp_reward: 70,
        starter_hint: '💡 Bắt đầu bằng: from ml_lab import load_imbalanced_data',
      },
    },

    {
      id: 'c2_l10',
      index: 10,
      title: 'Accuracy, Precision, Recall và F1',
      subtitle: 'Precision vs Recall — trade-off không thể tránh khỏi',
      module: 3,
      module_title: 'M3 · Model Evaluation & Diagnosis',
      estimated_minutes: 23,
      xp_reward: 70,
      achievement: { name: 'Metric Chooser', desc: 'Đọc đúng trade-off Precision-Recall theo bối cảnh business.' },
      story: {
        tag: '📊 StudyLab · Applied ML Lab',
        hook: 'Hai classifier cho bài toán "phát hiện nguy cơ rớt": "Conservative" chỉ báo động khi RẤT chắc chắn — ít báo động sai (precision cao) nhưng bỏ sót nhiều ca thật (recall thấp). "Liberal" báo động rộng rãi — bắt gần hết ca thật (recall cao) nhưng báo động sai rất nhiều (precision thấp). KHÔNG có classifier nào "tốt hơn tuyệt đối" — câu trả lời phụ thuộc StudyLab coi trọng điều gì hơn.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Tính Precision, Recall, F1 cho 2 classifier có trade-off ngược nhau.',
            'Giải thích trade-off Precision-Recall: tăng cái này thường đánh đổi cái kia.',
            'Chọn classifier phù hợp dựa trên chi phí thực tế của false positive vs false negative.',
          ],
        },
        glossary: [
          { term: 'Precision', vi: 'Độ chính xác (dương tính)', def: 'Trong số các trường hợp model DỰ ĐOÁN dương tính, bao nhiêu % thực sự đúng — cao nghĩa là ít báo động giả.', out: 'TP / (TP + FP)' },
          { term: 'Recall', vi: 'Độ phủ (đã học ở Bài 9)', def: 'Trong số các trường hợp DƯƠNG TÍNH THẬT, bao nhiêu % được model phát hiện — cao nghĩa là ít bỏ sót.', out: 'TP / (TP + FN)' },
          { term: 'F1 score', vi: 'Điểm F1', def: 'Trung bình điều hoà (harmonic mean) của Precision và Recall — cao chỉ khi CẢ HAI đều cao, phạt nặng nếu 1 trong 2 quá thấp.', out: '2·P·R / (P+R)' },
        ],
        primer: {
          goal: ['Tính Precision + Recall cho classifier conservative và liberal.', 'Hiểu trade-off: tăng recall thường làm giảm precision, và ngược lại.'],
          intro: '<p>Precision trả lời "khi tôi báo động, tôi đúng bao nhiêu %?". Recall trả lời "trong số các ca thật, tôi bắt được bao nhiêu %?". Một classifier "rộng rãi" (báo động nhiều) sẽ bắt được nhiều ca thật hơn (recall cao) nhưng cũng báo động sai nhiều hơn (precision thấp) — đây là đánh đổi gần như không thể tránh khỏi.</p>',
          example: '',
        },
        concept_cards: [
          { icon: 'fa-shield', title: 'Conservative', body: 'Precision cao (0.91), recall thấp (0.33) — ít báo động sai, nhưng bỏ sót nhiều ca thật.' },
          { icon: 'fa-bullhorn', title: 'Liberal', body: 'Recall cao (0.93), precision thấp (0.44) — bắt gần hết ca thật, nhưng báo động sai rất nhiều.' },
          { icon: 'fa-scale-balanced', title: 'Chọn theo bối cảnh', body: 'Sàng lọc bệnh nguy hiểm → ưu tiên recall. Lọc spam → ưu tiên precision. Không có câu trả lời "đúng tuyệt đối".' },
        ],
        visual: {
          schema: {
            table_name: 'prf_comparison',
            columns: [
              { name: 'classifier', type: 'VARCHAR', key: 'PK' },
              { name: 'precision', type: 'FLOAT', key: '' },
              { name: 'recall', type: 'FLOAT', key: '' },
            ],
          },
          data_preview: [
            ['conservative', '0.909', '0.333'],
            ['liberal', '0.444', '0.933'],
          ],
        },
      },
      step_2: {
        mcq: [
          {
            question: 'Vì sao tăng recall thường làm GIẢM precision (và ngược lại)?',
            options: [
              { id: 'a', text: 'Vì để bắt được nhiều ca dương tính thật hơn (recall cao), model phải "báo động" rộng rãi hơn — điều này tất yếu kéo theo nhiều báo động SAI hơn (precision thấp)', correct: true, explanation: 'Đúng — đây là bản chất của trade-off Precision-Recall.' },
              { id: 'b', text: 'Vì Precision và Recall được tính từ 2 bộ dữ liệu hoàn toàn khác nhau', correct: false, explanation: 'Cả 2 đều tính từ CÙNG một confusion matrix, cùng một bộ dự đoán — chỉ khác công thức, không khác dữ liệu.' },
              { id: 'c', text: 'Vì sklearn cố tình thiết kế 2 metric này đối lập nhau', correct: false, explanation: 'Đây không phải thiết kế tuỳ tiện của thư viện — đó là hệ quả TOÁN HỌC tất yếu của việc thay đổi ngưỡng/độ nhạy classifier.' },
              { id: 'd', text: 'Precision và Recall luôn tăng/giảm cùng chiều nhau', correct: false, explanation: 'Thường NGƯỢC CHIỀU nhau (trade-off) — đây chính là điều bài học này chứng minh bằng số liệu.' },
            ],
          },
          {
            question: 'Trong bài toán "sàng lọc bệnh nguy hiểm" (bỏ sót 1 ca bệnh nguy hiểm hơn nhiều so với báo động giả), nên ưu tiên metric nào?',
            options: [
              { id: 'a', text: 'Recall — vì bỏ sót 1 ca bệnh thật (false negative) có hậu quả nghiêm trọng hơn nhiều so với 1 báo động giả', correct: true, explanation: 'Đúng — khi chi phí của false negative rất cao, ưu tiên recall (chấp nhận nhiều false positive hơn) là hợp lý.' },
              { id: 'b', text: 'Precision — vì không muốn báo động giả làm bệnh nhân hoang mang', correct: false, explanation: 'Trong bối cảnh này, hậu quả của việc BỎ SÓT bệnh nguy hiểm (recall thấp) nghiêm trọng hơn nhiều so với báo động giả.' },
              { id: 'c', text: 'Không metric nào quan trọng, chỉ cần accuracy cao', correct: false, explanation: 'Với bài toán có hậu quả bất đối xứng (bỏ sót nguy hiểm hơn báo động giả), accuracy một mình không đủ — cần nhìn cụ thể recall.' },
              { id: 'd', text: 'F1 score luôn là lựa chọn đúng cho mọi bối cảnh', correct: false, explanation: 'F1 cân bằng Precision-Recall như nhau — nhưng khi hậu quả 2 loại lỗi RẤT khác nhau, cần ưu tiên rõ ràng 1 trong 2, không phải "cân bằng đều".' },
            ],
          },
        ],
        mini_game: {
          title: 'Ghép mỗi classifier với đặc điểm Precision-Recall đúng',
          instruction: 'Kéo mỗi thẻ vào đúng nhóm.',
          chips: [
            { id: 'chip-cons-p', label: 'Precision cao (0.91), báo động sai ít' },
            { id: 'chip-cons-r', label: 'Recall thấp (0.33), bỏ sót nhiều ca thật' },
            { id: 'chip-lib-p', label: 'Precision thấp (0.44), báo động sai nhiều' },
            { id: 'chip-lib-r', label: 'Recall cao (0.93), bắt gần hết ca thật' },
          ],
          bins: [
            { id: 'conservative', label: 'Conservative', correct: 'true' },
            { id: 'liberal', label: 'Liberal', correct: 'true' },
          ],
          solution: { 'chip-cons-p': 'conservative', 'chip-cons-r': 'conservative', 'chip-lib-p': 'liberal', 'chip-lib-r': 'liberal' },
          success_html: '✅ Conservative = precision cao, recall thấp. Liberal = ngược lại — trade-off kinh điển.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Tính Precision + Recall cho conservative và liberal — chứng minh trade-off.',
        blocks: [
          { type: 'py', token: 'from ml_lab import load_prf_data', slot: 'z1a' },
          { type: 'py', token: 'y_true, y_pred_conservative, y_pred_liberal =', slot: 'z2a' },
          { type: 'py', token: 'load_prf_data()', slot: 'z2b' },
          { type: 'py', token: 'def precision(y, p):', slot: 'z3a' },
          { type: 'py', token: 'tp=((p==1)&(y==1)).sum(); fp=((p==1)&(y==0)).sum(); return tp/(tp+fp)', slot: 'z3b' },
          { type: 'py', token: 'conservative_precision =', slot: 'z4a' },
          { type: 'py', token: 'precision(y_true, y_pred_conservative)', slot: 'z4b' },
        ],
        drop_zones: [
          { id: 'l10-import', accepts: ['py'], multi: true },
          { id: 'l10-load', accepts: ['py'], multi: true },
          { id: 'l10-def', accepts: ['py'], multi: true },
          { id: 'l10-compute', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'l10-import': 'from ml_lab import load_prf_data',
          'l10-load': 'y_true, y_pred_conservative, y_pred_liberal = load_prf_data()',
          'l10-def': 'def precision(y, p): tp=((p==1)&(y==1)).sum(); fp=((p==1)&(y==0)).sum(); return tp/(tp+fp)',
          'l10-compute': 'conservative_precision = precision(y_true, y_pred_conservative)',
        },
        reveal_hints: {
          'l10-import': 'Import <strong>load_prf_data</strong>.',
          'l10-load': 'Nạp 3 mảng: <strong>y_true, y_pred_conservative, y_pred_liberal</strong>.',
          'l10-def': 'Định nghĩa hàm precision: <strong>TP / (TP + FP)</strong>.',
          'l10-compute': 'Tính precision cho conservative trước.',
        },
        expected_sql: 'from ml_lab import load_prf_data y_true, y_pred_conservative, y_pred_liberal = load_prf_data() def precision(y, p): tp=((p==1)&(y==1)).sum(); fp=((p==1)&(y==0)).sum(); return tp/(tp+fp) conservative_precision = precision(y_true, y_pred_conservative)',
      },
      drag_map: {
        brand: 'DÒNG CHẢY APPLIED ML LAB',
        table_sub: 'Conservative vs Liberal · trade-off',
        idle_sub: 'Bấm ▶ để so sánh',
        run_label: '▶ Tính Precision/Recall',
        table: {
          name: 'prf_comparison',
          columns: ['classifier', 'precision', 'recall'],
          dataRows: [
            ['conservative', '0.909', '0.333'],
            ['liberal', '0.444', '0.933'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Tính Precision + Recall cho conservative và liberal. In cả 4 giá trị — trade-off phải rõ rệt.</p>',
        context: {
          scenario: 'StudyLab đang phân vân giữa 2 classifier cho hệ thống cảnh báo sớm — bạn cần trình bày trade-off bằng số liệu để ban điều hành quyết định.',
          real_world: 'Giống việc thiết lập độ nhạy chuông báo cháy: quá nhạy (liberal) → báo động giả liên tục vì khói nấu ăn (precision thấp); quá lì (conservative) → có thể không kịp báo khi cháy thật (recall thấp). Không có "độ nhạy đúng tuyệt đối" — phải cân nhắc hậu quả từng loại lỗi.',
          steps: [
            'Load 3 mảng: <code>load_prf_data()</code>.',
            'Định nghĩa hàm <code>precision(y, p)</code> và <code>recall(y, p)</code>.',
            'Tính <code>conservative_precision</code>, <code>conservative_recall</code> cho <code>y_pred_conservative</code>.',
            'Tính <code>liberal_precision</code>, <code>liberal_recall</code> cho <code>y_pred_liberal</code>. In cả 4.',
          ],
          hint_explore: 'Muốn xem tỉ lệ lớp? Gõ <code>print(y_true.sum(), len(y_true))</code> rồi Run.',
          expected: 'conservative_precision (~0.91) CAO HƠN liberal_precision (~0.44); liberal_recall (~0.93) CAO HƠN conservative_recall (~0.33).',
        },
        hints: [
          { level: 1, text: 'Precision: <code>TP / (TP + FP)</code>. Recall: <code>TP / (TP + FN)</code>.' },
          { level: 2, text: 'TP = <code>((p==1)&(y==1)).sum()</code>, FP = <code>((p==1)&(y==0)).sum()</code>, FN = <code>((p==0)&(y==1)).sum()</code>.' },
          { level: 3, text: 'In đủ 4 giá trị với TÊN CHÍNH XÁC: conservative_precision, conservative_recall, liberal_precision, liberal_recall.' },
        ],
        grader_fn: 'grade_lesson_c2_10',
        success_message: 'Bạn đã chứng minh trade-off Precision-Recall bằng số liệu thật — không có classifier "tốt nhất tuyệt đối".',
        xp_reward: 70,
        starter_hint: '💡 Bắt đầu bằng: from ml_lab import load_prf_data',
      },
    },
    // ╔══════════════════════════════════════════════════════════╗
    // ║  M4 — INSTANCE & TREE-BASED MODELS                       ║
    // ╚══════════════════════════════════════════════════════════╝
    {
      id: 'c2_l11',
      index: 11,
      title: 'K-Nearest Neighbors',
      subtitle: '"Nhìn hàng xóm gần nhất" — không cần công thức, chỉ cần khoảng cách',
      module: 4,
      module_title: 'M4 · Instance & Tree-Based Models',
      estimated_minutes: 22,
      xp_reward: 60,
      achievement: { name: 'Instance Learner', desc: 'Chọn k bằng validation — không phải con số quen thuộc.' },
      story: {
        tag: '📊 StudyLab · Applied ML Lab',
        hook: 'Không giống LogisticRegression (học ra 1 phương trình cố định), KNN KHÔNG học gì cả khi fit — nó chỉ "ghi nhớ" toàn bộ dữ liệu train. Khi cần dự đoán 1 điểm mới, nó tìm k điểm train GẦN NHẤT và lấy nhãn phổ biến nhất trong số đó. Đơn giản đến ngạc nhiên — nhưng tham số k (bao nhiêu hàng xóm?) ảnh hưởng rất lớn đến kết quả.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Giải thích cơ chế KNN: dự đoán dựa trên nhãn phổ biến của k điểm gần nhất.',
            'Sweep nhiều giá trị k, đo validation accuracy cho từng k.',
            'Chọn k bằng bằng chứng validation — không phải con số "quen thuộc" như k=5.',
          ],
        },
        glossary: [
          { term: 'K-Nearest Neighbors (KNN)', vi: 'K hàng xóm gần nhất', def: 'Thuật toán "lazy learning" — không học tham số, chỉ ghi nhớ train. Dự đoán = nhãn phổ biến nhất trong k điểm train gần nhất với điểm cần dự đoán.' },
          { term: 'k (số hàng xóm)', vi: 'Tham số k', def: 'Số điểm gần nhất được xem xét khi dự đoán — k nhỏ nhạy với nhiễu (dễ overfit biên), k lớn làm ranh giới mượt hơn (có thể underfit nếu quá lớn).' },
          { term: 'Lazy learning', vi: 'Học "lười"', def: 'Không có giai đoạn học tham số thật sự khi fit() — mọi tính toán dồn vào lúc predict() (tính khoảng cách đến mọi điểm train).' },
        ],
        primer: {
          goal: ['Fit KNeighborsClassifier với nhiều giá trị k.', 'Đo val_accuracy cho từng k, chọn k tốt nhất.'],
          intro: '<p>KNN "học" bằng cách... không học gì cả — nó chỉ lưu lại toàn bộ dữ liệu train. Khi cần dự đoán một điểm mới, nó đo khoảng cách đến MỌI điểm train, chọn k điểm gần nhất, và "bỏ phiếu" theo đa số nhãn trong nhóm đó. k là tham số quan trọng nhất: quá nhỏ dễ bị nhiễu đánh lừa, quá lớn có thể làm mất chi tiết cục bộ.</p>',
          example: '',
        },
        concept_cards: [
          { icon: 'fa-magnet', title: 'Không học, chỉ ghi nhớ', body: 'fit() chỉ lưu dữ liệu — mọi "trí tuệ" nằm ở bước predict(), tính khoảng cách thật.' },
          { icon: 'fa-users', title: 'Bỏ phiếu theo đa số', body: 'k điểm gần nhất "bỏ phiếu" — nhãn nào nhiều phiếu hơn thắng.' },
          { icon: 'fa-sliders', title: 'k ảnh hưởng mạnh', body: 'k khác nhau cho val_accuracy khác nhau — không có k "mặc định đúng cho mọi dữ liệu".' },
        ],
        visual: {
          schema: {
            table_name: 'knn_k_sweep',
            columns: [
              { name: 'k', type: 'INT', key: '' },
              { name: 'val_accuracy', type: 'FLOAT', key: '' },
            ],
          },
          data_preview: [
            ['1', '0.800'],
            ['5', '0.833'],
            ['15', '0.822'],
            ['50', '0.811'],
          ],
        },
      },
      step_2: {
        mcq: [
          {
            question: 'KNN "học" điều gì khi gọi <code>.fit(X_train, y_train)</code>?',
            options: [
              { id: 'a', text: 'Gần như không học gì — nó chỉ LƯU LẠI dữ liệu train để dùng khi predict', correct: true, explanation: 'Đúng — đây là bản chất "lazy learning" của KNN, khác hẳn LogisticRegression (học ra w, b cố định).' },
              { id: 'b', text: 'Học ra một phương trình tuyến tính giống LogisticRegression', correct: false, explanation: 'KNN không tạo ra phương trình cố định nào — nó không có "tham số học được" theo nghĩa đó.' },
              { id: 'c', text: 'Tính trước khoảng cách giữa mọi cặp điểm và lưu vào bộ nhớ', correct: false, explanation: 'Việc tính khoảng cách xảy ra LÚC PREDICT, không phải lúc fit — fit chỉ đơn giản lưu dữ liệu.' },
              { id: 'd', text: 'Xoá bỏ các điểm outlier trong dữ liệu train', correct: false, explanation: 'KNN không tự động xử lý outlier khi fit — nó giữ nguyên toàn bộ dữ liệu train.' },
            ],
          },
          {
            question: 'Cách chọn k hợp lý nhất trong thực tế là gì?',
            options: [
              { id: 'a', text: 'Sweep nhiều giá trị k, đo validation accuracy cho từng k, chọn k có kết quả tốt nhất', correct: true, explanation: 'Chính xác — giống mọi hyperparameter khác, k nên được chọn bằng bằng chứng validation.' },
              { id: 'b', text: 'Luôn dùng k=5 vì đó là giá trị mặc định phổ biến nhất', correct: false, explanation: 'Giá trị mặc định chỉ là điểm khởi đầu — KHÔNG đảm bảo tối ưu cho MỌI dataset.' },
              { id: 'c', text: 'k càng lớn càng chính xác, nên luôn chọn k lớn nhất có thể', correct: false, explanation: 'k quá lớn có thể làm ranh giới quá mượt, mất chi tiết cục bộ quan trọng (có thể underfit).' },
              { id: 'd', text: 'k phải luôn là số chẵn để dễ tính toán', correct: false, explanation: 'Thực ra k LẺ thường được ưu tiên (tránh hoà phiếu trong bài toán 2 lớp) — nhưng đây không phải lý do chính để chọn k, và không bắt buộc.' },
            ],
          },
        ],
        mini_game: {
          title: 'k nhỏ hay k lớn? Ghép đúng đặc điểm',
          instruction: 'Kéo mỗi đặc điểm vào đúng nhóm.',
          chips: [
            { id: 'chip-noisy', label: 'Nhạy với nhiễu, dễ bị đánh lừa bởi 1-2 điểm lạ' },
            { id: 'chip-smooth', label: 'Ranh giới quyết định mượt hơn' },
            { id: 'chip-oversmooth', label: 'Có thể làm mất chi tiết cục bộ quan trọng nếu quá lớn' },
            { id: 'chip-localdetail', label: 'Bắt được chi tiết cục bộ tốt nếu dữ liệu sạch' },
          ],
          bins: [
            { id: 'ksmall', label: 'k nhỏ', correct: 'true' },
            { id: 'klarge', label: 'k lớn', correct: 'true' },
          ],
          solution: { 'chip-noisy': 'ksmall', 'chip-localdetail': 'ksmall', 'chip-smooth': 'klarge', 'chip-oversmooth': 'klarge' },
          success_html: '✅ k nhỏ: nhạy nhiễu nhưng bắt chi tiết tốt. k lớn: mượt hơn nhưng có thể oversmooth.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Sweep k = [1, 5, 15, 50], in val_accuracy cho từng k.',
        blocks: [
          { type: 'py', token: 'from sklearn.neighbors import KNeighborsClassifier', slot: 'z1a' },
          { type: 'py', token: 'from ml_lab import load_knn_data', slot: 'z1b' },
          { type: 'py', token: 'X_train, X_val, y_train, y_val =', slot: 'z2a' },
          { type: 'py', token: 'load_knn_data()', slot: 'z2b' },
          { type: 'py', token: 'for k in [1, 5, 15, 50]:', slot: 'z3a' },
          { type: 'py', token: 'model = KNeighborsClassifier(n_neighbors=k).fit(X_train, y_train)', slot: 'z3b' },
          { type: 'py', token: 'val_accuracy =', slot: 'z4a' },
          { type: 'py', token: 'model.score(X_val, y_val)', slot: 'z4b' },
        ],
        drop_zones: [
          { id: 'l11-import', accepts: ['py'], multi: true },
          { id: 'l11-load', accepts: ['py'], multi: true },
          { id: 'l11-sweep', accepts: ['py'], multi: true },
          { id: 'l11-eval', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'l11-import': 'from sklearn.neighbors import KNeighborsClassifier from ml_lab import load_knn_data',
          'l11-load': 'X_train, X_val, y_train, y_val = load_knn_data()',
          'l11-sweep': 'for k in [1, 5, 15, 50]: model = KNeighborsClassifier(n_neighbors=k).fit(X_train, y_train)',
          'l11-eval': 'val_accuracy = model.score(X_val, y_val)',
        },
        reveal_hints: {
          'l11-import': 'Import <strong>KNeighborsClassifier</strong> và <strong>load_knn_data</strong>.',
          'l11-load': 'Nạp 4 mảng: <strong>X_train, X_val, y_train, y_val</strong>.',
          'l11-sweep': 'Sweep k: <strong>for k in [1, 5, 15, 50]:</strong>.',
          'l11-eval': 'Đo accuracy trên validation cho mỗi k.',
        },
        expected_sql: 'from sklearn.neighbors import KNeighborsClassifier from ml_lab import load_knn_data X_train, X_val, y_train, y_val = load_knn_data() for k in [1, 5, 15, 50]: model = KNeighborsClassifier(n_neighbors=k).fit(X_train, y_train) val_accuracy = model.score(X_val, y_val)',
      },
      drag_map: {
        brand: 'DÒNG CHẢY APPLIED ML LAB',
        table_sub: 'Sweep k · val accuracy',
        idle_sub: 'Bấm ▶ để sweep k',
        run_label: '▶ Sweep k',
        table: {
          name: 'knn_k_sweep',
          columns: ['k', 'val_accuracy'],
          dataRows: [
            ['1', '0.800'],
            ['5', '0.833'],
            ['15', '0.822'],
            ['50', '0.811'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Sweep k = [1, 5, 15, 50]. In <code>val_accuracy</code> cho MỖI k — không hard-code 1 k duy nhất.</p>',
        context: {
          scenario: 'StudyLab muốn dùng KNN để phân loại học viên theo hành vi tương tự — nhưng chưa biết nên "nhìn" bao nhiêu hàng xóm gần nhất mới hợp lý.',
          real_world: 'Giống việc hỏi ý kiến bạn bè trước khi quyết định — hỏi 1 người (k=1) dễ bị lệch theo ý kiến cá nhân đó; hỏi 50 người (k=50) có thể pha loãng mất những góc nhìn thật sự liên quan đến tình huống của bạn. Số người hỏi "vừa đủ" phải thử mới biết.',
          steps: [
            'Load 4 mảng: <code>load_knn_data()</code>.',
            'Vòng lặp <code>for k in [1, 5, 15, 50]:</code>.',
            'Với mỗi k: fit <code>KNeighborsClassifier(n_neighbors=k)</code> trên train.',
            'In <code>k</code> và <code>val_accuracy</code> (từ <code>model.score(X_val, y_val)</code>) cho mỗi k.',
          ],
          hint_explore: 'Muốn xem shape dữ liệu? Gõ <code>print(X_train.shape)</code> rồi Run.',
          expected: 'Console in 4 dòng (k, val_accuracy) — các giá trị val_accuracy khác nhau tuỳ k, thường đạt đỉnh ở k vừa phải (không phải k=1 hay k lớn nhất).',
        },
        hints: [
          { level: 1, text: 'Dùng <code>from sklearn.neighbors import KNeighborsClassifier</code>.' },
          { level: 2, text: 'Loop: <code>for k in [1, 5, 15, 50]:</code> — fit model MỚI cho mỗi k.' },
          { level: 3, text: '<code>model.score(X_val, y_val)</code> tự động tính accuracy trên validation.' },
        ],
        grader_fn: 'grade_lesson_c2_11',
        success_message: 'Bạn đã sweep k đúng cách — chọn k bằng bằng chứng validation, không đoán mù.',
        xp_reward: 60,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.neighbors import KNeighborsClassifier',
      },
    },

    {
      id: 'c2_l12',
      index: 12,
      title: 'KNN và Feature Scaling',
      subtitle: 'Khoảng cách bị 1 feature thang đo lớn áp đảo hoàn toàn',
      module: 4,
      module_title: 'M4 · Instance & Tree-Based Models',
      estimated_minutes: 22,
      xp_reward: 60,
      achievement: { name: 'Instance Learner', desc: 'Chứng minh scaling ảnh hưởng trực tiếp đến khoảng cách KNN dùng.' },
      story: {
        tag: '📊 StudyLab · Applied ML Lab',
        hook: 'KNN dựa HOÀN TOÀN vào khoảng cách Euclidean. Nếu 1 feature có thang đo hàng chục nghìn (family_income) và 1 feature khác chỉ 0-10 (study_hours) — dù study_hours mới là tín hiệu THẬT SỰ quan trọng — khoảng cách sẽ gần như CHỈ do income quyết định. KNN "mù" trước study_hours dù nó đáng giá hơn nhiều. Đây là lý do Bài 2 (Feature Scaling) không chỉ áp dụng cho gradient descent — nó áp dụng cho MỌI thuật toán dựa trên khoảng cách.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Giải thích vì sao KNN đặc biệt nhạy cảm với thang đo feature (do dựa trên khoảng cách).',
            'So sánh trực tiếp val_accuracy của KNN không scale vs có scale.',
            'Kết nối lại bài học Feature Scaling (Bài 2) — áp dụng cho cả thuật toán dựa trên khoảng cách, không chỉ gradient descent.',
          ],
        },
        glossary: [
          { term: 'Euclidean distance', vi: 'Khoảng cách Euclid', def: 'Khoảng cách "đường chim bay" giữa 2 điểm trong không gian nhiều chiều — nền tảng của KNN. Cột có thang đo lớn sẽ đóng góp lớn hơn vào khoảng cách này, BẤT KỂ mức độ quan trọng thật.' },
          { term: 'Distance-based algorithm', vi: 'Thuật toán dựa trên khoảng cách', def: 'Nhóm thuật toán (KNN, K-means, SVM với kernel RBF...) mà kết quả phụ thuộc TRỰC TIẾP vào cách tính khoảng cách giữa các điểm — luôn cần scale trước khi dùng.' },
          { term: 'Feature dominance', vi: 'Sự áp đảo của feature', def: 'Hiện tượng 1 feature (do thang đo lớn) chi phối gần như toàn bộ giá trị khoảng cách, khiến các feature khác gần như bị "bỏ qua" dù chúng thực sự quan trọng.' },
        ],
        primer: {
          goal: ['Fit KNN trên dữ liệu CHƯA scale, đo val_accuracy.', 'Scale rồi fit lại, so sánh trực tiếp.'],
          intro: '<p>Trong dữ liệu bài này, <code>study_hours</code> mới là tín hiệu THẬT SỰ mạnh cho nhãn, còn <code>family_income</code> chỉ đóng góp rất nhẹ. Nhưng vì income có thang đo hàng chục nghìn, khoảng cách Euclidean KHÔNG SCALE sẽ gần như chỉ phản ánh income — khiến KNN "nhìn nhầm" vào feature ít quan trọng hơn. Đây là ví dụ cực đoan cho thấy vì sao scaling không phải bước "tuỳ chọn".</p>',
          example: '',
        },
        concept_cards: [
          { icon: 'fa-ruler-combined', title: 'Chưa scale', body: 'family_income (hàng chục nghìn) áp đảo khoảng cách — KNN gần như đoán ngẫu nhiên (~0.46 accuracy, tệ hơn chance!).' },
          { icon: 'fa-scale-balanced', title: 'Đã scale', body: 'Cả 2 feature cùng "trọng lượng" trong khoảng cách — study_hours (tín hiệu thật) được nhìn thấy đúng mức.' },
          { icon: 'fa-arrow-up-right-dots', title: 'Accuracy tăng rõ rệt', body: 'Scaling không chỉ "tốt hơn một chút" — nó có thể là khác biệt giữa VÔ DỤNG và HỮU ÍCH.' },
        ],
        visual: {
          schema: {
            table_name: 'knn_scaling_report',
            columns: [
              { name: 'version', type: 'VARCHAR', key: 'PK' },
              { name: 'val_accuracy', type: 'VARCHAR', key: '' },
            ],
          },
          data_preview: [
            ['unscaled', '~0.46 (tệ hơn đoán ngẫu nhiên!)'],
            ['scaled', '~0.71'],
          ],
        },
      },
      step_2: {
        mcq: [
          {
            question: 'Vì sao KNN đặc biệt NHẠY CẢM với việc feature có được scale hay không (nhạy hơn cả một số thuật toán khác)?',
            options: [
              { id: 'a', text: 'Vì KNN dự đoán dựa TRỰC TIẾP trên khoảng cách Euclidean — feature thang đo lớn sẽ chi phối khoảng cách đó gần như hoàn toàn', correct: true, explanation: 'Đúng — đây là lý do cốt lõi khiến scaling gần như BẮT BUỘC với KNN.' },
              { id: 'b', text: 'Vì KNeighborsClassifier trong sklearn có lỗi khi nhận dữ liệu chưa scale', correct: false, explanation: 'Không có lỗi kỹ thuật — sklearn vẫn chạy bình thường trên dữ liệu chưa scale, chỉ là KẾT QUẢ sẽ tệ do bản chất thuật toán.' },
              { id: 'c', text: 'Vì KNN chỉ hỗ trợ tối đa 2 feature', correct: false, explanation: 'KNN hỗ trợ bất kỳ số lượng feature nào — vấn đề là THANG ĐO tương đối giữa các feature, không phải số lượng.' },
              { id: 'd', text: 'Vì KNN luôn yêu cầu dữ liệu nguyên (int), không nhận số thực', correct: false, explanation: 'KNN hoàn toàn xử lý được số thực (float) — đây không phải vấn đề kiểu dữ liệu.' },
            ],
          },
          {
            question: 'Trong dữ liệu bài này, study_hours là tín hiệu MẠNH cho nhãn nhưng thang đo nhỏ (0.5-10), còn family_income là tín hiệu YẾU nhưng thang đo lớn (15,000-90,000). Điều gì xảy ra nếu KHÔNG scale?',
            options: [
              { id: 'a', text: 'KNN gần như chỉ "nhìn" vào income (thang đo lớn) dù income ít quan trọng hơn — accuracy có thể TỆ HƠN đoán ngẫu nhiên', correct: true, explanation: 'Chính xác — đây chính là hiện tượng feature dominance được minh hoạ cực đoan trong bài này.' },
              { id: 'b', text: 'KNN tự động phát hiện study_hours quan trọng hơn và ưu tiên nó', correct: false, explanation: 'KNN KHÔNG có cơ chế tự động "ưu tiên" feature quan trọng — nó tính khoảng cách thô, không biết feature nào "nên" quan trọng hơn.' },
              { id: 'c', text: 'Không ảnh hưởng gì, vì KNN chỉ quan tâm thứ tự các điểm, không quan tâm giá trị thô', correct: false, explanation: 'KNN quan tâm TRỰC TIẾP đến giá trị thô khi tính khoảng cách Euclidean — thang đo ảnh hưởng rất lớn.' },
              { id: 'd', text: 'family_income sẽ tự động bị loại bỏ khỏi tính toán', correct: false, explanation: 'Không có cơ chế tự động loại bỏ feature nào — cả 2 feature đều được dùng, chỉ là income CHI PHỐI khoảng cách quá mức.' },
            ],
          },
        ],
        mini_game: {
          title: 'Statement nào ĐÚNG về KNN và scaling?',
          instruction: 'Xếp mỗi statement vào đúng nhóm.',
          chips: [
            { id: 'chip-dominate', label: 'Feature thang đo lớn áp đảo khoảng cách nếu không scale' },
            { id: 'chip-mustscale', label: 'Nên LUÔN scale trước khi dùng KNN với nhiều feature khác thang đo' },
            { id: 'chip-noeffect', label: 'Thang đo feature không ảnh hưởng gì đến kết quả KNN' },
            { id: 'chip-autohandle', label: 'KNN tự động xử lý sự khác biệt thang đo, không cần scale' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-dominate': 'dung', 'chip-mustscale': 'dung', 'chip-noeffect': 'sai', 'chip-autohandle': 'sai' },
          success_html: '✅ KNN không tự động xử lý thang đo — scaling là bước BẮT BUỘC khi dùng khoảng cách Euclidean với nhiều feature.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Fit KNN unscaled vs scaled — so sánh val_accuracy.',
        blocks: [
          { type: 'py', token: 'from sklearn.neighbors import KNeighborsClassifier', slot: 'z1a' },
          { type: 'py', token: 'from ml_lab import load_knn_scaling_data', slot: 'z1b' },
          { type: 'py', token: 'X_train, X_val, y_train, y_val =', slot: 'z2a' },
          { type: 'py', token: 'load_knn_scaling_data()', slot: 'z2b' },
          { type: 'py', token: 'model_raw =', slot: 'z3a' },
          { type: 'py', token: 'KNeighborsClassifier(n_neighbors=5).fit(X_train, y_train)', slot: 'z3b' },
          { type: 'py', token: 'mu, sd =', slot: 'z4a' },
          { type: 'py', token: 'X_train.mean(axis=0), X_train.std(axis=0)', slot: 'z4b' },
        ],
        drop_zones: [
          { id: 'l12-import', accepts: ['py'], multi: true },
          { id: 'l12-load', accepts: ['py'], multi: true },
          { id: 'l12-raw', accepts: ['py'], multi: true },
          { id: 'l12-scale', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'l12-import': 'from sklearn.neighbors import KNeighborsClassifier from ml_lab import load_knn_scaling_data',
          'l12-load': 'X_train, X_val, y_train, y_val = load_knn_scaling_data()',
          'l12-raw': 'model_raw = KNeighborsClassifier(n_neighbors=5).fit(X_train, y_train)',
          'l12-scale': 'mu, sd = X_train.mean(axis=0), X_train.std(axis=0)',
        },
        reveal_hints: {
          'l12-import': 'Import <strong>KNeighborsClassifier</strong> và <strong>load_knn_scaling_data</strong>.',
          'l12-load': 'Nạp 4 mảng UNSCALED: <strong>X_train, X_val, y_train, y_val</strong>.',
          'l12-raw': 'Fit trên dữ liệu THÔ trước — đây sẽ là baseline kém.',
          'l12-scale': 'Tính mean/std TRÊN TRAIN để scale cả train và val.',
        },
        expected_sql: 'from sklearn.neighbors import KNeighborsClassifier from ml_lab import load_knn_scaling_data X_train, X_val, y_train, y_val = load_knn_scaling_data() model_raw = KNeighborsClassifier(n_neighbors=5).fit(X_train, y_train) mu, sd = X_train.mean(axis=0), X_train.std(axis=0)',
      },
      drag_map: {
        brand: 'DÒNG CHẢY APPLIED ML LAB',
        table_sub: 'KNN unscaled vs scaled',
        idle_sub: 'Bấm ▶ để so sánh',
        run_label: '▶ So sánh scaling',
        table: {
          name: 'knn_scaling_report',
          columns: ['version', 'val_accuracy'],
          dataRows: [
            ['unscaled', '~0.46 (tệ hơn đoán ngẫu nhiên!)'],
            ['scaled', '~0.71'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Fit KNN unscaled và scaled (StandardScaler hoặc tự tính mean/std). In <code>unscaled_acc</code> và <code>scaled_acc</code> — scaled phải CAO HƠN RÕ RỆT.</p>',
        context: {
          scenario: 'StudyLab dùng KNN để tìm học viên "tương tự nhau" dựa trên study_hours và family_income — nhưng chưa scale, kết quả gần như vô nghĩa.',
          real_world: 'Giống việc so sánh "khoảng cách" giữa 2 người bằng cả chiều cao (tính bằng mét, 1.6-1.9) và tài sản (tính bằng đồng, hàng trăm triệu) CỘNG TRỰC TIẾP lại — con số tài sản sẽ áp đảo hoàn toàn, dù chiều cao có thể mới là yếu tố bạn thực sự quan tâm.',
          steps: [
            'Load 4 mảng UNSCALED: <code>load_knn_scaling_data()</code>.',
            'Fit <code>KNeighborsClassifier(n_neighbors=5)</code> trên <code>X_train</code> THÔ, đo <code>unscaled_acc</code> trên X_val thô.',
            'Scale bằng <code>StandardScaler().fit(X_train)</code> (fit CHỈ trên train), transform cả X_train và X_val.',
            'Fit lại KNN trên dữ liệu đã scale, đo <code>scaled_acc</code>. In cả 2.',
          ],
          hint_explore: 'Muốn xem thang đo 2 cột? Gõ <code>print(X_train.min(axis=0), X_train.max(axis=0))</code> rồi Run.',
          expected: 'unscaled_acc rất thấp (có thể gần hoặc dưới 0.5 — tệ hơn đoán ngẫu nhiên); scaled_acc cao hơn RÕ RỆT (thường ~0.65-0.75).',
        },
        hints: [
          { level: 1, text: 'Fit KNN LẦN 1 trên dữ liệu thô để lấy <code>unscaled_acc</code>.' },
          { level: 2, text: 'Scale: <code>scaler = StandardScaler().fit(X_train)</code>, rồi <code>scaler.transform(X_train)</code> và <code>scaler.transform(X_val)</code> — CHỈ fit trên train.' },
          { level: 3, text: 'Fit KNN LẦN 2 trên dữ liệu đã scale để lấy <code>scaled_acc</code> — so sánh 2 giá trị.' },
        ],
        grader_fn: 'grade_lesson_c2_12',
        success_message: 'Bạn đã chứng minh: scaling có thể là khác biệt giữa một KNN vô dụng và một KNN thực sự hữu ích.',
        xp_reward: 60,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.neighbors import KNeighborsClassifier',
      },
    },

    {
      id: 'c2_l13',
      index: 13,
      title: 'Decision Tree',
      subtitle: 'Không giới hạn depth = học thuộc lòng train',
      module: 4,
      module_title: 'M4 · Instance & Tree-Based Models',
      estimated_minutes: 24,
      xp_reward: 70,
      achievement: { name: 'Tree & Forest Builder', desc: 'Chứng minh overfit của Decision Tree không giới hạn depth.' },
      story: {
        tag: '📊 StudyLab · Applied ML Lab',
        hook: 'Decision Tree không giới hạn độ sâu có thể tách dữ liệu train ĐẾN TỪNG ĐIỂM MỘT — train accuracy gần như luôn đạt 100%. Nghe có vẻ tuyệt vời, nhưng đó chính là overfit trong hình hài khác: cây đã "học thuộc" từng trường hợp cụ thể thay vì tìm ra quy luật chung. Giới hạn max_depth ép cây phải "khái quát hoá" thay vì ghi nhớ.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Fit DecisionTreeClassifier không giới hạn depth và có giới hạn max_depth.',
            'Đo gap (train_acc - val_acc) để định lượng mức độ overfit.',
            'Đọc feature_importances_ để biết cây "coi trọng" feature nào nhất.',
          ],
        },
        glossary: [
          { term: 'Decision Tree', vi: 'Cây quyết định', def: 'Model phân loại bằng chuỗi câu hỏi if/else lồng nhau trên các feature — mỗi "lá" của cây là 1 dự đoán cuối cùng.' },
          { term: 'max_depth', vi: 'Độ sâu tối đa', def: 'Giới hạn số câu hỏi liên tiếp cây được phép hỏi trước khi phải dự đoán — max_depth nhỏ ép cây đơn giản hơn, tránh overfit.' },
          { term: 'Train-val gap', vi: 'Khoảng cách train-validation', def: 'Hiệu số giữa accuracy trên train và trên validation — gap LỚN là dấu hiệu overfit rõ ràng (model học thuộc train, không tổng quát hoá).' },
        ],
        primer: {
          goal: ['Fit Decision Tree KHÔNG giới hạn depth và CÓ giới hạn max_depth.', 'So sánh gap train-val giữa 2 cấu hình.'],
          intro: '<p>Một Decision Tree không giới hạn độ sâu có thể tiếp tục chia nhỏ dữ liệu cho đến khi MỖI LÁ chỉ chứa 1 điểm duy nhất — điều này đảm bảo train accuracy gần 100%, nhưng những phân chia cuối cùng đó thường chỉ phản ánh NHIỄU, không phải quy luật thật. Giới hạn max_depth buộc cây phải dừng sớm hơn, chấp nhận một vài lỗi trên train để đổi lấy khả năng tổng quát hoá tốt hơn.</p>',
          example: '',
        },
        concept_cards: [
          { icon: 'fa-tree', title: 'Không giới hạn depth', body: 'Train accuracy gần 100% — nhưng val accuracy thấp hơn RÕ RỆT (gap lớn = overfit).' },
          { icon: 'fa-scissors', title: 'max_depth giới hạn', body: 'Train accuracy thấp hơn một chút, nhưng val accuracy ỔN ĐỊNH hơn — gap nhỏ hơn.' },
          { icon: 'fa-list-ol', title: 'feature_importances_', body: 'Cho biết feature nào cây dùng nhiều nhất để phân chia — hữu ích để hiểu "cây đang nghĩ gì".' },
        ],
        visual: {
          schema: {
            table_name: 'tree_overfit_report',
            columns: [
              { name: 'tree', type: 'VARCHAR', key: 'PK' },
              { name: 'train_acc', type: 'VARCHAR', key: '' },
              { name: 'val_acc', type: 'VARCHAR', key: '' },
              { name: 'gap', type: 'VARCHAR', key: '' },
            ],
          },
          data_preview: [
            ['full (không giới hạn)', '~1.00', '~0.78', '~0.22'],
            ['max_depth=4', '~0.86', '~0.83', '~0.03'],
          ],
        },
      },
      step_2: {
        mcq: [
          {
            question: 'Vì sao Decision Tree KHÔNG giới hạn max_depth thường dẫn đến overfit?',
            options: [
              { id: 'a', text: 'Vì cây có thể tiếp tục chia nhỏ đến khi mỗi lá gần như chỉ chứa vài điểm — những phân chia cuối cùng đó thường chỉ phản ánh nhiễu, không phải quy luật chung', correct: true, explanation: 'Đúng — đây là cơ chế overfit đặc trưng của Decision Tree không giới hạn.' },
              { id: 'b', text: 'Vì DecisionTreeClassifier trong sklearn có lỗi khi depth quá lớn', correct: false, explanation: 'Không có lỗi kỹ thuật — đây là hành vi TOÁN HỌC dự kiến của cây không giới hạn, không phải bug.' },
              { id: 'c', text: 'Vì cây không giới hạn luôn chạy chậm hơn 100 lần', correct: false, explanation: 'Tốc độ không phải vấn đề chính ở đây — vấn đề là KHẢ NĂNG TỔNG QUÁT HOÁ của model.' },
              { id: 'd', text: 'Vì cây không giới hạn không hỗ trợ tính feature_importances_', correct: false, explanation: 'feature_importances_ vẫn tính được với bất kỳ độ sâu nào — không liên quan đến việc có giới hạn depth hay không.' },
            ],
          },
          {
            question: 'Gap lớn giữa train_acc (gần 100%) và val_acc (thấp hơn nhiều) là dấu hiệu của điều gì?',
            options: [
              { id: 'a', text: 'Overfit — model đã "học thuộc" các đặc điểm riêng của tập train, không tổng quát hoá được', correct: true, explanation: 'Chính xác — gap lớn là chỉ báo overfit kinh điển, giống bài học Bias-Variance trước đó.' },
              { id: 'b', text: 'Underfit — model quá đơn giản', correct: false, explanation: 'Ngược lại — train_acc CAO cho thấy model đủ phức tạp để fit train, vấn đề là nó fit QUÁ SÁT (overfit), không phải quá đơn giản.' },
              { id: 'c', text: 'Dữ liệu validation chắc chắn bị lỗi', correct: false, explanation: 'Không có bằng chứng dữ liệu lỗi — gap lớn là hành vi BÌNH THƯỜNG của một cây overfit.' },
              { id: 'd', text: 'Cần tăng thêm depth để cải thiện', correct: false, explanation: 'Tăng thêm depth sẽ làm overfit TỆ HƠN, không phải tốt hơn — cần GIẢM độ phức tạp (giới hạn max_depth), không phải tăng.' },
            ],
          },
        ],
        mini_game: {
          title: 'Cây không giới hạn hay cây max_depth? Ghép đúng đặc điểm',
          instruction: 'Kéo mỗi đặc điểm vào đúng nhóm.',
          chips: [
            { id: 'chip-hightrainacc', label: 'Train accuracy gần 100%' },
            { id: 'chip-biggap', label: 'Gap train-val lớn (overfit rõ)' },
            { id: 'chip-stableval', label: 'Val accuracy ổn định hơn' },
            { id: 'chip-smallgap', label: 'Gap train-val nhỏ hơn' },
          ],
          bins: [
            { id: 'unlimited', label: 'Không giới hạn depth', correct: 'true' },
            { id: 'limited', label: 'max_depth giới hạn', correct: 'true' },
          ],
          solution: { 'chip-hightrainacc': 'unlimited', 'chip-biggap': 'unlimited', 'chip-stableval': 'limited', 'chip-smallgap': 'limited' },
          success_html: '✅ Không giới hạn: train acc cao, gap lớn (overfit). max_depth: gap nhỏ hơn, val ổn định hơn.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Fit Decision Tree không giới hạn vs max_depth=4 — so sánh gap train-val.',
        blocks: [
          { type: 'py', token: 'from sklearn.tree import DecisionTreeClassifier', slot: 'z1a' },
          { type: 'py', token: 'from ml_lab import load_tree_data', slot: 'z1b' },
          { type: 'py', token: 'X_train, X_val, y_train, y_val, names =', slot: 'z2a' },
          { type: 'py', token: 'load_tree_data()', slot: 'z2b' },
          { type: 'py', token: 'full_tree =', slot: 'z3a' },
          { type: 'py', token: 'DecisionTreeClassifier(random_state=0).fit(X_train, y_train)', slot: 'z3b' },
          { type: 'py', token: 'limited_tree =', slot: 'z4a' },
          { type: 'py', token: 'DecisionTreeClassifier(max_depth=4, random_state=0).fit(X_train, y_train)', slot: 'z4b' },
        ],
        drop_zones: [
          { id: 'l13-import', accepts: ['py'], multi: true },
          { id: 'l13-load', accepts: ['py'], multi: true },
          { id: 'l13-full', accepts: ['py'], multi: true },
          { id: 'l13-limited', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'l13-import': 'from sklearn.tree import DecisionTreeClassifier from ml_lab import load_tree_data',
          'l13-load': 'X_train, X_val, y_train, y_val, names = load_tree_data()',
          'l13-full': 'full_tree = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)',
          'l13-limited': 'limited_tree = DecisionTreeClassifier(max_depth=4, random_state=0).fit(X_train, y_train)',
        },
        reveal_hints: {
          'l13-import': 'Import <strong>DecisionTreeClassifier</strong> và <strong>load_tree_data</strong>.',
          'l13-load': 'Nạp 5 giá trị (bao gồm <strong>names</strong> — tên 5 feature).',
          'l13-full': 'Cây KHÔNG giới hạn: <strong>DecisionTreeClassifier(random_state=0)</strong>.',
          'l13-limited': 'Cây giới hạn: <strong>max_depth=4</strong>.',
        },
        expected_sql: 'from sklearn.tree import DecisionTreeClassifier from ml_lab import load_tree_data X_train, X_val, y_train, y_val, names = load_tree_data() full_tree = DecisionTreeClassifier(random_state=0).fit(X_train, y_train) limited_tree = DecisionTreeClassifier(max_depth=4, random_state=0).fit(X_train, y_train)',
      },
      drag_map: {
        brand: 'DÒNG CHẢY APPLIED ML LAB',
        table_sub: 'Gap train-val · full vs max_depth=4',
        idle_sub: 'Bấm ▶ để so sánh',
        run_label: '▶ So sánh 2 cây',
        table: {
          name: 'tree_overfit_report',
          columns: ['tree', 'train_acc', 'val_acc', 'gap'],
          dataRows: [
            ['full (không giới hạn)', '~1.00', '~0.78', '~0.22'],
            ['max_depth=4', '~0.86', '~0.83', '~0.03'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Fit Decision Tree không giới hạn vs max_depth=4. In <code>full_train_acc</code>, <code>full_val_acc</code>, <code>limited_train_acc</code>, <code>limited_val_acc</code>.</p>',
        context: {
          scenario: 'StudyLab muốn dùng Decision Tree để phân loại học viên — nhưng cây mặc định (không giới hạn) có thể đang "học thuộc" thay vì học quy luật.',
          real_world: 'Giống việc học sinh học thuộc lòng CHÍNH XÁC 20 câu hỏi trong đề luyện tập (bao gồm cả lỗi đánh máy đề bài) thay vì hiểu bản chất môn học — điểm đề luyện gần như tuyệt đối, nhưng gặp đề thi thật (câu hỏi mới) thì bối rối.',
          steps: [
            'Load 5 giá trị: <code>load_tree_data()</code> — bao gồm tên 5 feature.',
            'Fit <code>full_tree = DecisionTreeClassifier(random_state=0)</code> — KHÔNG giới hạn depth.',
            'Fit <code>limited_tree = DecisionTreeClassifier(max_depth=4, random_state=0)</code>.',
            'In <code>full_train_acc</code>, <code>full_val_acc</code>, <code>limited_train_acc</code>, <code>limited_val_acc</code> (dùng <code>.score()</code>).',
          ],
          hint_explore: 'Muốn xem feature quan trọng nhất? Gõ <code>print(names[full_tree.feature_importances_.argmax()])</code> rồi Run.',
          expected: 'full_train_acc rất cao (gần 1.0) nhưng full_val_acc thấp hơn hẳn (gap lớn); limited_train_acc thấp hơn full nhưng limited_val_acc GẦN limited_train_acc (gap nhỏ).',
        },
        hints: [
          { level: 1, text: 'Dùng <code>from sklearn.tree import DecisionTreeClassifier</code>.' },
          { level: 2, text: '<code>.score(X, y)</code> tính accuracy trực tiếp — gọi cho cả X_train và X_val, cả 2 cây.' },
          { level: 3, text: 'In đủ 4 giá trị với TÊN CHÍNH XÁC: full_train_acc, full_val_acc, limited_train_acc, limited_val_acc.' },
        ],
        grader_fn: 'grade_lesson_c2_13',
        success_message: 'Bạn đã chứng minh: Decision Tree không giới hạn depth overfit rõ rệt — max_depth giúp gap train-val thu hẹp.',
        xp_reward: 70,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.tree import DecisionTreeClassifier',
      },
    },

    {
      id: 'c2_l14',
      index: 14,
      title: 'Random Forest',
      subtitle: 'Nhiều cây "yếu" gộp lại thành một model ổn định',
      module: 4,
      module_title: 'M4 · Instance & Tree-Based Models',
      estimated_minutes: 25,
      xp_reward: 80,
      achievement: { name: 'Tree & Forest Builder', desc: 'So sánh Random Forest với 1 Decision Tree đơn — hiểu sức mạnh ensemble.' },
      story: {
        tag: '📊 StudyLab · Applied ML Lab',
        hook: 'Một Decision Tree đơn dễ bị overfit và nhạy với từng chi tiết nhỏ của dữ liệu train — đổi vài điểm train, cây có thể thay đổi hoàn toàn hình dạng. Random Forest giải quyết vấn đề này bằng một ý tưởng đơn giản mà mạnh mẽ: train HÀNG TRĂM cây, mỗi cây nhìn một PHẦN NGẪU NHIÊN của dữ liệu và feature, rồi lấy đa số phiếu. Không cây nào "hoàn hảo" một mình — nhưng đám đông đó ổn định hơn nhiều so với 1 cây đơn.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Fit RandomForestClassifier và hiểu cơ chế bootstrap + feature subsampling.',
            'So sánh trực tiếp val_accuracy giữa 1 Decision Tree đơn và Random Forest.',
            'Giải thích vì sao ensemble (nhiều model yếu gộp lại) thường ỔN ĐỊNH hơn 1 model mạnh đơn lẻ.',
          ],
        },
        glossary: [
          { term: 'Random Forest', vi: 'Rừng ngẫu nhiên', def: 'Ensemble của nhiều Decision Tree, mỗi cây được train trên một mẫu bootstrap (lấy ngẫu nhiên có hoàn lại) của dữ liệu và một tập con ngẫu nhiên của feature — dự đoán cuối = đa số phiếu của tất cả cây.' },
          { term: 'Bootstrap sampling', vi: 'Lấy mẫu bootstrap', def: 'Lấy ngẫu nhiên CÓ HOÀN LẠI từ dữ liệu gốc để tạo ra nhiều tập con "hơi khác nhau" — mỗi cây trong rừng thấy 1 tập con khác nhau.' },
          { term: 'Ensemble variance reduction', vi: 'Giảm phương sai bằng ensemble', def: 'Khi gộp nhiều model "yếu" và ĐA DẠNG lại, các lỗi cá nhân của từng model có xu hướng TRIỆT TIÊU lẫn nhau khi lấy đa số phiếu — kết quả tổng thể ổn định hơn từng model riêng lẻ.' },
        ],
        primer: {
          goal: ['Fit RandomForestClassifier và 1 DecisionTreeClassifier trên cùng dữ liệu.', 'So sánh val_accuracy — Random Forest thường ổn định/cao hơn.'],
          intro: '<p>1 Decision Tree đơn có variance cao: đổi ngẫu nhiên vài điểm train, cây có thể "quyết định" hoàn toàn khác. Random Forest giảm variance đó bằng cách train NHIỀU cây khác nhau (mỗi cây thấy 1 phần ngẫu nhiên dữ liệu + feature) rồi lấy đa số phiếu — lỗi ngẫu nhiên của từng cây riêng lẻ có xu hướng triệt tiêu lẫn nhau trong đám đông.</p>',
          example: '',
        },
        concept_cards: [
          { icon: 'fa-tree', title: '1 cây đơn', body: 'Nhạy với chi tiết dữ liệu train — variance cao, kết quả có thể không ổn định.' },
          { icon: 'fa-seedling', title: 'Nhiều cây (Random Forest)', body: 'Mỗi cây thấy 1 phần dữ liệu + feature khác nhau (bootstrap + feature subsampling).' },
          { icon: 'fa-people-group', title: 'Đa số phiếu', body: 'Dự đoán cuối = đa số phiếu của TẤT CẢ cây — lỗi cá nhân của từng cây triệt tiêu lẫn nhau.' },
        ],
        visual: {
          schema: {
            table_name: 'forest_comparison',
            columns: [
              { name: 'model', type: 'VARCHAR', key: 'PK' },
              { name: 'n_estimators', type: 'INT', key: '' },
              { name: 'val_accuracy', type: 'VARCHAR', key: '' },
            ],
          },
          data_preview: [
            ['Decision Tree', '1', '~0.72'],
            ['Random Forest', '100', '~0.79'],
          ],
        },
      },
      step_2: {
        mcq: [
          {
            question: 'Random Forest giảm variance so với 1 Decision Tree đơn bằng cơ chế nào?',
            options: [
              { id: 'a', text: 'Train nhiều cây trên các mẫu bootstrap + tập feature con khác nhau, rồi lấy đa số phiếu — lỗi ngẫu nhiên của từng cây có xu hướng triệt tiêu lẫn nhau', correct: true, explanation: 'Đúng — đây là nguyên lý "wisdom of crowds" áp dụng vào machine learning.' },
              { id: 'b', text: 'Chỉ train 1 cây nhưng với max_depth lớn hơn nhiều', correct: false, explanation: 'Random Forest train NHIỀU cây (thường hàng trăm), không phải 1 cây sâu hơn — đó là 2 cách tiếp cận hoàn toàn khác nhau.' },
              { id: 'c', text: 'Xoá bỏ hoàn toàn yếu tố ngẫu nhiên khỏi quá trình train', correct: false, explanation: 'Ngược lại — Random Forest CHỦ ĐỘNG thêm yếu tố ngẫu nhiên (bootstrap + feature subsampling) để tạo sự ĐA DẠNG giữa các cây.' },
              { id: 'd', text: 'Dùng chính xác 1 tập dữ liệu giống hệt nhau cho mọi cây', correct: false, explanation: 'Mỗi cây thấy một mẫu bootstrap KHÁC NHAU — nếu dùng cùng 1 dữ liệu, mọi cây sẽ giống hệt nhau và ensemble mất hết lợi ích.' },
            ],
          },
          {
            question: 'Vì sao Random Forest thường ỔN ĐỊNH hơn (ít thay đổi kết quả) so với 1 Decision Tree đơn khi dữ liệu train thay đổi nhẹ?',
            options: [
              { id: 'a', text: 'Vì kết quả cuối là TRUNG BÌNH/ĐA SỐ PHIẾU của nhiều cây — thay đổi nhỏ trong dữ liệu chỉ ảnh hưởng MỘT VÀI cây, không phải toàn bộ ensemble', correct: true, explanation: 'Chính xác — đây là bản chất toán học của việc giảm variance bằng ensemble averaging.' },
              { id: 'b', text: 'Vì Random Forest không dùng dữ liệu train để quyết định gì cả', correct: false, explanation: 'Random Forest hoàn toàn dựa vào dữ liệu train để xây dựng từng cây — chỉ là cách nó TỔNG HỢP nhiều cây làm giảm ảnh hưởng của từng điểm dữ liệu riêng lẻ.' },
              { id: 'c', text: 'Vì mỗi cây trong rừng luôn giống hệt nhau', correct: false, explanation: 'Ngược lại — sự ĐA DẠNG giữa các cây (nhờ bootstrap + feature subsampling) chính là điều làm ensemble hiệu quả.' },
              { id: 'd', text: 'Vì Random Forest luôn có max_depth=1', correct: false, explanation: 'Không có ràng buộc như vậy — mỗi cây trong Random Forest có thể sâu tuỳ cấu hình, sự ổn định đến từ việc GỘP NHIỀU CÂY, không phải từ độ nông của từng cây.' },
            ],
          },
        ],
        mini_game: {
          title: 'Ghép mỗi đặc điểm với đúng model',
          instruction: 'Kéo mỗi đặc điểm vào đúng nhóm.',
          chips: [
            { id: 'chip-onetree', label: 'Chỉ 1 cây — nhạy với chi tiết dữ liệu train' },
            { id: 'chip-manytrees', label: 'Nhiều cây, mỗi cây thấy 1 phần dữ liệu khác nhau' },
            { id: 'chip-vote', label: 'Dự đoán cuối = đa số phiếu của nhiều cây' },
            { id: 'chip-highvar', label: 'Variance cao — kết quả có thể thay đổi nhiều nếu đổi dữ liệu train' },
          ],
          bins: [
            { id: 'single', label: 'Decision Tree đơn', correct: 'true' },
            { id: 'forest', label: 'Random Forest', correct: 'true' },
          ],
          solution: { 'chip-onetree': 'single', 'chip-highvar': 'single', 'chip-manytrees': 'forest', 'chip-vote': 'forest' },
          success_html: '✅ 1 cây đơn: nhạy, variance cao. Random Forest: nhiều cây + đa số phiếu = ổn định hơn.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Fit 1 Decision Tree đơn và Random Forest — so sánh val_accuracy.',
        blocks: [
          { type: 'py', token: 'from sklearn.tree import DecisionTreeClassifier', slot: 'z1a' },
          { type: 'py', token: 'from sklearn.ensemble import RandomForestClassifier', slot: 'z1b' },
          { type: 'py', token: 'from ml_lab import load_forest_data', slot: 'z2a' },
          { type: 'py', token: 'X_train, X_val, y_train, y_val, names =', slot: 'z2b' },
          { type: 'py', token: 'tree =', slot: 'z3a' },
          { type: 'py', token: 'DecisionTreeClassifier(random_state=0).fit(X_train, y_train)', slot: 'z3b' },
          { type: 'py', token: 'forest =', slot: 'z4a' },
          { type: 'py', token: 'RandomForestClassifier(n_estimators=100, random_state=0).fit(X_train, y_train)', slot: 'z4b' },
        ],
        drop_zones: [
          { id: 'l14-import', accepts: ['py'], multi: true },
          { id: 'l14-load', accepts: ['py'], multi: true },
          { id: 'l14-tree', accepts: ['py'], multi: true },
          { id: 'l14-forest', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'l14-import': 'from sklearn.tree import DecisionTreeClassifier from sklearn.ensemble import RandomForestClassifier',
          'l14-load': 'from ml_lab import load_forest_data X_train, X_val, y_train, y_val, names =',
          'l14-tree': 'tree = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)',
          'l14-forest': 'forest = RandomForestClassifier(n_estimators=100, random_state=0).fit(X_train, y_train)',
        },
        reveal_hints: {
          'l14-import': 'Import CẢ <strong>DecisionTreeClassifier</strong> và <strong>RandomForestClassifier</strong>.',
          'l14-load': 'Nạp 5 giá trị từ <strong>load_forest_data</strong>.',
          'l14-tree': '1 cây đơn: <strong>DecisionTreeClassifier(random_state=0)</strong>.',
          'l14-forest': 'Rừng 100 cây: <strong>RandomForestClassifier(n_estimators=100, random_state=0)</strong>.',
        },
        expected_sql: 'from sklearn.tree import DecisionTreeClassifier from sklearn.ensemble import RandomForestClassifier from ml_lab import load_forest_data X_train, X_val, y_train, y_val, names = tree = DecisionTreeClassifier(random_state=0).fit(X_train, y_train) forest = RandomForestClassifier(n_estimators=100, random_state=0).fit(X_train, y_train)',
      },
      drag_map: {
        brand: 'DÒNG CHẢY APPLIED ML LAB',
        table_sub: '1 cây vs Random Forest (100 cây)',
        idle_sub: 'Bấm ▶ để so sánh',
        run_label: '▶ So sánh Tree vs Forest',
        table: {
          name: 'forest_comparison',
          columns: ['model', 'n_estimators', 'val_accuracy'],
          dataRows: [
            ['Decision Tree', '1', '~0.72'],
            ['Random Forest', '100', '~0.79'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Fit 1 <code>DecisionTreeClassifier</code> đơn và 1 <code>RandomForestClassifier</code>. In <code>tree_val_acc</code> và <code>forest_val_acc</code>.</p>',
        context: {
          scenario: 'StudyLab muốn model ổn định cho hệ thống phân loại chính thức — không thể để kết quả thay đổi thất thường mỗi khi có thêm vài học viên mới trong dữ liệu train.',
          real_world: 'Giống việc quyết định bằng ý kiến của 1 chuyên gia (dễ thiên vị, có thể sai lệch theo kinh nghiệm cá nhân) so với việc TỔNG HỢP ý kiến của 100 chuyên gia độc lập rồi lấy đa số — quyết định tập thể thường ổn định và đáng tin hơn.',
          steps: [
            'Load 5 giá trị: <code>load_forest_data()</code>.',
            'Fit <code>tree = DecisionTreeClassifier(random_state=0)</code> trên train.',
            'Fit <code>forest = RandomForestClassifier(n_estimators=100, random_state=0)</code> trên train.',
            'In <code>tree_val_acc</code> và <code>forest_val_acc</code> (dùng <code>.score(X_val, y_val)</code> cho cả 2).',
          ],
          hint_explore: 'Muốn xem feature quan trọng nhất theo Random Forest? Gõ <code>print(names[forest.feature_importances_.argmax()])</code> rồi Run.',
          expected: 'Console in tree_val_acc và forest_val_acc — cả 2 đều > 0.4, thường forest_val_acc bằng hoặc cao hơn tree_val_acc.',
        },
        hints: [
          { level: 1, text: 'Dùng <code>from sklearn.ensemble import RandomForestClassifier</code> (khác module với DecisionTreeClassifier).' },
          { level: 2, text: '<code>n_estimators=100</code> nghĩa là rừng có 100 cây — nhiều hơn thường ổn định hơn (nhưng chậm hơn).' },
          { level: 3, text: '<code>.score(X_val, y_val)</code> tính accuracy trực tiếp cho cả 2 model.' },
        ],
        grader_fn: 'grade_lesson_c2_14',
        success_message: 'Bạn đã hoàn thành Course 2 — so sánh được Decision Tree đơn với Random Forest, hiểu sức mạnh của ensemble.',
        xp_reward: 80,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.ensemble import RandomForestClassifier',
      },
    },
  ],
};
