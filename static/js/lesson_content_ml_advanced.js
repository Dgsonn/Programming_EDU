/* lesson_content_ml_advanced.js — Course 3 (Machine Learning Nâng Cao / Advanced Modeling
 * & Neural Networks). Cùng schema "shell" với lesson_content_ml.js — renderer dùng chung
 * là lesson_db_design.js (KHÔNG có renderer riêng).
 * Anatomy 4 bước / bài:
 *   step_1: you_will_learn + glossary + primer + concept_cards
 *   step_2: mcq[] + mini_game (classify: chips/bins/solution)
 *   step_3: ml_pipeline:true — blocks/drop_zones (kéo hoặc gõ Python) + expected_zones + reveal_hints
 *   step_4: Full Python IDE (Pyodide, chấm 4 tầng) — prompt/context/hints/grader_fn
 *           (riêng Bài 14 dùng remote CPU sandbox PyTorch — renderer thêm khi build tới bài đó)
 * Grader mapping: step_4.grader_fn → static/py/ml_grader.py:grade_lesson_c3_N.
 * Data loaders: static/py/ml_lab.py:load_* (COURSE 3 section).
 * Spec nguồn: docs/ML_Curriculum_Course_1_2_3_Revised_with_Coverage_Audit.pdf (trang 137-208)
 *             + docs/ML_Exercise_Bank_Courses_1_2_3_Full.pdf (trang 120-188).
 * 14 bài / 5 module: M1 High-Dimensional Representation (B1-4) · M2 Margin-Based
 * Classification (B5) · M3 Clustering & Structure Discovery (B6-9) · M4 Neural Computation
 * (B10-12) · M5 Backpropagation & Experiment Defense (B13-14). */

window.LESSON_CONTENT = window.LESSON_CONTENT || {};
window.HERO_SVGS_ML = window.HERO_SVGS_ML || {};

window.LESSON_CONTENT['ml_advanced'] = {
  course_id: 'ml_advanced',
  course_title: 'Machine Learning Nâng Cao',
  accent_color: '#22D3EE',
  module_color: '#22D3EE',
  total_lessons: 14,
  lessons: [
    // ╔══════════════════════════════════════════════════════════╗
    // ║  M1 — HIGH-DIMENSIONAL REPRESENTATION                    ║
    // ╚══════════════════════════════════════════════════════════╝
    {
      id: 'c3_l1',
      index: 1,
      title: 'Dữ liệu nhiều chiều và curse of dimensionality',
      subtitle: 'Distance concentration, feature nhiễu và gánh nặng số mẫu',
      module: 1,
      module_title: 'M1 · High-Dimensional Representation',
      estimated_minutes: 23,
      xp_reward: 65,
      achievement: { name: 'Distance Detective', desc: 'Đo và giải thích distance concentration bằng một thí nghiệm có kiểm soát.' },
      story: {
        tag: '🧬 StudyLab · Advanced Modeling Lab',
        hook: 'StudyLab vừa mở khóa thêm hàng chục log hoạt động cho mỗi học viên — không còn 3-4 cột như Course 1/2, mà cả trăm cột. Ai đó đề xuất: "càng nhiều dữ liệu, model càng thông minh." Nhưng khi bạn thử dùng KNN để tìm "học viên giống Minh nhất" trên bộ dữ liệu nhiều chiều đó, MỌI học viên đều trông xa Minh như nhau — "gần nhất" và "xa nhất" gần như không khác biệt. Bài mở màn Course 3: hiểu vì sao, và học cách CHẨN ĐOÁN nó bằng một thí nghiệm có kiểm soát — trước khi vội vàng nhấn nút PCA.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Đo được khoảng cách gần nhất/xa nhất co lại thế nào khi số chiều tăng (distance concentration).',
            'Phân biệt feature tín hiệu với feature nhiễu, và giải thích vai trò của tỉ lệ mẫu:chiều.',
            'Chạy một thí nghiệm CÓ KIỂM SOÁT — chỉ đổi số chiều — để tránh kết luận nhân quả sai.',
          ],
        },
        glossary: [
          { term: 'High-dimensional data', vi: 'Dữ liệu nhiều chiều', accent: '#22D3EE', def: 'Dataset có RẤT NHIỀU cột (feature) mô tả mỗi mẫu — không chỉ 2-3 cột mà có thể hàng chục, hàng trăm.', ex: '320 học sinh × 100 cột', out: 'X.shape = (320, 100)' },
          { term: 'Curse of dimensionality', vi: 'Lời nguyền số chiều', accent: '#67E8F9', def: 'Hiện tượng các phép đo dựa trên khoảng cách (KNN, clustering…) mất dần khả năng phân biệt khi số chiều tăng, nếu không kiểm soát tín hiệu và số mẫu.', ex: 'KNN không còn tìm được "láng giềng thật sự"', out: '' },
          { term: 'Distance concentration', vi: 'Tập trung khoảng cách', accent: '#22D3EE', def: 'Khi chiều tăng, khoảng cách GẦN NHẤT và XA NHẤT giữa các điểm tiến gần nhau — "ai cũng trông xa như ai".', ex: 'nearest/farthest → 1', out: '' },
          { term: 'Controlled comparison', vi: 'So sánh có kiểm soát', accent: '#0891B2', def: 'Chỉ đổi ĐÚNG MỘT biến (ở đây là số chiều) giữa các lần so sánh, giữ nguyên mọi cấu hình khác (seed, số mẫu, model) để kết luận nhân quả có căn cứ.', ex: 'cùng 320 mẫu, cùng n_neighbors=7', out: '' },
          { term: 'Sample-to-feature ratio', vi: 'Tỉ lệ mẫu : chiều', accent: '#67E8F9', def: 'Số mẫu chia cho số chiều — tỉ lệ càng thấp, dữ liệu càng "thưa" trong không gian nhiều chiều, model càng khó học đáng tin.', ex: '320 mẫu : 100 chiều = 3.2', out: '' },
          { term: 'Signal vs noise feature', vi: 'Feature tín hiệu vs nhiễu', accent: '#A5F3FC', def: 'Feature tín hiệu thật sự liên quan đến nhãn cần dự đoán; feature nhiễu không mang thông tin nhưng vẫn "pha loãng" khoảng cách hình học.', ex: 'focus_score (tín hiệu) vs 98 cột random (nhiễu)', out: '' },
        ],
        primer: {
          goal: [
            'Quan sát 2 thanh GẦN NHẤT/XA NHẤT co lại khi kéo số chiều 2→100.',
            'Chạy 1 thí nghiệm CÓ KIỂM SOÁT: cùng 320 học sinh, cùng seed, chỉ đổi số chiều.',
          ],
          intro: '<p>Curse of dimensionality không phải "nhiều cột là xấu" — đó là hiện tượng hình học: khi số chiều tăng, khoảng cách giữa các điểm trở nên khó phân biệt (<em>distance concentration</em>). Bài này bạn sẽ TỰ ĐO hiện tượng đó bằng thí nghiệm có kiểm soát, thay vì tin vào cảm giác "chắc là do nhiều chiều".</p>',
          example: '',
        },
        intro: 'StudyLab nhiều chiều hơn — nhưng "nhiều hơn" không tự động "tốt hơn".',
        concept_cards: [
          { icon: 'fa-bullseye', title: 'Không phải cứ nhiều chiều là tệ', body: 'Hại hay không phụ thuộc tín hiệu, số mẫu, thang đo và metric khoảng cách — không phải bản thân số chiều.' },
          { icon: 'fa-arrows-left-right-to-line', title: 'Gần & xa nhòe vào nhau', body: 'Khi chiều tăng, khoảng cách gần nhất và xa nhất tiến sát nhau — KNN và các thuật toán dựa khoảng cách mất tín hiệu.' },
          { icon: 'fa-flask', title: 'Thí nghiệm phải có kiểm soát', body: 'Đổi CHỈ MỘT biến (số chiều) mỗi lần so sánh — đổi cả số mẫu lẫn số chiều rồi kết luận là suy diễn sai.' },
        ],
        dimension_lens: {
          title: 'ỐNG KÍNH SỐ CHIỀU',
          intro: 'Kéo slider — quan sát 2 thanh GẦN NHẤT/XA NHẤT với Minh co lại thế nào.',
          n_samples: 320,
          query_name: 'Minh',
          checkpoints: [2, 5, 10, 20, 35, 50, 70, 100],
          contrast: [0.0068, 0.0808, 0.1569, 0.3133, 0.4375, 0.5029, 0.5483, 0.6124],
          riddle: {
            prompt: 'Khi tăng số chiều từ 2 lên 100 (GIỮ NGUYÊN 320 học sinh), khoảng cách GẦN NHẤT và XA NHẤT với Minh sẽ…',
            options: ['Tách xa nhau hơn', 'Xích lại gần nhau, khó phân biệt', 'Không đổi vì số học sinh không đổi'],
            answer: 'Xích lại gần nhau, khó phân biệt',
            wrong: {
              'Tách xa nhau hơn': 'Ngược lại — thêm chiều (nhất là chiều nhiễu) làm MỌI khoảng cách tiến gần nhau hơn, không phải tách xa.',
              'Không đổi vì số học sinh không đổi': 'Số học sinh không đổi đúng, nhưng số CHIỀU đổi — và chính số chiều mới là biến ảnh hưởng đến hình học khoảng cách ở đây.',
            },
            done: '✅ Đúng — đây là <b>distance concentration</b>: tăng chiều (giữ nguyên số mẫu) khiến "gần nhất" và "xa nhất" tiến về CÙNG một giá trị. Kéo tiếp slider tới 100 chiều để thấy rõ, rồi sang Bước 2.',
          },
        },
        visual: {
          schema: {
            table_name: 'dimension_stress_suite',
            columns: [
              { name: 'focus_score', type: 'FLOAT', key: '' },
              { name: 'practice_score', type: 'FLOAT', key: '' },
              { name: 'noise_1..noise_98', type: 'FLOAT × 98', key: '' },
              { name: 'pass_fail', type: 'INT · 0/1', key: 'TARGET' },
            ],
          },
          data_preview: [
            ['0.19', '-0.54', '⋯', '1'],
            ['-0.94', '0.11', '⋯', '1'],
            ['-1.14', '0.39', '⋯', '0'],
            ['2.43', '0.51', '⋯', '1'],
            ['-0.23', '0.30', '⋯', '1'],
          ],
        },
        mission: 'Đo distance-contrast + validation accuracy ở 2 / 20 / 100 chiều — CÙNG 320 học sinh, CÙNG seed — rồi kết luận đúng nguyên nhân.',
      },
      step_2: {
        mcq: [
          {
            question: 'Câu nào MÔ TẢ ĐÚNG hiện tượng curse of dimensionality trong bài này?',
            options: [
              { id: 'a', text: 'Khi số chiều tăng (giữ nguyên số mẫu), khoảng cách gần nhất và xa nhất giữa các điểm tiến gần nhau, làm KNN khó phân biệt "láng giềng thật sự"', correct: true, explanation: 'Đúng — đây chính là distance concentration bạn vừa quan sát ở Ống kính số chiều.' },
              { id: 'b', text: 'Thêm chiều luôn làm model tệ đi, bất kể có bao nhiêu mẫu', correct: false, explanation: 'Quá tuyệt đối — mức độ ảnh hưởng phụ thuộc tín hiệu, số mẫu và thang đo, không phải "luôn luôn".' },
              { id: 'c', text: 'Số chiều chỉ ảnh hưởng tốc độ tính toán, không ảnh hưởng độ chính xác', correct: false, explanation: 'Sai — số chiều ảnh hưởng trực tiếp đến HÌNH HỌC khoảng cách, không chỉ tốc độ.' },
              { id: 'd', text: 'StandardScaler sẽ loại bỏ hoàn toàn ảnh hưởng của số chiều', correct: false, explanation: 'Scaling đưa các cột về cùng thang đo, nhưng KHÔNG xoá được hiện tượng distance concentration khi chiều tăng.' },
            ],
          },
          {
            question: '"Thêm feature luôn có hại cho model" — nhận định này SAI ở điểm nào?',
            options: [
              { id: 'a', text: 'Mức độ hại phụ thuộc tín hiệu, số mẫu, thang đo và metric khoảng cách — không phải bản thân số chiều', correct: true, explanation: 'Chính xác — đây là misconception cốt lõi của bài này (spec Step 2).' },
              { id: 'b', text: 'Nó đúng hoàn toàn, không có ngoại lệ', correct: false, explanation: 'Không — nếu feature mới mang tín hiệu thật và đủ mẫu, nó có thể giúp ích.' },
              { id: 'c', text: 'Nó chỉ sai khi dùng Random Forest', correct: false, explanation: 'Không liên quan đến 1 thuật toán cụ thể — đây là nguyên lý chung về dữ liệu và thí nghiệm.' },
              { id: 'd', text: 'Nó chỉ sai với bài toán regression, còn classification thì luôn đúng', correct: false, explanation: 'Hiện tượng distance concentration ảnh hưởng cả 2 loại bài toán như nhau — không phân biệt regression/classification.' },
            ],
          },
          {
            question: 'Trong 3 thí nghiệm dims=2/20/100 của bài này, YẾU TỐ nào được GIỮ CỐ ĐỊNH để so sánh có kiểm soát?',
            options: [
              { id: 'a', text: 'Số mẫu (320), seed sinh dữ liệu, và cấu hình KNN (n_neighbors=7) — chỉ số chiều thay đổi', correct: true, explanation: 'Đúng — đây là "controlled comparison": chỉ đổi đúng 1 biến.' },
              { id: 'b', text: 'Không có gì được giữ cố định — mọi thứ đều đổi cùng lúc', correct: false, explanation: 'Nếu vậy sẽ không thể quy kết chênh lệch cho riêng số chiều — đó chính là bẫy "unsafe-but-correct" bài này cảnh báo.' },
              { id: 'c', text: 'Chỉ có seed được giữ cố định, số mẫu và model có thể đổi tuỳ ý', correct: false, explanation: 'Nếu số mẫu hay cấu hình model đổi theo, kết luận "do số chiều" không còn căn cứ.' },
              { id: 'd', text: 'Số chiều được giữ cố định, chỉ số mẫu thay đổi', correct: false, explanation: 'Ngược lại — chính số CHIỀU là biến đang được khảo sát, nó phải THAY ĐỔI; các yếu tố khác mới là thứ giữ cố định.' },
            ],
          },
        ],
        mini_game: {
          title: 'Thực hành nào giữ ĐÚNG kiểm soát khi so sánh 2/20/100 chiều?',
          instruction: 'Xếp mỗi thực hành vào đúng nhóm.',
          chips: [
            { id: 'chip-oneload', label: 'Gọi load_dimension_experiment() đúng 1 lần, dùng chung 3 mức chiều nó trả về' },
            { id: 'chip-samek', label: 'Dùng CÙNG n_neighbors=7 cho cả 3 lần đánh giá KNN' },
            { id: 'chip-vark', label: 'Đổi n_neighbors nhỏ hơn khi số chiều lớn "cho công bằng"' },
            { id: 'chip-confound', label: 'Tăng số mẫu ĐỒNG THỜI với tăng số chiều rồi kết luận score đổi là do số chiều' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-oneload': 'dung', 'chip-samek': 'dung', 'chip-vark': 'sai', 'chip-confound': 'sai' },
          success_html: '✅ Chỉ đổi ĐÚNG MỘT biến (số chiều), giữ nguyên seed/số mẫu/cấu hình model — đó là controlled comparison thật sự.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Lắp pipeline Dimension Stress Test — nạp thí nghiệm khớp nhau, đo tương phản, fit CÙNG cấu hình KNN, ghi báo cáo.',
        blocks: [
          { type: 'py', token: 'from ml_lab import load_dimension_experiment', slot: 'z1a' },
          { type: 'py', token: 'experiments = load_dimension_experiment()', slot: 'z1b' },
          { type: 'py', token: 'D = pairwise_distances(item["X_probe"])', slot: 'z2a' },
          { type: 'py', token: 'model = Pipeline([("scale", StandardScaler()), ("knn", KNeighborsClassifier(n_neighbors=7))])', slot: 'z2b' },
          { type: 'py', token: 'model.fit(item["X_train"], item["y_train"])', slot: 'z3a' },
          { type: 'py', token: 'report.append({"dimensions": item["X_train"].shape[1], "distance_contrast": D[D>0].min()/D[D>0].max(), "validation_accuracy": model.score(item["X_val"], item["y_val"])})', slot: 'z3b' },
          /* 2 mồi bẫy — unsafe-but-correct của spec: đổi cấu hình model theo chiều /
             gọi lại loader mỗi vòng lặp (phá vỡ khớp seed giữa 3 mức chiều) */
          { type: 'py', token: 'model = Pipeline([("scale", StandardScaler()), ("knn", KNeighborsClassifier(n_neighbors=3 if item["X_train"].shape[1] > 50 else 7))])', slot: 't1' },
          { type: 'py', token: 'experiments = load_dimension_experiment(dims=(item["X_train"].shape[1],))', slot: 't2' },
        ],
        drop_zones: [
          { id: 'dim-source', accepts: ['py'], multi: true },
          { id: 'dim-measure', accepts: ['py'], multi: true },
          { id: 'dim-report', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'dim-source': 'from ml_lab import load_dimension_experiment experiments = load_dimension_experiment()',
          'dim-measure': 'D = pairwise_distances(item["X_probe"]) model = Pipeline([("scale", StandardScaler()), ("knn", KNeighborsClassifier(n_neighbors=7))])',
          'dim-report': 'model.fit(item["X_train"], item["y_train"]) report.append({"dimensions": item["X_train"].shape[1], "distance_contrast": D[D>0].min()/D[D>0].max(), "validation_accuracy": model.score(item["X_val"], item["y_val"])})',
        },
        reveal_hints: {
          'dim-source': 'Nạp 1 LẦN DUY NHẤT: <strong>experiments = load_dimension_experiment()</strong> — 3 mức chiều đã khớp seed sẵn bên trong.',
          'dim-measure': 'Đo khoảng cách bằng <strong>pairwise_distances</strong>, dựng model bằng <strong>Pipeline(StandardScaler, KNeighborsClassifier(n_neighbors=7))</strong> — CÙNG cấu hình cho cả 3 lần.',
          'dim-report': 'Fit CHỈ trên train, rồi <strong>report.append(...)</strong> đủ 3 khoá: dimensions, distance_contrast, validation_accuracy.',
        },
        ml_flow: {
          brand: 'DÒNG CHẢY DIMENSION STRESS TEST',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: '320 học sinh · 2 feature tín hiệu + tới 98 chiều nhiễu' },
          done_note: 'Thêm mẫu KHÔNG cứu được distance concentration — chỉ bỏ chiều nhiễu mới cứu được. Click lại trạm bất kỳ để xem lại, rồi sang Bước 4 tự viết code.',
          stations: [
            {
              zones: ['dim-source'],
              icon: '📐', label: 'BASELINE', sub: '2 chiều tín hiệu', result_kind: 'dim_stress',
              dim: { mode: 'baseline', dims: 2, n_samples: 320, contrast: 0.0068, accuracy: 0.7188 },
              narration: 'Với đúng 2 feature tín hiệu (focus_score, practice_score) và 320 học sinh, khoảng cách GẦN NHẤT chỉ bằng <b>0.007</b> lần khoảng cách XA NHẤT — rất tương phản. KNN (n_neighbors=7) đạt <b>72%</b> accuracy trên validation. Đây là điểm xuất phát để so sánh.',
            },
            {
              zones: ['dim-measure'],
              icon: '🌫️', label: 'THÊM NHIỄU', sub: '2 → 20 → 100 chiều', result_kind: 'dim_stress',
              dim: {
                mode: 'noise', n_samples: 320,
                items: [
                  { dims: 2, contrast: 0.0068, accuracy: 0.7188 },
                  { dims: 20, contrast: 0.3133, accuracy: 0.5312 },
                  { dims: 100, contrast: 0.6124, accuracy: 0.6146 },
                ],
              },
              narration: 'Giữ NGUYÊN 320 học sinh và cùng seed, chỉ THÊM chiều nhiễu (18 rồi 98 cột random, không liên quan pass_fail): tương phản gần/xa tăng từ <b>0.007 → 0.31 → 0.61</b> — "gần nhất" và "xa nhất" nhòe dần vào nhau. Đây LÀ distance concentration đang xảy ra thật.',
            },
            {
              zones: ['dim-report'],
              icon: '🔍', label: 'TÁCH HIỆU ỨNG', sub: 'thêm mẫu vs bỏ nhiễu', result_kind: 'dim_stress',
              dim: {
                mode: 'separate',
                add_samples: { dims: 100, from_n: 320, to_n: 1200, contrast_from: 0.6124, contrast_to: 0.5959, acc_from: 0.6146, acc_to: 0.5639 },
                remove_noise: { n_samples: 320, from_dims: 100, to_dims: 2, contrast_from: 0.6124, contrast_to: 0.0068, acc_from: 0.6146, acc_to: 0.7188 },
              },
              narration: '2 thí nghiệm riêng biệt, mỗi lần chỉ đổi 1 biến: THÊM mẫu (giữ 100 chiều nhiễu) gần như không cứu được gì — còn BỎ chiều nhiễu (giữ nguyên 320 mẫu) đưa tương phản về gần 0 và accuracy tăng rõ rệt. Kết luận: ở đây, SỐ CHIỀU — không phải số mẫu — là nguyên nhân.',
            },
          ],
        },
      },
      drag_map: {
        brand: 'DÒNG CHẢY DIMENSION STRESS TEST',
        table_sub: 'DataFrame nguồn · 2 feature tín hiệu + tới 98 chiều nhiễu',
        idle_sub: 'Bấm ▶ để chạy pipeline',
        run_label: '▶ Chạy Pipeline',
        table: {
          name: 'dimension_stress_suite',
          columns: ['focus_score', 'practice_score', 'pass_fail'],
          dataRows: [
            ['0.19', '-0.54', '1'],
            ['-0.94', '0.11', '1'],
            ['-1.14', '0.39', '0'],
            ['2.43', '0.51', '1'],
            ['-0.23', '0.30', '1'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Với <code>load_dimension_experiment()</code>, tính <code>distance_contrast</code> + <code>validation_accuracy</code> cho CẢ 3 mức chiều (2/20/100), lưu vào biến <code>report</code>.</p>',
        context: {
          scenario: 'StudyLab muốn biết: liệu bộ dữ liệu nhiều chiều mới có thật sự làm "tìm học viên tương tự" (KNN) khó hơn không — và nếu có, nguyên nhân là số chiều hay điều gì khác. Bạn cần một bằng chứng đo được, không phải cảm giác.',
          real_world: 'Giống việc một bác sĩ không kết luận "thuốc mới gây phản ứng" chỉ vì bệnh nhân đổi thuốc VÀ đổi chế độ ăn cùng lúc — phải tách riêng từng thay đổi mới quy được nguyên nhân.',
          steps: [
            'Nạp 3 thí nghiệm khớp nhau bằng <code>load_dimension_experiment()</code> — gọi ĐÚNG 1 LẦN.',
            'Với mỗi thí nghiệm, đo độ tương phản khoảng cách gần nhất/xa nhất trên tập probe.',
            'Fit CÙNG một cấu hình model (không đổi tham số theo số chiều) trên train, đánh giá trên validation.',
            'Ghi lại đủ 3 thông tin cho mỗi mức chiều: số chiều, độ tương phản, và độ chính xác.',
          ],
          hint_explore: 'Muốn xem cấu trúc dữ liệu? Gõ <code>print(load_dimension_experiment()[0].keys())</code> rồi Run.',
          expected: 'Biến `report` là 1 list gồm 3 dict (ứng với 2/20/100 chiều) — mỗi dict có 3 khoá: dimensions, distance_contrast, validation_accuracy.',
        },
        hints: [
          { level: 1, text: 'Nhập <code>from sklearn.metrics import pairwise_distances</code>, <code>from sklearn.pipeline import Pipeline</code>, <code>from sklearn.preprocessing import StandardScaler</code>, <code>from sklearn.neighbors import KNeighborsClassifier</code>, <code>from ml_lab import load_dimension_experiment</code>.' },
          { level: 2, text: 'Gọi <code>experiments = load_dimension_experiment()</code> đúng 1 lần rồi <code>for item in experiments:</code> — KHÔNG gọi lại loader bên trong vòng lặp.' },
          { level: 3, text: 'Trong vòng lặp: <code>D = pairwise_distances(item["X_probe"])</code>, lấy <code>nonzero = D[D > 0]</code>, <code>contrast = nonzero.min() / nonzero.max()</code>. Dựng <code>model = Pipeline([("scale", StandardScaler()), ("knn", KNeighborsClassifier(n_neighbors=7))])</code> — GIỮ NGUYÊN n_neighbors=7 cho cả 3 vòng lặp, rồi <code>model.fit(item["X_train"], item["y_train"])</code>.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>from sklearn.metrics import pairwise_distances<br>from sklearn.pipeline import Pipeline<br>from sklearn.preprocessing import StandardScaler<br>from sklearn.neighbors import KNeighborsClassifier<br>from ml_lab import load_dimension_experiment<br>experiments = load_dimension_experiment()<br>report = []<br>for item in experiments:<br>&nbsp;&nbsp;&nbsp;&nbsp;D = pairwise_distances(item["X_probe"])<br>&nbsp;&nbsp;&nbsp;&nbsp;nonzero = D[D > 0]<br>&nbsp;&nbsp;&nbsp;&nbsp;contrast = nonzero.min() / nonzero.max()<br>&nbsp;&nbsp;&nbsp;&nbsp;model = Pipeline([("scale", StandardScaler()), ("knn", KNeighborsClassifier(n_neighbors=7))])<br>&nbsp;&nbsp;&nbsp;&nbsp;model.fit(item["X_train"], item["y_train"])<br>&nbsp;&nbsp;&nbsp;&nbsp;report.append({"dimensions": item["X_train"].shape[1], "distance_contrast": contrast, "validation_accuracy": model.score(item["X_val"], item["y_val"])})<br>print(report)</code>' },
        ],
        grader_fn: 'grade_lesson_c3_1',
        success_message: 'Bạn vừa đo được distance concentration bằng một thí nghiệm CÓ KIỂM SOÁT — chỉ đổi số chiều, giữ nguyên mọi thứ khác. Đây là kỹ năng nền cho toàn bộ Course 3.',
        xp_reward: 65,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.metrics import pairwise_distances',
      },
    },

    {
      id: 'c3_l2',
      index: 2,
      title: 'PCA và principal components',
      subtitle: 'Căn giữa, xoay trục và chiếu dữ liệu vào hệ toạ độ ít chiều hơn',
      module: 1,
      module_title: 'M1 · High-Dimensional Representation',
      estimated_minutes: 23,
      xp_reward: 65,
      achievement: { name: 'Representation Builder', desc: 'Fit một PCA leakage-safe và đọc đúng ý nghĩa của thành phần chính.' },
      story: {
        tag: '🧬 StudyLab · Advanced Modeling Lab',
        hook: 'Bài trước bạn đã chẩn đoán: 100 chiều làm khoảng cách nhòe vào nhau. Giờ StudyLab muốn một biểu diễn GỌN hơn — 15 feature hành vi học tập nén về 2 toạ độ vẫn giữ được phần lớn "câu chuyện" của dữ liệu. Nhưng có người đề xuất: "cứ nén xong rồi mới chia train/validation cho tiện". Bài này bạn sẽ tự tay fit PCA đúng cách — và hiểu vì sao PCA không hề biết học sinh nào Đậu hay Rớt.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Phân biệt feature gốc, hướng thành phần chính, điểm thành phần (component score) và hệ số tải (loadings).',
            'Giải thích vì sao PCA cần căn giữa (centering), và khi nào cần chuẩn hoá (scaling) trước khi fit.',
            'Fit PCA CHỈ trên tập train rồi transform validation — không refit, không rò rỉ.',
          ],
        },
        glossary: [
          { term: 'Principal component', vi: 'Thành phần chính', accent: '#22D3EE', def: '1 hướng (trục) mới trong không gian dữ liệu, được chọn để nắm được LƯỢNG PHƯƠNG SAI lớn nhất, trực giao với các thành phần trước đó.', ex: 'PC1, PC2', out: 'components_' },
          { term: 'Explained variance ratio', vi: 'Tỉ lệ phương sai giải thích', accent: '#67E8F9', def: 'Phần trăm phương sai (độ trải rộng) của dữ liệu mà 1 thành phần chính nắm được — PC1 luôn nắm nhiều nhất.', ex: 'PC1 ≈ 61%, PC2 ≈ 18%', out: 'explained_variance_ratio_' },
          { term: 'Loadings', vi: 'Hệ số tải', accent: '#0891B2', def: 'Mức đóng góp của mỗi feature GỐC vào 1 thành phần chính — trị tuyệt đối càng lớn, feature đó càng "định hình" hướng của thành phần.', ex: 'login_freq tải mạnh nhất lên PC1', out: '' },
          { term: 'Centering', vi: 'Căn giữa dữ liệu', accent: '#67E8F9', def: 'Trừ đi giá trị trung bình của mỗi cột trước khi tìm hướng phương sai lớn nhất — PCA LUÔN cần bước này (StandardScaler làm sẵn).', ex: 'mean = 0 sau khi scale', out: '' },
          { term: 'Component score', vi: 'Điểm thành phần', accent: '#A5F3FC', def: 'Toạ độ của 1 mẫu sau khi chiếu (project) lên các thành phần chính — đây là "toạ độ mới" thay cho feature gốc.', ex: 'Z_train.shape = (210, 2)', out: '' },
          { term: 'Leakage-safe transform', vi: 'Biến đổi không rò rỉ', accent: '#22D3EE', def: 'Fit scaler + PCA CHỈ trên tập train, rồi dùng transform() (không fit lại) cho tập validation/test.', ex: 'scaler.fit(X_train) → scaler.transform(X_val)', out: '' },
        ],
        primer: {
          goal: [
            'Kéo góc xoay trục — tìm hướng nắm được nhiều phương sai nhất trên 1 cặp feature tương quan.',
            'Fit StandardScaler + PCA(2) CHỈ trên train, transform cả 2 tập, đọc top loadings mỗi thành phần.',
          ],
          intro: '<p>PCA không "hiểu" dữ liệu của bạn theo nghĩa dự đoán — nó chỉ tìm những HƯỚNG mà dữ liệu trải rộng nhất, rồi mô tả mỗi điểm bằng toạ độ trên các hướng đó. Bài này bạn tự xoay 1 trục để CẢM NHẬN việc "tìm phương sai lớn nhất" nghĩa là gì, trước khi để scikit-learn làm việc đó trên 15 chiều thật.</p>',
          example: '',
        },
        intro: '15 feature hành vi học tập — nén về 2 toạ độ mà không đánh mất câu chuyện.',
        concept_cards: [
          { icon: 'fa-compass', title: 'PCA không nhìn nhãn', body: 'PCA là unsupervised — nó chỉ tìm hướng phương sai lớn nhất, không hề biết pass_fail là gì. Giữ nhiều phương sai không đồng nghĩa giữ ranh giới phân loại.' },
          { icon: 'fa-ruler-combined', title: 'Đơn vị lệch nhau phải chuẩn hoá', body: 'session_len_min dao động ±35, ontime_submit_rate chỉ ±0.3 — nếu không StandardScaler trước, PCA sẽ chỉ "nhìn thấy" feature có thang đo lớn nhất.' },
          { icon: 'fa-lock', title: 'Fit trên train, transform validation', body: 'Học (fit) hướng phương sai CHỈ từ train; validation chỉ được transform() vào hệ toạ độ đã học — refit trên cả hai là rò rỉ.' },
        ],
        pca_lens: {
          title: 'ỐNG KÍNH XOAY TRỤC',
          intro: 'Kéo góc θ — tìm hướng trục nắm được nhiều "phương sai" nhất trên 2 feature tương quan (r ≈ 0.885).',
          points: [
            [0.37, 0.42], [-0.01, -0.16], [0.94, 0.36], [-0.25, -0.80], [0.40, -0.55], [0.54, 0.67], [1.43, 1.67], [0.50, 1.34], [0.63, -0.39], [-0.57, -0.11],
            [0.11, 0.01], [-0.49, 0.27], [-0.29, -0.92], [0.75, 0.08], [-1.20, -0.61], [0.46, 0.68], [0.92, 1.13], [-0.13, -0.96], [0.54, 0.75], [0.58, 0.25],
            [-0.46, -0.08], [2.85, 2.84], [1.03, 1.28], [-0.34, -0.67], [1.24, 1.04], [-0.50, 0.22], [-0.73, -0.65], [-1.03, -1.27], [0.53, 1.31], [-0.12, -0.35],
            [0.80, 1.10], [0.15, 0.22], [-0.52, -1.28], [0.10, -0.38], [-0.32, -0.77], [-0.37, -0.84], [0.45, 0.62], [-1.33, -1.05], [-1.66, -1.44], [-0.02, -0.77],
            [-0.51, -0.64], [1.19, 0.58], [0.03, -0.77], [1.80, 1.22], [0.04, 0.87], [-1.91, -1.37], [1.52, 1.22], [-0.47, -0.84], [0.66, 0.28], [0.68, -0.18],
            [-1.77, -1.84], [-0.46, -0.41], [-0.33, 0.51], [0.65, 0.79], [-0.43, -0.57], [-0.83, -0.66], [0.63, 0.39], [-0.67, -0.61], [0.91, 0.96], [-0.98, -0.47],
          ],
          angles: [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180],
          variance_ratio: [0.5, 0.7213, 0.8834, 0.9427, 0.8834, 0.7213, 0.5, 0.2787, 0.1166, 0.0573, 0.1166, 0.2787, 0.5],
          best_angle: 45,
          riddle: {
            prompt: 'Góc trục θ nào bắt được NHIỀU phương sai nhất trên đám mây điểm này?',
            options: [0, 45, 90, 135],
            answer: 45,
            wrong: {
              '0': 'θ=0° chỉ là trục X gốc — chỉ bắt được 50% phương sai, chưa xoay theo hướng trải rộng thật của dữ liệu.',
              '90': 'θ=90° là trục Y gốc — cũng chỉ 50%, đối xứng với θ=0°, không phải hướng trải rộng nhất.',
              '135': 'θ=135° vuông góc với hướng trải rộng thật — đây là hướng bắt được ÍT phương sai NHẤT (5.7%), ngược hẳn với điều cần tìm.',
            },
            done: '✅ Đúng — θ=45° bắt được 94.3% phương sai, đây chính là hướng PC1 thật của cặp feature này. PCA luôn chọn hướng này một cách tự động, không cần dò tay.',
          },
        },
        visual: {
          schema: {
            table_name: 'pca_student_behavior_splits',
            columns: [
              { name: 'login_freq', type: 'FLOAT', key: '' },
              { name: 'video_watch_min', type: 'FLOAT', key: '' },
              { name: 'ontime_submit_rate', type: 'FLOAT', key: '' },
              { name: '⋯ 12 feature khác', type: 'FLOAT × 12', key: '' },
            ],
          },
          data_preview: [
            ['1.98', '0.73', '-0.00', '⋯'],
            ['-0.55', '1.15', '0.09', '⋯'],
            ['2.89', '5.58', '0.01', '⋯'],
            ['-2.61', '1.11', '-0.03', '⋯'],
            ['-0.65', '-0.39', '-0.07', '⋯'],
          ],
        },
        mission: 'Fit StandardScaler + PCA(2) CHỈ trên train, transform cả 2 tập, đọc top loadings mỗi thành phần.',
      },
      step_2: {
        mcq: [
          {
            question: 'PC1 (thành phần chính thứ nhất) luôn có đặc điểm gì?',
            options: [
              { id: 'a', text: 'Nắm được LƯỢNG PHƯƠNG SAI lớn nhất trong toàn bộ dữ liệu', correct: true, explanation: 'Đúng — đây là định nghĩa của PC1, không liên quan đến nhãn.' },
              { id: 'b', text: 'Luôn trùng với feature gốc có tên đầu tiên trong DataFrame', correct: false, explanation: 'PC1 là TỔ HỢP của nhiều feature gốc (qua loadings), không phải 1 feature có sẵn.' },
              { id: 'c', text: 'Luôn tương ứng với feature liên quan nhiều nhất đến nhãn cần dự đoán', correct: false, explanation: 'PCA không nhìn nhãn — PC1 chỉ liên quan đến PHƯƠNG SAI, không liên quan gì đến pass_fail.' },
              { id: 'd', text: 'Chỉ tồn tại khi dữ liệu đã được gắn nhãn', correct: false, explanation: 'PCA là unsupervised — hoàn toàn không cần nhãn để tính PC1.' },
            ],
          },
          {
            question: 'Một model Logistic Regression train trên 2 thành phần chính (giữ 80% phương sai) lại có accuracy THẤP HƠN hẳn so với train trên feature gốc. Vì sao có thể xảy ra?',
            options: [
              { id: 'a', text: 'PCA tối ưu theo PHƯƠNG SAI, không theo khả năng phân tách lớp — hướng phương sai cao nhất có thể không phải hướng tách 2 lớp tốt nhất', correct: true, explanation: 'Chính xác — đây là misconception cốt lõi của bài này: giữ variance ≠ giữ decision boundary.' },
              { id: 'b', text: 'PCA bị lỗi — về nguyên tắc luôn phải cho accuracy cao hơn feature gốc', correct: false, explanation: 'Không có gì đảm bảo điều đó — PCA không được thiết kế để tối ưu accuracy phân loại.' },
              { id: 'c', text: 'Vì đã dùng sai nhãn khi fit PCA', correct: false, explanation: 'PCA không hề dùng nhãn ở bước fit — "dùng sai nhãn" không áp dụng được ở đây.' },
              { id: 'd', text: 'Vì centering làm mất thông tin của nhãn', correct: false, explanation: 'Centering chỉ dịch chuyển gốc toạ độ của FEATURE — không đụng đến nhãn theo bất kỳ cách nào.' },
            ],
          },
          {
            question: 'Thứ tự pipeline nào ĐÚNG để tránh rò rỉ khi dùng PCA?',
            options: [
              { id: 'a', text: 'Chia train/validation → fit StandardScaler + PCA trên train → transform() cả train và validation', correct: true, explanation: 'Đúng — đây là leakage-safe transform.' },
              { id: 'b', text: 'Fit StandardScaler + PCA trên TOÀN BỘ dữ liệu → rồi mới chia train/validation', correct: false, explanation: 'Rò rỉ — lúc fit, thông tin của validation đã "ngấm" vào scaler/PCA trước khi được chia ra.' },
              { id: 'c', text: 'Fit riêng StandardScaler + PCA cho train và một bộ khác cho validation', correct: false, explanation: 'Sai — 2 bộ tham số khác nhau tạo ra 2 hệ toạ độ KHÁC NHAU, train và validation không còn so sánh được.' },
              { id: 'd', text: 'Chia train/validation → fit trên validation trước vì validation nhỏ hơn, train sau', correct: false, explanation: 'Ngược lại — luôn fit trên TRAIN, validation chỉ transform() bằng tham số đã học từ train.' },
            ],
          },
        ],
        mini_game: {
          title: 'Thực hành nào giữ ĐÚNG kỷ luật khi dùng PCA?',
          instruction: 'Xếp mỗi thực hành vào đúng nhóm.',
          chips: [
            { id: 'chip-fittrain', label: 'Fit StandardScaler + PCA CHỈ trên X_train' },
            { id: 'chip-transval', label: 'Dùng .transform() (không fit lại) cho X_val' },
            { id: 'chip-combofit', label: 'Gộp X_train và X_val rồi mới fit PCA "cho đủ dữ liệu"' },
            { id: 'chip-labelpick', label: 'Chọn số component dựa trên nhãn pass_fail để "tối ưu accuracy"' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-fittrain': 'dung', 'chip-transval': 'dung', 'chip-combofit': 'sai', 'chip-labelpick': 'sai' },
          success_html: '✅ Fit CHỈ trên train, transform validation — và không bao giờ dùng nhãn để "chọn" component, vì PCA hoàn toàn unsupervised.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Lắp pipeline PCA leakage-safe — fit StandardScaler+PCA trên train, transform cả 2 tập.',
        blocks: [
          { type: 'py', token: 'X_train, X_val, feature_names = load_pca_splits()', slot: 'z1a' },
          { type: 'py', token: 'scaler = StandardScaler().fit(X_train)', slot: 'z1b' },
          { type: 'py', token: 'X_train_s = scaler.transform(X_train)', slot: 'z2a' },
          { type: 'py', token: 'pca = PCA(n_components=2, random_state=42).fit(X_train_s)', slot: 'z2b' },
          { type: 'py', token: 'X_val_s = scaler.transform(X_val)', slot: 'z3a' },
          { type: 'py', token: 'Z_train, Z_val = pca.transform(X_train_s), pca.transform(X_val_s)', slot: 'z3b' },
          /* 2 mồi bẫy — unsafe-but-correct của spec: fit scaler/PCA trên train+validation gộp lại */
          { type: 'py', token: 'scaler = StandardScaler().fit(np.vstack([X_train, X_val]))', slot: 't1' },
          { type: 'py', token: 'pca = PCA(n_components=2, random_state=42).fit(X_val_s)', slot: 't2' },
        ],
        drop_zones: [
          { id: 'pca-load', accepts: ['py'], multi: true },
          { id: 'pca-fit', accepts: ['py'], multi: true },
          { id: 'pca-transform', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'pca-load': 'X_train, X_val, feature_names = load_pca_splits() scaler = StandardScaler().fit(X_train)',
          'pca-fit': 'X_train_s = scaler.transform(X_train) pca = PCA(n_components=2, random_state=42).fit(X_train_s)',
          'pca-transform': 'X_val_s = scaler.transform(X_val) Z_train, Z_val = pca.transform(X_train_s), pca.transform(X_val_s)',
        },
        reveal_hints: {
          'pca-load': 'Nạp dữ liệu rồi fit scaler CHỈ trên <strong>X_train</strong>: <strong>StandardScaler().fit(X_train)</strong>.',
          'pca-fit': 'Chuẩn hoá train trước, rồi fit PCA CHỈ trên đó: <strong>PCA(n_components=2, random_state=42).fit(X_train_s)</strong>.',
          'pca-transform': 'Validation CHỈ <strong>transform()</strong> — không fit lại — bằng scaler VÀ pca đã học từ train.',
        },
        ml_flow: {
          brand: 'DÒNG CHẢY PCA TRANSFORMER',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: '300 học sinh · 15 feature hành vi học tập (đơn vị lệch nhau)' },
          done_note: 'PC1/PC2 học từ TRAIN, validation chỉ đi vào hệ toạ độ có sẵn — không refit. Click lại trạm bất kỳ để xem lại, rồi sang Bước 4 tự viết code.',
          stations: [
            {
              zones: ['pca-load'],
              icon: '📏', label: 'ĐƠN VỊ', sub: 'thang đo lệch nhau', result_kind: 'pca_transform',
              pca: {
                mode: 'units',
                ranges: [
                  { name: 'session_len_min', range: '-35 → +31', pct: 100 },
                  { name: 'video_watch_min', range: '-17 → +16', pct: 50 },
                  { name: 'ontime_submit_rate', range: '-0.3 → +0.3', pct: 1 },
                ],
              },
              narration: 'session_len_min dao động ±35 trong khi ontime_submit_rate chỉ ±0.3 — chênh nhau hơn 100 lần. Nếu fit PCA trực tiếp trên dữ liệu thô, thành phần chính sẽ chỉ "nhìn thấy" session_len_min. Quyết định: chuẩn hoá (StandardScaler) TRƯỚC khi fit PCA.',
            },
            {
              zones: ['pca-fit'],
              icon: '🧭', label: 'FIT PCA', sub: 'trên 210 học sinh train', result_kind: 'pca_transform',
              pca: { mode: 'fit', n_train: 210, evr: [0.615, 0.180], top1: ['login_freq', 'ontime_submit_rate'] },
              narration: 'Sau khi chuẩn hoá, PCA(2) fit CHỈ trên 210 học sinh train: PC1 nắm 61.5% phương sai, tải mạnh nhất lên login_freq (nhóm "mức độ tương tác"). PC2 nắm 18.0%, tải mạnh nhất lên ontime_submit_rate (nhóm "tính đều đặn"). Không hề dùng nhãn pass_fail ở bước này.',
            },
            {
              zones: ['pca-transform'],
              icon: '🔒', label: 'TRANSFORM VALIDATION', sub: 'không refit', result_kind: 'pca_transform',
              pca: { mode: 'transform', shapes: [[210, 2], [90, 2]] },
              narration: '90 học sinh validation được transform() vào ĐÚNG hệ toạ độ (PC1, PC2) đã học từ train — không fit lại. Đây là điểm khác biệt giữa "đánh giá trung thực" và "biểu đồ đẹp nhờ rò rỉ".',
            },
          ],
        },
      },
      drag_map: {
        brand: 'DÒNG CHẢY PCA TRANSFORMER',
        table_sub: 'DataFrame nguồn · 15 feature hành vi học tập',
        idle_sub: 'Bấm ▶ để chạy pipeline',
        run_label: '▶ Chạy Pipeline',
        table: {
          name: 'pca_student_behavior_splits',
          columns: ['login_freq', 'video_watch_min', 'ontime_submit_rate'],
          dataRows: [
            ['1.98', '0.73', '-0.00'],
            ['-0.55', '1.15', '0.09'],
            ['2.89', '5.58', '0.01'],
            ['-2.61', '1.11', '-0.03'],
            ['-0.65', '-0.39', '-0.07'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Fit <code>StandardScaler</code> + <code>PCA(n_components=2)</code> CHỈ trên <code>X_train</code>, transform cả 2 tập, và in shape + top loadings mỗi thành phần.</p>',
        context: {
          scenario: 'StudyLab muốn một bảng điều khiển gọn — thay vì nhìn 15 con số mỗi học sinh, chỉ cần 2 toạ độ vẫn giữ được phần lớn "câu chuyện" hành vi học tập. Nhưng bảng điều khiển đó phải áp dụng ĐÚNG cho học sinh mới (validation) mà không "nhìn trộm" trước.',
          real_world: 'Giống việc một thợ may đo số đo CỐ ĐỊNH từ 1 nhóm khách hàng để dựng bảng size — rồi áp bảng size đó cho khách MỚI, chứ không đo lại số đo trung bình mỗi khi có khách mới ghé (nếu không, bảng size sẽ trôi liên tục và không còn ý nghĩa để so sánh).',
          steps: [
            'Nạp dữ liệu bằng <code>load_pca_splits()</code>.',
            'Học phép chuẩn hoá CHỈ từ tập train, rồi áp dụng cho cả 2 tập.',
            'Học 2 hướng phương sai lớn nhất CHỈ từ tập train (đã chuẩn hoá).',
            'Áp phép chiếu đã học cho CẢ 2 tập — không học lại lần 2 trên tập còn lại. In shape của 2 tập sau khi chiếu, và feature nào đóng góp mạnh nhất cho mỗi hướng.',
          ],
          hint_explore: 'Muốn xem tên 15 feature? Gõ <code>_, _, feature_names = load_pca_splits(); print(feature_names)</code> rồi Run.',
          expected: 'Biến `Z_train` shape (210, 2), `Z_val` shape (90, 2); `pca.components_` có 2 hàng; PC1 tải mạnh nhất lên login_freq, PC2 lên ontime_submit_rate.',
        },
        hints: [
          { level: 1, text: 'Nhập <code>from sklearn.preprocessing import StandardScaler</code>, <code>from sklearn.decomposition import PCA</code>, <code>from ml_lab import load_pca_splits</code>.' },
          { level: 2, text: '<code>X_train, X_val, feature_names = load_pca_splits()</code> — fit <code>scaler = StandardScaler().fit(X_train)</code> — CHỈ trên X_train.' },
          { level: 3, text: '<code>X_train_s = scaler.transform(X_train)</code>, <code>X_val_s = scaler.transform(X_val)</code>. Rồi <code>pca = PCA(n_components=2, random_state=42).fit(X_train_s)</code> — CHỈ fit trên X_train_s, KHÔNG fit lại trên X_val_s.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>from sklearn.preprocessing import StandardScaler<br>from sklearn.decomposition import PCA<br>from ml_lab import load_pca_splits<br>X_train, X_val, feature_names = load_pca_splits()<br>scaler = StandardScaler().fit(X_train)<br>X_train_s = scaler.transform(X_train)<br>X_val_s = scaler.transform(X_val)<br>pca = PCA(n_components=2, random_state=42).fit(X_train_s)<br>Z_train = pca.transform(X_train_s)<br>Z_val = pca.transform(X_val_s)<br>for pc_index, row in enumerate(pca.components_, start=1):<br>&nbsp;&nbsp;&nbsp;&nbsp;top = np.argsort(np.abs(row))[::-1][:3]<br>&nbsp;&nbsp;&nbsp;&nbsp;print(pc_index, [(feature_names[i], float(row[i])) for i in top])<br>print(Z_train.shape, Z_val.shape)</code>' },
        ],
        grader_fn: 'grade_lesson_c3_2',
        success_message: 'Bạn vừa fit một PCA leakage-safe — học hướng phương sai CHỈ từ train, áp dụng trung thực cho validation. PC1/PC2 giờ đóng vai trò "toạ độ mới" gọn hơn 15 feature gốc.',
        xp_reward: 65,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.preprocessing import StandardScaler',
      },
    },

    {
      id: 'c3_l3',
      index: 3,
      title: 'Explained variance và chọn số chiều',
      subtitle: 'Phương sai tích luỹ, trade-off nén dữ liệu và bằng chứng validation',
      module: 1,
      module_title: 'M1 · High-Dimensional Representation',
      estimated_minutes: 23,
      xp_reward: 65,
      achievement: { name: 'Compression Strategist', desc: 'Chọn số chiều PCA bằng bằng chứng validation, không phải con số tuỳ tiện.' },
      story: {
        tag: '🧬 StudyLab · Advanced Modeling Lab',
        hook: 'Bài trước bạn đã học fit PCA đúng cách. Nhưng "PCA(2)" là do bạn TỰ CHỌN — StudyLab có 40 feature hành vi, vậy nên giữ bao nhiêu thành phần? Một đồng nghiệp đề xuất: "cứ giữ 95% phương sai là chắc ăn". Bài này bạn sẽ khám phá một sự thật khó chịu: tín hiệu quyết định pass_fail của StudyLab lại nằm ở đúng những thành phần phương sai THẤP NHẤT — 95% phương sai không tự động nghĩa là "đủ tốt".',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Đọc explained_variance_ratio_ và phương sai tích luỹ (cumulative) để hiểu "phổ" thông tin của dữ liệu.',
            'Tìm số component NHỎ NHẤT đạt một ngưỡng phương sai cho trước.',
            'So sánh compression, reconstruction và validation để chọn số chiều có BẰNG CHỨNG — không đoán mù.',
          ],
        },
        glossary: [
          { term: 'Explained variance ratio', vi: 'Tỉ lệ phương sai giải thích (từng thành phần)', accent: '#22D3EE', def: 'Phần trăm phương sai mà RIÊNG 1 thành phần chính nắm được — giảm dần từ PC1 trở đi.', ex: 'PC1 ≈ 41%, PC2 ≈ 25%', out: 'explained_variance_ratio_' },
          { term: 'Cumulative explained variance', vi: 'Phương sai tích luỹ', accent: '#67E8F9', def: 'Tổng dồn tỉ lệ phương sai của N thành phần đầu tiên — càng nhiều thành phần, càng tiến gần 100%.', ex: 'n=4 → 92.0%', out: 'np.cumsum(evr)' },
          { term: 'Scree plot', vi: 'Biểu đồ phổ phương sai', accent: '#0891B2', def: 'Biểu đồ cột thể hiện phương sai của từng thành phần theo thứ tự giảm dần — dùng để "nhìn" xem thông tin tập trung ở đâu.', ex: '', out: '' },
          { term: 'Reconstruction', vi: 'Tái tạo dữ liệu', accent: '#67E8F9', def: 'Chiếu ngược từ không gian nén (Z) về lại không gian gốc — càng giữ nhiều thành phần, tái tạo càng gần bản gốc.', ex: '', out: '' },
          { term: 'Downstream validation probe', vi: 'Đầu dò validation phía sau', accent: '#A5F3FC', def: 'Một model CỐ ĐỊNH (không đổi cấu hình) dùng để đo xem 1 biểu diễn nén còn hữu ích cho nhãn hay không.', ex: 'validate_pca_representation()', out: '' },
          { term: 'Selection hygiene', vi: 'Kỷ luật khi chọn siêu tham số', accent: '#22D3EE', def: 'Chọn số component dựa trên train/validation — KHÔNG BAO GIỜ dựa trên tập test, dù chỉ để "thử xem sao".', ex: '', out: '' },
        ],
        primer: {
          goal: [
            'Kéo stepper thêm dần component — quan sát thanh phương sai tích luỹ đầy dần tới 3 vạch mốc 80/90/95%.',
            'Fit full PCA trên train, tính phương sai tích luỹ, chọn n_components nhỏ nhất đạt ngưỡng, rồi kiểm tra bằng validation.',
          ],
          intro: '<p>"Giữ 95% phương sai" nghe rất chắc chắn — nhưng phương sai được tính từ CHÍNH các feature, không biết gì về nhãn pass_fail. Bài này StudyLab cố tình giấu tín hiệu nhãn vào 2 thành phần phương sai THẤP nhất, để bạn tự đo xem "giữ nhiều phương sai" và "giữ được tín hiệu hữu ích" có phải luôn là một hay không.</p>',
          example: '',
        },
        intro: '40 feature, 6 nhân tố ẩn — tín hiệu nhãn núp ở đâu?',
        concept_cards: [
          { icon: 'fa-backpack', title: 'Phương sai tích luỹ, không phải phép màu', body: 'Cumulative variance chỉ đo dữ liệu TRẢI RỘNG bao nhiêu — không đo dữ liệu đó có liên quan đến nhãn hay không.' },
          { icon: 'fa-triangle-exclamation', title: '95% là lựa chọn, không phải luật', body: 'Không có quy luật toán học nào bắt buộc ngưỡng 95%. Hướng phương sai thấp vẫn có thể mang tín hiệu quan trọng cho nhãn.' },
          { icon: 'fa-lock', title: 'Chọn bằng validation, không phải test', body: 'So sánh nhiều n_components trên train/validation là hợp lệ — nhưng test phải được NIÊM PHONG, không dùng để dò số.' },
        ],
        variance_lens: {
          title: 'BA LÔ TÍCH LUỸ PHƯƠNG SAI',
          intro: 'Kéo stepper — thêm dần component, xem "ba lô" tích luỹ phương sai đầy tới đâu.',
          cumulative: [0.4141, 0.6599, 0.8321, 0.92, 0.9596, 0.9768, 0.9791, 0.9808, 0.9824, 0.9839, 0.9852, 0.9864, 0.9874, 0.9884, 0.9893],
          targets: [0.80, 0.90, 0.95],
          riddle: {
            prompt: 'Số component NHỎ NHẤT vượt mốc 90% phương sai tích luỹ là bao nhiêu?',
            options: [3, 4, 5],
            answer: 4,
            wrong: {
              '3': 'n=3 chỉ đạt 83.2% — CHƯA vượt mốc 90%. Kéo slider thêm 1 nấc để kiểm tra lại.',
              '5': 'n=5 đã vượt mốc 90% (đạt 96.0%) nhưng KHÔNG PHẢI số nhỏ nhất — n=4 đã đạt 92.0%, vượt mốc từ trước đó.',
            },
            done: '✅ Đúng — n=4 đạt 92.0% phương sai tích luỹ, là số component NHỎ NHẤT vượt mốc 90%. Nhưng "vượt mốc phương sai" mới chỉ là 1 nửa câu chuyện — sang Bước 2 xem tín hiệu nhãn nằm ở đâu.',
          },
        },
        visual: {
          schema: {
            table_name: 'pca_selection_splits',
            columns: [
              { name: 'feat_01', type: 'FLOAT', key: '' },
              { name: 'feat_02', type: 'FLOAT', key: '' },
              { name: '⋯ 38 feature khác', type: 'FLOAT × 38', key: '' },
              { name: 'pass_fail', type: 'INT · 0/1', key: 'TARGET' },
            ],
          },
          data_preview: [
            ['-12.15', '2.95', '⋯', '0'],
            ['-4.29', '-1.46', '⋯', '1'],
            ['5.35', '5.08', '⋯', '0'],
            ['5.05', '1.40', '⋯', '1'],
            ['-0.87', '0.10', '⋯', '0'],
          ],
        },
        mission: 'Fit full PCA trên train, tính phương sai tích luỹ, chọn n_components nhỏ nhất đạt 90%, kiểm tra bằng validate_pca_representation().',
      },
      step_2: {
        mcq: [
          {
            question: '"Giữ 95% phương sai tích luỹ luôn là lựa chọn an toàn cho mọi bài toán." Nhận định này SAI ở điểm nào?',
            options: [
              { id: 'a', text: '95% chỉ là một LỰA CHỌN THIẾT KẾ phổ biến, không phải quy luật toán học — hướng phương sai thấp vẫn có thể mang tín hiệu quan trọng cho nhãn', correct: true, explanation: 'Đúng — đây chính là misconception cốt lõi của bài, minh hoạ bằng dữ liệu StudyLab.' },
              { id: 'b', text: 'Nó đúng hoàn toàn — phương sai càng cao thì nhãn càng dễ dự đoán', correct: false, explanation: 'Sai — phương sai đo dữ liệu TRẢI RỘNG, không đo LIÊN QUAN đến nhãn. 2 khái niệm độc lập nhau.' },
              { id: 'c', text: 'Nó chỉ sai với bài toán regression, classification thì luôn đúng', correct: false, explanation: 'Không liên quan đến loại bài toán — PCA là bước tiền xử lý unsupervised, áp dụng như nhau.' },
              { id: 'd', text: 'Nó chỉ sai khi dữ liệu có ít hơn 10 feature', correct: false, explanation: 'Không liên quan đến số lượng feature — vấn đề là hướng phương sai cao nhất không nhất thiết là hướng hữu ích cho nhãn.' },
            ],
          },
          {
            question: 'Ở dữ liệu StudyLab bài này: n=3 (mốc 80%) cho validation accuracy chỉ ~50%, còn n=4 (mốc 90%) nhảy vọt lên ~80%. Điều này cho thấy gì?',
            options: [
              { id: 'a', text: 'Thành phần thứ 4 mang một phần tín hiệu quan trọng cho nhãn — dù nó không nằm trong 3 thành phần phương sai cao nhất', correct: true, explanation: 'Chính xác — quan sát trực tiếp từ engine: tín hiệu nhãn núp ở thành phần phương sai thấp hơn.' },
              { id: 'b', text: 'n=3 luôn là lựa chọn tệ trong mọi bài toán PCA', correct: false, explanation: 'Không tổng quát hoá được — kết quả này riêng cho cấu trúc tín hiệu của dữ liệu StudyLab, không phải quy luật chung.' },
              { id: 'c', text: 'PCA bị lỗi khi n=3', correct: false, explanation: 'PCA hoạt động đúng — nó chỉ đơn giản không được thiết kế để ưu tiên feature liên quan đến nhãn.' },
              { id: 'd', text: 'Cần dùng tập test để xác nhận n=4 là lựa chọn tốt nhất', correct: false, explanation: 'Không — validation là đủ để so sánh các lựa chọn; test phải được NIÊM PHONG, không dùng để dò n_components.' },
            ],
          },
          {
            question: 'Cách chọn n_components nào dưới đây là AN TOÀN (không rò rỉ, không dò test)?',
            options: [
              { id: 'a', text: 'Suy ra n_components từ một ngưỡng phương sai tích luỹ ĐÃ ĐỊNH TRƯỚC (vd 90%), rồi xác nhận bằng validation', correct: true, explanation: 'Đúng — đây là quy trình leakage-safe và không tự-tối-ưu-hoá quá mức trên 1 tập dữ liệu.' },
              { id: 'b', text: 'Thử lần lượt nhiều n_components, đo accuracy trên TẬP TEST, chọn số cho accuracy cao nhất', correct: false, explanation: 'Đây chính là "test tuning" — test không còn là bằng chứng độc lập sau khi bị dùng để chọn siêu tham số.' },
              { id: 'c', text: 'Luôn chọn n_components = số feature gốc để "an toàn tuyệt đối"', correct: false, explanation: 'Vậy thì không còn nén dữ liệu — mất hết lợi ích compression của PCA.' },
              { id: 'd', text: 'Chọn ngẫu nhiên rồi không kiểm tra lại', correct: false, explanation: 'Không có bằng chứng nào hỗ trợ lựa chọn ngẫu nhiên — vi phạm MS-4 (downstream validation).' },
            ],
          },
        ],
        mini_game: {
          title: 'Cách chọn n_components nào giữ ĐÚNG kỷ luật?',
          instruction: 'Xếp mỗi thực hành vào đúng nhóm.',
          chips: [
            { id: 'chip-thresh', label: 'Suy ra n_components từ ngưỡng phương sai đã định trước (vd 90%)' },
            { id: 'chip-validate', label: 'Xác nhận lựa chọn bằng validate_pca_representation() trên validation' },
            { id: 'chip-testtune', label: 'Thử nhiều n_components, chọn số cho accuracy TEST cao nhất' },
            { id: 'chip-hardcode', label: 'Gán cứng n_components = 8 vì "nhìn có vẻ ổn"' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-thresh': 'dung', 'chip-validate': 'dung', 'chip-testtune': 'sai', 'chip-hardcode': 'sai' },
          success_html: '✅ Suy ra số component từ 1 ngưỡng đã định trước, xác nhận bằng validation — không dò trên test, không gán cứng theo cảm tính.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Lắp pipeline chọn n_components — fit full PCA, tính phương sai tích luỹ, chọn ngưỡng, refit và kiểm tra validation.',
        blocks: [
          { type: 'py', token: 'X_train, X_val, y_train, y_val = load_pca_selection_data()', slot: 'z1a' },
          { type: 'py', token: 'full = PCA().fit(scaler.transform(X_train))', slot: 'z1b' },
          { type: 'py', token: 'cumulative = np.cumsum(full.explained_variance_ratio_)', slot: 'z2a' },
          { type: 'py', token: 'n_components = int(np.searchsorted(cumulative, 0.90) + 1)', slot: 'z2b' },
          { type: 'py', token: 'final_pca = PCA(n_components=n_components).fit(scaler.transform(X_train))', slot: 'z3a' },
          { type: 'py', token: 'validate_pca_representation(Z_train, Z_val, y_train, y_val)', slot: 'z3b' },
          /* 2 mồi bẫy — unsafe-but-correct của spec: chọn n_components CỨNG (test-tuning smell) */
          { type: 'py', token: 'n_components = 8', slot: 't1' },
          { type: 'py', token: 'full = PCA().fit(scaler.transform(np.vstack([X_train, X_val])))', slot: 't2' },
        ],
        drop_zones: [
          { id: 'var-spectrum', accepts: ['py'], multi: true },
          { id: 'var-target', accepts: ['py'], multi: true },
          { id: 'var-validate', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'var-spectrum': 'X_train, X_val, y_train, y_val = load_pca_selection_data() full = PCA().fit(scaler.transform(X_train))',
          'var-target': 'cumulative = np.cumsum(full.explained_variance_ratio_) n_components = int(np.searchsorted(cumulative, 0.90) + 1)',
          'var-validate': 'final_pca = PCA(n_components=n_components).fit(scaler.transform(X_train)) validate_pca_representation(Z_train, Z_val, y_train, y_val)',
        },
        reveal_hints: {
          'var-spectrum': 'Nạp dữ liệu, fit <strong>full PCA</strong> (không giới hạn n_components) CHỈ trên train đã chuẩn hoá.',
          'var-target': 'Tính <strong>cumulative = np.cumsum(...)</strong>, suy ra <strong>n_components</strong> từ ngưỡng — KHÔNG gán cứng con số.',
          'var-validate': 'Refit PCA cuối với đúng n_components, rồi <strong>validate_pca_representation(...)</strong> để có bằng chứng validation.',
        },
        ml_flow: {
          brand: 'DÒNG CHẢY COMPRESSION TRADE-OFF',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: '400 học sinh · 40 feature (6 nhân tố ẩn, phương sai giảm dần)' },
          done_note: 'n=4 (mốc 90%) cho validation accuracy nhảy vọt — tín hiệu nhãn núp ở thành phần phương sai thấp. Click lại trạm bất kỳ để xem lại, rồi sang Bước 4 tự viết code.',
          stations: [
            {
              zones: ['var-spectrum'],
              icon: '📊', label: 'PHỔ PHƯƠNG SAI', sub: 'full PCA trên train', result_kind: 'variance_selection',
              varsel: { mode: 'spectrum', evr: [0.4141, 0.2457, 0.1722, 0.0879, 0.0396, 0.0172, 0.0024, 0.0017, 0.0016, 0.0015, 0.0013, 0.0012, 0.0010, 0.0010, 0.0009] },
              narration: 'Fit PCA đầy đủ (không giới hạn) trên 280 học sinh train: PC1 nắm 41.4%, PC2 24.6%, PC3 17.2% — 6 thành phần đầu gánh gần hết phương sai, 9 thành phần cuối gần như chỉ là nhiễu.',
            },
            {
              zones: ['var-target'],
              icon: '🎯', label: 'ĐẶT MỐC', sub: '80% · 90% · 95%', result_kind: 'variance_selection',
              varsel: { mode: 'targets', targets: [{ target: 0.80, n: 3, cum: 0.8321 }, { target: 0.90, n: 4, cum: 0.92 }, { target: 0.95, n: 5, cum: 0.9596 }] },
              narration: 'Mốc 80% → cần 3 component. Mốc 90% → cần 4. Mốc 95% → cần 5. Càng đòi giữ nhiều phương sai, càng cần nhiều "chỗ trong ba lô" — nhưng con số 95% tự nó không nói điều gì về việc mô hình dự đoán tốt hơn.',
            },
            {
              zones: ['var-validate'],
              icon: '🔬', label: 'KIỂM TRA VALIDATION', sub: '1 classifier cố định', result_kind: 'variance_selection',
              varsel: { mode: 'validate', chosen_n: 4, chosen_acc: 0.80, rows: [{ n: 3, cum: 0.8321, acc: 0.50 }, { n: 4, cum: 0.92, acc: 0.80 }, { n: 5, cum: 0.9596, acc: 0.75 }] },
              narration: 'n=3 (80% var) → accuracy chỉ 50% (như đoán ngẫu nhiên!). n=4 (90% var) → accuracy nhảy lên 80%. n=5 (95% var) → 75%, KHÔNG cao hơn n=4. Bằng chứng validation, không phải % phương sai, mới là căn cứ chọn n=4.',
            },
          ],
        },
      },
      drag_map: {
        brand: 'DÒNG CHẢY COMPRESSION TRADE-OFF',
        table_sub: 'DataFrame nguồn · 40 feature (6 nhân tố ẩn)',
        idle_sub: 'Bấm ▶ để chạy pipeline',
        run_label: '▶ Chạy Pipeline',
        table: {
          name: 'pca_selection_splits',
          columns: ['feat_01', 'feat_02', 'pass_fail'],
          dataRows: [
            ['-12.15', '2.95', '0'],
            ['-4.29', '-1.46', '1'],
            ['5.35', '5.08', '0'],
            ['5.05', '1.40', '1'],
            ['-0.87', '0.10', '0'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Fit full <code>PCA</code> trên train, tính phương sai tích luỹ, chọn <code>n_components</code> nhỏ nhất đạt 90%, refit và kiểm tra bằng <code>validate_pca_representation()</code>.</p>',
        context: {
          scenario: 'StudyLab cần một con số n_components có CĂN CỨ — không phải "nhìn có vẻ ổn". Bạn phải suy ra số component từ một ngưỡng phương sai đã định trước, rồi xác nhận lựa chọn đó bằng bằng chứng validation.',
          real_world: 'Giống việc đóng gói vali trước chuyến đi: bạn không nhét TẤT CẢ đồ đạc "cho chắc" — bạn đặt ra 1 ngân sách trọng lượng, chọn những món cần thiết đạt ngân sách đó, rồi KIỂM TRA XEM còn đủ đồ dùng cho chuyến đi hay không (chứ không chỉ nhìn cân nặng).',
          steps: [
            'Nạp dữ liệu bằng <code>load_pca_selection_data()</code>, chuẩn hoá bằng scaler đã fit trên train.',
            'Fit PCA KHÔNG giới hạn số thành phần trên train, tính phương sai tích luỹ.',
            'Suy ra số thành phần NHỎ NHẤT vượt ngưỡng 90% — không gán cứng con số.',
            'Refit PCA với đúng số thành phần đó, rồi dùng đầu dò validation cố định để có bằng chứng.',
          ],
          hint_explore: 'Muốn xem phổ phương sai đầy đủ? Gõ <code>print(full.explained_variance_ratio_[:10])</code> rồi Run.',
          expected: 'Biến `n_components` = 4 (với target 0.90, seed mặc định); `cumulative[n_components-1]` ≈ 0.92; validate_pca_representation trả accuracy hợp lý (không phải ngẫu nhiên).',
        },
        hints: [
          { level: 1, text: 'Nhập <code>from sklearn.decomposition import PCA</code>, <code>from sklearn.preprocessing import StandardScaler</code>, <code>from ml_lab import load_pca_selection_data, validate_pca_representation</code>.' },
          { level: 2, text: '<code>X_train, X_val, y_train, y_val = load_pca_selection_data()</code>. Fit <code>scaler = StandardScaler().fit(X_train)</code>, rồi <code>A = scaler.transform(X_train)</code>, <code>B = scaler.transform(X_val)</code>.' },
          { level: 3, text: '<code>full = PCA().fit(A)</code>, <code>cumulative = np.cumsum(full.explained_variance_ratio_)</code>. Suy ra <code>n_components = int(np.searchsorted(cumulative, 0.90) + 1)</code> — KHÔNG gán cứng số.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>from sklearn.decomposition import PCA<br>from sklearn.preprocessing import StandardScaler<br>from ml_lab import load_pca_selection_data, validate_pca_representation<br>X_train, X_val, y_train, y_val = load_pca_selection_data()<br>scaler = StandardScaler().fit(X_train)<br>A = scaler.transform(X_train)<br>B = scaler.transform(X_val)<br>full = PCA().fit(A)<br>cumulative = np.cumsum(full.explained_variance_ratio_)<br>target = 0.90<br>n_components = int(np.searchsorted(cumulative, target) + 1)<br>final_pca = PCA(n_components=n_components).fit(A)<br>Z_train = final_pca.transform(A)<br>Z_val = final_pca.transform(B)<br>print(n_components, cumulative[n_components - 1])<br>print(validate_pca_representation(Z_train, Z_val, y_train, y_val))</code>' },
        ],
        grader_fn: 'grade_lesson_c3_3',
        success_message: 'Bạn vừa chọn số chiều PCA bằng BẰNG CHỨNG — ngưỡng phương sai đã định trước, xác nhận bằng validation — không đoán mù, không dò test.',
        xp_reward: 65,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.decomposition import PCA',
      },
    },

    {
      id: 'c3_l4',
      index: 4,
      title: 'Trực quan hóa và audit dữ liệu sau PCA',
      subtitle: 'Chiếu, đọc loadings và kiểm toán xem biểu đồ có đủ làm bằng chứng',
      module: 1,
      module_title: 'M1 · High-Dimensional Representation',
      estimated_minutes: 23,
      xp_reward: 65,
      achievement: { name: 'Visualization Auditor', desc: 'Tạo biểu đồ PCA tái lập được và viết phát biểu giới hạn trung thực.' },
      story: {
        tag: '🧬 StudyLab · Advanced Modeling Lab',
        hook: 'StudyLab sắp khép Module 1. Bạn chiếu dữ liệu hành vi lên PC1/PC2, tô màu theo pass_fail — và biểu đồ ĐẸP RÕ RÀNG: 2 lớp tách nhau khá gọn. Một đồng nghiệp reo lên: "PC1 chắc là mức độ tương tác — nó QUYẾT ĐỊNH việc Đậu/Rớt!" Bài này bạn sẽ học cách vừa TIN vào biểu đồ đẹp, vừa KHÔNG tin quá mức — vì PCA không hề chứng minh nhân quả, và một biểu đồ "sạch" có thể ẩn giấu điều sai.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Vẽ biểu đồ chiếu PC1/PC2, tô nhãn CHỈ để diễn giải — không dùng nhãn khi fit PCA.',
            'Đọc loadings để mô tả đóng góp feature — không suy diễn nhân quả.',
            'Kiểm toán biểu đồ bằng nhiều bằng chứng: tách lớp trực quan, sign invariance, so sánh validation.',
          ],
        },
        glossary: [
          { term: 'Projection plot', vi: 'Biểu đồ chiếu', accent: '#22D3EE', def: 'Biểu đồ 2D vẽ điểm theo toạ độ PC1 (trục ngang) và PC2 (trục dọc) — mỗi trục là 1 THÀNH PHẦN, không phải 1 feature gốc.', ex: 'plt.scatter(Z[:,0], Z[:,1])', out: '' },
          { term: 'Sign invariance', vi: 'Bất biến theo dấu', accent: '#67E8F9', def: 'PCA có thể trả PC1 với dấu + hoặc − tuỳ lần chạy — cả 2 đều ĐÚNG như nhau, không có "dấu chuẩn".', ex: 'PC1 và −PC1 tương đương', out: '' },
          { term: 'Projection artifact', vi: 'Ảo ảnh do phép chiếu', accent: '#0891B2', def: 'Hình dạng "cụm" hay "tách lớp" nhìn thấy trên biểu đồ 2D có thể chỉ là hiệu ứng của phép chiếu, không phản ánh cấu trúc thật của dữ liệu gốc.', ex: '', out: '' },
          { term: 'Structure audit', vi: 'Kiểm toán cấu trúc', accent: '#67E8F9', def: 'So sánh nhiều bằng chứng (tách lớp trực quan, accuracy feature gốc, accuracy PCA) trước khi tin vào 1 biểu đồ.', ex: 'compare_raw_and_pca()', out: '' },
          { term: 'Limitation statement', vi: 'Phát biểu giới hạn', accent: '#A5F3FC', def: 'Một câu tường minh nói rõ biểu đồ 2D này CHỨNG MINH được điều gì và KHÔNG chứng minh được điều gì.', ex: '', out: '' },
          { term: 'Causal overclaim', vi: 'Suy diễn nhân quả quá đà', accent: '#22D3EE', def: 'Gán ý nghĩa "nguyên nhân" cho 1 thành phần chính chỉ vì loadings của nó trỏ vào vài feature "nghe có vẻ liên quan" — PCA không chứng minh quan hệ nhân quả.', ex: '"PC1 gây ra Đậu" ❌', out: '' },
        ],
        primer: {
          goal: [
            'So 2 biểu đồ CÙNG % phương sai giữ được — 1 tách lớp rõ, 1 chồng lấn hoàn toàn.',
            'Chiếu train lên PC1/PC2, đọc top loadings, so accuracy feature gốc vs PCA(2).',
          ],
          intro: '<p>Một biểu đồ PCA đẹp rất dễ gây tin tưởng — nhưng "đẹp" và "đúng" là 2 việc khác nhau. Bài này bạn tự tay so sánh 2 bộ dữ liệu GIỮ CÙNG PHẦN TRĂM PHƯƠNG SAI nhưng cho kết quả tách lớp hoàn toàn khác nhau, để thấy rõ: chỉ nhìn biểu đồ là chưa đủ bằng chứng.</p>',
          example: '',
        },
        intro: 'Biểu đồ đẹp — nhưng đẹp có phải là bằng chứng?',
        concept_cards: [
          { icon: 'fa-image', title: 'Biểu đồ đẹp chưa phải bằng chứng', body: 'Tách lớp rõ trên PC1/PC2 chỉ là 1 quan sát trực quan — cần thêm accuracy validation mới đủ căn cứ kết luận.' },
          { icon: 'fa-arrows-left-right', title: 'Dấu trục là ngẫu nhiên', body: 'PC1 dương hay âm chỉ là quy ước — lật dấu không đổi ý nghĩa, không đổi accuracy hay bất kỳ kết luận nào.' },
          { icon: 'fa-ban', title: 'Loadings không chứng minh nhân quả', body: 'PC1 tải mạnh lên vài feature không có nghĩa CHÚNG gây ra kết quả — chỉ là tương quan tuyến tính trong tổ hợp.' },
        ],
        pca_audit_lens: {
          title: 'ỐNG KÍNH KIỂM TOÁN',
          intro: 'Bấm "Hiện nhãn thật" — 2 bộ dữ liệu này giữ GẦN NHƯ CÙNG % phương sai, nhưng khác nhau hoàn toàn về tách lớp.',
          datasets: [
            {
              label: 'Dataset A', evr_pct: 0.824,
              points: [
                [0.40, 0.20, 1], [-1.50, 3.29, 0], [2.10, 3.07, 1], [-3.49, 4.40, 0], [2.65, 1.63, 1], [0.73, -0.31, 1], [-0.17, 1.59, 1], [0.96, 1.15, 1], [-3.58, 2.01, 0], [6.21, -1.76, 1],
                [-1.45, -1.96, 0], [5.31, -1.74, 1], [-1.86, -1.83, 0], [-4.61, -2.41, 0], [-0.98, -0.06, 1], [7.74, 3.50, 1], [-1.10, -2.03, 0], [-3.13, -2.37, 0], [4.66, -1.38, 1], [-5.00, -1.66, 0],
                [4.60, -2.00, 1], [4.97, 1.95, 1], [-3.99, 0.51, 0], [0.16, 0.92, 1], [-6.03, 1.47, 0], [3.19, -2.63, 1], [2.37, -0.57, 1], [1.64, -1.19, 1], [-3.99, -0.90, 0], [-1.10, -0.91, 1],
              ],
            },
            {
              label: 'Dataset B', evr_pct: 0.831,
              points: [
                [3.04, 1.37, 0], [10.04, -1.65, 1], [-0.88, 0.76, 0], [-2.19, -3.58, 0], [1.04, 3.18, 1], [3.82, -2.06, 0], [0.11, -0.83, 1], [0.29, -1.50, 0], [-1.18, 3.76, 0], [-4.90, -1.36, 1],
                [1.14, -0.78, 0], [2.74, -3.16, 1], [-0.65, 6.17, 1], [0.29, 0.24, 0], [-2.65, -0.82, 1], [0.45, 1.01, 0], [0.15, 0.30, 1], [-0.57, 1.54, 0], [1.62, 4.74, 1], [1.38, 0.72, 0],
                [-1.38, -1.72, 1], [-7.23, -2.23, 0], [-3.28, 2.38, 1], [2.93, -3.85, 0], [-4.30, 0.41, 1], [-0.40, -2.09, 1], [2.12, 1.03, 1], [-1.20, -0.94, 0], [-4.04, 0.60, 0], [1.90, -1.39, 0],
              ],
            },
          ],
          riddle: {
            prompt: 'Cả 2 biểu đồ giữ ~82-83% phương sai — gần như bằng nhau. Biểu đồ tách lớp rõ hơn (Dataset A) có CHỨNG MINH được model trên đó sẽ phân loại tốt hơn không?',
            options: ['Có, tách rõ hơn = model tốt hơn', 'Không, cần thêm bằng chứng validation', 'Không, PCA luôn cho kết quả sai'],
            answer: 'Không, cần thêm bằng chứng validation',
            wrong: {
              'Có, tách rõ hơn = model tốt hơn': 'Đây chính là bẫy — 1 biểu đồ đẹp mới chỉ là quan sát trực quan, chưa phải bằng chứng đo được (accuracy, F1…) trên dữ liệu chưa thấy.',
              'Không, PCA luôn cho kết quả sai': 'Quá cực đoan — PCA không "luôn sai", nó chỉ không tự động chứng minh khả năng phân loại chỉ qua hình dáng biểu đồ.',
            },
            done: '✅ Đúng — 2 bộ dữ liệu này được dựng CỐ Ý để giữ % phương sai gần bằng nhau nhưng tách lớp khác hẳn nhau. Biểu đồ đẹp là 1 tín hiệu tốt để ĐIỀU TRA thêm — không phải bằng chứng cuối cùng.',
          },
        },
        visual: {
          schema: {
            table_name: 'pca_visual_audit',
            columns: [
              { name: 'login_freq', type: 'FLOAT', key: '' },
              { name: 'revisit_rate', type: 'FLOAT', key: '' },
              { name: '⋯ 18 feature khác', type: 'FLOAT × 18', key: '' },
              { name: 'pass_fail', type: 'INT · 0/1', key: 'TARGET' },
            ],
          },
          data_preview: [
            ['1.12', '0.84', '⋯', '1'],
            ['-0.65', '-1.20', '⋯', '0'],
            ['2.03', '1.55', '⋯', '1'],
            ['-1.44', '-0.72', '⋯', '0'],
            ['0.31', '0.19', '⋯', '1'],
          ],
        },
        mission: 'Chiếu train lên PC1/PC2 (chỉ fit trên train), in top-4 loading mỗi PC, so sánh accuracy feature gốc vs PCA(2).',
      },
      step_2: {
        mcq: [
          {
            question: 'Bạn thấy 1 biểu đồ PCA 2D tách 2 lớp RẤT rõ ràng. Điều này CHỨNG MINH được gì?',
            options: [
              { id: 'a', text: 'Chỉ là 1 bằng chứng trực quan — cần thêm accuracy trên validation để xác nhận', correct: true, explanation: 'Đúng — visual inspection is evidence, not ground truth (đúng nguyên văn misconception feedback của spec).' },
              { id: 'b', text: 'Chứng minh model sẽ phân loại chính xác 100%', correct: false, explanation: 'Không có gì đảm bảo 100% — biểu đồ chỉ cho thấy XU HƯỚNG tách, không phải con số accuracy chính xác.' },
              { id: 'c', text: 'Chứng minh 2 lớp này có quan hệ nhân quả với PC1', correct: false, explanation: 'PCA không chứng minh quan hệ nhân quả — chỉ mô tả tương quan tuyến tính giữa các feature.' },
              { id: 'd', text: 'Chứng minh PCA đã chọn đúng số chiều tối ưu', correct: false, explanation: 'Số chiều tối ưu cần đánh giá bằng phương sai tích luỹ + validation (Bài 3) — không suy ra chỉ từ 1 biểu đồ.' },
            ],
          },
          {
            question: 'Loadings của PC1 tải mạnh nhất lên revisit_rate, doc_edits, session_len_min. Một bạn học kết luận: "Những hành vi này GÂY RA việc học sinh Đậu." Kết luận này có vấn đề gì?',
            options: [
              { id: 'a', text: 'PCA chỉ cho biết TƯƠNG QUAN tuyến tính giữa các feature, không chứng minh quan hệ NHÂN QUẢ', correct: true, explanation: 'Chính xác — đây là unsafe-but-correct case của spec: loadings hợp lệ, nhưng suy diễn nhân quả thì không có căn cứ.' },
              { id: 'b', text: 'Không có vấn đề gì — loadings lớn nghĩa là feature đó chắc chắn là nguyên nhân', correct: false, explanation: 'Sai — loadings đo mức đóng góp vào PHƯƠNG SAI của thành phần, không đo quan hệ nhân quả với nhãn.' },
              { id: 'c', text: 'Vấn đề duy nhất là chọn sai tên feature', correct: false, explanation: 'Không liên quan đến tên gọi — vấn đề là bản chất suy luận nhân quả từ dữ liệu quan sát.' },
              { id: 'd', text: 'Vấn đề là PCA đã dùng nhãn pass_fail để tính loadings này', correct: false, explanation: 'PCA hoàn toàn KHÔNG dùng nhãn khi fit — loadings được tính chỉ từ feature gốc.' },
            ],
          },
          {
            question: '2 học sinh chạy PCA trên CÙNG 1 dữ liệu: một người thấy PC1 dương ứng với "Đậu", người kia thấy PC1 ÂM ứng với "Đậu". Ai đúng?',
            options: [
              { id: 'a', text: 'Cả 2 đều đúng — dấu của thành phần chính là quy ước ngẫu nhiên (sign ambiguity), không ảnh hưởng accuracy hay ý nghĩa', correct: true, explanation: 'Đúng — đây chính là MS-3 Sign invariance của bài.' },
              { id: 'b', text: 'Chỉ người thấy PC1 dương ứng với Đậu là đúng', correct: false, explanation: 'Không có "dấu chuẩn" cho thành phần chính — cả 2 chiều dấu đều là kết quả hợp lệ như nhau.' },
              { id: 'c', text: 'Cả 2 đều sai — cần chạy lại để ép PC1 luôn dương', correct: false, explanation: 'Không cần và không nên ép dấu — dấu không mang ý nghĩa cố định.' },
              { id: 'd', text: 'Chỉ đúng nếu 2 người dùng cùng random_state', correct: false, explanation: 'Ngay cả với cùng dữ liệu, dấu của component vẫn có thể khác giữa các lần chạy — đó chính là sign invariance, không phụ thuộc random_state theo cách này.' },
            ],
          },
        ],
        mini_game: {
          title: 'Thực hành nào giữ ĐÚNG kỷ luật khi audit biểu đồ PCA?',
          instruction: 'Xếp mỗi thực hành vào đúng nhóm.',
          chips: [
            { id: 'chip-describe', label: 'Chỉ dùng loadings để MÔ TẢ đóng góp feature, không suy ra nguyên nhân' },
            { id: 'chip-compare', label: 'So sánh accuracy feature gốc vs PCA trước khi tin biểu đồ' },
            { id: 'chip-concludeplot', label: 'Kết luận "model tốt" chỉ từ 1 biểu đồ 2D tách lớp đẹp' },
            { id: 'chip-fixsign', label: 'Coi dấu (+/−) của PC1 là một sự thật cố định cần giữ nguyên' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-describe': 'dung', 'chip-compare': 'dung', 'chip-concludeplot': 'sai', 'chip-fixsign': 'sai' },
          success_html: '✅ Mô tả bằng loadings, xác nhận bằng so sánh accuracy — không kết luận vội từ hình dáng biểu đồ, không coi dấu trục là cố định.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Lắp pipeline audit — chiếu train lên PC1/PC2, đọc loadings, so sánh raw vs PCA validation.',
        blocks: [
          { type: 'py', token: 'X_train, X_val, y_train, y_val, names = load_pca_visual_audit()', slot: 'z1a' },
          { type: 'py', token: 'scaler = StandardScaler().fit(X_train)', slot: 'z1b' },
          { type: 'py', token: 'A, B = scaler.transform(X_train), scaler.transform(X_val)', slot: 'z2a' },
          { type: 'py', token: 'pca = PCA(n_components=2).fit(A)', slot: 'z2b' },
          { type: 'py', token: 'Z = pca.transform(A)', slot: 'z3a' },
          { type: 'py', token: 'compare_raw_and_pca(A, B, pca.transform(A), pca.transform(B), y_train, y_val)', slot: 'z3b' },
          /* 2 mồi bẫy — unsafe-but-correct của spec: gộp train+val khi fit / truyền nhãn vào PCA.fit */
          { type: 'py', token: 'pca = PCA(n_components=2).fit(np.vstack([A, B]))', slot: 't1' },
          { type: 'py', token: 'pca = PCA(n_components=2).fit(A, y_train)', slot: 't2' },
        ],
        drop_zones: [
          { id: 'audit-load', accepts: ['py'], multi: true },
          { id: 'audit-fit', accepts: ['py'], multi: true },
          { id: 'audit-compare', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'audit-load': 'X_train, X_val, y_train, y_val, names = load_pca_visual_audit() scaler = StandardScaler().fit(X_train)',
          'audit-fit': 'A, B = scaler.transform(X_train), scaler.transform(X_val) pca = PCA(n_components=2).fit(A)',
          'audit-compare': 'Z = pca.transform(A) compare_raw_and_pca(A, B, pca.transform(A), pca.transform(B), y_train, y_val)',
        },
        reveal_hints: {
          'audit-load': 'Nạp dữ liệu, fit scaler CHỈ trên <strong>X_train</strong>.',
          'audit-fit': 'Chuẩn hoá cả 2 tập, fit PCA CHỈ trên <strong>A</strong> (train đã chuẩn hoá) — KHÔNG dùng nhãn.',
          'audit-compare': 'Chiếu train để vẽ, rồi <strong>compare_raw_and_pca(...)</strong> để có bằng chứng validation.',
        },
        ml_flow: {
          brand: 'DÒNG CHẢY PCA VISUALIZATION AUDIT',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: '300 học sinh · 20 feature hành vi học tập' },
          done_note: 'Biểu đồ đẹp + accuracy khớp nhau mới là bằng chứng đầy đủ. Click lại trạm bất kỳ để xem lại, rồi sang Bước 4 tự viết code.',
          stations: [
            {
              zones: ['audit-load'],
              icon: '📍', label: 'CHIẾU (UNLABELED)', sub: 'PCA không biết nhãn', result_kind: 'pca_audit',
              audit: {
                mode: 'project', n: 30,
                points: [
                  [2.86, 1.59, 0], [3.92, 2.23, 0], [2.61, -3.24, 0], [3.89, -0.42, 0], [-2.84, -0.94, 1], [4.56, 0.85, 0], [1.01, 1.92, 0], [-4.89, -4.68, 1], [-0.88, 0.36, 0], [2.34, 2.42, 0],
                  [-4.71, -0.33, 1], [0.59, 5.29, 0], [-2.38, -2.45, 1], [-4.41, 2.12, 1], [-1.26, -0.41, 1], [2.31, -3.44, 0], [-1.18, 1.72, 0], [1.10, 4.39, 0], [3.30, 1.01, 0], [-3.77, 2.92, 1],
                  [7.54, 3.20, 0], [-1.27, -1.15, 1], [-4.07, 2.04, 1], [1.88, 0.41, 1], [1.14, 2.36, 0], [-0.44, -0.99, 1], [2.44, -0.13, 0], [0.52, -2.19, 0], [-3.23, -2.48, 1], [1.33, -0.87, 1],
                ],
              },
              narration: 'PCA fit và chiếu CHỈ dựa trên 20 feature hành vi — hoàn toàn không nhìn thấy pass_fail. 30 điểm hiện ra đồng màu, chưa nói lên điều gì về nhãn.',
            },
            {
              zones: ['audit-fit'],
              icon: '🎨', label: 'TÔ NHÃN', sub: 'chỉ để diễn giải', result_kind: 'pca_audit',
              audit: {
                mode: 'label', n: 30,
                points: [
                  [2.86, 1.59, 0], [3.92, 2.23, 0], [2.61, -3.24, 0], [3.89, -0.42, 0], [-2.84, -0.94, 1], [4.56, 0.85, 0], [1.01, 1.92, 0], [-4.89, -4.68, 1], [-0.88, 0.36, 0], [2.34, 2.42, 0],
                  [-4.71, -0.33, 1], [0.59, 5.29, 0], [-2.38, -2.45, 1], [-4.41, 2.12, 1], [-1.26, -0.41, 1], [2.31, -3.44, 0], [-1.18, 1.72, 0], [1.10, 4.39, 0], [3.30, 1.01, 0], [-3.77, 2.92, 1],
                  [7.54, 3.20, 0], [-1.27, -1.15, 1], [-4.07, 2.04, 1], [1.88, 0.41, 1], [1.14, 2.36, 0], [-0.44, -0.99, 1], [2.44, -0.13, 0], [0.52, -2.19, 0], [-3.23, -2.48, 1], [1.33, -0.87, 1],
                ],
              },
              narration: 'Giờ tô màu theo pass_fail (chỉ để DIỄN GIẢI, không refit): PC1 âm thiên về "Rớt" (đỏ), PC1 dương thiên về "Đậu" (xanh) — dấu này chỉ là quy ước, có thể đảo ngược ở lần chạy khác.',
            },
            {
              zones: ['audit-compare'],
              icon: '🔬', label: 'SO SÁNH VALIDATION', sub: 'raw vs PCA(2)', result_kind: 'pca_audit',
              audit: { mode: 'compare', raw_acc: 0.8, pca_acc: 0.8 },
              narration: 'Đầu dò cố định (LogisticRegression) trên 20 feature gốc: 80% accuracy. Trên PCA(2) — chỉ 2 chiều: CŨNG 80%. Đây mới là bằng chứng validation THẬT, không chỉ dựa vào việc biểu đồ trông đẹp.',
            },
          ],
        },
      },
      drag_map: {
        brand: 'DÒNG CHẢY PCA VISUALIZATION AUDIT',
        table_sub: 'DataFrame nguồn · 20 feature hành vi học tập',
        idle_sub: 'Bấm ▶ để chạy pipeline',
        run_label: '▶ Chạy Pipeline',
        table: {
          name: 'pca_visual_audit',
          columns: ['login_freq', 'revisit_rate', 'pass_fail'],
          dataRows: [
            ['1.12', '0.84', '1'],
            ['-0.65', '-1.20', '0'],
            ['2.03', '1.55', '1'],
            ['-1.44', '-0.72', '0'],
            ['0.31', '0.19', '1'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Chiếu train lên PC1/PC2 (chỉ fit trên train), in top-4 loading mỗi thành phần (theo tên feature), và so sánh accuracy feature gốc vs PCA(2) bằng <code>compare_raw_and_pca()</code>.</p>',
        context: {
          scenario: 'Trước khi báo cáo "PCA giữ được cấu trúc quan trọng của dữ liệu" cho StudyLab, bạn cần một biểu đồ TÁI LẬP ĐƯỢC (ai chạy lại cũng ra kết quả tương đương, kể cả khi trục bị đảo dấu) và một bằng chứng SỐ (không chỉ hình ảnh) rằng phép chiếu không đánh mất khả năng dự đoán.',
          real_world: 'Giống việc kiểm toán viên không chỉ nhìn báo cáo tài chính "trông gọn gàng" mà còn đối chiếu số liệu — một biểu đồ đẹp và một con số kiểm chứng phải ĐI CÙNG NHAU mới đủ tin cậy.',
          steps: [
            'Nạp dữ liệu bằng <code>load_pca_visual_audit()</code>, fit scaler CHỈ trên train.',
            'Fit PCA(2 chiều) CHỈ trên train đã chuẩn hoá — không dùng nhãn.',
            'Chiếu train, in ra 4 feature đóng góp mạnh nhất cho mỗi thành phần (theo trị tuyệt đối).',
            'Gọi đầu dò so sánh cố định để có bằng chứng số về việc PCA có giữ được khả năng dự đoán hay không.',
          ],
          hint_explore: 'Muốn xem tên 20 feature? Gõ <code>_, _, _, _, names = load_pca_visual_audit(); print(names)</code> rồi Run.',
          expected: 'In ra "PC1"/"PC2" kèm 4 tên feature mỗi dòng, và kết quả compare_raw_and_pca chứa raw_accuracy, pca_accuracy — 2 số gần bằng nhau.',
        },
        hints: [
          { level: 1, text: 'Nhập <code>from sklearn.preprocessing import StandardScaler</code>, <code>from sklearn.decomposition import PCA</code>, <code>from ml_lab import load_pca_visual_audit, compare_raw_and_pca</code>.' },
          { level: 2, text: '<code>X_train, X_val, y_train, y_val, names = load_pca_visual_audit()</code>. Fit <code>scaler = StandardScaler().fit(X_train)</code>, rồi <code>A, B = scaler.transform(X_train), scaler.transform(X_val)</code>.' },
          { level: 3, text: '<code>pca = PCA(n_components=2).fit(A)</code> — CHỈ 1 arg, không truyền y_train. <code>Z = pca.transform(A)</code>. Duyệt <code>pca.components_</code>, dùng <code>np.argsort(np.abs(row))[::-1][:4]</code> để lấy 4 chỉ số loading mạnh nhất.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>from sklearn.preprocessing import StandardScaler<br>from sklearn.decomposition import PCA<br>from ml_lab import load_pca_visual_audit, compare_raw_and_pca<br>X_train, X_val, y_train, y_val, names = load_pca_visual_audit()<br>scaler = StandardScaler().fit(X_train)<br>A, B = scaler.transform(X_train), scaler.transform(X_val)<br>pca = PCA(n_components=2).fit(A)<br>Z = pca.transform(A)<br>for i, row in enumerate(pca.components_):<br>&nbsp;&nbsp;&nbsp;&nbsp;top = np.argsort(np.abs(row))[::-1][:4]<br>&nbsp;&nbsp;&nbsp;&nbsp;print(f"PC{i+1}", [names[j] for j in top])<br>print(compare_raw_and_pca(A, B, pca.transform(A), pca.transform(B), y_train, y_val))</code>' },
        ],
        grader_fn: 'grade_lesson_c3_4',
        success_message: 'Bạn vừa tạo một biểu đồ PCA TÁI LẬP ĐƯỢC (bất chấp lật dấu) và xác nhận nó bằng bằng chứng số — không chỉ dừng ở "biểu đồ trông đẹp". Module 1 hoàn tất — sẵn sàng cho Module Checkpoint!',
        xp_reward: 65,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.preprocessing import StandardScaler',
      },
    },

    // ╔══════════════════════════════════════════════════════════╗
    // ║  M2 — MARGIN-BASED CLASSIFICATION                        ║
    // ╚══════════════════════════════════════════════════════════╝
    {
      id: 'c3_l5',
      index: 5,
      title: 'Support Vector Machine và margin',
      subtitle: 'Support vector, soft margin, C và chọn kernel bằng bằng chứng validation',
      module: 2,
      module_title: 'M2 · Margin-Based Classification',
      estimated_minutes: 26,
      xp_reward: 65,
      achievement: { name: 'Margin Analyst', desc: 'Tune và bảo vệ 1 SVM bằng bằng chứng margin + validation, không đoán mù.' },
      story: {
        tag: '🧬 StudyLab · Advanced Modeling Lab',
        hook: 'Module 1 xong — bạn đã biết nén và kiểm toán dữ liệu nhiều chiều. Giờ StudyLab cần MỘT đường ranh giới đáng tin để phân loại "Đậu/Rớt" từ 2 tín hiệu hành vi. Có VÔ SỐ đường thẳng tách đúng dữ liệu train — bạn chọn đường nào? Một bạn thử C cực lớn, ép model tách hoàn hảo 100% training data, rồi tuyên bố "xong, model tốt nhất rồi". Bài này bạn sẽ học vì sao đó là một quyết định KHÔNG ĐƯỢC BẢO VỆ — và cách chọn đúng bằng margin + validation.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Phân biệt MỘT đường tách đúng dữ liệu với đường có HÀNH LANG (margin) rộng nhất.',
            'Giải thích vì sao chỉ vài điểm (support vector) quyết định vị trí đường phân chia.',
            'Tune C và chọn kernel (linear/RBF) bằng bằng chứng validation — không đoán mù, không dò test.',
          ],
        },
        glossary: [
          { term: 'Maximum margin', vi: 'Biên độ tối đa', accent: '#22D3EE', def: 'Khoảng cách LỚN NHẤT có thể giữa đường phân chia và điểm gần nhất của mỗi lớp — SVM tìm đúng đường này, không phải bất kỳ đường nào tách đúng.', ex: 'hành lang rộng nhất trong 5 đường hợp lệ', out: '' },
          { term: 'Support vector', vi: 'Vector hỗ trợ', accent: '#67E8F9', def: 'Các điểm dữ liệu NẰM TRÊN hoặc GẦN biên margin nhất — chỉ những điểm này quyết định vị trí đường phân chia, các điểm còn lại không ảnh hưởng.', ex: 'điểm viền vàng trong ống kính hero', out: 'n_support_' },
          { term: 'Soft margin (C)', vi: 'Biên mềm', accent: '#0891B2', def: 'Tham số C kiểm soát đánh đổi giữa hành lang RỘNG (chấp nhận vài điểm lấn margin) và hành lang HẸP (ép sát dữ liệu train) — C nhỏ = rộng, C lớn = hẹp.', ex: 'C=0.1 vs C=1.0', out: '' },
          { term: 'Kernel trick', vi: 'Mẹo kernel', accent: '#67E8F9', def: 'Phép tính ĐỘ TƯƠNG TỰ giữa 2 điểm như thể chúng đang ở một không gian đặc trưng ẩn (thường nhiều chiều hơn) — không cần tính tường minh không gian đó.', ex: "kernel='rbf'", out: '' },
          { term: 'Decision boundary vs maximum-margin boundary', vi: 'Ranh giới quyết định vs ranh giới biên tối đa', accent: '#A5F3FC', def: 'Có VÔ SỐ đường tách đúng 2 lớp trên tập train (decision boundary) — nhưng chỉ có 1 đường có hành lang rộng nhất (maximum-margin boundary).', ex: '', out: '' },
          { term: 'Validation-based model selection', vi: 'Chọn model bằng validation', accent: '#22D3EE', def: 'Chọn C, kernel dựa trên metric đo trên tập validation (KHÔNG phải train) — tránh chọn nhầm 1 model chỉ "trông" hoàn hảo trên dữ liệu đã thấy.', ex: 'val_f1', out: '' },
        ],
        primer: {
          goal: [
            'Click qua 5 đường phân chia hợp lệ — tìm đường có hành lang RỘNG NHẤT.',
            'Build Pipeline(StandardScaler, SVC) cho 3 cấu hình, đo F1 + support vector trên validation.',
          ],
          intro: '<p>Có VÔ SỐ đường thẳng tách đúng 2 nhóm học sinh trong tập train của bạn — nhưng không phải đường nào cũng đáng tin như nhau. SVM đi tìm đường có "hành lang an toàn" RỘNG NHẤT: càng rộng, càng ít khả năng 1 học sinh mới rơi vào nhầm phía chỉ vì lệch nhẹ so với dữ liệu đã thấy.</p>',
          example: '',
        },
        intro: 'Vô số đường tách đúng — đường nào đáng tin nhất?',
        concept_cards: [
          { icon: 'fa-road', title: 'Không phải đường nào cũng như nhau', body: 'Có vô số đường tách đúng 2 lớp — SVM tìm đường có HÀNH LANG RỘNG NHẤT, bền vững hơn trước nhiễu.' },
          { icon: 'fa-thumbtack', title: 'Chỉ vài điểm quyết định tất cả', body: 'Support vector là những điểm SÁT margin nhất — xoá 1 điểm xa margin, đường phân chia không đổi.' },
          { icon: 'fa-shield-halved', title: 'C lớn không phải luôn tốt', body: 'C cực lớn ép model tách hoàn hảo training data — nhưng không có gì đảm bảo generalize tốt nếu không kiểm tra bằng validation.' },
        ],
        margin_lens: {
          title: 'HÀNH LANG AN TOÀN RỘNG NHẤT',
          intro: 'Bấm qua từng đường — cả 5 đều tách ĐÚNG 2 lớp, nhưng hành lang rộng khác nhau rõ rệt.',
          points: [
            [-1.06, -1.03, 0], [-1.90, -0.15, 0], [-2.26, -0.32, 0], [-0.76, -0.83, 0], [-1.00, -1.13, 0], [-1.67, -0.73, 0], [-1.29, -1.45, 0], [-1.81, -1.44, 0],
            [1.73, 0.85, 1], [0.90, 1.51, 1], [1.22, 0.42, 1], [1.02, 1.36, 1], [1.23, 1.66, 1], [1.31, 0.22, 1], [1.99, 1.38, 1], [1.32, 1.53, 1],
          ],
          candidates: [
            { label: 'Đường 1', w: [0.768, 0.391], b: -0.091, margin: 1.16 },
            { label: 'Đường 2', w: [1.0, 0.3], b: 0.3, margin: 0.68 },
            { label: 'Đường 3', w: [0.5, 1.2], b: -0.2, margin: 0.56 },
            { label: 'Đường 4', w: [1.0, 1.0], b: -0.5, margin: 0.73 },
            { label: 'Đường 5', w: [1.5, 0.2], b: 0.8, margin: 0.34 },
          ],
          riddle: {
            prompt: 'Đường nào có hành lang (margin) RỘNG NHẤT — lựa chọn của SVM?',
            options: ['Đường 1', 'Đường 4', 'Đường 5'],
            answer: 'Đường 1',
            wrong: {
              'Đường 4': 'Đường 4 có margin 0.73 — rộng thứ nhì, nhưng KHÔNG PHẢI rộng nhất. Bấm qua Đường 1 để so.',
              'Đường 5': 'Đường 5 có margin chỉ 0.34 — hẹp NHẤT trong 5 đường, dễ nhầm nếu có điểm mới lệch nhẹ.',
            },
            done: '✅ Đúng — Đường 1 có margin 1.16, rộng nhất trong 5 đường hợp lệ. Đây chính xác là đường mà SVM sẽ tìm ra: maximum-margin boundary.',
          },
        },
        visual: {
          schema: {
            table_name: 'svm_margin_splits',
            columns: [
              { name: 'x1', type: 'FLOAT', key: '' },
              { name: 'x2', type: 'FLOAT', key: '' },
              { name: 'label', type: 'INT · 0/1', key: 'TARGET' },
            ],
          },
          data_preview: [
            ['-1.06', '-1.03', '0'],
            ['1.73', '0.85', '1'],
            ['-1.90', '-0.15', '0'],
            ['0.90', '1.51', '1'],
            ['-2.26', '-0.32', '0'],
          ],
        },
        mission: 'Build Pipeline(StandardScaler, SVC) cho 3 cấu hình (linear C=0.1/1.0, rbf C=1.0), đo F1 + support vector trên validation.',
      },
      step_2: {
        mcq: [
          {
            question: 'Trong 5 đường phân chia hợp lệ ở ống kính hero, tại sao đường có hành lang RỘNG NHẤT (max margin) được ưu tiên?',
            options: [
              { id: 'a', text: 'Hành lang rộng nghĩa là còn nhiều "khoảng trống an toàn" trước khi điểm mới rơi sai phía — bền vững hơn với nhiễu/dữ liệu mới', correct: true, explanation: 'Đúng — đây là lý do cốt lõi SVM tối ưu margin thay vì chỉ tìm 1 đường tách đúng bất kỳ.' },
              { id: 'b', text: 'Vì nó luôn cho training accuracy 100% cao nhất trong 5 đường', correct: false, explanation: 'Cả 5 đường đều đã tách ĐÚNG 100% training data — accuracy không phải yếu tố phân biệt chúng.' },
              { id: 'c', text: 'Vì nó luôn dùng ít support vector nhất trong mọi trường hợp', correct: false, explanation: 'Không phải quy luật chung — số support vector phụ thuộc cấu trúc dữ liệu, không phải lý do chọn max-margin.' },
              { id: 'd', text: 'Vì nó luôn trùng với đường nối 2 tâm cụm dữ liệu', correct: false, explanation: 'Đường max-margin phụ thuộc CÁC ĐIỂM GẦN BIÊN NHẤT (support vectors), không phải tâm cụm.' },
            ],
          },
          {
            question: 'Kernel trick trong SVM về bản chất LÀ gì?',
            options: [
              { id: 'a', text: 'Một phép tính ĐỘ TƯƠNG TỰ giữa các cặp điểm, như thể chúng ở 1 không gian đặc trưng ẩn nhiều chiều hơn — không cần suy diễn đầy đủ bài toán đối ngẫu hay điều kiện Mercer', correct: true, explanation: 'Đúng — đúng nguyên văn misconception feedback của spec: kernel trick chỉ cần hiểu ở mức "phép tính tương tự".' },
              { id: 'b', text: 'Một cách nén dữ liệu để giảm số chiều trước khi train', correct: false, explanation: 'Đó là việc của PCA (Module 1) — kernel trick không nén dữ liệu, nó thay đổi cách TÍNH TƯƠNG TỰ.' },
              { id: 'c', text: 'Một loại regularization giống L1/L2', correct: false, explanation: 'Không liên quan — regularization kiểm soát độ phức tạp, kernel quyết định HÌNH DẠNG ranh giới có thể học được.' },
              { id: 'd', text: 'Một cách tự động chọn C tối ưu', correct: false, explanation: 'C và kernel là 2 siêu tham số ĐỘC LẬP — kernel không tự chọn C.' },
            ],
          },
          {
            question: 'Bạn thử C=100000 (rất lớn) cho SVM — training accuracy đạt 100%. Bạn kết luận đây là model tốt nhất. Vấn đề ở đây là gì?',
            options: [
              { id: 'a', text: 'Chọn model chỉ dựa vào việc tách HOÀN HẢO tập train — chưa có bằng chứng validation, margin có thể cực hẹp và không ổn định với dữ liệu mới', correct: true, explanation: 'Chính xác — đây là unsafe-but-correct case của spec: model chạy được, nhưng quyết định không được bảo vệ bằng validation.' },
              { id: 'b', text: 'Không có vấn đề gì — accuracy 100% trên train luôn là lựa chọn đúng', correct: false, explanation: 'Sai — accuracy trên train luôn LẠC QUAN GIẢ TẠO, không phản ánh khả năng tổng quát hoá.' },
              { id: 'c', text: 'C=100000 sẽ khiến code báo lỗi, không chạy được', correct: false, explanation: 'Code CHẠY BÌNH THƯỜNG — đó chính là điều khiến bẫy này nguy hiểm ("đúng mà sai"), không phải lỗi kỹ thuật.' },
              { id: 'd', text: 'Vấn đề là phải dùng kernel RBF thay vì linear trong trường hợp này', correct: false, explanation: 'Không liên quan đến kernel — vấn đề là QUY TRÌNH chọn model (test/train accuracy) chứ không phải kernel nào.' },
            ],
          },
        ],
        mini_game: {
          title: 'Thực hành nào giữ ĐÚNG kỷ luật khi tune SVM?',
          instruction: 'Xếp mỗi thực hành vào đúng nhóm.',
          chips: [
            { id: 'chip-valselect', label: 'Chọn C/kernel dựa trên F1 đo trên tập validation' },
            { id: 'chip-scalepipe', label: 'StandardScaler nằm TRONG pipeline, fit cùng lúc với SVC trên train' },
            { id: 'chip-hugec', label: 'Chọn C cực lớn vì training accuracy đạt 100%' },
            { id: 'chip-unscaled', label: 'So sánh khoảng cách/margin khi CHƯA scale dữ liệu' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-valselect': 'dung', 'chip-scalepipe': 'dung', 'chip-hugec': 'sai', 'chip-unscaled': 'sai' },
          success_html: '✅ Chọn bằng validation, scaling nằm trong pipeline — không chọn theo train accuracy, không so khoảng cách khi chưa scale.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Lắp pipeline tune SVM — 3 cấu hình, mỗi cấu hình fit trong Pipeline(StandardScaler, SVC), đo F1 + support vector.',
        blocks: [
          { type: 'py', token: 'X_train, X_val, y_train, y_val = load_svm_splits()', slot: 'z1a' },
          { type: 'py', token: 'configs = [{"kernel": "linear", "C": 0.1}, {"kernel": "linear", "C": 1.0}, {"kernel": "rbf", "C": 1.0, "gamma": "scale"}]', slot: 'z1b' },
          { type: 'py', token: 'model = Pipeline([("scale", StandardScaler()), ("svc", SVC(**cfg))])', slot: 'z2a' },
          { type: 'py', token: 'model.fit(X_train, y_train)', slot: 'z2b' },
          { type: 'py', token: 'score = f1_score(y_val, model.predict(X_val), zero_division=0)', slot: 'z3a' },
          { type: 'py', token: 'report.append({**cfg, "val_f1": score, "support_vectors": int(model.named_steps["svc"].n_support_.sum())})', slot: 'z3b' },
          /* 2 mồi bẫy — unsafe-but-correct của spec: C cực lớn / fit trên train+validation gộp lại */
          { type: 'py', token: 'configs.append({"kernel": "linear", "C": 100000})', slot: 't1' },
          { type: 'py', token: 'model.fit(np.vstack([X_train, X_val]), np.concatenate([y_train, y_val]))', slot: 't2' },
        ],
        drop_zones: [
          { id: 'svm-source', accepts: ['py'], multi: true },
          { id: 'svm-fit', accepts: ['py'], multi: true },
          { id: 'svm-report', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'svm-source': 'X_train, X_val, y_train, y_val = load_svm_splits() configs = [{"kernel": "linear", "C": 0.1}, {"kernel": "linear", "C": 1.0}, {"kernel": "rbf", "C": 1.0, "gamma": "scale"}]',
          'svm-fit': 'model = Pipeline([("scale", StandardScaler()), ("svc", SVC(**cfg))]) model.fit(X_train, y_train)',
          'svm-report': 'score = f1_score(y_val, model.predict(X_val), zero_division=0) report.append({**cfg, "val_f1": score, "support_vectors": int(model.named_steps["svc"].n_support_.sum())})',
        },
        reveal_hints: {
          'svm-source': 'Nạp dữ liệu, khai báo <strong>3 cấu hình</strong>: linear C=0.1, linear C=1.0, rbf C=1.0.',
          'svm-fit': 'Scaling PHẢI nằm <strong>TRONG</strong> Pipeline — fit CHỈ trên <strong>X_train</strong>.',
          'svm-report': 'Đo F1 trên <strong>validation</strong>, đếm support vector bằng <strong>n_support_.sum()</strong>.',
        },
        ml_flow: {
          brand: 'DÒNG CHẢY MARGIN WORKSHOP',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: '300 học sinh · 2 chiều · 2 vòng tròn đồng tâm (phi tuyến)' },
          done_note: 'RBF thắng rõ trên dữ liệu phi tuyến — F1 cao hơn HẲN với ÍT support vector hơn. Click lại trạm bất kỳ để xem lại, rồi sang Bước 4 tự viết code.',
          stations: [
            {
              zones: ['svm-source'],
              icon: '📐', label: 'BASELINE LINEAR', sub: 'StandardScaler + linear SVC', result_kind: 'svm_margin',
              svm: { mode: 'baseline', f1: 0.4, n_sv: 196, n_train: 210 },
              narration: 'Pipeline(StandardScaler, SVC(kernel="linear", C=1.0)) fit trên 210 học sinh: F1 chỉ 0.40, và 196/210 điểm train trở thành support vector — gần như CẢ TẬP train nằm sát margin. Đây là dấu hiệu rõ: đường thẳng không đủ sức tách 2 vòng tròn lồng nhau.',
            },
            {
              zones: ['svm-fit'],
              icon: '🎚️', label: 'TUNE C', sub: 'C=0.1 vs C=1.0', result_kind: 'svm_margin',
              svm: { mode: 'tune', rows: [{ c: 0.1, desc: 'hành lang rộng', f1: 0.414 }, { c: 1.0, desc: 'hành lang hẹp', f1: 0.4 }] },
              narration: 'Đổi C từ 0.1 lên 1.0 (hành lang hẹp lại): F1 gần như không đổi (0.414 → 0.4). Kernel linear vẫn SAI HÌNH DẠNG cho dữ liệu này — tune C không cứu được vấn đề gốc.',
            },
            {
              zones: ['svm-report'],
              icon: '🌀', label: 'THỬ RBF', sub: 'kernel phi tuyến', result_kind: 'svm_margin',
              svm: { mode: 'rbf', f1: 1.0, n_sv: 30, n_train: 210 },
              narration: 'Đổi sang kernel="rbf" (C=1.0, gamma="scale"): F1 nhảy lên 1.0, support vector giảm từ ~196 xuống chỉ 30/210. Đây là bằng chứng CHÍNH ĐÁNG (không phải cảm tính) để chọn RBF cho dữ liệu có cấu trúc phi tuyến.',
            },
          ],
        },
      },
      drag_map: {
        brand: 'DÒNG CHẢY MARGIN WORKSHOP',
        table_sub: 'DataFrame nguồn · 2 chiều hành vi học tập',
        idle_sub: 'Bấm ▶ để chạy pipeline',
        run_label: '▶ Chạy Pipeline',
        table: {
          name: 'svm_margin_splits',
          columns: ['x1', 'x2', 'label'],
          dataRows: [
            ['-1.06', '-1.03', '0'],
            ['1.73', '0.85', '1'],
            ['-1.90', '-0.15', '0'],
            ['0.90', '1.51', '1'],
            ['-2.26', '-0.32', '0'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Fit 3 cấu hình SVC (linear C=0.1, linear C=1.0, rbf C=1.0) trong <code>Pipeline(StandardScaler, SVC)</code> — CHỈ trên train — rồi ghi F1 + support-vector count trên validation vào <code>report</code>.</p>',
        context: {
          scenario: 'StudyLab cần bạn đề xuất MỘT cấu hình SVM có căn cứ — không phải "thử cho tới khi train accuracy đẹp". Bạn phải so sánh nhiều ứng viên bằng cùng 1 quy trình công bằng, rồi để bằng chứng validation quyết định.',
          real_world: 'Giống việc chọn nhà cung cấp bằng cách so giá TRÊN CÙNG 1 đơn hàng mẫu, chứ không phải hỏi từng nơi "giá thấp nhất bạn từng báo là bao nhiêu" — phải so sánh công bằng, cùng điều kiện.',
          steps: [
            'Nạp dữ liệu bằng <code>load_svm_splits()</code>, khai báo 3 cấu hình cần so sánh.',
            'Với mỗi cấu hình: dựng pipeline gồm chuẩn hoá + SVC, fit CHỈ trên train.',
            'Đo F1 trên validation — không phải trên train.',
            'Đếm số support vector, ghi đủ thông tin (cấu hình + F1 + support vector) vào báo cáo cho mỗi ứng viên.',
          ],
          hint_explore: 'Muốn xem shape dữ liệu? Gõ <code>print(X_train.shape, X_val.shape)</code> rồi Run.',
          expected: 'Biến `report` là list 3 dict (linear C=0.1, linear C=1.0, rbf C=1.0), mỗi dict có val_f1 và support_vectors khớp engine.',
        },
        hints: [
          { level: 1, text: 'Nhập <code>from sklearn.pipeline import Pipeline</code>, <code>from sklearn.preprocessing import StandardScaler</code>, <code>from sklearn.svm import SVC</code>, <code>from sklearn.metrics import f1_score</code>, <code>from ml_lab import load_svm_splits</code>.' },
          { level: 2, text: '<code>X_train, X_val, y_train, y_val = load_svm_splits()</code>. Khai báo <code>configs</code> = list 3 dict cấu hình (kernel, C, gamma nếu rbf).' },
          { level: 3, text: 'Với mỗi <code>cfg</code> trong configs: <code>model = Pipeline([("scale", StandardScaler()), ("svc", SVC(**cfg))])</code>, <code>model.fit(X_train, y_train)</code> — CHỈ train. Đo <code>f1_score(y_val, model.predict(X_val), zero_division=0)</code>.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>from sklearn.pipeline import Pipeline<br>from sklearn.preprocessing import StandardScaler<br>from sklearn.svm import SVC<br>from sklearn.metrics import f1_score<br>from ml_lab import load_svm_splits<br>X_train, X_val, y_train, y_val = load_svm_splits()<br>configs = [<br>&nbsp;&nbsp;&nbsp;&nbsp;{"kernel": "linear", "C": 0.1},<br>&nbsp;&nbsp;&nbsp;&nbsp;{"kernel": "linear", "C": 1.0},<br>&nbsp;&nbsp;&nbsp;&nbsp;{"kernel": "rbf", "C": 1.0, "gamma": "scale"},<br>]<br>report = []<br>for cfg in configs:<br>&nbsp;&nbsp;&nbsp;&nbsp;model = Pipeline([("scale", StandardScaler()), ("svc", SVC(**cfg))])<br>&nbsp;&nbsp;&nbsp;&nbsp;model.fit(X_train, y_train)<br>&nbsp;&nbsp;&nbsp;&nbsp;score = f1_score(y_val, model.predict(X_val), zero_division=0)<br>&nbsp;&nbsp;&nbsp;&nbsp;n_sv = int(model.named_steps["svc"].n_support_.sum())<br>&nbsp;&nbsp;&nbsp;&nbsp;report.append({**cfg, "val_f1": score, "support_vectors": n_sv})<br>print(report)</code>' },
        ],
        grader_fn: 'grade_lesson_c3_5',
        success_message: 'Bạn vừa tune và bảo vệ 1 SVM bằng bằng chứng validation THẬT — margin, support vector, F1 — không chọn C cực lớn theo cảm tính. Khép Module 2!',
        xp_reward: 65,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.pipeline import Pipeline',
      },
    },

    // ╔══════════════════════════════════════════════════════════╗
    // ║  M3 — CLUSTERING & STRUCTURE DISCOVERY                   ║
    // ╚══════════════════════════════════════════════════════════╝
    {
      id: 'c3_l6',
      index: 6,
      title: 'Clustering không phải classification',
      subtitle: 'Mục tiêu không giám sát, ID cụm tuỳ ý và hợp đồng thí nghiệm',
      module: 3,
      module_title: 'M3 · Clustering & Structure Discovery',
      estimated_minutes: 23,
      xp_reward: 65,
      achievement: { name: 'Contract Keeper', desc: 'Thiết kế 1 thí nghiệm unsupervised đúng hợp đồng — không để nhãn lọt vào fit.' },
      story: {
        tag: '🧬 StudyLab · Advanced Modeling Lab',
        hook: 'Module 2 xong — bạn đã biết tách 2 lớp có nhãn. Giờ StudyLab muốn thử điều khác: "học sinh tự nhiên chia thành mấy NHÓM hành vi, nếu KHÔNG nói trước ai Đậu ai Rớt?" Một bạn đồng nghiệp chạy KMeans, thấy cluster 0 toàn học sinh điểm thấp, và tuyên bố "cluster 0 = nhóm yếu!" — rồi bắt đầu thử đủ loại feature/k để "cụm 0" khớp CÀNG NHIỀU CÀNG TỐT với nhãn Rớt. Bài này bạn sẽ học vì sao cả 2 việc đó đều VI PHẠM hợp đồng của một thí nghiệm không giám sát thật sự.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Tách rạch ròi mục tiêu SUPERVISED (dự đoán nhãn có sẵn) khỏi UNSUPERVISED (tìm cấu trúc không nhãn).',
            'Giải thích vì sao cluster ID chỉ là số hiệu triển khai — hoán vị được, không mang nghĩa cố định.',
            'Thiết kế 1 hợp đồng thí nghiệm: chọn feature/thuật toán/metric TRƯỚC, chỉ audit bằng nhãn ngoài SAU KHI fit.',
          ],
        },
        glossary: [
          { term: 'Unsupervised learning', vi: 'Học không giám sát', accent: '#22D3EE', def: 'Model chỉ nhìn X, không có nhãn y trong lúc fit — mục tiêu là tìm CẤU TRÚC, không phải dự đoán nhãn có sẵn.', ex: 'KMeans().fit(X)', out: '' },
          { term: 'Cluster ID', vi: 'Số hiệu cụm', accent: '#67E8F9', def: 'Nhãn TRIỂN KHAI (0, 1, 2…) mà thuật toán gán cho mỗi cụm — thứ tự hoàn toàn ngẫu nhiên, KHÔNG mang ý nghĩa cố định.', ex: 'cluster 0 ở lần chạy này có thể là cluster 2 ở lần khác', out: '' },
          { term: 'Permutation invariance', vi: 'Bất biến theo hoán vị', accent: '#0891B2', def: 'Đổi tên cluster 0↔1↔2 không làm thay đổi Ý NGHĨA của kết quả phân cụm — metric đúng phải KHÔNG đổi khi hoán vị ID.', ex: 'ARI(gốc) = ARI(hoán vị)', out: '' },
          { term: 'Silhouette score', vi: 'Điểm silhouette', accent: '#67E8F9', def: 'Metric NỘI BỘ đo cụm có tách biệt và gắn kết hay không — tính được mà KHÔNG cần nhãn ngoài.', ex: '0.60', out: 'silhouette_score(X, cluster_ids)' },
          { term: 'Adjusted Rand Index (ARI)', vi: 'Chỉ số Rand hiệu chỉnh', accent: '#A5F3FC', def: 'Metric NGOÀI so 2 cách phân nhóm (cluster_id vs nhãn thật) — bất biến theo hoán vị, đúng đắn hơn "accuracy" thô.', ex: '0.95', out: 'adjusted_rand_score(y, cluster_ids)' },
          { term: 'Experiment contract', vi: 'Hợp đồng thí nghiệm', accent: '#22D3EE', def: 'Bản khai rõ TRƯỚC khi fit: dùng feature nào, thuật toán nào, đo bằng metric nào — tránh "nhìn nhãn rồi mới quyết định thiết kế".', ex: '', out: '' },
        ],
        primer: {
          goal: [
            'So 2 góc nhìn trên CÙNG dữ liệu: "phân loại" (có nhãn) vs "phân cụm" (nhãn niêm phong).',
            'Fit KMeans(k=3) CHỈ trên X, đo silhouette, rồi MỚI mở nhãn ngoài để audit bằng ARI.',
          ],
          intro: '<p>Classification và clustering có thể dùng CÙNG một tập điểm dữ liệu — nhưng là 2 câu hỏi hoàn toàn khác nhau. Classification hỏi "nhãn của điểm này là gì?" (có đáp án đúng để học theo). Clustering hỏi "các điểm này tự nhiên gom nhóm thế nào?" (không có đáp án — chỉ có cấu trúc để khám phá). Trộn lẫn 2 câu hỏi này là nguồn gốc của rất nhiều kết luận sai trong thực tế.</p>',
          example: '',
        },
        intro: 'Cùng điểm dữ liệu — nhưng 2 câu hỏi hoàn toàn khác nhau.',
        concept_cards: [
          { icon: 'fa-user-secret', title: 'Nhãn niêm phong khi fit', body: 'KMeans.fit() chỉ được thấy X — nhãn thật (nếu có) phải được giấu đi cho tới khi audit.' },
          { icon: 'fa-shuffle', title: 'ID là số hiệu, không phải tên gọi', body: "Cluster 0 không mặc định là 'yếu' — đổi thứ tự ID không đổi bản chất phân cụm." },
          { icon: 'fa-magnifying-glass', title: 'Đo trong trước, đo ngoài sau', body: 'Silhouette (nội bộ) đánh giá NGAY sau khi fit; ARI (ngoại bộ) chỉ dùng để audit SAU CÙNG, nếu nhãn thật tồn tại.' },
        ],
        contract_lens: {
          title: 'CÙNG ĐIỂM, CÂU HỎI KHÁC NHAU',
          intro: 'Bấm 2 tab — cùng 40 học sinh, cùng toạ độ, nhưng model THẤY thông tin khác nhau.',
          points: [
            [-0.64, -1.01, 0, 2], [-0.93, -1.20, 0, 2], [1.11, -0.13, 2, 1], [0.96, -0.36, 2, 1], [-0.41, 0.79, 1, 0],
            [0.87, -0.33, 2, 1], [1.79, -1.23, 2, 1], [-1.18, -0.95, 0, 2], [0.83, -0.60, 2, 1], [-1.47, -1.38, 0, 2],
            [1.02, -0.57, 2, 1], [-1.14, -0.18, 0, 2], [-0.07, 1.44, 1, 0], [-1.16, -1.00, 0, 2], [0.96, 0.06, 2, 1],
            [-0.52, -1.08, 0, 2], [-0.91, -0.52, 0, 2], [-1.36, -0.54, 0, 2], [-1.32, -0.88, 0, 2], [1.07, -1.02, 2, 1],
            [-1.04, -1.02, 0, 2], [1.38, 0.09, 2, 1], [0.78, -0.06, 2, 1], [0.36, 1.81, 1, 0], [-0.45, 1.94, 1, 0],
            [-1.08, -0.27, 0, 2], [0.89, 0.92, 2, 0], [-0.22, 0.02, 1, 0], [0.52, 1.41, 1, 0], [0.22, 1.47, 1, 0],
            [-0.89, -0.41, 0, 2], [1.06, -0.36, 2, 1], [-0.33, 0.18, 1, 0], [-0.94, -0.93, 0, 2], [-1.52, -0.78, 0, 2],
            [-1.86, -1.08, 0, 2], [0.65, 1.29, 1, 0], [1.23, -0.02, 2, 1], [-0.61, -0.02, 0, 2], [1.61, 0.89, 2, 1],
          ],
          riddle: {
            prompt: 'Dòng code nào ở tab "PHÂN LOẠI" khiến nó là workflow SUPERVISED?',
            options: ['model.fit(X, y)', 'KMeans().fit(X)', 'Cả 2 đều supervised'],
            answer: 'model.fit(X, y)',
            wrong: {
              'KMeans().fit(X)': 'KMeans().fit(X) chỉ nhận X — đây chính là workflow UNSUPERVISED (tab "Phân cụm"), không phải supervised.',
              'Cả 2 đều supervised': 'Chỉ 1 trong 2 có quyền truy cập nhãn y lúc fit — đó là điểm phân biệt cốt lõi giữa 2 workflow.',
            },
            done: '✅ Đúng — model.fit(X, y) THẤY nhãn thật (Yếu/Trung bình/Giỏi), còn KMeans().fit(X) hoàn toàn KHÔNG thấy gì ngoài toạ độ. Bấm qua tab "PHÂN CỤM" để thấy ID cụm A/B/C không hề trùng thứ tự với nhãn thật.',
          },
        },
        visual: {
          schema: {
            table_name: 'unsupervised_contract',
            columns: [
              { name: 'activity_score', type: 'FLOAT', key: '' },
              { name: 'consistency_score', type: 'FLOAT', key: '' },
              { name: 'external_label', type: 'INT · niêm phong', key: 'AUDIT ONLY' },
            ],
          },
          data_preview: [
            ['-1.61', '-2.14', '0'],
            ['-2.33', '-2.43', '0'],
            ['2.79', '-0.84', '2'],
            ['2.42', '-1.18', '2'],
            ['-1.02', '0.52', '1'],
          ],
        },
        mission: 'Fit KMeans(k=3) CHỈ trên X, đo silhouette, rồi audit bằng ARI (gốc + sau hoán vị ID) SAU KHI fit xong.',
      },
      step_2: {
        mcq: [
          {
            question: 'Trong 2 dòng code: (a) <code>model.fit(X, y)</code> và (b) <code>KMeans().fit(X)</code> — dòng nào là SUPERVISED?',
            options: [
              { id: 'a', text: '(a) — vì nó nhận cả X và y (nhãn) khi huấn luyện', correct: true, explanation: 'Đúng — có quyền truy cập nhãn lúc fit là đặc trưng cốt lõi của supervised learning.' },
              { id: 'b', text: '(b) — vì KMeans phức tạp hơn model thường', correct: false, explanation: 'Độ phức tạp thuật toán không liên quan — điểm phân biệt là CÓ hay KHÔNG nhãn lúc fit.' },
              { id: 'c', text: 'Cả 2 đều supervised vì đều gọi .fit()', correct: false, explanation: 'Gọi .fit() không tự động là supervised — phải xem THAM SỐ truyền vào có nhãn hay không.' },
              { id: 'd', text: 'Cả 2 đều unsupervised vì đều dùng X', correct: false, explanation: 'Dòng (a) có thêm y — đó chính là điểm khiến nó supervised.' },
            ],
          },
          {
            question: 'Sau khi chạy KMeans(k=3), cluster 0 gồm toàn học sinh có final_score thấp trong dữ liệu audit. Kết luận nào ĐÚNG?',
            options: [
              { id: 'a', text: 'Đây là một quan sát HẬU KIỂM (post-hoc) — không có gì đảm bảo cluster 0 LUÔN là "học sinh yếu" ở lần chạy khác, vì ID được gán ngẫu nhiên', correct: true, explanation: 'Chính xác — đúng nguyên văn misconception feedback của spec: ID là nhãn triển khai, không phải sự thật cố định.' },
              { id: 'b', text: 'Cluster 0 luôn đại diện cho học sinh yếu trong mọi lần chạy KMeans', correct: false, explanation: 'Sai — đổi seed hoặc thứ tự khởi tạo, cluster "yếu" có thể mang ID khác (1 hoặc 2).' },
              { id: 'c', text: 'Đây là bằng chứng KMeans đã học được khái niệm "yếu/giỏi"', correct: false, explanation: 'KMeans không hề biết khái niệm "yếu/giỏi" — nó chỉ nhóm theo khoảng cách hình học trong X.' },
              { id: 'd', text: 'Nên đổi tên biến cluster_id thành weak_strong_label để code rõ ràng hơn', correct: false, explanation: 'Đặt tên như vậy sẽ CỐ ĐỊNH SAI một ý nghĩa chưa được xác nhận lại ở lần chạy khác — nguy hiểm hơn là rõ ràng.' },
            ],
          },
          {
            question: 'Một bạn thử NHIỀU tổ hợp feature + giá trị k khác nhau, mỗi lần đều đối chiếu với nhãn ẩn, rồi chọn tổ hợp có ARI CAO NHẤT — sau đó gọi kết quả là "phát hiện cấu trúc không giám sát". Vấn đề ở đây là gì?',
            options: [
              { id: 'a', text: 'Nhãn đã được dùng để HƯỚNG DẪN việc chọn feature/k — đây là label-guided fitting nguỵ trang thành unsupervised, vi phạm hợp đồng thí nghiệm', correct: true, explanation: 'Chính xác — đây là unsafe-but-correct case của spec: clustering vẫn chạy được, nhưng hợp đồng thí nghiệm đã bị phá vỡ.' },
              { id: 'b', text: 'Không có vấn đề gì — miễn ARI cuối cùng cao là được', correct: false, explanation: 'Có vấn đề nghiêm trọng: quy trình CHỌN đã dùng nhãn, nên kết quả không còn là "phát hiện không giám sát" thật.' },
              { id: 'c', text: 'Vấn đề là ARI không phải một metric hợp lệ', correct: false, explanation: 'ARI hoàn toàn hợp lệ — vấn đề không nằm ở metric, mà ở QUY TRÌNH dùng nhãn để chọn thiết kế.' },
              { id: 'd', text: 'Vấn đề là nên dùng silhouette thay vì ARI', correct: false, explanation: 'Dù dùng silhouette, nếu vẫn LẶP LẠI dựa trên nhãn ẩn để chọn, vấn đề tương tự vẫn xảy ra.' },
            ],
          },
        ],
        mini_game: {
          title: 'Thực hành nào giữ ĐÚNG hợp đồng thí nghiệm unsupervised?',
          instruction: 'Xếp mỗi thực hành vào đúng nhóm.',
          chips: [
            { id: 'chip-sealfit', label: 'Fit KMeans CHỈ trên X, giữ nhãn ngoài niêm phong' },
            { id: 'chip-orderaudit', label: 'Tính silhouette (nội bộ) trước, ARI (audit) sau khi fit xong' },
            { id: 'chip-labeltune', label: 'Thử nhiều feature/k, chọn theo ARI với nhãn ẩn, rồi gọi là unsupervised' },
            { id: 'chip-nametoosoon', label: 'Đặt tên biến cluster_id là "weak_group"/"strong_group" ngay sau khi fit' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-sealfit': 'dung', 'chip-orderaudit': 'dung', 'chip-labeltune': 'sai', 'chip-nametoosoon': 'sai' },
          success_html: '✅ Fit chỉ trên X, đo nội bộ trước rồi mới audit ngoài — không dùng nhãn để chọn thiết kế, không đặt tên ngữ nghĩa quá sớm.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Lắp pipeline unsupervised contract — fit KMeans chỉ trên X, đo silhouette, rồi audit bằng ARI sau khi fit.',
        blocks: [
          { type: 'py', token: 'X, external_labels = load_unsupervised_contract_data()', slot: 'z1a' },
          { type: 'py', token: 'X_scaled = StandardScaler().fit_transform(X)', slot: 'z1b' },
          { type: 'py', token: 'cluster_ids = KMeans(n_clusters=3, n_init=20, random_state=42).fit_predict(X_scaled)', slot: 'z2a' },
          { type: 'py', token: 'silhouette_score(X_scaled, cluster_ids)', slot: 'z2b' },
          { type: 'py', token: 'adjusted_rand_score(external_labels, cluster_ids)', slot: 'z3a' },
          { type: 'py', token: 'adjusted_rand_score(external_labels, np.choose(cluster_ids, [2, 0, 1]))', slot: 'z3b' },
          /* 2 mồi bẫy — unsafe-but-correct của spec: nhãn lọt vào fit / báo cáo "accuracy" thô trên ID gốc */
          { type: 'py', token: 'cluster_ids = KMeans(n_clusters=3, n_init=20, random_state=42).fit_predict(X_scaled, external_labels)', slot: 't1' },
          { type: 'py', token: 'naive_acc = (cluster_ids == external_labels).mean()', slot: 't2' },
        ],
        drop_zones: [
          { id: 'cluster-contract', accepts: ['py'], multi: true },
          { id: 'cluster-fit', accepts: ['py'], multi: true },
          { id: 'cluster-audit', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'cluster-contract': 'X, external_labels = load_unsupervised_contract_data() X_scaled = StandardScaler().fit_transform(X)',
          'cluster-fit': 'cluster_ids = KMeans(n_clusters=3, n_init=20, random_state=42).fit_predict(X_scaled) silhouette_score(X_scaled, cluster_ids)',
          'cluster-audit': 'adjusted_rand_score(external_labels, cluster_ids) adjusted_rand_score(external_labels, np.choose(cluster_ids, [2, 0, 1]))',
        },
        reveal_hints: {
          'cluster-contract': 'Nạp <strong>X và external_labels</strong> (niêm phong), chuẩn hoá X.',
          'cluster-fit': 'Fit KMeans CHỈ trên <strong>X_scaled</strong> (không có external_labels), rồi đo <strong>silhouette_score</strong>.',
          'cluster-audit': 'MỚI dùng <strong>external_labels</strong> để tính ARI — cả bản gốc lẫn sau khi hoán vị ID bằng <strong>np.choose</strong>.',
        },
        ml_flow: {
          brand: 'DÒNG CHẢY UNSUPERVISED CONTRACT BUILDER',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: '240 học sinh · 2 feature hành vi · nhãn audit niêm phong' },
          done_note: 'ARI không đổi khi hoán vị ID — "accuracy" thô thì có. Click lại trạm bất kỳ để xem lại, rồi sang Bước 4 tự viết code.',
          stations: [
            {
              zones: ['cluster-contract'],
              icon: '📋', label: 'HỢP ĐỒNG', sub: 'chỉ X, nhãn niêm phong', result_kind: 'cluster_contract',
              cluster: { mode: 'contract' },
              narration: 'Trước khi fit bất cứ gì: khai báo feature (activity_score, consistency_score), thuật toán (KMeans k=3), metric nội bộ (silhouette) — và xác nhận target/nhãn KHÔNG lọt vào bất kỳ đâu trong bước fit.',
            },
            {
              zones: ['cluster-fit'],
              icon: '🔍', label: 'FIT + SILHOUETTE', sub: 'KMeans(k=3), không nhãn', result_kind: 'cluster_contract',
              cluster: { mode: 'fit', silhouette: 0.5999 },
              narration: 'KMeans(k=3) fit trên 240 học sinh — CHỈ nhìn X_scaled. Silhouette = 0.60: cụm khá tách biệt và gắn kết, một bằng chứng NỘI BỘ, không cần biết nhãn thật.',
            },
            {
              zones: ['cluster-audit'],
              icon: '🔓', label: 'AUDIT SAU FIT', sub: 'mở nhãn niêm phong', result_kind: 'cluster_contract',
              cluster: { mode: 'audit', ari: 0.9508, naive_acc: 0.0042 },
              narration: 'Mở nhãn niêm phong: ARI = 0.951 — RẤT cao, và giữ NGUYÊN sau khi hoán vị cluster_id. Trong khi "accuracy" thô so trực tiếp cluster_id với nhãn chỉ 0.4% (gần 0!) — vì ID 0/1/2 của KMeans tình cờ không trùng thứ tự nhãn thật.',
            },
          ],
        },
      },
      drag_map: {
        brand: 'DÒNG CHẢY UNSUPERVISED CONTRACT BUILDER',
        table_sub: 'DataFrame nguồn · 2 feature hành vi học tập',
        idle_sub: 'Bấm ▶ để chạy pipeline',
        run_label: '▶ Chạy Pipeline',
        table: {
          name: 'unsupervised_contract',
          columns: ['activity_score', 'consistency_score', 'external_label'],
          dataRows: [
            ['-1.61', '-2.14', '0'],
            ['-2.33', '-2.43', '0'],
            ['2.79', '-0.84', '2'],
            ['2.42', '-1.18', '2'],
            ['-1.02', '0.52', '1'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Fit <code>KMeans(n_clusters=3)</code> CHỈ trên X đã chuẩn hoá, in <code>silhouette</code>, rồi MỚI dùng <code>external_labels</code> để in <code>ARI gốc</code> và <code>ARI sau hoán vị</code> (phải bằng nhau).</p>',
        context: {
          scenario: 'StudyLab muốn biết học sinh tự nhiên chia thành mấy nhóm hành vi — KHÔNG dùng nhãn Đậu/Rớt để "mách" cho thuật toán. Bạn cần chứng minh quy trình của mình sạch: nhãn hoàn toàn không tham gia vào việc fit, và metric bạn dùng để audit không nhạy cảm với việc thuật toán đặt số hiệu cụm theo thứ tự nào.',
          real_world: 'Giống việc niêm phong bài thi trước khi chấm điểm bằng mã số phách — người chấm không được biết tên thí sinh cho tới khi CHẤM XONG mới mở phách để ghép điểm. Mở phách trước khi chấm sẽ làm hỏng tính khách quan.',
          steps: [
            'Nạp X và external_labels bằng <code>load_unsupervised_contract_data()</code> — coi external_labels như đã niêm phong.',
            'Chuẩn hoá X, fit KMeans CHỈ trên X đã chuẩn hoá.',
            'Tính 1 metric NỘI BỘ (không cần nhãn) để đánh giá cụm.',
            'MỞ nhãn ngoài, tính ARI theo cluster_id gốc VÀ theo cluster_id đã hoán vị — 2 kết quả phải khớp nhau.',
          ],
          hint_explore: 'Muốn xem phân bố nhãn? Gõ <code>import numpy as np; print(np.bincount(load_unsupervised_contract_data()[1]))</code> rồi Run.',
          expected: 'In "silhouette" (~0.6), "external ARI" và "permuted ARI" — 2 giá trị ARI phải GẦN BẰNG NHAU.',
        },
        hints: [
          { level: 1, text: 'Nhập <code>from sklearn.cluster import KMeans</code>, <code>from sklearn.preprocessing import StandardScaler</code>, <code>from sklearn.metrics import silhouette_score, adjusted_rand_score</code>, <code>from ml_lab import load_unsupervised_contract_data</code>.' },
          { level: 2, text: '<code>X, external_labels = load_unsupervised_contract_data()</code>. Chuẩn hoá: <code>X_scaled = StandardScaler().fit_transform(X)</code>.' },
          { level: 3, text: '<code>cluster_ids = KMeans(n_clusters=3, n_init=20, random_state=42).fit_predict(X_scaled)</code> — CHỈ 1 arg, không có external_labels. In <code>silhouette_score(X_scaled, cluster_ids)</code>, rồi MỚI in <code>adjusted_rand_score(external_labels, cluster_ids)</code>.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>from sklearn.cluster import KMeans<br>from sklearn.preprocessing import StandardScaler<br>from sklearn.metrics import silhouette_score, adjusted_rand_score<br>from ml_lab import load_unsupervised_contract_data<br>X, external_labels = load_unsupervised_contract_data()<br>X_scaled = StandardScaler().fit_transform(X)<br>cluster_ids = KMeans(n_clusters=3, n_init=20, random_state=42).fit_predict(X_scaled)<br>print("silhouette", silhouette_score(X_scaled, cluster_ids))<br>print("external ARI", adjusted_rand_score(external_labels, cluster_ids))<br>permuted = np.choose(cluster_ids, [2, 0, 1])<br>print("permuted ARI", adjusted_rand_score(external_labels, permuted))</code>' },
        ],
        grader_fn: 'grade_lesson_c3_6',
        success_message: 'Bạn vừa thiết kế 1 thí nghiệm unsupervised ĐÚNG hợp đồng — nhãn niêm phong khi fit, đo nội bộ trước, audit permutation-invariant sau. Mở màn Module 3!',
        xp_reward: 65,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.cluster import KMeans',
      },
    },

    {
      id: 'c3_l7',
      index: 7,
      title: 'K-means: gán, cập nhật và lặp lại',
      subtitle: 'Centroid, khởi tạo, chuẩn hoá và những hình dạng K-means thất bại',
      module: 3,
      module_title: 'M3 · Clustering & Structure Discovery',
      estimated_minutes: 24,
      xp_reward: 65,
      achievement: { name: 'Stability Auditor', desc: 'Chạy 1 thí nghiệm K-means tái lập được và biết khi nào KHÔNG nên tin nó.' },
      story: {
        tag: '🧬 StudyLab · Advanced Modeling Lab',
        hook: 'Bài trước bạn đã học fit KMeans đúng hợp đồng. Nhưng khi chạy thử trên dữ liệu hành vi mới, inertia hiện ra là "81549.7" — một con số KHỔNG LỒ, vô nghĩa. Hoá ra 1 feature bị lệch thang đo hàng chục lần so với feature kia. Tệ hơn, chạy lại với seed khác cho ra 1 phân cụm HOÀN TOÀN khác. Bài này bạn sẽ học cách chạy K-means CÓ KIỂM SOÁT — và nhận ra khi nào chính bản thân K-means không phù hợp với hình dạng dữ liệu.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Thực hiện bằng tay vòng lặp gán (assignment) và cập nhật (update) centroid trên dữ liệu nhỏ.',
            'Giải thích inertia là tổng lỗi bình phương nội bộ — KHÔNG phải bằng chứng cụm "có thật".',
            'Dùng scaling, n_init và random_state một cách CÓ CHỦ ĐÍCH, và nhận diện khi K-means không phù hợp hình dạng dữ liệu.',
          ],
        },
        glossary: [
          { term: 'Assignment step', vi: 'Bước gán', accent: '#22D3EE', def: 'Gán mỗi điểm vào centroid GẦN NHẤT (theo khoảng cách Euclid) — bước đầu của mỗi vòng lặp K-means.', ex: 'labels = argmin(distance)', out: '' },
          { term: 'Update step', vi: 'Bước cập nhật', accent: '#67E8F9', def: 'Dịch mỗi centroid tới TRUNG BÌNH của các điểm vừa được gán cho nó — bước thứ 2, lặp lại tới khi ổn định.', ex: 'centroid = mean(points trong cụm)', out: '' },
          { term: 'Inertia', vi: 'Quán tính (tổng lỗi bình phương)', accent: '#0891B2', def: 'Tổng bình phương khoảng cách từ mỗi điểm tới centroid của nó — thước đo "gọn" nội bộ, KHÔNG chứng minh cụm là thật.', ex: '90.24', out: 'model.inertia_' },
          { term: 'n_init', vi: 'Số lần khởi tạo', accent: '#67E8F9', def: 'Số lần chạy K-means với centroid khởi đầu KHÁC NHAU, giữ lại lần cho inertia thấp nhất — giảm rủi ro kẹt local minimum.', ex: 'n_init=20', out: '' },
          { term: 'Local minimum', vi: 'Cực tiểu cục bộ', accent: '#A5F3FC', def: 'Một kết quả K-means ổn định nhưng KHÔNG phải nghiệm tốt nhất có thể — phụ thuộc vào centroid khởi đầu.', ex: '', out: '' },
          { term: 'Non-globular shape', vi: 'Hình dạng không lồi cầu', accent: '#22D3EE', def: 'Cấu trúc dữ liệu KHÔNG có dạng cụm tròn/lồi (vd lưỡi liềm, xoắn ốc) — K-means (giả định cụm hình cầu) thất bại trên dạng này.', ex: '2 lưỡi liềm lồng nhau', out: '' },
        ],
        primer: {
          goal: [
            'Kéo slider qua 4 vòng lặp gán→cập nhật thật — xem centroid di chuyển, inertia giảm dần.',
            'Scale X, fit KMeans với n_init/random_state tường minh qua nhiều seed, đo độ ổn định bằng ARI.',
          ],
          intro: '<p>K-means chỉ làm đúng 2 việc lặp đi lặp lại: GÁN mỗi điểm vào centroid gần nhất, rồi CẬP NHẬT centroid về trung bình của các điểm vừa gán. Đơn giản — nhưng kết quả phụ thuộc rất nhiều vào: centroid khởi đầu ở đâu, dữ liệu đã chuẩn hoá chưa, và dữ liệu có thật sự "tròn" hay không.</p>',
          example: '',
        },
        intro: 'Gán rồi cập nhật, gán rồi cập nhật — tới khi không còn gì đổi.',
        concept_cards: [
          { icon: 'fa-arrows-rotate', title: '2 bước, lặp tới hội tụ', body: 'Gán điểm → cập nhật centroid → lặp lại — dừng khi không còn điểm nào đổi cụm.' },
          { icon: 'fa-ruler', title: 'Inertia không chứng minh cụm thật', body: "Inertia luôn giảm khi tăng k — thấp không có nghĩa là cụm 'đúng', chỉ là 'gọn hơn'." },
          { icon: 'fa-shapes', title: 'K-means chỉ thấy hình cầu', body: 'Centroid + khoảng cách Euclid giả định cụm lồi/tròn — lưỡi liềm, vòng xoắn sẽ bị chia sai.' },
        ],
        kmeans_lens: {
          title: 'CENTROID DI CHUYỂN THEO HỌC SINH',
          intro: 'Kéo slider qua từng vòng lặp — xem centroid (dấu +) di chuyển và inertia giảm dần.',
          points: [[-1.87, -1.93], [-1.49, -1.59], [-2.66, -2.06], [-2.11, -1.67], [-1.90, -1.92], [2.34, 1.97], [2.01, 2.15], [1.51, 2.02], [2.08, 1.54], [2.19, 1.82], [2.17, -2.23], [1.85, -2.60], [2.03, -1.96], [1.76, -2.21], [2.23, -3.15]],
          iterations: [
            { centroids: [[-1.0, 1.0], [0.5, -0.5], [1.5, 1.5]], labels: [1, 1, 0, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1], inertia: 74.66 },
            { centroids: [[-2.66, -2.06], [0.3, -2.14], [2.03, 1.9]], labels: [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1], inertia: 19.98 },
            { centroids: [[-2.01, -1.83], [2.01, -2.43], [2.03, 1.9]], labels: [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1], inertia: 2.53 },
            { centroids: [[-2.01, -1.83], [2.01, -2.43], [2.03, 1.9]], labels: [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1], inertia: 2.53 },
          ],
          riddle: {
            prompt: 'Vòng lặp nào là lần ĐẦU TIÊN K-means đạt trạng thái HỘI TỤ (centroid không đổi nữa)?',
            options: ['Vòng 1', 'Vòng 2', 'Vòng 3'],
            answer: 'Vòng 2',
            wrong: {
              'Vòng 1': 'Vòng 1 (inertia=19.98) centroid vẫn còn di chuyển đáng kể so với vòng 0 — chưa hội tụ.',
              'Vòng 3': 'Vòng 3 giống HỆT vòng 2 (centroid + inertia không đổi) — nhưng đó là XÁC NHẬN hội tụ, không phải LẦN ĐẦU đạt được.',
            },
            done: '✅ Đúng — Vòng 2 là lần đầu centroid và inertia (2.53) ổn định; vòng 3 chỉ lặp lại y hệt để xác nhận. Đây chính là tiêu chí dừng của K-means.',
          },
        },
        visual: {
          schema: {
            table_name: 'kmeans_lab',
            columns: [
              { name: 'activity_score', type: 'FLOAT', key: '' },
              { name: 'engagement_minutes', type: 'FLOAT · lệch thang ×20', key: '' },
            ],
          },
          data_preview: [
            ['0.27', '72.21'],
            ['-2.00', '23.57'],
            ['1.25', '47.02'],
            ['2.55', '-25.41'],
            ['-3.96', '-46.05'],
          ],
        },
        mission: 'Scale X, fit KMeans với n_init/random_state tường minh qua 4 seed, đo stability bằng ARI, báo cáo inertia + silhouette.',
      },
      step_2: {
        mcq: [
          {
            question: 'Inertia của K-means LUÔN giảm (hoặc giữ nguyên) khi tăng số cụm k. Vậy có thể dùng inertia làm tiêu chí DUY NHẤT để chọn k không?',
            options: [
              { id: 'a', text: 'Không — vì inertia luôn giảm khi k tăng, chọn theo inertia thấp nhất sẽ luôn chọn k LỚN NHẤT có thể (k = số điểm), vô nghĩa', correct: true, explanation: 'Đúng — đúng nguyên văn misconception feedback của spec.' },
              { id: 'b', text: 'Có — k cho inertia thấp nhất luôn là lựa chọn tốt nhất', correct: false, explanation: 'Sai — theo logic này k tối ưu sẽ luôn là "mỗi điểm 1 cụm", vô nghĩa với mục tiêu tìm cấu trúc.' },
              { id: 'c', text: 'Không — vì inertia không liên quan gì đến việc chọn k', correct: false, explanation: 'Quá cực đoan — inertia VẪN là 1 tín hiệu hữu ích (elbow method), chỉ không đủ làm tiêu chí DUY NHẤT.' },
              { id: 'd', text: 'Có, miễn là dùng n_init đủ lớn', correct: false, explanation: 'n_init chỉ giúp tránh local minimum ở 1 giá trị k cố định — không giải quyết vấn đề "inertia luôn giảm theo k".' },
            ],
          },
          {
            question: 'Một bạn thử 50 seed khác nhau, báo cáo seed cho inertia THẤP NHẤT, nhưng không nói rằng kết quả rất KHÔNG ổn định giữa các seed, và dữ liệu thực ra có hình lưỡi liềm. Vấn đề ở đây là gì?',
            options: [
              { id: 'a', text: 'Chạy hợp lệ về mặt số liệu, nhưng giấu đi bất ổn định (không cùng 1 nghiệm) và giả định hình cầu không phù hợp với dữ liệu thật — kết luận không được bảo vệ', correct: true, explanation: 'Chính xác — đây là unsafe-but-correct case của spec: numerically valid nhưng model assumption unsupported.' },
              { id: 'b', text: 'Không có vấn đề — inertia thấp nhất luôn là bằng chứng đủ mạnh', correct: false, explanation: 'Sai — chọn "đẹp nhất trong 50 lần thử" mà không báo cáo độ ổn định là chọn lọc kết quả có lợi (cherry-picking).' },
              { id: 'c', text: 'Vấn đề duy nhất là dùng quá nhiều seed (50 là thừa)', correct: false, explanation: 'Số lượng seed không phải vấn đề — vấn đề là CHỌN LỌC và GIẤU thông tin bất lợi.' },
              { id: 'd', text: 'Vấn đề là phải dùng DBSCAN thay vì K-means trong MỌI trường hợp', correct: false, explanation: 'Không phải "luôn luôn" — vấn đề cụ thể ở đây là thiếu minh bạch về stability và shape-fit, không phải chọn sai thuật toán tuyệt đối.' },
            ],
          },
          {
            question: 'Trên dữ liệu 2 lưỡi liềm lồng nhau, K-means (k=2) vẫn chạy và trả về 1 kết quả cụ thể. Điều này có nghĩa gì?',
            options: [
              { id: 'a', text: 'K-means vẫn "chạy được" và cho SỐ hợp lệ, nhưng giả định cụm hình cầu của nó không khớp cấu trúc lưỡi liềm — kết quả về mặt hình học sẽ sai', correct: true, explanation: 'Đúng — ARI thật đo được ở bài này chỉ 0.31 so với cấu trúc lưỡi liềm thật.' },
              { id: 'b', text: 'K-means luôn đúng miễn là code không báo lỗi', correct: false, explanation: 'Chạy không lỗi ≠ đúng về mặt mô hình — đây chính là "unsafe-but-correct" theo nghĩa rộng của toàn khóa.' },
              { id: 'c', text: 'K-means sẽ tự động phát hiện hình lưỡi liềm và điều chỉnh thuật toán', correct: false, explanation: 'K-means KHÔNG thích ứng theo hình dạng — nó luôn giả định cụm hình cầu bất kể dữ liệu thế nào.' },
              { id: 'd', text: 'Kết quả sai chỉ vì k=2 chưa đủ lớn — cần tăng k', correct: false, explanation: 'Tăng k không giải quyết vấn đề GIẢ ĐỊNH HÌNH DẠNG — vấn đề là K-means không phù hợp thuật toán cho hình lưỡi liềm.' },
            ],
          },
        ],
        mini_game: {
          title: 'Thực hành nào giữ ĐÚNG kỷ luật khi chạy K-means?',
          instruction: 'Xếp mỗi thực hành vào đúng nhóm.',
          chips: [
            { id: 'chip-scalefirst', label: 'Chuẩn hoá (StandardScaler) TRƯỚC khi fit KMeans' },
            { id: 'chip-explicitinit', label: 'Dùng n_init ≥ 10 và random_state tường minh' },
            { id: 'chip-inertiaonly', label: 'Chọn k CHỈ dựa trên inertia thấp nhất' },
            { id: 'chip-trustshape', label: 'Tin kết quả K-means trên dữ liệu hình lưỡi liềm mà không kiểm tra ARI/silhouette' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-scalefirst': 'dung', 'chip-explicitinit': 'dung', 'chip-inertiaonly': 'sai', 'chip-trustshape': 'sai' },
          success_html: '✅ Scale trước, khởi tạo tường minh — không chọn k chỉ theo inertia, không tin mù kết quả trên dữ liệu chưa kiểm tra hình dạng.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Lắp pipeline K-means tái lập được — scale, fit qua nhiều seed, đo stability bằng ARI, báo cáo inertia + silhouette.',
        blocks: [
          { type: 'py', token: 'X = load_kmeans_lab()', slot: 'z1a' },
          { type: 'py', token: 'X_scaled = StandardScaler().fit_transform(X)', slot: 'z1b' },
          { type: 'py', token: 'labels_by_seed = [KMeans(n_clusters=3, n_init=20, random_state=s).fit_predict(X_scaled) for s in [1, 7, 42, 99]]', slot: 'z2a' },
          { type: 'py', token: 'stability = [adjusted_rand_score(labels_by_seed[0], z) for z in labels_by_seed[1:]]', slot: 'z2b' },
          { type: 'py', token: 'final = KMeans(n_clusters=3, n_init=20, random_state=42).fit(X_scaled)', slot: 'z3a' },
          { type: 'py', token: 'print(final.inertia_, silhouette_score(X_scaled, final.labels_), stability)', slot: 'z3b' },
          /* 2 mồi bẫy — unsafe-but-correct của spec: bỏ qua n_init tường minh / so ID thô thay vì ARI */
          { type: 'py', token: 'model = KMeans(n_clusters=3, random_state=42)', slot: 't1' },
          { type: 'py', token: 'stability = [(labels_by_seed[0] == z).mean() for z in labels_by_seed[1:]]', slot: 't2' },
        ],
        drop_zones: [
          { id: 'kmeans-source', accepts: ['py'], multi: true },
          { id: 'kmeans-stability', accepts: ['py'], multi: true },
          { id: 'kmeans-report', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'kmeans-source': 'X = load_kmeans_lab() X_scaled = StandardScaler().fit_transform(X)',
          'kmeans-stability': 'labels_by_seed = [KMeans(n_clusters=3, n_init=20, random_state=s).fit_predict(X_scaled) for s in [1, 7, 42, 99]] stability = [adjusted_rand_score(labels_by_seed[0], z) for z in labels_by_seed[1:]]',
          'kmeans-report': 'final = KMeans(n_clusters=3, n_init=20, random_state=42).fit(X_scaled) print(final.inertia_, silhouette_score(X_scaled, final.labels_), stability)',
        },
        reveal_hints: {
          'kmeans-source': 'Nạp dữ liệu, <strong>StandardScaler().fit_transform(X)</strong> TRƯỚC khi fit bất kỳ KMeans nào.',
          'kmeans-stability': 'Fit KMeans qua <strong>4 seed khác nhau</strong>, mỗi lần khai báo TƯỜNG MINH <strong>n_init</strong> và <strong>random_state</strong>. Đo ổn định bằng <strong>adjusted_rand_score</strong>.',
          'kmeans-report': 'Fit lần cuối, in <strong>inertia_</strong>, <strong>silhouette_score</strong> và <strong>stability</strong>.',
        },
        ml_flow: {
          brand: 'DÒNG CHẢY K-MEANS STABILITY LAB',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: '300 học sinh · 2 feature (1 feature lệch thang đo ×20)' },
          done_note: 'Scale + n_init lớn cho kết quả ổn định — nhưng ổn định không cứu được K-means trên dữ liệu lưỡi liềm. Click lại trạm bất kỳ để xem lại, rồi sang Bước 4 tự viết code.',
          stations: [
            {
              zones: ['kmeans-source'],
              icon: '⚠️', label: 'FEATURE THÔ', sub: 'n_init=1, chưa scale', result_kind: 'kmeans_stability',
              kstab: { mode: 'raw', inertia: 81549.7, silhouette: 0.6245 },
              narration: 'Fit trực tiếp trên feature thô (chưa scale), n_init=1: inertia = 81,549.7 — con số khổng lồ, vô nghĩa để so sánh, vì engagement_minutes lệch thang đo ×20 áp đảo khoảng cách Euclid.',
            },
            {
              zones: ['kmeans-stability'],
              icon: '✅', label: 'SCALE + N_INIT=20', sub: '4 seed [1,7,42,99]', result_kind: 'kmeans_stability',
              kstab: { mode: 'scaled', inertia: 90.24, silhouette: 0.6669, stability: [1.0, 1.0, 1.0], stability_min: 1.0 },
              narration: 'Sau khi StandardScaler + n_init=20: inertia = 90.24 (đọc được), silhouette = 0.67. Chạy lại với 4 seed khác nhau: ARI = 1.0 cả 4 lần — kết quả HOÀN TOÀN ổn định, không phụ thuộc khởi tạo.',
            },
            {
              zones: ['kmeans-report'],
              icon: '🌙', label: 'DỮ LIỆU CRESCENT', sub: 'K-means có còn đúng?', result_kind: 'kmeans_stability',
              kstab: { mode: 'crescent', ari_shape: 0.31 },
              narration: 'Chuyển sang dữ liệu 2 lưỡi liềm lồng nhau, vẫn fit KMeans(k=2) — code chạy, cho ra 1 phân vùng cụ thể. Nhưng so với cấu trúc HÌNH HỌC thật: ARI chỉ 0.31. Từ chối tin kết quả này làm "phát hiện cấu trúc".',
            },
          ],
        },
      },
      drag_map: {
        brand: 'DÒNG CHẢY K-MEANS STABILITY LAB',
        table_sub: 'DataFrame nguồn · 2 feature (1 lệch thang đo)',
        idle_sub: 'Bấm ▶ để chạy pipeline',
        run_label: '▶ Chạy Pipeline',
        table: {
          name: 'kmeans_lab',
          columns: ['activity_score', 'engagement_minutes'],
          dataRows: [
            ['0.27', '72.21'],
            ['-2.00', '23.57'],
            ['1.25', '47.02'],
            ['2.55', '-25.41'],
            ['-3.96', '-46.05'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Scale X, fit KMeans với <code>n_init</code>/<code>random_state</code> TƯỜNG MINH qua 4 seed, đo độ ổn định bằng <code>adjusted_rand_score</code>, rồi báo cáo <code>inertia_</code> + <code>silhouette_score</code> của lần fit cuối.</p>',
        context: {
          scenario: 'StudyLab muốn một kết quả K-means TÁI LẬP ĐƯỢC — không phải "may thì đúng". Bạn cần chứng minh: (1) đã chuẩn hoá đúng, (2) kết quả không đổi dù chạy lại với khởi tạo khác, và báo cáo trung thực cả khi kết quả KHÔNG ổn định.',
          real_world: 'Giống việc lặp lại 1 thí nghiệm khoa học nhiều lần trước khi công bố — nếu kết quả đổi mỗi lần chạy lại, đó là dấu hiệu CẢNH BÁO, không phải điều để giấu đi.',
          steps: [
            'Nạp dữ liệu bằng <code>load_kmeans_lab()</code>, chuẩn hoá bằng StandardScaler.',
            'Fit KMeans qua NHIỀU seed khác nhau — mỗi lần khai báo tường minh n_init và random_state.',
            'Đo độ ổn định giữa các lần chạy bằng 1 metric permutation-invariant, không so ID thô.',
            'Fit lần cuối, báo cáo inertia, 1 metric nội bộ khác (silhouette), và độ ổn định.',
          ],
          hint_explore: 'Muốn xem shape dữ liệu? Gõ <code>print(load_kmeans_lab().shape)</code> rồi Run.',
          expected: 'In inertia (~90.2), silhouette (~0.67), và danh sách stability — cả 3 giá trị ARI trong stability đều gần 1.0.',
        },
        hints: [
          { level: 1, text: 'Nhập <code>from sklearn.preprocessing import StandardScaler</code>, <code>from sklearn.cluster import KMeans</code>, <code>from sklearn.metrics import silhouette_score, adjusted_rand_score</code>, <code>from ml_lab import load_kmeans_lab</code>.' },
          { level: 2, text: '<code>X = load_kmeans_lab()</code>, <code>X_scaled = StandardScaler().fit_transform(X)</code>. Fit KMeans cho từng seed trong <code>[1, 7, 42, 99]</code> — LUÔN truyền <code>n_init=20, random_state=seed</code>.' },
          { level: 3, text: 'Gom kết quả các seed vào <code>labels_by_seed</code>. Tính <code>stability</code> bằng <code>adjusted_rand_score(labels_by_seed[0], z)</code> cho từng <code>z</code> còn lại — KHÔNG so bằng <code>==</code>.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>from sklearn.preprocessing import StandardScaler<br>from sklearn.cluster import KMeans<br>from sklearn.metrics import silhouette_score, adjusted_rand_score<br>from ml_lab import load_kmeans_lab<br>X = load_kmeans_lab()<br>X_scaled = StandardScaler().fit_transform(X)<br>labels_by_seed = []<br>for seed in [1, 7, 42, 99]:<br>&nbsp;&nbsp;&nbsp;&nbsp;model = KMeans(n_clusters=3, n_init=20, random_state=seed)<br>&nbsp;&nbsp;&nbsp;&nbsp;labels_by_seed.append(model.fit_predict(X_scaled))<br>reference = labels_by_seed[0]<br>stability = [adjusted_rand_score(reference, z) for z in labels_by_seed[1:]]<br>final = KMeans(n_clusters=3, n_init=20, random_state=42).fit(X_scaled)<br>print(final.inertia_)<br>print(silhouette_score(X_scaled, final.labels_))<br>print(stability)</code>' },
        ],
        grader_fn: 'grade_lesson_c3_7',
        success_message: 'Bạn vừa chạy 1 thí nghiệm K-means TÁI LẬP ĐƯỢC — scale đúng, khởi tạo tường minh, đo ổn định bằng ARI thật. Nền tảng cho việc chọn k ở bài sau.',
        xp_reward: 65,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.preprocessing import StandardScaler',
      },
    },

    {
      id: 'c3_l8',
      index: 8,
      title: 'Chọn k và đánh giá một clustering',
      subtitle: 'Elbow, silhouette, độ ổn định — và việc không có "k đúng tuyệt đối"',
      module: 3,
      module_title: 'M3 · Clustering & Structure Discovery',
      estimated_minutes: 26,
      xp_reward: 65,
      achievement: { name: 'Evidence Weigher', desc: 'Chọn hoặc từ chối 1 số cụm k bằng nhiều bằng chứng, không tin 1 biểu đồ duy nhất.' },
      story: {
        tag: '🧬 StudyLab · Advanced Modeling Lab',
        hook: 'Bài trước bạn đã chạy K-means tái lập được với k=3 cố định. Nhưng StudyLab hỏi ngược: "Sao lại là 3? Sao không phải 4, hay 6?" Bạn vẽ elbow — gợi ý 1 con số. Vẽ silhouette — gợi ý con số KHÁC. Đo độ ổn định — lại một góc nhìn khác nữa. Tệ hơn, khi thử trên 1 tập dữ liệu khác (thật ra là NGẪU NHIÊN, không có cấu trúc gì), thuật toán vẫn ngoan ngoãn trả về 1 phân cụm "hợp lệ". Bài này bạn học cách không bị lừa bởi điều đó.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Đọc elbow và silhouette mà KHÔNG giả định luôn có 1 điểm tối ưu rõ ràng.',
            'Đo độ ổn định qua nhiều seed/nhiễu động, và đặt câu hỏi "có cấu trúc cụm thật không" TRƯỚC khi chọn k.',
            'Viết 1 rationale chọn k dựa trên NHIỀU bằng chứng — và biết khi nào nên kết luận "không có clustering đáng tin".',
          ],
        },
        glossary: [
          { term: 'Elbow method', vi: 'Phương pháp khuỷu tay', accent: '#22D3EE', def: 'Quan sát điểm "gãy" trên đường inertia theo k — nơi tốc độ giảm chậm lại rõ rệt, gợi ý số cụm hợp lý.', ex: 'inertia giảm mạnh rồi chững ở k=4', out: '' },
          { term: 'Silhouette score (theo từng k)', vi: 'Điểm silhouette theo k', accent: '#67E8F9', def: 'Đo mỗi điểm gắn kết với cụm của nó và tách biệt với cụm khác thế nào — trung bình cho biết chất lượng phân cụm ở 1 k cụ thể.', ex: 'đỉnh silhouette ở k=4', out: '' },
          { term: 'Cluster tendency', vi: 'Xu hướng có cụm', accent: '#0891B2', def: 'Câu hỏi PHẢI hỏi TRƯỚC khi chọn k: dữ liệu có cấu trúc cụm THẬT hay không — vì thuật toán luôn trả về 1 kết quả dù dữ liệu ngẫu nhiên.', ex: 'silhouette thấp-phẳng ở MỌI k → nghi ngờ', out: '' },
          { term: 'Stability across seeds', vi: 'Ổn định qua nhiều seed', accent: '#67E8F9', def: 'Đo xem kết quả phân cụm có LẶP LẠI khi đổi khởi tạo ngẫu nhiên hay không — ổn định thấp là dấu hiệu cảnh báo.', ex: 'ARI trung bình qua 3 seed', out: '' },
          { term: 'Multi-evidence selection', vi: 'Chọn bằng nhiều bằng chứng', accent: '#A5F3FC', def: 'Kết hợp elbow + silhouette + stability + ràng buộc thực tế — không tin 1 biểu đồ duy nhất.', ex: '', out: '' },
          { term: 'Rejection option', vi: 'Lựa chọn từ chối', accent: '#22D3EE', def: 'Khi bằng chứng không đủ mạnh, kết luận hợp lệ là "không có clustering đáng tin ở đây" — không ép ra 1 con số k.', ex: '', out: '' },
        ],
        primer: {
          goal: [
            'Kéo slider k — quan sát 3 đồng hồ (inertia/silhouette/stability) có thể KHÔNG đồng thuận.',
            'Sweep k=2..8, đo inertia + silhouette + stability mỗi k, để bằng chứng tự nói.',
          ],
          intro: '<p>"k tốt nhất là bao nhiêu?" nghe như một câu hỏi có đáp án duy nhất — nhưng thực tế elbow, silhouette và stability thường KHÔNG đồng thuận hoàn hảo, và đôi khi câu trả lời trung thực nhất là "dữ liệu này không có cấu trúc cụm rõ ràng, đừng ép ra 1 con số".</p>',
          example: '',
        },
        intro: '3 biểu đồ, 3 góc nhìn — và đôi khi, không góc nào đủ để quyết định 1 mình.',
        concept_cards: [
          { icon: 'fa-chart-line', title: '3 biểu đồ, 1 quyết định', body: "Elbow, silhouette, stability — không cái nào là 'oracle' — phải kết hợp cả 3." },
          { icon: 'fa-dice', title: 'Thuật toán luôn trả lời — kể cả khi không nên', body: 'KMeans sẽ chia dữ liệu ngẫu nhiên thành k cụm dù chẳng có cấu trúc thật nào.' },
          { icon: 'fa-hand', title: "Được phép nói 'không'", body: "Nếu bằng chứng yếu, kết luận 'từ chối chọn k' vẫn là 1 kết luận hợp lệ và trung thực." },
        ],
        kselect_lens: {
          title: 'BA BIỂU ĐỒ BẤT ĐỒNG',
          intro: 'Kéo slider k — 3 đồng hồ có thể KHÔNG cùng gợi ý 1 con số.',
          ks: [2, 3, 4, 5, 6],
          inertia: [18.4, 11.4, 4.9, 4.2, 3.6],
          silhouette: [0.85, 0.728, 0.607, 0.532, 0.444],
          stability: [1.0, 1.0, 1.0, 0.972, 0.988],
          riddle: {
            prompt: 'Silhouette đạt đỉnh ở k=2 (0.85), nhưng inertia có "khuỷu tay" rõ nhất ở k=4. 2 chỉ số này có luôn phải đồng thuận không?',
            options: ['Có, luôn đồng thuận', 'Không, mỗi chỉ số đo 1 khía cạnh khác nhau', 'Chỉ đồng thuận khi k=2'],
            answer: 'Không, mỗi chỉ số đo 1 khía cạnh khác nhau',
            wrong: {
              'Có, luôn đồng thuận': 'Số thật ngay trong ống kính này đã bác bỏ điều đó — silhouette đỉnh ở k=2 trong khi elbow gợi ý k=4.',
              'Chỉ đồng thuận khi k=2': 'k=2 chỉ là nơi silhouette cao nhất — không có gì đảm bảo elbow cũng đồng thuận đúng tại đó.',
            },
            done: '✅ Đúng — silhouette đo TÁCH BIỆT tổng thể (2 siêu nhóm rất xa nhau → cao ở k=2), còn elbow đo TỐC ĐỘ GIẢM lỗi nội bộ (cụm con hiện rõ hơn ở k=4). Cần cả 2 góc nhìn, không chỉ 1.',
          },
        },
        visual: {
          schema: {
            table_name: 'k_selection_data',
            columns: [
              { name: 'feat_a', type: 'FLOAT', key: '' },
              { name: 'feat_b', type: 'FLOAT', key: '' },
            ],
          },
          data_preview: [
            ['-3.29', '-3.04'],
            ['-1.66', '-1.99'],
            ['-3.65', '-2.62'],
            ['3.53', '3.65'],
            ['3.04', '-3.04'],
          ],
        },
        mission: 'Sweep k=2..8, tính inertia + silhouette + stability (ARI trung bình qua 3 seed) mỗi k.',
      },
      step_2: {
        mcq: [
          {
            question: 'Trên 1 dữ liệu HOÀN TOÀN NGẪU NHIÊN (không có cấu trúc cụm thật), bạn chạy KMeans và nhận silhouette=0.40 ở k=3. Điều này có nghĩa gì?',
            options: [
              { id: 'a', text: 'Thuật toán VẪN trả về 1 kết quả (vì nó luôn tìm cách chia dữ liệu), nhưng con số đó không chứng minh có cụm tự nhiên — cần so với việc silhouette có PHẲNG và THẤP ở MỌI k hay không', correct: true, explanation: 'Chính xác — đúng nguyên văn misconception feedback của spec.' },
              { id: 'b', text: 'silhouette=0.40 chứng tỏ có 3 cụm tự nhiên trong dữ liệu', correct: false, explanation: 'Sai — thuật toán luôn "tìm thấy" một cách chia nào đó, kể cả trên dữ liệu ngẫu nhiên hoàn toàn.' },
              { id: 'c', text: 'KMeans sẽ báo lỗi nếu dữ liệu không có cấu trúc cụm', correct: false, explanation: 'KMeans không hề kiểm tra "có cấu trúc hay không" — nó luôn chạy và trả về kết quả.' },
              { id: 'd', text: 'Chỉ cần silhouette > 0 là đủ bằng chứng để tin có cụm thật', correct: false, explanation: 'Không đủ — cần so sánh silhouette giữa NHIỀU k và với ngưỡng hợp lý, không chỉ nhìn 1 con số dương.' },
            ],
          },
          {
            question: 'Bạn quét k=2..8, mỗi lần đối chiếu với 1 nhãn lớp (được MỞ RA sau khi có kết quả mỗi k), rồi chọn k=4 vì nó khớp nhãn nhiều nhất. Vấn đề là gì?',
            options: [
              { id: 'a', text: 'Đây là supervised tuning nguỵ trang thành unsupervised — nhãn đã hướng dẫn việc chọn k, vi phạm hợp đồng thí nghiệm clustering', correct: true, explanation: 'Chính xác — đây là unsafe-but-correct case của spec: numerically có vẻ mạnh nhưng quy trình sai.' },
              { id: 'b', text: 'Không sao — miễn kết quả cuối cùng khớp nhãn cao là đủ', correct: false, explanation: 'Sai — mục tiêu của bài là ĐÁNH GIÁ clustering KHÔNG GIÁM SÁT, dùng nhãn để chọn phá vỡ chính mục tiêu đó.' },
              { id: 'c', text: 'Vấn đề là dùng sai thuật toán, phải dùng DBSCAN', correct: false, explanation: 'Không liên quan đến thuật toán — vấn đề là QUY TRÌNH dùng nhãn để chọn siêu tham số.' },
              { id: 'd', text: 'Vấn đề là quét quá nhiều giá trị k (2..8 là thừa)', correct: false, explanation: 'Số lượng k quét không phải vấn đề — vấn đề là nhãn ẩn được dùng để HƯỚNG DẪN lựa chọn.' },
            ],
          },
          {
            question: 'Trạm 2 (stability) gắn cờ k=7 vì ARI trung bình chỉ 0.806 (thấp hơn hẳn k=2..5 đạt 1.0). Ý nghĩa của việc gắn cờ này là gì?',
            options: [
              { id: 'a', text: 'k=7 cho kết quả phân cụm KHÔNG ổn định — đổi seed khởi tạo sẽ ra kết quả khác đáng kể, nên khó tin cậy dù silhouette/inertia ở k=7 vẫn tính được', correct: true, explanation: 'Đúng — stability thấp là 1 trong nhiều bằng chứng cần cân nhắc, độc lập với inertia/silhouette.' },
              { id: 'b', text: 'k=7 chắc chắn SAI và không bao giờ nên dùng trong mọi bài toán', correct: false, explanation: 'Quá tuyệt đối — "không ổn định ở dữ liệu NÀY" khác với "luôn sai trong MỌI bài toán".' },
              { id: 'c', text: 'Gắn cờ nghĩa là code bị lỗi ở k=7', correct: false, explanation: 'Không phải lỗi code — đây là TÍN HIỆU hợp lệ về chất lượng, không phải bug.' },
              { id: 'd', text: 'ARI thấp nghĩa là silhouette ở k=7 chắc chắn cũng thấp', correct: false, explanation: '2 metric đo 2 khía cạnh khác nhau (ổn định vs chất lượng nội bộ) — không nhất thiết đi cùng chiều.' },
            ],
          },
        ],
        mini_game: {
          title: 'Thực hành nào giữ ĐÚNG kỷ luật khi chọn k?',
          instruction: 'Xếp mỗi thực hành vào đúng nhóm.',
          chips: [
            { id: 'chip-combine', label: 'Kết hợp elbow + silhouette + stability trước khi chọn k' },
            { id: 'chip-tendency', label: 'Kiểm tra dữ liệu có cấu trúc cụm THẬT trước khi tin bất kỳ k nào' },
            { id: 'chip-labelpick', label: 'Chọn k chỉ vì nó khớp 1 nhãn được mở ra sau mỗi lần thử' },
            { id: 'chip-forcek', label: "Luôn chọn 1 k cụ thể, không bao giờ kết luận 'không đủ bằng chứng'" },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-combine': 'dung', 'chip-tendency': 'dung', 'chip-labelpick': 'sai', 'chip-forcek': 'sai' },
          success_html: '✅ Kết hợp nhiều bằng chứng, kiểm tra cluster tendency trước — không dùng nhãn ẩn để chọn, không ép ra 1 k khi bằng chứng yếu.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Lắp pipeline chọn k — sweep k=2..8, mỗi k tính inertia + silhouette + stability (ARI qua 3 seed).',
        blocks: [
          { type: 'py', token: 'X = StandardScaler().fit_transform(load_k_selection_data())', slot: 'z1a' },
          { type: 'py', token: 'runs = [KMeans(n_clusters=k, n_init=20, random_state=s).fit_predict(X) for s in [1, 7, 42]]', slot: 'z1b' },
          { type: 'py', token: 'stability = np.mean([adjusted_rand_score(runs[0], z) for z in runs[1:]])', slot: 'z2a' },
          { type: 'py', token: 'model = KMeans(n_clusters=k, n_init=20, random_state=42).fit(X)', slot: 'z2b' },
          { type: 'py', token: 'report.append({"k": k, "inertia": model.inertia_, "silhouette": silhouette_score(X, model.labels_), "stability": stability})', slot: 'z3a' },
          { type: 'py', token: 'print(report)', slot: 'z3b' },
          /* 2 mồi bẫy — unsafe-but-correct của spec: bỏ n_init tường minh / so ID thô thay vì ARI */
          { type: 'py', token: 'model = KMeans(n_clusters=k, random_state=42).fit(X)', slot: 't1' },
          { type: 'py', token: 'stability = np.mean([(runs[0] == z).mean() for z in runs[1:]])', slot: 't2' },
        ],
        drop_zones: [
          { id: 'kselect-source', accepts: ['py'], multi: true },
          { id: 'kselect-stability', accepts: ['py'], multi: true },
          { id: 'kselect-report', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'kselect-source': 'X = StandardScaler().fit_transform(load_k_selection_data()) runs = [KMeans(n_clusters=k, n_init=20, random_state=s).fit_predict(X) for s in [1, 7, 42]]',
          'kselect-stability': 'stability = np.mean([adjusted_rand_score(runs[0], z) for z in runs[1:]]) model = KMeans(n_clusters=k, n_init=20, random_state=42).fit(X)',
          'kselect-report': 'report.append({"k": k, "inertia": model.inertia_, "silhouette": silhouette_score(X, model.labels_), "stability": stability}) print(report)',
        },
        reveal_hints: {
          'kselect-source': 'Chuẩn hoá dữ liệu, rồi fit KMeans qua <strong>3 seed [1, 7, 42]</strong> — khai báo tường minh n_init/random_state.',
          'kselect-stability': 'Đo <strong>stability</strong> bằng <strong>adjusted_rand_score</strong>, rồi fit lại lần cuối với <strong>random_state=42</strong>.',
          'kselect-report': 'Ghi đủ 4 trường vào <strong>report</strong>: k, inertia, silhouette, stability.',
        },
        ml_flow: {
          brand: 'DÒNG CHẢY K SELECTION CONSOLE',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: '320 mẫu · 4 cụm Gauss tách rõ (elbow + silhouette đồng thuận ở dữ liệu này)' },
          done_note: 'k=4 được cả 3 bằng chứng ủng hộ — nhưng trên dữ liệu ngẫu nhiên, rationale đúng là từ chối. Click lại trạm bất kỳ để xem lại, rồi sang Bước 4 tự viết code.',
          stations: [
            {
              zones: ['kselect-source'],
              icon: '📊', label: 'SWEEP CANDIDATE', sub: 'k=2..8', result_kind: 'kselect',
              kselect: {
                mode: 'sweep', peak_k: 4,
                rows: [{ k: 2, sil: 0.493 }, { k: 3, sil: 0.595 }, { k: 4, sil: 0.771 }, { k: 5, sil: 0.659 }, { k: 6, sil: 0.547 }, { k: 7, sil: 0.439 }, { k: 8, sil: 0.34 }],
              },
              narration: 'Sweep k=2 đến 8: inertia giảm dần (336.9 → 21.5), silhouette đạt ĐỈNH rõ ràng ở k=4 (0.771) — cao hơn hẳn k=3 (0.595) và k=5 (0.659). Elbow và silhouette đồng thuận ở dữ liệu 4-cụm này.',
            },
            {
              zones: ['kselect-stability'],
              icon: '🔁', label: 'STABILITY', sub: '3 seed [1, 7, 42]', result_kind: 'kselect',
              kselect: {
                mode: 'stability',
                rows: [{ k: 2, stability: 1.0, flagged: false }, { k: 3, stability: 1.0, flagged: false }, { k: 4, stability: 1.0, flagged: false }, { k: 5, stability: 1.0, flagged: false }, { k: 6, stability: 0.993, flagged: false }, { k: 7, stability: 0.806, flagged: true }, { k: 8, stability: 0.843, flagged: true }],
                flagged: [7, 8],
              },
              narration: 'k=2 đến 5 ổn định TUYỆT ĐỐI (ARI=1.0 giữa các seed). k=7 và k=8 rớt xuống 0.806 và 0.843 — bị gắn cờ vì kết quả không lặp lại đáng tin giữa các lần khởi tạo.',
            },
            {
              zones: ['kselect-report'],
              icon: '✅', label: 'CHỐT RATIONALE', sub: 'áp ràng buộc, quyết định', result_kind: 'kselect',
              kselect: { mode: 'decide', chosen_k: 4 },
              narration: 'k=4: silhouette đỉnh, elbow rõ, stability tuyệt đối — 3 bằng chứng cùng ủng hộ. Đây là 1 rationale ĐỦ MẠNH để chọn k=4. Nếu dữ liệu là ngẫu nhiên (silhouette thấp-phẳng mọi k), rationale đúng sẽ là TỪ CHỐI, không ép ra 1 con số.',
            },
          ],
        },
      },
      drag_map: {
        brand: 'DÒNG CHẢY K SELECTION CONSOLE',
        table_sub: 'DataFrame nguồn · 2 feature (4 cụm Gauss)',
        idle_sub: 'Bấm ▶ để chạy pipeline',
        run_label: '▶ Chạy Pipeline',
        table: {
          name: 'k_selection_data',
          columns: ['feat_a', 'feat_b'],
          dataRows: [
            ['-3.29', '-3.04'],
            ['-1.66', '-1.99'],
            ['-3.65', '-2.62'],
            ['3.53', '3.65'],
            ['3.04', '-3.04'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Sweep <code>k=2..8</code>, mỗi k tính <code>inertia</code>, <code>silhouette</code> và <code>stability</code> (ARI trung bình qua 3 seed) — ghi vào <code>report</code>.</p>',
        context: {
          scenario: 'StudyLab cần một quy trình chọn k CÓ THỂ BẢO VỆ ĐƯỢC — không phải "thử vài số rồi chọn cái đẹp nhất". Dữ liệu ẩn của bài này có thể có cấu trúc RÕ hoặc có thể là NGẪU NHIÊN — code của bạn phải tính đúng bằng chứng trong CẢ HAI trường hợp, không giả định luôn có 1 k tốt.',
          real_world: 'Giống việc 1 bác sĩ không kết luận "bệnh nhân mắc bệnh X" chỉ vì 1 triệu chứng khớp — cần nhiều xét nghiệm độc lập cùng chỉ ra 1 hướng trước khi kết luận, và đôi khi kết luận đúng là "chưa đủ bằng chứng".',
          steps: [
            'Chuẩn hoá dữ liệu bằng <code>load_k_selection_data()</code>.',
            'Với mỗi k từ 2 đến 8: fit nhiều lần với các seed khác nhau, đo độ ổn định bằng 1 metric permutation-invariant.',
            'Fit lại 1 lần với cấu hình cố định để lấy inertia và silhouette đại diện cho k đó.',
            'Ghi đủ 4 thông tin (k, inertia, silhouette, stability) cho TỪNG k vào báo cáo.',
          ],
          hint_explore: 'Muốn xem shape dữ liệu? Gõ <code>print(load_k_selection_data().shape)</code> rồi Run.',
          expected: 'Biến `report` là list 7 dict (k=2..8), mỗi dict có đủ inertia/silhouette/stability khớp engine.',
        },
        hints: [
          { level: 1, text: 'Nhập <code>from sklearn.cluster import KMeans</code>, <code>from sklearn.preprocessing import StandardScaler</code>, <code>from sklearn.metrics import silhouette_score, adjusted_rand_score</code>, <code>from ml_lab import load_k_selection_data</code>.' },
          { level: 2, text: '<code>X = StandardScaler().fit_transform(load_k_selection_data())</code>. Với mỗi <code>k</code> trong <code>range(2, 9)</code>: fit KMeans qua 3 seed <code>[1, 7, 42]</code>, LUÔN khai báo <code>n_init=20, random_state=...</code>.' },
          { level: 3, text: 'Tính <code>stability = np.mean([adjusted_rand_score(runs[0], z) for z in runs[1:]])</code> — KHÔNG so bằng <code>==</code>. Fit lại 1 lần với <code>random_state=42</code> để lấy inertia/silhouette đại diện.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>from sklearn.cluster import KMeans<br>from sklearn.preprocessing import StandardScaler<br>from sklearn.metrics import silhouette_score, adjusted_rand_score<br>from ml_lab import load_k_selection_data<br>X = StandardScaler().fit_transform(load_k_selection_data())<br>report = []<br>for k in range(2, 9):<br>&nbsp;&nbsp;&nbsp;&nbsp;runs = [KMeans(n_clusters=k, n_init=20, random_state=s).fit_predict(X) for s in [1, 7, 42]]<br>&nbsp;&nbsp;&nbsp;&nbsp;stability = np.mean([adjusted_rand_score(runs[0], z) for z in runs[1:]])<br>&nbsp;&nbsp;&nbsp;&nbsp;model = KMeans(n_clusters=k, n_init=20, random_state=42).fit(X)<br>&nbsp;&nbsp;&nbsp;&nbsp;report.append({<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"k": k,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"inertia": model.inertia_,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"silhouette": silhouette_score(X, model.labels_),<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"stability": stability,<br>&nbsp;&nbsp;&nbsp;&nbsp;})<br>print(report)</code>' },
        ],
        grader_fn: 'grade_lesson_c3_8',
        success_message: 'Bạn vừa xây 1 quy trình chọn k dựa trên NHIỀU bằng chứng — không tin 1 biểu đồ, không dùng nhãn ẩn để "tối ưu ngược". Sẵn sàng cho DBSCAN và hierarchical clustering!',
        xp_reward: 65,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.cluster import KMeans',
      },
    },

    {
      id: 'c3_l9',
      index: 9,
      title: 'DBSCAN và hierarchical clustering',
      subtitle: 'Mật độ, nhiễu, liên kết — và chọn thuật toán đúng hình dạng',
      module: 3,
      module_title: 'M3 · Clustering & Structure Discovery',
      estimated_minutes: 26,
      xp_reward: 65,
      achievement: { name: 'Shape Matcher', desc: 'So 3 họ thuật toán clustering công bằng và chọn đúng theo hình dạng dữ liệu.' },
      story: {
        tag: '🧬 StudyLab · Advanced Modeling Lab',
        hook: 'Khép Module 3: StudyLab đưa bạn 1 dữ liệu hành vi hình 2 "lưỡi liềm" lồng nhau — không phải hình cầu như mọi bài trước. K-means (bạn đã thành thạo) cắt ngang qua cả 2 lưỡi liềm, sai be bét. Một bạn đồng nghiệp thử DBSCAN, âm thầm chỉnh eps rất nhỏ khiến 70% điểm bị coi là "nhiễu", rồi khoe silhouette trên 30% còn lại RẤT CAO — so trực tiếp với K-means tính trên TOÀN BỘ điểm. Bài này bạn học cách so sánh công bằng, và chọn đúng thuật toán theo HÌNH DẠNG dữ liệu, không theo cảm tính.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Giải thích điểm lõi, điểm biên, điểm nhiễu của DBSCAN — và dự đoán ảnh hưởng của eps/min_samples.',
            'Đọc dendrogram và phân biệt hành vi của single-link/complete-link.',
            'So sánh KMeans, DBSCAN, Agglomerative công bằng (cùng representation) và chọn thuật toán khớp giả định với hình dạng dữ liệu.',
          ],
        },
        glossary: [
          { term: 'Core point', vi: 'Điểm lõi', accent: '#22D3EE', def: 'Điểm có ÍT NHẤT min_samples điểm khác trong bán kính eps quanh nó — hạt nhân của 1 cụm mật độ.', ex: 'min_samples=6', out: '' },
          { term: 'Border point', vi: 'Điểm biên', accent: '#67E8F9', def: 'Nằm trong bán kính eps của 1 điểm lõi nhưng bản thân KHÔNG đủ điểm lân cận để là lõi — vẫn thuộc cụm nhưng ở rìa.', ex: '', out: '' },
          { term: 'Noise point', vi: 'Điểm nhiễu', accent: '#0891B2', def: 'Không phải lõi, không phải biên của bất kỳ cụm nào — DBSCAN gán nhãn -1, không thuộc cụm nào cả.', ex: 'labels == -1', out: '' },
          { term: 'Linkage (single/complete)', vi: 'Liên kết (đơn/đầy đủ)', accent: '#67E8F9', def: 'Cách đo khoảng cách giữa 2 CỤM khi merge trong hierarchical clustering — single = khoảng cách gần nhất, complete = khoảng cách xa nhất.', ex: 'linkage="complete"', out: '' },
          { term: 'Dendrogram', vi: 'Cây phân cấp', accent: '#A5F3FC', def: 'Biểu đồ hình cây thể hiện thứ tự merge các cụm — cắt ở độ cao khác nhau cho số cụm khác nhau; merge KHÔNG THỂ hoàn tác.', ex: '', out: '' },
          { term: 'Guarded metric', vi: 'Metric có bảo vệ', accent: '#22D3EE', def: 'Chỉ tính silhouette khi có ≥2 cụm hợp lệ và đủ điểm — trả None thay vì số giả khi trạng thái không hợp lệ (1 cụm hoặc toàn nhiễu).', ex: 'score = ... if valid else None', out: '' },
        ],
        primer: {
          goal: [
            'So 3 tab (KMeans/DBSCAN/Complete-link) trên CÙNG dữ liệu 2 lưỡi liềm — xem ai đúng hình dạng.',
            'Fit cả 3 thuật toán trên CÙNG 1 representation, tính guarded silhouette + đếm cluster/noise.',
          ],
          intro: '<p>"Cụm" không có 1 định nghĩa duy nhất. K-means nói: gần TÂM nhất. DBSCAN nói: đủ MẬT ĐỘ xung quanh. Hierarchical nói: hợp nhất DẦN theo khoảng cách. Trên dữ liệu hình cầu, 3 định nghĩa này thường cho kết quả giống nhau — nhưng trên hình dạng bất thường như lưỡi liềm, chúng RẼ NHÁNH rõ rệt.</p>',
          example: '',
        },
        intro: '3 định nghĩa "cụm" khác nhau — dữ liệu hình lưỡi liềm sẽ phân xử.',
        concept_cards: [
          { icon: 'fa-shapes', title: '3 định nghĩa cụm khác nhau', body: 'KMeans: gần tâm nhất. DBSCAN: đủ mật độ xung quanh. Hierarchical: hợp nhất dần theo khoảng cách.' },
          { icon: 'fa-triangle-exclamation', title: 'Silhouette có thể đánh lừa', body: 'Silhouette thiên vị cụm lồi/gọn — DBSCAN đúng hình dạng vẫn có thể silhouette THẤP hơn KMeans sai hình dạng.' },
          { icon: 'fa-ban', title: 'Không thuật toán nào luôn thắng', body: 'DBSCAN thất bại khi mật độ không đều. Merge hierarchical không thể hoàn tác. Phải khớp giả định với dữ liệu.' },
        ],
        shape_lens: {
          title: 'CRESCENT KHÔNG PHẢI HÌNH CẦU',
          intro: 'Bấm qua 3 tab — CÙNG 60 điểm, 3 thuật toán "nhìn" cụm khác hẳn nhau.',
          panels: [
            {
              key: 'kmeans', label: '🔵 KMeans', ari: 0.47,
              points: [[-1.14, 1.33, 0], [-0.30, -0.95, 1], [-1.43, 0.84, 0], [-0.07, -1.27, 1], [-0.95, 1.30, 0], [1.58, -0.63, 1], [-0.26, -1.27, 1], [-0.07, -0.90, 1], [0.43, -0.44, 1], [1.71, -0.15, 1], [0.26, 0.80, 0], [0.16, 1.13, 0], [0.22, 0.65, 0], [-0.34, 1.52, 0], [-1.65, 0.32, 0], [-1.58, 0.32, 0], [0.76, -1.57, 1], [1.81, 0.29, 1], [0.03, -1.37, 1], [-1.40, 0.87, 0], [0.44, 0.09, 1], [0.54, -0.39, 1], [1.80, 0.02, 1], [-0.57, -0.11, 0], [-0.06, -1.39, 1], [0.26, 0.67, 0], [0.44, 0.94, 0], [0.78, -1.29, 1], [-1.15, 1.45, 0], [1.66, -0.61, 1], [-1.63, 0.98, 0], [0.59, -1.72, 1], [0.87, -1.44, 1], [0.59, -1.48, 1], [0.44, 0.39, 1], [-0.58, 0.29, 0], [-0.49, 1.63, 0], [-0.28, -0.90, 1], [-1.66, 0.46, 0], [1.03, -1.06, 1], [1.10, -1.33, 1], [-0.61, -0.11, 0], [-1.65, 0.79, 0], [-0.12, -1.04, 1], [0.36, 0.65, 0], [0.37, -1.34, 1], [-1.81, -0.03, 0], [-1.49, 0.81, 0], [-0.31, 0.05, 0], [-0.40, -0.86, 1], [-0.44, -0.70, 1], [1.03, -1.56, 1], [0.79, -1.03, 1], [0.73, -1.13, 1], [-1.60, 0.40, 0], [0.15, 1.49, 0], [-0.60, 0.10, 0], [-0.45, -0.26, 0], [-1.55, 0.82, 0], [0.12, 1.09, 0]],
            },
            {
              key: 'dbscan', label: '🟢 DBSCAN', ari: 1.0,
              points: [[-1.14, 1.33, 0], [-0.30, -0.95, 1], [-1.43, 0.84, 0], [-0.07, -1.27, 1], [-0.95, 1.30, 0], [1.58, -0.63, 1], [-0.26, -1.27, 1], [-0.07, -0.90, 1], [0.43, -0.44, 0], [1.71, -0.15, 1], [0.26, 0.80, 0], [0.16, 1.13, 0], [0.22, 0.65, 0], [-0.34, 1.52, 0], [-1.65, 0.32, 0], [-1.58, 0.32, 0], [0.76, -1.57, 1], [1.81, 0.29, 1], [0.03, -1.37, 1], [-1.40, 0.87, 0], [0.44, 0.09, 0], [0.54, -0.39, 0], [1.80, 0.02, 1], [-0.57, -0.11, 1], [-0.06, -1.39, 1], [0.26, 0.67, 0], [0.44, 0.94, 0], [0.78, -1.29, 1], [-1.15, 1.45, 0], [1.66, -0.61, 1], [-1.63, 0.98, 0], [0.59, -1.72, 1], [0.87, -1.44, 1], [0.59, -1.48, 1], [0.44, 0.39, 0], [-0.58, 0.29, 1], [-0.49, 1.63, 0], [-0.28, -0.90, 1], [-1.66, 0.46, 0], [1.03, -1.06, 1], [1.10, -1.33, 1], [-0.61, -0.11, 1], [-1.65, 0.79, 0], [-0.12, -1.04, 1], [0.36, 0.65, 0], [0.37, -1.34, 1], [-1.81, -0.03, 0], [-1.49, 0.81, 0], [-0.31, 0.05, 1], [-0.40, -0.86, 1], [-0.44, -0.70, 1], [1.03, -1.56, 1], [0.79, -1.03, 1], [0.73, -1.13, 1], [-1.60, 0.40, 0], [0.15, 1.49, 0], [-0.60, 0.10, 1], [-0.45, -0.26, 1], [-1.55, 0.82, 0], [0.12, 1.09, 0]],
            },
            {
              key: 'complete_link', label: '🟣 Complete-link', ari: 0.64,
              points: [[-1.14, 1.33, 0], [-0.30, -0.95, 1], [-1.43, 0.84, 0], [-0.07, -1.27, 1], [-0.95, 1.30, 0], [1.58, -0.63, 1], [-0.26, -1.27, 1], [-0.07, -0.90, 1], [0.43, -0.44, 1], [1.71, -0.15, 1], [0.26, 0.80, 0], [0.16, 1.13, 0], [0.22, 0.65, 0], [-0.34, 1.52, 0], [-1.65, 0.32, 0], [-1.58, 0.32, 0], [0.76, -1.57, 1], [1.81, 0.29, 1], [0.03, -1.37, 1], [-1.40, 0.87, 0], [0.44, 0.09, 1], [0.54, -0.39, 1], [1.80, 0.02, 1], [-0.57, -0.11, 1], [-0.06, -1.39, 1], [0.26, 0.67, 0], [0.44, 0.94, 0], [0.78, -1.29, 1], [-1.15, 1.45, 0], [1.66, -0.61, 1], [-1.63, 0.98, 0], [0.59, -1.72, 1], [0.87, -1.44, 1], [0.59, -1.48, 1], [0.44, 0.39, 1], [-0.58, 0.29, 1], [-0.49, 1.63, 0], [-0.28, -0.90, 1], [-1.66, 0.46, 0], [1.03, -1.06, 1], [1.10, -1.33, 1], [-0.61, -0.11, 1], [-1.65, 0.79, 0], [-0.12, -1.04, 1], [0.36, 0.65, 0], [0.37, -1.34, 1], [-1.81, -0.03, 0], [-1.49, 0.81, 0], [-0.31, 0.05, 1], [-0.40, -0.86, 1], [-0.44, -0.70, 1], [1.03, -1.56, 1], [0.79, -1.03, 1], [0.73, -1.13, 1], [-1.60, 0.40, 0], [0.15, 1.49, 0], [-0.60, 0.10, 1], [-0.45, -0.26, 1], [-1.55, 0.82, 0], [0.12, 1.09, 0]],
            },
          ],
          riddle: {
            prompt: 'Thuật toán nào phân cụm ĐÚNG hình dạng thật của 2 lưỡi liềm (ARI so với hình thật = 1.0)?',
            options: ['KMeans', 'DBSCAN', 'Complete-link'],
            answer: 'DBSCAN',
            wrong: {
              'KMeans': 'KMeans chỉ đạt ARI 0.47 — nó cắt theo khoảng cách tới tâm, xuyên ngang qua cả 2 lưỡi liềm.',
              'Complete-link': 'Complete-link khá hơn KMeans (ARI 0.64) nhưng vẫn thiên về cụm compact — chưa theo đúng hình cong.',
            },
            done: '✅ Đúng — DBSCAN theo MẬT ĐỘ, không giả định hình cầu/lồi, nên bám đúng đường cong của từng lưỡi liềm (ARI=1.0). Đây chính là lý do "biết nhiều họ thuật toán" quan trọng hơn chỉ giỏi 1 thuật toán.',
          },
        },
        visual: {
          schema: {
            table_name: 'shape_clustering_data',
            columns: [
              { name: 'feat_x', type: 'FLOAT', key: '' },
              { name: 'feat_y', type: 'FLOAT', key: '' },
            ],
          },
          data_preview: [
            ['-0.47', '0.88'],
            ['0.25', '-0.27'],
            ['-0.71', '0.63'],
            ['0.45', '-0.42'],
            ['-0.31', '0.86'],
          ],
        },
        mission: 'Fit KMeans/DBSCAN/Agglomerative(complete) trên CÙNG 1 representation, tính guarded silhouette + đếm cluster/noise.',
      },
      step_2: {
        mcq: [
          {
            question: 'Trên dữ liệu 2 lưỡi liềm lồng nhau, DBSCAN cho silhouette=0.40 (THẤP hơn KMeans=0.51) nhưng ARI so với hình thật lại là 1.0 (so với KMeans chỉ 0.47). Kết luận nào ĐÚNG?',
            options: [
              { id: 'a', text: 'Silhouette thiên vị cụm lồi/gọn — DBSCAN đúng hình dạng thật hơn hẳn dù điểm silhouette thấp hơn, không nên chỉ tin 1 con số', correct: true, explanation: 'Đúng — đây là số thật đo được ngay trong bài, minh hoạ trực tiếp "metric guardrail".' },
              { id: 'b', text: 'KMeans tốt hơn DBSCAN vì silhouette cao hơn', correct: false, explanation: 'Sai — silhouette cao hơn không có nghĩa là ĐÚNG hình dạng hơn, chỉ có nghĩa là cụm gọn/lồi hơn.' },
              { id: 'c', text: 'ARI không đáng tin bằng silhouette trong mọi trường hợp', correct: false, explanation: 'Ngược lại — khi có hình dạng thật để so sánh, ARI phản ánh đúng chất lượng hơn silhouette (vốn có thiên kiến hình học).' },
              { id: 'd', text: 'Cả 2 metric đều sai, cần dùng metric thứ 3', correct: false, explanation: 'Không phải "sai" — mỗi metric đo 1 khía cạnh khác nhau; vấn đề là hiểu ĐÚNG giới hạn của từng metric.' },
            ],
          },
          {
            question: 'Không có thuật toán clustering nào LUÔN LUÔN tốt nhất. Điều này có nghĩa gì trong thực hành?',
            options: [
              { id: 'a', text: 'Phải chọn thuật toán dựa trên GIẢ ĐỊNH của nó có khớp với cấu trúc/hình dạng dữ liệu quan sát được hay không — không có "công thức vạn năng"', correct: true, explanation: 'Chính xác — đúng nguyên văn misconception feedback của spec.' },
              { id: 'b', text: 'Nên luôn thử NGẪU NHIÊN nhiều thuật toán và chọn cái chạy nhanh nhất', correct: false, explanation: 'Tốc độ không phải tiêu chí chọn — phải dựa trên GIẢ ĐỊNH thuật toán có khớp cấu trúc dữ liệu hay không.' },
              { id: 'c', text: 'DBSCAN luôn tốt hơn KMeans vì nó "thông minh hơn"', correct: false, explanation: 'Sai — DBSCAN thất bại khi mật độ các cụm không đều, dù thắng rõ trên dữ liệu lưỡi liềm ở bài này.' },
              { id: 'd', text: 'Nên tránh dùng bất kỳ thuật toán clustering nào vì không cái nào đáng tin', correct: false, explanation: 'Quá cực đoan — "không có 1 thuật toán vạn năng" khác với "không thuật toán nào dùng được".' },
            ],
          },
          {
            question: 'Một bạn chỉnh eps rất nhỏ khiến DBSCAN loại 70% điểm thành nhiễu, tính silhouette trên 30% còn lại được số RẤT CAO, rồi so trực tiếp với silhouette của KMeans tính trên TOÀN BỘ điểm. Vấn đề ở đây là gì?',
            options: [
              { id: 'a', text: '2 con số silhouette được tính trên 2 QUẦN THỂ khác nhau (30% vs 100% điểm) — so sánh trực tiếp là KHÔNG CÔNG BẰNG, dù mỗi con số riêng lẻ đều tính đúng công thức', correct: true, explanation: 'Chính xác — đây là unsafe-but-correct case của spec: metric computable nhưng comparison population không công bằng.' },
              { id: 'b', text: 'Không có vấn đề — silhouette luôn có thể so sánh giữa các thuật toán', correct: false, explanation: 'Sai — so sánh chỉ công bằng khi tính trên CÙNG (hoặc tương đương) quần thể điểm.' },
              { id: 'c', text: 'Vấn đề là công thức silhouette bị tính sai', correct: false, explanation: 'Công thức không sai — vấn đề nằm ở QUY TRÌNH so sánh, không phải công thức toán học.' },
              { id: 'd', text: 'Vấn đề là eps luôn phải lớn hơn 0.3', correct: false, explanation: 'Không có ngưỡng eps cố định đúng cho mọi dữ liệu — vấn đề cụ thể ở đây là loại quá nhiều điểm rồi so sánh không công bằng.' },
            ],
          },
        ],
        mini_game: {
          title: 'Thực hành nào giữ ĐÚNG kỷ luật khi so sánh thuật toán clustering?',
          instruction: 'Xếp mỗi thực hành vào đúng nhóm.',
          chips: [
            { id: 'chip-sharedx', label: 'Dùng CHUNG 1 representation (scale 1 lần) cho mọi thuật toán so sánh' },
            { id: 'chip-guardnone', label: 'Trả None cho silhouette khi có <2 cụm hợp lệ, thay vì số giả' },
            { id: 'chip-unfaircompare', label: 'So silhouette của model đã loại nhiễu với model tính trên toàn bộ điểm' },
            { id: 'chip-universal', label: 'Kết luận 1 thuật toán "luôn tốt nhất" chỉ từ 1 tập dữ liệu' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-sharedx': 'dung', 'chip-guardnone': 'dung', 'chip-unfaircompare': 'sai', 'chip-universal': 'sai' },
          success_html: '✅ Dùng chung representation, bảo vệ metric bằng None khi không hợp lệ — không so sánh khác quần thể, không kết luận "luôn tốt nhất" từ 1 dữ liệu.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Lắp pipeline so sánh 3 họ thuật toán — cùng representation, guarded silhouette, đếm cluster/noise.',
        blocks: [
          { type: 'py', token: 'X = StandardScaler().fit_transform(load_shape_clustering_data())', slot: 'z1a' },
          { type: 'py', token: 'models = {"kmeans": KMeans(n_clusters=2, n_init=20, random_state=42), "dbscan": DBSCAN(eps=0.35, min_samples=6), "complete_link": AgglomerativeClustering(n_clusters=2, linkage="complete")}', slot: 'z1b' },
          { type: 'py', token: 'labels = model.fit_predict(X)', slot: 'z2a' },
          { type: 'py', token: 'valid = labels != -1; unique = np.unique(labels[valid])', slot: 'z2b' },
          { type: 'py', token: 'score = silhouette_score(X[valid], labels[valid]) if valid.sum() > 2 and len(unique) >= 2 else None', slot: 'z3a' },
          { type: 'py', token: 'report.append({"model": name, "clusters": len(unique), "noise": int((labels == -1).sum()), "silhouette": score})', slot: 'z3b' },
          /* 2 mồi bẫy — unsafe-but-correct của spec: eps quá nhỏ (loại gần hết thành nhiễu) / bỏ guard, tính silhouette không kiểm tra trạng thái hợp lệ */
          { type: 'py', token: 'DBSCAN(eps=0.1, min_samples=6)', slot: 't1' },
          { type: 'py', token: 'score = silhouette_score(X, labels)', slot: 't2' },
        ],
        drop_zones: [
          { id: 'shape-source', accepts: ['py'], multi: true },
          { id: 'shape-fit', accepts: ['py'], multi: true },
          { id: 'shape-report', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'shape-source': 'X = StandardScaler().fit_transform(load_shape_clustering_data()) models = {"kmeans": KMeans(n_clusters=2, n_init=20, random_state=42), "dbscan": DBSCAN(eps=0.35, min_samples=6), "complete_link": AgglomerativeClustering(n_clusters=2, linkage="complete")}',
          'shape-fit': 'labels = model.fit_predict(X) valid = labels != -1; unique = np.unique(labels[valid])',
          'shape-report': 'score = silhouette_score(X[valid], labels[valid]) if valid.sum() > 2 and len(unique) >= 2 else None report.append({"model": name, "clusters": len(unique), "noise": int((labels == -1).sum()), "silhouette": score})',
        },
        reveal_hints: {
          'shape-source': 'Chuẩn hoá X <strong>1 LẦN DUY NHẤT</strong>, khai báo cả 3 model trong 1 dict <strong>models</strong>.',
          'shape-fit': 'fit_predict trên <strong>X chung</strong>, tách <strong>valid</strong> (không phải nhiễu) và đếm cụm hợp lệ.',
          'shape-report': 'Tính silhouette CÓ BẢO VỆ (<strong>None</strong> khi không hợp lệ), ghi đủ 4 trường vào <strong>report</strong>.',
        },
        ml_flow: {
          brand: 'DÒNG CHẢY SHAPE-AWARE CLUSTERING BENCH',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: '240 mẫu · 2 lưỡi liềm lồng nhau (non-globular)' },
          done_note: 'DBSCAN khớp đúng hình dạng thật dù silhouette thấp hơn KMeans — không thuật toán nào "luôn thắng". Click lại trạm bất kỳ để xem lại, rồi sang Bước 4 tự viết code.',
          stations: [
            {
              zones: ['shape-source'],
              icon: '🔒', label: 'KHOÁ REPRESENTATION', sub: '1 StandardScaler chung', result_kind: 'shape_bench',
              shape: { mode: 'lock' },
              narration: 'Chuẩn hoá X đúng 1 lần, dùng CHUNG cho cả KMeans, DBSCAN và Agglomerative — nếu mỗi thuật toán được tiền xử lý khác nhau, phần so sánh sau đó sẽ không còn ý nghĩa.',
            },
            {
              zones: ['shape-fit'],
              icon: '🎛️', label: 'TUNE DBSCAN', sub: 'eps (min_samples=6 cố định)', result_kind: 'shape_bench',
              shape: {
                mode: 'tune', best_eps: 0.35,
                rows: [{ eps: 0.15, clusters: 13, noise: 97, flagged: true }, { eps: 0.2, clusters: 11, noise: 20, flagged: true }, { eps: 0.28, clusters: 3, noise: 6, flagged: false }, { eps: 0.35, clusters: 2, noise: 3, flagged: false }, { eps: 0.4, clusters: 1, noise: 2, flagged: true }],
              },
              narration: 'eps=0.15-0.2 → vỡ vụn 11-13 cụm giả, phần lớn là nhiễu — GẮN CỜ. eps=0.4 → gộp về 1 cụm DUY NHẤT (silhouette không tính được) — GẮN CỜ. eps=0.35 cho đúng 2 cụm, chỉ 3 điểm nhiễu — cấu hình hợp lệ.',
            },
            {
              zones: ['shape-report'],
              icon: '⚖️', label: 'SO GIẢ ĐỊNH', sub: 'ARI vs hình dạng thật', result_kind: 'shape_bench',
              shape: { mode: 'compare', kmeans_ari: 0.47, dbscan_ari: 1.0, agg_ari: 0.64 },
              narration: 'So ARI với hình dạng THẬT (không chỉ silhouette): DBSCAN=1.0, Complete-link=0.64, KMeans=0.47. DBSCAN thắng vì giả định MẬT ĐỘ khớp đúng dữ liệu lưỡi liềm — không phải vì nó "luôn tốt hơn" về bản chất.',
            },
          ],
        },
      },
      drag_map: {
        brand: 'DÒNG CHẢY SHAPE-AWARE CLUSTERING BENCH',
        table_sub: 'DataFrame nguồn · 2 feature (2 lưỡi liềm lồng nhau)',
        idle_sub: 'Bấm ▶ để chạy pipeline',
        run_label: '▶ Chạy Pipeline',
        table: {
          name: 'shape_clustering_data',
          columns: ['feat_x', 'feat_y'],
          dataRows: [
            ['-0.47', '0.88'],
            ['0.25', '-0.27'],
            ['-0.71', '0.63'],
            ['0.45', '-0.42'],
            ['-0.31', '0.86'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Fit <code>KMeans</code>, <code>DBSCAN</code> và <code>AgglomerativeClustering</code>(complete) trên CÙNG 1 representation đã scale, tính guarded silhouette và đếm cluster/noise cho mỗi thuật toán.</p>',
        context: {
          scenario: 'StudyLab cần một BẢNG SO SÁNH công bằng giữa 3 họ thuật toán clustering trên dữ liệu hành vi có hình dạng bất thường — không phải "thử từng cái rồi khoe con số đẹp nhất". Kết quả phải xử lý đúng cả trường hợp 1 thuật toán trả về 1 cụm duy nhất hoặc toàn nhiễu.',
          real_world: 'Giống việc so sánh 3 ứng viên trong CÙNG 1 vòng phỏng vấn, CÙNG bộ câu hỏi — không phải so ứng viên A trả lời 10 câu với ứng viên B chỉ trả lời 3 câu dễ nhất rồi kết luận B giỏi hơn.',
          steps: [
            'Chuẩn hoá dữ liệu bằng <code>load_shape_clustering_data()</code> — đúng 1 lần, dùng chung cho mọi thuật toán.',
            'Khai báo 3 ứng viên: 1 dựa trên tâm cụm, 1 dựa trên mật độ, 1 dựa trên hợp nhất phân cấp.',
            'Với mỗi ứng viên: fit, xác định điểm nào hợp lệ (không phải nhiễu), đếm số cụm hợp lệ.',
            'Tính 1 metric nội bộ CÓ BẢO VỆ (trả rỗng/None khi trạng thái không hợp lệ), ghi đủ thông tin vào báo cáo.',
          ],
          hint_explore: 'Muốn xem shape dữ liệu? Gõ <code>print(load_shape_clustering_data().shape)</code> rồi Run.',
          expected: 'Biến `report` là list 3 dict (kmeans/dbscan/complete_link), mỗi dict có clusters/noise/silhouette khớp engine (silhouette có thể là None).',
        },
        hints: [
          { level: 1, text: 'Nhập <code>from sklearn.preprocessing import StandardScaler</code>, <code>from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering</code>, <code>from sklearn.metrics import silhouette_score</code>, <code>from ml_lab import load_shape_clustering_data</code>.' },
          { level: 2, text: '<code>X = StandardScaler().fit_transform(load_shape_clustering_data())</code> — CHỈ 1 lần. Khai báo <code>models = {"kmeans": KMeans(n_clusters=2, n_init=20, random_state=42), "dbscan": DBSCAN(eps=0.35, min_samples=6), "complete_link": AgglomerativeClustering(n_clusters=2, linkage="complete")}</code>.' },
          { level: 3, text: 'Với mỗi <code>name, model</code> trong <code>models.items()</code>: <code>labels = model.fit_predict(X)</code>, <code>valid = labels != -1</code>, <code>unique = np.unique(labels[valid])</code>. Tính <code>score</code> CÓ ĐIỀU KIỆN (None nếu <2 cụm hợp lệ hoặc quá ít điểm).' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>from sklearn.preprocessing import StandardScaler<br>from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering<br>from sklearn.metrics import silhouette_score<br>from ml_lab import load_shape_clustering_data<br>X = StandardScaler().fit_transform(load_shape_clustering_data())<br>models = {<br>&nbsp;&nbsp;&nbsp;&nbsp;"kmeans": KMeans(n_clusters=2, n_init=20, random_state=42),<br>&nbsp;&nbsp;&nbsp;&nbsp;"dbscan": DBSCAN(eps=0.35, min_samples=6),<br>&nbsp;&nbsp;&nbsp;&nbsp;"complete_link": AgglomerativeClustering(n_clusters=2, linkage="complete"),<br>}<br>report = []<br>for name, model in models.items():<br>&nbsp;&nbsp;&nbsp;&nbsp;labels = model.fit_predict(X)<br>&nbsp;&nbsp;&nbsp;&nbsp;valid = labels != -1<br>&nbsp;&nbsp;&nbsp;&nbsp;unique = np.unique(labels[valid])<br>&nbsp;&nbsp;&nbsp;&nbsp;score = silhouette_score(X[valid], labels[valid]) if valid.sum() > 2 and len(unique) >= 2 else None<br>&nbsp;&nbsp;&nbsp;&nbsp;report.append({"model": name, "clusters": len(unique), "noise": int((labels == -1).sum()), "silhouette": score})<br>print(report)</code>' },
        ],
        grader_fn: 'grade_lesson_c3_9',
        success_message: 'Bạn vừa so sánh 3 họ thuật toán clustering CÔNG BẰNG — cùng representation, metric có bảo vệ, không kết luận "luôn tốt nhất" từ 1 con số. Khép Module 3 — sẵn sàng cho Neural Computation!',
        xp_reward: 65,
        starter_hint: '💡 Bắt đầu bằng: from sklearn.preprocessing import StandardScaler',
      },
    },

    // ╔══════════════════════════════════════════════════════════╗
    // ║  M4 — NEURAL COMPUTATION                                  ║
    // ╚══════════════════════════════════════════════════════════╝
    {
      id: 'c3_l10',
      index: 10,
      title: 'Perceptron: neuron đầu tiên biết học',
      subtitle: 'Tổng có trọng số, quyết định bậc thang, cập nhật theo lỗi và giới hạn XOR',
      module: 4,
      module_title: 'M4 · Neural Computation',
      estimated_minutes: 25,
      xp_reward: 65,
      achievement: { name: 'First Neuron', desc: 'Tự tay cập nhật trọng số perceptron đúng theo lỗi và giải thích vì sao XOR không bao giờ hội tụ.' },
      story: {
        tag: '🧬 StudyLab · Advanced Modeling Lab',
        hook: 'Mở màn Module 4: StudyLab lùi lại tận gốc — trước cả cây quyết định, trước cả SVM, là MỘT neuron duy nhất: tính tổng có trọng số, ra quyết định 0/1, và tự sửa mình mỗi khi sai. Một bạn đồng nghiệp train neuron này trên dữ liệu XOR, thấy sau 50 epoch số lỗi vẫn không về 0, và kết luận "code chắc bị bug, để em sửa lại update rule". Bài này bạn tự tay lắp update rule đúng công thức, xem nó hội tụ mượt trên AND/OR — rồi hiểu vì sao KHÔNG THỂ hội tụ trên XOR, và đó không phải lỗi code.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Tính điểm neuron (weighted sum) và liên hệ nó với 1 đường biên quyết định tuyến tính.',
            'Áp update rule ĐÚNG — chỉ cập nhật w,b trên điểm bị phân loại sai.',
            'Theo dõi w, b và số lỗi qua từng epoch; giải thích điều kiện hội tụ (tách tuyến tính) và vì sao 1 perceptron không giải được XOR.',
          ],
        },
        glossary: [
          { term: 'Neuron score (z)', vi: 'Điểm neuron', accent: '#22D3EE', def: 'z = w·x + b — tổng có trọng số của input cộng bias, TRƯỚC khi qua bước quyết định.', ex: 'z = w·x + b', out: '' },
          { term: 'Step activation', vi: 'Hàm bậc thang', accent: '#67E8F9', def: 'Chuyển z thành nhãn 0/1: pred=1 nếu z≥0, ngược lại pred=0 — quyết định cứng, không có vùng "gần đúng".', ex: 'pred = 1 if z >= 0 else 0', out: '' },
          { term: 'Mistake-driven update', vi: 'Cập nhật theo lỗi', accent: '#0891B2', def: 'CHỈ thay đổi w, b khi error = y − pred ≠ 0 — điểm đã phân loại đúng KHÔNG bị đụng vào.', ex: 'w += lr·error·x', out: '' },
          { term: 'Epoch & mistake count', vi: 'Vòng lặp & số lỗi', accent: '#67E8F9', def: 'Epoch = 1 lượt duyệt qua toàn bộ dữ liệu; đếm số mistake mỗi epoch để biết khi nào hội tụ (count=0 → dừng).', ex: 'mistakes.append(count)', out: '' },
          { term: 'Linear separability', vi: 'Tách tuyến tính', accent: '#A5F3FC', def: 'Tồn tại 1 đường thẳng (hyperplane) phân tách hoàn hảo 2 lớp — điều kiện ĐẢM BẢO perceptron hội tụ về 0 lỗi.', ex: 'AND, OR, dữ liệu 2 cụm tách rời', out: '' },
          { term: 'XOR limit', vi: 'Giới hạn XOR', accent: '#22D3EE', def: 'XOR KHÔNG tách tuyến tính được — 1 perceptron tuyến tính KHÔNG BAO GIỜ hội tụ trên XOR, dù chạy bao nhiêu epoch.', ex: '(0,0)→0 (0,1)→1 (1,0)→1 (1,1)→0', out: '' },
        ],
        primer: {
          goal: [
            'Bấm 2 tab TRƯỚC/SAU — xem 1 điểm bị phân loại sai đẩy đường biên quyết định đi đúng 1 lần.',
            'Lắp update rule đúng công thức, theo dõi mistake qua từng epoch trên AND/OR và thấy vì sao XOR không hội tụ.',
          ],
          intro: '<p>Một perceptron chỉ làm 2 việc: tính <strong>z = w·x + b</strong>, rồi quyết định 0/1 bằng bậc thang. Khi nó sai, nó tự sửa — nhưng CHỈ khi sai (<strong>error ≠ 0</strong>), và CHỈ theo đúng hướng của error. Lặp lại đủ nhiều lần trên dữ liệu tách tuyến tính được, đường biên hội tụ về vị trí phân tách hoàn hảo. Trên dữ liệu KHÔNG tách tuyến tính được (như XOR), không có vị trí nào là "hoàn hảo" — nên nó không bao giờ dừng lại ở 0 lỗi.</p>',
          example: '',
        },
        intro: 'Một neuron, 1 công thức cập nhật, và giới hạn rõ ràng của riêng nó.',
        concept_cards: [
          { icon: 'fa-bullseye', title: 'Score → bậc thang → dự đoán', body: 'z = w·x + b rồi step: z≥0 → 1, ngược lại → 0 — quyết định nhị phân, không có vùng xám.' },
          { icon: 'fa-arrows-rotate', title: 'Chỉ update khi SAI', body: 'error = y − pred ≠ 0 mới cập nhật w, b theo lr·error·x — điểm đã đúng không bị đụng vào.' },
          { icon: 'fa-ban', title: 'Hội tụ phụ thuộc tách tuyến tính', body: 'AND/OR/dữ liệu tách được → hội tụ về 0 lỗi. XOR không tách tuyến tính được → KHÔNG BAO GIỜ hội tụ, dù chạy bao nhiêu epoch.' },
        ],
        perceptron_lens: {
          title: 'MỘT NEURON DI CHUYỂN ĐƯỜNG SAU 1 LỖI',
          intro: 'Bấm 2 tab — điểm viền vàng bị phân loại sai đẩy đường biên đi đúng 1 lần cập nhật thật (dữ liệu AND).',
          points: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]],
          mistake_point: [1, 0],
          before: { w: [0, 0.1], b: 0, score: 0, pred: 1, error: -1 },
          after: { w: [-0.1, 0.1], b: -0.1 },
          riddle: {
            prompt: 'Vì sao w và b thay đổi ở bước này?',
            options: ['Vì error ≠ 0 (điểm bị phân loại sai)', 'Vì mọi điểm đều được cập nhật mỗi vòng', 'Vì learning_rate luôn ép update dù đúng hay sai'],
            answer: 'Vì error ≠ 0 (điểm bị phân loại sai)',
            wrong: {
              'Vì mọi điểm đều được cập nhật mỗi vòng': 'Sai — update CHỈ xảy ra trên điểm có error ≠ 0. 3 điểm còn lại của AND ở bước này đã đúng, không bị đụng vào.',
              'Vì learning_rate luôn ép update dù đúng hay sai': 'Sai — learning_rate chỉ quyết định BƯỚC LỚN của update, không quyết định CÓ update hay không. Điều kiện đó là error ≠ 0.',
            },
            done: '✅ Đúng — update rule chỉ kích hoạt khi error ≠ 0: w += lr·error·x, b += lr·error. Điểm (1,0) có nhãn thật 0 nhưng score=0 → pred=1 (sai), error=-1 → w,b bị kéo về đúng hướng để lần sau điểm này khớp.',
          },
        },
        visual: {
          schema: {
            table_name: 'perceptron_and',
            columns: [
              { name: 'x1', type: 'INT', key: '' },
              { name: 'x2', type: 'INT', key: '' },
              { name: 'label', type: 'INT', key: '' },
            ],
          },
          data_preview: [
            ['0', '0', '0'],
            ['0', '1', '0'],
            ['1', '0', '0'],
            ['1', '1', '1'],
          ],
        },
        mission: 'Lắp đúng update rule mistake-driven của perceptron, theo dõi w/b/mistake qua từng epoch trên AND/OR và XOR.',
      },
      step_2: {
        mcq: [
          {
            question: 'Ở bước cập nhật thật trong bài (điểm (1,0), nhãn thật=0, pred=1, error=-1), trọng số đổi từ w=[0, 0.1] thành w=[-0.1, 0.1] — thành phần w[0] giảm nhưng w[1] không đổi. Vì sao?',
            options: [
              { id: 'a', text: 'Công thức w += lr·error·x: vì x=(1,0), chỉ thành phần khớp x=1 (w[0]) bị trừ lr·|error|; thành phần khớp x=0 (w[1]) nhân với 0 nên không đổi', correct: true, explanation: 'Đúng — đây là số thật đo được ngay trong hero lens của bài.' },
              { id: 'b', text: 'w luôn giảm đều ở MỌI chiều mỗi khi có lỗi, bất kể giá trị x', correct: false, explanation: 'Sai — mức thay đổi của mỗi chiều w tỉ lệ với giá trị x TƯƠNG ỨNG ở chiều đó, không đều nhau.' },
              { id: 'c', text: 'w[1] không đổi vì nó đóng vai trò bias', correct: false, explanation: 'Sai — bias là b riêng biệt (đã đổi từ 0 → -0.1). w[1] là trọng số của x2, không phải bias.' },
              { id: 'd', text: 'Việc w[1] không đổi là ngẫu nhiên, không theo công thức cố định', correct: false, explanation: 'Sai — mọi thay đổi đều theo ĐÚNG công thức w += lr·error·x, không có yếu tố ngẫu nhiên.' },
            ],
          },
          {
            question: 'Perceptron hội tụ (mistakes về 0) được ĐẢM BẢO khi nào?',
            options: [
              { id: 'a', text: 'Khi dữ liệu linearly separable — tồn tại ít nhất 1 đường thẳng phân tách hoàn hảo 2 lớp', correct: true, explanation: 'Chính xác — đây là điều kiện hội tụ kinh điển của perceptron.' },
              { id: 'b', text: 'Khi chạy đủ nhiều epoch, bất kể dữ liệu có hình dạng gì', correct: false, explanation: 'Sai — số epoch không cứu được dữ liệu KHÔNG tách tuyến tính được (ví dụ XOR sẽ không hội tụ dù chạy bao lâu).' },
              { id: 'c', text: 'Khi learning_rate được chọn đủ nhỏ', correct: false, explanation: 'Sai — learning_rate ảnh hưởng tốc độ/độ lớn bước cập nhật, không quyết định CÓ hội tụ được hay không.' },
              { id: 'd', text: 'Khi dùng seed cố định cho thứ tự duyệt dữ liệu', correct: false, explanation: 'Sai — seed chỉ ảnh hưởng thứ tự duyệt, không thay đổi việc dữ liệu có tách tuyến tính được hay không.' },
            ],
          },
          {
            question: 'Trên dữ liệu XOR, sau 50 epoch số lỗi vẫn không về 0 — dao động quanh 1-4 lỗi mỗi epoch. Kết luận nào ĐÚNG?',
            options: [
              { id: 'a', text: 'Đây là GIỚI HẠN NĂNG LỰC của 1 perceptron tuyến tính (XOR không tách tuyến tính được) — không phải bằng chứng code bị lỗi', correct: true, explanation: 'Đúng nguyên văn misconception feedback của spec: thất bại trên XOR là giới hạn năng lực model, không phải bằng chứng code sai.' },
              { id: 'b', text: 'Code chắc chắn có bug vì mistakes không giảm dần về 0', correct: false, explanation: 'Sai — code có thể ĐÚNG 100% công thức mà vẫn không hội tụ, vì bản thân bài toán XOR vượt quá năng lực 1 perceptron tuyến tính.' },
              { id: 'c', text: 'Chỉ cần tăng epochs lên 500 hoặc 5000 chắc chắn sẽ hội tụ', correct: false, explanation: 'Sai — đây chính là "unsafe-but-correct case" trong spec: không có số epoch nào đủ cho dữ liệu không tách tuyến tính được.' },
              { id: 'd', text: 'Cần tăng learning_rate lớn hơn để hội tụ nhanh hơn', correct: false, explanation: 'Sai — learning_rate lớn hơn chỉ làm mistakes dao động mạnh hơn, không giải quyết được vấn đề gốc là XOR không tách tuyến tính được.' },
            ],
          },
        ],
        mini_game: {
          title: 'Thực hành nào giữ ĐÚNG kỷ luật khi train và diễn giải perceptron?',
          instruction: 'Xếp mỗi thực hành vào đúng nhóm.',
          chips: [
            { id: 'chip-mistakeonly', label: 'Chỉ update w, b khi error ≠ 0 (điểm bị phân loại sai)' },
            { id: 'chip-tracehist', label: 'Ghi lại mistake history mỗi epoch để biết chính xác khi nào hội tụ (count=0)' },
            { id: 'chip-falsesuccess', label: 'Dừng ở epoch cố định rồi báo "trained successfully" bất kể mistakes có về 0 hay không' },
            { id: 'chip-moreepochs', label: 'Kết luận chỉ cần thêm epoch là chắc chắn sẽ giúp XOR hội tụ' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-mistakeonly': 'dung', 'chip-tracehist': 'dung', 'chip-falsesuccess': 'sai', 'chip-moreepochs': 'sai' },
          success_html: '✅ Update đúng lúc (chỉ khi sai), theo dõi mistake history trung thực — không tuyên bố "thành công" hay hứa hẹn "thêm epoch sẽ cứu được" khi dữ liệu vượt quá năng lực model.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Lắp update rule mistake-driven đúng công thức, theo dõi w/b/mistake count qua từng epoch.',
        blocks: [
          { type: 'py', token: 'w = np.zeros(X.shape[1], dtype=float)', slot: 'z1a' },
          { type: 'py', token: 'b = 0.0', slot: 'z1b' },
          { type: 'py', token: 'pred = 1 if X[i] @ w + b >= 0 else 0', slot: 'z2a' },
          { type: 'py', token: 'error = y[i] - pred', slot: 'z2b' },
          { type: 'py', token: 'if error != 0: w += learning_rate * error * X[i]; b += learning_rate * error; count += 1', slot: 'z3a' },
          { type: 'py', token: 'mistakes.append(count)', slot: 'z3b' },
          /* 2 mồi bẫy — đúng 2 misconception của spec: update vô điều kiện (bỏ guard error != 0) / tuyên bố thành công bất kể hội tụ */
          { type: 'py', token: 'w += learning_rate * error * X[i]', slot: 't1' },
          { type: 'py', token: 'print("trained successfully")  # bất kể mistakes có về 0 hay không', slot: 't2' },
        ],
        drop_zones: [
          { id: 'pct-init', accepts: ['py'], multi: true },
          { id: 'pct-score', accepts: ['py'], multi: true },
          { id: 'pct-update', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'pct-init': 'w = np.zeros(X.shape[1], dtype=float) b = 0.0',
          'pct-score': 'pred = 1 if X[i] @ w + b >= 0 else 0 error = y[i] - pred',
          'pct-update': 'if error != 0: w += learning_rate * error * X[i]; b += learning_rate * error; count += 1 mistakes.append(count)',
        },
        reveal_hints: {
          'pct-init': 'Khởi tạo <strong>w</strong> bằng vector 0 (đúng số chiều feature), <strong>b</strong> bằng 0 — mọi điểm ban đầu đều bị coi là lớp 0.',
          'pct-score': 'Tính <strong>score = w·x+b</strong> rồi step thành 0/1, so với nhãn thật để ra <strong>error</strong>.',
          'pct-update': 'CHỈ update khi <strong>error ≠ 0</strong> — cộng <strong>learning_rate·error·x</strong> vào w, <strong>learning_rate·error</strong> vào b, và đếm mistake.',
        },
        ml_flow: {
          brand: 'DÒNG CHẢY PERCEPTRON TRACE',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: '4 dataset logic/hình học · AND, OR, separable, XOR' },
          done_note: 'Perceptron hội tụ trên dữ liệu tách tuyến tính (AND/OR/separable) nhưng KHÔNG BAO GIỜ hội tụ trên XOR — đây là giới hạn năng lực model, không phải lỗi code. Click lại trạm bất kỳ để xem lại, rồi sang Bước 4 tự viết code.',
          stations: [
            {
              zones: ['pct-init'],
              icon: '✋', label: 'UPDATE TAY', sub: '1 điểm bị phân loại sai', result_kind: 'perceptron_trace',
              pct: { mode: 'manual', point: [1, 0], w_before: [0, 0.1], w_after: [-0.1, 0.1], score: 0, pred: 1, label: 0, error: -1 },
              narration: 'Điểm (1,0) có nhãn thật=0 nhưng score=0 → pred=1 (SAI). error=-1 → update: w:[0,0.1]→[-0.1,0.1], b:0→-0.1 — đúng 1 lần, đúng công thức, không đụng vào các điểm đã đúng.',
            },
            {
              zones: ['pct-score'],
              icon: '✅', label: 'TRAIN AND', sub: 'dữ liệu tách tuyến tính được', result_kind: 'perceptron_trace',
              pct: { mode: 'converge', epochs: 7, mistakes: [1, 3, 2, 2, 2, 2, 0] },
              narration: 'AND tách tuyến tính được — số lỗi mỗi epoch [1,3,2,2,2,2,0], hội tụ về 0 sau đúng 7 epoch. Perceptron dừng lại đúng lúc, không cần chạy hết 50 epoch đã định sẵn.',
            },
            {
              zones: ['pct-update'],
              icon: '⚠️', label: 'CHUYỂN SANG XOR', sub: 'không tách tuyến tính được', result_kind: 'perceptron_trace',
              pct: { mode: 'xor', epochs: 50, sample_mistakes: ['epoch 1: 4 lỗi', 'epoch 2: 4 lỗi', 'epoch 3: 2 lỗi', '...', 'epoch 48: 2 lỗi', 'epoch 49: 1 lỗi', 'epoch 50: 4 lỗi'] },
              narration: 'Cùng công thức, cùng code — nhưng chạy đủ 50/50 epoch mà mistakes KHÔNG BAO GIỜ về 0, dao động quanh 1-4 lỗi mãi. XOR không tách tuyến tính được — đây là giới hạn năng lực, không phải bug.',
            },
          ],
        },
      },
      drag_map: {
        brand: 'DÒNG CHẢY PERCEPTRON TRACE',
        table_sub: 'perceptron_and · 4 dòng (bảng chân trị AND)',
        idle_sub: 'Bấm ▶ để chạy pipeline',
        run_label: '▶ Chạy Pipeline',
        table: {
          name: 'perceptron_and',
          columns: ['x1', 'x2', 'label'],
          dataRows: [
            ['0', '0', '0'],
            ['0', '1', '0'],
            ['1', '0', '0'],
            ['1', '1', '1'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Viết <code>train_perceptron(X, y, learning_rate=0.1, epochs=50, seed=42)</code> — cập nhật CHỈ khi sai, dùng thứ tự duyệt xáo trộn theo seed, trả về <code>(w, b, mistakes)</code> với <code>mistakes</code> là list số lỗi mỗi epoch.</p>',
        context: {
          scenario: 'StudyLab cần một hàm huấn luyện neuron ĐƠN, dùng lại được cho mọi dataset logic/hình học (AND, OR, dữ liệu tách rời, và cả XOR) — không hard-code số epoch, không giả định trước dữ liệu có tách tuyến tính được hay không.',
          real_world: 'Giống việc dạy 1 học sinh sửa bài: chỉ sửa CÂU SAI (không đụng vào câu đã đúng), và biết dừng lại khi không còn câu sai nào — chứ không phải luyện đúng N vòng cố định rồi tuyên bố "học xong" dù còn sai.',
          steps: [
            'Khởi tạo <code>w</code> bằng vector 0 (đúng số chiều feature) và <code>b</code> bằng 0.',
            'Dùng <code>rng.permutation(len(X))</code> (rng khởi tạo từ <code>seed</code>) để xáo trộn thứ tự duyệt mỗi epoch.',
            'Với mỗi điểm: tính <code>pred</code> bằng step activation trên <code>X[i] @ w + b</code>, tính <code>error = y[i] - pred</code>.',
            'CHỈ khi <code>error != 0</code>: cập nhật <code>w += learning_rate * error * X[i]</code>, <code>b += learning_rate * error</code>, đếm mistake.',
            'Sau mỗi epoch, lưu số mistake vào <code>mistakes</code>; nếu 0 lỗi thì dừng sớm (không cần chạy hết <code>epochs</code>).',
          ],
          hint_explore: 'Muốn xem 1 case cụ thể? Gõ <code>for name, X, y in load_perceptron_cases(): print(name, X.shape, y)</code> rồi Run.',
          expected: 'Hàm trả về <code>(w, b, mistakes)</code>: AND/OR/separable hội tụ (mistakes kết thúc bằng 0) trong vài epoch; XOR chạy đủ 50 epoch mà không hội tụ.',
        },
        hints: [
          { level: 1, text: 'Nhập <code>import numpy as np</code>, <code>from ml_lab import load_perceptron_cases</code>. Định nghĩa <code>def train_perceptron(X, y, learning_rate=0.1, epochs=50, seed=42):</code>.' },
          { level: 2, text: 'Khởi tạo <code>rng = np.random.default_rng(seed)</code>, <code>w = np.zeros(X.shape[1], dtype=float)</code>, <code>b = 0.0</code>, <code>mistakes = []</code>.' },
          { level: 3, text: 'Vòng ngoài <code>for _ in range(epochs):</code> với <code>count = 0</code>; vòng trong <code>for i in rng.permutation(len(X)):</code> tính <code>pred</code>, <code>error</code>, và CHỈ update + <code>count += 1</code> khi <code>error != 0</code>. Cuối mỗi epoch: <code>mistakes.append(count)</code>; nếu <code>count == 0: break</code>.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>from ml_lab import load_perceptron_cases<br>def train_perceptron(X, y, learning_rate=0.1, epochs=50, seed=42):<br>&nbsp;&nbsp;&nbsp;&nbsp;rng = np.random.default_rng(seed)<br>&nbsp;&nbsp;&nbsp;&nbsp;w = np.zeros(X.shape[1], dtype=float)<br>&nbsp;&nbsp;&nbsp;&nbsp;b = 0.0<br>&nbsp;&nbsp;&nbsp;&nbsp;mistakes = []<br>&nbsp;&nbsp;&nbsp;&nbsp;for _ in range(epochs):<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;count = 0<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for i in rng.permutation(len(X)):<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;pred = 1 if X[i] @ w + b >= 0 else 0<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;error = y[i] - pred<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if error != 0:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;w += learning_rate * error * X[i]<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b += learning_rate * error<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;count += 1<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mistakes.append(count)<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if count == 0:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;break<br>&nbsp;&nbsp;&nbsp;&nbsp;return w, b, mistakes<br>for name, X, y in load_perceptron_cases():<br>&nbsp;&nbsp;&nbsp;&nbsp;print(name, train_perceptron(X, y)[2])</code>' },
        ],
        grader_fn: 'grade_lesson_c3_10',
        success_message: 'Bạn vừa lắp đúng update rule mistake-driven của perceptron — hội tụ mượt trên AND/OR/separable, và biết chính xác vì sao XOR không bao giờ hội tụ. Mở màn Module 4 thành công!',
        xp_reward: 65,
        starter_hint: '💡 Bắt đầu bằng: import numpy as np',
      },
    },

    {
      id: 'c3_l11',
      index: 11,
      title: 'Activation functions và gradient flow',
      subtitle: 'Sigmoid, tanh, ReLU, bão hoà và output khớp đúng loại bài toán',
      module: 4,
      module_title: 'M4 · Neural Computation',
      estimated_minutes: 25,
      xp_reward: 65,
      achievement: { name: 'Neural Mechanism Builder', desc: 'Chọn và lập trình activation bằng bằng chứng range + gradient, không theo cảm tính phổ biến.' },
      story: {
        tag: '🧬 StudyLab · Advanced Modeling Lab',
        hook: 'Neuron đơn ở Bài 10 đã học được — nhưng xếp nhiều neuron thành nhiều LỚP thì sao? Một bạn đồng nghiệp xếp 10 lớp toàn phép tính tuyến tính, tự hào khoe "mạng sâu 10 lớp", rồi ngạc nhiên khi nó vẫn chỉ vẽ được 1 đường thẳng y hệt 1 lớp — chưa kể, một bạn khác dùng thẳng output ReLU làm "xác suất" cho bài toán nhị phân vì accuracy trông vẫn ổn. Bài này bạn sẽ tự tay chèn đúng nonlinearity ở đúng chỗ, và đo bằng số THẬT vì sao chọn sai activation khiến gradient biến mất khi mạng đủ sâu.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Giải thích vì sao xếp chồng nhiều lớp LINEAR (không nonlinearity) luôn collapse thành 1 phép biến đổi tuyến tính duy nhất.',
            'So sánh range và đạo hàm của sigmoid, tanh, ReLU — nhận diện vùng bão hoà và dead-ReLU.',
            'Ghép đúng activation ẩn/output với bài toán nhị phân, đa lớp (softmax, mức nhận diện) và hồi quy — không dùng ReLU làm xác suất.',
          ],
        },
        glossary: [
          { term: 'Preactivation (z)', vi: 'Điểm trước kích hoạt', accent: '#22D3EE', def: 'z = w·x + b — giá trị THÔ trước khi qua activation, có thể là số bất kỳ (âm/dương/rất lớn).', ex: 'z = w·x+b', out: '' },
          { term: 'Sigmoid', vi: 'Hàm sigmoid', accent: '#67E8F9', def: 'Ép z vào khoảng (0,1) — mượt, khả vi mọi nơi, nhưng bão hoà (đạo hàm →0) khi |z| lớn.', ex: 'σ(z) = 1/(1+e⁻ᶻ)', out: '' },
          { term: 'ReLU & dead-ReLU', vi: 'ReLU & ReLU chết', accent: '#0891B2', def: 'ReLU = max(0,z) — đạo hàm CHÍNH XÁC bằng 1 khi z>0 (không bão hoà ở vùng dương), nhưng đạo hàm = 0 tuyệt đối khi z≤0 — unit có thể "chết" hoàn toàn nếu luôn nhận z âm.', ex: 'relu_grad(z) = (z>0)', out: '' },
          { term: 'Saturation / vanishing gradient', vi: 'Bão hoà / gradient biến mất', accent: '#67E8F9', def: 'Khi nhiều gradient <1 liên tiếp bị NHÂN DỒN qua nhiều lớp, tích số co lại rất nhanh về 0 — không cần bất kỳ lớp nào bão hoà HOÀN TOÀN, tích dồn tự nó đã đủ triệt tiêu gradient.', ex: '0.2¹⁰ ≈ 0.0000001', out: '' },
          { term: 'Softmax (multiclass output)', vi: 'Softmax (output đa lớp)', accent: '#A5F3FC', def: 'Biến 1 vector điểm số thành 1 phân phối xác suất cộng đúng bằng 1 — dùng cho OUTPUT đa lớp, không phải sigmoid áp riêng từng lớp. Bài này chỉ cần NHẬN DIỆN khi nào dùng, không cần suy công thức đầy đủ.', ex: 'Σ softmax(z) = 1', out: '' },
          { term: 'Output-task compatibility', vi: 'Khớp activation output với bài toán', accent: '#22D3EE', def: 'Nhị phân → sigmoid. Đa lớp → softmax. Hồi quy → thường là linear (không activation). Dùng sai (vd ReLU cho xác suất) phá vỡ hợp đồng interface dù accuracy vẫn trông ổn.', ex: '', out: '' },
        ],
        primer: {
          goal: [
            'Bấm 2 tab — xem 2 lớp LINEAR chồng nhau collapse thành 1 đường, còn chèn ReLU thì bẻ cong và giải đúng cả 4 điểm XOR.',
            'Lập trình 4 hàm activation/derivative vectorized, so gradient_product qua chain 10 lớp thật giữa sigmoid và ReLU.',
          ],
          intro: '<p>Nếu MỌI lớp trong mạng chỉ làm phép tính tuyến tính (z = Wx+b), thì dù xếp 2 lớp hay 100 lớp, kết quả cuối cùng vẫn viết lại được thành ĐÚNG 1 phép biến đổi tuyến tính — vì hàm-của-hàm-tuyến-tính vẫn là tuyến tính. Nonlinearity (sigmoid/tanh/ReLU) là thứ DUY NHẤT phá vỡ điều đó, cho phép mạng vẽ được đường cong/gấp khúc thay vì chỉ 1 đường thẳng. Nhưng chọn nonlinearity nào cũng có cái giá: sigmoid/tanh mượt nhưng dễ bão hoà ở mạng sâu; ReLU chống bão hoà tốt hơn ở vùng dương nhưng có thể "chết" hoàn toàn ở vùng âm.</p>',
          example: '',
        },
        intro: 'Không có nonlinearity, không có mạng sâu — chỉ có 1 đường thẳng nguỵ trang thành nhiều lớp.',
        concept_cards: [
          { icon: 'fa-layer-group', title: 'Linear chồng linear = 1 đường thẳng', body: 'y=W₂(W₁x+b₁)+b₂ luôn viết lại được thành y=W′x+b′ — dù bao nhiêu lớp, không có nonlinearity thì vẫn chỉ là 1 phép biến đổi tuyến tính duy nhất.' },
          { icon: 'fa-water', title: 'Bão hoà & dead-ReLU', body: 'Sigmoid/tanh bão hoà (đạo hàm →0) khi |z| lớn. ReLU không bão hoà ở vùng dương nhưng "chết" hoàn toàn (đạo hàm=0 mãi mãi) nếu luôn nhận z âm.' },
          { icon: 'fa-chart-pie', title: 'Softmax cho output đa lớp', body: 'Bài toán nhiều hơn 2 lớp cần Softmax ở output (phân phối xác suất cộng =1) — không phải sigmoid áp riêng từng lớp. Chỉ cần nhận diện khi nào dùng, không cần suy công thức.' },
        ],
        nonlinear_lens: {
          title: 'LINEAR CHỒNG LINEAR VẪN LÀ 1 ĐƯỜNG THẲNG',
          intro: 'Bấm 2 tab — CÙNG trọng số, chỉ khác việc có chèn ReLU giữa 2 lớp hay không.',
          points: [
            { x1: 0, x2: 0, label: 0, out_linear: 2, out_relu: 0 },
            { x1: 0, x2: 1, label: 1, out_linear: 1, out_relu: 1 },
            { x1: 1, x2: 0, label: 1, out_linear: 1, out_relu: 1 },
            { x1: 1, x2: 1, label: 0, out_linear: 0, out_relu: 0 },
          ],
          riddle: {
            prompt: 'Vì sao điểm (0,0) LUÔN bị phân loại SAI ở phiên bản LINEAR+LINEAR, dù đổi ngưỡng threshold thế nào?',
            options: ['Vì 2 lớp linear collapse thành 1 phép biến đổi tuyến tính — không đường thẳng nào tách đúng cả 4 điểm XOR', 'Vì trọng số W1, W2 chưa được train đủ lâu', 'Vì thiếu bias ở lớp thứ 2'],
            answer: 'Vì 2 lớp linear collapse thành 1 phép biến đổi tuyến tính — không đường thẳng nào tách đúng cả 4 điểm XOR',
            wrong: {
              'Vì trọng số W1, W2 chưa được train đủ lâu': 'Sai — đây không phải vấn đề TRAIN, mà là vấn đề KIẾN TRÚC: dù train bao lâu, 2 lớp linear vẫn luôn collapse thành 1 phép biến đổi tuyến tính duy nhất.',
              'Vì thiếu bias ở lớp thứ 2': 'Sai — kể cả có đủ bias, composition của 2 hàm tuyến tính vẫn LUÔN là 1 hàm tuyến tính. Vấn đề là thiếu NONLINEARITY, không phải thiếu bias.',
            },
            done: '✅ Đúng — out_linear=[2,1,1,0] xếp đơn điệu theo x1+x2, nên bất kỳ ngưỡng nào cũng chỉ đúng tối đa 3/4 điểm. Chèn ReLU (CÙNG trọng số) cho out_relu=[0,1,1,0] khớp CHÍNH XÁC nhãn XOR thật — nonlinearity là thứ duy nhất bẻ được đường.',
          },
        },
        visual: {
          schema: {
            table_name: 'activation_chain_layers',
            columns: [
              { name: 'layer', type: 'INT', key: '' },
              { name: 'mean_abs_z', type: 'FLOAT', key: '' },
              { name: 'sigmoid_grad_mean', type: 'FLOAT', key: '' },
              { name: 'relu_grad_mean', type: 'FLOAT', key: '' },
            ],
          },
          data_preview: [
            ['1', '1.206', '0.1763', '0.5041'],
            ['2', '0.838', '0.2038', '0.4281'],
            ['3', '0.724', '0.2132', '0.5744'],
            ['4', '0.679', '0.2163', '0.5537'],
            ['5', '0.716', '0.2152', '0.5000'],
          ],
        },
        mission: 'Lập trình sigmoid/sigmoid_grad/relu/relu_grad vectorized, so gradient_product qua chain 10 lớp thật giữa sigmoid và ReLU.',
      },
      step_2: {
        mcq: [
          {
            question: 'Vì sao xếp chồng 2 lớp LINEAR (không có nonlinearity ở giữa) luôn "thu gọn" thành 1 phép biến đổi tuyến tính duy nhất, dù xếp bao nhiêu lớp?',
            options: [
              { id: 'a', text: 'Composition của 2 hàm tuyến tính vẫn là 1 hàm tuyến tính: y = W₂(W₁x+b₁)+b₂ luôn viết lại được thành y = W′x+b′', correct: true, explanation: 'Đúng — đây là lý do đại số vì sao nonlinearity là bắt buộc để có "mạng sâu" thật sự.' },
              { id: 'b', text: 'Chỉ collapse khi trọng số W1, W2 quá nhỏ', correct: false, explanation: 'Sai — collapse xảy ra với BẤT KỲ giá trị W1, W2 nào, không phụ thuộc độ lớn.' },
              { id: 'c', text: 'Chỉ collapse khi W1 = W2', correct: false, explanation: 'Sai — composition tuyến tính luôn collapse, kể cả khi W1 ≠ W2 hoàn toàn.' },
              { id: 'd', text: 'Chỉ collapse khi không có bias ở lớp nào', correct: false, explanation: 'Sai — có bias vẫn collapse (b′ = W₂b₁+b₂ gộp lại), vấn đề gốc là thiếu NONLINEARITY.' },
            ],
          },
          {
            question: 'Sigmoid có range (0,1), tanh có range (-1,1), ReLU có range [0,∞). Phát biểu nào ĐÚNG về đạo hàm của chúng?',
            options: [
              { id: 'a', text: 'Sigmoid và tanh đều có đạo hàm tối đa <1 và bão hoà dần về 0 khi |z| lớn; ReLU có đạo hàm CHÍNH XÁC bằng 1 với mọi z>0 (không bão hoà ở vùng dương)', correct: true, explanation: 'Đúng — đây chính là lý do ReLU thường giảm vanishing gradient hơn ở vùng dương, dù vẫn có rủi ro dead-ReLU ở vùng âm.' },
              { id: 'b', text: 'Cả 3 hàm đều có đạo hàm luôn bằng 1 ở mọi z', correct: false, explanation: 'Sai — sigmoid_grad và tanh đạo hàm luôn <1 (max lần lượt 0.25 và 1 tại z=0), không phải luôn bằng 1.' },
              { id: 'c', text: 'ReLU không bao giờ có vấn đề gradient vì đạo hàm luôn là 1', correct: false, explanation: 'Sai — đạo hàm ReLU = 0 hoàn toàn khi z≤0 — đây chính là rủi ro dead-ReLU, không phải "luôn là 1".' },
              { id: 'd', text: 'tanh không có vùng bão hoà vì range của nó rộng hơn sigmoid', correct: false, explanation: 'Sai — tanh vẫn bão hoà mạnh ở |z| lớn giống sigmoid, chỉ khác ở range đầu ra.' },
            ],
          },
          {
            question: 'Một bạn dùng ReLU làm activation OUTPUT cho bài toán phân loại nhị phân, vì sau khi threshold ở 0.5, validation accuracy vẫn cao. Vấn đề ở đây là gì?',
            options: [
              { id: 'a', text: 'Output của ReLU KHÔNG bị chặn trong [0,1] — không phải xác suất hợp lệ, dù accuracy sau threshold trông ổn thì hợp đồng interface (probability contract) vẫn bị vi phạm', correct: true, explanation: 'Đúng nguyên văn unsafe-but-correct case của spec: code chạy, accuracy trông ổn, nhưng output không probability-bounded.' },
              { id: 'b', text: 'Không có vấn đề gì, miễn accuracy sau threshold vẫn cao', correct: false, explanation: 'Sai — accuracy cao sau threshold không chứng minh output là xác suất hợp lệ; interface contract (bị chặn trong [0,1]) vẫn bị vi phạm.' },
              { id: 'c', text: 'ReLU là activation tệ, không nên dùng ở bất kỳ vị trí nào trong mạng', correct: false, explanation: 'Quá cực đoan — ReLU vẫn rất tốt làm activation ẨN (hidden), vấn đề chỉ nằm ở việc dùng nó làm OUTPUT xác suất.' },
              { id: 'd', text: 'Vấn đề là learning_rate chưa được tune đủ tốt', correct: false, explanation: 'Sai — đây không phải vấn đề tối ưu hoá, mà là vấn đề KIẾN TRÚC: chọn sai activation cho vai trò output.' },
            ],
          },
        ],
        mini_game: {
          title: 'Thực hành nào giữ ĐÚNG kỷ luật khi chọn và lập trình activation?',
          instruction: 'Xếp mỗi thực hành vào đúng nhóm.',
          chips: [
            { id: 'chip-insertnonlin', label: 'Chèn nonlinearity (ReLU/sigmoid/tanh) GIỮA các lớp linear để tránh collapse' },
            { id: 'chip-taskmatch', label: 'Dùng sigmoid cho output nhị phân, softmax cho output đa lớp, linear cho hồi quy' },
            { id: 'chip-reluprob', label: 'Dùng thẳng output ReLU làm xác suất nhị phân vì accuracy sau threshold cao' },
            { id: 'chip-universalbest', label: 'Kết luận 1 activation "luôn tốt nhất" cho mọi vị trí, không phân biệt ẩn/output' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-insertnonlin': 'dung', 'chip-taskmatch': 'dung', 'chip-reluprob': 'sai', 'chip-universalbest': 'sai' },
          success_html: '✅ Chèn nonlinearity đúng chỗ, khớp activation output với đúng loại bài toán — không dùng ReLU làm xác suất, không tuyên bố 1 activation "luôn tốt nhất" cho mọi vị trí.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Lắp đúng công thức sigmoid/relu và derivative (vectorized), so gradient_product qua chain 10 lớp thật.',
        blocks: [
          { type: 'py', token: 'return 1.0 / (1.0 + np.exp(-z))', slot: 'z1a' },
          { type: 'py', token: 's = sigmoid(z); return s * (1 - s)', slot: 'z1b' },
          { type: 'py', token: 'return np.maximum(0.0, z)', slot: 'z2a' },
          { type: 'py', token: 'return (z > 0).astype(float)', slot: 'z2b' },
          { type: 'py', token: 'chain = load_activation_chain()', slot: 'z3a' },
          { type: 'py', token: 'gradient_product = np.prod([grad_fn(z).mean() for z in chain])', slot: 'z3b' },
          /* 2 mồi bẫy — đúng 2 misconception của spec: lặp phần tử bằng Python (mất vectorized) / gradient hằng số (ngầm định ReLU không bao giờ chết) */
          { type: 'py', token: 'for i in range(len(z)): out[i] = 1.0 / (1.0 + np.exp(-z[i]))', slot: 't1' },
          { type: 'py', token: 'return np.ones_like(z, dtype=float)', slot: 't2' },
        ],
        drop_zones: [
          { id: 'act-sigmoid', accepts: ['py'], multi: true },
          { id: 'act-relu', accepts: ['py'], multi: true },
          { id: 'act-compare', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'act-sigmoid': 'return 1.0 / (1.0 + np.exp(-z)) s = sigmoid(z); return s * (1 - s)',
          'act-relu': 'return np.maximum(0.0, z) return (z > 0).astype(float)',
          'act-compare': 'chain = load_activation_chain() gradient_product = np.prod([grad_fn(z).mean() for z in chain])',
        },
        reveal_hints: {
          'act-sigmoid': 'sigmoid(z) dùng công thức mũ thật <strong>1/(1+e⁻ᶻ)</strong>; sigmoid_grad(z) = <strong>s·(1−s)</strong> với s=sigmoid(z).',
          'act-relu': 'relu(z) = <strong>max(0, z)</strong>; relu_grad(z) = <strong>(z &gt; 0)</strong> ép kiểu float — PHỤ THUỘC z thật, không phải hằng số.',
          'act-compare': 'Lấy <strong>chain</strong> 10 lớp thật từ load_activation_chain(), rồi tính <strong>gradient_product</strong> = tích dồn mean(grad) qua từng lớp.',
        },
        ml_flow: {
          brand: 'DÒNG CHẢY GRADIENT FLOW CONSOLE',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: '10 lớp preactivation thật · cùng tín hiệu, khác activation' },
          done_note: 'Sigmoid vanishing gradient rõ rệt qua chiều sâu (tích dồn nhiều số <1) — ReLU giữ gradient lớn hơn hàng nghìn lần ở depth=10, nhưng bản thân nó cũng đang giảm dần vì dead-unit. Click lại trạm bất kỳ để xem lại, rồi sang Bước 4 tự viết code.',
          stations: [
            {
              zones: ['act-sigmoid'],
              icon: '🌱', label: 'DEPTH=1', sub: 'cả 2 activation còn khoẻ', result_kind: 'gradient_flow_console',
              gf: { mode: 'd1', depth: 1, sigmoid_prod: 0.17633593245868823, relu_prod: 0.5040625, ratio: 2.8585353703680965, note: 'Ở depth=1, sigmoid_grad trung bình ~0.18/lớp, ReLU ~0.50/lớp — cả 2 còn "khoẻ", chưa thấy khác biệt lớn.' },
              narration: 'Cùng 1 tín hiệu qua đúng 1 lớp — sigmoid_grad mean≈0.176, relu_grad mean≈0.504. ReLU đã nhỉnh hơn ~2.9 lần, nhưng chưa đáng lo.',
            },
            {
              zones: ['act-relu'],
              icon: '⚠️', label: 'DEPTH=5', sub: 'sigmoid bắt đầu tụt xa', result_kind: 'gradient_flow_console',
              gf: { mode: 'd5', depth: 5, sigmoid_prod: 0.00035668000348158276, relu_prod: 0.03431897040443419, ratio: 96.21781448201163, note: 'Qua 5 lớp, sigmoid TÍCH DỒN 5 số <1 liên tiếp → gradient_product rơi xuống ~0.00036 — ReLU vẫn giữ được ~0.034, gấp khoảng 96 lần.' },
              narration: 'Không lớp nào bão hoà HOÀN TOÀN — nhưng tích dồn 5 số đều <1 đã đủ khiến sigmoid gradient_product rơi xuống 0.00036, trong khi ReLU chỉ còn 0.034 (gấp ~96 lần).',
            },
            {
              zones: ['act-compare'],
              icon: '🔥', label: 'DEPTH=10', sub: 'sigmoid gần như biến mất', result_kind: 'gradient_flow_console',
              gf: { mode: 'd10', depth: 10, sigmoid_prod: 2.014964634320545e-7, relu_prod: 0.0006362541052457818, ratio: 3157.644032101484, note: 'Qua 10 lớp, sigmoid gradient_product chỉ còn ~2×10⁻⁷ — coi như KHÔNG CÒN gradient để học (vanishing gradient). ReLU vẫn còn ~0.00064, gấp khoảng 3158 lần — nhưng bản thân nó CŨNG đang giảm dần vì ~50% unit "chết" mỗi lớp (dead-ReLU vẫn là rủi ro có thật, không phải "ReLU luôn tốt nhất").' },
              narration: 'Qua đủ 10 lớp — sigmoid gradient_product chỉ còn 2×10⁻⁷ (coi như học không nổi). ReLU còn 0.00064, gấp ~3158 lần — thắng rõ rệt, nhưng KHÔNG miễn nhiễm: dead-ReLU vẫn làm nó giảm dần theo độ sâu.',
            },
          ],
        },
      },
      drag_map: {
        brand: 'DÒNG CHẢY GRADIENT FLOW CONSOLE',
        table_sub: 'activation_chain_layers · 10 lớp preactivation thật',
        idle_sub: 'Bấm ▶ để chạy pipeline',
        run_label: '▶ Chạy Pipeline',
        table: {
          name: 'activation_chain_layers',
          columns: ['layer', 'mean_abs_z', 'sigmoid_grad_mean', 'relu_grad_mean'],
          dataRows: [
            ['1', '1.206', '0.1763', '0.5041'],
            ['2', '0.838', '0.2038', '0.4281'],
            ['3', '0.724', '0.2132', '0.5744'],
            ['4', '0.679', '0.2163', '0.5537'],
            ['5', '0.716', '0.2152', '0.5000'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Viết <code>sigmoid</code>, <code>sigmoid_grad</code>, <code>relu</code>, <code>relu_grad</code> — VECTORIZED, dùng đúng <code>z</code> — rồi so <code>gradient_product</code> (tích dồn mean(grad) qua <code>load_activation_chain()</code>) giữa 2 activation.</p>',
        context: {
          scenario: 'StudyLab cần 1 bộ hàm activation/derivative CHUẨN, dùng lại được để đo gradient-flow của bất kỳ chain layer nào — không được lặp phần tử bằng Python (chậm, không mở rộng được), và không được "giả lập" activation bằng công thức khác trông giống nhưng SAI ở giá trị biên (vd np.clip thay vì exp thật).',
          real_world: 'Giống việc đo huyết áp bằng đúng thiết bị y tế chuẩn thay vì ước lượng bằng mắt — công thức "trông giống đúng" trên vài ca điển hình vẫn có thể sai lệch nghiêm trọng ở ca biên (z rất lớn/rất nhỏ), và với activation, ca biên đó chính là nơi bão hoà/dead-unit xảy ra.',
          steps: [
            'Viết <code>sigmoid(z)</code> bằng công thức mũ thật: <code>1/(1+e⁻ᶻ)</code> — vectorized trên toàn mảng z.',
            'Viết <code>sigmoid_grad(z)</code> = s·(1−s) với s=sigmoid(z).',
            'Viết <code>relu(z)</code> = max(0, z) và <code>relu_grad(z)</code> = (z&gt;0) ép kiểu float — PHỤ THUỘC z thật.',
            'Lấy <code>chain = load_activation_chain()</code>, với mỗi (name, grad_fn) trong [("sigmoid", sigmoid_grad), ("relu", relu_grad)]: tính <code>gradient_product</code> = tích các mean(grad_fn(z)) qua từng lớp, rồi in ra.',
          ],
          hint_explore: 'Muốn xem chain thật? Gõ <code>chain = load_activation_chain(); print(len(chain), chain[0].shape)</code> rồi Run.',
          expected: 'In ra đúng "sigmoid <gradient_product>" và "relu <gradient_product>" — gradient_product của ReLU phải LỚN HƠN sigmoid hàng chục đến hàng nghìn lần tuỳ độ sâu, không hard-code.',
        },
        hints: [
          { level: 1, text: 'Nhập <code>import numpy as np</code>, <code>from ml_lab import load_activation_chain</code>. Định nghĩa lần lượt <code>sigmoid</code>, <code>sigmoid_grad</code>, <code>relu</code>, <code>relu_grad</code> — mỗi hàm đúng 1 tham số <code>z</code>.' },
          { level: 2, text: '<code>def sigmoid(z): return 1.0 / (1.0 + np.exp(-z))</code>. <code>def sigmoid_grad(z): s = sigmoid(z); return s * (1 - s)</code>.' },
          { level: 3, text: '<code>def relu(z): return np.maximum(0.0, z)</code>. <code>def relu_grad(z): return (z > 0).astype(float)</code> — chú ý PHẢI so sánh với z, không được trả hằng số cố định.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>from ml_lab import load_activation_chain<br>def sigmoid(z):<br>&nbsp;&nbsp;&nbsp;&nbsp;return 1.0 / (1.0 + np.exp(-z))<br>def sigmoid_grad(z):<br>&nbsp;&nbsp;&nbsp;&nbsp;s = sigmoid(z)<br>&nbsp;&nbsp;&nbsp;&nbsp;return s * (1 - s)<br>def relu(z):<br>&nbsp;&nbsp;&nbsp;&nbsp;return np.maximum(0.0, z)<br>def relu_grad(z):<br>&nbsp;&nbsp;&nbsp;&nbsp;return (z > 0).astype(float)<br>chain = load_activation_chain()<br>for name, grad_fn in [("sigmoid", sigmoid_grad), ("relu", relu_grad)]:<br>&nbsp;&nbsp;&nbsp;&nbsp;gradient_product = np.prod([grad_fn(z).mean() for z in chain])<br>&nbsp;&nbsp;&nbsp;&nbsp;print(name, gradient_product)</code>' },
        ],
        grader_fn: 'grade_lesson_c3_11',
        success_message: 'Bạn vừa lập trình đúng 4 hàm activation/derivative vectorized, và đo được bằng số THẬT vì sao sigmoid vanishing gradient nặng hơn ReLU rất nhiều lần khi mạng đủ sâu. Module 4 tiến 2/3!',
        xp_reward: 65,
        starter_hint: '💡 Bắt đầu bằng: import numpy as np',
      },
    },

    {
      id: 'c3_l12',
      index: 12,
      title: 'Feedforward qua một neural network',
      subtitle: 'Shape của lớp, hidden representation và vectorized inference',
      module: 4,
      module_title: 'M4 · Neural Computation',
      estimated_minutes: 26,
      xp_reward: 65,
      achievement: { name: 'Neural Mechanism Builder', desc: 'Lắp forward pass 2 lớp shape-safe, chạy đúng cho batch bất kỳ, không hard-code.' },
      story: {
        tag: '🧬 StudyLab · Advanced Modeling Lab',
        hook: 'Bạn đã có neuron đơn (Bài 10) và biết chọn activation đúng chỗ (Bài 11) — giờ xếp chúng thành 1 MẠNG thật: input → hidden → output. Một bạn đồng nghiệp viết forward pass, test với đúng 1 sample, thấy chạy ra shape đẹp, submit luôn. Nhưng bias của bạn ấy bị ép sai hướng — chỉ TÌNH CỜ đúng shape với 1 sample, còn với batch 5 hay 8 mẫu thì vỡ hoặc ra số sai hoàn toàn. Bài này bạn tự tay lắp forward pass ĐÚNG contract, và học cách không tin vào 1 test case nhỏ.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Suy ra đúng shape của W, b và activation ở mỗi lớp — số cột lớp trước phải khớp số hàng lớp sau.',
            'Tính đúng thứ tự affine (Z=XW+b) rồi mới activation (A=f(Z)) ở mỗi lớp.',
            'Lắp forward pass vectorized, đúng cho batch bất kỳ — không hard-code kích thước, không đoán hidden unit là "khái niệm" gì.',
          ],
        },
        glossary: [
          { term: 'Shape contract', vi: 'Hợp đồng shape', accent: '#22D3EE', def: 'Số CỘT của ma trận bên trái phải khớp số HÀNG của ma trận bên phải khi nhân — X(m,n_in)@W1(n_in,n_hidden) chỉ hợp lệ khi n_in khớp CẢ HAI bên.', ex: '(m,3)@(3,4)=(m,4)', out: '' },
          { term: 'Affine transform (Z)', vi: 'Biến đổi affine', accent: '#67E8F9', def: 'Z = X@W + b — phép tính TUYẾN TÍNH trước khi qua activation, ở MỖI lớp.', ex: 'Z1 = X@W1+b1', out: '' },
          { term: 'Hidden representation', vi: 'Biểu diễn ẩn', accent: '#0891B2', def: 'A1 (hidden activation) là toạ độ HỌC ĐƯỢC, không phải khái niệm con người đặt tên sẵn — muốn gán ý nghĩa (vd "unit này = độ tuổi") cần BẰNG CHỨNG riêng, không được ngầm định.', ex: 'A1[:,0] ≠ "tuổi" trừ khi chứng minh', out: '' },
          { term: 'Weight matrix orientation', vi: 'Hướng ma trận trọng số', accent: '#67E8F9', def: 'W1 shape (n_in, n_hidden): HÀNG ứng với input feature, CỘT ứng với hidden unit. Đảo hướng (transpose nhầm) là lỗi rất phổ biến.', ex: 'W1.shape = (3,4)', out: '' },
          { term: 'Cache', vi: 'Bộ nhớ đệm trung gian', accent: '#A5F3FC', def: 'Dict lưu lại X, Z1, A1, Z2 — cần thiết cho bước backpropagation (Bài 13), không chỉ trả mỗi P cuối cùng.', ex: '{"X":X,"Z1":Z1,"A1":A1,"Z2":Z2}', out: '' },
          { term: 'Output contract', vi: 'Hợp đồng output', accent: '#22D3EE', def: 'Nhị phân → Sigmoid (1 xác suất). Đa lớp → Softmax. Hồi quy → thường Linear. Chọn sai activation output phá vỡ hợp đồng dù shape vẫn "đúng".', ex: 'P = sigmoid(Z2)', out: '' },
        ],
        primer: {
          goal: [
            'Bấm 2 tab — xem chain X→Z1→A1→Z2→P chạy trọn khi shape khớp, và dừng đúng tại bước vỡ khi shape lệch.',
            'Lắp forward_two_layer vectorized, chạy đúng trên batch/shape ẩn hoàn toàn khác, không hard-code.',
          ],
          intro: '<p>Một neural network chỉ là CHUỖI phép nhân ma trận xen kẽ activation: Z1=X@W1+b1, A1=f(Z1), Z2=A1@W2+b2, P=g(Z2). Điều kiện DUY NHẤT để mỗi phép nhân hợp lệ: số CỘT bên trái phải khớp số HÀNG bên phải. Sai 1 shape ở bất kỳ đâu — network vỡ ngay, hoặc tệ hơn: "tình cờ" chạy được nhưng cho ra SỐ SAI (như bias bị broadcast sai hướng, chỉ lộ ra khi test với batch khác kích cỡ).</p>',
          example: '',
        },
        intro: 'Forward pass chỉ là chuỗi nhân ma trận — nhưng sai 1 shape là vỡ, hoặc tệ hơn: sai âm thầm.',
        concept_cards: [
          { icon: 'fa-ruler-combined', title: 'Shape contract xuyên suốt mạng', body: 'Số cột lớp trước = số hàng lớp sau, ở MỌI phép nhân. X(m,3)@W1(3,4)=Z1(m,4). Sai 1 chỗ — cả chain vỡ hoặc sai âm thầm.' },
          { icon: 'fa-shapes', title: 'Hidden unit là toạ độ học được', body: 'A1 không có tên sẵn — không được ngầm định 1 hidden unit "là" 1 khái niệm con người (vd "độ nghiêm túc") nếu chưa có bằng chứng riêng.' },
          { icon: 'fa-plug', title: 'Output activation khớp đúng task', body: 'Nhị phân → Sigmoid. Đa lớp → Softmax. Hồi quy → Linear. Dùng sai activation output phá hợp đồng dù shape/code vẫn "chạy được".' },
        ],
        shape_chain_lens: {
          title: 'MA TRẬN CHỈ NHÂN ĐƯỢC KHI SỐ CỘT KHỚP SỐ HÀNG',
          intro: 'Bấm 2 tab — CÙNG X và W1, chỉ khác shape của W2.',
          sample: { x: [-0.0578, 0.5373, -0.6704], z1: [0.0004, -0.7895, 0.0936, 0.0873], a1: [0.0004, 0, 0.0936, 0.0873], z2: [0.0133], p: 0.5033 },
          shapes: { x: '(1,3)', w1: '(3,4)', z1: '(1,4)', w2: '(4,1)', z2: '(1,1)', p: '(1,)' },
          bad_w2_shape: '(5,1)',
          a1_cols: 4,
          bad_w2_rows: 5,
          riddle: {
            prompt: 'Vì sao A1(1,4) @ W2(5,1) KHÔNG thực hiện được, dù cả 2 đều là ma trận "hợp lệ"?',
            options: ['Số CỘT của A1 (4) phải khớp số HÀNG của W2 — ở đây 4≠5', 'Vì A1 có giá trị 0 (từ ReLU)', 'Vì batch size = 1 quá nhỏ'],
            answer: 'Số CỘT của A1 (4) phải khớp số HÀNG của W2 — ở đây 4≠5',
            wrong: {
              'Vì A1 có giá trị 0 (từ ReLU)': 'Sai — giá trị 0 trong A1 (dead-ReLU) hoàn toàn không liên quan đến việc nhân ma trận có hợp lệ hay không.',
              'Vì batch size = 1 quá nhỏ': 'Sai — batch size không ảnh hưởng điều kiện nhân ma trận; kể cả batch=100, nếu W2 vẫn shape (5,1) thì vẫn vỡ đúng tại bước này.',
            },
            done: '✅ Đúng — quy tắc nhân ma trận: (m,k)@(k,n) hợp lệ khi và chỉ khi k khớp CẢ HAI bên. A1 có 4 cột (ứng với 4 hidden unit), nên W2 PHẢI có 4 hàng — (5,1) sai vì được xây cho 5 hidden unit không tồn tại.',
          },
        },
        visual: {
          schema: {
            table_name: 'forward_pass_batch',
            columns: [
              { name: 'feat_1', type: 'FLOAT', key: '' },
              { name: 'feat_2', type: 'FLOAT', key: '' },
              { name: 'feat_3', type: 'FLOAT', key: '' },
            ],
          },
          data_preview: [
            ['-0.0578', '0.5373', '-0.6704'],
            ['0.2544', '-0.7158', '-0.4594'],
            ['-0.0313', '0.0533', '-1.4878'],
            ['1.5822', '1.0168', '-1.4221'],
            ['0.7700', '0.4302', '-0.5378'],
          ],
        },
        mission: 'Lắp forward_two_layer(X, params) vectorized, đúng shape contract xuyên suốt, chạy được cho batch bất kỳ.',
      },
      step_2: {
        mcq: [
          {
            question: 'X có shape (m,3), W1 có shape (3,4). Z1 = X@W1+b1 sẽ có shape gì?',
            options: [
              { id: 'a', text: '(m,4) — số hàng giữ nguyên theo batch (m), số cột đổi theo số cột của W1 (4)', correct: true, explanation: 'Đúng — quy tắc nhân ma trận (m,3)@(3,4) = (m,4); b1 shape (4,) broadcast tự nhiên vào mỗi hàng.' },
              { id: 'b', text: '(3,4) — giữ nguyên shape của W1', correct: false, explanation: 'Sai — kết quả nhân ma trận không giữ nguyên shape của 1 trong 2 toán hạng, mà kết hợp: (hàng của X, cột của W1).' },
              { id: 'c', text: '(m,3) — giữ nguyên shape của X', correct: false, explanation: 'Sai — số cột đổi thành số cột của W1 (4), không giữ nguyên số cột của X (3).' },
              { id: 'd', text: 'Không xác định được nếu chưa biết b1', correct: false, explanation: 'Sai — shape của Z1 chỉ phụ thuộc X và W1; b1 chỉ CỘNG vào (broadcast), không đổi shape.' },
            ],
          },
          {
            question: 'Hidden unit A1[:,0] (cột đầu tiên của hidden activation) có giá trị cao hơn ở các sample có nhãn "Đậu". Kết luận nào ĐÚNG?',
            options: [
              { id: 'a', text: 'Hidden unit là toạ độ HỌC ĐƯỢC — không được ngầm định nó "là" 1 khái niệm con người (vd "mức độ nghiêm túc") chỉ từ 1 quan sát tương quan, cần bằng chứng riêng và thận trọng', correct: true, explanation: 'Đúng nguyên văn misconception feedback của spec: đặt tên hidden unit theo khái niệm người cần bằng chứng RIÊNG, không tự động.' },
              { id: 'b', text: 'Chắc chắn A1[:,0] đại diện cho "mức độ nghiêm túc" của học viên', correct: false, explanation: 'Sai — đây chính là misconception: gán nhãn người cho 1 toạ độ học được mà không có bằng chứng riêng.' },
              { id: 'c', text: 'Hidden unit luôn vô nghĩa, không đáng phân tích', correct: false, explanation: 'Quá cực đoan — hidden representation VẪN đáng phân tích (vd qua probing/interpretability), chỉ là không được NGẦM ĐỊNH ý nghĩa mà thiếu bằng chứng.' },
              { id: 'd', text: 'Tương quan với nhãn chứng minh nhân quả rằng unit đó "đo" đúng khái niệm đó', correct: false, explanation: 'Sai — tương quan không chứng minh nhân quả, và cũng không xác định được ĐÓ LÀ khái niệm gì cụ thể.' },
            ],
          },
          {
            question: 'Code forward pass chạy ĐÚNG khi test với X có 1 sample, nhưng bias được cộng vào Z1 qua <code>b1.reshape(-1,1)</code>. Vấn đề tiềm ẩn ở đây là gì?',
            options: [
              { id: 'a', text: 'Việc "đúng" với 1 sample chỉ là TÌNH CỜ do shape broadcast trùng hợp — với batch nhiều sample hơn, hướng broadcast sai này sẽ vỡ hoặc cho ra giá trị hoàn toàn sai', correct: true, explanation: 'Đúng nguyên văn unsafe-but-correct case của spec: bias broadcast sai hướng, chỉ tình cờ đúng shape ở 1 sample.' },
              { id: 'b', text: 'Không có vấn đề gì vì code đã test và chạy đúng', correct: false, explanation: 'Sai — "chạy đúng với 1 test case nhỏ" không chứng minh code đúng cho MỌI batch size, đây chính là bẫy.' },
              { id: 'c', text: 'Vấn đề là reshape luôn là thao tác nguy hiểm, không nên dùng bao giờ', correct: false, explanation: 'Quá cực đoan — reshape(-1) ở CUỐI (cho P) là cần thiết và an toàn; vấn đề cụ thể là reshape SAI HƯỚNG áp lên bias.' },
              { id: 'd', text: 'Vấn đề nằm ở W1, không phải bias', correct: false, explanation: 'Sai — trong tình huống này, W1 không hề bị đổi; vấn đề nằm chính xác ở việc reshape bias sai hướng.' },
            ],
          },
        ],
        mini_game: {
          title: 'Thực hành nào giữ ĐÚNG kỷ luật khi lắp forward pass?',
          instruction: 'Xếp mỗi thực hành vào đúng nhóm.',
          chips: [
            { id: 'chip-shapecheck', label: 'Dùng assertion kiểm tra shape (vd A1.shape[0]==X.shape[0]) ngay trong hàm' },
            { id: 'chip-hiddenbatch', label: 'Test forward pass với batch/feature size KHÁC hẳn case mặc định trước khi tin code đúng' },
            { id: 'chip-namehidden', label: 'Gán tên khái niệm người (vd "độ chăm chỉ") cho 1 hidden unit chỉ vì nó tương quan với nhãn' },
            { id: 'chip-onesample', label: 'Chỉ test với đúng 1 sample rồi kết luận code đã đúng' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-shapecheck': 'dung', 'chip-hiddenbatch': 'dung', 'chip-namehidden': 'sai', 'chip-onesample': 'sai' },
          success_html: '✅ Kiểm shape bằng assertion, test với batch/shape khác hẳn — không gán ý nghĩa người cho hidden unit thiếu bằng chứng, không tin code đúng chỉ vì 1 sample chạy được.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Lắp đúng thứ tự affine→activation ở mỗi lớp, trả về (P, cache) shape-safe.',
        blocks: [
          { type: 'py', token: 'Z1 = X @ params["W1"] + params["b1"]', slot: 'z1a' },
          { type: 'py', token: 'A1 = relu(Z1)', slot: 'z1b' },
          { type: 'py', token: 'Z2 = A1 @ params["W2"] + params["b2"]', slot: 'z2a' },
          { type: 'py', token: 'P = sigmoid(Z2).reshape(-1)', slot: 'z2b' },
          { type: 'py', token: 'assert A1.shape[0] == X.shape[0]; assert P.shape == (X.shape[0],)', slot: 'z3a' },
          { type: 'py', token: 'return P, {"X": X, "Z1": Z1, "A1": A1, "Z2": Z2}', slot: 'z3b' },
          /* 2 mồi bẫy — đúng 2 misconception của spec: hard-code batch size / bias broadcast sai hướng */
          { type: 'py', token: 'P = sigmoid(Z2).reshape(5)', slot: 't1' },
          { type: 'py', token: 'Z1 = X @ params["W1"] + params["b1"].reshape(-1, 1)', slot: 't2' },
        ],
        drop_zones: [
          { id: 'ff-hidden', accepts: ['py'], multi: true },
          { id: 'ff-output', accepts: ['py'], multi: true },
          { id: 'ff-cache', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'ff-hidden': 'Z1 = X @ params["W1"] + params["b1"] A1 = relu(Z1)',
          'ff-output': 'Z2 = A1 @ params["W2"] + params["b2"] P = sigmoid(Z2).reshape(-1)',
          'ff-cache': 'assert A1.shape[0] == X.shape[0]; assert P.shape == (X.shape[0],) return P, {"X": X, "Z1": Z1, "A1": A1, "Z2": Z2}',
        },
        reveal_hints: {
          'ff-hidden': 'Lớp ẩn: <strong>Z1 = X@W1+b1</strong> rồi <strong>A1 = relu(Z1)</strong> — affine TRƯỚC, activation SAU.',
          'ff-output': 'Lớp output: <strong>Z2 = A1@W2+b2</strong> rồi <strong>P = sigmoid(Z2).reshape(-1)</strong> — reshape(-1) để P LUÔN đúng shape (m,) bất kể batch size.',
          'ff-cache': 'Assertion kiểm shape TRƯỚC khi return; <strong>cache</strong> phải giữ đủ X/Z1/A1/Z2 cho backpropagation (Bài 13).',
        },
        ml_flow: {
          brand: 'DÒNG CHẢY NETWORK SHAPE BUILDER',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: 'batch 5 mẫu × 3 feature thật · n_hidden=4' },
          done_note: 'Shape contract đúng xuyên suốt (n_in=3→hidden=4→output=1), activation khớp task nhị phân (ReLU ẩn + Sigmoid output), forward chạy thật cho ra 5 xác suất hợp lệ dù A1 có 55% giá trị chết. Click lại trạm bất kỳ để xem lại, rồi sang Bước 4 tự viết code.',
          stations: [
            {
              zones: ['ff-hidden'],
              icon: '📐', label: 'ĐẶT SHAPE', sub: 'batch/input/hidden/output', result_kind: 'network_shape_builder',
              nsb: { mode: 'shapes', shapes: { W1: '(3,4)', b1: '(4,)', W2: '(4,1)', b2: '(1,)' } },
              narration: 'n_in=3, n_hidden=4, n_out=1 → W1(3,4), b1(4,), W2(4,1), b2(1,) — số cột lớp trước LUÔN khớp số hàng lớp sau, tự động sinh ra từ 4 con số này.',
            },
            {
              zones: ['ff-output'],
              icon: '🎛️', label: 'CHỌN ACTIVATION', sub: 'ẩn + output', result_kind: 'network_shape_builder',
              nsb: { mode: 'activation', hidden: 'ReLU', output: 'Sigmoid', bad_output: 'Softmax (chỉ 1 unit)' },
              narration: 'ReLU cho lớp ẩn (chống vanishing gradient — Bài 11), Sigmoid cho output vì đây là bài toán NHỊ PHÂN (1 xác suất). Softmax trên 1 unit output là lựa chọn KHÔNG tương thích.',
            },
            {
              zones: ['ff-cache'],
              icon: '▶', label: 'CHẠY FORWARD THẬT', sub: 'batch 5 mẫu', result_kind: 'network_shape_builder',
              nsb: { mode: 'run', p: [0.5033, 0.5382, 0.5656, 0.3589, 0.4242], p_min: 0.3589435477512311, p_max: 0.565565152989178, dead_frac: 0.55 },
              narration: 'Chạy forward_two_layer thật trên 5 mẫu — 5 xác suất đều nằm gọn trong (0,1), dù A1 có 55% giá trị đúng bằng 0 (dead-ReLU thật, không giả lập).',
            },
          ],
        },
      },
      drag_map: {
        brand: 'DÒNG CHẢY NETWORK SHAPE BUILDER',
        table_sub: 'forward_pass_batch · 5 mẫu × 3 feature thật',
        idle_sub: 'Bấm ▶ để chạy pipeline',
        run_label: '▶ Chạy Pipeline',
        table: {
          name: 'forward_pass_batch',
          columns: ['feat_1', 'feat_2', 'feat_3'],
          dataRows: [
            ['-0.0578', '0.5373', '-0.6704'],
            ['0.2544', '-0.7158', '-0.4594'],
            ['-0.0313', '0.0533', '-1.4878'],
            ['1.5822', '1.0168', '-1.4221'],
            ['0.7700', '0.4302', '-0.5378'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Hoàn thiện <code>forward_two_layer(X, params)</code> — affine→ReLU ở lớp ẩn, affine→sigmoid ở output — trả về <code>(P, cache)</code> với <code>P</code> shape (m,) và <code>cache</code> đủ X/Z1/A1/Z2.</p>',
        context: {
          scenario: 'StudyLab cần 1 forward pass DÙNG LẠI được cho bất kỳ batch/kích thước mạng nào (không riêng batch 5 mẫu, n_hidden=4 đang thấy) — vì bước tiếp theo (backpropagation, Bài 13) cần cache đầy đủ, và hệ thống cần chạy đúng dù batch thực tế lớn nhỏ khác nhau.',
          real_world: 'Giống việc lắp 1 dây chuyền sản xuất: chỉ test với ĐÚNG 1 sản phẩm mẫu rồi kết luận "dây chuyền chạy tốt" là rủi ro — phải test với nhiều lô hàng kích cỡ khác nhau mới tin được là dây chuyền THẬT SỰ đúng quy trình.',
          steps: [
            'Tính <code>Z1 = X @ params["W1"] + params["b1"]</code> — affine lớp ẩn.',
            'Tính <code>A1 = relu(Z1)</code> — activation lớp ẩn.',
            'Tính <code>Z2 = A1 @ params["W2"] + params["b2"]</code> — affine lớp output.',
            'Tính <code>P = sigmoid(Z2).reshape(-1)</code> — LUÔN reshape(-1) để P đúng shape (m,) bất kể batch size.',
            'Assert shape rồi <code>return P, {"X": X, "Z1": Z1, "A1": A1, "Z2": Z2}</code>.',
          ],
          hint_explore: 'Muốn xem case thật? Gõ <code>X, params = load_forward_pass_case(); print(X.shape, params["W1"].shape)</code> rồi Run.',
          expected: 'P là mảng shape (m,), mỗi giá trị trong (0,1); cache là dict có đủ X/Z1/A1/Z2 khớp giá trị trung gian thật — đúng cho batch/shape bất kỳ, không hard-code.',
        },
        hints: [
          { level: 1, text: 'Nhập <code>import numpy as np</code>, <code>from ml_lab import load_forward_pass_case</code>. Viết <code>relu(z)</code> và <code>sigmoid(z)</code> trước (giống Bài 11).' },
          { level: 2, text: 'Trong <code>forward_two_layer(X, params)</code>: <code>Z1 = X @ params["W1"] + params["b1"]</code>, <code>A1 = relu(Z1)</code>.' },
          { level: 3, text: '<code>Z2 = A1 @ params["W2"] + params["b2"]</code>, <code>P = sigmoid(Z2).reshape(-1)</code> — KHÔNG reshape bằng số cố định, KHÔNG reshape thủ công lên b1/b2.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>from ml_lab import load_forward_pass_case<br>def relu(z):<br>&nbsp;&nbsp;&nbsp;&nbsp;return np.maximum(0.0, z)<br>def sigmoid(z):<br>&nbsp;&nbsp;&nbsp;&nbsp;return 1.0 / (1.0 + np.exp(-z))<br>def forward_two_layer(X, params):<br>&nbsp;&nbsp;&nbsp;&nbsp;Z1 = X @ params["W1"] + params["b1"]<br>&nbsp;&nbsp;&nbsp;&nbsp;A1 = relu(Z1)<br>&nbsp;&nbsp;&nbsp;&nbsp;Z2 = A1 @ params["W2"] + params["b2"]<br>&nbsp;&nbsp;&nbsp;&nbsp;P = sigmoid(Z2).reshape(-1)<br>&nbsp;&nbsp;&nbsp;&nbsp;assert A1.shape[0] == X.shape[0]<br>&nbsp;&nbsp;&nbsp;&nbsp;assert P.shape == (X.shape[0],)<br>&nbsp;&nbsp;&nbsp;&nbsp;return P, {"X": X, "Z1": Z1, "A1": A1, "Z2": Z2}<br>X, params = load_forward_pass_case()<br>print(forward_two_layer(X, params)[0])</code>' },
        ],
        grader_fn: 'grade_lesson_c3_12',
        success_message: 'Bạn vừa lắp forward pass 2 lớp shape-safe, chạy đúng cho batch/kích thước mạng bất kỳ — không hard-code, không tin vào 1 test case nhỏ. Module 4 HOÀN TẤT — sẵn sàng cho Backpropagation!',
        xp_reward: 65,
        starter_hint: '💡 Bắt đầu bằng: import numpy as np',
      },
    },

    // ╔══════════════════════════════════════════════════════════╗
    // ║  M5 — BACKPROPAGATION & EXPERIMENT DEFENSE                ║
    // ╚══════════════════════════════════════════════════════════╝
    {
      id: 'c3_l13',
      index: 13,
      title: 'Backpropagation và gradient checking',
      subtitle: 'Chain rule, giá trị cache, gradient tham số và bằng chứng debug',
      module: 5,
      module_title: 'M5 · Backpropagation & Experiment Defense',
      estimated_minutes: 27,
      xp_reward: 70,
      achievement: { name: 'Neural Experiment Designer', desc: 'Lắp backward pass 2 lớp đúng chain rule và tự kiểm chứng bằng gradient checking thật.' },
      story: {
        tag: '🧬 StudyLab · Advanced Modeling Lab',
        hook: 'Mở màn Module 5: forward pass đã xong (Bài 12), giờ đến phần khó nhất — dạy mạng SỬA CHÍNH NÓ. Một bạn đồng nghiệp báo tin vui: "loss giảm đều mỗi epoch, chắc backward pass của em đúng rồi!" Nhưng khi bạn soi code, dW1 của bạn ấy bị tính SAI HƯỚNG — chỉ tình cờ không vỡ vì shape vẫn "khớp" nhờ broadcasting, và loss vẫn giảm vì phần lớn gradient (dW2, db2, db1) vẫn đúng. Bài này bạn tự tay lắp backward pass ĐÚNG chain rule, và học cách KHÔNG BAO GIỜ tin "loss giảm" là bằng chứng đủ — phải gradient-check bằng số.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Truy vết độ nhạy của loss NGƯỢC qua output rồi hidden layer, dùng lại cache và đạo hàm cục bộ (chain rule).',
            'Giữ shape gradient (dW/db) LUÔN khớp shape tham số tương ứng, average batch nhất quán (chia cho m đúng 1 lần).',
            'Kiểm chứng gradient bằng finite-difference (gradient checking) trước khi tin bất kỳ hành vi training nào.',
          ],
        },
        glossary: [
          { term: 'Reverse dependency', vi: 'Phụ thuộc ngược', accent: '#22D3EE', def: 'Backprop truy vết loss → output → hidden → tham số theo chiều NGƯỢC với forward pass (input → hidden → output).', ex: 'loss→dZ2→dA1→dZ1→dW1', out: '' },
          { term: 'Local chain rule', vi: 'Chain rule cục bộ', accent: '#67E8F9', def: 'Mỗi bước NHÂN đạo hàm "upstream" (từ phía sau truyền tới) với đạo hàm cục bộ (của riêng phép tính đó) — không tính lại đạo hàm toàn cục từ đầu.', ex: 'dZ1 = dA1 · (Z1>0)', out: '' },
          { term: 'Shape-safe gradient', vi: 'Gradient đúng shape', accent: '#0891B2', def: 'dW PHẢI cùng shape với W, db PHẢI cùng shape với b — đây là cách kiểm tra nhanh nhất phát hiện lỗi chain rule.', ex: 'dW1.shape == W1.shape', out: '' },
          { term: 'Batch averaging', vi: 'Trung bình theo batch', accent: '#67E8F9', def: 'Chia cho m (batch size) đúng 1 LẦN DUY NHẤT — thường ở dZ2 — rồi dùng .sum() nhất quán ở các bước sau, KHÔNG .mean() thêm lần nữa.', ex: 'dZ2 = (P-y)/m', out: '' },
          { term: 'Gradient checking', vi: 'Kiểm chứng gradient', accent: '#A5F3FC', def: 'So gradient GIẢI TÍCH (analytical, từ backprop) với gradient SỐ (finite-difference, nhiễu ±epsilon rồi đo loss) — relative error nhỏ TĂNG độ tin cậy nhưng KHÔNG chứng minh toàn bộ code đúng.', ex: '|num−ana|/max(|num|,|ana|)', out: '' },
          { term: 'Update-during-backward (misconception)', vi: 'Update lẫn trong backward (ngộ nhận)', accent: '#22D3EE', def: 'Backprop CHỈ tính gradient. Optimizer mới là bên UPDATE tham số, và làm việc đó SAU khi có đủ gradient — trộn 2 giai đoạn gây lỗi khó debug.', ex: 'params["W2"] -= ... KHÔNG thuộc backward_two_layer', out: '' },
        ],
        primer: {
          goal: [
            'Bấm 2 tab — xem cache đóng băng ở FORWARD, rồi tín hiệu lỗi chảy NGƯỢC và tách ra ở BACKWARD.',
            'Lắp backward_two_layer đúng chain rule, rồi TỰ chạy gradient_check thật để kiểm chứng bằng số.',
          ],
          intro: '<p>Forward pass tính ra 1 con số (loss). Backprop trả lời câu hỏi ngược: "mỗi tham số phải thay đổi BAO NHIÊU để loss giảm?" — bằng cách truyền 1 tín hiệu lỗi NGƯỢC từ output về input, nhân dần với đạo hàm cục bộ ở mỗi bước (chain rule), và TÁCH tín hiệu đó ra cho từng W/b riêng. Nhưng code "chạy được, loss giảm" không phải bằng chứng gradient ĐÚNG — chỉ có finite-difference gradient checking mới xác nhận bằng SỐ.</p>',
          example: '',
        },
        intro: 'Tín hiệu lỗi chảy ngược, tách ra cho từng trọng số — và chỉ số mới chứng minh được nó đúng.',
        concept_cards: [
          { icon: 'fa-route', title: 'Tín hiệu lỗi chảy NGƯỢC', body: 'loss→dZ2→(dW2,db2) VÀ →dA1→dZ1→(dW1,db1) — mỗi bước nhân đạo hàm upstream với đạo hàm cục bộ, dùng lại cache của forward pass.' },
          { icon: 'fa-object-ungroup', title: 'Backprop tính gradient, optimizer mới update', body: 'Backward_two_layer CHỈ trả về gradient. Update tham số (params -= lr*grad) là việc CỦA OPTIMIZER, làm SAU — trộn 2 giai đoạn gây lỗi khó debug.' },
          { icon: 'fa-magnifying-glass-chart', title: 'Loss giảm KHÔNG phải bằng chứng đủ', body: 'Gradient sai vẫn có thể làm loss giảm (nếu phần lớn gradient khác vẫn đúng). Chỉ gradient checking (finite-difference) mới xác nhận được bằng SỐ.' },
        ],
        backprop_lens: {
          title: 'TÍN HIỆU LỖI ĐI NGƯỢC VÀ TÁCH RA CHO TỪNG TRỌNG SỐ',
          intro: 'Bấm 2 tab — CÙNG 1 batch, xem cache đóng băng rồi tín hiệu lỗi chảy ngược thật.',
          forward: { z1: '(5,4)', a1: '(5,4)', z2: '(5,1)', p: '(5,)' },
          backward: { dz2_shape: '(5,1)', dw2_shape: '(4,1)', db2_shape: '(1,)', db2_val: '0.0897', da1_shape: '(5,4)', dz1_shape: '(5,4)', dw1_shape: '(3,4)', dw1_val: '0.0070', db1_shape: '(4,)' },
          riddle: {
            prompt: 'Vì sao dZ1 = dA1 · (Z1 > 0) chứ không phải dZ1 = dA1 đơn thuần?',
            options: ['Vì ReLU_grad(Z1) = (Z1>0) — chain rule cần NHÂN với đạo hàm cục bộ của ReLU tại đúng Z1 đã cache', 'Vì Z1 luôn dương nên phép nhân không đổi gì', 'Vì dA1 đã đúng shape sẵn, không cần nhân thêm'],
            answer: 'Vì ReLU_grad(Z1) = (Z1>0) — chain rule cần NHÂN với đạo hàm cục bộ của ReLU tại đúng Z1 đã cache',
            wrong: {
              'Vì Z1 luôn dương nên phép nhân không đổi gì': 'Sai — Z1 hoàn toàn có thể âm (đó là lý do A1 có nhiều giá trị 0 ở Bài 12), (Z1>0) THỰC SỰ chặn gradient ở những vị trí Z1≤0.',
              'Vì dA1 đã đúng shape sẵn, không cần nhân thêm': 'Sai — shape đúng không có nghĩa GIÁ TRỊ đúng; thiếu bước nhân (Z1>0) sẽ cho gradient chảy qua cả những unit đã "chết" ở ReLU — sai về mặt toán học.',
            },
            done: '✅ Đúng — đây chính là chain rule: dZ1 = dA1 (đạo hàm upstream) NHÂN với ReLU_grad(Z1) = (Z1>0) (đạo hàm cục bộ, dùng lại cache Z1 từ forward pass) — ReLU "chết" ở đâu thì gradient cũng dừng ở đó.',
          },
        },
        visual: {
          schema: {
            table_name: 'backprop_batch',
            columns: [
              { name: 'y', type: 'INT', key: '' },
              { name: 'probabilities', type: 'FLOAT', key: '' },
            ],
          },
          data_preview: [
            ['0', '0.4747'],
            ['1', '0.4444'],
            ['0', '0.4768'],
            ['1', '0.5756'],
            ['0', '0.4769'],
          ],
        },
        mission: 'Lắp backward_two_layer đúng chain rule ngược, rồi tự gradient_check để kiểm chứng bằng số.',
      },
      step_2: {
        mcq: [
          {
            question: 'Vì sao KHÔNG được update W2 (vd params["W2"] -= lr*dW2) TRƯỚC khi tính xong dA1 và dW1?',
            options: [
              { id: 'a', text: 'dA1 = dZ2 @ W2.T cần dùng W2 CỦA FORWARD PASS (giá trị đã cache) — update W2 trước sẽ khiến dA1/dW1 tính bằng W2 SAI (đã bị đổi), gradient toàn bộ lớp ẩn sẽ sai', correct: true, explanation: 'Đúng — đây chính là lý do backprop phải tính XONG mọi gradient trước khi optimizer update bất kỳ tham số nào.' },
              { id: 'b', text: 'Không có vấn đề gì, thứ tự update không ảnh hưởng kết quả', correct: false, explanation: 'Sai — dA1 phụ thuộc trực tiếp vào giá trị W2 tại thời điểm tính; đổi W2 trước sẽ làm sai toàn bộ gradient lớp ẩn.' },
              { id: 'c', text: 'Chỉ là vấn đề tốc độ, không ảnh hưởng tính đúng đắn', correct: false, explanation: 'Sai — đây là lỗi ĐÚNG/SAI về mặt toán học (dùng nhầm giá trị W2), không phải vấn đề hiệu năng.' },
              { id: 'd', text: 'Vì W2 phải được update cuối cùng trong MỌI trường hợp, kể cả sau db1', correct: false, explanation: 'Không chính xác — vấn đề không phải "thứ tự update giữa các tham số", mà là KHÔNG được update BẤT KỲ tham số nào cho tới khi mọi gradient đã tính xong.' },
            ],
          },
          {
            question: 'Gradient checking (finite-difference) so sánh CÁI GÌ với CÁI GÌ?',
            options: [
              { id: 'a', text: 'Gradient GIẢI TÍCH (analytical, từ backprop/chain rule) với gradient SỐ (numerical, nhiễu ±epsilon rồi đo thay đổi loss)', correct: true, explanation: 'Đúng — đây là định nghĩa chuẩn của gradient checking.' },
              { id: 'b', text: 'Loss trước và sau khi train', correct: false, explanation: 'Sai — đó là theo dõi quá trình training, không phải gradient checking.' },
              { id: 'c', text: 'Gradient của 2 lớp khác nhau trong cùng 1 mạng', correct: false, explanation: 'Sai — gradient checking so 2 CÁCH TÍNH khác nhau của CÙNG 1 gradient (giải tích vs số), không so 2 lớp khác nhau.' },
              { id: 'd', text: 'Kết quả dự đoán trước và sau khi thêm 1 lớp mới', correct: false, explanation: 'Sai — đó là so sánh kiến trúc, không liên quan đến việc kiểm chứng gradient.' },
            ],
          },
          {
            question: 'Loss giảm đều mỗi epoch trên tập train — dù dW1 bị tính SAI HƯỚNG (broadcasting "che" mất lỗi shape). Vì sao loss vẫn giảm được?',
            options: [
              { id: 'a', text: 'dW2, db2, db1 (phần lớn gradient) vẫn đúng nên vẫn kéo loss xuống được phần nào — loss giảm KHÔNG chứng minh MỌI gradient đúng, chỉ gradient checking bằng số mới xác nhận được', correct: true, explanation: 'Đúng nguyên văn unsafe-but-correct case của spec: loss giảm trên dữ liệu thấy được dù dW1 sai, "apparent success is not trustworthy" nếu thiếu gradient check.' },
              { id: 'b', text: 'Không thể xảy ra — nếu 1 gradient sai thì loss chắc chắn phải tăng', correct: false, explanation: 'Sai — với nhiều tham số, 1 gradient sai không nhất thiết làm loss tăng NGAY, đặc biệt nếu các gradient khác vẫn kéo đúng hướng.' },
              { id: 'c', text: 'Vì learning_rate đủ nhỏ nên lỗi không ảnh hưởng gì', correct: false, explanation: 'Sai — learning_rate nhỏ chỉ làm lỗi ảnh hưởng CHẬM hơn, không loại bỏ được lỗi trong công thức gradient.' },
              { id: 'd', text: 'Vì dW1 sai hướng vẫn TÌNH CỜ là gradient đúng', correct: false, explanation: 'Sai — dW1 sai hướng nghĩa là SAI giá trị, không phải "tình cờ đúng"; chỉ là lỗi này không đủ để chặn toàn bộ quá trình giảm loss.' },
            ],
          },
        ],
        mini_game: {
          title: 'Thực hành nào giữ ĐÚNG kỷ luật khi lắp và kiểm chứng backprop?',
          instruction: 'Xếp mỗi thực hành vào đúng nhóm.',
          chips: [
            { id: 'chip-allgrad', label: 'Tính TOÀN BỘ gradient trước, để optimizer update tham số SAU đó' },
            { id: 'chip-gradcheck', label: 'Chạy gradient_check (finite-difference) trước khi tin gradient giải tích' },
            { id: 'chip-updateinbackward', label: 'Update W2 ngay trong lúc đang tính dA1/dW1 để "tiết kiệm thời gian"' },
            { id: 'chip-trustloss', label: 'Kết luận gradient chắc chắn đúng chỉ vì loss giảm trên tập train nhìn thấy được' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-allgrad': 'dung', 'chip-gradcheck': 'dung', 'chip-updateinbackward': 'sai', 'chip-trustloss': 'sai' },
          success_html: '✅ Tính đủ gradient trước khi update, luôn gradient-check bằng finite-difference — không trộn update vào backward, không tin "loss giảm" là bằng chứng đủ.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'Nối đúng chain rule ngược: dZ2 → (dW2,db2) và dA1→dZ1 → (dW1,db1), rồi kiểm chứng bằng gradient_check thật.',
        blocks: [
          { type: 'py', token: 'dZ2 = (probabilities - y).reshape(-1, 1) / m', slot: 'z1a' },
          { type: 'py', token: 'dW2 = cache["A1"].T @ dZ2; db2 = dZ2.sum(axis=0)', slot: 'z1b' },
          { type: 'py', token: 'dA1 = dZ2 @ params["W2"].T; dZ1 = dA1 * (cache["Z1"] > 0)', slot: 'z2a' },
          { type: 'py', token: 'dW1 = cache["X"].T @ dZ1; db1 = dZ1.sum(axis=0)', slot: 'z2b' },
          { type: 'py', token: 'return {"W1": dW1, "b1": db1, "W2": dW2, "b2": db2}', slot: 'z3a' },
          { type: 'py', token: 'print(gradient_check(params, grads, y, cache["X"]))', slot: 'z3b' },
          /* 2 mồi bẫy — đúng 2 misconception của spec: update lẫn trong backward / trộn reduction */
          { type: 'py', token: 'params["W2"] -= 0.1 * dW2', slot: 't1' },
          { type: 'py', token: 'db1 = dZ1.mean(axis=0)', slot: 't2' },
        ],
        drop_zones: [
          { id: 'bp-output', accepts: ['py'], multi: true },
          { id: 'bp-hidden', accepts: ['py'], multi: true },
          { id: 'bp-check', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'bp-output': 'dZ2 = (probabilities - y).reshape(-1, 1) / m dW2 = cache["A1"].T @ dZ2; db2 = dZ2.sum(axis=0)',
          'bp-hidden': 'dA1 = dZ2 @ params["W2"].T; dZ1 = dA1 * (cache["Z1"] > 0) dW1 = cache["X"].T @ dZ1; db1 = dZ1.sum(axis=0)',
          'bp-check': 'return {"W1": dW1, "b1": db1, "W2": dW2, "b2": db2} print(gradient_check(params, grads, y, cache["X"]))',
        },
        reveal_hints: {
          'bp-output': 'Xuất phát điểm: <strong>dZ2 = (P−y)/m</strong> — chia cho m ĐÚNG 1 LẦN ở đây. Từ đó suy <strong>dW2</strong>, <strong>db2</strong>.',
          'bp-hidden': 'Lan về lớp ẩn: <strong>dA1 = dZ2@W2ᵀ</strong>, rồi <strong>dZ1 = dA1·(Z1&gt;0)</strong> (ReLU mask) — từ đó suy <strong>dW1</strong>, <strong>db1</strong>.',
          'bp-check': '<strong>return</strong> đủ 4 gradient thành dict, rồi gọi <strong>gradient_check</strong> THẬT để kiểm chứng bằng finite-difference.',
        },
        ml_flow: {
          brand: 'DÒNG CHẢY GRADIENT GRAPH BUILDER',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: 'batch 5 mẫu thật · cache từ forward pass Bài 12' },
          done_note: 'Chain rule ngược đúng thứ tự (output trước, hidden sau), gradient_check thật cho relative error ~1e-9 trên cả 4 tham số — bằng chứng SỐ, không chỉ "loss giảm". Click lại trạm bất kỳ để xem lại, rồi sang Bước 4 tự viết code.',
          stations: [
            {
              zones: ['bp-output'],
              icon: '1️⃣', label: 'NỐI ĐẠO HÀM OUTPUT', sub: 'dZ2 = (P−y)/m', result_kind: 'gradient_graph_builder',
              gg: { mode: 'output', dz2_shape: '(5,1)', db2_val: 0.08967177 },
              narration: 'dZ2 là điểm xuất phát của MỌI gradient — (P−y)/m, chia cho m đúng 1 lần. Từ đó suy dW2 = A1ᵀ@dZ2 và db2 = dZ2.sum(axis=0) ≈ 0.0897.',
            },
            {
              zones: ['bp-hidden'],
              icon: '2️⃣', label: 'LAN VỀ LỚP ẨN', sub: 'dA1 → dZ1 (ReLU mask)', result_kind: 'gradient_graph_builder',
              gg: { mode: 'hidden', da1_shape: '(5,4)', dz1_shape: '(5,4)', dw1_shape: '(3,4)' },
              narration: 'dA1 = dZ2@W2ᵀ tiếp tục lan ngược, rồi dZ1 = dA1·(Z1>0) — ReLU mask CHỈ cho gradient qua những unit đã "sống" ở forward pass, dùng lại đúng cache Z1.',
            },
            {
              zones: ['bp-check'],
              icon: '3️⃣', label: 'GRADIENT CHECK THẬT', sub: 'finite-difference', result_kind: 'gradient_graph_builder',
              gg: { mode: 'check', rel_errors: { W1: 9.03158405114199e-10, b1: 1.3122335185535133e-09, W2: 3.5183763408625396e-11, b2: 8.382934944272012e-11 }, max_rel: 1.3122335185535133e-9 },
              narration: 'gradient_check thật (nhiễu ±epsilon, đo lại loss) cho relative error lớn nhất ≈1.3×10⁻⁹ trên cả 4 tham số — đây mới là BẰNG CHỨNG SỐ, không phải suy đoán từ "loss giảm".',
            },
          ],
        },
      },
      drag_map: {
        brand: 'DÒNG CHẢY GRADIENT GRAPH BUILDER',
        table_sub: 'backprop_batch · 5 mẫu thật (nhãn y + xác suất dự đoán)',
        idle_sub: 'Bấm ▶ để chạy pipeline',
        run_label: '▶ Chạy Pipeline',
        table: {
          name: 'backprop_batch',
          columns: ['y', 'probabilities'],
          dataRows: [
            ['0', '0.4747'],
            ['1', '0.4444'],
            ['0', '0.4768'],
            ['1', '0.5756'],
            ['0', '0.4769'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Viết <code>backward_two_layer(y, probabilities, params, cache)</code> — chain rule ngược đúng thứ tự, trả về dict gradient <code>{"W1","b1","W2","b2"}</code>, rồi tự gọi <code>gradient_check</code> để kiểm chứng.</p>',
        context: {
          scenario: 'StudyLab cần backward pass ĐÁNG TIN CẬY — không chỉ "chạy được, loss giảm", mà phải có BẰNG CHỨNG SỐ (gradient checking) trước khi dùng để train thật. Đây là bước cuối trước khi ghép thành vòng lặp training hoàn chỉnh (Bài 14).',
          real_world: 'Giống việc kiểm toán sổ sách bằng 2 PHƯƠNG PHÁP ĐỘC LẬP (sổ kế toán vs kiểm kê thực tế) — nếu 2 phương pháp khớp nhau, độ tin cậy tăng rất nhiều; nếu chỉ tin 1 phương pháp vì "nhìn có vẻ đúng", sai sót có thể ẩn rất lâu.',
          steps: [
            'Tính <code>m = len(y)</code> và <code>dZ2 = (probabilities - y).reshape(-1, 1) / m</code> — chia cho m ĐÚNG 1 lần.',
            'Suy ra <code>dW2 = cache["A1"].T @ dZ2</code> và <code>db2 = dZ2.sum(axis=0)</code>.',
            'Lan ngược: <code>dA1 = dZ2 @ params["W2"].T</code>, rồi <code>dZ1 = dA1 * (cache["Z1"] > 0)</code> (ReLU mask).',
            'Suy ra <code>dW1 = cache["X"].T @ dZ1</code> và <code>db1 = dZ1.sum(axis=0)</code>.',
            'Return dict đủ 4 key, rồi gọi <code>gradient_check(params, grads, y, cache["X"])</code> để kiểm chứng.',
          ],
          hint_explore: 'Muốn xem cache thật? Gõ <code>y, P, params, cache = load_backprop_case(); print(cache.keys())</code> rồi Run.',
          expected: 'grads là dict 4 key (W1/b1/W2/b2), mỗi gradient đúng shape tham số tương ứng; gradient_check trả relative error RẤT NHỎ (~1e-9) cho cả 4 tham số, kể cả trên case ẩn.',
        },
        hints: [
          { level: 1, text: 'Nhập <code>import numpy as np</code>, <code>from ml_lab import load_backprop_case, gradient_check</code>. Định nghĩa <code>def backward_two_layer(y, probabilities, params, cache):</code>.' },
          { level: 2, text: '<code>m = len(y)</code>; <code>dZ2 = (probabilities - y).reshape(-1, 1) / m</code>; <code>dW2 = cache["A1"].T @ dZ2</code>; <code>db2 = dZ2.sum(axis=0)</code>.' },
          { level: 3, text: '<code>dA1 = dZ2 @ params["W2"].T</code>; <code>dZ1 = dA1 * (cache["Z1"] > 0)</code>; <code>dW1 = cache["X"].T @ dZ1</code>; <code>db1 = dZ1.sum(axis=0)</code>. KHÔNG update params ở đây, KHÔNG dùng .mean() thêm.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>from ml_lab import load_backprop_case, gradient_check<br>def backward_two_layer(y, probabilities, params, cache):<br>&nbsp;&nbsp;&nbsp;&nbsp;m = len(y)<br>&nbsp;&nbsp;&nbsp;&nbsp;dZ2 = (probabilities - y).reshape(-1, 1) / m<br>&nbsp;&nbsp;&nbsp;&nbsp;dW2 = cache["A1"].T @ dZ2<br>&nbsp;&nbsp;&nbsp;&nbsp;db2 = dZ2.sum(axis=0)<br>&nbsp;&nbsp;&nbsp;&nbsp;dA1 = dZ2 @ params["W2"].T<br>&nbsp;&nbsp;&nbsp;&nbsp;dZ1 = dA1 * (cache["Z1"] > 0)<br>&nbsp;&nbsp;&nbsp;&nbsp;dW1 = cache["X"].T @ dZ1<br>&nbsp;&nbsp;&nbsp;&nbsp;db1 = dZ1.sum(axis=0)<br>&nbsp;&nbsp;&nbsp;&nbsp;return {"W1": dW1, "b1": db1, "W2": dW2, "b2": db2}<br>y, probabilities, params, cache = load_backprop_case()<br>grads = backward_two_layer(y, probabilities, params, cache)<br>print({k: v.shape for k, v in grads.items()})<br>print(gradient_check(params, grads, y, cache["X"]))</code>' },
        ],
        grader_fn: 'grade_lesson_c3_13',
        success_message: 'Bạn vừa lắp backward pass 2 lớp đúng chain rule, và tự kiểm chứng bằng gradient_check thật (relative error ~1e-9) — không chỉ tin "loss giảm". Sẵn sàng cho thí nghiệm huấn luyện hoàn chỉnh ở Bài 14!',
        xp_reward: 70,
        starter_hint: '💡 Bắt đầu bằng: import numpy as np',
      },
    },

    {
      id: 'c3_l14',
      index: 14,
      title: 'Train, đánh giá và bảo vệ 1 thí nghiệm neural network',
      subtitle: 'PyTorch CPU, learning curve, early stopping, tái lập và chẩn đoán thất bại',
      module: 5,
      module_title: 'M5 · Backpropagation & Experiment Defense',
      estimated_minutes: 30,
      xp_reward: 80,
      achievement: { name: 'Neural Experiment Designer', desc: 'Train, chẩn đoán và bảo vệ 1 thí nghiệm neural network dưới ràng buộc tài nguyên và quy trình đánh giá.' },
      story: {
        tag: '🧬 StudyLab · Advanced Modeling Lab',
        hook: 'Bài cuối cùng: bạn đã lắp được từng mảnh — neuron, activation, forward, backward. Giờ ghép lại thành 1 THÍ NGHIỆM thật: train 3 kiến trúc MLP nhị phân bằng PyTorch thật (StudyLab đã chạy offline, số liệu là số THẬT), quan sát 1 kiến trúc quá nhỏ "đuối sức", 1 kiến trúc quá lớn "học thuộc lòng" nếu không có early stopping, và 1 kiến trúc "vừa đủ" được validation checkpoint cứu đúng lúc. Một bạn đồng nghiệp thử nhiều kiến trúc, mỗi lần đo lại TEST F1, rồi chọn kiến trúc có test cao nhất — và không nhận ra mình vừa biến test set thành 1 phòng thí nghiệm để "đấu giá", phá vỡ tính độc lập của nó. Bài này bạn tự tay lắp lại đúng quy trình chọn checkpoint và báo cáo — validation quyết định, test chỉ mở ĐÚNG 1 LẦN.',
      },
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Phân biệt tín hiệu chọn model AN TOÀN (validation checkpoint) với tín hiệu KHÔNG an toàn (train loss thấp nhất, hay tệ hơn — test cao nhất).',
            'Chẩn đoán underfit (cả 2 đường cong cùng cao), overfit (train xuống, val bật ngược) và bất ổn trong training.',
            'Áp early stopping dựa trên bằng chứng validation, và tạo 1 "thẻ thí nghiệm" (experiment card) báo cáo đúng bằng chứng, rủi ro và giới hạn.',
          ],
        },
        glossary: [
          { term: 'Train/eval mode', vi: 'Chế độ train/eval', accent: '#22D3EE', def: 'model.train() bật các cơ chế chỉ dùng khi HUẤN LUYỆN (vd dropout); model.eval() tắt chúng đi khi ĐÁNH GIÁ. Quên gọi eval() trước validation là 1 lớp lỗi rất phổ biến.', ex: 'model.eval() trước val_loader', out: '' },
          { term: 'Validation checkpoint', vi: 'Checkpoint theo validation', accent: '#67E8F9', def: 'Chỉ LƯU LẠI trạng thái model khi validation loss cải thiện — đây là tín hiệu AN TOÀN duy nhất để chọn model, KHÔNG phải train loss thấp nhất.', ex: 'if val_loss < best_val: lưu checkpoint', out: '' },
          { term: 'Early stopping / patience', vi: 'Dừng sớm / kiên nhẫn', accent: '#0891B2', def: 'Dừng training sau N epoch LIÊN TIẾP không cải thiện validation (patience=N) — tránh train quá lâu vào vùng overfit.', ex: 'patience=8', out: '' },
          { term: 'Independent test set', vi: 'Tập test độc lập', accent: '#67E8F9', def: 'Chỉ được ĐÁNH GIÁ ĐÚNG 1 LẦN, SAU KHI đã chốt model bằng validation — dùng test để CHỌN kiến trúc phá vỡ tính độc lập của nó.', ex: 'test evaluated ONCE, after selection', out: '' },
          { term: 'Reproducibility (seed)', vi: 'Tái lập được (seed)', accent: '#A5F3FC', def: 'torch.manual_seed cố định để kết quả tái lập được giữa các lần chạy — thiếu seed khiến không ai (kể cả chính bạn) verify lại được kết quả.', ex: 'torch.manual_seed(42)', out: '' },
          { term: 'Dropout / weight decay / Adam / Softmax', vi: 'Regularization & optimizer (khái niệm bắt buộc)', accent: '#22D3EE', def: 'Concept BẮT BUỘC ở mức nhận diện: dropout/weight decay chống overfit, Adam là optimizer thích ứng, Softmax cho output đa lớp. Kiến trúc đầy đủ CNN/RNN/Transformer thuộc lộ trình học KHÁC, ngoài phạm vi khoá này.', ex: 'weight_decay=1e-4', out: '' },
        ],
        primer: {
          goal: [
            'Bấm 2 tab — xem train loss "trông như thắng lợi" một mình, rồi thấy val loss bật ngược sau khi vault đã khoá đúng epoch.',
            'Lắp lại đúng thuật toán chọn checkpoint (early stopping) và tính metric, trên số liệu THẬT từ 1 lần train PyTorch thật.',
          ],
          intro: '<p>Train 1 mạng neural không khó — khó là biết KHI NÀO dừng và TIN vào đâu. Train loss gần như luôn giảm nếu bạn train đủ lâu — kể cả khi model đang "học thuộc lòng" dữ liệu train thay vì học được QUY LUẬT tổng quát. Validation loss mới là tín hiệu trung thực: nó bắt đầu XẤU ĐI khi model bắt đầu overfit. Và test set — chỉ được nhìn ĐÚNG 1 LẦN, sau khi mọi quyết định đã chốt — nếu không, nó không còn là "test" nữa, mà là 1 vòng tuning trá hình.</p>',
          example: '',
        },
        intro: 'Loss train thấp không phải vạch đích — validation mới là trọng tài, test chỉ được hỏi đúng 1 câu.',
        concept_cards: [
          { icon: 'fa-vault', title: 'Loss train thấp không phải vạch đích', body: 'Vault checkpoint chỉ lưu khi VALIDATION cải thiện — train loss vẫn có thể giảm mãi ngay cả khi model đang overfit, đừng tin nó làm tín hiệu chọn model.' },
          { icon: 'fa-lock', title: 'Test chỉ mở ĐÚNG 1 LẦN', body: 'Thử nhiều kiến trúc rồi chọn theo test cao nhất phá vỡ tính độc lập của test — dù mạng vẫn train đúng, thí nghiệm không còn đáng tin.' },
          { icon: 'fa-list-check', title: 'Dropout/weight decay/Adam/Softmax — khái niệm bắt buộc', body: 'Cần NHẬN DIỆN được các khái niệm này (chống overfit, optimizer thích ứng, output đa lớp) — nhưng CNN/RNN/Transformer đầy đủ thuộc lộ trình khác, không phải bài này.' },
        ],
        vault_lens: {
          title: 'LOSS TRAIN THẤP KHÔNG PHẢI VẠCH ĐÍCH',
          intro: 'Bấm 2 tab — CÙNG 1 lần train PyTorch thật (256 hidden unit, không early-stop, 60 epoch).',
          train_curve: [
            0.6386, 0.4801, 0.4154, 0.3835, 0.3573, 0.3412, 0.3304, 0.3161, 0.303, 0.2919,
            0.2878, 0.2715, 0.2669, 0.2543, 0.2487, 0.2376, 0.2295, 0.2241, 0.2172, 0.2094,
            0.2064, 0.1958, 0.1897, 0.1848, 0.1793, 0.1737, 0.1697, 0.1643, 0.1607, 0.1558,
            0.1521, 0.1478, 0.146, 0.1416, 0.1372, 0.1325, 0.1314, 0.1268, 0.1239, 0.1199,
            0.1187, 0.1158, 0.1122, 0.1109, 0.1082, 0.1038, 0.1025, 0.1, 0.0982, 0.0963,
            0.0931, 0.0928, 0.0885, 0.0887, 0.0859, 0.0845, 0.0831, 0.081, 0.0779, 0.0783,
          ],
          val_curve: [
            0.5546, 0.4776, 0.4167, 0.3866, 0.3651, 0.3569, 0.3523, 0.3512, 0.3489, 0.3488,
            0.351, 0.3494, 0.3568, 0.3591, 0.3659, 0.3638, 0.3659, 0.3709, 0.3736, 0.378,
            0.3881, 0.3895, 0.3915, 0.3967, 0.4027, 0.4025, 0.4067, 0.4082, 0.416, 0.4218,
            0.4201, 0.4227, 0.4239, 0.4237, 0.4328, 0.4373, 0.4357, 0.4279, 0.4375, 0.4443,
            0.4335, 0.4358, 0.4455, 0.4495, 0.4414, 0.4461, 0.4545, 0.4492, 0.4473, 0.4534,
            0.4454, 0.4539, 0.4475, 0.4451, 0.4523, 0.4644, 0.4614, 0.463, 0.4617, 0.4614,
          ],
          best_epoch: 10,
          best_val: 0.3488,
          riddle: {
            prompt: 'Vault ĐÚNG RA nên khoá checkpoint ở epoch nào, và vì sao?',
            options: ['Epoch 10 — vì val loss chạm đáy ở đó (0.349), mọi epoch sau val chỉ XẤU ĐI dù train vẫn tốt lên', 'Epoch 60 (epoch cuối) — vì train loss ở đó thấp nhất (0.078)', 'Không epoch nào — nên bỏ hẳn model này vì train và val không khớp nhau'],
            answer: 'Epoch 10 — vì val loss chạm đáy ở đó (0.349), mọi epoch sau val chỉ XẤU ĐI dù train vẫn tốt lên',
            wrong: {
              'Epoch 60 (epoch cuối) — vì train loss ở đó thấp nhất (0.078)': 'Sai — đây chính là bẫy "loss train thấp không phải vạch đích": train loss thấp nhất ở epoch 60 không có nghĩa model đó TỐT NHẤT, vì val loss ở epoch 60 (0.461) tệ hơn hẳn epoch 10 (0.349).',
              'Không epoch nào — nên bỏ hẳn model này vì train và val không khớp nhau': 'Sai — kiến trúc này VẪN dùng được, chỉ cần khoá ĐÚNG checkpoint (epoch 10) thay vì train tới cuối. Vấn đề không phải "vứt bỏ", mà là "biết dừng đúng lúc".',
            },
            done: '✅ Đúng — val loss chạm đáy 0.349 ở epoch 10, rồi bật ngược lên 0.461 ở epoch 60 dù train loss vẫn giảm đều xuống 0.078. Vault khoá đúng epoch 10 là quyết định ĐÚNG — bỏ qua 50 epoch sau đó dù chúng "trông có vẻ" tốt hơn trên train.',
          },
        },
        visual: {
          schema: {
            table_name: 'experiment_curves',
            columns: [
              { name: 'epoch', type: 'INT', key: '' },
              { name: 'train_loss', type: 'FLOAT', key: '' },
              { name: 'val_loss', type: 'FLOAT', key: '' },
            ],
          },
          data_preview: [
            ['1', '0.7134', '0.6675'],
            ['2', '0.6882', '0.6513'],
            ['3', '0.6672', '0.6355'],
            ['4', '0.6454', '0.6218'],
            ['5', '0.6279', '0.6088'],
          ],
        },
        mission: 'Lắp lại đúng thuật toán chọn checkpoint (validation-based early stopping) và tính metric, trên số liệu train PyTorch thật.',
      },
      step_2: {
        mcq: [
          {
            question: 'Một bạn quên gọi model.eval() trước khi tính validation loss (model vẫn ở train() mode). Điều gì có thể xảy ra?',
            options: [
              { id: 'a', text: 'Các cơ chế CHỈ dành cho training (vd dropout) vẫn hoạt động khi đo validation — val loss đo được KHÔNG phản ánh đúng hiệu năng thật của model ở chế độ suy luận', correct: true, explanation: 'Đúng — đây chính là misconception spec nêu: thiếu eval mode là 1 lớp lỗi phổ biến, làm sai lệch tín hiệu validation dùng để chọn checkpoint.' },
              { id: 'b', text: 'Không có vấn đề gì, train() và eval() chỉ là tên gọi khác nhau của cùng 1 trạng thái', correct: false, explanation: 'Sai — train()/eval() thực sự BẬT/TẮT các cơ chế như dropout, ảnh hưởng trực tiếp tới giá trị loss đo được.' },
              { id: 'c', text: 'Chỉ ảnh hưởng tốc độ chạy, không ảnh hưởng giá trị loss', correct: false, explanation: 'Sai — ảnh hưởng trực tiếp GIÁ TRỊ loss (dropout ngẫu nhiên tắt bớt unit), không chỉ tốc độ.' },
              { id: 'd', text: 'Chỉ quan trọng với tập test, không quan trọng với tập validation', correct: false, explanation: 'Sai — quan trọng với BẤT KỲ lần đánh giá nào (validation lẫn test), vì đây là lúc cần hành vi suy luận nhất quán, không ngẫu nhiên.' },
            ],
          },
          {
            question: 'Dropout, weight decay, Adam và Softmax là các khái niệm BẮT BUỘC ở mức nhận diện trong khoá này. Điều đó có nghĩa là gì?',
            options: [
              { id: 'a', text: 'Cần NHẬN DIỆN đúng vai trò của chúng (dropout/weight decay chống overfit, Adam là optimizer thích ứng, Softmax cho output đa lớp) — nhưng suy luận đầy đủ CNN/RNN/Transformer thuộc lộ trình học KHÁC, ngoài phạm vi khoá này', correct: true, explanation: 'Đúng nguyên văn misconception feedback của spec.' },
              { id: 'b', text: 'Cần tự lập trình lại thuật toán Adam từ đầu để qua được bài này', correct: false, explanation: 'Sai — chỉ cần mức NHẬN DIỆN (recognition level), không cần suy luận/lập trình lại toàn bộ thuật toán.' },
              { id: 'c', text: 'Khoá này sẽ dạy đầy đủ CNN, RNN và Transformer ngay sau khái niệm này', correct: false, explanation: 'Sai — spec nói RÕ những kiến trúc đó thuộc 1 lộ trình học RIÊNG, không nằm trong khoá này.' },
              { id: 'd', text: 'Softmax và Sigmoid là 1, dùng thay thế nhau ở mọi bài toán output', correct: false, explanation: 'Sai — Sigmoid cho output nhị phân (1 xác suất), Softmax cho output đa lớp (phân phối xác suất nhiều lớp) — không thay thế nhau tuỳ tiện (Bài 11).' },
            ],
          },
          {
            question: 'Một bạn thử NHIỀU kiến trúc, mỗi lần đo lại F1 trên TEST SET, rồi chọn kiến trúc có test F1 cao nhất và báo cáo chính con số đó làm bằng chứng cuối cùng. Vấn đề ở đây là gì?',
            options: [
              { id: 'a', text: 'Mạng vẫn train ĐÚNG, nhưng thí nghiệm không còn TEST ĐỘC LẬP nữa — test đã bị dùng như 1 vòng tuning trá hình, con số F1 "cao nhất" đó không còn đáng tin làm ước lượng hiệu năng thật', correct: true, explanation: 'Đúng nguyên văn unsafe-but-correct case của spec: "network trains correctly, but the experiment no longer has an independent test".' },
              { id: 'b', text: 'Không có vấn đề — miễn con số F1 cuối cùng cao là được', correct: false, explanation: 'Sai — con số cao KHÔNG có nghĩa là đáng tin, nếu nó đến từ việc so sánh nhiều kiến trúc TRÊN CHÍNH test set.' },
              { id: 'c', text: 'Vấn đề là F1 không phải metric tốt, nên dùng accuracy thay thế', correct: false, explanation: 'Sai — vấn đề không nằm ở CHỌN METRIC nào, mà ở QUY TRÌNH: test bị dùng để CHỌN thay vì chỉ để ĐO SAU KHI đã chọn.' },
              { id: 'd', text: 'Vấn đề là cần train lâu hơn trước khi đo test', correct: false, explanation: 'Sai — thời lượng train không giải quyết được vấn đề; vấn đề là test được đánh giá NHIỀU LẦN để chọn, thay vì đúng 1 lần sau khi chốt.' },
            ],
          },
        ],
        mini_game: {
          title: 'Thực hành nào giữ ĐÚNG kỷ luật khi train và bảo vệ 1 thí nghiệm neural network?',
          instruction: 'Xếp mỗi thực hành vào đúng nhóm.',
          chips: [
            { id: 'chip-valcheckpoint', label: 'Chọn checkpoint bằng validation loss thấp nhất, không phải train loss' },
            { id: 'chip-testonce', label: 'Mở test set ĐÚNG 1 LẦN, sau khi đã khoá model bằng validation' },
            { id: 'chip-testtuning', label: 'Thử nhiều kiến trúc, đo lại test F1 mỗi lần, chọn kiến trúc có test cao nhất' },
            { id: 'chip-noeval', label: 'Quên gọi model.eval() trước khi đo validation loss' },
          ],
          bins: [
            { id: 'dung', label: 'Đúng', correct: 'true' },
            { id: 'sai', label: 'Sai', correct: 'false' },
          ],
          solution: { 'chip-valcheckpoint': 'dung', 'chip-testonce': 'dung', 'chip-testtuning': 'sai', 'chip-noeval': 'sai' },
          success_html: '✅ Chọn checkpoint bằng validation, mở test đúng 1 lần, luôn eval() trước khi đo — không dùng test để tuning, không tin train loss là tín hiệu chọn model.',
        },
      },
      step_3: {
        ml_pipeline: true,
        mission: 'So 3 kiến trúc bằng param count, chẩn đoán curve underfit/overfit, rồi khoá checkpoint đúng bằng validation.',
        blocks: [
          { type: 'py', token: 'model = nn.Sequential(nn.Linear(input_dim, hidden), nn.ReLU(), nn.Linear(hidden, 1))', slot: 'z1a' },
          { type: 'py', token: 'loss_fn = nn.BCEWithLogitsLoss()', slot: 'z1b' },
          { type: 'py', token: 'if val_loss < best_val: best_val, best_state, patience_left = val_loss, copy.deepcopy(model.state_dict()), patience', slot: 'z2a' },
          { type: 'py', token: 'else: patience_left -= 1', slot: 'z2b' },
          { type: 'py', token: 'model.load_state_dict(best_state)', slot: 'z3a' },
          { type: 'py', token: 'print(binary_metrics(model, test_loader))', slot: 'z3b' },
          /* 2 mồi bẫy — đúng 2 misconception của spec: chọn theo train loss / đo test nhiều lần để chọn kiến trúc */
          { type: 'py', token: 'if train_loss < best_val: best_val, best_state = train_loss, copy.deepcopy(model.state_dict())', slot: 't1' },
          { type: 'py', token: 'test_f1 = binary_metrics(model, test_loader)["f1"]  # đo test NGAY để so kiến trúc', slot: 't2' },
        ],
        drop_zones: [
          { id: 'ned-arch', accepts: ['py'], multi: true },
          { id: 'ned-checkpoint', accepts: ['py'], multi: true },
          { id: 'ned-report', accepts: ['py'], multi: true },
        ],
        expected_zones: {
          'ned-arch': 'model = nn.Sequential(nn.Linear(input_dim, hidden), nn.ReLU(), nn.Linear(hidden, 1)) loss_fn = nn.BCEWithLogitsLoss()',
          'ned-checkpoint': 'if val_loss < best_val: best_val, best_state, patience_left = val_loss, copy.deepcopy(model.state_dict()), patience else: patience_left -= 1',
          'ned-report': 'model.load_state_dict(best_state) print(binary_metrics(model, test_loader))',
        },
        reveal_hints: {
          'ned-arch': 'Kiến trúc + task contract: <strong>1 logit output</strong>, dùng <strong>BCEWithLogitsLoss</strong> cho bài toán nhị phân.',
          'ned-checkpoint': 'Chỉ lưu checkpoint khi <strong>val_loss cải thiện</strong> — nếu không, giảm <strong>patience_left</strong>, hết patience thì dừng.',
          'ned-report': 'Load lại <strong>best_state</strong> (checkpoint validation tốt nhất), rồi mới đo <strong>test</strong> — ĐÚNG 1 LẦN.',
        },
        ml_flow: {
          brand: 'DÒNG CHẢY NEURAL EXPERIMENT DESIGNER',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: '3 kiến trúc MLP thật · cùng dataset nhị phân tabular' },
          done_note: 'A thiếu năng lực (underfit), C dư năng lực nếu bỏ qua validation (overfit) — B được validation checkpoint cứu đúng lúc, test chỉ mở 1 lần sau khi đã chốt. Click lại trạm bất kỳ để xem lại, rồi sang Bước 4 tự viết code.',
          stations: [
            {
              zones: ['ned-arch'],
              icon: '1️⃣', label: 'LẮP KIẾN TRÚC', sub: 'param count + task contract', result_kind: 'neural_experiment_designer',
              ned: { mode: 'params', candidates: [{ name: 'A (hidden=2)', params: 21 }, { name: 'B (hidden=16)', params: 161 }, { name: 'C (hidden=256)', params: 2561 }] },
              narration: 'Cùng input_dim=8, output=1 logit + BCEWithLogitsLoss (nhị phân) — chỉ khác hidden width: 2/16/256 → 21/161/2561 tham số.',
            },
            {
              zones: ['ned-checkpoint'],
              icon: '2️⃣', label: 'TRAIN & CHẨN ĐOÁN', sub: 'curve + instability warning', result_kind: 'neural_experiment_designer',
              ned: { mode: 'curves', a_train_final: 0.5323, a_val_final: 0.5073, c_train_final: 0.0783, c_val_final: 0.4614 },
              narration: 'A: train≈0.532, val≈0.507 — CẢ 2 đều cao và gần nhau (underfit, thiếu năng lực). C (nếu train hết 60 epoch không early-stop): train≈0.078 rất thấp nhưng val≈0.461 — khoảng cách doãng ra (overfit).',
            },
            {
              zones: ['ned-report'],
              icon: '3️⃣', label: 'KHOÁ CHECKPOINT', sub: 'validation quyết định, test mở 1 lần', result_kind: 'neural_experiment_designer',
              ned: { mode: 'lock', best_epoch: 63, best_val: 0.3506, metrics: { accuracy: 0.8153846153846154, precision: 0.8275862068965517, recall: 0.7741935483870968, f1: 0.7999999999999999 } },
              narration: 'B (hidden=16): validation checkpoint khoá đúng epoch 63 (best_val≈0.351) — test đo ĐÚNG 1 LẦN sau đó: accuracy 81.5%, F1 0.80. Đây là bằng chứng đáng bảo vệ.',
            },
          ],
        },
      },
      drag_map: {
        brand: 'DÒNG CHẢY NEURAL EXPERIMENT DESIGNER',
        table_sub: 'experiment_curves · epoch/train_loss/val_loss thật (candidate B)',
        idle_sub: 'Bấm ▶ để chạy pipeline',
        run_label: '▶ Chạy Pipeline',
        table: {
          name: 'experiment_curves',
          columns: ['epoch', 'train_loss', 'val_loss'],
          dataRows: [
            ['1', '0.7134', '0.6675'],
            ['2', '0.6882', '0.6513'],
            ['3', '0.6672', '0.6355'],
            ['4', '0.6454', '0.6218'],
            ['5', '0.6279', '0.6088'],
          ],
        },
      },
      step_4: {
        prompt: '<p>Viết <code>select_checkpoint(train_curve, val_curve, patience)</code> — thuật toán early-stopping ĐÚNG như 1 lần train PyTorch thật đã dùng — và <code>summarize_metrics(confusion)</code> tính accuracy/precision/recall/F1, trên số liệu THẬT từ <code>load_experiment_run()</code>.</p>',
        context: {
          scenario: 'Pyodide (chạy trong trình duyệt) KHÔNG có PyTorch — nên StudyLab đã train THẬT 1 MLP nhị phân bằng PyTorch ở máy chủ (offline), và cung cấp đường cong train/val THẬT cho bạn. Việc của bạn: lắp lại ĐÚNG thuật toán chọn checkpoint (validation-based early stopping) mà 1 lần train thật đã dùng, và tính đúng các metric báo cáo — không phải chạy lại việc train.',
          real_world: 'Giống việc 1 kiểm toán viên KHÔNG cần tự chạy lại toàn bộ giao dịch ngân hàng — chỉ cần áp ĐÚNG quy tắc kiểm tra (chọn đúng kỳ báo cáo, tính đúng công thức) lên SỔ SÁCH đã có sẵn, để xác nhận kết luận cuối cùng có đáng tin hay không.',
          steps: [
            'Viết <code>select_checkpoint(train_curve, val_curve, patience)</code>: duyệt <code>val_curve</code> theo epoch, cập nhật <code>best_val</code>/<code>best_epoch</code> khi cải thiện, giảm <code>patience_left</code> khi không, dừng khi hết patience.',
            'Viết <code>summarize_metrics(confusion)</code>: tính accuracy/precision/recall/F1 từ dict {"tp","tn","fp","fn"}.',
            'Gọi <code>load_experiment_run()</code> để lấy dữ liệu THẬT, chạy cả 2 hàm, in kết quả.',
          ],
          hint_explore: 'Muốn xem dữ liệu thật? Gõ <code>run = load_experiment_run(); print(len(run["train_curve"]), run["patience"])</code> rồi Run.',
          expected: 'best_epoch/best_val khớp đúng thuật toán early-stopping thật; metrics (accuracy/precision/recall/f1) khớp đúng confusion matrix thật — đúng trên CẢ candidate mặc định lẫn candidate ẩn khác hẳn (kiến trúc, độ dài đường cong, patience).',
        },
        hints: [
          { level: 1, text: 'Nhập <code>from ml_lab import load_experiment_run</code>. Định nghĩa <code>def select_checkpoint(train_curve, val_curve, patience):</code> và <code>def summarize_metrics(confusion):</code>.' },
          { level: 2, text: 'select_checkpoint: <code>best_val = float("inf")</code>, <code>patience_left = patience</code>, duyệt <code>for epoch, v in enumerate(val_curve, start=1):</code> — CHỈ dùng <code>val_curve</code>, không dùng <code>train_curve</code> để quyết định.' },
          { level: 3, text: 'summarize_metrics: <code>accuracy = (tp+tn)/(tp+tn+fp+fn)</code>, <code>precision = tp/(tp+fp)</code>, <code>recall = tp/(tp+fn)</code>, <code>f1 = 2*precision*recall/(precision+recall)</code>.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>from ml_lab import load_experiment_run<br>def select_checkpoint(train_curve, val_curve, patience=8):<br>&nbsp;&nbsp;&nbsp;&nbsp;best_val = float("inf")<br>&nbsp;&nbsp;&nbsp;&nbsp;best_epoch = None<br>&nbsp;&nbsp;&nbsp;&nbsp;patience_left = patience<br>&nbsp;&nbsp;&nbsp;&nbsp;for epoch, v in enumerate(val_curve, start=1):<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if v < best_val:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;best_val = v<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;best_epoch = epoch<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;patience_left = patience<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;else:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;patience_left -= 1<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if patience_left == 0:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;break<br>&nbsp;&nbsp;&nbsp;&nbsp;return best_epoch, best_val<br>def summarize_metrics(confusion):<br>&nbsp;&nbsp;&nbsp;&nbsp;tp, tn, fp, fn = confusion["tp"], confusion["tn"], confusion["fp"], confusion["fn"]<br>&nbsp;&nbsp;&nbsp;&nbsp;accuracy = (tp + tn) / max(1, (tp + tn + fp + fn))<br>&nbsp;&nbsp;&nbsp;&nbsp;precision = tp / max(1, (tp + fp))<br>&nbsp;&nbsp;&nbsp;&nbsp;recall = tp / max(1, (tp + fn))<br>&nbsp;&nbsp;&nbsp;&nbsp;f1 = 2 * precision * recall / max(1e-9, (precision + recall))<br>&nbsp;&nbsp;&nbsp;&nbsp;return {"accuracy": accuracy, "precision": precision, "recall": recall, "f1": f1}<br>run = load_experiment_run()<br>best_epoch, best_val = select_checkpoint(run["train_curve"], run["val_curve"], run["patience"])<br>metrics = summarize_metrics(run["confusion"])<br>print(best_epoch, best_val)<br>print(metrics)</code>' },
        ],
        grader_fn: 'grade_lesson_c3_14',
        success_message: '🎓 Bạn vừa lắp đúng quy trình chọn checkpoint và báo cáo của 1 thí nghiệm neural network thật — validation quyết định, test chỉ mở 1 lần. Đây là bài cuối cùng của Machine Learning Nâng Cao — CHÚC MỪNG BẠN ĐÃ HOÀN THÀNH TOÀN BỘ KHOÁ HỌC!',
        xp_reward: 80,
        starter_hint: '💡 Bắt đầu bằng: from ml_lab import load_experiment_run',
      },
    },
  ]
};
