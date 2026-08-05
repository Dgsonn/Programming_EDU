"""course_content.py — Nội dung dài (description / outcomes / requirements / includes)
cho từng khóa học. Tách riêng khỏi template để:
  - Không phải {% if course_id %} rải rác trong Jinja.
  - Dễ thêm khóa mới: chỉ cần 1 entry mới trong COURSE_CONTENT.
  - Dễ bảo trì, dễ A/B test nội dung.
"""


COURSE_CONTENT = {
    'ml': {
        'tagline': 'MACHINE LEARNING · CƠ BẢN',
        'tag_color': 'Cơ bản',
        'tag_emoji': '🤖',
        'tag_label': 'CƠ BẢN',
        'theme': 'violet',          # visual identity (CSS hook)
        'accent_color': '#A78BFA',   # dùng inline cho chart/visual
        'accent_rgb': '167, 139, 250',
        'ribbon_text': '',           # overlay text trên hero (advanced only)
        'description': (
            'Tuần 3 của học kỳ. Hệ thống <strong>USTH StudyLab</strong> muốn trả lời một câu hỏi '
            'mà không luật if/else nào viết nổi: <em>"học viên nào đang trên đà rớt môn — khi điểm cuối kỳ '
            'còn CHƯA tồn tại?"</em> Bạn là người dựng mô hình Machine Learning đầu tiên cho StudyLab.'
        ),
        'what_you_learn': (
            'Qua <strong>15 bài</strong> (5 module), bạn đi từ <em>chưa biết ML là gì</em> đến '
            '<em>tự tay huấn luyện và đánh giá model trung thực</em>: định nghĩa đúng bài toán, '
            'chuẩn bị dữ liệu sạch, hồi quy tuyến tính + gradient descent, phân loại logistic, '
            'và nghệ thuật không tự dối mình khi đánh giá (train/validation/test).'
        ),
        'highlight': (
            'Điểm đặc biệt: <strong>Python THẬT (numpy, pandas, scikit-learn) chạy ngay trong '
            'trình duyệt</strong> — không cần cài đặt gì. Mỗi bài kết thúc bằng IDE thật, '
            'và bài nộp được chấm <strong>4 tầng như code review thật</strong>: '
            'Output đúng chưa — Code đúng thứ tự chưa — Model có thật sự học không — và có '
            '"chạy được nhưng SAI về nghĩa" không.'
        ),
        'outcomes': [
            ('🎯', '<strong>Nhận diện đúng loại bài toán ML</strong> (regression / classification / '
                    'clustering) từ câu hỏi + target — không nhìn nhầm theo kiểu dữ liệu lưu trữ'),
            ('🧹', '<strong>Chuẩn bị dữ liệu sạch</strong>: kiểu dữ liệu ngữ nghĩa, làm sạch, scale — '
                    'và không bao giờ để lộ target vào X (leakage)'),
            ('📈', '<strong>Tự tay huấn luyện Linear Regression</strong>, đo lỗi bằng MSE và hiểu gradient '
                    'descent tự chỉnh đường thẳng thế nào'),
            ('🎲', '<strong>Biến điểm số thành xác suất</strong> bằng sigmoid và vẽ decision boundary tách 2 lớp'),
            ('🔬', '<strong>Chẩn đoán underfit / overfit</strong> và chia Train / Validation / Test để đánh giá '
                    'không tự dối mình'),
            ('🐍', '<strong>Viết code ML bằng Python thật</strong> — pandas chọn cột theo nghĩa, fit/predict '
                    'đúng quy trình, qua được cả 4 tầng chấm'),
        ],
        'learning_note': (
            '💡 <strong>Cách học:</strong> Mỗi bài 4 bước — Model Story (xem hiện tượng) → '
            'Concept Check (kéo thả, phân loại) → Experiment Builder (tự dựng thí nghiệm, xem code sinh ra) → '
            'Full Python IDE (tự code, chấm 4 tầng thật).'
        ),
        'requirements': [
            ('python', 'lock',
             'Python cơ bản: biến, hàm, list (tương đương phần đầu khóa Python)'),
            ('static', 'info',
             'Toán phổ thông: hàm số, trung bình cộng — mọi công thức đều được giải thích lại bằng hình'),
            ('static', 'info',
             'Trình duyệt hiện đại — Python chạy NGAY TRONG trình duyệt (Pyodide), không cần cài đặt gì'),
        ],
        'includes': [
            ('fas fa-book-open', '15 bài học (dự án USTH StudyLab)'),
            ('fas fa-project-diagram', '5 module (Framing / Data / Regression / Classification / Evaluation)'),
            ('fas fa-clock', '~5 giờ học'),
            ('fab fa-python', 'Python thật trong trình duyệt (numpy, pandas, sklearn)'),
            ('fas fa-infinity', 'Truy cập vĩnh viễn'),
            ('fas fa-certificate', 'Chứng chỉ hoàn thành'),
            ('fas fa-mobile-alt', 'Học trên mọi thiết bị'),
        ],
        'modules_breakdown': '5 module (Framing / Data / Regression / Classification / Evaluation)',
        'skills': [
            (1, 'fa-compass', 'ML Problem Framer', 'Nhận diện đúng loại bài toán, target và hợp đồng dữ liệu'),
            (1, 'fa-table', 'Người đọc Dataset', 'Dòng = sample, cột = attribute, X/y không leakage'),
            (2, 'fa-broom', 'Data Preparation Scout', 'Kiểu dữ liệu ngữ nghĩa, làm sạch bảo thủ, scale đúng cột'),
            (2, 'fa-chart-simple', 'Người đọc Thống kê', 'Mean / median / std — đọc dữ liệu trước khi train'),
            (3, 'fa-chart-line', 'Kỹ sư Hồi quy', 'Đường dự đoán đầu tiên + đo lỗi bằng MSE'),
            (3, 'fa-arrow-trend-down', 'Người thuần Gradient', 'Gradient descent — model tự chỉnh đường thẳng'),
            (4, 'fa-wave-square', 'Sigmoid & Xác suất', 'Từ score sang xác suất — logistic regression'),
            (4, 'fa-draw-polygon', 'Người vẽ Ranh giới', 'Decision boundary — luật tách 2 lớp học được'),
            (5, 'fa-magnifying-glass-chart', 'Thợ săn Overfit', 'Chẩn đoán under/good/overfit từ đường cong học'),
            (5, 'fa-scale-balanced', 'Người đánh giá Trung thực', 'Train / Validation / Test — không tự dối mình'),
        ],
    },

    'ml_intermediate': {
        'tagline': 'MACHINE LEARNING · TRUNG CẤP',
        'tag_color': 'Trung cấp',
        'tag_emoji': '📊',
        'tag_label': 'TRUNG CẤP',
        'theme': 'blue',              # visual identity khác Course 1 (violet) và Course 3 (cyan)
        'accent_color': '#60A5FA',
        'accent_rgb': '96, 165, 250',
        'ribbon_text': '📊 TRUNG CẤP · Course 2',
        'description': (
            'StudyLab đã có model đầu tiên từ Course 1 — nhưng model đó chỉ dùng 1 feature, '
            'chưa có validation, chưa biết xử lý dữ liệu mất cân bằng. Giờ là lúc đưa nó thành '
            '<strong>một pipeline thật</strong>: nhiều feature, regularization, đúng metric, '
            'và những model mạnh hơn (KNN, Decision Tree, Random Forest).'
        ),
        'what_you_learn': (
            'Qua <strong>14 bài (4 module)</strong>, bạn đi từ <em>Multiple Regression trong '
            'pipeline thực tế</em> đến <em>Random Forest</em>: feature scaling & convergence, '
            'Logistic Regression bằng Gradient Descent, Regularization L1/L2 chọn bằng '
            'validation, chẩn đoán bias-variance, các metric đánh giá trung thực (MAE/MSE/R², '
            'Confusion Matrix, Precision/Recall/F1), KNN, Decision Tree, Random Forest. Cùng '
            '<strong>runtime Pyodide + ml_lab production</strong> — Python thật trong trình duyệt.'
        ),
        'highlight': (
            'Điểm đặc biệt: <strong>scikit-learn thật (LinearRegression, LogisticRegression, '
            'KNeighborsClassifier, DecisionTreeClassifier, RandomForestClassifier) chạy NGAY '
            'trong trình duyệt</strong>. Mỗi bài có 4 bước và chấm <strong>4 tầng thật</strong> '
            '(Output / Code-AST / Model behavior / Risk) — luôn bắt các bẫy kinh điển: '
            'scaler/leakage rò rỉ qua validation set, test tuning, overfit do thiếu regularization, '
            'accuracy đánh lừa khi class mất cân bằng.'
        ),
        'outcomes': [
            ('🎯', '<strong>Build pipeline Multiple Regression thật</strong>: nhiều feature, '
                    'scale đúng cách, tránh convergence chậm'),
            ('🎲', '<strong>Train Logistic Regression bằng Gradient Descent</strong> và hiểu vì sao '
                    'log loss phạt nặng các dự đoán sai đầy tự tin'),
            ('🛡️', '<strong>Regularization L1/L2</strong>: kiểm soát độ phức tạp model, chọn regularization '
                    'strength bằng validation — không đoán mù'),
            ('🔬', '<strong>Chẩn đoán bias-variance</strong> và chọn đúng metric (MAE/MSE/R² cho regression, '
                    'Precision/Recall/F1 cho classification mất cân bằng)'),
            ('📐', '<strong>KNN, Decision Tree, Random Forest</strong>: hiểu ảnh hưởng của k, max_depth, '
                    'và vì sao ensemble giảm variance so với 1 cây đơn lẻ'),
            ('🐍', '<strong>Viết code ML bằng Python thật</strong> — scikit-learn, train/val split đúng '
                    'quy trình, qua được cả 4 tầng chấm'),
        ],
        'learning_note': (
            '💡 <strong>Cách học:</strong> Mỗi bài 4 bước — Model Story (xem hiện tượng) → '
            'Concept Check (kéo thả, phân loại) → Experiment Builder (tự dựng thí nghiệm, xem code sinh ra) → '
            'Full Python IDE (tự code, chấm 4 tầng thật).'
        ),
        'requirements': [
            ('ml', 'lock',
             'Đã hoàn thành Course 1 (ML Foundations) hoặc biết Linear/Logistic Regression, '
             'train/val/test, MSE, gradient descent cơ bản'),
            ('static', 'info',
             'Python cơ bản + đọc hiểu NumPy array/DataFrame ở mức thoải mái'),
            ('static', 'info',
             'Trình duyệt hiện đại — Python chạy NGAY TRONG trình duyệt (Pyodide), không cần cài đặt gì'),
        ],
        'includes': [
            ('fas fa-book-open', '14 bài học (4 module — Linear Models / Logistic & Regularization / '
                                  'Evaluation / Instance & Tree Models)'),
            ('fas fa-project-diagram', '4 module thực hành'),
            ('fas fa-clock', '~6 giờ học'),
            ('fab fa-python', 'Python thật trong trình duyệt (NumPy, Pandas, scikit-learn)'),
            ('fas fa-infinity', 'Truy cập vĩnh viễn'),
            ('fas fa-certificate', 'Chứng chỉ hoàn thành'),
            ('fas fa-mobile-alt', 'Học trên mọi thiết bị'),
        ],
        'modules_breakdown': '4 module (Linear Models in Practice / Logistic Regression & Regularization / '
                              'Model Evaluation & Diagnosis / Instance & Tree-Based Models)',
        'skills': [
            (1, 'fa-layer-group', 'Pipeline Builder', 'Multiple Regression thật — nhiều feature, scale đúng, tránh leakage'),
            (1, 'fa-gauge-high', 'Convergence Tuner', 'Feature scaling và ảnh hưởng đến tốc độ hội tụ gradient descent'),
            (2, 'fa-bullseye', 'Confident-Wrong Hunter', 'Log loss — vì sao dự đoán sai đầy tự tin bị phạt nặng'),
            (2, 'fa-shield-halved', 'Regularization Tuner', 'L1/L2, chọn strength bằng validation, không đoán mù'),
            (3, 'fa-chart-line', 'Bias-Variance Diagnostician', 'Chẩn đoán học ổn định/không ổn định qua learning curve'),
            (3, 'fa-scale-balanced', 'Metric Chooser', 'MAE/MSE/R², Confusion Matrix, Precision/Recall/F1 — chọn đúng metric'),
            (4, 'fa-diagram-project', 'Instance Learner', 'KNN — ảnh hưởng của k và feature scaling'),
            (4, 'fa-tree', 'Tree & Forest Builder', 'Decision Tree, Random Forest — overfit control & ensemble'),
        ],
    },

    'ml_advanced': {
        'tagline': 'MACHINE LEARNING · NÂNG CAO',
        'tag_color': 'Nâng cao',
        'tag_emoji': '🧬',
        'tag_label': 'NÂNG CAO',
        'theme': 'cyan',               # visual identity khác Course 1 (violet) và Course 2 (blue)
        'accent_color': '#22D3EE',
        'accent_rgb': '34, 211, 238',
        'ribbon_text': '🧬 NÂNG CAO · Course 3',
        'description': (
            'Model của StudyLab giờ có nhiều feature, có regularization — nhưng vẫn chỉ nhìn '
            'dữ liệu qua một lát cắt phẳng. Khi số chiều dữ liệu tăng lên hàng chục, hàng trăm, '
            '"gần" và "xa" bắt đầu mất nghĩa. Course 3 đưa bạn vào <strong>không gian nhiều '
            'chiều thật sự</strong> — PCA, SVM, clustering không nhãn — rồi mở nắp máy: tự tay '
            'lập trình cơ chế bên trong một neural network, từ neuron đơn đến backpropagation.'
        ),
        'what_you_learn': (
            'Qua <strong>14 bài (5 module)</strong>, bạn đi từ <em>curse of dimensionality</em> '
            'đến <em>bảo vệ một thí nghiệm neural network tái lập được</em>: PCA và explained '
            'variance, Support Vector Machine (margin, support vectors, kernel), clustering '
            'không nhãn (K-means, chọn k, DBSCAN/hierarchical), rồi tự lập trình perceptron, '
            'activation function, feedforward và backpropagation bằng NumPy — chốt bằng một bài '
            'lab PyTorch huấn luyện thật trên remote CPU sandbox.'
        ),
        'highlight': (
            'Điểm đặc biệt: phần lớn bài học vẫn chạy <strong>Python thật trong trình duyệt</strong> '
            '(numpy, pandas, scikit-learn qua Pyodide) như Course 1/2, nhưng Bài 14 mở ra '
            '<strong>remote CPU sandbox</strong> để train PyTorch thật — có giới hạn thời gian/bộ '
            'nhớ, tắt mạng, không lưu model. Mỗi bài vẫn chấm <strong>4 tầng</strong> '
            '(Output / Code-AST / Model behavior / Risk), bẫy giờ tinh vi hơn: PCA trước khi split, '
            'chọn k bằng nhãn, tune kiến trúc mạng trên tập test.'
        ),
        'outcomes': [
            ('📐', '<strong>Chẩn đoán hình học nhiều chiều</strong> và chọn một biểu diễn PCA '
                    'bảo vệ được (explained variance, không PCA trước khi split)'),
            ('🛡️', '<strong>Tune và giải thích SVM</strong> qua margin, support vector và bằng '
                    'chứng validation — không chỉ đoán C/kernel'),
            ('🔍', '<strong>Thiết kế thí nghiệm clustering</strong> không rò rỉ nhãn, không tuyên '
                    'bố ngữ nghĩa sai (K-means, chọn k, DBSCAN, hierarchical)'),
            ('🧠', '<strong>Tự lập trình perceptron, activation, feedforward và backpropagation</strong> '
                    'bằng NumPy — hiểu đúng cơ chế bên trong, không chỉ gọi thư viện'),
            ('🔬', '<strong>Train, đánh giá và bảo vệ</strong> một neural network nhỏ dưới ngân sách '
                    'CPU cố định — gradient checking, learning curve, model card'),
            ('🐍', '<strong>Viết code ML bằng Python thật</strong> — từ Pyodide (numpy/pandas/sklearn) '
                    'đến PyTorch trên remote sandbox, qua được cả 4 tầng chấm'),
        ],
        'learning_note': (
            '💡 <strong>Cách học:</strong> Mỗi bài 4 bước — Model Story (xem hiện tượng) → '
            'Concept Check (kéo thả, phân loại) → Experiment Builder (tự dựng thí nghiệm, xem code sinh ra) → '
            'Full Python IDE (tự code, chấm 4 tầng thật).'
        ),
        'requirements': [
            ('ml_intermediate', 'info',
             'Ghi danh độc lập — không bắt buộc đã mua Course 1/2. Có bài chẩn đoán đầu vào '
             '(diagnostic) + Bridge Pack bù kiến thức nếu thiếu (đại số tuyến tính, quy trình '
             'thí nghiệm, đạo hàm, unsupervised learning, PyTorch cơ bản)'),
            ('static', 'info',
             'NumPy ở mức thoải mái: shape, broadcasting, phép nhân ma trận'),
            ('static', 'info',
             'Trình duyệt hiện đại cho 13 bài đầu (Pyodide); Bài 14 cần kết nối mạng ổn định để '
             'dùng remote CPU sandbox'),
        ],
        'includes': [
            ('fas fa-book-open', '14 bài học (5 module — High-Dimensional Representation / '
                                  'Margin-Based Classification / Clustering & Structure Discovery / '
                                  'Neural Computation / Backpropagation & Experiment Defense)'),
            ('fas fa-project-diagram', '5 module thực hành'),
            ('fas fa-clock', '~7 giờ học'),
            ('fab fa-python', 'Python thật trong trình duyệt (NumPy, Pandas, scikit-learn) + PyTorch remote sandbox'),
            ('fas fa-infinity', 'Truy cập vĩnh viễn'),
            ('fas fa-certificate', 'Chứng chỉ hoàn thành'),
            ('fas fa-mobile-alt', 'Học trên mọi thiết bị'),
        ],
        'modules_breakdown': '5 module (High-Dimensional Representation / Margin-Based Classification / '
                              'Clustering & Structure Discovery / Neural Computation / Backpropagation & '
                              'Experiment Defense)',
        'skills': [
            (1, 'fa-cube', 'Representation Engineer', 'Chẩn đoán curse of dimensionality, PCA an toàn, chọn số chiều bảo vệ được'),
            (2, 'fa-vector-square', 'Margin Analyst', 'SVM — margin, support vector, C/kernel bằng bằng chứng validation'),
            (3, 'fa-diagram-project', 'Cluster Investigator', 'K-means, chọn k, DBSCAN/hierarchical — không rò rỉ nhãn'),
            (4, 'fa-network-wired', 'Neural Mechanism Builder', 'Perceptron, activation, feedforward — tự lập trình bằng NumPy'),
            (5, 'fa-brain', 'Neural Experiment Designer', 'Backpropagation, gradient checking, train/defend PyTorch experiment'),
        ],
    },

}


def get_content(course_id: str) -> dict:
    """Trả content cho course, fallback về Course 1 nếu không tìm thấy."""
    return COURSE_CONTENT.get(course_id) or COURSE_CONTENT['ml']
