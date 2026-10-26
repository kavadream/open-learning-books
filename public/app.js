import { createPracticeClient } from './practice.js';
import { createLocalStore } from './local-store.js';

const main = document.querySelector('#main');
const state = { books: [], view: 'library', unitIndex: 0, previewDraft: false, capabilities: {} };
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
// Accessing window.localStorage itself can throw in restricted browser contexts.
let storage;
try { storage = window.localStorage; } catch { storage = null; }
const local = createLocalStore(storage);
const saved = local.value;
const clients = new Map();
function activePractice() {
  const unit = units()[state.unitIndex];
  if (!clients.has(unit.id)) {
    const client = createPracticeClient({ onChange: () => {
      if (state.view === 'learn' && units()[state.unitIndex]?.id === unit.id) {
        render();
        if (!client.state.busy && document.activeElement === document.body) {
          (document.querySelector('#practice-input') || document.querySelector('[data-action="practice-start"]'))?.focus({ preventScroll: true });
        }
      }
    } });
    client.selection = { engine: 'demo', mode: unit.practice ? 'role-play' : 'explanation' };
    clients.set(unit.id, client);
  }
  return clients.get(unit.id);
}
function stopCurrent() { if (state.books.length) clients.get(units()[state.unitIndex]?.id)?.cancel(false); }

function notify(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3500);
}
function persist() {
  const ok = local.save();
  document.querySelector('#save-status').textContent = local.warning;
  return ok;
}

function units() { return state.books[0]?.chapters.flatMap(chapter => chapter.units) || []; }
function progress() { const list = units(); return list.filter(unit => saved.completed.includes(unit.id)).length; }
function go(view) { location.hash = view; }

function library() {
  const book = state.books[0];
  return `<section class="hero"><div><p class="eyebrow">A NEW WAY TO LEARN</p><h1>读懂一个道理，<br>再把它<span>练成自己的能力。</span></h1><p class="hero-copy">在书中阅读、提问、尝试表达。让每一次理解，走进可以实际运用的场景。</p><div class="hero-actions"><button class="primary" data-action="start">开始体验 <span aria-hidden="true">↗</span></button><button class="text-button" data-view="create">把你的经验写成一本书 →</button></div><div class="hero-note"><span class="status-dot"></span>首部示范作品已加入 · 当前使用教学脚本演练</div></div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="floating-note note-one">读一段，想一想</div><div class="large-book"><span>OPEN LEARNING / 001</span><div>理解人性<br><i>练习合作</i></div><p>READ · THINK · PRACTICE</p></div><div class="floating-note note-two">换个情境，再试一次 ↗</div></div></section>
  <section class="library-section"><div class="section-heading"><div><p class="eyebrow">YOUR NEXT CHAPTER</p><h2>从一本有用的书开始</h2></div><span class="muted">1 部示范作品 · 2 个规划方向</span></div><div class="book-grid"><article class="book-card active-book"><div class="small-cover"><span>01 / HUMAN NATURE</span><h3>人性的弱点<br>升级版</h3><div class="cover-line"></div><p>理解 · 判断 · 合作</p></div><div class="card-copy"><span class="pill">可体验</span><h3>${escape(book.title)}</h3><p>${escape(book.description)}</p><div class="card-meta"><span>1 个示范章节 · 3 个小节</span><span>${progress()}/3 已读</span></div><button class="primary full" data-action="start">${progress() ? '继续学习' : '打开这本书'} →</button></div></article>
  ${[['02 / EXPRESSION', '说话的技巧', '从想得清楚，到说得明白。'], ['03 / RELATIONSHIPS', '如何与伴侣相处', '理解分歧，也表达自己的需要。']].map(([label, title, copy], index) => `<article class="book-card planned-book"><div class="planned-cover tone-${index}"><span>${label}</span><h3>${title}</h3><span class="planned-mark" aria-hidden="true">＋</span></div><div class="card-copy"><span class="pill neutral">规划方向</span><h3>${title}</h3><p>${copy}</p><p class="muted small">尚未发布，等待创作者共同建设。</p><button class="secondary full" data-view="create">了解创作空间 ↗</button></div></article>`).join('')}</div></section>
  <section class="invitation"><div><p class="eyebrow">CREATE SOMETHING THAT TEACHES</p><h2>让你的经验，成为别人可以练习的能力。</h2><p>从一个问题、一段内容和一个练习开始。</p></div><button class="secondary" data-view="create">创建作品草稿 ↗</button></section>`;
}

