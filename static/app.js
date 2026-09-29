// ===== Tab 切换 =====
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});

// ===== 工具函数 =====
function setLoading(btnId, loading, text) {
  const btn = document.getElementById(btnId);
  if (loading) {
    btn.dataset.orig = btn.innerHTML;
    btn.innerHTML = '<span class="loading"><span class="spinner"></span> 生成中...</span>';
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.orig || text;
    btn.disabled = false;
  }
}

function showOutput(elId, html) {
  const el = document.getElementById(elId);
  el.innerHTML = html;
  el.classList.add('show');
}

function showError(elId, msg) {
  showOutput(elId, '<div style="color:#dc2626;font-weight:600">⚠️ ' + msg + '</div>');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== 周报 =====
async function generateWeekly() {
  const content = document.getElementById('weekly-input').value.trim();
  if (!content) {
    showError('weekly-output', '请先输入你的工作记录～');
    return;
  }
  setLoading('weekly-btn', true);
  try {
    const res = await fetch('/api/weekly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    const data = await res.json();
    if (!data.ok) {
      showError('weekly-output', data.error || '生成失败，请重试');
    } else {
      // 简单 Markdown 渲染
      showOutput('weekly-output', renderMarkdown(data.result));
    }
  } catch (e) {
    showError('weekly-output', '网络错误：' + e.message);
  } finally {
    setLoading('weekly-btn', false);
  }
}

// ===== PPT =====
let pptOutline = null;

async function generatePpt() {
  const topic = document.getElementById('ppt-topic').value.trim();
  if (!topic) {
    showError('ppt-output', '请先输入 PPT 主题～');
    return;
  }
  const pages = document.getElementById('ppt-pages').value;
  setLoading('ppt-btn', true);
  document.getElementById('ppt-download').disabled = true;
  try {
    const res = await fetch('/api/ppt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, pages: parseInt(pages) })
    });
    const data = await res.json();
    if (!data.ok) {
      showError('ppt-output', data.error || '生成失败，请重试');
    } else {
      pptOutline = data.result;
      document.getElementById('ppt-download').disabled = false;
      showOutput('ppt-output', renderOutline(pptOutline));
    }
  } catch (e) {
    showError('ppt-output', '网络错误：' + e.message);
  } finally {
    setLoading('ppt-btn', false);
  }
}

async function downloadPpt() {
  if (!pptOutline) return;
  const btn = document.getElementById('ppt-download');
  btn.disabled = true;
  try {
    const res = await fetch('/api/ppt/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outline: pptOutline })
    });
    if (!res.ok) {
      const data = await res.json();
      showError('ppt-output', data.error || '下载失败');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (pptOutline.title || 'PPT') + '.pptx';
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    showError('ppt-output', '下载失败：' + e.message);
  } finally {
    btn.disabled = false;
  }
}

// ===== 渲染 =====
function renderMarkdown(md) {
  // 极简 Markdown 渲染：标题 + 列表 + 换行
  let html = '';
  const lines = md.split('\n');
  for (let line of lines) {
    line = line.trim();
    if (!line) { html += '<br>'; continue; }
    if (line.startsWith('### ')) html += '<h3>' + escapeHtml(line.slice(4)) + '</h3>';
    else if (line.startsWith('## ')) html += '<h2>' + escapeHtml(line.slice(3)) + '</h2>';
    else if (line.startsWith('# ')) html += '<h2>' + escapeHtml(line.slice(2)) + '</h2>';
    else if (line.startsWith('- ')) html += '<li>' + escapeHtml(line.slice(2)) + '</li>';
    else if (/^\d+[.、]/.test(line)) html += '<li>' + escapeHtml(line) + '</li>';
    else html += '<div>' + escapeHtml(line) + '</div>';
  }
  return html;
}

function renderOutline(outline) {
  let html = '<h2>📋 ' + escapeHtml(outline.title || '') + '</h2>';
  if (outline.subtitle) html += '<p style="color:#6b7280">' + escapeHtml(outline.subtitle) + '</p>';
  html += '<hr style="border:none;border-top:1px solid #eef0f4;margin:10px 0">';
  (outline.slides || []).forEach((s, i) => {
    const type = s.type;
    const tag = { cover: '封面', agenda: '目录', end: '结尾' }[type] || '内容';
    html += '<div style="margin-bottom:12px">';
    html += '<span style="display:inline-block;background:#eef2ff;color:#2f54eb;border-radius:6px;padding:2px 8px;font-size:12px;margin-right:6px">' + tag + '</span>';
    html += '<strong>' + escapeHtml(s.title || '') + '</strong>';
    if (s.subtitle) html += '<div style="color:#6b7280;font-size:13px">' + escapeHtml(s.subtitle) + '</div>';
    if (s.points) {
      html += '<ul style="margin-top:4px">';
      s.points.forEach(p => { html += '<li>' + escapeHtml(p) + '</li>'; });
      html += '</ul>';
    }
    html += '</div>';
  });
  return html;
}

function copyResult(id) {
  const el = document.getElementById(id);
  const text = el.innerText;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('weekly-copy');
    btn.textContent = '✅ 已复制';
    setTimeout(() => { btn.textContent = '📋 复制结果'; }, 1500);
  });
}
