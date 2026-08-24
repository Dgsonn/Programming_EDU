/* ============================================================================
 * lesson_content_ml_basic.js — Nội dung khóa "ML cơ bản" (bản dịu mắt).
 *
 * Cấu trúc mỗi bài:
 *   step_1: lý thuyết (text + heading + ul/ol, optional callout, optional compare-grid)
 *   step_2: trắc nghiệm — 1 câu hỏi, 4 đáp án, đáp án đúng + giải thích
 *   step_3: kéo thả — pool các chip, N vùng thả, mapping chip → zone đúng
 *   step_4: tự code — đề bài + code khởi đầu + test (hàm check chạy trong sandbox JS)
 *
 * 2026-08-15 (rework): nội dung dựng lại bám ĐÚNG chủ đề + mạch câu chuyện StudyLab của
 * Bài 1 và Bài 2 trong khóa gốc "Machine Learning Cơ bản" (static/js/lesson_content_ml.js,
 * id c1_l1/c1_l2) — chỉ rút gọn độ dài và bỏ phần cần Pyodide (glossary 6 thẻ, hero
 * timeline/flow SVG, bản đồ pipeline 4 trạm, code chấm 4 tầng). Engine hiển thị + cách
 * chấm vẫn giữ y hệt bản dịu mắt trước (JS thuần, không cần cài đặt).
 *
 * 2 bài (khớp đúng Bài 1 + Bài 2 gốc):
 *   L1: Machine Learning vs Lập trình truyền thống — luật viết sẵn vs học từ dữ liệu,
 *       khung Task–Experience–Performance, tự code "fit → predict" nearest-centroid.
 *   L2: Bài toán ML thuộc loại nào? — Regression / Classification / Clustering trên
 *       cùng 1 bảng dữ liệu, tự code hồi quy tuyến tính (y = a·x + b, MSE) cho phần Regression.
 *
 * Code được chấm bằng hàm `check(userCode)` — bên trong sandbox đánh giá không phụ thuộc
 * Python thật, dùng new Function + test cases. Đơn giản, không cần Pyodide.
 * ========================================================================== */

window.LESSON_CONTENT = window.LESSON_CONTENT || {};

