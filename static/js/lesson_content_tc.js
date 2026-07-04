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
    },

    /* ═══════════ MODULE 5 — Big Data & Analytics (Ticket #25-#30) ═══════════
     * Kho chung: fact_post_action (mỗi dòng = 1 nhóm hành động, số đo act_count)
     * + dim_date + dim_user. Engine probe 2026-07-04: SUM/GROUP BY 2 cột/JOIN 2-3 bảng/
     * HAVING đều chạy THẬT (tier-1); ROLLUP/CUBE bị engine trả SAI im lặng → scan chặn
     * thành pending (tier-2). */

    /* ── tc_05 — Ticket #25 · Star Schema (tier-1: chạy thật toàn bộ) ── */
    {
      id: 'tc_05', index: 5,
      title: 'Star Schema — Fact & Dimension',
      subtitle: 'Tách kho phân tích khỏi bảng đang phục vụ feed: FACT ở giữa, DIM tỏa tia',
      module: 5, module_title: 'Big Data & Analytics',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'fact_post_action',
          columns: ['action_id', 'user_id', 'date_id', 'action_type', 'act_count'],
          dataRows: [
            ['1',  '7',  'D1', 'like',    '3'],
            ['2',  '9',  'D1', 'comment', '2'],
            ['3',  '12', 'D1', 'post',    '1'],
            ['4',  '7',  'D2', 'like',    '5'],
            ['5',  '9',  'D2', 'like',    '4'],
            ['6',  '12', 'D2', 'comment', '3'],
            ['7',  '15', 'D2', 'like',    '2'],
            ['8',  '9',  'D3', 'post',    '1']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #25',
        hook: 'Community v1.0 vừa lên kệ thì sếp mở laptop: <strong>"Hôm qua toàn mạng bao nhiêu like? Nước nào sôi động nhất?"</strong> — mỗi câu là một query cào thẳng bảng đang phục vụ feed, người dùng lại kêu lag (bệnh cũ Ticket #23). Ticket #25: dựng kho phân tích riêng — bảng <em>FACT</em> ghi số đo, quay quanh các bảng <em>DIM</em> ngày tháng & người dùng. Câu hỏi nặng từ nay có sân riêng.'
      },
      step_1: {
        primer: {
          goal: [
            'OLTP phục vụ app (ghi/đọc từng dòng) ≠ OLAP phục vụ phân tích (quét & cộng hàng triệu dòng)',
            'FACT = bảng số đo cộng được (act_count), mỗi dòng trỏ vào các chiều bằng FK',
            'DIM = bảng chiều để cắt dữ liệu: dim_date (ngày/tháng/thứ), dim_user (nước)'
          ],
          intro: 'Bảng <code>posts/likes</code> được thiết kế để app ghi nhanh từng thao tác — KHÔNG phải để quét 38 triệu dòng tính tổng mỗi lần sếp hỏi. Kho phân tích tổ chức lại theo hình NGÔI SAO: giữa là <strong>fact_post_action</strong> (mỗi dòng = "user X, ngày Y, làm hành động Z, act_count lần"), các tia là <strong>dim_date</strong>, <strong>dim_user</strong>. Muốn cắt theo chiều nào, JOIN sang dim đó.',
          example: '<code>SELECT d.full_date, COUNT(*) FROM fact_post_action f JOIN dim_date d ON f.date_id = d.date_id GROUP BY d.full_date;</code> — "mỗi ngày bao nhiêu nhóm hành động".'
        },
        concept_cards: [
          {
            icon: 'fa-star',
            title: 'Fact ở giữa, Dimension tỏa tia',
            body: 'Bảng <strong>fact</strong> chứa SỐ ĐO (measure — cộng/đếm được) + FK trỏ vào các bảng <strong>dimension</strong> mô tả ngữ cảnh (ai, khi nào, loại gì). Vẽ ra đúng hình ngôi sao — vì thế gọi là <em>star schema</em>.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 11 — Data Warehousing'
          },
          {
            icon: 'fa-truck-ramp-box',
            title: 'ETL — hàng đêm chuyển kho',
            body: 'Dữ liệu KHÔNG sinh ra trong kho: job <strong>ETL</strong> (Extract-Transform-Load) chạy đêm, gom likes/posts/comments của ngày, đếm sẵn thành <code>act_count</code>, nạp vào fact. Feed ban ngày không hề bị đụng — hai thế giới tách hẳn.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Câu "nước nào nhiều like nhất?" trên kho = JOIN <code>fact</code> với <code>dim_user</code> rồi <code>SUM(act_count)</code> theo <code>country</code>. Cùng câu đó trên OLTP phải quét cả bảng likes 38M dòng + JOIN users — đắt gấp nghìn lần.'
          }
        ],
        visual: {
          schema: {
            table_name: 'fact_post_action',
            columns: [
              { name: 'action_id', type: 'INT', key: 'PK', icon: '🔑' },
              { name: 'user_id', type: 'INT', key: 'FK→dim_user', icon: '👤' },
              { name: 'date_id', type: 'VARCHAR', key: 'FK→dim_date', icon: '📅' },
              { name: 'action_type', type: 'VARCHAR', key: '', icon: '⚡' },
              { name: 'act_count', type: 'INT', key: 'measure', icon: '🔢' }
            ]
          },
          data_preview: [
            ['1',  '7',  'D1', 'like',    '3'],
            ['2',  '9',  'D1', 'comment', '2'],
            ['3',  '12', 'D1', 'post',    '1'],
            ['4',  '7',  'D2', 'like',    '5'],
            ['5',  '9',  'D2', 'like',    '4'],
            ['6',  '12', 'D2', 'comment', '3']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Vì sao KHÔNG chạy query dashboard thẳng trên bảng <code>likes</code> của app?',
            options: [
              { id: 'a', text: 'Quét + cộng hàng chục triệu dòng sẽ giành tài nguyên với chính feed đang phục vụ người dùng', correct: true, explanation: 'Đúng — OLTP tối ưu cho ghi/đọc từng dòng; một query phân tích quét cả bảng là feed khựng ngay (đã nếm ở Ticket #23).' },
              { id: 'b', text: 'Vì bảng likes không JOIN được với bảng khác', correct: false, explanation: 'Sai — JOIN được bình thường; vấn đề là TẢI, không phải khả năng.' },
              { id: 'c', text: 'Vì SQL không tính được SUM trên bảng lớn', correct: false, explanation: 'Sai — SUM chạy được, chỉ là chạy CHẬM và chèn ép app đang sống.' },
              { id: 'd', text: 'Vì dashboard cần dữ liệu realtime từng giây', correct: false, explanation: 'Sai — ngược lại: dashboard chịu được độ trễ 1 ngày (ETL đêm); realtime là chuyện của Ticket #30.' }
            ]
          },
          {
            question: 'Trong star schema, cột nào là <strong>số đo (measure)</strong> đúng nghĩa?',
            options: [
              { id: 'a', text: 'act_count trong fact_post_action — con số cộng/đếm được qua mọi chiều', correct: true, explanation: 'Đúng — measure nằm trong FACT; mọi câu hỏi phân tích quy về SUM/COUNT nó theo các chiều.' },
              { id: 'b', text: 'country trong dim_user', correct: false, explanation: 'Sai — country là THUỘC TÍNH CHIỀU để cắt (GROUP BY), không cộng được.' },
              { id: 'c', text: 'full_date trong dim_date', correct: false, explanation: 'Sai — ngày tháng là chiều thời gian; "cộng hai ngày" không có nghĩa.' },
              { id: 'd', text: 'date_id — vì nó xuất hiện ở cả fact lẫn dim', correct: false, explanation: 'Sai — date_id là KHÓA nối fact↔dim, không phải số đo.' }
            ]
          }
        ],
        mini_game: {
          type: 'match',
          title: 'Nối thành phần kho → vai trò',
          instruction: 'Mỗi mảnh của kho phân tích đóng vai gì? Click ô trái rồi ô phải tương ứng.',
          xp: 20,
          pairs: [
            { left: 'fact_post_action', leftId: 's1', rightId: 'r1', right: { id: 'r1', label: 'Bảng SỐ ĐO — trung tâm ngôi sao, chứa act_count' } },
            { left: 'dim_date', leftId: 's2', rightId: 'r2', right: { id: 'r2', label: 'Chiều thời gian — cắt theo ngày/tháng/thứ' } },
            { left: 'dim_user', leftId: 's3', rightId: 'r3', right: { id: 'r3', label: 'Chiều người dùng — cắt theo nước' } },
            { left: 'Job ETL chạy đêm', leftId: 's4', rightId: 'r4', right: { id: 'r4', label: 'Đường chuyển: gom OLTP → đếm sẵn → nạp kho' } }
          ],
          solution: { s1: 'r1', s2: 'r2', s3: 'r3', s4: 'r4' }
        }
      },
      step_3: {
        mission: 'Câu hỏi đầu tiên của sếp: <strong>"Ngày nào toàn mạng sôi động nhất?"</strong> — đếm số nhóm hành động MỖI NGÀY, nhiều → ít. JOIN kho fact với chiều thời gian.',
        blocks: [
          { type: 'kw', token: 'SELECT', slot: 'kw-select' },
          { type: 'col', token: 'd.full_date', slot: 'col-1' },
          { type: 'fn', token: 'COUNT(*) AS actions', slot: 'fn-1' },
          { type: 'kw', token: 'FROM', slot: 'kw-from' },
          { type: 'tbl', token: 'fact_post_action f', slot: 'tbl' },
          { type: 'op', token: 'JOIN dim_date d ON f.date_id = d.date_id', slot: 'op-join' },
          { type: 'kw', token: 'GROUP BY', slot: 'kw-group' },
          { type: 'col', token: 'd.full_date', slot: 'col-g' },
          { type: 'kw', token: 'ORDER BY', slot: 'kw-order' },
          { type: 'col', token: 'actions DESC', slot: 'col-o' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____', accepts: ['kw', 'col', 'fn'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line', placeholder: 'FROM ____ JOIN ____', accepts: ['kw', 'tbl', 'op'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'group-line', placeholder: 'GROUP BY ____', accepts: ['kw', 'col'], acceptedKeywords: ['GROUP BY'], multi: true },
          { id: 'order-line', placeholder: 'ORDER BY ____', accepts: ['kw', 'col'], acceptedKeywords: ['ORDER BY'], multi: true }
        ],
        expected_sql: 'SELECT d.full_date, COUNT(*) AS actions FROM fact_post_action f JOIN dim_date d ON f.date_id = d.date_id GROUP BY d.full_date ORDER BY actions DESC;',
        reveal_hints: {
          'select-line': 'Chọn chiều hiển thị + số đếm: <strong>d.full_date, COUNT(*) AS actions</strong>.',
          'from-line': 'Fact đứng trước, chiều nối sau: <strong>fact_post_action f JOIN dim_date d ON f.date_id = d.date_id</strong>.',
          'group-line': 'Mỗi ngày một nhóm: <strong>GROUP BY d.full_date</strong>.',
          'order-line': 'Sôi động nhất lên đầu: <strong>actions DESC</strong>.'
        }
      },
      step_4: {
        prompt: 'Câu hỏi thứ hai của sếp khó hơn — đổi CHIỀU và đổi PHÉP TÍNH: <strong>"Bảng xếp hạng quốc gia theo TỔNG SỐ LIKE"</strong>. Lần này phải <code>SUM(act_count)</code> (cộng số đo thật, không đếm dòng), JOIN sang <code>dim_user</code>, và chỉ lấy hành động <code>like</code>.',
        starter: "-- BXH quoc gia theo TONG like (SUM so do, khong phai COUNT dong)\nSELECT u.country, ____(f.act_count) AS total_likes\n  FROM fact_post_action f\n  JOIN ____ ON f.user_id = u.user_id\n WHERE f.action_type = ____\n GROUP BY ____\n ORDER BY total_likes DESC;\n",
        schema: {
          table_name: 'fact_post_action',
          columns: [
            { name: 'action_id', type: 'INT', key: 'PK' },
            { name: 'user_id', type: 'INT', key: 'FK' },
            { name: 'date_id', type: 'VARCHAR', key: 'FK' },
            { name: 'action_type', type: 'VARCHAR', key: '' },
            { name: 'act_count', type: 'INT', key: '' }
          ],
          data: [
            ['1',  '7',  'D1', 'like',    '3'],
            ['2',  '9',  'D1', 'comment', '2'],
            ['3',  '12', 'D1', 'post',    '1'],
            ['4',  '7',  'D2', 'like',    '5'],
            ['5',  '9',  'D2', 'like',    '4'],
            ['6',  '12', 'D2', 'comment', '3'],
            ['7',  '15', 'D2', 'like',    '2'],
            ['8',  '9',  'D3', 'post',    '1'],
            ['9',  '7',  'D3', 'comment', '1'],
            ['10', '12', 'D3', 'like',    '6'],
            ['11', '15', 'D3', 'like',    '1'],
            ['12', '7',  'D3', 'post',    '1']
          ],
          related_schemas: [
            {
              table_name: 'dim_user',
              columns: [
                { name: 'user_id', type: 'INT', key: 'PK' },
                { name: 'username', type: 'VARCHAR', key: '' },
                { name: 'country', type: 'VARCHAR', key: '' }
              ],
              data: [
                ['7', 'minhkiller', 'VN'],
                ['9', 'yuki_sama', 'JP'],
                ['12', 'toxic_lord', 'VN'],
                ['15', 'sara_gg', 'US']
              ]
            }
          ]
        },
        context: {
          scenario: 'Widget "Top quốc gia" trên dashboard chạy đúng query này mỗi sáng, trên KHO — không đụng một byte nào của feed. Chú ý: đếm DÒNG fact là sai, phải CỘNG <code>act_count</code> (một dòng có thể gói 6 like).',
          real_world: 'Mọi dashboard BI (Metabase, Looker, Power BI) đằng sau đều là fact JOIN dim + SUM theo chiều — <strong>star schema là ngôn ngữ chung của giới phân tích</strong>, học một lần dùng ở mọi công ty.',
          steps: [
            'Cộng số đo: <code>SUM(f.act_count) AS total_likes</code> — không phải COUNT(*).',
            'Nối chiều người dùng: <code>JOIN dim_user u ON f.user_id = u.user_id</code>.',
            'Chỉ lấy like: <code>WHERE f.action_type = \'like\'</code>.',
            'Cắt theo nước + xếp hạng: <code>GROUP BY u.country ORDER BY total_likes DESC</code>.'
          ],
          hint_explore: 'Ngó kho trước: <code>SELECT * FROM fact_post_action</code> rồi Run — để ý dòng 10: một dòng = 6 like.',
          expected: 'Bảng 3 dòng: VN 14 · JP 4 · US 3 — VN vô địch nhờ minhkiller + toxic_lord cùng cày.'
        },
        hints: [
          { level: 1, text: 'Khung: SELECT chiều + SUM(số đo) FROM fact JOIN dim WHERE lọc GROUP BY chiều ORDER BY tổng.' },
          { level: 2, text: 'JOIN chiều người dùng: <code>JOIN dim_user u ON f.user_id = u.user_id</code> — rồi lọc <code>WHERE f.action_type = \'like\'</code>.' },
          { level: 3, text: 'Cộng số đo: <code>SUM(f.act_count) AS total_likes</code>, cắt: <code>GROUP BY u.country</code>.' },
          { level: 4, text: '<code class="code">SELECT u.country, SUM(f.act_count) AS total_likes FROM fact_post_action f JOIN dim_user u ON f.user_id = u.user_id WHERE f.action_type = \'like\' GROUP BY u.country ORDER BY total_likes DESC;</code>' }
        ],
        expected_sql: "SELECT u.country, SUM(f.act_count) AS total_likes FROM fact_post_action f JOIN dim_user u ON f.user_id = u.user_id WHERE f.action_type = 'like' GROUP BY u.country ORDER BY total_likes DESC;",
        success_message: 'Ticket #25 đóng! Kho đã dựng, sếp tự bấm dashboard không cần gọi bạn. Ticket #26: sếp muốn subtotal từng nước + tổng toàn cầu — trong CÙNG MỘT bảng.',
        xp_reward: 120
      }
    },

    /* ── tc_06 — Ticket #26 · ROLLUP & CUBE (tier-2: scan chặn — engine trả SAI im lặng với ROLLUP) ── */
    {
      id: 'tc_06', index: 6,
      title: 'ROLLUP & CUBE — mọi tầng tổng trong một query',
      subtitle: 'Chi tiết, subtotal từng nước, grand total — một nguồn, không dán tay',
      module: 5, module_title: 'Big Data & Analytics',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'fact_post_action',
          columns: ['action_id', 'user_id', 'date_id', 'action_type', 'act_count'],
          dataRows: [
            ['1',  '7',  'D1', 'like',    '3'],
            ['4',  '7',  'D2', 'like',    '5'],
            ['5',  '9',  'D2', 'like',    '4'],
            ['6',  '12', 'D2', 'comment', '3'],
            ['7',  '15', 'D2', 'like',    '2'],
            ['10', '12', 'D3', 'like',    '6']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #26',
        hook: 'Dashboard cần cùng lúc: số theo <strong>từng nước × loại</strong>, subtotal <strong>mỗi nước</strong>, và <strong>tổng toàn cầu</strong>. Bạn dán 3 query GROUP BY rồi cộng tay — số lệch nhau đúng 1 đơn vị, sếp bắt được ngay (dữ liệu vênh — bóng ma Ticket #03 lần thứ ba). Ticket #26: <em>ROLLUP</em> — MỘT query trả đủ mọi tầng tổng, cùng một nguồn nên không bao giờ lệch.'
      },
      step_1: {
        primer: {
          goal: [
            'ROLLUP(a, b) = GROUP BY thường + subtotal theo a + grand total — leo dần từng tầng',
            'Dòng subtotal nhận NULL ở chiều bị gộp: (VN, NULL) = "VN, mọi loại"',
            'CUBE(a, b) = mọi tổ hợp tầng — thêm cả subtotal theo b (mọi nước, từng loại)'
          ],
          intro: 'Ba tầng câu hỏi của sếp thực ra là MỘT phép leo núi: từ (nước, loại) → gộp chiều loại → gộp nốt chiều nước. <strong>GROUP BY ROLLUP(country, action_type)</strong> làm trọn hành trình đó trong một lần quét: dòng chi tiết như GROUP BY thường, rồi mỗi nước thêm 1 dòng subtotal (<code>action_type = NULL</code>), cuối cùng 1 dòng grand total (cả hai NULL). Muốn đủ MỌI tổ hợp (kể cả "mọi nước, từng loại") thì dùng <strong>CUBE</strong>.',
          example: '<code>SELECT country, action_type, SUM(act_count) FROM ... GROUP BY ROLLUP(country, action_type);</code> → n dòng chi tiết + subtotal mỗi nước + 1 grand total.'
        },
        concept_cards: [
          {
            icon: 'fa-layer-group',
            title: 'ROLLUP — leo từng tầng tổng',
            body: '<code>ROLLUP(a, b)</code> sinh các tầng: <code>(a,b)</code> chi tiết → <code>(a)</code> subtotal → <code>()</code> grand total. Đúng nghĩa "cuộn lên" — mỗi tầng gộp bớt một chiều, chiều bị gộp hiện <strong>NULL</strong>.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 11 — OLAP / Aggregation on Multidimensional Data'
          },
          {
            icon: 'fa-cube',
            title: 'CUBE — đủ mọi tổ hợp',
            body: '<code>CUBE(a, b)</code> = ROLLUP + tầng còn thiếu <code>(b)</code>: "mọi nước, TỪNG loại". 2 chiều → 4 tầng; 3 chiều → 8 tầng. Dashboard pivot table lấy dữ liệu kiểu này — một query nuôi cả bảng xoay.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Đọc dòng kết quả: <code>(VN, like, 14)</code> = chi tiết; <code>(VN, NULL, 17)</code> = subtotal VN mọi loại; <code>(NULL, NULL, 30)</code> = grand total. Thấy NULL ở đâu, chiều đó đã bị gộp — kỹ năng đọc này dùng ngay ở mini-game.'
          }
        ],
        visual: {
          schema: {
            table_name: 'fact_post_action',
            columns: [
              { name: 'action_id', type: 'INT', key: 'PK', icon: '🔑' },
              { name: 'user_id', type: 'INT', key: 'FK→dim_user', icon: '👤' },
              { name: 'date_id', type: 'VARCHAR', key: 'FK→dim_date', icon: '📅' },
              { name: 'action_type', type: 'VARCHAR', key: '', icon: '⚡' },
              { name: 'act_count', type: 'INT', key: 'measure', icon: '🔢' }
            ]
          },
          data_preview: [
            ['1',  '7',  'D1', 'like',    '3'],
            ['4',  '7',  'D2', 'like',    '5'],
            ['5',  '9',  'D2', 'like',    '4'],
            ['6',  '12', 'D2', 'comment', '3'],
            ['10', '12', 'D3', 'like',    '6']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Trong kết quả <code>GROUP BY ROLLUP(country, action_type)</code>, dòng <code>(VN, NULL, 17)</code> nghĩa là gì?',
            options: [
              { id: 'a', text: 'Subtotal của VN — mọi loại hành động gộp lại (chiều action_type đã bị cuộn)', correct: true, explanation: 'Đúng — NULL ở chiều nào nghĩa là chiều đó bị gộp; đây là tầng (country) của ROLLUP.' },
              { id: 'b', text: 'Các dòng VN có action_type bị thiếu dữ liệu', correct: false, explanation: 'Sai — đây là NULL DO ROLLUP SINH RA (đánh dấu tầng gộp), không phải dữ liệu khuyết.' },
              { id: 'c', text: 'Lỗi query — country và action_type phải luôn có giá trị', correct: false, explanation: 'Sai — với ROLLUP, NULL ở cột nhóm là hành vi chuẩn của tầng subtotal.' },
              { id: 'd', text: 'Trung bình cộng của các dòng VN', correct: false, explanation: 'Sai — vẫn là SUM, chỉ là SUM trên phạm vi rộng hơn (mọi loại của VN).' }
            ]
          },
          {
            question: 'ROLLUP(country, action_type) THIẾU tầng nào mà CUBE có?',
            options: [
              { id: 'a', text: '(action_type) — subtotal theo TỪNG LOẠI trên mọi nước', correct: true, explanation: 'Đúng — ROLLUP chỉ leo theo thứ tự liệt kê: (a,b)→(a)→(); tầng (b) riêng lẻ là của CUBE.' },
              { id: 'b', text: '(country, action_type) — tầng chi tiết', correct: false, explanation: 'Sai — tầng chi tiết cả hai đều có (chính là GROUP BY thường).' },
              { id: 'c', text: 'Grand total ()', correct: false, explanation: 'Sai — grand total ROLLUP có (tầng cuối của hành trình cuộn).' },
              { id: 'd', text: 'CUBE không thêm gì, chỉ chạy nhanh hơn', correct: false, explanation: 'Sai — CUBE thêm đúng các tổ hợp ROLLUP bỏ qua; tốc độ không phải điểm khác.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Dòng này thuộc tầng nào?',
          instruction: 'Đọc NULL để đoán tầng: kéo mỗi dòng kết quả ROLLUP vào đúng tầng của nó.',
          xp: 20,
          chips: [
            { id: 'r1', label: "('VN', 'like', 14)" },
            { id: 'r2', label: "('VN', NULL, 17)" },
            { id: 'r3', label: "(NULL, NULL, 30)" },
            { id: 'r4', label: "('JP', 'comment', 2)" },
            { id: 'r5', label: "('US', NULL, 3)" }
          ],
          bins: [
            { id: 'detail', label: 'Chi tiết (đủ 2 chiều)', correct: 'detail' },
            { id: 'sub', label: 'Subtotal 1 nước', correct: 'sub' },
            { id: 'grand', label: 'Grand total', correct: 'grand' }
          ],
          solution: { r1: 'detail', r2: 'sub', r3: 'grand', r4: 'detail', r5: 'sub' }
        }
      },
      step_3: {
        mission: 'Gói cả 3 tầng của sếp vào MỘT query: chi tiết nước × loại, subtotal mỗi nước, grand total — bằng <code>ROLLUP</code>.',
        blocks: [
          { type: 'kw', token: 'SELECT', slot: 'kw-select' },
          { type: 'col', token: 'u.country', slot: 'col-1' },
          { type: 'col', token: 'f.action_type', slot: 'col-2' },
          { type: 'fn', token: 'SUM(f.act_count) AS total', slot: 'fn-1' },
          { type: 'kw', token: 'FROM', slot: 'kw-from' },
          { type: 'tbl', token: 'fact_post_action f', slot: 'tbl' },
          { type: 'op', token: 'JOIN dim_user u ON f.user_id = u.user_id', slot: 'op-join' },
          { type: 'kw', token: 'GROUP BY', slot: 'kw-group' },
          { type: 'op', token: 'ROLLUP(u.country, f.action_type)', slot: 'op-rollup' },
          { type: 'op', token: 'u.country, f.action_type', slot: 'op-plain-x' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____', accepts: ['kw', 'col', 'fn'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line', placeholder: 'FROM ____ JOIN ____', accepts: ['kw', 'tbl', 'op'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'group-line', placeholder: 'GROUP BY ____ (cẩn thận khối mồi nhử)', accepts: ['kw', 'op'], acceptedKeywords: ['GROUP BY'], multi: true }
        ],
        expected_sql: 'SELECT u.country, f.action_type, SUM(f.act_count) AS total FROM fact_post_action f JOIN dim_user u ON f.user_id = u.user_id GROUP BY ROLLUP(u.country, f.action_type);',
        reveal_hints: {
          'select-line': 'Hai chiều + số đo: <strong>u.country, f.action_type, SUM(f.act_count) AS total</strong>.',
          'from-line': 'Fact nối chiều người dùng: <strong>fact_post_action f JOIN dim_user u ON f.user_id = u.user_id</strong>.',
          'group-line': 'Khối "u.country, f.action_type" trần là GROUP BY thường — CHỈ ra tầng chi tiết. Muốn đủ 3 tầng phải bọc <strong>ROLLUP(...)</strong>.'
        }
      },
      step_4: {
        prompt: 'Sếp xem xong đòi thêm đúng tầng ROLLUP không có: <strong>"mỗi LOẠI hành động cộng trên mọi nước"</strong>. Nâng cấp query của Step 3: đổi <code>ROLLUP</code> thành <code>CUBE</code> — đủ mọi tổ hợp tầng.',
        starter: "-- Dashboard pivot can DU moi to hop tang (ke ca theo LOAI tren moi nuoc)\n-- Khung nhu Step 3, doi ROLLUP -> CUBE\nSELECT u.country, f.action_type, SUM(f.act_count) AS total\n  FROM fact_post_action f\n  JOIN dim_user u ON f.user_id = u.user_id\n GROUP BY ____;\n",
        schema: {
          table_name: 'fact_post_action',
          columns: [
            { name: 'action_id', type: 'INT', key: 'PK' },
            { name: 'user_id', type: 'INT', key: 'FK' },
            { name: 'date_id', type: 'VARCHAR', key: 'FK' },
            { name: 'action_type', type: 'VARCHAR', key: '' },
            { name: 'act_count', type: 'INT', key: '' }
          ],
          data: [
            ['1',  '7',  'D1', 'like',    '3'],
            ['2',  '9',  'D1', 'comment', '2'],
            ['3',  '12', 'D1', 'post',    '1'],
            ['4',  '7',  'D2', 'like',    '5'],
            ['5',  '9',  'D2', 'like',    '4'],
            ['6',  '12', 'D2', 'comment', '3'],
            ['7',  '15', 'D2', 'like',    '2'],
            ['8',  '9',  'D3', 'post',    '1'],
            ['9',  '7',  'D3', 'comment', '1'],
            ['10', '12', 'D3', 'like',    '6'],
            ['11', '15', 'D3', 'like',    '1'],
            ['12', '7',  'D3', 'post',    '1']
          ],
          related_schemas: [
            {
              table_name: 'dim_user',
              columns: [
                { name: 'user_id', type: 'INT', key: 'PK' },
                { name: 'username', type: 'VARCHAR', key: '' },
                { name: 'country', type: 'VARCHAR', key: '' }
              ],
              data: [
                ['7', 'minhkiller', 'VN'],
                ['9', 'yuki_sama', 'JP'],
                ['12', 'toxic_lord', 'VN'],
                ['15', 'sara_gg', 'US']
              ]
            }
          ]
        },
        /* Tier-2: probe 2026-07-04 cho thấy engine chạy ROLLUP/CUBE ra kết quả SAI im lặng
         * → scan chặn thành pending; equiv render tầng CHI TIẾT (GROUP BY 2 chiều) — các
         * dòng subtotal/grand mô tả trong context.expected. */
        equiv_sql: 'SELECT u.country, f.action_type, SUM(f.act_count) AS total FROM fact_post_action f JOIN dim_user u ON f.user_id = u.user_id GROUP BY u.country, f.action_type ORDER BY u.country;',
        context: {
          scenario: 'Bảng pivot trên dashboard cho sếp kéo-thả chiều tùy ý — nó cần sẵn MỌI tổ hợp tầng trong một nguồn dữ liệu duy nhất. CUBE sinh đủ, không thiếu tổ hợp nào, không lệch số.',
          real_world: 'Excel Pivot Table, Google Sheets pivot, mọi công cụ BI — nút "Show grand totals / subtotals" của chúng chính là <strong>CUBE/ROLLUP chạy ngầm</strong>. Hiểu tầng NULL là đọc được mọi bảng pivot.',
          steps: [
            'Giữ nguyên SELECT + JOIN như Step 3 (hai chiều + SUM số đo).',
            'Đổi bộ sinh tầng: <code>GROUP BY CUBE(u.country, f.action_type)</code>.',
            'Nhẩm số tầng: 2 chiều → 4 tầng (chi tiết, theo nước, theo loại, grand).',
            'Đọc kết quả: dòng <code>(NULL, \'like\', …)</code> chính là tầng ROLLUP còn thiếu.'
          ],
          hint_explore: 'Chạy thử tầng chi tiết trước: <code>SELECT u.country, f.action_type, SUM(f.act_count) AS total FROM fact_post_action f JOIN dim_user u ON f.user_id = u.user_id GROUP BY u.country, f.action_type;</code>',
          expected: 'Khung kết quả hiện TẦNG CHI TIẾT (engine demo chưa mô phỏng subtotal). Chạy thật trên Postgres sẽ thêm: subtotal mỗi nước, subtotal mỗi loại — như (NULL, like, 21) — và grand total (NULL, NULL, 30).'
        },
        hints: [
          { level: 1, text: 'Chỉ khác Step 3 đúng MỘT từ khóa trong GROUP BY — bộ sinh đủ mọi tổ hợp tầng.' },
          { level: 2, text: 'ROLLUP leo 1 đường: (a,b)→(a)→(). CUBE đi đủ 4 ngả — cú pháp y hệt, đổi tên hàm.' },
          { level: 3, text: '<code>GROUP BY CUBE(u.country, f.action_type)</code>.' },
          { level: 4, text: '<code class="code">SELECT u.country, f.action_type, SUM(f.act_count) AS total FROM fact_post_action f JOIN dim_user u ON f.user_id = u.user_id GROUP BY CUBE(u.country, f.action_type);</code>' }
        ],
        expected_sql: 'SELECT u.country, f.action_type, SUM(f.act_count) AS total FROM fact_post_action f JOIN dim_user u ON f.user_id = u.user_id GROUP BY CUBE(u.country, f.action_type);',
        success_message: 'Ticket #26 đóng! Một query nuôi cả bảng pivot — sếp kéo thả thoải mái, số không bao giờ lệch. Ticket #27: marketing muốn đếm hashtag trên 10 TRIỆU post — một máy không kham nổi.',
        xp_reward: 120
      }
    },

    /* ── tc_07 — Ticket #27 · MapReduce (tier-3 khái niệm: step-3 zone mr-*, step-4 fill_blank
     *    pseudo-code — KHÔNG nhét SQL vào chỗ không có SQL, theo plan §2) ── */
    {
      id: 'tc_07', index: 7,
      title: 'MapReduce — chia để trị trên cụm máy',
      subtitle: 'Map phát (khóa, 1) → Shuffle gom theo khóa → Reduce cộng dồn',
      module: 5, module_title: 'Big Data & Analytics',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'fill_blank',
      drag_map: {
        table: {
          name: 'posts (mảnh trên 3 máy)',
          columns: ['post_id', 'hashtags'],
          dataRows: [
            ['501', '#eldenring #dlc'],
            ['503', '#eldenring'],
            ['504', '#hades2'],
            ['507', '#guildboard #sập'],
            ['508', '#indie #eldenring']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #27',
        hook: 'Marketing muốn biết <strong>"hashtag hot nhất mọi thời đại"</strong> — nghĩa là đếm chữ trên 10 triệu post. Một máy cày hết đêm chưa xong, mà post mới vẫn đổ về từng giây. Ticket #27: chia bài toán cho cả CỤM máy theo <em>MapReduce</em> — mỗi máy <strong>MAP</strong> phát cặp (hashtag, 1), hệ thống <strong>SHUFFLE</strong> gom theo khóa, <strong>REDUCE</strong> cộng dồn. Chia để trị, đúng nghĩa đen.'
      },
      step_1: {
        primer: {
          goal: [
            'Bài toán quá lớn cho 1 máy → chia dữ liệu cho N máy xử lý SONG SONG',
            'Lập trình viên chỉ viết 2 hàm: map (phát cặp khóa-giá trị) và reduce (cộng dồn theo khóa)',
            'Shuffle là việc của HỆ THỐNG: gom mọi cặp cùng khóa về đúng một máy reduce'
          ],
          intro: 'Đếm hashtag trên 10 triệu post không cần thuật toán thiên tài — cần CÁCH CHIA VIỆC. <strong>MapReduce</strong> chia bảng posts thành mảnh, phát cho N máy: mỗi máy chạy <code>map(post)</code> phát ra cặp <code>(hashtag, 1)</code> cho từng tag nó thấy. Hệ thống <strong>shuffle</strong> tự gom mọi cặp cùng hashtag về một chỗ, rồi <code>reduce(tag, [1,1,1…])</code> cộng lại. Bạn không quản lý máy nào làm gì — chỉ định nghĩa map và reduce.',
          example: 'map: <code>"#eldenring #dlc" → (#eldenring,1), (#dlc,1)</code> · shuffle: <code>#eldenring → [1,1,1]</code> · reduce: <code>#eldenring → 3</code>'
        },
        concept_cards: [
          {
            icon: 'fa-map',
            title: 'MAP — phát cặp, không phán xét',
            body: 'Hàm map nhìn TỪNG bản ghi độc lập và phát cặp <code>(khóa, giá_trị)</code> — với đếm hashtag là <code>(tag, 1)</code>. Không cộng, không nhớ gì giữa các post — nhờ vô trạng thái mà chạy được song song trên nghìn máy.'
          },
          {
            icon: 'fa-shuffle',
            title: 'SHUFFLE — khóa nào về nhà nấy',
            body: 'Giữa map và reduce, hệ thống gom mọi cặp CÙNG KHÓA từ khắp các máy về một máy reduce: <code>#eldenring → [1, 1, 1]</code>. Đây là bước tốn mạng nhất — và là lý do khóa (key) phải chọn khéo.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 10 — Big Data / MapReduce'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'SQL quen thuộc <code>SELECT tag, COUNT(*) GROUP BY tag</code> chính là MapReduce trá hình: map = tách tag khỏi post, shuffle = GROUP BY, reduce = COUNT. Hiểu ánh xạ này thì Spark/Hadoop chỉ là cú pháp mới của tư duy cũ.'
          }
        ],
        visual: {
          schema: {
            table_name: 'posts (mảnh trên 3 máy)',
            columns: [
              { name: 'post_id', type: 'INT', key: 'PK', icon: '🔑' },
              { name: 'hashtags', type: 'TEXT', key: '', icon: '#️⃣' }
            ]
          },
          data_preview: [
            ['501', '#eldenring #dlc'],
            ['503', '#eldenring'],
            ['504', '#hades2'],
            ['507', '#guildboard #sập'],
            ['508', '#indie #eldenring']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Vì sao hàm <code>map</code> chỉ phát <code>(tag, 1)</code> mà KHÔNG tự cộng luôn?',
            options: [
              { id: 'a', text: 'Map nhìn từng post độc lập trên máy riêng — không máy nào thấy đủ toàn cục để cộng; việc gom + cộng thuộc về shuffle + reduce', correct: true, explanation: 'Đúng — chính sự "ngây thơ" vô trạng thái của map cho phép chạy song song vô hạn; cộng sớm là phải nhớ trạng thái, mất khả năng chia.' },
              { id: 'b', text: 'Vì phép cộng quá chậm với map', correct: false, explanation: 'Sai — cộng rất rẻ; vấn đề là map KHÔNG THẤY các cặp cùng khóa ở máy khác.' },
              { id: 'c', text: 'Để tiết kiệm bộ nhớ của máy map', correct: false, explanation: 'Sai — phát (tag,1) thực ra tốn hơn; đổi lại là tính song song tuyệt đối.' },
              { id: 'd', text: 'Do ngôn ngữ lập trình không cho phép cộng trong map', correct: false, explanation: 'Sai — cho phép (combiner là tối ưu có thật), nhưng THIẾT KẾ chuẩn tách phát/gom/cộng làm 3 pha rõ ràng.' }
            ]
          },
          {
            question: 'Bước SHUFFLE đảm bảo điều gì?',
            options: [
              { id: 'a', text: 'Mọi cặp CÙNG KHÓA — dù sinh ra ở máy nào — đều về đúng MỘT máy reduce', correct: true, explanation: 'Đúng — nhờ vậy reduce("#eldenring", values) cầm ĐỦ mọi số 1 của tag đó, cộng ra kết quả toàn cục.' },
              { id: 'b', text: 'Dữ liệu được xáo trộn ngẫu nhiên cho cân bằng tải', correct: false, explanation: 'Sai — "shuffle" nghe như xáo bài nhưng thực chất là GOM THEO KHÓA, có quy luật tuyệt đối.' },
              { id: 'c', text: 'Kết quả được sắp xếp theo bảng chữ cái', correct: false, explanation: 'Sai — sắp theo khóa có thể xảy ra như hiệu ứng phụ, nhưng cam kết cốt lõi là gom đủ theo khóa.' },
              { id: 'd', text: 'Mỗi máy reduce nhận số cặp bằng nhau', correct: false, explanation: 'Sai — khóa nóng (như #eldenring) có thể dồn 1 máy nhiều việc hơn hẳn (data skew — vấn đề có thật).' }
            ]
          }
        ],
        mini_game: {
          type: 'order',
          title: 'Xếp dòng chảy MapReduce',
          instruction: 'Kéo thả các bước xử lý "đếm hashtag 10 triệu post" theo đúng thứ tự.',
          xp: 20,
          items: [
            { id: 'm1', label: 'Chia bảng posts thành mảnh, phát cho N máy' },
            { id: 'm2', label: 'Mỗi máy map(post) → phát (tag, 1) cho từng hashtag' },
            { id: 'm3', label: 'Shuffle: gom mọi cặp cùng tag về một máy' },
            { id: 'm4', label: 'reduce(tag, [1,1,…]) → cộng dồn thành tổng' },
            { id: 'm5', label: 'Ghi bảng kết quả (tag, tổng) — marketing đọc' }
          ],
          solution: { m1: 1, m2: 2, m3: 3, m4: 4, m5: 5 }
        }
      },
      step_3: {
        mission: 'Lắp dây chuyền đếm hashtag: chọn đúng thân <strong>MAP → SHUFFLE → REDUCE</strong>. Trong khay có 2 khối mồi nhử làm sai vai.',
        blocks: [
          { type: 'op', token: 'map(post): for tag in post.hashtags → emit(tag, 1)', slot: 'mr-map' },
          { type: 'op', token: 'map(post): return COUNT(*) toàn bảng', slot: 'mr-map-x' },
          { type: 'kw', token: 'shuffle: gom mọi cặp CÙNG tag về một máy → tag: [1, 1, …]', slot: 'mr-shuffle' },
          { type: 'op', token: 'reduce(tag, values): return (tag, sum(values))', slot: 'mr-reduce' },
          { type: 'op', token: 'reduce(tag, values): return (tag, values[0])', slot: 'mr-reduce-x' }
        ],
        drop_zones: [
          { id: 'mr-map', placeholder: 'MAP — mỗi máy làm gì với từng post?', accepts: ['op'], multi: false },
          { id: 'mr-shuffle', placeholder: 'SHUFFLE — hệ thống gom thế nào?', accepts: ['kw'], multi: false },
          { id: 'mr-reduce', placeholder: 'REDUCE — máy nhận [1,1,…] làm gì?', accepts: ['op'], multi: false }
        ],
        expected_sql: 'map(post): for tag in post.hashtags → emit(tag, 1) shuffle: gom mọi cặp CÙNG tag về một máy → tag: [1, 1, …] reduce(tag, values): return (tag, sum(values))',
        expected_zones: {
          'mr-map': 'map(post): for tag in post.hashtags → emit(tag, 1)',
          'mr-shuffle': 'shuffle: gom mọi cặp CÙNG tag về một máy → tag: [1, 1, …]',
          'mr-reduce': 'reduce(tag, values): return (tag, sum(values))'
        },
        reveal_hints: {
          'mr-map': 'Map KHÔNG đếm tổng — nó chỉ phát <strong>(tag, 1)</strong> cho từng tag nhìn thấy. Khối "COUNT(*) toàn bảng" là mồi nhử: map không thấy toàn bảng.',
          'mr-shuffle': 'Việc của hệ thống: mọi cặp cùng khóa về một nhà — <strong>tag: [1, 1, …]</strong>.',
          'mr-reduce': 'Reduce cầm đủ danh sách rồi mới <strong>cộng dồn: sum(values)</strong>. Lấy values[0] là vứt gần hết dữ liệu.'
        }
      },
      step_4: {
        prompt: 'Điền nốt 3 chỗ trống để dây chuyền chạy được — đúng vai từng pha: map phát gì, shuffle gom theo gì, reduce dùng hàm nào.',
        challenge_type: 'fill_blank',
        template: 'def map(post):\n  for tag in post.hashtags:\n    emit(____, 1)\n\n# SHUFFLE (hệ thống tự làm): gom các cặp có cùng ____\n\ndef reduce(tag, values):\n  # values = [1, 1, 1, ...]\n  return (tag, ____(values))',
        blanks: [
          { id: 'b1', hint: 'phát khóa nào?', expected: 'tag' },
          { id: 'b2', hint: 'gom theo gì?', expected: 'tag' },
          { id: 'b3', hint: 'hàm cộng dồn', expected: 'sum' }
        ],
        context: {
          scenario: 'Đoạn pseudo-code này là TOÀN BỘ những gì dev phải viết — framework (Hadoop/Spark) lo chia mảnh, phát máy, shuffle, gom lỗi. Điền sai một vai là cả cụm máy cho ra số rác.',
          real_world: 'Google xây MapReduce để đánh index cả Internet; Hadoop/Spark phổ cập nó cho mọi công ty. Ngày nay bạn viết <code>df.groupBy("tag").count()</code> trên Spark — nhưng bên dưới vẫn là map-shuffle-reduce y nguyên.',
          steps: [
            'Map phát cặp (khóa, 1): khóa ở đây là <code>tag</code>.',
            'Shuffle gom theo đúng KHÓA đã phát — cũng là <code>tag</code>.',
            'Reduce nhận cả danh sách [1,1,…] → <code>sum(values)</code>.',
            'Đối chiếu mini-game: thứ tự pha không đổi, chỉ điền đúng vai.'
          ],
          hint_explore: 'Nhẩm với 5 post ở bảng dữ liệu: #eldenring xuất hiện ở post 501, 503, 508 → reduce phải trả 3.',
          expected: 'Điền đúng 3/3 ô: emit(tag, 1) · gom theo tag · sum(values). Bài này là pseudo-code — chấm theo ô điền, không chạy SQL.'
        },
        hints: [
          { level: 1, text: 'Nhìn hero: MAP phát cặp gì? SHUFFLE gom theo gì? REDUCE làm phép gì với [1,1,1]?' },
          { level: 2, text: 'Ô 1 và ô 2 là CÙNG MỘT thứ — khóa của bài toán đếm hashtag.' },
          { level: 3, text: 'Ô 3: cộng dồn danh sách số 1 → hàm <code>sum</code>.' },
          { level: 4, text: 'Đáp án: <code>tag</code> · <code>tag</code> · <code>sum</code>.' }
        ],
        success_message: 'Ticket #27 đóng! 10 triệu post chia cho cả cụm — marketing có "hashtag hot nhất" trước giờ ăn trưa. Ticket #28: hồ sơ người dùng bùng nổ kiểu dáng — bảng users mọc cột NULL không kịp thở.',
        xp_reward: 120
      }
    },

    /* ── tc_08 — Ticket #28 · JSON Document Store (non-SQL: chấm exact-match + guard;
     *    ANTI-TRÙNG db_14 Basic: dạy MÔ HÌNH document (schemaless, embed vs reference),
     *    không lặp JSONB path — hook nối tiếp Ticket #15 đúng plan §6) ── */
    {
      id: 'tc_08', index: 8,
      title: 'JSON Document Store — mỗi hồ sơ một document',
      subtitle: 'Khi mỗi user một kiểu hồ sơ: schemaless + find() thay vì ALTER TABLE',
      module: 5, module_title: 'Big Data & Analytics',
      estimated_minutes: 18, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'profiles (collection)',
          columns: ['username', 'country', 'bio', 'badges'],
          dataRows: [
            ['minhkiller', 'VN', '(chưa viết)', 'Ship Community v1.0'],
            ['yuki_sama', 'JP', 'Collector 100%', 'Nhà sưu tầm'],
            ['toxic_lord', 'VN', 'Rank cao nhất server', '(chưa có)'],
            ['sara_gg', 'US', '(chưa viết)', 'GG-Clan Founder']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #28',
        hook: 'Hồ sơ người dùng bùng nổ: người khoe badge, người gắn link stream, người viết bio 3 dòng — <strong>mỗi người một kiểu</strong>, bảng users mọc cột mới toàn NULL. Ticket #28: thử <em>document store</em> — mỗi hồ sơ là MỘT document JSON tự do (cột settings JSONB hồi Ticket #15 giờ lớn thành cả cửa hàng), truy vấn bằng <code>find()</code> thay vì SELECT.'
      },
      step_1: {
        primer: {
          goal: [
            'Document store lưu mỗi bản ghi = 1 document JSON — field khác nhau giữa các document là BÌNH THƯỜNG',
            'find(điều_kiện, projection) là SELECT + WHERE của thế giới document',
            'Embed (nhét vào trong) vs Reference (trỏ sang) — quyết định thiết kế lớn nhất của document model'
          ],
          intro: 'Bảng quan hệ ép mọi dòng cùng khuôn — hồ sơ đa hình làm khuôn rách: thêm 1 tính năng là <code>ALTER TABLE</code> + NULL tràn lan. <strong>Document store</strong> (MongoDB là đại diện) lật ngược: mỗi hồ sơ là một JSON tự do trong collection <code>profiles</code>, ai có field gì lưu field đó. Truy vấn không viết SELECT mà gọi <code>db.profiles.find({ điều_kiện }, { field_muốn_lấy: 1 })</code>. Tự do có giá của nó — không JOIN chuẩn, không ràng buộc FK — nên phải biết CHỌN trận địa.',
          example: "<code>db.profiles.find({ country: 'VN' }, { username: 1, bio: 1 })</code> ≈ <code>SELECT username, bio FROM profiles WHERE country = 'VN'</code>"
        },
        concept_cards: [
          {
            icon: 'fa-file-code',
            title: 'Schemaless — khuôn nằm trong app',
            body: 'Document store KHÔNG bắt document cùng field — <code>yuki_sama</code> có mảng <code>badges</code>, <code>minhkiller</code> thì không, chẳng ai phải NULL. Đổi lại: DATABASE không còn gác cổng cấu trúc, app phải tự kỷ luật (bài học Ticket #05 về ràng buộc vẫn đúng).',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 10 — Big Data Storage Systems / Document Stores'
          },
          {
            icon: 'fa-box-open',
            title: 'Embed hay Reference?',
            body: '<strong>Embed</strong>: nhét badges THẲNG vào document hồ sơ — đọc 1 phát ra đủ, nhưng dữ liệu lặp nếu nhiều nơi cùng dùng. <strong>Reference</strong>: lưu id trỏ sang collection khác — như FK, nhưng phải tự "join tay". Quy tắc ngón cái: cái gì đọc-cùng-nhau thì embed.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Khác db_14 (JSONB là MỘT CỘT trong bảng quan hệ — vẫn có PK/FK gác cổng), ở đây CẢ BẢN GHI là JSON. Cột settings của Ticket #15 là bước đệm; document store là đi hẳn sang thế giới bên kia. Feed/likes vẫn ở lại Postgres — hồ sơ đa hình mới là đất của document.'
          }
        ],
        visual: {
          schema: {
            table_name: 'profiles (collection — bảng phẳng minh họa)',
            columns: [
              { name: 'username', type: 'TEXT', key: '_id', icon: '👤' },
              { name: 'country', type: 'TEXT', key: '', icon: '🌍' },
              { name: 'bio', type: 'TEXT', key: 'tùy có', icon: '📝' },
              { name: 'badges', type: 'ARRAY', key: 'tùy có', icon: '🏅' }
            ]
          },
          data_preview: [
            ['minhkiller', 'VN', '(chưa viết)', 'Ship Community v1.0'],
            ['yuki_sama', 'JP', 'Collector 100%', 'Nhà sưu tầm'],
            ['toxic_lord', 'VN', 'Rank cao nhất server', '(chưa có)'],
            ['sara_gg', 'US', '(chưa viết)', 'GG-Clan Founder']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Điểm khác CỐT LÕI giữa document store và cột JSONB của Ticket #15?',
            options: [
              { id: 'a', text: 'JSONB là MỘT CỘT trong bảng quan hệ (vẫn có PK/FK gác cổng); document store thì CẢ BẢN GHI là JSON, schema do app tự giữ', correct: true, explanation: 'Đúng — một bên là "góc tự do trong nhà kỷ luật", một bên là chuyển hẳn sang mô hình dữ liệu khác.' },
              { id: 'b', text: 'JSONB không lưu được mảng, document store thì có', correct: false, explanation: 'Sai — JSONB lưu mảng thoải mái (đã làm ở Ticket #15).' },
              { id: 'c', text: 'Document store nhanh hơn trong mọi truy vấn', correct: false, explanation: 'Sai — JOIN/giao dịch phức tạp thì mô hình quan hệ vẫn thắng; document thắng ở hồ sơ đa hình đọc-nguyên-khối.' },
              { id: 'd', text: 'Chỉ khác cú pháp, mô hình y hệt nhau', correct: false, explanation: 'Sai — khác cả mô hình: ràng buộc, JOIN, cách nghĩ về cấu trúc đều đổi.' }
            ]
          },
          {
            question: 'Hồ sơ hiển thị luôn cần <code>badges</code> đi kèm username — nên EMBED hay REFERENCE?',
            options: [
              { id: 'a', text: 'Embed — cái gì đọc-cùng-nhau thì nhét vào cùng document, một lần đọc ra đủ trang hồ sơ', correct: true, explanation: 'Đúng — quy tắc ngón cái của document model: tối ưu cho đường đọc chính.' },
              { id: 'b', text: 'Reference — vì badge là dữ liệu quan trọng', correct: false, explanation: 'Sai — quan trọng hay không không phải tiêu chí; TẦN SUẤT ĐỌC CÙNG NHAU mới là tiêu chí.' },
              { id: 'c', text: 'Cả hai như nhau, tùy thích', correct: false, explanation: 'Sai — reference bắt bạn query lần 2 (join tay) cho MỌI lượt xem hồ sơ; khác biệt hiệu năng rõ rệt.' },
              { id: 'd', text: 'Không lưu badges trong document store được', correct: false, explanation: 'Sai — mảng badges nhét vào document là trường hợp mẫu giáo khoa của embed.' }
            ]
          }
        ],
        mini_game: {
          type: 'match',
          title: 'Dịch SQL → Mongo',
          instruction: 'Mỗi mảnh SQL quen thuộc ứng với mảnh nào trong thế giới document? Click nối từng cặp.',
          xp: 20,
          pairs: [
            { left: "SELECT username, bio", leftId: 'q1', rightId: 'w1', right: { id: 'w1', label: '{ username: 1, bio: 1 } — projection (tham số 2 của find)' } },
            { left: "WHERE country = 'VN'", leftId: 'q2', rightId: 'w2', right: { id: 'w2', label: "{ country: 'VN' } — document điều kiện (tham số 1)" } },
            { left: 'ORDER BY joined_at DESC', leftId: 'q3', rightId: 'w3', right: { id: 'w3', label: '.sort({ joined_at: -1 })' } },
            { left: 'FROM profiles', leftId: 'q4', rightId: 'w4', right: { id: 'w4', label: 'db.profiles — chọn collection' } }
          ],
          solution: { q1: 'w1', q2: 'w2', q3: 'w3', q4: 'w4' }
        }
      },
      step_3: {
        mission: 'Trang khám phá cần: <strong>hồ sơ gamer VN, chỉ lấy username + bio, mới tham gia trước</strong> — lắp câu find() hoàn chỉnh. Có khối mồi nhử trộn SQL vào Mongo.',
        blocks: [
          { type: 'tbl', token: 'db.profiles', slot: 'doc-coll' },
          { type: 'op', token: ".find({ country: 'VN' },", slot: 'doc-filter' },
          { type: 'op', token: ".find(SELECT * FROM profiles WHERE country = 'VN')", slot: 'doc-filter-x' },
          { type: 'op', token: '{ username: 1, bio: 1 })', slot: 'doc-project' },
          { type: 'kw', token: '.sort({ joined_at: -1 })', slot: 'doc-sort' }
        ],
        drop_zones: [
          { id: 'doc-coll', placeholder: 'chọn collection nào?', accepts: ['tbl'], multi: false },
          { id: 'doc-filter', placeholder: 'điều kiện lọc — là MỘT document', accepts: ['op'], multi: false },
          { id: 'doc-project', placeholder: 'projection — lấy field nào?', accepts: ['op'], multi: false },
          { id: 'doc-sort', placeholder: 'sắp xếp mới → cũ', accepts: ['kw'], multi: false }
        ],
        expected_sql: "db.profiles .find({ country: 'VN' }, { username: 1, bio: 1 }) .sort({ joined_at: -1 })",
        expected_zones: {
          'doc-coll': 'db.profiles',
          'doc-filter': ".find({ country: 'VN' },",
          'doc-project': '{ username: 1, bio: 1 })',
          'doc-sort': '.sort({ joined_at: -1 })'
        },
        reveal_hints: {
          'doc-coll': 'Bắt đầu từ kho: <strong>db.profiles</strong> (như FROM).',
          'doc-filter': 'Điều kiện Mongo là MỘT DOCUMENT: <strong>.find({ country: \'VN\' },</strong> — khối có chữ SELECT là mồi nhử trộn hai thế giới.',
          'doc-project': 'Tham số 2 = chọn field: <strong>{ username: 1, bio: 1 })</strong>.',
          'doc-sort': 'Mới trước: <strong>.sort({ joined_at: -1 })</strong> — -1 là DESC.'
        }
      },
      step_4: {
        prompt: 'Ban tổ chức sự kiện cần danh sách <strong>chủ nhân huy hiệu "Nhà sưu tầm"</strong> (mảng <code>badges</code> CHỨA giá trị đó — Mongo tự hiểu khi so mảng với 1 giá trị), chỉ lấy <code>username</code> và GIẤU <code>_id</code> (<code>_id: 0</code>).',
        starter: "// Tim chu nhan huy hieu 'Nha suu tam'\n// - dieu kien: badges chua 'Nhà sưu tầm' (so mang voi 1 gia tri)\n// - projection: chi username, giau _id\ndb.profiles.find(____, ____)\n",
        schema: {
          table_name: 'profiles',
          columns: [
            { name: 'username', type: 'TEXT', key: '_id' },
            { name: 'country', type: 'TEXT', key: '' },
            { name: 'bio', type: 'TEXT', key: '' },
            { name: 'badges', type: 'ARRAY', key: '' }
          ],
          data: [
            ['minhkiller', 'VN', '(chưa viết)', 'Ship Community v1.0'],
            ['yuki_sama', 'JP', 'Collector 100%', 'Nhà sưu tầm'],
            ['toxic_lord', 'VN', 'Rank cao nhất server', '(chưa có)'],
            ['sara_gg', 'US', '(chưa viết)', 'GG-Clan Founder']
          ]
        },
        /* Non-SQL: scan 'db.*.find(' → pending; validateSQL exact-match + guard non-SQL
         * (message sạch); equiv render bảng phẳng tương đương. */
        equiv_sql: "SELECT username FROM profiles WHERE badges = 'Nhà sưu tầm';",
        context: {
          scenario: 'Query này chạy thẳng trên collection hồ sơ — không ALTER, không migration, dù mai kia hồ sơ mọc thêm field mới nào đi nữa. Đó là lời hứa (và cạm bẫy) của schemaless.',
          real_world: 'MongoDB so <code>badges: giá_trị</code> với mảng theo kiểu CHỨA-LÀ-KHỚP — idiom hồ sơ/tag phổ biến bậc nhất; Discord, các hệ profile game đều lưu showcase kiểu này.',
          steps: [
            'Điều kiện là document: <code>{ badges: \'Nhà sưu tầm\' }</code> — so 1 giá trị với mảng = "chứa".',
            'Projection lấy username: <code>{ username: 1 }</code>.',
            'Mongo mặc định trả _id — giấu đi: thêm <code>_id: 0</code> vào projection.',
            'Ráp: <code>db.profiles.find(điều_kiện, projection)</code> — không SELECT, không FROM.'
          ],
          hint_explore: 'Xem bảng phẳng minh họa: <code>SELECT * FROM profiles</code> rồi Run — ai đang giữ huy hiệu?',
          expected: 'Khung kết quả minh họa bản SQL tương đương: 1 dòng — yuki_sama. Đáp án Mongo của bạn chấm khi Run/Submit.'
        },
        hints: [
          { level: 1, text: 'Khung: <code>db.profiles.find({ điều_kiện }, { projection })</code> — hai tham số, đều là document.' },
          { level: 2, text: 'Điều kiện chứa-trong-mảng viết y như so bằng: <code>{ badges: \'Nhà sưu tầm\' }</code>.' },
          { level: 3, text: 'Projection vừa lấy vừa giấu: <code>{ username: 1, _id: 0 }</code>.' },
          { level: 4, text: '<code class="code">db.profiles.find({ badges: \'Nhà sưu tầm\' }, { username: 1, _id: 0 })</code>' }
        ],
        expected_sql: "db.profiles.find({ badges: 'Nhà sưu tầm' }, { username: 1, _id: 0 })",
        success_message: 'Ticket #28 đóng! Hồ sơ đa hình có nhà mới — còn feed/likes vẫn ở lại Postgres, đúng trận địa của mỗi bên. Ticket #29: PM hỏi dồn dập — đến lúc học 4 thao tác xoay khối OLAP.',
        xp_reward: 120
      }
    },

    /* ── tc_09 — Ticket #29 · OLAP Slice-Dice-Drilldown (tier-1: JOIN 3 bảng + WHERE 2 điều
     *    kiện + SUM — probe 2026-07-04 xác nhận engine chạy thật) ── */
    {
      id: 'tc_09', index: 9,
      title: 'OLAP — Slice, Dice & Drill-down',
      subtitle: 'Mỗi câu hỏi của PM là một thao tác trên khối: cắt lát, cắt khối, khoan sâu, gộp lên',
      module: 5, module_title: 'Big Data & Analytics',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'fact_post_action',
          columns: ['action_id', 'user_id', 'date_id', 'action_type', 'act_count'],
          dataRows: [
            ['1',  '7',  'D1', 'like',    '3'],
            ['2',  '9',  'D1', 'comment', '2'],
            ['4',  '7',  'D2', 'like',    '5'],
            ['5',  '9',  'D2', 'like',    '4'],
            ['7',  '15', 'D2', 'like',    '2'],
            ['10', '12', 'D3', 'like',    '6']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #29',
        hook: 'Họp sáng, PM hỏi liên hoàn: <strong>"Like tháng 6 bao nhiêu?"</strong> → <strong>"Tách theo nước xem?"</strong> → <strong>"VN hôm nào cao nhất?"</strong>. Mỗi câu bạn lại viết query mới từ đầu, trong khi kho FACT/DIM từ Ticket #25 đã chứa sẵn mọi câu trả lời. Ticket #29: học 4 thao tác chuẩn trên khối dữ liệu — <em>slice, dice, drill-down, roll-up</em> — xoay cube tới đâu, trả lời tới đó.'
      },
      step_1: {
        primer: {
          goal: [
            'Dữ liệu kho = KHỐI nhiều chiều (ngày × nước × loại) — mỗi ô chứa số đo',
            'SLICE cố định 1 chiều (WHERE month=6) · DICE cắt theo nhiều chiều (GROUP BY 2 cột)',
            'DRILL-DOWN đi xuống chi tiết (tháng → ngày) · ROLL-UP gộp lên (chính là #26)'
          ],
          intro: 'Đừng nghĩ kho là bảng — hãy nghĩ nó là <strong>khối rubik dữ liệu</strong>: trục ngày, trục nước, trục loại hành động; mỗi ô = tổng act_count của tổ hợp đó. Câu hỏi của PM chỉ là các cách CẮT khối: cố định tháng 6 = <em>slice</em>; tách theo nước × loại = <em>dice</em>; từ tháng khoan xuống từng ngày = <em>drill-down</em>; gộp ngược lên = <em>roll-up</em>. SQL bên dưới vẫn là fact JOIN dim — chỉ đổi WHERE và GROUP BY.',
          example: 'Slice + dice: <code>… WHERE d.month = 6 GROUP BY u.country</code> — cắt lát tháng 6, tách theo nước.'
        },
        concept_cards: [
          {
            icon: 'fa-cube',
            title: 'Slice & Dice — cắt lát, cắt khối',
            body: '<strong>Slice</strong>: cố định MỘT chiều — <code>WHERE d.month = 6</code> lấy đúng lát tháng 6. <strong>Dice</strong>: nhìn lát đó theo NHIỀU chiều cùng lúc — <code>GROUP BY u.country, f.action_type</code>. PM kéo bộ lọc trên dashboard = bạn đang slice/dice.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 11 — OLAP'
          },
          {
            icon: 'fa-magnifying-glass-chart',
            title: 'Drill-down ↔ Roll-up — thang máy độ chi tiết',
            body: 'Thấy "tháng 6 = 15 like" muốn biết NGÀY nào gánh? <strong>Drill-down</strong>: GROUP BY từ tháng xuống <code>full_date</code>. Chiều ngược lại — ngày gộp lên tháng, tháng lên năm — là <strong>roll-up</strong>, đúng cái tên bạn gặp ở Ticket #26.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Dịch nhanh 3 câu của PM: câu 1 = slice (WHERE tháng). Câu 2 = dice thêm chiều nước. Câu 3 = slice nước VN + drill-down xuống ngày. Mọi biến thể đều chỉ là đổi WHERE/GROUP BY trên CÙNG một kho — không viết lại từ đầu.'
          }
        ],
        visual: {
          schema: {
            table_name: 'fact_post_action',
            columns: [
              { name: 'action_id', type: 'INT', key: 'PK', icon: '🔑' },
              { name: 'user_id', type: 'INT', key: 'FK→dim_user', icon: '👤' },
              { name: 'date_id', type: 'VARCHAR', key: 'FK→dim_date', icon: '📅' },
              { name: 'action_type', type: 'VARCHAR', key: '', icon: '⚡' },
              { name: 'act_count', type: 'INT', key: 'measure', icon: '🔢' }
            ]
          },
          data_preview: [
            ['1',  '7',  'D1', 'like',    '3'],
            ['4',  '7',  'D2', 'like',    '5'],
            ['5',  '9',  'D2', 'like',    '4'],
            ['7',  '15', 'D2', 'like',    '2'],
            ['10', '12', 'D3', 'like',    '6']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'PM hỏi: "Chỉ xem THÁNG 6 thôi" — đây là thao tác gì trên khối?',
            options: [
              { id: 'a', text: 'Slice — cố định một giá trị trên chiều thời gian, lấy đúng một lát khối', correct: true, explanation: 'Đúng — slice = WHERE trên 1 chiều; khối 3D thành lát 2D (nước × loại) của riêng tháng 6.' },
              { id: 'b', text: 'Drill-down — vì tháng 6 chi tiết hơn cả năm', correct: false, explanation: 'Sai — drill-down là ĐỔI ĐỘ HẠT của kết quả (tháng → ngày); ở đây chỉ LỌC lấy một giá trị.' },
              { id: 'c', text: 'Roll-up — gộp dữ liệu về tháng', correct: false, explanation: 'Sai — roll-up là gộp NHIỀU mức nhỏ lên mức lớn; đây là chọn đúng 1 lát, không gộp gì.' },
              { id: 'd', text: 'Dice — vì có điều kiện WHERE', correct: false, explanation: 'Sai — dice là cắt theo NHIỀU chiều cùng lúc; một điều kiện cố định 1 chiều là slice.' }
            ]
          },
          {
            question: 'Đang xem "like theo THÁNG", PM muốn biết "ngày nào trong tháng 6 cao nhất" — thao tác nào?',
            options: [
              { id: 'a', text: 'Drill-down — đi xuống mức chi tiết hơn trên chiều thời gian: GROUP BY từ tháng thành từng ngày', correct: true, explanation: 'Đúng — cùng dữ liệu, đổi độ hạt: month → full_date. Đây chính là step 4 của bạn.' },
              { id: 'b', text: 'Slice — vì vẫn đang lọc tháng 6', correct: false, explanation: 'Sai — lọc tháng 6 vẫn giữ, nhưng YÊU CẦU MỚI là đổi độ hạt kết quả → drill-down.' },
              { id: 'c', text: 'Roll-up — xuống chi tiết hơn', correct: false, explanation: 'Sai — roll-up đi CHIỀU NGƯỢC LẠI (gộp lên); xuống chi tiết là drill-down.' },
              { id: 'd', text: 'Pivot — xoay hàng thành cột', correct: false, explanation: 'Sai — pivot đổi cách TRÌNH BÀY, không đổi độ hạt dữ liệu.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Câu hỏi của PM = thao tác nào?',
          instruction: 'Nghe câu hỏi, gọi tên thao tác OLAP — kéo mỗi câu vào đúng ô.',
          xp: 20,
          chips: [
            { id: 'p1', label: '"Chỉ xem dữ liệu của VN thôi"' },
            { id: 'p2', label: '"Tách bảng theo nước VÀ loại hành động"' },
            { id: 'p3', label: '"Tháng 6 cao — tuần nào, ngày nào gánh?"' },
            { id: 'p4', label: '"Gộp số ngày lại thành theo quý cho gọn"' }
          ],
          bins: [
            { id: 'slice', label: 'SLICE', correct: 'slice' },
            { id: 'dice', label: 'DICE', correct: 'dice' },
            { id: 'drill', label: 'DRILL-DOWN', correct: 'drill' },
            { id: 'rollup', label: 'ROLL-UP', correct: 'rollup' }
          ],
          solution: { p1: 'slice', p2: 'dice', p3: 'drill', p4: 'rollup' }
        }
      },
      step_3: {
        mission: 'Trả lời 2 câu đầu của PM trong MỘT query: <strong>slice tháng 6 + chỉ like</strong>, <strong>dice theo quốc gia</strong> — tổng like nhiều → ít.',
        blocks: [
          { type: 'kw', token: 'SELECT', slot: 'kw-select' },
          { type: 'col', token: 'u.country', slot: 'col-1' },
          { type: 'fn', token: 'SUM(f.act_count) AS total', slot: 'fn-1' },
          { type: 'kw', token: 'FROM', slot: 'kw-from' },
          { type: 'tbl', token: 'fact_post_action f', slot: 'tbl' },
          { type: 'op', token: 'JOIN dim_date d ON f.date_id = d.date_id', slot: 'op-join1' },
          { type: 'op', token: 'JOIN dim_user u ON f.user_id = u.user_id', slot: 'op-join2' },
          { type: 'kw', token: 'WHERE', slot: 'kw-where' },
          { type: 'op', token: "d.month = 6 AND f.action_type = 'like'", slot: 'op-where' },
          { type: 'kw', token: 'GROUP BY', slot: 'kw-group' },
          { type: 'col', token: 'u.country', slot: 'col-g' },
          { type: 'kw', token: 'ORDER BY', slot: 'kw-order' },
          { type: 'col', token: 'total DESC', slot: 'col-o' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____', accepts: ['kw', 'col', 'fn'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line', placeholder: 'FROM ____ JOIN 2 chiều', accepts: ['kw', 'tbl', 'op'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line', placeholder: 'WHERE ____ (slice!)', accepts: ['kw', 'op'], acceptedKeywords: ['WHERE'], multi: true },
          { id: 'group-line', placeholder: 'GROUP BY ____ (dice!)', accepts: ['kw', 'col'], acceptedKeywords: ['GROUP BY'], multi: true },
          { id: 'order-line', placeholder: 'ORDER BY ____', accepts: ['kw', 'col'], acceptedKeywords: ['ORDER BY'], multi: true }
        ],
        expected_sql: "SELECT u.country, SUM(f.act_count) AS total FROM fact_post_action f JOIN dim_date d ON f.date_id = d.date_id JOIN dim_user u ON f.user_id = u.user_id WHERE d.month = 6 AND f.action_type = 'like' GROUP BY u.country ORDER BY total DESC;",
        reveal_hints: {
          'select-line': 'Chiều hiển thị + số đo: <strong>u.country, SUM(f.act_count) AS total</strong>.',
          'from-line': 'Cần CẢ HAI chiều: fact nối <strong>dim_date</strong> (để slice tháng) và <strong>dim_user</strong> (để dice nước).',
          'where-line': 'Slice kép: <strong>d.month = 6 AND f.action_type = \'like\'</strong>.',
          'group-line': 'Dice theo nước: <strong>u.country</strong>.',
          'order-line': 'Nhiều → ít: <strong>total DESC</strong>.'
        }
      },
      step_4: {
        prompt: 'Câu thứ ba của PM — <strong>drill-down</strong>: "VN trong tháng 6, NGÀY nào sôi động nhất?". Giữ slice tháng 6, đổi lát cắt: lọc thêm <code>u.country = \'VN\'</code>, còn GROUP BY khoan xuống <code>d.full_date</code> (tính MỌI loại hành động, không riêng like).',
        starter: "-- Drill-down: VN thang 6 -> tung NGAY (moi loai hanh dong)\nSELECT d.full_date, SUM(f.act_count) AS total\n  FROM fact_post_action f\n  JOIN dim_date d ON f.date_id = d.date_id\n  JOIN ____ ON ____\n WHERE d.month = 6 AND ____\n GROUP BY ____\n ORDER BY total DESC;\n",
        schema: {
          table_name: 'fact_post_action',
          columns: [
            { name: 'action_id', type: 'INT', key: 'PK' },
            { name: 'user_id', type: 'INT', key: 'FK' },
            { name: 'date_id', type: 'VARCHAR', key: 'FK' },
            { name: 'action_type', type: 'VARCHAR', key: '' },
            { name: 'act_count', type: 'INT', key: '' }
          ],
          data: [
            ['1',  '7',  'D1', 'like',    '3'],
            ['2',  '9',  'D1', 'comment', '2'],
            ['3',  '12', 'D1', 'post',    '1'],
            ['4',  '7',  'D2', 'like',    '5'],
            ['5',  '9',  'D2', 'like',    '4'],
            ['6',  '12', 'D2', 'comment', '3'],
            ['7',  '15', 'D2', 'like',    '2'],
            ['8',  '9',  'D3', 'post',    '1'],
            ['9',  '7',  'D3', 'comment', '1'],
            ['10', '12', 'D3', 'like',    '6'],
            ['11', '15', 'D3', 'like',    '1'],
            ['12', '7',  'D3', 'post',    '1']
          ],
          related_schemas: [
            {
              table_name: 'dim_date',
              columns: [
                { name: 'date_id', type: 'VARCHAR', key: 'PK' },
                { name: 'full_date', type: 'DATE', key: '' },
                { name: 'day_name', type: 'VARCHAR', key: '' },
                { name: 'month', type: 'INT', key: '' },
                { name: 'year', type: 'INT', key: '' }
              ],
              data: [
                ['D1', '2026-06-01', 'Thứ 2', '6', '2026'],
                ['D2', '2026-06-02', 'Thứ 3', '6', '2026'],
                ['D3', '2026-07-01', 'Thứ 4', '7', '2026']
              ]
            },
            {
              table_name: 'dim_user',
              columns: [
                { name: 'user_id', type: 'INT', key: 'PK' },
                { name: 'username', type: 'VARCHAR', key: '' },
                { name: 'country', type: 'VARCHAR', key: '' }
              ],
              data: [
                ['7', 'minhkiller', 'VN'],
                ['9', 'yuki_sama', 'JP'],
                ['12', 'toxic_lord', 'VN'],
                ['15', 'sara_gg', 'US']
              ]
            }
          ]
        },
        context: {
          scenario: 'PM đang nhìn con số tháng — bạn khoan nó vỡ ra thành từng ngày, chỉ trong phạm vi VN. Cùng kho, cùng khung query, chỉ WHERE và GROUP BY đổi vai: đó là toàn bộ nghệ thuật OLAP.',
          real_world: 'Nút "xem chi tiết" trên mọi dashboard (click cột tháng → nổ ra ngày) chạy đúng thao tác drill-down này — <strong>độ hạt kết quả đổi, nguồn dữ liệu không đổi</strong>.',
          steps: [
            'Giữ chiều thời gian, thêm chiều người: <code>JOIN dim_user u ON f.user_id = u.user_id</code>.',
            'Slice mới: <code>WHERE d.month = 6 AND u.country = \'VN\'</code> (mọi loại hành động).',
            'Khoan độ hạt: <code>GROUP BY d.full_date</code> — tháng vỡ thành ngày.',
            'Nhẩm tay: VN tháng 6 = minhkiller(D1:3) + toxic_lord(D1:1) + minhkiller(D2:5) + toxic_lord(D2:3) → D2=8, D1=4.'
          ],
          hint_explore: 'Xem chiều thời gian: <code>SELECT * FROM dim_date</code> rồi Run — D1/D2 thuộc tháng 6, D3 đã sang tháng 7.',
          expected: 'Bảng 2 dòng: 2026-06-02 → 8 · 2026-06-01 → 4. Ngày 02/06 chính là hôm toxic_lord khẩu chiến (Ticket #24) — drama nuôi số liệu.'
        },
        hints: [
          { level: 1, text: 'Khung y hệt Step 3 — chỉ ĐỔI VAI: nước chuyển từ GROUP BY (dice) sang WHERE (slice), ngày chuyển từ WHERE sang GROUP BY (drill-down).' },
          { level: 2, text: 'JOIN đủ 2 chiều rồi lọc: <code>WHERE d.month = 6 AND u.country = \'VN\'</code>.' },
          { level: 3, text: 'Độ hạt ngày: <code>GROUP BY d.full_date</code> — và bỏ điều kiện action_type (đếm mọi loại).' },
          { level: 4, text: '<code class="code">SELECT d.full_date, SUM(f.act_count) AS total FROM fact_post_action f JOIN dim_date d ON f.date_id = d.date_id JOIN dim_user u ON f.user_id = u.user_id WHERE d.month = 6 AND u.country = \'VN\' GROUP BY d.full_date ORDER BY total DESC;</code>' }
        ],
        expected_sql: "SELECT d.full_date, SUM(f.act_count) AS total FROM fact_post_action f JOIN dim_date d ON f.date_id = d.date_id JOIN dim_user u ON f.user_id = u.user_id WHERE d.month = 6 AND u.country = 'VN' GROUP BY d.full_date ORDER BY total DESC;",
        success_message: 'Ticket #29 đóng! PM hỏi kiểu gì bạn cũng chỉ xoay khối — không viết lại từ đầu. Ticket #30 (chốt Module 5): một tài khoản lạ đang xả post từng phút — kho trả lời "hôm qua", nhưng ai trả lời "NGAY BÂY GIỜ"?',
        xp_reward: 120
      }
    },

    /* ── tc_10 — Ticket #30 · Tumbling Windows (tier-1: GROUP BY bucket + HAVING —
     *    probe t7/t8 xác nhận chạy thật). Kết thúc M5 → SHIP COMMUNITY v2.0. ── */
    {
      id: 'tc_10', index: 10,
      title: 'Tumbling Windows — đếm trên dòng chảy',
      subtitle: 'Chia thời gian thành cửa sổ khít 5 phút, bắt spammer ngay trong ô của hắn',
      module: 5, module_title: 'Big Data & Analytics',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'post_stream',
          columns: ['post_id', 'user_id', 'window_5m'],
          dataRows: [
            ['901', '12', '14:00'],
            ['902', '12', '14:00'],
            ['903', '7',  '14:00'],
            ['904', '12', '14:00'],
            ['905', '9',  '14:05'],
            ['906', '12', '14:05'],
            ['907', '7',  '14:10'],
            ['908', '7',  '14:10'],
            ['909', '7',  '14:10'],
            ['910', '7',  '14:10']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #30',
        hook: 'Một tài khoản lạ <strong>xả 4 post trong 3 phút</strong> — bot? Kho của Ticket #25 chỉ trả lời được "hôm qua" (ETL chạy đêm), còn chuyện này cần bắt <strong>ngay bây giờ</strong>, trên dữ liệu đang chảy. Ticket #30: chia dòng thời gian thành các <em>cửa sổ tumbling 5 phút</em> khít nhau — đếm ngay trong từng ô, user nào vượt ngưỡng trong MỘT cửa sổ là chuông reo. Đóng ticket này, <strong>Community v2.0 lên kệ</strong>. 🚀'
      },
      step_1: {
        primer: {
          goal: [
            'Stream ≠ batch: dữ liệu ĐẾN LIÊN TỤC, không có "cuối bảng" để chờ',
            'Tumbling window: các ô thời gian khít nhau, KHÔNG chờm — mỗi sự kiện thuộc đúng 1 ô',
            'Đếm trong ô = GROUP BY bucket thời gian; cảnh báo = HAVING vượt ngưỡng'
          ],
          intro: 'Mọi thứ bạn học tới giờ đều chờ dữ liệu NẰM YÊN rồi mới hỏi. Nhưng "đang có ai spam KHÔNG?" không chờ được — post mới đổ về từng giây. Lời giải của thế giới streaming: <strong>đóng khung thời gian</strong>. Cửa sổ <em>tumbling</em> 5 phút chia trục thời gian thành các ô khít [14:00–14:05), [14:05–14:10)… — sự kiện 14:04:59 vào ô trước, 14:05:00 sang ô sau, không ô nào chờm ô nào. Trong mỗi ô, bài toán lại thành đếm nhóm quen thuộc: <code>GROUP BY window</code>.',
          example: "<code>SELECT window_5m, user_id, COUNT(*) FROM post_stream GROUP BY window_5m, user_id HAVING COUNT(*) > 2;</code> — user nào xả >2 post trong MỘT cửa sổ?"
        },
        concept_cards: [
          {
            icon: 'fa-water',
            title: 'Stream — bảng không có dòng cuối',
            body: 'Batch (kho #25) hỏi trên dữ liệu ĐÃ CHỐT; stream xử lý sự kiện NGAY KHI ĐẾN. Không thể "SELECT hết rồi tính" vì chẳng bao giờ hết — mọi phép đếm phải tự khoanh phạm vi thời gian cho mình.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 10 — Streaming Data'
          },
          {
            icon: 'fa-table-cells',
            title: 'Tumbling vs Sliding vs Session',
            body: '<strong>Tumbling</strong>: ô khít, không chờm — mỗi sự kiện đúng 1 ô (đếm/báo cáo theo khối). <strong>Sliding</strong>: ô trượt chờm nhau — "5 phút GẦN NHẤT, cập nhật mỗi phút". <strong>Session</strong>: ô co giãn theo hành vi — hết im lặng 10 phút là đóng phiên. Chọn sai loại là báo động sai.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Cột <code>window_5m</code> trong bảng chính là nhãn ô đã gán sẵn cho từng post (phút làm tròn xuống bội 5). Nhờ nó, "đếm trên dòng chảy" quy về <code>GROUP BY window_5m</code> — kỹ năng từ Bài 1 tới giờ vẫn dùng, chỉ thêm khung thời gian.'
          }
        ],
        visual: {
          schema: {
            table_name: 'post_stream',
            columns: [
              { name: 'post_id', type: 'INT', key: 'PK', icon: '🔑' },
              { name: 'user_id', type: 'INT', key: 'FK', icon: '👤' },
              { name: 'window_5m', type: 'VARCHAR', key: 'bucket', icon: '⏱️' }
            ]
          },
          data_preview: [
            ['901', '12', '14:00'],
            ['902', '12', '14:00'],
            ['903', '7',  '14:00'],
            ['904', '12', '14:00'],
            ['905', '9',  '14:05'],
            ['907', '7',  '14:10']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Post đăng lúc <code>14:04:59</code> và post lúc <code>14:05:00</code> thuộc cửa sổ tumbling 5 phút nào?',
            options: [
              { id: 'a', text: 'Hai cửa sổ KHÁC nhau: [14:00–14:05) và [14:05–14:10) — ranh giới khít, không chờm', correct: true, explanation: 'Đúng — tumbling chia ô nửa-mở [bắt_đầu, kết_thúc): 14:04:59 vào ô trước, 14:05:00 mở ô sau. Mỗi sự kiện đúng 1 ô.' },
              { id: 'b', text: 'Cùng một cửa sổ vì chỉ cách nhau 1 giây', correct: false, explanation: 'Sai — ranh giới là ranh giới; "gần nhau" không phải tiêu chí, thuộc-ô-nào mới là tiêu chí.' },
              { id: 'c', text: 'Cả hai thuộc cả hai cửa sổ', correct: false, explanation: 'Sai — đó là SLIDING window (chờm nhau); tumbling mỗi sự kiện đúng 1 ô.' },
              { id: 'd', text: 'Không xác định được nếu thiếu timezone', correct: false, explanation: 'Sai — timezone là chuyện chuẩn hóa đầu vào; với cùng đồng hồ, phép chia ô là tuyệt đối.' }
            ]
          },
          {
            question: '"Số post trong 5 phút GẦN NHẤT, cập nhật mỗi phút" — cần loại cửa sổ nào?',
            options: [
              { id: 'a', text: 'Sliding — cửa sổ trượt chờm nhau, mỗi sự kiện có thể được đếm ở nhiều cửa sổ', correct: true, explanation: 'Đúng — "gần nhất + cập nhật liên tục" là chữ ký của sliding; tumbling chỉ chốt sổ mỗi 5 phút một lần.' },
              { id: 'b', text: 'Tumbling — vì vẫn là 5 phút', correct: false, explanation: 'Sai — tumbling trả lời "trong Ô 14:00–14:05 có gì", không trả lời "5 phút tính ngược từ BÂY GIỜ".' },
              { id: 'c', text: 'Session — vì người dùng đang hoạt động', correct: false, explanation: 'Sai — session co giãn theo khoảng lặng hành vi, không phải khung cố định trượt đều.' },
              { id: 'd', text: 'Không cần cửa sổ, chỉ cần ORDER BY thời gian', correct: false, explanation: 'Sai — ORDER BY sắp xếp, không khoanh phạm vi đếm trên dòng dữ liệu vô tận.' }
            ]
          }
        ],
        mini_game: {
          type: 'bug_spot',
          title: 'Vì sao báo động oan người dùng lâu năm?',
          instruction: 'Query "bắt spammer" dưới đây reo chuông với cả tài khoản 2 năm tuổi đăng đều đặn. Click DÒNG có lỗi.',
          xp: 25,
          code: 'SELECT user_id,\n       COUNT(*) AS total_posts\n  FROM post_stream\n GROUP BY user_id\nHAVING COUNT(*) > 2;',
          bugType: 'logic',
          bugs: [
            { line: 4, description: 'GROUP BY thiếu window_5m — đếm TOÀN BỘ lịch sử thay vì trong từng cửa sổ 5 phút: ai đăng >2 post trong đời cũng thành "spammer". Phải GROUP BY window_5m, user_id.' }
          ]
        }
      },
      step_3: {
        mission: 'Bước một của hệ cảnh báo: nhịp đăng bài toàn mạng — <strong>đếm số post trong TỪNG cửa sổ 5 phút</strong>, theo dòng thời gian.',
        blocks: [
          { type: 'kw', token: 'SELECT', slot: 'kw-select' },
          { type: 'col', token: 'window_5m', slot: 'col-1' },
          { type: 'fn', token: 'COUNT(*) AS posts', slot: 'fn-1' },
          { type: 'kw', token: 'FROM', slot: 'kw-from' },
          { type: 'tbl', token: 'post_stream', slot: 'tbl' },
          { type: 'kw', token: 'GROUP BY', slot: 'kw-group' },
          { type: 'col', token: 'window_5m', slot: 'col-g' },
          { type: 'kw', token: 'ORDER BY', slot: 'kw-order' },
          { type: 'col', token: 'window_5m', slot: 'col-o' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____', accepts: ['kw', 'col', 'fn'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line', placeholder: 'FROM ____', accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'group-line', placeholder: 'GROUP BY ____ (mỗi ô một nhóm)', accepts: ['kw', 'col'], acceptedKeywords: ['GROUP BY'], multi: true },
          { id: 'order-line', placeholder: 'ORDER BY ____ (theo dòng thời gian)', accepts: ['kw', 'col'], acceptedKeywords: ['ORDER BY'], multi: true }
        ],
        expected_sql: 'SELECT window_5m, COUNT(*) AS posts FROM post_stream GROUP BY window_5m ORDER BY window_5m;',
        reveal_hints: {
          'select-line': 'Nhãn ô + số đếm: <strong>window_5m, COUNT(*) AS posts</strong>.',
          'from-line': 'Dòng sự kiện: <strong>post_stream</strong>.',
          'group-line': 'Mỗi cửa sổ một nhóm: <strong>window_5m</strong>.',
          'order-line': 'Theo trục thời gian: <strong>window_5m</strong> (tăng dần — không cần DESC).'
        }
      },
      step_4: {
        prompt: 'Giờ mới là chuông báo thật — thêm chiều NGƯỜI và NGƯỠNG: <strong>"user nào đăng hơn 2 post trong MỘT cửa sổ?"</strong>. GROUP BY hai cột (cửa sổ, user) + <code>HAVING COUNT(*) > 2</code>, nhiều → ít.',
        starter: "-- Chuong bao spam: user vuot 2 post / 1 cua so 5 phut\nSELECT window_5m, user_id, COUNT(*) AS posts\n  FROM post_stream\n GROUP BY ____, ____\nHAVING ____\n ORDER BY posts DESC;\n",
        schema: {
          table_name: 'post_stream',
          columns: [
            { name: 'post_id', type: 'INT', key: 'PK' },
            { name: 'user_id', type: 'INT', key: 'FK' },
            { name: 'window_5m', type: 'VARCHAR', key: 'bucket' }
          ],
          data: [
            ['901', '12', '14:00'],
            ['902', '12', '14:00'],
            ['903', '7',  '14:00'],
            ['904', '12', '14:00'],
            ['905', '9',  '14:05'],
            ['906', '12', '14:05'],
            ['907', '7',  '14:10'],
            ['908', '7',  '14:10'],
            ['909', '7',  '14:10'],
            ['910', '7',  '14:10']
          ]
        },
        context: {
          scenario: 'Job cảnh báo chạy que này mỗi khi một cửa sổ đóng sổ. Chú ý bug_spot ở Step 2: thiếu <code>window_5m</code> trong GROUP BY là đếm cả đời người ta — oan sai đúng kiểu đó.',
          real_world: 'Chống spam/DDoS thực tế đều là <strong>đếm theo cửa sổ + ngưỡng</strong> (rate limiting): "100 request / phút / IP" — cùng bộ xương GROUP BY window, user HAVING vượt ngưỡng, chỉ khác quy mô.',
          steps: [
            'Hai chiều nhóm: <code>GROUP BY window_5m, user_id</code> — từng user TRONG từng ô.',
            'Ngưỡng trên nhóm: <code>HAVING COUNT(*) > 2</code> (WHERE không lọc được kết quả đếm).',
            'Xếp mức độ: <code>ORDER BY posts DESC</code>.',
            'Nhẩm tay: ô 14:00 — toxic_lord 3 post; ô 14:10 — minhkiller 4 post. Hai chuông sẽ reo.'
          ],
          hint_explore: 'Nhìn dòng chảy thô: <code>SELECT * FROM post_stream</code> rồi Run — để ý cụm 4 dòng cuối cùng một user, cùng một ô.',
          expected: 'Bảng 2 dòng: (14:10, user 7, 4 post) và (14:00, user 12, 3 post) — chuông reo đúng hai kẻ xả bài, người đăng đều đặn vô can.'
        },
        hints: [
          { level: 1, text: 'Khác Step 3 hai chỗ: nhóm thêm chiều user, và LỌC TRÊN KẾT QUẢ ĐẾM — việc của HAVING, không phải WHERE.' },
          { level: 2, text: 'Nhóm kép: <code>GROUP BY window_5m, user_id</code>.' },
          { level: 3, text: 'Ngưỡng: <code>HAVING COUNT(*) > 2</code>.' },
          { level: 4, text: '<code class="code">SELECT window_5m, user_id, COUNT(*) AS posts FROM post_stream GROUP BY window_5m, user_id HAVING COUNT(*) > 2 ORDER BY posts DESC;</code>' }
        ],
        expected_sql: 'SELECT window_5m, user_id, COUNT(*) AS posts FROM post_stream GROUP BY window_5m, user_id HAVING COUNT(*) > 2 ORDER BY posts DESC;',
        success_message: 'Ticket #30 đóng — Module 5 hoàn tất, GameHub Community v2.0 lên kệ! 🚀 Module 6: dữ liệu phình theo từng release — feed bắt đầu chậm, và câu trả lời nằm SÂU dưới lớp SQL: Storage, Index & Performance.',
        xp_reward: 120
      }
    }
  ]
};
