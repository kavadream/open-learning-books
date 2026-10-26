const main = document.querySelector('#main');
const state = { books: [], view: 'library', unitIndex: 0, messages: [], intro: '', phase: 'practice', feedback: [], busy: false, previewDraft: false };
const storageKey = 'olb.prototype.v1';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
let saved = { completed: [], reflection: '', draft: { title: '', audience: '', goal: '', body: '' } };
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
  if (stored && typeof stored === 'object') saved = { completed: Array.isArray(stored.completed) ? stored.completed.filter(x => typeof x === 'string') : [], reflection: typeof stored.reflection === 'string' ? stored.reflection : '', draft: Object.fromEntries(['title', 'audience', 'goal', 'body'].map(key => [key, typeof stored.draft?.[key] === 'string' ? stored.draft[key] : ''])) };
} catch { /* An unavailable or corrupted local store does not prevent reading. */ }

function notify(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3500);
}
function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify(saved)); return true; }
  catch { notify('浏览器无法保存，请先导出草稿。'); return false; }
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

function conversation() {
  return `<div class="conversation" aria-live="polite">${state.intro ? `<div class="bubble assistant"><span>演示教练</span><p>${escape(state.intro)}</p></div>` : ''}${state.messages.map(message => `<div class="bubble ${message.role}"><span>${message.role === 'user' ? '你' : '演示教练'}</span><p>${escape(message.content)}</p></div>`).join('')}${state.busy ? '<p class="muted">正在继续演练…</p>' : ''}</div>${state.feedback.length ? `<div class="feedback"><h4>回看这一轮</h4><ul>${state.feedback.map(text => `<li>${escape(text)}</li>`).join('')}</ul><button class="secondary" data-action="practice-start">重新演练</button></div>` : ''}`;
}

function reader() {
  const book = state.books[0];
  const list = units();
  const unit = list[state.unitIndex];
  const done = saved.completed.includes(unit.id);
  return `<div class="reading-top"><button class="text-button" data-view="library">← 返回书架</button><span class="muted">${escape(book.title)}</span><span class="pill">${progress()}/${list.length} 小节已读</span></div><div class="reader-layout"><aside class="chapter-nav"><p class="eyebrow">CONTENTS</p><h2>为什么有道理的话<br>别人却听不进去</h2><div class="progress-track"><div class="progress-${progress()}"></div></div><p class="muted small">阅读进度记录在此设备</p><div class="unit-list">${list.map((item, index) => `<button class="unit-item ${index === state.unitIndex ? 'selected' : ''}" data-unit="${index}" ${index === state.unitIndex ? 'aria-current="step"' : ''}><span>${saved.completed.includes(item.id) ? '✓' : `0${index + 1}`}</span>${escape(item.title)}</button>`).join('')}</div><div class="learning-goal"><span class="eyebrow">本章练习目标</span><p>分清观察与推测，问清真实顾虑，说明可行的下一步。</p></div></aside><article class="reading-pane"><p class="eyebrow">CHAPTER 07 · SECTION 0${state.unitIndex + 1}</p><h1>${escape(unit.title)}</h1><div class="reading-text">${unit.reading.map(text => `<p>${escape(text)}</p>`).join('')}</div>
  ${unit.quiz ? `<section class="exercise"><span class="eyebrow">停一下，作个判断</span><h3>${escape(unit.quiz.question)}</h3><div class="quiz-options">${unit.quiz.options.map((option, index) => `<button class="quiz-option" data-choice="${index}"><span>${String.fromCharCode(65 + index)}</span>${escape(option)}</button>`).join('')}</div><p id="quiz-feedback" role="status"></p></section>` : ''}
  ${unit.practice ? `<section class="exercise"><div class="exercise-heading"><div><span class="eyebrow">试着把话说出来</span><h3>你是经理，我来扮演仓库主管。</h3></div><span class="pill neutral">教学脚本演示</span></div><p class="muted small">当前未连接生成式 AI。本轮用固定情境演示三轮交流与自我检查，不产生费用。</p><div id="chat-content">${conversation()}</div>${state.phase !== 'feedback' ? `<form id="practice-form"><label for="practice-input">你的回应</label><textarea id="practice-input" rows="3" maxlength="2000" placeholder="例如：你先带我看一遍，哪个环节最难完成？" ${state.busy ? 'disabled' : ''}></textarea><div class="form-actions"><span class="muted small">先了解，再判断。</span><button class="primary" type="submit" ${state.busy ? 'disabled' : ''}>发送回应 ↑</button></div></form>` : ''}${!state.intro ? '<button class="secondary" data-action="practice-start">进入演练 →</button>' : ''}</section>` : ''}
  ${unit.reflection ? `<section class="exercise"><span class="eyebrow">把方法带走</span><h3>${escape(unit.reflection)}</h3><label for="reflection">写下你的思考</label><textarea id="reflection" rows="5" maxlength="5000" placeholder="你的问题，以及这个问题能帮助你了解什么…">${escape(saved.reflection)}</textarea><button class="secondary" data-action="save-reflection">保存思考</button><p class="muted small">只保存在此设备，不上传给创作者。</p></section>` : ''}
  <div class="reader-bottom"><button class="${done ? 'secondary' : 'primary'}" data-action="complete">${done ? '✓ 已读完这一节' : '记录为已读'}</button>${state.unitIndex < list.length - 1 ? '<button class="text-button" data-action="next">下一小节 →</button>' : '<button class="text-button" data-view="library">回到书架 →</button>'}</div></article></div>`;
}

