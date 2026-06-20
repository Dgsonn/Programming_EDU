/* ============================================================================
 * table_explorer.js — Interactive Table Explorer
 * Component: 3D-feel schema card + sample data table
 * - Renders schema columns as clickable 3D cards
 * - Click column → expand detail panel (type, distinct count, value-distribution bars)
 * - Hover → lift + cyan glow
 * - Sample data table on the right with linked PK highlight
 *
 * Usage:
 *   TableExplorer.mount('#visual-db-panel', { schema, data });
 *
 * Schema shape (matches LESSON_CONTENT):
 *   { table_name, columns: [{name, type, key, icon}] }
 * Data shape:
 *   [row, row, ...] where each row is an array indexed by column position
 * ============================================================================ */

(function (global) {
  'use strict';

  const ICON_BY_TYPE = {
    INT:      '🔢',
    BIGINT:   '🔢',
    SERIAL:   '🔢',
    VARCHAR:  '🔤',
    TEXT:     '📝',
    CHAR:     '🔤',
    DATE:     '📅',
    TIMESTAMP:'⏱️',
    BOOLEAN:  '☑️',
    BOOL:     '☑️',
    FLOAT:    '🔢',
    DECIMAL:  '💰'
  };

  function defaultIcon(col) {
    if (col.key === 'PK') return '🔑';
    if (col.key === 'FK') return '🔗';
    return ICON_BY_TYPE[(col.type || '').toUpperCase()] || '○';
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function valueDistribution(values, max) {
    // values: array of distinct labels (descending by count)
    // Returns [{label, count, pct, barWidth}]
    const total = values.reduce((s, v) => s + v.count, 0) || 1;
    return values.map(v => ({
      ...v,
      pct: Math.round((v.count / total) * 100),
      barWidth: Math.max(8, Math.round((v.count / max) * 100))
    }));
  }

  function buildDistribution(data, colIdx) {
    const counts = new Map();
    data.forEach(row => {
      const v = row[colIdx];
      if (v === null || v === undefined || v === '') return;
      const key = String(v);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const arr = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));
    const max = arr.length ? arr[0].count : 1;
    const distinct = arr.length;
    return { distribution: valueDistribution(arr, max), distinct, total: data.length };
  }

  function renderSchemaCard(schema) {
    const cols = schema.columns || [];
    return `
      <div class="te-schema-3d">
        <div class="te-schema-header">
          <div class="te-table-name">
            <i class="fa-solid fa-table"></i>
            <span>${esc(schema.table_name || 'table')}</span>
          </div>
          <div class="te-col-count">${cols.length} cột</div>
        </div>
        <div class="te-cols" role="list">
          ${cols.map((c, i) => {
            const isPK = c.key === 'PK';
            return `
              <button type="button" class="te-col ${isPK ? 'te-col-pk' : ''}" role="listitem"
                      data-col-index="${i}" data-col-name="${esc(c.name)}" aria-expanded="false">
                <div class="te-col-face">
                  <span class="te-col-icon">${c.icon || defaultIcon(c)}</span>
                  <span class="te-col-name">${esc(c.name)}</span>
                  <span class="te-col-type">${esc(c.type)}</span>
                  ${isPK ? '<span class="te-pk-badge"><i class="fa-solid fa-key"></i> PK</span>' : ''}
                </div>
                <div class="te-col-shine"></div>
              </button>
            `;
          }).join('')}
        </div>
        <div class="te-expand-panel" id="te-expand-panel" hidden>
          <div class="te-expand-empty">
            <i class="fa-solid fa-hand-pointer"></i>
            <span>Chạm vào một cột để xem chi tiết</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderDetailPanel(col, stats) {
    const isPK = col.key === 'PK';
    const { distribution, distinct, total } = stats;
    const top = distribution.slice(0, 6);
    const isNumeric = /INT|FLOAT|DECIMAL|NUMERIC|BIGINT|SERIAL/i.test(col.type || '');

    return `
      <div class="te-detail">
        <div class="te-detail-head">
          <div class="te-detail-title">
            <span class="te-detail-icon">${col.icon || defaultIcon(col)}</span>
            <code class="te-detail-name">${esc(col.name)}</code>
            ${isPK ? '<span class="te-pk-badge lg"><i class="fa-solid fa-key"></i> Primary Key</span>' : ''}
          </div>
          <button type="button" class="te-detail-close" aria-label="Đóng">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="te-detail-stats">
          <div class="te-stat">
            <div class="te-stat-label">Kiểu</div>
            <div class="te-stat-value te-stat-mono">${esc(col.type)}</div>
          </div>
          <div class="te-stat">
            <div class="te-stat-label">Distinct</div>
            <div class="te-stat-value">${distinct}<span class="te-stat-sub"> / ${total}</span></div>
          </div>
          <div class="te-stat">
            <div class="te-stat-label">Unique?</div>
            <div class="te-stat-value">${isPK || distinct === total ? '<i class="fa-solid fa-check te-stat-ok"></i>' : '<i class="fa-solid fa-xmark te-stat-no"></i>'}</div>
          </div>
        </div>
        ${top.length ? `
          <div class="te-distribution">
            <div class="te-dist-label"><i class="fa-solid fa-chart-bar"></i> Phân bố giá trị (top ${top.length})</div>
            <div class="te-bars">
              ${top.map(d => `
                <div class="te-bar-row" title="${esc(d.label)} — ${d.count} (${d.pct}%)">
                  <span class="te-bar-label">${esc(truncate(d.label, 14))}</span>
                  <span class="te-bar-track">
                    <span class="te-bar-fill ${isPK ? 'te-bar-pk' : ''}" style="width:${d.barWidth}%"></span>
                  </span>
                  <span class="te-bar-pct">${d.pct}%</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="te-distribution te-dist-empty">Không có dữ liệu mẫu cho cột này.</div>
        `}
        ${isPK ? `
          <div class="te-detail-note te-note-pk">
            <i class="fa-solid fa-key"></i>
            <span>Primary Key đảm bảo mỗi dòng có giá trị <strong>duy nhất</strong>, không NULL — dùng trong <code>WHERE</code> để truy vấn chính xác 1 record.</span>
          </div>
        ` : ''}
        ${!isPK && isNumeric ? `
          <div class="te-detail-note">
            <i class="fa-solid fa-lightbulb"></i>
            <span>Cột số — có thể <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code> trong <code>SELECT</code>.</span>
          </div>
        ` : ''}
        ${!isPK && !isNumeric ? `
          <div class="te-detail-note">
            <i class="fa-solid fa-lightbulb"></i>
            <span>Cột chuỗi — dùng <code>LIKE '%pattern%'</code> trong <code>WHERE</code> để tìm kiếm gần đúng.</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  function truncate(s, n) {
    s = String(s);
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }

  function renderDataTable(schema, data) {
    const cols = schema.columns || [];
    return `
      <div class="te-data">
        <table class="te-data-table" id="te-data-table">
          <thead>
            <tr>
              ${cols.map(c => `
                <th class="${c.key === 'PK' ? 'te-th-pk' : ''}" data-col-name="${esc(c.name)}">
                  ${c.key === 'PK' ? '<i class="fa-solid fa-key te-th-key"></i> ' : ''}${esc(c.name)}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map((row, ri) => `
              <tr>
                ${row.map((cell, ci) => `
                  <td class="${cols[ci] && cols[ci].key === 'PK' ? 'te-td-pk' : ''}"
                      data-col-name="${esc(cols[ci] ? cols[ci].name : '')}">
                    ${esc(cell)}
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function TableExplorer() {}

  TableExplorer.mount = function (selector, payload) {
    const root = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!root) return;
    const { schema, data } = payload || {};
    if (!schema) return;

    // Layout: 3D schema card (left) | detail panel under it + data table (right)
    root.classList.add('te-root');
    root.innerHTML = `
      <div class="te-grid">
        <div class="te-pane te-pane-schema">
          <div class="te-panel-head">
            <span class="te-panel-title"><i class="fa-solid fa-cube"></i> Schema Explorer</span>
            <span class="te-panel-sub">Click cột để xem chi tiết</span>
          </div>
          ${renderSchemaCard(schema)}
        </div>
        <div class="te-pane te-pane-data">
          <div class="te-panel-head">
            <span class="te-panel-title"><i class="fa-solid fa-database"></i> Sample Data</span>
            <span class="te-panel-sub">${(data || []).length} rows</span>
          </div>
          ${renderDataTable(schema, data || [])}
        </div>
      </div>
    `;

    // Bind column clicks
    const cols = root.querySelectorAll('.te-col');
    const expandPanel = root.querySelector('#te-expand-panel');
    let activeIdx = -1;

    cols.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.colIndex, 10);
        if (activeIdx === idx) {
          // collapse
          expandPanel.hidden = true;
          expandPanel.innerHTML = '';
          btn.classList.remove('te-col-active');
          btn.setAttribute('aria-expanded', 'false');
          activeIdx = -1;
          return;
        }
        cols.forEach(c => { c.classList.remove('te-col-active'); c.setAttribute('aria-expanded', 'false'); });
        btn.classList.add('te-col-active');
        btn.setAttribute('aria-expanded', 'true');
        const col = schema.columns[idx];
        const stats = buildDistribution(data || [], idx);
        expandPanel.hidden = false;
        expandPanel.innerHTML = renderDetailPanel(col, stats);
        const close = expandPanel.querySelector('.te-detail-close');
        if (close) close.addEventListener('click', () => {
          expandPanel.hidden = true;
          expandPanel.innerHTML = '';
          btn.classList.remove('te-col-active');
          btn.setAttribute('aria-expanded', 'false');
          activeIdx = -1;
        });
        activeIdx = idx;

        // Highlight matching column in data table
        highlightDataColumn(root, col.name);
      });
    });

    // Data table column header click → open detail
    const ths = root.querySelectorAll('.te-data-table th');
    ths.forEach((th, i) => {
      th.addEventListener('click', () => {
        const colBtn = root.querySelectorAll('.te-col')[i];
        if (colBtn) colBtn.click();
      });
      th.style.cursor = 'pointer';
    });
  };

  function highlightDataColumn(root, colName) {
    root.querySelectorAll('.te-data-table td, .te-data-table th').forEach(cell => {
      if (cell.dataset.colName === colName) {
        cell.classList.add('te-cell-highlight');
      } else {
        cell.classList.remove('te-cell-highlight');
      }
    });
  }

  global.TableExplorer = TableExplorer;
})(window);
