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
    },

    /* ═══════════ MODULE 6 — Storage, Indexing & Performance (Ticket #31-#41) ═══════════
     * Arc đợt 1 (tc_11-15): "feed chậm" truy xuống tầng hầm — hierarchy → seq/random →
     * buffer → trang & heap file → row/column. Toàn tier-3 khái niệm: step-3 dùng zone
     * tự khai station meta (drag_game M6) + expected_zones; step-4 xoay mcq_code /
     * fill_blank (không nhét SQL vào chỗ không có SQL — plan §2). */

    /* ── tc_11 — Ticket #31 · Storage Hierarchy ── */
    {
      id: 'tc_11', index: 11,
      title: 'Storage Hierarchy — dữ liệu thật sự nằm ở đâu',
      subtitle: 'Tháp lưu trữ: càng nhanh càng nhỏ càng đắt — và đĩa chậm hơn RAM trăm lần',
      module: 6, module_title: 'Storage, Indexing & Performance',
      estimated_minutes: 15, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'mcq_code',
      drag_map: {
        table: {
          name: 'storage_tiers',
          columns: ['tầng', 'độ_trễ', 'sức_chứa', 'mất_điện'],
          dataRows: [
            ['CPU Cache', '~1 ns',    'vài MB',    'mất sạch'],
            ['RAM',       '~100 ns',  'vài chục GB', 'mất sạch'],
            ['SSD',       '~100 µs',  'vài TB',    'giữ nguyên'],
            ['HDD',       '~10 ms',   'chục TB',   'giữ nguyên']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #31',
        hook: 'Community v2.0 lên báo, 50 nghìn tài khoản mới một tuần — và lần đầu tiên spinner của feed quay quá 3 giây. Bạn soi lại: <em>câu SQL không hề đổi</em>, chỉ có dữ liệu là phình ra. Thủ phạm không nằm trong SQL — nằm dưới TẦNG HẦM: dữ liệu sống trên đĩa, mà đĩa chậm hơn RAM hàng trăm lần. Ticket #31: xuống hầm xem một dòng post thật sự NẰM Ở ĐÂU, và đi đường nào lên màn hình.'
      },
      step_1: {
        primer: {
          goal: [
            'Tháp lưu trữ: CPU cache → RAM → SSD → HDD — càng lên cao càng nhanh, càng nhỏ, càng đắt',
            'Dữ liệu database phải BỀN VỮNG → bản gốc luôn nằm ở đĩa (SSD/HDD); RAM mất sạch khi cúp điện',
            'CPU không đọc thẳng từ đĩa: dữ liệu được nạp lên RAM theo TRANG (page ~8KB) rồi mới xử lý'
          ],
          intro: 'Trước giờ bạn viết SQL như thể dữ liệu "ở đó sẵn". Sự thật: mỗi dòng post nằm trong một TRANG 8KB trên đĩa. Muốn đọc, Postgres phải khiêng nguyên trang đó lên RAM — và cái giá mỗi tầng khác nhau khủng khiếp: RAM tính bằng nano-giây, SSD micro-giây, HDD mili-giây. Feed chậm không phải vì SQL dở đi — vì số chuyến khiêng-trang-từ-đĩa tăng theo dữ liệu. Mọi kỹ thuật của Module 6 quy về đúng một câu: <strong>giảm số lần chạm đĩa</strong>.',
          example: 'Đọc 1 post trong RAM ≈ 100 ns · từ SSD ≈ 100 µs (chậm hơn ~1.000×) · từ HDD ≈ 10 ms (chậm hơn ~100.000×).'
        },
        concept_cards: [
          {
            icon: 'fa-layer-group',
            title: 'Tháp đánh đổi ba chiều',
            body: 'Không tồn tại bộ nhớ vừa nhanh, vừa to, vừa rẻ — nên máy tính xếp THÁP: đỉnh nhanh-nhỏ-đắt (cache, RAM), đáy chậm-to-rẻ (SSD, HDD). Hệ thống giỏi là hệ thống giữ dữ liệu NÓNG ở gần đỉnh, dữ liệu nguội ở đáy.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 12 — Physical Storage Systems'
          },
          {
            icon: 'fa-plug-circle-xmark',
            title: 'Volatile vs bền vững — ranh giới sống còn',
            body: 'CPU cache và RAM là <strong>volatile</strong>: cúp điện là trắng tay. Database cam kết dữ liệu KHÔNG MẤT (nhớ delete_user #22 chạy trọn gói?) — nên bản gốc bắt buộc nằm từ SSD trở xuống. RAM chỉ là chỗ LÀM VIỆC, không phải chỗ Ở.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Nhìn bảng storage_tiers bên cạnh: SSD → RAM chênh ~1.000 lần. Nghĩa là MỘT trang được giữ lại trên RAM (thay vì đọc lại từ đĩa) tiết kiệm bằng cả nghìn lần đọc RAM — đó chính là lý do tồn tại của buffer ở Ticket #33.'
          }
        ],
        visual: {
          schema: {
            table_name: 'storage_tiers',
            columns: [
              { name: 'tầng', type: 'TEXT', key: '', icon: '🏗️' },
              { name: 'độ_trễ', type: 'TEXT', key: '', icon: '⏱️' },
              { name: 'sức_chứa', type: 'TEXT', key: '', icon: '📦' },
              { name: 'mất_điện', type: 'TEXT', key: '', icon: '🔌' }
            ]
          },
          data_preview: [
            ['CPU Cache', '~1 ns',    'vài MB',      'mất sạch'],
            ['RAM',       '~100 ns',  'vài chục GB', 'mất sạch'],
            ['SSD',       '~100 µs',  'vài TB',      'giữ nguyên'],
            ['HDD',       '~10 ms',   'chục TB',     'giữ nguyên']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Vì sao KHÔNG để cả database Community nằm hẳn trong RAM cho nhanh?',
            options: [
              { id: 'a', text: 'RAM vừa đắt vừa VOLATILE — cúp điện là mất sạch; dữ liệu bền vững bắt buộc phải có mặt trên đĩa', correct: true, explanation: 'Đúng cả hai vế — chi phí và tính bay hơi. RAM là bàn làm việc, đĩa mới là két sắt.' },
              { id: 'b', text: 'Vì RAM đọc chậm hơn SSD', correct: false, explanation: 'Sai — RAM nhanh hơn SSD cỡ nghìn lần; vấn đề là giá và tính bay hơi.' },
              { id: 'c', text: 'Vì SQL không truy cập được dữ liệu trong RAM', correct: false, explanation: 'Sai — ngược lại: CPU CHỈ xử lý được dữ liệu đã ở RAM; SQL nào cũng đi qua RAM.' },
              { id: 'd', text: 'Vì luật bảo mật cấm để dữ liệu người dùng trong RAM', correct: false, explanation: 'Sai — không có luật nào như vậy; mọi hệ thống đều xử lý dữ liệu trong RAM.' }
            ]
          },
          {
            question: 'Postgres cần đúng MỘT dòng post 200 byte đang nằm trên đĩa — nó đọc lên bao nhiêu?',
            options: [
              { id: 'a', text: 'Nguyên TRANG ~8KB chứa dòng đó — đĩa và RAM nói chuyện theo đơn vị trang, không theo dòng', correct: true, explanation: 'Đúng — page/block là đơn vị vận chuyển. Muốn 200 byte vẫn khiêng 8KB; vì thế xếp các dòng hay đọc-cùng-nhau vào cùng trang là ăn tiền (hẹn Ticket #34).' },
              { id: 'b', text: 'Đúng 200 byte của dòng đó', correct: false, explanation: 'Sai — phần cứng không phục vụ lẻ; giao dịch tối thiểu là 1 trang.' },
              { id: 'c', text: 'Cả bảng posts', correct: false, explanation: 'Sai — chỉ khi full scan mới đọc mọi trang của bảng; đọc 1 dòng chỉ cần 1 trang.' },
              { id: 'd', text: 'Chỉ cột được SELECT của dòng đó', correct: false, explanation: 'Sai — row-store lưu cả dòng liền nhau trong trang; đọc theo cột là chuyện của Ticket #35.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'RAM hay Đĩa?',
          instruction: 'Mỗi đặc tính thuộc về tầng nào? Kéo vào đúng ô.',
          xp: 20,
          chips: [
            { id: 'h1', label: 'Cúp điện là mất sạch (volatile)' },
            { id: 'h2', label: 'Bản gốc database bắt buộc nằm ở đây' },
            { id: 'h3', label: 'Độ trễ tính bằng nano-giây' },
            { id: 'h4', label: 'Rẻ, chứa hàng TB, giữ dữ liệu khi tắt máy' }
          ],
          bins: [
            { id: 'ram', label: 'RAM', correct: 'ram' },
            { id: 'disk', label: 'ĐĨA (SSD/HDD)', correct: 'disk' }
          ],
          solution: { h1: 'ram', h2: 'disk', h3: 'ram', h4: 'disk' }
        }
      },
      step_3: {
        mission: 'Dựng lại THÁP LƯU TRỮ từ nhanh nhất xuống chậm nhất — gắn đúng vai của từng tầng với hệ Community. Có một khối bịa đặt trong khay.',
        blocks: [
          { type: 'op', token: 'RAM — vài chục GB, nơi buffer của Postgres sống, mất sạch khi cúp điện', slot: 'tier-2' },
          { type: 'op', token: 'CPU Cache — vài MB, nano-giây, đắt nhất', slot: 'tier-1' },
          { type: 'op', token: 'HDD / băng từ — rẻ nhất, cho backup & dữ liệu nguội', slot: 'tier-4' },
          { type: 'op', token: 'SSD — bền vững, database Community đang nằm đây', slot: 'tier-3' },
          { type: 'op', token: 'CPU register — to hàng TB, rẻ như cho', slot: 'tier-x' }
        ],
        drop_zones: [
          { id: 'tier-1', placeholder: 'Tầng 1 — nhanh nhất, nhỏ nhất', accepts: ['op'], multi: false,
            station: { icon: '⚡', label: 'Tầng 1', sub: 'Đỉnh tháp', hint: 'Sát CPU nhất: dung lượng vài MB nhưng độ trễ nano-giây.' } },
          { id: 'tier-2', placeholder: 'Tầng 2 — bàn làm việc của database', accepts: ['op'], multi: false,
            station: { icon: '🧠', label: 'Tầng 2', sub: 'Bàn làm việc', hint: 'Nơi mọi trang dữ liệu phải đi qua trước khi CPU xử lý — nhưng volatile.' } },
          { id: 'tier-3', placeholder: 'Tầng 3 — nhà của dữ liệu Community', accepts: ['op'], multi: false,
            station: { icon: '💾', label: 'Tầng 3', sub: 'Két sắt chính', hint: 'Bền vững + đủ nhanh — bản gốc database ở đây.' } },
          { id: 'tier-4', placeholder: 'Tầng 4 — kho nguội', accepts: ['op'], multi: false,
            station: { icon: '🗄️', label: 'Tầng 4', sub: 'Đáy tháp', hint: 'Chậm nhất, rẻ nhất — chỗ của backup và dữ liệu ít đụng tới.' } }
        ],
        expected_sql: 'CPU Cache — vài MB, nano-giây, đắt nhất RAM — vài chục GB, nơi buffer của Postgres sống, mất sạch khi cúp điện SSD — bền vững, database Community đang nằm đây HDD / băng từ — rẻ nhất, cho backup & dữ liệu nguội',
        expected_zones: {
          'tier-1': 'CPU Cache — vài MB, nano-giây, đắt nhất',
          'tier-2': 'RAM — vài chục GB, nơi buffer của Postgres sống, mất sạch khi cúp điện',
          'tier-3': 'SSD — bền vững, database Community đang nằm đây',
          'tier-4': 'HDD / băng từ — rẻ nhất, cho backup & dữ liệu nguội'
        },
        reveal_hints: {
          'tier-1': 'Đỉnh tháp nhanh nhất: <strong>CPU Cache</strong>. Khối "CPU register to hàng TB" là bịa — register còn nhỏ hơn cache nhiều.',
          'tier-2': 'Bàn làm việc volatile: <strong>RAM</strong> — buffer của Ticket #33 sẽ sống ở đây.',
          'tier-3': 'Két sắt chính, bền vững: <strong>SSD</strong>.',
          'tier-4': 'Đáy tháp: <strong>HDD/băng từ</strong> cho backup.'
        }
      },
      step_4: {
        prompt: 'Một người dùng mở post #501. Dòng dữ liệu đó đi ĐƯỜNG NÀO từ đĩa lên màn hình? Chọn mô tả đúng:',
        challenge_type: 'mcq_code',
        options: [
          { text: 'Đĩa → nạp NGUYÊN TRANG 8KB chứa dòng vào buffer trên RAM → CPU đọc dòng từ RAM. Lần mở sau, nếu trang còn trong buffer thì khỏi chạm đĩa.', correct: true },
          { text: 'CPU đọc thẳng dòng 200 byte từ đĩa, không cần qua RAM — vì SSD hiện đại đã đủ nhanh.', correct: false },
          { text: 'Cả bảng posts được nạp vào RAM ngay khi Postgres khởi động, nên không bao giờ phải chạm đĩa.', correct: false },
          { text: 'Dòng được đọc từ đĩa lên CPU cache trước, rồi mới chuyển xuống RAM cho Postgres.', correct: false }
        ],
        context: {
          scenario: 'Đây là chuyến đi mà MỌI truy vấn của Community đều thực hiện — từ Bài 1 tới giờ, chỉ là bạn chưa từng nhìn thấy nó. Hiểu chuyến đi này thì mọi kỹ thuật còn lại của Module 6 chỉ là "rút ngắn đường".',
          real_world: 'Câu "database của tôi nhanh vì có nhiều RAM" mà dev hay nói — bản chất là: nhiều RAM = buffer to = nhiều trang nóng khỏi phải xuống đĩa lấy lại.',
          steps: [
            'Bản gốc dòng nằm trong 1 trang ~8KB trên SSD.',
            'Đơn vị vận chuyển là TRANG — không phải dòng (MCQ 2).',
            'Trang phải lên RAM thì CPU mới xử lý được.',
            'Trang ở lại RAM sau lần đọc → lần sau miễn phí chuyến đĩa (Ticket #33 khai thác điều này).'
          ],
          hint_explore: 'Ngó lại bảng <code>storage_tiers</code> ở Step 1 — chênh lệch SSD↔RAM là ~1.000 lần.',
          expected: 'Chọn đúng đường đi 3 chặng: đĩa → trang → RAM → CPU, kèm quyền "ở lại" của trang trong buffer.'
        },
        hints: [
          { level: 1, text: 'Nhớ 2 luật từ MCQ: CPU chỉ xử lý được dữ liệu ĐÃ Ở RAM, và đĩa↔RAM giao dịch theo TRANG.' },
          { level: 2, text: 'Loại phương án nào cho CPU "đọc thẳng từ đĩa" hoặc nạp "cả bảng" — cả hai đều phạm luật trên.' },
          { level: 3, text: 'CPU cache là chuyện giữa CPU và RAM — dữ liệu không đi đường đĩa → cache → RAM.' },
          { level: 4, text: 'Đáp án: phương án mô tả Đĩa → TRANG vào buffer RAM → CPU, có "lần sau khỏi chạm đĩa".' }
        ],
        success_message: 'Ticket #31 đóng! Bạn đã thấy tầng hầm — giờ mọi chữ "chậm" đều truy được về "bao nhiêu chuyến xuống đĩa". Ticket #32: cùng 100 post, vì sao cuộn timeline thì mượt mà mở bookmark rải rác thì ì ạch?',
        xp_reward: 120
      }
    },

    /* ── tc_12 — Ticket #32 · Sequential vs Random Access ── */
    {
      id: 'tc_12', index: 12,
      title: 'Sequential vs Random — cách chạm đĩa quyết định tốc độ',
      subtitle: 'Cùng 100 dòng: đọc liền dải trả 1 lần seek, đọc rải rác trả 100 lần',
      module: 6, module_title: 'Storage, Indexing & Performance',
      estimated_minutes: 15, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'fill_blank',
      drag_map: {
        table: {
          name: 'io_benchmark',
          columns: ['thao_tác', 'số_dòng', 'cách_đọc', 'thời_gian'],
          dataRows: [
            ['Cuộn timeline',      '100', 'liền dải',  '12 ms'],
            ['Mở bookmark rải rác', '100', 'nhảy cóc', '980 ms'],
            ['Full scan kho #25',  '38M', 'liền dải',  '41 s'],
            ['Tra 1000 id trộn',   '1000', 'nhảy cóc', '9.8 s']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #32',
        hook: 'Đo thử hai thao tác cùng đọc đúng 100 post: cuộn timeline mượt như bơ — 12 mili-giây; mở 100 post đã bookmark rải rác — gần MỘT GIÂY. Cùng số dòng, cùng bảng, cùng SQL độ khó như nhau. Khác đúng một thứ: <em>cách chạm đĩa</em> — một bên đọc liền một dải, một bên nhảy cóc trăm nơi. Ticket #32: mổ xẻ vì sao random đắt thế, và database làm gì để né nó.'
      },
      step_1: {
        primer: {
          goal: [
            'Một lần đọc HDD = seek (di chuyển đầu đọc) + rotate (chờ đĩa quay) + transfer (đọc thật)',
            'Sequential trả seek+rotate MỘT lần rồi transfer suốt; random trả TỪNG dòng một',
            'Database né random bằng cách GOM: sort trước khi đọc, xếp dữ liệu hay đọc-cùng-nhau nằm cạnh nhau'
          ],
          intro: 'Trên HDD, đầu đọc là cánh tay cơ khí thật: muốn đọc chỗ khác phải DI CHUYỂN (seek, vài ms) rồi CHỜ đĩa quay tới nơi (rotate). Phần đọc dữ liệu thật (transfer) lại rất nhanh. Đọc 100 post nằm liền nhau: trả seek+rotate MỘT lần, transfer 100 dòng một hơi. Đọc 100 post rải rác: trả đủ bộ seek+rotate MỘT TRĂM lần — tiền vé đắt hơn tiền hàng. SSD không có cánh tay cơ khí nên đỡ hơn nhiều, nhưng đọc liền dải vẫn thắng nhờ đọc theo trang và prefetch.',
          example: 'io_benchmark: 100 dòng liền dải 12ms vs 100 dòng nhảy cóc 980ms — chênh ~80 lần, toàn bộ là tiền seek.'
        },
        concept_cards: [
          {
            icon: 'fa-compact-disc',
            title: 'Giải phẫu một lần đọc đĩa',
            body: 'HDD: <strong>seek</strong> (đầu đọc dời track, ~vài ms) + <strong>rotational delay</strong> (chờ sector quay tới, ~vài ms) + <strong>transfer</strong> (đọc dải dữ liệu — phần rẻ). Random access = trả 2 khoản đầu cho MỖI lần đọc; sequential chỉ trả 1 lần cho cả chuyến.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 12 — Physical Storage Systems / Magnetic Disks'
          },
          {
            icon: 'fa-bolt',
            title: 'SSD có thoát nạn không?',
            body: 'SSD không có đầu đọc cơ khí — random rẻ hơn HDD cả trăm lần. NHƯNG sequential vẫn thắng: đọc theo trang liền kề tận dụng prefetch và băng thông nội bộ. Nguyên tắc "gom việc đọc liền mạch" sống lâu hơn mọi đời phần cứng.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Mẹo rẻ nhất để cứu random: <strong>SORT danh sách vị trí trước khi đọc</strong> — 100 điểm rải rác sau khi sắp xếp thành lộ trình một chiều, seek ngắn dần thay vì nhảy loạn. Mini-game bên dưới có đúng bug này.'
          }
        ],
        visual: {
          schema: {
            table_name: 'io_benchmark',
            columns: [
              { name: 'thao_tác', type: 'TEXT', key: '', icon: '🖱️' },
              { name: 'số_dòng', type: 'INT', key: '', icon: '🔢' },
              { name: 'cách_đọc', type: 'TEXT', key: '', icon: '🧭' },
              { name: 'thời_gian', type: 'TEXT', key: '', icon: '⏱️' }
            ]
          },
          data_preview: [
            ['Cuộn timeline',       '100',  'liền dải', '12 ms'],
            ['Mở bookmark rải rác', '100',  'nhảy cóc', '980 ms'],
            ['Full scan kho #25',   '38M',  'liền dải', '41 s'],
            ['Tra 1000 id trộn',    '1000', 'nhảy cóc', '9.8 s']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Cùng đọc 100 post, vì sao bản "rải rác" chậm hơn bản "liền dải" tới ~80 lần?',
            options: [
              { id: 'a', text: 'Vì phải trả seek + rotate cho TỪNG post — còn liền dải chỉ trả một lần rồi transfer suốt', correct: true, explanation: 'Đúng — tiền vé (seek+rotate) đắt hơn tiền hàng (transfer); random trả vé 100 lần.' },
              { id: 'b', text: 'Vì 100 post rải rác có dung lượng lớn hơn', correct: false, explanation: 'Sai — cùng 100 dòng, cùng dung lượng; khác nhau ở số lần DI CHUYỂN.' },
              { id: 'c', text: 'Vì SQL của bản rải rác phức tạp hơn', correct: false, explanation: 'Sai — độ phức tạp SQL như nhau; chi phí nằm ở tầng vật lý.' },
              { id: 'd', text: 'Vì bản rải rác không dùng được RAM', correct: false, explanation: 'Sai — cả hai đều đi qua RAM; khác nhau ở số chuyến XUỐNG ĐĨA.' }
            ]
          },
          {
            question: 'Chuyển hết sang SSD (không còn đầu đọc cơ khí) — bài học "đọc liền dải" còn giá trị không?',
            options: [
              { id: 'a', text: 'Còn — random trên SSD rẻ hơn HDD nhiều nhưng sequential vẫn thắng nhờ đọc theo trang liền kề + prefetch', correct: true, explanation: 'Đúng — chênh lệch co lại (từ ~100× còn vài lần) nhưng không biến mất; nguyên tắc gom liền mạch vẫn ăn tiền.' },
              { id: 'b', text: 'Hết — trên SSD random và sequential nhanh y hệt nhau', correct: false, explanation: 'Sai — prefetch, kích thước trang và băng thông nội bộ vẫn ưu ái đọc liền dải.' },
              { id: 'c', text: 'Ngược lại — SSD đọc random còn nhanh hơn sequential', correct: false, explanation: 'Sai — không có phần cứng phổ biến nào như vậy.' },
              { id: 'd', text: 'SSD không đọc được theo kiểu random', correct: false, explanation: 'Sai — đọc được và khá nhanh; chỉ là vẫn thua liền dải.' }
            ]
          }
        ],
        mini_game: {
          type: 'bug_spot',
          title: 'Cứu trang bookmark',
          instruction: 'Code mở danh sách bookmark chạy chậm gấp chục lần mức cần thiết. Click DÒNG có lỗi (gợi ý: thứ tự!).',
          xp: 25,
          code: 'bookmarks = [8821, 302, 4577, 91, 15023]\nfor post_id in bookmarks:\n    vi_tri = locate_on_disk(post_id)\n    page = disk.read_page(vi_tri)\n    render(page.get(post_id))',
          bugType: 'performance',
          bugs: [
            { line: 2, description: 'Duyệt theo thứ tự NGẪU NHIÊN của danh sách → đầu đọc nhảy loạn (seek tối đa). Sort danh sách theo vị trí trên đĩa trước khi đọc — lộ trình thành một chiều, random hóa gần-tuần-tự.' }
          ]
        }
      },
      step_3: {
        mission: 'Mổ xẻ MỘT lần đọc random trên HDD thành 3 chặng chi phí, đúng thứ tự — và vạch mặt chặng mà đọc TUẦN TỰ cũng phải trả. Có một khối bịa.',
        blocks: [
          { type: 'op', token: 'Transfer: đọc dải dữ liệu — chặng DUY NHẤT mà đọc tuần tự cũng phải trả', slot: 'io-3' },
          { type: 'op', token: 'Seek: đầu đọc DI CHUYỂN tới đúng track — vài mili-giây mỗi lần', slot: 'io-1' },
          { type: 'op', token: 'Compile: đĩa biên dịch lại câu SQL trước khi đọc', slot: 'io-x' },
          { type: 'op', token: 'Rotational delay: CHỜ sector cần đọc quay tới dưới đầu đọc', slot: 'io-2' }
        ],
        drop_zones: [
          { id: 'io-1', placeholder: 'Chặng 1 — trả tiền di chuyển', accepts: ['op'], multi: false,
            station: { icon: '🎯', label: 'Chặng 1', sub: 'Di chuyển', hint: 'Cánh tay cơ khí phải TỚI ĐÚNG track trước đã — khoản đắt nhất.' } },
          { id: 'io-2', placeholder: 'Chặng 2 — trả tiền chờ', accepts: ['op'], multi: false,
            station: { icon: '⏳', label: 'Chặng 2', sub: 'Chờ quay', hint: 'Tới track rồi vẫn phải chờ đĩa quay đến đúng sector.' } },
          { id: 'io-3', placeholder: 'Chặng 3 — mua hàng thật', accepts: ['op'], multi: false,
            station: { icon: '📤', label: 'Chặng 3', sub: 'Đọc dữ liệu', hint: 'Phần rẻ nhất — và là phần duy nhất sequential cũng trả.' } }
        ],
        expected_sql: 'Seek: đầu đọc DI CHUYỂN tới đúng track — vài mili-giây mỗi lần Rotational delay: CHỜ sector cần đọc quay tới dưới đầu đọc Transfer: đọc dải dữ liệu — chặng DUY NHẤT mà đọc tuần tự cũng phải trả',
        expected_zones: {
          'io-1': 'Seek: đầu đọc DI CHUYỂN tới đúng track — vài mili-giây mỗi lần',
          'io-2': 'Rotational delay: CHỜ sector cần đọc quay tới dưới đầu đọc',
          'io-3': 'Transfer: đọc dải dữ liệu — chặng DUY NHẤT mà đọc tuần tự cũng phải trả'
        },
        reveal_hints: {
          'io-1': 'Trước khi đọc phải TỚI NƠI: <strong>Seek</strong>. Khối "Compile" là bịa — đĩa không biết SQL là gì.',
          'io-2': 'Tới track rồi còn phải <strong>chờ đĩa quay</strong> tới đúng sector.',
          'io-3': 'Cuối cùng mới là <strong>Transfer</strong> — sequential chỉ phải trả đúng chặng này (sau lần seek đầu).'
        }
      },
      step_4: {
        prompt: 'Điền 3 con số/từ chốt hạ bài toán 100 post — nhìn lại io_benchmark nếu cần.',
        challenge_type: 'fill_blank',
        template: '# Đọc 100 post LIỀN DẢI trên đĩa:\n#   → trả seek + rotate ____ lần, rồi transfer một mạch\n\n# Đọc 100 post RẢI RÁC:\n#   → trả seek + rotate ____ lần — mỗi post một vé\n\n# Mẹo của database khi buộc phải đọc rải rác:\n#   → ____ danh sách vị trí trước khi đọc (bug ở mini-game!),\n#     biến lộ trình nhảy loạn thành một chiều gần-tuần-tự',
        blanks: [
          { id: 'b1', hint: 'mấy lần?', expected: '1' },
          { id: 'b2', hint: 'mấy lần?', expected: '100' },
          { id: 'b3', hint: 'tiếng Anh, 4 chữ cái', expected: 'sort' }
        ],
        context: {
          scenario: 'Ba ô này là toàn bộ "kinh tế học" của I/O: vé (seek+rotate) đắt, hàng (transfer) rẻ — mua sỉ một chuyến thay vì mua lẻ trăm chuyến.',
          real_world: 'Elevator algorithm của hệ điều hành, bitmap heap scan của Postgres — đều là "sort vị trí trước khi đọc" ở quy mô công nghiệp.',
          steps: [
            'Liền dải: một vé cho cả chuyến — seek + rotate đúng 1 lần.',
            'Rải rác: mỗi post một vé — 100 lần.',
            'Không đổi được vị trí dữ liệu ngay? Đổi THỨ TỰ GHÉ: sort.',
            'Muốn triệt để hơn — xếp dữ liệu nằm sẵn cạnh nhau: chờ clustering ở Ticket #37.'
          ],
          hint_explore: 'Bảng io_benchmark Step 1: 12ms vs 980ms cho cùng 100 dòng — toàn bộ chênh lệch là tiền vé.',
          expected: 'Điền đúng 3/3: 1 · 100 · sort. Bài pseudo-code — chấm theo ô điền.'
        },
        hints: [
          { level: 1, text: 'Tiền vé = seek + rotate. Liền dải mua vé mấy lần? Rải rác mấy lần?' },
          { level: 2, text: 'Ô 1 và ô 2: 1 và 100 — đó chính là chênh lệch ~80× trong io_benchmark.' },
          { level: 3, text: 'Ô 3: mini-game vừa sửa bug gì? Sắp xếp danh sách vị trí = <code>sort</code>.' },
          { level: 4, text: 'Đáp án: <code>1</code> · <code>100</code> · <code>sort</code>.' }
        ],
        success_message: 'Ticket #32 đóng! Từ giờ thấy chữ "chậm" là bạn hỏi ngay: bao nhiêu vé seek? Ticket #33: post viral bị mở 10.000 lần/phút — và lý do đĩa không bốc cháy tên là BUFFER.',
        xp_reward: 120
      }
    },

    /* ── tc_13 — Ticket #33 · Buffer Manager ── */
    {
      id: 'tc_13', index: 13,
      title: 'Buffer Manager — trí nhớ ngắn hạn của database',
      subtitle: 'Trang nóng ở lại RAM: hit thì miễn phí, miss mới xuống đĩa, chật thì LRU đuổi',
      module: 6, module_title: 'Storage, Indexing & Performance',
      estimated_minutes: 18, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'mcq_code',
      drag_map: {
        table: {
          name: 'buffer_state',
          columns: ['khung', 'trang', 'lần_dùng_cuối'],
          dataRows: [
            ['F1', 'P7 (post 501 viral)', 'vừa xong'],
            ['F2', 'P2 (feed trang đầu)', '5 phút trước'],
            ['F3', 'P9 (hồ sơ cũ)',       '30 phút trước']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #33',
        hook: 'Post "GuildBoard sập" (Ticket #24) lại viral — <strong>10.000 lượt mở mỗi phút</strong>. Không lẽ đĩa bị chạm 10.000 lần cho CÙNG MỘT trang dữ liệu? May là không: Postgres giữ các trang nóng trong <em>buffer</em> trên RAM — lần mở đầu tốn một chuyến đĩa, 9.999 lần sau lấy thẳng từ RAM. Ticket #33: vận hành trí nhớ ngắn hạn ấy — hit, miss, và luật đuổi khách LRU khi buffer chật.'
      },
      step_1: {
        primer: {
          goal: [
            'Buffer = dàn khung (frame) trên RAM giữ bản sao các trang đĩa đang nóng',
            'HIT: trang cần đã ở buffer → miễn phí chuyến đĩa · MISS: phải xuống đĩa khiêng lên',
            'Buffer chật → đuổi trang theo LRU: trang LÂU-KHÔNG-DÙNG-NHẤT ra đi'
          ],
          intro: 'Mọi trang dữ liệu muốn được đọc đều phải qua RAM (Ticket #31) — buffer manager tận dụng luôn: <strong>đã khiêng lên thì giữ lại</strong>. Trang post viral nằm lì trong buffer, 10.000 request chỉ tốn 1 chuyến đĩa. Nghệ thuật nằm ở lúc CHẬT: khung có hạn, nạp trang mới là phải đuổi trang cũ. Đuổi ai? <strong>LRU</strong> — Least Recently Used: kẻ lâu không được hỏi thăm nhất, với niềm tin "quá khứ gần dự báo tương lai gần".',
          example: 'buffer_state bên cạnh: 3 khung F1-F3. Request trang P2 → HIT (đang ở F2). Request P4 → MISS + buffer đầy → đuổi P9 (30 phút không ai đụng).'
        },
        concept_cards: [
          {
            icon: 'fa-memory',
            title: 'Hit ratio — chỉ số ăn tiền nhất',
            body: 'Tỷ lệ request được phục vụ ngay từ buffer gọi là <strong>hit ratio</strong>. 99% hit nghĩa là 100 request chỉ 1 chuyến đĩa. Câu thần chú "thêm RAM cho database" thực chất là: buffer to hơn → giữ được nhiều trang nóng hơn → hit ratio tăng.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 13 — Data Storage Structures / Buffer Manager'
          },
          {
            icon: 'fa-door-open',
            title: 'LRU — luật đuổi khách',
            body: 'Chật chỗ thì đuổi trang <strong>lâu-không-dùng-nhất</strong> — vì trang vừa được đọc nhiều khả năng sắp được đọc lại (locality). Chú ý bẫy ngược: một cú full-scan bảng khổng lồ có thể "xả lũ" đuổi sạch trang nóng — nên Postgres dùng ring buffer riêng cho scan lớn.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Vì sao trang đầu feed lúc nào cũng mở nhanh còn hồ sơ cũ 2 năm thì khựng một nhịp? Trang feed được cả nghìn người giữ NÓNG hộ nhau trong buffer; hồ sơ cũ là MISS gần như chắc chắn — một chuyến đĩa trọn gói seek + rotate + transfer (Ticket #32).'
          }
        ],
        visual: {
          schema: {
            table_name: 'buffer_state',
            columns: [
              { name: 'khung', type: 'TEXT', key: 'frame', icon: '🖼️' },
              { name: 'trang', type: 'TEXT', key: 'page', icon: '📄' },
              { name: 'lần_dùng_cuối', type: 'TEXT', key: 'LRU', icon: '🕐' }
            ]
          },
          data_preview: [
            ['F1', 'P7 (post 501 viral)', 'vừa xong'],
            ['F2', 'P2 (feed trang đầu)', '5 phút trước'],
            ['F3', 'P9 (hồ sơ cũ)',       '30 phút trước']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: '10.000 lượt mở post 501 trong một phút — đĩa bị chạm bao nhiêu lần (buffer đủ chỗ)?',
            options: [
              { id: 'a', text: '~1 lần: chuyến MISS đầu tiên khiêng trang lên; 9.999 lượt sau là HIT ngay trên RAM', correct: true, explanation: 'Đúng — đó là toàn bộ phép màu của buffer: trả tiền đĩa một lần, dùng cả phút.' },
              { id: 'b', text: '10.000 lần — mỗi request một chuyến đĩa', correct: false, explanation: 'Sai — thế thì đĩa cháy thật; buffer tồn tại để chặn đúng thảm họa này.' },
              { id: 'c', text: '0 lần — dữ liệu viral tự động sinh ra trong RAM', correct: false, explanation: 'Sai — bản gốc luôn từ đĩa (Ticket #31); lần đầu bắt buộc là một chuyến MISS.' },
              { id: 'd', text: '5.000 lần — buffer chỉ phục vụ được một nửa', correct: false, explanation: 'Sai — một trang đã ở buffer phục vụ được mọi request tới nó, không chia phần trăm.' }
            ]
          },
          {
            question: 'Buffer đầy, cần nạp trang mới — LRU chọn đuổi trang nào?',
            options: [
              { id: 'a', text: 'Trang có lần-dùng-cuối XA NHẤT — đặt cược rằng ai lâu không được hỏi thăm thì sắp tới cũng không', correct: true, explanation: 'Đúng — Least Recently Used: quá khứ gần dự báo tương lai gần (locality).' },
              { id: 'b', text: 'Trang vừa được dùng xong — vì nhu cầu của nó đã được đáp ứng', correct: false, explanation: 'Sai — đó là MRU, thường tệ: trang vừa dùng rất hay được dùng lại ngay (F5!).' },
              { id: 'c', text: 'Trang có kích thước lớn nhất để lấy nhiều chỗ', correct: false, explanation: 'Sai — các trang cùng cỡ (8KB); không có "trang to trang nhỏ" để chọn.' },
              { id: 'd', text: 'Ngẫu nhiên — cho công bằng', correct: false, explanation: 'Sai — random bỏ phí thông tin truy cập; LRU dùng chính lịch sử để đoán tương lai.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'HIT hay MISS?',
          instruction: 'Với buffer_state ở Step 1 (P7 · P2 · P9 đang trong buffer), mỗi request sau là HIT hay MISS?',
          xp: 20,
          chips: [
            { id: 'k1', label: 'Mở lại post 501 (trang P7) — viral, vừa đọc 1 giây trước' },
            { id: 'k2', label: 'Mở hồ sơ user từ 2 năm trước (trang P44, lần đầu được đụng)' },
            { id: 'k3', label: 'F5 trang feed (trang P2) lần thứ ba liên tiếp' },
            { id: 'k4', label: 'Mở trang P31 — vừa bị LRU đuổi khỏi buffer sáng nay' }
          ],
          bins: [
            { id: 'hit', label: 'HIT — có sẵn trong buffer', correct: 'hit' },
            { id: 'miss', label: 'MISS — phải xuống đĩa', correct: 'miss' }
          ],
          solution: { k1: 'hit', k2: 'miss', k3: 'hit', k4: 'miss' }
        }
      },
      step_3: {
        mission: 'Lắp quy trình buffer xử lý MỘT request trang, đúng thứ tự 4 bước. Trong khay có một luật đuổi khách giả mạo.',
        blocks: [
          { type: 'op', token: 'MISS: xuống đĩa đọc trang — chuyến đi đắt nhất của request', slot: 'buf-2' },
          { type: 'op', token: 'Tra buffer trước: trang đã ở RAM chưa? Có = HIT, trả ngay, miễn phí chuyến đĩa', slot: 'buf-1' },
          { type: 'op', token: 'Nạp trang mới vào khung trống — request sau tới trang này sẽ là HIT', slot: 'buf-4' },
          { type: 'op', token: 'Buffer đầy: đuổi trang LÂU-KHÔNG-DÙNG-NHẤT (LRU) để lấy chỗ', slot: 'buf-3' },
          { type: 'op', token: 'Buffer đầy: đuổi trang VỪA-MỚI-DÙNG-XONG — nó được đọc rồi còn gì', slot: 'buf-x' }
        ],
        drop_zones: [
          { id: 'buf-1', placeholder: 'Bước 1 — hỏi ai trước?', accepts: ['op'], multi: false,
            station: { icon: '🔍', label: 'CHECK', sub: 'Tra buffer', hint: 'Luôn hỏi RAM trước khi làm phiền đĩa.' } },
          { id: 'buf-2', placeholder: 'Bước 2 — khi câu trả lời là "chưa có"', accepts: ['op'], multi: false,
            station: { icon: '💸', label: 'MISS', sub: 'Xuống đĩa', hint: 'Không có trong buffer thì đành trả tiền vé seek + rotate + transfer.' } },
          { id: 'buf-3', placeholder: 'Bước 3 — hết chỗ thì sao?', accepts: ['op'], multi: false,
            station: { icon: '🚪', label: 'EVICT', sub: 'Đuổi khách', hint: 'Chọn nạn nhân theo LỊCH SỬ truy cập — không phải theo cảm tính.' } },
          { id: 'buf-4', placeholder: 'Bước 4 — chốt hạ', accepts: ['op'], multi: false,
            station: { icon: '📥', label: 'LOAD', sub: 'Nạp & nhớ', hint: 'Trang mới vào khung — và từ giờ nó phục vụ mọi request miễn phí.' } }
        ],
        expected_sql: 'Tra buffer trước: trang đã ở RAM chưa? Có = HIT, trả ngay, miễn phí chuyến đĩa MISS: xuống đĩa đọc trang — chuyến đi đắt nhất của request Buffer đầy: đuổi trang LÂU-KHÔNG-DÙNG-NHẤT (LRU) để lấy chỗ Nạp trang mới vào khung trống — request sau tới trang này sẽ là HIT',
        expected_zones: {
          'buf-1': 'Tra buffer trước: trang đã ở RAM chưa? Có = HIT, trả ngay, miễn phí chuyến đĩa',
          'buf-2': 'MISS: xuống đĩa đọc trang — chuyến đi đắt nhất của request',
          'buf-3': 'Buffer đầy: đuổi trang LÂU-KHÔNG-DÙNG-NHẤT (LRU) để lấy chỗ',
          'buf-4': 'Nạp trang mới vào khung trống — request sau tới trang này sẽ là HIT'
        },
        reveal_hints: {
          'buf-1': 'Bước rẻ nhất đi trước: <strong>tra buffer</strong> — HIT là xong việc.',
          'buf-2': 'Chưa có mới phải <strong>xuống đĩa</strong> (MISS).',
          'buf-3': 'Đuổi theo LỊCH SỬ: <strong>LRU — lâu không dùng nhất</strong>. Khối "đuổi trang vừa dùng xong" là MRU giả mạo — trang vừa đọc rất hay bị đọc lại (F5!).',
          'buf-4': 'Khép vòng: <strong>nạp trang mới</strong> — lần sau nó là HIT.'
        }
      },
      step_4: {
        prompt: 'Buffer 3 khung đang giữ: P7 (vừa dùng xong) · P2 (dùng 5 phút trước) · P9 (dùng 30 phút trước). Request mới cần trang P4. Theo LRU, chuyện gì xảy ra?',
        challenge_type: 'mcq_code',
        options: [
          { text: 'MISS → buffer đầy → đuổi P9 (lâu-không-dùng-nhất, 30 phút) → nạp P4 vào khung vừa trống.', correct: true },
          { text: 'MISS → đuổi P7 — nó vừa được dùng xong nên nhu cầu đã hết.', correct: false },
          { text: 'HIT — P4 chắc chắn có sẵn trong buffer vì buffer chứa mọi trang.', correct: false },
          { text: 'MISS → từ chối request P4 vì buffer đã đầy — người dùng thử lại sau.', correct: false }
        ],
        context: {
          scenario: 'Đây chính là quyết định buffer manager đưa ra hàng triệu lần mỗi giây trên server Community — và bạn vừa lắp đủ 4 bước của nó ở Step 3.',
          real_world: 'shared_buffers của Postgres, buffer pool của MySQL/InnoDB, page cache của hệ điều hành — tất cả chạy vòng CHECK → MISS → EVICT(LRU-ish) → LOAD y như bạn vừa học.',
          steps: [
            'P4 không có trong {P7, P2, P9} → MISS.',
            '3 khung đều bận → phải đuổi trước khi nạp.',
            'So lần-dùng-cuối: P7 vừa xong · P2 5 phút · P9 30 phút → P9 là LRU.',
            'Đuổi P9, nạp P4 — và ghi lại thời điểm dùng cho vòng sau.'
          ],
          hint_explore: 'Xem lại bảng buffer_state ở Step 1 — cột lần_dùng_cuối là toàn bộ dữ liệu LRU cần.',
          expected: 'Chọn phương án MISS → đuổi P9 → nạp P4.'
        },
        hints: [
          { level: 1, text: 'Ba câu hỏi theo thứ tự Step 3: có trong buffer không? còn khung trống không? đuổi ai?' },
          { level: 2, text: 'P4 không nằm trong 3 khung → MISS chắc chắn. Loại ngay phương án HIT và phương án "từ chối request".' },
          { level: 3, text: 'LRU nhìn lần-dùng-cuối XA NHẤT: 30 phút > 5 phút > vừa xong.' },
          { level: 4, text: 'Đáp án: MISS → đuổi P9 → nạp P4.' }
        ],
        success_message: 'Ticket #33 đóng! Giờ bạn hiểu vì sao "thêm RAM" là câu thần chú — và vì sao nó không cứu được MISS đầu tiên. Ticket #34: một user sửa bio dài gấp ba, và dòng dữ liệu… không còn vừa chỗ cũ trên trang.',
        xp_reward: 120
      }
    },

    /* ── tc_14 — Ticket #34 · Record Layout & Heap File ── */
    {
      id: 'tc_14', index: 14,
      title: 'Record Layout & Heap File — dòng nằm trên trang thế nào',
      subtitle: 'Slotted page: con trỏ mọc xuôi, dữ liệu mọc ngược — và chuyện dòng phình không vừa chỗ cũ',
      module: 6, module_title: 'Storage, Indexing & Performance',
      estimated_minutes: 18, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'fill_blank',
      drag_map: {
        table: {
          name: 'page_042 (một trang 8KB của bảng profiles)',
          columns: ['slot', 'trỏ_tới', 'record'],
          dataRows: [
            ['#1', 'offset 8000', 'minhkiller · bio 40B'],
            ['#2', 'offset 7710', 'yuki_sama · bio 250B'],
            ['#3', 'offset 7680', 'toxic_lord · bio 28B'],
            ['#4', '(trống)',     '— free space —']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #34',
        hook: 'yuki_sama trổ tài viết lại bio dài gấp ba — <code>UPDATE profiles SET bio = …</code> chạy ngon, nhưng bên dưới là một vụ dọn nhà: <strong>dòng mới không còn vừa chỗ cũ</strong> trên trang 8KB. Ticket #34: mở một trang ra xem — dòng nằm thế nào, <em>slotted page</em> xoay xở ra sao khi dòng phình, và vì sao bảng kiểu "túi trang" (heap file) tìm gì cũng phải quét.'
      },
      step_1: {
        primer: {
          goal: [
            'Trang 8KB có sơ đồ: header → slot directory (con trỏ, mọc XUÔI) → free space giữa → records (mọc NGƯỢC từ đáy)',
            'Slot directory = lớp gián tiếp: dòng dời chỗ TRONG trang thì chỉ sửa con trỏ, địa chỉ dòng (RID) không đổi',
            'Heap file = túi các trang, chèn đâu trống đó — ghi nhanh, nhưng TÌM thì phải quét (động lực cho index)'
          ],
          intro: 'Phóng to một trang 8KB của bảng profiles: đầu trang là <strong>header</strong>, kế đó là <strong>slot directory</strong> — mảng con trỏ đánh số, mọc xuôi; dữ liệu thật (records) mọc NGƯỢC từ đáy trang lên; khoảng giữa là <strong>free space</strong>. Hai đầu ăn dần vào giữa — gặp nhau là trang đầy. Kiến trúc "con trỏ một đằng, dữ liệu một nẻo" nghe vòng vèo nhưng chính nó cho phép dòng co giãn, dời chỗ trong trang mà cả thế giới bên ngoài vẫn gọi đúng địa chỉ cũ.',
          example: 'RID của một dòng = (số trang, số slot) — ví dụ (page_042, #2). Dòng #2 dời offset trong trang? Chỉ con trỏ ở slot #2 đổi, RID giữ nguyên.'
        },
        concept_cards: [
          {
            icon: 'fa-table-cells-large',
            title: 'Slotted page — căn hộ có sổ địa chỉ',
            body: 'Records dài ngắn khác nhau (bio 28B vs 250B) nên không chia ô cứng được. <strong>Slot directory</strong> giải quyết: mỗi dòng một con trỏ (offset + độ dài). Xóa dòng? Dồn dữ liệu cho liền, sửa con trỏ — slot khác không suy suyển.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 13 — Data Storage Structures / Slotted-Page Structure'
          },
          {
            icon: 'fa-person-walking-luggage',
            title: 'Dòng phình — vụ dọn nhà có báo trước',
            body: 'Bio 40B thành 500B, chỗ cũ không đủ: dòng CHUYỂN sang trang khác còn chỗ, chỗ cũ để lại <strong>forwarding pointer</strong> trỏ tới nhà mới. Ai cầm RID cũ vẫn tìm được — chỉ tốn thêm một bước nhảy. Nhiều forwarding = đọc chậm dần → đó là việc VACUUM của Postgres dọn dẹp.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Heap file chèn dòng mới vào TRANG NÀO CÒN CHỖ — ghi cực nhanh, nhưng "tìm profile của yuki_sama" nghĩa là mở TỪNG trang ra soi (full scan — vé sequential của #32, nhưng phải đọc hết). Muốn nhảy thẳng tới đúng trang? Đó là INDEX — Ticket #36 mở màn đợt sau.'
          }
        ],
        visual: {
          schema: {
            table_name: 'page_042 (slotted page)',
            columns: [
              { name: 'slot', type: 'PTR', key: 'mọc xuôi ⤵', icon: '📌' },
              { name: 'trỏ_tới', type: 'OFFSET', key: '', icon: '🎯' },
              { name: 'record', type: 'BYTES', key: 'mọc ngược ⤴', icon: '📦' }
            ]
          },
          data_preview: [
            ['#1', 'offset 8000', 'minhkiller · bio 40B'],
            ['#2', 'offset 7710', 'yuki_sama · bio 250B'],
            ['#3', 'offset 7680', 'toxic_lord · bio 28B'],
            ['#4', '(trống)',     '— free space —']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Vì sao trang không chia ô CỨNG bằng nhau cho các dòng, mà phải bày ra slot directory?',
            options: [
              { id: 'a', text: 'Vì record dài ngắn khác nhau (bio 28B vs 250B) — ô cứng sẽ lãng phí hoặc không vừa; con trỏ cho phép xếp sát nhau và co giãn', correct: true, explanation: 'Đúng — variable-length record là lý do tồn tại của slotted page: dữ liệu nằm sát, con trỏ lo địa chỉ.' },
              { id: 'b', text: 'Vì chia ô cứng là bất hợp pháp trong chuẩn SQL', correct: false, explanation: 'Sai — SQL không quy định tầng vật lý; đây là bài toán kỹ thuật thuần túy.' },
              { id: 'c', text: 'Vì con trỏ đọc nhanh hơn dữ liệu', correct: false, explanation: 'Sai — con trỏ không "nhanh hơn"; nó thêm MỘT bước gián tiếp, đổi lấy sự linh hoạt.' },
              { id: 'd', text: 'Để mã hóa dữ liệu người dùng', correct: false, explanation: 'Sai — slot directory là sơ đồ địa chỉ, không liên quan mã hóa.' }
            ]
          },
          {
            question: 'Dòng bio của yuki_sama phình từ 250B lên 900B, trang hết chỗ. Chuyện gì xảy ra với RID cũ (page_042, #2)?',
            options: [
              { id: 'a', text: 'Vẫn dùng được — chỗ cũ để lại forwarding pointer trỏ sang nhà mới; ai giữ RID cũ đi thêm đúng một bước nhảy', correct: true, explanation: 'Đúng — hợp đồng "RID không đổi" được giữ bằng con trỏ chuyển tiếp; giá phải trả là +1 lần đọc.' },
              { id: 'b', text: 'RID cũ bị hủy, mọi nơi tham chiếu phải cập nhật ngay lập tức', correct: false, explanation: 'Sai — cập-nhật-mọi-nơi là thảm họa (index, transaction đang chạy…); forwarding tồn tại để né đúng việc này.' },
              { id: 'c', text: 'UPDATE bị từ chối vì trang đầy', correct: false, explanation: 'Sai — database không từ chối vì một trang đầy; nó dọn nhà cho dòng.' },
              { id: 'd', text: 'Trang tự nở từ 8KB lên 16KB', correct: false, explanation: 'Sai — kích thước trang là hằng số của hệ thống (đơn vị vận chuyển đĩa↔RAM, Ticket #31).' }
            ]
          }
        ],
        mini_game: {
          type: 'order',
          title: 'Vụ dọn nhà của một dòng phình',
          instruction: 'Xếp đúng trình tự những gì xảy ra khi UPDATE làm dòng dài hơn chỗ cũ.',
          xp: 20,
          items: [
            { id: 'u1', label: 'UPDATE bio — bản mới dài hơn bản cũ' },
            { id: 'u2', label: 'Thử ghi lại chỗ cũ trong trang → không vừa, free space không cứu nổi' },
            { id: 'u3', label: 'Chuyển record sang trang khác còn chỗ' },
            { id: 'u4', label: 'Chỗ cũ để lại forwarding pointer trỏ tới nhà mới' },
            { id: 'u5', label: 'RID cũ vẫn hoạt động — người giữ địa chỉ cũ đi thêm 1 bước nhảy' }
          ],
          solution: { u1: 1, u2: 2, u3: 3, u4: 4, u5: 5 }
        }
      },
      step_3: {
        mission: 'Lắp SƠ ĐỒ một trang 8KB theo đúng vị trí từ ĐẦU trang xuống ĐÁY trang. Có một khối mô tả sai kiến trúc.',
        blocks: [
          { type: 'op', token: 'Records: dữ liệu thật, mọc NGƯỢC từ đáy trang lên', slot: 'pg-recs' },
          { type: 'op', token: 'Header: metadata của trang (số slot, con trỏ free space…)', slot: 'pg-header' },
          { type: 'op', token: 'Records xếp xuôi ngay sau header, không cần con trỏ gì cả', slot: 'pg-x' },
          { type: 'op', token: 'Slot directory: mảng con trỏ đánh số, mọc XUÔI ngay sau header', slot: 'pg-slots' },
          { type: 'op', token: 'Free space: khoảng trống ở GIỮA — hai đầu ăn dần vào đây', slot: 'pg-free' }
        ],
        drop_zones: [
          { id: 'pg-header', placeholder: 'Đầu trang — ai đứng đây?', accepts: ['op'], multi: false,
            station: { icon: '🏷️', label: 'Header', sub: 'Đầu trang', hint: 'Metadata đi trước: trang này có mấy slot, free space bắt đầu từ đâu.' } },
          { id: 'pg-slots', placeholder: 'Ngay sau header — sổ địa chỉ', accepts: ['op'], multi: false,
            station: { icon: '📌', label: 'Slots', sub: 'Sổ địa chỉ', hint: 'Mảng con trỏ đánh số — lớp gián tiếp cho phép dòng dời chỗ mà RID không đổi.' } },
          { id: 'pg-free', placeholder: 'Khoảng giữa trang', accepts: ['op'], multi: false,
            station: { icon: '⬜', label: 'Free', sub: 'Đất dự trữ', hint: 'Nằm giữa để CẢ HAI phía cùng mọc vào — slot thêm từ trên, record thêm từ dưới.' } },
          { id: 'pg-recs', placeholder: 'Đáy trang — dữ liệu thật', accepts: ['op'], multi: false,
            station: { icon: '📦', label: 'Records', sub: 'Đáy trang', hint: 'Dữ liệu thật xếp sát nhau, mọc ngược lên — dài ngắn tùy dòng.' } }
        ],
        expected_sql: 'Header: metadata của trang (số slot, con trỏ free space…) Slot directory: mảng con trỏ đánh số, mọc XUÔI ngay sau header Free space: khoảng trống ở GIỮA — hai đầu ăn dần vào đây Records: dữ liệu thật, mọc NGƯỢC từ đáy trang lên',
        expected_zones: {
          'pg-header': 'Header: metadata của trang (số slot, con trỏ free space…)',
          'pg-slots': 'Slot directory: mảng con trỏ đánh số, mọc XUÔI ngay sau header',
          'pg-free': 'Free space: khoảng trống ở GIỮA — hai đầu ăn dần vào đây',
          'pg-recs': 'Records: dữ liệu thật, mọc NGƯỢC từ đáy trang lên'
        },
        reveal_hints: {
          'pg-header': 'Metadata luôn mở màn: <strong>Header</strong>.',
          'pg-slots': 'Sổ địa chỉ kế ngay sau: <strong>slot directory mọc xuôi</strong>. Khối "records xếp xuôi không cần con trỏ" là sai kiến trúc — dòng co giãn thì ai giữ địa chỉ?',
          'pg-free': 'Ở giữa là <strong>free space</strong> — vùng đệm cho cả hai phía cùng mọc.',
          'pg-recs': 'Đáy trang: <strong>records mọc ngược lên</strong>.'
        }
      },
      step_4: {
        prompt: 'Điền 3 từ khóa chốt hạ tầng vật lý của một bảng — nghĩ về sổ địa chỉ, vụ dọn nhà, và cái giá của heap file.',
        challenge_type: 'fill_blank',
        template: '# Dòng dời chỗ TRONG trang: chỉ sửa con trỏ trong slot ____\n#   → RID (trang, slot) giữ nguyên với cả thế giới bên ngoài\n\n# Dòng phình KHÔNG vừa trang: chuyển trang khác,\n#   chỗ cũ để lại ____ pointer trỏ tới nhà mới\n\n# Heap file không có trật tự: tìm 1 dòng khi chưa có index\n#   → đành full-____ mọi trang của bảng',
        blanks: [
          { id: 'p1', hint: 'sổ địa chỉ của trang', expected: 'directory' },
          { id: 'p2', hint: 'con trỏ chuyển tiếp', expected: 'forwarding' },
          { id: 'p3', hint: 'quét (tiếng Anh)', expected: 'scan' }
        ],
        context: {
          scenario: 'Ba từ này là ba mảnh ghép của tầng vật lý: gián tiếp trong trang (directory), gián tiếp giữa các trang (forwarding), và cái giá khi không có lối tắt (scan).',
          real_world: 'Postgres gọi record là tuple, forwarding chồng chất là lý do bảng "phình" (bloat) và VACUUM tồn tại; "Seq Scan" bạn sẽ gặp trong EXPLAIN ở Capstone chính là full-scan này.',
          steps: [
            'Trong trang: slot ____ đổi con trỏ, RID bất biến.',
            'Giữa các trang: ____ pointer giữ lời hứa RID.',
            'Chưa có index: full-____ là lựa chọn duy nhất của heap file.',
            'Ticket #36 (đợt sau) sẽ xây LỐI TẮT để khỏi scan — index.'
          ],
          hint_explore: 'Nhìn lại bảng page_042 ở Step 1: cột slot chính là "sổ địa chỉ" đang nói tới.',
          expected: 'Điền đúng 3/3: directory · forwarding · scan. Bài pseudo-code — chấm theo ô điền.'
        },
        hints: [
          { level: 1, text: 'Ba khái niệm đến từ 3 concept card của Step 1 — mỗi card một từ.' },
          { level: 2, text: 'Ô 1: mảng con trỏ trong trang tên đầy đủ là slot <code>directory</code>.' },
          { level: 3, text: 'Ô 2: con trỏ CHUYỂN TIẾP = <code>forwarding</code>. Ô 3: quét toàn bộ = <code>scan</code>.' },
          { level: 4, text: 'Đáp án: <code>directory</code> · <code>forwarding</code> · <code>scan</code>.' }
        ],
        success_message: 'Ticket #34 đóng! Bạn vừa đọc được sơ đồ căn hộ của dữ liệu. Ticket #35 (chốt đợt này): dashboard kho chỉ cần 2 cột trong 12 — mà row-store bắt khiêng cả dòng. Đến lúc xoay dọc kho dữ liệu.',
        xp_reward: 120
      }
    },

    /* ── tc_15 — Ticket #35 · Row-Store vs Column-Store ── */
    {
      id: 'tc_15', index: 15,
      title: 'Row-Store vs Column-Store — xếp ngang hay xếp dọc',
      subtitle: 'Feed đọc nguyên dòng thì xếp ngang; kho chỉ cộng 2 cột thì xếp dọc',
      module: 6, module_title: 'Storage, Indexing & Performance',
      estimated_minutes: 15, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'mcq_code',
      drag_map: {
        table: {
          name: 'fact_post_action (12 cột, dashboard chỉ cần 2)',
          columns: ['action_id', 'user_id', 'date_id', 'action_type', 'act_count', '…7 cột nữa'],
          dataRows: [
            ['1',  '7',  'D1', 'like',    '3', '…'],
            ['4',  '7',  'D2', 'like',    '5', '…'],
            ['5',  '9',  'D2', 'like',    '4', '…'],
            ['10', '12', 'D3', 'like',    '6', '…']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #35',
        hook: 'Dashboard kho (Ticket #25) chạy <code>SUM(act_count)</code> — chỉ đụng <strong>2 cột trong 12</strong>, vậy mà row-store vẫn khiêng NGUYÊN TỪNG DÒNG qua RAM: trả tiền vận chuyển cho 10 cột vứt đi. Ticket #35: <em>column-store</em> — xoay kho 90 độ, mỗi CỘT nằm liền một dải; đọc đúng cột cần, nén sướng tay. Nhưng khoan bê cả Community sang: feed đọc nguyên post thì xếp ngang vẫn vô địch. Chốt đợt này: chọn đúng trận địa cho từng kho.'
      },
      step_1: {
        primer: {
          goal: [
            'Row-store: các giá trị CÙNG DÒNG nằm cạnh nhau — đọc/ghi nguyên bản ghi cực nhanh (OLTP)',
            'Column-store: các giá trị CÙNG CỘT nằm liền dải — analytics chỉ chạm đúng cột cần (OLAP)',
            'Cột đồng kiểu nén cực tốt (act_count toàn số nhỏ) → ít trang hơn = ít I/O hơn'
          ],
          intro: 'Cùng một bảng, hai cách trải xuống đĩa. <strong>Xếp ngang</strong> (row): dòng 1 trọn vẹn, rồi dòng 2… — mở 1 post lấy đủ 12 cột trong MỘT trang, feed mê. <strong>Xếp dọc</strong> (column): cột act_count của MỌI dòng nằm liền nhau thành dải — <code>SUM(act_count)</code> đọc đúng dải đó, 10 cột kia không tốn một byte vận chuyển. Thêm quà: cột đồng kiểu nén được gấp nhiều lần (toàn số nhỏ, giá trị lặp) — dải đã ngắn còn ngắn nữa. Giá phải trả: ghi 1 dòng mới phải chạm 12 dải — OLTP khóc.',
          example: 'SUM(act_count) trên 38M dòng × 12 cột: row-store đọc ~4GB (cả bảng) · column-store đọc ~30MB (một cột đã nén) — chênh trăm lần, đúng bằng số cột bỏ qua × tỷ lệ nén.'
        },
        concept_cards: [
          {
            icon: 'fa-table-columns',
            title: 'Xoay 90 độ — cùng dữ liệu, khác hàng xóm',
            body: 'Row-store: hàng xóm của <code>act_count</code> dòng 1 là <code>action_type</code> dòng 1. Column-store: hàng xóm của nó là <code>act_count</code> dòng 2. "Ai nằm cạnh ai" quyết định query nào được đọc LIỀN DẢI (bài học Ticket #32) — chọn layout là chọn query mình cưng.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 13 — Data Storage Structures / Column-Oriented Storage'
          },
          {
            icon: 'fa-file-zipper',
            title: 'Nén — vũ khí bí mật của cột',
            body: 'Một dải toàn <code>like, like, like, comment, like…</code> nén kiểu run-length còn vài phần trăm. Nén tốt = ít trang = ít chuyến đĩa = ít RAM buffer. Row-store nén kém hơn hẳn vì mỗi dòng trộn đủ kiểu dữ liệu.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'GameHub cần CẢ HAI: feed/likes ghi-đọc từng dòng → Postgres row-store ở lại. Kho fact_post_action chỉ để SUM/GROUP BY → bản sao column-store (kiểu Redshift/BigQuery/Parquet). ETL đêm (Ticket #25) chính là cây cầu chở dữ liệu giữa hai thế giới.'
          }
        ],
        visual: {
          schema: {
            table_name: 'fact_post_action — 2 cách trải xuống đĩa',
            columns: [
              { name: 'row-store', type: 'dòng liền dòng', key: 'feed ❤', icon: '↔️' },
              { name: 'column-store', type: 'cột liền dải', key: 'kho 📊', icon: '↕️' }
            ]
          },
          data_preview: [
            ['[1,7,D1,like,3,…] [4,7,D2,like,5,…]', 'action_id: [1,4,5,10…]'],
            ['[5,9,D2,like,4,…] [10,12,D3,like,6,…]', 'act_count: [3,5,4,6…] ← SUM chỉ đọc dải này'],
            ['mở 1 post = 1 trang có đủ 12 cột', 'action_type: [like,like,like,like…] ← nén cực gọn'],
            ['ghi 1 dòng = chạm 1 trang', 'ghi 1 dòng = chạm 12 dải 😱']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: '<code>SUM(act_count)</code> trên 38M dòng × 12 cột — vì sao column-store đọc ít hơn cả TRĂM lần?',
            options: [
              { id: 'a', text: 'Nó chỉ vận chuyển DẢI CỘT act_count (bỏ qua 11 cột kia) — và dải đồng kiểu đó còn được nén thêm nhiều lần', correct: true, explanation: 'Đúng — hai tầng tiết kiệm nhân nhau: bỏ cột thừa × tỷ lệ nén. Row-store buộc khiêng cả dòng dù chỉ cần 1 cột.' },
              { id: 'b', text: 'Vì column-store dùng RAM nhanh hơn', correct: false, explanation: 'Sai — cùng RAM, cùng đĩa; khác nhau ở SỐ BYTE phải khiêng.' },
              { id: 'c', text: 'Vì column-store bỏ bớt dòng, chỉ tính mẫu đại diện', correct: false, explanation: 'Sai — kết quả chính xác tuyệt đối, đủ 38M giá trị; chỉ là chúng nằm gọn trong ít trang hơn.' },
              { id: 'd', text: 'Vì SUM là phép tính riêng của column-store', correct: false, explanation: 'Sai — SUM chạy ở đâu cũng được; layout quyết định CHI PHÍ ĐỌC, không phải khả năng tính.' }
            ]
          },
          {
            question: 'Vì sao KHÔNG bê luôn bảng posts của feed sang column-store cho "nhanh"?',
            options: [
              { id: 'a', text: 'Feed đọc/ghi NGUYÊN DÒNG: mở 1 post cần đủ mọi cột (row = 1 trang), ghi 1 post mới vào column-store phải chạm đủ 12 dải', correct: true, explanation: 'Đúng — workload OLTP ngược hẳn sở trường của cột. Chọn layout là chọn theo QUERY, không theo mốt.' },
              { id: 'b', text: 'Vì column-store không lưu được chữ, chỉ lưu được số', correct: false, explanation: 'Sai — lưu được mọi kiểu; chữ lặp nhiều còn nén tốt là đằng khác.' },
              { id: 'c', text: 'Vì Postgres cấm column-store', correct: false, explanation: 'Sai — không ai cấm (có cả extension); vấn đề là workload không hợp.' },
              { id: 'd', text: 'Vì column-store bắt buộc phải trả phí bản quyền', correct: false, explanation: 'Sai — Parquet/ClickHouse miễn phí đầy; đây là bài toán kỹ thuật, không phải giấy phép.' }
            ]
          }
        ],
        mini_game: {
          type: 'match',
          title: 'Hệ nào xếp kiểu nào?',
          instruction: 'Nối mỗi hệ thống với layout nó chọn — và lý do.',
          xp: 20,
          pairs: [
            { left: 'Feed Community — mở/ghi nguyên post', leftId: 'y1', rightId: 'z1', right: { id: 'z1', label: 'Row-store — 1 dòng gọn trong 1 trang' } },
            { left: 'Kho fact 38M dòng — toàn SUM/GROUP BY', leftId: 'y2', rightId: 'z2', right: { id: 'z2', label: 'Column-store — đọc đúng dải cột cần' } },
            { left: 'File Parquet đội data đưa cho ML', leftId: 'y3', rightId: 'z3', right: { id: 'z3', label: 'Column-store — nén sâu, quét cột nhanh' } },
            { left: 'Bảng likes — INSERT dồn dập từng dòng', leftId: 'y4', rightId: 'z4', right: { id: 'z4', label: 'Row-store — mỗi lần ghi chạm 1 chỗ' } }
          ],
          solution: { y1: 'z1', y2: 'z2', y3: 'z3', y4: 'z4' }
        }
      },
      step_3: {
        mission: 'Lắp bức tranh "xoay 90 độ": row-store trải thế nào, column-store trải thế nào, và dashboard đọc kiểu gì trên bản xếp dọc. Có một khối bịa.',
        blocks: [
          { type: 'op', token: 'Column-store: act_count của MỌI dòng nằm liền một dải — [3,5,4,6,…] nén cực gọn', slot: 'lay-col' },
          { type: 'op', token: 'Row-store: mỗi dòng trọn vẹn 12 cột nằm cạnh nhau — [1,7,D1,like,3,…] rồi tới dòng kế', slot: 'lay-row' },
          { type: 'op', token: 'Column-store: mỗi cột được in ra giấy và cất vào két riêng ở chi nhánh khác thành phố', slot: 'lay-x' },
          { type: 'op', token: 'Dashboard SUM(act_count): chỉ kéo dải act_count qua RAM — 11 cột kia không tốn một byte', slot: 'lay-read' }
        ],
        drop_zones: [
          { id: 'lay-row', placeholder: 'Xếp NGANG — cách của feed', accepts: ['op'], multi: false,
            station: { icon: '↔️', label: 'Xếp ngang', sub: 'Row-store', hint: 'Hàng xóm của một giá trị là các cột CÙNG DÒNG — mở 1 post lấy đủ bộ.' } },
          { id: 'lay-col', placeholder: 'Xếp DỌC — cách của kho', accepts: ['op'], multi: false,
            station: { icon: '↕️', label: 'Xếp dọc', sub: 'Column-store', hint: 'Hàng xóm là giá trị CÙNG CỘT của dòng kế — dải đồng kiểu, nén sướng.' } },
          { id: 'lay-read', placeholder: 'Và dashboard đọc thế nào?', accepts: ['op'], multi: false,
            station: { icon: '📊', label: 'Đọc kho', sub: 'Đúng cột cần', hint: 'SUM một cột = kéo đúng MỘT dải liền mạch — bài học Ticket #32 hiện nguyên hình.' } }
        ],
        expected_sql: 'Row-store: mỗi dòng trọn vẹn 12 cột nằm cạnh nhau — [1,7,D1,like,3,…] rồi tới dòng kế Column-store: act_count của MỌI dòng nằm liền một dải — [3,5,4,6,…] nén cực gọn Dashboard SUM(act_count): chỉ kéo dải act_count qua RAM — 11 cột kia không tốn một byte',
        expected_zones: {
          'lay-row': 'Row-store: mỗi dòng trọn vẹn 12 cột nằm cạnh nhau — [1,7,D1,like,3,…] rồi tới dòng kế',
          'lay-col': 'Column-store: act_count của MỌI dòng nằm liền một dải — [3,5,4,6,…] nén cực gọn',
          'lay-read': 'Dashboard SUM(act_count): chỉ kéo dải act_count qua RAM — 11 cột kia không tốn một byte'
        },
        reveal_hints: {
          'lay-row': 'Xếp ngang = <strong>dòng trọn vẹn nằm cạnh nhau</strong> — trận địa của feed.',
          'lay-col': 'Xếp dọc = <strong>cột liền dải</strong>. Khối "in ra giấy cất két chi nhánh" là bịa cho vui — column-store vẫn là file trên đĩa.',
          'lay-read': 'Đọc kho = <strong>kéo đúng dải cột cần</strong>, phần còn lại miễn vận chuyển.'
        }
      },
      step_4: {
        prompt: 'CTO hỏi câu chốt đợt: "Community nên lưu thế nào?" — chọn phương án ĐÚNG TRẬN ĐỊA cho cả hai hệ:',
        challenge_type: 'mcq_code',
        options: [
          { text: 'Feed/likes/comments ở lại Postgres row-store (đọc-ghi nguyên dòng); kho fact_post_action sang column-store cho SUM/GROUP BY — ETL đêm làm cầu nối như Ticket #25.', correct: true },
          { text: 'Bê toàn bộ sang column-store — công nghệ mới hơn thì nhanh hơn ở mọi việc.', correct: false },
          { text: 'Bê toàn bộ sang row-store kể cả kho — đồng bộ một kiểu cho dễ quản.', correct: false },
          { text: 'Lưu mỗi bảng HAI bản row + column và ghi thẳng vào cả hai trong mọi INSERT của feed.', correct: false }
        ],
        context: {
          scenario: 'Đây là quyết định kiến trúc thật sự của mọi công ty có cả app lẫn dashboard — và là câu chốt của cả đợt storage: KHÔNG có layout vô địch, chỉ có layout ĐÚNG TRẬN ĐỊA.',
          real_world: 'Đúng mô hình công nghiệp: Postgres/MySQL phục vụ app + Redshift/BigQuery/ClickHouse phục vụ phân tích, nối bằng ETL/CDC. Phương án "ghi thẳng 2 bản trong mọi INSERT" chết ở độ trễ ghi — nên người ta mới cần ETL đêm.',
          steps: [
            'Workload feed: đọc/ghi nguyên dòng, độ trễ thấp → row.',
            'Workload kho: quét ít cột trên núi dòng → column.',
            'Cầu nối: ETL đêm (đã dựng ở Ticket #25) — không bắt INSERT của feed gánh 2 lần ghi.',
            'Loại 2 phương án "một kiểu cho tất cả": mỗi kiểu thua đau ở trận địa còn lại.'
          ],
          hint_explore: 'Xem lại 2 dòng cuối bảng minh họa Step 1: chi phí GHI của mỗi layout — chính nó loại phương án cuối.',
          expected: 'Chọn phương án hai-thế-giới: feed row + kho column, ETL làm cầu.'
        },
        hints: [
          { level: 1, text: 'Nhớ MCQ 2: vì sao KHÔNG bê feed sang column? Rồi nghĩ ngược cho kho.' },
          { level: 2, text: 'Loại 2 phương án "tất cả một kiểu" — mỗi layout đều có trận địa thua đau.' },
          { level: 3, text: 'Phương án ghi 2 bản trong MỌI INSERT bắt feed trả giá ghi ×12 dải — ETL đêm tồn tại để né đúng việc này.' },
          { level: 4, text: 'Đáp án: feed row-store + kho column-store, ETL đêm làm cầu.' }
        ],
        success_message: 'Ticket #35 đóng — nửa đầu Module 6 hoàn tất! Bạn đã thuộc lòng tầng hầm: tháp lưu trữ, giá vé seek, buffer, trang, và hai kiểu xếp kho. Đợt sau: xây LỐI TẮT xuyên qua tất cả — INDEX, B+-Tree, và vụ án tốt nghiệp "Social Graph Detective".',
        xp_reward: 120
      }
    }
  ]
};
