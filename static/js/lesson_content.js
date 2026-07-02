/* ============================================================================
 * LESSON_CONTENT — Database Design course
 * 4-step pipeline data: Step 1 (Theory+Visual) → Step 2 (MCQ) →
 *                       Step 3 (Hybrid Drag-Query + Reveal) → Step 4 (Pure Code)
 *
 * 20 bài (db_01..db_20) đều có content đầy đủ — curriculum chia 3 module:
*   - Module 1 (db_01..db_07): ER Model & Mapping — Silberschatz Ch 6
*   - Module 2 (db_08..db_14): Normalization (FD, 1NF→3NF→BCNF→4NF, Boss Battle) — Ch 7
*   - Module 3 (db_15..db_20): Application Design (JSON, Spatial, ORM, Web Services, SQLi, Password) — Ch 8-9
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
  total_lessons: 20,
  lessons: [
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
      achievement: { name: 'Khóa chính — Khởi đầu', desc: 'bài đầu về Primary Key' },
      step_1: {
        primer: {
          goal: [
            'Entity Set = Table',
            'Primary Key (PK) = cột định danh duy nhất',
            'Dùng PK trong WHERE để lấy chính xác 1 record'
          ],
          intro: '',
          example: '🔍 <strong>Nhìn bảng SAMPLE DATA bên dưới:</strong> ngay trong vài dòng đầu, <strong>Elden Ring</strong> đã xuất hiện 2 lần — dòng <code class="code">101</code> và <code class="code">104</code>. Nếu bạn chỉ nói với DB "tôi muốn Elden Ring", nó biết lấy dòng nào? Giữ câu hỏi này khi sang Bước 2 👇'
        },
        intro: 'Bạn vừa nhận việc ở 1 shop game online. Sếp bảo: <em>"Tổ chức lại kho 5000 game cho gọn gàng"</em>. Bước đầu tiên? Tạo 1 <strong>bảng</strong> (table) — nơi mỗi game là 1 dòng, mỗi thuộc tính (tên, giá, thể loại) là 1 cột. Đây chính là <strong>Entity Set</strong> trong database design.',
        concept_cards: [
            {
              "icon": "fa-cube",
              "title": "Entity Set (Tập thực thể)",
              "body": "Bạn có 1000 game trong shop. Lưu vào đâu? Mỗi <strong>Entity Set</strong> = 1 bảng chứa mọi thứ cùng loại. Bảng <code>game_catalog</code> = nơi 1000 game đó sống — mỗi dòng là 1 game, mỗi cột là 1 thuộc tính."
            },
            {
              "icon": "fa-key",
              "title": "Primary Key (Khóa chính)",
              "body": "Hai game đều tên \"Elden Ring\" — làm sao DB biết bạn muốn game nào? <strong>Primary Key</strong> giải quyết: mỗi dòng có 1 số ID riêng, không ai giống ai. <code>WHERE id = 101</code> → chính xác 1 dòng, không bao giờ nhầm."
            }
        ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "Lý thuyết là để <strong>phá</strong>. Ở Bước 3 &amp; 4 bạn sẽ tự gõ: <code>WHERE name = 'Elden Ring'</code> → ra <strong>2 dòng</strong> (sai!), còn <code>WHERE id = 101</code> → đúng <strong>1 dòng</strong>. Tự sai rồi sửa — đó là cách nhớ Primary Key lâu nhất."
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
            ['101', 'Elden Ring',         'Action RPG',    '60'],
            ['102', 'God of War',         'Action',        '50'],
            ['103', 'Hades',              'Roguelike',     '25'],
            ['104', 'Elden Ring',         'Card Game',     '15'],
            ['105', 'Stardew Valley',     'Simulation',    '18'],
            ['106', 'Hollow Knight',      'Metroidvania',  '15'],
            ['107', 'The Witcher 3',      'Action RPG',    '40'],
            ['108', 'Celeste',            'Platformer',    '20'],
            ['109', 'Cyberpunk 2077',     'Action RPG',    '45'],
            ['110', 'Disco Elysium',      'RPG',           '35'],
            ['111', 'Slay the Spire',     'Card Game',     '23'],
            ['112', 'Dark Souls III',     'Action RPG',    '40'],
            ['113', "Baldur's Gate 3",    'RPG',           '60'],
            ['114', 'Hollow Knight',      'Card Game',     '12'],
            ['115', 'Cuphead',            'Run & Gun',     '20'],
            ['116', 'Sekiro',             'Action RPG',    '50'],
            ['117', 'Doom Eternal',       'Shooter',       '40'],
            ['118', 'Portal 2',           'Puzzle',        '10'],
            ['119', 'Red Dead 2',         'Action',        '60'],
            ['120', 'Terraria',           'Sandbox',       '10'],
            ['121', 'Cult of the Lamb',   'Roguelike',     '25'],
            ['122', 'Outer Wilds',        'Adventure',     '25'],
            ['123', 'Vampire Survivors',  'Roguelite',      '5'],
            ['124', 'Hollow Knight: Silksong', 'Metroidvania', '30']
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
              { id: 'a', text: 'Để format bảng đẹp hơn trên giao diện web', correct: false, explanation: 'PK không liên quan đến hiển thị web. PK là ràng buộc ở database layer để đảm bảo tính duy nhất.' },
              { id: 'b', text: 'Để đảm bảo mỗi record có định danh duy nhất, không trùng lặp', correct: true, explanation: 'Đúng — PK guarantee giá trị DUY NHẤT, không NULL, không trùng. Cho phép WHERE chốt đúng 1 record.' },
              { id: 'c', text: 'Để tăng tốc độ hiển thị bảng trên browser', correct: false, explanation: 'Tốc độ hiển thị phụ thuộc frontend rendering, không phải PK. PK là database constraint.' },
              { id: 'd', text: 'Để giảm dung lượng lưu trữ database', correct: false, explanation: 'PK không ảnh hưởng dung lượng đáng kể (chỉ thêm index). Mục đích chính là uniqueness + identity.' }
            ]
          },
          {
            question: 'Bảng <code>game_catalog</code> có 2 dòng tên "Elden Ring" (id 101 và 104). Để chỉ lấy bản Action RPG giá 60$ bạn dùng:',
            options: [
              { id: 'a', text: '<code>WHERE name = "Elden Ring"</code> — vì tên phân biệt được', correct: false, explanation: 'name KHÔNG unique — có 2 dòng trùng tên. WHERE name sẽ trả về 2 dòng chứ không phải 1.' },
              { id: 'b', text: '<code>WHERE id = 101</code> — dùng PK để chốt đúng 1 record', correct: true, explanation: 'Chính xác — id là PK nên unique. WHERE id = 101 chốt đúng 1 record cần tìm.' },
              { id: 'c', text: '<code>WHERE price = 60</code> — lọc theo giá là đủ', correct: false, explanation: 'price có thể trùng (nhiều game cùng giá 60$). WHERE price = 60 có thể trả về nhiều dòng — không chốt được đúng 1.' },
              { id: 'd', text: 'Không cần WHERE — SELECT trả về hết cũng được', correct: false, explanation: 'SELECT không có WHERE trả về TOÀN BỘ table. Vi phạm nguyên tắc truy vấn — không lọc kết quả.' }
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
          { id: 'where-line',   placeholder: 'WHERE ____ ____ ____', accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE', 'AND', 'OR', 'IN'], multi: true }
        ],
        expected_sql: 'SELECT name, price FROM game_catalog WHERE id = 101;',
        reveal_hints: {
          'select-line': 'Bắt đầu bằng <strong>SELECT</strong>, kéo 2 cột: <strong>name</strong> và <strong>price</strong>.',
          'from-line':   'Tiếp: <strong>FROM</strong> + tên bảng <strong>game_catalog</strong>.',
          'where-line':  'Cuối: <strong>WHERE</strong> lọc đúng 1 dòng bằng PK: <strong>id = 101</strong>.'
        }
      },

      /* ----- STEP 4: Pure code — CÂU HỎI MỚI (khác Step 3) cùng kỹ năng -----
         Step 3 kéo thả: id=101, name+price. Step 4 tự viết: id=104, name+genre —
         chính là bản Elden Ring TRÙNG TÊN → củng cố "PK chốt đúng 1 dòng dù tên trùng". */
      step_4: {
        prompt: 'Kho có <strong>hai</strong> game cùng tên "Elden Ring" (id 101 và 104). Khách vừa bấm vào <strong>bản thứ hai</strong>. Tự viết query lấy <strong>name</strong> và <strong>genre</strong> của game có <code>id = 104</code>.',
        // Câu hỏi khác Step 3 (id=104, name+genre) — cùng kỹ năng SELECT-FROM-WHERE, chống nhàm chán
        context: {
          scenario: 'Bảng <code>game_catalog</code> có 2 dòng cùng tên "Elden Ring" (id 101 & 104). Khách hỏi về đúng bản thứ hai. Nhờ Primary Key <code>id</code>, bạn lấy chính xác 1 dòng — dù tên bị trùng.',
          real_world: 'Đây chính là điều xảy ra khi bạn bấm vào <strong>đúng một</strong> sản phẩm trên <strong>Steam</strong>/<strong>Shopee</strong>: link <code>/product/104</code> → hệ thống chạy <code>WHERE id = 104</code> lấy ĐÚNG mục đó trong vài mili-giây — <strong>kể cả khi có sản phẩm khác trùng tên</strong>. Không có Primary Key, app không phân biệt nổi 2 bản Elden Ring.',
          steps: [
            'Chọn cột cần lấy trong <code>SELECT</code> — lần này là <code>name</code> và <code>genre</code>.',
            'Bảng nguồn sau <code>FROM</code> — <code>game_catalog</code>.',
            'Lọc đúng bản thứ hai bằng PK: <code>WHERE id = 104</code> — <strong>đừng</strong> lọc theo name vì tên trùng!',
            'Run — kết quả phải đúng 1 dòng: <code>(Elden Ring, Card Game)</code>.'
          ],
          hint_explore: 'Chưa nhớ bảng có cột gì? Gõ <code>SELECT * FROM game_catalog</code> rồi <strong>Run</strong> để xem toàn bộ 4 cột + dữ liệu mẫu (chú ý 2 dòng "Elden Ring").',
          example: {
            question: 'Ví dụ tương tự — tra <code>name</code> + <code>genre</code> của <strong>Celeste</strong> (id = 108):',
            sql: 'SELECT name, genre FROM game_catalog WHERE id = 108;',
            sample_output: '→ 1 dòng × 2 cột: <code>(Celeste, Platformer)</code>'
          },
          expected: 'Bảng kết quả 1 dòng × 2 cột: <code>(Elden Ring, Card Game)</code> — <strong>trùng tên</strong> với id=101 nhưng PK chốt đúng bản id=104. Đó là sức mạnh của khóa chính.'
        },
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
            ['103','Hades','Roguelike','25'],
            ['104','Elden Ring','Card Game','15'],
            ['105','Stardew Valley','Simulation','18'],
            ['106','Hollow Knight','Metroidvania','15'],
            ['107','The Witcher 3','Action RPG','40'],
            ['108','Celeste','Platformer','20'],
            ['109','Cyberpunk 2077','Action RPG','45'],
            ['110','Disco Elysium','RPG','35'],
            ['111','Slay the Spire','Card Game','23'],
            ['112','Dark Souls III','Action RPG','40'],
            ['113',"Baldur's Gate 3",'RPG','60'],
            ['114','Hollow Knight','Card Game','12'],
            ['115','Cuphead','Run & Gun','20'],
            ['116','Sekiro','Action RPG','50'],
            ['117','Doom Eternal','Shooter','40'],
            ['118','Portal 2','Puzzle','10'],
            ['119','Red Dead 2','Action','60'],
            ['120','Terraria','Sandbox','10'],
            ['121','Cult of the Lamb','Roguelike','25'],
            ['122','Outer Wilds','Adventure','25'],
            ['123','Vampire Survivors','Roguelite','5'],
            ['124','Hollow Knight: Silksong','Metroidvania','30']
          ]
        },
        starter: '-- Lấy name + genre của bản Elden Ring thứ hai (id = 104)\n-- Gợi ý: SELECT <cột>, <cột> FROM <bảng> WHERE <pk> = <giá trị>;\n',
        expected_sql: 'SELECT name, genre FROM game_catalog WHERE id = 104;',
        hints: [
          { level: 1, text: 'Cần lấy 2 cột: <code>name</code> và <code>genre</code>.' },
          { level: 2, text: 'Đừng lọc theo tên (2 game trùng tên!). Dùng PK: <code>WHERE id = 104</code>.' },
          { level: 3, text: 'Cú pháp: <code>SELECT col1, col2 FROM table WHERE pk = value;</code>' },
          { level: 4, text: '<code>SELECT name, genre FROM game_catalog WHERE id = 104;</code>' }
        ],
        success_message: 'Xuất sắc! Bạn vừa dùng Primary Key để chốt đúng 1 trong 2 game TRÙNG TÊN — đúng bản chất của khóa chính. Bài 2 sẽ học tách cột phức hợp (địa chỉ) và tính cột dẫn xuất (tuổi từ năm sinh).',
        xp_reward: 30
      }
    },

    {
      id: 'db_02', index: 2,
      title: 'Composite, Multivalued & Derived Attributes',
      subtitle: 'Cột phức hợp · thuộc tính nhiều giá trị · cột dẫn xuất',
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
            ['9',  'GG_WellPlayed', 'Hanoi',   'Cau Giay',  '1999'],
            ['10', 'ShadowBlade',   'Seoul',   'Gangnam',   '2003'],
            ['11', 'PixelQueen',    'Osaka',   'Namba',     '2008'],
            ['12', 'CriticalHit',   'Hanoi',   'Dong Da',   '2001'],
            ['13', 'SpeedRunner',   'Busan',   'Haeundae',  '2006'],
            ['14', 'MageLord',      'Tokyo',   'Shibuya',   '2000'],
            ['15', 'LootGoblin',    'Saigon',  'Quan 1',    '2004'],
            ['16', 'FrostByte',     'Seoul',   'Hongdae',   '2007'],
            ['17', 'IronWolf',      'Hanoi',   'Tay Ho',    '1998'],
            ['18', 'NightOwl',      'Kyoto',   'Gion',      '2002'],
            ['19', 'BladeDancer',   'Busan',   'Seomyeon',  '2009'],
            ['20', 'ArcaneFox',     'Saigon',  'Quan 3',    '2005'],
            ['21', 'ThunderGod',    'Tokyo',   'Ikebukuro', '2003'],
            ['22', 'SilentArrow',   'Hanoi',   'Cau Giay',  '2011'],
            ['23', 'RuneMaster',    'Osaka',   'Umeda',     '1997'],
            ['24', 'VortexGamer',   'Seoul',   'Itaewon',   '2006'],
            ['25', 'EmberKnight',   'Saigon',  'Thu Duc',   '2008'],
            ['26', 'ZenMonk',       'Kyoto',   'Arashiyama','2001'],
            ['27', 'CyberNinja',    'Tokyo',   'Akihabara', '2010'],
            ['28', 'GhostReaper',   'Busan',   'Gwangalli', '2004']
          ]
        }
      },

      achievement: { name: 'Thợ tách thuộc tính', desc: 'composite · multivalued · derived' },
      step_1: {
        primer: {
          goal: [
            'Composite Attribute = cột ghép từ nhiều cột nhỏ (vd: address = city + district)',
            'Multivalued = 1 thuộc tính có NHIỀU giá trị (vd 1 người chơi nhiều platform PS5/Xbox/PC) → KHÔNG nhét 1 ô, phải TÁCH BẢNG riêng',
            'Derived Attribute = cột KHÔNG lưu, hệ thống tự tính khi truy vấn (vd: age = currentYear - birthYear)',
            'Dùng AS để đặt tên cột ảo cho giá trị dẫn xuất'
          ],
          intro: 'Trong ER diagram, một thuộc tính có thể là <strong>Composite</strong> (gồm nhiều mảnh: address = city + district + street), <strong>Multivalued</strong> (nhiều giá trị: 1 người chơi chơi PS5 + Xbox + PC) hoặc <strong>Derived</strong> (tính toán từ thuộc tính khác: age = currentYear - birthYear). Khi chuyển sang bảng vật lý, ta <em>tách</em> composite thành nhiều cột độc lập, <em>không lưu</em> derived — chỉ tính khi SELECT. Loại thứ ba: <strong>Multivalued</strong> — 1 người chơi có thể chơi trên NHIỀU platform. Không thể nhét "PS5, Xbox, PC" vào 1 ô (vi phạm tính nguyên tử). Trong ER vẽ <strong>ellipse đôi</strong>; map sang bảng quan hệ → TÁCH thành bảng riêng <code>player_platform(p_id, platform)</code>.',
          example: 'Bảng <code class="code">player_profile</code> dưới đây đã tách address thành <code>address_city</code> + <code>address_dist</code>. Cột <code>age</code> KHÔNG tồn tại vật lý — sẽ được tính bằng <code>(EXTRACT(YEAR FROM CURRENT_DATE) - birth_year) AS age</code>. Multivalued platforms → tách bảng <code>player_platform(p_id, platform)</code>, mỗi platform 1 dòng.'
        },
                intro: 'Điều gì xảy ra khi 1 khách hàng đăng ký tài khoản và bạn cần lưu <strong>địa chỉ</strong>? Ghi thành 1 cột dài "<code>Q1, Nguyễn Huệ, HCM</code>"? Hay tách thành <code>city</code>, <code>district</code>, <code>street</code>? Câu trả lời quyết định tốc độ query 100 lần. Bài này dạy <strong>Composite</strong> + <strong>Derived</strong> attribute.',
concept_cards: [
            {
                  "icon": "fa-puzzle-piece",
                  "title": "Composite Attribute",
                  "body": "Giống <strong>địa chỉ nhà</strong> bạn điền form: số nhà, đường, quận, thành phố. Mỗi mảnh là 1 thông tin riêng. Database ghép lại thành cột <code>address</code> nhưng <em>nên tách thành 4 cột</em> để query \"tìm theo quận\" cực nhanh."
            },
            {
                  "icon": "fa-layer-group",
                  "title": "Multivalued — nhiều giá trị",
                  "body": "1 người chơi nhiều platform (PS5, Xbox, PC). KHÔNG nhét list vào 1 ô (vi phạm 1NF). ER: <strong>ellipse đôi</strong>. Map sang bảng → tách bảng riêng <code>player_platform(p_id, platform)</code>, mỗi platform 1 dòng. (Cầu nối tới bài 1NF + bảng trung gian.)"
            },
            {
                  "icon": "fa-calculator",
                  "title": "Derived Attribute",
                  "body": "Như <strong>tuổi của bạn</strong> — không ai hỏi mẹ sinh năm nào rồi ghi vào sổ; chỉ cần biết năm sinh, ai cũng tự tính. <code>age = 2026 - birth_year</code>. DB <em>không lưu</em>, chỉ tính khi SELECT với <code>AS</code>."
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "Bảng player_profile dưới đây đã tách address thành address_city + address_dist."
            }
          ],
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
            ['7',  'DragonLord',    'Tokyo',   'Akihabara', '2005'],
            ['8',  'NoobMaster',    'Seattle', 'Bellevue',  '2010'],
            ['9',  'GG_WellPlayed', 'Hanoi',   'Cau Giay',  '1999'],
            ['10', 'ShadowBlade',   'Seoul',   'Gangnam',   '2003'],
            ['11', 'PixelQueen',    'Osaka',   'Namba',     '2008'],
            ['12', 'CriticalHit',   'Hanoi',   'Dong Da',   '2001'],
            ['13', 'SpeedRunner',   'Busan',   'Haeundae',  '2006'],
            ['14', 'MageLord',      'Tokyo',   'Shibuya',   '2000'],
            ['15', 'LootGoblin',    'Saigon',  'Quan 1',    '2004'],
            ['16', 'FrostByte',     'Seoul',   'Hongdae',   '2007'],
            ['17', 'IronWolf',      'Hanoi',   'Tay Ho',    '1998'],
            ['18', 'NightOwl',      'Kyoto',   'Gion',      '2002'],
            ['19', 'BladeDancer',   'Busan',   'Seomyeon',  '2009'],
            ['20', 'ArcaneFox',     'Saigon',  'Quan 3',    '2005'],
            ['21', 'ThunderGod',    'Tokyo',   'Ikebukuro', '2003'],
            ['22', 'SilentArrow',   'Hanoi',   'Cau Giay',  '2011'],
            ['23', 'RuneMaster',    'Osaka',   'Umeda',     '1997'],
            ['24', 'VortexGamer',   'Seoul',   'Itaewon',   '2006'],
            ['25', 'EmberKnight',   'Saigon',  'Thu Duc',   '2008'],
            ['26', 'ZenMonk',       'Kyoto',   'Arashiyama','2001'],
            ['27', 'CyberNinja',    'Tokyo',   'Akihabara', '2010'],
            ['28', 'GhostReaper',   'Busan',   'Gwangalli', '2004']
          ]
        },
        mission: 'Lấy <code>username</code>, 2 mảnh địa chỉ (city + dist) và cột ảo <code>age</code> của người chơi <code>p_id = 7</code> — kéo thả khối lệnh (bao gồm cả cụm tính toán) xuống dưới ↓'
      },

      step_2: {
        mcq: [
          {
            question: 'Thuộc tính Composite (Phức hợp) là gì?',
            options: [
              { id: 'a', text: 'Cột được lưu nhiều giá trị ngăn cách bằng dấu phẩy', correct: false, explanation: 'Sai — đó là multivalued attribute, không phải composite. Multivalue = NHIỀU giá trị riêng biệt; composite = 1 giá trị chia nhỏ được thành nhiều sub-attribute có ý nghĩa.' },
              { id: 'b', text: 'Thuộc tính có thể tách thành nhiều thuộc tính nhỏ hơn (vd: address → city + district)', correct: true, explanation: 'Đúng — composite có thể phân rã thành nhiều thuộc tính nhỏ hơn có ý nghĩa độc lập. address = street + city + district + zip_code, mỗi phần dùng query riêng được.' },
              { id: 'c', text: 'Cột được mã hóa để bảo mật', correct: false, explanation: 'Sai — composite không liên quan đến bảo mật. Mã hóa là encryption, là attribute khác (encrypted vs plain).' },
              { id: 'd', text: 'Cột có giá trị NULL mặc định', correct: false, explanation: 'Sai — composite có thể có giá trị hoặc NULL. NULL mặc định không phải đặc trưng — composite nói về CẤU TRÚC phân rã được, không nói về giá trị.' }
            ]
          },
          {
            question: 'Thuộc tính <strong>multivalued</strong> (1 người chơi nhiều platform) khi map sang bảng quan hệ thì làm sao?',
            options: [
              { id: 'a', text: 'Nhét tất cả vào 1 ô, cách nhau dấu phẩy', correct: false, explanation: 'Sai — vi phạm tính nguyên tử (1NF). 1 ô = 1 giá trị.' },
              { id: 'b', text: 'Tách thành bảng riêng, mỗi giá trị 1 dòng (vd player_platform)', correct: true, explanation: 'Đúng — multivalued → bảng riêng (p_id, platform).' },
              { id: 'c', text: 'Thêm cột platform1, platform2, platform3...', correct: false, explanation: 'Sai — số platform không cố định; thêm cột cứng nhắc, lãng phí, vẫn sai chuẩn.' },
              { id: 'd', text: 'Không lưu được', correct: false, explanation: 'Sai — lưu được, chỉ cần tách bảng đúng cách.' }
            ]
          },
          {
            question: 'Tại sao KHÔNG lưu cột <code>age</code> trong bảng mà tính mỗi lần truy vấn?',
            options: [
              { id: 'a', text: 'Vì cột age quá ngắn, không đáng lưu', correct: false, explanation: 'Sai — age chỉ 4 bytes (INT). Kích thước không phải lý do. Hàng triệu row × 4 bytes vẫn không đáng kể.' },
              { id: 'b', text: 'Vì age thay đổi theo thời gian — lưu sẽ phải cập nhật liên tục, dễ sai', correct: true, explanation: 'Đúng — age = derived attribute từ (current_date - birth_year). Lưu age = phải UPDATE mỗi năm (cron job) → dễ stale, sai logic. Tính lúc query = luôn đúng với current_date.' },
              { id: 'c', text: 'Vì age không phải số nguyên', correct: false, explanation: 'Sai — age = INT (3 bytes). Hoàn toàn lưu được. Lý do không liên quan kiểu dữ liệu.' },
              { id: 'd', text: 'Vì age là khóa chính', correct: false, explanation: 'Sai — age không thể là PK (2 user cùng tuổi). PK phải unique + not null. age vi phạm cả 2.' }
            ]
          }
        ],
        mini_game:         {
          "type": "match",
          "title": "Nối thuộc tính → loại",
          "instruction": "Mỗi thuộc tính thuộc loại nào? Click ô trái rồi click ô phải tương ứng.",
          "xp": 20,
          "pairs": [
            {
              "left": "address = city + district + street",
              "leftId": "a1",
              "rightId": "r1",
              "right": {
                "id": "r1",
                "label": "Composite"
              }
            },
            {
              "left": "age = 2026 - birth_year",
              "leftId": "a2",
              "rightId": "r2",
              "right": {
                "id": "r2",
                "label": "Derived"
              }
            },
            {
              "left": "student_name (1 giá trị đơn)",
              "leftId": "a3",
              "rightId": "r3",
              "right": {
                "id": "r3",
                "label": "Simple"
              }
            },
            {
              "left": "phones = [0901, 0902, 0903]",
              "leftId": "a4",
              "rightId": "r4",
              "right": {
                "id": "r4",
                "label": "Multivalued"
              }
            }
          ],
          "solution": {
            "a1": "r1",
            "a2": "r2",
            "a3": "r3",
            "a4": "r4"
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
          { id: 'select-line', placeholder: 'SELECT ____ , ____ , ____ , ____', accepts: ['kw', 'col', 'fn'], acceptedKeywords: ['SELECT', 'AS'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',                          accepts: ['kw', 'tbl'],     multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',               accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE', 'AND', 'OR', 'IN'], multi: true }
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
            ['9',  'GG_WellPlayed', 'Hanoi',   'Cau Giay',  '1999'],
            ['10', 'ShadowBlade',   'Seoul',   'Gangnam',   '2003'],
            ['11', 'PixelQueen',    'Osaka',   'Namba',     '2008'],
            ['12', 'CriticalHit',   'Hanoi',   'Dong Da',   '2001'],
            ['13', 'SpeedRunner',   'Busan',   'Haeundae',  '2006'],
            ['14', 'MageLord',      'Tokyo',   'Shibuya',   '2000'],
            ['15', 'LootGoblin',    'Saigon',  'Quan 1',    '2004'],
            ['16', 'FrostByte',     'Seoul',   'Hongdae',   '2007'],
            ['17', 'IronWolf',      'Hanoi',   'Tay Ho',    '1998'],
            ['18', 'NightOwl',      'Kyoto',   'Gion',      '2002'],
            ['19', 'BladeDancer',   'Busan',   'Seomyeon',  '2009'],
            ['20', 'ArcaneFox',     'Saigon',  'Quan 3',    '2005'],
            ['21', 'ThunderGod',    'Tokyo',   'Ikebukuro', '2003'],
            ['22', 'SilentArrow',   'Hanoi',   'Cau Giay',  '2011'],
            ['23', 'RuneMaster',    'Osaka',   'Umeda',     '1997'],
            ['24', 'VortexGamer',   'Seoul',   'Itaewon',   '2006'],
            ['25', 'EmberKnight',   'Saigon',  'Thu Duc',   '2008'],
            ['26', 'ZenMonk',       'Kyoto',   'Arashiyama','2001'],
            ['27', 'CyberNinja',    'Tokyo',   'Akihabara', '2010'],
            ['28', 'GhostReaper',   'Busan',   'Gwangalli', '2004']
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
            ['501', 'Super Mario Odyssey',   '10'],
            ['502', 'The Legend of Zelda',  '10'],
            ['503', 'GTA V',                '20'],
            ['504', 'Red Dead Redemption 2','20'],
            ['505', 'Mario Kart 8',         '10'],
            ['506', 'GTA IV',               '20'],
            ['507', 'Bully',                '20'],
            ['508', "Assassin's Creed",     '30'],
            ['509', 'Far Cry 6',            '30'],
            ['510', 'FIFA 23',              '40'],
            ['511', 'The Sims 4',           '40'],
            ['512', 'Final Fantasy XVI',    '50'],
            ['513', 'Cyberpunk 2077',       '60'],
            ['514', 'The Witcher 3',        '60'],
            ['515', 'Max Payne 3',          '20'],
            ['516', 'LA Noire',             '20'],
            ['517', 'Splatoon 3',           '10'],
            ['518', 'Watch Dogs',           '30'],
            ['519', 'Battlefield 2042',     '40'],
            ['520', 'Dragon Quest XI',      '50'],
            ['521', 'Animal Crossing',      '10'],
            ['522', 'Red Dead Redemption',  '20']
          ]
        }
      },

      achievement: { name: 'Người nối bảng', desc: 'JOIN qua Khóa ngoại' },
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
                intro: '90% lỗi SQL mới bắt đầu do <strong>JOIN sai bảng</strong>. Bạn tưởng query chạy đúng → 10 giây sau trả về 0 dòng, hoặc tệ hơn: trả về duplicate row. Nguyên nhân gốc: thiếu <strong>Foreign Key constraint</strong> + hiểu sai quan hệ. 1 bài này tiết kiệm 6 tháng debug.',
concept_cards: [
            {
                  "icon": "fa-link",
                  "title": "Foreign Key — Hợp đồng liên bảng",
                  "body": "60% bug SQL mới bắt đầu do <strong>JOIN sai bảng</strong>. FK là \"hợp đồng\" giữa 2 bảng: <code>game.pub_id</code> HỨA rằng giá trị này PHẢI tồn tại trong <code>publisher.pub_id</code>. Phá hợp đồng → DB từ chối INSERT ngay lập tức."
            },
            {
                  "icon": "fa-object-group",
                  "title": "JOIN — Nối bảng qua FK",
                  "body": "1 game có 1 publisher. <strong>Không lưu</strong> tên publisher trong bảng game — chỉ lưu <code>pub_id</code>. Khi cần tên → <code>JOIN</code> qua FK. Đây là lý do database thiết kế chuẩn 3NF tiết kiệm hàng GB storage ở quy mô triệu record."
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "Bảng game có cột pub_id (FK) trỏ sang publisher."
            }
          ],
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
            ['501', 'Super Mario Odyssey',   '10'],
            ['502', 'The Legend of Zelda',  '10'],
            ['503', 'GTA V',                '20'],
            ['504', 'Red Dead Redemption 2','20'],
            ['505', 'Mario Kart 8',         '10'],
            ['506', 'GTA IV',               '20'],
            ['507', 'Bully',                '20'],
            ['508', "Assassin's Creed",     '30'],
            ['509', 'Far Cry 6',            '30'],
            ['510', 'FIFA 23',              '40'],
            ['511', 'The Sims 4',           '40'],
            ['512', 'Final Fantasy XVI',    '50'],
            ['513', 'Cyberpunk 2077',       '60'],
            ['514', 'The Witcher 3',        '60'],
            ['515', 'Max Payne 3',          '20'],
            ['516', 'LA Noire',             '20'],
            ['517', 'Splatoon 3',           '10'],
            ['518', 'Watch Dogs',           '30'],
            ['519', 'Battlefield 2042',     '40'],
            ['520', 'Dragon Quest XI',      '50'],
            ['521', 'Animal Crossing',      '10'],
            ['522', 'Red Dead Redemption',  '20']
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
                ['20', 'Rockstar'],
                ['30', 'Ubisoft'],
                ['40', 'EA'],
                ['50', 'Square Enix'],
                ['60', 'CD Projekt']
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
              { id: 'a', text: 'Lưu giá trị Khóa chính của bảng khác để tạo liên kết', correct: true, explanation: 'Đúng — FK lưu giá trị PK từ bảng khác (hoặc cùng bảng) để tạo liên kết. DB engine enforce referential integrity: FK phải tồn tại trong bảng tham chiếu.' },
              { id: 'b', text: 'Mã hóa dữ liệu nhạy cảm', correct: false, explanation: 'Sai — mã hóa là encryption (AES, bcrypt). FK không liên quan security — nó chỉ là 1 cột integer tham chiếu PK.' },
              { id: 'c', text: 'Tăng tốc độ truy vấn bằng index', correct: false, explanation: 'Sai — PK có index tự động (clustered). FK CÓ THỂ có index (best practice) nhưng bản chất FK là constraint, không phải performance tool.' },
              { id: 'd', text: 'Đánh dấu cột được phép NULL', correct: false, explanation: 'Sai — NULLability là property độc lập với FK. FK có thể NULL hoặc NOT NULL tuỳ design. NULL = "không có liên kết" trong quan hệ 1:N optional.' }
            ]
          },
          {
            question: 'Khi 2 bảng cùng có cột <code>id</code> và bạn SELECT cả 2, làm sao phân biệt?',
            options: [
{ id: 'a', text: 'SELECT id FROM game, publisher', correct: false, format: 'code', explanation: 'Sai — cột `id` xuất hiện ở cả 2 bảng mà không qualify → ambiguous column error. SQL không tự hiểu ý bạn.' },
          { id: 'b', text: 'SELECT game.id, publisher.id FROM game JOIN publisher ON game.pub_id = publisher.id', correct: true, format: 'code', explanation: 'Đúng — qualify bằng `<table>.<column>` (game.id, publisher.id). Khi JOIN, dùng ON để chỉ định FK relationship (game.pub_id = publisher.id).' },
          { id: 'c', text: 'SELECT * FROM game, publisher', correct: false, format: 'code', explanation: 'Sai — `*` chọn tất cả cột của CẢ 2 bảng → 2 cột `id` đều được trả về với cùng tên → phía client không phân biệt được đâu là `game.id`, đâu là `publisher.id`.' },
          { id: 'd', text: 'SELECT game.id AS game_id, publisher.id AS pub_id FROM game, publisher', correct: false, format: 'code', explanation: 'Sai — alias chỉ đổi tên cột OUTPUT, không giải quyết ambiguity lúc query. Câu này KHÔNG có JOIN nên cross product — kết quả vẫn ambiguous giữa 2 cột id.' }
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
          { type: 'val', token: "'Rockstar'",     slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____',            accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____ JOIN ____ ON ____', accepts: ['kw', 'tbl', 'col'], acceptedKeywords: ['FROM', 'JOIN', 'ON'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',   accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE', 'AND', 'OR', 'IN'], multi: true }
        ],
        expected_sql: "SELECT game.title FROM game JOIN publisher ON game.pub_id = publisher.id WHERE publisher.name = 'Rockstar';",
        reveal_hints: {
          'select-line': 'SELECT 1 cột: <strong>game.title</strong> (chỉ rõ bảng để tránh nhầm với publisher).',
          'from-line':   'FROM <strong>game</strong> → <strong>JOIN publisher ON game.pub_id = publisher.id</strong> (nối qua FK ↔ PK).',
          'where-line':  "WHERE lọc hãng: <strong>publisher.name = 'Rockstar'</strong>."
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
            ['501', 'Super Mario Odyssey',   '10'],
            ['502', 'The Legend of Zelda',  '10'],
            ['503', 'GTA V',                '20'],
            ['504', 'Red Dead Redemption 2','20'],
            ['505', 'Mario Kart 8',         '10'],
            ['506', 'GTA IV',               '20'],
            ['507', 'Bully',                '20'],
            ['508', "Assassin's Creed",     '30'],
            ['509', 'Far Cry 6',            '30'],
            ['510', 'FIFA 23',              '40'],
            ['511', 'The Sims 4',           '40'],
            ['512', 'Final Fantasy XVI',    '50'],
            ['513', 'Cyberpunk 2077',       '60'],
            ['514', 'The Witcher 3',        '60'],
            ['515', 'Max Payne 3',          '20'],
            ['516', 'LA Noire',             '20'],
            ['517', 'Splatoon 3',           '10'],
            ['518', 'Watch Dogs',           '30'],
            ['519', 'Battlefield 2042',     '40'],
            ['520', 'Dragon Quest XI',      '50'],
            ['521', 'Animal Crossing',      '10'],
            ['522', 'Red Dead Redemption',  '20']
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
              ['20', 'Rockstar'],
              ['30', 'Ubisoft'],
              ['40', 'EA'],
              ['50', 'Square Enix'],
              ['60', 'CD Projekt']
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
        success_message: 'Xuất sắc! Bạn đã nối 2 bảng qua Foreign Key bằng JOIN ON. Bài 4 sẽ học FK & 1:N — quan hệ một-nhiều qua khóa ngoại.',
        xp_reward: 60
      }
    },

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
            ['7',  'DragonLord'],
            ['8',  'NoobMaster'],
            ['9',  'GG_WellPlayed'],
            ['10', 'ShadowBlade'],
            ['11', 'PixelQueen'],
            ['12', 'CriticalHit'],
            ['13', 'SpeedRunner'],
            ['14', 'MageLord'],
            ['15', 'LootGoblin'],
            ['16', 'FrostByte'],
            ['17', 'IronWolf'],
            ['18', 'NightOwl'],
            ['19', 'BladeDancer'],
            ['20', 'ArcaneFox']
          ]
        }
      },

      achievement: { name: 'Kiến trúc 1:N', desc: 'quan hệ một-nhiều bằng FK' },
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
                intro: 'Năm ngoái, một intern mới vào team thiết kế schema cho ứng dụng đặt lịch học. Cô ấy vẽ 1 bảng <code>enrollment</code> với 8 cột: student_name, course_name, instructor, room, time... Cuối cùng 1 SV đăng ký 3 môn = 3 dòng, mỗi dòng lặp lại tên SV. Insert sai = sai toàn bộ. Bài này dạy <strong>M:N qua junction table</strong>.',
