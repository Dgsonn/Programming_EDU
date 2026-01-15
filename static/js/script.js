// ==========================================
// 1. DỮ LIỆU & LOGIC DASHBOARD (HỌC TẬP)
// ==========================================

const topics = [
    { name: 'SQL Injection', desc: 'Lỗ hổng chèn mã SQL vào database.', icon: 'database' },
    { name: 'XSS', desc: 'Mã độc JavaScript chạy trên trình duyệt.', icon: 'code' },
    { name: 'Phishing', desc: 'Tấn công lừa đảo trực tuyến.', icon: 'user-secret' },
    { name: 'Password Security', desc: 'Quản lý mật khẩu và xác thực.', icon: 'key' },
    { name: 'Malware', desc: 'Phần mềm độc hại và virus.', icon: 'bug' },
    { name: 'Network Safety', desc: 'An toàn mạng WiFi và VPN.', icon: 'wifi' }
];

let currentTopic = '';

// --- NAVIGATION (CHUYỂN TAB TRONG DASHBOARD) ---
function showTab(tabName) {
    // Danh sách các tab cần quản lý
    const tabs = ['learn', 'check', 'profile'];

    // 1. Ẩn tất cả các view và reset style của tab
    tabs.forEach(id => {
        const view = document.getElementById(`view-${id}`);
        const tab = document.getElementById(`tab-${id}`);
        
        if (view) view.classList.add('hidden');
        if (tab) {
             // Style mặc định (chưa chọn)
             tab.className = "px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-all dark:text-gray-400 dark:hover:text-white";
        }
    });

    // 2. Hiển thị view được chọn và active tab
    const selectedView = document.getElementById(`view-${tabName}`);
    const selectedTab = document.getElementById(`tab-${tabName}`);

    if (selectedView) selectedView.classList.remove('hidden');
    if (selectedTab) {
        // Style active (đang chọn)
        selectedTab.className = "px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 bg-gray-900 text-white transition-all dark:bg-blue-600";
    }
}

// --- LOGIC PHẦN HỌC TẬP (LEARN) ---
function renderTopics() {
    const grid = document.getElementById('topic-grid');
    if (!grid) return;

    grid.innerHTML = '';
    topics.forEach(t => {
        grid.innerHTML += `
            <div onclick="selectTopic('${t.name}')" class="bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md p-6 rounded-2xl cursor-pointer transition-all group relative overflow-hidden">
                <div class="flex justify-between mb-4">
                    <i class="fa-solid fa-${t.icon} text-3xl text-blue-500"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 font-mono">${t.name}</h3>
                <p class="text-gray-500 text-sm">${t.desc}</p>
            </div>
        `;
    });
}

function selectTopic(name) {
    currentTopic = name;
    document.getElementById('topic-grid').classList.add('hidden');
    document.getElementById('mode-select').classList.remove('hidden');
    document.getElementById('mode-select').classList.add('flex');
    document.getElementById('selected-topic-title').innerText = name;
}

function resetLearn() {
    document.getElementById('topic-grid').classList.remove('hidden');
    document.getElementById('mode-select').classList.add('hidden');
    document.getElementById('mode-select').classList.remove('flex');
    document.getElementById('lesson-content').classList.add('hidden');
    document.getElementById('quiz-content').classList.add('hidden');
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('loading').classList.remove('flex');
}

async function startLesson() {
    document.getElementById('mode-select').classList.add('hidden');
    document.getElementById('mode-select').classList.remove('flex');
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('loading').classList.add('flex');

    try {
        const res = await fetch('/api/lesson', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({topic: currentTopic})
        });
        const data = await res.json();

        document.getElementById('loading').classList.add('hidden');
        document.getElementById('loading').classList.remove('flex');
        document.getElementById('lesson-content').classList.remove('hidden');
        document.getElementById('lesson-heading').innerText = data.title;
        
        const body = document.getElementById('lesson-body');
        body.innerHTML = '';
        data.sections.forEach(sec => {
            body.innerHTML += `
                <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2 font-mono"><span class="text-blue-500 mr-2">#</span>${sec.heading}</h3>
                    <p class="pl-4 border-l-4 border-gray-200 text-gray-600">${sec.content}</p>
                </div>
            `;
        });
    } catch (e) { console.error(e); }
}

