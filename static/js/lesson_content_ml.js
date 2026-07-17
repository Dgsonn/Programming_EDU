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
              final_score: '⚠ final_score vào X = leak thông tin TƯƠNG LAI — tuần 3 chưa có điểm cuối kỳ!',
              pass_fail: '⚠ pass_fail vào X = model nhìn thấy chính đáp án!'
            },
            code: 'X = df[["study_hours", "attendance", "quiz_score"]]\ny = df["pass_fail"]',
            reveal: 'X: (200, 3) — y: (200,) int'
          },
          {
            title: 'Round 2 — Dự đoán final_score',
            roles: { study_hours: 'feature', attendance: 'feature', quiz_score: 'feature', final_score: 'target', pass_fail: 'not_used' },
            leak_warnings: {
              pass_fail: '⚠ pass_fail suy trực tiếp từ final_score — cho vào X là leak đáp án dạng nén!'
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
    }
  ]
};
