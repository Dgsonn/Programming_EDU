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
      cta: { label: 'Về roadmap khóa Nâng cao', href: '/courses/db_design_nc' }
    }
  ]
};