function creator() {
  const draft = saved.draft;
  return `<section class="creator-header"><p class="eyebrow">CREATOR STUDIO</p><h1>从你真正理解的<br>一个问题开始。</h1><p>把内容、学习目标和练习一起设计。先保存一份草稿，逐步把它做成能够教会人的作品。</p><span class="pill neutral">本地草稿 · 尚未公开发布</span></section><div class="creator-layout"><form id="draft-form" class="draft-form"><label for="draft-title">作品名称</label><input id="draft-title" data-draft="title" maxlength="100" placeholder="例如：把话说清楚的练习" value="${escape(draft.title)}"><label for="draft-audience">你希望帮助谁</label><input id="draft-audience" data-draft="audience" maxlength="300" placeholder="描述读者的实际处境" value="${escape(draft.audience)}"><label for="draft-goal">读完以后，读者能做什么</label><textarea id="draft-goal" data-draft="goal" rows="3" maxlength="2000" placeholder="用一个具体、可观察的能力来描述">${escape(draft.goal)}</textarea><label for="draft-body">第一个小节</label><textarea id="draft-body" data-draft="body" rows="9" maxlength="12000" placeholder="讲一个具体问题，再说明你的理解和建议的练习…">${escape(draft.body)}</textarea><div class="form-actions"><button type="submit" class="primary">保存草稿</button><button type="button" class="secondary" data-action="export-draft">导出作品 JSON ↗</button></div><button type="button" class="text-button" data-action="preview-draft">预览我的草稿 →</button></form><aside class="creator-guide"><h2>一部可教可练的作品</h2><ol><li><b>一个值得解决的问题</b><p>从读者生活里会遇到的场景开始。</p></li><li><b>一个清楚的学习目标</b><p>说清读者将学会怎样判断或行动。</p></li><li><b>一次真实的尝试</b><p>让读者回答、提问、选择或练习表达。</p></li><li><b>能够指导改进的反馈</b><p>说明哪里有效，下一次可以怎样调整。</p></li></ol><p class="muted small">当前版本支持草稿保存与导出。在线账户、协作发布及教学 AI 配置将按路线逐步开发。</p></aside></div>${state.previewDraft ? `<section class="draft-preview"><p class="eyebrow">你的作品草稿</p><h2>${escape(draft.title || '尚未命名的作品')}</h2><p><b>适合：</b>${escape(draft.audience)}</p><p><b>学习目标：</b>${escape(draft.goal)}</p><div class="reading-text">${escape(draft.body).split('\n').filter(Boolean).map(text => `<p>${text}</p>`).join('')}</div></section>` : ''}`;
}

