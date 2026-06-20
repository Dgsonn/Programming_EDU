/* ============================================================================
 * LESSON_CONTENT — Database Design course
 * 4-step pipeline data: Step 1 (Theory+Visual) → Step 2 (MCQ) →
 *                       Step 3 (Hybrid Drag-Query + Reveal) → Step 4 (Pure Code)
 *
 * Bài 1 (Entity Set & Primary Key) có content đầy đủ.
 * Bài 2-10 giữ skeleton (title + module + estimated_minutes) — team sẽ fill
 * content sau bằng cách copy pattern từ Bài 1.
 *
 * Schema cho mỗi step:
 *   step_1: { primer: {goal, intro, example}, visual: {schema, data_preview}, mission }
 *   step_2: { question, options: [{id, text, correct}] }
 *   step_3: { blocks: [{type, token, slot}], drop_zones, expected_sql, reveal_hints }
 *   step_4: { prompt, schema, expected_sql, hints, success_message, xp_reward }
 *
 * Block types: 'kw' (keyword) | 'col' (column) | 'tbl' (table) | 'op' (operator) | 'val' (value)
 * ============================================================================ */

window.LESSON_CONTENT = window.LESSON_CONTENT || {};

window.LESSON_CONTENT['db_design'] = {
  course_id: 'db_design',
  course_title: 'Database Design',
  accent_color: '#06B6D4',
  module_color: '#06B6D4',
  total_lessons: 10,
  lessons: [
    /* ========================================================================
     * BÀI 1 — Entity Set & Primary Key [REALIGN v3]
     * Concept: PDF Bài 1 — data vẫn Game Shop
     * drag_type: chip | challenge_type: mcq_code
     * Layer 0 compact 5-line primer, 2 MCQ + mini-game bonus
     * ======================================================================== */
    {
      id: 'db_01',
      index: 1,
      title: 'Entity Set & Primary Key',
      subtitle: 'Khóa chính — định danh duy nhất cho mỗi thực thể',
      module: 1,
      module_title: 'Giới thiệu & Nền tảng Database',
      estimated_minutes: 18,
      xp_reward: 50,
      project_piece: '🗝️ Mở khóa "Huy hiệu Lập trình viên Cơ sở"',
      drag_type: 'chip',
      challenge_type: 'mcq_code',

      /* ----- STEP 1: Theory (Layer 0 + Layer 1) ----- */
      step_1: {
        primer: {
          goal: [
            'Entity Set = Table',
            'Primary Key (PK) = cột định danh duy nhất',
            'Dùng PK trong WHERE để lấy chính xác 1 record'
          ],
          intro: 'Trong CSDL quan hệ, mỗi <strong>Entity Set</strong> = 1 table. Mỗi dòng = 1 thực thể (entity), mỗi cột = 1 thuộc tính (attribute). <strong>Primary Key (PK)</strong> là cột đảm bảo mỗi dòng có giá trị <em>DUY NHẤT</em> — không trùng, không NULL.',
          example: 'Bảng <code class="code">game_catalog</code> dưới đây có cột <code class="code">id</code> làm PK. Hai game có thể trùng tên (Elden Ring xuất hiện 2 lần ở 2 thể loại), nhưng <code class="code">id</code> thì không bao giờ trùng — vì vậy dùng <code class="code">id</code> trong WHERE sẽ chốt được đúng 1 dòng.'
        },
        visual: {
          schema: {
            table_name: 'game_catalog',
            columns: [
              { name: 'id',     type: 'INT',      key: 'PK', icon: '🔑' },
              { name: 'name',   type: 'VARCHAR',  key: '',   icon: '' },
              { name: 'genre',  type: 'VARCHAR',  key: '',   icon: '' },
              { name: 'price',  type: 'INT',      key: '',   icon: '' }
            ]
          },
          data_preview: [
            ['101', 'Elden Ring',  'Action RPG',  '60'],
            ['102', 'God of War',  'Action',      '50'],
            ['103', 'Hades',       'Rogue-like',  '25'],
            ['104', 'Elden Ring',  'Card Game',   '15']
          ]
        },
        mission: 'Tìm <code class="code">name</code> và <code class="code">price</code> của game Elden Ring có <code class="code">id = 101</code> — kéo thả khối lệnh xuống dưới ↓'
      },

      /* ----- STEP 2: 2 câu MCQ + 1 mini-game bonus ----- */
      step_2: {
        mcq: [
          {
            question: 'Tại sao cần Primary Key trong một table?',
            options: [
              { id: 'a', text: 'Để format bảng đẹp hơn trên giao diện web', correct: false },
              { id: 'b', text: 'Để đảm bảo mỗi record có định danh duy nhất, không trùng lặp', correct: true },
              { id: 'c', text: 'Để tăng tốc độ hiển thị bảng trên browser', correct: false },
              { id: 'd', text: 'Để giảm dung lượng lưu trữ database', correct: false }
            ]
          },
          {
            question: 'Bảng <code>game_catalog</code> có 2 dòng tên "Elden Ring" (id 101 và 104). Để chỉ lấy bản Action RPG giá 60$ bạn dùng:',
            options: [
              { id: 'a', text: '<code>WHERE name = "Elden Ring"</code> — vì tên phân biệt được', correct: false },
              { id: 'b', text: '<code>WHERE id = 101</code> — dùng PK để chốt đúng 1 record', correct: true },
              { id: 'c', text: '<code>WHERE price = 60</code> — lọc theo giá là đủ', correct: false },
              { id: 'd', text: 'Không cần WHERE — SELECT trả về hết cũng được', correct: false }
            ]
          }
        ],
        mini_game: {
          title: 'Phân loại: cột nào là Primary Key?',
          instruction: 'Trong bảng <code>game_catalog</code>, mỗi thẻ dưới đây là 1 cột. Kéo vào ô <strong style="color:var(--success)">Đây là PK</strong> hoặc <strong style="color:var(--danger)">Không phải PK</strong>.',
          chips: [
            { id: 'c-id',    label: 'id' },
            { id: 'c-name',  label: 'name' },
            { id: 'c-genre', label: 'genre' },
            { id: 'c-price', label: 'price' }
          ],
          bins: [
            { id: 'pk',  label: 'Đây là PK',     correct: 'true' },
            { id: 'not', label: 'Không phải PK', correct: 'false' }
          ],
          solution: {
            'c-id':    'pk',
            'c-name':  'not',
            'c-genre': 'not',
            'c-price': 'not'
          }
        }
      },

      /* ----- STEP 3: Hybrid (Drag-Query + Reveal) ----- */
      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',  slot: 'kw-select' },
          { type: 'col', token: 'name',    slot: 'col-1' },
          { type: 'col', token: 'price',   slot: 'col-2' },
          { type: 'kw',  token: 'FROM',    slot: 'kw-from' },
          { type: 'tbl', token: 'game_catalog', slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',   slot: 'kw-where' },
          { type: 'col', token: 'id',      slot: 'wcol' },
          { type: 'op',  token: '=',       slot: 'op' },
          { type: 'val', token: '101',     slot: 'val' }
        ],
        drop_zones: [
          { id: 'select-line',  placeholder: 'SELECT ____ , ____', accepts: ['kw', 'col'], multi: true },
          { id: 'from-line',    placeholder: 'FROM ____',          accepts: ['kw', 'tbl'], multi: true },
          { id: 'where-line',   placeholder: 'WHERE ____ ____ ____', accepts: ['kw', 'col', 'op', 'val'], multi: true }
        ],
        expected_sql: 'SELECT name, price FROM game_catalog WHERE id = 101;',
        reveal_hints: {
          'select-line': 'Bắt đầu bằng <strong>SELECT</strong>, kéo 2 cột: <strong>name</strong> và <strong>price</strong>.',
          'from-line':   'Tiếp: <strong>FROM</strong> + tên bảng <strong>game_catalog</strong>.',
          'where-line':  'Cuối: <strong>WHERE</strong> lọc đúng 1 dòng bằng PK: <strong>id = 101</strong>.'
        }
      },

      /* ----- STEP 4: MCQ code (chọn SQL đúng từ 4 options) ----- */
      step_4: {
        prompt: 'Khách muốn biết <strong>name</strong> và <strong>price</strong> của game có <code>id = 101</code>. Câu SQL nào dưới đây là ĐÚNG?',
        schema: {
          table_name: 'game_catalog',
          columns: [
            { name: 'id',     type: 'INT',     key: 'PK' },
            { name: 'name',   type: 'VARCHAR', key: '' },
            { name: 'genre',  type: 'VARCHAR', key: '' },
            { name: 'price',  type: 'INT',     key: '' }
          ],
          data: [
            ['101', 'Elden Ring',  'Action RPG',  '60'],
            ['102', 'God of War',  'Action',      '50'],
            ['103', 'Hades',       'Rogue-like',  '25'],
            ['104', 'Elden Ring',  'Card Game',   '15']
          ]
        },
        options: [
          { id: 'a', text: "SELECT * FROM game_catalog;", correct: false, explain: 'Sai: lấy hết cột (*) và KHÔNG có WHERE → trả về cả 4 dòng thay vì 1 dòng Elden Ring id=101.' },
          { id: 'b', text: "SELECT name, price FROM game_catalog WHERE id = 101;", correct: true, explain: 'Đúng! Lấy 2 cột cần + WHERE theo PK → đúng 1 dòng Elden Ring Action RPG giá 60.' },
          { id: 'c', text: "SELECT name FROM game_catalog WHERE id = 101;", correct: false, explain: 'Sai logic: chỉ lấy name, thiếu price. Khách cần cả 2 cột.' },
          { id: 'd', text: "SELECT name, price FROM game_catalog WHERE name = 'Elden Ring';", correct: false, explain: 'Sai logic: WHERE theo name (không phải PK) sẽ trả về CẢ 2 dòng Elden Ring (id 101 + 104).' }
        ],
        expected_sql: "SELECT name, price FROM game_catalog WHERE id = 101;",
        success_message: 'Xuất sắc! Bạn đã nắm vững SELECT-FROM-WHERE — bộ 3 SQL cơ bản nhất. Bài 2 sẽ học cách tách cột phức hợp (địa chỉ) và tính cột dẫn xuất (tuổi từ năm sinh).',
        xp_reward: 30
      }
    },

    /* ========================================================================
     * BÀI 2 — Composite & Derived Attributes [REALIGN v3]
     * Concept: PDF Bài 2 — data vẫn Game Shop (player_profile)
     * drag_type: box | challenge_type: fill_blank
     * ======================================================================== */
    {
      id: 'db_02', index: 2,
      title: 'Composite & Derived Attributes',
      subtitle: 'Tách cột phức hợp (địa chỉ) và tính cột dẫn xuất (tuổi)',
      module: 1, module_title: 'Giới thiệu & Nền tảng Database',
      estimated_minutes: 22, xp_reward: 50,
      project_piece: '🧬 Mở khóa "Hệ thống Hồ sơ Người chơi"',
      drag_type: 'box',
      challenge_type: 'fill_blank',
      drag_map: {
        table: {
          name: 'player_profile',
          columns: ['p_id', 'username', 'address_city', 'address_dist', 'birth_year'],
          dataRows: [
            ['7',  'DragonLord',    'Tokyo',   'Akihabara', '2005'],
            ['8',  'NoobMaster',    'Seattle', 'Bellevue',  '2010'],
            ['9',  'GG_WellPlayed', 'Hanoi',   'Cau Giay',  '1999']
          ]
        }
      },

      step_1: {
        primer: {
          goal: [
            'Composite Attribute = cột ghép từ nhiều cột nhỏ (vd: address = city + district)',
            'Derived Attribute = cột KHÔNG lưu, hệ thống tự tính khi truy vấn (vd: age = 2024 - birth_year)',
            'Dùng AS để đặt tên cột ảo cho giá trị dẫn xuất'
          ],
          intro: 'Trong ER diagram, một thuộc tính có thể là <strong>Composite</strong> (gồm nhiều mảnh: address = city + district + street) hoặc <strong>Derived</strong> (tính toán từ thuộc tính khác: age = currentYear - birthYear). Khi chuyển sang bảng vật lý, ta <em>tách</em> composite thành nhiều cột độc lập, và <em>không lưu</em> derived — chỉ tính khi SELECT.',
          example: 'Bảng <code class="code">player_profile</code> dưới đây đã tách address thành <code>address_city</code> + <code>address_dist</code>. Cột <code>age</code> KHÔNG tồn tại vật lý — sẽ được tính bằng <code>(2024 - birth_year) AS age</code>.'
        },
        visual: {
          schema: {
            table_name: 'player_profile',
            columns: [
              { name: 'p_id',          type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'username',      type: 'VARCHAR', key: '',   icon: '👤' },
              { name: 'address_city',  type: 'VARCHAR', key: '',   icon: '🏙️' },
              { name: 'address_dist',  type: 'VARCHAR', key: '',   icon: '🏘️' },
              { name: 'birth_year',    type: 'INT',     key: '',   icon: '🎂' }
            ]
          },
          data_preview: [
            ['7',  'DragonLord',  'Tokyo',     'Akihabara', '2005'],
            ['8',  'NoobMaster',  'Seattle',   'Bellevue',  '2010'],
            ['9',  'GG_WellPlayed','Hanoi',   'Cau Giay',  '1999']
          ]
        },
        mission: 'Lấy <code>username</code>, 2 mảnh địa chỉ (city + dist) và cột ảo <code>age</code> của người chơi <code>p_id = 7</code> — kéo thả khối lệnh (bao gồm cả cụm tính toán) xuống dưới ↓'
      },

      step_2: {
        mcq: [
          {
            question: 'Thuộc tính Composite (Phức hợp) là gì?',
            options: [
              { id: 'a', text: 'Cột được lưu nhiều giá trị ngăn cách bằng dấu phẩy', correct: false },
              { id: 'b', text: 'Thuộc tính có thể tách thành nhiều thuộc tính nhỏ hơn (vd: address → city + district)', correct: true },
              { id: 'c', text: 'Cột được mã hóa để bảo mật', correct: false },
              { id: 'd', text: 'Cột có giá trị NULL mặc định', correct: false }
            ]
          },
          {
            question: 'Tại sao KHÔNG lưu cột <code>age</code> trong bảng mà tính mỗi lần truy vấn?',
            options: [
              { id: 'a', text: 'Vì cột age quá ngắn, không đáng lưu', correct: false },
              { id: 'b', text: 'Vì age thay đổi theo thời gian — lưu sẽ phải cập nhật liên tục, dễ sai', correct: true },
              { id: 'c', text: 'Vì age không phải số nguyên', correct: false },
              { id: 'd', text: 'Vì age là khóa chính', correct: false }
            ]
          }
        ],
        mini_game: {
          title: 'Phân loại: cột nào là Composite / Derived / Thường?',
          instruction: 'Trong bảng <code>player_profile</code>, mỗi thẻ là 1 cột. Kéo vào ô tương ứng. <br><strong style="color:var(--primary)">Composite</strong> = tách được thành nhiều mảnh · <strong style="color:var(--warning)">Derived</strong> = tính toán được từ cột khác · <strong style="color:var(--text-400)">Thường</strong> = cột độc lập, nguyên tử.',
          chips: [
            { id: 'c-address', label: 'address (gốc ER)' },
            { id: 'c-age',     label: 'age' },
            { id: 'c-birth',   label: 'birth_year' },
            { id: 'c-name',    label: 'username' }
          ],
          bins: [
            { id: 'composite', label: 'Composite (tách được)', correct: 'composite' },
            { id: 'derived',   label: 'Derived (tính toán)',    correct: 'derived' },
            { id: 'normal',    label: 'Thường (độc lập)',      correct: 'normal' }
          ],
          solution: {
            'c-address': 'composite',
            'c-age':     'derived',
            'c-birth':   'normal',
            'c-name':    'normal'
          }
        }
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',           slot: 'kw-select' },
          { type: 'col', token: 'username',         slot: 'col-1' },
          { type: 'col', token: 'address_city',     slot: 'col-2' },
          { type: 'col', token: 'address_dist',     slot: 'col-3' },
          { type: 'fn',  token: '(2024 - birth_year) AS age', slot: 'col-4' },
          { type: 'kw',  token: 'FROM',             slot: 'kw-from' },
          { type: 'tbl', token: 'player_profile',   slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',            slot: 'kw-where' },
          { type: 'col', token: 'p_id',             slot: 'wcol' },
          { type: 'op',  token: '=',                slot: 'op' },
          { type: 'val', token: '7',                slot: 'val' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____ , ____ , ____ , ____', accepts: ['kw', 'col', 'fn'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',                          accepts: ['kw', 'tbl'],     multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',               accepts: ['kw', 'col', 'op', 'val'], multi: true }
        ],
        expected_sql: 'SELECT username, address_city, address_dist, (2024 - birth_year) AS age FROM player_profile WHERE p_id = 7;',
        reveal_hints: {
          'select-line': 'SELECT 4 thứ: <strong>username</strong>, 2 mảnh địa chỉ (<strong>address_city</strong>, <strong>address_dist</strong>), và cụm tính tuổi (<strong>(2024 - birth_year) AS age</strong>).',
          'from-line':   'FROM bảng <strong>player_profile</strong>.',
          'where-line':  'WHERE chốt đúng 1 người: <strong>p_id = 7</strong>.'
        }
      },

      step_4: {
        prompt: 'Hoàn thiện câu SQL dưới đây — điền các từ/cột còn thiếu vào ô trống:',
        schema: {
          table_name: 'player_profile',
          columns: [
            { name: 'p_id',         type: 'INT',     key: 'PK' },
            { name: 'username',     type: 'VARCHAR', key: '' },
            { name: 'address_city', type: 'VARCHAR', key: '' },
            { name: 'address_dist', type: 'VARCHAR', key: '' },
            { name: 'birth_year',   type: 'INT',     key: '' }
          ],
          data: [
            ['7',  'DragonLord',    'Tokyo',   'Akihabara', '2005'],
            ['8',  'NoobMaster',    'Seattle', 'Bellevue',  '2010'],
            ['9',  'GG_WellPlayed', 'Hanoi',   'Cau Giay',  '1999']
          ]
        },
        template: 'SELECT username, ____, ____, (2024 - ____) ____ age FROM player_profile WHERE ____ = 7;',
        blanks: [
          { id: 'b1', expected: 'address_city', hint: 'thành phố' },
          { id: 'b2', expected: 'address_dist', hint: 'quận/huyện' },
          { id: 'b3', expected: 'birth_year',   hint: 'cột gốc' },
          { id: 'b4', expected: 'AS',           hint: 'đặt bí danh' },
          { id: 'b5', expected: 'p_id',         hint: 'khóa chính' }
        ],
        expected_sql: 'SELECT username, address_city, address_dist, (2024 - birth_year) AS age FROM player_profile WHERE p_id = 7;',
        success_message: 'Tuyệt! Bạn đã nắm Composite (tách cột) + Derived (tính cột ảo với AS). Bài 3 sẽ học cách nối 2 bảng bằng Foreign Key + JOIN.',
        xp_reward: 50
      }
    },

    /* ========================================================================
     * BÀI 3 — Foreign Key & JOIN [REALIGN v3]
     * Concept: PDF Bài 3 — data: game + publisher (Game Shop)
     * drag_type: connector | challenge_type: full_ide
     * ======================================================================== */
    {
      id: 'db_03', index: 3,
      title: 'Foreign Key & JOIN',
      subtitle: 'Nối 2 bảng qua Khóa ngoại bằng cú pháp JOIN ... ON',
      module: 1, module_title: 'Giới thiệu & Nền tảng Database',
      estimated_minutes: 25, xp_reward: 60,
      project_piece: '🔗 Mở khóa "Kênh cung ứng Nhà Phát Hành"',
      drag_type: 'connector',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'game',
          columns: ['game_id', 'title', 'pub_id'],
          dataRows: [
            ['501', 'Super Mario Odyssey',  '10'],
            ['502', 'The Legend of Zelda', '10'],
            ['503', 'GTA V',               '20'],
            ['504', 'Red Dead Redemption', '20']
          ]
        }
      },

      step_1: {
        primer: {
          goal: [
            'Foreign Key (FK) = cột lưu giá trị Khóa chính của bảng khác',
            'JOIN ... ON ... = cú pháp nối 2 bảng qua FK ↔ PK',
            'Khi 2 bảng cùng có cột id, dùng table.column để phân biệt'
          ],
          intro: 'Trong thực tế, dữ liệu nằm rải rác ở nhiều bảng. <strong>Foreign Key (FK)</strong> là cột lưu <em>bản sao</em> Khóa chính của bảng khác — đánh dấu quan hệ. <strong>JOIN ... ON</strong> là cú pháp nối 2 bảng qua FK ↔ PK để tạo "siêu bảng" tạm thời phục vụ truy vấn.',
          example: 'Bảng <code>game</code> có cột <code>pub_id</code> (FK) trỏ sang <code>publisher.id</code> (PK). Khi muốn biết game nào do Nintendo sản xuất, ta JOIN 2 bảng rồi WHERE theo <code>publisher.name</code>.'
        },
        visual: {
          schema: {
            table_name: 'game',
            columns: [
              { name: 'game_id', type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'title',   type: 'VARCHAR', key: '',   icon: '🎮' },
              { name: 'pub_id',  type: 'INT',     key: 'FK', icon: '🔗' }
            ]
          },
          data_preview: [
            ['501', 'Super Mario Odyssey',  '10'],
            ['502', 'The Legend of Zelda', '10'],
            ['503', 'GTA V',               '20']
          ],
          related_tables: [
            {
              name: 'publisher',
              columns: [
                { name: 'id',   type: 'INT',     key: 'PK', icon: '🔑' },
                { name: 'name', type: 'VARCHAR', key: '',   icon: '🏢' }
              ],
              data: [
                ['10', 'Nintendo'],
                ['20', 'Rockstar']
              ]
            }
          ]
        },
        mission: 'Lấy <code>title</code> của tất cả game do <code>Nintendo</code> sản xuất — kéo thả SQL, JOIN qua FK.'
      },

      step_2: {
        mcq: [
          {
            question: 'Foreign Key (FK) dùng để làm gì?',
            options: [
              { id: 'a', text: 'Lưu giá trị Khóa chính của bảng khác để tạo liên kết', correct: true },
              { id: 'b', text: 'Mã hóa dữ liệu nhạy cảm', correct: false },
              { id: 'c', text: 'Tăng tốc độ truy vấn bằng index', correct: false },
              { id: 'd', text: 'Đánh dấu cột được phép NULL', correct: false }
            ]
          },
          {
            question: 'Khi 2 bảng cùng có cột <code>id</code> và bạn SELECT cả 2, làm sao phân biệt?',
            options: [
              { id: 'a', text: 'Dùng <code>id1</code> và <code>id2</code>', correct: false },
              { id: 'b', text: 'Dùng <code>table.column</code> (vd: <code>game.id</code>, <code>publisher.id</code>)', correct: true },
              { id: 'c', text: 'Không thể SELECT cả 2 bảng có cùng tên cột', correct: false },
              { id: 'd', text: 'DB tự động đổi tên cột thành id_a và id_b', correct: false }
            ]
          }
        ],
        mini_game: {
          title: 'Phân loại: cột nào là PK / FK / Thường?',
          instruction: 'Trong 2 bảng <code>game</code> và <code>publisher</code>, mỗi thẻ là 1 cột. Kéo vào ô tương ứng.',
          chips: [
            { id: 'g-gameid',  label: 'game.game_id' },
            { id: 'g-title',   label: 'game.title' },
            { id: 'g-pubid',   label: 'game.pub_id' },
            { id: 'p-id',      label: 'publisher.id' },
            { id: 'p-name',    label: 'publisher.name' }
          ],
          bins: [
            { id: 'pk',     label: 'Primary Key (PK)',     correct: 'true' },
            { id: 'fk',     label: 'Foreign Key (FK)',     correct: 'fk' },
            { id: 'normal', label: 'Cột thường',           correct: 'normal' }
          ],
          solution: {
            'g-gameid': 'pk',
            'g-title':  'normal',
            'g-pubid':  'fk',
            'p-id':     'pk',
            'p-name':   'normal'
          }
        }
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',         slot: 'kw-select' },
          { type: 'col', token: 'game.title',     slot: 'col-1' },
          { type: 'kw',  token: 'FROM',           slot: 'kw-from' },
          { type: 'tbl', token: 'game',          slot: 'tbl' },
          { type: 'kw',  token: 'JOIN',           slot: 'kw-join' },
          { type: 'tbl', token: 'publisher',     slot: 'tbl2' },
          { type: 'kw',  token: 'ON',             slot: 'kw-on' },
          { type: 'col', token: 'game.pub_id = publisher.id', slot: 'col-on' },
          { type: 'kw',  token: 'WHERE',          slot: 'kw-where' },
          { type: 'col', token: 'publisher.name',slot: 'wcol-1' },
          { type: 'op',  token: '=',              slot: 'op-1' },
          { type: 'val', token: "'Nintendo'",     slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____',                                  accepts: ['kw', 'col'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____ JOIN ____ ON ____',                  accepts: ['kw', 'tbl', 'col'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',                          accepts: ['kw', 'col', 'op', 'val'], multi: true }
        ],
        expected_sql: "SELECT game.title FROM game JOIN publisher ON game.pub_id = publisher.id WHERE publisher.name = 'Nintendo';",
        reveal_hints: {
          'select-line': 'SELECT 1 cột: <strong>game.title</strong> (chỉ rõ bảng để tránh nhầm với publisher).',
          'from-line':   'FROM <strong>game</strong> → <strong>JOIN publisher ON game.pub_id = publisher.id</strong> (nối qua FK ↔ PK).',
          'where-line':  "WHERE lọc hãng: <strong>publisher.name = 'Nintendo'</strong>."
        }
      },

      step_4: {
        prompt: 'Tự gõ SQL! Lấy <code>title</code> của mọi game do <code>Rockstar</code> sản xuất. <em>Gợi ý: dùng game JOIN publisher ...</em>',
        starter: '-- Viết query của bạn ở đây\n',
        schema: {
          table_name: 'game',
          columns: [
            { name: 'game_id', type: 'INT',     key: 'PK' },
            { name: 'title',   type: 'VARCHAR', key: '' },
            { name: 'pub_id',  type: 'INT',     key: 'FK' }
          ],
          data: [
            ['501', 'Super Mario Odyssey',  '10'],
            ['502', 'The Legend of Zelda', '10'],
            ['503', 'GTA V',               '20'],
            ['504', 'Red Dead Redemption', '20']
          ]
        },
        related_schemas: [
          {
            table_name: 'publisher',
            columns: [
              { name: 'id',   type: 'INT',     key: 'PK' },
              { name: 'name', type: 'VARCHAR', key: '' }
            ],
            data: [
              ['10', 'Nintendo'],
              ['20', 'Rockstar']
            ]
          }
        ],
        expected_sql: "SELECT game.title FROM game JOIN publisher ON game.pub_id = publisher.id WHERE publisher.name = 'Rockstar';",
        hints: [
          { level: 1, text: 'Cần 1 cột: <code>game.title</code> (dùng table.column để rõ ràng).' },
          { level: 2, text: 'Bảng <code>game</code>, JOIN với <code>publisher</code> ON <code>game.pub_id = publisher.id</code>.' },
          { level: 3, text: "WHERE <code>publisher.name = 'Rockstar'</code>" },
          { level: 4, text: "<code>SELECT game.title FROM game JOIN publisher ON game.pub_id = publisher.id WHERE publisher.name = 'Rockstar';</code>" }
        ],
        success_message: 'Xuất sắc! Bạn đã nối 2 bảng qua Foreign Key bằng JOIN ON. Bài 4 sẽ học M:N — quan hệ phức tạp hơn với 3 bảng (junction table).',
        xp_reward: 60
      }
    },

    /* ========================================================================
     * BÀI 4 — M:N & Junction Table [REALIGN v3]
     * Concept: PDF Bài 4 — data: player + library + game
     * drag_type: connector | challenge_type: bug_fix
     * ======================================================================== */
    {
      id: 'db_04', index: 4,
      title: 'M:N & Bảng trung gian (Junction Table)',
      subtitle: 'Quan hệ Nhiều-Nhiều qua bảng cầu nối — Double JOIN chuỗi',
      module: 1, module_title: 'Giới thiệu & Nền tảng Database',
      estimated_minutes: 25, xp_reward: 70,
      project_piece: '🛒 Mở khóa "Hệ thống Giỏ hàng Tài khoản ↔ Kho Game"',
      drag_type: 'connector',
      challenge_type: 'bug_fix',
      drag_map: {
        table: {
          name: 'player',
          columns: ['p_id', 'username'],
          dataRows: [
            ['7', 'DragonLord'],
            ['8', 'NoobMaster'],
            ['9', 'GG_WellPlayed']
          ]
        }
      },

      step_1: {
        primer: {
          goal: [
            'M:N (Nhiều-Nhiều) = 1 khách mua nhiều game, 1 game có nhiều khách',
            'Không thể nhét FK vào bên nào → cần Bảng trung gian (Junction Table)',
            'Junction Table chỉ chứa 2 FK + tạo cặp (player_id, game_id) cho mỗi lượt mua'
          ],
          intro: 'Quan hệ M:N xuất hiện khắp nơi: SV học nhiều môn, môn có nhiều SV; khách mua nhiều game, game bán cho nhiều khách. Không thể đặt FK vào bên nào (sẽ lặp). Giải pháp: <strong>Bảng trung gian (Junction Table)</strong> chỉ chứa 2 FK, tạo 1 dòng cho mỗi cặp. Truy vấn M:N nghĩa là <strong>Double JOIN chuỗi</strong> qua bảng trung gian.',
          example: 'Bảng <code>player_game_library</code> ở giữa chỉ chứa <code>ref_p_id</code> + <code>ref_game_id</code>. Khi DragonLord (p_id=7) mua Elden Ring (game_id=101) → 1 dòng (7, 101) trong library. Khi cùng DragonLord mua Hades (game_id=103) → 1 dòng (7, 103). Khi NoobMaster (p_id=8) cũng mua Elden Ring → 1 dòng (8, 101).'
        },
        visual: {
          schema: {
            table_name: 'player',
            columns: [
              { name: 'p_id',     type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'username', type: 'VARCHAR', key: '',   icon: '👤' }
            ]
          },
          data_preview: [
            ['7', 'DragonLord'],
            ['8', 'NoobMaster']
          ],
          related_tables: [
            {
              name: 'player_game_library',
              columns: [
                { name: 'ref_p_id',    type: 'INT', key: 'FK', icon: '🔗' },
                { name: 'ref_game_id', type: 'INT', key: 'FK', icon: '🔗' }
              ],
              data: [
                ['7', '101'],
                ['7', '103'],
                ['8', '101']
              ]
            },
            {
              name: 'game',
              columns: [
                { name: 'game_id', type: 'INT',     key: 'PK', icon: '🔑' },
                { name: 'title',   type: 'VARCHAR', key: '',   icon: '🎮' }
              ],
              data: [
                ['101', 'Elden Ring'],
                ['102', 'God of War'],
                ['103', 'Hades']
              ]
            }
          ]
        },
        mission: 'Lấy <code>title</code> của tất cả game mà <code>DragonLord</code> sở hữu — kéo thả SQL, JOIN chuỗi qua 3 bảng.'
      },

      step_2: {
        mcq: [
          {
            question: 'Tại sao quan hệ M:N KHÔNG thể chỉ dùng 1 FK ở 1 bảng?',
            options: [
              { id: 'a', text: 'Vì FK chỉ được lưu 1 lần duy nhất trong bảng', correct: false },
              { id: 'b', text: 'Vì nhét FK vào 1 bên sẽ sinh lặp dữ liệu vô tận (mỗi record cần 1 dòng)', correct: true },
              { id: 'c', text: 'Vì M:N không được phép trong SQL', correct: false },
              { id: 'd', text: 'Vì FK phải là số nguyên dương', correct: false }
            ]
          },
          {
            question: 'Bảng trung gian (Junction Table) trong quan hệ M:N chứa gì?',
            options: [
              { id: 'a', text: 'Chỉ 1 cột FK trỏ về bảng chính', correct: false },
              { id: 'b', text: '2 cột FK — mỗi cột trỏ về 1 bảng ở 2 phía quan hệ', correct: true },
              { id: 'c', text: 'Tất cả thuộc tính của cả 2 bảng gộp lại', correct: false },
              { id: 'd', text: 'Không có cột nào, chỉ là bảng "ảo"', correct: false }
            ]
          }
        ],
        mini_game: {
          title: 'Phân loại: cột nào là PK / FK (junction) / Thường?',
          instruction: 'Trong 3 bảng <code>player</code>, <code>player_game_library</code>, <code>game</code>, mỗi thẻ là 1 cột. Kéo vào ô tương ứng.',
          chips: [
            { id: 'p-pid',   label: 'player.p_id' },
            { id: 'p-name',  label: 'player.username' },
            { id: 'l-pid',   label: 'library.ref_p_id' },
            { id: 'l-gid',   label: 'library.ref_game_id' },
            { id: 'g-gid',   label: 'game.game_id' },
            { id: 'g-title', label: 'game.title' }
          ],
          bins: [
            { id: 'pk',     label: 'Primary Key (PK)',     correct: 'true' },
            { id: 'fk',     label: 'Foreign Key (FK)',     correct: 'fk' },
            { id: 'normal', label: 'Cột thường',           correct: 'normal' }
          ],
          solution: {
            'p-pid':   'pk',
            'p-name':  'normal',
            'l-pid':   'fk',
            'l-gid':   'fk',
            'g-gid':   'pk',
            'g-title': 'normal'
          }
        }
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',         slot: 'kw-select' },
          { type: 'col', token: 'game.title',     slot: 'col-1' },
          { type: 'kw',  token: 'FROM',           slot: 'kw-from' },
          { type: 'tbl', token: 'player',         slot: 'tbl' },
          { type: 'kw',  token: 'JOIN',           slot: 'kw-join' },
          { type: 'tbl', token: 'player_game_library', slot: 'tbl2' },
          { type: 'kw',  token: 'ON',             slot: 'kw-on' },
          { type: 'col', token: 'player.p_id = player_game_library.ref_p_id', slot: 'col-on' },
          { type: 'kw',  token: 'JOIN',           slot: 'kw-join' },
          { type: 'tbl', token: 'game',           slot: 'tbl3' },
          { type: 'kw',  token: 'ON',             slot: 'kw-on' },
          { type: 'col', token: 'player_game_library.ref_game_id = game.game_id', slot: 'col-on2' },
          { type: 'kw',  token: 'WHERE',          slot: 'kw-where' },
          { type: 'col', token: 'player.username',slot: 'wcol-1' },
          { type: 'op',  token: '=',              slot: 'op-1' },
          { type: 'val', token: "'DragonLord'",   slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____',                                 accepts: ['kw', 'col'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____ JOIN ____ ON ____ JOIN ____ ON ____', accepts: ['kw', 'tbl', 'col'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',                          accepts: ['kw', 'col', 'op', 'val'], multi: true }
        ],
        expected_sql: "SELECT game.title FROM player JOIN player_game_library ON player.p_id = player_game_library.ref_p_id JOIN game ON player_game_library.ref_game_id = game.game_id WHERE player.username = 'DragonLord';",
        reveal_hints: {
          'select-line': 'SELECT 1 cột: <strong>game.title</strong>.',
          'from-line':   'Chuỗi 2 JOIN: <strong>player</strong> → <strong>player_game_library</strong> (nối qua p_id) → <strong>game</strong> (nối qua ref_game_id).',
          'where-line':  "WHERE lọc người: <strong>player.username = 'DragonLord'</strong>."
        }
      },

      step_4: {
        prompt: '<strong>Bug:</strong> Query dưới đây <em>quên JOIN bảng game</em>, nên chỉ trả về mã game chứ không trả về tên game. Sửa cho ra kết quả đúng. (Click vào dòng lỗi để edit)',
        schema: {
          table_name: 'player',
          columns: [
            { name: 'p_id',     type: 'INT',     key: 'PK' },
            { name: 'username', type: 'VARCHAR', key: '' }
          ],
          data: [
            ['7', 'DragonLord'],
            ['8', 'NoobMaster']
          ]
        },
        related_schemas: [
          {
            table_name: 'player_game_library',
            columns: [
              { name: 'ref_p_id',    type: 'INT', key: 'FK' },
              { name: 'ref_game_id', type: 'INT', key: 'FK' }
            ],
            data: [
              ['7', '101'], ['7', '103'], ['8', '101']
            ]
          },
          {
            table_name: 'game',
            columns: [
              { name: 'game_id', type: 'INT',     key: 'PK' },
              { name: 'title',   type: 'VARCHAR', key: '' }
            ],
            data: [
              ['101', 'Elden Ring'], ['102', 'God of War'], ['103', 'Hades']
            ]
          }
        ],
        buggy: "SELECT player_game_library.ref_game_id\nFROM player\nJOIN player_game_library ON player.p_id = player_game_library.ref_p_id\nWHERE player.username = 'DragonLord';",
        buggy_line: 0,
        expected_sql: "SELECT game.title FROM player JOIN player_game_library ON player.p_id = player_game_library.ref_p_id JOIN game ON player_game_library.ref_game_id = game.game_id WHERE player.username = 'DragonLord';",
        success_message: 'Đỉnh! Bạn đã thêm JOIN bảng game. Bài 5 sẽ học về Thực thể yếu (Weak Entity) — loại thực thể cần cha để tồn tại.',
        xp_reward: 70
      }
    },

    /* ========================================================================
     * BÀI 5 — Weak Entity Set [REALIGN v3]
     * Concept: PDF Bài 5 — data: dlc_content (ref_game_id + dlc_no composite key)
     * drag_type: chip | challenge_type: mcq_code
     * ======================================================================== */
    {
      id: 'db_05', index: 5,
      title: 'Thực thể yếu (Weak Entity)',
      subtitle: 'Thực thể cần "cha" để tồn tại — Khóa chính tổng hợp FK + Discriminator',
      module: 1, module_title: 'Giới thiệu & Nền tảng Database',
      estimated_minutes: 20, xp_reward: 60,
      project_piece: '🎮 Mở khóa "Kho nội dung mở rộng (DLC)" cho Game Shop',
      drag_type: 'chip',
      challenge_type: 'mcq_code',
      drag_map: {
        table: {
          name: 'dlc_content',
          columns: ['ref_game_id', 'dlc_no', 'dlc_name'],
          dataRows: [
            ['300', '1', 'Hearts of Stone'],
            ['300', '2', 'Blood and Wine'],
            ['400', '1', 'Phantom Liberty'],
            ['400', '2', 'Corpo Gear Pack']
          ]
        }
      },

      step_1: {
        primer: {
          goal: [
            'Thực thể yếu = loại thực thể KHÔNG có Khóa chính độc lập, phải nhờ "cha"',
            'Khóa chính tổng hợp = FK trỏ về thực thể cha + Discriminator (cột phân biệt)',
            'Dùng AND để nối 2 vế của khóa chính tổng hợp trong WHERE'
          ],
          intro: 'Có những thực thể không thể tự tồn tại nếu thiếu "cha". Ví dụ: bản mở rộng (DLC) <em>"Gói số 1"</em> — chưa biết của game nào. Nó cần kết hợp với <code>ref_game_id</code> mới định danh được. <strong>Thực thể yếu</strong> dùng Khóa chính tổng hợp: FK (trỏ về cha) + Discriminator (cột phân biệt trong phạm vi cha).',
          example: 'Trong bảng <code>dlc_content</code>, không có cột <code>dlc_id</code> riêng. Khóa chính là 2 cột cộng lại: <code>ref_game_id</code> (FK) + <code>dlc_no</code> (Discriminator). Truy vấn cần dùng <code>AND</code>: <code>WHERE dlc_no = 1 AND ref_game_id = 400</code>.'
        },
        visual: {
          schema: {
            table_name: 'dlc_content',
            columns: [
              { name: 'ref_game_id', type: 'INT',     key: 'PK+FK', icon: '🔗' },
              { name: 'dlc_no',     type: 'INT',     key: 'PK',     icon: '🔑' },
              { name: 'dlc_name',   type: 'VARCHAR', key: '',       icon: '🎁' }
            ]
          },
          data_preview: [
            ['300', '1', 'Hearts of Stone'],
            ['300', '2', 'Blood and Wine'],
            ['400', '1', 'Phantom Liberty'],
            ['400', '2', 'Corpo Gear Pack']
          ]
        },
        mission: 'Lấy <code>dlc_name</code> của gói DLC số 1 thuộc game id 400 — kéo thả SQL với khóa chính tổng hợp.'
      },

      step_2: {
        mcq: [
          {
            question: 'Thực thể yếu (Weak Entity) khác thực thể thường ở điểm nào?',
            options: [
              { id: 'a', text: 'Có nhiều cột hơn các thực thể khác', correct: false },
              { id: 'b', text: 'Không có Khóa chính độc lập — cần kết hợp với FK từ thực thể cha', correct: true },
              { id: 'c', text: 'Không thể lưu dữ liệu số, chỉ lưu chuỗi', correct: false },
              { id: 'd', text: 'Tự động xóa khi database tắt', correct: false }
            ]
          },
          {
            question: 'Trong <code>dlc_content(ref_game_id, dlc_no, dlc_name)</code>, khóa chính là cột nào?',
            options: [
              { id: 'a', text: 'Chỉ <code>ref_game_id</code>', correct: false },
              { id: 'b', text: 'Chỉ <code>dlc_no</code>', correct: false },
              { id: 'c', text: '<code>(ref_game_id, dlc_no)</code> — cả 2 cột cộng lại mới định danh duy nhất', correct: true },
              { id: 'd', text: 'Không có khóa chính (bảng lỗi)', correct: false }
            ]
          }
        ],
        mini_game: {
          title: 'Phân loại: cột nào là FK / Discriminator / Thường?',
          instruction: 'Trong bảng <code>dlc_content</code>, mỗi thẻ là 1 cột. Kéo vào ô tương ứng.<br><strong style="color:var(--primary)">FK (Khóa ngoại)</strong> · <strong style="color:var(--warning)">Discriminator (Phân biệt)</strong> · <strong style="color:var(--text-400)">Thường</strong>.',
          chips: [
            { id: 'c-ref',   label: 'ref_game_id' },
            { id: 'c-no',    label: 'dlc_no' },
            { id: 'c-name',  label: 'dlc_name' }
          ],
          bins: [
            { id: 'fk',   label: 'FK (Khóa ngoại)',          correct: 'fk' },
            { id: 'disc', label: 'Discriminator (Phân biệt)', correct: 'disc' },
            { id: 'norm', label: 'Cột thường',                correct: 'norm' }
          ],
          solution: {
            'c-ref':  'fk',
            'c-no':   'disc',
            'c-name': 'norm'
          }
        }
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',         slot: 'kw-select' },
          { type: 'col', token: 'dlc_name',       slot: 'col-1' },
          { type: 'kw',  token: 'FROM',           slot: 'kw-from' },
          { type: 'tbl', token: 'dlc_content',    slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',          slot: 'kw-where' },
          { type: 'col', token: 'dlc_no',         slot: 'wcol-1' },
          { type: 'op',  token: '=',              slot: 'op-1' },
          { type: 'val', token: '1',              slot: 'val-1' },
          { type: 'kw',  token: 'AND',            slot: 'kw-and' },
          { type: 'col', token: 'ref_game_id',    slot: 'wcol-2' },
          { type: 'op',  token: '=',              slot: 'op-2' },
          { type: 'val', token: '400',            slot: 'val-2' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____',                                  accepts: ['kw', 'col'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',                                     accepts: ['kw', 'tbl'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____ ____ ____ ____ ____',      accepts: ['kw', 'col', 'op', 'val'], multi: true }
        ],
        expected_sql: "SELECT dlc_name FROM dlc_content WHERE dlc_no = 1 AND ref_game_id = 400;",
        reveal_hints: {
          'select-line': 'SELECT 1 cột: <strong>dlc_name</strong>.',
          'from-line':   'FROM <strong>dlc_content</strong>.',
          'where-line':  "WHERE khóa tổng hợp: <strong>dlc_no = 1 AND ref_game_id = 400</strong> (thiếu AND → trả về nhầm DLC của game khác)."
        }
      },

      step_4: {
        prompt: 'Lấy <code>dlc_name</code> của gói DLC số <strong>2</strong> thuộc game id <strong>300</strong>. Câu SQL nào dưới đây là ĐÚNG?',
        schema: {
          table_name: 'dlc_content',
          columns: [
            { name: 'ref_game_id', type: 'INT',     key: 'PK+FK' },
            { name: 'dlc_no',     type: 'INT',     key: 'PK' },
            { name: 'dlc_name',   type: 'VARCHAR', key: '' }
          ],
          data: [
            ['300', '1', 'Hearts of Stone'],
            ['300', '2', 'Blood and Wine'],
            ['400', '1', 'Phantom Liberty'],
            ['400', '2', 'Corpo Gear Pack']
          ]
        },
        options: [
          { id: 'a', text: "SELECT dlc_name FROM dlc_content WHERE dlc_no = 2;", correct: false, explain: 'Sai: thiếu ref_game_id nên trả về cả 2 dòng DLC #2 (của game 300 + 400).' },
          { id: 'b', text: "SELECT dlc_name FROM dlc_content WHERE dlc_no = 2 AND ref_game_id = 300;", correct: true, explain: 'Đúng! Khóa chính tổng hợp = 2 cột cộng lại. AND nối cả 2 vế → chỉ trả về 1 dòng "Blood and Wine".' },
          { id: 'c', text: "SELECT dlc_name FROM dlc_content WHERE ref_game_id = 300;", correct: false, explain: 'Sai: ref_game_id chỉ đủ để biết là DLC của game 300, nhưng không định danh được DLC #1 hay #2 → trả về cả 2 dòng.' },
          { id: 'd', text: "SELECT dlc_name FROM dlc_content WHERE dlc_name = 'Blood and Wine';", correct: false, explain: 'Sai logic: lọc theo name (không phải PK) sẽ đúng trong data này nhưng phá vỡ tính định danh — không dùng tên làm định danh được.' }
        ],
        expected_sql: "SELECT dlc_name FROM dlc_content WHERE dlc_no = 2 AND ref_game_id = 300;",
        success_message: 'Bài 6 sẽ bắt đầu Module 2 — phát hiện dư thừa (Redundancy) & Phụ thuộc hàm (Functional Dependency) — nền tảng của chuẩn hóa dữ liệu.',
        xp_reward: 30
      }
    },

    /* ========================================================================
     * BÀI 6 — Redundancy & Functional Dependency [REALIGN v3]
     * Concept: PDF Bài 6 — data: game_studio_combined
     * drag_type: box | challenge_type: mcq_code
     * ======================================================================== */
    {
      id: 'db_06', index: 6,
      title: 'Redundancy & Phụ thuộc hàm (FD)',
      subtitle: 'Phát hiện dữ liệu lặp và quy tắc X → Y ẩn trong bảng',
      module: 2, module_title: 'Chuẩn hóa dữ liệu (Normal Forms)',
      estimated_minutes: 22, xp_reward: 70,
      project_piece: '🛰️ Khởi động "Còi báo động Hệ thống Dọn Rác"',
      drag_type: 'box',
      challenge_type: 'mcq_code',
      drag_map: {
        table: {
          name: 'game_studio_combined',
          columns: ['game_id', 'game_name', 'studio_name', 'st_country'],
          dataRows: [
            ['55', 'Elden Ring',  'FromSoftware', 'Japan'],
            ['56', 'Bloodborne',  'FromSoftware', 'Japan'],
            ['57', 'Sekiro',      'FromSoftware', 'Japan'],
            ['88', 'Portal 2',    'Valve',        'USA']
          ]
        }
      },

      step_1: {
        primer: {
          goal: [
            'Redundancy = dữ liệu bị lặp lại không cần thiết trong nhiều dòng',
            'Phụ thuộc hàm (FD) X → Y nghĩa là: biết X, suy ra được Y duy nhất',
            'FD chính là gốc rễ của mọi dạng chuẩn (1NF, 2NF, 3NF, BCNF)'
          ],
          intro: 'Bảng <code>game_studio_combined</code> dưới đây có vấn đề: <em>FromSoftware</em> xuất hiện 3 lần, mỗi lần lặp lại "Japan". Đó là <strong>Redundancy</strong> (dư thừa) — tốn ổ cứng, dễ sinh mâu thuẫn. <strong>Phụ thuộc hàm (Functional Dependency)</strong> là quy tắc: nếu biết <code>studio_name</code> thì biết <code>st_country</code> (mỗi studio chỉ ở 1 nước). Viết: <code>studio_name → st_country</code>.',
          example: 'Bạn phát hiện FD: <code>studio_name → st_country</code>. Đây là quy tắc toán học — không phải syntax SQL — nhưng là gốc rễ để biết bảng "có vấn đề" và cần tách. Có 3 dạng chuẩn sẽ dùng FD để phát hiện vi phạm: 1NF, 2NF, 3NF, BCNF.'
        },
        visual: {
          schema: {
            table_name: 'game_studio_combined',
            columns: [
              { name: 'game_id',     type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'game_name',   type: 'VARCHAR', key: '',   icon: '🎮' },
              { name: 'studio_name', type: 'VARCHAR', key: '',   icon: '🏢' },
              { name: 'st_country',  type: 'VARCHAR', key: '',   icon: '🌏' }
            ]
          },
          data_preview: [
            ['55', 'Elden Ring',  'FromSoftware', 'Japan'],
            ['56', 'Bloodborne',  'FromSoftware', 'Japan'],
            ['57', 'Sekiro',      'FromSoftware', 'Japan'],
            ['88', 'Portal 2',    'Valve',        'USA']
          ]
        },
        mission: 'Lấy <code>studio_name</code> và <code>st_country</code> của các game thuộc studio <em>FromSoftware</em> — quan sát: nếu sửa "Japan" → "Đài Loan" ở 1 dòng, 2 dòng kia vẫn "Japan" → mâu thuẫn.'
      },

      step_2: {
        mcq: [
          {
            question: 'Redundancy (dư thừa) trong bảng game_studio_combined là gì?',
            options: [
              { id: 'a', text: 'Cột game_id xuất hiện ở tất cả các dòng', correct: false },
              { id: 'b', text: 'Cùng một studio + country lặp lại ở nhiều dòng, dù đã biết qua FD studio_name → st_country', correct: true },
              { id: 'c', text: 'Bảng có quá nhiều cột so với cần thiết', correct: false },
              { id: 'd', text: 'Dòng dữ liệu bị thiếu cột', correct: false }
            ]
          },
          {
            question: 'Phụ thuộc hàm <code>studio_name → st_country</code> nghĩa là:',
            options: [
              { id: 'a', text: 'Mỗi studio có thể ở nhiều quốc gia', correct: false },
              { id: 'b', text: 'Biết tên studio thì xác định được duy nhất quốc gia của studio đó', correct: true },
              { id: 'c', text: 'Biết tên game thì biết được studio', correct: false },
              { id: 'd', text: 'Country quyết định studio', correct: false }
            ]
          }
        ],
        mini_game: {
          title: 'Phân loại: cặp nào có FD (X → Y)?',
          instruction: 'Mỗi thẻ là 1 cặp (X, Y). Xác định cặp nào <em>chắc chắn</em> là FD.<br><strong style="color:var(--success)">Có FD</strong> = X quyết định Y duy nhất · <strong style="color:var(--danger)">Không FD</strong> = Y thay đổi tùy dòng.',
          chips: [
            { id: 'fd1', label: 'studio_name → st_country' },
            { id: 'fd2', label: 'game_id → game_name' },
            { id: 'fd3', label: 'studio_name → game_name' },
            { id: 'fd4', label: 'game_name → studio_name' }
          ],
          bins: [
            { id: 'yes', label: 'Có FD (X quyết định Y)', correct: 'true' },
            { id: 'no',  label: 'Không FD (Y thay đổi tùy dòng)', correct: 'false' }
          ],
          solution: {
            'fd1': 'yes',  // studio_name quyết định 1 country duy nhất
            'fd2': 'yes',  // game_id (PK) quyết định game_name
            'fd3': 'no',   // 1 studio có nhiều game → game_name thay đổi
            'fd4': 'no'    // tên game có thể trùng (Elden Ring 2 game) → không quyết định studio
          }
        }
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',         slot: 'kw-select' },
          { type: 'col', token: 'studio_name',    slot: 'col-1' },
          { type: 'col', token: 'st_country',     slot: 'col-2' },
          { type: 'kw',  token: 'FROM',           slot: 'kw-from' },
          { type: 'tbl', token: 'game_studio_combined', slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',          slot: 'kw-where' },
          { type: 'col', token: 'studio_name',    slot: 'wcol-1' },
          { type: 'op',  token: '=',              slot: 'op-1' },
          { type: 'val', token: "'FromSoftware'", slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____ , ____',     accepts: ['kw', 'col'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',              accepts: ['kw', 'tbl'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',   accepts: ['kw', 'col', 'op', 'val'], multi: true }
        ],
        expected_sql: "SELECT studio_name, st_country FROM game_studio_combined WHERE studio_name = 'FromSoftware';",
        reveal_hints: {
          'select-line': 'SELECT 2 cột: <strong>studio_name</strong> và <strong>st_country</strong>.',
          'from-line':   'FROM bảng đang dư thừa: <strong>game_studio_combined</strong>.',
          'where-line':  "WHERE lọc studio: <strong>studio_name = 'FromSoftware'</strong> (sẽ thấy cùng kết quả 'Japan' lặp 3 lần — minh chứng redundancy)."
        }
      },

      step_4: {
        prompt: 'Tìm tất cả <code>game_name</code> của studio <em>Valve</em> (USA). Câu SQL nào dưới đây là ĐÚNG?',
        schema: {
          table_name: 'game_studio_combined',
          columns: [
            { name: 'game_id',     type: 'INT',     key: 'PK' },
            { name: 'game_name',   type: 'VARCHAR', key: '' },
            { name: 'studio_name', type: 'VARCHAR', key: '' },
            { name: 'st_country',  type: 'VARCHAR', key: '' }
          ],
          data: [
            ['55', 'Elden Ring',  'FromSoftware', 'Japan'],
            ['56', 'Bloodborne',  'FromSoftware', 'Japan'],
            ['88', 'Portal 2',    'Valve',        'USA'],
            ['89', 'Half-Life 2', 'Valve',        'USA']
          ]
        },
        options: [
          { id: 'a', text: "SELECT game_name FROM game_studio_combined WHERE st_country = 'USA';", correct: false, explain: 'Sai logic: WHERE theo country thay vì studio_name. Vẫn đúng trong data này nhưng không định danh được studio cụ thể — nếu 2 studio cùng ở USA thì sẽ trả nhầm.' },
          { id: 'b', text: "SELECT game_name FROM game_studio_combined WHERE studio_name = 'Valve';", correct: true, explain: 'Đúng! WHERE theo studio_name (PK trong bảng studios) → chỉ trả 2 dòng Portal 2 + Half-Life 2.' },
          { id: 'c', text: "SELECT * FROM game_studio_combined;", correct: false, explain: 'Sai: lấy hết cột (*) và KHÔNG WHERE → trả cả 4 dòng của 2 studio khác nhau.' },
          { id: 'd', text: "SELECT game_name FROM game_studio_combined WHERE game_name = 'Portal 2';", correct: false, explain: 'Sai: WHERE theo name (không phải PK) → chỉ trả 1 dòng, thiếu Half-Life 2.' }
        ],
        expected_sql: "SELECT game_name FROM game_studio_combined WHERE studio_name = 'Valve';",
        success_message: 'Bạn đã hiểu Redundancy + FD. Bài 7 sẽ dùng FD để tách bảng thành 1NF — mỗi ô chỉ 1 giá trị nguyên tử.',
        xp_reward: 30
      }
    },

    /* ========================================================================
     * BÀI 7 — 2NF: Phụ thuộc hàm đầy đủ (Full FD) — School domain
     * ======================================================================== */
    {
      id: 'db_07', index: 7,
      title: 'Dạng chuẩn 1 (1NF) — Nguyên tử hóa dữ liệu',
      subtitle: 'Loại bỏ phụ thuộc bộ phận với khóa chính tổng hợp',
      module: 5, module_title: 'Chuẩn hóa dữ liệu (Normal Forms)',
      estimated_minutes: 25, xp_reward: 80,
      project_piece: '🔬 Thu thập "Kính hiển vi Phụ thuộc hàm"',
      drag_map: {
        table: {
          name: 'enrollments', col: 0, row: 5, width: 4, height: 1,
          columns: ['student_id', 'course_id', 'grade', 'semester'],
          dataRows: [
            ['S01', 'C101', '8.5', '2024-1'],
            ['S02', 'C101', '9.0', '2024-1'],
            ['S03', 'C202', '7.0', '2024-1'],
            ['S04', 'C303', '6.5', '2024-1']
          ]
        }
      },

      step_1: {
        primer: {
          goal: [
            '2NF áp dụng khi bảng có KHÓA CHÍNH TỔNG HỢP (composite key)',
            'Mỗi cột non-key phải phụ thuộc vào TOÀN BỘ khóa, không chỉ một phần',
            'Vi phạm = phụ thuộc bộ phận (partial dependency) → tách thành bảng riêng'
          ],
          intro: 'Bạn quản lý <strong>bảng điểm sinh viên</strong>. Bảng <code class="code">enrollments</code> ban đầu có khóa chính tổng hợp <code class="code">(student_id, course_id)</code>. Vấn đề: <code class="code">student_name</code> chỉ phụ thuộc vào <code class="code">student_id</code> (một phần khóa) — không phụ thuộc vào <code class="code">course_id</code>. <strong>2NF</strong> yêu cầu mỗi cột non-key phải phụ thuộc <em>toàn bộ</em> khóa.',
          example: 'Nếu đổi tên sinh viên từ "Nguyễn Minh" → "Minh Nguyễn", bạn phải sửa MỌI DÒNG có student_id = S01 (vì mỗi sinh viên học nhiều môn → có nhiều dòng). Đó là update anomaly. Tách sinh viên ra bảng riêng → sửa 1 chỗ là xong.'
        },
        decomp_game: {
          rule_label: '2NF — Phụ thuộc hàm đầy đủ',
          rule: 'Bảng enrollments có composite key (student_id, course_id). Cột nào chỉ phụ thuộc MỘT phần khóa → tách ra bảng riêng. Cột nào phụ thuộc TOÀN BỘ khóa (grade) → ở lại.',
          mission: 'Kéo các cột từ bảng <code>enrollments</code> vào 3 bảng mục tiêu. Cột <em>chỉ phụ thuộc 1 phần khóa</em> phải rời đi.',
          source_table: {
            name: 'enrollments',
            columns: [
              { name: 'student_id',   type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'course_id',    type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'student_name', type: 'VARCHAR', key: '',   icon: '⚠️' },
              { name: 'student_dob',  type: 'DATE',    key: '',   icon: '⚠️' },
              { name: 'course_name',  type: 'VARCHAR', key: '',   icon: '⚠️' },
              { name: 'instructor',   type: 'VARCHAR', key: '',   icon: '⚠️' },
              { name: 'grade',        type: 'DECIMAL', key: '',   icon: '🎯' },
              { name: 'semester',     type: 'VARCHAR', key: '',   icon: '📅' },
              { name: 'student_id',   type: 'INT',     key: '',   icon: '🔗' },
              { name: 'course_id',    type: 'INT',     key: '',   icon: '🔗' }
            ],
            data: [
              ['S01', 'C101', 'Nguyễn Minh', '2003-05-12', 'Database',  'TS. Trần',  '8.5', '2024-1'],
              ['S01', 'C202', 'Nguyễn Minh', '2003-05-12', 'Java OOP',  'ThS. Lê',   '7.5', '2024-1'],
              ['S02', 'C101', 'Trần Yuki',   '2003-08-21', 'Database',  'TS. Trần',  '9.0', '2024-1'],
              ['S02', 'C303', 'Trần Yuki',   '2003-08-21', 'Web Dev',   'ThS. Phạm', '8.0', '2024-1'],
              ['S03', 'C202', 'Lê Sara',     '2004-01-15', 'Java OOP',  'ThS. Lê',   '7.0', '2024-1'],
              ['S04', 'C303', 'Phạm Alex',   '2003-11-30', 'Web Dev',   'ThS. Phạm', '6.5', '2024-1']
            ]
          },
          target_tables: [
            { name: 'students',   icon: '🧑‍🎓', description: 'Bảng sinh viên (chỉ phụ thuộc student_id)' },
            { name: 'courses',    icon: '📘', description: 'Bảng môn học (chỉ phụ thuộc course_id)' },
            { name: 'enrollments',icon: '📝', description: 'Bảng điểm (phụ thuộc cả student_id + course_id)' }
          ],
          solution: {
            'students':    ['student_id', 'student_name', 'student_dob'],
            'courses':     ['course_id', 'course_name', 'instructor'],
            'enrollments': ['student_id', 'course_id', 'grade', 'semester']
          },
          hint: 'Hỏi: cột này phụ thuộc TOÀN BỘ khóa (student_id + course_id) hay chỉ MỘT phần? grade phụ thuộc cả 2 (cùng sv học môn khác → điểm khác) → ở lại. Tên SV chỉ cần student_id → rời đi.'
        },
        mission: 'Hoàn thành game kéo-thả để tách bảng <code class="code">enrollments</code> thành <code class="code">students</code>, <code class="code">courses</code>, và <code class="code">enrollments</code>.'
      },

      step_2: {
        question: 'Trong bảng <code class="code">enrollments(student_id, course_id, student_name, grade)</code> với PK là <code class="code">(student_id, course_id)</code>, cột nào VI PHẠM 2NF?',
        options: [
          { id: 'a', text: '<code class="code">student_id</code> — vì là một phần khóa', correct: false },
          { id: 'b', text: '<code class="code">grade</code> — vì phụ thuộc cả 2 cột khóa', correct: false },
          { id: 'c', text: '<code class="code">student_name</code> — vì chỉ phụ thuộc <code class="code">student_id</code> (một phần khóa)', correct: true },
          { id: 'd', text: '<code class="code">course_id</code> — vì là khóa ngoại', correct: false }
        ]
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',     slot: 'kw-select' },
          { type: 'col', token: 'student_id', slot: 'col-1' },
          { type: 'col', token: 'grade',      slot: 'col-2' },
          { type: 'kw',  token: 'FROM',       slot: 'kw-from' },
          { type: 'tbl', token: 'enrollments',slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',      slot: 'kw-where' },
          { type: 'col', token: 'course_id',  slot: 'wcol-1' },
          { type: 'op',  token: '=',          slot: 'op-1' },
          { type: 'val', token: "'C101'",     slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____ , ____',   accepts: ['kw', 'col'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',            accepts: ['kw', 'tbl'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____', accepts: ['kw', 'col', 'op', 'val'], multi: true }
        ],
        expected_sql: "SELECT student_id, grade FROM enrollments WHERE course_id = 'C101';",
        reveal_hints: {
          'select-line': 'SELECT 2 cột: student_id và grade',
          'from-line':   'FROM enrollments',
          'where-line':  "Lọc theo course_id = 'C101'"
        }
      },

      step_4: {
        prompt: 'Tự gõ SQL! Từ bảng <code class="code">enrollments</code> (đã 2NF), lấy <code class="code">student_id</code> và <code class="code">grade</code> của các sinh viên đạt <code class="code">grade >= 8.0</code>.',
        schema: {
          table_name: 'enrollments',
          columns: [
            { name: 'student_id', type: 'INT',     key: 'PK' },
            { name: 'course_id',  type: 'INT',     key: 'PK' },
            { name: 'grade',      type: 'DECIMAL', key: '' },
            { name: 'semester',   type: 'VARCHAR', key: '' }
          ],
          data: [
            ['S01', 'C101', '8.5', '2024-1'],
            ['S02', 'C101', '9.0', '2024-1'],
            ['S03', 'C202', '7.0', '2024-1'],
            ['S04', 'C303', '6.5', '2024-1']
          ]
        },
        expected_sql: "SELECT student_id, grade FROM enrollments WHERE grade >= 8.0;",
        hints: [
          { level: 1, text: 'Cần 2 cột: <code class="code">student_id</code> và <code class="code">grade</code>' },
          { level: 2, text: 'Bảng <code class="code">enrollments</code>, lọc <code class="code">grade >= 8.0</code>' },
          { level: 3, text: "<code class=\"code\">SELECT student_id, grade FROM enrollments WHERE grade >= 8.0;</code>" }
        ],
        success_message: 'Hoàn thành 1NF! Bảng loans giờ chỉ còn FK + ngày tháng — dữ liệu đã nguyên tử hóa. Tiếp theo: 2NF loại bỏ phụ thuộc bộ phận với khóa chính tổng hợp!',
        xp_reward: 80
      }
    },

    /* ========================================================================
     * BÀI 8 — BCNF: Phân rã phi tổn thất (Lossless Decomposition) — Hospital domain
     * ======================================================================== */
    {
      id: 'db_08', index: 8,
      title: 'Dạng chuẩn BCNF & Phân rã Phi tổn thất',
      subtitle: 'Chia bảng không mất dữ liệu nhờ khóa ngoại đúng vị trí',
      module: 5, module_title: 'Chuẩn hóa dữ liệu (Normal Forms)',
      estimated_minutes: 25, xp_reward: 80,
      project_piece: '🛰️ Thu thập "Máy Cưa Không Gian"',
      drag_map: {
        table: {
          name: 'treatments', col: 0, row: 5, width: 4, height: 1,
          columns: ['patient_id', 'doctor_id', 'treatment', 'treatment_date'],
          dataRows: [
            ['P01', 'D01', 'Khám tổng quát', '2024-03-01'],
            ['P02', 'D02', 'Phẫu thuật ruột thừa', '2024-03-05'],
            ['P01', 'D03', 'Xét nghiệm máu', '2024-03-10'],
            ['P03', 'D01', 'Khám tim mạch', '2024-03-12']
          ]
        }
      },

      step_1: {
        primer: {
          goal: [
            'BCNF = phiên bản "nghiêm ngặt" của 3NF',
            'Mọi phụ thuộc hàm X → Y phải có X là siêu khóa (superkey)',
            'Nếu một cột non-superkey quyết định cột khác → vi phạm BCNF, phải tách'
          ],
          intro: 'Bạn quản lý <strong>hồ sơ bệnh viện</strong>. Bảng <code class="code">treatments</code> ghi lại: bệnh nhân nào, do bác sĩ nào, điều trị gì, ngày nào. Nhưng bạn cũng muốn biết <em>chuyên khoa</em> của bác sĩ. Vấn đề: <code class="code">doctor_id</code> quyết định <code class="code">doctor_specialty</code> (mỗi bác sĩ chỉ có 1 chuyên khoa), nhưng <code class="code">doctor_id</code> <em>không phải</em> siêu khóa của bảng treatments → <strong>vi phạm BCNF</strong>.',
          example: 'Cập nhật chuyên khoa bác sĩ D01 từ "Tim mạch" → "Nội tiết" → phải sửa nhiều dòng. Nếu 1 dòng bị sót → dữ liệu mâu thuẫn (inconsistency). Tách <code class="code">doctors</code> ra bảng riêng: sửa 1 chỗ, dữ liệu luôn nhất quán.'
        },
        decomp_game: {
          rule_label: 'BCNF — Siêu khóa là "thánh"',
          rule: 'Trong bảng treatments, doctor_id quyết định doctor_specialty, nhưng doctor_id KHÔNG PHẢI siêu khóa. Vi phạm BCNF! Tách doctors ra bảng riêng.',
          mission: 'Kéo các cột từ bảng <code>treatments</code> vào 3 bảng mục tiêu. Cột <em>doctor_specialty</em> chỉ phụ thuộc doctor_id → không được ở lại treatments.',
          source_table: {
            name: 'treatments',
            columns: [
              { name: 'patient_id',       type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'doctor_id',        type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'treatment',        type: 'VARCHAR', key: '',   icon: '💊' },
              { name: 'treatment_date',   type: 'DATE',    key: '',   icon: '📅' },
              { name: 'doctor_name',      type: 'VARCHAR', key: '',   icon: '⚠️' },
              { name: 'doctor_specialty', type: 'VARCHAR', key: '',   icon: '⚠️' },
              { name: 'patient_id',       type: 'INT',     key: '',   icon: '🔗' },
              { name: 'doctor_id',        type: 'INT',     key: '',   icon: '🔗' }
            ],
            data: [
              ['P01', 'D01', 'Khám tổng quát',     '2024-03-01', 'BS. Hà',   'Tim mạch'],
              ['P02', 'D02', 'Phẫu thuật ruột thừa','2024-03-05', 'BS. Linh', 'Ngoại khoa'],
              ['P01', 'D03', 'Xét nghiệm máu',      '2024-03-10', 'BS. Khải', 'Huyết học'],
              ['P03', 'D01', 'Khám tim mạch',       '2024-03-12', 'BS. Hà',   'Tim mạch'],
              ['P02', 'D01', 'Tái khám',            '2024-03-15', 'BS. Hà',   'Tim mạch'],
              ['P04', 'D02', 'Phẫu thuật dạ dày',   '2024-03-18', 'BS. Linh', 'Ngoại khoa']
            ]
          },
          target_tables: [
            { name: 'doctors',    icon: '👨‍⚕️', description: 'Bảng bác sĩ (mỗi dòng = 1 bác sĩ, có chuyên khoa)' },
            { name: 'patients',   icon: '🧑‍⚕️', description: 'Bảng bệnh nhân' },
            { name: 'treatments', icon: '💊', description: 'Bảng điều trị (chỉ FK + hành động + ngày)' }
          ],
          solution: {
            'doctors':    ['doctor_id', 'doctor_name', 'doctor_specialty'],
            'patients':   ['patient_id'],
            'treatments': ['patient_id', 'doctor_id', 'treatment', 'treatment_date']
          },
          hint: 'Câu hỏi BCNF: "Cột X có phải siêu khóa không?" Nếu X quyết định Y mà X không phải siêu khóa → vi phạm → tách X-Y ra bảng riêng. Ở đây doctor_id quyết định doctor_specialty mà doctor_id không phải superkey.'
        },
        mission: 'Hoàn thành game kéo-thả để tách <code class="code">treatments</code> thành <code class="code">doctors</code>, <code class="code">patients</code>, và <code class="code">treatments</code>.'
      },

      step_2: {
        question: 'Khi nào một bảng VI PHẠM BCNF?',
        options: [
          { id: 'a', text: 'Khi bảng có khóa chính tổng hợp', correct: false },
          { id: 'b', text: 'Khi có một cột non-superkey quyết định một cột khác', correct: true },
          { id: 'c', text: 'Khi bảng có nhiều hơn 5 cột', correct: false },
          { id: 'd', text: 'Khi bảng có cột <code class="code">date</code>', correct: false }
        ]
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',         slot: 'kw-select' },
          { type: 'col', token: 'patient_id',     slot: 'col-1' },
          { type: 'col', token: 'treatment',      slot: 'col-2' },
          { type: 'kw',  token: 'FROM',           slot: 'kw-from' },
          { type: 'tbl', token: 'treatments',     slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',          slot: 'kw-where' },
          { type: 'col', token: 'doctor_id',      slot: 'wcol-1' },
          { type: 'op',  token: '=',              slot: 'op-1' },
          { type: 'val', token: "'D01'",          slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____ , ____',   accepts: ['kw', 'col'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',            accepts: ['kw', 'tbl'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____', accepts: ['kw', 'col', 'op', 'val'], multi: true }
        ],
        expected_sql: "SELECT patient_id, treatment FROM treatments WHERE doctor_id = 'D01';",
        reveal_hints: {
          'select-line': 'SELECT 2 cột: patient_id và treatment',
          'from-line':   'FROM treatments',
          'where-line':  "Lọc theo doctor_id = 'D01'"
        }
      },

      step_4: {
        prompt: 'Tự gõ SQL! Từ bảng <code class="code">treatments</code> (đã BCNF), lấy <code class="code">treatment</code> và <code class="code">treatment_date</code> của các ca điều trị sau ngày <code class="code">2024-03-10</code>.',
        schema: {
          table_name: 'treatments',
          columns: [
            { name: 'patient_id',     type: 'INT',     key: 'PK' },
            { name: 'doctor_id',      type: 'INT',     key: '' },
            { name: 'treatment',      type: 'VARCHAR', key: '' },
            { name: 'treatment_date', type: 'DATE',    key: '' }
          ],
          data: [
            ['P01', 'D01', 'Khám tổng quát',     '2024-03-01'],
            ['P02', 'D02', 'Phẫu thuật ruột thừa','2024-03-05'],
            ['P01', 'D03', 'Xét nghiệm máu',      '2024-03-10'],
            ['P03', 'D01', 'Khám tim mạch',       '2024-03-12']
          ]
        },
        expected_sql: "SELECT treatment, treatment_date FROM treatments WHERE treatment_date > '2024-03-10';",
        hints: [
          { level: 1, text: 'Cần 2 cột: <code class="code">treatment</code> và <code class="code">treatment_date</code>' },
          { level: 2, text: 'Bảng <code class="code">treatments</code>, lọc <code class="code">treatment_date > \'2024-03-10\'</code>' },
          { level: 3, text: "<code class=\"code\">SELECT treatment, treatment_date FROM treatments WHERE treatment_date > '2024-03-10';</code>" }
        ],
        success_message: 'Hoàn thành BCNF! Bảng treatments giờ chỉ chứa sự kiện (FK + hành động + ngày). Bác sĩ và chuyên khoa đã được cô lập — cập nhật 1 chỗ, dữ liệu luôn nhất quán.',
        xp_reward: 80
      }
    },

    /* ========================================================================
     * BÀI 9 — 3NF & Sự thỏa hiệp (Compromise) — Store domain
     * ======================================================================== */
    {
      id: 'db_09', index: 9,
      title: 'Dạng chuẩn 3 (3NF) & Sự thỏa hiệp',
      subtitle: 'Khi nào chấp nhận dư thừa nhỏ để tăng tốc độ truy vấn',
      module: 5, module_title: 'Chuẩn hóa dữ liệu (Normal Forms)',
      estimated_minutes: 25, xp_reward: 80,
      project_piece: '🛡️ Phân hệ "Đặc vụ Guild tối ưu hệ thống"',
      drag_map: {
        table: {
          name: 'orders', col: 0, row: 5, width: 4, height: 1,
          columns: ['order_id', 'product_id', 'qty', 'total'],
          dataRows: [
            ['1001', 'P01', '2', '60.00'],
            ['1002', 'P02', '1', '45.00'],
            ['1003', 'P03', '3', '90.00'],
            ['1004', 'P01', '1', '30.00']
          ]
        }
      },

      step_1: {
        primer: {
          goal: [
            '3NF cấm phụ thuộc bắc cầu (transitive dependency): A → B → C',
            'Cột non-key không được quyết định cột non-key khác',
            '3NF linh hoạt hơn BCNF — cho phép một số dư thừa nếu phụ thuộc bảo toàn'
          ],
          intro: 'Bạn quản lý <strong>cửa hàng trực tuyến</strong>. Bảng <code class="code">orders</code> ghi: ai mua, mua gì, số lượng, giá, tổng. Bạn cũng muốn biết <em>quản lý</em> của <em>danh mục</em> sản phẩm. Vấn đề: <code class="code">order_id</code> → <code class="code">product_id</code> → <code class="code">category</code> → <code class="code">category_manager</code>. Cột <code class="code">category_manager</code> phụ thuộc BẮC CẦU vào <code class="code">order_id</code> qua trung gian <code class="code">category</code> → <strong>vi phạm 3NF</strong>.',
          example: '3NF khác BCNF ở chỗ: 3NF chấp nhận dư thừa nếu cột phụ thuộc là <em>khóa của bảng khác</em>. Ví dụ: trong bảng orders, cột <code class="code">product_name</code> phụ thuộc <code class="code">product_id</code> (khóa của bảng products) — vẫn OK theo 3NF, dù không lý tưởng. Đó là sự "thỏa hiệp" giữa tính chuẩn và tốc độ truy vấn.'
        },
        decomp_game: {
          rule_label: '3NF — Không phụ thuộc bắc cầu',
          rule: 'Trong bảng orders, order_id → product_id → category → category_manager. Cột category_manager bị phụ thuộc BẮC CẦU. Tách categories ra bảng riêng.',
          mission: 'Kéo các cột từ bảng <code>orders</code> vào 3 bảng mục tiêu. Cột <em>category_manager</em> bị phụ thuộc bắc cầu → phải đi về categories.',
          source_table: {
            name: 'orders',
            columns: [
              { name: 'order_id',         type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'product_id',       type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'product_name',     type: 'VARCHAR', key: '',   icon: '📦' },
              { name: 'category',         type: 'VARCHAR', key: 'PK', icon: '🔑' },
              { name: 'category_manager', type: 'VARCHAR', key: '',   icon: '⚠️' },
              { name: 'qty',              type: 'INT',     key: '',   icon: '#️⃣' },
              { name: 'price',            type: 'DECIMAL', key: '',   icon: '💰' },
              { name: 'order_date',       type: 'DATE',    key: '',   icon: '📅' },
              { name: 'product_id',       type: 'INT',     key: '',   icon: '🔗' },
              { name: 'category',         type: 'VARCHAR', key: '',   icon: '🔗' }
            ],
            data: [
              ['1001', 'P01', 'Elden Ring',  'Game',  'An',  '2', '30.00', '2024-04-01'],
              ['1002', 'P02', 'Hades',       'Game',  'An',  '1', '25.00', '2024-04-03'],
              ['1003', 'P03', 'Bàn phím cơ', 'Gear',  'Bình','3', '120.00','2024-04-05'],
              ['1004', 'P01', 'Elden Ring',  'Game',  'An',  '1', '30.00', '2024-04-08'],
              ['1005', 'P04', 'Chuột gaming','Gear',  'Bình','2', '50.00', '2024-04-10'],
              ['1006', 'P05', 'Màn hình 27"', 'Gear',  'Bình','1', '450.00','2024-04-12']
            ]
          },
          target_tables: [
            { name: 'categories', icon: '🗂️', description: 'Bảng danh mục (mỗi danh mục có 1 quản lý)' },
            { name: 'products',   icon: '📦', description: 'Bảng sản phẩm (FK category + name + price)' },
            { name: 'orders',     icon: '🛒', description: 'Bảng đơn hàng (FK product + qty + ngày)' }
          ],
          solution: {
            'categories': ['category', 'category_manager'],
            'products':   ['product_id', 'product_name', 'category', 'price'],
            'orders':     ['order_id', 'product_id', 'qty', 'order_date']
          },
          hint: 'Phụ thuộc bắc cầu: order_id → product_id → category → category_manager. category_manager chỉ cần category để xác định → tách ra. products giữ category vì nó là "khóa ngoại" tự nhiên.'
        },
        mission: 'Hoàn thành game kéo-thả để tách <code class="code">orders</code> thành <code class="code">categories</code>, <code class="code">products</code>, và <code class="code">orders</code>.'
      },

      step_2: {
        question: 'Khi nào một phụ thuộc hàm được gọi là BẮC CẦU (transitive)?',
        options: [
          { id: 'a', text: 'Khi X → Y → Z, tức Z phụ thuộc Y và Y phụ thuộc X', correct: true },
          { id: 'b', text: 'Khi cả X và Y đều là khóa chính', correct: false },
          { id: 'c', text: 'Khi bảng có nhiều hơn 3 cột', correct: false },
          { id: 'd', text: 'Khi bảng có khóa ngoại', correct: false }
        ]
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',     slot: 'kw-select' },
          { type: 'col', token: 'product_id', slot: 'col-1' },
          { type: 'col', token: 'qty',        slot: 'col-2' },
          { type: 'kw',  token: 'FROM',       slot: 'kw-from' },
          { type: 'tbl', token: 'orders',     slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',      slot: 'kw-where' },
          { type: 'col', token: 'qty',        slot: 'wcol-1' },
          { type: 'op',  token: '>',          slot: 'op-1' },
          { type: 'val', token: '2',          slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____ , ____',   accepts: ['kw', 'col'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',            accepts: ['kw', 'tbl'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____', accepts: ['kw', 'col', 'op', 'val'], multi: true }
        ],
        expected_sql: "SELECT product_id, qty FROM orders WHERE qty > 2;",
        reveal_hints: {
          'select-line': 'SELECT 2 cột: product_id và qty',
          'from-line':   'FROM orders',
          'where-line':  'Lọc theo qty > 2'
        }
      },

      step_4: {
        prompt: 'Tự gõ SQL! Từ bảng <code class="code">orders</code> (đã 3NF), lấy <code class="code">order_id</code> và <code class="code">product_id</code> của các đơn hàng từ ngày <code class="code">2024-04-05</code> trở đi.',
        schema: {
          table_name: 'orders',
          columns: [
            { name: 'order_id',   type: 'INT',     key: 'PK' },
            { name: 'product_id', type: 'INT',     key: '' },
            { name: 'qty',        type: 'INT',     key: '' },
            { name: 'order_date', type: 'DATE',    key: '' }
          ],
          data: [
            ['1001', 'P01', '2', '2024-04-01'],
            ['1002', 'P02', '1', '2024-04-03'],
            ['1003', 'P03', '3', '2024-04-05'],
            ['1004', 'P01', '1', '2024-04-08']
          ]
        },
        expected_sql: "SELECT order_id, product_id FROM orders WHERE order_date >= '2024-04-05';",
        hints: [
          { level: 1, text: 'Cần 2 cột: <code class="code">order_id</code> và <code class="code">product_id</code>' },
          { level: 2, text: 'Bảng <code class="code">orders</code>, lọc <code class="code">order_date >= \'2024-04-05\'</code>' },
          { level: 3, text: "<code class=\"code\">SELECT order_id, product_id FROM orders WHERE order_date >= '2024-04-05';</code>" }
        ],
        success_message: 'Hoàn thành 3NF! Phụ thuộc bắc cầu đã bị loại bỏ. Thực tế: đôi khi ta chấp nhận 1 chút dư thừa (denormalize) để tăng tốc truy vấn — đó là nghệ thuật của database engineer.',
        xp_reward: 80
      }
    },

    /* ========================================================================
     * BÀI 10 — BOSS BATTLE: 4 stages trên Mạng Xã Hội Gamers
     * ======================================================================== */
    {
      id: 'db_10', index: 10,
      title: 'Trận chiến cuối — Siêu hệ thống chuẩn hóa',
      subtitle: 'Tổng hợp mọi quy tắc — Boss battle Mạng Xã Hội Gamers',
      module: 6, module_title: 'Thiết kế hệ thống thực tế & Tối ưu hóa',
      estimated_minutes: 30, xp_reward: 100,
      project_piece: '👑 Mở khóa Vương Miện "Kiến Trúc Sư CSDL Nội tại"',
      drag_map: {
        table: {
          name: 'users', col: 0, row: 5, width: 4, height: 1,
          columns: ['user_id', 'username', 'country', 'is_premium'],
          dataRows: [
            ['U01', 'minh_gamer',   'VN', 'true'],
            ['U02', 'yuki_99',      'JP', 'false'],
            ['U03', 'sara_plays',   'VN', 'true'],
            ['U04', 'alex_pro',     'US', 'true']
          ]
        }
      },

      step_1: {
        primer: {
          goal: [
            'Áp dụng 1NF → 2NF → 3NF → BCNF tuần tự trên cùng một bảng phức tạp',
            'Mục tiêu: từ 1 bảng "siêu lộn xộn" thành schema sạch cho Mạng Xã Hội Gamers',
            'Đây là bài tổng hợp — chuẩn bị nhận Vương Miện Kiến Trúc Sư!'
          ],
          intro: 'BOSS BATTLE! Bạn nhận được một bảng <code class="code">gamers_social</code> khổng lồ — mỗi dòng chứa thông tin user + post + game + tag + platform, lẫn lộn. Bạn sẽ trải qua <strong>4 vòng chiến</strong>, mỗi vòng áp dụng 1 dạng chuẩn lên bảng trung gian. Mỗi stage sẽ có một bảng nhỏ hơn, tập trung vào một tập con cột.',
          example: 'Sau 4 vòng, bạn sẽ có một schema sạch cho Mạng Xã Hội Gamers: <code class="code">users</code>, <code class="code">posts</code>, <code class="code">games</code>, <code class="code">genres</code>, <code class="code">platforms</code>, và các bảng junction. Đó là sản phẩm thực tế của một Database Engineer chuyên nghiệp.'
        },
        decomp_game: {
          stages: [
            /* ═══ STAGE 1: 1NF — Tách post_tags (multi-value) ═══ */
            {
              stage_title: 'Tách tags ra khỏi post (1NF)',
              rule_label: '1NF — Nguyên tử hóa',
              rule: 'Bảng <code>posts</code> có cột <code>post_tags</code> chứa nhiều tag cách nhau bởi dấu phẩy (vd: "rpg, indie, soulslike") — vi phạm 1NF. Tách tag thành bảng riêng.',
              mission: 'Kéo các cột từ bảng <code>posts</code> vào 2 bảng mục tiêu.',
              source_table: {
                name: 'posts',
                columns: [
                  { name: 'post_id',    type: 'INT',     key: 'PK', icon: '🔑' },
                  { name: 'user_id',    type: 'INT',     key: '',   icon: '👤' },
                  { name: 'content',    type: 'VARCHAR', key: '',   icon: '📝' },
                  { name: 'post_date',  type: 'DATE',    key: '',   icon: '📅' },
                  { name: 'post_tags',  type: 'VARCHAR', key: '',   icon: '⚠️' },
                  { name: 'post_id',    type: 'INT',     key: '',   icon: '🔗' }
                ],
                data: [
                  ['P01', 'U01', 'Vừa clear Elden Ring!', '2024-05-01', 'rpg, soulslike, hard'],
                  ['P02', 'U02', 'Hades quá hay',         '2024-05-02', 'roguelike, indie'],
                  ['P03', 'U03', 'Stardew chill',         '2024-05-03', 'farming, cozy, indie']
                ]
              },
              target_tables: [
                { name: 'posts',     icon: '📝', description: 'Bảng bài viết (KHÔNG có tags)' },
                { name: 'post_tags', icon: '🏷️', description: 'Bảng nối post ↔ tag' }
              ],
              solution: {
                'posts':     ['post_id', 'user_id', 'content', 'post_date'],
                'post_tags': ['post_id', 'post_tags']
              },
              hint: 'Cột post_tags vi phạm 1NF (multi-value). Giữ nó nhưng tách sang bảng riêng — sau này sẽ chuẩn hóa tiếp.'
            },
            /* ═══ STAGE 2: 2NF — Tách users và games từ activities ═══ */
            {
              stage_title: 'Tách users và games (2NF)',
              rule_label: '2NF — Phụ thuộc hàm đầy đủ',
              rule: 'Bảng <code>user_activities</code> có composite key (user_id, game_id). Cột <code>username</code> chỉ phụ thuộc user_id; cột <code>game_title</code> chỉ phụ thuộc game_id → vi phạm 2NF.',
              mission: 'Kéo cột từ <code>user_activities</code> vào 3 bảng: users, games, user_activities.',
              source_table: {
                name: 'user_activities',
                columns: [
                  { name: 'user_id',         type: 'INT',     key: 'PK', icon: '🔑' },
                  { name: 'game_id',         type: 'INT',     key: 'PK', icon: '🔑' },
                  { name: 'username',        type: 'VARCHAR', key: '',   icon: '⚠️' },
                  { name: 'user_email',      type: 'VARCHAR', key: '',   icon: '⚠️' },
                  { name: 'game_title',      type: 'VARCHAR', key: '',   icon: '⚠️' },
                  { name: 'playtime_hours',  type: 'INT',     key: '',   icon: '⏱️' },
                  { name: 'last_played',     type: 'DATE',    key: '',   icon: '📅' },
                  { name: 'user_id',         type: 'INT',     key: '',   icon: '🔗' },
                  { name: 'game_id',         type: 'INT',     key: '',   icon: '🔗' }
                ],
                data: [
                  ['U01', 'G01', 'minh_gamer',  'minh@x.com',  'Elden Ring',  '120', '2024-05-01'],
                  ['U01', 'G02', 'minh_gamer',  'minh@x.com',  'Hades',       '45',  '2024-05-02'],
                  ['U02', 'G01', 'yuki_99',     'yuki@x.com',  'Elden Ring',  '200', '2024-05-03'],
                  ['U02', 'G03', 'yuki_99',     'yuki@x.com',  'Stardew',     '80',  '2024-05-04'],
                  ['U03', 'G02', 'sara_plays',  'sara@x.com',  'Hades',       '60',  '2024-05-05']
                ]
              },
              target_tables: [
                { name: 'users',           icon: '👤', description: 'Bảng người chơi' },
                { name: 'games',           icon: '🎮', description: 'Bảng trò chơi' },
                { name: 'user_activities', icon: '⏱️', description: 'Bảng hoạt động (chỉ FK + playtime + date)' }
              ],
              solution: {
                'users':           ['user_id', 'username', 'user_email'],
                'games':           ['game_id', 'game_title'],
                'user_activities': ['user_id', 'game_id', 'playtime_hours', 'last_played']
              },
              hint: 'Composite key (user_id, game_id). username chỉ cần user_id → rời đi. game_title chỉ cần game_id → rời đi. playtime cần CẢ HAI → ở lại.'
            },
            /* ═══ STAGE 3: 3NF — Tách genres từ games ═══ */
            {
              stage_title: 'Tách genres (3NF)',
              rule_label: '3NF — Phụ thuộc bắc cầu',
              rule: 'Bảng <code>games</code>: game_id → genre → genre_description. Cột genre_description bị phụ thuộc bắc cầu. Tách genres ra bảng riêng.',
              mission: 'Kéo cột từ <code>games</code> vào 2 bảng: games, genres.',
              source_table: {
                name: 'games',
                columns: [
                  { name: 'game_id',           type: 'INT',     key: 'PK', icon: '🔑' },
                  { name: 'game_title',        type: 'VARCHAR', key: '',   icon: '🎮' },
                  { name: 'genre',             type: 'VARCHAR', key: 'PK', icon: '🔑' },
                  { name: 'genre_description', type: 'VARCHAR', key: '',   icon: '⚠️' },
                  { name: 'release_year',      type: 'INT',     key: '',   icon: '📅' },
                  { name: 'genre',             type: 'VARCHAR', key: '',   icon: '🔗' }
                ],
                data: [
                  ['G01', 'Elden Ring',  'Soulslike',  'Game nhập vai khó, đánh boss cường độ cao',  '2022'],
                  ['G02', 'Hades',       'Roguelike',  'Game hành động chạy đi chạy lại mỗi lần chết','2020'],
                  ['G03', 'Stardew',     'Cozy',       'Game nông trại thư giãn, không chiến đấu',    '2016'],
                  ['G04', 'Dark Souls',  'Soulslike',  'Game nhập vai khó, đánh boss cường độ cao',  '2011']
                ]
              },
              target_tables: [
                { name: 'genres', icon: '🗂️', description: 'Bảng thể loại game' },
                { name: 'games',  icon: '🎮', description: 'Bảng trò chơi (FK genre + title + year)' }
              ],
              solution: {
                'genres': ['genre', 'genre_description'],
                'games':  ['game_id', 'game_title', 'genre', 'release_year']
              },
              hint: 'Phụ thuộc bắc cầu: game_id → genre → genre_description. genre_description chỉ cần genre → tách ra. games vẫn giữ genre làm FK.'
            },
            /* ═══ STAGE 4: BCNF — Tách platforms từ games (multi-value) ═══ */
            {
              stage_title: 'Tách platforms (BCNF)',
              rule_label: 'BCNF — Siêu khóa',
              rule: 'Bảng <code>games_platforms</code> có cột <code>platforms</code> chứa nhiều platform (vd: "PC, PS5, Switch") — multi-value, vi phạm BCNF. Tách platform thành bảng riêng.',
              mission: 'Kéo cột từ <code>games_platforms</code> vào 2 bảng: games, game_platforms.',
              source_table: {
                name: 'games_platforms',
                columns: [
                  { name: 'game_id',    type: 'INT',     key: 'PK', icon: '🔑' },
                  { name: 'game_title', type: 'VARCHAR', key: '',   icon: '🎮' },
                  { name: 'platforms',  type: 'VARCHAR', key: '',   icon: '⚠️' },
                  { name: 'game_id',    type: 'INT',     key: '',   icon: '🔗' }
                ],
                data: [
                  ['G01', 'Elden Ring',  'PC, PS5, Xbox'],
                  ['G02', 'Hades',       'PC, Switch'],
                  ['G03', 'Stardew',     'PC, Switch, PS4, Xbox'],
                  ['G04', 'Dark Souls',  'PC, PS4, Xbox']
                ]
              },
              target_tables: [
                { name: 'games',           icon: '🎮', description: 'Bảng trò chơi (chỉ chứa thông tin game)' },
                { name: 'game_platforms',  icon: '🖥️', description: 'Bảng nối game ↔ platform' }
              ],
              solution: {
                'games':          ['game_id', 'game_title'],
                'game_platforms': ['game_id', 'platforms']
              },
              hint: 'Cột platforms multi-value (một game chạy nhiều platform). Tách thành junction table — mỗi dòng là 1 game-platform pair.'
            }
          ]
        },
        mission: 'Hoàn thành 4 vòng chiến bằng cách tách dần bảng <code class="code">gamers_social</code> khổng lồ thành schema sạch: <code class="code">users</code>, <code class="code">posts</code>, <code class="code">games</code>, <code class="code">genres</code>, <code class="code">platforms</code>, và các bảng junction.'
      },

      step_2: {
        question: 'Sau khi áp dụng đầy đủ 1NF → 2NF → 3NF → BCNF, Mạng Xã Hội Gamers nên có tối thiểu bao nhiêu bảng?',
        options: [
          { id: 'a', text: '1 bảng (gamers_social)', correct: false },
          { id: 'b', text: '2 bảng (users + games)', correct: false },
          { id: 'c', text: '5 bảng (users, posts, games, genres, platforms + 2-3 junction)', correct: true },
          { id: 'd', text: '20 bảng (mỗi user một bảng riêng)', correct: false }
        ]
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',     slot: 'kw-select' },
          { type: 'col', token: 'username',   slot: 'col-1' },
          { type: 'col', token: 'country',    slot: 'col-2' },
          { type: 'kw',  token: 'FROM',       slot: 'kw-from' },
          { type: 'tbl', token: 'users',      slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',      slot: 'kw-where' },
          { type: 'col', token: 'is_premium', slot: 'wcol-1' },
          { type: 'op',  token: '=',          slot: 'op-1' },
          { type: 'val', token: 'true',       slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____ , ____',   accepts: ['kw', 'col'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',            accepts: ['kw', 'tbl'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____', accepts: ['kw', 'col', 'op', 'val'], multi: true }
        ],
        expected_sql: "SELECT username, country FROM users WHERE is_premium = true;",
        reveal_hints: {
          'select-line': 'SELECT 2 cột: username và country',
          'from-line':   'FROM users',
          'where-line':  'Lọc is_premium = true (boolean, không cần dấu nháy)'
        }
      },

      step_4: {
        prompt: 'Tự gõ SQL! Từ bảng <code class="code">users</code> (bảng đã chuẩn hóa sau 4 vòng), lấy <code class="code">username</code> và <code class="code">country</code> của người dùng <code class="code">is_premium = true</code>.',
        schema: {
          table_name: 'users',
          columns: [
            { name: 'user_id',    type: 'INT',     key: 'PK' },
            { name: 'username',   type: 'VARCHAR', key: '' },
            { name: 'user_email', type: 'VARCHAR', key: '' },
            { name: 'country',    type: 'VARCHAR', key: '' },
            { name: 'is_premium', type: 'BOOLEAN', key: '' }
          ],
          data: [
            ['U01', 'minh_gamer', 'minh@x.com', 'VN', 'true'],
            ['U02', 'yuki_99',    'yuki@x.com', 'JP', 'false'],
            ['U03', 'sara_plays', 'sara@x.com', 'VN', 'true'],
            ['U04', 'alex_pro',   'alex@x.com', 'US', 'true']
          ]
        },
        expected_sql: "SELECT username, country FROM users WHERE is_premium = true;",
        hints: [
          { level: 1, text: 'Cần 2 cột: <code class="code">username</code> và <code class="code">country</code>' },
          { level: 2, text: 'Bảng <code class="code">users</code>, lọc <code class="code">is_premium = true</code> (boolean không cần nháy)' },
          { level: 3, text: "<code class=\"code\">SELECT username, country FROM users WHERE is_premium = true;</code>" }
        ],
        success_message: '👑 CHÚC MỪNG! Bạn đã trở thành KIẾN TRÚC SƯ CSDL! Bạn đã chinh phục 10 bài, từ Entity/PK cơ bản đến chuẩn hóa nâng cao trên hệ thống Mạng Xã Hội Gamers phức tạp. Vương Miện Kiến Trúc Sư CSDL Nội tại đã thuộc về bạn!',
        xp_reward: 100
      }
    }
  ]
};
