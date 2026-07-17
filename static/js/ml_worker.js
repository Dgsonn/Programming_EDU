/* ml_worker.js — Web Worker chạy Pyodide (Python thật) cho khóa Machine Learning.
 * Không block UI thread. Nạp numpy/pandas/scikit-learn + module ml_lab/ml_grader
 * (fetch từ /static/py/, ghi vào FS ảo của Pyodide) rồi thực thi code học viên. */
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');

let pyodideReadyPromise = null;

function post(type, payload) {
  self.postMessage(Object.assign({ type }, payload || {}));
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Không tải được ' + url + ' (HTTP ' + res.status + ')');
  return res.text();
}

async function initPyodide() {
  post('progress', { stage: 'runtime', label: 'Đang tải Python runtime (Pyodide)…' });
  const pyodide = await loadPyodide();

  post('progress', { stage: 'packages', label: 'Đang tải numpy, pandas, scikit-learn…' });
  await pyodide.loadPackage(['numpy', 'pandas', 'scikit-learn']);

  post('progress', { stage: 'ml_lab', label: 'Đang nạp thư viện ml_lab…' });
  const [mlLabSrc, mlGraderSrc] = await Promise.all([
    fetchText('/static/py/ml_lab.py'),
    fetchText('/static/py/ml_grader.py'),
  ]);
  pyodide.FS.writeFile('ml_lab.py', mlLabSrc);
  pyodide.FS.writeFile('ml_grader.py', mlGraderSrc);
  // Import 1 lần để cache module — các lần chạy sau (Run/Submit) không phải parse lại.
  await pyodide.runPythonAsync('import ml_lab, ml_grader');

  post('progress', { stage: 'ready', label: 'Sẵn sàng.' });
  return pyodide;
}

function getPyodide() {
  if (!pyodideReadyPromise) pyodideReadyPromise = initPyodide();
  return pyodideReadyPromise;
}

/* Chạy code học viên bình thường (Step 3/4 "Run") — chỉ lấy stdout, không chấm. */
async function runCode(pyodide, code) {
  let stdout = [];
  let stderr = [];
  pyodide.setStdout({ batched: (s) => stdout.push(s) });
  pyodide.setStderr({ batched: (s) => stderr.push(s) });
  try {
    await pyodide.runPythonAsync(code);
    return { ok: true, stdout: stdout.join('\n'), stderr: stderr.join('\n') };
  } catch (err) {
    return { ok: false, stdout: stdout.join('\n'), stderr: stderr.join('\n'), error: String(err) };
  }
}

/* Chấm 4 tầng qua ml_grader.grade_lessonN(code) — chạy THẬT trong Pyodide. */
async function gradeCode(pyodide, lessonFn, code) {
  pyodide.globals.set('__user_code__', code);
  try {
    const resultPy = await pyodide.runPythonAsync(
      'import ml_grader, json\n' +
      'json.dumps(ml_grader.' + lessonFn + '(__user_code__))'
    );
    return JSON.parse(resultPy);
  } catch (err) {
    return {
      output_ok: false, code_ok: false, behavior_ok: false, risk_ok: false,
      overall_pass: false, stdout: '', code_msg: '', output_msg: '', behavior_msg: '', risk_msg: '',
      grader_error: 'Grader nội bộ lỗi: ' + String(err),
    };
  }
}

self.onmessage = async (e) => {
  const msg = e.data || {};
  const reqId = msg.reqId;
  try {
    const pyodide = await getPyodide();
    if (msg.type === 'run') {
      const res = await runCode(pyodide, msg.code);
      post('run_result', { reqId, result: res });
    } else if (msg.type === 'grade') {
      const res = await gradeCode(pyodide, msg.lessonFn || 'grade_lesson1', msg.code);
      post('grade_result', { reqId, result: res });
    } else if (msg.type === 'init') {
      post('init_done', { reqId });
    }
  } catch (err) {
    post('fatal_error', { reqId, error: String(err) });
  }
};

// Bắt đầu nạp Pyodide ngay khi worker được tạo (không chờ message đầu tiên) —
// để lúc học viên tới Step 4 thì runtime đã sẵn sàng hoặc gần xong.
getPyodide().catch((err) => post('fatal_error', { error: 'Init fail: ' + String(err) }));