concept_cards: [
            {
                  "icon": "fa-arrows-left-right",
                  "title": "Mối quan hệ 1:N — Tình huống Minh học 3 môn",
                  "body": "Sinh viên Minh đăng ký Database (40 SV), OOP (35 SV), Web (50 SV). Nếu lưu \"Minh học\" = 3 dòng riêng → tên Minh lặp 3 lần. Nếu gộp \"môn1, môn2, môn3\" thành 3 cột → giới hạn số môn. Giải pháp: <strong>FK ở bên N</strong>, mỗi dòng enrollment = 1 cặp."
            },
            {
                  "icon": "fa-table-list",
                  "title": "Junction Table — Cầu nối M:N",
                  "body": "Bảng <code>enrollment(student_id, course_id)</code> chỉ chứa 2 FK. PK là cặp (student_id, course_id) ghép lại. Đôi khi có thêm cột riêng như <code>enrolled_at</code> hay <code>grade</code>. Đây là <strong>1 bảng trung gian</strong> cho mọi quan hệ M:N."
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "Bảng player_game_library ở giữa chỉ chứa ref_p_id + ref_game_id."
            }
          ],
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
            ['7',  'DragonLord'],
            ['8',  'NoobMaster'],
            ['9',  'GG_WellPlayed'],
            ['10', 'ShadowBlade'],
            ['11', 'PixelQueen'],
            ['12', 'CriticalHit'],
            ['13', 'SpeedRunner'],
            ['14', 'MageLord'],
            ['15', 'LootGoblin'],
            ['16', 'FrostByte'],
            ['17', 'IronWolf'],
            ['18', 'NightOwl'],
            ['19', 'BladeDancer'],
            ['20', 'ArcaneFox']
          ],
          related_tables: [
            {
              name: 'player_game_library',
              columns: [
                { name: 'ref_p_id',    type: 'INT', key: 'FK', icon: '🔗' },
                { name: 'ref_game_id', type: 'INT', key: 'FK', icon: '🔗' }
              ],
              data: [
                ['7', '101'], ['7', '103'],
                ['8', '101'], ['8', '105'],
                ['9', '102'], ['9', '107'],
                ['10','101'], ['10','109'],
                ['11','104'], ['11','111'],
                ['12','103'], ['12','108'],
                ['13','110'], ['13','102'],
                ['14','106'], ['14','112'],
                ['15','101'], ['15','105'],
                ['16','107'], ['17','103'],
                ['18','109'], ['19','102'],
                ['20','108'], ['16','110']
              ]
            },
            {
              name: 'game',
              columns: [
                { name: 'game_id', type: 'INT',     key: 'PK', icon: '🔑' },
                { name: 'title',   type: 'VARCHAR', key: '',   icon: '🎮' }
              ],
              data: [
                ['101','Elden Ring'],
                ['102','God of War'],
                ['103','Hades'],
                ['104','Celeste'],
                ['105','Hollow Knight'],
                ['106','Stardew Valley'],
                ['107','The Witcher 3'],
                ['108','Cyberpunk 2077'],
                ['109','Dark Souls III'],
                ['110','Sekiro'],
                ['111','Disco Elysium'],
                ['112',"Baldur's Gate 3"]
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
              { id: 'a', text: 'Vì FK chỉ được lưu 1 lần duy nhất trong bảng', correct: false, explanation: 'Sai — FK có thể xuất hiện nhiều lần trong bảng. Mỗi row có thể có FK riêng. Vấn đề M:N nằm ở chỗ khác.' },
              { id: 'b', text: 'Vì nhét FK vào 1 bên sẽ sinh lặp dữ liệu vô tận (mỗi record cần 1 dòng)', correct: true, explanation: 'Đúng — nếu Player có 1 cột games (FK), mỗi game mua thêm = thêm 1 dòng player (lặp username). Ngược lại cũng vậy. Lặp vô tận → cần junction table.' },
              { id: 'c', text: 'Vì M:N không được phép trong SQL', correct: false, explanation: 'Sai — SQL cho phép M:N qua junction table. Không có cấm.' },
              { id: 'd', text: 'Vì FK phải là số nguyên dương', correct: false, explanation: 'Sai — FK chỉ cần cùng kiểu với PK được tham chiếu. Không có ràng buộc dương.' }
            ]
          },
          {
            question: 'Bảng trung gian (Junction Table) trong quan hệ M:N chứa gì?',
            options: [
              { id: 'a', text: 'Chỉ 1 cột FK trỏ về bảng chính', correct: false, explanation: 'Sai — chỉ 1 FK tạo quan hệ 1:N, không phải M:N. Cần 2 FK (mỗi bên 1).' },
              { id: 'b', text: '2 cột FK — mỗi cột trỏ về 1 bảng ở 2 phía quan hệ', correct: true, explanation: 'Đúng — junction table chứa 2 FK + (optional) PK ghép. Mỗi dòng = 1 cặp (entityA_id, entityB_id).' },
              { id: 'c', text: 'Tất cả thuộc tính của cả 2 bảng gộp lại', correct: false, explanation: 'Sai — gộp hết thuộc tính gây lặp dữ liệu (violates 1NF). Junction chỉ giữ 2 FK + metadata tùy chọn.' },
              { id: 'd', text: 'Không có cột nào, chỉ là bảng "ảo"', correct: false, explanation: 'Sai — junction table là bảng THẬT trong database, chỉ là nó chỉ có 2 FK + PK ghép.' }
            ]
          }
        ],
        mini_game:         {
          "type": "order",
          "title": "Sắp xếp bước tạo quan hệ M:N",
          "instruction": "Kéo thả để sắp đúng thứ tự khi thiết kế M:N.",
          "xp": 20,
          "items": [
            {
              "id": "s1",
              "label": "Bước 1: Xác định 2 entity set (Player, Game)"
            },
            {
              "id": "s2",
              "label": "Bước 2: Tạo bảng riêng cho từng entity với PK"
            },
            {
              "id": "s3",
              "label": "Bước 3: Tạo junction table (player_game_library)"
            },
            {
              "id": "s4",
              "label": "Bước 4: Thêm 2 FK tham chiếu PK 2 bảng gốc"
            },
            {
              "id": "s5",
              "label": "Bước 5: PK của junction = composite (player_id, game_id)"
            }
          ],
          "solution": {
            "s1": 1,
            "s2": 2,
            "s3": 3,
            "s4": 4,
            "s5": 5
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
          { type: 'kw',  token: 'JOIN',           slot: 'kw-join2' },
          { type: 'tbl', token: 'game',           slot: 'tbl3' },
          { type: 'kw',  token: 'ON',             slot: 'kw-on2' },
          { type: 'col', token: 'player_game_library.ref_game_id = game.game_id', slot: 'col-on2' },
          { type: 'kw',  token: 'WHERE',          slot: 'kw-where' },
          { type: 'col', token: 'player.username',slot: 'wcol-1' },
          { type: 'op',  token: '=',              slot: 'op-1' },
          { type: 'val', token: "'DragonLord'",   slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____',                        accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____ JOIN ____ ON ____ JOIN ____ ON ____', accepts: ['kw', 'tbl', 'col'], acceptedKeywords: ['FROM', 'JOIN', 'ON'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',               accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE', 'AND', 'OR', 'IN'], multi: true }
        ],
        expected_sql: "SELECT game.title FROM player JOIN player_game_library ON player.p_id = player_game_library.ref_p_id JOIN game ON player_game_library.ref_game_id = game.game_id WHERE player.username = 'DragonLord';",
        reveal_hints: {
          'select-line': 'SELECT 1 cột: <strong>game.title</strong>.',
          'from-line':   'Chuỗi 2 JOIN: <strong>player</strong> → <strong>player_game_library</strong> (nối qua p_id) → <strong>game</strong> (nối qua ref_game_id).',
          'where-line':  "WHERE lọc người: <strong>player.username = 'DragonLord'</strong>."
        }
      },

      step_4: {
        prompt: 'Từ 3 bảng <code>player</code>, <code>player_game_library</code>, <code>game</code>: tìm <code>title</code> của các game mà player tên <em>DragonLord</em> đang sở hữu. Viết query SQL trong editor ở cột giữa.',
        // FIX 2e-C2: context giàu — Bài 3 mid concept (JOIN qua 3 bảng)
        context: {
          scenario: 'Bạn đang xây tính năng "Thư viện game" cho hệ thống gaming. Mỗi player có thể sở hữu nhiều game; mối quan hệ N-N giữa <code>player</code> và <code>game</code> được lưu qua bảng trung gian <code>player_game_library</code>. Cần truy vấn game của riêng <em>DragonLord</em>.',
          steps: [
            'Xác định bảng nguồn: bắt đầu từ <code>player</code> (lọc theo <code>username</code>).',
            'JOIN sang <code>player_game_library</code> qua FK <code>player.p_id = library.ref_p_id</code> để biết player sở hữu game nào.',
            'JOIN tiếp sang <code>game</code> qua FK <code>library.ref_game_id = game.game_id</code> để lấy <code>title</code>.',
            'SELECT <code>game.title</code>, kết thúc bằng <code>WHERE player.username = "DragonLord"</code>.'
          ],
          hint_explore: 'Bài này có 3 bảng liên kết. Để xem cấu trúc từng bảng: <code>SELECT * FROM player</code>, <code>SELECT * FROM player_game_library</code>, <code>SELECT * FROM game</code> (gõ từng cái, Run, xem kết quả).',
          example: {
            question: 'Ví dụ tương tự — lấy <code>title</code> game của player <em>NoobMaster</em>:',
            sql: 'SELECT game.title FROM player JOIN player_game_library ON player.p_id = player_game_library.ref_p_id JOIN game ON player_game_library.ref_game_id = game.game_id WHERE player.username = "NoobMaster";',
            sample_output: '→ 2 dòng: <code>Elden Ring</code> + <code>Hollow Knight</code> (NoobMaster sở hữu 2 game trong data mẫu)'
          },
          expected: 'Bảng kết quả 2 dòng × 1 cột <code>title</code>: <code>Elden Ring</code> và <code>Hades</code> (DragonLord sở hữu 2 game).'
        },
        starter: "-- Tìm title game của player 'DragonLord'\n-- JOIN 3 bảng: player ↔ player_game_library ↔ game\nSELECT game.\n  FROM player\n  JOIN player_game_library ON player. = player_game_library.\n  JOIN game ON player_game_library. = game.\n WHERE player. = ;\n",
        schema: {
          table_name: 'player',
          columns: [
            { name: 'p_id',     type: 'INT',     key: 'PK' },
            { name: 'username', type: 'VARCHAR', key: '' }
          ],
          data: [
            ['7',  'DragonLord'],
            ['8',  'NoobMaster'],
            ['9',  'GG_WellPlayed'],
            ['10', 'ShadowBlade'],
            ['11', 'PixelQueen'],
            ['12', 'CriticalHit'],
            ['13', 'SpeedRunner'],
            ['14', 'MageLord'],
            ['15', 'LootGoblin'],
            ['16', 'FrostByte'],
            ['17', 'IronWolf'],
            ['18', 'NightOwl'],
            ['19', 'BladeDancer'],
            ['20', 'ArcaneFox']
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
              ['7', '101'], ['7', '103'],
              ['8', '101'], ['8', '105'],
              ['9', '102'], ['9', '107'],
              ['10','101'], ['10','109'],
              ['11','104'], ['11','111'],
              ['12','103'], ['12','108'],
              ['13','110'], ['13','102'],
              ['14','106'], ['14','112'],
              ['15','101'], ['15','105'],
              ['16','107'], ['17','103'],
              ['18','109'], ['19','102'],
              ['20','108'], ['16','110']
            ]
          },
          {
            table_name: 'game',
            columns: [
              { name: 'game_id', type: 'INT',     key: 'PK' },
              { name: 'title',   type: 'VARCHAR', key: '' }
            ],
            data: [
              ['101','Elden Ring'],
              ['102','God of War'],
              ['103','Hades'],
              ['104','Celeste'],
              ['105','Hollow Knight'],
              ['106','Stardew Valley'],
              ['107','The Witcher 3'],
              ['108','Cyberpunk 2077'],
              ['109','Dark Souls III'],
              ['110','Sekiro'],
              ['111','Disco Elysium'],
              ['112',"Baldur's Gate 3"]
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
        success_message: 'Đỉnh! Bạn đã JOIN 3 bảng thành thạo qua FK chain. Bài 5 sẽ học M:N — quan hệ nhiều-nhiều qua bảng trung gian.',
        xp_reward: 70
      }
    },

    {
      id: 'db_19', index: 5,
      title: 'Mối quan hệ M:N & Bảng trung gian',
      subtitle: 'Nhiều-nhiều — tách bảng trung gian (junction) nối 2 thực thể',
      module: 1, module_title: 'Giới thiệu & Nền tảng Database',
      estimated_minutes: 22, xp_reward: 60,
      project_piece: '🧩 Xây "Thư viện game" của người chơi',
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'library',
          columns: ['player_id', 'game_id', 'acquired_date'],
          dataRows: [
            ['7','101','2025-01-10'],
            ['7','103','2025-02-02'],
            ['9','101','2025-01-15'],
            ['9','105','2025-03-01'],
            ['8','102','2024-11-20'],
            ['8','107','2024-12-05'],
            ['10','101','2025-01-22'],
            ['10','109','2025-02-14'],
            ['11','104','2024-10-30'],
            ['11','111','2025-03-18'],
            ['12','103','2025-01-05'],
            ['12','108','2024-12-25'],
            ['13','110','2025-02-09'],
            ['13','102','2025-03-22'],
            ['14','106','2024-11-11'],
            ['14','112','2025-01-30'],
            ['15','102','2025-02-28'],
            ['15','105','2024-12-12'],
            ['9','107','2025-03-10'],
            ['10','103','2025-02-20'],
            ['11','102','2025-01-08'],
            ['12','109','2025-03-05'],
            ['8','110','2024-10-15'],
            ['13','108','2025-04-01']
          ]
        }
      },

      achievement: { name: 'Bậc thầy M:N', desc: 'nối nhiều-nhiều qua bảng trung gian' },
      step_1: {
        primer: {
          goal: [
            'M:N = 1 người chơi sở hữu NHIỀU game, 1 game thuộc NHIỀU người chơi',
            'DB quan hệ KHÔNG nối M:N trực tiếp 2 bảng → tách BẢNG TRUNG GIAN chứa 2 FK',
            'Khóa chính bảng trung gian = (player_id, game_id) ghép lại'
          ],
          intro: '1 người chơi sở hữu nhiều game; 1 game được nhiều người chơi sở hữu — quan hệ <strong>nhiều-nhiều (M:N)</strong>. DB quan hệ không biểu diễn M:N trực tiếp. Giải pháp: bảng <strong>trung gian</strong> <code>library</code> gồm 2 khóa ngoại <code>player_id</code> + <code>game_id</code>; mỗi dòng = 1 cặp "ai sở hữu game nào".',
          example: 'Bảng <code>library(player_id, game_id, acquired_date)</code>: khóa chính là CẶP <code>(player_id, game_id)</code>. Tìm game của người chơi 7: <code>SELECT game_id FROM library WHERE player_id = 7</code>.'
        },
        concept_cards: [
          {
            icon: 'fa-arrows-left-right',
            title: 'M:N — vì sao cần bảng thứ 3',
            body: 'Không thể nhét "danh sách game" vào 1 ô của bảng player (vi phạm 1NF). Cũng không nhét list player vào bảng game. Giải: 1 bảng RIÊNG <code>library</code>, mỗi dòng 1 cặp (player, game).'
          },
          {
            icon: 'fa-code-branch',
            title: 'Junction = 2× (1:N)',
            body: 'Bảng trung gian biến 1 quan hệ M:N thành HAI quan hệ 1:N: player 1:N library, game 1:N library. Mỗi FK trỏ về 1 phía.'
          },
          {
            icon: 'fa-hand-pointer',
            title: 'Thử ngay',
            body: 'Trong <code>library</code>, người chơi 7 có 2 dòng → sở hữu 2 game (101, 103).'
          }
        ],
        visual: {
          schema: {
            table_name: 'library',
            columns: [
              { name: 'player_id', type: 'INT', key: 'PK+FK', icon: '🔗' },
              { name: 'game_id', type: 'INT', key: 'PK+FK', icon: '🔗' },
              { name: 'acquired_date', type: 'DATE', key: '', icon: '📅' }
            ]
          },
          data_preview: [
            ['7','101','2025-01-10'],
            ['7','103','2025-02-02'],
            ['9','101','2025-01-15'],
            ['9','105','2025-03-01'],
            ['8','102','2024-11-20'],
            ['8','107','2024-12-05'],
            ['10','101','2025-01-22'],
            ['10','109','2025-02-14'],
            ['11','104','2024-10-30'],
            ['11','111','2025-03-18'],
            ['12','103','2025-01-05'],
            ['12','108','2024-12-25'],
            ['13','110','2025-02-09'],
            ['13','102','2025-03-22'],
            ['14','106','2024-11-11'],
            ['14','112','2025-01-30'],
            ['15','102','2025-02-28'],
            ['15','105','2024-12-12'],
            ['9','107','2025-03-10'],
            ['10','103','2025-02-20'],
            ['11','102','2025-01-08'],
            ['12','109','2025-03-05'],
            ['8','110','2024-10-15'],
            ['13','108','2025-04-01']
          ],
          diagram: {
            type: 'er', width: 600, height: 280,
            entities: [
              { name: 'player', columns: [{name:'p_id',type:'INT',key:'PK'},{name:'username',type:'VARCHAR'}] },
              { name: 'library', columns: [{name:'player_id',type:'INT',key:'FK,PK'},{name:'game_id',type:'INT',key:'FK,PK'}] },
              { name: 'game', columns: [{name:'game_id',type:'INT',key:'PK'},{name:'title',type:'VARCHAR'}] }
            ],
            connectors: [
              { from: 'player', to: 'library', label: 'sở hữu', fromCard: '1', toCard: 'N' },
              { from: 'game', to: 'library', label: 'được sở hữu', fromCard: '1', toCard: 'N' }
            ],
            note: 'M:N giải bằng bảng trung gian library — PK ghép (player_id, game_id)'
          }
        },
        mission: 'Tìm các <code>game_id</code> mà người chơi id 7 sở hữu — kéo thả truy vấn bảng trung gian.'
      },

      step_2: {
        mcq: [
          {
            question: 'Vì sao quan hệ M:N (nhiều-nhiều) cần BẢNG TRUNG GIAN?',
            options: [
              { id: 'a', text: 'Vì 2 bảng gốc quá lớn', correct: false, explanation: 'Sai — không liên quan kích thước. Vấn đề là KHÔNG thể nhét nhiều giá trị vào 1 ô.' },
              { id: 'b', text: 'Vì không thể nhét nhiều giá trị vào 1 ô; cần 1 bảng riêng chứa từng cặp (player, game)', correct: true, explanation: 'Đúng — M:N → bảng trung gian, mỗi dòng 1 cặp khóa ngoại.' },
              { id: 'c', text: 'Vì SQL không hỗ trợ JOIN', correct: false, explanation: 'Sai — SQL hỗ trợ JOIN; bảng trung gian là về MÔ HÌNH dữ liệu, không phải giới hạn SQL.' },
              { id: 'd', text: 'Để tăng tốc truy vấn', correct: false, explanation: 'Sai — mục đích là biểu diễn đúng M:N, không phải tối ưu tốc độ.' }
            ]
          },
          {
            question: 'Khóa chính của bảng <code>library(player_id, game_id, acquired_date)</code> là gì?',
            options: [
              { id: 'a', text: 'Chỉ player_id', correct: false, explanation: 'Sai — 1 player có nhiều dòng (nhiều game). Không unique.' },
              { id: 'b', text: 'Chỉ game_id', correct: false, explanation: 'Sai — 1 game thuộc nhiều player. Không unique.' },
              { id: 'c', text: '(player_id, game_id) — cặp khóa ghép', correct: true, explanation: 'Đúng — mỗi cặp (player, game) là duy nhất: 1 người chỉ sở hữu 1 game 1 lần.' },
              { id: 'd', text: 'acquired_date', correct: false, explanation: 'Sai — ngày mua có thể trùng giữa nhiều cặp; không định danh.' }
            ]
          }
        ],
        mini_game: {
          type: 'bug_spot',
          title: 'Tìm lỗi bảng trung gian',
          xp: 25,
          code: 'CREATE TABLE library (\n  lib_id INT PRIMARY KEY,\n  player_id INT,\n  game_id INT\n);',
          bugType: 'logic',
          bugs: [
            { line: 2, description: 'Bảng trung gian M:N KHÔNG cần khóa nhân tạo lib_id. PK đúng = composite (player_id, game_id) + 2 FOREIGN KEY trỏ player(p_id) và game(game_id).' }
          ]
        }
      },

      step_3: {
        blocks: [
          { type: 'kw', token: 'SELECT', slot: 'kw-select' },
          { type: 'col', token: 'game_id', slot: 'col-1' },
          { type: 'kw', token: 'FROM', slot: 'kw-from' },
          { type: 'tbl', token: 'library', slot: 'tbl' },
          { type: 'kw', token: 'WHERE', slot: 'kw-where' },
          { type: 'col', token: 'player_id', slot: 'wcol-1' },
          { type: 'op', token: '=', slot: 'op-1' },
          { type: 'val', token: '7', slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____', accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line', placeholder: 'FROM ____', accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line', placeholder: 'WHERE ____ ____ ____', accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE', 'AND', 'OR', 'IN'], multi: true }
        ],
        expected_sql: 'SELECT game_id FROM library WHERE player_id = 7;',
        reveal_hints: {
          'select-line': 'SELECT 1 cột: <strong>game_id</strong>.',
          'from-line': 'FROM <strong>library</strong> (bảng trung gian).',
          'where-line': 'WHERE lọc theo người chơi: <strong>player_id = 7</strong>.'
        }
      },

      step_4: {
        prompt: 'Endpoint thư viện cần liệt kê game của người chơi 9. Viết query lấy mọi <code>game_id</code> mà player 9 sở hữu.',
        starter: "-- Lấy game_id mà player 9 sở hữu\n-- Filter: player_id = 9\nSELECT ____\n  FROM ____\n WHERE ____ = ____;",
        schema: {
          table_name: 'library',
          columns: [
            { name: 'player_id', type: 'INT', key: 'PK+FK' },
            { name: 'game_id', type: 'INT', key: 'PK+FK' },
            { name: 'acquired_date', type: 'DATE', key: '' }
          ],
          data: [
            ['7','101','2025-01-10'],
            ['7','103','2025-02-02'],
            ['9','101','2025-01-15'],
            ['9','105','2025-03-01'],
            ['8','102','2024-11-20'],
            ['8','107','2024-12-05'],
            ['10','101','2025-01-22'],
            ['10','109','2025-02-14'],
            ['11','104','2024-10-30'],
            ['11','111','2025-03-18'],
            ['12','103','2025-01-05'],
            ['12','108','2024-12-25'],
            ['13','110','2025-02-09'],
            ['13','102','2025-03-22'],
            ['14','106','2024-11-11'],
            ['14','112','2025-01-30'],
            ['15','102','2025-02-28'],
            ['15','105','2024-12-12'],
            ['9','107','2025-03-10'],
            ['10','103','2025-02-20'],
            ['11','102','2025-01-08'],
            ['12','109','2025-03-05'],
            ['8','110','2024-10-15'],
            ['13','108','2025-04-01']
          ]
        },
        hints: [
          { level: 1, text: 'Bạn cần <em>1 cột</em> (game_id) từ bảng <code>library</code>, lọc theo player_id = 9.' },
          { level: 2, text: '<code>SELECT game_id FROM library WHERE player_id = 9;</code> — kết quả 2 dòng (101, 105).' },
          { level: 3, text: 'Đừng gộp <code>GROUP BY</code> hay <code>DISTINCT</code> — 1 player có thể sở hữu 1 game nhiều lần (giả định đơn giản).' },
          { level: 4, text: "<code class=\"code\">SELECT game_id FROM library WHERE player_id = 9;</code>" }
        ],
        expected_sql: 'SELECT game_id FROM library WHERE player_id = 9;',
        success_message: 'Hoàn thành M:N & bảng trung gian! Bài 6 (Weak Entity) tiếp theo — thực thể yếu cũng dùng khóa ghép nhưng theo cách khác.',
        xp_reward: 50
      }
    },

    {
      id: 'db_05', index: 6,
      title: 'Weak Entity & Khóa chính tổng hợp',
      subtitle: 'Thực thể yếu — không có khóa riêng, phải ghép FK (cha) + discriminator',
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
            ['400', '2', 'Corpo Gear Pack'],
            ['500', '1', 'Shadow of the Erdtree'],
            ['500', '2', 'Colosseum Update'],
            ['500', '3', "Ranni's Quest Pack"],
            ['600', '1', 'Hell Mode'],
            ['600', '2', 'Olympus Pack'],
            ['600', '3', 'Underworld Map'],
            ['300', '3', 'Witcher School Gear'],
            ['400', '3', 'Night City Expansion'],
            ['700', '1', 'Survivor Pass S1'],
            ['700', '2', 'Survivor Pass S2'],
            ['700', '3', 'Survivor Pass S3'],
            ['800', '1', 'Ranked Mode DLC'],
            ['800', '2', 'Cosmetic Bundle'],
            ['800', '3', 'Winter Event Pack'],
            ['900', '1', 'Story Expansion I'],
            ['900', '2', 'Story Expansion II']
          ]
        }
      },

      achievement: { name: 'Kiến trúc thực thể yếu', desc: 'định danh weak entity bằng khóa ghép' },
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
                concept_cards: [
            {
                  "icon": "fa-link-slash",
                  "title": "Weak Entity — không có khóa riêng",
                  "body": "Bản mở rộng (DLC) \"Gói số 1\" — chưa biết của game nào! DLC là <strong>thực thể yếu</strong>: không tự định danh, phải dựa vào game gốc. Xóa game gốc → các DLC của nó cũng mất (cascading)."
            },
            {
                  "icon": "fa-key",
                  "title": "Partial key + FK = Composite PK",
                  "body": "<strong>Discriminator</strong> <code>dlc_no</code> chỉ phân biệt TRONG 1 game (như \"nhà số 1\" trong 1 khu phố). <strong>FK</strong> <code>ref_game_id</code> trỏ game cha. Khóa chính = GHÉP <code>(ref_game_id, dlc_no)</code>."
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay",
              "body": "Bảng <code>dlc_content</code> KHÔNG có cột <code>dlc_id</code> riêng. Định danh duy nhất cần CẢ 2: <code>ref_game_id</code> + <code>dlc_no</code>."
            }
          ],
                visual: {
          
          diagram: {'type': 'er', 'width': 600, 'height': 280, 'entities': [{'name': 'game', 'columns': [{'name': 'game_id', 'type': 'INT', 'key': 'PK'}, {'name': 'title', 'type': 'VARCHAR'}]}, {'name': 'dlc_content', 'weak': true, 'columns': [{'name': 'ref_game_id', 'type': 'INT', 'key': 'FK,PK'}, {'name': 'dlc_no', 'type': 'INT', 'key': 'PK partial'}, {'name': 'dlc_name', 'type': 'VARCHAR'}]}], 'connectors': [{'from': 'game', 'to': 'dlc_content', 'label': 'có DLC', 'fromCard': '1', 'toCard': 'N'}], 'note': 'dlc_content = WEAK entity (viền đứt) · identifying relationship · PK ghép (ref_game_id, dlc_no)'},
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
            ['400', '2', 'Corpo Gear Pack'],
            ['500', '1', 'Shadow of the Erdtree'],
            ['500', '2', 'Colosseum Update'],
            ['500', '3', "Ranni's Quest Pack"],
            ['600', '1', 'Hell Mode'],
            ['600', '2', 'Olympus Pack'],
            ['600', '3', 'Underworld Map'],
            ['300', '3', 'Witcher School Gear'],
            ['400', '3', 'Night City Expansion'],
            ['700', '1', 'Survivor Pass S1'],
            ['700', '2', 'Survivor Pass S2'],
            ['700', '3', 'Survivor Pass S3'],
            ['800', '1', 'Ranked Mode DLC'],
            ['800', '2', 'Cosmetic Bundle'],
            ['800', '3', 'Winter Event Pack'],
            ['900', '1', 'Story Expansion I'],
            ['900', '2', 'Story Expansion II']
          ]
        },
        mission: 'Lấy <code>dlc_name</code> của gói DLC số 1 thuộc game id 400 — kéo thả SQL với khóa chính tổng hợp.'
      },

      step_2: {
        mcq: [
          {
            question: 'Thực thể yếu (Weak Entity) khác thực thể thường ở điểm nào?',
            options: [
              { id: 'a', text: 'Có nhiều cột hơn các thực thể khác', correct: false, explanation: 'Sai — weak entity thường ÍT cột hơn (chỉ partial key + FK). Số cột không phải đặc trưng phân biệt.' },
              { id: 'b', text: 'Không có Khóa chính độc lập — cần kết hợp với FK từ thực thể cha', correct: true, explanation: 'Đúng — weak entity không có PK riêng; PK phải là composite (FK từ entity cha + partial key vd: dlc_no). VD: dlc_content cần (game_id, dlc_no) để định danh duy nhất.' },
              { id: 'c', text: 'Không thể lưu dữ liệu số, chỉ lưu chuỗi', correct: false, explanation: 'Sai — weak entity có thể lưu INT, VARCHAR, DECIMAL... tất cả kiểu SQL. Đặc trưng là về IDENTITY, không phải data type.' },
              { id: 'd', text: 'Tự động xóa khi database tắt', correct: false, explanation: 'Sai — dữ liệu persistent khi DB tắt (ghi vào disk). Weak entity là khái niệm ER, không liên quan persistence hay session.' }
            ]
          },
          {
            question: 'Trong <code>dlc_content(ref_game_id, dlc_no, dlc_name)</code>, khóa chính là cột nào?',
            options: [
              { id: 'a', text: 'Chỉ <code>ref_game_id</code>', correct: false, explanation: 'Sai — ref_game_id lặp lại cho mỗi DLC của 1 game (1 game có nhiều DLC). Không unique.' },
              { id: 'b', text: 'Chỉ <code>dlc_no</code>', correct: false, explanation: 'Sai — dlc_no = 1 có ở game khác nhau (Elden Ring DLC1 ≠ Hades DLC1). Không unique across games.' },
              { id: 'c', text: '<code>(ref_game_id, dlc_no)</code> — cả 2 cột cộng lại mới định danh duy nhất', correct: true, explanation: 'Đúng — composite key: (game, số DLC) là duy nhất. DLC1 của game101 ≠ DLC1 của game102. Đây là pattern classic của weak entity.' },
              { id: 'd', text: 'Không có khóa chính (bảng lỗi)', correct: false, explanation: 'Sai — mọi bảng chuẩn đều có PK (nguyên tắc entity integrity). Bảng này có composite PK (ref_game_id, dlc_no).' }
            ]
          }
        ],
        mini_game:         {
          "type": "bug_spot",
          "title": "Tìm lỗi trong Weak Entity setup",
          "instruction": "Dòng nào sai trong SQL tạo bảng weak entity DLC?",
          "xp": 25,
          "code": "CREATE TABLE dlc_content (\n  dlc_id INT PRIMARY KEY,\n  game_id INT,\n  dlc_name VARCHAR(100),\n  price DECIMAL(10,2)\n);",
          "bugType": "logic",
          "bugs": [
            {
              "line": 2,
              "description": "Weak entity KHÔNG có PK riêng! PK phải là composite (game_id, dlc_id) — dlc_id chỉ là partial key. Sửa: PRIMARY KEY (game_id, dlc_id) và FOREIGN KEY (game_id) REFERENCES games(game_id)."
            }
          ]
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
          { type: 'val', token: '2',              slot: 'val-1' },
          { type: 'kw',  token: 'AND',            slot: 'kw-and' },
          { type: 'col', token: 'ref_game_id',    slot: 'wcol-2' },
          { type: 'op',  token: '=',              slot: 'op-2' },
          { type: 'val', token: '300',            slot: 'val-2' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____',                                  accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',                                     accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____ ____ ____ ____ ____',      accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE', 'AND', 'OR', 'IN'], multi: true }
        ],
        expected_sql: 'SELECT dlc_name FROM dlc_content WHERE dlc_no = 2 AND ref_game_id = 300;',
        reveal_hints: {
          'select-line': 'SELECT 1 cột: <strong>dlc_name</strong>.',
          'from-line':   'FROM <strong>dlc_content</strong>.',
          'where-line':  "WHERE khóa tổng hợp: <strong>dlc_no = 2 AND ref_game_id = 300</strong> (thiếu AND → trả về nhầm DLC của game khác)."
        }
      },

      step_4: {
        prompt: 'Lấy <code>dlc_name</code> của gói DLC số <strong>2</strong> thuộc game id <strong>300</strong>. Viết query SQL trong editor ở cột giữa.',
        // FIX 2e-C2: context giàu — Bài 4 M:N (bảng trung gian có composite key)
        context: {
          scenario: 'Trong hệ thống DLC store, mỗi game có nhiều gói DLC, và mỗi DLC được đánh số theo <code>dlc_no</code> trong từng game. Bảng <code>dlc_content</code> dùng khóa tổng hợp (<code>ref_game_id</code> + <code>dlc_no</code>) để xác định duy nhất 1 DLC. Cần lấy tên DLC #2 của game id = 300.',
          steps: [
            'SELECT cột <code>dlc_name</code> từ bảng <code>dlc_content</code>.',
            'WHERE dùng 2 điều kiện AND: <code>ref_game_id = 300</code> (lọc theo game) VÀ <code>dlc_no = 2</code> (lọc theo số DLC).',
            'Nếu thiếu AND → trả về nhầm DLC của game khác (vd DLC #2 của game 400 = "Corpo Gear Pack").',
            'Run để verify kết quả chỉ 1 dòng, đúng DLC cần tìm.'
          ],
          hint_explore: 'Khám phá: gõ <code>SELECT * FROM dlc_content</code> rồi Run để thấy nhiều game — mỗi game có nhiều DLC đánh số <code>dlc_no</code> riêng (game 300 có 3 DLC: 1,2,3 · game 900 có 2 DLC: 1,2). Củng cố composite PK: ref_game_id + dlc_no định danh duy nhất 1 DLC.',
          example: {
            question: 'Ví dụ tương tự — lấy <code>dlc_name</code> của <strong>DLC #1 thuộc game 400</strong>:',
            sql: 'SELECT dlc_name FROM dlc_content WHERE dlc_no = 1 AND ref_game_id = 400;',
            sample_output: '→ 1 dòng: <code>Phantom Liberty</code>'
          },
          expected: 'Bảng kết quả 1 dòng × 1 cột: <code>Blood and Wine</code> — DLC #2 của game 300. Phải đúng 1 dòng — nếu trả về nhiều dòng, kiểm tra WHERE có đủ 2 điều kiện AND chưa.'
        },
        starter: "-- Lấy dlc_name của DLC #2 thuộc game id 300\n-- Filter: dlc_no = 2 AND ref_game_id = 300\nSELECT \n  FROM \n WHERE  = \n   AND  = ;\n",
        schema: {
          table_name: 'dlc_content',
          columns: [
            { name: 'ref_game_id',  type: 'INT',     key: 'PK+FK', icon: '🔗' },
            { name: 'dlc_no',       type: 'INT',     key: 'PK',    icon: '🔑' },
            { name: 'dlc_name',     type: 'VARCHAR', key: '',      icon: '🎁' }
          ],
          data: [
            ['300', '1', 'Hearts of Stone'],
            ['300', '2', 'Blood and Wine'],
            ['400', '1', 'Phantom Liberty'],
            ['400', '2', 'Corpo Gear Pack'],
            ['500', '1', 'Shadow of the Erdtree'],
            ['500', '2', 'Colosseum Update'],
            ['500', '3', "Ranni's Quest Pack"],
            ['600', '1', 'Hell Mode'],
            ['600', '2', 'Olympus Pack'],
            ['600', '3', 'Underworld Map'],
            ['300', '3', 'Witcher School Gear'],
            ['400', '3', 'Night City Expansion'],
            ['700', '1', 'Survivor Pass S1'],
            ['700', '2', 'Survivor Pass S2'],
            ['700', '3', 'Survivor Pass S3'],
            ['800', '1', 'Ranked Mode DLC'],
            ['800', '2', 'Cosmetic Bundle'],
            ['800', '3', 'Winter Event Pack'],
            ['900', '1', 'Story Expansion I'],
            ['900', '2', 'Story Expansion II']
          ]
        },
        expected_sql: 'SELECT dlc_name FROM dlc_content WHERE dlc_no = 2 AND ref_game_id = 300;',
        hints: [{'level': 1, 'text': 'Loại trừ đáp án <code>SELECT dlc_name FROM dlc_content WHERE dlc_no = 2;</code> — Sai: thiếu ref_game_id nên trả về cả 2 dòng DLC #2 (của game 300 + 400).'}, {'level': 2, 'text': 'Loại trừ đáp án <code>SELECT dlc_name FROM dlc_content WHERE ref_game_id = 300;</code> — Sai: ref_game_id chỉ đủ để biết là DLC của game 300, nhưng không định danh được DLC #1 hay #2 → trả về cả 2 dòng.'}, {'level': 3, 'text': 'Loại trừ đáp án <code>SELECT dlc_name FROM dlc_content WHERE dlc_name = </code> — Sai logic: lọc theo name (không phải PK) sẽ đúng trong data này nhưng phá vỡ tính định danh — không dùng tên làm định danh được.'}, {'level': 4, 'text': '<code class="code">SELECT dlc_name FROM dlc_content WHERE dlc_no = 2 AND ref_game_id = 300;</code>'}],
        success_message: 'Bài 7 tiếp theo — chuyển ER Diagram → bảng quan hệ vật lý (7 quy tắc mapping chuẩn).',
        xp_reward: 30
      }
    },

    {
      id: 'db_06', index: 7,
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
            ['101','Elden Ring',         '10','Soulslike'],
            ['102','God of War',         '20','Action'],
            ['103','Hades',              '30','Roguelike'],
            ['104','Stardew Valley',     '40','Cozy'],
            ['105','Bastion',            '30','Action-RPG'],
            ['106','Transistor',         '30','Action-RPG'],
            ['107','Pyre',               '30','RPG'],
            ['108','Hades II',           '30','Roguelike'],
            ['109','Dark Souls III',     '10','Soulslike'],
            ['110','Sekiro',             '10','Action'],
            ['111','Bloodborne',         '10','Soulslike'],
            ['112','God of War Ragnarok','20','Action'],
            ['113','The Last of Us',     '20','Action'],
            ['114','The Witcher 3',      '60','RPG'],
            ['115','Cyberpunk 2077',     '60','RPG'],
            ['116','Animal Crossing',    '50','Cozy'],
            ['117','Splatoon 3',         '50','Shooter'],
            ['118','Zelda: TOTK',        '50','Adventure'],
            ['119','Stardew Multiplayer','40','Cozy'],
            ['120','Mario Odyssey',      '50','Platformer'],
            ['121','Demon Souls',        '10','Soulslike'],
            ['122','Returnal',           '20','Roguelike']
          ]
        }
      },

      achievement: { name: 'Dịch giả ER', desc: 'ánh xạ ER sang bảng' },
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
                intro: '<strong>Trước</strong>: bạn có 1 bản vẽ ER trên giấy với 12 entity, 18 quan hệ, 30 attribute. <strong>Sau</strong>: bạn cần chuyển thành SQL DDL. Có 1 quy tắc mapping chuẩn, 7 trường hợp. Nắm vững 7 quy tắc này = 30 phút làm xong thay vì 3 ngày mò mẫm.',
