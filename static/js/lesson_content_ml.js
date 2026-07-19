/* ============================================================================
 * LESSON_CONTENT['ml'] — Machine Learning Cơ bản (USTH StudyLab)
 * REWORK 2026-07-18: schema SHELL DB DESIGN (docs/ML_REWORK_PILOT_BAI1_2026-07-18.md)
 * — cùng anatomy 4 step với db_design/tc/nc, engine Pyodide chấm 4 tầng giữ ngầm.
 * (Bản type-dispatch cũ nằm trong git history — commit 2ef4a7b trở về trước.)
 *
 * Pilot: Bài 1 (c1_l1) đầy đủ. Bài 2-15 = stub (shell hiện "đang cập nhật")
 * — rollout theo module sau khi user duyệt pilot.
 *
 * SỐ LIỆU THẬT (ml_lab.load_study_data — mọi visual PHẢI khớp):
 *   X = 12 học viên × [study_hours, attendance, quiz_score], y = pass_fail 0/1
 *   X_new = [7.0, 90.0, 82.0] → SimpleClassifier dự đoán 1 (ĐẬU)
 * ============================================================================ */

window.LESSON_CONTENT = window.LESSON_CONTENT || {};

/* Hero SVG tĩnh Bài 1 đã GỘP vào paradigm_visual (user chốt 2026-07-18) —
 * sim 2 luồng + timeline render thẳng vào slot hero. Bài sau cần hero tĩnh thì khai ở đây. */
window.HERO_SVGS_ML = {};

