from flask import Blueprint, render_template, redirect
from utils import login_required, current_user_id
from models import get_db

main_bp = Blueprint('main', __name__)

# ── Curriculum data (static, per course) ──────────────────────────────────────
CURRICULA = {
    'python': {
        'requirements': [
            'Không cần kinh nghiệm lập trình trước',
            'Máy tính với kết nối internet',
            'Tinh thần ham học hỏi và kiên nhẫn',
        ],
        'skills': [
            'Lập trình Python từ cơ bản đến nâng cao',
            'Xây dựng ứng dụng thực tế với Python',
            'Phân tích dữ liệu với NumPy & Pandas',
            'Tạo mô hình AI / Machine Learning',
            'Tự động hóa tác vụ lặp đi lặp lại',
        ],
        'instructor': 'Nguyễn Văn An',
        'modules': [
            {'title': 'Module 1: Giới thiệu Python', 'lessons': [
                'Python là gì và tại sao cần học?', 'Cài đặt Python & VS Code',
                'Chương trình đầu tiên: Hello World', 'Cách dùng Python REPL',
                'Biến và quy tắc đặt tên', 'Kiểu dữ liệu: int, float, str, bool',
                'Toán tử số học và so sánh', 'Hàm print() và input() cơ bản',
            ]},
            {'title': 'Module 2: Cú pháp cơ bản', 'lessons': [
                'Chuỗi (String) và các thao tác', 'Định dạng chuỗi với f-string',
                'Danh sách (List)', 'Tuple và ứng dụng', 'Dictionary (dict)',
                'Set và frozenset', 'Chuyển đổi kiểu dữ liệu',
                'Toán tử logic: and, or, not', 'Toán tử bitwise',
                'Ưu tiên toán tử', 'Biểu thức điều kiện (ternary)', 'None và kiểm tra None',
            ]},
            {'title': 'Module 3: Cấu trúc điều khiển', 'lessons': [
                'Câu lệnh if / elif / else', 'Vòng lặp for cơ bản', 'Vòng lặp while',
                'Lệnh break và continue', 'Hàm range()', 'List comprehension',
                'Dict comprehension', 'Vòng lặp lồng nhau',
                'Pattern matching với match/case', 'Bài tập thực hành: FizzBuzz',
            ]},
            {'title': 'Module 4: Hàm & Module', 'lessons': [
                'Định nghĩa hàm với def', 'Tham số và đối số',
                'Giá trị mặc định & keyword args', '*args và **kwargs',
                'Hàm lambda', 'Phạm vi biến (scope)', 'Hàm đệ quy',
                'Decorator cơ bản', 'Import module', 'Tạo module riêng',
                'Thư viện chuẩn: math, random, os', 'Virtual environment & pip',
            ]},
            {'title': 'Module 5: Kiểu dữ liệu nâng cao', 'lessons': [
                'List nâng cao: sort, filter, map', 'Stack và Queue với list',
                'Collections: deque, Counter, defaultdict', 'Named tuple',
                'Slicing nâng cao', 'Generator và yield', 'Iterator protocol',
                'Comprehension nâng cao', 'Frozen set và immutable patterns',
                'Bài tập: Xử lý dữ liệu thực tế', 'Kiểm tra & đánh giá module 5',
                'Dự án nhỏ: Chương trình quản lý danh sách',
            ]},
            {'title': 'Module 6: Lập trình hướng đối tượng', 'lessons': [
                'OOP là gì? Tại sao cần OOP?', 'Class và Object',
                'Thuộc tính và phương thức', '__init__ và self',
                'Encapsulation (đóng gói)', 'Inheritance (kế thừa)',
                'Polymorphism (đa hình)', 'Method Overriding', 'Abstract class',
                'Interface với ABC', 'Class method và static method',
                'Property và setter', 'Dunder methods: __str__, __repr__, __eq__',
                'Dataclass', 'Dự án: Hệ thống quản lý ngân hàng',
            ]},
            {'title': 'Module 7: Xử lý File & Exception', 'lessons': [
                'Đọc & ghi file văn bản', 'Làm việc với CSV', 'Xử lý JSON',
                'Context manager: with statement', 'Exception là gì?',
                'try / except / finally', 'Custom Exception', 'Logging cơ bản',
                'Pathlib: làm việc với đường dẫn', 'Bài tập: Parser file log',
            ]},
            {'title': 'Module 8: Thư viện tiêu chuẩn', 'lessons': [
                'datetime và xử lý thời gian', 'Regular expressions (re)',
                'os & sys', 'subprocess', 'threading cơ bản',
                'urllib & requests', 'json & pickle',
                'argparse: CLI tools', 'unittest: kiểm thử đơn vị',
                'Packaging: setup.py cơ bản',
            ]},
            {'title': 'Module 9: NumPy & Pandas', 'lessons': [
                'Cài đặt và giới thiệu NumPy', 'Array: tạo, indexing, slicing',
                'Phép toán trên array', 'Broadcasting', 'Giới thiệu Pandas',
                'DataFrame: tạo và đọc dữ liệu', 'Lọc và sắp xếp dữ liệu',
                'Groupby và Aggregation', 'Xử lý dữ liệu thiếu (NaN)',
                'Merge & Join DataFrames', 'Matplotlib: vẽ đồ thị cơ bản',
                'Seaborn: visualize nâng cao',
            ]},
            {'title': 'Module 10: AI & Machine Learning', 'lessons': [
                'Giới thiệu Machine Learning', 'Scikit-learn: pipeline cơ bản',
                'Linear Regression', 'Logistic Regression', 'Decision Tree',
                'Random Forest', 'K-Nearest Neighbors',
                'Đánh giá mô hình: accuracy, F1', 'Cross-validation',
                'Feature Engineering cơ bản', 'Neural Network với Keras',
                'CNN cơ bản với TensorFlow', 'NLP: Xử lý văn bản',
                'Dự án cuối khóa: Phân tích cảm xúc', 'Triển khai model với Flask',
                'Thi chứng chỉ Python', 'Tổng kết & bước tiếp theo',
                'Cộng đồng & tài nguyên nâng cao', 'Career path: Data Scientist',
            ]},
        ],
    },
    'cpp': {
        'requirements': [
            'Không cần kinh nghiệm lập trình trước',
            'Máy tính với kết nối internet',
            'Sẵn sàng tư duy logic và làm việc với bộ nhớ',
        ],
        'skills': [
            'Lập trình C/C++ từ cơ bản đến nâng cao',
            'Hiểu bộ nhớ máy tính và con trỏ',
            'Cài đặt cấu trúc dữ liệu từ đầu',
            'Lập trình hướng đối tượng với C++',
            'Sử dụng STL và Template hiệu quả',
        ],
        'instructor': 'Trần Minh Khoa',
        'modules': [
            {'title': 'Module 1: Giới thiệu C/C++', 'lessons': [
                'Lịch sử và ứng dụng của C/C++', 'Cài đặt GCC và IDE',
                'Chương trình đầu tiên', 'Quá trình biên dịch',
                'Cú pháp cơ bản', 'Nhập/xuất dữ liệu',
                'Header files', 'Namespace std',
            ]},
            {'title': 'Module 2: Biến, Kiểu dữ liệu & Toán tử', 'lessons': [
                'Các kiểu dữ liệu cơ bản', 'Biến và hằng số',
                'Toán tử số học', 'Toán tử logic và so sánh',
                'Ép kiểu (type casting)', 'Giới hạn kiểu dữ liệu',
                'Auto keyword', 'sizeof operator',
                'Overflow và underflow', 'Bài tập thực hành',
            ]},
            {'title': 'Module 3: Cấu trúc điều khiển', 'lessons': [
                'Câu lệnh if/else', 'switch/case', 'Vòng lặp for',
                'Vòng lặp while', 'do/while', 'break, continue, goto',
                'Vòng lặp lồng nhau', 'Bài tập: các bài toán cổ điển',
            ]},
            {'title': 'Module 4: Hàm & Con trỏ', 'lessons': [
                'Khai báo và định nghĩa hàm', 'Truyền tham số (by value vs by ref)',
                'Con trỏ cơ bản', 'Toán tử & và *', 'Con trỏ và mảng',
                'Con trỏ đến con trỏ', 'Con trỏ hàm', 'Hàm đệ quy',
                'Inline function', 'Function overloading',
                'Default parameters', 'Stack vs Heap memory',
            ]},
            {'title': 'Module 5: Mảng & Chuỗi', 'lessons': [
                'Mảng 1 chiều', 'Mảng 2 chiều', 'Chuỗi C-style (char array)',
                'Các hàm xử lý chuỗi', 'std::string', 'Mảng động với new/delete',
                'Vector cơ bản', 'Sắp xếp mảng',
                'Tìm kiếm nhị phân', 'Bài tập thực hành',
            ]},
            {'title': 'Module 6: Cấu trúc dữ liệu', 'lessons': [
                'struct trong C', 'Union', 'Linked List đơn', 'Linked List đôi',
                'Stack', 'Queue', 'Binary Tree', 'Binary Search Tree',
                'Graph cơ bản', 'Hash Table',
                'Thuật toán sắp xếp nâng cao', 'Độ phức tạp thuật toán Big-O',
            ]},
            {'title': 'Module 7: OOP trong C++', 'lessons': [
                'Class và Object', 'Constructor và Destructor', 'Access modifiers',
                'Getter/Setter', 'Kế thừa (Inheritance)', 'Đa hình (Polymorphism)',
                'Virtual functions', 'Abstract class & Interface', 'Operator overloading',
                'Copy constructor', 'Move semantics (C++11)', 'Smart pointers',
                'Exception handling', 'RAII pattern',
                'Dự án: Hệ thống quản lý sinh viên',
            ]},
            {'title': 'Module 8: Template & STL', 'lessons': [
                'Function template', 'Class template',
                'STL: vector, list, deque', 'STL: stack, queue, priority_queue',
                'STL: set, map, unordered_map', 'STL Algorithms', 'Iterators',
                'Lambda expressions', 'std::thread cơ bản', 'Thi chứng chỉ C/C++',
            ]},
        ],
    },
    'java': {
        'requirements': [
            'Hiểu biết cơ bản về lập trình (khuyến nghị)',
            'Máy tính đã cài JDK 17+',
            'IDE: IntelliJ IDEA hoặc Eclipse',
        ],
        'skills': [
            'Lập trình Java OOP chuyên nghiệp',
            'Xây dựng REST API với Spring Boot',
            'Kiến trúc Microservices',
            'Làm việc với Database qua JPA/Hibernate',
            'Unit Testing với JUnit & Mockito',
        ],
        'instructor': 'Lê Thị Hương',
        'modules': [
            {'title': 'Module 1: Giới thiệu Java', 'lessons': [
                'Java là gì? JVM, JDK, JRE', 'Cài đặt môi trường Java',
                'Hello World với IntelliJ IDEA', 'Cấu trúc chương trình Java',
                'Biên dịch và chạy từ terminal', 'Java Platform: SE, EE, ME',
                'Tổng quan lộ trình học Java', 'Cộng đồng và tài nguyên',
            ]},
            {'title': 'Module 2: Cú pháp cơ bản', 'lessons': [
                'Biến và kiểu dữ liệu nguyên thuỷ', 'String và StringBuilder',
                'Toán tử trong Java', 'if/else và switch',
                'Vòng lặp for, while, do-while', 'break, continue, labeled loops',
                'Mảng (Array)', 'Mảng 2 chiều', 'Nhập liệu với Scanner',
                'Định dạng output với printf', 'Bài tập tổng hợp', 'Kiểm tra module 2',
            ]},
            {'title': 'Module 3: OOP cơ bản', 'lessons': [
                'Lớp (Class) và Đối tượng (Object)', 'Thuộc tính và phương thức',
                'Constructor', 'this keyword', 'Encapsulation & Access modifiers',
                'Getter và Setter', 'Static members', 'Method overloading',
                'Packages và import', 'JavaDoc cơ bản',
                'Bài tập: Mô hình hóa thực thể', 'Dự án: Hệ thống quản lý sản phẩm',
                'Code review & Best practices', 'Kiểm tra OOP cơ bản', 'Q&A và tổng kết',
            ]},
            {'title': 'Module 4: OOP nâng cao', 'lessons': [
                'Kế thừa (Inheritance)', 'super keyword',
                'Đa hình (Polymorphism)', 'Method overriding & @Override',
                'Abstract class', 'Interface', 'Multiple interface implementation',
                'Default & static interface methods', 'Sealed classes (Java 17)',
                'Record types (Java 16+)', 'Inner class và Anonymous class',
                'Kiểm tra OOP nâng cao',
            ]},
            {'title': 'Module 5: Collections & Generics', 'lessons': [
                'Collections Framework tổng quan', 'List: ArrayList, LinkedList',
                'Set: HashSet, TreeSet', 'Map: HashMap, TreeMap', 'Queue và Deque',
                'Generics cơ bản', 'Wildcards', 'Comparable & Comparator',
                'Collections utility class', 'Streams API cơ bản',
                'Lambda expressions', 'Method references',
            ]},
            {'title': 'Module 6: Exception Handling', 'lessons': [
                'Exception là gì?', 'try/catch/finally',
                'Checked vs Unchecked exceptions', 'Tạo Custom Exception',
                'Multi-catch và chaining', 'try-with-resources',
                'Best practices xử lý lỗi', 'Logging với SLF4J',
            ]},
            {'title': 'Module 7: Java I/O & Files', 'lessons': [
                'Java I/O streams', 'BufferedReader/Writer', 'File và Path',
                'NIO.2: Files & Paths', 'Đọc/ghi file JSON với Jackson',
                'Serialization', 'Properties files',
                'Làm việc với CSV', 'Zip và nén file', 'Bài tập: File processor',
            ]},
            {'title': 'Module 8: Multithreading', 'lessons': [
                'Thread và Process', 'Tạo Thread: extend vs Runnable',
                'Thread lifecycle', 'synchronized keyword', 'volatile và atomic',
                'ExecutorService', 'Future và CompletableFuture',
                'Concurrent collections', 'Deadlock và cách phòng tránh',
                'Virtual threads (Java 21)',
            ]},
            {'title': 'Module 9: Spring Boot cơ bản', 'lessons': [
                'Spring Framework tổng quan', 'Spring Boot: khởi tạo project',
                'Dependency Injection & IoC', 'REST Controller cơ bản',
                'Service và Repository layers', 'Spring Data JPA',
                'Kết nối PostgreSQL', 'CRUD API hoàn chỉnh',
                'Request validation', 'Exception handling toàn cục',
                'Swagger/OpenAPI docs', 'Bài tập: API quản lý sinh viên',
                'Kiểm tra Spring Boot',
            ]},
            {'title': 'Module 10: Microservices', 'lessons': [
                'Kiến trúc Microservices là gì?', 'API Gateway với Spring Cloud',
                'Service Discovery với Eureka', 'Config Server', 'Feign Client',
                'Circuit Breaker (Resilience4j)', 'Message Queue với RabbitMQ',
                'Docker cơ bản cho Java app', 'Dự án cuối khóa: E-commerce API',
                'Thi chứng chỉ Java',
            ]},
        ],
    },
    'htmlcss': {
        'requirements': [
            'Không cần kinh nghiệm lập trình trước',
            'Máy tính với trình duyệt Chrome hoặc Firefox',
            'VS Code được khuyến nghị',
        ],
        'skills': [
            'Xây dựng trang web từ đầu với HTML5',
            'Tạo giao diện đẹp với CSS3 hiện đại',
            'Thiết kế responsive cho mọi màn hình',
            'CSS Animation và hiệu ứng sinh động',
            'Phát triển dự án web thực tế hoàn chỉnh',
        ],
        'instructor': 'Phạm Thị Lan',
        'modules': [
            {'title': 'Module 1: HTML cơ bản', 'lessons': [
                'Web hoạt động như thế nào?', 'HTML là gì? Cấu trúc tài liệu',
                'Heading, paragraph, span', 'Liên kết (anchor) và điều hướng',
                'Hình ảnh và media', 'Danh sách: ol, ul, dl', 'Bảng (table)',
                'Form và input cơ bản', 'Semantic HTML5: header, main, footer',
                'article, section, aside, nav', 'Meta tags và SEO cơ bản',
                'Bài tập: Tạo trang CV cá nhân',
            ]},
            {'title': 'Module 2: HTML nâng cao', 'lessons': [
                'Form nâng cao: validation HTML5', 'Input types hiện đại',
                'Datalist, Select, Textarea', 'Audio và Video',
                'Canvas cơ bản', 'SVG trong HTML', 'Web Accessibility (a11y)',
                'ARIA attributes', 'Iframe và embed', 'Dự án: Landing page hoàn chỉnh',
            ]},
            {'title': 'Module 3: CSS cơ bản', 'lessons': [
                'CSS là gì? Cách áp dụng', 'Selectors: class, id, element',
                'Cascading và Specificity', 'Box Model chi tiết',
                'Margin, Padding, Border', 'Colors: hex, rgb, hsl',
                'Typography: font, size, weight', 'Background: color, image, gradient',
                'Display: block, inline, inline-block',
                'Position: static, relative, absolute, fixed',
                'Z-index và Stacking context', 'Bài tập: Style trang CV',
            ]},
            {'title': 'Module 4: CSS Layout', 'lessons': [
                'Flexbox cơ bản', 'Flexbox nâng cao: wrap, align',
                'CSS Grid cơ bản', 'CSS Grid nâng cao', 'Grid + Flexbox kết hợp',
                'Float và Clearfix', 'Multi-column layout',
                'Overflow và Scroll', 'Centering techniques', 'Dự án: Dashboard layout',
            ]},
            {'title': 'Module 5: Responsive Design', 'lessons': [
                'Responsive Web Design là gì?', 'Media Queries cơ bản',
                'Mobile-first approach', 'Breakpoints phổ biến',
                'Responsive images', 'Viewport và em/rem units',
                'CSS Container Queries', 'Bài tập: Website 3 breakpoints',
            ]},
            {'title': 'Module 6: CSS Animations', 'lessons': [
                'CSS Transitions', 'Transform: translate, rotate, scale',
                'Keyframe Animations', 'Animation properties',
                'Hover và focus effects', 'Loading spinners & skeletons',
                'Parallax scrolling cơ bản', 'Performance: will-change, GPU',
            ]},
            {'title': 'Module 7: Dự án thực tế', 'lessons': [
                'CSS Variables (Custom Properties)', 'Dark mode với CSS Variables',
                'CSS Preprocessor: Sass giới thiệu', 'BEM methodology',
                'Dự án 1: Portfolio website', 'Dự án 2: E-commerce product page',
                'Dự án 3: Dashboard admin', 'Dự án 4: Blog layout',
                'Tối ưu hiệu năng CSS', 'Thi chứng chỉ HTML/CSS',
            ]},
        ],
    },
}