concept_cards: [
            {
                  "icon": "fa-arrow-right-arrow-left",
                  "title": "ER → Bảng: 1 quy tắc, 7 trường hợp",
                  "body": "<strong>Trước</strong>: bạn vẽ ER với entity, attribute, relationship. <strong>Sau</strong>: bạn có schema quan hệ với table, column, FK. Mọi ER concept đều ánh xạ được — chỉ cần nhớ 7 quy tắc mapping. Bài này tóm gọn tất cả trong 1 bảng."
            },
            {
                  "icon": "fa-diagram-project",
                  "title": "Bảng 7 quy tắc Mapping",
                  "body": "<strong>Strong entity</strong> → table có PK. <strong>Weak entity</strong> → table có FK + partial key = composite PK. <strong>1:1</strong> → FK ở 1 bên. <strong>1:N</strong> → FK ở bên N. <strong>M:N</strong> → bảng riêng. <strong>Multivalued</strong> → bảng riêng. <strong>Derived</strong> → KHÔNG lưu. Hết!",
                  "variant": "quote",
                  "source": "Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 6.7 — Mapping E-R to Relational"
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "ER có Game (entity mạnh) + Publisher (entity mạnh) + quan hệ publishes (1:N — 1 publisher xuất bản nhiều game)."
            }
          ],
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
            ['101','Elden Ring',         '10','Soulslike'],
            ['102','God of War',         '20','Action'],
            ['103','Hades',              '30','Roguelike'],
            ['104','Stardew Valley',     '40','Cozy'],
            ['105','Bastion',            '30','Action-RPG'],
            ['106','Transistor',         '30','Action-RPG'],
            ['107','Pyre',               '30','RPG'],
            ['108','Hades II',           '30','Roguelike'],
            ['109','Dark Souls III',     '10','Soulslike'],
            ['110','Sekiro',             '10','Action'],
            ['111','Bloodborne',         '10','Soulslike'],
            ['112','God of War Ragnarok','20','Action'],
            ['113','The Last of Us',     '20','Action'],
            ['114','The Witcher 3',      '60','RPG'],
            ['115','Cyberpunk 2077',     '60','RPG'],
            ['116','Animal Crossing',    '50','Cozy'],
            ['117','Splatoon 3',         '50','Shooter'],
            ['118','Zelda: TOTK',        '50','Adventure'],
            ['119','Stardew Multiplayer','40','Cozy'],
            ['120','Mario Odyssey',      '50','Platformer'],
            ['121','Demon Souls',        '10','Soulslike'],
            ['122','Returnal',           '20','Roguelike']
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
                ['40', 'ConcernedApe'],
                ['50', 'Nintendo'],
                ['60', 'CD Projekt']
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
              { id: 'a', text: 'Đặt FK ở phía "1" (bảng bên nhiều quan hệ)', correct: false, explanation: 'Sai — phía 1 có nhiều records bên N (vd: 1 game có N DLC). Nếu đặt FK ở phía 1, mỗi record phía 1 chỉ giữ 1 FK → mất quan hệ N (không biết game nào có DLC nào).' },
              { id: 'b', text: 'Đặt FK ở phía "N" (bảng chứa nhiều record ứng với 1 record bên kia)', correct: true, explanation: 'Đúng — phía N có nhiều records per 1 (vd: N DLC của 1 game → mỗi DLC có game_id FK). Mỗi record N giữ 1 FK trỏ về đúng 1 record phía 1.' },
              { id: 'c', text: 'Tạo bảng trung gian junction table', correct: false, explanation: 'Sai — junction table dùng cho quan hệ M:N, không phải 1:N. Dùng junction cho 1:N = overkill (1 bảng thừa, query phức tạp hơn).' },
              { id: 'd', text: 'Không cần FK vì quan hệ đã rõ trong ER diagram', correct: false, explanation: 'Sai — ER diagram chỉ là design tool. Khi implement vào relational, FK là cách enforce quan hệ. Không có FK = không có constraint ở DB level.' }
            ]
          },
          {
            question: 'Multi-valued attribute (vd: 1 user có nhiều số điện thoại) nên mapping thế nào?',
            options: [
{ id: 'a', text: 'Schema A (vi phạm 1NF — comma-separated)', correct: false, format: 'diagram', diagram: '┌─────────┬────────────────────────┐\n│ user_id │ phones                 │\n├─────────┼────────────────────────┤\n│    1    │ 0901-xxx, 0902-yyy     │\n│    2    │ 0903-aaa               │\n└─────────┴────────────────────────┘', explanation: 'Sai — multivalue trong 1 cột = vi phạm 1NF. Query rất khó (WHERE phones LIKE \'0901%\' sẽ miss phones = "0901-xxx, 0902-yyy").' },
          { id: 'b', text: 'Schema B (chuẩn 1NF — bảng riêng)', correct: true, format: 'diagram', diagram: '┌─────────┬────────────┐     ┌─────────┬────────────┐\n│ user_id │ name       │     │ user_id │ phone      │\n├─────────┼────────────┤     ├─────────┼────────────┤\n│    1    │ Alice      │     │    1    │ 0901-xxx   │\n│    2    │ Bob        │     │    1    │ 0902-yyy   │\n└─────────┴────────────┘     │    2    │ 0903-aaa   │\n                              └─────────┴────────────┘', explanation: 'Đúng — tách thành bảng phụ user_phone (user_id FK, phone). Mỗi số là 1 dòng → atomic, đạt 1NF. Query dễ: WHERE phone = \'0901...\'.' },
          { id: 'c', text: 'Schema C (nhiều cột — giới hạn)', correct: false, format: 'diagram', diagram: '┌─────────┬──────────┬──────────┬──────────┐\n│ user_id │ phone_1  │ phone_2  │ phone_3  │\n├─────────┼──────────┼──────────┼──────────┤\n│    1    │ 0901-xxx │ 0902-yyy │ NULL     │\n│    2    │ 0903-aaa │ NULL     │ NULL     │\n└─────────┴──────────┴──────────┴──────────┘', explanation: 'Sai — giới hạn số phone (max N?). User có số phone khác nhau (Alice 2 số, Bob 5 số). Cứng nhắc + lãng phí NULL cho user ít phone.' },
          { id: 'd', text: 'Schema D (bỏ qua — mất data)', correct: false, format: 'diagram', diagram: '┌─────────┬────────┐\n│ user_id │ name   │\n├─────────┼────────┤\n│    1    │ Alice  │\n│    2    │ Bob    │\n└─────────┴────────┘\n\n⚠️ Mất toàn bộ số điện thoại!', explanation: 'Sai — mất dữ liệu quan trọng. Mỗi attribute trong ER đều phải được reflect trong relational model (theo mapping rules).' }
            ]
          }
        ],
        mini_game:         {
          "type": "match",
          "title": "Nối ER element → Relational",
          "instruction": "Mỗi thành phần ER ánh xạ thành gì trong bảng quan hệ?",
          "xp": 25,
          "pairs": [
            {
              "left": "Strong Entity Set",
              "leftId": "e1",
              "rightId": "r1",
              "right": {
                "id": "r1",
                "label": "Table + PK riêng"
              }
            },
            {
              "left": "Weak Entity Set",
              "leftId": "e2",
              "rightId": "r2",
              "right": {
                "id": "r2",
                "label": "Table + FK + partial key = composite PK"
              }
            },
            {
              "left": "M:N Relationship",
              "leftId": "e3",
              "rightId": "r3",
              "right": {
                "id": "r3",
                "label": "Junction table + 2 FK"
              }
            },
            {
              "left": "1:N Relationship",
              "leftId": "e4",
              "rightId": "r4",
              "right": {
                "id": "r4",
                "label": "FK ở phía N"
              }
            }
          ],
          "solution": {
            "e1": "r1",
            "e2": "r2",
            "e3": "r3",
            "e4": "r4"
          }
        }
      },

      step_3: {
        mission: 'Lấy <code>title</code> và <code>genre</code> của tất cả game do <code>Supergiant</code> xuất bản — kéo thả SQL, JOIN qua FK.',
        blocks: [
          { type: 'kw',  token: 'SELECT',         slot: 'kw-select' },
          { type: 'col', token: 'title',          slot: 'col-1' },
          { type: 'col', token: 'genre',          slot: 'col-2' },
          { type: 'kw',  token: 'FROM',           slot: 'kw-from' },
          { type: 'tbl', token: 'game',           slot: 'tbl' },
          { type: 'kw',  token: 'JOIN',           slot: 'kw-join' },
          { type: 'tbl', token: 'publisher',      slot: 'tbl2' },
          { type: 'kw',  token: 'ON',             slot: 'kw-on' },
          { type: 'col', token: 'game.pub_id = publisher.id', slot: 'col-on' },
          { type: 'kw',  token: 'WHERE',          slot: 'kw-where' },
          { type: 'col', token: 'publisher.name', slot: 'wcol-1' },
          { type: 'op',  token: '=',              slot: 'op-1' },
          { type: 'val', token: "'Supergiant'",   slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____ , ____',              accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____ JOIN ____ ON ____',     accepts: ['kw', 'tbl', 'col'], acceptedKeywords: ['FROM', 'JOIN', 'ON'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',            accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE', 'AND', 'OR', 'IN'], multi: true }
        ],
        expected_sql: "SELECT title, genre FROM game JOIN publisher ON game.pub_id = publisher.id WHERE publisher.name = 'Supergiant';",
        reveal_hints: {
          'select-line': 'SELECT 2 cột: <strong>title</strong> và <strong>genre</strong>.',
          'from-line':   'FROM <strong>game</strong> JOIN <strong>publisher</strong> ON <strong>game.pub_id = publisher.id</strong> — FK ánh xạ từ quan hệ 1:N.',
          'where-line':  "WHERE lọc hãng: <strong>publisher.name = 'Supergiant'</strong>."
        }
      },

      step_4: {
        prompt: 'Lấy <code>title</code> và <code>genre</code> của mọi game do <code>Supergiant</code> xuất bản. Viết query SQL trong editor ở cột giữa.',
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
            ['101','Elden Ring',         'Soulslike', '10'],
            ['102','God of War',         'Action',    '20'],
            ['103','Hades',              'Roguelike', '30'],
            ['104','Stardew Valley',     'Cozy',      '40'],
            ['105','Bastion',            'Action-RPG','30'],
            ['106','Transistor',         'Action-RPG','30'],
            ['107','Pyre',               'RPG',       '30'],
            ['108','Hades II',           'Roguelike', '30'],
            ['109','Dark Souls III',     'Soulslike', '10'],
            ['110','Sekiro',             'Action',    '10'],
            ['111','Bloodborne',         'Soulslike', '10'],
            ['112','God of War Ragnarok','Action',    '20'],
            ['113','The Last of Us',     'Action',    '20'],
            ['114','The Witcher 3',      'RPG',       '60'],
            ['115','Cyberpunk 2077',     'RPG',       '60'],
            ['116','Animal Crossing',    'Cozy',      '50'],
            ['117','Splatoon 3',         'Shooter',   '50'],
            ['118','Zelda: TOTK',        'Adventure', '50'],
            ['119','Stardew Multiplayer','Cozy',      '40'],
            ['120','Mario Odyssey',      'Platformer','50'],
            ['121','Demon Souls',        'Soulslike', '10'],
            ['122','Returnal',           'Roguelike', '20']
          ]
        },
        // PHASE 4A-E1: related_schemas = COPY từ step_1.related_tables (canonical, single source of truth).
        // Lý do: Bài 7 expected_sql = JOIN publisher, mà step_4 chỉ có 1 bảng game → JOIN ra 0 rows.
        // Single-source rule: bài nào có bảng phụ ở step_1/step_3 → copy; không bịa data mới.
        // FK check: pub_id ∈ {10,20,30,40,50,60} = publisher.id (verified Bài 7).
        // Count check: WHERE publisher.name='Supergiant' (=pub_id=30) → 5 rows (Hades/103, Bastion/105, Transistor/106, Pyre/107, Hades II/108).
        related_schemas: [
          {
            table_name: 'publisher',
            columns: [
              { name: 'id',   type: 'INT',     key: 'PK' },
              { name: 'name', type: 'VARCHAR', key: '' }
            ],
            data: [
              ['10', 'FromSoftware'],
              ['20', 'Sony Santa Monica'],
              ['30', 'Supergiant'],
              ['40', 'ConcernedApe'],
              ['50', 'Nintendo'],
              ['60', 'CD Projekt']
            ]
          }
        ],
        expected_sql: "SELECT title, genre FROM game JOIN publisher ON game.pub_id = publisher.id WHERE publisher.name = 'Supergiant';",
        hints: [
          { level: 1, text: 'Cần 2 cột: <code>title</code> và <code>genre</code>.' },
          { level: 2, text: 'Bảng <code>game</code> JOIN <code>publisher</code> ON <code>game.pub_id = publisher.id</code>.' },
          { level: 3, text: "WHERE <code>publisher.name = 'Supergiant'</code>." },
          { level: 4, text: "<code class=\"code\">SELECT title, genre FROM game JOIN publisher ON game.pub_id = publisher.id WHERE publisher.name = 'Supergiant';</code>" }
        ],
        success_message: 'Xuất sắc! Bạn đã nắm vững quy tắc mapping ER → Bảng quan hệ. Bài 8 sẽ dùng FD để phát hiện dư thừa trong bảng đã mapping xong.',
        xp_reward: 35
      }
    },

    {
      id: 'db_07', index: 8,
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
            ['55', 'Elden Ring',     'FromSoftware', 'Japan'],
            ['56', 'Bloodborne',     'FromSoftware', 'Japan'],
            ['57', 'Sekiro',         'FromSoftware', 'Japan'],
            ['58', 'Dark Souls III', 'FromSoftware', 'Japan'],
            ['88', 'Portal 2',       'Valve',        'USA'],
            ['89', 'Half-Life 2',    'Valve',        'USA'],
            ['90', 'Dota 2',         'Valve',        'USA'],
            ['91', 'Counter-Strike 2','Valve',       'USA'],
            ['92', 'Left 4 Dead 2',  'Valve',        'USA'],
            ['60', 'Mario Odyssey',  'Nintendo',     'Japan'],
            ['61', 'Zelda BOTW',     'Nintendo',     'Japan'],
            ['62', 'Splatoon 3',     'Nintendo',     'Japan'],
            ['70', 'The Witcher 3',  'CD Projekt',   'Poland'],
            ['71', 'Cyberpunk 2077', 'CD Projekt',   'Poland'],
            ['80', 'Hades',          'Supergiant',   'USA'],
            ['81', 'Bastion',        'Supergiant',   'USA'],
            ['82', 'Transistor',     'Supergiant',   'USA'],
            ['95', 'God of War',     'Sony',         'USA'],
            ['96', 'The Last of Us', 'Sony',         'USA'],
            ['97', 'Spider-Man',     'Sony',         'USA'],
            ['72', 'Gwent',          'CD Projekt',   'Poland'],
            ['63', 'Mario Kart 8',   'Nintendo',     'Japan']
          ]
        }
      },

      achievement: { name: 'Thợ săn phụ thuộc', desc: 'phát hiện FD X→Y' },
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
                intro: 'Bạn được giao maintain database cho 1 startup game. Table <code>games</code> hiện tại có 5000 dòng, mỗi dòng lưu <code>studio_name</code> + <code>studio_country</code>. 1 sáng đẹp trời, CEO bảo: <em>"Đổi tên Sony Japan thành Sony Japan Holdings"</em>. Bạn UPDATE... mất 4 giờ. Quên 1 dòng. Dữ liệu mâu thuẫn. Bài này dạy <strong>Functional Dependency</strong>.',
concept_cards: [
            {
                  "icon": "fa-arrows-to-dot",
                  "title": "Redundancy — Cùng thông tin, nhiều chỗ",
                  "body": "Bạn có bảng 1000 game. Mỗi game lưu <code>studio_name</code> + <code>studio_country</code>. Studio \"Sony\" → \"Japan\" lặp 50 lần. Sửa \"Japan\" thành \"Nhật Bản\" → UPDATE 50 dòng. Quên 1 dòng? <strong>Dữ liệu mâu thuẫn</strong>. Bạn có thấy vấn đề không?"
            },
            {
                  "icon": "fa-arrows-left-right",
                  "title": "Functional Dependency (FD)",
                  "body": "Quy tắc <code>X → Y</code>: biết X thì xác định Y duy nhất. <code>game_id → title, genre, price</code> (mọi FD đều từ PK). Nhưng <code>studio_name → studio_country</code> cũng là FD — đây là manh mối để tách bảng. Cứ tìm FD mà PK không liên quan → tách ra."
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "Bạn phát hiện FD: studio_name → st_country."
            }
          ],
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
            ['55', 'Elden Ring',     'FromSoftware', 'Japan'],
            ['56', 'Bloodborne',     'FromSoftware', 'Japan'],
            ['57', 'Sekiro',         'FromSoftware', 'Japan'],
            ['58', 'Dark Souls III', 'FromSoftware', 'Japan'],
            ['88', 'Portal 2',       'Valve',        'USA'],
            ['89', 'Half-Life 2',    'Valve',        'USA'],
            ['90', 'Dota 2',         'Valve',        'USA'],
            ['91', 'Counter-Strike 2','Valve',       'USA'],
            ['92', 'Left 4 Dead 2',  'Valve',        'USA'],
            ['60', 'Mario Odyssey',  'Nintendo',     'Japan'],
            ['61', 'Zelda BOTW',     'Nintendo',     'Japan'],
            ['62', 'Splatoon 3',     'Nintendo',     'Japan'],
            ['70', 'The Witcher 3',  'CD Projekt',   'Poland'],
            ['71', 'Cyberpunk 2077', 'CD Projekt',   'Poland'],
            ['80', 'Hades',          'Supergiant',   'USA'],
            ['81', 'Bastion',        'Supergiant',   'USA'],
            ['82', 'Transistor',     'Supergiant',   'USA'],
            ['95', 'God of War',     'Sony',         'USA'],
            ['96', 'The Last of Us', 'Sony',         'USA'],
            ['97', 'Spider-Man',     'Sony',         'USA'],
            ['72', 'Gwent',          'CD Projekt',   'Poland'],
            ['63', 'Mario Kart 8',   'Nintendo',     'Japan']
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
              { id: 'a', text: 'Cột game_id xuất hiện ở tất cả các dòng', correct: false, explanation: 'Sai — PK (game_id) bắt buộc xuất hiện ở mỗi dòng — đó là identity, không phải redundancy. Redundancy là giá trị LẶP LẠI không cần thiết.' },
              { id: 'b', text: 'Cùng một studio + country lặp lại ở nhiều dòng, dù đã biết qua FD studio_name → st_country', correct: true, explanation: 'Đúng — FromSoftware + Japan lặp 2 dòng, Valve + USA lặp 1 dòng. Mỗi lần insert 1 game FromSoftware mới = phải nhập lại "Japan" → dễ typo (Japan thành "Japna").' },
              { id: 'c', text: 'Bảng có quá nhiều cột so với cần thiết', correct: false, explanation: 'Sai — số cột không liên quan redundancy. Redundancy là giá trị lặp lại, không phải số cột. Bảng 100 cột không có redundancy nếu mỗi giá trị unique.' },
              { id: 'd', text: 'Dòng dữ liệu bị thiếu cột', correct: false, explanation: 'Sai — thiếu cột = NULL. Redundancy là thừa dữ liệu (lặp), không phải thiếu. Đây là 2 vấn đề NGƯỢC nhau.' }
            ]
          },
          {
            question: 'Phụ thuộc hàm <code>studio_name → st_country</code> nghĩa là:',
            options: [
              { id: 'a', text: 'Mỗi studio có thể ở nhiều quốc gia', correct: false, explanation: 'Sai — nếu 1 studio ở N quốc gia, FD ngược lại (country → studio) mới đúng. FD studio → country = 1 studio ở ĐÚNG 1 country.' },
              { id: 'b', text: 'Biết tên studio thì xác định được duy nhất quốc gia của studio đó', correct: true, explanation: 'Đúng — studio_name làm determinant (X bên trái FD), mỗi studio_name xác định DUY NHẤT 1 st_country. Đó chính là FD.' },
              { id: 'c', text: 'Biết tên game thì biết được studio', correct: false, explanation: 'Sai — đó là FD game_id → studio_name (khác). Câu này hỏi về studio_name → st_country, không phải game → studio.' },
              { id: 'd', text: 'Country quyết định studio', correct: false, explanation: 'Sai — country → studio là FD NGƯỢC. FromSoftware (Japan) ≠ Sony (Japan) cùng country nhưng khác studio. Country KHÔNG quyết định studio.' }
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
        mission: 'Tìm tất cả <code>game_name</code> của studio <em>Valve</em> — kéo thả SQL từ bảng dư thừa.',
        blocks: [
          { type: 'kw',  token: 'SELECT',         slot: 'kw-select' },
          { type: 'col', token: 'game_name',      slot: 'col-1' },
          { type: 'kw',  token: 'FROM',           slot: 'kw-from' },
          { type: 'tbl', token: 'game_studio_combined', slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',          slot: 'kw-where' },
          { type: 'col', token: 'studio_name',    slot: 'wcol-1' },
          { type: 'op',  token: '=',              slot: 'op-1' },
          { type: 'val', token: "'Valve'",        slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____',            accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',              accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ ____ ____',   accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE', 'AND', 'OR', 'IN'], multi: true }
        ],
        expected_sql: "SELECT game_name FROM game_studio_combined WHERE studio_name = 'Valve';",
        reveal_hints: {
          'select-line': 'SELECT 1 cột: <strong>game_name</strong>.',
          'from-line':   'FROM bảng đang dư thừa: <strong>game_studio_combined</strong>.',
          'where-line':  "WHERE lọc studio: <strong>studio_name = 'Valve'</strong>."
        }
      },

      step_4: {
        prompt: 'Tìm tất cả <code>game_name</code> của studio <em>Valve</em> (USA). Viết query SQL trong editor ở cột giữa.',

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
            ['55', 'Elden Ring',     'FromSoftware', 'Japan'],
            ['56', 'Bloodborne',     'FromSoftware', 'Japan'],
            ['57', 'Sekiro',         'FromSoftware', 'Japan'],
            ['58', 'Dark Souls III', 'FromSoftware', 'Japan'],
            ['88', 'Portal 2',       'Valve',        'USA'],
            ['89', 'Half-Life 2',    'Valve',        'USA'],
            ['90', 'Dota 2',         'Valve',        'USA'],
            ['91', 'Counter-Strike 2','Valve',       'USA'],
            ['92', 'Left 4 Dead 2',  'Valve',        'USA'],
            ['60', 'Mario Odyssey',  'Nintendo',     'Japan'],
            ['61', 'Zelda BOTW',     'Nintendo',     'Japan'],
            ['62', 'Splatoon 3',     'Nintendo',     'Japan'],
            ['70', 'The Witcher 3',  'CD Projekt',   'Poland'],
            ['71', 'Cyberpunk 2077', 'CD Projekt',   'Poland'],
            ['80', 'Hades',          'Supergiant',   'USA'],
            ['81', 'Bastion',        'Supergiant',   'USA'],
            ['82', 'Transistor',     'Supergiant',   'USA'],
            ['95', 'God of War',     'Sony',         'USA'],
            ['96', 'The Last of Us', 'Sony',         'USA'],
            ['97', 'Spider-Man',     'Sony',         'USA'],
            ['72', 'Gwent',          'CD Projekt',   'Poland'],
            ['63', 'Mario Kart 8',   'Nintendo',     'Japan']
          ]
        },
        expected_sql: "SELECT game_name FROM game_studio_combined WHERE studio_name = 'Valve';",
        hints: [{'level': 1, 'text': 'Loại trừ <code>WHERE st_country = \'USA\'</code> — Sai logic: WHERE theo country thay vì studio_name. Vẫn đúng trong data này nhưng không định danh được studio cụ thể.'}, {'level': 2, 'text': 'Loại trừ <code>SELECT * FROM game_studio_combined;</code> — Sai: lấy hết cột (*) và KHÔNG WHERE → trả cả 22 dòng của 6 studio.'}, {'level': 3, 'text': 'Loại trừ <code>WHERE game_name = ...</code> — Sai: WHERE theo name (không phải PK) → chỉ trả 1 dòng, thiếu các game khác của Valve.'}, {'level': 4, 'text': '<code class="code">SELECT game_name FROM game_studio_combined WHERE studio_name = \'Valve\';</code>'}],
        success_message: 'Bạn đã hiểu Redundancy + FD. Bài 9 sẽ dùng FD để tách bảng thành 1NF — mỗi ô chỉ 1 giá trị nguyên tử.',
        xp_reward: 30
      }
    },

    {
      id: 'db_08', index: 9,
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
            ['S03', 'Sara', '0904-444-444, 0905-555-555, 0906-666-666'],
            ['S04', 'Nam',  '0907-777-777'],
            ['S05', 'Lan',  '0908-888-888, 0909-999-999'],
            ['S06', 'Hùng', '0910-101-010'],
            ['S07', 'Mai',  '0911-111-222, 0912-222-333'],
            ['S08', 'Tú',   '0913-333-444'],
            ['S09', 'Linh', '0914-444-555, 0915-555-666, 0916-666-777'],
            ['S10', 'Phúc', '0917-777-888'],
            ['S11', 'Quân', '0918-888-999, 0919-999-000'],
            ['S12', 'Hà',   '0920-202-020'],
            ['S13', 'Đạt',  '0921-121-212'],
            ['S14', 'Vy',   '0922-232-323, 0923-343-434'],
            ['S15', 'Khoa', '0924-454-545'],
            ['S16', 'Trang','0925-565-656'],
            ['S17', 'Bảo',  '0926-676-767, 0927-787-878'],
            ['S18', 'Ngọc', '0928-898-989'],
            ['S19', 'Sơn',  '0929-909-090'],
            ['S20', 'Thảo', '0930-010-101, 0931-121-212']
          ]
        }
      },

      achievement: { name: 'Nguyên tử hóa', desc: '1NF — mỗi ô một giá trị' },
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
                intro: 'Điều gì xảy ra khi 1 sinh viên đăng ký có 3 số điện thoại? Bạn lưu vào 1 cột <code>phones = "0901, 0902, 0903"</code>? Tưởng đâu vào đó... cho đến khi PM bảo <em>"Tìm SV có số 0902"</em>. Query <code>LIKE \'%0902%\'</code> chạy 10 giây, miss các format <code>"0901;0902"</code>. Bài này dạy <strong>1NF</strong> + Atomic Domain.',
