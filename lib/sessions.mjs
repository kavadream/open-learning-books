import { randomUUID } from 'node:crypto';
import { findUnit } from './content.mjs';
import { scriptedPractice } from './teaching.mjs';
import { buildMessages, validateOutput } from './provider.mjs';
import { TeachingError, failure } from './errors.mjs';

export const limits = Object.freeze({ maxInputChars: 2000, maxTurns: 6, maxRequests: 10, ttlMs: 600000, timeoutMs: 15000, maxOutputTokens: 600, maxContextBytes: 20000, sessionBudget: 90000, processBudget: 300000, maxSessions: 100, maxConcurrent: 2 });
const object = value => value && typeof value === 'object' && !Array.isArray(value);

function demo(session, message) {
  if (session.mode === 'role-play') return scriptedPractice([...session.history, ...(message ? [{ role: 'user', content: message }] : [])]);
  if (session.mode === 'explanation') return { reply: `${session.unit.reading.join('\n\n')}\n\n这是固定教材摘录，不是对你的回答作出的 AI 判断。`, feedback: [], phase: 'practice' };
  return { reply: '脚本不能判断你的回答。请引用自己的一句话，区分其中的事实与解释，再说明你想补充了解什么。', feedback: ['检查自己的话是否有可观察依据。', '合理分歧可以保留；下一步需要哪些新信息？'], phase: 'practice' };
}

