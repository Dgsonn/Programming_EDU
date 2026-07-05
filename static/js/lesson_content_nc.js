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
      cta: { label: 'Về roadmap khóa Nâng cao', href: '/courses/db_design_nc' }
    }
  ]
};