function conversation(chat) {
  const label = chat.resultMode === 'real-ai' ? '真实 AI' : '脚本演示';
  return `<div class="conversation" role="log" aria-label="本轮练习对话" aria-live="polite" tabindex="0">${chat.intro ? `<div class="bubble assistant"><span>${label}</span><p>${escape(chat.intro)}</p></div>` : ''}${chat.messages.map(message => `<div class="bubble ${message.role}"><span>${message.role === 'user' ? '你' : label}</span><p>${escape(message.content)}</p></div>`).join('')}</div>${chat.feedback.length ? `<div class="feedback"><h4>回看这一轮</h4><ul>${chat.feedback.map(text => `<li>${escape(text)}</li>`).join('')}</ul></div>` : ''}`;
}
function practicePanel(unit) {
  const client = activePractice();
  const chat = client.state;
  const modes = unit.practice ? ['explanation', 'role-play', 'feedback'] : ['explanation', 'feedback'];
  const labels = { explanation: '解释', 'role-play': '角色演练', feedback: '依据反馈' };
  return `<section class="exercise" aria-labelledby="practice-title"><div class="exercise-heading"><div><span class="eyebrow">阅读之后，试着运用</span><h3 id="practice-title">${unit.practice ? '你是经理，角色是仓库主管。' : '解释与回看自己的表达'}</h3></div><span class="pill neutral">${chat.resultMode === 'real-ai' ? '真实 AI 回复' : '脚本演示 / AI 未验证'}</span></div>
  <div class="practice-options"><div><label for="practice-engine">练习服务</label><select id="practice-engine" ${chat.busy ? 'disabled' : ''}><option value="demo" ${client.selection.engine === 'demo' ? 'selected' : ''}>脚本演示 · 无模型调用</option><option value="ai" ${client.selection.engine === 'ai' ? 'selected' : ''}>真实 AI · ${state.capabilities.externalAiEnabled ? '已配置，待实测' : '服务未配置'}</option></select></div><div><label for="teaching-mode">教学模式</label><select id="teaching-mode" ${chat.busy ? 'disabled' : ''}>${modes.map(mode => `<option value="${mode}" ${client.selection.mode === mode ? 'selected' : ''}>${labels[mode]}</option>`).join('')}</select></div></div>
  <p class="muted small" id="practice-privacy">${client.selection.engine === 'ai' ? '开始后会将当前小节、教学配置及本轮回应发送给维护者配置的模型服务。请勿输入私人资料。真实调用可能产生服务端费用，尚未计费给读者。' : '脚本使用固定教材与情境，不判断你的回答，不产生模型费用。'} 本轮记录仅临时留在本机服务内存，10 分钟过期；刷新后不恢复。每次最多 2000 字、6 次回应，模型请求最多等待 15 秒。</p>
  <div class="form-actions"><button class="secondary" data-action="practice-start" ${chat.busy ? 'disabled' : ''}>${chat.intro ? '新建一轮练习' : '开始练习 →'}</button>${chat.sessionId || chat.busy ? '<button class="secondary" data-action="practice-cancel">取消这一轮</button>' : ''}</div>
  <div id="chat-content">${conversation(chat)}</div><p role="status" aria-live="polite">${chat.busy ? '正在请求，请稍候；可以取消。' : ''}</p>
  ${chat.error ? `<div class="practice-error" role="alert"><p>${escape(chat.error)}</p>${chat.retryable ? '<button class="secondary" data-action="practice-retry">重试这次回应</button>' : ''}</div>` : ''}
  ${chat.sessionId && chat.phase === 'practice' ? `<form id="practice-form"><label for="practice-input">你的回应（最多 2000 字）</label><textarea id="practice-input" rows="3" maxlength="2000" aria-describedby="practice-privacy" ${chat.busy ? 'readonly' : ''} placeholder="指出事实、解释和你想了解的信息…">${escape(chat.input)}</textarea><div class="form-actions"><span class="muted small">允许有依据的不同意见。</span><button class="primary" type="submit" ${chat.busy ? 'disabled' : ''}>${chat.uncertain ? '核对上次回应' : '发送回应 ↑'}</button></div></form>` : chat.input ? `<label for="practice-input">保留的回应</label><textarea id="practice-input" rows="3" maxlength="2000">${escape(chat.input)}</textarea>` : ''}
  ${chat.phase !== 'practice' ? '<p class="muted">这一轮已结束，请换一个情境独立试一次，或新建练习。</p>' : ''}</section>`;
}