export function createSessions({ books, teaching, provider = null, now = Date.now, settings = {} }) {
  const bounds = Object.freeze({ ...limits, ...settings });
  const sessions = new Map();
  let processReserved = 0;
  let concurrent = 0;
  function prune() {
    for (const [id, item] of sessions) if (item.expiresAt <= now()) {
      item.controller?.abort(failure('SESSION_EXPIRED', '练习已过期，请新建一轮；输入仍保留。', 410));
      clearTimeout(item.expiryTimer);
      sessions.delete(id);
    }
  }
  function find(id) {
    prune();
    const item = sessions.get(id);
    if (!item) throw failure('SESSION_EXPIRED', '练习不存在或已过期，请新建一轮；输入仍保留。', 410);
    if (item.closed) throw failure('CANCELLED', '这一轮已取消，请新建练习；输入仍保留。', 410);
    return item;
  }
  function describe(item) {
    return { sessionId: item.id, engine: item.engine, teachingMode: item.mode, bookVersion: item.book.version, teachingVersion: item.teaching.version, expiresAt: item.expiresAt, limits: bounds };
  }
  return {
    configured: Boolean(provider),
    create(input) {
      if (!object(input) || Object.keys(input).some(key => !['bookId', 'unitId', 'engine', 'mode'].includes(key)) || !['demo', 'ai'].includes(input.engine)) throw failure('INVALID_REQUEST', '请指定教材、教学模式和演示或真实 AI。', 400);
      const { book, unit } = findUnit(books, input.bookId, input.unitId);
      const config = teaching.find(item => item.bookId === book?.id && item.bookVersion === book?.version);
      const unitConfig = config?.units[unit?.id];
      if (!unitConfig?.modes.includes(input.mode)) throw failure('UNKNOWN_MODE', '此小节不支持所选教学模式。', 400);
      if (input.engine === 'ai' && !provider) throw failure('AI_NOT_CONFIGURED', '真实 AI 尚未配置。可以选择脚本演示，不会自动调用模型。', 503);
      prune();
      if (sessions.size >= bounds.maxSessions) throw failure('SESSION_LIMIT', '本地练习会话已达上限，请稍后重试。', 429, true);
      const item = { id: randomUUID(), engine: input.engine, mode: input.mode, book, unit, teaching: config, config: unitConfig, expiresAt: now() + bounds.ttlMs, history: [], requests: new Map(), turns: 0, reserved: 0, closed: false, controller: null };
      sessions.set(item.id, item);
      item.expiryTimer = setTimeout(() => {
        item.controller?.abort(failure('SESSION_EXPIRED', '练习已过期，请新建一轮；输入仍保留。', 410));
        sessions.delete(item.id);
      }, bounds.ttlMs);
      item.expiryTimer.unref();
      return describe(item);
    },
    cancel(id) {
      const item = sessions.get(id);
      if (item) {
        item.closed = true;
        item.controller?.abort(failure('CANCELLED', '已取消这一轮练习，输入仍保留。', 409));
        item.history = [];
        item.requests.clear();
      }
      return { cancelled: true };
    },
    async turn(id, input, signal) {
      const item = find(id);
      if (!object(input) || Object.keys(input).some(key => !['requestId', 'message'].includes(key)) || typeof input.requestId !== 'string' || !/^[a-zA-Z0-9-]{8,80}$/.test(input.requestId) || typeof input.message !== 'string' || input.message.length > bounds.maxInputChars) throw failure('INVALID_REQUEST', '回应或请求编号格式不正确，单次回应最多 2000 字。', 400);
      const message = input.message.trim();
      const existing = item.requests.get(input.requestId);
      if (existing) {
        if (existing.message !== message) throw failure('REQUEST_CONFLICT', '相同请求编号不能提交不同内容。', 409);
        return existing.promise;
      }
      if (!message && item.history.length) throw failure('INVALID_REQUEST', '请写下你的回应。', 400);
      if (item.controller) throw failure('BUSY', '这一轮仍在回复，请稍候或取消。', 409, true);
      if (item.turns >= bounds.maxTurns || item.requests.size >= bounds.maxRequests) throw failure('SESSION_LIMIT', '这一轮已达到练习次数上限，请新建练习。', 429);
      const messages = buildMessages({ ...item, history: item.history, message });
      const bytes = Buffer.byteLength(JSON.stringify(messages));
      // Conservative resource units, NOT measured tokens or money. Failed/unknown calls retain reservations.
      const reservation = bytes + bounds.maxOutputTokens + 256;
      if (bytes > bounds.maxContextBytes || item.reserved + reservation > bounds.sessionBudget || (item.engine === 'ai' && processReserved + reservation > bounds.processBudget)) throw failure('USAGE_LIMIT', '本地试点资源上限已达到，未继续调用模型。', 429);
      if (item.engine === 'ai' && concurrent >= bounds.maxConcurrent) throw failure('BUSY', '模型请求正在处理中，请稍后重试。', 429, true);
      const controller = new AbortController();
      item.controller = controller;
      const abort = () => controller.abort(failure('CANCELLED', '请求已取消，输入仍保留。', 409));
      signal?.addEventListener('abort', abort, { once: true });
      if (signal?.aborted) abort();
      const remainingLifetime = item.expiresAt - now();
      const lifetimeFirst = remainingLifetime <= bounds.timeoutMs;
      const timeout = setTimeout(() => controller.abort(lifetimeFirst
        ? failure('SESSION_EXPIRED', '练习已过期，请新建一轮；输入仍保留。', 410)
        : failure('TIMEOUT', '模型回复超时，输入仍保留；可手动重试。', 504, true)), Math.min(bounds.timeoutMs, remainingLifetime));
      item.reserved += reservation;
      if (item.engine === 'ai') { concurrent++; processReserved += reservation; }
      const run = async () => {
        try {
          if (controller.signal.aborted) throw controller.signal.reason;
          let result;
          if (item.engine === 'ai') {
            const generation = provider.generate({ messages, maxOutputTokens: bounds.maxOutputTokens, signal: controller.signal });
            let onAbort;
            try {
              const generated = await Promise.race([generation, new Promise((_, reject) => {
                onAbort = () => reject(controller.signal.reason);
                controller.signal.addEventListener('abort', onAbort, { once: true });
                if (controller.signal.aborted) onAbort();
              })]);
              const learnerTexts = [...item.history.filter(text => text.role === 'user').map(text => text.content), message];
              const output = validateOutput(generated.output, learnerTexts, item.mode);
              result = { ...output, feedback: output.feedback.map(text => `“${text.evidence}”：${text.comment} 下一步：${text.nextStep}`), usage: generated.usage, model: generated.model, phase: 'practice' };
            } finally { controller.signal.removeEventListener('abort', onAbort); }
          } else result = demo(item, message);
          if (controller.signal.aborted) throw controller.signal.reason;
          if (message) { item.history.push({ role: 'user', content: message }); item.turns++; }
          item.history.push({ role: 'assistant', content: result.reply });
          if (item.turns >= bounds.maxTurns) result.phase = 'complete';
          return { ...result, mode: item.engine === 'ai' ? 'real-ai' : 'scripted-demo', ...describe(item), remainingTurns: bounds.maxTurns - item.turns };
        } catch (err) {
          if (controller.signal.aborted) throw controller.signal.reason;
          if (err instanceof TeachingError) throw err;
          throw failure('PROVIDER_UNAVAILABLE', '服务暂时无法完成请求，输入仍保留。', 502, true);
        } finally {
          clearTimeout(timeout);
          signal?.removeEventListener('abort', abort);
          item.controller = null;
          if (item.engine === 'ai') concurrent--;
        }
      };
      const promise = run();
      item.requests.set(input.requestId, { message, promise });
      return promise;
    },
    close() {
      for (const [id, item] of sessions) { clearTimeout(item.expiryTimer); this.cancel(id); }
      sessions.clear();
    }
  };
}