concept_cards: [
            {
                  "icon": "fa-atom",
                  "title": "1NF — Mỗi cell 1 giá trị",
                  "body": "Giống <strong>hộp thư</strong> của bạn: mỗi hộp chỉ chứa 1 lá thư, không nhét cả xấp vào. Cell trong DB cũng vậy — 1 giá trị nguyên tử, không list, không JSON. Muốn lưu nhiều số điện thoại? <em>Tách thành nhiều dòng</em> trong bảng phụ."
            },
            {
                  "icon": "fa-list",
                  "title": "Multivalued vs Composite — 2 cái bẫy 1NF",
                  "body": "<strong>Multivalued</strong>: 1 cell chứa N giá trị cùng loại (vd: <code>phones = \"0901,0902\"</code>) → tách thành nhiều dòng. <strong>Composite</strong>: 1 cell chứa nhiều mảnh khác loại (vd: <code>address = \"Q1, HCM\"</code>) → tách thành nhiều cột. Cùng vi phạm 1NF nhưng fix khác nhau."
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "Nếu muốn tìm TẤT CẢ sinh viên có số \"0901-xxx\" — bạn không thể WHERE phones = \\'0901-xxx\\' (vì ô chứa \"0901-xxx, 0902-yyy\" không bằng)."
            }
          ],
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
            ['S03', 'Sara', '0904-444-444, 0905-555-555, 0906-666-666'],
            ['S04', 'Nam',  '0907-777-777'],
            ['S05', 'Lan',  '0908-888-888, 0909-999-999'],
            ['S06', 'Hùng', '0910-101-010'],
            ['S07', 'Mai',  '0911-111-222, 0912-222-333'],
            ['S08', 'Tú',   '0913-333-444'],
            ['S09', 'Linh', '0914-444-555, 0915-555-666, 0916-666-777'],
            ['S10', 'Phúc', '0917-777-888'],
            ['S11', 'Quân', '0918-888-999, 0919-999-000'],
            ['S12', 'Hà',   '0920-202-020'],
            ['S13', 'Đạt',  '0921-121-212'],
            ['S14', 'Vy',   '0922-232-323, 0923-343-434'],
            ['S15', 'Khoa', '0924-454-545'],
            ['S16', 'Trang','0925-565-656'],
            ['S17', 'Bảo',  '0926-676-767, 0927-787-878'],
            ['S18', 'Ngọc', '0928-898-989'],
            ['S19', 'Sơn',  '0929-909-090'],
            ['S20', 'Thảo', '0930-010-101, 0931-121-212']
          ]
        },
        mission: 'Tách cột <code>phones</code> (multivalued) thành bảng riêng <code>student_phone(student_id, phone)</code> để đạt 1NF — mỗi ô chỉ chứa 1 giá trị.'
      },

        step_2: {
        mcq: [
          {
            question: "1NF (Dạng chuẩn 1) yêu cầu điều gì?",
            options: [
              { id: "a", text: "Mỗi cell chỉ chứa 1 giá trị nguyên tử (atomic)", correct: true, explanation: "Đúng — 1NF yêu cầu mỗi ô = 1 giá trị không chia nhỏ được. '0901-111, 0902-222' = 2 giá trị trong 1 ô = vi phạm." },
              { id: "b", text: "Bảng phải có ít nhất 3 cột", correct: false, explanation: "Sai — 1NF không quan tâm số cột. Bảng 2 cột vẫn OK nếu atomic." },
              { id: "c", text: "Mỗi dòng phải có giá trị NULL", correct: false, explanation: "Sai — NULL là thiếu dữ liệu. 1NF không bắt buộc NULL." },
              { id: "d", text: "Bảng phải có đúng 1 khóa chính", correct: false, explanation: "Sai — 1NF không quy định số PK. Composite key vẫn OK (vd: enrollment(student_id, course_id))." }
            ]
          },
          {
            question: "Bảng <code>student_raw</code> có cột <code>phones = \"0901-111, 0902-222\"</code>. Cách fix đúng?",
            options: [
              { id: "a", text: "Tách thành bảng riêng (1 dòng / số điện thoại)", correct: true, explanation: "Đúng — tách phones thành bảng student_phone với cột phone riêng. Mỗi phone 1 dòng → atomic, đạt 1NF." },
              { id: "b", text: "Đổi VARCHAR thành TEXT", correct: false, explanation: "Sai — TEXT chỉ tăng dung lượng lưu, không fix multivalued. phones vẫn chứa NHIỀU giá trị." },
              { id: "c", text: "Thêm cột phone2, phone3", correct: false, explanation: "Sai — thêm cột giới hạn số phone (max 3?). Mỗi user có số phone khác nhau. Tách bảng là giải pháp đúng." },
              { id: "d", text: "Không cần fix", correct: false, explanation: "Sai — multivalued vi phạm 1NF rõ ràng. Truy vấn phones cụ thể rất khó (WHERE phones LIKE '0901%' = sai). Phải fix." }
            ]
          }
        ],
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
        mini_game:         {
          "type": "order",
          "title": "Sắp xếp bước xử lý vi phạm 1NF",
          "instruction": "Kéo thả đúng thứ tự fix 1NF khi gặp multivalued.",
          "xp": 20,
          "items": [
            {
              "id": "s1",
              "label": "Bước 1: Phát hiện cột multivalued (phones chứa \"0901, 0902\")"
            },
            {
              "id": "s2",
              "label": "Bước 2: Tạo bảng con (student_phone) với PK riêng"
            },
            {
              "id": "s3",
              "label": "Bước 3: Di chuyển multivalued data sang bảng con"
            },
            {
              "id": "s4",
              "label": "Bước 4: Thêm FK (student_id) liên kết bảng con ↔ bảng gốc"
            },
            {
              "id": "s5",
              "label": "Bước 5: Xóa cột multivalued khỏi bảng gốc"
            }
          ],
          "solution": {
            "s1": 1,
            "s2": 2,
            "s3": 3,
            "s4": 4,
            "s5": 5
          }
        }
      },

      step_3: {
        mission: 'Tìm <code>name</code> của sinh viên có số điện thoại <code>0901-111-111</code> — dùng subquery <code>IN</code> nối 2 bảng 1NF.',
        blocks: [
          { type: 'kw',  token: 'SELECT',       slot: 'kw-select' },
          { type: 'col', token: 'name',          slot: 'col-1' },
          { type: 'kw',  token: 'FROM',          slot: 'kw-from' },
          { type: 'tbl', token: 'student',       slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',         slot: 'kw-where' },
          { type: 'col', token: 'student_id',    slot: 'wcol-1' },
          { type: 'kw',  token: 'IN',            slot: 'kw-in' },
          { type: 'op',  token: "(SELECT student_id FROM student_phone WHERE phone = '0901-111-111')", slot: 'op-sub' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____',                              accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line',   placeholder: 'FROM ____',                                 accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',  placeholder: 'WHERE ____ IN (subquery)',                  accepts: ['kw', 'col', 'op'], acceptedKeywords: ['WHERE', 'AND', 'OR', 'IN'], multi: true }
        ],
        expected_sql: "SELECT name FROM student WHERE student_id IN (SELECT student_id FROM student_phone WHERE phone = '0901-111-111');",
        reveal_hints: {
          'select-line': 'SELECT 1 cột: <strong>name</strong> — lấy tên sinh viên từ bảng student.',
          'from-line':   'FROM bảng <strong>student</strong> (bảng chứa tên SV, không phải student_phone).',
          'where-line':  "WHERE <strong>student_id IN (subquery)</strong> — subquery tìm student_id từ bảng student_phone theo phone. Đây là cách nối 2 bảng 1NF mà không dùng JOIN."
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
          ],
          /* 4A-E3-engine Bài 9: thêm bảng `student` (data spec §DATA-E3) — IN-subquery cần table
           * chứa name + id mới SELECT được. Alice (S01) sở hữu 0901-111-111 → match filter. */
          related_schemas: [{
            table_name: 'student',
            columns: [
              { name: 'student_id', type: 'INT',     key: 'PK' },
              { name: 'name',       type: 'VARCHAR', key: '' }
            ],
            data: [
              ['S01', 'Alice'],
              ['S02', 'Bob'],
              ['S03', 'Carol']
            ]
          }]
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

    {
      id: 'db_09', index: 10,
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
            ['B01','1','2024-06-01','Minh'], ['B01','2','2024-06-03','Minh'],
            ['B02','1','2024-06-05','Yuki'], ['B02','2','2024-06-06','Sara'],
            ['B03','1','2024-06-08','Nam'],  ['B03','2','2024-06-09','Minh'],
            ['B04','1','2024-06-10','Lan'],  ['B04','2','2024-06-12','Yuki'],
            ['B05','1','2024-06-14','Hùng'], ['B05','2','2024-06-15','Sara'],
            ['B06','1','2024-06-17','Minh'], ['B06','2','2024-06-18','Nam'],
            ['B07','1','2024-06-20','Mai'],  ['B07','2','2024-06-21','Lan'],
            ['B08','1','2024-06-23','Yuki'], ['B08','2','2024-06-24','Minh'],
            ['B09','1','2024-06-26','Hùng'], ['B09','2','2024-06-27','Sara'],
            ['B10','1','2024-06-29','Nam'],  ['B10','2','2024-06-30','Mai'],
            ['B11','1','2024-07-01','Minh'], ['B11','2','2024-07-02','Lan']
          ]
        }
      },

      achievement: { name: 'Phá phụ thuộc bộ phận', desc: '2NF' },
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
                intro: '70% database mới ra trường có <strong>partial dependency</strong> mà dev không biết. Khi data lên 100K dòng, update sai = mất 3 ngày fix. Bài này tóm gọn 2NF trong 5 phút — thay vì 3 tuần tự mò. Sau bài này bạn sẽ <em>chủ động tách bảng</em> trước khi code, không phải fix sau.',
concept_cards: [
            {
                  "icon": "fa-puzzle-piece",
                  "title": "2NF — Phụ thuộc CẢ PK",
                  "body": "Thư viện A lưu tên thành viên LẶP LẠI 500 lần — mỗi lần mượn sách = 1 dòng có <code>member_name</code>. Sửa tên 1 người = UPDATE 500 dòng. Quên 1 dòng? <strong>Dữ liệu mâu thuẫn</strong>. Đây là partial dependency — cột <code>member_name</code> chỉ phụ thuộc <code>member_id</code>, không cần <code>book_id</code>. 2NF fix vấn đề này."
            },
            {
                  "icon": "fa-scissors",
                  "title": "Cách fix 2NF",
                  "body": "Tách phần PK gây phụ thuộc ra bảng riêng. <code>loans(book_id, copy_no, member_id, member_name)</code> có <code>member_id → member_name</code> → tách thành bảng <code>member(member_id, member_name)</code>. Bảng loans chỉ giữ FK <code>member_id</code>. 1 dòng UPDATE, 1 dòng sửa — xong."
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "Nếu đổi tên người mượn từ \"Minh\" → \"Minh Nguyễn"
            }
          ],
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
            ['B01','1','M01','Minh','2024-06-01'], ['B01','2','M01','Minh','2024-06-03'],
            ['B02','1','M02','Yuki','2024-06-05'], ['B02','2','M03','Sara','2024-06-06'],
            ['B03','1','M04','Nam', '2024-06-08'], ['B03','2','M01','Minh','2024-06-09'],
            ['B04','1','M05','Lan', '2024-06-10'], ['B04','2','M02','Yuki','2024-06-12'],
            ['B05','1','M06','Hùng','2024-06-14'], ['B05','2','M03','Sara','2024-06-15'],
            ['B06','1','M01','Minh','2024-06-17'], ['B06','2','M04','Nam', '2024-06-18'],
            ['B07','1','M07','Mai', '2024-06-20'], ['B07','2','M05','Lan', '2024-06-21'],
            ['B08','1','M02','Yuki','2024-06-23'], ['B08','2','M01','Minh','2024-06-24'],
            ['B09','1','M06','Hùng','2024-06-26'], ['B09','2','M03','Sara','2024-06-27'],
            ['B10','1','M04','Nam', '2024-06-29'], ['B10','2','M07','Mai', '2024-06-30'],
            ['B11','1','M01','Minh','2024-07-01'], ['B11','2','M05','Lan', '2024-07-02']
          ]
        },
        mission: 'Quan sát bảng: <code>member_name</code> chỉ phụ thuộc <code>member_id</code> — không phụ thuộc <code>copy_no</code>. Đây là phụ thuộc bộ phận → vi phạm 2NF.'
      },

      step_2: {
        mcq: [
          {
            question: 'Trong bảng <code>book_loan_raw(book_id, copy_no, member_id, member_name)</code> với PK là <code>(book_id, copy_no)</code>, cột nào VI PHẠM 2NF?',
            options: [
              { id: 'a', text: '<code>member_id</code> — vì là một phần quan hệ', correct: false, explanation: 'Sai — member_id là FK (tham chiếu members.member_id). Nó phụ thuộc 1 phần khóa nhưng vẫn cần thiết trong loans. member_name mới là cần tách, không phải member_id.' },
              { id: 'b', text: '<code>member_name</code> — vì chỉ phụ thuộc <code>member_id</code> (một phần của khóa qua loan)', correct: true, explanation: 'Đúng — member_name chỉ phụ thuộc member_id, KHÔNG phụ thuộc book_id hay copy_no. Đây là partial dependency classic: Y chỉ phụ thuộc 1 PHẦN của composite key.' },
              { id: 'c', text: '<code>loan_date</code> — vì là cột ngày tháng', correct: false, explanation: 'Sai — loan_date phụ thuộc TOÀN BỘ PK (cần biết cả book_id + copy_no để biết ngày mượn bản cụ thể). Đó là full functional dependency, không vi phạm 2NF.' },
              { id: 'd', text: '<code>copy_no</code> — vì là một phần khóa', correct: false, explanation: 'Sai — copy_no là 1 phần PK (composite key). Các phần của PK không vi phạm 2NF — chúng định nghĩa identity, không phụ thuộc ai.' }
            ]
          },
          {
            question: 'Để sửa vi phạm 2NF (phụ thuộc bộ phận), cần làm gì?',
            options: [
{ id: 'a', text: 'ALTER TABLE book_loan_raw ADD PRIMARY KEY (member_id)', correct: false, format: 'code', explanation: 'Sai — PK hiện tại (book_id, copy_no) đã đúng (mỗi cuốn sách có nhiều copy, mỗi copy có thể mượn nhiều lần). member_id KHÔNG thuộc PK — nó là FK.' },
          { id: 'b', text: 'CREATE TABLE loans (book_id INT, copy_no INT, member_id INT, loan_date DATE, PRIMARY KEY (book_id, copy_no), FOREIGN KEY (member_id) REFERENCES members);\n\nCREATE TABLE members (member_id INT PRIMARY KEY, member_name VARCHAR(100));', correct: true, format: 'code', explanation: 'Đúng — tách member_name về bảng members riêng → ở members, member_name chỉ phụ thuộc member_id (PK). member_id ở loans là FK tham chiếu members. Mỗi bảng đạt 2NF.' },
          { id: 'c', text: 'ALTER TABLE book_loan_raw DROP COLUMN copy_no', correct: false, format: 'code', explanation: 'Sai — mất data. copy_no cần để phân biệt nhiều bản copy cùng book_id (VD: 2 bản "Harry Potter 1" có copy_no=1 và copy_no=2, mượn riêng).' },
          { id: 'd', text: 'ALTER TABLE book_loan_raw RENAME COLUMN member_name TO member_full_name', correct: false, format: 'code', explanation: 'Sai — đổi tên không fix partial dependency. member_name vẫn chỉ phụ thuộc member_id → vẫn vi phạm 2NF. Phải tách bảng.' }
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
        mission: 'Tìm <strong>top 3 thành viên mượn nhiều sách nhất</strong> — JOIN <code>members</code> ↔ <code>loans</code>, đếm + sắp xếp giảm dần.',
        blocks: [
          { type: 'kw',  token: 'SELECT',          slot: 'kw-select' },
          { type: 'col', token: 'm.member_name',   slot: 'col-1' },
          { type: 'fn',  token: 'COUNT(*)',        slot: 'fn-count' },
          { type: 'kw',  token: 'AS',              slot: 'kw-as' },
          { type: 'col', token: 'loan_count',      slot: 'col-alias' },
          { type: 'kw',  token: 'FROM',            slot: 'kw-from' },
          { type: 'tbl', token: 'members m',       slot: 'tbl' },
          { type: 'kw',  token: 'JOIN',            slot: 'kw-join' },
          { type: 'tbl', token: 'loans l',         slot: 'tbl2' },
          { type: 'kw',  token: 'ON',              slot: 'kw-on' },
          { type: 'col', token: 'l.member_id = m.member_id', slot: 'col-on' },
          { type: 'kw',  token: 'GROUP BY',        slot: 'kw-group' },
          { type: 'col', token: 'm.member_id, m.member_name', slot: 'col-group' },
          { type: 'kw',  token: 'ORDER BY',        slot: 'kw-order' },
          { type: 'col', token: 'loan_count',      slot: 'col-order' },
          { type: 'kw',  token: 'DESC',            slot: 'kw-desc' },
          { type: 'kw',  token: 'LIMIT',           slot: 'kw-limit' },
          { type: 'val', token: '3',               slot: 'val-limit' }
        ],
        drop_zones: [
          { id: 'select-line',  placeholder: 'SELECT ____ , COUNT(*) AS ____',   accepts: ['kw', 'col', 'fn'], acceptedKeywords: ['SELECT', 'AS'], multi: true },
          { id: 'from-line',    placeholder: 'FROM ____ JOIN ____ ON ____',       accepts: ['kw', 'tbl', 'col'], acceptedKeywords: ['FROM', 'JOIN', 'ON'], multi: true },
          { id: 'group-line',   placeholder: 'GROUP BY ____',                     accepts: ['kw', 'col'], acceptedKeywords: ['GROUP BY'], multi: true },
          { id: 'order-line',   placeholder: 'ORDER BY ____ DESC LIMIT ____',     accepts: ['kw', 'col', 'val'], acceptedKeywords: ['ORDER BY', 'DESC', 'LIMIT'], multi: true }
        ],
        expected_sql: "SELECT m.member_name, COUNT(*) AS loan_count FROM members m JOIN loans l ON l.member_id = m.member_id GROUP BY m.member_id, m.member_name ORDER BY loan_count DESC LIMIT 3;",
        reveal_hints: {
          'select-line':  'SELECT <strong>m.member_name</strong> + <strong>COUNT(*) AS loan_count</strong> — đếm số lượt mượn.',
          'from-line':    'FROM <strong>members m</strong> JOIN <strong>loans l</strong> ON <strong>l.member_id = m.member_id</strong> — nối 2 bảng qua FK.',
          'group-line':   'GROUP BY <strong>m.member_id, m.member_name</strong> — gom theo từng thành viên.',
          'order-line':   'ORDER BY <strong>loan_count DESC</strong> + <strong>LIMIT 3</strong> — top 3 mượn nhiều nhất.'
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
          // PHASE 4A-E2: members mở rộng 2→5 (per §DATA-E2 council cấp). Verify: M01=5 loans, M03=4, M02=3, M05=2, M04=1.
          data: [
            ['M01', 'Minh',     '2023-01-15'],
            ['M02', 'Yuki',     '2023-05-20'],
            ['M03', 'Sara',     '2023-03-10'],
            ['M04', 'Alex',     '2023-07-01'],
            ['M05', 'Nam',      '2023-09-12']
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
            // PHASE 4A-E2: loans mở rộng 4→15 (per §DATA-E2 council cấp). Single-source: schema step_4 chỉ có ở đây (khác step_1 step_3 là bảng book_loan_raw dạy 2NF violation — KHÔNG sync).
            // Counts: M01=5, M03=4, M02=3, M05=2, M04=1 → top-3 = Minh(5)/Sara(4)/Yuki(3).
            data: [
              ['B01', '1', 'M01', '2024-01-05'], ['B02', '1', 'M01', '2024-01-12'],
              ['B03', '1', 'M01', '2024-02-01'], ['B04', '1', 'M01', '2024-02-15'],
              ['B05', '1', 'M01', '2024-03-01'], ['B06', '1', 'M03', '2024-01-08'],
              ['B07', '1', 'M03', '2024-01-20'], ['B08', '1', 'M03', '2024-02-10'],
              ['B09', '1', 'M03', '2024-03-05'], ['B10', '1', 'M02', '2024-01-15'],
              ['B11', '1', 'M02', '2024-02-20'], ['B12', '1', 'M02', '2024-03-10'],
              ['B13', '1', 'M05', '2024-02-05'], ['B14', '1', 'M05', '2024-03-15'],
              ['B15', '1', 'M04', '2024-01-25']
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
        success_message: 'Hoàn thành 2NF nâng cao! Phụ thuộc bộ phận đã được loại bỏ, và bạn đã JOIN + GROUP BY qua 2 bảng. Tiếp theo Bài 11 sẽ xét 3NF — loại bỏ phụ thuộc bắc cầu.',
        xp_reward: 70
      }
    },

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
            ['1001','P01','2','60.00'],
            ['1002','P02','1','45.00'],
            ['1003','P03','3','90.00'],
            ['1004','P01','1','60.00']
          ]
        }
      },

      achievement: { name: 'Cân bằng 3NF', desc: '3NF' },
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
                intro: 'Thử tưởng tượng bạn là data engineer cho 1 ngân hàng. Schema có 200 bảng. Sếp bảo: <em>"Review lại toàn bộ, đảm bảo 3NF"</em>. Bạn check từng bảng... 2 tuần vẫn chưa xong. Trong khi bạn có thể check trong 2 ngày nếu biết <strong>3NF = transitive dependency check</strong>. Bài này tiết kiệm cho bạn 12 ngày.',
concept_cards: [
            {
                  "icon": "fa-link",
                  "title": "3NF — Cho phép vi phạm BCNF (đôi khi)",
                  "body": "Thử thách: bạn có FD <code>course → dept</code> và <code>dept → head</code>. <code>course</code> là PK. <code>head</code> chỉ phụ thuộc <code>dept</code> (transitive). 3NF bắt buộc: hoặc <code>dept</code> là superkey, hoặc <code>head</code> là prime attribute. 3NF <strong>cho phép</strong> FD non-superkey nếu vế phải là key — khác BCNF!"
            },
            {
                  "icon": "fa-scale-balanced",
                  "title": "BCNF vs 3NF — Sự thỏa hiệp",
                  "body": "<strong>BCNF</strong> nghiêm hơn 3NF: nếu đã BCNF → chắc chắn 3NF. Ngược lại, bảng có thể 3NF mà vẫn vi phạm BCNF (vd: 2+ candidate key overlap, vd ở B10). Thực tế: BCNF thường tốt hơn, nhưng đôi khi 3NF + giữ redundancy chấp nhận được. Bạn chọn cái nào?"
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "3NF khác BCNF ở chỗ: 3NF chấp nhận dư thừa nếu cột phụ thuộc là khóa của bảng khác."
            }
          ],
                visual: {
          diagram: {"type": "nf", "before": {"title": "TRƯỚC — vi phạm 3NF", "columns": ["order_id", "product_id", "category", "category_manager"], "rows": [["1001", "P01", "Game", "An"], ["1002", "P02", "Game", "An"], ["1003", "P03", "Gear", "Bình"]], "violations": {"0-3": true, "1-3": true}}, "after": {"title": "SAU — đã 3NF (tách categories)", "columns": ["order_id", "product_id", "category"], "rows": [["1001", "P01", "Game"], ["1002", "P02", "Game"], ["1003", "P03", "Gear"]]}, "note": "Tách categories(category, manager) riêng. category_manager lưu 1 lần / category."},
          schema: {
            table_name: 'orders',
            columns: [
              { name: 'order_id',   type: 'INT',     key: 'PK', icon: '🔑' },
              { name: 'product_id', type: 'INT',     key: 'FK', icon: '🔗' },
              { name: 'qty',        type: 'INT',     key: '',   icon: '#️⃣' },
              { name: 'price',      type: 'DECIMAL', key: '',   icon: '💰' },
              { name: 'order_date', type: 'DATE',    key: '',   icon: '📅' }
            ]
          },
          data_preview: [
            ['1001','P01','2','60.00','2024-04-01'], ['1002','P02','1','45.00','2024-04-03'],
            ['1003','P03','3','90.00','2024-04-05'], ['1004','P01','1','60.00','2024-04-06'],
            ['1005','P04','2','30.00','2024-04-07'], ['1006','P02','4','45.00','2024-04-08'],
            ['1007','P05','1','120.00','2024-04-10'], ['1008','P03','2','90.00','2024-04-11'],
            ['1009','P01','5','60.00','2024-04-12'], ['1010','P06','1','25.00','2024-04-13'],
            ['1011','P04','3','30.00','2024-04-14'], ['1012','P05','2','120.00','2024-04-15'],
            ['1013','P02','1','45.00','2024-04-16'], ['1014','P07','2','80.00','2024-04-17'],
            ['1015','P03','1','90.00','2024-04-18'], ['1016','P01','2','60.00','2024-04-19'],
            ['1017','P06','4','25.00','2024-04-20'], ['1018','P08','1','55.00','2024-04-21'],
            ['1019','P04','2','30.00','2024-04-22'], ['1020','P07','1','80.00','2024-04-23'],
            ['1021','P05','1','120.00','2024-04-24'], ['1022','P02','3','45.00','2024-04-25']
          ]
        },
                mission: 'Hoàn thành game kéo-thả để tách <code class="code">orders</code> thành <code class="code">categories</code>, <code class="code">products</code>, và <code class="code">orders</code>.'
      },

        step_2: {
        mcq: [
          {
            question: "3NF phân biệt với BCNF ở điểm nào?",
            options: [
              { id: "a", text: "3NF cho phép FD non-superkey, BCNF không", correct: true, explanation: "Đúng — 3NF cho phép FD X → Y trong 1 trường hợp: Y là prime attribute (thuộc candidate key). BCNF cấm MỌI FD có X không phải superkey, không có ngoại lệ." },
              { id: "b", text: "BCNF chỉ áp dụng cho bảng > 5 cột", correct: false, explanation: "Sai — BCNF áp dụng cho mọi bảng, không phụ thuộc số cột. Bảng 3 cột vẫn phải check BCNF." },
              { id: "c", text: "3NF nghiêm hơn BCNF", correct: false, explanation: "Sai — BCNF nghiêm hơn 3NF. Mọi bảng BCNF đều đạt 3NF, nhưng ngược lại thì không. BCNF là tier cao hơn trong normalization hierarchy." },
              { id: "d", text: "BCNF là tên khác của 3NF", correct: false, explanation: "Sai — BCNF (Boyce-Codd Normal Form) là chuẩn RIÊNG, do Boyce & Codd đề xuất sau 3NF để fix các edge cases mà 3NF chưa xử lý." }
            ]
          },
          {
            question: "Transitive dependency là gì?",
            options: [
              { id: "a", text: "FD X → Y → Z (Y quyết định Z, X quyết định Y)", correct: true, explanation: "Đúng — transitive: A → B và B → C thì A → C (transitively). VD: order_id → product_id → category → category_manager. category_manager bị phụ thuộc BẮC CẦU qua product_id → vi phạm 3NF." },
              { id: "b", text: "FD ngược Y → X", correct: false, explanation: "Sai — đó là reverse FD (Y → X), không phải transitive. Reverse là đảo chiều, transitive là nối tiếp qua trung gian." },
              { id: "c", text: "Mọi cột đều phụ thuộc PK", correct: false, explanation: "Sai — đó là full functional dependency (FF) hoặc 2NF. Mọi cột phụ thuộc TOÀN BỘ PK là điều kiện của 2NF, không phải transitive." },
              { id: "d", text: "Có 2 khóa chính", correct: false, explanation: "Sai — 1 bảng chỉ có 1 PRIMARY KEY (có thể composite nhiều cột). Bảng có thể có nhiều candidate keys nhưng chỉ chọn 1 làm PK." }
            ]
          }
        ],
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
        mission: 'Tính <strong>tổng doanh thu theo từng category</strong> từ ngày <code>2024-04-05</code> — JOIN 3 bảng <code>orders</code> ↔ <code>products</code> ↔ <code>categories</code>.',
        blocks: [
          { type: 'kw',  token: 'SELECT',           slot: 'kw-select' },
          { type: 'col', token: 'c.category',       slot: 'col-1' },
          { type: 'fn',  token: 'SUM(o.qty * p.price)', slot: 'fn-sum' },
          { type: 'kw',  token: 'AS',               slot: 'kw-as' },
          { type: 'col', token: 'total_revenue',     slot: 'col-alias' },
          { type: 'kw',  token: 'FROM',             slot: 'kw-from' },
          { type: 'tbl', token: 'orders o',          slot: 'tbl' },
          { type: 'kw',  token: 'JOIN',             slot: 'kw-join1' },
          { type: 'tbl', token: 'products p',        slot: 'tbl2' },
          { type: 'kw',  token: 'ON',               slot: 'kw-on1' },
          { type: 'col', token: 'o.product_id = p.product_id', slot: 'col-on1' },
          { type: 'kw',  token: 'JOIN',             slot: 'kw-join2' },
          { type: 'tbl', token: 'categories c',      slot: 'tbl3' },
          { type: 'kw',  token: 'ON',               slot: 'kw-on2' },
          { type: 'col', token: 'p.category = c.category', slot: 'col-on2' },
          { type: 'kw',  token: 'WHERE',            slot: 'kw-where' },
          { type: 'col', token: 'o.order_date',      slot: 'wcol-1' },
          { type: 'op',  token: '>=',               slot: 'op-1' },
          { type: 'val', token: "'2024-04-05'",      slot: 'val-1' },
          { type: 'kw',  token: 'GROUP BY',         slot: 'kw-group' },
          { type: 'col', token: 'c.category',       slot: 'col-group' },
          { type: 'kw',  token: 'ORDER BY',         slot: 'kw-order' },
          { type: 'col', token: 'total_revenue',     slot: 'col-order' },
          { type: 'kw',  token: 'DESC',             slot: 'kw-desc' }
        ],
        drop_zones: [
          { id: 'select-line',  placeholder: 'SELECT ____ , SUM(...) AS ____',   accepts: ['kw', 'col', 'fn'], acceptedKeywords: ['SELECT', 'AS'], multi: true },
          { id: 'from-line',    placeholder: 'FROM ____ JOIN ... ON ... JOIN ... ON ...', accepts: ['kw', 'tbl', 'col'], acceptedKeywords: ['FROM', 'JOIN', 'ON'], multi: true },
          { id: 'where-line',   placeholder: 'WHERE ____ >= ____',               accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE', 'AND', 'OR', 'IN'], multi: true },
          { id: 'group-line',   placeholder: 'GROUP BY ____',                     accepts: ['kw', 'col'], acceptedKeywords: ['GROUP BY'], multi: true },
          { id: 'order-line',   placeholder: 'ORDER BY ____ DESC',                accepts: ['kw', 'col'], acceptedKeywords: ['ORDER BY', 'DESC'], multi: true }
        ],
        expected_sql: "SELECT c.category, SUM(o.qty * p.price) AS total_revenue FROM orders o JOIN products p ON o.product_id = p.product_id JOIN categories c ON p.category = c.category WHERE o.order_date >= '2024-04-05' GROUP BY c.category ORDER BY total_revenue DESC;",
        reveal_hints: {
          'select-line':  'SELECT <strong>c.category</strong> + <strong>SUM(o.qty * p.price) AS total_revenue</strong> — tính tổng doanh thu.',
          'from-line':    'FROM <strong>orders o</strong> + 2 khối JOIN...ON — chain 3 bảng qua FK.',
          'where-line':   "WHERE <strong>o.order_date >= '2024-04-05'</strong> — lọc theo ngày.",
          'group-line':   'GROUP BY <strong>c.category</strong> — gom theo danh mục.',
          'order-line':   'ORDER BY <strong>total_revenue DESC</strong> — doanh thu cao nhất lên đầu.'
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
            ['P01', 'Elden Ring',   'Game', '60.00'],
            ['P02', 'Hades',        'Game', '45.00'],
            ['P03', 'Bàn phím cơ',  'Gear', '90.00'],
            ['P04', 'Chuột gaming', 'Gear', '30.00'],
            ['P05', 'Màn hình 27"', 'Gear', '120.00'],
            ['P06', 'Tai nghe',     'Game', '25.00'],
            ['P07', 'Bàn phím TKL', 'Gear', '80.00'],
            ['P08', 'Webcam',       'Game', '55.00']
          ]
        },
        related_schemas: [
          {
            table_name: 'orders',
            columns: [
              { name: 'order_id',   type: 'INT',  key: 'PK' },
              { name: 'product_id', type: 'INT',  key: 'FK' },
              { name: 'qty',        type: 'INT',  key: '' },
              { name: 'price',      type: 'DECIMAL', key: '' },
              { name: 'order_date', type: 'DATE', key: '' }
            ],
            data: [
              ['1001','P01','2','60.00','2024-04-01'], ['1002','P02','1','45.00','2024-04-03'],
              ['1003','P03','3','90.00','2024-04-05'], ['1004','P01','1','60.00','2024-04-06'],
              ['1005','P04','2','30.00','2024-04-07'], ['1006','P02','4','45.00','2024-04-08'],
              ['1007','P05','1','120.00','2024-04-10'], ['1008','P03','2','90.00','2024-04-11'],
              ['1009','P01','5','60.00','2024-04-12'], ['1010','P06','1','25.00','2024-04-13'],
              ['1011','P04','3','30.00','2024-04-14'], ['1012','P05','2','120.00','2024-04-15'],
              ['1013','P02','1','45.00','2024-04-16'], ['1014','P07','2','80.00','2024-04-17'],
              ['1015','P03','1','90.00','2024-04-18'], ['1016','P01','2','60.00','2024-04-19'],
              ['1017','P06','4','25.00','2024-04-20'], ['1018','P08','1','55.00','2024-04-21'],
              ['1019','P04','2','30.00','2024-04-22'], ['1020','P07','1','80.00','2024-04-23'],
              ['1021','P05','1','120.00','2024-04-24'], ['1022','P02','3','45.00','2024-04-25']
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

    {
      id: 'db_10', index: 12,
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
            ['P01','D01','Khám tổng quát',     '2024-03-01'],
            ['P02','D02','Phẫu thuật ruột thừa','2024-03-05'],
            ['P01','D03','Xét nghiệm máu',      '2024-03-10'],
            ['P03','D01','Khám tim mạch',       '2024-03-12'],
            ['P04','D01','Khám tổng quát',      '2024-03-13'],
            ['P05','D03','Điện tim',            '2024-03-14'],
            ['P06','D02','Nội soi',             '2024-03-15'],
            ['P07','D04','Khám nhi',            '2024-03-16'],
            ['P08','D01','Tư vấn dinh dưỡng',   '2024-03-17'],
            ['P09','D05','Khám da',             '2024-03-18'],
            ['P10','D03','Siêu âm tim',         '2024-03-19'],
            ['P11','D01','Khám tổng quát',      '2024-03-20'],
            ['P12','D06','Khám thần kinh',      '2024-03-21'],
            ['P13','D02','Phẫu thuật',          '2024-03-22'],
            ['P14','D03','Khám tim',            '2024-03-23'],
            ['P15','D01','Xét nghiệm',          '2024-03-24'],
            ['P16','D04','Tiêm chủng',          '2024-03-25'],
            ['P17','D03','Holter',               '2024-03-26'],
            ['P18','D05','Sinh thiết',          '2024-03-27'],
            ['P19','D01','Tái khám',            '2024-03-28'],
            ['P20','D02','Nội soi',             '2024-03-29'],
            ['P21','D03','Khám tim',            '2024-03-30']
          ]
        }
      },

      achievement: { name: 'Phân rã phi tổn thất', desc: 'BCNF không mất dữ liệu' },
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
                intro: 'Năm 2018, hệ thống đăng ký môn học của 1 trường ĐH Việt Nam bị sập 4 giờ. Nguyên nhân: bảng <code>teaches</code> có 50K dòng, query join mất 45 giây. Dev trưởng mở schema lên — thấy ngay vi phạm <strong>BCNF</strong>: 1 prof dạy 1 dept, dept lặp ở mỗi môn. Tách 1 bảng → query còn 0.5 giây. Bài này dạy <strong>BCNF decomposition</strong>.',
concept_cards: [
            {
                  "icon": "fa-shield-halved",
                  "title": "BCNF — Câu chuyện ông Prof Smith",
                  "body": "Prof Smith dạy 2 môn (Database, Networks), ở dept CS. Bảng <code>teaches(prof, course, dept)</code> có 4 dòng. Smith chuyển dept → UPDATE 2 dòng. Nhưng nếu Smith dạy 3 môn = UPDATE 3 dòng. Quên 1? <strong>Dữ liệu sai</strong>. BCNF bắt buộc mọi FD vế trái phải là superkey."
            },
            {
                  "icon": "fa-code-branch",
                  "title": "BCNF vi phạm & cách tách",
                  "body": "FD: <code>prof → dept</code>. Nhưng <code>{prof, course}</code> mới là PK → <code>prof</code> không phải superkey → vi phạm BCNF. Tách: <code>prof_dept(prof, dept)</code> + <code>teaches(prof, course)</code>. Giờ Smith chuyển dept = UPDATE 1 dòng, không phụ thuộc số môn dạy.",
                  "variant": "quote",
                  "source": "BCNF Theorem — Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 7.5"
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "Cập nhật chuyên khoa bác sĩ D01 từ \"Tim mạch\" → \"Nội tiết\" → phải sửa nhiều dòng."
            }
          ],
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
            ['P01','D01','Khám tổng quát',     '2024-03-01'],
            ['P02','D02','Phẫu thuật ruột thừa','2024-03-05'],
            ['P01','D03','Xét nghiệm máu',      '2024-03-10'],
            ['P03','D01','Khám tim mạch',       '2024-03-12'],
            ['P04','D01','Khám tổng quát',      '2024-03-13'],
            ['P05','D03','Điện tim',            '2024-03-14'],
            ['P06','D02','Nội soi',             '2024-03-15'],
            ['P07','D04','Khám nhi',            '2024-03-16'],
            ['P08','D01','Tư vấn dinh dưỡng',   '2024-03-17'],
            ['P09','D05','Khám da',             '2024-03-18'],
            ['P10','D03','Siêu âm tim',         '2024-03-19'],
            ['P11','D01','Khám tổng quát',      '2024-03-20'],
            ['P12','D06','Khám thần kinh',      '2024-03-21'],
            ['P13','D02','Phẫu thuật',          '2024-03-22'],
            ['P14','D03','Khám tim',            '2024-03-23'],
            ['P15','D01','Xét nghiệm',          '2024-03-24'],
            ['P16','D04','Tiêm chủng',          '2024-03-25'],
            ['P17','D03','Holter',               '2024-03-26'],
            ['P18','D05','Sinh thiết',          '2024-03-27'],
            ['P19','D01','Tái khám',            '2024-03-28'],
            ['P20','D02','Nội soi',             '2024-03-29'],
            ['P21','D03','Khám tim',            '2024-03-30']
          ]
        },
                mission: 'Hoàn thành game kéo-thả để tách <code class="code">treatments</code> thành <code class="code">doctors</code>, <code class="code">patients</code>, và <code class="code">treatments</code>.'
      },

        step_2: {
        mcq: [
          {
            question: "BCNF yêu cầu điều gì?",
            options: [
              { id: "a", text: "Mọi FD X → Y phải có X là superkey", correct: true, explanation: "Đúng — BCNF strict hơn 3NF. Với MỌI FD X → Y trong bảng, X (bên trái) phải là superkey. Nếu X không phải superkey → vi phạm BCNF." },
              { id: "b", text: "Mọi cột phải có giá trị duy nhất", correct: false, explanation: "Sai — BCNF không yêu cầu unique. Mỗi cell = atomic (1NF) là khái niệm khác. UNIQUE là constraint riêng." },
              { id: "c", text: "Bảng phải có composite key", correct: false, explanation: "Sai — BCNF áp dụng cho MỌI bảng, không cần composite PK. Bảng 1-column PK vẫn phải đạt BCNF." },
              { id: "d", text: "Không có cột NULL", correct: false, explanation: "Sai — BCNF cho phép NULL. NULL chỉ bị cấm bởi NOT NULL constraint. NF tập trung vào FD, không vào NULL." }
            ]
          },
          {
            question: "Bảng <code>teaches(prof, course, dept)</code> với FD <code>prof → dept</code> vi phạm chuẩn nào?",
            options: [
{ id: "a", text: "1NF — vì có redundancy trong dept", correct: false, explanation: "Sai — 1NF chỉ về atomic values. Redundancy là vấn đề normalization khác (2NF/3NF/BCNF), không phải 1NF." },
          { id: "b", text: "BCNF — tách thành 2 bảng", correct: true, format: "diagram", diagram: "┌──────┬─────────┬──────┐     ┌──────┬──────┐\n│ prof │ course  │ dept │  →  │ prof │ dept │\n├──────┼─────────┼──────┤     ├──────┼──────┤\n│ An   │ DB101   │ CS   │     │ An   │ CS   │\n│ An   │ AI201   │ CS   │     │ Bình │ Math │\n│ Bình │ DB101   │ Math │     └──────┴──────┘\n└──────┴─────────┴──────┘     ┌──────┬─────────┐\n                             │ prof │ course  │\n (dept lặp ở mỗi dòng)       ├──────┼─────────┤\n  ← VI PHẠM BCNF             │ An   │ DB101   │\n                             │ An   │ AI201   │\n                             │ Bình │ DB101   │\n                             └──────┴─────────┘", explanation: "Đúng — prof → dept, nhưng prof KHÔNG phải superkey (1 prof dạy N courses, không unique). Theo định nghĩa BCNF, X bên trái FD phải là superkey → vi phạm. Tách thành 2 bảng: profs(prof, dept) + teaches(prof, course) → không còn redundancy." },
          { id: "c", text: "Không vi phạm gì cả", correct: false, explanation: "Sai — bảng có redundant dept (cùng prof luôn cùng dept). Phải tách thành profs(prof_id, dept) + teaches(prof, course) để tránh dư thừa." },
          { id: "d", text: "2NF — vì thiếu partial dependency check", correct: false, explanation: "Sai — 2NF chỉ áp dụng khi có composite PK. teaches có PK = (prof, course) composite. 2NF: mọi non-prime attribute phải phụ thuộc TOÀN BỘ PK. dept phụ thuộc prof (1 phần PK) → cũng vi phạm 2NF, nhưng BCNF là cấp strict hơn." }
            ]
          }
        ],
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
        mini_game:         {
          "type": "match",
          "title": "FD nào vi phạm dạng chuẩn nào?",
          "instruction": "Mỗi phụ thuộc hàm vi phạm dạng chuẩn nào? Click nối từng cặp.",
          "xp": 30,
          "pairs": [
            {
              "left": "PK(A,B) và A → C",
              "leftId": "f1",
              "rightId": "n1",
              "right": {
                "id": "n1",
                "label": "Vi phạm 2NF (partial dep)"
              }
            },
            {
              "left": "A → B → C (transitive)",
              "leftId": "f2",
              "rightId": "n2",
              "right": {
                "id": "n2",
                "label": "Vi phạm 3NF"
              }
            },
            {
              "left": "X → Y nhưng X không SK",
              "leftId": "f3",
              "rightId": "n3",
              "right": {
                "id": "n3",
                "label": "Vi phạm BCNF"
              }
            },
            {
              "left": "X →→ Y (multivalued)",
              "leftId": "f4",
              "rightId": "n4",
              "right": {
                "id": "n4",
                "label": "Vi phạm 4NF"
              }
            }
          ],
          "solution": {
            "f1": "n1",
            "f2": "n2",
            "f3": "n3",
            "f4": "n4"
          }
        }
      },

      step_3: {
        mission: 'Tìm <strong>top 3 chuyên khoa có nhiều ca điều trị nhất</strong> — JOIN <code>treatments</code> ↔ <code>doctors</code>, đếm + sắp xếp giảm dần.',
        blocks: [
          { type: 'kw',  token: 'SELECT',              slot: 'kw-select' },
          { type: 'col', token: 'd.doctor_specialty',  slot: 'col-1' },
          { type: 'fn',  token: 'COUNT(*)',            slot: 'fn-count' },
          { type: 'kw',  token: 'AS',                  slot: 'kw-as' },
          { type: 'col', token: 'treatment_count',     slot: 'col-alias' },
          { type: 'kw',  token: 'FROM',                slot: 'kw-from' },
          { type: 'tbl', token: 'treatments t',        slot: 'tbl' },
          { type: 'kw',  token: 'JOIN',                slot: 'kw-join' },
          { type: 'tbl', token: 'doctors d',           slot: 'tbl2' },
          { type: 'kw',  token: 'ON',                  slot: 'kw-on' },
          { type: 'col', token: 't.doctor_id = d.doctor_id', slot: 'col-on' },
          { type: 'kw',  token: 'GROUP BY',            slot: 'kw-group' },
          { type: 'col', token: 'd.doctor_specialty',  slot: 'col-group' },
          { type: 'kw',  token: 'ORDER BY',            slot: 'kw-order' },
          { type: 'col', token: 'treatment_count',     slot: 'col-order' },
          { type: 'kw',  token: 'DESC',                slot: 'kw-desc' },
          { type: 'kw',  token: 'LIMIT',               slot: 'kw-limit' },
          { type: 'val', token: '3',                   slot: 'val-limit' }
        ],
        drop_zones: [
          { id: 'select-line',  placeholder: 'SELECT ____ , COUNT(*) AS ____',   accepts: ['kw', 'col', 'fn'], acceptedKeywords: ['SELECT', 'AS'], multi: true },
          { id: 'from-line',    placeholder: 'FROM ____ JOIN ____ ON ____',       accepts: ['kw', 'tbl', 'col'], acceptedKeywords: ['FROM', 'JOIN', 'ON'], multi: true },
          { id: 'group-line',   placeholder: 'GROUP BY ____',                     accepts: ['kw', 'col'], acceptedKeywords: ['GROUP BY'], multi: true },
          { id: 'order-line',   placeholder: 'ORDER BY ____ DESC LIMIT ____',     accepts: ['kw', 'col', 'val'], acceptedKeywords: ['ORDER BY', 'DESC', 'LIMIT'], multi: true }
        ],
        expected_sql: "SELECT d.doctor_specialty, COUNT(*) AS treatment_count FROM treatments t JOIN doctors d ON t.doctor_id = d.doctor_id GROUP BY d.doctor_specialty ORDER BY treatment_count DESC LIMIT 3;",
        reveal_hints: {
          'select-line':  'SELECT <strong>d.doctor_specialty</strong> + <strong>COUNT(*) AS treatment_count</strong> — đếm số ca điều trị.',
          'from-line':    'FROM <strong>treatments t</strong> JOIN <strong>doctors d</strong> ON <strong>t.doctor_id = d.doctor_id</strong> — nối 2 bảng qua FK.',
          'group-line':   'GROUP BY <strong>d.doctor_specialty</strong> — gom theo chuyên khoa.',
          'order-line':   'ORDER BY <strong>treatment_count DESC</strong> + <strong>LIMIT 3</strong> — top 3 chuyên khoa nhiều ca nhất.'
        }
      },

      step_4: {
        prompt: 'Sau BCNF, tách thành 3 bảng <code>doctors</code>, <code>patients</code>, <code>treatments</code>. Tìm <strong>top 3 chuyên khoa có nhiều ca điều trị nhất</strong>. Hiển thị chuyên khoa + số ca, sắp xếp giảm dần.',
        // FIX 2e-C2: context giàu — Bài 10 late BCNF (aggregation qua 3 bảng)
        context: {
          scenario: 'Bệnh viện X sau khi áp dụng BCNF đã tách bảng <code>treatments</code> cũ thành 3 bảng chuẩn hóa: <code>doctors</code> (chuyên khoa), <code>patients</code>, <code>treatments</code> (ghi nhận ca điều trị). Ban giám đốc muốn biết <strong>top 3 chuyên khoa</strong> đang "hot" nhất để điều phối nhân lực.',
          steps: [
            'Xác định cột cần thống kê: <code>doctor_specialty</code> + <code>COUNT(*)</code> đặt alias là <code>treatment_count</code>.',
            'Từ bảng <code>treatments</code>, JOIN sang <code>doctors</code> qua FK <code>treatments.doctor_id = doctors.doctor_id</code>.',
            '<code>GROUP BY doctor_specialty</code> để gom nhóm theo chuyên khoa.',
            '<code>ORDER BY treatment_count DESC</code> + <code>LIMIT 3</code> để lấy top 3.'
          ],
          hint_explore: 'Cần biết schema 3 bảng: gõ <code>SELECT * FROM treatments</code> trước để thấy cột <code>doctor_id</code> (FK), rồi <code>SELECT * FROM doctors</code> để thấy cột <code>doctor_specialty</code>.',
          example: {
            question: 'Ví dụ tương tự — lấy <strong>top 2 bác sĩ có nhiều ca nhất</strong> (thay vì chuyên khoa):',
            sql: 'SELECT d.doctor_name, COUNT(*) AS treatment_count FROM treatments t JOIN doctors d ON t.doctor_id = d.doctor_id GROUP BY d.doctor_id, d.doctor_name ORDER BY treatment_count DESC LIMIT 2;',
            sample_output: '→ 2 dòng × 2 cột: vd <code>(BS. Hà, 3)</code>, <code>(BS. Linh, 2)</code>'
          },
          expected: 'Bảng kết quả 3 dòng × 2 cột <code>doctor_specialty</code> + <code>treatment_count</code>, sắp xếp giảm dần theo số ca. (Số liệu thực tế phụ thuộc data mẫu — bài 10 dùng hospital domain.)'
        },
        starter: "-- Top 3 chuyên khoa có nhiều ca điều trị nhất\n-- JOIN treatments ↔ doctors + GROUP BY + ORDER BY DESC + LIMIT 3\nSELECT d., COUNT(*) AS \n  FROM treatments t\n  JOIN doctors d ON t. = d.\n GROUP BY d.\n ORDER BY  DESC\n LIMIT 3;\n",
        schema: {
          table_name: 'doctors',
          columns: [
            { name: 'doctor_id',      type: 'INT',     key: 'PK', icon: '🔑' },
            { name: 'doctor_name',    type: 'VARCHAR', key: '',   icon: '👨‍⚕️' },
            { name: 'doctor_specialty', type: 'VARCHAR', key: '',   icon: '⚕️' }
          ],
          data: [
            ['D01', 'BS. Hà',   'Nội tổng quát'],
            ['D02', 'BS. Linh', 'Ngoại tiêu hóa'],
            ['D03', 'BS. Khải', 'Tim mạch'],
            ['D04', 'BS. Mai',  'Nhi'],
            ['D05', 'BS. Nam',  'Da liễu'],
            ['D06', 'BS. Lan',  'Thần kinh']
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
              ['P01','D01','Khám tổng quát',     '2024-03-01'],
              ['P02','D02','Phẫu thuật ruột thừa','2024-03-05'],
              ['P01','D03','Xét nghiệm máu',      '2024-03-10'],
              ['P03','D01','Khám tim mạch',       '2024-03-12'],
              ['P04','D01','Khám tổng quát',      '2024-03-13'],
              ['P05','D03','Điện tim',            '2024-03-14'],
              ['P06','D02','Nội soi',             '2024-03-15'],
              ['P07','D04','Khám nhi',            '2024-03-16'],
              ['P08','D01','Tư vấn dinh dưỡng',   '2024-03-17'],
              ['P09','D05','Khám da',             '2024-03-18'],
              ['P10','D03','Siêu âm tim',         '2024-03-19'],
              ['P11','D01','Khám tổng quát',      '2024-03-20'],
              ['P12','D06','Khám thần kinh',      '2024-03-21'],
              ['P13','D02','Phẫu thuật',          '2024-03-22'],
              ['P14','D03','Khám tim',            '2024-03-23'],
              ['P15','D01','Xét nghiệm',          '2024-03-24'],
              ['P16','D04','Tiêm chủng',          '2024-03-25'],
              ['P17','D03','Holter',               '2024-03-26'],
              ['P18','D05','Sinh thiết',          '2024-03-27'],
              ['P19','D01','Tái khám',            '2024-03-28'],
              ['P20','D02','Nội soi',             '2024-03-29'],
              ['P21','D03','Khám tim',            '2024-03-30']
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

    {
      id: 'db_12', index: 13,
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
            ['CS101','Database Concepts','Dr. Trần'], ['CS101','SQL Performance','Dr. Trần'],
            ['CS101','Database Concepts','Dr. Lê'],    ['CS101','SQL Performance','Dr. Lê'],
            ['CS102','Clean Code',        'Dr. Phạm'], ['CS102','Design Patterns', 'Dr. Phạm'],
            ['CS102','Clean Code',        'Dr. Hoàng'], ['CS102','Design Patterns', 'Dr. Hoàng'],
            ['CS103','Algorithms',        'Dr. Vũ'],    ['CS103','Data Structures', 'Dr. Vũ'],
            ['CS103','Discrete Math',     'Dr. Vũ'],    ['CS103','Algorithms',      'Dr. Đặng'],
            ['CS103','Data Structures',   'Dr. Đặng'],  ['CS103','Discrete Math',   'Dr. Đặng'],
            ['CS104','Networks',          'Dr. Bùi'],   ['CS104','Security',        'Dr. Bùi'],
            ['CS104','Networks',          'Dr. Ngô'],   ['CS104','Security',        'Dr. Ngô'],
            ['CS104','Networks',          'Dr. Dương'], ['CS104','Security',        'Dr. Dương'],
            ['CS105','OS Internals',      'Dr. Lý'],    ['CS105','Compilers',       'Dr. Lý'],
            ['CS105','OS Internals',      'Dr. Mai'],   ['CS105','Compilers',       'Dr. Mai']
          ]
        }
      },

      achievement: { name: 'Diệt đa trị', desc: '4NF' },
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
                intro: '<strong>Trước</strong>: bảng <code>prof_skill</code> có 12 dòng cho 1 prof (4 course × 3 hobby). Insert 1 hobby mới = 4 dòng duplicate. <strong>Sau</strong>: 2 bảng <code>prof_course</code> (4 dòng) + <code>prof_hobby</code> (3 dòng). Insert 1 hobby = 1 dòng. Storage giảm 42%. Đây là <strong>4NF</strong> xử lý multivalued dependency.',
concept_cards: [
            {
                  "icon": "fa-cubes-stacked",
                  "title": "4NF — Trước vs Sau khi tách",
                  "body": "<strong>Trước</strong>: bảng <code>prof_skill(prof, course, hobby)</code> có 1 prof dạy 4 course + 3 hobby = <strong>12 dòng</strong> (Cartesian product). <strong>Sau</strong>: 2 bảng <code>prof_course(prof, course)</code> + <code>prof_hobby(prof, hobby)</code> = <strong>4 + 3 = 7 dòng</strong>. Tiết kiệm 42% storage."
            },
            {
                  "icon": "fa-explosion",
                  "title": "Multivalued Dependency (MVD)",
                  "body": "Khi 1 khóa X quyết định NHIỀU giá trị Y <em>độc lập</em> với cột khác → <code>X →→ Y</code>. <strong>Quy tắc</strong>: nếu có 2+ MVD cùng vế trái, tách thành 2 bảng. MVD khác FD ở chỗ Y là <em>tập giá trị</em> chứ không phải 1 giá trị. Bài này dạy cách phát hiện."
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "Bảng course_offering_raw có MVD: course_id →→ textbook và course_id →→ instructor."
            }
          ],
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
            ['CS101','Database Concepts','Dr. Trần'], ['CS101','SQL Performance','Dr. Trần'],
            ['CS101','Database Concepts','Dr. Lê'],    ['CS101','SQL Performance','Dr. Lê'],
            ['CS102','Clean Code',        'Dr. Phạm'], ['CS102','Design Patterns', 'Dr. Phạm'],
            ['CS102','Clean Code',        'Dr. Hoàng'], ['CS102','Design Patterns', 'Dr. Hoàng'],
            ['CS103','Algorithms',        'Dr. Vũ'],    ['CS103','Data Structures', 'Dr. Vũ'],
            ['CS103','Discrete Math',     'Dr. Vũ'],    ['CS103','Algorithms',      'Dr. Đặng'],
            ['CS103','Data Structures',   'Dr. Đặng'],  ['CS103','Discrete Math',   'Dr. Đặng'],
            ['CS104','Networks',          'Dr. Bùi'],   ['CS104','Security',        'Dr. Bùi'],
            ['CS104','Networks',          'Dr. Ngô'],   ['CS104','Security',        'Dr. Ngô'],
            ['CS104','Networks',          'Dr. Dương'], ['CS104','Security',        'Dr. Dương'],
            ['CS105','OS Internals',      'Dr. Lý'],    ['CS105','Compilers',       'Dr. Lý'],
            ['CS105','OS Internals',      'Dr. Mai'],   ['CS105','Compilers',       'Dr. Mai']
          ]
        },
        mission: 'Quan sát: CS101 có 2 textbook × 2 instructor = 4 dòng lặp tổ hợp. Nếu thêm 1 instructor nữa → thêm 2 dòng mới (mỗi textbook). Đó là dấu hiệu vi phạm 4NF.'
      },

      step_2: {
        mcq: [
          {
            question: 'Phụ thuộc đa trị (Multivalued Dependency) X →→ Y nghĩa là gì?',
            options: [
              { id: 'a', text: 'X quyết định đúng 1 giá trị Y', correct: false, explanation: 'Sai — đó là FD thường (functional dependency, ký hiệu X → Y). MVD (multivalued, ký hiệu X →→ Y với 2 mũi tên) cho phép NHIỀU giá trị Y.' },
              { id: 'b', text: 'X quyết định NHIỀU giá trị Y, và tập Y độc lập với các cột khác', correct: true, explanation: 'Đúng — MVD: 1 giá trị X có thể kết hợp với NHIỀU giá trị Y, và tập Y độc lập với các cột khác. VD: prof P01 dạy {Database, Networks} + có hobby {Chess, Piano}, course và hobby độc lập nhau.' },
              { id: 'c', text: 'Y quyết định X', correct: false, explanation: 'Sai — MVD chỉ định hướng X →→ Y. Y →→ X là MVD NGƯỢC (nếu tồn tại). Mỗi chiều là 1 MVD riêng.' },
              { id: 'd', text: 'X và Y là cùng 1 cột', correct: false, explanation: 'Sai — MVD phân biệt X (determinant) và Y (dependent). Nếu X = Y → trivial MVD (luôn đúng về mặt logic nhưng không có ý nghĩa thực tế).' }
            ]
          },
          {
            question: 'Khi nào một bảng VI PHẠM 4NF?',
            options: [
              { id: 'a', text: 'Khi bảng có khóa chính tổng hợp', correct: false, explanation: 'Sai — composite PK không tự động vi phạm 4NF. Nhiều bảng có composite PK vẫn đạt 4NF nếu không có MVD độc lập.' },
              { id: 'b', text: 'Khi bảng có ≥ 2 MVD độc lập từ cùng 1 khóa → sinh tổ hợp Cartesian lặp', correct: true, explanation: 'Đúng — 4NF vi phạm khi có ít nhất 2 MVD độc lập từ cùng 1 X. VD: prof →→ course và prof →→ hobby → 1 prof × m courses × n hobbies = m*n rows (Cartesian explosion).' },
              { id: 'c', text: 'Khi bảng có cột JSON', correct: false, explanation: 'Sai — JSON column là về storage type (PostgreSQL JSONB). Không liên quan MVD hay 4NF. JSONB có thể chứa array → có thể vi phạm 1NF nhưng không phải 4NF.' },
              { id: 'd', text: 'Khi bảng có hơn 3 cột', correct: false, explanation: 'Sai — số cột không liên quan 4NF. Bảng 2 cột vẫn có thể vi phạm 4NF (nếu có MVD). Bảng 20 cột vẫn đạt 4NF (nếu không có MVD độc lập).' }
            ]
          }
        ],
        mini_game:         {
          "type": "bug_spot",
          "title": "Tìm Multivalued Dependency violation",
          "instruction": "Bảng này có Cartesian explosion — đâu là dòng \"gây bão\"?",
          "xp": 30,
          "code": "prof_id | course     | hobby\nP01     | Database   | Chess\nP01     | Database   | Piano\nP01     | Networks   | Chess\nP01     | Networks   | Piano",
          "bugType": "logic",
          "bugs": [
            {
              "line": 2,
              "description": "Dòng 2-5 là Cartesian product! prof →→ course và prof →→ hobby INDEPENDENT → tách thành 2 bảng: prof_course(prof_id, course) + prof_hobby(prof_id, hobby). 12 dòng → 7 dòng."
            }
          ]
        }
      },

      step_3: {
        mission: 'Tìm <strong>top khóa học có nhiều textbook nhất</strong> — đếm textbook theo <code>course_id</code>, sắp xếp giảm dần.',
        blocks: [
          { type: 'kw',  token: 'SELECT',          slot: 'kw-select' },
          { type: 'col', token: 'course_id',       slot: 'col-1' },
          { type: 'fn',  token: 'COUNT(*)',        slot: 'fn-count' },
          { type: 'kw',  token: 'AS',              slot: 'kw-as' },
          { type: 'col', token: 'textbook_count',  slot: 'col-alias' },
          { type: 'kw',  token: 'FROM',            slot: 'kw-from' },
          { type: 'tbl', token: 'course_textbook', slot: 'tbl' },
          { type: 'kw',  token: 'GROUP BY',        slot: 'kw-group' },
          { type: 'col', token: 'course_id',       slot: 'col-group' },
          { type: 'kw',  token: 'ORDER BY',        slot: 'kw-order' },
          { type: 'col', token: 'textbook_count',  slot: 'col-order' },
          { type: 'kw',  token: 'DESC',            slot: 'kw-desc' }
        ],
        drop_zones: [
          { id: 'select-line',  placeholder: 'SELECT ____ , COUNT(*) AS ____',   accepts: ['kw', 'col', 'fn'], acceptedKeywords: ['SELECT', 'AS'], multi: true },
          { id: 'from-line',    placeholder: 'FROM ____',                         accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'group-line',   placeholder: 'GROUP BY ____',                     accepts: ['kw', 'col'], acceptedKeywords: ['GROUP BY'], multi: true },
          { id: 'order-line',   placeholder: 'ORDER BY ____ DESC',                accepts: ['kw', 'col'], acceptedKeywords: ['ORDER BY', 'DESC'], multi: true }
        ],
        expected_sql: "SELECT course_id, COUNT(*) AS textbook_count FROM course_textbook GROUP BY course_id ORDER BY textbook_count DESC;",
        reveal_hints: {
          'select-line':  'SELECT <strong>course_id</strong> + <strong>COUNT(*) AS textbook_count</strong> — đếm số textbook.',
          'from-line':    'FROM bảng đã tách 4NF: <strong>course_textbook</strong>.',
          'group-line':   'GROUP BY <strong>course_id</strong> — gom theo khóa học.',
          'order-line':   'ORDER BY <strong>textbook_count DESC</strong> — khóa nào nhiều textbook nhất lên đầu.'
        }
      },

      step_4: {
        prompt: 'Sau 4NF, tách thành 2 bảng <code>course_textbook</code> và <code>course_instructor</code>. Tìm <strong>top 5 khóa học có nhiều textbook nhất</strong>. Hiển thị course_id + số textbook, sắp xếp giảm dần, lấy 5 kết quả đầu.',
        starter: "-- Top khóa học có nhiều textbook nhất\n-- GROUP BY course_id + COUNT + ORDER BY DESC\nSELECT , COUNT(*) AS \n  FROM course_textbook\n GROUP BY \n ORDER BY  DESC;\n",
        schema: {
          table_name: 'course_textbook',
          columns: [
            { name: 'course_id', type: 'VARCHAR', key: 'PK', icon: '🔑' },
            { name: 'textbook',  type: 'VARCHAR', key: '',   icon: '📚' }
          ],
          data: [
            ['CS101','Database Concepts'],
            ['CS101','SQL Performance'],
            ['CS102','Clean Code'],
            ['CS102','Design Patterns'],
            ['CS103','Algorithms'],
            ['CS103','Data Structures'],
            ['CS103','Discrete Math'],
            ['CS104','Networks'],
            ['CS104','Security'],
            ['CS105','OS Internals'],
            ['CS105','Compilers']
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
              ['CS101','Dr. Trần'],
              ['CS101','Dr. Lê'],
              ['CS102','Dr. Phạm'],
              ['CS102','Dr. Hoàng'],
              ['CS103','Dr. Vũ'],
              ['CS103','Dr. Đặng'],
              ['CS104','Dr. Bùi'],
              ['CS104','Dr. Ngô'],
              ['CS104','Dr. Dương'],
              ['CS105','Dr. Lý'],
              ['CS105','Dr. Mai']
            ]
          }
        ],
        expected_sql: "SELECT course_id, COUNT(*) AS textbook_count FROM course_textbook GROUP BY course_id ORDER BY textbook_count DESC LIMIT 5;",
        hints: [
          { level: 1, text: 'Bạn cần <em>đếm số textbook theo từng course</em>, lấy <strong>top 5</strong>. Hãy nghĩ: <strong>GROUP BY course_id</strong> + <strong>COUNT(*)</strong> + <strong>ORDER BY DESC</strong> + <strong>LIMIT 5</strong>.' },
          { level: 2, text: 'SELECT 2 cột: <code>course_id</code> và <code>COUNT(*) AS textbook_count</code>.' },
          { level: 3, text: 'GROUP BY <code>course_id</code> gom nhóm theo khóa học. COUNT(*) đếm số textbook. ORDER BY DESC sắp xếp giảm dần. LIMIT 5 lấy top 5.' },
          { level: 4, text: "<code class=\"code\">SELECT course_id, COUNT(*) AS textbook_count FROM course_textbook GROUP BY course_id ORDER BY textbook_count DESC LIMIT 5;</code>" }
        ],
        success_message: 'Hoàn thành 4NF nâng cao! Phụ thuộc đa trị đã được tách — textbook và instructor là 2 chiều độc lập. Bài 14 sẽ là BOSS BATTLE — tổng hợp mọi dạng chuẩn trên hệ thống Mạng Xã Hội Gamers.',
        xp_reward: 75
      }
    },

    {
      id: 'db_13', index: 14,
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
            ['U01','minh_gamer','VN','true'],  ['U02','yuki_99','JP','false'],
            ['U03','sara_plays','VN','true'],  ['U04','alex_pro','US','true'],
            ['U05','dragon_vn','VN','true'],   ['U06','ninja_jp','JP','true'],
            ['U07','noob_us','US','false'],    ['U08','pixel_vn','VN','true'],
            ['U09','frost_kr','KR','false'],   ['U10','blade_vn','VN','true'],
            ['U11','mage_jp','JP','true'],     ['U12','loot_us','US','false'],
            ['U13','iron_vn','VN','true'],     ['U14','owl_kr','KR','true'],
            ['U15','arcane_us','US','false'],  ['U16','thunder_vn','VN','true'],
            ['U17','silent_jp','JP','false'],  ['U18','rune_vn','VN','true'],
            ['U19','vortex_kr','KR','true'],   ['U20','ember_us','US','false'],
            ['U21','zen_jp','JP','true'],      ['U22','ghost_vn','VN','true']
          ]
        }
      },

      achievement: { name: 'Nhà vô địch chuẩn hóa', desc: 'hạ Boss chuẩn hóa' },
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
                intro: 'Bạn nhận brief: <em>"Thiết kế database cho MXH Gamers, scale 1 triệu user, 10 triệu post, 100 triệu like, query response &lt;100ms"</em>. 8 giờ deadline. Bạn bắt đầu từ đâu? Bài này là <strong>boss battle</strong> — tổng hợp 1NF → BCNF → M:N → indexing. Giải xong = pass môn.',
