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
          'cte-union': 'Cần giữ ĐỦ mọi dòng qua các vòng: <strong>UNION ALL</strong> — đúng dạng chuẩn của <code>WITH RECURSIVE</code> (Ch 5.4). UNION thường phải KHỬ TRÙNG LẶP nên tốn công so sánh; nó chỉ đáng giá khi đồ thị CÓ CHU TRÌNH (khử trùng chính là phao chống lặp vô hạn) — cây bình luận thì không có chu trình.',
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
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 11 — Data Analytics / §11.2 Data Warehousing'
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
            "SLICE cố định MỘT chiều (WHERE month=6) · DICE cố định NHIỀU chiều cùng lúc (WHERE month=6 AND type='like')",
            'DRILL-DOWN đi xuống chi tiết (tháng → ngày) · ROLL-UP gộp lên (chính là #26)'
          ],
          intro: 'Đừng nghĩ kho là bảng — hãy nghĩ nó là <strong>khối rubik dữ liệu</strong>: trục ngày, trục nước, trục loại hành động; mỗi ô = tổng act_count của tổ hợp đó. Câu hỏi của PM chỉ là các cách CẮT khối: cố định tháng 6 = <em>slice</em>; ghim thêm chiều thứ hai (chỉ like) = <em>dice</em> — khối con nhỏ hơn; từ tháng khoan xuống từng ngày = <em>drill-down</em>; gộp ngược lên = <em>roll-up</em>; còn đổi chiều HIỂN THỊ của bảng kết quả là <em>pivot</em>. SQL bên dưới vẫn là fact JOIN dim — chỉ đổi WHERE và GROUP BY.',
          example: "Dice: <code>… WHERE d.month = 6 AND f.action_type = 'like'</code> — ghim đồng thời chiều thời gian VÀ chiều loại; <code>GROUP BY u.country</code> chỉ là chọn chiều hiển thị."
        },
        concept_cards: [
          {
            icon: 'fa-cube',
            title: 'Slice & Dice — cắt lát, cắt khối',
            body: "<strong>Slice</strong>: cố định MỘT chiều — <code>WHERE d.month = 6</code> lấy đúng lát tháng 6. <strong>Dice</strong>: cố định GIÁ TRỊ trên NHIỀU chiều cùng lúc — <code>WHERE d.month = 6 AND f.action_type = 'like'</code> cắt ra khối con nhỏ hơn. PM kéo bộ lọc trên dashboard = bạn đang slice/dice.",
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
              { id: 'd', text: 'Dice — vì có điều kiện WHERE', correct: false, explanation: 'Sai — dice là CỐ ĐỊNH GIÁ TRỊ trên nhiều chiều cùng lúc; một điều kiện cố định 1 chiều là slice.' }
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
            { id: 'p2', label: '"Ghim CẢ tháng 6 LẪN loại like — xem khối con đó thôi"' },
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
        mission: 'Trả lời PM trong MỘT query: <strong>dice — ghim đồng thời tháng 6 VÀ loại like</strong>, hiển thị theo quốc gia — tổng like nhiều → ít.',
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
          { id: 'where-line', placeholder: 'WHERE ____ (dice — ghim 2 chiều)', accepts: ['kw', 'op'], acceptedKeywords: ['WHERE'], multi: true },
          { id: 'group-line', placeholder: 'GROUP BY ____ (chiều hiển thị)', accepts: ['kw', 'col'], acceptedKeywords: ['GROUP BY'], multi: true },
          { id: 'order-line', placeholder: 'ORDER BY ____', accepts: ['kw', 'col'], acceptedKeywords: ['ORDER BY'], multi: true }
        ],
        expected_sql: "SELECT u.country, SUM(f.act_count) AS total FROM fact_post_action f JOIN dim_date d ON f.date_id = d.date_id JOIN dim_user u ON f.user_id = u.user_id WHERE d.month = 6 AND f.action_type = 'like' GROUP BY u.country ORDER BY total DESC;",
        reveal_hints: {
          'select-line': 'Chiều hiển thị + số đo: <strong>u.country, SUM(f.act_count) AS total</strong>.',
          'from-line': 'Cần CẢ HAI chiều: fact nối <strong>dim_date</strong> (để slice tháng) và <strong>dim_user</strong> (để dice nước).',
          'where-line': 'Dice — ghim 2 chiều cùng lúc: <strong>d.month = 6 AND f.action_type = \'like\'</strong>.',
          'group-line': 'Chiều hiển thị của bảng kết quả: <strong>u.country</strong>.',
          'order-line': 'Nhiều → ít: <strong>total DESC</strong>.'
        }
      },
      step_4: {
        prompt: 'Câu thứ ba của PM — <strong>drill-down</strong>: "VN trong tháng 6, NGÀY nào sôi động nhất?". Giữ lát tháng 6, đổi chiều ghim: <code>u.country = \'VN\'</code> thay cho loại hành động (tính MỌI loại), còn GROUP BY khoan xuống <code>d.full_date</code> — đổi độ hạt, đúng nghĩa drill-down.',
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
            'Dice mới: <code>WHERE d.month = 6 AND u.country = \'VN\'</code> (mọi loại hành động).',
            'Khoan độ hạt: <code>GROUP BY d.full_date</code> — tháng vỡ thành ngày.',
            'Nhẩm tay: VN tháng 6 = minhkiller(D1:3) + toxic_lord(D1:1) + minhkiller(D2:5) + toxic_lord(D2:3) → D2=8, D1=4.'
          ],
          hint_explore: 'Xem chiều thời gian: <code>SELECT * FROM dim_date</code> rồi Run — D1/D2 thuộc tháng 6, D3 đã sang tháng 7.',
          expected: 'Bảng 2 dòng: 2026-06-02 → 8 · 2026-06-01 → 4. Ngày 02/06 chính là hôm toxic_lord khẩu chiến (Ticket #24) — drama nuôi số liệu.'
        },
        hints: [
          { level: 1, text: 'Khung y hệt Step 3 — chỉ ĐỔI VAI: nước chuyển từ chiều hiển thị (GROUP BY) sang chiều bị ghim (WHERE), ngày chuyển từ WHERE sang GROUP BY (drill-down — đổi độ hạt).' },
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
            title: 'Tumbling · Hopping · Sliding · Session',
            body: '<strong>Tumbling</strong>: ô khít, không chờm — mỗi sự kiện đúng 1 ô. <strong>Hopping</strong>: bề rộng cố định nhưng tính theo NHỊP riêng — "cửa sổ 5 phút, tính lại mỗi phút", các ô chờm nhau. <strong>Sliding</strong>: cửa sổ trượt quanh TỪNG sự kiện đến (dạng chuẩn SQL hỗ trợ). <strong>Session</strong>: ô co giãn theo hành vi — hết im lặng 10 phút là đóng phiên. Chọn sai loại là báo động sai.'
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
            question: '"Số post trong cửa sổ 5 phút, TÍNH LẠI mỗi phút" — cần loại cửa sổ nào?',
            options: [
              { id: 'a', text: 'Hopping — bề rộng cố định 5 phút nhưng tính theo nhịp 1 phút: các cửa sổ CHỜM nhau, một sự kiện có thể được đếm ở nhiều cửa sổ', correct: true, explanation: 'Đúng — "bề rộng cố định + nhịp tính riêng" là chữ ký của hopping (sách xếp nó riêng khỏi sliding); tumbling chỉ chốt sổ mỗi 5 phút một lần.' },
              { id: 'b', text: 'Sliding — cửa sổ trượt quanh từng sự kiện', correct: false, explanation: 'Sai theo phân loại của sách — sliding trượt quanh TỪNG SỰ KIỆN đến; còn khung cố định tính theo NHỊP đều là hopping.' },
              { id: 'c', text: 'Tumbling — vì vẫn là 5 phút', correct: false, explanation: 'Sai — tumbling trả lời "trong Ô 14:00–14:05 có gì", các ô không chờm; đây cần ô chờm nhau theo nhịp.' },
              { id: 'd', text: 'Session — vì người dùng đang hoạt động', correct: false, explanation: 'Sai — session co giãn theo khoảng lặng hành vi, không phải khung cố định tính theo nhịp.' }
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
              { id: 'b', text: 'Trang vừa được dùng xong — vì nhu cầu của nó đã được đáp ứng', correct: false, explanation: 'Sai cho tình huống này — đó là MRU. Truy cập kiểu feed thì trang vừa dùng rất hay bị dùng lại ngay (F5!) → LRU đúng; MRU chỉ tỏa sáng ở pattern quét vòng lặp lại (sách 13.5.2 — khóa NC gặp lại ở JOIN).' },
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
          'buf-3': 'Đuổi theo LỊCH SỬ: <strong>LRU — lâu không dùng nhất</strong>. Khối "đuổi trang vừa dùng xong" là MRU đặt SAI CHỖ: chiến lược đó có đất diễn thật ở pattern quét vòng lặp (sách 13.5.2), nhưng với truy cập kiểu feed thì trang vừa đọc rất hay bị đọc lại (F5!).',
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
    },

    /* ═══════════ tc_16 — Ticket #36 · Index cơ bản (Search Key) ═══════════
     * Engine tier: step-3 = zone khái niệm tự khai station + expected_zones;
     * step-4 = CREATE INDEX → scan pending (M6 reCheck mới) + DDL-head exact-match
     * + equiv_sql SELECT WHERE email (probe t1 OK). */
    {
      id: 'tc_16', index: 16,
      title: 'Index — mục lục cho 2 triệu dòng',
      subtitle: 'Tra email trúng ngay khỏi lật cả sổ — nhưng mỗi mục lục là một món nợ khi ghi',
      module: 6, module_title: 'Storage, Indexing & Performance',
      estimated_minutes: 15, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'users (2.000.000 dòng — mẫu 6)',
          columns: ['user_id', 'username', 'email', 'country'],
          dataRows: [
            ['7',  'minhkiller', 'minh@ghub.vn', 'VN'],
            ['9',  'yuki_sama',  'yuki@ghub.jp', 'JP'],
            ['12', 'toxic_lord', 'toxic@ghub.vn', 'VN'],
            ['15', 'sara_gg',    'sara@ghub.us', 'US'],
            ['21', 'mai_speed',  'mai@ghub.vn',  'VN'],
            ['24', 'bob_afk',    'bob@ghub.us',  'US']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #36',
        hook: 'CSKH than trời: khách đọc email qua điện thoại, gõ vào ô tra cứu — và ĐỢI <strong>9 GIÂY</strong>. Đằng sau ô đó là <code>WHERE email = ?</code> quét tuần tự 2 triệu dòng × 25.000 trang, đúng kiểu "lật sổ từ bìa" của Ticket #32. Ticket #36: xây <em>MỤC LỤC</em> — index. Chọn <strong>search key</strong> là email, mục lục tự xếp thứ tự, mỗi mục trỏ thẳng (trang, slot). Nhưng khoan rải index khắp nơi: mỗi cuốn mục lục là một món nợ phải trả ở MỌI lần ghi.'
      },
      step_1: {
        primer: {
          goal: [
            'Index = cấu trúc PHỤ xếp theo search key, mỗi mục trỏ về chỗ dòng nằm — RID (trang, slot)',
            'Tra điểm (point query) đi qua mục lục: vài trang thay vì cả bảng',
            'Cái giá: INSERT/UPDATE phải cập nhật sổ chính + MỌI index — index thừa = thuế ghi vô ích'
          ],
          intro: 'Cuốn giáo trình 1.200 trang không ai đọc từ bìa để tìm chữ "trigger" — người ta mở MỤC LỤC: từ khóa xếp ABC, kèm số trang. Index của database y hệt: một cấu trúc <strong>tách riêng</strong>, xếp thứ tự theo <strong>search key</strong> (cột bạn hay tra), mỗi mục là cặp <code>khóa → RID (trang, slot)</code> — địa chỉ nhà của dòng, đúng RID bạn gặp ở Ticket #34. Tra <code>mai@ghub.vn</code>: lần vài bước trong mục lục, lấy RID, nhảy thẳng tới trang 8112 slot 4. Hết chuyện lật 25.000 trang.',
          example: 'users 2M dòng ≈ 25.000 trang: seq scan đọc 25.000 trang (~9s) · qua index email: ~3 trang mục lục + 1 trang dữ liệu (~0,04s) — nhanh hơn nghìn lần cho MỘT dòng cần tìm.'
        },
        concept_cards: [
          {
            icon: 'fa-book-open',
            title: 'Search key — cột nào làm mục lục?',
            body: 'Một index gắn với MỘT search key. Mục trong index là cặp <code>(giá trị khóa, con trỏ)</code> — khóa xếp thứ tự nên tìm nhanh, con trỏ dẫn về dòng thật. Tra cột nào nhiều thì đánh mục lục cột đó: <code>users.email</code> (đăng nhập, CSKH), <code>posts.user_id</code> (mở tường nhà).',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 14 — Indexing: search key & index entry'
          },
          {
            icon: 'fa-file-invoice-dollar',
            title: 'Món nợ của mục lục',
            body: 'User mới đăng ký → ghi 1 dòng vào sổ chính VÀ chèn 1 mục vào ĐÚNG CHỖ của từng index. 5 index = 6 lần ghi cho 1 INSERT. Index không ai tra = trả thuế ghi vô ích + tốn chỗ. Nguyên tắc: đánh index theo QUERY thật, không đánh "cho chắc".'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Soi GameHub: <code>email</code> — tra hoài, đáng. <code>user_id</code> trong posts — mở tường nhà ai cũng cần, đáng. <code>bio</code> — đời nào lọc theo bio, khỏi. Còn "đếm cả 2M dòng theo country"? Đằng nào cũng đụng gần cả bảng — mục lục không cứu được seq scan chính đáng (Ticket #32).'
          }
        ],
        visual: {
          schema: {
            table_name: 'idx_users_email — mục lục xếp theo email',
            columns: [
              { name: 'search key', type: 'email (xếp ABC)', key: '🔑', icon: '📖' },
              { name: 'con trỏ', type: 'RID (trang, slot)', key: '→', icon: '🎯' }
            ]
          },
          data_preview: [
            ['bob@ghub.us',  '→ (trang 00019, slot 3)'],
            ['mai@ghub.vn',  '→ (trang 08112, slot 4) ← tra 1 phát trúng'],
            ['minh@ghub.vn', '→ (trang 00007, slot 1)'],
            ['ghi 1 user mới', '= sổ chính + chèn đúng chỗ MỌI mục lục 💸']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Tra <code>WHERE email = \'mai@ghub.vn\'</code> KHÔNG có index — vì sao phải đọc tới ~25.000 trang dù dòng cần tìm chỉ có MỘT?',
            options: [
              { id: 'a', text: 'Máy không biết dòng đó nằm đâu — heap file không có trật tự, đành lật tuần tự đến khi gặp (xui thì trang cuối)', correct: true, explanation: 'Đúng — bài học Ticket #34: heap không trật tự → full scan. Index chính là "trật tự gắn ngoài" để khỏi lật.' },
              { id: 'b', text: 'Vì email là kiểu chữ, so sánh chữ chậm hơn so sánh số', correct: false, explanation: 'Sai — so sánh chữ chậm hơn chút nhưng không phải lý do; vấn đề là SỐ TRANG phải khiêng.' },
              { id: 'c', text: 'Vì RAM không đủ chứa 2 triệu dòng', correct: false, explanation: 'Sai — buffer (Ticket #33) xử lý chuyện đó; kể cả đủ RAM vẫn phải đọc từng trang lần đầu.' },
              { id: 'd', text: 'Vì database chỉ đọc được 1 dòng mỗi lần', correct: false, explanation: 'Sai — đọc theo TRANG (Ticket #31); vấn đề là phải đọc GẦN HẾT các trang.' }
            ]
          },
          {
            question: 'Index email cứu CSKH ngoạn mục — vậy sao không đánh index cho MỌI cột của users luôn "cho chắc"?',
            options: [
              { id: 'a', text: 'Mỗi INSERT/UPDATE phải cập nhật sổ chính + TỪNG index — index thừa là thuế ghi trả mãi cho thứ không ai tra', correct: true, explanation: 'Đúng — index là món nợ khi ghi. Đánh theo query thật sự chạy, không theo cảm giác an toàn.' },
              { id: 'b', text: 'Vì mỗi bảng chỉ được phép có tối đa 2 index', correct: false, explanation: 'Sai — không có giới hạn kiểu đó; giới hạn là chi phí.' },
              { id: 'c', text: 'Vì index làm chậm cả việc ĐỌC những cột khác', correct: false, explanation: 'Sai — đọc không bị chậm đi vì có thêm index; chỉ GHI mới gánh.' },
              { id: 'd', text: 'Không sao cả — index miễn phí, đánh hết là đúng bài', correct: false, explanation: 'Sai — "miễn phí" là cái bẫy; hãy nhớ 1 INSERT phải chèn vào đúng chỗ của từng mục lục.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Index email cứu được query nào?',
          instruction: 'Kéo từng query vào đúng giỏ — mục lục email chỉ cứu được người tra THEO EMAIL, và chỉ khi lấy ÍT dòng.',
          xp: 20,
          chips: [
            { id: 'q1', label: "WHERE email = 'mai@ghub.vn' (CSKH tra 1 khách)" },
            { id: 'q2', label: 'WHERE user_id = 735 (mở hồ sơ theo id)' },
            { id: 'q3', label: "WHERE email = 'bob@ghub.us' (đăng nhập)" },
            { id: 'q4', label: 'Gom đếm CẢ 2 triệu dòng theo country' }
          ],
          bins: [
            { id: 'saved',  label: 'Index email CỨU 📖' },
            { id: 'nosave', label: 'Index email BÓ TAY 🐢' }
          ],
          solution: { q1: 'saved', q3: 'saved', q2: 'nosave', q4: 'nosave' }
        }
      },
      step_3: {
        mission: 'Xếp hai con đường tra "mai@ghub.vn" — không mục lục và có mục lục. Có một khối bịa.',
        blocks: [
          { type: 'op', token: 'Nhảy thẳng tới trang 8112, slot 4 — đọc đúng MỘT trang dữ liệu', slot: 'path-jump' },
          { type: 'op', token: 'Không index: lật tuần tự trang 1 → 2 → 3… đến khi gặp mai@ghub.vn — xui thì gần 25.000 trang', slot: 'path-seq' },
          { type: 'op', token: 'Index nhanh vì toàn bộ 2 triệu dòng đã được chép sẵn vào RAM từ lúc tạo', slot: 'path-x' },
          { type: 'op', token: 'Có index: lần theo mục lục xếp ABC — vài bước ra mục "mai@ghub.vn → (8112, 4)"', slot: 'path-idx' }
        ],
        drop_zones: [
          { id: 'path-seq', placeholder: 'Con đường KHÔNG mục lục', accepts: ['op'], multi: false,
            station: { icon: '🐢', label: 'Quét tuần tự', sub: 'Lật từ bìa', hint: 'Heap không trật tự (Ticket #34) — không biết dòng ở đâu thì phải lật đến khi gặp.' } },
          { id: 'path-idx', placeholder: 'Có mục lục — bước 1: tra ở đâu?', accepts: ['op'], multi: false,
            station: { icon: '📖', label: 'Tra mục lục', sub: 'Theo search key', hint: 'Mục lục XẾP THỨ TỰ theo email — tìm trong đống đã xếp chỉ vài bước.' } },
          { id: 'path-jump', placeholder: 'Có mục lục — bước 2: rồi làm gì?', accepts: ['op'], multi: false,
            station: { icon: '🎯', label: 'Nhảy đúng chỗ', sub: 'Theo RID', hint: 'Mục lục trả về RID (trang, slot) — nhảy thẳng, đọc đúng 1 trang.' } }
        ],
        expected_sql: 'Không index: lật tuần tự trang 1 → 2 → 3… đến khi gặp mai@ghub.vn — xui thì gần 25.000 trang Có index: lần theo mục lục xếp ABC — vài bước ra mục "mai@ghub.vn → (8112, 4)" Nhảy thẳng tới trang 8112, slot 4 — đọc đúng MỘT trang dữ liệu',
        expected_zones: {
          'path-seq': 'Không index: lật tuần tự trang 1 → 2 → 3… đến khi gặp mai@ghub.vn — xui thì gần 25.000 trang',
          'path-idx': 'Có index: lần theo mục lục xếp ABC — vài bước ra mục "mai@ghub.vn → (8112, 4)"',
          'path-jump': 'Nhảy thẳng tới trang 8112, slot 4 — đọc đúng MỘT trang dữ liệu'
        },
        reveal_hints: {
          'path-seq': 'Không mục lục = <strong>lật tuần tự từng trang</strong> — chính là seq scan 9 giây của CSKH.',
          'path-idx': 'Bước 1 của con đường index: <strong>tra mục lục theo email</strong>. Khối "chép sẵn vào RAM" là bịa — index nằm trên đĩa như mọi thứ khác, cũng đọc theo trang.',
          'path-jump': 'Bước 2: cầm RID <strong>nhảy thẳng tới (trang, slot)</strong> — một cú random access đáng giá.'
        }
      },
      step_4: {
        prompt: 'Đóng Ticket #36 bằng chính tay bạn: tạo mục lục email cho CSKH. Cú pháp: <code>CREATE INDEX tên_index ON bảng(cột);</code> — đặt tên <code>idx_users_email</code> theo chuẩn đặt tên của đội.',
        schema: {
          table_name: 'users',
          columns: [
            { name: 'user_id', type: 'INT', key: 'PK' },
            { name: 'username', type: 'VARCHAR', key: '' },
            { name: 'email', type: 'VARCHAR', key: '🔑 sắp làm search key' },
            { name: 'country', type: 'CHAR(2)', key: '' }
          ],
          data: [
            ['7',  'minhkiller', 'minh@ghub.vn', 'VN'],
            ['9',  'yuki_sama',  'yuki@ghub.jp', 'JP'],
            ['12', 'toxic_lord', 'toxic@ghub.vn', 'VN'],
            ['15', 'sara_gg',    'sara@ghub.us', 'US'],
            ['21', 'mai_speed',  'mai@ghub.vn',  'VN'],
            ['24', 'bob_afk',    'bob@ghub.us',  'US']
          ]
        },
        /* CREATE INDEX → scan pending (M6 reCheck); validateSQL DDL-guard chấm exact;
         * equiv render bảng "tra 1 phát trúng ngay" (probe_engine_m6b t1 OK). */
        equiv_sql: "SELECT user_id, email FROM users WHERE email = 'mai@ghub.vn';",
        context: {
          scenario: 'Lệnh này bảo database: xây mục lục xếp theo <code>email</code> cho bảng <code>users</code>, tự cập nhật mãi mãi về sau. Chạy xong, ô tra cứu của CSKH từ 9 giây còn ~0,04 giây — không sửa một dòng code app nào.',
          real_world: 'Đây là câu lệnh tăng tốc phổ biến nhất nghề backend. Postgres còn có <code>CREATE INDEX CONCURRENTLY</code> để xây mục lục trên bảng đang chạy thật mà không khóa ghi.',
          steps: [
            'Từ khóa mở đầu: <code>CREATE INDEX</code>.',
            'Tên index: <code>idx_users_email</code> — chuẩn đặt tên idx_bảng_cột.',
            'Gắn vào đâu: <code>ON users(email)</code> — bảng users, search key là email.',
            'Khung kết quả minh họa: tra mai@ghub.vn trúng ngay 1 dòng — engine demo không chạy DDL, đáp án chấm khi Run/Submit.'
          ],
          hint_explore: 'Xem lại bảng minh họa Step 1: mục lục chính là cặp email → (trang, slot). Lệnh của bạn ra lệnh XÂY cái bảng đó.',
          expected: 'Khung kết quả minh họa tra email qua index: 1 dòng (user 21, mai@ghub.vn).'
        },
        hints: [
          { level: 1, text: 'Khung: <code>CREATE INDEX tên ON bảng(cột);</code> — ba chỗ trống: tên, bảng, cột.' },
          { level: 2, text: 'Tên theo chuẩn đội: <code>idx_users_email</code>. Bảng: <code>users</code>.' },
          { level: 3, text: 'Search key là cột CSKH tra: <code>(email)</code>.' },
          { level: 4, text: '<code class="code">CREATE INDEX idx_users_email ON users(email);</code>' }
        ],
        expected_sql: 'CREATE INDEX idx_users_email ON users(email);',
        success_message: 'Ticket #36 đóng — CSKH gửi hẳn trà sữa cảm ơn! Nhưng khoan: đội thấy sướng tay đòi đánh index MỌI THỨ. Ticket #37: học phân loại mục lục trước khi rải — dense hay sparse, sổ chính hay mục lục phụ.',
        xp_reward: 120
      }
    },

    /* ═══════════ tc_17 — Ticket #37 · Dense/Sparse & Clustering/Secondary ═══════════
     * Engine tier: khái niệm thuần — step-3 zone tự khai + expected_zones;
     * step-4 fill_blank pseudo (non-SELECT → neutral guard, chấm theo ô). */
    {
      id: 'tc_17', index: 17,
      title: 'Dense vs Sparse · Clustering vs Secondary — bốn kiểu mục lục',
      subtitle: 'Mục lục từng dòng hay từng trang; sổ xếp theo khóa hay mục lục phụ trỏ về',
      module: 6, module_title: 'Storage, Indexing & Performance',
      estimated_minutes: 15, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'fill_blank',
      drag_map: {
        table: {
          name: 'users — sổ chính XẾP THEO user_id (mẫu 3 trang)',
          columns: ['trang', 'chứa các user_id', 'ghi chú'],
          dataRows: [
            ['trang 1', '7, 9',   'dòng nằm đúng thứ tự khóa'],
            ['trang 2', '12, 15', '→ tra user_id: mỗi trang chỉ cần 1 mục'],
            ['trang 3', '21, 24', '→ tra email: khóa rải khắp 3 trang']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #37',
        hook: 'Sau cú ăn tiền của idx_users_email, cả đội hăng máu: "index hết mọi cột đi!". Khoan — Ticket #37 là buổi REVIEW trước khi rải. Mục lục có <strong>bốn kiểu tính cách</strong>: <em>dense</em> ghi đủ từng dòng, <em>sparse</em> tí hon mỗi trang một mục nhưng ĐÒI sổ đã xếp; <em>clustering</em> là chính cuốn sổ nằm theo khóa (mỗi bảng chỉ được MỘT), <em>secondary</em> là mục lục phụ trỏ RID. Chọn sai kiểu = xây mục lục vô dụng.'
      },
      step_1: {
        primer: {
          goal: [
            'Dense index: MỖI DÒNG một mục — to hơn, tra thẳng từng khóa',
            'Sparse index: MỖI TRANG một mục — tí hon, nhưng CHỈ sống trên sổ đã xếp theo khóa đó',
            'Clustering = chính sổ xếp theo khóa (1 bảng 1 cái) · Secondary = mục lục phụ trỏ RID, bắt buộc dense'
          ],
          intro: 'Nhìn bảng users bên cạnh: sổ chính đang NẰM THEO user_id — 7, 9 ở trang 1; 12, 15 ở trang 2. Tra user_id chỉ cần mục lục ghi "user 7 → từ trang 1, user 12 → từ trang 2": mỗi TRANG một mục — đó là <strong>sparse</strong>, tí hon mà đủ dùng, vì tới trang là lần ra dòng (trang đã xếp!). Nhưng tra <code>email</code>? Email rải lung tung khắp các trang — mục lục email phải ghi đủ TỪNG email kèm RID: đó là <strong>dense</strong>, và vì nó là mục lục PHỤ trên sổ xếp-theo-thứ-khác, người ta gọi nó là <strong>secondary index</strong>. Còn cái quyền "sổ chính nằm theo khóa nào" — <strong>clustering index</strong> — mỗi bảng chỉ trao cho MỘT khóa duy nhất.',
          example: 'users 2M dòng: sparse theo user_id ≈ 25.000 mục (mỗi trang 1) · dense theo email = đủ 2.000.000 mục. Chênh 80 lần — nhưng dense là lựa chọn DUY NHẤT cho khóa phụ.'
        },
        concept_cards: [
          {
            icon: 'fa-layer-group',
            title: 'Dense vs Sparse — ghi từng dòng hay từng trang',
            body: 'Dense: mục lục có mục cho MỌI giá trị khóa. Sparse: chỉ một mục cho mỗi trang/khối, tra tới trang rồi lần trong trang. Sparse nhỏ hơn hàng chục lần — nhưng chỉ dùng được khi dữ liệu NẰM SẴN theo thứ tự khóa đó.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 14 — Dense & Sparse Indices'
          },
          {
            icon: 'fa-crown',
            title: 'Clustering — ngai vàng chỉ có một',
            body: 'Dữ liệu vật lý chỉ nằm được theo MỘT thứ tự (Ticket #35 đã dạy: "ai nằm cạnh ai" là quyết định lớn nhất). Chọn khóa nào cho sổ chính = trao ngai clustering cho khóa đó. Mọi khóa khác muốn có mục lục đành làm secondary — trỏ RID về, và phải dense.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'GameHub: bảng users nằm theo <code>user_id</code> → clustering thuộc về user_id, tra id dùng sparse là đủ. <code>idx_users_email</code> hôm qua bạn tạo? Nó là secondary + dense — đúng kiểu duy nhất có thể. Đòi "sparse theo email cho nhẹ" là đòi điều không tồn tại.'
          }
        ],
        visual: {
          schema: {
            table_name: 'hai mục lục trên cùng bảng users (xếp theo user_id)',
            columns: [
              { name: 'sparse · user_id', type: 'mỗi trang 1 mục', key: '🪶', icon: '📖' },
              { name: 'dense · email', type: 'mỗi dòng 1 mục', key: '🔖', icon: '📚' }
            ]
          },
          data_preview: [
            ['7 → trang 1',  'bob@ghub.us → RID(3,2)'],
            ['12 → trang 2', 'mai@ghub.vn → RID(3,1)'],
            ['21 → trang 3', 'minh@ghub.vn → RID(1,1)'],
            ['3 mục cho 6 dòng 🪶', '6 mục cho 6 dòng — không được thiếu ai']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Sparse index tí hon so với dense — vậy sao KHÔNG dùng sparse cho mục lục email của Ticket #36?',
            options: [
              { id: 'a', text: 'Sparse chỉ sống trên dữ liệu ĐÃ XẾP theo khóa đó — users nằm theo user_id, email rải lung tung nên "mỗi trang 1 mục email" chẳng dẫn tới đâu', correct: true, explanation: 'Đúng — sparse ghi "từ trang này trở đi là khóa ≥ X", chỉ có nghĩa khi trang thật sự xếp theo X.' },
              { id: 'b', text: 'Vì email dài quá, không nhét vừa mục lục sparse', correct: false, explanation: 'Sai — độ dài khóa không phải vấn đề; THỨ TỰ nằm của dữ liệu mới là vấn đề.' },
              { id: 'c', text: 'Vì sparse chỉ dùng được cho khóa kiểu số', correct: false, explanation: 'Sai — khóa chữ hay số đều được, miễn dữ liệu xếp theo nó.' },
              { id: 'd', text: 'Dùng được, chỉ là tra chậm hơn dense một chút', correct: false, explanation: 'Sai — không phải "chậm hơn chút" mà là VÔ NGHĨA: tới trang rồi cũng không biết email cần tìm có ở đó không.' }
            ]
          },
          {
            question: 'Vì sao mỗi bảng chỉ có được MỘT clustering index?',
            options: [
              { id: 'a', text: 'Vì dữ liệu vật lý trên đĩa chỉ nằm được theo MỘT thứ tự — muốn thứ tự thứ hai phải chép cả bảng lần nữa', correct: true, explanation: 'Đúng — bài học Ticket #35: "ai nằm cạnh ai" chỉ chọn được một lần. Các khóa khác đành làm secondary.' },
              { id: 'b', text: 'Vì Postgres thu phí theo số clustering index', correct: false, explanation: 'Sai — đây là giới hạn vật lý, không phải giấy phép.' },
              { id: 'c', text: 'Vì clustering index chiếm trọn RAM buffer', correct: false, explanation: 'Sai — buffer không liên quan; vấn đề là chỗ nằm trên đĩa.' },
              { id: 'd', text: 'Không đúng — cứ tạo bao nhiêu clustering cũng được', correct: false, explanation: 'Sai — tạo nhiều INDEX thì được, nhưng chỉ một cái được quyền quyết định thứ tự nằm của sổ chính.' }
            ]
          }
        ],
        mini_game: {
          type: 'match',
          title: 'Bốn kiểu mục lục — ai là ai?',
          instruction: 'Nối mỗi mô tả với đúng tên gọi của nó.',
          xp: 20,
          pairs: [
            { left: 'Mục lục ghi đủ TỪNG giá trị khóa', leftId: 'k1', rightId: 'v1', right: { id: 'v1', label: 'Dense index' } },
            { left: 'Mỗi TRANG một mục — đòi sổ đã xếp theo khóa', leftId: 'k2', rightId: 'v2', right: { id: 'v2', label: 'Sparse index' } },
            { left: 'Chính sổ chính nằm theo thứ tự khóa này', leftId: 'k3', rightId: 'v3', right: { id: 'v3', label: 'Clustering index' } },
            { left: 'Mục lục phụ trên khóa khác, trỏ RID về sổ', leftId: 'k4', rightId: 'v4', right: { id: 'v4', label: 'Secondary index' } }
          ],
          solution: { k1: 'v1', k2: 'v2', k3: 'v3', k4: 'v4' }
        }
      },
      step_3: {
        mission: 'Đội đề xuất 4 phương án index cho bảng users (đang nằm theo user_id) — xếp mỗi phương án vào đúng ga. Có một khối bịa.',
        blocks: [
          { type: 'op', token: 'Mục lục email ghi đủ TỪNG email kèm RID — vì email rải khắp sổ, không được thiếu ai', slot: 'ix-secondary' },
          { type: 'op', token: 'Chọn user_id làm khóa xếp sổ chính — cả bảng nằm trên đĩa theo thứ tự nó', slot: 'ix-cluster' },
          { type: 'op', token: 'Tra act_count kiểu lười: mỗi trang ghi 1 mục theo act_count, kệ chuyện sổ đang xếp theo user_id', slot: 'ix-x' },
          { type: 'op', token: 'Tra user_id chỉ cần mỗi trang 1 mục "7 → trang 1, 12 → trang 2…" — sổ đã xếp, tới trang là lần ra', slot: 'ix-sparse' }
        ],
        drop_zones: [
          { id: 'ix-cluster', placeholder: 'Ngai vàng — thứ tự nằm của sổ chính', accepts: ['op'], multi: false,
            station: { icon: '👑', label: 'Clustering', sub: 'Mỗi bảng một ngai', hint: 'Ai quyết định "dòng nào nằm cạnh dòng nào"? Khóa được trao ngai đó.' } },
          { id: 'ix-sparse', placeholder: 'Mục lục tí hon trên khóa của ngai', accepts: ['op'], multi: false,
            station: { icon: '🪶', label: 'Sparse', sub: 'Mỗi trang 1 mục', hint: 'Chỉ sống trên sổ ĐÃ XẾP theo khóa — tới trang là lần ra dòng.' } },
          { id: 'ix-secondary', placeholder: 'Mục lục phụ cho khóa rải rác', accepts: ['op'], multi: false,
            station: { icon: '🔖', label: 'Secondary', sub: 'Dense + RID', hint: 'Khóa phụ rải khắp sổ → phải ghi đủ từng dòng, trỏ RID về.' } }
        ],
        expected_sql: 'Chọn user_id làm khóa xếp sổ chính — cả bảng nằm trên đĩa theo thứ tự nó Tra user_id chỉ cần mỗi trang 1 mục "7 → trang 1, 12 → trang 2…" — sổ đã xếp, tới trang là lần ra Mục lục email ghi đủ TỪNG email kèm RID — vì email rải khắp sổ, không được thiếu ai',
        expected_zones: {
          'ix-cluster': 'Chọn user_id làm khóa xếp sổ chính — cả bảng nằm trên đĩa theo thứ tự nó',
          'ix-sparse': 'Tra user_id chỉ cần mỗi trang 1 mục "7 → trang 1, 12 → trang 2…" — sổ đã xếp, tới trang là lần ra',
          'ix-secondary': 'Mục lục email ghi đủ TỪNG email kèm RID — vì email rải khắp sổ, không được thiếu ai'
        },
        reveal_hints: {
          'ix-cluster': 'Ngai vàng = <strong>quyền quyết định thứ tự nằm</strong> — user_id đang giữ nó.',
          'ix-sparse': 'Sparse = <strong>mỗi trang 1 mục</strong>, chỉ có nghĩa trên khóa của ngai. Khối "act_count kiểu lười" là bịa — sparse trên cột không xếp là mục lục dẫn vào hư không.',
          'ix-secondary': 'Khóa phụ rải rác = <strong>dense + trỏ RID</strong> — chính là idx_users_email của Ticket #36.'
        }
      },
      step_4: {
        prompt: 'Điền hồ sơ index cho bảng users — 4 ô, toàn thuật ngữ vừa học (gõ tiếng Anh).',
        challenge_type: 'fill_blank',
        template: '-- HỒ SƠ INDEX · bảng users (sổ chính nằm theo user_id)\n\n-- Quyền quyết định thứ tự nằm của sổ thuộc về user_id\n--   → user_id đang giữ index kiểu: ____\n\n-- Mục lục tra user_id: mỗi TRANG chỉ cần 1 mục\n--   → kiểu mục lục: ____\n\n-- Mục lục email: phải ghi đủ TỪNG email, không thiếu ai\n--   → kiểu mục lục: ____\n\n-- Vị thế của mục lục email so với sổ chính: ____',
        blanks: [
          { id: 'b1', hint: 'ngai vàng', expected: 'CLUSTERING' },
          { id: 'b2', hint: 'tí hon, mỗi trang 1 mục', expected: 'SPARSE' },
          { id: 'b3', hint: 'đủ từng dòng', expected: 'DENSE' },
          { id: 'b4', hint: 'mục lục phụ', expected: 'SECONDARY' }
        ],
        context: {
          scenario: 'Đây chính là 4 quyết định bạn sẽ điền (trong đầu) mỗi lần định gõ CREATE INDEX ở công ty: sổ đang xếp theo gì, mục lục mới thưa hay dày, chính hay phụ.',
          real_world: 'Trong Postgres: PRIMARY KEY thường kiêm luôn vai clustering (InnoDB/MySQL thì bắt buộc); mọi CREATE INDEX thêm vào đều là secondary. Lệnh <code>CLUSTER</code> của Postgres cho phép xếp lại sổ theo một index — đúng nghĩa trao lại ngai.',
          steps: [
            'Ô 1: ai quyết định thứ tự nằm? — kiểu index của user_id.',
            'Ô 2: sổ đã xếp theo user_id → mục lục user_id được phép thưa.',
            'Ô 3: email rải khắp sổ → mục lục email phải ghi đủ.',
            'Ô 4: mục lục email đứng ở vị thế nào so với sổ chính?'
          ],
          hint_explore: 'Nhìn lại bảng 3 trang ở Step 3: user_id 7, 9 nằm trang 1 theo đúng thứ tự — còn email thì nhảy loạn giữa các trang.',
          expected: 'Điền đúng 4/4: clustering · sparse · dense · secondary. Bài pseudo-code — chấm theo ô điền.'
        },
        hints: [
          { level: 1, text: 'Bốn thuật ngữ của bài: dense, sparse, clustering, secondary — mỗi ô một cái, không lặp.' },
          { level: 2, text: 'Ô 1 hỏi về NGAI VÀNG (thứ tự nằm) — không phải về độ dày mục lục.' },
          { level: 3, text: 'Cặp ô 2-3: sổ đã xếp thì mục lục được THƯA; khóa rải rác thì mục lục phải DÀY.' },
          { level: 4, text: 'Đáp án: <code>clustering</code> · <code>sparse</code> · <code>dense</code> · <code>secondary</code>.' }
        ],
        success_message: 'Ticket #37 đóng — đội hết dám rải index bừa! Nhưng có người hỏi xoáy: "mục lục email tự nó cũng 2 triệu mục — tra trong MỤC LỤC kiểu gì cho nhanh?". Câu hỏi trúng tim: Ticket #38 mở nắp capo — bên trong mọi index xịn là một CÁI CÂY.',
        xp_reward: 120
      }
    },

    /* ═══════════ tc_18 — Ticket #38 · B+-Tree ═══════════
     * Engine tier: khái niệm thuần — step-3 lookup path 4 ga tự khai;
     * step-4 mcq_code (range scan — khác point lookup của step-3, anti-boredom). */
    {
      id: 'tc_18', index: 18,
      title: 'B+-Tree — cái cây sống trong mọi index',
      subtitle: '2 triệu khóa, cao đúng 3 tầng — và những chiếc lá móc nhau cân luôn range query',
      module: 6, module_title: 'Storage, Indexing & Performance',
      estimated_minutes: 15, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'mcq_code',
      drag_map: {
        table: {
          name: 'idx_users_email — B+-Tree 3 tầng (mỗi ô = 1 trang 8KB)',
          columns: ['tầng', 'node', 'chứa gì'],
          dataRows: [
            ['1 · ROOT',     '1 trang',      'ngưỡng chia: "h…" | "s…" — chỉ đường xuống'],
            ['2 · INTERNAL', '~100 trang',   'ngưỡng chia mịn hơn: "j…" | "mai…" | "p…"'],
            ['3 · LEAF',     '~25.000 trang', 'khóa ĐÃ XẾP + RID — và móc sang lá kế →'],
            ['(sổ chính)',   '25.000 trang', 'heap: nơi RID trỏ về']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #38',
        hook: 'Câu hỏi xoáy cuối Ticket #37 vẫn treo đó: mục lục email tự nó cũng 2 TRIỆU mục — chẳng lẽ tra mục lục lại phải… quét mục lục? Ticket #38 mở nắp capo: mọi index bạn từng CREATE đều là một <strong>B+-Tree</strong> — cây phân tầng mà mỗi node là MỘT TRANG chứa hàng trăm ngưỡng chia. Root hỏi một câu, internal hỏi câu nữa, tầng ba đã là lá chứa đáp án. Và những chiếc lá <em>móc tay nhau</em> — bí mật giúp index cân luôn câu hỏi "từ ngày X đến ngày Y".'
      },
      step_1: {
        primer: {
          goal: [
            'B+-Tree: root → internal → leaf; mỗi node = 1 trang chứa HÀNG TRĂM khóa (fanout lớn)',
            'Cao 3-4 tầng cho hàng triệu khóa → tra 1 khóa = 3-4 lần đọc trang, mãi mãi',
            'Lá chứa khóa đã xếp + RID, và MÓC sang lá kế → range scan đi ngang, khỏi leo lại cây'
          ],
          intro: 'Đừng tưởng tượng cây gia phả lèo tèo 2 nhánh — node của B+-Tree là MỘT TRANG 8KB (Ticket #31) nhét được hàng trăm ngưỡng chia. Tra <code>mai@ghub.vn</code>: ROOT nói "m nằm giữa h và s → nhánh giữa"; INTERNAL nói "xuống lá 812"; LÁ 812 mở ra — khóa xếp sẵn, <code>mai@… → RID(8112, 4)</code>. Ba lần đọc trang, xong. Vì mỗi tầng NHÂN hàng trăm lần sức chứa, 100³ đã là một tỷ — cây triệu khóa vẫn lùn tịt. Còn INSERT? Node đầy thì tách đôi, cây tự cân bằng — không ai phải "chạy lại index".',
          example: 'Tra 1 email trong 2M khóa: seq scan mục lục ~25.000 trang · B+-Tree: root + internal + lá = 3 trang. Log₁₀₀ của 2 triệu ≈ 3,05 — con số 3-4 tầng không phải may mắn, nó là toán.'
        },
        concept_cards: [
          {
            icon: 'fa-tree',
            title: 'Fanout — vì sao cây triệu khóa vẫn lùn',
            body: 'Node = 1 trang chứa n ngưỡng chia (n hàng trăm) → mỗi tầng nhân n lần số khóa với tới được. Chiều cao ~log_n(N): với n=100, một tỷ khóa cũng chỉ cần 4-5 tầng. Root với internal nóng hổi nằm lì trong buffer (Ticket #33) — thực tế thường chỉ tốn 1 lần đọc đĩa cho lá.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 14 — B+-Tree Index Files'
          },
          {
            icon: 'fa-link',
            title: 'Lá móc nhau — vũ khí của range query',
            body: '"Post từ 01/06 đến 30/06"? Lần cây tìm lá chứa 01/06 (3 bước), rồi ĐI NGANG theo con trỏ lá-sang-lá, gom khóa đến khi vượt 30/06 thì dừng. Khỏi leo cây lại từ đầu cho từng ngày — lá đã xếp thứ tự và nắm tay nhau sẵn.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Vậy idx_users_email của Ticket #36 thực chất là gì? Một B+-Tree khóa email. Còn feed "20 post mới nhất"? B+-Tree trên created_at: lần tới lá mới nhất rồi đi ngược 20 mục. Mọi CREATE INDEX bạn gõ từ giờ — trong đầu hãy thấy một cái cây.'
          }
        ],
        visual: {
          schema: {
            table_name: 'lookup mai@ghub.vn — 3 lần đọc trang',
            columns: [
              { name: 'ROOT', type: '"m" giữa h và s', key: '1️⃣', icon: '🌳' },
              { name: 'INTERNAL', type: '→ lá 812', key: '2️⃣', icon: '🌿' },
              { name: 'LEAF 812', type: 'mai@ → RID', key: '3️⃣', icon: '🍃' }
            ]
          },
          data_preview: [
            ['h… | s…', 'j… | mai… | p…', 'mai@ghub.vn → (8112, 4) 🎯'],
            ['1 trang', '~100 trang cùng tầng', 'lá móc lá kế →'],
            ['thường nằm lì trong buffer', 'hay trúng buffer', 'đọc đĩa thật sự: thường chỉ 1'],
            ['INSERT làm node đầy?', 'tách đôi node', 'cây TỰ cân bằng — không ai phải xây lại']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: '2 triệu khóa mà B+-Tree chỉ cao 3 tầng — phép màu nằm ở đâu?',
            options: [
              { id: 'a', text: 'Mỗi node là 1 TRANG chứa hàng trăm ngưỡng chia — mỗi tầng nhân hàng trăm lần, 100³ đã vượt 2 triệu', correct: true, explanation: 'Đúng — fanout lớn là toàn bộ phép màu. Cây nhị phân 2 nhánh phải cao ~21 tầng cho 2M khóa; cây trang-8KB chỉ cần 3.' },
              { id: 'b', text: 'Vì database nén 2 triệu khóa xuống còn vài nghìn', correct: false, explanation: 'Sai — đủ 2 triệu khóa nằm ở lá; chỉ là đường XUỐNG tới chúng rất ngắn.' },
              { id: 'c', text: 'Vì cây được chép toàn bộ vào RAM nên coi như 0 tầng', correct: false, explanation: 'Sai — root/internal hay trúng buffer thật, nhưng cấu trúc 3 tầng vẫn là 3 tầng; lá vẫn phải đọc.' },
              { id: 'd', text: 'Vì chỉ những khóa hay tra mới được đưa vào cây', correct: false, explanation: 'Sai — index dense: đủ mọi khóa (Ticket #37). Không ai bị bỏ rơi.' }
            ]
          },
          {
            question: 'Vì sao các LÁ móc nhau (con trỏ lá → lá kế) là vũ khí quyết định cho câu "posts từ 01/06 đến 30/06"?',
            options: [
              { id: 'a', text: 'Tìm lá chứa 01/06 xong chỉ việc ĐI NGANG gom dần tới 30/06 — mỗi ngày không phải leo cây lại từ root', correct: true, explanation: 'Đúng — lá đã xếp thứ tự + nắm tay nhau = range scan thành một đường đi bộ thẳng.' },
              { id: 'b', text: 'Vì con trỏ giúp các lá chia sẻ RAM với nhau', correct: false, explanation: 'Sai — con trỏ là đường đi, không phải cơ chế chia RAM.' },
              { id: 'c', text: 'Vì lá móc nhau giúp INSERT nhanh hơn', correct: false, explanation: 'Sai — INSERT hưởng lợi từ cơ chế tách node; móc lá phục vụ ĐỌC DẢI.' },
              { id: 'd', text: 'Không quan trọng — range query nào cũng phải quét cả bảng', correct: false, explanation: 'Sai — chính nhờ móc lá mà range query KHÔNG phải quét cả bảng.' }
            ]
          }
        ],
        mini_game: {
          type: 'order',
          title: 'Range scan tháng 6',
          instruction: 'Xếp đúng trình tự B+-Tree trả lời "mọi post từ 01/06 đến 30/06".',
          xp: 20,
          items: [
            { id: 'r1', label: 'Từ ROOT lần ngưỡng chia xuống INTERNAL' },
            { id: 'r2', label: 'Tới LÁ chứa khóa 01/06 — điểm khởi hành' },
            { id: 'r3', label: 'Đọc các mục trong lá, theo RID lấy dòng' },
            { id: 'r4', label: 'Đi ngang sang lá kế qua con trỏ móc' },
            { id: 'r5', label: 'Gặp khóa vượt 30/06 → dừng, trả kết quả' }
          ],
          solution: { r1: 1, r2: 2, r3: 3, r4: 4, r5: 5 }
        }
      },
      step_3: {
        mission: 'Lắp đường tra "mai@ghub.vn" xuyên cây — từ root xuống lá, rồi về sổ chính. Có một khối bịa.',
        blocks: [
          { type: 'op', token: 'LÁ 812: khóa xếp sẵn — thấy ngay mục "mai@ghub.vn → RID (8112, 4)"', slot: 'bt-leaf' },
          { type: 'op', token: 'ROOT: "m…" nằm giữa ngưỡng "h…" và "s…" → rẽ nhánh giữa', slot: 'bt-root' },
          { type: 'op', token: 'Duyệt lần lượt TỪNG LÁ từ trái sang phải cho chắc ăn', slot: 'bt-x' },
          { type: 'op', token: 'Cầm RID về sổ chính: trang 8112, slot 4 — đọc đúng 1 dòng', slot: 'bt-heap' },
          { type: 'op', token: 'INTERNAL: so tiếp "mai…" với ngưỡng mịn hơn → chỉ xuống lá 812', slot: 'bt-mid' }
        ],
        drop_zones: [
          { id: 'bt-root', placeholder: 'Tầng 1 — cửa vào duy nhất', accepts: ['op'], multi: false,
            station: { icon: '🌳', label: 'ROOT', sub: 'Hỏi câu đầu', hint: 'Một trang, vài trăm ngưỡng chia — trả lời "đi nhánh nào?".' } },
          { id: 'bt-mid', placeholder: 'Tầng 2 — chỉ đường mịn hơn', accepts: ['op'], multi: false,
            station: { icon: '🌿', label: 'INTERNAL', sub: 'Hỏi câu nữa', hint: 'Ngưỡng chia mịn hơn — chốt xuống đúng chiếc lá.' } },
          { id: 'bt-leaf', placeholder: 'Tầng 3 — nơi đáp án nằm', accepts: ['op'], multi: false,
            station: { icon: '🍃', label: 'LEAF', sub: 'Khóa + RID', hint: 'Lá chứa khóa ĐÃ XẾP kèm RID — và móc sang lá kế cho range scan.' } },
          { id: 'bt-heap', placeholder: 'Trạm cuối — ra khỏi index', accepts: ['op'], multi: false,
            station: { icon: '🏠', label: 'Sổ chính', sub: 'RID trỏ về', hint: 'RID (trang, slot) — đúng địa chỉ nhà của Ticket #34.' } }
        ],
        expected_sql: 'ROOT: "m…" nằm giữa ngưỡng "h…" và "s…" → rẽ nhánh giữa INTERNAL: so tiếp "mai…" với ngưỡng mịn hơn → chỉ xuống lá 812 LÁ 812: khóa xếp sẵn — thấy ngay mục "mai@ghub.vn → RID (8112, 4)" Cầm RID về sổ chính: trang 8112, slot 4 — đọc đúng 1 dòng',
        expected_zones: {
          'bt-root': 'ROOT: "m…" nằm giữa ngưỡng "h…" và "s…" → rẽ nhánh giữa',
          'bt-mid': 'INTERNAL: so tiếp "mai…" với ngưỡng mịn hơn → chỉ xuống lá 812',
          'bt-leaf': 'LÁ 812: khóa xếp sẵn — thấy ngay mục "mai@ghub.vn → RID (8112, 4)"',
          'bt-heap': 'Cầm RID về sổ chính: trang 8112, slot 4 — đọc đúng 1 dòng'
        },
        reveal_hints: {
          'bt-root': 'Cửa vào là <strong>ROOT</strong> — so khóa với ngưỡng chia để rẽ nhánh.',
          'bt-mid': '<strong>INTERNAL</strong> hỏi câu thứ hai, mịn hơn. Khối "duyệt từng lá" là bịa — duyệt hết lá chính là seq scan, thứ ta đang chạy trốn.',
          'bt-leaf': 'Đáp án nằm ở <strong>LÁ</strong>: khóa xếp sẵn + RID.',
          'bt-heap': 'RID dẫn <strong>về sổ chính</strong> — đọc đúng 1 trang, 1 dòng.'
        }
      },
      step_4: {
        prompt: 'Feed cần "20 post MỚI NHẤT kể từ 2026-06-28" — bảng posts có B+-Tree trên <code>created_at</code>. Cây giúp kiểu gì?',
        challenge_type: 'mcq_code',
        options: [
          { text: 'Lần từ root xuống lá chứa 2026-06-28 (3-4 trang), rồi đi ngang theo con trỏ lá móc nhau gom đủ 20 post — đọc vài chục trang thay vì cả bảng.', correct: true },
          { text: 'B+-Tree vẫn phải đọc đủ 2 triệu mục lá, nhưng đọc trong RAM nên coi như miễn phí.', correct: false },
          { text: 'Cây tự xếp lại toàn bộ sổ chính theo created_at mỗi lần có INSERT, nên đọc lúc nào cũng nhanh.', correct: false },
          { text: 'Không giúp gì — index chỉ dùng được cho WHERE bằng (=), khoảng ngày thì chịu.', correct: false }
        ],
        context: {
          scenario: 'Đây là truy vấn NẶNG NHẤT của mọi mạng xã hội — trang feed. Nó sống được là nhờ đúng hai thứ bạn vừa học: lần cây (điểm khởi hành) + đi ngang lá (gom dải).',
          real_world: 'Postgres đọc index theo cả hai chiều nên "mới nhất" chỉ là đi ngang từ lá cuối ngược về. Cặp <code>ORDER BY created_at DESC LIMIT 20</code> + B+-Tree là xương sống feed của mọi mạng xã hội thật.',
          steps: [
            'Điều kiện ≥ 2026-06-28 là RANGE — nhớ mini-game: tìm lá đầu rồi đi ngang.',
            'Loại phương án "đọc đủ 2 triệu mục": đọc đủ thì cần cây làm gì.',
            'Loại phương án "tự xếp lại sổ chính": đó là chuyện của clustering (Ticket #37), và không ai xếp lại cả bảng mỗi INSERT.',
            'Loại phương án "chỉ dùng cho =": lá móc nhau sinh ra ĐỂ phục vụ khoảng.'
          ],
          hint_explore: 'Xem lại mini-game range scan tháng 6 — thay 01/06→30/06 bằng 28/06→mới nhất là ra đáp án.',
          expected: 'Chọn phương án lần-cây-rồi-đi-ngang (3-4 trang + vài chục trang lá).'
        },
        hints: [
          { level: 1, text: 'Câu hỏi là RANGE (từ ngày X trở đi) — vũ khí nào của B+-Tree sinh ra cho range?' },
          { level: 2, text: 'Hai bước: lần cây tìm ĐIỂM KHỞI HÀNH, rồi đi ngang theo lá móc nhau.' },
          { level: 3, text: 'Ba phương án sai đều phạm một lỗi đã học: đọc đủ mọi mục = seq scan; xếp lại sổ mỗi INSERT = phá giá ghi; "chỉ dùng cho =" quên mất lá móc nhau.' },
          { level: 4, text: 'Đáp án: lần từ root xuống lá 2026-06-28 rồi đi ngang gom 20 post.' }
        ],
        success_message: 'Ticket #38 đóng — từ giờ mỗi CREATE INDEX trong đầu bạn là một cái cây 3 tầng. Ticket #39: trang "hoạt động của tôi" lọc HAI điều kiện cùng lúc — một cột không đủ, đến giờ học mục lục hai lớp.',
        xp_reward: 120
      }
    },

    /* ═══════════ tc_19 — Ticket #39 · Composite & Bitmap Index ═══════════
     * Engine tier: step-3 zone tự khai; step-4 CREATE INDEX composite → scan pending
     * + DDL-guard exact + equiv_sql WHERE 2 điều kiện (probe t2/t3 OK). */
    {
      id: 'tc_19', index: 19,
      title: 'Composite & Bitmap — mục lục hai lớp và mục lục bàn cờ',
      subtitle: 'Danh bạ xếp Họ-rồi-Tên: đủ prefix thì trúng dải — và bitmap cho cột lèo tèo giá trị',
      module: 6, module_title: 'Storage, Indexing & Performance',
      estimated_minutes: 15, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'idx (user_id, action_type) — trang danh bạ đã xếp',
          columns: ['user_id', 'action_type', 'RID'],
          dataRows: [
            ['7',  'comment', '(p3, 1)'],
            ['7',  'like',    '(p1, 1) ← cụm "7·like"'],
            ['7',  'like',    '(p2, 2) ← nằm LIỀN nhau'],
            ['9',  'comment', '(p1, 2)'],
            ['9',  'like',    '(p2, 1)'],
            ['12', 'post',    '(p2, 3)']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #39',
        hook: 'Trang "hoạt động của tôi" lọc HAI điều kiện: <code>WHERE user_id = ? AND action_type = ?</code>. Index đơn trên user_id vẫn phải bới tiếp trong cả nghìn hành động của user đó. Ticket #39: <strong>composite index</strong> — danh bạ xếp <em>Họ trước, Tên sau</em>: mọi mục "user 7 · like" nằm LIỀN thành một dải. Nhưng danh bạ có luật sắt: <strong>thiếu Họ thì đừng mơ tra Tên</strong> (leftmost prefix). Khuyến mãi cuối: kho analytics có vũ khí riêng cho cột lèo tèo giá trị — <em>bitmap index</em>.'
      },
      step_1: {
        primer: {
          goal: [
            'Composite index (a, b): xếp theo a trước, cùng a xếp tiếp theo b — cụm (a,b) nằm liền dải',
            'Luật leftmost prefix: tra được (a) và (a,b); tra riêng (b) là mù — như tra Tên mà không biết Họ',
            'Bitmap index: mỗi giá trị một dãy bit — chỉ đáng cho cột ÍT giá trị, kho đọc-nhiều-ghi-ít'
          ],
          intro: 'Danh bạ điện thoại xếp Họ trước, Tên sau: mọi người họ Nguyễn đứng cạnh nhau, trong đó Nguyễn An đứng trước Nguyễn Bình. Composite index <code>(user_id, action_type)</code> y hệt: cây B+ vẫn là cây B+ (Ticket #38), chỉ khác KHÓA là cặp ghép. Tra "user 7 AND like": lần cây tới thẳng cụm <code>7·like</code> — cả dải cần lấy nằm liền nhau. Tra "user 7" thôi cũng ngon: cả khối họ-7 đứng cạnh nhau. Nhưng tra "mọi like của mọi người"? Cụm like RẢI theo từng user khắp danh bạ — index bó tay, quét sổ. Muốn tra Tên không cần Họ thì phải xây danh bạ khác xếp (action_type, user_id) — và trả thêm một món nợ ghi.',
          example: 'User 7 có 1.200 hành động, trong đó 300 like: index đơn user_id → đọc 1.200 mục rồi lọc · composite (user_id, action_type) → nhảy thẳng dải 300 mục. Càng lọc sâu, composite càng thắng đậm.'
        },
        concept_cards: [
          {
            icon: 'fa-address-book',
            title: 'Leftmost prefix — luật sắt của danh bạ',
            body: 'Index (a, b) phục vụ được: WHERE a = ? · WHERE a = ? AND b = ? · thậm chí a = ? AND b > ?. KHÔNG phục vụ được: WHERE chỉ có b. Thứ tự cột trong CREATE INDEX vì thế là quyết định thiết kế — cột nào query nào cũng lọc, cột đó đứng đầu.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 14 — Indices on Multiple Keys'
          },
          {
            icon: 'fa-chess-board',
            title: 'Bitmap — mục lục bàn cờ của kho',
            body: 'Cột action_type chỉ có 3-4 giá trị? Mỗi giá trị một dãy bit dài bằng số dòng: like = 10110100… AND/OR hai điều kiện = phép bit trên triệu dòng trong nháy mắt. Đổi lại, UPDATE một dòng phải sửa cả dãy bit — nên bitmap sống ở KHO analytics (Ticket #35), không sống nổi ở feed OLTP.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'GameHub: trang "hoạt động của tôi" → composite (user_id, action_type) cho fact_post_action. Dashboard kho lọc action_type + date_id (cả hai đều lèo tèo giá trị) → cặp bitmap, AND bit là xong. Chọn vũ khí theo TRẬN ĐỊA — bài học không bao giờ cũ.'
          }
        ],
        visual: {
          schema: {
            table_name: 'hai vũ khí đặc chủng',
            columns: [
              { name: 'composite', type: '(user_id, action_type)', key: '📇', icon: '🌳' },
              { name: 'bitmap', type: 'action_type ∈ {like,comment,post}', key: '♟', icon: '📊' }
            ]
          },
          data_preview: [
            ['7·comment → RID', 'like:    1 0 1 0 1 1 0 0'],
            ['7·like ×2 → RID (liền dải 🎯)', 'comment: 0 1 0 0 0 0 1 0'],
            ['9·comment → RID', 'post:    0 0 0 1 0 0 0 1'],
            ['thiếu Họ = mù (leftmost!)', 'AND/OR bit = triệu dòng/nháy mắt']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Composite (user_id, action_type) — vì sao tra "mọi <code>action_type = \'like\'</code> của MỌI user" lại KHÔNG dùng được nó?',
            options: [
              { id: 'a', text: 'Danh bạ xếp Họ trước — cụm "like" bị rải theo từng user khắp danh bạ, không nằm liền dải nào để nhảy tới', correct: true, explanation: 'Đúng — luật leftmost prefix: thiếu cột ĐẦU là mù. Muốn tra riêng action_type phải có index khác đặt nó lên đầu.' },
              { id: 'b', text: 'Vì composite chỉ dùng được khi WHERE có đủ CẢ HAI cột', correct: false, explanation: 'Sai — WHERE user_id = 7 (thiếu cột SAU) vẫn ngon: cả khối họ-7 nằm liền. Chỉ thiếu cột ĐẦU mới chết.' },
              { id: 'c', text: 'Vì like là giá trị chữ, composite chỉ nhận số', correct: false, explanation: 'Sai — kiểu dữ liệu không liên quan; vị trí cột trong khóa ghép mới quyết định.' },
              { id: 'd', text: 'Dùng được bình thường — index nào cũng tra được mọi cột của nó', correct: false, explanation: 'Sai — thử tra danh bạ tìm mọi người tên "An" mà không biết họ xem: lật từng trang.' }
            ]
          },
          {
            question: 'Bitmap index đáng dùng cho cột nào — và tại sao nó sống ở KHO chứ không sống nổi ở feed?',
            options: [
              { id: 'a', text: 'Cột ÍT giá trị khác nhau (action_type 3-4 loại): mỗi giá trị 1 dãy bit, AND/OR cực nhanh — nhưng mỗi UPDATE phải sửa dãy bit nên chỉ hợp kho đọc-nhiều-ghi-ít', correct: true, explanation: 'Đúng — low cardinality + workload OLAP là môi trường sống của bitmap.' },
              { id: 'b', text: 'Cột duy-nhất-từng-dòng như email — càng nhiều giá trị bitmap càng lợi', correct: false, explanation: 'Sai — 2 triệu email = 2 triệu dãy bit × 2 triệu dòng: thảm họa. Ngược hẳn môi trường sống của bitmap.' },
              { id: 'c', text: 'Mọi cột — bitmap là phiên bản nâng cấp của B+-Tree', correct: false, explanation: 'Sai — hai vũ khí khác trận địa, không ai "nâng cấp" ai.' },
              { id: 'd', text: 'Cột kiểu ngày tháng, vì bit xếp theo thời gian', correct: false, explanation: 'Sai — ngày tháng thường nhiều giá trị; tiêu chí là SỐ GIÁ TRỊ KHÁC NHAU ít.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Composite (user_id, action_type) cứu query nào?',
          instruction: 'Kéo từng WHERE vào đúng giỏ — nhớ luật danh bạ: có Họ mới tra được.',
          xp: 20,
          chips: [
            { id: 'w1', label: "WHERE user_id = 7 AND action_type = 'like'" },
            { id: 'w2', label: 'WHERE user_id = 7 (chỉ Họ)' },
            { id: 'w3', label: "WHERE action_type = 'like' (chỉ Tên)" },
            { id: 'w4', label: 'WHERE act_count > 3 (cột ngoài danh bạ)' }
          ],
          bins: [
            { id: 'hit',  label: 'TRÚNG DẢI 🎯' },
            { id: 'miss', label: 'BÓ TAY 🚫' }
          ],
          solution: { w1: 'hit', w2: 'hit', w3: 'miss', w4: 'miss' }
        }
      },
      step_3: {
        mission: 'Lắp bức tranh composite (user_id, action_type): danh bạ xếp thế nào, query nào trúng dải, query nào trượt. Có một khối bịa.',
        blocks: [
          { type: 'op', token: "WHERE action_type = 'like' (thiếu Họ): cụm like rải theo từng user khắp danh bạ → quét sổ", slot: 'cp-miss' },
          { type: 'op', token: 'Danh bạ xếp: 7·comment, 7·like, 7·like, 9·comment, 9·like… — cùng Họ đứng cạnh, trong Họ xếp theo Tên', slot: 'cp-order' },
          { type: 'op', token: 'Thấy query cần thì index tự đảo thành (action_type, user_id) — danh bạ biết tự xoay', slot: 'cp-x' },
          { type: 'op', token: "WHERE user_id = 7 AND action_type = 'like': lần cây tới thẳng cụm 7·like — cả dải nằm liền", slot: 'cp-hit' }
        ],
        drop_zones: [
          { id: 'cp-order', placeholder: 'Trang danh bạ — xếp kiểu gì?', accepts: ['op'], multi: false,
            station: { icon: '📇', label: 'Danh bạ', sub: 'Họ rồi Tên', hint: 'Khóa ghép: so cột đầu trước, hòa thì so cột sau — như xếp tên người.' } },
          { id: 'cp-hit', placeholder: 'Query TRÚNG dải', accepts: ['op'], multi: false,
            station: { icon: '🎯', label: 'Trúng dải', sub: 'Đủ prefix', hint: 'Đủ Họ (+ Tên càng tốt) → nhảy thẳng cụm liền mạch.' } },
          { id: 'cp-miss', placeholder: 'Query TRƯỢT prefix', accepts: ['op'], multi: false,
            station: { icon: '🚫', label: 'Trượt prefix', sub: 'Thiếu cột đầu', hint: 'Thiếu Họ → giá trị cần tìm rải khắp nơi, không có dải nào để nhảy.' } }
        ],
        expected_sql: "Danh bạ xếp: 7·comment, 7·like, 7·like, 9·comment, 9·like… — cùng Họ đứng cạnh, trong Họ xếp theo Tên WHERE user_id = 7 AND action_type = 'like': lần cây tới thẳng cụm 7·like — cả dải nằm liền WHERE action_type = 'like' (thiếu Họ): cụm like rải theo từng user khắp danh bạ → quét sổ",
        expected_zones: {
          'cp-order': 'Danh bạ xếp: 7·comment, 7·like, 7·like, 9·comment, 9·like… — cùng Họ đứng cạnh, trong Họ xếp theo Tên',
          'cp-hit': "WHERE user_id = 7 AND action_type = 'like': lần cây tới thẳng cụm 7·like — cả dải nằm liền",
          'cp-miss': "WHERE action_type = 'like' (thiếu Họ): cụm like rải theo từng user khắp danh bạ → quét sổ"
        },
        reveal_hints: {
          'cp-order': 'Danh bạ = <strong>so cột đầu trước, hòa mới so cột sau</strong>. Khối "index tự đảo" là bịa — thứ tự khóa chốt từ lúc CREATE, muốn chiều ngược phải xây danh bạ khác.',
          'cp-hit': 'Đủ prefix (Họ, hoặc Họ+Tên) = <strong>nhảy thẳng vào dải liền mạch</strong>.',
          'cp-miss': 'Thiếu cột đầu = <strong>giá trị rải khắp danh bạ</strong> — trở về kiếp quét sổ.'
        }
      },
      step_4: {
        prompt: 'Đóng Ticket #39: tạo composite index cho trang "hoạt động của tôi" — bảng <code>fact_post_action</code>, lọc theo <code>user_id</code> rồi <code>action_type</code> (đúng thứ tự đó!). Tên index: <code>idx_act_user_type</code>.',
        schema: {
          table_name: 'fact_post_action',
          columns: [
            { name: 'action_id', type: 'INT', key: 'PK' },
            { name: 'user_id', type: 'INT', key: '🔑 Họ' },
            { name: 'date_id', type: 'CHAR(2)', key: '' },
            { name: 'action_type', type: 'VARCHAR', key: '🔑 Tên' },
            { name: 'act_count', type: 'INT', key: '' }
          ],
          data: [
            ['1', '7',  'D1', 'like',    '3'],
            ['2', '9',  'D1', 'comment', '2'],
            ['3', '7',  'D2', 'like',    '5'],
            ['4', '12', 'D2', 'post',    '1'],
            ['5', '9',  'D2', 'like',    '4'],
            ['6', '15', 'D3', 'like',    '2'],
            ['7', '7',  'D3', 'comment', '1'],
            ['8', '9',  'D3', 'post',    '1']
          ]
        },
        /* CREATE INDEX composite → scan pending; DDL-guard exact-match;
         * equiv render dải "7·like" (probe_engine_m6b t2/t3 OK). */
        equiv_sql: "SELECT date_id, act_count FROM fact_post_action WHERE user_id = 7 AND action_type = 'like';",
        context: {
          scenario: 'Thứ tự cột trong ngoặc chính là bài học của cả ticket: user_id đứng đầu (query nào của trang này cũng lọc user), action_type đứng sau. Viết ngược là danh bạ xếp Tên-trước-Họ — trang "hoạt động của tôi" trượt prefix ngay.',
          real_world: 'Chọn thứ tự cột composite là câu hỏi phỏng vấn backend kinh điển. Quy tắc thực chiến: cột lọc-bằng (=) ở mọi query đứng trước, cột lọc-khoảng hoặc lọc-tùy-lúc đứng sau.',
          steps: [
            'Cú pháp không đổi: <code>CREATE INDEX tên ON bảng(cột1, cột2);</code>',
            'Tên: <code>idx_act_user_type</code>.',
            'Thứ tự trong ngoặc: <code>(user_id, action_type)</code> — Họ trước, Tên sau.',
            'Khung kết quả minh họa dải "7·like" — engine demo không chạy DDL, đáp án chấm khi Run/Submit.'
          ],
          hint_explore: 'Nhìn lại bảng danh bạ ở Step 3: cụm "7·like" nằm liền là NHỜ user_id đứng trước. Lệnh của bạn quyết định điều đó.',
          expected: 'Khung kết quả minh họa: 2 dòng dải 7·like (D1·3, D2·5).'
        },
        hints: [
          { level: 1, text: 'Giống Ticket #36 nhưng trong ngoặc có HAI cột, cách nhau dấu phẩy.' },
          { level: 2, text: 'Tên index: <code>idx_act_user_type</code>, bảng <code>fact_post_action</code>.' },
          { level: 3, text: 'Thứ tự cột là linh hồn bài này: Họ = <code>user_id</code> đứng TRƯỚC, Tên = <code>action_type</code> đứng sau.' },
          { level: 4, text: '<code class="code">CREATE INDEX idx_act_user_type ON fact_post_action(user_id, action_type);</code>' }
        ],
        expected_sql: 'CREATE INDEX idx_act_user_type ON fact_post_action(user_id, action_type);',
        success_message: 'Ticket #39 đóng — trang "hoạt động của tôi" mượt như bơ! Nhưng Ticket #40 mở ra với dòng chữ lạnh gáy: "dashboard VẪN 6 giây — index có mà như không". Đến lúc bắt máy tự khai: EXPLAIN.',
        xp_reward: 120
      }
    },

    /* ═══════════ tc_20 — Ticket #40 · Capstone: Index × EXPLAIN ═══════════
     * EXPLAIN mô phỏng (user chốt 2026-07-05): output plan in sẵn đúng hình hài Postgres
     * để ĐỌC; phần chạy thật là SELECT. Step-4 bug_fix sargable — probe t4 (fixed chạy OK)
     * + t5 (buggy bị engine trả SAI im lặng → đã chặn UPPER/LOWER thành pending). */
    {
      id: 'tc_20', index: 20,
      title: 'Capstone: EXPLAIN — bắt máy khai nó định làm gì',
      subtitle: 'Index có sẵn mà vẫn ì — lời khai Seq Scan chỉ mặt thủ phạm: hàm bọc quanh cột',
      module: 6, module_title: 'Storage, Indexing & Performance',
      estimated_minutes: 18, xp_reward: 140,
      drag_type: 'chip',
      challenge_type: 'bug_fix',
      drag_map: {
        table: {
          name: 'EXPLAIN (mô phỏng Postgres) — lời khai của máy',
          columns: ['#', 'dòng plan', 'nghĩa là gì'],
          dataRows: [
            ['1', 'Seq Scan on fact_post_action', 'cách lấy dữ liệu: quét tuần tự cả bảng 🐢'],
            ['2', 'cost=0.00..18334.00', 'giá vé ước tính: bắt đầu..kết thúc'],
            ['3', 'rows=1000000', 'máy ĐOÁN số dòng phải xử lý'],
            ['4', "Filter: UPPER(action_type) = 'LIKE'", 'lọc TỪNG dòng sau khi đã khiêng lên ⚠️']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Community · Ticket #40 — CAPSTONE',
        hook: 'Tin dữ: dashboard "tổng like theo user" VẪN 6,2 GIÂY — dù index <code>idx_fact_type</code> trên action_type đã nằm đó từ tuần trước. Index có mà như không?! Ticket #40 dạy chiêu cuối của Module 6: <strong>đừng đoán — bắt máy KHAI</strong>. Gõ <code>EXPLAIN</code> trước query, máy nộp bản kế hoạch: đi đường nào, tốn bao nhiêu, bao nhiêu dòng. Và bản khai lần này chỉ thẳng mặt thủ phạm: một chiếc <em>hàm bọc quanh cột</em> đã bịt mắt index. (Engine demo không chạy EXPLAIN — các bản plan trong bài là <em>mô phỏng đúng định dạng Postgres</em> để bạn tập đọc.)'
      },
      step_1: {
        primer: {
          goal: [
            'EXPLAIN = bản KẾ HOẠCH máy nộp trước khi chạy: node (đi đường nào) · cost (giá vé ước tính) · rows (đoán số dòng)',
            'Seq Scan + Filter = quét cả bảng rồi lọc từng dòng · Index Scan = đi lối tắt qua cây',
            'Index xếp theo GIÁ TRỊ CỘT — bọc hàm quanh cột (UPPER, ngày cộng trừ…) là index mù: sửa QUERY, đừng vội thêm index'
          ],
          intro: 'Đọc bản khai như đọc vé máy bay. Dòng đầu — <strong>node</strong>: máy đi đường nào (<code>Seq Scan</code> = lật sổ từ bìa; <code>Index Scan using idx…</code> = leo cây 3 tầng của Ticket #38). <code>cost=0.00..18334</code> — giá vé ƯỚC TÍNH từ lúc khởi hành tới lúc xong (đơn vị nội bộ, để SO SÁNH các đường, không phải giây). <code>rows=1000000</code> — máy ĐOÁN phải xử lý bао nhiêu dòng. Và dòng đắt giá nhất hôm nay: <code>Filter: UPPER(action_type) = \'LIKE\'</code> — nghĩa là máy khiêng TỪNG dòng lên rồi mới lọc. Vì sao không dùng index? Cây idx_fact_type xếp theo <code>action_type</code> — chứ không xếp theo <code>UPPER(action_type)</code>. Bọc hàm quanh cột là phát cho index một cặp kính mù.',
          example: "Cùng kết quả, hai bản khai: TRƯỚC — Seq Scan, cost=0.00..18334, Filter: UPPER(action_type)='LIKE' → 6,2s. SAU khi bỏ UPPER — Index Scan using idx_fact_type, cost=0.43..912, Index Cond: action_type='like' → 0,3s. Không thêm index nào — chỉ sửa MỘT dòng WHERE."
        },
        concept_cards: [
          {
            icon: 'fa-file-lines',
            title: 'Đọc bản khai: node → cost → rows',
            body: 'Node nói CÁCH đi (Seq Scan / Index Scan / Bitmap Heap Scan…). Cost nói giá vé ước tính — con số đầu là chi phí trước dòng kết quả đầu tiên, con số sau là trọn gói. Rows là số dòng máy ĐOÁN (dựa thống kê) — và chính nó quyết định ĐƯỜNG đi: dải cần lấy đủ NHỎ thì index thắng; lấy gần cả bảng thì Seq Scan lại là lựa chọn đúng của máy.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 15/16 — Query Processing & Optimization (EXPLAIN)'
          },
          {
            icon: 'fa-glasses',
            title: 'Sargable — đừng bịt mắt index',
            body: 'Index tra được khi vế cột đứng TRẦN TRỤI một bên phép so sánh: <code>action_type = \'like\'</code> ✓. Bọc hàm — <code>UPPER(action_type)</code>, <code>date + 7</code> — là cây phải tính hàm cho TỪNG dòng mới so được: hết đường tra. Chuyển phép biến đổi sang vế HẰNG SỐ (hoặc sửa dữ liệu từ gốc) là nghề của backend có sạn.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Quy trình thực chiến khi có query ì: (1) EXPLAIN — nhìn node; (2) thấy Seq Scan + Filter trên cột ĐÃ có index → soi WHERE tìm hàm bọc/kiểu lệch; (3) sửa query cho sargable; (4) EXPLAIN lại — node đổi thành Index Scan là thắng. Thêm index chỉ là phương án khi index CHƯA có.'
          }
        ],
        visual: {
          schema: {
            table_name: 'hai bản khai — cùng kết quả, khác số phận',
            columns: [
              { name: 'TRƯỚC', type: "UPPER(action_type)='LIKE'", key: '🐢', icon: '📋' },
              { name: 'SAU', type: "action_type='like'", key: '🚀', icon: '📋' }
            ]
          },
          data_preview: [
            ['Seq Scan on fact_post_action', 'Index Scan using idx_fact_type'],
            ['cost=0.00..18334.00', 'cost=0.43..912.00'],
            ['rows=1000000 · Filter: UPPER(…)', "rows=38000 · Index Cond: ='like'"],
            ['dashboard: 6,2 giây 🐢', 'dashboard: 0,3 giây 🚀']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: "Bản khai: <code>Seq Scan on fact_post_action (cost=0.00..18334) Filter: UPPER(action_type)='LIKE'</code> — máy đang thú nhận điều gì?",
            options: [
              { id: 'a', text: 'Nó sẽ quét TUẦN TỰ cả bảng, khiêng từng dòng lên rồi mới lọc bằng hàm — index không được dùng', correct: true, explanation: 'Đúng — Seq Scan + Filter là cặp bài trùng "lật sổ từ bìa rồi soi từng dòng". Có chữ Filter trên cột đã-có-index là đèn đỏ.' },
              { id: 'b', text: 'Nó đã chạy xong query hết 18334 giây', correct: false, explanation: 'Sai hai lần — cost là ƯỚC TÍNH trước khi chạy, và đơn vị là điểm nội bộ để so sánh, không phải giây.' },
              { id: 'c', text: 'Nó sẽ dùng index nhưng giấu tên index đi', correct: false, explanation: 'Sai — dùng index thì node ghi rõ "Index Scan using tên_index". Seq Scan nghĩa là KHÔNG.' },
              { id: 'd', text: 'Bảng fact_post_action bị hỏng nên phải quét lại', correct: false, explanation: 'Sai — Seq Scan là lựa chọn kế hoạch bình thường, không phải tín hiệu hỏng hóc.' }
            ]
          },
          {
            question: "Sửa WHERE thành <code>action_type = 'like'</code>, bản khai mới: <code>Index Scan using idx_fact_type (cost=0.43..912) rows=38000</code>. Vì sao nhanh gấp ~20 lần dù vẫn đụng 38 nghìn dòng?",
            options: [
              { id: 'a', text: 'Cây dẫn thẳng tới dải lá chứa "like" — máy chỉ đọc các trang liên quan, khỏi khiêng 962 nghìn dòng còn lại lên để rồi vứt', correct: true, explanation: 'Đúng — leo cây (Ticket #38) + đi dải lá: chi phí tỷ lệ với số dòng CẦN, không phải số dòng CÓ. Chiều ngược cũng phải nhớ: điều kiện lấy GẦN CẢ bảng thì Seq Scan mới là đường rẻ — planner tự so cost hai lối (khóa Nâng cao mổ xẻ tiếp).' },
              { id: 'b', text: 'Vì Postgres thưởng tốc độ cho query viết đúng chính tả', correct: false, explanation: 'Sai — không có hệ thưởng phạt nào; chỉ có đường đi ngắn hơn.' },
              { id: 'c', text: 'Vì kết quả lần này ít dòng hơn hẳn lần trước', correct: false, explanation: 'Sai — cùng kết quả! Khác nhau ở số dòng phải KHIÊNG để lọc ra kết quả đó.' },
              { id: 'd', text: 'Vì index vừa được xây lại nên còn nóng', correct: false, explanation: 'Sai — idx_fact_type nằm đó từ tuần trước; nó chỉ vừa được THÁO KÍNH MÙ.' }
            ]
          }
        ],
        mini_game: {
          type: 'bug_spot',
          title: 'Soi bản khai — dòng nào tố cáo?',
          instruction: 'Bản EXPLAIN của dashboard 6,2s đây. Click DÒNG cho biết vì sao index bị bỏ xó.',
          xp: 25,
          code: "EXPLAIN SELECT user_id, SUM(act_count)\n       FROM fact_post_action ...;\n----------------------------------------\nSeq Scan on fact_post_action\n  (cost=0.00..18334.00 rows=1000000)\n  Filter: UPPER(action_type) = 'LIKE'",
          bugType: 'performance',
          bugs: [
            { line: 6, description: "Chính nó — Filter: UPPER(action_type) = 'LIKE'. Index xếp theo action_type, KHÔNG xếp theo UPPER(action_type) → máy đành quét cả bảng rồi tính hàm cho từng dòng. Bỏ hàm bọc cột là index mở mắt lại ngay." }
          ]
        }
      },
      step_3: {
        mission: 'Giải phẫu bản khai Seq Scan — gắn từng mảnh lời khai vào đúng ý nghĩa. Có một khối bịa.',
        blocks: [
          { type: 'op', token: 'rows=1000000 — máy ĐOÁN số dòng phải xử lý, dựa trên thống kê (không phải đo thật)', slot: 'ex-rows' },
          { type: 'op', token: "Filter: UPPER(action_type) = 'LIKE' — khiêng TỪNG dòng lên rồi mới lọc bằng hàm", slot: 'ex-filter' },
          { type: 'op', token: 'Seq Scan on fact_post_action — cách lấy dữ liệu: quét tuần tự cả bảng, không đi qua index nào', slot: 'ex-node' },
          { type: 'op', token: 'cost=0.00..18334.00 — số dòng máy đã XÓA khỏi bảng trong lần dọn dẹp gần nhất', slot: 'ex-x' },
          { type: 'op', token: 'cost=0.00..18334.00 — giá vé ƯỚC TÍNH: trước dòng đầu tiên .. trọn gói (điểm nội bộ để so đường đi)', slot: 'ex-cost' }
        ],
        drop_zones: [
          { id: 'ex-node', placeholder: 'Dòng 1 — máy đi ĐƯỜNG nào?', accepts: ['op'], multi: false,
            station: { icon: '🧭', label: 'Node', sub: 'Cách lấy dữ liệu', hint: 'Seq Scan / Index Scan / Bitmap Heap Scan — chữ đầu tiên của bản khai luôn là con đường.' } },
          { id: 'ex-cost', placeholder: 'Giá vé ước tính', accepts: ['op'], multi: false,
            station: { icon: '💰', label: 'Cost', sub: 'khởi hành..trọn gói', hint: 'Hai con số: chi phí trước dòng kết quả đầu tiên, và trọn chuyến. Đơn vị nội bộ — để SO SÁNH.' } },
          { id: 'ex-rows', placeholder: 'Máy đoán bao nhiêu dòng?', accepts: ['op'], multi: false,
            station: { icon: '📏', label: 'Rows', sub: 'Ước lượng', hint: 'Đoán từ thống kê — đoán lệch xa thực tế cũng là manh mối chẩn bệnh.' } },
          { id: 'ex-filter', placeholder: 'Và dòng tố cáo thủ phạm', accepts: ['op'], multi: false,
            station: { icon: '🧹', label: 'Filter', sub: 'Lọc sau khi khiêng', hint: 'Filter = lọc TỪNG dòng sau khi đã đọc lên — thấy nó trên cột có index là đèn đỏ.' } }
        ],
        expected_sql: "Seq Scan on fact_post_action — cách lấy dữ liệu: quét tuần tự cả bảng, không đi qua index nào cost=0.00..18334.00 — giá vé ƯỚC TÍNH: trước dòng đầu tiên .. trọn gói (điểm nội bộ để so đường đi) rows=1000000 — máy ĐOÁN số dòng phải xử lý, dựa trên thống kê (không phải đo thật) Filter: UPPER(action_type) = 'LIKE' — khiêng TỪNG dòng lên rồi mới lọc bằng hàm",
        expected_zones: {
          'ex-node': 'Seq Scan on fact_post_action — cách lấy dữ liệu: quét tuần tự cả bảng, không đi qua index nào',
          'ex-cost': 'cost=0.00..18334.00 — giá vé ƯỚC TÍNH: trước dòng đầu tiên .. trọn gói (điểm nội bộ để so đường đi)',
          'ex-rows': 'rows=1000000 — máy ĐOÁN số dòng phải xử lý, dựa trên thống kê (không phải đo thật)',
          'ex-filter': "Filter: UPPER(action_type) = 'LIKE' — khiêng TỪNG dòng lên rồi mới lọc bằng hàm"
        },
        reveal_hints: {
          'ex-node': 'Dòng đầu bản khai luôn là <strong>con đường</strong> — Seq Scan nghĩa là lật sổ từ bìa.',
          'ex-cost': 'Cost = <strong>giá vé ước tính</strong> hai chặng. Khối "số dòng đã xóa" là bịa — EXPLAIN không kể chuyện dọn dẹp.',
          'ex-rows': 'Rows = <strong>máy đoán</strong> — từ thống kê, không phải đếm thật.',
          'ex-filter': 'Filter = <strong>lọc sau khi khiêng</strong> — trên cột đã có index thì đây chính là dòng tố cáo.'
        }
      },
      step_4: {
        prompt: '<strong>Ticket #40 — màn chốt:</strong> đây là query dashboard 6,2 giây. Index <code>idx_fact_type ON fact_post_action(action_type)</code> nằm sẵn. Bản khai vừa đọc đã chỉ mặt dòng WHERE — <strong>tháo kính mù cho index</strong> (giá trị trong bảng là chữ thường <code>like</code>).',
        challenge_type: 'bug_fix',
        buggy: "SELECT user_id, SUM(act_count) AS total_act\nFROM fact_post_action\nWHERE UPPER(action_type) = 'LIKE'\nGROUP BY user_id\nORDER BY total_act DESC;",
        buggy_line: 2,
        schema: {
          table_name: 'fact_post_action',
          columns: [
            { name: 'action_id', type: 'INT', key: 'PK' },
            { name: 'user_id', type: 'INT', key: '' },
            { name: 'date_id', type: 'CHAR(2)', key: '' },
            { name: 'action_type', type: 'VARCHAR', key: '🔑 idx_fact_type' },
            { name: 'act_count', type: 'INT', key: '' }
          ],
          data: [
            ['1', '7',  'D1', 'like',    '3'],
            ['2', '9',  'D1', 'comment', '2'],
            ['3', '7',  'D2', 'like',    '5'],
            ['4', '12', 'D2', 'post',    '1'],
            ['5', '9',  'D2', 'like',    '4'],
            ['6', '15', 'D3', 'like',    '2'],
            ['7', '7',  'D3', 'comment', '1'],
            ['8', '9',  'D3', 'post',    '1']
          ]
        },
        context: {
          scenario: 'Sửa xong, bản khai mô phỏng đổi thành: <code>Index Scan using idx_fact_type (cost=0.43..912) Index Cond: action_type=\'like\'</code> — dashboard 6,2s → 0,3s. Không thêm index nào, chỉ MỘT dòng WHERE.',
          real_world: 'Lỗi "hàm bọc cột" đứng đầu danh sách nguyên nhân query ì trong code thật — thường lẻn vào từ thói quen "cứ UPPER cho chắc". Chữa từ gốc: chuẩn hóa dữ liệu khi GHI (lưu toàn chữ thường), thì lúc ĐỌC khỏi bọc hàm.',
          steps: [
            'Dòng tô đỏ: WHERE đang bọc UPPER( ) quanh action_type.',
            'Dữ liệu trong bảng vốn là chữ thường: like, comment, post.',
            "Bỏ hàm bọc, so trần trụi: action_type = 'like'.",
            'Các dòng khác giữ nguyên — SUM/GROUP BY/ORDER BY không có tội.'
          ],
          hint_explore: 'Chạy thử trước khi sửa để xem engine nói gì — rồi sửa dòng đỏ và chạy lại, bảng kết quả thật sẽ hiện ra.',
          expected: 'Kết quả sau sửa: user 7 → 8, user 9 → 4, user 15 → 2 (tổng act_count các dòng like).'
        },
        hints: [
          { level: 1, text: 'Bản khai Step 3 tố dòng nào? Filter: UPPER(action_type) — hàm đang bọc quanh cột có index.' },
          { level: 2, text: 'Index xếp theo <code>action_type</code>, không xếp theo <code>UPPER(action_type)</code> — bỏ lớp bọc đi.' },
          { level: 3, text: "Giá trị trong bảng là chữ thường: so thẳng với <code>'like'</code> (viết thường, trong nháy đơn)." },
          { level: 4, text: "Dòng WHERE đúng: <code>WHERE action_type = 'like'</code> — các dòng khác giữ nguyên." }
        ],
        expected_sql: "SELECT user_id, SUM(act_count) AS total_act FROM fact_post_action WHERE action_type = 'like' GROUP BY user_id ORDER BY total_act DESC;",
        success_message: 'TICKET #40 ĐÓNG — MODULE 6 HOÀN TẤT! Bạn đã đi trọn tầng hầm: tháp lưu trữ → giá vé I/O → buffer → trang & RID → row/column → index → B+-Tree → composite/bitmap → và hôm nay là EXPLAIN, chiếc đèn soi tất cả. Còn đúng MỘT bài: hồ sơ CHUYÊN ÁN TỐT NGHIỆP vừa đặt lên bàn — "Social Graph Detective": 4 vụ án liên hoàn, dùng mọi vũ khí của cả ba module. Hẹn ở phòng thẩm vấn. 🕵️',
        xp_reward: 140
      }
    },

    /* ═══════════ tc_21 — BOSS · Social Graph Detective (TỐT NGHIỆP) ═══════════
     * User chốt 2026-07-05: "1 đường dây, 4 vụ liên hoàn" + vỏ hồ sơ/dấu/manh mối
     * (l.boss → applyBossSkin). Case 2↔3 hoán vị so với phác thảo ban đầu vì khung
     * 4 bước: thẩm vấn MCQ/EXPLAIN nằm ở bước 2, kéo-thả CTE ở bước 3.
     * Engine: step-3 CTE zones (như tc_04, scan pending) + expected_zones;
     * step-4 SELECT thật (probe_engine_m6b t6/t9: HAVING >= + ORDER BY alias OK).
     * Graduation: COURSE_MILESTONES db_design_tc → overlay GAMEHUB COMMUNITY v3.0. */
    {
      id: 'tc_21', index: 21,
      title: 'BOSS · Social Graph Detective — chuyên án tốt nghiệp',
      subtitle: 'Bốn vụ án liên hoàn: khoanh vùng → dựng lối tắt → lần mạng lưới → kết án',
      module: 6, module_title: 'Storage, Indexing & Performance',
      estimated_minutes: 30, xp_reward: 200,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      boss: {
        code: 'CHUYÊN ÁN #GH-2026',
        nav: ['Vụ án 1', 'Vụ án 2', 'Vụ án 3', 'Vụ án 4'],
        cases: [
          {
            tag: 'VỤ ÁN 1/4 · KHOANH VÙNG',
            title: 'Like ảo lúc 2 giờ sáng',
            suspect: 'nhóm tài khoản like dồn dập trong một cửa sổ 5 phút',
            brief: 'Bài quảng cáo lậu leo top đêm qua. Hiện trường: bảng <code>like_log</code> — cửa sổ 02:00 có chùm like dày bất thường. Việc của bạn: đọc biên bản khoanh vùng mà trợ lý đã chạy bằng <code>GROUP BY + HAVING</code>.',
            clue: 'Ba tài khoản lộ mặt: <code>404 · 405 · 406</code> — cùng like ≥ 3 lần trong 5 phút, hồ sơ đăng ký cùng một ngày.'
          },
          {
            tag: 'VỤ ÁN 2/4 · MÁY TRA ÁN QUÁ CHẬM',
            title: 'Tra một nghi phạm mất 12 giây',
            suspect: 'like_log 40 triệu dòng — phòng án chưa có lối tắt',
            brief: 'Muốn soi từng nghi phạm nhưng mỗi lệnh tra quét cả 40 triệu dòng. EXPLAIN đã nộp bản khai — đọc nó, rồi chọn đúng index cho phòng án.',
            clue: 'Index <code>(user_id, window_5m)</code> dựng xong — tra án còn 0,2s. Và chi tiết chết người lộ ra: cả 3 nghi phạm đều được MỜI vào Community bởi tài khoản <code>#401 · seed_master</code>.'
          },
          {
            tag: 'VỤ ÁN 3/4 · LẦN MẠNG LƯỚI',
            title: 'Bạn-của-bạn của seed_master',
            suspect: '#401 và mạng lưới mời mọc nhiều tầng phía dưới',
            brief: 'Bảng <code>invites</code> chỉ ghi từng cặp (ai mời ai). Muốn tóm TOÀN BỘ đường dây phải lần theo nhiều tầng — dựng truy vấn đệ quy xuất phát từ tài khoản gốc 401.',
            clue: 'Mạng lưới 3 tầng, 8 tài khoản: 401 mời 404/405/406, chúng tỏa tiếp 407 → 411. Đủ người — giờ cần CON SỐ để kết án.'
          },
          {
            tag: 'VỤ ÁN 4/4 · HỒ SƠ KẾT ÁN',
            title: 'Con số buộc tội',
            suspect: 'kẻ nào chiêu mộ từ 2 tài khoản trở lên',
            brief: 'Lệnh cuối cùng của chuyên án: đếm số "đàn em" từng kẻ đã mời, giữ kẻ mời ≥ 2, xếp kẻ nặng tội nhất lên đầu — bảng này đóng vào hồ sơ gửi ban quản trị.',
            clue: ''
          }
        ]
      },
      drag_map: {
        table: {
          name: 'invites — ai mời ai vào Community',
          columns: ['invite_id', 'inviter_id', 'invitee_id'],
          dataRows: [
            ['1', '401', '404'],
            ['2', '401', '405'],
            ['3', '401', '406'],
            ['4', '404', '407'],
            ['5', '404', '408'],
            ['6', '405', '409'],
            ['7', '406', '410'],
            ['8', '406', '411']
          ]
        }
      },
      story: {
        tag: '🕵️ CHUYÊN ÁN #GH-2026 · Social Graph Detective — BÀI TỐT NGHIỆP',
        hook: '02:14 đêm qua, chuông cảnh báo reo: một bài quảng cáo lậu leo thẳng TOP TREND nhờ chùm like dày đặc lúc 2 giờ sáng. Admin đặt lên bàn bạn một tập HỒ SƠ đóng dấu MẬT: <strong>4 vụ án liên hoàn</strong> — manh mối vụ trước mở khóa vụ sau. Đây là bài tốt nghiệp Trung cấp: bạn sẽ rút TỪNG vũ khí đã học — <code>HAVING</code> khoanh vùng, <code>Index + EXPLAIN</code> dựng lối tắt, <code>WITH RECURSIVE</code> lần mạng lưới — và khép hồ sơ bằng một lệnh SELECT kết án. Phá xong: GameHub Community v3.0 ra mắt, có tên bạn trong credits.'
      },
      step_1: {
        primer: {
          goal: [
            'Đọc hiện trường: chùm like bất thường dồn vào MỘT cửa sổ 5 phút — dấu vân tay của bot',
            'Khoanh vùng bằng ngưỡng: GROUP BY user_id + HAVING COUNT(*) ≥ 3 (vũ khí Ticket #30)',
            'Kế hoạch chuyên án 4 vụ: khoanh vùng → dựng lối tắt tra án → lần mạng lưới → kết án'
          ],
          intro: 'Hiện trường đây: bảng <code>like_log</code> ghi từng cú like kèm cửa sổ 5 phút (<code>window_5m</code> — kỹ thuật tumbling window của Ticket #30). Người thật rải like cả ngày; bot dội <strong>cả chùm vào một cửa sổ</strong>. Trợ lý đã chạy lệnh khoanh vùng: <code>SELECT user_id, COUNT(*) AS likes_5m FROM like_log WHERE window_5m = \'02:00\' GROUP BY user_id HAVING COUNT(*) >= 3;</code> — gom theo thủ phạm, đếm mật độ, và <code>HAVING</code> chỉ giữ kẻ vượt ngưỡng. Biên bản trả về ba cái tên: <strong>404, 405, 406</strong>. Trùng hợp rợn người: cả ba đăng ký cùng một ngày. Vụ án 1 khép — nhưng nó chỉ là mắt xích đầu của đường dây.',
          example: 'Ngưỡng HAVING là con dao hai lưỡi đã học ở Ticket #30: đặt 2 thì oan dân cuồng game, đặt 5 thì lọt bot rén. Phòng án chốt ≥ 3/5 phút sau khi đo phân phối like của người thật (99,7% < 3).'
        },
        concept_cards: [
          {
            icon: 'fa-magnifying-glass-chart',
            title: 'Vũ khí 1 · Khoanh vùng bằng HAVING',
            body: 'WHERE lọc TỪNG DÒNG trước khi gom; HAVING lọc TỪNG NHÓM sau khi đếm. Truy tìm "kẻ làm việc X quá N lần" luôn là bộ ba: <code>GROUP BY thủ_phạm</code> → <code>COUNT(*)</code> → <code>HAVING ≥ ngưỡng</code>. Bạn sẽ tự tay viết lại bộ ba này ở Vụ án 4.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 3 & 5 — Aggregation (HAVING) · Recursive Queries'
          },
          {
            icon: 'fa-route',
            title: 'Kế hoạch chuyên án — 4 vụ, 3 module',
            body: 'Vụ 1 khoanh vùng (M5 · HAVING) → Vụ 2 dựng lối tắt tra án (M6 · Index + EXPLAIN) → Vụ 3 lần mạng lưới nhiều tầng (M4 · WITH RECURSIVE) → Vụ 4 lệnh kết án (SELECT tổng hợp chạy thật). Manh mối vụ trước nằm ngay đầu hồ sơ vụ sau — đừng bỏ qua khung màu vàng.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Nhìn biên bản bên cạnh: vì sao user 7 (minhkiller) thoát án dù cũng like lúc 02:00? Vì mật độ 1 like/5 phút là hành vi người thật — ngưỡng HAVING ≥ 3 để yên cho anh ta. Khoanh vùng đúng = bắt gọn bot, không oan dân.'
          }
        ],
        visual: {
          schema: {
            table_name: 'BIÊN BẢN KHOANH VÙNG — like_log @ 02:00',
            columns: [
              { name: 'user_id', type: 'nghi phạm', key: '🎯', icon: '🕵️' },
              { name: 'likes_5m', type: 'COUNT(*) trong cửa sổ', key: '≥3', icon: '📊' }
            ]
          },
          data_preview: [
            ['404', '3 like / 5 phút — VƯỢT NGƯỠNG 🚨'],
            ['405', '3 like / 5 phút — VƯỢT NGƯỠNG 🚨'],
            ['406', '3 like (cửa sổ 02:05) — VƯỢT NGƯỠNG 🚨'],
            ['7 · minhkiller', '1 like — dân thường, loại khỏi hồ sơ ✓']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Phòng án tra nghi phạm đầu tiên, máy khai: <code>Seq Scan on like_log (cost=0.00..812000 rows=40000000) Filter: user_id = 404</code> — và chạy mất 12 giây. Bản khai nói gì?',
            options: [
              { id: 'a', text: 'Máy quét TUẦN TỰ cả 40 triệu dòng rồi lọc từng dòng — like_log chưa có index trên user_id nên không có lối tắt nào để đi', correct: true, explanation: 'Đúng — Seq Scan + Filter trên 40M dòng cho MỘT nghi phạm: bài học Ticket #36/#40 hiện nguyên hình. Phòng án cần mục lục.' },
              { id: 'b', text: 'Tài khoản 404 có 40 triệu cú like nên đọc lâu là phải', correct: false, explanation: 'Sai — rows=40M là số dòng máy phải QUÉT, không phải số like của 404 (hắn chỉ có vài chục).' },
              { id: 'c', text: 'cost=812000 nghĩa là truy vấn tốn 812.000 đồng tiền điện', correct: false, explanation: 'Sai — cost là điểm ước tính nội bộ để so sánh đường đi (Ticket #40), không phải tiền.' },
              { id: 'd', text: 'Máy bị hỏng index nên phải quét tạm', correct: false, explanation: 'Sai — không có index nào để hỏng; Seq Scan là lựa chọn DUY NHẤT khi chưa xây mục lục.' }
            ]
          },
          {
            question: 'Phòng án cần tra 2 kiểu: "mọi like của MỘT nghi phạm" và "like của nghi phạm TRONG một cửa sổ". Xây index nào cho <code>like_log</code>?',
            options: [
              { id: 'a', text: 'Composite (user_id, window_5m) — đủ Họ là tra được kiểu 1, đủ Họ+Tên là trúng dải kiểu 2: một index phục vụ cả hai (leftmost prefix)', correct: true, explanation: 'Đúng — bài học Ticket #39: cột lọc-ở-mọi-query đứng đầu. Một cây, hai kiểu tra.' },
              { id: 'b', text: 'Composite (window_5m, user_id) — cửa sổ đứng trước cho dễ nhìn', correct: false, explanation: 'Sai — tra "mọi like của một nghi phạm" sẽ THIẾU cột đầu → trượt prefix, quét sổ như cũ.' },
              { id: 'c', text: 'Index đơn trên post_id — bài bị like ảo mới là trung tâm vụ án', correct: false, explanation: 'Sai — hai query của phòng án lọc theo user_id/window_5m; index post_id không đỡ được query nào.' },
              { id: 'd', text: 'Khỏi index — mua thêm RAM là 40 triệu dòng nằm gọn trong buffer', correct: false, explanation: 'Sai — nằm trong RAM vẫn phải QUÉT đủ 40M dòng mỗi lần tra (Ticket #38 MCQ đã vạch trần chiêu này).' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Lối tắt (user_id, window_5m) cứu lệnh tra nào?',
          instruction: 'Index của phòng án đã dựng. Kéo từng lệnh tra vào đúng giỏ — nhớ luật danh bạ Họ-rồi-Tên.',
          xp: 25,
          chips: [
            { id: 'p1', label: 'WHERE user_id = 404 (soi trọn hồ sơ một nghi phạm)' },
            { id: 'p2', label: "WHERE user_id = 405 AND window_5m = '02:00'" },
            { id: 'p3', label: "WHERE window_5m = '02:00' (cả cửa sổ, mọi user)" },
            { id: 'p4', label: 'WHERE post_id = 900 (lần theo bài bị bơm like)' }
          ],
          bins: [
            { id: 'hit',  label: 'TRÚNG DẢI 🎯' },
            { id: 'miss', label: 'TRƯỢT — quét sổ 🐢' }
          ],
          solution: { p1: 'hit', p2: 'hit', p3: 'miss', p4: 'miss' }
        }
      },
      step_3: {
        mission: 'Vụ án 3: lần TOÀN BỘ mạng lưới mời mọc từ tài khoản gốc 401 — tầng nào cũng phải tóm. Lắp truy vấn đệ quy; có một khối bịa.',
        blocks: [
          { type: 'op', token: 'SELECT i.invitee_id FROM invites i JOIN ring r ON i.inviter_id = r.invitee_id', slot: 'cte-step' },
          { type: 'kw', token: 'WITH RECURSIVE ring AS (', slot: 'cte-head' },
          { type: 'op', token: 'SELECT * FROM invites ORDER BY RANDOM() — xáo hồ sơ lên, ai đen thì lộ', slot: 'cte-x' },
          { type: 'op', token: 'SELECT invitee_id FROM invites WHERE inviter_id = 401', slot: 'cte-anchor' },
          { type: 'kw', token: ') SELECT * FROM ring;', slot: 'cte-final' },
          { type: 'kw', token: 'UNION ALL', slot: 'cte-union' }
        ],
        drop_zones: [
          { id: 'cte-head', placeholder: 'WITH ____ — mở sổ truy nã lặp lại được', accepts: ['kw'], acceptedKeywords: ['WITH'], multi: false },
          { id: 'cte-anchor', placeholder: 'anchor — tầng 1: ai được 401 mời TRỰC TIẾP?', accepts: ['op'], multi: false },
          { id: 'cte-union', placeholder: 'nối tầng 1 với các tầng lần ra sau', accepts: ['kw'], multi: false },
          { id: 'cte-step', placeholder: 'bước đệ quy — người trong sổ mời tiếp ai?', accepts: ['op'], multi: false },
          { id: 'cte-final', placeholder: ') đọc toàn bộ sổ truy nã', accepts: ['kw'], multi: false }
        ],
        expected_sql: 'WITH RECURSIVE ring AS ( SELECT invitee_id FROM invites WHERE inviter_id = 401 UNION ALL SELECT i.invitee_id FROM invites i JOIN ring r ON i.inviter_id = r.invitee_id ) SELECT * FROM ring;',
        expected_zones: {
          'cte-head': 'WITH RECURSIVE ring AS (',
          'cte-anchor': 'SELECT invitee_id FROM invites WHERE inviter_id = 401',
          'cte-union': 'UNION ALL',
          'cte-step': 'SELECT i.invitee_id FROM invites i JOIN ring r ON i.inviter_id = r.invitee_id',
          'cte-final': ') SELECT * FROM ring;'
        },
        reveal_hints: {
          'cte-head': 'Mở sổ truy nã bằng <strong>WITH RECURSIVE ring AS (</strong> — đúng vũ khí Ticket #24.',
          'cte-anchor': 'Tầng 1 = hàng mồi: <strong>ai được 401 mời trực tiếp</strong> (WHERE inviter_id = 401). Khối "ORDER BY RANDOM()" là bịa — xáo hồ sơ không phải điều tra.',
          'cte-union': '<strong>UNION ALL</strong> — chồng tầng mới lần ra lên các tầng đã có.',
          'cte-step': 'Bước đệ quy: <strong>JOIN với chính ring</strong> — "người ĐÃ trong sổ mời tiếp ai?" chạy đến khi không lần thêm được.',
          'cte-final': 'Đóng ngoặc rồi <strong>SELECT * FROM ring;</strong> — đọc trọn mạng lưới 3 tầng.'
        }
      },
      step_4: {
        prompt: '<strong>Vụ án 4 — lệnh kết án:</strong> từ bảng <code>invites</code>, đếm mỗi kẻ đã mời bao nhiêu tài khoản (đặt tên cột đếm là <code>recruits</code>), chỉ giữ kẻ mời <strong>từ 2 trở lên</strong>, xếp kẻ nặng tội nhất lên đầu.',
        schema: {
          table_name: 'invites',
          columns: [
            { name: 'invite_id', type: 'INT', key: 'PK' },
            { name: 'inviter_id', type: 'INT', key: '🔎 kẻ mời' },
            { name: 'invitee_id', type: 'INT', key: 'người được mời' }
          ],
          data: [
            ['1', '401', '404'],
            ['2', '401', '405'],
            ['3', '401', '406'],
            ['4', '404', '407'],
            ['5', '404', '408'],
            ['6', '405', '409'],
            ['7', '406', '410'],
            ['8', '406', '411']
          ]
        },
        context: {
          scenario: 'Bảng kết quả này đóng thẳng vào hồ sơ gửi ban quản trị: ai chiêu mộ bao nhiêu, kẻ nào cầm đầu. Đây là bộ ba khoanh-vùng của Vụ án 1 — nhưng lần này chính TAY BẠN viết, trên dữ liệu mạng lưới vừa lần ra ở Vụ án 3.',
          real_world: 'Trust & Safety của các mạng xã hội thật săn bot ring đúng quy trình này: ngưỡng hành vi (HAVING) → đồ thị quan hệ (recursive/graph) → bảng buộc tội xếp hạng (aggregate + ORDER BY).',
          steps: [
            'Đếm theo kẻ mời: GROUP BY inviter_id, COUNT(*) đặt tên recruits.',
            'Ngưỡng buộc tội: HAVING COUNT(*) >= 2 — mời lẻ 1 người chưa đủ kết luận.',
            'Kẻ nặng tội nhất lên đầu: ORDER BY recruits DESC.',
            'Đối chiếu hồ sơ: 401 mời 3 · 404 mời 2 · 406 mời 2 · (405 mời 1 — thoát ngưỡng).'
          ],
          hint_explore: 'Khám phá trước: <code>SELECT * FROM invites</code> rồi Run — đếm bằng mắt xem ai xuất hiện ở cột inviter_id nhiều nhất.',
          expected: 'Bảng kết án 3 dòng: 401·3, 404·2, 406·2 — seed_master đứng đầu.'
        },
        hints: [
          { level: 1, text: 'Bộ ba khoanh vùng của Vụ án 1: GROUP BY thủ phạm → COUNT(*) → HAVING ngưỡng. Thủ phạm ở đây là cột nào?' },
          { level: 2, text: 'Đếm và đặt tên: <code>COUNT(*) AS recruits</code>. Gom theo <code>inviter_id</code>.' },
          { level: 3, text: 'Ngưỡng ≥ 2 đặt ở <code>HAVING COUNT(*) >= 2</code> (lọc NHÓM, không phải WHERE). Nặng tội nhất lên đầu: <code>ORDER BY recruits DESC</code>.' },
          { level: 4, text: '<code class="code">SELECT inviter_id, COUNT(*) AS recruits FROM invites GROUP BY inviter_id HAVING COUNT(*) >= 2 ORDER BY recruits DESC;</code>' }
        ],
        expected_sql: 'SELECT inviter_id, COUNT(*) AS recruits FROM invites GROUP BY inviter_id HAVING COUNT(*) >= 2 ORDER BY recruits DESC;',
        success_message: 'CHUYÊN ÁN #GH-2026 KHÉP HỒ SƠ — cả đường dây seed_master bị trục xuất, bài quảng cáo lậu rớt khỏi top trong 5 phút. Bạn vừa dùng trọn vũ khí của cả ba module trong MỘT cuộc điều tra: HAVING khoanh vùng, EXPLAIN + Index dựng lối tắt, WITH RECURSIVE lần mạng lưới, và lệnh SELECT kết án. TỐT NGHIỆP TRUNG CẤP — GameHub Community v3.0 ra mắt, tên bạn nằm trong credits. 🎓🕵️',
        xp_reward: 200
      }
    }
  ]
};
