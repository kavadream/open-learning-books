import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { request } from 'node:http';
import { makeServer } from '../server.mjs';
import { createProvider } from '../lib/provider.mjs';

const server = await makeServer({ provider: null });
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const origin = `http://127.0.0.1:${server.address().port}`;
after(async () => {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
});
const post = (data, path = '/api/practice') => fetch(origin + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

test('the running service serves the UI and honestly declares its capability state', async () => {
  const page = await fetch(origin);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  assert.match(await page.text(), /Open Learning Books/);
  const status = await (await fetch(origin + '/api/status')).json();
  assert.equal(status.mode, 'scripted-demo');
  assert.equal(status.externalAiEnabled, false);
  assert.equal(status.paymentsEnabled, false);
});

test('book loading and the initial teaching interaction work through HTTP', async () => {
  const response = await fetch(origin + '/api/books');
  const { books } = await response.json();
  assert.equal(books[0].chapters[0].units.length, 3);
  const practice = await post({ bookId: books[0].id, unitId: 'ask-before-judging', messages: [] });
  assert.equal(practice.status, 200);
  assert.equal((await practice.json()).mode, 'scripted-demo');
});

test('invalid and unknown teaching requests fail clearly', async () => {
  const bad = await post({ bookId: 'human-nature', unitId: 'ask-before-judging', messages: [{ role: 'system', content: 'bad role' }] });
  assert.equal(bad.status, 400);
  assert.ok((await bad.json()).error);
  const missing = await post({ bookId: 'unknown', unitId: 'ask-before-judging', messages: [] });
  assert.equal(missing.status, 404);
  await missing.json();
  const malformed = await fetch(origin + '/api/practice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{invalid' });
  assert.equal(malformed.status, 400);
  await malformed.json();
  const wrongType = await fetch(origin + '/api/practice', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{}' });
  assert.equal(wrongType.status, 415);
  await wrongType.json();
});

test('static requests cannot read files outside public or disclose server source', async () => {
  const traversal = await fetch(origin + '/%2e%2e%2fserver.mjs');
  assert.equal(traversal.status, 403);
  assert.doesNotMatch(await traversal.text(), /createServer/);
  const source = await fetch(origin + '/server.mjs');
  assert.equal(source.status, 404);
  await source.json();
  const api = await fetch(origin + '/api/not-real');
  assert.equal(api.status, 404);
  await api.json();
});

test('a completed three-turn interaction returns feedback rather than a fabricated ability score', async () => {
  const messages = [];
  for (const text of ['先说说具体困难。', '哪些旧表可以停？', '我们明天一起核对结果。']) {
    messages.push({ role: 'user', content: text });
    const response = await post({ bookId: 'human-nature', unitId: 'ask-before-judging', messages });
    assert.equal(response.status, 200);
    const result = await response.json();
    messages.push({ role: 'assistant', content: result.reply });
    if (messages.length === 6) {
      assert.equal(result.phase, 'feedback');
      assert.ok(result.feedback.length);
      assert.equal('score' in result, false);
    }
  }
});

test('versioned session HTTP flow preserves demo labels and supports explicit cancellation', async () => {
  const response = await post({ bookId: 'human-nature', unitId: 'ask-before-judging', engine: 'demo', mode: 'role-play' }, '/api/teaching/sessions');
  assert.equal(response.status, 201);
  const session = await response.json();
  const path = `/api/teaching/sessions/${session.sessionId}/turns`;
  const first = await post({ requestId: 'http-request-1', message: '' }, path);
  assert.equal(first.status, 200);
  const body = await first.json();
  assert.equal(body.mode, 'scripted-demo');
  assert.equal(body.bookVersion, '0.1.0');
  const duplicate = await post({ requestId: 'http-request-1', message: '' }, path);
  assert.deepEqual(await duplicate.json(), body);
  const cancelled = await fetch(`${origin}/api/teaching/sessions/${session.sessionId}`, { method: 'DELETE' });
  assert.equal(cancelled.status, 200);
  await cancelled.json();
  const gone = await post({ requestId: 'http-request-2', message: '新回应' }, path);
  assert.equal(gone.status, 410);
  assert.equal((await gone.json()).code, 'CANCELLED');
});

test('unconfigured AI, cross-origin posts and oversized JSON fail without invoking a provider', async () => {
  const data = { bookId: 'human-nature', unitId: 'ask-before-judging', engine: 'ai', mode: 'role-play' };
  const unconfigured = await post(data, '/api/teaching/sessions');
  assert.equal(unconfigured.status, 503);
  assert.equal((await unconfigured.json()).code, 'AI_NOT_CONFIGURED');
  const cross = await fetch(origin + '/api/teaching/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://untrusted.invalid' }, body: JSON.stringify(data) });
  assert.equal(cross.status, 403);
  await cross.json();
  // Node fetch may replace Host, so use the actual HTTP transport for a rebinding probe.
  const rebound = await new Promise((resolve, reject) => {
    const req = request(origin + '/api/teaching/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json', Host: 'untrusted.invalid' } }, response => { response.resume(); resolve(response.statusCode); });
    req.on('error', reject); req.end(JSON.stringify(data));
  });
  assert.equal(rebound, 403);
  const oversized = await post({ text: 'x'.repeat(17000) }, '/api/teaching/sessions');
  assert.equal(oversized.status, 413);
  await oversized.json();
  for (const path of ['/content/teaching/human-nature.zh-CN.json', '/.env', '/lib/provider.mjs']) {
    const hidden = await fetch(origin + path);
    assert.equal(hidden.status, 404);
    await hidden.json();
  }
});