function reader() {
  const book = state.books[0];
  const list = units();
  const unit = list[state.unitIndex];
  const done = saved.completed.includes(unit.id);
  return `<div class="reading-top"><button class="text-button" data-view="library">← 返回书架</button><span class="muted">${escape(book.title)}</span><span class="pill">${progress()}/${list.length} 小节已读</span></div><div class="reader-layout"><aside class="chapter-nav"><p class="eyebrow">CONTENTS</p><h2>为什么有道理的话<br>别人却听不进去</h2><div class="progress-track"><div class="progress-${progress()}"></div></div><p class="muted small">阅读进度记录在此设备</p><div class="unit-list">${list.map((item, index) => `<button class="unit-item ${index === state.unitIndex ? 'selected' : ''}" data-unit="${index}" ${index === state.unitIndex ? 'aria-current="step"' : ''}><span>${saved.completed.includes(item.id) ? '✓' : `0${index + 1}`}</span>${escape(item.title)}</button>`).join('')}</div><div class="learning-goal"><span class="eyebrow">本章练习目标</span><p>分清观察与推测，问清真实顾虑，说明可行的下一步。</p></div></aside><article class="reading-pane"><p class="eyebrow">CHAPTER 07 · SECTION 0${state.unitIndex + 1}</p><h1>${escape(unit.title)}</h1><div class="reading-text">${unit.reading.map(text => `<p>${escape(text)}</p>`).join('')}</div>
  ${unit.quiz ? `<section class="exercise"><span class="eyebrow">停一下，作个判断</span><h3>${escape(unit.quiz.question)}</h3><div class="quiz-options">${unit.quiz.options.map((option, index) => `<button class="quiz-option" data-choice="${index}"><span>${String.fromCharCode(65 + index)}</span>${escape(option)}</button>`).join('')}</div><p id="quiz-feedback" role="status"></p></section>` : ''}
  ${practicePanel(unit)}
  ${unit.reflection ? `<section class="exercise"><span class="eyebrow">把方法带走</span><h3>${escape(unit.reflection)}</h3><label for="reflection">写下你的思考</label><textarea id="reflection" rows="5" maxlength="5000" placeholder="你的问题，以及这个问题能帮助你了解什么…">${escape(saved.reflection)}</textarea><button class="secondary" data-action="save-reflection">保存思考</button><p class="muted small">只保存在此设备，不上传给创作者。</p></section>` : ''}
  <div class="reader-bottom"><button class="${done ? 'secondary' : 'primary'}" data-action="complete">${done ? '✓ 已读完这一节' : '记录为已读'}</button>${state.unitIndex < list.length - 1 ? '<button class="text-button" data-action="next">下一小节 →</button>' : '<button class="text-button" data-view="library">回到书架 →</button>'}</div></article></div>`;
}

