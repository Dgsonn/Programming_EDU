/* ============================================================================
 * LESSON_CONTENT — Database Design course
 * 4-step pipeline data: Step 1 (Theory+Visual) → Step 2 (MCQ) →
 *                       Step 3 (Hybrid Drag-Query + Reveal) → Step 4 (Pure Code)
 *
 * 18 bài (db_01..db_18) đều có content đầy đủ — curriculum chia 3 module:
 *   - Module 1 (db_01..db_06): ER Model & Mapping — Silberschatz Ch 6
 *   - Module 2 (db_07..db_13): Normalization (FD, 1NF→BCNF, Boss Battle) — Ch 7
 *   - Module 3 (db_14..db_18): Application Design (JSON, Spatial, ORM, SQLi, Password) — Ch 8-9
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
  total_lessons: 18,
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
      challenge_type: 'full_ide',

      /* ----- STEP 1: Theory (Layer 0 + Layer 1) — Premium v4 ----- */
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
        concept_cards: [
          {
            icon: 'fa-cube',
            title: 'Entity Set (Tập thực thể)',
            body: 'Một nhóm các thực thể cùng loại. Trong CSDL, entity set ↔ 1 table. Mỗi entity (dòng) là 1 thể hiện cụ thể của tập đó.'
          },
          {
            icon: 'fa-key',
            title: 'Primary Key (Khóa chính)',
            body: 'Cột có giá trị DUY NHẤT cho mỗi dòng. Không trùng, không NULL. Khi truy vấn với <code>WHERE pk = X</code>, chỉ chọn đúng 1 record.'
          }
        ],
        visual: {
          diagram: {
            type: 'er',
            width: 600, height: 220,
            entities: [
              {
                name: 'game_catalog',
                columns: [
                  { name: 'id',     type: 'INT',      key: 'PK' },
                  { name: 'name',   type: 'VARCHAR' },
                  { name: 'genre',  type: 'VARCHAR' },
                  { name: 'price',  type: 'INT' }
                ]
              }
            ],
            note: 'Bài 1: 1 entity đơn. Bài 3+ sẽ thêm connector giữa các entity.'
          },
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
          { id: 'select-line',  placeholder: 'SELECT ____ , ____', accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',    placeholder: 'FROM ____',          accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',   placeholder: 'WHERE ____ ____ ____', accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE'], multi: true }
        ],
        expected_sql: 'SELECT name, price FROM game_catalog WHERE id = 101;',
        reveal_hints: {
          'select-line': 'Bắt đầu bằng <strong>SELECT</strong>, kéo 2 cột: <strong>name</strong> và <strong>price</strong>.',
          'from-line':   'Tiếp: <strong>FROM</strong> + tên bảng <strong>game_catalog</strong>.',
          'where-line':  'Cuối: <strong>WHERE</strong> lọc đúng 1 dòng bằng PK: <strong>id = 101</strong>.'
        }
      },

      /* ----- STEP 4: Pure code (Premium v4 — schema + starter đầy đủ) ----- */
      step_4: {
        prompt: 'Khách muốn biết <strong>name</strong> và <strong>price</strong> của game có <code>id = 101</code>. Viết query SQL trong editor bên phải.',
        schema: {
          table_name: 'game_catalog',
          columns: [
            { name: 'id',     type: 'INT',      key: 'PK', icon: '🔑' },
            { name: 'name',   type: 'VARCHAR',  key: '',   icon: '' },
            { name: 'genre',  type: 'VARCHAR',  key: '',   icon: '' },
            { name: 'price',  type: 'INT',      key: '',   icon: '' }
          ],
          data: [
            ['101','Elden Ring','Action RPG','60'],
            ['102','God of War','Action','50'],
            ['103','Hades','Rogue-like','25'],
            ['104','Elden Ring','Card Game','15']
          ]
        },
        starter: '-- Tìm name + price của game có id = 101\n-- Gợi ý: SELECT <cột> FROM <bảng> WHERE <điều kiện>;\n',
        expected_sql: 'SELECT name, price FROM game_catalog WHERE id = 101;',
        hints: [
          { level: 1, text: 'Cần lấy 2 cột: <code>name</code> và <code>price</code>.' },
          { level: 2, text: 'Lọc đúng 1 dòng bằng PK: <code>WHERE id = 101</code>.' },
          { level: 3, text: 'Cú pháp: <code>SELECT col1, col2 FROM table WHERE pk = value;</code>' },
          { level: 4, text: '<code>SELECT name, price FROM game_catalog WHERE id = 101;</code>' }
        ],
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
      challenge_type: 'full_ide',
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
            'Derived Attribute = cột KHÔNG lưu, hệ thống tự tính khi truy vấn (vd: age = currentYear - birthYear)',
            'Dùng AS để đặt tên cột ảo cho giá trị dẫn xuất'
          ],
          intro: 'Trong ER diagram, một thuộc tính có thể là <strong>Composite</strong> (gồm nhiều mảnh: address = city + district + street) hoặc <strong>Derived</strong> (tính toán từ thuộc tính khác: age = currentYear - birthYear). Khi chuyển sang bảng vật lý, ta <em>tách</em> composite thành nhiều cột độc lập, và <em>không lưu</em> derived — chỉ tính khi SELECT.',
          example: 'Bảng <code class="code">player_profile</code> dưới đây đã tách address thành <code>address_city</code> + <code>address_dist</code>. Cột <code>age</code> KHÔNG tồn tại vật lý — sẽ được tính bằng <code>(EXTRACT(YEAR FROM CURRENT_DATE) - birth_year) AS age</code>.'
        },
        concept_cards: [{'icon': 'fa-puzzle-piece', 'title': 'Composite Attribute (Phức hợp)', 'body': 'Một thuộc tính ghép từ nhiều mảnh nhỏ. <code>address = city + district + street</code>. Khi chuyển sang bảng, tách thành nhiều cột độc lập.'}, {'icon': 'fa-calculator', 'title': 'Derived Attribute (Dẫn xuất)', 'body': 'Giá trị TÍNH TOÁN từ thuộc tính khác. <code>age = currentYear - birthYear</code>. <strong>KHÔNG lưu</strong> vật lý — chỉ tính khi <code>SELECT</code> với <code>AS</code>.'}],
                visual: {
          
          diagram: {'type': 'er', 'width': 600, 'height': 240, 'entities': [{'name': 'player_profile', 'columns': [{'name': 'p_id', 'type': 'INT', 'key': 'PK'}, {'name': 'username', 'type': 'VARCHAR'}, {'name': 'address_city', 'type': 'VARCHAR'}, {'name': 'address_dist', 'type': 'VARCHAR'}, {'name': 'birth_year', 'type': 'INT', 'derived': true, 'note': 'age'}]}], 'note': 'address = composite (city + dist) · age = derived (KHÔNG lưu)'},
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
          { type: 'fn',  token: '(EXTRACT(YEAR FROM CURRENT_DATE) - birth_year) AS age', slot: 'col-4' },
          { type: 'kw',  token: 'FROM',             slot: 'kw-from' },
          { type: 'tbl', token: 'player_profile',   slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',            slot: 'kw-where' },
          { type: 'col', token: 'p_id',             slot: 'wcol' },
          { type: 'op',  token: '=',                slot: 'op' },
          { type: 'val', token: '7',                slot: 'val' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____ , ____ , ____ , ____', accepts: ['kw', 'col', 'fn'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',                          accepts: ['kw', 'tbl'],     multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',               accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE'], multi: true }
        ],
        expected_sql: 'SELECT username, address_city, address_dist, (EXTRACT(YEAR FROM CURRENT_DATE) - birth_year) AS age FROM player_profile WHERE p_id = 7;',
        reveal_hints: {
          'select-line': 'SELECT 4 thứ: <strong>username</strong>, 2 mảnh địa chỉ (<strong>address_city</strong>, <strong>address_dist</strong>), và cụm tính tuổi (<strong>(EXTRACT(YEAR FROM CURRENT_DATE) - birth_year) AS age</strong>).',
          'from-line':   'FROM bảng <strong>player_profile</strong>.',
          'where-line':  'WHERE chốt đúng 1 người: <strong>p_id = 7</strong>.'
        }
      },

      step_4: {
        prompt: 'Hoàn thiện câu SQL dưới đây — điền các từ/cột còn thiếu vào ô trống:',
        starter: '-- Tính username + 2 mảnh địa chỉ + cột ảo age\n-- AS dùng để đặt tên cột ảo\nSELECT username, address_city, address_dist, (EXTRACT(YEAR FROM CURRENT_DATE) - birth_year) AS age\n  FROM player_profile\n WHERE p_id = 7;',
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
        hints: [
          { level: 1, text: 'Bạn cần lấy <em>nhiều cột</em> + tính <em>cột ảo</em> từ birth_year → tuổi. Hãy nghĩ: <code>EXTRACT(YEAR FROM CURRENT_DATE) - birth_year</code> cho ra tuổi hiện tại.' },
          { level: 2, text: 'SELECT 4 cột: <code>username</code>, <code>address_city</code>, <code>address_dist</code>, và cột tính tuổi.' },
          { level: 3, text: 'Cột ảo tuổi: <code>(EXTRACT(YEAR FROM CURRENT_DATE) - birth_year) AS age</code> — dùng <code>AS</code> để đặt tên.' },
          { level: 4, text: '<code class="code">SELECT username, address_city, address_dist, (EXTRACT(YEAR FROM CURRENT_DATE) - birth_year) AS age FROM player_profile WHERE p_id = 7;</code>' }
        ],
        expected_sql: 'SELECT username, address_city, address_dist, (EXTRACT(YEAR FROM CURRENT_DATE) - birth_year) AS age FROM player_profile WHERE p_id = 7;',
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
        concept_cards: [{'icon': 'fa-link', 'title': 'Foreign Key (Khóa ngoại)', 'body': 'Cột trong bảng này <em>tham chiếu</em> đến PK của bảng khác. <code>game.pub_id → publisher.pub_id</code>. Đảm bảo <strong>referential integrity</strong>.'}, {'icon': 'fa-object-group', 'title': 'JOIN — nối 2 bảng', 'body': 'Dùng <code>JOIN ... ON</code> để nối bảng qua FK. <code>SELECT g.title, p.name FROM game g JOIN publisher p ON g.pub_id = p.pub_id</code>.'}],
                visual: {
          
          diagram: {'type': 'er', 'width': 600, 'height': 280, 'entities': [{'name': 'game', 'columns': [{'name': 'game_id', 'type': 'INT', 'key': 'PK'}, {'name': 'title', 'type': 'VARCHAR'}, {'name': 'pub_id', 'type': 'INT', 'key': 'FK'}]}, {'name': 'publisher', 'columns': [{'name': 'pub_id', 'type': 'INT', 'key': 'PK'}, {'name': 'name', 'type': 'VARCHAR'}, {'name': 'country', 'type': 'VARCHAR'}]}], 'connectors': [{'from': 'game', 'to': 'publisher', 'label': 'published_by', 'fromCard': 'N', 'toCard': '1'}], 'note': 'N game thuộc về 1 publisher. Mũi tên từ game.pub_id → publisher.pub_id'},
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
          { id: 'select-line', placeholder: 'SELECT ____',                                  accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____ JOIN ____ ON ____',                  accepts: ['kw', 'tbl', 'col'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',                          accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE'], multi: true }
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
      title: 'Foreign Key & Mối quan hệ 1:N',
      subtitle: 'Khóa ngoại — cầu nối giữa các entity',
      module: 1, module_title: 'Giới thiệu & Nền tảng Database',
      estimated_minutes: 22, xp_reward: 55,
      project_piece: '🌉 Khởi động "Cầu nối Liên Bảng"',
      drag_type: 'connector',
      challenge_type: 'full_ide',
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
        concept_cards: [{'icon': 'fa-arrows-left-right', 'title': 'M:N — Many-to-Many', 'body': '1 học sinh học N môn. 1 môn có N học sinh. Không thể lưu trực tiếp — cần <strong>1 bảng trung gian (junction table)</strong>.'}, {'icon': 'fa-table-list', 'title': 'Junction Table', 'body': 'Bảng chỉ chứa 2 FK (đôi khi + thuộc tính riêng như <code>enrolled_at</code>). PK thường là cặp 2 FK ghép. <code>enrollment(student_id, course_id)</code>.'}],
                visual: {
          
          diagram: {'type': 'er', 'width': 620, 'height': 280, 'entities': [{'name': 'student', 'columns': [{'name': 'student_id', 'type': 'INT', 'key': 'PK'}, {'name': 'name', 'type': 'VARCHAR'}]}, {'name': 'course', 'columns': [{'name': 'course_id', 'type': 'INT', 'key': 'PK'}, {'name': 'title', 'type': 'VARCHAR'}]}, {'name': 'enrollment', 'columns': [{'name': 'student_id', 'type': 'INT', 'key': 'FK,PK'}, {'name': 'course_id', 'type': 'INT', 'key': 'FK,PK'}, {'name': 'enrolled_at', 'type': 'DATE'}]}], 'connectors': [{'from': 'student', 'to': 'enrollment', 'fromCard': '1', 'toCard': 'N', 'label': 'enrolls'}, {'from': 'course', 'to': 'enrollment', 'fromCard': '1', 'toCard': 'N', 'label': 'has'}], 'note': 'M:N qua bảng trung gian. 2 FK + PK ghép.'},
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
          { id: 'select-line', placeholder: 'SELECT ____',                                 accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____ JOIN ____ ON ____ JOIN ____ ON ____', accepts: ['kw', 'tbl', 'col'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',                          accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE'], multi: true }
        ],
        expected_sql: "SELECT game.title FROM player JOIN player_game_library ON player.p_id = player_game_library.ref_p_id JOIN game ON player_game_library.ref_game_id = game.game_id WHERE player.username = 'DragonLord';",
        reveal_hints: {
          'select-line': 'SELECT 1 cột: <strong>game.title</strong>.',
          'from-line':   'Chuỗi 2 JOIN: <strong>player</strong> → <strong>player_game_library</strong> (nối qua p_id) → <strong>game</strong> (nối qua ref_game_id).',
          'where-line':  "WHERE lọc người: <strong>player.username = 'DragonLord'</strong>."
        }
      },

      step_4: {
        prompt: 'Từ 3 bảng <code>player</code>, <code>player_game_library</code>, <code>game</code>: tìm <code>title</code> của các game mà player tên <em>DragonLord</em> đang sở hữu. Viết query SQL trong editor bên phải.',
        starter: "-- Tìm title game của player 'DragonLord'\n-- JOIN 3 bảng: player ↔ player_game_library ↔ game\nSELECT game.\n  FROM player\n  JOIN player_game_library ON player. = player_game_library.\n  JOIN game ON player_game_library. = game.\n WHERE player. = ;\n",
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
        hints: [
          { level: 1, text: 'Bạn cần <em>nối 3 bảng</em> qua các FK: <code>player.p_id</code> ↔ <code>player_game_library.ref_p_id</code> ↔ <code>player_game_library.ref_game_id</code> ↔ <code>game.game_id</code>.' },
          { level: 2, text: 'SELECT 1 cột: <code>game.title</code>. Filter username = \'DragonLord\'.' },
          { level: 3, text: 'JOIN thứ 1: <code>player p JOIN player_game_library l ON p.p_id = l.ref_p_id</code>. JOIN thứ 2: <code>JOIN game g ON l.ref_game_id = g.game_id</code>.' },
          { level: 4, text: '<code class="code">SELECT g.title FROM player p JOIN player_game_library l ON p.p_id = l.ref_p_id JOIN game g ON l.ref_game_id = g.game_id WHERE p.username = \'DragonLord\';</code>' }
        ],
        expected_sql: "SELECT game.title FROM player JOIN player_game_library ON player.p_id = player_game_library.ref_p_id JOIN game ON player_game_library.ref_game_id = game.game_id WHERE player.username = 'DragonLord';",
        success_message: 'Đỉnh! Bạn đã JOIN 3 bảng thành thạo qua FK chain. Bài 5 sẽ học về Thực thể yếu (Weak Entity) — loại thực thể cần cha để tồn tại.',
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
      title: 'Mối quan hệ M:N & Bảng trung gian',
      subtitle: 'Nhiều-nhiều — chia trung gian để về 1:N',
      module: 1, module_title: 'Giới thiệu & Nền tảng Database',
      estimated_minutes: 24, xp_reward: 60,
      project_piece: '🧩 Khởi động "Máy Chia Trung Gian"',
      drag_type: 'chip',
      challenge_type: 'full_ide',
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
        concept_cards: [{'icon': 'fa-link-slash', 'title': 'Weak Entity (Thực thể yếu)', 'body': 'Thực thể <strong>không có PK riêng</strong>, phải dựa vào owner entity để định danh. VD: <code>room</code> trong <code>building</code> — phòng 101 KHÔNG duy nhất nếu không biết building nào.'}, {'icon': 'fa-key', 'title': 'Partial Key + Identifying Relationship', 'body': '<strong>Partial key</strong> = khóa phân biệt trong phạm vi owner (vd: <code>room_number</code>). <strong>Identifying relationship</strong> = đường nét đôi trong ER, FK gồm cả PK của owner.'}],
                visual: {
          
          diagram: {'type': 'er', 'width': 600, 'height': 280, 'entities': [{'name': 'building', 'columns': [{'name': 'bld_id', 'type': 'INT', 'key': 'PK'}, {'name': 'address', 'type': 'VARCHAR'}]}, {'name': 'room', 'weak': true, 'columns': [{'name': 'bld_id', 'type': 'INT', 'key': 'FK,PK'}, {'name': 'room_number', 'type': 'INT', 'key': 'PK(partial)'}, {'name': 'capacity', 'type': 'INT'}]}], 'connectors': [{'from': 'building', 'to': 'room', 'label': 'contains', 'fromCard': '1', 'toCard': 'N'}], 'note': 'room là WEAK entity (viền đứt nét). PK ghép: (bld_id, room_number)'},
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
          { id: 'select-line', placeholder: 'SELECT ____',                                  accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',                                     accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____ ____ ____ ____ ____',      accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE'], multi: true }
        ],
        expected_sql: "SELECT dlc_name FROM dlc_content WHERE dlc_no = 1 AND ref_game_id = 400;",
        reveal_hints: {
          'select-line': 'SELECT 1 cột: <strong>dlc_name</strong>.',
          'from-line':   'FROM <strong>dlc_content</strong>.',
          'where-line':  "WHERE khóa tổng hợp: <strong>dlc_no = 1 AND ref_game_id = 400</strong> (thiếu AND → trả về nhầm DLC của game khác)."
        }
      },

      step_4: {
        prompt: 'Lấy <code>dlc_name</code> của gói DLC số <strong>2</strong> thuộc game id <strong>300</strong>. Viết query SQL trong editor bên phải.',
        starter: "-- Lấy dlc_name của DLC #2 thuộc game id 300\n-- Filter: dlc_no = 2 AND ref_game_id = 300\nSELECT \n  FROM \n WHERE  = \n   AND  = ;\n",
        schema: {
          table_name: 'dlc_content',
          columns: [
            { name: 'dlc_id',       type: 'INT',     key: 'PK' },
            { name: 'ref_game_id',  type: 'INT',     key: 'FK' },
            { name: 'dlc_no',       type: 'INT',     key: '' },
            { name: 'dlc_name',     type: 'VARCHAR', key: '' }
          ],
          data: [
            ['1', '300', '1', 'Elden Ring - DLC 1'],
            ['2', '300', '2', 'Elden Ring - DLC 2'],
            ['3', '400', '1', 'Hades - DLC 1'],
            ['4', '400', '2', 'Hades - DLC 2']
          ]
        },
        expected_sql: 'SELECT dlc_name FROM dlc_content WHERE dlc_no = 2 AND ref_game_id = 300;',
        hints: [{'level': 1, 'text': 'Loại trừ đáp án <code>SELECT dlc_name FROM dlc_content WHERE dlc_no = 2;</code> — Sai: thiếu ref_game_id nên trả về cả 2 dòng DLC #2 (của game 300 + 400).'}, {'level': 2, 'text': 'Loại trừ đáp án <code>SELECT dlc_name FROM dlc_content WHERE ref_game_id = 300;</code> — Sai: ref_game_id chỉ đủ để biết là DLC của game 300, nhưng không định danh được DLC #1 hay #2 → trả về cả 2 dòng.'}, {'level': 3, 'text': 'Loại trừ đáp án <code>SELECT dlc_name FROM dlc_content WHERE dlc_name = </code> — Sai logic: lọc theo name (không phải PK) sẽ đúng trong data này nhưng phá vỡ tính định danh — không dùng tên làm định danh được.'}, {'level': 4, 'text': '<code class="code">SELECT dlc_name FROM dlc_content WHERE dlc_no = 2 AND ref_game_id = 300;</code>'}],
        success_message: 'Bài 6 sẽ bắt đầu Module 2 — phát hiện dư thừa (Redundancy) & Phụ thuộc hàm (Functional Dependency) — nền tảng của chuẩn hóa dữ liệu.',
        xp_reward: 30
      }
    },

    /* ========================================================================
     * BÀI 6 — Mapping ER → Relational Tables
     * Concept: Quy tắc ánh xạ từ ER Diagram sang bảng vật lý
     * ======================================================================== */
    {
      id: 'db_06', index: 6,
      title: 'Mapping ER → Bảng quan hệ',
      subtitle: 'Quy tắc ánh xạ Entity Set, Relationship, Multi-valued sang bảng vật lý',
      module: 1, module_title: 'Giới thiệu & Nền tảng Database',
      estimated_minutes: 22, xp_reward: 65,
      project_piece: '🗺️ Mở khóa "Bản đồ dịch ER → Bảng"',
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'game_mapping_demo',
          columns: ['game_id', 'title', 'pub_id', 'genre'],
          dataRows: [
            ['101', 'Elden Ring',     '10', 'Soulslike'],
            ['102', 'God of War',     '20', 'Action'],
            ['103', 'Hades',          '30', 'Roguelike']
          ]
        }
      },

      step_1: {
        primer: {
          goal: [
            'Mỗi Entity Set → 1 bảng quan hệ',
            'Mỗi Attribute đơn → 1 cột trong bảng',
            'Quan hệ 1:N đặt FK ở phía N; M:N tạo Junction Table; Weak Entity dùng composite PK'
          ],
          intro: 'Có ER Diagram đẹp đẽ nhưng DB không hiểu hình vẽ — phải <strong>ánh xạ (mapping)</strong> sang bảng vật lý. Silberschatz định nghĩa 7 quy tắc mapping trong Ch 6.7: <em>Mỗi entity set mạnh → 1 bảng; mỗi weak entity set → 1 bảng với PK tổng hợp; mỗi 1:1 → FK ở 1 bên; 1:N → FK ở phía N; M:N → junction table riêng; multi-valued attribute → bảng riêng.</em>',
          example: 'ER có <code>Game</code> (entity mạnh) + <code>Publisher</code> (entity mạnh) + quan hệ <em>publishes</em> (1:N — 1 publisher xuất bản nhiều game). Mapping: tạo bảng <code>game(game_id PK, title, pub_id FK)</code> và <code>publisher(id PK, name)</code>. FK <code>pub_id</code> nằm phía N (game) — đúng quy tắc.'
        },
        concept_cards: [{'icon': 'fa-arrow-right-arrow-left', 'title': 'ER → Relational Mapping', 'body': 'Quy tắc: <strong>Entity set → Table</strong>. Mỗi attribute đơn → cột. PK của entity → PK của table. M:N + multivalued → bảng riêng.'}, {'icon': 'fa-diagram-project', 'title': '7 bước mapping (Silberschatz Ch 6.7)', 'body': 'B1: Entity mạnh → table. B2: Weak entity → table có FK + partial key. B3: Binary 1:1 → FK ở 1 bên. B4: Binary 1:N → FK ở bên N. B5: Binary M:N → bảng riêng. B6: Multivalued → bảng riêng. B7: Derived → KHÔNG lưu.'}],
                visual: {
          
          diagram: {'type': 'er', 'width': 600, 'height': 280, 'entities': [{'name': 'employee', 'columns': [{'name': 'emp_id', 'type': 'INT', 'key': 'PK'}, {'name': 'name', 'type': 'VARCHAR'}, {'name': 'dept_id', 'type': 'INT', 'key': 'FK'}]}, {'name': 'department', 'columns': [{'name': 'dept_id', 'type': 'INT', 'key': 'PK'}, {'name': 'dept_name', 'type': 'VARCHAR'}]}, {'name': 'project', 'columns': [{'name': 'proj_id', 'type': 'INT', 'key': 'PK'}, {'name': 'proj_name', 'type': 'VARCHAR'}]}, {'name': 'works_on', 'columns': [{'name': 'emp_id', 'type': 'INT', 'key': 'FK,PK'}, {'name': 'proj_id', 'type': 'INT', 'key': 'FK,PK'}, {'name': 'hours', 'type': 'INT'}]}], 'connectors': [{'from': 'employee', 'to': 'department', 'label': 'belongs_to', 'fromCard': 'N', 'toCard': '1'}, {'from': 'employee', 'to': 'works_on', 'label': 'works', 'fromCard': '1', 'toCard': 'N'}, {'from': 'project', 'to': 'works_on', 'label': 'has', 'fromCard': '1', 'toCard': 'N'}], 'note': '3 entity + 1 junction. Bài 6: áp dụng 7 bước mapping để tạo table vật lý.'},
          schema: {
            table_name: 'game',
            columns: [
              { name: 'game_id',  type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'title',    type: 'VARCHAR', key: '',   icon: '🎮' },
              { name: 'pub_id',   type: 'INT',     key: 'FK', icon: '🔗' },
              { name: 'genre',    type: 'VARCHAR', key: '',   icon: '🏷️' }
            ]
          },
          data_preview: [
            ['101', 'Elden Ring',  '10', 'Soulslike'],
            ['102', 'God of War',  '20', 'Action'],
            ['103', 'Hades',       '30', 'Roguelike'],
            ['104', 'Stardew',     '40', 'Cozy']
          ],
          related_tables: [
            {
              name: 'publisher',
              columns: [
                { name: 'id',   type: 'INT',     key: 'PK', icon: '🔑' },
                { name: 'name', type: 'VARCHAR', key: '',   icon: '🏢' }
              ],
              data: [
                ['10', 'FromSoftware'],
                ['20', 'Sony Santa Monica'],
                ['30', 'Supergiant'],
                ['40', 'ConcernedApe']
              ]
            }
          ]
        },
        mission: 'Lấy <code>title</code> của tất cả game do <code>FromSoftware</code> xuất bản — quan sát FK <code>pub_id</code> ánh xạ từ quan hệ 1:N.'
      },

      step_2: {
        mcq: [
          {
            question: 'Khi mapping quan hệ 1:N từ ER sang bảng quan hệ, Foreign Key nên đặt ở đâu?',
            options: [
              { id: 'a', text: 'Đặt FK ở phía "1" (bảng bên nhiều quan hệ)', correct: false },
              { id: 'b', text: 'Đặt FK ở phía "N" (bảng chứa nhiều record ứng với 1 record bên kia)', correct: true },
              { id: 'c', text: 'Tạo bảng trung gian junction table', correct: false },
              { id: 'd', text: 'Không cần FK vì quan hệ đã rõ trong ER diagram', correct: false }
            ]
          },
          {
            question: 'Multi-valued attribute (vd: 1 user có nhiều số điện thoại) nên mapping thế nào?',
            options: [
              { id: 'a', text: 'Nhét tất cả số điện thoại vào 1 cột VARCHAR ngăn cách bằng dấu phẩy', correct: false },
              { id: 'b', text: 'Tạo bảng riêng (user_id FK, phone_number) — mỗi số là 1 dòng', correct: true },
              { id: 'c', text: 'Tạo nhiều cột phone_1, phone_2, phone_3', correct: false },
              { id: 'd', text: 'Bỏ qua multi-valued attribute khi mapping', correct: false }
            ]
          }
        ],
        mini_game: {
          title: 'Phân loại: quy tắc mapping nào đúng cho tình huống này?',
          instruction: 'Mỗi thẻ là 1 tình huống ER. Kéo vào ô quy tắc mapping tương ứng.<br><strong style="color:var(--success)">Entity Set → 1 bảng</strong> · <strong style="color:var(--primary)">1:N → FK ở phía N</strong> · <strong style="color:var(--warning)">M:N → Junction Table</strong> · <strong style="color:var(--text-400)">Multi-valued → Bảng riêng</strong>.',
          chips: [
            { id: 'm1', label: 'Game (entity mạnh)' },
            { id: 'm2', label: '1 Publisher xuất bản nhiều Game (1:N)' },
            { id: 'm3', label: 'Player chơi nhiều Game, Game có nhiều Player (M:N)' },
            { id: 'm4', label: 'User có nhiều email (multi-valued)' }
          ],
          bins: [
            { id: 'entity',   label: 'Entity Set → 1 bảng',       correct: 'entity' },
            { id: 'one_n',    label: '1:N → FK ở phía N',          correct: 'one_n' },
            { id: 'm_n',      label: 'M:N → Junction Table',       correct: 'm_n' },
            { id: 'multi',    label: 'Multi-valued → Bảng riêng',  correct: 'multi' }
          ],
          solution: {
            'm1': 'entity',
            'm2': 'one_n',
            'm3': 'm_n',
            'm4': 'multi'
          }
        }
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',         slot: 'kw-select' },
          { type: 'col', token: 'title',          slot: 'col-1' },
          { type: 'kw',  token: 'FROM',           slot: 'kw-from' },
          { type: 'tbl', token: 'game',           slot: 'tbl' },
          { type: 'kw',  token: 'JOIN',           slot: 'kw-join' },
          { type: 'tbl', token: 'publisher',      slot: 'tbl2' },
          { type: 'kw',  token: 'ON',             slot: 'kw-on' },
          { type: 'col', token: 'game.pub_id = publisher.id', slot: 'col-on' },
          { type: 'kw',  token: 'WHERE',          slot: 'kw-where' },
          { type: 'col', token: 'publisher.name', slot: 'wcol-1' },
          { type: 'op',  token: '=',              slot: 'op-1' },
          { type: 'val', token: "'FromSoftware'", slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____',                                  accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____ JOIN ____ ON ____',                  accepts: ['kw', 'tbl', 'col'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',                          accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE'], multi: true }
        ],
        expected_sql: "SELECT title FROM game JOIN publisher ON game.pub_id = publisher.id WHERE publisher.name = 'FromSoftware';",
        reveal_hints: {
          'select-line': 'SELECT 1 cột: <strong>title</strong>.',
          'from-line':   'FROM <strong>game</strong> JOIN <strong>publisher</strong> ON <strong>game.pub_id = publisher.id</strong> — FK ánh xạ từ quan hệ 1:N.',
          'where-line':  "WHERE lọc hãng: <strong>publisher.name = 'FromSoftware'</strong>."
        }
      },

      step_4: {
        prompt: 'Lấy <code>title</code> và <code>genre</code> của mọi game do <code>Supergiant</code> xuất bản. Viết query SQL trong editor bên phải.',
        starter: "-- Lấy title + genre của game do Supergiant xuất bản\n-- JOIN game ↔ publisher ON game.pub_id = publisher.id\nSELECT g., g.\n  FROM  g\n  JOIN  p ON g. = p.\n WHERE p. = ;\n",
        schema: {
          table_name: 'game',
          columns: [
            { name: 'id',     type: 'INT',     key: 'PK' },
            { name: 'title',  type: 'VARCHAR', key: '' },
            { name: 'genre',  type: 'VARCHAR', key: '' },
            { name: 'pub_id', type: 'INT',     key: 'FK' }
          ],
          data: [
            ['1', 'Hades',    'Roguelike', '101'],
            ['2', 'Bastion',  'Action',    '101'],
            ['3', 'GTA V',    'Open World','102'],
            ['4', 'Red Dead', 'Open World','102']
          ]
        },
        expected_sql: "SELECT title, genre FROM game JOIN publisher ON game.pub_id = publisher.id WHERE publisher.name = 'Supergiant';",
        hints: [
          { level: 1, text: 'Cần 2 cột: <code>title</code> và <code>genre</code>.' },
          { level: 2, text: 'Bảng <code>game</code> JOIN <code>publisher</code> ON <code>game.pub_id = publisher.id</code>.' },
          { level: 3, text: "WHERE <code>publisher.name = 'Supergiant'</code>." },
          { level: 4, text: "<code class=\"code\">SELECT title, genre FROM game JOIN publisher ON game.pub_id = publisher.id WHERE publisher.name = 'Supergiant';</code>" }
        ],
        success_message: 'Xuất sắc! Bạn đã nắm vững quy tắc mapping ER → Bảng quan hệ. Bài 7 sẽ dùng FD để phát hiện dư thừa trong bảng đã mapping xong.',
        xp_reward: 35
      }
    },

    /* ========================================================================
     * BÀI 7 — Redundancy & Functional Dependency [REALIGN v3]
     * Concept: PDF Bài 7 — data: game_studio_combined
     * drag_type: box | challenge_type: mcq_code
     * ======================================================================== */
    {
      id: 'db_07', index: 7,
      title: 'Redundancy & Phụ thuộc hàm (FD)',
      subtitle: 'Phát hiện dữ liệu lặp và quy tắc X → Y ẩn trong bảng',
      module: 2, module_title: 'Chuẩn hóa dữ liệu (Normal Forms)',
      estimated_minutes: 22, xp_reward: 70,
      project_piece: '🛰️ Khởi động "Còi báo động Hệ thống Dọn Rác"',
      drag_type: 'box',
      challenge_type: 'full_ide',
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
        concept_cards: [{"icon": "fa-arrows-to-dot", "title": "Redundancy (Dư thừa)", "body": "Cùng 1 thông tin lặp lại ở nhiều dòng. VD: <code>studio_country</code> lặp ở mỗi game → tốn storage + dễ sai khi update."}, {"icon": "fa-arrows-left-right", "title": "Functional Dependency (FD)", "body": "Quy tắc <code>X → Y</code>: biết X thì xác định được Y duy nhất. <code>game_id → title, genre, price</code>. Mọi FD đều từ PK."}],
                visual: {
          
          diagram: {"type": "nf", "before": {"title": "TRƯỚC — chưa tách", "columns": ["game_id", "title", "studio", "studio_country"], "rows": [["1", "Mario", "Nintendo", "Japan"], ["2", "Zelda", "Nintendo", "Japan"], ["3", "Hades", "Supergiant", "USA"]], "violations": {"1-3": true, "2-3": true}}, "after": {"title": "SAU — tách studio", "columns": ["game_id", "title", "studio"], "rows": [["1", "Mario", "Nintendo"], ["2", "Zelda", "Nintendo"], ["3", "Hades", "Supergiant"]]}, "note": "Tách thành 2 bảng: game + studio. studio_country lưu 1 lần duy nhất."},
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
        decomp_game: {
          rule_label: 'Tách dư thừa (Redundancy)',
          rule: 'Bảng <code>game_studio_combined</code> có <em>studio_name</em> lặp 3 lần + <em>st_country</em> lặp 3 lần. Vi phạm FD <code>studio_name → st_country</code>. Tách thành 2 bảng để loại bỏ dư thừa.',
          mission: 'Kéo các cột từ bảng <code>game_studio_combined</code> vào 2 bảng mục tiêu.',
          source_table: {
            name: 'game_studio_combined',
            columns: [
              { name: 'game_id',     type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'game_name',   type: 'VARCHAR', key: '',   icon: '🎮' },
              { name: 'studio_name', type: 'VARCHAR', key: '',   icon: '🏢' },
              { name: 'st_country',  type: 'VARCHAR', key: '',   icon: '🌏' }
            ],
            data: [
              ['55', 'Elden Ring',  'FromSoftware', 'Japan'],
              ['56', 'Bloodborne',  'FromSoftware', 'Japan'],
              ['88', 'Portal 2',    'Valve',        'USA']
            ]
          },
          target_tables: [
            { name: 'games',   icon: '🎮', description: 'Bảng game (game_id, game_name, studio_name FK)' },
            { name: 'studios', icon: '🏢', description: 'Bảng studio (studio_name PK, st_country)' }
          ],
          solution: {
            'games':   ['game_id', 'game_name', 'studio_name'],
            'studios': ['studio_name', 'st_country']
          },
          hint: 'Cột studio_name nên ở bảng studios (PK). Cột st_country chỉ phụ thuộc studio_name → ở studios. Cột game_id, game_name ở bảng games (FK studio_name tham chiếu studios).'
        },
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
          { id: 'select-line', placeholder: 'SELECT ____ , ____',     accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',              accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',   accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE'], multi: true }
        ],
        expected_sql: "SELECT studio_name, st_country FROM game_studio_combined WHERE studio_name = 'FromSoftware';",
        reveal_hints: {
          'select-line': 'SELECT 2 cột: <strong>studio_name</strong> và <strong>st_country</strong>.',
          'from-line':   'FROM bảng đang dư thừa: <strong>game_studio_combined</strong>.',
          'where-line':  "WHERE lọc studio: <strong>studio_name = 'FromSoftware'</strong> (sẽ thấy cùng kết quả 'Japan' lặp 3 lần — minh chứng redundancy)."
        }
      },

      step_4: {
        prompt: 'Tìm tất cả <code>game_name</code> của studio <em>Valve</em> (USA). Viết query SQL trong editor bên phải.',

        starter: "-- Lấy tên các game do Valve phát triển\n-- Filter theo studio_name = 'Valve'\nSELECT \n  FROM game_studio_combined\n WHERE ;\n",
        schema: {
          table_name: 'game_studio_combined',
          columns: [
            { name: 'game_id',     type: 'INT',     key: 'PK', icon: '🔑' },
            { name: 'game_name',   type: 'VARCHAR', key: '',   icon: '🎮' },
            { name: 'studio_name', type: 'VARCHAR', key: '',   icon: '🏢' },
            { name: 'st_country',  type: 'VARCHAR', key: '',   icon: '🌏' }
          ],
          data: [
            ['55', 'Elden Ring',  'FromSoftware', 'Japan'],
            ['56', 'Bloodborne',  'FromSoftware', 'Japan'],
            ['57', 'Sekiro',      'FromSoftware', 'Japan'],
            ['88', 'Portal 2',    'Valve',        'USA']
          ]
        },
        expected_sql: "SELECT game_name FROM game_studio_combined WHERE studio_name = 'Valve';",
        hints: [{'level': 1, 'text': 'Loại trừ <code>WHERE st_country = \'USA\'</code> — Sai logic: WHERE theo country thay vì studio_name. Vẫn đúng trong data này nhưng không định danh được studio cụ thể.'}, {'level': 2, 'text': 'Loại trừ <code>SELECT * FROM game_studio_combined;</code> — Sai: lấy hết cột (*) và KHÔNG WHERE → trả cả 4 dòng của 2 studio.'}, {'level': 3, 'text': 'Loại trừ <code>WHERE game_name = ...</code> — Sai: WHERE theo name (không phải PK) → chỉ trả 1 dòng, thiếu các game khác của Valve.'}, {'level': 4, 'text': '<code class="code">SELECT game_name FROM game_studio_combined WHERE studio_name = \'Valve\';</code>'}],
        success_message: 'Bạn đã hiểu Redundancy + FD. Bài 8 sẽ dùng FD để tách bảng thành 1NF — mỗi ô chỉ 1 giá trị nguyên tử.',
        xp_reward: 30
      }
    },

    /* ========================================================================
     * BÀI 8 — 1NF: Nguyên tử hóa dữ liệu (Atomic Domains)
     * ======================================================================== */
    {
      id: 'db_08', index: 8,
      title: 'Dạng chuẩn 1 (1NF) — Atomic Domains',
      subtitle: 'Mỗi ô chỉ chứa 1 giá trị nguyên tử (không multivalued, không composite)',
      module: 2, module_title: 'Chuẩn hóa dữ liệu (Normal Forms)',
      estimated_minutes: 22, xp_reward: 70,
      project_piece: '🧪 Thu thập "Bộ Chia Nguyên tử"',
      drag_type: 'box',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'student_raw', col: 0, row: 4, width: 3, height: 1,
          columns: ['student_id', 'name', 'phones'],
          dataRows: [
            ['S01', 'Minh', '0901-111-111, 0902-222-222'],
            ['S02', 'Yuki', '0903-333-333'],
            ['S03', 'Sara', '0904-444-444, 0905-555-555, 0906-666-666']
          ]
        }
      },

      step_1: {
        primer: {
          goal: [
            '1NF yêu cầu mỗi attribute có domain nguyên tử (atomic — không chia nhỏ được)',
            'Vi phạm 1NF: MULTIVALUED attr (nhiều giá trị trong 1 ô) hoặc COMPOSITE attr (gộp nhiều mảnh)',
            'Fix: tách multivalued thành bảng riêng; tách composite thành nhiều cột độc lập'
          ],
          intro: 'Bảng <code class="code">student_raw</code> dưới đây VI PHẠM 1NF: cột <code class="code">phones</code> chứa <strong>nhiều số điện thoại</strong> trong 1 ô (vd: <code>"0901-xxx, 0902-yyy"</code>). Đây là <em>multivalued attribute</em> — không nguyên tử. Theo Silberschatz Ch 7.8: <strong>1NF yêu cầu mỗi attribute phải có domain nguyên tử — không thể chia nhỏ thành nhiều giá trị có ý nghĩa</strong>.',
          example: 'Nếu muốn tìm TẤT CẢ sinh viên có số "0901-xxx" — bạn không thể <code>WHERE phones = \'0901-xxx\'</code> (vì ô chứa "0901-xxx, 0902-yyy" không bằng). Phải dùng <code>LIKE \'%0901-xxx%\'</code> → chậm và sai (vd: cũng match "0901-xxx-old"). Tách <code>phones</code> thành bảng riêng thì query đúng & nhanh: <code>WHERE phone = \'0901-xxx\'</code>.'
        },
        concept_cards: [{"icon": "fa-atom", "title": "1NF — Atomic Domains", "body": "Mỗi cell chỉ chứa <strong>1 giá trị nguyên tử</strong> (không list, không nested). Multivalued → tách thành nhiều dòng. Composite → tách thành nhiều cột."}, {"icon": "fa-list", "title": "Multivalued vs Composite", "body": "<strong>Multivalued</strong>: 1 cell chứa N giá trị cùng loại (vd: <code>phones = \"0901,0902\"</code>) → tách thành nhiều dòng. <strong>Composite</strong>: 1 cell chứa nhiều mảnh khác loại (vd: <code>address</code>) → tách thành nhiều cột."}],
                visual: {
          
          diagram: {"type": "nf", "before": {"title": "TRƯỚC — vi phạm 1NF", "columns": ["member_id", "name", "phones"], "rows": [["1", "Alice", "0901,0902"], ["2", "Bob", "0903"]], "violations": {"0-2": true, "1-2": true}}, "after": {"title": "SAU — đã 1NF (tách dòng)", "columns": ["member_id", "name", "phone"], "rows": [["1", "Alice", "0901"], ["1", "Alice", "0902"], ["2", "Bob", "0903"]], "fixes": {"0-2": true, "1-2": true, "2-2": true}}, "note": "1NF yêu cầu atomic: tách \"0901,0902\" thành 2 dòng riêng."},
          schema: {
            table_name: 'student_raw',
            columns: [
              { name: 'student_id', type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'name',       type: 'VARCHAR', key: '',   icon: '👤' },
              { name: 'phones',     type: 'VARCHAR', key: '',   icon: '⚠️' }
            ]
          },
          data_preview: [
            ['S01', 'Minh', '0901-111-111, 0902-222-222'],
            ['S02', 'Yuki', '0903-333-333'],
            ['S03', 'Sara', '0904-444-444, 0905-555-555, 0906-666-666']
          ]
        },
        mission: 'Tách cột <code>phones</code> (multivalued) thành bảng riêng <code>student_phone(student_id, phone)</code> để đạt 1NF — mỗi ô chỉ chứa 1 giá trị.'
      },

        step_2: {
        mcq: [{"question": "1NF (Dạng chuẩn 1) yêu cầu điều gì?", "options": [{"id": "a", "text": "Mỗi cell chỉ chứa 1 giá trị nguyên tử (atomic)", "correct": true}, {"id": "b", "text": "Bảng phải có ít nhất 3 cột", "correct": false}, {"id": "c", "text": "Mỗi dòng phải có giá trị NULL", "correct": false}, {"id": "d", "text": "Bảng phải có đúng 1 khóa chính", "correct": false}]}, {"question": "Bảng <code>student_raw</code> có cột <code>phones = \"0901-111, 0902-222\"</code>. Cách fix đúng?", "options": [{"id": "a", "text": "Tách thành bảng riêng (1 dòng / số điện thoại)", "correct": true}, {"id": "b", "text": "Đổi VARCHAR thành TEXT", "correct": false}, {"id": "c", "text": "Thêm cột phone2, phone3", "correct": false}, {"id": "d", "text": "Không cần fix", "correct": false}]}],
        decomp_game: {
          rule_label: '1NF — Atomic Domains',
          rule: 'Mỗi attribute phải có domain nguyên tử (không thể chia nhỏ thành nhiều giá trị có ý nghĩa). Cột phones chứa NHIỀU số điện thoại trong 1 ô → multivalued → tách thành bảng riêng (mỗi phone 1 dòng).',
          mission: 'Kéo các cột từ bảng <code>student_raw</code> vào 2 bảng mục tiêu. Cột multivalued <code>phones</code> phải rời đi thành bảng riêng.',
          source_table: {
            name: 'student_raw',
            columns: [
              { name: 'student_id', type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'name',       type: 'VARCHAR', key: '',   icon: '👤' },
              { name: 'phones',     type: 'VARCHAR', key: '',   icon: '⚠️' }
            ],
            data: [
              ['S01', 'Minh', '0901-111-111'],
              ['S01', 'Minh', '0902-222-222'],
              ['S02', 'Yuki', '0903-333-333'],
              ['S03', 'Sara', '0904-444-444'],
              ['S03', 'Sara', '0905-555-555'],
              ['S03', 'Sara', '0906-666-666']
            ]
          },
          target_tables: [
            { name: 'student',       icon: '🧑‍🎓', description: 'Bảng sinh viên (giữ student_id + name, KHÔNG có phones)' },
            { name: 'student_phone', icon: '📞', description: 'Bảng số điện thoại (mỗi phone 1 dòng riêng)' }
          ],
          solution: {
            'student':       ['student_id', 'name'],
            'student_phone': ['student_id', 'phone']
          },
          hint: 'Cột phones chứa nhiều giá trị → tách thành bảng riêng (mỗi phone 1 dòng). Cột name chỉ phụ thuộc student_id → ở lại bảng student.'
        },
        mini_game: {"type": "classify", "title": "Phân loại: bảng nào vi phạm 1NF?", "instruction": "Mỗi thẻ là 1 bảng mẫu. Kéo vào ô <strong style=\"color:var(--danger)\">Vi phạm 1NF</strong> hoặc <strong style=\"color:var(--success)\">Đạt 1NF</strong>.", "chips": [{"id": "t-phones", "label": "phones = \"0901,0902\""}, {"id": "t-age", "label": "age = 25 (số nguyên)"}, {"id": "t-addr", "label": "address = \"Hanoi, Cầu Giấy\" (composite)"}, {"id": "t-name", "label": "name = \"Alice\""}], "bins": [{"id": "bad", "label": "Vi phạm 1NF (multivalued)", "correct": "bad"}, {"id": "good", "label": "Đạt 1NF (atomic)", "correct": "good"}], "solution": {"t-phones": "bad", "t-age": "good", "t-addr": "bad", "t-name": "good"}}
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',      slot: 'kw-select' },
          { type: 'col', token: 'student_id',  slot: 'col-1' },
          { type: 'kw',  token: 'FROM',        slot: 'kw-from' },
          { type: 'tbl', token: 'student_phone',slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',       slot: 'kw-where' },
          { type: 'col', token: 'phone',       slot: 'wcol-1' },
          { type: 'op',  token: '=',           slot: 'op-1' },
          { type: 'val', token: "'0901-111-111'", slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____',           accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',             accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',  accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE'], multi: true }
        ],
        expected_sql: "SELECT student_id FROM student_phone WHERE phone = '0901-111-111';",
        reveal_hints: {
          'select-line': 'SELECT 1 cột: <strong>student_id</strong> (sinh viên nào có số này).',
          'from-line':   'FROM bảng <strong>student_phone</strong> (bảng đã tách theo 1NF — mỗi phone 1 dòng).',
          'where-line':  "WHERE lọc theo <strong>phone = '0901-111-111'</strong> — đây là điều KHÔNG THỂ làm với bảng student_raw gốc (1 ô chứa nhiều số)."
        }
      },

      step_4: {
        prompt: 'Sau khi tách theo 1NF: bảng <code>student(student_id, name)</code> và bảng <code>student_phone(student_id, phone)</code>. Tìm <code>name</code> của sinh viên có số điện thoại <code>\'0901-111-111\'</code>.',
        schema: {
          table_name: 'student_phone',
          columns: [
            { name: 'student_id', type: 'INT',     key: 'FK' },
            { name: 'phone',      type: 'VARCHAR', key: '' }
          ],
          data: [
            ['S01', '0901-111-111'],
            ['S01', '0902-222-222'],
            ['S02', '0903-333-333'],
            ['S03', '0904-444-444'],
            ['S03', '0905-555-555'],
            ['S03', '0906-666-666']
          ]
        },
        starter: "-- Tìm tên SV có số ĐT '0901-111-111'\n-- Gợi ý: dùng WHERE student_id IN (subquery)\nSELECT \n  FROM student\n WHERE student_id  (\n   SELECT student_id FROM student_phone WHERE \n );\n",
        expected_sql: "SELECT name FROM student WHERE student_id IN (SELECT student_id FROM student_phone WHERE phone = '0901-111-111');",
        hints: [
          { level: 1, text: 'Cần lấy <code>name</code> từ bảng <code>student</code> — nơi có tên sinh viên.' },
          { level: 2, text: 'Dùng <code>IN (subquery)</code>: <code>WHERE student_id IN (...)</code> với subquery tìm student_id từ bảng <code>student_phone</code>.' },
          { level: 3, text: 'Subquery: <code>(SELECT student_id FROM student_phone WHERE phone = \'0901-111-111\')</code>' },
          { level: 4, text: "<code class=\"code\">SELECT name FROM student WHERE student_id IN (SELECT student_id FROM student_phone WHERE phone = '0901-111-111');</code>" }
        ],
        success_message: 'Hoàn thành 1NF! Dữ liệu đã nguyên tử hóa — mỗi ô chỉ chứa 1 giá trị, query đơn giản không cần LIKE. Tiếp theo: 2NF loại bỏ phụ thuộc bộ phận với khóa chính tổng hợp!',
        xp_reward: 50
      }
    },

    /* ========================================================================
     * BÀI 9 — 2NF: Phụ thuộc hàm đầy đủ (Full FD) — Library domain
     * ======================================================================== */
    {
      id: 'db_09', index: 9,
      title: 'Dạng chuẩn 2 (2NF) — Phụ thuộc hàm đầy đủ',
      subtitle: 'Loại bỏ phụ thuộc bộ phận với khóa chính tổng hợp',
      module: 2, module_title: 'Chuẩn hóa dữ liệu (Normal Forms)',
      estimated_minutes: 22, xp_reward: 70,
      project_piece: '🔬 Thu thập "Kính hiển vi Phụ thuộc hàm"',
      drag_type: 'box',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'book_loan_raw',
          columns: ['book_id', 'copy_no', 'loan_date', 'member_name'],
          dataRows: [
            ['B01', '1', '2024-06-01', 'Minh'],
            ['B01', '2', '2024-06-03', 'Minh'],
            ['B02', '1', '2024-06-05', 'Yuki']
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
          intro: 'Bạn quản lý <strong>thư viện sách</strong>. Bảng <code class="code">book_loan_raw</code> có khóa chính tổng hợp <code class="code">(book_id, copy_no)</code> (mỗi cuốn sách có thể có nhiều bản copy). Vấn đề: <code class="code">member_name</code> chỉ phụ thuộc vào <code class="code">member_id</code> (một phần khóa qua loan) — không phụ thuộc <code class="code">copy_no</code>. <strong>2NF</strong> yêu cầu mỗi cột non-key phải phụ thuộc <em>toàn bộ</em> khóa.',
          example: 'Nếu đổi tên người mượn từ "Minh" → "Minh Nguyễn", bạn phải sửa MỌI DÒNG có member_name = "Minh" (vì Minh mượn nhiều sách → có nhiều dòng). Đó là <strong>update anomaly</strong>. Tách member ra bảng riêng → sửa 1 chỗ là xong.'
        },
        concept_cards: [{"icon": "fa-puzzle-piece", "title": "2NF — No Partial Dependency", "body": "Mọi cột non-key phải phụ thuộc CẢ PK (không phụ thuộc 1 phần PK). Với composite PK (a,b): <code>{a,b} → c</code> OK, <code>a → c</code> SAI → tách ra bảng riêng."}, {"icon": "fa-scissors", "title": "Cách fix 2NF", "body": "Tách phần PK gây phụ thuộc ra bảng riêng. PK gốc giữ lại. VD: <code>loans(book_id, copy_no, member_id)</code> có <code>member_id → member_name</code> → tách thành <code>member</code> riêng."}],
                visual: {
          
          diagram: {"type": "nf", "before": {"title": "TRƯỚC — vi phạm 2NF", "columns": ["book_id", "copy_no", "member_id", "member_name", "loan_date"], "rows": [["B1", "1", "M01", "Alice", "2026-01-01"], ["B1", "2", "M01", "Alice", "2026-01-05"], ["B2", "1", "M02", "Bob", "2026-01-03"]], "violations": {"0-3": true, "1-3": true}}, "after": {"title": "SAU — đã 2NF (tách member)", "columns": ["book_id", "copy_no", "member_id", "loan_date"], "rows": [["B1", "1", "M01", "2026-01-01"], ["B1", "2", "M01", "2026-01-05"], ["B2", "1", "M02", "2026-01-03"]]}, "note": "PK (book_id, copy_no) nhưng member_name chỉ phụ thuộc member_id → tách member riêng."},
          schema: {
            table_name: 'book_loan_raw',
            columns: [
              { name: 'book_id',     type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'copy_no',     type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'member_id',   type: 'INT',     key: '',   icon: '🔗' },
              { name: 'member_name', type: 'VARCHAR', key: '',   icon: '⚠️' },
              { name: 'loan_date',   type: 'DATE',    key: '',   icon: '📅' }
            ]
          },
          data_preview: [
            ['B01', '1', 'M01', 'Minh', '2024-06-01'],
            ['B01', '2', 'M01', 'Minh', '2024-06-03'],
            ['B02', '1', 'M02', 'Yuki', '2024-06-05'],
            ['B03', '1', 'M01', 'Minh', '2024-06-07']
          ]
        },
        mission: 'Quan sát bảng: <code>member_name</code> chỉ phụ thuộc <code>member_id</code> — không phụ thuộc <code>copy_no</code>. Đây là phụ thuộc bộ phận → vi phạm 2NF.'
      },

      step_2: {
        mcq: [
          {
            question: 'Trong bảng <code>book_loan_raw(book_id, copy_no, member_id, member_name)</code> với PK là <code>(book_id, copy_no)</code>, cột nào VI PHẠM 2NF?',
            options: [
              { id: 'a', text: '<code>member_id</code> — vì là một phần quan hệ', correct: false },
              { id: 'b', text: '<code>member_name</code> — vì chỉ phụ thuộc <code>member_id</code> (một phần của khóa qua loan)', correct: true },
              { id: 'c', text: '<code>loan_date</code> — vì là cột ngày tháng', correct: false },
              { id: 'd', text: '<code>copy_no</code> — vì là một phần khóa', correct: false }
            ]
          },
          {
            question: 'Để sửa vi phạm 2NF (phụ thuộc bộ phận), cần làm gì?',
            options: [
              { id: 'a', text: 'Thêm cột member_id vào làm PK', correct: false },
              { id: 'b', text: 'Tách thành 2 bảng: <code>loans(book_id, copy_no, member_id, loan_date)</code> và <code>members(member_id, member_name)</code>', correct: true },
              { id: 'c', text: 'Xóa cột copy_no khỏi bảng', correct: false },
              { id: 'd', text: 'Đổi tên member_name thành member_full_name', correct: false }
            ]
          }
        ],
        mini_game: {
          title: 'Phân loại: cột nào phụ thuộc TOÀN BỘ khóa vs MỘT PHẦN khóa?',
          instruction: 'Bảng <code>book_loan_raw</code> với PK <code>(book_id, copy_no)</code>. Kéo mỗi cột vào ô tương ứng.<br><strong style="color:var(--success)">Toàn bộ khóa</strong> · <strong style="color:var(--warning)">Một phần khóa (vi phạm 2NF)</strong> · <strong style="color:var(--text-400)">Không liên quan</strong>.',
          chips: [
            { id: 'c-bid',    label: 'book_id' },
            { id: 'c-cno',    label: 'copy_no' },
            { id: 'c-mid',    label: 'member_id' },
            { id: 'c-mname',  label: 'member_name' },
            { id: 'c-ldate',  label: 'loan_date' }
          ],
          bins: [
            { id: 'full',   label: 'Phụ thuộc TOÀN BỘ khóa',           correct: 'full' },
            { id: 'part',   label: 'Phụ thuộc MỘT PHẦN khóa (2NF)',    correct: 'part' },
            { id: 'none',   label: 'Là 1 phần của khóa / không liên quan', correct: 'none' }
          ],
          solution: {
            'c-bid':   'none',
            'c-cno':   'none',
            'c-mid':   'none',
            'c-mname': 'part',
            'c-ldate': 'full'
          }
        }
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',          slot: 'kw-select' },
          { type: 'col', token: 'book_id',         slot: 'col-1' },
          { type: 'col', token: 'copy_no',         slot: 'col-2' },
          { type: 'kw',  token: 'FROM',            slot: 'kw-from' },
          { type: 'tbl', token: 'loans',           slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',           slot: 'kw-where' },
          { type: 'col', token: 'member_id',       slot: 'wcol-1' },
          { type: 'op',  token: '=',               slot: 'op-1' },
          { type: 'val', token: "'M01'",           slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____ , ____',     accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',              accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',   accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE'], multi: true }
        ],
        expected_sql: "SELECT book_id, copy_no FROM loans WHERE member_id = 'M01';",
        reveal_hints: {
          'select-line': 'SELECT 2 cột: <strong>book_id</strong> và <strong>copy_no</strong> (composite key).',
          'from-line':   'FROM bảng đã 2NF: <strong>loans</strong>.',
          'where-line':  "WHERE lọc người mượn: <strong>member_id = 'M01'</strong>."
        }
      },

      step_4: {
        prompt: 'Sau 2NF, tách thành 2 bảng <code>loans</code> và <code>members</code>. Tìm <strong>top 3 thành viên mượn nhiều sách nhất</strong>. Hiển thị <code>member_name</code> + số lượt mượn, sắp xếp giảm dần.',
        starter: "-- Top 3 thành viên mượn nhiều sách nhất\n-- JOIN loans ↔ members + GROUP BY + ORDER BY DESC + LIMIT 3\nSELECT m., COUNT(*) AS \n  FROM members m\n  JOIN loans l ON l. = m.\n GROUP BY m., m.\n ORDER BY  DESC\n LIMIT 3;\n",
        schema: {
          table_name: 'members',
          columns: [
            { name: 'member_id',   type: 'INT',     key: 'PK', icon: '🔑' },
            { name: 'member_name', type: 'VARCHAR', key: '',   icon: '👤' },
            { name: 'join_date',   type: 'DATE',    key: '',   icon: '📅' }
          ],
          data: [
            ['M01', 'Minh',     '2023-01-15'],
            ['M02', 'Yuki',     '2023-05-20']
          ]
        },
        related_schemas: [
          {
            table_name: 'loans',
            columns: [
              { name: 'book_id',   type: 'INT',  key: 'PK' },
              { name: 'copy_no',   type: 'INT',  key: 'PK' },
              { name: 'member_id', type: 'INT',  key: 'FK' },
              { name: 'loan_date', type: 'DATE', key: '' }
            ],
            data: [
              ['B01', '1', 'M01', '2024-06-01'],
              ['B01', '2', 'M01', '2024-06-03'],
              ['B02', '1', 'M02', '2024-06-05'],
              ['B03', '1', 'M01', '2024-06-07']
            ]
          }
        ],
        expected_sql: "SELECT m.member_name, COUNT(*) AS loan_count FROM members m JOIN loans l ON l.member_id = m.member_id GROUP BY m.member_id, m.member_name ORDER BY loan_count DESC LIMIT 3;",
        hints: [
          { level: 1, text: 'Bạn cần <em>đếm sách mượn theo từng thành viên</em>. Hãy nghĩ: <strong>JOIN</strong> 2 bảng qua <code>member_id</code>, <strong>GROUP BY</strong> member, <strong>COUNT(*)</strong>, <strong>ORDER BY</strong> giảm dần, <strong>LIMIT</strong> top 3.' },
          { level: 2, text: 'JOIN: <code>members m JOIN loans l ON l.member_id = m.member_id</code>.' },
          { level: 3, text: 'GROUP BY theo cả 2 cột: <code>m.member_id, m.member_name</code>. COUNT(*) đếm số dòng loans.' },
          { level: 4, text: "<code class=\"code\">SELECT m.member_name, COUNT(*) AS loan_count FROM members m JOIN loans l ON l.member_id = m.member_id GROUP BY m.member_id, m.member_name ORDER BY loan_count DESC LIMIT 3;</code>" }
        ],
        success_message: 'Hoàn thành 2NF nâng cao! Phụ thuộc bộ phận đã được loại bỏ, và bạn đã JOIN + GROUP BY qua 2 bảng. Tiếp theo Bài 10 sẽ xét BCNF, phiên bản "nghiêm ngặt" hơn.',
        xp_reward: 70
      }
    },

    /* ========================================================================
     * BÀI 10 — BCNF: Phân rã phi tổn thất (Lossless Decomposition) — Hospital domain
     * ======================================================================== */
    {
      id: 'db_10', index: 10,
      title: 'Dạng chuẩn BCNF & Phân rã Phi tổn thất',
      subtitle: 'Chia bảng không mất dữ liệu nhờ khóa ngoại đúng vị trí',
      module: 2, module_title: 'Chuẩn hóa dữ liệu (Normal Forms)',
      estimated_minutes: 25, xp_reward: 80,
      project_piece: '🛰️ Thu thập "Máy Cưa Không Gian"',
      drag_type: 'box',
      challenge_type: 'full_ide',
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
        concept_cards: [{"icon": "fa-shield-halved", "title": "BCNF — Boyce-Codd Normal Form", "body": "Mọi FD <code>X → Y</code> phải có <code>X</code> là superkey. Nếu có FD mà vế trái KHÔNG phải superkey → vi phạm BCNF → tách bảng."}, {"icon": "fa-code-branch", "title": "Ví dụ kinh điển", "body": "Bảng <code>teaches(prof, course, dept)</code>. FD: <code>prof → dept</code>. Nhưng <code>{prof, course}</code> mới là PK → <code>prof</code> không phải superkey → vi phạm BCNF. Tách thành <code>prof_dept</code> riêng."}],
                visual: {
          diagram: {"type": "nf", "before": {"title": "TRƯỚC — vi phạm BCNF", "columns": ["patient_id", "doctor_id", "treatment", "doctor_specialty"], "rows": [["P01", "D01", "Khám tổng quát", "Tim mạch"], ["P01", "D01", "Tái khám", "Tim mạch"], ["P02", "D02", "Phẫu thuật", "Ngoại khoa"]], "violations": {"0-3": true, "1-3": true}}, "after": {"title": "SAU — đã BCNF (tách doctors)", "columns": ["patient_id", "doctor_id", "treatment"], "rows": [["P01", "D01", "Khám tổng quát"], ["P01", "D01", "Tái khám"], ["P02", "D02", "Phẫu thuật"]]}, "note": "Tách doctors(doctor_id, specialty) riêng. doctor_specialty lưu 1 lần."},
          schema: {
            table_name: 'treatments',
            columns: [
              { name: 'patient_id',     type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'doctor_id',      type: 'INT',     key: 'FK', icon: '🔗' },
              { name: 'treatment',      type: 'VARCHAR', key: '',   icon: '💊' },
              { name: 'treatment_date', type: 'DATE',    key: '',   icon: '📅' }
            ]
          },
          data_preview: [
            ['P01', 'D01', 'Khám tổng quát',     '2024-03-01'],
            ['P02', 'D02', 'Phẫu thuật ruột thừa','2024-03-05'],
            ['P01', 'D03', 'Xét nghiệm máu',      '2024-03-10'],
            ['P03', 'D01', 'Khám tim mạch',       '2024-03-12']
          ]
        },
                mission: 'Hoàn thành game kéo-thả để tách <code class="code">treatments</code> thành <code class="code">doctors</code>, <code class="code">patients</code>, và <code class="code">treatments</code>.'
      },

        step_2: {
        mcq: [{"question": "BCNF yêu cầu điều gì?", "options": [{"id": "a", "text": "Mọi FD X → Y phải có X là superkey", "correct": true}, {"id": "b", "text": "Mọi cột phải có giá trị duy nhất", "correct": false}, {"id": "c", "text": "Bảng phải có composite key", "correct": false}, {"id": "d", "text": "Không có cột NULL", "correct": false}]}, {"question": "Bảng <code>teaches(prof, course, dept)</code> với FD <code>prof → dept</code> vi phạm chuẩn nào?", "options": [{"id": "a", "text": "1NF — vì có redundancy trong dept", "correct": false}, {"id": "b", "text": "BCNF — vì prof không phải superkey", "correct": true}, {"id": "c", "text": "Không vi phạm gì cả", "correct": false}, {"id": "d", "text": "2NF — vì thiếu partial dependency check", "correct": false}]}],
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
        mini_game: {"type": "classify", "title": "Phân loại: bảng nào vi phạm BCNF?", "instruction": "Mỗi thẻ là 1 tình huống FD. Kéo vào ô <strong style=\"color:var(--danger)\">Vi phạm BCNF</strong> hoặc <strong style=\"color:var(--success)\">Đạt BCNF</strong>.", "chips": [{"id": "t-teaches", "label": "teaches(prof, course, dept) — prof → dept"}, {"id": "t-enroll", "label": "enroll(student, course) — chỉ có PK"}, {"id": "t-borrow", "label": "borrow(book, member) — không có FD riêng"}, {"id": "t-publish", "label": "publish(prof, journal) — prof → dept + journal → prof"}], "bins": [{"id": "bad", "label": "Vi phạm BCNF", "correct": "bad"}, {"id": "good", "label": "Đạt BCNF", "correct": "good"}], "solution": {"t-teaches": "bad", "t-enroll": "good", "t-borrow": "good", "t-publish": "bad"}}
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
          { id: 'select-line', placeholder: 'SELECT ____ , ____',   accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',            accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____', accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE'], multi: true }
        ],
        expected_sql: "SELECT patient_id, treatment FROM treatments WHERE doctor_id = 'D01';",
        reveal_hints: {
          'select-line': 'SELECT 2 cột: patient_id và treatment',
          'from-line':   'FROM treatments',
          'where-line':  "Lọc theo doctor_id = 'D01'"
        }
      },

      step_4: {
        prompt: 'Sau BCNF, tách thành 3 bảng <code>doctors</code>, <code>patients</code>, <code>treatments</code>. Tìm <strong>top 3 chuyên khoa có nhiều ca điều trị nhất</strong>. Hiển thị chuyên khoa + số ca, sắp xếp giảm dần.',
        starter: "-- Top 3 chuyên khoa có nhiều ca điều trị nhất\n-- JOIN treatments ↔ doctors + GROUP BY + ORDER BY DESC + LIMIT 3\nSELECT d., COUNT(*) AS \n  FROM treatments t\n  JOIN doctors d ON t. = d.\n GROUP BY d.\n ORDER BY  DESC\n LIMIT 3;\n",
        schema: {
          table_name: 'doctors',
          columns: [
            { name: 'doctor_id',      type: 'INT',     key: 'PK', icon: '🔑' },
            { name: 'doctor_name',    type: 'VARCHAR', key: '',   icon: '👨‍⚕️' },
            { name: 'doctor_specialty', type: 'VARCHAR', key: '',   icon: '⚕️' }
          ],
          data: [
            ['D01', 'BS. Hà',   'Tim mạch'],
            ['D02', 'BS. Linh', 'Ngoại khoa'],
            ['D03', 'BS. Khải', 'Huyết học']
          ]
        },
        related_schemas: [
          {
            table_name: 'patients',
            columns: [
              { name: 'patient_id', type: 'INT',     key: 'PK' },
              { name: 'name',       type: 'VARCHAR', key: '' }
            ],
            data: [
              ['P01', 'Minh'],
              ['P02', 'Yuki'],
              ['P03', 'Sara']
            ]
          },
          {
            table_name: 'treatments',
            columns: [
              { name: 'patient_id',     type: 'INT',     key: 'FK' },
              { name: 'doctor_id',      type: 'INT',     key: 'FK' },
              { name: 'treatment',      type: 'VARCHAR', key: '' },
              { name: 'treatment_date', type: 'DATE',    key: '' }
            ],
            data: [
              ['P01', 'D01', 'Khám tổng quát',     '2024-03-01'],
              ['P02', 'D02', 'Phẫu thuật ruột thừa','2024-03-05'],
              ['P01', 'D03', 'Xét nghiệm máu',      '2024-03-10'],
              ['P03', 'D01', 'Khám tim mạch',       '2024-03-12']
            ]
          }
        ],
        expected_sql: "SELECT d.doctor_specialty, COUNT(*) AS treatment_count FROM treatments t JOIN doctors d ON t.doctor_id = d.doctor_id GROUP BY d.doctor_specialty ORDER BY treatment_count DESC LIMIT 3;",
        hints: [
          { level: 1, text: 'Bạn cần <em>JOIN 2 bảng</em> (treatments + doctors) qua <code>doctor_id</code>, <strong>GROUP BY</strong> chuyên khoa, <strong>COUNT</strong>, <strong>ORDER BY DESC</strong> + <strong>LIMIT 3</strong>.' },
          { level: 2, text: 'JOIN: <code>treatments t JOIN doctors d ON t.doctor_id = d.doctor_id</code>.' },
          { level: 3, text: 'GROUP BY <code>d.doctor_specialty</code>. COUNT(*) đếm số treatment. ORDER BY DESC + LIMIT 3 lấy top 3.' },
          { level: 4, text: "<code class=\"code\">SELECT d.doctor_specialty, COUNT(*) AS treatment_count FROM treatments t JOIN doctors d ON t.doctor_id = d.doctor_id GROUP BY d.doctor_specialty ORDER BY treatment_count DESC LIMIT 3;</code>" }
        ],
        success_message: 'Hoàn thành BCNF nâng cao! Bạn đã JOIN treatments + doctors + GROUP BY chuyên khoa. Bác sĩ và chuyên khoa đã được cô lập — cập nhật 1 chỗ, dữ liệu luôn nhất quán.',
        xp_reward: 80
      }
    },

    /* ========================================================================
     * BÀI 11 — 3NF & Sự thỏa hiệp (Compromise) — Store domain
     * ======================================================================== */
    {
      id: 'db_11', index: 11,
      title: 'Dạng chuẩn 3 (3NF) & Sự thỏa hiệp',
      subtitle: 'Khi nào chấp nhận dư thừa nhỏ để tăng tốc độ truy vấn',
      module: 2, module_title: 'Chuẩn hóa dữ liệu (Normal Forms)',
      estimated_minutes: 25, xp_reward: 80,
      project_piece: '🛡️ Phân hệ "Đặc vụ Guild tối ưu hệ thống"',
      drag_type: 'box',
      challenge_type: 'full_ide',
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
        concept_cards: [{"icon": "fa-link", "title": "3NF — No Transitive Dependency", "body": "Không có chuỗi FD <code>X → Y → Z</code> với X là PK, Y không phải key, Z là non-key. Nếu có → tách Y-Z thành bảng riêng. 3NF <strong>cho phép</strong> FD non-superkey (khác BCNF)."}, {"icon": "fa-scale-balanced", "title": "3NF vs BCNF", "body": "<strong>BCNF</strong> nghiêm hơn 3NF. Nếu đã BCNF → chắc chắn 3NF. Ngược lại, bảng có thể 3NF mà vẫn vi phạm BCNF (vd khi có 2+ candidate key overlap)."}],
                visual: {
          diagram: {"type": "nf", "before": {"title": "TRƯỚC — vi phạm 3NF", "columns": ["order_id", "product_id", "category", "category_manager"], "rows": [["1001", "P01", "Game", "An"], ["1002", "P02", "Game", "An"], ["1003", "P03", "Gear", "Bình"]], "violations": {"0-3": true, "1-3": true}}, "after": {"title": "SAU — đã 3NF (tách categories)", "columns": ["order_id", "product_id", "category"], "rows": [["1001", "P01", "Game"], ["1002", "P02", "Game"], ["1003", "P03", "Gear"]]}, "note": "Tách categories(category, manager) riêng. category_manager lưu 1 lần / category."},
          schema: {
            table_name: 'orders',
            columns: [
              { name: 'order_id',   type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'product_id', type: 'INT',     key: 'FK', icon: '🔗' },
              { name: 'qty',        type: 'INT',     key: '',   icon: '#️⃣' },
              { name: 'order_date', type: 'DATE',    key: '',   icon: '📅' }
            ]
          },
          data_preview: [
            ['1001', 'P01', '2', '2024-04-01'],
            ['1002', 'P02', '1', '2024-04-03'],
            ['1003', 'P03', '3', '2024-04-05'],
            ['1004', 'P01', '1', '2024-04-08']
          ]
        },
                mission: 'Hoàn thành game kéo-thả để tách <code class="code">orders</code> thành <code class="code">categories</code>, <code class="code">products</code>, và <code class="code">orders</code>.'
      },

        step_2: {
        mcq: [{"question": "3NF phân biệt với BCNF ở điểm nào?", "options": [{"id": "a", "text": "3NF cho phép FD non-superkey, BCNF không", "correct": true}, {"id": "b", "text": "BCNF chỉ áp dụng cho bảng > 5 cột", "correct": false}, {"id": "c", "text": "3NF nghiêm hơn BCNF", "correct": false}, {"id": "d", "text": "BCNF là tên khác của 3NF", "correct": false}]}, {"question": "Transitive dependency là gì?", "options": [{"id": "a", "text": "FD X → Y → Z (Y quyết định Z, X quyết định Y)", "correct": true}, {"id": "b", "text": "FD ngược Y → X", "correct": false}, {"id": "c", "text": "Mọi cột đều phụ thuộc PK", "correct": false}, {"id": "d", "text": "Có 2 khóa chính", "correct": false}]}],
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
        mini_game: {"type": "order", "title": "Sắp xếp thứ tự NF", "instruction": "Kéo thả để xếp theo thứ tự từ <strong>lỏng nhất → nghiêm nhất</strong>.", "items": [{"id": "1nf", "label": "1NF — atomic domains"}, {"id": "2nf", "label": "2NF — no partial dep"}, {"id": "3nf", "label": "3NF — no transitive dep"}, {"id": "bcnf", "label": "BCNF — every FD has superkey on LHS"}], "solution": {"1nf": 1, "2nf": 2, "3nf": 3, "bcnf": 4}}
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
          { id: 'select-line', placeholder: 'SELECT ____ , ____',   accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',            accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____', accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE'], multi: true }
        ],
        expected_sql: "SELECT product_id, qty FROM orders WHERE qty > 2;",
        reveal_hints: {
          'select-line': 'SELECT 2 cột: product_id và qty',
          'from-line':   'FROM orders',
          'where-line':  'Lọc theo qty > 2'
        }
      },

      step_4: {
        prompt: 'Sau 3NF, tách thành 3 bảng <code>orders</code>, <code>products</code>, <code>categories</code>. Tính <strong>tổng doanh thu theo từng category</strong> từ ngày <code>2024-04-05</code>. Hiển thị category + tổng tiền, sắp xếp giảm dần.',
        starter: "-- Tổng doanh thu theo category từ 2024-04-05\n-- JOIN orders ↔ products ↔ categories + GROUP BY + SUM + ORDER BY\nSELECT c., SUM(o.qty * p.) AS \n  FROM orders o\n  JOIN products p ON o. = p.\n  JOIN categories c ON p. = c.\n WHERE o. >= '2024-04-05'\n GROUP BY c.\n ORDER BY  DESC;\n",
        schema: {
          table_name: 'products',
          columns: [
            { name: 'product_id', type: 'INT',     key: 'PK', icon: '🔑' },
            { name: 'product_name', type: 'VARCHAR', key: '',   icon: '📦' },
            { name: 'category', type: 'VARCHAR', key: 'FK', icon: '🏷️' },
            { name: 'price',     type: 'DECIMAL', key: '',   icon: '💰' }
          ],
          data: [
            ['P01', 'Elden Ring',  'Game', '60.00'],
            ['P02', 'Hades',       'Game', '25.00'],
            ['P03', 'Bàn phím cơ', 'Gear', '40.00'],
            ['P04', 'Chuột gaming','Gear', '50.00'],
            ['P05', 'Màn hình 27"','Gear', '450.00']
          ]
        },
        related_schemas: [
          {
            table_name: 'orders',
            columns: [
              { name: 'order_id',   type: 'INT',  key: 'PK' },
              { name: 'product_id', type: 'INT',  key: 'FK' },
              { name: 'qty',        type: 'INT',  key: '' },
              { name: 'order_date', type: 'DATE', key: '' }
            ],
            data: [
              ['1001', 'P01', '2', '2024-04-01'],
              ['1002', 'P02', '1', '2024-04-03'],
              ['1003', 'P03', '3', '2024-04-05'],
              ['1004', 'P01', '1', '2024-04-08'],
              ['1005', 'P04', '2', '2024-04-10']
            ]
          },
          {
            table_name: 'categories',
            columns: [
              { name: 'category',        type: 'VARCHAR', key: 'PK' },
              { name: 'category_manager', type: 'VARCHAR', key: '' }
            ],
            data: [
              ['Game', 'An'],
              ['Gear', 'Bình']
            ]
          }
        ],
        expected_sql: "SELECT c.category, SUM(o.qty * p.price) AS total_revenue FROM orders o JOIN products p ON o.product_id = p.product_id JOIN categories c ON p.category = c.category WHERE o.order_date >= '2024-04-05' GROUP BY c.category ORDER BY total_revenue DESC;",
        hints: [
          { level: 1, text: 'Bạn cần <em>JOIN 3 bảng</em> (orders ↔ products ↔ categories), tính <code>SUM(qty * price)</code> cho mỗi category, lọc theo ngày, GROUP BY + ORDER BY DESC.' },
          { level: 2, text: 'JOIN chain: <code>orders o JOIN products p ON o.product_id = p.product_id JOIN categories c ON p.category = c.category</code>.' },
          { level: 3, text: '<code>SUM(o.qty * p.price) AS total_revenue</code> — nhân số lượng với giá. WHERE <code>order_date >= \'2024-04-05\'</code>.' },
          { level: 4, text: "<code class=\"code\">SELECT c.category, SUM(o.qty * p.price) AS total_revenue FROM orders o JOIN products p ON o.product_id = p.product_id JOIN categories c ON p.category = c.category WHERE o.order_date >= '2024-04-05' GROUP BY c.category ORDER BY total_revenue DESC;</code>" }
        ],
        success_message: 'Hoàn thành 3NF nâng cao! Phụ thuộc bắc cầu đã được loại bỏ. Bạn đã tính tổng doanh thu qua 3 bảng — đây là pattern quan trọng trong business intelligence.',
        xp_reward: 90
      }
    },

    /* ========================================================================
     * BÀI 12 — 4NF: Phụ thuộc đa trị (Multivalued Dependency)
     * Concept: 1 khóa quyết định NHIỀU giá trị độc lập của nhiều cột
     * ======================================================================== */
    {
      id: 'db_12', index: 12,
      title: 'Dạng chuẩn 4 (4NF) — Phụ thuộc đa trị',
      subtitle: 'Loại bỏ phụ thuộc đa trị độc lập — tránh lặp tổ hợp Cartesian',
      module: 2, module_title: 'Chuẩn hóa dữ liệu (Normal Forms)',
      estimated_minutes: 22, xp_reward: 75,
      project_piece: '🧬 Mở khóa "Máy Tách Tập Độc Lập"',
      drag_type: 'box',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'course_offering_raw',
          columns: ['course_id', 'textbook', 'instructor'],
          dataRows: [
            ['CS101', 'Database Concepts', 'Dr. Trần'],
            ['CS101', 'SQL Performance',   'Dr. Trần'],
            ['CS101', 'Database Concepts', 'Dr. Lê'],
            ['CS101', 'SQL Performance',   'Dr. Lê']
          ]
        }
      },

      step_1: {
        primer: {
          goal: [
            'Phụ thuộc đa trị (MVD): X →→ Y — X quyết định NHIỀU giá trị Y độc lập',
            'Vi phạm 4NF: bảng chứa ≥ 2 MVD độc lập từ cùng 1 khóa → tổ hợp Cartesian lặp',
            'Sửa: tách thành 2 bảng, mỗi bảng chứa 1 MVD'
          ],
          intro: 'Trong <strong>hệ thống khóa học</strong>, một khóa học <code>CS101</code> có NHIỀU giáo trình (Database Concepts, SQL Performance) VÀ NHIỀU giảng viên (Dr. Trần, Dr. Lê). Hai tập này <em>độc lập</em> với nhau — nhưng khi nhét vào 1 bảng, ta buộc phải lặp tổ hợp Cartesian: 2 textbook × 2 instructor = 4 dòng, dù thực tế chỉ cần 2 + 2 = 4 dòng tách biệt.',
          example: 'Bảng <code>course_offering_raw</code> có MVD: <code>course_id →→ textbook</code> và <code>course_id →→ instructor</code>. Hai MVD này độc lập → vi phạm 4NF. Sửa: tách thành <code>course_textbook(course_id, textbook)</code> và <code>course_instructor(course_id, instructor)</code>. Mỗi bảng chỉ chứa 1 MVD → không còn lặp Cartesian.'
        },
        concept_cards: [{"icon": "fa-cubes-stacked", "title": "4NF — No Multivalued Dependency", "body": "Khi 1 khóa X quyết định NHIỀU giá trị Y độc lập với các cột khác → <code>X →→ Y</code> (multivalued dep). Tách thành 2 bảng riêng."}, {"icon": "fa-explosion", "title": "Cartesian explosion", "body": "Nếu <code>prof →→ course</code> và <code>prof →→ hobby</code> mà không tách → bảng có số dòng = |course| × |hobby|. Vd: 4 course × 3 hobby = 12 dòng thay vì 4+3=7."}],
                visual: {
          
          diagram: {"type": "nf", "before": {"title": "TRƯỚC — vi phạm 4NF", "columns": ["prof", "course", "hobby"], "rows": [["Dr. Lee", "DB", "Chess"], ["Dr. Lee", "DB", "Music"], ["Dr. Lee", "AI", "Chess"], ["Dr. Lee", "AI", "Music"]], "violations": {"0-2": true, "0-1": true}}, "after": {"title": "SAU — đã 4NF (tách 2 bảng)", "columns": ["prof", "course"], "rows": [["Dr. Lee", "DB"], ["Dr. Lee", "AI"]]}, "note": "Tách thành 2 bảng: prof_course + prof_hobby. Mỗi MVD 1 bảng riêng."},
          schema: {
            table_name: 'course_offering_raw',
            columns: [
              { name: 'course_id',   type: 'VARCHAR', key: 'PK', icon: '🔑' },
              { name: 'textbook',    type: 'VARCHAR', key: '',   icon: '📚' },
              { name: 'instructor',  type: 'VARCHAR', key: '',   icon: '👨‍🏫' }
            ]
          },
          data_preview: [
            ['CS101', 'Database Concepts', 'Dr. Trần'],
            ['CS101', 'SQL Performance',   'Dr. Trần'],
            ['CS101', 'Database Concepts', 'Dr. Lê'],
            ['CS101', 'SQL Performance',   'Dr. Lê'],
            ['CS202', 'Clean Code',        'Dr. Phạm'],
            ['CS202', 'Refactoring',       'Dr. Phạm']
          ]
        },
        mission: 'Quan sát: CS101 có 2 textbook × 2 instructor = 4 dòng lặp tổ hợp. Nếu thêm 1 instructor nữa → thêm 2 dòng mới (mỗi textbook). Đó là dấu hiệu vi phạm 4NF.'
      },

      step_2: {
        mcq: [
          {
            question: 'Phụ thuộc đa trị (Multivalued Dependency) X →→ Y nghĩa là gì?',
            options: [
              { id: 'a', text: 'X quyết định đúng 1 giá trị Y', correct: false },
              { id: 'b', text: 'X quyết định NHIỀU giá trị Y, và tập Y độc lập với các cột khác', correct: true },
              { id: 'c', text: 'Y quyết định X', correct: false },
              { id: 'd', text: 'X và Y là cùng 1 cột', correct: false }
            ]
          },
          {
            question: 'Khi nào một bảng VI PHẠM 4NF?',
            options: [
              { id: 'a', text: 'Khi bảng có khóa chính tổng hợp', correct: false },
              { id: 'b', text: 'Khi bảng có ≥ 2 MVD độc lập từ cùng 1 khóa → sinh tổ hợp Cartesian lặp', correct: true },
              { id: 'c', text: 'Khi bảng có cột JSON', correct: false },
              { id: 'd', text: 'Khi bảng có hơn 3 cột', correct: false }
            ]
          }
        ],
        mini_game: {
          title: 'Phân loại: tình huống nào vi phạm 4NF?',
          instruction: 'Kéo mỗi tình huống vào ô tương ứng.<br><strong style="color:var(--success)">Vi phạm 4NF</strong> (≥ 2 MVD độc lập) · <strong style="color:var(--text-400)">Không vi phạm</strong> (chỉ 1 MVD hoặc không có).',
          chips: [
            { id: 'mv1', label: 'course_id →→ textbook AND course_id →→ instructor' },
            { id: 'mv2', label: 'user_id →→ email (1 user có nhiều email, không có MVD khác)' },
            { id: 'mv3', label: 'movie_id →→ actor AND movie_id →→ director' },
            { id: 'mv4', label: 'order_id → product (1 order có 1 product duy nhất)' }
          ],
          bins: [
            { id: 'yes', label: 'Vi phạm 4NF',  correct: 'yes' },
            { id: 'no',  label: 'Không vi phạm', correct: 'no' }
          ],
          solution: {
            'mv1': 'yes',
            'mv2': 'no',
            'mv3': 'yes',
            'mv4': 'no'
          }
        }
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',          slot: 'kw-select' },
          { type: 'col', token: 'textbook',        slot: 'col-1' },
          { type: 'kw',  token: 'FROM',            slot: 'kw-from' },
          { type: 'tbl', token: 'course_textbook', slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',           slot: 'kw-where' },
          { type: 'col', token: 'course_id',       slot: 'wcol-1' },
          { type: 'op',  token: '=',               slot: 'op-1' },
          { type: 'val', token: "'CS101'",         slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____',                accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',                  accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',       accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE'], multi: true }
        ],
        expected_sql: "SELECT textbook FROM course_textbook WHERE course_id = 'CS101';",
        reveal_hints: {
          'select-line': 'SELECT 1 cột: <strong>textbook</strong>.',
          'from-line':   'FROM bảng đã tách 4NF: <strong>course_textbook</strong>.',
          'where-line':  "WHERE lọc course: <strong>course_id = 'CS101'</strong>."
        }
      },

      step_4: {
        prompt: 'Sau 4NF, tách thành 2 bảng <code>course_textbook</code> và <code>course_instructor</code>. Tìm <strong>top khóa học có nhiều textbook nhất</strong>. Hiển thị course_id + số textbook, sắp xếp giảm dần.',
        starter: "-- Top khóa học có nhiều textbook nhất\n-- GROUP BY course_id + COUNT + ORDER BY DESC\nSELECT , COUNT(*) AS \n  FROM course_textbook\n GROUP BY \n ORDER BY  DESC;\n",
        schema: {
          table_name: 'course_textbook',
          columns: [
            { name: 'course_id', type: 'VARCHAR', key: 'PK', icon: '🔑' },
            { name: 'textbook',  type: 'VARCHAR', key: '',   icon: '📚' }
          ],
          data: [
            ['CS101', 'Database Concepts'],
            ['CS101', 'SQL Performance'],
            ['CS202', 'Clean Code'],
            ['CS202', 'Refactoring'],
            ['CS303', 'Design Patterns']
          ]
        },
        related_schemas: [
          {
            table_name: 'course_instructor',
            columns: [
              { name: 'course_id',  type: 'VARCHAR', key: 'PK' },
              { name: 'instructor', type: 'VARCHAR', key: '' }
            ],
            data: [
              ['CS101', 'Dr. Trần'],
              ['CS101', 'Dr. Lê'],
              ['CS202', 'Dr. Phạm']
            ]
          }
        ],
        expected_sql: "SELECT course_id, COUNT(*) AS textbook_count FROM course_textbook GROUP BY course_id ORDER BY textbook_count DESC;",
        hints: [
          { level: 1, text: 'Bạn cần <em>đếm số textbook theo từng course</em>. Hãy nghĩ: <strong>GROUP BY course_id</strong> + <strong>COUNT(*)</strong> + <strong>ORDER BY DESC</strong>.' },
          { level: 2, text: 'SELECT 2 cột: <code>course_id</code> và <code>COUNT(*) AS textbook_count</code>.' },
          { level: 3, text: 'GROUP BY <code>course_id</code> gom nhóm theo khóa học. COUNT(*) đếm số textbook.' },
          { level: 4, text: "<code class=\"code\">SELECT course_id, COUNT(*) AS textbook_count FROM course_textbook GROUP BY course_id ORDER BY textbook_count DESC;</code>" }
        ],
        success_message: 'Hoàn thành 4NF nâng cao! Phụ thuộc đa trị đã được tách — textbook và instructor là 2 chiều độc lập. Bài 13 sẽ là BOSS BATTLE — tổng hợp mọi dạng chuẩn trên hệ thống Mạng Xã Hội Gamers.',
        xp_reward: 75
      }
    },

    /* ========================================================================
     * BÀI 13 — BOSS BATTLE: 4 stages trên Mạng Xã Hội Gamers
     * ======================================================================== */
    {
      id: 'db_13', index: 13,
      title: 'Trận chiến cuối — Siêu hệ thống chuẩn hóa',
      subtitle: 'Tổng hợp mọi quy tắc — Boss battle Mạng Xã Hội Gamers',
      module: 2, module_title: 'Chuẩn hóa dữ liệu (Normal Forms)',
      estimated_minutes: 30, xp_reward: 100,
      project_piece: '👑 Mở khóa Vương Miện "Kiến Trúc Sư CSDL Nội tại"',
      drag_type: 'box',
      challenge_type: 'full_ide',
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
        concept_cards: [{"icon": "fa-crown", "title": "Boss Battle — Grand System", "body": "Thiết kế schema cho hệ thống Mạng Xã Hội Gamers hoàn chỉnh: users, posts, games, genres, platforms, friends, likes, comments. Áp dụng 1NF→BCNF cho toàn bộ."}, {"icon": "fa-trophy", "title": "Đáp án tham khảo", "body": "5 bảng chính (users, posts, games, genres, platforms) + 2-3 bảng junction (user_friends, post_likes, post_games). Mỗi game có thể thuộc nhiều genre → junction table."}],
                visual: {
          diagram: {"type": "nf", "before": {"title": "TRƯỚC — bảng tổng (siêu vi phạm)", "columns": ["user_id", "username", "country", "is_premium", "post_id", "post_text", "game_name"], "rows": [["U01", "minh_gamer", "VN", "true", "P01", "Clear Elden Ring!", "Elden Ring"], ["U02", "yuki_99", "JP", "false", "P02", "Hades quá hay", "Hades"]], "violations": {"0-5": true, "0-6": true}}, "after": {"title": "SAU — schema sạch (sau 4 vòng)", "columns": ["user_id", "post_id", "game_id", "post_date"], "rows": [["U01", "P01", "G01", "2024-05-01"], ["U02", "P02", "G02", "2024-05-02"]]}, "note": "7 bảng: users, posts, games, genres, platforms + post_game (junction), post_genre (junction)."},
          schema: {
            table_name: 'users',
            columns: [
              { name: 'user_id',    type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'username',   type: 'VARCHAR', key: '',   icon: '👤' },
              { name: 'user_email', type: 'VARCHAR', key: '',   icon: '📧' },
              { name: 'country',    type: 'VARCHAR', key: '',   icon: '🌏' },
              { name: 'is_premium', type: 'BOOLEAN', key: '',   icon: '👑' }
            ]
          },
          data_preview: [
            ['U01', 'minh_gamer', 'minh@x.com', 'VN', 'true'],
            ['U02', 'yuki_99',    'yuki@x.com', 'JP', 'false'],
            ['U03', 'sara_plays', 'sara@x.com', 'VN', 'true'],
            ['U04', 'alex_pro',   'alex@x.com', 'US', 'true']
          ]
        },
                mission: 'Hoàn thành 4 vòng chiến bằng cách tách dần bảng <code class="code">gamers_social</code> khổng lồ thành schema sạch: <code class="code">users</code>, <code class="code">posts</code>, <code class="code">games</code>, <code class="code">genres</code>, <code class="code">platforms</code>, và các bảng junction.'
      },

      step_2: {
        mcq: [
          {
            question: 'Sau khi áp dụng đầy đủ 1NF → 2NF → 3NF → BCNF, Mạng Xã Hội Gamers nên có tối thiểu bao nhiêu bảng?',
            options: [
              { id: 'a', text: '1 bảng (gamers_social)', correct: false },
              { id: 'b', text: '2 bảng (users + games)', correct: false },
              { id: 'c', text: '5 bảng (users, posts, games, genres, platforms + 2-3 junction)', correct: true },
              { id: 'd', text: '20 bảng (mỗi user một bảng riêng)', correct: false }
            ]
          },
          {
            question: 'Boss Battle — junction table dùng cho quan hệ nào?',
            options: [
              { id: 'a', text: 'user ↔ post (1:N — không cần junction)', correct: false },
              { id: 'b', text: 'post ↔ game (M:N — mỗi post có thể nhắc nhiều game, mỗi game có thể ở nhiều post)', correct: true },
              { id: 'c', text: 'user ↔ country (1:1 — không cần junction)', correct: false },
              { id: 'd', text: 'post ↔ post_date (cùng bảng)', correct: false }
            ]
          }
        ],
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
        mini_game: {"type": "order", "title": "Thiết kế schema Boss Battle — sắp xếp thứ tự", "instruction": "Kéo thả theo thứ tự đúng để thiết kế Mạng Xã Hội Gamers.", "items": [{"id": "i1", "label": "1. Xác định entity: users, posts, games, genres, platforms"}, {"id": "i2", "label": "2. Tách game ↔ genre (M:N → junction table)"}, {"id": "i3", "label": "3. Tách post ↔ game (M:N → junction)"}, {"id": "i4", "label": "4. Kiểm tra BCNF cho từng bảng"}], "solution": {"i1": 1, "i2": 2, "i3": 3, "i4": 4}}
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
          { id: 'select-line', placeholder: 'SELECT ____ , ____',   accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',            accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____', accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE'], multi: true }
        ],
        expected_sql: "SELECT username, country FROM users WHERE is_premium = true;",
        reveal_hints: {
          'select-line': 'SELECT 2 cột: username và country',
          'from-line':   'FROM users',
          'where-line':  'Lọc is_premium = true (boolean, không cần dấu nháy)'
        }
      },

      step_4: {
        prompt: 'BOSS BATTLE — Từ hệ thống Mạng Xã Hội Gamers (sau 4 vòng chuẩn hóa): tìm <strong>top 3 user premium</strong> có <strong>nhiều post nhất</strong>. Hiển thị username, country, và số post. Sắp xếp giảm dần theo post_count.',
        starter: "-- BOSS BATTLE: Top 3 user premium có nhiều post nhất\n-- JOIN 2 bảng (users ↔ posts) + GROUP BY + ORDER BY + LIMIT\nSELECT u., u., COUNT(p.) AS post_count\n  FROM users u\n  JOIN posts p ON p. = u.\n WHERE u. = \n GROUP BY u., u., u.\n ORDER BY post_count DESC\n LIMIT 3;\n",
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
        expected_sql: "SELECT u.username, u.country, COUNT(p.post_id) AS post_count FROM users u JOIN posts p ON p.user_id = u.user_id WHERE u.is_premium = true GROUP BY u.user_id, u.username, u.country ORDER BY post_count DESC LIMIT 3;",
        hints: [
          { level: 1, text: 'Boss Battle! Bạn cần <em>kết hợp dữ liệu từ 2 bảng</em> (users và posts), lọc theo điều kiện, đếm, sắp xếp, lấy top. Hãy nghĩ: dùng JOIN + GROUP BY + ORDER BY + LIMIT.' },
          { level: 2, text: 'Cần <code>JOIN users ↔ posts</code> qua <code>user_id</code>.' },
          { level: 3, text: '<code>WHERE is_premium = true</code> + <code>GROUP BY u.user_id, u.username, u.country</code>' },
          { level: 4, text: "<code class=\"code\">SELECT u.username, u.country, COUNT(p.post_id) AS post_count FROM users u JOIN posts p ON p.user_id = u.user_id WHERE u.is_premium = true GROUP BY u.user_id, u.username, u.country ORDER BY post_count DESC LIMIT 3;</code>" }
        ],
        success_message: '👑 CHÚC MỪNG! Bạn đã trở thành KIẾN TRÚC SƯ CSDL! Bạn đã chinh phục 13 bài Module 1+2, từ Entity/PK cơ bản đến chuẩn hóa 4NF + multi-table JOIN trên hệ thống Mạng Xã Hội Gamers phức tạp. Sắp tới Module 3 — bước vào thế giới Ứng dụng Thực tế (JSON, Spatial, ORM, Bảo mật).',
        xp_reward: 100
      }
    },

    {
      id: 'db_14', index: 14,
      title: 'JSON trong Database — Path Expressions',
      subtitle: 'Lưu và truy vấn JSON bên trong cột quan hệ',
      module: 3, module_title: 'Application Design',
      icon: '&#123;...&#125;', color: '#8B5CF6',
      estimated_minutes: 18, xp_reward: 60,
      drag_type: 'chip',
      challenge_type: 'full_ide',

      step_1: {
        primer: {
          goal: [
            'JSONB = cột lưu JSON thật, query bằng operator -> và ->>',
            '->> trả về TEXT (chuỗi thuần), -> trả về JSON value',
            'GROUP BY JSON key = phân tích dữ liệu linh hoạt không cần thêm cột'
          ],
          intro: 'Bảng <code class="code">app_users</code> cần lưu <strong>settings của user</strong>: theme (dark/light), notifications (on/off), language (vi/en). Tạo 10 cột? Không — dùng <strong>JSONB</strong>: 1 cột lưu cả object, query bằng <code class="code">->></code> để trích xuất giá trị. PostgreSQL parse JSON binary → truy vấn cực nhanh.',
          example: 'Query <code class="code">settings->>\'theme\'</code> trả về <strong>text thuần</strong> (dark, light…). Dùng trong SELECT, WHERE, GROUP BY. Filter: <code class="code">WHERE settings->>\'notifications\' = \'true\'</code> — lưu ý: value là string, dùng nháy đơn.'
        },
        concept_cards: [{"icon": "fa-brackets-curly", "title": "JSON in Relational DB", "body": "Lưu trữ cấu trúc linh hoạt (JSONB) trong cột quan hệ. Truy vấn qua toán tử <code>-&gt;&gt;</code> (text) hoặc <code>-&gt;</code> (json). Index bằng GIN index cho tốc độ."}, {"icon": "fa-database", "title": "Khi nào dùng JSON?", "body": "Settings, preferences, tags, metadata thay đổi liên tục. KHÔNG dùng cho dữ liệu có quan hệ chặt (orders, users) — tách bảng thường."}],
                visual: {
          
          diagram: {"type": "nf", "before": {"title": "TRƯỚC — 1 bảng tổng (BAD)", "columns": ["user_id", "username", "post_id", "post_text", "game_name", "genre"], "rows": [["U1", "alice", "P1", "My first post", "Elden Ring", "RPG"], ["U1", "alice", "P1", "My first post", "Elden Ring", "Action"], ["U2", "bob", "P2", "Check this", "Hades", "Rogue"]], "violations": {"0-5": true, "0-4": true, "1-5": true, "1-4": true}}, "after": {"title": "SAU — 5 bảng + 2 junction", "columns": ["user_id", "post_id", "game_id", "genre_id", "platform_id"], "rows": [["U1", "P1", "G1", "G_RPG", "PC"], ["U1", "P1", "G1", "G_Act", "PC"], ["U2", "P2", "G2", "G_Rog", "PS5"]]}, "note": "7 bảng: users, posts, games, genres, platforms + post_game (junction), post_genre (junction)."},
          
          diagram: {"type": "flow", "steps": [{"icon": "fa-user", "title": "Web App / Form", "sub": "User thay đổi setting (theme: dark)", "payload": "POST /api/settings"}, {"icon": "fa-code", "title": "Python / Django ORM", "sub": "Validate + serialize sang JSONB", "payload": "settings = {'theme': 'dark'}"}, {"icon": "fa-server", "title": "PostgreSQL", "sub": "Lưu JSONB vào cột settings", "payload": "INSERT INTO app_users (..., settings) VALUES (...)"}, {"icon": "fa-arrow-rotate-left", "title": "ORM → Python dict", "sub": "Đọc lại: settings->>theme = \"dark\"", "payload": "SELECT settings->>'theme' FROM app_users"}, {"icon": "fa-display", "title": "HTML Response", "sub": "Render UI với theme mới", "payload": "<html data-theme=\"dark\">"}]},
          schema: {
            table_name: 'app_users',
            columns: [
              { name: 'user_id',   type: 'VARCHAR', key: 'PK', icon: '&#128273;' },
              { name: 'username',  type: 'VARCHAR', key: '',  icon: '' },
              { name: 'settings',  type: 'JSONB',   key: '',  icon: '&#123;...&#125;' },
              { name: 'last_login',type: 'TIMESTAMP',key: '',  icon: '' }
            ]
          },
          data_preview: [
            ['U01','minh_dev','{"theme":"dark","notifications":true,"lang":"vi"}','2026-01-10'],
            ['U02','yuki_dev','{"theme":"light","notifications":false,"lang":"en"}','2026-01-11'],
            ['U03','sara_dev','{"theme":"dark","notifications":true,"lang":"en"}','2026-01-12'],
            ['U04','alex_dev','{"theme":"auto","notifications":true,"lang":"vi"}','2026-01-13']
          ]
        },
        mission: 'Lấy <code class="code">username</code> và giá trị <code class="code">theme</code> từ JSON. Kéo thả khối lệnh ↓'
      },

      step_2: {
        mcq: [
          {
            question: 'Query nào trả về giá trị <strong>text thuần</strong> (không có nháy) từ JSON?',
            options: [
              { id: 'a', text: "<code>settings->'theme'</code> — trả về <code>\"dark\"</code> (JSON value)", correct: false },
              { id: 'b', text: "<code>settings->>'theme'</code> — trả về <code>dark</code> (text thuần)", correct: true },
              { id: 'c', text: "<code>settings#>'{theme}'</code> — trả về <code>dark</code> (path lookup)", correct: false },
              { id: 'd', text: "<code>SELECT theme FROM settings</code> — giả định cột theme tồn tại", correct: false }
            ]
          },
          {
            question: "Filter user có <code>notifications = true</code> trong JSONB. Cú pháp nào ĐÚNG?",
            options: [
              { id: 'a', text: "<code>WHERE settings->>notifications = true</code> — JSON value", correct: false },
              { id: 'b', text: "<code>WHERE settings->>notifications = 'true'</code> — text với nháy đơn", correct: true },
              { id: 'c', text: "<code>WHERE notifications = true</code> — cột thường", correct: false },
              { id: 'd', text: "<code>WHERE settings LIKE '%notifications%'</code> — string match (chậm + sai)", correct: false }
            ]
          }
        ],
        mini_game: {"type": "classify", "title": "Phân loại: khi nào dùng JSON, khi nào tách bảng?", "instruction": "Kéo thẻ vào ô phù hợp.", "chips": [{"id": "c-theme", "label": "User settings.theme (dark/light/auto)"}, {"id": "c-tags", "label": "Post tags (rpg, indie, soulslike)"}, {"id": "c-email", "label": "User email"}, {"id": "c-meta", "label": "Product metadata (dimensions, weight)"}], "bins": [{"id": "json", "label": "Nên lưu JSON (linh hoạt)", "correct": "json"}, {"id": "tbl", "label": "Nên tách bảng (quan hệ chặt)", "correct": "tbl"}], "solution": {"c-theme": "json", "c-tags": "json", "c-email": "tbl", "c-meta": "json"}}
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',           slot: 'kw-select' },
          { type: 'col', token: 'username',          slot: 'col-1' },
          { type: 'kw',  token: ',',                 slot: 'op-comma1' },
          { type: 'col', token: 'settings',           slot: 'col-2' },
          { type: 'op',  token: "->>'theme'",        slot: 'op-extract1' },
          { type: 'kw',  token: 'AS',                slot: 'kw-as' },
          { type: 'col', token: 'theme',              slot: 'col-alias1' },
          { type: 'kw',  token: 'FROM',              slot: 'kw-from' },
          { type: 'tbl', token: 'app_users',          slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',             slot: 'kw-where' },
          { type: 'col', token: 'settings',           slot: 'col-filter' },
          { type: 'op',  token: "->>'notifications'", slot: 'op-extract2' },
          { type: 'op',  token: "= 'true'",           slot: 'op-eq' }
        ],
        drop_zones: [
          { id: 'select-line',  placeholder: "SELECT username, settings->>'theme' AS theme", accepts: ['kw','col','op'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',    placeholder: 'FROM app_users', accepts: ['kw','tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',   placeholder: "WHERE settings->>'notifications' = 'true'", accepts: ['kw','col','op'], acceptedKeywords: ['WHERE'], multi: true }
        ],
        expected_sql: "SELECT username, settings->>'theme' AS theme FROM app_users WHERE settings->>'notifications' = 'true';",
        reveal_hints: {
          'select-line':  "<code>settings->>'theme'</code> trả về text thuần. <code>->></code> là toán tử trích xuất JSON.",
          'from-line':    'Bảng <code>app_users</code> lưu settings dạng JSONB.',
          'where-line':   "<code>settings->>'notifications' = 'true'</code> — giá trị JSON là string, dùng nháy đơn."
        }
      },

      step_4: {
        prompt: "Viết query đếm <strong>số user theo từng theme</strong> từ JSONB. Dùng <code>GROUP BY settings->>'theme'</code>. Đếm user, nhóm theo theme, sắp xếp giảm dần.",
        starter: "-- Đếm user theo theme (extract từ JSONB)\n-- GROUP BY settings->>'theme' + ORDER BY count DESC\nSELECT settings->>'theme' AS , COUNT(*) AS \n  FROM app_users\n GROUP BY settings->>'theme'\n ORDER BY  DESC;\n",
        schema: {
          table_name: 'app_users',
          columns: [
            { name: 'user_id',  type: 'VARCHAR', key: 'PK', icon: '&#128273;' },
            { name: 'username', type: 'VARCHAR', key: '',  icon: '' },
            { name: 'settings', type: 'JSONB',   key: '',  icon: '&#123;...&#125;' }
          ],
          data: [
            ['U01','minh_dev','{"theme":"dark","notifications":true,"lang":"vi"}'],
            ['U02','yuki_dev','{"theme":"light","notifications":false,"lang":"en"}'],
            ['U03','sara_dev','{"theme":"dark","notifications":true,"lang":"en"}'],
            ['U04','alex_dev','{"theme":"auto","notifications":true,"lang":"vi"}'],
            ['U05','lisa_dev','{"theme":"light","notifications":true,"lang":"vi"}'],
            ['U06','ken_dev', '{"theme":"dark","notifications":false,"lang":"en"}']
          ]
        },
        expected_sql: "SELECT settings->>'theme' AS theme, COUNT(*) AS user_count FROM app_users GROUP BY settings->>'theme' ORDER BY user_count DESC;",
        hints: [
          { level: 1, text: "Bạn muốn <em>phân tích dữ liệu JSON linh hoạt</em> — trích xuất 1 key từ JSON, đếm số lượng theo từng giá trị của key đó, sắp xếp giảm dần. Hãy nghĩ: trích key = <code>-&gt;&gt;</code>, đếm = <code>COUNT</code>, nhóm = <code>GROUP BY</code>." },
          { level: 2, text: "<code>GROUP BY settings->>'theme'</code> — extract key từ JSON rồi GROUP như cột thường." },
          { level: 3, text: "<code>SELECT settings->>'theme' AS theme, COUNT(*)</code> — alias cho dễ đọc." },
          { level: 4, text: "<code>ORDER BY user_count DESC</code> — theme nào nhiều user nhất lên đầu." }
        ],
        success_message: 'JSONB + GROUP BY = phân tích dữ liệu linh hoạt. Không cần ALTER TABLE để thêm cột!',
        xp_reward: 60
      }
    },

    {
      id: 'db_15', index: 15,
      title: 'Spatial Data — Dữ liệu Không gian',
      subtitle: 'Truy vấn tọa độ GPS, tìm điểm gần nhất',
      module: 3, module_title: 'Application Design',
      icon: '&#128205;', color: '#10B981',
      estimated_minutes: 18, xp_reward: 60,
      drag_type: 'chip',
      challenge_type: 'full_ide',

      step_1: {
        primer: {
          goal: [
            'POINT = kiểu dữ liệu lưu tọa độ (x, y) trong PostgreSQL',
            'ST_Distance = tính khoảng cách Euclidean giữa 2 điểm',
            'ST_DWithin = kiểm tra nằm trong bán kính (dùng spatial index → rất nhanh)'
          ],
          intro: 'Chuỗi cửa hàng <code class="code">shop_branches</code> lưu tọa độ GPS trong cột <code class="code">geo_location POINT</code>. Bạn cần tìm cửa hàng <strong>gần trung tâm nhất</strong>, hoặc lọc cửa hàng <strong>trong bán kính 5km</strong>. Dùng <code class="code">ST_Distance</code> và <code class="code">ST_DWithin</code> — hai spatial function phổ biến nhất.',
          example: '<code class="code">ST_Distance(geo_location, ST_MakePoint(106.7009, 10.7769))</code> tính khoảng cách từ mỗi cửa hàng đến Quảng trường 10/10. <code class="code">ST_DWithin(geo_location, ST_MakePoint(...), 5)</code> lọc nhanh bằng spatial index (GiST) — hiệu quả hơn ST_Distance.'
        },
        concept_cards: [{"icon": "fa-location-dot", "title": "Spatial Data (PostGIS)", "body": "Lưu tọa độ địa lý dạng <code>POINT(lon, lat)</code>. Index bằng R-tree (spatial GIST) cho query khoảng cách cực nhanh (<code>ST_DWithin</code>, <code>ST_Distance</code>)."}, {"icon": "fa-globe", "title": "Tọa độ — kinh độ trước", "body": "<code>ST_MakePoint(lon, lat)</code> — <strong>longitude trước</strong> (X), latitude sau (Y). Sai 1 số thập phân = lệch cả km. Vietnam: lon ≈ 102-110, lat ≈ 8-23."}],
                visual: {
          
          diagram: {"type": "nf", "before": {"title": "TRƯỚC — 1 bảng tổng (BAD)", "columns": ["user_id", "username", "post_id", "post_text", "game_name", "genre"], "rows": [["U1", "alice", "P1", "My first post", "Elden Ring", "RPG"], ["U1", "alice", "P1", "My first post", "Elden Ring", "Action"], ["U2", "bob", "P2", "Check this", "Hades", "Rogue"]], "violations": {"0-5": true, "0-4": true, "1-5": true, "1-4": true}}, "after": {"title": "SAU — 5 bảng + 2 junction", "columns": ["user_id", "post_id", "game_id", "genre_id", "platform_id"], "rows": [["U1", "P1", "G1", "G_RPG", "PC"], ["U1", "P1", "G1", "G_Act", "PC"], ["U2", "P2", "G2", "G_Rog", "PS5"]]}, "note": "7 bảng: users, posts, games, genres, platforms + post_game (junction), post_genre (junction)."},
          
          diagram: {"type": "flow", "steps": [{"icon": "fa-user", "title": "Web App / Form", "sub": "User thay đổi setting (theme: dark)", "payload": "POST /api/settings"}, {"icon": "fa-code", "title": "Python / Django ORM", "sub": "Validate + serialize sang JSONB", "payload": "settings = {'theme': 'dark'}"}, {"icon": "fa-server", "title": "PostgreSQL", "sub": "Lưu JSONB vào cột settings", "payload": "INSERT INTO app_users (..., settings) VALUES (...)"}, {"icon": "fa-arrow-rotate-left", "title": "ORM → Python dict", "sub": "Đọc lại: settings->>theme = \"dark\"", "payload": "SELECT settings->>'theme' FROM app_users"}, {"icon": "fa-display", "title": "HTML Response", "sub": "Render UI với theme mới", "payload": "<html data-theme=\"dark\">"}]},
          
          diagram: {"type": "flow", "steps": [{"icon": "fa-map-pin", "title": "User location", "sub": "Browser geolocation API", "payload": "(106.7, 10.78)"}, {"icon": "fa-mobile", "title": "Mobile App", "sub": "POST /api/nearest?lat=10.78&lon=106.7", "payload": "GET /nearest"}, {"icon": "fa-code", "title": "Django + GeoDjango", "sub": "Build query PostGIS", "payload": "ST_DWithin(geo, point, 5000)"}, {"icon": "fa-server", "title": "PostgreSQL + PostGIS", "sub": "Spatial index (GIST)", "payload": "shop_branches WHERE ST_DWithin(...)"}, {"icon": "fa-list", "title": "Sorted by distance", "sub": "ST_Distance ORDER BY", "payload": "ORDER BY dist ASC LIMIT 5"}]},
          schema: {
            table_name: 'shop_branches',
            columns: [
              { name: 'branch_id',    type: 'VARCHAR', key: 'PK', icon: '&#128273;' },
              { name: 'name',         type: 'VARCHAR', key: '',  icon: '' },
              { name: 'geo_location', type: 'POINT',   key: '',  icon: '&#128205;' },
              { name: 'city',         type: 'VARCHAR', key: '',  icon: '' }
            ]
          },
          data_preview: [
            ['B01','Quận 1 Center',    '(106.7009, 10.7769)','TP.HCM'],
            ['B02','District 7 Hub',   '(106.7369, 10.7288)','TP.HCM'],
            ['B03','Hanoi Old Quarter','(105.8542, 21.0285)','Hà Nội'],
            ['B04','District 3 Store', '(106.6872, 10.7822)','TP.HCM']
          ]
        },
        mission: 'Tính <code class="code">khoảng cách</code> từ mỗi cửa hàng đến trung tâm TP.HCM. Kéo thả khối lệnh ↓'
      },

      step_2: {
        mcq: [
          {
            question: 'Khi tìm cửa hàng <strong>trong bán kính 5km</strong> từ một điểm, hàm nào hiệu quả hơn?',
            options: [
              { id: 'a', text: '<code>ST_Distance(geo, ST_MakePoint(...)) &lt; 5</code> — tính chính xác mọi điểm', correct: false },
              { id: 'b', text: '<code>ST_DWithin(geo, ST_MakePoint(...), 5)</code> — dùng spatial index', correct: true },
              { id: 'c', text: '<code>ST_Contains(ST_MakeEnvelope(...), geo)</code> — dùng cho polygon', correct: false },
              { id: 'd', text: '<code>WHERE distance &lt; 5</code> — sai cú pháp, distance chưa tính', correct: false }
            ]
          },
          {
            question: 'ST_MakePoint(x, y) dùng thứ tự tọa độ nào?',
            options: [
              { id: 'a', text: 'ST_MakePoint(lat, lon) — latitude trước', correct: false },
              { id: 'b', text: 'ST_MakePoint(lon, lat) — longitude trước (X, Y)', correct: true },
              { id: 'c', text: 'ST_MakePoint(x, y) — thứ tự tùy database', correct: false },
              { id: 'd', text: 'ST_MakePoint(utm_x, utm_y) — luôn dùng UTM', correct: false }
            ]
          }
        ],
        mini_game: {"type": "classify", "title": "Phân loại: ST_* function nào dùng khi nào?", "instruction": "Kéo thẻ vào ô đúng.", "chips": [{"id": "c-dwithin", "label": "Tìm shop trong bán kính 5km"}, {"id": "c-distance", "label": "Tính khoảng cách 2 điểm"}, {"id": "c-contains", "label": "Kiểm tra điểm có nằm trong polygon không"}, {"id": "c-makepoint", "label": "Tạo POINT từ lat, lon"}], "bins": [{"id": "within", "label": "ST_DWithin (range query)", "correct": "within"}, {"id": "distance", "label": "ST_Distance (measure)", "correct": "distance"}, {"id": "contains", "label": "ST_Contains (containment)", "correct": "contains"}, {"id": "create", "label": "ST_MakePoint (create)", "correct": "create"}], "solution": {"c-dwithin": "within", "c-distance": "distance", "c-contains": "contains", "c-makepoint": "create"}}
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',    slot: 'kw-select' },
          { type: 'col', token: 'name',       slot: 'col-1' },
          { type: 'kw',  token: ',',          slot: 'op-comma1' },
          { type: 'fn',  token: 'ST_Distance', slot: 'fn-dist' },
          { type: 'op',  token: '(geo_location, ST_MakePoint(106.7009, 10.7769))', slot: 'fn-args' },
          { type: 'kw',  token: 'AS',         slot: 'kw-as' },
          { type: 'col', token: 'distance',    slot: 'col-alias' },
          { type: 'kw',  token: 'FROM',       slot: 'kw-from' },
          { type: 'tbl', token: 'shop_branches', slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',      slot: 'kw-where' },
          { type: 'fn',  token: 'ST_DWithin', slot: 'fn-dwithin' },
          { type: 'op',  token: '(geo_location, ST_MakePoint(106.7009, 10.7769), 5)', slot: 'fn-dw-args' },
          { type: 'kw',  token: 'ORDER BY',   slot: 'kw-order' },
          { type: 'col', token: 'distance',   slot: 'col-order' },
          { type: 'kw',  token: 'ASC',        slot: 'kw-asc' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT name, ST_Distance(geo_location, ST_MakePoint(...)) AS distance', accepts: ['kw','col','fn','op'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM shop_branches', accepts: ['kw','tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ST_DWithin(geo_location, ST_MakePoint(...), 5)', accepts: ['kw','fn','op'], acceptedKeywords: ['WHERE'], multi: true },
          { id: 'order-line',  placeholder: 'ORDER BY distance ASC', accepts: ['kw','col'], multi: true }
        ],
        expected_sql: "SELECT name, ST_Distance(geo_location, ST_MakePoint(106.7009, 10.7769)) AS distance FROM shop_branches WHERE ST_DWithin(geo_location, ST_MakePoint(106.7009, 10.7769), 5) ORDER BY distance ASC;",
        reveal_hints: {
          'select-line':  '<code>ST_Distance</code> tính khoảng cách từ mỗi cửa hàng đến trung tâm.',
          'where-line':   '<code>ST_DWithin</code> lọc nhanh bằng spatial index. Bán kính 5 (đơn vị tọa độ ≈ km).',
          'order-line':   'ASC = cửa hàng gần nhất lên đầu.'
        }
      },

      step_4: {
        prompt: 'Viết query đếm <strong>số cửa hàng theo từng zone</strong> trong TP.HCM, chỉ cửa hàng <strong>trong bán kính 10km</strong> từ trung tâm. GROUP BY zone, sắp xếp giảm dần.',
        starter: "-- Đếm cửa hàng theo zone (TP.HCM, bán kính 10km từ trung tâm)\n-- ST_DWithin + GROUP BY zone + ORDER BY count DESC\nSELECT , COUNT(*) AS \n  FROM shop_branches\n WHERE city = 'TP.HCM'\n   AND ST_DWithin(geo_location, ST_MakePoint(, ), )\n GROUP BY \n ORDER BY  DESC;\n",
        schema: {
          table_name: 'shop_branches',
          columns: [
            { name: 'branch_id',    type: 'VARCHAR', key: 'PK', icon: '&#128273;' },
            { name: 'name',         type: 'VARCHAR', key: '',  icon: '' },
            { name: 'geo_location', type: 'POINT',   key: '',  icon: '&#128205;' },
            { name: 'city',         type: 'VARCHAR', key: '',  icon: '' },
            { name: 'zone',         type: 'VARCHAR', key: '',  icon: '' }
          ],
          data: [
            ['B01','Quận 1 Center',    '(106.7009, 10.7769)','TP.HCM','Downtown'],
            ['B02','District 7 Hub',   '(106.7369, 10.7288)','TP.HCM','South'],
            ['B03','Hanoi Old Quarter','(105.8542, 21.0285)','Hà Nội','Old City'],
            ['B04','District 3 Store', '(106.6872, 10.7822)','TP.HCM','Downtown'],
            ['B05','Bình Thạnh Store', '(106.7200, 10.8034)','TP.HCM','North'],
            ['B06','Thủ Đức Hub',      '(106.7800, 10.8782)','TP.HCM','East'],
            ['B07','District 10 Store', '(106.6780, 10.7792)','TP.HCM','Downtown'],
            ['B08','District 5 Store',  '(106.6500, 10.7500)','TP.HCM','West']
          ]
        },
        expected_sql: "SELECT zone, COUNT(*) AS branch_count FROM shop_branches WHERE city = 'TP.HCM' AND ST_DWithin(geo_location, ST_MakePoint(106.7009, 10.7769), 10) GROUP BY zone ORDER BY branch_count DESC;",
        hints: [
          { level: 1, text: "Bạn cần <em>kết hợp spatial filter + aggregation</em>. Lọc TP.HCM → lọc bán kính 10km quanh trung tâm → nhóm theo zone → đếm → sắp xếp. Hãy nghĩ: filter trước (WHERE), aggregate sau (GROUP BY)." },
          { level: 2, text: "<code>WHERE city = 'TP.HCM'</code> — lọc TP.HCM trước." },
          { level: 3, text: "<code>AND ST_DWithin(geo_location, ST_MakePoint(106.7009, 10.7769), 10)</code> — lọc bán kính 10km." },
          { level: 4, text: "<code>GROUP BY zone ORDER BY branch_count DESC</code> — zone nào nhiều cửa hàng nhất lên đầu." }
        ],
        success_message: 'Spatial + GROUP BY = phân tích vùng phủ cửa hàng cực kỳ hiệu quả! ST_DWithin + GiST index = O(log n).',
        xp_reward: 60
      }
    },

    {
      id: 'db_16', index: 16,
      title: 'ORM với Django — Ánh xạ Class ↔ Table',
      subtitle: 'Từ Python class đến SQL query tự động',
      module: 3, module_title: 'Application Design',
      icon: '&#9881;', color: '#F59E0B',
      estimated_minutes: 18, xp_reward: 60,
      drag_type: 'order',
      challenge_type: 'full_ide',

      step_1: {
        primer: {
          goal: [
            'ORM = ánh xạ class Python ↔ bảng SQL, viết query = gọi method',
            'select_related() = INNER JOIN tự động qua FK (1:1 / N:1)',
            'filter / order_by / values / annotate = WHERE / ORDER BY / GROUP BY'
          ],
          intro: 'Django tự tạo bảng <code class="code">log_events</code> từ class <code class="code">LogEvent</code>. Thay vì viết SQL, bạn gọi <code class="code">LogEvent.objects.filter(event_type=\'login\')</code>. ORM chuyển thành SQL: <code class="code">SELECT * FROM log_events WHERE event_type = \'login\'</code>. Không SQL thuần? Không sao — nhưng hiểu SQL giúp viết ORM tốt hơn.',
          example: '<code class="code">LogEvent.objects.filter(user__user_id=\'U01\', event_type=\'login\').select_related(\'user\').order_by(\'-timestamp\')[:10]</code> tương đương: <code>SELECT ... FROM log_events le JOIN app_users u ON ... WHERE user_id=\'U01\' AND event_type=\'login\' ORDER BY timestamp DESC LIMIT 10</code>'
        },
        concept_cards: [{"icon": "fa-layer-group", "title": "ORM (Object-Relational Mapping)", "body": "Map table → class, row → object, column → attribute. Django ORM: <code>User.objects.filter(role=\"admin\")</code> thay vì <code>SELECT * FROM users WHERE role=\"admin\"</code>."}, {"icon": "fa-bolt", "title": "ORM ưu/nhược", "body": "<strong>Ưu</strong>: ít SQL, type-safe, auto migration. <strong>Nhược</strong>: N+1 query, raw SQL phức tạp. Dùng <code>select_related</code> + <code>prefetch_related</code> để tránh N+1."}],
                visual: {
          
          diagram: {"type": "nf", "before": {"title": "TRƯỚC — 1 bảng tổng (BAD)", "columns": ["user_id", "username", "post_id", "post_text", "game_name", "genre"], "rows": [["U1", "alice", "P1", "My first post", "Elden Ring", "RPG"], ["U1", "alice", "P1", "My first post", "Elden Ring", "Action"], ["U2", "bob", "P2", "Check this", "Hades", "Rogue"]], "violations": {"0-5": true, "0-4": true, "1-5": true, "1-4": true}}, "after": {"title": "SAU — 5 bảng + 2 junction", "columns": ["user_id", "post_id", "game_id", "genre_id", "platform_id"], "rows": [["U1", "P1", "G1", "G_RPG", "PC"], ["U1", "P1", "G1", "G_Act", "PC"], ["U2", "P2", "G2", "G_Rog", "PS5"]]}, "note": "7 bảng: users, posts, games, genres, platforms + post_game (junction), post_genre (junction)."},
          
          diagram: {"type": "flow", "steps": [{"icon": "fa-user", "title": "Web App / Form", "sub": "User thay đổi setting (theme: dark)", "payload": "POST /api/settings"}, {"icon": "fa-code", "title": "Python / Django ORM", "sub": "Validate + serialize sang JSONB", "payload": "settings = {'theme': 'dark'}"}, {"icon": "fa-server", "title": "PostgreSQL", "sub": "Lưu JSONB vào cột settings", "payload": "INSERT INTO app_users (..., settings) VALUES (...)"}, {"icon": "fa-arrow-rotate-left", "title": "ORM → Python dict", "sub": "Đọc lại: settings->>theme = \"dark\"", "payload": "SELECT settings->>'theme' FROM app_users"}, {"icon": "fa-display", "title": "HTML Response", "sub": "Render UI với theme mới", "payload": "<html data-theme=\"dark\">"}]},
          
          diagram: {"type": "flow", "steps": [{"icon": "fa-map-pin", "title": "User location", "sub": "Browser geolocation API", "payload": "(106.7, 10.78)"}, {"icon": "fa-mobile", "title": "Mobile App", "sub": "POST /api/nearest?lat=10.78&lon=106.7", "payload": "GET /nearest"}, {"icon": "fa-code", "title": "Django + GeoDjango", "sub": "Build query PostGIS", "payload": "ST_DWithin(geo, point, 5000)"}, {"icon": "fa-server", "title": "PostgreSQL + PostGIS", "sub": "Spatial index (GIST)", "payload": "shop_branches WHERE ST_DWithin(...)"}, {"icon": "fa-list", "title": "Sorted by distance", "sub": "ST_Distance ORDER BY", "payload": "ORDER BY dist ASC LIMIT 5"}]},
          
          diagram: {"type": "flow", "steps": [{"icon": "fa-code", "title": "Python code (ORM)", "sub": "LogEvent.objects.filter(...)", "payload": "Event.objects.all()[:20]"}, {"icon": "fa-cogs", "title": "Django ORM Layer", "sub": "Build SQL từ queryset", "payload": "SELECT * FROM log_events LIMIT 20"}, {"icon": "fa-server", "title": "PostgreSQL", "sub": "Execute SQL", "payload": "20 rows"}, {"icon": "fa-arrow-rotate-left", "title": "ORM → Python list", "sub": "Map row → LogEvent object", "payload": "events = [LogEvent(...), ...]"}, {"icon": "fa-display", "title": "Template render", "sub": "events truyền vào template", "payload": "{% for e in events %}"}]},
          schema: {
            table_name: 'log_events',
            columns: [
              { name: 'event_id',    type: 'INT',       key: 'PK', icon: '&#128273;' },
              { name: 'user_id',     type: 'INT',       key: 'FK', icon: '&#128279;' },
              { name: 'event_type',  type: 'VARCHAR',   key: '',   icon: '' },
              { name: 'event_data',  type: 'JSONB',     key: '',   icon: '&#123;...&#125;' },
              { name: 'timestamp',   type: 'TIMESTAMP', key: '',   icon: '' }
            ]
          },
          data_preview: [
            ['E01','U01','login',   '{"ip":"1.1.1.1"}',   '2026-01-10 08:00:00'],
            ['E02','U02','logout',  '{"session":"sess_abc"}','2026-01-10 09:30:00'],
            ['E03','U01','purchase','{"amount":500000}',  '2026-01-10 10:00:00'],
            ['E04','U01','login',   '{"ip":"1.1.1.2"}',   '2026-01-11 08:05:00']
          ]
        },
        mission: 'Viết Django ORM query tương đương SQL. Kéo thả khối lệnh ↓'
      },

      step_2: {
        mcq: [
          {
            question: '<code>LogEvent.objects.select_related(\'user\')</code> sinh ra loại JOIN nào?',
            options: [
              { id: 'a', text: 'LEFT JOIN — lấy cả event không có user', correct: false },
              { id: 'b', text: 'INNER JOIN — chỉ lấy event có user tồn tại', correct: true },
              { id: 'c', text: 'OUTER JOIN — lấy tất cả kể cả user NULL', correct: false },
              { id: 'd', text: 'CROSS JOIN — tổ hợp mọi cặp (hiếm dùng)', correct: false }
            ]
          },
          {
            question: 'Django ORM nào tương đương <code>GROUP BY event_type ORDER BY COUNT(*) DESC</code>?',
            options: [
              { id: 'a', text: "<code>.values('event_type').order_by('event_type')</code>", correct: false },
              { id: 'b', text: "<code>.values('event_type').annotate(cnt=Count('id')).order_by('-cnt')</code>", correct: true },
              { id: 'c', text: "<code>.filter().group_by('event_type')</code>", correct: false },
              { id: 'd', text: "<code>.aggregate(Count('event_type'))</code> — sai, aggregate chỉ trả 1 dòng", correct: false }
            ]
          }
        ],
        mini_game: {"type": "order", "title": "Thứ tự ORM query (Django)", "instruction": "Sắp xếp theo thứ tự Django thực thi.", "items": [{"id": "i1", "label": "1. .filter(user__role=\"admin\")"}, {"id": "i2", "label": "2. .select_related(\"user\")"}, {"id": "i3", "label": "3. .order_by(\"-created_at\")"}, {"id": "i4", "label": "4. [:20] (slice)"}], "solution": {"i1": 1, "i2": 2, "i3": 3, "i4": 4}}
      },

      step_3: {
        blocks: [
          { type: 'tbl', token: 'LogEvent',           slot: 'tbl-name' },
          { type: 'op',  token: '.objects',            slot: 'op-obj' },
          { type: 'kw',  token: '.filter',             slot: 'kw-filter' },
          { type: 'op',  token: "(user__user_id='U01', event_type='login')", slot: 'op-args' },
          { type: 'kw',  token: '.select_related',      slot: 'kw-selrel' },
          { type: 'op',  token: "('user')",             slot: 'op-relarg' },
          { type: 'kw',  token: '.order_by',            slot: 'kw-order' },
          { type: 'op',  token: "('-timestamp')",       slot: 'op-orderarg' },
          { type: 'kw',  token: '[:10]',                slot: 'op-limit' }
        ],
        drop_zones: [
          { id: 'setup-zone',  placeholder: 'LogEvent.objects',                                       accepts: ['tbl','op'],  multi: true },
          { id: 'chain-zone',  placeholder: ".filter(user__user_id='U01', event_type='login').select_related('user').order_by('-timestamp')", accepts: ['kw','op'], multi: true },
          { id: 'slice-zone',  placeholder: '[:10]',                                                  accepts: ['kw'],      multi: false }
        ],
        expected_sql: "LogEvent.objects.filter(user__user_id='U01', event_type='login').select_related('user').order_by('-timestamp')[:10]",
        reveal_hints: {
          'setup-zone': '<strong>Setup:</strong> <code>LogEvent</code> = Django model class, <code>.objects</code> = manager trả về QuerySet.',
          'chain-zone': '<strong>Chain methods:</strong> <code>.filter(...)</code> = WHERE, <code>.select_related(\'user\')</code> = INNER JOIN, <code>.order_by(\'-timestamp\')</code> = ORDER BY DESC.',
          'slice-zone': '<strong>Slice:</strong> <code>[:10]</code> = LIMIT 10 (Python list slice syntax cho QuerySet).'
        }
      },

      step_4: {
        prompt: 'Viết Django ORM query đếm <strong>số events theo từng event_type</strong> cho user U01. Dùng <code>values(\'event_type\').annotate(count=Count(\'event_id\')).order_by(\'-count\')</code>. Hoặc viết SQL tương đương.',
        starter: "-- Đếm events theo event_type cho user U01\n-- WHERE user_id = 'U01' + GROUP BY event_type + ORDER BY count DESC\nSELECT , COUNT() AS \n  FROM log_events\n WHERE  = \n GROUP BY \n ORDER BY  DESC;\n",
        schema: {
          table_name: 'log_events',
          columns: [
            { name: 'event_id',   type: 'INT',       key: 'PK', icon: '&#128273;' },
            { name: 'user_id',    type: 'INT',       key: 'FK', icon: '&#128279;' },
            { name: 'event_type', type: 'VARCHAR',   key: '',   icon: '' },
            { name: 'timestamp',   type: 'TIMESTAMP', key: '',   icon: '' }
          ],
          data: [
            ['E01','U01','login',   '2026-01-10'],
            ['E02','U01','purchase','2026-01-10'],
            ['E03','U01','login',   '2026-01-11'],
            ['E04','U01','login',   '2026-01-12'],
            ['E05','U01','logout',  '2026-01-12'],
            ['E06','U02','login',   '2026-01-10']
          ]
        },
        expected_sql: "SELECT event_type, COUNT(event_id) AS event_count FROM log_events WHERE user_id = 'U01' GROUP BY event_type ORDER BY event_count DESC;",
        hints: [
          { level: 1, text: "Bạn muốn <em>đếm sự kiện theo loại</em> cho 1 user cụ thể. Hãy nghĩ: filter user trước, GROUP BY loại event, COUNT, ORDER BY giảm dần." },
          { level: 2, text: "<code>WHERE user_id = 'U01'</code> — lọc events của user U01." },
          { level: 3, text: "<code>GROUP BY event_type</code> — nhóm theo loại event." },
          { level: 4, text: "<code>ORDER BY event_count DESC</code> — event nào nhiều nhất lên đầu." }
        ],
        success_message: 'values().annotate() = GROUP BY trong SQL. ORM và SQL luôn tương đương — hiểu SQL giúp bạn viết ORM tốt hơn!',
        xp_reward: 60
      }
    },

    {
      id: 'db_17', index: 17,
      title: 'SQL Injection — Lỗ hổng chết người',
      subtitle: 'Tấn công bằng input độc hại và phòng chống',
      module: 3, module_title: 'Application Design',
      icon: '&#128128;', color: '#EF4444',
      estimated_minutes: 18, xp_reward: 60,
      drag_type: 'bug_spot',
      challenge_type: 'full_ide',

      step_1: {
        primer: {
          goal: [
            'SQL Injection = chèn SQL code vào input để thay đổi logic query',
            "Payload kinh điển: ' OR '1'='1' -- biến WHERE thành always-true",
            'Phòng chống: Prepared Statement (%s placeholder) — input không bao giờ chạy như code'
          ],
          intro: "Login form dùng <strong>string concatenation</strong>: <code>f\"SELECT * FROM user_accounts WHERE username = '{input}' AND password = '{pw}'\"</code>. Attacker nhập <code>' OR '1'='1' --</code> vào username. Query trở thành <code>SELECT * FROM user_accounts WHERE username = '' OR '1'='1' --' AND ...</code> → trả về <strong>TẤT CẢ user</strong> — đăng nhập không cần password!",
          example: "<code>' OR '1'='1' --</code> đóng chuỗi ('), thêm điều kiện luôn đúng ('1'='1'), comment out phần còn lại (--). Prepared Statement ngăn điều này: <code>WHERE username = %s</code> — giá trị được gửi riêng, không chạy như SQL."
        },
        concept_cards: [{"icon": "fa-skull-crossbones", "title": "SQL Injection", "body": "Attacker chèn SQL code vào input để thay đổi logic query. Kinh điển: <code>' OR '1'='1' --</code> đóng chuỗi, thêm điều kiện always-true, comment phần sau."}, {"icon": "fa-shield-virus", "title": "Prepared Statement", "body": "Phòng chống: <code>WHERE username = %s</code> + params gửi riêng. Input KHÔNG BAO GIỜ chạy như SQL — DB engine biết đó là literal, escape tự động."}],
                visual: {
          
          diagram: {"type": "nf", "before": {"title": "TRƯỚC — 1 bảng tổng (BAD)", "columns": ["user_id", "username", "post_id", "post_text", "game_name", "genre"], "rows": [["U1", "alice", "P1", "My first post", "Elden Ring", "RPG"], ["U1", "alice", "P1", "My first post", "Elden Ring", "Action"], ["U2", "bob", "P2", "Check this", "Hades", "Rogue"]], "violations": {"0-5": true, "0-4": true, "1-5": true, "1-4": true}}, "after": {"title": "SAU — 5 bảng + 2 junction", "columns": ["user_id", "post_id", "game_id", "genre_id", "platform_id"], "rows": [["U1", "P1", "G1", "G_RPG", "PC"], ["U1", "P1", "G1", "G_Act", "PC"], ["U2", "P2", "G2", "G_Rog", "PS5"]]}, "note": "7 bảng: users, posts, games, genres, platforms + post_game (junction), post_genre (junction)."},
          
          diagram: {"type": "flow", "steps": [{"icon": "fa-user", "title": "Web App / Form", "sub": "User thay đổi setting (theme: dark)", "payload": "POST /api/settings"}, {"icon": "fa-code", "title": "Python / Django ORM", "sub": "Validate + serialize sang JSONB", "payload": "settings = {'theme': 'dark'}"}, {"icon": "fa-server", "title": "PostgreSQL", "sub": "Lưu JSONB vào cột settings", "payload": "INSERT INTO app_users (..., settings) VALUES (...)"}, {"icon": "fa-arrow-rotate-left", "title": "ORM → Python dict", "sub": "Đọc lại: settings->>theme = \"dark\"", "payload": "SELECT settings->>'theme' FROM app_users"}, {"icon": "fa-display", "title": "HTML Response", "sub": "Render UI với theme mới", "payload": "<html data-theme=\"dark\">"}]},
          
          diagram: {"type": "flow", "steps": [{"icon": "fa-map-pin", "title": "User location", "sub": "Browser geolocation API", "payload": "(106.7, 10.78)"}, {"icon": "fa-mobile", "title": "Mobile App", "sub": "POST /api/nearest?lat=10.78&lon=106.7", "payload": "GET /nearest"}, {"icon": "fa-code", "title": "Django + GeoDjango", "sub": "Build query PostGIS", "payload": "ST_DWithin(geo, point, 5000)"}, {"icon": "fa-server", "title": "PostgreSQL + PostGIS", "sub": "Spatial index (GIST)", "payload": "shop_branches WHERE ST_DWithin(...)"}, {"icon": "fa-list", "title": "Sorted by distance", "sub": "ST_Distance ORDER BY", "payload": "ORDER BY dist ASC LIMIT 5"}]},
          
          diagram: {"type": "flow", "steps": [{"icon": "fa-code", "title": "Python code (ORM)", "sub": "LogEvent.objects.filter(...)", "payload": "Event.objects.all()[:20]"}, {"icon": "fa-cogs", "title": "Django ORM Layer", "sub": "Build SQL từ queryset", "payload": "SELECT * FROM log_events LIMIT 20"}, {"icon": "fa-server", "title": "PostgreSQL", "sub": "Execute SQL", "payload": "20 rows"}, {"icon": "fa-arrow-rotate-left", "title": "ORM → Python list", "sub": "Map row → LogEvent object", "payload": "events = [LogEvent(...), ...]"}, {"icon": "fa-display", "title": "Template render", "sub": "events truyền vào template", "payload": "{% for e in events %}"}]},
          
          diagram: {"type": "flow", "steps": [{"icon": "fa-user-secret", "title": "Attacker input", "sub": "username = ' OR '1'='1' --", "payload": "MALICIOUS_PAYLOAD"}, {"icon": "fa-bug", "title": "App build SQL (NGUY HIỂM)", "sub": "f\"SELECT * FROM users WHERE name='{input}'\"", "payload": "VULNERABLE"}, {"icon": "fa-server", "title": "DB execute", "sub": "Trả về TẤT CẢ users (không cần password!)", "payload": "ALL_ROWS_RETURNED"}, {"icon": "fa-shield-halved", "title": "FIX: Prepared Statement", "sub": "WHERE username = %s + params", "payload": "SAFE"}, {"icon": "fa-check", "title": "DB execute (SAFE)", "sub": "Input là literal, escape tự động", "payload": "NORMAL_QUERY"}]},
          schema: {
            table_name: 'user_accounts',
            columns: [
              { name: 'user_id',       type: 'VARCHAR', key: 'PK', icon: '&#128273;' },
              { name: 'username',      type: 'VARCHAR', key: '',  icon: '' },
              { name: 'password_hash', type: 'VARCHAR', key: '',  icon: '&#128272;' },
              { name: 'email',         type: 'VARCHAR', key: '',  icon: '' },
              { name: 'role',          type: 'VARCHAR', key: '',  icon: '' }
            ]
          },
          data_preview: [
            ['U01','minh_admin', 'hashed_abc', 'minh@x.com','admin'],
            ['U02','yuki_user',  'hashed_xyz', 'yuki@x.com','user'],
            ['U03','sara_mod',   'hashed_123', 'sara@x.com','moderator'],
            ['U04','alex_guest', 'hashed_456', 'alex@x.com','guest']
          ]
        },
        mission: 'Phân rã <strong>query bị SQL Injection</strong>. Kéo thả khối để xem query thực sự chạy gì ↓'
      },

      step_2: {
        mcq: [
          {
            question: 'Input nào là <strong>SQL Injection</strong> trong trường username?',
            options: [
              { id: 'a', text: '<code>minh_admin</code> — username hợp lệ', correct: false },
              { id: 'b', text: "<code>' OR '1'='1' --</code> — đóng chuỗi, thêm điều kiện đúng, comment out", correct: true },
              { id: 'c', text: "<code>minh' --</code> — chỉ comment out phần sau, vẫn cần password đúng", correct: false },
              { id: 'd', text: '<code>minh_admin; DROP TABLE users;</code> — chỉ là chuỗi dài, không phải injection nếu escape đúng', correct: false }
            ]
          },
          {
            question: 'Cách nào phòng chống SQL Injection hiệu quả nhất?',
            options: [
              { id: 'a', text: "<code>f\"WHERE username = '{input}'\"</code> — dùng f-string", correct: false },
              { id: 'b', text: "<code>WHERE username = %s</code> — Prepared Statement (parameterized query)", correct: true },
              { id: 'c', text: "<code>WHERE username = input.replace(\"'\", \"''\")</code> — escape thủ công", correct: false },
              { id: 'd', text: 'Thêm CAPTCHA — chỉ giảm bot, không ngăn SQLi', correct: false }
            ]
          }
        ],
        mini_game: {"type": "bug_spot", "title": "Tìm lỗi SQL Injection", "instruction": "Click vào DÒNG có lỗ hổng SQL Injection. (Dòng build query bằng f-string).", "code": "def login(username, password):\n    query = f\"SELECT * FROM users WHERE name='{username}' AND pass='{password}'\"\n    cursor.execute(query)\n    return cursor.fetchone()\n\ndef safe_login(username, password):\n    cursor.execute(\"SELECT * FROM users WHERE name=%s AND pass=%s\", (username, password))\n    return cursor.fetchone()", "bugType": "security", "bugs": [{"line": 2, "description": "Dùng f-string nội suy user input trực tiếp vào SQL — cho phép SQL Injection. Fix: dùng %s placeholder."}], "xp": 25}
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',          slot: 'kw-select' },
          { type: 'op',  token: '*',                slot: 'op-star' },
          { type: 'kw',  token: 'FROM',             slot: 'kw-from' },
          { type: 'tbl', token: 'user_accounts',    slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',            slot: 'kw-where' },
          { type: 'col', token: 'username',         slot: 'col-user' },
          { type: 'op',  token: "= '' OR '1'='1'", slot: 'op-inject' },
          { type: 'kw',  token: '--',               slot: 'op-comment' },
          { type: 'op',  token: " AND password_hash = '_ignored'", slot: 'op-ignore' }
        ],
        drop_zones: [
          { id: 'select-zone',   placeholder: "SELECT * FROM user_accounts WHERE username = ''",         accepts: ['kw','op','tbl','col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'inject-zone',   placeholder: "OR '1'='1' --' AND password_hash = '_ignored'",         accepts: ['kw','op'], acceptedKeywords: ['--', 'OR', '1=1'], multi: true }
        ],
        expected_sql: "SELECT * FROM user_accounts WHERE username = '' OR '1'='1' --' AND password_hash = 'hashed_pw_abc'",
        reveal_hints: {
          'select-zone': '<strong>Query ban đầu:</strong> SELECT * FROM user_accounts WHERE username = \'\'',
          'inject-zone': '<strong>Phần inject:</strong> <code>OR \'1\'=\'1\'</code> thêm điều kiện luôn đúng. <code>--</code> comment out phần password. Query cuối = <code>SELECT * FROM user_accounts</code> — trả TẤT CẢ!'
        }
      },

      step_4: {
        prompt: 'Viết lại login query bằng <strong>Prepared Statement</strong> với <code>%s</code> placeholder. Sau đó viết query đếm <strong>số user theo role</strong> (aggregation an toàn, không có input).',
        starter: "-- Query 1: Login an toàn (Prepared Statement)\n-- WHERE username = %s AND password_hash = %s\n\n-- Query 2: Đếm user theo role\n-- SELECT role, COUNT(*) ... GROUP BY role ORDER BY count DESC\nSELECT , COUNT() AS \n  FROM user_accounts\n GROUP BY \n ORDER BY  DESC;\n",
        schema: {
          table_name: 'user_accounts',
          columns: [
            { name: 'user_id',  type: 'VARCHAR', key: 'PK', icon: '&#128273;' },
            { name: 'username', type: 'VARCHAR', key: '',  icon: '' },
            { name: 'email',    type: 'VARCHAR', key: '',  icon: '' },
            { name: 'role',     type: 'VARCHAR', key: '',  icon: '' }
          ],
          data: [
            ['U01','minh_admin','minh@x.com','admin'],
            ['U02','yuki_user', 'yuki@x.com','user'],
            ['U03','sara_mod',  'sara@x.com','moderator'],
            ['U04','alex_guest','alex@x.com','guest'],
            ['U05','lisa_user', 'lisa@x.com','user'],
            ['U06','ken_mod',   'ken@x.com', 'moderator'],
            ['U07','jen_guest', 'jen@x.com', 'guest'],
            ['U08','bob_user',  'bob@x.com', 'user']
          ]
        },
        expected_sql: "SELECT role, COUNT(user_id) AS user_count FROM user_accounts GROUP BY role ORDER BY user_count DESC;",
        hints: [
          { level: 1, text: "Bạn cần <em>phòng chống SQL Injection</em> (Prepared Statement) + <em>đếm user theo role</em> (aggregation). Hãy nghĩ: <code>%s</code> placeholder cho input, GROUP BY role cho aggregation." },
          { level: 2, text: "Prepared Statement: <code>WHERE username = %s AND password_hash = %s</code> — params gửi riêng." },
          { level: 3, text: "<code>SELECT role, COUNT(user_id) AS user_count</code> — đếm theo role." },
          { level: 4, text: "<code>GROUP BY role ORDER BY user_count DESC</code> — role nào nhiều user nhất lên đầu." }
        ],
        success_message: 'Prepared Statement là lá chắn! Input luôn là literal, không bao giờ chạy như SQL. Bài 18 sẽ học cách lưu password đúng cách.',
        xp_reward: 60
      }
    },

    {
      id: 'db_18', index: 18,
      title: 'Password Security — Salt & Hashing',
      subtitle: 'Từ plain text đến bcrypt — chọn thuật toán nào?',
      module: 3, module_title: 'Application Design',
      icon: '&#128272;', color: '#6366F1',
      estimated_minutes: 18, xp_reward: 70,
      drag_type: 'classify',
      challenge_type: 'full_ide',

      step_1: {
        primer: {
          goal: [
            'Không lưu plain text — hash password để attacker không đọc được',
            'md5/sha1 quá yếu: GPU tính hàng tỷ hash/giây + rainbow table attack',
            'bcrypt/scrypt = recommended: có salt tự động, cost factor chỉnh được'
          ],
          intro: 'Bảng <code class="code">security_users_vault</code> lưu <code>password_hash</code> và <code>salt</code> riêng biệt. <strong>Salt</strong> = chuỗi ngẫu nhiên gắn vào password trước khi hash → cùng password của 2 user sẽ có hash khác nhau. md5("pass") → rainbow table tra được ngay. bcrypt("pass") → cần brute force với cost factor cao → mất nhiều năm.',
          example: 'md5 hash bắt đầu bằng chuỗi hex 32 ký tự (5f4dcc3b5aa...). bcrypt hash bắt đầu bằng <code>$2a$</code> hoặc <code>$2b$</code>. Nhìn format là biết thuật toán — và biết cần migrate ngay!'
        },
        concept_cards: [{"icon": "fa-lock", "title": "Password Hashing", "body": "KHÔNG lưu plain text password. Hash = hàm 1 chiều, biết hash không suy ngược ra password. <code>bcrypt</code>, <code>argon2</code> là recommended."}, {"icon": "fa-key", "title": "Salt — chống rainbow table", "body": "<strong>Salt</strong> = chuỗi ngẫu nhiên gắn vào password trước khi hash. Cùng password → hash khác nhau (do salt khác). <strong>md5/sha1</strong> quá yếu + không có salt → bị crack trong vài giây."}],
                visual: {
          
          diagram: {"type": "nf", "before": {"title": "TRƯỚC — 1 bảng tổng (BAD)", "columns": ["user_id", "username", "post_id", "post_text", "game_name", "genre"], "rows": [["U1", "alice", "P1", "My first post", "Elden Ring", "RPG"], ["U1", "alice", "P1", "My first post", "Elden Ring", "Action"], ["U2", "bob", "P2", "Check this", "Hades", "Rogue"]], "violations": {"0-5": true, "0-4": true, "1-5": true, "1-4": true}}, "after": {"title": "SAU — 5 bảng + 2 junction", "columns": ["user_id", "post_id", "game_id", "genre_id", "platform_id"], "rows": [["U1", "P1", "G1", "G_RPG", "PC"], ["U1", "P1", "G1", "G_Act", "PC"], ["U2", "P2", "G2", "G_Rog", "PS5"]]}, "note": "7 bảng: users, posts, games, genres, platforms + post_game (junction), post_genre (junction)."},
          
          diagram: {"type": "flow", "steps": [{"icon": "fa-user", "title": "Web App / Form", "sub": "User thay đổi setting (theme: dark)", "payload": "POST /api/settings"}, {"icon": "fa-code", "title": "Python / Django ORM", "sub": "Validate + serialize sang JSONB", "payload": "settings = {'theme': 'dark'}"}, {"icon": "fa-server", "title": "PostgreSQL", "sub": "Lưu JSONB vào cột settings", "payload": "INSERT INTO app_users (..., settings) VALUES (...)"}, {"icon": "fa-arrow-rotate-left", "title": "ORM → Python dict", "sub": "Đọc lại: settings->>theme = \"dark\"", "payload": "SELECT settings->>'theme' FROM app_users"}, {"icon": "fa-display", "title": "HTML Response", "sub": "Render UI với theme mới", "payload": "<html data-theme=\"dark\">"}]},
          
          diagram: {"type": "flow", "steps": [{"icon": "fa-map-pin", "title": "User location", "sub": "Browser geolocation API", "payload": "(106.7, 10.78)"}, {"icon": "fa-mobile", "title": "Mobile App", "sub": "POST /api/nearest?lat=10.78&lon=106.7", "payload": "GET /nearest"}, {"icon": "fa-code", "title": "Django + GeoDjango", "sub": "Build query PostGIS", "payload": "ST_DWithin(geo, point, 5000)"}, {"icon": "fa-server", "title": "PostgreSQL + PostGIS", "sub": "Spatial index (GIST)", "payload": "shop_branches WHERE ST_DWithin(...)"}, {"icon": "fa-list", "title": "Sorted by distance", "sub": "ST_Distance ORDER BY", "payload": "ORDER BY dist ASC LIMIT 5"}]},
          
          diagram: {"type": "flow", "steps": [{"icon": "fa-code", "title": "Python code (ORM)", "sub": "LogEvent.objects.filter(...)", "payload": "Event.objects.all()[:20]"}, {"icon": "fa-cogs", "title": "Django ORM Layer", "sub": "Build SQL từ queryset", "payload": "SELECT * FROM log_events LIMIT 20"}, {"icon": "fa-server", "title": "PostgreSQL", "sub": "Execute SQL", "payload": "20 rows"}, {"icon": "fa-arrow-rotate-left", "title": "ORM → Python list", "sub": "Map row → LogEvent object", "payload": "events = [LogEvent(...), ...]"}, {"icon": "fa-display", "title": "Template render", "sub": "events truyền vào template", "payload": "{% for e in events %}"}]},
          
          diagram: {"type": "flow", "steps": [{"icon": "fa-user-secret", "title": "Attacker input", "sub": "username = ' OR '1'='1' --", "payload": "MALICIOUS_PAYLOAD"}, {"icon": "fa-bug", "title": "App build SQL (NGUY HIỂM)", "sub": "f\"SELECT * FROM users WHERE name='{input}'\"", "payload": "VULNERABLE"}, {"icon": "fa-server", "title": "DB execute", "sub": "Trả về TẤT CẢ users (không cần password!)", "payload": "ALL_ROWS_RETURNED"}, {"icon": "fa-shield-halved", "title": "FIX: Prepared Statement", "sub": "WHERE username = %s + params", "payload": "SAFE"}, {"icon": "fa-check", "title": "DB execute (SAFE)", "sub": "Input là literal, escape tự động", "payload": "NORMAL_QUERY"}]},
          
          diagram: {"type": "flow", "steps": [{"icon": "fa-keyboard", "title": "User nhập password", "sub": "\"hunter2\" (plain text)", "payload": "hunter2"}, {"icon": "fa-plus", "title": "Server append salt", "sub": "salt = random 16 bytes", "payload": "hunter2 + \"rand_abc\""}, {"icon": "fa-cogs", "title": "bcrypt.hashpw (cost 12)", "sub": "Hash 2^12 lần SHA256 + bcrypt", "payload": "$2a$12$..."}, {"icon": "fa-database", "title": "Lưu vào DB", "sub": "password_hash + salt (2 cột)", "payload": "INSERT INTO security_users_vault"}, {"icon": "fa-shield-check", "title": "Verify: bcrypt.checkpw", "sub": "So sánh hash với input mới", "payload": "True / False"}]},
          schema: {
            table_name: 'security_users_vault',
            columns: [
              { name: 'user_id',        type: 'VARCHAR', key: 'PK', icon: '&#128273;' },
              { name: 'username',        type: 'VARCHAR', key: '',  icon: '' },
              { name: 'password_hash',  type: 'VARCHAR', key: '',  icon: '&#128272;' },
              { name: 'salt',           type: 'VARCHAR', key: '',  icon: '&#129517;' },
              { name: 'hash_algorithm', type: 'VARCHAR', key: '',  icon: '&#9881;' }
            ]
          },
          data_preview: [
            ['U01','minh_dev', '5f4dcc3b5aa765d61d8327deb882cf99','rand_abc','md5'],
            ['U02','yuki_dev', 'e10adc3949ba59abbe56e057f20f883e','rand_xyz','md5'],
            ['U03','sara_dev', '$2a$12$KIX...Y8Y8Y8Y8Y8Y8Y8Y8Y8','rand_123','bcrypt'],
            ['U04','alex_dev', '$2b$12$vPZ...XzZxKIX...','rand_456','bcrypt']
          ]
        },
        mission: 'Viết query phân loại <strong>mức độ bảo mật</strong> theo thuật toán. Kéo thả khối lệnh ↓'
      },

      step_2: {
        mcq: [
          {
            question: 'Thuật toán nào <strong>KHÔNG nên dùng</strong> để lưu password?',
            options: [
              { id: 'a', text: 'md5 — quá nhanh + không có salt → rainbow table attack', correct: true },
              { id: 'b', text: 'bcrypt — cost factor chỉnh được, salt tự động', correct: false },
              { id: 'c', text: 'argon2 — winner của Password Hashing Competition 2015', correct: false },
              { id: 'd', text: 'plain text — lưu nguyên password, không hash', correct: true }
            ]
          },
          {
            question: 'Salt trong password hashing có tác dụng gì?',
            options: [
              { id: 'a', text: 'Mã hóa password để không ai đọc được', correct: false },
              { id: 'b', text: 'Chống rainbow table attack — cùng password sẽ có hash khác nhau', correct: true },
              { id: 'c', text: 'Làm hash ngắn hơn để tiết kiệm storage', correct: false },
              { id: 'd', text: 'Thay thế cho bcrypt — không cần thuật toán mạnh', correct: false }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Phân loại: thuật toán hash nào AN TOÀN?',
          instruction: 'Mỗi thẻ là một hash algorithm. Kéo vào ô <strong style="color:var(--success)">AN TOÀN</strong> (recommended) hoặc <strong style="color:var(--danger)">KHÔNG AN TOÀN</strong> (lỗi thời, có thể crack).',
          chips: [
            { id: 'h-md5',    label: 'md5 (32 hex chars)' },
            { id: 'h-sha1',   label: 'sha1 (40 hex chars)' },
            { id: 'h-sha256', label: 'sha256 (64 hex chars, no salt)' },
            { id: 'h-bcrypt', label: 'bcrypt ($2a$ / $2b$ prefix)' },
            { id: 'h-argon2', label: 'argon2 (PHC winner 2015)' },
            { id: 'h-scrypt', label: 'scrypt (memory-hard)' },
            { id: 'h-plain',  label: 'plain text password' }
          ],
          bins: [
            { id: 'safe',   label: 'AN TOÀN (recommended)', correct: 'safe' },
            { id: 'unsafe', label: 'KHÔNG AN TOÀN (cần migrate)', correct: 'unsafe' }
          ],
          solution: {
            'h-md5':    'unsafe',
            'h-sha1':   'unsafe',
            'h-sha256': 'unsafe',
            'h-bcrypt': 'safe',
            'h-argon2': 'safe',
            'h-scrypt': 'safe',
            'h-plain':  'unsafe'
          }
        }
      },

      step_3: {
        blocks: [
          { type: 'kw',  token: 'SELECT',          slot: 'kw-select' },
          { type: 'col', token: 'username',         slot: 'col-1' },
          { type: 'kw',  token: ',',                slot: 'op-comma1' },
          { type: 'col', token: 'hash_algorithm',   slot: 'col-2' },
          { type: 'kw',  token: 'FROM',             slot: 'kw-from' },
          { type: 'tbl', token: 'security_users_vault', slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',            slot: 'kw-where' },
          { type: 'col', token: 'hash_algorithm',   slot: 'col-filter' },
          { type: 'kw',  token: 'IN',               slot: 'kw-in' },
          { type: 'op',  token: "('bcrypt', 'argon2', 'scrypt')", slot: 'op-list' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: "SELECT username, hash_algorithm", accepts: ['kw','col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM security_users_vault',        accepts: ['kw','tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',  placeholder: "WHERE hash_algorithm IN ('bcrypt', 'argon2', 'scrypt')", accepts: ['kw','col','op'], acceptedKeywords: ['WHERE'], multi: true }
        ],
        expected_sql: "SELECT username, hash_algorithm FROM security_users_vault WHERE hash_algorithm IN ('bcrypt','argon2','scrypt');",
        reveal_hints: {
          'select-line':  'Chọn username và hash_algorithm để xem user nào dùng thuật toán nào.',
          'where-line':   "<code>IN ('bcrypt','argon2','scrypt')</code> — chỉ lấy thuật toán recommended. md5/sha1/sha256 không có trong danh sách."
        }
      },

      step_4: {
        prompt: "Viết query phân loại <strong>mức độ bảo mật</strong>: bcrypt/scrypt/argon2 = 'HIGH', sha256 = 'MEDIUM', md5/sha1 = 'LOW'. Dùng <code>CASE WHEN</code>. Đếm số user theo từng mức, sắp xếp giảm dần.",
        starter: "-- CASE WHEN phân loại security level\n-- HIGH (bcrypt/argon2/scrypt), MEDIUM (sha256), LOW (md5/sha1)\nSELECT CASE WHEN hash_algorithm IN ('bcrypt','argon2','scrypt') THEN ''\n            WHEN hash_algorithm = '' THEN ''\n            ELSE '' END AS security_level,\n       COUNT() AS \n  FROM security_users_vault\n GROUP BY security_level\n ORDER BY  DESC;\n",
        schema: {
          table_name: 'security_users_vault',
          columns: [
            { name: 'user_id',        type: 'VARCHAR', key: 'PK', icon: '&#128273;' },
            { name: 'username',        type: 'VARCHAR', key: '',  icon: '' },
            { name: 'hash_algorithm',  type: 'VARCHAR', key: '',  icon: '&#9881;' }
          ],
          data: [
            ['U01','minh_dev','md5'],
            ['U02','yuki_dev','bcrypt'],
            ['U03','sara_dev','sha1'],
            ['U04','alex_dev','argon2'],
            ['U05','lisa_dev','sha256'],
            ['U06','ken_dev', 'bcrypt'],
            ['U07','jen_dev', 'scrypt']
          ]
        },
        expected_sql: "SELECT CASE WHEN hash_algorithm IN ('bcrypt','argon2','scrypt') THEN 'HIGH' WHEN hash_algorithm = 'sha256' THEN 'MEDIUM' ELSE 'LOW' END AS security_level, COUNT(user_id) AS user_count FROM security_users_vault GROUP BY security_level ORDER BY user_count DESC;",
        hints: [
          { level: 1, text: "Bạn cần <em>phân loại security level</em> theo thuật toán, đếm user theo từng mức, sắp xếp giảm dần. Hãy nghĩ: <code>CASE WHEN</code> để gán nhãn, <code>GROUP BY</code> theo nhãn, <code>COUNT</code> + <code>ORDER BY</code>." },
          { level: 2, text: "<code>CASE WHEN hash_algorithm IN ('bcrypt','argon2','scrypt') THEN 'HIGH'</code> — recommended algorithms." },
          { level: 3, text: "<code>WHEN hash_algorithm = 'sha256' THEN 'MEDIUM' ELSE 'LOW' END AS security_level</code>." },
          { level: 4, text: "<code>GROUP BY security_level ORDER BY user_count DESC</code>." }
        ],
        success_message: 'CASE WHEN + GROUP BY = audit password security mạnh mẽ! Đã hoàn thành toàn bộ 18 bài Database Design Cơ bản!',
        xp_reward: 70
      }
    }

  ]
};