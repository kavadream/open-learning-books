import { createPracticeClient } from './practice.js';
import { createLocalStore } from './local-store.js';
import { createReadingStore, bookKey, allUnits, chapterFor, restoredPosition } from './reader-model.js';
import { localTeachingTransport } from './local-teaching.js';

const main = document.querySelector('#main');
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
let storage;
try { storage = window.localStorage; } catch { storage = null; }
const local = createLocalStore(storage);
const saved = local.value; // Existing creator drafts and prototype records are never removed.
const reading = createReadingStore(storage);
const state = { books: [], publicBooks: [], schemas: null, selected: null, chapterId: '', unitIndex: 0, view: 'library', toolsOpen: false, previewDraft: false, capabilities: {}, importOpen: false, importText: '', importErrors: [], importBusy: false };
const clients = new Map();
const activeBook = () => state.books.find(book => bookKey(book) === state.selected) || state.books[0];
const units = () => allUnits(activeBook());
const currentChapter = () => activeBook()?.chapters.find(chapter => chapter.id === state.chapterId) || activeBook()?.chapters[0];
const currentUnit = () => units()[state.unitIndex] || currentChapter()?.units[0];
const progress = (book = activeBook()) => allUnits(book).filter(unit => reading.record(book).completed.includes(unit.id)).length;
const practiceKey = () => `${bookKey(activeBook())}/${currentChapter().id}/${currentUnit().id}`;
function warnings() { document.querySelector('#save-status').textContent = [local.warning, reading.warning].filter(Boolean).join(' '); }
function notify(message) {
  const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 4500);
}
function persist() { const result = local.save(); warnings(); return result; }
function activePractice() {
  const book = activeBook(), unit = currentUnit(), key = practiceKey();
  if (!clients.has(key)) {
    const client = createPracticeClient({ ...(book.source === 'browser-local' ? { fetchImpl: localTeachingTransport(book) } : {}), onChange: () => {
      if (state.view === 'learn' && state.toolsOpen && practiceKey() === key) {
        render();
        if (!client.state.busy && document.activeElement === document.body) (document.querySelector('#practice-input') || document.querySelector('[data-action="practice-start"]'))?.focus({ preventScroll: true });
      }
    } });
    client.selection = { engine: 'demo', mode: unit.modes.includes('role-play') ? 'role-play' : unit.modes[0] };
    clients.set(key, client);
  }
  return clients.get(key);
}
function stopCurrent() { if (activeBook() && currentUnit()) clients.get(practiceKey())?.cancel(false); }
function place(book, position) {
  state.selected = bookKey(book); state.chapterId = position.chapterId;
  state.unitIndex = Math.max(0, allUnits(book).findIndex(unit => unit.id === position.unitId));
}
function show(view) {
  if (state.view !== view) stopCurrent();
  state.view = view; if (location.hash !== `#${view}`) location.hash = view;
  render(); main.focus({ preventScroll: true }); window.scrollTo(0, 0);
}
function openBook(key, beginning = false) {
  const book = state.books.find(book => bookKey(book) === key); if (!book) return;
  stopCurrent(); state.toolsOpen = false;
  const position = restoredPosition(book, beginning ? null : reading.record(book));
  place(book, position); reading.setPosition(book, position.chapterId, position.unitId); show('learn');
  if (!beginning) requestAnimationFrame(() => document.querySelector(`[data-reading-unit="${CSS.escape(position.unitId)}"]`)?.scrollIntoView({ block: 'start' }));
}
function selectUnit(id, tools = false) {
  const book = activeBook(), chapter = chapterFor(book, id); if (!chapter) return;
  stopCurrent(); place(book, { chapterId: chapter.id, unitId: id }); state.toolsOpen = tools;
  reading.setPosition(book, chapter.id, id); render();
  requestAnimationFrame(() => {
    const target = tools ? document.querySelector('#learning-tools') : document.querySelector(`[data-reading-unit="${CSS.escape(id)}"]`);
    target?.focus({ preventScroll: true }); target?.scrollIntoView({ block: 'start' });
  });
}
function acceptance(book) {
  const layer = book.acceptance.layers;
  return `<div class="acceptance-status" aria-label="书籍验收状态"><span>格式：${layer.format === 'passed' ? '1.0 校验合格' : '旧原型兼容'}</span><span>内容审查：未进行</span><span>AI 教学：${layer.aiTeaching === 'not-applicable' ? '不适用（仅阅读）' : '未验证'}</span><span>发布：未发布</span></div><p class="muted small">${book.source === 'browser-local' ? '本机私有导入 · 正文和进度只在当前浏览器，不进入服务器或公开书库。' : '公开开发示范 · GitHub 有示例不等于内容或教学验收通过。'}</p>`;
}
function library() {
  return `<section class="hero"><div><p class="eyebrow">READ · THINK · PRACTICE</p><h1>先完整读下去，<br><span>再按需要提问和练习。</span></h1><p class="hero-copy">阅读与教学分开选择。保存此浏览器的阅读位置，下次从上次的小节继续。</p><button class="primary" data-open-book="${escape(state.selected || bookKey(state.books[0]))}">继续阅读 →</button></div><div class="library-note"><h2>当前为本地开发预览</h2><p>脚本演示可体验。真实 AI 尚未验证，账户、跨设备、语音及正式发布仍在规划中。</p><p>浏览器视口模拟不等于真实手机实测；尚未部署到公网。</p></div></section>
  <section class="library-section"><div class="section-heading"><div><p class="eyebrow">YOUR BOOKS</p><h2>选择一本书</h2></div><span class="muted">${state.books.length} 个版本 · 本机进度分别保存</span></div><div class="book-grid">${state.books.map(book => `<article class="book-card"><div class="small-cover"><span>${book.source === 'browser-local' ? 'BROWSER LOCAL / 私有' : 'PUBLIC DEVELOPMENT SAMPLE'}</span><h3>${escape(book.title)}</h3></div><div class="card-copy"><span class="pill neutral">${escape(book.version)} · ${book.chapters.length} 章 · ${progress(book)}/${allUnits(book).length} 小节已读</span><p>${escape(book.description)}</p><p class="muted small">内容未审查 · AI 教学未验证 · 未发布</p><button class="primary full" data-open-book="${escape(bookKey(book))}">打开 / 继续阅读 →</button><button class="text-button" data-begin-book="${escape(bookKey(book))}">从本版本开头阅读</button></div></article>`).join('')}</div></section>
  <section class="invitation"><div><h2>导入自己的书籍包</h2><p>只在这个浏览器校验和保存。不会上传正文、授权材料或学习记录。</p></div><button class="secondary" data-action="import-open">本机导入 JSON</button></section>
  ${state.importOpen ? `<section class="exercise" id="import-panel"><h2>本机私有导入</h2><p>需要 1.0.0 书籍包，最多 8 MiB。格式合格后才尝试保存；错误输入不会替换书籍或进度。旧版创作草稿需先按平台规范补全字段。同一 ID/版本内容冲突须使用新版本。</p><label for="package-file">选择本机 JSON 文件（不会上传）</label><input type="file" id="package-file" accept=".json,application/json"><form id="import-form"><label for="package-text">或粘贴书籍包 JSON</label><textarea id="package-text" rows="8" spellcheck="false">${escape(state.importText)}</textarea><button class="primary" type="submit" ${state.importBusy ? 'disabled' : ''}>${state.importBusy ? '正在本机校验…' : '校验并仅在本机保存'}</button></form><p class="muted small">正文会保存在浏览器本地存储，同机使用者可能读取。清除浏览器站点数据会失去本机书籍与进度。媒体、语音及私有真实 AI 接入尚未实现；不会自动获取外部资源。</p>${state.importErrors.length ? `<div class="practice-error" role="alert"><p>导入未完成。格式或保存失败，当前书籍和进度未替换。</p><ul>${state.importErrors.map(error => `<li>${escape(error.path)} · ${escape(error.code)}</li>`).join('')}</ul><p>内容审查：未进行；AI 教学：未验证；发布：未发布。</p></div>` : ''}</section>` : ''}`;
}
function conversation(chat) {
  const label = chat.resultMode === 'real-ai' ? '真实 AI 回复（教学未验收）' : '脚本演示';
  return `<div class="conversation" role="log" aria-label="本轮练习对话" aria-live="polite" tabindex="0">${chat.intro ? `<div class="bubble assistant"><span>${label}</span><p>${escape(chat.intro)}</p></div>` : ''}${chat.messages.map(message => `<div class="bubble ${message.role}"><span>${message.role === 'user' ? '你' : label}</span><p>${escape(message.content)}</p></div>`).join('')}</div>${chat.feedback.length ? `<div class="feedback"><h4>回看这一轮（自我检查或未验收反馈）</h4><ul>${chat.feedback.map(text => `<li>${escape(text)}</li>`).join('')}</ul></div>` : ''}`;
}
function practicePanel(unit) {
  if (!unit.modes?.length) return '<p>本小节只提供阅读与自我练习，没有 AI 教学入口。</p>';
  const book = activeBook(), client = activePractice(), chat = client.state, privateBook = book.source === 'browser-local';
  const labels = { explanation: '解释 / 问答', 'role-play': '角色演练', feedback: '依据反馈' };
  return `<section class="exercise" aria-labelledby="practice-title"><h3 id="practice-title">可选教学 · ${escape(unit.title)}</h3><p class="muted small">${escape(book.title)} / ${escape(currentChapter().title)} / ${escape(book.version)}</p>
  <div class="practice-options"><div><label for="practice-engine">练习服务</label><select id="practice-engine" ${chat.busy ? 'disabled' : ''}><option value="demo" ${client.selection.engine === 'demo' ? 'selected' : ''}>${privateBook ? '本机脚本 · 不上传' : '脚本演示 · 无模型调用'}</option><option value="ai" ${privateBook ? 'disabled' : ''} ${client.selection.engine === 'ai' ? 'selected' : ''}>真实 AI · ${privateBook ? '私有接入未实现' : state.capabilities.externalAiEnabled ? '已配置，教学未验证' : '服务未配置'}</option></select></div><div><label for="teaching-mode">教学模式</label><select id="teaching-mode" ${chat.busy ? 'disabled' : ''}>${unit.modes.map(mode => `<option value="${mode}" ${client.selection.mode === mode ? 'selected' : ''}>${labels[mode]}</option>`).join('')}</select></div></div>
  <p class="muted small" id="practice-privacy">${privateBook ? '正文和问题只在此浏览器。固定脚本不能生成针对问题的新答案，也不评价你的能力。' : client.selection.engine === 'ai' ? '开始后会把当前小节与本轮回应发送给维护者配置的模型服务；请勿输入私人资料。真实调用可能产生服务端费用，尚未计费给读者。' : '固定脚本用于体验，不是生成式 AI；你的演练回应会由本机开发服务临时处理。'} 阅读位置会保存；对话不持久保存，刷新后不恢复。单次最多 2000 字、每轮最多 6 次回应，可随时取消。</p>
  <div class="form-actions"><button class="secondary" data-action="practice-start" ${chat.busy ? 'disabled' : ''}>${chat.intro ? '新建一轮练习' : '开始练习 →'}</button>${chat.sessionId || chat.busy ? '<button class="secondary" data-action="practice-cancel">取消这一轮</button>' : ''}</div>${conversation(chat)}<p role="status">${chat.busy ? '正在请求，可以取消。' : ''}</p>
  ${chat.error ? `<div class="practice-error" role="alert"><p>${escape(chat.error)}</p>${chat.retryable ? '<button class="secondary" data-action="practice-retry">重试这次回应</button>' : ''}</div>` : ''}
  ${chat.sessionId && chat.phase === 'practice' ? `<form id="practice-form"><label for="practice-input">你的回应（最多 2000 字）</label><textarea id="practice-input" rows="3" maxlength="2000" aria-describedby="practice-privacy" ${chat.busy ? 'readonly' : ''}>${escape(chat.input)}</textarea><div class="form-actions"><button class="primary" type="submit" ${chat.busy ? 'disabled' : ''}>${chat.uncertain ? '核对上次回应' : '发送回应 ↑'}</button></div></form>` : chat.input ? `<label for="practice-input">保留的回应</label><textarea id="practice-input" maxlength="2000">${escape(chat.input)}</textarea>` : ''}
  ${chat.phase !== 'practice' ? '<p>本轮结束。可以新建一轮，或关闭教学继续阅读。</p>' : ''}</section>`;
}
function toolsPanel() {
  const unit = currentUnit(), book = activeBook();
  return `<section id="learning-tools" class="learning-tools" tabindex="-1"><div class="exercise-heading"><h2>可选问答与练习</h2><button class="secondary" data-action="tools-close">关闭教学，继续阅读</button></div>
  ${unit.quiz ? `<section class="exercise"><h3>${escape(unit.quiz.question)}</h3><div class="quiz-options">${unit.quiz.options.map((text, index) => `<button class="quiz-option" data-choice="${index}">${String.fromCharCode(65 + index)} ${escape(text)}</button>`).join('')}</div><p id="quiz-feedback" role="status"></p></section>` : ''}
  ${practicePanel(unit)}
  ${unit.exercises?.length ? `<details class="exercise"><summary>查看自我练习及多种合理答案的标准</summary>${unit.exercises.map(item => `<h3>${escape(item.prompt)}</h3><ul>${item.criteria.map(text => `<li>${escape(text)}</li>`).join('')}</ul><p>${item.reasonableAlternatives.map(escape).join('；')}</p>`).join('')}</details>` : ''}
  <section class="exercise"><label for="reflection">本小节的思考（仅在此浏览器保存）</label><textarea id="reflection" rows="4" maxlength="5000">${escape(Object.hasOwn(reading.record(book).reflections, unit.id) ? reading.record(book).reflections[unit.id] : '')}</textarea><button class="secondary" data-action="save-reflection">保存思考</button></section></section>`;
}
function reader() {
  const book = activeBook(), chapter = currentChapter(), record = reading.record(book);
  const chapterIndex = book.chapters.indexOf(chapter);
  const earlier = state.books.filter(item => item.id === book.id && bookKey(item) !== bookKey(book) && reading.record(item).updatedAt).sort((a,b) => reading.record(b).updatedAt - reading.record(a).updatedAt)[0];
  return `<div class="reading-top"><button class="text-button" data-view="library">← 返回书架</button><span>${escape(book.title)} · ${escape(book.version)}</span><span class="pill">${progress()}/${units().length} 小节已读</span></div>${acceptance(book)}
  ${earlier ? `<div class="version-note"><p>其他版本的进度分别保留。可沿用 ${escape(earlier.version)} 的小节位置；不会复制已读或思考记录。</p><button class="secondary" data-adopt-position="${escape(bookKey(earlier))}">沿用旧版位置</button></div>` : ''}
  <div class="reader-layout"><aside class="chapter-nav"><p class="eyebrow">篇章目录</p><h2>${escape(book.title)}</h2><nav aria-label="篇章目录">${book.chapters.map((item,index) => `<div class="chapter-group"><button class="unit-item ${item.id === chapter.id ? 'selected' : ''}" data-chapter="${escape(item.id)}" ${item.id === chapter.id ? 'aria-current="page"' : ''}>${index + 1}. ${escape(item.title)}</button>${item.id === chapter.id ? `<div class="outline-units">${item.units.map(unit => `<button class="text-button" data-reader-unit="${escape(unit.id)}">${escape(unit.title)}</button>`).join('')}</div>` : ''}</div>`).join('')}</nav><p class="muted small">恢复到上次小节标题。进度仅在当前浏览器，尚无跨设备同步。</p></aside>
  <article class="reading-pane"><p class="eyebrow">第 ${chapterIndex + 1} / ${book.chapters.length} 章</p><h1>${escape(chapter.title)}</h1>${chapter.units.map(unit => `<section class="reading-unit" data-reading-unit="${escape(unit.id)}" tabindex="-1"><h2>${escape(unit.title)}</h2><div class="reading-text">${unit.reading.map(text => `<p>${escape(text)}</p>`).join('')}</div><button class="text-button optional-learning" data-tools-unit="${escape(unit.id)}">${unit.modes?.length ? '可选：提问 / 练习 →' : '可选：记下思考 →'}</button></section>`).join('')}
  <div class="reader-bottom"><button class="secondary" data-action="complete">${chapter.units.every(unit => record.completed.includes(unit.id)) ? '✓ 本章已标记读完' : '标记本章读完'}</button>${chapterIndex > 0 ? `<button class="text-button" data-chapter="${escape(book.chapters[chapterIndex-1].id)}">← 上一章</button>` : ''}${chapterIndex < book.chapters.length-1 ? `<button class="primary" data-chapter="${escape(book.chapters[chapterIndex+1].id)}">下一章 →</button>` : '<button class="text-button" data-view="library">回到书架 →</button>'}</div></article></div>${state.toolsOpen ? toolsPanel() : ''}`;
}
function creator() {
  const draft = saved.draft;
  return `<section class="creator-header"><p class="eyebrow">CREATOR STUDIO</p><h1>从你真正理解的<br>一个问题开始。</h1><p>把内容、学习目标和练习一起设计。先保存一份草稿，逐步把它做成能够教会人的作品。</p><span class="pill neutral">本地草稿 · 尚未公开发布</span></section><div class="creator-layout"><form id="draft-form" class="draft-form"><label for="draft-title">作品名称</label><input id="draft-title" data-draft="title" maxlength="100" placeholder="例如：把话说清楚的练习" value="${escape(draft.title)}"><label for="draft-audience">你希望帮助谁</label><input id="draft-audience" data-draft="audience" maxlength="300" placeholder="描述读者的实际处境" value="${escape(draft.audience)}"><label for="draft-goal">读完以后，读者能做什么</label><textarea id="draft-goal" data-draft="goal" rows="3" maxlength="2000" placeholder="用一个具体、可观察的能力来描述">${escape(draft.goal)}</textarea><label for="draft-body">第一个小节</label><textarea id="draft-body" data-draft="body" rows="9" maxlength="12000" placeholder="讲一个具体问题，再说明你的理解和建议的练习…">${escape(draft.body)}</textarea><div class="form-actions"><button type="submit" class="primary">保存草稿</button><button type="button" class="secondary" data-action="export-draft">导出作品 JSON ↗</button></div><button type="button" class="text-button" data-action="preview-draft">预览我的草稿 →</button></form><aside class="creator-guide"><h2>一部可教可练的作品</h2><ol><li><b>一个值得解决的问题</b><p>从读者生活里会遇到的场景开始。</p></li><li><b>一个清楚的学习目标</b><p>说清读者将学会怎样判断或行动。</p></li><li><b>一次真实的尝试</b><p>让读者回答、提问、选择或练习表达。</p></li><li><b>能够指导改进的反馈</b><p>说明哪里有效，下一次可以怎样调整。</p></li></ol><p class="muted small">当前版本支持草稿保存与导出。在线账户、协作发布及教学 AI 配置将按路线逐步开发。</p></aside></div>${state.previewDraft ? `<section class="draft-preview"><p class="eyebrow">你的作品草稿</p><h2>${escape(draft.title || '尚未命名的作品')}</h2><p><b>适合：</b>${escape(draft.audience)}</p><p><b>学习目标：</b>${escape(draft.goal)}</p><div class="reading-text">${escape(draft.body).split('\n').filter(Boolean).map(text => `<p>${text}</p>`).join('')}</div></section>` : ''}`;
}

