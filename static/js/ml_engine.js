/* ============================================================================
 * ml_engine.js — cầu nối shell DB Design ↔ ml_worker.js (Pyodide Web Worker).
 * ML SHELL 2026-07-18 (docs/ML_REWORK_PILOT_BAI1_2026-07-18.md).
 *
 * Engine "ngầm" của khóa ML: nạp Python thật (numpy/pandas/scikit-learn) trong
 * Web Worker, expose window.MLEngine cho lesson_db_design.js (runCodeML):
 *   MLEngine.ready          — true khi Pyodide + packages + ml_lab sẵn sàng
 *   MLEngine.run(code, cb)  — chạy thử, cb({stdout, stderr, error?})
 *   MLEngine.grade(code, graderFn, cb) — chấm 4 tầng, cb(grader dict)
 * Cập nhật pill #ml-runtime-pill trong header (template nhánh course_id == 'ml').
 * ============================================================================ */
(function () {
  'use strict';
  var MLCourseId = document.body && document.body.dataset.course;
  if (!MLCourseId || ['ml', 'ml_intermediate', 'ml_advanced'].indexOf(MLCourseId) === -1) return;

  /* ?v= bust cache script worker — B3 đổi fetchText(no-store) + ml_lab rename cột */
  var worker = new Worker('/static/js/ml_worker.js?v=2');
  var reqSeq = 0;
  var pending = {};   // reqId → callback

  var engine = {
    ready: false,
    run: function (code, cb) {
      var id = ++reqSeq;
      pending[id] = cb;
      worker.postMessage({ type: 'run', reqId: id, code: code });
    },
    grade: function (code, graderFn, cb) {
      var id = ++reqSeq;
      pending[id] = cb;
      worker.postMessage({ type: 'grade', reqId: id, code: code, lessonFn: graderFn });
    }
  };
  window.MLEngine = engine;

  worker.onmessage = function (e) {
    var msg = e.data || {};
    if (msg.type === 'progress') {
      var dot = document.getElementById('ml-runtime-dot');
      var label = document.getElementById('ml-runtime-label');
      if (label) label.textContent = msg.label || '';
      if (msg.stage === 'ready') {
        engine.ready = true;
        if (dot) dot.classList.add('ml-runtime-ready');
        if (label) label.textContent = 'Python sẵn sàng';
      }
    } else if (msg.type === 'run_result' || msg.type === 'grade_result') {
      var cb = pending[msg.reqId];
      delete pending[msg.reqId];
      if (cb) cb(msg.result || {});
    } else if (msg.type === 'fatal_error') {
      console.error('[ml_engine] fatal:', msg.error);
      var lbl = document.getElementById('ml-runtime-label');
      if (lbl) lbl.textContent = 'Lỗi runtime — thử tải lại trang.';
      var cb2 = pending[msg.reqId];
      delete pending[msg.reqId];
      if (cb2) cb2({ error: msg.error, stdout: '', overall_pass: false, grader_error: String(msg.error) });
    }
  };
})();
