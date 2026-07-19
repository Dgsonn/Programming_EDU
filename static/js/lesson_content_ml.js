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
 *   X = 12 học viên × [study_hours, attendance, midterm_score], y = pass_fail 0/1
 *   (bối cảnh: TUẦN 8 — giữa kỳ thi tuần 7 vừa chấm; thang điểm /100 giữ nguyên giá trị)
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
        hook: 'Bạn là <strong>người dựng mô hình ML đầu tiên</strong> của <strong>USTH StudyLab</strong>. Môn học kéo dài <strong>15 tuần</strong>: hệ thống ghi <em>giờ tự học, điểm danh</em> mỗi tuần; <strong>tuần 7</strong> thi giữa kỳ sinh ra <em>điểm giữa kỳ</em>; nhưng phải đến <strong>tuần 15</strong> thi cuối mới sinh ra <code>final_score</code> — và luật <code>final_score >= 50</code> chấm Đậu/Rớt. Đang <strong>TUẦN 8</strong>, điểm giữa kỳ vừa chấm xong, Ticket #01 hỏi một câu luật KHÔNG trả lời nổi: <em>"ai đang trên đà rớt, để còn 7 tuần kịp cứu?"</em> — vì final_score <strong>chưa tồn tại</strong>. May thay, kho còn nguyên <strong>12 hồ sơ khóa trước</strong>: cũng đo đúng 3 con số ấy ở tuần 8, và nay đã biết kết cục Đậu/Rớt. Nhiệm vụ: để máy <strong>tự học pattern</strong> từ 12 hồ sơ đó rồi dự đoán cho khóa mới.'
      },
      achievement: { name: 'ML Problem Framer — Khởi đầu', desc: 'bài đầu về định khung bài toán ML' },

      /* ----- STEP 1: Model Story (shell: hero + scaffold + cards + sim + data + mission) ----- */
      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Giải thích vì sao <code>final_score >= 50</code> là lập trình truyền thống, còn <em>cảnh báo sớm ở tuần 8</em> là bài toán Machine Learning.',
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
        intro: 'StudyLab có đủ giờ tự học, điểm danh, điểm giữa kỳ của <strong>12 học viên khóa trước</strong> — kèm kết cục Đậu/Rớt của từng người. Với khóa MỚI đang ở tuần 8, ta có đúng các con số ấy nhưng <em>chưa có</em> kết cục. Bài toán: dùng lịch sử để <strong>dự đoán trước</strong> kết cục — kịp cảnh báo khi còn 7 tuần để cứu.',
        concept_cards: [
          {
            icon: 'fa-scale-balanced',
            title: 'Luật viết sẵn (Traditional)',
            body: 'Chấm Đậu/Rớt cuối kỳ? Dễ — <code>if final_score >= 50</code>. Luật chạy được vì <strong>đáp án đã nằm trong tay</strong>: con người nghĩ ra công thức, máy chỉ áp dụng. Đây là toàn bộ lập trình bạn từng học.'
          },
          {
            icon: 'fa-brain',
            title: 'Học từ dữ liệu (Machine Learning)',
            body: 'Tuần 8 <strong>chưa có</strong> final_score — không viết nổi luật. Nhưng có <strong>Experience</strong>: 12 hồ sơ khóa trước kèm nhãn. Máy tự rút pattern (<strong>Task</strong>: dự đoán Đậu/Rớt) và ta đo bằng <strong>Performance</strong>: dự đoán đúng bao nhiêu trên học viên mới.'
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
            title: 'HỌC KỲ 15 TUẦN — BẠN ĐANG Ở TUẦN 8',
            weeks: 15, now: 8, exam_week: 15,
            marks: [{ week: 7, icon: '📝', label: 'Tuần 7: thi GIỮA KỲ → midterm_score' }],
            now_label: '📍 Tuần 8 — ĐÃ CÓ: giờ tự học · điểm danh · điểm giữa kỳ',
            mid_label: '⋯ tuần 9–14: chưa xảy ra ⋯',
            exam_label: 'Tuần 15: thi cuối → final_score MỚI tồn tại',
            note: 'Luật <code>final_score >= 50</code> phải đợi tới tuần 15 mới có dữ liệu để chạy. Cảnh báo sớm = trả lời NGAY BÂY GIỜ — điểm giữa kỳ vừa có, còn 7 tuần để cứu.'
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
              sub: 'tuần 8 — final_score CHƯA tồn tại',
              accent: '#A78BFA',
              nodes: [
                { icon: '🗂️', label: '12 học viên khóa trước + nhãn Đậu/Rớt' },
                { icon: '🧠', label: 'MODEL tự rút pattern' },
                { icon: '👤', label: 'Hồ sơ mới: 7h · 90% · giữa kỳ 82' },
                { icon: '🔮', label: 'Dự đoán: ĐẬU', cls: 'good' }
              ],
              punch: 'Không ai viết nổi luật — model HỌC từ lịch sử rồi dự đoán ca mới.'
            }
          ],
          so_keo: 'Luật viết sẵn cần ĐÁP ÁN có sẵn trong tay. Cảnh báo sớm ở tuần 8 không có đáp án nào để viết luật — chỉ còn cách HỌC pattern từ lịch sử. Đó là ranh giới giữa lập trình truyền thống và Machine Learning.'
        },
        visual: {
          schema: {
            table_name: 'study_data (DataFrame)',
            columns: [
              { name: 'study_hours',   type: 'FLOAT',   key: '',       icon: '',
                note: '<strong>Feature (đặc trưng)</strong> — giờ tự học trung bình mỗi tuần, đo suốt 8 tuần đầu. Một trong 3 cột vào <code>X</code> cho model nhìn.' },
              { name: 'attendance',    type: 'FLOAT',   key: '',       icon: '',
                note: '<strong>Feature (đặc trưng)</strong> — % chuyên cần 8 tuần đầu. Vào <code>X</code> cùng 2 cột kia.' },
              { name: 'midterm_score', type: 'FLOAT',   key: '',       icon: '',
                note: '<strong>Feature (đặc trưng)</strong> — điểm thi giữa kỳ /100 (thi tuần 7). Tín hiệu mạnh nhất đang có trong tay.' },
              { name: 'pass_fail',     type: 'INT 0/1', key: 'TARGET', icon: '🎯',
                note: '<strong>Label (nhãn <code>y</code>)</strong> — kết cục Đậu/Rớt của khóa TRƯỚC, đáp án để model học. Với khóa mới, đây chính là ô trống cần DỰ ĐOÁN.' }
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
        mission: 'Lắp pipeline ML 4 dòng Python: nạp <code class="code">12 học viên</code> → tạo model → <code class="code">fit</code> → <code class="code">predict</code> cho học viên mới <code class="code">[7h · 90% · giữa kỳ 82]</code> — kéo thả khối lệnh xuống dưới ↓'
      },

      /* ----- STEP 2: 2 MCQ + mini-game T/E/P (spec C1-L1 Step 2: Check 1 + Check 2) ----- */
      step_2: {
        mcq: [
          {
            question: 'StudyLab muốn cảnh báo <strong>"học viên đang trên đà rớt"</strong> ngay ở tuần 8 — vừa có điểm giữa kỳ. Vì sao KHÔNG dùng được luật <code>if final_score >= 50</code>?',
            options: [
              { id: 'a', text: 'Vì Python không cho so sánh <code>>=</code> với số thực', correct: false, explanation: 'So sánh >= chạy bình thường với float. Vấn đề không nằm ở cú pháp.' },
              { id: 'b', text: 'Vì <code>final_score</code> CHƯA TỒN TẠI ở tuần 8 — phải HỌC pattern từ khóa trước để dự đoán', correct: true, explanation: 'Đúng — luật cần đáp án có sẵn. Tuần 8 mới có điểm giữa kỳ, còn final_score phải đợi thi cuối tuần 15; không có gì để so sánh thì chỉ còn cách học pattern từ dữ liệu lịch sử → đây là bài toán ML.' },
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
            { id: 'tep-early',   label: 'Cảnh báo ngay ở tuần 8' },
            { id: 'tep-history', label: '12 hồ sơ khóa trước + nhãn' },
            { id: 'tep-cols',    label: 'Bảng giờ học · điểm danh · giữa kỳ' },
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
                features: ['study_hours', 'attendance', 'midterm_score'], target: 'pass_fail',
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
                fail: { title: 'RỚT trung bình', vals: '≈ 2.2h · 58% · giữa kỳ 48', n: 'từ 6 hồ sơ Rớt' },
                pass: { title: 'ĐẬU trung bình', vals: '≈ 7.8h · 95% · giữa kỳ 86', n: 'từ 6 hồ sơ Đậu' }
              },
              narration: '<code>model.fit(X, y)</code>: model đọc 12 hồ sơ KÈM đáp án và kết tinh thành 2 <b>chân dung trung bình</b>. Toàn bộ "cái đã học" của model chỉ là 2 tấm thẻ này — không hơn.'
            },
            {
              zone: 'ml-predict', icon: '🔮', label: 'PREDICT', sub: 'Hồ sơ MỚI', result_kind: 'nearest',
              profile: '7h · 90% · giữa kỳ 82', dist: { pass: 6.2, fail: 47.6 }, verdict: '1 · ĐẬU',
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
          columns: ['study_hours', 'attendance', 'midterm_score', 'pass_fail'],
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
          expected: 'Console in <code>[1]</code> — học viên mới (7h · 90% · giữa kỳ 82) được dự đoán <strong>ĐẬU</strong>. Cả 4 tầng Checks phải xanh — kể cả khi hệ thống đổi X_new ngầm.'
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

    /* ═══════════ BÀI 2 — Bài toán ML này thuộc loại nào? (spec C1-L2 tr.13-17) ═══════════
       SỐ THẬT từ ml_lab.load_study_data_full (24 hv) — verify 2026-07-19:
       REG w=[5.476, 0.297, 0.257, −12.05] → X_new [6.5, 85, 74]: 35.6+25.2+19.0−12.0 = 67.7
       CLF centroid ĐẬU [7.42, 90.5, 81.5] RỚT [2.55, 59.8, 48.4]; Δ 9.3 vs 36.2 → 1·ĐẬU
       CLUSTER k=3: C0=9hv [2.2, 57.3, 46] · C1=5hv [5.1, 76.4, 65] · C2=10hv [8.0, 93.7, 85.2] */
    {
      id: 'c1_l2',
      index: 2,
      title: 'Bài toán ML này thuộc loại nào?',
      subtitle: 'Regression, Classification, Clustering — cùng 1 bảng dữ liệu',
      module: 10,
      module_title: 'M1 — Định khung bài toán ML',
      estimated_minutes: 19,
      xp_reward: 50,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      story: {
        tag: '🎓 StudyLab · Ticket #02',
        hook: 'Ticket #01 vừa đóng thì giáo vụ gửi tiếp <strong>Ticket #02</strong> — kèm tin vui: kho vừa bổ sung, giờ có <strong>24 hồ sơ khóa trước</strong>, đủ cả <code>final_score</code> lẫn <code>pass_fail</code> (khóa đó thi xong rồi). Họ hỏi 3 câu trên <strong>CÙNG một bảng</strong>: (1) học viên mới <code>[6.5h · 85% · giữa kỳ 74]</code> sẽ được <em>bao nhiêu ĐIỂM</em> cuối kỳ? (2) bạn ấy <em>ĐẬU hay RỚT</em>? (3) chia 24 học viên thành các <em>NHÓM hành vi học</em> để xếp lớp phụ đạo — mà chưa ai định nghĩa nhóm nào cả. 1 bảng — 3 câu hỏi — <strong>3 loại bài toán ML khác nhau</strong>. Chọn sai loại là trả lời sai câu hỏi.'
      },
      achievement: { name: 'ML Problem Framer — Chọn đúng loại', desc: 'phân biệt regression / classification / clustering' },

      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Phân biệt <strong>supervised vs unsupervised</strong> bằng đúng 1 câu hỏi: model CÓ HỌC TỪ TARGET không?',
            'Gọi đúng tên bài toán theo <strong>Ý NGHĨA target</strong>: số liên tục → regression, tên lớp → classification — kể cả khi lớp được mã hóa 0/1.',
            'Chạy 2 model thật trên cùng bảng và đọc kết quả clustering k=3 — hiểu vì sao <strong>ID cụm không có thứ tự</strong>.'
          ],
          defs: [
            { term: 'Regression', plain: 'Target là ĐẠI LƯỢNG liên tục (điểm số, số giờ…). Output = một số thực, có thể lệch ít hay nhiều.' },
            { term: 'Classification', plain: 'Target là TÊN LỚP (Đậu/Rớt…). Mã hóa bằng 0/1 vẫn là tên lớp — không có "0.5 lớp", không cộng trừ được.' },
            { term: 'Clustering', plain: 'KHÔNG dùng target — model tự tìm cấu trúc trong feature. ID cụm là tên tùy ý: đổi 0 ↔ 2 không đổi ý nghĩa.' }
          ]
        },
        primer: {
          goal: [
            'Supervised vs unsupervised',
            'Ý nghĩa target quyết định loại bài toán',
            '3 hợp đồng output từ cùng 1 bảng'
          ],
          intro: '',
          example: '🔍 <strong>Nhìn bảng SAMPLE DATA bên dưới:</strong> so cột <code>final_score</code> (26.8, 81.8, 18.5… — số nào cũng có thể xảy ra) với cột <code>pass_fail</code> (chỉ có đúng 2 giá trị 0/1 — tên của 2 lớp). Cùng lưu bằng SỐ, nhưng Ý NGHĨA khác hẳn nhau — và chính ý nghĩa đó quyết định loại bài toán. Giữ nhận xét này khi sang Bước 2 👇'
        },
        intro: 'Vẫn tuần 8, vẫn StudyLab — nhưng bảng dữ liệu giờ có <strong>24 hồ sơ</strong> với đủ 2 cột kết cục. Cùng một bảng, đặt 3 câu hỏi khác nhau sẽ ra 3 bài toán khác nhau: loại bài toán <em>không nằm trong dữ liệu</em> — nó nằm ở <strong>câu hỏi và target bạn chọn</strong>.',
        concept_cards: [
          {
            icon: 'fa-ruler',
            title: 'Target là SỐ → Regression',
            body: 'Hỏi "được BAO NHIÊU điểm?" — target <code>final_score</code> là đại lượng liên tục. Model trả về ước lượng số thực (67.7), có thể lệch 2 điểm hay 20 điểm. Sai số đo bằng ĐỘ LỆCH.'
          },
          {
            icon: 'fa-tags',
            title: 'Target là TÊN LỚP → Classification',
            body: 'Hỏi "ĐẬU hay RỚT?" — target <code>pass_fail</code> chỉ có 2 giá trị {0, 1}, và chúng là <strong>tên của 2 lớp</strong> dù được lưu bằng số. Model trả về nhãn. Không tồn tại "đậu 0.7 lớp" — chỉ đúng lớp hoặc sai lớp.'
          },
          {
            icon: 'fa-object-group',
            title: 'KHÔNG có target → Clustering',
            body: 'Hỏi "chia nhóm hành vi học?" — chưa ai gán nhãn nhóm cho bất kỳ học viên nào. Model tự tìm cấu trúc từ CHÍNH các feature, trả về ID cụm <strong>tùy ý</strong>. Lưu ý: bảng VẪN CÒN nguyên 2 cột kết cục — clustering CHỌN không dùng, chứ không phải dữ liệu thiếu.'
          }
        ],
        /* Hero = sim 3 luồng (user chốt 2026-07-19: bỏ dải timeline, 1 dòng nhắc tuần 8 nằm trong story) */
        paradigm_visual: {
          flows: [
            {
              id: 'reg',
              tag: '① DỰ ĐOÁN ĐIỂM',
              sub: 'target: final_score — SỐ liên tục',
              accent: '#38BDF8',
              nodes: [
                { icon: '🗂️', label: '24 hồ sơ khóa trước' },
                { icon: '🎯', label: 'y = final_score (17.4 → 93.7)' },
                { icon: '🧠', label: 'SimpleRegressor học đường khớp' },
                { icon: '🔢', label: 'X_new → ≈ 67.7 điểm', cls: 'good' }
              ],
              punch: 'Output là SỐ THỰC — có thể lệch ít hay nhiều → REGRESSION.'
            },
            {
              id: 'clf',
              tag: '② DỰ ĐOÁN ĐẬU/RỚT',
              sub: 'target: pass_fail — 0/1 là TÊN LỚP',
              accent: '#A78BFA',
              nodes: [
                { icon: '🗂️', label: 'CÙNG 24 hồ sơ đó' },
                { icon: '🎯', label: 'y = pass_fail ∈ {0, 1}' },
                { icon: '🧠', label: 'SimpleClassifier học 2 chân dung' },
                { icon: '🏷️', label: 'X_new → 1 · ĐẬU', cls: 'good' }
              ],
              punch: '0/1 chỉ là TÊN của 2 lớp — output là NHÃN → CLASSIFICATION.'
            },
            {
              id: 'clu',
              tag: '③ GOM NHÓM HÀNH VI',
              sub: 'KHÔNG dùng cột target nào · k = 3',
              accent: '#FBBF24',
              nodes: [
                { icon: '🗂️', label: 'CÙNG 24 hồ sơ đó' },
                { icon: '🚫', label: 'BỎ final_score & pass_fail ra' },
                { icon: '🧠', label: 'k=3 tự tìm cấu trúc' },
                { icon: '🎨', label: '3 nhóm: 9 · 5 · 10 học viên', cls: 'good' }
              ],
              punch: 'Không có nhãn nào để học — ID nhóm là tên TÙY Ý → CLUSTERING.'
            }
          ],
          so_keo: 'CÙNG một bảng — 3 hợp đồng output: số thực (67.7) · nhãn lớp (1·ĐẬU) · ID cụm (9/5/10). Loại bài toán không nằm trong dữ liệu — nó nằm ở CÂU HỎI bạn hỏi và TARGET bạn chọn.'
        },
        visual: {
          schema: {
            table_name: 'study_data (DataFrame)',
            columns: [
              { name: 'study_hours',   type: 'FLOAT',   key: '',       icon: '',
                note: '<strong>Feature (đặc trưng)</strong> — giờ tự học trung bình mỗi tuần. Cả 3 thí nghiệm đều dùng.' },
              { name: 'attendance',    type: 'FLOAT',   key: '',       icon: '',
                note: '<strong>Feature (đặc trưng)</strong> — % chuyên cần 8 tuần đầu. Cả 3 thí nghiệm đều dùng.' },
              { name: 'midterm_score', type: 'FLOAT',   key: '',       icon: '',
                note: '<strong>Feature (đặc trưng)</strong> — điểm giữa kỳ /100 (thi tuần 7). Cả 3 thí nghiệm đều dùng.' },
              { name: 'final_score',   type: 'FLOAT',   key: 'TARGET', icon: '📈',
                note: '<strong>Target của câu hỏi ①</strong> — SỐ liên tục 17.4→93.7 → bài toán REGRESSION. Khóa trước thi xong nên cột này tồn tại; khóa mới thì chưa. Thí nghiệm gom nhóm KHÔNG dùng cột này.' },
              { name: 'pass_fail',     type: 'INT 0/1', key: 'TARGET', icon: '🏷️',
                note: '<strong>Target của câu hỏi ②</strong> — 0/1 là TÊN 2 LỚP (Rớt/Đậu) dù lưu bằng số → bài toán CLASSIFICATION. Thí nghiệm gom nhóm KHÔNG dùng cột này.' }
            ]
          },
          /* 24 dòng = CHÍNH XÁC ml_lab.load_study_data_full (final_score 1 lẻ, 0=Rớt 1=Đậu) */
          data_preview: [
            ['2.0', '55', '45', '26.8', '0 · Rớt'],
            ['8.0', '95', '85', '81.8', '1 · Đậu'],
            ['1.0', '50', '40', '18.5', '0 · Rớt'],
            ['9.0', '98', '90', '89.4', '1 · Đậu'],
            ['3.0', '60', '50', '35.0', '0 · Rớt'],
            ['7.0', '92', '80', '74.1', '1 · Đậu'],
            ['2.5', '58', '48', '31.2', '0 · Rớt'],
            ['8.5', '96', '88', '85.6', '1 · Đậu'],
            ['4.0', '70', '60', '46.0', '0 · Rớt'],
            ['9.5', '99', '95', '93.7', '1 · Đậu'],
            ['1.5', '52', '42', '22.4', '0 · Rớt'],
            ['6.0', '88', '78', '66.9', '1 · Đậu'],
            ['5.0', '75', '65', '54.2', '1 · Đậu'],
            ['3.5', '65', '55', '40.5', '0 · Rớt'],
            ['7.5', '90', '82', '76.8', '1 · Đậu'],
            ['2.0', '62', '44', '28.6', '0 · Rớt'],
            ['6.5', '85', '72', '67.2', '1 · Đậu'],
            ['4.5', '72', '58', '48.8', '0 · Rớt'],
            ['8.0', '93', '86', '81.4', '1 · Đậu'],
            ['1.0', '48', '38', '17.4', '0 · Rớt'],
            ['5.5', '80', '70', '59.8', '1 · Đậu'],
            ['9.0', '97', '92', '89.6', '1 · Đậu'],
            ['3.0', '66', '52', '37.3', '0 · Rớt'],
            ['7.0', '89', '76', '72.2', '1 · Đậu']
          ]
        },
        mission: 'Ghép ĐÚNG CẶP model ↔ target: lắp <code class="code">6 dòng lệnh</code> cho 3 thí nghiệm trên cùng bảng 24 học viên — kho khối có <code class="code">mồi sai cặp 🪤</code>, lắp nhầm là bảng chấm chỉ ra ngay dòng lỗi ↓'
      },

      /* ----- STEP 2: 2 MCQ + mini-game hợp đồng output (spec C1-L2 Step 2) ----- */
      step_2: {
        mcq: [
          {
            question: 'Cột <code>pass_fail</code> được lưu bằng SỐ (0 và 1). Vì sao dự đoán pass_fail vẫn là <strong>CLASSIFICATION</strong> chứ không phải regression?',
            options: [
              { id: 'a', text: 'Vì số nguyên là classification, số thực mới là regression', correct: false, explanation: 'Sai — kiểu LƯU TRỮ không quyết định gì. Số giờ học 2, 3, 4 là số nguyên nhưng dự đoán nó vẫn là regression. Phải nhìn Ý NGHĨA.' },
              { id: 'b', text: 'Vì 0 và 1 ở đây là TÊN của 2 lớp — không tồn tại "0.5 lớp", không cộng trừ được', correct: true, explanation: 'Đúng — 0/1 là mã của {Rớt, Đậu}. Trung bình của Đậu và Rớt không có nghĩa; output hợp lệ chỉ có thể là 1 trong 2 tên lớp → classification.' },
              { id: 'c', text: 'Vì bảng chỉ có 24 dòng, quá ít cho regression', correct: false, explanation: 'Sĩ số không đổi được loại bài toán — 24 dòng vẫn chạy được cả 2 loại. Vấn đề nằm ở ý nghĩa target.' },
              { id: 'd', text: 'Vì SimpleRegressor báo lỗi khi gặp số 0/1', correct: false, explanation: 'Ngược lại mới nguy hiểm: regressor CHẠY ĐƯỢC trên 0/1 và trả về số vô nghĩa kiểu 0.7. Code chạy ≠ công thức hóa đúng — đây chính là bẫy của bài.' }
            ]
          },
          {
            question: 'Thí nghiệm gom nhóm (câu hỏi ③) vì sao KHÔNG đưa <code>final_score</code> / <code>pass_fail</code> vào?',
            options: [
              { id: 'a', text: 'Vì file dữ liệu không còn 2 cột đó nữa', correct: false, explanation: 'Bảng VẪN CÒN nguyên 5 cột — mở Sample Data ở Bước 1 mà xem. Clustering CHỌN không dùng target, không phải dữ liệu thiếu.' },
              { id: 'b', text: 'Vì clustering tìm cấu trúc từ CHÍNH các feature — không học từ nhãn, dù bảng vẫn còn nguyên 2 cột đó', correct: true, explanation: 'Chuẩn — unsupervised nghĩa là KHÔNG DÙNG target, một lựa chọn của người đặt bài toán chứ không phải giới hạn của dữ liệu.' },
              { id: 'c', text: 'Vì 2 cột đó bị lỗi, giá trị không tin được', correct: false, explanation: 'Dữ liệu sạch — chính 2 cột đó vừa làm target cho câu hỏi ① và ②. Vấn đề là gom nhóm không CẦN nhãn.' },
              { id: 'd', text: 'Vì k=3 chỉ cho phép dùng đúng 3 cột', correct: false, explanation: 'k là SỐ CỤM muốn chia, không liên quan số cột. Dùng 2 feature hay 10 feature thì k=3 vẫn chia 3 nhóm.' }
            ]
          }
        ],
        mini_game: {
          title: 'Nhìn OUTPUT đoán loại bài toán',
          instruction: 'Mỗi loại bài toán có một <strong>hợp đồng output</strong> riêng. Kéo 6 kết quả vào đúng ngăn: <strong>SỐ LIÊN TỤC</strong> · <strong>TÊN LỚP</strong> · <strong>ID CỤM TÙY Ý</strong>.',
          chips: [
            { id: 'out-score', label: '72.5 — ước lượng điểm cuối kỳ' },
            { id: 'out-fail',  label: 'Nhãn: "Rớt" (0)' },
            { id: 'out-ids',   label: '[2, 0, 1, 1, …] — ID nhóm, không có thứ tự' },
            { id: 'out-prob',  label: 'Xác suất đậu 0.83 → chốt nhãn "Đậu"' },
            { id: 'out-hours', label: '2.4 — số giờ ôn cần thêm mỗi tuần' },
            { id: 'out-sizes', label: '3 nhóm hành vi: 9 · 5 · 10 học viên' }
          ],
          bins: [
            { id: 'reg', label: 'REGRESSION — SỐ LIÊN TỤC', correct: 'true' },
            { id: 'clf', label: 'CLASSIFICATION — TÊN LỚP',  correct: 'true' },
            { id: 'clu', label: 'CLUSTERING — ID CỤM TÙY Ý', correct: 'true' }
          ],
          solution: {
            'out-score': 'reg',
            'out-fail':  'clf',
            'out-ids':   'clu',
            'out-prob':  'clf',
            'out-hours': 'reg',
            'out-sizes': 'clu'
          }
        }
      },

      /* ----- STEP 3: map 1 BẢNG → 3 NHÁNH (user chốt 2026-07-19) — trọng tâm GHÉP model↔target,
         kho khối có 3 MỒI sai cặp; regressor/classifier đã khởi tạo sẵn trong lab. ----- */
      step_3: {
        ml_pipeline: true,
        blocks: [
          { type: 'py', token: 'regressor.fit(X, y_score)',              slot: 'b1' },
          { type: 'py', token: 'pred_score = regressor.predict(X_new)',  slot: 'b2' },
          { type: 'py', token: 'classifier.fit(X, y_label)',             slot: 'b3' },
          { type: 'py', token: 'pred_label = classifier.predict(X_new)', slot: 'b4' },
          { type: 'py', token: 'clusterer = SimpleClusterer(k=3)',       slot: 'b5' },
          { type: 'py', token: 'clusters = clusterer.fit_predict(X)',    slot: 'b6' },
          /* 3 mồi bẫy — sai CẶP model↔target (unsafe-but-correct của spec) */
          { type: 'py', token: 'regressor.fit(X, y_label)',              slot: 't1' },
          { type: 'py', token: 'classifier.fit(X, y_score)',             slot: 't2' },
          { type: 'py', token: 'clusters = clusterer.fit_predict(X, y_label)', slot: 't3' }
        ],
        drop_zones: [
          { id: 'ml2-regfit',  accepts: ['py'], multi: true },
          { id: 'ml2-regpred', accepts: ['py'], multi: true },
          { id: 'ml2-clffit',  accepts: ['py'], multi: true },
          { id: 'ml2-clfpred', accepts: ['py'], multi: true },
          { id: 'ml2-clu',     accepts: ['py'], multi: true },
          { id: 'ml2-clupred', accepts: ['py'], multi: true }
        ],
        ml_flow: {
          brand: 'BẢN ĐỒ 3 THÍ NGHIỆM — 1 BẢNG',
          layout: 'branch',
          run_label: '▶ Chạy 3 thí nghiệm',
          source: { sub: '24 học viên khóa trước · 3 feature + 2 cột kết cục' },
          done_note: '3 hợp đồng output — từ CÙNG một bảng. Click lại nhánh bất kỳ để mổ xẻ; rồi sang Bước 4 tự viết code cho 2 nhánh supervised.',
          stations: [
            {
              zones: ['ml2-regfit', 'ml2-regpred'],
              icon: '🔢', label: 'REGRESSION', sub: 'y = final_score (SỐ)', result_kind: 'reg_sum',
              reg: {
                xnew: '6.5h · 85% · giữa kỳ 74',
                parts: [
                  { label: '6.5h × 5.48',  val: 35.6 },
                  { label: '85% × 0.30',   val: 25.2 },
                  { label: '74đ × 0.26',   val: 19.0 },
                  { label: 'gốc (bias)',   val: -12.0 }
                ],
                total: '≈ 67.7 điểm'
              },
              narration: '<code>regressor.fit(X, y_score)</code> khớp một ĐƯỜNG THẲNG qua 24 hồ sơ: mỗi feature nhận một trọng số. Dự đoán = cộng các đóng góp: 35.6 + 25.2 + 19.0 − 12.0 = <b>67.7 điểm</b>. Output là SỐ THỰC — lệch 2 hay 20 điểm đều có thể.'
            },
            {
              zones: ['ml2-clffit', 'ml2-clfpred'],
              icon: '🏷️', label: 'CLASSIFICATION', sub: 'y = pass_fail (TÊN LỚP)', result_kind: 'nearest',
              profile: '6.5h · 85% · giữa kỳ 74', dist: { pass: 9.3, fail: 36.2 }, verdict: '1 · ĐẬU',
              narration: '<code>classifier.fit(X, y_label)</code> kết tinh 24 hồ sơ thành 2 chân dung: ĐẬU ≈ 7.4h · 91% · giữa kỳ 81 vs RỚT ≈ 2.6h · 60% · giữa kỳ 48. Hồ sơ mới đo khoảng cách: Δ ĐẬU ≈ <b>9.3</b> vs Δ RỚT ≈ <b>36.2</b> → nhãn <b>1 · ĐẬU</b>. Output là TÊN LỚP — không phải con số để cộng trừ.'
            },
            {
              zones: ['ml2-clu', 'ml2-clupred'],
              icon: '🎨', label: 'CLUSTERING', sub: 'KHÔNG dùng target · k=3', result_kind: 'clusters',
              clusters: {
                banned: ['final_score', 'pass_fail'],
                labels: [0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 2, 1, 0, 2, 0, 1, 1, 2, 0, 1, 2, 0, 2],
                groups: [
                  { id: 0, n: 9,  center: '2.2h · 57% · giữa kỳ 46' },
                  { id: 1, n: 5,  center: '5.1h · 76% · giữa kỳ 65' },
                  { id: 2, n: 10, center: '8.0h · 94% · giữa kỳ 85' }
                ],
                note: 'ID cụm là tên TÙY Ý — đổi tên 0 ↔ 2 không thay đổi ý nghĩa nhóm.'
              },
              narration: '<code>clusterer.fit_predict(X)</code> chỉ nhìn 3 cột feature — 2 cột kết cục bị GẠCH BỎ dù vẫn nằm trong bảng. k=3 tự chia 24 học viên thành 3 nhóm <b>9 · 5 · 10</b> theo độ giống nhau. ID 0/1/2 là tên tùy ý: không nhóm nào "lớn hơn" nhóm nào.'
            }
          ]
        },
        expected_sql: 'regressor.fit(X, y_score) pred_score = regressor.predict(X_new) classifier.fit(X, y_label) pred_label = classifier.predict(X_new) clusterer = SimpleClusterer(k=3) clusters = clusterer.fit_predict(X)',
        expected_zones: {
          'ml2-regfit':  'regressor.fit(X, y_score)',
          'ml2-regpred': 'pred_score = regressor.predict(X_new)',
          'ml2-clffit':  'classifier.fit(X, y_label)',
          'ml2-clfpred': 'pred_label = classifier.predict(X_new)',
          'ml2-clu':     'clusterer = SimpleClusterer(k=3)',
          'ml2-clupred': 'clusters = clusterer.fit_predict(X)'
        },
        reveal_hints: {
          'ml2-regfit':  'Regressor học đại lượng LIÊN TỤC → fit với <strong>y_score</strong>.',
          'ml2-regpred': 'Dự đoán điểm cho hồ sơ mới: <strong>pred_score = regressor.predict(X_new)</strong>.',
          'ml2-clffit':  'Classifier học TÊN LỚP → fit với <strong>y_label</strong>.',
          'ml2-clfpred': 'Dự đoán nhãn cho CÙNG hồ sơ: <strong>pred_label = classifier.predict(X_new)</strong>.',
          'ml2-clu':     'Gom nhóm cần khai số cụm: <strong>clusterer = SimpleClusterer(k=3)</strong>.',
          'ml2-clupred': 'Clustering KHÔNG nhận target: <strong>clusters = clusterer.fit_predict(X)</strong> — chỉ X thôi.'
        }
      },

      drag_map: {
        brand: 'BẢN ĐỒ 3 THÍ NGHIỆM — 1 BẢNG',
        table_sub: 'DataFrame nguồn · 24 học viên',
        idle_sub: '24 học viên · ▶ chạy để xem 3 hợp đồng output',
        run_label: '▶ Chạy 3 thí nghiệm',
        table: {
          name: 'study_data',
          columns: ['study_hours', 'attendance', 'midterm_score', 'final_score', 'pass_fail'],
          dataRows: [
            ['2.0', '55', '45', '26.8', '0'],
            ['8.0', '95', '85', '81.8', '1'],
            ['1.0', '50', '40', '18.5', '0'],
            ['9.0', '98', '90', '89.4', '1'],
            ['3.0', '60', '50', '35.0', '0'],
            ['7.0', '92', '80', '74.1', '1'],
            ['2.5', '58', '48', '31.2', '0'],
            ['8.5', '96', '88', '85.6', '1'],
            ['4.0', '70', '60', '46.0', '0'],
            ['9.5', '99', '95', '93.7', '1'],
            ['1.5', '52', '42', '22.4', '0'],
            ['6.0', '88', '78', '66.9', '1'],
            ['5.0', '75', '65', '54.2', '1'],
            ['3.5', '65', '55', '40.5', '0'],
            ['7.5', '90', '82', '76.8', '1'],
            ['2.0', '62', '44', '28.6', '0'],
            ['6.5', '85', '72', '67.2', '1'],
            ['4.5', '72', '58', '48.8', '0'],
            ['8.0', '93', '86', '81.4', '1'],
            ['1.0', '48', '38', '17.4', '0'],
            ['5.5', '80', '70', '59.8', '1'],
            ['9.0', '97', '92', '89.6', '1'],
            ['3.0', '66', '52', '37.3', '0'],
            ['7.0', '89', '76', '72.2', '1']
          ]
        }
      },

      /* ----- STEP 4: viết TRỌN script 2 nhánh supervised (spec: clustering chỉ đọc ở Bước 3) —
         câu hỏi KHÁC Bước 3 (anti-boredom): Bước 3 ghép cặp, Bước 4 tự viết từ đầu. ----- */
      step_4: {
        prompt: 'Bước 3 bạn đã ghép đúng cặp model–target. Giờ viết <strong>bản code thật</strong> cho 2 nhánh supervised: <code>SimpleRegressor</code> học <code>y_score</code>, <code>SimpleClassifier</code> học <code>y_label</code>, cả hai cùng predict một <code>X_new</code> — và hệ thống sẽ <strong>đổi X_new ngầm</strong> khi chấm. In cả 2 kết quả.',
        context: {
          scenario: 'Giáo vụ cần trả lời câu hỏi ① và ② cho MỌI học viên mới, không riêng hồ sơ demo. Hidden test đổi X_new — viết đúng quy trình thì kết quả vẫn hợp lệ với bất kỳ hồ sơ nào. Clustering (câu hỏi ③) không cần code lại — bạn đã đọc nó ở Bước 3.',
          real_world: 'Đây là một hồ sơ vay ngân hàng: cùng 1 bảng khách hàng, hỏi "cho vay được BAO NHIÊU tiền?" là regression, hỏi "DUYỆT hay TỪ CHỐI?" là classification. Ghép nhầm cặp — bắt regressor học nhãn duyệt/từ chối 0/1 — code vẫn chạy và trả về "0.7": không phải số tiền, cũng chẳng phải quyết định. Sai từ công thức hóa thì mọi con số sau đó đều vô nghĩa.',
          steps: [
            'Import 2 model + hàm nạp dữ liệu từ <code>ml_lab</code>.',
            'Nạp 4 biến: bảng feature, 2 target khả dĩ, hồ sơ mới.',
            'Nhánh ĐIỂM: tạo model — huấn luyện với target SỐ — dự đoán hồ sơ mới.',
            'Nhánh ĐẬU/RỚT: tạo model — huấn luyện với target NHÃN — dự đoán CÙNG hồ sơ.',
            'In cả 2 kết quả · Run chạy thử · Submit chấm 4 tầng.'
          ],
          hint_explore: 'Muốn thấy 2 target khác nhau thế nào? Gõ <code>print(y_score[:5])</code> và <code>print(y_label[:5])</code> rồi <strong>Run</strong> — một bên số lẻ liên tục, một bên chỉ 0/1.',
          expected: 'Console in ≈ <code>[67.7]</code> (điểm ước lượng — số thực) và <code>[1]</code> (nhãn Đậu). Cả 4 tầng Checks xanh — kể cả khi hệ thống đổi X_new ngầm.'
        },
        hints: [
          { level: 1, text: 'Chính là 2 pipeline kiểu Bài 1 chạy song song trên CÙNG bảng — khác nhau đúng một chỗ: TARGET đưa vào fit.' },
          { level: 2, text: 'Dòng 1: <code>from ml_lab import load_study_data_full, SimpleRegressor, SimpleClassifier</code>. Dòng 2: <code>X, y_score, y_label, X_new = load_study_data_full()</code>.' },
          { level: 3, text: 'Regressor fit với <strong>y_score</strong> (số liên tục), classifier fit với <strong>y_label</strong> (tên lớp) — rồi cả hai <code>predict(X_new)</code>. Lỡ hoán đổi 2 target: code vẫn CHẠY nhưng tầng Risk sẽ bắt và giải thích.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>from ml_lab import load_study_data_full, SimpleRegressor, SimpleClassifier<br>X, y_score, y_label, X_new = load_study_data_full()<br>regressor = SimpleRegressor()<br>regressor.fit(X, y_score)<br>print(regressor.predict(X_new))<br>classifier = SimpleClassifier()<br>classifier.fit(X, y_label)<br>print(classifier.predict(X_new))</code>' }
        ],
        grader_fn: 'grade_lesson2',
        success_message: 'Cùng 1 bảng — 2 hợp đồng output: 67.7 (số thực) và 1 (tên lớp). Chọn loại bài toán = chọn target và Ý NGHĨA của nó, không phải nhìn kiểu dữ liệu lưu trữ. Bài 3: bảng thô 200 dòng trong mắt model — X và y.',
        xp_reward: 50
      }
    },

    /* ── Bài 3-15: stub chờ rollout theo module (shell hiện màn "đang cập nhật") ── */
    /* ═══════════ BÀI 3 — Dataset trong mắt model — X và y (spec C1-L3 tr.18-21) ═══════════
       SỐ THẬT từ ml_lab.load_student_dataframe (seed 4242, 200 dòng) — verify 2026-07-19:
       shape (200, 5) · X (200, 3) · y_A = pass_fail int 0/1 (56 Rớt / 144 Đậu) · y_B = final_score float
       Cột đổi tên quiz_score → midterm_score (user chốt — deviation spec API, ghi doc audit). */
    {
      id: 'c1_l3',
      index: 3,
      title: 'Dataset trong mắt model — X và y',
      subtitle: 'Bảng thô, ma trận feature X, vector target y — và leakage',
      module: 10,
      module_title: 'M1 — Định khung bài toán ML',
      estimated_minutes: 19,
      xp_reward: 50,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      story: {
        tag: '🎓 StudyLab · Ticket #03',
        hook: 'Hai ticket đầu chạy trên 12 rồi 24 hồ sơ demo. Giờ phòng đào tạo mở <strong>kho thật</strong>: <code>student_history</code> — <strong>200 học viên</strong> nhiều khóa trước, 5 cột kèm đơn vị rõ ràng. Ticket #03 không hỏi dự đoán gì mới — nó đòi thứ nền móng hơn: <em>"trước khi build thêm model nào, hãy chốt <strong>HỢP ĐỒNG DỮ LIỆU</strong>: cột nào vào <code>X</code> cho model nhìn, cột nào là đáp án <code>y</code>, cột nào phải BỎ — cho từng nhiệm vụ."</em> Chọn sai 1 cột thôi: model "chính xác 99%" trong phòng thí nghiệm nhưng vô dụng ngoài đời — vì nó <strong>cầm sẵn đáp án</strong> hoặc <strong>nhìn trộm tương lai</strong>.'
      },
      achievement: { name: 'ML Problem Framer — Hợp đồng X/y', desc: 'tách X/y đúng nhiệm vụ, không leakage' },

      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Đọc bảng dữ liệu đúng cách model nhìn: <strong>dòng = sample</strong>, <strong>cột = attribute</strong>, <strong>ô = value</strong>.',
            'Gán vai trò <strong>Feature / Target / Bỏ</strong> cho từng cột THEO NHIỆM VỤ — và thấy cùng một cột đổi vai khi nhiệm vụ đổi.',
            'Tách <code>X</code> (200×3) và <code>y</code> (200,) bằng Pandas mà không dính <strong>leakage</strong> — lỗi âm thầm nguy hiểm nhất của ML.'
          ],
          defs: [
            { term: 'Feature matrix X', plain: 'Phần của bảng mà model ĐƯỢC NHÌN khi dự đoán — N dòng × D cột feature. Bài này: X (200 × 3).' },
            { term: 'Target vector y', plain: 'Cột đáp án model phải học — mỗi dòng đúng 1 giá trị, shape (N,). Kiểu của y đổi theo nhiệm vụ: 0/1 hay số thực.' },
            { term: 'Leakage (rò rỉ)', plain: 'X chứa thông tin lẽ ra KHÔNG được biết lúc dự đoán: chính đáp án (target leak) hoặc dữ liệu tương lai (future leak). Code vẫn chạy, điểm ảo rất cao — ra đời thật thì sập.' }
          ]
        },
        primer: {
          goal: [
            'Dòng / cột / ô — 3 tầng của bảng',
            'Vai trò cột đi theo nhiệm vụ',
            'Tách X, y bằng Pandas — không leakage'
          ],
          intro: '',
          example: '🔍 <strong>Bấm cột <code>pass_fail</code> trong SCHEMA EXPLORER bên dưới:</strong> phân bố thật trên đúng 200 dòng — 56 Rớt · 144 Đậu. Rồi bấm <code>final_score</code>: để ý ghi chú của nó nói gì về chuyện được/không được cho vào X. Hai cột này là nhân vật chính của cả bài 👇'
        },
        intro: 'Bảng thô KHÔNG phải thứ model ăn trực tiếp. Với mỗi nhiệm vụ, ta phải TÁCH nó thành <code>X</code> (cái model được nhìn) và <code>y</code> (đáp án cần học) — phần còn lại BỎ. Bài này dạy cách tách đúng, và 2 cái bẫy khiến hợp đồng dữ liệu sai mà code vẫn chạy êm.',
        concept_cards: [
          {
            icon: 'fa-table',
            title: 'Bảng thô ≠ X / y',
            body: 'DataFrame là cái KHO: 200 dòng × 5 cột, chứa mọi thứ từng ghi được. Model không ăn cả kho — nó ăn <code>X</code> (200×3 feature được chọn) và học từ <code>y</code> (200 đáp án). Tách kho thành X/y = bước đầu của MỌI dự án ML.'
          },
          {
            icon: 'fa-rotate',
            title: 'Vai trò cột KHÔNG cố định',
            body: 'Nhiệm vụ A (cảnh báo sớm): <code>pass_fail</code> là target, <code>final_score</code> phải BỎ. Nhiệm vụ B (đoán điểm): <code>final_score</code> thành target, <code>pass_fail</code> bị bỏ. CÙNG một cột — vai trò do CÂU HỎI quyết định, không phải bẩm sinh.'
          },
          {
            icon: 'fa-user-secret',
            title: 'Leakage — sai mà chạy êm',
            body: '2 kiểu rò rỉ: nhét <code>pass_fail</code> vào X = đưa sẵn ĐÁP ÁN (target leak); nhét <code>final_score</code> vào X khi cảnh báo sớm = nhìn trộm TƯƠNG LAI (future leak — tuần 8 nó chưa tồn tại). Cả hai đều cho model "chính xác" ảo trong lab và sụp đổ ngoài đời.'
          }
        ],
        /* Hero = ỐNG KÍNH BẢNG (user chốt 2026-07-19): bấm DÒNG/CỘT/Ô trên 8 dòng đầu THẬT */
        table_lens: {
          title: 'ỐNG KÍNH BẢNG — BẤM VÀO 3 TẦNG',
          intro: 'Đây là 8 dòng đầu của bảng thật. Bấm 1 <b>số thứ tự</b> đầu dòng, 1 <b>tên cột</b>, và 1 <b>ô giá trị</b> — đủ 3 tầng để mở khóa.',
          columns: [
            { name: 'study_hours',   unit: 'giờ/tuần' },
            { name: 'attendance',    unit: '%' },
            { name: 'midterm_score', unit: '/100' },
            { name: 'final_score',   unit: '/100' },
            { name: 'pass_fail',     unit: '0=Rớt · 1=Đậu' }
          ],
          rows: [
            ['3.6', '41', '37', '40', '0'],
            ['9.4', '82', '91', '97', '1'],
            ['9.2', '49', '76', '72', '1'],
            ['3.2', '96', '39', '49', '0'],
            ['7.9', '89', '83', '89', '1'],
            ['6.7', '97', '80', '87', '1'],
            ['5.5', '47', '54', '59', '1'],
            ['3.7', '87', '43', '67', '1']
          ],
          total_rows: 200,
          tasks: {
            row: '1 DÒNG = 1 <b>SAMPLE</b> — một học viên được ghi TRỌN VẸN: đủ cả 5 thuộc tính của đúng người đó. Model học từ từng dòng một.',
            col: '1 CỘT = 1 <b>ATTRIBUTE</b> — một thuộc tính đo trên MỌI học viên, cùng đơn vị (ghi ngay dưới tên cột).',
            cell: '1 Ô = 1 <b>VALUE</b> — giá trị của đúng 1 thuộc tính, trên đúng 1 học viên.'
          },
          done: '✅ Đủ 3 tầng! Bảng thật có <b>200 dòng = 200 SAMPLE</b> — 200 học viên đã được ghi nhận đầy đủ. Câu hỏi tiếp theo của bài: trong 5 cột kia, cột nào model ĐƯỢC nhìn, cột nào là ĐÁP ÁN?'
        },
        visual: {
          schema: {
            table_name: 'student_history (DataFrame)',
            columns: [
              { name: 'study_hours',   type: 'FLOAT · giờ/tuần', key: '', icon: '',
                note: '<strong>Feature (đặc trưng)</strong> — giờ tự học trung bình mỗi tuần, quan sát được NGAY ở tuần 8. Luôn nằm trong X của cả 2 nhiệm vụ.' },
              { name: 'attendance',    type: 'FLOAT · %', key: '', icon: '',
                note: '<strong>Feature (đặc trưng)</strong> — % chuyên cần 8 tuần đầu. Vào X cùng 2 cột kia.' },
              { name: 'midterm_score', type: 'FLOAT · /100', key: '', icon: '',
                note: '<strong>Feature (đặc trưng)</strong> — điểm giữa kỳ (thi tuần 7), vừa chấm xong nên DÙNG ĐƯỢC. Tín hiệu mạnh nhất trong X.' },
              { name: 'final_score',   type: 'FLOAT · /100', key: 'TARGET', icon: '📈',
                note: '<strong>Target của nhiệm vụ B</strong> (đoán điểm — y kiểu float). Nhưng với nhiệm vụ A cảnh báo sớm, đây là <strong>TƯƠNG LAI</strong>: tuần 8 nó chưa tồn tại — cho vào X là future leak, phải BỎ.' },
              { name: 'pass_fail',     type: 'INT 0/1', key: 'TARGET', icon: '🏷️',
                note: '<strong>Target của nhiệm vụ A</strong> (cảnh báo sớm — y kiểu int 0/1; phân bố thật: 56 Rớt · 144 Đậu). Cho vào X là <strong>target leak</strong> — model "dự đoán" bằng chính đáp án. Nó cũng SINH RA từ final_score (≥ 50).' }
            ]
          },
          /* 200 dòng = CHÍNH XÁC ml_lab.load_student_dataframe(seed 4242) */
          data_preview: [
            ['3.6', '41', '37', '40', '0 · Rớt'],
            ['9.4', '82', '91', '97', '1 · Đậu'],
            ['9.2', '49', '76', '72', '1 · Đậu'],
            ['3.2', '96', '39', '49', '0 · Rớt'],
            ['7.9', '89', '83', '89', '1 · Đậu'],
            ['6.7', '97', '80', '87', '1 · Đậu'],
            ['5.5', '47', '54', '59', '1 · Đậu'],
            ['3.7', '87', '43', '67', '1 · Đậu'],
            ['7.4', '84', '70', '84', '1 · Đậu'],
            ['5.5', '53', '55', '51', '1 · Đậu'],
            ['6.1', '76', '67', '72', '1 · Đậu'],
            ['1.8', '94', '36', '46', '0 · Rớt'],
            ['5.2', '89', '32', '60', '1 · Đậu'],
            ['2.3', '78', '7', '25', '0 · Rớt'],
            ['0.7', '83', '19', '35', '0 · Rớt'],
            ['9.6', '94', '64', '91', '1 · Đậu'],
            ['6.5', '91', '69', '82', '1 · Đậu'],
            ['6.5', '95', '57', '71', '1 · Đậu'],
            ['8.0', '87', '79', '87', '1 · Đậu'],
            ['6.4', '46', '49', '63', '1 · Đậu'],
            ['3.7', '90', '28', '39', '0 · Rớt'],
            ['3.3', '91', '39', '50', '1 · Đậu'],
            ['5.0', '50', '51', '50', '1 · Đậu'],
            ['1.5', '83', '50', '36', '0 · Rớt'],
            ['8.2', '89', '62', '74', '1 · Đậu'],
            ['7.0', '86', '82', '81', '1 · Đậu'],
            ['0.7', '97', '10', '31', '0 · Rớt'],
            ['8.6', '53', '66', '74', '1 · Đậu'],
            ['2.6', '44', '38', '30', '0 · Rớt'],
            ['9.3', '40', '89', '90', '1 · Đậu'],
            ['6.0', '50', '59', '67', '1 · Đậu'],
            ['2.4', '68', '41', '44', '0 · Rớt'],
            ['9.8', '81', '75', '84', '1 · Đậu'],
            ['7.6', '51', '70', '62', '1 · Đậu'],
            ['4.8', '71', '60', '72', '1 · Đậu'],
            ['3.9', '54', '41', '47', '0 · Rớt'],
            ['3.7', '51', '41', '38', '0 · Rớt'],
            ['6.7', '66', '85', '79', '1 · Đậu'],
            ['8.7', '44', '82', '83', '1 · Đậu'],
            ['6.8', '85', '72', '77', '1 · Đậu'],
            ['8.9', '59', '70', '87', '1 · Đậu'],
            ['5.1', '55', '43', '51', '1 · Đậu'],
            ['8.6', '52', '84', '89', '1 · Đậu'],
            ['0.8', '77', '42', '41', '0 · Rớt'],
            ['8.8', '57', '77', '72', '1 · Đậu'],
            ['7.9', '68', '77', '76', '1 · Đậu'],
            ['9.1', '68', '94', '95', '1 · Đậu'],
            ['5.5', '69', '41', '58', '1 · Đậu'],
            ['9.8', '74', '75', '85', '1 · Đậu'],
            ['9.0', '68', '77', '84', '1 · Đậu'],
            ['9.4', '57', '64', '72', '1 · Đậu'],
            ['6.0', '63', '64', '67', '1 · Đậu'],
            ['0.8', '84', '14', '35', '0 · Rớt'],
            ['2.0', '100', '30', '41', '0 · Rớt'],
            ['1.4', '75', '41', '37', '0 · Rớt'],
            ['2.2', '41', '56', '38', '0 · Rớt'],
            ['5.8', '83', '30', '60', '1 · Đậu'],
            ['5.6', '54', '56', '63', '1 · Đậu'],
            ['2.7', '64', '24', '42', '0 · Rớt'],
            ['5.6', '61', '55', '57', '1 · Đậu'],
            ['5.4', '98', '37', '62', '1 · Đậu'],
            ['6.5', '99', '59', '73', '1 · Đậu'],
            ['1.9', '49', '18', '19', '0 · Rớt'],
            ['5.8', '96', '61', '68', '1 · Đậu'],
            ['2.5', '68', '29', '47', '0 · Rớt'],
            ['1.6', '56', '25', '32', '0 · Rớt'],
            ['1.6', '84', '33', '25', '0 · Rớt'],
            ['7.5', '73', '56', '76', '1 · Đậu'],
            ['7.7', '100', '66', '82', '1 · Đậu'],
            ['3.4', '74', '64', '58', '1 · Đậu'],
            ['8.4', '74', '74', '99', '1 · Đậu'],
            ['6.3', '71', '62', '67', '1 · Đậu'],
            ['5.0', '88', '37', '57', '1 · Đậu'],
            ['7.6', '52', '62', '75', '1 · Đậu'],
            ['10.0', '85', '88', '92', '1 · Đậu'],
            ['8.0', '88', '79', '74', '1 · Đậu'],
            ['1.7', '85', '28', '40', '0 · Rớt'],
            ['5.5', '91', '61', '69', '1 · Đậu'],
            ['8.9', '52', '72', '83', '1 · Đậu'],
            ['5.4', '77', '53', '65', '1 · Đậu'],
            ['3.0', '92', '39', '53', '1 · Đậu'],
            ['5.5', '92', '64', '75', '1 · Đậu'],
            ['9.1', '95', '76', '94', '1 · Đậu'],
            ['1.4', '91', '22', '31', '0 · Rớt'],
            ['6.4', '96', '58', '81', '1 · Đậu'],
            ['9.1', '44', '70', '69', '1 · Đậu'],
            ['9.3', '81', '80', '90', '1 · Đậu'],
            ['3.5', '61', '27', '38', '0 · Rớt'],
            ['4.4', '99', '39', '52', '1 · Đậu'],
            ['2.5', '86', '27', '39', '0 · Rớt'],
            ['4.8', '52', '41', '64', '1 · Đậu'],
            ['3.8', '61', '42', '48', '0 · Rớt'],
            ['3.7', '44', '51', '48', '0 · Rớt'],
            ['4.1', '98', '26', '49', '0 · Rớt'],
            ['6.4', '55', '39', '53', '1 · Đậu'],
            ['9.9', '86', '88', '97', '1 · Đậu'],
            ['3.8', '80', '55', '51', '1 · Đậu'],
            ['5.9', '54', '85', '68', '1 · Đậu'],
            ['3.8', '97', '32', '52', '1 · Đậu'],
            ['2.2', '61', '41', '44', '0 · Rớt'],
            ['7.4', '45', '86', '83', '1 · Đậu'],
            ['7.6', '99', '75', '97', '1 · Đậu'],
            ['9.3', '77', '78', '81', '1 · Đậu'],
            ['4.1', '70', '40', '56', '1 · Đậu'],
            ['2.3', '84', '35', '43', '0 · Rớt'],
            ['7.6', '87', '67', '91', '1 · Đậu'],
            ['8.6', '72', '63', '86', '1 · Đậu'],
            ['6.0', '87', '41', '62', '1 · Đậu'],
            ['8.8', '67', '74', '76', '1 · Đậu'],
            ['8.2', '92', '62', '80', '1 · Đậu'],
            ['6.4', '78', '66', '80', '1 · Đậu'],
            ['1.4', '57', '34', '46', '0 · Rớt'],
            ['8.9', '48', '71', '80', '1 · Đậu'],
            ['0.6', '41', '18', '26', '0 · Rớt'],
            ['2.5', '51', '39', '49', '0 · Rớt'],
            ['8.3', '56', '71', '81', '1 · Đậu'],
            ['5.2', '56', '44', '56', '1 · Đậu'],
            ['8.6', '58', '69', '89', '1 · Đậu'],
            ['6.4', '60', '61', '65', '1 · Đậu'],
            ['2.6', '99', '36', '49', '0 · Rớt'],
            ['4.8', '70', '72', '61', '1 · Đậu'],
            ['0.6', '71', '34', '44', '0 · Rớt'],
            ['6.7', '75', '59', '69', '1 · Đậu'],
            ['3.9', '90', '48', '52', '1 · Đậu'],
            ['7.0', '81', '56', '66', '1 · Đậu'],
            ['7.0', '59', '31', '63', '1 · Đậu'],
            ['4.3', '94', '60', '65', '1 · Đậu'],
            ['9.9', '45', '100', '88', '1 · Đậu'],
            ['8.9', '73', '99', '91', '1 · Đậu'],
            ['7.4', '42', '69', '68', '1 · Đậu'],
            ['5.8', '48', '56', '54', '1 · Đậu'],
            ['7.7', '41', '83', '71', '1 · Đậu'],
            ['6.0', '42', '46', '51', '1 · Đậu'],
            ['6.9', '71', '51', '67', '1 · Đậu'],
            ['2.2', '46', '47', '40', '0 · Rớt'],
            ['8.6', '78', '59', '70', '1 · Đậu'],
            ['4.8', '49', '49', '55', '1 · Đậu'],
            ['9.4', '69', '61', '89', '1 · Đậu'],
            ['2.3', '98', '38', '48', '0 · Rớt'],
            ['3.2', '84', '27', '45', '0 · Rớt'],
            ['9.7', '48', '86', '90', '1 · Đậu'],
            ['9.3', '90', '75', '89', '1 · Đậu'],
            ['4.7', '83', '45', '63', '1 · Đậu'],
            ['5.6', '45', '64', '63', '1 · Đậu'],
            ['3.5', '70', '22', '45', '0 · Rớt'],
            ['7.2', '92', '53', '69', '1 · Đậu'],
            ['3.9', '86', '44', '53', '1 · Đậu'],
            ['8.4', '96', '81', '98', '1 · Đậu'],
            ['6.5', '66', '48', '58', '1 · Đậu'],
            ['5.8', '87', '67', '74', '1 · Đậu'],
            ['9.1', '75', '76', '88', '1 · Đậu'],
            ['5.7', '67', '52', '67', '1 · Đậu'],
            ['5.0', '66', '54', '61', '1 · Đậu'],
            ['8.7', '55', '72', '85', '1 · Đậu'],
            ['7.5', '73', '83', '75', '1 · Đậu'],
            ['0.8', '94', '39', '41', '0 · Rớt'],
            ['2.3', '49', '31', '39', '0 · Rớt'],
            ['4.7', '52', '32', '40', '0 · Rớt'],
            ['2.0', '45', '47', '33', '0 · Rớt'],
            ['7.8', '71', '54', '62', '1 · Đậu'],
            ['9.5', '58', '63', '77', '1 · Đậu'],
            ['5.2', '67', '34', '52', '1 · Đậu'],
            ['7.3', '71', '65', '73', '1 · Đậu'],
            ['7.0', '87', '56', '74', '1 · Đậu'],
            ['9.0', '83', '65', '84', '1 · Đậu'],
            ['9.3', '51', '78', '88', '1 · Đậu'],
            ['1.1', '95', '25', '42', '0 · Rớt'],
            ['0.7', '100', '2', '31', '0 · Rớt'],
            ['2.6', '94', '43', '51', '1 · Đậu'],
            ['9.4', '60', '86', '95', '1 · Đậu'],
            ['0.8', '62', '22', '32', '0 · Rớt'],
            ['2.6', '60', '16', '33', '0 · Rớt'],
            ['8.0', '69', '52', '62', '1 · Đậu'],
            ['9.7', '95', '73', '100', '1 · Đậu'],
            ['8.4', '80', '71', '79', '1 · Đậu'],
            ['5.5', '99', '48', '64', '1 · Đậu'],
            ['5.2', '98', '52', '63', '1 · Đậu'],
            ['1.6', '93', '23', '38', '0 · Rớt'],
            ['10.0', '81', '86', '99', '1 · Đậu'],
            ['5.9', '93', '45', '60', '1 · Đậu'],
            ['2.1', '80', '44', '47', '0 · Rớt'],
            ['6.5', '83', '68', '72', '1 · Đậu'],
            ['4.1', '89', '36', '59', '1 · Đậu'],
            ['2.8', '66', '32', '42', '0 · Rớt'],
            ['1.2', '71', '33', '39', '0 · Rớt'],
            ['8.6', '73', '82', '82', '1 · Đậu'],
            ['9.9', '90', '81', '90', '1 · Đậu'],
            ['0.9', '55', '36', '18', '0 · Rớt'],
            ['0.6', '66', '44', '45', '0 · Rớt'],
            ['8.9', '84', '74', '84', '1 · Đậu'],
            ['4.3', '92', '57', '62', '1 · Đậu'],
            ['0.9', '77', '8', '26', '0 · Rớt'],
            ['5.8', '45', '54', '59', '1 · Đậu'],
            ['4.8', '64', '65', '62', '1 · Đậu'],
            ['3.2', '59', '49', '50', '1 · Đậu'],
            ['9.9', '45', '97', '86', '1 · Đậu'],
            ['2.7', '62', '35', '44', '0 · Rớt'],
            ['8.8', '41', '86', '87', '1 · Đậu'],
            ['9.4', '60', '51', '86', '1 · Đậu'],
            ['9.7', '85', '75', '80', '1 · Đậu']
          ]
        },
        mission: 'Lắp <code class="code">HỢP ĐỒNG X/y</code> cho 2 nhiệm vụ trên bảng 200 học viên — 4 dòng Pandas, kho khối có <code class="code">mồi bẫy LEAK 🪤</code> (tuồn đáp án / nhìn trộm tương lai). Lắp nhầm là bảng chấm chỉ ngay dòng lỗi ↓'
      },

      /* ----- STEP 2: 2 MCQ + mini-game gán vai trò cột (spec C1-L3 Step 2 Round A) ----- */
      step_2: {
        mcq: [
          {
            question: 'Bảng <code>student_history</code> có 200 dòng. <strong>200 dòng đó nghĩa là gì?</strong>',
            options: [
              { id: 'a', text: '200 thuộc tính khác nhau của cùng 1 học viên', correct: false, explanation: 'Thuộc tính nằm ở CỘT — bảng này chỉ có 5. Dòng không phải thuộc tính.' },
              { id: 'b', text: '200 SAMPLE — mỗi dòng là 1 học viên được ghi nhận trọn vẹn', correct: true, explanation: 'Đúng — dòng = sample, cột = attribute, ô = value. 200 dòng = 200 học viên, mỗi người đủ cả 5 thuộc tính.' },
              { id: 'c', text: '200 model đã được huấn luyện trên bảng', correct: false, explanation: 'Bảng chỉ chứa DỮ LIỆU — chưa có model nào cả. Model là thứ sẽ HỌC từ 200 dòng này.' },
              { id: 'd', text: '200 giá trị của riêng cột study_hours', correct: false, explanation: 'Gần đúng mà trượt: mỗi CỘT quả thật có 200 giá trị, nhưng "dòng" là đơn vị SAMPLE — 1 dòng gói đủ 5 giá trị của 1 người, không phải 1 giá trị của 1 cột.' }
            ]
          },
          {
            question: 'Nhiệm vụ A (cảnh báo sớm): <code>final_score</code> bị BỎ. Nhiệm vụ B (đoán điểm): nó lại là TARGET. <strong>Điều đó nói lên gì?</strong>',
            options: [
              { id: 'a', text: 'final_score bị lỗi dữ liệu nên lúc dùng được lúc không', correct: false, explanation: 'Dữ liệu sạch — chính nó làm target hoàn hảo cho nhiệm vụ B. Bị bỏ ở nhiệm vụ A vì lý do NGHĨA: tuần 8 nó chưa tồn tại.' },
              { id: 'b', text: 'Vai trò cột do NHIỆM VỤ quyết định — không cột nào "bẩm sinh" là feature hay target', correct: true, explanation: 'Chuẩn — đổi câu hỏi là đổi hợp đồng X/y. Đây là lý do mọi dự án ML phải chốt nhiệm vụ TRƯỚC khi tách dữ liệu.' },
              { id: 'c', text: 'Phải xuất 2 file dữ liệu khác nhau cho 2 nhiệm vụ', correct: false, explanation: 'Không cần — CÙNG một DataFrame, chỉ khác cách CHỌN cột khi tách X/y. Dữ liệu là kho, hợp đồng mới là thứ thay đổi.' },
              { id: 'd', text: 'Cột điểm số thì luôn phải là target', correct: false, explanation: 'midterm_score cũng là điểm số mà làm FEATURE ở cả 2 nhiệm vụ. Không có luật "điểm = target" — chỉ có câu hỏi quyết định.' }
            ]
          }
        ],
        mini_game: {
          title: 'Gán vai trò 5 cột — nhiệm vụ A: cảnh báo sớm ở tuần 8',
          instruction: 'Kéo từng cột vào đúng ngăn cho nhiệm vụ <strong>cảnh báo sớm pass_fail ở tuần 8</strong>: <strong>FEATURE</strong> (vào X) · <strong>TARGET</strong> (thành y) · <strong>BỎ</strong> (không được dùng).',
          chips: [
            { id: 'col-hours',   label: 'study_hours — giờ tự học/tuần' },
            { id: 'col-att',     label: 'attendance — % chuyên cần' },
            { id: 'col-mid',     label: 'midterm_score — điểm giữa kỳ' },
            { id: 'col-final',   label: 'final_score — điểm thi cuối (tuần 15)' },
            { id: 'col-pass',    label: 'pass_fail — kết cục Đậu/Rớt' }
          ],
          bins: [
            { id: 'feat',   label: 'FEATURE — vào X',    correct: 'true' },
            { id: 'target', label: 'TARGET — thành y',   correct: 'true' },
            { id: 'skip',   label: 'BỎ — không được dùng', correct: 'true' }
          ],
          solution: {
            'col-hours': 'feat',
            'col-att':   'feat',
            'col-mid':   'feat',
            'col-final': 'skip',
            'col-pass':  'target'
          }
        }
      },

      /* ----- STEP 3: map 1 BẢNG → 2 NHIỆM VỤ (user chốt 2026-07-19) — lắp hợp đồng X/y
         bằng Pandas, kho có 3 MỒI BẪY leak. regressor/model KHÔNG xuất hiện — bài này
         là hợp đồng dữ liệu (spec: no model training). ----- */
      step_3: {
        ml_pipeline: true,
        blocks: [
          { type: 'py', token: 'X_a = df[["study_hours", "attendance", "midterm_score"]]', slot: 'b1' },
          { type: 'py', token: 'y_a = df["pass_fail"]',                                    slot: 'b2' },
          { type: 'py', token: 'X_b = df[["study_hours", "attendance", "midterm_score"]]', slot: 'b3' },
          { type: 'py', token: 'y_b = df["final_score"]',                                  slot: 'b4' },
          /* 3 mồi bẫy LEAK (unsafe-but-correct của spec) */
          { type: 'py', token: 'X_a = df[["study_hours", "attendance", "final_score"]]',   slot: 't1' },
          { type: 'py', token: 'y_a = df["midterm_score"]',                                slot: 't2' },
          { type: 'py', token: 'X_b = df[["study_hours", "pass_fail", "midterm_score"]]',  slot: 't3' }
        ],
        drop_zones: [
          { id: 'l3a-x', accepts: ['py'], multi: true },
          { id: 'l3a-y', accepts: ['py'], multi: true },
          { id: 'l3b-x', accepts: ['py'], multi: true },
          { id: 'l3b-y', accepts: ['py'], multi: true }
        ],
        ml_flow: {
          brand: 'HỢP ĐỒNG DỮ LIỆU — 1 BẢNG, 2 NHIỆM VỤ',
          layout: 'branch',
          run_label: '▶ Chạy 2 nhiệm vụ',
          source: { sub: 'student_history · 200 học viên × 5 cột (kèm đơn vị)' },
          done_note: 'Cùng 1 bảng — 2 hợp đồng X/y: final_score đổi vai từ BỎ sang TARGET, y đổi kiểu int → float. Click lại nhánh để mổ xẻ; Bước 4 tự viết hợp đồng nhiệm vụ A bằng Pandas thật.',
          stations: [
            {
              zones: ['l3a-x', 'l3a-y'],
              icon: '🚨', label: 'NHIỆM VỤ A', sub: 'Cảnh báo sớm — đoán pass_fail', result_kind: 'roles_split',
              roles: {
                x: ['study_hours', 'attendance', 'midterm_score'],
                y: 'pass_fail',
                banned: [{ col: 'final_score', why: 'TƯƠNG LAI — tuần 8 nó chưa tồn tại; cho vào X là future leak, model ảo 99% nhưng vô dụng thật.' }],
                x_shape: 'X (200 × 3)', y_shape: 'y (200,) · int 0/1', y_note: '56 Rớt · 144 Đậu'
              },
              narration: '<code>X_a</code> chỉ lấy 3 cột QUAN SÁT ĐƯỢC ở tuần 8 (tím) · <code>y_a = pass_fail</code> — đáp án để học (vàng). <b>final_score bị GẠCH</b>: nó thuộc về tuần 15 — đưa vào X là nhìn trộm tương lai. y kiểu <b>int 0/1</b> → classification.'
            },
            {
              zones: ['l3b-x', 'l3b-y'],
              icon: '🎯', label: 'NHIỆM VỤ B', sub: 'Đoán final_score — CÙNG bảng, khác vai', result_kind: 'roles_split',
              roles: {
                x: ['study_hours', 'attendance', 'midterm_score'],
                y: 'final_score',
                banned: [{ col: 'pass_fail', why: 'SINH RA TỪ chính final_score (≥ 50) — nhét vào X là tuồn đáp án đã nén vào input.' }],
                x_shape: 'X (200 × 3)', y_shape: 'y (200,) · float', y_note: '18.0 → 100.0 điểm'
              },
              narration: 'CÙNG 3 feature — nhưng <code>y_b = final_score</code>: cột vừa bị BỎ ở nhiệm vụ A giờ thành TARGET, còn <b>pass_fail bị gạch</b> vì nó đẻ ra từ chính final_score. Để ý y đổi kiểu: <b>float</b> (số liên tục) → regression. Vai trò cột đi theo NHIỆM VỤ.'
            }
          ]
        },
        expected_sql: 'X_a = df[["study_hours", "attendance", "midterm_score"]] y_a = df["pass_fail"] X_b = df[["study_hours", "attendance", "midterm_score"]] y_b = df["final_score"]',
        expected_zones: {
          'l3a-x': 'X_a = df[["study_hours", "attendance", "midterm_score"]]',
          'l3a-y': 'y_a = df["pass_fail"]',
          'l3b-x': 'X_b = df[["study_hours", "attendance", "midterm_score"]]',
          'l3b-y': 'y_b = df["final_score"]'
        },
        reveal_hints: {
          'l3a-x': 'X của cảnh báo sớm = 3 cột THẤY ĐƯỢC ở tuần 8 — final_score là tương lai, đừng rước vào.',
          'l3a-y': 'Đáp án nhiệm vụ A: <strong>y_a = df["pass_fail"]</strong>.',
          'l3b-x': 'Nhiệm vụ B dùng CÙNG 3 feature: <strong>X_b = df[["study_hours", "attendance", "midterm_score"]]</strong>.',
          'l3b-y': 'Target đổi vai: <strong>y_b = df["final_score"]</strong> — cột bị bỏ ở A giờ là đáp án của B.'
        }
      },

      drag_map: {
        brand: 'HỢP ĐỒNG DỮ LIỆU — 1 BẢNG, 2 NHIỆM VỤ',
        table_sub: 'student_history · 200 học viên',
        idle_sub: '200 học viên · ▶ chạy để xem 2 hợp đồng X/y',
        run_label: '▶ Chạy 2 nhiệm vụ',
        table: {
          name: 'student_history',
          columns: ['study_hours', 'attendance', 'midterm_score', 'final_score', 'pass_fail'],
          dataRows: [
            ['3.6', '41', '37', '40', '0'],
            ['9.4', '82', '91', '97', '1'],
            ['9.2', '49', '76', '72', '1'],
            ['3.2', '96', '39', '49', '0'],
            ['7.9', '89', '83', '89', '1'],
            ['6.7', '97', '80', '87', '1'],
            ['5.5', '47', '54', '59', '1'],
            ['3.7', '87', '43', '67', '1'],
            ['7.4', '84', '70', '84', '1'],
            ['5.5', '53', '55', '51', '1'],
            ['6.1', '76', '67', '72', '1'],
            ['1.8', '94', '36', '46', '0'],
            ['5.2', '89', '32', '60', '1'],
            ['2.3', '78', '7', '25', '0'],
            ['0.7', '83', '19', '35', '0'],
            ['9.6', '94', '64', '91', '1'],
            ['6.5', '91', '69', '82', '1'],
            ['6.5', '95', '57', '71', '1'],
            ['8.0', '87', '79', '87', '1'],
            ['6.4', '46', '49', '63', '1'],
            ['3.7', '90', '28', '39', '0'],
            ['3.3', '91', '39', '50', '1'],
            ['5.0', '50', '51', '50', '1'],
            ['1.5', '83', '50', '36', '0'],
            ['8.2', '89', '62', '74', '1'],
            ['7.0', '86', '82', '81', '1'],
            ['0.7', '97', '10', '31', '0'],
            ['8.6', '53', '66', '74', '1'],
            ['2.6', '44', '38', '30', '0'],
            ['9.3', '40', '89', '90', '1'],
            ['6.0', '50', '59', '67', '1'],
            ['2.4', '68', '41', '44', '0'],
            ['9.8', '81', '75', '84', '1'],
            ['7.6', '51', '70', '62', '1'],
            ['4.8', '71', '60', '72', '1'],
            ['3.9', '54', '41', '47', '0'],
            ['3.7', '51', '41', '38', '0'],
            ['6.7', '66', '85', '79', '1'],
            ['8.7', '44', '82', '83', '1'],
            ['6.8', '85', '72', '77', '1'],
            ['8.9', '59', '70', '87', '1'],
            ['5.1', '55', '43', '51', '1'],
            ['8.6', '52', '84', '89', '1'],
            ['0.8', '77', '42', '41', '0'],
            ['8.8', '57', '77', '72', '1'],
            ['7.9', '68', '77', '76', '1'],
            ['9.1', '68', '94', '95', '1'],
            ['5.5', '69', '41', '58', '1'],
            ['9.8', '74', '75', '85', '1'],
            ['9.0', '68', '77', '84', '1'],
            ['9.4', '57', '64', '72', '1'],
            ['6.0', '63', '64', '67', '1'],
            ['0.8', '84', '14', '35', '0'],
            ['2.0', '100', '30', '41', '0'],
            ['1.4', '75', '41', '37', '0'],
            ['2.2', '41', '56', '38', '0'],
            ['5.8', '83', '30', '60', '1'],
            ['5.6', '54', '56', '63', '1'],
            ['2.7', '64', '24', '42', '0'],
            ['5.6', '61', '55', '57', '1'],
            ['5.4', '98', '37', '62', '1'],
            ['6.5', '99', '59', '73', '1'],
            ['1.9', '49', '18', '19', '0'],
            ['5.8', '96', '61', '68', '1'],
            ['2.5', '68', '29', '47', '0'],
            ['1.6', '56', '25', '32', '0'],
            ['1.6', '84', '33', '25', '0'],
            ['7.5', '73', '56', '76', '1'],
            ['7.7', '100', '66', '82', '1'],
            ['3.4', '74', '64', '58', '1'],
            ['8.4', '74', '74', '99', '1'],
            ['6.3', '71', '62', '67', '1'],
            ['5.0', '88', '37', '57', '1'],
            ['7.6', '52', '62', '75', '1'],
            ['10.0', '85', '88', '92', '1'],
            ['8.0', '88', '79', '74', '1'],
            ['1.7', '85', '28', '40', '0'],
            ['5.5', '91', '61', '69', '1'],
            ['8.9', '52', '72', '83', '1'],
            ['5.4', '77', '53', '65', '1'],
            ['3.0', '92', '39', '53', '1'],
            ['5.5', '92', '64', '75', '1'],
            ['9.1', '95', '76', '94', '1'],
            ['1.4', '91', '22', '31', '0'],
            ['6.4', '96', '58', '81', '1'],
            ['9.1', '44', '70', '69', '1'],
            ['9.3', '81', '80', '90', '1'],
            ['3.5', '61', '27', '38', '0'],
            ['4.4', '99', '39', '52', '1'],
            ['2.5', '86', '27', '39', '0'],
            ['4.8', '52', '41', '64', '1'],
            ['3.8', '61', '42', '48', '0'],
            ['3.7', '44', '51', '48', '0'],
            ['4.1', '98', '26', '49', '0'],
            ['6.4', '55', '39', '53', '1'],
            ['9.9', '86', '88', '97', '1'],
            ['3.8', '80', '55', '51', '1'],
            ['5.9', '54', '85', '68', '1'],
            ['3.8', '97', '32', '52', '1'],
            ['2.2', '61', '41', '44', '0'],
            ['7.4', '45', '86', '83', '1'],
            ['7.6', '99', '75', '97', '1'],
            ['9.3', '77', '78', '81', '1'],
            ['4.1', '70', '40', '56', '1'],
            ['2.3', '84', '35', '43', '0'],
            ['7.6', '87', '67', '91', '1'],
            ['8.6', '72', '63', '86', '1'],
            ['6.0', '87', '41', '62', '1'],
            ['8.8', '67', '74', '76', '1'],
            ['8.2', '92', '62', '80', '1'],
            ['6.4', '78', '66', '80', '1'],
            ['1.4', '57', '34', '46', '0'],
            ['8.9', '48', '71', '80', '1'],
            ['0.6', '41', '18', '26', '0'],
            ['2.5', '51', '39', '49', '0'],
            ['8.3', '56', '71', '81', '1'],
            ['5.2', '56', '44', '56', '1'],
            ['8.6', '58', '69', '89', '1'],
            ['6.4', '60', '61', '65', '1'],
            ['2.6', '99', '36', '49', '0'],
            ['4.8', '70', '72', '61', '1'],
            ['0.6', '71', '34', '44', '0'],
            ['6.7', '75', '59', '69', '1'],
            ['3.9', '90', '48', '52', '1'],
            ['7.0', '81', '56', '66', '1'],
            ['7.0', '59', '31', '63', '1'],
            ['4.3', '94', '60', '65', '1'],
            ['9.9', '45', '100', '88', '1'],
            ['8.9', '73', '99', '91', '1'],
            ['7.4', '42', '69', '68', '1'],
            ['5.8', '48', '56', '54', '1'],
            ['7.7', '41', '83', '71', '1'],
            ['6.0', '42', '46', '51', '1'],
            ['6.9', '71', '51', '67', '1'],
            ['2.2', '46', '47', '40', '0'],
            ['8.6', '78', '59', '70', '1'],
            ['4.8', '49', '49', '55', '1'],
            ['9.4', '69', '61', '89', '1'],
            ['2.3', '98', '38', '48', '0'],
            ['3.2', '84', '27', '45', '0'],
            ['9.7', '48', '86', '90', '1'],
            ['9.3', '90', '75', '89', '1'],
            ['4.7', '83', '45', '63', '1'],
            ['5.6', '45', '64', '63', '1'],
            ['3.5', '70', '22', '45', '0'],
            ['7.2', '92', '53', '69', '1'],
            ['3.9', '86', '44', '53', '1'],
            ['8.4', '96', '81', '98', '1'],
            ['6.5', '66', '48', '58', '1'],
            ['5.8', '87', '67', '74', '1'],
            ['9.1', '75', '76', '88', '1'],
            ['5.7', '67', '52', '67', '1'],
            ['5.0', '66', '54', '61', '1'],
            ['8.7', '55', '72', '85', '1'],
            ['7.5', '73', '83', '75', '1'],
            ['0.8', '94', '39', '41', '0'],
            ['2.3', '49', '31', '39', '0'],
            ['4.7', '52', '32', '40', '0'],
            ['2.0', '45', '47', '33', '0'],
            ['7.8', '71', '54', '62', '1'],
            ['9.5', '58', '63', '77', '1'],
            ['5.2', '67', '34', '52', '1'],
            ['7.3', '71', '65', '73', '1'],
            ['7.0', '87', '56', '74', '1'],
            ['9.0', '83', '65', '84', '1'],
            ['9.3', '51', '78', '88', '1'],
            ['1.1', '95', '25', '42', '0'],
            ['0.7', '100', '2', '31', '0'],
            ['2.6', '94', '43', '51', '1'],
            ['9.4', '60', '86', '95', '1'],
            ['0.8', '62', '22', '32', '0'],
            ['2.6', '60', '16', '33', '0'],
            ['8.0', '69', '52', '62', '1'],
            ['9.7', '95', '73', '100', '1'],
            ['8.4', '80', '71', '79', '1'],
            ['5.5', '99', '48', '64', '1'],
            ['5.2', '98', '52', '63', '1'],
            ['1.6', '93', '23', '38', '0'],
            ['10.0', '81', '86', '99', '1'],
            ['5.9', '93', '45', '60', '1'],
            ['2.1', '80', '44', '47', '0'],
            ['6.5', '83', '68', '72', '1'],
            ['4.1', '89', '36', '59', '1'],
            ['2.8', '66', '32', '42', '0'],
            ['1.2', '71', '33', '39', '0'],
            ['8.6', '73', '82', '82', '1'],
            ['9.9', '90', '81', '90', '1'],
            ['0.9', '55', '36', '18', '0'],
            ['0.6', '66', '44', '45', '0'],
            ['8.9', '84', '74', '84', '1'],
            ['4.3', '92', '57', '62', '1'],
            ['0.9', '77', '8', '26', '0'],
            ['5.8', '45', '54', '59', '1'],
            ['4.8', '64', '65', '62', '1'],
            ['3.2', '59', '49', '50', '1'],
            ['9.9', '45', '97', '86', '1'],
            ['2.7', '62', '35', '44', '0'],
            ['8.8', '41', '86', '87', '1'],
            ['9.4', '60', '51', '86', '1'],
            ['9.7', '85', '75', '80', '1']
          ]
        }
      },

      /* ----- STEP 4: Pandas thật cho nhiệm vụ A (spec C1-L3 Step 4) — grader xáo dòng,
         bẫy leak final_score trong X. Câu hỏi KHÁC Bước 3 (anti-boredom): B3 ghép 2 nhiệm vụ,
         B4 viết trọn code khám phá + tách cho nhiệm vụ A. ----- */
      step_4: {
        prompt: 'Bước 3 bạn lắp hợp đồng bằng tay. Giờ viết <strong>Pandas thật</strong> cho nhiệm vụ A: nạp <code>df</code> 200 dòng, soi cấu trúc, rồi tách <code>X</code> (3 feature thấy được ở tuần 8) và <code>y</code> (pass_fail). Hệ thống sẽ <strong>XÁO thứ tự dòng</strong> khi chấm — hợp đồng phải bám TÊN cột, không bám vị trí.',
        context: {
          scenario: 'Kho student_history sẽ còn được cập nhật và sắp xếp lại liên tục. Hidden test xáo thứ tự 200 dòng — chọn cột theo TÊN thì schema sống sót, chọn theo vị trí thì vỡ. Đây là lý do Pandas chọn cột bằng tên.',
          real_world: 'Chuyện thật của giới ngân hàng: model dự đoán vỡ nợ đạt 99% trong lab — vì trong X có cột "số ngày quá hạn", thứ chỉ tồn tại SAU khi khoản vay đã vỡ. Ra production, cột đó trống — model sập. Leakage không báo lỗi ở bất kỳ dòng code nào; nó chỉ lộ ra khi đã quá muộn. Hợp đồng X/y sạch là hàng phòng thủ duy nhất.',
          steps: [
            'Import hàm nạp dữ liệu từ <code>ml_lab</code>, nạp <code>df</code>.',
            'In cấu trúc bảng: shape + danh sách cột — soi trước khi tách.',
            'Tạo <code>X</code> từ 3 cột quan sát được ở tuần 8 (đừng rước cột tương lai).',
            'Tạo <code>y</code> = cột kết cục cần đoán.',
            'In shape của X và y · Run chạy thử · Submit chấm 4 tầng.'
          ],
          hint_explore: 'Muốn nhìn dữ liệu trước? Gõ <code>print(df.head())</code> xem 5 dòng đầu, hoặc <code>print(df.describe())</code> xem thống kê từng cột rồi <strong>Run</strong>.',
          expected: 'Console in <code>(200, 5)</code>, danh sách 5 cột, rồi <code>(200, 3)</code> và <code>(200,)</code>. Cả 4 tầng Checks xanh — kể cả khi hệ thống xáo dòng. Lỡ nhét final_score vào X? Code vẫn chạy — tầng Risk sẽ chỉ ra vì sao đó là leak.'
        },
        hints: [
          { level: 1, text: 'Chính là hợp đồng nhánh A ở Bước 3 — viết thành code: import → nạp df → in cấu trúc → tách X, y → in shape.' },
          { level: 2, text: 'Dòng 1: <code>from ml_lab import load_student_dataframe</code>. Dòng 2: <code>df = load_student_dataframe()</code>. Soi bảng: <code>print(df.shape)</code> và <code>print(df.columns.tolist())</code>.' },
          { level: 3, text: 'X = df[[ 3 cột THẤY ĐƯỢC ở tuần 8 ]] — final_score là tương lai (future leak), pass_fail là đáp án (target leak), cả hai KHÔNG được vào X. y = df["pass_fail"]. In thêm X.shape, y.shape.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>from ml_lab import load_student_dataframe<br>df = load_student_dataframe()<br>print(df.shape)<br>print(df.columns.tolist())<br>X = df[["study_hours", "attendance", "midterm_score"]]<br>y = df["pass_fail"]<br>print(X.shape)<br>print(y.shape)</code>' }
        ],
        grader_fn: 'grade_lesson3',
        success_message: 'Hợp đồng dữ liệu sạch: X (200 × 3) toàn cột thấy được ở tuần 8, y = pass_fail, không leakage — bước mà mọi dự án ML thật đều phải đi qua trước khi train. Bài 4: kiểu dữ liệu — không phải cột chứa số nào cũng là "SỐ" theo nghĩa.',
        xp_reward: 50
      }
    },

    /* ── Bài 4-15: stub chờ rollout theo module ── */
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
