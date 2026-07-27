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
        tag: '🎓 StudyLab · Ticket #01 · MỞ MÀN M1',
        hook: 'Bạn là <strong>người dựng mô hình ML đầu tiên</strong> của <strong>USTH StudyLab</strong>. Môn học kéo dài <strong>15 tuần</strong>: hệ thống ghi <em>giờ tự học, điểm danh</em> mỗi tuần; <strong>tuần 7</strong> thi giữa kỳ sinh ra <em>điểm giữa kỳ</em>; nhưng phải đến <strong>tuần 15</strong> thi cuối mới sinh ra <code>final_score</code> — và luật <code>final_score >= 50</code> chấm Đậu/Rớt. Đang <strong>TUẦN 8</strong>, điểm giữa kỳ vừa chấm xong, Ticket #01 hỏi một câu luật KHÔNG trả lời nổi: <em>"ai đang trên đà rớt, để còn 7 tuần kịp cứu?"</em> — vì final_score <strong>chưa tồn tại</strong>. Hồ sơ đầu tiên trên bàn: <strong>Lan — học viên khóa này</strong>, <code>7h/tuần · điểm danh 90% · giữa kỳ 82</code>. May thay, kho còn nguyên <strong>12 hồ sơ khóa trước</strong>: cũng đo đúng 3 con số ấy ở tuần 8, và nay đã biết kết cục Đậu/Rớt. Nhiệm vụ: để máy <strong>tự học pattern</strong> từ 12 hồ sơ đó rồi dự đoán cho Lan và các bạn cùng khóa.'
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
          /* defs 1 dòng bỏ (đợt 5) — thay bằng dải glossary chuẩn ngay dưới. */
        },
        /* Dải ĐỊNH NGHĨA (chuẩn ML đợt 5, user chốt 2026-07-19) — đặt TRƯỚC sim */
        glossary: [
          { term: 'LẬP TRÌNH TRUYỀN THỐNG', vi: 'rule-based', accent: '#FBBF24',
            def: 'Người nghĩ ra <b>LUẬT</b> (if/else), máy chỉ áp dụng. Chỉ chạy được khi <b>biết trước công thức</b> đáp án.',
            ex: 'máy tính bỏ túi; chấm Đậu/Rớt bằng <code>if final_score >= 50</code>.',
            out: 'kết quả bấm ra từ công thức có sẵn' },
          { term: 'MACHINE LEARNING', vi: 'học máy', accent: '#A78BFA',
            def: 'Người đưa <b>DỮ LIỆU LỊCH SỬ kèm đáp án</b>, máy TỰ RÚT pattern — rồi dùng pattern dự đoán cho ca <b>chưa có đáp án</b>.',
            ex: 'Netflix gợi ý phim từ lịch sử xem — không ai viết luật "thích phim A thì xem phim B".',
            out: 'một MODEL biết dự đoán' },
          { term: 'MODEL', vi: 'mô hình', accent: '#38BDF8',
            def: '"Cỗ máy quy luật" sinh ra sau khi học — nhận hồ sơ mới, trả về dự đoán. Trong bài này: <code>SimpleClassifier</code>.',
            ex: 'một giám khảo đã đọc kỹ 12 hồ sơ cũ, giờ nhìn hồ sơ mới là đoán được.',
            out: 'model.predict(hồ sơ mới) → 0/1' },
          { term: 'FIT → PREDICT', vi: 'huấn luyện → dự đoán', accent: '#34D399',
            def: '<code>fit</code> = cho model ĐỌC dữ liệu cũ (X, y) để rút quy luật. <code>predict</code> = áp quy luật lên hồ sơ <b>chưa có đáp án</b>.',
            ex: 'ôn tập đề cũ có lời giải (fit), rồi vào phòng thi làm đề mới (predict).',
            out: 'prediction = [1] · ĐẬU' },
          { term: 'TASK · EXPERIENCE · PERFORMANCE', vi: '3 mảnh bài toán ML', accent: '#F87171',
            def: 'Việc cần làm (<b>T</b>) · dữ liệu để học (<b>E</b>) · thước đo làm tốt không (<b>P</b>). Thiếu 1 trong 3 → chưa thành bài toán ML.',
            ex: 'T = đoán Đậu/Rớt tuần 8 · E = 12 hồ sơ khóa trước · P = %  đoán đúng trên học viên mới.',
            out: 'một bài toán ML được định khung đủ' },
          { term: 'PATTERN', vi: 'quy luật', accent: '#F472B6',
            def: 'Mối liên hệ <b>lặp lại</b> giữa feature và kết quả mà model rút ra từ dữ liệu — thay cho luật do người viết.',
            ex: 'giờ học cao + chuyên cần cao thường Đậu — model tự "thấy" mà không ai gõ luật đó.',
            out: 'thứ ML học được, khác luật lập trình cứng' }
        ],
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
                { icon: '👤', label: 'Lan (khóa này): 7h · 90% · giữa kỳ 82' },
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
        mission: 'Lắp pipeline ML 4 dòng Python: nạp <code class="code">12 học viên</code> → tạo model → <code class="code">fit</code> → <code class="code">predict</code> cho Lan <code class="code">[7h · 90% · giữa kỳ 82]</code> — kéo thả khối lệnh xuống dưới ↓'
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
          },
          /* Câu 3 — ôn dải ĐỊNH NGHĨA (đợt 6, user chốt 2026-07-19: khép vòng học-ôn) */
          {
            question: 'Ôn nhanh định nghĩa: lệnh <code>model.fit(X, y)</code> làm việc gì?',
            options: [
              { id: 'a', text: 'Cho model ĐỌC dữ liệu cũ (X, y) để tự rút quy luật', correct: true, explanation: 'Chuẩn — fit = huấn luyện: model đối chiếu đặc trưng X với đáp án y của 12 hồ sơ cũ để rút pattern. Như ôn tập đề cũ CÓ lời giải trước khi đi thi.' },
              { id: 'b', text: 'Dự đoán kết cục cho hồ sơ chưa có đáp án', correct: false, explanation: 'Đó là việc của predict — bước SAU KHI đã học xong. fit là bước học, predict là bước thi.' },
              { id: 'c', text: 'Kiểm tra xem X và y có cùng số dòng không', correct: false, explanation: 'Việc kiểm tra shape chỉ là bước phụ bên trong. Bản chất của fit là HỌC: rút quy luật từ dữ liệu có đáp án.' },
              { id: 'd', text: 'Vẽ biểu đồ phân bố của dữ liệu', correct: false, explanation: 'fit không vẽ gì cả — nó âm thầm điều chỉnh "quy luật" bên trong model theo dữ liệu. Vẽ biểu đồ là việc của thư viện khác (matplotlib).' }
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
              profile: 'Lan · 7h · 90% · giữa kỳ 82', dist: { pass: 6.2, fail: 47.6 }, verdict: '1 · ĐẬU',
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
        prompt: 'Bước 3 bạn đã lắp pipeline bằng tay. Giờ StudyLab cần bản <strong>code thật</strong> — và hệ thống chấm sẽ <strong>thay hồ sơ Lan bằng hồ sơ khác</strong> (X_new đổi ngầm) để chắc chắn model dự đoán thật. Tự viết TRỌN script: nạp dữ liệu → tạo model → <code>fit</code> → <code>predict</code> cho học viên mới → <code>print(prediction)</code>.',
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
          expected: 'Console in <code>[1]</code> — Lan (7h · 90% · giữa kỳ 82) được dự đoán <strong>ĐẬU</strong>. Cả 4 tầng Checks phải xanh — kể cả khi hệ thống đổi X_new ngầm.'
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
       REG w=[5.476, 0.297, 0.257, −12.05] → X_new [6.5, 85, 74]: 5.476·6.5+0.297·85+0.257·74−12.05 = 67.749 → 67.7 (thành phần làm tròn 35.6/25.2/19.0/−12.0 KHÔNG cộng đúng 67.7 do tích lũy — dùng ≈)
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
        hook: 'Ticket #01 vừa đóng thì giáo vụ gửi tiếp <strong>Ticket #02</strong>. Kho dữ liệu vừa bổ sung <strong>24 hồ sơ của KHÓA TRƯỚC</strong> — khóa đó học xong, thi xong, nên bảng có đủ cả <code>final_score</code> lẫn <code>pass_fail</code> (đáp án đầy đủ). Nhân vật chính của ticket là <strong>Minh — học viên khóa NÀY</strong>, mới học tới tuần 8: <code>giờ tự học 6.5h/tuần · điểm danh 85% · giữa kỳ 74</code>. Giáo vụ hỏi 3 câu: (1) cuối kỳ Minh sẽ được <em>bao nhiêu ĐIỂM</em>? (2) Minh <em>ĐẬU hay RỚT</em>? (3) chia 24 học viên khóa trước thành các <em>NHÓM hành vi học</em> để mở lớp phụ đạo cho khóa của Minh — mà chưa ai định nghĩa nhóm nào cả. 1 bảng — 3 câu hỏi — <strong>3 loại bài toán ML khác nhau</strong>. Chọn sai loại là trả lời sai câu hỏi.'
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
          /* defs 1 dòng bỏ (đợt 5) — user feedback "chưa đưa định nghĩa": thay bằng dải
             glossary đầy đủ (định nghĩa + ví dụ đời thường + output) ngay dưới đây. */
        },
        /* Dải ĐỊNH NGHĨA (chuẩn ML đợt 5, user chốt 2026-07-19) — đặt TRƯỚC sim */
        glossary: [
          { term: 'SUPERVISED', vi: 'học có giám sát', accent: '#34D399',
            def: 'Model học từ bảng <b>ĐÃ CÓ đáp án</b> (cột target). Có target là supervised; không có là <b>unsupervised</b>.',
            ex: 'học sinh luyện tập đề cũ CÓ lời giải (supervised) vs tự xếp tài liệu thành chồng theo cảm nhận (unsupervised).',
            out: 'model biết dự đoán target cho hồ sơ mới' },
          { term: 'REGRESSION', vi: 'hồi quy', accent: '#38BDF8',
            def: 'Bài toán supervised mà target là <b>MỘT CON SỐ liên tục</b> — trả lời câu hỏi "bao nhiêu?".',
            ex: 'dự báo ngày mai bao nhiêu độ; căn nhà này giá bao nhiêu tiền.',
            out: 'số thực — 67.7 điểm (có thể lệch ít/nhiều)' },
          { term: 'CLASSIFICATION', vi: 'phân loại', accent: '#A78BFA',
            def: 'Bài toán supervised mà target là <b>TÊN LỚP</b> — trả lời "loại nào?". Lớp mã hóa 0/1 thì 0/1 vẫn là TÊN, không phải số đếm được.',
            ex: 'email này spam hay không spam; ảnh này chó hay mèo.',
            out: '1 nhãn — ĐẬU hoặc RỚT (đúng lớp / sai lớp)' },
          { term: 'CLUSTERING', vi: 'gom cụm', accent: '#FBBF24',
            def: '<b>KHÔNG có đáp án</b> để học (unsupervised) — model tự gom các dòng GIỐNG NHAU thành nhóm.',
            ex: 'siêu thị chia khách hàng thành các nhóm mua sắm dù chưa ai đặt tên nhóm.',
            out: 'ID cụm 0/1/2 — tên TÙY Ý, không có thứ tự' },
          { term: 'UNSUPERVISED', vi: 'học không giám sát', accent: '#FB923C',
            def: 'Dữ liệu <b>không có nhãn/target</b> — model chỉ tìm cấu trúc tự thân (nhóm, mẫu), không có "đáp án đúng" để đối chiếu.',
            ex: 'clustering là ví dụ điển hình: không ai nói trước cụm nào là gì.',
            out: 'đối lập với supervised — không có y để học' },
          { term: 'TARGET (y)', vi: 'biến mục tiêu', accent: '#F87171',
            def: 'Cột ta muốn <b>dự đoán</b>. Chính <b>Ý NGHĨA</b> của nó — số liên tục hay tên lớp — quyết định loại bài toán, không phải kiểu lưu trữ.',
            ex: 'final_score (số) → regression; pass_fail (lớp 0/1) → classification — dù cả hai đều lưu là số.',
            out: 'chọn target = chọn loại bài toán ML' }
        ],
        primer: {
          goal: [
            'Supervised vs unsupervised',
            'Ý nghĩa target quyết định loại bài toán',
            '3 hợp đồng output từ cùng 1 bảng'
          ],
          intro: '',
          example: '🔍 <strong>Nhìn bảng SAMPLE DATA bên dưới:</strong> so cột <code>final_score</code> (26.8, 81.8, 18.5… — số nào cũng có thể xảy ra) với cột <code>pass_fail</code> (chỉ có đúng 2 giá trị 0/1 — tên của 2 lớp). Cùng lưu bằng SỐ, nhưng Ý NGHĨA khác hẳn nhau — và chính ý nghĩa đó quyết định loại bài toán. Giữ nhận xét này khi sang Bước 2 👇'
        },
        intro: 'Vẫn tuần 8, vẫn StudyLab — giờ có <strong>24 hồ sơ khóa trước</strong> đủ 2 cột kết cục làm tài liệu học, và <strong>Minh (khóa này)</strong> cần được dự đoán. Cùng một bảng, đặt 3 câu hỏi khác nhau sẽ ra 3 bài toán khác nhau: loại bài toán <em>không nằm trong dữ liệu</em> — nó nằm ở <strong>câu hỏi và target bạn chọn</strong>.',
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
        /* Hero = sim 3 luồng (user chốt 2026-07-19: bỏ dải timeline, 1 dòng nhắc tuần 8 nằm trong story)
           + cohort strip (đợt 5): sơ đồ 2 khóa trả lời "khóa khác thì liên quan gì đến Minh?" */
        paradigm_visual: {
          cohort: {
            old: {
              tag: '🗂️ KHÓA TRƯỚC — 24 học viên',
              sub: 'đã học xong · đã thi cuối kỳ',
              body: 'Bảng có <strong>ĐỦ đáp án</strong>: <code>final_score</code> + <code>pass_fail</code>. Đây là tài liệu để model <strong>HỌC</strong> — như tập đề cũ đã kèm lời giải.'
            },
            arrow: 'cùng chương trình học → quy luật lặp lại',
            new: {
              tag: '🎓 KHÓA NÀY — Minh, tuần 8',
              sub: 'giờ tự học 6.5h/tuần · điểm danh 85% · giữa kỳ 74',
              body: 'Minh <strong>CHƯA thi cuối kỳ</strong> → dòng của Minh thiếu 2 cột kết cục. Model áp quy luật rút từ khóa trước để <strong>DỰ ĐOÁN</strong> phần còn thiếu đó.'
            }
          },
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
                { icon: '🔢', label: 'Minh (X_new) → ≈ 67.7 điểm', cls: 'good' }
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
                { icon: '🏷️', label: 'Minh (X_new) → 1 · ĐẬU', cls: 'good' }
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
          },
          /* Câu 3 — ôn dải ĐỊNH NGHĨA (đợt 6, user chốt 2026-07-19: khép vòng học-ôn) */
          {
            question: 'Ôn nhanh định nghĩa: trong 3 loại bài toán của bài này, loại nào là <strong>UNSUPERVISED</strong> — model học mà KHÔNG cần cột đáp án?',
            options: [
              { id: 'a', text: 'Clustering — tự gom các dòng giống nhau thành nhóm', correct: true, explanation: 'Chuẩn — clustering không dùng target nào: model tự tìm cấu trúc từ chính các feature. Như siêu thị tự chia khách thành nhóm mua sắm dù chưa ai đặt tên nhóm.' },
              { id: 'b', text: 'Regression — vì output là số thực, không phải đáp án', correct: false, explanation: 'Regression vẫn cần cột đáp án để HỌC (y = final_score của khóa trước) — có target là supervised, bất kể output dạng gì.' },
              { id: 'c', text: 'Classification — vì 0/1 không phải đáp án thật', correct: false, explanation: '0/1 chính LÀ đáp án (tên 2 lớp) — model học từ cột pass_fail nên classification là supervised.' },
              { id: 'd', text: 'Cả ba đều cần cột đáp án', correct: false, explanation: 'Sai — clustering là ngoại lệ: nó CHỌN không dùng target. Đó là ranh giới supervised vs unsupervised bạn vừa học ở dải ĐỊNH NGHĨA.' }
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
                xnew: 'Minh · 6.5h · 85% · giữa kỳ 74',
                parts: [
                  { label: '6.5h × 5.48',  val: 35.6 },
                  { label: '85% × 0.30',   val: 25.2 },
                  { label: '74đ × 0.26',   val: 19.0 },
                  { label: 'gốc (bias)',   val: -12.0 }
                ],
                total: '≈ 67.7 điểm'
              },
              narration: '<code>regressor.fit(X, y_score)</code> khớp một ĐƯỜNG THẲNG qua 24 hồ sơ: mỗi feature nhận một trọng số. Dự đoán = cộng đóng góp từng feature: <b>5.476·6.5 + 0.297·85 + 0.257·74 − 12.05 ≈ 67.7 điểm</b>. Output là SỐ THỰC — lệch 2 hay 20 điểm đều có thể.'
            },
            {
              zones: ['ml2-clffit', 'ml2-clfpred'],
              icon: '🏷️', label: 'CLASSIFICATION', sub: 'y = pass_fail (TÊN LỚP)', result_kind: 'nearest',
              profile: 'Minh · 6.5h · 85% · giữa kỳ 74', dist: { pass: 9.3, fail: 36.2 }, verdict: '1 · ĐẬU',
              narration: '<code>classifier.fit(X, y_label)</code> kết tinh 24 hồ sơ thành 2 chân dung: ĐẬU ≈ 7.4h · 91% · giữa kỳ 81 vs RỚT ≈ 2.6h · 60% · giữa kỳ 48. Hồ sơ của Minh đo khoảng cách: Δ ĐẬU ≈ <b>9.3</b> vs Δ RỚT ≈ <b>36.2</b> → nhãn <b>1 · ĐẬU</b>. Output là TÊN LỚP — không phải con số để cộng trừ.'
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
          scenario: 'Giáo vụ cần trả lời câu hỏi ① và ② cho MỌI học viên khóa này, không riêng Minh. Hidden test đổi X_new (thay hồ sơ Minh bằng hồ sơ khác) — viết đúng quy trình thì kết quả vẫn hợp lệ với bất kỳ ai. Clustering (câu hỏi ③) không cần code lại — bạn đã đọc nó ở Bước 3.',
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
        tag: '🎓 StudyLab · Ticket #03 · KHÉP CHƯƠNG M1',
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
          /* defs 1 dòng bỏ (đợt 5) — user feedback "chưa đưa định nghĩa gì rõ ràng":
             thay bằng dải glossary đầy đủ ngay dưới. */
        },
        /* Dải ĐỊNH NGHĨA (chuẩn ML đợt 5, user chốt 2026-07-19) — đặt TRƯỚC ống kính bảng */
        glossary: [
          { term: 'DATAFRAME', vi: 'cái bảng trong Python', accent: '#7DD3FC',
            def: 'Bảng dữ liệu của thư viện <b>pandas</b> — như 1 sheet Excel sống trong code. Bài này: <code>df</code> = 200 dòng × 5 cột.',
            ex: 'sổ điểm cả lớp: mỗi học viên 1 hàng, mỗi loại điểm 1 cột.',
            out: 'df — thứ mọi dòng code Bước 3/4 thao tác lên' },
          { term: 'SAMPLE', vi: 'mẫu — 1 DÒNG', accent: '#34D399',
            def: 'Mỗi <b>dòng</b> = 1 cá thể được ghi lại. 200 dòng = 200 học viên = 200 sample.',
            ex: 'dòng 2 = toàn bộ thông tin của MỘT bạn: 9.4h · 82% · 91 · 97 · Đậu.',
            out: 'df có 200 sample' },
          { term: 'FEATURE / ATTRIBUTE', vi: 'đặc trưng — 1 CỘT', accent: '#A78BFA',
            def: 'Mỗi <b>cột</b> = 1 thuộc tính đo được trên MỌI sample. Cột nào được chọn cho model nhìn thì gọi là <b>feature</b>.',
            ex: 'cột study_hours = "mỗi bạn học bao nhiêu giờ/tuần" — đo trên cả 200 bạn.',
            out: '1 ô = 1 value (giá trị của 1 sample tại 1 cột)' },
          { term: 'X', vi: 'feature matrix', accent: '#38BDF8',
            def: 'Phần của bảng model <b>ĐƯỢC NHÌN</b> khi dự đoán — N dòng × D cột feature ĐƯỢC CHỌN. Bài này: X (200 × 3).',
            ex: 'phần đề bài phát cho thí sinh — không kèm đáp án.',
            out: 'X = df[["study_hours", "attendance", "midterm_score"]]' },
          { term: 'y', vi: 'target vector', accent: '#FBBF24',
            def: 'Cột <b>ĐÁP ÁN</b> model phải học — mỗi sample đúng 1 giá trị, shape (N,). Kiểu của y đổi theo nhiệm vụ: 0/1 hay số thực.',
            ex: 'cột lời giải của tập đề cũ — thứ model dò để rút quy luật.',
            out: 'y = df["pass_fail"] → (200,)' },
          { term: 'LEAKAGE', vi: 'rò rỉ đáp án', accent: '#F87171',
            def: 'X chứa thông tin lẽ ra <b>KHÔNG được biết</b> lúc dự đoán: chính đáp án (<b>target leak</b>) hoặc dữ liệu tương lai (<b>future leak</b>).',
            ex: 'đề thi kẹp sẵn tờ lời giải — điểm 10 trong phòng thi, ra đời không làm nổi.',
            out: 'code VẪN chạy, điểm lab ảo cao — ngoài đời sập' }
        ],
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
          },
          /* Câu 3 — ôn dải ĐỊNH NGHĨA (đợt 6, user chốt 2026-07-19: khép vòng học-ôn) */
          {
            question: 'Ôn nhanh định nghĩa: model đạt 99% trong lab nhưng ra đời thật thì vô dụng — và code KHÔNG hề báo lỗi. Hiện tượng này tên là gì?',
            options: [
              { id: 'a', text: 'Leakage — X chứa thông tin lẽ ra không được biết lúc dự đoán', correct: true, explanation: 'Chuẩn — như đề thi kẹp sẵn tờ lời giải: điểm 10 trong phòng thi, ra đời không làm nổi. Nguy hiểm vì code vẫn chạy êm — chỉ HỢP ĐỒNG X/y sai.' },
              { id: 'b', text: 'Overflow — số quá lớn tràn bộ nhớ', correct: false, explanation: 'Overflow là lỗi kỹ thuật có thông báo rõ ràng. Ở đây code chạy hoàn hảo — cái sai nằm ở việc X được nhìn thứ không được phép nhìn.' },
              { id: 'c', text: 'Bug cú pháp Pandas khi tách cột', correct: false, explanation: 'Cú pháp sai thì Python báo lỗi ngay — dễ thấy, dễ sửa. Leakage đáng sợ hơn nhiều vì nó KHÔNG báo gì cả.' },
              { id: 'd', text: 'Model quá yếu, cần đổi sang deep learning', correct: false, explanation: 'Ngược lại — model "quá mạnh" một cách ảo vì được đưa sẵn đáp án. Đổi model không cứu được hợp đồng dữ liệu sai.' }
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

    /* ═══════════ BÀI 4 — Hiểu kiểu dữ liệu trước khi train (spec C1-L4 tr.23-26) ═══════════
     * Đợt 7 (2026-07-20, user chốt): map 3 trạm = 3 vòng spec · story = FILE MỚI từ
     * phòng đào tạo · hero = ỐNG KÍNH DTYPE + câu đố chốt. Dataset student_profile_v1
     * (ml_lab seed 1401): 200 dòng × 6 cột — MỌI SỐ hiển thị đều tính từ engine:
     * major DS 70 · ICT 66 · Space 64; học bổng 50/200 = 25%; vắng 0-10 (TB 3.0);
     * 113 Đậu · 87 Rớt; ID 20520001-20520200. KHÔNG fit model — chấm schema (spec). */
    {
      id: 'c1_l4',
      index: 4,
      title: 'Hiểu kiểu dữ liệu trước khi train',
      subtitle: 'Cùng int64 mà 3 số phận — dtype lưu trữ không nói lên NGHĨA',
      module: 11,
      module_title: 'M2 — Dữ liệu sẵn sàng',
      estimated_minutes: 19,
      xp_reward: 50,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      story: {
        tag: '🎓 StudyLab · Ticket #04 · MỞ MÀN M2',
        hook: 'Model cảnh báo sớm chạy tốt đến mức phòng đào tạo muốn bản <strong>thế hệ 2</strong> — và gửi kèm <strong>Ticket #04</strong> một file mới toanh: <code>student_profile</code> — hồ sơ hành chính của <strong>200 học viên khóa trước</strong>, 6 cột. Mở file ra: <em>toàn số</em>. Nhưng khoan — <code>student_id</code> là số, <code>missed_classes</code> là số, <code>scholarship</code> cũng 0/1… mà nghĩa khác nhau <strong>một trời một vực</strong>: một cái là MÃ GỌI TÊN, một cái ĐẾM được thật, một cái là TÊN 2 NHÓM đội lốt số. Cho cả 6 cột vào model là nó "học" từ cả… mã số sinh viên. Nhiệm vụ Ticket #04: dựng <strong>SCHEMA NGỮ NGHĨA</strong> — phân loại từng cột theo NGHĨA và loại đúng cột trước khi ai đó bấm train.'
      },
      achievement: { name: 'Data Preparation Scout — Schema ngữ nghĩa', desc: 'phân biệt dtype vs nghĩa thật, dựng schema an toàn' },

      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Giải thích vì sao <strong>cùng int64</strong> có thể là số đếm, tên 2 nhóm 0/1, hoặc mã định danh — và vì sao phải xử lý 3 kiểu đó khác nhau.',
            'Phân biệt <strong>đo liên tục vs đếm rời rạc</strong>, nhận ra hạng mục chữ cần <strong>encoding</strong> và định danh phải <strong>loại khỏi X</strong>.',
            'Dựng <strong>schema ngữ nghĩa</strong> bằng Python: 4 list nhóm cột → <code>feature_cols</code> → <code>X</code> (200×4) và <code>y</code> — không lọt ID, không lọt target.'
          ]
        },
        /* Dải ĐỊNH NGHĨA (chuẩn ML đợt 5) — đặt TRƯỚC ống kính */
        glossary: [
          { term: 'DTYPE', vi: 'kiểu LƯU TRỮ', accent: '#7DD3FC',
            def: 'Cách Pandas lưu cột trong máy: <b>int64 / float64 / object</b>. Chỉ nói về bộ nhớ — <b>không nói cột nghĩa là gì</b>.',
            ex: 'cùng int64: mã sinh viên, số buổi vắng, có/không học bổng.',
            out: 'df.dtypes — bước soi ĐẦU TIÊN của mọi dataset' },
          { term: 'CONTINUOUS', vi: 'đo liên tục', accent: '#38BDF8',
            def: 'Đại lượng <b>ĐO</b> được — mọi giá trị trung gian đều có nghĩa.',
            ex: '6.5 giờ tự học = 6 giờ 30 phút — hoàn toàn hợp lệ.',
            out: 'thường float64 · dùng thẳng làm feature' },
          { term: 'DISCRETE', vi: 'đếm rời rạc', accent: '#34D399',
            def: 'Số <b>ĐẾM</b> nguyên — cộng trừ, tính trung bình CÓ nghĩa; không có nửa đơn vị.',
            ex: 'vắng 3 buổi — không ai vắng 2.5 buổi.',
            out: 'int64 · dùng thẳng làm feature' },
          { term: 'CATEGORICAL', vi: 'hạng mục', accent: '#FBBF24',
            def: '<b>TÊN nhóm</b> không có thứ tự — thường lưu bằng chữ.',
            ex: 'ngành học: ICT / DS / Space — không ngành nào "lớn hơn" ngành nào.',
            out: 'cần ENCODING (hóa số) trước khi train' },
          { term: 'BINARY', vi: 'nhị phân', accent: '#A78BFA',
            def: 'Hạng mục đúng <b>2 giá trị</b>, hay được mã 0/1 — nhưng 0/1 là <b>TÊN</b>, không phải lượng.',
            ex: 'có / không có học bổng.',
            out: 'giữ 0/1 làm feature — nhưng hiểu nó là TÊN' },
          { term: 'IDENTIFIER', vi: 'định danh', accent: '#F87171',
            def: 'Mã <b>gọi tên</b> từng dòng — mỗi dòng một mã, không mang thông tin hành vi.',
            ex: 'mã SV 20520042 — "trung bình mã số sinh viên" là con số vô nghĩa.',
            out: 'LOẠI khỏi X — model học từ ID là học vẹt' }
        ],
        primer: {
          goal: [
            'dtype lưu trữ ≠ kiểu ngữ nghĩa',
            'Liên tục · đếm · hạng mục · nhị phân · định danh',
            'Schema 4 nhóm + X/y an toàn'
          ],
          intro: '',
          example: '🔍 <strong>Bấm cột <code>student_id</code> trong SCHEMA EXPLORER bên dưới:</strong> 200 mã khác nhau, không lặp — dấu hiệu tay của cột ĐỊNH DANH. Rồi bấm <code>scholarship</code>: chỉ có đúng 2 giá trị 0/1 trên 200 dòng. Số giá trị KHÁC NHAU của một cột (unique) là manh mối đọc nghĩa nhanh nhất — giữ mẹo này khi sang Bước 2 👇'
        },
        intro: 'File mới nhìn <strong>toàn số</strong> — nhưng dtype chỉ nói cách LƯU, không nói NGHĨA. Trước khi train bất cứ gì, mọi dự án ML thật đều phải đi qua bước này: đọc từng cột theo nghĩa thật, phân nhóm, đánh dấu cột cần xử lý và <strong>loại cột không được dùng</strong>.',
        concept_cards: [
          {
            icon: 'fa-fingerprint',
            title: 'Cùng int64 — 3 số phận',
            body: '<code>student_id</code>, <code>missed_classes</code>, <code>scholarship</code> CÙNG lưu int64. Nhưng: mã 20520042 là <strong>căn cước</strong> (trung bình vô nghĩa), 3 buổi vắng là <strong>số đếm thật</strong> (trung bình 3.0 có nghĩa), còn 0/1 học bổng là <strong>tên 2 nhóm</strong>. dtype không nói lên nghĩa — NGHĨA quyết định cách xử lý.'
          },
          {
            icon: 'fa-ruler-horizontal',
            title: 'Đo liên tục vs Đếm rời rạc',
            body: '<code>study_hours</code> = 6.5 nghĩa là 6 giờ 30 phút — ĐO được, mọi giá trị trung gian hợp lệ. <code>missed_classes</code> = 3 buổi — ĐẾM được, không tồn tại 2.5 buổi. Cả hai đều là feature số dùng thẳng, nhưng khác bản chất — và một phép đo bị LÀM TRÒN khi lưu (vd study_hours ghi 7 thay vì 6.5) vẫn là liên tục.'
          },
          {
            icon: 'fa-tags',
            title: 'Chữ cần encoding — ID cấm cửa',
            body: '<code>major</code> là CHỮ (ICT/DS/Space) — model chỉ ăn số nên phải <strong>ENCODING</strong> (bài sau; bài này chỉ ĐÁNH DẤU). <code>student_id</code> thì cấm hẳn: model vớ được nó sẽ "học" kiểu <em>mã to thì đậu</em> — pattern học vẹt, gặp khóa mới có dải mã khác là sập.'
          }
        ],
        /* Hero = ỐNG KÍNH DTYPE (user chốt 2026-07-20) — bấm 4 cột bắt buộc, lật dtype vs
           NGHĨA, rồi câu đố chốt completion rule spec: chọn cột SỐ ĐẾM thật giữa 3 int64. */
        dtype_lens: {
          title: 'ỐNG KÍNH DTYPE — TOÀN SỐ, THẬT KHÔNG?',
          intro: '5 dòng đầu của <code>student_profile</code> — 6 cột nhìn đều "là số". Bấm từng <b>thẻ cột</b> bên dưới để lật ra dtype LƯU TRỮ vs NGHĨA THẬT (cần đủ 4 thẻ có ô ☐).',
          columns: [
            { name: 'student_id',     dtype: 'int64',   icon: '🪪', accent: '#F87171',
              meaning: 'ĐỊNH DANH — mã gọi tên duy nhất từng dòng (20520001 → 20520200). "Trung bình mã số = 20520100.5" — con số VÔ NGHĨA.',
              action: 'LOẠI khỏi X' },
            { name: 'study_hours',    dtype: 'float64', icon: '📏', accent: '#38BDF8',
              meaning: 'ĐO LIÊN TỤC — 6.5 = 6 giờ 30 phút; mọi giá trị 0.5 → 10.0 đều hợp lệ.',
              action: 'FEATURE — dùng thẳng' },
            { name: 'missed_classes', dtype: 'int64',   icon: '🔢', accent: '#34D399',
              meaning: 'ĐẾM RỜI RẠC — 0 → 10 buổi vắng; trung bình 3.0 buổi/người CÓ nghĩa thật.',
              action: 'FEATURE — dùng thẳng' },
            { name: 'major',          dtype: 'object',  icon: '🏷️', accent: '#FBBF24',
              meaning: 'HẠNG MỤC (chữ) — 3 ngành: DS 70 · ICT 66 · Space 64. Chữ chưa vào model được.',
              action: 'ĐÁNH DẤU cần encoding' },
            { name: 'scholarship',    dtype: 'int64',   icon: '🎗️', accent: '#A78BFA',
              meaning: 'NHỊ PHÂN — 0/1 là TÊN 2 nhóm (50/200 = 25% có học bổng), không phải số đếm.',
              action: 'FEATURE nhị phân — hiểu là TÊN' },
            { name: 'pass_fail',      dtype: 'int64',   icon: '🎯', accent: '#F59E0B',
              meaning: 'TARGET — đáp án cần đoán (113 Đậu · 87 Rớt). Cũng 0/1 = tên 2 lớp.',
              action: 'thành y — KHÔNG vào X' }
          ],
          require: ['student_id', 'study_hours', 'missed_classes', 'scholarship'],
          rows: [
            ['20520001', '9.0', '7', 'ICT', '0', '1'],
            ['20520002', '8.2', '5', 'ICT', '0', '1'],
            ['20520003', '4.6', '2', 'ICT', '0', '0'],
            ['20520004', '2.6', '1', 'DS', '0', '0'],
            ['20520005', '9.9', '1', 'ICT', '1', '1']
          ],
          rows_note: '⋯ còn 195 dòng nữa — tổng 200 dòng',
          riddle: {
            prompt: '3 cột CÙNG lưu int64: <code>student_id</code> · <code>missed_classes</code> · <code>scholarship</code>. Cột nào là <b>SỐ ĐẾM thật</b> — cộng trừ, tính trung bình CÓ nghĩa?',
            options: ['student_id', 'missed_classes', 'scholarship'],
            answer: 'missed_classes',
            wrong: {
              'student_id': 'ID là căn cước — "trung bình mã số sinh viên = 20520100.5" là con số vô nghĩa. Nhìn NGHĨA, đừng nhìn dtype.',
              'scholarship': '0/1 ở đây là TÊN 2 nhóm (có/không học bổng) — "0.25 suất học bổng trung bình mỗi người" không phải phép đếm trên một người.'
            },
            done: '✅ Chuẩn — chỉ <b>missed_classes</b> là số ĐẾM thật: trung bình 3.0 buổi vắng CÓ nghĩa. Cùng int64 mà 3 số phận: căn cước · số đếm · tên nhóm — <b>dtype không nói lên NGHĨA</b>. Xuống Bước 2 kiểm chứng con mắt mới của bạn.'
          }
        },
        visual: {
          schema: {
            table_name: 'student_profile (DataFrame)',
            columns: [
              { name: 'student_id',     type: 'INT64 · định danh',   key: 'ID',     icon: '🪪',
                note: '<strong>Identifier</strong> — 200 mã khác nhau, không lặp (20520001 → 20520200). Model "học" từ nó là học vẹt số thứ tự → LOẠI khỏi X.' },
              { name: 'study_hours',    type: 'FLOAT64 · giờ/tuần',  key: '',       icon: '',
                note: '<strong>Đo liên tục</strong> — 0.5 → 10.0 giờ; 6.5 nghĩa là 6 giờ 30 phút. Feature dùng thẳng.' },
              { name: 'missed_classes', type: 'INT64 · buổi',        key: '',       icon: '',
                note: '<strong>Đếm rời rạc</strong> — 0 → 10 buổi vắng, trung bình 3.0. Số đếm thật: cộng trừ có nghĩa. Feature dùng thẳng.' },
              { name: 'major',          type: 'OBJECT · chữ',        key: '',       icon: '🏷️',
                note: '<strong>Hạng mục</strong> — đúng 3 giá trị: DS (70) · ICT (66) · Space (64). Chữ chưa vào model được → ĐÁNH DẤU cần encoding (bài sau mới mã hóa).' },
              { name: 'scholarship',    type: 'INT64 · 0/1',         key: '',       icon: '🎗️',
                note: '<strong>Nhị phân</strong> — 0/1 là TÊN 2 nhóm: 50/200 học viên (25%) có học bổng. Không phải số đếm — đừng xếp nó vào nhóm số.' },
              { name: 'pass_fail',      type: 'INT64 · 0/1',         key: 'TARGET', icon: '🎯',
                note: '<strong>Target</strong> — đáp án cần đoán: 113 Đậu · 87 Rớt. Thành y, tuyệt đối không vào X (target leak).' }
            ]
          },
          /* 200 dòng = CHÍNH XÁC ml_lab.load_student_profile (seed 1401, int64 ép tường minh) */
          data_preview: [
          ['20520001', '9.0', '7', 'ICT', '0', '1'],
          ['20520002', '8.2', '5', 'ICT', '0', '1'],
          ['20520003', '4.6', '2', 'ICT', '0', '0'],
          ['20520004', '2.6', '1', 'DS', '0', '0'],
          ['20520005', '9.9', '1', 'ICT', '1', '1'],
          ['20520006', '3.9', '5', 'Space', '1', '1'],
          ['20520007', '5.8', '3', 'ICT', '0', '1'],
          ['20520008', '8.0', '2', 'Space', '0', '1'],
          ['20520009', '7.3', '2', 'Space', '0', '1'],
          ['20520010', '2.2', '5', 'ICT', '0', '0'],
          ['20520011', '4.7', '3', 'ICT', '0', '0'],
          ['20520012', '3.7', '0', 'DS', '0', '0'],
          ['20520013', '3.3', '2', 'DS', '0', '0'],
          ['20520014', '8.7', '1', 'DS', '0', '1'],
          ['20520015', '8.8', '2', 'DS', '0', '1'],
          ['20520016', '3.6', '3', 'DS', '0', '0'],
          ['20520017', '1.0', '4', 'DS', '1', '0'],
          ['20520018', '6.0', '2', 'ICT', '1', '1'],
          ['20520019', '4.0', '8', 'Space', '0', '0'],
          ['20520020', '2.6', '4', 'Space', '0', '0'],
          ['20520021', '6.0', '4', 'DS', '0', '1'],
          ['20520022', '8.2', '3', 'Space', '1', '1'],
          ['20520023', '3.2', '3', 'ICT', '0', '1'],
          ['20520024', '2.2', '4', 'DS', '0', '0'],
          ['20520025', '4.2', '3', 'ICT', '0', '0'],
          ['20520026', '6.5', '3', 'DS', '1', '1'],
          ['20520027', '7.5', '3', 'DS', '0', '1'],
          ['20520028', '2.2', '2', 'Space', '0', '0'],
          ['20520029', '6.7', '1', 'ICT', '1', '1'],
          ['20520030', '1.1', '5', 'Space', '0', '0'],
          ['20520031', '9.0', '4', 'ICT', '0', '1'],
          ['20520032', '1.9', '3', 'ICT', '0', '0'],
          ['20520033', '1.4', '4', 'ICT', '1', '0'],
          ['20520034', '8.9', '0', 'ICT', '0', '1'],
          ['20520035', '0.8', '0', 'DS', '0', '0'],
          ['20520036', '5.6', '3', 'ICT', '1', '1'],
          ['20520037', '2.9', '2', 'Space', '1', '0'],
          ['20520038', '9.4', '5', 'DS', '0', '1'],
          ['20520039', '2.4', '5', 'ICT', '0', '0'],
          ['20520040', '3.5', '3', 'DS', '0', '0'],
          ['20520041', '0.5', '3', 'DS', '0', '0'],
          ['20520042', '8.3', '0', 'ICT', '1', '1'],
          ['20520043', '9.8', '0', 'Space', '0', '1'],
          ['20520044', '2.2', '3', 'ICT', '0', '0'],
          ['20520045', '3.8', '4', 'DS', '0', '0'],
          ['20520046', '2.2', '8', 'DS', '0', '0'],
          ['20520047', '8.1', '5', 'Space', '0', '1'],
          ['20520048', '3.2', '2', 'DS', '1', '1'],
          ['20520049', '6.5', '1', 'ICT', '0', '1'],
          ['20520050', '2.7', '8', 'DS', '1', '0'],
          ['20520051', '4.5', '2', 'ICT', '0', '1'],
          ['20520052', '4.5', '7', 'Space', '0', '0'],
          ['20520053', '1.5', '1', 'DS', '1', '0'],
          ['20520054', '7.2', '2', 'DS', '0', '1'],
          ['20520055', '7.1', '4', 'DS', '0', '1'],
          ['20520056', '5.1', '6', 'ICT', '0', '0'],
          ['20520057', '5.8', '6', 'Space', '1', '1'],
          ['20520058', '6.4', '1', 'ICT', '0', '1'],
          ['20520059', '9.4', '3', 'ICT', '0', '1'],
          ['20520060', '7.1', '4', 'Space', '0', '1'],
          ['20520061', '7.4', '1', 'ICT', '1', '1'],
          ['20520062', '8.4', '3', 'DS', '0', '1'],
          ['20520063', '6.3', '6', 'DS', '1', '1'],
          ['20520064', '0.8', '4', 'Space', '0', '0'],
          ['20520065', '4.6', '6', 'DS', '0', '0'],
          ['20520066', '1.2', '1', 'Space', '0', '1'],
          ['20520067', '9.6', '6', 'DS', '1', '1'],
          ['20520068', '7.9', '4', 'Space', '1', '1'],
          ['20520069', '8.8', '4', 'ICT', '1', '1'],
          ['20520070', '1.0', '2', 'DS', '0', '0'],
          ['20520071', '9.8', '5', 'Space', '0', '1'],
          ['20520072', '0.8', '4', 'ICT', '1', '0'],
          ['20520073', '3.4', '3', 'ICT', '0', '0'],
          ['20520074', '8.4', '5', 'ICT', '0', '1'],
          ['20520075', '9.4', '5', 'Space', '0', '1'],
          ['20520076', '1.1', '3', 'DS', '0', '0'],
          ['20520077', '6.5', '3', 'DS', '0', '1'],
          ['20520078', '1.3', '1', 'DS', '0', '0'],
          ['20520079', '9.9', '2', 'DS', '0', '1'],
          ['20520080', '3.4', '3', 'DS', '0', '0'],
          ['20520081', '8.9', '2', 'ICT', '1', '1'],
          ['20520082', '2.9', '1', 'DS', '0', '0'],
          ['20520083', '7.1', '4', 'Space', '0', '0'],
          ['20520084', '5.0', '1', 'DS', '0', '1'],
          ['20520085', '2.7', '3', 'DS', '0', '0'],
          ['20520086', '1.7', '0', 'DS', '0', '0'],
          ['20520087', '9.3', '3', 'ICT', '0', '1'],
          ['20520088', '8.9', '2', 'DS', '0', '1'],
          ['20520089', '6.7', '3', 'Space', '0', '1'],
          ['20520090', '2.9', '8', 'DS', '0', '0'],
          ['20520091', '0.6', '4', 'ICT', '0', '0'],
          ['20520092', '0.8', '3', 'Space', '0', '0'],
          ['20520093', '7.3', '2', 'DS', '0', '1'],
          ['20520094', '1.1', '2', 'Space', '1', '0'],
          ['20520095', '8.7', '2', 'Space', '0', '1'],
          ['20520096', '4.9', '3', 'DS', '0', '1'],
          ['20520097', '4.3', '3', 'DS', '0', '1'],
          ['20520098', '6.2', '2', 'Space', '0', '1'],
          ['20520099', '3.8', '1', 'ICT', '1', '0'],
          ['20520100', '1.7', '1', 'DS', '0', '0'],
          ['20520101', '7.0', '4', 'Space', '0', '1'],
          ['20520102', '8.9', '0', 'DS', '0', '1'],
          ['20520103', '8.3', '6', 'DS', '1', '1'],
          ['20520104', '9.8', '5', 'ICT', '0', '1'],
          ['20520105', '3.0', '2', 'Space', '1', '0'],
          ['20520106', '7.6', '4', 'Space', '0', '1'],
          ['20520107', '7.4', '1', 'Space', '0', '1'],
          ['20520108', '3.0', '3', 'ICT', '0', '0'],
          ['20520109', '10.0', '3', 'Space', '0', '1'],
          ['20520110', '0.5', '1', 'ICT', '0', '0'],
          ['20520111', '3.1', '10', 'ICT', '0', '0'],
          ['20520112', '3.5', '2', 'ICT', '0', '0'],
          ['20520113', '1.3', '3', 'Space', '1', '0'],
          ['20520114', '5.9', '2', 'Space', '0', '1'],
          ['20520115', '3.5', '1', 'DS', '0', '1'],
          ['20520116', '7.8', '4', 'ICT', '0', '1'],
          ['20520117', '1.0', '2', 'ICT', '0', '0'],
          ['20520118', '2.6', '1', 'Space', '0', '0'],
          ['20520119', '5.2', '4', 'ICT', '0', '0'],
          ['20520120', '1.9', '1', 'ICT', '0', '0'],
          ['20520121', '6.2', '5', 'Space', '1', '1'],
          ['20520122', '1.7', '4', 'Space', '1', '0'],
          ['20520123', '6.3', '4', 'DS', '0', '1'],
          ['20520124', '1.9', '6', 'ICT', '1', '0'],
          ['20520125', '0.8', '3', 'ICT', '0', '0'],
          ['20520126', '2.8', '6', 'ICT', '0', '0'],
          ['20520127', '9.3', '2', 'DS', '0', '1'],
          ['20520128', '9.0', '5', 'ICT', '0', '1'],
          ['20520129', '9.3', '1', 'DS', '0', '1'],
          ['20520130', '8.0', '7', 'ICT', '0', '1'],
          ['20520131', '1.5', '3', 'ICT', '1', '0'],
          ['20520132', '7.8', '4', 'DS', '0', '0'],
          ['20520133', '4.7', '2', 'DS', '0', '1'],
          ['20520134', '8.0', '2', 'DS', '1', '1'],
          ['20520135', '8.0', '4', 'Space', '0', '1'],
          ['20520136', '5.6', '6', 'ICT', '0', '1'],
          ['20520137', '2.9', '2', 'DS', '0', '0'],
          ['20520138', '9.5', '2', 'DS', '0', '1'],
          ['20520139', '6.9', '4', 'Space', '0', '1'],
          ['20520140', '4.2', '3', 'ICT', '0', '1'],
          ['20520141', '3.1', '4', 'ICT', '1', '0'],
          ['20520142', '5.1', '3', 'Space', '1', '0'],
          ['20520143', '1.0', '1', 'ICT', '1', '0'],
          ['20520144', '1.8', '3', 'ICT', '1', '0'],
          ['20520145', '9.4', '2', 'ICT', '0', '1'],
          ['20520146', '9.8', '1', 'ICT', '1', '1'],
          ['20520147', '1.9', '3', 'DS', '1', '0'],
          ['20520148', '6.6', '3', 'Space', '0', '1'],
          ['20520149', '2.7', '2', 'ICT', '0', '0'],
          ['20520150', '10.0', '5', 'DS', '0', '1'],
          ['20520151', '3.5', '2', 'Space', '1', '0'],
          ['20520152', '7.5', '5', 'Space', '0', '1'],
          ['20520153', '1.2', '2', 'DS', '0', '0'],
          ['20520154', '8.5', '2', 'ICT', '0', '1'],
          ['20520155', '10.0', '2', 'Space', '1', '1'],
          ['20520156', '4.5', '2', 'Space', '0', '0'],
          ['20520157', '7.3', '1', 'DS', '0', '1'],
          ['20520158', '6.3', '4', 'Space', '0', '1'],
          ['20520159', '3.1', '2', 'DS', '0', '0'],
          ['20520160', '4.4', '1', 'Space', '1', '1'],
          ['20520161', '2.8', '3', 'Space', '1', '0'],
          ['20520162', '5.4', '1', 'ICT', '0', '0'],
          ['20520163', '2.2', '0', 'Space', '0', '0'],
          ['20520164', '8.7', '1', 'Space', '0', '1'],
          ['20520165', '7.2', '2', 'DS', '1', '0'],
          ['20520166', '8.2', '1', 'Space', '0', '1'],
          ['20520167', '6.7', '2', 'Space', '0', '1'],
          ['20520168', '7.9', '5', 'Space', '0', '1'],
          ['20520169', '2.3', '4', 'DS', '0', '0'],
          ['20520170', '2.6', '2', 'Space', '0', '0'],
          ['20520171', '6.0', '3', 'DS', '0', '0'],
          ['20520172', '7.2', '9', 'Space', '0', '1'],
          ['20520173', '5.9', '3', 'DS', '0', '1'],
          ['20520174', '0.5', '4', 'Space', '1', '0'],
          ['20520175', '5.3', '1', 'Space', '1', '1'],
          ['20520176', '9.1', '3', 'Space', '0', '1'],
          ['20520177', '9.2', '1', 'ICT', '0', '1'],
          ['20520178', '2.4', '2', 'DS', '0', '0'],
          ['20520179', '6.5', '3', 'ICT', '0', '1'],
          ['20520180', '6.9', '1', 'DS', '0', '1'],
          ['20520181', '4.1', '2', 'DS', '0', '1'],
          ['20520182', '8.4', '3', 'Space', '1', '1'],
          ['20520183', '1.0', '3', 'Space', '0', '0'],
          ['20520184', '9.8', '4', 'Space', '0', '1'],
          ['20520185', '6.5', '2', 'Space', '0', '1'],
          ['20520186', '6.0', '1', 'Space', '0', '1'],
          ['20520187', '7.0', '2', 'DS', '1', '1'],
          ['20520188', '7.3', '2', 'Space', '1', '1'],
          ['20520189', '8.9', '3', 'DS', '0', '1'],
          ['20520190', '4.0', '0', 'DS', '0', '0'],
          ['20520191', '7.4', '4', 'Space', '1', '1'],
          ['20520192', '7.2', '2', 'ICT', '1', '1'],
          ['20520193', '8.3', '4', 'ICT', '0', '1'],
          ['20520194', '4.5', '1', 'ICT', '0', '0'],
          ['20520195', '4.6', '3', 'ICT', '0', '0'],
          ['20520196', '0.9', '7', 'Space', '0', '0'],
          ['20520197', '6.0', '3', 'ICT', '0', '1'],
          ['20520198', '5.2', '4', 'ICT', '0', '1'],
          ['20520199', '5.6', '4', 'DS', '0', '1'],
          ['20520200', '7.6', '3', 'DS', '0', '1']
          ]
        },
        mission: 'Dựng <code class="code">SCHEMA NGỮ NGHĨA</code> cho bảng 200 hồ sơ: phân 4 cột feature vào đúng nhóm nghĩa, loại <code class="code">student_id</code>, chốt <code class="code">X (200×4)</code> + <code class="code">y</code> — kho khối có <code class="code">mồi bẫy 🪤</code> (ID vào X · target lọt vào feature · 0/1 xếp nhóm đếm) ↓'
      },

      /* ----- STEP 2: 3 MCQ + mini-game xếp 6 cột vào 3 ngăn nghĩa ----- */
      step_2: {
        mcq: [
          {
            question: '<code>student_id</code>, <code>missed_classes</code>, <code>scholarship</code> CÙNG lưu <strong>int64</strong>. Vì sao KHÔNG thể xử lý 3 cột này giống nhau?',
            options: [
              { id: 'a', text: 'Vì dtype chỉ là cách LƯU — nghĩa 3 cột khác hẳn: mã định danh · số đếm · tên 2 nhóm', correct: true, explanation: 'Chuẩn — int64 nói máy lưu số nguyên 64-bit, hết. Căn cước phải loại, số đếm dùng thẳng, 0/1 là tên nhóm: ba cách xử lý khác nhau cho cùng một dtype.' },
              { id: 'b', text: 'Có thể xử lý giống nhau — cùng dtype nghĩa là cùng kiểu dữ liệu', correct: false, explanation: 'Đây chính là cái bẫy của bài: dtype là kiểu LƯU TRỮ, không phải kiểu NGỮ NGHĨA. Cho model "học" từ student_id là học vẹt mã số.' },
              { id: 'c', text: 'Vì int64 tốn bộ nhớ hơn int32 nên phải tách riêng', correct: false, explanation: 'Bộ nhớ không liên quan — câu chuyện là NGHĨA của từng cột quyết định cách model đối xử với nó.' },
              { id: 'd', text: 'Vì student_id có giá trị lớn nhất nên phải scale trước', correct: false, explanation: 'Scale không cứu được: dù chia nhỏ đến đâu, mã định danh vẫn là căn cước — không mang thông tin hành vi để học.' }
            ]
          },
          {
            question: 'Giả sử phòng đào tạo LÀM TRÒN <code>study_hours</code> thành số nguyên (6.5 → 7, lưu int64). Sau khi làm tròn, theo NGHĨA nó là kiểu gì?',
            options: [
              { id: 'a', text: 'Vẫn ĐO liên tục — chỉ bị làm tròn lúc lưu; 6.5 giờ vẫn tồn tại thật', correct: true, explanation: 'Đúng — study_hours là phép ĐO thời gian, bản chất liên tục. Làm tròn khi ghi không đổi bản chất: dấu chấm thập phân không phải tiêu chí duy nhất — một phép đo làm tròn vẫn là continuous.' },
              { id: 'b', text: 'Thành ĐẾM rời rạc — vì giờ đã là số nguyên', correct: false, explanation: 'Cái bẫy "int = đếm": số nguyên chưa chắc là đếm. 6.5 giờ (6 giờ 30 phút) tồn tại thật — study_hours ĐO được, khác hẳn missed_classes ĐẾM từng buổi tách rời.' },
              { id: 'c', text: 'Thành nhị phân — vì có thể chia trên/dưới 5 giờ', correct: false, explanation: 'Chia nhóm là việc BẠN làm sau này (feature engineering) — bản thân cột giờ học vẫn là một phép đo liên tục.' },
              { id: 'd', text: 'Thành định danh — mỗi người một số giờ riêng', correct: false, explanation: 'Nhiều người trùng số giờ và trung bình số giờ CÓ nghĩa — khác hẳn mã định danh (không lặp, trung bình vô nghĩa).' }
            ]
          },
          /* Câu 3 — ôn dải ĐỊNH NGHĨA (chuẩn đợt 6) */
          {
            question: 'Ôn nhanh định nghĩa: nhét <code>student_id</code> vào X, code chạy ngon, lab còn báo "chính xác cao". Vì sao vẫn PHẢI loại?',
            options: [
              { id: 'a', text: 'Vì ID là căn cước — pattern "mã to thì đậu" là học vẹt, gặp khóa mới dải mã khác là sập', correct: true, explanation: 'Chuẩn — identifier không mang thông tin hành vi. Model bám vào nó = ghi nhớ số thứ tự; đổi cohort là pattern tan tành. Điểm lab cao chỉ là ảo.' },
              { id: 'b', text: 'Vì student_id làm code chạy chậm', correct: false, explanation: 'Một cột số không đáng kể về tốc độ — vấn đề là NGỮ NGHĨA: ID không phải đại lượng để học.' },
              { id: 'c', text: 'Vì Pandas không cho phép cột int64 vào X', correct: false, explanation: 'Pandas cho phép tuốt — chính vì CODE KHÔNG BÁO LỖI nên lỗi ngữ nghĩa này mới nguy hiểm và cần con người soi schema.' },
              { id: 'd', text: 'Không cần loại — nếu lab báo chính xác cao thì cứ dùng', correct: false, explanation: 'Đây là cái bẫy "unsafe-but-correct": chạy được ≠ đúng nghĩa. Bài 3 bạn đã gặp leakage — ID trong X là người anh em của nó.' }
            ]
          }
        ],
        mini_game: {
          title: 'Xếp 6 cột vào 3 ngăn NGHĨA',
          instruction: 'Bảng <code>student_profile</code> nhìn "toàn số". Kéo từng cột vào đúng ngăn: <strong>ĐO liên tục</strong> · <strong>ĐẾM rời rạc</strong> · <strong>TÊN/NHÃN đội lốt số</strong>.',
          chips: [
            { id: 'dt-hours',  label: 'study_hours — 6.5 giờ/tuần' },
            { id: 'dt-missed', label: 'missed_classes — 3 buổi vắng' },
            { id: 'dt-major',  label: 'major — ICT / DS / Space' },
            { id: 'dt-schol',  label: 'scholarship — 0/1 học bổng' },
            { id: 'dt-id',     label: 'student_id — 20520042' },
            { id: 'dt-pass',   label: 'pass_fail — 0/1 Đậu·Rớt' }
          ],
          bins: [
            { id: 'cont', label: '📏 ĐO liên tục',  correct: 'true' },
            { id: 'disc', label: '🔢 ĐẾM rời rạc',  correct: 'true' },
            { id: 'name', label: '🏷️ TÊN / NHÃN',   correct: 'true' }
          ],
          solution: {
            'dt-hours':  'cont',
            'dt-missed': 'disc',
            'dt-major':  'name',
            'dt-schol':  'name',
            'dt-id':     'name',
            'dt-pass':   'name'
          },
          success: 'Thấy chưa — bảng "toàn số" mà 4/6 cột hóa ra là TÊN/NHÃN (ngành, học bổng, mã SV, kết cục). Chỉ 2 cột là số thật để đo và đếm. Đây chính là con mắt semantic mà Bước 3 cần.'
        }
      },

      /* ----- STEP 3: map 3 trạm = 3 vòng spec (user chốt 2026-07-20) — dựng schema
         ngữ nghĩa bằng 7 dòng Python; kho có 3 MỒI BẪY. KHÔNG fit model (spec). ----- */
      step_3: {
        ml_pipeline: true,
        blocks: [
          { type: 'py', token: 'continuous_cols = ["study_hours"]',    slot: 'b1' },
          { type: 'py', token: 'discrete_cols = ["missed_classes"]',   slot: 'b2' },
          { type: 'py', token: 'categorical_cols = ["major"]',         slot: 'b3' },
          { type: 'py', token: 'binary_cols = ["scholarship"]',        slot: 'b4' },
          { type: 'py', token: 'feature_cols = continuous_cols + discrete_cols + categorical_cols + binary_cols', slot: 'b5' },
          { type: 'py', token: 'X = df[feature_cols]',                 slot: 'b6' },
          { type: 'py', token: 'y = df["pass_fail"]',                  slot: 'b7' },
          /* 3 mồi bẫy (unsafe-but-correct của spec) */
          { type: 'py', token: 'continuous_cols = ["study_hours", "student_id"]',  slot: 't1' },
          { type: 'py', token: 'binary_cols = ["scholarship", "pass_fail"]',       slot: 't2' },
          { type: 'py', token: 'discrete_cols = ["missed_classes", "scholarship"]', slot: 't3' }
        ],
        drop_zones: [
          { id: 'l4-cont', accepts: ['py'], multi: true },
          { id: 'l4-disc', accepts: ['py'], multi: true },
          { id: 'l4-cat',  accepts: ['py'], multi: true },
          { id: 'l4-bin',  accepts: ['py'], multi: true },
          { id: 'l4-feat', accepts: ['py'], multi: true },
          { id: 'l4-x',    accepts: ['py'], multi: true },
          { id: 'l4-y',    accepts: ['py'], multi: true }
        ],
        ml_flow: {
          brand: 'SCHEMA NGỮ NGHĨA — 3 VÒNG PHÂN LOẠI',
          layout: 'branch',
          run_label: '▶ Chạy 3 vòng',
          source: { sub: 'student_profile · 200 hồ sơ × 6 cột — nhìn "toàn số"' },
          done_note: 'Schema ngữ nghĩa chốt: 4 nhóm kiểu + X (200×4) + y sạch — student_id đứng ngoài, major được đánh dấu chờ encoding. Click lại trạm để mổ xẻ; Bước 4 tự dựng schema bằng Pandas + soi dtype thật.',
          stations: [
            {
              zones: ['l4-y'],
              icon: '🎯', label: 'VÒNG 1 — VAI TRÒ', sub: 'target chốt · định danh loại', result_kind: 'roles_split',
              roles: {
                x: ['study_hours', 'missed_classes', 'major', 'scholarship'],
                y: 'pass_fail',
                banned: [{ col: 'student_id', why: 'ĐỊNH DANH — mã gọi tên, không mang thông tin hành vi; model bám vào là học vẹt số thứ tự.' }],
                x_shape: '4 ứng viên feature', y_shape: 'y (200,) · int 0/1', y_note: '113 Đậu · 87 Rớt'
              },
              narration: 'Trước khi bàn KIỂU, chốt VAI TRÒ: <code>y = pass_fail</code> (vàng) — đáp án cần đoán, 113 Đậu · 87 Rớt. <b>student_id bị GẠCH</b>: "trung bình mã số = 20520100.5" là con số vô nghĩa. 4 cột còn lại (tím) là ứng viên feature — nhưng chúng KHÔNG cùng kiểu nghĩa…'
            },
            {
              zones: ['l4-cont', 'l4-disc', 'l4-cat', 'l4-bin'],
              icon: '🔬', label: 'VÒNG 2 — PHÂN NHÓM KIỂU', sub: '4 feature · 4 nghĩa khác nhau', result_kind: 'type_groups',
              type_groups: {
                groups: [
                  { col: 'study_hours',    kind: 'cont', tag: 'ĐO LIÊN TỤC',   note: 'float64 — 6.5 = 6 giờ 30 phút; mọi giá trị 0.5 → 10.0 hợp lệ.' },
                  { col: 'missed_classes', kind: 'disc', tag: 'ĐẾM RỜI RẠC',   note: 'int64 — 0 → 10 buổi; trung bình 3.0 buổi CÓ nghĩa; không có 2.5 buổi.' },
                  { col: 'major',          kind: 'cat',  tag: 'HẠNG MỤC (chữ)', note: 'object — DS 70 · ICT 66 · Space 64; chữ chưa vào model được → cần encoding.' },
                  { col: 'scholarship',    kind: 'bin',  tag: 'NHỊ PHÂN 0/1',  note: 'int64 nhưng 0/1 là TÊN 2 nhóm (25% có học bổng) — không phải số đếm.' }
                ]
              },
              narration: 'CÙNG là "cột số" mà 4 nghĩa: <code>study_hours</code> ĐO được · <code>missed_classes</code> ĐẾM được · <code>major</code> là CHỮ · <code>scholarship</code> là 0/1 đội lốt số. dtype (int64/float64/object) chỉ nói cách LƯU — <b>nhóm ngữ nghĩa</b> mới quyết định model xử lý ra sao.'
            },
            {
              zones: ['l4-feat', 'l4-x'],
              icon: '📦', label: 'VÒNG 3 — ĐÓNG GÓI X/y', sub: 'readiness card', result_kind: 'readiness',
              readiness: {
                title: 'READINESS CARD — student_profile',
                x_shape: 'X (200 × 4)', x_note: 'study_hours · missed_classes · major · scholarship',
                y_shape: 'y (200,) — pass_fail', y_note: '113 Đậu · 87 Rớt',
                excluded: [{ col: 'student_id', why: 'định danh — đứng ngoài X' }],
                warns: [{ col: 'major', note: 'CẦN ENCODING — 3 tên ngành phải hóa số trước khi train (bài sau xử lý).' }],
                verdict: 'Schema ngữ nghĩa CHUẨN — sẵn sàng cho bước làm sạch & mã hóa.'
              },
              narration: '<code>feature_cols</code> = 4 nhóm cộng lại → <code>X (200 × 4)</code>, <code>y = pass_fail</code>. student_id đứng ngoài cửa. Còn một việc TREO LẠI có chủ đích: <b>major cần encoding</b> — bài này chỉ đánh dấu, chưa mã hóa. Model chưa train được ngay — và đó là điểm mấu chốt: <b>sẵn sàng dữ liệu đi trước train</b>.'
            }
          ]
        },
        expected_sql: 'continuous_cols = ["study_hours"] discrete_cols = ["missed_classes"] categorical_cols = ["major"] binary_cols = ["scholarship"] feature_cols = continuous_cols + discrete_cols + categorical_cols + binary_cols X = df[feature_cols] y = df["pass_fail"]',
        expected_zones: {
          'l4-cont': 'continuous_cols = ["study_hours"]',
          'l4-disc': 'discrete_cols = ["missed_classes"]',
          'l4-cat':  'categorical_cols = ["major"]',
          'l4-bin':  'binary_cols = ["scholarship"]',
          'l4-feat': 'feature_cols = continuous_cols + discrete_cols + categorical_cols + binary_cols',
          'l4-x':    'X = df[feature_cols]',
          'l4-y':    'y = df["pass_fail"]'
        },
        reveal_hints: {
          'l4-cont': 'Nhóm ĐO liên tục chỉ có 1 cột: <strong>study_hours</strong> — đừng rước student_id vào (nó là căn cước, không phải phép đo).',
          'l4-disc': 'Nhóm ĐẾM chỉ có <strong>missed_classes</strong> — scholarship tuy int64 nhưng 0/1 là TÊN 2 nhóm.',
          'l4-cat':  'Hạng mục chữ: <strong>categorical_cols = ["major"]</strong>.',
          'l4-bin':  'Nhị phân: <strong>binary_cols = ["scholarship"]</strong> — và tuyệt đối không kèm pass_fail (target lọt vào feature = leak).',
          'l4-feat': '<strong>feature_cols</strong> = cộng đúng 4 list nhóm theo thứ tự.',
          'l4-x':    '<strong>X = df[feature_cols]</strong> — chọn cột bằng TÊN qua list.',
          'l4-y':    '<strong>y = df["pass_fail"]</strong> — target tách riêng.'
        }
      },

      drag_map: {
        brand: 'SCHEMA NGỮ NGHĨA — 3 VÒNG PHÂN LOẠI',
        table_sub: 'student_profile · 200 hồ sơ hành chính',
        idle_sub: '200 hồ sơ · ▶ chạy để phân loại 6 cột theo NGHĨA',
        run_label: '▶ Chạy 3 vòng',
        table: {
          name: 'student_profile',
          columns: ['student_id', 'study_hours', 'missed_classes', 'major', 'scholarship', 'pass_fail'],
          dataRows: [
          ['20520001', '9.0', '7', 'ICT', '0', '1'],
          ['20520002', '8.2', '5', 'ICT', '0', '1'],
          ['20520003', '4.6', '2', 'ICT', '0', '0'],
          ['20520004', '2.6', '1', 'DS', '0', '0'],
          ['20520005', '9.9', '1', 'ICT', '1', '1'],
          ['20520006', '3.9', '5', 'Space', '1', '1'],
          ['20520007', '5.8', '3', 'ICT', '0', '1'],
          ['20520008', '8.0', '2', 'Space', '0', '1'],
          ['20520009', '7.3', '2', 'Space', '0', '1'],
          ['20520010', '2.2', '5', 'ICT', '0', '0'],
          ['20520011', '4.7', '3', 'ICT', '0', '0'],
          ['20520012', '3.7', '0', 'DS', '0', '0'],
          ['20520013', '3.3', '2', 'DS', '0', '0'],
          ['20520014', '8.7', '1', 'DS', '0', '1'],
          ['20520015', '8.8', '2', 'DS', '0', '1'],
          ['20520016', '3.6', '3', 'DS', '0', '0'],
          ['20520017', '1.0', '4', 'DS', '1', '0'],
          ['20520018', '6.0', '2', 'ICT', '1', '1'],
          ['20520019', '4.0', '8', 'Space', '0', '0'],
          ['20520020', '2.6', '4', 'Space', '0', '0'],
          ['20520021', '6.0', '4', 'DS', '0', '1'],
          ['20520022', '8.2', '3', 'Space', '1', '1'],
          ['20520023', '3.2', '3', 'ICT', '0', '1'],
          ['20520024', '2.2', '4', 'DS', '0', '0'],
          ['20520025', '4.2', '3', 'ICT', '0', '0'],
          ['20520026', '6.5', '3', 'DS', '1', '1'],
          ['20520027', '7.5', '3', 'DS', '0', '1'],
          ['20520028', '2.2', '2', 'Space', '0', '0'],
          ['20520029', '6.7', '1', 'ICT', '1', '1'],
          ['20520030', '1.1', '5', 'Space', '0', '0'],
          ['20520031', '9.0', '4', 'ICT', '0', '1'],
          ['20520032', '1.9', '3', 'ICT', '0', '0'],
          ['20520033', '1.4', '4', 'ICT', '1', '0'],
          ['20520034', '8.9', '0', 'ICT', '0', '1'],
          ['20520035', '0.8', '0', 'DS', '0', '0'],
          ['20520036', '5.6', '3', 'ICT', '1', '1'],
          ['20520037', '2.9', '2', 'Space', '1', '0'],
          ['20520038', '9.4', '5', 'DS', '0', '1'],
          ['20520039', '2.4', '5', 'ICT', '0', '0'],
          ['20520040', '3.5', '3', 'DS', '0', '0'],
          ['20520041', '0.5', '3', 'DS', '0', '0'],
          ['20520042', '8.3', '0', 'ICT', '1', '1'],
          ['20520043', '9.8', '0', 'Space', '0', '1'],
          ['20520044', '2.2', '3', 'ICT', '0', '0'],
          ['20520045', '3.8', '4', 'DS', '0', '0'],
          ['20520046', '2.2', '8', 'DS', '0', '0'],
          ['20520047', '8.1', '5', 'Space', '0', '1'],
          ['20520048', '3.2', '2', 'DS', '1', '1'],
          ['20520049', '6.5', '1', 'ICT', '0', '1'],
          ['20520050', '2.7', '8', 'DS', '1', '0'],
          ['20520051', '4.5', '2', 'ICT', '0', '1'],
          ['20520052', '4.5', '7', 'Space', '0', '0'],
          ['20520053', '1.5', '1', 'DS', '1', '0'],
          ['20520054', '7.2', '2', 'DS', '0', '1'],
          ['20520055', '7.1', '4', 'DS', '0', '1'],
          ['20520056', '5.1', '6', 'ICT', '0', '0'],
          ['20520057', '5.8', '6', 'Space', '1', '1'],
          ['20520058', '6.4', '1', 'ICT', '0', '1'],
          ['20520059', '9.4', '3', 'ICT', '0', '1'],
          ['20520060', '7.1', '4', 'Space', '0', '1'],
          ['20520061', '7.4', '1', 'ICT', '1', '1'],
          ['20520062', '8.4', '3', 'DS', '0', '1'],
          ['20520063', '6.3', '6', 'DS', '1', '1'],
          ['20520064', '0.8', '4', 'Space', '0', '0'],
          ['20520065', '4.6', '6', 'DS', '0', '0'],
          ['20520066', '1.2', '1', 'Space', '0', '1'],
          ['20520067', '9.6', '6', 'DS', '1', '1'],
          ['20520068', '7.9', '4', 'Space', '1', '1'],
          ['20520069', '8.8', '4', 'ICT', '1', '1'],
          ['20520070', '1.0', '2', 'DS', '0', '0'],
          ['20520071', '9.8', '5', 'Space', '0', '1'],
          ['20520072', '0.8', '4', 'ICT', '1', '0'],
          ['20520073', '3.4', '3', 'ICT', '0', '0'],
          ['20520074', '8.4', '5', 'ICT', '0', '1'],
          ['20520075', '9.4', '5', 'Space', '0', '1'],
          ['20520076', '1.1', '3', 'DS', '0', '0'],
          ['20520077', '6.5', '3', 'DS', '0', '1'],
          ['20520078', '1.3', '1', 'DS', '0', '0'],
          ['20520079', '9.9', '2', 'DS', '0', '1'],
          ['20520080', '3.4', '3', 'DS', '0', '0'],
          ['20520081', '8.9', '2', 'ICT', '1', '1'],
          ['20520082', '2.9', '1', 'DS', '0', '0'],
          ['20520083', '7.1', '4', 'Space', '0', '0'],
          ['20520084', '5.0', '1', 'DS', '0', '1'],
          ['20520085', '2.7', '3', 'DS', '0', '0'],
          ['20520086', '1.7', '0', 'DS', '0', '0'],
          ['20520087', '9.3', '3', 'ICT', '0', '1'],
          ['20520088', '8.9', '2', 'DS', '0', '1'],
          ['20520089', '6.7', '3', 'Space', '0', '1'],
          ['20520090', '2.9', '8', 'DS', '0', '0'],
          ['20520091', '0.6', '4', 'ICT', '0', '0'],
          ['20520092', '0.8', '3', 'Space', '0', '0'],
          ['20520093', '7.3', '2', 'DS', '0', '1'],
          ['20520094', '1.1', '2', 'Space', '1', '0'],
          ['20520095', '8.7', '2', 'Space', '0', '1'],
          ['20520096', '4.9', '3', 'DS', '0', '1'],
          ['20520097', '4.3', '3', 'DS', '0', '1'],
          ['20520098', '6.2', '2', 'Space', '0', '1'],
          ['20520099', '3.8', '1', 'ICT', '1', '0'],
          ['20520100', '1.7', '1', 'DS', '0', '0'],
          ['20520101', '7.0', '4', 'Space', '0', '1'],
          ['20520102', '8.9', '0', 'DS', '0', '1'],
          ['20520103', '8.3', '6', 'DS', '1', '1'],
          ['20520104', '9.8', '5', 'ICT', '0', '1'],
          ['20520105', '3.0', '2', 'Space', '1', '0'],
          ['20520106', '7.6', '4', 'Space', '0', '1'],
          ['20520107', '7.4', '1', 'Space', '0', '1'],
          ['20520108', '3.0', '3', 'ICT', '0', '0'],
          ['20520109', '10.0', '3', 'Space', '0', '1'],
          ['20520110', '0.5', '1', 'ICT', '0', '0'],
          ['20520111', '3.1', '10', 'ICT', '0', '0'],
          ['20520112', '3.5', '2', 'ICT', '0', '0'],
          ['20520113', '1.3', '3', 'Space', '1', '0'],
          ['20520114', '5.9', '2', 'Space', '0', '1'],
          ['20520115', '3.5', '1', 'DS', '0', '1'],
          ['20520116', '7.8', '4', 'ICT', '0', '1'],
          ['20520117', '1.0', '2', 'ICT', '0', '0'],
          ['20520118', '2.6', '1', 'Space', '0', '0'],
          ['20520119', '5.2', '4', 'ICT', '0', '0'],
          ['20520120', '1.9', '1', 'ICT', '0', '0'],
          ['20520121', '6.2', '5', 'Space', '1', '1'],
          ['20520122', '1.7', '4', 'Space', '1', '0'],
          ['20520123', '6.3', '4', 'DS', '0', '1'],
          ['20520124', '1.9', '6', 'ICT', '1', '0'],
          ['20520125', '0.8', '3', 'ICT', '0', '0'],
          ['20520126', '2.8', '6', 'ICT', '0', '0'],
          ['20520127', '9.3', '2', 'DS', '0', '1'],
          ['20520128', '9.0', '5', 'ICT', '0', '1'],
          ['20520129', '9.3', '1', 'DS', '0', '1'],
          ['20520130', '8.0', '7', 'ICT', '0', '1'],
          ['20520131', '1.5', '3', 'ICT', '1', '0'],
          ['20520132', '7.8', '4', 'DS', '0', '0'],
          ['20520133', '4.7', '2', 'DS', '0', '1'],
          ['20520134', '8.0', '2', 'DS', '1', '1'],
          ['20520135', '8.0', '4', 'Space', '0', '1'],
          ['20520136', '5.6', '6', 'ICT', '0', '1'],
          ['20520137', '2.9', '2', 'DS', '0', '0'],
          ['20520138', '9.5', '2', 'DS', '0', '1'],
          ['20520139', '6.9', '4', 'Space', '0', '1'],
          ['20520140', '4.2', '3', 'ICT', '0', '1'],
          ['20520141', '3.1', '4', 'ICT', '1', '0'],
          ['20520142', '5.1', '3', 'Space', '1', '0'],
          ['20520143', '1.0', '1', 'ICT', '1', '0'],
          ['20520144', '1.8', '3', 'ICT', '1', '0'],
          ['20520145', '9.4', '2', 'ICT', '0', '1'],
          ['20520146', '9.8', '1', 'ICT', '1', '1'],
          ['20520147', '1.9', '3', 'DS', '1', '0'],
          ['20520148', '6.6', '3', 'Space', '0', '1'],
          ['20520149', '2.7', '2', 'ICT', '0', '0'],
          ['20520150', '10.0', '5', 'DS', '0', '1'],
          ['20520151', '3.5', '2', 'Space', '1', '0'],
          ['20520152', '7.5', '5', 'Space', '0', '1'],
          ['20520153', '1.2', '2', 'DS', '0', '0'],
          ['20520154', '8.5', '2', 'ICT', '0', '1'],
          ['20520155', '10.0', '2', 'Space', '1', '1'],
          ['20520156', '4.5', '2', 'Space', '0', '0'],
          ['20520157', '7.3', '1', 'DS', '0', '1'],
          ['20520158', '6.3', '4', 'Space', '0', '1'],
          ['20520159', '3.1', '2', 'DS', '0', '0'],
          ['20520160', '4.4', '1', 'Space', '1', '1'],
          ['20520161', '2.8', '3', 'Space', '1', '0'],
          ['20520162', '5.4', '1', 'ICT', '0', '0'],
          ['20520163', '2.2', '0', 'Space', '0', '0'],
          ['20520164', '8.7', '1', 'Space', '0', '1'],
          ['20520165', '7.2', '2', 'DS', '1', '0'],
          ['20520166', '8.2', '1', 'Space', '0', '1'],
          ['20520167', '6.7', '2', 'Space', '0', '1'],
          ['20520168', '7.9', '5', 'Space', '0', '1'],
          ['20520169', '2.3', '4', 'DS', '0', '0'],
          ['20520170', '2.6', '2', 'Space', '0', '0'],
          ['20520171', '6.0', '3', 'DS', '0', '0'],
          ['20520172', '7.2', '9', 'Space', '0', '1'],
          ['20520173', '5.9', '3', 'DS', '0', '1'],
          ['20520174', '0.5', '4', 'Space', '1', '0'],
          ['20520175', '5.3', '1', 'Space', '1', '1'],
          ['20520176', '9.1', '3', 'Space', '0', '1'],
          ['20520177', '9.2', '1', 'ICT', '0', '1'],
          ['20520178', '2.4', '2', 'DS', '0', '0'],
          ['20520179', '6.5', '3', 'ICT', '0', '1'],
          ['20520180', '6.9', '1', 'DS', '0', '1'],
          ['20520181', '4.1', '2', 'DS', '0', '1'],
          ['20520182', '8.4', '3', 'Space', '1', '1'],
          ['20520183', '1.0', '3', 'Space', '0', '0'],
          ['20520184', '9.8', '4', 'Space', '0', '1'],
          ['20520185', '6.5', '2', 'Space', '0', '1'],
          ['20520186', '6.0', '1', 'Space', '0', '1'],
          ['20520187', '7.0', '2', 'DS', '1', '1'],
          ['20520188', '7.3', '2', 'Space', '1', '1'],
          ['20520189', '8.9', '3', 'DS', '0', '1'],
          ['20520190', '4.0', '0', 'DS', '0', '0'],
          ['20520191', '7.4', '4', 'Space', '1', '1'],
          ['20520192', '7.2', '2', 'ICT', '1', '1'],
          ['20520193', '8.3', '4', 'ICT', '0', '1'],
          ['20520194', '4.5', '1', 'ICT', '0', '0'],
          ['20520195', '4.6', '3', 'ICT', '0', '0'],
          ['20520196', '0.9', '7', 'Space', '0', '0'],
          ['20520197', '6.0', '3', 'ICT', '0', '1'],
          ['20520198', '5.2', '4', 'ICT', '0', '1'],
          ['20520199', '5.6', '4', 'DS', '0', '1'],
          ['20520200', '7.6', '3', 'DS', '0', '1']
          ]
        }
      },

      /* ----- STEP 4: soi dtype/unique + dựng schema thật (KHÁC câu step 3: thêm khảo sát
         df.dtypes + unique — rule "Step 4 ≠ Step 3"). Grader: grade_lesson4 semantic. ----- */
      step_4: {
        prompt: 'Bước 3 bạn phân loại bằng tay. Giờ làm như kỹ sư dữ liệu thật: <strong>soi bảng trước</strong> — in <code>df.dtypes</code> và các giá trị <code>unique</code> — rồi mới dựng 4 list nhóm, <code>feature_cols</code>, <code>X</code> và <code>y</code>. Hệ thống chấm sẽ <strong>XÁO thứ tự dòng</strong> và soi cả <strong>NGỮ NGHĨA</strong> từng nhóm.',
        context: {
          scenario: 'Schema này là đầu vào cho toàn bộ M2: bài 5 làm sạch, bài 6 scale, bài 7 thống kê — sai ở đây là sai dây chuyền. Hidden test xáo 200 dòng và soi từng list: student_id lọt vào bất kỳ nhóm nào, hoặc scholarship bị xếp nhóm số, đều bị tầng Risk réo tên.',
          real_world: 'Chuyện thật của giới thi ML: một cuộc thi đọc X-quang phổi có model đạt điểm rất cao — về sau mới lộ ra nó "học" từ MÃ MÁY CHỤP trong metadata: máy di động chỉ dùng ở khoa cấp cứu, nơi toàn ca nặng. Đổi bệnh viện là model sập. Một cột định danh lọt vào X — thế là đủ. Schema ngữ nghĩa chính là hàng rào đầu tiên.',
          steps: [
            'Import hàm nạp dữ liệu từ <code>ml_lab</code>, nạp <code>df</code>.',
            'Soi bảng: in <code>df.dtypes</code> + giá trị unique của 2 cột đáng ngờ (major, scholarship).',
            'Dựng 4 list nhóm theo NGHĨA (mỗi list đúng cột của nó).',
            'Cộng 4 list thành <code>feature_cols</code>, tách <code>X</code> và <code>y</code>.',
            'Run chạy thử · Submit chấm 4 tầng (Risk soi ngữ nghĩa từng nhóm).'
          ],
          hint_explore: 'Muốn tự khám phá? Gõ <code>print(df.head())</code>, <code>print(df.dtypes)</code> hoặc <code>print(df["major"].value_counts())</code> rồi <strong>Run</strong> — bảng này còn nhiều thứ hay.',
          expected: 'Console in bảng dtypes (để ý: <strong>3 cột cùng int64!</strong>), rồi <code>[\'ICT\' \'DS\' \'Space\']</code> và <code>[0 1]</code>. Đủ 4 tầng xanh. Thử nhét scholarship vào discrete_cols? Code VẪN chạy — tầng Risk sẽ giải thích vì sao schema sai nghĩa.'
        },
        hints: [
          { level: 1, text: 'Đúng trình tự Bước 3: soi bảng → 4 list nhóm → feature_cols → X, y. Khác biệt duy nhất: lần này bạn TỰ soi dtype/unique bằng code.' },
          { level: 2, text: 'Dòng 1: <code>from ml_lab import load_student_profile</code>. Dòng 2: <code>df = load_student_profile()</code>. Soi: <code>print(df.dtypes)</code>, <code>print(df["major"].unique())</code>, <code>print(df["scholarship"].unique())</code>.' },
          { level: 3, text: '4 list — mỗi list đúng 1 cột: continuous (study_hours) · discrete (missed_classes) · categorical (major) · binary (scholarship). student_id KHÔNG vào list nào; pass_fail chỉ ở y. feature_cols = cộng 4 list; X = df[feature_cols]; y = df["pass_fail"].' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>from ml_lab import load_student_profile<br>df = load_student_profile()<br>print(df.dtypes)<br>print(df["major"].unique())<br>print(df["scholarship"].unique())<br>continuous_cols = ["study_hours"]<br>discrete_cols = ["missed_classes"]<br>categorical_cols = ["major"]<br>binary_cols = ["scholarship"]<br>feature_cols = continuous_cols + discrete_cols + categorical_cols + binary_cols<br>X = df[feature_cols]<br>y = df["pass_fail"]<br>print(X.shape)<br>print(y.shape)</code>' }
        ],
        grader_fn: 'grade_lesson4',
        success_message: 'Schema ngữ nghĩa chuẩn: 4 nhóm đúng nghĩa, X (200×4) không dính ID, y tách sạch — và major đã được đánh dấu chờ encoding. Bảng của bạn chính thức SẴN SÀNG cho M2: bài 5 sẽ đối mặt dữ liệu BẨN thật sự.',
        xp_reward: 50
      }
    },
    /* ═══════════ BÀI 5 — Làm sạch dữ liệu bẩn (spec C1-L5 tr.27-30) ═══════════
     * Đợt 9 (2026-07-20, user chốt): story = BẢN XUẤT THÔ hệ điểm 10 · hero = ỐNG KÍNH LỖI
     * + câu đố chốt XÓA/CẮM-CỜ · step 3 = map 4 VÒNG + bảng ĐẾM đổi số · persona neo Hùng/Mai.
     * Dataset load_dirty_student_profile (seed 1501): 204 dòng — MỌI số tính từ engine:
     * 4 trùng 100% → 200; missing 9→(invalid→NaN)11→0; invalid 4(2 phạm vi+2 danh mục);
     * outlier study_hours 60 & 45 (>40) GIỮ + cắm cờ; median study 6.0·att 6.4·quiz 4.9.
     * grade_lesson5 semantic có sẵn — KHÔNG fit model, chấm recipe làm sạch (spec). */
    {
      id: 'c1_l5',
      index: 5,
      title: 'Làm sạch dữ liệu bẩn',
      subtitle: 'Sai chắc chắn thì sửa — chỉ nghi ngờ thì CẮM CỜ, đừng xóa',
      module: 11,
      module_title: 'M2 — Dữ liệu sẵn sàng',
      estimated_minutes: 19,
      xp_reward: 50,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      story: {
        tag: '🎓 StudyLab · Ticket #05',
        hook: 'Schema đã chuẩn, nhưng Ticket #05 mang tin xấu: <strong>bản xuất THÔ</strong> mà phòng đào tạo gửi — gộp từ nhiều nguồn, nhập tay — <strong>đầy lỗi</strong>. Đây là sổ điểm <strong>hệ 10</strong> thật: <code>attendance</code> (chuyên cần) và <code>quiz_score</code> (điểm quiz) đều chấm trên thang <strong>0–10</strong>. Mở file ra: <strong>204 dòng</strong> mà lẽ ra chỉ có 200 (có dòng bị nhân đôi); vài ô bỏ trống; bạn <strong>Hùng</strong> bị ghi chuyên cần <code>12/10</code> (nhập nhầm — không thể quá 10); một ô ngành ghi <code>ITC</code> (gõ đảo của ICT); và bạn <strong>Mai</strong> ghi tự học <code>60 giờ/tuần</code> — bất thường, nhưng… biết đâu Mai ôn thi thật? Nhiệm vụ: làm sạch <strong>BẢO THỦ</strong> — sửa cái CHẮC CHẮN sai, nhưng KHÔNG vứt cái chỉ mới nghi ngờ.'
      },
      achievement: { name: 'Data Preparation Scout — Làm sạch bảo thủ', desc: 'phân biệt sai vs bất thường, làm sạch không mất dữ liệu quý' },

      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Nhận ra <strong>4 loại lỗi</strong> dữ liệu: ô THIẾU · dòng TRÙNG 100% · giá trị SAI (phạm vi/danh mục) · điểm NGHI NGỜ (outlier).',
            'Chọn hành động theo BẰNG CHỨNG: bỏ / đổi-thành-thiếu / điền median / gộp-Unknown / <strong>cắm cờ</strong> — thay vì "thay hết bằng 0" hay "xóa mọi outlier".',
            'Dựng <code>clean_df</code> giữ nguyên <code>df</code> gốc, và hiểu vì sao median để điền phải học từ <strong>TRAIN split</strong> (bài Course 2).'
          ]
        },
        glossary: [
          { term: 'MISSING (NaN)', vi: 'ô thiếu', accent: '#F87171',
            def: 'Ô <b>bỏ trống</b> — hệ thống KHÔNG ghi được giá trị. "Không biết" <b>khác</b> "bằng 0".',
            ex: 'ô điểm quiz trống vì bạn đó nghỉ hôm kiểm tra — không phải được 0 điểm.',
            out: 'pandas hiện NaN · xử l: điền (impute), KHÔNG điền 0' },
          { term: 'DUPLICATE', vi: 'dòng trùng 100%', accent: '#38BDF8',
            def: 'Hai dòng <b>giống HỆT nhau mọi cột</b> — bản ghi bị nhân đôi khi gộp file.',
            ex: 'xuất file 2 lần rồi dán chồng → 1 học viên xuất hiện 2 lần y hệt.',
            out: 'df.drop_duplicates() · lưu ý: cùng ID mà số KHÁC thì KHÔNG phải trùng' },
          { term: 'INVALID', vi: 'giá trị sai', accent: '#FB923C',
            def: 'Giá trị <b>chắc chắn sai</b>: ngoài phạm vi (12 trên thang 0–10) hoặc sai danh mục (ITC không có trong ICT/DS/Space).',
            ex: 'chấm chuyên cần hệ 10 mà ghi 12 — không thể tồn tại.',
            out: 'phạm vi → đổi NaN rồi điền · danh mục → gộp "Unknown"' },
          { term: 'OUTLIER', vi: 'điểm nghi ngờ', accent: '#A78BFA',
            def: 'Giá trị <b>bất thường</b> nhưng CÓ THỂ THẬT — không đủ bằng chứng nói là sai.',
            ex: 'tự học 60 giờ/tuần: hiếm, nhưng một bạn ôn thi cật lực có thể thật.',
            out: 'CẮM CỜ để review — KHÔNG tự động xóa' },
          { term: 'IMPUTE', vi: 'điền chỗ thiếu', accent: '#34D399',
            def: 'Điền ô NaN bằng một ước lượng <b>hợp lý</b> — hay dùng <b>median</b> (trung vị, ít bị outlier kéo).',
            ex: 'ô giờ học trống → điền bằng median cả cột (6.0h), không điền 0.',
            out: 'fillna(median) · ⚠ median phải học từ TRAIN split' },
          { term: 'FLAG', vi: 'cắm cờ', accent: '#FBBF24',
            def: 'Thêm 1 cột <b>đánh dấu</b> (True/False) để CON NGƯỜI review sau — dữ liệu vẫn giữ nguyên.',
            ex: 'study_hours_outlier = study_hours > 40 → dòng của Mai bật cờ.',
            out: 'cột cờ mới · dòng bất thường VẪN CÒN trong bảng' }
        ],
        primer: {
          goal: [
            '4 loại lỗi: thiếu · trùng · sai · nghi ngờ',
            'Hành động theo bằng chứng (sai→sửa, nghi→cờ)',
            'clean_df bảo thủ — không mất dữ liệu quý'
          ],
          intro: '',
          example: '🔍 <strong>Bấm cột <code>attendance</code> trong SCHEMA EXPLORER bên dưới:</strong> lẽ ra chỉ 0–10, nhưng có ô lọt ra 12. Rồi bấm <code>major</code>: đúng ra chỉ ICT/DS/Space, nhưng lẫn "ITC". Đây là 2 kiểu "SAI chắc chắn" — khác hẳn số 60 giờ học của Mai (bất thường mà có thể thật). Giữ phân biệt này khi sang Bước 2 👇'
        },
        intro: 'Bảng thô KHÔNG dùng để train ngay được — nó lẫn 4 loại lỗi. Việc làm sạch giống bác sĩ: <strong>chỉ can thiệp khi CHẮC CHẮN có bệnh</strong>. Sai rõ ràng (12/10, ITC, dòng trùng) thì sửa; còn cái chỉ <em>nghi ngờ</em> (60 giờ/tuần) thì đánh dấu để hỏi lại, tuyệt đối không vứt bừa — vì xóa nhầm dữ liệu thật là mất mát không lấy lại được.',
        concept_cards: [
          {
            icon: 'fa-scale-balanced',
            title: 'SAI ≠ Bất thường',
            body: 'Chuyên cần <code>12/10</code> hay ngành <code>ITC</code> là SAI chắc chắn (vi phạm luật đã biết) → sửa. Nhưng <code>60 giờ/tuần</code> chỉ BẤT THƯỜNG — có thể thật → <strong>cắm cờ</strong>, không xóa. Ranh giới: có <strong>bằng chứng</strong> nói nó sai không? Không có thì GIỮ.'
          },
          {
            icon: 'fa-question',
            title: 'Missing ≠ 0',
            body: 'Ô trống nghĩa là "KHÔNG BIẾT", không phải "bằng 0". Điền 0 vào ô giờ học trống = bịa rằng bạn đó học 0 giờ — bóp méo dữ liệu. Cách bảo thủ: điền <strong>median</strong> (trung vị) — giá trị điển hình, ít bị kéo lệch bởi outlier.'
          },
          {
            icon: 'fa-list-ol',
            title: 'Recipe có THỨ TỰ',
            body: 'Làm sạch theo trình tự: soi → bỏ trùng → chữa sai → điền thiếu → cắm cờ → kiểm chứng. Đổi thứ tự dễ hỏng (điền median TRƯỚC khi bỏ giá trị 12 thì median bị 12 kéo lệch). ⚠ Và median phải học từ <strong>TRAIN split</strong> — dùng cả bảng là rò rỉ (Course 2).'
          }
        ],
        /* Hero = ỐNG KÍNH LỖI (user chốt 2026-07-20) — bấm ô lỗi tô màu → loại + hành động */
        quality_lens: {
          title: 'ỐNG KÍNH LỖI — BẢNG NÀY SAI Ở ĐÂU?',
          intro: '8 dòng đầu của bản xuất thô. Các ô <b>tô màu</b> là lỗi. Bấm từng ô để biết đó là lỗi GÌ và nên xử lý ra sao (đủ 5 loại thì mở câu chốt).',
          columns: [
            { name: 'study_hours',  unit: 'giờ/tuần' },
            { name: 'attendance',   unit: '/10' },
            { name: 'quiz_score',   unit: '/10' },
            { name: 'major',        unit: 'ngành' },
            { name: 'pass_fail',    unit: '0/1' }
          ],
          rows: [
            ['6.5', '8.0', '7.0', 'ICT', '1'],
            ['3.2', '5.5', '4.0', 'DS', '0'],
            ['5.0', '12.0', '6.0', 'DS', '1'],
            ['7.0', '7.5', '8.0', 'ITC', '1'],
            ['60.0', '9.0', '8.5', 'Space', '1'],
            ['4.5', '6.0', null, 'ICT', '0'],
            ['8.0', '9.5', '9.0', 'Space', '1'],
            ['6.5', '8.0', '7.0', 'ICT', '1']
          ],
          issues: [
            { cell: '5:2', kind: 'missing', tag: 'THIẾU',
              evidence: 'Ô <code>quiz_score</code> bỏ trống (NaN) — hệ thống không ghi được điểm quiz. "Không biết" chứ không phải "0 điểm".',
              action: 'Điền median (≈ 4.9) — KHÔNG điền 0' },
            { cell: '2:1', kind: 'invalid-range', tag: 'SAI PHẠM VI', name: 'Hùng',
              evidence: 'Chuyên cần chấm <b>hệ 10</b> mà ghi <code>12</code> — không thể vượt 10. Chắc chắn nhập nhầm khi gõ tay.',
              action: 'Đổi thành NaN rồi điền median' },
            { cell: '3:3', kind: 'invalid-cat', tag: 'SAI DANH MỤC',
              evidence: 'Ngành hợp lệ chỉ <code>ICT / DS / Space</code>. "<code>ITC</code>" là gõ đảo chữ của ICT — sai danh mục.',
              action: 'Gộp về "Unknown" (an toàn) hoặc sửa ICT nếu chắc' },
            { cell: '4:0', kind: 'outlier', tag: 'NGHI NGỜ', name: 'Mai',
              evidence: '<code>60</code> giờ tự học/tuần ≈ 8.5h/ngày — bất thường, NHƯNG một bạn ôn thi cật lực có thể thật. Không có bằng chứng nói nó SAI.',
              action: 'CẮM CỜ để review — KHÔNG xóa' },
            { row: 7, kind: 'duplicate', tag: 'TRÙNG 100%',
              evidence: 'Dòng 8 giống <b>HỆT</b> dòng 1 ở mọi cột — bản ghi bị nhân đôi khi gộp file. (Khác: cùng mã SV mà số liệu KHÁC thì KHÔNG phải trùng, cần review.)',
              action: 'Bỏ dòng trùng (drop_duplicates)' }
          ],
          riddle: {
            prompt: 'Bạn <b>Mai</b> ghi tự học <code>60 giờ/tuần</code> — bất thường. Nên làm gì?',
            options: ['XÓA dòng đó', 'CẮM CỜ để review', 'Thay bằng 0'],
            answer: 'CẮM CỜ để review',
            wrong: {
              'XÓA dòng đó': 'Xóa là vứt dữ liệu có thể THẬT — Mai có thể ôn thi 60h/tuần thật. Bất thường ≠ sai; không đủ bằng chứng thì GIỮ + cắm cờ.',
              'Thay bằng 0': '60 không phải ô thiếu hay giá trị sai rõ ràng — thay 0 còn tệ hơn (bịa "học 0 giờ"). Giữ nguyên + cắm cờ để người review.'
            },
            done: '✅ Chuẩn — <b>CẮM CỜ</b> (study_hours_outlier), KHÔNG xóa. Đó là tinh thần làm sạch BẢO THỦ: sửa khi CHẮC CHẮN sai (12/10, ITC, dòng trùng), nhưng GIỮ + đánh dấu khi chỉ NGHI NGỜ. Xóa nhầm 1 outlier thật là mất thông tin quý. Xuống Bước 2 luyện phân loại 👇'
          }
        },
        visual: {
          schema: {
            table_name: 'student_profile_dirty (bản xuất thô)',
            columns: [
              { name: 'student_id',  type: 'INT64 · định danh', key: 'ID', icon: '🪪',
                note: '<strong>Identifier</strong> — có 4 dòng trùng 100% (mã + mọi cột y hệt) do gộp file. drop_duplicates bỏ 4 dòng: 204 → 200.' },
              { name: 'study_hours', type: 'FLOAT · giờ/tuần', key: '', icon: '',
                note: '<strong>Feature</strong> — vài ô trống (NaN) + 2 outlier 60 & 45 giờ/tuần. NaN → điền median (6.0); outlier → CẮM CỜ, giữ nguyên.' },
              { name: 'attendance', type: 'FLOAT · %', key: '', icon: '',
                note: '<strong>Chuyên cần hệ 10</strong> — hợp lệ 0–10. Có ô ghi 12 (nhập nhầm, sai phạm vi) + vài ô trống. 12 → NaN → median (6.4).' },
              { name: 'quiz_score', type: 'FLOAT · /10', key: '', icon: '',
                note: '<strong>Điểm quiz hệ 10</strong> — hợp lệ 0–10. Có ô ghi 15 (sai phạm vi) + vài ô trống. 15 → NaN → median (4.9).' },
              { name: 'major', type: 'OBJECT · ngành', key: '', icon: '🏷️',
                note: '<strong>Categorical</strong> — hợp lệ ICT/DS/Space. Có 2 ô "ITC" (gõ đảo, sai danh mục) → gộp về "Unknown".' },
              { name: 'pass_fail', type: 'INT 0/1', key: 'TARGET', icon: '🎯',
                note: '<strong>Target</strong> — Đậu/Rớt. Bài này CHỈ làm sạch, chưa train; giữ target sạch để bài sau dùng.' }
            ]
          },
          /* 8 dòng thô minh họa (khớp thang & loại lỗi của dataset thật) */
          data_preview: [
            ['20520001', '6.5', '8.0', '7.0', 'ICT', '1'],
            ['20520002', '3.2', '5.5', '4.0', 'DS', '0'],
            ['20520003', '5.0', '12.0', '6.0', 'DS', '1'],
            ['20520004', '7.0', '7.5', '8.0', 'ITC', '1'],
            ['20520005', '60.0', '9.0', '8.5', 'Space', '1'],
            ['20520006', '4.5', '6.0', '—', 'ICT', '0'],
            ['20520007', '8.0', '9.5', '9.0', 'Space', '1'],
            ['20520001', '6.5', '8.0', '7.0', 'ICT', '1']
          ]
        },
        mission: 'Dựng <code class="code">RECIPE LÀM SẠCH</code> cho bản thô 204 dòng: bỏ 4 dòng trùng · đổi giá trị sai phạm vi thành NaN · gộp ITC→Unknown · điền median · <code class="code">CẮM CỜ</code> outlier (giữ nguyên) — kho có <code class="code">mồi bẫy 🪤</code> (điền 0 · xóa outlier) ↓'
      },

      /* ----- STEP 2: 3 MCQ + mini-game phân loại lỗi → hành động ----- */
      step_2: {
        mcq: [
          {
            question: 'Chuyên cần chấm <strong>hệ 10</strong> (0–10) mà một ô ghi <code>12</code>. Đây là loại vấn đề gì?',
            options: [
              { id: 'a', text: 'SAI phạm vi — chắc chắn nhập nhầm, không thể vượt 10', correct: true, explanation: 'Đúng — 12 vi phạm luật đã biết (thang 0–10) nên CHẮC CHẮN sai. Xử lý: đổi thành NaN rồi điền median (đừng đoán bừa giá trị thật).' },
              { id: 'b', text: 'Outlier — bất thường nhưng có thể thật', correct: false, explanation: 'Outlier là giá trị hiếm nhưng KHÔNG vi phạm luật nào (vd 60 giờ học). 12 trên thang 0–10 thì vi phạm luật rõ ràng → là SAI, không phải outlier.' },
              { id: 'c', text: 'Missing — ô thiếu dữ liệu', correct: false, explanation: 'Ô này CÓ giá trị (12), chỉ là giá trị sai. Missing là ô bỏ TRỐNG (NaN).' },
              { id: 'd', text: 'Không sao — cứ để nguyên 12', correct: false, explanation: 'Để 12 trên thang 0–10 sẽ bóp méo median, khoảng cách, mọi phép tính sau. Phải chữa.' }
            ]
          },
          {
            question: 'Ô <code>study_hours</code> của một bạn bị <strong>bỏ trống (NaN)</strong>. Cách xử lý nào ĐÚNG tinh thần bảo thủ?',
            options: [
              { id: 'a', text: 'Điền bằng median của cột (giá trị điển hình)', correct: true, explanation: 'Đúng — median là ước lượng hợp lý, ít bị outlier kéo lệch. Giữ được dòng mà không bịa thông tin cực đoan.' },
              { id: 'b', text: 'Điền 0 — coi như bạn đó không học', correct: false, explanation: 'Cái bẫy kinh điển: "không biết" KHÁC "bằng 0". Điền 0 = bịa rằng bạn đó học 0 giờ, bóp méo dữ liệu và làm model học sai.' },
              { id: 'c', text: 'Xóa luôn cả dòng đó', correct: false, explanation: 'Xóa cả dòng vì 1 ô thiếu là phí — các cột khác của dòng vẫn tốt. Chỉ xóa khi thiếu quá nhiều hoặc thiếu chính TARGET.' },
              { id: 'd', text: 'Điền bằng giá trị lớn nhất cột', correct: false, explanation: 'Max thường là outlier (60) — điền max làm dòng đó thành cực đoan giả. Median mới là "điển hình".' }
            ]
          },
          /* Câu 3 — spec misconception "same ID different values ≠ exact duplicate" + ôn glossary */
          {
            question: 'Hai dòng có <strong>cùng student_id</strong> nhưng <code>attendance</code> KHÁC nhau (8.0 vs 6.5). Có nên <code>drop_duplicates</code> để bỏ 1 dòng không?',
            options: [
              { id: 'a', text: 'KHÔNG — số liệu khác nhau thì không phải trùng 100%, cần review', correct: true, explanation: 'Chuẩn — "trùng 100%" là giống HỆT MỌI cột. Cùng ID mà số khác = mâu thuẫn dữ liệu (2 lần ghi lệch nhau) → phải điều tra, không âm thầm bỏ 1 dòng.' },
              { id: 'b', text: 'Có — cùng ID là trùng, bỏ 1 dòng ngay', correct: false, explanation: 'drop_duplicates chỉ bỏ dòng giống HỆT mọi cột. Cùng ID mà giá trị khác là chuyện KHÁC — bỏ bừa có thể mất bản ghi đúng.' },
              { id: 'c', text: 'Có — giữ dòng có attendance cao hơn', correct: false, explanation: 'Chọn giữ dòng nào là quyết định CÓ CĂN CỨ (theo thời gian ghi, nguồn tin cậy…), không phải "cứ lấy số cao". Bước này cần review, không tự động.' },
              { id: 'd', text: 'Xóa cả hai dòng cho chắc', correct: false, explanation: 'Xóa cả hai là mất trắng thông tin của học viên đó. Tinh thần bảo thủ: giữ + đánh dấu mâu thuẫn để review.' }
            ]
          }
        ],
        mini_game: {
          title: 'Xếp mỗi lỗi vào đúng HÀNH ĐỘNG',
          instruction: 'Hành động đi theo BẰNG CHỨNG. Kéo mỗi ca vào đúng ngăn: <strong>SỬA / BỎ</strong> (chắc chắn sai) · <strong>ĐIỀN median</strong> (ô thiếu) · <strong>GIỮ + CẮM CỜ</strong> (chỉ nghi ngờ).',
          chips: [
            { id: 'q-dup',    label: 'Dòng giống HỆT 100%' },
            { id: 'q-range',  label: 'attendance = 12/10' },
            { id: 'q-cat',    label: 'major = ITC' },
            { id: 'q-miss1',  label: 'ô study_hours trống' },
            { id: 'q-miss2',  label: 'ô quiz_score trống' },
            { id: 'q-out',    label: 'study_hours = 60/tuần' }
          ],
          bins: [
            { id: 'fix',  label: '🔧 SỬA / BỎ',       correct: 'true' },
            { id: 'fill', label: '💧 ĐIỀN median',    correct: 'true' },
            { id: 'flag', label: '🚩 GIỮ + CẮM CỜ',   correct: 'true' }
          ],
          solution: {
            'q-dup':   'fix',
            'q-range': 'fix',
            'q-cat':   'fix',
            'q-miss1': 'fill',
            'q-miss2': 'fill',
            'q-out':   'flag'
          },
          success: 'Thấy quy tắc chưa — hành động đi theo BẰNG CHỨNG: chắc chắn sai thì SỬA/BỎ, thiếu thì ĐIỀN median, chỉ nghi ngờ thì GIỮ + CẮM CỜ. Không có ô nào "thay hết bằng 0" hay "xóa mọi outlier". Đó là recipe Bước 3 sắp dựng.'
        }
      },

      /* ----- STEP 3: map 4 VÒNG (spec) — recipe làm sạch + bảng ĐẾM đổi số. KHÔNG fit. ----- */
      step_3: {
        ml_pipeline: true,
        blocks: [
          { type: 'py', token: 'clean_df = df.drop_duplicates().copy()',                                      slot: 'b1' },
          { type: 'py', token: 'clean_df.loc[~clean_df["attendance"].between(0, 10), "attendance"] = np.nan',  slot: 'b2' },
          { type: 'py', token: 'clean_df.loc[~clean_df["quiz_score"].between(0, 10), "quiz_score"] = np.nan',  slot: 'b3' },
          { type: 'py', token: 'clean_df.loc[~clean_df["major"].isin(["ICT", "DS", "Space"]), "major"] = "Unknown"', slot: 'b4' },
          { type: 'py', token: 'clean_df = clean_df.fillna(clean_df.median(numeric_only=True))',              slot: 'b5' },
          { type: 'py', token: 'clean_df["study_hours_outlier"] = clean_df["study_hours"] > 40',              slot: 'b6' },
          /* 2 mồi bẫy (unsafe-but-correct của spec) */
          { type: 'py', token: 'clean_df = clean_df.fillna(0)',                                                slot: 't1' },
          { type: 'py', token: 'clean_df = clean_df[clean_df["study_hours"] <= 40]',                          slot: 't2' }
        ],
        drop_zones: [
          { id: 'l5-dedup',   accepts: ['py'], multi: true },
          { id: 'l5-inv-att', accepts: ['py'], multi: true },
          { id: 'l5-inv-quiz',accepts: ['py'], multi: true },
          { id: 'l5-cat',     accepts: ['py'], multi: true },
          { id: 'l5-fill',    accepts: ['py'], multi: true },
          { id: 'l5-flag',    accepts: ['py'], multi: true }
        ],
        ml_flow: {
          brand: 'RECIPE LÀM SẠCH — 4 VÒNG · BẢNG ĐẾM',
          layout: 'branch',
          run_label: '▶ Chạy 4 vòng',
          source: { sub: 'student_profile_dirty · 204 dòng thô (4 trùng · 9 thiếu · 4 sai · 2 outlier)' },
          done_note: 'Bảng SẠCH: 200 dòng · 0 trùng · 0 sai · 0 thiếu số — nhưng 2 outlier VẪN CÒN (đã cắm cờ). Click lại vòng để xem bảng đếm; Bước 4 tự viết recipe + validate bằng Pandas thật.',
          stations: [
            {
              zones: ['l5-dedup'],
              icon: '🧹', label: 'VÒNG 1 — BỎ TRÙNG', sub: 'drop_duplicates', result_kind: 'quality_counts',
              quality: {
                before: { rows: 204, dup: 4, invalid: 4, missing: 9, flag: 0 },
                after:  { rows: 200, dup: 0, invalid: 4, missing: 9, flag: 0 },
                changed: ['rows', 'dup'],
                note: '4 dòng trùng 100% biến mất → <b>204 → 200 dòng</b>. Chỉ bỏ dòng giống HỆT; chưa đụng gì tới sai/thiếu.'
              },
              narration: '<code>drop_duplicates()</code> bỏ 4 bản ghi nhân đôi (giống hệt mọi cột) → 200 dòng. <code>.copy()</code> để <b>giữ nguyên df gốc</b> — không phá bảng thô. Các lỗi khác vẫn nguyên, xử ở vòng sau.'
            },
            {
              zones: ['l5-inv-att', 'l5-inv-quiz'],
              icon: '🩹', label: 'VÒNG 2 — SAI PHẠM VI → THIẾU', sub: 'invalid range = NaN', result_kind: 'quality_counts',
              quality: {
                before: { rows: 200, dup: 0, invalid: 4, missing: 9, flag: 0 },
                after:  { rows: 200, dup: 0, invalid: 2, missing: 11, flag: 0 },
                changed: ['invalid', 'missing'],
                note: '2 giá trị ngoài thang (12 & 15) đổi thành NaN. <b>Thiếu TĂNG 9 → 11</b> — CÓ CHỦ ĐÍCH: ta chưa biết giá trị thật, nên biến "sai" thành "chưa biết" rồi điền ở vòng sau.'
              },
              narration: '<code>~between(0,10)</code> bắt ô ngoài thang 0–10 (12, 15) và gán <code>np.nan</code>. Số THIẾU tăng lên — nghe ngược nhưng đúng: thà nhận "không biết" còn hơn giữ giá trị bịa. Danh mục ITC vẫn chờ vòng 3.'
            },
            {
              zones: ['l5-cat', 'l5-fill'],
              icon: '💧', label: 'VÒNG 3 — GỘP + ĐIỀN', sub: 'Unknown + fillna(median)', result_kind: 'quality_counts',
              quality: {
                before: { rows: 200, dup: 0, invalid: 2, missing: 11, flag: 0 },
                after:  { rows: 200, dup: 0, invalid: 0, missing: 0, flag: 0 },
                changed: ['invalid', 'missing'],
                note: 'ITC → "Unknown" (hết sai danh mục) và 11 ô NaN được điền <b>median</b> (study 6.0 · att 6.4 · quiz 4.9). <b>Sai & thiếu về 0</b> — không xóa dòng nào.'
              },
              narration: '<code>~isin([...])</code> gộp ngành lạ (ITC) về "Unknown" — an toàn khi chưa chắc. <code>fillna(median)</code> điền MỌI ô trống bằng trung vị cột: giá trị điển hình, không bịa cực đoan. 200 dòng nguyên vẹn.'
            },
            {
              zones: ['l5-flag'],
              icon: '🚩', label: 'VÒNG 4 — CẮM CỜ + CHỐT', sub: 'flag outlier + validate', result_kind: 'quality_counts',
              quality: {
                before: { rows: 200, dup: 0, invalid: 0, missing: 0, flag: 0 },
                after:  { rows: 200, dup: 0, invalid: 0, missing: 0, flag: 2 },
                changed: ['flag'],
                note: '<code>study_hours > 40</code> bật cờ 2 dòng (60 & 45) — <b>vẫn còn trong bảng</b>, chỉ đánh dấu để review. Bảng sạch mà KHÔNG mất outlier có thể thật.'
              },
              narration: '<code>study_hours_outlier = study_hours > 40</code> tạo cột cờ True/False. 2 dòng của Mai (60) và 1 bạn khác (45) bật cờ — con người sẽ xem lại. Đây là làm sạch BẢO THỦ: sửa cái chắc, giữ + đánh dấu cái nghi.'
            }
          ]
        },
        expected_sql: 'clean_df = df.drop_duplicates().copy() clean_df.loc[~clean_df["attendance"].between(0, 10), "attendance"] = np.nan clean_df.loc[~clean_df["quiz_score"].between(0, 10), "quiz_score"] = np.nan clean_df.loc[~clean_df["major"].isin(["ICT", "DS", "Space"]), "major"] = "Unknown" clean_df = clean_df.fillna(clean_df.median(numeric_only=True)) clean_df["study_hours_outlier"] = clean_df["study_hours"] > 40',
        expected_zones: {
          'l5-dedup':    'clean_df = df.drop_duplicates().copy()',
          'l5-inv-att':  'clean_df.loc[~clean_df["attendance"].between(0, 10), "attendance"] = np.nan',
          'l5-inv-quiz': 'clean_df.loc[~clean_df["quiz_score"].between(0, 10), "quiz_score"] = np.nan',
          'l5-cat':      'clean_df.loc[~clean_df["major"].isin(["ICT", "DS", "Space"]), "major"] = "Unknown"',
          'l5-fill':     'clean_df = clean_df.fillna(clean_df.median(numeric_only=True))',
          'l5-flag':     'clean_df["study_hours_outlier"] = clean_df["study_hours"] > 40'
        },
        reveal_hints: {
          'l5-dedup':    'Vòng 1: bỏ dòng trùng 100% + GIỮ df gốc: <strong>clean_df = df.drop_duplicates().copy()</strong>.',
          'l5-inv-att':  'attendance ngoài thang 0–10 → NaN: <strong>clean_df.loc[~clean_df["attendance"].between(0, 10), "attendance"] = np.nan</strong>.',
          'l5-inv-quiz': 'quiz_score tương tự: <strong>...["quiz_score"].between(0, 10)... = np.nan</strong>.',
          'l5-cat':      'Ngành lạ → Unknown: <strong>...~isin(["ICT","DS","Space"]), "major"] = "Unknown"</strong>.',
          'l5-fill':     'Điền MỌI NaN số bằng median: <strong>clean_df = clean_df.fillna(clean_df.median(numeric_only=True))</strong> — KHÔNG fillna(0).',
          'l5-flag':     'Cắm cờ, KHÔNG xóa: <strong>clean_df["study_hours_outlier"] = clean_df["study_hours"] > 40</strong>.'
        }
      },

      drag_map: {
        brand: 'RECIPE LÀM SẠCH — 4 VÒNG · BẢNG ĐẾM',
        table_sub: 'student_profile_dirty · 204 dòng thô',
        idle_sub: '204 dòng thô · ▶ chạy để làm sạch qua 4 vòng',
        run_label: '▶ Chạy 4 vòng',
        table: {
          name: 'student_profile_dirty',
          columns: ['study_hours', 'attendance', 'quiz_score', 'major', 'pass_fail'],
          dataRows: [
            ['6.5', '8.0', '7.0', 'ICT', '1'],
            ['3.2', '5.5', '4.0', 'DS', '0'],
            ['5.0', '12.0', '6.0', 'DS', '1'],
            ['7.0', '7.5', '8.0', 'ITC', '1'],
            ['60.0', '9.0', '8.5', 'Space', '1'],
            ['4.5', '6.0', '—', 'ICT', '0'],
            ['8.0', '9.5', '9.0', 'Space', '1'],
            ['6.5', '8.0', '7.0', 'ICT', '1']
          ]
        }
      },

      /* ----- STEP 4: viết recipe + validate bằng Pandas (KHÁC step 3: dùng vòng lặp + validate).
         Grader: grade_lesson5 (dedup + fillna + giữ outlier + flag; trap fillna(0)/xóa outlier). ----- */
      step_4: {
        prompt: 'Bước 3 bạn lắp recipe bằng tay. Giờ viết <strong>Pandas thật</strong>: nạp bản thô, tạo <code>clean_df</code> (giữ <code>df</code> gốc), chữa sai · điền median · gộp Unknown · <strong>cắm cờ</strong> outlier — rồi in kiểm chứng. Hệ thống chấm sẽ <strong>đổi VỊ TRÍ toàn bộ lỗi</strong> (variant ẩn): recipe phải xử theo ĐIỀU KIỆN, không theo vị trí ô.',
        context: {
          scenario: 'Bản xuất thô sẽ được cập nhật liên tục, lỗi rơi ở vị trí khác nhau mỗi lần. Hidden test đổi chỗ toàn bộ NaN/invalid/outlier — recipe viết đúng (theo điều kiện) thì vẫn sạch; hard-code theo dòng thì vỡ. Và nhớ: <strong>giữ 2 outlier</strong> (chỉ cắm cờ) — xóa chúng là trượt tầng Risk.',
          real_world: 'Chuyện thật hay gặp: đội ML điền median cho toàn bộ dữ liệu (train + test) TRƯỚC khi chia tập → điểm test đẹp ảo, vì thống kê điền đã "nhìn trộm" test. Đúng quy trình: median phải học từ TRAIN split rồi áp cho test. Bài này làm trên cả bảng để học CƠ CHẾ; Course 2 sẽ chặn rò rỉ này.',
          steps: [
            'Import <code>numpy</code> và hàm nạp dữ liệu; nạp <code>df</code>.',
            'Tạo <code>clean_df</code>: bỏ dòng trùng 100% và GIỮ nguyên <code>df</code> gốc.',
            'Đổi attendance/quiz ngoài thang 0–10 thành NaN; gộp ngành lạ → "Unknown".',
            'Điền các ô NaN số bằng median; tạo cột cờ đánh dấu giờ học vượt 40.',
            'In shape của <code>clean_df</code> và số dòng cắm cờ · Run · Submit chấm 4 tầng.'
          ],
          hint_explore: 'Muốn soi trước? Gõ <code>print(df.shape)</code>, <code>print(df.duplicated().sum())</code>, hoặc <code>print(df.isna().sum())</code> rồi <strong>Run</strong> để thấy lỗi trước khi chữa.',
          expected: 'Console in <code>(200, 7)</code> và số dòng cờ = <code>2</code>. Đủ 4 tầng xanh. Thử fillna(0) hay xóa outlier? Code VẪN chạy — tầng Risk sẽ giải thích vì sao sai tinh thần bảo thủ.'
        },
        hints: [
          { level: 1, text: 'Đúng recipe Bước 3, thêm import numpy + in kiểm chứng: dedup → chữa sai → điền median → cắm cờ → in shape.' },
          { level: 2, text: 'Dòng đầu: <code>import numpy as np</code> rồi <code>from ml_lab import load_dirty_student_profile</code>, <code>df = load_dirty_student_profile()</code>. Tạo <code>clean_df = df.drop_duplicates().copy()</code>.' },
          { level: 3, text: 'Invalid: <code>clean_df.loc[~clean_df[col].between(0,10), col] = np.nan</code> cho attendance & quiz. Gộp: <code>~isin(["ICT","DS","Space"])</code> → "Unknown". Điền: <code>fillna(median)</code> — KHÔNG fillna(0). Cờ: <code>clean_df["study_hours_outlier"] = clean_df["study_hours"] > 40</code> (đừng xóa outlier).' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>from ml_lab import load_dirty_student_profile<br>df = load_dirty_student_profile()<br>clean_df = df.drop_duplicates().copy()<br>for col in ["attendance", "quiz_score"]:<br>&nbsp;&nbsp;&nbsp;&nbsp;clean_df.loc[~clean_df[col].between(0, 10), col] = np.nan<br>for col in ["study_hours", "attendance", "quiz_score"]:<br>&nbsp;&nbsp;&nbsp;&nbsp;clean_df[col] = clean_df[col].fillna(clean_df[col].median())<br>clean_df.loc[~clean_df["major"].isin(["ICT", "DS", "Space"]), "major"] = "Unknown"<br>clean_df["study_hours_outlier"] = clean_df["study_hours"] > 40<br>print(clean_df.shape)<br>print(clean_df["study_hours_outlier"].sum())</code>' }
        ],
        grader_fn: 'grade_lesson5',
        success_message: 'Recipe làm sạch BẢO THỦ chuẩn: 200 dòng · 0 trùng · 0 sai · 0 thiếu số — mà 2 outlier vẫn còn (đã cắm cờ). Bạn vừa cứu dữ liệu quý khỏi bị xóa nhầm. Bài 6: khi các cột số chênh thang nhau (giờ vs điểm vs số hoạt động), phải SCALE để 1 đơn vị không lấn át.',
        xp_reward: 50
      }
    },
    {
      id: 'c1_l6',
      index: 6,
      title: 'Scale feature — không để 1 đơn vị lấn át',
      subtitle: 'Đơn vị TO không có nghĩa là quan trọng hơn — đưa mọi cột số về cùng âm lượng',
      module: 11,
      module_title: 'M2 — Dữ liệu sẵn sàng',
      estimated_minutes: 18,
      xp_reward: 50,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      story: {
        tag: '🎓 StudyLab · Ticket #06',
        hook: 'Bảng đã sạch, nhưng Ticket #06 mở ra một cái bẫy tinh vi: 3 cột số <strong>chênh THANG khủng khiếp</strong>. <code>study_hours</code> chạy 0–10, <code>attendance</code> 0–100, còn <code>activity_count</code> (số lượt bấm LMS) lên tới <strong>~2000</strong>. Bạn <strong>Nam</strong> chăm bấm LMS (1 971 lượt) nhưng chỉ tự học 3.1 giờ/tuần — và đã <strong>RỚT</strong>. Bạn <strong>Linh</strong> tự học 10 giờ/tuần, bấm LMS ít (152 lượt) — <strong>ĐẬU</strong>. Trớ trêu: model đo <strong>khoảng cách</strong> sẽ thấy Nam và Linh khác nhau gần như HOÀN TOÀN chỉ vì <code>activity_count</code> lệch 1 819 lượt — còn cái gap ~7 giờ học (thứ THẬT SỰ phân định Đậu/Rớt) thì bị <strong>át tiếng</strong>. Nhiệm vụ: SCALE 3 cột số về cùng âm lượng để không đơn vị nào lấn át.'
      },
      achievement: { name: 'Feature Scaling Engineer — cân âm lượng', desc: 'đưa 3 feature chênh 204× về mean 0/std 1, loại ID/category/target khỏi scaler' },

      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Hiểu vì sao cột có <strong>thang lớn</strong> (activity_count 0–2000) lấn át cột thang nhỏ (study_hours 0–10) trong model theo <strong>khoảng cách / gradient</strong> — dù chưa chắc nó quan trọng hơn.',
            'Dùng <strong>StandardScaler</strong> (z = (x−μ)/σ → mean 0, std 1) và biết khi nào chọn nó thay <strong>Min-Max</strong> [0,1].',
            'SCALE đúng <strong>3 feature số</strong>, để <code>student_id</code> (ID) · <code>major</code> (category) · <code>pass_fail</code> (target) đứng NGOÀI scaler.'
          ]
        },
        glossary: [
          { term: 'SCALE (chuẩn hóa thang)', vi: 'cân âm lượng', accent: '#38BDF8',
            def: 'Đưa các cột số về <b>cùng độ lớn</b> để không cột nào (vì con số to) lấn át phép tính khoảng cách/gradient.',
            ex: 'giờ học 0–10 và lượt LMS 0–2000 → sau scale cả hai cùng thang, cùng "âm lượng".',
            out: 'mỗi cột hết chênh thang · model cân nhắc công bằng' },
          { term: 'STANDARDSCALER (z-score)', vi: 'chuẩn hóa z', accent: '#34D399',
            def: 'Công thức <b>z = (x − μ) / σ</b>: trừ trung bình rồi chia độ lệch chuẩn → mỗi cột có <b>mean 0, std 1</b>.',
            ex: 'activity_count μ≈949, σ≈556 → 1 505 thành z≈+1.0; giá trị DƯỚI trung bình cho <b>z ÂM</b> — bình thường, không phải lỗi.',
            out: 'mean≈0 · std≈1 · z có thể âm hoặc >1 · giữ hình dạng phân phối' },
          { term: 'MIN-MAX SCALER', vi: 'ép về [0,1]', accent: '#FBBF24',
            def: 'Công thức <b>x′ = (x − min) / (max − min)</b> → mọi giá trị nằm gọn trong <b>[0, 1]</b>.',
            ex: 'giờ học min 0.5, max 10 → 5.2 thành ≈0.49. Nhưng 1 giá trị max cực đại kéo mọi số khác về gần 0.',
            out: 'gọn [0,1] · NHẠY outlier hơn StandardScaler' },
          { term: 'FEATURE DOMINANCE', vi: 'át tiếng', accent: '#F87171',
            def: 'Cột có <b>thang lớn</b> chi phối khoảng cách/gradient, nuốt trọn tín hiệu của cột thang nhỏ.',
            ex: 'activity_count (σ 556) làm study_hours (σ 2.7) gần như vô hình khi tính khoảng cách.',
            out: 'triệu chứng cần SCALE · biến mất sau khi chuẩn hóa' },
          { term: 'FIT vs TRANSFORM', vi: 'học rồi áp', accent: '#A78BFA',
            def: '<b>fit</b> = học μ, σ (hoặc min/max) TỪ dữ liệu. <b>transform</b> = áp công thức lên số. <code>fit_transform</code> gộp 2 bước.',
            ex: 'scaler.fit học μ,σ mỗi cột; transform mới đổi từng giá trị thành z.',
            out: '⚠ chỉ fit trên TRAIN split (Course 2) · transform áp cho cả val/test' },
          { term: 'STD (độ lệch chuẩn σ)', vi: 'độ rộng cột', accent: '#22D3EE',
            def: 'Thước đo <b>độ rộng</b> của một cột quanh trung bình. σ càng lớn = dải càng rộng = càng dễ lấn át.',
            ex: 'study_hours σ 2.7 · attendance σ 17.7 · activity σ 556 — chênh nhau tới 204 lần.',
            out: 'sau StandardScaler mọi cột σ = 1' }
        ],
        primer: {
          goal: [
            'Vì sao đơn vị TO lại "át tiếng" đơn vị nhỏ',
            'StandardScaler (mean0/std1) vs Min-Max [0,1]',
            'Chỉ scale feature số — ID/category/target đứng ngoài'
          ],
          intro: '',
          example: '🔍 <strong>Bấm cột <code>activity_count</code> trong SCHEMA EXPLORER bên dưới:</strong> dải của nó tới ~2000, độ lệch chuẩn ≈556. Rồi bấm <code>study_hours</code>: dải chỉ 0–10, σ≈2.7 — nhỏ hơn <strong>204 lần</strong>. Trong phép tính khoảng cách, con số to của activity_count sẽ nuốt trọn tín hiệu của study_hours. Đó là lý do phải SCALE. Giữ ý này khi sang Bước 2 👇'
        },
        intro: 'Ba cột số đo ba thứ khác nhau bằng ba <strong>thang khác nhau</strong>. Model theo khoảng cách (như SimpleClassifier so "chân dung trung bình" ở Bài 1–2) hay gradient chỉ nhìn <em>con số</em>, không hiểu "đơn vị": cột nào số lớn thì lấn át. Chuẩn hóa (scale) kéo mọi cột về cùng âm lượng — <strong>mean 0, std 1</strong> — để chúng đóng góp công bằng. Nhưng cẩn thận: chỉ scale <strong>feature số có nghĩa</strong>; đừng đụng vào ID, nhãn (target) hay cột chữ.',
        concept_cards: [
          {
            icon: 'fa-volume-high',
            title: 'Đơn vị TO thì "hét" to',
            body: 'Model đo khoảng cách/gradient chỉ thấy <strong>con số</strong>, không hiểu đơn vị. <code>activity_count</code> (0–2000) có số to nên chi phối; <code>study_hours</code> (0–10) thành tiếng thì thầm. TO ≠ quan trọng hơn — chỉ là <strong>thang khác</strong>. Scale để cả 3 nói cùng âm lượng.'
          },
          {
            icon: 'fa-arrows-left-right-to-line',
            title: 'StandardScaler vs Min-Max',
            body: '<strong>StandardScaler</strong>: z=(x−μ)/σ → mean 0, std 1; giữ hình dạng phân phối, <strong>ít bị 1 outlier bóp</strong> → hay dùng mặc định. <strong>Min-Max</strong>: (x−min)/(max−min) → gọn [0,1], nhưng 1 giá trị cực đại kéo mọi số khác về gần 0. Bài này dùng StandardScaler.'
          },
          {
            icon: 'fa-ban',
            title: 'Ai ĐỨNG NGOÀI scaler',
            body: 'Chỉ scale feature SỐ có nghĩa. <code>student_id</code> là <strong>định danh</strong> — scale ra số vô nghĩa; <code>pass_fail</code> là <strong>target</strong> — không phải input; <code>major</code> là <strong>category</strong> — cần ENCODE trước, không scale. ⚠ Và scaler phải <strong>fit trên TRAIN split</strong> (Course 2), không fit cả bảng.'
          }
        ],
        /* Hero = ỐNG KÍNH ÂM LƯỢNG + demo khoảng cách (user chốt 2026-07-21) */
        scale_lens: {
          title: 'ỐNG KÍNH ÂM LƯỢNG — CỘT NÀO ĐANG LẤN ÁT?',
          intro: 'Ba feature số, ba THANG khác nhau. Bấm <b>▶ SCALE</b> để nghe điều gì đổi — cả thanh âm lượng lẫn khoảng cách 2 học viên. Trả lời được câu chốt thì mở Bước 2.',
          features: [
            { name: 'study_hours', unit: 'giờ/tuần', std: 2.72, mean: 5.2, range: '0.5 – 10',
              note: 'Giờ tự học/tuần. Dải hẹp (0–10) → σ chỉ <b>2.7</b>. Đây là tín hiệu MẠNH của Đậu/Rớt nhưng con số nhỏ nên dễ bị át.' },
            { name: 'attendance', unit: '%', std: 17.69, mean: 68.5, range: '40 – 100',
              note: 'Tỉ lệ chuyên cần (%). Dải 0–100 → σ ≈ <b>17.7</b>, to hơn giờ học ~6 lần.' },
            { name: 'activity_count', unit: 'lượt LMS', std: 556, mean: 949, range: '3 – 1 982',
              note: 'Số lượt bấm LMS. Dải tới ~2000 → σ ≈ <b>556</b> — TO gấp <b>204×</b> giờ học. Chính nó "hét" át 2 cột kia.' }
          ],
          demo: {
            title: 'MODEL SO KHOẢNG CÁCH 2 HỌC VIÊN',
            a: { name: 'Nam', tag: 'chăm bấm LMS', study: '3.1', att: '66', act: '1 971', verdict: 'Rớt', vclass: 'fail' },
            b: { name: 'Linh', tag: 'học thật sự', study: '10', att: '99', act: '152', verdict: 'Đậu', vclass: 'pass' },
            raw: { study: 0.001, att: 0.03, act: 99.97, dist: '1 819' },
            scaled: { study: 31.2, att: 16.9, act: 51.9, dist: '4.5' },
            raw_note: 'CHƯA scale: khoảng cách gần như 100% do <b>activity_count</b> (lệch 1 819 lượt). Cái gap ~7 GIỜ HỌC — thứ thật sự phân định Nam Rớt vs Linh Đậu — chỉ đóng góp <b>0.001%</b>, model không "nghe" thấy.',
            scaled_note: 'SAU scale: 3 cột cùng âm lượng. <b>study_hours giờ chiếm 31%</b> — model cuối cùng nghe được khác biệt quan trọng; activity_count còn 52%, không còn độc chiếm.'
          },
          riddle: {
            prompt: 'CHƯA scale — khác biệt khoảng cách giữa Nam (Rớt) và Linh (Đậu) chủ yếu đến từ cột nào?',
            options: ['activity_count (lượt LMS)', 'study_hours (giờ học)', 'Cả 3 cột cân nhau'],
            answer: 'activity_count (lượt LMS)',
            wrong: {
              'study_hours (giờ học)': 'Ngược lại — study_hours chỉ đóng góp <b>0.001%</b>! Vì con số của nó nhỏ (0–10) nên bị nuốt. Chính activity_count (0–2000) mới độc chiếm khoảng cách khi CHƯA scale.',
              'Cả 3 cột cân nhau': 'Chỉ cân nhau SAU khi scale. Chưa scale, activity_count chiếm ~99.97% vì thang của nó lớn gấp trăm lần — đó chính là "đơn vị to át tiếng".'
            },
            done: '✅ Đúng — activity_count "hét" át 2 cột kia CHỈ vì con số nó to (thang 0–2000), KHÔNG phải vì nó quan trọng hơn. StandardScaler kéo cả 3 về mean 0 · std 1 để chúng nói cùng âm lượng; khi đó study_hours (tín hiệu thật) mới được nghe. Xuống Bước 2 phân biệt cột nào được scale 👇'
          }
        },
        visual: {
          schema: {
            table_name: 'student_scaling (200 dòng · 3 cột số chênh thang)',
            columns: [
              { name: 'student_id', type: 'INT64 · định danh', key: 'ID', icon: '🪪',
                note: '<strong>Identifier</strong> — số thứ tự, KHÔNG mang thông tin đo lường. Đưa vào scaler chỉ tạo z vô nghĩa. ĐỨNG NGOÀI.' },
              { name: 'study_hours', type: 'FLOAT · giờ/tuần', key: '', icon: '',
                note: '<strong>Feature số</strong> — dải 0.5–10, σ ≈ 2.7. Tín hiệu mạnh của Đậu/Rớt nhưng con số nhỏ → dễ bị át. <strong>SCALE.</strong>' },
              { name: 'attendance', type: 'FLOAT · %', key: '', icon: '',
                note: '<strong>Feature số</strong> — dải 40–100, σ ≈ 17.7 (to hơn giờ học ~6×). <strong>SCALE.</strong>' },
              { name: 'activity_count', type: 'INT · lượt LMS', key: '⚠', icon: '📢',
                note: '<strong>Feature số — KẺ LẤN ÁT</strong>: dải 3–1 982, σ ≈ 556 (gấp 204× giờ học). Chính nó "át tiếng" khi chưa scale. <strong>SCALE.</strong>' },
              { name: 'major', type: 'OBJECT · ngành', key: '', icon: '🏷️',
                note: '<strong>Categorical</strong> — ICT/DS/Space (68/67/65). Chữ, không phải số → cần <strong>ENCODE</strong> (bài sau), KHÔNG scale.' },
              { name: 'pass_fail', type: 'INT 0/1', key: 'TARGET', icon: '🎯',
                note: '<strong>Target</strong> — Đậu 64 / Rớt 136. Là thứ ta ĐOÁN, không phải input; không đem chuẩn hóa. ĐỨNG NGOÀI.' }
            ]
          },
          data_preview: [
            ['20520001', '3.0', '57', '1925', 'ICT', '0'],
            ['20520002', '0.8', '55', '978', 'Space', '0'],
            ['20520003', '8.6', '89', '1847', 'ICT', '1'],
            ['20520048', '10.0', '99', '152', 'Space', '1'],
            ['20520005', '7.8', '93', '1405', 'DS', '1'],
            ['20520006', '4.5', '66', '947', 'DS', '0'],
            ['20520135', '3.1', '66', '1971', 'ICT', '0'],
            ['20520004', '5.9', '65', '512', 'Space', '0']
          ]
        },
        mission: 'Dựng <code class="code">RECIPE SCALE</code> cho <code class="code">student_scaling</code>: CHỌN đúng 3 cột số (loại <code class="code">student_id</code>/<code class="code">major</code>/<code class="code">pass_fail</code>) · <code class="code">StandardScaler</code> fit→transform · KIỂM mean 0/std 1 — kho có <code class="code">mồi bẫy 🪤</code> (scale ID · scale target) ↓'
      },

      /* ----- STEP 2: 3 MCQ (why dominance · Min-Max vs Standard · exclude cols) + mini-game 3 ngăn ----- */
      step_2: {
        mcq: [
          {
            question: 'Model theo <strong>khoảng cách</strong> (như SimpleClassifier ở Bài 1–2) đo độ gần giữa 2 học viên. <code>activity_count</code> (0–2000) chi phối gần như toàn bộ khoảng cách, còn <code>study_hours</code> (0–10) gần như vô hình. Vì sao?',
            options: [
              { id: 'a', text: 'Vì con số activity_count TO hơn (thang lớn) nên lấn át — không phải vì nó quan trọng hơn', correct: true, explanation: 'Đúng — khoảng cách cộng bình phương hiệu từng cột; hiệu của activity_count (hàng trăm–nghìn) áp đảo hiệu của study_hours (vài đơn vị). Đó thuần túy do THANG, không phải mức quan trọng. Scale để cân lại.' },
              { id: 'b', text: 'Vì activity_count thật sự quan trọng hơn study_hours', correct: false, explanation: 'Không — thực tế study_hours mới là tín hiệu mạnh của Đậu/Rớt (Nam bấm LMS nhiều vẫn Rớt). activity_count chi phối chỉ vì con số to, đây là bẫy "TO ≠ quan trọng".' },
              { id: 'c', text: 'Vì activity_count là cột target', correct: false, explanation: 'target là pass_fail. activity_count là feature. Chuyện nó lấn át là do thang đo, không liên quan target.' },
              { id: 'd', text: 'Vì activity_count có nhiều giá trị thiếu', correct: false, explanation: 'Bảng này đã sạch, không thiếu. Vấn đề là chênh THANG (0–2000 vs 0–10), giải bằng scale chứ không phải điền thiếu.' }
            ]
          },
          {
            question: '<code>activity_count</code> có 1 học viên bấm LMS gấp mấy lần người khác (một outlier lớn). Nếu dùng <strong>Min-Max [0,1]</strong> cho cột này, chuyện gì xảy ra?',
            options: [
              { id: 'a', text: 'Outlier thành 1.0, còn mọi người bình thường bị dồn xuống gần 0 — mất phân biệt', correct: true, explanation: 'Đúng — Min-Max chia cho (max − min); max bị outlier kéo lên nên phần lớn giá trị dồn về sát 0. StandardScaler (dùng μ, σ) ít bị 1 điểm kéo lệch hơn → nhiều bài chọn Standard làm mặc định.' },
              { id: 'b', text: 'Không sao, Min-Max luôn an toàn hơn StandardScaler', correct: false, explanation: 'Ngược lại — chính vì phụ thuộc min/max nên Min-Max NHẠY với outlier hơn. Không có cái nào "luôn an toàn"; chọn theo dữ liệu.' },
              { id: 'c', text: 'Min-Max sẽ tự động loại outlier đó ra', correct: false, explanation: 'Scaler không xóa dữ liệu — nó chỉ đổi thang. Loại/giữ outlier là bước làm sạch (Bài 5), không phải việc của Min-Max.' },
              { id: 'd', text: 'Cả cột sẽ có mean 0 và std 1', correct: false, explanation: 'Đó là kết quả của StandardScaler, không phải Min-Max. Min-Max cho khoảng [0,1], không đảm bảo mean 0/std 1.' }
            ]
          },
          {
            question: 'Bảng có <code>student_id</code>, <code>study_hours</code>, <code>attendance</code>, <code>activity_count</code>, <code>major</code>, <code>pass_fail</code>. Đưa cột nào vào <strong>StandardScaler</strong>?',
            options: [
              { id: 'a', text: 'Đúng 3 feature số: study_hours, attendance, activity_count', correct: true, explanation: 'Chuẩn — chỉ scale feature SỐ có nghĩa. ID là định danh, major là chữ (cần encode), pass_fail là target — cả 3 đứng ngoài scaler.' },
              { id: 'b', text: 'Mọi cột số, kể cả student_id và pass_fail', correct: false, explanation: 'student_id chỉ là số thứ tự — scale ra z vô nghĩa; pass_fail là target — không đem chuẩn hóa. "Số" không có nghĩa là "feature để scale".' },
              { id: 'c', text: 'Chỉ activity_count vì nó to nhất', correct: false, explanation: 'Scale phải áp cho CẢ 3 feature số cùng lúc thì chúng mới về chung thang. Scale mỗi activity_count thì study_hours/attendance vẫn lệch nhau.' },
              { id: 'd', text: 'Cả major nữa cho đủ bộ', correct: false, explanation: 'major là chữ (ICT/DS/Space) — StandardScaler chỉ nhận số. Category cần ENCODE (bài sau) rồi mới xử, không nhét vào scaler.' }
            ]
          }
        ],
        mini_game: {
          title: 'Mỗi cột đi đâu trước khi train?',
          instruction: 'Không phải cứ là số thì scale. Kéo mỗi cột vào đúng ngăn: <strong>🎚️ SCALE ngay</strong> (feature số) · <strong>🔤 ENCODE trước</strong> (cột chữ) · <strong>🚫 ĐỨNG NGOÀI</strong> (ID & target).',
          chips: [
            { id: 's-study', label: 'study_hours (0–10)' },
            { id: 's-att',   label: 'attendance (0–100)' },
            { id: 's-act',   label: 'activity_count (0–2000)' },
            { id: 's-major', label: 'major (ICT/DS/Space)' },
            { id: 's-id',    label: 'student_id (định danh)' },
            { id: 's-y',     label: 'pass_fail (target)' }
          ],
          bins: [
            { id: 'scale',  label: '🎚️ SCALE ngay',   correct: 'true' },
            { id: 'encode', label: '🔤 ENCODE trước',  correct: 'true' },
            { id: 'out',    label: '🚫 ĐỨNG NGOÀI',    correct: 'true' }
          ],
          solution: {
            's-study': 'scale',
            's-att':   'scale',
            's-act':   'scale',
            's-major': 'encode',
            's-id':    'out',
            's-y':     'out'
          },
          success: 'Chuẩn — chỉ 3 feature SỐ vào scaler; major là chữ (encode ở bài sau); student_id/pass_fail đứng ngoài hẳn. "Là số" không đồng nghĩa "đem scale". Đó là recipe Bước 3 sắp dựng.'
        }
      },

      /* ----- STEP 3: map 3 TRẠM (user chốt) — CHỌN cột → FIT+TRANSFORM → KIỂM. 2 mồi bẫy: scale ID / target ----- */
      step_3: {
        ml_pipeline: true,
        blocks: [
          { type: 'py', token: 'numeric_cols = ["study_hours", "attendance", "activity_count"]', slot: 'b1' },
          { type: 'py', token: 'X_scaled = StandardScaler().fit_transform(df[numeric_cols])', slot: 'b2' },
          { type: 'py', token: 'means, stds = X_scaled.mean(axis=0).round(2), X_scaled.std(axis=0).round(2)', slot: 'b3' },
          /* 2 mồi bẫy — Risk của grader: scale ID / scale target */
          { type: 'py', token: 'numeric_cols = ["student_id", "study_hours", "attendance", "activity_count"]', slot: 't1' },
          { type: 'py', token: 'X_scaled = StandardScaler().fit_transform(df[numeric_cols + ["pass_fail"]])', slot: 't2' }
        ],
        drop_zones: [
          { id: 'l6-cols',  accepts: ['py'], multi: false },
          { id: 'l6-scale', accepts: ['py'], multi: false },
          { id: 'l6-check', accepts: ['py'], multi: false }
        ],
        ml_flow: {
          brand: 'RECIPE SCALE — 3 TRẠM · CÂN ÂM LƯỢNG',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: 'student_scaling · 200 dòng · study σ2.7 / att σ17.7 / activity σ556 (chênh 204×)' },
          done_note: 'X_scaled (200, 3): mean ≈ 0 · std ≈ 1 mỗi cột — 3 feature cùng âm lượng; student_id / major / pass_fail ĐỨNG NGOÀI. Click lại trạm để xem; Bước 4 tự viết StandardScaler thật + validate.',
          stations: [
            {
              zones: ['l6-cols'],
              icon: '🎯', label: 'TRẠM 1 — CHỌN 3 CỘT SỐ', sub: 'loại ID/category/target', result_kind: 'scale_select',
              scale_select: {
                pick: [
                  { col: 'study_hours', std: 2.7 },
                  { col: 'attendance', std: 17.7 },
                  { col: 'activity_count', std: 556 }
                ],
                exclude: [
                  { col: 'student_id', icon: '🪪', why: 'ĐỊNH DANH — scale ra số vô nghĩa' },
                  { col: 'major', icon: '🏷️', why: 'CATEGORY — cần ENCODE, không scale' },
                  { col: 'pass_fail', icon: '🎯', why: 'TARGET — không phải input' }
                ]
              },
              narration: '<code>numeric_cols</code> chỉ giữ 3 feature SỐ có nghĩa. student_id (định danh), major (chữ), pass_fail (target) bị loại ra — nếu lỡ nhét ID/target vào, scaler tạo ra z vô nghĩa và tầng Risk ở Bước 4 sẽ bắt.'
            },
            {
              zones: ['l6-scale'],
              icon: '🎚️', label: 'TRẠM 2 — FIT + TRANSFORM', sub: 'StandardScaler z=(x−μ)/σ', result_kind: 'scale_stats',
              scale: {
                mode: 'transform',
                rows: [
                  { col: 'study_hours', before_std: 2.72, before_mean: 5.2, after_std: 1, after_mean: 0 },
                  { col: 'attendance', before_std: 17.69, before_mean: 68.5, after_std: 1, after_mean: 0 },
                  { col: 'activity_count', before_std: 556, before_mean: 949, after_std: 1, after_mean: 0 }
                ],
                note: 'StandardScaler <b>fit</b> học μ, σ mỗi cột rồi <b>transform</b> đổi z=(x−μ)/σ. Độ lệch chuẩn từ 2.7 / 17.7 / 556 (chênh 204×) <b>đều về 1</b> — cả 3 cột giờ cùng âm lượng.'
              },
              narration: '<code>fit_transform</code> gộp 2 việc: học μ,σ của 3 cột rồi áp z-score. Sau bước này, activity_count không còn "hét" — hiệu của nó và của study_hours đo trên cùng một thang (σ = 1).'
            },
            {
              zones: ['l6-check'],
              icon: '✅', label: 'TRẠM 3 — KIỂM mean 0 / std 1', sub: 'validate moments', result_kind: 'scale_stats',
              scale: {
                mode: 'verify',
                rows: [
                  { col: 'study_hours', after_std: 1, after_mean: 0 },
                  { col: 'attendance', after_std: 1, after_mean: 0 },
                  { col: 'activity_count', after_std: 1, after_mean: 0 }
                ],
                note: 'Tính <code>means = X_scaled.mean(axis=0)</code> ≈ [0, 0, 0] và <code>stds = X_scaled.std(axis=0)</code> ≈ [1, 1, 1] — bằng chứng scale đúng. Shape vẫn (200, 3): không mất dòng nào, chỉ đổi thang.'
              },
              narration: 'Luôn KIỂM sau khi biến đổi: mean mỗi cột ≈ 0, std ≈ 1 thì StandardScaler đã chạy đúng. Nếu một cột std ≠ 1, nghĩa là bạn quên đưa nó vào (hoặc lỡ đưa cột lạ vào).'
            }
          ]
        },
        expected_sql: 'numeric_cols = ["study_hours", "attendance", "activity_count"] X_scaled = StandardScaler().fit_transform(df[numeric_cols]) means, stds = X_scaled.mean(axis=0).round(2), X_scaled.std(axis=0).round(2)',
        expected_zones: {
          'l6-cols':  'numeric_cols = ["study_hours", "attendance", "activity_count"]',
          'l6-scale': 'X_scaled = StandardScaler().fit_transform(df[numeric_cols])',
          'l6-check': 'means, stds = X_scaled.mean(axis=0).round(2), X_scaled.std(axis=0).round(2)'
        },
        reveal_hints: {
          'l6-cols':  'Trạm 1: chỉ 3 feature số — <strong>numeric_cols = ["study_hours", "attendance", "activity_count"]</strong> (KHÔNG có student_id/pass_fail).',
          'l6-scale': 'Trạm 2: fit rồi transform — <strong>X_scaled = StandardScaler().fit_transform(df[numeric_cols])</strong>.',
          'l6-check': 'Trạm 3: kiểm chứng — <strong>means, stds = X_scaled.mean(axis=0).round(2), X_scaled.std(axis=0).round(2)</strong> ≈ [0,0,0] &amp; [1,1,1].'
        }
      },

      drag_map: {
        brand: 'RECIPE SCALE — 3 TRẠM · CÂN ÂM LƯỢNG',
        table_sub: 'student_scaling · 200 dòng · 3 cột số chênh thang',
        idle_sub: '3 cột số chênh 204× · ▶ chạy để đưa về cùng âm lượng',
        run_label: '▶ Chạy 3 trạm',
        table: {
          name: 'student_scaling',
          columns: ['student_id', 'study_hours', 'attendance', 'activity_count', 'major', 'pass_fail'],
          dataRows: [
            ['20520001', '3.0', '57', '1925', 'ICT', '0'],
            ['20520002', '0.8', '55', '978', 'Space', '0'],
            ['20520003', '8.6', '89', '1847', 'ICT', '1'],
            ['20520048', '10.0', '99', '152', 'Space', '1'],
            ['20520005', '7.8', '93', '1405', 'DS', '1'],
            ['20520006', '4.5', '66', '947', 'DS', '0'],
            ['20520135', '3.1', '66', '1971', 'ICT', '0'],
            ['20520004', '5.9', '65', '512', 'Space', '0']
          ]
        }
      },

      /* ----- STEP 4: viết StandardScaler thật (KHÁC step 3: dùng sklearn + validate moments).
         Grader: grade_lesson6 (StandardScaler đúng 3 cột; trap scale student_id/pass_fail; hidden variant 777). ----- */
      step_4: {
        prompt: 'Bước 3 bạn lắp recipe bằng tay. Giờ viết <strong>sklearn thật</strong>: nạp bảng, chọn đúng 3 cột số (<code>numeric_cols</code>), dùng <code>StandardScaler</code> fit→transform ra <code>X_scaled</code>, rồi in kiểm chứng mean≈0/std≈1. Hệ thống chấm sẽ chạy lại trên <strong>dữ liệu ẩn</strong> — phép scale phải nhất quán, KHÔNG hard-code số μ,σ cụ thể.',
        context: {
          scenario: 'Bản dữ liệu đổi mỗi kỳ, giá trị khác nhau. Hidden test thay toàn bộ dataset bằng variant ẩn — StandardScaler viết đúng thì vẫn ra mean 0 / std 1; hard-code μ,σ thì vỡ. Và nhớ: chỉ đưa 3 feature SỐ vào scaler — thêm <code>student_id</code> hay <code>pass_fail</code> là trượt tầng Risk.',
          real_world: 'Chuyện thật hay gặp: đội ML fit scaler trên TOÀN bảng (train + test) rồi mới chia tập → điểm test đẹp ẢO vì μ,σ đã "nhìn trộm" test. Đúng quy trình: fit scaler CHỈ trên TRAIN split rồi transform validation/test. Bài này fit cả bảng để học CƠ CHẾ; Course 2 sẽ chặn rò rỉ này.',
          steps: [
            'Import bộ chuẩn hóa của sklearn và hàm nạp dữ liệu; nạp <code>df</code>.',
            'Chọn đúng <strong>3 cột số feature</strong> (bỏ ID, category, target) vào một danh sách <code>numeric_cols</code>.',
            'Khởi tạo scaler rồi <strong>fit → transform</strong> trên các cột đó để ra <code>X_scaled</code>.',
            'In shape của <code>X_scaled</code> và mean/std mỗi cột · Run · Submit chấm 4 tầng.'
          ],
          hint_explore: 'Muốn soi trước? Gõ <code>print(df.std(numeric_only=True))</code> rồi <strong>Run</strong> để thấy 3 cột chênh thang cỡ nào TRƯỚC khi scale.',
          expected: 'Console in <code>(200, 3)</code>, mean mỗi cột ≈ <code>0.0</code> và std ≈ <code>1.0</code>. Đủ 4 tầng xanh. Thử thêm student_id vào numeric_cols? Code VẪN chạy — tầng Risk sẽ giải thích vì sao sai.'
        },
        hints: [
          { level: 1, text: 'Đúng recipe Bước 3, thêm import + in kiểm chứng: chọn 3 cột số → StandardScaler fit_transform → in shape + mean/std.' },
          { level: 2, text: 'Đầu bài: <code>from ml_lab import load_scaling_dataset</code>, <code>from sklearn.preprocessing import StandardScaler</code>, <code>df = load_scaling_dataset()</code>.' },
          { level: 3, text: 'Chọn cột: <code>numeric_cols = ["study_hours", "attendance", "activity_count"]</code> (KHÔNG có student_id/pass_fail). Scale: <code>X_scaled = StandardScaler().fit_transform(df[numeric_cols])</code>. Giữ biến <code>numeric_cols</code> để tầng Risk soi được cột nào bị scale.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>from ml_lab import load_scaling_dataset<br>from sklearn.preprocessing import StandardScaler<br>df = load_scaling_dataset()<br>numeric_cols = ["study_hours", "attendance", "activity_count"]<br>scaler = StandardScaler()<br>X_scaled = scaler.fit_transform(df[numeric_cols])<br>print(X_scaled.shape)<br>print(X_scaled.mean(axis=0).round(2))<br>print(X_scaled.std(axis=0).round(2))</code>' }
        ],
        grader_fn: 'grade_lesson6',
        success_message: 'Chuẩn — X_scaled (200, 3): mean ≈ 0 · std ≈ 1 mỗi cột, 3 feature cùng âm lượng, còn student_id/major/pass_fail đứng ngoài scaler. Bạn vừa gỡ cái bẫy "đơn vị to át tiếng". Bài 7: đọc dữ liệu bằng thống kê cơ bản — trung bình, độ lệch, tương quan.',
        xp_reward: 50
      }
    },
    {
      id: 'c1_l7',
      index: 7,
      title: 'Đọc dữ liệu bằng thống kê cơ bản',
      subtitle: 'Tương quan chỉ ra "đi cùng nhau" — KHÔNG chứng minh "gây ra nhau"',
      module: 11,
      module_title: 'M2 — Dữ liệu sẵn sàng',
      estimated_minutes: 18,
      xp_reward: 50,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      story: {
        tag: '🎓 StudyLab · Ticket #07 · KHÉP CHƯƠNG M2',
        hook: 'Phòng đào tạo gửi Ticket #07: <strong>"Yếu tố nào LIÊN QUAN nhất tới điểm cuối kỳ?"</strong> — họ có bảng <strong>200 học viên</strong> với giờ tự học, chuyên cần, số buổi nghỉ, điểm quiz và <code>final_score</code>. Trước khi dựng model, việc đầu tiên là <strong>ĐỌC dữ liệu bằng thống kê</strong>: trung bình mỗi cột bao nhiêu, và cột nào <strong>tương quan</strong> mạnh với điểm cuối. Nhưng có một cái bẫy chết người: nếu thấy <code>study_hours</code> tương quan <strong>0.95</strong> với điểm rồi kết luận "học nhiều GÂY RA điểm cao" để ra chính sách — bạn có thể sai. <strong>Tương quan ≠ nhân quả.</strong> Nhiệm vụ: tính ma trận tương quan, đọc đúng, và biết dừng đúng chỗ.'
      },
      achievement: { name: 'Data Analyst — đọc số tỉnh táo', desc: 'đọc ma trận tương quan, phân biệt tương quan với nhân quả, loại ID khỏi phân tích' },

      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Đọc <strong>trung bình · độ lệch chuẩn</strong> để nắm "trung tâm" và "độ rộng" mỗi cột.',
            'Tính <strong>ma trận tương quan</strong> (r ∈ [−1, 1]) và đọc cột nào liên hệ mạnh/nghịch với <code>final_score</code> — biết vì sao dùng <strong>corr</strong> thay <strong>cov</strong>.',
            'Nhớ cảnh giới lớn nhất: <strong>tương quan ≠ nhân quả</strong> — và loại <code>student_id</code> (ID vô nghĩa) khỏi phân tích.'
          ]
        },
        glossary: [
          { term: 'TRUNG BÌNH (mean)', vi: 'trung tâm', accent: '#38BDF8',
            def: 'Giá trị <b>điển hình</b> của một cột = tổng chia số dòng. Cho biết "quanh mức nào".',
            ex: 'final_score trung bình ≈ 6.15 → lớp này điểm cuối kỳ quanh 6/10.',
            out: 'df.mean() · nhạy với outlier (khác median)' },
          { term: 'ĐỘ LỆCH CHUẨN (std σ)', vi: 'độ rộng', accent: '#22D3EE',
            def: 'Đo mức <b>phân tán</b> quanh trung bình. σ lớn = điểm trải rộng; σ nhỏ = xúm quanh mean.',
            ex: 'final_score σ ≈ 2.67 → phần lớn điểm nằm trong ~6.15 ± 2.67.',
            out: 'df.std() · cùng đơn vị với cột' },
          { term: 'HIỆP PHƯƠNG SAI (cov)', vi: 'đi cùng nhau (thô)', accent: '#A78BFA',
            def: 'Đo 2 cột có <b>cùng lên/xuống</b> không, nhưng con số <b>phụ thuộc đơn vị</b> nên khó so sánh.',
            ex: 'cov(study, final) = 7.3 — dương (cùng chiều) nhưng 7.3 to hay nhỏ? khó nói.',
            out: 'df.cov() · cần chuẩn hóa thành corr mới đọc được' },
          { term: 'HỆ SỐ TƯƠNG QUAN r', vi: 'tương quan', accent: '#34D399',
            def: 'Cov <b>chuẩn hóa</b> về <b>[−1, 1]</b>: +1 cùng chiều chặt · −1 ngược chiều chặt · 0 không liên hệ tuyến tính.',
            ex: 'r(study, final) = 0.95 → học nhiều đi cùng điểm cao, rất chặt.',
            out: 'df.corr() · SO SÁNH được giữa các cặp' },
          { term: 'MA TRẬN TƯƠNG QUAN', vi: 'bảng r', accent: '#FBBF24',
            def: 'Bảng <b>n×n</b> chứa r của mọi cặp cột; đường chéo = 1 (mỗi cột với chính nó).',
            ex: 'nhìn CỘT final_score để xếp hạng feature nào liên quan điểm nhất.',
            out: 'df.corr() · đối xứng qua đường chéo' },
          { term: 'TƯƠNG QUAN ≠ NHÂN QUẢ', vi: 'cảnh giới', accent: '#F87171',
            def: 'r cao nói 2 biến <b>đi cùng nhau</b>, KHÔNG nói cái nào <b>gây ra</b> cái nào.',
            ex: 'mùa hè: kem bán chạy VÀ đuối nước tăng — cả hai do NÓNG, không phải kem gây đuối nước.',
            out: 'muốn khẳng định nhân quả → cần THÍ NGHIỆM can thiệp' }
        ],
        primer: {
          goal: [
            'Đọc mean/std: trung tâm & độ rộng mỗi cột',
            'Ma trận tương quan: cột nào liên quan điểm nhất',
            'Tương quan ≠ nhân quả — dừng đúng chỗ'
          ],
          intro: '',
          example: '🔍 <strong>Bấm cột <code>study_hours</code> trong SCHEMA EXPLORER:</strong> nó tương quan 0.95 với điểm cuối — mạnh nhất. Rồi bấm <code>student_id</code>: chỉ là mã số, tương quan ≈ 0 (nhiễu vô nghĩa). Đọc tương quan là để tìm cột ĐÁNG đào sâu — nhưng nhớ: nó chỉ ra "đi cùng nhau", chưa nói "gây ra nhau". Giữ ý này sang Bước 2 👇'
        },
        intro: 'Trước khi train bất cứ model nào, người phân tích giỏi <strong>ĐỌC dữ liệu</strong> trước: mỗi cột trung bình bao nhiêu, phân tán ra sao, và các cột <strong>liên hệ</strong> với nhau (nhất là với mục tiêu <code>final_score</code>) thế nào. Công cụ chính là <strong>ma trận tương quan</strong>. Nhưng đọc số phải tỉnh táo: r cao chỉ nói "đi cùng nhau", và <code>student_id</code> dù cho ra một con số r nào đó thì vẫn là <strong>nhiễu vô nghĩa</strong> — mã số không "liên quan" điểm.',
        concept_cards: [
          {
            icon: 'fa-arrows-up-down',
            title: 'r đo gì (−1 → +1)',
            body: '<strong>r = +1</strong>: đồng biến chặt (cột này lên, cột kia lên). <strong>r = −1</strong>: nghịch biến chặt. <strong>r ≈ 0</strong>: không liên hệ tuyến tính. |r| càng gần 1 quan hệ càng mạnh. Đọc CỘT <code>final_score</code> trong ma trận để xếp hạng feature.'
          },
          {
            icon: 'fa-arrows-left-right-to-line',
            title: 'Cov vs Corr',
            body: '<strong>Cov</strong> nói chiều (âm/dương) nhưng con số <strong>phụ thuộc đơn vị</strong> — cov 7.3 vs 3.2 không so trực tiếp được. <strong>Corr</strong> = cov chia cho tích 2 độ lệch chuẩn → gói về <strong>[−1, 1]</strong>, nên SO SÁNH được cặp nào mạnh hơn. (Cùng ý "chuẩn hóa" như scale ở Bài 6.)'
          },
          {
            icon: 'fa-triangle-exclamation',
            title: 'Tương quan ≠ Nhân quả',
            body: 'r(study, final) = 0.95 <strong>KHÔNG</strong> chứng minh "học nhiều GÂY RA điểm cao". Có thể do <strong>biến ẩn</strong> (bạn chăm → vừa học nhiều vừa điểm cao), <strong>đảo chiều</strong>, hoặc <strong>trùng hợp</strong>. Tương quan gợi ý "chỗ nào đáng đào sâu"; khẳng định nhân quả cần <strong>thí nghiệm can thiệp</strong>.'
          }
        ],
        /* Hero = ỐNG KÍNH TƯƠNG QUAN + scatter (user chốt 2026-07-21) */
        corr_lens: {
          title: 'ỐNG KÍNH TƯƠNG QUAN — CỘT NÀO LIÊN QUAN ĐIỂM NHẤT?',
          intro: 'Thanh dưới là |r| của từng cột với <code>final_score</code>. Bấm một thanh để xem <b>scatter 200 học viên thật</b> + đường xu hướng. Đừng bỏ qua <code>student_id</code> (phản ví dụ). Trả lời câu chốt để mở Bước 2.',
          target: 'final_score',
          series: [
            { name: 'study_hours', r: 0.95, note: 'Giờ tự học/tuần. Điểm bám sát đường đi lên — <b>tương quan dương mạnh nhất</b> với điểm cuối.' },
            { name: 'quiz_score', r: 0.93, note: 'Điểm quiz giữa kỳ. Cũng đi lên rất chặt — nhưng coi chừng: quiz cao & final cao có thể cùng do <b>chăm học</b> (biến ẩn).' },
            { name: 'missed_classes', r: -0.75, note: 'Số buổi nghỉ. Đường đi <b>XUỐNG</b> — nghỉ càng nhiều điểm càng thấp (tương quan ÂM).' },
            { name: 'attendance', r: 0.60, note: 'Chuyên cần. Dương vừa — đám mây điểm rộng hơn, quan hệ lỏng hơn study/quiz.' },
            { name: 'student_id', r: 0.03, note: 'Mã số sinh viên — chỉ là ĐỊNH DANH. Điểm rải thành <b>mây tản</b>, r ≈ 0: không hề liên quan. ID phải đứng NGOÀI phân tích.' }
          ],
          riddle: {
            prompt: 'r(study_hours, final_score) = 0.95 — rất cao. Kết luận nào ĐÚNG?',
            options: ['Học nhiều & điểm cao ĐI CÙNG nhau — nhưng r không chứng minh cái nào GÂY RA cái nào', 'Đã chứng minh: học nhiều GÂY RA điểm cao', 'r cao chắc do ngẫu nhiên, bỏ qua được'],
            answer: 'Học nhiều & điểm cao ĐI CÙNG nhau — nhưng r không chứng minh cái nào GÂY RA cái nào',
            wrong: {
              'Đã chứng minh: học nhiều GÂY RA điểm cao': 'Tương quan ≠ nhân quả. r cao chỉ nói 2 biến đi cùng chiều; có thể do <b>biến ẩn</b> (bạn chăm học → vừa học nhiều, vừa làm quiz tốt, vừa điểm cao), đảo chiều, hoặc trùng hợp. Khẳng định nhân quả cần <b>thí nghiệm can thiệp</b>.',
              'r cao chắc do ngẫu nhiên, bỏ qua được': 'r = 0.95 trên 200 SV rất khó là ngẫu nhiên — quan hệ CÓ THẬT và đáng chú ý. Vấn đề chỉ là "có quan hệ" ≠ "cái này gây ra cái kia".'
            },
            done: '✅ Đúng — r = 0.95 nói study_hours và final_score đi cùng nhau rất chặt, nhưng KHÔNG nói cái nào gây ra cái nào. Ví dụ đời: mùa hè kem bán chạy VÀ số vụ đuối nước tăng — cả hai do trời NÓNG, chứ kem không gây đuối nước. Tương quan gợi ý "chỗ nào đáng đào sâu"; nhân quả cần thí nghiệm. Xuống Bước 2 luyện đọc r 👇'
          },
          /* 200 điểm THẬT (seed 1701) — chia sẻ trục y = final_score */
          y: [24,29,64,81,88,93,35,33,100,77,54,21,33,49,100,0,81,26,68,100,100,77,78,47,26,93,61,54,97,79,97,30,49,42,54,96,23,43,100,61,80,100,42,77,23,82,28,68,48,39,22,53,5,29,30,95,70,95,69,97,94,64,31,65,24,96,27,72,98,51,88,17,85,60,55,73,36,100,95,73,58,83,100,27,31,49,53,87,55,54,52,76,48,88,52,96,89,65,80,61,96,81,21,10,77,20,19,20,63,44,32,65,42,62,100,48,32,90,37,100,89,57,71,58,61,93,99,67,21,23,49,74,61,40,71,50,65,39,61,15,34,37,44,92,79,45,48,100,75,100,32,47,69,100,98,47,86,44,34,34,81,82,66,73,27,72,91,54,58,100,31,63,100,71,100,47,48,100,88,19,68,81,77,97,41,71,78,100,16,97,15,58,41,90,100,76,16,46,35,44],
          x: {
            study_hours: [1.3,1.6,5.4,5.1,8.9,8.4,2.5,1.3,9.7,7.0,3.6,2.1,3.6,4.1,9.4,0.6,7.3,1.8,6.3,9.6,8.3,6.8,6.2,2.6,1.7,7.7,5.8,4.7,9.4,5.1,9.0,1.0,4.0,3.6,5.0,9.2,0.8,4.0,9.7,6.4,6.7,8.8,2.6,7.5,1.0,7.6,2.5,6.5,4.5,2.3,1.0,2.6,1.3,1.1,1.3,8.6,8.9,9.9,7.0,9.5,8.7,6.7,1.4,5.3,2.0,9.9,1.0,5.3,10.0,3.5,8.4,0.9,8.7,5.7,2.8,6.1,2.0,8.8,8.1,6.3,5.6,7.7,9.9,2.3,2.9,5.2,5.9,8.2,2.8,3.5,4.2,6.8,4.1,7.6,3.1,7.9,8.4,5.2,7.7,5.5,9.0,8.0,2.3,0.9,6.8,0.8,1.9,1.1,6.0,2.8,1.4,8.2,3.8,7.0,9.4,4.1,3.9,7.8,1.5,9.6,9.9,5.2,5.6,5.2,3.8,7.5,8.9,7.1,1.7,2.2,3.5,6.2,7.0,3.5,6.2,6.0,6.7,2.9,6.9,0.9,3.8,1.1,3.0,8.1,7.8,3.3,3.5,9.9,8.8,10.0,2.4,2.4,6.4,9.4,7.6,3.1,9.9,3.7,1.8,3.8,9.0,6.6,6.7,7.6,1.6,7.2,9.5,3.2,5.6,9.9,1.0,6.7,8.4,6.3,8.3,3.7,5.2,9.5,8.2,2.3,6.0,7.0,7.0,8.5,3.7,9.0,7.9,9.9,1.0,9.8,0.7,4.5,4.0,7.4,9.0,6.8,2.3,3.2,3.7,3.7],
            quiz_score: [3.2,3.7,5.3,5.7,8.7,7.6,3.9,2.4,10.0,6.5,2.5,3.0,4.1,4.2,9.9,0.3,9.2,2.7,7.1,8.3,8.6,7.2,7.6,3.8,3.7,8.7,6.8,4.9,9.6,4.4,9.3,2.8,3.1,2.7,4.4,8.9,0.6,5.0,10.0,6.3,7.1,9.1,5.1,6.6,2.2,8.7,2.5,8.0,6.0,3.2,1.5,4.9,0.3,2.6,3.2,8.9,9.0,7.8,5.1,8.2,9.2,5.2,3.8,3.8,1.6,7.7,1.8,6.9,8.0,4.3,9.5,1.8,7.2,5.3,4.9,7.1,3.4,9.4,7.2,6.0,4.7,6.3,8.5,2.0,3.6,6.2,4.6,8.1,4.7,5.3,5.0,6.6,6.7,7.3,3.0,7.7,8.9,6.3,7.4,5.4,10.0,8.6,1.6,1.7,7.9,2.9,1.7,1.5,5.9,3.6,2.6,6.5,6.0,7.2,9.6,4.6,2.7,8.2,3.0,10.0,9.0,7.9,5.9,5.1,5.2,7.8,9.7,6.2,3.2,2.1,4.2,6.7,6.2,4.1,7.6,6.2,6.1,3.6,7.0,1.5,4.3,2.7,3.6,8.4,7.7,4.1,4.9,9.3,8.6,9.3,4.0,5.6,7.5,9.7,8.9,4.9,8.1,3.9,2.8,3.0,6.6,7.0,6.8,7.6,3.3,7.0,9.7,4.2,5.9,9.2,1.2,5.3,8.3,7.7,9.1,4.5,5.8,9.9,8.3,2.3,6.9,6.2,8.1,8.0,4.2,8.2,7.9,8.5,2.9,9.1,0.4,5.1,3.1,8.5,8.6,7.6,2.7,3.3,4.1,3.1],
            missed_classes: [6,7,6,4,4,2,7,9,2,3,7,10,10,5,3,8,5,6,3,2,3,8,5,5,8,3,8,6,1,4,2,11,5,6,4,2,9,8,1,5,5,4,8,2,11,1,5,4,5,9,11,10,9,8,7,2,3,7,5,3,3,1,10,4,8,0,8,4,5,7,3,7,5,2,8,2,5,3,3,2,7,3,1,8,7,5,5,2,8,6,9,5,6,4,9,3,5,3,4,6,2,5,7,7,5,7,6,7,5,8,7,4,5,6,1,8,5,4,6,3,3,7,7,9,5,2,0,6,5,9,5,4,5,9,6,6,5,6,6,8,6,11,7,4,5,6,4,2,2,2,8,6,5,2,3,9,3,5,7,6,3,3,5,0,9,4,2,8,6,0,6,7,3,5,4,6,6,3,3,6,8,2,2,5,5,5,6,0,7,4,6,7,4,3,3,4,9,6,6,6],
            attendance: [27,40,82,54,48,58,18,68,80,68,67,40,37,43,70,33,43,50,41,99,86,90,79,66,29,91,69,61,87,59,65,72,61,57,42,83,26,62,74,65,72,84,34,85,25,42,67,33,27,64,51,53,31,53,56,85,56,83,70,100,76,56,36,87,48,73,57,80,69,81,55,59,79,62,63,70,55,89,64,91,57,89,58,45,74,28,98,50,71,52,65,87,51,79,65,80,56,81,67,76,70,55,33,32,73,59,61,65,53,63,61,72,28,60,100,33,25,83,62,72,30,59,52,53,41,62,41,81,42,56,51,57,48,52,75,37,60,69,31,41,36,46,75,100,89,53,70,100,41,71,44,53,68,90,89,65,80,57,28,27,66,55,73,49,32,31,61,68,65,74,45,62,95,45,76,70,40,86,96,38,70,56,50,81,26,7,78,100,40,87,35,22,61,92,75,71,15,76,60,54]
          },
          x_max: { study_hours: 10, quiz_score: 10, missed_classes: 12, attendance: 100, student_id: 200 }
        },
        visual: {
          schema: {
            table_name: 'student_stats (200 dòng · 5 cột phân tích + ID)',
            columns: [
              { name: 'student_id', type: 'INT64 · định danh', key: 'ID', icon: '🪪',
                note: '<strong>Identifier</strong> — mã số, KHÔNG mang thông tin. r với điểm ≈ 0 (nhiễu). Loại khỏi ma trận phân tích.' },
              { name: 'study_hours', type: 'FLOAT · giờ/tuần', key: '⭐', icon: '',
                note: '<strong>Feature</strong> — <strong>r = 0.95</strong> với final_score, CAO NHẤT. Học nhiều đi cùng điểm cao (chưa chắc gây ra).' },
              { name: 'attendance', type: 'FLOAT · %', key: '', icon: '',
                note: '<strong>Feature</strong> — r = 0.60, dương VỪA. Quan hệ có nhưng lỏng hơn study/quiz.' },
              { name: 'missed_classes', type: 'INT · buổi', key: '', icon: '',
                note: '<strong>Feature</strong> — <strong>r = −0.75</strong>, tương quan ÂM: nghỉ càng nhiều điểm càng thấp.' },
              { name: 'quiz_score', type: 'FLOAT · /10', key: '', icon: '',
                note: '<strong>Feature</strong> — r = 0.93, dương mạnh. Nhưng quiz & final cùng cao có thể do biến ẩn "chăm học".' },
              { name: 'final_score', type: 'FLOAT · /100', key: 'MỤC TIÊU', icon: '🎯',
                note: '<strong>Điểm cuối kỳ</strong> — cột ta muốn hiểu. Đọc CỘT này trong ma trận để xếp hạng feature.' }
            ]
          },
          data_preview: [
            ['20520001', '1.3', '2.7', '6', '3.2', '2.4'],
            ['20520003', '5.4', '8.2', '6', '5.3', '6.4'],
            ['20520005', '8.9', '4.8', '4', '8.7', '8.8'],
            ['20520020', '9.6', '9.9', '2', '8.3', '10.0'],
            ['20520016', '0.6', '3.3', '8', '0.3', '0.0'],
            ['20520004', '5.1', '5.4', '4', '5.7', '8.1'],
            ['20520009', '9.7', '8.0', '2', '10.0', '10.0'],
            ['20520024', '2.6', '6.6', '5', '3.8', '4.7']
          ]
        },
        mission: 'Dựng <code class="code">RECIPE ĐỌC SỐ</code> cho <code class="code">student_stats</code>: CHỌN 5 cột số (loại <code class="code">student_id</code>) → <code class="code">cov</code> (thô) → <code class="code">corr</code> (chuẩn hóa, đọc predictor mạnh nhất) — kho có <code class="code">mồi bẫy 🪤</code> (đưa ID vào · nhầm cov thành corr) ↓'
      },

      /* ----- STEP 2: 3 MCQ (đọc r âm · cov vs corr · nhân quả) + mini-game 4 ngăn ----- */
      step_2: {
        mcq: [
          {
            question: 'Ma trận cho <code>r(missed_classes, final_score) = −0.75</code>. Đọc thế nào cho ĐÚNG?',
            options: [
              { id: 'a', text: 'Nghỉ càng nhiều thì điểm càng thấp — tương quan ÂM khá mạnh', correct: true, explanation: 'Đúng — dấu ÂM = ngược chiều (một cái tăng, cái kia giảm); |−0.75| khá lớn nên quan hệ mạnh. Nghỉ nhiều đi cùng điểm thấp.' },
              { id: 'b', text: 'Nghỉ học không liên quan gì tới điểm', correct: false, explanation: '"Không liên quan" ứng với r ≈ 0. −0.75 là quan hệ MẠNH, chỉ là ngược chiều.' },
              { id: 'c', text: 'Nghỉ càng nhiều điểm càng CAO', correct: false, explanation: 'Đó là đọc nhầm dấu. r ÂM nghĩa là ngược chiều: nghỉ nhiều → điểm THẤP.' },
              { id: 'd', text: 'r âm là lỗi tính toán, phải bỏ', correct: false, explanation: 'r âm hoàn toàn hợp lệ — nó chỉ nói quan hệ ngược chiều. Không có gì sai để bỏ.' }
            ]
          },
          {
            question: 'Bạn muốn biết cột nào liên quan <code>final_score</code> MẠNH hơn: study hay attendance. Nên nhìn <strong>cov</strong> hay <strong>corr</strong>?',
            options: [
              { id: 'a', text: 'corr — vì nó chuẩn hóa về [−1,1], so sánh các cặp được', correct: true, explanation: 'Đúng — corr(study,final)=0.95 > corr(att,final)=0.60 nói ngay study mạnh hơn. cov phụ thuộc đơn vị nên số to/nhỏ không so trực tiếp được.' },
              { id: 'b', text: 'cov — vì số của nó lớn hơn nên chính xác hơn', correct: false, explanation: 'Số cov lớn KHÔNG có nghĩa quan hệ mạnh hơn — nó chỉ phản ánh đơn vị/thang. Phải chuẩn hóa thành corr mới so được.' },
              { id: 'c', text: 'Cả hai đều không so sánh được', correct: false, explanation: 'corr chính là công cụ để so sánh — đó là lý do nó tồn tại (cov chuẩn hóa về [−1,1]).' },
              { id: 'd', text: 'Nhìn cột nào có trung bình cao hơn', correct: false, explanation: 'Trung bình nói "quanh mức nào", không nói quan hệ với final_score. Muốn xếp hạng liên hệ phải dùng corr.' }
            ]
          },
          {
            question: 'Phòng đào tạo thấy <code>r(study_hours, final) = 0.95</code> và định ra chính sách "ép mọi SV học thêm 5 giờ để điểm tăng". Nhận xét nào ĐÚNG?',
            options: [
              { id: 'a', text: 'Cẩn thận — r cao không chứng minh học GÂY RA điểm cao; có thể do biến ẩn (SV chăm)', correct: true, explanation: 'Chuẩn — tương quan ≠ nhân quả. Có thể "chăm học" là biến ẩn kéo cả study_hours lẫn final_score lên. Ép giờ học chưa chắc nâng điểm. Muốn chắc phải thí nghiệm can thiệp.' },
              { id: 'b', text: 'Hợp lý — r = 0.95 đã chứng minh học nhiều làm điểm cao', correct: false, explanation: 'Đây đúng là cái bẫy của bài. r cao chỉ nói "đi cùng nhau", KHÔNG chứng minh nhân quả. Ra chính sách từ tương quan là rủi ro.' },
              { id: 'c', text: 'Sai vì r = 0.95 quá cao, chắc chắn tính nhầm', correct: false, explanation: 'r = 0.95 hợp lệ và quan hệ có thật. Vấn đề không phải con số sai, mà là suy ra NHÂN QUẢ từ tương quan.' },
              { id: 'd', text: 'Nên dùng student_id thay vì study_hours cho chắc', correct: false, explanation: 'student_id là mã số vô nghĩa (r ≈ 0). Nó không liên quan điểm — càng không thể dựa vào để ra chính sách.' }
            ]
          }
        ],
        mini_game: {
          title: 'Xếp mỗi cột theo quan hệ với final_score',
          instruction: 'Đọc r rồi kéo mỗi cột vào đúng ngăn: <strong>🔵 THUẬN mạnh</strong> (r ≥ 0.9) · <strong>🟢 THUẬN vừa</strong> (0.4–0.7) · <strong>🔴 NGHỊCH</strong> (r âm) · <strong>⚪ VÔ NGHĨA</strong> (r ≈ 0).',
          chips: [
            { id: 'g-study', label: 'study_hours (r 0.95)' },
            { id: 'g-quiz',  label: 'quiz_score (r 0.93)' },
            { id: 'g-att',   label: 'attendance (r 0.60)' },
            { id: 'g-miss',  label: 'missed_classes (r −0.75)' },
            { id: 'g-id',    label: 'student_id (r ≈ 0)' }
          ],
          bins: [
            { id: 'strong', label: '🔵 THUẬN mạnh', correct: 'true' },
            { id: 'mid',    label: '🟢 THUẬN vừa',  correct: 'true' },
            { id: 'neg',    label: '🔴 NGHỊCH',     correct: 'true' },
            { id: 'none',   label: '⚪ VÔ NGHĨA',    correct: 'true' }
          ],
          solution: {
            'g-study': 'strong',
            'g-quiz':  'strong',
            'g-att':   'mid',
            'g-miss':  'neg',
            'g-id':    'none'
          },
          success: 'Chuẩn — đọc r là đọc cả DẤU (thuận/nghịch) lẫn ĐỘ LỚN (mạnh/yếu). study & quiz thuận mạnh, missed nghịch, attendance thuận vừa, student_id vô nghĩa. Nhưng "mạnh" ≠ "gây ra" — đó là recipe Bước 3 sắp dựng.'
        }
      },

      /* ----- STEP 3: map 3 TRẠM — numeric_df → cov → corr. 2 mồi bẫy: đưa ID vào / nhầm cov=corr ----- */
      step_3: {
        ml_pipeline: true,
        blocks: [
          { type: 'py', token: 'numeric_df = df[["study_hours", "attendance", "missed_classes", "quiz_score", "final_score"]]', slot: 'b1' },
          { type: 'py', token: 'cov_matrix = numeric_df.cov()', slot: 'b2' },
          { type: 'py', token: 'corr_matrix = numeric_df.corr()', slot: 'b3' },
          /* 2 mồi bẫy */
          { type: 'py', token: 'numeric_df = df', slot: 't1' },
          { type: 'py', token: 'corr_matrix = numeric_df.cov()', slot: 't2' }
        ],
        drop_zones: [
          { id: 'l7-cols', accepts: ['py'], multi: false },
          { id: 'l7-cov',  accepts: ['py'], multi: false },
          { id: 'l7-corr', accepts: ['py'], multi: false }
        ],
        ml_flow: {
          brand: 'RECIPE ĐỌC SỐ — 3 TRẠM · TƯƠNG QUAN',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: 'student_stats · 200 dòng · 5 cột phân tích + student_id (loại)' },
          done_note: 'corr_matrix 5×5 (đường chéo = 1): cột final_score xếp hạng study 0.95 > quiz 0.93 > missed −0.75 > attendance 0.60. student_id ĐỨNG NGOÀI. Nhớ: mạnh ≠ nhân quả. Bước 4 tính cả cov + corr bằng Pandas thật.',
          stations: [
            {
              zones: ['l7-cols'],
              icon: '🎯', label: 'TRẠM 1 — CHỌN 5 CỘT SỐ', sub: 'numeric_df, loại student_id', result_kind: 'stat_select',
              stat_select: {
                pick: [
                  { col: 'study_hours' }, { col: 'attendance' }, { col: 'missed_classes' },
                  { col: 'quiz_score' }, { col: 'final_score' }
                ],
                exclude: [
                  { col: 'student_id', icon: '🪪', why: 'ĐỊNH DANH — r với điểm chỉ là nhiễu vô nghĩa' }
                ]
              },
              narration: '<code>numeric_df</code> giữ 5 cột PHÂN TÍCH (4 feature + final_score), bỏ <code>student_id</code>. Mã số dù cho ra một con số r nào đó cũng chỉ là nhiễu — đưa ID vào ma trận là mời gọi kết luận sai.'
            },
            {
              zones: ['l7-cov'],
              icon: '📐', label: 'TRẠM 2 — HIỆP PHƯƠNG SAI', sub: 'cov() — thô, phụ thuộc đơn vị', result_kind: 'stat_matrix',
              stat: {
                mode: 'cov',
                cols: ['study', 'att', 'miss', 'quiz', 'final'],
                grid: [
                  [8.2, 2.9, -5.5, 6.8, 7.3],
                  [2.9, 4.0, -2.0, 2.4, 3.2],
                  [-5.5, -2.0, 6.2, -4.5, -5.0],
                  [6.8, 2.4, -4.5, 6.5, 6.4],
                  [7.3, 3.2, -5.0, 6.4, 7.2]
                ],
                highlight_col: 4,
                note: '<code>cov()</code> cho biết CHIỀU (dương = cùng lên): cov(study,final)=7.3, cov(missed,final)=−5.0. Nhưng 7.3 "to" hay "nhỏ"? Phụ thuộc đơn vị nên KHÔNG so trực tiếp cặp nào mạnh hơn — cần chuẩn hóa.'
              },
              narration: '<code>numeric_df.cov()</code> ra ma trận 5×5 hiệp phương sai. Dấu đọc được (dương/âm), nhưng độ lớn phụ thuộc thang từng cột — đó là lý do trạm sau chuẩn hóa thành tương quan.'
            },
            {
              zones: ['l7-corr'],
              icon: '🔗', label: 'TRẠM 3 — TƯƠNG QUAN', sub: 'corr() — chuẩn hóa [−1,1], đọc được', result_kind: 'stat_matrix',
              stat: {
                mode: 'corr',
                cols: ['study', 'att', 'miss', 'quiz', 'final'],
                grid: [
                  [1.00, 0.51, -0.77, 0.93, 0.95],
                  [0.51, 1.00, -0.40, 0.47, 0.60],
                  [-0.77, -0.40, 1.00, -0.72, -0.75],
                  [0.93, 0.47, -0.72, 1.00, 0.93],
                  [0.95, 0.60, -0.75, 0.93, 1.00]
                ],
                highlight_col: 4,
                note: 'Chuẩn hóa xong: mọi r ∈ [−1,1], đường chéo = 1. Đọc CỘT <b>final</b> (tô vàng): study <b>0.95</b> > quiz 0.93 > missed <b>−0.75</b> > att 0.60. Giờ mới xếp hạng được. ⚠ Nhưng mạnh ≠ nhân quả.'
              },
              narration: '<code>numeric_df.corr()</code> = cov chia cho tích độ lệch chuẩn → gói về [−1,1]. Cột final_score cho thứ hạng feature liên quan điểm. student_id đã đứng ngoài nên không lọt vào bảng — không tạo r nhiễu đánh lừa.'
            }
          ]
        },
        expected_sql: 'numeric_df = df[["study_hours", "attendance", "missed_classes", "quiz_score", "final_score"]] cov_matrix = numeric_df.cov() corr_matrix = numeric_df.corr()',
        expected_zones: {
          'l7-cols': 'numeric_df = df[["study_hours", "attendance", "missed_classes", "quiz_score", "final_score"]]',
          'l7-cov':  'cov_matrix = numeric_df.cov()',
          'l7-corr': 'corr_matrix = numeric_df.corr()'
        },
        reveal_hints: {
          'l7-cols': 'Trạm 1: 5 cột phân tích, KHÔNG student_id — <strong>numeric_df = df[["study_hours", "attendance", "missed_classes", "quiz_score", "final_score"]]</strong>.',
          'l7-cov':  'Trạm 2: hiệp phương sai — <strong>cov_matrix = numeric_df.cov()</strong>.',
          'l7-corr': 'Trạm 3: tương quan chuẩn hóa — <strong>corr_matrix = numeric_df.corr()</strong> (KHÔNG phải .cov()).'
        }
      },

      drag_map: {
        brand: 'RECIPE ĐỌC SỐ — 3 TRẠM · TƯƠNG QUAN',
        table_sub: 'student_stats · 200 dòng · 5 cột phân tích + ID',
        idle_sub: '200 dòng · ▶ chạy để đọc mean/cov/corr',
        run_label: '▶ Chạy 3 trạm',
        table: {
          name: 'student_stats',
          columns: ['student_id', 'study_hours', 'attendance', 'missed_classes', 'quiz_score', 'final_score'],
          dataRows: [
            ['20520001', '1.3', '2.7', '6', '3.2', '2.4'],
            ['20520003', '5.4', '8.2', '6', '5.3', '6.4'],
            ['20520005', '8.9', '4.8', '4', '8.7', '8.8'],
            ['20520020', '9.6', '9.9', '2', '8.3', '10.0'],
            ['20520016', '0.6', '3.3', '8', '0.3', '0.0'],
            ['20520004', '5.1', '5.4', '4', '5.7', '8.1'],
            ['20520009', '9.7', '8.0', '2', '10.0', '10.0'],
            ['20520024', '2.6', '6.6', '5', '3.8', '4.7']
          ]
        }
      },

      /* ----- STEP 4: tính mean/cov/corr bằng Pandas thật. Grader: grade_lesson7
         (numeric_df 5 cột + cov 5×5 + corr 5×5 khớp; Risk đưa ID vào; Behavior xáo dòng bất biến). ----- */
      step_4: {
        prompt: 'Bước 3 bạn lắp recipe bằng tay. Giờ viết <strong>Pandas thật</strong>: nạp bảng, tạo <code>numeric_df</code> (5 cột phân tích, bỏ ID), tính <code>cov_matrix</code> và <code>corr_matrix</code>, rồi in tương quan với <code>final_score</code>. Hệ thống chấm sẽ <strong>xáo thứ tự 200 dòng</strong> — ma trận tương quan phải KHÔNG đổi (thống kê không phụ thuộc thứ tự mẫu).',
        context: {
          scenario: 'Dữ liệu có thể được nạp theo thứ tự khác nhau mỗi lần. Hidden test xáo trộn 200 dòng — corr viết đúng (tính từ df) thì bất biến; nếu chép tay số hoặc phụ thuộc thứ tự thì vỡ. Và nhớ: <strong>KHÔNG</strong> đưa <code>student_id</code> vào numeric_df — mã số "tương quan" với điểm chỉ là nhiễu, trượt tầng Risk.',
          real_world: 'Cạm bẫy kinh điển: thấy 2 biến tương quan cao rồi kết luận cái này GÂY RA cái kia để ra quyết định (ép giờ học, cắt ngân sách…). Rất nhiều "phát hiện" kiểu này sụp đổ vì có biến ẩn hoặc đảo chiều nhân quả. Tương quan chỉ ra CHỖ đáng điều tra; khẳng định nhân quả cần thí nghiệm can thiệp (A/B test, RCT) — sẽ gặp ở khóa sau.',
          steps: [
            'Import hàm nạp dữ liệu; nạp <code>df</code>.',
            'Tạo <code>numeric_df</code> = đúng 5 cột số phân tích (bỏ <code>student_id</code>).',
            'Tính <code>cov_matrix</code> và <code>corr_matrix</code> từ <code>numeric_df</code>.',
            'In tương quan của các cột với <code>final_score</code> (xếp hạng) · Run · Submit chấm 4 tầng.'
          ],
          hint_explore: 'Muốn soi trước? Gõ <code>print(df.describe())</code> hoặc <code>print(df.corr(numeric_only=True)["final_score"])</code> rồi <strong>Run</strong> để xem trung bình & tương quan trước.',
          expected: 'Console in tương quan với final_score: study_hours ≈ 0.95, quiz ≈ 0.93, missed ≈ −0.75, att ≈ 0.60. Đủ 4 tầng xanh. Thử thêm student_id vào numeric_df? Code VẪN chạy — tầng Risk sẽ giải thích vì sao sai.'
        },
        hints: [
          { level: 1, text: 'Đúng recipe Bước 3, thêm import + in xếp hạng: chọn 5 cột → cov() → corr() → in cột final_score.' },
          { level: 2, text: 'Đầu bài: <code>from ml_lab import load_statistics_dataset</code>, <code>df = load_statistics_dataset()</code>.' },
          { level: 3, text: 'Chọn cột: <code>numeric_df = df[["study_hours", "attendance", "missed_classes", "quiz_score", "final_score"]]</code> (KHÔNG student_id). Rồi <code>cov_matrix = numeric_df.cov()</code> và <code>corr_matrix = numeric_df.corr()</code>.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>from ml_lab import load_statistics_dataset<br>df = load_statistics_dataset()<br>numeric_df = df[["study_hours", "attendance", "missed_classes", "quiz_score", "final_score"]]<br>cov_matrix = numeric_df.cov()<br>corr_matrix = numeric_df.corr()<br>print(corr_matrix["final_score"].sort_values(ascending=False))</code>' }
        ],
        grader_fn: 'grade_lesson7',
        success_message: 'Chuẩn — numeric_df 5 cột, cov 5×5, corr 5×5 khớp tham chiếu (đường chéo = 1). study_hours (0.95) & quiz (0.93) liên quan điểm nhất, missed nghịch (−0.75), student_id đứng ngoài. Và bạn đã ghi nhớ: r cao KHÔNG chứng minh nhân quả. Bài 8: vẽ đường dự đoán đầu tiên — Linear Regression.',
        xp_reward: 50
      }
    },
    {
      id: 'c1_l8',
      index: 8,
      title: 'Vẽ đường dự đoán đầu tiên',
      subtitle: 'Model tuyến tính = một ĐƯỜNG THẲNG ŷ = w·x + b — kéo w, b để nó khớp dữ liệu',
      module: 12,
      module_title: 'M3 — Hồi quy tuyến tính',
      estimated_minutes: 18,
      xp_reward: 50,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      story: {
        tag: '📈 StudyLab · Ticket #08 · MỞ MÀN M3',
        hook: 'Sang chương mới! Phòng đào tạo muốn <strong>DỰ ĐOÁN điểm cuối kỳ từ giờ tự học</strong> — cho một bạn học <code>x</code> giờ, đoán điểm <code>ŷ</code>. Đây là bộ demo nhỏ: <strong>12 học viên</strong> đã biết cả giờ học lẫn điểm (thang 100). Cách đơn giản nhất để dự đoán: <strong>vẽ một ĐƯỜNG THẲNG</strong> xuyên qua đám điểm — <code>ŷ = w·x + b</code>. Kéo <strong>độ dốc w</strong> và <strong>điểm cắt b</strong> cho đường bám sát dữ liệu nhất. Đây mới là đường <strong>ĐẦU TIÊN</strong> — chọn bằng tay, chưa chắc tốt nhất. Nhưng làm sao MÁY tự tìm đường tốt nhất? Đó là chuyện Bài 9-10.'
      },
      achievement: { name: 'Line Drawer — đường dự đoán đầu tiên', desc: 'hiểu ŷ = w·x + b, chỉnh độ dốc & điểm cắt cho khớp, viết hàm dự đoán vectorized' },

      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Hiểu <strong>model tuyến tính</strong> là một đường thẳng <code>ŷ = w·x + b</code> — cho <code>x</code> trả về dự đoán <code>ŷ</code>.',
            'Biết <strong>w</strong> (độ dốc) làm đường nghiêng, <strong>b</strong> (điểm cắt) dịch đường lên/xuống; đo độ tốt bằng <strong>tổng lỗi</strong> (residual).',
            'Viết hàm <code>predict_score(x, w, b)</code> tính <code>w·x + b</code> cho cả <strong>mảng</strong> — và biết vì sao đây mới là đường ĐẦU TIÊN (Bài 9-10 tối ưu).'
          ]
        },
        glossary: [
          { term: 'MODEL TUYẾN TÍNH', vi: 'một đường thẳng', accent: '#38BDF8',
            def: 'Cách dự đoán đơn giản nhất: một <b>đường thẳng</b> <code>ŷ = w·x + b</code>. Cho x → trả ŷ.',
            ex: 'giờ học x = 5 → đường cho ŷ ≈ 58 điểm.',
            out: 'khớp = đường bám sát các điểm thật' },
          { term: 'WEIGHT (w · độ dốc)', vi: 'độ dốc', accent: '#34D399',
            def: 'Đường <b>dốc</b> bao nhiêu. x tăng 1 đơn vị thì ŷ tăng đúng <b>w</b>. <b>w ÂM</b> → đường đi XUỐNG (x tăng, ŷ giảm).',
            ex: 'w = 6.6 → học thêm 1 giờ, điểm dự đoán tăng ~6.6. Kéo w xuống âm để thấy đường lộn ngược.',
            out: 'kéo w lớn → dốc hơn · w âm → nghịch biến' },
          { term: 'BIAS (b · điểm cắt)', vi: 'điểm cắt', accent: '#A78BFA',
            def: 'Giá trị <b>ŷ khi x = 0</b> — chỗ đường cắt trục dọc. Dịch cả đường lên/xuống. ⚠ Đừng nhầm: bias ở đây KHÔNG phải "thiên vị" hay sai số — chỉ là một tham số vị trí.',
            ex: 'b = 25 → học 0 giờ, đường đoán ~25 điểm.',
            out: 'kéo b → đường tịnh tiến, KHÔNG đổi độ dốc' },
          { term: 'DỰ ĐOÁN ŷ (y-hat)', vi: 'giá trị đoán', accent: '#22D3EE',
            def: 'Giá trị <b>model đoán ra</b> = w·x + b. Khác <code>y</code> (điểm THẬT của bạn đó).',
            ex: 'đường đoán ŷ = 55, nhưng bạn đó thực được y = 60.',
            out: 'ŷ ≠ y → có sai số (residual)' },
          { term: 'RESIDUAL (lệch)', vi: 'sai số 1 điểm', accent: '#FB923C',
            def: 'Khoảng cách DỌC từ điểm thật tới đường: <b>ŷ − y</b>. Âm = đường đoán hụt.',
            ex: 'ŷ 55 − y 60 = −5: đường đang đoán thấp hơn thực tế 5 điểm.',
            out: 'residual nhỏ = đường khớp tốt điểm đó' },
          { term: 'ĐƯỜNG KHỚP NHẤT', vi: 'least squares', accent: '#FBBF24',
            def: 'Đường làm <b>TỔNG lỗi nhỏ nhất</b>. Ta mò bằng tay; MÁY tự tìm bằng thuật toán.',
            ex: '12 điểm này: đường khớp nhất ≈ ŷ = 6.6·x + 25.',
            out: 'Bài 9 ĐO lỗi (MSE) · Bài 10 để máy TỰ chỉnh' }
        ],
        primer: {
          goal: [
            'Model tuyến tính = đường ŷ = w·x + b',
            'w nghiêng đường · b dịch đường',
            'Đo độ tốt = tổng lỗi (residual) — đường đầu tiên chưa tối ưu'
          ],
          intro: '',
          example: '🔍 <strong>Kéo 2 thanh trong ống kính bên dưới:</strong> thanh <strong>ĐỘ DỐC (w)</strong> làm đường nghiêng, thanh <strong>ĐIỂM CẮT (b)</strong> dịch đường lên/xuống. Nhìn các đoạn lệch dọc và <strong>TỔNG LỖI</strong> co lại khi đường bám sát điểm hơn. Bấm "đường khớp nhất" để so với đáp án máy. Giữ ý này sang Bước 2 👇'
        },
        intro: 'Dự đoán một con số (điểm) từ một con số (giờ học) — cách khởi đầu kinh điển là <strong>hồi quy tuyến tính</strong>: dựng một đường thẳng <code>ŷ = w·x + b</code> rồi đọc dự đoán ngay trên đường. <strong>w</strong> quyết định đường dốc thế nào, <strong>b</strong> quyết định đường nằm cao hay thấp. Bài này bạn tự tay kéo w, b cho đường khớp — để CẢM được thế nào là "đường tốt". Việc dạy MÁY tự tìm đường tốt nhất (đo lỗi, tối ưu) là Bài 9 và 10.',
        concept_cards: [
          {
            icon: 'fa-chart-line',
            title: 'Model = một đường thẳng',
            body: 'Hồi quy tuyến tính dự đoán bằng <strong>ŷ = w·x + b</strong>. Cho <code>x</code> (giờ học) → đường trả về <code>ŷ</code> (điểm dự đoán). "Dự đoán" chỉ là tìm điểm tương ứng TRÊN đường. ⚠ Đường KHÔNG tự biết giới hạn: với ŷ = 8·x + 20, ai "học" x = 12 giờ sẽ được đoán <strong>116 điểm — vượt thang 100</strong>. Đường thẳng cứ thẳng mãi; chặn nghĩa là việc của người dùng model.'
          },
          {
            icon: 'fa-sliders',
            title: 'w nghiêng · b dịch',
            body: '<strong>w (độ dốc)</strong>: kéo lên → đường dốc hơn, mỗi giờ học thêm cộng nhiều điểm hơn. <strong>b (điểm cắt)</strong>: kéo lên → cả đường tịnh tiến lên, độ dốc giữ nguyên. Hai núm điều khiển đúng một đường thẳng.'
          },
          {
            icon: 'fa-circle-question',
            title: 'Đây mới là đường ĐẦU TIÊN',
            body: 'Ta chọn w, b bằng TAY — chưa chắc tốt nhất. Đo độ tốt bằng <strong>tổng lỗi</strong> (các đoạn lệch residual). Câu hỏi lớn: làm sao MÁY tự tìm w, b nhỏ lỗi nhất? → <strong>Bài 9</strong> đo lỗi bằng MSE, <strong>Bài 10</strong> để máy tự chỉnh (gradient descent).'
          }
        ],
        /* Hero = ỐNG KÍNH ĐƯỜNG (user chốt 2026-07-21): kéo w,b → đường sống + đoạn lệch + tổng lỗi */
        line_lens: {
          title: 'ỐNG KÍNH ĐƯỜNG — KÉO w & b CHO KHỚP',
          intro: 'Scatter 12 học viên thật. Kéo <b>ĐỘ DỐC (w)</b> và <b>ĐIỂM CẮT (b)</b> cho đường <code>ŷ = w·x + b</code> bám sát điểm — nhìn <b>TỔNG LỖI</b> co lại. Bấm "đường khớp nhất" để so với máy, rồi trả lời câu chốt.',
          x_label: 'study_hours (giờ học)', y_label: 'final_score',
          x_max: 10, y_max: 90,
          w0: 4.0, b0: 30, w_min: -4, w_max: 12, w_step: 0.1, b_min: 0, b_max: 50, b_step: 1,
          best: { w: 6.6, b: 25 },
          x: [1.3, 1.5, 2.0, 2.7, 2.8, 3.3, 3.4, 4.6, 4.9, 5.9, 6.7, 8.7],
          y: [34.0, 30.0, 38.0, 45.0, 47.0, 43.0, 50.0, 56.0, 66.0, 63.0, 69.0, 80.0],
          riddle: {
            prompt: 'Đường khớp nhất ≈ ŷ = 6.6·x + 25. Một bạn học 5 giờ → model dự đoán bao nhiêu điểm?',
            options: ['≈ 58 điểm', '≈ 25 điểm', '≈ 6.6 điểm'],
            answer: '≈ 58 điểm',
            wrong: {
              '≈ 25 điểm': 'Đó là <b>b</b> (điểm cắt) — điểm khi x = 0. Phải cộng cả phần độ dốc: w·x = 6.6·5 = 33 → 33 + 25 = 58.',
              '≈ 6.6 điểm': 'Đó là <b>w</b> (độ dốc) — điểm tăng thêm cho MỖI giờ. Dự đoán = w·x + b = 6.6·5 + 25 = 58, không phải chỉ w.'
            },
            done: '✅ Đúng — thay x = 5 vào đường: 6.6·5 + 25 = <b>58</b>. Nhớ: <b>w = 6.6</b> là ĐỘ DỐC (mỗi giờ học thêm, dự đoán +6.6 điểm), <b>b = 25</b> là ĐIỂM CẮT (điểm khi x = 0). Nhưng đây mới là đường ĐẦU TIÊN — làm sao máy biết 6.6/25 là TỐT NHẤT? Bài 9 ĐO lỗi (MSE), Bài 10 để máy TỰ chỉnh. Xuống Bước 2 👇'
          }
        },
        visual: {
          schema: {
            table_name: 'linear_intro (12 học viên · 1 feature)',
            columns: [
              { name: 'study_hours', type: 'FLOAT · giờ/tuần', key: 'x', icon: '📏',
                note: '<strong>Feature (x)</strong> — đầu vào ta dùng để dự đoán. Đưa vào đường: ŷ = w·x + b.' },
              { name: 'final_score', type: 'FLOAT · điểm/100', key: 'y', icon: '🎯',
                note: '<strong>Nhãn thật (y)</strong> — điểm THỰC của 12 bạn (thang 100). Đường cố bám sát các y này; chênh giữa ŷ và y là residual.' }
            ]
          },
          data_preview: [
            ['1.3', '34.0'], ['1.5', '30.0'], ['2.0', '38.0'], ['2.7', '45.0'],
            ['2.8', '47.0'], ['3.3', '43.0'], ['3.4', '50.0'], ['4.6', '56.0'],
            ['4.9', '66.0'], ['5.9', '63.0'], ['6.7', '69.0'], ['8.7', '80.0']
          ]
        },
        mission: 'Dựng <code class="code">RECIPE DỰ ĐOÁN</code> cho <code class="code">linear_intro</code>: CHỌN tham số đường (<code class="code">weight</code>, <code class="code">bias</code>) → DỰ ĐOÁN (<code class="code">ŷ = w·x + b</code>) → SO với thực tế (đoạn lệch — dẫn sang Bài 9) — kho có <code class="code">mồi bẫy 🪤</code> (quên bias · đảo w/b) ↓'
      },

      /* ----- STEP 2: 3 MCQ (w là gì · dự đoán · residual) + mini-game 3 ngăn w/b/ŷ ----- */
      step_2: {
        mcq: [
          {
            question: 'Đường <code>ŷ = w·x + b</code>. Giữ nguyên b, TĂNG w thì đường thay đổi thế nào?',
            options: [
              { id: 'a', text: 'Đường DỐC hơn — mỗi giờ học thêm, ŷ tăng nhiều hơn', correct: true, explanation: 'Đúng — w là độ dốc. x tăng 1 thì ŷ tăng đúng w. w lớn → đường nghiêng gắt hơn quanh điểm cắt.' },
              { id: 'b', text: 'Đường dịch LÊN nhưng độ dốc giữ nguyên', correct: false, explanation: 'Dịch lên/xuống mà giữ độ dốc là việc của b (điểm cắt), không phải w.' },
              { id: 'c', text: 'Đường không đổi, chỉ điểm dữ liệu dịch', correct: false, explanation: 'w đổi thì đường đổi ngay (dốc hơn). Điểm dữ liệu thật cố định, không dịch theo.' },
              { id: 'd', text: 'Đường nằm ngang lại', correct: false, explanation: 'Nằm ngang là w = 0. Tăng w làm đường DỐC hơn, ngược lại.' }
            ]
          },
          {
            question: 'Một model có <code>ŷ = 6·x + 20</code>. Một bạn học <code>x = 5</code> giờ, model dự đoán điểm nào?',
            options: [
              { id: 'a', text: '≈ 50 điểm (6·5 + 20)', correct: true, explanation: 'Đúng — thay x = 5: 6·5 + 20 = 30 + 20 = 50. Dự đoán là ghép cả độ dốc lẫn điểm cắt.' },
              { id: 'b', text: '≈ 20 điểm', correct: false, explanation: '20 là b — điểm khi x = 0. Bạn này học 5 giờ nên phải cộng w·x = 6·5 = 30 → 50.' },
              { id: 'c', text: '≈ 30 điểm', correct: false, explanation: '30 mới là phần w·x (6·5). Còn thiếu + bias 20 → 50.' },
              { id: 'd', text: '≈ 6 điểm', correct: false, explanation: '6 là w (độ dốc), không phải dự đoán. Dự đoán = w·x + b = 50.' }
            ]
          },
          {
            question: 'Đường của bạn dự đoán <code>ŷ = 55</code> cho một học viên, nhưng bạn đó thực tế được <code>y = 60</code>. "Residual" (sai số điểm này) nói lên điều gì?',
            options: [
              { id: 'a', text: 'Lệch 5 điểm, ŷ − y = −5 — đường đang đoán THẤP hơn thực tế', correct: true, explanation: 'Đúng — residual = ŷ − y = 55 − 60 = −5. Âm nghĩa là đường nằm DƯỚI điểm thật ở đây (đoán hụt 5 điểm). Tổng các residual nhỏ = đường khớp tốt.' },
              { id: 'b', text: 'Không có sai số vì 55 và 60 đều là điểm', correct: false, explanation: 'Có sai số: ŷ (dự đoán) khác y (thật) 5 điểm. Đó chính là residual — thứ ta muốn nhỏ lại.' },
              { id: 'c', text: 'Đường hoàn hảo cho điểm này', correct: false, explanation: 'Hoàn hảo là ŷ = y (residual 0). Ở đây lệch 5 điểm nên chưa hoàn hảo.' },
              { id: 'd', text: 'Phải xóa học viên này khỏi dữ liệu', correct: false, explanation: 'Residual chỉ là sai số dự đoán, không phải lỗi dữ liệu. Ta chỉnh ĐƯỜNG cho khớp hơn, không xóa điểm thật.' }
            ]
          }
        ],
        mini_game: {
          title: 'Mỗi mô tả thuộc thành phần nào của ŷ = w·x + b?',
          instruction: 'Kéo mỗi mô tả vào đúng ngăn: <strong>w (độ dốc)</strong> · <strong>b (điểm cắt)</strong> · <strong>ŷ (dự đoán)</strong>.',
          chips: [
            { id: 'd-slope1', label: 'x tăng 1 → giá trị tăng đúng số này' },
            { id: 'd-slope2', label: 'đường dốc hơn khi số này lớn' },
            { id: 'd-int1',   label: 'giá trị khi x = 0' },
            { id: 'd-int2',   label: 'dịch cả đường lên/xuống' },
            { id: 'd-pred1',  label: 'kết quả của w·x + b' },
            { id: 'd-pred2',  label: 'model đoán ra, có thể khác y thật' }
          ],
          bins: [
            { id: 'w',  label: '📐 w (độ dốc)',   correct: 'true' },
            { id: 'b',  label: '↕️ b (điểm cắt)', correct: 'true' },
            { id: 'yh', label: '🎯 ŷ (dự đoán)',  correct: 'true' }
          ],
          solution: {
            'd-slope1': 'w', 'd-slope2': 'w',
            'd-int1': 'b',   'd-int2': 'b',
            'd-pred1': 'yh', 'd-pred2': 'yh'
          },
          success: 'Chuẩn — w điều khiển ĐỘ DỐC, b điều khiển VỊ TRÍ (điểm cắt), còn ŷ là kết quả w·x + b mà model đoán. Ba mảnh ghép của một đường. Đó là recipe Bước 3 sắp dựng.'
        }
      },

      /* ----- STEP 3: map 3 TRẠM — tham số → dự đoán → so lệch. 2 mồi bẫy: quên bias / đảo w,b ----- */
      step_3: {
        ml_pipeline: true,
        blocks: [
          { type: 'py', token: 'weight, bias = 7.0, 25.0', slot: 'b1' },
          { type: 'py', token: 'y_pred = weight * study_hours + bias', slot: 'b2' },
          { type: 'py', token: 'errors = y_pred - final_score', slot: 'b3' },
          /* 2 mồi bẫy */
          { type: 'py', token: 'y_pred = weight * study_hours', slot: 't1' },
          { type: 'py', token: 'y_pred = study_hours * bias + weight', slot: 't2' }
        ],
        drop_zones: [
          { id: 'l8-params',  accepts: ['py'], multi: false },
          { id: 'l8-predict', accepts: ['py'], multi: false },
          { id: 'l8-resid',   accepts: ['py'], multi: false }
        ],
        ml_flow: {
          brand: 'RECIPE DỰ ĐOÁN — 3 TRẠM · ĐƯỜNG ŷ = w·x + b',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: 'linear_intro · 12 học viên · x = giờ học, y = điểm thật (thang 100)' },
          done_note: 'Đường ŷ = 7·x + 25 cho 12 dự đoán; đoạn lệch (residual) là chênh ŷ − y. TỔNG lỗi càng nhỏ đường càng khớp — nhưng đây là đường CHỌN TAY. Bài 9 đo lỗi bằng MSE, Bài 10 để máy tự tìm w,b tốt nhất. Bước 4 viết hàm predict_score.',
          stations: [
            {
              zones: ['l8-params'],
              icon: '🎛️', label: 'TRẠM 1 — THAM SỐ ĐƯỜNG', sub: 'weight (dốc) · bias (cắt)', result_kind: 'regline',
              reg: {
                mode: 'params', w: 7.0, b: 25.0,
                note: 'Chọn <b>weight = 7</b> (độ dốc) và <b>bias = 25</b> (điểm cắt) → khai sinh một đường thẳng. Chưa dự đoán gì, mới định NGHĨA đường. Kéo tay ở Bước 1 để cảm w/b làm gì.'
              },
              narration: '<code>weight, bias = 7.0, 25.0</code> — hai số này ĐỊNH NGHĨA đường. weight quyết định độ dốc, bias quyết định đường nằm cao hay thấp. Đổi 2 số = đổi model.'
            },
            {
              zones: ['l8-predict'],
              icon: '📈', label: 'TRẠM 2 — DỰ ĐOÁN', sub: 'ŷ = w·x + b cho 12 điểm', result_kind: 'regline',
              reg: {
                mode: 'predict', w: 7.0, b: 25.0,
                note: '<code>y_pred = weight * study_hours + bias</code> áp công thức cho CẢ 12 giờ học cùng lúc (vectorized) → 12 dự đoán nằm trên đường. Ví dụ x = 5 → ŷ = 7·5 + 25 = 60.'
              },
              narration: 'Một phép nhân + cộng chạy trên cả mảng: mỗi study_hours cho một điểm ŷ TRÊN đường. Không vòng lặp — numpy làm 12 phép cùng lúc.'
            },
            {
              zones: ['l8-resid'],
              icon: '📏', label: 'TRẠM 3 — SO LỆCH', sub: 'residual = ŷ − y', result_kind: 'regline',
              reg: {
                mode: 'residual', w: 7.0, b: 25.0,
                note: '<code>errors = y_pred - final_score</code> đo chênh giữa dự đoán và thực tế cho từng bạn (đoạn dọc). Có đoạn dương (đường vượt), có đoạn âm (đường hụt). <b>TỔNG lỗi</b> tóm gọn độ khớp — chính là thứ Bài 9 sẽ đo bằng MSE.'
              },
              narration: 'Residual = khoảng cách DỌC từ mỗi điểm thật tới đường. Đường tốt = các đoạn này ngắn. Nhưng "tổng lỗi" đo thế nào cho chuẩn, và làm sao giảm nó tự động? Bài 9 & 10 trả lời.'
            }
          ]
        },
        expected_sql: 'weight, bias = 7.0, 25.0 y_pred = weight * study_hours + bias errors = y_pred - final_score',
        expected_zones: {
          'l8-params':  'weight, bias = 7.0, 25.0',
          'l8-predict': 'y_pred = weight * study_hours + bias',
          'l8-resid':   'errors = y_pred - final_score'
        },
        reveal_hints: {
          'l8-params':  'Trạm 1: định nghĩa đường — <strong>weight, bias = 7.0, 25.0</strong>.',
          'l8-predict': 'Trạm 2: áp công thức cho cả mảng — <strong>y_pred = weight * study_hours + bias</strong> (nhớ + bias).',
          'l8-resid':   'Trạm 3: chênh dự đoán vs thực tế — <strong>errors = y_pred - final_score</strong>.'
        }
      },

      drag_map: {
        brand: 'RECIPE DỰ ĐOÁN — 3 TRẠM · ĐƯỜNG ŷ = w·x + b',
        table_sub: 'linear_intro · 12 học viên · x = giờ học, y = điểm',
        idle_sub: '12 điểm · ▶ chạy để vẽ đường + đo lệch',
        run_label: '▶ Chạy 3 trạm',
        table: {
          name: 'linear_intro',
          columns: ['study_hours', 'final_score'],
          dataRows: [
            ['1.3', '34.0'], ['1.5', '30.0'], ['2.0', '38.0'], ['2.7', '45.0'],
            ['2.8', '47.0'], ['3.3', '43.0'], ['3.4', '50.0'], ['4.6', '56.0'],
            ['4.9', '66.0'], ['5.9', '63.0'], ['6.7', '69.0'], ['8.7', '80.0']
          ]
        }
      },

      /* ----- STEP 4: viết predict_score(x, w, b) = w*x + b (vectorized).
         Grader: grade_lesson8 (output [36,60,84]; Risk quên bias/hard-code; Behavior bộ ẩn cả w âm). ----- */
      step_4: {
        prompt: 'Bước 3 bạn lắp recipe bằng tay. Giờ viết <strong>hàm dự đoán thật</strong>: <code>predict_score(x, weight, bias)</code> trả về <code>weight·x + bias</code> — chạy được cho cả một <strong>mảng</strong> x (numpy). Hệ thống chấm sẽ thử bộ <code>(x, w, b)</code> ẩn (kể cả w ÂM) — hàm phải TÍNH từ công thức, không chép đáp án.',
        context: {
          scenario: 'Grader gọi hàm với nhiều bộ tham số khác nhau, có cả w âm và x là mảng. Nếu bạn gõ tay 3 con số hay quên cộng bias, test ẩn sẽ lộ ngay. Công thức đường thẳng (nhân trọng số rồi CỘNG bias) chạy vectorized — numpy nhân/cộng cả mảng cùng lúc — là qua hết.',
          real_world: 'Đây là "forward pass" nhỏ nhất của mọi model: nhận đầu vào, nhân trọng số, cộng bias, ra dự đoán. Neural network chỉ là xếp CHỒNG nhiều phép w·x + b như thế này rồi thêm phi tuyến — bạn vừa viết viên gạch đầu tiên.',
          steps: [
            'Định nghĩa hàm <code>predict_score</code> nhận đúng 3 tham số: x, weight, bias.',
            'Trả về giá trị theo công thức đường thẳng (nhân trọng số rồi cộng bias).',
            'Gọi thử với một mảng x để in dự đoán · Run · Submit chấm 4 tầng.'
          ],
          hint_explore: 'Muốn soi trước? Gõ <code>import numpy as np</code> rồi <code>print(predict_score(np.array([2, 5, 8]), 8, 20))</code> — kỳ vọng <code>[36 60 84]</code>.',
          expected: 'Với x = [2, 5, 8], w = 8, b = 20 → <code>[36, 60, 84]</code>. Đủ 4 tầng xanh. Thử bỏ "+ bias" hay gõ tay 3 số? Code có thể chạy nhưng tầng Risk/Behavior sẽ bắt.'
        },
        hints: [
          { level: 1, text: 'Chỉ cần 1 hàm ngắn: nhận (x, weight, bias), trả về công thức đường thẳng. Đừng gõ tay con số.' },
          { level: 2, text: 'Khung: <code>def predict_score(x, weight, bias):</code> rồi bên trong <code>return ...</code>. x sẽ là numpy array nên phép nhân/cộng tự chạy trên cả mảng.' },
          { level: 3, text: 'Công thức đường thẳng: <code>return weight * x + bias</code>. KHÔNG quên <code>+ bias</code>; KHÔNG chép [36, 60, 84].' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>def predict_score(x, weight, bias):<br>&nbsp;&nbsp;&nbsp;&nbsp;return weight * x + bias<br>print(predict_score(np.array([2, 5, 8]), 8, 20))</code>' }
        ],
        grader_fn: 'grade_lesson8',
        success_message: 'Chuẩn — predict_score(x, w, b) = w·x + b chạy vectorized, qua cả bộ ẩn (kể cả w âm). Bạn vừa viết forward pass đầu tiên. Nhưng đường w=8/b=20 này TỐT chưa? Bài 9: đo độ tốt của một đường bằng MSE — rồi Bài 10 để máy tự tìm đường tốt nhất.',
        xp_reward: 50
      }
    },
    {
      id: 'c1_l9',
      index: 9,
      title: 'Đo lỗi model bằng MSE',
      subtitle: 'Một con số cho biết đường dự đoán tốt cỡ nào — và vì sao phải BÌNH PHƯƠNG',
      module: 12,
      module_title: 'M3 — Hồi quy tuyến tính',
      estimated_minutes: 18,
      xp_reward: 50,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      story: {
        tag: '📈 StudyLab · Ticket #09',
        hook: 'Bài 8 bạn vẽ đường <code>ŷ = 8·x + 20</code> — nhưng nó <strong>TỐT chưa?</strong> "Nhìn thấy khớp" không đủ; sếp cần <strong>một CON SỐ</strong> để so đường này với đường khác. Ticket #09: đo <strong>lỗi</strong> của đường. Ý tưởng đầu tiên — cộng các <strong>lỗi</strong> (dự đoán − thực tế) — lại hỏng: lỗi <strong>đoán vượt</strong> (+) và <strong>đoán hụt</strong> (−) <strong>triệt tiêu</strong> nhau, một đường sai bét vẫn ra tổng ≈ 0. Cách chuẩn: <strong>bình phương</strong> mỗi lỗi (diệt dấu + phạt lỗi lớn) rồi lấy trung bình → <strong>MSE</strong>. Nhiệm vụ: dựng MSE, dùng nó chấm 2 đường A và B xem cái nào rẻ hơn.'
      },
      achievement: { name: 'Cost Meter — đo lỗi bằng MSE', desc: 'hiểu vì sao bình phương lỗi, tính MSE vectorized, dùng MSE so 2 đường' },

      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Tính <strong>lỗi có dấu</strong> (residual = dự đoán − thực tế) và hiểu vì sao <strong>cộng thẳng</strong> lại triệt tiêu.',
            'Biết vì sao <strong>bình phương</strong> lỗi: diệt dấu VÀ <strong>phạt lỗi lớn</strong> mạnh hơn hẳn; MSE = trung bình các lỗi bình phương.',
            'Dùng MSE <strong>so 2 đường</strong> (A rẻ hơn B), và viết hàm <code>mean_squared_error</code> vectorized. Biết MSE ở đơn vị <strong>điểm²</strong> → căn ra <strong>RMSE</strong>.'
          ]
        },
        glossary: [
          { term: 'RESIDUAL (lỗi có dấu)', vi: 'lệch 1 điểm', accent: '#FB923C',
            def: 'Chênh giữa dự đoán và thực tế: <b>ŷ − y</b>. Dương = đoán VƯỢT; âm = đoán HỤT.',
            ex: 'ŷ 75, y 70 → residual +5 (đường nằm trên điểm thật 5 đơn vị).',
            out: 'giữ HƯỚNG sai · nhưng cộng thẳng thì triệt tiêu' },
          { term: 'TRIỆT TIÊU (cancellation)', vi: 'lỗi khử nhau', accent: '#F87171',
            def: 'Lỗi trái dấu cộng lại thành 0, <b>che giấu</b> một đường sai bét.',
            ex: 'hai lỗi −8 và +8 cộng = 0 (như thể hoàn hảo!) dù cả hai đều sai 8 điểm.',
            out: 'lý do KHÔNG dùng tổng lỗi có dấu' },
          { term: 'SQUARED ERROR', vi: 'lỗi bình phương', accent: '#FBBF24',
            def: 'Bình phương mỗi lỗi: <b>(ŷ − y)²</b>. Luôn ≥ 0 (diệt dấu) và <b>phạt lỗi lớn</b> gấp bội.',
            ex: 'lỗi 10 → 100; lỗi 5 → 25. Một lỗi 10 "tốn" bằng bốn lỗi 5.',
            out: 'diệt dấu + làm nổi bật lỗi lớn' },
          { term: 'MSE', vi: 'sai số bình phương TB', accent: '#38BDF8',
            def: '<b>M</b>ean <b>S</b>quared <b>E</b>rror = <b>trung bình</b> các lỗi bình phương. Một số tóm "đường tốt cỡ nào".',
            ex: 'đường A: MSE 20.9 · đường B: MSE 127.6 → A rẻ hơn nhiều.',
            out: 'thấp = khớp tốt · dùng để SO các đường' },
          { term: 'COST / CHI PHÍ', vi: 'giá của đường', accent: '#A78BFA',
            def: 'MSE chính là "<b>giá</b>" phải trả cho một đường. Học model = tìm đường CHI PHÍ thấp nhất.',
            ex: 'Bài 10 sẽ để máy tự HẠ chi phí này bằng gradient descent.',
            out: 'MSE = hàm mất mát (loss) cho hồi quy' },
          { term: 'RMSE (căn của MSE)', vi: 'về đúng đơn vị', accent: '#34D399',
            def: 'MSE ở đơn vị <b>bình phương</b> (điểm²) — khó đọc. Lấy <b>căn</b> → RMSE về đơn vị gốc (điểm).',
            ex: 'MSE 20.9 điểm² → RMSE ≈ 4.6 điểm: "trung bình lệch ~4.6 điểm".',
            out: '√MSE · cùng đơn vị với y · dễ diễn giải' }
        ],
        primer: {
          goal: [
            'Lỗi có dấu triệt tiêu → phải bình phương',
            'MSE = trung bình lỗi² — 1 số so được các đường',
            'MSE phạt lỗi lớn · đơn vị điểm² → RMSE'
          ],
          intro: '',
          example: '🔍 <strong>Trong ống kính bên dưới, bấm đổi giữa đường A và B:</strong> mỗi lỗi hiện thành một <strong>Ô VUÔNG</strong> (diện tích = lỗi²). Đường A ô nhỏ → <strong>MSE 20.9</strong>; đường B ô to vống → <strong>MSE 127.6</strong>. Để ý dải "TỔNG CÓ DẤU": cộng lỗi có dấu gần 0 dù đường vẫn sai — đó là lý do phải bình phương. Giữ ý này sang Bước 2 👇'
        },
        intro: 'Để MÁY biết một đường tốt hay tệ, ta cần biến "sai lệch" thành <strong>một con số</strong>. Cộng thẳng các lỗi thì hỏng: lỗi dương và âm <strong>triệt tiêu</strong>. Giải pháp kinh điển là <strong>MSE</strong> — bình phương từng lỗi (để dấu không khử nhau và để lỗi lớn bị phạt nặng) rồi lấy trung bình. MSE nhỏ = đường bám sát dữ liệu. Có MSE rồi, Bài 10 sẽ để máy TỰ chỉnh đường sao cho MSE nhỏ dần.',
        concept_cards: [
          {
            icon: 'fa-not-equal',
            title: 'Vì sao BÌNH PHƯƠNG?',
            body: 'Cộng lỗi có dấu thì <strong>triệt tiêu</strong>: −8 và +8 → 0, như thể hoàn hảo dù sai. Bình phương giải 2 việc: (1) <strong>diệt dấu</strong> — mọi lỗi thành số dương; (2) <strong>phạt lỗi lớn</strong> — một lỗi 10 (=100) tốn bằng BỐN lỗi 5 (=25×4). Model sẽ rất "ngại" các cú trật lớn.'
          },
          {
            icon: 'fa-gauge-high',
            title: 'MSE = trung bình lỗi²',
            body: 'Quy trình: lỗi (ŷ−y) → bình phương → <strong>trung bình</strong>. Ra một con số duy nhất so được nhiều đường: đường A <strong>MSE 20.9</strong> &lt; đường B <strong>MSE 127.6</strong> → chọn A. Đây chính là <strong>hàm chi phí</strong> (loss) mà model muốn hạ.'
          },
          {
            icon: 'fa-ruler',
            title: 'Đơn vị điểm² → RMSE',
            body: 'Vì đã bình phương, MSE ở đơn vị <strong>điểm²</strong> — không cùng đơn vị với điểm nên khó đọc "sai bao nhiêu". Lấy <strong>căn bậc hai</strong> → <strong>RMSE</strong> về lại đơn vị điểm: √20.9 ≈ <strong>4.6 điểm</strong> sai trung bình. (Khóa sau dùng nhiều.)'
          }
        ],
        /* Hero = ỐNG KÍNH CHI PHÍ (user chốt 2026-07-22): ô vuông lỗi² + đồng hồ MSE + đổi A↔B */
        cost_lens: {
          title: 'ỐNG KÍNH CHI PHÍ — ĐƯỜNG NÀO RẺ HƠN?',
          intro: 'Scatter 12 học viên. Mỗi lỗi (đoạn dọc) hiện thành <b>Ô VUÔNG</b> — diện tích = lỗi². Bấm đổi <b>đường A ↔ B</b> để so <b>MSE</b>; nhìn dải TỔNG CÓ DẤU thấy vì sao phải bình phương. Trả lời câu chốt để mở Bước 2.',
          x_label: 'study_hours (giờ học)', y_label: 'final_score',
          x_max: 10, y_max: 100,
          x: [1.3, 1.5, 2.0, 2.7, 2.8, 3.3, 3.4, 4.6, 4.9, 5.9, 6.7, 8.7],
          y: [34.0, 30.0, 38.0, 45.0, 47.0, 43.0, 50.0, 56.0, 66.0, 63.0, 69.0, 80.0],
          lines: [
            { label: 'A', w: 8, b: 20 },
            { label: 'B', w: 4, b: 45 }
          ],
          cancel: { e1: -8, e2: 8 },
          riddle: {
            prompt: 'Cộng 12 lỗi CÓ DẤU của đường A lại thì ra ≈ 0. Kết luận "đường A dự đoán hoàn hảo" — đúng không?',
            options: ['Sai — lỗi trên & dưới triệt tiêu nhau; phải BÌNH PHƯƠNG rồi trung bình (MSE 20.9 > 0)', 'Đúng — tổng ≈ 0 nghĩa là không còn lỗi', 'Không đủ dữ liệu để nói'],
            answer: 'Sai — lỗi trên & dưới triệt tiêu nhau; phải BÌNH PHƯƠNG rồi trung bình (MSE 20.9 > 0)',
            wrong: {
              'Đúng — tổng ≈ 0 nghĩa là không còn lỗi': 'Đây chính là cái bẫy TRIỆT TIÊU. Tổng có dấu ≈ 0 vì lỗi đoán-vượt (+) khử lỗi đoán-hụt (−), KHÔNG phải vì hết lỗi. Bình phương rồi trung bình cho MSE 20.9 > 0 — đường A tốt nhưng chưa hoàn hảo.',
              'Không đủ dữ liệu để nói': 'Có đủ: 12 lỗi hiện rõ trên ống kính. Vấn đề là CÁCH gộp — cộng có dấu thì sai (triệt tiêu), phải bình phương → MSE 20.9.'
            },
            done: '✅ Đúng — tổng lỗi CÓ DẤU ≈ 0 chỉ vì các lỗi trái dấu khử nhau, KHÔNG phải vì đường hoàn hảo. Bình phương mỗi lỗi (diệt dấu + phạt lỗi lớn) rồi trung bình → <b>MSE 20.9</b>. So với đường B (MSE 127.6), A rẻ hơn 6 lần. Có "cây thước chi phí" này rồi, Bài 10 sẽ để máy TỰ hạ nó. Xuống Bước 2 👇'
          }
        },
        visual: {
          schema: {
            table_name: 'mse_demo (12 học viên · 2 đường dự đoán)',
            columns: [
              { name: 'study_hours', type: 'FLOAT · giờ/tuần', key: 'x', icon: '📏',
                note: '<strong>Feature (x)</strong> — đầu vào của cả 2 đường A và B.' },
              { name: 'final_score', type: 'FLOAT · điểm/100', key: 'y', icon: '🎯',
                note: '<strong>Thực tế (y)</strong> — điểm THẬT. Residual = ŷ − y đo đường lệch điểm này bao xa.' }
            ]
          },
          data_preview: [
            ['1.3', '34.0'], ['2.0', '38.0'], ['2.8', '47.0'], ['3.4', '50.0'],
            ['4.6', '56.0'], ['4.9', '66.0'], ['5.9', '63.0'], ['8.7', '80.0']
          ]
        },
        mission: 'Dựng <code class="code">CÔNG THỨC MSE</code> cho 12 điểm: LỆCH (<code class="code">errors = ŷ − y</code>, có dấu) → BÌNH PHƯƠNG (<code class="code">errors²</code>, diệt dấu) → TRUNG BÌNH (<code class="code">mse</code>) rồi so đường A vs B — kho có <code class="code">mồi bẫy 🪤</code> (quên bình phương · dùng |lỗi| = MAE) ↓'
      },

      /* ----- STEP 2: 3 MCQ (residual dấu · vì sao bình phương · tính MSE) + mini-game cách-gộp-lỗi ----- */
      step_2: {
        mcq: [
          {
            question: 'Model dự đoán <code>ŷ = 75</code>, thực tế <code>y = 70</code>. Residual (ŷ − y) bằng bao nhiêu và nghĩa là gì?',
            options: [
              { id: 'a', text: '+5 — đường đoán VƯỢT thực tế 5 điểm ở đây', correct: true, explanation: 'Đúng — residual = ŷ − y = 75 − 70 = +5. Dấu dương nghĩa là dự đoán cao hơn thực tế (đường nằm TRÊN điểm).' },
              { id: 'b', text: '−5 — đường đoán hụt', correct: false, explanation: 'Theo quy ước ŷ − y thì 75 − 70 = +5 (dương). Âm là khi dự đoán THẤP hơn thực tế.' },
              { id: 'c', text: '5 điểm nhưng không có dấu', correct: false, explanation: 'Residual GIỮ dấu để biết hướng lệch (vượt/hụt). Bỏ dấu là bước sau (bình phương hoặc trị tuyệt đối).' },
              { id: 'd', text: '145 — cộng 75 và 70', correct: false, explanation: 'Residual là HIỆU (ŷ − y), không phải tổng. 75 − 70 = 5.' }
            ]
          },
          {
            question: 'Hai lỗi là <code>−8</code> và <code>+8</code>. Nếu đo "chất lượng đường" bằng <strong>trung bình lỗi CÓ DẤU</strong>, ta được 0. Vì sao đây là cách đo TỆ?',
            options: [
              { id: 'a', text: 'Vì lỗi trái dấu triệt tiêu — đường sai bét vẫn ra 0, phải bình phương trước', correct: true, explanation: 'Chuẩn — (−8 + 8)/2 = 0 dù cả hai điểm đều sai 8. Bình phương (64 + 64)/2 = 64 mới lộ ra lỗi thật. Đó là lý do MSE bình phương trước khi trung bình.' },
              { id: 'b', text: 'Vì 0 là kết quả tốt, không có gì sai', correct: false, explanation: '0 ở đây là ẢO — do triệt tiêu, không phải do đường đúng. Cả hai điểm lệch 8 điểm mà vẫn ra 0 là dấu hiệu cách đo hỏng.' },
              { id: 'c', text: 'Vì phải cộng thêm số điểm', correct: false, explanation: 'Vấn đề không phải thiếu số hạng mà là DẤU khử nhau. Bình phương (hoặc trị tuyệt đối) mới diệt được dấu.' },
              { id: 'd', text: 'Vì chỉ có 2 điểm, cần nhiều hơn', correct: false, explanation: 'Số điểm không phải vấn đề — kể cả 1000 điểm, lỗi trái dấu vẫn triệt tiêu nếu cộng có dấu.' }
            ]
          },
          {
            question: 'Thực tế <code>[40, 60, 80]</code>, dự đoán <code>[45, 55, 80]</code>. MSE bằng bao nhiêu?',
            options: [
              { id: 'a', text: '≈ 16.67', correct: true, explanation: 'Đúng — lỗi = [5, −5, 0]; bình phương = [25, 25, 0]; trung bình = 50/3 ≈ 16.67. Bình phương diệt dấu nên 2 lỗi trái dấu KHÔNG khử nhau.' },
              { id: 'b', text: '0 — vì lỗi +5 và −5 triệt tiêu', correct: false, explanation: 'Đó là kết quả nếu cộng CÓ DẤU (bẫy triệt tiêu). MSE bình phương TRƯỚC: 25 + 25 + 0 = 50, chia 3 ≈ 16.67.' },
              { id: 'c', text: '≈ 3.33 — trung bình |lỗi|', correct: false, explanation: '(5 + 5 + 0)/3 ≈ 3.33 là MAE (trung bình trị tuyệt đối) — một metric KHÁC. MSE bình phương nên ra 16.67.' },
              { id: 'd', text: '50 — tổng các bình phương', correct: false, explanation: '50 mới là TỔNG (25+25+0). MSE là TRUNG BÌNH nên chia cho số mẫu: 50/3 ≈ 16.67.' }
            ]
          }
        ],
        mini_game: {
          title: 'Cách gộp 12 lỗi thành 1 con số — cái nào là MSE?',
          instruction: 'Kéo mỗi công thức vào đúng ngăn: <strong>✅ MSE</strong> (đúng) · <strong>➖ TRIỆT TIÊU</strong> (lỗi có dấu khử nhau — sai) · <strong>📏 MAE</strong> (trị tuyệt đối — metric khác).',
          chips: [
            { id: 'm-sq',   label: 'bình phương lỗi rồi lấy trung bình' },
            { id: 'm-mean', label: 'trung bình lỗi CÓ DẤU' },
            { id: 'm-sum',  label: 'cộng thẳng lỗi có dấu' },
            { id: 'm-abs',  label: 'trung bình TRỊ TUYỆT ĐỐI của lỗi' }
          ],
          bins: [
            { id: 'mse',    label: '✅ MSE',          correct: 'true' },
            { id: 'cancel', label: '➖ TRIỆT TIÊU',   correct: 'true' },
            { id: 'mae',    label: '📏 MAE (khác)',   correct: 'true' }
          ],
          solution: {
            'm-sq':   'mse',
            'm-mean': 'cancel',
            'm-sum':  'cancel',
            'm-abs':  'mae'
          },
          success: 'Chuẩn — chỉ "bình phương rồi trung bình" là MSE. Cộng/trung bình lỗi CÓ DẤU thì triệt tiêu (đường sai vẫn đẹp); trung bình |lỗi| là MAE — hợp lệ nhưng KHÁC (không phạt lỗi lớn mạnh như MSE). Đó là recipe Bước 3 sắp dựng.'
        }
      },

      /* ----- STEP 3: map 3 TRẠM — lệch → bình phương → MSE (so A/B). 2 mồi bẫy: quên square / MAE ----- */
      step_3: {
        ml_pipeline: true,
        blocks: [
          { type: 'py', token: 'errors = predictions - actual', slot: 'b1' },
          { type: 'py', token: 'squared = errors ** 2', slot: 'b2' },
          { type: 'py', token: 'mse = squared.mean()', slot: 'b3' },
          /* 2 mồi bẫy */
          { type: 'py', token: 'mse = errors.mean()', slot: 't1' },
          { type: 'py', token: 'mse = abs(errors).mean()', slot: 't2' }
        ],
        drop_zones: [
          { id: 'l9-resid',  accepts: ['py'], multi: false },
          { id: 'l9-square', accepts: ['py'], multi: false },
          { id: 'l9-mse',    accepts: ['py'], multi: false }
        ],
        ml_flow: {
          brand: 'CÔNG THỨC MSE — 3 TRẠM · CHI PHÍ ĐƯỜNG',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: 'mse_demo · 12 học viên · so đường A (8x+20) vs B (4x+45)' },
          done_note: 'MSE = trung bình bình phương lỗi. Đường A: 20.9 · đường B: 127.6 → A rẻ hơn 6 lần. Bình phương giúp dấu không triệt tiêu và lỗi lớn bị phạt nặng. Bước 4 viết hàm mean_squared_error dùng lại được; Bài 10 để máy TỰ hạ MSE.',
          stations: [
            {
              zones: ['l9-resid'],
              icon: '📏', label: 'TRẠM 1 — LỆCH CÓ DẤU', sub: 'errors = ŷ − y', result_kind: 'mse_step',
              mse: {
                mode: 'residual', w: 8, b: 20,
                note: '<code>errors = predictions - actual</code> cho 12 lỗi CÓ DẤU (đoạn cam trên = vượt, dưới = hụt). Cộng thẳng chúng lại gần 0 — <b>triệt tiêu</b>, không dùng được. Cần diệt dấu ở trạm sau.'
              },
              narration: 'Residual giữ hướng lệch (vượt/hụt), nhưng chính vì có dấu nên cộng lại thì khử nhau. Đó là lý do ta KHÔNG dừng ở đây.'
            },
            {
              zones: ['l9-square'],
              icon: '⬛', label: 'TRẠM 2 — BÌNH PHƯƠNG', sub: 'squared = errors²', result_kind: 'mse_step',
              mse: {
                mode: 'squared', w: 8, b: 20,
                note: '<code>squared = errors ** 2</code> biến mỗi lỗi thành DIỆN TÍCH ô vuông (luôn ≥ 0). Lỗi lớn nhất (điểm cuối, lệch ~9.6) cho ô to vống — MSE bị nó chi phối. Đó là "phạt lỗi lớn".'
              },
              narration: 'Bình phương làm 2 việc: diệt dấu (ô nào cũng dương) và phóng đại lỗi lớn (9.6² = 92 áp đảo 0.8² = 0.6). Model sẽ rất ngại các cú trật lớn.'
            },
            {
              zones: ['l9-mse'],
              icon: '🧮', label: 'TRẠM 3 — TRUNG BÌNH → MSE', sub: 'mse = squared.mean() · so A/B', result_kind: 'mse_step',
              mse: {
                mode: 'compare',
                compare: [{ label: 'A', w: 8, b: 20 }, { label: 'B', w: 4, b: 45 }],
                note: '<code>mse = squared.mean()</code> lấy trung bình 12 ô vuông. Chấm 2 đường: <b>A = 20.9</b> vs <b>B = 127.6</b> → A rẻ hơn 6 lần, chọn A. Một con số đã so được 2 model. (√20.9 ≈ 4.6 điểm = RMSE.)'
              },
              narration: 'Trung bình các ô vuông = MSE. Giờ so đường nào cũng chỉ cần 1 con số: A 20.9 < B 127.6. Bài 10 sẽ để máy tự dò w,b sao cho con số này nhỏ dần.'
            }
          ]
        },
        expected_sql: 'errors = predictions - actual squared = errors ** 2 mse = squared.mean()',
        expected_zones: {
          'l9-resid':  'errors = predictions - actual',
          'l9-square': 'squared = errors ** 2',
          'l9-mse':    'mse = squared.mean()'
        },
        reveal_hints: {
          'l9-resid':  'Trạm 1: lỗi có dấu — <strong>errors = predictions - actual</strong>.',
          'l9-square': 'Trạm 2: bình phương diệt dấu — <strong>squared = errors ** 2</strong>.',
          'l9-mse':    'Trạm 3: trung bình các bình phương — <strong>mse = squared.mean()</strong> (KHÔNG phải errors.mean()).'
        }
      },

      drag_map: {
        brand: 'CÔNG THỨC MSE — 3 TRẠM · CHI PHÍ ĐƯỜNG',
        table_sub: 'mse_demo · 12 học viên · so A (8x+20) vs B (4x+45)',
        idle_sub: '12 điểm · ▶ chạy để đo lỗi bằng MSE',
        run_label: '▶ Chạy 3 trạm',
        table: {
          name: 'mse_demo',
          columns: ['study_hours', 'final_score'],
          dataRows: [
            ['1.3', '34.0'], ['1.5', '30.0'], ['2.0', '38.0'], ['2.7', '45.0'],
            ['2.8', '47.0'], ['3.3', '43.0'], ['3.4', '50.0'], ['4.6', '56.0'],
            ['4.9', '66.0'], ['5.9', '63.0'], ['6.7', '69.0'], ['8.7', '80.0']
          ]
        }
      },

      /* ----- STEP 4: viết mean_squared_error(actual, predictions) = ((pred−actual)²).mean().
         Grader: grade_lesson9 (Risk bắt MAE / lỗi có dấu; Output A<B; Behavior mảng ẩn). ----- */
      step_4: {
        prompt: 'Bước 3 bạn lắp công thức bằng tay. Giờ viết <strong>hàm thật</strong>: <code>mean_squared_error(actual, predictions)</code> trả về trung bình các lỗi BÌNH PHƯƠNG — chạy cho mảng bất kỳ (numpy). Rồi dùng nó chấm 2 đường A và B. Hệ thống chấm thử mảng ẩn nhiều độ dài & dấu; nếu bạn lỡ dùng trị tuyệt đối (MAE) hay quên bình phương, tầng Risk sẽ bắt.',
        context: {
          scenario: 'Grader phân biệt MSE với 2 metric "trông giống": MAE (trung bình trị tuyệt đối) và trung bình lỗi có dấu. Với bộ thử bất đối xứng, mỗi cách cho một con số khác — chỉ đúng công thức bình-phương-rồi-trung-bình mới khớp. Nhớ: bình phương TRƯỚC khi lấy trung bình.',
          real_world: 'MSE là hàm mất mát (loss) chuẩn của hồi quy: nó biến "đường tốt/tệ" thành một con số để MÁY tối ưu. Gần như mọi thuật toán học hồi quy đều đi tìm tham số làm MSE (hoặc họ hàng của nó) nhỏ nhất — bạn sắp thấy điều đó ở Bài 10 (gradient descent).',
          steps: [
            'Định nghĩa hàm <code>mean_squared_error(actual, predictions)</code> — đúng 2 tham số.',
            'Tính lỗi có dấu, BÌNH PHƯƠNG để diệt dấu, rồi lấy TRUNG BÌNH.',
            'Nạp dữ liệu demo, in MSE của đường A và đường B để so · Run · Submit chấm 4 tầng.'
          ],
          hint_explore: 'Muốn soi trước? Gõ <code>from ml_lab import load_mse_demo</code>, <code>actual, pa, pb = load_mse_demo()</code> rồi in thử — kỳ vọng MSE(A) ≈ 20.9, MSE(B) ≈ 127.6.',
          expected: 'Console in MSE(A) ≈ <code>20.9</code> &lt; MSE(B) ≈ <code>127.6</code>. Đủ 4 tầng xanh. Thử dùng <code>abs()</code> thay bình phương? Code chạy nhưng ra MAE — tầng Risk sẽ giải thích đó là metric khác.'
        },
        hints: [
          { level: 1, text: 'Một hàm ngắn: nhận (actual, predictions), trả về trung bình các lỗi bình phương. Đừng dùng abs (đó là MAE).' },
          { level: 2, text: 'Khung: <code>def mean_squared_error(actual, predictions):</code> rồi bên trong tính lỗi = predictions − actual (numpy tự chạy trên cả mảng).' },
          { level: 3, text: 'Bình phương lỗi rồi lấy mean: <code>errors = predictions - actual</code> → <code>return (errors ** 2).mean()</code>. KHÔNG dùng abs(); KHÔNG quên ** 2.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>from ml_lab import load_mse_demo<br>def mean_squared_error(actual, predictions):<br>&nbsp;&nbsp;&nbsp;&nbsp;errors = predictions - actual<br>&nbsp;&nbsp;&nbsp;&nbsp;return (errors ** 2).mean()<br>actual, pa, pb = load_mse_demo()<br>print(mean_squared_error(actual, pa))<br>print(mean_squared_error(actual, pb))</code>' }
        ],
        grader_fn: 'grade_lesson9',
        success_message: 'Chuẩn — mean_squared_error bình phương rồi trung bình, khớp cả mảng ẩn. MSE(A) 20.9 < MSE(B) 127.6 → A rẻ hơn. Bạn vừa có "cây thước chi phí" cho hồi quy. Bài 10: để MÁY tự dò w,b sao cho MSE nhỏ dần — gradient descent.',
        xp_reward: 50
      }
    },
    {
      id: 'c1_l10',
      index: 10,
      title: 'Gradient Descent — model tự chỉnh đường',
      subtitle: 'Máy tự tìm w, b tốt nhất: đo độ dốc chi phí, đi NGƯỢC dốc, lặp cho tới khi lỗi chạm đáy',
      module: 12,
      module_title: 'M3 — Hồi quy tuyến tính',
      estimated_minutes: 19,
      xp_reward: 50,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      story: {
        tag: '📈 StudyLab · Ticket #10 · KHÉP CHƯƠNG M3',
        hook: 'Nhớ hành trình chương này chứ? <strong>Bài 8</strong> bạn tự tay kéo <code>w</code>, <code>b</code> cho đường khớp. <strong>Bài 9</strong> bạn đo độ tốt bằng <strong>MSE</strong>. Nhưng câu hỏi lớn vẫn treo đó: <strong>làm sao MÁY tự tìm w, b tốt nhất</strong> mà không cần người mò? Ticket #10 trả lời: <strong>Gradient Descent</strong>. Ý tưởng như thả một quả bóng xuống thung lũng chi phí — ở mỗi điểm, <strong>gradient</strong> (độ dốc) chỉ hướng chi phí TĂNG; ta bước <strong>NGƯỢC</strong> lại một chút; lặp nhiều lần, bóng lăn tới đáy — nơi MSE nhỏ nhất. Nhiệm vụ: chỉnh <strong>learning rate</strong> (độ dài mỗi bước) rồi để vòng lặp tự hạ lỗi.'
      },
      achievement: { name: 'Regression Tuner — máy tự học', desc: 'viết vòng lặp Gradient Descent, chọn learning rate, xác nhận MSE giảm bằng loss curve' },

      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Hiểu <strong>gradient</strong> chỉ hướng chi phí TĂNG → cập nhật đi <strong>NGƯỢC</strong>: <code>tham số −= learning_rate × gradient</code>.',
            'Chẩn được <strong>learning rate</strong> quá nhỏ (tụt rề), vừa (mượt), quá lớn (loss văng — phân kỳ).',
            'Viết <strong>vòng lặp GD</strong>: gradient → update → ghi <code>loss_history</code>, và dùng <strong>loss curve</strong> để xác nhận model HỌC thật.'
          ]
        },
        glossary: [
          { term: 'GRADIENT', vi: 'độ dốc chi phí', accent: '#F87171',
            def: 'Độ dốc của <b>chi phí (MSE)</b> theo tham số — chỉ hướng làm chi phí <b>TĂNG</b> nhanh nhất.',
            ex: 'gradient của w dương → tăng w thì MSE tăng; nên phải GIẢM w.',
            out: 'compute_gradients(x, y, w, b) → grad_w, grad_b' },
          { term: 'UPDATE RULE', vi: 'luật cập nhật', accent: '#34D399',
            def: 'Đi NGƯỢC gradient để giảm chi phí: <b>tham số −= learning_rate × gradient</b>.',
            ex: 'w = 2, grad = −10, lr = 0.1 → w −= 0.1·(−10) = w + 1 = 3.',
            out: 'TRỪ (không cộng) · cộng = leo dốc lên = phân kỳ' },
          { term: 'LEARNING RATE (α)', vi: 'độ dài bước', accent: '#FBBF24',
            def: 'Mỗi bước đi <b>bao xa</b>. Nhỏ = rề rà; lớn = nhanh nhưng dễ nhảy vọt qua đáy.',
            ex: 'α 0.002 tụt rất chậm; α 0.02 mượt; α 0.04 loss VĂNG lên (phân kỳ).',
            out: 'chọn α vừa · quá lớn → loss tăng vô cực' },
          { term: 'LOSS CURVE', vi: 'đường lỗi', accent: '#38BDF8',
            def: 'Đồ thị <b>MSE theo từng bước</b>. Đi XUỐNG và phẳng dần = model đang học tốt.',
            ex: 'MSE 887 → 26 sau 200 bước: đường lỗi tụt dốc rồi phẳng ở đáy.',
            out: 'loss_history.append(mse mỗi bước) · verify học thật' },
          { term: 'CONVERGENCE', vi: 'hội tụ', accent: '#22D3EE',
            def: 'Loss <b>ngừng giảm</b>, tham số ổn định gần đáy — coi như đã tìm được w, b tốt.',
            ex: 'sau ~150 bước MSE gần như không đổi → đã hội tụ.',
            out: 'loss cuối ≪ loss đầu · đường đã khớp' },
          { term: 'DIVERGENCE', vi: 'phân kỳ', accent: '#A78BFA',
            def: 'Bước quá dài → nhảy VỌT qua đáy, loss <b>càng lúc càng lớn</b> (có khi → vô cực).',
            ex: 'α 0.04: loss 3 746 → 345 757 → NaN. Triệu chứng: giảm α.',
            out: 'dấu hiệu learning rate quá lớn · KHÔNG hội tụ' }
        ],
        primer: {
          goal: [
            'Gradient chỉ hướng TĂNG → đi NGƯỢC (trừ)',
            'Learning rate = độ dài bước (nhỏ/vừa/lớn)',
            'Vòng lặp + loss curve → máy tự hạ MSE'
          ],
          intro: '',
          example: '🔍 <strong>Trong phòng tập bên dưới:</strong> kéo thanh <strong>LEARNING RATE</strong> rồi bấm <strong>▶ Train</strong>. α nhỏ → đường nhích rất chậm, loss tụt rề. α vừa → đường lao về khớp, loss xuống mượt. α quá lớn → đường giật lung tung, loss VĂNG lên trời (phân kỳ 💥). Cùng một vòng lặp, chỉ khác độ dài bước. Giữ ý này sang Bước 2 👇'
        },
        intro: 'Đây là mảnh ghép cuối của chương: <strong>máy tự tìm đường tốt nhất</strong>. Cơ chế đơn giản đến bất ngờ — tại vị trí (w, b) hiện tại, tính <strong>gradient</strong> của chi phí (nó chỉ hướng chi phí tăng), rồi bước <strong>ngược lại</strong> một đoạn bằng <code>learning_rate × gradient</code>. Lặp lại: mỗi vòng chi phí giảm một chút, đường nhích dần về khớp, cho tới khi <strong>loss curve</strong> phẳng ở đáy. Không ai mò w, b nữa — model tự lăn xuống thung lũng lỗi.',
        concept_cards: [
          {
            icon: 'fa-arrow-trend-down',
            title: 'Đi NGƯỢC gradient',
            body: 'Gradient chỉ hướng chi phí <strong>TĂNG</strong> nhanh nhất. Muốn GIẢM chi phí thì đi <strong>ngược</strong> lại — nên công thức là <strong>tham số −= learning_rate × gradient</strong>. Đổi dấu thành CỘNG = leo ngược lên đồi = loss càng lúc càng lớn (phân kỳ). Như thả bóng: nó lăn xuống, không leo lên.'
          },
          {
            icon: 'fa-ruler-horizontal',
            title: 'Learning rate = độ dài bước',
            body: 'Gradient chọn HƯỚNG, learning rate chọn <strong>độ dài</strong> mỗi bước. Quá <strong>nhỏ</strong>: đi tí xíu, 200 bước chưa tới đáy. Quá <strong>lớn</strong>: nhảy vọt qua đáy rồi văng ra xa — loss phân kỳ. Bí quyết là chọn α <strong>vừa</strong>: xuống nhanh mà vẫn ổn định.'
          },
          {
            icon: 'fa-flag-checkered',
            title: 'KHÉP CHƯƠNG: máy tự học',
            body: 'Trilogy hồi quy khép lại: <strong>Bài 8</strong> — model là một đường <code>ŷ = w·x + b</code>; <strong>Bài 9</strong> — đo độ tệ bằng <strong>MSE</strong>; <strong>Bài 10</strong> — <strong>Gradient Descent</strong> tự hạ MSE để tìm w, b. Đây chính là cách gần như MỌI model học (kể cả mạng nơ-ron). Chương sau: bài toán PHÂN LOẠI.'
          }
        ],
        /* Hero = PHÒNG TẬP GD (user chốt 2026-07-22): lr slider + Train → đường tự chỉnh + loss curve */
        gd_lens: {
          title: 'PHÒNG TẬP GRADIENT DESCENT — ĐỂ MÁY TỰ CHỈNH',
          intro: 'Scatter 40 học viên thật. Kéo <b>LEARNING RATE</b>, bấm <b>▶ Train</b> để chạy 60 bước: đường <code>ŷ = w·x + b</code> TỰ nhích về khớp và <b>loss curve</b> tụt xuống. Thử α nhỏ · vừa · quá lớn (phân kỳ), rồi trả lời câu chốt.',
          x_label: 'study_hours (giờ học)', y_label: 'final_score',
          x_max: 10, y_max: 100,
          lr0: 0.01, lr_min: 0.001, lr_max: 0.045, lr_step: 0.001, steps: 60,
          presets: [
            { lr: 0.002, label: '🐌 quá NHỎ' },
            { lr: 0.02, label: '✅ VỪA' },
            { lr: 0.04, label: '💥 quá LỚN' }
          ],
          x: [4.4,4.6,6.1,3.2,5.6,4.5,1.9,4.8,2.4,4.2,3.9,8.9,4.2,0.9,8.0,7.2,2.3,5.4,6.6,2.4,6.2,3.3,8.9,1.3,6.0,4.2,0.8,2.0,5.6,9.4,2.9,6.3,2.2,4.5,3.5,2.5,7.3,1.5,2.8,4.7],
          y: [55.2,59.1,72.0,47.6,67.1,55.5,28.7,60.3,39.9,55.4,47.0,91.3,53.7,35.7,84.0,77.7,40.9,57.7,79.6,37.2,71.3,48.9,97.5,28.6,69.0,56.2,22.6,34.7,68.0,89.9,40.5,76.5,38.0,52.4,45.1,30.4,86.5,34.2,41.1,51.8],
          riddle: {
            prompt: 'Công thức cập nhật là <code>weight −= learning_rate × grad_w</code>. Vì sao TRỪ chứ không CỘNG?',
            options: ['Gradient chỉ hướng chi phí TĂNG → trừ = đi NGƯỢC → chi phí GIẢM', 'Cộng để đi nhanh hơn tới đáy', 'Trừ hay cộng đều được, miễn có learning rate'],
            answer: 'Gradient chỉ hướng chi phí TĂNG → trừ = đi NGƯỢC → chi phí GIẢM',
            wrong: {
              'Cộng để đi nhanh hơn tới đáy': 'Ngược lại — CỘNG là đi CÙNG hướng gradient, tức leo LÊN đồi chi phí. Loss sẽ càng lúc càng lớn (phân kỳ), y như khi α quá lớn. Phải TRỪ để đi xuống.',
              'Trừ hay cộng đều được, miễn có learning rate': 'Không — DẤU quyết định hướng. Trừ = xuống dốc (giảm loss); cộng = lên dốc (tăng loss vô cực). Learning rate chỉ chọn độ DÀI bước, không đổi được hướng sai.'
            },
            done: '✅ Đúng — gradient chỉ hướng chi phí TĂNG, nên ta bước NGƯỢC lại (TRỪ) để giảm chi phí: <b>tham số −= learning_rate × gradient</b>. Lặp đủ nhiều, đường tự lăn tới đáy thung lũng lỗi — MSE nhỏ nhất. Đó là cách máy TỰ học w, b, khép lại chương hồi quy. Xuống Bước 2 luyện chẩn learning rate 👇'
          }
        },
        visual: {
          schema: {
            table_name: 'gradient_regression (40 học viên · 1 feature)',
            columns: [
              { name: 'study_hours', type: 'FLOAT · giờ/tuần', key: 'x', icon: '📏',
                note: '<strong>Feature (x)</strong> — đầu vào. GD sẽ tự tìm w, b để đường ŷ = w·x + b khớp 40 điểm này.' },
              { name: 'final_score', type: 'FLOAT · điểm/100', key: 'y', icon: '🎯',
                note: '<strong>Nhãn thật (y)</strong> — điểm THỰC. Chi phí = MSE giữa ŷ và y; GD hạ dần chi phí này.' }
            ]
          },
          data_preview: [
            ['4.4', '55.2'], ['6.1', '72.0'], ['1.9', '28.7'], ['8.9', '91.3'],
            ['0.8', '22.6'], ['9.4', '89.9'], ['2.4', '37.2'], ['7.3', '86.5'],
            ['3.3', '48.9'], ['5.6', '68.0'], ['0.9', '35.7'], ['6.6', '79.6']
          ]
        },
        mission: 'Dựng <code class="code">VÒNG LẶP GD</code> cho <code class="code">gradient_regression</code>: đo <code class="code">GRADIENT</code> → <code class="code">UPDATE</code> đi ngược (trừ lr×grad) → <code class="code">LẶP</code> và ghi loss curve — kho có <code class="code">mồi bẫy 🪤</code> (cộng thay trừ · gõ tay loss) ↓'
      },

      /* ----- STEP 2: 3 MCQ (hướng update · chẩn lr · số học update) + mini-game 3 ngăn lr ----- */
      step_2: {
        mcq: [
          {
            question: 'Ở vị trí hiện tại, <code>grad_w</code> là số <strong>DƯƠNG</strong> (tăng w thì chi phí tăng). Để GIẢM chi phí, nên làm gì với w?',
            options: [
              { id: 'a', text: 'GIẢM w — đi ngược gradient (w −= lr × grad_w)', correct: true, explanation: 'Đúng — gradient dương nghĩa "tăng w → chi phí tăng". Muốn chi phí giảm thì đi NGƯỢC lại: giảm w. Đó chính là phép trừ trong luật cập nhật.' },
              { id: 'b', text: 'TĂNG w — đi cùng hướng gradient cho nhanh', correct: false, explanation: 'Đi cùng gradient là leo LÊN đồi chi phí — MSE sẽ tăng, rồi phân kỳ. Phải đi ngược (giảm w).' },
              { id: 'c', text: 'Giữ nguyên w, chỉ chỉnh bias', correct: false, explanation: 'Gradient dương báo w đang lệch — bỏ qua nó thì chi phí không giảm tối ưu. GD cập nhật CẢ w và b mỗi bước.' },
              { id: 'd', text: 'Đặt w = 0 cho an toàn', correct: false, explanation: 'GD không reset tham số — nó nhích từng bước nhỏ theo gradient. Về 0 là vứt hết tiến trình học.' }
            ]
          },
          {
            question: 'Một loss curve <strong>dao động rồi VỌT LÊN</strong> vô cực sau vài bước. Learning rate đang thế nào?',
            options: [
              { id: 'a', text: 'Quá LỚN — bước nhảy vọt qua đáy rồi văng ra xa (phân kỳ)', correct: true, explanation: 'Đúng — bước quá dài làm tham số nhảy qua đáy, mỗi lần càng lệch xa, loss tăng vô cực. Cách chữa: giảm learning rate.' },
              { id: 'b', text: 'Quá NHỎ — nên loss chưa kịp giảm', correct: false, explanation: 'Quá nhỏ thì loss giảm RẤT CHẬM nhưng vẫn đi XUỐNG, không bao giờ vọt lên. Vọt lên là dấu hiệu bước quá dài.' },
              { id: 'c', text: 'Vừa đẹp — dao động là bình thường', correct: false, explanation: 'Loss vọt lên vô cực KHÔNG bình thường — đó là phân kỳ. Learning rate vừa cho đường loss xuống mượt rồi phẳng.' },
              { id: 'd', text: 'Do dữ liệu bẩn, không phải learning rate', correct: false, explanation: 'Cùng dữ liệu, chỉ đổi learning rate là hết phân kỳ — nên thủ phạm là bước quá dài, không phải dữ liệu.' }
            ]
          },
          {
            question: 'Tính một bước update: <code>w = 2</code>, <code>grad_w = −10</code>, <code>learning_rate = 0.1</code>. Giá trị w MỚI?',
            options: [
              { id: 'a', text: 'w = 3  (2 − 0.1 × (−10) = 2 + 1)', correct: true, explanation: 'Đúng — w −= lr × grad = 2 − 0.1·(−10) = 2 − (−1) = 3. Gradient ÂM nên phép trừ lại làm w TĂNG — vẫn đúng hướng giảm chi phí.' },
              { id: 'b', text: 'w = 1  (2 − 0.1 × 10)', correct: false, explanation: 'Nhầm dấu gradient. grad_w = −10 (âm), nên −0.1·(−10) = +1 → w = 3, không phải 1.' },
              { id: 'c', text: 'w = 2  (không đổi)', correct: false, explanation: 'grad_w ≠ 0 nên w PHẢI đổi. Kết quả là 3.' },
              { id: 'd', text: 'w = −8  (2 + 0.1 × (−10) × 10)', correct: false, explanation: 'Công thức chỉ là w − lr·grad = 2 − 0.1·(−10) = 3. Không có phép nhân thêm nào.' }
            ]
          }
        ],
        mini_game: {
          title: 'Mỗi loss curve ứng với learning rate nào?',
          instruction: 'Đọc mô tả đường lỗi rồi kéo vào đúng ngăn: <strong>🐌 quá NHỎ</strong> · <strong>✅ VỪA</strong> · <strong>💥 quá LỚN</strong>.',
          chips: [
            { id: 'g-s1', label: 'loss tụt rất chậm, 60 bước chưa tới đáy' },
            { id: 'g-s2', label: 'mỗi bước nhích một tí xíu' },
            { id: 'g-m1', label: 'loss xuống mượt rồi phẳng ở đáy' },
            { id: 'g-m2', label: 'về đáy nhanh mà vẫn ổn định' },
            { id: 'g-l1', label: 'loss dao động rồi vọt lên vô cực' },
            { id: 'g-l2', label: 'nhảy qua đáy, càng lúc càng xa' }
          ],
          bins: [
            { id: 'small', label: '🐌 quá NHỎ', correct: 'true' },
            { id: 'good',  label: '✅ VỪA',     correct: 'true' },
            { id: 'big',   label: '💥 quá LỚN',  correct: 'true' }
          ],
          solution: {
            'g-s1': 'small', 'g-s2': 'small',
            'g-m1': 'good',  'g-m2': 'good',
            'g-l1': 'big',   'g-l2': 'big'
          },
          success: 'Chuẩn — learning rate quá nhỏ thì an toàn nhưng RỀ, quá lớn thì nhanh nhưng PHÂN KỲ, vừa thì xuống mượt tới đáy. Gradient chọn hướng, learning rate chọn độ dài bước. Đó là recipe Bước 3 sắp dựng.'
        }
      },

      /* ----- STEP 3: map 3 TRẠM — gradient → update(trừ) → lặp+loss. 2 mồi bẫy: cộng thay trừ / gõ tay loss ----- */
      step_3: {
        ml_pipeline: true,
        blocks: [
          { type: 'py', token: 'grad_w, grad_b = compute_gradients(x, y, weight, bias)', slot: 'b1' },
          { type: 'py', token: 'weight -= learning_rate * grad_w', slot: 'b2' },
          { type: 'py', token: 'loss_history.append(compute_mse(y, weight * x + bias))', slot: 'b3' },
          /* 2 mồi bẫy */
          { type: 'py', token: 'weight += learning_rate * grad_w', slot: 't1' },
          { type: 'py', token: 'loss_history.append(0.0)', slot: 't2' }
        ],
        drop_zones: [
          { id: 'l10-grad',   accepts: ['py'], multi: false },
          { id: 'l10-update', accepts: ['py'], multi: false },
          { id: 'l10-loss',   accepts: ['py'], multi: false }
        ],
        ml_flow: {
          brand: 'VÒNG LẶP GD — 3 TRẠM · MÁY TỰ HẠ LỖI',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: 'gradient_regression · 40 học viên · x = giờ học, y = điểm (đường thật ~8x+20)' },
          done_note: 'Một vòng: GRADIENT đo độ dốc chi phí → UPDATE đi NGƯỢC (trừ lr×grad) → ghi LOSS. Lặp ~200 vòng, loss curve tụt 887 → 26, đường tự khớp. Máy tìm w, b KHÔNG cần người mò. Bước 4 viết trọn vòng lặp.',
          stations: [
            {
              zones: ['l10-grad'],
              icon: '📐', label: 'TRẠM 1 — GRADIENT', sub: 'đo độ dốc chi phí', result_kind: 'regline',
              reg: {
                mode: 'residual', w: 2.0, b: 5.0,
                note: '<code>grad_w, grad_b = compute_gradients(x, y, weight, bias)</code>. Đường hiện tại (w=2, b=5) còn tệ — các đoạn lệch dài, chi phí cao. Gradient đo <b>độ dốc của chi phí</b>: nó chỉ hướng làm chi phí TĂNG, để ta biết đường nào NÊN tránh.'
              },
              narration: 'compute_gradients trả về grad_w, grad_b — độ dốc chi phí theo w và b tại vị trí hiện tại. Đây là kim chỉ nam: nó nói "đi hướng này thì chi phí tăng", nên bước sau ta đi NGƯỢC.'
            },
            {
              zones: ['l10-update'],
              icon: '⬇️', label: 'TRẠM 2 — UPDATE (đi NGƯỢC)', sub: 'weight -= lr × grad', result_kind: 'regline',
              reg: {
                mode: 'residual', w: 5.5, b: 12.0,
                note: '<code>weight -= learning_rate * grad_w</code> (bias tương tự). TRỪ = đi NGƯỢC gradient → đường nhích về phía dữ liệu, các đoạn lệch NGẮN lại, chi phí giảm. Nếu CỘNG, đường sẽ chạy ngược ra xa (phân kỳ).'
              },
              narration: 'Bước ngược gradient một đoạn dài learning_rate: w và b nhích một chút. Sau bước này đường (w≈5.5, b≈12) đã bám sát hơn — chi phí thấp hơn trạm trước. Một bước = một lần nhích.'
            },
            {
              zones: ['l10-loss'],
              icon: '📉', label: 'TRẠM 3 — LẶP + LOSS', sub: 'loss curve tụt tới đáy', result_kind: 'gd_curve',
              gd: {
                lr: 0.01, steps: 200,
                note: '<code>loss_history.append(compute_mse(...))</code> ghi MSE mỗi vòng. Lặp ~200 lần: loss curve tụt <b>887 → 26</b> rồi phẳng — đã HỘI TỤ. Đường cuối (w≈9.8, b≈11) khớp dữ liệu. Máy tự tìm ra, không ai mò.'
              },
              narration: 'Gói 3 bước vào một vòng lặp for chạy N lần, mỗi vòng ghi lại MSE. Loss curve đi xuống rồi phẳng = bằng chứng model HỌC thật. Đây là cơ chế train của gần như mọi model ML.'
            }
          ]
        },
        expected_sql: 'grad_w, grad_b = compute_gradients(x, y, weight, bias) weight -= learning_rate * grad_w loss_history.append(compute_mse(y, weight * x + bias))',
        expected_zones: {
          'l10-grad':   'grad_w, grad_b = compute_gradients(x, y, weight, bias)',
          'l10-update': 'weight -= learning_rate * grad_w',
          'l10-loss':   'loss_history.append(compute_mse(y, weight * x + bias))'
        },
        reveal_hints: {
          'l10-grad':   'Trạm 1: đo độ dốc chi phí — <strong>grad_w, grad_b = compute_gradients(x, y, weight, bias)</strong>.',
          'l10-update': 'Trạm 2: đi NGƯỢC gradient (TRỪ, không cộng) — <strong>weight -= learning_rate * grad_w</strong>.',
          'l10-loss':   'Trạm 3: ghi MSE mỗi bước — <strong>loss_history.append(compute_mse(y, weight * x + bias))</strong>.'
        }
      },

      drag_map: {
        brand: 'VÒNG LẶP GD — 3 TRẠM · MÁY TỰ HẠ LỖI',
        table_sub: 'gradient_regression · 40 học viên · x = giờ học, y = điểm',
        idle_sub: '40 điểm · ▶ chạy để đo gradient + cập nhật + vẽ loss curve',
        run_label: '▶ Chạy 3 trạm',
        table: {
          name: 'gradient_regression',
          columns: ['study_hours', 'final_score'],
          dataRows: [
            ['4.4', '55.2'], ['4.6', '59.1'], ['6.1', '72.0'], ['3.2', '47.6'], ['5.6', '67.1'],
            ['4.5', '55.5'], ['1.9', '28.7'], ['4.8', '60.3'], ['2.4', '39.9'], ['4.2', '55.4'],
            ['3.9', '47.0'], ['8.9', '91.3'], ['4.2', '53.7'], ['0.9', '35.7'], ['8.0', '84.0'],
            ['7.2', '77.7'], ['2.3', '40.9'], ['5.4', '57.7'], ['6.6', '79.6'], ['2.4', '37.2'],
            ['6.2', '71.3'], ['3.3', '48.9'], ['8.9', '97.5'], ['1.3', '28.6'], ['6.0', '69.0'],
            ['4.2', '56.2'], ['0.8', '22.6'], ['2.0', '34.7'], ['5.6', '68.0'], ['9.4', '89.9'],
            ['2.9', '40.5'], ['6.3', '76.5'], ['2.2', '38.0'], ['4.5', '52.4'], ['3.5', '45.1'],
            ['2.5', '30.4'], ['7.3', '86.5'], ['1.5', '34.2'], ['2.8', '41.1'], ['4.7', '51.8']
          ]
        }
      },

      /* ----- STEP 4: viết vòng lặp GD hoàn chỉnh. Grader: grade_lesson10
         (loop + compute_gradients + TRỪ lr×grad + loss_history==steps hội tụ; Risk cộng-sai-dấu/gõ-tay-loss/w,b=0; Behavior variant ẩn). ----- */
      step_4: {
        prompt: 'Bước 3 bạn lắp một VÒNG. Giờ viết trọn <strong>vòng lặp Gradient Descent</strong>: nạp dữ liệu, khởi tạo <code>weight, bias = 0.0</code>, rồi lặp <code>steps</code> lần — mỗi vòng tính gradient, update đi NGƯỢC (TRỪ lr×grad cho cả w và b), và ghi MSE vào <code>loss_history</code>. Hệ thống chấm chạy lại trên <strong>dataset ẩn</strong> (đường thật khác) — vòng lặp phải vẫn hội tụ.',
        context: {
          scenario: 'Grader kiểm: có vòng lặp gọi compute_gradients, update dùng phép TRỪ learning_rate×gradient, loss_history đủ đúng steps phần tử và loss cuối ≪ loss đầu. Đổi TRỪ thành CỘNG → phân kỳ, trượt. Gõ tay một số loss đẹp mà tham số không đổi → tầng Risk bắt (w, b vẫn 0). Dataset ẩn có đường thật khác hẳn — hard-code sẽ lộ.',
          real_world: 'Đây là trái tim của "training" trong ML: gần như MỌI model — hồi quy, logistic, và cả mạng nơ-ron hàng tỷ tham số — đều học bằng biến thể của vòng lặp này (gradient → update ngược → lặp). Bạn vừa viết bộ máy tự học ở dạng nhỏ nhất.',
          steps: [
            'Nạp <code>x, y</code>; khởi tạo <code>weight, bias = 0.0</code>, chọn <code>learning_rate</code> và <code>steps</code>; tạo <code>loss_history = []</code>.',
            'Trong vòng lặp: tính gradient bằng helper có sẵn.',
            'Cập nhật <code>weight</code> và <code>bias</code> đi <strong>NGƯỢC</strong> gradient (dùng phép TRỪ).',
            'Ghi MSE của bước này vào <code>loss_history</code> · in loss đầu/cuối · Run · Submit chấm 4 tầng.'
          ],
          hint_explore: 'Muốn soi trước? Sau vòng lặp, gõ <code>print(loss_history[0], loss_history[-1])</code> — kỳ vọng số đầu LỚN hơn số cuối nhiều lần (loss đã giảm).',
          expected: 'Với <code>learning_rate = 0.01, steps = 200</code>: loss <code>≈ 887 → ≈ 26</code>, đủ 200 phần tử. Cả 4 tầng xanh. Thử đổi TRỪ thành CỘNG? Loss sẽ VĂNG lên — tầng Output/Code bắt ngay.'
        },
        hints: [
          { level: 1, text: 'Khung: khởi tạo weight, bias = 0.0 + learning_rate + steps + loss_history = []; rồi for step in range(steps): gradient → update TRỪ → append MSE.' },
          { level: 2, text: 'Đầu bài: <code>from ml_lab import load_gradient_data, compute_mse, compute_gradients</code>, <code>x, y = load_gradient_data()</code>. Đặt <code>weight, bias = 0.0, 0.0</code>, <code>learning_rate, steps = 0.01, 200</code>, <code>loss_history = []</code>.' },
          { level: 3, text: 'Trong <code>for step in range(steps):</code> — <code>grad_w, grad_b = compute_gradients(x, y, weight, bias)</code>; rồi <code>weight -= learning_rate * grad_w</code> và <code>bias -= learning_rate * grad_b</code> (TRỪ, cho CẢ hai); cuối cùng <code>loss_history.append(compute_mse(y, weight * x + bias))</code>.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>from ml_lab import load_gradient_data, compute_mse, compute_gradients<br>x, y = load_gradient_data()<br>weight, bias = 0.0, 0.0<br>learning_rate, steps = 0.01, 200<br>loss_history = []<br>for step in range(steps):<br>&nbsp;&nbsp;&nbsp;&nbsp;grad_w, grad_b = compute_gradients(x, y, weight, bias)<br>&nbsp;&nbsp;&nbsp;&nbsp;weight -= learning_rate * grad_w<br>&nbsp;&nbsp;&nbsp;&nbsp;bias -= learning_rate * grad_b<br>&nbsp;&nbsp;&nbsp;&nbsp;loss_history.append(compute_mse(y, weight * x + bias))<br>print(loss_history[0], loss_history[-1])</code>' }
        ],
        grader_fn: 'grade_lesson10',
        success_message: 'Chuẩn — vòng lặp GD hội tụ: MSE ≈ 887 → 26, tham số update thật, dataset ẩn cũng học được. Bạn vừa viết bộ máy tự học của ML: gradient → đi ngược → lặp. Khép chương HỒI QUY (đường → MSE → GD). Chương sau — Bài 11: vì sao đường thẳng KHÔNG dùng để phân loại xác suất được, và ta cần sigmoid.',
        xp_reward: 50
      }
    },
    {
      id: 'c1_l11',
      index: 11,
      title: 'Vì sao Linear Regression không phân loại được',
      subtitle: 'Đường thẳng không có trần/sàn — nó đoán "xác suất" −46% và 175%',
      module: 13,
      module_title: 'M4 — Phân loại Logistic',
      estimated_minutes: 19,
      xp_reward: 50,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      story: {
        tag: '🎯 StudyLab · Ticket #11 · MỞ MÀN M4',
        hook: 'Chương mới, bài toán mới: <strong>PHÂN LOẠI</strong>. Phòng đào tạo muốn biết <strong>khả năng một bạn qua môn</strong> — không phải điểm số, mà một <strong>xác suất</strong> (0% đến 100%). Ta đã có sẵn cái búa quen tay từ chương trước: hồi quy tuyến tính. Vậy cứ gán Rớt = 0, Đậu = 1 rồi fit một đường thẳng lên nhãn 0/1 — <strong>code chạy trơn tru</strong>, không lỗi gì cả. Nhưng thử đưa vào vài giá trị nằm ngoài dải quen thuộc mà xem: đường trả về <strong>−0.46</strong> và <strong>1.75</strong>. Một "xác suất" <strong>âm 46%</strong>? Một "xác suất" <strong>175%</strong>? Nhiệm vụ Ticket #11: <strong>khám nghiệm tận mắt cái sai</strong> trước khi học lời giải (sigmoid, Bài 12).'
      },
      achievement: { name: 'Logistic Foundations — khám nghiệm mô hình sai', desc: 'audit LinearRegression trên nhãn 0/1, phát hiện output ngoài [0,1], hiểu vì sao clip/threshold không chữa gốc' },

      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Nhận ra <strong>đường thẳng không bị chặn</strong>: output chạy ra ngoài [0,1] nên KHÔNG thể là xác suất.',
            'Phân biệt <strong>quyết định lớp</strong> (threshold) với <strong>ước lượng xác suất</strong> — và thấy 1 <strong>outlier</strong> kéo lệch cả đường lẫn ranh giới.',
            'Hiểu vì sao <strong>clip về [0,1] là giấu bệnh</strong>, và vì sao ta cần một <strong>hàm BỊ CHẶN</strong> (sigmoid — Bài 12).'
          ]
        },
        glossary: [
          { term: 'XÁC SUẤT', vi: 'khả năng xảy ra', accent: '#34D399',
            def: 'Một số <b>trong [0, 1]</b>: 0 = chắc chắn không, 1 = chắc chắn có. Ngoài khoảng này là <b>vô nghĩa</b>.',
            ex: '0.72 = 72% khả năng qua môn. Còn −0.46 hay 1.75 thì không tồn tại.',
            out: 'mọi model xác suất PHẢI trả về [0,1]' },
          { term: 'UNBOUNDED', vi: 'không bị chặn', accent: '#F87171',
            def: 'Đường thẳng <b>w·x + b</b> chạy từ −∞ tới +∞ — không có trần, không có sàn.',
            ex: 'x càng lớn ŷ càng lớn mãi: x=14 → 1.75; x=−2 → −0.46.',
            out: 'gốc rễ của lỗi: dùng hàm vô hạn để tả xác suất hữu hạn' },
          { term: 'THRESHOLD', vi: 'ngưỡng cắt', accent: '#FBBF24',
            def: 'Cắt tại một mốc (thường 0.5) để đổi số thành <b>NHÃN 0/1</b>.',
            ex: 'ŷ ≥ 0.5 → Đậu, ngược lại Rớt. Đổi ngưỡng 0.5→0.7 chỉ dịch quyết định.',
            out: 'cho nhãn hợp lệ · KHÔNG sửa được range output' },
          { term: 'CLIP', vi: 'ép về khoảng', accent: '#FB923C',
            def: 'Cắt cụt output về [0,1] cho "đẹp": −0.46 → 0, 1.75 → 1.',
            ex: 'np.clip(outputs, 0, 1) — nhìn hợp lệ nhưng model bên dưới vẫn tối ưu sai.',
            out: '⚠ GIẤU triệu chứng, không chữa bệnh' },
          { term: 'OUTLIER SENSITIVITY', vi: 'nhạy điểm cực đoan', accent: '#A78BFA',
            def: 'Một điểm cực đoan <b>kéo lệch cả đường</b> — và kéo theo cả ranh giới quyết định.',
            ex: 'thêm 1 SV học 30 giờ: dốc 0.139 → 0.075, ranh giới 4.95 → 5.45, lỗi 5 → 7.',
            out: 'hồi quy bình phương rất nhạy outlier' },
          { term: 'BOUNDED FUNCTION', vi: 'hàm bị chặn', accent: '#38BDF8',
            def: 'Hàm <b>tự nhốt</b> mọi đầu vào vào (0, 1) dù x lớn/nhỏ cỡ nào — đây mới là lời giải.',
            ex: 'sigmoid: z = −100 → p ≈ 0; z = +100 → p ≈ 1; không bao giờ vượt.',
            out: 'Bài 12: sigmoid biến score thành xác suất' }
        ],
        primer: {
          goal: [
            'Đường thẳng vô hạn → output ngoài [0,1]',
            'Threshold vá nhãn, KHÔNG vá xác suất',
            'Clip = giấu bệnh → cần hàm bị chặn'
          ],
          intro: '',
          example: '🔍 <strong>Trong ống kính bên dưới:</strong> dải xanh là vùng xác suất hợp lệ [0, 1]. Kéo thanh <strong>x (giờ học)</strong> và nhìn đường thẳng: ở x nhỏ nó <strong>chui xuống dưới 0</strong>, ở x lớn nó <strong>vọt lên trên 1</strong>. Cả hai đều là "xác suất" không tồn tại. Đây là bài <strong>khám nghiệm</strong> — nhìn tận mắt cái sai trước khi học lời giải. Giữ ý này sang Bước 2 👇'
        },
        intro: 'Máy tính không báo lỗi khi ta fit đường thẳng lên nhãn 0/1 — <strong>code chạy được không có nghĩa là công thức hóa đúng</strong>. Vấn đề nằm ở bản chất: xác suất bị nhốt trong [0, 1], còn đường thẳng thì chạy vô tận. Hệ quả: model cho ra "xác suất" âm và trên 100%; ta có thể <em>che</em> bằng clip hay <em>lách</em> bằng threshold, nhưng cả hai đều không chạm tới gốc. Lời giải thật là đổi sang một <strong>hàm bị chặn</strong> — đó là Bài 12.',
        concept_cards: [
          {
            icon: 'fa-arrows-up-down',
            title: 'Đường thẳng không có trần/sàn',
            body: 'Xác suất phải nằm trong <strong>[0, 1]</strong>. Nhưng <code>ŷ = w·x + b</code> chạy từ −∞ tới +∞: với dữ liệu này, x = −2 cho <strong>−0.46</strong> (âm 46%!) và x = 14 cho <strong>1.75</strong> (175%!). Trong 12 điểm thử, <strong>3 điểm dưới 0</strong> và <strong>3 điểm trên 1</strong>. Sai từ dạng hàm, không phải sai code.'
          },
          {
            icon: 'fa-scissors',
            title: 'Threshold vá NHÃN, không vá XÁC SUẤT',
            body: 'Cắt tại 0.5 cho ra nhãn 0/1 hợp lệ — nhưng nó KHÔNG sửa hai chuyện: (1) output thô vẫn ngoài [0,1]; (2) model vẫn tối ưu <strong>sai mục tiêu</strong> (bình phương sai số, hợp cho số liên tục chứ không hợp cho lớp). Đổi ngưỡng chỉ <strong>dịch quyết định</strong>, không đổi bản chất. ⚠ Và 1 <strong>outlier</strong> đủ kéo lệch đường + ranh giới (4.95 → 5.45, lỗi 5 → 7).'
          },
          {
            icon: 'fa-bandage',
            title: 'Clip = giấu bệnh · cần hàm BỊ CHẶN',
            body: '<code>np.clip(outputs, 0, 1)</code> ép −0.46 thành 0, 1.75 thành 1 — nhìn thì hợp lệ, nhưng model bên dưới <strong>không hề đổi</strong>: vẫn là đường thẳng, vẫn tối ưu sai. Giấu triệu chứng ≠ chữa bệnh. Lời giải thật: dùng hàm <strong>tự nhốt</strong> output trong (0,1) — <strong>sigmoid</strong>, Bài 12.'
          }
        ],
        /* Hero = ỐNG KÍNH XÁC SUẤT VÔ LÝ (user chốt 2026-07-22) */
        linreg_audit: {
          title: 'ỐNG KÍNH XÁC SUẤT VÔ LÝ — ĐƯỜNG THẲNG THÒ KHỎI [0,1]',
          intro: 'Dải xanh = vùng xác suất hợp lệ <b>[0, 1]</b>. Chấm dưới = Rớt (0), chấm trên = Đậu (1); đường xanh là LinearRegression fit lên nhãn 0/1. Kéo thanh <b>x</b> để soi output — ra ngoài dải là <b>không thể là xác suất</b>. Trả lời câu chốt để mở Bước 2.',
          x_label: 'study_hours (giờ học)', y_label: 'output',
          x_min: -3, x_max: 15, y_min: -0.75, y_max: 1.95,
          w: 0.1386, b: -0.1861, threshold: 0.5, boundary: 4.95,
          probe: [-2, -0.5, 0.5, 1.5, 3, 4.5, 5.5, 7, 8.5, 10.5, 12, 14],
          x0: 14,
          train_x: [8.0,8.2,3.5,1.2,6.6,5.2,3.3,6.4,1.1,7.4,5.9,0.5,0.7,6.3,8.5,2.2,2.0,9.2,5.1,4.2,6.1,8.2,8.4,1.2,9.4,9.1,3.1,9.3,1.7,2.5,0.6,0.8,3.7,2.3,9.1,7.3,6.8,6.6,8.7,4.4,6.0,1.2,9.3,6.5,0.9,3.1,5.8,8.7,1.5,1.3,8.1,7.0,1.7,4.9,0.9,2.9,4.1,2.3,1.0,0.6],
          train_y: [1,1,1,0,1,1,0,1,0,1,1,0,0,1,1,0,0,1,1,0,1,1,1,0,1,1,0,1,0,0,0,0,0,0,1,1,1,0,1,1,0,0,1,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0],
          riddle: {
            prompt: 'Với <code>x = 14</code> giờ học, đường thẳng trả về <b>1.75</b>. Đây có thể là một xác suất không?',
            options: ['KHÔNG — xác suất phải trong [0,1]; cần một hàm BỊ CHẶN', 'Có — 1.75 nghĩa là "rất chắc chắn đậu"', 'Có — chỉ cần làm tròn 1.75 về 1.0 là xong'],
            answer: 'KHÔNG — xác suất phải trong [0,1]; cần một hàm BỊ CHẶN',
            wrong: {
              'Có — 1.75 nghĩa là "rất chắc chắn đậu"': 'Không có mức "chắc chắn hơn 100%". Xác suất lớn nhất là 1 (100%). Con số 1.75 chỉ chứng tỏ dạng hàm SAI — đường thẳng không biết dừng ở đâu.',
              'Có — chỉ cần làm tròn 1.75 về 1.0 là xong': 'Đó chính là <b>clip</b> — giấu triệu chứng. Model bên dưới vẫn là đường thẳng vô hạn, vẫn tối ưu sai mục tiêu; lần sau gặp x lớn hơn nó lại vọt ra. Phải đổi DẠNG HÀM, không phải cắt cụt kết quả.'
            },
            done: '✅ Đúng — 1.75 không phải xác suất, và đó là lỗi <b>dạng hàm</b> chứ không phải lỗi code. Đường thẳng chạy vô tận nên chắc chắn có lúc thò khỏi [0,1] (ở đây: 3 điểm dưới 0, 3 điểm trên 1). Threshold chỉ vá được NHÃN, clip chỉ che được con số. Lời giải thật: một hàm <b>tự nhốt</b> mọi score vào (0,1) — <b>sigmoid</b>, Bài 12. Xuống Bước 2 👇'
          }
        },
        visual: {
          schema: {
            table_name: 'binary_regression_demo (60 train + 12 probe)',
            columns: [
              { name: 'study_hours', type: 'FLOAT · giờ/tuần', key: 'x', icon: '📏',
                note: '<strong>Feature (x)</strong> — train nằm trong 0.5–9.5, nhưng bộ <strong>probe</strong> cố tình trải rộng −2 → 14 để lộ chỗ đường thẳng thò khỏi [0,1].' },
              { name: 'pass_fail', type: 'INT 0/1', key: 'TARGET', icon: '🎯',
                note: '<strong>Nhãn nhị phân</strong> — 32 Rớt (0) · 28 Đậu (1). Gán 0/1 rồi fit hồi quy tuyến tính là công thức hóa SAI: ta cần xác suất, không phải số liên tục.' }
            ]
          },
          data_preview: [
            ['-2.0', '−0.46'], ['-0.5', '−0.26'], ['0.5', '−0.12'], ['1.5', '0.02'],
            ['3.0', '0.23'], ['4.5', '0.44'], ['5.5', '0.58'], ['7.0', '0.78'],
            ['8.5', '0.99'], ['10.5', '1.27'], ['12.0', '1.48'], ['14.0', '1.75']
          ]
        },
        mission: 'Dựng <code class="code">BÀI KHÁM NGHIỆM</code>: FIT <code class="code">LinearRegression</code> lên nhãn 0/1 → lấy <code class="code">output THÔ</code> trên probe rộng (đếm điểm ngoài [0,1]) → <code class="code">THRESHOLD</code> 0.5 ra nhãn — kho có <code class="code">mồi bẫy 🪤</code> (clip giấu bệnh · nhảy LogisticRegression né bài) ↓'
      },

      /* ----- STEP 2: 3 MCQ (range · threshold · outlier) + mini-game vá tạm vs chữa gốc ----- */
      step_2: {
        mcq: [
          {
            question: 'Model trả về <code>−0.46</code> cho một học viên. Vấn đề thật sự là gì?',
            options: [
              { id: 'a', text: 'Xác suất không thể ÂM — đường thẳng không bị chặn nên sai DẠNG HÀM', correct: true, explanation: 'Đúng — xác suất bị nhốt trong [0,1], còn w·x+b chạy vô tận. Đây là lỗi công thức hóa (dùng sai loại hàm), không phải lỗi cú pháp hay dữ liệu.' },
              { id: 'b', text: 'Code bị lỗi, cần sửa bug', correct: false, explanation: 'Code chạy hoàn toàn bình thường — đó mới là cái bẫy. "Chạy được" không đồng nghĩa "công thức hóa đúng".' },
              { id: 'c', text: 'Dữ liệu bẩn, cần làm sạch lại', correct: false, explanation: 'Dữ liệu ổn (nhãn 0/1 hợp lệ). Kể cả dữ liệu sạch tuyệt đối, một đường thẳng vẫn sẽ thò ra ngoài [0,1] ở hai đầu.' },
              { id: 'd', text: 'Chỉ cần thêm dữ liệu là hết', correct: false, explanation: 'Thêm bao nhiêu dữ liệu thì đường thẳng vẫn là đường thẳng — vẫn vô hạn ở hai đầu. Phải đổi sang hàm bị chặn.' }
            ]
          },
          {
            question: 'Có người đề xuất: "đổi ngưỡng từ 0.5 sang 0.7 là xong". Đổi ngưỡng thay đổi được điều gì?',
            options: [
              { id: 'a', text: 'Chỉ đổi QUYẾT ĐỊNH lớp; output thô vẫn ngoài [0,1] và mục tiêu tối ưu vẫn sai', correct: true, explanation: 'Chuẩn — ngưỡng chỉ là chỗ ta cắt để gán nhãn. Nó không kéo output về [0,1], cũng không đổi việc model đang tối ưu bình phương sai số (mục tiêu của hồi quy, không hợp phân loại).' },
              { id: 'b', text: 'Kéo được toàn bộ output về trong [0,1]', correct: false, explanation: 'Ngưỡng không đụng gì tới giá trị output — 1.75 vẫn là 1.75, chỉ là ta so nó với 0.7 thay vì 0.5.' },
              { id: 'c', text: 'Biến model thành model xác suất hợp lệ', correct: false, explanation: 'Vẫn không có xác suất nào ở đây — chỉ có một con số không bị chặn và một lát cắt. Muốn xác suất phải có hàm bị chặn.' },
              { id: 'd', text: 'Không đổi gì cả', correct: false, explanation: 'Có đổi chứ — đổi ngưỡng làm một số mẫu đổi nhãn (quyết định dịch). Chỉ là nó không chữa được cái gốc.' }
            ]
          },
          {
            question: 'Thêm <strong>một</strong> học viên cực đoan (học 30 giờ, Đậu) rồi fit lại. Chuyện gì xảy ra với đường và ranh giới?',
            options: [
              { id: 'a', text: 'Đường THOẢI ra (dốc 0.139 → 0.075), ranh giới dịch 4.95 → 5.45, lỗi phân lớp tăng 5 → 7', correct: true, explanation: 'Đúng — hồi quy bình phương rất nhạy với điểm cực đoan: chỉ 1 điểm đã kéo cả đường thoải xuống, đẩy ranh giới sang phải và làm SAI thêm 2 mẫu. Một model phân loại tốt không nên mong manh như vậy.' },
              { id: 'b', text: 'Không đổi gì — 1 điểm trên 60 quá nhỏ', correct: false, explanation: 'Vì x=30 nằm rất xa cụm dữ liệu (0.5–9.5) nên nó có đòn bẩy lớn: đủ để kéo dốc từ 0.139 xuống 0.075.' },
              { id: 'c', text: 'Đường DỐC hơn và ranh giới dịch sang trái', correct: false, explanation: 'Ngược lại — điểm ở x rất lớn với y=1 kéo đuôi phải lên, làm đường THOẢI ra, ranh giới dịch sang PHẢI (4.95 → 5.45).' },
              { id: 'd', text: 'Output tự động được kéo về trong [0,1]', correct: false, explanation: 'Không — đường vẫn là đường thẳng vô hạn. Thêm outlier chỉ đổi độ dốc/vị trí, không tạo ra trần hay sàn.' }
            ]
          }
        ],
        mini_game: {
          title: 'Cách nào CHỮA GỐC, cách nào chỉ VÁ TẠM?',
          instruction: 'Kéo mỗi đề xuất vào đúng ngăn: <strong>🩹 VÁ TẠM</strong> (giấu triệu chứng, model vẫn sai) · <strong>✅ CHỮA GỐC</strong> (đổi đúng chỗ hỏng).',
          chips: [
            { id: 'p-clip',  label: 'np.clip output về [0,1]' },
            { id: 'p-round', label: 'làm tròn 1.75 thành 1.0' },
            { id: 'p-thr',   label: 'đổi ngưỡng 0.5 → 0.7' },
            { id: 'c-sig',   label: 'thay đường thẳng bằng hàm BỊ CHẶN (sigmoid)' },
            { id: 'c-obj',   label: 'đổi mục tiêu tối ưu cho hợp bài phân loại' },
            { id: 'c-prob',  label: 'mô hình hóa XÁC SUẤT thay vì số liên tục' }
          ],
          bins: [
            { id: 'patch', label: '🩹 VÁ TẠM',  correct: 'true' },
            { id: 'cure',  label: '✅ CHỮA GỐC', correct: 'true' }
          ],
          solution: {
            'p-clip': 'patch', 'p-round': 'patch', 'p-thr': 'patch',
            'c-sig': 'cure', 'c-obj': 'cure', 'c-prob': 'cure'
          },
          success: 'Chuẩn — clip / làm tròn / đổi ngưỡng đều chỉ động vào KẾT QUẢ, model bên dưới vẫn là đường thẳng tối ưu sai mục tiêu. Chữa gốc là đổi DẠNG HÀM (bị chặn) và đổi MỤC TIÊU cho hợp phân loại. Đó là recipe Bước 3 sắp dựng — và là nội dung Bài 12.'
        }
      },

      /* ----- STEP 3: map 3 TRẠM — fit → output thô → threshold. 2 mồi bẫy: clip / LogisticRegression ----- */
      step_3: {
        ml_pipeline: true,
        blocks: [
          { type: 'py', token: 'model = LinearRegression().fit(X_train, y_train)', slot: 'b1' },
          { type: 'py', token: 'linear_outputs = model.predict(X_probe)', slot: 'b2' },
          { type: 'py', token: 'classes = (linear_outputs >= 0.5).astype(int)', slot: 'b3' },
          /* 2 mồi bẫy — khớp đúng 2 Risk của grader */
          { type: 'py', token: 'linear_outputs = np.clip(model.predict(X_probe), 0, 1)', slot: 't1' },
          { type: 'py', token: 'model = LogisticRegression().fit(X_train, y_train)', slot: 't2' }
        ],
        drop_zones: [
          { id: 'l11-fit', accepts: ['py'], multi: false },
          { id: 'l11-raw', accepts: ['py'], multi: false },
          { id: 'l11-thr', accepts: ['py'], multi: false }
        ],
        ml_flow: {
          brand: 'BÀI KHÁM NGHIỆM — 3 TRẠM · ĐƯỜNG THẲNG LÀM XÁC SUẤT?',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: 'binary_regression_demo · 60 dòng train (32 Rớt · 28 Đậu) + 12 probe trải rộng −2 → 14' },
          done_note: 'Kết luận khám nghiệm: đường thẳng fit được nhãn 0/1 và chạy không lỗi, NHƯNG 3 output < 0 và 3 output > 1 — không thể là xác suất. Threshold cho nhãn hợp lệ mà không sửa được range; clip chỉ giấu. Cần hàm BỊ CHẶN → Bài 12 (sigmoid). Bước 4 tự chạy audit bằng scikit-learn thật.',
          stations: [
            {
              zones: ['l11-fit'],
              icon: '📐', label: 'TRẠM 1 — FIT ĐƯỜNG THẲNG', sub: 'LinearRegression trên nhãn 0/1', result_kind: 'linaudit',
              lin: {
                mode: 'fit', w: 0.1386, b: -0.1861,
                note: '<code>LinearRegression().fit(X_train, y_train)</code> — 60 nhãn 0/1, chạy trơn tru, không một lỗi nào. Đường thu được: <b>ŷ = 0.139·x − 0.186</b>. Dải xanh là vùng xác suất hợp lệ [0,1] — hãy để ý đường không hề dừng ở mép dải.'
              },
              narration: 'Máy KHÔNG báo lỗi khi ta fit đường thẳng lên nhãn 0/1 — đó là cái bẫy: chạy được không có nghĩa công thức hóa đúng. Trạm sau sẽ soi output ở vùng rộng hơn.'
            },
            {
              zones: ['l11-raw'],
              icon: '🔬', label: 'TRẠM 2 — OUTPUT THÔ', sub: 'probe rộng: đếm ngoài [0,1]', result_kind: 'linaudit',
              lin: {
                mode: 'probe', w: 0.1386, b: -0.1861, probe: [-2, -0.5, 0.5, 1.5, 3, 4.5, 5.5, 7, 8.5, 10.5, 12, 14],
                note: '<code>linear_outputs = model.predict(X_probe)</code> trên 12 điểm trải rộng −2 → 14 (cố tình vượt dải train). Kết quả: <b>3 điểm < 0</b> (x=−2 → <b>−0.46</b>) và <b>3 điểm > 1</b> (x=14 → <b>1.75</b>). Xác suất âm 46% và 175% — vô nghĩa.'
              },
              narration: 'Giữ output THÔ, không clip: đây chính là bằng chứng. Đường thẳng vô hạn nên luôn có vùng x làm nó thò khỏi [0,1] — không phải lỗi ngẫu nhiên mà là hệ quả tất yếu của dạng hàm.'
            },
            {
              zones: ['l11-thr'],
              icon: '✂️', label: 'TRẠM 3 — THRESHOLD 0.5', sub: 'ra nhãn, range vẫn hỏng', result_kind: 'linaudit',
              lin: {
                mode: 'threshold', w: 0.1386, b: -0.1861, threshold: 0.5, probe: [-2, -0.5, 0.5, 1.5, 3, 4.5, 5.5, 7, 8.5, 10.5, 12, 14],
                note: '<code>classes = (linear_outputs >= 0.5).astype(int)</code> — cắt tại 0.5 (ranh giới x ≈ <b>4.95</b>) cho ra nhãn 0/1 hợp lệ. Nhưng output thô <b>vẫn</b> ngoài [0,1] và model <b>vẫn</b> tối ưu sai mục tiêu. Threshold vá NHÃN, không vá XÁC SUẤT.'
              },
              narration: 'Ta có nhãn dùng được, nhưng không có xác suất tin được. Muốn xác suất thật thì phải đổi dạng hàm — hàm tự nhốt output trong (0,1). Đó là sigmoid, Bài 12.'
            }
          ]
        },
        expected_sql: 'model = LinearRegression().fit(X_train, y_train) linear_outputs = model.predict(X_probe) classes = (linear_outputs >= 0.5).astype(int)',
        expected_zones: {
          'l11-fit': 'model = LinearRegression().fit(X_train, y_train)',
          'l11-raw': 'linear_outputs = model.predict(X_probe)',
          'l11-thr': 'classes = (linear_outputs >= 0.5).astype(int)'
        },
        reveal_hints: {
          'l11-fit': 'Trạm 1: fit đúng model "sai" để khám nghiệm — <strong>model = LinearRegression().fit(X_train, y_train)</strong>.',
          'l11-raw': 'Trạm 2: giữ output THÔ (không clip) — <strong>linear_outputs = model.predict(X_probe)</strong>.',
          'l11-thr': 'Trạm 3: cắt ngưỡng ra nhãn — <strong>classes = (linear_outputs >= 0.5).astype(int)</strong>.'
        }
      },

      drag_map: {
        brand: 'BÀI KHÁM NGHIỆM — 3 TRẠM · ĐƯỜNG THẲNG LÀM XÁC SUẤT?',
        table_sub: 'binary_regression_demo · 60 train (0/1) + 12 probe',
        idle_sub: '60 nhãn 0/1 · ▶ chạy để fit, soi output thô và cắt ngưỡng',
        run_label: '▶ Chạy 3 trạm',
        table: {
          name: 'binary_regression_demo',
          columns: ['study_hours', 'pass_fail'],
          dataRows: [
            ['8.0', '1'], ['8.2', '1'], ['3.5', '1'], ['1.2', '0'], ['6.6', '1'],
            ['5.2', '1'], ['3.3', '0'], ['6.4', '1'], ['1.1', '0'], ['7.4', '1'],
            ['5.9', '1'], ['0.5', '0'], ['0.7', '0'], ['6.3', '1'], ['8.5', '1'],
            ['2.2', '0'], ['2.0', '0'], ['9.2', '1'], ['5.1', '1'], ['4.2', '0'],
            ['6.1', '1'], ['1.2', '0'], ['9.4', '1'], ['3.1', '0'], ['1.7', '0'],
            ['0.6', '0'], ['3.7', '0'], ['2.3', '0'], ['9.1', '1'], ['4.4', '1']
          ]
        }
      },

      /* ----- STEP 4: audit LinearRegression bằng scikit-learn thật. Grader: grade_lesson11
         (linear_outputs THÔ khớp ref + classes 0/1; Risk bắt clip / LogisticRegression; Behavior probe ẩn). ----- */
      step_4: {
        prompt: 'Bước 3 bạn lắp bài khám nghiệm. Giờ chạy <strong>scikit-learn thật</strong>: nạp dữ liệu, fit <code>LinearRegression</code> lên nhãn 0/1, dự đoán trên <code>X_probe</code> giữ <strong>output THÔ</strong> (<code>linear_outputs</code>), cắt ngưỡng 0.5 ra <code>classes</code>, rồi <strong>đếm</strong> bao nhiêu output dưới 0 và trên 1. Hệ thống chấm dùng <strong>bộ probe ẩn</strong> — số đếm phải tính từ model thật, không gõ tay.',
          context: {
          scenario: 'Đây là bài AUDIT: mục tiêu là nhìn tận mắt cái sai, nên phải fit đúng cái model "sai" đó. Hai đường tắt đều bị chặn: <code>np.clip</code> ép output về [0,1] là <strong>giấu triệu chứng</strong> (tầng Risk bắt), và nhảy thẳng sang <code>LogisticRegression</code> là <strong>né mất bài khám nghiệm</strong>. Giữ nguyên giá trị thô mới là audit trung thực.',
          real_world: 'Bài học nghề: một pipeline có thể chạy sạch, không warning, vẫn cho ra kết quả vô nghĩa vì <strong>công thức hóa sai</strong>. Người làm ML giỏi luôn kiểm miền giá trị đầu ra (output có nằm trong khoảng hợp lệ không?) trước khi tin vào con số — nhất là khi con số đó sắp được gọi là "xác suất".',
          steps: [
            'Nạp <code>X_train, y_train, X_probe</code> từ bộ demo nhị phân.',
            'Fit <code>LinearRegression</code> lên nhãn 0/1 (đúng model cần khám nghiệm).',
            'Dự đoán trên <code>X_probe</code> và <strong>giữ nguyên</strong> giá trị thô vào <code>linear_outputs</code> — không clip.',
            'Cắt ngưỡng 0.5 ra <code>classes</code>; in số output dưới 0 và trên 1 · Run · Submit chấm 4 tầng.'
          ],
          hint_explore: 'Muốn soi trước? Sau khi predict, gõ <code>print(linear_outputs.round(2))</code> để thấy cả 12 giá trị — chú ý hai đầu.',
          expected: 'Console in <code>Below 0: 3</code> và <code>Above 1: 3</code>. Đủ 4 tầng xanh. Thử <code>np.clip</code> cho "đẹp"? Code vẫn chạy — nhưng tầng Risk sẽ giải thích vì sao đó là giấu bệnh.'
        },
        hints: [
          { level: 1, text: 'Bốn việc: nạp dữ liệu → fit LinearRegression → predict giữ thô → cắt ngưỡng + đếm. Không clip, không đổi sang LogisticRegression.' },
          { level: 2, text: 'Đầu bài: <code>import numpy as np</code>, <code>from sklearn.linear_model import LinearRegression</code>, <code>from ml_lab import load_binary_regression_demo</code>, rồi <code>X_train, y_train, X_probe = load_binary_regression_demo()</code>.' },
          { level: 3, text: 'Fit + predict: <code>model = LinearRegression().fit(X_train, y_train)</code> rồi <code>linear_outputs = model.predict(X_probe)</code> (GIỮ THÔ). Nhãn: <code>classes = (linear_outputs >= 0.5).astype(int)</code>. Đếm: <code>np.sum(linear_outputs < 0)</code> và <code>np.sum(linear_outputs > 1)</code>.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>from sklearn.linear_model import LinearRegression<br>from ml_lab import load_binary_regression_demo<br>X_train, y_train, X_probe = load_binary_regression_demo()<br>model = LinearRegression().fit(X_train, y_train)<br>linear_outputs = model.predict(X_probe)<br>classes = (linear_outputs >= 0.5).astype(int)<br>print("Below 0:", np.sum(linear_outputs &lt; 0))<br>print("Above 1:", np.sum(linear_outputs &gt; 1))</code>' }
        ],
        grader_fn: 'grade_lesson11',
        success_message: 'Khám nghiệm hoàn tất — 3 output < 0 và 3 output > 1, giữ nguyên thô không che đậy. Bạn đã chứng minh bằng số: đường thẳng KHÔNG thể làm model xác suất, và clip/threshold chỉ vá bề mặt. Bài 12: sigmoid — hàm tự nhốt mọi score vào (0,1), biến điểm số thành xác suất thật.',
        xp_reward: 50
      }
    },
    {
      id: 'c1_l12',
      index: 12,
      title: 'Sigmoid — biến score thành xác suất',
      subtitle: 'Một hàm tự nhốt mọi score vào (0,1) — tâm ở z = 0, không bao giờ chạm 0 hay 1',
      module: 13,
      module_title: 'M4 — Phân loại Logistic',
      estimated_minutes: 19,
      xp_reward: 50,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      story: {
        tag: '🎯 StudyLab · Ticket #12 · LỜI GIẢI CHO #11',
        hook: 'Ticket #11 khép lại bằng một kết luận khó chịu: đường thẳng <strong>không thể</strong> làm model xác suất — nó trả về <strong>−0.46</strong> và <strong>1.75</strong>. Phòng đào tạo vẫn cần con số "khả năng qua môn". Ticket #12 lắp <strong>bộ phận còn thiếu</strong>: giữ nguyên phần tuyến tính (nó vẫn giỏi việc xếp hạng ai cao ai thấp), nhưng gắn thêm một <strong>máy ép</strong> ở cuối đường ống. Máy này nhận bất kỳ số nào — âm triệu hay dương triệu — và luôn nhả ra một số <strong>nằm gọn trong (0, 1)</strong>. Tên nó là <strong>sigmoid</strong>. Cùng 12 điểm thử của bài trước: đường thẳng cho −0.46…1.75, sigmoid cho <strong>0.015…0.996</strong>.'
      },
      achievement: { name: 'Sigmoid — máy ép xác suất', desc: 'phân biệt score z với xác suất p, đọc được đơn điệu + bão hòa, tự cài sigmoid vectorized thay vì clip' },

      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Phân biệt <strong>score z</strong> (không bị chặn, chỉ để xếp hạng) với <strong>xác suất p</strong> (luôn trong (0,1)).',
            'Đọc được <strong>đơn điệu</strong> và <strong>bão hòa</strong>: z tăng thì p tăng; z rất lớn thì p tiến sát 1 nhưng <strong>không bao giờ chạm</strong>.',
            'Tự cài <code>sigmoid(z)</code> <strong>vectorized</strong> bằng hàm mũ — và biết vì sao <code>np.clip</code> không phải sigmoid.'
          ]
        },
        glossary: [
          { term: 'SCORE (z)', vi: 'điểm tuyến tính', accent: '#FBBF24',
            def: 'Kết quả phần tuyến tính <b>z = w·x + b</b>. Chạy từ −∞ tới +∞ — <b>không phải xác suất</b>.',
            ex: 'x = 14 giờ → z = 0.6·14 − 2.97 = 5.43. Số 5.43 chỉ nói "cao", không nói "543%".',
            out: 'z dùng để XẾP HẠNG · chưa dùng để đọc như khả năng' },
          { term: 'SIGMOID', vi: 'hàm chữ S', accent: '#38BDF8',
            def: '<b>σ(z) = 1 / (1 + e^(−z))</b> — nhận mọi số thực, trả về một số trong <b>(0, 1)</b>.',
            ex: 'σ(−4) = 0.018 · σ(0) = 0.5 · σ(4) = 0.982. Đồ thị là một đường cong chữ S.',
            out: 'chính là "máy ép" biến score thành xác suất' },
          { term: 'XÁC SUẤT (p)', vi: 'khả năng ước lượng', accent: '#34D399',
            def: 'Output của sigmoid: <b>0 &lt; p &lt; 1</b>. Là <b>ước lượng</b> khả năng, không phải lời bảo đảm.',
            ex: 'p = 0.99 nghĩa là "rất có khả năng đậu" — vẫn có ~1 trên 100 trường hợp không đậu.',
            out: 'p cao ≠ chắc chắn đúng' },
          { term: 'ĐƠN ĐIỆU', vi: 'monotonic', accent: '#A78BFA',
            def: 'z tăng thì p <b>luôn tăng</b>, không bao giờ quay đầu.',
            ex: 'thứ tự xếp hạng theo z và theo p là <b>y hệt nhau</b> — sigmoid không đảo ai lên ai xuống.',
            out: 'ép về (0,1) mà KHÔNG làm hỏng thứ tự' },
          { term: 'BÃO HÒA', vi: 'saturation', accent: '#FB923C',
            def: 'Ở hai đầu, đường cong <b>nằm ngang</b>: z đổi nhiều mà p gần như không đổi.',
            ex: 'σ(6) = 0.9975 · σ(10) = 0.999955 · σ(20) = 0.999999998 — tiến sát 1, <b>không chạm</b> 1.',
            out: 'p = 1.0 tuyệt đối là điều sigmoid không bao giờ nói' },
          { term: 'VECTORIZED', vi: 'chạy cả mảng', accent: '#7DD3FC',
            def: 'Viết công thức một lần cho <b>cả mảng</b> — <code>np.exp</code> tự áp lên từng phần tử.',
            ex: 'một dòng <code>1 / (1 + np.exp(-z))</code> xử lý cả scalar lẫn mảng 41 phần tử.',
            out: 'không cần vòng lặp · đúng cho mọi hình dạng đầu vào' }
        ],
        primer: {
          goal: [
            'z = w·x + b là SCORE, chưa phải xác suất',
            'sigmoid ép mọi z vào (0,1), tâm z=0 → p=0.5',
            'Đơn điệu + bão hòa · clip KHÔNG phải sigmoid'
          ],
          intro: '',
          example: '🔍 <strong>Trong ống kính bên dưới:</strong> đường ống có hai đoạn — phần tuyến tính cho ra <strong>score z</strong>, rồi <strong>máy ép sigmoid</strong> biến z thành <strong>xác suất p</strong>. Kéo thanh <strong>x</strong> và đọc cả chuỗi <code>x → z → p</code>. Bấm nút để chồng <strong>đường thẳng Bài 11</strong> lên cùng khung: nó thò khỏi dải, còn đường cong thì không — dù bạn kéo x đi tới đâu. Giữ ý này sang Bước 2 👇'
        },
        intro: 'Bài trước ta kết luận: cần một <strong>hàm bị chặn</strong>. Sigmoid chính là hàm đó — nhưng nó không thay thế phần tuyến tính, mà <strong>nối tiếp</strong> sau phần tuyến tính. Phần tuyến tính vẫn làm việc cũ (tổng hợp các feature thành một điểm số), sigmoid làm việc mới (đổi thang đo điểm số đó sang thang xác suất). Đây là lý do người ta gọi model kết quả là <em>logistic regression</em>: vẫn là hồi quy tuyến tính bên trong, chỉ khác cái đuôi.',
        concept_cards: [
          {
            icon: 'fa-ruler-horizontal',
            title: 'z là SCORE, không phải xác suất',
            body: '<code>z = w·x + b</code> vẫn chạy vô tận như bài trước — và điều đó <strong>không sao cả</strong>, miễn ta đừng đọc z như xác suất. Với 12 điểm thử: z chạy từ <strong>−4.17</strong> tới <strong>5.43</strong>. Việc của z là <strong>xếp hạng</strong>: ai z cao hơn thì khả năng đậu cao hơn. Việc đổi z sang thang 0–1 là của bộ phận khác.'
          },
          {
            icon: 'fa-wave-square',
            title: 'Sigmoid: tâm ở z = 0, luôn trong (0,1)',
            body: '<code>σ(z) = 1 / (1 + e^(−z))</code>. Ba mốc phải nhớ: <strong>σ(0) = 0.5</strong> (tâm chữ S), z <strong>âm</strong> → p dưới 0.5, z <strong>dương</strong> → p trên 0.5. Trên 12 điểm thử, p chạy <strong>0.015 → 0.996</strong> — không một điểm nào ra ngoài. Và sigmoid <strong>đơn điệu</strong>: nó ép thang đo lại nhưng giữ nguyên thứ tự xếp hạng của z.'
          },
          {
            icon: 'fa-arrow-right-to-bracket',
            title: 'Bão hòa · và vì sao clip KHÔNG phải sigmoid',
            body: 'Hai đầu đường cong nằm ngang dần: σ(6) = 0.9975, σ(20) = 0.999999998 — <strong>tiến sát 1 mà không chạm 1</strong>. Còn <code>np.clip(z, 0, 1)</code> cũng cho số trong [0,1] nhưng là một đường <strong>gãy khúc</strong>: mọi z ≤ 0 bị dồn thành đúng 0, mọi z ≥ 1 thành đúng 1, và ở giữa nó bê nguyên z. Thử z = −3 và z = −0.5: clip cho <strong>0 và 0</strong> (mất hết phân biệt), sigmoid cho <strong>0.047 và 0.378</strong>.'
          }
        ],
        /* Hero = ỐNG KÍNH MÁY ÉP XÁC SUẤT (user chốt 2026-07-22) */
        sigmoid_lens: {
          title: 'ỐNG KÍNH MÁY ÉP XÁC SUẤT — x → z → p',
          intro: 'Dải xanh = vùng xác suất hợp lệ <b>(0, 1)</b>. Đường cong xanh là <b>sigmoid</b>; 12 chấm là bộ điểm thử của Bài 11. Kéo thanh <b>x</b> để đọc cả chuỗi <b>x → z → p</b>, và bấm <b>so với Bài 11</b> để chồng đường thẳng cũ lên. Trả lời câu chốt để mở Bước 2.',
          x_label: 'study_hours (giờ học)', y_label: 'output',
          x_min: -3, x_max: 15, y_min: -0.75, y_max: 1.95,
          w: 0.6, b: -2.97, boundary: 4.95,
          lin_w: 0.1386, lin_b: -0.1861,
          probe: [-2, -0.5, 0.5, 1.5, 3, 4.5, 5.5, 7, 8.5, 10.5, 12, 14],
          x0: 14,
          compare_label: 'so với đường thẳng Bài 11',
          reveal_label: 'Bảng ép chuẩn (bộ score của bài):',
          reveal: [
            { z: -4, p: 0.018 }, { z: -1.6, p: 0.168 }, { z: 0, p: 0.5 },
            { z: 1.6, p: 0.832 }, { z: 4, p: 0.982 }
          ],
          riddle: {
            prompt: 'Máy ép nhận <code>z = 0</code> — đúng chính giữa, không nghiêng về bên nào. Nó nhả ra <b>p</b> bằng bao nhiêu?',
            options: ['p = 0.5 — đó là tâm của đường cong chữ S', 'p = 0 — vì z bằng 0', 'p = 1 — vì không có gì kéo xuống', 'Tùy dữ liệu — phải fit mới biết'],
            answer: 'p = 0.5 — đó là tâm của đường cong chữ S',
            wrong: {
              'p = 0 — vì z bằng 0': 'Nhầm z với p. Máy ép <b>không</b> giữ nguyên con số — nó đổi thang đo. Thay z = 0 vào <b>1/(1 + e^(−0))</b>: e⁰ = 1, nên p = 1/(1+1) = <b>0.5</b>. Giá trị p = 0 chỉ đạt được khi z = −∞.',
              'p = 1 — vì không có gì kéo xuống': 'z = 0 là điểm <b>cân bằng</b>, không nghiêng về Đậu cũng không nghiêng về Rớt — nên xác suất phải là 50/50, tức <b>0.5</b>. Muốn p tiến sát 1 thì z phải rất DƯƠNG (σ(6) = 0.9975).',
              'Tùy dữ liệu — phải fit mới biết': 'Dữ liệu quyết định <b>w và b</b> (tức z bằng bao nhiêu), nhưng sigmoid là một hàm toán <b>cố định</b>: hễ z = 0 thì p = 0.5, ở mọi bài toán, mọi bộ dữ liệu.'
            },
            done: '✅ Đúng — <b>σ(0) = 0.5</b> là tâm của chữ S: z âm nằm dưới 0.5, z dương nằm trên 0.5. Ba tính chất khép lại bài: (1) <b>bị chặn</b> — mọi output nằm trong (0,1); (2) <b>đơn điệu</b> — z tăng thì p tăng, thứ tự xếp hạng giữ nguyên; (3) <b>bão hòa</b> — hai đầu nằm ngang, p tiến sát 0 và 1 nhưng không bao giờ chạm. Đó là lý do sigmoid làm được cái mà clip và threshold không làm được. Xuống Bước 2 👇'
          }
        },
        visual: {
          schema: {
            table_name: 'sigmoid_demo (12 điểm thử · cùng bộ với Bài 11)',
            columns: [
              { name: 'study_hours', type: 'FLOAT · giờ/tuần', key: 'x', icon: '📏',
                note: '<strong>Feature (x)</strong> — vẫn bộ probe trải rộng −2 → 14 của Bài 11, để so hai model trên <strong>đúng cùng một dữ liệu</strong>.' },
              { name: 'z_score', type: 'FLOAT · không chặn', key: 'z', icon: '📈',
                note: '<strong>Score tuyến tính</strong> z = 0.6·x − 2.97, chạy <strong>−4.17 → 5.43</strong>. Ra ngoài [0,1] là bình thường — z không phải xác suất.' },
              { name: 'probability', type: 'FLOAT ∈ (0,1)', key: 'TARGET', icon: '🎯',
                note: '<strong>Xác suất</strong> p = σ(z), chạy <strong>0.015 → 0.996</strong>. Không một điểm nào ra ngoài dải — đó là điều đường thẳng Bài 11 không làm được.' }
            ]
          },
          data_preview: [
            ['-2.0', '−4.17', '0.015'], ['-0.5', '−3.27', '0.037'], ['0.5', '−2.67', '0.065'],
            ['1.5', '−2.07', '0.112'], ['3.0', '−1.17', '0.237'], ['4.5', '−0.27', '0.433'],
            ['5.5', '0.33', '0.582'], ['7.0', '1.23', '0.774'], ['8.5', '2.13', '0.894'],
            ['10.5', '3.33', '0.965'], ['12.0', '4.23', '0.986'], ['14.0', '5.43', '0.996']
          ]
        },
        mission: 'Dựng <code class="code">ĐƯỜNG ỐNG XÁC SUẤT</code>: tính <code class="code">score z</code> tuyến tính → <code class="code">ép qua SIGMOID</code> → đọc <code class="code">bảng xác suất</code> — kho có <code class="code">mồi bẫy 🪤</code> (clip gãy khúc · trả z thô) ↓'
      },

      /* ----- STEP 2: 3 MCQ (z vs p · bão hòa/đơn điệu · p cao ≠ chắc chắn) + mini-game xếp z theo phía ----- */
      step_2: {
        mcq: [
          {
            question: 'Một học viên có <code>z = 5.43</code>. Đọc con số này thế nào cho đúng?',
            options: [
              { id: 'a', text: 'z là SCORE — chỉ nói bạn này xếp cao; muốn ra xác suất phải ép qua sigmoid (p = 0.996)', correct: true, explanation: 'Chuẩn — z sống trên thang không giới hạn, chỉ có ý nghĩa so sánh (ai cao hơn ai). Sang thang xác suất phải qua máy ép: σ(5.43) = 0.996.' },
              { id: 'b', text: '543% khả năng đậu', correct: false, explanation: 'Đây đúng là cái bẫy của Bài 11: đọc một số không bị chặn như thể nó là phần trăm. Không tồn tại 543%.' },
              { id: 'c', text: 'z = 5.43 nghĩa là chắc chắn đậu', correct: false, explanation: 'z lớn chỉ nói "khả năng cao". Sau khi ép: p = 0.996 — rất cao, nhưng vẫn không phải 1.' },
              { id: 'd', text: 'Phải chia z cho giá trị lớn nhất để ra xác suất', correct: false, explanation: 'Chia cho max cho ra số trong [0,1] nhưng phụ thuộc vào lô dữ liệu đang xét — thêm một mẫu là mọi "xác suất" đổi hết. Sigmoid thì cố định, không phụ thuộc lô.' }
            ]
          },
          {
            question: 'Tăng z từ 6 lên 20 thì p đổi thế nào?',
            options: [
              { id: 'a', text: 'Tăng rất ít — 0.9975 → 0.999999998, tiến sát 1 mà không bao giờ chạm 1 (bão hòa)', correct: true, explanation: 'Đúng — đó là bão hòa: ở hai đầu đường cong gần như nằm ngang, z đổi rất nhiều mà p gần như đứng yên. Và vì mẫu số 1 + e^(−z) luôn lớn hơn 1 nên p luôn nhỏ hơn 1 tuyệt đối.' },
              { id: 'b', text: 'p vượt qua 1 vì z quá lớn', correct: false, explanation: 'Không bao giờ — đó chính là điểm khác biệt với đường thẳng Bài 11. e^(−z) luôn dương nên mẫu số luôn > 1, do đó p < 1 với mọi z.' },
              { id: 'c', text: 'p tăng gấp hơn 3 lần vì z tăng hơn 3 lần', correct: false, explanation: 'Quan hệ z → p không tuyến tính. Ở vùng giữa (quanh z = 0) đường cong dốc nhất; ra hai đầu nó thoải dần rồi gần như phẳng.' },
              { id: 'd', text: 'p giảm vì bão hòa', correct: false, explanation: 'Sigmoid đơn điệu tăng — p không bao giờ giảm khi z tăng. Bão hòa nghĩa là tăng rất chậm, không phải quay đầu.' }
            ]
          },
          {
            question: 'Model trả về <code>p = 0.99</code> cho một bạn. Phát biểu nào ĐÚNG?',
            options: [
              { id: 'a', text: '0.99 là ƯỚC LƯỢNG khả năng — không bảo đảm bạn đó đậu', correct: true, explanation: 'Đúng — xác suất là một ước lượng do model đưa ra dựa trên dữ liệu nó đã thấy. Trong 100 bạn được chấm 0.99, kỳ vọng vẫn có khoảng 1 bạn không đậu. Và nếu model được fit tệ thì con số 0.99 còn có thể sai lệch hơn thế.' },
              { id: 'b', text: 'Bạn đó chắc chắn đậu, không cần lo', correct: false, explanation: 'Xác suất cao không phải lời bảo đảm. Nhầm "khả năng lớn" thành "chắc chắn" là một trong những sai lầm tốn kém nhất khi dùng model.' },
              { id: 'c', text: 'Model bị lỗi vì xác suất không được vượt 0.9', correct: false, explanation: 'Không có luật nào chặn ở 0.9 cả. 0.99 hoàn toàn hợp lệ — sigmoid chỉ không cho phép chạm đúng 1.' },
              { id: 'd', text: 'p = 0.99 nghĩa là 99 bạn trong lớp sẽ đậu', correct: false, explanation: 'Nhầm đối tượng: 0.99 là ước lượng cho <em>riêng bạn này</em>, không phải đếm số bạn trong lớp.' }
            ]
          }
        ],
        mini_game: {
          title: 'Score z rơi về phía nào của 0.5?',
          instruction: 'Mỗi thẻ là một <strong>score z</strong> kèm xác suất sau khi ép. Kéo vào đúng phía: <strong>◀ p &lt; 0.5</strong> (z âm) · <strong>⏺ p = 0.5</strong> (z = 0) · <strong>p &gt; 0.5 ▶</strong> (z dương).',
          chips: [
            { id: 'zn5', label: 'z = −5 → p = 0.007' },
            { id: 'zn1', label: 'z = −1 → p = 0.269' },
            { id: 'z0',  label: 'z = 0 → p = 0.5' },
            { id: 'zp1', label: 'z = 1 → p = 0.731' },
            { id: 'zp5', label: 'z = 5 → p = 0.993' }
          ],
          bins: [
            { id: 'low',  label: '◀ p < 0.5 (z âm)',   correct: 'true' },
            { id: 'mid',  label: '⏺ p = 0.5 (z = 0)',  correct: 'true' },
            { id: 'high', label: 'p > 0.5 ▶ (z dương)', correct: 'true' }
          ],
          solution: { 'zn5': 'low', 'zn1': 'low', 'z0': 'mid', 'zp1': 'high', 'zp5': 'high' },
          success: 'Chuẩn — dấu của z quyết định phía: z âm → p dưới 0.5, z = 0 → đúng 0.5, z dương → p trên 0.5. Để ý thêm <strong>độ lớn</strong>: z = −5 và z = −1 cùng nằm dưới 0.5 nhưng cách nhau xa (0.007 vs 0.269) — vì gần tâm thì đường cong dốc, ra xa thì thoải dần. Bước 3: lắp đúng đường ống z → p.'
        }
      },

      /* ----- STEP 3: map 3 TRẠM — score z → sigmoid → bảng xác suất. 2 mồi bẫy: clip / z thô ----- */
      step_3: {
        ml_pipeline: true,
        blocks: [
          { type: 'py', token: 'z = weight * x_probe + bias', slot: 'b1' },
          { type: 'py', token: 'p = 1 / (1 + np.exp(-z))', slot: 'b2' },
          { type: 'py', token: 'table = np.column_stack([x_probe, z.round(2), p.round(3)])', slot: 'b3' },
          /* 2 mồi bẫy — khớp đúng 2 Risk của grader */
          { type: 'py', token: 'p = np.clip(z, 0, 1)', slot: 't1' },
          { type: 'py', token: 'p = z', slot: 't2' }
        ],
        drop_zones: [
          { id: 'l12-score', accepts: ['py'], multi: false },
          { id: 'l12-squash', accepts: ['py'], multi: false },
          { id: 'l12-table', accepts: ['py'], multi: false }
        ],
        ml_flow: {
          brand: 'ĐƯỜNG ỐNG XÁC SUẤT — 3 TRẠM · SCORE → SIGMOID → p',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: 'sigmoid_demo · 12 điểm thử (cùng bộ Bài 11) · w = 0.6 · b = −2.97' },
          done_note: 'Đường ống hoàn chỉnh: phần tuyến tính cho SCORE z (−4.17 → 5.43, không bị chặn — và không sao cả), sigmoid ép z thành XÁC SUẤT p (0.015 → 0.996, không một điểm nào ra ngoài). Hai mồi bẫy đều cho số "trông hợp lệ" nhưng sai bản chất: clip gãy khúc làm mất phân biệt ở hai đầu, còn trả z thô là đọc score như xác suất — đúng lỗi của Bài 11. Bước 4 tự viết hàm sigmoid.',
          stations: [
            {
              zones: ['l12-score'],
              icon: '📈', label: 'TRẠM 1 — SCORE THÔ', sub: 'z = w·x + b, không bị chặn', result_kind: 'sigmoid_pipe',
              sig: {
                mode: 'score', w: 0.6, b: -2.97,
                probe: [-2, -0.5, 0.5, 1.5, 3, 4.5, 5.5, 7, 8.5, 10.5, 12, 14],
                note: '<code>z = weight * x_probe + bias</code> — phần tuyến tính giữ nguyên như mọi bài trước. Trên 12 điểm thử, z chạy từ <b>−4.17</b> tới <b>5.43</b>. Vượt khỏi [0,1] rất nhiều — nhưng ở đây điều đó <b>hoàn toàn bình thường</b>: z là SCORE để xếp hạng, chưa ai gọi nó là xác suất.'
              },
              narration: 'Đừng vội sửa z. Bài trước sai không phải vì tính ra số lớn, mà vì ĐỌC số đó như xác suất. Trạm sau mới là chỗ đổi thang đo.'
            },
            {
              zones: ['l12-squash'],
              icon: '🌊', label: 'TRẠM 2 — ÉP QUA SIGMOID', sub: 'p = 1/(1+e^(−z)) → (0,1)', result_kind: 'sigmoid_pipe',
              sig: {
                mode: 'squash', w: 0.6, b: -2.97,
                probe: [-2, -0.5, 0.5, 1.5, 3, 4.5, 5.5, 7, 8.5, 10.5, 12, 14],
                note: '<code>p = 1 / (1 + np.exp(-z))</code> — một dòng, chạy cả mảng. Cùng 12 điểm đó, p giờ nằm trong <b>0.015 → 0.996</b>: <b>0 điểm</b> ra ngoài dải. Tâm chữ S ở z = 0 (ứng với x ≈ <b>4.95</b> — đúng chỗ ranh giới của Bài 11) cho p = 0.5.'
              },
              narration: 'Đường thẳng biến thành đường cong chữ S: hai đầu bị bẻ nằm ngang nên không thể vọt ra ngoài, còn thứ tự xếp hạng thì giữ nguyên vì sigmoid đơn điệu tăng.'
            },
            {
              zones: ['l12-table'],
              icon: '🧾', label: 'TRẠM 3 — BẢNG XÁC SUẤT', sub: '12 dòng x · z · p', result_kind: 'sigmoid_pipe',
              sig: {
                mode: 'table', w: 0.6, b: -2.97,
                probe: [-2, -0.5, 0.5, 1.5, 3, 4.5, 5.5, 7, 8.5, 10.5, 12, 14],
                note: '<code>table = np.column_stack([x_probe, z.round(2), p.round(3)])</code> — xếp cạnh nhau cả ba cột để đọc một lượt. Nhìn theo chiều tăng của x: z tăng đều (tuyến tính), còn p tăng <b>nhanh ở giữa, chậm dần ở hai đầu</b> — đó chính là bão hòa.'
              },
              narration: 'Ba cột cạnh nhau là bức tranh đầy đủ của bài: cùng một dữ liệu, z nói thứ hạng, p nói khả năng. Bước 4 bạn tự viết cái máy ép này.'
            }
          ]
        },
        expected_sql: 'z = weight * x_probe + bias p = 1 / (1 + np.exp(-z)) table = np.column_stack([x_probe, z.round(2), p.round(3)])',
        expected_zones: {
          'l12-score': 'z = weight * x_probe + bias',
          'l12-squash': 'p = 1 / (1 + np.exp(-z))',
          'l12-table': 'table = np.column_stack([x_probe, z.round(2), p.round(3)])'
        },
        reveal_hints: {
          'l12-score': 'Trạm 1: phần tuyến tính cho score thô — <strong>z = weight * x_probe + bias</strong>.',
          'l12-squash': 'Trạm 2: máy ép sigmoid, dùng hàm mũ chứ không cắt cụt — <strong>p = 1 / (1 + np.exp(-z))</strong>.',
          'l12-table': 'Trạm 3: ghép 3 cột để đọc — <strong>table = np.column_stack([x_probe, z.round(2), p.round(3)])</strong>.'
        }
      },

      drag_map: {
        brand: 'ĐƯỜNG ỐNG XÁC SUẤT — 3 TRẠM · SCORE → SIGMOID → p',
        table_sub: 'sigmoid_demo · 12 điểm thử · w = 0.6 · b = −2.97',
        idle_sub: '12 điểm thử · ▶ chạy để tính score, ép sigmoid và đọc bảng',
        run_label: '▶ Chạy 3 trạm',
        table: {
          name: 'sigmoid_demo',
          columns: ['study_hours', 'pass_fail'],
          dataRows: [
            ['-2.0', '0'], ['-0.5', '0'], ['0.5', '0'], ['1.5', '0'],
            ['3.0', '0'], ['4.5', '0'], ['5.5', '1'], ['7.0', '1'],
            ['8.5', '1'], ['10.5', '1'], ['12.0', '1'], ['14.0', '1']
          ]
        }
      },

      /* ----- STEP 4: tự viết sigmoid vectorized. Grader: grade_lesson12
         (cần def sigmoid(z) 1 tham số + dùng exp; output σ(0)=0.5 & khớp ref; Risk bắt clip / trả z thô;
         Behavior mảng ẩn 41 score trong −30..30 phải đơn điệu + trong (0,1) + khớp công thức). ----- */
      step_4: {
        prompt: 'Bước 3 bạn lắp đường ống. Giờ tự tay dựng <strong>cái máy ép</strong>: viết hàm <code>sigmoid(z)</code> nhận <strong>một</strong> tham số, chạy được cho cả <strong>số lẻ</strong> lẫn <strong>mảng NumPy</strong>, rồi ép bộ score của bài và in kết quả. Hệ thống chấm dùng <strong>bộ score ẩn</strong> trải từ −30 tới 30 — hàm phải đúng trên toàn dải đó, không chỉ trên vài số đẹp.',
        context: {
          scenario: 'Yêu cầu nghiệm thu của máy ép: (1) nhận mọi số thực, âm hay dương lớn cỡ nào cũng nuốt được; (2) output <strong>luôn nằm trong (0, 1)</strong>, không bao giờ chạm hai mép; (3) <strong>đơn điệu tăng</strong> — score cao hơn thì xác suất cao hơn, không đảo thứ tự; (4) điểm cân bằng <code>z = 0</code> phải cho đúng <strong>0.5</strong>. Hai đường tắt bị chặn: cắt cụt output về [0,1] cho ra một đường <strong>gãy khúc</strong> (mất phân biệt ở hai đầu), và trả thẳng score chưa đổi thang đo thì <strong>chưa ép gì cả</strong>.',
          real_world: 'Sigmoid là cái đuôi tiêu chuẩn của mọi model phân loại nhị phân — từ logistic regression tới lớp output của mạng nơ-ron. Viết được nó bằng NumPy vectorized (một dòng chạy cho cả mảng, không vòng lặp) là kỹ năng nền: cùng một dòng code chạy cho 5 mẫu hay 5 triệu mẫu.',
          steps: [
            'Nạp bộ score của bài bằng <code>load_sigmoid_scores()</code> từ <code>ml_lab</code>.',
            'Định nghĩa <code>def sigmoid(z):</code> — đúng <strong>một</strong> tham số, dùng hàm mũ của NumPy để đổi thang đo.',
            'Gọi hàm trên cả mảng score (không viết vòng lặp) và lưu vào <code>probabilities</code>.',
            'In <code>sigmoid(0)</code> và mảng xác suất đã làm tròn · Run · Submit chấm 4 tầng.'
          ],
          hint_explore: 'Muốn soi trước? Gõ <code>print(sigmoid(0))</code> — con số hiện ra phải là mốc bạn đã chốt ở Bước 1.',
          expected: 'Console in <code>sigmoid(0) = 0.5</code> và mảng <code>[0.018 0.168 0.5 0.832 0.982]</code> cho bộ score của bài. Đủ 4 tầng xanh. Thử cắt cụt bằng <code>np.clip</code> cho nhanh? Code vẫn chạy trong console, nhưng bài chấm chặn ngay từ tầng đầu: sigmoid phải dựng bằng <strong>hàm mũ</strong>, không phải cắt cụt.'
        },
        hints: [
          { level: 1, text: 'Bốn việc: nạp score → định nghĩa hàm 1 tham số → gọi trên cả mảng → in. Không vòng lặp, không clip.' },
          { level: 2, text: 'Đầu bài: <code>import numpy as np</code> và <code>from ml_lab import load_sigmoid_scores</code>, rồi <code>scores = load_sigmoid_scores()</code>. Công thức toán: <code>σ(z) = 1 / (1 + e^(−z))</code> — trong NumPy, e^(−z) viết là <code>np.exp(-z)</code>.' },
          { level: 3, text: 'Khung hàm:<br><code>def sigmoid(z):<br>&nbsp;&nbsp;&nbsp;&nbsp;return 1 / (1 + np.exp(-z))</code><br>Vì <code>np.exp</code> tự áp lên từng phần tử nên đúng một dòng này chạy được cho cả số lẻ lẫn mảng. Rồi <code>probabilities = sigmoid(scores)</code>.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>from ml_lab import load_sigmoid_scores<br>scores = load_sigmoid_scores()<br><br>def sigmoid(z):<br>&nbsp;&nbsp;&nbsp;&nbsp;return 1 / (1 + np.exp(-z))<br><br>probabilities = sigmoid(scores)<br>print("sigmoid(0) =", sigmoid(0))<br>print(probabilities.round(3))</code>' }
        ],
        grader_fn: 'grade_lesson12',
        success_message: 'Máy ép hoạt động — σ(0) = 0.5 đúng tâm, cả bộ score ra [0.018, 0.168, 0.5, 0.832, 0.982], và trên bộ ẩn −30…30 hàm vẫn đơn điệu và không bao giờ ra khỏi (0,1). Bạn vừa đóng xong cái đuôi còn thiếu của Bài 11: linear cho score, sigmoid cho xác suất — cộng lại chính là logistic regression. Bài 13: cắt xác suất đó tại một ngưỡng để vẽ ra RANH GIỚI tách hai lớp.',
        xp_reward: 50
      }
    },
    {
      id: 'c1_l13',
      index: 13,
      title: 'Decision Boundary — luật tách 2 lớp',
      subtitle: 'Ngưỡng 0.5 trên xác suất chính là một ĐƯỜNG trong không gian feature — w xoay nó, b dịch nó',
      module: 13,
      module_title: 'M4 — Phân loại Logistic',
      estimated_minutes: 19,
      xp_reward: 50,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      story: {
        tag: '🎯 StudyLab · Ticket #13 · KHÉP CHƯƠNG M4',
        hook: 'Ba ticket trước dựng xong bộ máy: Bài 11 chỉ ra đường thẳng <strong>không làm</strong> xác suất, Bài 12 gắn <strong>sigmoid</strong> để ép score về (0,1). Giờ tới bước cuối của suy luận phân loại: một xác suất <strong>chưa phải</strong> một quyết định. Phòng đào tạo cần câu trả lời dứt khoát <strong>Đậu / Rớt</strong>, không phải "72%". Cắt tại ngưỡng 0.5 nghe đơn giản — nhưng lần này có <strong>hai feature</strong> (giờ học × điểm quiz), nên cái ngưỡng ấy không còn là một điểm trên trục, mà là cả một <strong>ĐƯỜNG</strong> vẽ ngang mặt phẳng. Ticket #13: nhìn tận mắt đường ranh giới đó, và thấy <strong>w xoay nó, b dịch nó</strong>.'
      },
      achievement: { name: 'Decision Boundary — luật tách hai lớp', desc: 'đọc ranh giới tuyến tính 2D, nối ngưỡng 0.5 với z=0, phân loại theo dấu w·x+b, và viết predict_classes tổng quát' },

      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Hiểu <strong>ngưỡng 0.5 trên xác suất</strong> chính là điều kiện <strong>z = 0</strong> — và trong 2 feature nó vẽ thành một <strong>đường thẳng</strong>.',
            'Đọc hình học: <strong>vector w là pháp tuyến</strong> — đổi w thì đường <strong>XOAY</strong>, đổi bias thì đường <strong>TỊNH TIẾN</strong> song song.',
            'Phân loại một điểm bằng <strong>dấu của z = w·x + b</strong>, và viết <code>predict_classes</code> trả về cả xác suất lẫn nhãn.'
          ]
        },
        glossary: [
          { term: 'DECISION BOUNDARY', vi: 'ranh giới quyết định', accent: '#38BDF8',
            def: 'Nơi model <b>đổi nhãn</b> — đúng chỗ xác suất = ngưỡng. Với ngưỡng 0.5, đó là tập điểm có <b>z = 0</b>.',
            ex: '2 feature → ranh giới là một <b>đường thẳng</b>; 3 feature → một mặt phẳng.',
            out: 'một phía là lớp 1, phía kia là lớp 0' },
          { term: 'THRESHOLD ↔ z = 0', vi: 'ngưỡng ↔ score 0', accent: '#FBBF24',
            def: 'Vì <b>σ(0) = 0.5</b>, cắt xác suất tại 0.5 <b>tương đương</b> cắt score tại 0.',
            ex: 'p ≥ 0.5 ⇔ z ≥ 0. Ngưỡng nằm bên XÁC SUẤT (0.5), KHÔNG phải bên score.',
            out: 'so p với 0.5 — đừng so z với 0.5' },
          { term: 'SCORE z', vi: 'điểm tuyến tính', accent: '#A78BFA',
            def: '<b>z = w·x + b</b> — dấu của z cho biết điểm nằm <b>phía nào</b> của ranh giới.',
            ex: 'z > 0 → phía lớp 1 (Đậu); z < 0 → phía lớp 0 (Rớt); z = 0 → nằm trên đường.',
            out: 'độ lớn |z| = cách xa ranh giới bao nhiêu' },
          { term: 'WEIGHT VECTOR w', vi: 'vector trọng số', accent: '#34D399',
            def: 'w vuông góc với ranh giới (là <b>pháp tuyến</b>). Đổi w = <b>xoay</b> đường và chỉnh độ dốc.',
            ex: 'w = [1.2, −1.0]: feature 1 kéo về Đậu, feature 2 kéo về Rớt.',
            out: 'hướng của w = hướng "tăng khả năng lớp 1"' },
          { term: 'BIAS b', vi: 'độ dời', accent: '#FB923C',
            def: 'Số hạng tự do. Đổi b = <b>tịnh tiến</b> cả đường song song, không đổi độ nghiêng.',
            ex: 'b càng âm → đường lùi xa gốc → cần feature cao hơn mới được lớp 1.',
            out: 'dịch ranh giới mà giữ nguyên hướng' },
          { term: 'LINEAR SEPARABILITY', vi: 'tách được bằng đường thẳng', accent: '#F472B6',
            def: 'Hai lớp <b>tách được</b> nếu có một đường thẳng (mặt phẳng) chia trọn chúng.',
            ex: 'logistic vẽ ranh giới THẲNG — dữ liệu xoắn vào nhau thì một đường là chưa đủ.',
            out: 'giới hạn của model tuyến tính · mở đường cho model cong hơn' }
        ],
        primer: {
          goal: [
            'Ngưỡng 0.5 ⇔ z = 0 → một ĐƯỜNG trong 2 feature',
            'w xoay đường · bias tịnh tiến đường',
            'Dấu của z = phía · |z| = khoảng cách'
          ],
          intro: '',
          example: '🔍 <strong>Trong ống kính bên dưới:</strong> mặt phẳng 2 chiều — trục ngang là giờ học, trục dọc là điểm quiz. 20 học viên tô màu theo lớp; đường sáng là <strong>ranh giới quyết định</strong>. Kéo <strong>w1, w2</strong> để thấy đường <strong>XOAY</strong>, kéo <strong>bias</strong> để thấy nó <strong>TỊNH TIẾN</strong> — và các điểm đổi màu theo, vì chính đường này định nghĩa nhãn. Giữ ý này sang Bước 2 👇'
        },
        intro: 'Xác suất là một con số mượt trong (0,1); quyết định là một lựa chọn dứt khoát 0 hay 1. Chiếc cầu giữa hai bên là <strong>ngưỡng</strong>. Điều tinh tế: khi có nhiều feature, đặt ngưỡng lên xác suất không chỉ cắt một con số — nó vẽ ra một <strong>ranh giới hình học</strong> trong không gian feature. Với logistic, ranh giới ấy luôn <strong>thẳng</strong>: mọi điểm cùng một phía nhận cùng một nhãn. Hiểu ranh giới đó xoay/dịch thế nào theo w và b là hiểu model đang "nghĩ" gì khi nó phân loại.',
        concept_cards: [
          {
            icon: 'fa-grip-lines',
            title: 'Ngưỡng 0.5 là một ĐƯỜNG, không phải một điểm',
            body: 'Cắt xác suất tại 0.5 nghĩa là hỏi "p ≥ 0.5?". Vì <strong>σ(0) = 0.5</strong>, câu đó <strong>tương đương</strong> "z ≥ 0?". Trong 2 feature, tập điểm có <code>z = w₁x₁ + w₂x₂ + b = 0</code> là một <strong>đường thẳng</strong>. Một phía z > 0 (Đậu), phía kia z < 0 (Rớt). Ngưỡng không cắt trục — nó vẽ đường.'
          },
          {
            icon: 'fa-arrows-rotate',
            title: 'w XOAY đường · b TỊNH TIẾN đường',
            body: 'Vector <code>w</code> vuông góc với ranh giới — nó là <strong>pháp tuyến</strong>. Đổi w1 hay w2 làm đường <strong>xoay</strong> và đổi độ dốc; đổi dấu một trọng số thì <strong>lật phía</strong>. Còn <code>bias</code> chỉ <strong>đẩy cả đường song song</strong> tới/lui, giữ nguyên hướng. Hai núm điều khiển, hai chuyển động khác hẳn nhau — đó là toàn bộ hình học của một model tuyến tính.'
          },
          {
            icon: 'fa-plus-minus',
            title: 'Dấu của z = phía · và cái bẫy so với 0.5',
            body: 'Muốn phân loại một điểm: tính <code>z = w·x + b</code>, xem <strong>dấu</strong>. z dương → Đậu, âm → Rớt, càng xa 0 càng chắc. ⚠ Bẫy kinh điển: so <strong>score</strong> với 0.5. Ngưỡng 0.5 sống bên <strong>xác suất</strong>; đổi sang score nó là <strong>0</strong>, không phải 0.5. Một điểm z = 0.2 cho p = 0.55 — phải là lớp 1; ai so z ≥ 0.5 sẽ gán nhầm lớp 0.'
          }
        ],
        /* Hero = BÀN XOAY RANH GIỚI 2D (user chốt 2026-07-22) */
        boundary_lens: {
          title: 'BÀN XOAY RANH GIỚI 2D — w XOAY · b TỊNH TIẾN',
          intro: 'Mặt phẳng 2 feature: trục ngang <b>study_hours</b>, dọc <b>quiz_score</b>. 20 điểm tô theo lớp (đường ranh giới <b>tự</b> định nghĩa nhãn). Kéo <b>w1/w2</b> thấy đường XOAY, kéo <b>bias</b> thấy nó TỊNH TIẾN; điểm mới ◆ đọc z & p realtime. Trả lời câu chốt để mở Bước 2.',
          x_label: 'study_hours', y_label: 'quiz_score',
          x_min: 0, x_max: 10, y_min: 0, y_max: 10,
          w1: 1.2, w2: -1.0, bias: -2.0,
          w1_range: [-3, 3], w2_range: [-3, 3], bias_range: [-8, 8],
          probe: [5, 3],
          pts_x1: [3.9,5.6,6.9,3.3,7.6,3.3,3.6,8.7,2.1,6.7,7.5,9.5,1.6,4.3,1.4,1.6,6.5,5.0,9.2,5.9],
          pts_x2: [7.9,7.7,0.9,0.8,5.7,4.5,5.4,4.1,0.8,7.4,5.8,5.3,6.4,3.9,1.5,1.4,3.7,8.7,3.0,3.6],
          riddle: {
            prompt: 'Một điểm nằm <b>đúng trên</b> đường ranh giới. Ở đó score <code>z = 0</code>. Vậy sigmoid cho xác suất <b>p</b> bằng bao nhiêu — và model gán nhãn gì?',
            options: ['p = 0.5 — đúng ngưỡng, model lưỡng lự (thường gán lớp 1 khi p ≥ 0.5)', 'p = 0 — vì z = 0', 'p = 1 — vì điểm nằm trên đường', 'Không xác định được nếu chưa biết w'],
            answer: 'p = 0.5 — đúng ngưỡng, model lưỡng lự (thường gán lớp 1 khi p ≥ 0.5)',
            wrong: {
              'p = 0 — vì z = 0': 'Nhầm z với p. σ(0) = 1/(1+e⁰) = 1/2 = <b>0.5</b>, không phải 0. Đó chính là lý do ranh giới ở p = 0.5 trùng khít với z = 0 — hai cách nói về cùng một đường.',
              'p = 1 — vì điểm nằm trên đường': 'Nằm trên đường nghĩa là <b>cân bằng</b>, không nghiêng về lớp nào — nên p phải là 0.5, không phải 1. p tiến tới 1 khi điểm ở sâu phía Đậu (z rất dương).',
              'Không xác định được nếu chưa biết w': 'w quyết định đường ranh giới nằm ĐÂU, nhưng hễ một điểm đã nằm ĐÚNG TRÊN đường thì theo định nghĩa z = 0 — và σ(0) = 0.5 với mọi w. Không cần biết w cụ thể.'
            },
            done: '✅ Đúng — <b>trên ranh giới, z = 0 nên p = 0.5</b>: đó là hai tên gọi của cùng một đường. Ngưỡng 0.5 (bên xác suất) và z = 0 (bên score) luôn khớp nhau vì σ(0) = 0.5. Ghi nhớ ba điều: (1) ranh giới là nơi <b>đổi nhãn</b>; (2) <b>w xoay</b> nó, <b>b tịnh tiến</b> nó; (3) phân loại bằng <b>dấu của z</b> — so p với 0.5, tuyệt đối đừng so z với 0.5. Xuống Bước 2 👇'
          }
        },
        visual: {
          schema: {
            table_name: 'boundary_demo (20 học viên · 2 feature)',
            columns: [
              { name: 'study_hours', type: 'FLOAT · 0–10', key: 'x1', icon: '📏',
                note: '<strong>Feature 1</strong> — trọng số w₁ = +1.2 (dương): học nhiều <strong>kéo về phía Đậu</strong>.' },
              { name: 'quiz_score', type: 'FLOAT · 0–10', key: 'x2', icon: '📝',
                note: '<strong>Feature 2</strong> — trọng số w₂ = −1.0 (âm): trong bộ demo này điểm quiz cao lại <strong>kéo về phía Rớt</strong> (dữ liệu giả lập để thấy w âm xoay đường ngược lại).' },
              { name: 'pass_fail', type: 'INT 0/1', key: 'TARGET', icon: '🎯',
                note: '<strong>Nhãn</strong> — do <strong>dấu của z = 1.2·x₁ − 1.0·x₂ − 2</strong> quyết định: 11 Rớt (0) · 9 Đậu (1).' }
            ]
          },
          data_preview: [
            ['3.9', '7.9', '0'], ['6.9', '0.9', '1'], ['7.6', '5.7', '1'], ['3.3', '4.5', '0'],
            ['8.7', '4.1', '1'], ['2.1', '0.8', '0'], ['6.7', '7.4', '0'], ['9.2', '3.0', '1'],
            ['1.6', '6.4', '0'], ['6.5', '3.7', '1'], ['5.0', '8.7', '0'], ['5.9', '3.6', '1']
          ]
        },
        mission: 'Dựng <code class="code">LUẬT TÁCH 2 LỚP</code>: tính <code class="code">score z = X @ w + b</code> → lấy <code class="code">DẤU (phía)</code> → vẽ <code class="code">đường ranh giới z = 0</code> — kho có <code class="code">mồi bẫy 🪤</code> (so score với 0.5 · nhân sai ma trận) ↓'
      },

      /* ----- STEP 2: 3 MCQ (boundary condition · geometry rotate/translate · trap so score) + mini-game phía của z ----- */
      step_2: {
        mcq: [
          {
            question: 'Với sigmoid và ngưỡng 0.5, ranh giới quyết định nằm ở <strong>p</strong> bằng bao nhiêu và <strong>z</strong> bằng bao nhiêu?',
            options: [
              { id: 'a', text: 'p = 0.5 và z = 0 — vì σ(0) = 0.5, hai điều kiện là một', correct: true, explanation: 'Đúng — cắt xác suất tại 0.5 tương đương cắt score tại 0, bởi sigmoid biến z = 0 thành p = 0.5. Đó là lý do "ranh giới p = 0.5" và "đường z = 0" luôn là cùng một đường.' },
              { id: 'b', text: 'p = 0 và z = 0', correct: false, explanation: 'p = 0 chỉ đạt khi z = −∞ (rất sâu phía Rớt), không phải trên ranh giới. Trên ranh giới p = 0.5.' },
              { id: 'c', text: 'p = 0.5 và z = 0.5', correct: false, explanation: 'Nhầm hai thang đo. Ngưỡng 0.5 sống bên xác suất; quy đổi sang score nó là z = 0 (vì σ(0) = 0.5), không phải z = 0.5.' },
              { id: 'd', text: 'Tùy dữ liệu, phải fit mới biết', correct: false, explanation: 'w và b (do dữ liệu quyết định) chỉ đặt đường ranh giới ở ĐÂU. Nhưng điều kiện "p = 0.5 ⇔ z = 0" là hằng, đúng với mọi bài toán.' }
            ]
          },
          {
            question: 'Bạn tăng <strong>w1</strong> rồi sau đó tăng <strong>bias</strong>. Mỗi thay đổi làm đường ranh giới chuyển động thế nào?',
            options: [
              { id: 'a', text: 'Đổi w1 → đường XOAY (đổi độ nghiêng); đổi bias → đường TỊNH TIẾN song song', correct: true, explanation: 'Chuẩn — w là pháp tuyến của đường nên chỉnh w xoay đường và đổi độ dốc; bias là số hạng tự do nên chỉ đẩy cả đường tới/lui mà giữ nguyên hướng.' },
              { id: 'b', text: 'Cả hai đều chỉ tịnh tiến đường', correct: false, explanation: 'Chỉ bias tịnh tiến. Đổi w làm đường xoay — thử kéo w1 trong ống kính ở Bước 1, độ nghiêng thay đổi rõ.' },
              { id: 'c', text: 'Cả hai đều chỉ xoay đường', correct: false, explanation: 'Chỉ w xoay. Bias không đụng tới hướng — nó đẩy đường song song với chính nó.' },
              { id: 'd', text: 'w1 phóng to điểm, bias đổi màu điểm', correct: false, explanation: 'Cả hai đều tác động lên ĐƯỜNG ranh giới, không lên điểm. Điểm đổi màu chỉ vì đường mới phân loại lại chúng.' }
            ]
          },
          {
            question: 'Một điểm có <code>z = 0.2</code>, nên <code>p = σ(0.2) ≈ 0.55</code>. Với ngưỡng 0.5, model gán lớp nào — và cái bẫy ở đây là gì?',
            options: [
              { id: 'a', text: 'Lớp 1 (vì p = 0.55 ≥ 0.5). Bẫy: so SCORE z với 0.5 sẽ ra nhầm lớp 0', correct: true, explanation: 'Đúng — ngưỡng 0.5 áp lên XÁC SUẤT: p = 0.55 ≥ 0.5 → lớp 1. Nếu lỡ so z ≥ 0.5 thì 0.2 < 0.5 → gán lớp 0, sai. Bên score, ranh giới đúng là z = 0, không phải 0.5.' },
              { id: 'b', text: 'Lớp 0, vì z = 0.2 < 0.5', correct: false, explanation: 'Đó chính là cái bẫy. Ngưỡng 0.5 không áp lên z — nó áp lên p. Ở đây p = 0.55 ≥ 0.5 nên phải là lớp 1.' },
              { id: 'c', text: 'Không phân loại được vì p quá gần 0.5', correct: false, explanation: 'Vẫn phân loại được: quy ước p ≥ 0.5 → lớp 1. Gần ranh giới nghĩa là model ít chắc chắn, nhưng luật vẫn cho ra nhãn.' },
              { id: 'd', text: 'Lớp 1, và so z với 0.5 cũng ra kết quả đó', correct: false, explanation: 'Nhãn đúng là lớp 1, nhưng so z với 0.5 sẽ cho 0.2 < 0.5 → lớp 0 (SAI). Hai cách KHÔNG cho cùng kết quả — đó là lý do phải so đúng thang.' }
            ]
          }
        ],
        mini_game: {
          title: 'Điểm rơi về phía nào của ranh giới?',
          instruction: 'Ranh giới là <code>z = 1.2·x₁ − 1.0·x₂ − 2</code>. Tính z rồi kéo mỗi điểm vào đúng ngăn: <strong>◀ z &lt; 0 (Rớt)</strong> · <strong>⏺ z = 0 (trên ranh giới)</strong> · <strong>z &gt; 0 (Đậu) ▶</strong>.',
          chips: [
            { id: 'pt-53',  label: '(5, 3) → z = 6 − 3 − 2 = 1.0' },
            { id: 'pt-82',  label: '(8, 2) → z = 9.6 − 2 − 2 = 5.6' },
            { id: 'pt-36',  label: '(3, 6) → z = 3.6 − 6 − 2 = −4.4' },
            { id: 'pt-25',  label: '(2, 5) → z = 2.4 − 5 − 2 = −4.6' },
            { id: 'pt-54',  label: '(5, 4) → z = 6 − 4 − 2 = 0' }
          ],
          bins: [
            { id: 'neg', label: '◀ z < 0 (Rớt)',        correct: 'true' },
            { id: 'zero', label: '⏺ z = 0 (ranh giới)', correct: 'true' },
            { id: 'pos', label: 'z > 0 (Đậu) ▶',        correct: 'true' }
          ],
          solution: { 'pt-53': 'pos', 'pt-82': 'pos', 'pt-36': 'neg', 'pt-25': 'neg', 'pt-54': 'zero' },
          success: 'Chuẩn — dấu của z quyết định phía: z dương → Đậu, âm → Rớt, đúng 0 → nằm trên ranh giới. Để ý (5,4) cho z = 0: đó là một điểm của chính đường ranh giới. Và |z| lớn (như 5.6) nghĩa là điểm nằm SÂU trong phía đó — model rất chắc. Bước 3: lắp đúng đường ống score → dấu → ranh giới.'
        }
      },

      /* ----- STEP 3: map 3 TRẠM — score → dấu (phía) → ranh giới. 2 mồi bẫy: so score với 0.5 / nhân sai ma trận ----- */
      step_3: {
        ml_pipeline: true,
        blocks: [
          { type: 'py', token: 'z = X @ weights + bias', slot: 'b1' },
          { type: 'py', token: 'sides = (z >= 0).astype(int)', slot: 'b2' },
          { type: 'py', token: 'boundary_x2 = (-bias - weights[0] * x1_line) / weights[1]', slot: 'b3' },
          /* 2 mồi bẫy */
          { type: 'py', token: 'sides = (z >= 0.5).astype(int)', slot: 't1' },
          { type: 'py', token: 'z = X * weights + bias', slot: 't2' }
        ],
        drop_zones: [
          { id: 'l13-score', accepts: ['py'], multi: false },
          { id: 'l13-sign', accepts: ['py'], multi: false },
          { id: 'l13-line', accepts: ['py'], multi: false }
        ],
        ml_flow: {
          brand: 'LUẬT TÁCH 2 LỚP — 3 TRẠM · SCORE → DẤU → RANH GIỚI',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: 'boundary_demo · 20 học viên · w = [1.2, −1.0] · b = −2.0' },
          done_note: 'Đường ống hình học: score z = X @ w + b (phép nhân ma trận cho cả 20 điểm một lượt), DẤU của z cho phía (z ≥ 0 → Đậu, 11 Rớt · 9 Đậu), và tập z = 0 vẽ thành ĐƯỜNG ranh giới. Hai mồi bẫy: so score với 0.5 (dịch sai ranh giới — đúng ra so z với 0) và nhân từng phần tử X * w (thiếu phép nhân ma trận @, sai hình dạng). Nhớ: so DẤU z với 0 ở đây chính là so p với 0.5 — Bước 4 viết tường minh qua sigmoid để threshold thành tham số sống.',
          stations: [
            {
              zones: ['l13-score'],
              icon: '📐', label: 'TRẠM 1 — SCORE', sub: 'z = X @ w + b (ma trận)', result_kind: 'boundary_2d',
              bnd: {
                mode: 'score', w1: 1.2, w2: -1.0, bias: -2.0,
                note: '<code>z = X @ weights + bias</code> — một phép nhân ma trận cho cả 20 điểm cùng lúc. Mỗi điểm ra một score z chạy từ <b>−6.48</b> tới <b>6.04</b>. Màu điểm nhạt/đậm theo z: chưa cắt nhãn, chỉ mới "chấm điểm" mỗi học viên.'
              },
              narration: 'X @ weights là trái tim của mọi model tuyến tính: gộp nhiều feature thành một score duy nhất cho mỗi mẫu. Trạm sau đọc DẤU của score đó.'
            },
            {
              zones: ['l13-sign'],
              icon: '➕', label: 'TRẠM 2 — DẤU (PHÍA)', sub: 'z ≥ 0 → Đậu · z < 0 → Rớt', result_kind: 'boundary_2d',
              bnd: {
                mode: 'sign', w1: 1.2, w2: -1.0, bias: -2.0,
                note: '<code>sides = (z >= 0).astype(int)</code> — lấy DẤU của score. z ≥ 0 → phía Đậu (lớp 1), z < 0 → phía Rớt (lớp 0). Kết quả: <b>11 Rớt · 9 Đậu</b>. Chú ý: ngưỡng ở đây là <b>0</b> (bên score), tương đương p ≥ 0.5 bên xác suất — KHÔNG phải z ≥ 0.5.'
              },
              narration: 'Dấu của z chia mặt phẳng làm hai. Đây đúng là chỗ dễ sai nhất: ngưỡng 0.5 là của XÁC SUẤT; quy sang score nó thành 0, không phải 0.5.'
            },
            {
              zones: ['l13-line'],
              icon: '📏', label: 'TRẠM 3 — RANH GIỚI', sub: 'tập z = 0 → một ĐƯỜNG', result_kind: 'boundary_2d',
              bnd: {
                mode: 'boundary', w1: 1.2, w2: -1.0, bias: -2.0,
                note: '<code>boundary_x2 = (-bias - weights[0] * x1_line) / weights[1]</code> — giải z = 0 theo x₂ để vẽ đường. Với bộ này: <b>x₂ = 1.2·x₁ − 2</b>. Đường này tách trọn 11 Rớt khỏi 9 Đậu; w quyết định độ nghiêng, b quyết định vị trí.'
              },
              narration: 'Tập tất cả điểm có z = 0 chính là ĐƯỜNG ranh giới. Ngưỡng 0.5 trên xác suất, nhìn trong không gian feature, hiện nguyên hình là một đường thẳng.'
            }
          ]
        },
        expected_sql: 'z = X @ weights + bias sides = (z >= 0).astype(int) boundary_x2 = (-bias - weights[0] * x1_line) / weights[1]',
        expected_zones: {
          'l13-score': 'z = X @ weights + bias',
          'l13-sign': 'sides = (z >= 0).astype(int)',
          'l13-line': 'boundary_x2 = (-bias - weights[0] * x1_line) / weights[1]'
        },
        reveal_hints: {
          'l13-score': 'Trạm 1: score cho cả ma trận — <strong>z = X @ weights + bias</strong> (nhân ma trận @, không phải *).',
          'l13-sign': 'Trạm 2: dấu của z, cắt tại 0 chứ không phải 0.5 — <strong>sides = (z >= 0).astype(int)</strong>.',
          'l13-line': 'Trạm 3: giải z = 0 theo x₂ để vẽ đường — <strong>boundary_x2 = (-bias - weights[0] * x1_line) / weights[1]</strong>.'
        }
      },

      drag_map: {
        brand: 'LUẬT TÁCH 2 LỚP — 3 TRẠM · SCORE → DẤU → RANH GIỚI',
        table_sub: 'boundary_demo · 20 học viên · 2 feature',
        idle_sub: '20 học viên · ▶ chạy để chấm score, lấy dấu và vẽ ranh giới',
        run_label: '▶ Chạy 3 trạm',
        table: {
          name: 'boundary_demo',
          columns: ['study_hours', 'quiz_score'],
          dataRows: [
            ['3.9', '7.9'], ['5.6', '7.7'], ['6.9', '0.9'], ['3.3', '0.8'], ['7.6', '5.7'],
            ['3.3', '4.5'], ['3.6', '5.4'], ['8.7', '4.1'], ['2.1', '0.8'], ['6.7', '7.4'],
            ['7.5', '5.8'], ['9.5', '5.3'], ['1.6', '6.4'], ['4.3', '3.9'], ['1.4', '1.5'],
            ['1.6', '1.4'], ['6.5', '3.7'], ['5.0', '8.7'], ['9.2', '3.0'], ['5.9', '3.6']
          ]
        }
      },

      /* ----- STEP 4: tự viết sigmoid + predict_classes. Grader: grade_lesson13
         (cần predict_classes(X, w, b, threshold=0.5) + X @ w; return (p, preds); Risk bắt so score với 0.5
         và threshold hard-code; Behavior 3 feature + threshold 0.3/0.7 ẩn). ----- */
      step_4: {
        prompt: 'Bước 3 bạn lắp đường ống hình học. Giờ viết <strong>hàm suy luận đầy đủ</strong>: <code>predict_classes(X, weights, bias, threshold=0.5)</code> tính score bằng <strong>nhân ma trận</strong>, ép qua <strong>sigmoid</strong> ra xác suất, rồi cắt <strong>ngưỡng</strong> ra nhãn — trả về <strong>cả</strong> xác suất lẫn nhãn. Hệ thống chấm dùng cả bộ dữ liệu khác và <strong>ngưỡng ẩn</strong> 0.3 / 0.7, nên threshold phải là tham số sống, không hard-code.',
        context: {
          scenario: 'Hợp đồng của hàm gồm bốn phần: (1) gộp các feature thành một <strong>score</strong> bằng phép nhân ma trận (chạy được cho mọi số feature); (2) đổi score sang <strong>xác suất</strong> bằng sigmoid; (3) cắt tại <strong>ngưỡng trên xác suất</strong> ra nhãn 0/1; (4) trả về <strong>cả xác suất lẫn nhãn</strong>. Cái bẫy chí mạng: cắt ngưỡng 0.5 ngay trên <strong>score</strong>. Ngưỡng 0.5 là của xác suất; bên score nó tương đương 0. So score với 0.5 sẽ dịch cả ranh giới đi sai chỗ.',
          real_world: '<code>predict_classes</code> chính là bước inference của mọi bộ phân loại nhị phân đã huấn luyện: nạp trọng số, nhân ma trận, sigmoid, ngưỡng. Để threshold thành tham số (mặc định 0.5) là điều bắt buộc trong thực tế — bài toán gian lận hay y tế thường chỉnh ngưỡng để đánh đổi giữa bỏ sót và báo nhầm.',
          steps: [
            'Nạp <code>X, weights, bias</code> bằng <code>load_boundary_data()</code>.',
            'Viết <code>sigmoid(z)</code> (hàm mũ) và <code>predict_classes(X, weights, bias, threshold=0.5)</code>.',
            'Trong hàm: gộp feature thành score bằng nhân ma trận → ép qua sigmoid → so <strong>xác suất</strong> (không phải score) với threshold; trả về cả xác suất lẫn nhãn.',
            'Gọi trên dữ liệu bài, in số học viên được xếp lớp 1 · Run · Submit chấm 4 tầng.'
          ],
          hint_explore: 'Muốn soi trước? Sau khi gọi hàm, gõ <code>print(probabilities.round(2))</code> để thấy 20 xác suất — điểm nào gần 0.5 là gần ranh giới.',
          expected: 'Console in <code>class 1: 9</code> (9 học viên phía Đậu). Đủ 4 tầng xanh. Thử cắt ngưỡng ngay trên score (<code>z >= 0.5</code>)? Code chạy nhưng tầng Risk sẽ chỉ ra ranh giới đã bị dịch sai.'
        },
        hints: [
          { level: 1, text: 'Bốn việc: nạp dữ liệu → viết sigmoid + predict_classes → nhân ma trận rồi sigmoid rồi cắt ngưỡng trên XÁC SUẤT → return (p, nhãn). threshold là tham số, mặc định 0.5.' },
          { level: 2, text: 'Đầu bài: <code>import numpy as np</code>, <code>from ml_lab import load_boundary_data</code>, rồi <code>X, weights, bias = load_boundary_data()</code>. Nhớ <code>@</code> là nhân ma trận, khác <code>*</code> (nhân từng phần tử).' },
          { level: 3, text: 'Hàm suy luận:<br><code>def predict_classes(X, weights, bias, threshold=0.5):<br>&nbsp;&nbsp;&nbsp;&nbsp;p = sigmoid(X @ weights + bias)<br>&nbsp;&nbsp;&nbsp;&nbsp;return p, (p >= threshold).astype(int)</code><br>Chú ý: so <code>p</code> (xác suất) với threshold, KHÔNG so score.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>import numpy as np<br>from ml_lab import load_boundary_data<br>X, weights, bias = load_boundary_data()<br><br>def sigmoid(z):<br>&nbsp;&nbsp;&nbsp;&nbsp;return 1 / (1 + np.exp(-z))<br><br>def predict_classes(X, weights, bias, threshold=0.5):<br>&nbsp;&nbsp;&nbsp;&nbsp;p = sigmoid(X @ weights + bias)<br>&nbsp;&nbsp;&nbsp;&nbsp;return p, (p >= threshold).astype(int)<br><br>probabilities, predictions = predict_classes(X, weights, bias)<br>print("class 1:", int(predictions.sum()))</code>' }
        ],
        grader_fn: 'grade_lesson13',
        success_message: 'Luật tách hai lớp hoàn tất — 9 học viên phía Đậu, ranh giới đúng chỗ, và threshold là tham số sống (bộ ẩn 0.3/0.7 vẫn khớp). Bạn vừa khép trọn suy luận logistic: linear cho score → sigmoid cho xác suất → ngưỡng cho nhãn, và cái ngưỡng ấy hiện thành một ĐƯỜNG trong không gian feature. Chương M4 xong. Bài 14 mở chương M5 — khi ranh giới thẳng là chưa đủ: underfit, good fit và overfit.',
        xp_reward: 50
      }
    },
    {
      id: 'c1_l14',
      index: 14,
      title: 'Underfit, Good Fit và Overfit',
      subtitle: 'Train MSE nhỏ nhất KHÔNG phải model tốt nhất — bậc 12 nhớ thuộc 24 điểm rồi trượt xa dữ liệu mới',
      module: 14,
      module_title: 'M5 — Tổng quát hóa',
      estimated_minutes: 19,
      xp_reward: 50,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      story: {
        tag: '🎯 StudyLab · Ticket #14 · MỞ MÀN M5',
        hook: 'Bốn chương đầu dạy cách <strong>dựng</strong> model và <strong>fit</strong> nó lên dữ liệu. Nhưng fit giỏi trên dữ liệu đã thấy chưa chắc là điều ta muốn. Ticket #14 đặt lên bàn ba model cùng nhìn <strong>một</strong> bộ 24 điểm: một đường thẳng <strong>đơ cứng</strong> (bậc 1), một đường cong <strong>vừa phải</strong> (bậc 3), và một đường <strong>răng cưa</strong> luồn qua gần như mọi điểm (bậc 12). Cái bẫy: đường răng cưa có <strong>train MSE nhỏ nhất</strong> (5.4) — trông "giỏi nhất". Rồi ta lật 20 điểm <strong>chưa từng cho nó thấy</strong> lên: check MSE của nó là <strong>248,525</strong>. Nó không hiểu quy luật — nó chỉ <strong>học thuộc lòng</strong>.'
      },
      achievement: { name: 'Generalization — chẩn đoán overfit', desc: 'phân biệt underfit/good/overfit bằng cặp train–held-out MSE, và chọn độ phức tạp theo dữ liệu chưa thấy chứ không theo train MSE' },

      step_1: {
        you_will_learn: {
          lead: 'Xong bài này, bạn sẽ:',
          outcomes: [
            'Gọi tên <strong>underfit</strong> (đơ), <strong>good fit</strong> (vừa), <strong>overfit</strong> (răng cưa) qua hình dạng đường và cặp lỗi.',
            'Dùng <strong>train MSE và held-out MSE cùng lúc</strong> — và hiểu vì sao train MSE thấp một mình là <strong>tín hiệu lừa</strong>.',
            'Chọn <strong>độ phức tạp trung bình</strong> bằng cách fit nhiều bậc rồi so trên <strong>dữ liệu chưa thấy</strong>.'
          ]
        },
        glossary: [
          { term: 'UNDERFIT', vi: 'học chưa tới', accent: '#FBBF24',
            def: 'Model <b>quá đơn giản</b>, bỏ sót quy luật — <b>train cao, held-out cũng cao</b>.',
            ex: 'đường thẳng bậc 1 trên dữ liệu cong: train 21.5 · check 25.2.',
            out: 'chữa bằng cách tăng độ phức tạp' },
          { term: 'GOOD FIT', vi: 'vừa vặn', accent: '#34D399',
            def: 'Model bắt đúng quy luật, bỏ qua nhiễu — <b>train thấp, held-out cũng thấp</b>.',
            ex: 'đường bậc 3: train 11.1 · check <b>8.2</b> (thấp nhất họ check).',
            out: 'đây là mục tiêu — điểm ngọt độ phức tạp' },
          { term: 'OVERFIT', vi: 'học thuộc lòng', accent: '#F87171',
            def: 'Model <b>quá phức tạp</b>, học cả nhiễu — <b>train rất thấp nhưng held-out nổ tung</b>.',
            ex: 'đường bậc 12: train 5.4 (nhỏ nhất!) nhưng check <b>248,525</b>.',
            out: 'train thấp mà check cao = dấu hiệu overfit' },
          { term: 'HELD-OUT', vi: 'để dành ra', accent: '#38BDF8',
            def: 'Dữ liệu <b>không dùng để fit</b>, giữ lại để đo model xử lý cái <b>chưa thấy</b> ra sao. Ở đây tập check đóng vai <b>validation</b> — dùng để CHỌN độ phức tạp.',
            ex: '20 điểm check ở đây — model không được nhìn khi học.',
            out: 'chính là "validation" — Bài 15 sẽ tách thêm "test" niêm phong riêng' },
          { term: 'GENERALIZATION', vi: 'tổng quát hóa', accent: '#A78BFA',
            def: 'Khả năng làm <b>đúng trên dữ liệu mới</b>, không chỉ dữ liệu đã fit.',
            ex: 'model tốt = tổng quát tốt, không phải thuộc bài giỏi.',
            out: 'mục tiêu tối hậu của mọi model ML' },
          { term: 'MODEL COMPLEXITY', vi: 'độ phức tạp', accent: '#F472B6',
            def: 'Model có <b>bao nhiêu tự do</b> để uốn theo dữ liệu (bậc đa thức, số tham số…).',
            ex: 'bậc càng cao càng uốn dữ dội; đánh đổi: underfit ↔ overfit.',
            out: 'chọn vừa đủ — không đơ, không răng cưa' }
        ],
        primer: {
          goal: [
            'train MSE thấp một mình = tín hiệu LỪA',
            'overfit: train rất thấp · held-out nổ tung',
            'chọn độ phức tạp theo dữ liệu CHƯA THẤY'
          ],
          intro: '',
          example: '🔍 <strong>Trong ống kính bên dưới:</strong> kéo thanh <strong>ĐỘ PHỨC TẠP</strong> để đường fit biến hình từ thẳng (bậc 1) → mượt (bậc 3) → răng cưa (bậc 12). Hai đồng hồ bên dưới là <strong>train MSE</strong> và <strong>check MSE</strong>: để ý train luôn tụt khi bậc tăng, nhưng check tụt tới đáy ở bậc 3 rồi <strong>vọt lên</strong>. Bật <strong>hiện điểm ẩn</strong> để thấy đường răng cưa trượt khỏi 20 điểm nó chưa từng thấy. Giữ ý này sang Bước 2 👇'
        },
        intro: 'Cho tới giờ ta luôn đo model bằng lỗi trên dữ liệu đã fit. Bài này lật tẩy điều đó: một model đủ phức tạp có thể <strong>ép train MSE xuống gần 0</strong> bằng cách uốn qua từng điểm — kể cả phần nhiễu ngẫu nhiên. Nó trông hoàn hảo, nhưng nó không học được <strong>quy luật</strong>, chỉ học thuộc <strong>đáp án</strong>. Bằng chứng lộ ra ngay khi ta cho nó dữ liệu mới. Vì thế câu hỏi đúng không phải "fit đẹp cỡ nào?" mà là "<strong>tổng quát tốt cỡ nào?</strong>" — và chỉ dữ liệu để dành ra mới trả lời được.',
        concept_cards: [
          {
            icon: 'fa-ruler',
            title: 'Ba trạng thái, đọc bằng CẶP lỗi',
            body: 'Đừng nhìn train MSE một mình — luôn đọc <strong>cặp (train, held-out)</strong>. <strong>Underfit</strong>: cả hai đều cao (21.5 / 25.2) — model quá đơ. <strong>Good fit</strong>: cả hai đều thấp (11.1 / 8.2) — bắt đúng quy luật. <strong>Overfit</strong>: train rất thấp mà held-out cao vọt (5.4 / <strong>248,525</strong>) — học thuộc nhiễu. Khoảng cách (gap) giữa hai lỗi càng lớn càng đáng ngờ.'
          },
          {
            icon: 'fa-heart-crack',
            title: 'Train MSE thấp là tín hiệu LỪA',
            body: 'Nếu chọn model theo train MSE nhỏ nhất, bạn sẽ <strong>luôn</strong> chọn cái phức tạp nhất — vì nó uốn qua nhiều điểm nhất. Ở đây bậc 12 thắng train (5.4) nhưng là model <strong>tệ nhất</strong> thực tế. Train MSE đo "thuộc bài", không đo "hiểu bài". Đây là một trong những sai lầm tốn kém nhất trong ML: khoe điểm trên chính đề đã ôn.'
          },
          {
            icon: 'fa-scale-balanced',
            title: 'Điểm ngọt: chọn theo dữ liệu chưa thấy',
            body: 'Cách đúng: fit vài mức độ phức tạp trên train, rồi <strong>so trên held-out</strong> và chọn cái check MSE nhỏ nhất. Check MSE có hình <strong>chữ U</strong> theo độ phức tạp: giảm khi model đủ mạnh để bắt quy luật (bậc 1→3), rồi tăng khi nó bắt đầu học nhiễu (bậc 3→12). Đáy chữ U — ở đây là <strong>bậc 3</strong> — là độ phức tạp vừa vặn.'
          }
        ],
        /* Hero = ỐNG KÍNH ĐỘ PHỨC TẠP (user chốt 2026-07-22) */
        complexity_lens: {
          title: 'ỐNG KÍNH ĐỘ PHỨC TẠP — THẲNG → MƯỢT → RĂNG CƯA',
          intro: 'Chấm đặc = 24 điểm <b>train</b>; chấm rỗng = 20 điểm <b>held-out</b> (bật để hiện). Kéo thanh <b>ĐỘ PHỨC TẠP</b> để đường fit biến hình. Đọc hai đồng hồ: train luôn tụt, nhưng check tụt tới đáy ở bậc 3 rồi vọt lên. Trả lời câu chốt để mở Bước 2.',
          x_label: 'x', y_label: 'y',
          x_min: 0, x_max: 10, y_min: 15, y_max: 65,
          x_train: [0.43,0.61,1.24,1.3,1.35,1.71,1.91,2.49,2.74,3.15,3.3,3.36,3.53,3.78,4.53,4.66,4.68,4.7,4.82,5.45,6.34,7.41,9.5,9.57],
          y_train: [29.0,27.8,36.7,38.4,44.2,42.3,38.2,38.8,40.3,46.1,45.4,42.1,41.5,42.1,35.5,37.0,42.5,49.8,46.3,40.0,39.9,37.6,41.0,41.5],
          x_check: [0.01,0.6,1.83,1.94,2.23,2.33,3.2,3.41,3.49,4.12,4.15,4.72,4.86,4.89,5.37,6.02,6.33,7.22,7.81,8.8],
          y_check: [26.7,34.7,42.0,47.6,43.3,43.4,42.0,44.4,44.3,42.3,42.1,43.1,42.8,47.5,42.8,35.1,43.8,37.7,36.0,37.4],
          default_index: 0,
          degrees: [
            { d: 1, label: 'bậc 1 · THẲNG (underfit)', state: 'underfit', train_mse: 21.49, check_mse: 25.21,
              coeffs: [0.6029867248435571, 37.84114786452001] },
            { d: 2, label: 'bậc 2', state: 'underfit', train_mse: 16.42, check_mse: 16.96,
              coeffs: [-0.30934201349871654, 3.6052570716660823, 32.71785445670399] },
            { d: 3, label: 'bậc 3 · MƯỢT (good fit) ✓', state: 'good', train_mse: 11.13, check_mse: 8.23,
              coeffs: [0.15295143103984774, -2.5760454489655, 12.378254894544847, 24.97734076609765] },
            { d: 5, label: 'bậc 5', state: 'good', train_mse: 10.19, check_mse: 11.88,
              coeffs: [0.012737447597919336, -0.31660950084974643, 2.9794946157235684, -13.513219039916448, 29.68272728376541, 17.03847104912199] },
            { d: 8, label: 'bậc 8', state: 'over', train_mse: 10.09, check_mse: 14.86,
              coeffs: [0.00011677959845802748, -0.004003478406765348, 0.052526747457274, -0.3060318968215347, 0.44747105513729823, 3.5372496264880344, -19.15415019943142, 37.50173898893522, 14.278574316070504] },
            { d: 12, label: 'bậc 12 · RĂNG CƯA (overfit)', state: 'over', train_mse: 5.44, check_mse: 248525.50,
              coeffs: [-0.0007257573068618459, 0.038656422040067175, -0.9011051785397823, 12.100506871822752, -103.69351447205102, 593.5175329776715, -2308.302459034843, 6086.292173385976, -10667.424171874802, 11942.017854620066, -7970.372945037153, 2813.2534618891036, -368.1124044126267] }
          ],
          riddle: {
            prompt: 'Đường bậc 12 có <b>train MSE nhỏ nhất</b> (5.4) trong cả họ, nhưng khi gặp 20 điểm chưa thấy thì <b>check MSE = 248,525</b>. Chẩn đoán?',
            options: ['OVERFIT — học thuộc nhiễu của train, không tổng quát được', 'Model tốt nhất — vì train MSE nhỏ nhất', 'UNDERFIT — vì check MSE quá cao', 'Good fit — chỉ cần thêm dữ liệu là hết'],
            answer: 'OVERFIT — học thuộc nhiễu của train, không tổng quát được',
            wrong: {
              'Model tốt nhất — vì train MSE nhỏ nhất': 'Đây đúng là cái bẫy của bài. Train MSE nhỏ chỉ nói model "thuộc" 24 điểm train — kể cả phần nhiễu. Thước đo thật là <b>held-out</b>: 248,525 nghĩa là trên dữ liệu mới nó sai kinh khủng.',
              'UNDERFIT — vì check MSE quá cao': 'Underfit là khi model quá ĐƠN GIẢN — cả train lẫn check đều cao. Ở đây train rất THẤP (5.4), chỉ check cao. Train thấp + check cao = overfit, ngược hẳn underfit.',
              'Good fit — chỉ cần thêm dữ liệu là hết': 'Good fit phải có check MSE thấp; 248,525 thì không thể gọi là tốt. Thêm dữ liệu có thể giúp, nhưng gốc rễ là model <b>quá phức tạp</b> cho lượng dữ liệu này — cần giảm bậc, không chỉ thêm điểm.'
            },
            done: '✅ Đúng — <b>train thấp + held-out cao = overfit</b>. Bậc 12 uốn qua gần hết 24 điểm train (kể cả nhiễu) nên train MSE nhỏ, nhưng chính vì bám nhiễu mà nó trượt xa 20 điểm mới. Ba điều khép bài: (1) đọc <b>cặp</b> (train, held-out), không phải train một mình; (2) check MSE có hình <b>chữ U</b> theo độ phức tạp, đáy ở bậc 3; (3) chọn model theo <b>dữ liệu chưa thấy</b>. Xuống Bước 2 👇'
          }
        },
        visual: {
          schema: {
            table_name: 'complexity_demo (24 train + 20 held-out)',
            columns: [
              { name: 'x', type: 'FLOAT · 0–10', key: 'x', icon: '📏',
                note: '<strong>Feature</strong> — dữ liệu sinh từ một đường cong thật bậc 3 cộng nhiễu ngẫu nhiên.' },
              { name: 'y', type: 'FLOAT', key: 'TARGET', icon: '🎯',
                note: '<strong>Giá trị</strong> — model bậc 12 có thể uốn qua gần hết 24 điểm train, nhưng phần nó bám là <strong>nhiễu</strong>, không phải quy luật.' },
              { name: 'split', type: 'train / held-out', key: 'ROLE', icon: '🔒',
                note: '<strong>Vai trò</strong> — 24 điểm train để fit; 20 điểm held-out <strong>giữ kín</strong> khỏi mọi lần fit, chỉ dùng để đo tổng quát hóa.' }
            ]
          },
          data_preview: [
            ['bậc 1', 'train 21.49', 'check 25.21 · underfit'],
            ['bậc 3', 'train 11.13', 'check 8.23 · GOOD ✓'],
            ['bậc 5', 'train 10.19', 'check 11.88'],
            ['bậc 8', 'train 10.09', 'check 14.86'],
            ['bậc 12', 'train 5.44', 'check 248525 · overfit']
          ]
        },
        mission: 'Dựng <code class="code">SO ĐỘ PHỨC TẠP</code>: <code class="code">fit từng bậc [1,3,12]</code> trên train → <code class="code">đo CẢ train &amp; check MSE</code> → <code class="code">chọn best theo CHECK</code> — kho có <code class="code">mồi bẫy 🪤</code> (chọn theo train MSE · fit lẫn held-out) ↓'
      },

      /* ----- STEP 2: 3 MCQ (chẩn đoán overfit · ghép cặp lỗi · gap) + mini-game xếp 3 model ----- */
      step_2: {
        mcq: [
          {
            question: 'Một model có <strong>train MSE gần 0</strong> nhưng <strong>held-out MSE rất cao</strong>. Chẩn đoán là gì?',
            options: [
              { id: 'a', text: 'Overfit — model học thuộc chi tiết/nhiễu của train, không tổng quát', correct: true, explanation: 'Đúng — train gần 0 nghĩa là nó khớp hoàn hảo dữ liệu đã thấy, nhưng held-out cao nghĩa là nó thất bại trên dữ liệu mới. Đó là định nghĩa overfit: thuộc bài mà không hiểu bài.' },
              { id: 'b', text: 'Underfit — vì lỗi held-out cao', correct: false, explanation: 'Underfit thì CẢ train lẫn held-out đều cao (model quá đơn giản). Ở đây train gần 0 — model quá phức tạp, không phải quá đơn giản.' },
              { id: 'c', text: 'Good fit — train thấp là đủ', correct: false, explanation: 'Good fit đòi held-out cũng thấp. Chỉ train thấp mà held-out cao là dấu hiệu overfit rõ ràng nhất.' },
              { id: 'd', text: 'Model hoàn hảo, nên deploy ngay', correct: false, explanation: 'Đây là cái bẫy chết người. "Hoàn hảo trên train" thường có nghĩa "sẽ hỏng trên thực tế". Chỉ held-out mới nói sự thật.' }
            ]
          },
          {
            question: 'Ghép trạng thái với cặp lỗi. Cặp <strong>train cao / held-out cao</strong> là trạng thái nào?',
            options: [
              { id: 'a', text: 'Underfit — model quá đơn giản, bỏ sót cả quy luật lẫn trên dữ liệu mới', correct: true, explanation: 'Chuẩn — khi model quá đơn giản (như đường thẳng cho dữ liệu cong), nó sai ở cả train lẫn held-out. Nâng độ phức tạp sẽ giúp.' },
              { id: 'b', text: 'Overfit', correct: false, explanation: 'Overfit là train RẤT THẤP nhưng held-out cao. Ở đây train cũng cao → model chưa học nổi cả train → underfit.' },
              { id: 'c', text: 'Good fit', correct: false, explanation: 'Good fit là cả hai đều thấp. Cả hai đều cao nghĩa là model còn chưa bắt được quy luật.' },
              { id: 'd', text: 'Không đủ thông tin để kết luận', correct: false, explanation: 'Đủ thông tin: cặp (cao, cao) là chữ ký kinh điển của underfit.' }
            ]
          },
          {
            question: 'Model A: train 12 / held-out 13. Model B: train 5 / held-out 40. Nên chọn cái nào để dùng thật?',
            options: [
              { id: 'a', text: 'A — held-out của A thấp hơn nhiều (13 vs 40); gap của B tố cáo overfit', correct: true, explanation: 'Đúng — chọn theo HELD-OUT vì đó là ước lượng cho dữ liệu thật. A tổng quát tốt (13, sát train). B có train đẹp (5) nhưng held-out 40 và gap lớn (35) → học thuộc, sẽ hỏng khi triển khai.' },
              { id: 'b', text: 'B — vì train MSE nhỏ hơn (5 < 12)', correct: false, explanation: 'Đây chính là bẫy train-MSE. B thuộc bài giỏi hơn nhưng hiểu bài kém hơn (held-out 40 >> 13). Không bao giờ chọn model chỉ vì train thấp.' },
              { id: 'c', text: 'B — vì nó phức tạp hơn nên mạnh hơn', correct: false, explanation: 'Phức tạp hơn không phải mạnh hơn. B phức tạp tới mức học cả nhiễu — đó là điểm yếu, không phải sức mạnh.' },
              { id: 'd', text: 'Cần thêm dữ liệu mới quyết định được', correct: false, explanation: 'Đã có đủ: held-out của cả hai đã cho biết A tổng quát tốt hơn hẳn. Quyết định được ngay.' }
            ]
          }
        ],
        mini_game: {
          title: 'Ghép mỗi model với chẩn đoán qua cặp (train, check)',
          instruction: 'Kéo mỗi model vào đúng ngăn dựa trên <strong>cặp lỗi</strong>: <strong>UNDERFIT</strong> (cao/cao) · <strong>GOOD FIT</strong> (thấp/thấp) · <strong>OVERFIT</strong> (rất thấp/cao).',
          chips: [
            { id: 'm-d1',  label: 'bậc 1 → train 21.5 · check 25.2' },
            { id: 'm-d2',  label: 'bậc 2 → train 16.4 · check 17.0' },
            { id: 'm-d3',  label: 'bậc 3 → train 11.1 · check 8.2' },
            { id: 'm-d8',  label: 'bậc 8 → train 10.1 · check 14.9' },
            { id: 'm-d12', label: 'bậc 12 → train 5.4 · check 248525' }
          ],
          bins: [
            { id: 'under', label: 'UNDERFIT (cao/cao)',       correct: 'true' },
            { id: 'good',  label: 'GOOD FIT (thấp/thấp)',      correct: 'true' },
            { id: 'over',  label: 'OVERFIT (rất thấp/cao)',    correct: 'true' }
          ],
          solution: { 'm-d1': 'under', 'm-d2': 'under', 'm-d3': 'good', 'm-d8': 'over', 'm-d12': 'over' },
          success: 'Chuẩn — bậc 1 & 2 chưa bắt nổi quy luật (cả hai lỗi đều cao → underfit); bậc 3 vừa vặn (cả hai thấp → good fit); bậc 8 & 12 học thuộc dần (train tụt nhưng check trèo lên → overfit). Để ý bậc 8: train chỉ nhỉnh hơn bậc 3 chút xíu mà check đã tệ gần gấp đôi — dấu hiệu overfit sớm. Bước 3: lắp đúng đường ống fit → đo → chọn theo check.'
        }
      },

      /* ----- STEP 3: map 3 TRẠM — fit nhiều bậc → đo train+check → chọn theo check. 2 mồi bẫy ----- */
      step_3: {
        ml_pipeline: true,
        blocks: [
          { type: 'py', token: 'models = [fit_polynomial_model(X_train, y_train, d) for d in [1, 3, 12]]', slot: 'b1' },
          { type: 'py', token: 'errors = [(compute_mse(y_train, m.predict(X_train)), compute_mse(y_check, m.predict(X_check))) for m in models]', slot: 'b2' },
          { type: 'py', token: 'best_degree = [1, 3, 12][min(range(3), key=lambda i: errors[i][1])]', slot: 'b3' },
          /* 2 mồi bẫy */
          { type: 'py', token: 'best_degree = [1, 3, 12][min(range(3), key=lambda i: errors[i][0])]', slot: 't1' },
          { type: 'py', token: 'models = [fit_polynomial_model(X_all, y_all, d) for d in [1, 3, 12]]', slot: 't2' }
        ],
        drop_zones: [
          { id: 'l14-fit', accepts: ['py'], multi: false },
          { id: 'l14-measure', accepts: ['py'], multi: false },
          { id: 'l14-select', accepts: ['py'], multi: false }
        ],
        ml_flow: {
          brand: 'SO ĐỘ PHỨC TẠP — 3 TRẠM · FIT → ĐO → CHỌN THEO CHECK',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: 'complexity_demo · 24 train + 20 held-out · so bậc [1, 3, 12]' },
          /* 3 đường + MSE thật (dùng chung cho scene complexity_fit) */
          y_min: 15, y_max: 65,
          models: [
            { d: 1, state: 'underfit', train_mse: 21.49, check_mse: 25.21, coeffs: [0.6029867248435571, 37.84114786452001] },
            { d: 3, state: 'good', train_mse: 11.13, check_mse: 8.23, coeffs: [0.15295143103984774, -2.5760454489655, 12.378254894544847, 24.97734076609765] },
            { d: 12, state: 'over', train_mse: 5.44, check_mse: 248525.50, coeffs: [-0.0007257573068618459, 0.038656422040067175, -0.9011051785397823, 12.100506871822752, -103.69351447205102, 593.5175329776715, -2308.302459034843, 6086.292173385976, -10667.424171874802, 11942.017854620066, -7970.372945037153, 2813.2534618891036, -368.1124044126267] }
          ],
          done_note: 'Đường ống tổng quát hóa: fit [1,3,12] CHỈ trên train → đo CẢ train và check MSE cho mỗi bậc → chọn best_degree theo CHECK MSE nhỏ nhất (bậc 3). Hai mồi bẫy: chọn theo train MSE (→ bậc 12 overfit, vì train luôn tụt khi bậc tăng) và fit trên train+check gộp (leakage — held-out phải giữ kín khỏi fit). Bước 4 tự viết vòng lặp so bậc.',
          stations: [
            {
              zones: ['l14-fit'],
              icon: '📈', label: 'TRẠM 1 — FIT NHIỀU BẬC', sub: 'polyfit [1,3,12] trên TRAIN', result_kind: 'complexity_fit',
              cx: {
                mode: 'fit',
                note: '<code>models = [fit_polynomial_model(X_train, y_train, d) for d in [1, 3, 12]]</code> — fit ba mức độ phức tạp, <b>chỉ</b> trên 24 điểm train. Bậc 1 gần thẳng, bậc 3 cong vừa, bậc 12 răng cưa luồn qua gần hết điểm.'
              },
              narration: 'Cùng một dữ liệu, ba độ phức tạp. Chú ý: 20 điểm held-out chưa xuất hiện — chúng phải được giữ kín khỏi mọi lần fit.'
            },
            {
              zones: ['l14-measure'],
              icon: '📊', label: 'TRẠM 2 — ĐO train & check', sub: 'MSE trên CẢ hai tập', result_kind: 'complexity_fit',
              cx: {
                mode: 'measure',
                note: '<code>errors = [(train_mse, check_mse) for m in models]</code> — đo mỗi model trên train (đã thấy) VÀ check (chưa thấy). Kết quả: bậc 1 (21.5/25.2), bậc 3 (11.1/<b>8.2</b>), bậc 12 (<b>5.4</b>/248525). Train luôn tụt; check hình chữ U.'
              },
              narration: 'Đây là chỗ sự thật lộ ra. Train MSE tụt đều theo bậc — nếu chỉ nhìn nó, bậc 12 "thắng". Nhưng check MSE kể câu chuyện ngược lại.'
            },
            {
              zones: ['l14-select'],
              icon: '🎯', label: 'TRẠM 3 — CHỌN THEO CHECK', sub: 'best = min check MSE', result_kind: 'complexity_fit',
              cx: {
                mode: 'select',
                note: '<code>best_degree = min theo check_mse</code> — chọn model có <b>check MSE</b> nhỏ nhất, không phải train. Đáy chữ U ở <b>bậc 3</b> (check 8.2). Bậc 12 tuy train nhỏ nhất nhưng check nổ tung, bị loại.'
              },
              narration: 'Luật chọn đúng: theo dữ liệu CHƯA THẤY. Bậc 3 tổng quát tốt nhất — đó là điểm ngọt giữa đơ và răng cưa.'
            }
          ]
        },
        expected_sql: 'models = [fit_polynomial_model(X_train, y_train, d) for d in [1, 3, 12]] errors = [(compute_mse(y_train, m.predict(X_train)), compute_mse(y_check, m.predict(X_check))) for m in models] best_degree = [1, 3, 12][min(range(3), key=lambda i: errors[i][1])]',
        expected_zones: {
          'l14-fit': 'models = [fit_polynomial_model(X_train, y_train, d) for d in [1, 3, 12]]',
          'l14-measure': 'errors = [(compute_mse(y_train, m.predict(X_train)), compute_mse(y_check, m.predict(X_check))) for m in models]',
          'l14-select': 'best_degree = [1, 3, 12][min(range(3), key=lambda i: errors[i][1])]'
        },
        reveal_hints: {
          'l14-fit': 'Trạm 1: fit [1,3,12] chỉ trên TRAIN — <strong>models = [fit_polynomial_model(X_train, y_train, d) for d in [1, 3, 12]]</strong>.',
          'l14-measure': 'Trạm 2: đo CẢ train và check MSE — <strong>errors = [(compute_mse(y_train, ...), compute_mse(y_check, ...)) ...]</strong>.',
          'l14-select': 'Trạm 3: chọn theo CHECK MSE (chỉ số [1], không phải [0]) — <strong>best_degree = [1, 3, 12][min(range(3), key=lambda i: errors[i][1])]</strong>.'
        }
      },

      drag_map: {
        brand: 'SO ĐỘ PHỨC TẠP — 3 TRẠM · FIT → ĐO → CHỌN THEO CHECK',
        table_sub: 'complexity_demo · 24 train + 20 held-out',
        idle_sub: '24 train + 20 held-out · ▶ chạy để fit [1,3,12], đo và chọn theo check',
        run_label: '▶ Chạy 3 trạm',
        table: {
          name: 'complexity_demo',
          columns: ['x', 'y'],
          dataRows: [
            ['0.43', '29.0'], ['1.24', '36.7'], ['1.35', '44.2'], ['1.91', '38.2'], ['2.74', '40.3'],
            ['3.30', '45.4'], ['3.53', '41.5'], ['4.53', '35.5'], ['4.68', '42.5'], ['4.82', '46.3'],
            ['5.45', '40.0'], ['6.34', '39.9'], ['7.41', '37.6'], ['9.50', '41.0'], ['9.57', '41.5']
          ]
        }
      },

      /* ----- STEP 4: tự viết vòng lặp so bậc. Grader: grade_lesson14
         (cần load_complexity_demo + fit_polynomial_model + vòng lặp; results 3 bậc train/check đúng;
         best_degree theo CHECK; Risk bắt leakage/chọn theo train; Behavior dataset ẩn tuyến tính → best đổi). ----- */
      step_4: {
        prompt: 'Bước 3 bạn lắp đường ống. Giờ tự viết nó bằng <strong>vòng lặp</strong>: với mỗi bậc trong <code>[1, 3, 12]</code>, fit model <strong>chỉ trên train</strong>, đo <strong>cả</strong> train MSE và check MSE, lưu vào <code>results</code>, rồi chọn <code>best_degree</code> theo <strong>check MSE</strong> nhỏ nhất. Hệ thống chấm còn thử một <strong>dataset ẩn</strong> (đường thật tuyến tính) — luật chọn của bạn phải tự đổi theo, không hard-code.',
        context: {
          scenario: 'Hai nguyên tắc bất di bất dịch: (1) <strong>held-out là bất khả xâm phạm</strong> — 20 điểm check chỉ để ĐO, tuyệt đối không đưa vào <code>fit</code>; đưa vào là <strong>leakage</strong>, điểm đẹp mà vô nghĩa. (2) <strong>Chọn theo check, không theo train</strong> — train MSE luôn giảm khi tăng bậc nên chọn theo nó sẽ luôn ra model phức tạp nhất (overfit). Điểm ngọt nằm ở đáy chữ U của check MSE.',
          real_world: 'Đây là vòng lặp chọn model (model selection) cốt lõi của mọi dự án ML: thử vài mức độ phức tạp, đánh giá trên dữ liệu để dành ra, chọn cái tổng quát tốt nhất. Cùng khuôn mẫu này áp cho việc chọn số tầng mạng nơ-ron, độ sâu cây, hay hệ số điều chuẩn — chỉ đổi "bậc đa thức" thành siêu tham số khác.',
          steps: [
            'Nạp <code>X_train, y_train, X_check, y_check</code> bằng <code>load_complexity_demo()</code>.',
            'Lặp qua <code>[1, 3, 12]</code>: fit trên train, đo <code>compute_mse</code> trên cả train và check.',
            'Lưu mỗi bậc vào <code>results</code> (degree, train_mse, check_mse) — không đụng check khi fit.',
            'Chọn <code>best_degree</code> theo check MSE nhỏ nhất · in ra · Run · Submit chấm 4 tầng.'
          ],
          hint_explore: 'Muốn soi trước? In <code>results</code> để thấy cả 3 cặp — train tụt đều nhưng check hình chữ U, đáy ở bậc 3.',
          expected: 'Console cho thấy bậc 3 có check MSE nhỏ nhất (8.2) → <code>best_degree = 3</code>. Đủ 4 tầng xanh. Thử chọn theo train MSE? Ra bậc 12 — nhưng tầng Risk sẽ chỉ ra đó là phần thưởng cho học thuộc lòng.'
        },
        hints: [
          { level: 1, text: 'Bốn việc: nạp dữ liệu → lặp [1,3,12] fit trên train → đo train & check MSE → chọn best theo CHECK. Không đưa check vào fit.' },
          { level: 2, text: 'Đầu bài: <code>from ml_lab import load_complexity_demo, fit_polynomial_model, compute_mse</code>, rồi <code>X_train, y_train, X_check, y_check = load_complexity_demo()</code>. Dùng vòng <code>for d in [1, 3, 12]:</code>.' },
          { level: 3, text: 'Trong vòng lặp:<br><code>m = fit_polynomial_model(X_train, y_train, d)</code><br><code>tr = compute_mse(y_train, m.predict(X_train))</code><br><code>ck = compute_mse(y_check, m.predict(X_check))</code><br><code>results.append({"degree": d, "train_mse": tr, "check_mse": ck})</code><br>Chọn: <code>best_degree = min(results, key=lambda r: r["check_mse"])["degree"]</code>.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>from ml_lab import load_complexity_demo, fit_polynomial_model, compute_mse<br>X_train, y_train, X_check, y_check = load_complexity_demo()<br>results = []<br>for d in [1, 3, 12]:<br>&nbsp;&nbsp;&nbsp;&nbsp;m = fit_polynomial_model(X_train, y_train, d)<br>&nbsp;&nbsp;&nbsp;&nbsp;tr = compute_mse(y_train, m.predict(X_train))<br>&nbsp;&nbsp;&nbsp;&nbsp;ck = compute_mse(y_check, m.predict(X_check))<br>&nbsp;&nbsp;&nbsp;&nbsp;results.append({"degree": d, "train_mse": tr, "check_mse": ck})<br>best_degree = min(results, key=lambda r: r["check_mse"])["degree"]<br>print("best_degree =", best_degree)</code>' }
        ],
        grader_fn: 'grade_lesson14',
        success_message: 'Chọn model đúng cách — best_degree = 3 theo CHECK MSE, không mắc bẫy bậc 12. Bạn vừa nắm nguyên tắc nền của generalization: đo trên dữ liệu chưa thấy, chọn độ phức tạp vừa vặn, giữ held-out sạch khỏi fit. Bài 15 — bài cuối khóa cơ bản — dựng đúng cái "dữ liệu chưa thấy" đó: chia Train / Validation / Test cho tử tế, và bịt mọi lỗ rò rỉ.',
        xp_reward: 50
      }
    },
    {
      id: 'c1_l15',
      index: 15,
      title: 'Chia Train / Validation / Test',
      subtitle: 'Ba phòng, ba việc — và bịt mọi lỗ rò rỉ: học thống kê chỉ trên train, niêm phong test tới phút cuối',
      module: 14,
      module_title: 'M5 — Tổng quát hóa',
      estimated_minutes: 19,
      xp_reward: 50,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      story: {
        tag: '🎯 StudyLab · Ticket #15 · CHỐT KHÓA CƠ BẢN',
        hook: 'Bài trước dạy một chân lý: chỉ <strong>dữ liệu chưa thấy</strong> mới nói được model có tổng quát hay không. Ticket cuối cùng của khóa dựng đúng cái "dữ liệu chưa thấy" ấy cho tử tế. Ta chia 1000 học viên vào <strong>ba phòng</strong>: <strong>Train</strong> (600, để model học), <strong>Validation</strong> (200, để ta chọn giữa các phương án), và một <strong>Két Test khóa kín</strong> (200, chỉ mở đúng một lần ở cuối để báo cáo). Nghe đơn giản, nhưng có hai cái bẫy rò rỉ tinh vi làm mọi con số đánh giá trở nên dối trá — và một phép tính tỉ lệ mà rất nhiều người làm sai. Đây là kỹ năng vệ sinh dữ liệu tách người nghiệp dư khỏi người chuyên nghiệp.'
      },
      achievement: { name: 'Generalization — chia dữ liệu sạch', desc: 'gán đúng vai train/validation/test, phát hiện leakage (scale-trước-split, tune-trên-test), và tạo split 60/20/20 stratified tái lập được' },

      step_1: {
        you_will_learn: {
          lead: 'Xong bài này (và xong khóa cơ bản!), bạn sẽ:',
          outcomes: [
            'Gán đúng <strong>ba vai</strong>: train <strong>học</strong> tham số · validation <strong>chọn</strong> quyết định · test <strong>báo cáo</strong> cuối (mở một lần).',
            'Phát hiện <strong>hai kiểu rò rỉ</strong>: học thống kê (scaler) <strong>trước khi split</strong>, và <strong>chỉnh model dựa trên test</strong>.',
            'Tính đúng tỉ lệ (<strong>25% của 80% = 20% gốc</strong>) và tạo split <strong>stratified, tái lập được</strong> bằng 2 lần <code>train_test_split</code>.'
          ]
        },
        glossary: [
          { term: 'TRAIN SET', vi: 'tập huấn luyện', accent: '#34D399',
            def: 'Phần dữ liệu model <b>được nhìn để học</b> tham số (weights). 60% ở đây = 600 dòng.',
            ex: 'model.fit(X_train, y_train) — chỉ tập này đi vào fit.',
            out: 'nơi DUY NHẤT model được học' },
          { term: 'VALIDATION SET', vi: 'tập kiểm định', accent: '#FBBF24',
            def: 'Phần để <b>so sánh và chọn</b>: model nào, ngưỡng nào, siêu tham số nào. 20% = 200 dòng.',
            ex: 'chọn bậc đa thức (Bài 14) hay ngưỡng phân loại dựa trên validation.',
            out: 'nơi ra QUYẾT ĐỊNH — không dùng để fit' },
          { term: 'TEST SET', vi: 'tập kiểm tra cuối', accent: '#F87171',
            def: 'Phần <b>niêm phong</b>, chỉ mở <b>một lần cuối</b> để báo cáo con số trung thực. 20% = 200 dòng.',
            ex: 'chạm vào nó lúc chọn model = tự lừa mình về hiệu năng thật.',
            out: 'Két khóa 🔒 — không tune, không peek' },
          { term: 'DATA LEAKAGE', vi: 'rò rỉ dữ liệu', accent: '#FB923C',
            def: '<b>Thông tin của tương lai</b> (val/test) lọt vào quá trình training — điểm đẹp mà giả.',
            ex: 'fit scaler trên TOÀN bộ trước khi split → mean/std đã "thấy" val+test.',
            out: '⚠ kẻ thù thầm lặng — số liệu trông tốt nhưng dối' },
          { term: 'STRATIFY', vi: 'phân tầng', accent: '#38BDF8',
            def: 'Chia sao cho <b>tỉ lệ lớp giữ nguyên</b> ở cả ba tập (ở đây Đậu ≈ 70% khắp nơi).',
            ex: 'stratify=y — tránh việc test lỡ toàn Đậu hoặc toàn Rớt.',
            out: 'đánh giá công bằng trên phân bố thật' },
          { term: 'RANDOM_STATE', vi: 'hạt giống', accent: '#A78BFA',
            def: 'Số cố định hạt giống ngẫu nhiên → split <b>tái lập y hệt</b> mỗi lần chạy.',
            ex: 'random_state=42 — hôm nay và mai chia ra đúng cùng 600 dòng train.',
            out: 'thí nghiệm lặp lại được — nền của khoa học' }
        ],
        primer: {
          goal: [
            'Train học · Validation chọn · Test niêm phong',
            'Rò rỉ: scale-trước-split & tune-trên-test',
            'Tỉ lệ: 25% của 80% = 20% gốc · stratify + seed'
          ],
          intro: '',
          example: '🔍 <strong>Trong ống kính bên dưới:</strong> 1000 học viên chảy vào ba phòng — <strong>Train</strong> (600), <strong>Validation</strong> (200) và <strong>Két Test</strong> khóa kín (200). Kéo hai thanh tỉ lệ để thấy số dòng đổi theo, và để ý <strong>tỉ lệ Đậu 70%</strong> được giữ nguyên ở cả ba phòng (đó là stratify). Bật <strong>mô phỏng rò rỉ</strong> để thấy điều gì xảy ra khi ta học thống kê trước khi chia. Giữ ý này sang Bước 2 👇'
        },
        intro: 'Model chỉ được đánh giá trung thực nếu con số cuối cùng đến từ dữ liệu nó <strong>chưa hề chạm vào</strong> — trực tiếp hay gián tiếp. "Gián tiếp" là chỗ hầu hết sai lầm nằm ở đó: nếu ta chuẩn hóa dữ liệu bằng thống kê tính trên cả tập, thì mean/std đã mang thông tin của test vào train; nếu ta chọn ngưỡng dựa trên test, thì test không còn "chưa thấy" nữa. Ba phòng tách bạch và một quy trình sạch — split trước, học thống kê sau, niêm phong test tới cuối — là cách bảo vệ sự trung thực đó. Đây là bài chốt khóa cơ bản: bộ khung để mọi thứ bạn học ở M1–M4 được đánh giá đàng hoàng.',
        concept_cards: [
          {
            icon: 'fa-door-open',
            title: 'Ba phòng, ba việc khác nhau',
            body: '<strong>Train</strong> (600) là nơi DUY NHẤT model được fit — nó học weights ở đây. <strong>Validation</strong> (200) là nơi ta <strong>so sánh và chọn</strong>: model nào tốt hơn, ngưỡng nào hợp, bậc mấy (Bài 14 chọn bậc chính là dùng validation). <strong>Test</strong> (200) bị <strong>niêm phong</strong>, chỉ mở đúng một lần ở cuối để lấy con số báo cáo. Trộn vai — ví dụ chọn model dựa trên test — là tự đánh mất thước đo trung thực duy nhất.'
          },
          {
            icon: 'fa-faucet-drip',
            title: 'Hai kiểu rò rỉ làm số liệu dối',
            body: '<strong>(1) Scale trước split:</strong> nếu <code>fit</code> scaler trên cả 1000 dòng rồi mới chia, thì mean/std đã "nhìn thấy" val+test — thống kê tương lai rò vào train. Đúng cái Bài 5–6 cảnh báo: học thống kê phải <strong>trên train</strong>, rồi transform phần còn lại. <strong>(2) Tune trên test:</strong> chỉnh ngưỡng/siêu tham số dựa trên test khiến test hết "chưa thấy". Cả hai đều cho điểm đẹp mà <strong>giả</strong>.'
          },
          {
            icon: 'fa-percent',
            title: 'Tỉ lệ: 25% của 80%, và seed + stratify',
            body: 'Muốn 60/20/20 bằng hai lần split: lần 1 tách <strong>20% test</strong>, còn 80% (800 dòng). Lần 2 phải lấy <strong>25% của 800</strong> để ra 200 validation — vì <code>0.25 × 800 = 200 = 20%</code> gốc. Lấy nhầm 0.20 chỉ ra 160 (16% gốc). Và luôn kèm <code>random_state</code> (tái lập) + <code>stratify</code> (giữ tỉ lệ Đậu 70% ở cả ba phòng).'
          }
        ],
        /* Hero = ỐNG KÍNH 3 PHÒNG (user chốt 2026-07-22) */
        split_lens: {
          title: 'ỐNG KÍNH 3 PHÒNG — TRAIN · VALIDATION · TEST 🔒',
          intro: '1000 học viên chia vào ba phòng. Kéo <b>test</b> và <b>val</b> để thấy số dòng đổi; tỉ lệ <b>Đậu 70%</b> giữ nguyên ở cả ba (stratify). Bật <b>mô phỏng rò rỉ</b> để thấy học thống kê trước khi chia làm hỏng mọi thứ. Trả lời câu chốt để mở Bước 2.',
          total: 1000, pos_ratio: 0.70,
          test_size: 0.20, val_size: 0.25,
          test_range: [0.10, 0.40], val_range: [0.10, 0.40],
          riddle: {
            prompt: 'Bạn đã tách <b>20% làm test</b>, còn lại 800 dòng (80% gốc). Muốn <b>Validation</b> cũng bằng <b>20% của 1000 gốc</b> (tức 200 dòng), <code>test_size</code> của lần split thứ hai (trên 800 dòng) phải là bao nhiêu?',
            options: ['0.25 — vì 0.25 × 800 = 200 = 20% gốc', '0.20 — vì ta muốn 20%', '0.40 — để bù lại phần đã mất', '0.16 — vì 20% của 80%'],
            answer: '0.25 — vì 0.25 × 800 = 200 = 20% gốc',
            wrong: {
              '0.20 — vì ta muốn 20%': 'Gần đúng ý nhưng sai phép tính. 0.20 áp lên <b>800</b> (không phải 1000) chỉ ra 0.20 × 800 = <b>160</b> dòng = 16% gốc, thiếu 40. Vì lần 2 chia trên tập đã nhỏ đi, phần trăm phải LỚN hơn để bù.',
              '0.40 — để bù lại phần đã mất': 'Quá tay: 0.40 × 800 = 320 dòng = 32% gốc, thừa nhiều. Con số đúng để 800 cho ra 200 là 200/800 = <b>0.25</b>.',
              '0.16 — vì 20% của 80%': 'Ngược chiều rồi. "20% của 80%" = 16% chính là KẾT QUẢ sai ta muốn TRÁNH. Ta cần tỉ lệ để 800 dòng nhả ra 200, tức 200/800 = 0.25.'
            },
            done: '✅ Đúng — <b>test_size = 0.25</b> cho lần split thứ hai, vì 0.25 × 800 = 200. Mẹo nhớ: sau khi cắt test, tập tạm nhỏ đi nên tỉ lệ val phải tính LẠI trên tập tạm, không phải trên tổng gốc. Ba điều khép bài (và khép khóa): (1) <b>ba phòng ba việc</b> — train học, val chọn, test niêm phong; (2) <b>split TRƯỚC</b>, học thống kê SAU (chống rò rỉ); (3) luôn <b>random_state + stratify</b>. Xuống Bước 2 👇'
          }
        },
        visual: {
          schema: {
            table_name: 'split_dataset (1000 học viên · nhị phân 70/30)',
            columns: [
              { name: 'features', type: '3 cột · study/attend/quiz', key: 'X', icon: '📊',
                note: '<strong>Đặc trưng</strong> — 3 cột số. Mọi bước học thống kê từ chúng (scaler…) phải fit <strong>chỉ trên train</strong>.' },
              { name: 'pass_fail', type: 'INT 0/1 · 70% Đậu', key: 'TARGET', icon: '🎯',
                note: '<strong>Nhãn nhị phân</strong> — 700 Đậu / 300 Rớt. stratify giữ đúng tỉ lệ 70% này ở cả ba phòng.' },
              { name: 'row_id', type: 'index 0–999', key: 'ID', icon: '🔑',
                note: '<strong>Mã dòng ổn định</strong> — dùng để kiểm ba tập <strong>không giẫm chân nhau</strong>: hợp lại phải đủ trọn 1000 mã.' }
            ]
          },
          data_preview: [
            ['1000 gốc', 'Đậu 70%', '— nguồn'],
            ['test 0.20', '→ 200', 'niêm phong 🔒'],
            ['còn 800', '80% gốc', 'tập tạm'],
            ['val 0.25×800', '→ 200', '20% gốc'],
            ['train', '→ 600', '60% gốc']
          ]
        },
        mission: 'Dựng <code class="code">CHIA 3 PHÒNG</code>: <code class="code">tách TEST 0.20</code> (stratify + seed) → <code class="code">tách VAL 0.25 từ phần còn lại</code> → <code class="code">niêm phong + kiểm 600/200/200</code> — kho có <code class="code">mồi bẫy 🪤</code> (0.20 lần 2 = 16% · scale trước split) ↓'
      },

      /* ----- STEP 2: 3 MCQ (vai train · safe/leakage · tỉ lệ 0.25) + mini-game SAFE vs LEAKAGE ----- */
      step_2: {
        mcq: [
          {
            question: 'Trong ba tập train / validation / test, tập nào được model dùng để <strong>học tham số (weights)</strong>?',
            options: [
              { id: 'a', text: 'Train — đây là tập DUY NHẤT đi vào lời gọi fit', correct: true, explanation: 'Đúng — chỉ train được fit. Validation để chọn quyết định (so sánh model/ngưỡng), test để báo cáo cuối. Nếu val hay test cũng đi vào fit thì chúng mất vai trò "chưa thấy".' },
              { id: 'b', text: 'Validation — vì nó kiểm định model', correct: false, explanation: 'Validation KHÔNG được fit. Nó chỉ để so sánh và chọn (model nào, ngưỡng nào). Fit trên nó là trộn vai train.' },
              { id: 'c', text: 'Test — vì nó là chuẩn cuối cùng', correct: false, explanation: 'Test tuyệt đối không fit, cũng không tune. Nó bị niêm phong, chỉ mở một lần cuối để báo cáo.' },
              { id: 'd', text: 'Cả ba, để model học từ nhiều dữ liệu nhất', correct: false, explanation: 'Đó là công thức tự lừa mình: nếu model học từ cả ba, sẽ không còn tập nào "chưa thấy" để đánh giá trung thực.' }
            ]
          },
          {
            question: 'Bạn <code>fit</code> một StandardScaler trên <strong>toàn bộ 1000 dòng</strong> rồi mới chia train/val/test. An toàn hay rò rỉ?',
            options: [
              { id: 'a', text: 'Rò rỉ — mean/std đã tính từ cả val+test rồi rót vào train', correct: true, explanation: 'Chuẩn — scaler học mean/std từ cả 1000 dòng, nghĩa là thống kê của val+test đã ảnh hưởng cách chuẩn hóa train. Đúng cái Bài 5–6 cảnh báo: fit thống kê CHỈ trên train, rồi transform phần còn lại.' },
              { id: 'b', text: 'An toàn — vì scaler chỉ đổi thang đo, không phải model', correct: false, explanation: 'Scaler cũng HỌC từ dữ liệu (mean, std). Học trên cả tập = leakage, bất kể nó "chỉ" chuẩn hóa. Shape vẫn đẹp nên bẫy này rất khó thấy.' },
              { id: 'c', text: 'An toàn — miễn là sau đó vẫn chia đúng 60/20/20', correct: false, explanation: 'Chia đúng tỉ lệ không cứu được leakage đã xảy ra ở bước scale. Thứ tự mới quan trọng: split TRƯỚC, fit scaler SAU.' },
              { id: 'd', text: 'Rò rỉ, nhưng không đáng kể nên bỏ qua được', correct: false, explanation: 'Với dữ liệu này có thể nhỏ, nhưng thói quen thì nguy hiểm: trong nhiều bài toán leakage kiểu này thổi phồng điểm đánh giá rất mạnh. Luôn split trước.' }
            ]
          },
          {
            question: 'Đã tách 20% làm test (còn 800 dòng). Để validation cũng bằng 20% của 1000 gốc, <code>test_size</code> lần split thứ hai (trên 800) là bao nhiêu?',
            options: [
              { id: 'a', text: '0.25 — vì 0.25 × 800 = 200 = 20% của 1000', correct: true, explanation: 'Đúng — lần 2 chia trên 800, nên để ra 200 dòng cần 200/800 = 0.25. Tập tạm đã nhỏ đi nên phần trăm phải lớn hơn 0.20.' },
              { id: 'b', text: '0.20 — vì muốn 20%', correct: false, explanation: '0.20 × 800 = 160, chỉ 16% gốc. Đây là cái bẫy tỉ lệ kinh điển: áp 20% lên tập đã bị cắt nhỏ.' },
              { id: 'c', text: '0.16 — 20% của 80%', correct: false, explanation: '16% là kết quả SAI cần tránh, không phải test_size cần đặt. Ta cần 200/800 = 0.25.' },
              { id: 'd', text: '0.50 — chia đôi phần còn lại', correct: false, explanation: '0.50 × 800 = 400 = 40% gốc, quá nhiều cho validation. Con số đúng là 0.25.' }
            ]
          }
        ],
        mini_game: {
          title: 'SAFE hay LEAKAGE?',
          instruction: 'Kéo mỗi thao tác vào đúng ngăn: <strong>✅ SAFE</strong> (giữ test/val trong sạch) · <strong>💧 LEAKAGE</strong> (thông tin tương lai rò vào).',
          chips: [
            { id: 's-split-first', label: 'split TRƯỚC rồi fit scaler trên train' },
            { id: 's-val-select',  label: 'chọn model theo điểm VALIDATION' },
            { id: 's-test-once',   label: 'mở test đúng 1 lần để báo cáo cuối' },
            { id: 'l-scale-all',   label: 'fit scaler trên TOÀN data rồi mới split' },
            { id: 'l-tune-test',   label: 'chỉnh ngưỡng dựa trên điểm TEST' },
            { id: 'l-peek-test',   label: 'chọn model theo điểm TEST' }
          ],
          bins: [
            { id: 'safe', label: '✅ SAFE',    correct: 'true' },
            { id: 'leak', label: '💧 LEAKAGE', correct: 'true' }
          ],
          solution: {
            's-split-first': 'safe', 's-val-select': 'safe', 's-test-once': 'safe',
            'l-scale-all': 'leak', 'l-tune-test': 'leak', 'l-peek-test': 'leak'
          },
          success: 'Chuẩn — ba việc SAFE đều giữ test/val ở vai "chưa thấy": split trước rồi mới học thống kê, chọn model bằng validation, và chỉ mở test một lần cuối. Ba việc LEAKAGE đều để thông tin tương lai rò ngược: scale toàn data trộn mean/std, còn tune/chọn dựa trên test biến test thành một tập validation trá hình. Bước 3: lắp đúng đường ống tách test → tách val → niêm phong.'
        }
      },

      /* ----- STEP 3: map 3 TRẠM — tách test → tách val → niêm phong. 2 mồi bẫy: 0.20 lần 2 / scale trước split ----- */
      step_3: {
        ml_pipeline: true,
        blocks: [
          { type: 'py', token: 'X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.20, stratify=y, random_state=42)', slot: 'b1' },
          { type: 'py', token: 'X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.25, stratify=y_temp, random_state=42)', slot: 'b2' },
          { type: 'py', token: 'assert len(X_train) == 600 and len(X_val) == 200 and len(X_test) == 200', slot: 'b3' },
          /* 2 mồi bẫy */
          { type: 'py', token: 'X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.20, stratify=y_temp, random_state=42)', slot: 't1' },
          { type: 'py', token: 'X_scaled = StandardScaler().fit_transform(X)', slot: 't2' }
        ],
        drop_zones: [
          { id: 'l15-test', accepts: ['py'], multi: false },
          { id: 'l15-val', accepts: ['py'], multi: false },
          { id: 'l15-seal', accepts: ['py'], multi: false }
        ],
        ml_flow: {
          brand: 'CHIA 3 PHÒNG — 3 TRẠM · TÁCH TEST → TÁCH VAL → NIÊM PHONG',
          layout: 'branch',
          run_label: '▶ Chạy 3 trạm',
          source: { sub: 'split_dataset · 1000 học viên · Đậu 70% · mục tiêu 600/200/200' },
          done_note: 'Đường ống chia sạch: tách TEST 20% trước (niêm phong ngay, stratify + random_state) → tách VAL bằng 0.25 của 800 còn lại (ra đúng 200 = 20% gốc) → kiểm 600/200/200 không giẫm nhau, Đậu 70% khắp ba phòng. Hai mồi bẫy: test_size=0.20 cho lần 2 (chỉ ra 160 = 16% gốc) và fit scaler trên TOÀN data trước khi split (leakage — mean/std rò từ val+test vào train). Bước 4 tự viết 2 lần split.',
          stations: [
            {
              zones: ['l15-test'],
              icon: '🔒', label: 'TRẠM 1 — TÁCH TEST', sub: '20% niêm phong trước tiên', result_kind: 'split_rooms',
              sr: {
                mode: 'test', total: 1000, pos_ratio: 0.70, n_train: 600, n_val: 200, n_test: 200,
                note: '<code>train_test_split(X, y, test_size=0.20, stratify=y, random_state=42)</code> — cắt <b>200</b> dòng làm test và <b>niêm phong ngay</b>, còn 800 dòng tạm. Tách test SỚM để chắc chắn nó không dính vào bất kỳ bước nào sau. stratify giữ Đậu 70%; random_state để tái lập.'
              },
              narration: 'Test tách đầu tiên và khóa lại luôn — đó là kỷ luật. Càng để lâu mới tách, càng dễ vô tình cho nó rò vào quá trình.'
            },
            {
              zones: ['l15-val'],
              icon: '🎛', label: 'TRẠM 2 — TÁCH VAL', sub: '0.25 của 800 = 200', result_kind: 'split_rooms',
              sr: {
                mode: 'val', total: 1000, pos_ratio: 0.70, n_train: 600, n_val: 200, n_test: 200,
                note: '<code>train_test_split(X_temp, y_temp, test_size=0.25, stratify=y_temp, random_state=42)</code> — chia 800 dòng tạm thành <b>600 train</b> + <b>200 val</b>. Chú ý <b>0.25</b> (không phải 0.20): vì 0.25 × 800 = 200 = đúng 20% của 1000 gốc.'
              },
              narration: 'Đây là chỗ dễ sai tỉ lệ nhất: tập tạm đã nhỏ đi còn 800, nên muốn 200 val phải lấy 0.25 chứ không phải 0.20 (0.20 chỉ ra 160).'
            },
            {
              zones: ['l15-seal'],
              icon: '✅', label: 'TRẠM 3 — NIÊM PHONG', sub: 'kiểm 600/200/200 · Đậu 70%', result_kind: 'split_rooms',
              sr: {
                mode: 'seal', total: 1000, pos_ratio: 0.70, n_train: 600, n_val: 200, n_test: 200,
                note: '<code>assert len(X_train) == 600 and len(X_val) == 200 and len(X_test) == 200</code> — ba phòng đủ 600/200/200, hợp lại trọn 1000 mã dòng, không giẫm nhau; tỉ lệ Đậu ≈ 70% ở cả ba (stratify). Test giờ khóa kín tới báo cáo cuối.'
              },
              narration: 'Split xong và sạch: train để học, validation để chọn, test niêm phong. Mọi bước học thống kê (scaler…) từ đây chỉ được fit trên TRAIN.'
            }
          ]
        },
        expected_sql: 'X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.20, stratify=y, random_state=42) X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.25, stratify=y_temp, random_state=42) assert len(X_train) == 600 and len(X_val) == 200 and len(X_test) == 200',
        expected_zones: {
          'l15-test': 'X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.20, stratify=y, random_state=42)',
          'l15-val': 'X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.25, stratify=y_temp, random_state=42)',
          'l15-seal': 'assert len(X_train) == 600 and len(X_val) == 200 and len(X_test) == 200'
        },
        reveal_hints: {
          'l15-test': 'Trạm 1: tách TEST trước, 20% + stratify + random_state — <strong>train_test_split(X, y, test_size=0.20, stratify=y, random_state=42)</strong>.',
          'l15-val': 'Trạm 2: tách VAL từ phần còn lại, dùng 0.25 (không phải 0.20) — <strong>train_test_split(X_temp, y_temp, test_size=0.25, stratify=y_temp, random_state=42)</strong>.',
          'l15-seal': 'Trạm 3: niêm phong + kiểm kích thước — <strong>assert len(X_train) == 600 and len(X_val) == 200 and len(X_test) == 200</strong>.'
        }
      },

      drag_map: {
        brand: 'CHIA 3 PHÒNG — 3 TRẠM · TÁCH TEST → TÁCH VAL → NIÊM PHONG',
        table_sub: 'split_dataset · 1000 học viên · Đậu 70%',
        idle_sub: '1000 học viên · ▶ chạy để tách test, tách val và niêm phong 600/200/200',
        run_label: '▶ Chạy 3 trạm',
        table: {
          name: 'split_dataset',
          columns: ['features (3)', 'pass_fail'],
          dataRows: [
            ['study 7.2 · att 8 · quiz 6', '1'], ['study 3.1 · att 4 · quiz 3', '0'],
            ['study 9.0 · att 9 · quiz 8', '1'], ['study 5.5 · att 6 · quiz 5', '1'],
            ['study 2.0 · att 3 · quiz 2', '0'], ['study 8.4 · att 7 · quiz 9', '1'],
            ['study 6.1 · att 6 · quiz 4', '1'], ['study 1.5 · att 2 · quiz 1', '0'],
            ['study 7.8 · att 8 · quiz 7', '1'], ['study 4.2 · att 5 · quiz 6', '1'],
            ['study 9.5 · att 9 · quiz 9', '1'], ['study 3.7 · att 4 · quiz 3', '0'],
            ['study 6.6 · att 7 · quiz 5', '1'], ['study 2.9 · att 3 · quiz 4', '0'],
            ['… 1000 dòng · Đậu 70%', '…']
          ]
        }
      },

      /* ----- STEP 4: tự viết 2 lần split. Grader: grade_lesson15
         (2 train_test_split + random_state + stratify; 600/200/200 không giẫm; Đậu 0.70; Risk bắt
         fit-scaler-trước-split leakage; Behavior chạy lại tái lập y hệt). ----- */
      step_4: {
        prompt: 'Bài cuối khóa. Chia 1000 học viên thành <strong>60/20/20</strong> bằng <strong>hai lần</strong> <code>train_test_split</code>: lần một tách <strong>20% test</strong> (niêm phong), lần hai tách <strong>validation</strong> từ phần còn lại. Cả hai lần đều cần <code>stratify</code> (giữ Đậu 70%) và <code>random_state</code> (tái lập). Nhớ tỉ lệ lần hai là <strong>0.25</strong>, và <strong>đừng</strong> học thống kê gì trước khi split.',
        context: {
          scenario: 'Bốn ràng buộc của một split sạch: (1) <strong>đúng 600/200/200</strong> — lần hai dùng <code>test_size=0.25</code> vì 25% của 800 mới ra 200; (2) <strong>không giẫm nhau</strong> — lần hai chia từ <code>X_temp</code>, không phải <code>X</code> gốc; (3) <code>stratify</code> cả hai lần để Đậu ≈ 70% khắp ba phòng; (4) <code>random_state</code> cả hai lần để chạy lại ra y hệt. Cạm bẫy lớn nhất: <strong>fit preprocessing trước khi split</strong> — mọi scaler/thống kê phải đợi tới sau, và chỉ học trên train.',
          real_world: 'Đây là bước đầu tiên của gần như mọi pipeline ML nghiêm túc — trước cả khi chọn model. Một split rò rỉ khiến toàn bộ đánh giá về sau trở nên vô nghĩa: bạn tưởng model đạt 95% nhưng thực tế 80%, và chỉ phát hiện khi đã triển khai. Chia dữ liệu sạch là hợp đồng trung thực giữa bạn và con số cuối cùng.',
          steps: [
            'Nạp <code>X, y</code> bằng <code>load_split_dataset()</code> (1000 dòng, Đậu 70%).',
            'Lần 1: tách <strong>20% làm test</strong> (niêm phong ngay), giữ 80% còn lại làm tập tạm — nhớ kèm <code>stratify</code> và <code>random_state</code>.',
            'Lần 2: từ <strong>tập tạm</strong>, tách validation sao cho bằng <strong>20% của 1000 gốc</strong> — tỉ lệ phải tính lại trên tập tạm (đã nhỏ đi), vẫn <code>stratify</code> + <code>random_state</code>.',
            'In <code>len(X_train), len(X_val), len(X_test)</code> · Run · Submit chấm 4 tầng.'
          ],
          hint_explore: 'Muốn soi trước? In <code>len(X_train), len(X_val), len(X_test)</code> — phải là 600 200 200. Nếu ra 640 160 200 thì lần hai đang dùng 0.20 thay vì 0.25.',
          expected: 'Console in <code>600 200 200</code>. Đủ 4 tầng xanh. Thử fit scaler trước khi split? Kích thước vẫn đẹp nhưng tầng Risk sẽ chỉ ra thống kê đã rò rỉ.'
        },
        hints: [
          { level: 1, text: 'Bốn việc: nạp dữ liệu → tách 20% test → tách val (0.25 của phần còn lại) → in kích thước. Không fit gì trước split; cả hai lần đều random_state + stratify.' },
          { level: 2, text: 'Đầu bài: <code>from sklearn.model_selection import train_test_split</code> và <code>from ml_lab import load_split_dataset</code>, rồi <code>X, y = load_split_dataset()</code>.' },
          { level: 3, text: 'Hai lần split:<br><code>X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.20, stratify=y, random_state=42)</code><br><code>X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.25, stratify=y_temp, random_state=42)</code><br>Lần 2 chia từ <code>X_temp</code>, dùng <code>0.25</code>.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>from sklearn.model_selection import train_test_split<br>from ml_lab import load_split_dataset<br>X, y = load_split_dataset()<br>X_temp, X_test, y_temp, y_test = train_test_split(<br>&nbsp;&nbsp;&nbsp;&nbsp;X, y, test_size=0.20, stratify=y, random_state=42)<br>X_train, X_val, y_train, y_val = train_test_split(<br>&nbsp;&nbsp;&nbsp;&nbsp;X_temp, y_temp, test_size=0.25, stratify=y_temp, random_state=42)<br>print(len(X_train), len(X_val), len(X_test))</code>' }
        ],
        grader_fn: 'grade_lesson15',
        success_message: 'Split sạch — 600/200/200, ba phòng không giẫm nhau, Đậu 70% khắp nơi, và chạy lại ra y hệt (random_state). Bạn vừa khép trọn KHÓA CƠ BẢN: từ đọc dữ liệu, dựng feature, fit hồi quy, đo lỗi, hạ gradient, phân loại bằng sigmoid và ranh giới, tới chẩn overfit và chia dữ liệu trung thực. Đây là bộ khung để mọi model bạn xây từ giờ được đánh giá đàng hoàng. Chúc mừng — nền tảng đã vững! 🎓',
        xp_reward: 50
      }
    }
  ]
};