window.LESSON_CONTENT['ml'] = {
  course_id: 'ml',
  course_title: 'Machine Learning Cơ bản',
  accent_color: '#A78BFA',
  module_color: '#A78BFA',
  total_lessons: 15,
  lessons: [
    {
      id: 'c1_l1',
      index: 1,
      title: 'Machine Learning vs Lập trình truyền thống',
      subtitle: 'Luật viết sẵn hay pattern học được từ dữ liệu?',
      module: 10,
      module_title: 'M1 — Định khung bài toán ML',
      estimated_minutes: 19,
      xp_reward: 50,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      story: {
        tag: '🎓 StudyLab · Ticket #01',
        hook: 'Bạn là <strong>người dựng mô hình ML đầu tiên</strong> của <strong>USTH StudyLab</strong>. Môn học kéo dài <strong>15 tuần</strong>: suốt kỳ hệ thống ghi <em>giờ tự học, điểm danh, điểm quiz</em>; đến <strong>tuần 15</strong> thi cuối mới sinh ra <code>final_score</code> — và luật <code>final_score >= 50</code> chấm Đậu/Rớt. Ticket #01 hỏi một câu luật KHÔNG trả lời nổi: <em>"mới TUẦN 3 — ai đang trên đà rớt, để còn kịp cứu?"</em> Lúc này final_score <strong>chưa tồn tại</strong>. May thay, kho còn nguyên <strong>12 hồ sơ khóa trước</strong> — có đủ cả hành vi LẪN kết cục. Nhiệm vụ: để máy <strong>tự học pattern</strong> từ 12 hồ sơ đó rồi dự đoán cho khóa mới.'
      },
      achievement: { name: 'ML Problem Framer — Khởi đầu', desc: 'bài đầu về định khung bài toán ML' },

      /* ----- STEP 1: Model Story (shell: hero + scaffold + cards + sim + data + mission) ----- */
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Giải thích vì sao <code>final_score >= 50</code> là lập trình truyền thống, còn <em>cảnh báo sớm tuần 3</em> là bài toán Machine Learning.',
            'Gọi tên đúng 3 mảnh của một bài toán ML: <strong>Task – Experience – Performance</strong>.',
            'Chạy pipeline ML tối thiểu bằng Python thật: <code>fit</code> trước, <code>predict</code> trên học viên <strong>mới</strong>.'
          ],
          defs: [
            { term: 'Lập trình truyền thống', plain: 'Người viết LUẬT (if/else), máy áp dụng luật lên dữ liệu. Cần biết trước công thức đáp án.' },
            { term: 'Machine Learning', plain: 'Người đưa DỮ LIỆU LỊCH SỬ kèm đáp án, máy tự rút pattern — rồi dùng pattern đó dự đoán cho ca CHƯA CÓ đáp án.' },
            { term: 'Task – Experience – Performance', plain: 'Việc cần làm (T) · dữ liệu để học (E) · thước đo làm tốt hay không (P). Thiếu 1 trong 3 là chưa thành bài toán ML.' }
          ]
        },
        primer: {
          goal: [
            'Phân biệt luật viết sẵn vs pattern học được',
            'Task – Experience – Performance',
            'Pipeline fit → predict đầu tiên'
          ],
          intro: '',
          example: '🔍 <strong>Nhìn bảng SAMPLE DATA bên dưới:</strong> 12 học viên khóa trước — ai học ≥ 6 giờ đều <strong>1 · Đậu</strong>, ai dưới 5 giờ đều <strong>0 · Rớt</strong>. Bạn vừa NHÌN RA một pattern mà không ai viết cho bạn luật nào cả. Máy cũng làm được y như vậy — đó chính là "học". Giữ pattern này khi sang Bước 2 👇'
        },
        intro: 'StudyLab có đủ điểm danh, giờ tự học, điểm quiz của <strong>12 học viên khóa trước</strong> — kèm kết cục Đậu/Rớt của từng người. Với khóa MỚI đang ở tuần 3, ta có đúng các con số ấy nhưng <em>chưa có</em> kết cục. Bài toán: dùng lịch sử để <strong>dự đoán trước</strong> kết cục — kịp cảnh báo khi còn cứu được.',
        concept_cards: [
          {
            icon: 'fa-scale-balanced',
            title: 'Luật viết sẵn (Traditional)',
            body: 'Chấm Đậu/Rớt cuối kỳ? Dễ — <code>if final_score >= 50</code>. Luật chạy được vì <strong>đáp án đã nằm trong tay</strong>: con người nghĩ ra công thức, máy chỉ áp dụng. Đây là toàn bộ lập trình bạn từng học.'
          },
          {
            icon: 'fa-brain',
            title: 'Học từ dữ liệu (Machine Learning)',
            body: 'Tuần 3 <strong>chưa có</strong> final_score — không viết nổi luật. Nhưng có <strong>Experience</strong>: 12 hồ sơ khóa trước kèm nhãn. Máy tự rút pattern (<strong>Task</strong>: dự đoán Đậu/Rớt) và ta đo bằng <strong>Performance</strong>: dự đoán đúng bao nhiêu trên học viên mới.'
          },
          {
            icon: 'fa-hand-pointer',
            title: 'Thử ngay (Apply)',
            body: 'Lý thuyết là để <strong>phá</strong>. Ở Bước 3 bạn lắp pipeline <code>fit → predict</code> bằng tay; Bước 4 tự viết code thật — và sẽ có một cái bẫy kinh điển: <code>predict(X)</code> trên chính dữ liệu đã học. Trông "đúng" mà vô dụng. Tự sập bẫy rồi thoát — đó là cách nhớ lâu nhất.'
          }
        ],
        /* Sim nhúng theo pattern NC (plan_visual/sort_visual...) — 2 luồng HIỆN SẴN,
           bấm ▶ chạy animation từng nút; đủ 2 luồng → chốt so kèo. */
        paradigm_visual: {
          timeline: {
            title: 'HỌC KỲ 15 TUẦN — BẠN ĐANG Ở TUẦN 3',
            weeks: 15, now: 3, exam_week: 15,
            now_label: '📍 Tuần 3 — ĐÃ CÓ: giờ tự học · điểm danh · quiz 1',
            mid_label: '⋯ chưa xảy ra ⋯',
            exam_label: 'Tuần 15: thi cuối → final_score MỚI tồn tại',
            note: 'Luật <code>final_score >= 50</code> phải đợi tới tuần 15 mới có dữ liệu để chạy. Cảnh báo sớm = trả lời NGAY BÂY GIỜ — khi còn 12 tuần để cứu.'
          },
          flows: [
            {
              id: 'rule',
              tag: '① LUẬT VIẾT SẴN',
              sub: 'cuối kỳ — final_score đã có',
              accent: '#FBBF24',
              nodes: [
                { icon: '📥', label: 'final_score = 62' },
                { icon: '📏', label: 'if score >= 50' },
                { icon: '✅', label: 'ĐẬU', cls: 'good' }
              ],
              punch: 'Chạy được vì đáp án ĐÃ TỒN TẠI — người viết luật, máy áp dụng.'
            },
            {
              id: 'learn',
              tag: '② HỌC TỪ DỮ LIỆU',
              sub: 'tuần 3 — final_score CHƯA tồn tại',
              accent: '#A78BFA',
              nodes: [
                { icon: '🗂️', label: '12 học viên khóa trước + nhãn Đậu/Rớt' },
                { icon: '🧠', label: 'MODEL tự rút pattern' },
                { icon: '👤', label: 'Hồ sơ mới: 7h · 90% · quiz 82' },
                { icon: '🔮', label: 'Dự đoán: ĐẬU', cls: 'good' }
              ],
              punch: 'Không ai viết nổi luật — model HỌC từ lịch sử rồi dự đoán ca mới.'
            }
          ],
          so_keo: 'Luật viết sẵn cần ĐÁP ÁN có sẵn trong tay. Cảnh báo sớm tuần 3 không có đáp án nào để viết luật — chỉ còn cách HỌC pattern từ lịch sử. Đó là ranh giới giữa lập trình truyền thống và Machine Learning.'
        },
        visual: {
          schema: {
            table_name: 'study_data (DataFrame)',
            columns: [
              { name: 'study_hours', type: 'FLOAT',   key: '',       icon: '' },
              { name: 'attendance',  type: 'FLOAT',   key: '',       icon: '' },
              { name: 'quiz_score',  type: 'FLOAT',   key: '',       icon: '' },
              { name: 'pass_fail',   type: 'INT 0/1', key: 'TARGET', icon: '🎯' }
            ]
          },
          /* 12 dòng = CHÍNH XÁC ml_lab.load_study_data (0=Rớt, 1=Đậu) */
          data_preview: [
            ['2.0', '55', '45', '0 · Rớt'],
            ['8.0', '95', '85', '1 · Đậu'],
            ['1.0', '50', '40', '0 · Rớt'],
            ['9.0', '98', '90', '1 · Đậu'],
            ['3.0', '60', '50', '0 · Rớt'],
            ['7.0', '92', '80', '1 · Đậu'],
            ['2.0', '58', '48', '0 · Rớt'],
            ['8.0', '96', '88', '1 · Đậu'],
            ['4.0', '70', '60', '0 · Rớt'],
            ['9.0', '99', '95', '1 · Đậu'],
            ['1.0', '52', '42', '0 · Rớt'],
            ['6.0', '88', '78', '1 · Đậu']
          ]
        },
        mission: 'Lắp pipeline ML 4 dòng Python: nạp <code class="code">12 học viên</code> → tạo model → <code class="code">fit</code> → <code class="code">predict</code> cho học viên mới <code class="code">[7h · 90% · quiz 82]</code> — kéo thả khối lệnh xuống dưới ↓'
      },

      /* ----- STEP 2: 2 MCQ + mini-game T/E/P (spec C1-L1 Step 2: Check 1 + Check 2) ----- */
      step_2: {
        mcq: [
          {
            question: 'StudyLab muốn cảnh báo <strong>"học viên đang trên đà rớt"</strong> ngay từ tuần 3. Vì sao KHÔNG dùng được luật <code>if final_score >= 50</code>?',
            options: [
              { id: 'a', text: 'Vì Python không cho so sánh <code>>=</code> với số thực', correct: false, explanation: 'So sánh >= chạy bình thường với float. Vấn đề không nằm ở cú pháp.' },
              { id: 'b', text: 'Vì <code>final_score</code> CHƯA TỒN TẠI ở tuần 3 — phải HỌC pattern từ khóa trước để dự đoán', correct: true, explanation: 'Đúng — luật cần đáp án có sẵn. Tuần 3 chưa có final_score nên không có gì để so sánh; chỉ còn cách học pattern từ dữ liệu lịch sử → đây là bài toán ML.' },
              { id: 'c', text: 'Vì luật này chạy quá chậm khi lớp có 200 học viên', correct: false, explanation: 'Một phép so sánh chạy trong micro-giây với mọi sĩ số. Tốc độ không phải vấn đề — vấn đề là final_score chưa tồn tại.' },
              { id: 'd', text: 'Vì phải dùng deep learning mới đủ chính xác', correct: false, explanation: 'Chưa cần bàn model mạnh hay yếu — câu hỏi là PARADIGM: luật viết sẵn không có dữ liệu đầu vào để chạy, phải chuyển sang học từ lịch sử.' }
            ]
          },
          {
            question: 'Trong bài toán cảnh báo sớm, đâu là <strong>EXPERIENCE</strong> (kinh nghiệm) mà model dùng để học?',
            options: [
              { id: 'a', text: 'Danh sách học viên MỚI của kỳ này (chưa có nhãn)', correct: false, explanation: 'Học viên mới KHÔNG có nhãn Đậu/Rớt — không có đáp án thì không học được gì. Đây là nơi model DỰ ĐOÁN, không phải nơi model HỌC.' },
              { id: 'b', text: '12 hồ sơ khóa trước KÈM nhãn Đậu/Rớt', correct: true, explanation: 'Chính xác — Experience = dữ liệu lịch sử CÓ đáp án. Model đối chiếu đặc trưng với kết cục để rút pattern.' },
              { id: 'c', text: 'Sĩ số lớp học kỳ này', correct: false, explanation: 'Sĩ số là 1 con số về lớp — không phải dữ liệu hành vi kèm nhãn, cũng không đo được model làm tốt hay không. Không phải Experience, càng không phải Performance.' },
              { id: 'd', text: 'Luật <code>if score >= 50</code> của giáo vụ', correct: false, explanation: 'Luật viết sẵn thuộc paradigm cũ — model ML không học từ luật, nó học từ DỮ LIỆU (đặc trưng + nhãn).' }
            ]
          }
        ],
        mini_game: {
          title: 'Xếp 6 mảnh vào đúng ô: Task – Experience – Performance',
          instruction: 'Bài toán cảnh báo sớm của StudyLab vừa được định khung. Kéo mỗi thẻ vào đúng ô <strong>T</strong> (việc cần làm), <strong>E</strong> (dữ liệu để học) hoặc <strong>P</strong> (thước đo).',
          chips: [
            { id: 'tep-predict', label: 'Dự đoán Đậu/Rớt cho học viên MỚI' },
            { id: 'tep-early',   label: 'Cảnh báo ngay từ tuần 3' },
            { id: 'tep-history', label: '12 hồ sơ khóa trước + nhãn' },
            { id: 'tep-cols',    label: 'Bảng study_hours · attendance · quiz' },
            { id: 'tep-acc',     label: 'Tỉ lệ dự đoán ĐÚNG trên hồ sơ mới' },
            { id: 'tep-miss',    label: 'Số ca sắp rớt bị BỎ SÓT' }
          ],
          bins: [
            { id: 'task', label: 'T — Task',        correct: 'true' },
            { id: 'exp',  label: 'E — Experience',  correct: 'true' },
            { id: 'perf', label: 'P — Performance', correct: 'true' }
          ],
          solution: {
            'tep-predict': 'task',
            'tep-early':   'task',
            'tep-history': 'exp',
            'tep-cols':    'exp',
            'tep-acc':     'perf',
            'tep-miss':    'perf'
          }
        }
      },

      /* ----- STEP 3: Map ML PIPELINE (bài QUY TRÌNH — 5 trạm: Kho → DATASET → MODEL → TRAIN → PREDICT) -----
         Blocks = 8 mảnh Python duy nhất → 4 zone (1 dòng lệnh/zone). Hybrid: gõ Python
         trực tiếp vào solution.py cũng được (hydrate theo DÒNG — ml_pipeline: true). */
      step_3: {
        ml_pipeline: true,
        blocks: [
          { type: 'py', token: 'X, y, X_new =',          slot: 'z1a' },
          { type: 'py', token: 'load_study_data()',      slot: 'z1b' },
          { type: 'py', token: 'model =',                slot: 'z2a' },
          { type: 'py', token: 'SimpleClassifier()',     slot: 'z2b' },
          { type: 'py', token: 'model.fit',              slot: 'z3a' },
          { type: 'py', token: '(X, y)',                 slot: 'z3b' },
          { type: 'py', token: 'prediction =',           slot: 'z4a' },
          { type: 'py', token: 'model.predict(X_new)',   slot: 'z4b' }
        ],
        drop_zones: [
          { id: 'ml-data',    accepts: ['py'], multi: true },
          { id: 'ml-model',   accepts: ['py'], multi: true },
          { id: 'ml-fit',     accepts: ['py'], multi: true },
          { id: 'ml-predict', accepts: ['py'], multi: true }
        ],
        /* Map DÒNG CHẢY PIPELINE ML — representation của logic hệ thống (7 quyết định user
           2026-07-18): node hiện INPUT giấu KẾT QUẢ · sân khấu diễn biến đổi · bấm từng bước
           + narration · click trạm xem lại · TRAIN/PREDICT = nearest-centroid THẬT
           (số từ ml_lab: RỚT tb 2.17h·57.5%·47.5 → hiện ≈2.2h·58%·48; ĐẬU tb 7.83h·94.7%·86;
           khoảng cách X_new: ĐẬU 6.2 vs RỚT 47.6). */
        ml_flow: {
          brand: 'DÒNG CHẢY PIPELINE ML',
          run_label: '▶ Chạy Pipeline',
          source: { sub: '12 học viên khóa trước · 3 đặc trưng + nhãn' },
          done_note: 'Bạn vừa xem cả hệ thống vận hành trên dữ liệu thật. Click lại bất kỳ trạm nào để mổ xẻ phép biến đổi của nó — rồi sang Bước 4 tự viết code cho chính hệ thống này.',
          stations: [
            {
              zone: 'ml-data', icon: '📦', label: 'DATASET', sub: 'Nạp & tách dữ liệu', result_kind: 'xy_split',
              split: {
                features: ['study_hours', 'attendance', 'quiz_score'], target: 'pass_fail',
                x_desc: '12×3 đặc trưng', y_desc: '12 nhãn Đậu/Rớt', new_desc: '1 hồ sơ CHƯA nhãn',
                new_profile: '7.0 · 90 · 82'
              },
              narration: '<code>load_study_data()</code> nạp 12 hồ sơ rồi TÁCH: <b>X</b> = 3 cột đặc trưng (tím) — thứ máy được nhìn · <b>y</b> = cột nhãn (vàng) — đáp án để học · <b>X_new</b> = hồ sơ mới CHƯA có nhãn, để dành cho trạm cuối.'
            },
            {
              zone: 'ml-model', icon: '🤖', label: 'MODEL', sub: 'Khởi tạo bộ học', result_kind: 'model_empty',
              narration: '<code>SimpleClassifier()</code> tạo model RỖNG — chưa đọc hồ sơ nào. Cách nó sẽ học ở trạm sau: tính <b>chân dung trung bình</b> của từng nhóm, rồi so mọi hồ sơ mới với 2 chân dung đó.'
            },
            {
              zone: 'ml-fit', icon: '🎓', label: 'TRAIN', sub: 'fit — học từ X, y', result_kind: 'centroids',
              centroids: {
                fail: { title: 'RỚT trung bình', vals: '≈ 2.2h · 58% · quiz 48', n: 'từ 6 hồ sơ Rớt' },
                pass: { title: 'ĐẬU trung bình', vals: '≈ 7.8h · 95% · quiz 86', n: 'từ 6 hồ sơ Đậu' }
              },
              narration: '<code>model.fit(X, y)</code>: model đọc 12 hồ sơ KÈM đáp án và kết tinh thành 2 <b>chân dung trung bình</b>. Toàn bộ "cái đã học" của model chỉ là 2 tấm thẻ này — không hơn.'
            },
            {
              zone: 'ml-predict', icon: '🔮', label: 'PREDICT', sub: 'Hồ sơ MỚI', result_kind: 'nearest',
              profile: '7h · 90% · quiz 82', dist: { pass: 6.2, fail: 47.6 }, verdict: '1 · ĐẬU',
              narration: '<code>model.predict(X_new)</code>: đo khoảng cách hồ sơ mới tới 2 chân dung — tới ĐẬU ≈ <b>6.2</b>, tới RỚT ≈ <b>47.6</b> → gần ĐẬU hơn hẳn → dự đoán <b>1 · ĐẬU</b>. Không phép màu: chỉ là phép so khoảng cách.'
            }
          ]
        },
        expected_sql: 'X, y, X_new = load_study_data() model = SimpleClassifier() model.fit (X, y) prediction = model.predict(X_new)',
        expected_zones: {
          'ml-data':    'X, y, X_new = load_study_data()',
          'ml-model':   'model = SimpleClassifier()',
          'ml-fit':     'model.fit (X, y)',
          'ml-predict': 'prediction = model.predict(X_new)'
        },
        reveal_hints: {
          'ml-data':    'Bắt đầu bằng nạp dữ liệu: <strong>X, y, X_new = load_study_data()</strong>.',
          'ml-model':   'Tạo bộ học: <strong>model = SimpleClassifier()</strong>.',
          'ml-fit':     'Cho model học: <strong>model.fit(X, y)</strong> — fit TRƯỚC predict.',
          'ml-predict': 'Dự đoán ca mới: <strong>prediction = model.predict(X_new)</strong>.'
        }
      },

      /* Map dùng bảng NGUỒN = 12 học viên thật (drag_game đọc lesson.drag_map.table).
         Nhãn map data-driven — nói ngôn ngữ ML, không phải SQL. */
      drag_map: {
        brand: 'DÒNG CHẢY PIPELINE ML',
        table_sub: 'DataFrame nguồn · 12 học viên',
        idle_sub: '12 học viên · ▶ chạy pipeline để xem dữ liệu chảy',
        run_label: '▶ Chạy Pipeline',
        table: {
          name: 'study_data',
          columns: ['study_hours', 'attendance', 'quiz_score', 'pass_fail'],
          dataRows: [
            ['2.0', '55', '45', '0'],
            ['8.0', '95', '85', '1'],
            ['1.0', '50', '40', '0'],
            ['9.0', '98', '90', '1'],
            ['3.0', '60', '50', '0'],
            ['7.0', '92', '80', '1'],
            ['2.0', '58', '48', '0'],
            ['8.0', '96', '88', '1'],
            ['4.0', '70', '60', '0'],
            ['9.0', '99', '95', '1'],
            ['1.0', '52', '42', '0'],
            ['6.0', '88', '78', '1']
          ]
        }
      },

      /* ----- STEP 4: câu hỏi KHÁC Step 3 (luật anti-boredom) — viết TRỌN script,
         hidden tests đổi X_new; bẫy kinh điển predict(X). Grader 4 tầng chạy thật
         trong Pyodide (ml_grader.grade_lesson1). ----- */
      step_4: {
        prompt: 'Bước 3 bạn đã lắp pipeline bằng tay. Giờ StudyLab cần bản <strong>code thật</strong> — và hệ thống chấm sẽ <strong>thay hồ sơ học viên mới</strong> (X_new đổi ngầm) để chắc chắn model dự đoán thật. Tự viết TRỌN script: nạp dữ liệu → tạo model → <code>fit</code> → <code>predict</code> cho học viên MỚI → <code>print(prediction)</code>.',
        context: {
          scenario: 'Pipeline kéo thả ở Bước 3 chỉ chạy cho 1 hồ sơ demo. Bản code thật phải sống sót qua <strong>hidden tests</strong>: hệ thống bí mật đổi X_new — nếu bạn viết đúng quy trình, kết quả vẫn hợp lệ với mọi hồ sơ.',
          real_world: 'Đây chính là bộ lọc <strong>spam của Gmail</strong>: model được fit trên email QUÁ KHỨ đã gắn nhãn, rồi predict cho email MỚI vừa đến. Nếu chỉ <code>predict(X)</code> — dự đoán lại chính các email cũ — bộ lọc "đúng 100%" mà vô dụng: thư rác mới lọt sạch. Dự đoán chỉ có giá trị trên dữ liệu <strong>chưa từng thấy</strong>.',
          steps: [
            'Import công cụ từ <code>ml_lab</code>.',
            'Nạp dữ liệu: 3 biến — đặc trưng, nhãn, và hồ sơ mới.',
            'Tạo model rồi huấn luyện — học TRƯỚC, đoán SAU.',
            'Dự đoán cho hồ sơ MỚI (đừng đoán lại 12 hồ sơ cũ).',
            'In kết quả · Run chạy thử · Submit chấm 4 tầng.'
          ],
          hint_explore: 'Muốn xem dữ liệu trước? Gõ <code>print(X.shape)</code> hoặc <code>print(X[:3])</code> rồi <strong>Run</strong> — 12 dòng × 3 cột đặc trưng.',
          expected: 'Console in <code>[1]</code> — học viên mới (7h · 90% · quiz 82) được dự đoán <strong>ĐẬU</strong>. Cả 4 tầng Checks phải xanh — kể cả khi hệ thống đổi X_new ngầm.'
        },
        hints: [
          { level: 1, text: 'Chính là pipeline 4 trạm của Bước 3 — nhưng viết thành code, thêm dòng import ở đầu và print ở cuối.' },
          { level: 2, text: 'Dòng 1: <code>from ml_lab import SimpleClassifier, load_study_data</code>. Dòng 2: <code>X, y, X_new = load_study_data()</code>.' },
          { level: 3, text: 'Thứ tự bắt buộc: <code>model = SimpleClassifier()</code> → <code>model.fit(X, y)</code> → <code>prediction = model.predict(X_new)</code>. Predict trên <strong>X_new</strong>, không phải X.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>from ml_lab import SimpleClassifier, load_study_data<br>X, y, X_new = load_study_data()<br>model = SimpleClassifier()<br>model.fit(X, y)<br>prediction = model.predict(X_new)<br>print(prediction)</code>' }
        ],
        grader_fn: 'grade_lesson1',
        success_message: 'Pipeline ML đầu tiên của bạn chạy thật: model học từ 12 hồ sơ và dự đoán đúng cho học viên chưa từng thấy. Bài 2: cùng một bảng dữ liệu — ba loại bài toán ML khác nhau.',
        xp_reward: 50
      }
    },

    /* ── Bài 2-15: stub chờ rollout theo module (shell hiện màn "đang cập nhật") ── */
    { id: 'c1_l2',  index: 2,  title: 'Bài toán ML này thuộc loại nào?',              module: 10, module_title: 'M1 — Định khung bài toán ML',  xp_reward: 50 },
    { id: 'c1_l3',  index: 3,  title: 'Dataset trong mắt model — X và y',             module: 10, module_title: 'M1 — Định khung bài toán ML',  xp_reward: 50 },
    { id: 'c1_l4',  index: 4,  title: 'Hiểu kiểu dữ liệu trước khi train',            module: 11, module_title: 'M2 — Dữ liệu sẵn sàng',        xp_reward: 50 },
    { id: 'c1_l5',  index: 5,  title: 'Làm sạch dữ liệu bẩn',                         module: 11, module_title: 'M2 — Dữ liệu sẵn sàng',        xp_reward: 50 },
    { id: 'c1_l6',  index: 6,  title: 'Scale feature — không để 1 đơn vị lấn át',     module: 11, module_title: 'M2 — Dữ liệu sẵn sàng',        xp_reward: 50 },
    { id: 'c1_l7',  index: 7,  title: 'Đọc dữ liệu bằng thống kê cơ bản',             module: 11, module_title: 'M2 — Dữ liệu sẵn sàng',        xp_reward: 50 },
    { id: 'c1_l8',  index: 8,  title: 'Vẽ đường dự đoán đầu tiên',                    module: 12, module_title: 'M3 — Hồi quy tuyến tính',      xp_reward: 50 },
    { id: 'c1_l9',  index: 9,  title: 'Đo lỗi model bằng MSE',                        module: 12, module_title: 'M3 — Hồi quy tuyến tính',      xp_reward: 50 },
    { id: 'c1_l10', index: 10, title: 'Gradient Descent — model tự chỉnh đường',      module: 12, module_title: 'M3 — Hồi quy tuyến tính',      xp_reward: 50 },
    { id: 'c1_l11', index: 11, title: 'Vì sao Linear Regression không phân loại được', module: 13, module_title: 'M4 — Phân loại Logistic',     xp_reward: 50 },
    { id: 'c1_l12', index: 12, title: 'Sigmoid — biến score thành xác suất',          module: 13, module_title: 'M4 — Phân loại Logistic',      xp_reward: 50 },
    { id: 'c1_l13', index: 13, title: 'Decision Boundary — luật tách 2 lớp',          module: 13, module_title: 'M4 — Phân loại Logistic',      xp_reward: 50 },
    { id: 'c1_l14', index: 14, title: 'Underfit, Good Fit và Overfit',                module: 14, module_title: 'M5 — Tổng quát hóa',            xp_reward: 50 },
    { id: 'c1_l15', index: 15, title: 'Chia Train / Validation / Test',               module: 14, module_title: 'M5 — Tổng quát hóa',            xp_reward: 50 }
  ]
};
