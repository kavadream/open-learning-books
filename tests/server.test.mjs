import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { makeServer } from '../server.mjs';

const server = await makeServer();
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