test('the offline wire fixture integrates through HTTP while legacy demos stay scripted', async t => {
  let calls = 0;
  const provider = createProvider({ OLB_AI_ENABLED: 'true', OLB_AI_ADAPTER: 'chat-completions', OLB_AI_ENDPOINT: 'https://fixture.invalid/chat/completions', OLB_AI_MODEL: 'offline-fixture', OLB_AI_KEY: 'synthetic-integration-key' }, async (_, options) => {
    calls++;
    const request = JSON.parse(options.body);
    assert.match(request.messages[0].content, /Selected mode: explanation/);
    return Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ reply: '这是离线协议夹具，不是真实模型验证。', feedback: [] }) } }], usage: { prompt_tokens: 20, completion_tokens: 20, total_tokens: 40 } });
  });
  const local = await makeServer({ provider });
  local.listen(0, '127.0.0.1'); await once(local, 'listening');
  t.after(async () => { local.closeAllConnections(); await new Promise(resolve => local.close(resolve)); });
  const url = `http://127.0.0.1:${local.address().port}`;
  const send = (path, body) => fetch(url + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const status = await (await fetch(url + '/api/status')).json();
  assert.equal(status.externalAiEnabled, true);
  assert.equal(status.realAiVerified, false);
  assert.doesNotMatch(JSON.stringify(status), /synthetic-integration-key/);
  const session = await (await send('/api/teaching/sessions', { bookId: 'human-nature', unitId: 'facts-and-stories', mode: 'explanation', engine: 'ai' })).json();
  const result = await (await send(`/api/teaching/sessions/${session.sessionId}/turns`, { requestId: 'integration-0001', message: '请解释事实和推测的区别。' })).json();
  assert.equal(result.mode, 'real-ai'); // Wire label exercised with a synthetic provider, not a live evaluation.
  assert.equal(result.usage.totalTokens, 40);
  assert.equal(calls, 1);
  const legacy = await (await send('/api/practice', { bookId: 'human-nature', unitId: 'ask-before-judging', messages: [] })).json();
  assert.equal(legacy.mode, 'scripted-demo');
  assert.equal(calls, 1);
});