@main_bp.route('/')
def landing():
    return render_template('landing.html')


@main_bp.route('/login')
def login_page():
    return render_template('login.html')


@main_bp.route('/register')
def register_page():
    return render_template('register.html')


@main_bp.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

def _user_stats():
    conn = get_db()
    user = conn.execute('SELECT streak, gems FROM users WHERE id=?', (current_user_id(),)).fetchone()
    conn.close()
    return {'streak': user['streak'], 'gems': user['gems']}

@main_bp.route('/questionaire')
@login_required
def questionaire():
    return render_template('questionaire.html',**_user_stats())

@main_bp.route('/interface')
@login_required
def interface():
    return render_template('interface.html', **_user_stats())

@main_bp.route('/lesson/python')
@login_required
def lesson_python():
    return render_template('lesson_python.html', **_user_stats())


@main_bp.route('/lesson/java')
@login_required
def lesson_java():
    return render_template('lesson_java.html', **_user_stats())


@main_bp.route('/lesson/htmlcss')
@login_required
def lesson_htmlcss():
    return render_template('lesson_htmlcss.html', **_user_stats())


@main_bp.route('/courses/<course_id>')
@login_required
def course_detail(course_id):
    uid = current_user_id()
    conn = get_db()
    course = conn.execute('SELECT * FROM courses WHERE id = ?', (course_id,)).fetchone()
    if not course:
        conn.close()
        return redirect('/dashboard')
    user = conn.execute('SELECT name, role, streak, gems FROM users WHERE id = ?', (uid,)).fetchone()
    enrollment = conn.execute(
        'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
        (uid, course_id)
    ).fetchone()
    conn.close()

    course = dict(course)
    user = dict(user) if user else {}
    enrollment = dict(enrollment) if enrollment else None

    curriculum = CURRICULA.get(course_id, {})
    completed = enrollment['completed_lessons'] if enrollment else 0

    flat_idx = 0
    modules_with_status = []
    for module in curriculum.get('modules', []):
        lessons_with_status = []
        for lesson_title in module['lessons']:
            if flat_idx < completed:
                status = 'done'
            elif flat_idx == completed:
                status = 'current'
            else:
                status = 'locked'
            lessons_with_status.append({'title': lesson_title, 'status': status, 'index': flat_idx})
            flat_idx += 1
        done_count = sum(1 for l in lessons_with_status if l['status'] == 'done')
        modules_with_status.append({
            'title': module['title'],
            'lessons': lessons_with_status,
            'done_count': done_count,
            'total': len(lessons_with_status),
        })

    return render_template(
        'course_detail.html',
        course=course,
        enrollment=enrollment,
        curriculum=curriculum,
        modules=modules_with_status,
        completed_lessons=completed,
        user_name=user.get('name', ''),
        user_role=user.get('role', 'Học viên'),
        streak=user.get('streak', 0),
        gems=user.get('gems', 0),
    )

