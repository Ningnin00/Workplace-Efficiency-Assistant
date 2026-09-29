const HISTORY_KEY = 'workplace-efficiency-history-v1';
const MAX_HISTORY = 8;

const weeklyTemplates = {
  dev: '本周完成：\n1. 开发了登录/权限相关接口\n2. 和前端完成接口联调\n3. 修复 token 过期导致的请求失败问题\n4. 参加需求评审，确认下周支付模块范围\n\n遇到问题：联调时环境配置不一致，已和同事对齐。\n下周计划：继续完成支付模块开发，并补充测试用例。',
  project: '本周完成：\n1. 梳理项目需求和里程碑计划\n2. 推进接口联调和问题闭环\n3. 同步项目风险和依赖事项\n\n遇到问题：部分需求边界不清晰，已拉通产品和研发确认。\n下周计划：完成核心功能验收，推进上线准备。',
  study: '本周学习：\n1. 学习部门业务流程和系统架构\n2. 完成 AI 工具使用教程\n3. 输出学习笔记并和导师交流\n\n收获：对业务链路和工具使用有了初步理解。\n下周计划：结合实际任务进行实践。'
};

function init() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  updateCounter();
  renderHistory();
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`.tab[data-tab="${name}"]`).classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (loading) {
    btn.dataset.orig = btn.innerHTML;
    btn.innerHTML = '<span class="loading"><span class="spinner"></span>生成中...</span>';
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.orig || btn.innerHTML;
    btn.disabled = false;
  }
}

function showOutput(elId, html) {
  const el = document.getElementById(elId);
  el.innerHTML = html;
  el.classList.add('show');
}

function showError(elId, msg) {
  showOutput(elId, '<div style="color:#dc2626;font-weight:800">' + escapeHtml('请求失败：' + msg) + '</div>');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function updateCounter() {
  const input = document.getElementById('weekly-input');
  const counter = document.getElementById('weekly-counter');
  if (input && counter) counter.textContent = `${input.value.trim().length} 字`;
}

function applyWeeklyTemplate(type) {
  document.getElementById('weekly-input').value = weeklyTemplates[type] || '';
  updateCounter();
}

function clearWeeklyInput() {
  document.getElementById('weekly-input').value = '';
  updateCounter();
}

function applyPptTemplate(topic) {
  document.getElementById('ppt-topic').value = topic;
}

async function generateWeekly() {
  const content = document.getElementById('weekly-input').value.trim();
  if (!content) {
    showError('weekly-output', '请先输入你的工作记录');
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
      return;
    }
    showOutput('weekly-output', renderMarkdown(data.result));
    addHistory({ type: 'weekly', title: '周报：' + content.slice(0, 22), input: content, result: data.result });
  } catch (e) {
    showError('weekly-output', '网络错误：' + e.message);
  } finally {
    setLoading('weekly-btn', false);
  }
}

let pptOutline = null;

async function generatePpt() {
  const topic = document.getElementById('ppt-topic').value.trim();
  if (!topic) {
    showError('ppt-output', '请先输入 PPT 主题');
    return;
  }
  const pages = document.getElementById('ppt-pages').value;
  setLoading('ppt-btn', true);
  document.getElementById('ppt-download').disabled = true;
  try {
    const res = await fetch('/api/ppt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, pages: parseInt(pages, 10) })
    });
    const data = await res.json();
    if (!data.ok) {
      showError('ppt-output', data.error || '生成失败，请重试');
      return;
    }
    pptOutline = data.result;
    document.getElementById('ppt-download').disabled = false;
    showOutput('ppt-output', renderOutline(pptOutline));
    addHistory({ type: 'ppt', title: 'PPT：' + (pptOutline.title || topic), input: topic, outline: pptOutline });
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

function renderMarkdown(md) {
  let html = '';
  const lines = (md || '').split('\n');
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
  let html = '<h2>' + escapeHtml(outline.title || 'PPT 大纲') + '</h2>';
  if (outline.subtitle) html += '<p style="color:#6b7280">' + escapeHtml(outline.subtitle) + '</p>';
  html += '<hr style="border:none;border-top:1px solid #eef0f4;margin:10px 0 14px">';
  (outline.slides || []).forEach((s, i) => {
    const tag = { cover: '封面', agenda: '目录', end: '结尾' }[s.type] || `第 ${i + 1} 页`;
    html += '<div style="margin-bottom:14px">';
    html += '<span style="display:inline-block;background:#eef2ff;color:#2f54eb;border-radius:999px;padding:3px 9px;font-size:12px;margin-right:7px">' + tag + '</span>';
    html += '<strong>' + escapeHtml(s.title || '') + '</strong>';
    if (s.subtitle) html += '<div style="color:#6b7280;font-size:13px;margin-top:4px">' + escapeHtml(s.subtitle) + '</div>';
    if (s.points) {
      html += '<ul style="margin-top:6px">';
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
    const btn = id === 'weekly-output' ? document.getElementById('weekly-copy') : null;
    if (btn) {
      const old = btn.textContent;
      btn.textContent = '已复制';
      setTimeout(() => { btn.textContent = old; }, 1500);
    }
  });
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch (_) {
    return [];
  }
}

function saveHistory(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
  renderHistory();
}

function addHistory(item) {
  const list = getHistory();
  list.unshift({ ...item, id: Date.now(), createdAt: new Date().toISOString() });
  saveHistory(list);
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

function renderHistory() {
  const el = document.getElementById('history-list');
  if (!el) return;
  const list = getHistory();
  if (!list.length) {
    el.innerHTML = '<div class="history-empty">暂无历史记录，生成一次后会自动保存。</div>';
    return;
  }
  el.innerHTML = list.map(item => {
    const type = item.type === 'ppt' ? 'PPT' : '周报';
    const time = new Date(item.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    return `<button class="history-item" onclick="restoreHistory(${item.id})">
      <span class="history-type">${type}</span>
      <div class="history-title">${escapeHtml(item.title)}</div>
      <div class="history-time">${time}</div>
    </button>`;
  }).join('');
}

function restoreHistory(id) {
  const item = getHistory().find(x => x.id === id);
  if (!item) return;
  if (item.type === 'weekly') {
    switchTab('weekly');
    document.getElementById('weekly-input').value = item.input || '';
    updateCounter();
    showOutput('weekly-output', renderMarkdown(item.result || ''));
  } else {
    switchTab('ppt');
    document.getElementById('ppt-topic').value = item.input || '';
    pptOutline = item.outline;
    document.getElementById('ppt-download').disabled = !pptOutline;
    showOutput('ppt-output', renderOutline(pptOutline || {}));
  }
}

document.addEventListener('DOMContentLoaded', init);
