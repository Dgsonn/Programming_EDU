/* ═══════════════════════════════════════════════════════════════════
 * LESSON CONTENT — DB DESIGN NÂNG CAO (GameHub Marketplace, phần 3 saga)
 * Course id: db_design_nc · Ticket #42–#66 · Release: Marketplace v1.0/v2.0/v3.0
 * Syllabus: docs/PART_6_QUERY_PROCESSING_AND_OPTIMIZATION.pdf (M7, 10 bài + card A-J)
 *           docs/PART_7.pdf (M8-M9, 14 bài + card A-L)
 * Spec pilot: docs/NC_SHELL_NC01_SPEC_2026-07-05.md
 * Schema 4-step Y HỆT Basic/TC — renderer dùng chung, không fork UI.
 * ═══════════════════════════════════════════════════════════════════ */
window.LESSON_CONTENT = window.LESSON_CONTENT || {};

window.LESSON_CONTENT['db_design_nc'] = {
  course_id: 'db_design_nc',
  course_title: 'Bên trong Database Engine — GameHub Marketplace',
  lessons: [

    /* ═══════════ MODULE 7 — Engine Room: Query Processing (Ticket #42-#51) ═══════════
     * PART_6 roadmap 10 bài · sách Ch 15-16. Luật PART_6: visual cost TRƯỚC công thức,
     * EXPLAIN kiểu Postgres nhưng không vendor-specific, không dạy optimizer như magic box. */

    /* ── nc_01 — Ticket #42 · Từ SQL đến Execution Plan ──
     * PART_6 Bài 1 (Ch 15.1 + 16.1): pipeline parsing→optimization→evaluation;
     * 1 query nhiều plan; plan = algorithm/index cụ thể. Interaction chính =
     * kéo query qua 4 trạm, mỗi trạm reveal 1 phần plan (user chốt 2026-07-05).
     * 2 cây σ/π hoán vị = dịch thẳng ví dụ sách p719 sang listings. */
    {
      id: 'nc_01', index: 1,
      title: 'Từ SQL đến Execution Plan — dây chuyền trong engine',
      subtitle: 'Câu SQL không "chạy thẳng" — nó được dịch, đem cân, rồi mới thực thi',
      module: 7, module_title: 'Engine Room — Query Processing',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'mcq_code',
      drag_map: {
        table: {
          name: 'listings (40.000 dòng — mẫu 5)',
          columns: ['listing_id', 'item_name', 'category', 'price', 'seller_id'],
          dataRows: [
            ['3001', 'Kiếm gỗ Newbie', 'weapon', '45', '7'],
            ['3002', 'Giáp rồng Huyền thoại', 'armor', '12500', '9'],
            ['3003', 'Bùa may mắn', 'trinket', '99', '12'],
            ['3004', 'Skin súng Neon', 'skin', '790', '15'],
            ['3005', 'Khiên gỗ sồi', 'armor', '80', '12']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #42',
        hook: 'GameHub mở CHỢ — 40.000 vật phẩm lên kệ ngay ngày đầu, và ô tìm kiếm lập tức bị khách phàn nàn: <em>"gõ vật phẩm dưới 100 gem, đợi 3 giây"</em>. Bạn soi query — ĐÚNG 100%. Vấn đề nằm ở đoạn đường không dev nào nhìn thấy: từ lúc SQL rời tay bạn đến lúc kết quả quay về, nó đi qua <strong>một dây chuyền 4 trạm</strong> bên trong engine, và cùng một câu SQL có thể bị chạy theo kế hoạch nhanh hoặc chậm gấp trăm lần. Ticket #42: đi theo query qua từng trạm — muốn trị query chậm (việc của cả module này), trước hết phải biết nó bị "xử" ở đâu.'
      },
      step_1: {
        primer: {
          goal: [
            'SQL không "chạy thẳng" — nó đi qua dây chuyền: Parser dịch → cây phép toán → Optimizer chọn plan → Engine thực thi',
            'Cùng 1 query có NHIỀU plan hợp lệ: SQL nói LẤY GÌ, plan mới nói LÀM THẾ NÀO (đọc kiểu gì, lọc lúc nào)',
            'Optimizer chọn plan bằng THỐNG KÊ về dữ liệu — không chạy thử; dữ liệu thật chỉ bị đụng ở trạm cuối'
          ],
          intro: 'Gọi món ở nhà hàng: bạn viết order <em>"1 phở bò tái, ít bánh"</em> — tờ giấy nói MÓN GÌ, không nói nấu ra sao. Order đi qua: thu ngân soát menu có món đó không (<strong>Parser</strong>), bếp trưởng dịch thành công thức từng bước (<strong>cây phép toán</strong>), rồi quyết nấu theo cách nào nhanh nhất với cái bếp đang đông (<strong>Optimizer</strong> chọn plan), phụ bếp cứ thế làm đúng kế hoạch (<strong>Engine</strong>). Câu SQL của bạn là tờ order — và cả module này là chuyến tham quan xuống bếp.',
          example: 'Cùng câu "tìm vật phẩm dưới 100 gem" trên 40.000 dòng: kế hoạch A khiêng CẢ KHO ra quầy rồi mới lọc; kế hoạch B lọc ngay tại kệ, chỉ khiêng 1.204 món. Kết quả Y HỆT — công sức một trời một vực. Chọn B là việc của optimizer, không phải của câu SQL.'
        },
        concept_cards: [
          {
            icon: 'fa-industry',
            title: 'Bốn trạm của dây chuyền',
            body: '<strong>Parser</strong> soát syntax + kiểm tra bảng/cột có thật, rồi dịch query ra <strong>cây phép toán</strong> (σ lọc, π chọn cột) — bản kế hoạch "làm gì" chưa nói "làm thế nào". <strong>Optimizer</strong> so các plan khả dĩ bằng thống kê về dữ liệu, chốt bản rẻ nhất. <strong>Evaluation Engine</strong> cầm plan chạy trên dữ liệu thật, trả kết quả.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 15.1 — Steps in query processing'
          },
          {
            icon: 'fa-map',
            title: 'SQL nói GÌ — plan nói THẾ NÀO',
            body: 'SQL khai báo: "lấy item_name, price của listings có price&lt;100" — hết. Execution plan mới trả lời phần còn lại: đọc bảng bằng cách nào (quét tuần tự? tra index?), lọc ở bước nào, lấy cột lúc nào. Một SQL → nhiều plan hợp lệ, cùng kết quả, khác tốc độ — vì thế mới cần người cầm cân.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Soi lại GameHub: ô search Marketplace, feed Community, bảng xếp hạng thứ hạng — MỌI query bạn viết ở 2 khóa trước đều đã lặng lẽ đi qua dây chuyền này. Module 7 là mở nắp capo: bài sau gắn <strong>GIÁ TIỀN</strong> lên từng kế hoạch — để hiểu optimizer "cân" bằng đơn vị gì.'
          }
        ],
        plan_visual: {
          query: "SELECT item_name, price FROM listings WHERE price < 100;",
          caption: 'Cùng MỘT query — hai kế hoạch hợp lệ, kết quả y hệt. Optimizer chọn bản rẻ.',
          trees: [
            {
              name: 'Plan A — khiêng hết rồi lọc',
              chosen: false,
              note: 'Hợp lệ, nhưng π phải khiêng cả kho',
              nodes: [
                { op: 'listings', kind: 'table', detail: 'kho 40.000 dòng', rows: '40.000 dòng' },
                { op: 'π item_name, price', kind: 'project', detail: 'lấy 2 cột của MỌI dòng', rows: '40.000 dòng' },
                { op: 'σ price < 100', kind: 'filter', detail: 'giờ mới lọc', rows: '1.204 dòng' }
              ]
            },
            {
              name: 'Plan B — lọc sớm, khiêng ít',
              chosen: true,
              note: '✓ Optimizer chọn — σ chặn ngay cửa kho',
              nodes: [
                { op: 'listings', kind: 'table', detail: 'kho 40.000 dòng', rows: '40.000 dòng' },
                { op: 'σ price < 100', kind: 'filter', detail: 'lọc ngay tại kệ', rows: '1.204 dòng' },
                { op: 'π item_name, price', kind: 'project', detail: 'chỉ khiêng 1.204', rows: '1.204 dòng' }
              ]
            }
          ]
        },
        visual: {
          schema: {
            table_name: 'listings — kệ hàng Marketplace (40.000 dòng)',
            columns: [
              { name: 'listing_id', type: 'INT', key: 'PK' },
              { name: 'item_name', type: 'VARCHAR', key: '' },
              { name: 'category', type: 'VARCHAR', key: '' },
              { name: 'price', type: 'INT (gem)', key: '' },
              { name: 'seller_id', type: 'INT', key: 'FK' }
            ]
          },
          data_preview: [
            ['3001', 'Kiếm gỗ Newbie', 'weapon', '45 ← lọt lưới', '7'],
            ['3002', 'Giáp rồng Huyền thoại', 'armor', '12500', '9'],
            ['3003', 'Bùa may mắn', 'trinket', '99 ← lọt lưới', '12'],
            ['3004', 'Skin súng Neon', 'skin', '790', '15'],
            ['3005', 'Khiên gỗ sồi', 'armor', '80 ← lọt lưới', '12']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Bạn gõ <code>SELECT item_name, price FROM listings WHERE price &lt; 100</code> và bấm Run. Việc ĐẦU TIÊN engine làm với câu chữ này là gì?',
            options: [
              { id: 'a', text: 'Soát syntax, kiểm tra listings và price có thật trong database không, rồi dịch sang dạng nội bộ (cây phép toán)', correct: true, explanation: 'Đúng — SQL là ngôn ngữ cho NGƯỜI. Engine phải hiểu và dịch nó (parser & translator) trước khi bàn chuyện chạy. Gõ sai tên bảng là bị chặn ngay tại trạm này.' },
              { id: 'b', text: 'Chạy thẳng câu SQL trên file dữ liệu, vừa đọc vừa hiểu tới đâu hay tới đó', correct: false, explanation: 'Sai — SQL text không "chạy" được trực tiếp; máy cần bản dịch nội bộ và một kế hoạch cụ thể trước đã.' },
              { id: 'c', text: 'Đưa ngay cho optimizer để chọn cách chạy nhanh nhất', correct: false, explanation: 'Sai thứ tự — optimizer làm việc trên CÂY PHÉP TOÁN, mà cây đó phải do parser dịch ra trước.' },
              { id: 'd', text: 'Đọc toàn bộ bảng listings vào RAM để chuẩn bị sẵn', correct: false, explanation: 'Sai — dữ liệu thật chỉ bị đụng tới ở trạm CUỐI (engine chạy plan); các trạm trước làm việc hoàn toàn trên "giấy tờ".' }
            ]
          },
          {
            question: 'Hai plan ở màn hình đầu bài — "khiêng hết rồi lọc" và "lọc sớm" — cho kết quả GIỐNG HỆT nhau. Vậy optimizer mất công so sánh để làm gì?',
            options: [
              { id: 'a', text: 'Vì chi phí khác nhau một trời một vực: plan quyết định khiêng bao nhiêu dữ liệu, lọc sớm hay muộn — kết quả y hệt nhưng 0,3 giây hay 3 giây là chuyện khác', correct: true, explanation: 'Đúng — mọi plan hợp lệ đều cho đúng kết quả; thứ khác nhau là CÔNG SỨC. Và optimizer chọn bằng THỐNG KÊ về dữ liệu, không phải đoán mò.' },
              { id: 'b', text: 'Vì mỗi plan cho kết quả hơi khác nhau, phải chọn bản chính xác nhất', correct: false, explanation: 'Sai — plan hợp lệ nào cũng cho ĐÚNG kết quả đó. Kết quả mà khác nhau thì là bug, không phải chuyện tối ưu.' },
              { id: 'c', text: 'Vì câu SQL viết chưa đủ rõ nên engine phải đoán ý người dùng', correct: false, explanation: 'Sai — SQL đặc tả chính xác LẤY GÌ; thứ nó cố tình bỏ ngỏ là LÀM THẾ NÀO, và đó chính là đất diễn của optimizer.' },
              { id: 'd', text: 'Không cần so — mỗi query chỉ có đúng một cách chạy', correct: false, explanation: 'Sai — chính vì 1 query có NHIỀU cách chạy nên optimizer mới tồn tại. Bạn vừa thấy 2 cách ngay đầu bài.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Việc nào thuộc khâu nào?',
          instruction: 'Kéo từng việc vào đúng khâu — nửa đầu dây chuyền chỉ làm việc trên GIẤY TỜ, nửa sau mới QUYẾT và đụng dữ liệu thật.',
          xp: 20,
          chips: [
            { id: 'q1', label: 'Soát tên bảng/cột có thật không' },
            { id: 'q2', label: 'Dịch query thành cây phép toán σ/π' },
            { id: 'q3', label: 'So chi phí các plan bằng thống kê, chốt 1 bản' },
            { id: 'q4', label: 'Chạy plan trên dữ liệu thật, trả kết quả' }
          ],
          bins: [
            { id: 'dich', label: 'Khâu DỊCH 📝 (parser & translator)' },
            { id: 'quyet', label: 'Khâu QUYẾT & CHẠY ⚙️ (optimizer + engine)' }
          ],
          solution: { q1: 'dich', q2: 'dich', q3: 'quyet', q4: 'quyet' }
        }
      },
      step_3: {
        mission: 'Query của khách vừa rời ô tìm kiếm. Lắp đúng vai trò vào 4 trạm cho nó về đích — có MỘT khối bịa.',
        blocks: [
          { type: 'op', token: 'So các plan khả dĩ bằng THỐNG KÊ dữ liệu — không chạy thử, chỉ ước lượng — rồi chốt bản rẻ nhất', slot: 'st-opt' },
          { type: 'op', token: 'Soát chính tả SQL, kiểm tra bảng listings & cột price có thật — rồi dịch thành dạng nội bộ', slot: 'st-parse' },
          { type: 'op', token: 'Chạy thử TẤT CẢ plan trên dữ liệu thật, plan nào về đích trước thì giữ lại', slot: 'st-x' },
          { type: 'op', token: 'Biểu diễn query thành cây phép toán: σ lọc price<100, π lấy item_name & price', slot: 'st-tree' },
          { type: 'op', token: 'Cầm plan đã chốt chạy trên dữ liệu thật, trả 1.204 dòng kết quả về cho khách', slot: 'st-run' }
        ],
        drop_zones: [
          { id: 'st-parse', placeholder: 'Trạm 1 — SQL vừa tới, việc đầu tiên?', accepts: ['op'], multi: false,
            station: { icon: '🛂', label: 'Cổng tiếp nhận', sub: 'Trạm 1', hint: 'SQL là chữ cho NGƯỜI — engine phải hiểu và dịch nó trước khi bàn chuyện chạy.' } },
          { id: 'st-tree', placeholder: 'Trạm 2 — query hợp lệ rồi, giờ nó thành dạng gì?', accepts: ['op'], multi: false,
            station: { icon: '🌳', label: 'Bàn dịch thuật', sub: 'Trạm 2', hint: 'Dạng nội bộ của query là CÂY phép toán — mới nói LÀM GÌ, chưa nói làm THẾ NÀO.' } },
          { id: 'st-opt', placeholder: 'Trạm 3 — nhiều đường cùng về MỘT kết quả, ai quyết?', accepts: ['op'], multi: false,
            station: { icon: '⚖️', label: 'Bàn cân kế hoạch', sub: 'Trạm 3', hint: 'Trạm này KHÔNG đụng dữ liệu thật — nó ƯỚC LƯỢNG chi phí từng plan bằng thống kê rồi chốt.' } },
          { id: 'st-run', placeholder: 'Trạm 4 — kế hoạch đã chốt, ai ra tay?', accepts: ['op'], multi: false,
            station: { icon: '🏃', label: 'Xưởng thực thi', sub: 'Trạm 4', hint: 'Chỉ ở đây dữ liệu thật mới bị đụng tới — chạy đúng theo plan, trả kết quả.' } }
        ],
        expected_sql: 'Soát chính tả SQL, kiểm tra bảng listings & cột price có thật — rồi dịch thành dạng nội bộ Biểu diễn query thành cây phép toán: σ lọc price<100, π lấy item_name & price So các plan khả dĩ bằng THỐNG KÊ dữ liệu — không chạy thử, chỉ ước lượng — rồi chốt bản rẻ nhất Cầm plan đã chốt chạy trên dữ liệu thật, trả 1.204 dòng kết quả về cho khách',
        expected_zones: {
          'st-parse': 'Soát chính tả SQL, kiểm tra bảng listings & cột price có thật — rồi dịch thành dạng nội bộ',
          'st-tree': 'Biểu diễn query thành cây phép toán: σ lọc price<100, π lấy item_name & price',
          'st-opt': 'So các plan khả dĩ bằng THỐNG KÊ dữ liệu — không chạy thử, chỉ ước lượng — rồi chốt bản rẻ nhất',
          'st-run': 'Cầm plan đã chốt chạy trên dữ liệu thật, trả 1.204 dòng kết quả về cho khách'
        },
        /* reveal_strip: true = bật strip hiển thị (opt-in — #reveal-hint-text hồi sinh
         * cho NC pilot, Basic/TC giữ compact). reveal_hints hiện khi zone là ô trống
         * KẾ TIẾP (renderer updateRevealHint) — viết theo nhịp: reveal output trạm
         * TRƯỚC + dẫn dắt trạm này ("mỗi trạm reveal một phần plan" — PART_6 Bài 1). */
        reveal_strip: true,
        reveal_complete: '💡 BẠN VỪA XÂY trọn pipeline: <code>SQL → Parser → Cây phép toán → Optimizer → Plan → Engine → 1.204 dòng</code>. Khối "chạy thử tất cả plan" nằm lại kho — optimizer không bao giờ chạy thử, nó ƯỚC LƯỢNG. Bấm <strong>Chạy Query</strong> xem dây chuyền chạy sống.',
        reveal_hints: {
          'st-parse': 'SQL vừa tới còn là CHỮ cho người đọc. Trạm 1 chờ đúng người: ai soát chính tả, kiểm tra bảng/cột có thật, rồi dịch sang dạng nội bộ? (Gõ nhầm <code>listing</code> là bị chặn ngay tại trạm này.)',
          'st-tree': 'Trạm 1 vừa nhả ra: <code>✓ syntax OK · listings ✓ · price ✓</code>. Trạm 2 cần người biến query thành <strong>CÂY phép toán</strong> — bản kế hoạch mới nói "làm gì", chưa nói "làm thế nào".',
          'st-opt': 'Trạm 2 vừa nhả ra <code>π ( σ ( listings ) )</code> — và một bản hoán vị σ/π nữa: CÙNG query, 2 cây hợp lệ. Trạm 3 cần người cầm cân: lọc-muộn khiêng <strong>40.000 dòng</strong>, lọc-sớm chỉ <strong>1.204</strong> — chọn bằng THỐNG KÊ, không chạy thử.',
          'st-run': 'Trạm 3 đã chốt plan lọc-sớm. Trạm 4 cần người ra tay: chỉ ở đây dữ liệu THẬT mới bị đụng tới — chạy đúng theo plan, trả 1.204 dòng. Lắp nốt là bạn XÂY trọn pipeline: <code>SQL → Parser → Cây → Optimizer → Engine</code>.'
        }
      },
      step_4: {
        prompt: '<strong>Ticket #42 — kiểm tra tay nghề:</strong> khách tra giáp giá mềm: <code>SELECT item_name FROM listings WHERE category = \'armor\' AND price &lt; 500;</code>. Trong 4 tấm thẻ dưới đây, tấm nào là <strong>EXECUTION PLAN</strong> — thứ engine THẬT SỰ cầm đi chạy?',
        challenge_type: 'mcq_code',
        options: [
          {
            text: "SELECT item_name FROM listings\nWHERE category = 'armor' AND price < 500;",
            correct: false,
            explain: 'Đây là SQL text — bản YÊU CẦU của khách: nói lấy GÌ, chưa hề nói làm THẾ NÀO (đọc bảng bằng cách gì? lọc lúc nào?).'
          },
          {
            text: "π item_name ( σ category='armor' ∧ price<500 ( listings ) )",
            correct: false,
            explain: 'Đây là cây phép toán — bản DỊCH nội bộ ở Trạm 2: đã thành phép toán nhưng CHƯA gắn thuật toán/cách đọc dữ liệu. Thiếu phần "chạy bằng gì" thì chưa phải plan.'
          },
          {
            text: "1. Seq Scan listings — đọc lần lượt từng dòng\n2. Filter: category = 'armor' AND price < 500\n3. Output: item_name",
            correct: true
          },
          {
            text: "item_name\n────────────────\nKhiên gỗ sồi\nGiáp da sói\nGiáp xích vệ binh",
            correct: false,
            explain: 'Đây là KẾT QUẢ — sản phẩm cuối cùng SAU khi engine đã chạy xong plan, không phải bản kế hoạch.'
          }
        ],
        schema: {
          table_name: 'listings',
          columns: [
            { name: 'listing_id', type: 'INT', key: 'PK' },
            { name: 'item_name', type: 'VARCHAR', key: '' },
            { name: 'category', type: 'VARCHAR', key: '' },
            { name: 'price', type: 'INT (gem)', key: '' },
            { name: 'seller_id', type: 'INT', key: 'FK' }
          ],
          data: [
            ['3001', 'Kiếm gỗ Newbie', 'weapon', '45', '7'],
            ['3005', 'Khiên gỗ sồi', 'armor', '80', '12'],
            ['3006', 'Giáp da sói', 'armor', '320', '9'],
            ['3007', 'Giáp xích vệ binh', 'armor', '470', '15'],
            ['3002', 'Giáp rồng Huyền thoại', 'armor', '12500', '9']
          ]
        },
        context: {
          scenario: 'Bốn tấm thẻ là 4 "nhân dạng" của CÙNG một yêu cầu ở 4 chặng khác nhau. Nhận diện nhầm là đi tong cả module: từ bài sau, thứ ta mổ xẻ, gắn giá tiền và tối ưu là PLAN — không phải câu SQL.',
          real_world: 'Postgres/MySQL đều cho bạn xem "tấm thẻ kế hoạch" bằng lệnh EXPLAIN. Dev có nghề debug query chậm không nhìn chằm chằm câu SQL — họ gọi EXPLAIN ra xem engine ĐỊNH chạy thế nào.',
          steps: [
            'Loại tấm nói LẤY GÌ nhưng không nói LÀM THẾ NÀO — đó là bản yêu cầu.',
            'Loại tấm mới là phép toán trung gian, chưa gắn thuật toán.',
            'Loại tấm là sản phẩm cuối — dữ liệu, không phải kế hoạch.',
            'Tấm còn lại: có ĐỘNG TÁC cụ thể — đọc kiểu gì, lọc ở bước nào, nhả ra cột gì.'
          ],
          hint_explore: 'Nhớ lại bản đồ Step 3: tấm thẻ nào là thứ TRẠM 4 cầm trên tay lúc ra tay?',
          expected: 'Chọn đúng tấm "kế hoạch có động tác": Seq Scan → Filter → Output.'
        },
        hints: [
          { level: 1, text: 'Execution plan phải trả lời "làm THẾ NÀO": đọc bảng bằng cách gì, lọc ở bước nào, nhả ra cột gì. Tấm nào có ĐỘNG TÁC?' },
          { level: 2, text: 'Ở Trạm 4 trên bản đồ, engine cầm một danh sách các BƯỚC cụ thể — không phải câu chữ SQL, cũng không phải bảng kết quả.' },
          { level: 3, text: 'Loại trừ dần: một tấm là YÊU CẦU (SQL), một tấm là BẢN DỊCH trung gian (σ/π chưa nói cách chạy), một tấm là SẢN PHẨM (dữ liệu đã lấy xong).' },
          { level: 4, text: 'Tấm C — chuỗi bước <code>Seq Scan → Filter → Output</code> chính là execution plan: mỗi bước là một phép toán ĐÃ GẮN cách chạy cụ thể.' }
        ],
        success_message: 'TICKET #42 ĐÓNG — MARKETPLACE MỞ HÀNG! 🛒 Bạn vừa thấy thứ 90% người viết SQL cả đời không thấy: đoạn đường từ câu lệnh đến kết quả. Nhưng khoan… ở Trạm 3, optimizer phán plan lọc-sớm "RẺ hơn". Rẻ hơn bao nhiêu? Đo bằng đơn vị gì? Bài sau mở bảng giá của thế giới ngầm: Block Transfer & Random I/O — vì sao đọc 1.000 trang liền mạch có khi RẺ hơn nhảy cóc 300 lần.',
        xp_reward: 120
      },
      concept_cards_after: ['nc_card_evaluation_primitive']
    },

    /* ── nc_02 — Ticket #43 · Vì sao query có giá? Block Transfer, Random I/O & Memory ──
     * PART_6 Bài 2 (Ch 15.2): cost = b×tT + S×tS; HDD 2018 tS=4ms, tT=0,1ms (số minh họa
     * của sách); kịch bản nguyên văn roadmap: Plan A 1.000 block tuần tự vs Plan B index
     * 300 cú nhảy + SLIDER "memory available" (user chốt 2026-07-05: slider thật).
     * Twist đảo nc_01: lần này optimizer chọn SEQ SCAN — đọc gấp 3 dữ liệu mà rẻ gấp 12. */
    {
      id: 'nc_02', index: 2,
      title: 'Vì sao query có giá? Block Transfer, Random I/O & Memory',
      subtitle: 'Hai loại vé của đĩa cứng: khiêng block liền mạch giá rẻ — cú nhảy random đắt gấp 40 lần',
      module: 7, module_title: 'Engine Room — Query Processing',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'fill_blank',
      drag_map: {
        table: {
          name: 'orders (100.000 đơn ≈ 1.000 block — mẫu 5)',
          columns: ['order_id', 'buyer_id', 'seller_id', 'total', 'status'],
          dataRows: [
            ['9001', '88', '4102', '80', 'delivered'],
            ['9002', '21', '9', '12500', 'shipped'],
            ['9003', '34', '4102', '99', 'delivered'],
            ['9004', '88', '15', '790', 'delivered'],
            ['9005', '56', '4102', '45', 'flagged']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #43',
        hook: 'Ticket #42 đóng chưa ráo mực thì sếp gõ bàn: <em>"Optimizer bảo plan này RẺ HƠN — rẻ hơn bao nhiêu? Đo bằng gì?"</em>. Cả phòng im. Đúng lúc đó đội vận hành in ra 2 plan cho query soát <strong>300 đơn nghi gian lận</strong> trong kho <code>orders</code> 100.000 đơn: một bản đọc tuần tự cả nghìn block, một bản đi index nhưng nhảy cóc 300 phát. Ticket #43: học BẢNG GIÁ mà optimizer dùng — mỗi cú seek, mỗi block đều có giá niêm yết, và RAM là tấm vé miễn phí.'
      },
      step_1: {
        primer: {
          goal: [
            'Cost của plan = tiền vé I/O: VÉ BLOCK liền mạch (0,1ms) rẻ — VÉ SEEK nhảy random (4ms) đắt gấp 40 lần',
            'Công thức sách: cost = số block × tT + số cú nhảy × tS — so 2 plan là so 2 tờ hóa đơn',
            'RAM buffer = vé miễn phí: block đã nằm sẵn trong RAM đọc ~0ms — kéo slider bên dưới để thấy hóa đơn đổi'
          ],
          intro: 'Shipper giao 300 gói hàng: tuyến A phát TUẦN TỰ dọc một con phố — đề-pa đúng 1 lần rồi cứ thế lăn bánh qua từng nhà; tuyến B nhảy cóc 300 địa chỉ rải khắp thành phố — mỗi địa chỉ một cú đề-pa, dù gói hàng nhẹ tênh. Đĩa cứng y hệt: đọc block LIỀN MẠCH chỉ trả tiền băng chuyền (<strong>0,1ms/block</strong>), còn mỗi cú NHẢY RANDOM phải chờ đầu đọc di chuyển + đĩa xoay tới đúng chỗ (<strong>~4ms</strong>) rồi mới đọc được byte đầu tiên. Optimizer không đoán mò — nó cộng hóa đơn: <code>cost = b × tT + S × tS</code>.',
          example: 'Query soát gian lận: Plan A quét tuần tự 1.000 block = 4 + 1.000×0,1 = <strong>104ms</strong>. Plan B đi index, 300 cú nhảy = 300×4,1 = <strong>1.230ms</strong> — đọc ÍT dữ liệu hơn 3 lần mà trả tiền GẤP 12. Ai bảo đọc ít hơn là rẻ hơn?'
        },
        concept_cards: [
          {
            icon: 'fa-ticket',
            title: 'Hai loại vé của đĩa',
            body: 'Vé <strong>tT — block transfer</strong>: khiêng 1 block 4KB qua băng chuyền, ~0,1ms. Vé <strong>tS — seek</strong>: đầu đọc di chuyển + đĩa xoay tới nơi trước khi đọc, ~4ms. Cùng là "đọc 1 block", đọc TIẾP block kế bên và NHẢY tới block xa lạ chênh nhau 40 lần tiền. (Số HDD 2018 của sách — giá minh họa, không phải hằng số vũ trụ.)',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 15.2 — Measures of Query Cost: tS = 4ms, tT = 0,1ms'
          },
          {
            icon: 'fa-file-invoice-dollar',
            title: 'Hóa đơn = b × tT + S × tS',
            body: 'Muốn so 2 plan, đừng đếm số DÒNG — hãy đếm 2 thứ: khiêng bao nhiêu <strong>block</strong>, nhảy random bao nhiêu <strong>lần</strong>. Nhân giá vé, cộng lại, so. Optimizer làm đúng phép tính này hàng triệu lần mỗi ngày — chỉ khác là nó lấy số liệu từ thống kê chứ không ai đưa sẵn.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Vì sao cùng query chạy lần 2 thường nhanh hơn hẳn? Block đã được kéo vào <strong>RAM buffer</strong> — lần sau đọc ~0ms, vé miễn phí. RAM đủ to thì tranh cãi seq/index nguội ngắt… nhưng kho Marketplace 100.000 đơn thì RAM thường không chứa nổi cả bảng — và hóa đơn I/O quay lại làm chủ cuộc chơi.'
          }
        ],
        plan_visual: {
          query: "SELECT order_id, total FROM orders WHERE seller_id = 4102;  -- 300 đơn nghi gian lận",
          caption: 'Optimizer không đếm số dòng — nó cộng HÓA ĐƠN I/O. Kéo slider RAM để xem hóa đơn đổi.',
          price: {
            seek_ms: 4, block_ms: 0.1,
            note: 'Giá HDD minh họa theo sách (2018): tS = 4ms · tT = 0,1ms — SSD/RAM giá khác hẳn, xem Hồ sơ sau bài.'
          },
          trees: [
            {
              name: 'Plan A — Seq Scan cả kho',
              chosen: true,
              note: '✓ Optimizer chọn — khiêng gấp 3 dữ liệu mà RẺ gấp 12',
              io: { access: 'seq', seeks: 1, blocks: 1000 },
              nodes: [
                { op: 'orders', kind: 'table', detail: '100.000 đơn ≈ 1.000 block', rows: '1.000 block' },
                { op: 'Seq Scan', kind: 'scan', detail: 'đọc liền mạch từ block đầu tới cuối', rows: '100.000 dòng', cost: '1 seek + 1.000 block' },
                { op: 'σ seller_id = 4102', kind: 'filter', detail: 'lọc ngay trong lúc quét', rows: '300 dòng' }
              ]
            },
            {
              name: 'Plan B — Index nhảy theo RID',
              chosen: false,
              note: 'Đọc ít hơn 3 lần — trả tiền gấp 12 lần',
              io: { access: 'random', seeks: 300, blocks: 300 },
              nodes: [
                { op: 'orders', kind: 'table', detail: '300 đơn rải khắp 1.000 block', rows: '300 block đọc lẻ' },
                { op: 'Index Scan idx_seller', kind: 'scan', detail: 'mỗi đơn một cú nhảy random', rows: '300 dòng', cost: '300 × (4 + 0,1) ms' }
              ]
            }
          ],
          ram_slider: {
            table_blocks: 1000,
            label: 'RAM buffer',
            explain: 'Block đã nằm trong RAM đọc ~0ms (sách 15.2: tT trong RAM < 1μs) — ước lượng kỳ vọng với cache ngẫu nhiên. Kéo hết cỡ: cả hai hóa đơn về ≈ 0, tranh cãi seq/index nguội ngắt. Nhưng dữ liệu to hơn RAM là chuyện thường ngày ở Marketplace.'
          }
        },
        visual: {
          schema: {
            table_name: 'orders — sổ đơn hàng Marketplace (100.000 đơn ≈ 1.000 block)',
            columns: [
              { name: 'order_id', type: 'INT', key: 'PK' },
              { name: 'buyer_id', type: 'INT', key: 'FK' },
              { name: 'seller_id', type: 'INT', key: '🔑 idx_seller' },
              { name: 'total', type: 'INT (gem)', key: '' },
              { name: 'status', type: 'VARCHAR', key: '' }
            ]
          },
          data_preview: [
            ['9001', '88', '4102 ← nghi vấn', '80', 'delivered'],
            ['9002', '21', '9', '12500', 'shipped'],
            ['9003', '34', '4102 ← nghi vấn', '99', 'delivered'],
            ['9004', '88', '15', '790', 'delivered'],
            ['9005', '56', '4102 ← nghi vấn', '45', 'flagged']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Vì sao 1 cú seek (4ms) đắt gấp 40 lần khiêng 1 block liền mạch (0,1ms)?',
            options: [
              { id: 'a', text: 'Seek là việc CƠ HỌC: đầu đọc phải di chuyển + chờ đĩa xoay tới đúng chỗ rồi mới đọc được byte đầu — còn đọc liền mạch thì cứ thế trôi theo băng chuyền', correct: true, explanation: 'Đúng — tS gồm seek time + rotational latency (sách 15.2). Vì thế "đọc Ở ĐÂU" quan trọng ngang "đọc BAO NHIÊU".' },
              { id: 'b', text: 'Vì block nằm xa chứa nhiều dữ liệu hơn block gần', correct: false, explanation: 'Sai — block nào cũng 4KB như nhau; đắt là ở HÀNH TRÌNH tới block, không phải kích thước.' },
              { id: 'c', text: 'Vì đi qua index thì phải giải mã dữ liệu trước khi đọc', correct: false, explanation: 'Sai — giải mã/so sánh là tiền CPU, khoản khác hẳn; 4ms này là thời gian cơ học của đĩa.' },
              { id: 'd', text: 'Vì hệ điều hành thu phí các cú nhảy để chống lạm dụng', correct: false, explanation: 'Sai — không có "thuế" nào cả, chỉ có vật lý: đầu đọc là một cánh tay kim loại thật.' }
            ]
          },
          {
            question: 'Plan B đọc vỏn vẹn 300 block — ÍT hơn Plan A ba lần — mà hóa đơn 1.230ms so với 104ms. Bài học rút ra?',
            options: [
              { id: 'a', text: 'Cost không nằm ở SỐ LƯỢNG dữ liệu mà ở CÁCH đọc: 300 cú nhảy random trả 300 lần tiền seek, còn 1.000 block liền mạch chỉ trả 1', correct: true, explanation: 'Đúng — đây chính là lý do optimizer đôi khi chọn seq scan dù index sờ sờ. Bài sau mổ xẻ tận nơi.' },
              { id: 'b', text: 'Hôm đó máy chủ chậm nên số đo không đáng tin', correct: false, explanation: 'Sai — đây là ƯỚC LƯỢNG từ bảng giá, không phải số đo một hôm xui; chạy hôm nào tỷ lệ vẫn vậy.' },
              { id: 'c', text: 'Index bị hỏng nên mới chậm — sửa index là xong', correct: false, explanation: 'Sai — index hoạt động hoàn hảo; đắt là ở 300 cú nhảy mà index DẪN TỚI, không phải ở bản thân index.' },
              { id: 'd', text: 'Đọc ít hơn luôn rẻ hơn — chắc đề bài tính nhầm', correct: false, explanation: 'Sai — tự tay nhân lại đi: 300 × 4,1 = 1.230. Chính trực giác "ít = rẻ" là cái bẫy của bài này.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Vé rẻ hay vé đắt?',
          instruction: 'Nhẩm bằng bảng giá (seek 4ms · block 0,1ms) rồi xếp vé — coi chừng: đọc ÍT chưa chắc rẻ.',
          xp: 20,
          chips: [
            { id: 'c1', label: 'Đọc 500 block liền mạch một lèo' },
            { id: 'c2', label: 'Nhảy random 50 cú tới 50 block rải rác' },
            { id: 'c3', label: 'Block cần đọc ĐÃ nằm sẵn trong RAM buffer' },
            { id: 'c4', label: 'Nhảy random 300 cú' }
          ],
          bins: [
            { id: 're', label: 'Vé RẺ 🎟️ (vài chục ms đổ lại)' },
            { id: 'dat', label: 'Vé ĐẮT 💸 (hàng trăm ms trở lên)' }
          ],
          solution: { c1: 're', c3: 're', c2: 'dat', c4: 'dat' }
        }
      },
      step_3: {
        mission: 'Lập hóa đơn I/O cho cả hai plan rồi chốt sổ — có MỘT khoản bịa.',
        blocks: [
          { type: 'op', token: 'Hóa đơn Plan B: 300 cú nhảy random, mỗi cú = seek + khiêng 1 block = 300 × 4,1ms — 1.230ms', slot: 'bill-b' },
          { type: 'op', token: 'Khoản mở màn Plan A: 1 cú seek tới block đầu tiên — 4ms', slot: 'bill-a1' },
          { type: 'op', token: 'Hóa đơn Plan B: 300 block × 0,1ms = 30ms — nhảy random hay liền mạch cũng một giá', slot: 'bill-x' },
          { type: 'op', token: 'Chốt sổ: Plan A 104ms — rẻ hơn ~12 lần dù khiêng gấp 3 lần dữ liệu', slot: 'bill-v' },
          { type: 'op', token: 'Khoản chính Plan A: khiêng 1.000 block liền mạch × 0,1ms — 100ms', slot: 'bill-a2' }
        ],
        drop_zones: [
          { id: 'bill-a1', placeholder: 'Hóa đơn A — khoản mở màn?', accepts: ['op'], multi: false,
            station: { icon: '🧾', label: 'Hóa đơn A · khoản 1', sub: 'Seq Scan', hint: 'Seq scan cũng phải TÌM ĐẾN block đầu tiên — đúng một cú seek cho cả chuyến.' } },
          { id: 'bill-a2', placeholder: 'Hóa đơn A — khoản chính?', accepts: ['op'], multi: false,
            station: { icon: '🚚', label: 'Hóa đơn A · khoản 2', sub: 'Băng chuyền', hint: 'Từ block đầu trở đi chỉ trả tiền băng chuyền — nhân số block với 0,1ms.' } },
          { id: 'bill-b', placeholder: 'Hóa đơn B — index tính tiền kiểu gì?', accepts: ['op'], multi: false,
            station: { icon: '💸', label: 'Hóa đơn B', sub: 'Index Scan', hint: '300 đơn rải rác — MỖI đơn một cú nhảy, và cú nhảy nào cũng dính tiền seek.' } },
          { id: 'bill-v', placeholder: 'Chốt sổ — plan nào rẻ?', accepts: ['op'], multi: false,
            station: { icon: '⚖️', label: 'Chốt sổ', sub: 'So hóa đơn', hint: 'So hai con số cuối cùng — "đọc ít dữ liệu hơn" có thắng không?' } }
        ],
        expected_sql: 'Khoản mở màn Plan A: 1 cú seek tới block đầu tiên — 4ms Khoản chính Plan A: khiêng 1.000 block liền mạch × 0,1ms — 100ms Hóa đơn Plan B: 300 cú nhảy random, mỗi cú = seek + khiêng 1 block = 300 × 4,1ms — 1.230ms Chốt sổ: Plan A 104ms — rẻ hơn ~12 lần dù khiêng gấp 3 lần dữ liệu',
        expected_zones: {
          'bill-a1': 'Khoản mở màn Plan A: 1 cú seek tới block đầu tiên — 4ms',
          'bill-a2': 'Khoản chính Plan A: khiêng 1.000 block liền mạch × 0,1ms — 100ms',
          'bill-b': 'Hóa đơn Plan B: 300 cú nhảy random, mỗi cú = seek + khiêng 1 block = 300 × 4,1ms — 1.230ms',
          'bill-v': 'Chốt sổ: Plan A 104ms — rẻ hơn ~12 lần dù khiêng gấp 3 lần dữ liệu'
        },
        reveal_strip: true,
        reveal_complete: '💡 BẠN VỪA LẬP hóa đơn I/O đầu đời: A = 4 + 1.000×0,1 = <strong>104ms</strong> · B = 300×4,1 = <strong>1.230ms</strong>. Khối "30ms" là bịa — cú nhảy nào cũng dính 4ms tiền seek, đó chính là tử huyệt của index trên dữ liệu rải rác. Bấm <strong>Chạy Query</strong> xem dòng chảy.',
        reveal_hints: {
          'bill-a1': 'Hóa đơn Plan A mở sổ. Khoản đầu tiên của MỌI seq scan: tìm đến block số 1 — chỉ một cú seek duy nhất cho cả chuyến đi.',
          'bill-a2': 'Khoản 1 vào sổ: 4ms. Giờ tới khoản CHÍNH của Plan A: cả nghìn block trôi qua băng chuyền, mỗi block 0,1ms.',
          'bill-b': 'Hóa đơn A chốt: 4 + 100 = 104ms. Sang Plan B: 300 đơn RẢI RÁC — nghĩ kỹ xem mỗi đơn phải trả những khoản gì.',
          'bill-v': 'Hóa đơn B chốt: 1.230ms — gấp 12 lần A dù đọc ít gấp 3. Còn khoản cuối: chốt sổ tuyên bố plan thắng cuộc.'
        }
      },
      step_4: {
        prompt: '<strong>Ticket #43 — tự tay cộng hóa đơn:</strong> đội vận hành đưa bảng giá và 2 plan — điền 3 ô: cost A, cost B, plan thắng. (Số viết liền không dấu chấm, ví dụ <code>1230</code>.)',
        challenge_type: 'fill_blank',
        template: "-- BANG GIA I/O (HDD minh hoa, sach Ch 15.2):\n--   1 cu seek (nhay random) = 4 ms\n--   1 block lien mach       = 0,1 ms\n\n-- PLAN A · Seq Scan: 1 cu seek mo man + 1.000 block lien mach\ncost_A = 4 + 1.000 x 0,1  =  ____ ms\n\n-- PLAN B · Index Scan: 300 don rai rac, moi don = 1 cu nhay (seek + 1 block)\ncost_B = 300 x (4 + 0,1)  =  ____ ms\n\n-- OPTIMIZER chon plan re hon:\nplan_thang = ____",
        blanks: [
          { id: 'b1', hint: '? ms', expected: '104' },
          { id: 'b2', hint: '? ms', expected: '1230' },
          { id: 'b3', hint: 'A / B', expected: 'A' }
        ],
        schema: {
          table_name: 'orders',
          columns: [
            { name: 'order_id', type: 'INT', key: 'PK' },
            { name: 'buyer_id', type: 'INT', key: 'FK' },
            { name: 'seller_id', type: 'INT', key: '🔑 idx_seller' },
            { name: 'total', type: 'INT (gem)', key: '' },
            { name: 'status', type: 'VARCHAR', key: '' }
          ],
          data: [
            ['9001', '88', '4102', '80', 'delivered'],
            ['9003', '34', '4102', '99', 'delivered'],
            ['9005', '56', '4102', '45', 'flagged']
          ]
        },
        context: {
          scenario: 'Đây đúng nghĩa là phép tính optimizer làm hàng triệu lần mỗi ngày: cộng hóa đơn ước tính của từng plan rồi chọn bản rẻ. Khác mỗi chỗ — nó lấy số block/số cú nhảy từ THỐNG KÊ, không ai đưa sẵn như đề bài này.',
          real_world: 'Postgres lưu thống kê trong pg_statistic (lệnh ANALYZE cập nhật); con số cost trong EXPLAIN chính là hóa đơn kiểu này — chỉ quy về đơn vị nội bộ thay vì mili-giây.',
          steps: [
            'Khoản A: 1 cú seek (4ms) + 1.000 block × 0,1ms.',
            'Khoản B: mỗi đơn rải rác = 1 cú nhảy = seek + 1 block = 4,1ms.',
            'Nhân 4,1 với 300 cú.',
            'So hai con số — nhỏ hơn thắng.'
          ],
          hint_explore: 'Bí thì mở lại bản đồ Step 3 — hóa đơn bạn vừa lập vẫn còn nguyên đó.',
          expected: 'cost_A = 104 · cost_B = 1230 · plan thắng = A.'
        },
        hints: [
          { level: 1, text: 'Không có mẹo — thay số vào đúng công thức ghi trên từng dòng comment.' },
          { level: 2, text: '1.000 × 0,1 = 100, cộng thêm cú seek mở màn 4ms.' },
          { level: 3, text: '300 × 4,1 — nhân là ra; nhớ viết liền: <code>1230</code>, không dấu chấm.' },
          { level: 4, text: 'cost_A = <code>104</code> · cost_B = <code>1230</code> · plan thắng = <code>A</code>.' }
        ],
        success_message: 'TICKET #43 ĐÓNG! 💸 Bạn vừa tính đúng thứ optimizer tính — và thấy tận mắt: đọc ÍT không đồng nghĩa RẺ. Nhưng khoan… nếu 300 đơn rải rác đã làm index thua, vậy khi nào index THẮNG? 20 đơn? 5 đơn? Bài sau: Full Scan vs Index Scan — đi tìm lằn ranh sinh tử của index, và gặp ca bệnh nổi tiếng "cùng một query, lúc bay lúc bò".',
        xp_reward: 120
      },
      concept_cards_after: ['nc_card_cpu_vs_io']
    },

    /* ── nc_03 — Ticket #44 · Full Scan vs Index Scan ──
     * PART_6 Bài 3 (Ch 15.3 Selection): access path; A1 linear / A2 clustering-key /
     * A4 secondary nhiều record = n cú nhảy — sách: "worse than linear search";
     * A6: secondary chỉ đáng khi lấy RẤT ÍT. Điểm hòa vốn kho này: 104/4,1 ≈ 25 đơn.
     * Step-4 full_ide conjunctive (1 index + filter phần còn lại) — probe AND OK. */
    {
      id: 'nc_03', index: 3,
      title: 'Full Scan vs Index Scan — index không phải lúc nào cũng nhanh',
      subtitle: 'Cùng một query lúc bay lúc bò: access path đổi theo số dòng match',
      module: 7, module_title: 'Engine Room — Query Processing',
      estimated_minutes: 18, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'orders (100.000 đơn ≈ 1.000 block — mẫu 6)',
          columns: ['order_id', 'buyer_id', 'seller_id', 'total', 'status'],
          dataRows: [
            ['9001', '88', '12', '80', 'delivered'],
            ['9002', '88', '9', '12500', 'shipped'],
            ['9003', '21', '12', '99', 'delivered'],
            ['9004', '88', '15', '790', 'delivered'],
            ['9005', '707', '12', '45', 'delivered'],
            ['9006', '707', '9', '320', 'delivered']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #44',
        hook: 'Marketplace lên tính năng <em>"Lịch sử mua"</em> — bấm avatar là ra mọi đơn của khách. Demo mượt, khách thường mở trong nháy mắt. Rồi thứ Sáu, khách VIP nghiện săn đồ — <strong>5.000 đơn</strong> — bấm vào và… treo. CÙNG MỘT QUERY, lúc bay lúc bò. Không phải bug, không phải mạng: là <strong>access path</strong> — con đường engine chọn để vào kho dữ liệu. Ticket #44: học đủ các lối vào, hiểu vì sao index không phải lúc nào cũng nhanh — và vì sao optimizer thà quét cả kho.'
      },
      step_1: {
        primer: {
          goal: [
            'Access path = lối vào dữ liệu: Seq Scan (quét tuần tự) · index theo khóa — nhảy 1 phát · secondary index — nhảy theo TỪNG dòng match',
            'Secondary index phản chủ khi match NHIỀU: n dòng rải rác = n cú nhảy × 4,1ms — sách gọi thẳng: "có thể tệ hơn cả linear search"',
            'Optimizer chọn lối vào theo THỐNG KÊ số dòng match — nên cùng 1 query có thể đổi plan theo dữ liệu'
          ],
          intro: '"Lịch sử mua" của khách thường: 20 đơn — index dẫn 20 cú nhảy, <strong>82ms</strong>, ngon lành. Của VIP: 5.000 đơn rải khắp 1.000 block — 5.000 cú nhảy × 4,1ms = <strong>20.500ms</strong>, trong khi quét TUẦN TỰ cả kho chỉ 104ms. Cùng query, cùng index — chỉ khác SỐ DÒNG MATCH, và plan rẻ nhất lật ngược hoàn toàn. Optimizer nhìn thống kê ("buyer này tầm bao nhiêu đơn?") để chọn lối vào — đó là lý do nó thản nhiên quét cả kho khi bạn đụng khách VIP.',
          example: 'Lằn ranh nằm ở điểm hòa vốn: n cú nhảy × 4,1ms so với 104ms quét cả kho → n ≈ 25 đơn. Lấy ít hơn: index thắng. Lấy nhiều hơn: seq scan thắng. Index không "nhanh" hay "chậm" — nó nhanh KHI LẤY ÍT.'
        },
        concept_cards: [
          {
            icon: 'fa-door-open',
            title: 'Ba lối vào kho dữ liệu',
            body: '<strong>Linear search (A1)</strong>: quét mọi block — chậm mà chắc, chấp mọi điều kiện, không cần gì sẵn. <strong>Index theo khóa (A2)</strong>: lần cây tới đúng block chứa MỘT dòng cần tìm — một cú seek, xong việc. <strong>Secondary index nhiều match (A4)</strong>: tra mục lục ra danh sách RID, rồi nhảy random theo TỪNG dòng — mỗi dòng một vé seek.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 15.3 — Selection: A1/A2/A4, "worst-case cost could become even worse than linear search"'
          },
          {
            icon: 'fa-scale-unbalanced',
            title: 'Điểm hòa vốn của index',
            body: 'Kho 1.000 block: seq scan cố định <strong>104ms</strong> bất kể lấy mấy dòng; index tốn <strong>n × 4,1ms</strong> theo số dòng lấy ra. Hòa vốn: n ≈ 25. Sách chốt luật (A6): secondary index <em>"chỉ nên dùng khi chọn RẤT ÍT record"</em>. Con số hòa vốn đổi theo kích thước bảng — nguyên tắc thì không.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Soi 3 query của chính Marketplace: tra 1 đơn theo <code>order_id</code> (khóa chính) — index, nhảy 1 phát. Lịch sử khách thường ~20 đơn — index, thắng sít sao. "Tổng doanh thu cả kho" — đằng nào cũng đụng MỌI block, seq scan chính đáng (bạn đã gặp luật này ở Ticket #36 của Community!).'
          }
        ],
        plan_visual: {
          query: "SELECT * FROM orders WHERE buyer_id = 707;  -- VIP \"wh4le\" · ~5.000 đơn",
          caption: 'Đổi buyer_id thành khách thường 20 đơn — cán cân lật ngược: index 82ms thắng seq scan 104ms. Cost sống theo DỮ LIỆU, không theo query.',
          price: {
            seek_ms: 4, block_ms: 0.1,
            note: 'Bảng giá Ticket #43: seek 4ms · block 0,1ms (HDD minh họa theo sách).'
          },
          trees: [
            {
              name: 'Plan A — Seq Scan cả kho',
              chosen: true,
              note: '✓ Optimizer chọn khi match NHIỀU — 104ms cố định',
              io: { access: 'seq', seeks: 1, blocks: 1000 },
              nodes: [
                { op: 'orders', kind: 'table', detail: '100.000 đơn ≈ 1.000 block', rows: '1.000 block' },
                { op: 'Seq Scan', kind: 'scan', detail: 'quét liền mạch, lọc trong lúc quét', rows: '100.000 dòng', cost: '1 seek + 1.000 block' },
                { op: 'σ buyer_id = 707', kind: 'filter', detail: 'giữ đơn của VIP', rows: '5.000 dòng' }
              ]
            },
            {
              name: 'Plan B — Index idx_buyer',
              chosen: false,
              note: '5.000 cú nhảy — index phản chủ khi match nhiều',
              io: { access: 'random', seeks: 5000, blocks: 5000 },
              nodes: [
                { op: 'orders', kind: 'table', detail: '5.000 đơn rải khắp 1.000 block', rows: '5.000 block đọc lẻ' },
                { op: 'Index Scan idx_buyer', kind: 'scan', detail: 'mỗi đơn một cú nhảy random', rows: '5.000 dòng', cost: '5.000 × 4,1 ms' }
              ]
            }
          ]
        },
        visual: {
          schema: {
            table_name: 'orders — sổ đơn hàng (100.000 đơn ≈ 1.000 block)',
            columns: [
              { name: 'order_id', type: 'INT', key: 'PK' },
              { name: 'buyer_id', type: 'INT', key: '🔑 idx_buyer' },
              { name: 'seller_id', type: 'INT', key: 'FK' },
              { name: 'total', type: 'INT (gem)', key: '' },
              { name: 'status', type: 'VARCHAR', key: '' }
            ]
          },
          data_preview: [
            ['9001', '88 (khách thường)', '12', '80', 'delivered'],
            ['9004', '88 (khách thường)', '15', '790', 'delivered'],
            ['9005', '707 ← VIP wh4le', '12', '45', 'delivered'],
            ['9006', '707 ← VIP wh4le', '9', '320', 'delivered']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Cùng query "lịch sử mua", cùng index — vì sao khách thường mở trong nháy mắt còn VIP 5.000 đơn thì treo?',
            options: [
              { id: 'a', text: 'Số dòng match quyết định số cú nhảy random: 20 cú (82ms) so với 5.000 cú (20.500ms) — index trả tiền seek THEO TỪNG DÒNG lấy ra', correct: true, explanation: 'Đúng — index không có tốc độ cố định; hóa đơn của nó tỉ lệ thuận với số dòng match. Query không đổi, DỮ LIỆU đổi là plan rẻ nhất đổi.' },
              { id: 'b', text: 'Trang VIP bị nhiều người xem cùng lúc nên nghẽn', correct: false, explanation: 'Sai — một mình VIP mở lúc 3 giờ sáng vẫn treo y hệt; vấn đề nằm ở access path, không ở tải.' },
              { id: 'c', text: 'Đơn của VIP nằm ở vùng đĩa cũ, đọc chậm hơn', correct: false, explanation: 'Sai — block nào cũng cùng giá vé; đắt là ở SỐ CÚ NHẢY, không phải vị trí sang hèn của block.' },
              { id: 'd', text: 'buyer_id của VIP là số to nên so sánh lâu hơn', correct: false, explanation: 'Sai — so sánh số là tiền CPU, rẻ như bèo so với 5.000 cú seek cơ học.' }
            ]
          },
          {
            question: 'Optimizer thấy index sờ sờ mà vẫn chọn Seq Scan cho VIP. Nó "lười" hay nó đúng?',
            options: [
              { id: 'a', text: 'Đúng — nó ước lượng bằng thống kê: 5.000 match × 4,1ms/cú vượt xa 104ms quét cả kho; index chỉ đáng khi lấy RẤT ÍT', correct: true, explanation: 'Đúng — sách A6 nói thẳng: secondary index "chỉ nên dùng khi chọn rất ít record". Optimizer làm đúng phép tính Ticket #43.' },
              { id: 'b', text: 'Lười — về lý thuyết index luôn nhanh hơn quét tuần tự', correct: false, explanation: 'Sai — chính "lý thuyết" trong sách (Ch 15.3) viết rằng index nhiều match có thể TỆ HƠN cả linear search.' },
              { id: 'c', text: 'Nó chọn liều vì không chạy thử được', correct: false, explanation: 'Sai — không chạy thử nhưng cũng không liều: ước lượng từ thống kê là phương pháp, không phải xổ số.' },
              { id: 'd', text: 'Seq scan được chọn vì an toàn hơn, chứ không rẻ hơn', correct: false, explanation: 'Sai — nó rẻ hơn thật: 104ms so với 20.500ms, chênh 200 lần chứ không phải chuyện "an toàn".' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Lối nào cho query này?',
          instruction: 'Nhớ điểm hòa vốn ~25 đơn của kho 1.000 block — xếp từng query vào đúng lối.',
          xp: 20,
          chips: [
            { id: 'q1', label: 'Tra MỘT đơn: WHERE order_id = 9001 (khóa chính)' },
            { id: 'q2', label: 'Lịch sử khách thường — ~20 đơn' },
            { id: 'q3', label: 'Lịch sử VIP wh4le — ~5.000 đơn rải rác' },
            { id: 'q4', label: 'Tổng doanh thu TOÀN KHO (đụng mọi đơn)' }
          ],
          bins: [
            { id: 'idx', label: 'Index dẫn lối 📖' },
            { id: 'seq', label: 'Seq Scan rẻ hơn 🚚' }
          ],
          solution: { q1: 'idx', q2: 'idx', q3: 'seq', q4: 'seq' }
        }
      },
      step_3: {
        mission: 'Bốn cánh cửa vào kho — chọn đúng lối cho từng tình huống. Có MỘT lối bịa.',
        blocks: [
          { type: 'op', token: 'Index 20 cú nhảy ≈ 82ms — vẫn rẻ hơn quét cả kho 104ms: index THẮNG sít sao', slot: 'ap-few' },
          { type: 'op', token: 'Kho đã có index thì mọi query cứ đi index — đọc ít dữ liệu hơn chắc chắn rẻ hơn', slot: 'ap-x' },
          { type: 'op', token: 'Lần cây index khóa chính → nhảy đúng 1 block — trả 1 cú seek, xong việc', slot: 'ap-pk' },
          { type: 'op', token: 'Secondary index chỉ đáng dùng khi lấy RẤT ÍT dòng — nghi ngờ thì cộng hóa đơn I/O rồi so', slot: 'ap-rule' },
          { type: 'op', token: '5.000 cú nhảy ≈ 20.500ms, thua xa quét cả kho 104ms — Seq Scan thắng áp đảo: index phản chủ', slot: 'ap-many' }
        ],
        drop_zones: [
          { id: 'ap-pk', placeholder: 'Cửa 1 — tra MỘT đơn theo khóa chính?', accepts: ['op'], multi: false,
            station: { icon: '🎯', label: 'Tra theo PK', sub: '1 đơn', hint: 'Khóa chính có cây index xếp sẵn — lần cây là ra đúng block chứa đơn.' } },
          { id: 'ap-few', placeholder: 'Cửa 2 — khách thường, ~20 đơn?', accepts: ['op'], multi: false,
            station: { icon: '📖', label: 'Khách 20 đơn', sub: 'Match ít', hint: '20 cú nhảy × 4,1ms — so với 104ms quét cả kho thì bên nào rẻ?' } },
          { id: 'ap-many', placeholder: 'Cửa 3 — VIP, ~5.000 đơn rải rác?', accepts: ['op'], multi: false,
            station: { icon: '🐋', label: 'VIP 5.000 đơn', sub: 'Match nhiều', hint: 'Nhân 5.000 cú nhảy với giá vé Ticket #43 xem index còn thắng không.' } },
          { id: 'ap-rule', placeholder: 'Cửa 4 — rút thành LUẬT bỏ túi?', accepts: ['op'], multi: false,
            station: { icon: '⚖️', label: 'Luật chọn lối', sub: 'Access path', hint: 'Sách A6 chốt một câu về secondary index — khi nào mới đáng dùng?' } }
        ],
        expected_sql: 'Lần cây index khóa chính → nhảy đúng 1 block — trả 1 cú seek, xong việc Index 20 cú nhảy ≈ 82ms — vẫn rẻ hơn quét cả kho 104ms: index THẮNG sít sao 5.000 cú nhảy ≈ 20.500ms, thua xa quét cả kho 104ms — Seq Scan thắng áp đảo: index phản chủ Secondary index chỉ đáng dùng khi lấy RẤT ÍT dòng — nghi ngờ thì cộng hóa đơn I/O rồi so',
        expected_zones: {
          'ap-pk': 'Lần cây index khóa chính → nhảy đúng 1 block — trả 1 cú seek, xong việc',
          'ap-few': 'Index 20 cú nhảy ≈ 82ms — vẫn rẻ hơn quét cả kho 104ms: index THẮNG sít sao',
          'ap-many': '5.000 cú nhảy ≈ 20.500ms, thua xa quét cả kho 104ms — Seq Scan thắng áp đảo: index phản chủ',
          'ap-rule': 'Secondary index chỉ đáng dùng khi lấy RẤT ÍT dòng — nghi ngờ thì cộng hóa đơn I/O rồi so'
        },
        reveal_strip: true,
        reveal_complete: '💡 BẠN VỪA VẼ xong bản đồ access path: PK → nhảy 1 phát · match ít → index · match nhiều → seq scan · luật A6: secondary chỉ đáng khi lấy RẤT ÍT. Khối "cứ có index là dùng" là bịa — chính hóa đơn Ticket #43 đã bác nó. Bấm <strong>Chạy Query</strong>.',
        reveal_hints: {
          'ap-pk': 'Cửa 1 mở màn: cần đúng MỘT đơn, và khóa chính có cây index xếp sẵn — lối vào nào trả đúng một cú seek?',
          'ap-few': 'Cửa 1 chốt: lần cây → nhảy 1 phát. Cửa 2: khách 20 đơn — lấy bảng giá Ticket #43 ra nhẩm trước khi chọn.',
          'ap-many': 'Cửa 2 chốt: 82ms < 104ms — index thắng SÍT SAO. Cửa 3: nhân số cú nhảy lên 5.000 xem còn thắng nổi không.',
          'ap-rule': 'Cửa 3 chốt: 20.500ms — index thua thảm, đúng câu sách: "có thể tệ hơn cả linear search". Cửa cuối: rút tất cả thành một luật bỏ túi.'
        }
      },
      step_4: {
        prompt: 'Đóng Ticket #44: viết query "Lịch sử mua" bản chuẩn cho khách <strong>#88</strong> (khách thường — lối index chính đáng): lấy <code>order_id, total</code> từ <code>orders</code> với <code>buyer_id = 88</code> VÀ chỉ đơn đã giao <code>status = \'delivered\'</code>.',
        schema: {
          table_name: 'orders',
          columns: [
            { name: 'order_id', type: 'INT', key: 'PK' },
            { name: 'buyer_id', type: 'INT', key: '🔑 idx_buyer' },
            { name: 'seller_id', type: 'INT', key: 'FK' },
            { name: 'item_name', type: 'VARCHAR', key: '' },
            { name: 'total', type: 'INT (gem)', key: '' },
            { name: 'status', type: 'VARCHAR', key: '' }
          ],
          data: [
            ['9001', '88', '12', 'Khiên gỗ sồi', '80', 'delivered'],
            ['9002', '88', '9', 'Giáp rồng Huyền thoại', '12500', 'shipped'],
            ['9003', '21', '12', 'Bùa may mắn', '99', 'delivered'],
            ['9004', '88', '15', 'Skin súng Neon', '790', 'delivered'],
            ['9005', '88', '12', 'Kiếm gỗ Newbie', '45', 'cancelled'],
            ['9006', '34', '9', 'Giáp da sói', '320', 'delivered']
          ]
        },
        context: {
          scenario: 'Plan mô phỏng cho query này: <code>Index Scan using idx_buyer (≈20 cú nhảy) → Filter: status = \'delivered\'</code> — combo kinh điển của sách 15.3: MỘT index lo điều kiện gắt nhất (buyer_id), điều kiện còn lại lọc tay trên đống dòng đã ít.',
          real_world: 'Chiến thuật "1 index + filter phần còn lại" là cách Postgres xử đa số WHERE nhiều điều kiện — không cần index cho MỌI cột, chỉ cần cho cột gắt nhất. Đó cũng là lý do đừng rải index bừa (món nợ ghi — Ticket #36).',
          steps: [
            'Lấy đúng 2 cột: <code>order_id, total</code>.',
            'Hai điều kiện nối bằng <code>AND</code>: buyer_id = 88 và status = \'delivered\'.',
            "So sánh chuỗi nằm trong nháy đơn: <code>'delivered'</code>.",
            'Khách #88 ~20 đơn — dưới điểm hòa vốn 25, index scan chính đáng.'
          ],
          hint_explore: 'Chạy thử <code>SELECT * FROM orders WHERE buyer_id = 88</code> trước — thấy cả đơn shipped/cancelled cần loại đi.',
          expected: 'Bảng 2 đơn đã giao của khách #88: 9001 (80 gem) và 9004 (790 gem).'
        },
        hints: [
          { level: 1, text: 'Hai điều kiện, một chữ AND: <code>WHERE buyer_id = 88 AND status = …</code>' },
          { level: 2, text: "Chuỗi so sánh trong nháy đơn: <code>'delivered'</code> (viết thường)." },
          { level: 3, text: 'Khung câu: <code>SELECT order_id, total FROM orders WHERE … AND … ;</code>' },
          { level: 4, text: '<code class="code">SELECT order_id, total FROM orders WHERE buyer_id = 88 AND status = \'delivered\';</code>' }
        ],
        expected_sql: "SELECT order_id, total FROM orders WHERE buyer_id = 88 AND status = 'delivered';",
        success_message: 'TICKET #44 ĐÓNG — "Lịch sử mua" chạy đúng lối! 📖 Engine Room đi được 3/10: pipeline → bảng giá → access path. Nhưng phía trước là một khách hàng khó chiều hơn mọi VIP: <strong>ORDER BY</strong>. Sắp xếp 100.000 đơn khi RAM không chứa nổi cả bảng? Bài sau: External Sort-Merge — nghệ thuật sắp xếp thứ TO HƠN bộ nhớ.',
        xp_reward: 120
      },
      concept_cards_after: ['nc_card_bitmap_scan']
    },

    /* ── nc_04 — Ticket #45 · External Sort-Merge ──
     * PART_6 Bài 4 (Ch 15.4): run generation + N-way merge + multi-pass.
     * step_1.sort_visual = sim bấm-từng-bước (user chốt 2026-07-05) — đúng
     * Fig 15.4 sách: 12 block, M=3 → 4 run → 2 pass merge (M−1 = 2 đường vào). */
    {
      id: 'nc_04', index: 4,
      title: 'External Sort-Merge — sắp xếp thứ TO HƠN bộ nhớ',
      subtitle: 'Chia mẻ vừa RAM thành run đã sort, rồi merge: chỉ cần nhìn ĐẦU mỗi run',
      module: 7, module_title: 'Engine Room — Query Processing',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'fill_blank',
      drag_map: {
        table: {
          name: 'orders (100.000 đơn ≈ 1.000 block — mẫu 5)',
          columns: ['order_id', 'buyer_id', 'seller_id', 'total', 'status'],
          dataRows: [
            ['9001', '88', '12', '80', 'delivered'],
            ['9002', '21', '9', '12500', 'shipped'],
            ['9003', '34', '12', '99', 'delivered'],
            ['9004', '88', '15', '790', 'delivered'],
            ['9005', '707', '12', '45', 'delivered']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #45',
        hook: 'Kế toán sàn cần <em>"báo cáo 100.000 đơn xếp theo giá trị, lớn trước"</em> — một câu <code>ORDER BY total DESC</code> tưởng hiền lành. Nhưng sort là trò đổi chỗ: muốn đổi chỗ phải CẦM ĐƯỢC dữ liệu trong tay, mà RAM buffer chỉ chứa <strong>100 block</strong> — kho thì 1.000. Không nhét vừa thì sort kiểu gì? Ticket #45: học ngón nghề cổ điển từ thời băng từ mà mọi database hiện đại vẫn xài — <strong>external sort-merge</strong>: chia mẻ, sort từng mẻ thành RUN, rồi merge các run mà chỉ cần nhìn đầu mỗi chồng.'
      },
      step_1: {
        primer: {
          goal: [
            'ORDER BY trên bảng to hơn RAM = external sort: chia MẺ vừa RAM, sort từng mẻ, ghi ra thành RUN (mảnh đã có trật tự)',
            'Merge N-way: mỗi run chỉ cần 1 block đại diện trong RAM — so các ĐẦU run, nhặt bé nhất đẩy ra output',
            'Run nhiều hơn chỗ RAM (N ≥ M) → merge NHIỀU PASS; mỗi pass đọc & ghi cả bảng đúng một lượt'
          ],
          intro: 'Xếp 12.000 tờ hồ sơ với cái bàn chỉ để vừa 100 tờ: bạn chia chồng 100 tờ, xếp gọn TỪNG CHỒNG (mỗi chồng = một <strong>run</strong>), rồi gộp các chồng đã xếp — mẹo là chỉ cần nhìn <strong>tờ trên cùng</strong> của mỗi chồng, nhặt tờ bé nhất bỏ sang chồng kết quả. Database y hệt: RAM buffer = mặt bàn, bảng trên đĩa = tủ hồ sơ, và <code>ORDER BY</code> của bạn = lệnh dọn tủ.',
          example: 'orders 1.000 block, RAM M = 100: pass 1 tạo ⌈1.000/100⌉ = <strong>10 run</strong>, mỗi run 100 block đã sort. Merge: RAM đủ 99 đường vào + 1 ra → 10 run gộp MỘT lượt là xong. Tổng thiệt hại: đọc-ghi cả kho ~2 lượt — thay vì "không thể sort nổi".'
        },
        concept_cards: [
          {
            icon: 'fa-layer-group',
            title: 'Hai giai đoạn của external sort-merge',
            body: '<strong>Giai đoạn 1 — tạo run:</strong> lặp: đọc M block → sort trong RAM → ghi ra file run Rᵢ, đến hết bảng. <strong>Giai đoạn 2 — merge:</strong> mở 1 block đầu của mỗi run + 1 block output; chọn tuple NHỎ NHẤT giữa các đầu run đẩy ra output, block nào cạn thì nạp block kế của run đó. Đây là N-way merge — bản tổng quát của merge 2 đường.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 15.4.1 — External Sort-Merge Algorithm'
          },
          {
            icon: 'fa-water',
            title: 'Vì sao run cứu được RAM bé',
            body: 'RAM M block chỉ sort nổi M block một lúc — nhưng một RUN là mảnh <strong>ĐÃ có trật tự</strong>: muốn biết phần tử nhỏ nhất của cả run, chỉ cần nhìn phần tử ĐẦU. Nhờ thế merge 10 run chỉ tốn 10 block đại diện + 1 block output — RAM bé vẫn điều khiển được kho lớn gấp trăm lần.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Không chỉ ORDER BY: <code>DISTINCT</code> (xếp cạnh nhau mới thấy trùng), merge join (bài 6) đều đứng trên vai external sort. Và để ý: sort là toán tử <strong>BLOCKING</strong> — chưa nhìn hết input thì chưa dám nhả dòng nào (dòng bé nhất có thể nằm cuối bảng!). Điều này sẽ quay lại ở bài Materialization vs Pipelining.'
          }
        ],
        sort_visual: {
          eyebrow: 'EXTERNAL SORT-MERGE — MÔ HÌNH THU NHỎ: KHO 12 BLOCK · RAM M = 3',
          caption: 'Đúng ví dụ Fig 15.4 trong sách: 12 block · M=3 → 4 run → merge 2 PASS (RAM 3 block chỉ đủ 2 đường vào + 1 ra). Sort theo giá gem tăng dần.',
          buffer_m: 3,
          items: [
            { label: 'Bùa', v: 99 }, { label: 'Kiếm', v: 45 }, { label: 'Giáp', v: 320 },
            { label: 'Khiên', v: 80 }, { label: 'Skin', v: 790 }, { label: 'Cung', v: 150 },
            { label: 'Trượng', v: 12 }, { label: 'Nhẫn', v: 510 }, { label: 'Mũ', v: 35 },
            { label: 'Găng', v: 60 }, { label: 'Ủng', v: 240 }, { label: 'Đai', v: 130 }
          ]
        },
        visual: {
          schema: {
            table_name: 'orders — cần ORDER BY total DESC (100.000 đơn ≈ 1.000 block)',
            columns: [
              { name: 'order_id', type: 'INT', key: 'PK' },
              { name: 'buyer_id', type: 'INT', key: 'FK' },
              { name: 'seller_id', type: 'INT', key: 'FK' },
              { name: 'total', type: 'INT (gem)', key: '⇅ khóa sort' },
              { name: 'status', type: 'VARCHAR', key: '' }
            ]
          },
          data_preview: [
            ['9002', '21', '9', '12500 ← lớn nhất', 'shipped'],
            ['9004', '88', '15', '790', 'delivered'],
            ['9003', '34', '12', '99', 'delivered'],
            ['9001', '88', '12', '80', 'delivered'],
            ['9005', '707', '12', '45 ← bé nhất', 'delivered']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Vì sao engine không nạp cả 1.000 block của orders vào RAM rồi sort một phát cho xong?',
            options: [
              { id: 'a', text: 'RAM buffer chỉ có M = 100 block — dữ liệu nằm ngoài RAM thì không so sánh/đổi chỗ được, đành sort từng mẻ M block thành run rồi merge', correct: true, explanation: 'Đúng — sort đòi cầm dữ liệu trong tay. Bảng to hơn RAM là chuyện thường (sách gọi thẳng: external sorting), và run + merge là lời giải kinh điển.' },
              { id: 'b', text: 'Nạp cả bảng vào RAM là vi phạm chuẩn SQL', correct: false, explanation: 'Sai — chẳng chuẩn nào cấm; vấn đề là VẬT LÝ: RAM không đủ chỗ.' },
              { id: 'c', text: 'Sort trong RAM chậm hơn sort trên đĩa', correct: false, explanation: 'Sai — ngược đời: RAM nhanh hơn đĩa hàng nghìn lần; vì thế mới cố sort TRONG RAM từng mẻ.' },
              { id: 'd', text: 'Vì bảng có 100.000 dòng, vượt giới hạn của thuật toán sort', correct: false, explanation: 'Sai — thuật toán sort không có "giới hạn dòng"; giới hạn nằm ở chỗ CHỨA dữ liệu khi sort.' }
            ]
          },
          {
            question: 'Đến giai đoạn merge 10 run, RAM cần TỐI THIỂU bao nhiêu block?',
            options: [
              { id: 'a', text: '11 — mỗi run 1 block đại diện (cạn tới đâu nạp tiếp tới đó) + 1 block cho output', correct: true, explanation: 'Đúng — bí quyết của merge: run ĐÃ sort nên chỉ cần nhìn đầu run. 10 đường vào + 1 ra = 11 block, dù mỗi run dài cả trăm block.' },
              { id: 'b', text: '1.000 — phải chứa trọn cả bảng thì mới gộp được', correct: false, explanation: 'Sai — nếu cần chứa cả bảng thì external sort vô nghĩa; merge chỉ cần ĐẦU mỗi run.' },
              { id: 'c', text: '10 × 100 = 1.000 block — mỗi run phải nằm trọn trong RAM', correct: false, explanation: 'Sai — mỗi run chỉ cần 1 block ĐẠI DIỆN trong RAM; phần còn lại nằm yên trên đĩa chờ nạp dần.' },
              { id: 'd', text: '2 — một vào một ra là đủ cho mọi cuộc merge', correct: false, explanation: 'Sai — 1 đường vào thì lấy gì mà SO? Mỗi run đang merge cần chỗ riêng cho block đầu của nó.' }
            ]
          }
        ],
        mini_game: {
          type: 'order',
          title: 'Xếp đúng dây chuyền external sort-merge',
          instruction: 'Kéo 5 bước vào đúng thứ tự chạy.',
          xp: 20,
          items: [
            { id: 'r3', label: 'Ghi mẻ đã sort ra đĩa thành RUN' },
            { id: 'r1', label: 'Nạp M block đầu tiên của bảng vào RAM' },
            { id: 'r5', label: 'Merge N-way: so các ĐẦU run, nhặt bé nhất ra output' },
            { id: 'r2', label: 'Sort mẻ đang nằm trong RAM' },
            { id: 'r4', label: 'Lặp nạp-sort-ghi đến hết bảng — được N run' }
          ],
          solution: { r1: 1, r2: 2, r3: 3, r4: 4, r5: 5 }
        }
      },
      step_3: {
        mission: 'Lắp 4 trạm của dây chuyền sort-ngoài-RAM — có MỘT khối bịa.',
        blocks: [
          { type: 'op', token: 'Mở 1 block ĐẦU của mỗi run + 1 block output — so các đầu run, nhặt bé nhất đẩy ra', slot: 'es-merge' },
          { type: 'op', token: 'Nạp đúng M block vào RAM — vừa khít sức chứa — sort tại chỗ', slot: 'es-load' },
          { type: 'op', token: 'Sort xong từng mẻ rồi NỐI ĐUÔI các mẻ lại — thế là cả bảng đã có trật tự, khỏi merge', slot: 'es-x' },
          { type: 'op', token: 'RAM chỉ đủ M−1 đường vào: gộp M−1 run mỗi lượt, lặp nhiều PASS đến khi còn một', slot: 'es-pass' },
          { type: 'op', token: 'Ghi mẻ đã sort ra đĩa: một RUN — mảnh dữ liệu CÓ TRẬT TỰ dài đúng M block', slot: 'es-run' }
        ],
        drop_zones: [
          { id: 'es-load', placeholder: 'Trạm 1 — kho to, RAM bé: bắt đầu sao?', accepts: ['op'], multi: false,
            station: { icon: '📥', label: 'Nạp từng mẻ', sub: 'Trạm 1', hint: 'Sort đòi cầm dữ liệu trong tay — mà tay chỉ rộng M block.' } },
          { id: 'es-run', placeholder: 'Trạm 2 — mẻ đã sort trong RAM, rồi sao?', accepts: ['op'], multi: false,
            station: { icon: '🗂️', label: 'Ghi thành run', sub: 'Trạm 2', hint: 'RAM phải trống cho mẻ sau — mẻ đã sort được gửi ra đĩa dưới dạng gì?' } },
          { id: 'es-merge', placeholder: 'Trạm 3 — có N run rồi, gộp kiểu gì?', accepts: ['op'], multi: false,
            station: { icon: '🔀', label: 'Merge N-way', sub: 'Trạm 3', hint: 'Run đã sort → phần tử bé nhất của run luôn nằm ở ĐẦU.' } },
          { id: 'es-pass', placeholder: 'Trạm 4 — run nhiều hơn chỗ RAM thì sao?', accepts: ['op'], multi: false,
            station: { icon: '♻️', label: 'Thêm pass', sub: 'Trạm 4', hint: 'Mỗi lượt merge chỉ mở được M−1 đường vào — sim ở Step 1 bạn vừa thấy cảnh này.' } }
        ],
        expected_sql: 'Nạp đúng M block vào RAM — vừa khít sức chứa — sort tại chỗ Ghi mẻ đã sort ra đĩa: một RUN — mảnh dữ liệu CÓ TRẬT TỰ dài đúng M block Mở 1 block ĐẦU của mỗi run + 1 block output — so các đầu run, nhặt bé nhất đẩy ra RAM chỉ đủ M−1 đường vào: gộp M−1 run mỗi lượt, lặp nhiều PASS đến khi còn một',
        expected_zones: {
          'es-load': 'Nạp đúng M block vào RAM — vừa khít sức chứa — sort tại chỗ',
          'es-run': 'Ghi mẻ đã sort ra đĩa: một RUN — mảnh dữ liệu CÓ TRẬT TỰ dài đúng M block',
          'es-merge': 'Mở 1 block ĐẦU của mỗi run + 1 block output — so các đầu run, nhặt bé nhất đẩy ra',
          'es-pass': 'RAM chỉ đủ M−1 đường vào: gộp M−1 run mỗi lượt, lặp nhiều PASS đến khi còn một'
        },
        reveal_strip: true,
        reveal_complete: '💡 BẠN VỪA CHẠY trọn external sort-merge: nạp mẻ → run → merge N-way → thiếu chỗ thì thêm pass. Khối "nối đuôi các mẻ" là bịa: 4 run đã sort NỐI lại vẫn lộn xộn giữa các mảnh — phải MERGE so từng đầu run (sim Step 1 là bằng chứng sống). Bấm <strong>Chạy Query</strong>.',
        reveal_hints: {
          'es-load': 'Trạm 1 mở dây chuyền: kho 1.000 block, tay chỉ rộng M block — bước đầu tiên của MỌI external sort là gì?',
          'es-run': 'Trạm 1 chốt: nạp M block, sort trong RAM. Mẻ đã gọn rồi — nhưng RAM phải trống cho mẻ kế. Gửi đi đâu, dưới dạng gì?',
          'es-merge': 'Trạm 2 chốt: mỗi mẻ thành một RUN trên đĩa. Hết bảng thì được N run — giờ gộp chúng mà RAM vẫn bé, mẹo nằm ở ĐẦU mỗi run.',
          'es-pass': 'Trạm 3 chốt: N-way merge chỉ cần N+1 block. Nhưng nếu N run còn NHIỀU hơn chỗ RAM (như sim: 4 run, RAM 3) — thì sao?'
        }
      },
      step_4: {
        prompt: '<strong>Ticket #45 — tự tay chia mẻ:</strong> kho orders 1.000 block, RAM M = 100. Điền 3 con số của kế hoạch sort. (Số viết liền, ví dụ <code>10</code>.)',
        challenge_type: 'fill_blank',
        template: "-- KHO orders: 1.000 block · RAM buffer: M = 100 block\n\n-- GIAI DOAN 1 · Tao run: moi me nap 100 block -> sort -> ghi ra dia\nso_run = ⌈1.000 / 100⌉  =  ____ run\ndo_dai_moi_run = ____ block (da sort)\n\n-- GIAI DOAN 2 · Merge: RAM du (M - 1) = 99 duong vao + 1 ra\n-- so_run co vuot 99 duong vao khong? -> so pass merge can dung:\nso_pass_merge = ____",
        blanks: [
          { id: 'b1', hint: '? run', expected: '10' },
          { id: 'b2', hint: '? block', expected: '100' },
          { id: 'b3', hint: '? pass', expected: '1' }
        ],
        schema: {
          table_name: 'orders',
          columns: [
            { name: 'order_id', type: 'INT', key: 'PK' },
            { name: 'buyer_id', type: 'INT', key: 'FK' },
            { name: 'total', type: 'INT (gem)', key: '⇅ khóa sort' },
            { name: 'status', type: 'VARCHAR', key: '' }
          ],
          data: [
            ['9002', '21', '12500', 'shipped'],
            ['9004', '88', '790', 'delivered'],
            ['9001', '88', '80', 'delivered']
          ]
        },
        context: {
          scenario: 'Đây là bản kê engine lập trước khi chạy ORDER BY total DESC cho báo cáo kế toán. Chú ý cái khác với sim Step 1: RAM 100 block tạo run DÀI hơn → ÍT run hơn → merge 1 pass là gọn (sim M=3 mới phải 2 pass).',
          real_world: 'Postgres gọi vùng RAM này là work_mem — nâng work_mem là cách kinh điển trị ORDER BY/DISTINCT chậm: run dài hơn, ít pass hơn, đôi khi khỏi cần external sort luôn.',
          steps: [
            'Số run = kích thước kho ÷ sức chứa RAM, làm tròn LÊN.',
            'Mỗi run dài đúng bằng những gì RAM ôm được một mẻ.',
            'So số run với số đường vào (M−1 = 99): ít hơn thì một lượt merge là xong.'
          ],
          hint_explore: 'Bí thì bấm lại sim ở Step 1 — cùng công thức, chỉ khác M=3 thu nhỏ.',
          expected: 'so_run = 10 · do_dai_moi_run = 100 · so_pass_merge = 1.'
        },
        hints: [
          { level: 1, text: 'Chia kho cho sức chứa RAM: 1.000 ÷ 100 — làm tròn lên nếu lẻ.' },
          { level: 2, text: 'Run = đúng một mẻ RAM ôm được: M block.' },
          { level: 3, text: '10 run so với 99 đường vào — có phải chia thành nhiều lượt không?' },
          { level: 4, text: 'so_run = <code>10</code> · do_dai_moi_run = <code>100</code> · so_pass_merge = <code>1</code>.' }
        ],
        success_message: 'TICKET #45 ĐÓNG — báo cáo kế toán xếp ngay ngắn 100.000 đơn dù RAM chỉ ôm nổi một góc! 🗂️ Và sort vừa vào tay bạn sẽ sớm thành VŨ KHÍ: bài sau bước vào đấu trường JOIN — orders phải ghép với listings để hiện TÊN vật phẩm, và engine có tới ba đời thuật toán ghép đôi để chọn.',
        xp_reward: 120
      }
    },

    /* ── nc_05 — Ticket #46 · Join I: Nested Loop / Block NL / Indexed NL ──
     * PART_6 Bài 5 (Ch 15.5.1-3): join là THUẬT TOÁN; outer/inner; 3 chế độ so
     * comparisons + I/O. Plan visual 3 cây (user chốt 2026-07-05). Số liệu:
     * outer = 300 đơn seller 4102 ≈ 3 block; inner = listings 400 block.
     * NLJ 303 seek + 120.003 block = 13.212ms · BNLJ 6 + 1.203 = 144ms (chosen)
     * · INLJ 303 + 303 = 1.242ms — twist: index KHÔNG thắng vì inner nhỏ.
     * step-4 full_ide JOIN thật (probe_join j1 OK); orders retcon chuẩn hóa:
     * bỏ item_name chép tay, thay listing_id FK. */
    {
      id: 'nc_05', index: 5,
      title: 'Join I — Nested Loop ba đời: từng dòng, từng block, tra index',
      subtitle: 'JOIN không phải syntax — là thuật toán ghép đôi, và chọn sai là trả giá gấp trăm',
      module: 7, module_title: 'Engine Room — Query Processing',
      estimated_minutes: 22, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'orders ⋈ listings (mẫu 4 + 4)',
          columns: ['order_id', 'buyer_id', 'listing_id', 'total', 'status'],
          dataRows: [
            ['9001', '88', '3005', '80', 'delivered'],
            ['9002', '88', '3002', '12500', 'shipped'],
            ['9004', '88', '3004', '790', 'delivered'],
            ['9005', '707', '3001', '45', 'delivered']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #46',
        hook: 'Trang "Lịch sử mua" chạy ngon từ Ticket #44… nhưng khách chỉ thấy <code>listing_id = 3005</code> vô hồn — TÊN vật phẩm nằm bên sổ <code>listings</code>. Đội từng có người đòi chép thẳng <code>item_name</code> vào orders "cho tiện" — bạn gạt ngay: chép tay là mầm lệch giá, bài học xương máu từ thời chuẩn hóa GameHub. Làm tử tế: orders giữ <code>listing_id</code>, muốn có tên thì <strong>JOIN</strong>. Nhưng JOIN là phép đắt nhất sàn diễn — Ticket #46: xem engine ghép 2 bảng bằng thuật toán gì, và vì sao cùng một phép ⋈ có thể chênh nhau cả trăm lần.'
      },
      step_1: {
        primer: {
          goal: [
            'JOIN không phải syntax — là THUẬT TOÁN: engine phải chọn cách ghép từng dòng 2 bảng',
            'Nested Loop ba đời: từng-DÒNG (nr lượt quét inner) → từng-BLOCK (br lượt) → TRA-INDEX (nr cú nhảy)',
            'Chọn bảng NHỎ làm outer + chọn đời thuật toán theo kích thước & index — vẫn là cộng hóa đơn I/O'
          ],
          intro: 'Ghép danh sách 300 đơn với kho 40.000 món: cách ngây thơ — cầm TỪNG ĐƠN chạy dọc cả kho (nested loop). Khôn hơn — ôm nguyên MỘT TRANG đơn (1 block) rồi đối chiếu cả trang trong MỘT lượt dạo kho (block nested loop): số phép so y hệt, nhưng số lượt DẠO KHO giảm trăm lần. Cách thứ ba — kho có mục lục: cầm mã món TRA THẲNG index (indexed nested loop), khỏi dạo, nhưng mỗi lần tra là một cú nhảy random. Ba đời, một mục đích — hóa đơn khác nhau một trời.',
          example: '300 đơn ⋈ 40.000 món: NLJ từng-dòng <strong>13.212ms</strong> · Block NLJ <strong>144ms</strong> · Indexed NLJ <strong>1.242ms</strong>. Cùng kết quả, chênh ~90 lần — và quán quân ở kho NÀY lại không phải anh có index.'
        },
        concept_cards: [
          {
            icon: 'fa-circle-nodes',
            title: 'Outer và Inner — ai cầm trịch?',
            body: 'Nested loop = 2 vòng lặp: bảng <strong>outer</strong> duyệt một lần, bảng <strong>inner</strong> bị quét ĐI QUÉT LẠI theo từng lượt của outer. Vì thế chọn bảng NHỎ làm outer: outer 3 block → inner chỉ bị quét 3 lượt. Đảo vai (outer 400 block) là hóa đơn phình ngay trăm lần.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 15.5.1-15.5.2 — Nested-Loop & Block Nested-Loop Join'
          },
          {
            icon: 'fa-people-arrows',
            title: 'Ba đời nested loop',
            body: '<strong>Đời 1 — NLJ:</strong> mỗi DÒNG outer quét trọn inner (nr × bs block). <strong>Đời 2 — Block NLJ:</strong> mỗi BLOCK outer quét inner một lượt (br × bs) — cùng số phép so, I/O giảm theo số dòng/block. <strong>Đời 3 — Indexed NLJ:</strong> mỗi dòng outer TRA index inner — đổi những lượt quét lấy nr cú nhảy random.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Indexed NLJ chính là access path Ticket #44 tái xuất: n cú nhảy × 4,1ms. Nó vô địch khi inner KHỔNG LỒ còn outer bé: phình listings lên 1 triệu món (10.000 block) — Block NLJ thành 3 × 10.000 = 3.001ms, Indexed NLJ vẫn đứng im 1.242ms → lật cờ. Vẫn bài học cũ: cost sống theo DỮ LIỆU.'
          }
        ],
        plan_visual: {
          query: "SELECT o.order_id, l.item_name, o.total\nFROM orders o JOIN listings l ON o.listing_id = l.listing_id\nWHERE o.seller_id = 4102;  -- 300 đơn ⋈ 40.000 món",
          caption: 'Cùng phép ⋈ — ba đời thuật toán. Twist: index KHÔNG thắng ở kho này (listings quá nhỏ); phình kho lên 1 triệu món thì Indexed NL lật cờ — cost sống theo dữ liệu.',
          price: {
            seek_ms: 4, block_ms: 0.1,
            note: 'outer = 300 đơn đã lọc ≈ 3 block · inner = listings 40.000 món ≈ 400 block · listings có index PK.'
          },
          trees: [
            {
              name: 'Đời 1 · NLJ — từng DÒNG',
              chosen: false,
              note: 'Mỗi đơn dạo trọn kho: 300 lượt × 400 block',
              io: { access: 'seq', seeks: 303, blocks: 120003 },
              nodes: [
                { op: 'orders (300 đơn)', kind: 'table', detail: 'outer — duyệt từng dòng', rows: '300 dòng' },
                { op: '⋈ Nested Loop', kind: 'join', detail: 'mỗi DÒNG quét cả listings', rows: '300 dòng ghép', cost: '12.000.000 phép so' }
              ]
            },
            {
              name: 'Đời 2 · Block NLJ — từng BLOCK',
              chosen: true,
              note: '✓ Optimizer chọn — cùng số phép so, I/O giảm 100 lần',
              io: { access: 'seq', seeks: 6, blocks: 1203 },
              nodes: [
                { op: 'orders (3 block)', kind: 'table', detail: 'outer — duyệt từng BLOCK', rows: '3 block' },
                { op: '⋈ Block Nested Loop', kind: 'join', detail: 'mỗi BLOCK quét listings 1 lượt', rows: '300 dòng ghép', cost: '12.000.000 phép so' }
              ]
            },
            {
              name: 'Đời 3 · Indexed NLJ — tra index',
              chosen: false,
              note: 'Thắng NLJ 10 lần — vẫn thua BNLJ ở kho nhỏ này',
              io: { access: 'random', seeks: 303, blocks: 303 },
              nodes: [
                { op: 'orders (300 đơn)', kind: 'table', detail: 'outer — từng dòng', rows: '300 dòng' },
                { op: '⋈ Indexed NL (PK listings)', kind: 'join', detail: 'mỗi đơn 1 cú tra index', rows: '300 dòng ghép', cost: '~4.800 phép so trên cây' }
              ]
            }
          ]
        },
        visual: {
          schema: {
            table_name: 'orders (đã chuẩn hóa — listing_id thay cho item_name chép tay)',
            columns: [
              { name: 'order_id', type: 'INT', key: 'PK' },
              { name: 'buyer_id', type: 'INT', key: 'FK' },
              { name: 'listing_id', type: 'INT', key: 'FK → listings' },
              { name: 'total', type: 'INT (gem)', key: '' },
              { name: 'status', type: 'VARCHAR', key: '' }
            ]
          },
          data_preview: [
            ['9001', '88', '3005 → Khiên gỗ sồi', '80', 'delivered'],
            ['9002', '88', '3002 → Giáp rồng', '12500', 'shipped'],
            ['9004', '88', '3004 → Skin súng Neon', '790', 'delivered'],
            ['9005', '707', '3001 → Kiếm gỗ', '45', 'delivered']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Block NLJ so với NLJ thường: số PHÉP SO vẫn y nguyên 12 triệu — vậy nó tiết kiệm ở đâu mà hóa đơn giảm từ 13.212ms còn 144ms?',
            options: [
              { id: 'a', text: 'Ở I/O: inner chỉ bị quét 3 lượt (mỗi BLOCK outer một lượt) thay vì 300 lượt (mỗi DÒNG một lượt) — phép so là tiền CPU rẻ, khiêng block mới là tiền I/O đắt', correct: true, explanation: 'Đúng — cùng khối lượng so sánh, khác số lần DẠO KHO. Bài học Ticket #43 nguyên vẹn: hóa đơn nằm ở I/O.' },
              { id: 'b', text: 'Ở phép so — đi theo block giúp so ít cặp hơn hẳn', correct: false, explanation: 'Sai — mọi cặp dòng vẫn phải so như cũ (12 triệu); block chỉ đổi CÁCH ĐỌC, không đổi phép so.' },
              { id: 'c', text: 'Block NLJ nén dữ liệu nên đọc nhanh hơn', correct: false, explanation: 'Sai — không nén gì cả; nó chỉ tận dụng những dòng ĐÃ nằm cùng block trong một lần đọc.' },
              { id: 'd', text: 'Nó bỏ qua các dòng không match ngay từ trên đĩa', correct: false, explanation: 'Sai — muốn biết match hay không vẫn phải đọc lên và so; không ai "nhìn xuyên" được block trên đĩa.' }
            ]
          },
          {
            question: 'Khi nào Indexed NLJ đáng đồng tiền bát gạo nhất?',
            options: [
              { id: 'a', text: 'Outer ÍT dòng còn inner RẤT LỚN — vài trăm cú tra index rẻ hơn hẳn việc quét đi quét lại một kho khổng lồ', correct: true, explanation: 'Đúng — mỗi dòng outer đổi "một lượt dạo kho" lấy "một cú nhảy". Kho càng to, cú đổi càng hời; kho bé (400 block) thì BNLJ vẫn rẻ hơn.' },
              { id: 'b', text: 'Mọi lúc — inner có index thì cứ dùng (nghe quen không?)', correct: false, explanation: 'Sai — đây là người anh em của "cứ có index là dùng" ở Ticket #44; hóa đơn 1.242ms vs 144ms ngay đầu bài đã bác nó.' },
              { id: 'c', text: 'Khi hai bảng to đúng bằng nhau', correct: false, explanation: 'Sai — kích thước bằng nhau không nói lên gì; thứ quyết định là outer nhỏ + inner lớn + index.' },
              { id: 'd', text: 'Khi inner bé đến mức nằm gọn trong một block', correct: false, explanation: 'Sai — inner bé thì quét trọn nó còn rẻ hơn tra index; index tỏa sáng khi inner LỚN.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Chọn thuật toán cho từng trận đấu',
          instruction: 'Nhìn kích thước outer/inner và index — xếp mỗi trận vào đúng góc đài.',
          xp: 20,
          chips: [
            { id: 'm1', label: 'Outer 3 block ⋈ inner 400 block, KHÔNG có index' },
            { id: 'm2', label: 'Outer 300 dòng ⋈ inner 10.000 block, inner có index PK' },
            { id: 'm3', label: 'Tra 1 đơn duy nhất ⋈ kho lớn có index' },
            { id: 'm4', label: 'Inner không có index nào trên cột ghép' }
          ],
          bins: [
            { id: 'b', label: 'Block NLJ 🚚' },
            { id: 'i', label: 'Indexed NLJ 📖' }
          ],
          solution: { m1: 'b', m4: 'b', m2: 'i', m3: 'i' }
        }
      },
      step_3: {
        mission: 'Dàn trận JOIN: chọn vai + xếp đúng ba đời nested loop. Có MỘT khối bịa.',
        blocks: [
          { type: 'op', token: 'Từng BLOCK outer quét inner một lượt: 3 × 400 = 1.200 block — 144ms, số phép so giữ nguyên', slot: 'jn-bnlj' },
          { type: 'op', token: 'Chọn bảng NHỎ (300 đơn ≈ 3 block) làm outer — vòng ngoài càng ít lượt, inner càng ít bị quét lại', slot: 'jn-outer' },
          { type: 'op', token: 'JOIN là phép có sẵn trong CPU — engine ghép 2 bảng trong một nhịp, không tốn I/O nào', slot: 'jn-x' },
          { type: 'op', token: 'Từng DÒNG outer quét trọn inner: 300 × 400 = 120.000 block — hóa đơn 13.212ms', slot: 'jn-nlj' },
          { type: 'op', token: 'Từng dòng outer TRA INDEX inner: 300 cú nhảy — 1.242ms, sẽ vô địch khi inner phình to', slot: 'jn-inlj' }
        ],
        drop_zones: [
          { id: 'jn-outer', placeholder: 'Nước đi 1 — chọn vai: bảng nào cầm trịch vòng ngoài?', accepts: ['op'], multi: false,
            station: { icon: '🎬', label: 'Chọn outer', sub: 'Nước đi 1', hint: 'Inner bị quét lại theo TỪNG LƯỢT của outer — vậy nên để ai cầm trịch?' } },
          { id: 'jn-nlj', placeholder: 'Đời 1 — cách ngây thơ nhất chạy thế nào?', accepts: ['op'], multi: false,
            station: { icon: '🐌', label: 'Đời 1 · từng dòng', sub: 'Nested Loop', hint: 'Cầm từng ĐƠN chạy dọc cả kho — đếm xem bao nhiêu lượt dạo.' } },
          { id: 'jn-bnlj', placeholder: 'Đời 2 — nâng cấp gì mà I/O giảm trăm lần?', accepts: ['op'], multi: false,
            station: { icon: '🚚', label: 'Đời 2 · từng block', sub: 'Block NL', hint: 'Những dòng nằm CÙNG block được đọc lên trong cùng một lần — tận dụng đi.' } },
          { id: 'jn-inlj', placeholder: 'Đời 3 — kho có mục lục thì sao?', accepts: ['op'], multi: false,
            station: { icon: '📖', label: 'Đời 3 · tra index', sub: 'Indexed NL', hint: 'Đổi mỗi lượt dạo kho lấy một cú nhảy — giá cú nhảy thì Ticket #43 đã niêm yết.' } }
        ],
        expected_sql: 'Chọn bảng NHỎ (300 đơn ≈ 3 block) làm outer — vòng ngoài càng ít lượt, inner càng ít bị quét lại Từng DÒNG outer quét trọn inner: 300 × 400 = 120.000 block — hóa đơn 13.212ms Từng BLOCK outer quét inner một lượt: 3 × 400 = 1.200 block — 144ms, số phép so giữ nguyên Từng dòng outer TRA INDEX inner: 300 cú nhảy — 1.242ms, sẽ vô địch khi inner phình to',
        expected_zones: {
          'jn-outer': 'Chọn bảng NHỎ (300 đơn ≈ 3 block) làm outer — vòng ngoài càng ít lượt, inner càng ít bị quét lại',
          'jn-nlj': 'Từng DÒNG outer quét trọn inner: 300 × 400 = 120.000 block — hóa đơn 13.212ms',
          'jn-bnlj': 'Từng BLOCK outer quét inner một lượt: 3 × 400 = 1.200 block — 144ms, số phép so giữ nguyên',
          'jn-inlj': 'Từng dòng outer TRA INDEX inner: 300 cú nhảy — 1.242ms, sẽ vô địch khi inner phình to'
        },
        reveal_strip: true,
        reveal_complete: '💡 BẠN VỪA DÀN xong trận JOIN: outer nhỏ cầm trịch → đời 1 ngây thơ → đời 2 đi theo block (quán quân kho này) → đời 3 tra index (chờ inner phình to để lật cờ). Khối "JOIN một nhịp CPU" là bịa — JOIN là thuật toán ghép trên block và index, trả tiền I/O như mọi người. Bấm <strong>Chạy Query</strong>.',
        reveal_hints: {
          'jn-outer': 'Nước đi 1 — trước khi chọn thuật toán phải chọn VAI: inner sẽ bị quét đi quét lại, vậy bảng nào nên đứng vòng ngoài?',
          'jn-nlj': 'Vai đã chốt: 300 đơn cầm trịch. Giờ đời 1 — cách ngây thơ nhất: cầm từng gì… chạy dọc đâu?',
          'jn-bnlj': 'Đời 1 chốt: 120.000 block — 13.212ms, hóa đơn thảm họa. Đời 2 tận dụng những dòng nằm CÙNG block: quét theo đơn vị nào?',
          'jn-inlj': 'Đời 2 chốt: 1.200 block — 144ms, giảm trăm lần không tốn thêm gì. Đời 3: kho có mục lục PK — mỗi đơn đổi lượt dạo lấy cái gì?'
        }
      },
      step_4: {
        prompt: 'Đóng Ticket #46: viết query "Lịch sử mua CÓ TÊN vật phẩm" cho khách <strong>#88</strong> — lấy <code>o.order_id, l.item_name, o.total</code> từ <code>orders o</code> ghép <code>listings l</code> qua <code>listing_id</code>, lọc <code>o.buyer_id = 88</code>.',
        schema: {
          table_name: 'orders',
          columns: [
            { name: 'order_id', type: 'INT', key: 'PK' },
            { name: 'buyer_id', type: 'INT', key: '🔑 idx_buyer' },
            { name: 'listing_id', type: 'INT', key: 'FK → listings' },
            { name: 'total', type: 'INT (gem)', key: '' },
            { name: 'status', type: 'VARCHAR', key: '' }
          ],
          data: [
            ['9001', '88', '3005', '80', 'delivered'],
            ['9002', '88', '3002', '12500', 'shipped'],
            ['9004', '88', '3004', '790', 'delivered'],
            ['9005', '707', '3001', '45', 'delivered']
          ],
          related_schemas: [
            {
              table_name: 'listings',
              columns: [
                { name: 'listing_id', type: 'INT', key: 'PK' },
                { name: 'item_name', type: 'VARCHAR', key: '' },
                { name: 'price', type: 'INT (gem)', key: '' }
              ],
              data: [
                ['3001', 'Kiếm gỗ Newbie', '45'],
                ['3002', 'Giáp rồng Huyền thoại', '12500'],
                ['3004', 'Skin súng Neon', '790'],
                ['3005', 'Khiên gỗ sồi', '80']
              ]
            }
          ]
        },
        context: {
          scenario: 'Plan mô phỏng cho query này: <code>Indexed Nested Loop — Index Scan idx_buyer lấy ~20 đơn của #88 → mỗi đơn tra PK listings lấy tên</code>. Outer bé tí (vài đơn), inner có index khóa chính — đúng sân khấu của đời 3.',
          real_world: 'Cặp "FK trỏ PK + JOIN" là nhịp tim của mọi schema đã chuẩn hóa — và vì PK luôn có index sẵn, Indexed NLJ gần như miễn phí cho các join "tra theo khóa" kiểu này. Đó là phần thưởng cho việc KHÔNG chép item_name vào orders.',
          steps: [
            'Đặt bí danh: <code>orders o</code> và <code>listings l</code>.',
            'Ghép qua khóa: <code>JOIN listings l ON o.listing_id = l.listing_id</code>.',
            'Lấy 3 cột: <code>o.order_id, l.item_name, o.total</code>.',
            'Lọc khách: <code>WHERE o.buyer_id = 88</code>.'
          ],
          hint_explore: 'Chạy thử <code>SELECT * FROM orders WHERE buyer_id = 88</code> — thấy toàn listing_id "vô hồn" đúng như khách phàn nàn, rồi hẵng JOIN.',
          expected: 'Bảng 3 đơn của #88 kèm tên: Khiên gỗ sồi (80) · Giáp rồng Huyền thoại (12500) · Skin súng Neon (790).'
        },
        hints: [
          { level: 1, text: 'Khung JOIN hai bảng: <code>FROM orders o JOIN listings l ON o.listing_id = l.listing_id</code>.' },
          { level: 2, text: 'Ba cột cần lấy, nhớ tiền tố: <code>o.order_id, l.item_name, o.total</code>.' },
          { level: 3, text: 'Chốt bằng <code>WHERE o.buyer_id = 88;</code>' },
          { level: 4, text: '<code class="code">SELECT o.order_id, l.item_name, o.total FROM orders o JOIN listings l ON o.listing_id = l.listing_id WHERE o.buyer_id = 88;</code>' }
        ],
        expected_sql: 'SELECT o.order_id, l.item_name, o.total FROM orders o JOIN listings l ON o.listing_id = l.listing_id WHERE o.buyer_id = 88;',
        success_message: 'TICKET #46 ĐÓNG — "Lịch sử mua" hiện tên vật phẩm, schema vẫn sạch chuẩn hóa! ⋈ Engine Room đã đi 5/10. Nhưng nested loop mới là nửa đầu câu chuyện join: bài sau, hai võ sĩ hạng nặng bước lên đài — <strong>Merge Join</strong> (đứng trên vai external sort của Ticket #45) và <strong>Hash Join</strong> (chia giỏ rồi mới đấu). Kèm một hồ sơ về cú lừa mang tên skew.',
        xp_reward: 120
      }
    },

    /* ── nc_06 — Ticket #47 · Join II: Merge Join & Hash Join ──
     * PART_6 Bài 6 (Ch 15.5.4-5): merge khi input sorted; hash chia cặp xô,
     * build = bảng nhỏ, probe bảng kia; KHÔNG dạy hybrid/recursive/fudge (Card E
     * lo skew). Sim hash build/probe bấm-từng-bước (user chốt 2026-07-06).
     * Số liệu toàn sàn: orders 1.000 ⋈ listings 400, M=100 — BNLJ 4.400 block/472ms
     * · grace hash 3(br+bs)=4.200/492ms · merge ĐÃ sort 1.400+2 nhảy=148ms
     * · hash build-vừa-RAM (lọc <100 gem ≈ 12 block) = 148ms. */
    {
      id: 'nc_06', index: 6,
      title: 'Join II — Merge Join & Hash Join: hai võ sĩ hạng nặng',
      subtitle: 'Không có vua tuyệt đối: ĐÃ SORT thì merge, BUILD NHỎ thì hash — điều kiện quyết định đai',
      module: 7, module_title: 'Engine Room — Query Processing',
      estimated_minutes: 22, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'fill_blank',
      drag_map: {
        table: {
          name: 'listings (40.000 món ≈ 400 block — phía BUILD, mẫu 4)',
          columns: ['listing_id', 'item_name', 'price'],
          dataRows: [
            ['3001', 'Kiếm gỗ Newbie', '45'],
            ['3002', 'Giáp rồng Huyền thoại', '12500'],
            ['3004', 'Skin súng Neon', '790'],
            ['3005', 'Khiên gỗ sồi', '80']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #47',
        hook: 'Cuối tháng, sếp muốn <em>"sao kê TOÀN SÀN: 100.000 đơn, đơn nào cũng kèm tên món"</em> — vẫn là phép ⋈ của Ticket #46, nhưng outer không còn là 3 đơn của khách #88 nữa: outer giờ là CẢ KHO. Block NLJ gồng được 472ms… trong khi đội vận hành thì thào: sàn sắp mở rộng gấp 10. Ticket #47: hai võ sĩ hạng nặng bước lên đài — <strong>Merge Join</strong> đứng trên vai external sort của Ticket #45, và <strong>Hash Join</strong> với chiêu CHIA XÔ. Cả hai cùng ra giá 148ms — nhưng mỗi người kèm một ĐIỀU KIỆN.'
      },
      step_1: {
        primer: {
          goal: [
            'Merge Join: 2 bảng ĐÃ sort theo khóa ghép → 2 con trỏ chạy song song, mỗi bảng đọc đúng 1 lượt (br + bs); CHƯA sort thì phải cộng tiền sort (bài 4) vào hóa đơn',
            'Hash Join: hash(khóa ghép) chia CẢ HAI bảng thành các cặp xô — khớp nhau thì bắt buộc CÙNG xô, nên chỉ so trong từng cặp; BUILD bảng tra từ xô nhỏ, PROBE bằng xô kia',
            'Luật chọn: build = bảng NHỎ hơn; build vừa RAM → 1 lượt (br + bs) không cần chia xô; cả hai bảng đều to → grace hash 3(br + bs) — vẫn rẻ khi kho phình'
          ],
          intro: 'Ghép 100.000 hóa đơn với 40.000 nhãn giá. Cách 1: nếu CẢ HAI chồng giấy đã xếp theo mã món, hai thủ kho dò song song từ trên xuống — mỗi tờ cầm đúng một lần (<strong>merge</strong>). Cách 2: chẳng cần xếp gì — kẻ 4 cái XÔ, ném giấy vào xô theo đuôi mã số; hóa đơn ở xô 2 chỉ có thể khớp nhãn ở xô 2, khỏi so chéo (<strong>hash</strong>). Cả hai đều né được cảnh "mỗi tờ dò cả chồng" của nested loop.',
          example: 'Toàn sàn orders 1.000 block ⋈ listings 400 block: BNLJ = 4.400 block ≈ <strong>472ms</strong>. Hai file ĐÃ sort theo listing_id? Merge = 1.400 block + 2 nhảy = <strong>148ms</strong>. Báo cáo chỉ cần món &lt;100 gem — build sau lọc ~12 block VỪA RAM? Hash 1 lượt = cũng <strong>148ms</strong>, mà không cần sort gì hết.'
        },
        concept_cards: [
          {
            icon: 'fa-code-merge',
            title: 'Merge Join — trả công một lần đọc',
            body: 'Input đã sort thì mỗi tuple chỉ cần đọc MỘT lần: 2 con trỏ nhích song song, gặp khóa bằng nhau thì ghép — tổng chuyển block = <strong>br + bs</strong>. Cái giá thật nằm ở chữ "đã sort": chưa có trật tự thì phải external sort trước (Ticket #45), hóa đơn toàn sàn đội lên ≈820ms — lúc đó thà BNLJ.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 15.5.4 — Merge Join: br + bs block transfers khi 2 quan hệ đã sort theo khóa ghép'
          },
          {
            icon: 'fa-fill-drip',
            title: 'Hash Join — build nhỏ, probe lớn',
            body: 'Chia 2 bảng bằng CÙNG hàm hash thành nh cặp xô (nh = ⌈b_build/M⌉ để mỗi xô build VỪA RAM). Với từng cặp: nạp xô <strong>build</strong> (bảng nhỏ) vào RAM dựng bảng tra, rồi <strong>probe</strong> — duyệt xô kia, tra từng dòng. Chia xô tốn đọc + ghi cả 2 bảng, build/probe đọc lại lần nữa: tổng ≈ <strong>3(br + bs)</strong>. Còn build vốn đã vừa RAM? Khỏi chia xô: br + bs, một lượt.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Sàn phình listings ×10 (4.000 block): BNLJ leo lên 41.000 block ≈ <strong>4.180ms</strong>, grace hash chỉ 3×5.000 = 15.000 ≈ <strong>1.668ms</strong> — hash knock-out khi CẢ HAI bảng đều to. Vẫn triết lý cũ: cost sống theo dữ liệu. Còn một cú lừa mang tên <strong>skew</strong> — xô phình vì món hit — hồ sơ chờ ngay sau bài này.'
          }
        ],
        hash_visual: {
          eyebrow: 'HASH JOIN — MÔ HÌNH THU NHỎ: 8 MÓN BUILD · 6 ĐƠN PROBE · 4 XÔ',
          caption: 'Fig 15.9-15.10 sách thu nhỏ: hash(id % 4) chia món vào xô — rồi từng đơn chỉ mở ĐÚNG xô của nó. Để ý đơn #9005: cùng xô 3 mà vẫn trượt — cùng xô chưa chắc khớp, phải so thật; nhưng KHÁC xô thì chắc chắn khỏi so.',
          buckets: 4,
          build: [
            { label: 'Kiếm 3001', v: 3001 }, { label: 'Giáp 3002', v: 3002 },
            { label: 'Skin 3004', v: 3004 }, { label: 'Khiên 3005', v: 3005 },
            { label: 'Cung 3006', v: 3006 }, { label: 'Mũ 3008', v: 3008 },
            { label: 'Nhẫn 3011', v: 3011 }, { label: 'Đai 3013', v: 3013 }
          ],
          probe: [
            { label: '#9001→3005', v: 3005 }, { label: '#9002→3002', v: 3002 },
            { label: '#9003→3011', v: 3011 }, { label: '#9004→3004', v: 3004 },
            { label: '#9005→3007', v: 3007 }, { label: '#9006→3001', v: 3001 }
          ]
        },
        visual: {
          schema: {
            table_name: 'orders ⋈ listings — trận TOÀN SÀN (không WHERE)',
            columns: [
              { name: 'orders', type: '100.000 đơn ≈ 1.000 block', key: 'PROBE' },
              { name: 'listings', type: '40.000 món ≈ 400 block', key: 'BUILD (nhỏ hơn)' },
              { name: 'khóa ghép', type: 'listing_id', key: '⋈' },
              { name: 'RAM buffer', type: 'M = 100 block', key: '' }
            ]
          },
          data_preview: [
            ['BNLJ (bài 5)', '4 mẻ × 1.000', '4.400 block + 8 nhảy', '472 ms'],
            ['Sort-Merge (chưa sort)', 'sort 2 bảng rồi dò', '≈7.000 block', '≈820 ms'],
            ['Merge (ĐÃ sort)', '2 con trỏ song song', '1.400 block + 2 nhảy', '148 ms'],
            ['Grace Hash', '4 cặp xô', '3×1.400 = 4.200 block', '492 ms'],
            ['Hash build-vừa-RAM', 'lọc còn 12 block', '1.400 block + 2 nhảy', '148 ms']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Hash join KHÔNG sort gì cả — vậy nhờ đâu nó né được 12 triệu phép so chéo của nested loop?',
            options: [
              { id: 'a', text: 'Nhờ chia CẢ HAI bảng bằng cùng một hàm hash: hai dòng khớp nhau thì hash bằng nhau → bắt buộc CÙNG xô — nên chỉ cần so trong từng cặp xô', correct: true, explanation: 'Đúng — khác xô là chắc chắn khỏi so. Đó là toàn bộ phép màu: không cần trật tự, chỉ cần "cùng khóa thì cùng xô".' },
              { id: 'b', text: 'Nhờ hash tự xếp thứ tự các dòng bên trong mỗi xô', correct: false, explanation: 'Sai — trong xô vẫn lộn xộn nguyên; hash chỉ CHIA NGĂN, không xếp. So trong xô là việc của bảng tra khi build/probe.' },
              { id: 'c', text: 'Nhờ bỏ qua các dòng không khớp ngay từ trên đĩa', correct: false, explanation: 'Sai — muốn biết khớp hay không vẫn phải đọc lên; hash chỉ đảm bảo bạn không phí công so hai dòng KHÁC xô.' },
              { id: 'd', text: 'Nhờ CPU so mã hash nhanh hơn so số thường', correct: false, explanation: 'Sai — tiết kiệm nằm ở SỐ CẶP phải so (chỉ trong xô), không phải tốc độ một phép so.' }
            ]
          },
          {
            question: 'Vì sao build phải là bảng NHỎ hơn (listings 400 block chứ không phải orders 1.000)?',
            options: [
              { id: 'a', text: 'Vì bảng tra dựng từ xô build phải nằm TRỌN trong RAM khi probe — build càng nhỏ càng ít xô phải chia, thậm chí khỏi chia; còn xô probe to bao nhiêu cũng được, duyệt tuần tự mà', correct: true, explanation: 'Đúng — sách nói thẳng: partition của PROBE không cần vừa bộ nhớ. Ràng buộc RAM chỉ đè lên vai build, nên đưa người nhẹ cân nhất lên.' },
              { id: 'b', text: 'Vì bảng to làm hash tính chậm hơn', correct: false, explanation: 'Sai — hàm hash tính trên từng dòng, bảng nào cũng phải hash đủ số dòng của nó; vấn đề là RAM, không phải tốc độ hash.' },
              { id: 'c', text: 'Vì bảng nhỏ luôn có index sẵn', correct: false, explanation: 'Sai — hash join không dùng index có sẵn nào; bảng tra được dựng TẠI CHỖ trong RAM lúc build.' },
              { id: 'd', text: 'Không quan trọng — hash join đối xứng hai bên', correct: false, explanation: 'Sai — đối xứng lúc CHIA XÔ thôi; đến lúc build thì một bên phải chui vào RAM, và đó nên là bên nhỏ.' }
            ]
          }
        ],
        mini_game: {
          type: 'order',
          title: 'Chạy đúng dây chuyền grace hash join',
          instruction: 'Kéo 5 bước vào đúng thứ tự chạy.',
          xp: 20,
          items: [
            { id: 'r3', label: 'Probe: duyệt xô orders #0, tra từng đơn vào bảng — khớp thì ghép' },
            { id: 'r1', label: 'Hash(listing_id): chia CẢ HAI bảng thành 4 cặp xô, ghi ra đĩa' },
            { id: 'r5', label: 'Nối kết quả 4 cặp — không cặp nào phải so chéo nhau' },
            { id: 'r2', label: 'Nạp xô listings #0 (bé) vào RAM, dựng bảng tra' },
            { id: 'r4', label: 'Đổ RAM, lặp build + probe với cặp xô #1, #2, #3' }
          ],
          solution: { r1: 1, r2: 2, r3: 3, r4: 4, r5: 5 }
        }
      },
      step_3: {
        mission: 'Dàn trận hash join toàn sàn + chốt luật chọn đai — có MỘT khối bịa.',
        blocks: [
          { type: 'op', token: 'Nạp xô listings (bé hơn) vào RAM dựng bảng tra — ràng buộc "vừa bộ nhớ" chỉ đè lên vai build', slot: 'hj-build' },
          { type: 'op', token: 'Hash(listing_id) chia CẢ orders lẫn listings thành 4 cặp xô — khớp thì bắt buộc CÙNG xô, hết so chéo', slot: 'hj-hash' },
          { type: 'op', token: 'Sort cả hai bảng theo listing_id TRƯỚC rồi mới chia xô — hash cần input có trật tự mới chia đều', slot: 'hj-x' },
          { type: 'op', token: 'Duyệt xô orders cùng số hiệu, tra từng đơn vào bảng trong RAM — xong cặp thì đổ RAM, sang cặp kế', slot: 'hj-probe' },
          { type: 'op', token: 'ĐÃ sort → merge 148ms · build vừa RAM → hash 1 lượt 148ms · cả hai to → grace hash 3(br+bs)', slot: 'hj-rule' }
        ],
        drop_zones: [
          { id: 'hj-hash', placeholder: 'Nước đi 1 — chưa ai sort, kho nào cũng to: mở trận sao?', accepts: ['op'], multi: false,
            station: { icon: '🪣', label: 'Chia cặp xô', sub: 'Nước đi 1', hint: 'Hai dòng khớp nhau thì hash giống nhau — chia cả 2 bảng theo CÙNG một hàm.' } },
          { id: 'hj-build', placeholder: 'Nước đi 2 — cặp xô #0 mở ra, ai được vào RAM?', accepts: ['op'], multi: false,
            station: { icon: '🏗️', label: 'Build bảng tra', sub: 'Nước đi 2', hint: 'Bảng tra phải VỪA bộ nhớ — đưa người nhẹ cân lên trước.' } },
          { id: 'hj-probe', placeholder: 'Nước đi 3 — bảng tra sẵn sàng, xô còn lại làm gì?', accepts: ['op'], multi: false,
            station: { icon: '🎯', label: 'Probe từng đơn', sub: 'Nước đi 3', hint: 'Xô orders cùng số hiệu — từng đơn một cú tra vào bảng trong RAM.' } },
          { id: 'hj-rule', placeholder: 'Nước đi 4 — chốt luật: khi nào chọn ai?', accepts: ['op'], multi: false,
            station: { icon: '⚖️', label: 'Luật chọn đai', sub: 'Nước đi 4', hint: 'Hai võ sĩ cùng ra giá 148ms — nhưng mỗi người kèm một ĐIỀU KIỆN.' } }
        ],
        expected_sql: 'Hash(listing_id) chia CẢ orders lẫn listings thành 4 cặp xô — khớp thì bắt buộc CÙNG xô, hết so chéo Nạp xô listings (bé hơn) vào RAM dựng bảng tra — ràng buộc "vừa bộ nhớ" chỉ đè lên vai build Duyệt xô orders cùng số hiệu, tra từng đơn vào bảng trong RAM — xong cặp thì đổ RAM, sang cặp kế ĐÃ sort → merge 148ms · build vừa RAM → hash 1 lượt 148ms · cả hai to → grace hash 3(br+bs)',
        expected_zones: {
          'hj-hash': 'Hash(listing_id) chia CẢ orders lẫn listings thành 4 cặp xô — khớp thì bắt buộc CÙNG xô, hết so chéo',
          'hj-build': 'Nạp xô listings (bé hơn) vào RAM dựng bảng tra — ràng buộc "vừa bộ nhớ" chỉ đè lên vai build',
          'hj-probe': 'Duyệt xô orders cùng số hiệu, tra từng đơn vào bảng trong RAM — xong cặp thì đổ RAM, sang cặp kế',
          'hj-rule': 'ĐÃ sort → merge 148ms · build vừa RAM → hash 1 lượt 148ms · cả hai to → grace hash 3(br+bs)'
        },
        reveal_strip: true,
        reveal_complete: '💡 BẠN VỪA DÀN xong grace hash: chia cặp xô → build bảng nhỏ → probe → luật chọn đai theo điều kiện. Khối "sort trước rồi chia xô" là bịa — KHÔNG CẦN SORT chính là điểm bán hàng của hash join: hàm hash chia ngăn được cả đống giấy lộn xộn (sim Step 1 là bằng chứng sống). Bấm <strong>Chạy Query</strong>.',
        reveal_hints: {
          'hj-hash': 'Nước đi 1 — nested loop chết vì so chéo mọi cặp. Muốn "khớp nhau thì tự tìm về cùng chỗ" mà không tốn công sort, dùng phép gì lên khóa ghép?',
          'hj-build': 'Nước đi 1 chốt: 4 cặp xô trên đĩa, so chéo bị xóa sổ. Mở cặp #0: RAM chỉ chứa nổi MỘT xô để dựng bảng tra — xô của bảng nào được vào?',
          'hj-probe': 'Nước đi 2 chốt: bảng tra listings nằm gọn trong RAM. Xô orders #0 vẫn nằm trên đĩa — từng đơn trong đó làm gì với bảng tra?',
          'hj-rule': 'Nước đi 3 chốt: probe xong 4 cặp là hết trận. Còn nước cuối — treo LUẬT lên tường: khi nào merge, khi nào hash 1 lượt, khi nào grace?'
        }
      },
      step_4: {
        prompt: '<strong>Ticket #47 — tự lập hóa đơn hash:</strong> trận toàn sàn orders 1.000 block ⋈ listings 400 block, RAM M = 100. Điền 3 con số. (Số viết liền, ví dụ <code>4200</code>.)',
        challenge_type: 'fill_blank',
        template: "-- TRAN TOAN SAN: orders 1.000 block ⋈ listings 400 block · RAM M = 100\n\n-- GRACE HASH · Buoc 1: chia xo sao cho moi xo BUILD vua RAM\nso_cap_xo = ⌈400 / 100⌉  =  ____ cap\n\n-- Buoc 2: chia xo = doc + ghi CA HAI bang · Buoc 3: build/probe = doc lai ca hai\ntong_block_grace = 3 × (1.000 + 400)  =  ____ block\n\n-- VE DAC BIET: bao cao chi can mon < 100 gem → build sau loc ~12 block, VUA RAM\n-- → khoi chia xo: doc listings 400 (build) + doc orders 1.000 (probe)\ntong_block_1_luot = ____ block",
        blanks: [
          { id: 'b1', hint: '? cặp xô', expected: '4' },
          { id: 'b2', hint: '? block', expected: '4200' },
          { id: 'b3', hint: '? block', expected: '1400' }
        ],
        schema: {
          table_name: 'orders ⋈ listings',
          columns: [
            { name: 'orders', type: '1.000 block', key: 'PROBE' },
            { name: 'listings', type: '400 block', key: 'BUILD' },
            { name: 'RAM', type: 'M = 100 block', key: '' }
          ],
          data: [
            ['grace hash', '3 × (br + bs)', '4 cặp xô'],
            ['build vừa RAM', 'br + bs', 'không chia xô'],
            ['merge (đã sort)', 'br + bs', '2 con trỏ']
          ]
        },
        context: {
          scenario: 'Đây là bản nháp optimizer cân grace hash cho trận toàn sàn. Chú ý tại kho NÀY grace hash (4.200 block ≈ 492ms) vẫn chưa hạ được BNLJ (4.400 block ≈ 472ms) — nhưng phình kho ×10 là hash knock-out (15.000 vs 41.000 block). Và vé đặc biệt: build lọc còn vừa RAM thì hash rẻ ngang merge-đã-sort mà chẳng cần trật tự nào.',
          real_world: 'Postgres chọn Hash Join làm mặc định cho equi-join giữa hai bảng lớn — EXPLAIN sẽ hiện "Hash Cond: (o.listing_id = l.listing_id)". Và lại là work_mem: build vừa work_mem thì 1 lượt, tràn thì Postgres tự chia batch — đúng grace hash bạn vừa tính.',
          steps: [
            'Số cặp xô: mỗi xô build phải ≤ M block → ⌈400 / 100⌉.',
            'Grace = 3 lượt đi qua cả hai bảng: chia xô (đọc + ghi) rồi build/probe (đọc lại).',
            'Vé 1 lượt: khỏi chia xô — mỗi bảng đọc đúng một lần: 1.000 + 400.'
          ],
          hint_explore: 'Bí thì bấm lại sim Step 1: 8 món + 6 đơn, mỗi bên đúng MỘT lượt — nhân số đó lên 1.400 block là ra vé đặc biệt.',
          expected: 'so_cap_xo = 4 · tong_block_grace = 4200 · tong_block_1_luot = 1400.'
        },
        hints: [
          { level: 1, text: 'Mỗi xô build phải vừa RAM 100 block — kho build 400 block thì cần mấy xô?' },
          { level: 2, text: 'Grace hash đi qua mỗi bảng 3 lần (chia xô: đọc + ghi; build/probe: đọc) — nhân 3 với tổng block hai bảng.' },
          { level: 3, text: 'Build vừa RAM thì mỗi bảng chỉ đọc MỘT lần: cộng thẳng 1.000 + 400.' },
          { level: 4, text: 'so_cap_xo = <code>4</code> · tong_block_grace = <code>4200</code> · tong_block_1_luot = <code>1400</code>.' }
        ],
        success_message: 'TICKET #47 ĐÓNG — sao kê toàn sàn có thuật toán dự phòng cho ngày kho phình gấp 10! 🪣 Nhưng khoan đóng sổ: hash join có một cú lừa mang tên SKEW — món hit chiếm 30.000 đơn làm một xô phình nổ. Hồ sơ kỹ thuật ngay bên dưới. Rồi bài sau: một phép tưởng nặng nhất sàn — GROUP BY 100.000 đơn — hóa ra giá đúng bằng MỘT lần quét kho.',
        xp_reward: 120
      },
      concept_cards_after: ['nc_card_hash_skew']
    },

    /* ── nc_07 — Ticket #48 · Aggregation & DISTINCT bằng Sort/Hash ──
     * PART_6 Bài 7 (Ch 15.6.1 + 15.6.5): GROUP BY sort-based vs hash-based;
     * on-the-fly cho sum/count/min/max/avg (avg = sum÷count lúc đổ sổ);
     * DISTINCT = cùng máy, SQL mặc định GIỮ trùng. Twist: bảng Ô 2.000 seller
     * ≈ 20 block VỪA RAM → hash-agg = br + 1 seek = 104ms — đúng giá seq scan
     * nc_02. step-4 full_ide GROUP BY thật (probe_groupby g1-g8 OK; DISTINCT
     * bị guard — engine trả rỗng im lặng). */
    {
      id: 'nc_07', index: 7,
      title: 'Aggregation — GROUP BY cả sàn giá bằng một lần quét',
      subtitle: 'Sort-agg xếp rồi gom · Hash-agg cộng dồn từng Ô — và DISTINCT chỉ là GROUP BY không cột tính',
      module: 7, module_title: 'Engine Room — Query Processing',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'orders (100.000 đơn ≈ 1.000 block — mẫu 5, seller lộn xộn)',
          columns: ['order_id', 'seller_id', 'total'],
          dataRows: [
            ['9001', '4102', '80'],
            ['9002', '2001', '12500'],
            ['9003', '4102', '790'],
            ['9004', '2001', '45'],
            ['9005', '3300', '150']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #48',
        hook: 'Sàn ra mắt <em>"Bảng vàng seller"</em> — trang vinh danh doanh thu từng người bán. Nghĩa là gom <strong>100.000 đơn</strong> về <strong>2.000 seller</strong> và cộng tiền từng nhóm. Dev mới nhìn mà rùng mình: "gom nhóm cả sàn chắc đắt gấp mấy lần JOIN". Rồi EXPLAIN in ra hóa đơn: <strong>104ms</strong> — đúng bằng giá MỘT lần seq scan ở Ticket #43, không hơn một xu. Ticket #48: mở nắp máy xem engine gom nhóm kiểu gì mà rẻ vậy — và khi nào phép màu này HẾT hiệu lực.'
      },
      step_1: {
        primer: {
          goal: [
            'GROUP BY có 2 lối: SORT-AGG — xếp cả bảng theo khóa nhóm (bài 4) rồi gom các dòng nằm liền kề; HASH-AGG — mỗi dòng hash thẳng vào Ô của nhóm mình',
            'On-the-fly: sum/count/min/max cộng dồn NGAY khi đọc từng dòng — mỗi nhóm chỉ giữ MỘT Ô, đơn đọc xong là bỏ; avg = giữ sum + count, chia nhau lúc đổ sổ',
            'Điều kiện phép màu: bảng Ô vừa RAM → đọc bảng đúng 1 lượt = br block + 1 cú nhảy; Ô KHÔNG vừa RAM → phải chia xô ra đĩa như hash join (≈3·br). DISTINCT? Cùng cỗ máy — GROUP BY không có cột tính'
          ],
          intro: 'Đếm phiếu bầu cho 2.000 ứng viên từ thùng 100.000 phiếu. Cách 1: đổ hết ra, XẾP phiếu theo tên, rồi đếm từng cụm nằm cạnh nhau. Cách 2: kẻ bảng 2.000 Ô — bốc từng phiếu, nhìn tên, <strong>cộng một vạch vào đúng Ô</strong> rồi bỏ phiếu đi. Cách 2 không giữ lại phiếu nào: thứ nằm trên bàn chỉ là BẢNG Ô — và 2.000 ô thì bàn nào chả để vừa.',
          example: 'Bảng vàng seller: hash-agg đọc orders 1.000 block một lượt, mỗi đơn cộng dồn SUM[seller] += total vào bảng Ô ~20 block trong RAM → <strong>1.000 block + 1 nhảy = 104ms</strong>. Sort-agg phải external sort trước: ≈3.000 block ≈ <strong>348ms</strong> — nhưng đổi lại kết quả ra ĐÃ xếp thứ tự.'
        },
        concept_cards: [
          {
            icon: 'fa-calculator',
            title: 'On-the-fly — giữ Ô, bỏ đơn',
            body: 'Gặp 2 dòng cùng nhóm, engine KHÔNG giữ cả hai — nó thay bằng MỘT dòng mang sum/min/max/count đang cộng dồn. Nhờ thế mỗi nhóm chỉ tốn một Ô, và khi mọi Ô vừa RAM: cả phép GROUP BY = đọc bảng 1 lượt, <strong>br block + 1 cú nhảy</strong> — thay vì ≈3·br nếu phải ghi tạm ra đĩa.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 15.6.5 — Aggregation: on-the-fly sum/count/min/max/avg, br transfers + 1 seek khi kết quả vừa bộ nhớ'
          },
          {
            icon: 'fa-clone',
            title: 'DISTINCT — người anh em ruột',
            body: 'Khử trùng lặp (duplicate elimination) chạy CÙNG cỗ máy: sort thì bản sao nằm cạnh nhau — xóa; hash thì bản sao rơi vào cùng Ô — giữ một. <code>SELECT DISTINCT seller_id</code> về bản chất là GROUP BY seller_id không có cột tính. Nhớ luật SQL: mặc định GIỮ trùng lặp — muốn khử phải tự gõ DISTINCT, vì khử là có giá.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Đổi khóa nhóm là đổi số phận: GROUP BY <strong>buyer_id × ngày</strong> → hơn triệu Ô ≈ 12.000 block — KHÔNG vừa RAM → engine phải chia xô ra đĩa như bài 6, hóa đơn ≈3·br. Còn sort-agg vẫn có đất diễn: cần <code>ORDER BY seller_id</code> kèm theo? Sort một công đôi việc — optimizer sẽ tự cân.'
          }
        ],
        plan_visual: {
          query: "SELECT seller_id, SUM(total)\nFROM orders\nGROUP BY seller_id;  -- 100.000 đơn → 2.000 seller",
          caption: 'Cùng một GROUP BY — hai cỗ máy. Optimizer chọn hash-agg vì bảng Ô ~20 block vừa RAM: giá 104ms, đúng bằng MỘT lần seq scan Ticket #43. Đổi khóa nhóm cho Ô phình quá RAM là phép màu tắt.',
          price: {
            seek_ms: 4, block_ms: 0.1,
            note: 'orders 1.000 block · 2.000 seller → bảng Ô ≈ 20 block, RAM M = 100 · bảng giá HDD như cũ.'
          },
          trees: [
            {
              name: 'Sort-Aggregate',
              chosen: false,
              note: 'External sort (bài 4) rồi gom nhóm liền kề — bonus: kết quả ra ĐÃ xếp',
              io: { access: 'seq', seeks: 12, blocks: 3000 },
              nodes: [
                { op: 'orders (1.000 block)', kind: 'table', detail: 'kho chưa có trật tự', rows: '100.000 dòng' },
                { op: 'External Sort theo seller_id', kind: 'scan', detail: '10 run + 1 pass merge', rows: '100.000 dòng đã xếp' },
                { op: 'γ Gom nhóm liền kề + SUM', kind: 'project', detail: 'cùng seller nằm cạnh nhau — cắt cụm', rows: '2.000 nhóm' }
              ]
            },
            {
              name: 'Hash-Aggregate on-the-fly',
              chosen: true,
              note: '✓ Optimizer chọn — đọc 1 lượt, mỗi đơn cộng dồn vào Ô của nhóm',
              io: { access: 'seq', seeks: 1, blocks: 1000 },
              nodes: [
                { op: 'orders (1.000 block)', kind: 'table', detail: 'kho chưa có trật tự', rows: '100.000 dòng' },
                { op: 'Seq Scan — một lượt duy nhất', kind: 'scan', detail: 'từng đơn một, không sort', rows: '100.000 dòng' },
                { op: 'γ Hash(seller_id) → SUM[Ô] += total', kind: 'project', detail: 'chỉ giữ 2.000 Ô ≈ 20 block trong RAM', rows: '2.000 nhóm' }
              ]
            }
          ]
        },
        visual: {
          schema: {
            table_name: 'orders — nguyên liệu Bảng vàng seller',
            columns: [
              { name: 'order_id', type: 'INT', key: 'PK' },
              { name: 'seller_id', type: 'INT', key: '🪣 khóa nhóm' },
              { name: 'total', type: 'INT (gem)', key: 'Σ cột tính' }
            ]
          },
          data_preview: [
            ['9001', '4102', '80'],
            ['9002', '2001', '12500 ← seller trùng nhau', ''],
            ['9003', '4102', '790 ← nằm RẢI RÁC, không liền kề', ''],
            ['9004', '2001', '45', ''],
            ['9005', '3300', '150', '']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Hash-agg gom 100.000 đơn mà RAM chỉ cần chứa ~20 block — nó giấu 100.000 đơn đi đâu?',
            options: [
              { id: 'a', text: 'Không giấu đâu cả — nó KHÔNG GIỮ đơn: mỗi đơn đọc lên, cộng dồn vào Ô của seller rồi bỏ luôn; trong RAM chỉ sống bảng Ô (mỗi nhóm đúng một dòng tổng)', correct: true, explanation: 'Đúng — on-the-fly nghĩa là "tính ngay trên dòng chảy". Thứ phải vừa RAM là BẢNG Ô, không phải dữ liệu — vì thế 100.000 đơn hay 10 triệu đơn cũng chỉ cần 20 block ô.' },
              { id: 'b', text: 'Nén 100.000 đơn lại còn 20 block', correct: false, explanation: 'Sai — không nén gì cả; đơn được ĐỌC rồi BỎ, chỉ con số cộng dồn ở lại.' },
              { id: 'c', text: 'Ghi tạm các đơn ra đĩa rồi đọc lại sau', correct: false, explanation: 'Sai — đó là kịch bản khi Ô KHÔNG vừa RAM (chia xô ≈3·br); ở đây Ô vừa RAM nên không có lượt ghi tạm nào.' },
              { id: 'd', text: 'Dựa vào index có sẵn trên seller_id', correct: false, explanation: 'Sai — hash-agg không cần index nào; bảng Ô dựng tại chỗ trong RAM lúc quét.' }
            ]
          },
          {
            question: 'AVG(total) tính on-the-fly — mỗi Ô phải giữ gì?',
            options: [
              { id: 'a', text: 'SUM và COUNT đang cộng dồn — đến lúc đổ sổ mới lấy SUM ÷ COUNT', correct: true, explanation: 'Đúng — sách tả đúng cách này: avg không cộng dồn trực tiếp được, nhưng sum và count thì được, và thương của chúng là avg.' },
              { id: 'b', text: 'Toàn bộ danh sách total của nhóm', correct: false, explanation: 'Sai — thế thì hết on-the-fly: nhóm to là RAM ngập; chỉ cần 2 con số cộng dồn là đủ.' },
              { id: 'c', text: 'Chỉ giá trị AVG hiện tại — mỗi đơn mới thì lấy trung bình của (AVG cũ, total mới)', correct: false, explanation: 'Sai — trung bình của trung bình cho kết quả LỆCH (nhóm 3 đơn: avg(avg(a,b), c) ≠ avg(a,b,c)); phải giữ sum + count.' },
              { id: 'd', text: 'MIN và MAX của nhóm', correct: false, explanation: 'Sai — min/max là hai hàm khác; avg cần sum và count.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'SORT-AGG hay HASH-AGG?',
          instruction: 'Mỗi lá bài mô tả một cỗ máy — xếp về đúng bên.',
          xp: 20,
          chips: [
            { id: 's1', label: 'Gom nhóm nằm LIỀN KỀ nhau sau khi xếp cả bảng' },
            { id: 's2', label: 'Kết quả phụ: bảng ra đã CÓ THỨ TỰ theo khóa nhóm' },
            { id: 'h1', label: 'Mỗi dòng nhảy thẳng vào Ô của nhóm, cộng dồn ngay' },
            { id: 'h2', label: 'Bảng Ô vừa RAM là một lượt xong — không sort gì cả' }
          ],
          bins: [
            { id: 's', label: 'SORT-AGG 📚' },
            { id: 'h', label: 'HASH-AGG 🪣' }
          ],
          solution: { s1: 's', s2: 's', h1: 'h', h2: 'h' }
        }
      },
      step_3: {
        mission: 'Lắp 4 trạm của hash-aggregate on-the-fly — có MỘT khối bịa.',
        blocks: [
          { type: 'op', token: 'Hash(seller_id) trỏ thẳng tới Ô của seller trong bảng RAM — seller lạ mặt thì mở Ô mới', slot: 'ag-hash' },
          { type: 'op', token: 'Seq Scan: đọc orders đúng MỘT lượt, từng đơn một — không sort, không index', slot: 'ag-scan' },
          { type: 'op', token: 'Gom HẾT đơn của từng seller vào RAM, đủ bộ rồi mới bắt đầu cộng', slot: 'ag-x' },
          { type: 'op', token: 'Cộng dồn tại chỗ: SUM[Ô] += total, COUNT[Ô] += 1 — rồi BỎ đơn, không giữ lại', slot: 'ag-update' },
          { type: 'op', token: 'Hết kho thì đổ 2.000 Ô ra kết quả — AVG lúc này mới chia SUM ÷ COUNT', slot: 'ag-out' }
        ],
        drop_zones: [
          { id: 'ag-scan', placeholder: 'Trạm 1 — kho 1.000 block chưa trật tự: đọc kiểu gì?', accepts: ['op'], multi: false,
            station: { icon: '📥', label: 'Quét 1 lượt', sub: 'Trạm 1', hint: 'Hash-agg không cần trật tự — đọc kiểu rẻ nhất mà Ticket #43 đã niêm yết.' } },
          { id: 'ag-hash', placeholder: 'Trạm 2 — đơn này thuộc về ai?', accepts: ['op'], multi: false,
            station: { icon: '🪣', label: 'Tìm Ô nhóm', sub: 'Trạm 2', hint: 'Cùng seller thì phải về cùng một chỗ — mà không được sort. Nghe quen chứ (bài 6)?' } },
          { id: 'ag-update', placeholder: 'Trạm 3 — vào tới Ô rồi làm gì với đơn?', accepts: ['op'], multi: false,
            station: { icon: '🧮', label: 'Cộng dồn on-the-fly', sub: 'Trạm 3', hint: 'Giữ Ô, bỏ đơn — bí quyết khiến RAM chỉ cần 20 block.' } },
          { id: 'ag-out', placeholder: 'Trạm 4 — đọc hết 100.000 đơn rồi, kết thúc sao?', accepts: ['op'], multi: false,
            station: { icon: '📤', label: 'Đổ sổ', sub: 'Trạm 4', hint: 'Bảng Ô thành bảng kết quả — và AVG đến giờ mới được tính.' } }
        ],
        expected_sql: 'Seq Scan: đọc orders đúng MỘT lượt, từng đơn một — không sort, không index Hash(seller_id) trỏ thẳng tới Ô của seller trong bảng RAM — seller lạ mặt thì mở Ô mới Cộng dồn tại chỗ: SUM[Ô] += total, COUNT[Ô] += 1 — rồi BỎ đơn, không giữ lại Hết kho thì đổ 2.000 Ô ra kết quả — AVG lúc này mới chia SUM ÷ COUNT',
        expected_zones: {
          'ag-scan': 'Seq Scan: đọc orders đúng MỘT lượt, từng đơn một — không sort, không index',
          'ag-hash': 'Hash(seller_id) trỏ thẳng tới Ô của seller trong bảng RAM — seller lạ mặt thì mở Ô mới',
          'ag-update': 'Cộng dồn tại chỗ: SUM[Ô] += total, COUNT[Ô] += 1 — rồi BỎ đơn, không giữ lại',
          'ag-out': 'Hết kho thì đổ 2.000 Ô ra kết quả — AVG lúc này mới chia SUM ÷ COUNT'
        },
        reveal_strip: true,
        reveal_complete: '💡 BẠN VỪA LẮP xong hash-aggregate on-the-fly: quét 1 lượt → hash tìm Ô → cộng dồn, bỏ đơn → đổ sổ. Khối "gom hết đơn rồi mới cộng" là bịa — giữ hết đơn thì RAM cần cả 1.000 block, phép màu 104ms tắt ngóm; on-the-fly chỉ giữ MỘT Ô mỗi nhóm. Bấm <strong>Chạy Query</strong>.',
        reveal_hints: {
          'ag-scan': 'Trạm 1 mở máy: hash-agg không đòi trật tự, không đòi index — kho 1.000 block thì kiểu đọc nào rẻ nhất bảng giá?',
          'ag-hash': 'Trạm 1 chốt: seq scan 1 lượt, 104ms trọn gói. Đơn đầu tiên lên băng chuyền — thuộc seller 4102: làm sao biết NGĂN nào của nó mà không sort?',
          'ag-update': 'Trạm 2 chốt: hash trỏ thẳng Ô — Ô mới mở nếu seller lạ. Đơn đã đứng trước Ô của mình: xử nó thế nào để RAM không phình?',
          'ag-out': 'Trạm 3 chốt: cộng dồn rồi bỏ đơn — bảng Ô 20 block gánh cả kho. Đơn cuối cùng đã qua: còn việc gì trước khi trả kết quả?'
        }
      },
      step_4: {
        prompt: 'Đóng Ticket #48: viết query <strong>Bảng vàng seller</strong> — doanh thu từng người bán: lấy <code>seller_id</code> và <code>SUM(total)</code> từ <code>orders</code>, gom theo <code>seller_id</code>.',
        schema: {
          table_name: 'orders',
          columns: [
            { name: 'order_id', type: 'INT', key: 'PK' },
            { name: 'seller_id', type: 'INT', key: '🪣 khóa nhóm' },
            { name: 'total', type: 'INT (gem)', key: 'Σ cột tính' }
          ],
          data: [
            ['9001', '4102', '80'],
            ['9002', '2001', '12500'],
            ['9003', '4102', '790'],
            ['9004', '2001', '45'],
            ['9005', '3300', '150'],
            ['9006', '4102', '320']
          ]
        },
        context: {
          scenario: 'Plan mô phỏng: <code>HashAggregate — Seq Scan orders → hash(seller_id) → 2.000 Ô cộng dồn</code>. Bảng demo 6 đơn, 3 seller — trong đó 4102 là seller bị soi ở Ticket #44, doanh thu lịch sử vẫn phải đối soát đủ (tính cả đơn refund).',
          real_world: 'Chạy EXPLAIN trên Postgres sẽ thấy đúng hai cỗ máy của bài này: "HashAggregate" khi Ô vừa work_mem, "GroupAggregate" (sort trước) khi cần thứ tự hoặc Ô quá to. Bảng vàng, dashboard doanh thu, analytics — tất cả đứng trên GROUP BY này.',
          steps: [
            'Hai cột ra bảng: <code>seller_id, SUM(total)</code>.',
            'Nguồn: <code>FROM orders</code>.',
            'Gom nhóm: <code>GROUP BY seller_id</code>.'
          ],
          hint_explore: 'Chạy thử <code>SELECT * FROM orders</code> — thấy đơn của 4102 nằm RẢI RÁC (9001, 9003, 9006, không liền kề): đó chính là lý do phải gom, và là thứ hash-agg xử mà chẳng cần sort.',
          expected: 'Bảng 3 nhóm: 4102 → 1190 · 2001 → 12545 · 3300 → 150.'
        },
        hints: [
          { level: 1, text: 'Khung: <code>SELECT …, SUM(…) FROM orders GROUP BY …;</code>' },
          { level: 2, text: 'Cột gom và cột tính: <code>seller_id</code> và <code>SUM(total)</code>.' },
          { level: 3, text: 'Mọi cột KHÔNG nằm trong hàm tính phải có mặt trong GROUP BY — ở đây là <code>seller_id</code>.' },
          { level: 4, text: '<code class="code">SELECT seller_id, SUM(total) FROM orders GROUP BY seller_id;</code>' }
        ],
        expected_sql: 'SELECT seller_id, SUM(total) FROM orders GROUP BY seller_id;',
        success_message: 'TICKET #48 ĐÓNG — Bảng vàng seller lên sóng, giá đúng một lần quét kho! 🏆 Engine Room đã đi 7/10. Nhìn lại mà xem: sort (bài 4) nuôi merge join VÀ sort-agg; hash (bài 6) nuôi hash join VÀ hash-agg — hai ngón nghề, nửa cái engine. Bài sau đổi góc máy: các toán tử NỐI VỚI NHAU thế nào — ghi tạm ra đĩa hay truyền tay từng dòng? Materialization vs Pipelining, kèm hai hồ sơ Iterator & Blocking.',
        xp_reward: 120
      }
    },

    /* ── nc_08 — Ticket #49 · Materialization vs Pipelining ──
     * PART_6 Bài 8 (Ch 15.7): operator tree; materialized evaluation ghi temp
     * từng tầng; pipelined evaluation truyền tuple sống; 2 lợi ích (bỏ temp I/O
     * + first-result sớm); blocking edge ở mức trực quan (sort 2 pha — chặn GIỮA).
     * KHÔNG dạy sâu: double buffering, double-pipelined join, iterator pseudocode
     * (Card F/G lo demand/producer + blocking chi tiết).
     * Sim renderFlowVisual (user chốt 2026-07-06): 6 món, 2 mode bấm so sánh —
     * mat: temp 6 lượt I/O, dòng đầu nhịp 4/5; pipe: 0 temp, dòng đầu nhịp 1/3. */
    {
      id: 'nc_08', index: 8,
      title: 'Materialization vs Pipelining — nối toán tử kiểu gì?',
      subtitle: 'Ghi bảng tạm từng tầng, hay để tuple chảy sống — cùng cây, khác cả hóa đơn lẫn trải nghiệm',
      module: 7, module_title: 'Engine Room — Query Processing',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'mcq_code',
      drag_map: {
        table: {
          name: 'listings (cây sao kê: scan → σ price<100 → π — mẫu 4)',
          columns: ['listing_id', 'item_name', 'price'],
          dataRows: [
            ['3001', 'Kiếm gỗ Newbie', '45'],
            ['3002', 'Giáp rồng Huyền thoại', '12500'],
            ['3005', 'Khiên gỗ sồi', '80'],
            ['3008', 'Mũ vải thô', '35']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #49',
        hook: 'Trang "Món dưới 100 gem" chạy ĐÚNG — nhưng khách bấm là màn hình <strong>trắng</strong> một nhịp dài rồi mới hiện cả trang. Bên sàn đối thủ, dòng đầu tiên nhảy ra <em>tức thì</em> rồi danh sách dài dần. Cùng dữ liệu, hóa đơn tổng na ná — khác nhau ở thứ chưa bài nào đụng tới: các toán tử trong cây <strong>NỐI với nhau kiểu gì</strong>. Ticket #49: chạy xong tầng dưới rồi mới đưa cả bảng cho tầng trên (ghi tạm), hay rửa xong cái bát nào chuyền tay ngay cái đó (pipeline)?'
      },
      step_1: {
        primer: {
          goal: [
            'Cây toán tử chạy được theo 2 cách nối: MATERIALIZE — mỗi tầng chạy XONG, ghi bảng tạm ra đĩa cho tầng trên đọc lại; PIPELINE — tuple từ tầng dưới truyền THẲNG lên tầng trên, không bảng tạm nào',
            'Pipeline ăn hai đường (sách 15.7.2): bỏ hẳn tiền GHI + ĐỌC temp, và khi root nối pipeline với input thì DÒNG ĐẦU trả về ngay lúc kho còn chưa đọc xong',
            'Không phải toán tử nào cũng chảy được: sort (bài 4) hay pha build của hash (bài 6) là BLOCKING — chưa nuốt hết input chưa nhả nổi dòng nào; nhưng chặn chỉ nằm GIỮA 2 pha của nó, không giết pipeline cả cây'
          ],
          intro: 'Ba người rửa bát: rửa — tráng — úp. Cách 1: người rửa rửa <strong>HẾT chồng</strong> bát, chất đống ra bàn (= ghi tạm ra đĩa), người tráng mới bê cả đống về tráng tiếp. Cách 2: dây chuyền — rửa xong cái nào <strong>chuyền tay</strong> ngay cái đó, khách có bát sạch đầu tiên sau vài giây dù chồng bát còn cao. Engine cũng đứng trước đúng lựa chọn đó với mỗi cạnh của cây toán tử.',
          example: 'Cây sao kê <code>scan → σ price&lt;100 → π</code>: materialize phải ghi 1.204 dòng đậu (~12 block) ra temp rồi π đọc lại — <strong>24 block trả tiền 2 lần</strong>, và user chờ trọn 104ms mới thấy chữ đầu tiên. Pipeline: 0 temp, dòng đầu hiện sau ~4,1ms — ngay khi block đầu của kho được đọc lên.'
        },
        concept_cards: [
          {
            icon: 'fa-arrow-down-wide-short',
            title: 'Hai lợi ích của pipeline — theo đúng sách',
            body: '<strong>①</strong> Xóa khoản đọc + ghi quan hệ tạm: công thức cost các bài trước vốn tính cả tiền đọc input từ đĩa — input được PIPE từ toán tử dưới thì khoản đó gạch bỏ. <strong>②</strong> Kết quả trả SỚM: root nối pipeline với input thì dòng đầu hiện ngay khi được sinh ra — quý vô cùng khi kết quả đang đổ về màn hình người dùng.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 15.7.2 — Pipelining: two benefits'
          },
          {
            icon: 'fa-road-barrier',
            title: 'Cạnh chảy được — cạnh bị chặn',
            body: 'Mỗi CẠNH của cây được dán nhãn: <strong>pipelined edge</strong> (hai đầu chạy đồng thời, tuple sinh ra là bị tiêu thụ ngay) hoặc <strong>blocking/materialized edge</strong>. Cây chia thành các <em>pipeline stage</em> ngăn bởi cạnh chặn — engine chạy từng stage một. Sort là kẻ chặn bẩm sinh: dòng bé nhất có thể nằm CUỐI kho, chưa nhìn hết thì nhả gì cũng liều.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Vì sao <code>LIMIT 10</code> trên trang chợ hiện tức thì? Pipeline + root chỉ đòi 10 dòng — kho 400 block mới đọc được vài block đã đủ trả khách, phần còn lại KHỎI đọc. Nhưng thêm <code>ORDER BY price</code> là sort chặn ngang — muốn 10 dòng rẻ nhất vẫn phải nhìn đủ 40.000 món. Trừ khi… có chiêu Top-K — hồ sơ chờ ở bài 10.'
          }
        ],
        flow_visual: {
          eyebrow: 'MATERIALIZE VS PIPELINE — CÂY scan → σ price<100 → π · 6 MÓN MẪU',
          caption: 'Chạy CẢ HAI chế độ mà so: ghi tạm = 6 lượt temp I/O + dòng đầu mãi nhịp 4; pipeline = 0 temp + dòng đầu ngay nhịp 1 — đúng hai lợi ích sách nêu, nhìn bằng mắt.',
          threshold: 100,
          filter_label: 'σ price < 100',
          items: [
            { label: 'Kiếm', v: 45 }, { label: 'Giáp', v: 12500 }, { label: 'Mũ', v: 35 },
            { label: 'Skin', v: 790 }, { label: 'Khiên', v: 80 }, { label: 'Nhẫn', v: 510 }
          ]
        },
        visual: {
          schema: {
            table_name: 'Cây toán tử sao kê — đọc từ ĐÁY lên',
            columns: [
              { name: 'π item_name, price', type: 'tầng ĐỈNH — trả về user', key: '3' },
              { name: 'σ price < 100', type: 'tầng giữa — lọc từng dòng', key: '2' },
              { name: 'Seq Scan listings', type: 'tầng ĐÁY — kho 400 block', key: '1' }
            ]
          },
          data_preview: [
            ['cạnh scan → σ', 'pipeline', 'tuple đọc lên là xét liền', '0 temp'],
            ['cạnh σ → π', 'pipeline', 'đậu là chuyền tay ngay', '0 temp'],
            ['(nếu ghi tạm)', 'materialized', 'σ xong hết → đổ đĩa → π đọc lại', '+24 block']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Pipeline vừa RẺ hơn vừa cho dòng đầu SỚM hơn materialize — hai khoản lời đó đến từ đâu?',
            options: [
              { id: 'a', text: 'Rẻ: khoản ghi + đọc bảng tạm bị xóa sổ. Sớm: root nhận tuple từ dưới lên NGAY khi nó được sinh ra, không phải chờ tầng dưới chạy xong', correct: true, explanation: 'Đúng cả hai vế — và để ý: tiền đọc KHO thì y nguyên (vẫn 400 block); thứ biến mất là tiền temp và thời gian NGỒI CHỜ.' },
              { id: 'b', text: 'Pipeline nén tuple lại nên truyền nhanh hơn', correct: false, explanation: 'Sai — không nén gì cả; tuple vẫn nguyên, chỉ là nó được CHUYỀN TAY thay vì ghi xuống đĩa rồi đọc lên.' },
              { id: 'c', text: 'Pipeline được bỏ qua bước lọc σ nên ít việc hơn', correct: false, explanation: 'Sai — σ vẫn xét đủ từng dòng; pipeline đổi cách NỐI các toán tử, không bỏ toán tử nào.' },
              { id: 'd', text: 'Pipeline đọc kho ít block hơn nhờ chỉ lấy dòng đậu', correct: false, explanation: 'Sai — muốn biết đậu hay rớt vẫn phải đọc lên đủ; số block đọc KHO của hai cách bằng nhau, khác nhau ở khoản TEMP.' }
            ]
          },
          {
            question: 'Toán tử nào sau đây là BLOCKING — không thể nhả dòng nào khi chưa nuốt hết input?',
            options: [
              { id: 'a', text: 'SORT — dòng bé nhất có thể nằm ở CUỐI kho: chưa nhìn hết mà dám nhả là sai thứ tự', correct: true, explanation: 'Đúng — sort là kẻ chặn bẩm sinh (sách 15.7.2.2). σ, π hay scan đều xử được từng dòng một; sort thì phải thấy đủ mới dám mở miệng.' },
              { id: 'b', text: 'σ — phải gom đủ bảng mới lọc chính xác được', correct: false, explanation: 'Sai — σ xét TỪNG DÒNG độc lập: đậu hay rớt của dòng này chẳng dính gì dòng khác.' },
              { id: 'c', text: 'π — phải thấy mọi dòng mới biết cột nào cần cắt', correct: false, explanation: 'Sai — danh sách cột nằm sẵn trong query; π cắt được ngay trên từng dòng chảy qua.' },
              { id: 'd', text: 'Seq Scan — phải đọc trọn kho rồi mới nhả được', correct: false, explanation: 'Sai — scan nhả từng dòng ngay khi đọc tới; nó chính là đầu nguồn của mọi dòng chảy.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Chảy được — hay bị chặn?',
          instruction: 'Xếp mỗi toán tử về đúng bên của dòng chảy.',
          xp: 20,
          chips: [
            { id: 'p1', label: 'σ lọc — xét từng dòng, đậu là nhả liền' },
            { id: 'p2', label: 'π chọn cột — nhận dòng nào cắt dòng đó' },
            { id: 'b1', label: 'Sort — dòng bé nhất có thể nằm CUỐI kho' },
            { id: 'b2', label: 'Hash join pha BUILD — chưa nạp hết bảng nhỏ chưa probe được' }
          ],
          bins: [
            { id: 'p', label: 'PIPELINE ⚡' },
            { id: 'b', label: 'BLOCKING 🚧' }
          ],
          solution: { p1: 'p', p2: 'p', b1: 'b', b2: 'b' }
        }
      },
      step_3: {
        mission: 'Lắp dây chuyền pipeline kéo-từ-đỉnh cho câu sao kê — có MỘT khối bịa.',
        blocks: [
          { type: 'op', token: 'σ xét NGAY tuple vừa nhận: rớt thì hỏi xin tuple kế, đậu thì chuyền lên trên', slot: 'fl-filter' },
          { type: 'op', token: 'Scan không tự chạy — được HỎI (next) mới đọc và nhả tuple kế, tự nhớ mình đang đứng ở đâu', slot: 'fl-scan' },
          { type: 'op', token: 'Mỗi toán tử chạy XONG toàn bộ phần mình, ghi bảng tạm ra đĩa cho tầng trên đọc lại', slot: 'fl-x' },
          { type: 'op', token: 'π cắt cột ngay trên dòng chảy — không chờ gom đủ bảng', slot: 'fl-project' },
          { type: 'op', token: 'Root trả dòng ĐẦU cho user khi cả kho còn chưa đọc xong — không tốn một block temp nào', slot: 'fl-out' }
        ],
        drop_zones: [
          { id: 'fl-scan', placeholder: 'Tầng đáy — nguồn của mọi dòng chảy hoạt động sao?', accepts: ['op'], multi: false,
            station: { icon: '📥', label: 'Scan lười', sub: 'Tầng 1', hint: 'Trong dây chuyền kéo-từ-đỉnh, không ai tự làm việc — kể cả kẻ giữ kho.' } },
          { id: 'fl-filter', placeholder: 'Tầng giữa — σ đứng trên dòng chảy làm gì?', accepts: ['op'], multi: false,
            station: { icon: '🔍', label: 'σ trên dòng chảy', sub: 'Tầng 2', hint: 'Từng dòng một: rớt thì làm gì tiếp, đậu thì làm gì tiếp?' } },
          { id: 'fl-project', placeholder: 'Tầng kế — π có cần chờ đủ bảng không?', accepts: ['op'], multi: false,
            station: { icon: '✂️', label: 'π cắt cột sống', sub: 'Tầng 3', hint: 'Danh sách cột nằm sẵn trong query — vậy π cần thấy bao nhiêu dòng để bắt đầu?' } },
          { id: 'fl-out', placeholder: 'Đỉnh cây — user thấy gì, từ lúc nào?', accepts: ['op'], multi: false,
            station: { icon: '🖥️', label: 'Root trả sớm', sub: 'Đỉnh', hint: 'Lợi ích thứ hai của pipeline — thứ làm trang đối thủ "hiện chữ tức thì".' } }
        ],
        expected_sql: 'Scan không tự chạy — được HỎI (next) mới đọc và nhả tuple kế, tự nhớ mình đang đứng ở đâu σ xét NGAY tuple vừa nhận: rớt thì hỏi xin tuple kế, đậu thì chuyền lên trên π cắt cột ngay trên dòng chảy — không chờ gom đủ bảng Root trả dòng ĐẦU cho user khi cả kho còn chưa đọc xong — không tốn một block temp nào',
        expected_zones: {
          'fl-scan': 'Scan không tự chạy — được HỎI (next) mới đọc và nhả tuple kế, tự nhớ mình đang đứng ở đâu',
          'fl-filter': 'σ xét NGAY tuple vừa nhận: rớt thì hỏi xin tuple kế, đậu thì chuyền lên trên',
          'fl-project': 'π cắt cột ngay trên dòng chảy — không chờ gom đủ bảng',
          'fl-out': 'Root trả dòng ĐẦU cho user khi cả kho còn chưa đọc xong — không tốn một block temp nào'
        },
        reveal_strip: true,
        reveal_complete: '💡 BẠN VỪA NỐI xong dây chuyền pipeline: scan lười → σ trên dòng chảy → π cắt sống → root trả sớm. Khối "chạy xong, ghi bảng tạm" KHÔNG bịa về khái niệm — nó chính là MATERIALIZE — nhưng lắp vào dây chuyền này là phá sạch cả hai khoản lời. Bấm <strong>Chạy Query</strong>.',
        reveal_hints: {
          'fl-scan': 'Tầng 1 — dây chuyền này KÉO từ đỉnh: mọi toán tử chỉ làm việc khi bị hỏi. Vậy kẻ giữ kho ở đáy hành xử thế nào?',
          'fl-filter': 'Tầng 1 chốt: scan nhả từng tuple khi được hỏi. Tuple đầu tiên (Kiếm 45) vừa lên tới σ — nó xử ngay hay đợi gom đủ?',
          'fl-project': 'Tầng 2 chốt: σ xét liền từng dòng, đậu thì chuyền. Tới lượt π — danh sách cột có sẵn trong query, nó cần chờ gì không?',
          'fl-out': 'Tầng 3 chốt: π cắt cột ngay trên dòng chảy. Trên cùng là user đang nhìn màn hình — pipeline hứa với họ điều gì mà materialize không hứa nổi?'
        }
      },
      step_4: {
        prompt: '<strong>Ticket #49 — đọc cây mà đoán trải nghiệm:</strong> khách xem "món dưới 100 gem, RẺ NHẤT xếp trước". Plan: <code>1. Seq Scan listings → 2. Filter price&lt;100 → 3. SORT BY price → 4. Output</code>. Dòng chảy trong cây này thực sự trông ra sao?',
        challenge_type: 'mcq_code',
        options: [
          {
            text: 'Scan → Filter chảy thẳng vào pha TẠO-RUN của sort; chặn nằm giữa tạo-run và merge; pha merge lại chảy tiếp lên Output — nhưng dòng đầu chỉ hiện SAU khi đọc hết kho',
            correct: true
          },
          {
            text: 'Cả cây chảy tuốt từ đáy lên đỉnh — có sort hay không thì dòng đầu vẫn hiện ngay tức thì',
            correct: false,
            explain: 'Sai — món rẻ nhất có thể nằm ở block CUỐI kho: sort mà nhả dòng khi chưa nhìn hết input là trả sai thứ tự. Sort là blocking bẩm sinh.'
          },
          {
            text: 'Có sort trong cây là mọi cạnh phải materialize: σ cũng ghi temp, π cũng ghi temp, từng tầng một',
            correct: false,
            explain: 'Sai — chặn của sort là chuyện CỤC BỘ giữa 2 pha của nó; σ vẫn pipe thẳng vào pha tạo-run, merge vẫn pipe lên Output. Blocking không lây cả cây.'
          },
          {
            text: 'Tăng work_mem đủ lớn thì sort hết blocking — dòng đầu lại hiện ngay như thường',
            correct: false,
            explain: 'Sai — RAM to giúp ÍT pass hơn (bài 4), nhưng bản chất không đổi: chưa nhìn hết input thì không ai biết dòng bé nhất là dòng nào.'
          }
        ],
        schema: {
          table_name: 'plan — Món <100 gem, rẻ nhất xếp trước',
          columns: [
            { name: 'Output item_name, price', type: 'đỉnh', key: '4' },
            { name: 'SORT BY price', type: '2 pha: tạo-run ‖ merge', key: '3' },
            { name: 'Filter price < 100', type: 'trên dòng chảy', key: '2' },
            { name: 'Seq Scan listings', type: 'kho 400 block', key: '1' }
          ],
          data: [
            ['cạnh 1→2', 'pipeline', 'đọc tới đâu xét tới đó'],
            ['cạnh 2→3', 'pipeline (vào pha tạo-run)', 'dòng đậu chảy vào run'],
            ['TRONG sort', '🚧 BLOCKING', 'tạo-run xong hết mới merge'],
            ['cạnh 3→4', 'pipeline (từ pha merge)', 'nhả dần theo thứ tự']
          ]
        },
        context: {
          scenario: 'Đây chính là cây của sim Step 1 cộng thêm một tầng SORT. Câu hỏi ăn tiền: chặn nằm Ở ĐÂU — cả cây, hay chỉ một khớp nối? Vẽ được ranh giới đó là bạn đọc plan như DBA.',
          real_world: 'Vì lẽ này mà dashboard có ORDER BY luôn "khựng rồi hiện cả cụm", còn feed cuộn vô tận (không sort toàn cục) hiện dòng đầu tức thì. Người thiết kế API phân trang chọn keyset pagination cũng là đang né kẻ chặn này.',
          steps: [
            'σ và π có blocking không? — Không, chúng xử từng dòng.',
            'Sort có nhả sớm được không? — Không: dòng bé nhất có thể nằm cuối kho.',
            'Chặn của sort nằm ở đâu? — GIỮA 2 pha: tạo-run (nhận dòng chảy vào) ‖ merge (nhả dòng chảy ra).',
            'work_mem có đổi bản chất blocking không? — Không, chỉ đổi số pass.'
          ],
          hint_explore: 'Xem lại sim bài 4: nút "Nạp & sort" (tạo run) phải bấm ĐỦ 4 lần rồi nút merge mới xuất hiện — ranh giới 2 pha nằm đúng chỗ đó.',
          expected: 'Chọn phương án "chặn nằm giữa tạo-run và merge, hai đầu vẫn chảy".'
        },
        hints: [
          { level: 1, text: 'Xét từng CẠNH của cây: scan→filter, filter→sort, sort→output — cạnh nào hai đầu chạy đồng thời được?' },
          { level: 2, text: 'Sort có 2 pha (bài 4): tạo-run và merge. Pha nào nhận được dòng chảy VÀO? Pha nào nhả được dòng chảy RA?' },
          { level: 3, text: 'Blocking của sort không lây: nó chỉ là một RANH GIỚI giữa 2 pipeline stage. Còn "tăng RAM hết blocking" — bài 4 nói RAM to đổi cái gì?' },
          { level: 4, text: 'Đáp án: dòng chảy sống ở cả hai đầu, chặn nằm GIỮA 2 pha của sort — vì thế dòng đầu chỉ hiện sau khi kho được đọc trọn.' }
        ],
        success_message: 'TICKET #49 ĐÓNG — giờ bạn nhìn cây plan là thấy cả DÒNG CHẢY lẫn chỗ NGHẼN! ⚡ Hai hồ sơ kỹ thuật đang chờ bên dưới: Iterator (bộ ba open/next/close vận hành cú "kéo từ đỉnh") và Blocking Operator (vì sao kẻ chặn không giết cả cây). Rồi bài sau lên tầng cao nhất của module: OPTIMIZER tự viết lại query của dev — cùng kết quả, hóa đơn rẻ gấp mấy lần.',
        xp_reward: 120
      },
      concept_cards_after: ['nc_card_iterator', 'nc_card_blocking']
    },

    /* ── nc_09 — Ticket #50 · Optimizer: Pushdown, Join Reorder & né Cartesian ──
     * PART_6 Bài 9 (Ch 16.1-16.2): equivalence rules → optimizer VIẾT LẠI biểu
     * thức (map ví dụ Music sang GameHub); mục tiêu = intermediate result;
     * σ/π pushdown; join giao hoán/kết hợp; né tích Descartes. KHÔNG dạy sâu:
     * đủ 16 luật, outer-join rules, null-rejecting. Số canonical: 2.000 seller,
     * 20 món/seller, 2,5 đơn/món → σ 1 → ⋈ 20 → ⋈ 50 (vs vụng ~200.000 trung
     * gian; cartesian 80 triệu). step-4 fill_blank 1/20/50. */
    {
      id: 'nc_09', index: 9,
      title: 'Optimizer viết lại query — pushdown, đảo join, né Descartes',
      subtitle: 'Luật tương đương cho optimizer quyền đảo cây: cùng kết quả, trung gian teo từ 200.000 xuống 71 dòng',
      module: 7, module_title: 'Engine Room — Query Processing',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'fill_blank',
      drag_map: {
        table: {
          name: 'sellers (2.000 shop ≈ 20 block — bảng bé nhất, mẫu 3)',
          columns: ['seller_id', 'seller_name', 'joined'],
          dataRows: [
            ['2001', 'DragonForge', '2024'],
            ['3300', 'MysticVault', '2025'],
            ['4102', 'ShadowTrader (banned)', '2023']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #50',
        hook: 'Trang "gian hàng DragonForge" chậm ì ạch. Dev viết query kiểu thấy sao nối vậy: <code>orders ⋈ listings ⋈ sellers</code> rồi MỚI lọc <code>seller_name = \'DragonForge\'</code> ở cuối. DBA được gọi tới… không sửa một chữ SQL nào — chỉ mở EXPLAIN: engine đã <strong>tự viết lại</strong> biểu thức từ đời nào, lọc được đẩy xuống tận đáy. Ticket #50: học bộ luật cho phép optimizer đảo cây mà dám CAM KẾT kết quả y hệt — và con số nó săn lùng từng dòng: <strong>intermediate result</strong>.'
      },
      step_1: {
        primer: {
          goal: [
            'Đại số quan hệ có LUẬT TƯƠNG ĐƯƠNG: hai biểu thức khác hình nhưng cam kết cùng tập kết quả — optimizer dựa vào đó để viết lại query, dev không cần xin phép',
            'Mục tiêu săn lùng là INTERMEDIATE RESULT: σ đẩy xuống sát bảng nguồn (điều kiện đụng bảng nào lọc ngay bảng đó), π cắt cột thừa sớm — tầng trên chỉ khiêng thứ cần khiêng',
            'Join giao hoán + kết hợp → được ĐẢO thứ tự: xuất phát từ bảng-sau-lọc NHỎ nhất; và tuyệt đối né tích Descartes — ghép 2 bảng không có điều kiện nối là nhân bùng số dòng'
          ],
          intro: 'Tìm "mọi đơn hàng của shop DragonForge" trong chợ 100.000 đơn. Cách vụng: ghép TẤT CẢ đơn với TẤT CẢ món với TẤT CẢ shop thành một núi giấy, rồi mới soi tên shop — núi trung gian ~200.000 dòng để giữ lại 50. Cách của optimizer: tìm shop TRƯỚC (1 dòng), lần ra 20 món của shop, rồi mới kéo 50 đơn — chưa tầng nào phải khiêng quá trăm dòng. Cùng kết quả, khác nhau là thứ nằm GIỮA các phép toán.',
          example: 'Mật độ chợ: 40.000 món ÷ 2.000 shop = <strong>20 món/shop</strong> · 100.000 đơn ÷ 40.000 món = <strong>2,5 đơn/món</strong>. Cây sau biến đổi: σ sellers → <strong>1</strong> → ⋈ listings → <strong>20</strong> → ⋈ orders → <strong>50</strong>. Còn lỡ QUÊN điều kiện nối sellers–listings? Tích Descartes 2.000 × 40.000 = <strong>80 TRIỆU</strong> dòng trung gian.'
        },
        concept_cards: [
          {
            icon: 'fa-scale-balanced',
            title: 'Luật tương đương — giấy phép của optimizer',
            body: 'Điều kiện lọc chỉ đụng MỘT bảng thì σ được đẩy xuyên qua join xuống sát bảng đó; π được đẩy theo để cắt cột thừa; join đổi chỗ, đổi nhóm thoải mái. Mỗi luật là một phép biến hình <strong>bảo toàn kết quả</strong> — ví dụ trong sách: lọc khoa Music đẩy xuống trước khi ⋈ teaches, y đúc bài toán DragonForge của ta.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 16.2.1-16.2.2 — Equivalence Rules & Examples of Transformations'
          },
          {
            icon: 'fa-arrow-down-1-9',
            title: 'Join order & cú né Descartes',
            body: 'Cùng 3 bảng có nhiều cách xếp lịch ghép — optimizer chọn lịch cho trung gian NHỎ nhất: xuất phát từ bảng-sau-lọc bé nhất (sellers còn 1 dòng) rồi mới lan ra. Và luật sắt: hai bảng KHÔNG có điều kiện nối thì đừng ghép trực tiếp — sellers × listings trần trụi = 80 triệu dòng, chưa kịp lọc đã sập.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Đọc EXPLAIN thấy Filter nằm SÂU dưới đáy dù bạn viết WHERE ở cuối câu — đừng hoảng, đó là pushdown đang làm việc. Nhưng optimizer không phải thánh: nhét điều kiện vào hàm (<code>WHERE UPPER(name)=…</code>) hay OR chằng chịt là nó bó tay không đẩy nổi. Còn câu hỏi treo lơ lửng: nó lấy đâu ra "1 dòng, 20 món" khi CHƯA chạy? Bài 10 mở sổ thống kê.'
          }
        ],
        plan_visual: {
          query: "SELECT l.item_name, o.total\nFROM sellers s JOIN listings l ON s.seller_id = l.seller_id\n              JOIN orders o ON l.listing_id = o.listing_id\nWHERE s.seller_name = 'DragonForge';",
          caption: 'Cùng một query — optimizer viết lại cây bên phải: σ tụt xuống đáy, join đảo lại xuất phát từ 1 dòng. Nhìn con số trên các mũi tên: đó chính là intermediate result mà nó săn lùng. (Hóa đơn ms là ước lượng minh họa, gồm cả bảng tạm.)',
          price: {
            seek_ms: 4, block_ms: 0.1,
            note: 'sellers 2.000 ≈ 20 block · listings 40.000 ≈ 400 · orders 100.000 ≈ 1.000 · mật độ 20 món/shop, 2,5 đơn/món.'
          },
          trees: [
            {
              name: 'Cây VỤNG — như dev viết',
              chosen: false,
              note: 'Join hết 3 bảng rồi mới lọc — hai tầng trung gian ~200.000 dòng',
              io: { access: 'seq', seeks: 10, blocks: 5400 },
              nodes: [
                { op: 'orders ⋈ listings', kind: 'join', detail: 'ghép TOÀN SÀN trước', rows: '100.000 dòng ghép' },
                { op: '⋈ sellers', kind: 'join', detail: 'đèo thêm tên shop cho cả sàn', rows: '100.000 dòng' },
                { op: "σ seller_name = 'DragonForge'", kind: 'filter', detail: 'lọc CUỐI CÙNG mới làm', rows: '50 đơn' },
                { op: 'π item_name, total', kind: 'project', rows: '50 dòng' }
              ]
            },
            {
              name: 'Sau PUSHDOWN + REORDER',
              chosen: true,
              note: '✓ Cây EXPLAIN thật — trung gian cả thảy 71 dòng',
              io: { access: 'seq', seeks: 4, blocks: 1430 },
              nodes: [
                { op: "σ seller_name (sellers)", kind: 'filter', detail: 'lọc TRƯỚC TIÊN — 2.000 shop còn 1', rows: '1 dòng' },
                { op: '⋈ listings', kind: 'join', detail: 'chỉ món của shop này', rows: '20 món' },
                { op: '⋈ orders', kind: 'join', detail: 'chỉ đơn của 20 món đó', rows: '50 đơn' },
                { op: 'π item_name, total', kind: 'project', rows: '50 dòng' }
              ]
            }
          ]
        },
        visual: {
          schema: {
            table_name: 'Ba bảng của trận này',
            columns: [
              { name: 'sellers', type: '2.000 shop ≈ 20 block', key: 'σ đậu 1' },
              { name: 'listings', type: '40.000 món ≈ 400 block', key: '20 món/shop' },
              { name: 'orders', type: '100.000 đơn ≈ 1.000 block', key: '2,5 đơn/món' }
            ]
          },
          data_preview: [
            ['cây vụng', '⋈⋈ rồi σ', 'trung gian ~200.000 dòng', '~580 ms'],
            ['sau biến đổi', 'σ rồi ⋈⋈', 'trung gian 1 + 20 + 50 = 71 dòng', '~159 ms'],
            ['quên điều kiện nối', 'sellers × listings', '80.000.000 dòng', '💀']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Optimizer lấy QUYỀN gì mà dám đảo tung cây phép toán do dev viết — không hỏi lấy một câu?',
            options: [
              { id: 'a', text: 'Luật tương đương của đại số quan hệ: mỗi phép biến đổi đều được chứng minh bảo toàn tập kết quả — cây khác hình, kết quả CAM KẾT y hệt', correct: true, explanation: 'Đúng — SQL là ngôn ngữ KHAI BÁO: dev tả thứ mình muốn, còn "làm thế nào" thuộc toàn quyền engine, miễn kết quả đúng.' },
              { id: 'b', text: 'Nó chạy thử cả hai cây trên dữ liệu thật rồi giữ cây nhanh hơn', correct: false, explanation: 'Sai — bài học từ Ticket #42 vẫn nguyên: optimizer cân bằng THỐNG KÊ, không chạy thử; chạy thử cây vụng một lần là đã trả trọn giá đắt rồi.' },
              { id: 'c', text: 'Nó chỉ dám đảo khi hai cây cho kết quả gần giống nhau', correct: false, explanation: 'Sai — "gần giống" không tồn tại trong từ điển này: luật tương đương đòi Y HỆT tuyệt đối, khác một dòng cũng không được dùng.' },
              { id: 'd', text: 'Quyền do dev cấp qua hint trong câu SQL', correct: false, explanation: 'Sai — hint (ở vài hệ) chỉ là lời khuyên thêm; quyền viết lại có sẵn từ bản chất khai báo của SQL, không cần ai cấp.' }
            ]
          },
          {
            question: 'Dev sửa query, lỡ tay XÓA điều kiện nối giữa sellers và listings. Chuyện gì xảy ra ở tầng ghép đó?',
            options: [
              { id: 'a', text: 'Tích Descartes: MỖI shop ghép với MỌI món — 2.000 × 40.000 = 80 triệu dòng trung gian, chưa kịp lọc đã ngộp', correct: true, explanation: 'Đúng — thiếu điều kiện nối thì join thành phép NHÂN. Optimizer luôn xếp lịch để né Descartes, còn dev thì đừng tự tạo ra nó.' },
              { id: 'b', text: 'Engine báo lỗi cú pháp ngay, không chạy', correct: false, explanation: 'Sai — về cú pháp nó HỢP LỆ một cách nguy hiểm: engine sẽ ngoan ngoãn ghép chéo đủ 80 triệu tổ hợp.' },
              { id: 'c', text: 'Optimizer tự đoán điều kiện nối đúng rồi thêm vào', correct: false, explanation: 'Sai — optimizer chỉ BIẾN ĐỔI tương đương thứ bạn viết; tự bịa thêm điều kiện là đổi kết quả, vượt quyền của nó.' },
              { id: 'd', text: 'Không sao — số dòng vẫn thế, chỉ chậm hơn chút', correct: false, explanation: 'Sai — join có điều kiện giữ ~1 cặp đúng cho mỗi dòng; bỏ điều kiện là NHÂN số dòng: 80 triệu so với 40.000.' }
            ]
          }
        ],
        mini_game: {
          type: 'order',
          title: 'Tay nghề optimizer: biến cây vụng thành cây khôn',
          instruction: 'Kéo 5 nước biến đổi vào đúng thứ tự.',
          xp: 20,
          items: [
            { id: 'r4', label: 'Join tiếp 20 món với orders — trung gian chỉ 50 đơn' },
            { id: 'r1', label: 'Nhận cây nguyên bản của dev: σ seller_name nằm tít trên đỉnh' },
            { id: 'r3', label: 'Đảo join order: sellers-đã-lọc (1 dòng) ⋈ listings trước tiên' },
            { id: 'r5', label: 'π đẩy xuống: chỉ khiêng item_name, total lên các tầng trên' },
            { id: 'r2', label: 'Đẩy σ seller_name xuyên qua các join, xuống sát bảng sellers' }
          ],
          solution: { r1: 1, r2: 2, r3: 3, r4: 4, r5: 5 }
        }
      },
      step_3: {
        mission: 'Ra 4 nước biến đổi của optimizer cho trận DragonForge — có MỘT khối bịa.',
        blocks: [
          { type: 'op', token: 'Chọn điểm xuất phát join: bảng-sau-lọc NHỎ nhất (1 dòng) cầm đầu — trung gian teo theo nó', slot: 'op-order' },
          { type: 'op', token: 'Đẩy σ seller_name xuyên xuống sát sellers — điều kiện chỉ đụng 1 bảng thì lọc ngay tại bảng đó', slot: 'op-push' },
          { type: 'op', token: 'Muốn đảo thứ tự join phải xin phép dev — đảo bừa là đổi kết quả trả về', slot: 'op-x' },
          { type: 'op', token: 'π đẩy xuống: cắt cột thừa ngay từ tầng thấp — tầng trên khỏi khiêng cột không ai cần', slot: 'op-proj' },
          { type: 'op', token: 'Chỉ ghép cặp bảng CÓ điều kiện nối — thiếu nó là tích Descartes 80 triệu dòng', slot: 'op-cart' }
        ],
        drop_zones: [
          { id: 'op-push', placeholder: 'Nước đi 1 — σ đang ngồi trên đỉnh cây, xử sao?', accepts: ['op'], multi: false,
            station: { icon: '⬇️', label: 'Đẩy σ xuống', sub: 'Nước đi 1', hint: 'Điều kiện seller_name chỉ dính dáng tới đúng MỘT bảng — vậy chỗ đứng hợp lý của nó ở đâu?' } },
          { id: 'op-order', placeholder: 'Nước đi 2 — ba bảng, ghép từ đâu trước?', accepts: ['op'], multi: false,
            station: { icon: '🎬', label: 'Chọn join order', sub: 'Nước đi 2', hint: 'Bài 5 dạy outer nhỏ cầm trịch — giờ có một "bảng" chỉ còn đúng 1 dòng.' } },
          { id: 'op-proj', placeholder: 'Nước đi 3 — còn cắt gọt được gì nữa?', accepts: ['op'], multi: false,
            station: { icon: '✂️', label: 'π cắt cột sớm', sub: 'Nước đi 3', hint: 'σ cắt DÒNG thừa — còn ai chuyên cắt CỘT thừa?' } },
          { id: 'op-cart', placeholder: 'Nước đi 4 — luật sắt khi xếp lịch ghép?', accepts: ['op'], multi: false,
            station: { icon: '🚧', label: 'Né Descartes', sub: 'Nước đi 4', hint: 'Hai bảng không có sợi dây nối nào mà ghép trực tiếp thì ra bao nhiêu tổ hợp?' } }
        ],
        expected_sql: 'Đẩy σ seller_name xuyên xuống sát sellers — điều kiện chỉ đụng 1 bảng thì lọc ngay tại bảng đó Chọn điểm xuất phát join: bảng-sau-lọc NHỎ nhất (1 dòng) cầm đầu — trung gian teo theo nó π đẩy xuống: cắt cột thừa ngay từ tầng thấp — tầng trên khỏi khiêng cột không ai cần Chỉ ghép cặp bảng CÓ điều kiện nối — thiếu nó là tích Descartes 80 triệu dòng',
        expected_zones: {
          'op-push': 'Đẩy σ seller_name xuyên xuống sát sellers — điều kiện chỉ đụng 1 bảng thì lọc ngay tại bảng đó',
          'op-order': 'Chọn điểm xuất phát join: bảng-sau-lọc NHỎ nhất (1 dòng) cầm đầu — trung gian teo theo nó',
          'op-proj': 'π đẩy xuống: cắt cột thừa ngay từ tầng thấp — tầng trên khỏi khiêng cột không ai cần',
          'op-cart': 'Chỉ ghép cặp bảng CÓ điều kiện nối — thiếu nó là tích Descartes 80 triệu dòng'
        },
        reveal_strip: true,
        reveal_complete: '💡 BẠN VỪA RA trọn 4 nước của optimizer: σ tụt đáy → 1 dòng cầm đầu join → π cắt cột sớm → tuyệt không Descartes. Khối "xin phép dev" là bịa — luật tương đương CHÍNH LÀ giấy phép: cây đổi hình, kết quả cam kết y hệt, dev thậm chí không hay biết. Bấm <strong>Chạy Query</strong>.',
        reveal_hints: {
          'op-push': 'Nước đi 1 — cây vụng đang khiêng 100.000 dòng lên tận đỉnh chỉ để vứt gần hết. Điều kiện seller_name vốn chỉ đụng MỘT bảng: nước đi hiển nhiên là gì?',
          'op-order': 'Nước đi 1 chốt: σ nằm sát sellers, 2.000 shop còn đúng 1 dòng. Ba bảng chờ ghép — kẻ nào xứng đáng cầm đầu lịch join?',
          'op-proj': 'Nước đi 2 chốt: 1 dòng cầm trịch, trung gian 20 rồi 50. σ đã cắt DÒNG thừa — còn chiều ngang của bảng thì ai cắt?',
          'op-cart': 'Nước đi 3 chốt: chỉ khiêng 2 cột cần thiết. Nước cuối — treo luật sắt của việc xếp lịch ghép: cặp bảng nào KHÔNG BAO GIỜ được ghép trực tiếp?'
        }
      },
      step_4: {
        prompt: '<strong>Ticket #50 — tự làm optimizer:</strong> điền 3 con số intermediate result của cây SAU biến đổi. (Số viết liền, ví dụ <code>20</code>.)',
        challenge_type: 'fill_blank',
        template: "-- QUERY: don cua cac mon thuoc seller 'DragonForge'\n-- MAT DO CHO: 40.000 mon / 2.000 shop = 20 mon/shop\n--             100.000 don / 40.000 mon = 2,5 don/mon\n\n-- CAY SAU PUSHDOWN + REORDER:\nσ seller_name = 'DragonForge' (sellers 2.000 shop)   ->  ____ dong\n⋈ listings   (moi shop trung binh 20 mon)            ->  ____ mon\n⋈ orders     (moi mon trung binh 2,5 don)            ->  ____ don",
        blanks: [
          { id: 'b1', hint: '? dòng', expected: '1' },
          { id: 'b2', hint: '? món', expected: '20' },
          { id: 'b3', hint: '? đơn', expected: '50' }
        ],
        schema: {
          table_name: 'chợ GameHub — 3 bảng',
          columns: [
            { name: 'sellers', type: '2.000 shop', key: 'σ tên shop' },
            { name: 'listings', type: '40.000 món', key: '20 món/shop' },
            { name: 'orders', type: '100.000 đơn', key: '2,5 đơn/món' }
          ],
          data: [
            ['cây vụng', 'trung gian ~200.000 dòng', '~580 ms'],
            ['cây sau biến đổi', 'trung gian 71 dòng', '~159 ms'],
            ['quên điều kiện nối', '80.000.000 dòng', '💀']
          ]
        },
        context: {
          scenario: 'Đây là bản nháp optimizer ước lượng cây sau biến đổi — meter trung gian xẹp từ ~200.000 xuống 71 dòng mà kết quả y hệt. Để ý: cả ba con số đều tính ra từ MẬT ĐỘ, chưa hề chạy query.',
          real_world: 'Postgres làm màn này với mọi query bạn gửi — EXPLAIN sẽ thấy Filter nằm sâu dưới đáy plan dù WHERE viết ở cuối câu. Giới data gọi chung là predicate pushdown: Spark, Parquet, Elasticsearch đều học lại bài này của RDBMS.',
          steps: [
            'σ tên shop trên 2.000 shop, tên là duy nhất → còn mấy dòng?',
            'Mỗi shop trung bình 20 món → 1 shop kéo ra bao nhiêu món?',
            'Mỗi món trung bình 2,5 đơn → 20 món kéo ra bao nhiêu đơn?'
          ],
          hint_explore: 'Nhân dây chuyền: 1 → ×20 → ×2,5. Meter trung gian của cây vụng để so: 100.000 + 100.000.',
          expected: 'σ = 1 · ⋈ listings = 20 · ⋈ orders = 50.'
        },
        hints: [
          { level: 1, text: 'seller_name là định danh shop — lọc trên 2.000 shop còn lại bao nhiêu?' },
          { level: 2, text: 'Mật độ 20 món/shop: 1 shop × 20.' },
          { level: 3, text: 'Mật độ 2,5 đơn/món: 20 món × 2,5.' },
          { level: 4, text: 'σ = <code>1</code> · ⋈ listings = <code>20</code> · ⋈ orders = <code>50</code>.' }
        ],
        success_message: 'TICKET #50 ĐÓNG — bạn vừa đảo cây y như optimizer, trung gian teo 2.800 lần! ⚡ Nhưng còn một bí mật chưa khui: nó lấy đâu ra "20 món/shop, 2,5 đơn/món" khi CHƯA chạy query? Bài cuối module mở cuốn sổ quyền lực nhất engine: STATISTICS & HISTOGRAMS — nơi cost-based optimizer đọc tương lai, và lệnh EXPLAIN cho bạn đọc ké. Kèm hai hồ sơ: Histogram & ANALYZE, Top-K.',
        xp_reward: 120
      }
    },

    /* ── nc_10 — Ticket #51 · Cost-Based Optimizer: Statistics, Histograms,
     * EXPLAIN & Materialized Views — KHÉP MODULE 7 ──
     * PART_6 Bài 10 (Ch 16.3-16.5): catalog stats (n dòng/block/distinct);
     * histogram > uniform assumption (16.3.1 equi-width vs equi-depth); CBO so
     * nhiều plan; EXPLAIN; materialized view cho dashboard. KHÔNG dạy sâu: công
     * thức size-estimation chi tiết, dynamic programming, MV maintenance.
     * Visual = renderHistVisual (user chốt 2026-07-06); bins canonical orders.total:
     * 30.000/40.000/15.000/10.000/4.980/20 (Σ=100.000) · hòa vốn 25 · đoán đều
     * 16.667 · cột bị bọc → default ⅓ ≈ 33.333. step-4 bug_fix (total + 0 → guard
     * pending khi chạy thử; sửa xong chạy thật). Trophy MARKETPLACE v1.0 tại bài 10. */
    {
      id: 'nc_10', index: 10,
      title: 'Cost-Based Optimizer — sổ thống kê, EXPLAIN & materialized view',
      subtitle: 'Optimizer đọc tương lai bằng histogram — sổ mù là plan vụng: 20 đơn mà phải Seq Scan cả kho',
      module: 7, module_title: 'Engine Room — Query Processing',
      estimated_minutes: 22, xp_reward: 140,
      drag_type: 'chip',
      challenge_type: 'bug_fix',
      drag_map: {
        table: {
          name: 'orders (100.000 đơn — mẫu 5, có 2 đơn whale ≥10k)',
          columns: ['order_id', 'buyer_id', 'total'],
          dataRows: [
            ['9001', '88', '80'],
            ['9002', '88', '12500'],
            ['9004', '88', '790'],
            ['9010', '707', '15800'],
            ['9005', '707', '45']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #51',
        hook: 'Ticket #50 đóng xong, đội vận hành truy đến cùng: <em>"optimizer phán 1 dòng, 20 món, 50 đơn — nó BÓI ở đâu ra khi chưa chạy?"</em>. DBA mở két: bên trong catalog có một cuốn <strong>SỔ THỐNG KÊ</strong> — bao nhiêu dòng, bao nhiêu block, bao nhiêu giá trị khác nhau, và một chiếc <strong>histogram</strong> chia kho theo khoảng giá. Đúng lúc đó, tai nạn ập vào: báo cáo "đơn whale ≥10.000 gem" — cả kho chỉ có <strong>20 đơn</strong> như thế — lại chạy Seq Scan đủng đỉnh 104ms, EXPLAIN khoe estimate <strong>33.333 dòng</strong>?! Ticket #51, vé cuối của Engine Room: học đọc sổ, đọc EXPLAIN — và gỡ mù cho optimizer.'
      },
      step_1: {
        primer: {
          goal: [
            'CBO không chạy thử: nó tra CATALOG STATISTICS — n dòng, n block, n distinct — và HISTOGRAM phân bố giá trị để ƯỚC số dòng mỗi plan phải khiêng, rồi gắn giá bằng bảng giá I/O (bài 2)',
            'Histogram cứu optimizer khỏi giả định ĐỀU: không sổ thì 100.000 đơn chia đều 6 khoảng ≈ 16.667/khoảng — trong khi khoảng ≥10k thật ra chỉ 20 đơn (dưới hòa vốn 25 → đáng lẽ Index Scan 82ms)',
            'EXPLAIN = cửa sổ nhìn vào lựa chọn của optimizer (plan + estimate); MATERIALIZED VIEW = tính sẵn kết quả nặng lưu như bảng thật — dashboard đọc ~20 block thay vì quét 1.000, đổi lại phải trả tiền làm mới khi dữ liệu đổi'
          ],
          intro: 'Hỏi thủ thư "sách về rồng giá dưới 100 gem còn nhiều không?" — bà ấy KHÔNG đi đếm từng cuốn: bà mở sổ kiểm kê, dò đúng NGĂN "0-100 gem" và đọc con số ghi sẵn. Ước lượng trong 2 giây, sai số chấp nhận được — và mọi quyết định (lấy xe đẩy hay đi tay không) dựa trên con số đó. Optimizer y hệt: cuốn sổ là statistics, các ngăn là histogram — và "xe đẩy hay tay không" chính là Seq Scan hay Index Scan.',
          example: 'Báo cáo whale: tra histogram → khoảng ≥10k có <strong>20 đơn</strong> → 20 cú nhảy × 4,1ms = <strong>82ms</strong>, rẻ hơn Seq 104ms → Index Scan. Nhưng dev viết <code>WHERE total + 0 &gt; 10000</code>: cột bị bọc trong phép tính, optimizer KHÔNG tra sổ được → đoán mặc định ⅓ kho ≈ 33.333 dòng → Seq Scan oan.'
        },
        concept_cards: [
          {
            icon: 'fa-book',
            title: 'Cuốn sổ và các ngăn — histogram 2 kiểu',
            body: 'Histogram chia miền giá trị thành các khoảng, mỗi khoảng ghi SỐ DÒNG rơi vào đó. <strong>Equi-width</strong>: các khoảng RỘNG bằng nhau (như sổ của ta). <strong>Equi-depth</strong>: chỉnh ranh giới sao cho mỗi khoảng CHỨA số dòng bằng nhau — chỉ cần lưu các mốc, ước lượng chuẩn hơn nên được ưa dùng. Không có sổ? Optimizer đành giả định phân bố ĐỀU — và trả giá.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 16.3.1 — Catalog Information & Histograms: equi-width vs equi-depth, uniform assumption'
          },
          {
            icon: 'fa-magnifying-glass-chart',
            title: 'EXPLAIN — đọc bản án của optimizer',
            body: 'CBO đặt nhiều plan ứng viên lên bàn cân, gắn giá từng plan bằng ESTIMATE × bảng giá I/O, chọn bản rẻ nhất — tất cả trước khi đụng dữ liệu. <code>EXPLAIN</code> in bản án đó: thuật toán từng tầng + số dòng ƯỚC LƯỢNG. Nghề debug query chậm gói trong một câu: so <strong>rows ước</strong> với <strong>rows thật</strong> — lệch xa là biết sổ có vấn đề.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply) — materialized view',
            body: 'Bảng vàng seller (bài 7) bị dashboard gọi 500 lần/ngày — mỗi lần quét 1.000 block? <strong>Materialized view</strong>: chạy GROUP BY một lần, LƯU kết quả 2.000 dòng ≈ 20 block như bảng thật — mỗi lần xem chỉ đọc 20 block. Giá phải trả: đơn mới vào thì view CŨ đi, phải làm mới (Postgres: <code>REFRESH MATERIALIZED VIEW</code>) — đánh đổi kinh điển đọc-nhanh / ghi-tốn, đúng vị Ticket #44.'
          }
        ],
        hist_visual: {
          eyebrow: 'HISTOGRAM orders.total — 100.000 ĐƠN CHIA 6 KHOẢNG GIÁ · HÒA VỐN INDEX ≈ 25 ĐƠN',
          caption: 'Sổ thật của optimizer: bấm từng khoảng giá mà xem nó ước lượng rồi chọn plan — và nhìn kẻ KHÔNG có sổ đoán đều 16.667 đơn/khoảng: bin whale 20 đơn bị Seq Scan oan.',
          total_rows: 100000,
          seq_ms: 104, jump_ms: 4.1, breakeven: 25,
          bins: [
            { label: '0-100', count: 30000 },
            { label: '100-500', count: 40000 },
            { label: '500-1k', count: 15000 },
            { label: '1k-5k', count: 10000 },
            { label: '5k-10k', count: 4980 },
            { label: '≥10k', count: 20 }
          ]
        },
        visual: {
          schema: {
            table_name: 'catalog — sổ thống kê của orders',
            columns: [
              { name: 'n_tuples', type: '100.000 đơn', key: '📒' },
              { name: 'n_blocks', type: '1.000 block', key: '📒' },
              { name: 'n_distinct(seller_id)', type: '2.000', key: '→ bài 7/9' },
              { name: 'histogram(total)', type: '6 khoảng giá', key: '→ sim dưới' }
            ]
          },
          data_preview: [
            ['WHERE total ≥ 10k', 'tra sổ: 20 đơn', 'Index 82ms ✓'],
            ['WHERE total ≥ 10k', 'không sổ: đoán 16.667', 'Seq 104ms — oan'],
            ['WHERE total + 0 ≥ 10k', 'cột bị bọc: đoán ⅓ ≈ 33.333', 'Seq 104ms — mù']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'EXPLAIN in "rows=20 (estimate)" cho báo cáo whale — con số 20 đó lấy từ đâu, khi query CHƯA hề chạy?',
            options: [
              { id: 'a', text: 'Tra HISTOGRAM trong catalog: khoảng ≥10k gem ghi sẵn 20 đơn — ước lượng bằng sổ, không đụng một dòng dữ liệu nào', correct: true, explanation: 'Đúng — đây là câu trả lời cho câu hỏi treo từ bài 9: mọi con số 1/20/50 đều từ sổ thống kê, và histogram là trang chi tiết nhất của sổ.' },
              { id: 'b', text: 'Chạy thử query một lần lúc rảnh rồi ghi nhớ kết quả', correct: false, explanation: 'Sai — CBO không chạy thử (bài 1 đã khắc cốt); chạy thử một lần là trả trọn giá một lần.' },
              { id: 'c', text: 'Đếm nhanh 20 dòng đầu tiên của bảng', correct: false, explanation: 'Sai — 20 dòng đầu chẳng nói gì về tổng số đơn ≥10k; estimate đến từ bản đồ PHÂN BỐ, không từ mẫu tiện tay.' },
              { id: 'd', text: 'Suy từ tổng số dòng: 100.000 chia đều các khoảng', correct: false, explanation: 'Sai — chia đều là kẻ KHÔNG có histogram: ra 16.667, lệch 833 lần so với 20. Chính vì thoát được phép chia bừa này mà histogram quý.' }
            ]
          },
          {
            question: 'Materialized view "bảng vàng seller" làm dashboard đọc 20 block thay vì quét 1.000 — cái giá phải trả nằm ở đâu?',
            options: [
              { id: 'a', text: 'Ở phía GHI: đơn mới vào là view thành CŨ — phải tốn công làm mới (refresh), và giữa hai lần refresh dashboard có thể hiển thị số liệu trễ', correct: true, explanation: 'Đúng — không có bữa trưa miễn phí: đọc-nhanh đổi bằng ghi-tốn + rủi ro dữ liệu trễ. Chọn MV cho báo cáo chịu được trễ vài phút, đừng chọn cho số dư ví.' },
              { id: 'b', text: 'Không có giá nào — MV là tối ưu thuần lợi', correct: false, explanation: 'Sai — nếu thuần lợi thì mọi query đã là MV; maintenance và độ trễ là hóa đơn thật.' },
              { id: 'c', text: 'Ở phía ĐỌC: đọc MV chậm hơn đọc bảng gốc', correct: false, explanation: 'Sai — ngược đời: đọc chính là phần THẮNG của MV (20 block vs 1.000); phần thua nằm ở ghi/làm mới.' },
              { id: 'd', text: 'MV làm hỏng sổ thống kê của bảng gốc', correct: false, explanation: 'Sai — sổ của bảng gốc không liên quan; MV chỉ là một bảng kết quả được tính sẵn, có sổ riêng của nó.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Ước ĐÚNG hay ước LỆCH?',
          instruction: 'Mỗi tình huống dẫn tới plan thế nào — xếp về đúng bên.',
          xp: 20,
          chips: [
            { id: 'e1', label: 'Bin ≥10k ghi 20 đơn → Index Scan 82ms' },
            { id: 'e2', label: 'Bin 100-500 ghi 40.000 đơn → Seq Scan, khỏi nhảy' },
            { id: 'w1', label: 'Bulk load 50.000 đơn chưa ANALYZE — sổ vẫn ghi số cũ' },
            { id: 'w2', label: 'WHERE total + 0 > … — cột bị bọc, sổ tra không nổi' }
          ],
          bins: [
            { id: 'e', label: 'ƯỚC ĐÚNG → plan chuẩn 📗' },
            { id: 'w', label: 'ƯỚC LỆCH → plan vụng 📕' }
          ],
          solution: { e1: 'e', e2: 'e', w1: 'w', w2: 'w' }
        }
      },
      step_3: {
        mission: 'Lắp dây chuyền ra quyết định của cost-based optimizer — có MỘT khối bịa.',
        blocks: [
          { type: 'op', token: 'Ước selectivity: WHERE total ≥ 10k tra histogram → ~20 dòng — tuyệt không chạy thử', slot: 'cbo-est' },
          { type: 'op', token: 'Mở sổ catalog: n dòng, n block, n distinct + histogram từng khoảng — ANALYZE cập nhật định kỳ', slot: 'cbo-stats' },
          { type: 'op', token: 'Sổ tự cập nhật theo TỪNG INSERT — số liệu không bao giờ cũ nổi một giây', slot: 'cbo-x' },
          { type: 'op', token: 'Gắn giá từng plan ứng viên: estimate × bảng giá I/O (seek 4ms · block 0,1ms — Ticket #43)', slot: 'cbo-cost' },
          { type: 'op', token: 'Chọn plan rẻ nhất — và EXPLAIN in bản án đó ra cho dev soi cùng', slot: 'cbo-pick' }
        ],
        drop_zones: [
          { id: 'cbo-stats', placeholder: 'Trạm 1 — chưa chạy gì cả, optimizer mở gì ra trước?', accepts: ['op'], multi: false,
            station: { icon: '📒', label: 'Mở sổ thống kê', sub: 'Trạm 1', hint: 'Thủ thư không đi đếm sách — bà mở thứ gì?' } },
          { id: 'cbo-est', placeholder: 'Trạm 2 — có sổ rồi, WHERE này ăn bao nhiêu dòng?', accepts: ['op'], multi: false,
            station: { icon: '🔮', label: 'Ước selectivity', sub: 'Trạm 2', hint: 'Khoảng ≥10k của histogram ghi con số nào — và có cần chạy thử không?' } },
          { id: 'cbo-cost', placeholder: 'Trạm 3 — biết số dòng rồi, quy ra gì để so?', accepts: ['op'], multi: false,
            station: { icon: '💸', label: 'Gắn giá các plan', sub: 'Trạm 3', hint: 'Ticket #43 tái xuất: mỗi plan ứng viên nhận một hóa đơn ước tính.' } },
          { id: 'cbo-pick', placeholder: 'Trạm 4 — các hóa đơn nằm trên bàn, chốt sao?', accepts: ['op'], multi: false,
            station: { icon: '⚖️', label: 'Chọn + EXPLAIN', sub: 'Trạm 4', hint: 'Và dev muốn xem bản án này thì gõ lệnh gì?' } }
        ],
        expected_sql: 'Mở sổ catalog: n dòng, n block, n distinct + histogram từng khoảng — ANALYZE cập nhật định kỳ Ước selectivity: WHERE total ≥ 10k tra histogram → ~20 dòng — tuyệt không chạy thử Gắn giá từng plan ứng viên: estimate × bảng giá I/O (seek 4ms · block 0,1ms — Ticket #43) Chọn plan rẻ nhất — và EXPLAIN in bản án đó ra cho dev soi cùng',
        expected_zones: {
          'cbo-stats': 'Mở sổ catalog: n dòng, n block, n distinct + histogram từng khoảng — ANALYZE cập nhật định kỳ',
          'cbo-est': 'Ước selectivity: WHERE total ≥ 10k tra histogram → ~20 dòng — tuyệt không chạy thử',
          'cbo-cost': 'Gắn giá từng plan ứng viên: estimate × bảng giá I/O (seek 4ms · block 0,1ms — Ticket #43)',
          'cbo-pick': 'Chọn plan rẻ nhất — và EXPLAIN in bản án đó ra cho dev soi cùng'
        },
        reveal_strip: true,
        reveal_complete: '💡 BẠN VỪA LẮP trọn bộ não CBO: mở sổ → ước lượng → gắn giá → chọn & EXPLAIN. Khối "sổ tự cập nhật theo từng INSERT" là bịa — sổ được lấy MẪU và làm mới ĐỊNH KỲ (ANALYZE), nghĩa là nó CÓ THỂ CŨ: đó chính là gót chân Achilles nằm chờ ở hồ sơ H. Bấm <strong>Chạy Query</strong>.',
        reveal_hints: {
          'cbo-stats': 'Trạm 1 — luật bất di bất dịch từ Ticket #42: optimizer KHÔNG chạy thử. Vậy trước mọi phép tính, nó mở thứ gì ra?',
          'cbo-est': 'Trạm 1 chốt: sổ đã mở — n dòng, histogram sẵn sàng. Giờ nhìn WHERE total ≥ 10k: làm sao ra được "~20 dòng" mà không đụng dữ liệu?',
          'cbo-cost': 'Trạm 2 chốt: ước ~20 dòng. Nhưng "20 dòng" chưa phải tiền — quy ra hóa đơn cho TỪNG plan ứng viên bằng bảng giá nào?',
          'cbo-pick': 'Trạm 3 chốt: Index 82ms · Seq 104ms nằm trên bàn. Nước cuối cùng của bộ não này — và cánh cửa cho dev nhìn vào?'
        }
      },
      step_4: {
        prompt: '<strong>Ticket #51 — gỡ mù cho optimizer:</strong> báo cáo whale chạy Seq Scan 104ms dù kho chỉ có 20 đơn ≥10.000 gem. EXPLAIN khai: <code>Seq Scan on orders (rows=33333 est) · Filter: total + 0 &gt; 10000</code> — cột <code>total</code> bị BỌC trong phép cộng nên sổ tra không nổi. Sửa dòng đỏ cho optimizer thấy lại cột trần.',
        challenge_type: 'bug_fix',
        buggy: "SELECT order_id, buyer_id, total\nFROM orders\nWHERE total + 0 > 10000\nORDER BY total DESC;",
        buggy_line: 2,
        schema: {
          table_name: 'orders',
          columns: [
            { name: 'order_id', type: 'INT', key: 'PK' },
            { name: 'buyer_id', type: 'INT', key: 'FK' },
            { name: 'total', type: 'INT (gem)', key: '🔑 idx_total · 📒 histogram' }
          ],
          data: [
            ['9001', '88', '80'],
            ['9002', '88', '12500'],
            ['9004', '88', '790'],
            ['9005', '707', '45'],
            ['9006', '12', '320'],
            ['9010', '707', '15800']
          ]
        },
        context: {
          scenario: 'Sửa xong, bản án đổi thành: <code>Index Scan using idx_total (rows=20 est) · Index Cond: total &gt; 10000</code> — 82ms, đúng như sổ hứa. Cùng họ với vụ UPPER( ) ở khóa Trung cấp: BẤT KỲ lớp bọc nào quanh cột — hàm hay phép tính — cũng che mắt cả index LẪN histogram.',
          real_world: 'Postgres gọi điều kiện "cột trần đứng một bên" là sargable. Các thủ phạm quen mặt trong code thật: <code>total + 0</code>, <code>date(created_at) = …</code>, <code>price * 1.1 &gt; x</code> (đáng lẽ viết <code>price &gt; x / 1.1</code>). Luật vàng: mọi phép biến đổi dồn về phía HẰNG SỐ, để cột đứng trần.',
          steps: [
            'Dòng tô đỏ: WHERE đang cộng 0 vào total — vô nghĩa với kết quả, chí mạng với estimate.',
            'Bỏ lớp bọc: so cột trần với hằng số.',
            'SELECT / FROM / ORDER BY không có tội — giữ nguyên.'
          ],
          hint_explore: 'Chạy thử TRƯỚC khi sửa: engine demo cũng chào thua biểu thức bọc cột (nó sẽ nói thẳng). Sửa xong chạy lại — 2 đơn whale hiện ra, lớn trước.',
          expected: 'Kết quả sau sửa: 9010 → 15800 · 9002 → 12500 (xếp giảm dần).'
        },
        hints: [
          { level: 1, text: 'EXPLAIN đã chỉ mặt: <code>Filter: total + 0 &gt; 10000</code> — phép cộng 0 đang bọc quanh cột có sổ.' },
          { level: 2, text: '<code>total + 0</code> và <code>total</code> cho cùng kết quả — nhưng optimizer chỉ tra được sổ/index khi cột đứng TRẦN.' },
          { level: 3, text: 'Sửa dòng đỏ thành phép so trần trụi giữa <code>total</code> và <code>10000</code>.' },
          { level: 4, text: 'Dòng WHERE đúng: <code>WHERE total &gt; 10000</code> — các dòng khác giữ nguyên.' }
        ],
        expected_sql: 'SELECT order_id, buyer_id, total FROM orders WHERE total > 10000 ORDER BY total DESC;',
        success_message: 'TICKET #51 ĐÓNG — MODULE 7 ENGINE ROOM HOÀN TẤT! 🏆 Nhìn lại chặng đường: dây chuyền 4 trạm → bảng giá I/O → access path → external sort → ba đời nested loop → merge & hash → aggregation → pipeline → optimizer viết lại query → và hôm nay, cuốn sổ cho nó đôi mắt. Ba hồ sơ tốt nghiệp module đang chờ bên dưới: Histograms & ANALYZE — Top-K — Join Minimization. Hẹn ở Module 8: GIAO DỊCH & CONCURRENCY — nơi 2 khách cùng bấm mua 1 món trong cùng 1 mili-giây. 🛒⚔️',
        xp_reward: 140
      },
      concept_cards_after: ['nc_card_histogram_analyze', 'nc_card_topk', 'nc_card_join_minimization']
    },

    /* ═══════════ MODULE 8 — TRADING FLOOR: Giao dịch & Concurrency (PART_7) ═══════════ */
    /* ── nc_11 — Ticket #52 · Vì sao transaction chạy đồng thời gây lỗi? ──
     * PART_7 Bài 1 (Ch.18 intro): isolation bị phá khi chạy đồng thời; schedule
     * xen nhịp quyết định đúng/sai; serial luôn đúng nhưng cả sàn xếp hàng;
     * 2PL & snapshot isolation là 2 scheme phổ biến. Kịch bản neo: VÍ GEM
     * DragonForge 500 · T1 +100 · T2 −50 → xen kẽ 450 ❌ / tuần tự 550 ✓
     * (NC_M8_SPEC_2026-07-06). Sim thứ 5: txn_visual stepper 2 chế độ. */
    {
      id: 'nc_11', index: 11,
      title: 'Hai giao dịch một mili-giây — vì sao gem bốc hơi?',
      subtitle: 'Isolation là lời hứa dễ vỡ nhất: không ai canh ví, thứ tự XEN NHỊP quyết định tiền đúng hay sai',
      module: 8, module_title: 'Trading Floor — Giao dịch & Concurrency',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'mcq_code',
      drag_map: {
        table: {
          name: 'wallets (ví gem của seller — mẫu 3)',
          columns: ['seller_id', 'ten_shop', 'balance_gem'],
          dataRows: [
            ['4102', 'DragonForge', '500'],
            ['9', 'GrandBazaar', '8200'],
            ['15', 'NoobMart', '120']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #52',
        hook: '23:59:59.001 đêm flash-sale: khách MythicSlayer88 trả <strong>100 gem</strong> mua skin Hỏa Long ĐÚNG LÚC DragonForge bấm rút <strong>50 gem</strong> về ngân hàng. Sáng ra ví thiếu đúng 100 gem — khách có biên lai, lệnh rút có log chuẩn, và <em>không ai sai một dòng code nào</em>. Module 7 dạy bạn làm query chạy NHANH; Module 8 mở màn bằng câu hỏi đắt hơn nhiều: nhiều giao dịch chạy <strong>CÙNG LÚC</strong> thì tiền có còn ĐÚNG?'
      },
      step_1: {
        primer: {
          goal: [
            'Isolation — tính chất "mỗi transaction tưởng mình chạy MỘT MÌNH" — bị phá khi nhiều transaction chạy đồng thời mà không ai kiểm soát chỗ chúng ĐỤNG nhau (sách Ch.18 mở màn đúng câu này)',
            'SCHEDULE = thứ tự xen nhịp các thao tác đọc/ghi: chạy TUẦN TỰ (serial) luôn đúng; xen kẽ thì đúng hay sai TÙY kịch bản xen — lost update là kịch bản xen sai kinh điển',
            'Không thể bắt cả sàn xếp hàng chạy tuần tự (chậm chết) → cần CONCURRENCY-CONTROL SCHEME; hai họ phổ biến nhất ngoài đời: two-phase locking và snapshot isolation — chính là mạch của cả Module 8'
          ],
          intro: 'Hai nhân viên cùng cầm sổ ra két đếm: cả hai thấy <strong>500</strong>, mỗi người về bàn tự cộng trừ trên <em>tờ nháp của mình</em>, rồi lần lượt quay lại GHI ĐÈ con số mới lên két. Người ghi sau không hề biết két đã đổi — tờ nháp của họ vẫn là con số cũ. Database không khóa cũng y hệt: <code>read</code> là chép về nháp, <code>write</code> là đè lên két.',
          example: 'Ví 500 gem. T1 (khách trả): đọc 500 → tính 600 → ghi. T2 (seller rút): đọc 500 → tính 450 → ghi. Xen kẽ kiểu "cùng đọc trước, lần lượt ghi sau": ví chốt <strong>450</strong> — bản ghi 600 bị đè, <strong>+100 gem của khách bốc hơi không dấu vết</strong>. Chạy tuần tự bất kỳ chiều nào: <strong>550</strong>, đúng từng gem.'
        },
        concept_cards: [
          {
            icon: 'fa-shield-halved',
            title: 'Isolation vỡ khi nào — theo đúng sách',
            body: 'Khi nhiều transaction chạy đồng thời, <strong>isolation có thể không còn được bảo toàn</strong> — hệ thống phải kiểm soát tương tác giữa chúng bằng một <em>concurrency-control scheme</em>. Không scheme nào thắng tuyệt đối; hai cơ chế được dùng nhiều nhất trong thực tế là <strong>two-phase locking</strong> và <strong>snapshot isolation</strong>.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18 — Concurrency Control, intro'
          },
          {
            icon: 'fa-arrows-turn-right',
            title: 'Schedule — kịch bản xen nhịp',
            body: 'Cùng 4 thao tác <code>T1.đọc · T1.ghi · T2.đọc · T2.ghi</code> có nhiều cách XEN thành một schedule. Serial (hết T1 rồi mới T2) luôn cho kết quả đúng. Xen kẽ thì có bản vẫn đúng (tương đương serial) — có bản làm mất tiền như đêm qua. Kẻ quyết định đúng/sai là <strong>THỨ TỰ XEN</strong>, không phải code của từng transaction: từng dòng lệnh của T1 lẫn T2 đều chuẩn.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Bạn từng thấy số like tụt 1 rồi nhảy lại, lượt xem "đếm thiếu", 2 người cùng đặt trúng 1 ghế chưa? Cùng một họ bệnh: hai phiên cùng <code>đọc → tính trên bản cũ → ghi đè</code>. Nghề gọi là <strong>lost update</strong> — bài này bắt bệnh; các bài sau của Trading Floor lần lượt phát thuốc: khóa, 2PL, MVCC.'
          }
        ],
        txn_visual: {
          eyebrow: 'LOST UPDATE — VÍ 500 GEM · T1 KHÁCH TRẢ +100 · T2 SELLER RÚT −50',
          caption: 'Chạy CẢ HAI chế độ mà so: xen kẽ = ví chốt 450 (mất đúng 100 gem của khách) — tuần tự = 550, đúng từng gem. Cùng 4 thao tác, chỉ khác THỨ TỰ XEN.',
          wallet_label: '💰 VÍ DragonForge',
          start: 500, unit: 'gem',
          t1_label: '🧾 T1 — khách trả +100',
          t2_label: '🏧 T2 — seller rút −50',
          modes: [
            {
              id: 'bad', short: 'XEN KẼ', ok: false,
              btn: '▶ Chạy XEN KẼ (đêm qua trên prod)',
              steps: [
                { who: 't1', text: 'đọc ví → thấy 500', note: 'T1 chép 500 vào TỜ NHÁP của nó — từ giờ nó tính trên nháp, không nhìn lại ví nữa.' },
                { who: 't2', text: 'đọc ví → cũng thấy 500', cls: 'warn', note: 'Không ai canh ví — T2 cũng chép đúng 500. Hai tờ nháp giống hệt nhau: mầm họa nằm ở nhịp này.' },
                { who: 't1', text: 'tính 500 + 100 → GHI 600', wallet: 600, note: 'Ví thành 600 — tiền khách đã vào két. Nhưng tờ nháp của T2 vẫn ghi 500…' },
                { who: 't2', text: 'tính 500 − 50 → GHI 450', wallet: 450, cls: 'bad', note: '' }
              ],
              verdict: '❌ Ví chốt 450 — bản ghi 600 bị ĐÈ không thương tiếc: +100 gem của khách bốc hơi. Tên hồ sơ: LOST UPDATE.'
            },
            {
              id: 'good', short: 'TUẦN TỰ', ok: true,
              btn: '▶ Chạy TUẦN TỰ (serial)',
              steps: [
                { who: 't1', text: 'đọc ví → 500', note: 'T1 chạy TRỌN VẸN trước — không ai chen ngang.' },
                { who: 't1', text: 'tính 500 + 100 → GHI 600', wallet: 600, note: 'T1 xong hẳn. Giờ mới tới lượt T2.' },
                { who: 't2', text: 'đọc ví → 600 (bản MỚI)', note: 'T2 đọc SAU khi T1 ghi — tờ nháp của nó chép con số đã có tiền khách.' },
                { who: 't2', text: 'tính 600 − 50 → GHI 550', wallet: 550, cls: 'ok', note: '' }
              ],
              verdict: '✓ Ví chốt 550 = 500 + 100 − 50, đúng từng gem. Serial LUÔN đúng — cái giá: cả sàn phải xếp hàng chạy từng giao dịch một.'
            }
          ]
        },
        visual: {
          schema: {
            table_name: '4 thao tác — 2 cách xen',
            columns: [
              { name: 'T1: đọc ví → +100 → ghi', type: 'giao dịch thanh toán', key: 'T1' },
              { name: 'T2: đọc ví → −50 → ghi', type: 'giao dịch rút gem', key: 'T2' },
              { name: 'schedule', type: 'thứ tự XEN các nhịp', key: '⚡' }
            ]
          },
          data_preview: [
            ['tuần tự T1→T2', '500 → 600 → 550', 'đúng', '✓'],
            ['tuần tự T2→T1', '500 → 450 → 550', 'đúng', '✓'],
            ['đọc-đọc-ghi-ghi', '500 → 600 → 450', 'MẤT 100 của khách', '❌'],
            ['đọc-đọc-ghi(T2)-ghi(T1)', '500 → 450 → 600', 'MẤT 50 lệnh rút', '❌']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Schedule đêm qua: T1 đọc 500 · T2 đọc 500 · T1 ghi 600 · T2 ghi 450. Vì sao 100 gem của khách biến mất?',
            options: [
              { id: 'a', text: 'T2 tính 500−50 trên TỜ NHÁP nó chép từ TRƯỚC khi T1 ghi — rồi ghi 450 ĐÈ lên 600, xóa sạch dấu vết của T1', correct: true, explanation: 'Đúng — read chép về nháp, write đè lên két. T2 không "nhìn lại" ví trước khi ghi, nên bản cập nhật của T1 bị nuốt trọn: lost update.' },
              { id: 'b', text: 'Vì T2 là lệnh RÚT tiền — rút thì ví phải giảm, mất là đúng rồi', correct: false, explanation: 'Sai — rút 50 từ 600 phải còn 550. Ví chốt 450 nghĩa là mất thêm đúng 100 của khách, không phải chỉ 50 của lệnh rút.' },
              { id: 'c', text: 'Vì database chạy chậm, ghi của T1 chưa kịp xuống đĩa', correct: false, explanation: 'Sai — ghi 600 đã THÀNH CÔNG vào ví. Nó không chậm, nó bị GHI ĐÈ bởi một transaction cầm số liệu cũ.' },
              { id: 'd', text: 'Vì hai transaction dùng chung connection nên biến bị lẫn sang nhau', correct: false, explanation: 'Sai — mỗi transaction có vùng nháp riêng, biến không lẫn. Vấn đề là cả hai cùng chép MỘT con số rồi lần lượt đè nhau.' }
            ]
          },
          {
            question: 'Serial schedule (chạy trọn T1 rồi mới T2) LUÔN đúng — vậy sao GameHub không ép cả sàn chạy tuần tự cho lành?',
            options: [
              { id: 'a', text: 'Vì mất sạch concurrency: nghìn giao dịch/giây phải xếp MỘT hàng, giao dịch chậm nhất bắt cả sàn đứng chờ', correct: true, explanation: 'Đúng — sách nói thẳng: cần scheme kiểm soát để vừa chạy đồng thời vừa giữ isolation. Hai họ phổ biến: 2PL (bài sau) và snapshot isolation.' },
              { id: 'b', text: 'Vì serial vẫn có thể ra kết quả sai nếu xui', correct: false, explanation: 'Sai — serial đúng theo định nghĩa: không ai chen giữa read và write của ai.' },
              { id: 'c', text: 'Vì CPU nhiều nhân không chạy tuần tự được', correct: false, explanation: 'Sai — chạy tuần tự trên máy nhiều nhân vẫn được, chỉ là phí phạm và chậm.' },
              { id: 'd', text: 'Vì tuần tự làm hết deadlock nhưng sinh thêm lost update', correct: false, explanation: 'Sai ngược — tuần tự không sinh lost update; nó chỉ trả giá bằng throughput. (Deadlock là hồ sơ của vài bài nữa.)' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Schedule nào an toàn?',
          instruction: 'Ví 500 · T1 +100 · T2 −50. Xếp mỗi schedule về đúng bên.',
          xp: 20,
          chips: [
            { id: 's1', label: 'T1 trọn vẹn → rồi T2 trọn vẹn' },
            { id: 's2', label: 'T1 đọc · T2 đọc · T1 ghi · T2 ghi' },
            { id: 's3', label: 'T2 trọn vẹn → rồi T1 trọn vẹn' },
            { id: 's4', label: 'T1 đọc · T2 đọc · T2 ghi · T1 ghi' }
          ],
          bins: [
            { id: 'ok', label: 'VÍ CHỐT 550 ✓' },
            { id: 'lost', label: 'MẤT CẬP NHẬT ❌' }
          ],
          solution: { s1: 'ok', s2: 'lost', s3: 'ok', s4: 'lost' }
        }
      },
      step_3: {
        mission: 'Dựng lại đúng 4 nhịp làm 100 gem bốc hơi — hồ sơ vụ án Ticket #52. Có MỘT khối bịa.',
        blocks: [
          { type: 'op', token: 'T1 đọc ví: chép 500 vào tờ nháp riêng — từ giờ chỉ tính trên nháp', slot: 'tx-read1' },
          { type: 'op', token: 'T2 ghi 450 (= 500 nháp cũ − 50) — ĐÈ lên 600, cập nhật của T1 bốc hơi', slot: 'tx-write2' },
          { type: 'op', token: 'Database thấy 2 giao dịch cùng sửa một ví thì tự báo lỗi, chặn người đến sau', slot: 'tx-x' },
          { type: 'op', token: 'T2 cũng đọc ví: vẫn 500 — chẳng ai giữ khóa để bắt nó chờ', slot: 'tx-read2' },
          { type: 'op', token: 'T1 ghi 600 (= 500 + 100) — tiền khách vào két, nhưng nháp của T2 vẫn là 500', slot: 'tx-write1' }
        ],
        drop_zones: [
          { id: 'tx-read1', placeholder: 'Nhịp 1 — T1 mở màn thế nào?', accepts: ['op'], multi: false,
            station: { icon: '📖', label: 'T1 đọc', sub: 'Nhịp 1', hint: 'read không phải là "nhìn" — nó là CHÉP về vùng nháp riêng.' } },
          { id: 'tx-read2', placeholder: 'Nhịp 2 — T2 chen vào, thấy gì?', accepts: ['op'], multi: false,
            station: { icon: '📖', label: 'T2 đọc', sub: 'Nhịp 2', hint: 'T1 đã đọc nhưng CHƯA ghi — và không có cơ chế nào bắt T2 đứng ngoài.' } },
          { id: 'tx-write1', placeholder: 'Nhịp 3 — T1 quay lại két', accepts: ['op'], multi: false,
            station: { icon: '✍️', label: 'T1 ghi', sub: 'Nhịp 3', hint: 'Tiền khách vào ví thật — con số trên két đổi. Nhưng có ai báo cho T2 biết không?' } },
          { id: 'tx-write2', placeholder: 'Nhịp 4 — cú ghi giết chết 100 gem', accepts: ['op'], multi: false,
            station: { icon: '💥', label: 'T2 ghi đè', sub: 'Nhịp 4', hint: 'T2 tính từ tờ nháp nào? Nó có nhìn lại két trước khi ghi không?' } }
        ],
        expected_sql: 'T1 đọc ví: chép 500 vào tờ nháp riêng — từ giờ chỉ tính trên nháp T2 cũng đọc ví: vẫn 500 — chẳng ai giữ khóa để bắt nó chờ T1 ghi 600 (= 500 + 100) — tiền khách vào két, nhưng nháp của T2 vẫn là 500 T2 ghi 450 (= 500 nháp cũ − 50) — ĐÈ lên 600, cập nhật của T1 bốc hơi',
        expected_zones: {
          'tx-read1': 'T1 đọc ví: chép 500 vào tờ nháp riêng — từ giờ chỉ tính trên nháp',
          'tx-read2': 'T2 cũng đọc ví: vẫn 500 — chẳng ai giữ khóa để bắt nó chờ',
          'tx-write1': 'T1 ghi 600 (= 500 + 100) — tiền khách vào két, nhưng nháp của T2 vẫn là 500',
          'tx-write2': 'T2 ghi 450 (= 500 nháp cũ − 50) — ĐÈ lên 600, cập nhật của T1 bốc hơi'
        },
        reveal_strip: true,
        reveal_complete: '💡 BẠN VỪA DỰNG lại trọn vụ án: đọc chung một bản → tính trên nháp cũ → ghi đè nhau. Khối "database tự báo lỗi, chặn người đến sau" là BỊA — không khóa, không cơ chế, DB im re cho ghi sau đè ghi trước. Muốn có người gác ví THẬT? Bài sau phát ổ khóa. Bấm <strong>Chạy Query</strong>.',
        reveal_hints: {
          'tx-read1': 'Nhịp 1 — mọi giao dịch mở màn bằng việc CHÉP số dư về nháp riêng của mình. T1 chép được bao nhiêu?',
          'tx-read2': 'Nhịp 1 chốt: nháp T1 = 500. Giờ T2 chen vào đọc — ví ĐÃ đổi chưa? Có ai bắt nó chờ không?',
          'tx-write1': 'Nhịp 2 chốt: hai tờ nháp cùng ghi 500. T1 về két trước — nó ghi con số nào lên ví?',
          'tx-write2': 'Nhịp 3 chốt: két = 600. T2 cầm nháp 500 quay lại — cú ghi này lấy 600 − 50 hay 500 − 50?'
        }
      },
      step_4: {
        prompt: '<strong>Ticket #52 — phiên tòa kết án:</strong> schedule tang vật ghi 4 nhịp: <code>T1 đọc(500) · T2 đọc(500) · T1 ghi(600) · T2 ghi(?)</code>. Ví DragonForge chốt bao nhiêu — và vì sao?',
        challenge_type: 'mcq_code',
        options: [
          {
            text: 'Ví chốt 450 — T2 tính 500 − 50 trên bản nháp CŨ nó đọc từ nhịp 2, rồi ghi đè lên 600: +100 gem của khách bị nuốt không dấu vết',
            correct: true
          },
          {
            text: 'Ví chốt 550 — T2 ghi sau cùng nên nó thấy két đang là 600 mà trừ 50',
            correct: false,
            explain: 'Sai — T2 ĐÃ đọc từ nhịp 2 (thấy 500) và tính trên nháp. write không "nhìn lại" két trước khi đè; muốn nó thấy 600 thì phải có cơ chế bắt nó đọc LẠI — thứ chưa tồn tại trong bài này.'
          },
          {
            text: 'Ví chốt 600 — cú ghi của T2 bị database từ chối vì phát hiện xung đột',
            correct: false,
            explain: 'Sai — không khóa, không validation, không ai "phát hiện" gì cả: DB mặc định cho ghi sau đè ghi trước, im lặng tuyệt đối. (Các scheme biết từ chối là chuyện của những bài sau.)'
          },
          {
            text: 'Ví chốt 500 — hai giao dịch +100 và −50 tự triệt tiêu về số cũ',
            correct: false,
            explain: 'Sai — +100 rồi −50 mà "triệt tiêu về 500" thì toán đã sai từ vỡ lòng (500+100−50 = 550). Ví chốt bằng đúng CÚ GHI CUỐI: 450.'
          }
        ],
        schema: {
          table_name: 'schedule tang vật — 23:59:59 đêm flash-sale',
          columns: [
            { name: 'nhịp', type: 'thứ tự thật trên prod', key: '#' },
            { name: 'thao tác', type: 'read/write ví 4102', key: '' },
            { name: 'két sau nhịp', type: 'balance_gem', key: '💰' }
          ],
          data: [
            ['1', 'T1 đọc ví → nháp T1 = 500', '500'],
            ['2', 'T2 đọc ví → nháp T2 = 500', '500'],
            ['3', 'T1 ghi 500 + 100', '600'],
            ['4', 'T2 ghi 500 − 50', '❓']
          ]
        },
        context: {
          scenario: 'Đây là bài "đọc schedule" đầu tiên của Trading Floor — kỹ năng bạn sẽ dùng suốt module: dò từng nhịp, theo dõi NHÁP của từng transaction và KÉT thật, tách bạch hai thứ đó.',
          real_world: 'Postgres/MySQL mặc định KHÔNG để chuyện này xảy ra trần trụi như sim — vì chúng chạy sẵn locking/MVCC. Nhưng viết app kiểu "SELECT balance rồi UPDATE balance = giá_trị_tính_ở_app" là bạn tự tay tái hiện đúng vụ 450 này, DB nào cũng bó tay.',
          steps: [
            'Nhịp 2: T2 đọc TRƯỚC khi T1 ghi → nháp T2 = 500, chốt cứng.',
            'Nhịp 3: két = 600, nhưng không ai báo cho T2.',
            'Nhịp 4: T2 ghi 500 − 50 = 450, đè lên 600.',
            'Két chốt = cú ghi cuối cùng: 450. Mất đúng 100 của khách.'
          ],
          hint_explore: 'Chạy lại sim Step 1 chế độ XEN KẼ, nhìn hàng VÍ GEM đổi 500 → 600 → 450 — con số 600 sống được đúng một nhịp.',
          expected: 'Chọn phương án "450 — T2 tính trên nháp cũ, ghi đè lên 600".'
        },
        hints: [
          { level: 1, text: 'Tách hai thứ: KÉT (ví thật) và NHÁP của mỗi transaction. Nháp T2 chép lúc nào — trước hay sau khi két thành 600?' },
          { level: 2, text: 'write không nhìn lại két — nó đè nguyên con số tính từ nháp. Nháp T2 = 500 thì cú ghi của T2 là bao nhiêu?' },
          { level: 3, text: 'Két chốt bằng CÚ GHI CUỐI CÙNG của schedule. Cú cuối là của ai, giá trị nào?' },
          { level: 4, text: 'Đáp án: 450 — bản ghi 600 của T1 bị đè, +100 của khách bốc hơi. Đó chính là lost update.' }
        ],
        success_message: 'TICKET #52 ĐÓNG — thủ phạm không phải code, là SCHEDULE! 🕵️ Bạn vừa học kỹ năng nền của cả Trading Floor: đọc kịch bản xen nhịp và chỉ đúng chỗ isolation vỡ. Nhưng bắt được bệnh chưa phải chữa: bài sau, lock manager ra quầy — phát ổ khóa S/X cho từng giao dịch, ai đọc chung được, ai phải xếp hàng. 🔒',
        xp_reward: 120
      }
    },

    /* ── nc_12 — Ticket #53 · S/X Locks: ai đọc chung được, ai phải chờ? ──
     * PART_7 Bài 2 (Ch.18.1.1-18.1.2): S-lock đọc chung / X-lock độc quyền;
     * ma trận tương thích Fig 18.1 (chỉ S+S true); lock-S/lock-X/unlock;
     * request → grant/wait; unlock quá sớm vẫn sai (banking A/B $250 — trap
     * nuôi 2PL bài 3). Sim: txn_visual 2 chế độ KHÔNG KHÓA vs KHÓA X → 550 ✓. */
    {
      id: 'nc_12', index: 12,
      title: 'Khóa S/X — ai đọc chung được, ai phải xếp hàng?',
      subtitle: 'Lock manager ra quầy: khóa S đọc chung, khóa X độc quyền — ma trận tương thích quyết ai chờ ai',
      module: 8, module_title: 'Trading Floor — Giao dịch & Concurrency',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'fill_blank',
      drag_map: {
        table: {
          name: 'lock table — quầy lock manager (snapshot 00:00:01)',
          columns: ['item', 'transaction', 'mode', 'trạng thái'],
          dataRows: [
            ['ví 4102', 'T1', 'X', 'GRANTED'],
            ['ví 4102', 'T2', 'X', '⏳ WAITING'],
            ['listing 3001', 'T7', 'S', 'GRANTED'],
            ['listing 3001', 'T9', 'S', 'GRANTED']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #53',
        hook: 'Thủ phạm vụ 100 gem đã lộ mặt: hai giao dịch cùng chép <strong>một bản 500</strong>. Ticket #53 lắp giải pháp đầu tiên trong lịch sử database: trước khi đụng ví phải <strong>xin KHÓA</strong> ở quầy lock manager. Khóa <strong>S</strong> để đọc — cả chục người cầm chung vô tư; khóa <strong>X</strong> để ghi — độc quyền tuyệt đối, đến cả người MUỐN ĐỌC cũng phải xếp hàng. Cùng chạy lại 2 giao dịch đêm qua, lần này có người gác.'
      },
      step_1: {
        primer: {
          goal: [
            'Muốn đụng item nào phải XIN KHÓA item đó ở concurrency-control manager: khóa S (shared) — được đọc, không được ghi; khóa X (exclusive) — đọc lẫn ghi (sách 18.1.1)',
            'MA TRẬN TƯƠNG THÍCH (Fig 18.1): chỉ S+S là sống chung — nhiều người cùng đọc thoải mái; dính X ở bất kỳ phía nào là VÊNH → transaction đến sau phải CHỜ đến khi khóa vênh được nhả',
            'Khóa chữa đúng vụ 450: T2 xin X khi T1 đang giữ X → xếp hàng → chỉ được đọc SAU khi T1 ghi xong — nháp của T2 luôn là bản mới. Nhưng hồ sơ sách cảnh báo: có khóa mà NHẢ QUÁ SỚM vẫn đọc sai ($250) — chưa hết chuyện'
          ],
          intro: 'Phòng gym có tủ đồ: ai <em>xem</em> lịch tập dán trên tủ thì đứng xem chung cả chục người (khóa S). Ai muốn <em>mở tủ xếp lại đồ</em> phải lấy chìa độc quyền (khóa X) — lúc đó cả người chỉ muốn XEM cũng đứng chờ, vì xem giữa lúc người ta đang bới đồ là thấy cảnh dở dang. Lock manager là anh giữ chìa: phát chìa nếu không vênh, bắt xếp hàng nếu vênh.',
          example: 'Chạy lại 2 giao dịch đêm qua có khóa: T1 <code>lock-X(ví)</code> → GRANT. T2 xin <code>lock-X(ví)</code> → <strong>vênh X, xếp hàng</strong>. T1 đọc 500, ghi 600, <code>unlock</code> → T2 được đánh thức: đọc <strong>600</strong> (bản mới!), ghi 550. Ví chốt <strong>550 ✓</strong> — lost update chết ngay tại quầy.'
        },
        concept_cards: [
          {
            icon: 'fa-lock',
            title: 'S, X và ma trận tương thích — theo đúng sách',
            body: 'Transaction giữ khóa <strong>S</strong> trên Q thì đọc được nhưng không ghi được Q; giữ khóa <strong>X</strong> thì đọc lẫn ghi. Nhiều khóa S cùng tồn tại trên một item; yêu cầu X phải <strong>chờ mọi khóa vênh được nhả</strong>. Xin khóa bằng <code>lock-S(Q)</code> / <code>lock-X(Q)</code>, trả bằng <code>unlock(Q)</code> — và transaction phải giữ khóa CHỪNG NÀO còn truy cập item đó.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.1.1 — Locks, Fig 18.1'
          },
          {
            icon: 'fa-user-shield',
            title: 'Quầy lock manager — grant hay xếp hàng',
            body: 'Mọi yêu cầu khóa đổ về <strong>concurrency-control manager</strong>. Nó tra ma trận: yêu cầu mới TƯƠNG THÍCH với mọi khóa đang được giữ → <strong>GRANT</strong> ngay; vênh dù chỉ một khóa → vào <strong>hàng chờ</strong>, transaction đứng im đúng chỗ đó. Bảng lock table thật (xem panel dữ liệu) ghi từng dòng granted/waiting — nghìn giao dịch/giây vẫn trật tự nhờ đúng cái quầy này.'
          },
          {
            icon: 'fa-triangle-exclamation',
            title: 'Hồ sơ cảnh báo: nhả khóa quá sớm',
            body: 'Sách chơi khăm một cú đau: T1 chuyển 50 từ két B sang A, <em>nhả khóa B ngay sau khi trừ</em>. T2 chen giữa, cộng tổng A + B: ra <strong>$250 thay vì $300</strong> — 50 đô "tàng hình" đúng lúc đang bay giữa hai két. Có khóa, khóa xin đúng kiểu, mà vẫn sai — vì nhả QUÁ SỚM. Giữ đến bao giờ mới đủ? Câu trả lời tên là <strong>2PL</strong> — bài sau.'
          }
        ],
        txn_visual: {
          eyebrow: 'CÙNG 2 GIAO DỊCH ĐÊM QUA — GIỜ CÓ LOCK MANAGER GÁC VÍ',
          caption: 'Chạy cả hai chế độ: khóa X không cấm chạy đồng thời — nó chỉ bắt T2 CHỜ đúng đoạn đụng ví, và cú chờ đó đổi 450 thành 550.',
          wallet_label: '💰 VÍ DragonForge',
          start: 500, unit: 'gem',
          t1_label: '🧾 T1 — khách trả +100',
          t2_label: '🏧 T2 — seller rút −50',
          modes: [
            {
              id: 'nolock', short: 'KHÔNG KHÓA', ok: false,
              btn: '▶ Ôn tập: KHÔNG KHÓA',
              steps: [
                { who: 't1', text: 'đọc ví → 500', note: 'Không ai gác — T1 chép 500 về nháp.' },
                { who: 't2', text: 'đọc ví → cũng 500', cls: 'warn', note: 'T2 cũng chép 500. Hai tờ nháp song sinh — bạn biết chuyện gì sắp xảy ra.' },
                { who: 't1', text: 'GHI 600', wallet: 600, note: 'Tiền khách vào két…' },
                { who: 't2', text: 'GHI 450 — đè lên 600', wallet: 450, cls: 'bad', note: '' }
              ],
              verdict: '❌ 450 — đúng vụ án Ticket #52. Giờ bấm chế độ CÓ KHÓA X mà xem quầy gác làm việc.'
            },
            {
              id: 'lock', short: 'KHÓA X', ok: true,
              btn: '▶ Chạy CÓ KHÓA X',
              steps: [
                { who: 't1', text: '🔒 lock-X(ví) → GRANT', note: 'T1 xin khóa X — ví đang tự do, lock manager phát chìa ngay.' },
                { who: 't1', text: 'đọc ví → 500', note: 'T1 cầm chìa độc quyền, ung dung chép 500 về nháp.' },
                { who: 't2', text: '🔒 xin lock-X(ví) → ⏳ XẾP HÀNG', cls: 'wait', note: 'X vênh X (ma trận Fig 18.1) — T2 bị treo tại quầy, KHÔNG đọc được một byte nào của ví.' },
                { who: 't1', text: 'tính 500 + 100 → GHI 600', wallet: 600, note: 'T1 ghi xong việc của nó — T2 vẫn đứng im trong hàng.' },
                { who: 't1', text: '🔓 unlock(ví)', note: 'T1 trả chìa — lock manager lập tức đánh thức T2 ở đầu hàng chờ.' },
                { who: 't2', text: '✅ GRANT X → đọc ví: 600', note: 'Chờ xong mới được đọc — nên nháp của T2 là bản MỚI, đã có tiền khách.' },
                { who: 't2', text: 'tính 600 − 50 → GHI 550', wallet: 550, cls: 'ok', note: '' }
              ],
              verdict: '✓ Ví chốt 550 — khóa X ép T2 đọc SAU cú ghi của T1. Lost update chết tại quầy, mà T2 cũng chỉ chờ đúng một đoạn.'
            }
          ]
        },
        visual: {
          schema: {
            table_name: 'Ma trận tương thích (Fig 18.1)',
            columns: [
              { name: 'xin S khi đang có S', type: '✓ GRANT — đọc chung', key: '✓' },
              { name: 'xin S khi đang có X', type: '⏳ CHỜ — đang có người ghi', key: '✗' },
              { name: 'xin X khi đang có S/X', type: '⏳ CHỜ — ghi là độc quyền', key: '✗' }
            ]
          },
          data_preview: [
            ['ví 4102', 'T1 giữ X', 'T2 xin X', '⏳ T2 xếp hàng'],
            ['listing 3001', 'T7 giữ S', 'T9 xin S', '✓ đọc chung'],
            ['listing 3001', 'T7, T9 giữ S', 'T4 xin X', '⏳ T4 chờ cả hai nhả']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Listing 3001 đang có T7 và T9 cùng giữ khóa S (xem giá). T4 muốn sửa giá — xin lock-X. Chuyện gì xảy ra?',
            options: [
              { id: 'a', text: 'T4 xếp hàng chờ CẢ T7 lẫn T9 nhả S — X vênh với mọi khóa, kể cả khóa "chỉ đọc"', correct: true, explanation: 'Đúng — ma trận Fig 18.1: comp(X, S) = false. Sửa giá giữa lúc người khác đang đọc là họ thấy giá dở dang — nên X phải chờ sạch khóa.' },
              { id: 'b', text: 'T4 được grant ngay — S chỉ là khóa đọc, đâu cản ai ghi', correct: false, explanation: 'Sai — S "yếu" khi so với S khác thôi; với X thì vênh. Người đang đọc có quyền đọc trọn bản nhất quán.' },
              { id: 'c', text: 'T7 và T9 bị đá văng để nhường X — ghi quan trọng hơn đọc', correct: false, explanation: 'Sai — lock manager không tước khóa đang giữ (chuyện "đá văng" là vũ khí deadlock-prevention, hồ sơ bài sau). T4 chờ, không ai bị đá.' },
              { id: 'd', text: 'Cả ba cùng giữ khóa — S+S+X sống chung được vì đa số là đọc', correct: false, explanation: 'Sai — ma trận không có khái niệm "biểu quyết đa số": một khóa vênh là đủ để xếp hàng.' }
            ]
          },
          {
            question: 'Hồ sơ sách: T1 chuyển 50 từ két B sang A nhưng NHẢ khóa B ngay sau khi trừ. T2 chen vào cộng tổng A+B ra $250 (đúng ra $300). Có khóa mà sao vẫn sai?',
            options: [
              { id: 'a', text: 'Vì T1 nhả khóa QUÁ SỚM — T2 chen đúng khe "tiền đã rời B, chưa tới A" và đọc được trạng thái dở dang', correct: true, explanation: 'Đúng — xin khóa đúng kiểu chưa đủ, còn phải giữ ĐỦ LÂU. "Giữ đến bao giờ" chính là câu hỏi 2PL trả lời ở bài sau.' },
              { id: 'b', text: 'Vì T2 quên xin khóa S trước khi đọc', correct: false, explanation: 'Sai — T2 xin S đàng hoàng và được grant, vì B đã bị T1 NHẢ rồi. Vấn đề nằm ở người nhả, không phải người xin.' },
              { id: 'c', text: 'Vì cộng A+B cần khóa X chứ không phải S', correct: false, explanation: 'Sai — T2 chỉ đọc, S là đúng kiểu. Đọc mà ra số sai là do trạng thái NÓ ĐỌC dở dang, không phải do kiểu khóa.' },
              { id: 'd', text: 'Vì hai két A và B nằm ở hai bảng khác nhau nên khóa không phủ được', correct: false, explanation: 'Sai — khóa theo item, phủ được hết; kể cả cùng bảng vẫn dính nếu nhả sớm. Thứ tự GIỮ/NHẢ mới là thủ phạm.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Quầy lock manager — grant hay xếp hàng?',
          instruction: 'Tra ma trận Fig 18.1: mỗi cặp (đang giữ + xin mới) về đúng bên.',
          xp: 20,
          chips: [
            { id: 'c1', label: 'Đang giữ S — xin thêm S' },
            { id: 'c2', label: 'Đang giữ S — xin X' },
            { id: 'c3', label: 'Đang giữ X — xin S' },
            { id: 'c4', label: 'Đang giữ X — xin X' }
          ],
          bins: [
            { id: 'g', label: 'GRANT ✓' },
            { id: 'w', label: 'XẾP HÀNG ⏳' }
          ],
          solution: { c1: 'g', c2: 'w', c3: 'w', c4: 'w' }
        }
      },
      step_3: {
        mission: 'Lắp quy trình 4 bước của quầy lock manager — có MỘT khối bịa (nghe rất chi là tử tế).',
        blocks: [
          { type: 'op', token: 'Tra MA TRẬN: yêu cầu mới có tương thích với MỌI khóa đang giữ trên item không?', slot: 'lk-check' },
          { type: 'op', token: 'Giao dịch muốn đụng item nào, XIN khóa item đó: lock-S để đọc, lock-X để ghi', slot: 'lk-req' },
          { type: 'op', token: 'Đọc/ghi xong nhịp nào thì unlock NGAY nhịp đó cho người sau đỡ chờ', slot: 'lk-x' },
          { type: 'op', token: 'unlock khi xong việc → lock manager đánh thức những ai trong hàng chờ hết vênh', slot: 'lk-unlock' },
          { type: 'op', token: 'Tương thích → GRANT phát chìa ngay · vênh dù một khóa → vào HÀNG CHỜ đứng im', slot: 'lk-grant' }
        ],
        drop_zones: [
          { id: 'lk-req', placeholder: 'Bước 1 — giao dịch làm gì trước khi đụng ví?', accepts: ['op'], multi: false,
            station: { icon: '🙋', label: 'Xin khóa', sub: 'Bước 1', hint: 'Đọc xin kiểu gì, ghi xin kiểu gì — hai chế độ, đúng một quầy.' } },
          { id: 'lk-check', placeholder: 'Bước 2 — quầy tra cứu cái gì?', accepts: ['op'], multi: false,
            station: { icon: '📋', label: 'Tra ma trận', sub: 'Bước 2', hint: 'Fig 18.1 — bảng 2×2 chỉ có đúng một ô "true".' } },
          { id: 'lk-grant', placeholder: 'Bước 3 — hai kết cục ở quầy', accepts: ['op'], multi: false,
            station: { icon: '🔑', label: 'Grant / xếp hàng', sub: 'Bước 3', hint: 'Không có kết cục thứ ba — và cũng không ai bị "đá văng" khỏi khóa đang giữ.' } },
          { id: 'lk-unlock', placeholder: 'Bước 4 — chìa quay về quầy lúc nào?', accepts: ['op'], multi: false,
            station: { icon: '🔓', label: 'Unlock & đánh thức', sub: 'Bước 4', hint: 'Nhả chìa thì hàng chờ được xét lại — nhưng NHẢ LÚC NÀO là cả một hồ sơ cảnh báo.' } }
        ],
        expected_sql: 'Giao dịch muốn đụng item nào, XIN khóa item đó: lock-S để đọc, lock-X để ghi Tra MA TRẬN: yêu cầu mới có tương thích với MỌI khóa đang giữ trên item không? Tương thích → GRANT phát chìa ngay · vênh dù một khóa → vào HÀNG CHỜ đứng im unlock khi xong việc → lock manager đánh thức những ai trong hàng chờ hết vênh',
        expected_zones: {
          'lk-req': 'Giao dịch muốn đụng item nào, XIN khóa item đó: lock-S để đọc, lock-X để ghi',
          'lk-check': 'Tra MA TRẬN: yêu cầu mới có tương thích với MỌI khóa đang giữ trên item không?',
          'lk-grant': 'Tương thích → GRANT phát chìa ngay · vênh dù một khóa → vào HÀNG CHỜ đứng im',
          'lk-unlock': 'unlock khi xong việc → lock manager đánh thức những ai trong hàng chờ hết vênh'
        },
        reveal_strip: true,
        reveal_complete: '💡 QUẦY ĐÃ CHẠY: xin khóa → tra ma trận → grant/xếp hàng → unlock & đánh thức. Khối "unlock NGAY từng nhịp cho người sau đỡ chờ" nghe tử tế mà là BẪY — chính là vụ $250 trong hồ sơ sách: nhả sớm để lộ trạng thái dở dang. Giữ khóa đến bao giờ mới đủ an toàn? Bài sau: 2PL. Bấm <strong>Chạy Query</strong>.',
        reveal_hints: {
          'lk-req': 'Bước 1 — luật chơi mới của Trading Floor: KHÔNG AI đụng item khi chưa ghé quầy. Ghé để làm gì?',
          'lk-check': 'Bước 1 chốt: yêu cầu nằm trên quầy. Lock manager mở bảng nào ra dò — và dò với NHỮNG khóa nào?',
          'lk-grant': 'Bước 2 chốt: đã biết vênh hay không. Hai kết cục có thể xảy ra là gì — và có ai bị tước khóa giữa chừng không?',
          'lk-unlock': 'Bước 3 chốt: chìa đã phát hoặc người đã vào hàng. Còn chiều ngược lại — chìa quay về quầy thì hàng chờ được gì?'
        }
      },
      step_4: {
        prompt: '<strong>Ticket #53 — chốt sổ ca trực:</strong> điền nốt biên bản của quầy lock manager cho 2 giao dịch đêm qua (T1 +100 trước, T2 −50 xin sau).',
        challenge_type: 'fill_blank',
        template: "-- MA TRAN TUONG THICH (Fig 18.1): chi S+S song chung\n--   S + S = doc chung ✓   ·   S + X / X + S / X + X = CHO\n\n-- 2 khach cung XEM gia listing 3001 (chi doc):\n--   moi nguoi xin khoa ____\n\n-- T1 muon GHI vi 4102 (+100):\n--   T1 phai xin khoa ____\n\n-- T2 xin X sau -> XEP HANG; T1 doc 500, ghi 600, unlock\n-- T2 duoc grant -> doc 600 -> tinh 600 - 50\n--   vi chot = ____ gem",
        blanks: [
          { id: 'b1', hint: 'S / X', expected: 'S' },
          { id: 'b2', hint: 'S / X', expected: 'X' },
          { id: 'b3', hint: '? gem', expected: '550' }
        ],
        schema: {
          table_name: 'lock table — ca trực 00:00:01',
          columns: [
            { name: 'item', type: 'thứ bị khóa', key: '' },
            { name: 'transaction', type: 'ai xin', key: '' },
            { name: 'mode', type: 'S / X', key: '🔑' },
            { name: 'trạng thái', type: 'granted / waiting', key: '' }
          ],
          data: [
            ['ví 4102', 'T1', 'X', 'GRANTED'],
            ['ví 4102', 'T2', 'X', '⏳ WAITING'],
            ['listing 3001', 'T7', 'S', 'GRANTED'],
            ['listing 3001', 'T9', 'S', 'GRANTED']
          ]
        },
        context: {
          scenario: 'Biên bản này chính là LOCK TABLE — cấu trúc thật trong mọi DBMS: từng dòng ghi ai giữ khóa gì, ai đang xếp hàng. Bạn điền đúng 3 ô là đọc được nó như nhân viên ca trực.',
          real_world: 'Postgres cho xem quầy này bằng view pg_locks; MySQL là performance_schema.data_locks. DBA soi hàng WAITING ở đó mỗi khi app "đơ không rõ lý do" — thường là một giao dịch ôm X quá lâu.',
          steps: [
            'Chỉ đọc → khóa S; nhiều S sống chung một item.',
            'Có GHI (dù kèm đọc) → phải là X.',
            'T2 bị ép đọc SAU cú ghi của T1: nháp của nó là 600.',
            '600 − 50 = 550. Không mất một gem nào.'
          ],
          hint_explore: 'Nhìn lock table bên trái: ví 4102 có một dòng WAITING — đó chính là cú "xếp hàng" đổi 450 thành 550.',
          expected: 'S · X · 550'
        },
        hints: [
          { level: 1, text: 'Ô 1: hai khách chỉ XEM giá — kiểu khóa nào cho phép cả hai cầm CÙNG LÚC?' },
          { level: 2, text: 'Ô 2: T1 sẽ GHI vào ví — kiểu khóa nào mới cho ghi? (S chỉ cho đọc.)' },
          { level: 3, text: 'Ô 3: nhờ xếp hàng, T2 đọc được 600 chứ không phải 500. Lấy 600 trừ 50.' },
          { level: 4, text: 'Đáp án: S · X · 550 — khóa không cấm đồng thời, nó chỉ ép CHỜ đúng chỗ đụng nhau.' }
        ],
        success_message: 'TICKET #53 ĐÓNG — ví chốt 550, đúng từng gem! 🔒 Lock manager đã cứu được vụ lost update… nhưng đừng vội ăn mừng: hồ sơ sách còn một trang cảnh báo — có khóa, xin đúng kiểu, mà NHẢ QUÁ SỚM vẫn đọc ra $250 sai lè. Giữ khóa đến bao giờ mới đủ? Bài sau: TWO-PHASE LOCKING — luật "chỉ gom, hết gom mới nhả" trứ danh, kèm vị khách không mời tên là DEADLOCK. ⛓️'
        ,
        xp_reward: 120
      }
    },

    /* ── nc_13 — Ticket #54 · Two-Phase Locking (Ch.18.1.3) ──
     * PART_7 Bài 3: growing/shrinking phase, lock point, 2PL đảm bảo conflict
     * serializability (xếp theo lock point), 2PL KHÔNG miễn deadlock (Fig 18.7
     * T3/T4 — cliffhanger bài 14). Kịch bản: chuyển 50 gem két CHÍNH (200) →
     * két QC (100), tổng thật 300; nhả sớm → audit đọc 250 (T1 sách); bản 2PL
     * = T3 sách. Sim thứ 6: phase_visual — thanh khóa dâng/hạ + LOCK POINT. */
    {
      id: 'nc_13', index: 13,
      title: 'Two-Phase Locking — gom cho hết, rồi mới buông',
      subtitle: 'Pha GOM chỉ xin khóa, pha NHẢ chỉ trả khóa — một luật đơn giản mua được cả serializability',
      module: 8, module_title: 'Trading Floor — Giao dịch & Concurrency',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'mcq_code',
      drag_map: {
        table: {
          name: 'wallets — DragonForge có 2 két (mẫu 2)',
          columns: ['két', 'mục đích', 'balance_gem'],
          dataRows: [
            ['A — két QUẢNG CÁO', 'trả phí banner sàn', '100'],
            ['B — két CHÍNH', 'nhận tiền bán hàng', '200']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #54',
        hook: 'Khóa S/X chạy ngon được đúng ba hôm thì bot audit réo: DragonForge chuyển <strong>50 gem</strong> từ két CHÍNH sang két QUẢNG CÁO — chuyển xong tổng vẫn phải là <strong>300</strong>, vậy mà audit chộp được khoảnh khắc tổng chỉ còn <strong>250</strong>. Soi log: giao dịch xin khóa ĐÚNG KIỂU từng két một… nhưng <em>nhả két này rồi mới gom két kia</em>. Ticket #54: khóa thôi chưa đủ — phải luật hóa cả chuyện <strong>GIỮ ĐẾN BAO GIỜ</strong>.'
      },
      step_1: {
        primer: {
          goal: [
            'TWO-PHASE LOCKING (2PL): mỗi giao dịch có đúng 2 pha — GROWING chỉ được XIN khóa, SHRINKING chỉ được NHẢ khóa; đã nhả một cái là vĩnh viễn không được xin thêm (sách 18.1.3)',
            'LOCK POINT = khoảnh khắc gom được khóa CUỐI CÙNG — xếp các giao dịch theo lock point là ra đúng một thứ tự serial tương đương: 2PL mua được conflict serializability bằng một luật cực ngắn',
            '2PL KHÔNG miễn deadlock: hai giao dịch cùng tuân luật vẫn có thể gom chéo két của nhau rồi đứng hình chờ nhau vĩnh viễn (Fig 18.7) — vị khách không mời đó là chuyện của bài sau'
          ],
          intro: 'Người dọn tiệc khôn ngoan: gom <strong>ĐỦ</strong> chìa của mọi phòng cần dọn rồi mới bắt đầu trả dần từng chìa. Kẻ vụng: trả chìa phòng 1 xong mới xin chìa phòng 2 — đúng khe đó khách quản lý bước vào phòng 1 thấy bàn ghế dọn nửa chừng. Luật 2PL chính là "đường một chiều" của việc cầm chìa: chỉ có dâng lên rồi hạ xuống, tuyệt đối không hạ rồi dâng lại.',
          example: 'Chuyển 50 gem két CHÍNH (200) → két QC (100). Bản NHẢ SỚM: khóa CHÍNH, trừ 50, <em>unlock</em>, rồi mới khóa QC — audit chen đúng khe: đọc 150 + 100 = <strong>250 SAI</strong>. Bản 2PL: gom X(CHÍNH), gom X(QC) — <strong>📍 lock point</strong> — làm việc, nhả cả hai: audit chen nhịp nào cũng bị chặn tới khi tiền về đủ chỗ, tổng luôn <strong>300</strong>.'
        },
        concept_cards: [
          {
            icon: 'fa-chart-line',
            title: 'Hai pha và lock point — theo đúng sách',
            body: 'Giao dịch bắt đầu trong <strong>growing phase</strong>, xin khóa khi cần; vừa nhả khóa đầu tiên là rơi vào <strong>shrinking phase</strong> và không được xin thêm bất kỳ khóa nào. Điểm gom được khóa cuối cùng gọi là <strong>lock point</strong> — xếp các giao dịch theo lock point chính là một thứ tự serializability của chúng.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.1.3 — The Two-Phase Locking Protocol'
          },
          {
            icon: 'fa-skull-crossbones',
            title: '2PL không phải bùa hộ mệnh toàn năng',
            body: 'Sách chỉ mặt hai khe hở còn lại: <strong>①</strong> hai giao dịch cùng tuân 2PL vẫn có thể DEADLOCK — T3 gom két B xin két A, T4 gom két A xin két B, cả hai đứng hình (Fig 18.7); <strong>②</strong> nhả khóa X trước khi commit thì kẻ khác đọc được dữ liệu CHƯA CHẮC sống — T5 sập là T6, T7 đọc theo phải sập dây chuyền (cascading rollback, Fig 18.8). Khe ② có thuốc ngay: hồ sơ Strict vs Rigorous chờ sau bài.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Vì sao mọi DBMS thương mại (Postgres, MySQL/InnoDB, SQL Server…) mặc định giữ khóa ghi <strong>đến tận COMMIT</strong> thay vì nhả ngay khi xong câu lệnh? Vì đó là strict 2PL — phiên bản 2PL vá luôn khe hở ②. Code app của bạn không phải đếm pha: cứ gói việc trong một transaction, engine tự giữ đúng luật.'
          }
        ],
        phase_visual: {
          eyebrow: 'PHASE-METER 2PL — CHUYỂN 50 GEM: KÉT CHÍNH 200 → KÉT QC 100 · TỔNG THẬT 300',
          caption: 'Chạy CẢ HAI bản mà nhìn đường khóa: bản 2PL chỉ dâng rồi hạ (một đỉnh, một lock point) — bản nhả sớm hạ rồi DÂNG LẠI: gãy luật, và audit chen đúng khe đọc 250.',
          modes: [
            {
              id: 'good', short: '2PL CHUẨN', ok: true,
              btn: '▶ Chạy bản 2PL (gom hết mới buông)',
              ops: [
                { text: 'lock-X(két CHÍNH) → GRANT', delta: 1, note: 'Pha GOM mở màn — 1 khóa trong tay.' },
                { text: 'đọc CHÍNH 200 → trừ 50 → ghi 150', delta: 0, note: 'Làm việc trong lúc vẫn GIỮ khóa — audit xin đọc lúc này là xếp hàng.' },
                { text: 'lock-X(két QC) → GRANT', delta: 1, lockpoint: true, note: '📍 LOCK POINT — khóa cuối cùng đã gom. Từ mốc này giao dịch chỉ còn đường đi xuống.' },
                { text: 'đọc QC 100 → cộng 50 → ghi 150', delta: 0, note: 'Tiền về đủ chỗ: CHÍNH 150 + QC 150 = 300.' },
                { text: 'unlock(két CHÍNH)', delta: -1, note: 'Vào pha NHẢ — trả dần, tuyệt đối không xin thêm.' },
                { text: 'unlock(két QC)', delta: -1, note: '' }
              ],
              verdict: '✓ Đường khóa MỘT ĐỈNH: dâng 1→2 rồi hạ 2→1→0. Audit chen bất kỳ nhịp nào cũng chỉ đọc được trạng thái tổng 300 — 2PL đổi một luật ngắn lấy cả serializability.'
            },
            {
              id: 'bad', short: 'NHẢ SỚM', ok: false,
              btn: '▶ Chạy bản NHẢ SỚM (đêm bị audit réo)',
              ops: [
                { text: 'lock-X(két CHÍNH) → GRANT', delta: 1, note: 'Mở màn giống hệt bản chuẩn…' },
                { text: 'đọc CHÍNH 200 → trừ 50 → ghi 150', delta: 0, note: '50 gem đã RỜI két CHÍNH — đang "bay" giữa hai két.' },
                { text: 'unlock(két CHÍNH) — nhả sớm cho thoáng', delta: -1, cls: 'warn', note: 'Khóa về 0 giữa chừng — cánh cửa mở toang đúng lúc tiền đang bay.' },
                { text: '⚡ AUDIT chen: đọc CHÍNH 150 + QC 100 → tổng 250', delta: 0, cls: 'bad', note: 'Audit xin khóa S — được GRANT NGAY vì chẳng ai giữ gì. Nó đọc đúng trạng thái dở dang.' },
                { text: 'lock-X(két QC) — xin khóa SAU KHI đã nhả', delta: 1, cls: 'bad', note: '' },
                { text: 'cộng 50 → ghi QC 150 → unlock(két QC)', delta: -1, note: 'Tiền về đủ — nhưng bản chụp 250 của audit đã kịp thành báo cáo sai.' }
              ],
              verdict: '❌ Audit đọc tổng 250 — 50 gem tàng hình đúng khe hở. Đường khóa GÃY: hạ 1→0 rồi dâng lại 0→1 = vi phạm 2PL, và đó chính là toàn bộ vụ án.'
            }
          ]
        },
        visual: {
          schema: {
            table_name: 'Luật 2PL — đường một chiều của khóa',
            columns: [
              { name: 'GROWING — chỉ XIN khóa', type: 'dâng: 0 → 1 → 2 …', key: '📈' },
              { name: '📍 LOCK POINT', type: 'khóa cuối cùng gom được', key: '' },
              { name: 'SHRINKING — chỉ NHẢ khóa', type: 'hạ: … 2 → 1 → 0', key: '📉' }
            ]
          },
          data_preview: [
            ['gom B → gom A → nhả B → nhả A', 'dâng rồi hạ', '2PL hợp lệ', '✓'],
            ['gom B → NHẢ B → gom A', 'hạ rồi dâng lại', 'vi phạm', '❌'],
            ['gom hết → làm hết → nhả hết lúc commit', 'rigorous — vẫn là 2PL', 'hợp lệ', '✓'],
            ['xếp giao dịch theo lock point', '= một thứ tự serial tương đương', 'định lý 2PL', '⭐']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'LOCK POINT của một giao dịch là gì — và vì sao nó quý đến mức thành định lý?',
            options: [
              { id: 'a', text: 'Là khoảnh khắc gom được khóa CUỐI CÙNG — xếp các giao dịch theo lock point là ra một thứ tự serial tương đương: 2PL nhờ đó đảm bảo conflict serializability', correct: true, explanation: 'Đúng — mỗi giao dịch 2PL có một đỉnh duy nhất; cả sàn chạy xen kẽ loạn xạ mà vẫn tương đương với chạy tuần tự theo thứ tự các đỉnh đó.' },
              { id: 'b', text: 'Là lúc giao dịch commit — mọi khóa được nhả tại đó', correct: false, explanation: 'Sai — lock point là đỉnh của pha GOM, có thể đến rất lâu trước commit. (Giữ khóa đến commit là chuyện của strict/rigorous — hồ sơ sau bài.)' },
              { id: 'c', text: 'Là lúc xin khóa ĐẦU TIÊN — giao dịch chính thức bước vào cuộc chơi', correct: false, explanation: 'Sai — khóa đầu tiên chỉ mở pha growing; thứ tự serial xếp theo khóa CUỐI, không phải khóa đầu.' },
              { id: 'd', text: 'Là điểm giao dịch bị deadlock nếu xin thêm khóa', correct: false, explanation: 'Sai — deadlock không dính gì tới lock point; sau lock point giao dịch không xin thêm khóa nào nữa nên càng không thể kẹt vì xin.' }
            ]
          },
          {
            question: 'T3 gom két B rồi xin két A; cùng lúc T4 gom két A rồi xin két B. Cả hai đều tuân 2PL chuẩn chỉ. Chuyện gì xảy ra?',
            options: [
              { id: 'a', text: 'Cả hai đứng hình chờ nhau vĩnh viễn — 2PL đảm bảo serializability nhưng KHÔNG đảm bảo thoát deadlock', correct: true, explanation: 'Đúng — Fig 18.7 trong sách chụp đúng cảnh này. Luật "gom hết mới buông" khiến ai cũng ôm khư khư thứ kẻ kia cần. Bài sau xử vụ này.' },
              { id: 'b', text: 'Lock manager phát hiện vênh và từ chối yêu cầu của T4 ngay từ đầu', correct: false, explanation: 'Sai — từng yêu cầu lẻ đều hợp lệ tại thời điểm xin; cái chết nằm ở TỔ HỢP hai hàng chờ, thứ lock manager thường không nhìn khi grant.' },
              { id: 'c', text: 'Không sao — 2PL bắt buộc gom khóa theo cùng một thứ tự nên không kẹt được', correct: false, explanation: 'Sai — 2PL KHÔNG quy định thứ tự gom; gom theo thứ tự thống nhất là một chiêu PHÒNG deadlock riêng (ordered locking), không nằm trong luật 2 pha.' },
              { id: 'd', text: 'Giao dịch đến sau tự động thắng vì khóa của nó "mới" hơn', correct: false, explanation: 'Sai — không có luật "mới hơn thắng"; cả hai cứ thế chờ. Các scheme phân xử theo tuổi (wait-die/wound-wait) là hồ sơ của bài sau.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: '2PL hợp lệ — hay gãy luật?',
          instruction: 'Soi đường khóa của từng kịch bản: chỉ dâng-rồi-hạ là hợp lệ.',
          xp: 20,
          chips: [
            { id: 'k1', label: 'gom X(B) → gom X(A) → nhả B → nhả A' },
            { id: 'k2', label: 'gom X(B) → NHẢ B → gom X(A)' },
            { id: 'k3', label: 'gom X(B) → gom X(A) → nhả A → xin S(C)' },
            { id: 'k4', label: 'gom đủ hết → làm việc → nhả sạch lúc commit' }
          ],
          bins: [
            { id: 'ok', label: '2PL HỢP LỆ ✓' },
            { id: 'no', label: 'GÃY LUẬT ❌' }
          ],
          solution: { k1: 'ok', k2: 'no', k3: 'no', k4: 'ok' }
        }
      },
      step_3: {
        mission: 'Lắp 4 chốt của luật 2PL cho giao dịch chuyển gem — có MỘT khối bịa (nghe cực kỳ hợp lý).',
        blocks: [
          { type: 'op', token: 'Pha GOM: xin dần từng khóa cần dùng — tuyệt đối chưa nhả cái nào', slot: 'ph-grow' },
          { type: 'op', token: 'Xong việc với két nào nhả NGAY két đó rồi gom tiếp két sau — đỡ giữ khóa lâu', slot: 'ph-x' },
          { type: 'op', token: 'LOCK POINT: khóa cuối cùng vào tay — mốc xếp thứ tự serial của cả sàn', slot: 'ph-point' },
          { type: 'op', token: 'Pha NHẢ: trả dần khóa — từ giây này không được xin thêm bất kỳ khóa nào', slot: 'ph-shrink' },
          { type: 'op', token: 'STRICT: riêng khóa X găm đến tận commit — không ai đọc được dữ liệu chưa chắc sống', slot: 'ph-strict' }
        ],
        drop_zones: [
          { id: 'ph-grow', placeholder: 'Nửa đầu đời giao dịch — được làm gì với khóa?', accepts: ['op'], multi: false,
            station: { icon: '📈', label: 'Pha GOM', sub: 'Growing', hint: 'Đường khóa chỉ có một chiều ở nửa này — chiều nào?' } },
          { id: 'ph-point', placeholder: 'Đỉnh của đường khóa là mốc gì?', accepts: ['op'], multi: false,
            station: { icon: '📍', label: 'Lock point', sub: 'Đỉnh', hint: 'Chính cái mốc làm nên định lý: xếp cả sàn theo nó là ra thứ tự serial.' } },
          { id: 'ph-shrink', placeholder: 'Nửa sau — luật cấm điều gì?', accepts: ['op'], multi: false,
            station: { icon: '📉', label: 'Pha NHẢ', sub: 'Shrinking', hint: 'Vừa nhả cái đầu tiên là cánh cửa xin-thêm đóng sập vĩnh viễn.' } },
          { id: 'ph-strict', placeholder: 'Chốt gia cố cho khóa X — giữ đến bao giờ?', accepts: ['op'], multi: false,
            station: { icon: '🔩', label: 'Strict 2PL', sub: 'Gia cố', hint: 'T5 sập mà T6, T7 đã đọc dữ liệu nó ghi thì sập cả dây chuyền — chốt này chặn đúng cảnh đó.' } }
        ],
        expected_sql: 'Pha GOM: xin dần từng khóa cần dùng — tuyệt đối chưa nhả cái nào LOCK POINT: khóa cuối cùng vào tay — mốc xếp thứ tự serial của cả sàn Pha NHẢ: trả dần khóa — từ giây này không được xin thêm bất kỳ khóa nào STRICT: riêng khóa X găm đến tận commit — không ai đọc được dữ liệu chưa chắc sống',
        expected_zones: {
          'ph-grow': 'Pha GOM: xin dần từng khóa cần dùng — tuyệt đối chưa nhả cái nào',
          'ph-point': 'LOCK POINT: khóa cuối cùng vào tay — mốc xếp thứ tự serial của cả sàn',
          'ph-shrink': 'Pha NHẢ: trả dần khóa — từ giây này không được xin thêm bất kỳ khóa nào',
          'ph-strict': 'STRICT: riêng khóa X găm đến tận commit — không ai đọc được dữ liệu chưa chắc sống'
        },
        reveal_strip: true,
        reveal_complete: '💡 LUẬT ĐÃ THÀNH HÌNH: gom → 📍 đỉnh → nhả → riêng X găm tới commit. Khối "xong két nào nhả ngay két đó" nghe tiết kiệm mà là BỊA — nó chính là bản NHẢ SỚM làm audit đọc 250: hạ rồi dâng lại là gãy 2PL. Nhưng nhớ lời sách: hai kẻ cùng tuân luật vẫn có thể ôm chéo két của nhau mà đứng hình — bài sau xử vụ đó. Bấm <strong>Chạy Query</strong>.',
        reveal_hints: {
          'ph-grow': 'Chốt 1 — nửa đầu đời giao dịch, đường khóa chỉ được phép đi LÊN. Khối nào tả đúng luật nửa này?',
          'ph-point': 'Chốt 1 xong: đang gom. Đỉnh của đường — khoảnh khắc gom được khóa CUỐI — sách đặt tên là gì và nó quý vì sao?',
          'ph-shrink': 'Qua đỉnh rồi — nửa sau chỉ còn một chiều đi xuống. Luật cấm tuyệt đối điều gì ở nửa này?',
          'ph-strict': 'Khung 2PL đủ rồi — còn một chốt GIA CỐ riêng cho khóa X: giữ đến bao giờ để kẻ khác khỏi đọc ké dữ liệu chưa commit?'
        }
      },
      step_4: {
        prompt: '<strong>Ticket #54 — soi 4 bản nháp:</strong> bốn dev nộp bốn kịch bản khóa cho giao dịch "chuyển 50 gem két CHÍNH → két QC". Chỉ MỘT bản tuân 2PL trọn vẹn — bản nào?',
        challenge_type: 'mcq_code',
        options: [
          {
            text: 'lock-X(CHÍNH) → trừ 50 → lock-X(QC) → cộng 50 → unlock(CHÍNH) → unlock(QC)',
            correct: true
          },
          {
            text: 'lock-X(CHÍNH) → trừ 50 → unlock(CHÍNH) → lock-X(QC) → cộng 50 → unlock(QC)',
            correct: false,
            explain: 'Gãy luật — unlock(CHÍNH) rồi mới lock-X(QC): hạ rồi dâng lại. Đây chính là bản NHẢ SỚM làm audit đọc 250; khe giữa unlock và lock là cửa cho kẻ khác chen.'
          },
          {
            text: 'lock-X(CHÍNH) → trừ 50 → unlock(CHÍNH) → cộng 50 vào QC (khỏi khóa — có ai đụng QC đâu)',
            correct: false,
            explain: 'Gãy kép — vừa nhả-rồi-làm-tiếp, vừa GHI vào két không giữ khóa. "Có ai đụng đâu" là lời nói dối nổi tiếng nhất Trading Floor: lost update bài 11 sinh ra đúng từ câu đó.'
          },
          {
            text: 'lock-X(CHÍNH) → lock-X(QC) → trừ 50 → unlock(CHÍNH) → cộng 50 vào QC → unlock(QC) → nhưng lỡ quên, lock-X(CHÍNH) lần nữa để check lại số dư',
            correct: false,
            explain: 'Suýt thì hợp lệ — cho tới cú "lock lại để check": đã vào pha nhả (unlock CHÍNH từ giữa chừng) mà còn xin thêm khóa là vi phạm. Muốn check lại thì phải gom đủ TRƯỚC khi nhả bất kỳ cái nào.'
          }
        ],
        schema: {
          table_name: 'đường khóa của 4 bản nháp',
          columns: [
            { name: 'bản', type: 'kịch bản lock/unlock', key: '#' },
            { name: 'đường khóa', type: 'số khóa giữ theo thời gian', key: '📈' },
            { name: '2PL?', type: 'một đỉnh duy nhất?', key: '❓' }
          ],
          data: [
            ['1', '1 → 2 → 1 → 0', '❓'],
            ['2', '1 → 0 → 1 → 0', '❓'],
            ['3', '1 → 0 (ghi không khóa)', '❓'],
            ['4', '1 → 2 → 1 → 0 → 1', '❓']
          ]
        },
        context: {
          scenario: 'Bài kiểm tra 2PL nhanh nhất không phải đọc từng lệnh — là VẼ đường khóa: đếm số khóa đang giữ sau mỗi lệnh. Đường hợp lệ có đúng MỘT đỉnh; cứ thấy hạ-rồi-dâng-lại là gãy, khỏi đọc tiếp.',
          real_world: 'Trong Postgres/InnoDB bạn không tự viết lock-X từng dòng — engine làm hộ theo strict 2PL: khóa ghi găm đến COMMIT. Bug "nhả sớm" đời thực thường mặc bộ đồ khác: tách một việc thành 2 transaction riêng để "nhanh hơn", chính là tự tay unlock giữa chừng.',
          steps: [
            'Vẽ đường khóa từng bản: cộng 1 khi lock, trừ 1 khi unlock.',
            'Bản 2: 1 → 0 → 1 — hạ rồi dâng: gãy.',
            'Bản 3: ghi vào két khi đang giữ 0 khóa — gãy kiểu khác.',
            'Bản 4: về 0 xong dâng lại 1 — cú "check lại" giết cả bản nháp.',
            'Bản 1: 1 → 2 (đỉnh) → 1 → 0 — một đỉnh duy nhất: hợp lệ.'
          ],
          hint_explore: 'Chạy lại sim Step 1: bản 2PL chuẩn vẽ đường một đỉnh, bản nhả sớm vẽ đường gãy — 4 bản nháp này chỉ là 4 biến thể của hai đường đó.',
          expected: 'Chọn bản 1 — gom đủ 2 két rồi mới bắt đầu nhả.'
        },
        hints: [
          { level: 1, text: 'Đừng đọc ngữ nghĩa vội — vẽ ĐƯỜNG KHÓA: lock = +1, unlock = −1. Đường 2PL hợp lệ trông thế nào?' },
          { level: 2, text: 'Một đỉnh duy nhất: dâng hết cỡ rồi chỉ đi xuống. Bản nào có đoạn HẠ rồi DÂNG lại?' },
          { level: 3, text: 'Bản 3 không dâng lại — nhưng nó GHI vào két lúc đang giữ 0 khóa. Locking protocol cho phép không?' },
          { level: 4, text: 'Đáp án: bản 1 — lock CHÍNH, lock QC (📍), làm việc, nhả dần. Chính là T3 trong sách.' }
        ],
        success_message: 'TICKET #54 ĐÓNG — luật 2 pha đã treo trên quầy lock manager! 📈📉 Một hồ sơ kỹ thuật đang chờ bên dưới: STRICT vs RIGOROUS — giữ khóa đến commit thì mua thêm được gì (gợi ý: chặn sập dây chuyền). Nhưng đọc xong nhớ quay lại chuyện sách bỏ lửng: T3 ôm két B xin két A, T4 ôm két A xin két B — cả hai ĐỨNG HÌNH. Bài sau: DEADLOCK, và tấm bản đồ wait-for graph soi ra kẻ phải chết. ⛓️',
        xp_reward: 120
      },
      concept_cards_after: ['nc_card_strict_rigorous']
    },

    /* ── nc_14 — Ticket #55 · Deadlock & Wait-for Graph (Ch.18.2) ──
     * PART_7 Bài 4: định nghĩa deadlock (tập giao dịch chờ vòng tròn), wait-for
     * graph (cạnh Ti→Tj = Ti chờ Tj; CYCLE ⟺ deadlock — Fig 18.13/18.14 map
     * T17..T20 → T1..T4), phòng (ordered locking, wait-die/wound-wait — Card B)
     * vs chữa (detect & rollback), victim selection 4 tiêu chí cost + chống
     * starvation. Sim thứ 7: wfg_visual — graph builder bấm thêm cạnh. */
    {
      id: 'nc_14', index: 14,
      title: 'Deadlock — vòng tròn chờ nhau đến vĩnh viễn',
      subtitle: 'Wait-for graph: cạnh là "đang chờ", vòng là deadlock — và ai đó phải làm victim',
      module: 8, module_title: 'Trading Floor — Giao dịch & Concurrency',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'fill_blank',
      drag_map: {
        table: {
          name: 'lock table lúc 03:14 — ai giữ gì, ai xin gì',
          columns: ['transaction', 'đang GIỮ', 'đang XIN', 'chờ ai'],
          dataRows: [
            ['T1 · báo cáo tuần', '—', 'S(ví DF), S(kho listing)', 'T2, T3'],
            ['T2 · thanh toán', 'X(ví DF)', 'X(đơn #9012)', 'T4'],
            ['T3 · nhập kho', 'X(kho listing)', 'X(ví DF)', 'T2'],
            ['T4 · đổi trả', 'X(đơn #9012)', 'X(kho listing)', 'T3']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #55',
        hook: '03:14 sáng — bốn giao dịch của DragonForge <strong>đứng hình</strong>. Không lỗi, không chậm, CPU ngồi chơi: thanh toán ôm ví chờ đơn, đổi trả ôm đơn chờ kho, nhập kho ôm kho chờ ví… Đúng cảnh sách cảnh báo ở bài 2PL: ai cũng tuân luật, và <em>chính vì thế</em> ai cũng ôm khư khư thứ kẻ khác cần. Ticket #55: vẽ tấm bản đồ <strong>WAIT-FOR GRAPH</strong> soi ra vòng tròn tử thần — rồi lạnh lùng chọn một kẻ phải chết cho cả hàng thông.'
      },
      step_1: {
        primer: {
          goal: [
            'DEADLOCK = tồn tại một TẬP giao dịch chờ vòng tròn: T0 chờ thứ T1 giữ, T1 chờ T2… và Tn chờ lại T0 — không ai nhúc nhích được, và KHÔNG tự tan: hệ thống phải can thiệp bằng rollback (sách 18.2)',
            'WAIT-FOR GRAPH: node = giao dịch, cạnh Ti→Tj = "Ti đang chờ Tj nhả đồ" — định lý gọn lỏn: có CYCLE ⟺ có deadlock; chờ dài cỡ nào mà không khép vòng thì vẫn chỉ là… chờ',
            'Hai trường phái: PHÒNG (gom khóa theo thứ tự thống nhất, hoặc phân xử theo tuổi — hồ sơ wait-die/wound-wait sau bài) vs CHỮA (định kỳ soi graph, thấy vòng thì chọn VICTIM rẻ nhất mà rollback — kèm luật chống tế mãi một mạng)'
          ],
          intro: 'Ngã tư kẹt cứng: xe A chờ xe B tiến, B chờ C, C chờ D, còn D… chờ đúng xe A. Không xe nào sai luật — nhưng cả ngã tư chết đứng, và sẽ chết đứng ĐẾN MAI nếu không ai chịu lùi. Cảnh sát giao thông của DBMS làm hai việc: vẽ sơ đồ "ai chờ ai" để tìm vòng, và chỉ mặt một xe bắt LÙI — chọn xe nào cho rẻ nhất là cả một cuốn sổ cost.',
          example: 'Lock table 03:14 (panel dữ liệu): T2 giữ ví chờ đơn, T4 giữ đơn chờ kho, T3 giữ kho chờ… ví của T2. Vẽ cạnh: <code>T2→T4→T3→T2</code> — <strong>vòng khép: deadlock</strong>. Còn T1 chờ cả T2 lẫn T3 nhưng KHÔNG ai chờ T1 — nó chỉ xếp hàng VÀO vòng chứ không nằm TRONG vòng: rollback T1 là tế oan mạng vô tội mà vòng vẫn nguyên.'
        },
        concept_cards: [
          {
            icon: 'fa-diagram-project',
            title: 'Wait-for graph — theo đúng sách',
            body: 'Đồ thị có hướng G = (V, E): V là toàn bộ giao dịch, cạnh <strong>Ti → Tj</strong> nghĩa là Ti đang chờ Tj nhả một data item nó cần; cạnh được thêm khi Ti xin thứ Tj giữ, và chỉ được gỡ khi Tj hết giữ thứ Ti cần. <strong>Hệ thống deadlock KHI VÀ CHỈ KHI graph chứa cycle</strong> — mọi giao dịch trong cycle đều bị kẹt. Muốn phát hiện, hệ thống định kỳ chạy thuật toán tìm vòng trên graph này.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.2.2.1 — Deadlock Detection, Fig 18.13-18.14'
          },
          {
            icon: 'fa-scale-balanced',
            title: 'Chọn victim — cuốn sổ cost của đao phủ',
            body: 'Thấy vòng rồi thì rollback ai? Sách kê 4 khoản để chọn kẻ RẺ NHẤT: đã tính toán bao lâu & còn bao lâu nữa xong · đã dùng bao nhiêu data item · còn cần thêm bao nhiêu · kéo theo bao nhiêu giao dịch khác phải rollback cùng. Kèm điều khoản nhân đạo: cộng SỐ LẦN ĐÃ BỊ TẾ vào cost — kẻo một giao dịch đen đủ đường bị chọn làm victim mãi mãi (starvation).'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Dòng <code>ERROR: deadlock detected</code> trong log Postgres chính là bạn vừa chứng kiến một cú tế victim: engine soi graph định kỳ, thấy vòng, chọn một transaction ném lỗi cho app — các giao dịch còn lại chạy tiếp như chưa có gì. Vì thế mọi cẩm nang backend đều dặn: bọc transaction trong <strong>retry</strong> — victim chết đi sống lại là chuyện thường ngày ở Trading Floor.'
          }
        ],
        wfg_visual: {
          eyebrow: 'WAIT-FOR GRAPH BUILDER — LOCK TABLE 03:14, THÊM TỪNG CẠNH MÀ SOI VÒNG',
          caption: 'Bốn cạnh đầu chờ chằng chịt mà CHƯA chết — cạnh thứ 5 khép vòng T2→T4→T3→T2 mới là deadlock. Chọn victim: bấm thẳng vào một giao dịch (sổ cost khuyên kẻ rẻ nhất).',
          nodes: [
            { id: 'T1', x: 92, y: 118, sub: 'báo cáo tuần · chỉ đọc' },
            { id: 'T2', x: 318, y: 52, sub: 'thanh toán · giữ X(ví)' },
            { id: 'T3', x: 318, y: 184, sub: 'nhập kho · giữ X(kho)' },
            { id: 'T4', x: 548, y: 118, sub: 'đổi trả · giữ X(đơn)' }
          ],
          edges: [
            { from: 'T1', to: 'T2', label: 'T1 xin S(ví DF) — T2 đang giữ X', note: 'T1 muốn ĐỌC ví cho báo cáo — ví đang bị T2 khóa X: thêm cạnh T1→T2. Mới là chờ thường.' },
            { from: 'T1', to: 'T3', label: 'T1 xin S(kho listing) — T3 giữ X', note: 'Báo cáo cần cả kho — T3 đang giữ: thêm T1→T3. T1 chờ 2 người mà vẫn chưa ai chết.' },
            { from: 'T3', to: 'T2', label: 'T3 xin X(ví DF) — T2 đang giữ', note: 'Nhập kho xong phải trừ tiền ví — ví trong tay T2: thêm T3→T2. Graph rối dần… vẫn KHÔNG có vòng.' },
            { from: 'T2', to: 'T4', label: 'T2 xin X(đơn #9012) — T4 đang giữ', note: 'Thanh toán đụng đơn đổi trả — T4 giữ: thêm T2→T4. Bốn cạnh, chờ dài — nhưng thử lần theo mũi tên: chưa quay về được điểm xuất phát.' },
            { from: 'T4', to: 'T3', label: 'T4 xin X(kho listing) — T3 đang giữ', closes: true, note: '' }
          ],
          cycle: ['T2', 'T4', 'T3'],
          deadlock_note: '🔴 CẠNH THỨ 5 KHÉP VÒNG: T2 → T4 → T3 → T2 — ba giao dịch kẹt vĩnh viễn, CPU ngồi chơi. T1 chờ VÀO vòng nhưng không nằm TRONG vòng. Giờ mở sổ cost: bấm vào giao dịch bạn muốn tế.',
          victims: {
            T1: { outside: true, note: '⚠️ T1 không nằm TRONG vòng — nó chỉ xếp hàng chờ vào. Tế T1 là oan mạng vô tội mà vòng T2→T4→T3 vẫn nguyên si. Chọn lại trong vòng đỏ.' },
            T2: { ok: false, note: 'Vòng TAN — nhưng sổ cost nhăn mặt: T2 đã chạy 40 phút thanh toán, giữ ví, kéo theo hoàn tiền dở dang. Phá được, mà là bản án ĐẮT NHẤT. Sách khuyên: chọn kẻ rẻ nhất.' },
            T3: { ok: false, note: 'Vòng TAN — nhưng T3 đang nhập nửa kho hàng, giữ nhiều item nhất hội: hoàn tác cả núi việc. Phá được vòng, trả giá không rẻ. Có mạng nào non việc hơn không?' },
            T4: { ok: true, note: '✓ CHUẨN SỔ COST: T4 mới chạy 2 giây, giữ đúng 1 khóa, chưa ghi gì mấy — rollback rẻ nhất hội. Khóa X(đơn #9012) được thả → T2 chạy tiếp → T3 → cả T1 thông theo. Victim sẽ tự retry, mất vài giây.' }
          }
        },
        visual: {
          schema: {
            table_name: 'Đọc wait-for graph trong 3 giây',
            columns: [
              { name: 'cạnh Ti → Tj', type: 'Ti đang CHỜ Tj nhả đồ', key: '→' },
              { name: 'có cycle', type: '= deadlock, không tự tan', key: '🔴' },
              { name: 'không cycle', type: '= chỉ là chờ thường', key: '🟡' }
            ]
          },
          data_preview: [
            ['T2→T4→T3→T2', 'vòng khép', 'DEADLOCK — phải tế 1 mạng', '🔴'],
            ['T1→T2, T1→T3', 'không ai chờ T1', 'chờ thường — sẽ thông', '🟡'],
            ['victim chuẩn', 'rẻ nhất: non việc, ít khóa', 'T4 (2 giây, 1 khóa)', '🗡️'],
            ['tế T1?', 'ngoài vòng', 'oan mạng — vòng vẫn nguyên', '⚠️']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Graph lúc 03:13 (TRƯỚC cạnh cuối): T1→T2, T1→T3, T3→T2, T2→T4 — bốn cạnh chờ chằng chịt. Hệ thống đã deadlock chưa?',
            options: [
              { id: 'a', text: 'CHƯA — chờ nhiều cỡ nào mà không khép VÒNG thì vẫn chỉ là chờ: T4 còn chạy, xong sẽ nhả đơn, cả chuỗi thông dần', correct: true, explanation: 'Đúng — định lý sách: deadlock ⟺ graph có cycle. Bốn cạnh này lần theo mũi tên không quay về được điểm nào — Fig 18.13 của sách chính là cảnh "rối mà chưa chết" này.' },
              { id: 'b', text: 'Rồi — 4 giao dịch cùng chờ là quá ngưỡng deadlock', correct: false, explanation: 'Sai — không có "ngưỡng số lượng" nào cả; một trăm cạnh không vòng vẫn là chờ thường, hai cạnh khép vòng (T5→T6→T5) đã là deadlock.' },
              { id: 'c', text: 'Rồi — T1 chờ tận 2 giao dịch nghĩa là nó đã kẹt cứng', correct: false, explanation: 'Sai — T1 kẹt hay không phụ thuộc T2/T3 có THOÁT được không, tức là phụ thuộc chuyện có vòng hay không; bản thân "chờ 2 người" chưa nói lên điều gì.' },
              { id: 'd', text: 'Chưa — vì deadlock chỉ xảy ra khi có ít nhất một khóa S dính vào', correct: false, explanation: 'Sai — S hay X không quan trọng, quan trọng là quan hệ CHỜ khép vòng; toàn khóa X vẫn deadlock như thường (chính vụ 03:14).' }
            ]
          },
          {
            question: 'Vòng T2→T4→T3→T2 đã hiện. Vì sao sổ cost trỏ vào T4 (2 giây, 1 khóa, chưa ghi) thay vì T2 (40 phút thanh toán) — và vì sao còn phải ĐẾM số lần một giao dịch bị tế?',
            options: [
              { id: 'a', text: 'Rollback T4 hoàn tác ít việc nhất, kéo theo ít nạn nhân nhất; còn đếm-số-lần-bị-tế để cộng vào cost — kẻo một giao dịch bị chọn làm victim mãi, không bao giờ xong việc', correct: true, explanation: 'Đúng cả hai vế — 4 tiêu chí cost + điều khoản chống starvation, đủ nguyên văn mục 18.2.2.2. Đao phủ của DBMS lạnh lùng nhưng có sổ sách.' },
              { id: 'b', text: 'Vì T4 vào hệ thống sau cùng — luật là ai đến sau chết trước', correct: false, explanation: 'Sai — "đến sau chết trước" không phải luật của detection & recovery; trẻ già chỉ là MỘT tín hiệu gián tiếp của "ít việc phải hoàn". (Phân xử thuần theo tuổi là chuyện wait-die/wound-wait — hồ sơ sau bài.)' },
              { id: 'c', text: 'Vì T4 giữ khóa X — victim bắt buộc phải là kẻ giữ X', correct: false, explanation: 'Sai — cả T2 lẫn T3 cũng giữ X; kiểu khóa không phải tiêu chí. Tiêu chí là CHI PHÍ hoàn tác.' },
              { id: 'd', text: 'Không cần chọn — rollback cả 3 cho chắc, sạch vòng tuyệt đối', correct: false, explanation: 'Sai — tế 1 mạng rẻ nhất là đủ phá vòng; giết cả 3 là đốt 40 phút của T2 + nửa kho của T3 vô nghĩa. Đao phủ giỏi chém đúng một nhát.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Deadlock — hay chỉ là chờ?',
          instruction: 'Lần theo mũi tên: khép được vòng mới là án tử.',
          xp: 20,
          chips: [
            { id: 'g1', label: 'T2→T4 · T4→T3 · T3→T2' },
            { id: 'g2', label: 'T1→T2 · T1→T3 (không ai chờ T1)' },
            { id: 'g3', label: 'T5→T6 · T6→T5' },
            { id: 'g4', label: '10 giao dịch cùng chờ 1 giao dịch đang chạy nốt' }
          ],
          bins: [
            { id: 'dl', label: 'DEADLOCK 🔴' },
            { id: 'wt', label: 'CHỈ LÀ CHỜ 🟡' }
          ],
          solution: { g1: 'dl', g2: 'wt', g3: 'dl', g4: 'wt' }
        }
      },
      step_3: {
        mission: 'Lắp quy trình 4 bước của đội xử deadlock ca đêm — có MỘT khối bịa (nghe rất chi là "để yên rồi đâu vào đấy").',
        blocks: [
          { type: 'op', token: 'Soi VÒNG trên graph: có cycle ⟺ có deadlock — chờ chằng chịt mấy cũng chưa phải án', slot: 'wf-cycle' },
          { type: 'op', token: 'Vẽ wait-for graph từ lock table: mỗi yêu cầu đang treo = một cạnh "ai chờ ai"', slot: 'wf-draw' },
          { type: 'op', token: 'Deadlock để lâu sẽ tự tan — các giao dịch chờ đủ lâu rồi cũng lần lượt tự bỏ cuộc', slot: 'wf-x' },
          { type: 'op', token: 'Rollback victim: khóa nó giữ được thả → vòng đứt → cả hàng thông, victim retry lại từ đầu', slot: 'wf-roll' },
          { type: 'op', token: 'Mở sổ cost chọn VICTIM rẻ nhất trong vòng — cộng cả số lần đã bị tế để không ai chết mãi', slot: 'wf-victim' }
        ],
        drop_zones: [
          { id: 'wf-draw', placeholder: 'Bước 1 — lấy đâu ra tấm bản đồ?', accepts: ['op'], multi: false,
            station: { icon: '🗺️', label: 'Vẽ graph', sub: 'Bước 1', hint: 'Nguyên liệu nằm sẵn trong lock table: ai GIỮ gì, ai đang XIN gì.' } },
          { id: 'wf-cycle', placeholder: 'Bước 2 — nhìn gì trên bản đồ để kết án?', accepts: ['op'], multi: false,
            station: { icon: '🔴', label: 'Soi vòng', sub: 'Bước 2', hint: 'Định lý một dòng của sách: deadlock khi và chỉ khi… gì?' } },
          { id: 'wf-victim', placeholder: 'Bước 3 — án tử trao cho ai?', accepts: ['op'], multi: false,
            station: { icon: '🗡️', label: 'Chọn victim', sub: 'Bước 3', hint: 'Đao phủ có sổ: 4 khoản chi phí + một điều khoản nhân đạo.' } },
          { id: 'wf-roll', placeholder: 'Bước 4 — chém xong thì chuyện gì xảy ra?', accepts: ['op'], multi: false,
            station: { icon: '♻️', label: 'Rollback & thông', sub: 'Bước 4', hint: 'Khóa của victim đi đâu, hàng chờ được gì, và victim có chết hẳn không?' } }
        ],
        expected_sql: 'Vẽ wait-for graph từ lock table: mỗi yêu cầu đang treo = một cạnh "ai chờ ai" Soi VÒNG trên graph: có cycle ⟺ có deadlock — chờ chằng chịt mấy cũng chưa phải án Mở sổ cost chọn VICTIM rẻ nhất trong vòng — cộng cả số lần đã bị tế để không ai chết mãi Rollback victim: khóa nó giữ được thả → vòng đứt → cả hàng thông, victim retry lại từ đầu',
        expected_zones: {
          'wf-draw': 'Vẽ wait-for graph từ lock table: mỗi yêu cầu đang treo = một cạnh "ai chờ ai"',
          'wf-cycle': 'Soi VÒNG trên graph: có cycle ⟺ có deadlock — chờ chằng chịt mấy cũng chưa phải án',
          'wf-victim': 'Mở sổ cost chọn VICTIM rẻ nhất trong vòng — cộng cả số lần đã bị tế để không ai chết mãi',
          'wf-roll': 'Rollback victim: khóa nó giữ được thả → vòng đứt → cả hàng thông, victim retry lại từ đầu'
        },
        reveal_strip: true,
        reveal_complete: '💡 ĐỘI XỬ ĐÊM ĐÃ VÀO CA: vẽ graph → soi vòng → mở sổ chọn victim → chém & thông hàng. Khối "để lâu tự tan" là BỊA trắng trợn — deadlock KHÔNG tự tan: không ai trong vòng nhúc nhích được để mà "bỏ cuộc". (Có scheme timeout thật, nhưng phải CÀI đặt hạn chờ, và sách chê: ngắn thì chém oan, dài thì kẹt lâu — hồ sơ sau bài nhắc tiếp.) Bấm <strong>Chạy Query</strong>.',
        reveal_hints: {
          'wf-draw': 'Bước 1 — muốn xử án phải có bản đồ. Dữ liệu "ai giữ gì, ai xin gì" nằm sẵn ở đâu, và biến nó thành graph kiểu gì?',
          'wf-cycle': 'Bản đồ vẽ xong: cạnh chờ chằng chịt. Định lý một dòng nào tách "rối mà sống" khỏi "án tử"?',
          'wf-victim': 'Vòng đã hiện — ai đó phải chết cho cả hàng thông. Đao phủ chọn bằng cảm tính hay bằng sổ? Sổ ghi những khoản nào?',
          'wf-roll': 'Án đã tuyên. Cú rollback làm gì với đống khóa của victim — và số phận victim sau đó ra sao?'
        }
      },
      step_4: {
        prompt: '<strong>Ticket #55 — biên bản 03:14:</strong> điền nốt hồ sơ vụ deadlock từ wait-for graph (lock table nằm ở panel trái).',
        challenge_type: 'fill_blank',
        template: "-- WAIT-FOR GRAPH luc 03:14 (canh = dang cho):\n--   T1 -> T2   ·   T1 -> T3   ·   T3 -> T2\n--   T2 -> T4   ·   T4 -> T3\n-- Lan theo mui ten: T2 -> T4 -> T3 -> quay ve T2\n\n-- So giao dich nam TRONG vong deadlock: ____\n\n-- So cost (tuoi viec / so khoa / da ghi bao nhieu):\n--   T2: 40 phut · T3: nua kho · T4: 2 giay, 1 khoa\n--   Victim re nhat: ____\n\n-- T1 cho vao vong nhung co nam TRONG vong khong (CO/KHONG): ____",
        blanks: [
          { id: 'b1', hint: '? giao dịch', expected: '3' },
          { id: 'b2', hint: 'T?', expected: 'T4' },
          { id: 'b3', hint: 'CO / KHONG', expected: 'KHONG' }
        ],
        schema: {
          table_name: 'lock table 03:14 — tang vật',
          columns: [
            { name: 'transaction', type: 'ai', key: '' },
            { name: 'đang GIỮ', type: 'khóa trong tay', key: '🔒' },
            { name: 'đang XIN', type: 'thứ đang chờ', key: '⏳' },
            { name: 'chờ ai', type: 'cạnh trên graph', key: '→' }
          ],
          data: [
            ['T1 · báo cáo', '—', 'S(ví), S(kho)', 'T2, T3'],
            ['T2 · thanh toán', 'X(ví DF)', 'X(đơn #9012)', 'T4'],
            ['T3 · nhập kho', 'X(kho listing)', 'X(ví DF)', 'T2'],
            ['T4 · đổi trả', 'X(đơn #9012)', 'X(kho listing)', 'T3']
          ]
        },
        context: {
          scenario: 'Đây là đúng tờ biên bản mà thuật toán detection điền mỗi lần chạy: đếm mạng trong vòng, mở sổ cost, khoanh victim. Điền được 3 ô này là bạn đọc wait-for graph nhanh hơn khối DBA thâm niên.',
          real_world: 'Postgres chạy detection sau mỗi deadlock_timeout (mặc định 1 giây treo); victim nhận "ERROR: deadlock detected" kèm chi tiết ai giữ gì — nội dung y hệt lock table tang vật bên trái. App tử tế bọc retry là người dùng không bao giờ biết đã có một vụ hành quyết.',
          steps: [
            'Lần mũi tên từ T2: T2→T4→T3→ quay về T2 — vòng gồm đúng 3 mạng.',
            'T1 có 2 cạnh đi RA nhưng không cạnh nào đi VÀO nó — ngoài vòng.',
            'Sổ cost: T2 40 phút, T3 nửa kho, T4 mới 2 giây 1 khóa — rẻ nhất lộ mặt.',
            'Ba ô: 3 · T4 · KHONG.'
          ],
          hint_explore: 'Chạy lại sim Step 1 tới cạnh thứ 5 — vòng đỏ nhấp nháy khoanh đúng 3 node, còn T1 đứng ngoài tái mặt.',
          expected: '3 · T4 · KHONG'
        },
        hints: [
          { level: 1, text: 'Ô 1: xuất phát từ T2, lần theo mũi tên tới khi quay về T2 — đi qua mấy giao dịch (kể cả T2)?' },
          { level: 2, text: 'Ô 2: trong 3 mạng của vòng, sổ cost so tuổi việc + số khóa + lượng đã ghi — ai non việc nhất?' },
          { level: 3, text: 'Ô 3: muốn "trong vòng" phải có đường quay VỀ mình. Có mũi tên nào trỏ vào T1 không?' },
          { level: 4, text: 'Đáp án: 3 · T4 · KHONG — tế đúng kẻ rẻ nhất, tha đúng kẻ ngoài vòng.' }
        ],
        success_message: 'TICKET #55 ĐÓNG — vòng tử thần bị chém đúng một nhát, cả hàng thông lúc 03:15! 🗡️ Hồ sơ đọc thêm bên dưới: WAIT-DIE vs WOUND-WAIT — trường phái PHÒNG bệnh phân xử bằng tuổi, khỏi cần soi graph. Bài sau leo lên tầng nhìn mới: khóa cả BẢNG hay khóa từng DÒNG? MULTIPLE GRANULARITY & INTENTION LOCKS — vì sao lock manager không điên khi một giao dịch đòi quét cả kho. 🌲',
        xp_reward: 120
      },
      concept_cards_after: ['nc_card_waitdie_woundwait']
    },

    /* ── nc_15 — Ticket #56 · Multiple Granularity & Intention Locks (Ch.18.3) ──
     * PART_7 Bài 5: khóa từng tuple tốn overhead, khóa cả bảng giết concurrency
     * → cây granularity + intention lock (IS/IX/SIX, ma trận Fig 18.16, 5 luật:
     * root trước, cha IX|SIX mới con X/SIX/IX, cha IS|IX mới con S/IS, 2-phase,
     * nhả bottom-up). IX+IX sống chung! Sim thứ 8: lock_tree_visual. */
    {
      id: 'nc_15', index: 15,
      title: 'Multiple Granularity — khóa cả bảng, hay từng dòng?',
      subtitle: 'Cây khóa SÀN → bảng → dòng + biển báo intention: đụng nhau là biết ngay từ tầng trên, khỏi soi 40.000 lá',
      module: 8, module_title: 'Trading Floor — Giao dịch & Concurrency',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'mcq_code',
      drag_map: {
        table: {
          name: 'ma trận tương thích 5 mode (Fig 18.16)',
          columns: ['đang giữ →', 'IS', 'IX', 'S', 'SIX', 'X'],
          dataRows: [
            ['xin IS', '✓', '✓', '✓', '✓', '⏳'],
            ['xin IX', '✓', '✓', '⏳', '⏳', '⏳'],
            ['xin S', '✓', '⏳', '✓', '⏳', '⏳'],
            ['xin SIX', '✓', '⏳', '⏳', '⏳', '⏳'],
            ['xin X', '⏳', '⏳', '⏳', '⏳', '⏳']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #56',
        hook: 'Nửa đêm, bot backup xin đọc <strong>TRỌN bảng listings</strong> đúng lúc 500 giao dịch đang sửa từng dòng lẻ. Khóa kiểu bài 12 là toang cả hai đường: bắt bot xin <strong>40.000 khóa dòng</strong> thì lock table phình nổ; cho nó khóa <strong>nguyên bảng</strong> thì 500 giao dịch kia đứng nghỉ. Mà kiểm tra vênh kiểu gì — chẳng lẽ so bot với từng dòng một? Ticket #56: dựng <strong>CÂY KHÓA</strong> nhiều tầng, và phát minh ăn tiền nhất chương: <strong>tấm biển báo intention</strong> cắm dọc đường.'
      },
      step_1: {
        primer: {
          goal: [
            'Data item có NHIỀU CỠ: cả sàn → bảng → dòng, lồng nhau thành cây — khóa node nào là khóa NGẦM trọn subtree dưới nó: bot backup chỉ cần 1 khóa S ở node bảng thay vì 40.000 khóa dòng (sách 18.3)',
            'INTENTION LOCK = biển báo cắm từ root xuống: IS "bên dưới có người sắp ĐỌC", IX "bên dưới có người sắp GHI" — ai xin khóa to ở tầng trên chỉ việc nhìn biển tại node đó, KHỎI quét từng lá; và IX+IX sống chung vô tư (xung đột thật nếu có sẽ lộ ở dưới lá)',
            '5 luật đi cây: khóa ROOT trước · muốn S/IS phải có cha IS|IX · muốn X/SIX/IX phải có cha IX|SIX · vẫn phải 2-phase (bài 13) · nhả NGƯỢC chiều lá→gốc — cắm biển đi xuống, nhổ biển đi lên'
          ],
          intro: 'Khách sạn nghìn phòng: muốn sửa ống nước phòng 304, thợ không khóa cả khách sạn — anh ta treo biển "đang thi công tầng 3" ở sảnh (IX), treo tiếp ở cầu thang tầng 3 (IX), rồi khóa đúng phòng 304 (X). Đoàn khách muốn thuê NGUYÊN tầng 3 chỉ cần liếc tấm biển ở cầu thang là biết phải chờ — không phải gõ cửa thử 100 phòng. Biển báo rẻ, cắm nhanh, mà cứu cả hệ thống khỏi đi soi từng cánh cửa.',
          example: 'T1 sửa giá dòng <code>#3001</code>: cắm <strong>IX(SÀN) → IX(listings) → X(#3001)</strong>. Bot T2 xin đọc trọn bảng: <strong>IS(SÀN) → S(listings)</strong> — tới node bảng đụng biển IX của T1: <strong>vênh, xếp hàng</strong>, tổng cộng nhìn đúng 1 node. T3 đọc dòng <code>#3002</code>: IS → IS → S(#3002) — IS với IX <strong>sống chung</strong>, chẳng ai chờ ai.'
        },
        concept_cards: [
          {
            icon: 'fa-sitemap',
            title: 'Intention lock — theo đúng sách',
            body: 'Node khóa ở <strong>intention mode</strong> nghĩa là việc khóa tường minh đang diễn ra ở TẦNG THẤP HƠN của subtree. Muốn khóa node Q, giao dịch phải đi từ ROOT xuống Q, cắm intention lock lên từng node dọc đường. <strong>IS</strong> — bên dưới sẽ có khóa đọc; <strong>IX</strong> — bên dưới sẽ có khóa ghi; <strong>SIX</strong> — đọc trọn subtree này (S) VÀ sẽ ghi lác đác vài chỗ dưới (IX). Nhờ biển báo, hệ thống khỏi search toàn bộ cây khi xét vênh.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.3 — Multiple Granularity, Fig 18.15-18.16'
          },
          {
            icon: 'fa-handshake',
            title: 'Vì sao IX + IX sống chung?',
            body: 'Hai biển "đang thi công đâu đó bên dưới" không cãi nhau — T1 sửa dòng #3001, T5 sửa dòng #3007: cả hai cắm IX lên cùng node bảng, và <strong>ma trận nói ✓</strong>. Nếu họ đụng CÙNG một dòng thì xung đột lộ ra ở tầng lá (X vs X) — đúng nơi nó thuộc về. Biển báo chỉ cảnh giới với khóa THẬT cỡ to: S cả bảng nhìn thấy IX là phải chờ, vì "đọc trọn bảng" đụng mọi thứ bên dưới.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Postgres: <code>UPDATE listings SET price=99 WHERE listing_id=3001</code> lấy <strong>RowExclusiveLock trên bảng</strong> (họ hàng của IX) + khóa X trên đúng tuple; còn <code>pg_dump</code> lấy AccessShareLock cấp bảng. Soi <code>pg_locks</code> sẽ thấy cả cây biển báo này nằm sờ sờ — giờ bạn đọc được nó là ai đang định làm gì ở tầng nào.'
          }
        ],
        lock_tree_visual: {
          eyebrow: 'CÂY KHÓA GAMEHUB — T1 SỬA DÒNG · T2 BACKUP CẢ BẢNG · T3 ĐỌC DÒNG KHÁC',
          caption: 'Bấm từng nhịp: T1 cắm biển IX xuống tận dòng; T2 xin S cả bảng — đụng biển ngay node listings, khỏi soi 40.000 lá; T3 cắm IS đọc dòng khác — sống chung vui vẻ.',
          nodes: [
            { id: 'root', label: '🏛️ SÀN GAMEHUB', x: 320, y: 34, sub: 'root — khóa đầu tiên' },
            { id: 'listings', label: '📦 listings', x: 180, y: 108, parent: 'root', sub: '40.000 dòng' },
            { id: 'orders', label: '🧾 orders', x: 480, y: 108, parent: 'root', sub: '100.000 dòng' },
            { id: 'r3001', label: '#3001', x: 90, y: 186, parent: 'listings', sub: 'Kiếm gỗ · 45' },
            { id: 'r3002', label: '#3002', x: 270, y: 186, parent: 'listings', sub: 'Giáp rồng · 12.500' }
          ],
          steps: [
            { node: 'root', txn: 'T1', mode: 'IX', result: 'grant', note: 'T1 muốn sửa giá dòng #3001 — luật 1: khóa ROOT trước. Cắm biển IX: "bên dưới sắp có người ghi".' },
            { node: 'listings', txn: 'T1', mode: 'IX', result: 'grant', note: 'Xuống một tầng, cắm tiếp IX lên bảng listings — dọc đường đi đâu cắm biển đó.' },
            { node: 'r3001', txn: 'T1', mode: 'X', result: 'grant', note: 'Tới đích: khóa X THẬT lên đúng dòng #3001. Cả cây giờ biết: có người ghi ở nhánh này.' },
            { node: 'root', txn: 'T2', mode: 'IS', result: 'grant', note: 'Bot backup vào — xin đọc TRỌN bảng listings. Cắm IS lên root: IS với IX của T1 sống chung ✓.' },
            { node: 'listings', txn: 'T2', mode: 'S', result: 'wait', note: '⏳ T2 xin S NGUYÊN BẢNG — nhưng node này có biển IX của T1: S vênh IX → XẾP HÀNG. Để ý: hệ thống nhìn đúng MỘT node, không soi dòng nào cả.' },
            { node: 'root', txn: 'T3', mode: 'IS', result: 'grant', note: 'T3 chỉ đọc MỘT dòng #3002 — cắm IS lên root, vẫn êm.' },
            { node: 'listings', txn: 'T3', mode: 'IS', result: 'grant', note: 'IS lên bảng: IS + IX (T1) sống chung ✓ — biển báo không cãi biển báo.' },
            { node: 'r3002', txn: 'T3', mode: 'S', result: 'grant', note: 'S lên đúng dòng #3002 — khác dòng của T1: chẳng ai đợi ai. Khóa đúng CỠ là concurrency sống.' }
          ],
          verdict: '✓ Toàn cảnh: T1 ghi 1 dòng, T3 đọc 1 dòng — chạy song song; chỉ T2 (đòi TRỌN bảng) phải chờ, và nó biết điều đó sau đúng MỘT cú nhìn biển. Khi T1 xong: nhả NGƯỢC lá→gốc (X(#3001) → IX(listings) → IX(SÀN)) — T2 được đánh thức.'
        },
        visual: {
          schema: {
            table_name: '5 mode — ai vênh ai (Fig 18.16)',
            columns: [
              { name: 'IS — dưới có người đọc', type: 'sống chung IS/IX/S/SIX', key: '🪧' },
              { name: 'IX — dưới có người ghi', type: 'sống chung IS/IX', key: '🪧' },
              { name: 'SIX = S + IX', type: 'đọc trọn + ghi lác đác', key: '🔀' }
            ]
          },
          data_preview: [
            ['IX + IX', 'cùng node bảng', 'sống chung — đụng thật thì lộ ở lá', '✓'],
            ['S + IX', 'bot backup vs người sửa dòng', 'vênh — đọc trọn đụng mọi thứ dưới', '⏳'],
            ['sửa 1 dòng', 'IX(SÀN) → IX(bảng) → X(dòng)', 'bộ khóa chuẩn giáo khoa', '⭐'],
            ['nhả khóa', 'NGƯỢC chiều: lá → gốc', 'con sạch mới được nhả cha', '↩️']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Bot T2 xin S nguyên bảng listings (40.000 dòng). Nhờ đâu hệ thống biết NGAY nó phải chờ — mà không soi một dòng nào?',
            options: [
              { id: 'a', text: 'Nhờ biển IX mà T1 đã cắm TẠI node bảng trên đường đi xuống — S vênh IX ngay tại đó: một cú nhìn, một kết luận', correct: true, explanation: 'Đúng — đó là toàn bộ lý do intention lock tồn tại: dồn thông tin "bên dưới đang có gì" lên các node tổ tiên, để khóa cỡ to xét vênh trong O(1) thay vì quét subtree.' },
              { id: 'b', text: 'Nhờ hệ thống quét nhanh 40.000 dòng bằng index nên tưởng như tức thì', correct: false, explanation: 'Sai — không quét gì cả; nếu phải quét thì lock table đã nổ trước khi kịp "nhanh". Biển báo sinh ra để KHỎI quét.' },
              { id: 'c', text: 'Nhờ T1 đăng ký trước lịch sửa dòng vào một bảng lịch chung', correct: false, explanation: 'Sai — không có "bảng lịch" nào; chính chuỗi biển IS/IX cắm dọc đường LÀ bản đăng ký, nằm ngay trên cây khóa.' },
              { id: 'd', text: 'Vì S cả bảng luôn phải chờ mọi giao dịch khác xong hết', correct: false, explanation: 'Sai — nếu bên dưới chỉ toàn người ĐỌC (biển IS), S cả bảng được grant ngay: S sống chung IS. Nó chỉ chờ khi có biển IX/SIX/X.' }
            ]
          },
          {
            question: 'T1 đang giữ IX(SÀN) → IX(listings) → X(#3001). Nó xong việc — theo luật cây, nhả khóa theo chiều nào, và vì sao không được nhả IX(listings) trước?',
            options: [
              { id: 'a', text: 'Nhả NGƯỢC lá→gốc: X(#3001) trước, rồi IX(listings), rồi IX(SÀN) — nhổ biển ở tầng trên khi lá còn khóa là biển nói dối: kẻ khác tưởng nhánh sạch mà xông vào', correct: true, explanation: 'Đúng — luật "chỉ được nhả node khi không còn giữ con nào của nó": biển báo phải sống lâu hơn thứ nó đang báo.' },
              { id: 'b', text: 'Nhả xuôi gốc→lá cho giải phóng tầng to trước, concurrency hồi nhanh hơn', correct: false, explanation: 'Sai và nguy hiểm — IX(listings) biến mất trong khi X(#3001) còn đó: bot xin S cả bảng thấy node bảng "sạch biển", được grant, và đọc xuyên qua dòng đang bị ghi dở.' },
              { id: 'c', text: 'Nhả theo thứ tự nào cũng được, miễn tuân 2PL', correct: false, explanation: 'Sai — 2PL quản CHUYỆN KHI NÀO (hết gom mới nhả), còn luật cây quản THỨ TỰ giữa các tầng: cả hai cùng lúc.' },
              { id: 'd', text: 'Không cần nhả — commit là mọi khóa tự bốc hơi cùng lúc', correct: false, explanation: 'Nửa đúng nửa lười: strict/rigorous giữ ĐẾN commit thật, nhưng lúc tháo, hệ thống vẫn tháo theo trật tự lá→gốc — trật tự đó là của luật cây, không phải của commit.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Cùng một node bảng — sống chung hay chờ?',
          instruction: 'Tra ma trận Fig 18.16 cho từng cặp (đang giữ + xin mới) trên node listings.',
          xp: 20,
          chips: [
            { id: 'p1', label: 'Đang IS (sắp đọc vài dòng) — xin IX' },
            { id: 'p2', label: 'Đang IX (sắp ghi vài dòng) — xin IX' },
            { id: 'p3', label: 'Đang IX — xin S nguyên bảng' },
            { id: 'p4', label: 'Đang SIX — xin IX' }
          ],
          bins: [
            { id: 'g', label: 'SỐNG CHUNG ✓' },
            { id: 'w', label: 'XẾP HÀNG ⏳' }
          ],
          solution: { p1: 'g', p2: 'g', p3: 'w', p4: 'w' }
        }
      },
      step_3: {
        mission: 'Lắp 4 luật đi cây của multiple granularity — có MỘT khối bịa (nghe cực kỳ "cho nhanh").',
        blocks: [
          { type: 'op', token: 'Cắm biển INTENTION (IS/IX) lên từng node dọc đường từ gốc xuống — báo trước cho tầng trên', slot: 'gr-intent' },
          { type: 'op', token: 'Khóa ROOT của cây trước tiên — chưa qua cổng sàn thì chưa được xuống bất kỳ tầng nào', slot: 'gr-root' },
          { type: 'op', token: 'Xin thẳng khóa X tại đúng dòng cần sửa — khỏi phiền các tầng trên cho nhanh', slot: 'gr-x' },
          { type: 'op', token: 'Nhả khóa NGƯỢC chiều lá→gốc — con còn khóa thì cha chưa được nhổ biển', slot: 'gr-unlock' },
          { type: 'op', token: 'Tới node đích mới hạ khóa THẬT (S để đọc / X để ghi) — đúng cỡ việc định làm', slot: 'gr-leaf' }
        ],
        drop_zones: [
          { id: 'gr-root', placeholder: 'Luật 1 — hành trình bắt đầu ở đâu?', accepts: ['op'], multi: false,
            station: { icon: '🏛️', label: 'Cổng sàn', sub: 'Luật 1', hint: 'Cây có đúng một lối vào — sách cho khóa root ở mode nào cũng được.' } },
          { id: 'gr-intent', placeholder: 'Luật 2 — dọc đường xuống làm gì?', accepts: ['op'], multi: false,
            station: { icon: '🪧', label: 'Cắm biển', sub: 'Luật 2', hint: 'Muốn con X/IX phải có cha IX|SIX; muốn con S/IS phải có cha IS|IX — tức là dọc đường phải để lại gì đó.' } },
          { id: 'gr-leaf', placeholder: 'Luật 3 — tới đích thì sao?', accepts: ['op'], multi: false,
            station: { icon: '🎯', label: 'Khóa thật', sub: 'Luật 3', hint: 'Biển báo chỉ là báo — việc đọc/ghi cần thứ khóa "xịn" đúng cỡ.' } },
          { id: 'gr-unlock', placeholder: 'Luật 4 — rút quân chiều nào?', accepts: ['op'], multi: false,
            station: { icon: '↩️', label: 'Nhổ biển', sub: 'Luật 4', hint: 'Biển phải sống lâu hơn thứ nó đang báo — suy ra chiều tháo.' } }
        ],
        expected_sql: 'Khóa ROOT của cây trước tiên — chưa qua cổng sàn thì chưa được xuống bất kỳ tầng nào Cắm biển INTENTION (IS/IX) lên từng node dọc đường từ gốc xuống — báo trước cho tầng trên Tới node đích mới hạ khóa THẬT (S để đọc / X để ghi) — đúng cỡ việc định làm Nhả khóa NGƯỢC chiều lá→gốc — con còn khóa thì cha chưa được nhổ biển',
        expected_zones: {
          'gr-root': 'Khóa ROOT của cây trước tiên — chưa qua cổng sàn thì chưa được xuống bất kỳ tầng nào',
          'gr-intent': 'Cắm biển INTENTION (IS/IX) lên từng node dọc đường từ gốc xuống — báo trước cho tầng trên',
          'gr-leaf': 'Tới node đích mới hạ khóa THẬT (S để đọc / X để ghi) — đúng cỡ việc định làm',
          'gr-unlock': 'Nhả khóa NGƯỢC chiều lá→gốc — con còn khóa thì cha chưa được nhổ biển'
        },
        reveal_strip: true,
        reveal_complete: '💡 BỐN LUẬT ĐÃ VÀO CÂY: qua cổng root → cắm biển dọc đường → khóa thật tại đích → rút quân lá-về-gốc. Khối "xin thẳng X tại dòng, khỏi phiền tầng trên" là BỊA — thiếu biển IX dọc đường thì bot xin S cả bảng sẽ thấy node listings SẠCH, được grant, và đọc xuyên dòng bạn đang ghi dở: chính cái thảm họa mà biển báo sinh ra để chặn. Bấm <strong>Chạy Query</strong>.',
        reveal_hints: {
          'gr-root': 'Luật 1 — cây có một lối vào duy nhất. Node nào phải khóa TRƯỚC TIÊN, bất kể bạn định xuống đâu?',
          'gr-intent': 'Qua cổng rồi — giờ đi xuống. Luật cha-con (cha IX|SIX mới được con X…) ép bạn làm gì ở TỪNG node dọc đường?',
          'gr-leaf': 'Biển cắm đủ rồi — tới node đích. Biển là "sắp làm"; còn LÀM thật thì hạ khóa gì?',
          'gr-unlock': 'Xong việc. Nhớ: biển ở tầng trên đang BÁO cho khóa ở tầng dưới — vậy được nhổ thứ nào trước?'
        }
      },
      step_4: {
        prompt: '<strong>Ticket #56 — vé đi cây:</strong> T1 cần <em>sửa giá đúng MỘT dòng #3001</em> trong listings. Bốn bộ khóa được đề xuất — bộ nào ĐÚNG LUẬT cây mà vẫn giữ concurrency cao nhất?',
        challenge_type: 'mcq_code',
        options: [
          {
            text: 'IX(SÀN) → IX(listings) → X(#3001)',
            correct: true
          },
          {
            text: 'IS(SÀN) → IS(listings) → X(#3001)',
            correct: false,
            explain: 'Gãy luật cha-con — muốn X ở dòng thì cha phải IX hoặc SIX; IS chỉ báo "sắp ĐỌC bên dưới", cắm IS rồi xuống GHI là biển nói dối: bot xin S cả bảng sẽ tưởng nhánh này chỉ có người đọc.'
          },
          {
            text: 'X(SÀN) — một khóa duy nhất, chắc cú tuyệt đối',
            correct: false,
            explain: 'Đúng luật (root khóa mode nào cũng được) nhưng trật mục tiêu thảm hại: X ở root khóa NGẦM toàn bộ sàn — 500 giao dịch khác đứng nghỉ vì một dòng giá. Multiple granularity sinh ra để tránh đúng cảnh này.'
          },
          {
            text: 'IX(listings) → X(#3001) — khỏi đụng tới SÀN cho gọn',
            correct: false,
            explain: 'Thiếu cổng — luật 1 bắt khóa ROOT trước tiên. Bỏ qua root thì giao dịch khác khóa X(SÀN) sẽ không hề biết bên dưới có bạn: hai người cùng tưởng mình độc quyền.'
          }
        ],
        schema: {
          table_name: 'cây khóa — đường đi của T1',
          columns: [
            { name: 'tầng', type: 'node trên cây', key: '🌲' },
            { name: 'khóa cần', type: 'theo luật cha-con', key: '🔒' },
            { name: 'vì sao', type: '', key: '' }
          ],
          data: [
            ['SÀN (root)', '❓', 'luật 1: qua cổng trước'],
            ['bảng listings', '❓', 'cha của dòng phải IX|SIX'],
            ['dòng #3001', '❓', 'việc thật: GHI giá mới'],
            ['(nhả)', 'lá → gốc', 'biển sống lâu hơn thứ nó báo']
          ]
        },
        context: {
          scenario: 'Đây chính là ví dụ T22 trong sách (sửa 1 record trong file Fa) đổi tên GameHub: bộ ba IX-IX-X là "chữ ký" kinh điển của mọi cú UPDATE một dòng trong DBMS thật.',
          real_world: 'Chạy UPDATE 1 dòng trong Postgres rồi soi pg_locks: bạn sẽ thấy RowExclusiveLock (vai IX) trên bảng + khóa tuple — đúng bộ này. Còn ai đó lỡ tay LOCK TABLE ... IN ACCESS EXCLUSIVE MODE (vai X cả bảng) giờ cao điểm thì Slack của team sẽ đỏ rực.',
          steps: [
            'Việc thật là GHI 1 dòng → tại dòng cần X.',
            'Cha của X phải là IX hoặc SIX → bảng listings: IX.',
            'Luật 1: root khóa trước → SÀN: IX (cũng vì cha của IX phải IX|SIX).',
            'So 4 bộ: chỉ bộ 1 vừa đúng luật vừa để 500 giao dịch kia sống.'
          ],
          hint_explore: 'Chạy lại sim Step 1 ba nhịp đầu — đường T1 cắm xuống #3001 chính là đáp án nằm sẵn.',
          expected: 'Chọn bộ IX(SÀN) → IX(listings) → X(#3001).'
        },
        hints: [
          { level: 1, text: 'Đi ngược từ ĐÍCH: sửa giá = GHI một dòng → dòng #3001 cần khóa gì?' },
          { level: 2, text: 'Luật cha-con: muốn con X, cha phải IX hoặc SIX. Vậy bảng listings cắm gì?' },
          { level: 3, text: 'Bộ X(SÀN) không sai luật — nó sai ở CHỖ KHÁC. Câu hỏi đòi thêm điều gì ngoài "đúng luật"?' },
          { level: 4, text: 'Đáp án: IX(SÀN) → IX(listings) → X(#3001) — chữ ký chuẩn của UPDATE một dòng.' }
        ],
        success_message: 'TICKET #56 ĐÓNG — cây khóa dựng xong, biển báo cắm đủ, bot backup hết phá đêm! 🌲 Hồ sơ đọc thêm bên dưới: LOCK ESCALATION — khi lock table phình nổ vì vạn khóa dòng, engine đổi cả nắm lấy MỘT khóa bảng. Nhưng đừng tưởng khóa dòng + khóa bảng là đã kín: bài sau có CON MA — giao dịch đếm hai lần ra hai số khác nhau mà không dòng nào bị đụng. PHANTOM. 👻',
        xp_reward: 120
      },
      concept_cards_after: ['nc_card_lock_escalation']
    },

    /* ── nc_16 — Ticket #57 · Phantom & Index Locking (Ch.18.4) ──
     * PART_7 Bài 6: predicate read (count(*) WHERE) vs insert/update — xung đột
     * trên tuple CHƯA TỒN TẠI (map count Physics + insert Feynman → đếm <100 +
     * chèn Kiếm gỗ 45); tuple-lock mù với ma; index-locking protocol: lookup
     * S-lock lá, insert/delete/update X-lock lá bị ảnh hưởng → ma thành xung
     * đột thật. Sim TÁI DÙNG txn_visual (bộ đếm thay ví — đúng thiết kế
     * data-driven đợt 7). Step-4 full_ide COUNT(*) — probe c1-c4 sạch. */
    {
      id: 'nc_16', index: 16,
      title: 'Phantom — con ma lọt lưới khóa dòng',
      subtitle: 'Đếm hai lần ra hai số mà không dòng nào bị đụng: xung đột nằm trên tuple CHƯA TỒN TẠI',
      module: 8, module_title: 'Trading Floor — Giao dịch & Concurrency',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'full_ide',
      drag_map: {
        table: {
          name: 'listings — kho món đang bán (mẫu 6)',
          columns: ['listing_id', 'item_name', 'price'],
          dataRows: [
            ['3001', 'Kiếm gỗ Newbie', '45'],
            ['3002', 'Giáp rồng Huyền thoại', '12500'],
            ['3005', 'Khiên gỗ sồi', '80'],
            ['3008', 'Mũ vải thô', '35'],
            ['3011', 'Skin Hỏa Long', '790'],
            ['3013', 'Nhẫn dây thừng', '510']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #57',
        hook: 'Bot kiểm kê chạy MỘT giao dịch: đếm "món dưới 100 gem" đầu phiên ra <strong>3</strong>, cuối phiên đếm lại ra <strong>4</strong>. Soi log muốn lòi mắt: cả 3 dòng bot khóa S còn nguyên si, chẳng ai đụng vào. Thủ phạm không nằm trong 3 dòng đó — nó là dòng <strong>CHƯA TỒN TẠI</strong> lúc bot giăng khóa: seller vừa đăng "Kiếm gỗ 45 gem" ngay giữa hai lần đếm. Ticket #57: con ma xuyên qua mọi khóa dòng — vì <em>không thể khóa thứ chưa sinh ra</em>. 👻'
      },
      step_1: {
        primer: {
          goal: [
            'PREDICATE READ = đọc theo ĐIỀU KIỆN (WHERE price < 100): thứ bạn đụng không chỉ là các dòng tìm thấy, mà cả THÔNG TIN "bảng đang có những dòng nào thỏa điều kiện" (sách 18.4.3)',
            'PHANTOM: T2 chèn (hoặc SỬA giá món khác lọt vào vùng <100) — tuple mới không tồn tại lúc T1 giăng khóa nên tuple-lock MÙ: hai giao dịch không chạm dòng chung nào mà vẫn xung đột — xung đột trên con ma',
            'Thuốc chữa INDEX-LOCKING: lookup phải khóa S các LÁ index nó đọc; insert/delete/update phải khóa X các lá bị ảnh hưởng — chèn món 45 gem đụng đúng lá [0..100) mà bot đang giữ S → ma bị bắt TRƯỚC khi thành hình'
          ],
          intro: 'Kiểm lâm đêm đếm thú trong chuồng: khóa từng chuồng CÓ thú, đếm được 3 con. Nửa đêm ai đó thả thêm một con vào <em>chuồng trống</em> — chuồng ấy có bị khóa đâu, lúc đếm nó đâu có thú! Sáng đếm lại: 4. Không ổ khóa nào bị phá — kẽ hở nằm ở chỗ kiểm lâm khóa CHUỒNG CÓ THÚ, trong khi thứ cần khóa là <strong>tấm sổ ghi "khu này đang có những chuồng nào có thú"</strong>.',
          example: 'T1: <code>SELECT COUNT(*) FROM listings WHERE price &lt; 100</code> → 3, khóa S cả 3 dòng. T2: <code>INSERT Kiếm gỗ 45 gem</code> — dòng mới, X cấp ngay, chẳng vênh ai. T1 đếm lại: <strong>4</strong>. Với index-locking: T1 giữ S trên <strong>lá index [0..100)</strong>; T2 muốn chèn 45 phải X đúng lá đó → <strong>xếp hàng</strong> — hai lần đếm cùng ra 3.'
        },
        concept_cards: [
          {
            icon: 'fa-ghost',
            title: 'Xung đột trên con ma — theo đúng sách',
            body: 'T30 đếm <code>count(*)</code> các instructor khoa Physics; T31 chèn Feynman vào Physics. Nếu T30 đếm CÓ Feynman → T31 phải đứng trước trong thứ tự serial; đếm KHÔNG có → T30 đứng trước. Hai giao dịch <strong>không truy cập tuple chung nào mà vẫn xung đột</strong> — trên một <em>phantom tuple</em>. Kiểm soát ở mức tuple sẽ ĐỂ LỌT xung đột này, và schedule không-serializable trót lọt qua mặt hệ thống.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.4.3 — Predicate Reads and the Phantom Phenomenon'
          },
          {
            icon: 'fa-leaf',
            title: 'Index-locking — bẫy ma đặt trên lá',
            body: 'Mọi bảng phải có ít nhất một index; mọi lookup đi qua index và <strong>khóa S các lá nó đọc</strong>; mọi insert/delete/update phải <strong>khóa X các lá bị ảnh hưởng</strong> (lá chứa search-key trước/sau thao tác). Con ma hết đường: muốn thành hình, nó phải ghi vào đúng cái lá mà predicate read đang giữ — <em>xung đột trên ma biến thành xung đột thật trên lá index</em>. Cái giá: khóa lá thô hơn cần thiết — hai insert vào cùng lá vẫn phải xếp hàng dù chẳng liên quan.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Đặt vé máy bay: bạn search "còn ghế trống hàng 12" thấy 2 ghế, chọn 12A — đúng lúc đó hãng NHẢ thêm ghế 12C từ quota đối tác. Search của bạn là predicate read, ghế 12C là con ma. Các DBMS thật xử bằng họ hàng của index-locking (Card D + next-key locking) hoặc bằng snapshot — hồ sơ lớn của bài 18. Gặp bug "đếm lệch dù chẳng ai sửa dòng cũ", giờ bạn biết gọi tên nó.'
          }
        ],
        txn_visual: {
          eyebrow: 'CON MA KIỂM KÊ — COUNT(price<100) · T1 BOT ĐẾM 2 LẦN · T2 SELLER ĐĂNG MÓN 45 GEM',
          caption: 'Chạy CẢ HAI chế độ: tuple-lock kín từng dòng mà ma vẫn chui (3 → 4); index-locking khóa cái LÁ [0..100) — T2 xếp hàng, hai lần đếm cùng ra 3.',
          wallet_label: '🔢 COUNT(price < 100)',
          start: 3, unit: 'món',
          t1_label: '🤖 T1 — bot kiểm kê (1 giao dịch, đếm 2 lần)',
          t2_label: '🛒 T2 — seller đăng món mới',
          modes: [
            {
              id: 'tuple', short: 'TUPLE-LOCK', ok: false,
              btn: '▶ Chạy kiểu KHÓA TỪNG DÒNG',
              steps: [
                { who: 't1', text: 'đếm <100 → 3 món · khóa S cả 3 dòng tìm thấy', note: 'Bài 12 dạy gì làm nấy: dòng nào đọc là khóa dòng đó — nghe kín kẽ tuyệt đối.' },
                { who: 't2', text: 'INSERT Kiếm gỗ · 45 gem → X(dòng MỚI) — GRANT NGAY', cls: 'warn', note: 'Dòng này CHƯA TỒN TẠI lúc T1 giăng lưới — chẳng khóa nào của T1 với tới nó. Con ma vừa chui qua đúng khe đó.' },
                { who: 't2', text: 'commit — món 45 gem lên sàn', note: 'T2 xong xuôi êm đẹp, không chờ một giây nào.' },
                { who: 't1', text: 'đếm LẠI trong cùng giao dịch → 4 ?!', wallet: 4, cls: 'bad', note: '' }
              ],
              verdict: '❌ Cùng một giao dịch, hai lần đếm: 3 rồi 4 — mà cả 3 dòng T1 khóa còn NGUYÊN. Xung đột nằm trên dòng chưa-tồn-tại: PHANTOM. Khóa dòng nhiều cỡ nào cũng mù với ma.'
            },
            {
              id: 'index', short: 'INDEX-LOCKING', ok: true,
              btn: '▶ Chạy kiểu KHÓA LÁ INDEX',
              steps: [
                { who: 't1', text: 'đếm <100 → 3 món · khóa S LÁ INDEX [0..100)', note: 'Khác biệt duy nhất: T1 khóa luôn tấm sổ "món dưới 100 nằm đây" — cái LÁ index nó vừa đọc.' },
                { who: 't2', text: '⏳ INSERT 45 gem → phải X(lá [0..100)) → XẾP HÀNG', cls: 'wait', note: 'Muốn chèn món 45, T2 buộc phải sửa ĐÚNG cái lá T1 đang giữ S — vênh → chờ. Ma bị bắt trước khi thành hình.' },
                { who: 't1', text: 'đếm lại → vẫn 3 ✓', wallet: 3, cls: 'ok', note: 'Hai lần đếm một con số — serializable thở lại được.' },
                { who: 't1', text: 'commit → T2 được grant, món 45 lên sàn SAU', note: '' }
              ],
              verdict: '✓ Index-locking biến xung-đột-trên-ma thành xung đột THẬT trên lá index — T2 chỉ chậm một nhịp, còn sổ kiểm kê thì đúng tuyệt đối.'
            }
          ]
        },
        visual: {
          schema: {
            table_name: 'Lá index price — bẫy ma nằm đây',
            columns: [
              { name: 'lá [0..100)', type: '45 · 35 · 80 — T1 giữ S', key: '🍃' },
              { name: 'lá [100..1000)', type: '510 · 790', key: '🍃' },
              { name: 'lá [1000..∞)', type: '12.500', key: '🍃' }
            ]
          },
          data_preview: [
            ['T1 lookup <100', 'S(lá [0..100))', 'đọc + giữ tấm sổ', '🔒'],
            ['T2 chèn 45 gem', 'cần X(lá [0..100))', 'vênh S → xếp hàng', '⏳'],
            ['T2 chèn 510 gem', 'cần X(lá [100..1000))', 'lá khác — grant ngay', '✓'],
            ['T5 sửa 5.000→80', 'cần X(lá [0..100))', 'update cũng là ma — cũng bị bẫy', '⏳']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'T1 đã khóa S đủ CẢ 3 dòng nó đếm được — vì sao vẫn không chặn nổi T2 chèn món 45 gem?',
            options: [
              { id: 'a', text: 'Vì dòng của T2 CHƯA TỒN TẠI lúc T1 giăng khóa — không thể khóa thứ chưa sinh ra; thứ T1 cần khóa là THÔNG TIN "bảng có những dòng nào thỏa <100", không phải từng dòng lẻ', correct: true, explanation: 'Đúng — sách gọi thẳng: khóa các tuple truy cập là CHƯA ĐỦ, phải khóa cả thông tin dùng để TÌM ra chúng. Đó là cánh cửa dẫn tới index-locking.' },
              { id: 'b', text: 'Vì khóa S quá yếu — T1 mà xin X cả 3 dòng thì T2 hết cửa', correct: false, explanation: 'Sai — X cả 3 dòng cũng vô ích y hệt: dòng thứ 4 của T2 vẫn là dòng MỚI, chẳng nằm trong 3 dòng nào để mà vênh.' },
              { id: 'c', text: 'Vì T2 chạy trước khi lock manager kịp ghi sổ khóa của T1', correct: false, explanation: 'Sai — không có race nào ở quầy cả: khóa của T1 ghi sổ đầy đủ, chỉ là INSERT của T2 không đụng bất kỳ item nào trong sổ.' },
              { id: 'd', text: 'Vì COUNT(*) là hàm tổng hợp nên không được cấp khóa', correct: false, explanation: 'Sai — COUNT vẫn đọc từng dòng và khóa bình thường; vấn đề không nằm ở hàm, nằm ở chỗ tập-dòng-thỏa-điều-kiện có thể PHÌNH sau lưng nó.' }
            ]
          },
          {
            question: 'Index-locking bắt ma bằng cách nào — và cái giá phải trả là gì?',
            options: [
              { id: 'a', text: 'Lookup khóa S các LÁ index nó đọc; insert/update/delete phải X đúng lá bị ảnh hưởng → ma buộc phải đụng lá đang bị giữ. Giá: lá thô hơn dòng — hai insert chẳng liên quan mà chung lá vẫn phải xếp hàng', correct: true, explanation: 'Đúng cả hai vế — biến xung đột ảo thành xung đột thật trên một data item CÓ THẬT (cái lá), đổi bằng một ít concurrency thừa.' },
              { id: 'b', text: 'Khóa X toàn bộ index từ gốc tới lá trong lúc đếm', correct: false, explanation: 'Sai — khóa cả index là bản "relation data-item lock" mà sách chê low concurrency; index-locking sinh ra chính là để KHÔNG phải làm thế.' },
              { id: 'c', text: 'Cấm INSERT trong giờ chạy báo cáo kiểm kê', correct: false, explanation: 'Sai — đó là "giải pháp" vận hành thủ công, không phải protocol; và update lọt vùng predicate vẫn tạo ma như thường.' },
              { id: 'd', text: 'So sánh hai lần đếm, lệch thì tự động đếm lần ba', correct: false, explanation: 'Sai — đếm lại không CHẶN được gì, chỉ chứng kiến ma lần nữa; và hai số tình cờ khớp cũng không chứng minh vô ma (ma chèn rồi ma khác xóa).' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Có ma — hay không ma?',
          instruction: 'T1 đang đếm "món < 100 gem". Tình huống nào sinh phantom với nó?',
          xp: 20,
          chips: [
            { id: 'm1', label: 'T2 CHÈN món mới giá 45' },
            { id: 'm2', label: 'T2 SỬA giá món 5.000 → 80' },
            { id: 'm3', label: 'T2 XÓA món giá 12.500' },
            { id: 'm4', label: 'T1 đọc đúng dòng #3001; T2 sửa #3001' }
          ],
          bins: [
            { id: 'ma', label: 'CÓ MA 👻' },
            { id: 'ko', label: 'KHÔNG MA ✓' }
          ],
          solution: { m1: 'ma', m2: 'ma', m3: 'ko', m4: 'ko' }
        }
      },
      step_3: {
        mission: 'Lắp quy trình bẫy ma 4 bước của index-locking — có MỘT khối bịa (nghe rất chi là "cẩn thận").',
        blocks: [
          { type: 'op', token: 'Nhận diện PREDICATE READ: đọc theo điều kiện là đụng cả thông-tin-bảng-có-gì, không chỉ các dòng tìm thấy', slot: 'pt-pred' },
          { type: 'op', token: 'Đếm xong đếm lại lần nữa để double-check — hai số khớp nhau là chắc chắn không ma', slot: 'pt-x' },
          { type: 'op', token: 'Gọi tên con ma: dòng MỚI/dòng bị sửa lọt vào vùng điều kiện — tuple-lock không với tới thứ chưa tồn tại', slot: 'pt-ghost' },
          { type: 'op', token: 'Đặt bẫy trên LÁ: lookup khóa S lá index nó đọc · insert/update/delete phải X lá bị ảnh hưởng', slot: 'pt-leaf' },
          { type: 'op', token: 'Ma thành xung đột THẬT: kẻ định chèn phải chờ đúng cái lá đang bị giữ — serializable trở lại', slot: 'pt-turn' }
        ],
        drop_zones: [
          { id: 'pt-pred', placeholder: 'Bước 1 — nhận diện kiểu đọc gì dễ bị ma ám?', accepts: ['op'], multi: false,
            station: { icon: '🔍', label: 'Predicate read', sub: 'Bước 1', hint: 'WHERE price < 100 đụng nhiều hơn là "3 dòng tìm thấy" — nó đụng cả câu hỏi "bảng CÓ những gì".' } },
          { id: 'pt-ghost', placeholder: 'Bước 2 — thủ phạm là ai, chui qua khe nào?', accepts: ['op'], multi: false,
            station: { icon: '👻', label: 'Gọi tên ma', sub: 'Bước 2', hint: 'Cả 3 dòng bị khóa còn nguyên — vậy thứ làm lệch số đếm nằm Ở ĐÂU lúc T1 giăng khóa?' } },
          { id: 'pt-leaf', placeholder: 'Bước 3 — bẫy đặt lên thứ gì?', accepts: ['op'], multi: false,
            station: { icon: '🍃', label: 'Bẫy trên lá', sub: 'Bước 3', hint: 'Muốn khóa "thông tin tìm dòng" thì cần một VẬT THẬT đại diện cho nó — B+-tree cho sẵn vật đó.' } },
          { id: 'pt-turn', placeholder: 'Bước 4 — bẫy sập thì chuyện gì xảy ra?', accepts: ['op'], multi: false,
            station: { icon: '🪤', label: 'Ma hiện hình', sub: 'Bước 4', hint: 'Xung đột "ảo" giữa hai kẻ không chạm dòng chung — sau bẫy, nó thành xung đột kiểu gì, trên cái gì?' } }
        ],
        expected_sql: 'Nhận diện PREDICATE READ: đọc theo điều kiện là đụng cả thông-tin-bảng-có-gì, không chỉ các dòng tìm thấy Gọi tên con ma: dòng MỚI/dòng bị sửa lọt vào vùng điều kiện — tuple-lock không với tới thứ chưa tồn tại Đặt bẫy trên LÁ: lookup khóa S lá index nó đọc · insert/update/delete phải X lá bị ảnh hưởng Ma thành xung đột THẬT: kẻ định chèn phải chờ đúng cái lá đang bị giữ — serializable trở lại',
        expected_zones: {
          'pt-pred': 'Nhận diện PREDICATE READ: đọc theo điều kiện là đụng cả thông-tin-bảng-có-gì, không chỉ các dòng tìm thấy',
          'pt-ghost': 'Gọi tên con ma: dòng MỚI/dòng bị sửa lọt vào vùng điều kiện — tuple-lock không với tới thứ chưa tồn tại',
          'pt-leaf': 'Đặt bẫy trên LÁ: lookup khóa S lá index nó đọc · insert/update/delete phải X lá bị ảnh hưởng',
          'pt-turn': 'Ma thành xung đột THẬT: kẻ định chèn phải chờ đúng cái lá đang bị giữ — serializable trở lại'
        },
        reveal_strip: true,
        reveal_complete: '💡 BẪY MA GIĂNG XONG: nhận diện predicate read → gọi tên ma → khóa lá index → ma hiện hình thành xung đột thật. Khối "đếm lại double-check" là BỊA — chính vụ 3 rồi 4 cho thấy đếm lại chỉ CHỨNG KIẾN ma chứ không chặn; mà hai số khớp cũng chẳng chứng minh vô ma. Còn giải pháp khóa-đúng-VỊ-NGỮ tuyệt đối chính xác? Có thật, mà đắt vô đối — hồ sơ Predicate Locking chờ sau bài. Bấm <strong>Chạy Query</strong>.',
        reveal_hints: {
          'pt-pred': 'Bước 1 — câu đếm của bot khác gì câu "đọc dòng #3001"? Nó đụng vào thứ gì RỘNG hơn các dòng tìm thấy?',
          'pt-ghost': 'Bước 1 chốt: predicate read đụng cả "bảng có gì". Vậy kẻ làm lệch số đếm TỒN TẠI chưa, lúc T1 giăng khóa?',
          'pt-leaf': 'Ma không khóa được — nhưng đường nó PHẢI ĐI QUA thì khóa được. Trong B+-tree, món 45 gem buộc phải ghi vào đâu?',
          'pt-turn': 'Bẫy đặt xong. Giờ T2 muốn chèn thì đụng thứ gì của T1 — và xung đột này còn là "ảo" nữa không?'
        }
      },
      step_4: {
        prompt: '<strong>Ticket #57 — tự tay giăng predicate read:</strong> gõ đúng câu kiểm kê của bot — đếm số món giá <strong>dưới 100 gem</strong> trong bảng <code>listings</code>. (Đây chính là câu SELECT COUNT mà mọi vụ phantom trong sách xoay quanh.)',
        challenge_type: 'full_ide',
        expected_sql: 'SELECT COUNT(*) FROM listings WHERE price < 100;',
        schema: {
          table_name: 'listings',
          columns: [
            { name: 'listing_id', type: 'INT', key: 'PK' },
            { name: 'item_name', type: 'VARCHAR', key: '' },
            { name: 'price', type: 'INT (gem)', key: '🔑 idx_price' }
          ],
          data: [
            ['3001', 'Kiếm gỗ Newbie', '45'],
            ['3002', 'Giáp rồng Huyền thoại', '12500'],
            ['3005', 'Khiên gỗ sồi', '80'],
            ['3008', 'Mũ vải thô', '35'],
            ['3011', 'Skin Hỏa Long', '790'],
            ['3013', 'Nhẫn dây thừng', '510']
          ]
        },
        context: {
          scenario: 'Bạn vừa học cả bài về việc câu đếm này NGUY HIỂM thế nào khi chạy đồng thời — giờ tự tay viết nó. COUNT(*) gom mọi dòng đậu WHERE về một con số; predicate <code>price < 100</code> chính là "vùng săn ma" mà index-locking sẽ khóa lá.',
          real_world: 'Câu này chạy hằng đêm trong mọi hệ kiểm kê thật. Ở isolation mặc định (read committed), hai lần chạy trong một giao dịch VẪN có thể lệch số — đúng con ma bài này; muốn kín phải lên serializable hoặc tựa vào snapshot (bài 18).',
          steps: [
            'Đếm số dòng → SELECT COUNT(*).',
            'Nguồn: FROM listings.',
            'Vùng điều kiện: WHERE price < 100.',
            'Chạy thử — kho mẫu 6 món, đúng 3 món dưới 100.'
          ],
          hint_explore: 'Panel schema bên trái: cột price có 🔑 idx_price — chính cái index mà bài này đặt bẫy lá lên.',
          expected: 'SELECT COUNT(*) FROM listings WHERE price < 100;'
        },
        hints: [
          { level: 1, text: 'Cần MỘT CON SỐ, không phải danh sách dòng — hàm gom nào đếm số dòng?' },
          { level: 2, text: 'COUNT(*) đứng ở vị trí cột trong SELECT; nguồn là bảng listings.' },
          { level: 3, text: 'Vùng săn ma: giá dưới 100 — mệnh đề WHERE viết sao?' },
          { level: 4, text: 'Đáp án: SELECT COUNT(*) FROM listings WHERE price < 100;' }
        ],
        success_message: 'TICKET #57 ĐÓNG — 3 món, đếm chuẩn từng con ma! 👻 Hồ sơ đọc thêm bên dưới: PREDICATE LOCKING — khóa thẳng vào VỊ NGỮ, chính xác tuyệt đối mà đắt vô đối. Và từ bài sau, Trading Floor đổi hẳn trường phái: thay vì khóa-rồi-chờ, để giao dịch chạy TỰ DO rồi soát lúc nộp bài — OPTIMISTIC CONCURRENCY: read → validate → write. Dân read-heavy mê nó như điếu đổ. 🏁',
        xp_reward: 120
      },
      concept_cards_after: ['nc_card_predicate_locking']
    },

    /* ── nc_17 — Ticket #58 · Optimistic Concurrency (Ch.18.6) ──
     * PART_7 Bài 7: "transaction chạy nháp rồi validate conflict" — 3 pha
     * read (ghi vào nháp cục bộ) → validation (soát Tk chồng lấn: có ghi món
     * mình đã đọc?) → write (chép nháp vào DB); rớt soát = abort xé nháp,
     * không cascading vì DB chưa từng thấy nháp. 3 tem Start/Validation/Finish.
     * Sim thứ 9 valid_visual — bàn nháp 3 pha, mode PASS/ABORT (user chốt
     * 2026-07-07 đợt 10). Step-4 fill_blank 3 ca phán quyết PASS/ABORT/PASS. */
    {
      id: 'nc_17', index: 17,
      title: 'Optimistic — cứ chạy trên nháp, nộp bài mới soát',
      subtitle: 'Read → Validate → Write: không một khóa nào suốt cả quá trình — sổ thật chỉ nhận bài đã chấm đậu',
      module: 8, module_title: 'Trading Floor — Giao dịch & Concurrency',
      estimated_minutes: 20, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'fill_blank',
      drag_map: {
        table: {
          name: 'listings — góc chợ đêm (mẫu 5)',
          columns: ['listing_id', 'item_name', 'price'],
          dataRows: [
            ['7042', 'Khiên Hắc Long', '400'],
            ['3001', 'Kiếm gỗ Newbie', '45'],
            ['3005', 'Khiên gỗ sồi', '80'],
            ['3011', 'Skin Hỏa Long', '790'],
            ['3002', 'Giáp rồng Huyền thoại', '12500']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #58',
        hook: 'Chợ đêm GameHub: <strong>95% giao dịch chỉ XEM hàng</strong>, cả tiếng mới có một cú sửa giá đụng nhau. Vậy mà từ ngày phủ khóa kiểu bài 12, monitoring đỏ lòm: hàng nghìn lượt xem xếp hàng sau vài cái khóa — trả tiền vé chống va chạm cho <em>từng người</em>, trong khi va chạm hiếm như sao băng. Ticket #58: dẹp quầy phát khóa. Giao dịch cứ chạy TỰ DO trên nháp riêng, lúc NỘP BÀI mới soát — rớt soát thì xé nháp làm lại. Lạc quan, mà không liều. 🧾'
      },
      step_1: {
        primer: {
          goal: [
            'OPTIMISTIC (validation-based, sách 18.6): giao dịch sống qua 3 pha — READ (đọc vào biến cục bộ, mọi phép ghi đổ vào NHÁP riêng) → VALIDATION (soát va chạm) → WRITE (chép nháp vào DB thật); read-only khỏi luôn pha cuối',
            'Bài SOÁT với mỗi Tk xếp trước mình: hoặc Tk XONG HẲN trước khi mình bắt đầu (FinishTS(Tk) < StartTS(Ti)) — khỏi soát; hoặc đồ Tk GHI không dính món mình ĐÃ ĐỌC và nó ghi xong trước khi mình vào soát — đậu; dính → ABORT',
            'Rớt soát chỉ tốn XÉ NHÁP: DB chưa từng thấy dữ liệu nháp nên không ai kịp đọc ké — không bao giờ cascading rollback; cái giá thật là giao dịch DÀI dễ bị đám ngắn tông rớt hoài (starvation)'
          ],
          intro: 'Phòng thi nghiêm ngặt kiểu khóa: mỗi thí sinh vào phải khóa cửa, người sau đứng chờ ngoài hành lang. Phòng thi lạc quan: ai nấy làm bài trên <strong>giấy nháp riêng</strong>, thoải mái cùng lúc; giám khảo chỉ chấm LÚC NỘP — nếu dữ kiện bạn dùng đã bị đề đính chính giữa chừng thì bài nháp vô hiệu, làm lại. Bảng điểm (sổ thật) không bao giờ dính một bài chưa chấm.',
          example: 'T1 đọc giá Khiên Hắc Long 400 → tính trên nháp: 450. Nếu chẳng ai đụng #7042 trong lúc đó → soát ✓, chép 450 vào sổ. Nếu T2 kịp commit hạ giá 400 → 380 giữa chừng → T2 đã GHI vào món T1 <strong>ĐÃ ĐỌC</strong> → T1 rớt soát, xé nháp, chạy lại từ 380. Sổ chưa từng thấy con 450 nào.'
        },
        concept_cards: [
          {
            icon: 'fa-file-pen',
            title: 'Ba pha — theo đúng sách',
            body: 'Pha ĐỌC: hệ thống chạy Ti, đọc các data item vào biến cục bộ và thực hiện <strong>mọi phép ghi trên biến tạm cục bộ, không hề cập nhật database thật</strong>. Pha SOÁT (validation): áp bài test — rớt là abort. Pha GHI: soát đậu mới chép các biến tạm vào database; <em>read-only transaction bỏ qua pha này</em>. Ba pha phải đi đúng thứ tự, nhưng pha của các giao dịch KHÁC NHAU được đan xen thoải mái.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.6 — Validation-Based Protocols'
          },
          {
            icon: 'fa-stamp',
            title: 'Ba con tem + một câu hỏi soát',
            body: 'Mỗi giao dịch mang 3 tem: <strong>StartTS</strong> (bắt đầu chạy) · <strong>ValidationTS</strong> (nộp bài — chính tem này quyết THỨ TỰ serial) · <strong>FinishTS</strong> (chép xong). Bài soát của Ti quy về một câu: <em>"trong đám xếp trước mình mà CHƯA xong hẳn trước khi mình bắt đầu — có đứa nào GHI vào món mình ĐÃ ĐỌC không?"</em> Có → nháp của mình dựng trên dữ liệu ôi thiu → abort. Không → thứ tự serial vẫn lành lặn → chép nháp.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Bạn xài trường phái này hằng ngày: <strong>Git</strong>. Không ai khóa repo để code — mỗi người một branch (nháp riêng), lúc merge mới soát conflict; dính conflict thì sửa lại rồi merge tiếp, còn main không bao giờ chứa nửa-bài-làm-dở. Team 5 người ít khi đụng file nhau → mượt; 50 người cùng sửa một file → merge hell. Đúng y điều kiện sách đặt cho optimistic: <em>đa số read-only, conflict thấp</em>.'
          }
        ],
        valid_visual: {
          eyebrow: 'BÀN NHÁP 3 PHA — T1 CHỈNH GIÁ KHIÊN HẮC LONG #7042 · KHÔNG MỘT KHÓA NÀO',
          caption: 'Chạy CẢ HAI kịch bản: đường trơn tru soát đậu chép nháp; đường va chạm rớt soát xé nháp — mà sổ thật không dính một vết bẩn nào.',
          db_label: '📒 SỔ GIÁ #7042',
          db_sub: 'gem — Khiên Hắc Long',
          start: 400,
          t1_label: '🤖 T1 — bot chỉnh giá (+50)',
          t2_label: '🧑 T2 — vai diễn theo kịch bản',
          modes: [
            {
              id: 'pass', short: 'SOÁT ĐẬU', ok: true,
              btn: '▶ Kịch bản KHÔNG VA CHẠM',
              steps: [
                { who: 'sys', text: 'StartTS(T1) = 20 — vào PHA ĐỌC. Quầy khóa: đóng cửa vĩnh viễn.', phase: 'read', note: 'Không xin khóa, không xếp hàng — T1 cứ thế chạy.' },
                { who: 't1', text: 'đọc giá #7042 = 400 → chép vào nháp', draft: '400' },
                { who: 't2', text: 'T2 (khách) XEM giá 400 — read-only, không ghi gì', note: 'Hàng nghìn người xem như T2 chạy song song, chẳng vướng ai.' },
                { who: 't1', text: 'tính trên NHÁP: 400 + 50 = 450', draft: '450', note: 'Nhìn sổ mà xem — vẫn 400 nguyên si. Mọi phép ghi đang đổ vào nháp.' },
                { who: 't2', text: 'T2 xong — read-only nên khỏi cả pha ghi, nộp là xong', cls: 'ok' },
                { who: 'sys', text: 'ValidationTS(T1) = 35 — PHA SOÁT: ai commit trong lúc mình chạy mà GHI món mình ĐÃ ĐỌC?', phase: 'validate' },
                { who: 'sys', text: 'không một ai → validation ✓', cls: 'ok' },
                { who: 't1', text: 'PHA GHI: chép nháp 450 vào sổ · FinishTS(T1) = 36', phase: 'write', db: 450, cls: 'ok' }
              ],
              verdict: '✓ Trọn đường không một khóa nào được phát — mà sổ vẫn chuẩn. Khi va chạm hiếm, tiền soát-lúc-nộp rẻ hơn hẳn tiền khóa-từng-người: đó là món hời của optimistic.'
            },
            {
              id: 'abort', short: 'RỚT SOÁT', ok: true,
              btn: '▶ Kịch bản VA CHẠM',
              steps: [
                { who: 'sys', text: 'StartTS(T1) = 20 — PHA ĐỌC, như cũ.', phase: 'read' },
                { who: 't1', text: 'đọc giá #7042 = 400 → chép vào nháp', draft: '400' },
                { who: 't2', text: 'T2 flash-sale: đọc 400, tính nháp riêng của nó: 380', cls: 'warn' },
                { who: 't2', text: 'T2 nộp trước → soát ✓ → GHI 380 vào sổ — commit', db: 380, cls: 'warn', note: 'T2 đậu bài trước — sổ giờ là 380. Còn T1 vẫn cắm cúi trên nháp dựng từ con 400 cũ…' },
                { who: 't1', text: 'vẫn tính trên nháp cũ: 400 + 50 = 450', draft: '450' },
                { who: 'sys', text: 'ValidationTS(T1) = 35 — SOÁT: T2 commit lúc mình đang chạy, GHI đúng món mình ĐÃ ĐỌC', phase: 'validate', cls: 'bad' },
                { who: 'sys', text: '⛔ RỚT SOÁT → ABORT: xé nháp. Sổ không cần dọn gì — nháp chưa từng chạm sổ.', phase: 'abort', draft: null, cls: 'bad', note: 'Đây là lý do không bao giờ có cascading rollback: DB chưa hề thấy con 450, nên chẳng ai kịp đọc ké nó.' },
                { who: 't1', text: 'chạy lại từ đầu: đọc giá MỚI 380 → nháp 430 → soát ✓ → ghi 430', phase: 'write', draft: '430', db: 430, cls: 'ok' }
              ],
              verdict: '✓ Giá của lạc quan: thua ván nào xé nháp đánh lại ván đó — rẻ, khi hiếm khi thua. Còn nếu sàn bạn va chạm liên hồi… đứng dậy quay về quầy khóa, hoặc chờ bài 18. 😏'
            }
          ]
        },
        visual: {
          schema: {
            table_name: 'ba con tem của một giao dịch',
            columns: [
              { name: 'StartTS', type: 'bắt đầu chạy', key: '🕐' },
              { name: 'ValidationTS', type: 'nộp bài — quyết thứ tự serial', key: '⚖️' },
              { name: 'FinishTS', type: 'chép nháp xong', key: '🏁' }
            ]
          },
          data_preview: [
            ['Tk xong HẲN trước khi Ti start', 'FinishTS(Tk) < StartTS(Ti)', 'khỏi soát', '✓'],
            ['Tk commit giữa chừng, ghi món Ti ĐÃ ĐỌC', 'writeset ∩ readset ≠ ∅', 'nháp ôi thiu', '⛔ abort'],
            ['Tk commit giữa chừng, món KHÔNG liên quan', 'writeset ∩ readset = ∅', 'đậu', '✓'],
            ['Ti read-only', 'khỏi pha ghi', 'nộp là xong', '✓']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'T1 rớt validation. Vì sao chỉ cần "xé nháp" là xong — DB không phải dọn, và không ai bị rollback dây chuyền theo?',
            options: [
              { id: 'a', text: 'Vì mọi phép ghi của T1 nằm trên nháp cục bộ, CHỈ chép vào DB sau khi soát đậu — DB chưa từng thấy dữ liệu nháp nên không giao dịch nào kịp đọc thứ chưa-chắc-chắn', correct: true, explanation: 'Đúng — sách nói thẳng: validation scheme tự động miễn nhiễm cascading rollback, vì write thật chỉ xảy ra sau khi giao dịch coi như đã commit.' },
              { id: 'b', text: 'Vì hệ thống tự chụp backup toàn DB trước mỗi giao dịch, rớt thì restore', correct: false, explanation: 'Sai — chẳng có backup nào ở đây; bí quyết rẻ hơn nhiều: đồ chưa chấm đậu thì KHÔNG BAO GIỜ vào DB, nên chẳng có gì để restore.' },
              { id: 'c', text: 'Vì pha validation cấp khóa X trên mọi món T1 đọc nên không ai đọc ké được', correct: false, explanation: 'Sai — cả bài này KHÔNG có khóa; validation là bài kiểm tra tem + tập đọc/ghi, không phải quầy phát khóa trá hình.' },
              { id: 'd', text: 'Vì optimistic chỉ nhận giao dịch read-only nên chẳng có gì để dọn', correct: false, explanation: 'Sai — update transaction vẫn chơi được (T1 chính là một đứa); read-only chỉ được ưu ái bỏ pha ghi thôi.' }
            ]
          },
          {
            question: 'Sàn nào nên theo optimistic — sàn nào nên ở lại quầy khóa?',
            options: [
              { id: 'a', text: 'Read-heavy / va chạm hiếm → optimistic: tiền soát rẻ hơn tiền khóa. Va chạm dày → khóa: abort-làm-lại liên tục đắt hơn xếp hàng, và giao dịch DÀI dễ bị đám ngắn tông rớt hoài (starvation)', correct: true, explanation: 'Chuẩn cả hai vế — sách mở đầu 18.6 bằng đúng điều kiện "đa số read-only, conflict thấp", và đóng bằng cảnh báo starvation cho giao dịch dài.' },
              { id: 'b', text: 'Optimistic luôn thắng — không khóa là không chờ, không chờ là nhanh hơn', correct: false, explanation: 'Sai — không chờ nhưng có THUA: mỗi cú rớt soát là vứt toàn bộ công sức chạy lại từ đầu; va chạm dày thì "chạy lại" thành nghề chính.' },
              { id: 'c', text: 'Khóa luôn thắng — chắc chắn là trên hết, chậm một chút không sao', correct: false, explanation: 'Sai — optimistic cũng CHẮC CHẮN y hệt (serializability giữ nguyên qua bài soát); khác nhau chỉ ở chỗ trả giá bằng chờ hay bằng làm lại.' },
              { id: 'd', text: 'Cứ dưới 1.000 giao dịch/giây thì optimistic, trên thì khóa', correct: false, explanation: 'Sai — thước đo không phải TỔNG lưu lượng mà là TỈ LỆ VA CHẠM: một sàn 10.000 lượt xem/giây vẫn hợp optimistic nếu update lác đác.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Giám khảo soát bài',
          instruction: 'T-audit: StartTS = 20, ValidationTS = 35. Với từng hồ sơ Tk, T-audit đậu hay rớt soát?',
          xp: 20,
          chips: [
            { id: 'v1', label: 'Tk commit=28, GHI món T-audit đã đọc' },
            { id: 'v2', label: 'Tk commit=30, ghi món T-audit KHÔNG đọc' },
            { id: 'v3', label: 'Tk FinishTS=12 — xong trước khi T-audit chạy' },
            { id: 'v4', label: 'Tk chỉ ĐỌC cùng món với T-audit' }
          ],
          bins: [
            { id: 'dau', label: 'ĐẬU SOÁT ✓' },
            { id: 'rot', label: 'RỚT SOÁT ⛔' }
          ],
          solution: { v1: 'rot', v2: 'dau', v3: 'dau', v4: 'dau' }
        }
      },
      step_3: {
        mission: 'Lắp dây chuyền 4 pha của một giao dịch lạc quan — có MỘT khối bịa (nghe rất chi là "tiết kiệm").',
        blocks: [
          { type: 'op', token: 'PHA ĐỌC: đọc dữ liệu vào biến cục bộ — mọi phép GHI đổ hết vào nháp riêng, DB thật chưa suy suyển', slot: 'vo-read' },
          { type: 'op', token: 'Ghi thẳng vào DB cho nhanh — lỡ rớt soát thì DB tự lau giùm, đỡ tốn giấy nháp', slot: 'vo-x' },
          { type: 'op', token: 'PHA SOÁT: điểm danh các giao dịch chồng lấn — có ai commit trong lúc mình chạy mà GHI món mình ĐÃ ĐỌC?', slot: 'vo-check' },
          { type: 'op', token: 'PHÁN QUYẾT: sạch → được phép chép; dính → abort xé nháp làm lại — DB không cần dọn vì nháp chưa từng chạm DB', slot: 'vo-verdict' },
          { type: 'op', token: 'PHA GHI: chép nháp vào DB thật — read-only thì khỏi luôn pha này, nộp là xong', slot: 'vo-write' }
        ],
        drop_zones: [
          { id: 'vo-read', placeholder: 'Pha 1 — giao dịch chạy ở đâu, ghi vào đâu?', accepts: ['op'], multi: false,
            station: { icon: '📝', label: 'Bàn nháp', sub: 'Pha 1', hint: 'Cả pha này không một khóa nào — vậy phép GHI phải đổ vào chỗ nào để không ai thấy?' } },
          { id: 'vo-check', placeholder: 'Pha 2 — nộp bài thì giám khảo hỏi câu gì?', accepts: ['op'], multi: false,
            station: { icon: '🔍', label: 'Bàn soát', sub: 'Pha 2', hint: 'Nháp của mình dựng trên những gì mình ĐÃ ĐỌC — vậy phải soát xem ai đã đụng vào thứ gì?' } },
          { id: 'vo-verdict', placeholder: 'Pha 3 — hai ngả rẽ sau bài soát?', accepts: ['op'], multi: false,
            station: { icon: '⚖️', label: 'Phán quyết', sub: 'Pha 3', hint: 'Rớt thì mất gì — và vì sao DB không phải dọn dẹp một byte nào?' } },
          { id: 'vo-write', placeholder: 'Pha 4 — bài đậu thì đi đâu?', accepts: ['op'], multi: false,
            station: { icon: '🏁', label: 'Vào sổ', sub: 'Pha 4', hint: 'Giờ mới là lúc DB thật được đụng tới — và có một kiểu giao dịch được miễn hẳn pha này.' } }
        ],
        expected_sql: 'PHA ĐỌC: đọc dữ liệu vào biến cục bộ — mọi phép GHI đổ hết vào nháp riêng, DB thật chưa suy suyển PHA SOÁT: điểm danh các giao dịch chồng lấn — có ai commit trong lúc mình chạy mà GHI món mình ĐÃ ĐỌC? PHÁN QUYẾT: sạch → được phép chép; dính → abort xé nháp làm lại — DB không cần dọn vì nháp chưa từng chạm DB PHA GHI: chép nháp vào DB thật — read-only thì khỏi luôn pha này, nộp là xong',
        expected_zones: {
          'vo-read': 'PHA ĐỌC: đọc dữ liệu vào biến cục bộ — mọi phép GHI đổ hết vào nháp riêng, DB thật chưa suy suyển',
          'vo-check': 'PHA SOÁT: điểm danh các giao dịch chồng lấn — có ai commit trong lúc mình chạy mà GHI món mình ĐÃ ĐỌC?',
          'vo-verdict': 'PHÁN QUYẾT: sạch → được phép chép; dính → abort xé nháp làm lại — DB không cần dọn vì nháp chưa từng chạm DB',
          'vo-write': 'PHA GHI: chép nháp vào DB thật — read-only thì khỏi luôn pha này, nộp là xong'
        },
        reveal_strip: true,
        reveal_complete: '💡 DÂY CHUYỀN LẠC QUAN CHẠY: nháp riêng → soát chồng lấn → phán quyết → mới vào sổ. Khối "ghi thẳng vào DB cho nhanh" là BỊA — và bịa đúng chỗ chí mạng: ghi thẳng nghĩa là kẻ khác ĐỌC ĐƯỢC đồ nháp của bạn, rớt soát một cái là cả đám đọc ké phải rollback dây chuyền. Chính vì write nằm SAU validation mà optimistic miễn nhiễm cascading rollback. Bấm <strong>Chạy Query</strong>.',
        reveal_hints: {
          'vo-read': 'Pha 1 — quầy khóa đóng cửa rồi, vậy phép ghi phải trốn vào đâu để DB "chưa suy suyển"?',
          'vo-check': 'Pha 2 — nháp dựng trên dữ liệu ĐÃ ĐỌC. Ai làm dữ liệu đó ôi thiu được? Soát đúng câu đó.',
          'vo-verdict': 'Pha 3 — một ngả chép, một ngả xé. Để ý vế sau: vì sao DB khỏi dọn?',
          'vo-write': 'Pha 4 — giờ nháp mới thành sự thật. Kiểu giao dịch nào được miễn pha này?'
        }
      },
      step_4: {
        prompt: '<strong>Ticket #58 — ngồi ghế giám khảo:</strong> T-audit nộp bài (StartTS = 20, ValidationTS = 35). Phán quyết 3 hồ sơ Tk — điền <code>PASS</code> hoặc <code>ABORT</code>.',
        challenge_type: 'fill_blank',
        template: "-- BAN SOAT — T-audit: StartTS = 20 · ValidationTS = 35\n-- luat: soat cac Tk chong lan (commit trong luc minh chay):\n--       Tk co GHI vao mon minh DA DOC khong?\n\n-- Ca 1: Tk co FinishTS = 12 — xong han TRUOC khi minh start\n--   phan quyet: ____\n\n-- Ca 2: Tk commit = 28, GHI vao #7042 — mon minh DA DOC\n--   phan quyet: ____\n\n-- Ca 3: Tk commit = 30, ghi vao #9099 — mon minh KHONG doc\n--   phan quyet: ____",
        blanks: [
          { id: 'b1', hint: 'PASS / ABORT', expected: 'PASS' },
          { id: 'b2', hint: 'PASS / ABORT', expected: 'ABORT' },
          { id: 'b3', hint: 'PASS / ABORT', expected: 'PASS' }
        ],
        schema: {
          table_name: 'bàn soát — 3 hồ sơ chờ phán quyết',
          columns: [
            { name: 'hồ sơ', type: 'Tk chồng lấn?', key: '📋' },
            { name: 'đụng gì', type: 'so với readset T-audit', key: '🎯' },
            { name: 'phán quyết', type: 'PASS / ABORT', key: '⚖️' }
          ],
          data: [
            ['Ca 1 · Finish=12', 'xong trước khi mình start', '❓'],
            ['Ca 2 · commit=28', 'GHI món mình đã đọc', '❓'],
            ['Ca 3 · commit=30', 'ghi món mình không đọc', '❓'],
            ['(mình read-only?)', 'thì khỏi cả pha ghi', '—']
          ]
        },
        context: {
          scenario: 'Đây chính là validation test của sách 18.6 rút thành một câu hỏi giám khảo: Tk có chồng lấn không — và có ghi vào vùng mình đã đọc không? Ca 1 rơi vào điều kiện 1 (xong trước khi mình start), ca 3 rơi vào điều kiện 2 (writeset không giao readset).',
          real_world: 'Các hệ optimistic thật (từ engine DB đến chốt version trong ORM như Hibernate) đều quy về đúng bài soát này — chỉ khác cách ghi sổ readset/writeset. Hiểu 3 ca này là đọc được log "serialization failure, retry transaction" không toát mồ hôi.',
          steps: [
            'Ca 1: FinishTS(Tk)=12 < StartTS(mình)=20 → hai đứa không chồng lấn.',
            'Ca 2: Tk commit giữa 20 và 35 → chồng lấn; nó GHI món mình ĐÃ ĐỌC → nháp ôi thiu.',
            'Ca 3: cũng chồng lấn, nhưng writeset của nó không giao readset của mình.',
            'Điền PASS / ABORT / PASS theo đúng thứ tự đó.'
          ],
          hint_explore: 'Panel trái là 3 hồ sơ tóm tắt — cột "đụng gì" chính là chìa khóa của từng phán quyết.',
          expected: 'PASS · ABORT · PASS'
        },
        hints: [
          { level: 1, text: 'Câu hỏi vàng: Tk có CHỒNG LẤN với mình không (commit trong lúc mình chạy)? Không chồng lấn thì khỏi soát.' },
          { level: 2, text: 'Ca 1: Finish=12, mình start=20 — nó xong từ trước khi mình sinh ra. Chồng lấn không?' },
          { level: 3, text: 'Ca 2 vs Ca 3 khác nhau đúng một chỗ: món nó ghi có nằm trong đống mình ĐÃ ĐỌC không.' },
          { level: 4, text: 'Đáp án: PASS · ABORT · PASS.' }
        ],
        success_message: 'TICKET #58 ĐÓNG — quầy khóa dẹp tiệm, chợ đêm chạy full tốc mà sổ vẫn sạch! 🧾 Hồ sơ đọc thêm bên dưới: THOMAS\' WRITE RULE — trường phái tem thời gian còn một chiêu lì hơn cả xé nháp: bản ghi cũ rích không ai sẽ đọc thì… LỜ ĐI, khỏi rollback. Và bài sau, trùm cuối của cả trường phái lạc quan: sổ KHÔNG TẨY XÓA — mỗi lần ghi là dán một PHIÊN BẢN mới. MVCC. 📚',
        xp_reward: 120
      },
      concept_cards_after: ['nc_card_thomas_write']
    },

    /* ── nc_18 — Ticket #59 · MVCC + Snapshot Isolation (Ch.18.7-18.8) ──
     * PART_7 Bài 8: "version timeline, transaction đọc snapshot" — mỗi write
     * DÁN version mới (tem CommitTS); reader đọc bản tem lớn nhất ≤ StartTS →
     * không chờ, không abort (sách: read never fails/waits); update phải soát
     * trước commit: first committer wins chặn lost update. Write skew +
     * FOR UPDATE ĐỂ DÀNH bài 19 (cliffhanger cuối bài). Sim thứ 10 mvcc_visual
     * (user chốt 2026-07-07 đợt 10). Step-4 mcq_code "reader StartTS=30 thấy
     * giá nào" — bẫy mới-nhất / bản-đầu / chờ-writer. */
    {
      id: 'nc_18', index: 18,
      title: 'MVCC — sổ không tẩy xóa, mỗi lần ghi là dán bản mới',
      subtitle: 'Multiversion + Snapshot Isolation: reader cầm ảnh chụp lúc mình bắt đầu — không chờ ai, không bị ai chặn',
      module: 8, module_title: 'Trading Floor — Giao dịch & Concurrency',
      estimated_minutes: 22, xp_reward: 120,
      drag_type: 'chip',
      challenge_type: 'mcq_code',
      drag_map: {
        table: {
          name: 'versions của Kiếm Rồng #3001 — sổ không tẩy xóa',
          columns: ['version', 'giá (gem)', 'tem commit'],
          dataRows: [
            ['v1', '500', '10'],
            ['v2', '480', '25'],
            ['v3', '520', '40'],
            ['(v4 nháp)', '— chưa commit', 'chưa có tem']
          ]
        }
      },
      story: {
        tag: '🎫 GameHub Marketplace · Ticket #59',
        hook: 'Báo cáo doanh thu cuối quý đọc <strong>toàn bộ sàn suốt 2 tiếng</strong>. Dưới chế độ khóa, 2 tiếng đó là 2 tiếng seller bị chặn ghi — sếp gọi đó là "bảo trì", seller gọi đó là mất tiền. Còn xé-nháp-làm-lại kiểu bài 17? Báo cáo chạy 2 tiếng mà rớt soát ở phút 119 thì khóc bằng tiếng Mán. Ticket #59 đòi một điều nghe như phép thuật: <em>người đọc không chờ ai, người ghi không chặn ai — cùng lúc</em>. Câu trả lời của mọi DBMS lớn: đừng tẩy xóa sổ nữa. Mỗi lần ghi, DÁN MỘT BẢN MỚI. 📚'
      },
      step_1: {
        primer: {
          goal: [
            'MVCC (multiversion, sách 18.7): mỗi write(Q) tạo một VERSION mới của Q kèm tem — không đè bản cũ; read(Q) được trao đúng bản phù hợp; kết quả vàng: <strong>đọc không bao giờ fail, không bao giờ phải chờ</strong>',
            'SNAPSHOT ISOLATION (18.8): giao dịch nhận ẢNH CHỤP database tại StartTS — chỉ gồm dữ liệu ĐÃ COMMIT; đọc = lấy bản có tem commit LỚN NHẤT còn ≤ StartTS; read-only chạy tới đâu cũng không chờ, không abort',
            'Người GHI vẫn phải qua cửa soát trước commit: hai updater chồng lấn cùng sửa MỘT món → đứa validate sau thấy bản lạ dán trong khoảng chạy của mình → ABORT (first committer wins) — lost update bài 11 hết cửa'
          ],
          intro: 'Sổ kế toán thật KHÔNG BAO GIỜ tẩy xóa — sai thì ghi bút toán mới đè lên dòng mới, dòng cũ còn nguyên. Kiểm toán viên soát quý I cứ đọc các trang tính đến hết quý I, kệ phòng kế toán đang viết quý II ở trang sau: hai bên không ai chờ ai, mà con số quý I không bao giờ nhảy múa dưới mắt kiểm toán.',
          example: 'Kiếm Rồng #3001 có 3 bản: 500 (tem 10) → 480 (tem 25) → 520 (tem 40). Reader StartTS = 30 đọc → bản tem lớn nhất ≤ 30 là tem 25 → thấy <strong>480</strong>. Writer dán bản 520 lúc nào kệ writer — reader không chờ một giây, và đọc lại lần nữa vẫn 480: ảnh chụp không suy suyển.'
        },
        concept_cards: [
          {
            icon: 'fa-camera',
            title: 'Ảnh chụp — theo đúng sách',
            body: 'Snapshot isolation trao cho giao dịch một "snapshot" của database <strong>tại thời điểm nó bắt đầu</strong>; nó làm việc trên ảnh chụp đó, cách ly hoàn toàn khỏi các giao dịch chạy song song. Ảnh chỉ gồm giá trị do các giao dịch <strong>ĐÃ COMMIT</strong> ghi. Cách ly kiểu này là lý tưởng cho read-only: <em>không bao giờ chờ, không bao giờ bị abort</em>. Còn update thì phải được soát (validate) trước khi cho commit — nháp giữ trong workspace riêng tới lúc đó.',
            variant: 'quote',
            source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.8 — Snapshot Isolation'
          },
          {
            icon: 'fa-layer-group',
            title: 'Hai con tem + một luật chọn bản',
            body: 'Mỗi giao dịch mang <strong>StartTS</strong> (lúc bắt đầu) và <strong>CommitTS</strong> (lúc xin nộp — tem này dán lên mọi version nó tạo). Luật đọc gói trong một dòng: <em>trả về bản có tem ghi LỚN NHẤT còn ≤ StartTS(Ti)</em>. Luật soát của updater cũng một dòng: <em>trong khoảng (StartTS..CommitTS] mà món mình định ghi đã có bản lạ dán vào → abort</em>. Hai giao dịch gọi là CHỒNG LẤN khi khoảng sống của chúng giao nhau — chỉ đám đó mới cần soát lẫn nhau.'
          },
          {
            icon: 'fa-arrows-turn-to-dots',
            title: 'Thử ngay (Apply)',
            body: 'Oracle, PostgreSQL, SQL Server — cả ba đều chạy snapshot (sách nêu đích danh). Bạn từng gặp nó rồi: bảng Postgres <strong>phình to dù bạn DELETE ầm ầm</strong> — vì DELETE trong MVCC chỉ dán "bản đánh dấu đã xóa", xác bản cũ nằm chờ <code>VACUUM</code> tới dọn (đúng luật dọn version của sách: bản cũ hơn 2 bản mà mọi giao dịch sống đều không cần nữa thì được xóa). Thấy autovacuum chạy đêm — đó là cái giá thuê kho chứa lịch sử.'
          }
        ],
        mvcc_visual: {
          eyebrow: 'SỔ KHÔNG TẨY XÓA — KIẾM RỒNG #3001 · MỖI THẺ LÀ MỘT PHIÊN BẢN, TEM = CommitTS',
          caption: 'Chạy CẢ HAI kịch bản: người đọc lướt qua writer không một giây chờ; hai người sửa cùng món thì luật first-committer-wins ra tay.',
          item_label: '⚔️ Kiếm Rồng #3001 — giá (gem)',
          versions: [
            { id: 'v1', val: 500, ts: 10 },
            { id: 'v2', val: 480, ts: 25 }
          ],
          modes: [
            {
              id: 'reader', short: 'READER KHÔNG CHỜ', ok: true, result: 'không ai chờ ai',
              btn: '▶ Kịch bản NGƯỜI ĐỌC',
              steps: [
                { text: 'R1 (StartTS=15) đọc → tem lớn nhất ≤ 15 là tem 10 → thấy 500', pick: 'v1', cls: 'ok', note: 'Ảnh chụp của R1 là thời điểm 15 — bản 480 (tem 25) với nó là chuyện tương lai.' },
                { text: 'R2 (StartTS=30) đọc → tem lớn nhất ≤ 30 là tem 25 → thấy 480', pick: 'v2', cls: 'ok' },
                { text: 'Writer commit — KHÔNG đè: DÁN bản mới v3 = 520, tem 40', add: { id: 'v3', val: 520, ts: 40 }, cls: 'warn', note: 'Không ổ khóa nào được phát: writer dán thẻ mới vào đuôi, các thẻ cũ còn nguyên cho những ảnh chụp cũ.' },
                { text: 'R2 đọc LẠI → vẫn 480: ảnh chụp lúc 30, bản tem 40 nằm ngoài rìa', pick: 'v2', cls: 'ok', note: 'Cùng giao dịch, hai lần đọc một con số — cả con ma bài 16 cũng hết cửa: dòng chèn sau StartTS mang tem sau StartTS, không lọt nổi vào ảnh chụp.' },
                { text: 'R3 (StartTS=45) đọc → 520: bản mới nhất giờ đã nằm trong quá khứ của nó', pick: 'v3', cls: 'ok' }
              ],
              verdict: '✓ "Read request never fails and is never made to wait" (sách 18.7) — reader với writer chạy hai đường không cắt nhau. Báo cáo 2 tiếng lướt êm giữa giờ cao điểm là nhờ đúng dòng này.'
            },
            {
              id: 'fcw', short: 'FIRST COMMITTER WINS', ok: true, result: 'T5 abort — lost update hết cửa',
              btn: '▶ Kịch bản 2 NGƯỜI SỬA',
              steps: [
                { text: 'T5 (StartTS=50) đọc snapshot → 480 · muốn hạ 30: nháp 450', pick: 'v2' },
                { text: 'T6 (StartTS=52) cũng đọc 480 · muốn hạ 60: nháp 420', pick: 'v2', cls: 'warn', note: 'Hai giao dịch chồng lấn cùng nhắm một món — mỗi đứa một ảnh chụp, không đứa nào thấy nháp đứa nào. Nghe quen không? Đúng thế trận lost update bài 11.' },
                { text: 'T6 nộp trước (CommitTS=60) → soát (52..60]: không bản lạ nào → ✓ DÁN v3 = 420', add: { id: 'v3', val: 420, ts: 60 }, cls: 'ok' },
                { text: 'T5 nộp (CommitTS=65) → soát (50..65]: CÓ bản tem 60 dán vào đúng món mình định ghi', cls: 'bad', note: 'Nếu nhắm mắt cho T5 dán nốt: bản 420 của T6 bị đè bay màu không dấu vết — chính xác là LOST UPDATE.' },
                { text: '⛔ T5 ABORT — first committer wins: ai dán trước người đó thắng, kẻ sau xé nháp làm lại', cls: 'bad' }
              ],
              verdict: '✓ Snapshot không thả rông người ghi: update phải qua cửa soát — lost update hết cửa. Nhưng khoan vỗ tay: hai giao dịch KHÔNG đụng cùng món thì cái máy soát này… mù tịt. Chuyện đó để bài sau. 😈'
            }
          ]
        },
        visual: {
          schema: {
            table_name: 'một version = content + tem + khoảng sống',
            columns: [
              { name: 'content', type: 'giá trị của bản', key: '📦' },
              { name: 'tem commit', type: 'CommitTS của người dán', key: '🏷️' },
              { name: 'khoảng sống', type: '[tem mình .. tem bản kế)', key: '⏳' }
            ]
          },
          data_preview: [
            ['v1 · 500 gem', 'tem 10', 'sống [10..25)', ''],
            ['v2 · 480 gem', 'tem 25', 'sống [25..40)', ''],
            ['v3 · 520 gem', 'tem 40', 'sống [40..∞)', ''],
            ['reader StartTS=30', '→ chọn v2', '30 rơi vào [25..40)', '✓ không chờ']
          ]
        }
      },
      step_2: {
        mcq: [
          {
            question: 'Reader StartTS = 30 đọc Kiếm Rồng HAI lần: trước và sau khi writer dán bản 520 (tem 40). Nó thấy gì?',
            options: [
              { id: 'a', text: 'Cả hai lần đều 480 — luật là "tem lớn nhất ≤ 30", bản tem 40 vĩnh viễn nằm ngoài ảnh chụp của nó; không chờ, không abort', correct: true, explanation: 'Đúng — snapshot cố định tại StartTS: thế giới có dán thêm bao nhiêu bản, ảnh chụp lúc 30 vẫn y nguyên. Repeatable read miễn phí kèm theo.' },
              { id: 'b', text: 'Lần 1: 480, lần 2: 520 — dữ liệu committed mới nhất luôn thắng', correct: false, explanation: 'Sai — "mới nhất luôn thắng" là thế giới KHÔNG version của bài 11 (và chính nó sinh ra đủ thứ quái). Snapshot chọn theo StartTS của reader, không theo đồng hồ lúc đọc.' },
              { id: 'c', text: 'Lần 2 phải chờ writer nhả rồi mới đọc được 520', correct: false, explanation: 'Sai — không có gì để "nhả": writer không cầm khóa chặn reader, nó chỉ dán thẻ mới. Reader không bao giờ xếp hàng trong MVCC.' },
              { id: 'd', text: 'Reader bị abort vì dữ liệu đổi giữa chừng', correct: false, explanation: 'Sai — abort là án dành cho UPDATER thua ván soát; read-only theo sách "never waits and is never aborted". Dữ liệu "đổi" ở đâu thì đổi, ảnh chụp không đổi.' }
            ]
          },
          {
            question: 'Đọc ảnh chụp riêng thì đâu ai đụng ai — vậy vì sao updater vẫn phải qua cửa SOÁT trước khi commit?',
            options: [
              { id: 'a', text: 'Vì hai updater chồng lấn cùng sửa MỘT món sẽ không thấy nháp của nhau — cho commit cả hai thì bản dán trước bị bản sau đè bay màu: lost update; nên đứa nộp sau phải abort (first committer wins)', correct: true, explanation: 'Chuẩn — ảnh chụp cách ly phần ĐỌC, nhưng phần GHI mà thả rông là hai bản đè nhau. Cửa soát chính là chốt chặn lost update của snapshot.' },
              { id: 'b', text: 'Vì phải kiểm tra cú pháp SQL lần cuối trước khi ghi đĩa', correct: false, explanation: 'Sai — cú pháp sai thì chết từ lúc parse rồi; cửa soát ở đây xử VA CHẠM giữa các giao dịch, không xử chính tả.' },
              { id: 'c', text: 'Vì mọi update phải xếp hàng lấy khóa X như bài 12', correct: false, explanation: 'Sai — biến thể first-committer-wins trong sách soát bằng TEM (có bản lạ trong khoảng chạy không), không phát khóa X chặn từ đầu. (Biến thể first-updater-wins có dùng write lock — nhưng cũng không phải "như bài 12".)' },
              { id: 'd', text: 'Không cần soát thật — các DBMS làm cho có lệ để log đẹp', correct: false, explanation: 'Sai — thiếu cửa soát này thì snapshot thua cả read committed ở khoản lost update; "first committer wins / first updater wins" là luật sống còn, sách dành nguyên mục 18.8.2.' }
            ]
          }
        ],
        mini_game: {
          type: 'classify',
          title: 'Ai thấy 480?',
          instruction: 'Chuỗi version: 500 (tem 10) → 480 (tem 25) → 520 (tem 40). Reader nào THẤY GIÁ 480?',
          xp: 20,
          chips: [
            { id: 's1', label: 'reader StartTS = 30' },
            { id: 's2', label: 'reader StartTS = 25 (đúng biên)' },
            { id: 's3', label: 'reader StartTS = 15' },
            { id: 's4', label: 'reader StartTS = 41' }
          ],
          bins: [
            { id: 'thay', label: 'THẤY 480 ✓' },
            { id: 'khac', label: 'THẤY GIÁ KHÁC' }
          ],
          solution: { s1: 'thay', s2: 'thay', s3: 'khac', s4: 'khac' }
        }
      },
      step_3: {
        mission: 'Lắp bộ luật 4 điều của thế giới nhiều-phiên-bản — có MỘT khối bịa (nghe rất chi là "tươi mới").',
        blocks: [
          { type: 'op', token: 'KHAI SINH: giao dịch nhận StartTS — ảnh chụp của nó là sổ TÍNH ĐẾN thời điểm đó, chỉ gồm dữ liệu ĐÃ commit', slot: 'mv-snap' },
          { type: 'op', token: 'ĐỌC: lấy bản có tem commit LỚN NHẤT còn ≤ StartTS — kệ mọi bản dán sau, kệ mọi nháp chưa commit', slot: 'mv-read' },
          { type: 'op', token: 'Writer ghi ĐÈ thẳng chỗ cũ — reader nào đang đọc thì chờ một nhịp, đổi lại luôn được dữ liệu tươi mới nhất', slot: 'mv-x' },
          { type: 'op', token: 'GHI: KHÔNG đè — dán version mới mang tem CommitTS; các bản cũ còn nguyên cho những ảnh chụp cũ', slot: 'mv-write' },
          { type: 'op', token: 'NỘP BÀI (update): soát khoảng Start→Commit trên món mình ghi — có bản lạ dán vào là abort: first committer wins', slot: 'mv-commit' }
        ],
        drop_zones: [
          { id: 'mv-snap', placeholder: 'Điều 1 — giao dịch mở mắt thấy gì?', accepts: ['op'], multi: false,
            station: { icon: '📸', label: 'Ảnh chụp', sub: 'Điều 1', hint: 'Thứ trao cho giao dịch lúc StartTS — và vì sao đồ CHƯA commit không bao giờ có mặt trong đó?' } },
          { id: 'mv-read', placeholder: 'Điều 2 — giữa cả xấp bản, đọc chọn bản nào?', accepts: ['op'], multi: false,
            station: { icon: '👓', label: 'Luật đọc', sub: 'Điều 2', hint: 'Một phép so tem duy nhất — StartTS = 30 mà chuỗi tem là 10 · 25 · 40 thì chọn ai?' } },
          { id: 'mv-write', placeholder: 'Điều 3 — ghi thì làm gì với bản cũ?', accepts: ['op'], multi: false,
            station: { icon: '🏷️', label: 'Luật ghi', sub: 'Điều 3', hint: 'Chính điều này làm reader khỏi chờ: bản cũ phải CÒN đó cho ai? Bản mới mang tem gì?' } },
          { id: 'mv-commit', placeholder: 'Điều 4 — updater muốn nộp thì qua cửa nào?', accepts: ['op'], multi: false,
            station: { icon: '⚖️', label: 'Cửa soát', sub: 'Điều 4', hint: 'Không có cửa này thì hai bản nháp cùng món đè nhau — bài 11 gọi tên thảm họa đó là gì?' } }
        ],
        expected_sql: 'KHAI SINH: giao dịch nhận StartTS — ảnh chụp của nó là sổ TÍNH ĐẾN thời điểm đó, chỉ gồm dữ liệu ĐÃ commit ĐỌC: lấy bản có tem commit LỚN NHẤT còn ≤ StartTS — kệ mọi bản dán sau, kệ mọi nháp chưa commit GHI: KHÔNG đè — dán version mới mang tem CommitTS; các bản cũ còn nguyên cho những ảnh chụp cũ NỘP BÀI (update): soát khoảng Start→Commit trên món mình ghi — có bản lạ dán vào là abort: first committer wins',
        expected_zones: {
          'mv-snap': 'KHAI SINH: giao dịch nhận StartTS — ảnh chụp của nó là sổ TÍNH ĐẾN thời điểm đó, chỉ gồm dữ liệu ĐÃ commit',
          'mv-read': 'ĐỌC: lấy bản có tem commit LỚN NHẤT còn ≤ StartTS — kệ mọi bản dán sau, kệ mọi nháp chưa commit',
          'mv-write': 'GHI: KHÔNG đè — dán version mới mang tem CommitTS; các bản cũ còn nguyên cho những ảnh chụp cũ',
          'mv-commit': 'NỘP BÀI (update): soát khoảng Start→Commit trên món mình ghi — có bản lạ dán vào là abort: first committer wins'
        },
        reveal_strip: true,
        reveal_complete: '💡 BỘ LUẬT 4 ĐIỀU KHẮC XONG: ảnh chụp → luật đọc theo tem → ghi là dán không đè → cửa soát first-committer-wins. Khối "ghi đè + reader chờ cho tươi" là BỊA — nó chính là thế giới CŨ mà cả bài này đập đi: một khi ghi đè, bản cũ chết, reader buộc phải chờ hoặc đọc bậy; "tươi mới nhất" nghe hay mà chính là thứ làm hai lần đọc ra hai số. Bấm <strong>Chạy Query</strong>.',
        reveal_hints: {
          'mv-snap': 'Điều 1 — khoảnh khắc StartTS, giao dịch được trao thứ gì? Đồ chưa commit có được vào không?',
          'mv-read': 'Điều 2 — cả xấp thẻ, một phép so: tem thế nào so với StartTS thì được chọn?',
          'mv-write': 'Điều 3 — vì sao reader khỏi chờ writer? Vì bản cũ KHÔNG chết. Vậy ghi phải làm gì thay vì đè?',
          'mv-commit': 'Điều 4 — hai nháp cùng món không thấy nhau; thiếu cửa nào thì thành lost update?'
        }
      },
      step_4: {
        prompt: '<strong>Ticket #59 — đọc sổ version:</strong> Kiếm Rồng #3001 có chuỗi bản: <code>500 (tem 10) → 480 (tem 25) → 520 (tem 40)</code>, và một writer đang cầm nháp v4 CHƯA commit. Reader <strong>StartTS = 30</strong> chạy <code>SELECT price</code>. Engine trả về gì?',
        challenge_type: 'mcq_code',
        options: [
          {
            text: '480 — bản có tem commit LỚN NHẤT còn ≤ 30; bản 520 (tem 40) lẫn nháp v4 đều ngoài ảnh chụp',
            correct: true
          },
          {
            text: '520 — bản committed MỚI NHẤT tại thời điểm đọc, dữ liệu tươi là trên hết',
            correct: false,
            explain: '"Mới nhất tại lúc đọc" là luật của thế giới không-version — chính nó làm hai lần đọc ra hai số. Snapshot neo theo StartTS CỦA READER: tem 40 > 30 → bản đó thuộc tương lai của nó.'
          },
          {
            text: '500 — bản đầu tiên, an toàn nhất vì chắc chắn đã commit từ lâu',
            correct: false,
            explain: 'An toàn kiểu viện bảo tàng — luật chọn là tem LỚN NHẤT còn ≤ StartTS, không phải tem nhỏ nhất: bản 480 (tem 25) commit xong xuôi trước mốc 30, không có lý gì trả đồ cổ hơn.'
          },
          {
            text: 'Chờ writer commit v4 xong rồi trả bản mới nhất cho chắc ăn',
            correct: false,
            explain: 'Cả bài này sinh ra để KHỎI có câu đó: reader không bao giờ đợi writer. Và nháp chưa commit thì không bao giờ lọt vào snapshot của bất kỳ ai — kể cả khi nó commit xong, tem của nó vẫn > 30.'
          }
        ],
        schema: {
          table_name: 'sổ version #3001 — reader StartTS=30 soi vào',
          columns: [
            { name: 'version', type: 'thẻ trong chuỗi', key: '🏷️' },
            { name: 'giá', type: 'gem', key: '💰' },
            { name: 'tem ≤ 30?', type: 'so với StartTS', key: '⚖️' }
          ],
          data: [
            ['v1 · tem 10', '500', '✓ (nhưng chưa lớn nhất)'],
            ['v2 · tem 25', '480', '✓ lớn nhất ≤ 30'],
            ['v3 · tem 40', '520', '✗ tương lai'],
            ['v4 · nháp', '?', '✗ chưa commit — vô hình']
          ]
        },
        context: {
          scenario: 'Một phép so tem duy nhất gánh cả bài: lọc các bản có tem ≤ StartTS rồi lấy bản LỚN NHẤT trong đám đó. Hai cái bẫy của đề nằm ở hai chữ "mới nhất" (theo đồng hồ nào?) và "chờ" (MVCC không có khái niệm reader chờ).',
          real_world: 'Đây chính là câu bạn chạy mỗi lần SELECT trong PostgreSQL/Oracle mặc định: engine lặng lẽ so tem (xmin/xmax trong Postgres) và trao đúng bản thuộc snapshot của bạn — cùng một dòng SELECT, hai session thấy hai giá khác nhau là chuyện bình thường như cân đường.',
          steps: [
            'Liệt kê tem các bản đã commit: 10 · 25 · 40.',
            'Giữ các tem ≤ StartTS(30): còn 10 và 25.',
            'Lấy tem lớn nhất trong đám: 25 → bản 480.',
            'Nháp chưa commit: vô hình với mọi snapshot — khỏi xét.'
          ],
          hint_explore: 'Panel schema bên trái đã chấm sẵn cột "tem ≤ 30?" cho từng bản — đáp án lộ nguyên hình ở đó.',
          expected: 'Chọn 480 — tem lớn nhất ≤ StartTS.'
        },
        hints: [
          { level: 1, text: 'Reader không quan tâm "bây giờ là mấy giờ" — nó chỉ quan tâm MỘT con số của chính nó. Số nào?' },
          { level: 2, text: 'Lọc trước: bản nào có tem ≤ 30? (Nháp chưa commit thì khỏi bàn — vô hình.)' },
          { level: 3, text: 'Trong đám lọt lưới, lấy bản tem LỚN NHẤT — không phải bản cổ nhất cho "an toàn".' },
          { level: 4, text: 'Đáp án: 480 — tem 25 là tem lớn nhất còn ≤ 30.' }
        ],
        success_message: 'TICKET #59 ĐÓNG — báo cáo 2 tiếng lướt êm giữa giờ cao điểm, seller ghi ầm ầm không ai chặn ai! 📚 Hồ sơ đọc thêm bên dưới: LOCK vs MVCC — trận chung kết hai trường phái của cả module. Nhưng nhớ cái nheo mắt ở sim: máy soát chỉ bắt hai kẻ đụng CÙNG món… hai giao dịch mỗi đứa sửa một món mà vẫn phá nát invariant thì sao? WRITE SKEW — con quái snapshot không tự bắt được, hẹn bài sau, kèm bùa FOR UPDATE. 😈',
        xp_reward: 120
      },
      concept_cards_after: ['nc_card_lock_vs_mvcc']
    }

  ],

  /* ═══ CONCEPT CARDS — PART_6 quy định: 1 visual metaphor + giải thích ≤4 dòng
   * + 1 micro quiz + feedback (quiz render client-side trong concept_card.html). ═══ */
  concept_cards: [
    {
      id: 'nc_card_evaluation_primitive',
      eyebrow: 'HỒ SƠ KỸ THUẬT · GIỮA BÀI 1 VÀ BÀI 2',
      title: 'Evaluation Primitive — phép toán đã gắn động cơ',
      accent: '#818CF8',
      back_href: '/courses/db_design_nc',
      intro: 'Cây phép toán nói <code>σ — lọc price&lt;100</code>: LÀM GÌ. Nhưng lọc BẰNG CÁCH NÀO — quét từng dòng, hay tra index? Phép toán + chú thích cách chạy = <strong>evaluation primitive</strong>. Execution plan bạn vừa nhận diện ở Ticket #42 chính là một CHUỖI primitive nối nhau.',
      sections: [
        {
          icon: 'fa-gears',
          heading: 'Cùng một phép σ — hai động cơ',
          body: '<code>σ price&lt;100</code> + <em>"quét tuần tự từng dòng"</em> → primitive số 1. <code>σ price&lt;100</code> + <em>"tra qua index trên price"</em> → primitive số 2. Phép toán y hệt, động cơ khác — tốc độ khác nhau một trời.'
        }
      ],
      quiz: {
        question: 'Dòng chữ: «σ price<100 (listings) — DÙNG B+-TREE INDEX TRÊN price». Đây là gì?',
        options: [
          { label: 'Một evaluation primitive', correct: true, feedback: '✓ Chuẩn — phép toán (σ) + chú thích CÁCH CHẠY (qua index) = evaluation primitive, viên gạch xây nên execution plan.' },
          { label: 'Một câu SQL', correct: false, feedback: '✗ SQL là ngôn ngữ cho người viết YÊU CẦU — còn đây đã là phép toán nội bộ kèm cách chạy rồi.' },
          { label: 'Một cây phép toán thuần', correct: false, feedback: '✗ Suýt đúng — σ là phép toán, nhưng "dùng B+-tree index" là chú thích CÁCH CHẠY: có nó thì không còn "thuần" nữa, mà đã thành primitive.' }
        ]
      },
      source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 15.1 — evaluation primitive & query-execution plan · PART_6 Card A',
      cta: { label: 'Vào Bài 2 — Vì sao query có giá?', href: '/lesson/db_design_nc?lesson=2' }
    },

    /* Card B — PART_6 đặt sau Bài 2 */
    {
      id: 'nc_card_cpu_vs_io',
      eyebrow: 'HỒ SƠ KỸ THUẬT · GIỮA BÀI 2 VÀ BÀI 3',
      title: 'CPU vs I/O — bảng giá đổi theo thời đại',
      accent: '#818CF8',
      back_href: '/courses/db_design_nc',
      intro: 'Bảng giá 4ms/0,1ms là của HDD — nơi cú nhảy là chuyển động CƠ HỌC. Trên SSD chẳng có gì phải di chuyển: một cú nhảy chỉ ~0,09ms, rẻ hơn ~44 lần. Khi I/O rẻ đi, khoản <strong>CPU/cache</strong> — trước nay lép vế — bắt đầu chiếm sóng hóa đơn.',
      sections: [
        {
          icon: 'fa-microchip',
          heading: 'Ba thời đại, ba bảng giá',
          body: '<strong>HDD</strong>: seek 4ms — random là kẻ thù số một. <strong>SSD</strong>: seek ~0,09ms — random hết đáng sợ, nhưng vẫn đắt hơn liền mạch. <strong>RAM</strong>: ~0 — lúc này tiền CPU/cache mới là khoản phải đếm. Vì thế optimizer hiện đại không chỉ nhìn disk I/O.'
        }
      ],
      quiz: {
        question: 'Chuyển kho orders từ HDD sang SSD — con số nào trên hóa đơn TỤT sâu nhất?',
        options: [
          { label: 'Giá mỗi cú nhảy random (tiền seek)', correct: true, feedback: '✓ Chuẩn — tS từ 4ms còn ~0,09ms, rẻ ~44 lần. Còn số block PHẢI đọc thì không đổi: phần cứng đổi GIÁ VÉ, không đổi số vé.' },
          { label: 'Số block phải đọc từ đĩa', correct: false, feedback: '✗ Số block do PLAN quyết định, không do phần cứng — SSD không làm bảng ít block đi.' },
          { label: 'Tiền CPU so sánh từng dòng', correct: false, feedback: '✗ CPU không rẻ đi — ngược lại, khi I/O rẻ thì CPU chiếm TỈ TRỌNG lớn hơn trong hóa đơn.' }
        ]
      },
      source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 15.2 — tS/tT cho HDD, SSD, RAM (số 2018) · PART_6 Card B',
      cta: { label: 'Vào Bài 3 — Full Scan vs Index Scan', href: '/lesson/db_design_nc?lesson=3' }
    },

    /* Card C — PART_6 đặt sau Bài 3 */
    {
      id: 'nc_card_bitmap_scan',
      eyebrow: 'HỒ SƠ KỸ THUẬT · SAU BÀI 3',
      title: 'Bitmap Index Scan — lối thứ ba giữa hai làn đạn',
      accent: '#818CF8',
      back_href: '/courses/db_design_nc',
      intro: 'Match nhiều thì index phản chủ, seq scan lại đọc thừa cả kho. Postgres có lối thứ ba: dùng index để <strong>ĐÁNH DẤU block nào chứa hàng</strong> — rồi quét những block được đánh dấu THEO THỨ TỰ, liền mạch được chừng nào hay chừng đó.',
      sections: [
        {
          icon: 'fa-map-location-dot',
          heading: 'Đánh dấu rồi mới đi',
          body: 'Bước 1: tra index, tô bitmap <em>"block 3, 17, 18, 40… có hàng"</em> — chưa đọc dòng nào. Bước 2: quét các block đã tô theo thứ tự tăng dần — mỗi block đọc ĐÚNG MỘT lần, hết cảnh nhảy random tới từng dòng. VIP 5.000 đơn nằm trong 800 block? 800 lượt đọc có trật tự thay vì 5.000 cú nhảy.'
        }
      ],
      quiz: {
        question: 'Khách có 800 đơn rải trong 400 block. Bitmap scan xử lý thế nào?',
        options: [
          { label: 'Tô dấu 400 block chứa hàng, rồi quét 400 block đó theo thứ tự — mỗi block đọc đúng 1 lần', correct: true, feedback: '✓ — 400 lượt đọc có trật tự thay vì 800 cú nhảy random: rẻ hơn hẳn, mà vẫn né được 600 block không có hàng.' },
          { label: 'Vẫn nhảy random 800 lần, chỉ là nhảy nhanh hơn', correct: false, feedback: '✗ — cái hay của bitmap là ĐỔI random lấy tuần tự, không phải nhảy nhanh hơn.' },
          { label: 'Quét luôn cả 1.000 block như seq scan cho lành', correct: false, feedback: '✗ — thế thì cần gì index; bitmap né được các block không chứa match, chỉ đọc 400/1.000.' }
        ]
      },
      source: 'PART_6 Card C — bitmap index scan (Ch 15.3 note: cách PostgreSQL né random I/O khi match nhiều)',
      cta: { label: 'Vào Bài 4 — Sắp xếp thứ to hơn RAM', href: '/lesson/db_design_nc?lesson=4' }
    },

    /* Card E — PART_6 đặt sau Bài 6 (Card D đã BỎ theo chốt đợt 3) */
    {
      id: 'nc_card_hash_skew',
      eyebrow: 'HỒ SƠ KỸ THUẬT · SAU BÀI 6',
      title: 'Hash Join & Skew — khi một xô phình nổ',
      accent: '#818CF8',
      back_href: '/courses/db_design_nc',
      intro: 'Hàm hash chia ĐỀU các giá trị — nhưng DỮ LIỆU không hứa chia đều chính nó. Món hit <strong>Skin súng Neon</strong> chiếm 30.000/100.000 đơn: xô chứa listing_id 3004 ôm ~300 block, RAM chỉ 100. Bảng tra không vừa bộ nhớ = luật chơi hash join vỡ — sách gọi cảnh này là <strong>skew</strong>.',
      sections: [
        {
          icon: 'fa-scale-unbalanced',
          heading: 'Ba đòn trị skew của sách',
          body: '<strong>①</strong> Chia dư xô từ đầu: tăng số xô thêm ~20% (<em>fudge factor</em>) cho mỗi xô nhỏ hơn RAM một khoảng an toàn. <strong>②</strong> <em>Overflow resolution</em>: build tới đâu thấy xô phình thì băm LẠI xô đó bằng một hàm hash KHÁC (cả bên orders lẫn listings). <strong>③</strong> <em>Overflow avoidance</em>: chia thật nhỏ từ đầu rồi gộp các xô bé lại sao cho vừa RAM.'
        },
        {
          icon: 'fa-hand-fist',
          heading: 'Đòn cuối — khi băm lại cũng vô ích',
          body: 'Xô phình vì 30.000 bản sao CÙNG MỘT giá trị 3004? Băm lại bằng hàm nào cũng thế: cùng giá trị → cùng hash → cùng xô. Cả ba đòn đều bó tay. Engine lúc này đổi chiến thuật cho RIÊNG xô đó: bỏ bảng tra, chơi <strong>block nested-loop</strong> — võ cũ của bài 5 quay lại cứu võ mới. Không thuật toán nào bị vứt đi cả.'
        }
      ],
      quiz: {
        question: 'Xô #2 phình 300 block vì 30.000 đơn cùng trỏ listing_id 3004 (món hit). Băm lại xô bằng hàm hash khác có cứu được không?',
        options: [
          { label: 'Không — cùng GIÁ TRỊ thì hash nào cũng ném về chung một xô; phải fallback BNLJ cho riêng xô đó', correct: true, feedback: '✓ Chuẩn — resolution/avoidance chỉ cứu skew do NHIỀU giá trị chen chúc; một giá trị khổng lồ thì đổi thuật toán cho xô đó là đòn cuối của sách.' },
          { label: 'Có — hàm hash mới sẽ rải đều 30.000 đơn ra các xô con', correct: false, feedback: '✗ 30.000 đơn này mang CÙNG một khóa 3004 — hàm mới tính trên cùng đầu vào thì ra cùng đầu ra: cả khối lại dồn về một xô con.' },
          { label: 'Có — miễn là tăng số xô lên gấp đôi từ đầu', correct: false, feedback: '✗ Tăng số xô (kể cả kèm fudge factor) chỉ cứu skew NHẸ do nhiều khóa chen nhau; khối 300 block cùng một khóa thì chia mấy cũng không tách được nó.' }
        ]
      },
      source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 15.5.5.3 — Handling of Overflows: skew, fudge factor, overflow resolution/avoidance · PART_6 Card E',
      cta: { label: 'Vào Bài 7 — GROUP BY giá bằng một lần quét', href: '/lesson/db_design_nc?lesson=7' }
    },

    /* Card F — PART_6 đặt sau Bài 8 (1/2); user chốt chuỗi đọc F → G → bài 9 */
    {
      id: 'nc_card_iterator',
      eyebrow: 'HỒ SƠ KỸ THUẬT · SAU BÀI 8 (1/2)',
      title: 'Iterator Model — open(), next(), close()',
      accent: '#818CF8',
      back_href: '/courses/db_design_nc',
      intro: 'Dây chuyền pipeline ở Bài 8 vận hành bằng một giao ước 3 hàm mà MỌI toán tử phải tuân: <code>open()</code> · <code>next()</code> · <code>close()</code>. Nhờ nói chung một ngôn ngữ, scan, σ, sort hay join đều cắm nối vào nhau tùy ý — như ống nước cùng chuẩn ren.',
      sections: [
        {
          icon: 'fa-plug',
          heading: 'Ba hàm, một giao ước',
          body: '<code>open()</code> — dọn chỗ: mở cuộc quét file, hoặc (với merge join) sort luôn input nếu chưa có trật tự. <code>next()</code> — "cho tôi dòng KẾ": toán tử tự nhớ mình đang đứng đâu giữa hai lần gọi, cần nguyên liệu thì tự gọi next() xuống input của nó. <code>close()</code> — hết cần rồi, dọn dẹp. Executor của PostgreSQL chạy đúng mô hình này (giới nghề gọi là kiểu Volcano).'
        },
        {
          icon: 'fa-arrows-up-down',
          heading: 'Kéo hay Đẩy?',
          body: 'Chuỗi next() là <strong>demand-driven</strong> — dữ liệu bị KÉO từ đỉnh: root bị đòi kết quả mới hỏi xuống, tuple được tính một cách lười biếng, đúng lúc cần. Chiều ngược là <strong>producer-driven</strong>: các toán tử háo hức ĐẨY tuple lên qua buffer giữa các tầng — hệ song song và các engine compile-ra-machine-code chuộng kiểu đẩy vì ít lần gọi hàm hơn.'
        }
      ],
      quiz: {
        question: 'Trong demand-driven pipeline, ai KHỞI XƯỚNG mọi việc tính toán?',
        options: [
          { label: 'Toán tử ĐỈNH — root bị đòi kết quả thì gọi next() xuống dưới, dữ liệu bị KÉO lên từng dòng', correct: true, feedback: '✓ Chuẩn — không ai nhúc nhích cho đến khi bị hỏi; cú next() lan từ đỉnh xuống tận scan rồi tuple ngược dòng đi lên.' },
          { label: 'Scan ở đáy — đọc được dòng nào tự đẩy lên dòng đó', correct: false, feedback: '✗ Đó là producer-driven (kiểu ĐẨY) — demand-driven thì scan cũng lười như mọi người: bị hỏi mới đọc.' },
          { label: 'Optimizer — nó điều phối từng nhịp chạy của các toán tử', correct: false, feedback: '✗ Optimizer chọn xong plan là NGHỈ — lúc chạy là việc của executor với chuỗi next().' }
        ]
      },
      source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 15.7.2.1 — Implementation of Pipelining: iterator, demand-driven vs producer-driven · PART_6 Card F',
      cta: { label: 'Đọc tiếp hồ sơ 2/2 — Blocking Operator', href: '/card/nc_card_blocking' }
    },

    /* Card G — PART_6 đặt sau Bài 8 (2/2) */
    {
      id: 'nc_card_blocking',
      eyebrow: 'HỒ SƠ KỸ THUẬT · SAU BÀI 8 (2/2)',
      title: 'Blocking Operator — kẻ chặn giữa dòng chảy',
      accent: '#818CF8',
      back_href: '/courses/db_design_nc',
      intro: 'Có những toán tử KHÔNG THỂ nhả dòng nào khi chưa nhìn hết input — sort là điển hình: dòng bé nhất có thể nằm ở cuối kho. Bạn đã chạm mặt kẻ chặn này hai lần: external sort (Bài 4) và pha build của hash join (Bài 6).',
      sections: [
        {
          icon: 'fa-road-barrier',
          heading: 'Chặn — nhưng chặn ở ĐÂU?',
          body: 'Blocking KHÔNG có nghĩa "materialize cả cây". Sort-merge gồm 2 pha: pha TẠO-RUN vẫn nhận dòng chảy VÀO (pipeline với input), pha MERGE vẫn nhả dòng chảy RA (pipeline với output) — cú chặn chỉ nằm ở RANH GIỚI giữa hai pha. Plan vì thế chia thành các <em>pipeline stage</em>, engine chạy lần lượt từng stage.'
        },
        {
          icon: 'fa-list-check',
          heading: 'Điểm danh kẻ chặn',
          body: '<strong>Sort</strong>: blocking bẩm sinh. <strong>Hash join</strong>: pha build chặn (phải nạp trọn bảng nhỏ), pha probe chảy ngon. <strong>Indexed NLJ</strong>: chảy theo outer, nhưng chặn phía index (index phải dựng xong đã). <strong>σ, π, scan</strong>: không bao giờ chặn — xử từng dòng một.'
        }
      ],
      quiz: {
        question: 'Cây plan có SORT nằm chính giữa — pipeline của CẢ CÂY có chết theo không?',
        options: [
          { label: 'Không — chặn chỉ nằm giữa 2 pha của sort: input vẫn chảy vào pha tạo-run, pha merge vẫn chảy tiếp lên trên', correct: true, feedback: '✓ Chuẩn — blocking là ranh giới cục bộ chia cây thành các stage, không phải án tử cho pipeline toàn cây.' },
          { label: 'Có — từ đáy tới đỉnh mọi tầng đều phải quay về ghi temp table', correct: false, feedback: '✗ Quá tay — các cạnh quanh sort vẫn pipeline bình thường; chỉ ranh giới tạo-run ‖ merge là phải chờ.' },
          { label: 'Không, vì sort chẳng bao giờ blocking — cứ nhả dòng tới đâu hay tới đó', correct: false, feedback: '✗ Nhả sớm là SAI kết quả: dòng bé nhất có thể nằm cuối kho — chưa nhìn hết input thì sort không dám hứa gì.' }
        ]
      },
      source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 15.7.2.2 — Evaluation Algorithms for Pipelining: blocking/pipelined edges, pipeline stages · PART_6 Card G',
      cta: { label: 'Vào Bài 9 — Optimizer viết lại query', href: '/lesson/db_design_nc?lesson=9' }
    },

    /* Card H — PART_6 đặt sau Bài 10 (1/3); chuỗi H → I → J → trang khóa (user chốt 2026-07-06) */
    {
      id: 'nc_card_histogram_analyze',
      eyebrow: 'HỒ SƠ TỐT NGHIỆP MODULE 7 · 1/3',
      title: 'Histograms & ANALYZE — cuốn sổ cũng biết nói dối',
      accent: '#818CF8',
      back_href: '/courses/db_design_nc',
      intro: 'Bài 10 trao cho optimizer cuốn sổ thống kê — nhưng có một sự thật chưa nói hết: sổ được lập bằng cách <strong>LẤY MẪU</strong> (đọc một phần bảng, suy ra toàn cục) và chỉ được làm mới <strong>ĐỊNH KỲ</strong>. Nghĩa là con số trong sổ có thể… cũ.',
      sections: [
        {
          icon: 'fa-clock-rotate-left',
          heading: 'Sổ cũ = án oan',
          body: 'Nửa đêm import 50.000 đơn khuyến mãi — sáng ra sổ VẪN ghi số của hôm qua: optimizer tưởng bảng bé, chọn plan cho bảng bé, và query ì ạch một cách "bí ẩn". Thuốc đặc trị một dòng: <code>ANALYZE orders;</code> — bắt engine lấy mẫu lại, dựng lại histogram. Postgres có autovacuum tự làm việc này, nhưng sau bulk load lớn thì dân chuyên vẫn ANALYZE bằng tay.'
        },
        {
          icon: 'fa-vial',
          heading: 'Vì sao chỉ lấy mẫu?',
          body: 'Đọc trọn 1.000 block chỉ để lập sổ thì bằng chạy không công một Seq Scan — nên engine đọc mẫu vài trăm dòng ngẫu nhiên rồi ngoại suy. Sổ vì thế là bản ƯỚC HỌA, không phải ảnh chụp: đủ đúng để chọn plan, đủ rẻ để làm thường xuyên. Debug plan vụng luôn bắt đầu bằng câu hỏi: "sổ được ANALYZE lần cuối khi nào?"'
        }
      ],
      quiz: {
        question: 'Import 50.000 đơn lúc 0h. 8h sáng, query trên orders bỗng chậm bất thường dù index còn nguyên. Nghi phạm số một?',
        options: [
          { label: 'Sổ thống kê chưa cập nhật — optimizer vẫn tưởng bảng như hôm qua, plan lỗi thời; chạy ANALYZE là tỉnh', correct: true, feedback: '✓ Chuẩn — dữ liệu đổi lớn mà sổ chưa kịp đổi là công thức kinh điển của "query tự nhiên chậm". ANALYZE xong, estimate đúng lại, plan đúng lại.' },
          { label: 'Index bị import làm hỏng, phải build lại', correct: false, feedback: '✗ Index vẫn được cập nhật theo từng dòng ghi — nó không "hỏng" vì import; thứ KHÔNG tự cập nhật theo từng dòng chính là cuốn sổ.' },
          { label: 'RAM buffer bị 50.000 đơn mới chiếm hết', correct: false, feedback: '✗ Buffer là chuyện thoáng qua (block cũ bị đẩy ra rồi nạp lại dần) — không giải thích nổi việc PLAN đổi hẳn sang kiểu vụng.' }
        ]
      },
      source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 16.3 — statistics maintenance & sampling · PART_6 Card H',
      cta: { label: 'Hồ sơ 2/3 — Top-K Optimization', href: '/card/nc_card_topk' }
    },

    /* Card I — PART_6 đặt sau Bài 10 (2/3) */
    {
      id: 'nc_card_topk',
      eyebrow: 'HỒ SƠ TỐT NGHIỆP MODULE 7 · 2/3',
      title: 'Top-K — LIMIT 10 không đáng giá một cú sort toàn kho',
      accent: '#818CF8',
      back_href: '/courses/db_design_nc',
      intro: 'Trang chủ chợ hiện "10 đơn lớn nhất hôm nay": <code>ORDER BY total DESC LIMIT 10</code>. Sort là kẻ chặn (Bài 8) — chẳng lẽ vì 10 dòng mà external-sort cả 100.000 đơn? Optimizer có chiêu riêng cho những câu "chỉ cần TOP".',
      sections: [
        {
          icon: 'fa-ranking-star',
          heading: 'Hai lối tắt của Top-K',
          body: '<strong>Lối 1 — heap top-10:</strong> quét kho một lượt, nuôi một danh sách 10 phần tử lớn nhất tính đến hiện tại — đọc đủ 100.000 nhưng KHÔNG sort 100.000; RAM chỉ tốn 10 chỗ. <strong>Lối 2 — có index trên total:</strong> đi ngược cây index từ đầu lớn, nhặt đúng 10 dòng rồi… dừng. Không sort, thậm chí không quét kho.'
        },
        {
          icon: 'fa-link',
          heading: 'Nối lại các bài cũ',
          body: 'Top-K là màn bắt tay của cả module: LIMIT làm root chỉ đòi 10 cú next() (Card F) — nếu plan không có kẻ chặn thì 10 dòng về là cả cây NGỦ luôn; sort-chặn (Card G) được thay bằng heap-gần-như-chảy; và để chọn giữa heap hay index, optimizer lại… mở sổ ra tra (Bài 10).'
        }
      ],
      quiz: {
        question: '"10 đơn lớn nhất": ORDER BY total DESC LIMIT 10 trên 100.000 đơn, index idx_total nằm sẵn. Plan giỏi nhất?',
        options: [
          { label: 'Đi NGƯỢC index từ đầu lớn, nhặt đúng 10 dòng rồi dừng — không sort, không quét kho', correct: true, feedback: '✓ Chuẩn — index vốn là dữ liệu ĐÃ có trật tự: 10 dòng đầu của chiều ngược chính là top-10; cả query tốn ~10 cú tra.' },
          { label: 'External sort trọn 100.000 đơn rồi cắt lấy 10 dòng đầu', correct: false, feedback: '✗ Trả tiền sort cả kho (≈3.000 block — Bài 4) cho 10 dòng — đây chính là plan mà Top-K sinh ra để thay thế.' },
          { label: 'Seq Scan rồi bỏ ORDER BY — có LIMIT thì thứ tự không quan trọng', correct: false, feedback: '✗ Sai nghĩa hoàn toàn: bỏ ORDER BY là trả 10 đơn TÙY HỨNG, không phải 10 đơn LỚN NHẤT — kết quả khác là không được phép (luật tương đương, Bài 9).' }
        ]
      },
      source: 'PART_6 Card I — Top-K optimization (Ch 16.4 note: LIMIT không nên sort toàn bộ nếu có cách tốt hơn)',
      cta: { label: 'Hồ sơ 3/3 — Join Minimization & Shared Scan', href: '/card/nc_card_join_minimization' }
    },

    /* Card J — PART_6 đặt CUỐI MODULE; CTA về trang khóa (bài 11/module 8 chưa mở) */
    {
      id: 'nc_card_join_minimization',
      eyebrow: 'HỒ SƠ TỐT NGHIỆP MODULE 7 · 3/3 — CUỐI MODULE',
      title: 'Join Minimization & Shared Scan — hai ngón nghề cuối',
      accent: '#818CF8',
      back_href: '/courses/db_design_nc',
      intro: 'Trước khi đóng cửa Engine Room, hai chiêu ít người biết của optimizer: <strong>bỏ hẳn một cái join</strong> khi chứng minh được nó vô hại — và <strong>cho nhiều query đi chung một chuyến quét kho</strong>.',
      sections: [
        {
          icon: 'fa-scissors',
          heading: 'Join minimization — cắt bảng khỏi plan',
          body: 'Query JOIN listings "cho chắc" nhưng SELECT không đụng cột nào của listings? Nếu FK <code>orders.listing_id → listings</code> (NOT NULL, trỏ PK) đã ĐẢM BẢO mỗi đơn khớp đúng một món — join không thêm không bớt dòng nào — optimizer CẮT hẳn listings khỏi plan. Constraint từ khóa Cơ bản giờ thành công cụ tối ưu: schema sạch là quà tặng cho engine.'
        },
        {
          icon: 'fa-people-group',
          heading: 'Shared scan — đi chung chuyến xe',
          body: '10 dashboard cùng quét orders 1.000 block vào 8h sáng? Thay vì 10 chuyến × 1.000 block, engine cho các query BÁM CHUNG một lượt quét đang chạy: một chuyến xe, nhiều hành khách — mỗi block đọc lên phục vụ tất cả. I/O từ 10.000 block về 1.000.'
        }
      ],
      quiz: {
        question: 'Query JOIN listings nhưng SELECT chỉ lấy cột của orders; FK orders.listing_id (NOT NULL) → PK listings. Optimizer làm gì?',
        options: [
          { label: 'Cắt hẳn listings khỏi plan — constraint đảm bảo join 1-1 nên kết quả không đổi, mà bớt được cả một bảng', correct: true, feedback: '✓ Chuẩn — join minimization: luật tương đương + constraint = giấy phép xóa join thừa. Một lý do nữa để khai FK/NOT NULL tử tế.' },
          { label: 'Vẫn phải join — dev đã viết thì engine phải chạy đúng từng chữ', correct: false, feedback: '✗ Bài 9 đã lật đổ tư duy này: SQL là khai báo — engine chỉ nợ bạn KẾT QUẢ, không nợ từng động tác.' },
          { label: 'Đổi sang tích Descartes cho đỡ tốn điều kiện nối', correct: false, feedback: '✗ Descartes là thứ optimizer NÉ bằng mọi giá (80 triệu dòng — Bài 9), không bao giờ là "cho đỡ tốn".' }
        ]
      },
      source: 'PART_6 Card J — join minimization & shared scan (Ch 16 Advanced Topics in Query Optimization)',
      cta: { label: 'Hết Module 7 — Engine Room ✓ · Hẹn Module 8: Giao dịch & Concurrency', href: '/courses/db_design_nc' }
    },

    /* ═══ MODULE 8 — Card A (PART_7: sau Bài 3 / nc_13) ═══ */
    {
      id: 'nc_card_strict_rigorous',
      eyebrow: 'HỒ SƠ KỸ THUẬT · SAU BÀI 13',
      title: 'Strict vs Rigorous 2PL — giữ đến commit thì mua được gì?',
      accent: '#FB7185',
      back_href: '/courses/db_design_nc',
      intro: '2PL cơ bản còn một khe hở chết người: nhả khóa X <em>trước khi commit</em> là kẻ khác đọc được dữ liệu CHƯA CHẮC SỐNG. Sách vá bằng hai phiên bản khắc nghiệt hơn — và chính chúng, chứ không phải bản cơ bản, mới là thứ chạy trong DBMS thương mại.',
      sections: [
        {
          icon: 'fa-house-crack',
          heading: 'Vụ sập dây chuyền (Fig 18.8)',
          body: 'T5 ghi vào A rồi nhả khóa X — đúng luật 2PL vì nó không xin thêm gì nữa. T6 chen vào đọc A, ghi tiếp, nhả; T7 lại đọc theo. Rồi T5… <strong>SẬP</strong> trước khi commit. Dữ liệu T5 ghi phải hủy — nhưng T6 đã tính toán trên con số ma đó, T7 tính trên số của T6: <strong>cascading rollback</strong>, sập cả dây chuyền ba mạng vì một khe nhả sớm.'
        },
        {
          icon: 'fa-shield-heart',
          heading: 'Strict và Rigorous — hai mức găm khóa',
          body: '<strong>STRICT 2PL</strong>: mọi khóa <em>X</em> phải găm đến tận commit/abort — không ai đọc được dữ liệu chưa commit, cascading rollback chết từ trứng. <strong>RIGOROUS 2PL</strong>: găm <em>TẤT CẢ</em> khóa (cả S) đến commit — phần thưởng thêm: các giao dịch serialize đúng theo <strong>thứ tự commit</strong>, suy luận dễ như đọc log. Sách chốt: hai bản này "được dùng rộng rãi trong các hệ thương mại".',
          variant: 'quote',
          source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.1.3 — strict & rigorous two-phase locking'
        }
      ],
      quiz: {
        question: 'Vì sao STRICT 2PL (găm khóa X đến commit) giết được cascading rollback từ trong trứng?',
        options: [
          { label: 'Vì không ai ĐỌC được dữ liệu do giao dịch chưa commit ghi ra — T5 có sập cũng chẳng ai kịp tính toán trên con số ma của nó', correct: true, feedback: '✓ Chuẩn — khóa X còn găm nghĩa là bản ghi còn "trong phòng kín"; thế giới chỉ thấy dữ liệu đã chắc chắn sống.' },
          { label: 'Vì strict 2PL cấm luôn chuyện abort — giao dịch nào cũng phải commit', correct: false, feedback: '✗ Không ai cấm được abort (mất điện, lỗi logic…) — strict chỉ đảm bảo lúc abort, chưa ai kịp ĐỌC thứ sắp bị hủy.' },
          { label: 'Vì nó bắt các giao dịch chạy tuần tự tuyệt đối, hết đường chen', correct: false, feedback: '✗ Vẫn đồng thời như thường — chỉ dữ liệu ĐANG BỊ GHI dở là bị che; các item khác ai muốn đụng cứ đụng.' }
        ]
      },
      source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.1.3 · PART_7 Card A — Strict vs Rigorous 2PL',
      cta: { label: 'Vào bài 14 — Deadlock: vòng tròn chờ nhau đến vĩnh viễn', href: '/lesson/db_design_nc?lesson=14' }
    },

    /* ═══ MODULE 8 — Card B (PART_7: sau Bài 4 / nc_14) ═══ */
    {
      id: 'nc_card_waitdie_woundwait',
      eyebrow: 'HỒ SƠ KỸ THUẬT · SAU BÀI 14',
      title: 'Wait-Die vs Wound-Wait — phân xử bằng tuổi, khỏi soi graph',
      accent: '#FB7185',
      back_href: '/courses/db_design_nc',
      intro: 'Bài 14 CHỮA deadlock bằng soi graph + tế victim. Trường phái PHÒNG làm khác: cấp cho mỗi giao dịch một <strong>timestamp</strong> lúc chào đời, và mọi cú "xin đồ kẻ khác đang giữ" được phân xử ngay tại quầy bằng tuổi — vòng chờ không bao giờ kịp khép.',
      sections: [
        {
          icon: 'fa-hourglass-half',
          heading: 'Hai luật, cùng một nguyên tắc',
          body: 'Lấy T14(ts=5) GIÀ, T15(ts=10), T16(ts=15) TRẺ. <strong>WAIT-DIE</strong> (không cướp): xin đồ của kẻ TRẺ hơn thì GIÀ được chờ — T14 xin của T15: chờ; TRẺ xin của già thì CHẾT — T16 xin của T15: rollback. <strong>WOUND-WAIT</strong> (có cướp): GIÀ xin của trẻ thì ĐÂM — T14 xin của T15: T15 bị rollback nhường đồ; trẻ xin của già thì ngoan ngoãn CHỜ — T16 xin của T15: chờ. Cả hai đều chặn mọi vòng chờ già-trẻ lẫn lộn — deadlock hết cửa khép vòng.'
        },
        {
          icon: 'fa-rotate-left',
          heading: 'Điều khoản chống chết mãi — và cái giá',
          body: 'Giao dịch bị rollback <strong>GIỮ NGUYÊN timestamp cũ</strong> khi chạy lại — nghĩa là mỗi lần tái sinh nó một "già" hơn tương đối, sớm muộn cũng đủ tuổi để thắng: không ai starvation. Cái giá của cả hai scheme: <strong>rollback oan</strong> — nhiều mạng bị tế dù vòng chờ thật ra chẳng bao giờ khép. Còn chiêu dân dã lock timeout (chờ quá hạn thì tự chết)? Sách lắc đầu: hạn ngắn thì chém oan, hạn dài thì kẹt lâu — "khả dụng hạn chế".'
        }
      ],
      quiz: {
        question: 'Dưới WOUND-WAIT: T16 (trẻ, ts=15) đang giữ khóa ví; T14 (già, ts=5) xin đúng khóa đó. Chuyện gì xảy ra?',
        options: [
          { label: 'T16 bị ĐÂM — rollback nhường khóa cho T14; lúc chạy lại T16 giữ nguyên ts=15 nên không bị bắt nạt mãi', correct: true, feedback: '✓ Chuẩn — wound-wait là luật CÓ CƯỚP: già xin của trẻ là trẻ đổ máu; và timestamp giữ nguyên là bảo hiểm chống starvation.' },
          { label: 'T14 xếp hàng chờ T16 xong việc — già thì càng phải nhẫn nại', correct: false, feedback: '✗ Đó là wait-die (già CHỜ trẻ). Wound-wait ngược tính: già không chờ ai — nó đâm.' },
          { label: 'T14 bị rollback vì dám đụng khóa đang có chủ', correct: false, feedback: '✗ Ở cả hai scheme, kẻ GIÀ không bao giờ là bên bị tế khi đối đầu trẻ — nó hoặc chờ (wait-die) hoặc đâm (wound-wait).' }
        ]
      },
      source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.2.1 — Deadlock Prevention: wait-die, wound-wait, lock timeouts · PART_7 Card B',
      cta: { label: 'Vào bài 15 — Multiple Granularity & Intention Locks', href: '/lesson/db_design_nc?lesson=15' }
    },

    /* ═══ MODULE 8 — Card C (PART_7: sau Bài 5 / nc_15) ═══ */
    {
      id: 'nc_card_lock_escalation',
      eyebrow: 'HỒ SƠ KỸ THUẬT · SAU BÀI 15',
      title: 'Lock Escalation — vạn khóa dòng đổi một khóa bảng',
      accent: '#FB7185',
      back_href: '/courses/db_design_nc',
      intro: 'Cây khóa cho phép khóa đúng cỡ — nhưng một giao dịch tham ăn vẫn có thể gom <em>hàng vạn khóa dòng</em>, và lock table (bảng ghi sổ của lock manager) thì sống trong RAM. Sổ phình quá là engine ra tay: <strong>đổi cả nắm khóa nhỏ lấy MỘT khóa to</strong>.',
      sections: [
        {
          icon: 'fa-arrow-up-wide-short',
          heading: 'Ước lượng trước, leo thang sau',
          body: 'Sách chỉ cách engine đoán trước số khóa từ kiểu scan: <strong>relation scan</strong> — khóa luôn CẤP BẢNG từ đầu (đằng nào cũng đụng mọi dòng); <strong>index scan ít dòng</strong> — intention lock cấp bảng + khóa thật từng tuple. Còn khi một giao dịch cứ gom mãi tuple lock tới mức lock table quá tải, lock manager thực hiện <strong>lock escalation</strong>: thay nhiều khóa cấp thấp bằng một khóa cấp cao hơn — một relation lock thế chỗ cả vạn tuple lock.',
          variant: 'quote',
          source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.3 — lock escalation'
        },
        {
          icon: 'fa-scale-unbalanced',
          heading: 'Cái giá của cú đổi',
          body: 'Escalation cứu RAM nhưng <strong>bán rẻ concurrency</strong>: khóa bảng vừa thế chỗ sẽ chặn mọi kẻ muốn ghi bất kỳ dòng nào — kể cả dòng giao dịch kia chưa hề đụng. Đời thực: SQL Server escalate quanh ngưỡng ~5.000 khóa/câu lệnh và là thủ phạm kinh điển của các vụ "UPDATE nửa bảng xong cả app đơ"; dân DBA né bằng cách <em>chia batch nhỏ</em> — mỗi batch dưới ngưỡng, sổ khóa không bao giờ phình tới mức engine phải ra tay.'
        }
      ],
      quiz: {
        question: 'Giao dịch T cập nhật dần 50.000 dòng listings và lock manager vừa escalate lên khóa X cấp bảng. Hệ quả tức thì là gì?',
        options: [
          { label: 'Lock table nhẹ hẳn — nhưng MỌI giao dịch muốn ghi bất kỳ dòng nào của listings giờ phải chờ T, kể cả dòng T chưa hề đụng', correct: true, feedback: '✓ Chuẩn — đổi vạn khóa lấy một là đổi RAM lấy concurrency: X cấp bảng khóa ngầm trọn subtree.' },
          { label: 'T bị rollback vì gom quá nhiều khóa — escalation là một hình phạt', correct: false, feedback: '✗ Không ai phạt T — escalation là cứu trợ cho LOCK TABLE, T vẫn chạy tiếp bình thường với một khóa to hơn.' },
          { label: 'Các khóa dòng cũ vẫn giữ nguyên, chỉ thêm một khóa bảng đè lên', correct: false, feedback: '✗ Điểm mấu chốt là THAY THẾ: vạn khóa dòng được nhả để sổ nhẹ đi — giữ cả hai thì escalate làm gì.' }
        ]
      },
      source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.3 · PART_7 Card C — Lock Escalation',
      cta: { label: 'Vào bài 16 — Phantom: con ma lọt lưới khóa dòng', href: '/lesson/db_design_nc?lesson=16' }
    },

    /* ═══ MODULE 8 — Card D (PART_7: sau Bài 6 / nc_16) ═══ */
    {
      id: 'nc_card_predicate_locking',
      eyebrow: 'HỒ SƠ KỸ THUẬT · SAU BÀI 16',
      title: 'Predicate Locking — chính xác tuyệt đối, đắt vô đối',
      accent: '#FB7185',
      back_href: '/courses/db_design_nc',
      intro: 'Index-locking bắt ma bằng cách khóa CÁI LÁ — xấp xỉ hơi thô (hai insert chung lá vẫn chặn nhau oan). Có một giải pháp chính xác đến hoàn hảo trên lý thuyết: khóa thẳng vào <strong>VỊ NGỮ</strong>. Và sách dành cho nó đúng một câu lạnh lùng: đắt, nên thực tế không dùng.',
      sections: [
        {
          icon: 'fa-crosshairs',
          heading: 'Khóa cả những dòng chưa sinh ra',
          body: 'Predicate lock trên <code>price &lt; 100</code> phủ MỌI tuple thỏa vị ngữ — kể cả tuple <em>chưa tồn tại</em>: chèn món 45 gem là đụng khóa ngay, dù chẳng có lá index nào chung. Không bắt oan ai (chèn món 510 gem đi qua tự do), không lọt con ma nào — độ chính xác mà index-locking chỉ biết mơ.'
        },
        {
          icon: 'fa-coins',
          heading: 'Vì sao thực tế lắc đầu',
          body: 'Muốn xét vênh, lock manager phải trả lời câu "<em>hai vị ngữ này có GIAO nhau không?</em>" — <code>price &lt; 100</code> vs <code>price BETWEEN 40 AND 60</code>? — tức là giải bài toán logic cho TỪNG CẶP yêu cầu, thay vì tra một ô ma trận. Sách chốt: predicate locking <strong>chi phí cài đặt cao, thực tế không được dùng</strong>; các DBMS chọn xấp xỉ rẻ — index-locking, next-key locking — hoặc rẽ hẳn sang thế giới snapshot (bài 18 sẽ tới).',
          variant: 'quote',
          source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.4.3 — predicate locking'
        }
      ],
      quiz: {
        question: 'T1 giữ predicate lock trên "price < 100". T2 muốn chèn Skin 790 gem, T3 muốn chèn Kiếm 45 gem. Ai qua, ai chờ?',
        options: [
          { label: 'T2 qua tự do (790 không thỏa vị ngữ) — T3 chờ (45 lọt vùng khóa, dù dòng đó chưa tồn tại)', correct: true, feedback: '✓ Chuẩn — khóa theo VỊ NGỮ xét bằng logic, không cần dòng hay lá nào có thật: chính xác tuyệt đối, và đắt cũng vì thế.' },
          { label: 'Cả hai chờ — predicate lock chặn mọi INSERT vào bảng cho chắc', correct: false, feedback: '✗ Thế thì nó là khóa bảng chứ báu gì — điểm ăn tiền của predicate lock là CHỈ chặn kẻ giao với vị ngữ.' },
          { label: 'Cả hai qua — khóa chỉ phủ các dòng đang tồn tại lúc xin khóa', correct: false, feedback: '✗ Đó là tuple-lock, đúng cái lỗ hổng phantom của bài 16. Predicate lock phủ cả tương lai của vị ngữ.' }
        ]
      },
      source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.4.3 · PART_7 Card D — Predicate Locking',
      cta: { label: 'Bài 17 — Optimistic Concurrency: chạy nháp rồi soát', href: '/lesson/db_design_nc?lesson=17' }
    },

    /* Card E (PART_7, sau bài 17) — Thomas' Write Rule (Ch.18.5.3): obsolete
     * write LỜ đi thay vì rollback; nền timestamp-ordering dạy mức mental model
     * già/trẻ (PART_7 dặn không bắt nhớ full rule); mở view serializability. */
    {
      id: 'nc_card_thomas_write',
      eyebrow: 'HỒ SƠ KỸ THUẬT · SAU BÀI 17',
      title: 'Thomas\' Write Rule — bản ghi cũ rích thì lờ đi',
      accent: '#FB7185',
      back_href: '/courses/db_design_nc',
      intro: 'Optimistic soát MỘT LẦN lúc nộp bài. Người anh em của nó — <strong>timestamp ordering</strong> (Ch.18.5) — khó tính hơn: phát mỗi giao dịch một con tem rồi xử NGAY từng cú đọc/ghi lệch thứ tự. Và trong trường phái đó có một chiêu lì lợm mang tên riêng một con người: thay vì rollback, <em>lờ đi</em>.',
      sections: [
        {
          icon: 'fa-clock',
          heading: 'Trường phái tem: già/trẻ, không ai chờ ai',
          body: 'Tem nhỏ = giao dịch GIÀ. Luật chơi gói trong một câu: mọi cú đọc/ghi vênh nhau phải diễn ra <strong>theo thứ tự tem</strong> — đọc thứ đã bị "tương lai" đè, hay ghi đè thứ "tương lai" đã đọc → rollback ngay tại quầy, nhận tem MỚI, chạy lại. Không ai chờ ai bao giờ nên <strong>không bao giờ deadlock</strong>; đổi lại, giao dịch dài dễ bị đám trẻ tông rớt hoài — vẫn bài starvation quen mặt.'
        },
        {
          icon: 'fa-hand',
          heading: 'Cú ghi không ai sẽ đọc — theo đúng sách',
          body: 'T27 (già) đọc Q; T28 (trẻ) ghi Q; rồi T27 mới lò dò tới <strong>ghi Q</strong>. Protocol gốc: rollback T27 — ghi quá muộn. Nhưng khoan: bản T27 định ghi <em>không một ai sẽ đọc</em> — kẻ già hơn T28 mà đọc Q là tự rớt, kẻ trẻ hơn thì phải đọc bản của T28. Thomas\' write rule: cú ghi lỗi thời (obsolete) ấy <strong>được LỜ ĐI</strong>, T27 sống tiếp. Kết quả y hệt như thể T27 đã ghi trước T28 thật.',
          variant: 'quote',
          source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.5.3 — Thomas\' Write Rule'
        },
        {
          icon: 'fa-door-open',
          heading: 'Cánh cửa view serializability',
          body: 'Lịch chạy sau khi "lờ" không còn conflict-serializable — mà vẫn ĐÚNG. Sách gọi tầng đúng-đắn rộng hơn này là <strong>view serializable</strong>: ai đọc gì của ai và bản ghi CHỐT là của ai đều khớp với một lịch tuần tự. Nhân vật đặc trưng của tầng này: <em>blind write</em> — ghi mà chẳng thèm đọc trước. Cả 2PL, tree protocol lẫn timestamp gốc đều không với tới những lịch này; Thomas thì cứ thế bước qua.'
        }
      ],
      quiz: {
        question: 'TS(T27) < TS(T28). T28 đã ghi Q xong. Giờ T27 mới tới GHI Q (nó không hề đọc Q trước đó). Protocol gốc và Thomas\' write rule mỗi bên xử sao?',
        options: [
          { label: 'Gốc: rollback T27 (ghi quá muộn). Thomas: LỜ cú ghi — giá trị đó không ai sẽ đọc; kết quả tương đương T27 ghi trước T28 thật', correct: true, feedback: '✓ Chuẩn — cùng một tình huống, một bên đập đi làm lại, một bên nhún vai cho qua; và cho qua mà vẫn đúng, nhờ đứng trên nền view serializability.' },
          { label: 'Cả hai đều rollback T27 — ghi đè lịch sử là trọng tội, không có ngoại lệ', correct: false, feedback: '✗ Protocol gốc thì đúng vậy, nhưng toàn bộ lý do Thomas tồn tại là ngoại lệ này: bản ghi KHÔNG AI SẼ ĐỌC thì rollback chỉ tốn công vô ích.' },
          { label: 'Thomas cho T27 ghi ĐÈ lên bản của T28 — ai tới sau người đó thắng', correct: false, feedback: '✗ Ngược đời — đè bản của T28 là để kẻ TRẺ đọc phải đồ của kẻ GIÀ, gãy luôn thứ tự tem. Thomas lờ cú ghi đi, không phải cho nó thắng.' }
        ]
      },
      source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.5.3 + Note 18.1 · PART_7 Card E — Thomas\' Write Rule',
      cta: { label: 'Bài 18 — MVCC & Snapshot: sổ không tẩy xóa', href: '/lesson/db_design_nc?lesson=18' }
    },

    /* Card Lock vs MVCC (NGOÀI PART_7 — trả nợ audit cũ, user chốt đợt 10 đặt
     * sau bài 18): tổng kết hai trường phái M8 — chờ vs làm-lại, thực tế trộn. */
    {
      id: 'nc_card_lock_vs_mvcc',
      eyebrow: 'HỒ SƠ TỔNG HỢP · SAU BÀI 18',
      title: 'Lock vs MVCC — hai trường phái giữ trật tự một cái chợ',
      accent: '#FB7185',
      back_href: '/courses/db_design_nc',
      intro: 'Tám bài Trading Floor vừa đi qua HAI thế giới: nửa đầu là <strong>khóa</strong> — bi quan, chặn từ cửa; nửa sau là <strong>soát-và-version</strong> — lạc quan, chạy trước soát sau. Không phe nào "thắng": mỗi phe trả một loại giá, và DBMS thật thì… chơi cả hai.',
      sections: [
        {
          icon: 'fa-scale-balanced',
          heading: 'Hai loại giá',
          body: 'Phe khóa trả bằng <strong>CHỜ</strong>: xếp hàng, deadlock phải phá, reader kẹt sau writer (nỗi khổ của báo cáo 2 tiếng). Phe lạc quan/MVCC trả bằng <strong>LÀM LẠI</strong>: rớt soát là xé nháp chạy lại, cộng tiền thuê kho version + công dọn. Quy tắc chọn: va chạm DÀY → chờ rẻ hơn làm lại (khóa thắng); va chạm THƯA / read-heavy → làm lại hiếm khi xảy ra (lạc quan thắng đậm).'
        },
        {
          icon: 'fa-blender',
          heading: 'Thực tế: cả làng chơi snapshot — nhưng trộn khóa',
          body: 'Oracle, PostgreSQL, SQL Server đều nhận snapshot isolation (sách 18.8 nêu đích danh). Nhưng soi vào ruột: biến thể <em>first updater wins</em> dùng <strong>write lock</strong> cho update; multiversion 2PL cho update chạy rigorous 2PL hẳn hoi — chỉ read-only là hưởng trọn "không chờ không abort". Tức là: <strong>reader đi đường MVCC, writer vẫn xài đồ nghề của phe khóa</strong>. Hai trường phái trộn vào nhau, không thay thế nhau.'
        },
        {
          icon: 'fa-broom',
          heading: 'Cái giá ẩn: kho version phải có người quét',
          body: 'Không đè nghĩa là không tự mất: mỗi UPDATE/DELETE để lại một xác bản cũ. Luật dọn của sách: bản đủ già, mọi giao dịch còn sống đều không cần nữa → xóa được. Postgres giao việc này cho <code>VACUUM</code> — bảng "phình dù DELETE ầm ầm" hay autovacuum cắn CPU lúc nửa đêm chính là hóa đơn thuê kho lịch sử được gửi tới tay bạn.'
        }
      ],
      quiz: {
        question: 'Sàn X: 98% giao dịch chỉ XEM hàng, update lác đác. Sàn Y: 500 bot suốt ngày tranh sửa giá đúng 10 món hot. Kê đơn trường phái cho từng sàn?',
        options: [
          { label: 'X → MVCC/optimistic: reader không chờ, cửa soát hiếm khi rớt. Y → khóa: va chạm dày, xé-nháp-làm-lại liên tục còn đắt hơn xếp hàng tử tế', correct: true, feedback: '✓ Chuẩn đơn — thước đo là TỈ LỆ VA CHẠM, không phải tổng lưu lượng: chờ rẻ khi đằng nào cũng phải nhường nhau, làm-lại rẻ khi gần như chẳng bao giờ thua.' },
          { label: 'Cả hai → MVCC: công nghệ mới hơn thì tốt hơn, khóa là đồ cổ', correct: false, feedback: '✗ MVCC không "mới hơn" mà là ĐÁNH ĐỔI khác: sàn Y với 500 bot đâm nhau trên 10 món sẽ abort xối xả — mỗi cú abort là toàn bộ công sức vứt đi, tệ hơn cả xếp hàng.' },
          { label: 'Cả hai → khóa: chắc chắn là trên hết, chậm còn hơn sai', correct: false, feedback: '✗ MVCC không hề "sai" hơn — read-only trên snapshot đọc nhất quán tuyệt đối. Bắt sàn X (98% xem hàng) xếp hàng sau vài cái khóa là đốt tiền vô ích, đúng cảnh Ticket #58.' }
        ]
      },
      source: 'Silberschatz et al., Database System Concepts (7th ed., 2019), Ch 18.1 + 18.6-18.8 — tổng kết Module 8 nửa đầu',
      cta: { label: 'Về Trading Floor — hẹn bài 19: Write Skew & FOR UPDATE', href: '/courses/db_design_nc' }
    }
  ]
};
