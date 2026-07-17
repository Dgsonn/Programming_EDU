/* lesson_content_ml.js — Nội dung khóa Machine Learning (PE Web).
 * Course 1 — ML Foundations (USTH StudyLab). Theo đúng spec
 * ML_Curriculum_Course_1_2_3_Revised_with_Coverage_Audit.pdf.
 * Mỗi step có `type` → lesson_ml.js dispatch đúng renderer:
 *   step_1: story_rounds | table_lens
 *   step_2: sort_scenarios | role_rounds
 *   step_3: spec_builder | experiment_rounds | xy_builder
 *   step_4: Full Python IDE (chấm 4 tầng thật trong Pyodide)          */
window.LESSON_CONTENT_ML = {
  course: 'Course 1 — ML Foundations',
  total_lessons: 15,
  lessons: [

    /* ═══════════════ BÀI 1 — ML vs Traditional Programming ═══════════════ */
    {
      id: 'c1_l1', index: 1,
      course: 'Course 1 — ML Foundations', module: 'M1 — ML Problem Framing',
      title: 'Machine Learning vs Traditional Programming',
      subtitle: 'Luật viết sẵn, mẫu học được, và luồng fit/predict đầu tiên',
      xp_reward: 20, badge: 'ML Problem Framer',

      step_1: {
        type: 'story_rounds',
        topic_tag: 'Luật viết sẵn hay mẫu học được?',
        intro_html: 'StudyLab đã có luật chấm Đậu/Rớt rõ ràng theo <code>final_score &gt;= 50</code>. ' +
          'Nhưng có 1 câu hỏi KHÁC: liệu 1 học viên có <em>đang trên đà rớt môn</em> ngay từ tuần 3 — ' +
          'khi <code>final_score</code> CHƯA tồn tại? Đây là ranh giới giữa lập trình truyền thống và Machine Learning.',
        rounds: [
          {
            id: 'known-rule',
            label: 'Luồng luật viết sẵn (Traditional Programming)',
            flow: ['Input: final_score = 42', 'Luật: if final_score >= 50', 'Output: "Rớt"'],
            note: 'Con người TỰ VIẾT luật. Máy chỉ áp dụng — không có gì để "học".'
          },
          {
            id: 'learning-flow',
            label: 'Luồng học từ dữ liệu (Machine Learning)',
            flow: ['Input: 500 học viên khóa trước (có nhãn Đậu/Rớt)', 'Model TỰ TÌM mẫu từ dữ liệu', 'Học viên MỚI (tuần 3, chưa có final_score) → dự đoán'],
            note: 'Không ai viết luật "bao nhiêu giờ học thì đậu". Model tự học mẫu đó từ 500 học viên cũ.'
          }
        ],
        micro_check: {
          question: 'Bài toán "cảnh báo sớm nguy cơ rớt môn ở tuần 3" (chưa có final_score) thuộc loại nào?',
          options: [
            { text: 'Traditional Programming — chỉ cần viết luật if/else', correct: false },
            { text: 'Machine Learning — cần học mẫu từ dữ liệu lịch sử vì luật chưa tồn tại', correct: true }
          ],
          feedback_correct: 'Đúng! Không có final_score để viết luật if/else — bắt buộc phải học mẫu từ dữ liệu quá khứ.',
          feedback_wrong: 'Chưa đúng — final_score CHƯA xuất hiện ở tuần 3, nên không thể viết luật if/else. Phải học từ dữ liệu 500 học viên cũ.'
        }
      },

      step_2: {
        type: 'sort_scenarios',
        intro_html: 'Mọi bài toán Machine Learning đều mô tả được bằng 3 phần: <b>Task</b> (làm gì), <b>Experience</b> (học từ đâu), <b>Performance</b> (đo tốt/xấu bằng gì). Chọn thẻ rồi bấm vào đúng ngăn.',
        bins: [
          { key: 'task', label: 'TASK — LÀM GÌ' },
          { key: 'experience', label: 'EXPERIENCE — HỌC TỪ ĐÂU' },
          { key: 'performance', label: 'PERFORMANCE — ĐO BẰNG GÌ' }
        ],
        cards: [
          { text: 'Dự đoán học viên nào có nguy cơ rớt môn', role: 'task' },
          { text: '500 hồ sơ học viên khóa trước kèm nhãn Đậu/Rớt', role: 'experience' },
          { text: 'Tỉ lệ dự đoán đúng trên học viên mới', role: 'performance' },
          { text: 'Sĩ số lớp học', role: 'distractor' },
          { text: 'Học viên mới chưa có nhãn', role: 'distractor' },
          { text: 'Màu giao diện StudyLab', role: 'distractor' }
        ],
        wrong_feedback: 'Học viên mới KHÔNG có nhãn không phải là "kinh nghiệm huấn luyện" — Experience phải là dữ liệu ĐÃ có nhãn.',
        scenario_intro: 'Phân loại 3 tình huống StudyLab',
        scenario_options: [
          { key: 'rule', label: 'Traditional' },
          { key: 'ml', label: 'Machine Learning' }
        ],
        scenarios: [
          { text: 'StudyLab tính điểm trung bình = tổng điểm / số bài (công thức cố định)', answer: 'rule', explain: 'Công thức cố định, không học từ dữ liệu → Traditional Programming.' },
          { text: 'StudyLab gợi ý khóa học tiếp theo dựa trên hành vi học của hàng nghìn học viên trước', answer: 'ml', explain: 'Cần học mẫu hành vi từ dữ liệu lịch sử → Machine Learning.' },
          { text: 'StudyLab khóa tài khoản sau 5 lần đăng nhập sai (đếm số lần cố định)', answer: 'rule', explain: 'Luật đếm cố định, không có gì để học → Traditional Programming.' }
        ]
      },

      step_3: {
        type: 'spec_builder',
        mission: 'Dựng thí nghiệm ML đầu tiên: chọn Dataset → gán Features/Target → Train → đưa Học viên mới vào → Predict.',
        spec_fields: [
          { key: 'dataset', label: 'Dataset', value: 'study_workflow_demo_v1 (12 học viên)', locked: true },
          { key: 'features', label: 'Features (X)', value: 'study_hours, attendance, quiz_score', reveal_after: 'dataset' },
          { key: 'target', label: 'Target (y)', value: 'pass_fail', reveal_after: 'dataset' },
          { key: 'train', label: 'Train', value: 'model.fit(X, y)', reveal_after: 'features' },
          { key: 'new_input', label: 'Học viên mới (X_new)', value: 'study_hours=7, attendance=90, quiz_score=82', reveal_after: 'train' },
          { key: 'predict', label: 'Predict', value: 'model.predict(X_new) → ?', reveal_after: 'new_input' }
        ],
        code_preview_template:
          'from ml_lab import SimpleClassifier, load_study_data\n' +
          'X, y, X_new = load_study_data()\n' +
          'model = SimpleClassifier()\n' +
          'model.fit(X, y)\n' +
          'prediction = model.predict(X_new)\n' +
          'print(prediction)',
        completion_note: 'Sau khi Train, model được hỏi về 1 học viên CHƯA từng thấy — đây chính là "dự đoán trên input mới", khác hẳn việc lặp lại dữ liệu đã học.'
      },

      step_4: {
        prompt_html: 'Viết lại đúng quy trình: <code>from ml_lab import ...</code> → tạo <code>X, y, X_new</code> → <code>fit</code> → <code>predict</code> → gán kết quả vào biến <code>prediction</code>.',
        starter_code:
          'from ml_lab import SimpleClassifier, load_study_data\n\n' +
          '# 1. Nạp dữ liệu 12 học viên lịch sử + 1 học viên mới cần dự đoán\n' +
          'X, y, X_new = load_study_data()\n\n' +
          '# 2. Tạo model và huấn luyện (TODO)\n' +
          'model = SimpleClassifier()\n' +
          '# model.fit(...)\n\n' +
          '# 3. Dự đoán cho X_new và gán vào biến `prediction` (TODO)\n' +
          'prediction = None\n\n' +
          'print(prediction)',
        grader_fn: 'grade_lesson1',
        hints: [
          'Gọi model.fit(X, y) TRƯỚC khi gọi predict.',
          'predict() phải nhận X_new (học viên MỚI), không phải X (dữ liệu train).',
          'Nhớ gán kết quả predict() vào đúng biến tên `prediction`.'
        ],
        success_message: 'Bạn vừa chạy đúng luồng ML đầu tiên: dữ liệu lịch sử → fit → predict trên input CHƯA từng thấy. Đây là bộ khung của MỌI bài toán ML phía sau.'
      }
    },

    /* ═══════════════ BÀI 2 — Bài toán ML này thuộc loại nào? ═══════════════ */
    {
      id: 'c1_l2', index: 2,
      course: 'Course 1 — ML Foundations', module: 'M1 — ML Problem Framing',
      title: 'Bài toán ML này thuộc loại nào?',
      subtitle: 'Regression, Classification và Clustering trên CÙNG 1 bảng dữ liệu',
      xp_reward: 20, badge: 'ML Problem Framer',

      step_1: {
        type: 'story_rounds',
        topic_tag: 'Cùng 1 bảng — 3 câu hỏi khác nhau',
        intro_html: 'Vẫn là bảng học viên StudyLab hôm qua. Nhưng hôm nay đội vận hành hỏi <b>3 câu KHÁC nhau</b> — ' +
          'và mỗi câu biến cùng 1 bảng thành một LOẠI bài toán ML khác nhau. ' +
          'Loại bài toán không nằm ở dữ liệu — nó nằm ở <em>câu hỏi và target</em>.',
        rounds: [
          {
            id: 'q-regression',
            label: 'Câu 1 — Dự đoán final_score (số điểm)',
            flow: ['Features: study_hours, attendance, quiz_score', 'Target: final_score (SỐ liên tục)', 'Output: ước lượng 71.8 điểm'],
            note: 'Target ĐỊNH LƯỢNG → Regression. Output là con số, có thể lệch ít hay nhiều.'
          },
          {
            id: 'q-classification',
            label: 'Câu 2 — Dự đoán pass_fail (Đậu/Rớt)',
            flow: ['Features: CÙNG 3 cột đó', 'Target: pass_fail ∈ {0, 1} (TÊN LỚP)', 'Output: nhãn "Đậu" (1)'],
            note: 'Target PHÂN LOẠI → Classification. 0/1 là tên 2 lớp — dù được mã hóa bằng số.'
          },
          {
            id: 'q-clustering',
            label: 'Câu 3 — Gom nhóm hành vi học (không có target)',
            flow: ['Features: CÙNG 3 cột đó', 'KHÔNG dùng cột target nào', 'Output: Cluster 0 / 1 / 2 (k=3)'],
            note: 'Không học từ nhãn → Clustering. ID cụm là tên TÙY Ý — Cluster 2 không "tốt hơn" Cluster 0.'
          }
        ],
        micro_check: {
          question: 'Vì sao thí nghiệm gom nhóm (câu 3) KHÔNG đưa final_score / pass_fail vào?',
          options: [
            { text: 'Vì file dữ liệu không còn 2 cột đó nữa', correct: false },
            { text: 'Vì clustering tìm cấu trúc từ CHÍNH các feature — không học từ nhãn, dù file vẫn còn nguyên 2 cột đó', correct: true }
          ],
          feedback_correct: 'Chuẩn! DataFrame vẫn đủ 5 cột — clustering CHỌN không dùng target, chứ không phải dữ liệu không có target.',
          feedback_wrong: 'Chưa đúng — file vẫn còn nguyên 2 cột đó. Clustering không dùng chúng vì nó không học từ nhãn, không phải vì chúng biến mất.'
        }
      },

      step_2: {
        type: 'sort_scenarios',
        intro_html: 'Nhìn <b>OUTPUT</b> đoán loại bài toán: mỗi loại có một "hợp đồng output" riêng. Chọn thẻ rồi bấm vào đúng ngăn.',
        bins: [
          { key: 'regression', label: 'REGRESSION — SỐ LIÊN TỤC' },
          { key: 'classification', label: 'CLASSIFICATION — TÊN LỚP' },
          { key: 'clustering', label: 'CLUSTERING — ID CỤM TÙY Ý' }
        ],
        cards: [
          { text: '72.5 — ước lượng điểm cuối kỳ', role: 'regression' },
          { text: 'Nhãn: "Rớt" (0)', role: 'classification' },
          { text: '[2, 0, 1, 1, 2, …] — nhóm hành vi, ID không có thứ tự', role: 'clustering' },
          { text: 'Xác suất đậu 0.83 → chốt nhãn "Đậu"', role: 'classification' },
          { text: '2.4 — số giờ ôn tập cần thêm mỗi tuần', role: 'regression' }
        ],
        wrong_feedback: 'Nhìn HỢP ĐỒNG output: số liên tục = regression; tên lớp (kể cả mã hóa 0/1) = classification; ID cụm tùy ý = clustering.',
        scenario_intro: 'Phân loại 3 nhiệm vụ mới của StudyLab',
        scenario_options: [
          { key: 'regression', label: 'Regression' },
          { key: 'classification', label: 'Classification' },
          { key: 'clustering', label: 'Clustering' }
        ],
        scenarios: [
          { text: 'Dự đoán SỐ GIỜ học thêm mỗi tuần để học viên đạt 80 điểm (target: số giờ)', answer: 'regression', explain: 'Target là đại lượng liên tục → regression.' },
          { text: 'Dự đoán học viên có BỎ khóa học không — nhãn dropped ∈ {0,1} lấy từ lịch sử', answer: 'classification', explain: '0/1 ở đây là TÊN 2 lớp (bỏ / không bỏ). Target mã hóa bằng số vẫn là categorical.' },
          { text: 'Chia toàn bộ học viên thành các nhóm phong cách học giống nhau — chưa ai gán nhãn nhóm', answer: 'clustering', explain: 'Không tồn tại nhãn để học → clustering trên features.' }
        ]
      },

      step_3: {
        type: 'experiment_rounds',
        mission: 'Chạy 3 thí nghiệm trên CÙNG 1 bảng feature — chỉ đổi target/task, và xem hợp đồng output đổi theo.',
        rounds: [
          {
            title: 'Round 1 — Target: final_score',
            fixed: [
              { label: 'Dataset', value: 'study_task_demo_v1 (24 học viên)' },
              { label: 'Features (X)', value: 'study_hours, attendance, quiz_score' },
              { label: 'Target (y)', value: 'final_score — số liên tục' }
            ],
            choose: { label: 'Đây là loại bài toán nào?', answer: 'regression' },
            output: 'predict(X_new) → 71.8  (điểm ước lượng — SỐ THỰC)',
            code: 'regressor = SimpleRegressor()\nregressor.fit(X, y_score)\nprint(regressor.predict(X_new))',
            note: 'Target định lượng → train/predict trả về ước lượng số.'
          },
          {
            title: 'Round 2 — Target: pass_fail',
            fixed: [
              { label: 'Dataset', value: 'study_task_demo_v1 (CÙNG 24 học viên)' },
              { label: 'Features (X)', value: 'CÙNG 3 cột feature' },
              { label: 'Target (y)', value: 'pass_fail ∈ {0, 1} — tên lớp' }
            ],
            choose: { label: 'Đây là loại bài toán nào?', answer: 'classification' },
            output: 'predict(X_new) → 1  (nhãn lớp: "Đậu")',
            code: 'classifier = SimpleClassifier()\nclassifier.fit(X, y_label)\nprint(classifier.predict(X_new))',
            note: 'Target 0/1 là categorical — output là TÊN LỚP, không phải con số để cộng trừ.'
          },
          {
            title: 'Round 3 — BỎ target ra ngoài',
            fixed: [
              { label: 'Dataset', value: 'study_task_demo_v1 (CÙNG 24 học viên)' },
              { label: 'Features (X)', value: 'CÙNG 3 cột feature' },
              { label: 'Target (y)', value: '— (không dùng cột target nào, k = 3)' }
            ],
            choose: { label: 'Đây là loại bài toán nào?', answer: 'clustering' },
            output: 'fit_predict(X) → [2 0 1 1 2 0 …]  (3 nhóm — ID tùy ý)',
            code: 'clusterer = SimpleClusterer(k=3)\nclusters = clusterer.fit_predict(X)\nprint(clusters)',
            note: 'Đổi tên Cluster 0 ↔ 2 không thay đổi ý nghĩa — ID cụm không có thứ tự.'
          }
        ],
        choose_options: [
          { key: 'regression', label: 'Regression' },
          { key: 'classification', label: 'Classification' },
          { key: 'clustering', label: 'Clustering' }
        ],
        completion_note: '3 output — 3 hợp đồng khác nhau — từ CÙNG 1 bảng feature. Loại bài toán do CÂU HỎI + TARGET quyết định, không phải do dữ liệu.'
      },

      step_4: {
        prompt_html: 'Huấn luyện CẢ 2 model trên cùng bảng: <code>SimpleRegressor</code> với <code>y_score</code>, ' +
          '<code>SimpleClassifier</code> với <code>y_label</code>, rồi cùng predict <code>X_new</code> và in cả 2 kết quả.',
        starter_code:
          'from ml_lab import load_study_data_full, SimpleRegressor, SimpleClassifier\n\n' +
          '# 1. Nạp bảng feature + 2 target khả dĩ + 1 học viên mới\n' +
          'X, y_score, y_label, X_new = load_study_data_full()\n\n' +
          '# 2. Regression — dự đoán ĐIỂM (TODO: fit đúng target rồi predict X_new)\n' +
          'regressor = SimpleRegressor()\n\n' +
          '# 3. Classification — dự đoán ĐẬU/RỚT (TODO: fit đúng target rồi predict X_new)\n' +
          'classifier = SimpleClassifier()\n',
        grader_fn: 'grade_lesson2',
        hints: [
          'Regressor học đại lượng LIÊN TỤC → regressor.fit(X, y_score). Classifier học TÊN LỚP → classifier.fit(X, y_label).',
          'Cả 2 model cùng predict(X_new), rồi print từng kết quả — so sánh 2 kiểu output.',
          'Nếu lỡ fit regressor bằng y_label: code vẫn CHẠY — nhưng tầng Risk sẽ giải thích vì sao đó là công thức hóa sai.'
        ],
        success_message: 'Cùng 1 bảng dữ liệu — 2 hợp đồng output: số thực (điểm) và nhãn lớp (0/1). Chọn loại bài toán = chọn target và Ý NGHĨA của nó, không phải nhìn kiểu dữ liệu lưu trữ.'
      }
    },

    /* ═══════════════ BÀI 3 — Dataset trong mắt model ═══════════════ */
    {
      id: 'c1_l3', index: 3,
      course: 'Course 1 — ML Foundations', module: 'M1 — ML Problem Framing',
      title: 'Dataset trông thế nào trong mắt model?',
      subtitle: 'DataFrame thô, ma trận feature X và vector target y',
      xp_reward: 20, badge: 'ML Problem Framer',

      step_1: {
        type: 'table_lens',
        topic_tag: 'Soi bảng dữ liệu bằng 3 tầng',
        intro_html: 'Đội StudyLab vừa xuất bảng <code>student_history_v1</code>: <b>200 dòng × 5 cột</b>, đơn vị ghi ngay trên tên cột. ' +
          'Trước khi cho model "ăn", bạn phải đọc bảng đúng cách model nhìn: mỗi DÒNG là gì, mỗi CỘT là gì, mỗi Ô là gì.',
        table: {
          columns: [
            { key: 'study_hours', label: 'study_hours', unit: 'giờ/tuần' },
            { key: 'attendance', label: 'attendance', unit: '%' },
            { key: 'quiz_score', label: 'quiz_score', unit: '0–100' },
            { key: 'final_score', label: 'final_score', unit: '0–100' },
            { key: 'pass_fail', label: 'pass_fail', unit: '0=Rớt · 1=Đậu' }
          ],
          rows: [
            [7.2, 91, 78, 82, 1],
            [2.1, 55, 34, 38, 0],
            [5.4, 76, 61, 66, 1],
            [8.9, 97, 90, 94, 1],
            [1.3, 48, 22, 25, 0],
            [6.7, 84, 72, 75, 1],
            [3.5, 62, 45, 47, 0],
            [9.6, 99, 95, 98, 1]
          ],
          total_rows: 200
        },
        tasks: [
          { key: 'row', label: 'Bấm vào SỐ THỨ TỰ của 1 dòng', note: '1 dòng = 1 SAMPLE — một học viên đã được ghi nhận đầy đủ.' },
          { key: 'col', label: 'Bấm vào TÊN 1 cột', note: '1 cột = 1 ATTRIBUTE — một thuộc tính đo trên MỌI học viên (có đơn vị).' },
          { key: 'cell', label: 'Bấm vào 1 Ô giá trị', note: '1 ô = 1 VALUE — giá trị của đúng 1 thuộc tính, trên đúng 1 học viên.' }
        ],
        micro_check: {
          question: 'Bảng có 200 dòng — 200 dòng đó nghĩa là gì?',
          options: [
            { text: '200 mẫu (sample) đã được ghi nhận — mỗi mẫu là 1 học viên', correct: true },
            { text: '200 thuộc tính (feature) khác nhau của cùng 1 học viên', correct: false }
          ],
          feedback_correct: 'Đúng! Dòng = sample, cột = attribute. 200 dòng = 200 học viên đã ghi nhận.',
          feedback_wrong: 'Chưa đúng — thuộc tính nằm ở CỘT (bảng này chỉ có 5). 200 dòng là 200 mẫu/học viên.'
        }
      },

      step_2: {
        type: 'role_rounds',
        intro_html: 'Vai trò của một cột <b>KHÔNG cố định</b> — nó đổi theo CÂU HỎI. Gán <b>Feature / Target / Không dùng</b> cho cả 5 cột, trong 2 nhiệm vụ khác nhau.',
        columns: [
          { key: 'study_hours', label: 'study_hours' },
          { key: 'attendance', label: 'attendance' },
          { key: 'quiz_score', label: 'quiz_score' },
          { key: 'final_score', label: 'final_score' },
          { key: 'pass_fail', label: 'pass_fail' }
        ],
        role_options: [
          { key: 'feature', label: 'Feature' },
          { key: 'target', label: 'Target' },
          { key: 'not_used', label: 'Không dùng' }
        ],
        rounds: [
          {
            title: 'Nhiệm vụ A — Cảnh báo SỚM pass_fail ở tuần 3',
            task_html: 'Đang là <b>tuần 3</b>: <code>final_score</code> CHƯA tồn tại. Câu hỏi: học viên này rồi sẽ Đậu hay Rớt?',
            roles: { study_hours: 'feature', attendance: 'feature', quiz_score: 'feature', final_score: 'not_used', pass_fail: 'target' },
            reveal: 'Raw DataFrame: (200, 5)  →  X: (200, 3) — y: (200,) kiểu int (0/1)',
            wrong_hint: 'Tuần 3 CHƯA có final_score → nó là thông tin TƯƠNG LAI, không thể làm input. pass_fail là target — không được nằm trong X.'
          },
          {
            title: 'Nhiệm vụ B — Dự đoán final_score cuối kỳ',
            task_html: 'Câu hỏi đổi: dự đoán <code>final_score</code>. Cùng bảng — nhưng vai trò các cột thì sao?',
            roles: { study_hours: 'feature', attendance: 'feature', quiz_score: 'feature', final_score: 'target', pass_fail: 'not_used' },
            reveal: 'Raw DataFrame: (200, 5)  →  X: (200, 3) — y: (200,) kiểu float',
            wrong_hint: 'Bây giờ final_score là TARGET (không còn là "tương lai cấm dùng" nữa) — còn pass_fail được suy trực tiếp từ final_score nên không dùng.'
          }
        ],
        misconception: 'Một cột không sinh ra đã là feature hay target mãi mãi — vai trò gắn với TỪNG bài toán.'
      },

      step_3: {
        type: 'xy_builder',
        mission: 'Tự dựng X và y: bấm chọn từng cột rồi thả vào đúng vùng. Đúng hết → thấy shape + code Pandas được sinh ra.',
        zones: [
          { key: 'feature', label: 'X — FEATURE MATRIX' },
          { key: 'target', label: 'y — TARGET VECTOR' },
          { key: 'not_used', label: 'KHÔNG DÙNG' }
        ],
        columns: [
          { key: 'study_hours', label: 'study_hours' },
          { key: 'attendance', label: 'attendance' },
          { key: 'quiz_score', label: 'quiz_score' },
          { key: 'final_score', label: 'final_score' },
          { key: 'pass_fail', label: 'pass_fail' }
        ],
        rounds: [
          {
            title: 'Round 1 — Cảnh báo sớm pass_fail (tuần 3)',
            roles: { study_hours: 'feature', attendance: 'feature', quiz_score: 'feature', final_score: 'not_used', pass_fail: 'target' },
            leak_warnings: {
              feature: {
                final_score: '⚠ final_score vào X = leak thông tin TƯƠNG LAI — tuần 3 chưa có điểm cuối kỳ!',
                pass_fail: '⚠ pass_fail vào X = model nhìn thấy chính đáp án!'
              }
            },
            code: 'X = df[["study_hours", "attendance", "quiz_score"]]\ny = df["pass_fail"]',
            reveal: 'X: (200, 3) — y: (200,) int'
          },
          {
            title: 'Round 2 — Dự đoán final_score',
            roles: { study_hours: 'feature', attendance: 'feature', quiz_score: 'feature', final_score: 'target', pass_fail: 'not_used' },
            leak_warnings: {
              feature: {
                pass_fail: '⚠ pass_fail suy trực tiếp từ final_score — cho vào X là leak đáp án dạng nén!'
              }
            },
            code: 'X = df[["study_hours", "attendance", "quiz_score"]]\ny = df["final_score"]',
            reveal: 'X: (200, 3) — y: (200,) float (dtype đổi theo task!)'
          }
        ],
        completion_note: 'X không phải "bảng trừ đi vài cột ngẫu nhiên" — nó là HỢP ĐỒNG DỮ LIỆU của đúng 1 bài toán. Đổi câu hỏi → ký lại hợp đồng.'
      },

      step_4: {
        prompt_html: 'Nạp DataFrame, in cấu trúc, rồi tạo <code>X</code> (3 feature quan sát được ở tuần 3) và ' +
          '<code>y</code> (target của bài cảnh báo sớm). In shape của cả hai.',
        starter_code:
          'from ml_lab import load_student_dataframe\n\n' +
          '# 1. Nạp bảng 200 dòng x 5 cột và xem cấu trúc\n' +
          'df = load_student_dataframe()\n' +
          'print(df.shape)\n' +
          'print(df.columns.tolist())\n\n' +
          '# 2. Tạo X = 3 feature quan sát được ở tuần 3 (TODO)\n' +
          'X = None\n\n' +
          '# 3. Tạo y = cột target của bài toán cảnh báo sớm (TODO)\n' +
          'y = None\n\n' +
          'print(X.shape)\n' +
          'print(y.shape)',
        grader_fn: 'grade_lesson3',
        hints: [
          'Chọn nhiều cột: df[["study_hours", "attendance", "quiz_score"]] — chú ý 2 lớp ngoặc vuông.',
          'Chọn 1 cột thành Series: df["pass_fail"].',
          'Tuần 3 CHƯA có final_score — cho nó vào X thì shape vẫn (200, 3) nhưng tầng Risk sẽ bắt leak thông tin tương lai.'
        ],
        success_message: 'Bạn vừa ký "hợp đồng dữ liệu" đầu tiên: X (200×3) toàn thông tin tuần 3, y = pass_fail, không leakage. Mọi model phía sau đều đứng trên hợp đồng này.'
      }
    },

    /* ═══════════════ BÀI 4 — Hiểu kiểu dữ liệu trước khi train ═══════════════ */
    {
      id: 'c1_l4', index: 4,
      course: 'Course 1 — ML Foundations', module: 'M2 — Data Readiness',
      title: 'Hiểu kiểu dữ liệu trước khi train',
      subtitle: 'Cách lưu (dtype) không phải là nghĩa (semantic type)',
      xp_reward: 20, badge: 'Data Preparation Scout',

      step_1: {
        type: 'story_rounds',
        topic_tag: 'Cùng là int64 — nghĩa khác hẳn nhau',
        intro_html: 'Bảng hồ sơ StudyLab mới có 4 cột trông đều "là số". Nhưng dtype chỉ nói CÁCH LƯU — ' +
          'muốn biết cột đó LÀ GÌ với model, phải hỏi <em>ý nghĩa ngoài đời</em> của nó. Mở từng cột để soi.',
        rounds: [
          {
            id: 'col-study-hours',
            label: 'study_hours — float64',
            flow: ['Giá trị: 7.5, 3.2, 9.1…', 'Đo được, có phần thập phân CÓ NGHĨA', '→ SỐ LIÊN TỤC (continuous)'],
            note: 'Hành động mặc định: dùng thẳng làm feature số.'
          },
          {
            id: 'col-missed',
            label: 'missed_classes — int64',
            flow: ['Giá trị: 0, 1, 2, 3…', 'ĐẾM số buổi nghỉ — 2.5 buổi là vô nghĩa', '→ SỐ ĐẾM RỜI RẠC (discrete)'],
            note: 'Vẫn là số thật: 4 buổi nghỉ nhiều gấp đôi 2 buổi.'
          },
          {
            id: 'col-scholarship',
            label: 'scholarship — int64',
            flow: ['Giá trị: chỉ có 0 và 1', '0/1 là TÊN 2 nhóm (không/có học bổng)', '→ PHÂN LOẠI NHỊ PHÂN (binary)'],
            note: 'Cộng trừ 0/1 ở đây vô nghĩa — "trung bình học bổng = 0.3" không phải một lượng.'
          },
          {
            id: 'col-id',
            label: 'student_id — int64',
            flow: ['Giá trị: 20520001, 20520002…', 'Chỉ là MÃ HỒ SƠ, không mang thông tin học tập', '→ ĐỊNH DANH (identifier)'],
            note: 'Hành động mặc định: LOẠI khỏi X — model học theo ID là học vẹt.'
          }
        ],
        micro_check: {
          question: 'Ba cột missed_classes, scholarship, student_id đều lưu int64 — cột nào là SỐ ĐẾM thật sự?',
          options: [
            { text: 'missed_classes — đếm số buổi nghỉ, gấp đôi = nghỉ nhiều gấp đôi', correct: true },
            { text: 'student_id — vì giá trị của nó lớn nhất', correct: false }
          ],
          feedback_correct: 'Chuẩn! Cùng int64 nhưng: missed_classes = lượng đếm được, scholarship = tên nhóm, student_id = mã định danh.',
          feedback_wrong: 'Chưa đúng — ID to hay nhỏ không mang nghĩa số lượng. Chỉ missed_classes là đếm thật: gấp đôi = nghỉ nhiều gấp đôi.'
        }
      },

      step_2: {
        type: 'sort_scenarios',
        intro_html: 'Phân loại theo NGHĨA, không theo dtype: kéo 5 thẻ vào đúng ngăn ngữ nghĩa.',
        bins: [
          { key: 'continuous', label: 'LIÊN TỤC — ĐO ĐƯỢC' },
          { key: 'discrete', label: 'RỜI RẠC — ĐẾM ĐƯỢC' },
          { key: 'categorical', label: 'PHÂN LOẠI — TÊN NHÓM' },
          { key: 'identifier', label: 'ĐỊNH DANH — LOẠI KHỎI X' }
        ],
        cards: [
          { text: 'gpa = 3.25 — đo được, thập phân có nghĩa', role: 'continuous' },
          { text: 'missed_classes = 3 — đếm nguyên', role: 'discrete' },
          { text: 'scholarship ∈ {0, 1} — hai nhóm', role: 'categorical' },
          { text: 'student_id = 20521001', role: 'identifier' },
          { text: 'study_hours = 7.5 giờ/tuần', role: 'continuous' }
        ],
        wrong_feedback: 'Đừng nhìn dtype — hỏi: giá trị này ĐO được, ĐẾM được, là TÊN nhóm, hay chỉ là MÃ hồ sơ?',
        scenario_intro: 'Soi kỹ hơn nhóm PHÂN LOẠI: có thứ tự hay không? (nominal vs ordinal)',
        scenario_options: [
          { key: 'nominal', label: 'Nominal — không thứ tự' },
          { key: 'ordinal', label: 'Ordinal — có thứ tự' },
          { key: 'count', label: 'Số đếm thật' }
        ],
        scenarios: [
          { text: 'major ∈ {ICT, DS, Space} — các ngành học', answer: 'nominal', explain: 'Không có ngành nào "lớn hơn" ngành nào → nominal. Chỉ so sánh bằng/khác.' },
          { text: 'satisfaction ∈ {Thấp, Vừa, Cao} — mức hài lòng khảo sát', answer: 'ordinal', explain: 'CÓ thứ tự (Thấp < Vừa < Cao) nhưng khoảng cách giữa các mức KHÔNG đo được — vẫn không phải số. Đây là ordinal: so sánh </> được, cộng trừ thì không.' },
          { text: 'scholarship ∈ {0, 1} — có/không học bổng', answer: 'nominal', explain: '0/1 là tên 2 nhóm không thứ bậc — binary là nominal đặc biệt với đúng 2 giá trị.' },
          { text: 'missed_classes ∈ {0, 1, 2, …} — số buổi nghỉ', answer: 'count', explain: 'Đếm thật: 4 buổi = gấp đôi 2 buổi. Cộng trừ nhân chia đều có nghĩa.' }
        ]
      },

      step_3: {
        type: 'xy_builder',
        mission: 'Dựng feature schema qua 3 vòng — mỗi vòng chỉ 2 cột × 2 vùng, không bị ngợp 6 vùng cùng lúc.',
        zones: [], columns: [],
        rounds: [
          {
            title: 'Round 1 — Chốt vai trò: Target vs Loại bỏ',
            task_html: 'Bài toán: dự đoán <code>pass_fail</code>. Hai cột này đứng đâu?',
            columns: [
              { key: 'pass_fail', label: 'pass_fail' },
              { key: 'student_id', label: 'student_id' }
            ],
            zones: [
              { key: 'target', label: 'TARGET (y)' },
              { key: 'exclude', label: 'LOẠI KHỎI X' }
            ],
            roles: { pass_fail: 'target', student_id: 'exclude' },
            leak_warnings: {
              target: { student_id: '⚠ student_id làm target? Không ai cần "dự đoán mã hồ sơ".' },
              exclude: { pass_fail: '⚠ pass_fail là thứ ta CẦN dự đoán — nó là target, không phải cột bỏ đi.' }
            },
            code: 'y = df["pass_fail"]\n# student_id: loại khỏi X (định danh)',
            reveal: 'Target chốt xong — định danh đứng ngoài mọi nhóm feature.'
          },
          {
            title: 'Round 2 — Nhóm số: Liên tục vs Đếm rời rạc',
            task_html: 'Cả hai đều là feature số hợp lệ — nhưng thuộc 2 tiểu loại khác nhau.',
            columns: [
              { key: 'study_hours', label: 'study_hours' },
              { key: 'missed_classes', label: 'missed_classes' }
            ],
            zones: [
              { key: 'continuous', label: 'LIÊN TỤC (đo)' },
              { key: 'discrete', label: 'RỜI RẠC (đếm)' }
            ],
            roles: { study_hours: 'continuous', missed_classes: 'discrete' },
            code: 'continuous_cols = ["study_hours"]\ndiscrete_cols = ["missed_classes"]',
            reveal: '7.5 giờ có nghĩa (đo được) — 2.5 buổi nghỉ thì không (đếm nguyên).'
          },
          {
            title: 'Round 3 — Nhóm phân loại: Nominal vs Binary',
            task_html: 'Cột chữ và cột 0/1 — cả hai đều là TÊN NHÓM.',
            columns: [
              { key: 'major', label: 'major (ICT/DS/Space)' },
              { key: 'scholarship', label: 'scholarship (0/1)' }
            ],
            zones: [
              { key: 'categorical', label: 'CATEGORICAL (chữ)' },
              { key: 'binary', label: 'BINARY (0/1)' }
            ],
            roles: { major: 'categorical', scholarship: 'binary' },
            code: 'categorical_cols = ["major"]\nbinary_cols = ["scholarship"]',
            reveal: '⚠ major là CHỮ — model số chưa "ăn" được, cần ENCODING (đánh dấu, chưa làm vội ở bài này).'
          }
        ],
        completion_note: 'Readiness card: 4 feature ∈ 4 tiểu loại ngữ nghĩa, major cần encoding, ID + target đứng ngoài X. dtype nói cách LƯU — schema này mới nói cách HIỂU.'
      },

      step_4: {
        prompt_html: 'Soi dtype/unique thật của bảng, rồi xếp 4 feature vào đúng 4 nhóm ngữ nghĩa: ' +
          '<code>continuous_cols</code>, <code>discrete_cols</code>, <code>categorical_cols</code>, <code>binary_cols</code>.',
        starter_code:
          'from ml_lab import load_student_profile\n\n' +
          '# 1. Nạp hồ sơ 200 học viên và soi kiểu dữ liệu\n' +
          'df = load_student_profile()\n' +
          'print(df.dtypes)\n' +
          'print(df["major"].unique())\n' +
          'print(df["scholarship"].unique())\n\n' +
          '# 2. Xếp 4 feature vào đúng nhóm NGỮ NGHĨA (TODO)\n' +
          'continuous_cols = []\n' +
          'discrete_cols = []\n' +
          'categorical_cols = []\n' +
          'binary_cols = []\n\n' +
          '# 3. Ghép schema + tạo X/y (giữ nguyên)\n' +
          'feature_cols = continuous_cols + discrete_cols + categorical_cols + binary_cols\n' +
          'X = df[feature_cols]\n' +
          'y = df["pass_fail"]\n' +
          'print(X.shape)',
        grader_fn: 'grade_lesson4',
        hints: [
          'dtype chỉ nói CÁCH LƯU — int64 có thể là đếm (missed_classes), tên nhóm (scholarship) hay mã số (student_id).',
          'scholarship ∈ {0,1} là TÊN 2 nhóm → binary_cols. Xếp nó vào nhóm số: code vẫn chạy, nhưng tầng Risk sẽ bắt.',
          'student_id và pass_fail không được nằm trong bất kỳ nhóm feature nào.'
        ],
        success_message: 'Schema ngữ nghĩa hoàn chỉnh: 4 feature phân đúng tiểu loại, major chờ encoding, ID/target đứng ngoài. Từ giờ, câu hỏi đầu tiên trước mọi cột dữ liệu là "nó NGHĨA là gì?", không phải "nó lưu kiểu gì?".'
      }
    },

    /* ═══════════════ BÀI 5 — Làm sạch dữ liệu bẩn ═══════════════ */
    {
      id: 'c1_l5', index: 5,
      course: 'Course 1 — ML Foundations', module: 'M2 — Data Readiness',
      title: 'Làm sạch dữ liệu bẩn',
      subtitle: 'Missing, trùng lặp, sai thang đo và giá trị đáng ngờ — 4 loại lỗi, 4 cách xử',
      xp_reward: 20, badge: 'Data Preparation Scout',

      step_1: {
        type: 'issue_hunt',
        topic_tag: 'Bảng này bị gì? — soi 5 vết bẩn',
        intro_html: 'Đội StudyLab đổ dữ liệu từ 2 nguồn vào 1 bảng và… <b>204 dòng thay vì 200</b>. ' +
          'Trước khi làm sạch phải GỌI TÊN đúng từng loại lỗi — vì mỗi loại có cách xử khác nhau. ' +
          'Bấm vào 5 ô/dòng được khoanh để nhận diện.',
        table: {
          columns: [
            { key: 'student_id', label: 'student_id', unit: 'mã hồ sơ' },
            { key: 'study_hours', label: 'study_hours', unit: 'giờ/tuần' },
            { key: 'attendance', label: 'attendance', unit: 'thang 0–10' },
            { key: 'quiz_score', label: 'quiz_score', unit: 'thang 0–10' },
            { key: 'major', label: 'major', unit: 'ICT · DS · Space' }
          ],
          rows: [
            [20520001, 7.2, 8.4, 7.9, 'ICT'],
            [20520002, 2.1, 'NaN', 3.4, 'DS'],
            [20520003, 60.0, 6.1, 5.5, 'DS'],
            [20520004, 5.4, 12.0, 6.6, 'Space'],
            [20520005, 8.9, 9.7, 9.0, 'ITC'],
            [20520001, 7.2, 8.4, 7.9, 'ICT'],
            [20520006, 3.5, 6.2, 4.5, 'ICT']
          ],
          footnote: '… còn 197 dòng nữa (tổng 204 dòng — lẽ ra chỉ có 200 học viên)'
        },
        issues: [
          { row: 1, col: 2, label: 'MISSING', note: 'Ô trống (NaN) = KHÔNG BIẾT — tuyệt đối không phải 0. Học viên thiếu dữ liệu điểm danh không có nghĩa là nghỉ hết.' },
          { row: 3, col: 2, label: 'INVALID (thang đo)', note: 'attendance = 12 trên thang 0–10 — CHẮC CHẮN sai. Đủ bằng chứng → chuyển thành NaN rồi xử lý như missing.' },
          { row: 4, col: 4, label: 'INVALID (chính tả)', note: '"ITC" không nằm trong {ICT, DS, Space} — lỗi gõ phím. Map về nhóm hợp lệ hoặc "Unknown".' },
          { row: 2, col: 1, label: 'SUSPICIOUS', note: 'study_hours = 60 — cực đoan nhưng CÓ THỂ thật (ôn thi nước rút?). Bằng chứng CHƯA đủ để xóa → giữ lại + cắm cờ review.' },
          { row: 5, col: null, label: 'DUPLICATE', note: 'Dòng #6 giống 100% dòng #1 (kể cả student_id) — bản ghi bị nhân đôi khi ghép nguồn → drop bản thừa.' }
        ],
        micro_check: {
          question: 'study_hours = 60 (bất thường nhưng có thể thật) — xử lý thế nào?',
          options: [
            { text: 'GIỮ LẠI + cắm cờ study_hours_outlier để review — bất thường chưa chắc là sai', correct: true },
            { text: 'Xóa dòng ngay — số to thế này chắc chắn là lỗi nhập liệu', correct: false }
          ],
          feedback_correct: 'Chuẩn nguyên tắc BẢO THỦ: chỉ sửa khi CHẮC CHẮN sai (12 trên thang 0-10); nghi ngờ thì giữ + flag.',
          feedback_wrong: 'Xóa vội = có thể vứt một học viên thật. attendance=12 mới là chắc chắn sai (vượt thang); còn 60 giờ/tuần chỉ ĐÁNG NGỜ → flag.'
        }
      },

      step_2: {
        type: 'sort_scenarios',
        intro_html: 'Gọi tên 5 ca lỗi vào đúng ngăn — rồi chọn hành động xử lý CÓ BẰNG CHỨNG cho từng ca.',
        bins: [
          { key: 'missing', label: 'MISSING — TRỐNG' },
          { key: 'duplicate', label: 'DUPLICATE — TRÙNG 100%' },
          { key: 'invalid', label: 'INVALID — CHẮC CHẮN SAI' },
          { key: 'suspicious', label: 'SUSPICIOUS — ĐÁNG NGỜ' }
        ],
        cards: [
          { text: 'Ô attendance trống (NaN)', role: 'missing' },
          { text: '2 dòng giống nhau tuyệt đối, kể cả student_id', role: 'duplicate' },
          { text: 'quiz_score = 15 trên thang 0–10', role: 'invalid' },
          { text: 'major = "ITC" ngoài danh mục {ICT, DS, Space}', role: 'invalid' },
          { text: 'study_hours = 60 — cực đoan nhưng khả dĩ', role: 'suspicious' }
        ],
        wrong_feedback: 'Phân biệt theo BẰNG CHỨNG: vượt thang/ngoài danh mục = chắc chắn sai; chỉ "to bất thường" = mới đáng ngờ.',
        scenario_intro: 'Chọn hành động xử lý cho 3 ca',
        scenario_options: [
          { key: 'drop', label: 'Drop (xóa)' },
          { key: 'to_nan', label: 'Sửa → NaN → impute' },
          { key: 'flag', label: 'Giữ + Flag' }
        ],
        scenarios: [
          { text: 'Dòng trùng 100% (kể cả student_id) do ghép 2 nguồn dữ liệu', answer: 'drop', explain: 'Bản ghi nhân đôi không mang thêm thông tin — drop bản thừa. Lưu ý: CÙNG ID nhưng KHÁC giá trị thì KHÔNG phải exact duplicate — phải review chứ không drop.' },
          { text: 'quiz_score = 15 trên thang 0–10', answer: 'to_nan', explain: 'Chắc chắn sai (vượt thang) → chuyển NaN rồi impute bằng median. Số missing TĂNG lên một cách CÓ CHỦ ĐÍCH — đó là điều đúng.' },
          { text: 'study_hours = 60 — bất thường nhưng có thể thật', answer: 'flag', explain: 'Không đủ bằng chứng sai → giữ lại + cột cờ study_hours_outlier. Xóa mọi outlier là xóa luôn học viên thật.' }
        ]
      },

      step_3: {
        type: 'experiment_rounds',
        mission: 'Chạy recipe làm sạch 4 phase theo ĐÚNG THỨ TỰ — xem số dòng/số lỗi đổi sau từng phase.',
        choose_options: [
          { key: 'dedup', label: 'Drop trùng 100%' },
          { key: 'invalid_nan', label: 'Invalid → NaN' },
          { key: 'impute', label: 'Median + Unknown' },
          { key: 'flag', label: 'Cắm cờ outlier' }
        ],
        rounds: [
          {
            title: 'Phase 1 — Bảng đang 204 dòng (thừa 4)',
            fixed: [
              { label: 'Hiện trạng', value: '204 dòng · 4 trùng 100% · 9 NaN · 2 invalid · 2 outlier' },
              { label: 'Nguyên tắc', value: 'Xử cái CHẮC CHẮN nhất trước' }
            ],
            choose: { label: 'Phase 1 làm gì?', answer: 'dedup' },
            output: '204 → 200 dòng  (4 bản ghi nhân đôi biến mất)',
            code: 'clean_df = df.drop_duplicates().copy()',
            note: 'Luôn giữ df gốc — làm sạch trên clean_df.'
          },
          {
            title: 'Phase 2 — Còn 2 giá trị vượt thang 0–10',
            fixed: [
              { label: 'Hiện trạng', value: '200 dòng · attendance=12, quiz_score=15' },
              { label: 'Bằng chứng', value: 'Vượt thang đo = CHẮC CHẮN sai' }
            ],
            choose: { label: 'Phase 2 làm gì?', answer: 'invalid_nan' },
            output: 'invalid: 2 → 0   |   NaN: 9 → 11  (tăng CÓ CHỦ ĐÍCH)',
            code: 'for col in ["attendance", "quiz_score"]:\n    clean_df.loc[~clean_df[col].between(0, 10), col] = np.nan',
            note: 'Sai chắc chắn thì KHÔNG đoán bừa giá trị — chuyển thành "không biết" rồi xử lý chung với missing.'
          },
          {
            title: 'Phase 3 — 11 ô NaN + 2 major lạ',
            fixed: [
              { label: 'Hiện trạng', value: '200 dòng · 11 NaN số · major="ITC" ×2' },
              { label: 'Nguyên tắc', value: 'Missing = không biết ≠ 0' }
            ],
            choose: { label: 'Phase 3 làm gì?', answer: 'impute' },
            output: 'NaN: 11 → 0  ·  major lạ → "Unknown"  ·  vẫn đủ 200 dòng',
            code: 'for col in ["study_hours", "attendance", "quiz_score"]:\n    clean_df[col] = clean_df[col].fillna(clean_df[col].median())\nclean_df.loc[~clean_df["major"].isin(["ICT", "DS", "Space"]), "major"] = "Unknown"',
            note: 'Median bền với outlier hơn mean — và không dòng nào bị vứt.'
          },
          {
            title: 'Phase 4 — 2 outlier study_hours (60, 45)',
            fixed: [
              { label: 'Hiện trạng', value: '200 dòng sạch · 2 giá trị đáng ngờ còn nguyên' },
              { label: 'Bằng chứng', value: 'Chưa đủ để kết luận sai' }
            ],
            choose: { label: 'Phase 4 làm gì?', answer: 'flag' },
            output: 'validate ✓ — 200 dòng, 0 NaN, 0 invalid, 2 dòng CẮM CỜ chờ review',
            code: 'clean_df["study_hours_outlier"] = clean_df["study_hours"] > 40',
            note: 'Recipe bảo thủ hoàn chỉnh: inspect → dedup → invalid → missing → flag → validate.'
          }
        ],
        completion_note: 'Số missing TĂNG ở phase 2 rồi mới về 0 ở phase 3 — làm sạch đúng đôi khi trông "tệ đi" trước khi tốt lên. Thứ tự phase là một phần của recipe.'
      },

      step_4: {
        prompt_html: 'Tự tay chạy recipe: dedup → invalid→NaN → median + Unknown → cắm cờ outlier. ' +
          'Bảng sạch phải đủ 200 dòng và 2 outlier PHẢI còn sống (có cờ).',
        starter_code:
          'import numpy as np\n' +
          'from ml_lab import load_dirty_student_profile\n\n' +
          '# 1. Nạp bảng bẩn 204 dòng — giữ df gốc, làm sạch trên clean_df\n' +
          'df = load_dirty_student_profile()\n' +
          'clean_df = df.drop_duplicates().copy()\n\n' +
          '# 2. Giá trị vượt thang 0-10 (attendance, quiz_score) -> NaN (TODO)\n\n\n' +
          '# 3. Điền NaN 3 cột số bằng MEDIAN + map major lạ về "Unknown" (TODO)\n\n\n' +
          '# 4. Cắm cờ outlier: study_hours > 40 — GIỮ LẠI, chỉ đánh dấu (TODO)\n' +
          '# clean_df["study_hours_outlier"] = ...\n\n' +
          'print(len(df), "->", len(clean_df))',
        grader_fn: 'grade_lesson5',
        hints: [
          'clean_df.loc[~clean_df[col].between(0, 10), col] = np.nan — cho attendance và quiz_score (KHÔNG áp cho study_hours: giờ/tuần không có trần 10).',
          'clean_df[col] = clean_df[col].fillna(clean_df[col].median()) cho 3 cột số — median, tuyệt đối không phải 0.',
          'valid = ["ICT", "DS", "Space"]; clean_df.loc[~clean_df["major"].isin(valid), "major"] = "Unknown".',
          'Outlier: clean_df["study_hours_outlier"] = clean_df["study_hours"] > 40 — nếu bạn XÓA outlier, tầng Risk sẽ bắt.'
        ],
        success_message: 'Recipe bảo thủ chạy chuẩn: 200 dòng, 0 trùng, 0 invalid, 0 NaN — và 2 học viên "đáng ngờ" vẫn sống, có cờ chờ review. Ghi nhớ cho Course 2: median để impute phải học từ TRAIN split.'
      }
    },

    /* ═══════════════ BÀI 6 — Scale feature ═══════════════ */
    {
      id: 'c1_l6', index: 6,
      course: 'Course 1 — ML Foundations', module: 'M2 — Data Readiness',
      title: 'Scale feature — không để một đơn vị lấn át',
      subtitle: 'Min-Max, Standardization và khoảng cách công bằng giữa các feature',
      xp_reward: 20, badge: 'Data Preparation Scout',

      step_1: {
        type: 'story_rounds',
        topic_tag: 'Feature nào đang NÓI TO nhất?',
        intro_html: 'StudyLab muốn tìm "học viên giống nhau" để gợi ý nhóm học. Nhưng 3 feature có thang đo lệch nhau ' +
          'hàng trăm lần: <code>study_hours</code> 0–10, <code>attendance_rate</code> 0–100, <code>activity_count</code> 0–2000. ' +
          'So sánh 2 học viên bằng khoảng cách thô xem chuyện gì xảy ra.',
        rounds: [
          {
            id: 'raw-distance',
            label: 'Khoảng cách THÔ giữa học viên A và B',
            flow: ['Δ study_hours = 2  (thang 0–10)', 'Δ attendance_rate = 5  (thang 0–100)', 'Δ activity_count = 900  (thang 0–2000)', '→ activity_count chiếm ~99.99% khoảng cách'],
            note: 'Hai học viên "khác nhau" gần như CHỈ vì activity_count — 2 feature còn lại thành người câm.'
          },
          {
            id: 'scaled-distance',
            label: 'CÙNG cặp học viên — sau standardization',
            flow: ['Mỗi feature: x → (x − mean) / std', 'Δ ≈ 0.7 vs 0.5 vs 0.9 (cùng đơn vị "độ lệch chuẩn")', '→ ba feature đóng góp cùng bậc'],
            note: 'Scale không đổi THÔNG TIN — nó đổi ÂM LƯỢNG để mọi feature được nghe thấy.'
          }
        ],
        micro_check: {
          question: 'Vì sao activity_count áp đảo khoảng cách TRƯỚC khi scale?',
          options: [
            { text: 'Vì range 0–2000 lớn gấp hàng trăm lần — đơn vị to át tiếng, KHÔNG phải vì nó quan trọng hơn', correct: true },
            { text: 'Vì activity_count là feature quan trọng nhất với kết quả học tập', correct: false }
          ],
          feedback_correct: 'Chuẩn! Range lớn ≠ quan trọng. Đó chỉ là hệ quả của đơn vị đo — và là lý do phải scale.',
          feedback_wrong: 'Chưa đúng — dữ liệu chưa hề nói activity_count quan trọng hơn. Nó áp đảo chỉ vì THANG ĐO 0–2000 to hơn hàng trăm lần.'
        }
      },

      step_2: {
        type: 'sort_scenarios',
        intro_html: 'Hai phép scale kinh điển — kéo từng đặc điểm vào đúng ngăn.',
        bins: [
          { key: 'minmax', label: 'MIN-MAX — ÉP VỀ [0, 1]' },
          { key: 'standard', label: 'STANDARDIZATION — MEAN 0, STD 1' }
        ],
        cards: [
          { text: "x' = (x − min) / (max − min)", role: 'minmax' },
          { text: "x' = (x − mean) / std", role: 'standard' },
          { text: 'Kết quả LUÔN nằm trong [0, 1]', role: 'minmax' },
          { text: 'Kết quả có thể ÂM (dưới trung bình)', role: 'standard' },
          { text: 'Bị outlier kéo méo nhiều nhất (min/max nhạy cảm)', role: 'minmax' }
        ],
        wrong_feedback: 'Nhớ 2 chữ ký: Min-Max ép vào [0,1] và sống chết theo min/max; Standardization đo "cách trung bình mấy std" nên có thể âm.',
        scenario_intro: 'Đúng hay sai?',
        scenario_options: [
          { key: 'true', label: 'Đúng' },
          { key: 'false', label: 'Sai' }
        ],
        scenarios: [
          { text: 'Sau standardization, một giá trị chuẩn hóa có thể là số ÂM', answer: 'true', explain: 'Âm nghĩa là "dưới trung bình" — hoàn toàn bình thường. z = -1.5 tức thấp hơn mean 1.5 độ lệch chuẩn.' },
          { text: 'Scaling giúp LOẠI BỎ outlier khỏi dữ liệu', answer: 'false', explain: 'Outlier vẫn nguyên đó — chỉ đổi thang. Học viên 60 giờ/tuần sau scale vẫn là điểm xa nhất.' },
          { text: 'Cột có range lớn hơn thì quan trọng hơn với model', answer: 'false', explain: 'Range là hệ quả của ĐƠN VỊ đo, không phải bằng chứng tầm quan trọng — chính là lý do phải scale.' }
        ]
      },

      step_3: {
        type: 'xy_builder',
        mission: 'Chọn đúng cột đưa vào StandardScaler — ID, cột chữ và target phải đứng ngoài.',
        zones: [], columns: [],
        rounds: [
          {
            title: 'Round duy nhất — Cột nào vào scaler?',
            task_html: 'Bảng có 6 cột. Scaler chỉ nhận feature SỐ có nghĩa — chọn nơi đứng cho từng cột.',
            columns: [
              { key: 'study_hours', label: 'study_hours (0–10)' },
              { key: 'attendance_rate', label: 'attendance_rate (0–100)' },
              { key: 'activity_count', label: 'activity_count (0–2000)' },
              { key: 'student_id', label: 'student_id' },
              { key: 'major', label: 'major (chữ)' },
              { key: 'pass_fail', label: 'pass_fail (target)' }
            ],
            zones: [
              { key: 'scale', label: 'ĐƯA VÀO SCALER' },
              { key: 'keep_out', label: 'GIỮ NGOÀI' }
            ],
            roles: { study_hours: 'scale', attendance_rate: 'scale', activity_count: 'scale', student_id: 'keep_out', major: 'keep_out', pass_fail: 'keep_out' },
            leak_warnings: {
              scale: {
                student_id: '⚠ Scale một MÃ SỐ chỉ tạo ra số vô nghĩa trông-như-feature.',
                major: '⚠ major là CHỮ — không trừ mean được. Nó cần encoding, không phải scaling.',
                pass_fail: '⚠ pass_fail là TARGET — không phải input, càng không phải thứ đem chuẩn hóa.'
              }
            },
            code: 'numeric_cols = ["study_hours", "attendance_rate", "activity_count"]\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(df[numeric_cols])',
            reveal: 'fit: scaler HỌC mean/std của 3 cột → transform: mean ≈ [0, 0, 0], std ≈ [1, 1, 1]'
          }
        ],
        completion_note: 'Ba feature giờ nói cùng âm lượng — khoảng cách giữa học viên phản ánh CẢ 3 chiều, không riêng activity_count.'
      },

      step_4: {
        prompt_html: 'In range thô của 3 cột số, chuẩn hóa bằng <code>StandardScaler</code>, rồi tự kiểm chứng mean ≈ 0, std ≈ 1.',
        starter_code:
          'from sklearn.preprocessing import StandardScaler\n' +
          'from ml_lab import load_scaling_dataset\n\n' +
          '# 1. Nạp bảng + soi range 3 cột số (lệch nhau hàng trăm lần)\n' +
          'df = load_scaling_dataset()\n' +
          'numeric_cols = ["study_hours", "attendance_rate", "activity_count"]\n' +
          'X = df[numeric_cols]\n' +
          'print(X.min())\n' +
          'print(X.max())\n\n' +
          '# 2. Chuẩn hóa: tạo X_scaled bằng StandardScaler (TODO)\n' +
          'X_scaled = None\n\n' +
          '# 3. Kiểm chứng phép biến đổi\n' +
          'print(X_scaled.mean(axis=0))\n' +
          'print(X_scaled.std(axis=0))',
        grader_fn: 'grade_lesson6',
        hints: [
          'scaler = StandardScaler() rồi X_scaled = scaler.fit_transform(X).',
          'Chỉ scale 3 cột số — thêm student_id hay pass_fail vào numeric_cols: code chạy, moments vẫn đẹp, nhưng tầng Risk bắt.',
          'mean sau scale ≈ 0 (cỡ 1e-16 là do số học dấu phẩy động — chính là 0).'
        ],
        success_message: 'X_scaled (200×3): mean ≈ 0, std ≈ 1 — ba feature cùng âm lượng. Ghi nhớ cho Course 2: fit scaler trên TRAIN split trước, rồi mới transform validation/test.'
      }
    },

    /* ═══════════════ BÀI 7 — Đọc dữ liệu bằng thống kê ═══════════════ */
    {
      id: 'c1_l7', index: 7,
      course: 'Course 1 — ML Foundations', module: 'M2 — Data Readiness',
      title: 'Đọc dữ liệu bằng thống kê cơ bản',
      subtitle: 'Mean, variance, covariance, correlation — chọn đúng thước đo cho đúng câu hỏi',
      xp_reward: 20, badge: 'Data Preparation Scout',

      step_1: {
        type: 'story_rounds',
        topic_tag: 'Cùng mean — khác thế giới',
        intro_html: 'Hai lớp StudyLab cùng có điểm quiz trung bình <b>6.2</b>. Trưởng bộ môn kết luận: "hai lớp học đều như nhau". ' +
          'Mở dữ liệu từng lớp xem kết luận đó đứng vững không.',
        rounds: [
          {
            id: 'group-a',
            label: 'Lớp A — mean 6.2',
            flow: ['Điểm: 5.8 · 6.0 · 6.2 · 6.3 · 6.5 · 6.4', 'Chụm sát quanh 6.2', '→ variance NHỎ (~0.06)'],
            note: 'Cả lớp đều đều — dạy một nhịp là vừa cho tất cả.'
          },
          {
            id: 'group-b',
            label: 'Lớp B — CÙNG mean 6.2',
            flow: ['Điểm: 2.0 · 4.1 · 6.3 · 8.0 · 9.9 · 6.9', 'Trải từ 2 đến 10', '→ variance LỚN (~7.6)'],
            note: 'Nửa lớp đuối, nửa lớp vượt — "trung bình 6.2" giấu sạch chuyện đó.'
          }
        ],
        micro_check: {
          question: 'Hai lớp cùng mean 6.2 — điều gì được ĐẢM BẢO giống nhau?',
          options: [
            { text: 'Chỉ TÂM (center) của phân phối — độ phân tán có thể khác nhau một trời một vực', correct: true },
            { text: 'Phân phối điểm của 2 lớp là như nhau', correct: false }
          ],
          feedback_correct: 'Chuẩn! Mean chỉ nói tâm. Muốn biết dữ liệu túm tụm hay tản mát phải hỏi variance/std.',
          feedback_wrong: 'Chưa đúng — lớp A chụm quanh 6.2, lớp B trải 2→10. Cùng mean nhưng variance khác nhau 100 lần.'
        }
      },

      step_2: {
        type: 'sort_scenarios',
        intro_html: 'Đọc quan hệ giữa 2 biến từ mô tả scatter/giá trị — kéo vào đúng ngăn chiều quan hệ.',
        bins: [
          { key: 'positive', label: 'TƯƠNG QUAN DƯƠNG' },
          { key: 'negative', label: 'TƯƠNG QUAN ÂM' },
          { key: 'zero', label: 'GẦN 0 — KHÔNG TUYẾN TÍNH' }
        ],
        cards: [
          { text: 'study_hours tăng → final_score tăng, điểm chụm quanh đường đi lên', role: 'positive' },
          { text: 'missed_classes tăng → final_score giảm', role: 'negative' },
          { text: 'student_id vs final_score — mây điểm tròn vô hướng', role: 'zero' },
          { text: 'r = +0.85', role: 'positive' },
          { text: 'r = −0.60', role: 'negative' }
        ],
        wrong_feedback: 'Nhìn CHIỀU của đám mây điểm: dốc lên = dương, dốc xuống = âm, tròn vô hướng = gần 0.',
        scenario_intro: 'Đúng hay sai? — 3 phát biểu hay gặp',
        scenario_options: [
          { key: 'true', label: 'Đúng' },
          { key: 'false', label: 'Sai' }
        ],
        scenarios: [
          { text: 'r(study_hours, final_score) = 0.85 ⇒ học nhiều giờ GÂY RA điểm cao', answer: 'false', explain: 'Tương quan ≠ nhân quả. Có thể động lực học cao gây ra CẢ HAI. Kết luận nhân quả cần thí nghiệm can thiệp, không phải một con số r.' },
          { text: 'r ≈ 0 ⇒ chắc chắn 2 biến không liên quan gì đến nhau', answer: 'false', explain: 'r chỉ đo quan hệ TUYẾN TÍNH. Quan hệ hình chữ U hoàn hảo vẫn cho r ≈ 0.' },
          { text: 'Covariance âm cho biết 2 biến ngược chiều, nhưng ĐỘ LỚN của nó phụ thuộc đơn vị đo', answer: 'true', explain: 'Đúng — vì thế mới cần correlation: covariance chuẩn hóa về [-1, 1], so sánh được giữa các cặp biến.' }
        ]
      },

      step_3: {
        type: 'experiment_rounds',
        mission: 'Mỗi round là 1 CÂU HỎI thật của đội StudyLab — chọn đúng thước đo rồi chạy để xem kết quả.',
        choose_options: [
          { key: 'mean', label: 'Mean' },
          { key: 'variance', label: 'Variance' },
          { key: 'covariance', label: 'Covariance' },
          { key: 'correlation', label: 'Correlation' }
        ],
        rounds: [
          {
            title: 'Round 1 — "Điểm quiz ĐIỂN HÌNH của khóa là bao nhiêu?"',
            fixed: [{ label: 'Câu hỏi về', value: 'TÂM của một phân phối' }],
            choose: { label: 'Thước đo nào?', answer: 'mean' },
            output: 'numeric_df["quiz_score"].mean() → 5.79',
            code: 'print(numeric_df["quiz_score"].mean())',
            note: 'Một con số đại diện cho tâm — nhưng nhớ bài học lớp A/B: mean chưa kể hết chuyện.'
          },
          {
            title: 'Round 2 — "Điểm quiz hay điểm final phân hóa mạnh hơn?"',
            fixed: [{ label: 'Câu hỏi về', value: 'ĐỘ PHÂN TÁN quanh tâm' }],
            choose: { label: 'Thước đo nào?', answer: 'variance' },
            output: 'var(quiz_score) = 6.47   <   var(final_score) = 7.15 → final phân hóa hơn',
            code: 'print(numeric_df.var())',
            note: 'Variance = trung bình bình phương độ lệch khỏi mean — đơn vị bị bình phương theo.'
          },
          {
            title: 'Round 3 — "Nghỉ học nhiều đi cùng điểm thấp hay cao?"',
            fixed: [{ label: 'Câu hỏi về', value: 'CHIỀU đồng biến của MỘT CẶP biến' }],
            choose: { label: 'Thước đo nào?', answer: 'covariance' },
            output: 'cov(missed_classes, final_score) = −5.0  → NGƯỢC chiều (nhưng −5.0 "buổi×điểm" khó so sánh)',
            code: 'print(numeric_df.cov())',
            note: 'Dấu đọc được (âm = ngược chiều) — độ lớn thì dính đơn vị, chưa so sánh được giữa các cặp.'
          },
          {
            title: 'Round 4 — "Feature nào quan hệ TUYẾN TÍNH mạnh nhất với final_score?"',
            fixed: [{ label: 'Câu hỏi về', value: 'SO SÁNH độ mạnh quan hệ giữa NHIỀU cặp' }],
            choose: { label: 'Thước đo nào?', answer: 'correlation' },
            output: 'study_hours 0.95 › quiz_score 0.93 › attendance 0.60 › missed_classes −0.75',
            code: 'print(corr_matrix["final_score"].drop("final_score")\n      .sort_values(ascending=False))',
            note: 'Correlation = covariance đã chuẩn hóa về [−1, 1] — giờ mới so sánh được các cặp với nhau.'
          }
        ],
        completion_note: 'Bốn câu hỏi — bốn thước đo. Chọn thống kê là chọn theo CÂU HỎI, không phải tính hết mọi thứ rồi ngồi ngắm.'
      },

      step_4: {
        prompt_html: 'Dựng bảng phân tích <code>numeric_df</code> (KHÔNG có student_id), tính mean/var, ' +
          'rồi tạo <code>cov_matrix</code> và <code>corr_matrix</code> và xếp hạng tương quan với final_score.',
        starter_code:
          'from ml_lab import load_statistics_dataset\n\n' +
          'df = load_statistics_dataset()\n\n' +
          '# 1. Bảng phân tích: 5 cột số, KHÔNG có student_id (TODO)\n' +
          'numeric_df = None\n\n' +
          '# 2. Tâm và độ phân tán\n' +
          'print(numeric_df.mean())\n' +
          'print(numeric_df.var())\n\n' +
          '# 3. Quan hệ tuyến tính (TODO: tạo 2 ma trận)\n' +
          'cov_matrix = None\n' +
          'corr_matrix = None\n\n' +
          '# 4. Feature nào quan hệ mạnh nhất với final_score?\n' +
          'print(corr_matrix["final_score"].drop("final_score").sort_values(ascending=False))',
        grader_fn: 'grade_lesson7',
        hints: [
          'numeric_df = df[["study_hours", "attendance", "missed_classes", "quiz_score", "final_score"]].',
          'cov_matrix = numeric_df.cov() và corr_matrix = numeric_df.corr() — đường chéo corr luôn = 1.',
          'Cho student_id vào bảng phân tích: mọi con số vẫn tính ra — nhưng "tương quan của mã số" là nhiễu vô nghĩa, tầng Risk sẽ bắt.'
        ],
        success_message: 'Hồ sơ thống kê hoàn chỉnh: tâm, phân tán, chiều quan hệ và xếp hạng tương quan. Cảnh giới cuối cùng: r = 0.9 vẫn KHÔNG chứng minh nhân quả — và đó là ranh giới giữa người đọc số và người hiểu số.'
      }
    },

    /* ═══════════════ BÀI 8 — Vẽ đường dự đoán đầu tiên ═══════════════ */
    {
      id: 'c1_l8', index: 8,
      course: 'Course 1 — ML Foundations', module: 'M3 — Linear Regression Foundations',
      title: 'Vẽ đường dự đoán đầu tiên',
      subtitle: 'Weight, bias và hàm dự đoán tuyến tính vectorized',
      xp_reward: 20, badge: 'Regression Tuner',

      step_1: {
        type: 'line_reveal',
        topic_tag: 'Từ giờ học đến điểm dự đoán',
        intro_html: 'Sau Module 2, dữ liệu đã sạch và đọc được. Giờ StudyLab cần model ĐẦU TIÊN thật sự: ' +
          'nhìn <code>study_hours</code>, đoán <code>final_score</code>. Model đơn giản nhất là một ĐƯỜNG THẲNG: ' +
          '<code>ŷ = weight × x + bias</code>.',
        plot: {
          points: [[1.3, 34], [1.5, 30], [2.0, 38], [2.7, 45], [2.8, 47], [3.3, 43], [3.4, 50], [4.6, 56], [4.9, 66], [5.9, 63], [6.7, 69], [8.7, 80]],
          xmax: 10, ymax: 100
        },
        line: { w: 8, b: 20 },
        reveal_btn: 'Vẽ đường dự đoán',
        formula_html: 'ŷ = <b style="color:#A78BFA">8</b> × study_hours + <b style="color:#10B981">20</b> &nbsp;·&nbsp; <span style="color:#9CA8C4">weight = độ dốc · bias = điểm chặn</span>',
        trace_btn: 'Dò thử x = 5',
        trace: {
          x: 5,
          note: 'Dò x = 5: đi thẳng lên gặp đường tại ŷ = 8×5 + 20 = <b>60</b>. Mỗi dự đoán chỉ là một phép "tra đường thẳng".'
        },
        micro_check: {
          question: 'Với học viên học x = 7 giờ/tuần, đường ŷ = 8x + 20 dự đoán bao nhiêu điểm?',
          options: [
            { text: '76 — vì 8×7 + 20 = 76', correct: true },
            { text: '56 — vì 8×7 = 56', correct: false }
          ],
          feedback_correct: 'Chuẩn! weight nhân với x rồi CỘNG bias — thiếu bias là mất 20 điểm.',
          feedback_wrong: 'Thiếu bias! ŷ = 8×7 + 20 = 76. bias là phần "gốc" mà mọi dự đoán đều cộng thêm.'
        }
      },

      step_2: {
        type: 'sort_scenarios',
        intro_html: 'Hai tham số — hai vai trò hình học khác hẳn nhau. Kéo từng mô tả vào đúng ngăn.',
        bins: [
          { key: 'weight', label: 'WEIGHT (w) — ĐỘ DỐC' },
          { key: 'bias', label: 'BIAS (b) — TỊNH TIẾN DỌC' }
        ],
        cards: [
          { text: 'w = 8: mỗi giờ học thêm → dự đoán tăng 8 điểm', role: 'weight' },
          { text: 'Đổi w từ 8 thành −3: đường quay sang DỐC XUỐNG', role: 'weight' },
          { text: 'b = 20: đường cắt trục tung tại 20 (dự đoán khi x = 0)', role: 'bias' },
          { text: 'Tăng b thêm 10: cả đường NÂNG lên 10, độ dốc giữ nguyên', role: 'bias' },
          { text: 'w = 0: đường nằm ngang — x không còn ảnh hưởng gì', role: 'weight' }
        ],
        wrong_feedback: 'w điều khiển ĐỘ NGHIÊNG (đổi 1 đơn vị x thì ŷ đổi bao nhiêu); b chỉ NÂNG/HẠ cả đường.',
        scenario_intro: 'Đúng hay sai?',
        scenario_options: [
          { key: 'true', label: 'Đúng' },
          { key: 'false', label: 'Sai' }
        ],
        scenarios: [
          { text: 'bias là "sai số" (error term) của model', answer: 'false', explain: 'bias là THAM SỐ điểm chặn — giá trị dự đoán khi x = 0. Sai số (residual) là chuyện khác hẳn: khoảng cách giữa dự đoán và thực tế.' },
          { text: 'Với ŷ = 8x + 20: học 0 giờ vẫn được dự đoán 20 điểm', answer: 'true', explain: 'Đúng — đó chính là nghĩa hình học của bias: nơi đường thẳng bắt đầu trên trục tung.' },
          { text: 'Đường thẳng không bị chặn — với x đủ lớn, model có thể dự đoán quá 100 điểm', answer: 'true', explain: 'Đúng: 8×11+20 = 108 > 100. Đường thẳng "không biết" thang điểm có trần — hạn chế này sẽ dẫn tới sigmoid ở Module 4.' }
        ]
      },

      step_3: {
        type: 'line_tuner',
        mission: 'Cầm 2 slider chỉnh đường thẳng THẬT — hoàn thành cả 3 mục tiêu để cảm được tay lái của w và b.',
        plot: {
          points: [[1.3, 34], [1.5, 30], [2.0, 38], [2.7, 45], [2.8, 47], [3.3, 43], [3.4, 50], [4.6, 56], [4.9, 66], [5.9, 63], [6.7, 69], [8.7, 80]],
          xmax: 10, ymax: 100
        },
        sliders: {
          w: { min: -5, max: 15, step: 0.5, init: 2 },
          b: { min: -20, max: 60, step: 5, init: 0 }
        },
        show_mse: false,
        goals: [
          { id: 'hit', label: 'Chỉnh để ŷ(5) rơi vào 57–63', check: 'hit_target', x: 5, y: 60, tol: 3 },
          { id: 'down', label: 'Làm đường DỐC XUỐNG (w < 0)', check: 'w_neg' },
          { id: 'shift', label: 'Giữ nguyên w, chỉ nâng b thêm ≥ 10', check: 'bias_shift', delta: 10 }
        ],
        completion_note: 'w xoay đường quanh điểm chặn, b nâng hạ cả đường — hai tay lái độc lập. Bài sau: để DỮ LIỆU tự chấm xem đường nào tốt (MSE).'
      },

      step_4: {
        prompt_html: 'Hoàn thành hàm <code>predict_score(x, weight, bias)</code> — phải chạy VECTORIZED: ' +
          'nhận cả mảng NumPy, trả về một dự đoán cho mỗi phần tử.',
        starter_code:
          'import numpy as np\n\n' +
          '# 3 học viên với số giờ học khác nhau\n' +
          'study_hours = np.array([2, 5, 8], dtype=float)\n\n' +
          '# TODO: hoàn thành hàm dự đoán tuyến tính (1 dòng công thức)\n' +
          'def predict_score(x, weight, bias):\n' +
          '    return None\n\n' +
          'predictions = predict_score(study_hours, 8.0, 20.0)\n' +
          'print(predictions)',
        grader_fn: 'grade_lesson8',
        hints: [
          'Công thức: weight * x + bias — NumPy tự nhân/cộng cho cả mảng (vectorization).',
          'Đừng quên "+ bias": grader sẽ đổi bias từ 0 lên 55 để kiểm tra bạn có dùng nó thật không.',
          'Đừng gõ tay [36, 60, 84] — test ẩn sẽ đổi cả x lẫn tham số (kể cả w âm).'
        ],
        success_message: 'Hàm dự đoán tuyến tính đầu tiên: 1 dòng công thức, chạy cho mọi mảng, mọi tham số. Model chỉ là công thức + tham số — bài sau ta đo xem tham số nào TỐT.'
      }
    },

    /* ═══════════════ BÀI 9 — Đo lỗi model bằng MSE ═══════════════ */
    {
      id: 'c1_l9', index: 9,
      course: 'Course 1 — ML Foundations', module: 'M3 — Linear Regression Foundations',
      title: 'Đo lỗi model bằng Mean Squared Error',
      subtitle: 'Residual, bình phương lỗi và chi phí trung bình — kèm R² để đọc cho người thường',
      xp_reward: 20, badge: 'Regression Tuner',

      step_1: {
        type: 'story_rounds',
        topic_tag: 'Đường thẳng cách thực tế bao xa?',
        intro_html: 'Bài trước bạn chỉnh đường bằng MẮT. Nhưng StudyLab cần một CON SỐ để nói "đường này tốt hơn đường kia". ' +
          'Thử thước đo ngây thơ nhất — cộng hết các lỗi lại — và xem nó gãy ở đâu.',
        rounds: [
          {
            id: 'cancel',
            label: 'Thước đo ngây thơ: cộng lỗi CÓ DẤU',
            flow: ['Học viên 1: ŷ = 68, thực tế 76 → lỗi = −8', 'Học viên 2: ŷ = 66, thực tế 58 → lỗi = +8', 'Tổng lỗi = −8 + 8 = 0 ???'],
            note: 'Cả 2 dự đoán đều sai 8 điểm mà "tổng lỗi = 0" — lỗi trái dấu TRIỆT TIÊU nhau. Thước đo này khen nhầm model tồi.'
          },
          {
            id: 'squared',
            label: 'Sửa: BÌNH PHƯƠNG trước, trung bình sau',
            flow: ['(−8)² = 64  ·  (+8)² = 64', 'MSE = (64 + 64) / 2 = 64', 'Không gì triệt tiêu được nữa'],
            note: 'Bình phương diệt dấu VÀ phạt nặng lỗi lớn: lỗi 10 → 100, lỗi 2 → chỉ 4. Model bị ép ưu tiên sửa lỗi to nhất.'
          }
        ],
        micro_check: {
          question: 'Học viên mới: ŷ = 55, thực tế = 63. Residual (= predictions − actual) là bao nhiêu?',
          options: [
            { text: '−8 — dự đoán THẤP hơn thực tế 8 điểm', correct: true },
            { text: '+8 — cứ lấy số lớn trừ số nhỏ', correct: false }
          ],
          feedback_correct: 'Chuẩn quy ước: predictions − actual = 55 − 63 = −8. Dấu âm nghĩa là đoán THẤP.',
          feedback_wrong: 'Sai quy ước — residual = predictions − actual = 55 − 63 = −8. Dấu mang thông tin: âm = đoán thấp, dương = đoán cao.'
        }
      },

      step_2: {
        type: 'sort_scenarios',
        intro_html: 'Bước 1 của MSE: bình phương từng residual. Kéo mỗi residual vào đúng ngăn giá trị bình phương.',
        bins: [
          { key: 'sq64', label: 'BÌNH PHƯƠNG = 64' },
          { key: 'sq4', label: 'BÌNH PHƯƠNG = 4' },
          { key: 'sq0', label: 'BÌNH PHƯƠNG = 0' }
        ],
        cards: [
          { text: 'residual = −8', role: 'sq64' },
          { text: 'residual = +8', role: 'sq64' },
          { text: 'residual = −2', role: 'sq4' },
          { text: 'residual = +2', role: 'sq4' },
          { text: 'residual = 0 (đoán trúng phóc)', role: 'sq0' }
        ],
        wrong_feedback: 'Bình phương xóa dấu: (−8)² và (+8)² đều là 64. Chỉ độ LỚN của lỗi sống sót.',
        scenario_intro: 'Đúng hay sai? — gồm cả thước đo chuẩn hóa R²',
        scenario_options: [
          { key: 'true', label: 'Đúng' },
          { key: 'false', label: 'Sai' }
        ],
        scenarios: [
          { text: 'MSE của 3 residual [3, −1, 2] là (9 + 1 + 4) / 3 ≈ 4.67', answer: 'true', explain: 'Đúng quy trình: bình phương từng lỗi → trung bình. Không phải (3−1+2)/3.' },
          { text: 'MSE = 25 nghĩa là model lệch trung bình 25 điểm', answer: 'false', explain: 'MSE ở đơn vị BÌNH PHƯƠNG (điểm²). Độ lệch điển hình ≈ √25 = 5 điểm. Đây là cái giá của việc bình phương.' },
          { text: 'Model có MSE = 16, còn "đoán mọi người = mean" có MSE = 64 → R² = 1 − 16/64 = 0.75, tức model giải thích 75% biến thiên của điểm', answer: 'true', explain: 'Đây là R² — thước đo CHUẨN HÓA đọc được ngay: 0 = không hơn gì đoán mean, 1 = hoàn hảo. Mẫu số 64 chính là variance của y mà bạn học ở Bài 7 — MSE của "model ngây thơ nhất".' }
        ]
      },

      step_3: {
        type: 'line_tuner',
        mission: 'Cost Meter đã bật. Việc 1: so 2 đường ứng viên bằng MSE. Việc 2: tự chỉnh slider hạ MSE xuống dưới 20.',
        plot: {
          points: [[1.3, 34], [1.5, 30], [2.0, 38], [2.7, 45], [2.8, 47], [3.3, 43], [3.4, 50], [4.6, 56], [4.9, 66], [5.9, 63], [6.7, 69], [8.7, 80]],
          xmax: 10, ymax: 100
        },
        presets: [
          { label: 'Đường A: ŷ = 8x + 20', short: 'A', w: 8, b: 20 },
          { label: 'Đường B: ŷ = 4x + 45', short: 'B', w: 4, b: 45 }
        ],
        sliders: {
          w: { min: -5, max: 15, step: 0.5, init: 8 },
          b: { min: -20, max: 60, step: 5, init: 20 }
        },
        show_mse: true,
        goals: [
          { id: 'choose_lower', label: 'Xem MSE cả 2 đường rồi chọn đường RẺ hơn', check: 'choose_lower' },
          { id: 'tune', label: 'Tinh chỉnh w/b để MSE < 20', check: 'mse_below', value: 20 }
        ],
        completion_note: 'Các đoạn đỏ là residual — MSE chính là "tổng diện tích bình phương" của chúng. Đường tối ưu quanh w ≈ 6.5, b ≈ 25 cho MSE ≈ 12: dữ liệu có noise nên MSE = 0 là ẢO TƯỞNG.'
      },

      step_4: {
        prompt_html: 'Viết hàm <code>mean_squared_error(actual, predictions)</code> dùng chung cho mọi mảng, ' +
          'rồi dùng nó phân xử: đường A (8x+20) hay đường B (4x+45) rẻ hơn trên 12 học viên thật?',
        starter_code:
          'import numpy as np\n' +
          'from ml_lab import load_mse_demo\n\n' +
          '# 12 học viên: điểm thật + dự đoán của 2 đường ứng viên\n' +
          'actual, pred_a, pred_b = load_mse_demo()\n\n' +
          '# TODO: residual -> bình phương -> trung bình (vectorized, không vòng lặp)\n' +
          'def mean_squared_error(actual, predictions):\n' +
          '    return None\n\n' +
          'print("MSE A:", mean_squared_error(actual, pred_a))\n' +
          'print("MSE B:", mean_squared_error(actual, pred_b))',
        grader_fn: 'grade_lesson9',
        hints: [
          'errors = predictions - actual, rồi (errors ** 2).mean().',
          'Trả về np.abs(errors).mean() là MAE — metric hợp lệ nhưng KHÁC; tầng Risk sẽ chỉ ra.',
          'Trả về errors.mean() (giữ dấu) thì các lỗi trái dấu triệt tiêu — chính cái bẫy ở Step 1.'
        ],
        success_message: 'MSE(A) ≈ 20.9 < MSE(B) ≈ 127.6 — dữ liệu đã phân xử thay cho mắt. Và khi cần nói cho người thường: đổi sang R² = 1 − MSE/variance(y), thang 0→1, "model giải thích bao nhiêu % biến thiên".'
      }
    },

    /* ═══════════════ BÀI 10 — Gradient Descent ═══════════════ */
    {
      id: 'c1_l10', index: 10,
      course: 'Course 1 — ML Foundations', module: 'M3 — Linear Regression Foundations',
      title: 'Gradient Descent — để model tự chỉnh đường',
      subtitle: 'Hướng gradient, learning rate, luật update và hội tụ',
      xp_reward: 20, badge: 'Regression Tuner',

      step_1: {
        type: 'story_rounds',
        topic_tag: 'Quả bóng trên đồi chi phí',
        intro_html: 'Bài 9 bạn tự xoay slider hạ MSE. Nhưng model thật có hàng nghìn tham số — không ai xoay tay nổi. ' +
          'Cần một luật để tham số TỰ đi xuống đáy đồi chi phí: <b>Gradient Descent</b>. ' +
          'Hãy tưởng tượng MSE(w) là một thung lũng hình chữ U và w hiện tại là quả bóng đứng trên sườn.',
        rounds: [
          {
            id: 'direction',
            label: 'Gradient nói gì?',
            flow: ['Bóng đang ở w = 2', 'gradient = +14 → đi sang PHẢI thì cost TĂNG', 'Muốn xuống đáy: đi NGƯỢC gradient (sang trái)'],
            note: 'Gradient là "độ dốc tại chỗ đứng". Dấu CỘNG = dốc lên phía phải → phải đi lùi. Luật: luôn đi NGƯỢC dấu gradient.'
          },
          {
            id: 'update',
            label: 'Một bước update bằng số',
            flow: ['w = 2, gradient = +14, learning rate α = 0.1', 'w mới = 2 − 0.1 × 14 = 0.6', 'MSE: 210 → 96 — thấp hơn thật'],
            note: 'Dấu TRỪ trong "w −= α × grad" chính là "đi ngược gradient". α quyết định bước đi dài hay ngắn.'
          }
        ],
        micro_check: {
          question: 'Gradient tại w hiện tại là +14. Để GIẢM cost, w phải thay đổi thế nào?',
          options: [
            { text: 'GIẢM — đi ngược dấu gradient, đúng luật w −= α × grad', correct: true },
            { text: 'TĂNG — đi cùng chiều gradient cho nhanh', correct: false }
          ],
          feedback_correct: 'Chuẩn! Gradient dương = dốc lên phía trước → lùi lại. Đó là toàn bộ linh hồn của Gradient DESCENT.',
          feedback_wrong: 'Đi CÙNG chiều gradient là leo dốc — cost tăng. Muốn xuống đáy phải đi ngược: w −= α × grad.'
        }
      },

      step_2: {
        type: 'sort_scenarios',
        intro_html: 'Learning rate là con dao hai lưỡi. Đọc 5 mô tả loss curve và xếp vào đúng chẩn đoán.',
        bins: [
          { key: 'small', label: 'α QUÁ NHỎ — BÒ' },
          { key: 'good', label: 'α PHÙ HỢP — HỘI TỤ' },
          { key: 'big', label: 'α QUÁ LỚN — VĂNG' }
        ],
        cards: [
          { text: 'Loss giảm đều rồi phẳng dần sau ~50 bước', role: 'good' },
          { text: 'Loss bò xuống chậm rì — 200 bước vẫn chưa gần đáy', role: 'small' },
          { text: 'Loss nhảy lên nhảy xuống rồi BÙNG NỔ ra vô cực', role: 'big' },
          { text: 'Mỗi bước loss chỉ nhích 0.0001', role: 'small' },
          { text: 'Sau 3 bước, loss dao động qua lại giữa 2 giá trị ngày càng lớn', role: 'big' }
        ],
        wrong_feedback: 'Nhìn nhịp của đường loss: bò mãi không tới = α nhỏ; xuống rồi phẳng = vừa; văng khỏi đồi = α lớn.',
        scenario_intro: 'Tự tính một bước update — gồm cả gradient ÂM',
        scenario_options: [
          { key: 'true', label: 'Đúng' },
          { key: 'false', label: 'Sai' }
        ],
        scenarios: [
          { text: 'w = 5, grad_w = −4, α = 0.5 → w mới = 5 − 0.5×(−4) = 7', answer: 'true', explain: 'Trừ một số âm là CỘNG: gradient âm nghĩa là "dốc xuống phía phải" → w tiến lên là đúng hướng giảm cost.' },
          { text: 'Gradient chọn HƯỚNG đi, learning rate chọn ĐỘ DÀI mỗi bước', answer: 'true', explain: 'Đúng vai trò từng thành phần trong α × grad — nhầm 2 vai trò này là nguồn gốc của nửa số bug training.' },
          { text: 'Nếu loss đang TĂNG dần theo từng bước, cứ kiên nhẫn chạy thêm là sẽ hội tụ', answer: 'false', explain: 'Loss tăng dần theo bước = đang phân kỳ (α quá lớn) — chạy thêm chỉ văng xa hơn. Phải GIẢM α, không phải tăng kiên nhẫn.' }
        ]
      },

      step_3: {
        type: 'gd_console',
        mission: 'Console GD thật: chọn learning rate, chạy từng cụm bước, nhìn đường thẳng tự bò về dữ liệu. Thử CẢ 3 mức α — kể cả mức làm nổ tung.',
        data: {
          x: [4.4, 7.5, 1.6, 6.2, 4.7, 3.3, 8.2, 2.5, 5.4, 5.7, 0.8, 9.4, 8.6, 3.9, 1.1, 6.9, 2.1, 7.8, 9.1, 3.0],
          y: [55.9, 82.1, 34.2, 68.9, 59.1, 44.7, 88.0, 41.3, 62.4, 66.8, 25.2, 96.7, 87.3, 52.9, 27.8, 74.5, 38.6, 84.2, 91.9, 45.1],
          xmax: 10, ymax: 110
        },
        alphas: [
          { key: 'small', label: 'α = 0.0005' },
          { key: 'good', label: 'α = 0.02' },
          { key: 'big', label: 'α = 0.08' }
        ],
        alpha_values: { small: 0.0005, good: 0.02, big: 0.08 },
        run_steps: 50,
        target_mse: 25,
        completion_note: 'α = 0.0005 bò cả trăm bước chưa tới; α = 0.08 văng khỏi đồi; α = 0.02 xuống đáy êm. Cùng MỘT luật update — chỉ khác độ dài bước chân.'
      },

      step_4: {
        prompt_html: 'Hoàn thành vòng lặp Gradient Descent: mỗi bước gọi <code>compute_gradients</code>, ' +
          'update <code>weight</code>/<code>bias</code> (nhớ DẤU TRỪ), rồi ghi MSE vào <code>loss_history</code>.',
        starter_code:
          'from ml_lab import load_gradient_data, compute_mse, compute_gradients\n\n' +
          '# 40 học viên, 1 feature — model khởi đầu mù tịt (0, 0)\n' +
          'x, y = load_gradient_data()\n' +
          'weight, bias = 0.0, 0.0\n' +
          'learning_rate, steps = 0.01, 200\n' +
          'loss_history = []\n\n' +
          '# TODO: vòng lặp GD — gradient -> update (dấu trừ!) -> predictions -> ghi loss\n' +
          'for step in range(steps):\n' +
          '    pass\n\n' +
          'print("MSE:", loss_history[0], "->", loss_history[-1])\n' +
          'print("w =", weight, "| b =", bias)',
        grader_fn: 'grade_lesson10',
        hints: [
          'grad_w, grad_b = compute_gradients(x, y, weight, bias) — helper tính sẵn gradient cho bạn.',
          'weight -= learning_rate * grad_w (và tương tự cho bias). Dùng dấu CỘNG là leo đồi — grader bắt ngay.',
          'Mỗi bước: predictions = weight * x + bias rồi loss_history.append(compute_mse(y, predictions)).',
          'Đừng gõ tay loss đẹp: grader đối chiếu loss_history[-1] với MSE tính từ (weight, bias) cuối, và chạy lại trên dataset ẨN có đường thật khác hẳn.'
        ],
        success_message: 'MSE 887 → 26 sau 200 bước — model TỰ tìm đường mà không ai xoay slider. Đây chính là trái tim của "học" trong machine learning: lặp lại một luật update nhỏ, đủ nhiều lần.'
      }
    }
  ]
};
