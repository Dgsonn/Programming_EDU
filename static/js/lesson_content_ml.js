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
            out: 'một bài toán ML được định khung đủ' }
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
            out: 'ID cụm 0/1/2 — tên TÙY Ý, không có thứ tự' }
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
              narration: '<code>regressor.fit(X, y_score)</code> khớp một ĐƯỜNG THẲNG qua 24 hồ sơ: mỗi feature nhận một trọng số. Dự đoán = cộng các đóng góp: 35.6 + 25.2 + 19.0 − 12.0 = <b>67.7 điểm</b>. Output là SỐ THỰC — lệch 2 hay 20 điểm đều có thể.'
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
        tag: '🎓 StudyLab · Ticket #04',
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
              { name: 'attendance', type: 'FLOAT · /10', key: '', icon: '',
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
        hook: 'Bảng đã sạch, nhưng Ticket #06 mở ra một cái bẫy tinh vi: 3 cột số <strong>chênh THANG khủng khiếp</strong>. <code>study_hours</code> chạy 0–10, <code>attendance_rate</code> 0–100, còn <code>activity_count</code> (số lượt bấm LMS) lên tới <strong>~2000</strong>. Bạn <strong>Nam</strong> chăm bấm LMS (1 971 lượt) nhưng chỉ tự học 3.1 giờ/tuần — và đã <strong>RỚT</strong>. Bạn <strong>Linh</strong> tự học 10 giờ/tuần, bấm LMS ít (152 lượt) — <strong>ĐẬU</strong>. Trớ trêu: model đo <strong>khoảng cách</strong> sẽ thấy Nam và Linh khác nhau gần như HOÀN TOÀN chỉ vì <code>activity_count</code> lệch 1 819 lượt — còn cái gap ~7 giờ học (thứ THẬT SỰ phân định Đậu/Rớt) thì bị <strong>át tiếng</strong>. Nhiệm vụ: SCALE 3 cột số về cùng âm lượng để không đơn vị nào lấn át.'
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
            ex: 'activity_count μ≈949, σ≈556 → giá trị 1 505 thành z≈+1.0 (trên trung bình 1 độ lệch).',
            out: 'mean≈0 · std≈1 · giữ hình dạng phân phối, ít bị 1 outlier bóp' },
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
        intro: 'Ba cột số đo ba thứ khác nhau bằng ba <strong>thang khác nhau</strong>. Model theo khoảng cách (như k-NN ở Bài 2) hay gradient chỉ nhìn <em>con số</em>, không hiểu "đơn vị": cột nào số lớn thì lấn át. Chuẩn hóa (scale) kéo mọi cột về cùng âm lượng — <strong>mean 0, std 1</strong> — để chúng đóng góp công bằng. Nhưng cẩn thận: chỉ scale <strong>feature số có nghĩa</strong>; đừng đụng vào ID, nhãn (target) hay cột chữ.',
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
            { name: 'attendance_rate', unit: '%', std: 17.69, mean: 68.5, range: '40 – 100',
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
              { name: 'attendance_rate', type: 'FLOAT · %', key: '', icon: '',
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
            question: 'Model k-NN đo <strong>khoảng cách</strong> giữa 2 học viên. <code>activity_count</code> (0–2000) chi phối gần như toàn bộ khoảng cách, còn <code>study_hours</code> (0–10) gần như vô hình. Vì sao?',
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
            question: 'Bảng có <code>student_id</code>, <code>study_hours</code>, <code>attendance_rate</code>, <code>activity_count</code>, <code>major</code>, <code>pass_fail</code>. Đưa cột nào vào <strong>StandardScaler</strong>?',
            options: [
              { id: 'a', text: 'Đúng 3 feature số: study_hours, attendance_rate, activity_count', correct: true, explanation: 'Chuẩn — chỉ scale feature SỐ có nghĩa. ID là định danh, major là chữ (cần encode), pass_fail là target — cả 3 đứng ngoài scaler.' },
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
            { id: 's-att',   label: 'attendance_rate (0–100)' },
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
          { type: 'py', token: 'numeric_cols = ["study_hours", "attendance_rate", "activity_count"]', slot: 'b1' },
          { type: 'py', token: 'X_scaled = StandardScaler().fit_transform(df[numeric_cols])', slot: 'b2' },
          { type: 'py', token: 'means, stds = X_scaled.mean(axis=0).round(2), X_scaled.std(axis=0).round(2)', slot: 'b3' },
          /* 2 mồi bẫy — Risk của grader: scale ID / scale target */
          { type: 'py', token: 'numeric_cols = ["student_id", "study_hours", "attendance_rate", "activity_count"]', slot: 't1' },
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
                  { col: 'attendance_rate', std: 17.7 },
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
                  { col: 'attendance_rate', before_std: 17.69, before_mean: 68.5, after_std: 1, after_mean: 0 },
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
                  { col: 'attendance_rate', after_std: 1, after_mean: 0 },
                  { col: 'activity_count', after_std: 1, after_mean: 0 }
                ],
                note: 'Tính <code>means = X_scaled.mean(axis=0)</code> ≈ [0, 0, 0] và <code>stds = X_scaled.std(axis=0)</code> ≈ [1, 1, 1] — bằng chứng scale đúng. Shape vẫn (200, 3): không mất dòng nào, chỉ đổi thang.'
              },
              narration: 'Luôn KIỂM sau khi biến đổi: mean mỗi cột ≈ 0, std ≈ 1 thì StandardScaler đã chạy đúng. Nếu một cột std ≠ 1, nghĩa là bạn quên đưa nó vào (hoặc lỡ đưa cột lạ vào).'
            }
          ]
        },
        expected_sql: 'numeric_cols = ["study_hours", "attendance_rate", "activity_count"] X_scaled = StandardScaler().fit_transform(df[numeric_cols]) means, stds = X_scaled.mean(axis=0).round(2), X_scaled.std(axis=0).round(2)',
        expected_zones: {
          'l6-cols':  'numeric_cols = ["study_hours", "attendance_rate", "activity_count"]',
          'l6-scale': 'X_scaled = StandardScaler().fit_transform(df[numeric_cols])',
          'l6-check': 'means, stds = X_scaled.mean(axis=0).round(2), X_scaled.std(axis=0).round(2)'
        },
        reveal_hints: {
          'l6-cols':  'Trạm 1: chỉ 3 feature số — <strong>numeric_cols = ["study_hours", "attendance_rate", "activity_count"]</strong> (KHÔNG có student_id/pass_fail).',
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
          columns: ['student_id', 'study_hours', 'attendance_rate', 'activity_count', 'major', 'pass_fail'],
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
          { level: 3, text: 'Chọn cột: <code>numeric_cols = ["study_hours", "attendance_rate", "activity_count"]</code> (KHÔNG có student_id/pass_fail). Scale: <code>X_scaled = StandardScaler().fit_transform(df[numeric_cols])</code>. Giữ biến <code>numeric_cols</code> để tầng Risk soi được cột nào bị scale.' },
          { level: 4, text: 'Đáp án đầy đủ:<br><code>from ml_lab import load_scaling_dataset<br>from sklearn.preprocessing import StandardScaler<br>df = load_scaling_dataset()<br>numeric_cols = ["study_hours", "attendance_rate", "activity_count"]<br>scaler = StandardScaler()<br>X_scaled = scaler.fit_transform(df[numeric_cols])<br>print(X_scaled.shape)<br>print(X_scaled.mean(axis=0).round(2))<br>print(X_scaled.std(axis=0).round(2))</code>' }
        ],
        grader_fn: 'grade_lesson6',
        success_message: 'Chuẩn — X_scaled (200, 3): mean ≈ 0 · std ≈ 1 mỗi cột, 3 feature cùng âm lượng, còn student_id/major/pass_fail đứng ngoài scaler. Bạn vừa gỡ cái bẫy "đơn vị to át tiếng". Bài 7: đọc dữ liệu bằng thống kê cơ bản — trung bình, độ lệch, tương quan.',
        xp_reward: 50
      }
    },
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