function render() {
  if (!state.books.length) return;
  const focused = document.activeElement, id = focused?.id;
  const selection = typeof focused?.selectionStart === 'number' ? [focused.selectionStart, focused.selectionEnd] : null;
  const position = window.scrollY;
  document.querySelectorAll('nav [data-view]').forEach(button => button.toggleAttribute('aria-current', button.dataset.view === state.view));
  main.innerHTML = state.view === 'learn' ? reader() : state.view === 'create' ? creator() : library();
  warnings();
  const next = (id && document.getElementById(id)) || (focused?.dataset?.action && main.querySelector(`[data-action="${CSS.escape(focused.dataset.action)}"]`));
  if (next) { next.focus({ preventScroll: true }); if (selection && next.setSelectionRange) next.setSelectionRange(...selection); }
  window.scrollTo(0, position);
}
async function importBook() {
  if (state.importBusy) return;
  state.importBusy = true; state.importErrors = []; render();
  try {
    const result = await reading.importPackage(state.importText, state.schemas, state.publicBooks);
    if (!result.valid) state.importErrors = result.errors;
    else {
      const key = bookKey(result.book);
      state.books = [...state.books.filter(book => bookKey(book) !== key), result.book];
      state.importText = ''; openBook(key);
      notify('已在本浏览器保存。仅格式合格；内容未审查、AI 教学未验证、未公开发布。');
    }
  } catch { state.importErrors = [{ path: '/', code: 'LOCAL_IMPORT_UNAVAILABLE' }]; }
  finally { state.importBusy = false; render(); }
}
document.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.dataset.view) return show(button.dataset.view);
  if (button.dataset.openBook) return openBook(button.dataset.openBook);
  if (button.dataset.beginBook) return openBook(button.dataset.beginBook, true);
  if (button.dataset.chapter) return selectUnit(activeBook().chapters.find(chapter => chapter.id === button.dataset.chapter).units[0].id);
  if (button.dataset.readerUnit) return selectUnit(button.dataset.readerUnit);
  if (button.dataset.toolsUnit) return selectUnit(button.dataset.toolsUnit, true);
  if (button.dataset.adoptPosition) {
    const from = state.books.find(book => bookKey(book) === button.dataset.adoptPosition);
    if (reading.adoptPosition(from, activeBook())) openBook(bookKey(activeBook()));
    else notify('新版没有相同小节 ID，请从目录选择；旧版进度仍保留。');
    return;
  }
  if (button.dataset.choice !== undefined) {
    const quiz = currentUnit().quiz, index = Number(button.dataset.choice);
    document.querySelector('#quiz-feedback').textContent = `${index === quiz.correctIndex ? '判断正确。' : '再检查事实与推测。'}${quiz.explanation}`;
    return;
  }
  switch (button.dataset.action) {
    case 'complete': reading.completeChapter(activeBook(), currentChapter()); render(); break;
    case 'tools-close': selectUnit(currentUnit().id, false); break;
    case 'practice-start': activePractice().start({ bookId: activeBook().id, bookVersion: activeBook().version, chapterId: currentChapter().id, unitId: currentUnit().id, ...activePractice().selection }); break;
    case 'practice-cancel': activePractice().cancel(); break;
    case 'practice-retry': activePractice().retry(); break;
    case 'save-reflection': reading.saveReflection(activeBook(), currentUnit().id, document.querySelector('#reflection').value); warnings(); if (!reading.warning) notify('思考已保存在当前浏览器'); break;
    case 'import-open': state.importOpen = true; render(); document.querySelector('#import-panel').scrollIntoView(); document.querySelector('#package-text').focus({ preventScroll: true }); break;
    case 'preview-draft': state.previewDraft = true; render(); document.querySelector('.draft-preview').setAttribute('tabindex','-1'); document.querySelector('.draft-preview').focus(); break;
    case 'export-draft': {
      const draft = { schemaVersion: 1, status: 'local-draft', language: 'zh-CN', title: saved.draft.title, audience: saved.draft.audience, learningGoals: [saved.draft.goal].filter(Boolean), chapters: [{ id: 'chapter-01', title: '第一章', units: [{ id: 'unit-01', title: '第一个小节', reading: saved.draft.body.split('\n').filter(Boolean) }] }] };
      const url = URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)], {type:'application/json'}));
      const link = document.createElement('a'); link.href=url; link.download='learning-book-draft.json'; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); break;
    }
  }
});
document.addEventListener('input', event => {
  if (event.target.id === 'practice-input') activePractice().state.input = event.target.value;
  if (event.target.id === 'reflection') reading.saveReflection(activeBook(),currentUnit().id,event.target.value);
  if (event.target.id === 'package-text') state.importText = event.target.value;
  const key = event.target.dataset.draft;
  if (key && Object.hasOwn(saved.draft,key)) { saved.draft[key]=event.target.value; persist(); }
});
document.addEventListener('change', async event => {
  if (event.target.id === 'package-file' && event.target.files[0]) {
    const file = event.target.files[0];
    if (file.size > 8*1024*1024) { state.importErrors=[{path:'/',code:'SIZE_LIMIT'}]; render(); return; }
    try { state.importText=await file.text(); } catch { state.importErrors=[{path:'/',code:'FILE_READ_FAILED'}]; } render();
  }
  if (['practice-engine','teaching-mode'].includes(event.target.id)) {
    const client=activePractice(); client.cancel(false); client.selection[event.target.id==='practice-engine'?'engine':'mode']=event.target.value; render();
  }
});
document.addEventListener('submit', event => {
  if (event.target.id==='draft-form') { event.preventDefault(); if(persist()) notify('草稿已保存在此设备'); }
  if (event.target.id==='practice-form') { event.preventDefault(); activePractice().send(); }
  if (event.target.id==='import-form') { event.preventDefault(); importBook(); }
});
window.addEventListener('hashchange',()=>{
  const view=location.hash.slice(1);
  if (['library','learn','create'].includes(view) && state.view!==view) show(view);
});
let positionTimer;
function capturePosition() {
  if (state.view!=='learn' || state.toolsOpen) return;
  const nodes=[...document.querySelectorAll('[data-reading-unit]')];
  const node=nodes.filter(node=>node.getBoundingClientRect().top<=180).at(-1) || nodes[0];
  if (node && reading.record(activeBook()).unitId!==node.dataset.readingUnit) {
    state.unitIndex=units().findIndex(unit=>unit.id===node.dataset.readingUnit);
    reading.setPosition(activeBook(),currentChapter().id,node.dataset.readingUnit); warnings();
  }
}
window.addEventListener('scroll',()=>{clearTimeout(positionTimer);positionTimer=setTimeout(capturePosition,250);},{passive:true});
window.addEventListener('pagehide',capturePosition);
document.addEventListener('visibilitychange',()=>{if(document.hidden) capturePosition();});
try {
  const [booksResponse,schemasResponse,status]=await Promise.all([fetch('/api/books'),fetch('/api/package-schemas'),fetch('/api/status').then(response=>response.json()).catch(()=>({}))]);
  if(!booksResponse.ok || !schemasResponse.ok) throw new Error('本机服务暂时不可用');
  state.publicBooks=(await booksResponse.json()).books; state.schemas=await schemasResponse.json(); state.capabilities=status;
  state.books=[...state.publicBooks,...await reading.restoredBooks(state.schemas,state.publicBooks)];
  reading.migrateLegacy(state.books[0],saved);
  const book=state.books.find(book=>bookKey(book)===reading.selected) || state.books[0];
  place(book,restoredPosition(book,reading.record(book)));
  state.view=['learn','create'].includes(location.hash.slice(1))?location.hash.slice(1):'library'; render();
  if(state.view==='learn') requestAnimationFrame(()=>document.querySelector(`[data-reading-unit="${CSS.escape(currentUnit().id)}"]`)?.scrollIntoView());
} catch {
  main.innerHTML='<section class="error-panel"><h1>暂时无法打开书架</h1><p>请确认本机项目服务已启动，再刷新页面。本机草稿和导入书籍未被删除。</p></section>';
}
