import json

from db.connection import _get_pool


def init_db():
    pool = _get_pool()
    conn = pool.getconn()
    c = conn.cursor()

    c.execute('SELECT pg_advisory_lock(123456789)')

    try:
        c.execute('''CREATE TABLE IF NOT EXISTS users (
            id                      SERIAL PRIMARY KEY,
            name                    TEXT,
            email                   TEXT UNIQUE,
            phone                   TEXT    DEFAULT '',
            birthday                TEXT    DEFAULT '',
            role                    TEXT    DEFAULT 'Học viên',
            password                TEXT,
            streak                  INTEGER DEFAULT 0,
            certificates            INTEGER DEFAULT 0,
            gems                    INTEGER DEFAULT 0,
            xp                      INTEGER DEFAULT 0,
            questionnaire_completed INTEGER DEFAULT 0
        )''')

        try:
            c.execute('ALTER TABLE users ALTER COLUMN password TYPE VARCHAR(512)')
        except Exception:
            conn.rollback()

        for col, definition in (
            ('gems',                    'INTEGER DEFAULT 0'),
            ('xp',                      'INTEGER DEFAULT 0'),
            ('questionnaire_completed', 'INTEGER DEFAULT 0'),
            ('last_study_date',         'DATE DEFAULT NULL'),
            ('oauth_provider',          'TEXT DEFAULT NULL'),
            ('oauth_provider_id',       'TEXT DEFAULT NULL'),
        ):
            try:
                c.execute(f'ALTER TABLE users ADD COLUMN IF NOT EXISTS {col} {definition}')
            except Exception:
                conn.rollback()

        try:
            c.execute(
                'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oauth '
                'ON users(oauth_provider, oauth_provider_id) '
                'WHERE oauth_provider IS NOT NULL'
            )
        except Exception:
            conn.rollback()

        c.execute('''CREATE TABLE IF NOT EXISTS courses (
            id           TEXT PRIMARY KEY,
            title        TEXT,
            subtitle     TEXT,
            description  TEXT,
            image        TEXT,
            level        TEXT,
            duration     TEXT,
            students     TEXT,
            rating       REAL,
            lessons      INTEGER,
            color        TEXT,
            accent_color TEXT,
            tag          TEXT
        )''')

        c.execute('''CREATE TABLE IF NOT EXISTS lessons (
            id         SERIAL PRIMARY KEY,
            course_id  TEXT REFERENCES courses(id) ON DELETE CASCADE,
            module     TEXT      DEFAULT '',
            title      TEXT NOT NULL,
            content    TEXT      DEFAULT '',
            sort_order INTEGER   DEFAULT 0,
            created_at TIMESTAMP DEFAULT now()
        )''')
        c.execute('CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id)')

        c.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm')
        c.execute('CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level)')
        c.execute('CREATE INDEX IF NOT EXISTS idx_courses_title_trgm ON courses USING gin(title gin_trgm_ops)')
        c.execute('CREATE INDEX IF NOT EXISTS idx_courses_tag_trgm ON courses USING gin(tag gin_trgm_ops)')
        c.execute('CREATE INDEX IF NOT EXISTS idx_courses_subtitle_trgm ON courses USING gin(subtitle gin_trgm_ops)')

        c.execute('''CREATE TABLE IF NOT EXISTS enrollments (
            user_id           INTEGER,
            course_id         TEXT,
            progress          INTEGER DEFAULT 0,
            completed_lessons INTEGER DEFAULT 0,
            time_spent        TEXT    DEFAULT '0h',
            last_lesson       TEXT    DEFAULT '',
            next_lesson       TEXT    DEFAULT '',
            PRIMARY KEY (user_id, course_id)
        )''')

        c.execute('CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id)')
        c.execute('CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id)')

        c.execute('''CREATE TABLE IF NOT EXISTS course_ratings (
            user_id    INTEGER,
            course_id  TEXT,
            rating     INTEGER NOT NULL,
            created_at TEXT,
            PRIMARY KEY (user_id, course_id)
        )''')

        c.execute('CREATE INDEX IF NOT EXISTS idx_course_ratings_course_id ON course_ratings(course_id)')
        c.execute('CREATE INDEX IF NOT EXISTS idx_course_ratings_user_id ON course_ratings(user_id)')

        c.execute('''CREATE TABLE IF NOT EXISTS missions (
            id                SERIAL PRIMARY KEY,
            title             TEXT NOT NULL,
            description       TEXT    DEFAULT '',
            xp_reward         INTEGER DEFAULT 50,
            course_id         TEXT    REFERENCES courses(id),
            sort_order        INTEGER DEFAULT 0,
            is_active         BOOLEAN DEFAULT TRUE,
            correct_condition TEXT    DEFAULT '',
            correct_action    TEXT    DEFAULT ''
        )''')

        c.execute('''CREATE TABLE IF NOT EXISTS notifications (
            user_id        INTEGER PRIMARY KEY,
            email_notif    INTEGER DEFAULT 1,
            push_notif     INTEGER DEFAULT 0,
            study_remind   INTEGER DEFAULT 1,
            content_update INTEGER DEFAULT 0
        )''')

        c.execute('''CREATE TABLE IF NOT EXISTS roadmap_progress (
            user_id INTEGER,
            item_id TEXT,
            done    INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, item_id)
        )''')

        c.execute('''CREATE TABLE IF NOT EXISTS surveys (
            id         SERIAL PRIMARY KEY,
            user_id    INTEGER,
            data_json  TEXT,
            created_at TEXT
        )''')

        c.execute('''CREATE TABLE IF NOT EXISTS roadmaps (
            id          TEXT PRIMARY KEY,
            title       TEXT,
            icon        TEXT,
            color       TEXT,
            mermaid_def TEXT,
            nodes_json  TEXT DEFAULT '{}'
        )''')

        c.execute('''CREATE TABLE IF NOT EXISTS user_roadmaps (
            user_id     INTEGER PRIMARY KEY,
            mermaid_def TEXT DEFAULT ''
        )''')

        # ── Diễn đàn: bài viết + bình luận ──
        c.execute('''CREATE TABLE IF NOT EXISTS posts (
            id         SERIAL PRIMARY KEY,
            user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
            category   TEXT      DEFAULT 'discuss',
            title      TEXT      DEFAULT '',
            content    TEXT NOT NULL,
            like_count INTEGER   DEFAULT 0,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        )''')
        c.execute('CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)')
        c.execute('CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)')
        c.execute('CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)')

        c.execute('''CREATE TABLE IF NOT EXISTS comments (
            id         SERIAL PRIMARY KEY,
            post_id    INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
            content    TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        )''')
        c.execute('CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)')
        c.execute('CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id)')

        try:
            c.execute("ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS nodes_json TEXT DEFAULT '{}'")
        except Exception:
            conn.rollback()

        c.execute('SELECT 1 FROM roadmaps LIMIT 1')
        if not c.fetchone():
            # Bỏ classDef + init block để JS palette (main.js _PASTEL_LIGHT/_PASTEL_DARK)
            # hoàn toàn kiểm soát màu node, đồng bộ với roadmap cá nhân
            _flowchart_header = 'flowchart TD\n'

            roadmaps_seed = [
                (
                    'frontend', 'Frontend Web', '💻', '#4A9EE0',
                    _flowchart_header +
                    '    rm_1["1. Internet"]\n'
                    '    rm_2["2. HTML"]\n'
                    '    rm_3["3. CSS"]\n'
                    '    rm_4["4. JavaScript"]\n'
                    '    rm_5["5. DOM & Events"]\n'
                    '    rm_6["6. Fetch API"]\n'
                    '    rm_7["7. Frameworks"]\n'
                    '    rm_8["8. React co ban"]\n'
                    '    rm_9["9. State Management"]\n'
                    '    rm_10["10. Git & GitHub"]\n'
                    '    rm_11["11. Build Tools"]\n'
                    '    rm_12["12. Deployment"]\n'
                    '    rm_1 --> rm_2\n'
                    '    rm_2 --> rm_3\n'
                    '    rm_3 --> rm_4\n'
                    '    rm_4 --> rm_5\n'
                    '    rm_4 --> rm_6\n'
                    '    rm_5 --> rm_7\n'
                    '    rm_6 --> rm_7\n'
                    '    rm_7 --> rm_8\n'
                    '    rm_7 --> rm_9\n'
                    '    rm_8 --> rm_10\n'
                    '    rm_9 --> rm_11\n'
                    '    rm_10 --> rm_12\n'
                    '    rm_11 --> rm_12\n'
                ),
                (
                    'backend', 'Backend', '⚙️', '#E84545',
                    _flowchart_header +
                    '    rm_b1["1. Kien thuc co ban"]\n'
                    '    rm_b2["2. Ngon ngu Backend"]\n'
                    '    rm_b3["3. DB SQL"]\n'
                    '    rm_b4["4. DB NoSQL"]\n'
                    '    rm_b5["5. Thiet ke API"]\n'
                    '    rm_b6["6. Bao mat & Auth"]\n'
                    '    rm_b7["7. Container & Docker"]\n'
                    '    rm_b8["8. CI/CD"]\n'
                    '    rm_b9["9. Trien khai"]\n'
                    '    rm_b1 --> rm_b2\n'
                    '    rm_b2 --> rm_b3\n'
                    '    rm_b2 --> rm_b4\n'
                    '    rm_b3 --> rm_b5\n'
                    '    rm_b4 --> rm_b5\n'
                    '    rm_b5 --> rm_b6\n'
                    '    rm_b6 --> rm_b7\n'
                    '    rm_b6 --> rm_b8\n'
                    '    rm_b7 --> rm_b9\n'
                    '    rm_b8 --> rm_b9\n'
                ),
                (
                    'python', 'Python & AI', '🐍', '#10B981',
                    _flowchart_header +
                    '    rm_p1["1. Python Co Ban"]\n'
                    '    rm_p2["2. Python Nang Cao"]\n'
                    '    rm_p3["3. Phan Tich Du Lieu"]\n'
                    '    rm_p4["4. Toan Hoc Cho AI"]\n'
                    '    rm_p5["5. Machine Learning"]\n'
                    '    rm_p6["6. Deep Learning"]\n'
                    '    rm_p7["7. Thi Giac May Tinh"]\n'
                    '    rm_p8["8. Xu Ly Ngon Ngu"]\n'
                    '    rm_p9["9. Generative AI"]\n'
                    '    rm_p1 --> rm_p2\n'
                    '    rm_p2 --> rm_p3\n'
                    '    rm_p3 --> rm_p4\n'
                    '    rm_p4 --> rm_p5\n'
                    '    rm_p5 --> rm_p6\n'
                    '    rm_p6 --> rm_p7\n'
                    '    rm_p6 --> rm_p8\n'
                    '    rm_p7 --> rm_p9\n'
                    '    rm_p8 --> rm_p9\n'
                ),
                (
                    'cpp', 'C/C++ Systems', '🖥️', '#8B5CF6',
                    _flowchart_header +
                    '    rm_c1["1. Cot Loi Ngon Ngu C"]\n'
                    '    rm_c2["2. Con Tro & Bo Nho"]\n'
                    '    rm_c3["3. Cau Truc Du Lieu"]\n'
                    '    rm_c4["4. C++ OOP"]\n'
                    '    rm_c5["5. Thu vien STL C++"]\n'
                    '    rm_c6["6. Modern C++"]\n'
                    '    rm_c7["7. Lap Trinh He Thong"]\n'
                    '    rm_c8["8. Bien Dich & Cong Cu"]\n'
                    '    rm_c9["9. Nhung / Socket"]\n'
                    '    rm_c1 --> rm_c2\n'
                    '    rm_c2 --> rm_c3\n'
                    '    rm_c3 --> rm_c4\n'
                    '    rm_c4 --> rm_c5\n'
                    '    rm_c5 --> rm_c6\n'
                    '    rm_c6 --> rm_c7\n'
                    '    rm_c7 --> rm_c8\n'
                    '    rm_c8 --> rm_c9\n'
                ),
            ]
            c.executemany(
                'INSERT INTO roadmaps (id, title, icon, color, mermaid_def) VALUES (%s,%s,%s,%s,%s)',
                roadmaps_seed
            )

        # Luôn cập nhật nodes_json (chạy cả khi bảng đã có dữ liệu cũ)
        _nodes_data = {
            'frontend': {
                'rm_1':  {'title': '1. Internet',         'desc': '<strong>Kiến thức nền tảng về Internet:</strong><ul><li>Mạng Internet hoạt động như thế nào?</li><li>HTTP và HTTPS khác nhau ra sao?</li><li>Cơ chế hoạt động của Trình duyệt</li><li>DNS — Hệ thống phân giải tên miền</li><li>Hosting và Domain</li></ul>'},
                'rm_2':  {'title': '2. HTML',             'desc': '<strong>Ngôn ngữ cấu trúc trang web:</strong><ul><li>Semantic HTML — Viết mã có ngữ nghĩa</li><li>Làm việc với Forms và Validations</li><li>Accessibility (a11y)</li><li>SEO Basics</li></ul>'},
                'rm_3':  {'title': '3. CSS',              'desc': '<strong>Ngôn ngữ thiết kế giao diện:</strong><ul><li>Box Model: Margin, Padding, Border</li><li>Selectors, Specificity</li><li>Flexbox &amp; CSS Grid</li><li>Responsive Design</li></ul>'},
                'rm_4':  {'title': '4. JavaScript',       'desc': '<strong>Ngôn ngữ lập trình cốt lõi:</strong><ul><li>Cú pháp cơ bản: Biến, Hàm, Vòng lặp</li><li>ES6+: Arrow functions, Destructuring</li><li>Bất đồng bộ: Callbacks, Promises, Async/Await</li></ul>'},
                'rm_5':  {'title': '5. DOM & Events',     'desc': '<strong>Tương tác với giao diện (DOM):</strong><ul><li>Truy vấn phần tử</li><li>Thêm, sửa, xóa DOM</li><li>Event Listeners — Lắng nghe sự kiện</li></ul>'},
                'rm_6':  {'title': '6. Fetch API',        'desc': '<strong>Giao tiếp với Server/Backend:</strong><ul><li>Gửi HTTP Requests: GET, POST...</li><li>Xử lý dữ liệu JSON</li><li>Hiểu về CORS</li></ul>'},
                'rm_7':  {'title': '7. Frameworks',       'desc': '<strong>Công cụ xây dựng UI hiện đại:</strong><ul><li>React — Lựa chọn phổ biến nhất</li><li>Vue.js</li><li>Angular</li></ul>'},
                'rm_8':  {'title': '8. React cơ bản',    'desc': '<strong>Trọng tâm thư viện React:</strong><ul><li>Cú pháp JSX &amp; Components</li><li>Hooks: useState, useEffect</li><li>Truyền dữ liệu bằng Props</li></ul>'},
                'rm_9':  {'title': '9. State Management', 'desc': '<strong>Quản lý trạng thái toàn cục:</strong><ul><li>Redux Toolkit</li><li>Zustand (Trending)</li><li>React Context API</li></ul>'},
                'rm_10': {'title': '10. Git & GitHub',    'desc': '<strong>Quản lý mã nguồn:</strong><ul><li>Các lệnh cơ bản: git add, commit, push, pull</li><li>Quản lý nhánh (Branching)</li><li>Xử lý xung đột code</li></ul>'},
                'rm_11': {'title': '11. Build Tools',     'desc': '<strong>Công cụ đóng gói:</strong><ul><li>Vite — Cực nhanh, khuyên dùng</li><li>Webpack</li><li>NPM Scripts</li></ul>'},
                'rm_12': {'title': '12. Deployment',      'desc': '<strong>Triển khai ứng dụng thực tế:</strong><ul><li>Vercel</li><li>Netlify</li><li>GitHub Pages</li></ul>'},
            },
            'backend': {
                'rm_b1': {'title': '1. Kiến thức cơ bản',    'desc': '<strong>Nền tảng backend:</strong><ul><li>Hệ điều hành Linux/Unix</li><li>Terminal / shell basics</li><li>TCP/IP, HTTP/HTTPS, client-server</li></ul>'},
                'rm_b2': {'title': '2. Ngôn ngữ Backend',    'desc': '<strong>So sánh runtime:</strong><ul><li>Node.js, Python, Java, C#</li><li>Frameworks: Express, Django, Spring, ASP.NET</li><li>Package manager và môi trường phát triển</li></ul>'},
                'rm_b3': {'title': '3. DB SQL',              'desc': '<strong>Database quan hệ:</strong><ul><li>Thiết kế schema</li><li>Joins, indexing, transactions</li><li>PostgreSQL / MySQL, migration</li></ul>'},
                'rm_b4': {'title': '4. DB NoSQL',            'desc': '<strong>NoSQL &amp; caching:</strong><ul><li>MongoDB document model</li><li>Redis caching/session</li><li>Khi nào chọn NoSQL vs SQL</li></ul>'},
                'rm_b5': {'title': '5. Thiết kế API',        'desc': '<strong>API chuyên nghiệp:</strong><ul><li>RESTful conventions</li><li>GraphQL basics</li><li>Validation, error handling, versioning</li></ul>'},
                'rm_b6': {'title': '6. Bảo mật & Auth',      'desc': '<strong>An toàn backend:</strong><ul><li>JWT, OAuth2, session</li><li>Hash mật khẩu, encryption</li><li>Chống XSS, CSRF, SQL injection</li></ul>'},
                'rm_b7': {'title': '7. Container & Docker',  'desc': '<strong>Đóng gói ứng dụng:</strong><ul><li>Dockerfile</li><li>Docker Compose</li><li>Quy trình dev/prod</li></ul>'},
                'rm_b8': {'title': '8. CI/CD',               'desc': '<strong>Tự động hóa triển khai:</strong><ul><li>Unit test / integration test</li><li>Linting và build</li><li>GitHub Actions / pipeline</li></ul>'},
                'rm_b9': {'title': '9. Triển khai',          'desc': '<strong>Đưa lên production:</strong><ul><li>AWS, DigitalOcean, Heroku</li><li>Nginx reverse proxy</li><li>SSL/TLS, monitoring, logging</li></ul>'},
            },
            'python': {
                'rm_p1': {'title': '1. Python Cơ Bản',       'desc': '<strong>Nguyên tắc Python:</strong><ul><li>Biến, kiểu dữ liệu, hàm</li><li>Vòng lặp, điều kiện</li><li>List, tuple, dict, set</li></ul>'},
                'rm_p2': {'title': '2. Python Nâng Cao',     'desc': '<strong>Lập trình Python chuyên sâu:</strong><ul><li>Class, OOP, kế thừa</li><li>Decorators, generator</li><li>Module &amp; package</li></ul>'},
                'rm_p3': {'title': '3. Phân Tích Dữ Liệu',  'desc': '<strong>Data science:</strong><ul><li>NumPy arrays</li><li>Pandas DataFrame</li><li>Visualization với Matplotlib/Seaborn</li></ul>'},
                'rm_p4': {'title': '4. Toán Học Cho AI',     'desc': '<strong>Toán nền tảng:</strong><ul><li>Đại số tuyến tính</li><li>Giải tích cơ bản</li><li>Xác suất &amp; thống kê</li></ul>'},
                'rm_p5': {'title': '5. Machine Learning',    'desc': '<strong>Học máy truyền thống:</strong><ul><li>Regression, classification</li><li>Feature engineering</li><li>Scikit-Learn</li></ul>'},
                'rm_p6': {'title': '6. Deep Learning',       'desc': '<strong>Deep learning:</strong><ul><li>PyTorch / TensorFlow</li><li>CNN, RNN</li><li>Overfitting và regularization</li></ul>'},
                'rm_p7': {'title': '7. Thị Giác Máy Tính',  'desc': '<strong>Computer vision:</strong><ul><li>OpenCV image processing</li><li>Object detection</li><li>CNN / YOLO</li></ul>'},
                'rm_p8': {'title': '8. Xử Lý Ngôn Ngữ',    'desc': '<strong>NLP cơ bản:</strong><ul><li>Tokenization</li><li>Embedding, word vectors</li><li>Transformer, spaCy</li></ul>'},
                'rm_p9': {'title': '9. Generative AI',       'desc': '<strong>Generative AI:</strong><ul><li>LLMs, Transformers</li><li>ChatGPT API</li><li>Prompt engineering, LangChain</li></ul>'},
            },
            'cpp': {
                'rm_c1': {'title': '1. Cốt Lõi Ngôn Ngữ C',  'desc': '<strong>Cơ bản C:</strong><ul><li>Kiểu dữ liệu, hàm, mảng</li><li>Con trỏ và truyền tham trị</li><li>Quy tắc biên dịch</li></ul>'},
                'rm_c2': {'title': '2. Con Trỏ & Bộ Nhớ',    'desc': '<strong>Quản lý bộ nhớ:</strong><ul><li>malloc/free</li><li>Stack vs heap</li><li>Memory leak, buffer overflow</li></ul>'},
                'rm_c3': {'title': '3. Cấu Trúc Dữ Liệu',   'desc': '<strong>DSA C/C++:</strong><ul><li>Struct, linked list</li><li>Stack, queue, tree</li><li>Độ phức tạp thuật toán</li></ul>'},
                'rm_c4': {'title': '4. C++ OOP',              'desc': '<strong>C++ OOP:</strong><ul><li>Class / object</li><li>Kế thừa, đa hình</li><li>Encapsulation, template</li></ul>'},
                'rm_c5': {'title': '5. Thư viện STL C++',    'desc': '<strong>STL essentials:</strong><ul><li>Vector, map, set</li><li>Iterator</li><li>Algorithms</li></ul>'},
                'rm_c6': {'title': '6. Modern C++',           'desc': '<strong>C++ hiện đại:</strong><ul><li>Smart pointers</li><li>Lambda, auto</li><li>Move semantics</li></ul>'},
                'rm_c7': {'title': '7. Lập Trình Hệ Thống', 'desc': '<strong>Systems programming:</strong><ul><li>Đa luồng, mutex</li><li>Tiến trình và đồng bộ</li><li>Concurrency</li></ul>'},
                'rm_c8': {'title': '8. Biên Dịch & Công Cụ', 'desc': '<strong>Build tools:</strong><ul><li>Makefile, CMake</li><li>GDB debugging</li><li>Profiling</li></ul>'},
                'rm_c9': {'title': '9. Nhúng / Socket',      'desc': '<strong>Nhúng &amp; mạng:</strong><ul><li>Socket TCP/UDP</li><li>Vi điều khiển</li><li>Ứng dụng nhúng cơ bản</li></ul>'},
            },
        }
        for _rid, _nodes in _nodes_data.items():
            c.execute(
                'UPDATE roadmaps SET nodes_json=%s WHERE id=%s',
                (json.dumps(_nodes, ensure_ascii=False), _rid)
            )

        # Luôn cập nhật mermaid_def để đảm bảo label tiếng Việt đầy đủ dấu
        # Bỏ classDef + init block để JS palette (main.js _PASTEL_LIGHT/_PASTEL_DARK)
        # hoàn toàn kiểm soát màu node, đồng bộ với roadmap cá nhân
        _mermaid_defs_vn = {
            'frontend': (
                'flowchart TD\n'
                '    rm_1["1. Internet"]\n'
                '    rm_2["2. HTML"]\n'
                '    rm_3["3. CSS"]\n'
                '    rm_4["4. JavaScript"]\n'
                '    rm_5["5. DOM & Events"]\n'
                '    rm_6["6. Fetch API"]\n'
                '    rm_7["7. Frameworks"]\n'
                '    rm_8["8. React cơ bản"]\n'
                '    rm_9["9. State Management"]\n'
                '    rm_10["10. Git & GitHub"]\n'
                '    rm_11["11. Build Tools"]\n'
                '    rm_12["12. Deployment"]\n'
                '    rm_1 --> rm_2\n    rm_2 --> rm_3\n    rm_3 --> rm_4\n'
                '    rm_4 --> rm_5\n    rm_4 --> rm_6\n'
                '    rm_5 --> rm_7\n    rm_6 --> rm_7\n'
                '    rm_7 --> rm_8\n    rm_7 --> rm_9\n'
                '    rm_8 --> rm_10\n    rm_9 --> rm_11\n'
                '    rm_10 --> rm_12\n    rm_11 --> rm_12\n'
            ),
            'backend': (
                'flowchart TD\n'
                '    rm_b1["1. Kiến thức cơ bản"]\n'
                '    rm_b2["2. Ngôn ngữ Backend"]\n'
                '    rm_b3["3. DB SQL"]\n'
                '    rm_b4["4. DB NoSQL"]\n'
                '    rm_b5["5. Thiết kế API"]\n'
                '    rm_b6["6. Bảo mật & Auth"]\n'
                '    rm_b7["7. Container & Docker"]\n'
                '    rm_b8["8. CI/CD"]\n'
                '    rm_b9["9. Triển khai"]\n'
                '    rm_b1 --> rm_b2\n'
                '    rm_b2 --> rm_b3\n    rm_b2 --> rm_b4\n'
                '    rm_b3 --> rm_b5\n    rm_b4 --> rm_b5\n'
                '    rm_b5 --> rm_b6\n'
                '    rm_b6 --> rm_b7\n    rm_b6 --> rm_b8\n'
                '    rm_b7 --> rm_b9\n    rm_b8 --> rm_b9\n'
            ),
            'python': (
                'flowchart TD\n'
                '    rm_p1["1. Python Cơ Bản"]\n'
                '    rm_p2["2. Python Nâng Cao"]\n'
                '    rm_p3["3. Phân Tích Dữ Liệu"]\n'
                '    rm_p4["4. Toán Học Cho AI"]\n'
                '    rm_p5["5. Machine Learning"]\n'
                '    rm_p6["6. Deep Learning"]\n'
                '    rm_p7["7. Thị Giác Máy Tính"]\n'
                '    rm_p8["8. Xử Lý Ngôn Ngữ"]\n'
                '    rm_p9["9. Generative AI"]\n'
                '    rm_p1 --> rm_p2\n    rm_p2 --> rm_p3\n'
                '    rm_p3 --> rm_p4\n    rm_p4 --> rm_p5\n'
                '    rm_p5 --> rm_p6\n'
                '    rm_p6 --> rm_p7\n    rm_p6 --> rm_p8\n'
                '    rm_p7 --> rm_p9\n    rm_p8 --> rm_p9\n'
            ),
            'cpp': (
                'flowchart TD\n'
                '    rm_c1["1. Cốt Lõi Ngôn Ngữ C"]\n'
                '    rm_c2["2. Con Trỏ & Bộ Nhớ"]\n'
                '    rm_c3["3. Cấu Trúc Dữ Liệu"]\n'
                '    rm_c4["4. C++ OOP"]\n'
                '    rm_c5["5. Thư viện STL C++"]\n'
                '    rm_c6["6. Modern C++"]\n'
                '    rm_c7["7. Lập Trình Hệ Thống"]\n'
                '    rm_c8["8. Biên Dịch & Công Cụ"]\n'
                '    rm_c9["9. Nhúng / Socket"]\n'
                '    rm_c1 --> rm_c2\n    rm_c2 --> rm_c3\n'
                '    rm_c3 --> rm_c4\n    rm_c4 --> rm_c5\n'
                '    rm_c5 --> rm_c6\n'
                '    rm_c6 --> rm_c7\n    rm_c7 --> rm_c8\n'
                '    rm_c8 --> rm_c9\n'
            ),
        }
        for _rid, _mdef in _mermaid_defs_vn.items():
            c.execute('UPDATE roadmaps SET mermaid_def=%s WHERE id=%s', (_mdef, _rid))

        c.execute('SELECT 1 FROM courses LIMIT 1')
        if not c.fetchone():
            courses_seed = [
                ('cpp',     'C / C++',    'Lập trình hệ thống',
                 'Học lập trình từ nền tảng với C/C++, hiểu bộ nhớ, con trỏ và cấu trúc dữ liệu.',
                 'static/images/cpp.svg',     'Phù hợp người mới',    '40 giờ', '12.4K', 4.8,  85, '#4A9EE0', '#2D7FC1', 'HỆ THỐNG & NHÚNG'),
                ('python',  'Python',     'Đa năng & AI',
                 'Làm chủ Python để xây dựng web, phân tích dữ liệu, AI/ML và tự động hóa.',
                 'static/images/python.svg',  'Phù hợp người mới',    '55 giờ', '28.7K', 4.9, 120, '#E84545', '#C83232', 'AI & DATA SCIENCE'),
                ('java',    'Java',       'Backend & Enterprise',
                 'Xây dựng ứng dụng doanh nghiệp với Java OOP, Spring Boot và microservices.',
                 'static/images/java.svg',    'Trung cấp',             '60 giờ', '18.2K', 4.7, 110, '#4A9EE0', '#E84545', 'BACKEND & ENTERPRISE'),
                ('htmlcss', 'HTML / CSS', 'Nền tảng Web',
                 'Tạo giao diện web đẹp, responsive với HTML5 hiện đại và CSS3 nâng cao.',
                 'static/images/htmlcss.svg', 'Phù hợp người mới',    '30 giờ', '35.1K', 4.9,  70, '#E84545', '#4A9EE0', 'WEB DEVELOPMENT'),
                ('db_design', 'Database Design', 'Thiết kế & Chuẩn hóa CSDL',
                 'Trang bị toàn bộ kiến thức để thiết kế và quản lý cơ sở dữ liệu quan hệ. Từ sơ đồ E-R, chuẩn hóa dữ liệu đến viết SQL truy vấn phức tạp và tối ưu hóa hiệu năng.',
                 'static/images/db_design.svg', 'Phù hợp người mới',  '40 giờ', '0',     4.9,  60, '#06B6D4', '#0E7490', 'DATABASE & BACKEND'),
            ]
            c.executemany(
                'INSERT INTO courses VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
                courses_seed
            )
        else:
            # Migration: ensure db_design row exists (in case the table was seeded before db_design was added)
            c.execute('SELECT 1 FROM courses WHERE id = %s', ('db_design',))
            if not c.fetchone():
                c.execute(
                    'INSERT INTO courses VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
                    ('db_design', 'Database Design', 'Thiết kế & Chuẩn hóa CSDL',
                     'Trang bị toàn bộ kiến thức để thiết kế và quản lý cơ sở dữ liệu quan hệ. Từ sơ đồ E-R, chuẩn hóa dữ liệu đến viết SQL truy vấn phức tạp và tối ưu hóa hiệu năng.',
                     'static/images/db_design.svg', 'Phù hợp người mới', '40 giờ', '0', 4.9, 60, '#06B6D4', '#0E7490', 'DATABASE & BACKEND')
                )

        # Migration 2026-07-04: tách DB Design thành 3 KHÓA riêng (saga GameHub 3 phần).
        # Idempotent: UPDATE đổi row cũ thành khóa Cơ bản (id giữ nguyên → enrollment/tiến độ
        # hiện có không mất); 2 khóa mới chỉ INSERT khi chưa tồn tại.
        c.execute(
            '''UPDATE courses SET title=%s, subtitle=%s, description=%s, level=%s,
               duration=%s, lessons=%s WHERE id=%s AND title=%s''',
            ('Database Design Cơ bản', 'Phần 1 — Xây nền tảng GameHub',
             'Từ thực thể đầu tiên đến hệ CSDL hoàn chỉnh: ER Diagram, khóa chính/ngoại, '
             'chuẩn hóa 1NF→4NF và SQL ứng dụng thực tế — bạn là kỹ sư dữ liệu đầu tiên của GameHub.',
             'Cơ bản', '14 giờ', 20, 'db_design', 'Database Design')
        )
        _db3_new_courses = [
            ('db_design_tc', 'Database Design Trung cấp', 'Phần 2 — GameHub Community',
             'Advanced SQL (Trigger, Procedure, Recursive CTE), Big Data & Analytics, Storage & Indexing — '
             'xây mạng cộng đồng gamers của GameHub. Nên học sau khóa Cơ bản.',
             'static/images/db_design.svg', 'Trung cấp', '18 giờ', '0', 4.9, 21,
             '#0C4A6E', '#38BDF8', 'DATABASE & BACKEND'),
            ('db_design_nc', 'Database Design Nâng cao', 'Phần 3 — GameHub Marketplace',
             'Query Processing & Optimization, Concurrency Control, Crash Recovery — vận hành chợ giao dịch '
             'triệu người dùng của GameHub. Dành cho ai đã vững 2 phần trước.',
             'static/images/db_design.svg', 'Nâng cao', '22 giờ', '0', 4.9, 25,
             '#7C2D12', '#FB923C', 'DATABASE & BACKEND'),
        ]
        for _row in _db3_new_courses:
            c.execute('SELECT 1 FROM courses WHERE id = %s', (_row[0],))
            if not c.fetchone():
                c.execute('INSERT INTO courses VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)', _row)

        # Seed missions sau courses vì có FK: course_id REFERENCES courses(id)
        c.execute('SELECT 1 FROM missions LIMIT 1')
        if not c.fetchone():
            missions_seed = [
                (
                    'Cứu nguy Robot',
                    'Kéo các khối lệnh để giúp Robot quyết định khi nào cần sạc pin.',
                    50, 'cpp', 1, True, 'pin < 20', 'charge()'
                ),
                (
                    'Giao hàng thông minh',
                    'Lập trình xe giao hàng tự động chọn khi nào giao hàng ngay.',
                    50, 'python', 2, True, 'km <= 10', 'deliver_now()'
                ),
                (
                    'Kiểm tra tuổi',
                    'Xác định điều kiện để hệ thống cấp quyền truy cập.',
                    50, 'java', 3, True, 'age >= 18', 'access_granted()'
                ),
                (
                    'Responsive Layout',
                    'Chọn điều kiện để tự động chuyển sang giao diện mobile.',
                    50, 'htmlcss', 4, True, 'width < 768', 'mobile_view()'
                ),
            ]
            c.executemany(
                '''INSERT INTO missions
                       (title, description, xp_reward, course_id, sort_order, is_active,
                        correct_condition, correct_action)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s)''',
                missions_seed
            )

        c.execute("""
            UPDATE courses
            SET level = 'Phù hợp người mới'
            WHERE level ILIKE '%mọi cấp độ%'
               OR level ILIKE '%người mới%'
               OR level ILIKE '%cơ bản → nâng cao%'
               OR level ILIKE '%cơ bản -> nâng cao%'
               OR level ILIKE '%cơ bản%nâng cao%'
               OR level ILIKE '%Cơ bản%Nâng cao%'
               OR level ILIKE '%Cơ bản% → Nâng cao%'
               OR level ILIKE '%Cơ bản%–%Nâng cao%'
               OR level ILIKE '%Cơ bản%->%Nâng cao%'
        """)

        c.execute("""
            UPDATE courses SET level = 'Cơ bản'
            WHERE level ILIKE '%cơ bản%'
              AND level NOT ILIKE '%mọi cấp độ%'
              AND level NOT ILIKE '%người mới%'
        """)

        c.execute("""
            UPDATE courses SET level = 'Nâng cao'
            WHERE level ILIKE '%nâng cao%'
              AND level NOT ILIKE '%mọi cấp độ%'
        """)

        c.execute("""
            UPDATE courses SET level = 'Trung cấp'
            WHERE level ILIKE '%trung cấp%'
              AND level NOT ILIKE '%mọi cấp độ%'
        """)

        conn.commit()

    finally:
        c.execute('SELECT pg_advisory_unlock(123456789)')
        c.close()
        _get_pool().putconn(conn)

    print('[DB] NeonDB initialized (levels normalized)')