concept_cards: [
            {
                  "icon": "fa-crown",
                  "title": "Boss Battle — Hệ thống Mạng Xã Hội Gamers",
                  "body": "Bạn được giao thiết kế schema cho MXH Gamers: users, posts, games, genres, platforms, friends, likes, comments. Áp lực: 1 triệu user, 10 triệu post, 100 triệu like. <strong>Bạn bắt đầu từ đâu?</strong>",
                  "extra": "<strong>Liệt kê entity trước</strong> → xác định quan hệ → áp 1NF → BCNF → cuối cùng mới thêm junction table. Bắt đầu bằng entity giúp bạn không bỏ sót concept nào trước khi vẽ quan hệ.",
                  "variant": "interactive"
            },
            {
                  "icon": "fa-trophy",
                  "title": "Đáp án mẫu — 7 bảng cốt lõi chuẩn BCNF",
                  "body": "5 bảng chính: <code>users, posts, games, genres, platforms</code>. 2 junction cốt lõi: <code>post_games</code> (post ↔ game) và <code>game_genres</code> (game ↔ genre, tránh MVD). <strong>Đã 4NF</strong> vì mỗi MVD được tách riêng. <em>(Mở rộng tùy use-case: thêm <code>user_friends</code> cho follow, <code>post_likes</code> cho like — không bắt buộc cho schema cốt lõi.)</em> Tổng 7 bảng cốt lõi, query nhanh, không dư thừa."
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "Sau 4 vòng, bạn sẽ có một schema sạch cho Mạng Xã Hội Gamers: users, posts, games, genres, platforms, và các bảng junction."
            }
          ],
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
            ['U01','minh_gamer',  'minh@x.com','VN','true'],  ['U02','yuki_99',    'yuki@x.com','JP','false'],
            ['U03','sara_plays',  'sara@x.com','VN','true'],  ['U04','alex_pro',   'alex@x.com','US','true'],
            ['U05','dragon_vn',   'dragon@x.com','VN','true'], ['U06','ninja_jp', 'ninja@x.com','JP','true'],
            ['U07','noob_us',     'noob@x.com','US','false'],  ['U08','pixel_vn',  'pixel@x.com','VN','true'],
            ['U09','frost_kr',    'frost@x.com','KR','false'], ['U10','blade_vn',  'blade@x.com','VN','true'],
            ['U11','mage_jp',     'mage@x.com','JP','true'],   ['U12','loot_us',   'loot@x.com','US','false'],
            ['U13','iron_vn',     'iron@x.com','VN','true'],   ['U14','owl_kr',    'owl@x.com','KR','true'],
            ['U15','arcane_us',   'arcane@x.com','US','false'],['U16','thunder_vn','thunder@x.com','VN','true'],
            ['U17','silent_jp',   'silent@x.com','JP','false'],['U18','rune_vn',   'rune@x.com','VN','true'],
            ['U19','vortex_kr',   'vortex@x.com','KR','true'], ['U20','ember_us',  'ember@x.com','US','false'],
            ['U21','zen_jp',      'zen@x.com','JP','true'],    ['U22','ghost_vn',  'ghost@x.com','VN','true']
          ]
        },
                mission: 'Hoàn thành 4 vòng chiến bằng cách tách dần bảng <code class="code">gamers_social</code> khổng lồ thành schema sạch: <code class="code">users</code>, <code class="code">posts</code>, <code class="code">games</code>, <code class="code">genres</code>, <code class="code">platforms</code>, và các bảng junction.'
      },

      step_2: {
        mcq: [
          {
            question: 'Sau khi áp dụng đầy đủ 1NF → 2NF → 3NF → BCNF, Mạng Xã Hội Gamers nên có tối thiểu bao nhiêu bảng?',
            options: [
              { id: 'a', text: '1 bảng (gamers_social)', correct: false, explanation: 'Sai — 1 bảng chứa hết = vi phạm mọi NF (multivalued, partial dep, transitive dep). Schema nguyên thủy của Boss Battle.' },
              { id: 'b', text: '2 bảng (users + games)', correct: false, explanation: 'Sai — quá ít. Thiếu posts (1:N từ users), genres, platforms (M:N qua junction), và các junction tables.' },
              { id: 'c', text: '5 bảng chính (users, posts, games, genres, platforms) + 2 junction cốt lõi = 7 bảng', correct: true, explanation: 'Đúng — 5 entity chính (users, posts, games, genres, platforms) + 2 junction (post_game, post_genre). Đủ để cover M:N, 1:N, đạt BCNF.' },
              { id: 'd', text: '20 bảng (mỗi user một bảng riêng)', correct: false, explanation: 'Sai — 20 bảng là quá nhiều, gây over-engineering. Schema chuẩn BCNF cần ~7-10 bảng cho bài toán này.' }
            ]
          },
          {
            question: 'Boss Battle — junction table dùng cho quan hệ nào?',
            options: [
              { id: 'a', text: 'user ↔ post (1:N — không cần junction)', correct: false, explanation: 'Sai — 1:N chỉ cần FK ở bên N (post.user_id), không cần junction.' },
              { id: 'b', text: 'post ↔ game (M:N — mỗi post có thể nhắc nhiều game, mỗi game có thể ở nhiều post)', correct: true, explanation: 'Đúng — quan hệ M:N giữa post và game cần junction post_game(post_id, game_id). Mỗi dòng = 1 lần nhắc game trong post.' },
              { id: 'c', text: 'user ↔ country (1:1 — không cần junction)', correct: false, explanation: 'Sai — 1:1 hiếm gặp, thường gộp vào 1 bảng hoặc FK ở 1 bên. Không cần junction.' },
              { id: 'd', text: 'post ↔ post_date (cùng bảng)', correct: false, explanation: 'Sai — post_date là cột của post, không phải entity riêng. Cùng bảng, không cần junction.' }
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
                // NOTE on duplicate `post_id` column (index 0 PK 🔑 vs index 5 FK 🔗):
                // INTENTIONAL — decomp_game uses the same source column as TWO draggable
                // chips: one chip for the `posts` PK slot, another chip for the
                // `post_tags` junction FK slot. The icon difference (🔑 PK vs 🔗 FK)
                // signals the dual use. See decomp_game.js `chipCounter` for shared-FK
                // support. Do not "deduplicate" without rewriting the chip model.
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
        mission: 'BOSS BATTLE — Tìm <strong>top 3 user premium có nhiều post nhất</strong> — JOIN <code>users</code> ↔ <code>posts</code>, lọc premium, đếm + sắp xếp giảm dần.',
        blocks: [
          { type: 'kw',  token: 'SELECT',           slot: 'kw-select' },
          { type: 'col', token: 'u.username',       slot: 'col-1' },
          { type: 'col', token: 'u.country',        slot: 'col-2' },
          { type: 'fn',  token: 'COUNT(p.post_id)', slot: 'fn-count' },
          { type: 'kw',  token: 'AS',               slot: 'kw-as' },
          { type: 'col', token: 'post_count',       slot: 'col-alias' },
          { type: 'kw',  token: 'FROM',             slot: 'kw-from' },
          { type: 'tbl', token: 'users u',          slot: 'tbl' },
          { type: 'kw',  token: 'JOIN',             slot: 'kw-join' },
          { type: 'tbl', token: 'posts p',          slot: 'tbl2' },
          { type: 'kw',  token: 'ON',               slot: 'kw-on' },
          { type: 'col', token: 'p.user_id = u.user_id', slot: 'col-on' },
          { type: 'kw',  token: 'WHERE',            slot: 'kw-where' },
          { type: 'col', token: 'u.is_premium',     slot: 'wcol-1' },
          { type: 'op',  token: '=',                slot: 'op-1' },
          { type: 'val', token: 'true',             slot: 'val-1' },
          { type: 'kw',  token: 'GROUP BY',         slot: 'kw-group' },
          { type: 'col', token: 'u.user_id, u.username, u.country', slot: 'col-group' },
          { type: 'kw',  token: 'ORDER BY',         slot: 'kw-order' },
          { type: 'col', token: 'post_count',       slot: 'col-order' },
          { type: 'kw',  token: 'DESC',             slot: 'kw-desc' },
          { type: 'kw',  token: 'LIMIT',            slot: 'kw-limit' },
          { type: 'val', token: '3',                slot: 'val-limit' }
        ],
        drop_zones: [
          { id: 'select-line',  placeholder: 'SELECT ____ , ____ , COUNT(...) AS ____',   accepts: ['kw', 'col', 'fn'], acceptedKeywords: ['SELECT', 'AS'], multi: true },
          { id: 'from-line',    placeholder: 'FROM ____ JOIN ____ ON ____',                accepts: ['kw', 'tbl', 'col'], acceptedKeywords: ['FROM', 'JOIN', 'ON'], multi: true },
          { id: 'where-line',   placeholder: 'WHERE ____ ____ ____',                       accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE', 'AND', 'OR', 'IN'], multi: true },
          { id: 'group-line',   placeholder: 'GROUP BY ____',                               accepts: ['kw', 'col'], acceptedKeywords: ['GROUP BY'], multi: true },
          { id: 'order-line',   placeholder: 'ORDER BY ____ DESC LIMIT ____',               accepts: ['kw', 'col', 'val'], acceptedKeywords: ['ORDER BY', 'DESC', 'LIMIT'], multi: true }
        ],
        expected_sql: "SELECT u.username, u.country, COUNT(p.post_id) AS post_count FROM users u JOIN posts p ON p.user_id = u.user_id WHERE u.is_premium = true GROUP BY u.user_id, u.username, u.country ORDER BY post_count DESC LIMIT 3;",
        reveal_hints: {
          'select-line':  'SELECT <strong>u.username</strong>, <strong>u.country</strong> + <strong>COUNT(p.post_id) AS post_count</strong> — đếm số post.',
          'from-line':    'FROM <strong>users u</strong> JOIN <strong>posts p</strong> ON <strong>p.user_id = u.user_id</strong> — nối 2 bảng.',
          'where-line':   'WHERE <strong>u.is_premium = true</strong> — chỉ lấy user premium.',
          'group-line':   'GROUP BY <strong>u.user_id, u.username, u.country</strong> — gom theo user.',
          'order-line':   'ORDER BY <strong>post_count DESC</strong> + <strong>LIMIT 3</strong> — top 3 post nhiều nhất.'
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
            ['U01','minh_gamer',  'minh@x.com','VN','true'],  ['U02','yuki_99',    'yuki@x.com','JP','false'],
            ['U03','sara_plays',  'sara@x.com','VN','true'],  ['U04','alex_pro',   'alex@x.com','US','true'],
            ['U05','dragon_vn',   'dragon@x.com','VN','true'], ['U06','ninja_jp', 'ninja@x.com','JP','true'],
            ['U07','noob_us',     'noob@x.com','US','false'],  ['U08','pixel_vn',  'pixel@x.com','VN','true'],
            ['U09','frost_kr',    'frost@x.com','KR','false'], ['U10','blade_vn',  'blade@x.com','VN','true'],
            ['U11','mage_jp',     'mage@x.com','JP','true'],   ['U12','loot_us',   'loot@x.com','US','false'],
            ['U13','iron_vn',     'iron@x.com','VN','true'],   ['U14','owl_kr',    'owl@x.com','KR','true'],
            ['U15','arcane_us',   'arcane@x.com','US','false'],['U16','thunder_vn','thunder@x.com','VN','true'],
            ['U17','silent_jp',   'silent@x.com','JP','false'],['U18','rune_vn',   'rune@x.com','VN','true'],
            ['U19','vortex_kr',   'vortex@x.com','KR','true'], ['U20','ember_us',  'ember@x.com','US','false'],
            ['U21','zen_jp',      'zen@x.com','JP','true'],    ['U22','ghost_vn',  'ghost@x.com','VN','true']
          ]
        },
        // PHASE 4A-E2: thêm related_schemas: [posts] (per §DATA-E2 council cấp). Schema step_4 trước đó CHỈ có users → JOIN posts ra 0 dòng.
        // Counts: premium users U01=5, U05=4, U03=3, U08=2, U10=1; non-premium U02=2, U07=1 (loại bỏ bởi WHERE is_premium=true).
        // Top 3 (premium only): U01(minh_gamer,VN)=5, U05(dragon_vn,VN)=4, U03(sara_plays,VN)=3.
        related_schemas: [
          {
            table_name: 'posts',
            columns: [
              { name: 'post_id',  type: 'INT',  key: 'PK' },
              { name: 'user_id',  type: 'INT',  key: 'FK' },
              { name: 'post_text',type: 'VARCHAR', key: '' }
            ],
            data: [
              ['P01','U01','Clear Elden Ring!'],
              ['P02','U01','Boss tips'],
              ['P03','U01','Build guide'],
              ['P04','U01','PvP montage'],
              ['P05','U01','Lore thread'],
              ['P06','U05','Ranked climb'],
              ['P07','U05','Deck list'],
              ['P08','U05','Patch notes'],
              ['P09','U05','Tier list'],
              ['P10','U03','Speedrun WR'],
              ['P11','U03','Glitch found'],
              ['P12','U03','Route guide'],
              ['P13','U08','New skin'],
              ['P14','U08','Event recap'],
              ['P15','U10','First post'],
              ['P16','U02','(non-premium)'],
              ['P17','U02','(non-premium)'],
              ['P18','U07','(non-premium)']
            ]
          }
        ],
        expected_sql: "SELECT u.username, u.country, COUNT(p.post_id) AS post_count FROM users u JOIN posts p ON p.user_id = u.user_id WHERE u.is_premium = true GROUP BY u.user_id, u.username, u.country ORDER BY post_count DESC LIMIT 3;",
        hints: [
          { level: 1, text: 'Boss Battle! Bạn cần <em>kết hợp dữ liệu từ 2 bảng</em> (users và posts), lọc theo điều kiện, đếm, sắp xếp, lấy top. Hãy nghĩ: dùng JOIN + GROUP BY + ORDER BY + LIMIT.' },
          { level: 2, text: 'Cần <code>JOIN users ↔ posts</code> qua <code>user_id</code>.' },
          { level: 3, text: '<code>WHERE is_premium = true</code> + <code>GROUP BY u.user_id, u.username, u.country</code>' },
          { level: 4, text: "<code class=\"code\">SELECT u.username, u.country, COUNT(p.post_id) AS post_count FROM users u JOIN posts p ON p.user_id = u.user_id WHERE u.is_premium = true GROUP BY u.user_id, u.username, u.country ORDER BY post_count DESC LIMIT 3;</code>" }
        ],
        success_message: '👑 CHÚC MỪNG! Bạn đã trở thành KIẾN TRÚC SƯ CSDL! Bạn đã chinh phục 14 bài Module 1+2, từ Entity/PK cơ bản đến chuẩn hóa 4NF + multi-table JOIN trên hệ thống Mạng Xã Hội Gamers phức tạp. Sắp tới Module 3 — bước vào thế giới Ứng dụng Thực tế (JSON, Spatial, ORM, Web Services, Bảo mật).',
        xp_reward: 100
      }
    },

    {
      id: 'db_14', index: 15,
      title: 'JSON trong Database — Path Expressions',
      subtitle: 'Lưu và truy vấn JSON bên trong cột quan hệ',
      module: 3, module_title: 'Application Design',
      icon: '&#123;...&#125;', color: '#8B5CF6',
      estimated_minutes: 18, xp_reward: 60,
      drag_type: 'chip',
      challenge_type: 'full_ide',

      achievement: { name: 'Thợ lặn JSON', desc: 'truy vấn JSON path' },
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
                intro: 'Điều gì xảy ra khi 1 user có 30 settings (theme, language, notification, font_size, ...)? Tạo 30 cột? Thêm setting mới = ALTER TABLE = downtime 5 phút. Hay lưu vào 1 cột <code>JSONB</code>? 1 lần INSERT, schema không đổi. PostgreSQL cho query JSON cực nhanh với GIN index. Bài này dạy <strong>JSON in Relational</strong>.',
concept_cards: [
            {
                  "icon": "fa-brackets-curly",
                  "title": "JSONB — Tủ đồ cá nhân",
                  "body": "Hãy nghĩ <strong>JSONB</strong> như tủ đồ trong phòng: bạn nhét gì cũng được — quần áo, sách, đồ chơi, không ai ép bạn theo khuôn. Còn cột quan hệ như nhà kho công ty: mỗi ô đều có nhãn, mọi thứ đúng chỗ. JSONB = linh hoạt cho settings, preferences, tags. Quan hệ = chặt chẽ cho orders, users."
            },
            {
                  "icon": "fa-database",
                  "title": "JSON Path Operators",
                  "body": "<code>-&gt;</code> lấy element (trả JSON), <code>-&gt;&gt;</code> lấy element (trả TEXT), <code>#&gt;</code> lấy nested path, <code>@&gt;</code> kiểm tra contains. <strong>Index GIN</strong> trên JSONB column → query <code>WHERE settings @&gt; '{...}'</code> chạy nhanh như index B-tree trên cột thường."
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "Query settings->>\\'theme\\' trả về text thuần (dark, light…)."
            }
          ],
                visual: {
          // NOTE: legacy `diagram_legacy_N:` keys below are deprecated copy-paste
          // from earlier lessons. The render loop reads only `diagram:` (last one wins).
          // Do NOT add new `diagram:` keys at the end of this block; doing so will silently
          // swap the rendered diagram. Use `diagram:` (single key) or refactor to `diagrams: [...]`.
          
          
          diagram_legacy_1: {"type": "nf", "before": {"title": "TRƯỚC — 1 bảng tổng (BAD)", "columns": ["user_id", "username", "post_id", "post_text", "game_name", "genre"], "rows": [["U1", "alice", "P1", "My first post", "Elden Ring", "RPG"], ["U1", "alice", "P1", "My first post", "Elden Ring", "Action"], ["U2", "bob", "P2", "Check this", "Hades", "Rogue"]], "violations": {"0-5": true, "0-4": true, "1-5": true, "1-4": true}}, "after": {"title": "SAU — 5 bảng + 2 junction", "columns": ["user_id", "post_id", "game_id", "genre_id", "platform_id"], "rows": [["U1", "P1", "G1", "G_RPG", "PC"], ["U1", "P1", "G1", "G_Act", "PC"], ["U2", "P2", "G2", "G_Rog", "PS5"]]}, "note": "7 bảng: users, posts, games, genres, platforms + post_game (junction), post_genre (junction)."},
          
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
            ['U04','alex_dev','{"theme":"auto","notifications":true,"lang":"vi"}','2026-01-13'],
            ['U05','nam_dev','{"theme":"dark","notifications":false,"lang":"vi"}','2026-01-14'],
            ['U06','lan_dev','{"theme":"light","notifications":true,"lang":"en"}','2026-01-15'],
            ['U07','hung_dev','{"theme":"dark","notifications":true,"lang":"vi"}','2026-01-16'],
            ['U08','mai_dev','{"theme":"auto","notifications":false,"lang":"en"}','2026-01-17'],
            ['U09','tu_dev','{"theme":"dark","notifications":true,"lang":"vi"}','2026-01-18'],
            ['U10','linh_dev','{"theme":"light","notifications":true,"lang":"vi"}','2026-01-19'],
            ['U11','phuc_dev','{"theme":"dark","notifications":false,"lang":"en"}','2026-01-20'],
            ['U12','quan_dev','{"theme":"auto","notifications":true,"lang":"vi"}','2026-01-21'],
            ['U13','ha_dev','{"theme":"dark","notifications":true,"lang":"en"}','2026-01-22'],
            ['U14','dat_dev','{"theme":"light","notifications":false,"lang":"vi"}','2026-01-23'],
            ['U15','vy_dev','{"theme":"dark","notifications":true,"lang":"vi"}','2026-01-24'],
            ['U16','khoa_dev','{"theme":"auto","notifications":true,"lang":"en"}','2026-01-25'],
            ['U17','trang_dev','{"theme":"dark","notifications":false,"lang":"vi"}','2026-01-26'],
            ['U18','bao_dev','{"theme":"light","notifications":true,"lang":"en"}','2026-01-27'],
            ['U19','ngoc_dev','{"theme":"dark","notifications":true,"lang":"vi"}','2026-01-28'],
            ['U20','son_dev','{"theme":"auto","notifications":false,"lang":"vi"}','2026-01-29'],
            ['U21','thao_dev','{"theme":"dark","notifications":true,"lang":"en"}','2026-01-30'],
            ['U22','duc_dev','{"theme":"light","notifications":true,"lang":"vi"}','2026-01-31']
          ]
        },
        mission: 'Lấy <code class="code">username</code> và giá trị <code class="code">theme</code> từ JSON. Kéo thả khối lệnh ↓'
      },

      step_2: {
        mcq: [
          {
            question: 'Query nào trả về giá trị <strong>text thuần</strong> (không có nháy) từ JSON?',
            options: [
{ id: 'a', text: "SELECT settings->'theme' FROM app_users;", correct: false, format: 'code', explanation: 'Sai — toán tử -> trả về JSON value (có nháy kép). Muốn text thuần cần ->>.' },
          { id: 'b', text: "SELECT settings->>'theme' FROM app_users;", correct: true, format: 'code', explanation: 'Đúng — toán tử ->> trả về text (varchar). Nháy kép bị strip. Dùng để compare với string.' },
          { id: 'c', text: "SELECT settings#>'{theme}' FROM app_users;", correct: false, format: 'code', explanation: 'Sai — #> dùng cho path lookup (nested JSON), vẫn trả về JSON value. Để lấy text dùng #>>.' },
          { id: 'd', text: "SELECT theme FROM app_users;", correct: false, format: 'code', explanation: 'Sai — không có cột \'theme\' trong bảng. settings là JSONB column, cần ->> để extract.' }
            ]
          },
          {
            question: "Filter user có <code>notifications = true</code> trong JSONB. Cú pháp nào ĐÚNG?",
            options: [
              { id: 'a', text: "<code>WHERE settings->>notifications = true</code> — JSON value", correct: false, explanation: 'Sai — không có nháy quanh \'notifications\'. JSONB path yêu cầu chuỗi trong nháy. Và so sánh với true (boolean) không khớp với text \'true\'.' },
              { id: 'b', text: "<code>WHERE settings->>notifications = 'true'</code> — text với nháy đơn", correct: true, explanation: 'Đúng — ->> trả text, so sánh với \'true\' (string có nháy). Trong JSONB path \'notifications\' cần nháy đơn.' },
              { id: 'c', text: "<code>WHERE notifications = true</code> — cột thường", correct: false, explanation: 'Sai — không có cột \'notifications\' (chỉ có \'settings\' JSONB). Phải dùng ->> để extract field.' },
              { id: 'd', text: "<code>WHERE settings LIKE '%notifications%'</code> — string match (chậm + sai)", correct: false, explanation: 'Sai — LIKE chỉ match substring trong text representation. Không hiệu quả, sai ngữ nghĩa. Dùng ->>.' }
            ]
          }
        ],
        mini_game:         {
          "type": "match",
          "title": "Nối toán tử JSON → công dụng",
          "instruction": "Mỗi toán tử PostgreSQL JSON dùng để làm gì?",
          "xp": 25,
          "pairs": [
            {
              "left": "->",
              "leftId": "o1",
              "rightId": "r1",
              "right": {
                "id": "r1",
                "label": "Lấy JSON element (trả về JSON)"
              }
            },
            {
              "left": "->>",
              "leftId": "o2",
              "rightId": "r2",
              "right": {
                "id": "r2",
                "label": "Lấy JSON element (trả về TEXT)"
              }
            },
            {
              "left": "#>",
              "leftId": "o3",
              "rightId": "r3",
              "right": {
                "id": "r3",
                "label": "Lấy nested path (trả về JSON)"
              }
            },
            {
              "left": "@>",
              "leftId": "o4",
              "rightId": "r4",
              "right": {
                "id": "r4",
                "label": "Contains (kiểm tra chứa giá trị)"
              }
            }
          ],
          "solution": {
            "o1": "r1",
            "o2": "r2",
            "o3": "r3",
            "o4": "r4"
          }
        }
      },

      step_3: {
        mission: 'Đếm <strong>số user theo từng theme</strong> từ JSONB — dùng <code>GROUP BY settings->>\'theme\'</code>, sắp xếp giảm dần.',
        blocks: [
          { type: 'kw',  token: 'SELECT',           slot: 'kw-select' },
          { type: 'col', token: 'settings',          slot: 'col-1' },
          { type: 'op',  token: "->>'theme'",        slot: 'op-extract1' },
          { type: 'kw',  token: 'AS',                slot: 'kw-as' },
          { type: 'col', token: 'theme',             slot: 'col-alias1' },
          { type: 'fn',  token: 'COUNT(*)',          slot: 'fn-count' },
          { type: 'kw',  token: 'AS',                slot: 'kw-as2' },
          { type: 'col', token: 'user_count',        slot: 'col-alias2' },
          { type: 'kw',  token: 'FROM',              slot: 'kw-from' },
          { type: 'tbl', token: 'app_users',         slot: 'tbl' },
          { type: 'kw',  token: 'GROUP BY',          slot: 'kw-group' },
          { type: 'col', token: "settings->>'theme'", slot: 'col-group' },
          { type: 'kw',  token: 'ORDER BY',          slot: 'kw-order' },
          { type: 'col', token: 'user_count',        slot: 'col-order' },
          { type: 'kw',  token: 'DESC',              slot: 'kw-desc' }
        ],
        drop_zones: [
          { id: 'select-line',  placeholder: "SELECT settings->>'theme' AS theme, COUNT(*) AS ____", accepts: ['kw','col','op','fn'], acceptedKeywords: ['SELECT', 'AS'], multi: true },
          { id: 'from-line',    placeholder: 'FROM app_users',                                        accepts: ['kw','tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'group-line',   placeholder: "GROUP BY settings->>'theme'",                           accepts: ['kw','col'], acceptedKeywords: ['GROUP BY'], multi: true },
          { id: 'order-line',   placeholder: 'ORDER BY ____ DESC',                                    accepts: ['kw','col'], acceptedKeywords: ['ORDER BY', 'DESC'], multi: true }
        ],
        expected_sql: "SELECT settings->>'theme' AS theme, COUNT(*) AS user_count FROM app_users GROUP BY settings->>'theme' ORDER BY user_count DESC;",
        reveal_hints: {
          'select-line':  "<code>settings->>'theme'</code> trích xuất key từ JSON + <code>COUNT(*)</code> đếm user.",
          'from-line':    'Bảng <code>app_users</code> lưu settings dạng JSONB.',
          'group-line':   "<code>GROUP BY settings->>'theme'</code> — nhóm theo giá trị theme từ JSON.",
          'order-line':   '<code>ORDER BY user_count DESC</code> — theme nhiều user nhất lên đầu.'
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
            ['U05','nam_dev','{"theme":"dark","notifications":false,"lang":"vi"}'],
            ['U06','lan_dev','{"theme":"light","notifications":true,"lang":"en"}'],
            ['U07','hung_dev','{"theme":"dark","notifications":true,"lang":"vi"}'],
            ['U08','mai_dev','{"theme":"auto","notifications":false,"lang":"en"}'],
            ['U09','tu_dev','{"theme":"dark","notifications":true,"lang":"vi"}'],
            ['U10','linh_dev','{"theme":"light","notifications":true,"lang":"vi"}'],
            ['U11','phuc_dev','{"theme":"dark","notifications":false,"lang":"en"}'],
            ['U12','quan_dev','{"theme":"auto","notifications":true,"lang":"vi"}'],
            ['U13','ha_dev','{"theme":"dark","notifications":true,"lang":"en"}'],
            ['U14','dat_dev','{"theme":"light","notifications":false,"lang":"vi"}'],
            ['U15','vy_dev','{"theme":"dark","notifications":true,"lang":"vi"}'],
            ['U16','khoa_dev','{"theme":"auto","notifications":true,"lang":"en"}'],
            ['U17','trang_dev','{"theme":"dark","notifications":false,"lang":"vi"}'],
            ['U18','bao_dev','{"theme":"light","notifications":true,"lang":"en"}'],
            ['U19','ngoc_dev','{"theme":"dark","notifications":true,"lang":"vi"}'],
            ['U20','son_dev','{"theme":"auto","notifications":false,"lang":"vi"}'],
            ['U21','thao_dev','{"theme":"dark","notifications":true,"lang":"en"}'],
            ['U22','duc_dev','{"theme":"light","notifications":true,"lang":"vi"}']
          ]
        },
        expected_sql: "SELECT settings->>'theme' AS theme, COUNT(*) AS user_count FROM app_users GROUP BY settings->>'theme' ORDER BY user_count DESC;",
        hints: [
          { level: 1, text: "Bạn muốn <em>phân tích dữ liệu JSON linh hoạt</em> — trích xuất 1 key từ JSON, đếm số lượng theo từng giá trị của key đó, sắp xếp giảm dần. Hãy nghĩ: trích key = <code>-&gt;&gt;</code>, đếm = <code>COUNT</code>, nhóm = <code>GROUP BY</code>." },
          { level: 2, text: "<code>GROUP BY settings->>'theme'</code> — extract key từ JSON rồi GROUP như cột thường." },
          { level: 3, text: "<code>SELECT settings->>'theme' AS theme, COUNT(*)</code> — alias cho dễ đọc." },
          { level: 4, text: "<code class=\"code\">SELECT settings-&gt;&gt;'theme' AS theme, COUNT(*) AS user_count FROM app_users GROUP BY settings-&gt;&gt;'theme' ORDER BY user_count DESC;</code>" }
        ],
        success_message: 'JSONB + GROUP BY = phân tích dữ liệu linh hoạt. Không cần ALTER TABLE để thêm cột!',
        xp_reward: 60
      }
    },

    {
      id: 'db_15', index: 16,
      title: 'Spatial Data — Dữ liệu Không gian',
      subtitle: 'Truy vấn tọa độ GPS, tìm điểm gần nhất',
      module: 3, module_title: 'Application Design',
      icon: '&#128205;', color: '#10B981',
      estimated_minutes: 18, xp_reward: 60,
      drag_type: 'chip',
      challenge_type: 'full_ide',

      achievement: { name: 'Nhà bản đồ', desc: 'dữ liệu không gian' },
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
                intro: 'Mỗi phút, Grab xử lý 50.000 request tìm tài xế gần nhất trong bán kính 5km. 100 triệu điểm lưu trong DB. Không có spatial index = query quét full table = chết server. Có <strong>R-tree (GIST) index</strong> + <code>ST_DWithin</code> = tìm trong 10ms. Sai 1 số thập phân = lệch cả km. Bài này dạy <strong>Spatial Data</strong>.',
concept_cards: [
            {
                  "icon": "fa-location-dot",
                  "title": "Spatial Data — 1 số thập phân = lệch cả km",
                  "body": "Grab, Shopee, now lưu tọa độ 100 triệu điểm giao hàng. <strong>1 số thập phân longitude = ~11km tại xích đạo</strong>. Sai 2 số = lệch cả km → shipper đi lạc, khách hủy đơn, mất tiền. Spatial index (R-tree) tìm 10 quán gần nhất trong 10ms thay vì quét 100 triệu dòng."
            },
            {
                  "icon": "fa-globe",
                  "title": "POINT(lon, lat) — Sai thứ tự = lỗi im lặng",
                  "body": "<code>ST_MakePoint(lon, lat)</code> — <strong>longitude TRƯỚC</strong> (X), latitude SAU (Y). Sai thứ tự → tọa độ rác nhưng DB không báo lỗi. VN: lon ≈ 102-110, lat ≈ 8-23. <code>ST_DWithin(geo, center, 5000)</code> = trong bán kính 5km, có index = nhanh."
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "ST_Distance(geo_location, ST_MakePoint(106."
            }
          ],
                visual: {
          // NOTE: legacy `diagram_legacy_N:` keys below are deprecated copy-paste
          // from earlier lessons. The render loop reads only `diagram:` (last one wins).
          // Do NOT add new `diagram:` keys at the end of this block; doing so will silently
          // swap the rendered diagram. Use `diagram:` (single key) or refactor to `diagrams: [...]`.
          
          
          diagram_legacy_2: {"type": "nf", "before": {"title": "TRƯỚC — 1 bảng tổng (BAD)", "columns": ["user_id", "username", "post_id", "post_text", "game_name", "genre"], "rows": [["U1", "alice", "P1", "My first post", "Elden Ring", "RPG"], ["U1", "alice", "P1", "My first post", "Elden Ring", "Action"], ["U2", "bob", "P2", "Check this", "Hades", "Rogue"]], "violations": {"0-5": true, "0-4": true, "1-5": true, "1-4": true}}, "after": {"title": "SAU — 5 bảng + 2 junction", "columns": ["user_id", "post_id", "game_id", "genre_id", "platform_id"], "rows": [["U1", "P1", "G1", "G_RPG", "PC"], ["U1", "P1", "G1", "G_Act", "PC"], ["U2", "P2", "G2", "G_Rog", "PS5"]]}, "note": "7 bảng: users, posts, games, genres, platforms + post_game (junction), post_genre (junction)."},
          
          diagram_legacy_1: {"type": "flow", "steps": [{"icon": "fa-user", "title": "Web App / Form", "sub": "User thay đổi setting (theme: dark)", "payload": "POST /api/settings"}, {"icon": "fa-code", "title": "Python / Django ORM", "sub": "Validate + serialize sang JSONB", "payload": "settings = {'theme': 'dark'}"}, {"icon": "fa-server", "title": "PostgreSQL", "sub": "Lưu JSONB vào cột settings", "payload": "INSERT INTO app_users (..., settings) VALUES (...)"}, {"icon": "fa-arrow-rotate-left", "title": "ORM → Python dict", "sub": "Đọc lại: settings->>theme = \"dark\"", "payload": "SELECT settings->>'theme' FROM app_users"}, {"icon": "fa-display", "title": "HTML Response", "sub": "Render UI với theme mới", "payload": "<html data-theme=\"dark\">"}]},
          
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
            ['B01','Quận 1 Center',     '(106.7009, 10.7769)','TP.HCM'],
            ['B02','District 7 Hub',    '(106.7369, 10.7288)','TP.HCM'],
            ['B03','Hanoi Old Quarter', '(105.8542, 21.0285)','Hà Nội'],
            ['B04','District 3 Store',  '(106.6872, 10.7822)','TP.HCM'],
            ['B05','Bình Thạnh Mall',  '(106.7038, 10.8106)','TP.HCM'],
            ['B06','Thủ Đức Tech',     '(106.7710, 10.8494)','TP.HCM'],
            ['B07','Tân Bình Point',   '(106.6526, 10.8014)','TP.HCM'],
            ['B08','Hai Bà Trưng HN',   '(105.8480, 21.0080)','Hà Nội'],
            ['B09','Cầu Giấy HN',      '(105.7964, 21.0313)','Hà Nội'],
            ['B10','Đà Nẵng Center',   '(108.2022, 16.0544)','Đà Nẵng'],
            ['B11','Hải Châu DN',      '(108.2208, 16.0678)','Đà Nẵng'],
            ['B12','Phú Nhuận Store',  '(106.6800, 10.7990)','TP.HCM'],
            ['B13','Gò Vấp Hub',       '(106.6657, 10.8386)','TP.HCM'],
            ['B14','Quận 10 Plaza',    '(106.6670, 10.7730)','TP.HCM'],
            ['B15','Quận 4 Point',     '(106.7050, 10.7590)','TP.HCM'],
            ['B16','Cần Thơ Center',   '(105.7469, 10.0452)','Cần Thơ'],
            ['B17','Huế Store',        '(107.5847, 16.4637)','Huế'],
            ['B18','Nha Trang Bay',    '(109.1967, 12.2388)','Nha Trang'],
            ['B19','Quận 2 Hub',       '(106.7500, 10.7870)','TP.HCM'],
            ['B20','Bình Tân Mall',    '(106.6020, 10.7650)','TP.HCM'],
            ['B21','Long Biên HN',     '(105.8800, 21.0450)','Hà Nội'],
            ['B22','Quận 5 Plaza',     '(106.6634, 10.7540)','TP.HCM']
          ]
        },
        mission: 'Tính <code class="code">khoảng cách</code> từ mỗi cửa hàng đến trung tâm TP.HCM. Kéo thả khối lệnh ↓'
      },

      step_2: {
        mcq: [
          {
            question: 'Khi tìm cửa hàng <strong>trong bán kính 5km</strong> từ một điểm, hàm nào hiệu quả hơn?',
            options: [
              { id: 'a', text: '<code>ST_Distance(geo, ST_MakePoint(...)) &lt; 5</code> — tính chính xác mọi điểm', correct: false, explanation: 'Sai — ST_Distance tính chính xác cho MỌI cặp điểm, không dùng spatial index. Chậm trên dataset lớn (full table scan O(N)).' },
              { id: 'b', text: '<code>ST_DWithin(geo, ST_MakePoint(...), 5)</code> — dùng spatial index', correct: true, explanation: 'Đúng — ST_DWithin có tích hợp bounding box check trước → dùng spatial index (GIST) để nhanh loại điểm xa. Sau đó mới tính chính xác cho candidates. Nhanh hơn ~100x trên 1M rows.' },
              { id: 'c', text: '<code>ST_Contains(ST_MakeEnvelope(...), geo)</code> — dùng cho polygon', correct: false, explanation: 'Sai — ST_MakeEnvelope tạo bounding box HÌNH CHỮ NHẬT (4 góc lat/lon), không phải hình tròn. Dùng cho rectangular query, không match "bán kính" (circle).' },
              { id: 'd', text: '<code>WHERE distance &lt; 5</code> — sai cú pháp, distance chưa tính', correct: false, explanation: 'Sai — "distance" là alias cần define trước (SELECT ST_Distance(...) AS distance). Cú pháp đúng phải tính distance trong SELECT hoặc dùng ST_Distance inline.' }
            ]
          },
          {
            question: 'ST_MakePoint(x, y) dùng thứ tự tọa độ nào?',
            options: [
              { id: 'a', text: 'ST_MakePoint(lat, lon) — latitude trước', correct: false, explanation: 'Sai — PostGIS dùng lon, lat (theo chuẩn X, Y). Lat trước sẽ swap kinh độ/vĩ độ → điểm rơi vào chỗ SAI (vd: TP.HCM ở đại dương).' },
              { id: 'b', text: 'ST_MakePoint(lon, lat) — longitude trước (X, Y)', correct: true, explanation: 'Đúng — PostGIS theo chuẩn X (longitude) trước, Y (latitude) sau. SRID 4326 (WGS84) dùng (lon, lat). Đây là chuẩn ISO 6709.' },
              { id: 'c', text: 'ST_MakePoint(x, y) — thứ tự tùy database', correct: false, explanation: 'Sai — PostGIS deterministic — luôn (X=lon, Y=lat). Có thể tạo POINT với SRID khác (UTM, Mercator) nhưng thứ tự vẫn X-Y.' },
              { id: 'd', text: 'ST_MakePoint(utm_x, utm_y) — luôn dùng UTM', correct: false, explanation: 'Sai — ST_MakePoint dùng cho POINT trong bất kỳ SRID nào. UTM chỉ là 1 SRID, không phải mặc định. SRID 4326 (lat/lon) là phổ biến nhất.' }
            ]
          }
        ],
        mini_game:         {
          "type": "order",
          "title": "Thứ tự thực thi Spatial Query",
          "instruction": "Sắp xếp theo thứ tự DB engine xử lý câu SQL spatial.",
          "xp": 25,
          "items": [
            {
              "id": "s1",
              "label": "1. FROM shop_branches"
            },
            {
              "id": "s2",
              "label": "2. WHERE ST_DWithin(geo, center, 5000)"
            },
            {
              "id": "s3",
              "label": "3. SELECT name, ST_Distance(geo, center) AS distance"
            },
            {
              "id": "s4",
              "label": "4. ORDER BY distance ASC LIMIT 10"
            }
          ],
          "solution": {
            "s1": 1,
            "s2": 2,
            "s3": 3,
            "s4": 4
          }
        }
      },

      step_3: {
        mission: 'Đếm <strong>số cửa hàng theo từng zone</strong> ở TP.HCM trong bán kính 10km — dùng <code>ST_DWithin</code> + <code>GROUP BY zone</code>.',
        blocks: [
          { type: 'kw',  token: 'SELECT',    slot: 'kw-select' },
          { type: 'col', token: 'zone',       slot: 'col-1' },
          { type: 'fn',  token: 'COUNT(*)',   slot: 'fn-count' },
          { type: 'kw',  token: 'AS',         slot: 'kw-as' },
          { type: 'col', token: 'branch_count', slot: 'col-alias' },
          { type: 'kw',  token: 'FROM',       slot: 'kw-from' },
          { type: 'tbl', token: 'shop_branches', slot: 'tbl' },
          { type: 'kw',  token: 'WHERE',      slot: 'kw-where' },
          { type: 'col', token: 'city',        slot: 'wcol-1' },
          { type: 'op',  token: '=',           slot: 'op-1' },
          { type: 'val', token: "'TP.HCM'",   slot: 'val-1' },
          { type: 'kw',  token: 'AND',        slot: 'kw-and' },
          { type: 'fn',  token: 'ST_DWithin', slot: 'fn-dwithin' },
          { type: 'op',  token: '(geo_location, ST_MakePoint(106.7009, 10.7769), 10)', slot: 'fn-dw-args' },
          { type: 'kw',  token: 'GROUP BY',   slot: 'kw-group' },
          { type: 'col', token: 'zone',        slot: 'col-group' },
          { type: 'kw',  token: 'ORDER BY',   slot: 'kw-order' },
          { type: 'col', token: 'branch_count', slot: 'col-order' },
          { type: 'kw',  token: 'DESC',       slot: 'kw-desc' }
        ],
        drop_zones: [
          { id: 'select-line',  placeholder: 'SELECT ____ , COUNT(*) AS ____',                     accepts: ['kw','col','fn'], acceptedKeywords: ['SELECT', 'AS'], multi: true },
          { id: 'from-line',    placeholder: 'FROM shop_branches',                                  accepts: ['kw','tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line',   placeholder: "WHERE city = ____ AND ST_DWithin(..., 10)",           accepts: ['kw','col','op','val','fn'], acceptedKeywords: ['WHERE', 'AND', 'OR', 'IN'], multi: true },
          { id: 'group-line',   placeholder: 'GROUP BY ____',                                       accepts: ['kw','col'], acceptedKeywords: ['GROUP BY'], multi: true },
          { id: 'order-line',   placeholder: 'ORDER BY ____ DESC',                                  accepts: ['kw','col'], acceptedKeywords: ['ORDER BY', 'DESC'], multi: true }
        ],
        expected_sql: "SELECT zone, COUNT(*) AS branch_count FROM shop_branches WHERE city = 'TP.HCM' AND ST_DWithin(geo_location, ST_MakePoint(106.7009, 10.7769), 10) GROUP BY zone ORDER BY branch_count DESC;",
        reveal_hints: {
          'select-line':  'SELECT <strong>zone</strong> + <strong>COUNT(*) AS branch_count</strong> — đếm cửa hàng theo zone.',
          'from-line':    'FROM <strong>shop_branches</strong>.',
          'where-line':   "WHERE <strong>city = 'TP.HCM'</strong> AND <strong>ST_DWithin(..., 10)</strong> — lọc TP.HCM + bán kính 10km.",
          'group-line':   'GROUP BY <strong>zone</strong> — gom theo khu vực.',
          'order-line':   'ORDER BY <strong>branch_count DESC</strong> — zone nhiều cửa hàng nhất lên đầu.'
        }
      },

      step_4: {
        prompt: 'Viết query đếm <strong>số cửa hàng theo từng zone</strong> trong TP.HCM, chỉ cửa hàng <strong>trong bán kính 10km</strong> từ trung tâm. GROUP BY zone, sắp xếp giảm dần.',
        starter: "-- Đếm cửa hàng theo zone (TP.HCM, bán kính 10km từ trung tâm)\n-- ST_DWithin + GROUP BY zone + ORDER BY count DESC\nSELECT , COUNT(*) AS \n  FROM shop_branches\n WHERE city = 'TP.HCM'\n   AND ST_DWithin(geo_location, ST_MakePoint(, ), )\n GROUP BY \n ORDER BY  DESC;\n",
        /* 4A-E3-equiv Bài 16: equiv_sql dùng cột phẳng within_10km — engine không làm PostGIS,
         * council tính khoảng cách 22 branch từ tâm B01 (106.7009, 10.7769), bán kính 10km:
         *   yes (≤10km, TP.HCM): B01·B02·B04·B05·B07·B12·B13·B14·B15·B19·B22 (11)
         *   no (TP.HCM ngoài 10km): B06 (East, ~11.1km) · B20 (West, ~10.9km)
         *   no (khác tỉnh): B03·B08·B09·B21 (HN) · B10·B11 (ĐN) · B16 (CT) · B17 (Huế) · B18 (NT)
         * Verify: Downtown 4 · South 3 · North 2 · East 1 · West 1 (5 zone ORDER DESC, top=4). */
        equiv_sql: "SELECT zone, COUNT(*) AS branch_count FROM shop_branches WHERE city = 'TP.HCM' AND within_10km = 'yes' GROUP BY zone ORDER BY branch_count DESC;",
        schema: {
          table_name: 'shop_branches',
          columns: [
            { name: 'branch_id',    type: 'VARCHAR', key: 'PK', icon: '&#128273;' },
            { name: 'name',         type: 'VARCHAR', key: '',  icon: '' },
            { name: 'geo_location', type: 'POINT',   key: '',  icon: '&#128205;' },
            { name: 'city',         type: 'VARCHAR', key: '',  icon: '' },
            { name: 'zone',         type: 'VARCHAR', key: '',  icon: '' },
            { name: 'within_10km',  type: 'VARCHAR', key: '',  icon: '&#127757;' }
          ],
          data: [
            ['B01','Quận 1 Center',     '(106.7009, 10.7769)','TP.HCM','Downtown','yes'],
            ['B02','District 7 Hub',    '(106.7369, 10.7288)','TP.HCM','South','yes'],
            ['B03','Hanoi Old Quarter', '(105.8542, 21.0285)','Hà Nội','Old City','no'],
            ['B04','District 3 Store',  '(106.6872, 10.7822)','TP.HCM','Downtown','yes'],
            ['B05','Bình Thạnh Mall',  '(106.7038, 10.8106)','TP.HCM','North','yes'],
            ['B06','Thủ Đức Tech',     '(106.7710, 10.8494)','TP.HCM','East','no'],
            ['B07','Tân Bình Point',   '(106.6526, 10.8014)','TP.HCM','South','yes'],
            ['B08','Hai Bà Trưng HN',  '(105.8480, 21.0080)','Hà Nội','Old City','no'],
            ['B09','Cầu Giấy HN',      '(105.7964, 21.0313)','Hà Nội','North','no'],
            ['B10','Đà Nẵng Center',   '(108.2022, 16.0544)','Đà Nẵng','Downtown','no'],
            ['B11','Hải Châu DN',      '(108.2208, 16.0678)','Đà Nẵng','South','no'],
            ['B12','Phú Nhuận Store',  '(106.6800, 10.7990)','TP.HCM','Downtown','yes'],
            ['B13','Gò Vấp Hub',       '(106.6657, 10.8386)','TP.HCM','North','yes'],
            ['B14','Quận 10 Plaza',    '(106.6670, 10.7730)','TP.HCM','Downtown','yes'],
            ['B15','Quận 4 Point',     '(106.7050, 10.7590)','TP.HCM','South','yes'],
            ['B16','Cần Thơ Center',   '(105.7469, 10.0452)','Cần Thơ','Downtown','no'],
            ['B17','Huế Store',        '(107.5847, 16.4637)','Huế','Old City','no'],
            ['B18','Nha Trang Bay',    '(109.1967, 12.2388)','Nha Trang','Downtown','no'],
            ['B19','Quận 2 Hub',       '(106.7500, 10.7870)','TP.HCM','East','yes'],
            ['B20','Bình Tân Mall',    '(106.6020, 10.7650)','TP.HCM','West','no'],
            ['B21','Long Biên HN',     '(105.8800, 21.0450)','Hà Nội','North','no'],
            ['B22','Quận 5 Plaza',     '(106.6634, 10.7540)','TP.HCM','West','yes']
          ]
        },
        expected_sql: "SELECT zone, COUNT(*) AS branch_count FROM shop_branches WHERE city = 'TP.HCM' AND ST_DWithin(geo_location, ST_MakePoint(106.7009, 10.7769), 10) GROUP BY zone ORDER BY branch_count DESC;",
        hints: [
          { level: 1, text: "Bạn cần <em>kết hợp spatial filter + aggregation</em>. Lọc TP.HCM → lọc bán kính 10km quanh trung tâm → nhóm theo zone → đếm → sắp xếp. Hãy nghĩ: filter trước (WHERE), aggregate sau (GROUP BY)." },
          { level: 2, text: "<code>WHERE city = 'TP.HCM'</code> — lọc TP.HCM trước." },
          { level: 3, text: "<code>AND ST_DWithin(geo_location, ST_MakePoint(106.7009, 10.7769), 10)</code> — lọc bán kính 10km." },
          { level: 4, text: "<code class=\"code\">SELECT zone, COUNT(*) AS branch_count FROM shop_branches WHERE city = 'TP.HCM' AND ST_DWithin(geo_location, ST_MakePoint(106.7009, 10.7769), 10) GROUP BY zone ORDER BY branch_count DESC;</code>" }
        ],
        success_message: 'Spatial + GROUP BY = phân tích vùng phủ cửa hàng cực kỳ hiệu quả! ST_DWithin + GiST index = O(log n).',
        xp_reward: 60
      }
    },

    {
      id: 'db_16', index: 17,
      title: 'ORM với Django — Ánh xạ Class ↔ Table',
      subtitle: 'Từ Python class đến SQL query tự động',
      module: 3, module_title: 'Application Design',
      icon: '&#9881;', color: '#F59E0B',
      estimated_minutes: 18, xp_reward: 60,
      drag_type: 'order',
      challenge_type: 'full_ide',

      achievement: { name: 'Pháp sư ORM', desc: 'class Python ↔ bảng' },
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
                intro: 'Team dev 1 startup fintech 5 người, mỗi người tự viết SQL cho module mình. 6 tháng sau: 1 người nghỉ, người thay phải đọc 200 query SQL viết tay, mất 3 tuần mới hiểu hết. Refactor sang <strong>Django ORM</strong> → 1 dev mới onboard trong 3 ngày. ORM = documentation sống. Nhưng có cạm bẫy N+1 — bài này dạy cả 2 mặt.',
concept_cards: [
            {
                  "icon": "fa-layer-group",
                  "title": "ORM — Câu chuyện team 3 người",
                  "body": "Team A: 3 dev backend, ai cũng viết SQL thuần. 1 người nghỉ → 2 người còn lại đọc SQL của người nghỉ mất 2 tuần. Team B: 3 dev, dùng Django ORM. 1 người nghỉ → 2 người còn lại đọc <code>User.objects.filter(role=\"admin\")</code> hiểu ngay. <strong>ORM = code đọc gần như tiếng Anh</strong>."
            },
            {
                  "icon": "fa-bolt",
                  "title": "N+1 Query — Cạm bẫy ORM",
                  "body": "1000 users, mỗi user có 5 posts. Code <code>for user in users: print(user.posts.all())</code> → <strong>1 + 1000 = 1001 queries</strong>! Fix: <code>users = User.objects.prefetch_related(\"posts\")</code> → chỉ 2 queries. <strong>Ưu</strong> ORM: ít SQL, type-safe. <strong>Nhược</strong>: dễ N+1, raw SQL phức tạp vẫn cần."
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "LogEvent."
            }
          ],
                visual: {
          // NOTE: legacy `diagram_legacy_N:` keys below are deprecated copy-paste
          // from earlier lessons. The render loop reads only `diagram:` (last one wins).
          // Do NOT add new `diagram:` keys at the end of this block; doing so will silently
          // swap the rendered diagram. Use `diagram:` (single key) or refactor to `diagrams: [...]`.
          
          
          diagram_legacy_3: {"type": "nf", "before": {"title": "TRƯỚC — 1 bảng tổng (BAD)", "columns": ["user_id", "username", "post_id", "post_text", "game_name", "genre"], "rows": [["U1", "alice", "P1", "My first post", "Elden Ring", "RPG"], ["U1", "alice", "P1", "My first post", "Elden Ring", "Action"], ["U2", "bob", "P2", "Check this", "Hades", "Rogue"]], "violations": {"0-5": true, "0-4": true, "1-5": true, "1-4": true}}, "after": {"title": "SAU — 5 bảng + 2 junction", "columns": ["user_id", "post_id", "game_id", "genre_id", "platform_id"], "rows": [["U1", "P1", "G1", "G_RPG", "PC"], ["U1", "P1", "G1", "G_Act", "PC"], ["U2", "P2", "G2", "G_Rog", "PS5"]]}, "note": "7 bảng: users, posts, games, genres, platforms + post_game (junction), post_genre (junction)."},
          
          diagram_legacy_2: {"type": "flow", "steps": [{"icon": "fa-user", "title": "Web App / Form", "sub": "User thay đổi setting (theme: dark)", "payload": "POST /api/settings"}, {"icon": "fa-code", "title": "Python / Django ORM", "sub": "Validate + serialize sang JSONB", "payload": "settings = {'theme': 'dark'}"}, {"icon": "fa-server", "title": "PostgreSQL", "sub": "Lưu JSONB vào cột settings", "payload": "INSERT INTO app_users (..., settings) VALUES (...)"}, {"icon": "fa-arrow-rotate-left", "title": "ORM → Python dict", "sub": "Đọc lại: settings->>theme = \"dark\"", "payload": "SELECT settings->>'theme' FROM app_users"}, {"icon": "fa-display", "title": "HTML Response", "sub": "Render UI với theme mới", "payload": "<html data-theme=\"dark\">"}]},
          
          diagram_legacy_1: {"type": "flow", "steps": [{"icon": "fa-map-pin", "title": "User location", "sub": "Browser geolocation API", "payload": "(106.7, 10.78)"}, {"icon": "fa-mobile", "title": "Mobile App", "sub": "POST /api/nearest?lat=10.78&lon=106.7", "payload": "GET /nearest"}, {"icon": "fa-code", "title": "Django + GeoDjango", "sub": "Build query PostGIS", "payload": "ST_DWithin(geo, point, 5000)"}, {"icon": "fa-server", "title": "PostgreSQL + PostGIS", "sub": "Spatial index (GIST)", "payload": "shop_branches WHERE ST_DWithin(...)"}, {"icon": "fa-list", "title": "Sorted by distance", "sub": "ST_Distance ORDER BY", "payload": "ORDER BY dist ASC LIMIT 5"}]},
          
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
            ['E01','U01','login',   '{"ip":"1.1.1.1"}',        '2026-01-10 08:00:00'],
            ['E02','U02','logout',  '{"session":"sess_abc"}',  '2026-01-10 09:30:00'],
            ['E03','U01','purchase','{"amount":500000}',      '2026-01-10 10:00:00'],
            ['E04','U01','login',   '{"ip":"1.1.1.2"}',        '2026-01-11 08:05:00'],
            ['E05','U03','login',   '{"ip":"2.2.2.1"}',        '2026-01-11 09:00:00'],
            ['E06','U01','logout',  '{"session":"sess_def"}',  '2026-01-11 18:00:00'],
            ['E07','U02','purchase','{"amount":120000}',      '2026-01-12 11:00:00'],
            ['E08','U04','login',   '{"ip":"3.3.3.1"}',        '2026-01-12 08:30:00'],
            ['E09','U01','login',   '{"ip":"1.1.1.3"}',        '2026-01-13 08:10:00'],
            ['E10','U03','purchase','{"amount":250000}',      '2026-01-13 14:00:00'],
            ['E11','U05','login',   '{"ip":"4.4.4.1"}',        '2026-01-13 09:15:00'],
            ['E12','U01','purchase','{"amount":75000}',       '2026-01-14 12:00:00'],
            ['E13','U02','login',   '{"ip":"2.2.2.5"}',        '2026-01-14 08:00:00'],
            ['E14','U04','logout',  '{"session":"sess_ghi"}',  '2026-01-14 17:30:00'],
            ['E15','U01','login',   '{"ip":"1.1.1.4"}',        '2026-01-15 08:00:00'],
            ['E16','U06','login',   '{"ip":"5.5.5.1"}',        '2026-01-15 09:00:00'],
            ['E17','U03','login',   '{"ip":"2.2.2.7"}',        '2026-01-15 10:00:00'],
            ['E18','U01','logout',  '{"session":"sess_jkl"}',  '2026-01-15 18:30:00'],
            ['E19','U05','purchase','{"amount":340000}',      '2026-01-16 13:00:00'],
            ['E20','U02','login',   '{"ip":"2.2.2.9"}',        '2026-01-16 08:00:00'],
            ['E21','U01','login',   '{"ip":"1.1.1.5"}',        '2026-01-17 08:00:00'],
            ['E22','U04','login',   '{"ip":"3.3.3.4"}',        '2026-01-17 09:00:00']
          ]
        },
        mission: 'Viết Django ORM query tương đương SQL. Kéo thả khối lệnh ↓'
      },

      step_2: {
        mcq: [
          {
            question: '<code>LogEvent.objects.select_related(\'user\')</code> sinh ra loại JOIN nào?',
            options: [
              { id: 'a', text: 'LEFT JOIN — lấy cả event không có user', correct: false, explanation: 'Sai — select_related mặc định INNER JOIN. LEFT JOIN chỉ khi explicit dùng prefetch_related hoặc custom raw SQL.' },
              { id: 'b', text: 'INNER JOIN — chỉ lấy event có user tồn tại', correct: true, explanation: 'Đúng — select_related dùng SQL JOIN INNER mặc định. Event không có user (FK NULL hoặc user bị xóa) sẽ bị loại khỏi kết quả.' },
              { id: 'c', text: 'OUTER JOIN — lấy tất cả kể cả user NULL', correct: false, explanation: 'Sai — OUTER JOIN không phải default của select_related. Cần explicit annotation (vd: .annotate(user_name=F(\'user__username\')) với LEFT JOIN logic).' },
              { id: 'd', text: 'CROSS JOIN — tổ hợp mọi cặp (hiếm dùng)', correct: false, explanation: 'Sai — select_related không tạo CROSS JOIN. Nó follow FK relationship → 1 JOIN cụ thể. CROSS JOIN rất hiếm, không phải pattern này.' }
            ]
          },
          {
            question: 'Django ORM nào tương đương <code>GROUP BY event_type ORDER BY COUNT(*) DESC</code>?',
            options: [
              { id: 'a', text: "<code>.values('event_type').order_by('event_type')</code>", correct: false, explanation: 'Sai — order_by không có annotate Count → không có COUNT trong query. Chỉ SELECT event_type, ORDER BY event_type ASC. Thiếu GROUP BY và aggregate.' },
              { id: 'b', text: "<code>.values('event_type').annotate(cnt=Count('id')).order_by('-cnt')</code>", correct: true, explanation: 'Đúng — values(\'event_type\') → GROUP BY event_type, annotate(cnt=Count(\'id\')) → COUNT(id) AS cnt, order_by(\'-cnt\') → DESC theo cnt. Đây là pattern Django ORM chuẩn cho GROUP BY + ORDER BY COUNT.' },
              { id: 'c', text: "<code>.filter().group_by('event_type')</code>", correct: false, explanation: 'Sai — Django ORM KHÔNG có method .group_by(). GROUP BY được implicit qua .values() + .annotate(). Đây là khác biệt với SQL thuần.' },
              { id: 'd', text: "<code>.aggregate(Count('event_type'))</code> — sai, aggregate chỉ trả 1 dòng", correct: false, explanation: 'Sai — aggregate trả 1 scalar value (tổng tất cả events), KHÔNG group theo event_type. Để group theo từng event_type → dùng annotate() kết hợp values().' }
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
        prompt: 'Viết <strong>Django ORM query</strong> đếm <strong>số events theo từng event_type</strong> cho user U01. Dùng <code>values(\'event_type\').annotate(count=Count(\'event_id\')).order_by(\'-count\')</code>. ORM Django — không viết SQL thuần.',
        starter: "# Đếm events theo event_type cho user U01 (Django ORM)\n# filter(user_id='U01') + values('event_type') + annotate(count=Count('event_id')) + order_by('-count')\nLogEvent.objects.__________________________________\n",
        schema: {
          table_name: 'log_events',
          columns: [
            { name: 'event_id',   type: 'INT',       key: 'PK', icon: '&#128273;' },
            { name: 'user_id',    type: 'INT',       key: 'FK', icon: '&#128279;' },
            { name: 'event_type', type: 'VARCHAR',   key: '',   icon: '' },
            { name: 'timestamp',   type: 'TIMESTAMP', key: '',   icon: '' }
          ],
          data: [
            ['E01','U01','login',   '2026-01-10 08:00:00'],
            ['E02','U02','logout',  '2026-01-10 09:30:00'],
            ['E03','U01','purchase','2026-01-10 10:00:00'],
            ['E04','U01','login',   '2026-01-11 08:05:00'],
            ['E05','U03','login',   '2026-01-11 09:00:00'],
            ['E06','U01','logout',  '2026-01-11 18:00:00'],
            ['E07','U02','purchase','2026-01-12 11:00:00'],
            ['E08','U04','login',   '2026-01-12 08:30:00'],
            ['E09','U01','login',   '2026-01-13 08:10:00'],
            ['E10','U03','purchase','2026-01-13 14:00:00'],
            ['E11','U05','login',   '2026-01-13 09:15:00'],
            ['E12','U01','purchase','2026-01-14 12:00:00'],
            ['E13','U02','login',   '2026-01-14 08:00:00'],
            ['E14','U04','logout',  '2026-01-14 17:30:00'],
            ['E15','U01','login',   '2026-01-15 08:00:00'],
            ['E16','U06','login',   '2026-01-15 09:00:00'],
            ['E17','U03','login',   '2026-01-15 10:00:00'],
            ['E18','U01','logout',  '2026-01-15 18:30:00'],
            ['E19','U05','purchase','2026-01-16 13:00:00'],
            ['E20','U02','login',   '2026-01-16 08:00:00'],
            ['E21','U01','login',   '2026-01-17 08:00:00'],
            ['E22','U04','login',   '2026-01-17 09:00:00']
          ]
        },
        /* 4A-E3-equiv Bài 17 (Django ORM): equiv_sql render bảng-phải bằng SQL tương đương
         * (engine không chạy ORM syntax). Verify result: login=5 · purchase=2 · logout=2 (3 rows cho user U01). */
        equiv_sql: "SELECT event_type, COUNT(event_id) AS event_count FROM log_events WHERE user_id = 'U01' GROUP BY event_type ORDER BY event_count DESC;",
        expected_sql: "LogEvent.objects.filter(user_id='U01').values('event_type').annotate(event_count=Count('event_id')).order_by('-event_count')",
        hints: [
          { level: 1, text: "Bạn muốn <em>đếm sự kiện theo loại</em> cho 1 user cụ thể. Hãy nghĩ: filter user trước, GROUP BY loại event, COUNT, ORDER BY giảm dần." },
          { level: 2, text: "<code>WHERE user_id = 'U01'</code> — lọc events của user U01." },
          { level: 3, text: "<code>GROUP BY event_type</code> — nhóm theo loại event." },
          { level: 4, text: "<code class=\"code\">SELECT event_type, COUNT(event_id) AS event_count FROM log_events WHERE user_id = 'U01' GROUP BY event_type ORDER BY event_count DESC;</code>" }
        ],
        success_message: 'values().annotate() = GROUP BY trong SQL. ORM và SQL luôn tương đương — hiểu SQL giúp bạn viết ORM tốt hơn!',
        xp_reward: 60
      }
    },

    {
      id: 'db_20', index: 18,
      title: 'Web Services — REST/AJAX nối App với Database',
      subtitle: 'App gọi API qua HTTP → server chạy SQL → trả JSON',
      module: 3, module_title: 'Application Design',
      estimated_minutes: 22, xp_reward: 70,
      project_piece: '🌐 Dựng API cho web shop game',
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'game_catalog',
          columns: ['id', 'name', 'genre', 'price'],
          dataRows: [
            ['101','Elden Ring','RPG','60'],
            ['102','God of War','Action','50'],
            ['103','Hades','RPG','25'],
            ['104','Celeste','Platformer','20'],
            ['105',"Baldur's Gate 3",'RPG','60'],
            ['106','Cyberpunk 2077','RPG','45'],
            ['107','The Witcher 3','RPG','40'],
            ['108','Disco Elysium','RPG','35'],
            ['109','God of War Ragnarok','Action','60'],
            ['110','Hollow Knight','Metroidvania','15'],
            ['111','Stardew Valley','Simulation','18'],
            ['112','Doom Eternal','Shooter','40'],
            ['113','Sekiro','Action','50'],
            ['114','Slay the Spire','Card Game','23'],
            ['115','Persona 5','RPG','55'],
            ['116','Final Fantasy XVI','RPG','50'],
            ['117','Portal 2','Puzzle','10'],
            ['118','Cuphead','Run & Gun','20'],
            ['119','Terraria','Sandbox','10'],
            ['120','Red Dead 2','Action','60'],
            ['121','Dark Souls III','RPG','40'],
            ['122','Outer Wilds','Adventure','25'],
            ['123','Vampire Survivors','Roguelite','5'],
            ['124','Cult of the Lamb','Roguelike','25']
          ]
        }
      },

      achievement: { name: 'Kết nối Web', desc: 'nối App với DB qua REST API' },
      step_1: {
        primer: {
          goal: [
            'Web Service = cầu nối App ↔ DB qua HTTP (REST). App KHÔNG nối thẳng DB',
            'Client gửi request (vd GET /api/games?genre=RPG) → server chạy SQL → trả JSON',
            'Giao thức stateless: mỗi request độc lập; tham số truyền AN TOÀN (parameterized ?)'
          ],
          intro: 'App web/mobile không nối thẳng vào DB — nó gọi <strong>API</strong> qua HTTP (REST/AJAX). Người dùng lọc game RPG → trình duyệt gửi <code>GET /api/games?genre=RPG</code> → server chạy <code>SELECT … WHERE genre = ?</code> → trả về <strong>JSON</strong> cho app hiển thị. <strong>Stateless</strong>: mỗi request độc lập, server không nhớ phiên trước.',
          example: '<code>GET /api/games?genre=RPG</code> → server chạy <code>SELECT name, price FROM game_catalog WHERE genre = \'RPG\'</code> → trả <code>[{"name":"Elden Ring","price":60},{"name":"Hades","price":25}]</code>.'
        },
        concept_cards: [
          {
            icon: 'fa-server',
            title: 'REST/HTTP — stateless',
            body: 'Mỗi request là 1 lệnh độc lập (GET/POST). Server nhận → truy DB → trả JSON. Không giữ trạng thái giữa các request.'
          },
          {
            icon: 'fa-shield-halved',
            title: 'Tham số AN TOÀN (parameterized)',
            body: 'Param từ request (genre, id…) phải truyền qua placeholder <code>?</code>, KHÔNG ghép chuỗi trực tiếp — nếu ghép, hacker chèn SQL độc (xem bài SQL Injection).'
          },
          {
            icon: 'fa-hand-pointer',
            title: 'Thử ngay',
            body: 'Server nhận /api/games?genre=RPG → bạn dựng câu SQL nó chạy.'
          }
        ],
        visual: {
          schema: {
            table_name: 'game_catalog',
            columns: [
              { name: 'id', type: 'INT', key: 'PK', icon: '🔑' },
              { name: 'name', type: 'VARCHAR', key: '', icon: '🎮' },
              { name: 'genre', type: 'VARCHAR', key: '', icon: '🏷️' },
              { name: 'price', type: 'INT', key: '', icon: '💰' }
            ]
          },
          data_preview: [
            ['101','Elden Ring','RPG','60'],
            ['102','God of War','Action','50'],
            ['103','Hades','RPG','25'],
            ['104','Celeste','Platformer','20'],
            ['105',"Baldur's Gate 3",'RPG','60'],
            ['106','Cyberpunk 2077','RPG','45'],
            ['107','The Witcher 3','RPG','40'],
            ['108','Disco Elysium','RPG','35'],
            ['109','God of War Ragnarok','Action','60'],
            ['110','Hollow Knight','Metroidvania','15'],
            ['111','Stardew Valley','Simulation','18'],
            ['112','Doom Eternal','Shooter','40'],
            ['113','Sekiro','Action','50'],
            ['114','Slay the Spire','Card Game','23'],
            ['115','Persona 5','RPG','55'],
            ['116','Final Fantasy XVI','RPG','50'],
            ['117','Portal 2','Puzzle','10'],
            ['118','Cuphead','Run & Gun','20'],
            ['119','Terraria','Sandbox','10'],
            ['120','Red Dead 2','Action','60'],
            ['121','Dark Souls III','RPG','40'],
            ['122','Outer Wilds','Adventure','25'],
            ['123','Vampire Survivors','Roguelite','5'],
            ['124','Cult of the Lamb','Roguelike','25']
          ]
        },
        mission: 'Server nhận request lọc game RPG — kéo thả câu SQL mà API sẽ chạy để trả kết quả.'
      },

      step_2: {
        mcq: [
          {
            question: '"Stateless" trong REST nghĩa là gì?',
            options: [
              { id: 'a', text: 'Server lưu toàn bộ lịch sử người dùng', correct: false, explanation: 'Sai — ngược lại, stateless là KHÔNG lưu trạng thái giữa request.' },
              { id: 'b', text: 'Mỗi request độc lập, server không nhớ request trước', correct: true, explanation: 'Đúng — mỗi HTTP request tự chứa đủ thông tin; server xử lý độc lập.' },
              { id: 'c', text: 'Không dùng được database', correct: false, explanation: 'Sai — vẫn truy DB bình thường mỗi request.' },
              { id: 'd', text: 'Chỉ chạy được GET', correct: false, explanation: 'Sai — REST có GET/POST/PUT/DELETE.' }
            ]
          },
          {
            question: 'Vì sao tham số request nên dùng placeholder <code>?</code> (parameterized) thay vì ghép chuỗi?',
            options: [
              { id: 'a', text: 'Chạy nhanh hơn', correct: false, explanation: 'Phụ — lý do CHÍNH là an toàn.' },
              { id: 'b', text: 'Tránh SQL Injection — input độc không thành câu lệnh', correct: true, explanation: 'Đúng — parameterized tách dữ liệu khỏi lệnh, hacker không chèn được SQL.' },
              { id: 'c', text: 'Để code ngắn hơn', correct: false, explanation: 'Sai — không phải mục đích.' },
              { id: 'd', text: 'Bắt buộc của HTTP', correct: false, explanation: 'Sai — HTTP không ép; đây là best practice bảo mật.' }
            ]
          }
        ]
      },

      step_3: {
        blocks: [
          { type: 'kw', token: 'SELECT', slot: 'kw-select' },
          { type: 'col', token: 'name', slot: 'col-1' },
          { type: 'col', token: 'price', slot: 'col-2' },
          { type: 'kw', token: 'FROM', slot: 'kw-from' },
          { type: 'tbl', token: 'game_catalog', slot: 'tbl' },
          { type: 'kw', token: 'WHERE', slot: 'kw-where' },
          { type: 'col', token: 'genre', slot: 'wcol-1' },
          { type: 'op', token: '=', slot: 'op-1' },
          { type: 'val', token: "'RPG'", slot: 'val-1' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: 'SELECT ____ , ____', accepts: ['kw', 'col'], acceptedKeywords: ['SELECT'], multi: true },
          { id: 'from-line', placeholder: 'FROM ____', accepts: ['kw', 'tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'where-line', placeholder: 'WHERE ____ ____ ____', accepts: ['kw', 'col', 'op', 'val'], acceptedKeywords: ['WHERE', 'AND', 'OR', 'IN'], multi: true }
        ],
        expected_sql: "SELECT name, price FROM game_catalog WHERE genre = 'RPG';",
        reveal_hints: {
          'select-line': 'SELECT 2 cột: <strong>name</strong>, <strong>price</strong>.',
          'from-line': 'FROM <strong>game_catalog</strong>.',
          'where-line': "WHERE lọc theo genre: <strong>genre = 'RPG'</strong> (lưu ý dấu nháy đơn quanh giá trị chuỗi)."
        }
      },

      step_4: {
        prompt: "Endpoint /api/games?genre=Action — viết câu SQL server chạy để trả tên + giá các game Action (dạng JSON).",
        starter: "-- Lấy name + price các game Action\n-- Filter: genre = 'Action'\nSELECT ____, ____\n  FROM ____\n WHERE ____ = ____;",
        schema: {
          table_name: 'game_catalog',
          columns: [
            { name: 'id', type: 'INT', key: 'PK' },
            { name: 'name', type: 'VARCHAR', key: '' },
            { name: 'genre', type: 'VARCHAR', key: '' },
            { name: 'price', type: 'INT', key: '' }
          ],
          data: [
            ['101','Elden Ring','RPG','60'],
            ['102','God of War','Action','50'],
            ['103','Hades','RPG','25'],
            ['104','Celeste','Platformer','20'],
            ['105',"Baldur's Gate 3",'RPG','60'],
            ['106','Cyberpunk 2077','RPG','45'],
            ['107','The Witcher 3','RPG','40'],
            ['108','Disco Elysium','RPG','35'],
            ['109','God of War Ragnarok','Action','60'],
            ['110','Hollow Knight','Metroidvania','15'],
            ['111','Stardew Valley','Simulation','18'],
            ['112','Doom Eternal','Shooter','40'],
            ['113','Sekiro','Action','50'],
            ['114','Slay the Spire','Card Game','23'],
            ['115','Persona 5','RPG','55'],
            ['116','Final Fantasy XVI','RPG','50'],
            ['117','Portal 2','Puzzle','10'],
            ['118','Cuphead','Run & Gun','20'],
            ['119','Terraria','Sandbox','10'],
            ['120','Red Dead 2','Action','60'],
            ['121','Dark Souls III','RPG','40'],
            ['122','Outer Wilds','Adventure','25'],
            ['123','Vampire Survivors','Roguelite','5'],
            ['124','Cult of the Lamb','Roguelike','25']
          ]
        },
        hints: [
          { level: 1, text: "Bạn cần <em>2 cột</em> (name, price) từ bảng <code>game_catalog</code>, lọc theo genre = 'Action'." },
          { level: 2, text: "<code>SELECT name, price FROM game_catalog WHERE genre = 'Action';</code> — kết quả 4 dòng (God of War 50, Ragnarok 60, Sekiro 50, Red Dead 2 60)." },
          { level: 3, text: "Giá trị chuỗi trong SQL đặt trong dấu nháy đơn: <code>'Action'</code>." },
          { level: 4, text: "<code class=\"code\">SELECT name, price FROM game_catalog WHERE genre = 'Action';</code>" }
        ],
        expected_sql: "SELECT name, price FROM game_catalog WHERE genre = 'Action';",
        success_message: 'Hoàn thành Web Services (REST/AJAX)! Bài 19 (SQL Injection) tiếp theo — cũng chính là lý do phải dùng parameterized ?.',
        xp_reward: 60
      }
    },

    {
      id: 'db_17', index: 19,
      title: 'SQL Injection — Lỗ hổng chết người',
      subtitle: 'Tấn công bằng input độc hại và phòng chống',
      module: 3, module_title: 'Application Design',
      icon: '&#128128;', color: '#EF4444',
      estimated_minutes: 18, xp_reward: 60,
      drag_type: 'bug_spot',
      challenge_type: 'full_ide',

      achievement: { name: 'Lá chắn Injection', desc: 'chống SQL Injection' },
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
                intro: 'Thử tưởng tượng app của bạn bị hack. Attacker gõ 1 dòng vào ô login → lấy được toàn bộ database user, bao gồm admin. Mất 2 tuần fix + tổn thất 500 triệu + mất trust khách hàng. Lỗ hổng này có từ 1998, vẫn còn trong 30% app mới deploy 2026. Tên nó: <strong>SQL Injection</strong>. Bài này dạy cách phòng.',
concept_cards: [
            {
                  "icon": "fa-skull-crossbones",
                  "title": "SQL Injection — Thử hack thử nào",
                  "body": "Thử thách: nhập <code>' OR '1'='1' --</code> vào ô login username. <strong>Bạn có thể bypass login không?</strong> (Gợi ý: đọc tiếp card 2 để tìm cách phòng chống)",
                  "extra": "Query biến thành <code>WHERE username='' OR '1'='1'</code> → luôn TRUE → bypass login hoàn toàn. 90% web app mới deploy có lỗ hổng này — bug này đã từng làm sập cả hệ thống Yahoo, Sony, và hàng trăm site lớn.",
                  "variant": "interactive"
            },
            {
                  "icon": "fa-shield-virus",
                  "title": "Prepared Statement — Khiên chắn",
                  "body": "Phòng chống: <code>SELECT * FROM users WHERE username = %s AND password = %s</code> với params gửi <strong>riêng</strong>. DB engine biết đó là literal, escape tự động, attacker chèn thêm dấu nháy cũng vô dụng. <strong>NGUYÊN TẮC</strong>: input KHÔNG BAO GIỜ ghép chuỗi thành SQL."
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "' OR '1'='1' -- đóng chuỗi ('), thêm điều kiện luôn đúng ('1'='1'), comment out phần còn lại (--)."
            }
          ],
                visual: {
          // NOTE: legacy `diagram_legacy_N:` keys below are deprecated copy-paste
          // from earlier lessons. The render loop reads only `diagram:` (last one wins).
          // Do NOT add new `diagram:` keys at the end of this block; doing so will silently
          // swap the rendered diagram. Use `diagram:` (single key) or refactor to `diagrams: [...]`.
          
          
          diagram_legacy_4: {"type": "nf", "before": {"title": "TRƯỚC — 1 bảng tổng (BAD)", "columns": ["user_id", "username", "post_id", "post_text", "game_name", "genre"], "rows": [["U1", "alice", "P1", "My first post", "Elden Ring", "RPG"], ["U1", "alice", "P1", "My first post", "Elden Ring", "Action"], ["U2", "bob", "P2", "Check this", "Hades", "Rogue"]], "violations": {"0-5": true, "0-4": true, "1-5": true, "1-4": true}}, "after": {"title": "SAU — 5 bảng + 2 junction", "columns": ["user_id", "post_id", "game_id", "genre_id", "platform_id"], "rows": [["U1", "P1", "G1", "G_RPG", "PC"], ["U1", "P1", "G1", "G_Act", "PC"], ["U2", "P2", "G2", "G_Rog", "PS5"]]}, "note": "7 bảng: users, posts, games, genres, platforms + post_game (junction), post_genre (junction)."},
          
          diagram_legacy_3: {"type": "flow", "steps": [{"icon": "fa-user", "title": "Web App / Form", "sub": "User thay đổi setting (theme: dark)", "payload": "POST /api/settings"}, {"icon": "fa-code", "title": "Python / Django ORM", "sub": "Validate + serialize sang JSONB", "payload": "settings = {'theme': 'dark'}"}, {"icon": "fa-server", "title": "PostgreSQL", "sub": "Lưu JSONB vào cột settings", "payload": "INSERT INTO app_users (..., settings) VALUES (...)"}, {"icon": "fa-arrow-rotate-left", "title": "ORM → Python dict", "sub": "Đọc lại: settings->>theme = \"dark\"", "payload": "SELECT settings->>'theme' FROM app_users"}, {"icon": "fa-display", "title": "HTML Response", "sub": "Render UI với theme mới", "payload": "<html data-theme=\"dark\">"}]},
          
          diagram_legacy_2: {"type": "flow", "steps": [{"icon": "fa-map-pin", "title": "User location", "sub": "Browser geolocation API", "payload": "(106.7, 10.78)"}, {"icon": "fa-mobile", "title": "Mobile App", "sub": "POST /api/nearest?lat=10.78&lon=106.7", "payload": "GET /nearest"}, {"icon": "fa-code", "title": "Django + GeoDjango", "sub": "Build query PostGIS", "payload": "ST_DWithin(geo, point, 5000)"}, {"icon": "fa-server", "title": "PostgreSQL + PostGIS", "sub": "Spatial index (GIST)", "payload": "shop_branches WHERE ST_DWithin(...)"}, {"icon": "fa-list", "title": "Sorted by distance", "sub": "ST_Distance ORDER BY", "payload": "ORDER BY dist ASC LIMIT 5"}]},
          
          diagram_legacy_1: {"type": "flow", "steps": [{"icon": "fa-code", "title": "Python code (ORM)", "sub": "LogEvent.objects.filter(...)", "payload": "Event.objects.all()[:20]"}, {"icon": "fa-cogs", "title": "Django ORM Layer", "sub": "Build SQL từ queryset", "payload": "SELECT * FROM log_events LIMIT 20"}, {"icon": "fa-server", "title": "PostgreSQL", "sub": "Execute SQL", "payload": "20 rows"}, {"icon": "fa-arrow-rotate-left", "title": "ORM → Python list", "sub": "Map row → LogEvent object", "payload": "events = [LogEvent(...), ...]"}, {"icon": "fa-display", "title": "Template render", "sub": "events truyền vào template", "payload": "{% for e in events %}"}]},
          
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
            ['U01','minh_admin',  'hashed_abc','minh@x.com','admin'],
            ['U02','yuki_user',   'hashed_xyz','yuki@x.com','user'],
            ['U03','sara_mod',    'hashed_123','sara@x.com','moderator'],
            ['U04','alex_guest',  'hashed_456','alex@x.com','guest'],
            ['U05','nam_user',    'hashed_789','nam@x.com','user'],
            ['U06','lan_user',    'hashed_aaa','lan@x.com','user'],
            ['U07','hung_mod',    'hashed_bbb','hung@x.com','moderator'],
            ['U08','mai_user',    'hashed_ccc','mai@x.com','user'],
            ['U09','tu_admin',    'hashed_ddd','tu@x.com','admin'],
            ['U10','linh_user',   'hashed_eee','linh@x.com','user'],
            ['U11','phuc_guest',  'hashed_fff','phuc@x.com','guest'],
            ['U12','quan_user',   'hashed_ggg','quan@x.com','user'],
            ['U13','ha_mod',      'hashed_hhh','ha@x.com','moderator'],
            ['U14','dat_user',    'hashed_iii','dat@x.com','user'],
            ['U15','vy_user',     'hashed_jjj','vy@x.com','user'],
            ['U16','khoa_guest',  'hashed_kkk','khoa@x.com','guest'],
            ['U17','trang_user',  'hashed_lll','trang@x.com','user'],
            ['U18','bao_admin',   'hashed_mmm','bao@x.com','admin'],
            ['U19','ngoc_user',   'hashed_nnn','ngoc@x.com','user'],
            ['U20','son_user',    'hashed_ooo','son@x.com','user'],
            ['U21','thao_mod',    'hashed_ppp','thao@x.com','moderator'],
            ['U22','duc_user',    'hashed_qqq','duc@x.com','user']
          ]
        },
        mission: 'Phân rã <strong>query bị SQL Injection</strong>. Kéo thả khối để xem query thực sự chạy gì ↓'
      },

      step_2: {
        mcq: [
          {
            question: 'Input nào là <strong>SQL Injection</strong> trong trường username?',
            options: [
              { id: 'a', text: '<code>minh_admin</code> — username hợp lệ', correct: false, explanation: 'Sai — đây là username hợp lệ, không chứa ký tự SQL đặc biệt. An toàn.' },
              { id: 'b', text: "<code>' OR '1'='1' --</code> — đóng chuỗi, thêm điều kiện đúng, comment out", correct: true, explanation: 'Đúng — đóng chuỗi (\'), thêm điều kiện luôn đúng (OR \'1\'=\'1\'), comment phần password (--). Đây là SQL Injection classic.' },
              { id: 'c', text: "<code>minh' --</code> — chỉ comment out phần sau, vẫn cần password đúng", correct: false, explanation: 'Sai — chỉ comment out phần password check. Nhưng vẫn cần username đúng. Nếu username không tồn tại → trả về 0 rows. Không phải full bypass.' },
              { id: 'd', text: '<code>minh_admin; DROP TABLE users;</code> — chỉ là chuỗi dài, không phải injection nếu escape đúng', correct: false, explanation: 'Sai — chuỗi này chỉ nguy hiểm nếu APP build SQL bằng f-string không escape. Nếu dùng Prepared Statement, DB xem như literal string, không execute DROP.' }
            ]
          },
          {
            question: 'Cách nào phòng chống SQL Injection hiệu quả nhất?',
            options: [
              { id: 'a', text: "<code>f\"WHERE username = '{input}'\"</code> — dùng f-string", correct: false, explanation: 'Sai — f-string nội suy input trực tiếp vào SQL = chính là nguyên nhân gây SQL Injection. Không phải cách phòng chống.' },
              { id: 'b', text: "<code>WHERE username = %s</code> — Prepared Statement (parameterized query)", correct: true, explanation: 'Đúng — Prepared Statement dùng placeholder (%s, ?, $1) + bind param riêng. DB engine phân biệt code vs data, escape tự động. Cách chuẩn nhất.' },
              { id: 'c', text: "<code>WHERE username = input.replace(\"'\", \"''\")</code> — escape thủ công", correct: false, explanation: 'Sai — escape thủ công dễ sai (thiếu edge case). Chuẩn industry là Prepared Statement. Đừng tự roll security.' },
              { id: 'd', text: 'Thêm CAPTCHA — chỉ giảm bot, không ngăn SQLi', correct: false, explanation: 'Sai — CAPTCHA giảm bot nhưng attacker vẫn submit thủ công. Không ngăn SQLi. CAPTCHA bổ sung, không thay thế Prepared Statement.' }
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
            ['U01','minh_admin', 'minh@x.com','admin'],
            ['U02','yuki_user',  'yuki@x.com','user'],
            ['U03','sara_mod',   'sara@x.com','moderator'],
            ['U04','alex_guest', 'alex@x.com','guest'],
            ['U05','nam_user',   'nam@x.com','user'],
            ['U06','lan_user',   'lan@x.com','user'],
            ['U07','hung_mod',   'hung@x.com','moderator'],
            ['U08','mai_user',   'mai@x.com','user'],
            ['U09','tu_admin',   'tu@x.com','admin'],
            ['U10','linh_user',  'linh@x.com','user'],
            ['U11','phuc_guest', 'phuc@x.com','guest'],
            ['U12','quan_user',  'quan@x.com','user'],
            ['U13','ha_mod',     'ha@x.com','moderator'],
            ['U14','dat_user',   'dat@x.com','user'],
            ['U15','vy_user',    'vy@x.com','user'],
            ['U16','khoa_guest', 'khoa@x.com','guest'],
            ['U17','trang_user', 'trang@x.com','user'],
            ['U18','bao_admin',  'bao@x.com','admin'],
            ['U19','ngoc_user',  'ngoc@x.com','user'],
            ['U20','son_user',   'son@x.com','user'],
            ['U21','thao_mod',   'thao@x.com','moderator'],
            ['U22','duc_user',   'duc@x.com','user']
          ]
        },
        /* 4A-E3-equiv Bài 19 (%s + 2 câu): câu 1 'WHERE username=%s AND password_hash=%s'
         *   không chạy (bảng KHÔNG có password_hash) → render câu 2 aggregation qua equiv_sql.
         * Verify result: user=12 · moderator=4 · admin=3 · guest=3 (4 rows). */
        equiv_sql: "SELECT role, COUNT(user_id) AS user_count FROM user_accounts GROUP BY role ORDER BY user_count DESC;",
        expected_sql: "SELECT * FROM user_accounts WHERE username = %s AND password_hash = %s; SELECT role, COUNT(user_id) AS user_count FROM user_accounts GROUP BY role ORDER BY user_count DESC;",
        hints: [
          { level: 1, text: "Bạn cần <em>phòng chống SQL Injection</em> (Prepared Statement) + <em>đếm user theo role</em> (aggregation). Hãy nghĩ: <code>%s</code> placeholder cho input, GROUP BY role cho aggregation." },
          { level: 2, text: "Prepared Statement: <code>WHERE username = %s AND password_hash = %s</code> — params gửi riêng." },
          { level: 3, text: "<code>SELECT role, COUNT(user_id) AS user_count</code> — đếm theo role." },
          { level: 4, text: "<code class=\"code\">SELECT role, COUNT(user_id) AS user_count FROM user_accounts GROUP BY role ORDER BY user_count DESC;</code>" }
        ],
        success_message: 'Prepared Statement là lá chắn! Input luôn là literal, không bao giờ chạy như SQL. Bài 20 sẽ học cách lưu password đúng cách.',
        xp_reward: 60
      }
    },

    {
      id: 'db_18', index: 20,
      title: 'Password Security — Salt & Hashing',
      subtitle: 'Từ plain text đến bcrypt — chọn thuật toán nào?',
      module: 3, module_title: 'Application Design',
      icon: '&#128272;', color: '#6366F1',
      estimated_minutes: 18, xp_reward: 70,
      drag_type: 'classify',
      challenge_type: 'full_ide',

      achievement: { name: 'Vệ binh mật khẩu', desc: 'Salt & Hashing' },
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
                intro: '<strong>Trước 2010</strong>: web app lưu password plain text. Hacker SQL injection → đọc hết password → login vào mọi nơi user dùng cùng password. LinkedIn 2012 mất 6.5M password, bán công khai. <strong>Sau 2010</strong>: hash + salt. Hacker lấy DB → chỉ thấy <code>$2b$12$...</code> vô nghĩa. Bài này dạy <strong>bcrypt + salt</strong>.',
concept_cards: [
            {
                  "icon": "fa-lock",
                  "title": "Trước vs Sau — Password Storage",
                  "body": "<strong>Trước 2010</strong>: lưu plain text. Hacker đánh cắp DB → đọc hết. LinkedIn 2012 bị hack 6.5M password, bán công khai. <strong>Sau 2010</strong>: hash + salt. Hacker đánh cắp DB → chỉ thấy <code>$2b$12$...</code> chuỗi vô nghĩa. Crack 1 password cần 10^12 lần thử = nhiều năm."
            },
            {
                  "icon": "fa-key",
                  "title": "bcrypt + Salt — Công thức chuẩn",
                  "body": "<strong>bcrypt</strong>: hash 1 chiều, có cost factor (mỗi +1 = gấp đôi thời gian). <strong>Salt</strong>: chuỗi ngẫu nhiên gắn vào password trước khi hash. Cùng password \"123456\" → hash khác nhau (do salt khác) → rainbow table vô dụng. <strong>md5/sha1</strong> quá yếu, không có salt → crack trong vài giây. Dùng bcrypt hoặc argon2."
            }
      ,
            {
              "icon": "fa-hand-pointer",
              "title": "Thử ngay (Apply)",
              "body": "md5 hash bắt đầu bằng chuỗi hex 32 ký tự (5f4dcc3b5aa."
            }
          ],
                visual: {
          // NOTE: legacy `diagram_legacy_N:` keys below are deprecated copy-paste
          // from earlier lessons. The render loop reads only `diagram:` (last one wins).
          // Do NOT add new `diagram:` keys at the end of this block; doing so will silently
          // swap the rendered diagram. Use `diagram:` (single key) or refactor to `diagrams: [...]`.
          
          
          diagram_legacy_5: {"type": "nf", "before": {"title": "TRƯỚC — 1 bảng tổng (BAD)", "columns": ["user_id", "username", "post_id", "post_text", "game_name", "genre"], "rows": [["U1", "alice", "P1", "My first post", "Elden Ring", "RPG"], ["U1", "alice", "P1", "My first post", "Elden Ring", "Action"], ["U2", "bob", "P2", "Check this", "Hades", "Rogue"]], "violations": {"0-5": true, "0-4": true, "1-5": true, "1-4": true}}, "after": {"title": "SAU — 5 bảng + 2 junction", "columns": ["user_id", "post_id", "game_id", "genre_id", "platform_id"], "rows": [["U1", "P1", "G1", "G_RPG", "PC"], ["U1", "P1", "G1", "G_Act", "PC"], ["U2", "P2", "G2", "G_Rog", "PS5"]]}, "note": "7 bảng: users, posts, games, genres, platforms + post_game (junction), post_genre (junction)."},
          
          diagram_legacy_4: {"type": "flow", "steps": [{"icon": "fa-user", "title": "Web App / Form", "sub": "User thay đổi setting (theme: dark)", "payload": "POST /api/settings"}, {"icon": "fa-code", "title": "Python / Django ORM", "sub": "Validate + serialize sang JSONB", "payload": "settings = {'theme': 'dark'}"}, {"icon": "fa-server", "title": "PostgreSQL", "sub": "Lưu JSONB vào cột settings", "payload": "INSERT INTO app_users (..., settings) VALUES (...)"}, {"icon": "fa-arrow-rotate-left", "title": "ORM → Python dict", "sub": "Đọc lại: settings->>theme = \"dark\"", "payload": "SELECT settings->>'theme' FROM app_users"}, {"icon": "fa-display", "title": "HTML Response", "sub": "Render UI với theme mới", "payload": "<html data-theme=\"dark\">"}]},
          
          diagram_legacy_3: {"type": "flow", "steps": [{"icon": "fa-map-pin", "title": "User location", "sub": "Browser geolocation API", "payload": "(106.7, 10.78)"}, {"icon": "fa-mobile", "title": "Mobile App", "sub": "POST /api/nearest?lat=10.78&lon=106.7", "payload": "GET /nearest"}, {"icon": "fa-code", "title": "Django + GeoDjango", "sub": "Build query PostGIS", "payload": "ST_DWithin(geo, point, 5000)"}, {"icon": "fa-server", "title": "PostgreSQL + PostGIS", "sub": "Spatial index (GIST)", "payload": "shop_branches WHERE ST_DWithin(...)"}, {"icon": "fa-list", "title": "Sorted by distance", "sub": "ST_Distance ORDER BY", "payload": "ORDER BY dist ASC LIMIT 5"}]},
          
          diagram_legacy_2: {"type": "flow", "steps": [{"icon": "fa-code", "title": "Python code (ORM)", "sub": "LogEvent.objects.filter(...)", "payload": "Event.objects.all()[:20]"}, {"icon": "fa-cogs", "title": "Django ORM Layer", "sub": "Build SQL từ queryset", "payload": "SELECT * FROM log_events LIMIT 20"}, {"icon": "fa-server", "title": "PostgreSQL", "sub": "Execute SQL", "payload": "20 rows"}, {"icon": "fa-arrow-rotate-left", "title": "ORM → Python list", "sub": "Map row → LogEvent object", "payload": "events = [LogEvent(...), ...]"}, {"icon": "fa-display", "title": "Template render", "sub": "events truyền vào template", "payload": "{% for e in events %}"}]},
          
          diagram_legacy_1: {"type": "flow", "steps": [{"icon": "fa-user-secret", "title": "Attacker input", "sub": "username = ' OR '1'='1' --", "payload": "MALICIOUS_PAYLOAD"}, {"icon": "fa-bug", "title": "App build SQL (NGUY HIỂM)", "sub": "f\"SELECT * FROM users WHERE name='{input}'\"", "payload": "VULNERABLE"}, {"icon": "fa-server", "title": "DB execute", "sub": "Trả về TẤT CẢ users (không cần password!)", "payload": "ALL_ROWS_RETURNED"}, {"icon": "fa-shield-halved", "title": "FIX: Prepared Statement", "sub": "WHERE username = %s + params", "payload": "SAFE"}, {"icon": "fa-check", "title": "DB execute (SAFE)", "sub": "Input là literal, escape tự động", "payload": "NORMAL_QUERY"}]},
          
          diagram: {"type": "flow", "steps": [{"icon": "fa-keyboard", "title": "User nhập password", "sub": "\"hunter2\" (plain text)", "payload": "hunter2"}, {"icon": "fa-plus", "title": "Server append salt", "sub": "salt = random 16 bytes", "payload": "hunter2 + \"rand_abc\""}, {"icon": "fa-cogs", "title": "bcrypt.hashpw (cost 12)", "sub": "Hash 2^12 lần SHA256 + bcrypt", "payload": "$2a$12$..."}, {"icon": "fa-database", "title": "Lưu vào DB", "sub": "password_hash + salt (2 cột)", "payload": "INSERT INTO security_users_vault"}, {"icon": "fa-shield-halved", "title": "Verify: bcrypt.checkpw", "sub": "So sánh hash với input mới", "payload": "True / False"}]},
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
            ['U03','sara_dev', '356a192b7913b04c54574d18c28d46e6395428ab','rand_123','sha1'],
            ['U04','alex_dev', '$2b$12$vPZ...XzZxKIX...','rand_456','argon2'],
            ['U05','lisa_dev', '5994471abb01112afcc18159f6cc74b4f511b99806dcaf8c1c2c0d8c6c9e0d8c','rand_lisa','sha256'],
            ['U06','nam_dev',  '$2b$12$9N8...3aBcDeFgH','rand_nam','bcrypt'],
            ['U07','lan_dev',  'd41d8cd98f00b204e9800998ecf8427e','rand_lan','md5'],
            ['U08','hung_dev', '$2b$12$Lp9...q1w2e3r4t','rand_hung','scrypt'],
            ['U09','mai_dev',  'a59b7d5cdd1e6a4b1c8e3f5d7a9b1c3e5f7d9a1b3c5e7f9d1a3b5c7e9f1d3a5b','rand_mai','sha256'],
            ['U10','tu_dev',   '$2b$12$Xy7...8z9A0B1C2','rand_tu','bcrypt'],
            ['U11','linh_dev', 'da39a3ee5e6b4b0d3255bfef95601890afd80709','rand_linh','sha1'],
            ['U12','phuc_dev', '$2b$12$Qq4...rR5sS6tT','rand_phuc','argon2'],
            ['U13','quan_dev', '098f6bcd4621d373cade4e832627b4f6','rand_quan','md5'],
            ['U14','ha_dev',   '$2b$12$Mk6...pP7qQ8rR','rand_ha','bcrypt'],
            ['U15','dat_dev',  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855','rand_dat','sha256'],
            ['U16','vy_dev',   '$2b$12$Jd2...sS3tT4uU','rand_vy','scrypt'],
            ['U17','khoa_dev', '5d41402abc4b2a76b9719d911017c592','rand_khoa','md5'],
            ['U18','trang_dev','$2b$12$Wq8...yY9zZ0A1','rand_trang','bcrypt'],
            ['U19','bao_dev',  'a9993e364706816aba3e25717850c26c9cd0d89d','rand_bao','sha1'],
            ['U20','ngoc_dev', '$2b$12$Bn5...fF6gG7hH','rand_ngoc','argon2'],
            ['U21','son_dev',  '2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3','rand_son','sha256'],
            ['U22','thao_dev', '$2b$12$Ct3...eE4fF5gG','rand_thao','bcrypt'],
            ['U23','duc_dev',  '8277e0910d750195b448797616e091ad','rand_duc','md5'],
            ['U24','an_dev',   '$2b$12$Vm1...dD2eE3fF','rand_an','scrypt']
          ]
        },
        mission: 'Viết query phân loại <strong>mức độ bảo mật</strong> theo thuật toán. Kéo thả khối lệnh ↓'
      },

      step_2: {
        mcq: [
          {
            question: 'Thuật toán nào <strong>KHÔNG nên dùng</strong> để lưu password?',
            options: [
              { id: 'a', text: 'md5 — quá nhanh + không có salt → rainbow table attack', correct: true, explanation: 'Đúng — md5 là cryptographic hash bị broken (collision attacks từ 2004) + không có salt built-in → rainbow table attack trivial. 1 GPU crack md5 ~50 GH/s.' },
              { id: 'b', text: 'bcrypt — cost factor chỉnh được, salt tự động', correct: false, explanation: 'Sai — bcrypt là thuật toán hash password AN TOÀN hiện đại. cost factor làm chậm brute-force (1 hash ~100ms), salt tự động 16-byte chống rainbow table. Bcrypt = recommended.' },
              { id: 'c', text: 'argon2 — winner của Password Hashing Competition 2015', correct: false, explanation: 'Sai — argon2 là winner PHC 2015, hiện đại nhất. Memory-hard → chống GPU/ASIC attack (parallel crack khó hơn bcrypt). Recommended cho new systems.' },
              { id: 'd', text: 'plain text — lưu nguyên password, không hash', correct: true, explanation: 'Đúng — plain text = KHÔNG có bảo mật. DB compromise → lộ toàn bộ password. Nguyên tắc #1: KHÔNG BAO GIỜ lưu plain text password. Luôn hash dù là user demo.' }
            ]
          },
          {
            question: 'Salt trong password hashing có tác dụng gì?',
            options: [
              { id: 'a', text: 'Mã hóa password để không ai đọc được', correct: false, explanation: 'Sai — hash function (bcrypt/argon2) mã hóa. Salt là random data thêm vào TRƯỚC khi hash, không phải encryption.' },
              { id: 'b', text: 'Chống rainbow table attack — cùng password sẽ có hash khác nhau', correct: true, explanation: 'Đúng — Salt random → cùng "password123" nhưng user A và user B có hash khác nhau. Attacker không thể dùng 1 rainbow table pre-compute cho tất cả users. Mỗi user phải crack riêng.' },
              { id: 'c', text: 'Làm hash ngắn hơn để tiết kiệm storage', correct: false, explanation: 'Sai — Salt thêm bytes vào input (bcrypt salt = 16 bytes) → hash output dài hơn (60 chars cho $2a$ format). Không làm hash ngắn hơn.' },
              { id: 'd', text: 'Thay thế cho bcrypt — không cần thuật toán mạnh', correct: false, explanation: 'Sai — Salt là PHỤ TRỢ, không thay thế. Vẫn cần bcrypt/argon2/scrypt làm hash function mạnh. Salt yếu + md5 = vẫn crack được.' }
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
        mission: 'Phân loại <strong>mức độ bảo mật</strong> theo thuật toán hash — dùng <code>CASE WHEN</code> + <code>GROUP BY</code> + <code>COUNT</code>.',
        blocks: [
          { type: 'kw',  token: 'SELECT',          slot: 'kw-select' },
          { type: 'fn',  token: "CASE WHEN hash_algorithm IN ('bcrypt','argon2','scrypt') THEN 'HIGH' WHEN hash_algorithm = 'sha256' THEN 'MEDIUM' ELSE 'LOW' END", slot: 'fn-case' },
          { type: 'kw',  token: 'AS',              slot: 'kw-as' },
          { type: 'col', token: 'security_level',  slot: 'col-alias' },
          { type: 'fn',  token: 'COUNT(user_id)',  slot: 'fn-count' },
          { type: 'kw',  token: 'AS',              slot: 'kw-as2' },
          { type: 'col', token: 'user_count',      slot: 'col-alias2' },
          { type: 'kw',  token: 'FROM',            slot: 'kw-from' },
          { type: 'tbl', token: 'security_users_vault', slot: 'tbl' },
          { type: 'kw',  token: 'GROUP BY',        slot: 'kw-group' },
          { type: 'col', token: 'security_level',  slot: 'col-group' },
          { type: 'kw',  token: 'ORDER BY',        slot: 'kw-order' },
          { type: 'col', token: 'user_count',      slot: 'col-order' },
          { type: 'kw',  token: 'DESC',            slot: 'kw-desc' }
        ],
        drop_zones: [
          { id: 'select-line', placeholder: "SELECT CASE WHEN ... END AS ____, COUNT(...) AS ____", accepts: ['kw','col','fn'], acceptedKeywords: ['SELECT', 'AS'], multi: true },
          { id: 'from-line',   placeholder: 'FROM security_users_vault',        accepts: ['kw','tbl'], acceptedKeywords: ['FROM'], multi: true },
          { id: 'group-line',  placeholder: 'GROUP BY ____',                    accepts: ['kw','col'], acceptedKeywords: ['GROUP BY'], multi: true },
          { id: 'order-line',  placeholder: 'ORDER BY ____ DESC',               accepts: ['kw','col'], acceptedKeywords: ['ORDER BY', 'DESC'], multi: true }
        ],
        expected_sql: "SELECT CASE WHEN hash_algorithm IN ('bcrypt','argon2','scrypt') THEN 'HIGH' WHEN hash_algorithm = 'sha256' THEN 'MEDIUM' ELSE 'LOW' END AS security_level, COUNT(user_id) AS user_count FROM security_users_vault GROUP BY security_level ORDER BY user_count DESC;",
        reveal_hints: {
          'select-line':  '<strong>CASE WHEN</strong> phân loại thuật toán → HIGH/MEDIUM/LOW + <strong>COUNT</strong> đếm user.',
          'from-line':    'FROM <strong>security_users_vault</strong>.',
          'group-line':   'GROUP BY <strong>security_level</strong> — gom theo mức bảo mật.',
          'order-line':   'ORDER BY <strong>user_count DESC</strong> — mức nào nhiều user nhất lên đầu.'
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
          { level: 4, text: "<code class=\"code\">SELECT CASE WHEN hash_algorithm IN ('bcrypt','argon2','scrypt') THEN 'HIGH' WHEN hash_algorithm = 'sha256' THEN 'MEDIUM' ELSE 'LOW' END AS security_level, COUNT(user_id) AS user_count FROM security_users_vault GROUP BY security_level ORDER BY user_count DESC;</code>" }
        ],
        success_message: 'CASE WHEN + GROUP BY = audit password security mạnh mẽ! Đã hoàn thành toàn bộ 20 bài Database Design Cơ bản!',
        xp_reward: 70
      }
    }
  
  ]
};
