import test from 'node:test';
import assert from 'node:assert/strict';
import { createPracticeClient } from '../public/practice.js';
import { createLocalStore } from '../public/local-store.js';

const session = { sessionId: 'test-session' };
const reply = text => ({ reply: text, mode: 'scripted-demo', phase: 'practice', feedback: [] });
const config = { bookId: 'human-nature', unitId: 'ask-before-judging', mode: 'role-play', engine: 'demo' };

test('transport retries keep one request ID and one learner turn; draft survives failure', async () => {
  const ids = [];
  let attempts = 0;
  const client = createPracticeClient({ fetchImpl: async (path, options) => {
    if (path.endsWith('/sessions')) return Response.json(session);
    const body = JSON.parse(options.body);
    if (!body.message) return Response.json(reply('开始'));
    ids.push(body.requestId);
    if (++attempts === 1) throw new Error('offline');
    return Response.json(reply('收到'));
  } });
  await client.start(config);
  client.state.input = '询问具体困难';
  await client.send();
  assert.equal(client.state.input, '询问具体困难');
  assert.equal(client.state.messages.length, 0);
  assert.equal(client.state.retryable, true);
  await client.retry();
  assert.equal(ids[0], ids[1]);
  assert.equal(client.state.messages.length, 2);
  assert.equal(client.state.input, '');
});

test('explicit retry after known failure uses a new ID; unconfigured state never becomes real AI', async () => {
  const ids = [];
  let attempts = 0;
  const client = createPracticeClient({ fetchImpl: async (path, options) => {
    if (path.endsWith('/sessions')) return Response.json(session);
    const body = JSON.parse(options.body);
    ids.push(body.requestId);
    if (++attempts === 1) return Response.json({ error: '限流', retryable: true }, { status: 429 });
    return Response.json(reply('成功'));
  } });
  await client.start(config);
  await client.retry();
  assert.notEqual(ids[0], ids[1]);
  assert.equal(client.state.intro, '成功');
  const unavailable = createPracticeClient({ fetchImpl: async () => Response.json({ error: '尚未配置', retryable: false }, { status: 503 }) });
  unavailable.state.input = '保留';
  await unavailable.start({ ...config, engine: 'ai' });
  assert.equal(unavailable.state.input, '保留');
  assert.equal(unavailable.state.resultMode, '');
  assert.match(unavailable.state.error, /尚未配置/);
});

test('cancel/reset ignores late replies and preserves the current input', async () => {
  let finish;
  let calls = 0;
  const client = createPracticeClient({ fetchImpl: async (path, options) => {
    if (options.method === 'DELETE') return Response.json({ cancelled: true });
    if (path.endsWith('/sessions')) return Response.json(session);
    if (++calls === 1) return Response.json(reply('开始'));
    return new Promise(resolve => { finish = () => resolve(Response.json(reply('迟到回复'))); });
  } });
  await client.start(config);
  client.state.input = '当前回应';
  const pending = client.send();
  client.cancel();
  finish();
  await pending;
  assert.equal(client.state.busy, false);
  assert.equal(client.state.input, '当前回应');
  assert.equal(client.state.messages.length, 0);
  assert.equal(client.state.sessionId, null);
  assert.doesNotMatch(client.state.intro, /迟到/);
});

test('storage denial, corrupted JSON and legacy data do not discard in-memory drafts', () => {
  const denied = createLocalStore({ getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); } });
  denied.value.draft.body = '尚未保存的长草稿';
  denied.value.reflection = '当前思考';
  assert.equal(denied.save(), false);
  assert.equal(denied.value.draft.body, '尚未保存的长草稿');
  assert.equal(denied.value.reflection, '当前思考');
  assert.match(denied.warning, /保存失败/);
  assert.ok(createLocalStore({ getItem: () => '{bad' }).warning);
  const old = createLocalStore({ getItem: () => JSON.stringify({ completed: ['facts-and-stories', 9], reflection: '原有思考', draft: { title: '旧草稿', body: '旧正文' } }) });
  assert.deepEqual(old.value.completed, ['facts-and-stories']);
  assert.equal(old.value.draft.body, '旧正文');
  assert.equal(old.value.reflection, '原有思考');
});

test('sending after an uncertain response resolves the old request before sending edited text', async () => {
  let attempts = 0;
  const sent = [];
  const client = createPracticeClient({ fetchImpl: async (path, options) => {
    if (path.endsWith('/sessions')) return Response.json(session);
    const body = JSON.parse(options.body);
    if (!body.message) return Response.json(reply('开始'));
    sent.push(body);
    if (++attempts === 1) throw new Error('response lost');
    return Response.json(reply('收到原回应'));
  } });
  await client.start(config);
  client.state.input = '原回应'; await client.send();
  client.state.input = '新编辑内容'; await client.send();
  assert.deepEqual(sent[0], sent[1]);
  assert.equal(client.state.messages[0].content, '原回应');
  assert.equal(client.state.input, '新编辑内容');
});