window.LESSON_CONTENT['ml_basic'] = {
  course_id: 'ml_basic',
  course_title: 'ML cơ bản',
  accent_color: '#A78BFA',
  module_color: '#A78BFA',
  total_lessons: 2,
  lessons: [
    /* ════════════════════════════════════════════════════════════════════
       BÀI 1 — Machine Learning vs Lập trình truyền thống
       (rút gọn từ c1_l1 trong lesson_content_ml.js — giữ đúng câu chuyện StudyLab
       tuần 8, khung Task–Experience–Performance, pipeline fit→predict.)
       ════════════════════════════════════════════════════════════════════ */
    {
      id: 'b1_ml_vs_traditional',
      index: 1,
      title: 'Machine Learning vs Lập trình truyền thống',
      subtitle: 'Luật viết sẵn hay pattern học từ dữ liệu?',
      module: 'Bài 1',
      module_title: 'Bài 1 — Làm quen',
      estimated_minutes: 6,
      xp_reward: 30,

      /* ─── BƯỚC 1: LÝ THUYẾT ─── */
      step_1: {
        title: 'Lý thuyết',
        blocks: [
          {
            type: 'p',
            html: 'StudyLab đang ở <strong>tuần 8</strong> trong khóa học 15 tuần. Muốn biết '
                  + '<strong>ai đang trên đà rớt</strong> để kịp cứu, nhưng luật quen thuộc '
                  + '<code>if final_score >= 50</code> lại vô dụng — vì <code>final_score</code> '
                  + 'chỉ xuất hiện ở <strong>tuần 15</strong>, sau khi thi xong. Thứ duy nhất có '
                  + 'sẵn trong tay: <strong>12 hồ sơ khóa trước</strong> đã biết kết quả Đậu/Rớt. '
                  + 'Đây chính là ranh giới giữa lập trình truyền thống và Machine Learning.'
          },
          {
            type: 'stat',
            items: [
              { icon: '📍', value: 'Tuần 8', label: 'hiện tại — mới có giờ tự học, điểm danh, giữa kỳ' },
              { icon: '⏳', value: 'Tuần 15', label: 'lúc final_score mới tồn tại — quá muộn để cứu' },
              { icon: '🗂️', value: '12', label: 'hồ sơ khóa trước — dữ liệu duy nhất đang có sẵn' }
            ]
          },
          {
            type: 'table',
            caption: '📋 6/12 hồ sơ khóa trước (giờ tự học/tuần · điểm danh · điểm giữa kỳ · kết quả) — '
                     + 'trung bình đúng bằng <code>passAvg</code>/<code>failAvg</code> bạn sẽ dùng ở Bước 4.',
            headers: ['Học viên', 'Giờ tự học/tuần', 'Điểm danh', 'Giữa kỳ', 'Kết quả'],
            rows: [
              ['HV01', '8.4h', '97%', '88', '<strong style="color:var(--mlb-success)">Đậu</strong>'],
              ['HV02', '7.0h', '92%', '84', '<strong style="color:var(--mlb-success)">Đậu</strong>'],
              ['HV03', '8.0h', '96%', '87', '<strong style="color:var(--mlb-success)">Đậu</strong>'],
              ['HV04', '2.0h', '55%', '44', '<strong style="color:var(--mlb-error)">Rớt</strong>'],
              ['HV05', '3.0h', '62%', '52', '<strong style="color:var(--mlb-error)">Rớt</strong>'],
              ['HV06', '1.6h', '57%', '48', '<strong style="color:var(--mlb-error)">Rớt</strong>']
            ]
          },
          {
            type: 'compare',
            items: [
              {
                title: 'Lập trình truyền thống',
                icon: '📜',
                body: 'Con người viết <strong>luật (if/else)</strong>, máy chỉ áp dụng. Chạy được '
                      + 'vì <em>đáp án đã có sẵn</em>. Ví dụ: <code>if final_score >= 50: Đậu</code>.'
              },
              {
                title: 'Machine Learning',
                icon: '🌱',
                body: 'Con người đưa <strong>dữ liệu lịch sử kèm đáp án</strong>, máy '
                      + '<em>tự rút pattern</em> rồi dự đoán cho ca chưa có đáp án. Ví dụ: nhìn '
                      + '12 hồ sơ cũ để đoán học viên mới.'
              }
            ]
          },
          {
            type: 'h3',
            icon: 'fa-solid fa-puzzle-piece',
            text: '3 mảnh của một bài toán ML'
          },
          {
            type: 'ul',
            items: [
              '<strong>Task (việc cần làm):</strong> dự đoán Đậu/Rớt cho học viên ngay ở tuần 8 — '
              + 'trước khi quá muộn để cứu.',
              '<strong>Experience (kinh nghiệm để học):</strong> 12 hồ sơ khóa trước — đủ giờ tự học, '
              + 'điểm danh, điểm giữa kỳ và kết quả Đậu/Rớt đã biết.',
              '<strong>Performance (thước đo):</strong> tỉ lệ học viên mới được đoán đúng. '
              + 'Thiếu 1 trong 3 mảnh này thì chưa phải một bài toán ML hoàn chỉnh.'
            ]
          },
          {
            type: 'quote',
            text: '"Đến tuần 15 thì đã quá muộn để giúp các bạn ấy rồi. Chúng tôi cần biết sớm hơn — '
                  + 'kể cả khi phải chấp nhận đoán, thay vì chờ chắc chắn 100%."',
            author: 'Cố vấn học tập, dự án StudyLab'
          },
          {
            type: 'callout',
            html: '💡 Ở <strong>Bước 3</strong> bạn sẽ tự tay sắp xếp lại bài toán này vào đúng '
                  + '3 ô T–E–P; <strong>Bước 4</strong> tự viết code cho pipeline "học rồi đoán".'
          }
        ]
      },

      /* ─── BƯỚC 2: TRẮC NGHIỆM ─── */
      step_2: {
        title: 'Trắc nghiệm',
        question: 'StudyLab muốn cảnh báo <strong>"học viên đang trên đà rớt"</strong> ngay ở '
                  + '<strong>tuần 8</strong> — vừa có điểm giữa kỳ. Vì sao KHÔNG dùng được luật '
                  + '<code>if final_score >= 50</code>?',
        options: [
          { letter: 'A', text: 'Vì phép so sánh <code>&gt;=</code> không hoạt động với số thực.' },
          { letter: 'B', text: 'Vì <code>final_score</code> CHƯA TỒN TẠI ở tuần 8 — phải học pattern '
                                + 'từ 12 hồ sơ khóa trước để dự đoán.' },
          { letter: 'C', text: 'Vì luật này chạy quá chậm khi lớp có nhiều học viên.' },
          { letter: 'D', text: 'Vì bắt buộc phải dùng một thuật toán thật phức tạp mới đủ chính xác.' }
        ],
        correct: 'B',
        feedback_correct: 'Chính xác! 👏 Luật viết sẵn cần <strong>đáp án đã có sẵn</strong> trong tay. '
                          + 'Ở tuần 8, <code>final_score</code> chưa tồn tại (phải đợi đến tuần 15) — '
                          + 'nên chỉ còn cách <strong>học pattern</strong> từ 12 hồ sơ khóa trước.',
        feedback_wrong: 'Chưa đúng. Gợi ý: vấn đề không nằm ở tốc độ hay cú pháp — mà ở việc '
                        + '<code>final_score</code> có <strong>tồn tại</strong> ở tuần 8 hay không.',

        /* ─── MINI-GAME BONUS (dưới MCQ, không bắt buộc để qua bài) ───
           Khác bài kéo-thả T-E-P ở Bước 3 — đây là 6 tình huống ĐỜI THẬT, xếp vào
           2 nhóm "giải được bằng luật cố định" vs "cần Machine Learning". */
        bonus: {
          help: '🎁 <strong>Bonus không bắt buộc:</strong> 6 việc dưới đây, việc nào chỉ cần '
                + '<strong>luật cố định (if/else)</strong>, việc nào <strong>bắt buộc phải học từ dữ liệu</strong>? '
                + 'Kéo mỗi thẻ vào đúng ô.',
          chips: [
            { id: 'b1', text: 'Tính thuế thu nhập theo bậc lương cố định' },
            { id: 'b2', text: 'Đổi nhiệt độ từ °C sang °F' },
            { id: 'b3', text: 'Tính BMI từ cân nặng và chiều cao' },
            { id: 'b4', text: 'Lọc email nào là spam, email nào không' },
            { id: 'b5', text: 'Gợi ý phim dựa trên lịch sử xem trước đó' },
            { id: 'b6', text: 'Dự đoán học viên nào sắp rớt môn (như StudyLab!)' }
          ],
          zones: [
            { id: 'z_rule', label: 'Giải được bằng luật cố định', icon: '📜' },
            { id: 'z_ml',   label: 'Bắt buộc cần Machine Learning', icon: '🌱' }
          ],
          solution: { b1: 'z_rule', b2: 'z_rule', b3: 'z_rule', b4: 'z_ml', b5: 'z_ml', b6: 'z_ml' },
          feedback_correct: 'Chuẩn! 🎉 3 việc đầu có công thức toán cố định — con người viết luật là xong. '
                            + '3 việc sau không có công thức nào đúng 100% — phải học pattern từ dữ liệu lịch sử.',
          feedback_wrong: 'Gần đúng rồi. Gợi ý: tự hỏi — việc này có <strong>công thức toán cố định, ai viết '
                          + 'cũng ra kết quả giống nhau</strong> không? Có → luật cố định. Không, phải "nhìn nhiều '
                          + 'ví dụ mới đoán được" → Machine Learning.'
        }
      },

      /* ─── BƯỚC 3: KÉO THẢ — Pipeline builder (kéo khối lệnh JS THẬT, bấm chạy thật) ─── */
      step_3: {
        title: 'Kéo thả',
        scenario_html: 'Bài toán đã được định khung xong. Giờ lắp một <strong>pipeline dự đoán thật</strong> '
                      + 'cho <strong>Lan</strong> — học viên mới, hồ sơ <code>[7.0h, 90%, 82]</code> — bằng '
                      + 'cách so <strong>khoảng cách</strong> của Lan tới "chân dung trung bình" 2 nhóm Đậu/Rớt. '
                      + 'Hàm <code>distance()</code> đã viết sẵn bên dưới — việc của bạn là kéo 3 khối lệnh vào '
                      + '<strong>đúng thứ tự chạy</strong>, không phải viết code mới.',
        given_code: `const lan = [7.0, 90, 82];       // hồ sơ Lan: [giờ tự học, điểm danh %, giữa kỳ]
const passAvg = [7.8, 95, 86];   // "chân dung" nhóm Đậu (đã tính sẵn)
const failAvg = [2.2, 58, 48];   // "chân dung" nhóm Rớt (đã tính sẵn)

function distance(p1, p2) {
  // đã viết sẵn — bạn KHÔNG cần viết lại, chỉ cần GỌI nó đúng chỗ
  return Math.pow(p1[0]-p2[0], 2) + Math.pow(p1[1]-p2[1], 2) + Math.pow(p1[2]-p2[2], 2);
}`,
        /* Cố tình xáo thứ tự — thứ tự đúng phải là b1, b2, b3 */
        blocks: [
          { id: 'b3', code: 'const result = (dPass < dFail) ? "ĐẬU" : "RỚT";' },
          { id: 'b1', code: 'const dPass = distance(lan, passAvg);' },
          { id: 'b2', code: 'const dFail = distance(lan, failAvg);' }
        ],
        hint: 'Phải tính được <code>dPass</code> và <code>dFail</code> TRƯỚC thì mới so sánh được ở dòng cuối — '
              + 'nếu thả khối so sánh lên đầu, code sẽ báo lỗi thật kiểu "dPass is not defined", y hệt lỗi khi '
              + 'code Python/JS thật chạy sai thứ tự.',
        run: function (orderedIds) {
          var byId = {};
          this.blocks.forEach(function (b) { byId[b.id] = b.code; });
          var lines = orderedIds.map(function (id) { return byId[id]; });
          var script = this.given_code + '\n' + lines.join('\n')
            + '\nreturn { result: (typeof result !== "undefined" ? result : undefined), '
            + 'dPass: (typeof dPass !== "undefined" ? dPass : undefined), '
            + 'dFail: (typeof dFail !== "undefined" ? dFail : undefined) };';
          var out;
          try {
            out = new Function(script)();
          } catch (e) {
            return { pass: false, message: '❌ Lỗi khi chạy: ' + e.message + '\n→ Có thể bạn đã thả khối dùng '
                     + 'dPass/dFail LÊN TRƯỚC khối tính ra chúng. Bấm "Làm lại" và thử thứ tự khác.' };
          }
          if (out.result === 'ĐẬU') {
            return {
              pass: true,
              message: '🎉 Pipeline chạy đúng!\ndPass = ' + out.dPass.toFixed(2) + ' (khoảng cách tới nhóm Đậu)\n'
                       + 'dFail = ' + out.dFail.toFixed(2) + ' (khoảng cách tới nhóm Rớt)\n'
                       + '→ dPass < dFail nên result = "ĐẬU". Lan gần "chân dung" nhóm Đậu hơn nhiều.'
            };
          }
          return { pass: false, message: 'Pipeline chạy được (không lỗi) nhưng kết quả sai: result = '
                   + JSON.stringify(out.result) + '. Kiểm tra lại xem khối "so sánh" (dòng có dấu ?) đã ở '
                   + 'CUỐI CÙNG chưa.' };
        }
      },

      /* ─── BƯỚC 4: TỰ CODE ─── */
      step_4: {
        title: 'Tự code',
        context_html: 'Bước 3 bạn đã lắp pipeline bằng tay với <code>distance()</code> có sẵn. Giờ đến '
                     + 'lượt bạn <strong>tự viết distance()</strong> — StudyLab đã tính sẵn "chân dung '
                     + 'trung bình" của 2 nhóm (kết quả bước <strong>fit</strong>): '
                     + '<code>passAvg = [7.8, 95, 86]</code> (nhóm Đậu) và '
                     + '<code>failAvg = [2.2, 58, 48]</code> (nhóm Rớt) — mỗi mảng là '
                     + '<code>[giờ tự học, điểm danh %, điểm giữa kỳ]</code>.',
        real_world_html: 'Đây chính là ý tưởng lõi của thuật toán <strong>k-Nearest Neighbors (k-NN)</strong> — '
                     + 'so khoảng cách hồ sơ mới với các "chân dung" đã biết để suy ra nhãn. Gmail lọc spam, '
                     + 'app gợi ý phim, hệ thống chấm điểm tín dụng ban đầu... nhiều hệ thống thật khởi động '
                     + 'bằng đúng công thức <em>khoảng cách càng gần thì càng giống nhóm đó</em> này.',
        steps: [
          'Hoàn thiện <code>distance(p1, p2)</code>: cộng dồn bình phương hiệu từng phần tử.',
          'Dùng <code>distance()</code> vừa viết bên trong <code>predictLabel(profile, passAvg, failAvg)</code> '
          + 'để so sánh khoảng cách tới 2 nhóm.',
          'Bấm <strong>Chạy &amp; chấm</strong> — test mẫu sẽ dự đoán cho Lan <code>[7.0h, 90%, 82]</code>.'
        ],
        expected_html: '<code>predictLabel(lan, passAvg, failAvg)</code> trả về <code>"ĐẬU"</code> — '
                     + 'và cả <strong>9/9 test</strong> (gồm nhiều hồ sơ khác Lan) đều qua.',
        starter: `function distance(p1, p2) {
  // p1, p2: mảng 3 số [giờ tự học, điểm danh %, điểm giữa kỳ]
  // Trả về tổng bình phương hiệu từng phần tử:
  //   (p1[0]-p2[0])^2 + (p1[1]-p2[1])^2 + (p1[2]-p2[2])^2
  // TODO: viết công thức
  return 0;
}

function predictLabel(profile, passAvg, failAvg) {
  // profile: hồ sơ cần dự đoán, ví dụ [7.0, 90, 82]
  // passAvg, failAvg: "chân dung trung bình" của 2 nhóm (đã tính sẵn ở bước fit)
  // Trả về "ĐẬU" nếu profile gần passAvg hơn failAvg, ngược lại "RỚT"
  // TODO: dùng distance() ở trên để so sánh
  return "RỚT";
}

// --- Test mẫu: Lan, học viên mới, 7h/tuần · điểm danh 90% · giữa kỳ 82 ---
var passAvg = [7.8, 95, 86];
var failAvg = [2.2, 58, 48];
var lan = [7.0, 90, 82];
var ketQua = predictLabel(lan, passAvg, failAvg);`,
        hint: '<p><code>distance(p1, p2)</code>: cộng dồn <code>Math.pow(p1[i] - p2[i], 2)</code> cho '
              + '<code>i = 0, 1, 2</code>. <code>predictLabel</code>: tính '
              + '<code>distance(profile, passAvg)</code> và <code>distance(profile, failAvg)</code> '
              + 'rồi so sánh — <strong>số nhỏ hơn nghĩa là gần hơn</strong>. Đây chính là bước '
              + '<em>predict</em>: luôn chạy trên hồ sơ MỚI, không phải hồ sơ đã dùng để tính '
              + 'passAvg/failAvg.</p>'
              + '<span class="mlb-problem-hint-answer-label">⚠️ Tạm thời — full đáp án</span>'
              + '<pre>function distance(p1, p2) {\n'
              + '  return Math.pow(p1[0]-p2[0], 2) + Math.pow(p1[1]-p2[1], 2) + Math.pow(p1[2]-p2[2], 2);\n'
              + '}\n\n'
              + 'function predictLabel(profile, passAvg, failAvg) {\n'
              + '  return distance(profile, passAvg) < distance(profile, failAvg) ? "ĐẬU" : "RỚT";\n'
              + '}</pre>',
        tests: [
          { type: 'distance', args: [[0, 0, 0], [3, 4, 0]], expected: 25 },
          { type: 'distance', args: [[1, 1, 1], [1, 1, 1]], expected: 0 },
          { type: 'distance', args: [[2, 3, 6], [0, 0, 0]], expected: 49 },
          { type: 'predictLabel', args: [[7.0, 90, 82], [7.8, 95, 86], [2.2, 58, 48]], expected: 'ĐẬU' },
          { type: 'predictLabel', args: [[8.0, 95, 85], [7.8, 95, 86], [2.2, 58, 48]], expected: 'ĐẬU' },
          { type: 'predictLabel', args: [[2.0, 55, 45], [7.8, 95, 86], [2.2, 58, 48]], expected: 'RỚT' },
          { type: 'predictLabel', args: [[4.0, 70, 60], [7.8, 95, 86], [2.2, 58, 48]], expected: 'RỚT' },
          { type: 'predictLabel', args: [[6.0, 88, 78], [7.8, 95, 86], [2.2, 58, 48]], expected: 'ĐẬU' },
          { type: 'predictLabel', args: [[3.0, 60, 50], [7.8, 95, 86], [2.2, 58, 48]], expected: 'RỚT' }
        ],
        /* Hàm chấm: nhận userCode (string), chạy trong sandbox bằng new Function.
           Trả { pass: bool, message: string, passed: number, total: number } */
        check: function (userCode) {
          /* An toàn cơ bản: cấm một số từ khoá nguy hiểm (chỉ chống tai nạn, không phải bảo mật thật) */
          var banned = ['document', 'window.', 'eval(', 'Function('];
          for (var i = 0; i < banned.length; i++) {
            if (userCode.indexOf(banned[i]) !== -1) {
              return { pass: false, message: 'Code chứa từ khoá bị cấm: ' + banned[i], passed: 0, total: this.tests.length };
            }
          }
          var scope;
          try {
            /* eslint-disable no-new-func */
            scope = new Function(userCode + '\nreturn { distance: distance, predictLabel: predictLabel };')();
          } catch (e) {
            return { pass: false, message: 'Lỗi cú pháp: ' + e.message, passed: 0, total: this.tests.length };
          }
          if (typeof scope.distance !== 'function') {
            return { pass: false, message: 'Không tìm thấy hàm distance.', passed: 0, total: this.tests.length };
          }
          if (typeof scope.predictLabel !== 'function') {
            return { pass: false, message: 'Không tìm thấy hàm predictLabel.', passed: 0, total: this.tests.length };
          }
          var passed = 0;
          var firstFail = null;
          for (var j = 0; j < this.tests.length; j++) {
            var t = this.tests[j];
            var fn = scope[t.type];
            var got;
            try { got = fn.apply(null, t.args); } catch (e) { got = '__ERROR__: ' + e.message; }
            var ok;
            if (t.type === 'distance') { ok = (typeof got === 'number') && Math.abs(got - t.expected) < 1e-6; }
            else { ok = (got === t.expected); }
            if (ok) { passed++; }
            else if (!firstFail) { firstFail = { name: t.type, args: JSON.stringify(t.args), expected: t.expected, got: got }; }
          }

          /* Chạy THẬT trên đúng kịch bản Lan trong starter — hiện lên console thật,
             không chỉ báo pass/fail suông. */
          var passAvgReal = [7.8, 95, 86];
          var failAvgReal = [2.2, 58, 48];
          var lanReal = [7.0, 90, 82];
          var consoleLines = [];
          try {
            var dPassReal = scope.distance(lanReal, passAvgReal);
            var dFailReal = scope.distance(lanReal, failAvgReal);
            var ketQuaReal = scope.predictLabel(lanReal, passAvgReal, failAvgReal);
            consoleLines.push('distance(lan, passAvg) = ' + dPassReal);
            consoleLines.push('distance(lan, failAvg) = ' + dFailReal);
            consoleLines.push('ketQua = predictLabel(lan, passAvg, failAvg) = "' + ketQuaReal + '"');
          } catch (e) {
            consoleLines.push('❌ Lỗi khi chạy trên dữ liệu mẫu (Lan): ' + e.message);
          }

          if (passed === this.tests.length) {
            return { pass: true, message: '🎉 Qua tất cả ' + this.tests.length + ' test! distance và predictLabel đều đúng.', passed: passed, total: this.tests.length, consoleLines: consoleLines };
          }
          return {
            pass: false,
            message: 'Qua ' + passed + '/' + this.tests.length + ' test. Chưa đúng: ' + firstFail.name + '(' + firstFail.args + ') → bạn trả ' + firstFail.got + ', kỳ vọng ' + firstFail.expected + '.',
            passed: passed,
            total: this.tests.length,
            consoleLines: consoleLines
          };
        }
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       BÀI 2 — Bài toán ML thuộc loại nào?
       (rút gọn từ c1_l2 trong lesson_content_ml.js — giữ đúng câu chuyện Minh + 3 câu hỏi
       trên cùng 1 bảng dữ liệu; phần tự code chọn nhánh Regression để thực hành y = a·x + b.)
       ════════════════════════════════════════════════════════════════════ */
    {
      id: 'b2_problem_types',
      index: 2,
      title: 'Bài toán ML thuộc loại nào?',
      subtitle: 'Regression · Classification · Clustering — cùng một bảng dữ liệu',
      module: 'Bài 2',
      module_title: 'Bài 2 — Ba loại bài toán',
      estimated_minutes: 7,
      xp_reward: 40,

      /* ─── BƯỚC 1: LÝ THUYẾT ─── */
      step_1: {
        title: 'Lý thuyết',
        blocks: [
          {
            type: 'p',
            html: 'Kho dữ liệu StudyLab vừa có thêm <strong>24 hồ sơ khóa trước</strong> — khóa đó đã '
                  + 'học xong nên có đủ cả <code>final_score</code> lẫn <code>pass_fail</code>. '
                  + '<strong>Minh</strong>, học viên khóa này, có <strong>3 câu hỏi khác nhau</strong> '
                  + 'trên CÙNG một bảng dữ liệu — và mỗi câu lại thuộc một <em>loại bài toán ML</em> riêng.'
          },
          {
            type: 'table',
            caption: '📓 Nhật ký 8 tuần đầu của Minh — dữ liệu thật dùng xuyên suốt bài này.',
            headers: ['Tuần', 'Giờ tự học/tuần', 'Điểm danh cộng dồn', 'Giữa kỳ'],
            rows: [
              ['1', '5.0h', '80%', '—'],
              ['4', '7.0h', '84%', '—'],
              ['6', '7.2h', '86%', '—'],
              ['7', '6.9h', '85%', '<strong>74</strong> (vừa thi)'],
              ['<strong>8 (hiện tại)</strong>', '6.5h', '85%', '74']
            ]
          },
          {
            type: 'h3',
            icon: 'fa-solid fa-shapes',
            text: '3 loại bài toán ML — cùng đọc trên bảng dữ liệu của Minh'
          },
          {
            type: 'compare',
            items: [
              {
                title: 'Regression',
                icon: '📈',
                body: 'Target là một <em>con số liên tục</em> — trả lời "bao nhiêu?". '
                      + 'Ví dụ: cuối kỳ Minh sẽ được <strong>bao nhiêu điểm</strong> (final_score)?'
              },
              {
                title: 'Classification',
                icon: '🏷️',
                body: 'Target là một <em>tên lớp</em> — trả lời "loại nào?". Ví dụ: Minh cuối kỳ '
                      + '<strong>Đậu hay Rớt</strong>? (dù mã hoá 0/1, đó vẫn là một TÊN LỚP, '
                      + 'không phải số đếm được).'
              },
              {
                title: 'Clustering',
                icon: '🧩',
                body: '<em>Không có đáp án</em> để học — máy tự gom hồ sơ giống nhau thành nhóm. '
                      + 'Ví dụ: chia 24 học viên khóa trước thành <strong>nhóm hành vi học</strong> — '
                      + 'chưa ai đặt tên nhóm nào cả.'
              }
            ]
          },
          {
            type: 'stat',
            items: [
              { icon: '📈', value: 'Bao nhiêu?', label: 'Regression → dự đoán một con số' },
              { icon: '🏷️', value: 'Loại nào?', label: 'Classification → dự đoán một tên lớp' },
              { icon: '🧩', value: 'Nhóm nào?', label: 'Clustering → không có đáp án, tự gom nhóm' }
            ]
          },
          {
            type: 'quote',
            text: '"Em chỉ muốn biết mình có đang ổn không thôi — nhưng giờ mới thấy cùng một bảng '
                  + 'điểm mà hỏi ba câu khác nhau thì lại ra ba bài toán khác hẳn nhau."',
            author: 'Minh, học viên StudyLab'
          },
          {
            type: 'callout',
            html: '💡 <strong>Cách nhận diện nhanh:</strong> bảng dữ liệu có sẵn <em>target</em> '
                  + '(đáp án) để học không? Có → Regression (target là số) hoặc Classification '
                  + '(target là lớp). Không có → Clustering. Ở <strong>Bước 4</strong> bạn sẽ code '
                  + 'nhánh Regression: dự đoán final_score bằng đường thẳng y = a·x + b.'
          }
        ]
      },

      /* ─── BƯỚC 2: TRẮC NGHIỆM ─── */
      step_2: {
        title: 'Trắc nghiệm',
        question: 'Câu hỏi "Minh cuối kỳ sẽ <strong>Đậu hay Rớt</strong>?" thuộc loại bài toán ML nào?',
        options: [
          { letter: 'A', text: 'Regression — vì vẫn cần tính toán trên số liệu đầu vào.' },
          { letter: 'B', text: 'Classification — vì kết quả là một <strong>tên lớp</strong> (Đậu / '
                                + 'Rớt), không phải một số đo lường được.' },
          { letter: 'C', text: 'Clustering — vì phải xếp Minh vào một nhóm học viên.' },
          { letter: 'D', text: 'Không phải ML — chỉ cần luật <code>if final_score >= 50</code>.' }
        ],
        correct: 'B',
        feedback_correct: 'Đúng rồi! 🎉 Đậu/Rớt là một <strong>tên lớp</strong> chứ không phải đại '
                          + 'lượng liên tục — dù lưu dưới dạng 0/1, con số đó chỉ là MÃ, không phải '
                          + 'số đếm được. Đây là bài toán <strong>Classification</strong>.',
        feedback_wrong: 'Thử lại nhé. Gợi ý: phân biệt "bao nhiêu?" (Regression) với "loại nào?" '
                        + '(Classification) và "không có đáp án, tự gom nhóm" (Clustering). Ở tuần 8, '
                        + '<code>final_score</code> của Minh cũng <strong>chưa tồn tại</strong> nên '
                        + 'luật viết sẵn vẫn chưa dùng được — vẫn cần một mô hình ML.',

        /* ─── MINI-GAME BONUS (dưới MCQ, không bắt buộc để qua bài) ───
           Khác bài xếp Regression/Classification/Clustering ở Bước 3 cũ — đây là góc nhìn khác:
           6 bài toán đời thật, xếp vào "có target để học" (Supervised) vs "không có target,
           máy tự tìm cấu trúc" (Unsupervised). */
        bonus: {
          help: '🎁 <strong>Bonus không bắt buộc:</strong> 6 bài toán ML đời thật — bài nào có sẵn '
                + '<strong>target (đáp án)</strong> để học, bài nào <strong>không có target</strong> mà máy '
                + 'phải tự tìm cấu trúc? Kéo mỗi thẻ vào đúng ô.',
          chips: [
            { id: 'b1', text: 'Dự đoán giá một căn nhà theo diện tích' },
            { id: 'b2', text: 'Phân loại email spam / không spam' },
            { id: 'b3', text: 'Dự đoán final_score cuối kỳ của Minh' },
            { id: 'b4', text: 'Gom khách hàng siêu thị theo thói quen mua sắm, chưa có nhãn trước' },
            { id: 'b5', text: 'Tìm chủ đề ẩn trong hàng ngàn bài báo, không ai gắn nhãn sẵn' },
            { id: 'b6', text: 'Chia 24 học viên khóa trước thành nhóm hành vi học — chưa ai đặt tên nhóm' }
          ],
          zones: [
            { id: 'z_sup',   label: 'Có target — Supervised', icon: '🎯' },
            { id: 'z_unsup', label: 'Không có target — Unsupervised', icon: '🧭' }
          ],
          solution: { b1: 'z_sup', b2: 'z_sup', b3: 'z_sup', b4: 'z_unsup', b5: 'z_unsup', b6: 'z_unsup' },
          feedback_correct: 'Chuẩn! 🌟 Regression và Classification đều có target rõ ràng (Supervised) — '
                            + 'Clustering thì không, máy phải tự tìm cấu trúc (Unsupervised).',
          feedback_wrong: 'Gần đúng rồi. Gợi ý: bảng dữ liệu ĐÃ CÓ SẴN đáp án đúng để so sánh không? '
                          + 'Có → Supervised (dù là Regression hay Classification). Không có đáp án nào cả, '
                          + 'chỉ có dữ liệu thô → Unsupervised.'
        }
      },

      /* ─── BƯỚC 3: KÉO THẢ — Pipeline builder (kéo khối lệnh JS THẬT, bấm chạy thật) ─── */
      step_3: {
        title: 'Kéo thả',
        scenario_html: 'StudyLab đã "fit" xong một đường thẳng hồi quy từ 24 hồ sơ khóa trước: '
                      + '<code>a = 6.2</code>, <code>b = 42</code> (final_score ≈ 6.2·giờ_tự_học + 42). '
                      + 'Hàm <code>predict(x, a, b)</code> đã viết sẵn. Lắp pipeline dự đoán '
                      + '<strong>final_score</strong> hiện tại của Minh (6.5h/tuần) rồi kết luận '
                      + 'ĐẬU/RỚT — kéo 2 khối lệnh vào đúng thứ tự chạy.',
        given_code: `const minhHours = 6.5;   // giờ tự học/tuần của Minh ở tuần 8
const a = 6.2, b = 42;   // hệ số đã "fit" sẵn từ 24 hồ sơ khóa trước

function predict(x, a, b) {
  // đã viết sẵn — bạn KHÔNG cần viết lại, chỉ cần GỌI nó đúng chỗ
  return a * x + b;
}`,
        /* Cố tình xáo thứ tự — thứ tự đúng phải là b1, b2 */
        blocks: [
          { id: 'b2', code: 'const ketLuan = (scorePred >= 50) ? "Dự đoán ĐẬU" : "Dự đoán RỚT";' },
          { id: 'b1', code: 'const scorePred = predict(minhHours, a, b);' }
        ],
        hint: 'Phải có <code>scorePred</code> rồi mới dùng nó để so sánh <code>&gt;= 50</code> được — khối '
              + 'gọi <code>predict()</code> phải đứng TRƯỚC khối kết luận.',
        run: function (orderedIds) {
          var byId = {};
          this.blocks.forEach(function (b) { byId[b.id] = b.code; });
          var lines = orderedIds.map(function (id) { return byId[id]; });
          var script = this.given_code + '\n' + lines.join('\n')
            + '\nreturn { ketLuan: (typeof ketLuan !== "undefined" ? ketLuan : undefined), '
            + 'scorePred: (typeof scorePred !== "undefined" ? scorePred : undefined) };';
          var out;
          try {
            out = new Function(script)();
          } catch (e) {
            return { pass: false, message: '❌ Lỗi khi chạy: ' + e.message + '\n→ Có thể bạn đã thả khối '
                     + 'dùng scorePred LÊN TRƯỚC khối tính ra nó. Bấm "Làm lại" và thử thứ tự khác.' };
          }
          if (out.ketLuan === 'Dự đoán ĐẬU') {
            return {
              pass: true,
              message: '🎉 Pipeline chạy đúng!\nscorePred = ' + out.scorePred.toFixed(1) + ' (final_score dự đoán)\n'
                       + '→ scorePred >= 50 nên ketLuan = "Dự đoán ĐẬU". Minh đang trên đà ổn — final_score dự '
                       + 'đoán khá xa mốc rớt.'
            };
          }
          return { pass: false, message: 'Pipeline chạy được (không lỗi) nhưng kết quả sai: ketLuan = '
                   + JSON.stringify(out.ketLuan) + '. Kiểm tra lại xem khối "kết luận" (dòng có dấu ?) đã ở '
                   + 'CUỐI CÙNG chưa.' };
        }
      },

      /* ─── BƯỚC 4: TỰ CODE ─── */
      step_4: {
        title: 'Tự code',
        context_html: 'Bước 3 bạn đã lắp pipeline bằng tay với <code>predict()</code> có sẵn. Giờ đến lượt '
                     + 'bạn <strong>tự viết predict()</strong> để trả lời câu hỏi (1) của Minh: '
                     + '<strong>cuối kỳ sẽ được bao nhiêu điểm?</strong> — đúng bài toán '
                     + '<strong>Regression</strong> bạn vừa học ở Bước 1.',
        real_world_html: 'Đường thẳng <code>y = a·x + b</code> chính là bản thu nhỏ của '
                     + '<strong>hồi quy tuyến tính (linear regression)</strong> — thuật toán dự đoán giá nhà, '
                     + 'doanh thu, hay lương khởi điểm đều dùng chung công thức này; khác biệt duy nhất là '
                     + '<code>a</code>, <code>b</code> được "học" từ hàng nghìn dữ liệu thay vì cho sẵn như ở đây.',
        steps: [
          'Hoàn thiện <code>predict(x, a, b)</code>: trả về <code>y = a·x + b</code>.',
          'Hoàn thiện <code>mse(y_true, y_pred)</code>: sai số bình phương trung bình giữa nhãn thật và dự đoán.',
          'Bấm <strong>Chạy &amp; chấm</strong> — test mẫu sẽ tính <code>error</code> trên 5 điểm dữ liệu cho sẵn.'
        ],
        expected_html: '<code>predict(5, 2, 3)</code> trả về <code>13</code>, <code>mse</code> tính đúng sai số — '
                     + 'cả <strong>6/6 test</strong> đều qua.',
        starter: `function predict(x, a, b) {
  // Trả về y = a * x + b
  // TODO: viết công thức
  return 0;
}

function mse(y_true, y_pred) {
  // y_true, y_pred: mảng số cùng độ dài
  // Trả về sai số bình phương trung bình
  // Gợi ý: dùng vòng lặp hoặc Math.pow
  // TODO: viết logic
  return 0;
}

// --- Test mẫu ---
var a = 2, b = 3;
var xs = [1, 2, 3, 4, 5];
var ys_true = [5, 7, 9, 11, 13];
var ys_pred = xs.map(function(x) { return predict(x, a, b); });
var error = mse(ys_true, ys_pred);`,
        hint: '<p><code>predict(x, a, b)</code> chỉ cần 1 dòng <code>return a * x + b</code>. '
              + 'Với <code>mse</code>: dùng vòng lặp cộng dồn <code>(y_true[i] - y_pred[i])²</code> rồi chia cho độ dài mảng.</p>'
              + '<span class="mlb-problem-hint-answer-label">⚠️ Tạm thời — full đáp án</span>'
              + '<pre>function predict(x, a, b) {\n'
              + '  return a * x + b;\n'
              + '}\n\n'
              + 'function mse(y_true, y_pred) {\n'
              + '  var sum = 0;\n'
              + '  for (var i = 0; i < y_true.length; i++) {\n'
              + '    sum += Math.pow(y_true[i] - y_pred[i], 2);\n'
              + '  }\n'
              + '  return sum / y_true.length;\n'
              + '}</pre>',
        tests: [
          { type: 'predict', args: [0, 2, 3], expected: 3 },
          { type: 'predict', args: [5, 2, 3], expected: 13 },
          { type: 'predict', args: [10, -1, 100], expected: 90 },
          { type: 'mse', args: [[5, 7, 9], [5, 7, 9]], expected: 0 },
          { type: 'mse', args: [[1, 2, 3], [2, 2, 2]], expected: 2/3 },
          { type: 'mse', args: [[0, 0], [10, 10]], expected: 100 }
        ],
        check: function (userCode) {
          var banned = ['document', 'window.', 'eval('];
          for (var i = 0; i < banned.length; i++) {
            if (userCode.indexOf(banned[i]) !== -1) {
              return { pass: false, message: 'Code chứa từ khoá bị cấm: ' + banned[i], passed: 0, total: this.tests.length };
            }
          }
          var scope;
          try {
            scope = new Function(userCode + '\nreturn { predict: predict, mse: mse };')();
          } catch (e) {
            return { pass: false, message: 'Lỗi cú pháp: ' + e.message, passed: 0, total: this.tests.length };
          }
          if (typeof scope.predict !== 'function') {
            return { pass: false, message: 'Không tìm thấy hàm predict.', passed: 0, total: this.tests.length };
          }
          if (typeof scope.mse !== 'function') {
            return { pass: false, message: 'Không tìm thấy hàm mse.', passed: 0, total: this.tests.length };
          }
          var passed = 0;
          var firstFail = null;
          for (var j = 0; j < this.tests.length; j++) {
            var t = this.tests[j];
            var fn = scope[t.type];
            var got;
            try { got = fn.apply(null, t.args); } catch (e) { got = '__ERROR__: ' + e.message; }
            var ok = (typeof got === 'number') && Math.abs(got - t.expected) < 1e-6;
            if (ok) { passed++; }
            else if (!firstFail) { firstFail = { name: t.type, args: JSON.stringify(t.args), expected: t.expected, got: got }; }
          }

          /* Chạy THẬT trên đúng kịch bản 5 điểm dữ liệu trong starter — hiện console thật. */
          var aReal = 2, bReal = 3;
          var xsReal = [1, 2, 3, 4, 5];
          var ysTrueReal = [5, 7, 9, 11, 13];
          var consoleLines = [];
          try {
            var ysPredReal = xsReal.map(function (x) { return scope.predict(x, aReal, bReal); });
            var errorReal = scope.mse(ysTrueReal, ysPredReal);
            consoleLines.push('ys_pred = [' + ysPredReal.join(', ') + ']');
            consoleLines.push('error = mse(ys_true, ys_pred) = ' + errorReal);
          } catch (e) {
            consoleLines.push('❌ Lỗi khi chạy trên dữ liệu mẫu: ' + e.message);
          }

          if (passed === this.tests.length) {
            return { pass: true, message: '🎉 Qua tất cả ' + this.tests.length + ' test! predict và mse đều đúng.', passed: passed, total: this.tests.length, consoleLines: consoleLines };
          }
          return {
            pass: false,
            message: 'Qua ' + passed + '/' + this.tests.length + ' test. Chưa đúng: ' + firstFail.name + '(' + firstFail.args + ') → bạn trả ' + firstFail.got + ', kỳ vọng ' + firstFail.expected + '.',
            passed: passed,
            total: this.tests.length,
            consoleLines: consoleLines
          };
        }
      }
    }
  ]
};