async function startQuiz() {
    document.getElementById('mode-select').classList.add('hidden');
    document.getElementById('mode-select').classList.remove('flex');
    document.getElementById('lesson-content').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('loading').classList.add('flex');

    try {
        const res = await fetch('/api/quiz', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({topic: currentTopic})
        });
        const data = await res.json();

        document.getElementById('loading').classList.add('hidden');
        document.getElementById('loading').classList.remove('flex');
        document.getElementById('quiz-content').classList.remove('hidden');
        document.getElementById('quiz-heading').innerText = data.title;

        const body = document.getElementById('quiz-body');
        body.innerHTML = '';
        data.questions.forEach((q, idx) => {
            let opts = '';
            q.options.forEach((opt, oIdx) => {
                opts += `<button onclick="checkAnswer(this, ${idx}, ${oIdx}, ${q.correctIndex})" class="w-full text-left p-3 border border-gray-300 rounded-lg mb-2 hover:bg-gray-50 transition-all text-gray-700 font-medium">
                    <span class="font-bold text-gray-400 mr-2">${['A','B','C','D'][oIdx]}.</span> ${opt}
                </button>`;
            });
            
            body.innerHTML += `
                <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div class="mb-4 text-gray-800 font-bold"><span class="text-blue-600 font-mono mr-2">Q${idx+1}.</span>${q.text}</div>
                    <div>${opts}</div>
                    <div id="explain-${idx}" class="hidden mt-3 p-3 bg-blue-50 text-sm text-blue-800 rounded-lg">
                        <strong>Giải thích:</strong> ${q.explanation}
                    </div>
                </div>
            `;
        });
    } catch (e) { console.error(e); }
}

function checkAnswer(btn, qIdx, oIdx, correctIdx) {
    const parent = btn.parentElement;
    const allBtns = parent.querySelectorAll('button');
    allBtns.forEach(b => b.disabled = true);

    if(oIdx === correctIdx) {
        btn.classList.add('bg-green-100', 'border-green-500', 'text-green-800');
    } else {
        btn.classList.add('bg-red-100', 'border-red-500', 'text-red-800');
        allBtns[correctIdx].classList.add('bg-green-100', 'border-green-500', 'text-green-800');
    }
    document.getElementById(`explain-${qIdx}`).classList.remove('hidden');
}

// --- LOGIC PHẦN KIỂM TRA (CHECK) ---
async function runCheck() {
    const input = document.getElementById('check-input').value;
    if(!input) return;

    document.getElementById('check-form').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('loading').classList.add('flex');

    try {
        const res = await fetch('/api/check', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({input: input})
        });
        const data = await res.json();

        document.getElementById('loading').classList.add('hidden');
        document.getElementById('loading').classList.remove('flex');
        document.getElementById('check-result').classList.remove('hidden');

        const riskEl = document.getElementById('risk-level');
        riskEl.innerText = data.riskLevel;
        riskEl.className = data.riskLevel === 'SAFE' ? 'text-green-600' : (data.riskLevel === 'LOW' ? 'text-blue-600' : 'text-red-600');
        
        const scoreEl = document.getElementById('risk-score');
        scoreEl.innerText = data.score + '/100';
        scoreEl.style.color = data.score > 80 ? '#16a34a' : '#dc2626';

        document.getElementById('risk-summary').innerText = data.summary;

        const findingsDiv = document.getElementById('risk-findings');
        findingsDiv.innerHTML = '';
        data.findings.forEach(f => {
            findingsDiv.innerHTML += `
                <div class="bg-gray-50 border border-gray-200 rounded p-4">
                    <div class="text-xs font-bold mb-1 text-red-500">[${f.severity}]</div>
                    <div class="text-gray-800 mb-2">${f.description}</div>
                    <div class="text-sm text-gray-500 bg-white p-2 rounded border border-gray-100"><strong>Fix:</strong> ${f.recommendation}</div>
                </div>
            `;
        });
    } catch(e) { console.error(e); }
}

function resetCheck() {
    document.getElementById('check-result').classList.add('hidden');
    document.getElementById('check-form').classList.remove('hidden');
    document.getElementById('check-input').value = '';
}


// ==========================================
// 2. KHỞI CHẠY (CHUNG CHO CẢ LANDING & DASHBOARD)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- PHẦN DASHBOARD ---
    // Nếu có topic-grid thì mới chạy logic render (để tránh lỗi ở trang Landing)
    const grid = document.getElementById('topic-grid');
    if (grid) {
        renderTopics();
    }

    // --- PHẦN LANDING PAGE ---
    
    // 1. Xử lý Search
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchInput && searchBtn) {
        function handleSearch() {
            const query = searchInput.value.trim();
            if (query) {
                alert(`Bạn đang tìm kiếm: "${query}" (Chức năng đang phát triển)`);
            } else {
                searchInput.focus();
            }
        }
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }

    // 2. [QUAN TRỌNG] Đã XÓA đoạn code chặn sự kiện click của nút Get Started.
    // Bây giờ thẻ <a href="/auth"> sẽ hoạt động bình thường.

    // 3. Xử lý Hero Image Click (Vui vẻ)
    const imagePlaceholder = document.getElementById('heroImageArea');
    if (imagePlaceholder) {
        imagePlaceholder.addEventListener('click', () => {
            console.log("Image clicked");
        });
    }
});

