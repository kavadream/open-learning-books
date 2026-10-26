// Browser state machine, independent of rendering so races and failure recovery can be tested offline.
export function createPracticeClient({ fetchImpl = fetch, onChange = () => {}, newId = () => crypto.randomUUID() } = {}) {
  const state = { sessionId: null, messages: [], intro: '', phase: 'practice', feedback: [], busy: false, input: '', error: '', retryable: false, uncertain: false, resultMode: '', pending: null };
  let generation = 0;
  let controller;
  const changed = () => onChange(state);
  async function json(path, method, body, signal) {
    const response = await fetchImpl(path, { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal });
    const result = await response.json();
    if (!response.ok) throw Object.assign(new Error(result.error || '暂时无法继续练习'), { known: true, retryable: result.retryable, code: result.code });
    return result;
  }
  function cancel(show = true) {
    generation++;
    controller?.abort();
    if (state.sessionId) json(`/api/teaching/sessions/${state.sessionId}`, 'DELETE').catch(() => {});
    state.sessionId = null;
    state.busy = false;
    state.pending = null;
    state.retryable = false;
    state.uncertain = false;
    if (show) { state.error = '已取消这一轮。已输入的回应仍保留，可新建练习。'; changed(); }
  }
  async function turn(current) {
    const pending = state.pending;
    state.busy = true;
    state.error = '';
    state.retryable = false;
    changed();
    try {
      const result = await json(`/api/teaching/sessions/${state.sessionId}/turns`, 'POST', { requestId: pending.id, message: pending.message }, controller.signal);
      if (current !== generation) return;
      if (pending.message) state.messages.push({ role: 'user', content: pending.message }, { role: 'assistant', content: result.reply });
      else state.intro = result.reply;
      state.phase = result.phase;
      state.feedback = result.feedback || [];
      state.resultMode = result.mode;
      if (state.input.trim() === pending.message) state.input = '';
      state.pending = null;
      state.uncertain = false;
    } catch (err) {
      if (current !== generation) return;
      state.error = err.known ? err.message : '连接中断，回应仍保留。重试会先核对同一请求的结果。';
      state.retryable = err.known ? Boolean(err.retryable) : true;
      state.uncertain = !err.known;
      // Only an explicit known failure can become a new provider attempt. Transport uncertainty reuses the ID.
      if (err.known && err.retryable) state.pending.id = newId();
    } finally {
      if (current === generation) { state.busy = false; changed(); }
    }
  }
  return {
    state,
    cancel,
    async start(config) {
      if (state.busy) return;
      cancel(false);
      const current = generation;
      controller = new AbortController();
      state.busy = true;
      state.error = '';
      changed();
      try {
        const session = await json('/api/teaching/sessions', 'POST', config, controller.signal);
        if (current !== generation) {
          json(`/api/teaching/sessions/${session.sessionId}`, 'DELETE').catch(() => {});
          return;
        }
        Object.assign(state, { sessionId: session.sessionId, messages: [], intro: '', feedback: [], phase: 'practice', resultMode: '', pending: { id: newId(), message: '' } });
        await turn(current);
      } catch (err) {
        if (current === generation) { state.error = err.known ? err.message : '暂时无法开始练习。输入仍保留，请重新开始。'; state.busy = false; changed(); }
      }
    },
    async send() {
      if (state.busy || !state.sessionId) return;
      if (state.uncertain && state.pending) {
        controller = new AbortController();
        await turn(generation);
        return;
      }
      if (!state.input.trim()) return;
      state.pending = { id: newId(), message: state.input.trim() };
      controller = new AbortController();
      await turn(generation);
    },
    async retry() {
      if (state.busy || !state.sessionId || !state.pending || !state.retryable) return;
      controller = new AbortController();
      await turn(generation);
    }
  };
}