function creator() {
  const draft = saved.draft;
  return `<section class="creator-header"><p class="eyebrow">CREATOR STUDIO</p><h1>从你真正理解的<br>一个问题开始。</h1><p>把内容、学习目标和练习一起设计。先保存一份草稿，逐步把它做成能够教会人的作品。</p><span class="pill neutral">本地草稿 · 尚未公开发布</span></section><div class="creator-layout"><form id="draft-form" class="draft-form"><label for="draft-title">作品名称</label><input id="draft-title" data-draft="title" maxlength="100" placeholder="例如：把话说清楚的练习" value="${escape(draft.title)}"><label for="draft-audience">你希望帮助谁</label><input id="draft-audience" data-draft="audience" maxlength="300" placeholder="描述读者的实际处境" value="${escape(draft.audience)}"><label for="draft-goal">读完以后，读者能做什么</label><textarea id="draft-goal" data-draft="goal" rows="3" maxlength="2000" placeholder="用一个具体、可观察的能力来描述">${escape(draft.goal)}</textarea><label for="draft-body">第一个小节</label><textarea id="draft-body" data-draft="body" rows="9" maxlength="12000" placeholder="讲一个具体问题，再说明你的理解和建议的练习…">${escape(draft.body)}</textarea><div class="form-actions"><button type="submit" class="primary">保存草稿</button><button type="button" class="secondary" data-action="export-draft">导出作品 JSON ↗</button></div><button type="button" class="text-button" data-action="preview-draft">预览我的草稿 →</button></form><aside class="creator-guide"><h2>一部可教可练的作品</h2><ol><li><b>一个值得解决的问题</b><p>从读者生活里会遇到的场景开始。</p></li><li><b>一个清楚的学习目标</b><p>说清读者将学会怎样判断或行动。</p></li><li><b>一次真实的尝试</b><p>让读者回答、提问、选择或练习表达。</p></li><li><b>能够指导改进的反馈</b><p>说明哪里有效，下一次可以怎样调整。</p></li></ol><p class="muted small">当前版本支持草稿保存与导出。在线账户、协作发布及教学 AI 配置将按路线逐步开发。</p></aside></div>${state.previewDraft ? `<section class="draft-preview"><p class="eyebrow">你的作品草稿</p><h2>${escape(draft.title || '尚未命名的作品')}</h2><p><b>适合：</b>${escape(draft.audience)}</p><p><b>学习目标：</b>${escape(draft.goal)}</p><div class="reading-text">${escape(draft.body).split('\n').filter(Boolean).map(text => `<p>${text}</p>`).join('')}</div></section>` : ''}`;
}