function render() {
  if (!state.books.length) return;
  document.querySelectorAll('[data-view]').forEach(button => button.removeAttribute('aria-current'));
  document.querySelector(`nav [data-view="${state.view}"]`)?.setAttribute('aria-current', 'page');
  main.innerHTML = state.view === 'learn' ? reader() : state.view === 'create' ? creator() : library();
}

async function practice(start = false) {
  const unit = units()[state.unitIndex];
  if (!unit.practice || state.busy) return;
  if (start) { state.messages = []; state.intro = ''; state.phase = 'practice'; state.feedback = []; }
  state.busy = true;
  const position = window.scrollY;
  render();
  window.scrollTo(0, position);
  try {
    const response = await fetch('/api/practice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId: state.books[0].id, unitId: unit.id, messages: state.messages }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || '暂时无法继续演练');
    if (start) state.intro = result.reply;
    else state.messages.push({ role: 'assistant', content: result.reply });
    state.phase = result.phase;
    state.feedback = result.feedback || [];
  } catch (err) {
    if (!start && state.messages.at(-1)?.role === 'user') state.messages.pop();
    notify(err.message);
  } finally {
    state.busy = false;
    render();
    window.scrollTo(0, position);
    const chat = document.querySelector('.conversation');
    if (chat) chat.scrollTop = chat.scrollHeight;
  }
}

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.view) return go(button.dataset.view);
  if (button.dataset.unit !== undefined) {
    state.unitIndex = Number(button.dataset.unit); state.messages = []; state.intro = ''; state.phase = 'practice'; state.feedback = []; render(); return;
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
      state.unitIndex = firstUnread < 0 ? 0 : firstUnread; go('learn'); break;
    }
    case 'complete': { const id = units()[state.unitIndex].id; if (!saved.completed.includes(id)) saved.completed.push(id); persist(); render(); break; }
    case 'next': state.unitIndex = Math.min(state.unitIndex + 1, units().length - 1); state.intro = ''; state.messages = []; state.feedback = []; state.phase = 'practice'; render(); break;
    case 'practice-start': practice(true); break;
    case 'save-reflection': saved.reflection = document.querySelector('#reflection').value; if (persist()) notify('思考已保存在此设备'); break;
    case 'preview-draft': state.previewDraft = true; render(); document.querySelector('.draft-preview')?.scrollIntoView({ behavior: 'smooth' }); break;
    case 'export-draft': {
      const draft = { schemaVersion: 1, status: 'local-draft', language: 'zh-CN', title: saved.draft.title, audience: saved.draft.audience, learningGoals: [saved.draft.goal].filter(Boolean), chapters: [{ id: 'chapter-01', title: '第一章', units: [{ id: 'unit-01', title: '第一个小节', reading: saved.draft.body.split('\n').filter(Boolean) }] }] };
      const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = 'learning-book-draft.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); break;
    }
  }
});
document.addEventListener('input', event => {
  const key = event.target.dataset.draft;
  if (key && Object.hasOwn(saved.draft, key)) { saved.draft[key] = event.target.value; persist(); }
});
document.addEventListener('submit', event => {
  if (event.target.id === 'draft-form') { event.preventDefault(); if (persist()) notify('草稿已保存在此设备'); }
  if (event.target.id === 'practice-form') {
    event.preventDefault();
    if (state.busy) return;
    const value = document.querySelector('#practice-input').value.trim();
    if (!value) return notify('先写下你的回应');
    if (!state.intro) return notify('请先点击“进入演练”');
    state.messages.push({ role: 'user', content: value }); practice();
  }
});
window.addEventListener('hashchange', () => {
  const view = location.hash.slice(1);
  if (!['library', 'learn', 'create'].includes(view)) return;
  state.view = view; render(); window.scrollTo(0, 0);
});

try {
  const response = await fetch('/api/books');
  if (!response.ok) throw new Error('书架暂时无法打开');
  state.books = (await response.json()).books;
  if (!state.books?.length) throw new Error('暂时没有可阅读的作品');
  state.view = ['learn', 'create'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'library';
  render();
} catch (err) {
  main.innerHTML = `<section class="error-panel"><h1>暂时无法打开书架</h1><p>${escape(err.message)}</p><p>请确认项目服务已启动，然后刷新页面。</p></section>`;
}
