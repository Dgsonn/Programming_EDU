/* ============================================================================
 * lesson_db_design.js — Database Design lesson page logic
 * Drives the 4-step pipeline UI:
 *   Step 1: render theory (primer + visual DB + mission)
 *   Step 2: render MCQ with micro-interactions
 *   Step 3: drag-to-query with two-way sync to live IDE display
 *   Step 4: CodeMirror SQL editor + run + validate
 *
 * Data: window.LESSON_CONTENT['db_design'] (loaded from lesson_content.js)
 * Editor: CodeMirror 6 (loaded from CDN)
 * ============================================================================ */

(function () {
  'use strict';

  /* ─── CHANGE 1: Hero SVG per lesson (lookup table) ──────────────────────────── */
  // Each SVG: 400x300 viewBox, var(--module-accent) colors, simple geometric.
  // B13/B17/B18 thêm animated details (hero-pulse class + staggered delay).
  const HERO_SVGS = {
    /* B1: Hero PK demo (Bài 1) — animation loop 3s: dòng id=101 sáng cyan + viền glow,
     * 3 dòng còn lại mờ opacity 0.2, nhãn "WHERE id = 101" pulse đồng pha.
     * Thông điệp: "PK = chốt đúng 1 dòng". */
    db_01: '<svg viewBox="0 0 500 350" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="game_catalog: hai game trùng tên Elden Ring (id 101 và 104); Primary Key id chốt đúng dòng 101">' +
      /* Title */
      '<text x="250" y="30" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="18" font-weight="700">game_catalog</text>' +
      /* Column headers */
      '<g class="hero-pk-cols" font-family="JetBrains Mono, monospace" font-size="14" font-weight="600" fill="var(--text-300)">' +
        '<text x="80" y="68">id</text>' +
        '<text x="220" y="68">name</text>' +
        '<line x1="50" y1="78" x2="450" y2="78" stroke="var(--text-300)" stroke-width="1" opacity="0.4"/>' +
      '</g>' +
      /* 4 rows: 101 = KEY (cyan, PK chốt) · 104 = COLLISION (amber, cùng tên "Elden Ring") · 102/103 dim */
      '<g class="hero-pk-rows" font-family="JetBrains Mono, monospace" font-size="15" font-weight="500">' +
        /* Row 1: id=101 Elden Ring — KEY row (name amber = 1 nửa cặp trùng tên) */
        '<g class="pkrow pkrow-key">' +
          '<rect x="50" y="92" width="400" height="36" rx="6" fill="rgba(34,211,238,0.15)" stroke="#22D3EE" stroke-width="1.5"/>' +
          '<text x="80" y="115" fill="var(--text-100)">101</text>' +
          '<text x="220" y="115" fill="#FCD34D" font-weight="700">Elden Ring</text>' +
          '<text x="430" y="115" text-anchor="end" fill="#22D3EE" font-size="12" font-weight="700">🔑 PK</text>' +
        '</g>' +
        /* Row 2: dimmed filler */
        '<g class="pkrow pkrow-dim">' +
          '<rect x="50" y="138" width="400" height="36" rx="6" fill="rgba(255,255,255,0.02)"/>' +
          '<text x="80" y="161" fill="var(--text-300)">102</text>' +
          '<text x="220" y="161" fill="var(--text-300)">God of War</text>' +
        '</g>' +
        /* Row 3: dimmed filler */
        '<g class="pkrow pkrow-dim">' +
          '<rect x="50" y="184" width="400" height="36" rx="6" fill="rgba(255,255,255,0.02)"/>' +
          '<text x="80" y="207" fill="var(--text-300)">103</text>' +
          '<text x="220" y="207" fill="var(--text-300)">Hades</text>' +
        '</g>' +
        /* Row 4: id=104 Elden Ring — COLLISION row (amber dashed, semi-visible: cùng tên NHƯNG id khác) */
        '<g class="pkrow" style="opacity:0.62">' +
          '<rect x="50" y="230" width="400" height="36" rx="6" fill="rgba(252,211,77,0.07)" stroke="rgba(252,211,77,0.45)" stroke-width="1" stroke-dasharray="4 3"/>' +
          '<text x="80" y="253" fill="var(--text-300)">104</text>' +
          '<text x="220" y="253" fill="#FCD34D" font-weight="700">Elden Ring</text>' +
          '<text x="430" y="253" text-anchor="end" fill="#FCD34D" font-family="Inter, sans-serif" font-size="11" font-weight="600">trùng tên · id khác</text>' +
        '</g>' +
      '</g>' +
      /* WHERE id = 101 label — pulse đồng pha với key row: chốt đúng 1 dòng DÙ trùng tên */
      '<g class="hero-pk-where" transform="translate(250, 308)">' +
        '<rect x="-140" y="-16" width="280" height="32" rx="16" fill="rgba(34,211,238,0.1)" stroke="#22D3EE" stroke-width="1"/>' +
        '<text x="0" y="5" text-anchor="middle" fill="#22D3EE" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700">WHERE id = 101 → đúng 1 dòng</text>' +
      '</g></svg>',

    db_02: '<svg viewBox="0 0 500 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="3 loại thuộc tính đặc biệt: Composite (name tách first_name last_name), Multivalued (player nhiều platform tách bảng riêng), Derived (age tính từ birth_year)">' +
      '<text x="250" y="24" text-anchor="middle" fill="var(--text-400)" font-size="13">① Composite — tách 1 cột thành nhiều mảnh</text>' +
      '<ellipse cx="92" cy="72" rx="60" ry="24" fill="rgba(245,158,11,0.12)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<text x="92" y="78" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="17" font-weight="600">name</text>' +
      '<line x1="152" y1="72" x2="216" y2="50" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<line x1="152" y1="72" x2="216" y2="98" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<ellipse cx="300" cy="50" rx="80" ry="21" fill="rgba(245,158,11,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<text x="300" y="56" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14">first_name</text>' +
      '<ellipse cx="300" cy="98" rx="80" ry="21" fill="rgba(245,158,11,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<text x="300" y="104" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14">last_name</text>' +
      '<text x="250" y="158" text-anchor="middle" fill="var(--text-400)" font-size="13">② Multivalued — 1 người nhiều platform → tách bảng riêng</text>' +
      '<ellipse cx="92" cy="208" rx="62" ry="24" fill="rgba(245,158,11,0.12)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<text x="92" y="214" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="16" font-weight="600">player</text>' +
      '<line x1="154" y1="208" x2="214" y2="186" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<line x1="154" y1="208" x2="214" y2="208" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<line x1="154" y1="208" x2="214" y2="230" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="216" y="174" width="82" height="24" rx="6" fill="rgba(245,158,11,0.05)" stroke="var(--module-accent)" stroke-width="1.6"/>' +
      '<text x="257" y="190" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="13">PS5</text>' +
      '<rect x="216" y="196" width="82" height="24" rx="6" fill="rgba(245,158,11,0.05)" stroke="var(--module-accent)" stroke-width="1.6"/>' +
      '<text x="257" y="212" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="13">Xbox</text>' +
      '<rect x="216" y="218" width="82" height="24" rx="6" fill="rgba(245,158,11,0.05)" stroke="var(--module-accent)" stroke-width="1.6"/>' +
      '<text x="257" y="234" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="13">PC</text>' +
      '<text x="312" y="212" fill="var(--text-500)" font-size="11" font-style="italic">player_platform</text>' +
      '<text x="250" y="290" text-anchor="middle" fill="var(--text-400)" font-size="13">③ Derived — tính khi cần, KHÔNG lưu</text>' +
      '<ellipse cx="92" cy="338" rx="56" ry="24" fill="rgba(245,158,11,0.12)" stroke="var(--module-accent)" stroke-width="2" stroke-dasharray="5,3"/>' +
      '<text x="92" y="344" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="17" font-weight="600">age</text>' +
      '<line x1="148" y1="338" x2="214" y2="338" stroke="var(--module-accent)" stroke-width="2" marker-end="url(#arrow)"/>' +
      '<ellipse cx="300" cy="338" rx="80" ry="21" fill="rgba(245,158,11,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<text x="300" y="344" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14">birth_year</text>' +
      '<text x="250" y="404" text-anchor="middle" fill="var(--text-400)" font-size="13">3 kiểu thuộc tính đặc biệt: Composite · Multivalued · Derived</text></svg>',

    db_03: '<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Khóa ngoại pub_id của game trỏ về publisher.id, JOIN ghép 2 bảng">' +
      '<defs><marker id="ar03" markerWidth="9" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="var(--primary)"/></marker></defs>' +
      '<text x="300" y="34" text-anchor="middle" fill="var(--text-400)" font-size="16">1 publisher ← N game · nối bằng Khóa ngoại</text>' +
      /* game table */
      '<rect x="40" y="66" width="230" height="180" rx="10" fill="rgba(245,158,11,0.06)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="40" y="66" width="230" height="34" rx="10" fill="var(--module-accent)"/>' +
      '<text x="155" y="90" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-size="18" font-weight="700">game</text>' +
      '<text x="60" y="132" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="15">game_id</text>' +
      '<rect x="200" y="118" width="46" height="19" rx="9" fill="rgba(245,158,11,0.2)" stroke="var(--module-accent)" stroke-width="1"/>' +
      '<text x="223" y="132" text-anchor="middle" fill="var(--module-accent)" font-size="11" font-weight="700">PK</text>' +
      '<text x="60" y="166" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="15">title</text>' +
      '<rect x="46" y="180" width="218" height="30" rx="6" fill="rgba(6,182,212,0.14)"/>' +
      '<text x="60" y="200" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="15">pub_id</text>' +
      '<rect x="200" y="186" width="46" height="19" rx="9" fill="rgba(6,182,212,0.2)" stroke="var(--primary)" stroke-width="1"/>' +
      '<text x="223" y="200" text-anchor="middle" fill="var(--primary)" font-size="11" font-weight="700">FK</text>' +
      /* publisher table */
      '<rect x="360" y="80" width="210" height="120" rx="10" fill="rgba(245,158,11,0.06)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="360" y="80" width="210" height="34" rx="10" fill="var(--module-accent)"/>' +
      '<text x="465" y="104" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-size="17" font-weight="700">publisher</text>' +
      '<rect x="366" y="128" width="198" height="30" rx="6" fill="rgba(245,158,11,0.14)"/>' +
      '<text x="380" y="148" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="15">id</text>' +
      '<rect x="500" y="134" width="46" height="19" rx="9" fill="rgba(245,158,11,0.2)" stroke="var(--module-accent)" stroke-width="1"/>' +
      '<text x="523" y="148" text-anchor="middle" fill="var(--module-accent)" font-size="11" font-weight="700">PK</text>' +
      '<text x="380" y="182" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="15">name</text>' +
      /* FK arrow game.pub_id → publisher.id */
      '<path d="M 264 195 C 312 195, 322 143, 360 143" fill="none" stroke="var(--primary)" stroke-width="2.5" marker-end="url(#ar03)"/>' +
      '<text x="318" y="230" text-anchor="middle" fill="var(--primary)" font-size="12" font-weight="700">FK · N:1</text>' +
      /* JOIN pill */
      '<rect x="60" y="300" width="480" height="66" rx="14" fill="rgba(6,182,212,0.08)" stroke="var(--primary)" stroke-width="1.4" stroke-dasharray="5,3"/>' +
      '<text x="300" y="326" text-anchor="middle" fill="var(--primary)" font-size="12" font-weight="700">JOIN — ghép 2 bảng qua khóa ngoại</text>' +
      '<text x="300" y="350" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="13">game JOIN publisher ON game.pub_id = publisher.id</text></svg>',

    db_04: '<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="player 1:N player_game_library, N:1 game — nối bằng 2 khóa ngoại">' +
      '<text x="300" y="34" text-anchor="middle" fill="var(--text-400)" font-size="16">Bảng nối = hai quan hệ 1:N bằng Khóa ngoại</text>' +
      /* player table */
      '<rect x="24" y="120" width="150" height="110" rx="10" fill="rgba(245,158,11,0.06)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="24" y="120" width="150" height="32" rx="10" fill="var(--module-accent)"/>' +
      '<text x="99" y="142" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-size="16" font-weight="700">player</text>' +
      '<text x="40" y="182" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14">p_id</text>' +
      '<rect x="118" y="169" width="42" height="18" rx="9" fill="rgba(245,158,11,0.2)" stroke="var(--module-accent)" stroke-width="1"/>' +
      '<text x="139" y="182" text-anchor="middle" fill="var(--module-accent)" font-size="10" font-weight="700">PK</text>' +
      '<text x="40" y="210" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="14">username</text>' +
      /* junction table player_game_library */
      '<rect x="210" y="104" width="180" height="150" rx="10" fill="rgba(245,158,11,0.06)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="210" y="104" width="180" height="32" rx="10" fill="var(--module-accent)"/>' +
      '<text x="300" y="125" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">player_game_library</text>' +
      '<rect x="216" y="150" width="168" height="28" rx="6" fill="rgba(6,182,212,0.12)"/>' +
      '<text x="230" y="169" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="13">ref_p_id</text>' +
      '<rect x="330" y="155" width="42" height="18" rx="9" fill="rgba(6,182,212,0.2)" stroke="var(--primary)" stroke-width="1"/>' +
      '<text x="351" y="168" text-anchor="middle" fill="var(--primary)" font-size="10" font-weight="700">FK</text>' +
      '<rect x="216" y="184" width="168" height="28" rx="6" fill="rgba(6,182,212,0.12)"/>' +
      '<text x="230" y="203" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="13">ref_game_id</text>' +
      '<rect x="330" y="189" width="42" height="18" rx="9" fill="rgba(6,182,212,0.2)" stroke="var(--primary)" stroke-width="1"/>' +
      '<text x="351" y="202" text-anchor="middle" fill="var(--primary)" font-size="10" font-weight="700">FK</text>' +
      '<text x="300" y="234" text-anchor="middle" fill="var(--text-500)" font-size="12">(bảng nối)</text>' +
      /* game table */
      '<rect x="426" y="120" width="150" height="110" rx="10" fill="rgba(245,158,11,0.06)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="426" y="120" width="150" height="32" rx="10" fill="var(--module-accent)"/>' +
      '<text x="501" y="142" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-size="16" font-weight="700">game</text>' +
      '<text x="442" y="182" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14">game_id</text>' +
      '<rect x="527" y="169" width="42" height="18" rx="9" fill="rgba(245,158,11,0.2)" stroke="var(--module-accent)" stroke-width="1"/>' +
      '<text x="548" y="182" text-anchor="middle" fill="var(--module-accent)" font-size="10" font-weight="700">PK</text>' +
      '<text x="442" y="210" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="14">title</text>' +
      /* connectors + cardinality */
      '<line x1="174" y1="175" x2="210" y2="164" stroke="var(--primary)" stroke-width="2.5"/>' +
      '<text x="192" y="150" text-anchor="middle" fill="var(--module-accent)" font-size="12" font-weight="700">1:N</text>' +
      '<line x1="390" y1="198" x2="426" y2="175" stroke="var(--primary)" stroke-width="2.5"/>' +
      '<text x="410" y="223" text-anchor="middle" fill="var(--module-accent)" font-size="12" font-weight="700">N:1</text>' +
      '<text x="300" y="300" text-anchor="middle" fill="var(--text-500)" font-size="13">Mỗi player có N dòng · mỗi dòng trỏ 1 game — nối bằng 2 Khóa ngoại</text></svg>',

    db_05: '<svg viewBox="0 0 560 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Thực thể yếu dlc_content mượn khóa của game qua quan hệ định danh">' +
      /* parent = strong entity: game */
      '<rect x="40" y="72" width="160" height="106" rx="10" fill="rgba(245,158,11,0.08)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="40" y="72" width="160" height="32" rx="10" fill="var(--module-accent)"/>' +
      '<text x="120" y="93" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-size="17" font-weight="700">game</text>' +
      '<text x="120" y="120" text-anchor="middle" fill="var(--text-500)" font-size="11">thực thể mạnh</text>' +
      '<line x1="54" y1="130" x2="186" y2="130" stroke="rgba(148,163,184,0.25)" stroke-width="1"/>' +
      '<text x="120" y="152" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14">game_id</text>' +
      '<rect x="96" y="160" width="48" height="18" rx="9" fill="rgba(245,158,11,0.2)" stroke="var(--module-accent)" stroke-width="1"/>' +
      '<text x="120" y="173" text-anchor="middle" fill="var(--module-accent)" font-size="11" font-weight="700">PK</text>' +
      /* weak entity = DOUBLE border: dlc_content */
      '<rect x="360" y="58" width="170" height="140" rx="11" fill="rgba(245,158,11,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="366" y="64" width="158" height="128" rx="8" fill="none" stroke="var(--module-accent)" stroke-width="1.4"/>' +
      '<rect x="366" y="64" width="158" height="30" rx="8" fill="rgba(245,158,11,0.22)"/>' +
      '<text x="445" y="85" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="16" font-weight="700">dlc_content</text>' +
      '<text x="445" y="112" text-anchor="middle" fill="var(--text-500)" font-size="11">thực thể yếu (weak)</text>' +
      '<text x="445" y="138" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14">dlc_no</text>' +
      '<line x1="418" y1="144" x2="472" y2="144" stroke="var(--module-accent)" stroke-width="1.4" stroke-dasharray="4,3"/>' +
      '<text x="445" y="160" text-anchor="middle" fill="var(--module-accent)" font-size="10">khóa một phần</text>' +
      '<text x="445" y="184" text-anchor="middle" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="13">dlc_name</text>' +
      /* identifying relationship = DOUBLE diamond, center (280,125) */
      '<line x1="200" y1="125" x2="246" y2="125" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<line x1="314" y1="125" x2="360" y2="125" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<polygon points="280,95 314,125 280,155 246,125" fill="rgba(245,158,11,0.1)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<polygon points="280,103 306,125 280,147 254,125" fill="none" stroke="var(--module-accent)" stroke-width="1"/>' +
      '<text x="222" y="117" text-anchor="middle" fill="var(--text-400)" font-size="11" font-weight="700">1</text>' +
      '<text x="338" y="117" text-anchor="middle" fill="var(--text-400)" font-size="11" font-weight="700">N</text>' +
      '<text x="280" y="177" text-anchor="middle" fill="var(--module-accent)" font-size="11" font-weight="600">định danh</text>' +
      /* composite PK pill */
      '<rect x="110" y="236" width="340" height="40" rx="20" fill="rgba(245,158,11,0.12)" stroke="var(--module-accent)" stroke-width="1.4" stroke-dasharray="5,3"/>' +
      '<text x="280" y="261" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="13" fill="var(--text-100)">Khóa chính = ( <tspan fill="var(--module-accent)" font-weight="700">ref_game_id</tspan> + <tspan fill="var(--module-accent)" font-weight="700">dlc_no</tspan> )</text>' +
      '<text x="280" y="304" text-anchor="middle" fill="var(--text-500)" font-size="12">Viền đôi = thực thể yếu · gạch đứt = khóa một phần · mượn game_id của cha</text></svg>',

    db_06: '<svg viewBox="0 0 500 350" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Specialization: Vehicle thành Car và Truck qua ISA">' +
      '<rect x="162" y="35" width="175" height="75" rx="8" fill="rgba(245,158,11,0.1)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="162" y="35" width="175" height="28" rx="8" fill="var(--module-accent)"/>' +
      '<text x="250" y="54" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-size="18" font-weight="700">Vehicle (parent)</text>' +
      '<text x="250" y="91" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14">vin, model</text>' +
      '<path d="M 170,90 A 35 35 0 0 0 230,90" fill="none" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<text x="250" y="123" text-anchor="middle" fill="var(--module-accent)" font-size="14" font-weight="700">ISA</text>' +
      '<line x1="250" y1="146" x2="150" y2="211" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<line x1="250" y1="146" x2="350" y2="211" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="62" y="211" width="175" height="100" rx="8" fill="rgba(245,158,11,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<text x="150" y="246" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="19" font-weight="700">Car</text>' +
      '<text x="150" y="271" text-anchor="middle" fill="var(--text-400)" font-size="14">num_doors</text>' +
      '<text x="150" y="290" text-anchor="middle" fill="var(--text-400)" font-size="14">fuel_type</text>' +
      '<rect x="262" y="211" width="175" height="100" rx="8" fill="rgba(245,158,11,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<text x="350" y="246" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="19" font-weight="700">Truck</text>' +
      '<text x="350" y="271" text-anchor="middle" fill="var(--text-400)" font-size="14">max_load</text>' +
      '<text x="350" y="290" text-anchor="middle" fill="var(--text-400)" font-size="14">num_axles</text></svg>',

    db_07: '<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bảng gộp game_studio_combined: st_country lặp lại (dư thừa) vì phụ thuộc hàm studio_name suy ra st_country">' +
      '<text x="300" y="28" text-anchor="middle" fill="var(--text-400)" font-size="14">Bảng gộp <tspan font-family="JetBrains Mono, monospace">game_studio_combined</tspan> (chưa chuẩn hoá)</text>' +
      '<rect x="55" y="46" width="490" height="152" rx="8" fill="rgba(245,158,11,0.04)" stroke="var(--module-accent)" stroke-width="1.5"/>' +
      '<rect x="55" y="46" width="490" height="30" rx="8" fill="rgba(245,158,11,0.14)"/>' +
      '<text x="130" y="66" text-anchor="middle" fill="var(--text-200)" font-family="JetBrains Mono, monospace" font-size="12">game_name</text>' +
      '<text x="305" y="66" text-anchor="middle" fill="var(--text-200)" font-family="JetBrains Mono, monospace" font-size="12">studio_name</text>' +
      '<text x="467" y="66" text-anchor="middle" fill="var(--text-200)" font-family="JetBrains Mono, monospace" font-size="12">st_country</text>' +
      '<rect x="388" y="76" width="157" height="122" fill="rgba(239,68,68,0.12)"/>' +
      '<text x="130" y="97" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="12">Elden Ring</text>' +
      '<text x="305" y="97" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="12">FromSoftware</text>' +
      '<text x="467" y="97" text-anchor="middle" fill="#fca5a5" font-family="JetBrains Mono, monospace" font-size="12">Japan</text>' +
      '<text x="130" y="127" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="12">Sekiro</text>' +
      '<text x="305" y="127" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="12">FromSoftware</text>' +
      '<text x="467" y="127" text-anchor="middle" fill="#fca5a5" font-family="JetBrains Mono, monospace" font-size="12">Japan</text>' +
      '<text x="130" y="157" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="12">Bloodborne</text>' +
      '<text x="305" y="157" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="12">FromSoftware</text>' +
      '<text x="467" y="157" text-anchor="middle" fill="#fca5a5" font-family="JetBrains Mono, monospace" font-size="12">Japan</text>' +
      '<text x="130" y="187" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="12">Dark Souls III</text>' +
      '<text x="305" y="187" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="12">FromSoftware</text>' +
      '<text x="467" y="187" text-anchor="middle" fill="#fca5a5" font-family="JetBrains Mono, monospace" font-size="12">Japan</text>' +
      '<text x="467" y="220" text-anchor="middle" fill="#f87171" font-size="12" font-weight="700">↑ "Japan" lặp 4 lần = DƯ THỪA</text>' +
      '<rect x="105" y="250" width="390" height="66" rx="8" fill="rgba(245,158,11,0.06)" stroke="var(--module-accent)" stroke-width="1.5" stroke-dasharray="4,3"/>' +
      '<text x="300" y="272" text-anchor="middle" fill="var(--text-300)" font-size="12">Phụ thuộc hàm (Functional Dependency)</text>' +
      '<text x="200" y="299" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14" font-weight="600">studio_name</text>' +
      '<line x1="272" y1="294" x2="332" y2="294" stroke="var(--module-accent)" stroke-width="2" marker-end="url(#arrow)"/>' +
      '<text x="405" y="299" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14" font-weight="600">st_country</text>' +
      '<text x="300" y="352" text-anchor="middle" fill="var(--text-400)" font-size="13">Biết studio ⇒ suy ra country → country KHÔNG cần lưu lặp, nên tách bảng riêng</text></svg>',

    db_08: '<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="1NF: composite value slice thanh atomic rows">' +
      '<text x="160" y="80" text-anchor="middle" fill="var(--text-400)" font-size="28" font-weight="600">Trước 1NF (vi phạm)</text>' +
      '<rect x="60" y="120" width="200" height="200" rx="6" fill="rgba(139,92,246,0.05)" stroke="var(--module-accent)" stroke-width="3"/>' +
      '<rect x="60" y="120" width="200" height="120" rx="6" fill="rgba(139,92,246,0.25)"/>' +
      '<text x="160" y="200" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="56" font-weight="700">[...]</text>' +
      '<text x="160" y="260" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="22">{Java, Py, SQL}</text>' +
      '<text x="160" y="295" text-anchor="middle" fill="var(--text-400)" font-size="18">1 cell = 3 giá trị</text>' +
      '<line x1="270" y1="220" x2="510" y2="220" stroke="var(--module-accent)" stroke-width="4" marker-end="url(#arrow-m2)"/>' +
      '<text x="390" y="195" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="40" font-weight="700">1NF</text>' +
      '<text x="390" y="260" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="18">atomic</text>' +
      '<text x="640" y="80" text-anchor="middle" fill="var(--text-400)" font-size="28" font-weight="600">Sau 1NF (chuẩn)</text>' +
      '<rect x="540" y="120" width="200" height="55" rx="4" fill="rgba(139,92,246,0.08)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="540" y="185" width="200" height="55" rx="4" fill="rgba(139,92,246,0.08)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="540" y="250" width="200" height="55" rx="4" fill="rgba(139,92,246,0.08)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<text x="640" y="155" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="24">Java</text>' +
      '<text x="640" y="220" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="24">Py</text>' +
      '<text x="640" y="285" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="24">SQL</text>' +
      '<text x="400" y="395" text-anchor="middle" fill="var(--text-400)" font-size="22">Mỗi cell = 1 atomic value</text>' +
      '<text x="400" y="430" text-anchor="middle" fill="var(--text-400)" font-size="20">Không list, set, hay composite</text>' +
      '</svg>',

    db_09: '<svg viewBox="0 0 600 410" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="2NF: member_name chỉ phụ thuộc member_id (1 phần khoá) trong book_loan_raw, tách thành loans + members">' +
      /* bảng vi phạm: sổ mượn thư viện */
      '<rect x="30" y="30" width="540" height="76" rx="8" fill="rgba(139,92,246,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="30" y="30" width="540" height="24" rx="8" fill="rgba(139,92,246,0.2)"/>' +
      '<text x="300" y="47" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700">book_loan_raw — PK: (book_id + copy_no)</text>' +
      '<text x="52" y="83" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14">book_id | copy_no | member_id |</text>' +
      '<rect x="332" y="66" width="128" height="24" rx="5" fill="rgba(239,68,68,0.15)" stroke="var(--danger)" stroke-width="1.4"/>' +
      '<text x="344" y="83" fill="var(--danger)" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700">member_name</text>' +
      /* mũi tên FD: member_id → member_name (chỉ 1 phần khoá) */
      '<path d="M 296 96 C 296 122, 380 122, 388 98" fill="none" stroke="var(--danger)" stroke-width="2" stroke-dasharray="5,3"/>' +
      '<text x="300" y="140" text-anchor="middle" fill="var(--danger)" font-size="13" font-weight="600">member_name chỉ phụ thuộc member_id — KHÔNG phụ thuộc trọn khoá ✗ 2NF</text>' +
      /* mũi tên tách */
      '<line x1="300" y1="152" x2="300" y2="182" stroke="var(--module-accent)" stroke-width="2.5"/>' +
      '<polygon points="300,192 293,180 307,180" fill="var(--module-accent)"/>' +
      '<text x="352" y="174" fill="var(--module-accent)" font-size="13" font-weight="700">tách 2NF</text>' +
      /* 2 bảng sạch */
      '<rect x="30" y="204" width="300" height="82" rx="8" fill="rgba(139,92,246,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="30" y="204" width="300" height="24" rx="8" fill="rgba(139,92,246,0.2)"/>' +
      '<text x="180" y="221" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700">loans</text>' +
      '<text x="48" y="256" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="13">book_id | copy_no | loan_date</text>' +
      '<text x="48" y="276" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="13">member_id (FK)</text>' +
      '<rect x="360" y="204" width="210" height="82" rx="8" fill="rgba(139,92,246,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="360" y="204" width="210" height="24" rx="8" fill="rgba(139,92,246,0.2)"/>' +
      '<text x="465" y="221" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700">members</text>' +
      '<text x="378" y="256" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="13">member_id (PK)</text>' +
      '<text x="378" y="276" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="13">member_name</text>' +
      /* FK nối */
      '<line x1="330" y1="266" x2="360" y2="248" stroke="var(--module-accent)" stroke-width="1.6" stroke-dasharray="4,3"/>' +
      '<text x="300" y="330" text-anchor="middle" fill="var(--text-400)" font-size="14">Tên thành viên chỉ còn 1 chỗ — đổi tên 1 lần, mọi lượt mượn tự đúng</text></svg>',

    db_10: '<svg viewBox="0 0 600 410" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="BCNF: doctor_specialty lặp theo doctor_id trong hồ sơ trị liệu, phân rã phi tổn thất thành doctors + treatments">' +
      /* hồ sơ trị liệu vi phạm */
      '<rect x="30" y="30" width="540" height="76" rx="8" fill="rgba(139,92,246,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="30" y="30" width="540" height="24" rx="8" fill="rgba(139,92,246,0.2)"/>' +
      '<text x="300" y="47" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700">treatments_raw — hồ sơ trị liệu phòng khám esports</text>' +
      '<text x="52" y="83" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14">t_id | patient | doctor_id |</text>' +
      '<rect x="318" y="66" width="180" height="24" rx="5" fill="rgba(239,68,68,0.15)" stroke="var(--danger)" stroke-width="1.4"/>' +
      '<text x="330" y="83" fill="var(--danger)" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700">doctor_specialty</text>' +
      /* FD vi phạm */
      '<path d="M 282 96 C 282 122, 390 122, 400 98" fill="none" stroke="var(--danger)" stroke-width="2" stroke-dasharray="5,3"/>' +
      '<text x="300" y="140" text-anchor="middle" fill="var(--danger)" font-size="13" font-weight="600">FD: doctor_id → doctor_specialty — vế trái KHÔNG phải superkey ✗ BCNF</text>' +
      /* mũi tên phân rã */
      '<line x1="300" y1="152" x2="300" y2="182" stroke="var(--module-accent)" stroke-width="2.5"/>' +
      '<polygon points="300,192 293,180 307,180" fill="var(--module-accent)"/>' +
      '<text x="378" y="174" fill="var(--module-accent)" font-size="13" font-weight="700">phân rã PHI TỔN THẤT</text>' +
      /* 2 bảng sạch */
      '<rect x="30" y="204" width="255" height="82" rx="8" fill="rgba(139,92,246,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="30" y="204" width="255" height="24" rx="8" fill="rgba(139,92,246,0.2)"/>' +
      '<text x="157" y="221" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700">doctors</text>' +
      '<text x="48" y="256" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="13">doctor_id (PK) | name</text>' +
      '<text x="48" y="276" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="13">doctor_specialty</text>' +
      '<rect x="315" y="204" width="255" height="82" rx="8" fill="rgba(139,92,246,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="315" y="204" width="255" height="24" rx="8" fill="rgba(139,92,246,0.2)"/>' +
      '<text x="442" y="221" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700">treatments</text>' +
      '<text x="333" y="256" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="13">t_id (PK) | patient_id</text>' +
      '<text x="333" y="276" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="13">doctor_id (FK)</text>' +
      '<line x1="285" y1="266" x2="315" y2="266" stroke="var(--module-accent)" stroke-width="1.6" stroke-dasharray="4,3"/>' +
      '<text x="300" y="330" text-anchor="middle" fill="var(--text-400)" font-size="14">JOIN 2 bảng tái tạo đủ 100% dữ liệu gốc — phi tổn thất, hết lặp chuyên khoa</text></svg>',

    db_11: '<svg viewBox="0 0 600 410" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="3NF: chuỗi bắc cầu product_id → category → cat_description trong products_raw của chuỗi cyber-café GamerBrew, tách products + categories">' +
      /* chuỗi bắc cầu bằng cột thật */
      '<rect x="40" y="36" width="150" height="42" rx="8" fill="rgba(139,92,246,0.1)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<text x="115" y="63" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700">product_id</text>' +
      '<line x1="190" y1="57" x2="238" y2="57" stroke="var(--module-accent)" stroke-width="2.5"/>' +
      '<polygon points="248,57 236,50 236,64" fill="var(--module-accent)"/>' +
      '<rect x="252" y="36" width="130" height="42" rx="8" fill="rgba(139,92,246,0.1)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<text x="317" y="63" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700">category</text>' +
      '<line x1="382" y1="57" x2="430" y2="57" stroke="var(--danger)" stroke-width="2.5" stroke-dasharray="6,3"/>' +
      '<polygon points="440,57 428,50 428,64" fill="var(--danger)"/>' +
      '<rect x="444" y="36" width="130" height="42" rx="8" fill="rgba(239,68,68,0.12)" stroke="var(--danger)" stroke-width="2"/>' +
      '<text x="509" y="57" text-anchor="middle" fill="var(--danger)" font-family="JetBrains Mono, monospace" font-size="12.5" font-weight="700">cat_manager,</text>' +
      '<text x="509" y="71" text-anchor="middle" fill="var(--danger)" font-family="JetBrains Mono, monospace" font-size="12.5" font-weight="700">mô tả ngành…</text>' +
      '<text x="300" y="110" text-anchor="middle" fill="var(--danger)" font-size="13" font-weight="600">Bắc cầu: key → category → thông tin ngành (category KHÔNG phải key) ✗ 3NF</text>' +
      '<text x="300" y="130" text-anchor="middle" fill="var(--text-400)" font-size="12.5">Sửa mô tả 1 ngành = sửa ở MỌI sản phẩm thuộc ngành đó</text>' +
      /* mũi tên tách */
      '<line x1="300" y1="142" x2="300" y2="172" stroke="var(--module-accent)" stroke-width="2.5"/>' +
      '<polygon points="300,182 293,170 307,170" fill="var(--module-accent)"/>' +
      '<text x="352" y="164" fill="var(--module-accent)" font-size="13" font-weight="700">tách 3NF</text>' +
      /* 2 bảng sạch */
      '<rect x="30" y="194" width="300" height="82" rx="8" fill="rgba(139,92,246,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="30" y="194" width="300" height="24" rx="8" fill="rgba(139,92,246,0.2)"/>' +
      '<text x="180" y="211" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700">products</text>' +
      '<text x="48" y="246" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="13">product_id (PK) | name | price</text>' +
      '<text x="48" y="266" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="13">category (FK)</text>' +
      '<rect x="360" y="194" width="210" height="82" rx="8" fill="rgba(139,92,246,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="360" y="194" width="210" height="24" rx="8" fill="rgba(139,92,246,0.2)"/>' +
      '<text x="465" y="211" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700">categories</text>' +
      '<text x="378" y="246" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="13">category (PK)</text>' +
      '<text x="378" y="266" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="13">mô tả, quản lý ngành</text>' +
      '<line x1="330" y1="256" x2="360" y2="238" stroke="var(--module-accent)" stroke-width="1.6" stroke-dasharray="4,3"/>' +
      '<text x="300" y="320" text-anchor="middle" fill="var(--text-400)" font-size="14">Thông tin ngành hàng chỉ còn 1 chỗ — hết phụ thuộc bắc cầu</text></svg>',

    db_12: '<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="4NF: multi-valued dependency tách thành nhiều bảng độc lập">' +
      '<rect x="30" y="53" width="540" height="75" fill="rgba(139,92,246,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="30" y="53" width="540" height="21" fill="rgba(139,92,246,0.2)"/>' +
      '<text x="300" y="69" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700">person (PK + 2 multi-values)</text>' +
      '<text x="45" y="104" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="15">id | skills | hobbies</text>' +
      '<line x1="300" y1="126" x2="120" y2="206" stroke="var(--danger)" stroke-width="2" stroke-dasharray="3,3"/>' +
      '<line x1="300" y1="126" x2="300" y2="206" stroke="var(--danger)" stroke-width="2" stroke-dasharray="3,3"/>' +
      '<line x1="300" y1="126" x2="480" y2="206" stroke="var(--danger)" stroke-width="2" stroke-dasharray="3,3"/>' +
      '<rect x="30" y="206" width="180" height="60" fill="rgba(139,92,246,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<text x="120" y="233" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700">person_skill</text>' +
      '<text x="120" y="253" text-anchor="middle" fill="var(--text-400)" font-size="14">id | skill</text>' +
      '<rect x="225" y="206" width="150" height="60" fill="rgba(139,92,246,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<text x="300" y="233" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700">person_hobby</text>' +
      '<text x="300" y="253" text-anchor="middle" fill="var(--text-400)" font-size="14">id | hobby</text>' +
      '<rect x="390" y="206" width="180" height="60" fill="rgba(139,92,246,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<text x="480" y="233" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700">exploded</text>' +
      '<text x="480" y="253" text-anchor="middle" fill="var(--text-400)" font-size="14">2NF-style</text>' +
      '<text x="300" y="306" text-anchor="middle" fill="var(--text-400)" font-size="15">4NF: tách MVD độc lập thành bảng riêng</text></svg>',

    db_13: '<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Boss Battle: audit diễn đàn GuildBoard — users JOIN posts, lọc premium VN, GROUP BY, top 3">' +
      /* 2 bảng thật của khách: users + posts */
      '<rect x="70" y="70" width="280" height="150" rx="10" fill="rgba(139,92,246,0.1)" stroke="var(--module-accent)" stroke-width="3" class="hero-pulse"/>' +
      '<rect x="70" y="70" width="280" height="36" rx="10" fill="var(--module-accent)"/>' +
      '<text x="210" y="95" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700">users</text>' +
      '<text x="90" y="134" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="16">user_id (PK) | username</text>' +
      '<text x="90" y="162" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="16">country | is_premium</text>' +
      '<text x="90" y="196" fill="var(--text-400)" font-size="14">hàng triệu thành viên</text>' +
      '<rect x="450" y="70" width="280" height="150" rx="10" fill="rgba(139,92,246,0.1)" stroke="var(--module-accent)" stroke-width="3" class="hero-pulse" style="animation-delay: 0.3s"/>' +
      '<rect x="450" y="70" width="280" height="36" rx="10" fill="var(--module-accent)"/>' +
      '<text x="590" y="95" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700">posts</text>' +
      '<text x="470" y="134" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="16">post_id (PK)</text>' +
      '<text x="470" y="162" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="16">user_id (FK) | content</text>' +
      '<text x="470" y="196" fill="var(--text-400)" font-size="14">bài đăng của cộng đồng</text>' +
      /* FK nối */
      '<line x1="350" y1="145" x2="450" y2="145" stroke="var(--module-accent)" stroke-width="3"/>' +
      '<text x="400" y="133" text-anchor="middle" fill="var(--module-accent)" font-size="15" font-weight="700">JOIN 1:N</text>' +
      /* pipeline kỹ năng hội tụ */
      '<rect x="100" y="270" width="600" height="60" rx="14" fill="rgba(139,92,246,0.12)" stroke="var(--module-accent)" stroke-width="2" stroke-dasharray="6,3"/>' +
      '<text x="400" y="296" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="15">JOIN → WHERE premium + VN → GROUP BY → COUNT → ORDER BY → LIMIT 3</text>' +
      '<text x="400" y="318" text-anchor="middle" fill="var(--text-400)" font-size="13">mọi kỹ năng từ Ticket #01 hội tụ trong 1 câu lệnh</text>' +
      '<text x="400" y="398" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="30" font-weight="700">⚔ BOSS: AUDIT DIỄN ĐÀN GUILDBOARD ⚔</text>' +
      '<text x="400" y="430" text-anchor="middle" fill="var(--text-400)" font-size="17">Đóng ticket này — GameHub đủ lực ship v2.0</text>' +
      '</svg>',

    db_14: '<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="JSON path: $.settings.theme navigate nested object">' +
      '<text x="300" y="33" text-anchor="middle" fill="var(--success)" font-family="JetBrains Mono, monospace" font-size="18" font-weight="700">$.settings.theme</text>' +
      '<rect x="30" y="53" width="255" height="60" rx="6" fill="rgba(16,185,129,0.1)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="30" y="53" width="255" height="21" rx="6" fill="rgba(16,185,129,0.2)"/>' +
      '<text x="158" y="69" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700">$ (root)</text>' +
      '<text x="45" y="96" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14">{ ... }</text>' +
      '<line x1="158" y1="106" x2="158" y2="146" stroke="var(--success)" stroke-width="4"/>' +
      '<rect x="30" y="146" width="255" height="60" rx="6" fill="rgba(16,185,129,0.1)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<rect x="30" y="146" width="255" height="21" rx="6" fill="rgba(16,185,129,0.2)"/>' +
      '<text x="158" y="162" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700">.settings</text>' +
      '<text x="45" y="189" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14">{ "theme": "dark" }</text>' +
      '<line class="hero-pulse" x1="285" y1="173" x2="330" y2="239" stroke="var(--success)" stroke-width="4"/>' +
      '<rect x="330" y="226" width="240" height="60" rx="6" fill="rgba(16,185,129,0.2)" stroke="var(--success)" stroke-width="4"/>' +
      '<rect x="330" y="226" width="240" height="21" rx="6" fill="var(--success)"/>' +
      '<text x="450" y="242" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700">.theme (target)</text>' +
      '<text x="345" y="269" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="14">→ "dark"</text>' +
      '<text x="300" y="319" text-anchor="middle" fill="var(--text-400)" font-size="15">JSON path traverse nested structure</text>' +
      '<text x="300" y="343" text-anchor="middle" fill="var(--text-400)" font-size="14">SELECT settings->>\'theme\' FROM app_users</text></svg>',

    db_15: '<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Spatial query: 2 điểm trên map + distance">' +
      '<rect x="30" y="40" width="540" height="330" fill="rgba(16,185,129,0.05)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<text x="60" y="73" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="14">SF</text>' +
      '<line x1="60" y1="80" x2="90" y2="64" stroke="var(--text-600)" stroke-width="1"/>' +
      '<line x1="90" y1="80" x2="120" y2="61" stroke="var(--text-600)" stroke-width="1"/>' +
      '<text x="60" y="319" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="14">LA</text>' +
      '<line x1="60" y1="293" x2="120" y2="259" stroke="var(--text-600)" stroke-width="1"/>' +
      '<line x1="120" y1="293" x2="90" y2="273" stroke="var(--text-600)" stroke-width="1"/>' +
      '<circle cx="150" cy="133" r="15" fill="var(--success)" stroke="var(--module-accent)" stroke-width="4"/>' +
      '<text x="177" y="140" fill="var(--text-100)" font-size="15" font-weight="700">store_1</text>' +
      '<text x="177" y="160" fill="var(--text-400)" font-size="13">(37.7, -122.4)</text>' +
      '<circle cx="450" cy="266" r="15" fill="var(--success)" stroke="var(--module-accent)" stroke-width="4"/>' +
      '<text x="368" y="266" fill="var(--text-100)" font-size="15" font-weight="700">store_2</text>' +
      '<text x="368" y="286" fill="var(--text-400)" font-size="13">(34.0, -118.2)</text>' +
      '<line class="hero-pulse" x1="162" y1="133" x2="440" y2="266" stroke="var(--module-accent)" stroke-width="3" stroke-dasharray="4,4"/>' +
      '<text x="300" y="193" text-anchor="middle" fill="var(--module-accent)" font-size="20" font-weight="700">559 km</text>' +
      '<text x="300" y="370" text-anchor="middle" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="15">ST_Distance(POINT, POINT)</text></svg>',

    db_16: '<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ORM: Python class ↔ SQL table mirror">' +
      '<rect x="30" y="40" width="255" height="240" rx="6" fill="rgba(16,185,129,0.1)" stroke="var(--module-accent)" stroke-width="3"/>' +
      '<rect x="30" y="40" width="255" height="33" rx="6" fill="var(--module-accent)"/>' +
      '<text x="158" y="61" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-size="18" font-weight="700">class User</text>' +
      '<text x="45" y="98" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="15">id: int</text>' +
      '<text x="45" y="126" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="15">name: str</text>' +
      '<text x="45" y="154" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="15">email: str</text>' +
      '<text x="45" y="193" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="14">def save()</text>' +
      '<text x="45" y="215" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="14">@classmethod all()</text>' +
      '<text x="45" y="239" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="14">objects.filter(...)</text>' +
      '<line x1="285" y1="146" x2="315" y2="146" stroke="var(--module-accent)" stroke-width="4"/>' +
      '<line x1="315" y1="146" x2="285" y2="146" stroke="var(--module-accent)" stroke-width="4"/>' +
      '<text x="300" y="133" text-anchor="middle" fill="var(--module-accent)" font-size="18" font-weight="700">ORM</text>' +
      '<rect x="315" y="40" width="255" height="240" rx="6" fill="rgba(16,185,129,0.1)" stroke="var(--module-accent)" stroke-width="3"/>' +
      '<rect x="315" y="40" width="255" height="33" rx="6" fill="var(--module-accent)"/>' +
      '<text x="442" y="61" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-size="18" font-weight="700">TABLE users</text>' +
      '<text x="330" y="98" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="15">id INT PK</text>' +
      '<text x="330" y="126" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="15">name VARCHAR</text>' +
      '<text x="330" y="154" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="15">email VARCHAR</text>' +
      '<text x="330" y="193" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="14">INSERT INTO</text>' +
      '<text x="330" y="215" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="14">SELECT WHERE</text>' +
      '<text x="330" y="239" fill="var(--text-400)" font-family="JetBrains Mono, monospace" font-size="14">UPDATE SET</text>' +
      '<text x="300" y="306" text-anchor="middle" fill="var(--text-400)" font-size="15">Object ↔ Row mapping tự động (Django ORM)</text></svg>',

    db_17: '<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SQL Injection bypass auth, fix bằng prepared statement">' +
      '<rect x="20" y="80" width="240" height="180" rx="8" fill="rgba(239,68,68,0.05)" stroke="var(--danger)" stroke-width="3"/>' +
      '<rect x="20" y="80" width="240" height="36" rx="8" fill="var(--danger)"/>' +
      '<text x="140" y="106" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700">USER INPUT</text>' +
      '<text x="140" y="160" text-anchor="middle" fill="var(--danger)" font-family="JetBrains Mono, monospace" font-size="32" font-weight="700">"admin\'--"</text>' +
      '<text x="140" y="200" text-anchor="middle" fill="var(--danger)" font-family="JetBrains Mono, monospace" font-size="22">or "1"="1"</text>' +
      '<text x="140" y="235" text-anchor="middle" fill="var(--text-400)" font-size="18">(hacker payload)</text>' +
      '<line class="hero-pulse" x1="270" y1="170" x2="310" y2="170" stroke="var(--danger)" stroke-width="4" marker-end="url(#arrow-danger)"/>' +
      '<text x="290" y="155" text-anchor="middle" fill="var(--danger)" font-size="20" font-weight="700">⚠</text>' +
      '<rect x="320" y="80" width="240" height="180" rx="8" fill="rgba(239,68,68,0.08)" stroke="var(--danger)" stroke-width="3"/>' +
      '<rect x="320" y="80" width="240" height="36" rx="8" fill="var(--danger)"/>' +
      '<text x="440" y="106" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700">VULNERABLE SQL</text>' +
      '<text x="440" y="155" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="20">SELECT * FROM users</text>' +
      '<text x="440" y="183" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="18">WHERE name=\'...\' + input</text>' +
      '<text x="440" y="211" text-anchor="middle" fill="var(--danger)" font-family="JetBrains Mono, monospace" font-size="18">-- bypass auth</text>' +
      '<text x="440" y="240" text-anchor="middle" fill="var(--text-400)" font-size="18">(string concat)</text>' +
      '<line class="hero-pulse" x1="570" y1="170" x2="610" y2="170" stroke="var(--danger)" stroke-width="4" marker-end="url(#arrow-danger)"/>' +
      '<rect x="620" y="80" width="160" height="180" rx="8" fill="rgba(239,68,68,0.15)" stroke="var(--danger)" stroke-width="3"/>' +
      '<rect x="620" y="80" width="160" height="36" rx="8" fill="var(--danger)"/>' +
      '<text x="700" y="106" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700">⚠ BREACH</text>' +
      '<text x="700" y="170" text-anchor="middle" fill="var(--danger)" font-family="JetBrains Mono, monospace" font-size="28" font-weight="700">all users</text>' +
      '<text x="700" y="200" text-anchor="middle" fill="var(--danger)" font-family="JetBrains Mono, monospace" font-size="24">exposed</text>' +
      '<rect x="20" y="310" width="760" height="120" rx="8" fill="rgba(16,185,129,0.1)" stroke="var(--success)" stroke-width="3"/>' +
      '<rect x="20" y="310" width="760" height="36" rx="8" fill="var(--success)"/>' +
      '<text x="400" y="336" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700">✓ FIX: Prepared Statement (param binding)</text>' +
      '<text x="400" y="380" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="22">SELECT * FROM users WHERE name=? AND pass=?</text>' +
      '<text x="400" y="415" text-anchor="middle" fill="var(--text-400)" font-size="20">Input KHÔNG BAO GIỜ được thành SQL code</text>' +
      '</svg>',

    db_18: '<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Password Hashing: password + salt → bcrypt iterations → hash">' +
      '<rect x="30" y="66" width="120" height="66" rx="6" fill="rgba(16,185,129,0.1)" stroke="var(--module-accent)" stroke-width="2"/>' +
      '<text x="90" y="93" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700">password</text>' +
      '<text x="90" y="114" text-anchor="middle" fill="var(--text-400)" font-size="13">"secret123"</text>' +
      '<line x1="150" y1="96" x2="202" y2="96" stroke="var(--module-accent)" stroke-width="3"/>' +
      '<text x="176" y="89" text-anchor="middle" fill="var(--module-accent)" font-size="20" font-weight="700">+</text>' +
      '<rect x="202" y="66" width="98" height="66" rx="6" fill="rgba(245,158,11,0.1)" stroke="#F59E0B" stroke-width="2"/>' +
      '<text x="250" y="93" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700">salt</text>' +
      '<text x="250" y="114" text-anchor="middle" fill="var(--text-400)" font-size="13">"x7Qp2"</text>' +
      '<line x1="300" y1="96" x2="352" y2="96" stroke="var(--module-accent)" stroke-width="3"/>' +
      '<rect x="352" y="47" width="120" height="111" rx="9" fill="rgba(16,185,129,0.15)" stroke="var(--module-accent)" stroke-width="3" class="hero-pulse"/>' +
      '<text x="412" y="77" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="17" font-weight="700">bcrypt</text>' +
      '<text x="412" y="101" text-anchor="middle" fill="var(--text-400)" font-size="14">12 rounds</text>' +
      '<text x="412" y="122" text-anchor="middle" fill="var(--text-400)" font-size="13">cost=2^12</text>' +
      '<text x="412" y="140" text-anchor="middle" fill="var(--text-400)" font-size="13">slow by design</text>' +
      '<line x1="472" y1="96" x2="518" y2="96" stroke="var(--module-accent)" stroke-width="3"/>' +
      '<rect x="518" y="66" width="60" height="66" rx="6" fill="rgba(16,185,129,0.25)" stroke="var(--success)" stroke-width="4"/>' +
      '<text x="548" y="93" text-anchor="middle" fill="var(--success)" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700">$2b</text>' +
      '<text x="548" y="114" text-anchor="middle" fill="var(--text-400)" font-size="13">hash</text>' +
      '<text x="300" y="197" text-anchor="middle" fill="var(--text-400)" font-size="15">Plain password KHÔNG lưu → chỉ lưu hash</text>' +
      '<line x1="90" y1="133" x2="90" y2="246" stroke="var(--text-600)" stroke-width="2" stroke-dasharray="2,2"/>' +
      '<text x="90" y="273" text-anchor="middle" fill="var(--danger)" font-family="JetBrains Mono, monospace" font-size="15">× NO STORE</text>' +
      '<line x1="548" y1="133" x2="548" y2="246" stroke="var(--text-600)" stroke-width="2" stroke-dasharray="2,2"/>' +
      '<text x="548" y="273" text-anchor="middle" fill="var(--success)" font-family="JetBrains Mono, monospace" font-size="15">✓ STORE</text>' +
      '<text x="300" y="326" text-anchor="middle" fill="var(--text-400)" font-size="15">Salt chống rainbow table. Cost chống brute-force.</text></svg>',

    /* db_19 — Bài 5 MỚI: M:N qua bảng trung gian (library = player↔game).
     * Copy từ db_04 (M:N junction) + relabel Student→player, Course→game, Enrollment→library.
     * Giữ nguyên craft: amber, JetBrains Mono, viewBox 600x400. */
    db_19: '<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="M:N giữa player và game qua bảng trung gian library">' +
      '<rect x="30" y="93" width="165" height="105" rx="9" fill="rgba(245,158,11,0.1)" stroke="var(--module-accent)" stroke-width="3"/>' +
      '<text x="112" y="130" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="21" font-weight="700">player</text>' +
      '<text x="112" y="157" text-anchor="middle" fill="var(--module-accent)" font-size="28" font-weight="700">M</text>' +
      '<rect x="405" y="93" width="165" height="105" rx="9" fill="rgba(245,158,11,0.1)" stroke="var(--module-accent)" stroke-width="3"/>' +
      '<text x="488" y="130" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="21" font-weight="700">game</text>' +
      '<text x="488" y="157" text-anchor="middle" fill="var(--module-accent)" font-size="28" font-weight="700">N</text>' +
      '<rect x="218" y="133" width="165" height="150" rx="9" fill="rgba(245,158,11,0.18)" stroke="var(--module-accent)" stroke-width="4"/>' +
      '<text x="300" y="180" text-anchor="middle" fill="var(--text-100)" font-family="JetBrains Mono, monospace" font-size="20" font-weight="700">library</text>' +
      '<text x="300" y="213" text-anchor="middle" fill="var(--text-400)" font-size="14">(junction)</text>' +
      '<text x="300" y="239" text-anchor="middle" fill="var(--module-accent)" font-family="JetBrains Mono, monospace" font-size="14">player_id + game_id</text>' +
      '<line x1="195" y1="140" x2="218" y2="180" stroke="var(--module-accent)" stroke-width="3"/>' +
      '<line x1="382" y1="180" x2="405" y2="140" stroke="var(--module-accent)" stroke-width="3"/>' +
      '<text x="300" y="319" text-anchor="middle" fill="var(--text-400)" font-size="17">Junction table giải quyết M:N</text></svg>',

    /* db_20 — Bài 18 MỚI: Web Services REST/AJAX.
     * Flow 4-node per HERO_DESIGN_SYSTEM §11: Client → API Server → DB → JSON response.
     * Palette CYAN #22D3EE (nhóm Application, khác amber ER). */
    db_20: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Web Services flow: Client gửi HTTP request → API Server chạy SQL → Database trả JSON → Client hiển thị">' +
      '<text x="360" y="32" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">REST API Flow — App ↔ DB qua HTTP</text>' +
      '<g transform="translate(30, 100)">' +
        '<rect width="130" height="60" rx="10" fill="#0e1726" stroke="rgba(34,211,238,.55)" stroke-width="1.6"/>' +
        '<text x="65" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="14" fill="#e8edf5">Client</text>' +
        '<text x="65" y="46" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="#7f93ad">Browser / App</text>' +
      '</g>' +
      '<line x1="160" y1="118" x2="218" y2="118" stroke="rgba(34,211,238,.7)" stroke-width="1.6"/>' +
      '<polygon points="218,118 210,114 210,122" fill="rgba(34,211,238,.9)"/>' +
      '<text x="190" y="111" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#aebfd6">HTTP GET</text>' +
      '<g transform="translate(220, 100)">' +
        '<rect width="150" height="60" rx="10" fill="#0e1726" stroke="rgba(34,211,238,.55)" stroke-width="1.6"/>' +
        '<text x="75" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="14" fill="#e8edf5">API Server</text>' +
        '<text x="75" y="46" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="#7f93ad">REST endpoint</text>' +
      '</g>' +
      '<line x1="370" y1="118" x2="428" y2="118" stroke="rgba(34,211,238,.7)" stroke-width="1.6"/>' +
      '<polygon points="428,118 420,114 420,122" fill="rgba(34,211,238,.9)"/>' +
      '<text x="400" y="111" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#aebfd6">SQL ?</text>' +
      '<g transform="translate(430, 100)">' +
        '<rect width="130" height="60" rx="10" fill="#0e1726" stroke="rgba(34,211,238,.55)" stroke-width="1.6"/>' +
        '<text x="65" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="14" fill="#e8edf5">Database</text>' +
        '<text x="65" y="46" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="#7f93ad">game_catalog</text>' +
      '</g>' +
      '<line x1="428" y1="148" x2="370" y2="148" stroke="rgba(34,211,238,.7)" stroke-width="1.6" stroke-dasharray="4,2"/>' +
      '<polygon points="370,148 378,144 378,152" fill="rgba(34,211,238,.9)"/>' +
      '<text x="400" y="167" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#aebfd6">JSON rows</text>' +
      '<line x1="218" y1="148" x2="160" y2="148" stroke="rgba(34,211,238,.7)" stroke-width="1.6" stroke-dasharray="4,2"/>' +
      '<polygon points="160,148 168,144 168,152" fill="rgba(34,211,238,.9)"/>' +
      '<text x="190" y="167" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#aebfd6">JSON</text>' +
      '<text x="360" y="210" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">Stateless: mỗi request độc lập — param truyền qua ? (parameterized)</text>' +
      '</svg>',

    /* ── TC (GameHub Community) — Module 4 Advanced SQL, accent sky #38BDF8 ── */
    /* tc_01: vòng đời JDBC — code backend → PreparedStatement(?) → DB posts → ResultSet đọc TỪNG dòng */
    tc_01: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Backend gọi SQL qua JDBC: PreparedStatement với placeholder ?, database posts trả ResultSet, cursor rs.next() đọc từng dòng">' +
      '<text x="360" y="30" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">JDBC — code nói chuyện với database</text>' +
      '<g transform="translate(28, 62)">' +
        '<rect width="240" height="118" rx="10" fill="#0e1726" stroke="rgba(56,189,248,.55)" stroke-width="1.6"/>' +
        '<text x="14" y="24" font-family="JetBrains Mono, monospace" font-size="11" fill="#7f93ad">// Backend Java</text>' +
        '<text x="14" y="48" font-family="JetBrains Mono, monospace" font-size="11.5" fill="#e8edf5">prepareStatement(</text>' +
        '<text x="24" y="66" font-family="JetBrains Mono, monospace" font-size="11.5" fill="#aebfd6">"…WHERE user_id = <tspan fill="#FCD34D" font-weight="700">?</tspan>")</text>' +
        '<text x="14" y="90" font-family="JetBrains Mono, monospace" font-size="11.5" fill="#e8edf5">setInt(1, <tspan fill="#FCD34D">7</tspan>)</text>' +
        '<text x="14" y="108" font-family="JetBrains Mono, monospace" font-size="11.5" fill="#e8edf5">executeQuery()</text>' +
      '</g>' +
      '<line x1="268" y1="100" x2="330" y2="100" stroke="rgba(56,189,248,.7)" stroke-width="1.6"/>' +
      '<polygon points="330,100 322,96 322,104" fill="rgba(56,189,248,.9)"/>' +
      '<text x="299" y="92" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#aebfd6">SQL + tham số</text>' +
      '<text x="299" y="115" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#7f93ad">2 kênh riêng</text>' +
      '<g transform="translate(332, 70)">' +
        '<ellipse cx="60" cy="12" rx="60" ry="12" fill="#0e1726" stroke="rgba(56,189,248,.55)" stroke-width="1.6"/>' +
        '<path d="M0,12 v40 a60,12 0 0 0 120,0 v-40" fill="#0e1726" stroke="rgba(56,189,248,.55)" stroke-width="1.6"/>' +
        '<text x="60" y="42" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="13" fill="#e8edf5">posts</text>' +
      '</g>' +
      '<line x1="452" y1="100" x2="514" y2="100" stroke="rgba(56,189,248,.7)" stroke-width="1.6" stroke-dasharray="4,2"/>' +
      '<polygon points="514,100 506,96 506,104" fill="rgba(56,189,248,.9)"/>' +
      '<text x="483" y="92" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#aebfd6">ResultSet</text>' +
      '<g transform="translate(516, 60)">' +
        '<rect width="180" height="126" rx="10" fill="#0e1726" stroke="rgba(56,189,248,.55)" stroke-width="1.6"/>' +
        '<text x="90" y="22" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="#7f93ad">cursor — while(rs.next())</text>' +
        '<rect x="12" y="32" width="156" height="24" rx="5" fill="rgba(56,189,248,0.16)" stroke="#38BDF8" stroke-width="1.2"/>' +
        '<text x="22" y="48" font-family="JetBrains Mono, monospace" font-size="11" fill="#e8edf5">post 501 ◀ đang đọc</text>' +
        '<rect x="12" y="62" width="156" height="24" rx="5" fill="rgba(255,255,255,0.03)"/>' +
        '<text x="22" y="78" font-family="JetBrains Mono, monospace" font-size="11" fill="#7f93ad">post 503</text>' +
        '<rect x="12" y="92" width="156" height="24" rx="5" fill="rgba(255,255,255,0.03)"/>' +
        '<text x="22" y="108" font-family="JetBrains Mono, monospace" font-size="11" fill="#7f93ad">post 507</text>' +
      '</g>' +
      '<text x="360" y="216" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">Đọc TỪNG dòng — kết quả lớn hơn RAM vẫn xử lý được</text>' +
      '</svg>',

    /* tc_02: stored procedure delete_user — 1 CALL = trọn gói 3 DELETE đúng thứ tự FK (con → cha) */
    tc_02: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CALL delete_user(7) chạy trọn gói 3 lệnh DELETE theo thứ tự khóa ngoại: comments trước, posts sau, users cuối cùng">' +
      '<text x="360" y="30" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">Stored Procedure — database tự làm trọn gói</text>' +
      '<g transform="translate(28, 92)">' +
        '<rect width="170" height="56" rx="10" fill="#0e1726" stroke="rgba(56,189,248,.55)" stroke-width="1.6"/>' +
        '<text x="85" y="26" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="13" fill="#e8edf5">CALL</text>' +
        '<text x="85" y="44" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#38BDF8">delete_user(7)</text>' +
      '</g>' +
      '<line x1="198" y1="120" x2="252" y2="120" stroke="rgba(56,189,248,.7)" stroke-width="1.6"/>' +
      '<polygon points="252,120 244,116 244,124" fill="rgba(56,189,248,.9)"/>' +
      '<text x="225" y="112" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#aebfd6">1 lệnh</text>' +
      '<g transform="translate(254, 52)">' +
        '<rect width="278" height="140" rx="10" fill="#0e1726" stroke="rgba(56,189,248,.55)" stroke-width="1.6" stroke-dasharray="6,3"/>' +
        '<text x="139" y="22" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="#7f93ad">bên trong procedure — chạy tuần tự</text>' +
        '<text x="16" y="52" font-family="JetBrains Mono, monospace" font-size="12" fill="#e8edf5"><tspan fill="#38BDF8" font-weight="700">①</tspan> DELETE FROM comments…</text>' +
        '<text x="16" y="84" font-family="JetBrains Mono, monospace" font-size="12" fill="#e8edf5"><tspan fill="#38BDF8" font-weight="700">②</tspan> DELETE FROM posts…</text>' +
        '<text x="16" y="116" font-family="JetBrains Mono, monospace" font-size="12" fill="#e8edf5"><tspan fill="#38BDF8" font-weight="700">③</tspan> DELETE FROM users…</text>' +
      '</g>' +
      '<g transform="translate(560, 52)" font-family="JetBrains Mono, monospace">' +
        '<rect width="132" height="34" rx="7" fill="rgba(255,255,255,0.03)" stroke="rgba(252,211,77,.5)" stroke-width="1.2"/>' +
        '<text x="66" y="22" text-anchor="middle" font-size="11" fill="#FCD34D">comments</text>' +
        '<rect y="53" width="132" height="34" rx="7" fill="rgba(255,255,255,0.03)" stroke="rgba(252,211,77,.5)" stroke-width="1.2"/>' +
        '<text x="66" y="75" text-anchor="middle" font-size="11" fill="#FCD34D">posts</text>' +
        '<rect y="106" width="132" height="34" rx="7" fill="rgba(255,255,255,0.03)" stroke="rgba(252,211,77,.5)" stroke-width="1.2"/>' +
        '<text x="66" y="128" text-anchor="middle" font-size="11" fill="#FCD34D">users</text>' +
        '<line x1="30" y1="53" x2="30" y2="87" stroke="rgba(252,211,77,.6)" stroke-width="1.2"/><polygon points="30,53 26,61 34,61" fill="rgba(252,211,77,.8)"/>' +
        '<line x1="30" y1="106" x2="30" y2="140" stroke="rgba(252,211,77,.6)" stroke-width="1.2"/><polygon points="30,106 26,114 34,114" fill="rgba(252,211,77,.8)"/>' +
        '<text x="86" y="46" font-size="9" fill="#7f93ad">FK trỏ lên</text>' +
        '<text x="86" y="100" font-size="9" fill="#7f93ad">FK trỏ lên</text>' +
      '</g>' +
      '<text x="360" y="216" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">Thứ tự sống còn: bảng CON (bị FK trỏ tới cha) phải xóa TRƯỚC — cha xóa CUỐI</text>' +
      '</svg>',

    /* tc_03: trigger — INSERT INTO likes ⚡ tự động UPDATE posts.like_count (không ai gọi) */
    tc_03: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Trigger: sự kiện INSERT INTO likes tự động kích hoạt UPDATE posts SET like_count + 1 — like_count của post 501 nhảy từ 3 lên 4">' +
      '<text x="360" y="30" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">Trigger — database tự phản ứng</text>' +
      '<g transform="translate(28, 84)">' +
        '<rect width="188" height="66" rx="10" fill="#0e1726" stroke="rgba(56,189,248,.55)" stroke-width="1.6"/>' +
        '<text x="94" y="26" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="#7f93ad">sự kiện (ai đó bấm ❤)</text>' +
        '<text x="94" y="48" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="12.5" fill="#e8edf5">INSERT INTO likes</text>' +
      '</g>' +
      '<line x1="216" y1="117" x2="272" y2="117" stroke="rgba(56,189,248,.7)" stroke-width="1.6"/>' +
      '<polygon points="272,117 264,113 264,121" fill="rgba(56,189,248,.9)"/>' +
      '<g transform="translate(274, 76)">' +
        '<rect width="190" height="82" rx="10" fill="rgba(56,189,248,0.08)" stroke="#38BDF8" stroke-width="1.8"/>' +
        '<text x="95" y="26" text-anchor="middle" font-size="18">⚡</text>' +
        '<text x="95" y="48" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="12" fill="#38BDF8">AFTER INSERT ON likes</text>' +
        '<text x="95" y="68" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="#aebfd6">FOR EACH ROW — tự chạy</text>' +
      '</g>' +
      '<line x1="464" y1="117" x2="520" y2="117" stroke="rgba(56,189,248,.7)" stroke-width="1.6"/>' +
      '<polygon points="520,117 512,113 512,121" fill="rgba(56,189,248,.9)"/>' +
      '<g transform="translate(522, 76)">' +
        '<rect width="176" height="82" rx="10" fill="#0e1726" stroke="rgba(56,189,248,.55)" stroke-width="1.6"/>' +
        '<text x="88" y="24" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="#7f93ad">hành động tự động</text>' +
        '<text x="88" y="44" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11.5" fill="#e8edf5">UPDATE posts SET</text>' +
        '<text x="88" y="62" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11.5" fill="#e8edf5">like_count <tspan fill="#FCD34D" font-weight="700">+ 1</tspan></text>' +
      '</g>' +
      '<g transform="translate(190, 178)">' +
        '<rect width="340" height="30" rx="6" fill="rgba(252,211,77,0.07)" stroke="rgba(252,211,77,0.45)" stroke-width="1" stroke-dasharray="4 3"/>' +
        '<text x="170" y="20" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#FCD34D">post 501 · like_count: 3 → 4 (không ai gọi UPDATE)</text>' +
      '</g>' +
      '</svg>',

    /* tc_04: WITH RECURSIVE — cây comment sâu N tầng, anchor + UNION ALL lặp tới khi hết con */
    tc_04: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cây bình luận 3 tầng duyệt bằng WITH RECURSIVE: anchor lấy comment gốc, UNION ALL lặp nối con của tầng trước tới khi hết">' +
      '<text x="360" y="30" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">WITH RECURSIVE — duyệt cây không biết trước độ sâu</text>' +
      '<g font-family="JetBrains Mono, monospace">' +
        '<rect x="40" y="56" width="220" height="28" rx="6" fill="rgba(56,189,248,0.16)" stroke="#38BDF8" stroke-width="1.4"/>' +
        '<text x="52" y="75" font-size="11.5" fill="#e8edf5">#1 "Game hay quá!"</text>' +
        '<text x="238" y="75" font-size="10" fill="#38BDF8" text-anchor="end">depth 1</text>' +
        '<line x1="70" y1="84" x2="70" y2="104" stroke="rgba(56,189,248,.5)" stroke-width="1.4"/>' +
        '<rect x="70" y="104" width="220" height="28" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(56,189,248,.45)" stroke-width="1.2"/>' +
        '<text x="82" y="123" font-size="11.5" fill="#aebfd6">#2 ↳ "Đồng ý luôn"</text>' +
        '<text x="268" y="123" font-size="10" fill="#7f93ad" text-anchor="end">depth 2</text>' +
        '<line x1="70" y1="84" x2="70" y2="152" stroke="rgba(56,189,248,.5)" stroke-width="1.4"/>' +
        '<rect x="70" y="152" width="220" height="28" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(56,189,248,.45)" stroke-width="1.2"/>' +
        '<text x="82" y="171" font-size="11.5" fill="#aebfd6">#3 ↳ "Chê, tụt rank"</text>' +
        '<text x="268" y="171" font-size="10" fill="#7f93ad" text-anchor="end">depth 2</text>' +
        '<line x1="100" y1="180" x2="100" y2="200" stroke="rgba(56,189,248,.5)" stroke-width="1.4"/>' +
        '<rect x="100" y="200" width="220" height="28" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(56,189,248,.45)" stroke-width="1.2"/>' +
        '<text x="112" y="219" font-size="11.5" fill="#aebfd6">#4 ↳↳ "Gà thì đổ game à?"</text>' +
        '<text x="298" y="219" font-size="10" fill="#7f93ad" text-anchor="end">depth 3</text>' +
      '</g>' +
      '<g transform="translate(400, 56)" font-family="JetBrains Mono, monospace">' +
        '<rect width="292" height="150" rx="10" fill="#0e1726" stroke="rgba(56,189,248,.55)" stroke-width="1.6"/>' +
        '<text x="16" y="26" font-size="11.5" fill="#38BDF8" font-weight="700">WITH RECURSIVE thread AS (</text>' +
        '<text x="28" y="48" font-size="11" fill="#e8edf5">SELECT … WHERE id = 1   <tspan fill="#7f93ad">← anchor</tspan></text>' +
        '<text x="28" y="70" font-size="11" fill="#FCD34D" font-weight="700">UNION ALL</text>' +
        '<text x="28" y="92" font-size="11" fill="#e8edf5">SELECT con JOIN thread   <tspan fill="#7f93ad">← lặp</tspan></text>' +
        '<text x="16" y="114" font-size="11.5" fill="#38BDF8" font-weight="700">) SELECT * FROM thread;</text>' +
        '<path d="M 258 62 a 14 14 0 1 1 -0.1 0" fill="none" stroke="rgba(252,211,77,.7)" stroke-width="1.5"/>' +
        '<polygon points="258,48 252,56 264,56" fill="rgba(252,211,77,.85)"/>' +
        '<text x="146" y="138" text-anchor="middle" font-size="10" fill="#7f93ad">lặp tới khi không còn dòng mới (fixed point)</text>' +
      '</g>' +
      '<text x="360" y="232" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">JOIN thường = +1 tầng mỗi lần viết · đệ quy = bao nhiêu tầng cũng gom đủ</text>' +
      '</svg>',

    /* ── TC Module 5 (Big Data & Analytics) — accent fuchsia #E879F9 ── */
    /* tc_05: OLTP đang phục vụ feed (trái) vs kho STAR riêng (phải): FACT giữa + 2 DIM tia */
    tc_05: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tách tải phân tích khỏi OLTP: bảng posts phục vụ feed ở trái, kho star schema ở phải với fact_post_action ở giữa nối tia tới dim_date và dim_user">' +
      '<text x="360" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">Star Schema — sân riêng cho câu hỏi phân tích</text>' +
      '<g transform="translate(26, 52)" font-family="JetBrains Mono, monospace">' +
        '<rect width="210" height="150" rx="10" fill="#0e1726" stroke="rgba(148,163,184,.4)" stroke-width="1.4"/>' +
        '<text x="105" y="24" text-anchor="middle" font-size="11" fill="#7f93ad">OLTP — đang phục vụ feed</text>' +
        '<rect x="14" y="36" width="182" height="22" rx="4" fill="rgba(255,255,255,.04)"/><text x="22" y="51" font-size="10.5" fill="#aebfd6">posts · 2.1M dòng</text>' +
        '<rect x="14" y="64" width="182" height="22" rx="4" fill="rgba(255,255,255,.04)"/><text x="22" y="79" font-size="10.5" fill="#aebfd6">likes · 38M dòng</text>' +
        '<rect x="14" y="92" width="182" height="22" rx="4" fill="rgba(255,255,255,.04)"/><text x="22" y="107" font-size="10.5" fill="#aebfd6">comments · 9M dòng</text>' +
        '<rect x="14" y="120" width="182" height="20" rx="4" fill="rgba(252,211,77,.08)" stroke="rgba(252,211,77,.4)" stroke-width="1"/>' +
        '<text x="22" y="134" font-size="10" fill="#FCD34D">⚠ query dashboard cào ở đây = feed lag</text>' +
      '</g>' +
      '<line x1="242" y1="126" x2="292" y2="126" stroke="rgba(232,121,249,.7)" stroke-width="1.6" stroke-dasharray="5,3"/>' +
      '<polygon points="292,126 284,122 284,130" fill="rgba(232,121,249,.9)"/>' +
      '<text x="267" y="116" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#aebfd6">ETL đêm</text>' +
      '<g font-family="JetBrains Mono, monospace">' +
        '<line x1="470" y1="122" x2="392" y2="72" stroke="rgba(232,121,249,.6)" stroke-width="1.4"/>' +
        '<line x1="470" y1="122" x2="392" y2="176" stroke="rgba(232,121,249,.6)" stroke-width="1.4"/>' +
        '<line x1="470" y1="122" x2="606" y2="122" stroke="rgba(232,121,249,.6)" stroke-width="1.4"/>' +
        '<rect x="404" y="94" width="150" height="58" rx="10" fill="rgba(232,121,249,.1)" stroke="#E879F9" stroke-width="1.8"/>' +
        '<text x="479" y="118" text-anchor="middle" font-size="12" font-weight="700" fill="#E879F9">fact_post_action</text>' +
        '<text x="479" y="136" text-anchor="middle" font-size="9.5" fill="#aebfd6">số đo: act_count</text>' +
        '<rect x="306" y="48" width="118" height="40" rx="8" fill="#0e1726" stroke="rgba(56,189,248,.5)" stroke-width="1.4"/>' +
        '<text x="365" y="66" text-anchor="middle" font-size="11" fill="#38BDF8">dim_date</text>' +
        '<text x="365" y="80" text-anchor="middle" font-size="9" fill="#7f93ad">ngày · tháng · thứ</text>' +
        '<rect x="306" y="156" width="118" height="40" rx="8" fill="#0e1726" stroke="rgba(56,189,248,.5)" stroke-width="1.4"/>' +
        '<text x="365" y="174" text-anchor="middle" font-size="11" fill="#38BDF8">dim_user</text>' +
        '<text x="365" y="188" text-anchor="middle" font-size="9" fill="#7f93ad">username · country</text>' +
        '<rect x="586" y="102" width="108" height="40" rx="8" fill="#0e1726" stroke="rgba(56,189,248,.5)" stroke-width="1.4"/>' +
        '<text x="640" y="120" text-anchor="middle" font-size="11" fill="#38BDF8">dim_post</text>' +
        '<text x="640" y="134" text-anchor="middle" font-size="9" fill="#7f93ad">(mở rộng sau)</text>' +
      '</g>' +
      '<text x="360" y="226" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">FACT = con số cần cộng · DIM = các chiều để cắt (ngày, người, nước)</text>' +
      '</svg>',

    /* tc_06: ROLLUP — 1 query trả đủ 3 tầng: chi tiết / subtotal / grand total */
    tc_06: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ROLLUP trả một bảng đủ ba tầng: dòng chi tiết theo nước và loại, dòng subtotal mỗi nước, dòng grand total toàn cầu">' +
      '<text x="360" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">ROLLUP — một query, đủ mọi tầng tổng</text>' +
      '<g transform="translate(96, 46)" font-family="JetBrains Mono, monospace" font-size="11">' +
        '<rect width="360" height="26" rx="5" fill="rgba(255,255,255,.05)"/>' +
        '<text x="14" y="17" fill="#7f93ad">country</text><text x="150" y="17" fill="#7f93ad">action_type</text><text x="300" y="17" fill="#7f93ad">total</text>' +
        '<rect y="30" width="360" height="24" rx="5" fill="rgba(255,255,255,.03)"/>' +
        '<text x="14" y="46" fill="#e8edf5">VN</text><text x="150" y="46" fill="#e8edf5">like</text><text x="300" y="46" fill="#e8edf5">9</text>' +
        '<rect y="58" width="360" height="24" rx="5" fill="rgba(255,255,255,.03)"/>' +
        '<text x="14" y="74" fill="#e8edf5">VN</text><text x="150" y="74" fill="#e8edf5">post</text><text x="300" y="74" fill="#e8edf5">4</text>' +
        '<rect y="86" width="360" height="24" rx="5" fill="rgba(232,121,249,.12)" stroke="rgba(232,121,249,.5)" stroke-width="1"/>' +
        '<text x="14" y="102" fill="#E879F9" font-weight="700">VN</text><text x="150" y="102" fill="#E879F9">NULL ← subtotal VN</text><text x="300" y="102" fill="#E879F9" font-weight="700">13</text>' +
        '<rect y="114" width="360" height="24" rx="5" fill="rgba(255,255,255,.03)"/>' +
        '<text x="14" y="130" fill="#e8edf5">JP</text><text x="150" y="130" fill="#e8edf5">like</text><text x="300" y="130" fill="#e8edf5">6</text>' +
        '<rect y="142" width="360" height="24" rx="5" fill="rgba(232,121,249,.12)" stroke="rgba(232,121,249,.5)" stroke-width="1"/>' +
        '<text x="14" y="158" fill="#E879F9" font-weight="700">JP</text><text x="150" y="158" fill="#E879F9">NULL ← subtotal JP</text><text x="300" y="158" fill="#E879F9" font-weight="700">6</text>' +
        '<rect y="170" width="360" height="24" rx="5" fill="rgba(252,211,77,.1)" stroke="rgba(252,211,77,.55)" stroke-width="1.2"/>' +
        '<text x="14" y="186" fill="#FCD34D" font-weight="700">NULL</text><text x="150" y="186" fill="#FCD34D">NULL ← grand total</text><text x="300" y="186" fill="#FCD34D" font-weight="700">19</text>' +
      '</g>' +
      '<g transform="translate(492, 78)" font-family="JetBrains Mono, monospace">' +
        '<rect width="204" height="88" rx="10" fill="#0e1726" stroke="rgba(232,121,249,.55)" stroke-width="1.6"/>' +
        '<text x="14" y="24" font-size="11" fill="#e8edf5">GROUP BY</text>' +
        '<text x="14" y="44" font-size="12" font-weight="700" fill="#E879F9">ROLLUP(country,</text>' +
        '<text x="14" y="62" font-size="12" font-weight="700" fill="#E879F9">  action_type)</text>' +
        '<text x="14" y="80" font-size="9.5" fill="#7f93ad">NULL = "gộp hết chiều này"</text>' +
      '</g>' +
      '<text x="360" y="228" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">Hết cảnh dán 3 query rồi cộng tay lệch số — subtotal sinh cùng một nguồn</text>' +
      '</svg>',

    /* tc_07: MapReduce — 3 máy MAP phát (tag,1) → SHUFFLE gom theo khóa → REDUCE cộng */
    tc_07: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="MapReduce đếm hashtag: ba máy map phát cặp tag và 1, shuffle gom theo khóa, reduce cộng dồn ra kết quả">' +
      '<text x="360" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">MapReduce — chia bài toán cho cả cụm máy</text>' +
      '<g font-family="JetBrains Mono, monospace" font-size="10.5">' +
        '<rect x="30" y="52" width="150" height="44" rx="8" fill="#0e1726" stroke="rgba(232,121,249,.5)" stroke-width="1.4"/>' +
        '<text x="105" y="70" text-anchor="middle" fill="#E879F9" font-weight="700">MAP · máy 1</text>' +
        '<text x="105" y="86" text-anchor="middle" fill="#aebfd6">(#eldenring, 1) ×2</text>' +
        '<rect x="30" y="104" width="150" height="44" rx="8" fill="#0e1726" stroke="rgba(232,121,249,.5)" stroke-width="1.4"/>' +
        '<text x="105" y="122" text-anchor="middle" fill="#E879F9" font-weight="700">MAP · máy 2</text>' +
        '<text x="105" y="138" text-anchor="middle" fill="#aebfd6">(#hades2, 1)</text>' +
        '<rect x="30" y="156" width="150" height="44" rx="8" fill="#0e1726" stroke="rgba(232,121,249,.5)" stroke-width="1.4"/>' +
        '<text x="105" y="174" text-anchor="middle" fill="#E879F9" font-weight="700">MAP · máy 3</text>' +
        '<text x="105" y="190" text-anchor="middle" fill="#aebfd6">(#eldenring, 1)</text>' +
        '<path d="M184 74 C 250 74, 250 120, 300 120" fill="none" stroke="rgba(232,121,249,.5)" stroke-width="1.4"/>' +
        '<path d="M184 126 L 300 124" fill="none" stroke="rgba(232,121,249,.5)" stroke-width="1.4"/>' +
        '<path d="M184 178 C 250 178, 250 130, 300 128" fill="none" stroke="rgba(232,121,249,.5)" stroke-width="1.4"/>' +
        '<rect x="302" y="92" width="160" height="62" rx="8" fill="rgba(232,121,249,.08)" stroke="#E879F9" stroke-width="1.6" stroke-dasharray="6,3"/>' +
        '<text x="382" y="114" text-anchor="middle" fill="#E879F9" font-weight="700" font-size="11">SHUFFLE</text>' +
        '<text x="382" y="130" text-anchor="middle" fill="#aebfd6">gom cùng KHÓA về một chỗ</text>' +
        '<text x="382" y="146" text-anchor="middle" fill="#7f93ad" font-size="9.5">#eldenring → [1,1,1] · #hades2 → [1]</text>' +
        '<line x1="464" y1="123" x2="512" y2="123" stroke="rgba(232,121,249,.7)" stroke-width="1.6"/>' +
        '<polygon points="512,123 504,119 504,127" fill="rgba(232,121,249,.9)"/>' +
        '<rect x="514" y="92" width="180" height="62" rx="8" fill="#0e1726" stroke="rgba(252,211,77,.55)" stroke-width="1.6"/>' +
        '<text x="604" y="114" text-anchor="middle" fill="#FCD34D" font-weight="700" font-size="11">REDUCE — cộng dồn</text>' +
        '<text x="604" y="132" text-anchor="middle" fill="#e8edf5">#eldenring → 3</text>' +
        '<text x="604" y="146" text-anchor="middle" fill="#e8edf5">#hades2 → 1</text>' +
      '</g>' +
      '<text x="360" y="228" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">10 triệu post ÷ N máy — mỗi máy chỉ lo phần mình, khóa nào về nhà nấy</text>' +
      '</svg>',

    /* tc_08: bảng cứng đầy NULL (trái) vs document JSON tự do (phải) */
    tc_08: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Hồ sơ đa hình: bảng quan hệ mọc cột mới đầy NULL, còn document store lưu mỗi hồ sơ một JSON tự do, truy vấn bằng find">' +
      '<text x="360" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">Document Store — khi mỗi hồ sơ một kiểu</text>' +
      '<g transform="translate(26, 50)" font-family="JetBrains Mono, monospace" font-size="10">' +
        '<rect width="310" height="152" rx="10" fill="#0e1726" stroke="rgba(148,163,184,.4)" stroke-width="1.4"/>' +
        '<text x="155" y="20" text-anchor="middle" fill="#7f93ad" font-size="11">users — cột mọc mãi, NULL tràn lan</text>' +
        '<text x="14" y="42" fill="#7f93ad">username | bio | stream_url | badge_1 | clan…</text>' +
        '<text x="14" y="66" fill="#e8edf5">minhkiller | <tspan fill="#F87171">NULL</tspan> | twitch/mk | <tspan fill="#F87171">NULL</tspan> | <tspan fill="#F87171">NULL</tspan></text>' +
        '<text x="14" y="90" fill="#e8edf5">yuki_sama | 8 dòng | <tspan fill="#F87171">NULL</tspan> | Collector | <tspan fill="#F87171">NULL</tspan></text>' +
        '<text x="14" y="114" fill="#e8edf5">sara_gg | <tspan fill="#F87171">NULL</tspan> | <tspan fill="#F87171">NULL</tspan> | <tspan fill="#F87171">NULL</tspan> | GG-Clan</text>' +
        '<text x="14" y="138" fill="#FCD34D" font-size="9.5">⚠ thêm 1 tính năng hồ sơ = ALTER TABLE + NULL cho tất cả</text>' +
      '</g>' +
      '<line x1="344" y1="126" x2="382" y2="126" stroke="rgba(232,121,249,.7)" stroke-width="1.6"/>' +
      '<polygon points="382,126 374,122 374,130" fill="rgba(232,121,249,.9)"/>' +
      '<g transform="translate(386, 44)" font-family="JetBrains Mono, monospace" font-size="10.5">' +
        '<rect width="308" height="164" rx="10" fill="rgba(232,121,249,.06)" stroke="#E879F9" stroke-width="1.6"/>' +
        '<text x="154" y="20" text-anchor="middle" fill="#E879F9" font-size="11" font-weight="700">profiles — mỗi hồ sơ 1 document</text>' +
        '<text x="16" y="42" fill="#e8edf5">{ "username": <tspan fill="#FCD34D">"yuki_sama"</tspan>,</text>' +
        '<text x="28" y="60" fill="#e8edf5">"country": <tspan fill="#FCD34D">"JP"</tspan>,</text>' +
        '<text x="28" y="78" fill="#e8edf5">"bio": <tspan fill="#FCD34D">"Collector 100%"</tspan>,</text>' +
        '<text x="28" y="96" fill="#e8edf5">"badges": [<tspan fill="#FCD34D">"Nhà sưu tầm"</tspan>, …] }</text>' +
        '<line x1="16" y1="110" x2="292" y2="110" stroke="rgba(232,121,249,.35)" stroke-width="1"/>' +
        '<text x="16" y="130" fill="#38BDF8">db.profiles.find({ country: <tspan fill="#FCD34D">\'JP\'</tspan> })</text>' +
        '<text x="16" y="150" fill="#7f93ad" font-size="9.5">field không có? Bỏ trống — không cần NULL, không ALTER</text>' +
      '</g>' +
      '<text x="360" y="230" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">JSONB cột settings (Ticket #15) lớn thành cả CỬA HÀNG document — schemaless có kỷ luật</text>' +
      '</svg>',

    /* tc_09: cube 3 chiều + 4 thao tác OLAP */
    tc_09: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Khối OLAP ba chiều ngày, nước, loại hành động với bốn thao tác: slice cắt lát, dice cắt khối, drill-down xuống chi tiết, roll-up gộp lên">' +
      '<text x="360" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">OLAP — xoay khối dữ liệu tới đâu, trả lời tới đó</text>' +
      '<g transform="translate(70, 54)" font-family="JetBrains Mono, monospace">' +
        '<polygon points="60,30 200,30 240,62 100,62" fill="rgba(232,121,249,.14)" stroke="#E879F9" stroke-width="1.5"/>' +
        '<polygon points="60,30 100,62 100,162 60,130" fill="rgba(232,121,249,.08)" stroke="#E879F9" stroke-width="1.5"/>' +
        '<polygon points="100,62 240,62 240,162 100,162" fill="rgba(232,121,249,.05)" stroke="#E879F9" stroke-width="1.5"/>' +
        '<line x1="100" y1="95" x2="240" y2="95" stroke="rgba(232,121,249,.35)" stroke-width="1"/>' +
        '<line x1="100" y1="128" x2="240" y2="128" stroke="rgba(232,121,249,.35)" stroke-width="1"/>' +
        '<line x1="146" y1="62" x2="146" y2="162" stroke="rgba(232,121,249,.35)" stroke-width="1"/>' +
        '<line x1="192" y1="62" x2="192" y2="162" stroke="rgba(232,121,249,.35)" stroke-width="1"/>' +
        '<rect x="100" y="95" width="46" height="33" fill="rgba(252,211,77,.3)" stroke="#FCD34D" stroke-width="1.5"/>' +
        '<text x="150" y="190" text-anchor="middle" fill="#7f93ad" font-size="10">ngày × nước × loại hành động</text>' +
        '<text x="256" y="46" fill="#38BDF8" font-size="10">← trục ngày</text>' +
        '<text x="256" y="112" fill="#38BDF8" font-size="10">← trục nước</text>' +
        '<text x="30" y="20" fill="#38BDF8" font-size="10">trục loại ↓</text>' +
      '</g>' +
      '<g transform="translate(420, 52)" font-family="JetBrains Mono, monospace" font-size="11">' +
        '<rect width="274" height="34" rx="7" fill="#0e1726" stroke="rgba(232,121,249,.5)" stroke-width="1.2"/>' +
        '<text x="12" y="22" fill="#E879F9" font-weight="700">SLICE</text><text x="86" y="22" fill="#aebfd6">cắt 1 lát: WHERE month = 6</text>' +
        '<rect y="42" width="274" height="34" rx="7" fill="#0e1726" stroke="rgba(232,121,249,.5)" stroke-width="1.2"/>' +
        '<text x="12" y="64" fill="#E879F9" font-weight="700">DICE</text><text x="86" y="64" fill="#aebfd6">cắt khối con: GROUP BY 2 chiều</text>' +
        '<rect y="84" width="274" height="34" rx="7" fill="#0e1726" stroke="rgba(252,211,77,.55)" stroke-width="1.2"/>' +
        '<text x="12" y="106" fill="#FCD34D" font-weight="700">DRILL</text><text x="86" y="106" fill="#aebfd6">tháng → từng ngày (chi tiết hơn)</text>' +
        '<rect y="126" width="274" height="34" rx="7" fill="#0e1726" stroke="rgba(252,211,77,.55)" stroke-width="1.2"/>' +
        '<text x="12" y="148" fill="#FCD34D" font-weight="700">ROLL-UP</text><text x="86" y="148" fill="#aebfd6">ngày → tháng (gộp lên — #26)</text>' +
      '</g>' +
      '<text x="360" y="228" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">Ô vàng = "like của VN trong tháng 6" — mọi câu hỏi của PM là 1 thao tác trên khối</text>' +
      '</svg>',

    /* tc_10: dòng thời gian chia cửa sổ tumbling 5 phút — ô 14:10 vượt ngưỡng */
    tc_10: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dòng sự kiện liên tục chia thành cửa sổ tumbling 5 phút khít nhau; cửa sổ 14 giờ 10 chứa 4 post của cùng một user nên báo động spam">' +
      '<text x="360" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">Tumbling Window — đếm ngay trên dòng chảy</text>' +
      '<g font-family="JetBrains Mono, monospace">' +
        '<line x1="40" y1="150" x2="690" y2="150" stroke="rgba(148,163,184,.5)" stroke-width="1.6"/>' +
        '<polygon points="690,150 681,145 681,155" fill="rgba(148,163,184,.7)"/>' +
        '<text x="668" y="170" fill="#7f93ad" font-size="10">thời gian →</text>' +
        '<rect x="60" y="70" width="190" height="80" rx="8" fill="rgba(232,121,249,.06)" stroke="rgba(232,121,249,.55)" stroke-width="1.5"/>' +
        '<rect x="254" y="70" width="190" height="80" rx="8" fill="rgba(232,121,249,.06)" stroke="rgba(232,121,249,.55)" stroke-width="1.5"/>' +
        '<rect x="448" y="70" width="190" height="80" rx="8" fill="rgba(252,211,77,.1)" stroke="#FCD34D" stroke-width="2"/>' +
        '<text x="155" y="62" text-anchor="middle" fill="#E879F9" font-size="11" font-weight="700">14:00–14:05</text>' +
        '<text x="349" y="62" text-anchor="middle" fill="#E879F9" font-size="11" font-weight="700">14:05–14:10</text>' +
        '<text x="543" y="62" text-anchor="middle" fill="#FCD34D" font-size="11" font-weight="700">14:10–14:15 ⚠</text>' +
        '<circle cx="96" cy="110" r="7" fill="#38BDF8"/><circle cx="130" cy="96" r="7" fill="#38BDF8"/><circle cx="168" cy="118" r="7" fill="#7f93ad"/>' +
        '<circle cx="300" cy="106" r="7" fill="#38BDF8"/><circle cx="360" cy="118" r="7" fill="#7f93ad"/>' +
        '<circle cx="486" cy="98" r="8" fill="#F87171"/><circle cx="522" cy="118" r="8" fill="#F87171"/><circle cx="558" cy="94" r="8" fill="#F87171"/><circle cx="594" cy="112" r="8" fill="#F87171"/>' +
        '<text x="543" y="140" text-anchor="middle" fill="#F87171" font-size="10" font-weight="700">4 post · CÙNG user trong 1 cửa sổ → chuông reo</text>' +
        '<text x="155" y="188" text-anchor="middle" fill="#7f93ad" font-size="10.5">khít nhau · không chờm — mỗi sự kiện thuộc ĐÚNG 1 ô</text>' +
        '<text x="520" y="188" text-anchor="middle" fill="#aebfd6" font-size="10.5">14:04:59 vào ô trước · 14:05:00 sang ô sau</text>' +
      '</g>' +
      '<text x="360" y="226" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">Kho (Ticket #25) trả lời "hôm qua" — stream trả lời "NGAY BÂY GIỜ"</text>' +
      '</svg>',

    /* ── TC Module 6 (Storage, Indexing & Performance) — accent orange #FB923C ── */
    /* tc_11: tháp lưu trữ 4 tầng — càng lên nhanh-nhỏ-đắt, càng xuống chậm-to-rẻ */
    tc_11: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tháp lưu trữ bốn tầng: CPU cache nhanh nhất và nhỏ nhất, rồi RAM, SSD nơi database nằm, HDD chậm nhất rẻ nhất">' +
      '<text x="360" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">Tháp lưu trữ — dữ liệu Community nằm ở đâu?</text>' +
      '<g font-family="JetBrains Mono, monospace" font-size="11">' +
        '<polygon points="300,44 420,44 440,82 280,82" fill="rgba(251,146,60,.22)" stroke="#FB923C" stroke-width="1.6"/>' +
        '<text x="360" y="67" text-anchor="middle" fill="#e8edf5" font-weight="700">CPU Cache · ~1 ns</text>' +
        '<polygon points="280,86 440,86 462,124 258,124" fill="rgba(251,146,60,.14)" stroke="rgba(251,146,60,.8)" stroke-width="1.5"/>' +
        '<text x="360" y="109" text-anchor="middle" fill="#e8edf5" font-weight="700">RAM · ~100 ns <tspan fill="#7f93ad">— buffer sống ở đây · volatile</tspan></text>' +
        '<polygon points="258,128 462,128 484,166 236,166" fill="rgba(56,189,248,.1)" stroke="rgba(56,189,248,.7)" stroke-width="1.5"/>' +
        '<text x="360" y="151" text-anchor="middle" fill="#e8edf5" font-weight="700">SSD · ~100 µs <tspan fill="#38BDF8">— database Community 🏠</tspan></text>' +
        '<polygon points="236,170 484,170 506,208 214,208" fill="rgba(255,255,255,.03)" stroke="rgba(148,163,184,.5)" stroke-width="1.4"/>' +
        '<text x="360" y="193" text-anchor="middle" fill="#aebfd6" font-weight="700">HDD / băng từ · ~10 ms — backup, kho nguội</text>' +
        '<text x="180" y="60" text-anchor="end" fill="#FB923C" font-size="10">nhanh · nhỏ · đắt ▲</text>' +
        '<text x="180" y="196" text-anchor="end" fill="#7f93ad" font-size="10">chậm · to · rẻ ▼</text>' +
        '<text x="548" y="60" fill="#7f93ad" font-size="10">mất điện = mất sạch</text>' +
        '<line x1="540" y1="48" x2="540" y2="120" stroke="rgba(251,146,60,.4)" stroke-width="1" stroke-dasharray="3,3"/>' +
        '<text x="548" y="150" fill="#7f93ad" font-size="10">bền vững qua cúp điện</text>' +
        '<line x1="540" y1="130" x2="540" y2="204" stroke="rgba(56,189,248,.4)" stroke-width="1" stroke-dasharray="3,3"/>' +
      '</g>' +
      '<text x="360" y="230" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">SSD ↔ RAM chênh ~1.000 lần — mọi tối ưu Module 6 = giảm số chuyến xuống đĩa</text>' +
      '</svg>',

    /* tc_12: sequential (1 vé, đọc liền dải) vs random (mỗi dòng một vé seek) */
    tc_12: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="So sánh đọc tuần tự một dải liền trả một lần seek với đọc ngẫu nhiên nhảy cóc trả seek cho từng dòng">' +
      '<text x="360" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">Cùng 100 post — khác cách chạm đĩa</text>' +
      '<g font-family="JetBrains Mono, monospace" font-size="10.5">' +
        '<rect x="36" y="48" width="310" height="150" rx="10" fill="#0e1726" stroke="rgba(56,189,248,.5)" stroke-width="1.5"/>' +
        '<text x="191" y="70" text-anchor="middle" fill="#38BDF8" font-weight="700" font-size="12">SEQUENTIAL — cuộn timeline</text>' +
        [0,1,2,3,4,5,6,7].map(function(i){ return '<rect x="' + (58 + i * 30) + '" y="92" width="26" height="26" rx="4" fill="rgba(56,189,248,.18)" stroke="rgba(56,189,248,.6)" stroke-width="1"/>'; }).join('') +
        '<line x1="58" y1="134" x2="298" y2="134" stroke="#38BDF8" stroke-width="2"/>' +
        '<polygon points="298,134 289,129 289,139" fill="#38BDF8"/>' +
        '<text x="191" y="158" text-anchor="middle" fill="#e8edf5">1 vé seek + transfer một mạch</text>' +
        '<text x="191" y="180" text-anchor="middle" fill="#38BDF8" font-weight="700">100 dòng · 12 ms</text>' +
        '<rect x="374" y="48" width="310" height="150" rx="10" fill="#0e1726" stroke="rgba(251,146,60,.55)" stroke-width="1.5"/>' +
        '<text x="529" y="70" text-anchor="middle" fill="#FB923C" font-weight="700" font-size="12">RANDOM — mở bookmark rải rác</text>' +
        [0,1,2,3,4,5,6,7].map(function(i){ return '<rect x="' + (396 + i * 30) + '" y="92" width="26" height="26" rx="4" fill="rgba(255,255,255,.04)" stroke="rgba(148,163,184,.4)" stroke-width="1"/>'; }).join('') +
        '<rect x="426" y="92" width="26" height="26" rx="4" fill="rgba(251,146,60,.2)" stroke="#FB923C" stroke-width="1.2"/>' +
        '<rect x="576" y="92" width="26" height="26" rx="4" fill="rgba(251,146,60,.2)" stroke="#FB923C" stroke-width="1.2"/>' +
        '<rect x="486" y="92" width="26" height="26" rx="4" fill="rgba(251,146,60,.2)" stroke="#FB923C" stroke-width="1.2"/>' +
        '<path d="M439 134 C 480 160, 560 160, 589 134" fill="none" stroke="#FB923C" stroke-width="1.6"/>' +
        '<path d="M589 134 C 560 168, 520 168, 499 134" fill="none" stroke="#FB923C" stroke-width="1.6" stroke-dasharray="4,3"/>' +
        '<text x="529" y="158" text-anchor="middle" fill="#e8edf5">seek + rotate cho TỪNG post</text>' +
        '<text x="529" y="180" text-anchor="middle" fill="#FB923C" font-weight="700">100 dòng · 980 ms 😱</text>' +
      '</g>' +
      '<text x="360" y="226" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">Tiền vé (seek+rotate) đắt hơn tiền hàng (transfer) — nên database gom việc đọc liền mạch</text>' +
      '</svg>',

    /* tc_13: buffer 3 khung — HIT trả ngay từ RAM, MISS xuống đĩa, LRU đuổi trang nguội */
    tc_13: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Buffer ba khung trên RAM: request trang có sẵn là HIT trả ngay, trang chưa có là MISS phải xuống đĩa và LRU đuổi trang lâu không dùng nhất">' +
      '<text x="360" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">Buffer — trí nhớ ngắn hạn của database</text>' +
      '<g font-family="JetBrains Mono, monospace" font-size="10.5">' +
        '<rect x="250" y="52" width="330" height="88" rx="10" fill="rgba(251,146,60,.07)" stroke="#FB923C" stroke-width="1.6"/>' +
        '<text x="415" y="70" text-anchor="middle" fill="#FB923C" font-weight="700" font-size="11">BUFFER trên RAM — 3 khung</text>' +
        '<rect x="266" y="80" width="94" height="46" rx="6" fill="rgba(56,189,248,.14)" stroke="#38BDF8" stroke-width="1.3"/>' +
        '<text x="313" y="99" text-anchor="middle" fill="#e8edf5">P7 · viral</text>' +
        '<text x="313" y="115" text-anchor="middle" fill="#7f93ad" font-size="9">vừa dùng xong</text>' +
        '<rect x="368" y="80" width="94" height="46" rx="6" fill="rgba(255,255,255,.04)" stroke="rgba(148,163,184,.5)" stroke-width="1.2"/>' +
        '<text x="415" y="99" text-anchor="middle" fill="#e8edf5">P2 · feed</text>' +
        '<text x="415" y="115" text-anchor="middle" fill="#7f93ad" font-size="9">5 phút trước</text>' +
        '<rect x="470" y="80" width="94" height="46" rx="6" fill="rgba(248,113,113,.08)" stroke="rgba(248,113,113,.55)" stroke-width="1.2" stroke-dasharray="5,3"/>' +
        '<text x="517" y="99" text-anchor="middle" fill="#F87171">P9 · hồ sơ cũ</text>' +
        '<text x="517" y="115" text-anchor="middle" fill="#F87171" font-size="9">30 phút — LRU đuổi ⚠</text>' +
        '<rect x="36" y="64" width="160" height="34" rx="8" fill="#0e1726" stroke="rgba(56,189,248,.5)" stroke-width="1.3"/>' +
        '<text x="116" y="86" text-anchor="middle" fill="#38BDF8">mở post 501 (P7)</text>' +
        '<line x1="196" y1="81" x2="246" y2="90" stroke="rgba(56,189,248,.7)" stroke-width="1.5"/>' +
        '<text x="222" y="72" text-anchor="middle" fill="#38BDF8" font-size="10" font-weight="700">HIT ✓</text>' +
        '<rect x="36" y="120" width="160" height="34" rx="8" fill="#0e1726" stroke="rgba(251,146,60,.5)" stroke-width="1.3"/>' +
        '<text x="116" y="142" text-anchor="middle" fill="#FB923C">mở trang P4 (mới)</text>' +
        '<line x1="196" y1="137" x2="246" y2="120" stroke="rgba(251,146,60,.7)" stroke-width="1.5"/>' +
        '<text x="222" y="152" text-anchor="middle" fill="#FB923C" font-size="10" font-weight="700">MISS ✗</text>' +
        '<ellipse cx="415" cy="188" rx="60" ry="11" fill="#0e1726" stroke="rgba(148,163,184,.5)" stroke-width="1.4"/>' +
        '<path d="M355,188 v18 a60,11 0 0 0 120,0 v-18" fill="#0e1726" stroke="rgba(148,163,184,.5)" stroke-width="1.4"/>' +
        '<text x="415" y="205" text-anchor="middle" fill="#aebfd6" font-size="10">ĐĨA — chỉ MISS mới phải xuống đây</text>' +
        '<line x1="470" y1="140" x2="445" y2="176" stroke="rgba(251,146,60,.6)" stroke-width="1.4" stroke-dasharray="4,3"/>' +
      '</g>' +
      '<text x="360" y="234" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">10.000 lượt mở post viral = 1 chuyến đĩa + 9.999 lần HIT miễn phí</text>' +
      '</svg>',

    /* tc_14: slotted page — header, slots mọc xuôi, free space giữa, records mọc ngược */
    tc_14: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sơ đồ slotted page: header đầu trang, slot directory mọc xuôi, free space ở giữa, records mọc ngược từ đáy; dòng phình chuyển trang để lại forwarding pointer">' +
      '<text x="360" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">Slotted Page — sơ đồ căn hộ 8KB</text>' +
      '<g font-family="JetBrains Mono, monospace" font-size="10.5">' +
        '<rect x="60" y="46" width="300" height="164" rx="10" fill="#0e1726" stroke="rgba(251,146,60,.55)" stroke-width="1.6"/>' +
        '<rect x="72" y="56" width="276" height="22" rx="4" fill="rgba(251,146,60,.16)" stroke="#FB923C" stroke-width="1.2"/>' +
        '<text x="210" y="71" text-anchor="middle" fill="#FB923C" font-weight="700">HEADER — metadata trang</text>' +
        '<rect x="72" y="82" width="66" height="20" rx="4" fill="rgba(56,189,248,.15)" stroke="#38BDF8" stroke-width="1"/>' +
        '<text x="105" y="96" text-anchor="middle" fill="#38BDF8">slot #1</text>' +
        '<rect x="142" y="82" width="66" height="20" rx="4" fill="rgba(56,189,248,.15)" stroke="#38BDF8" stroke-width="1"/>' +
        '<text x="175" y="96" text-anchor="middle" fill="#38BDF8">slot #2</text>' +
        '<rect x="212" y="82" width="66" height="20" rx="4" fill="rgba(56,189,248,.15)" stroke="#38BDF8" stroke-width="1"/>' +
        '<text x="245" y="96" text-anchor="middle" fill="#38BDF8">slot #3</text>' +
        '<text x="316" y="96" fill="#7f93ad" font-size="9.5">mọc xuôi →</text>' +
        '<rect x="72" y="108" width="276" height="40" rx="4" fill="rgba(255,255,255,.02)" stroke="rgba(148,163,184,.35)" stroke-width="1" stroke-dasharray="5,4"/>' +
        '<text x="210" y="132" text-anchor="middle" fill="#7f93ad">FREE SPACE — hai đầu ăn dần vào giữa</text>' +
        '<rect x="72" y="152" width="276" height="48" rx="4" fill="rgba(232,121,249,.08)" stroke="rgba(232,121,249,.5)" stroke-width="1.2"/>' +
        '<text x="210" y="170" text-anchor="middle" fill="#E879F9">rec 3 · toxic_lord 28B | rec 2 · yuki 250B</text>' +
        '<text x="210" y="188" text-anchor="middle" fill="#E879F9">| rec 1 · minhkiller 40B</text>' +
        '<text x="316" y="204" fill="#7f93ad" font-size="9.5">← mọc ngược</text>' +
        '<path d="M105 102 C 105 130, 150 176, 190 182" fill="none" stroke="rgba(56,189,248,.45)" stroke-width="1.2"/>' +
        '<g transform="translate(420, 60)">' +
          '<rect width="266" height="130" rx="10" fill="#0e1726" stroke="rgba(148,163,184,.4)" stroke-width="1.4"/>' +
          '<text x="133" y="24" text-anchor="middle" fill="#e8edf5" font-weight="700" font-size="11">Dòng phình → dọn nhà</text>' +
          '<text x="16" y="48" fill="#aebfd6">bio 250B → 900B: chỗ cũ chật</text>' +
          '<text x="16" y="70" fill="#aebfd6">→ record CHUYỂN sang trang 043</text>' +
          '<text x="16" y="92" fill="#FB923C" font-weight="700">→ chỗ cũ: forwarding pointer ↷</text>' +
          '<text x="16" y="114" fill="#7f93ad" font-size="9.5">RID (042, #2) vẫn đúng — đi thêm 1 bước</text>' +
        '</g>' +
      '</g>' +
      '<text x="360" y="230" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">Slot directory = lớp gián tiếp: dòng dời chỗ, địa chỉ RID không đổi</text>' +
      '</svg>',

    /* tc_15: row-store (dòng liền dòng) vs column-store (cột liền dải, nén) */
    tc_15: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Row-store xếp mỗi dòng trọn vẹn nằm cạnh nhau hợp cho feed; column-store xếp mỗi cột liền một dải nén tốt hợp cho kho SUM hai cột">' +
      '<text x="360" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">Xếp ngang hay xếp dọc — chọn theo trận địa</text>' +
      '<g font-family="JetBrains Mono, monospace" font-size="10">' +
        '<rect x="36" y="48" width="310" height="150" rx="10" fill="#0e1726" stroke="rgba(56,189,248,.5)" stroke-width="1.5"/>' +
        '<text x="191" y="68" text-anchor="middle" fill="#38BDF8" font-weight="700" font-size="12">ROW-STORE — feed ❤</text>' +
        '<rect x="54" y="80" width="274" height="24" rx="4" fill="rgba(56,189,248,.12)" stroke="rgba(56,189,248,.5)" stroke-width="1"/>' +
        '<text x="191" y="96" text-anchor="middle" fill="#e8edf5">dòng 1: [1 · 7 · D1 · like · 3 · …12 cột]</text>' +
        '<rect x="54" y="110" width="274" height="24" rx="4" fill="rgba(56,189,248,.12)" stroke="rgba(56,189,248,.5)" stroke-width="1"/>' +
        '<text x="191" y="126" text-anchor="middle" fill="#e8edf5">dòng 2: [4 · 7 · D2 · like · 5 · …12 cột]</text>' +
        '<text x="191" y="158" text-anchor="middle" fill="#aebfd6">mở 1 post = 1 trang có ĐỦ 12 cột</text>' +
        '<text x="191" y="180" text-anchor="middle" fill="#38BDF8" font-weight="700">đọc/ghi nguyên dòng = vô địch OLTP</text>' +
        '<rect x="374" y="48" width="310" height="150" rx="10" fill="#0e1726" stroke="rgba(251,146,60,.55)" stroke-width="1.5"/>' +
        '<text x="529" y="68" text-anchor="middle" fill="#FB923C" font-weight="700" font-size="12">COLUMN-STORE — kho 📊</text>' +
        '<rect x="392" y="80" width="274" height="20" rx="4" fill="rgba(255,255,255,.03)" stroke="rgba(148,163,184,.35)" stroke-width="1"/>' +
        '<text x="529" y="94" text-anchor="middle" fill="#7f93ad">action_id: [1, 4, 5, 10, …]</text>' +
        '<rect x="392" y="106" width="274" height="20" rx="4" fill="rgba(251,146,60,.18)" stroke="#FB923C" stroke-width="1.3"/>' +
        '<text x="529" y="120" text-anchor="middle" fill="#FB923C" font-weight="700">act_count: [3, 5, 4, 6, …] ← SUM chỉ đọc dải này</text>' +
        '<rect x="392" y="132" width="274" height="20" rx="4" fill="rgba(255,255,255,.03)" stroke="rgba(148,163,184,.35)" stroke-width="1"/>' +
        '<text x="529" y="146" text-anchor="middle" fill="#7f93ad">action_type: [like, like, like…] → nén cực gọn</text>' +
        '<text x="529" y="172" text-anchor="middle" fill="#aebfd6">11 cột kia: không tốn một byte vận chuyển</text>' +
        '<text x="529" y="190" text-anchor="middle" fill="#FB923C" font-weight="700">quét ít cột trên núi dòng = vô địch OLAP</text>' +
      '</g>' +
      '<text x="360" y="226" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">Không có layout vô địch — feed ở lại row, kho sang column, ETL đêm (Ticket #25) làm cầu</text>' +
      '</svg>',

    /* tc_16: index = mục lục — seq scan 25,000 trang vs tra mục lục nhảy đúng chỗ */
    tc_16: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Không index phải quét tuần tự 25000 trang mất 9 giây; có index email tra mục lục vài bước rồi nhảy đúng trang slot, 40 mili-giây">' +
      '<text x="360" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">Index — mục lục cho 2.000.000 dòng</text>' +
      '<g font-family="JetBrains Mono, monospace" font-size="10">' +
        '<rect x="36" y="48" width="310" height="150" rx="10" fill="#0e1726" stroke="rgba(248,113,113,.5)" stroke-width="1.5"/>' +
        '<text x="191" y="68" text-anchor="middle" fill="#f87171" font-weight="700" font-size="12">KHÔNG INDEX — quét tuần tự 🐢</text>' +
        '<rect x="54" y="80" width="274" height="18" rx="3" fill="rgba(248,113,113,.10)" stroke="rgba(248,113,113,.4)" stroke-width="1"/>' +
        '<text x="191" y="93" text-anchor="middle" fill="#aebfd6">trang 00001 … không thấy mai@</text>' +
        '<rect x="54" y="103" width="274" height="18" rx="3" fill="rgba(248,113,113,.10)" stroke="rgba(248,113,113,.4)" stroke-width="1"/>' +
        '<text x="191" y="116" text-anchor="middle" fill="#aebfd6">trang 00002 … không thấy mai@</text>' +
        '<text x="191" y="140" text-anchor="middle" fill="#7f93ad">⋮ lật đủ 25.000 trang ⋮</text>' +
        '<rect x="54" y="150" width="274" height="18" rx="3" fill="rgba(248,113,113,.10)" stroke="rgba(248,113,113,.4)" stroke-width="1"/>' +
        '<text x="191" y="163" text-anchor="middle" fill="#aebfd6">trang 08112 … CÓ! (mà đã lật 8112 trang)</text>' +
        '<text x="191" y="188" text-anchor="middle" fill="#f87171" font-weight="700">CSKH gõ email → đợi ~9 giây</text>' +
        '<rect x="374" y="48" width="310" height="150" rx="10" fill="#0e1726" stroke="rgba(251,146,60,.55)" stroke-width="1.5"/>' +
        '<text x="529" y="68" text-anchor="middle" fill="#FB923C" font-weight="700" font-size="12">CÓ INDEX idx_users_email 📖</text>' +
        '<rect x="392" y="80" width="176" height="18" rx="3" fill="rgba(251,146,60,.12)" stroke="rgba(251,146,60,.45)" stroke-width="1"/>' +
        '<text x="480" y="93" text-anchor="middle" fill="#aebfd6">bob@ghub.us → (019, 3)</text>' +
        '<rect x="392" y="103" width="176" height="18" rx="3" fill="rgba(251,146,60,.28)" stroke="#FB923C" stroke-width="1.4"/>' +
        '<text x="480" y="116" text-anchor="middle" fill="#FB923C" font-weight="700">mai@ghub.vn → (8112, 4)</text>' +
        '<rect x="392" y="126" width="176" height="18" rx="3" fill="rgba(251,146,60,.12)" stroke="rgba(251,146,60,.45)" stroke-width="1"/>' +
        '<text x="480" y="139" text-anchor="middle" fill="#aebfd6">minh@ghub.vn → (007, 1)</text>' +
        '<rect x="584" y="98" width="86" height="52" rx="6" fill="rgba(52,211,153,.10)" stroke="#34d399" stroke-width="1.3"/>' +
        '<text x="627" y="120" text-anchor="middle" fill="#34d399" font-weight="700" font-size="9.5">trang 8112</text>' +
        '<text x="627" y="136" text-anchor="middle" fill="#34d399" font-size="9.5">slot 4 🎯</text>' +
        '<path d="M568 112 L 582 118" fill="none" stroke="#34d399" stroke-width="1.4" marker-end="none"/>' +
        '<text x="529" y="170" text-anchor="middle" fill="#aebfd6">mục lục XẾP theo email → vài bước là trúng</text>' +
        '<text x="529" y="188" text-anchor="middle" fill="#34d399" font-weight="700">→ ~0,04 giây — đọc đúng 1 trang dữ liệu</text>' +
      '</g>' +
      '<text x="360" y="226" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">Cái giá: mỗi INSERT/UPDATE phải sửa cả sổ chính lẫn MỌI mục lục — đừng rải index bừa</text>' +
      '</svg>',

    /* tc_17: 4 kiểu mục lục — dense / sparse / clustering / secondary */
    tc_17: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bốn kiểu index: dense mỗi dòng một mục, sparse mỗi trang một mục cần sổ đã xếp, clustering là chính sổ xếp theo khóa, secondary là mục lục phụ trỏ RID">' +
      '<text x="360" y="26" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">Bốn kiểu mục lục — chọn sai là công cốc</text>' +
      '<g font-family="JetBrains Mono, monospace" font-size="9.5">' +
        '<rect x="36" y="42" width="310" height="82" rx="8" fill="#0e1726" stroke="rgba(56,189,248,.5)" stroke-width="1.4"/>' +
        '<text x="52" y="62" fill="#38BDF8" font-weight="700" font-size="11">DENSE — mỗi DÒNG 1 mục</text>' +
        '<text x="52" y="80" fill="#aebfd6">7→(p1,1) · 9→(p1,2) · 12→(p2,1) · 15→(p2,2)</text>' +
        '<text x="52" y="98" fill="#7f93ad">to hơn, nhưng tra thẳng từng khóa</text>' +
        '<rect x="374" y="42" width="310" height="82" rx="8" fill="#0e1726" stroke="rgba(251,146,60,.55)" stroke-width="1.4"/>' +
        '<text x="390" y="62" fill="#FB923C" font-weight="700" font-size="11">SPARSE — mỗi TRANG 1 mục</text>' +
        '<text x="390" y="80" fill="#aebfd6">7→trang 1 · 12→trang 2 · 21→trang 3</text>' +
        '<text x="390" y="98" fill="#7f93ad">tí hon — nhưng ĐÒI sổ đã XẾP theo khóa đó</text>' +
        '<rect x="36" y="132" width="310" height="82" rx="8" fill="#0e1726" stroke="rgba(232,121,249,.5)" stroke-width="1.4"/>' +
        '<text x="52" y="152" fill="#E879F9" font-weight="700" font-size="11">CLUSTERING — chính sổ xếp theo khóa</text>' +
        '<text x="52" y="170" fill="#aebfd6">users nằm trên đĩa THEO user_id: 7, 9, 12, 15…</text>' +
        '<text x="52" y="188" fill="#7f93ad">mỗi bảng chỉ được MỘT — dữ liệu chỉ nằm 1 kiểu</text>' +
        '<rect x="374" y="132" width="310" height="82" rx="8" fill="#0e1726" stroke="rgba(148,163,184,.45)" stroke-width="1.4"/>' +
        '<text x="390" y="152" fill="#e8edf5" font-weight="700" font-size="11">SECONDARY — mục lục phụ (email…)</text>' +
        '<text x="390" y="170" fill="#aebfd6">bob@→RID · mai@→RID · minh@→RID (đủ TỪNG dòng)</text>' +
        '<text x="390" y="188" fill="#7f93ad">khóa phụ rải khắp sổ → bắt buộc DENSE</text>' +
      '</g>' +
      '<text x="360" y="232" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">Sparse chỉ sống trên sổ đã xếp (clustering) — secondary thì dense, không có lựa chọn</text>' +
      '</svg>',

    /* tc_18: B+-Tree — root → internal → leaf móc nhau; đường tra mai@ highlight */
    tc_18: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cây B+ ba tầng: root chia ngưỡng, internal dẫn xuống, các lá chứa khóa đã xếp và móc nhau bằng con trỏ ngang cho range scan; đường tra mai@ được tô sáng">' +
      '<text x="360" y="26" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">B+-Tree — 2.000.000 khóa, cao đúng 3 tầng</text>' +
      '<g font-family="JetBrains Mono, monospace" font-size="9.5">' +
        '<rect x="285" y="40" width="150" height="26" rx="6" fill="rgba(251,146,60,.18)" stroke="#FB923C" stroke-width="1.5"/>' +
        '<text x="360" y="57" text-anchor="middle" fill="#FB923C" font-weight="700">ROOT · h… | s…</text>' +
        '<rect x="120" y="96" width="150" height="26" rx="6" fill="#0e1726" stroke="rgba(148,163,184,.4)" stroke-width="1.2"/>' +
        '<text x="195" y="113" text-anchor="middle" fill="#7f93ad">a… | d…</text>' +
        '<rect x="285" y="96" width="150" height="26" rx="6" fill="rgba(251,146,60,.18)" stroke="#FB923C" stroke-width="1.5"/>' +
        '<text x="360" y="113" text-anchor="middle" fill="#FB923C" font-weight="700">j… | mai… | p…</text>' +
        '<rect x="450" y="96" width="150" height="26" rx="6" fill="#0e1726" stroke="rgba(148,163,184,.4)" stroke-width="1.2"/>' +
        '<text x="525" y="113" text-anchor="middle" fill="#7f93ad">t… | x…</text>' +
        '<path d="M330 66 L 210 94" fill="none" stroke="rgba(148,163,184,.45)" stroke-width="1.2"/>' +
        '<path d="M360 66 L 360 94" fill="none" stroke="#FB923C" stroke-width="1.8"/>' +
        '<path d="M390 66 L 510 94" fill="none" stroke="rgba(148,163,184,.45)" stroke-width="1.2"/>' +
        '<rect x="48" y="156" width="146" height="34" rx="6" fill="#0e1726" stroke="rgba(148,163,184,.4)" stroke-width="1.2"/>' +
        '<text x="121" y="171" text-anchor="middle" fill="#7f93ad">LÁ · bob@ · duc@…</text>' +
        '<text x="121" y="184" text-anchor="middle" fill="#7f93ad" font-size="8.5">khóa xếp sẵn + RID</text>' +
        '<rect x="214" y="156" width="146" height="34" rx="6" fill="rgba(52,211,153,.10)" stroke="#34d399" stroke-width="1.5"/>' +
        '<text x="287" y="171" text-anchor="middle" fill="#34d399" font-weight="700">LÁ · mai@ → (8112,4)</text>' +
        '<text x="287" y="184" text-anchor="middle" fill="#34d399" font-size="8.5">3 bước là tới 🎯</text>' +
        '<rect x="380" y="156" width="146" height="34" rx="6" fill="#0e1726" stroke="rgba(148,163,184,.4)" stroke-width="1.2"/>' +
        '<text x="453" y="171" text-anchor="middle" fill="#7f93ad">LÁ · pat@ · son@…</text>' +
        '<rect x="546" y="156" width="146" height="34" rx="6" fill="#0e1726" stroke="rgba(148,163,184,.4)" stroke-width="1.2"/>' +
        '<text x="619" y="171" text-anchor="middle" fill="#7f93ad">LÁ · tuan@ · yuki@…</text>' +
        '<path d="M330 122 L 290 154" fill="none" stroke="#34d399" stroke-width="1.8"/>' +
        '<path d="M194 173 L 212 173" fill="none" stroke="#38BDF8" stroke-width="1.6"/>' +
        '<path d="M360 173 L 378 173" fill="none" stroke="#38BDF8" stroke-width="1.6"/>' +
        '<path d="M526 173 L 544 173" fill="none" stroke="#38BDF8" stroke-width="1.6"/>' +
        '<text x="360" y="207" text-anchor="middle" fill="#38BDF8" font-size="10">→ lá MÓC NHAU: tìm lá đầu rồi đi ngang = range scan không phải leo lại cây</text>' +
      '</g>' +
      '<text x="360" y="230" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">Mỗi node chứa hàng trăm khóa (fanout) — mỗi tầng nhân trăm lần, nên cây triệu khóa vẫn lùn</text>' +
      '</svg>',

    /* tc_19: composite (user_id, action_type) như danh bạ Họ-rồi-Tên + bitmap cho cột ít giá trị */
    tc_19: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Composite index xếp theo user_id rồi action_type như danh bạ họ rồi tên, đủ prefix thì trúng dải; bitmap index cho cột ít giá trị, AND OR trên bit cực nhanh">' +
      '<text x="360" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">Composite &amp; Bitmap — hai vũ khí đặc chủng</text>' +
      '<g font-family="JetBrains Mono, monospace" font-size="10">' +
        '<rect x="36" y="48" width="310" height="150" rx="10" fill="#0e1726" stroke="rgba(251,146,60,.55)" stroke-width="1.5"/>' +
        '<text x="191" y="68" text-anchor="middle" fill="#FB923C" font-weight="700" font-size="12">COMPOSITE (user_id, action_type)</text>' +
        '<text x="191" y="88" text-anchor="middle" fill="#aebfd6">xếp như danh bạ: HỌ trước, TÊN sau</text>' +
        '<rect x="54" y="98" width="130" height="18" rx="3" fill="rgba(255,255,255,.03)" stroke="rgba(148,163,184,.35)" stroke-width="1"/>' +
        '<text x="119" y="111" text-anchor="middle" fill="#7f93ad">7 · comment</text>' +
        '<rect x="54" y="121" width="130" height="18" rx="3" fill="rgba(52,211,153,.14)" stroke="#34d399" stroke-width="1.3"/>' +
        '<text x="119" y="134" text-anchor="middle" fill="#34d399" font-weight="700">7 · like ×2 🎯</text>' +
        '<rect x="54" y="144" width="130" height="18" rx="3" fill="rgba(255,255,255,.03)" stroke="rgba(148,163,184,.35)" stroke-width="1"/>' +
        '<text x="119" y="157" text-anchor="middle" fill="#7f93ad">9 · comment</text>' +
        '<text x="256" y="111" fill="#34d399" font-size="9">user=7 AND type=like</text>' +
        '<text x="256" y="124" fill="#34d399" font-size="9">→ nhảy trúng dải ✓</text>' +
        '<text x="256" y="147" fill="#f87171" font-size="9">chỉ type=like (thiếu Họ)</text>' +
        '<text x="256" y="160" fill="#f87171" font-size="9">→ rải khắp sổ ✗</text>' +
        '<text x="191" y="186" text-anchor="middle" fill="#FB923C" font-weight="700">luật leftmost prefix: có Họ mới tra được</text>' +
        '<rect x="374" y="48" width="310" height="150" rx="10" fill="#0e1726" stroke="rgba(56,189,248,.5)" stroke-width="1.5"/>' +
        '<text x="529" y="68" text-anchor="middle" fill="#38BDF8" font-weight="700" font-size="12">BITMAP — cột ít giá trị (kho 📊)</text>' +
        '<text x="392" y="94" fill="#aebfd6">action_type ∈ {like, comment, post}</text>' +
        '<text x="392" y="118" fill="#e8edf5">like:    <tspan fill="#38BDF8" font-weight="700">1 0 1 0 1 1 0 0</tspan></text>' +
        '<text x="392" y="138" fill="#e8edf5">comment: <tspan fill="#7f93ad">0 1 0 0 0 0 1 0</tspan></text>' +
        '<text x="392" y="158" fill="#e8edf5">post:    <tspan fill="#7f93ad">0 0 0 1 0 0 0 1</tspan></text>' +
        '<text x="529" y="184" text-anchor="middle" fill="#38BDF8" font-weight="700">AND/OR trên bit = triệu dòng/nháy mắt</text>' +
      '</g>' +
      '<text x="360" y="226" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">Composite: chọn THỨ TỰ cột theo query — Bitmap: chỉ đáng khi cột lèo tèo vài giá trị</text>' +
      '</svg>',

    /* tc_20: EXPLAIN trước/sau — Seq Scan vì UPPER(cột) vs Index Scan sau khi sửa sargable */
    tc_20: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="EXPLAIN trước: Seq Scan cost 18334 một triệu dòng vì Filter UPPER action_type; EXPLAIN sau khi bỏ hàm bọc cột: Index Scan cost 912, nhanh gấp hai mươi lần">' +
      '<text x="360" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">EXPLAIN — bắt máy khai nó định làm gì</text>' +
      '<g font-family="JetBrains Mono, monospace" font-size="10">' +
        '<rect x="36" y="48" width="310" height="150" rx="10" fill="#0e1726" stroke="rgba(248,113,113,.5)" stroke-width="1.5"/>' +
        '<text x="191" y="68" text-anchor="middle" fill="#f87171" font-weight="700" font-size="12">TRƯỚC — dashboard 6,2 giây</text>' +
        '<text x="54" y="92" fill="#e8edf5">EXPLAIN SELECT … WHERE</text>' +
        '<text x="54" y="108" fill="#f87171" font-weight="700">  UPPER(action_type) = \'LIKE\'</text>' +
        '<text x="54" y="132" fill="#f87171">→ Seq Scan on fact_post_action</text>' +
        '<text x="54" y="148" fill="#aebfd6">    cost=0.00..18334  rows=1000000</text>' +
        '<text x="54" y="164" fill="#aebfd6">    Filter: UPPER(action_type)=\'LIKE\'</text>' +
        '<text x="191" y="188" text-anchor="middle" fill="#7f93ad">index xếp theo action_type — KHÔNG theo UPPER(…)</text>' +
        '<rect x="374" y="48" width="310" height="150" rx="10" fill="#0e1726" stroke="rgba(52,211,153,.55)" stroke-width="1.5"/>' +
        '<text x="529" y="68" text-anchor="middle" fill="#34d399" font-weight="700" font-size="12">SAU — 0,3 giây, cùng kết quả</text>' +
        '<text x="392" y="92" fill="#e8edf5">EXPLAIN SELECT … WHERE</text>' +
        '<text x="392" y="108" fill="#34d399" font-weight="700">  action_type = \'like\'</text>' +
        '<text x="392" y="132" fill="#34d399">→ Index Scan using idx_fact_type</text>' +
        '<text x="392" y="148" fill="#aebfd6">    cost=0.43..912  rows=310000</text>' +
        '<text x="392" y="164" fill="#aebfd6">    Index Cond: action_type=\'like\'</text>' +
        '<text x="529" y="188" text-anchor="middle" fill="#7f93ad">bỏ hàm bọc cột → index mở mắt trở lại</text>' +
      '</g>' +
      '<text x="360" y="226" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">Index có sẵn chưa chắc được dùng — EXPLAIN là lời khai duy nhất đáng tin</text>' +
      '</svg>',

    /* tc_21 BOSS: bảng điều tra — hiện trường like ảo 02:00 + đồ thị mạng lưới mời mọc từ #401 */
    tc_21: '<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bảng điều tra chuyên án GH-2026: hiện trường chùm like ảo lúc 2 giờ sáng và đồ thị mạng lưới mời mọc ba tầng tỏa ra từ tài khoản 401 seed_master">' +
      '<rect x="14" y="14" width="692" height="212" rx="12" fill="none" stroke="rgba(248,113,113,.35)" stroke-width="1.4" stroke-dasharray="7,5"/>' +
      '<text x="360" y="36" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#e8edf5">CHUYÊN ÁN #GH-2026 · Social Graph Detective</text>' +
      '<g transform="translate(600, 44) rotate(9)">' +
        '<rect width="88" height="26" rx="5" fill="none" stroke="#f87171" stroke-width="2"/>' +
        '<text x="44" y="17" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11" fill="#f87171" letter-spacing="3">MẬT</text>' +
      '</g>' +
      '<g font-family="JetBrains Mono, monospace" font-size="9.5">' +
        '<rect x="36" y="56" width="286" height="148" rx="10" fill="#0e1726" stroke="rgba(251,191,36,.5)" stroke-width="1.4"/>' +
        '<text x="179" y="76" text-anchor="middle" fill="#fbbf24" font-weight="700" font-size="11">HIỆN TRƯỜNG — like_log · 02:00</text>' +
        '<rect x="58" y="150" width="22" height="38" fill="rgba(248,113,113,.7)"/>' +
        '<rect x="88" y="150" width="22" height="38" fill="rgba(248,113,113,.7)"/>' +
        '<rect x="118" y="162" width="22" height="26" fill="rgba(248,113,113,.55)"/>' +
        '<rect x="148" y="180" width="22" height="8" fill="rgba(148,163,184,.5)"/>' +
        '<rect x="178" y="182" width="22" height="6" fill="rgba(148,163,184,.5)"/>' +
        '<rect x="208" y="178" width="22" height="10" fill="rgba(148,163,184,.5)"/>' +
        '<text x="69" y="145" text-anchor="middle" fill="#f87171" font-weight="700" font-size="8.5">404</text>' +
        '<text x="99" y="145" text-anchor="middle" fill="#f87171" font-weight="700" font-size="8.5">405</text>' +
        '<text x="129" y="157" text-anchor="middle" fill="#f87171" font-weight="700" font-size="8.5">406</text>' +
        '<text x="186" y="170" fill="#7f93ad" font-size="8.5">dân thường</text>' +
        '<text x="179" y="106" text-anchor="middle" fill="#aebfd6">3 tài khoản like ≥3 lần / 5 phút</text>' +
        '<text x="179" y="122" text-anchor="middle" fill="#7f93ad">HAVING COUNT(*) &gt;= 3 khoanh vùng</text>' +
      '</g>' +
      '<g font-family="JetBrains Mono, monospace" font-size="9.5">' +
        '<rect x="342" y="56" width="342" height="148" rx="10" fill="#0e1726" stroke="rgba(248,113,113,.5)" stroke-width="1.4"/>' +
        '<text x="513" y="76" text-anchor="middle" fill="#f87171" font-weight="700" font-size="11">MẠNG LƯỚI MỜI MỌC — WITH RECURSIVE</text>' +
        '<circle cx="513" cy="104" r="15" fill="rgba(248,113,113,.2)" stroke="#f87171" stroke-width="1.8"/>' +
        '<text x="513" y="108" text-anchor="middle" fill="#f87171" font-weight="800" font-size="9">401</text>' +
        '<text x="556" y="97" fill="#f87171" font-size="8.5">seed_master — chủ mưu?</text>' +
        '<circle cx="433" cy="150" r="12" fill="rgba(251,191,36,.12)" stroke="#fbbf24" stroke-width="1.3"/>' +
        '<text x="433" y="154" text-anchor="middle" fill="#fbbf24" font-size="8.5">404</text>' +
        '<circle cx="513" cy="150" r="12" fill="rgba(251,191,36,.12)" stroke="#fbbf24" stroke-width="1.3"/>' +
        '<text x="513" y="154" text-anchor="middle" fill="#fbbf24" font-size="8.5">405</text>' +
        '<circle cx="593" cy="150" r="12" fill="rgba(251,191,36,.12)" stroke="#fbbf24" stroke-width="1.3"/>' +
        '<text x="593" y="154" text-anchor="middle" fill="#fbbf24" font-size="8.5">406</text>' +
        '<path d="M504 117 L 441 139" stroke="rgba(248,113,113,.6)" stroke-width="1.3" fill="none"/>' +
        '<path d="M513 119 L 513 138" stroke="rgba(248,113,113,.6)" stroke-width="1.3" fill="none"/>' +
        '<path d="M522 117 L 585 139" stroke="rgba(248,113,113,.6)" stroke-width="1.3" fill="none"/>' +
        '<g fill="rgba(148,163,184,.14)" stroke="rgba(148,163,184,.5)" stroke-width="1">' +
          '<circle cx="409" cy="186" r="9"/><circle cx="457" cy="186" r="9"/><circle cx="513" cy="186" r="9"/><circle cx="569" cy="186" r="9"/><circle cx="617" cy="186" r="9"/>' +
        '</g>' +
        '<text x="409" y="189" text-anchor="middle" fill="#aebfd6" font-size="7.5">407</text>' +
        '<text x="457" y="189" text-anchor="middle" fill="#aebfd6" font-size="7.5">408</text>' +
        '<text x="513" y="189" text-anchor="middle" fill="#aebfd6" font-size="7.5">409</text>' +
        '<text x="569" y="189" text-anchor="middle" fill="#aebfd6" font-size="7.5">410</text>' +
        '<text x="617" y="189" text-anchor="middle" fill="#aebfd6" font-size="7.5">411</text>' +
        '<path d="M428 161 L 412 177 M 438 161 L 453 177 M 513 162 L 513 176 M 588 161 L 572 177 M 598 161 L 613 177" stroke="rgba(148,163,184,.45)" stroke-width="1.1" fill="none"/>' +
      '</g>' +
      '<text x="360" y="222" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#7f93ad">4 vụ án liên hoàn · mọi vũ khí của Trung cấp — HAVING · Index/EXPLAIN · WITH RECURSIVE · lệnh kết án</text>' +
      '</svg>'
  };

  function renderLessonHero(lessonId) {
    const mount = document.getElementById('lesson-hero');
    if (!mount) return;
    if (!lessonId) { mount.innerHTML = ''; mount.removeAttribute('aria-label'); return; }
    // REVIEW-FIX 2026-07-04: thử EXACT id trước (tc_01, nc_01…). Normalize digit chỉ áp
    // cho id họ db_ ('db_NN','BN','bNN') — trước đây 'tc_01' bị ép thành 'db_01' → bài TC
    // hiện nhầm hero Bài 1 Basic.
    let svg = HERO_SVGS[lessonId];
    if (!svg && /^(db_|b)/i.test(String(lessonId))) {
      const m = String(lessonId).match(/\d+/);
      if (m) svg = HERO_SVGS['db_' + String(m[0]).padStart(2, '0')];
    }
    if (svg) {
      mount.innerHTML = svg;
      // Extract aria-label from SVG root for screen readers
      const ariaMatch = svg.match(/aria-label="([^"]+)"/);
      mount.setAttribute('aria-label', ariaMatch ? ariaMatch[1] : '');
    } else {
      mount.innerHTML = '';
      mount.removeAttribute('aria-label');
    }
  }

  /* ─── State ───────────────────────────────────────────────────── */
  const state = {
    currentStep: 1,
    currentLesson: null,
    currentLessonIdx: 0,
    mcqLocked: false,
    step3Blocks: {},        // zone id → block element
    step3Placed: new Set(), // block token that has been placed
    step3History: [],       // undo stack — array of {zoneId, token, type}
    hintLevel: 0,
    xpEarned: 0,
    cmEditor: null,
    hearts: 3,               // Duolingo-style lives
    streakActive: true,
    mcqAnswers: [],         // Q1/Q2 user picks
    miniGamePlacements: {}, // chipId -> binId
    miniGameLocked: false,
    challengeState: null     // mode-specific state for step 4 dispatcher
  };

  const SYNTAX_KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE',
    'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AS',
    'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'LIKE', 'BETWEEN',
    'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET',
    'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
    'CREATE', 'TABLE', 'DROP', 'ALTER', 'INDEX', 'VIEW',
    'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE',
    'CHECK', 'DEFAULT', 'AUTO_INCREMENT', 'SERIAL'];

  /* ─── Init ────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', init);

  /* ── LeetCode-style tabs (Step 4) — REMOVED in Part C of STAGE 2d ── */
  function bindLeetCodeTabs() {
    // No-op: Cột 1 step 4 giờ là 1 panel cuộn liên tục (đề + hướng dẫn + gợi ý collapsible),
    // không còn tabs LeetCode. Function này giữ lại trống để không vỡ nếu code khác gọi.
    return;
  }

  /* ── Duolingo-style celebration (confetti) ────────────────────── */
  function celebrate() {
    if (typeof window.confetti !== 'function') return;
    // C3: Perfect score (hearts === 3 = no hearts lost) → rainbow palette
    var isPerfect = state && state.hearts === 3;
    var palette = isPerfect
      ? ['#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6', '#EC4899']  // 6-color rainbow
      : ['#06B6D4', '#10B981', '#F59E0B', '#F97316'];                       // default 4-color
    var count = isPerfect ? 120 : 80;
    // Fire from both sides for a "burst" feel
    confetti({
      particleCount: count,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: palette
    });
    confetti({
      particleCount: count,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: palette
    });
  }

  /* ── C3: Sparkle rain (golden particles falling from top) ─────── */
  function triggerSparkleRain(count) {
    count = count || 24;
    var container = document.body;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (var i = 0; i < count; i++) {
      var p = document.createElement('div');
      p.className = 'sparkle-particle';
      p.style.left = (Math.random() * 100) + 'vw';
      // Randomize size 4-8px for variety
      var size = 4 + Math.random() * 4;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      // Stagger delay 0-0.5s
      p.style.animationDelay = (Math.random() * 0.5) + 's';
      // Slight color variation: gold / amber / orange
      var colors = ['#F59E0B', '#FBBF24', '#F97316', '#FCD34D'];
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      container.appendChild(p);
      // Auto-remove after animation + buffer
      var lifetime = reduced ? 200 : 2000;
      setTimeout(function (el) { return function () {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }; }(p), lifetime);
    }
  }

  /* ── C3: Module / Course completion celebration ─────────────── */
  // M4-TC 2026-07-04: mốc release theo COURSE (trả nợ kỹ thuật COURSE_CFG) — Basic ship
  // GAMEHUB v1-3 tại bài 7/14/20; TC ship COMMUNITY v1-3 tại bài 4/10/21 (M4/M5/M6+boss).
  // Course chưa khai mốc (NC sau này) → không celebration, không misfire.
  var COURSE_MILESTONES = {
    db_design: {
      trophies: { 7: 1, 14: 2 }, graduation: 20,
      shipLabel: function (mod) { return 'SHIP THÀNH CÔNG · GAMEHUB v' + (mod || 1) + '.0'; },
      gradEyebrow: 'GAMEHUB v3.0 — RA MẮT TOÀN CẦU',
      gradTitle: 'Bạn đã trở thành Nhà thiết kế CSDL!',
      gradSub: 'Bạn đã đóng cả 20 ticket — từ thực thể đầu tiên tới hệ CSDL hoàn chỉnh. Trong bản release cuối:'
    },
    db_design_tc: {
      trophies: { 4: 1, 10: 2 }, graduation: 21,
      shipLabel: function (mod) { return 'SHIP THÀNH CÔNG · COMMUNITY v' + ((mod || 4) - 3) + '.0'; },
      gradEyebrow: 'GAMEHUB COMMUNITY v3.0 — RA MẮT',
      gradTitle: 'Bạn đã làm chủ SQL nâng cao & dữ liệu lớn!',
      gradSub: 'Bạn đã đóng cả 21 ticket của GameHub Community — mạng xã hội gamers giờ chạy trên nền dữ liệu bạn dựng. Trong bản release cuối:'
    }
  };

  function triggerModuleCelebration() {
    var lessonNum = (state.currentLessonIdx || 0) + 1;
    var msCfg = COURSE_MILESTONES[state.courseId || 'db_design'];
    if (!msCfg) return;
    var isGraduation = (lessonNum === msCfg.graduation);
    var isTrophy    = !!msCfg.trophies[lessonNum];
    if (!isGraduation && !isTrophy) return;

    // Module-specific element pulse (ER nodes / schema rows / IDE) — subtle backdrop life.
    var mod = state.currentLesson && state.currentLesson.module;
    var completionCls = 'module' + mod + '-completion';
    var targetEls = [];
    if (mod === 1) {
      targetEls = document.querySelectorAll('.visual-db-panel .entity, .visual-db-panel .connector');
    } else if (mod === 2) {
      targetEls = document.querySelectorAll('.visual-db-panel .schema-row');
    } else if (mod === 3) {
      targetEls = document.querySelectorAll('.ide-display');
    }
    targetEls.forEach(function (node) { node.classList.add(completionCls); });
    setTimeout(function () {
      targetEls.forEach(function (node) { node.classList.remove(completionCls); });
    }, 2400);

    if (isGraduation) celebrate();
    // The real milestone moment: a full-screen overlay with recap + continue.
    setTimeout(function () { showModuleCompleteOverlay(isGraduation, mod, lessonNum); }, 500);
  }

  /* Full-screen "Hoàn thành Chương" overlay — recap kỹ năng của cả chương + nút sang chương sau.
   * Chặn 1 nhịp để người học CẢM được cột mốc (Duolingo/Brilliant style). */
  function showModuleCompleteOverlay(isGraduation, modNum, lessonNum) {
    if (document.querySelector('.module-complete-overlay')) return;
    var data = window.LESSON_CONTENT && window.LESSON_CONTENT[state.courseId || 'db_design'];
    var lessons = (data && data.lessons) || [];
    var cur = state.currentLesson || {};
    var modTitle = cur.module_title || ('Chương ' + (modNum || ''));
    var modLessons = lessons.filter(function (l) { return l.module === modNum; })
                            .sort(function (a, b) { return (a.index || 0) - (b.index || 0); });
    var skills = modLessons.map(function (l) { return l.title; });
    if (!skills.length) skills = [cur.title || ''];

    // Hệ Ticket + Release (user chốt 2026-07-04): mỗi bài = 1 ticket, xong 1 chương = SHIP 1 bản lớn.
    // Pace-neutral — không nhắc thời gian học, chỉ nhắc sự kiện do người học tự gây ra.
    // M4-TC: text mốc lấy từ COURSE_MILESTONES theo course (Basic = GAMEHUB, TC = COMMUNITY).
    var msCfg = COURSE_MILESTONES[state.courseId || 'db_design'] || COURSE_MILESTONES.db_design;
    var icon = isGraduation ? '🎓' : '🚀';
    var eyebrow = isGraduation ? msCfg.gradEyebrow : msCfg.shipLabel(modNum);
    var headline = isGraduation ? msCfg.gradTitle : modTitle;
    var sub = isGraduation
      ? msCfg.gradSub
      : (skills.length + ' ticket đã đóng — những gì vừa vào bản release:');

    var skillsHTML = skills.map(function (s) {
      return '<li><i class="fa-solid fa-circle-check"></i> ' + escapeHtml(s) + '</li>';
    }).join('');

    // M4-TC 2026-07-04: khóa đang xây dần (TC mới có M4) — bài kế chưa tồn tại thì nút
    // "Nhận ticket tiếp theo" chỉ reload bài cũ (init clamp idx) → đổi thành nút đóng.
    var hasNext = lessons.some(function (l) { return (l.index || 0) === lessonNum + 1; });
    var nextLabel, nextAttr;
    if (isGraduation) {
      nextLabel = 'Hoàn tất 🎉';
      nextAttr = 'data-mco-close="1"';
    } else if (!hasNext) {
      nextLabel = 'Hoàn tất 🎉 — các ticket tiếp theo sắp ra mắt';
      nextAttr = 'data-mco-close="1"';
    } else {
      nextLabel = 'Nhận ticket tiếp theo <i class="fa-solid fa-arrow-right"></i>';
      nextAttr = 'data-mco-next="' + (lessonNum + 1) + '"';
    }

    var ov = document.createElement('div');
    ov.className = 'module-complete-overlay';
    ov.innerHTML =
      '<div class="mco-backdrop" data-mco-close="1"></div>' +
      '<div class="mco-card" role="dialog" aria-modal="true" aria-label="' + escapeHtml(eyebrow) + '">' +
        '<div class="mco-glow"></div>' +
        '<div class="mco-icon">' + icon + '</div>' +
        '<div class="mco-eyebrow">' + eyebrow + '</div>' +
        '<h2 class="mco-title">' + escapeHtml(headline) + '</h2>' +
        '<p class="mco-sub">' + sub + '</p>' +
        '<ul class="mco-skills">' + skillsHTML + '</ul>' +
        '<div class="mco-actions">' +
          '<button class="mco-continue" ' + nextAttr + '>' + nextLabel + '</button>' +
          (isGraduation ? '' : '<button class="mco-later" data-mco-close="1">Ở lại xem lại</button>') +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('show'); });

    function closeOverlay() {
      ov.classList.remove('show');
      setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 260);
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') closeOverlay(); }
    document.addEventListener('keydown', onKey);

    ov.addEventListener('click', function (e) {
      var t = e.target.closest('[data-mco-next], [data-mco-close]');
      if (!t) return;
      if (t.hasAttribute('data-mco-next')) {
        window.location.href = '?lesson=' + t.getAttribute('data-mco-next');
      } else {
        closeOverlay();
      }
    });
  }

  /* ── C3: Combined Step 4 success hook ────────────────────────── */
  function triggerStep4Success() {
    celebrate();                       // confetti (rainbow if perfect)
    triggerSparkleRain(24);            // golden sparkle rain
    triggerModuleCelebration();        // trophy B6/B13 OR graduation B18
  }

  function init() {
    // SHELL TC (2026-07-04): course id đọc từ <body data-course> (route truyền vào template).
    // Fallback 'db_design' → Basic giữ nguyên hành vi tuyệt đối.
    const courseId = (document.body && document.body.dataset.course) || 'db_design';
    state.courseId = courseId;
    const data = window.LESSON_CONTENT && window.LESSON_CONTENT[courseId];
    if (!data || !data.lessons || data.lessons.length === 0) {
      console.error('LESSON_CONTENT[' + courseId + '] not found');
      showError('Không tìm thấy nội dung bài học. Vui lòng liên hệ admin.');
      return;
    }

    // URL param ?lesson=N là 1-based (cho user), ?lesson_idx=N là 0-based (cho backend)
    const params = new URLSearchParams(window.location.search);
    let idx;
    if (params.has('lesson_idx')) {
      idx = parseInt(params.get('lesson_idx'), 10);
    } else {
      idx = parseInt(params.get('lesson') || '1', 10) - 1;
    }
    state.currentLessonIdx = Math.max(0, Math.min(idx, data.lessons.length - 1));
    state.currentLesson = data.lessons[state.currentLessonIdx];

    // Allow override of accent color per course
    if (data.accent_color) {
      document.documentElement.style.setProperty('--primary', data.accent_color);
    }

    // Set module accent color (Amber/Indigo/Emerald) dựa trên module number
    // Module 1 (B1-B6)  ER Mapping     → Amber  #F59E0B
    // Module 2 (B7-B13) Normalization → Indigo #8B5CF6
    // Module 3 (B15-20) App Design    → Emerald #10B981
    const MODULE_COLORS = {
      1: { accent: '#F59E0B', softAlpha: '1a', glowAlpha: '59' },  // Amber
      2: { accent: '#8B5CF6', softAlpha: '1a', glowAlpha: '59' },  // Indigo
      3: { accent: '#10B981', softAlpha: '1a', glowAlpha: '59' },  // Emerald
      // TC (GameHub Community) — module 4-6, cùng dark palette (ui-ux-pro-max validated)
      4: { accent: '#38BDF8', softAlpha: '1a', glowAlpha: '59' },  // Sky    — Advanced SQL
      5: { accent: '#E879F9', softAlpha: '1a', glowAlpha: '59' },  // Fuchsia— Big Data
      6: { accent: '#FB923C', softAlpha: '1a', glowAlpha: '59' }   // Orange — Storage/Index
    };
    const mod = state.currentLesson.module;
    const mc = MODULE_COLORS[mod] || { accent: data.accent_color || '#06B6D4', softAlpha: '1a', glowAlpha: '59' };
    document.documentElement.style.setProperty('--module-accent', mc.accent);
    document.documentElement.style.setProperty('--module-accent-soft', mc.accent + mc.softAlpha);
    document.documentElement.style.setProperty('--module-accent-glow', mc.accent + mc.glowAlpha);
    // Apply theme-* class to body for per-module sub-themes (Phase 2.3b)
    // REVIEW-FIX 2026-07-04: mở cặp THEME_SLUG/module-N theo MODULE_COLORS (4-6 cho TC)
    // — trước đây chỉ 1-3 → bài TC có --module-accent đúng nhưng body thiếu class theme
    // → CSS trang trí theo module (hero ::before, zone-color) rơi về trống.
    const THEME_SLUG = { 1: 'amber', 2: 'indigo', 3: 'emerald', 4: 'sky', 5: 'fuchsia', 6: 'orange' };
    const themeSlug = THEME_SLUG[mod] || '';
    document.body.classList.remove('theme-amber', 'theme-indigo', 'theme-emerald', 'theme-sky', 'theme-fuchsia', 'theme-orange');
    if (themeSlug) document.body.classList.add('theme-' + themeSlug);
    // REDESIGN 2026-06-28 — A4: also tag body with .module-N for layout variations
    document.body.classList.remove('module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6');
    if (mod >= 1 && mod <= 6) document.body.classList.add('module-' + mod);

    // 4.8 Scroll progress bar — thin colored bar at top tracks scroll within active step
    const scrollBar = document.getElementById('scroll-progress');
    if (scrollBar) {
      const activePane = () => document.querySelector('.step-pane.active');
      const updateScroll = () => {
        const pane = activePane();
        if (!pane) return;
        const max = pane.scrollHeight - pane.clientHeight;
        const pct = max > 0 ? pane.scrollTop / max * 100 : 0;
        // Use setProperty instead of .style.width to avoid inline styles
        scrollBar.style.setProperty('--scroll-pct', Math.min(100, Math.max(0, pct)) + '%');
      };
      // Listen on the lesson-stage container (which is the scroll root for steps)
      const stage = document.querySelector('.lesson-stage') || document;
      stage.addEventListener('scroll', updateScroll, true);
      // Also poll on resize (step content may change)
      window.addEventListener('resize', updateScroll);
      updateScroll();
    }

    // Sticky progress bar — glassmorphism khi scroll qua header
    // (toggle .is-scrolled class trên .lesson-header khi sentinel trên đầu ra khỏi viewport)
    const headerEl = document.querySelector('.lesson-header');
    if (headerEl) {
      const sentinel = document.createElement('div');
      sentinel.style.cssText = 'height:1px;width:100%;pointer-events:none;';
      headerEl.before(sentinel);
      new IntersectionObserver(([entry]) => {
        headerEl.classList.toggle('is-scrolled', !entry.isIntersecting);
      }, { threshold: 0 }).observe(sentinel);
    }

    // Bind Step 4 LeetCode-style tabs
    bindLeetCodeTabs();
    // Bind inline hint button for MCQ (if user clicks an option that needs hint)
    bindMCQInlineHints();

    renderStep1();
    renderStep2();
    renderStep3();
    initStep4();

    // BOSS 2026-07-05: vỏ "hồ sơ vụ án" cho bài có l.boss (tc_21) — phải chạy
    // TRƯỚC goToStep(1) để updateBossStamps trong goToStep thấy thẻ đã gắn.
    applyBossSkin(state.currentLesson);

    // Default to step 1
    goToStep(1);

    // B7 — Init mobile notice button handlers
    initMobileStep3Buttons();
  }

  function showError(msg) {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:16px;background:#0B1121;color:#94A3B8;font-family:Inter,sans-serif;">
        <div style="font-size:48px">⚠️</div>
        <div style="font-size:18px;color:#F1F5F9">${msg}</div>
      </div>
    `;
  }

  /* ═══════════════════════════════════════════════════════════════
   * STEP 1 — Theory
   * ═══════════════════════════════════════════════════════════════ */
  function renderStep1() {
    const l = state.currentLesson;
    const s1 = l.step_1;

    document.getElementById('lesson-title').textContent = l.title;

    if (!s1) {
      document.querySelector('.step-1-content').innerHTML = `
        <div class="eyebrow-row"><span class="step-pill">Bước 1 / 4</span></div>
        <h1 class="lesson-title">${l.title}</h1>
        <p class="lesson-intro" style="opacity:0.5;font-style:italic;">
          Nội dung bài học này đang được cập nhật. Hãy thử bài khác trong roadmap.
        </p>
        <button class="next-btn primary btn btn-primary" onclick="goToStep(2)">Tạm bỏ qua, tiếp tục <i class="fa-solid fa-arrow-right"></i></button>
      `;
      return;
    }

    // Primer goals (legacy — primer-card removed, concept-cards-hero handles overview now)
    const goalList = document.getElementById('goal-list');
    if (goalList) {
      goalList.innerHTML = '';
      (s1.primer.goal || []).forEach(g => {
        const li = document.createElement('li');
        li.innerHTML = g;
        goalList.appendChild(li);
      });
    }

    // Story banner — dự án GameHub xuyên suốt (lesson.story = { tag, hook }).
    // Hook mở VẤN ĐỀ của dự án trước, hero minh hoạ ngay dưới (problem-first, Brilliant style).
    // Bài chưa có story → ẩn hẳn, không để khoảng chết.
    const storyEl = document.getElementById('story-banner');
    if (storyEl) {
      const st = l.story;
      if (st && st.hook) {
        storyEl.innerHTML =
          `<span class="story-tag">${st.tag || '🎫 GameHub'}</span>` +
          `<div class="story-hook">${st.hook}</div>`;
        storyEl.hidden = false;
      } else {
        storyEl.hidden = true;
      }
    }

    // Intro & example (hide empty ones so removed paragraphs leave no dead gap)
    const introEl = document.getElementById('lesson-intro');
    const exampleEl = document.getElementById('lesson-example');
    introEl.innerHTML = s1.primer.intro || '';
    introEl.hidden = !((s1.primer.intro || '').trim());
    exampleEl.innerHTML = s1.primer.example || '';
    exampleEl.hidden = !((s1.primer.example || '').trim());

    // Theory extended (optional field — only show when present in data)
    const theoryEl = document.getElementById('theory-extended');
    const theoryContentEl = document.getElementById('theory-extended-content');
    if (s1.theory_extended && theoryEl && theoryContentEl) {
      theoryContentEl.innerHTML = s1.theory_extended;
      theoryEl.hidden = false;
    } else if (theoryEl) {
      theoryEl.hidden = true;
    }

    // Syntax example (optional field — only show when present in data)
    const syntaxEl = document.getElementById('syntax-example');
    const syntaxCodeEl = document.getElementById('syntax-example-code');
    const syntaxExplainEl = document.getElementById('syntax-example-explain');
    if (s1.syntax_example && syntaxEl && syntaxCodeEl && syntaxExplainEl) {
      syntaxCodeEl.innerHTML = highlightSimpleSQL(s1.syntax_example.code || '');
      syntaxExplainEl.innerHTML = s1.syntax_example.explain || '';
      syntaxEl.hidden = false;
    } else if (syntaxEl) {
      syntaxEl.hidden = true;
    }

    // Visual DB — Interactive Table Explorer (3D schema + linked data table)
    if (window.TableExplorer && s1.visual && s1.visual.schema) {
      window.TableExplorer.mount('#visual-db-panel', {
        schema: s1.visual.schema,
        data: s1.visual.data_preview || []
      });
    } else if (s1.visual && s1.visual.schema) {
      // Fallback to plain tables (only if visual is provided)
      renderSchemaTable(s1.visual.schema);
      renderDataTable(s1.visual.data_preview, s1.visual.schema);
    }

    // ── SVG Primer diagram (Premium — opt-in, không phá fallback) ──
    if (s1.visual && s1.visual.svg) {
      const svgMount = document.getElementById('primer-svg-mount');
      if (svgMount) {
        renderSVGPrimer(svgMount, s1.visual);
      }
    } else if (s1.visual && s1.visual.diagram) {
      // v4 FIX: BỎ render ER-diagram-as-data — bị lỗi (nhãn quan hệ đè chữ, và 1 số bài
      // hiện SAI bảng, vd db_04 hiện student/course/enrollment thay vì player/game/library).
      // Hero SVG (per-lesson) + Schema Explorer đã đủ trực quan. (user: "xóa luôn đi")
      const svgMount = document.getElementById('primer-svg-mount');
      if (svgMount) svgMount.innerHTML = '';
    } else {
      const svgMount = document.getElementById('primer-svg-mount');
      if (svgMount) svgMount.innerHTML = '';
    }
    // If neither, the panel will be hidden by the decomp-game block below

    // Decomp Game (Normal Forms Bài 6-10) — show ONLY when present
    if (s1.decomp_game) {
      if (window.DecompGame) {
        window.DecompGame.init({
          decomp: s1.decomp_game,
          onComplete: () => {
            // Award XP and show inline celebration
            const stageCount = (s1.decomp_game.stages || [s1.decomp_game]).length;
            addXP(30 * stageCount);
            celebrate();
          }
        });
      }
      // Hide the redundant static schema/data panels for Normal Form lessons —
      // the decomp game is the visual focus.
      const visualDbPanel = document.getElementById('visual-db-panel');
      if (visualDbPanel) visualDbPanel.classList.add('flagship-panel-hidden');
    } else {
      // Ensure the visual DB panel is visible for non-NF lessons
      const visualDbPanel = document.getElementById('visual-db-panel');
      if (visualDbPanel) visualDbPanel.classList.remove('flagship-panel-hidden');
      // Clear any leftover decomp mount
      const decMount = document.getElementById('decomp-game-mount');
      if (decMount) decMount.innerHTML = '';
    }

    // Mission
    document.getElementById('mission-text').innerHTML = s1.mission || '';

    // Map Font Awesome icon name → custom SVG symbol id (35 mappings)
    const ICON_MAP = {
      'fa-key': 'i-key',
      'fa-cube': 'i-cube',
      'fa-link': 'i-link',
      'fa-puzzle-piece': 'i-puzzle',
      'fa-shield-halved': 'i-shield',
      'fa-layer-group': 'i-stack',
      'fa-code-branch': 'i-git-branch',
      'fa-code': 'i-arrow-split',
      'fa-crown': 'i-crown',
      'fa-trophy': 'i-trophy',
      'fa-bolt': 'i-zap',
      'fa-database': 'i-database',
      'fa-lock': 'i-lock',
      'fa-skull-crossbones': 'i-bug',
      'fa-bug': 'i-bug',
      'fa-table': 'i-database',
      'fa-lightbulb': 'i-zap',
      'fa-calculator': 'i-zap',
      'fa-object-group': 'i-stack',
      'fa-table-list': 'i-table',
      'fa-link-slash': 'i-link',
      'fa-arrow-right-arrow-left': 'i-arrow-split',
      'fa-diagram-project': 'i-stack',
      'fa-arrows-to-dot': 'i-git-branch',
      'fa-atom': 'i-atom',
      'fa-list': 'i-stack',
      'fa-scissors': 'i-scissors',
      'fa-cubes-stacked': 'i-stack',
      'fa-explosion': 'i-explosion',
      'fa-brackets-curly': 'i-brackets',
      'fa-location-dot': 'i-location',
      'fa-globe': 'i-globe',
      'fa-shield-virus': 'i-shield',
      'fa-arrows-left-right': 'i-arrow-split',
      'fa-lightbulb-on': 'i-zap',
      'fa-fire': 'i-zap',
      'fa-circle-check': 'i-shield'
    };

    // Concept cards HERO (CHANGE 2 — what/how/try 3-up grid)
    renderLessonHero(state.currentLesson && state.currentLesson.id);
    const heroMount = document.getElementById('concept-cards-hero');
    if (heroMount) {
      const allCards = s1.concept_cards || [];
      const heroCards = allCards.slice(0, 3); // CHANGE 2: 3-up grid (what/how/try)
      if (heroCards.length) {
        heroMount.innerHTML = heroCards.map((c, idx) => {
          const iconName = c.data_icon || ICON_MAP[c.icon || ''] || 'i-zap';
          const variant = c.variant || (idx === 0 ? 'highlight' : 'default');
          const variantCls = 'card-' + variant;
          const sourceHTML = (variant === 'quote' && c.source)
            ? `<span class="card-source">${escapeHtml(c.source)}</span>`
            : '';
          const extraHTML = (variant === 'interactive' && c.extra)
            ? `<div class="card-body-extra">${c.extra}</div><span class="card-expand-hint">Click để xem thêm</span>`
            : '';
          return `
          <div class="concept-card concept-card-hero ${variantCls}" data-variant="${variant}">
            <div class="concept-card-head">
              <div class="concept-card-icon">
                <svg class="concept-card-icon-svg" aria-hidden="true"><use href="#${iconName}"/></svg>
              </div>
              <div class="concept-card-title">${c.title || ''}</div>
            </div>
            <div class="concept-card-body">${c.body || ''}${sourceHTML}</div>
            ${extraHTML}
          </div>
        `;
        }).join('');
        // Click handler for interactive cards
        const interactiveCards = heroMount.querySelectorAll('.concept-card.card-interactive');
        interactiveCards.forEach(function (card) {
          card.addEventListener('click', function () {
            card.classList.toggle('expanded');
          });
        });
      } else {
        heroMount.innerHTML = '';
      }
    }

    // CHANGE 2: Situation → Problem → Solution flow
    const flowMount = document.getElementById('primer-flow-mount');
    if (flowMount) {
      const flow = s1.flow;
      if (flow && flow.situation && flow.problem && flow.solution) {
        flowMount.innerHTML = `
          <div class="primer-flow" role="group" aria-label="Situation Problem Solution">
            <div class="flow-step" data-flow="situation">
              <span class="flow-label">Situation</span>
              <span class="flow-text">${flow.situation}</span>
            </div>
            <span class="flow-arrow" aria-hidden="true">→</span>
            <div class="flow-step" data-flow="problem">
              <span class="flow-label">Problem</span>
              <span class="flow-text">${flow.problem}</span>
            </div>
            <span class="flow-arrow" aria-hidden="true">→</span>
            <div class="flow-step" data-flow="solution">
              <span class="flow-label">Solution</span>
              <span class="flow-text">${flow.solution}</span>
            </div>
          </div>
        `;
      } else {
        flowMount.innerHTML = '';
      }
    }

    // C7: Progressive disclosure — wrap concept cards, diagram, visual panel
    // so they fade in on scroll instead of all appearing at once.
    wrapStep1RevealSections();
  }

  /* ── C7: Progressive Disclosure — scroll-triggered fade-in ────── */
  function wrapStep1RevealSections() {
    var sections = [
      { el: document.getElementById('concept-cards-hero'),   i: 0 },
      { el: document.getElementById('primer-svg-mount'),     i: 1 },
      { el: document.getElementById('visual-db-panel'),      i: 2 }
    ];
    sections.forEach(function (s) {
      if (!s.el) return;
      // Reset (avoid stale state when re-rendering same lesson)
      s.el.classList.remove('step1-reveal', 'is-visible');
      s.el.style.removeProperty('--i');
      // Add step1-reveal only if element has content (skip empty containers)
      if (s.el.children.length === 0 && !s.el.textContent.trim()) return;
      s.el.classList.add('step1-reveal');
      s.el.style.setProperty('--i', String(s.i));
    });
    initStep1Reveal();
  }

  function initStep1Reveal() {
    var sections = document.querySelectorAll('.step1-reveal:not(.is-visible)');
    if (!sections.length) return;
    // Respect reduced-motion: show all immediately
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      sections.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: show all immediately
      sections.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          observer.unobserve(e.target);  // only trigger once
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    sections.forEach(function (s) { observer.observe(s); });
  }

  function renderSchemaTable(schema) {
    const wrap = document.getElementById('schema-table');
    document.getElementById('schema-table-name').textContent = schema.table_name;
    wrap.innerHTML = '';

    schema.columns.forEach(col => {
      const row = document.createElement('div');
      row.className = 'schema-row';
      row.innerHTML = `
        <span class="col-icon">${col.icon || (col.key === 'PK' ? '🔑' : '○')}</span>
        <span class="col-name">${col.name}</span>
        <span class="col-type">${col.type}</span>
        ${col.key ? `<span class="col-key">${col.key}</span>` : ''}
      `;
      wrap.appendChild(row);
    });
  }

  function renderDataTable(data, schema) {
    const table = document.getElementById('data-table');
    document.getElementById('data-row-count').textContent = `${data.length} rows`;
    table.innerHTML = '';

    // Header
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    schema.columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.name + (col.key === 'PK' ? ' 🔑' : '');
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    data.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach((cell, i) => {
        const td = document.createElement('td');
        td.textContent = cell;
        if (schema.columns[i] && schema.columns[i].key === 'PK') {
          td.classList.add('pk-cell');
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  /* ═══════════════════════════════════════════════════════════════
   * STEP 2 — MCQ (2 questions + optional mini-game bonus)
   * ═══════════════════════════════════════════════════════════════ */
  function renderStep2() {
    const l = state.currentLesson;
    const s2 = l.step_2;
    state.mcqAnswers = [];
    state.mcqLocked = false;

    if (!s2) {
      document.querySelector('.step-2-content').innerHTML = `
        <div class="eyebrow-row"><span class="step-pill">Bước 2 / 4</span></div>
        <h2 class="mcq-question">Nội dung trắc nghiệm đang cập nhật</h2>
        <button class="next-btn primary" onclick="goToStep(3)">Tiếp tục <i class="fa-solid fa-arrow-right"></i></button>
      `;
      return;
    }

    // Backward compat: if old schema (s2.question + s2.options), wrap into mcq[0]
    let mcqList = s2.mcq;
    if (!mcqList && s2.question && s2.options) {
      mcqList = [{ question: s2.question, options: s2.options }];
    }
    if (!mcqList || mcqList.length === 0) {
      document.querySelector('.step-2-content').innerHTML = `
        <div class="eyebrow-row"><span class="step-pill">Bước 2 / 4</span></div>
        <h2 class="mcq-question">Nội dung trắc nghiệm đang cập nhật</h2>
        <button class="next-btn primary" onclick="goToStep(3)">Tiếp tục <i class="fa-solid fa-arrow-right"></i></button>
      `;
      return;
    }

    // Render first question (we'll progressively unlock Q2)
    renderMCQQuestion(0, mcqList);

    // Render mini-game if exists
    renderMiniGame(s2.mini_game);
  }

  function renderMCQQuestion(qIdx, mcqList) {
    const q = mcqList[qIdx];
    const total = mcqList.length;
    const counter = total > 1 ? `<span style="opacity:0.6;font-weight:500;">(${qIdx + 1}/${total})</span>` : '';
    document.getElementById('mcq-question').innerHTML = `${q.question} ${counter}`;
    const wrap = document.getElementById('mcq-options');
    wrap.innerHTML = '';

    // v4 FIX: xáo trộn vị trí đáp án mỗi lần render → đáp án đúng rơi ngẫu nhiên A–D
    // (trước đây đáp án đúng luôn ở cùng 1 vị trí, thường là B — quá dễ đoán).
    const shuffledOpts = q.options.slice();
    for (let k = shuffledOpts.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [shuffledOpts[k], shuffledOpts[j]] = [shuffledOpts[j], shuffledOpts[k]];
    }

    shuffledOpts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'mcq-option';
      btn.dataset.correct = opt.correct;
      btn.dataset.qIdx = qIdx;
      btn.dataset.optIdx = i;
      const letter = String.fromCharCode(65 + i);

      // C4: variant option rendering based on opt.format
      let bodyHTML;
      if (opt.format === 'code') {
        // Syntax-highlighted SQL in <pre><code>
        bodyHTML = `<pre class="mcq-code-option"><code>${highlightSQL(opt.text || '')}</code></pre>`;
      } else if (opt.format === 'diagram') {
        // ASCII (string) OR HTML table (array of arrays)
        bodyHTML = renderDiagramOption(opt.diagram);
      } else {
        // Default text rendering
        bodyHTML = `<span>${escapeHtml(opt.text || '')}</span>`;
      }

      btn.innerHTML = `<span class="opt-letter">${letter}</span>${bodyHTML}`;
      btn.addEventListener('click', () => handleMCQClick(btn, opt, qIdx, mcqList));
      wrap.appendChild(btn);
    });

    // Hide explain/inline-hint until answered
    document.getElementById('mcq-explain').classList.add('hidden');
    document.getElementById('inline-hint').classList.add('hidden');
    document.getElementById('btn-next-step3').classList.add('hidden');
  }

  /* ── C4: Diagram MCQ option renderer ────────────────────────
     Accepts string (ASCII art) or array-of-arrays (HTML table) */
  function renderDiagramOption(diagram) {
    if (!diagram) return '<span>(empty)</span>';
    if (typeof diagram === 'string') {
      // ASCII art — render in <pre>, preserve whitespace
      return `<pre class="mcq-diagram-option">${escapeHtml(diagram)}</pre>`;
    }
    if (Array.isArray(diagram) && diagram.length > 0) {
      // Array of arrays → HTML table
      const headerRow = diagram[0];
      const bodyRows = diagram.slice(1);
      let html = '<table class="mcq-diagram-table"><thead><tr>';
      headerRow.forEach(function (cell) {
        html += '<th>' + escapeHtml(String(cell)) + '</th>';
      });
      html += '</tr></thead><tbody>';
      bodyRows.forEach(function (row) {
        html += '<tr>';
        row.forEach(function (cell) {
          html += '<td>' + escapeHtml(String(cell)) + '</td>';
        });
        html += '</tr>';
      });
      html += '</tbody></table>';
      return `<div class="mcq-diagram-option">${html}</div>`;
    }
    // Fallback
    return `<span>${escapeHtml(String(diagram))}</span>`;
  }

  function handleMCQClick(btn, opt, qIdx, mcqList) {
    if (state.mcqLocked) return;
    state.mcqLocked = true;
    state.mcqAnswers[qIdx] = opt;

    const options = document.querySelectorAll(`.mcq-option[data-q-idx="${qIdx}"]`);

    if (opt.correct) {
      btn.classList.add('correct');
      showMCQExplain('Chính xác! Tuyệt vời 🎉');
      addXP(15);
      celebrate();
    } else {
      btn.classList.add('wrong');
      // C1 Wrong-answer exploration (Brilliant pattern) — show why wrong + correct hint
      const correctOpt = mcqList[qIdx] && mcqList[qIdx].options && mcqList[qIdx].options.find(o => o.correct);
      const wrongExpl = opt.explanation || 'Xem lại lý thuyết ở trên.';
      const correctExpl = correctOpt && correctOpt.explanation ? correctOpt.explanation : '';
      const tip = document.createElement('div');
      tip.className = 'mcq-wrong-tip mcq-wrong-explore';
      tip.innerHTML =
        '<div class="mcq-wrong-why">' + escapeHtml(wrongExpl) + '</div>' +
        (correctExpl ? '<div class="mcq-correct-hint">💡 ' + escapeHtml(correctExpl) + '</div>' : '');
      // Note: .mcq-option already has position: relative — tip will be positioned inside it.
      btn.appendChild(tip);
      setTimeout(() => tip.remove(), 5000);  // 5s instead of 3s — give user time to read
      loseHeart();
      setTimeout(() => {
        options.forEach(o => {
          if (o.dataset.correct === 'true') o.classList.add('correct');
          else o.classList.add('dimmed', 'disabled');
        });
        showMCQExplain('Chưa đúng rồi — đáp án đúng đã highlight. Đọc kỹ rồi tiếp tục nhé!');
      }, 600);
    }

    options.forEach(o => { if (o !== btn) o.classList.add('disabled'); });

    // Move to next question OR enable "next step" button
    setTimeout(() => {
      const nextIdx = qIdx + 1;
      if (nextIdx < mcqList.length) {
        state.mcqLocked = false;
        renderMCQQuestion(nextIdx, mcqList);
      } else {
        // All questions done — check mini-game status
        const mg = state.currentLesson.step_2.mini_game;
        if (mg && !isMiniGameSolved()) {
          // Mini-game still unsolved → keep button hidden but unlock "Try mini-game"
          showMCQExplain('Câu hỏi xong rồi! 🎉 Thử mini-game bên dưới để ghi điểm thêm nhé.');
        } else {
          revealStep3Cta();
          if (mg && isMiniGameSolved()) addXP(10);
        }
      }
    }, opt.correct ? 600 : 1200);
  }

  function isMiniGameSolved() {
    const mg = state.currentLesson.step_2 && state.currentLesson.step_2.mini_game;
    if (!mg) return true; // no mini-game → "solved" trivially
    // Premium (match/order/bug_spot): CHỈ cờ chung quyết định — không có solution map
    // nên fallback dưới sẽ so {}==={} và trả true oan → CTA khen "Chuẩn!" dù chưa chơi.
    // REVIEW-FIX 2026-07-04: db_18 khai tường minh type:'classify' — vẫn là classify,
    // chấm bằng placements; chỉ match/order/bug_spot mới dùng cờ chung.
    if (mg.type && mg.type !== 'classify') return state.miniGameSolved === true;
    const sol = mg.solution || {};
    const placements = state.miniGamePlacements;
    for (const chipId in sol) {
      if (placements[chipId] !== sol[chipId]) return false;
    }
    return Object.keys(placements).length === Object.keys(sol).length;
  }

  /* ── Mini-game engine (drag chips into bins) ───────────────────── */
  function renderMiniGame(mg) {
    const wrap = document.getElementById('mini-game');
    if (!mg) {
      wrap.hidden = true;
      return;
    }
    // REVIEW-FIX 2026-07-04: reset cờ solved TRƯỚC dispatch — không reset thì solve mini
    // bài N xong, sang bài khác cờ vẫn true → isMiniGameSolved khen oan (stale-flag leak).
    state.miniGameSolved = false;
    // Premium dispatch: nếu có type, route sang renderer tương ứng
    if (mg.type === 'match') return renderMiniGameMatch(wrap, mg);
    if (mg.type === 'order') return renderMiniGameOrder(wrap, mg);
    if (mg.type === 'bug_spot') return renderMiniGameBugSpot(wrap, mg);
    // Mặc định: classify (backward compat — cũ không có type)
    wrap.hidden = false;
    state.miniGamePlacements = {};
    state.miniGameLocked = false;
    state.miniSelectedChip = null;   // v4: click-to-place selection

    document.getElementById('mini-game-title').textContent = mg.title || 'Phân loại nhanh';
    document.getElementById('mini-game-instruction').innerHTML = (mg.instruction || '') +
      ' <span class="mini-hint-inline">👆 <strong>Bấm 1 thẻ</strong> để chọn (viền sáng) rồi <strong>bấm ô</strong> để đặt — hoặc kéo-thả.</span>';
    document.getElementById('mini-game-feedback').classList.add('hidden');
    document.getElementById('btn-mini-reset').onclick = () => renderMiniGame(mg);

    // Render chips
    const chipsHost = document.getElementById('mini-game-chips');
    chipsHost.innerHTML = '';
    (mg.chips || []).forEach(chip => {
      const el = document.createElement('div');
      el.className = 'mini-chip';
      el.draggable = true;
      el.dataset.chipId = chip.id;
      el.innerHTML = `<i class="fa-solid fa-cube"></i> ${chip.label}`;
      attachMiniChipDrag(el, chip.id);   // v4: drag + click-to-place (dùng chung)
      chipsHost.appendChild(el);
    });

    // Render bins
    const binsHost = document.getElementById('mini-game-bins');
    binsHost.innerHTML = '';
    (mg.bins || []).forEach(bin => {
      const el = document.createElement('div');
      el.className = 'mini-bin';
      el.dataset.binId = bin.id;
      el.dataset.correct = bin.correct; // 'true' or 'false' (which one represents correct answer)
      const iconClass = bin.correct === 'true' ? 'fa-check' : 'fa-xmark';
      el.innerHTML = `
        <div class="mini-bin-label">
          <span class="bin-icon"><i class="fa-solid ${iconClass}"></i></span>
          ${bin.label}
        </div>
        <div class="mini-bin-chips" data-bin-chips></div>
      `;
      el.addEventListener('dragover', e => {
        e.preventDefault();
        el.classList.add('drag-over');
      });
      el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
      el.addEventListener('drop', e => {
        e.preventDefault();
        el.classList.remove('drag-over');
        const chipId = e.dataTransfer.getData('text/plain');
        handleMiniDrop(chipId, bin.id);
      });
      // v4: CLICK-để-đặt — nếu đã chọn 1 thẻ, bấm ô này để thả vào.
      el.addEventListener('click', () => {
        if (state.miniGameLocked) return;
        if (state.miniSelectedChip) {
          handleMiniDrop(state.miniSelectedChip, bin.id);
          state.miniSelectedChip = null;
          document.querySelectorAll('.mini-chip.selected').forEach(c => c.classList.remove('selected'));
          clearMiniAwaiting();
        }
      });
      binsHost.appendChild(el);
    });
  }

  function handleMiniDrop(chipId, binId) {
    if (state.miniGameLocked) return;
    // Remove from previous bin (if placed)
    if (state.miniGamePlacements[chipId]) {
      const oldBinId = state.miniGamePlacements[chipId];
      const oldBin = document.querySelector(`.mini-bin[data-bin-id="${oldBinId}"] .mini-bin-chips`);
      const oldChip = oldBin && oldBin.querySelector(`[data-chip-id="${chipId}"]`);
      if (oldChip) {
        // Send chip back to source pool
        const chipsHost = document.getElementById('mini-game-chips');
        const fullChip = (state.currentLesson.step_2.mini_game.chips || []).find(c => c.id === chipId);
        oldChip.remove();
        const newEl = document.createElement('div');
        newEl.className = 'mini-chip';
        newEl.draggable = true;
        newEl.dataset.chipId = chipId;
        newEl.innerHTML = `<i class="fa-solid fa-cube"></i> ${fullChip.label}`;
        attachMiniChipDrag(newEl, chipId);
        chipsHost.appendChild(newEl);
      }
    }
    state.miniGamePlacements[chipId] = binId;
    // Move visual chip
    const fullChip = (state.currentLesson.step_2.mini_game.chips || []).find(c => c.id === chipId);
    if (!fullChip) return;
    const newBin = document.querySelector(`.mini-bin[data-bin-id="${binId}"] .mini-bin-chips`);
    const sourcePool = document.getElementById('mini-game-chips');
    // Remove from source pool
    const sourceChip = sourcePool.querySelector(`[data-chip-id="${chipId}"]`);
    if (sourceChip) sourceChip.remove();
    // Add to new bin
    const newEl = document.createElement('div');
    newEl.className = 'mini-chip placed';
    newEl.dataset.chipId = chipId;
    newEl.innerHTML = `<i class="fa-solid fa-cube"></i> ${fullChip.label}`;
    attachMiniChipDrag(newEl, chipId);
    newBin.appendChild(newEl);
  }

  function clearMiniAwaiting() {
    document.querySelectorAll('.mini-bin.awaiting').forEach(b => b.classList.remove('awaiting'));
  }

  function clearMiniSelection() {
    state.miniSelectedChip = null;
    document.querySelectorAll('.mini-chip.selected').forEach(c => c.classList.remove('selected'));
    clearMiniAwaiting();
  }

  function attachMiniChipDrag(el, chipId) {
    el.addEventListener('dragstart', e => {
      if (state.miniGameLocked) { e.preventDefault(); return; }
      e.dataTransfer.setData('text/plain', chipId);
      e.dataTransfer.effectAllowed = 'move';
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
    // v6: CLICK-để-đặt là CHÍNH (drag chỉ là phụ vì HTML5 drag kén trên nhiều máy).
    // Bấm thẻ để chọn (viền sáng + các ô "chờ" pulse), bấm ô để đặt.
    // FIX bug: khi 1 thẻ đang được chọn mà click TRÚNG thẻ khác đã nằm trong ô,
    // thì THẢ thẻ đang chọn vào chính ô đó (trước đây stopPropagation nuốt mất → đặt hụt).
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.miniGameLocked) return;
      const sel = state.miniSelectedChip;
      if (sel && sel !== chipId) {
        const parentBin = el.closest('.mini-bin');
        if (parentBin) {                       // click trúng thẻ đang ở trong 1 ô → thả thẻ đang chọn vào ô đó
          handleMiniDrop(sel, parentBin.dataset.binId);
          clearMiniSelection();
          return;
        }
        // click 1 thẻ khác trong pool → chuyển lựa chọn sang thẻ này (rơi xuống dưới)
      }
      const wasSel = el.classList.contains('selected');
      clearMiniSelection();
      if (wasSel) return;                       // bấm lại thẻ đang chọn = bỏ chọn
      state.miniSelectedChip = chipId;
      el.classList.add('selected');
      document.querySelectorAll('.mini-bin').forEach(b => b.classList.add('awaiting'));  // mời bấm ô
    });
  }

  window.checkMiniGame = function () {
    const mg = state.currentLesson.step_2 && state.currentLesson.step_2.mini_game;
    if (!mg || state.miniGameLocked) return;
    state.miniGameLocked = true;

    const sol = mg.solution || {};
    const placements = state.miniGamePlacements;
    const fb = document.getElementById('mini-game-feedback');
    fb.classList.remove('hidden', 'correct', 'wrong');

    let allCorrect = Object.keys(sol).length === Object.keys(placements).length;
    if (allCorrect) {
      for (const chipId in sol) {
        if (placements[chipId] !== sol[chipId]) { allCorrect = false; break; }
      }
    }

    // Color the bins
    document.querySelectorAll('.mini-bin').forEach(binEl => {
      const binId = binEl.dataset.binId;
      const chipEls = binEl.querySelectorAll('.mini-bin-chips .mini-chip');
      chipEls.forEach(chipEl => {
        const chipId = chipEl.dataset.chipId;
        // CSS classes mini-chip-correct / mini-chip-wrong replace 6 inline assignments
        // (--success-soft/--success, --danger-soft/--danger). See lesson_db_design.css.
        chipEl.classList.remove('mini-chip-correct', 'mini-chip-wrong');
        chipEl.classList.add(sol[chipId] === binId ? 'mini-chip-correct' : 'mini-chip-wrong');
      });
    });

    if (allCorrect) {
      fb.classList.add('correct');
      fb.innerHTML = '<i class="fa-solid fa-trophy"></i> Hoàn hảo! Bạn đã phân loại đúng hết. +15 XP';
      addXP(15);
      celebrate();
    } else {
      fb.classList.add('wrong');
      const correctCount = Object.keys(sol).filter(c => placements[c] === sol[c]).length;
      fb.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Đúng ${correctCount}/${Object.keys(sol).length}. Kéo/bấm thẻ đỏ sang ô khác rồi Kiểm tra lại.`;
      // UX fix: SAI thì KHÔNG khóa — người học sửa trực tiếp và Kiểm tra lại
      // (trước đây lock cứng, chỉ nút 🔄 mở được → "thẻ không tương tác được").
      state.miniGameLocked = false;
    }

    // Enable "next step" button regardless (mini-game is bonus) — label stays honest
    revealStep3Cta();
  };

  /* Reveal + honestly label the "next → Step 3" CTA.
   * Only claim "Chuẩn!" when EVERY MCQ was answered correctly AND (no mini-game OR mini-game solved).
   * Otherwise neutral "Tiếp tục" — never a false "Đúng rồi". Mini-game stays optional bonus. */
  function revealStep3Cta() {
    const btn = document.getElementById('btn-next-step3');
    if (!btn) return;
    const answers = state.mcqAnswers || [];
    const allMcqCorrect = answers.length > 0 && answers.every(a => a && a.correct);
    const perfect = allMcqCorrect && isMiniGameSolved();
    const label = btn.querySelector('.cta-label');
    const text = perfect ? 'Chuẩn! Tới Kéo Thả Logic' : 'Tiếp tục → Kéo Thả Logic';
    if (label) label.textContent = text; else btn.textContent = text;
    btn.classList.remove('hidden');
  }

  function showMCQExplain(text) {
    const el = document.getElementById('mcq-explain');
    document.getElementById('mcq-explain-text').textContent = text;
    el.classList.remove('hidden');
  }

  /* Floating tooltip on pill click — tells user which zone this block belongs to.
   * Brilliant-style: passive hint, doesn't auto-place. User must still drag. */
  function showPillHint(pill, blockType, zoneName) {
    // Remove any existing tooltip
    const existing = document.querySelector('.pill-hint-tooltip');
    if (existing) existing.remove();

    const tip = document.createElement('div');
    tip.className = 'pill-hint-tooltip';

    const typeNames = {
      'kw': 'SQL keyword',
      'col': 'tên cột',
      'tbl': 'tên bảng',
      'op': 'toán tử so sánh',
      'val': 'giá trị',
      'fn': 'hàm SQL'
    };
    const typeName = typeNames[blockType] || 'khối lệnh';

    tip.innerHTML = `
      <div class="pill-hint-row">
        <span class="pill-hint-label">Loại:</span>
        <span class="pill-hint-val">${typeName}</span>
      </div>
      <div class="pill-hint-row">
        <span class="pill-hint-label">Thuộc về:</span>
        <span class="pill-hint-val pill-hint-zone">${zoneName || 'chưa rõ'}</span>
      </div>
      <div class="pill-hint-foot">Kéo thả — không tự động đặt nhé</div>
    `;
    document.body.appendChild(tip);

    // Position above pill
    const rect = pill.getBoundingClientRect();
    tip.style.left = (rect.left + rect.width / 2) + 'px';
    tip.style.top = (rect.top - 8 + window.scrollY) + 'px';
    requestAnimationFrame(() => tip.classList.add('visible'));

    // Auto-dismiss after 2.4s or on next click anywhere
    const dismiss = () => {
      tip.classList.remove('visible');
      setTimeout(() => tip.remove(), 250);
      document.removeEventListener('click', dismiss, true);
    };
    setTimeout(dismiss, 2400);
    setTimeout(() => document.addEventListener('click', dismiss, true), 50);
  }

  /* Map zone id → friendly Vietnamese name for the pill hint tooltip */
  function zoneIdToName(zoneId, s3) {
    const map = {
      'select-line': 'SELECT (cột cần lấy)',
      'from-line': 'FROM (bảng nguồn)',
      'where-line': 'WHERE (điều kiện lọc)',
      'join-line': 'JOIN (kết bảng)',
      'on-line': 'ON (điều kiện nối)',
      'groupby-line': 'GROUP BY (nhóm)',
      'having-line': 'HAVING (lọc nhóm)',
      'orderby-line': 'ORDER BY (sắp xếp)',
      'limit-line': 'LIMIT (giới hạn)'
    };
    if (map[zoneId]) return map[zoneId];
    // Fallback to lesson config
    const z = s3.drop_zones.find(z => z.id === zoneId);
    if (z) return z.label || zoneId;
    return zoneId || null;
  }

  function bindMCQInlineHints() {
    // No-op: hints show automatically on wrong answer
    // (Reserved for future "Show Hint" button)
  }

  /* ── Hearts system (Duolingo-style) ───────────────────────────── */
  function loseHeart() {
    if (state.hearts <= 0) return;
    state.hearts--;
    updateHeartsDisplay();
    // Shake animation
    const heartsEl = document.getElementById('hearts-display');
    if (heartsEl) {
      heartsEl.classList.add('shake');
      setTimeout(() => heartsEl.classList.remove('shake'), 400);
    }
  }

  function updateHeartsDisplay() {
    const heartsEl = document.getElementById('hearts-display');
    if (!heartsEl) return;
    const icons = heartsEl.querySelectorAll('i');
    icons.forEach((icon, i) => {
      if (i >= state.hearts) {
        icon.classList.add('lost');
      } else {
        icon.classList.remove('lost');
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   * STEP 3 — Hybrid Drag-Query + Live IDE
   * ═══════════════════════════════════════════════════════════════ */
  function renderStep3() {
    const l = state.currentLesson;
    const s3 = l.step_3;

    if (!s3) {
      document.querySelector('section[data-step="3"] .split-pane').innerHTML = `
        <div style="padding:40px;color:var(--text-400);text-align:center;width:100%;">
          Nội dung kéo thả đang cập nhật.
        </div>
      `;
      return;
    }

    // Branch: flagship mechanic nếu có step_3.flagship
    if (s3.flagship) {
      renderFlagshipStep3(s3.flagship);
      return;
    }

    // Sticky mission banner — ưu tiên step_3.mission nếu có
    renderStep3Mission(l.step_1, s3);

    // Compact data preview (schema) in top of left pane
    renderStep3DataPreview(l.step_1);
    renderStep3SampleOutput(l.step_1);

    renderDropZones(s3);
    renderBlockBank(s3);
    state.step3Blocks = {};   // zoneId -> array of {token, type}
    state.step3Placed = new Set();
    state.step3History = [];
    state.step3XPAwarded = false;  // A4: reset XP guard cho Step 3 completion mới
    updateUndoButton();

    // A4: wire #ide-code (contenteditable) — paste = plain text, blur/click Run = hydrate
    var ideCodeEl = document.getElementById('ide-code');
    if (ideCodeEl && !ideCodeEl.dataset.peWired) {
      ideCodeEl.dataset.peWired = '1';
      ideCodeEl.addEventListener('paste', function(e) {
        e.preventDefault();
        var text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
      });
      ideCodeEl.addEventListener('keydown', function(e) {
        /* Tab → insert 2 spaces (giữ user quen thuộc) */
        if (e.key === 'Tab') {
          e.preventDefault();
          document.execCommand('insertText', false, '  ');
        }
      });
      /* A4: hydrate khi user click Run (hoặc blur) */
      ideCodeEl.addEventListener('blur', function() {
        var hasAny = Object.keys(state.step3Blocks || {}).some(function(k){ return (state.step3Blocks[k] || []).length > 0; });
        if (!hasAny) hydrateZonesFromTypedSQL();
        updateTruckGrid();
      });
    }
    /* A4: capture-phase click delegation on document — hydrate trước khi drag_game xử lý.
     * Dùng delegation vì .run-query-btn tạo SAU (DragGame.init chạy sau renderDropZones). */
    if (!document.body.dataset.peRunDelegation) {
      document.body.dataset.peRunDelegation = '1';
      document.body.addEventListener('click', function(e) {
        var btn = e.target.closest && e.target.closest('.run-query-btn');
        if (!btn) return;
        if (btn.disabled) {
          /* Force-enable nếu có SQL trong #ide-code (parser thành công → có blocks → state đầy đủ) */
          var ide = document.getElementById('ide-code');
          if (ide && ide.textContent.trim()) {
            btn.disabled = false;
          } else {
            return;
          }
        }
        var hasAny = Object.keys(state.step3Blocks || {}).some(function(k){ return (state.step3Blocks[k] || []).length > 0; });
        if (!hasAny) {
          var ok = hydrateZonesFromTypedSQL();
          if (ok) updateTruckGrid();
        }
      }, true);
    }

    // Build Truck Grid map (big, in bottom of left pane, always visible)
    if (window.DragGame) {
      window.DragGame.init({
        lesson: l,
        expectedSql: s3.expected_sql,
        dropZones: s3.drop_zones
      });
    }

    // Reset scroll position so user always lands on top (drop zones visible, not bank)
    const rightPane = document.querySelector('.hybrid-layout .pane-right .drag-area');
    if (rightPane) rightPane.scrollTop = 0;

    updateIDEFromBlocks();
  }

  /* ── Flagship Step 3 mechanics (6 bài đặc biệt) ─────────────────────── */
  function renderFlagshipStep3(f) {
    const splitPane = document.querySelector('section[data-step="3"] .split-pane');
    const instruction = `<div class="flagship-banner" style="background:linear-gradient(135deg,#06b6d4,#a855f7);padding:14px 18px;border-radius:10px;color:#fff;margin-bottom:16px;line-height:1.6;">
      <div style="font-size:12px;letter-spacing:1.5px;opacity:0.85;margin-bottom:4px;">🏆 FLAGSHIP MECHANIC</div>
      <div style="font-size:14px;font-weight:500;">${f.instruction || ''}</div>
    </div>`;

    // A2 fix: dispatcher pattern + auto-init DnD theo type
    if (f.type === 'match_game') {
      splitPane.innerHTML = instruction + renderFlagshipMatch(f);
      setTimeout(() => initFlagshipMatchDnD(), 100);
    } else if (f.type === 'split_game') {
      splitPane.innerHTML = instruction + renderFlagshipSplit(f);
      setTimeout(() => initFlagshipSplitDnD(), 100);
    } else if (f.type === 'bug_spot') {
      splitPane.innerHTML = instruction + renderFlagshipBugSpot(f);
      setTimeout(() => initFlagshipBugSpotDnD(), 100);
    } else if (f.type === 'join_builder') {
      splitPane.innerHTML = instruction + renderFlagshipJoin(f);
      setTimeout(() => initFlagshipJoinDnD(), 100);
    } else {
      splitPane.innerHTML = instruction + '<div>Mechanic chưa hỗ trợ.</div>';
    }
  }

  /* ── Match Game (Bài 6 — Mapping ER) ────────────────────────────────── */
  function renderFlagshipMatch(f) {
    const sortedCards = [...f.cards].sort(() => Math.random() - 0.5);
    return `
      <div class="match-game" style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px;">
        ${sortedCards.map(c => `
          <div class="match-slot" data-slot-order="${c.order}" data-card-id="${c.id}"
               style="background:rgba(6,182,212,0.08);border:2px dashed var(--primary);border-radius:8px;padding:14px 8px;text-align:center;min-height:80px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <div style="font-size:11px;color:var(--text-400);margin-bottom:6px;">Bước ${c.order}</div>
            <div class="match-card-text" style="font-size:12px;line-height:1.4;">${c.text}</div>
          </div>
        `).join('')}
      </div>
      <div class="match-bank" style="margin-top:18px;padding:14px;background:rgba(168,85,247,0.06);border:2px solid #a855f7;border-radius:8px;display:flex;flex-wrap:wrap;gap:8px;">
        ${sortedCards.map(c => `
          <div class="match-card" data-card-id="${c.id}" draggable="true"
               style="background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;padding:10px 12px;border-radius:6px;cursor:grab;font-size:12px;line-height:1.4;user-select:none;">
            ${c.text}
          </div>
        `).join('')}
      </div>
      <div style="margin-top:18px;display:flex;gap:10px;">
        <button class="btn-primary" onclick="checkFlagshipMatch()">Kiểm tra</button>
        <button class="btn-secondary" onclick="resetFlagshipMatch()">Reset</button>
        <div id="flagship-match-result" style="margin-left:auto;font-weight:600;"></div>
      </div>
    `;
  }

  /* ── Split Game (Bài 9, 12 — 2NF, 4NF) ─────────────────────────────── */
  function renderFlagshipSplit(f) {
    return `
      <div style="display:grid;grid-template-columns:1fr 1.4fr;gap:18px;margin-top:12px;">
        <div class="split-source" style="background:rgba(239,68,68,0.06);border:2px solid #ef4444;border-radius:8px;padding:14px;">
          <div style="font-size:12px;font-weight:600;color:#ef4444;margin-bottom:10px;">📦 BẢNG NGUỒN: ${f.source.name}</div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;">
            ${f.source.columns.map(c => `
              <div class="split-col" data-col-name="${c.name}" draggable="true"
                   style="background:#1f2937;border:1px solid #ef4444;border-radius:6px;padding:8px 10px;cursor:grab;font-size:12px;">
                ${c.icon} ${c.name}
              </div>
            `).join('')}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${f.targets.map(t => `
            <div class="split-target" data-target-name="${t.name}"
                 style="background:rgba(34,197,94,0.06);border:2px dashed #22c55e;border-radius:8px;padding:14px;min-height:80px;">
              <div style="font-size:12px;font-weight:600;color:#22c55e;margin-bottom:4px;">${t.icon} BẢNG ĐÍCH: ${t.name}</div>
              <div style="font-size:11px;color:var(--text-400);margin-bottom:10px;">${t.description}</div>
              <div class="split-target-chips" style="display:flex;flex-wrap:wrap;gap:6px;min-height:30px;"></div>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="margin-top:18px;display:flex;gap:10px;">
        <button class="btn-primary" onclick="checkFlagshipSplit()">Kiểm tra</button>
        <button class="btn-secondary" onclick="resetFlagshipSplit()">Reset</button>
        <button class="btn-secondary" onclick="showFlagshipSplitHint()">💡 Gợi ý</button>
        <div id="flagship-split-result" style="margin-left:auto;font-weight:600;"></div>
      </div>
    `;
  }

  /* ── Bug Spot (Bài 19, 20 — SQLi, Password) ────────────────────────── */
  function renderFlagshipBugSpot(f) {
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:12px;">
        <div class="bug-bank" style="display:flex;flex-direction:column;gap:8px;">
          ${f.chips.map(c => `
            <div class="bug-chip" data-chip-id="${c.id}" draggable="true"
                 style="background:rgba(168,85,247,0.08);border:2px solid #a855f7;border-radius:8px;padding:12px;cursor:grab;font-size:13px;line-height:1.5;font-family:'JetBrains Mono',monospace;">
              ${c.label}
            </div>
          `).join('')}
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${f.bins.map(b => `
            <div class="bug-bin" data-bin-id="${b.id}"
                 style="background:rgba(34,197,94,${b.id === 'safe' ? '0.06' : '0.06'});border:2px dashed ${b.id === 'safe' ? '#22c55e' : '#ef4444'};border-radius:8px;padding:14px;min-height:120px;">
              <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:${b.id === 'safe' ? '#22c55e' : '#ef4444'};">${b.label}</div>
              <div class="bug-bin-chips" data-bin-chips style="display:flex;flex-direction:column;gap:6px;min-height:40px;"></div>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="margin-top:18px;display:flex;gap:10px;">
        <button class="btn-primary" onclick="checkFlagshipBugSpot()">Kiểm tra</button>
        <button class="btn-secondary" onclick="resetFlagshipBugSpot()">Reset</button>
        <button class="btn-secondary" onclick="showFlagshipBugSpotHint()">💡 Gợi ý</button>
        <div id="flagship-bugspot-result" style="margin-left:auto;font-weight:600;"></div>
      </div>
    `;
  }

  /* ── Join Builder (Bài 13 — Boss Battle 4-table JOIN) ─────────────── */
  function renderFlagshipJoin(f) {
    return `
      <div style="background:rgba(6,182,212,0.04);border:1px solid rgba(6,182,212,0.2);border-radius:8px;padding:14px;margin-bottom:14px;font-size:13px;line-height:1.6;">
        <strong style="color:var(--primary);">📊 Schema:</strong>
        <code class="code">gamer(g_id PK, nickname)</code> ·
        <code class="code">inventory_bridge(g_id, game_id, purchase_date) PK composite</code> ·
        <code class="code">game(game_id PK, title, st_id)</code> ·
        <code class="code">studio(st_id PK, st_name)</code>
      </div>
      <div class="join-blocks" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;padding:10px;background:rgba(168,85,247,0.05);border-radius:6px;">
        ${[...f.blocks].sort(() => Math.random() - 0.5).map((b, i) => `
          <span class="join-block" data-block-idx="${i}" draggable="true"
                style="background:linear-gradient(135deg,#1f2937,#374151);color:#fff;padding:6px 10px;border-radius:5px;cursor:grab;font-family:'JetBrains Mono',monospace;font-size:11px;border:1px solid rgba(255,255,255,0.1);">${b.token}</span>
        `).join('')}
      </div>
      <div class="join-target" id="join-target"
           style="background:#0a0e1a;border:1px solid rgba(6,182,212,0.3);border-radius:8px;padding:18px;min-height:140px;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:2;color:#cbd5e1;display:flex;flex-wrap:wrap;gap:4px;align-content:flex-start;">
        <span style="color:var(--text-400);font-size:12px;">↓ Kéo các thẻ SQL vào đây theo đúng thứ tự...</span>
      </div>
      <div style="margin-top:18px;display:flex;gap:10px;">
        <button class="btn-primary" onclick="checkFlagshipJoin()">Kiểm tra</button>
        <button class="btn-secondary" onclick="resetFlagshipJoin()">Reset</button>
        <div id="flagship-join-result" style="margin-left:auto;font-weight:600;"></div>
      </div>
    `;
  }

  // Per-zone inline hints — short text under each drop zone telling user what to drag
  // Zone IDs are like 'select-line', 'from-line', 'where-line' (strip -line to match)
  const ZONE_HINTS = {
    select:   { arrow: '←', pre: 'chọn cột ',  keys: ['name', 'price'], sep: ', ' },
    from:     { arrow: '←', pre: 'từ bảng ',   table: 'game_catalog' },
    where:    { arrow: '←', pre: 'lọc theo ',  col: 'id', op: '=', val: '101' },
    group_by: { arrow: '←', pre: 'gom nhóm ',  keys: ['genre'], sep: '' },
    having:   { arrow: '←', pre: 'lọc nhóm ',  col: 'COUNT(*)', op: '>', val: '1' },
    order_by: { arrow: '←', pre: 'sắp xếp ',   keys: ['price'], sep: '' },
    limit:    { arrow: '←', pre: 'giới hạn ',  val: '5' },
    insert_into: { arrow: '←', pre: 'chèn vào ', table: 'game_catalog' },
    values:   { arrow: '←', pre: 'dữ liệu: ', val: '(...)' },
    set:      { arrow: '←', pre: 'cập nhật: ', col: 'price', op: '=', val: '70' },
    delete_from: { arrow: '←', pre: 'xóa từ ', table: 'game_catalog' },
    update:   { arrow: '←', pre: 'cập nhật ',  table: 'game_catalog' },
  };

  function getZoneHintHtml(zoneId, zone) {
    // Strip -line suffix to match hint keys
    const key = zoneId.replace(/-line$/, '');
    const hint = ZONE_HINTS[key];
    if (!hint) return '';
    let html = `<span class="hint-arrow">${hint.arrow}</span> ${hint.pre}`;
    if (hint.keys) {
      const parts = hint.keys.map(k => `<span class="hint-key">${k}</span>`).join(hint.sep || '');
      html += parts;
    } else if (hint.table) {
      html += `<span class="hint-table">${hint.table}</span>`;
    } else if (hint.col && hint.val) {
      html += `<span class="hint-col">${hint.col}</span> <span class="hint-key">${hint.op}</span> <span class="hint-key">${hint.val}</span>`;
    } else if (hint.val) {
      html += `<span class="hint-key">${hint.val}</span>`;
    }
    return `<div class="zone-sample-hint" data-zone-hint="${zoneId}">${html}</div>`;
  }

  function renderDropZones(s3) {
    const stack = document.getElementById('drop-zones');
    stack.innerHTML = '';

    s3.drop_zones.forEach((zone, idx) => {
      const pos = idx + 1;  /* 1-based numbering — NUMBERED LINES per v6.2 §4C */
      const line = document.createElement('div');
      line.className = 'drop-line';
      line.dataset.zone = zone.id;
      line.dataset.zonePosition = pos;  /* Q3=C — visually chỉ số, JS sees attribute too */
      /* v6.2 numbered lines:
       * - Always show number prefix (Q2=A).
       * - Generic prompt "Kéo mệnh đề vào đây" — KHÔNG SELECT/FROM/WHERE (no spoiler).
       * - Slot starts empty; pills append on drag.
       * - KEEP data-slot="<id>" — JS uses querySelector('[data-slot="<id>"]') at line 1926, 2127. */
      line.innerHTML = `
        <span class="drop-line-num">${pos}.</span>
        <span class="drop-line-prompt">Kéo mệnh đề vào đây…</span>
        <span class="drop-line-slot" data-slot="${zone.id}"></span>
        <span class="broken-tooltip" data-broken-tooltip="${zone.id}">⚠️ Thứ tự chưa đúng — thử kéo swap trong slot</span>
      `;

      line.addEventListener('dragover', e => {
        e.preventDefault();
        line.classList.add('drag-over');
      });
      line.addEventListener('dragleave', () => line.classList.remove('drag-over'));
      line.addEventListener('drop', e => {
        e.preventDefault();
        line.classList.remove('drag-over');
        /* v3 redesign: use unified handler that supports both bank pills
           (token-only payload) and placed pills (__MOVE__:... payload).
           Drop on empty slot area → append at end. */
        const payload = e.dataTransfer.getData('text/plain');
        handleZoneOrPillDrop(zone.id, payload, null);
      });

      stack.appendChild(line);
      /* v6.2 STEP 2a FIX-1: REMOVED inline zone hints (CRITICAL anti-spoiler).
       * "chọn cột", "từ bảng game_catalog", "lọc theo id = 101" → VẪN SPOILER.
       * Brilliant pattern: hint chỉ qua nút "Xem gợi ý" (progressive, user chủ động).
       * getZoneHintHtml() vẫn còn để fallback / debug; chỉ drop call site. */
    });
  }

  function renderBlockBank(s3) {
    const bank = document.getElementById('block-bank');
    bank.innerHTML = '';

    // Shuffle blocks randomly per load (Fisher-Yates) so user can't memorize order
    const shuffled = [...s3.blocks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    shuffled.forEach(b => {
      const pill = document.createElement('div');
      pill.className = `logic-pill pill-${b.type}`;
      pill.textContent = b.token;
      pill.draggable = true;
      pill.dataset.type = b.type;
      pill.dataset.token = b.token;
      pill.dataset.slot = b.slot;

      // NO color anchor dot — pills are fully neutral (user-requested redesign).
      // User must figure out where each block goes by reasoning, not by matching colors.
      // Only a subtle border-left per type (kw/col/tbl/op/val) hints at "loại dữ liệu",
      // not at "zone đích". See CSS .logic-pill.pill-* rules.

      // Click = "where does this go?" — show a small floating tooltip near the pill
      // with the target zone name. Brilliant-style: passive hint, doesn't auto-place.
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const zoneId = slotToZone(b.slot, s3);
        const zoneName = zoneIdToName(zoneId, s3);
        showPillHint(pill, b.type, zoneName);
      });

      // Drag = the ONLY way to place. v4 FIX: KHÔNG sáng "zone đáp án" của block khi cầm lên
      // (đó là spoiler lộ đáp án). Chỉ giữ visual .dragging trên chính pill.
      pill.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', b.token);
        e.dataTransfer.effectAllowed = 'move';
        pill.classList.add('dragging'); // 4.4 pill drag-start visual
      });
      pill.addEventListener('dragend', () => {
        pill.classList.remove('dragging'); // 4.4 pill drag-end cleanup
        document.querySelectorAll('.drop-line.drag-target-hint')
          .forEach(el => el.classList.remove('drag-target-hint'));
      });

      bank.appendChild(pill);
    });

    // Make bank a drop target so user can drag placed pills back here to remove
    bank.addEventListener('dragover', e => {
      const data = e.dataTransfer.types.includes('text/plain');
      if (data) {
        e.preventDefault();
        bank.classList.add('drag-over');
      }
    });
    bank.addEventListener('dragleave', e => {
      if (e.target === bank) bank.classList.remove('drag-over');
    });
    bank.addEventListener('drop', e => {
      e.preventDefault();
      bank.classList.remove('drag-over');
      /* v3 redesign: payload is __MOVE__:zoneId:token now.
         Dragging a placed pill to the bank = remove from zone. */
      const payload = e.dataTransfer.getData('text/plain');
      if (payload && payload.startsWith('__MOVE__:')) {
        const parts = payload.split(':');
        const zoneId = parts[1];
        const token = parts[2];
        removeBlockFromZone(zoneId, token);
      }
    });
  }

  /** Remove a placed block from a drop-zone (drag-back-to-bank flow) */
  function removeBlockFromZone(zoneId, token) {
    const arr = state.step3Blocks[zoneId];
    if (!arr) return;
    const idx = arr.findIndex(b => b.token === token);
    if (idx < 0) return;
    arr.splice(idx, 1);
    state.step3Placed.delete(token);

    // Re-enable bank pill
    document.querySelectorAll(`#block-bank .logic-pill[data-token="${token}"]`)
      .forEach(p => p.classList.remove('locked'));

    // Re-render the slot cleanly
    renderZone(zoneId, null);
    updateIDEFromBlocks();
  }

  function renderStep3Mission(s1, s3) {
    const el = document.getElementById('step3-mission-text');
    if (!el) return;
    el.innerHTML = (s3 && s3.mission) || s1.mission || 'Kéo thả các khối lệnh vào drop-zone để xây dựng câu SQL.';
  }

  // Sample output panel — show 2-3 rows from data_preview so user knows what the SQL should produce
  function renderStep3SampleOutput(s1) {
    const wrap = document.getElementById('step3-sample-rows');
    if (!wrap) return;
    const schema = s1 && s1.visual && s1.visual.schema;
    const rows = s1 && s1.visual && Array.isArray(s1.visual.data_preview) ? s1.visual.data_preview : [];
    if (!schema || !schema.columns || schema.columns.length === 0 || rows.length === 0) {
      wrap.innerHTML = '<div class="sample-empty">Chưa có dữ liệu mẫu.</div>';
      return;
    }
    const cols = schema.columns;
    const header = '<div class="sample-row header">' +
      cols.map(c => `<span class="sample-cell${c.key === 'PK' ? ' pk' : ''}">${c.name}</span>`).join('') +
      '</div>';
    const body = rows.slice(0, 3).map(r =>
      '<div class="sample-row">' +
      r.map((cell, i) => `<span class="sample-cell${cols[i] && cols[i].key === 'PK' ? ' pk' : ''}">${cell}</span>`).join('') +
      '</div>'
    ).join('');
    wrap.innerHTML = header + body;
  }

  // Populate compact schema preview in top of left pane (Step 3)
  // Reads step_1.visual.schema (already used by Step 1's visual-db).
  function renderStep3DataPreview(s1) {
    const el = document.getElementById('step3-data-content');
    if (!el) return;
    const schema = s1 && s1.visual && s1.visual.schema;
    if (!schema || !Array.isArray(schema.columns) || schema.columns.length === 0) {
      el.innerHTML = '<div class="data-preview-empty">Không có schema cho bài này.</div>';
      return;
    }
    const name = schema.table_name || 'table';
    const cols = schema.columns.map(c => {
      const pk = c.key === 'PK' ? 'pk' : '';
      return `<div class="dp-col ${pk}">
        <span class="dp-col-name">${pk ? '🔑 ' : ''}${c.name}</span>
        <span class="dp-col-type">${c.type || ''}</span>
      </div>`;
    }).join('');
    el.innerHTML = `
      <div class="dp-table">
        <div class="dp-table-name"><i class="fa-solid fa-table"></i> ${name}</div>
        <div class="dp-cols">${cols}</div>
      </div>
    `;
  }

  /** Map block.slot hint → drop zone id. Falls back to first non-keyword zone for keywords. */
  function slotToZone(slot, s3) {
    const map = {
      'kw-select': 'select-line',
      'kw-from': 'from-line',
      'kw-where': 'where-line',
      'kw-join': 'from-line',
      'kw-on': 'from-line',
      'kw-and': 'where-line',
      'kw-or': 'where-line',
      'col-1': 'select-line',
      'col-2': 'select-line',
      'col-3': 'select-line',
      'col-4': 'select-line',
      'col-on': 'from-line',
      'col-on2': 'from-line',
      'tbl': 'from-line',
      'tbl2': 'from-line',
      'tbl3': 'from-line',
      'wcol': 'where-line',
      'wcol-1': 'where-line',
      'wcol-2': 'where-line',
      'op': 'where-line',
      'op-1': 'where-line',
      'op-2': 'where-line',
      'val': 'where-line',
      'val-1': 'where-line',
      'val-2': 'where-line'
    };
    if (map[slot]) return map[slot];

    // Keyword → first zone that hasn't been started
    // Other → last zone with a keyword block
    if (slot && slot.startsWith('kw-')) {
      return s3.drop_zones.find(z => !state.step3Blocks[z.id] || state.step3Blocks[z.id].length === 0)?.id;
    }
    // For non-keywords, append to last zone with content
    for (let i = s3.drop_zones.length - 1; i >= 0; i--) {
      const zid = s3.drop_zones[i].id;
      if (state.step3Blocks[zid] && state.step3Blocks[zid].length > 0) {
        return zid;
      }
    }
    return s3.drop_zones[0].id;
  }

  /** Color for the anchor dot on bank pills and the matching zone border.
   *  Must match the --zone-color values in lesson_db_design.css. */
  const ZONE_COLORS = {
    'select-line': '#06B6D4',
    'from-line': '#F59E0B',
    'join-line': '#F59E0B',
    'on-line': '#A855F7',
    'where-line': '#10B981',
    'groupby-line': '#8B5CF6',
    'having-line': '#14B8A6',
    'orderby-line': '#EC4899',
    'limit-line': '#FBBF24'
  };

  /** Re-render a drop-zone slot from state.step3Blocks[zoneId].
   *  Each placed pill is BOTH draggable (to swap/move/remove) AND a drop
   *  target (for in-slot drag-to-swap UX). The payload encodes intent:
   *    '__MOVE__:fromZone:token'  → user dragged from this zone (move/swap/remove)
   *    'token'                    → user dragged from bank (place new)
   */
  function renderZone(zoneId, slotEl) {
    if (!slotEl) slotEl = document.querySelector(`[data-slot="${zoneId}"]`);
    if (!slotEl) return;
    const arr = state.step3Blocks[zoneId] || [];
    slotEl.innerHTML = '';
    if (arr.length === 0) {
      const zDef = state.currentLesson.step_3.drop_zones.find(z => z.id === zoneId);
      slotEl.innerHTML = zDef ? (zDef.placeholder.split(' ').slice(1).join(' ') || '...') : '...';
      slotEl.classList.remove('filled');
      slotEl.classList.remove('has-content');  /* v6.2 STAGE 2a-2 FIX-9: JS toggle bulletproof */
      return;
    }
    slotEl.classList.add('filled');
    slotEl.classList.add('has-content');  /* v6.2 STAGE 2a-2 FIX-9 */
    arr.forEach((b, i) => {
      if (i > 0) slotEl.appendChild(document.createTextNode(' '));
      const np = document.createElement('span');
      np.className = `logic-pill pill-${b.type}`;
      np.textContent = b.token;
      np.dataset.token = b.token;
      np.dataset.type = b.type;
      np.dataset.zoneId = zoneId;
      np.dataset.zoneIdx = i;
      np.draggable = true;

      /* Drag start — payload indicates "moving this pill from this zone" */
      np.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', '__MOVE__:' + zoneId + ':' + b.token);
        e.dataTransfer.effectAllowed = 'move';
        np.classList.add('dragging-back');
      });
      np.addEventListener('dragend', () => np.classList.remove('dragging-back'));

      /* Drop target — let user drop on a pill to swap (same zone) or
         move (different zone). The pill-level handler runs BEFORE the
         slot-level one because we call stopPropagation below. */
      np.addEventListener('dragover', e => {
        e.preventDefault();
        np.classList.add('swap-target');
      });
      np.addEventListener('dragleave', () => np.classList.remove('swap-target'));
      np.addEventListener('drop', e => {
        e.preventDefault();
        e.stopPropagation();
        np.classList.remove('swap-target');
        const payload = e.dataTransfer.getData('text/plain');
        handleZoneOrPillDrop(zoneId, payload, np);
      });

      slotEl.appendChild(np);
    });
  }

  /* Unified drop handler — called from BOTH the slot's drop listener AND
     each pill's drop listener. Determines intent from payload:
       • 'token'                  → from bank, place new
       • '__MOVE__:from:token'    → from another zone, move (or swap if same zone)
     `targetEl` (optional) is the specific pill that received the drop, used
     to determine where in the zone the moved/placed pill should be inserted. */
  function handleZoneOrPillDrop(toZoneId, payload, targetEl) {
    if (!payload) return;

    let fromZoneId = null;
    let token;

    if (payload.startsWith('__MOVE__:')) {
      const parts = payload.split(':');
      fromZoneId = parts[1];
      token = parts[2];
    } else {
      token = payload;
    }

    /* Determine insertion index — where in the zone does this go?
     * -1 means "append at end". A target pill means "insert before it". */
    let insertIdx = -1;
    if (targetEl && targetEl.classList && targetEl.classList.contains('logic-pill')) {
      const targetToken = targetEl.dataset.token;
      const arr = state.step3Blocks[toZoneId] || [];
      insertIdx = arr.findIndex(b => b.token === targetToken);
      if (insertIdx < 0) insertIdx = -1;
    }

    if (fromZoneId) {
      moveBlockBetweenZones(fromZoneId, toZoneId, token, insertIdx);
    } else {
      placeFromBankAtPosition(toZoneId, token, insertIdx);
    }
  }

  /* Move a placed pill from one zone to another (or swap positions within
     the same zone). insertIdx = -1 means append at end.

     Swap semantics (SAME zone, drop onto another pill):
       True swap — the dragged pill takes the target's position, and the
       target pill takes the dragged pill's ORIGINAL position. This is
       what users expect when they drag-drop within a list to reorder.

       Concrete trace for [WHERE, id, =, 101] with drag 101 (idx 3) onto id (idx 1):
         arr[3] ↔ arr[1]  →  [WHERE, 101, =, id] ✓

     Cross-zone (different from/to zones):
       Just move — source goes to target zone at insertIdx, source zone
       loses the block. Target pill (if any) stays at its position (the
       source is inserted BEFORE the target).
  */
  function moveBlockBetweenZones(fromZone, toZone, token, insertIdx) {
    const fromArr = state.step3Blocks[fromZone];
    if (!fromArr) return;
    const srcIdx = fromArr.findIndex(b => b.token === token);
    if (srcIdx < 0) return;

    /* ── Cross-zone: simple move ─────────────────────────── */
    if (fromZone !== toZone) {
      const [block] = fromArr.splice(srcIdx, 1);
      if (!state.step3Blocks[toZone]) state.step3Blocks[toZone] = [];
      const toArr = state.step3Blocks[toZone];

      if (insertIdx < 0 || insertIdx > toArr.length) {
        toArr.push(block);
      } else {
        toArr.splice(insertIdx, 0, block);
      }

      renderZone(fromZone, null);
      renderZone(toZone, null);
      updateIDEFromBlocks();
      return;
    }

    /* ── Same zone: true swap ────────────────────────────── */
    /* No-op if drop would be at end (-1) or onto self */
    if (insertIdx < 0 || srcIdx === insertIdx) return;

    /* True swap — both pills exchange positions, others unaffected */
    const tmp = fromArr[srcIdx];
    fromArr[srcIdx] = fromArr[insertIdx];
    fromArr[insertIdx] = tmp;

    renderZone(toZone, null);
    updateIDEFromBlocks();
  }

  /* Place a bank pill into a zone at a specific position. Used for both
     append-at-end (insertIdx=-1) and insert-before-target-pill cases. */
  function placeFromBankAtPosition(zoneId, token, insertIdx) {
    const pill = Array.from(document.querySelectorAll('#block-bank .logic-pill'))
      .find(p => p.dataset.token === token);
    if (!pill) return;

    /* v6.1 PHASE A — FREE DRAG: REMOVE all block-type / keyword validation.
       Mọi block được kéo vào mọi zone. Validation chỉ xảy ra khi bấm ▶ Chạy Query
       (trong executeStation()). User tự do thử sai → truck chạy → user THẤY tại sao sai.
       Đây là fix cho v5 lỗi "drag bị chặn đỏ". */
    const s3 = state.currentLesson.step_3;
    const blockDef = s3.blocks.find(b => b.token === token);
    const zone = s3.drop_zones.find(z => z.id === zoneId);
    if (!blockDef || !zone) return;

    pill.classList.add('locked');

    const newBlock = { token: pill.dataset.token, type: pill.dataset.type };
    if (!state.step3Blocks[zoneId]) state.step3Blocks[zoneId] = [];
    const arr = state.step3Blocks[zoneId];

    if (insertIdx < 0 || insertIdx > arr.length) {
      arr.push(newBlock);
    } else {
      arr.splice(insertIdx, 0, newBlock);
    }
    state.step3Placed.add(pill.dataset.token);

    renderZone(zoneId, null);
    updateIDEFromBlocks();

    // 4.5 Drop zone accept flash — green flash 240ms when a block lands in a zone
    const zoneEl = document.querySelector(`.drop-line[data-zone="${zoneId}"]`);
    if (zoneEl) {
      zoneEl.classList.add('zone-accepted');
      setTimeout(() => zoneEl.classList.remove('zone-accepted'), 240);
    }
    // CHANGE 3: SQL block-snap satisfying animation on the placed pill
    if (zoneEl) {
      const lastPill = zoneEl.querySelector('.placed-pill:last-child');
      if (lastPill) {
        lastPill.classList.add('block-just-snapped');
        setTimeout(() => lastPill.classList.remove('block-just-snapped'), 400);
      }
    }
  }

  // (Undo removed — use drag-back to bank to remove individual blocks,
  //  or click Reset to clear everything.)

  window.handleDragReset = function () {
    if (!state.currentLesson) return;
    state.step3Blocks = {};
    state.step3Placed = new Set();
    state.step3History = [];
    // Re-enable all pills
    document.querySelectorAll('#block-bank .logic-pill').forEach(p => p.classList.remove('locked'));
    // Re-render all zones
    const s3 = state.currentLesson.step_3;
    s3.drop_zones.forEach(zone => {
      const slotEl = document.querySelector(`[data-slot="${zone.id}"]`);
      if (slotEl) {
        slotEl.innerHTML = zone.placeholder.split(' ').slice(1).join(' ') || '...';
        slotEl.classList.remove('filled');
      }
    });
    // FIX 4 v3 (2026-06-29): reset state border + pill on drag reset (Brilliant pattern)
    const wrapper = document.querySelector('[data-step3-wrapper]');
    if (wrapper) wrapper.classList.remove('step3-state-correct', 'step3-state-wrong');
    hidePillBadge();
    updateIDEFromBlocks();
    if (window.DragGame) window.DragGame.reset();
  };

  // No-op stub (kept for backwards compat — undo button was removed from HTML)
  function updateUndoButton() { /* no-op */ }

  function updateIDEFromBlocks() {
    const s3 = state.currentLesson.step_3;
    if (!s3) return;

    // Build SQL in canonical order, preserving zone order then within-zone order.
    // Auto-insert comma between two consecutive column-type tokens in the same zone
    // (e.g. SELECT name, price) — matches natural SQL convention.
    const parts = [];
    s3.drop_zones.forEach(zone => {
      const blocks = state.step3Blocks[zone.id];
      if (!blocks || !blocks.length) return;

      blocks.forEach((b, idx) => {
        parts.push(b.token);
        // Comma only between two value-type tokens in the SELECT clause
        // (col,col / col,fn / fn,col). Skip between value and operator (col,op / op,val).
        if (idx < blocks.length - 1) {
          const next = blocks[idx + 1];
          const isValueType = t => t === 'col' || t === 'fn' || t === 'val';
          if (isValueType(b.type) && isValueType(next.type)) {
            parts.push(',');
          }
        }
      });
    });

    const sql = parts.join(' ').trim().replace(/\s+,/g, ',');
    const ideCode = document.getElementById('ide-code');
    if (ideCode) ideCode.innerHTML = highlightSQL(sql);
    const ideCharCount = document.getElementById('ide-char-count');
    if (ideCharCount) ideCharCount.textContent = `${sql.length} ký tự`;
    if (document.getElementById('ide-line-numbers')) {
      renderLineNumbers(Math.max(1, sql.split('\n').length));
    }

    // ── Drive Truck Grid animation in right pane ────────────────
    updateTruckGrid();

    // ── Apply "broken" subtle warning if SQL is invalid ─────────
    applyBrokenState(sql, s3);

    updateRevealHint();

    // FIX 4 v3 (2026-06-29): Toggle whole-exercise state border + pill badge.
    // Brilliant-inspired: user nhìn 1 giây biết đúng/sai qua border color.
    updateStep3ExerciseState();
  }

  /* FIX 4 v3 — Toggle .step3-state-correct / .step3-state-wrong trên wrapper
     + show/hide pill badge (Brilliant-inspired whole-exercise feedback).
     Called from updateIDEFromBlocks() mỗi lần block thay đổi.
     CSS: .step3-exercise.step3-state-{correct,wrong} → 2px border + box-shadow glow.
     CSS: .step3-pill-badge.is-{correct,wrong} → success/warning pill. */
  function updateStep3ExerciseState() {
    const wrapper = document.querySelector('[data-step3-wrapper]');
    if (!wrapper) return;

    const s3 = state.currentLesson && state.currentLesson.step_3;
    if (!s3 || !s3.expected_sql) {
      hidePillBadge();
      wrapper.classList.remove('step3-state-correct', 'step3-state-wrong');
      return;
    }

    const totalBlocks = Object.values(state.step3Blocks).reduce((s, a) => s + a.length, 0);
    const totalAvailable = (s3.blocks || []).length;
    const allPlaced = totalBlocks === totalAvailable && totalBlocks > 0;

    // Build current SQL from placed blocks (canonical zone order, with comma between value types)
    const parts = [];
    s3.drop_zones.forEach(zone => {
      const blocks = state.step3Blocks[zone.id];
      if (!blocks || !blocks.length) return;
      blocks.forEach((b, idx) => {
        parts.push(b.token);
        if (idx < blocks.length - 1) {
          const next = blocks[idx + 1];
          const isValueType = t => t === 'col' || t === 'fn' || t === 'val';
          if (isValueType(b.type) && isValueType(next.type)) parts.push(',');
        }
      });
    });
    const builtSQL = parts.join(' ').trim().replace(/\s+,/g, ',');
    const expected = (s3.expected_sql || '').replace(/;$/, '').trim().replace(/\s+/g, ' ');
    const isMatch = builtSQL.toUpperCase() === expected.toUpperCase();

    // v4 FIX: KHÔNG chấm đúng/sai TRƯỚC khi Run. Người học build tự do; bấm "Chạy Query"
    // mới phán xử (pipeline chạy → feedback pill). Bỏ auto-báo-sai + badge lởn vởn.
    wrapper.classList.remove('step3-state-correct', 'step3-state-wrong');
    hidePillBadge();
    void allPlaced; void isMatch; // giữ tính toán ở trên cho backward-safe, không dùng để chấm
  }

  /* FIX 4 v3 — Show success/warning pill badge trong .step3-exercise wrapper */
  function showPillBadge(kind, text) {
    let badge = document.getElementById('step3-pill-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'step3-pill-badge';
      const wrapper = document.querySelector('[data-step3-wrapper]');
      if (!wrapper) return;
      wrapper.appendChild(badge);
    }
    badge.className = 'step3-pill-badge is-visible is-' + kind;
    const icon = kind === 'correct' ? 'fa-circle-check' : 'fa-circle-exclamation';
    badge.innerHTML = '<i class="fa-solid ' + icon + '"></i><span>' + text + '</span>';
  }

  /* FIX 4 v3 — Hide pill badge */
  function hidePillBadge() {
    const badge = document.getElementById('step3-pill-badge');
    if (badge) badge.classList.remove('is-visible');
  }

  /* v3 redesign: Subtle "broken" feedback when user has placed all blocks
   * but the order is wrong (SQL doesn't match expected). The slot gets a
   * yellow tint + tooltip suggesting they swap order. No shake, no red —
   * gentle nudge that respects the user's effort.
   */
  function applyBrokenState(builtSql, s3) {
    /* v4 FIX: KHÔNG tự chấm "sai vị trí" trước khi người học bấm Chạy — chỉ dọn class .broken cũ.
       (Trước đây: kéo đủ block là auto-báo sai + zone co lại → gây khó chịu, spoiler.)
       Run mới là trọng tài (drag_game.runQuery → finishExecution). */
    if (!s3 || !s3.drop_zones) return;
    s3.drop_zones.forEach(zone => {
      const lineEl = document.querySelector(`.drop-line[data-zone="${zone.id}"]`);
      if (lineEl) lineEl.classList.remove('broken');
    });
  }

  /* ═════════════════════════════════════════════════════════════════════
   * 4A-E2 HELPERS — engine SQL mở rộng (GROUP BY/aggregate/HAVING/ORDER/LIMIT).
   * Đặt TRƯỚC parser để parser reference.
   * ═════════════════════════════════════════════════════════════════════ */

  /* scanUnsupportedTokens — detect E3-scope clauses (IN-subquery / CASE / ->> / %s / ST_* / ORM).
   * Trả về {unsupported, kw} để PE_runSQL raise honest-error KHÔNG đổ-lỗi-user
   * (per Q5 chốt: '⚙ Bảng kết quả đang được hoàn thiện (E3) — đáp án của bạn ĐÚNG.').
   *
   * Phải chạy TRƯỚC parser — parser chưa xử lý nested parens (IN-subquery) sẽ trip nhầm,
   * và ORM (LogEvent.objects...) không bắt đầu "SELECT" nên parser fail. */
  function scanUnsupportedTokens(sqlText) {
    // M4-TC 2026-07-04: strip comment "--" trước khi scan — comment không cần engine hỗ trợ,
    // và text như "-- update like_count" không được kích hoạt nhầm check DML bên dưới.
    var t = String(sqlText || '').toLowerCase().replace(/--[^\n]*/g, ' ');
    // M4-TC: DDL/DML/CTE của khóa TC (procedure/trigger/recursive) — hợp lệ nhưng engine demo
    // không mô phỏng → pending neutral; validateSQL vẫn chấm đúng/sai khi Run/Submit.
    var reChecks = [
      { re: /\bcreate\s+(?:or\s+replace\s+)?function\b/,  label: 'CREATE FUNCTION (DDL)' },
      { re: /\bcreate\s+(?:or\s+replace\s+)?procedure\b/, label: 'CREATE PROCEDURE (DDL)' },
      { re: /\bcreate\s+(?:or\s+replace\s+)?trigger\b/,   label: 'CREATE TRIGGER (DDL)' },
      { re: /\bwith\s+recursive\b/,                        label: 'WITH RECURSIVE (đệ quy)' },
      { re: /^\s*update\b/m,  label: 'UPDATE (DML)' },
      { re: /^\s*delete\b/m,  label: 'DELETE (DML)' },
      { re: /^\s*call\b/m,    label: 'CALL procedure' },
      // M5-TC 2026-07-04: probe thực tế cho thấy engine KHÔNG lỗi với ROLLUP mà trả kết quả
      // SAI im lặng (gộp hết nhóm) — nguy hiểm hơn error → bắt buộc chặn thành pending.
      { re: /\brollup\s*\(|\bcube\s*\(|\bgrouping\s+sets\b/, label: 'ROLLUP/CUBE (subtotal)' },
      // M6-TC 2026-07-05: tc_16/tc_19 chấm CREATE INDEX exact-match (DDL-head guard) —
      // engine không mô phỏng DDL → pending neutral như FUNCTION/PROCEDURE/TRIGGER.
      { re: /\bcreate\s+(?:unique\s+)?index\b/, label: 'CREATE INDEX (DDL)' },
      // M6-TC 2026-07-05: probe t5 (probe_engine_m6b) — WHERE UPPER(col)='X' engine trả bảng
      // SAI im lặng (predicate bị bỏ qua, lấy mọi dòng) → chặn pending như vụ ROLLUP.
      { re: /\bupper\s*\(|\blower\s*\(/, label: 'hàm UPPER/LOWER( )' },
      { re: /\bdb\.\w+\.(find|aggregate|insert\w*|update\w*|count)\s*\(/, label: 'MongoDB query' }
    ];
    for (var ri = 0; ri < reChecks.length; ri++) {
      if (reChecks[ri].re.test(t)) return { unsupported: true, kw: reChecks[ri].label };
    }
    var checks = [
      { kw: '.objects.', label: 'Django ORM' },           /* ORM không phải SQL — ngay cả khi không có aggregate, parser cũng fail vì "LogEvent.objects..." không bắt đầu SELECT */
      /* 4A-E3-engine: 3 entries removed — engine-thật Bài 9/15/20 handle these:
       *   - ' in (' (Bài 9 IN-subquery)
       *   - 'case '  (Bài 20 CASE WHEN)
       *   - '->>'    (Bài 15 JSON path)
       * Phase4-E3-equiv sẽ xử ORM/%s/spatial (Bài 17/19/16). */
      { kw: '%s',        label: 'Python placeholder %s' },
      { kw: 'st_dwithin',  label: 'spatial ST_DWithin' },
      { kw: 'st_makepoint', label: 'spatial ST_MakePoint' }
    ];
    for (var ci = 0; ci < checks.length; ci++) {
      if (t.indexOf(checks[ci].kw) >= 0) return { unsupported: true, kw: checks[ci].label };
    }
    return { unsupported: false };
  }

  /* evalSqlExpr — recursive evaluator cho + - * / giữa column-refs và literals.
   * Hỗ trợ + - * / với precedence (* / > + -), parens, identifiers có dot (table.col). */
  function evalSqlExpr(row, expr) {
    expr = String(expr || '').trim();
    if (!expr) return null;
    function toNumber(v) {
      if (v === null || v === undefined || v === '') return 0;
      var n = Number(v);
      return isNaN(n) ? 0 : n;
    }
    function getCell(r, ref) {
      var trimmed = String(ref || '').trim();
      if (r[trimmed] !== undefined) return r[trimmed];
      var dotIdx = trimmed.indexOf('.');
      if (dotIdx >= 0 && r[trimmed.substring(dotIdx + 1)] !== undefined) {
        return r[trimmed.substring(dotIdx + 1)];
      }
      return undefined;
    }
      function parseFactor(s) {
        s = s.trim();
        if (!s) return null;
        if (s.charAt(0) === '(' && s.charAt(s.length - 1) === ')') {
          return evalSqlExpr(row, s.substring(1, s.length - 1));
        }
        if (/^-?[0-9]+(?:\.[0-9]+)?$/.test(s)) return parseFloat(s);
        /* 4A-E2-fix Bài 2: EXTRACT(YEAR FROM CURRENT_DATE) — derived column "age"
         * = currentYear - birth_year. Dynamic year (per user chốt), no hardcode. */
        var extractMatch = /^\s*extract\s*\(\s*year\s+from\s+(?:current_date|current\s+timestamp)\s*\)\s*$/i.exec(s);
        if (extractMatch) return new Date().getFullYear();
        if (/^-?[\w.]+$/.test(s)) {
          var v = getCell(row, s);
          return v === undefined ? 0 : toNumber(v);
        }
        return null;
      }
    function splitByOuterOps(s, ops) {
      var parts = ['']; var i = 0; var depth = 0;
      while (i < s.length) {
        var ch = s.charAt(i);
        if (ch === '(') { depth++; parts[parts.length - 1] += ch; }
        else if (ch === ')') { depth--; parts[parts.length - 1] += ch; }
        else if (depth === 0 && ops.indexOf(ch) >= 0) {
          parts.push(ch); parts.push('');
        } else {
          parts[parts.length - 1] += ch;
        }
        i++;
      }
      return parts;
    }
    function parseMulDiv(s) {
      var parts = splitByOuterOps(s, '*/');
      var result = parseFactor(parts[0]);
      for (var pi = 1; pi < parts.length; pi += 2) {
        if (result === null) return null;
        var op = parts[pi]; var rhs = parseFactor(parts[pi + 1]);
        if (rhs === null) return null;
        result = (op === '*') ? result * rhs : (rhs === 0 ? 0 : result / rhs);
      }
      return result;
    }
    function parseAddSub(s) {
      var parts = splitByOuterOps(s, '+-');
      var result = parseMulDiv(parts[0]);
      for (var pi2 = 1; pi2 < parts.length; pi2 += 2) {
        if (result === null) return null;
        var op2 = parts[pi2]; var rhs2 = parseMulDiv(parts[pi2 + 1]);
        if (rhs2 === null) return null;
        result = (op2 === '+') ? result + rhs2 : result - rhs2;
      }
      return result;
    }
    return parseAddSub(expr);
  }

  /* detectAggregate — parse "COUNT(*)" / "SUM(expr)" / "AVG(expr)" / "MIN(expr)" / "MAX(expr)" + optional AS alias.
   * Returns {fn, expr, alias} or null nếu không match. */
  function detectAggregate(token) {
    var trimmed = String(token || '').trim();
    var m = /^\s*(count|sum|avg|min|max)\s*\((.*)\)\s*(?:\s+as\s+(\w+))?\s*$/i.exec(trimmed);
    if (!m) return null;
    return { fn: m[1].toLowerCase(), expr: m[2].trim(), alias: m[3] || null };
  }

  /* parseGroupByCols — split by comma, trim, drop empties. */
  function parseGroupByCols(str) {
    return String(str || '').split(',').map(function(c){ return c.trim(); }).filter(Boolean);
  }

  /* parseOrderByCols — split by comma; each entry "col [DESC|ASC]". */
  function parseOrderByCols(str) {
    return String(str || '').split(',').map(function(p){
      var trimmed = p.trim();
      var dirMatch = /^(.+?)\s+(asc|desc)$/i.exec(trimmed);
      if (dirMatch) return { col: dirMatch[1].trim(), dir: dirMatch[2].toLowerCase() };
      return { col: trimmed, dir: 'asc' };
    }).filter(function(o){ return o.col; });
  }

  /* parseHavingConds — parse conds like "COUNT(*) > 3" / "SUM(x) >= 100".
   * Resolve lhs (alias or aggregate raw name) → projection index. */
  function parseHavingConds(havingStr, projections) {
    var conds = String(havingStr || '').split(/\s+AND\s+/i).map(function(s){ return s.trim(); }).filter(Boolean);
    return conds.map(function(cond){
      var m = /^(.+?)\s*(<=|>=|<>|>|<|=)\s*(.+)$/i.exec(cond);
      if (!m) return null;
      var lhs = m[1].trim();
      var op = m[2];
      var rawVal = m[3].trim();
      var val = rawVal.replace(/^'(.*)'$/, '$1').replace(/^"(.*)"$/, '$1');
      var colIdx = -1;
      for (var pi = 0; pi < projections.length; pi++) {
        var p = projections[pi];
        if (p.alias === lhs) { colIdx = pi; break; }
        if (p.kind === 'agg') {
          var rawAgg = (p.fn.toUpperCase() + '(' + p.expr + ')');
          if (rawAgg === lhs) { colIdx = pi; break; }
          var aliasFallback = p.alias || rawAgg;
          if (aliasFallback === lhs) { colIdx = pi; break; }
        } else if (p.col === lhs) {
          colIdx = pi; break;
        }
      }
      if (colIdx < 0) return null;
      return { colIdx: colIdx, op: op, val: val };
    }).filter(Boolean);
  }

  /* compareSqlVals — used by HAVING + ORDER BY. Numeric compare khi cả 2 numeric. */
  function compareSqlVals(a, b) {
    var na = Number(a), nb = Number(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    var sa = String(a == null ? '' : a);
    var sb = String(b == null ? '' : b);
    if (sa < sb) return -1;
    if (sa > sb) return 1;
    return 0;
  }

  /* getRowVal — fallback lookup: prefixed first, then unprefixed.
   * 4A-E3-engine: JSON-path `col->>'key'` → trích giá trị từ cell JSON string.
   * Trả `''` nếu col rỗng / JSON parse fail / key không tồn tại. */
  function getRowVal(row, col) {
    if (col == null) return '';
    /* JSON path: 'col->>' or 'table.col->>key' */
    var jsonMatch = /^([\w.]+?)->>'([^']+)'$/.exec(String(col).trim());
    if (jsonMatch) {
      var jsonCol = jsonMatch[1];
      var jsonKey = jsonMatch[2];
      var jsonVal = row[jsonCol] !== undefined ? row[jsonCol] : (jsonCol.indexOf('.') >= 0 ? row[jsonCol.substring(jsonCol.indexOf('.') + 1)] : '');
      if (jsonVal == null || jsonVal === '') return '';
      try {
        var obj = typeof jsonVal === 'string' ? JSON.parse(jsonVal) : jsonVal;
        var extracted = obj[jsonKey];
        return extracted === undefined ? '' : extracted;
      } catch (e) { return ''; }
    }
    if (row[col] !== undefined) return row[col];
    var dotIdx = col.indexOf('.');
    if (dotIdx >= 0 && row[col.substring(dotIdx + 1)] !== undefined) {
      return row[col.substring(dotIdx + 1)];
    }
    return '';
  }

  /* 4A-E3-engine: detectCase — parse "CASE WHEN cond THEN val [WHEN ...] [ELSE val] END [AS alias]".
   * cond = col op val hoặc col IN (val,val,val). Returns {kind:'case', branches:[{cond,val}], elseVal, alias}
   * hoặc null. */
  function detectCase(token) {
    var trimmed = String(token || '').trim();
    var headMatch = /^\s*case\s+(.+?)\s+end\s*(?:\s+as\s+(\w+))?\s*$/i.exec(trimmed);
    if (!headMatch) return null;
    var body = headMatch[1];
    var alias = headMatch[2] || null;
    var branches = [];
    /* Capture WHEN cond THEN val pairs */
    var re = /\s*when\s+([\s\S]+?)\s+then\s+(?:'(.*?)'|"([^"]*?)"|([^\s,)(]+))\s*/gi;
    var m, cond;
    while ((m = re.exec(body)) !== null) {
      var condStr = m[1].trim();
      var val = m[2] !== undefined ? m[2] : (m[3] !== undefined ? m[3] : m[4]);
      branches.push({ cond: condStr, val: val });
    }
    if (branches.length === 0) return null;
    /* ELSE val at end */
    var elseMatch = /\s*else\s+(?:'(.*?)'|"([^"]*?)"|([^\s,)(]+))\s*$/i.exec(body);
    var elseVal = null;
    if (elseMatch) {
      elseVal = elseMatch[1] !== undefined ? elseMatch[1] : (elseMatch[2] !== undefined ? elseMatch[2] : elseMatch[3]);
    }
    return { kind: 'case', branches: branches, elseVal: elseVal, alias: alias };
  }

  /* 4A-E3-engine: evalCase(row, parsedCase) — evaluate CASE expression per row.
   * Hỗ trợ WHEN cond WHERE cond là:
   *   - `col IN ('a', 'b', 'c')` → if row[col] ∈ list
   *   - `col = 'val'`            → if row[col] === val
   * Returns string value hoặc ''. */
  function evalCase(row, parsedCase) {
    if (!parsedCase || !parsedCase.branches) return '';
    function stripQuotes(s) {
      if (s == null) return '';
      var t = String(s).trim();
      if ((t.charAt(0) === "'" && t.charAt(t.length - 1) === "'") || (t.charAt(0) === '"' && t.charAt(t.length - 1) === '"')) {
        return t.substring(1, t.length - 1);
      }
      return t;
    }
    function evalCond(condStr) {
      /* col IN ('a', 'b', 'c') */
      var inMatch = /^\s*([\w.]+)\s+in\s*\(([^)]+)\)\s*$/i.exec(condStr);
      if (inMatch) {
        var col = inMatch[1];
        var rawList = inMatch[2];
        var vals = rawList.split(',').map(function(s){ return stripQuotes(s); });
        var rowVal = getRowVal(row, col);
        return vals.indexOf(String(rowVal)) >= 0;
      }
      /* col = 'val' */
      var eqMatch = /^\s*([\w.]+)\s*=\s*(.+)\s*$/i.exec(condStr);
      if (eqMatch) {
        var ec = eqMatch[1];
        var ev = stripQuotes(eqMatch[2]);
        return String(getRowVal(row, ec)) === ev;
      }
      /* <, >, <=, >= */
      var cmpMatch = /^\s*([\w.]+)\s*(<=|>=|<>|>|<|=)\s*(.+)\s*$/i.exec(condStr);
      if (cmpMatch) {
        var cc = cmpMatch[1];
        var op = cmpMatch[2];
        var cv = stripQuotes(cmpMatch[3]);
        var l = getRowVal(row, cc);
        var r = cv;
        var lc = compareSqlVals(l, r);
        if (op === '=') return lc === 0;
        if (op === '<>') return lc !== 0;
        if (op === '>') return lc > 0;
        if (op === '<') return lc < 0;
        if (op === '>=') return lc >= 0;
        if (op === '<=') return lc <= 0;
      }
      return false;
    }
    for (var bi = 0; bi < parsedCase.branches.length; bi++) {
      if (evalCond(parsedCase.branches[bi].cond)) {
        return parsedCase.branches[bi].val;
      }
    }
    return parsedCase.elseVal != null ? parsedCase.elseVal : '';
  }

  /* computeAggregate — COUNT/SUM/AVG/MIN/MAX over rows for 1 group.
   * COUNT(*) trả về rows.length; COUNT(expr) đếm non-null eval; SUM/AVG/MIN/MAX dùng evalSqlExpr. */
  function computeAggregate(rows, proj) {
    var fn = proj.fn, expr = proj.expr;
    if (fn === 'count') {
      if (expr === '*') return rows.length;
      var cnt = 0;
      for (var ri = 0; ri < rows.length; ri++) {
        var v = getRowVal(rows[ri], expr);
        if (v !== undefined && v !== null && v !== '') cnt++;
        else {
          // arithmetic COUNT — eval và check non-NaN
          var n = evalSqlExpr(rows[ri], expr);
          if (n !== null && !isNaN(n)) cnt++;
        }
      }
      return cnt;
    }
    var total = 0, count = 0;
    for (var ri2 = 0; ri2 < rows.length; ri2++) {
      var n2 = evalSqlExpr(rows[ri2], expr);
      if (n2 !== null && !isNaN(n2)) { total += Number(n2); count++; }
    }
    if (fn === 'sum') return total;
    if (fn === 'avg') return count === 0 ? 0 : total / count;
    if (fn === 'min' || fn === 'max') {
      var extreme = null;
      for (var ri3 = 0; ri3 < rows.length; ri3++) {
        var n3 = evalSqlExpr(rows[ri3], expr);
        if (n3 === null || isNaN(n3)) continue;
        if (extreme === null) extreme = Number(n3);
        else if (fn === 'min' && n3 < extreme) extreme = n3;
        else if (fn === 'max' && n3 > extreme) extreme = n3;
      }
      return extreme === null ? 0 : extreme;
    }
    return 0;
  }

  /* A4 + 4A-E1 + 4A-E2: PE_parseSQLToBlocks — parse SQL text → blocks per zone.
   * Used khi user gõ tay SQL trong #ide-code mà chưa kéo block nào.
   * Returns {zoneFills, _tables, _onConds} + 4A-E2 metadata _groupByStr/_havingStr/_orderByStr/_limitN.
   *
   * 4A-E1: parse chain JOIN ... ON ... + WHERE col capture [\w.]+
   * 4A-E2: extend parser with structured boundary matching → split SELECT/FROM/WHERE/GROUP BY/HAVING/ORDER BY/LIMIT.
   *        Backward-safe: E1 fields + WHERE/AND parsing logic KHÔNG đổi. */
  window.PE_parseSQLToBlocks = function(sqlText, s3) {
    if (!s3 || !s3.drop_zones) return { error: 'No drop zones' };
    var clean = String(sqlText || '').replace(/--.*$/gm, '').trim();
    if (!clean) return { error: 'Chưa nhập query' };
    clean = clean.replace(/;\s*$/, '');

    /* 4A-E2: structured parser — tìm boundary keyword để split clauses.
     * Ưu tiên boundary keywords (where|group by|having|order by|limit) kết thúc câu con.
     *
     * 4A-E2 fix: fromIdx tìm FIRST "FROM" ngoài parens. (Bài 2 có `EXTRACT(YEAR FROM CURRENT_DATE)`
     * — từ "FROM" trong EXTRACT là keyword của EXTRACT, KHÔNG phải clause FROM. Nếu search naive,
     * parser nhầm "CURRENT_DATE" làm tên bảng.)
     *
     * 4A-E2 fix: TRACK table aliases ("orders o" → {orders, alias 'o'}). JoinedRow chỉ có key
     * "orders.col" chứ không có "o.col"; WHERE block dùng alias-prefix sẽ miss. Aliases map
     * giúp PE_runSQL resolve alias → full table name khi lookup joinedRow. */
    var aliasMap = {};  // 1-letter-or-multi-char alias → table name (vd 'o' → 'orders') */
    var selectMatch = /^\s*select\s+/i.exec(clean);
    if (!selectMatch) return { error: 'Cú pháp: SELECT … FROM …' };
    var afterSelect = clean.substring(selectMatch[0].length);

    var fromIdx = -1;
    var _depth = 0;
    var _scan = afterSelect;
    for (var _fi = 0; _fi < _scan.length; _fi++) {
      var _ch = _scan.charAt(_fi);
      if (_ch === '(') _depth++;
      else if (_ch === ')') _depth--;
      else if (_depth === 0 && /\sfrom\s/i.test(_scan.substring(_fi))) {
        var afterFromKw = _scan.substring(_fi).match(/^\sfrom\s+(\w+)(?:\s+(\w+))?/i);
        if (afterFromKw) { fromIdx = _fi; break; }
      }
    }
    if (fromIdx < 0) return { error: 'Cú pháp: SELECT … FROM …' };
    var colsStr = afterSelect.substring(0, fromIdx).trim();
    /* Strip only "FROM " (NOT the table name) — we parse primary + alias từ afterFrom via fromAndJoins.
     * Lưu ý: regex cũ /^\s+from\s+\w+(?:\s+\w+)?/ ăn cả WHERE/GROUP/HAVING/ORDER/LIMIT keyword làm alias,
     *   làm hỏng fromAndJoins (vd "id = 101" thay vì ""). */
    var afterFrom = afterSelect.substring(fromIdx).replace(/^\s+from\s+/i, '').trim();

    /* FROM body — stop at next clause keyword (or end). */
    var fromKwRe = /\s+(?:where|group\s+by|having|order\s+by|limit)\b/i;
    var fromEnd = fromKwRe.exec(afterFrom);
    var fromAndJoins, tail;
    if (fromEnd) {
      fromAndJoins = afterFrom.substring(0, fromEnd.index).trim();
      tail = afterFrom.substring(fromEnd.index).trim();
    } else {
      fromAndJoins = afterFrom.trim();
      tail = '';
    }

    /* Consume where / group by / having / order by / limit (in order). */
    var whereStr = null, groupByStr = null, havingStr = null, orderByStr = null, limitN = null;

    function consumeClause(restStr, kwRegexSrc) {
      var prefix = new RegExp('^' + kwRegexSrc + '\\s+', 'i');
      var m = prefix.exec(restStr);
      if (!m) return { val: null, rest: restStr };
      var body = restStr.substring(m[0].length);
      /* 4A-E3-engine: find next clause keyword at TOP LEVEL (paren depth=0). Tránh nuốt
       * WHERE/GROUP/HAVING/ORDER BY/LIMIT BÊN TRONG IN-subquery (vd Bài 9:
       * `WHERE col IN (SELECT … WHERE phone='…')` — inner `WHERE` không nên là boundary). */
      function findTopLevelKw(b) {
        var depth = 0;
        for (var i = 0; i < b.length; i++) {
          var ch = b.charAt(i);
          if (ch === '(') depth++;
          else if (ch === ')') depth--;
          else if (depth === 0) {
            var rest2 = b.substring(i);
            if (/^(where|group\s+by|having|order\s+by|limit)\s+/i.test(rest2)) return i;
          }
        }
        return -1;
      }
      var endIdx = findTopLevelKw(body);
      if (endIdx >= 0) {
        return { val: body.substring(0, endIdx).trim(), rest: body.substring(endIdx).trim() };
      }
      return { val: body.trim(), rest: '' };
    }

    var w = consumeClause(tail, 'where');
    whereStr = w.val; tail = w.rest;
    var g = consumeClause(tail, 'group\\s+by');
    groupByStr = g.val; tail = g.rest;
    var h = consumeClause(tail, 'having');
    havingStr = h.val; tail = h.rest;
    var o = consumeClause(tail, 'order\\s+by');
    orderByStr = o.val; tail = o.rest;
    var lm = /^limit\s+(\d+)/i.exec(tail);
    if (lm) { limitN = parseInt(lm[1], 10); tail = tail.substring(lm[0].length).trim(); }
    if (tail && tail.trim()) return { error: 'Cú pháp thừa: ' + tail.trim() };

    /* 4A-E1+E2: parse FROM + chain JOIN ... ON ... — TABLE ALIASES OPTIONAL
     * (vd "JOIN loans l ON ..." aliased). Pattern: JOIN <table> [AS <alias>|<alias>]
     * (?=\s+ON) handles optional single-word alias. Track aliases cho PE_runSQL resolve.
     *
     * 4A-E2 fix: aliases là từ theo sau table name; PHẢI check không phải SQL keyword
     * (where/group/having/order/limit/on/join/as/and) — nếu ignore keyword skip, sẽ tránh
     * parser hiểu WHERE làm alias. Build aliasMap chỉ từ fromAndJoins scanning. */
    var aliasKwSet = /\b(?:where|group|having|order|limit|on|join|as|and|or)\b/i;
    aliasMap = {};  /* reset — alias populated only từ fromAndJoins */
    function captureAlias(tableName, aliasCandidate) {
      if (!aliasCandidate) return;
      if (aliasKwSet.test(aliasCandidate)) return;  /* skip keyword */
      if (aliasCandidate.toLowerCase() === tableName.toLowerCase()) return;  /* duplicate */
      aliasMap[aliasCandidate] = tableName;
    }

    var primaryMatch = /^(\w+)/.exec(fromAndJoins);
    var parsedTables = primaryMatch ? [primaryMatch[1]] : [];
    var onConds = [];
    /* Capture optional alias after primary table (first 1-2 words of fromAndJoins) */
    var primaryAliasMatch = /^(\w+)\s+(\w+)/.exec(fromAndJoins);
    if (primaryAliasMatch) {
      captureAlias(primaryAliasMatch[1], primaryAliasMatch[2]);
    }
    /* Scan JOIN chain: alias optional trước "ON" */
    var joinRegex = /\bjoin\s+(\w+)(?:\s+(\w+))?\s+on\s+([\w.]+)\s*=\s*([\w.]+)/gi;
    var jm;
    while ((jm = joinRegex.exec(fromAndJoins)) !== null) {
      parsedTables.push(jm[1]);
      captureAlias(jm[1], jm[2]);
      onConds.push({ leftCol: jm[3], rightCol: jm[4] });
    }

    /* Build blocks per zone (E1 compat + 4A-E2 group/order populate).
     * 4A-E3-engine: split SELECT projection by commas respecting paren depth + string
     * literals — commas bên trong CASE WHEN ... IN (...) không nên là boundary. */
    function splitCommasDepth(str) {
      var parts = ['']; var depth = 0; var inStr = null;
      for (var i = 0; i < str.length; i++) {
        var ch = str.charAt(i);
        if (inStr) {
          if (ch === inStr && str.charAt(i - 1) !== '\\') inStr = null;
          parts[parts.length - 1] += ch;
        } else if (ch === "'" || ch === '"') {
          inStr = ch;
          parts[parts.length - 1] += ch;
        } else if (ch === '(') { depth++; parts[parts.length - 1] += ch; }
        else if (ch === ')') { depth--; parts[parts.length - 1] += ch; }
        else if (ch === ',' && depth === 0) { parts.push(''); }
        else { parts[parts.length - 1] += ch; }
      }
      return parts;
    }
    var cols = splitCommasDepth(colsStr).map(function(c){ return c.trim(); }).filter(Boolean);
    var selectBlocks = [{ token: 'SELECT', type: 'kw' }].concat(
      cols.map(function(c){ return { token: c, type: c === '*' ? 'fn' : 'col' }; })
    );
    var fromBlocks = [{ token: 'FROM', type: 'kw' }, { token: parsedTables[0], type: 'tbl' }];
    for (var oi = 0; oi < onConds.length; oi++) {
      fromBlocks.push({ token: 'JOIN', type: 'kw' });
      fromBlocks.push({ token: parsedTables[oi + 1], type: 'tbl' });
      fromBlocks.push({ token: 'ON', type: 'kw' });
      fromBlocks.push({ token: onConds[oi].leftCol + ' = ' + onConds[oi].rightCol, type: 'col' });
    }
    var whereBlocks = [];
    var inSubqueries = [];  /* 4A-E3-engine: WHERE col IN (SELECT …) — Bài 9 */
    if (whereStr) {
      /* 4A-E1 + 4A-E2: WHERE col capture [\w.]+ chấp nhận 'publisher.name'.
       * 4A-E2: hỗ trợ operators =, <>, <, >, <=, >= (cần cho Bài 11 `o.order_date >= '2024-04-05'`).
       * 4A-E3-engine: tách `col IN (subquery)` riêng — recursion engine để tránh parseWhereRows
       *   (single-table path) nuốt nhầm.
       * A7b AND-split backward-safe. */
      var conds = whereStr.split(/\s+AND\s+/i).map(function(s){ return s.trim(); }).filter(Boolean);
      var parsedConds = [];
      conds.forEach(function(cond) {
        /* 4A-E3-engine: IN-subquery pattern — capture subquery raw, mark as inCond. */
        var inMatch = /^([\w.]+)\s+in\s*\(([\s\S]+)\)\s*$/i.exec(cond);
        if (inMatch) {
          inSubqueries.push({ col: inMatch[1], subSql: inMatch[2].trim() });
          return;
        }
        var wm = /([\w.]+)\s*(<=|>=|<>|<|>|=)\s*(?:'([^']*)'|"([^"]*)"|(\d+)|(\w+))/i.exec(cond);
        if (wm) parsedConds.push(wm);
      });
      parsedConds.forEach(function(wm, ci) {
        if (ci > 0) whereBlocks.push({ token: 'AND', type: 'kw' });
        whereBlocks.push({ token: wm[1], type: 'col' });
        whereBlocks.push({ token: wm[2], type: 'op' });
        var v = wm[3] !== undefined ? "'" + wm[3] + "'" : (wm[4] !== undefined ? wm[4] : (wm[5] !== undefined ? wm[5] : wm[6]));
        whereBlocks.push({ token: v, type: 'val' });
      });
    }
    /* 4A-E2: group-line blocks (step-3 drag E2). */
    var groupBlocks = [];
    if (groupByStr) {
      groupBlocks.push({ token: 'GROUP BY', type: 'kw' });
      groupByStr.split(',').forEach(function(c){
        var trimmed = c.trim();
        if (trimmed) groupBlocks.push({ token: trimmed, type: 'col' });
      });
    }
    /* 4A-E2: order-line blocks (step-3 drag E2). */
    var orderBlocks = [];
    if (orderByStr) {
      orderBlocks.push({ token: 'ORDER BY', type: 'kw' });
      var obs = parseOrderByCols(orderByStr);
      obs.forEach(function(ob){
        orderBlocks.push({ token: ob.col, type: 'col' });
        orderBlocks.push({ token: ob.dir.toUpperCase(), type: 'kw' });
      });
      if (limitN != null) {
        orderBlocks.push({ token: 'LIMIT', type: 'kw' });
        orderBlocks.push({ token: String(limitN), type: 'val' });
      }
    } else if (limitN != null) {
      orderBlocks.push({ token: 'LIMIT', type: 'kw' });
      orderBlocks.push({ token: String(limitN), type: 'val' });
    }

    return {
      zoneFills: {
        'select-line': selectBlocks,
        'from-line': fromBlocks,
        'where-line': whereStr ? [{ token: 'WHERE', type: 'kw' }].concat(whereBlocks) : [],
        'group-line': groupBlocks,
        'order-line': orderBlocks
      },
      _tables: parsedTables,
      _onConds: onConds,
      _aliasMap: aliasMap,
      _inSubqueries: inSubqueries,  /* 4A-E3-engine: WHERE col IN (SELECT …) */
      _groupByStr: groupByStr,
      _havingStr: havingStr,
      _orderByStr: orderByStr,
      _limitN: limitN
    };
  };

  /* A4+C4+4A-E1+4A-E2: PE_runSQL — shared SQL executor cho step 3 (gõ tay) + step 4 (GÕ THẬT).
   * sqlText = raw SQL, schema = {columns, dataRows} (s3/s4.schema hoặc DEFAULT_TABLE).
   * Returns {cols, rows} on success, {error: 'msg'} on failure.
   *
   * Flow: parse → whitelist scan → resolve tables → cross-product → ON filter →
   *       WHERE filter (single-table → PE_parseWhereRows; multi-table → inline conds) →
   *       GROUP BY (4A-E2) nếu có aggregate → aggregate compute per group →
   *       HAVING (4A-E2 optional) → ORDER BY (4A-E2 optional) → LIMIT (4A-E2 optional) →
   *       SELECT projection.
   *
   * Backward-safe: 1-table queries KHÔNG có aggregate → E1 logic y nguyên.
   * Step-3 drag (`executeStation` + `PE_parseWhereRows`) KHÔNG đi qua đây.
   * `PE_parseWhereRows` (drag_game.js A7a) KHÔNG đụng. */
  /* 4A-E2-fix: stripAliasPrefix — dùng khi output col header KHÔNG có AS, đỡ rò alias prefix
   * (vd `m.member_name` → `member_name`, `game.title` → `title`). Có AS GIỮ nguyên. */
  function stripAliasPrefix(col) {
    if (!col || col.indexOf('.') < 0) return col;
    return col.replace(/^\w+\./, '');
  }

  /* 4A-E2-fix Bài 2: projectValue — projection cell computation.
   * - Col ref (no parens, no arithmetic at outer level) → getRowVal(row, col).
   * - Expression (has parens/functions/arithmetic outer) → evalSqlExpr(row, col).
   * Returns string '' when undefined. evalSqlExpr handles EXTRACT(YEAR FROM CURRENT_DATE)
   * → current year dynamically (no hardcode 2026). */
  function projectValue(row, col) {
    if (col == null) return '';
    var s = String(col);
    if (s.indexOf('(') >= 0 || /\s[\+\-\*\/]\s/.test(s)) {
      var v = evalSqlExpr(row, s);
      if (v !== null && !isNaN(v)) return v;
      if (v !== null && typeof v === 'string') return v;
    }
    return getRowVal(row, s);
  }

  window.PE_runSQL = function(sqlText, schema, data) {
    /* 4A-E2 + 4A-E2-fix: chạy token whitelist scan TRƯỚC parser — parser chưa handle nested parens
     * (IN-subquery) và ORM syntax không bắt đầu "SELECT" → fail nhầm. E3-scope → **pending neutral**
     * (không phải error-đỏ): trả `{pending: true, msg}` để renderStep4Pending vẽ khung INFO
     * (icon fa-gear cyan/amber), KHÔNG chữ "LỖI", KHÔNG tam-giác-đỏ. `{error}` thật (syntax sai)
     * VẪN đỏ qua renderStep4Error. */
    var scan = scanUnsupportedTokens(sqlText);
    if (scan.unsupported) {
      // M4-TC 2026-07-04: message trung tính — KHÔNG nói "đáp án ĐÚNG" (msg này hiện cả khi
      // user gõ sai; đúng/sai do validateSQL quyết ở nhịp 600ms sau).
      return { pending: true, msg: '⚙ Engine demo chưa mô phỏng được: ' + scan.kw + ' — đáp án của bạn sẽ được chấm trực tiếp khi bấm Run/Submit.' };
    }
    var s3Pseudo = { drop_zones: [{id:'select-line'},{id:'from-line'},{id:'where-line'}] };
    var parsed = window.PE_parseSQLToBlocks(sqlText, s3Pseudo);
    if (parsed.error) return { error: parsed.error };
    var fills = parsed.zoneFills;

    /* 4A-E1 + 4A-E2: resolve tables — LOOKUP BY NAME across primary schema + related_schemas
     * (không assume thứ tự). Bài 11/12 có SQL order ≠ schema order (vd Bài 11 schema=products
     * nhưng SQL FROM orders); name-based lookup tự match mọi case.
     * Build tableByName map primary + related, sau đó map(parsedTables, tableName → entry).
     *
     * 4A-E2 fix: PE_runSQL accepts 2 schema shapes:
      *   (a) top-level: schema = {table_name, columns, data, related_schemas}
     *   (b) nested (Run button path): schema = {schema: {table_name, columns, data, related_schemas}}
     *     — lesson_content.js nests related_schemas INSIDE step_4.schema (NOT at s4 top-level).
     * Resolve via normalize helper. 4A-E3-engine: also pull related_schemas from primarySchema
     * (nested form) — Mode B (Run button) needs this fallback. */
    var primarySchema = (schema && schema.schema) || schema || {};
    var relatedSchemas = (schema && schema.related_schemas)
      || (primarySchema && primarySchema.related_schemas) || [];
    var tableByName = {};
    /* Primary schema */
    var primaryRawCols = (primarySchema && primarySchema.columns) || [];
    var primaryRows = (data && data.length)
      || (primarySchema && primarySchema.data)
      || (schema && schema.data) || [];
    var primaryName = (primarySchema && primarySchema.table_name)
      || (schema && schema.table_name) || '';
    if (primaryName) {
      var primaryNormalizedCols = primaryRawCols.map(function(c){ return typeof c === 'string' ? c : (c.name || ''); });
      tableByName[primaryName] = { name: primaryName, columns: primaryNormalizedCols, dataRows: primaryRows.slice() };
    }
    /* Related schemas */
    relatedSchemas.forEach(function(rel){
      var relName = rel.table_name || (rel.columns && rel.columns[0] && (rel.columns[0].table_name || rel.columns[0].name || ''));
      if (!relName) {
        /* Fallback: use numeric index name from $idx */
        relName = '__rel_' + relatedSchemas.indexOf(rel);
      }
      var relCols = (rel.columns || []).map(function(c){ return typeof c === 'string' ? c : (c.name || ''); });
      tableByName[relName] = { name: relName, columns: relCols, dataRows: (rel.data || []).slice() };
    });
    /* Also try: alias from SQL (e.g. "products p") — use base name "products" if present. */
    var parsedTables = parsed._tables || [];
    var tables = parsedTables.map(function(tableName){
      if (tableByName[tableName]) return tableByName[tableName];
      /* Try plainer aliases: "products p" → "products". SQL parser captured table+alias together. */
      var baseName = tableName.replace(/\s+\w+$/, '').trim();
      if (tableByName[baseName]) return tableByName[baseName];
      return null;
    }).filter(Boolean);
    if (!tables.length || tables.some(function(t){ return !t.columns.length; })) {
      return { error: 'Schema không đầy đủ cho truy vấn (cần bảng: ' + (parsedTables.join(', ') || '?') + ')' };
    }
    var isJoin = tables.length > 1;

    /* Cross-product + JOIN. joinedRows = [{columnKey: value, ...}, ...]
     * 4A-E2 fix: also add ALIAS-prefixed keys (vd "m.member_name") so SELECT/GROUP BY col refs
     *   dùng alias-prefix resolve directly without going through aliasMap. */
    var joinAliasMap = parsed._aliasMap || {};
    var tableAlias = {};
    Object.keys(joinAliasMap).forEach(function(a){ tableAlias[joinAliasMap[a]] = a; });
    var joinedRows = [{}];
    tables.forEach(function(t) {
      var next = [];
      var tAlias = tableAlias[t.name] || '';
      joinedRows.forEach(function(jr) {
        t.dataRows.forEach(function(row) {
          var ext = {};
          Object.keys(jr).forEach(function(k){ ext[k] = jr[k]; });
          t.columns.forEach(function(c, ci) {
            ext[t.name + '.' + c] = row[ci];
            ext[c] = row[ci];
            if (tAlias) ext[tAlias + '.' + c] = row[ci];
          });
          next.push(ext);
        });
      });
      joinedRows = next;
    });
    /* INNER JOIN filter — 4A-E2 fix: ON col refs use alias prefix (vd "l.member_id"), joinedRow keys
     *   dùng full table name ("loans.member_id"). Resolve alias → full table name before lookup. */
    if (isJoin && parsed._onConds && parsed._onConds.length) {
      var onAliasMap = parsed._aliasMap || {};
      function resolveOnRef(ref) {
        if (ref.indexOf('.') < 0) return ref;
        var di = ref.indexOf('.');
        return (onAliasMap[ref.substring(0, di)] || ref.substring(0, di)) + '.' + ref.substring(di + 1);
      }
      joinedRows = joinedRows.filter(function(r) {
        return parsed._onConds.every(function(c) {
          var lv = r[resolveOnRef(c.leftCol)];
          var rv = r[resolveOnRef(c.rightCol)];
          return lv !== undefined && rv !== undefined && String(lv) === String(rv);
        });
      });
    }
    /* WHERE filter: single-table → PE_parseWhereRows y nguyên; multi-table → inline conds.
     * 4A-E2: hỗ trợ operators =, <>, <, >, <=, >= (Bài 11 >=). Multi-table dùng compareSqlVals.
     * 4A-E2 fix: WHERE col có alias-prefix (vd 'o.order_date') — resolve alias thành full table name
     *   dùng parsed._aliasMap. joinedRow có key 'orders.order_date' (full table name) chứ không có 'o.col'. */
    if (fills['where-line'] && fills['where-line'].length) {
      var aliasMap = parsed._aliasMap || {};
      function resolveColRef(ref) {
        if (ref.indexOf('.') < 0) return ref;
        var dotIdx = ref.indexOf('.');
        var prefix = ref.substring(0, dotIdx);
        var colName = ref.substring(dotIdx + 1);
        /* If prefix is a known alias, use full table name */
        var fullTable = aliasMap[prefix] || prefix;
        return fullTable + '.' + colName;
      }
      var whereBlocks = fills['where-line'].filter(function(b){ return b.token !== 'WHERE' && b.token !== 'AND'; });
      var conds = [];
      for (var ci = 0; ci < whereBlocks.length; ci += 3) {
        if (ci + 2 >= whereBlocks.length) break;
        var ccol = resolveColRef(whereBlocks[ci].token);
        var cop = whereBlocks[ci + 1].token;
        var cval = whereBlocks[ci + 2].token;
        var cleanV = String(cval).replace(/^'(.*)'$/, '$1').replace(/^"(.*)"$/, '$1');
        if (/^(=|<>|<=|>=|<|>)$/.test(cop)) conds.push({ col: ccol, op: cop, val: cleanV });
      }
      /* 4A-E3-engine Bài 9: WHERE col IN (SELECT …) — run subquery against SAME joined tables
       * set as outer. Build schema where primary = subquery's FROM table, others = related.
       * __forceInlineFilter = internal flag → subquery skip PE_parseWhereRows path
       * (PE_parseWhereRows nuốt nhầm nested WHERE bên trong IN). */
      if (parsed._inSubqueries && parsed._inSubqueries.length) {
        var inCond = parsed._inSubqueries[0];
        var _fromMatch = inCond.subSql.match(/from\s+(\w+)/i);
        var subFromTable = _fromMatch ? _fromMatch[1] : tables[0].name;
        var subPrim = tableByName[subFromTable];
        if (subPrim) {
          var _relTables = [];
          for (var tbi in tableByName) {
            if (tbi !== subFromTable) _relTables.push(tableByName[tbi]);
          }
          var _schemaObj = {
            schema: { table_name: subPrim.name, columns: subPrim.columns, data: subPrim.dataRows },
            related_schemas: _relTables.map(function(t){ return { table_name: t.name, columns: t.columns, data: t.dataRows }; }),
            __forceInlineFilter: true
          };
          var _r = window.PE_runSQL(inCond.subSql, _schemaObj);
          if (!_r.error && _r.rows) {
            var inVals = _r.rows.map(function(row){ return String(row[0]); });
            joinedRows = joinedRows.filter(function(row){
              var lv = String(getRowVal(row, inCond.col));
              return inVals.indexOf(lv) >= 0;
            });
          }
        }
      }
      if (conds.length) {
        var hasInSub = parsed._inSubqueries && parsed._inSubqueries.length > 0;
        var forceInline = hasInSub || !!schema.__forceInlineFilter;
        if (!isJoin) {
          /* Single-table backward-compat: PE_parseWhereRows (drag_game A7a) chỉ xử lý '=' + AND.
           * Nếu có op khác '=', fallback sang inline filter qua compareSqlVals.
           * 4A-E3-engine: nếu outer có IN-subquery HOẶC schema.__forceInlineFilter (subquery
           * recursion), dùng inline filter (PE_parseWhereRows nuốt nhầm nested WHERE bên trong IN). */
          var onlyEq = conds.every(function(c){ return c.op === '='; });
          if (onlyEq && !forceInline) {
            var whereInputStr = fills['where-line'].filter(function(b){ return b.token !== 'WHERE'; }).map(function(b){ return b.token; }).join(' ');
            var t0 = tables[0];
            var tableForParse = { columns: t0.columns, dataRows: t0.dataRows };
            var matched = window.PE_parseWhereRows ? window.PE_parseWhereRows(whereInputStr, tableForParse) : null;
            if (matched === null) return { error: 'WHERE không hợp lệ: ' + whereInputStr };
            if (matched.length === 0) return { error: 'WHERE không khớp dòng nào' };
            joinedRows = matched.map(function(i){ return joinedRows[i]; });
          } else {
            /* Inline filter cho op khác (>=, <=, >, <, <>) HOẶC outer IN-subquery HOẶC subquery recursion. */
            joinedRows = joinedRows.filter(function(r) {
              return conds.every(function(c) {
                var rv = r[c.col];
                if (rv === undefined) return false;
                var cmp = compareSqlVals(rv, c.val);
                if (c.op === '=') return cmp === 0;
                if (c.op === '<>') return cmp !== 0;
                if (c.op === '>') return cmp > 0;
                if (c.op === '<') return cmp < 0;
                if (c.op === '>=') return cmp >= 0;
                if (c.op === '<=') return cmp <= 0;
                return false;
              });
            });
          }
        } else {
          /* Multi-table inline filter — joinedRows có full-table-prefix keys 'orders.col' + unprefixed 'col' */
          joinedRows = joinedRows.filter(function(r) {
            return conds.every(function(c) {
              var rv = r[c.col];
              if (rv === undefined) return false;
              var cmp = compareSqlVals(rv, c.val);
              if (c.op === '=') return cmp === 0;
              if (c.op === '<>') return cmp !== 0;
              if (c.op === '>') return cmp > 0;
              if (c.op === '<') return cmp < 0;
              if (c.op === '>=') return cmp >= 0;
              if (c.op === '<=') return cmp <= 0;
              return false;
            });
          });
        }
      }
    }

    /* Parse SELECT projections: alias + aggregate detect + CASE detect (4A-E3-engine).
     * Pattern: detectAggregate (COUNT/SUM/...) > detectCase (CASE WHEN) > plain col. */
    var projections;
    if (fills['select-line'] && fills['select-line'].length) {
      var selTokens = fills['select-line'].filter(function(b){ return b.type === 'col' || b.type === 'fn'; }).map(function(b){ return b.token; });
      if (selTokens.length && selTokens.indexOf('*') < 0) {
        projections = selTokens.map(function(t) {
          var trimmed = t.trim();
          var asMatch = /^(.+?)\s+as\s+(\w+)$/i.exec(trimmed);
          var src = asMatch ? asMatch[1].trim() : trimmed;
          var alias = asMatch ? asMatch[2] : null;
          var agg = detectAggregate(src);
          if (agg) return { kind: 'agg', fn: agg.fn, expr: agg.expr, alias: alias || agg.alias };
          var cs = detectCase(src);
          if (cs) {
            /* If detectCase already grabbed the alias, prefer that; otherwise use asMatch's alias. */
            var caseAlias = cs.alias || alias;
            return { kind: 'case', branches: cs.branches, elseVal: cs.elseVal, alias: caseAlias };
          }
          return { kind: 'col', col: src, alias: alias };
        });
      }
    }
    /* Wildcard * path: chưa cần E2 (Bài 11+ không dùng *). Để E1 logic. */
    var useWildcard = !projections;
    var allColsFlat = [];
    if (useWildcard) {
      tables.forEach(function(t) {
        t.columns.forEach(function(c) { allColsFlat.push(t.name + '.' + c); });
      });
    }

    /* 4A-E2: detect if aggregate / GROUP BY present. */
    var groupByCols = parsed._groupByStr ? parseGroupByCols(parsed._groupByStr) : null;
    var aggregates = projections ? projections.filter(function(p){ return p.kind === 'agg'; }) : [];
    var isGrouped = !!groupByCols || aggregates.length > 0;

    var outCols, rowsOut;
    if (useWildcard) {
      /* E1 wildcard path: flat rows = all joinedRows passing through. */
      outCols = allColsFlat;
      rowsOut = joinedRows.map(function(r) {
        return allColsFlat.map(function(c){ return r[c] !== undefined ? r[c] : ''; });
      });
    } else if (isGrouped) {
      /* GROUP BY pipeline. 4A-E3-engine: pre-compute per-row projection values (kind=col, kind=case)
       * for alias-based GROUP BY (vd Bài 20 'GROUP BY security_level' alias CASE WHEN).
       * kind=agg skipped (compute at group time). */
      var aliasIdxByName = {};
      projections.forEach(function(p, idx) {
        if (p.alias) aliasIdxByName[p.alias] = idx;
      });
      var precomputed = joinedRows.map(function(row) {
        return projections.map(function(p) {
          if (p.kind === 'agg') return null;
          if (p.kind === 'case') return evalCase(row, p);
          return projectValue(row, p.col);
        });
      });
      /* Helper: GROUP BY col → value. Resolve alias via precomputed[]. Else getRowVal + alias-strip. */
      function resolveGroupKey(row, rowIdx, gc) {
        var aliasIdx = aliasIdxByName[gc];
        if (aliasIdx !== undefined) return precomputed[rowIdx][aliasIdx];
        return getRowVal(row, stripAliasPrefix(gc));
      }
      var groups = new Map();
      for (var gi = 0; gi < joinedRows.length; gi++) {
        var grow = joinedRows[gi];
        var keyVals = groupByCols ? groupByCols.map(function(c){ return resolveGroupKey(grow, gi, c); }) : ['__ALL__'];
        var key = keyVals.map(function(v){ return String(v === undefined ? '' : v); }).join('||');
        if (!groups.has(key)) groups.set(key, { keyVals: keyVals, rows: [] });
        groups.get(key).rows.push(grow);
      }
      var groupArr = Array.from(groups.values());

      /* Project per group: cho mỗi projection, nếu kind=agg → compute; col/case → keyVals hoặc rows[0]. */
      rowsOut = groupArr.map(function(group) {
        return projections.map(function(p) {
          if (p.kind === 'agg') return computeAggregate(group.rows, p);
          /* kind === 'col' or 'case' */
          if (p.alias) {
            /* If this projection's alias matches a group col, return that group key (first row's computed value). */
            var aliasIdx = aliasIdxByName[p.alias];
            if (aliasIdx !== undefined && groupByCols && groupByCols.indexOf(p.alias) >= 0) {
              return group.keyVals[groupByCols.indexOf(p.alias)];
            }
          }
          if (groupByCols && p.kind === 'col') {
            var idx = groupByCols.indexOf(stripAliasPrefix(p.col));
            if (idx >= 0) return group.keyVals[idx];
          }
          return projectValue(group.rows[0], p.kind === 'case' ? '' : p.col);
        });
      });

      /* HAVING filter */
      if (parsed._havingStr) {
        var havingConds = parseHavingConds(parsed._havingStr, projections);
        rowsOut = rowsOut.filter(function(row) {
          return havingConds.every(function(c) {
            var actual = row[c.colIdx];
            if (actual === undefined) return false;
            var n = compareSqlVals(actual, c.val);
            if (c.op === '=') return n === 0;
            if (c.op === '<>') return n !== 0;
            if (c.op === '>') return n > 0;
            if (c.op === '<') return n < 0;
            if (c.op === '>=') return n >= 0;
            if (c.op === '<=') return n <= 0;
            return false;
          });
        });
      }

      /* ORDER BY sort (resolve alias + aggregate raw name + group col index). */
      if (parsed._orderByStr) {
        var orderBys = parseOrderByCols(parsed._orderByStr);
        rowsOut.sort(function(a, b) {
          for (var oi3 = 0; oi3 < orderBys.length; oi3++) {
            var ob = orderBys[oi3];
            var idx = -1;
            for (var pi3 = 0; pi3 < projections.length; pi3++) {
              var p3 = projections[pi3];
              if (p3.alias === ob.col) { idx = pi3; break; }
              if (p3.kind === 'agg') {
                var rawAgg = p3.fn.toUpperCase() + '(' + p3.expr + ')';
                if (rawAgg === ob.col) { idx = pi3; break; }
              }
            }
            if (idx < 0) continue;
            var cmp = compareSqlVals(a[idx], b[idx]);
            if (cmp !== 0) return ob.dir === 'desc' ? -cmp : cmp;
          }
          return 0;
        });
      }

      /* LIMIT */
      if (parsed._limitN != null && parsed._limitN > 0) {
        rowsOut = rowsOut.slice(0, parsed._limitN);
      }

      /* Output column names: alias || raw. */
      outCols = projections.map(function(p) {
        if (p.kind === 'agg') return p.alias || (p.fn.toUpperCase() + '(' + p.expr + ')');
        return p.alias || stripAliasPrefix(p.col);
      });
    } else {
      /* E1 path (no GROUP BY, no aggregate) — project per joinedRow.
       * 4A-E2-fix: projection value = col-ref thì getRowVal; expression có parens/arithmetic
       * thì evalSqlExpr (vd Bài 2 `(EXTRACT(YEAR FROM CURRENT_DATE) - birth_year) AS age`). */
      outCols = projections.map(function(p){ return p.alias || stripAliasPrefix(p.col); });
      rowsOut = joinedRows.map(function(r) {
        return projections.map(function(p) {
          return projectValue(r, p.col);
        });
      });

      /* 4A-E4: ORDER BY + LIMIT cho path THƯỜNG — trước đây chỉ nhánh aggregate có,
       * nên `SELECT ... ORDER BY x DESC LIMIT 1` bị BỎ QUA IM LẶNG (silent-wrong). */
      if (parsed._orderByStr) {
        var orderBysE1 = parseOrderByCols(parsed._orderByStr);
        rowsOut.sort(function(a, b) {
          for (var oiE = 0; oiE < orderBysE1.length; oiE++) {
            var obE = orderBysE1[oiE];
            var obCol = stripAliasPrefix(obE.col).toLowerCase();
            var idxE = -1;
            for (var piE = 0; piE < projections.length; piE++) {
              var pE = projections[piE];
              var pAlias = (pE.alias || '').toLowerCase();
              var pCol = stripAliasPrefix(pE.col || '').toLowerCase();
              if (pAlias === obCol || pCol === obCol) { idxE = piE; break; }
            }
            if (idxE < 0) continue;
            var cmpE = compareSqlVals(a[idxE], b[idxE]);
            if (cmpE !== 0) return obE.dir === 'desc' ? -cmpE : cmpE;
          }
          return 0;
        });
      }
      if (parsed._limitN != null && parsed._limitN > 0) {
        rowsOut = rowsOut.slice(0, parsed._limitN);
      }
    }
    return { cols: outCols, rows: rowsOut };
  };

  /* A4: hydrateZonesFromTypedSQL — khi user gõ tay SQL mà blocks trống, fill state.step3Blocks */
  function hydrateZonesFromTypedSQL() {
    var s3 = state.currentLesson && state.currentLesson.step_3;
    if (!s3) return false;
    var ideCode = document.getElementById('ide-code');
    if (!ideCode) return false;
    var sqlText = (ideCode.textContent || '').trim();
    if (!sqlText) return false;
    var hasAnyBlock = Object.keys(state.step3Blocks).some(function(k){ return (state.step3Blocks[k] || []).length > 0; });
    if (hasAnyBlock) return false;
    var parsed = window.PE_parseSQLToBlocks(sqlText, s3);
    if (parsed.error) return false;
    /* Apply to state.step3Blocks */
    Object.keys(parsed.zoneFills).forEach(function(zid){
      state.step3Blocks[zid] = parsed.zoneFills[zid];
    });
    /* Re-render zones visually (function name is renderZone, not renderDropZone) */
    if (typeof renderZone === 'function') {
      Object.keys(parsed.zoneFills).forEach(function(zid){
        renderZone(zid);
      });
    }
    return true;
  }

  /* Extract zone fill status for all drop_zones → feed DragGame.update(). */
  function updateTruckGrid() {
    if (!window.DragGame) return;
    const s3 = state.currentLesson.step_3;
    if (!s3) return;
    /* A4: nếu user gõ tay mà chưa kéo block → hydrate từ #ide-code */
    hydrateZonesFromTypedSQL();

    // Build zoneFills: for each zone, extract a summary string if it has blocks
    const zoneFills = {};
    (s3.drop_zones || []).forEach(zone => {
      const blocks = state.step3Blocks[zone.id] || [];
      if (!blocks.length) return;

      // Build a readable summary from placed blocks (skip keywords for display)
      const nonKw = blocks.filter(b => b.type !== 'kw').map(b => b.token);
      if (zone.id === 'from-line') {
        zoneFills[zone.id] = blocks.find(b => b.type === 'tbl')?.token || nonKw.join(' ');
      } else if (zone.id === 'select-line') {
        zoneFills[zone.id] = blocks.filter(b => b.type === 'col' || b.type === 'fn').map(b => b.token).join(', ');
      } else if (zone.id === 'where-line') {
        zoneFills[zone.id] = nonKw.join(' ');
      } else {
        zoneFills[zone.id] = nonKw.length ? nonKw.join(' ') : blocks.map(b => b.token).join(' ');
      }
    });

    // Check completion: full SQL matches expected_sql
    // AUDIT-FIX 2026-07-04: dung sai khoảng trắng quanh ->> và quanh dấu ngoặc — block rời
    // ("settings" + "->>'theme'", "ST_DWithin" + "(geo…)") join bằng space, expected viết liền
    // → người học lắp ĐÚNG vẫn bị chấm sai (db_14 dòng 1, db_15 dòng 3).
    // M4-TC 2026-07-04: dung sai quanh dấu CHẤM — buildSQLString join token bằng space
    // ("LogEvent .objects") trong khi expected viết liền ("LogEvent.objects") → db_16 lắp
    // đúng 100% vẫn fail full-match. SQL/ORM không cần space quanh '.' nên normalize an toàn.
    const normFull = s => (s || '').replace(/;$/, '').trim().replace(/\s+/g, ' ')
      .replace(/\s*->>\s*/g, '->>').replace(/\s*\(\s*/g, '(').replace(/\s*\)\s*/g, ')')
      .replace(/\s*\.\s*/g, '.');
    const expected = normFull(s3.expected_sql);
    const builtSQL = normFull(buildSQLString());
    const isComplete = builtSQL === expected;

    // v4 FIX: chấm ĐÚNG/SAI nội dung TỪNG mệnh đề (so nội dung THÔ của zone với expected clause).
    // → pipeline chỉ ✓ 1 ga khi mệnh đề đó THỰC SỰ đúng, không phải cứ có block/đúng-loại là ✓.
    // M4-TC 2026-07-04: bài có zone ĐẶC THÙ (không phải select/from/where/group/having/order —
    // vd ORM db_16, SQLi db_17, procedure/trigger/CTE khóa TC) khai expected_zones trong step_3:
    // { zoneId: 'nội dung đúng của zone (kể cả keyword)' } — override/bổ sung kết quả parse.
    // Trước fix này mọi zone đặc thù bị exp==null → zoneCorrect=false → lắp đúng vẫn "✗ dòng 1,2,3".
    const expZone = Object.assign(expectedZoneContent(s3.expected_sql || ''), s3.expected_zones || {});
    const normClause = t => (t || '').toUpperCase().replace(/,/g, ' ')
      .replace(/\s*->>\s*/g, '->>').replace(/\s*\(\s*/g, '(').replace(/\s*\)\s*/g, ')')
      .replace(/\s*\.\s*/g, '.')
      .replace(/\s+/g, ' ').trim();
    const zoneCorrect = {};
    (s3.drop_zones || []).forEach(zone => {
      const blocks = state.step3Blocks[zone.id] || [];
      if (!blocks.length) return;
      const raw = blocks.map(b => b.token).join(' ');
      const exp = expZone[zone.id];
      zoneCorrect[zone.id] = (exp != null) && normClause(raw) === normClause(exp);
    });

    // v5: số DÒNG sai (1-based theo thứ tự drop_zones = số dòng hiển thị trong editor).
    // Chỉ SỐ DÒNG — không nói sai gì / đúng phải là gì (user chốt: không làm hộ).
    // Dòng sai = (có block nhưng nội dung sai) HOẶC (bỏ trống trong khi đáp án cần).
    const wrongLines = [];
    (s3.drop_zones || []).forEach((zone, i) => {
      const filled = (state.step3Blocks[zone.id] || []).length > 0;
      const exp = expZone[zone.id];
      if ((filled && zoneCorrect[zone.id] === false) || (!filled && exp != null)) {
        wrongLines.push(i + 1);
      }
    });

    // v4: KHÔNG gửi lời giải thích per-clause nữa (user chốt: chỉ "Chưa đúng", không làm hộ).
    // zoneCorrect vẫn dùng để tô ĐỎ đúng ga sai trên bản đồ (người học tự nhìn ra).
    window.DragGame.update({
      zoneFills: zoneFills,
      zoneCorrect: zoneCorrect,   // v4: per-clause correctness cho pipeline (tô đỏ ga sai)
      wrongLines: wrongLines,     // v5: số dòng sai (chỉ SỐ, không nội dung) cho feedback
      isComplete: isComplete,
      expected: expected,    // FIX 2g-A4: pass for diagnostic on incorrect feedback
      userBuilt: builtSQL,   // FIX 2g-A4: pass for diagnostic on incorrect feedback
    });
  }

  /* v4: tách expected_sql thành nội dung MỆNH ĐỀ theo zone (để pipeline chấm từng ga).
   * AUDIT-FIX 2026-07-04: PAREN-AWARE — mask nội dung trong ngoặc trước khi tìm boundary,
   * vì "FROM" trong EXTRACT(YEAR FROM CURRENT_DATE) từng bị nhận nhầm là mệnh đề FROM
   * → expZone select/from sai → db_02 lắp đúng 100% vẫn bị báo "sai dòng 1, 2".
   * (Cùng lớp lỗi PE_parseSQLToBlocks đã vá ở 4A-E2.) Boundary tìm trên bản MASK,
   * nội dung cắt từ bản GỐC theo cùng chỉ số (mask giữ nguyên độ dài). */
  function expectedZoneContent(sql) {
    sql = (sql || '').replace(/;$/, '').trim();
    let masked = sql;
    for (let guard = 0; guard < 10 && /\([^()]*\)/.test(masked); guard++) {
      masked = masked.replace(/\([^()]*\)/g, s => '(' + 'X'.repeat(s.length - 2) + ')');
    }
    const m = {};
    const seg = (startRe, endRe, label) => {
      const sm = masked.match(startRe);
      if (!sm) return null;
      const from = sm.index + sm[0].length;
      const rest = masked.slice(from);
      const em = endRe ? rest.match(endRe) : null;
      const to = em ? from + em.index : masked.length;
      const content = sql.slice(from, to).trim();
      if (content) m[label[0]] = label[1] + ' ' + content;
      return null;
    };
    const END = /\s+\bWHERE\b|\s+\bGROUP\s+BY\b|\s+\bORDER\s+BY\b|\s+\bHAVING\b/i;
    seg(/\bSELECT\b\s+/i, /\s+\bFROM\b/i, ['select-line', 'SELECT']);
    seg(/\bFROM\b\s+/i, END, ['from-line', 'FROM']);
    seg(/\bWHERE\b\s+/i, /\s+\bGROUP\s+BY\b|\s+\bORDER\s+BY\b|\s+\bHAVING\b/i, ['where-line', 'WHERE']);
    seg(/\bGROUP\s+BY\b\s+/i, /\s+\bORDER\s+BY\b|\s+\bHAVING\b/i, ['group-line', 'GROUP BY']);
    seg(/\bHAVING\b\s+/i, /\s+\bORDER\s+BY\b/i, ['having-line', 'HAVING']);
    seg(/\bORDER\s+BY\b\s+/i, null, ['order-line', 'ORDER BY']);
    return m;
  }

  function buildSQLString() {
    const s3 = state.currentLesson.step_3;
    const parts = [];
    s3.drop_zones.forEach(zone => {
      const blocks = state.step3Blocks[zone.id];
      if (!blocks || !blocks.length) return;
      blocks.forEach((b, idx) => {
        parts.push(b.token);
        if (idx < blocks.length - 1) {
          const next = blocks[idx + 1];
          // Comma only between two value-type tokens (col/fn/val) in same zone
          // Skip between value and operator (col,op / op,val) — those use space
          const isValueType = t => t === 'col' || t === 'fn' || t === 'val';
          if (isValueType(b.type) && isValueType(next.type)) {
            parts.push(',');
          }
        }
      });
    });
    return parts.join(' ').trim().replace(/\s+,/g, ',');
  }

  function updateRevealHint() {
    const s3 = state.currentLesson.step_3;
    const totalBlocks = Object.values(state.step3Blocks).reduce((sum, arr) => sum + arr.length, 0);
    const totalAvailable = s3.blocks.length;
    const totalZones = s3.drop_zones.length;
    const filledZones = s3.drop_zones.filter(z => state.step3Blocks[z.id] && state.step3Blocks[z.id].length).length;

    const hintEl = document.getElementById('reveal-hint-text');
    if (!hintEl) return; // element removed in new compact layout

    if (totalBlocks === 0) {
      hintEl.innerHTML = 'Bắt đầu bằng cách kéo khối <strong>SELECT</strong> vào dòng đầu tiên.';
    } else if (filledZones < totalZones) {
      const next = s3.drop_zones.find(z => !state.step3Blocks[z.id] || state.step3Blocks[z.id].length === 0);
      if (next && s3.reveal_hints && s3.reveal_hints[next.id]) {
        hintEl.innerHTML = s3.reveal_hints[next.id];
      }
    } else if (totalBlocks < totalAvailable) {
      hintEl.innerHTML = 'Còn thừa khối lệnh chưa dùng. Có thể bạn đã chọn dư — bỏ qua cũng được, hoặc bấm <strong>Tới Tự Code</strong>.';
    } else {
      // All filled — check match (use same build logic as updateIDEFromBlocks)
      const parts = [];
      s3.drop_zones.forEach(zone => {
        const blocks = state.step3Blocks[zone.id];
        if (!blocks || !blocks.length) return;
        blocks.forEach((b, idx) => {
          parts.push(b.token);
          if (idx < blocks.length - 1) {
            const next = blocks[idx + 1];
            const isValueType = t => t === 'col' || t === 'fn' || t === 'val';
            if (isValueType(b.type) && isValueType(next.type)) parts.push(',');
          }
        });
      });
      const genStr = parts.join(' ').trim().replace(/\s+,/g, ',');
      const expected = s3.expected_sql.replace(/;$/, '').trim();

      const genNorm = genStr.replace(/\s+/g, ' ');
      const expNorm = expected.replace(/\s+/g, ' ');

      if (genNorm.toUpperCase() === expNorm.toUpperCase()) {
        hintEl.innerHTML = '🎉 Hoàn hảo! Câu SQL khớp 100%. Bấm <strong>Tới Tự Code</strong> để sang bước 4.';
        // CSS classes step3-feedback-success / step3-feedback-warn replace
        // 6 inline assignments on the parent (background, border-top, color).
        // See lesson_db_design.css.
        hintEl.parentElement.classList.remove('step3-feedback-warn');
        hintEl.parentElement.classList.add('step3-feedback-success');
        // Guard A4: chỉ cộng XP Step 3 đúng 1 lần mỗi completion
        if (!state.step3XPAwarded) {
          state.step3XPAwarded = true;
          addXP(30);
        }
      } else {
        hintEl.innerHTML = '⚠️ Cú pháp gần đúng nhưng chưa khớp. Kiểm tra lại thứ tự hoặc dấu phẩy giữa các cột.';
        hintEl.parentElement.classList.remove('step3-feedback-success');
        hintEl.parentElement.classList.add('step3-feedback-warn');
      }
    }
  }

  function renderLineNumbers(n) {
    const el = document.getElementById('ide-line-numbers');
    el.innerHTML = Array.from({ length: n }, (_, i) => i + 1).join('<br>');
  }

  function highlightSQL(sql) {
    if (!sql) return '<span class="t-comment">-- Query của bạn sẽ hiện ở đây</span>';

    // Tokenize: keywords, strings, numbers, identifiers
    const tokens = sql.split(/(\s+|[;,()'])/);
    return tokens.map(t => {
      const upper = t.toUpperCase().trim();
      if (!t.trim()) return t;
      if (SYNTAX_KEYWORDS.includes(upper)) return `<span class="t-keyword">${escapeHtml(t)}</span>`;
      if (/^['"]/.test(t)) return `<span class="t-string">${escapeHtml(t)}</span>`;
      if (/^\d/.test(t)) return `<span class="t-number">${escapeHtml(t)}</span>`;
      if (/^[=<>!+\-*/]/.test(t)) return `<span class="t-operator">${escapeHtml(t)}</span>`;
      return escapeHtml(t);
    }).join('');
  }

  /* Simple SQL highlighter for static syntax example display (Step 1).
     Lighter than highlightSQL — only colors keywords, strings, numbers, comments. */
  function highlightSimpleSQL(code) {
    if (!code) return '';
    let html = escapeHtml(code);
    // Comments first (-- and #) so they don't get touched by keyword regex
    html = html.replace(/(--[^\n]*)/g, '<span class="sk-comment">$1</span>');
    // Keywords (case-insensitive, word boundary)
    const kwRe = new RegExp('\\b(' + SYNTAX_KEYWORDS.join('|') + ')\\b', 'gi');
    html = html.replace(kwRe, '<span class="sk-kw">$1</span>');
    // String literals
    html = html.replace(/('[^']*')/g, '<span class="sk-str">$1</span>');
    // Numbers (skip those already inside a span)
    html = html.replace(/(?<![>])\b(\d+\.?\d*)\b(?![<])/g, '<span class="sk-num">$1</span>');
    return html;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /* ═══════════════════════════════════════════════════════════════
   * STEP 4 — Pure Code (CodeMirror + Run + Validate)
   * Dispatches to 4 challenge types: full_ide / mcq_code / fill_blank / bug_fix
   * ═══════════════════════════════════════════════════════════════ */
  function initStep4() {
    const l = state.currentLesson;
    const s4 = l.step_4;

    if (!s4) {
      document.querySelector('#step-4 .split-pane').innerHTML = `
        <div style="padding:40px;color:var(--text-400);text-align:center;width:100%;">
          Nội dung tự code đang cập nhật.
        </div>
      `;
      return;
    }

    // Determine challenge type (default: full_ide)
    const challengeType = l.challenge_type || s4.challenge_type || 'full_ide';
    state.challengeState = { type: challengeType, submitted: false };

    // Title + prompt
    document.getElementById('step4-title').textContent = l.title;
    document.getElementById('step4-prompt').innerHTML = s4.prompt || '';

    // SCHEMA PANEL ĐÃ BỎ (PHASE 2e-C1). User tự gõ `SELECT * FROM …` rồi Run để khám phá
    // schema trong Results panel (cột 3 full). Hàm renderStep4Schema + enhanceStep4Schema
    // vẫn còn (DORMANT) — s4.schema.data VẪN cần cho PE_runSQL engine.
    // KHÔNG gọi enhanceStep4Schema render panel nữa; PE_runSQL đọc s4.schema.data trực tiếp.

    // Premium: hint panel với 4 levels (progressive)
    const hintMount = document.getElementById('step4-hint-mount');
    if (hintMount && s4.hints && s4.hints.length) {
      enhanceHintPanel(hintMount, s4);
    } else if (hintMount) {
      hintMount.innerHTML = '';
    }

    // Hide ALL challenge panes first
    document.querySelectorAll('.challenge-pane').forEach(p => { p.hidden = true; });

    // Dispatch to correct renderer
    const targetPane = document.querySelector(`.challenge-pane[data-challenge="${challengeType}"]`);
    if (targetPane) {
      targetPane.hidden = false;
      if (challengeType === 'full_ide') initChallengeFullIDE(s4, targetPane);
      else if (challengeType === 'mcq_code') initChallengeMCQCode(s4, targetPane);
      else if (challengeType === 'fill_blank') initChallengeFillBlank(s4, targetPane);
      else if (challengeType === 'bug_fix') initChallengeBugFix(s4, targetPane);
    }

    // Reset terminal
    const term = document.getElementById('terminal-output');
    term.innerHTML = '<span class="prompt-arrow">$</span> Đang chờ bạn hoàn thành thử thách...';
    // C4 (STAGE 2d): reset results panel (cột 3) — clean slate cho mỗi bài
    renderStep4Idle();

    // FIX 2e-C2: data-driven context giàu. Render s4.context vào #step4-instructions.
    // Bài nào có context → render đầy đủ (scenario+steps+example+expected).
    // Bài nào KHÔNG có → fallback về instructions-block trống, không crash.
    renderStep4Context(s4);
  }

  /**
   * FIX 2e-C2: render s4.context (giàu) vào pane cột 1 — bài nào có thì hiện,
   * bài nào fallback về rỗng. KHÔNG đụng #step4-prompt (vẫn giữ prompt cũ).
   * Schema cho context:
   *   s4.context = {
   *     scenario:    'string' — bối cảnh ngắn (1-2 câu),
   *     steps:       ['string', ...] — các bước gợi ý (3-5 bước),
   *     hint_explore:'string' — "chưa biết bảng? gõ SELECT * FROM ... Run để xem", CHỈ hiện cho full_ide,
   *     example:     { question, sql, sample_output } — worked example KHÁC đáp án,
   *     expected:    'string' — kết quả mong đợi (prose),
   *   }
   */
  function renderStep4Context(s4) {
    const mount = document.getElementById('step4-instructions');
    if (!mount) return;
    const ctx = s4 && s4.context;
    if (!ctx) {
      mount.innerHTML = '';
      mount.classList.remove('has-context');
      return;
    }
    mount.classList.add('has-context');
    const challengeType = s4.challenge_type || 'full_ide';
    const parts = [];
    if (ctx.scenario) {
      parts.push(`<div class="context-scenario"><span class="ctx-tag ctx-tag-scenario">📖 Bối cảnh</span><div class="ctx-body">${ctx.scenario}</div></div>`);
    }
    if (ctx.real_world) {
      parts.push(`<div class="context-realworld"><span class="ctx-tag ctx-tag-realworld">🌍 Trong thực tế</span><div class="ctx-body">${ctx.real_world}</div></div>`);
    }
    if (Array.isArray(ctx.steps) && ctx.steps.length) {
      const lis = ctx.steps.map((s) => `<li>${s}</li>`).join('');
      parts.push(`<div class="context-steps"><span class="ctx-tag ctx-tag-steps">🪜 Các bước</span><ol class="ctx-body">${lis}</ol></div>`);
    }
    if (ctx.hint_explore && challengeType === 'full_ide') {
      parts.push(`<div class="context-hint-explore"><i class="fa-solid fa-lightbulb"></i> ${ctx.hint_explore}</div>`);
    }
    // PHASE 3.5-A1: bỏ render "Ví dụ tương tự" (block ctx.example) — GIỮ data s4.context.example backward-safe
    // if (ctx.example && typeof ctx.example === 'object') {
    //   const ex = ctx.example;
    //   let exInner = '';
    //   if (ex.question) exInner += `<div class="ctx-example-q"><span class="ctx-tag ctx-tag-example">📚 Ví dụ tương tự</span>${ex.question}</div>`;
    //   if (ex.sql) exInner += `<pre class="ctx-example-sql"><code>${escapeHtmlForContext(ex.sql)}</code></pre>`;
    //   if (ex.sample_output) exInner += `<div class="ctx-example-output"><span class="ctx-tag ctx-tag-output">→ Output</span>${ex.sample_output}</div>`;
    //   if (exInner) parts.push(`<div class="context-example">${exInner}</div>`);
    // }
    if (ctx.expected) {
      parts.push(`<div class="context-expected"><span class="ctx-tag ctx-tag-expected">🎯 Kết quả mong đợi</span><div class="ctx-body">${ctx.expected}</div></div>`);
    }
    mount.innerHTML = parts.join('\n');
  }

  function escapeHtmlForContext(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // DORMANT 2e-C1: schema panel removed (user: tự SELECT * khám phá); s4.schema.data vẫn dùng cho PE_runSQL
  function renderStep4Schema(s4) {
    const schemaEl = document.getElementById('step4-schema');
    if (!schemaEl) return;  // guard: schemaEl không tồn tại → no-op
    // Guard: data có thể thiếu schema (vd: bài mcq_code không cần schema panel)
    if (!s4 || !s4.schema || !s4.schema.table_name) {
      schemaEl.innerHTML = '<div style="font-size:12px;color:var(--text-400);font-style:italic;padding:12px;">Không có schema cho bài này.</div>';
      return;
    }
    schemaEl.innerHTML = `
      <div style="font-size:11px;font-weight:700;color:var(--text-500);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">
        <i class="fa-solid fa-table"></i> ${s4.schema.table_name}
      </div>
    `;
    s4.schema.columns.forEach(col => {
      const row = document.createElement('div');
      row.className = 'schema-row';
      row.innerHTML = `
        <span class="col-icon">${col.key === 'PK' ? '🔑' : '○'}</span>
        <span class="col-name">${col.name}</span>
        <span class="col-type">${col.type}</span>
        ${col.key ? `<span class="col-key">${col.key}</span>` : ''}
      `;
      schemaEl.appendChild(row);
    });
    if (s4.schema.data && s4.schema.data.length) {
      const dataWrap = document.createElement('div');
      dataWrap.classList.add('flagship-data-wrap');
      dataWrap.innerHTML = `
        <div style="font-size:10px;font-weight:700;color:var(--text-500);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Sample Data</div>
        <table class="data-table" style="font-size:11px;">
          <thead><tr>${s4.schema.columns.map(c => `<th>${c.name}</th>`).join('')}</tr></thead>
          <tbody>${s4.schema.data.map(r => `<tr>${r.map((c, i) => `<td class="${s4.schema.columns[i].key === 'PK' ? 'pk-cell' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      `;
      schemaEl.appendChild(dataWrap);
    }
  }

  /* ── Challenge type: full_ide (CodeMirror) ─────────────────────── */
  function initChallengeFullIDE(s4, pane) {
    pane.innerHTML = '<div id="code-editor" style="flex:1;display:flex;flex-direction:column;min-height:0;"></div>';
    // C2 (STAGE 2d): full_ide → editor TRỐNG, không load draft cũ, không seed starter.
    // Ghost placeholder hiển thị hint thay vì starter SQL (tránh user copy-paste starter mà không hiểu).
    const lessonId = state.currentLesson && state.currentLesson.id;
    const draftKey = `pe_draft_${lessonId}`;
    if (lessonId) {
      try { localStorage.removeItem(draftKey); } catch (_) { /* defensive */ }
    }
    const initialValue = '';
    const ghostHint = s4.starter_hint || '💡 Gõ câu SQL của bạn vào đây. Bắt đầu bằng SELECT ...';
    if (window.CodeMirror) {
      state.cmEditor = CodeMirror(pane.querySelector('#code-editor'), {
        value: initialValue,
        mode: 'text/x-sql',
        theme: 'material-darker',
        lineNumbers: true,
        indentUnit: 2,
        tabSize: 2,
        autofocus: false,
        matchBrackets: true,
        placeholder: ghostHint
      });
      state.cmEditor.on('change', () => {
        // Đóng gợi ý khi user bắt đầu gõ lại (tránh spoiler)
        const hintDetails = document.getElementById('step4-hint-details');
        if (hintDetails && hintDetails.open) hintDetails.open = false;
      });
    } else {
      pane.querySelector('#code-editor').innerHTML =
        `<textarea id="cm-fallback" style="flex:1;width:100%;background:#0F172A;color:#F1F5F9;font-family:'JetBrains Mono',monospace;font-size:14px;padding:16px;border:none;outline:none;resize:none;line-height:1.7;" placeholder="${escapeHtml(ghostHint)}"></textarea>`;
    }
  }

  /* ── Challenge type: mcq_code (4 query options) ────────────────── */
  function initChallengeMCQCode(s4, pane) {
    state.challengeState.mcqCodeLocked = false;
    state.challengeState.mcqCodeAnswer = null;
    const host = pane.querySelector('#mcq-code-host');
    host.innerHTML = `
      <p class="mcq-code-question">${s4.prompt || 'Chọn câu SQL đúng:'}</p>
      <div class="mcq-code-options" id="mcq-code-options"></div>
    `;
    const wrap = host.querySelector('#mcq-code-options');
    (s4.options || []).forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'mcq-code-option';
      btn.dataset.correct = opt.correct;
      btn.dataset.optIdx = i;
      btn.innerHTML = `
        <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
        <pre style="margin:0;background:transparent;padding:0;font-family:inherit;color:inherit;white-space:pre-wrap;">${escapeHtml(opt.text)}</pre>
      `;
      btn.addEventListener('click', () => handleMCQCodeClick(btn, opt, s4));
      wrap.appendChild(btn);
    });
  }

  function handleMCQCodeClick(btn, opt, s4) {
    if (state.challengeState.mcqCodeLocked) return;
    state.challengeState.mcqCodeLocked = true;
    state.challengeState.mcqCodeAnswer = opt;

    const options = document.querySelectorAll('.mcq-code-option');
    if (opt.correct) {
      btn.classList.add('correct');
      addXP(15);
      celebrate();
      flashTerminal('success', `✓ Đúng rồi! Đáp án chính là option này.\n\n→ ${s4.xp_reward || 50} XP + 10 Gems!`);
      triggerStep4Success();
      setTimeout(showSuccess, 1000);
    } else {
      btn.classList.add('wrong');
      loseHeart();
      setTimeout(() => {
        options.forEach(o => {
          if (o.dataset.correct === 'true') o.classList.add('correct');
          else o.classList.add('dimmed');
        });
        flashTerminal('error', `✗ Sai rồi — đáp án đúng đã highlight.\n${opt.explain || 'Đọc lại đề bài và schema bên trái.'}`);
      }, 400);
    }
  }

  /* ── Challenge type: fill_blank (partial SQL with input boxes) ─── */
  function initChallengeFillBlank(s4, pane) {
    state.challengeState.fillBlankAnswers = {};
    const host = pane.querySelector('#fill-blank-host');
    // s4.template = 'SELECT ____ FROM ____ WHERE ____ = ____;'
    // s4.blanks = [{id, hint, expected}]
    const template = s4.template || '';
    const blanks = s4.blanks || [];

    let html = `<p class="fill-blank-instruction">${s4.prompt || 'Điền các từ khóa/cột còn thiếu vào chỗ trống:'}</p>`;
    html += '<div class="fill-blank-code" id="fill-blank-code">';
    // Replace ____ with input
    const parts = template.split('____');
    parts.forEach((part, i) => {
      html += escapeHtml(part);
      if (i < parts.length - 1) {
        const blank = blanks[i] || { id: `b${i}`, hint: '' };
        html += `<input type="text" class="fill-blank-input" data-blank-idx="${i}" placeholder="${blank.hint || '?'}" autocomplete="off" spellcheck="false" />`;
      }
    });
    html += '</div>';
    if (blanks.length > 0) {
      html += `<p class="fill-blank-hint"><i class="fa-solid fa-keyboard"></i> Gợi ý: ${blanks.map(b => `<code>${b.hint || b.expected}</code>`).join(' · ')}</p>`;
    }
    host.innerHTML = html;
  }

  /* ── Challenge type: bug_fix (fix wrong SQL) ──────────────────── */
  function initChallengeBugFix(s4, pane) {
    state.challengeState.bugFix = { answer: s4.buggy || '' };
    const host = pane.querySelector('#bug-fix-host');
    const lines = (s4.buggy || '').split('\n');
    const buggyLineIdx = s4.buggy_line !== undefined ? s4.buggy_line : 0;

    let html = `<div class="bug-fix-brief">${s4.prompt || '<strong>Bug:</strong> Query dưới đây chạy SAI. Sửa cho ra kết quả đúng. (Click vào dòng lỗi để edit)'}</div>`;
    html += '<div class="bug-fix-editor" id="bug-fix-editor" contenteditable="true" spellcheck="false">';
    lines.forEach((line, i) => {
      const isBuggy = (i === buggyLineIdx);
      html += `<span class="bug-fix-line${isBuggy ? ' buggy' : ''}" data-line-idx="${i}">${escapeHtml(line) || '&nbsp;'}</span>`;
    });
    html += '</div>';
    html += '<p class="fill-blank-hint" style="margin-top:8px;"><i class="fa-solid fa-bug"></i> Dòng được tô đỏ là dòng nghi ngờ — bạn click trực tiếp vào đó để sửa.</p>';
    host.innerHTML = html;
  }

  /* ── Dispatcher: Run / Submit (used by onclick) ────────────────── */
  window.handleChallengeRun = function (isSubmit) {
    const s4 = state.currentLesson.step_4;
    const type = state.challengeState && state.challengeState.type || 'full_ide';
    if (type === 'full_ide') return runCodeIDE(isSubmit);
    if (type === 'mcq_code') {
      // mcq_code handles its own click; Run button is mostly disabled / informative
      flashTerminal('info', 'Chọn 1 trong 4 đáp án bên trên rồi bấm Submit để chốt.');
      return;
    }
    if (type === 'fill_blank') return runCodeFillBlank(isSubmit);
    if (type === 'bug_fix') return runCodeBugFix(isSubmit);
  };

  window.handleChallengeReset = function () {
    initStep4();
  };

  function runCodeIDE(isSubmit) {
    const userCode = state.cmEditor
      ? state.cmEditor.getValue().trim()
      : (document.getElementById('cm-fallback') || {}).value || '';
    const term = document.getElementById('terminal-output');
    const s4 = state.currentLesson.step_4;

    if (!userCode) {
      flashTerminal('error', '[!] Bạn chưa nhập query nào. Hãy thử gõ SELECT ... và nhấn Run.');
      renderStep4Error('Chưa có query nào để chạy.');
      return;
    }
    flashTerminal('info', `$ ${isSubmit ? 'Đang submit...' : 'Đang chạy thử...'}`);

    // C4 (STAGE 2d): chạy query thật với PE_runSQL (helper từ drag_game.js A4)
    // → render bảng kết quả vào cột 3 (Codecademy-style "Results" panel)
    let liveResult = null;
    try {
      if (typeof window.PE_runSQL === 'function') {
        liveResult = window.PE_runSQL(userCode, s4);
      }
    } catch (e) {
      console.warn('[runCodeIDE] PE_runSQL error:', e);
    }

    if (liveResult && liveResult.pending) {
      /* 4A-E2-fix: pending neutral (E3-scope). KHUNG INFO cyan/amber, KHÔNG đỏ-tam-giác.
       * 4A-E3-equiv-fix: bài có s4.equiv_sql thay vì pending "đáp án ĐÚNG" (flash 0.6s giả) hiện
       * ngay placeholder "⏳ Đang kiểm tra…" — setTimeout 600ms sẽ OVERWRITE bằng kết quả
       * equiv thật (Accept) hoặc neutral "gõ đúng query để xem kết quả" (Reject). */
      if (s4.equiv_sql) {
        renderStep4Checking();
      } else {
        renderStep4Pending(liveResult.msg);
      }
    } else if (liveResult && liveResult.error) {
      // Query có lỗi parse/exec → render error panel + skip validation
      renderStep4Error(liveResult.error);
    } else if (liveResult && Array.isArray(liveResult.cols) && Array.isArray(liveResult.rows)) {
      // Query chạy được → render bảng kết quả thật
      renderStep4Results(liveResult.cols, liveResult.rows);
    } else {
      // Fallback nếu PE_runSQL không có / không trả về
      renderStep4Idle();
    }

    /* 4A-E3-equiv: 600ms sau khi chạy userCode, validateSQL Accept → có thể chạy
     * equiv_sql (Bài 16/17/19). Runner phải DO validateSQL LÁI panel results cuối cùng
     * — KHÔNG dùng userCode (userCode có thể là ORM/spatial/%s parser không hiểu → pending).
     *
     * - Accept + s4.equiv_sql exists → run equiv_sql → renderStep4Results (OVERWRITE pending).
     * - Accept + no equiv        → keep current render (liveResult đã đúng).
     * - Reject                     → renderStep4Neutral (KHÔNG hiện pending/false-correct).
     */
    setTimeout(() => {
      const result = validateSQL(userCode, s4.expected_sql);
      if (result.correct) {
        flashTerminal('success', `✓ Accepted! (0.04s)\n\n${result.feedback || 'Đáp án đúng 100%.'}\n\n→ ${s4.xp_reward || 50} XP + 10 Gems!`);
        addXP(s4.xp_reward || 50);
        // Xóa draft khi submit đúng
        if (isSubmit && state.currentLesson && state.currentLesson.id) {
          localStorage.removeItem(`pe_draft_${state.currentLesson.id}`);
        }
        if (isSubmit) { triggerStep4Success(); setTimeout(showSuccess, 1200); }
        /* Equiv runner: only when bài có s4.equiv_sql (Bài 16 spatial, Bài 17 ORM, Bài 19 %s). */
        if (s4.equiv_sql && typeof window.PE_runSQL === 'function') {
          try {
            const eqRes = window.PE_runSQL(s4.equiv_sql, s4);
            if (eqRes && Array.isArray(eqRes.cols) && Array.isArray(eqRes.rows)) {
              renderStep4Results(eqRes.cols, eqRes.rows);
            } else if (eqRes && eqRes.error) {
              /* Equiv SQL itself lỗi — KHÔNG replace pending (false-correct). */
              console.warn('[E3-equiv] equiv_sql error:', eqRes.error);
            }
          } catch (e) {
            console.warn('[E3-equiv] equiv_sql exception:', e);
          }
        }
      } else {
        /* 4A-E3-equiv-fix: gate by liveResult.pending — không gate by s4.equiv_sql.
         *
         * - reject + liveResult = bảng thật / lỗi cú pháp thật → GIỮ panel (đã render
         *   ở immediate path trên). KHÔNG xóa kết quả đang hiển thị — phá IDE khám phá
         *   (Bài 1 `WHERE id=102` reject → VẪN hiện bảng id=102).
         *
         * - reject + liveResult.pending (bài equiv HOẶC bài thường user lỡ gõ clause
         *   chưa hỗ trợ như CASE/IN-subquery/JOSN->>) → neutral "gõ đúng query…".
         *   Tránh false-correct "đáp án ĐÚNG" cho SQL sai. */
        if (liveResult && liveResult.pending) {
          renderStep4Neutral('Câu query chưa khớp đáp án — bạn có thể thử lại hoặc bấm "Gợi ý" bên trái.');
        }
        flashTerminal('error', `✗ Wrong Answer\n\n${result.error || 'Query chưa đúng.'}\n\n${result.suggestion || ''}`);
        if (isSubmit) loseHeart();
        if (s4.hints && s4.hints.length > 0) showNextHint();
      }
    }, 600);
  }

  function runCodeFillBlank(isSubmit) {
    const inputs = document.querySelectorAll('.fill-blank-input');
    const s4 = state.currentLesson.step_4;
    const blanks = s4.blanks || [];

    let correct = 0;
    inputs.forEach((inp, i) => {
      const expected = (blanks[i] && blanks[i].expected || '').trim().toUpperCase();
      const got = inp.value.trim().toUpperCase();
      inp.classList.remove('correct', 'wrong');
      if (got === expected) {
        inp.classList.add('correct');
        correct++;
      } else {
        inp.classList.add('wrong');
      }
    });

    // C4 (STAGE 2d): ghép SQL hoàn chỉnh từ template + inputs, chạy PE_runSQL → render cột 3
    // M5-TC 2026-07-04: template KHÔNG PHẢI SQL (pseudo-code MapReduce tc_07…) thì đừng đưa
    // vào engine — parser sẽ đỏ "Lỗi truy vấn" cho code không hề là truy vấn. Render neutral.
    if (s4.template) {
      const parts = s4.template.split('____');
      const assembled = parts.map((p, i) => i < parts.length - 1 ? p + (inputs[i]?.value || '') : p).join('');
      if (!/\bSELECT\b/i.test(s4.template)) {
        renderStep4Neutral('Bài này là pseudo-code — chấm theo từng ô điền, không chạy SQL.');
      } else {
      try {
        if (typeof window.PE_runSQL === 'function') {
          const live = window.PE_runSQL(assembled, s4);
          if (live && live.pending) renderStep4Pending(live.msg);
          else if (live && live.error) renderStep4Error(live.error);
          else if (live && live.cols) renderStep4Results(live.cols, live.rows);
        }
      } catch (e) { /* defensive */ }
      }
    }

    if (correct === inputs.length) {
      flashTerminal('success', `✓ Tuyệt vời! Bạn đã điền đúng ${correct}/${inputs.length} ô.\n\n→ ${s4.xp_reward || 50} XP!`);
      addXP(s4.xp_reward || 50);
      if (isSubmit) { triggerStep4Success(); setTimeout(showSuccess, 1200); }
    } else {
      flashTerminal('error', `✗ Đúng ${correct}/${inputs.length}. Kiểm tra lại các ô tô đỏ.`);
      if (isSubmit) loseHeart();
    }
  }

  function runCodeBugFix(isSubmit) {
    const editor = document.getElementById('bug-fix-editor');
    const s4 = state.currentLesson.step_4;
    if (!editor) return;
    const userSQL = editor.innerText.trim();
    const result = validateSQL(userSQL, s4.expected_sql);

    // C4 (STAGE 2d): chạy PE_runSQL trên user SQL sau sửa → render cột 3
    try {
      if (typeof window.PE_runSQL === 'function') {
        const live = window.PE_runSQL(userSQL, s4);
        if (live && live.pending) renderStep4Pending(live.msg);
        else if (live && live.error) renderStep4Error(live.error);
        else if (live && live.cols) renderStep4Results(live.cols, live.rows);
      }
    } catch (e) { /* defensive */ }

    if (result.correct) {
      flashTerminal('success', `✓ Đã sửa xong! Query giờ trả về kết quả đúng.\n\n→ ${s4.xp_reward || 50} XP!`);
      addXP(s4.xp_reward || 50);
      if (isSubmit) { triggerStep4Success(); setTimeout(showSuccess, 1200); }
    } else {
      flashTerminal('error', `✗ Vẫn còn lỗi. ${result.error || 'Kiểm tra lại từng dòng.'}`);
      if (isSubmit) loseHeart();
    }
  }

  function flashTerminal(kind, text) {
    const term = document.getElementById('terminal-output');
    const cls = kind === 'success' ? 'success-line' : kind === 'error' ? 'error-line' : 'info-line';
    term.innerHTML = `<span class="${cls}">${escapeHtml(text)}</span>`;
  }

  // Toast Sonner-style notification (góc trên-phải, auto-dismiss sau durationMs)
  // Background + animation đi qua CSS class .pe-toast--{kind} (xem lesson_db_design.css)
  window.showToast = function (kind, message, durationMs = 3000) {
    const existing = document.getElementById('pe-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'pe-toast';
    toast.className = 'pe-toast pe-toast--' + (kind || 'info');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('pe-toast--leaving');
      setTimeout(() => toast.remove(), 300);
    }, durationMs);
  };

  function validateSQL(userSQL, expectedSQL) {
    const u = normalizeSQL(userSQL);
    const e = normalizeSQL(expectedSQL);

    // === Multi-query support (B17 SQL Injection: prepared statement + count) ===
    // Split by semicolon, compare as unordered SET
    const uQueries = u.split(';').map(q => q.trim()).filter(q => q.length > 0);
    const eQueries = e.split(';').map(q => q.trim()).filter(q => q.length > 0);

    if (eQueries.length > 1) {
      // Expected has multiple queries (e.g. B17 needs prepared statement + count)
      // User MUST provide all queries
      if (uQueries.length === 0) {
        return { correct: false, error: `Cần ${eQueries.length} câu query, bạn chưa viết câu nào.` };
      }
      if (uQueries.length < eQueries.length) {
        return { correct: false, error: `Thiếu query — cần ${eQueries.length} câu, bạn chỉ viết ${uQueries.length}.` };
      }
      if (uQueries.length > eQueries.length) {
        return { correct: false, error: `Thừa query — chỉ cần ${eQueries.length} câu, bạn viết ${uQueries.length}.` };
      }
      const uSet = new Set(uQueries);
      const eSet = new Set(eQueries);
      if ([...eSet].every(q => uSet.has(q))) {
        return { correct: true, feedback: `Đúng — đủ ${eQueries.length} câu query khớp với đáp án.` };
      }
      // Right count, wrong content — give specific error
      return {
        correct: false,
        error: `Có ${uQueries.length} câu query nhưng nội dung chưa khớp. Kiểm tra lại từng câu.`,
        suggestion: 'So sánh với gợi ý level 4 hoặc đáp án.'
      };
    }

    // Exact match (case-insensitive, whitespace-insensitive)
    if (u === e) {
      return { correct: true, feedback: 'Cú pháp và giá trị khớp hoàn toàn với đáp án mong đợi.' };
    }

    // M4-TC 2026-07-04: bài DDL/DML/CTE (CREATE FUNCTION/PROCEDURE/TRIGGER, WITH RECURSIVE,
    // UPDATE, CALL…) — nhánh clause-analysis bên dưới chỉ so SELECT/FROM/WHERE nên sẽ chấm
    // ĐÚNG OAN cho user gõ mỗi phần SELECT lõi mà thiếu vỏ CREATE/RETURNS. Với các bài này,
    // exact-match sau normalize (đã có dung sai case/space/comment) là chuẩn duy nhất.
    const ddlHead = e.match(/^(CREATE (?:OR REPLACE )?(?:FUNCTION|PROCEDURE|TRIGGER|VIEW|INDEX)|WITH RECURSIVE|UPDATE|INSERT|DELETE|CALL)\b/);
    if (ddlHead) {
      if (!u.startsWith(ddlHead[1])) {
        return {
          correct: false,
          error: `Đáp án cần bắt đầu bằng ${ddlHead[1]} — bạn đang viết một loại câu lệnh khác.`,
          suggestion: 'Xem lại cấu trúc câu lệnh ở Gợi ý mức 1-2.'
        };
      }
      return {
        correct: false,
        error: 'Đúng loại câu lệnh nhưng nội dung chưa khớp đáp án.',
        suggestion: 'So từng dòng với gợi ý — chú ý tên bảng/cột, NEW/OLD, RETURNS, thứ tự các phần.'
      };
    }

    // M5-FIX 2026-07-04 (lộ ra khi kiểm chứng Mavis v4 BUG-1): đáp án KHÔNG PHẢI SQL
    // (ORM Django bài 17, MongoDB find() bài tc_08…) — clause-analysis bên dưới chỉ hiểu
    // SELECT/FROM/WHERE nên reject từng kèm message rác "Thiếu mệnh đề SELECT" cho bài
    // không hề có SELECT. Với bài non-SQL: exact-match sau normalize là chuẩn duy nhất;
    // sai → message trung tính trỏ về gợi ý.
    const looksLikeSQL = /\bSELECT\b[\s\S]*\bFROM\b/.test(e);
    if (!looksLikeSQL) {
      return {
        correct: false,
        error: 'Chưa khớp đáp án — bài này chấm truy vấn ORM/document theo từng mắt xích.',
        suggestion: 'So từng phần với Gợi ý mức 3-4: tên method, tên alias, dấu ngoặc và thứ tự chain.'
      };
    }

    // Clause-by-clause analysis
    const uClauses = extractClauses(userSQL);
    const eClauses = extractClauses(expectedSQL);

    const errors = [];

    // Check SELECT
    if (!uClauses.select) {
      errors.push('Thiếu mệnh đề SELECT.');
    } else if (uClauses.select !== eClauses.select) {
      errors.push(`SELECT không khớp: bạn chọn "${uClauses.select}" nhưng đáp án cần "${eClauses.select}".`);
    }

    // Check FROM
    if (!uClauses.from) {
      errors.push('Thiếu mệnh đề FROM — máy không biết truy vấn bảng nào.');
    } else if (uClauses.from !== eClauses.from) {
      errors.push(`FROM không khớp: bạn dùng "${uClauses.from}" nhưng đáp án là "${eClauses.from}".`);
    }

    // Check WHERE
    if (eClauses.where && !uClauses.where) {
      errors.push('Thiếu mệnh đề WHERE — cần lọc điều kiện để lấy đúng 1 record.');
    } else if (eClauses.where && uClauses.where && uClauses.where !== eClauses.where) {
      errors.push(`WHERE không khớp: bạn viết "${uClauses.where}" nhưng đáp án cần "${eClauses.where}".`);
    }

    // M5-FIX 2026-07-04: so nốt GROUP BY / HAVING / ORDER BY — trước đây bỏ ngỏ nên
    // ROLLUP nộp cho đề CUBE (hay GROUP BY sai cột) vẫn được khen "hợp lệ về mặt logic".
    if (eClauses.groupBy && !uClauses.groupBy) {
      errors.push('Thiếu mệnh đề GROUP BY.');
    } else if (eClauses.groupBy && uClauses.groupBy && uClauses.groupBy !== eClauses.groupBy) {
      errors.push(`GROUP BY không khớp: bạn viết "${uClauses.groupBy}" nhưng đáp án cần "${eClauses.groupBy}".`);
    }
    if (eClauses.having && !uClauses.having) {
      errors.push('Thiếu mệnh đề HAVING — lọc trên kết quả nhóm.');
    } else if (eClauses.having && uClauses.having && uClauses.having !== eClauses.having) {
      errors.push(`HAVING không khớp: bạn viết "${uClauses.having}" nhưng đáp án cần "${eClauses.having}".`);
    }
    if (eClauses.orderBy && !uClauses.orderBy) {
      errors.push('Thiếu mệnh đề ORDER BY.');
    } else if (eClauses.orderBy && uClauses.orderBy && uClauses.orderBy !== eClauses.orderBy) {
      errors.push(`ORDER BY không khớp: bạn viết "${uClauses.orderBy}" nhưng đáp án cần "${eClauses.orderBy}".`);
    }

    if (errors.length === 0) {
      // Clauses match but exact string differs (e.g. extra spaces, optional semicolons)
      return { correct: true, feedback: 'Câu query hợp lệ về mặt logic.' };
    }

    return {
      correct: false,
      error: errors.join(' '),
      suggestion: 'Thử so sánh với từng dòng của đáp án. Bạn có thể bấm nút "💡 Gợi ý" bên trái.'
    };
  }

  function normalizeSQL(s) {
    return s
      // M4-TC 2026-07-04: bỏ comment dòng "-- ..." TRƯỚC khi collapse whitespace — user giữ
      // comment của starter (hành vi tự nhiên) từng làm exact-match và multi-query set-compare
      // fail dù SQL đúng. CHỈ áp cho step-4 (normalizeSQL); step-3 normFull KHÔNG strip vì
      // db_17 SQLi có token '--' là nội dung đáp án thật.
      .replace(/--[^\n]*/g, ' ')
      // M4-TC: ';' cuối + khoảng trắng/newline đuôi — /;$/ cũ miss khi user gõ Enter cuối dòng
      .replace(/\s*;+\s*$/, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([,()])\s*/g, '$1')
      .replace(/\s*=\s*/g, '=')
      // REVIEW-FIX 2026-07-04: cùng dung sai ->> như chấm step-3 (normFull) —
      // "settings ->> 'lang'" là SQL hợp lệ, không được chấm khác "settings->>'lang'".
      .replace(/\s*->>\s*/g, '->>')
      // M4-TC 2026-07-04: dung sai quanh '.' (NEW.post_id) và toán tử số học
      // (like_count + 1 ≡ like_count+1) — cần cho bài trigger/function TC.
      .replace(/\s*\.\s*/g, '.')
      .replace(/\s*([+\-*\/])\s*/g, '$1')
      .trim()
      .toUpperCase();
  }

  function extractClauses(sql) {
    const result = { select: null, from: null, where: null, groupBy: null, having: null, orderBy: null };
    const upper = sql.toUpperCase();

    // SELECT ... FROM
    const selectMatch = upper.match(/SELECT\s+(.+?)\s+FROM/i);
    if (selectMatch) result.select = selectMatch[1].trim().replace(/\s+/g, '').toUpperCase();

    // FROM
    const fromMatch = upper.match(/FROM\s+(\w+)/i);
    if (fromMatch) result.from = fromMatch[1].trim().toUpperCase();

    // WHERE
    const whereMatch = upper.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+GROUP|\s+LIMIT|;|$)/i);
    if (whereMatch) result.where = whereMatch[1].trim().replace(/\s+/g, ' ').toUpperCase();

    // M5-FIX 2026-07-04 (probe tc_06 tóm được): clause-analysis trước đây KHÔNG so
    // GROUP BY/HAVING/ORDER BY → nộp ROLLUP cho đề CUBE vẫn "hợp lệ về mặt logic".
    const groupMatch = upper.match(/GROUP\s+BY\s+(.+?)(?:\s+HAVING|\s+ORDER|\s+LIMIT|;|$)/i);
    if (groupMatch) result.groupBy = groupMatch[1].trim().replace(/\s+/g, ' ').toUpperCase();

    const havingMatch = upper.match(/HAVING\s+(.+?)(?:\s+ORDER|\s+LIMIT|;|$)/i);
    if (havingMatch) result.having = havingMatch[1].trim().replace(/\s+/g, ' ').toUpperCase();

    const orderMatch = upper.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|;|$)/i);
    if (orderMatch) result.orderBy = orderMatch[1].trim().replace(/\s+/g, ' ').toUpperCase();

    return result;
  }

  function showNextHint() {
    const s4 = state.currentLesson.step_4;
    if (!s4.hints || state.hintLevel >= s4.hints.length) return;
    // M4-TC FIX 2026-07-04: các id cũ #hint-level/#hint-text/#step4-hint-card không còn
    // tồn tại (panel gợi ý đã thay bằng #hint-panel dạng tab của enhanceHintPanel) →
    // MỌI lần reject ở step-4 ném TypeError và thang "sai thì tự mở gợi ý tiếp" chết
    // im lặng. Giờ: kích hoạt tab gợi ý kế tiếp trên panel mới.
    const tabs = document.querySelectorAll('#hint-level-tabs .hint-level-tab');
    const body = document.getElementById('hint-body');
    if (!tabs.length || !body) return;
    const idx = Math.min(state.hintLevel, tabs.length - 1);
    tabs.forEach(t => t.classList.remove('active'));
    tabs[idx].classList.add('active');
    body.innerHTML = (s4.hints[idx] && s4.hints[idx].text) || '';
    state.hintLevel++;
  }

  // Backward compat: keep window.runCode for any leftover references
  window.runCode = runCodeIDE;
  window.showNextHint = showNextHint;

  /* ═══════════════════════════════════════════════════════════════
   * Navigation
   * ═══════════════════════════════════════════════════════════════ */
  const STEP_NAMES = {
    1: 'Lý thuyết',
    2: 'Trắc nghiệm',
    3: 'Kéo thả',
    4: 'Tự code'
  };
  const TOTAL_STEPS = 4;

  function updateNavFooter() {
    const step = state.currentStep;
    const backBtn = document.getElementById('nav-back');
    const nextBtn = document.getElementById('nav-next');
    const currentEl = document.getElementById('nav-step-current');
    const nameEl = document.getElementById('nav-step-name');

    if (backBtn) backBtn.disabled = step <= 1;
    if (nextBtn) nextBtn.disabled = step >= TOTAL_STEPS;

    if (currentEl) {
      if (currentEl.textContent !== String(step)) {
        currentEl.textContent = String(step);
        currentEl.classList.remove('bump');
        // force reflow to restart animation
        void currentEl.offsetWidth;
        currentEl.classList.add('bump');
        setTimeout(() => currentEl.classList.remove('bump'), 300);
      }
    }
    if (nameEl) nameEl.textContent = STEP_NAMES[step] || '';
  }

  window.navBack = function () {
    if (state.currentStep > 1) window.goToStep(state.currentStep - 1);
  };

  window.navNext = function () {
    if (state.currentStep < TOTAL_STEPS) window.goToStep(state.currentStep + 1);
  };

  // Keyboard shortcuts: ←/→ navigate, but only when not typing in an input/editor
  function isEditingText() {
    const ae = document.activeElement;
    if (!ae) return false;
    const tag = (ae.tagName || '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (ae.isContentEditable) return true;
    // CodeMirror's content is a .CodeMirror element with its own input
    if (ae.closest && ae.closest('.CodeMirror')) return true;
    return false;
  }

  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (isEditingText()) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      window.navBack();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      window.navNext();
    }
  });

  /* ═══ BOSS SKIN — "hồ sơ vụ án" (tc_21 Social Graph Detective) ═══
   * User chốt 2026-07-05: đổi vỏ step 1-4 thành Vụ án 1-4 — thẻ hồ sơ đầu mỗi case,
   * dấu ĐÃ PHÁ ÁN khi vượt qua case, manh mối case trước hiện lại ở đầu case sau.
   * Lesson khai l.boss = { code, nav[4], cases[4]{tag,title,suspect,brief,clue} };
   * bài thường không có l.boss → cả hai hàm no-op, không đụng layout cũ. */
  function applyBossSkin(l) {
    if (!l || !l.boss) return;
    const b = l.boss;
    // Nhãn stepper: Lý thuyết/Trắc nghiệm/Kéo thả/Tự code → Vụ án 1..4
    document.querySelectorAll('#progress-track .progress-step .step-label-tiny').forEach((el, i) => {
      if (b.nav && b.nav[i]) el.textContent = b.nav[i];
    });
    // Thẻ hồ sơ đầu mỗi step-pane (case 3-4 bản slim — không chèn ép bàn kéo-thả/IDE)
    document.querySelectorAll('.step-pane').forEach(pane => {
      const n = parseInt(pane.getAttribute('data-step'), 10);
      const c = b.cases && b.cases[n - 1];
      if (!c || pane.querySelector('.case-file-card')) return;
      const pill = pane.querySelector('.step-pill');
      if (pill) pill.textContent = 'Vụ án ' + n + ' / 4';
      const card = document.createElement('div');
      card.className = 'case-file-card' + (n >= 3 ? ' cfc-slim' : '');
      card.innerHTML =
        '<div class="cfc-head">' +
          '<span class="cfc-code">' + (b.code || 'CHUYÊN ÁN') + '</span>' +
          '<span class="cfc-tag">' + (c.tag || '') + '</span>' +
          '<span class="cfc-stamp" data-case-stamp="' + n + '">ĐÃ PHÁ ÁN ✓</span>' +
        '</div>' +
        '<div class="cfc-title">' + (c.title || '') + '</div>' +
        (c.suspect ? '<div class="cfc-suspect">🎯 Nghi vấn: ' + c.suspect + '</div>' : '') +
        (c.brief ? '<div class="cfc-brief">' + c.brief + '</div>' : '') +
        (n > 1 && b.cases[n - 2] && b.cases[n - 2].clue
          ? '<div class="cfc-prev"><span class="cfc-prev-label">🧩 Manh mối từ Vụ án ' + (n - 1) + ':</span> ' + b.cases[n - 2].clue + '</div>'
          : '');
      pane.insertBefore(card, pane.firstElementChild);
    });
    updateBossStamps();
  }
  function updateBossStamps() {
    document.querySelectorAll('.cfc-stamp').forEach(st => {
      const n = parseInt(st.getAttribute('data-case-stamp'), 10);
      st.classList.toggle('stamped', state.currentStep > n);
    });
  }

  window.goToStep = function (step) {
    if (step < 1 || step > TOTAL_STEPS) return;

    // Gỡ pulse của footer "Tiếp theo" (bật khi hoàn thành step-3) khi đã chuyển bước
    const navNextEl = document.getElementById('nav-next');
    if (navNextEl) navNextEl.classList.remove('cta-pulse');

    // Fade transition giữa các step
    const currentActive = document.querySelector('.step-pane.active');
    const nextPane = document.querySelector(`.step-pane[data-step="${step}"]`);
    if (currentActive && currentActive !== nextPane) {
      // CHANGE 3: directional transitions for 1→2 (theory rises, quiz drops)
      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var fromStep = currentActive.getAttribute('data-step');
      if (!reduced && fromStep === '1' && step === '2') {
        currentActive.classList.add('entering-step1-out');
        setTimeout(function () {
          currentActive.classList.remove('active', 'entering-step1-out');
          nextPane.classList.add('active', 'entering-step2-in');
          setTimeout(function () { nextPane.classList.remove('entering-step2-in'); }, 500);
        }, 350);
      } else {
        currentActive.classList.add('step-fade-out');
        setTimeout(() => {
          currentActive.classList.remove('active', 'step-fade-out');
          nextPane.classList.add('active', 'step-fade-in');
          setTimeout(() => nextPane.classList.remove('step-fade-in'), 350);
        }, 150);
      }
    } else if (!currentActive) {
      nextPane.classList.add('active', 'step-fade-in');
      setTimeout(() => nextPane.classList.remove('step-fade-in'), 350);
    }

    // Update progress track
    document.querySelectorAll('.progress-step').forEach((el, i) => {
      el.classList.remove('active', 'done');
      const stepNum = i + 1;
      if (stepNum < step) el.classList.add('done');
      else if (stepNum === step) el.classList.add('active');
    });

    state.currentStep = step;
    updateNavFooter();

    // BOSS 2026-07-05: qua case nào đóng dấu ĐÃ PHÁ ÁN case đó (bài thường: no-op)
    if (state.currentLesson && state.currentLesson.boss) updateBossStamps();

    // Refresh CodeMirror layout (CodeMirror needs explicit refresh after becoming visible)
    if (step === 4 && state.cmEditor) {
      setTimeout(() => state.cmEditor.refresh(), 100);
    }

    // Reset Truck Grid when entering Step 3 (fresh puzzle state)
    if (step === 3 && window.DragGame) {
      window.DragGame.reset();
    }

    // Init challenge pane on entering step 4
    if (step === 4) {
      // Re-init challenge to make sure layout/CodeMirror is correct
      // (initStep4 was called once at page load — refresh it on step entry)
      const c = state.challengeState;
      if (!c) {
        initStep4();
      } else if (c.type === 'full_ide' && state.cmEditor) {
        // CodeMirror refresh already handled above
      }
    }

    // B7 — Mobile Step 3 drag-drop fallback notice (Option A)
    updateMobileStep3Notice(step);
  };

  // B7 — Mobile Step 3 drag-drop fallback notice logic (Option A per Claude v7 Part 11.4)
  function updateMobileStep3Notice(step) {
    const notice = document.getElementById('mobile-step3-notice');
    if (!notice) return;
    // Detect touch/mobile device (no hover, coarse pointer)
    const isMobile = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const shouldShow = isMobile && step === 3;
    notice.classList.toggle('is-visible', shouldShow);
  }

  // B7 — Wire up mobile notice buttons (close + skip)
  function initMobileStep3Buttons() {
    const notice = document.getElementById('mobile-step3-notice');
    if (!notice) return;
    const closeBtn = document.getElementById('mobile-step3-close-btn');
    const skipBtn = document.getElementById('mobile-step3-skip-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => notice.classList.remove('is-visible'));
    }
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        notice.classList.remove('is-visible');
        if (typeof window.goToStep === 'function') {
          window.goToStep(4);
        }
      });
    }
  }

  window.exitLesson = function () {
    if (confirm('Bạn có chắc muốn thoát? Tiến độ bài này sẽ KHÔNG được lưu (chưa hoàn thành).')) {
      window.location.href = '/courses/' + (state.courseId || 'db_design');
    }
  };

  window.reportBug = function () {
    const subject = encodeURIComponent(`[Báo lỗi] Bài ${state.currentLessonIdx + 1}: ${state.currentLesson.title}`);
    window.location.href = `mailto:support@programming-edu.com?subject=${subject}`;
  };

  /* ═══════════════════════════════════════════════════════════════
   * Success modal
   * ═══════════════════════════════════════════════════════════════ */
  function showSuccess() {
    const l = state.currentLesson;
    const s4 = l.step_4;
    const lessonNum = state.currentLessonIdx + 1;
    const courseData = window.LESSON_CONTENT[state.courseId || 'db_design'];
    const totalLessons = (courseData && courseData.lessons && courseData.lessons.length) || 20;
    document.getElementById('success-lesson-num').textContent = `Bài ${lessonNum}/${totalLessons}`;
    document.getElementById('success-lesson-title').textContent = l.title;
    document.getElementById('success-message').textContent =
      s4.success_message || 'Bạn đã hoàn thành bài học!';
    document.getElementById('reward-xp').textContent = `+${s4.xp_reward || 50}`;
    // FIX 2g-A2: achievement data-driven — chỉ hiện khi bài CÓ `l.achievement`,
    // KHÔNG fallback "Khóa chính — Khởi đầu" (đúng > sai; bài 2-20 thiếu data → ẩn hẳn).
    const achBlock = document.getElementById('achievement-unlock-block');
    if (achBlock) {
      if (l.achievement && l.achievement.name) {
        document.getElementById('achievement-name').textContent = l.achievement.name;
        document.getElementById('achievement-desc').textContent = l.achievement.desc || '';
        achBlock.hidden = false;
      } else {
        achBlock.hidden = true;
      }
    }
    document.getElementById('success-modal').classList.remove('hidden');

    // 5.1 XP breakdown — show code XP + countup total
    const codeXP = s4.xp_reward || 50;
    const codeEl = document.getElementById('success-xp-code');
    if (codeEl) codeEl.textContent = `+${codeXP} XP`;
    const totalXP = 15 + 15 + 30 + codeXP;
    const xpTotalEl = document.getElementById('success-xp-total');
    if (xpTotalEl) {
      let cur = 0;
      const step = Math.max(1, Math.ceil(totalXP / 20));
      const iv = setInterval(() => {
        cur = Math.min(cur + step, totalXP);
        xpTotalEl.textContent = '+' + cur + ' XP';
        if (cur >= totalXP) clearInterval(iv);
      }, 30);
    }

    // 5.1 Next lesson preview (REVIEW-FIX 2026-07-04: theo course hiện tại, không hardcode Basic)
    const data = window.LESSON_CONTENT[state.courseId || 'db_design'];
    const nextIdx = state.currentLessonIdx + 1;
    const nextLesson = nextIdx < data.lessons.length ? data.lessons[nextIdx] : null;
    const nextTitleEl = document.getElementById('success-next-title');
    const nextPreviewEl = document.getElementById('success-next-preview');
    if (nextTitleEl && nextPreviewEl) {
      if (nextLesson) {
        nextTitleEl.textContent = nextLesson.title;
        // nextPreviewEl uses CSS default display:flex — no inline override needed
        nextPreviewEl.onclick = () => window.nextLesson && window.nextLesson();
      } else {
        nextTitleEl.textContent = 'Bạn đã hoàn thành toàn bộ khóa học! 🎓';
        nextPreviewEl.classList.add('flagship-cursor-default');
        nextPreviewEl.onclick = null;
      }
    }

    // 5.3 Boss Battle fireworks (db_13 only)
    if (l.id === 'db_13') {
      const colors = ['#F59E0B','#EF4444','#8B5CF6','#06B6D4','#10B981'];
      for (let i = 0; i < 30; i++) {
        const dot = document.createElement('div');
        dot.className = 'firework';
        dot.style.left = (20 + Math.random() * 60) + 'vw';
        dot.style.top = (10 + Math.random() * 40) + 'vh';
        dot.style.background = colors[i % colors.length];
        dot.style.animationDelay = (Math.random() * 0.5) + 's';
        document.body.appendChild(dot);
        setTimeout(() => dot.remove(), 1500);
      }
    }
  }

  window.closeSuccess = function () {
    document.getElementById('success-modal').classList.add('hidden');
  };

  window.nextLesson = function () {
    // REVIEW-FIX 2026-07-04: điều hướng theo course hiện tại — user học TC từng bị đá về Basic
    const courseId = state.courseId || 'db_design';
    const data = window.LESSON_CONTENT[courseId];
    const nextIdx = state.currentLessonIdx + 1;
    if (nextIdx < data.lessons.length) {
      window.location.href = `/lesson/${courseId}?lesson=${nextIdx + 1}`;
    } else {
      window.location.href = `/courses/${courseId}`;
    }
  };

  /* ═══════════════════════════════════════════════════════════════
   * XP counter
   * ═══════════════════════════════════════════════════════════════ */
  function addXP(amount) {
    state.xpEarned += amount;
    const el = document.getElementById('xp-current');
    if (!el) return;
    // Countup animation (ease-out cubic, 600ms)
    const oldVal = parseInt(el.textContent, 10) || 0;
    const newVal = state.xpEarned;
    const duration = 600;
    const startTs = performance.now();
    function tick(ts) {
      const elapsed = ts - startTs;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(oldVal + (newVal - oldVal) * eased);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = newVal;
    }
    requestAnimationFrame(tick);
    // 4.6 XP award sparkle — golden ring around XP counter (replaces inline transform)
    const parent = el.parentElement;
    parent.classList.add('xp-pulse');
    setTimeout(() => parent.classList.remove('xp-pulse'), 240);
    // 4.6 XP award ring — golden ring around the parent
    const sparkle = document.createElement('div');
    sparkle.className = 'xp-sparkle ring';
    parent.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 260);
  }

  /* ═══════════════════════════════════════════════════════════════
   * FLAGSHIP STEP 3 HANDLERS — INSIDE IIFE (A1+A3 fix)
   * Was outside IIFE before → ReferenceError khi truy cập state/renderStep3
   * Now lives inside IIFE → có thể truy cập state, renderStep3, goToStep, addXP
   * ═══════════════════════════════════════════════════════════════ */

  // A3: completeStep wrapper — chuyển sang Step 4 + cộng XP (1 lần)
  function completeStep3() {
    if (!state.step3XPAwarded) {
      state.step3XPAwarded = true;
      addXP(30);
    }
    goToStep(4);
  }

  /* ── Match Game (Bài 6 — Mapping ER) ────────────────────────────────── */
  function initFlagshipMatchDnD() {
    document.querySelectorAll('.match-card').forEach(card => {
      card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', card.dataset.cardId);
        e.dataTransfer.effectAllowed = 'move';
      });
    });
    document.querySelectorAll('.match-slot').forEach(slot => {
      slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('flagship-hover-purple'); });
      slot.addEventListener('dragleave', e => { slot.classList.remove('flagship-hover-purple'); });
      slot.addEventListener('drop', e => {
        e.preventDefault();
        slot.classList.remove('flagship-hover-purple');
        const cardId = e.dataTransfer.getData('text/plain');
        const card = document.querySelector(`.match-card[data-card-id="${cardId}"]`);
        if (card) {
          const prev = card.parentElement;
          if (prev.classList.contains('match-slot')) {
            prev.querySelector('.match-card-text').textContent = prev.dataset.cardId;
            prev.classList.remove('flagship-hover-purple');
          }
          slot.innerHTML = `<div style="font-size:11px;color:var(--text-400);margin-bottom:6px;">Bước ${slot.dataset.slotOrder}</div>`;
          slot.appendChild(card);
          card.classList.add('flagship-card-full');
        }
      });
    });
    document.querySelectorAll('.match-slot').forEach(slot => {
      slot.addEventListener('click', e => {
        const card = slot.querySelector('.match-card');
        if (card) {
          const bank = document.querySelector('.match-bank');
          bank.appendChild(card);
          card.classList.add('flagship-card-auto');
          slot.innerHTML = `<div style="font-size:11px;color:var(--text-400);margin-bottom:6px;">Bước ${slot.dataset.slotOrder}</div><div class="match-card-text" style="font-size:12px;line-height:1.4;color:var(--text-400);">(trống)</div>`;
        }
      });
    });
  }

  window.checkFlagshipMatch = function () {
    initFlagshipMatchDnD();
    const slots = document.querySelectorAll('.match-slot');
    let correct = 0, total = slots.length;
    const f = state.currentLesson.step_3.flagship;
    slots.forEach(slot => {
      const expectedOrder = parseInt(slot.dataset.slotOrder);
      const card = slot.querySelector('.match-card');
      if (card) {
        const cardOrder = f.cards.find(c => c.id === card.dataset.cardId)?.order;
        if (cardOrder === expectedOrder) {
          correct++;
          slot.classList.add('flagship-zone-correct');
        } else {
          slot.classList.add('flagship-zone-wrong');
        }
      } else {
        slot.classList.add('flagship-zone-wrong');
      }
    });
    const result = document.getElementById('flagship-match-result');
    if (correct === total) {
      result.textContent = `🎉 Hoàn hảo! ${correct}/${total} bước đúng thứ tự.`;
      result.classList.add('flagship-result-success');
      completeStep3();
    } else {
      result.textContent = `${correct}/${total} đúng. Thử lại!`;
      result.classList.add('flagship-result-danger');
    }
  };

  window.resetFlagshipMatch = function () {
    const f = state.currentLesson.step_3.flagship;
    const bank = document.querySelector('.match-bank');
    const slots = document.querySelectorAll('.match-slot');
    if (!bank) return;
    bank.innerHTML = '';
    slots.forEach(slot => {
      slot.innerHTML = `<div style="font-size:11px;color:var(--text-400);margin-bottom:6px;">Bước ${slot.dataset.slotOrder}</div><div class="match-card-text" style="font-size:12px;line-height:1.4;color:var(--text-400);">(trống)</div>`;
      slot.style.background = '';
      slot.style.borderColor = '';
      slot.style.borderStyle = '';
    });
    // Fisher-Yates shuffle (fix biased sort)
    const cards = [...f.cards];
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    cards.forEach(c => {
      const div = document.createElement('div');
      div.className = 'match-card';
      div.dataset.cardId = c.id;
      div.setAttribute('draggable', 'true');
      div.className = 'match-card flagship-match-card';
      div.textContent = c.text;
      div.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', c.id); e.dataTransfer.effectAllowed = 'move'; });
      bank.appendChild(div);
    });
    const r = document.getElementById('flagship-match-result');
    if (r) { r.textContent = ''; }
  };

  /* ── Split Game (Bài 9, 12 — 2NF, 4NF) ─────────────────────────────── */
  function initFlagshipSplitDnD() {
    document.querySelectorAll('.split-col').forEach(col => {
      col.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', col.dataset.colName);
        e.dataTransfer.effectAllowed = 'move';
      });
    });
    document.querySelectorAll('.split-target').forEach(target => {
      target.addEventListener('dragover', e => { e.preventDefault(); target.classList.add('flagship-hover-green'); });
      target.addEventListener('dragleave', e => { target.classList.remove('flagship-hover-green'); });
      target.addEventListener('drop', e => {
        e.preventDefault();
        target.classList.remove('flagship-hover-green');
        const colName = e.dataTransfer.getData('text/plain');
        const col = document.querySelector(`.split-col[data-col-name="${colName}"]`);
        if (col) {
          const chipsHost = target.querySelector('.split-target-chips');
          const span = document.createElement('span');
          span.className = 'split-target-chip';
          span.dataset.colName = colName;
          span.textContent = col.textContent;
          span.className = 'split-target-chip flagship-split-chip';
          span.addEventListener('click', () => {
            const source = document.querySelector('.split-source > div:last-child');
            if (source) source.appendChild(col);
            span.remove();
          });
          chipsHost.appendChild(span);
          col.remove();
        }
      });
    });
  }

  window.checkFlagshipSplit = function () {
    initFlagshipSplitDnD();
    const f = state.currentLesson.step_3.flagship;
    let correct = 0, total = 0;
    f.solution && Object.entries(f.solution).forEach(([target, cols]) => total += cols.length);

    f.solution && Object.entries(f.solution).forEach(([targetName, expectedCols]) => {
      const target = document.querySelector(`.split-target[data-target-name="${targetName}"]`);
      if (!target) return;
      const placedChips = target.querySelectorAll('.split-target-chip');
      const placedNames = Array.from(placedChips).map(c => c.dataset.colName);
      expectedCols.forEach(c => {
        if (placedNames.includes(c)) correct++;
      });
    });
    const result = document.getElementById('flagship-split-result');
    if (correct === total && total > 0) {
      result.textContent = `🎉 Hoàn hảo! ${correct}/${total} cột đúng chỗ.`;
      result.classList.add('flagship-result-success');
      completeStep3();
    } else {
      result.textContent = `${correct}/${total} cột đúng. Thử lại!`;
      result.classList.add('flagship-result-danger');
    }
  };

  window.resetFlagshipSplit = function () {
    renderStep3();
    const r = document.getElementById('flagship-split-result');
    if (r) r.textContent = '';
  };

  window.showFlagshipSplitHint = function () {
    const f = state.currentLesson.step_3.flagship;
    alert('💡 Gợi ý: ' + (f.hint || 'Xem lại lý thuyết trong Step 1.'));
  };

  /* ── Bug Spot (Bài 19, 20 — SQLi, Password) ────────────────────────── */
  function initFlagshipBugSpotDnD() {
    document.querySelectorAll('.bug-chip').forEach(chip => {
      chip.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', chip.dataset.chipId);
        e.dataTransfer.effectAllowed = 'move';
      });
    });
    document.querySelectorAll('.bug-bin').forEach(bin => {
      bin.addEventListener('dragover', e => { e.preventDefault(); bin.classList.add('flagship-hover-purple'); });
      bin.addEventListener('dragleave', e => { bin.classList.remove('flagship-hover-purple'); });
      bin.addEventListener('drop', e => {
        e.preventDefault();
        bin.classList.remove('flagship-hover-purple');
        const chipId = e.dataTransfer.getData('text/plain');
        const chip = document.querySelector(`.bug-chip[data-chip-id="${chipId}"]`);
        if (chip) {
          const chipsHost = bin.querySelector('.bug-bin-chips');
          const clone = chip.cloneNode(true);
          clone.classList.add('flagship-cursor-pointer');
          clone.addEventListener('click', () => {
            document.querySelector('.bug-bank').appendChild(chip);
            clone.remove();
          });
          chipsHost.appendChild(clone);
          chip.remove();
        }
      });
    });
  }

  window.checkFlagshipBugSpot = function () {
    initFlagshipBugSpotDnD();
    const f = state.currentLesson.step_3.flagship;
    let correct = 0, total = f.chips.length;
    f.chips.forEach(c => {
      const placed = document.querySelector(`.bug-bin .bug-chip[data-chip-id="${c.id}"]`);
      if (placed && f.solution[c.id] === placed.closest('.bug-bin').dataset.binId) {
        correct++;
        placed.classList.add('flagship-placed-correct');
      } else if (placed) {
        placed.classList.add('flagship-placed-wrong');
      }
    });
    const result = document.getElementById('flagship-bugspot-result');
    if (correct === total && total > 0) {
      result.textContent = `🎉 Hoàn hảo! Phân loại đúng cả ${total}.`;
      result.classList.add('flagship-result-success');
      completeStep3();
    } else {
      result.textContent = `${correct}/${total} đúng. Thử lại!`;
      result.classList.add('flagship-result-danger');
    }
  };

  window.resetFlagshipBugSpot = function () {
    renderStep3();
    const r = document.getElementById('flagship-bugspot-result');
    if (r) r.textContent = '';
  };

  window.showFlagshipBugSpotHint = function () {
    const f = state.currentLesson.step_3.flagship;
    alert('💡 Gợi ý: ' + (f.hint || 'Xem lại lý thuyết trong Step 1.'));
  };

  /* ── Join Builder (Bài 13 — Boss Battle 4-table JOIN) ─────────────── */
  function initFlagshipJoinDnD() {
    const target = document.getElementById('join-target');
    if (!target) return;
    document.querySelectorAll('.join-block').forEach(b => {
      b.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', b.dataset.blockIdx);
        e.dataTransfer.effectAllowed = 'move';
      });
      b.addEventListener('dblclick', () => {
        target.appendChild(b);
        updateJoinIDE();
      });
    });
target.addEventListener('dragover', e => { e.preventDefault(); target.classList.add('flagship-hover-dark'); });
      target.addEventListener('dragleave', e => { target.classList.remove('flagship-hover-dark'); });
      target.addEventListener('drop', e => {
        e.preventDefault();
        target.classList.remove('flagship-hover-dark');
        const idx = e.dataTransfer.getData('text/plain');
      const b = document.querySelector(`.join-block[data-block-idx="${idx}"]`);
      if (b) {
        target.appendChild(b);
        updateJoinIDE();
      }
    });
  }

  function updateJoinIDE() {
    const target = document.getElementById('join-target');
    if (!target) return;
    const blocks = target.querySelectorAll('.join-block');
    const sql = Array.from(blocks).map(b => b.textContent).join(' ');
    const ide = document.querySelector('.code-editor textarea, .ide-textarea');
    if (ide) ide.value = sql;
  }

  window.checkFlagshipJoin = function () {
    const f = state.currentLesson.step_3.flagship;
    const target = document.getElementById('join-target');
    const placed = target.querySelectorAll('.join-block');
    const placedTokens = Array.from(placed).map(b => b.textContent);
    const expectedTokens = f.blocks.map(b => b.token);
    const placedStr = placedTokens.join(' ').replace(/\s+/g, ' ').trim();
    const expectedStr = expectedTokens.join(' ').replace(/\s+/g, ' ').trim();
    const result = document.getElementById('flagship-join-result');
    if (placedStr === expectedStr) {
      result.textContent = '🎉 Hoàn hảo! 4-table JOIN đúng thứ tự!';
      result.classList.add('flagship-result-success');
      completeStep3();
    } else {
      result.textContent = `Sai thứ tự hoặc thiếu thẻ. Đặt ${placed.length}/${expectedTokens.length}.`;
      result.classList.add('flagship-result-danger');
    }
  };

  window.resetFlagshipJoin = function () {
    renderStep3();
    const r = document.getElementById('flagship-join-result');
    if (r) r.textContent = '';
  };

  /* ═══════════════════════════════════════════════════════════════
   * PREMIUM RENDERERS — shadcn/Brilliant inspired
   * Thêm 2026-06-21: SVG primer + 3 mini-game mới + step4 enhanced
   * ═══════════════════════════════════════════════════════════════ */

  /* ── A. SVG Primer renderer ────────────────────────────────── */
  // Mở SVG inline an toàn (chỉ chấp nhận trusted content từ lesson_content.js)
  // Không user-input, không fetch từ external → safe.
  function renderSVGPrimer(mountEl, visual) {
    if (!mountEl) return;
    if (visual.svg) {
      // Direct SVG string
      mountEl.innerHTML = `<div class="primer-svg">${visual.svg}</div>`;
    } else {
      mountEl.innerHTML = '';
    }
  }

  // Render diagram từ data object (tiện cho editor — không phải raw SVG)
  // Hỗ trợ 3 loại: 'er' | 'nf' | 'flow'
  function renderDiagramFromData(mountEl, diagram) {
    if (!mountEl || !diagram || !diagram.type) return;
    let html = '';
    if (diagram.type === 'er') {
      // FIX 2f-B2: ẩn ER-diagram bài 1-entity (≤1 entity) để tránh trùng TableExplorer bên dưới.
      // Probe xác nhận #primer-svg-mount VÀ #visual-db-panel là 2 SIBLINGS (cha chung = article.step-1-content),
      // mỗi cái độc lập nhận class .step1-reveal (stagger reveal i=1 vs i=2). Ẩn hẹp chỉ mountEl,
      // KHÔNG đụng #visual-db-panel. Điều kiện CHỈ áp dụng cho type='er' (NF/Flow vẫn render bình thường).
      const entities = diagram.entities || [];
      if (entities.length <= 1) {
        mountEl.style.display = 'none';
        mountEl.innerHTML = '';
        return;
      }
      mountEl.style.display = '';
      html = buildERDiagramHTML(diagram);
    } else if (diagram.type === 'nf') {
      mountEl.style.display = '';
      html = buildNormalizePairHTML(diagram);
    } else if (diagram.type === 'flow') {
      mountEl.style.display = '';
      html = buildQueryFlowHTML(diagram);
    } else {
      mountEl.style.display = 'none';
      mountEl.innerHTML = '';
      return;
    }
    mountEl.innerHTML = `<div class="primer-svg">${html}</div>`;
  }

  // ER diagram: 1+ entities, mỗi entity có name + columns; optional connectors
  function buildERDiagramHTML(d) {
    const entities = d.entities || [];
    const connectors = d.connectors || [];
    const width = d.width || 600;
    const height = d.height || 280;
    const colW = 170;
    const rowH = 22;
    const headerH = 30;
    const entityPositions = [];

    // ARIA: Mô tả tổng quan sơ đồ cho screen reader
    const ariaSummary = entities.map(e => `${e.name} (${(e.columns || []).length} cột)`).join(', ');
    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Sơ đồ ER gồm: ${ariaSummary}">`;

    // Compute entity positions
    const totalW = entities.length * (colW + 40) - 40;
    const startX = (width - totalW) / 2;
    entities.forEach((e, i) => {
      const x = startX + i * (colW + 40);
      const h = headerH + (e.columns || []).length * rowH + 14;
      const y = (height - h) / 2;
      entityPositions.push({ x, y, w: colW, h, name: e.name });
    });

    // Draw connectors first (behind entities)
    connectors.forEach(c => {
      const from = entityPositions.find(p => p.name === c.from);
      const to = entityPositions.find(p => p.name === c.to);
      if (!from || !to) return;
      const x1 = from.x + from.w;
      const y1 = from.y + from.h / 2;
      const x2 = to.x;
      const y2 = to.y + to.h / 2;
      const midX = (x1 + x2) / 2;
      svg += `<path class="er-connector" d="M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}" aria-label="Mối quan hệ giữa ${c.from} và ${c.to}${c.label ? ': ' + c.label : ''}" />`;
      // Cardinality labels
      svg += `<text class="er-cardinality" x="${x1 + 10}" y="${y1 - 6}">${c.fromCard || '1'}</text>`;
      svg += `<text class="er-cardinality" x="${x2 - 10}" y="${y2 - 6}">${c.toCard || 'N'}</text>`;
      // Label in middle
      if (c.label) {
        svg += `<text class="er-connector-label" x="${midX}" y="${(y1 + y2) / 2 - 6}" text-anchor="middle" font-size="11" font-style="italic" fill="var(--text-400)">${escapeXml(c.label)}</text>`;
      }
    });

    // Draw entities
    entities.forEach((e, i) => {
      const pos = entityPositions[i];
      const cls = e.weak ? 'er-entity-rect weak' : 'er-entity-rect';
      svg += `<rect class="${cls}" x="${pos.x}" y="${pos.y}" width="${pos.w}" height="${pos.h}" role="img" aria-label="Entity ${e.name} với ${(e.columns || []).length} cột" />`;
      // Header
      svg += `<rect x="${pos.x}" y="${pos.y}" width="${pos.w}" height="${headerH}" fill="rgba(6,182,212,0.18)" />`;
      svg += `<text class="er-entity-title" x="${pos.x + pos.w / 2}" y="${pos.y + 20}">${escapeXml(e.name)}</text>`;
      // Columns
      (e.columns || []).forEach((col, j) => {
        const cy = pos.y + headerH + 14 + j * rowH;
        const isPk = col.key === 'PK';
        const isDerived = col.derived === true;
        let cls = 'er-col';
        if (isPk) cls += ' pk';
        if (isDerived) cls += ' derived';
        const icon = isPk ? '🔑 ' : (col.icon ? col.icon + ' ' : '');
        svg += `<text class="${cls}" x="${pos.x + 12}" y="${cy}">${icon}${escapeXml(col.name)}</text>`;
        if (col.type) {
          svg += `<text class="er-col" x="${pos.x + pos.w - 12}" y="${cy}" text-anchor="end" fill="var(--text-500)">${col.type}</text>`;
        }
      });
    });

    // Notes
    if (d.note) {
      svg += `<text class="er-connector-label" x="${width / 2}" y="${height - 8}" text-anchor="middle" font-size="11" font-style="italic" fill="var(--text-400)">${escapeXml(d.note)}</text>`;
    }

    svg += `</svg>`;
    return svg;
  }

  // Normalization before/after: d.before, d.after (mỗi cái là {title, columns, rows, violations, fixes})
  function buildNormalizePairHTML(d) {
    const before = d.before || {};
    const after = d.after || {};
    let html = `<div class="nf-pair">`;
    html += `<div class="nf-side before">
      <div class="nf-side-label">${escapeHtml(before.title || 'TRƯỚC')}</div>
      <table class="nf-table">
        <thead><tr>${(before.columns || []).map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>
        <tbody>${(before.rows || []).map((row, ri) =>
      `<tr>${row.map((cell, ci) => {
        const v = (before.violations || {})[`${ri}-${ci}`];
        const cls = v ? 'violation' : '';
        return `<td class="${cls}">${escapeHtml(String(cell))}${v ? ` ⚠️` : ''}</td>`;
      }).join('')}</tr>`
    ).join('')}</tbody>
      </table>
    </div>`;
    html += `<div class="nf-arrow"><i class="fa-solid fa-arrow-right"></i></div>`;
    html += `<div class="nf-side after">
      <div class="nf-side-label">${escapeHtml(after.title || 'SAU')}</div>
      <table class="nf-table">
        <thead><tr>${(after.columns || []).map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>
        <tbody>${(after.rows || []).map((row, ri) =>
      `<tr>${row.map((cell, ci) => {
        const f = (after.fixes || {})[`${ri}-${ci}`];
        const cls = f ? 'fixed' : '';
        return `<td class="${cls}">${escapeHtml(String(cell))}${f ? ` ✓` : ''}</td>`;
      }).join('')}</tr>`
    ).join('')}</tbody>
      </table>
    </div>`;
    if (d.note) {
      html += `<div style="grid-column: 1 / -1; font-size: 11px; color: var(--text-400); text-align: center; margin-top: 4px;">${escapeHtml(d.note)}</div>`;
    }
    html += `</div>`;
    return html;
  }

  // Query flow: vertical, 3-6 steps
  function buildQueryFlowHTML(d) {
    const steps = d.steps || [];
    let html = `<div class="qf-flow">`;
    steps.forEach((step, i) => {
      html += `<div class="qf-step">
        <div class="qf-step-icon"><i class="fa-solid ${escapeHtml(step.icon || 'fa-circle')}"></i></div>
        <div class="qf-step-label">
          <strong>${escapeHtml(step.title)}</strong>
          <span>${escapeHtml(step.sub || '')}</span>
        </div>
        ${step.payload ? `<span class="qf-payload">${escapeHtml(step.payload)}</span>` : ''}
      </div>`;
      if (i < steps.length - 1) html += `<div class="qf-arrow-down"></div>`;
    });
    html += `</div>`;
    return html;
  }

  function escapeXml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ── B. Mini-game: Match (nối cặp) ──────────────────────── */
  // Data: { type:'match', title, instruction, pairs:[{left,right}], solution:{leftId:rightId} }
  function renderMiniGameMatch(container, mg) {
    if (!container || !mg) return;
    container.hidden = false;
    const pairs = mg.pairs || [];
    // Shuffle right column for game
    const rights = pairs.map(p => p.right).slice();
    for (let i = rights.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rights[i], rights[j]] = [rights[j], rights[i]];
    }
    const matches = {}; // leftId -> rightId
    let selectedLeft = null;

    let html = `<div class="mini-game" data-mg-type="match">
      <div class="mini-game-title"><i class="fa-solid fa-link"></i> ${escapeHtml(mg.title || 'Nối cặp')}</div>
      <div class="mini-game-instr">${mg.instruction || 'Click chọn 1 ô bên trái, rồi click ô tương ứng bên phải để nối cặp.'}</div>
      <div class="mg-match-board">
        <div class="mg-match-col mg-match-left" id="mg-match-left">
          ${pairs.map(p => `<div class="mg-match-item" data-left-id="${escapeHtml(p.leftId || p.left)}">${escapeHtml(p.left)}</div>`).join('')}
        </div>
        <div class="mg-match-line-col" id="mg-match-lines"></div>
        <div class="mg-match-col mg-match-right" id="mg-match-right">
          ${rights.map(r => `<div class="mg-match-item" data-right-id="${escapeHtml(r.id || r)}">${escapeHtml(r.label || r)}</div>`).join('')}
        </div>
        <svg class="mg-match-svg" id="mg-match-svg"></svg>
      </div>
      <div id="mg-match-feedback" class="mg-match-feedback" style="display:none;"></div>
      <div style="margin-top:12px;display:flex;gap:8px;">
        <button class="mg-order-btn" id="mg-match-check">Kiểm tra</button>
        <button class="mg-order-btn secondary" id="mg-match-reset">Làm lại</button>
      </div>
    </div>`;
    container.innerHTML = html;

    // Draw SVG line between two elements
    function drawMatchLine(leftEl, rightEl) {
      const svg = container.querySelector('#mg-match-svg');
      const board = container.querySelector('.mg-match-board');
      const boardRect = board.getBoundingClientRect();
      const leftRect = leftEl.getBoundingClientRect();
      const rightRect = rightEl.getBoundingClientRect();

      const x1 = leftRect.right - boardRect.left;
      const y1 = leftRect.top + leftRect.height / 2 - boardRect.top;
      const x2 = rightRect.left - boardRect.left;
      const y2 = rightRect.top + rightRect.height / 2 - boardRect.top;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('class', 'matched');
      svg.appendChild(line);
    }

    // Wire up click
    container.querySelectorAll('#mg-match-left .mg-match-item').forEach(el => {
      el.addEventListener('click', () => {
        if (el.classList.contains('matched')) return;
        container.querySelectorAll('#mg-match-left .mg-match-item.selected').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        selectedLeft = el.dataset.leftId;
      });
    });
    container.querySelectorAll('#mg-match-right .mg-match-item').forEach(el => {
      el.addEventListener('click', () => {
        if (el.classList.contains('matched')) return;
        if (!selectedLeft) {
          flashTip(container, 'Chọn 1 ô bên trái trước!');
          return;
        }
        matches[selectedLeft] = el.dataset.rightId;

        // Add matched class and draw line
        const leftEl = container.querySelector(`#mg-match-left .mg-match-item[data-left-id="${selectedLeft}"]`);
        leftEl.classList.add('matched');
        el.classList.add('matched');

        // Draw the connecting line
        drawMatchLine(leftEl, el);

        selectedLeft = null;
        container.querySelectorAll('#mg-match-left .mg-match-item.selected').forEach(s => s.classList.remove('selected'));
      });
    });

    container.querySelector('#mg-match-check').onclick = () => {
      const sol = mg.solution || {};
      const allMatched = pairs.length === Object.keys(matches).length;
      if (!allMatched) {
        showMiniFeedback(container, 'mg-match-feedback', false, `Hãy nối đủ ${pairs.length} cặp trước khi kiểm tra.`);
        return;
      }
      // v4 FIX: chấm TỪNG cặp → tô xanh (đúng ✓) / đỏ (sai ✗) rõ ràng, không còn "luôn hiện đúng".
      let correctCount = 0;
      Object.keys(matches).forEach(leftId => {
        const rightId = matches[leftId];
        const ok = sol[leftId] === rightId;
        if (ok) correctCount++;
        const leftEl = container.querySelector(`#mg-match-left .mg-match-item[data-left-id="${leftId}"]`);
        const rightEl = container.querySelector(`#mg-match-right .mg-match-item[data-right-id="${rightId}"]`);
        [leftEl, rightEl].forEach(el => { if (el) { el.classList.remove('matched'); el.classList.add(ok ? 'correct' : 'incorrect'); } });
      });
      if (correctCount === pairs.length) {
        showMiniFeedback(container, 'mg-match-feedback', true, `Hoàn hảo! Đúng ${correctCount}/${pairs.length} cặp. +${mg.xp || 20} XP`);
        awardXP(mg.xp || 20);
      } else {
        showMiniFeedback(container, 'mg-match-feedback', false, `Đúng ${correctCount}/${pairs.length} cặp — ô ĐỎ là nối sai. Bấm "Làm lại" để thử lại.`);
      }
    };
    container.querySelector('#mg-match-reset').onclick = () => renderMiniGameMatch(container, mg);
  }

  /* ── C. Mini-game: Order (kéo thả sắp xếp) ─────────────── */
  // Data: { type:'order', title, instruction, items:[{id,label}], solution:{id:order} }
  function renderMiniGameOrder(container, mg) {
    if (!container || !mg) return;
    container.hidden = false;
    const items = (mg.items || []).slice();
    // Shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    let html = `<div class="mini-game" data-mg-type="order">
      <div class="mini-game-title"><i class="fa-solid fa-sort"></i> ${escapeHtml(mg.title || 'Sắp xếp thứ tự')}</div>
      <div class="mini-game-instr">${mg.instruction || 'Kéo thả để sắp xếp theo đúng thứ tự.'}</div>
      <div class="mg-order-list" id="mg-order-list">
        ${items.map((it, i) => `<div class="mg-order-item" draggable="true" data-item-id="${escapeHtml(it.id)}">
          <span class="mg-order-num">${i + 1}</span>
          <span class="mg-order-label">${escapeHtml(it.label)}</span>
          <span class="mg-order-grip"><i class="fa-solid fa-grip-vertical"></i></span>
        </div>`).join('')}
      </div>
      <div id="mg-order-feedback" class="mg-match-feedback" style="display:none;"></div>
      <div style="margin-top:12px;display:flex;gap:8px;">
        <button class="mg-order-btn" id="mg-order-check">Kiểm tra</button>
        <button class="mg-order-btn secondary" id="mg-order-reset">Làm lại</button>
      </div>
    </div>`;
    container.innerHTML = html;

    // Drag-drop reordering
    const list = container.querySelector('#mg-order-list');
    let dragEl = null;
    list.querySelectorAll('.mg-order-item').forEach(el => {
      el.addEventListener('dragstart', e => {
        dragEl = el;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => el.classList.add('dragging'), 0);
      });
      el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
        list.querySelectorAll('.mg-order-item').forEach(x => x.classList.remove('drag-over'));
        // Renumber
        list.querySelectorAll('.mg-order-num').forEach((n, i) => n.textContent = i + 1);
      });
      el.addEventListener('dragover', e => {
        e.preventDefault();
        el.classList.add('drag-over');
      });
      el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
      el.addEventListener('drop', e => {
        e.preventDefault();
        if (dragEl && dragEl !== el) {
          const allItems = [...list.querySelectorAll('.mg-order-item')];
          const dragIdx = allItems.indexOf(dragEl);
          const dropIdx = allItems.indexOf(el);
          if (dragIdx < dropIdx) el.after(dragEl);
          else el.before(dragEl);
          list.querySelectorAll('.mg-order-num').forEach((n, i) => n.textContent = i + 1);
        }
      });
    });

    container.querySelector('#mg-order-check').onclick = () => {
      const sol = mg.solution || {};
      const order = [...list.querySelectorAll('.mg-order-item')].map((el, i) => ({ id: el.dataset.itemId, pos: i + 1 }));
      let correct = 0;
      order.forEach(o => { if (sol[o.id] === o.pos) correct++; });
      list.querySelectorAll('.mg-order-item').forEach(el => {
        const id = el.dataset.itemId;
        if (sol[id] === [...list.querySelectorAll('.mg-order-item')].indexOf(el) + 1) {
          el.classList.add('correct'); el.classList.remove('wrong');
        } else {
          el.classList.add('wrong'); el.classList.remove('correct');
        }
      });
      if (correct === order.length) {
        showMiniFeedback(container, 'mg-order-feedback', true, `Hoàn hảo! Đúng ${correct}/${order.length} vị trí. +${mg.xp || 20} XP`);
        awardXP(mg.xp || 20);
      } else {
        showMiniFeedback(container, 'mg-order-feedback', false, `Sai ${order.length - correct} vị trí. Số đỏ = sai, xanh = đúng.`);
      }
    };
    container.querySelector('#mg-order-reset').onclick = () => renderMiniGameOrder(container, mg);
  }

  /* ── D. Mini-game: Bug Spot (tìm lỗi trong code) ──────── */
  // Data: { type:'bug_spot', title, instruction, code:'SELECT * FORM...', bugs:[{line, char, type, description}], xp }
  function renderMiniGameBugSpot(container, mg) {
    if (!container || !mg) return;
    container.hidden = false;
    const code = mg.code || '';
    const lines = code.split('\n');
    let selectedLine = null;

    let html = `<div class="mini-game" data-mg-type="bug_spot">
      <div class="mini-game-title"><i class="fa-solid fa-bug"></i> ${escapeHtml(mg.title || 'Tìm lỗi')}</div>
      <div class="mini-game-instr">${mg.instruction || 'Click vào dòng code có lỗi.'}</div>
      <div class="mg-bugspot-instr"><strong>Số dòng:</strong> ${lines.length} · <strong>Loại lỗi cần tìm:</strong> ${escapeHtml(mg.bugType || 'syntax')}</div>
      <div class="mg-bugspot-code">${lines.map((ln, i) =>
      `<div class="mg-bugspot-line" data-line="${i + 1}"><span class="mg-bugspot-lineno">${i + 1}</span><span>${escapeHtml(ln) || '&nbsp;'}</span></div>`
    ).join('')}</div>
      <div class="mg-bugspot-actions" style="margin-top:10px;">
        <button class="mg-bugspot-btn" id="mg-bug-check">Kiểm tra</button>
        <button class="mg-bugspot-btn secondary" id="mg-bug-reset">Làm lại</button>
      </div>
      <div id="mg-bug-feedback" class="mg-match-feedback" style="display:none;"></div>
    </div>`;
    container.innerHTML = html;

    container.querySelectorAll('.mg-bugspot-line').forEach(el => {
      el.addEventListener('click', () => {
        if (el.classList.contains('correct') || el.classList.contains('wrong')) return;
        container.querySelectorAll('.mg-bugspot-line.selected').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        selectedLine = parseInt(el.dataset.line);
      });
    });

    container.querySelector('#mg-bug-check').onclick = () => {
      if (!selectedLine) { flashTip(container, 'Chọn 1 dòng trước!'); return; }
      const bugs = mg.bugs || [];
      const hit = bugs.find(b => b.line === selectedLine);
      if (hit) {
        container.querySelector(`.mg-bugspot-line[data-line="${selectedLine}"]`).classList.remove('selected');
        container.querySelector(`.mg-bugspot-line[data-line="${selectedLine}"]`).classList.add('correct');
        showMiniFeedback(container, 'mg-bug-feedback', true, `Đúng rồi! ${hit.description || ''} +${mg.xp || 25} XP`);
        awardXP(mg.xp || 25);
      } else {
        container.querySelector(`.mg-bugspot-line[data-line="${selectedLine}"]`).classList.remove('selected');
        container.querySelector(`.mg-bugspot-line[data-line="${selectedLine}"]`).classList.add('wrong');
        const correctLine = bugs[0]?.line;
        showMiniFeedback(container, 'mg-bug-feedback', false, `Sai rồi. Dòng đúng là dòng ${correctLine}. Thử lại!`);
      }
    };
    container.querySelector('#mg-bug-reset').onclick = () => renderMiniGameBugSpot(container, mg);
  }

  function showMiniFeedback(container, feedbackId, ok, msg) {
    const el = container.querySelector('#' + feedbackId);
    if (!el) return;
    el.classList.add('flagship-feedback-flex');
    // AUDIT-FIX 2026-07-04: element sinh ra với inline style="display:none" — inline THẮNG
    // class .flagship-feedback-flex{display:flex} → feedback match/order/bug_spot chưa từng
    // hiển thị. Ghi đè inline trực tiếp.
    el.style.display = 'flex';
    el.classList.toggle('wrong', !ok);
    el.innerHTML = `<i class="fa-solid ${ok ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${msg}`;
    // FIX dead-end (audit + review 2026-07-04): cả 3 mini premium funnel kết quả qua đây.
    // Cờ solved CHỈ khi đúng; nhưng CTA mở BẤT KỂ đúng/sai một khi đã thử — mini-game là
    // BONUS, không được chặn tiến trình (đồng bộ triết lý checkMiniGame của classify).
    if (ok) state.miniGameSolved = true;
    const total = ((state.currentLesson.step_2 || {}).mcq || []).length;
    if (state.mcqAnswers.filter(Boolean).length >= total) revealStep3Cta();
  }
  function flashTip(container, msg) {
    const tip = document.createElement('div');
    tip.className = 'flagship-flash-tip';
    tip.textContent = msg;
    container.classList.add('flagship-container-rel');
    container.appendChild(tip);
    setTimeout(() => tip.remove(), 1800);
  }

  // Hook vào addXP (nếu chưa có thì stub)
  function awardXP(n) {
    if (typeof window.addXP === 'function') window.addXP(n);
  }

  /* ── E. Step 4 enhanced schema (dùng CSS mới) — DORMANT 2e-C1 ─────────────
   * Schema panel bị bỏ (user: tự SELECT * khám phá); hàm giữ dormant để rollback dễ.
   * s4.schema.data VẪN cần cho PE_runSQL engine; gọi nhầm cũng không crash (guard null). */
  function enhanceStep4Schema(container, s4) {
    if (!container || !s4 || !s4.schema) return;
    const schema = s4.schema;
    // C3 (STAGE 2d): simplify — chỉ head + rows (tên cột + type + key). Bỏ data-preview + row-count
    // để schema panel vừa khít cột 3 (Codecademy), không bị tràn sample data.
    const renderOneTable = (tbl) => {
      const cols = tbl.columns || [];
      return `<div class="step4-schema-card">
        <div class="schema-head">
          <i class="fa-solid fa-table"></i>
          <span class="table-name">${escapeHtml(tbl.table_name)}</span>
        </div>
        <div class="schema-rows">
          ${cols.map(col => `
            <div class="schema-row">
              <span class="col-name">${col.icon ? col.icon + ' ' : ''}${escapeHtml(col.name)}</span>
              <span class="col-type">${escapeHtml(col.type || '')}</span>
              ${col.key ? `<span class="col-key">${escapeHtml(col.key)}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>`;
    };
    let html = renderOneTable(schema);
    if (s4.related_schemas && Array.isArray(s4.related_schemas)) {
      s4.related_schemas.forEach(relSchema => {
        html += renderOneTable(relSchema);
      });
    }
    container.innerHTML = html;
  }

  /* ── C4 (STAGE 2d): render kết quả truy vấn vào cột 3 ─────────────── */
  function renderStep4Results(cols, rows) {
    const el = document.getElementById('step4-results');
    if (!el) return;
    if (!cols || cols.length === 0) {
      el.innerHTML = '<div class="results-empty">Query chạy không trả về cột nào.</div>';
      return;
    }
    const rowCountHtml = `<div class="results-row-count">→ ${rows.length} dòng × ${cols.length} cột</div>`;
    const tableHtml = `<table>
      <thead><tr>${cols.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr>${r.map(cell => `<td>${escapeHtml(String(cell ?? ''))}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`;
    el.innerHTML = rowCountHtml + tableHtml;
  }

  function renderStep4Error(msg) {
    const el = document.getElementById('step4-results');
    if (!el) return;
    el.innerHTML = `<div class="results-error">
      <strong><i class="fa-solid fa-triangle-exclamation"></i> Lỗi truy vấn</strong>
      ${escapeHtml(msg || 'Có lỗi xảy ra khi chạy query.')}
    </div>`;
  }

  /* 4A-E2-fix: PENDING (khung neutral) — dùng cho E3-scope clauses user gõ đúng nhưng engine
   * tier hiện tại chưa hỗ trợ. KHUNG INFO cyan/amber icon fa-gear, KHÔNG chữ "LỖI",
   * KHÔNG tam-giác-đỏ (mâu thuẫn với text "đáp án ĐÚNG"). {error} thật vẫn dùng
   * renderStep4Error (đỏ, icon tam-giác). */
  function renderStep4Pending(msg) {
    const el = document.getElementById('step4-results');
    if (!el) return;
    el.innerHTML = `<div class="results-pending">
      <strong><i class="fa-solid fa-gear"></i> Đang được hoàn thiện</strong>
      ${escapeHtml(msg || 'Câu này tạm thời chưa có bảng kết quả — đáp án của bạn vẫn được tính đúng.')}
    </div>`;
  }

  /* 4A-E3-equiv: NEUTRAL (no-result-yet) — dùng khi validateSQL Reject mà panel đang là
   * pending từ immediate render. Tránh false-correct (nói "đáp án ĐÚNG" cho bài user SAI).
   * Khung neutral grey/cyan-nhạt icon fa-lightbulb, text "gõ đúng query để xem kết quả". */
  function renderStep4Neutral(msg) {
    const el = document.getElementById('step4-results');
    if (!el) return;
    el.innerHTML = `<div class="results-neutral">
      <strong><i class="fa-solid fa-lightbulb"></i> Gõ đúng query để xem kết quả</strong>
      ${escapeHtml(msg || '')}
    </div>`;
  }

  /* 4A-E3-equiv-fix: CHECKING (placeholder 0.6s) — bài equiv khi Run hiện ngay placeholder
   * "Đang kiểm tra…" (icon fa-spinner) thay vì pending "đáp án ĐÚNG" (avoid false-correct flash).
   * Sau 600ms, Accept→equiv results (OVERWRITE) / Reject→neutral (OVERWRITE). */
  function renderStep4Checking() {
    const el = document.getElementById('step4-results');
    if (!el) return;
    el.innerHTML = `<div class="results-checking">
      <strong><i class="fa-solid fa-spinner fa-spin"></i> Đang kiểm tra…</strong>
      Chờ validate query trong giây lát.
    </div>`;
  }

  function renderStep4Idle() {
    const el = document.getElementById('step4-results');
    if (!el) return;
    el.innerHTML = '<div class="results-empty">Bấm <strong>Run</strong> để xem kết quả.</div>';
  }

  /* ── F. Hint panel 4 levels (progressive reveal) ──────────── */
  function enhanceHintPanel(container, s4) {
    if (!container || !s4 || !s4.hints) return;
    const hints = s4.hints;
    let currentLevel = 0;
    let html = `<div class="hint-panel" id="hint-panel">
      <div class="hint-panel-head"><i class="fa-solid fa-lightbulb"></i> Gợi ý (${hints.length} cấp độ)</div>
      <div class="hint-level-tabs" id="hint-level-tabs">
        ${hints.map((h, i) => `<button class="hint-level-tab${i === 0 ? ' active' : ''}" data-level="${i}">Cấp ${i + 1}</button>`).join('')}
      </div>
      <div class="hint-panel-body" id="hint-body">${hints[0]?.text || ''}</div>
    </div>`;
    container.innerHTML = html;
    container.querySelectorAll('.hint-level-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const lvl = parseInt(tab.dataset.level);
        container.querySelectorAll('.hint-level-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        container.querySelector('#hint-body').innerHTML = hints[lvl]?.text || '';
      });
    });
  }
})();