function render() {
  if (!state.books.length) return;
  const focused = document.activeElement;
  const id = focused?.id;
  const selection = typeof focused?.selectionStart === 'number' ? [focused.selectionStart, focused.selectionEnd] : null;
  const position = window.scrollY;
  document.querySelectorAll('[data-view]').forEach(button => button.removeAttribute('aria-current'));
  document.querySelector(`nav [data-view="${state.view}"]`)?.setAttribute('aria-current', 'page');
  main.innerHTML = state.view === 'learn' ? reader() : state.view === 'create' ? creator() : library();
  document.querySelector('#save-status').textContent = local.warning;
  const next = (id && document.getElementById(id)) || (focused?.dataset?.action && main.querySelector(`[data-action="${CSS.escape(focused.dataset.action)}"]`));
  if (next) { next.focus({ preventScroll: true }); if (selection && next.setSelectionRange) next.setSelectionRange(...selection); }
  window.scrollTo(0, position);
}

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.view) return go(button.dataset.view);
  if (button.dataset.unit !== undefined) {
    stopCurrent(); state.unitIndex = Number(button.dataset.unit); render(); main.focus(); return;
  }
  if (button.dataset.choice !== undefined) {
    const quiz = units()[state.unitIndex].quiz;
    const index = Number(button.dataset.choice);
    const feedback = document.querySelector('#quiz-feedback');
    feedback.textContent = `${index === quiz.correctIndex ? '判断正确。' : '再检查一下事实与推测的区别。'}${quiz.explanation}`;
    document.querySelectorAll('.quiz-option').forEach(item => item.classList.toggle('chosen', item === button));
    return;
  }
  switch (button.dataset.action) {
    case 'start': {
      const firstUnread = units().findIndex(unit => !saved.completed.includes(unit.id));
      stopCurrent(); state.unitIndex = firstUnread < 0 ? 0 : firstUnread; go('learn'); break;
    }
    case 'complete': { const id = units()[state.unitIndex].id; if (!saved.completed.includes(id)) saved.completed.push(id); persist(); render(); break; }
    case 'next': stopCurrent(); state.unitIndex = Math.min(state.unitIndex + 1, units().length - 1); render(); main.focus(); break;
    case 'practice-start': activePractice().start({ bookId: state.books[0].id, unitId: units()[state.unitIndex].id, ...activePractice().selection }); break;
    case 'practice-cancel': activePractice().cancel(); break;
    case 'practice-retry': activePractice().retry(); break;
    case 'save-reflection': saved.reflection = document.querySelector('#reflection').value; if (persist()) notify('思考已保存在此设备'); break;
    case 'preview-draft': {
      state.previewDraft = true; render();
      const preview = document.querySelector('.draft-preview');
      preview?.setAttribute('tabindex', '-1'); preview?.focus({ preventScroll: true });
      preview?.scrollIntoView({ behavior: 'smooth' }); break;
    }
    case 'export-draft': {
      const draft = { schemaVersion: 1, status: 'local-draft', language: 'zh-CN', title: saved.draft.title, audience: saved.draft.audience, learningGoals: [saved.draft.goal].filter(Boolean), chapters: [{ id: 'chapter-01', title: '第一章', units: [{ id: 'unit-01', title: '第一个小节', reading: saved.draft.body.split('\n').filter(Boolean) }] }] };
      const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = 'learning-book-draft.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); break;
    }
  }
});
document.addEventListener('input', event => {
  if (event.target.id === 'practice-input') activePractice().state.input = event.target.value;
  if (event.target.id === 'reflection') saved.reflection = event.target.value;
  const key = event.target.dataset.draft;
  if (key && Object.hasOwn(saved.draft, key)) { saved.draft[key] = event.target.value; persist(); }
});
document.addEventListener('change', event => {
  if (['practice-engine', 'teaching-mode'].includes(event.target.id)) {
    const client = activePractice();
    client.cancel(false);
    client.selection[event.target.id === 'practice-engine' ? 'engine' : 'mode'] = event.target.value;
    render();
  }
});
document.addEventListener('submit', event => {
  if (event.target.id === 'draft-form') { event.preventDefault(); if (persist()) notify('草稿已保存在此设备'); }
  if (event.target.id === 'practice-form') {
    event.preventDefault();
    activePractice().send();
  }
});
window.addEventListener('hashchange', () => {
  const view = location.hash.slice(1);
  if (!['library', 'learn', 'create'].includes(view)) return;
  stopCurrent(); state.view = view; render(); window.scrollTo(0, 0); main.focus();
});

try {
  const [response, status] = await Promise.all([fetch('/api/books'), fetch('/api/status').then(response => response.json()).catch(() => ({}))]);
  state.capabilities = status;
  if (!response.ok) throw new Error('书架暂时无法打开');
  state.books = (await response.json()).books;
  if (!state.books?.length) throw new Error('暂时没有可阅读的作品');
  state.view = ['learn', 'create'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'library';
  render();
} catch (err) {
  main.innerHTML = `<section class="error-panel"><h1>暂时无法打开书架</h1><p>${escape(err.message)}</p><p>请确认项目服务已启动，然后刷新页面。</p></section>`;
}
