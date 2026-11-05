// Private packages never enter an HTTP teaching request. This transport stays in this browser.
export function localTeachingTransport(book) {
  const sessions = new Map();
  return async (path, options) => {
    const json = (value, status = 200) => Response.json(value, { status });
    const input = options.body ? JSON.parse(options.body) : {};
    if (path === '/api/teaching/sessions') {
      const chapter = book.chapters.find(chapter => chapter.id === input.chapterId);
      const unit = chapter?.units.find(unit => unit.id === input.unitId);
      if (input.engine !== 'demo') return json({ error: '私有 AI 尚未接入；正文与问题没有上传。', code: 'AI_NOT_CONFIGURED', retryable: false }, 503);
      if (input.bookId !== book.id || input.bookVersion !== book.version || !unit?.modes.includes(input.mode)) return json({ error: '书籍、章节或版本不匹配。' }, 400);
      const sessionId = crypto.randomUUID();
      if (sessions.size >= 10) sessions.delete(sessions.keys().next().value);
      sessions.set(sessionId, { unit, mode: input.mode, turns: 0, results: new Map(), expires: Date.now() + 600000 });
      return json({ sessionId }, 201);
    }
    const match = path.match(/^\/api\/teaching\/sessions\/([^/]+)(\/turns)?$/);
    const session = match && sessions.get(match[1]);
    if (options.method === 'DELETE') { if (match) sessions.delete(match[1]); return json({ cancelled: true }); }
    if (!session || session.expires <= Date.now()) return json({ error: '本机练习已结束或过期，输入仍保留。', code: 'SESSION_EXPIRED' }, 410);
    if (session.results.has(input.requestId)) {
      const saved = session.results.get(input.requestId);
      return saved.message === input.message ? json(saved.result) : json({ error: '请求编号与内容不匹配。' }, 409);
    }
    if (typeof input.message !== 'string' || input.message.length > 2000 || session.turns >= 6 || session.results.size >= 10) return json({ error: '已达到本机练习输入或次数上限。' }, 400);
    if (input.message) session.turns++;
    const config = book.localTeaching[session.unit.id];
    let reply;
    if (session.mode === 'role-play') {
      const role = config.role;
      reply = session.turns === 0 ? `本机固定脚本：我扮演${role.name}。${role.stableFacts[0]}` : session.turns < 3 ? role.stableFacts[Math.min(session.turns, role.stableFacts.length - 1)] : '本机脚本结束。请引用自己的表达，核查是否有依据及下一步；脚本不评价你的能力。';
    } else if (session.mode === 'feedback') reply = input.message ? `你写的是：“${input.message}”。请对照自己的原话检查依据和遗漏。这是自我检查提示，不是 AI 判断。` : '请提交你希望回看的表达；这里只提供固定自我检查提示。';
    else reply = `${session.unit.reading.join('\n\n')}\n\n以上是本机教材摘录；未调用 AI，不能针对问题生成新解释。`;
    const result = { mode: 'scripted-demo', phase: session.turns >= 6 || (session.mode === 'role-play' && session.turns >= 3) ? 'complete' : 'practice', reply, feedback: [], execution: 'browser-local' };
    session.results.set(input.requestId, { message: input.message, result });
    return json(result);
  };
}
