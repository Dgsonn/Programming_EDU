/* ═══════════════════════════════════════════════════════════════════
 * LESSON CONTENT — DB DESIGN TRUNG CẤP (GameHub Community, phần 2 saga)
 * Course id: db_design_tc · Ticket #21–#41 · Release: Community v1.0/v2.0/v3.0
 * Syllabus: docs/DATABASE_DESIGN_3_COURSE_RECOMMENDATION.md v3 (M4/M5/M6)
 * Thi công: docs/TC_NC_IMPLEMENTATION_PLAN_2026-07-04.md
 * Schema 4-step Y HỆT Basic — renderer dùng chung, không fork UI.
 * ═══════════════════════════════════════════════════════════════════ */
window.LESSON_CONTENT = window.LESSON_CONTENT || {};
window.LESSON_CONTENT['db_design_tc'] = {
  course_id: 'db_design_tc',
  course_title: 'Database Design Trung cấp — GameHub Community',
  lessons: [
    {
      id: 'tc_01', index: 1,
      title: 'SQL từ ngôn ngữ lập trình — JDBC, Embedded SQL & Cursor',
      subtitle: 'Gọi database từ code ứng dụng: kết nối, tham số, đọc kết quả từng dòng',
      module: 4, module_title: 'Advanced SQL',
      estimated_minutes: 25, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'posts',
          columns: ['post_id', 'user_id', 'content', 'created_at'],
          dataRows: [
            ['501', '7',  'Elden Ring DLC ra rồi anh em ơi!', '2026-06-01'],
            ['502', '9',  'Tìm team leo rank tối nay',        '2026-06-01'],
            ['503', '7',  'Review tay cầm mới mua ở GameHub', '2026-06-02'],
            ['504', '12', 'Ai cày Hades 2 điểm danh',         '2026-06-03'],
            ['505', '9',  'Setup góc chơi game 15 triệu',     '2026-06-04'],
            ['506', '15', 'Mẹo farm rune nhanh gấp đôi',      '2026-06-05'],
            ['507', '7',  'GuildBoard sập, mọi người qua đây', '2026-06-06'],
            ['508', '9',  'Top 5 game indie tháng này',       '2026-06-07']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #21',
        hook: 'GameHub v3.0 đã ra mắt toàn cầu — và sếp gọi bạn vào phòng: <strong>"Ta sẽ tự xây mạng cộng đồng cho gamers. Cậu dẫn dắt phần dữ liệu."</strong> Dự án <em>GameHub Community</em> khởi động với bảng <code>posts</code> đầu tiên. Nhưng lần này khác: SQL không còn gõ tay trong console — nó phải được <strong>gọi từ code backend</strong> (Java/Python), nhận tham số an toàn, đọc kết quả từng dòng. Ticket #21: nối thế giới code với thế giới database.'
      },
      step_1: {
        primer: {
          goal: [
            'App không gõ SQL tay — nó gọi qua API chuẩn: JDBC (Java) / DB-API (Python)',
            'Tham số truyền bằng placeholder (?, %s) — KHÔNG nối chuỗi (bài học SQLi từ Ticket #19)',
            'Kết quả trả về là con trỏ (cursor) — đọc TỪNG DÒNG, không phải cả bảng một cục'
          ],
          intro: 'Backend GameHub Community viết bằng code, không phải console SQL. Chuẩn kết nối: mở <strong>connection</strong> → tạo <strong>prepared statement</strong> với placeholder → <strong>execute</strong> → nhận <strong>ResultSet/cursor</strong> → lặp <code>next()</code> đọc từng dòng → đóng kết nối. Mọi framework (JDBC, psycopg2, ODBC) đều xoay quanh vòng đời này.',
          example: 'Java: <code>PreparedStatement ps = conn.prepareStatement("SELECT * FROM posts WHERE user_id = ?"); ps.setString(1, uid); ResultSet rs = ps.executeQuery(); while (rs.next()) { ... }</code>'
        },
        concept_cards: [
          {
            icon: 'fa-plug',
            title: 'JDBC/ODBC — cổng nối chuẩn',
            body: 'App ↔ DB nói chuyện qua driver chuẩn hoá: <strong>JDBC</strong> (Java), <strong>ODBC</strong> (đa ngôn ngữ), DB-API (Python). Đổi database (Postgres → MySQL) chỉ đổi driver + connection string — code SQL giữ nguyên.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 5.1 — Accessing SQL from a Programming Language'
          },
          {
            icon: 'fa-shield-halved',
            title: 'PreparedStatement — tham số tách kênh',
            body: 'Placeholder <code>?</code>/<code>%s</code> gửi câu lệnh và dữ liệu qua 2 kênh riêng — input người dùng vĩnh viễn chỉ là DỮ LIỆU. Đây chính là khiên chống SQL Injection bạn đã dựng ở Ticket #19, giờ thành thói quen bắt buộc trong code.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'ResultSet là CON TRỎ, không phải mảng: <code>while (rs.next())</code> kéo từng dòng từ server. Feed 10 triệu post mà đọc cả cục = sập RAM — cursor cho phép đọc-xử lý-bỏ từng dòng. Đó là lý do mọi API trả kết quả kiểu lặp.'
          }
        ],
        visual: {
          schema: {
            table_name: 'posts',
            columns: [
              { name: 'post_id', type: 'INT', key: 'PK', icon: '🔑' },
              { name: 'user_id', type: 'INT', key: 'FK', icon: '🔗' },
              { name: 'content', type: 'TEXT', key: '', icon: '📝' },
              { name: 'created_at', type: 'DATE', key: '', icon: '📅' }
            ]
          },
          data_preview: [
            ['501', '7',  'Elden Ring DLC ra rồi anh em ơi!', '2026-06-01'],
            ['502', '9',  'Tìm team leo rank tối nay',        '2026-06-01'],
            ['503', '7',  'Review tay cầm mới mua ở GameHub', '2026-06-02'],
            ['504', '12', 'Ai cày Hades 2 điểm danh',         '2026-06-03'],
            ['505', '9',  'Setup góc chơi game 15 triệu',     '2026-06-04'],
            ['506', '15', 'Mẹo farm rune nhanh gấp đôi',      '2026-06-05']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Trong JDBC, vì sao dùng <code>PreparedStatement</code> với <code>?</code> thay vì nối chuỗi SQL?',
            options: [
              { id: 'a', text: 'Tách câu lệnh khỏi dữ liệu — input không bao giờ thành SQL (chống injection) + DB cache được plan', correct: true, explanation: 'Đúng — lệnh và tham số đi 2 kênh riêng; driver escape tự động. Bonus: DB biên dịch câu lệnh 1 lần, chạy nhiều lần.' },
              { id: 'b', text: 'Vì nối chuỗi không chạy được trong Java', correct: false, explanation: 'Sai — nối chuỗi chạy được (đó mới là nguy hiểm). Vấn đề là input độc thành SQL.' },
              { id: 'c', text: 'Để câu lệnh ngắn hơn', correct: false, explanation: 'Sai — độ dài không phải vấn đề; an toàn + hiệu năng mới là lý do.' },
              { id: 'd', text: 'Bắt buộc của mọi database', correct: false, explanation: 'Sai — DB không ép; đây là best practice của tầng ứng dụng.' }
            ]
          },
          {
            question: '<code>ResultSet rs = ps.executeQuery()</code> trả về gì?',
            options: [
              { id: 'a', text: 'Toàn bộ bảng kết quả đã tải sẵn vào bộ nhớ', correct: false, explanation: 'Sai — mặc định ResultSet là con trỏ phía server/stream; dữ liệu kéo dần khi next().' },
              { id: 'b', text: 'Con trỏ (cursor) — gọi next() để kéo và đọc TỪNG dòng', correct: true, explanation: 'Đúng — rs đứng TRƯỚC dòng đầu; mỗi next() tiến 1 dòng, false khi hết. Nhờ vậy xử lý được kết quả lớn hơn RAM.' },
              { id: 'c', text: 'Một chuỗi JSON', correct: false, explanation: 'Sai — JSON là lớp API web; JDBC trả object ResultSet.' },
              { id: 'd', text: 'Số dòng bị thay đổi', correct: false, explanation: 'Sai — đó là executeUpdate() cho INSERT/UPDATE/DELETE.' }
            ]
          }
        ],
        mini_game: {
          type: 'order',
          title: 'Sắp xếp vòng đời JDBC',
          instruction: 'Kéo thả các bước gọi database từ code theo đúng thứ tự.',
          xp: 20,
          /* M4-TC FIX 2026-07-04: (1) thiếu solution → renderMiniGameOrder chấm sol[id]===pos,
           * không có thì KHÔNG BAO GIỜ pass; (2) bỏ tiền tố "1." trong label — spoiler đáp án. */
          items: [
            { id: 'j1', label: 'Mở Connection (connection string + driver)' },
            { id: 'j2', label: 'prepareStatement("SELECT … WHERE user_id = ?")' },
            { id: 'j3', label: 'setInt(1, userId) — gắn tham số vào placeholder' },
            { id: 'j4', label: 'executeQuery() → nhận ResultSet' },
            { id: 'j5', label: 'while (rs.next()) — đọc từng dòng' },
            { id: 'j6', label: 'close() — trả kết nối về pool' }
          ],
          solution: { j1: 1, j2: 2, j3: 3, j4: 4, j5: 5, j6: 6 }
        }
      },
      step_3: {
        mission: 'Backend cần lấy nội dung post của người dùng id 7, mới nhất trước — xây câu SQL mà PreparedStatement sẽ chạy.',
        blocks: [
          { type: 'kw', token: 'SELECT', slot: 'kw-select' },
          { type: 'col', token: 'content', slot: 'col-1' },
          { type: 'col', token: 'created_at', slot: 'col-2' },
          { type: 'kw', token: 'FROM', slot: 'kw-from' },
          { type: 'tbl', token: 'posts', slot: 'tbl' },
          { type: 'kw', token: 'WHERE', slot: 'kw-where' },
          { type: 'col', token: 'user_id', slot: 'wcol-1' },
          { type: 'op', token: '=', slot: 'op-1' },
          { type: 'val', token: '7', slot: 'val-1' },
          { type: 'kw', token: 'ORDER BY', slot: 'kw-order' },
          { type: 'col', token: 'created_at DESC', slot: 'col-order' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____', accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line', placeholder: 'FROM ____', accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line', placeholder: 'WHERE ____', accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE'], multi: true },
          { id: 'order-line', placeholder: 'ORDER BY ____', accepts: ['kw', 'col'], acceptedKeywords: ['ORDER BY'], multi: true }
        ],
        expected_sql: 'SELECT content, created_at FROM posts WHERE user_id = 7 ORDER BY created_at DESC;',
        reveal_hints: {
          'select-line': 'SELECT 2 cột: <strong>content, created_at</strong>.',
          'from-line': 'FROM <strong>posts</strong> — bảng đầu tiên của Community.',
          'where-line': 'Đây là chỗ placeholder <code>?</code> sẽ điền lúc chạy: <strong>user_id = 7</strong>.',
          'order-line': 'Mới nhất trước: <strong>created_at DESC</strong>.'
        }
      },
      step_4: {
        prompt: 'Nâng độ khó — backend cần <strong>bảng đếm post theo từng user</strong> để hiển thị hồ sơ: <code>GROUP BY user_id</code> + <code>COUNT</code>, nhiều → ít. Đây là câu SQL nằm trong <code>prepareStatement(...)</code> của trang profile.',
        starter: "-- API GET /api/users/stats\n-- Đếm post mỗi user, nhiều → ít\nSELECT ____, ____\n  FROM posts\n GROUP BY ____\n ORDER BY ____ DESC;",
        schema: {
          table_name: 'posts',
          columns: [
            { name: 'post_id', type: 'INT', key: 'PK' },
            { name: 'user_id', type: 'INT', key: 'FK' },
            { name: 'content', type: 'TEXT', key: '' },
            { name: 'created_at', type: 'DATE', key: '' }
          ],
          data: [
            ['501', '7',  'Elden Ring DLC ra rồi anh em ơi!', '2026-06-01'],
            ['502', '9',  'Tìm team leo rank tối nay',        '2026-06-01'],
            ['503', '7',  'Review tay cầm mới mua ở GameHub', '2026-06-02'],
            ['504', '12', 'Ai cày Hades 2 điểm danh',         '2026-06-03'],
            ['505', '9',  'Setup góc chơi game 15 triệu',     '2026-06-04'],
            ['506', '15', 'Mẹo farm rune nhanh gấp đôi',      '2026-06-05'],
            ['507', '7',  'GuildBoard sập, mọi người qua đây', '2026-06-06'],
            ['508', '9',  'Top 5 game indie tháng này',       '2026-06-07']
          ]
        },
        context: {
          scenario: 'Trang hồ sơ Community cần con số "đã đăng N bài" cho từng user. Backend sẽ nhét câu SQL này vào <code>prepareStatement</code> và chạy mỗi lần trang profile load — vì vậy nó phải đúng và gọn.',
          real_world: 'Con số "1.2K posts" trên mọi mạng cộng đồng (Reddit, Discord server stats) là đúng truy vấn này — <strong>đếm động</strong> từ bảng nội dung, chạy qua PreparedStatement với connection pool, hàng nghìn lần mỗi phút.',
          steps: [
            'Gộp theo tác giả: <code>GROUP BY user_id</code>.',
            'Đếm bài mỗi nhóm: <code>COUNT(*) AS post_count</code>.',
            'Chọn 2 cột trả cho API: <code>user_id, post_count</code>.',
            'Nhiều → ít: <code>ORDER BY post_count DESC</code>.'
          ],
          hint_explore: 'Xem dữ liệu Community non trẻ: <code>SELECT * FROM posts</code> rồi Run.',
          expected: 'Bảng vài dòng × 2 cột (<code>user_id, post_count</code>), giảm dần — user 7 và 9 đang đua top.'
        },
        hints: [
          { level: 1, text: 'Cần 2 cột: <code>user_id</code> và số bài của họ — đếm bằng <code>COUNT(*)</code>.' },
          { level: 2, text: 'Gộp: <code>GROUP BY user_id</code> — mỗi nhóm 1 tác giả.' },
          { level: 3, text: 'Đặt tên cột đếm: <code>COUNT(*) AS post_count</code> rồi <code>ORDER BY post_count DESC</code>.' },
          { level: 4, text: '<code class="code">SELECT user_id, COUNT(*) AS post_count FROM posts GROUP BY user_id ORDER BY post_count DESC;</code>' }
        ],
        expected_sql: 'SELECT user_id, COUNT(*) AS post_count FROM posts GROUP BY user_id ORDER BY post_count DESC;',
        success_message: 'Ticket #21 đóng! Backend Community đã nói chuyện được với database. Ticket #22: Functions & Stored Procedures — dạy database tự làm việc.',
        xp_reward: 120
      }
    },

    /* ═══════════ tc_02 — Ticket #22 · Functions & Stored Procedures ═══════════
     * Engine tier (plan §2): step-3 = zone đặc thù + expected_zones (CREATE PROCEDURE,
     * executeStation pass-through); step-4 = tier-2 pending (scan CREATE FUNCTION)
     * + equiv_sql chạy được (GROUP BY + COUNT đã verify ở tc_01). */
    {
      id: 'tc_02', index: 2,
      title: 'Functions & Stored Procedures — gói việc vào database',
      subtitle: 'delete_user(uid): một lệnh CALL, trọn quy trình, đúng thứ tự FK',
      module: 4, module_title: 'Advanced SQL',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'users',
          columns: ['user_id', 'username', 'country', 'joined_at'],
          dataRows: [
            ['7',  'minhkiller', 'VN', '2026-05-20'],
            ['9',  'yuki_sama',  'JP', '2026-05-21'],
            ['12', 'toxic_lord', 'VN', '2026-05-25'],
            ['15', 'sara_gg',    'US', '2026-06-01']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #22',
        hook: 'Community vừa nóng máy thì luật sư gửi email: user <code>toxic_lord</code> yêu cầu <strong>xóa vĩnh viễn tài khoản</strong> — quyền được lãng quên. Dev xóa tay: <code>users</code> trước → FK chặn đứng; xóa thiếu bảng → comment mồ côi lơ lửng. Ticket #22: gói cả quy trình vào <em>một thủ tục delete_user(uid)</em> nằm ngay trong database — gọi 1 lệnh, sạch đúng thứ tự, không sót gì.'
      },
      step_1: {
        primer: {
          goal: [
            'FUNCTION trả về GIÁ TRỊ — gọi được ngay trong SELECT như một cột',
            'PROCEDURE là GÓI HÀNH ĐỘNG — gọi bằng CALL, chạy tuần tự nhiều lệnh',
            'Xóa dữ liệu có FK: bảng CON sạch trước, bảng CHA (users) xóa cuối cùng'
          ],
          intro: 'Đến giờ mọi logic nằm ở backend — nhưng có những việc database tự làm tốt hơn: gom quy trình nhiều bước thành <strong>một đơn vị đặt tên được</strong>, chạy trọn trong database, mọi app (web, mobile, admin tool) gọi chung một cửa. <strong>Function</strong> = máy tính toán trả kết quả; <strong>Procedure</strong> = quy trình hành động. Cả hai được lưu NGAY TRONG schema — vì thế gọi là <em>stored</em>.',
          example: 'SQL: <code>CREATE PROCEDURE delete_user(uid INT) LANGUAGE SQL AS $$ DELETE ...; DELETE ...; $$;</code> — sau đó mọi nơi chỉ cần <code>CALL delete_user(12);</code>'
        },
        concept_cards: [
          {
            icon: 'fa-scale-balanced',
            title: 'Function ≠ Procedure',
            body: '<strong>Function</strong> nhận tham số, TRẢ VỀ giá trị — dùng trong SELECT như biểu thức: <code>SELECT username, count_posts(user_id) FROM users</code>. <strong>Procedure</strong> không cần trả gì — nó LÀM: gom nhiều lệnh, gọi bằng <code>CALL</code>.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 5.2 — Functions and Procedures'
          },
          {
            icon: 'fa-warehouse',
            title: 'Vì sao để logic TRONG database?',
            body: 'Một quy trình <code>delete_user</code> duy nhất — web, mobile, tool admin gọi CHUNG, không app nào tự chế bản riêng rồi quên bước (đúng bài học "1 nguồn chân lý" từ Ticket #03). Bonus: chạy sát dữ liệu, đỡ nhiều vòng round-trip mạng.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Xóa user 12 phải sạch MẤY bảng? <code>comments</code> của hắn <em>và comment của người khác trên POST của hắn</em> (<code>post_id IN (SELECT ...)</code>), rồi <code>posts</code>, cuối cùng mới <code>users</code>. Sai thứ tự → FK chặn; sót bảng → dữ liệu mồ côi.'
          }
        ],
        visual: {
          schema: {
            table_name: 'users',
            columns: [
              { name: 'user_id', type: 'INT', key: 'PK', icon: '🔑' },
              { name: 'username', type: 'VARCHAR', key: '', icon: '👤' },
              { name: 'country', type: 'VARCHAR', key: '', icon: '🌍' },
              { name: 'joined_at', type: 'DATE', key: '', icon: '📅' }
            ]
          },
          data_preview: [
            ['7',  'minhkiller', 'VN', '2026-05-20'],
            ['9',  'yuki_sama',  'JP', '2026-05-21'],
            ['12', 'toxic_lord', 'VN', '2026-05-25'],
            ['15', 'sara_gg',    'US', '2026-06-01']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Khác biệt CỐT LÕI giữa <code>FUNCTION</code> và <code>PROCEDURE</code>?',
            options: [
              { id: 'a', text: 'Function TRẢ VỀ giá trị nên gọi được ngay trong SELECT; Procedure là gói hành động, gọi bằng CALL', correct: true, explanation: 'Đúng — function = biểu thức tính toán (dùng trong SELECT), procedure = quy trình nhiều lệnh (CALL riêng).' },
              { id: 'b', text: 'Procedure chạy nhanh hơn Function', correct: false, explanation: 'Sai — tốc độ không phải điểm phân biệt; khác nhau ở TRẢ VỀ giá trị hay THỰC THI hành động.' },
              { id: 'c', text: 'Function phải viết bằng Java, Procedure bằng SQL', correct: false, explanation: 'Sai — cả hai viết được bằng SQL/PLpgSQL (và nhiều ngôn ngữ khác). Đừng nhầm với JDBC ở Ticket #21.' },
              { id: 'd', text: 'Procedure không được chứa câu SQL nào', correct: false, explanation: 'Sai — ngược lại: procedure tồn tại để GOM nhiều câu SQL thành một quy trình.' }
            ]
          },
          {
            question: 'Trong <code>delete_user</code>, vì sao phải DELETE <code>comments</code>/<code>posts</code> TRƯỚC rồi mới DELETE <code>users</code>?',
            options: [
              { id: 'a', text: 'FK từ bảng con trỏ vào users — xóa cha trước sẽ bị chặn (hoặc để lại dòng mồ côi)', correct: true, explanation: 'Đúng — posts.user_id và comments.user_id trỏ vào users: cha chỉ được xóa khi không còn ai tham chiếu.' },
              { id: 'b', text: 'Vì bảng users to nhất nên để xóa cuối cho đỡ chậm', correct: false, explanation: 'Sai — kích thước không liên quan; ràng buộc khóa ngoại mới là lý do.' },
              { id: 'c', text: 'Thứ tự nào cũng được — database tự sắp xếp lại', correct: false, explanation: 'Sai — database KHÔNG đảo thứ tự lệnh trong procedure; sai thứ tự là lỗi FK ngay.' },
              { id: 'd', text: 'Vì comments được tạo trước users về mặt thời gian', correct: false, explanation: 'Sai — thời điểm tạo bảng không liên quan; quan hệ FK con→cha quyết định thứ tự xóa.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Function hay Procedure?',
          instruction: 'Mỗi tình huống dưới đây nên viết thành FUNCTION hay PROCEDURE?',
          xp: 20,
          chips: [
            { id: 'c1', label: 'count_posts(uid) — trả về SỐ bài viết, dùng ngay trong SELECT' },
            { id: 'c2', label: 'delete_user(uid) — gom 3 lệnh DELETE chạy tuần tự' },
            { id: 'c3', label: 'account_age(joined_at) — trả về số ngày từ khi tham gia' },
            { id: 'c4', label: 'nightly_cleanup() — xóa post spam rồi ghi log, gọi bằng CALL' }
          ],
          bins: [
            { id: 'fn',   label: 'FUNCTION — trả về giá trị', correct: 'fn' },
            { id: 'proc', label: 'PROCEDURE — gói hành động', correct: 'proc' }
          ],
          solution: { c1: 'fn', c2: 'proc', c3: 'fn', c4: 'proc' }
        }
      },
      step_3: {
        mission: 'Luật sư đang chờ xác nhận. Đóng gói quy trình xóa thành <code>delete_user(uid)</code> — lắp các mảnh theo đúng thứ tự FK: con sạch trước, cha xóa cuối.',
        blocks: [
          { type: 'kw', token: 'CREATE PROCEDURE delete_user(uid INT) LANGUAGE SQL AS $$', slot: 'proc-head' },
          { type: 'op', token: 'DELETE FROM users WHERE user_id = uid;', slot: 'del-users' },
          { type: 'op', token: 'DELETE FROM comments WHERE user_id = uid OR post_id IN (SELECT post_id FROM posts WHERE user_id = uid);', slot: 'del-comments' },
          { type: 'op', token: 'DELETE FROM posts WHERE user_id = uid;', slot: 'del-posts' },
          { type: 'kw', token: '$$;', slot: 'proc-end' }
        ],
        drop_zones: [
          { id: 'proc-head', placeholder: 'CREATE PROCEDURE ____', accepts: ['kw'], acceptedKeywords: ['CREATE'], multi: false },
          { id: 'del-1', placeholder: 'DELETE thứ nhất — bảng không bị ai trỏ vào', accepts: ['op'], multi: false },
          { id: 'del-2', placeholder: 'DELETE thứ hai — con đã sạch thì tới lượt nó', accepts: ['op'], multi: false },
          { id: 'del-3', placeholder: 'DELETE cuối — bảng gốc', accepts: ['op'], multi: false },
          { id: 'proc-end', placeholder: 'đóng thân procedure ____', accepts: ['kw'], multi: false }
        ],
        expected_sql: 'CREATE PROCEDURE delete_user(uid INT) LANGUAGE SQL AS $$ DELETE FROM comments WHERE user_id = uid OR post_id IN (SELECT post_id FROM posts WHERE user_id = uid); DELETE FROM posts WHERE user_id = uid; DELETE FROM users WHERE user_id = uid; $$;',
        expected_zones: {
          'proc-head': 'CREATE PROCEDURE delete_user(uid INT) LANGUAGE SQL AS $$',
          'del-1': 'DELETE FROM comments WHERE user_id = uid OR post_id IN (SELECT post_id FROM posts WHERE user_id = uid);',
          'del-2': 'DELETE FROM posts WHERE user_id = uid;',
          'del-3': 'DELETE FROM users WHERE user_id = uid;',
          'proc-end': '$$;'
        },
        reveal_hints: {
          'proc-head': 'Mở đầu bằng khai báo: <strong>CREATE PROCEDURE delete_user(uid INT) LANGUAGE SQL AS $$</strong>.',
          'del-1': 'Nhìn FK: <code>comments</code> trỏ vào cả <code>posts</code> lẫn <code>users</code> — nhưng KHÔNG AI trỏ vào nó. Nhớ xóa cả comment trên post của user (mảnh có <code>IN</code>).',
          'del-2': '<code>comments</code> sạch rồi thì <code>posts</code> hết bị trỏ vào — xóa được.',
          'del-3': '<code>users</code> là gốc bị mọi bảng trỏ vào — chỉ xóa khi các con đã sạch.',
          'proc-end': 'Đóng thân: <strong>$$;</strong>'
        }
      },
      step_4: {
        prompt: 'Procedure là HÀNH ĐỘNG — giờ viết chiều ngược lại: một <strong>FUNCTION trả về giá trị</strong>. Trang hồ sơ cần <code>count_posts(uid)</code> đếm số bài của một user để gọi thẳng trong SELECT. Dùng cú pháp SQL-standard (Postgres 14+): <code>CREATE FUNCTION … RETURNS INT RETURN (truy vấn);</code>',
        starter: "-- Trang hồ sơ cần: count_posts(uid) -> INT\n-- Khung: CREATE FUNCTION ten(tham_so KIEU) RETURNS kieu RETURN (truy van);\nCREATE FUNCTION ____(uid INT) RETURNS ____\n  RETURN (SELECT ____ FROM posts WHERE ____);\n",
        schema: {
          table_name: 'posts',
          columns: [
            { name: 'post_id', type: 'INT', key: 'PK' },
            { name: 'user_id', type: 'INT', key: 'FK' },
            { name: 'content', type: 'TEXT', key: '' },
            { name: 'created_at', type: 'DATE', key: '' }
          ],
          data: [
            ['501', '7',  'Elden Ring DLC ra rồi anh em ơi!', '2026-06-01'],
            ['502', '9',  'Tìm team leo rank tối nay',        '2026-06-01'],
            ['503', '7',  'Review tay cầm mới mua ở GameHub', '2026-06-02'],
            ['504', '12', 'Ai cày Hades 2 điểm danh',         '2026-06-03'],
            ['505', '9',  'Setup góc chơi game 15 triệu',     '2026-06-04'],
            ['506', '15', 'Mẹo farm rune nhanh gấp đôi',      '2026-06-05'],
            ['507', '7',  'GuildBoard sập, mọi người qua đây', '2026-06-06'],
            ['508', '9',  'Top 5 game indie tháng này',       '2026-06-07']
          ]
        },
        /* Tier-2: CREATE FUNCTION → scan pending; validateSQL (DDL-guard) chấm; equiv render
         * bảng minh họa count_posts(7) qua GROUP BY (engine đã verify dạng này ở tc_01). */
        equiv_sql: 'SELECT user_id, COUNT(*) AS count_posts FROM posts WHERE user_id = 7 GROUP BY user_id;',
        context: {
          scenario: 'Trang hồ sơ gọi <code>SELECT username, count_posts(user_id) FROM users</code> — hàm của bạn chạy cho TỪNG dòng users. Viết một lần, mọi màn hình dùng chung, đổi cách đếm chỉ sửa 1 chỗ.',
          real_world: 'Các hệ lớn đặt hàm đếm/tính điểm ngay trong DB để <strong>mọi ngôn ngữ backend</strong> (Java, Python, Go) nhận cùng một con số — không còn cảnh mỗi service tự đếm một kiểu rồi lệch nhau.',
          steps: [
            'Khai tên + tham số: <code>CREATE FUNCTION count_posts(uid INT)</code>.',
            'Khai kiểu trả về: <code>RETURNS INT</code>.',
            'Thân = 1 biểu thức: <code>RETURN (SELECT COUNT(*) FROM posts WHERE user_id = uid);</code>',
            'Đối chiếu: user 7 (minhkiller) đang có 3 bài — hàm phải trả 3.'
          ],
          hint_explore: 'Đếm thử bằng tay trước: <code>SELECT * FROM posts</code> rồi Run — đếm số dòng có user_id = 7.',
          expected: 'Khung kết quả minh họa <code>count_posts(7)</code>: 1 dòng (user_id 7, count_posts 3). Engine demo không chạy được CREATE — đáp án chấm khi Run/Submit.'
        },
        hints: [
          { level: 1, text: 'Cấu trúc: <code>CREATE FUNCTION tên(tham_số KIỂU) RETURNS kiểu RETURN (truy vấn);</code> — thân hàm là MỘT biểu thức SELECT trong ngoặc.' },
          { level: 2, text: 'Tên <code>count_posts</code>, trả về <code>INT</code>. Truy vấn bên trong đếm bài: <code>COUNT(*)</code>.' },
          { level: 3, text: 'Lọc theo THAM SỐ, không phải số cụ thể: <code>WHERE user_id = uid</code>.' },
          { level: 4, text: '<code class="code">CREATE FUNCTION count_posts(uid INT) RETURNS INT RETURN (SELECT COUNT(*) FROM posts WHERE user_id = uid);</code>' }
        ],
        expected_sql: 'CREATE FUNCTION count_posts(uid INT) RETURNS INT RETURN (SELECT COUNT(*) FROM posts WHERE user_id = uid);',
        success_message: 'Ticket #22 đóng! Quy trình xóa giờ là MỘT lệnh CALL — luật sư hài lòng. Ticket #23: nút ❤ sắp lên sóng, và feed sẽ khựng nếu bạn không dạy database tự phản ứng.',
        xp_reward: 120
      }
    },

    /* ═══════════ tc_03 — Ticket #23 · Trigger ═══════════
     * Engine tier: step-3 = zone đặc thù + expected_zones (CREATE TRIGGER);
     * step-4 = tier-2 pending (UPDATE) + multi-query set-compare (tiền lệ Bài 19 Basic)
     * + equiv_sql SELECT like_count (chạy được). */
    {
      id: 'tc_03', index: 3,
      title: 'Trigger — database tự phản ứng',
      subtitle: 'AFTER INSERT ON likes: like_count tự nhảy, không ai phải nhớ gọi',
      module: 4, module_title: 'Advanced SQL',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'likes',
          columns: ['user_id', 'post_id', 'liked_at'],
          dataRows: [
            ['7',  '501', '2026-06-10'],
            ['9',  '501', '2026-06-10'],
            ['12', '501', '2026-06-11'],
            ['15', '507', '2026-06-11'],
            ['9',  '507', '2026-06-12']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #23',
        hook: 'Nút ❤ vừa lên sóng, feed lập tức khựng: hiện 50 post là bắn 50 câu <code>COUNT(*)</code> đếm like. Bạn thêm cột <code>like_count</code> vào <code>posts</code> cho nhanh — nhưng backend quên cập nhật ở đúng 1 chỗ, số hiển thị vênh số thật (bóng ma dữ liệu vênh từ Ticket #03 hiện về). Ticket #23: dạy database <em>tự phản ứng</em> — like rơi vào là <code>like_count</code> tự nhảy, không ai phải nhớ gọi.'
      },
      step_1: {
        primer: {
          goal: [
            'Trigger = phản xạ của database: SỰ KIỆN xảy ra → HÀNH ĐỘNG tự chạy, không ai gọi',
            'Khai báo đủ 4 phần: tên → thời điểm + sự kiện + bảng → phạm vi → hành động',
            'NEW = dòng vừa chèn/sửa; OLD = dòng vừa xóa/trước khi sửa'
          ],
          intro: 'Cột <code>like_count</code> là dữ liệu DẪN XUẤT — nó phải khớp với số dòng thật trong <code>likes</code>. Giao việc giữ khớp cho backend là giao cho trí nhớ con người. <strong>Trigger</strong> chuyển việc đó cho database: <em>"AFTER INSERT ON likes — cứ có dòng like mới, tự cộng 1 vào đúng post"</em>. App nào chèn like cũng vậy, kể cả admin gõ tay: phản xạ luôn chạy.',
          example: '<code>CREATE TRIGGER trg_like_count AFTER INSERT ON likes FOR EACH ROW EXECUTE FUNCTION bump_like_count();</code>'
        },
        concept_cards: [
          {
            icon: 'fa-bolt',
            title: 'Giải phẫu một trigger',
            body: 'Trigger là cơ chế <strong>Sự kiện → Hành động</strong>: <code>AFTER INSERT ON likes</code> (khi nào, trên bảng nào) + <code>FOR EACH ROW</code> (chạy cho TỪNG dòng bị chèn) + <code>EXECUTE FUNCTION …</code> (làm gì). Hệ thống tự kích hoạt — không lệnh nào phải gọi nó.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 5.3 — Triggers'
          },
          {
            icon: 'fa-code-compare',
            title: 'NEW và OLD — dòng nào đang nói?',
            body: 'Trong thân trigger: <code>NEW</code> = dòng VỪA vào (INSERT/UPDATE), <code>OLD</code> = dòng VỪA mất (DELETE/UPDATE). Like mới → <code>NEW.post_id</code> cho biết post nào +1; bỏ like → <code>OLD.post_id</code> cho biết post nào −1.'
          },
          {
            icon: 'fa-triangle-exclamation',
            title: 'Dao hai lưỡi (Apply)',
            body: 'Trigger chạy <em>vô hình</em> — dev mới vào đọc code app sẽ không thấy nó. Quy tắc nghề: chỉ dùng cho việc GIỮ DỮ LIỆU KHỚP (đếm dẫn xuất, audit log), đừng giấu business logic phức tạp vào trigger — debug "ma làm" là ác mộng có thật.'
          }
        ],
        visual: {
          schema: {
            table_name: 'posts',
            columns: [
              { name: 'post_id', type: 'INT', key: 'PK', icon: '🔑' },
              { name: 'user_id', type: 'INT', key: 'FK', icon: '🔗' },
              { name: 'content', type: 'TEXT', key: '', icon: '📝' },
              { name: 'like_count', type: 'INT', key: '', icon: '❤️' }
            ]
          },
          data_preview: [
            ['501', '7',  'Elden Ring DLC ra rồi anh em ơi!', '12'],
            ['502', '9',  'Tìm team leo rank tối nay',        '5'],
            ['503', '7',  'Review tay cầm mới mua ở GameHub', '8'],
            ['505', '9',  'Setup góc chơi game 15 triệu',     '9'],
            ['507', '7',  'GuildBoard sập, mọi người qua đây', '15']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Ai GỌI cho trigger <code>trg_like_count</code> chạy?',
            options: [
              { id: 'a', text: 'Không ai — database tự kích hoạt khi sự kiện khai báo (INSERT vào likes) xảy ra, bất kể lệnh đến từ app nào', correct: true, explanation: 'Đúng — đó là điểm ăn tiền: web, mobile, admin gõ tay… cứ chèn like là phản xạ chạy. Không phụ thuộc trí nhớ dev.' },
              { id: 'b', text: 'Backend phải gọi CALL trg_like_count() sau mỗi INSERT', correct: false, explanation: 'Sai — CALL là của procedure. Trigger tự chạy theo sự kiện, không gọi được trực tiếp.' },
              { id: 'c', text: 'Một cron job quét bảng likes mỗi phút', correct: false, explanation: 'Sai — cron là polling định kỳ (trễ + tốn). Trigger chạy NGAY trong giao dịch chèn like.' },
              { id: 'd', text: 'Người dùng bấm nút ❤ trên giao diện', correct: false, explanation: 'Sai — người dùng chỉ gây ra INSERT; trigger nghe sự kiện INSERT đó ở tầng database.' }
            ]
          },
          {
            question: 'Trong trigger <code>AFTER INSERT ON likes</code>, biến <code>NEW</code> chứa gì?',
            options: [
              { id: 'a', text: 'Dòng likes VỪA được chèn — NEW.post_id cho biết post nào vừa nhận tim', correct: true, explanation: 'Đúng — NEW là chính dòng gây ra sự kiện; nhờ nó hành động biết cộng 1 vào ĐÚNG post.' },
              { id: 'b', text: 'Dòng posts sắp được cập nhật', correct: false, explanation: 'Sai — NEW thuộc về bảng gắn trigger (likes); posts chỉ bị đụng tới trong THÂN hành động.' },
              { id: 'c', text: 'Toàn bộ bảng likes sau khi chèn', correct: false, explanation: 'Sai — FOR EACH ROW chạy từng dòng; NEW là đúng 1 dòng vừa chèn, không phải cả bảng.' },
              { id: 'd', text: 'Dòng cũ trước khi bị sửa', correct: false, explanation: 'Sai — đó là OLD (của UPDATE/DELETE). INSERT không có dòng cũ.' }
            ]
          }
        ],
        mini_game: {
          type: 'bug_spot',
          title: 'Tìm lỗi trong thân trigger',
          instruction: 'Trigger dưới đây làm feed loạn tim: MỌI post đều +1 khi bất kỳ ai like bất kỳ post nào. Click vào DÒNG có lỗi.',
          xp: 25,
          code: 'CREATE FUNCTION bump_like_count() RETURNS trigger AS $$\nBEGIN\n  UPDATE posts\n     SET like_count = like_count + 1;\n  RETURN NEW;\nEND; $$ LANGUAGE plpgsql;',
          bugType: 'logic',
          bugs: [
            { line: 4, description: 'UPDATE không có WHERE — cộng 1 vào like_count của TẤT CẢ posts. Phải khoanh đúng post vừa nhận tim: SET like_count = like_count + 1 WHERE post_id = NEW.post_id;' }
          ]
        }
      },
      step_3: {
        mission: 'Khai báo VỎ trigger đếm tim: tên → sự kiện → phạm vi → hành động. Trong khay có 2 khối mồi nhử — chọn cho đúng.',
        blocks: [
          { type: 'kw', token: 'CREATE TRIGGER trg_like_count', slot: 'trig-name' },
          { type: 'op', token: 'AFTER UPDATE ON posts', slot: 'trig-event-x' },
          { type: 'op', token: 'AFTER INSERT ON likes', slot: 'trig-event' },
          { type: 'op', token: 'FOR EACH STATEMENT', slot: 'trig-scope-x' },
          { type: 'op', token: 'FOR EACH ROW', slot: 'trig-scope' },
          { type: 'kw', token: 'EXECUTE FUNCTION bump_like_count();', slot: 'trig-action' }
        ],
        drop_zones: [
          { id: 'trig-name', placeholder: 'CREATE TRIGGER ____', accepts: ['kw'], acceptedKeywords: ['CREATE'], multi: false },
          { id: 'trig-event', placeholder: 'thời điểm + sự kiện + bảng nào?', accepts: ['op'], multi: false },
          { id: 'trig-scope', placeholder: 'chạy cho từng dòng hay cả lệnh?', accepts: ['op'], multi: false },
          { id: 'trig-action', placeholder: 'EXECUTE ____', accepts: ['kw'], multi: false }
        ],
        expected_sql: 'CREATE TRIGGER trg_like_count AFTER INSERT ON likes FOR EACH ROW EXECUTE FUNCTION bump_like_count();',
        expected_zones: {
          'trig-name': 'CREATE TRIGGER trg_like_count',
          'trig-event': 'AFTER INSERT ON likes',
          'trig-scope': 'FOR EACH ROW',
          'trig-action': 'EXECUTE FUNCTION bump_like_count();'
        },
        reveal_hints: {
          'trig-name': 'Khai tên trước: <strong>CREATE TRIGGER trg_like_count</strong>.',
          'trig-event': 'Sự kiện gốc là LIKE MỚI rơi vào bảng <code>likes</code> — không phải sửa trên <code>posts</code> (đó là hệ quả, không phải nguyên nhân).',
          'trig-scope': 'Chèn 10 like = cộng 10 lần riêng biệt → <strong>FOR EACH ROW</strong>. STATEMENT chỉ chạy 1 lần cho cả lệnh.',
          'trig-action': 'Việc cần làm nằm trong hàm: <strong>EXECUTE FUNCTION bump_like_count();</strong>'
        }
      },
      step_4: {
        prompt: 'Step 3 là VỎ — giờ viết RUỘT. Hai thân UPDATE cho hai phản xạ: <strong>like</strong> (sau INSERT — dùng <code>NEW</code>, +1) và <strong>bỏ like</strong> (sau DELETE — dùng <code>OLD</code>, −1). Viết CẢ HAI câu, mỗi câu kết thúc bằng <code>;</code>',
        starter: "-- Ruot trigger 1: sau INSERT INTO likes -> cong 1 cho DUNG post (dong vua chen = NEW)\n\n-- Ruot trigger 2: sau DELETE FROM likes -> tru 1 cho DUNG post (dong vua xoa = OLD)\n",
        schema: {
          table_name: 'posts',
          columns: [
            { name: 'post_id', type: 'INT', key: 'PK' },
            { name: 'user_id', type: 'INT', key: 'FK' },
            { name: 'content', type: 'TEXT', key: '' },
            { name: 'like_count', type: 'INT', key: '' }
          ],
          data: [
            ['501', '7',  'Elden Ring DLC ra rồi anh em ơi!', '12'],
            ['502', '9',  'Tìm team leo rank tối nay',        '5'],
            ['503', '7',  'Review tay cầm mới mua ở GameHub', '8'],
            ['504', '12', 'Ai cày Hades 2 điểm danh',         '2'],
            ['505', '9',  'Setup góc chơi game 15 triệu',     '9'],
            ['506', '15', 'Mẹo farm rune nhanh gấp đôi',      '7'],
            ['507', '7',  'GuildBoard sập, mọi người qua đây', '15'],
            ['508', '9',  'Top 5 game indie tháng này',       '4']
          ]
        },
        /* Tier-2: UPDATE → scan pending; validateSQL multi-query set-compare (2 câu, tiền lệ
         * Bài 19 Basic); equiv render bảng posts theo like_count (chạy được). */
        equiv_sql: 'SELECT post_id, content, like_count FROM posts ORDER BY like_count DESC;',
        context: {
          scenario: 'Hai trigger <code>AFTER INSERT ON likes</code> và <code>AFTER DELETE ON likes</code> cùng trỏ vào hai hàm — bạn viết chính hai câu UPDATE nằm trong ruột hai hàm đó. Cộng thì theo dòng VỪA CHÈN, trừ thì theo dòng VỪA XÓA.',
          real_world: 'Số tim trên mọi mạng xã hội lớn là <strong>counter dẫn xuất</strong> được duy trì đúng kiểu này (trigger hoặc job tương đương) — không hệ nào dám COUNT(*) bảng likes hàng tỷ dòng mỗi lần render feed.',
          steps: [
            'Phản xạ like: <code>UPDATE posts SET like_count = like_count + 1</code>…',
            '…nhưng chỉ cho ĐÚNG post vừa nhận tim: <code>WHERE post_id = NEW.post_id;</code>',
            'Phản xạ bỏ like: như trên nhưng <code>− 1</code> và dòng vừa xóa là <code>OLD.post_id</code>.',
            'Đối chiếu bug_spot ở Step 2: thiếu WHERE là loạn cả feed.'
          ],
          hint_explore: 'Xem trạng thái tim hiện tại: <code>SELECT post_id, content, like_count FROM posts</code> rồi Run.',
          expected: 'Bảng posts xếp theo tim giảm dần — post 507 (GuildBoard sập) đang dẫn đầu với 15 tim. Hai câu UPDATE của bạn chính là thứ giữ cột này luôn ĐÚNG.'
        },
        hints: [
          { level: 1, text: 'Cần 2 câu <code>UPDATE posts SET like_count = …</code> — một câu +1, một câu −1. Mỗi câu phải có WHERE khoanh đúng post.' },
          { level: 2, text: 'Trigger INSERT nhìn thấy dòng like vừa chèn qua <code>NEW</code> → <code>WHERE post_id = NEW.post_id</code>.' },
          { level: 3, text: 'Trigger DELETE không có NEW — dòng vừa biến mất nằm trong <code>OLD</code> → <code>WHERE post_id = OLD.post_id</code>.' },
          { level: 4, text: '<code class="code">UPDATE posts SET like_count = like_count + 1 WHERE post_id = NEW.post_id;<br>UPDATE posts SET like_count = like_count - 1 WHERE post_id = OLD.post_id;</code>' }
        ],
        expected_sql: 'UPDATE posts SET like_count = like_count + 1 WHERE post_id = NEW.post_id; UPDATE posts SET like_count = like_count - 1 WHERE post_id = OLD.post_id;',
        success_message: 'Ticket #23 đóng! Feed hiện tim tức thì, số không bao giờ vênh — và không dev nào phải "nhớ" gì cả. Ticket #24: một cuộc khẩu chiến 3 tầng reply đang chờ bạn gom về đủ bộ.',
        xp_reward: 120
      }
    },

    /* ═══════════ tc_04 — Ticket #24 · Recursive Queries (WITH RECURSIVE) ═══════════
     * Engine tier: step-3 = zone đặc thù + expected_zones; step-4 = tier-2 pending
     * (WITH RECURSIVE — engine không chạy đệ quy, KHÔNG equiv: kết quả mô tả trong context;
     * chấm bằng validateSQL exact-match + DDL-guard). Kết thúc M4 → SHIP COMMUNITY v1.0. */
    {
      id: 'tc_04', index: 4,
      title: 'Recursive Queries — WITH RECURSIVE',
      subtitle: 'Duyệt cây bình luận sâu n tầng trong một truy vấn duy nhất',
      module: 4, module_title: 'Advanced SQL',
      estimated_minutes: 22, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'comments',
          columns: ['comment_id', 'post_id', 'user_id', 'parent_comment_id', 'content'],
          dataRows: [
            ['1', '507', '9',  'NULL', 'Chuyển hết qua đây là đúng rồi'],
            ['2', '507', '7',  '1',    'Đồng ý, GuildBoard lag quá'],
            ['3', '507', '12', '1',    'Chê. Feed ở đây trống trơn'],
            ['4', '507', '9',  '3',    'Trống vì ông chưa follow ai kìa'],
            ['5', '507', '15', 'NULL', 'Admin GuildBoard là bạn tôi đấy nhé'],
            ['6', '507', '12', '5',    'Thế càng phải nâng cấp server đi'],
            ['7', '507', '7',  'NULL', 'Ai cũng qua thì server lại cháy tiếp'],
            ['8', '507', '12', '6',    'Nâng xong lại sập thì sao =))']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #24',
        hook: 'Post "GuildBoard sập" nổ ra <strong>cuộc khẩu chiến 3 tầng reply</strong> — UI cần vẽ cả cây, nhưng SELECT thường chỉ với tới 1 tầng con; mỗi JOIN viết thêm chỉ +1 tầng, mà drama thì không báo trước sâu bao nhiêu. Ticket #24: <em>WITH RECURSIVE</em> — mồi bằng comment gốc, lặp nối con vào tới khi hết. Đóng ticket này là đủ bộ: <strong>Community v1.0 lên kệ</strong>. 🚀'
      },
      step_1: {
        primer: {
          goal: [
            'Self-FK (parent_comment_id trỏ về chính bảng comments) = cấu trúc CÂY trong 1 bảng',
            'WITH RECURSIVE = anchor (hàng mồi) + UNION ALL + bước đệ quy tự tham chiếu CTE',
            'Đệ quy tự DỪNG khi một vòng không sinh thêm dòng mới (fixed point)'
          ],
          intro: 'Cây bình luận không có "số tầng" cố định — reply của reply của reply, sâu tùy drama. SQL thường bó tay vì mỗi JOIN chỉ đào thêm đúng 1 tầng. <strong>WITH RECURSIVE</strong> giải bằng vòng lặp trong chính truy vấn: <em>anchor</em> chọn hàng khởi đầu (comment gốc, depth 1), rồi bước <em>đệ quy</em> JOIN bảng với CHÍNH kết quả vòng trước để lấy tầng con — lặp tới khi không còn gì mới.',
          example: '<code>WITH RECURSIVE thread AS (SELECT …, 1 AS depth … UNION ALL SELECT …, t.depth + 1 … JOIN thread t …) SELECT * FROM thread;</code>'
        },
        concept_cards: [
          {
            icon: 'fa-sitemap',
            title: 'Cây nằm trong 1 bảng',
            body: '<code>comments.parent_comment_id</code> là FK trỏ về CHÍNH <code>comments</code> — mỗi dòng biết cha của nó, gốc thì <code>NULL</code>. Một bảng, vô hạn tầng: đây là cách Reddit, Facebook lưu cây bình luận.'
          },
          {
            icon: 'fa-rotate',
            title: 'Giải phẫu WITH RECURSIVE',
            body: 'Hai nửa nối bằng <code>UNION ALL</code>: nửa <strong>anchor</strong> không tự tham chiếu (chọn hàng mồi); nửa <strong>đệ quy</strong> JOIN với CHÍNH tên CTE để nối tầng con của kết quả vòng trước. Lặp tới khi một vòng trả 0 dòng.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 5.4 — Recursive Queries'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Đếm tay với cây bên: anchor lấy #1 (depth 1) → vòng 1 nối #2, #3 (depth 2) → vòng 2 nối #4 (depth 3) → vòng 3 không còn con nào mới → DỪNG. Cột <code>depth</code> tự tăng <code>t.depth + 1</code> qua từng vòng — UI thụt lề theo đúng cột này.'
          }
        ],
        visual: {
          schema: {
            table_name: 'comments',
            columns: [
              { name: 'comment_id', type: 'INT', key: 'PK', icon: '🔑' },
              { name: 'post_id', type: 'INT', key: 'FK', icon: '🔗' },
              { name: 'user_id', type: 'INT', key: 'FK', icon: '👤' },
              { name: 'parent_comment_id', type: 'INT', key: 'FK↩', icon: '🌳' },
              { name: 'content', type: 'TEXT', key: '', icon: '💬' }
            ]
          },
          data_preview: [
            ['1', '507', '9',  'NULL', 'Chuyển hết qua đây là đúng rồi'],
            ['2', '507', '7',  '1',    'Đồng ý, GuildBoard lag quá'],
            ['3', '507', '12', '1',    'Chê. Feed ở đây trống trơn'],
            ['4', '507', '9',  '3',    'Trống vì ông chưa follow ai kìa'],
            ['5', '507', '15', 'NULL', 'Admin GuildBoard là bạn tôi đấy nhé'],
            ['6', '507', '12', '5',    'Thế càng phải nâng cấp server đi']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Vì sao JOIN thường KHÔNG gom nổi cả cây comment?',
            options: [
              { id: 'a', text: 'Mỗi self-JOIN viết thêm chỉ đào sâu ĐÚNG 1 tầng — cây không báo trước độ sâu thì không biết cần bao nhiêu JOIN', correct: true, explanation: 'Đúng — 3 tầng cần 2 JOIN, 10 tầng cần 9 JOIN… mà drama thì không hứa trước sẽ dừng ở tầng mấy. Đệ quy lặp TỚI KHI HẾT — không cần biết trước.' },
              { id: 'b', text: 'SQL cấm JOIN một bảng với chính nó', correct: false, explanation: 'Sai — self-join hoàn toàn hợp lệ (comments c JOIN comments p ON …); vấn đề là mỗi JOIN chỉ thêm 1 tầng.' },
              { id: 'c', text: 'JOIN chỉ dùng được cho đúng 2 bảng', correct: false, explanation: 'Sai — JOIN nối bao nhiêu bảng cũng được; giới hạn ở đây là SỐ TẦNG phải biết trước.' },
              { id: 'd', text: 'Bảng comments quá nhiều dòng nên JOIN sẽ sập', correct: false, explanation: 'Sai — kích thước không phải vấn đề cốt lõi; cấu trúc lặp không-biết-trước-độ-sâu mới là thứ JOIN tĩnh không tả nổi.' }
            ]
          },
          {
            question: 'Trong <code>WITH RECURSIVE</code>, phần ANCHOR là gì?',
            options: [
              { id: 'a', text: 'Truy vấn KHÔNG tự tham chiếu — tạo hàng khởi đầu (comment gốc) làm mồi cho vòng lặp', correct: true, explanation: 'Đúng — anchor chạy đúng 1 lần, cho đệ quy điểm xuất phát (và depth khởi điểm). Không có mồi thì vòng lặp không có gì để nối.' },
              { id: 'b', text: 'Phần JOIN với chính tên CTE', correct: false, explanation: 'Sai — đó là RECURSIVE MEMBER (bước lặp). Anchor thì tuyệt đối không được tham chiếu CTE.' },
              { id: 'c', text: 'Lệnh chỉ định khi nào dừng đệ quy', correct: false, explanation: 'Sai — không có lệnh dừng riêng: đệ quy tự dừng khi một vòng không sinh dòng mới.' },
              { id: 'd', text: 'Chỉ mục (index) tăng tốc cho CTE', correct: false, explanation: 'Sai — anchor là một nửa TRUY VẤN của CTE, không liên quan index.' }
            ]
          }
        ],
        mini_game: {
          type: 'match',
          title: 'Nối mảnh CTE → vai trò',
          instruction: 'Mỗi mảnh của WITH RECURSIVE đóng vai gì? Click ô trái rồi click ô phải tương ứng.',
          xp: 25,
          pairs: [
            { left: 'SELECT …, 1 AS depth WHERE parent_comment_id IS NULL', leftId: 'p1', rightId: 'r1', right: { id: 'r1', label: 'Anchor — hàng mồi khởi đầu của cây' } },
            { left: 'UNION ALL', leftId: 'p2', rightId: 'r2', right: { id: 'r2', label: 'Nối kết quả các vòng lặp, giữ đủ mọi dòng' } },
            { left: 'JOIN thread t ON c.parent_comment_id = t.comment_id', leftId: 'p3', rightId: 'r3', right: { id: 'r3', label: 'Bước đệ quy — lấy tầng CON của vòng trước' } },
            { left: 'SELECT * FROM thread', leftId: 'p4', rightId: 'r4', right: { id: 'r4', label: 'Đọc kết quả cuối từ CTE' } }
          ],
          solution: { p1: 'r1', p2: 'r2', p3: 'r3', p4: 'r4' }
        }
      },
      step_3: {
        mission: 'Gom cả thread dưới comment gốc <code>#1</code>: mồi anchor → UNION ALL → bước đệ quy → đọc kết quả. Trong khay có khối mồi nhử.',
        blocks: [
          { type: 'kw', token: 'WITH RECURSIVE thread AS (', slot: 'cte-head' },
          { type: 'op', token: 'SELECT * FROM comments', slot: 'cte-anchor-x' },
          { type: 'op', token: 'SELECT comment_id, content, 1 AS depth FROM comments WHERE comment_id = 1', slot: 'cte-anchor' },
          { type: 'kw', token: 'UNION', slot: 'cte-union-x' },
          { type: 'kw', token: 'UNION ALL', slot: 'cte-union' },
          { type: 'op', token: 'SELECT c.comment_id, c.content, t.depth + 1 FROM comments c JOIN thread t ON c.parent_comment_id = t.comment_id', slot: 'cte-step' },
          { type: 'kw', token: ') SELECT * FROM thread;', slot: 'cte-final' }
        ],
        drop_zones: [
          { id: 'cte-head', placeholder: 'WITH ____', accepts: ['kw'], acceptedKeywords: ['WITH'], multi: false },
          { id: 'cte-anchor', placeholder: 'anchor — hàng mồi (comment gốc, depth 1)', accepts: ['op'], multi: false },
          { id: 'cte-union', placeholder: 'nối anchor với các vòng lặp', accepts: ['kw'], multi: false },
          { id: 'cte-step', placeholder: 'bước đệ quy — JOIN với chính CTE', accepts: ['op'], multi: false },
          { id: 'cte-final', placeholder: ') đọc kết quả từ CTE', accepts: ['kw'], multi: false }
        ],
        expected_sql: 'WITH RECURSIVE thread AS ( SELECT comment_id, content, 1 AS depth FROM comments WHERE comment_id = 1 UNION ALL SELECT c.comment_id, c.content, t.depth + 1 FROM comments c JOIN thread t ON c.parent_comment_id = t.comment_id ) SELECT * FROM thread;',
        expected_zones: {
          'cte-head': 'WITH RECURSIVE thread AS (',
          'cte-anchor': 'SELECT comment_id, content, 1 AS depth FROM comments WHERE comment_id = 1',
          'cte-union': 'UNION ALL',
          'cte-step': 'SELECT c.comment_id, c.content, t.depth + 1 FROM comments c JOIN thread t ON c.parent_comment_id = t.comment_id',
          'cte-final': ') SELECT * FROM thread;'
        },
        reveal_hints: {
          'cte-head': 'Mở CTE đệ quy: <strong>WITH RECURSIVE thread AS (</strong>.',
          'cte-anchor': 'Anchor KHÔNG tự tham chiếu — chọn hàng mồi <code>comment_id = 1</code> với <code>1 AS depth</code>. Khối "SELECT * FROM comments" lấy TẤT CẢ là mồi nhử.',
          'cte-union': 'Cần giữ ĐỦ mọi dòng qua các vòng: <strong>UNION ALL</strong> (UNION thường sẽ khử trùng lặp — vừa chậm vừa có thể dừng sớm).',
          'cte-step': 'Bước lặp JOIN bảng gốc với CHÍNH <code>thread</code>: con nào có <code>parent_comment_id</code> = comment của vòng trước thì vào, depth +1.',
          'cte-final': 'Đóng ngoặc rồi đọc: <strong>) SELECT * FROM thread;</strong>'
        }
      },
      step_4: {
        prompt: 'Mod team cần <strong>bản đồ độ sâu drama</strong>: mỗi TẦNG có bao nhiêu bình luận trên toàn post. Khác Step 3 hai chỗ: anchor lấy <strong>MỌI comment gốc</strong> (<code>parent_comment_id IS NULL</code>), và cuối cùng <strong>GROUP BY depth</strong> để đếm.',
        starter: "-- Ban do do sau: moi tang (depth) co bao nhieu binh luan?\n-- anchor: MOI comment goc (parent IS NULL), depth = 1\n-- de quy: con cua vong truoc, depth + 1\n-- cuoi: dem theo depth\nWITH RECURSIVE thread AS (\n  SELECT ____, 1 AS depth FROM comments WHERE ____\n  UNION ALL\n  SELECT ____, t.depth + 1 FROM comments c JOIN thread t ON ____\n)\nSELECT ____, COUNT(*) AS so_binh_luan FROM thread GROUP BY ____ ORDER BY depth;\n",
        schema: {
          table_name: 'comments',
          columns: [
            { name: 'comment_id', type: 'INT', key: 'PK' },
            { name: 'post_id', type: 'INT', key: 'FK' },
            { name: 'user_id', type: 'INT', key: 'FK' },
            { name: 'parent_comment_id', type: 'INT', key: 'FK↩' },
            { name: 'content', type: 'TEXT', key: '' }
          ],
          data: [
            ['1', '507', '9',  'NULL', 'Chuyển hết qua đây là đúng rồi'],
            ['2', '507', '7',  '1',    'Đồng ý, GuildBoard lag quá'],
            ['3', '507', '12', '1',    'Chê. Feed ở đây trống trơn'],
            ['4', '507', '9',  '3',    'Trống vì ông chưa follow ai kìa'],
            ['5', '507', '15', 'NULL', 'Admin GuildBoard là bạn tôi đấy nhé'],
            ['6', '507', '12', '5',    'Thế càng phải nâng cấp server đi'],
            ['7', '507', '7',  'NULL', 'Ai cũng qua thì server lại cháy tiếp'],
            ['8', '507', '12', '6',    'Nâng xong lại sập thì sao =))']
          ]
        },
        /* Tier-2 KHÔNG equiv: engine không chạy đệ quy — kết quả kỳ vọng mô tả ở context;
         * chấm = validateSQL exact-match (DDL-guard "WITH RECURSIVE" chặn thiếu vỏ). */
        context: {
          scenario: 'Dashboard mod hiển thị "drama sâu mấy tầng, tầng nào đông nhất" — một truy vấn đệ quy gắn thêm GROUP BY là xong, không cần vòng lặp nào ở backend.',
          real_world: 'Cùng bộ xương này, đổi bảng là thành: cây thư mục, sơ đồ tổ chức (nhân viên → sếp), bill of materials trong sản xuất — <strong>WITH RECURSIVE là công cụ chuẩn cho mọi dữ liệu phân cấp</strong>.',
          steps: [
            'Anchor lấy MỌI gốc: <code>WHERE parent_comment_id IS NULL</code>, khởi điểm <code>1 AS depth</code>.',
            'Bước đệ quy giữ nguyên logic Step 3: <code>ON c.parent_comment_id = t.comment_id</code>, depth + 1.',
            'SELECT cuối KHÔNG lấy *, mà đếm: <code>SELECT depth, COUNT(*) AS so_binh_luan … GROUP BY depth</code>.',
            'Nhẩm trước với 8 comment: gốc #1 #5 #7 → depth 1 có 3; #2 #3 #6 → depth 2 có 3; #4 #8 → depth 3 có 2.'
          ],
          hint_explore: 'Nhìn cây bằng mắt thường trước: <code>SELECT comment_id, parent_comment_id, content FROM comments</code> rồi Run.',
          expected: 'Kết quả kỳ vọng (engine demo chưa chạy được đệ quy — chấm khi Submit): 3 dòng — depth 1 → 3 · depth 2 → 3 · depth 3 → 2.'
        },
        hints: [
          { level: 1, text: 'Bộ xương y hệt Step 3: <code>WITH RECURSIVE thread AS (anchor UNION ALL bước_đệ_quy) SELECT cuối;</code> — chỉ đổi anchor và SELECT cuối.' },
          { level: 2, text: 'Anchor: <code>SELECT comment_id, 1 AS depth FROM comments WHERE parent_comment_id IS NULL</code> — mọi comment gốc, không phải riêng #1.' },
          { level: 3, text: 'Bước đệ quy: <code>SELECT c.comment_id, t.depth + 1 FROM comments c JOIN thread t ON c.parent_comment_id = t.comment_id</code>.' },
          { level: 4, text: '<code class="code">WITH RECURSIVE thread AS (SELECT comment_id, 1 AS depth FROM comments WHERE parent_comment_id IS NULL UNION ALL SELECT c.comment_id, t.depth + 1 FROM comments c JOIN thread t ON c.parent_comment_id = t.comment_id) SELECT depth, COUNT(*) AS so_binh_luan FROM thread GROUP BY depth ORDER BY depth;</code>' }
        ],
        expected_sql: 'WITH RECURSIVE thread AS (SELECT comment_id, 1 AS depth FROM comments WHERE parent_comment_id IS NULL UNION ALL SELECT c.comment_id, t.depth + 1 FROM comments c JOIN thread t ON c.parent_comment_id = t.comment_id) SELECT depth, COUNT(*) AS so_binh_luan FROM thread GROUP BY depth ORDER BY depth;',
        success_message: 'Ticket #24 đóng — Module 4 hoàn tất, GameHub Community v1.0 chính thức lên kệ! 🚀 Module 5: sếp muốn dashboard số liệu toàn mạng — hẹn gặp ở Data Warehouse.',
        xp_reward: 120
      }
    }
  ]
};
