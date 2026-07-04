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
          items: [
            { id: 'j1', label: '1. Mở Connection (connection string + driver)' },
            { id: 'j2', label: '2. prepareStatement("SELECT … WHERE user_id = ?")' },
            { id: 'j3', label: '3. setInt(1, userId) — gắn tham số vào placeholder' },
            { id: 'j4', label: '4. executeQuery() → nhận ResultSet' },
            { id: 'j5', label: '5. while (rs.next()) — đọc từng dòng' },
            { id: 'j6', label: '6. close() — trả kết nối về pool' }
          ]
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
    }
  ]
};
