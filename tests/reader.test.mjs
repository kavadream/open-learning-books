import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadPackageSchemas } from '../lib/book-package.mjs';
import { createReadingStore, packageToBook, restoredPosition, bookKey } from '../public/reader-model.js';
import { localTeachingTransport } from '../public/local-teaching.js';
import { loadBooks } from '../lib/content.mjs';

const schemas = await loadPackageSchemas();
const sample = JSON.parse(await readFile(new URL('../content/packages/public-reader-demo.package.json', import.meta.url), 'utf8'));
function memory() {
  const data = new Map();
  return { data, denied: false, getItem: key => data.get(key) || null, setItem(key,value) { if (this.denied) throw new Error('quota'); data.set(key,value); } };
}
const synthetic = (version = '0.1.0') => { const pkg = structuredClone(sample); pkg.book.id = 'synthetic-private'; pkg.book.version = version; pkg.teaching.bookVersion = version; return pkg; };

test('public fixture loads multiple complete chapters alongside the unchanged prototype', async () => {
  const books = await loadBooks();
  assert.equal(books[0].id, 'human-nature'); assert.equal(books[0].chapters[0].units.length, 3);
  const multi = books.find(book => book.id === 'public-reader-demo');
  assert.equal(multi.chapters.length, 3); assert.ok(multi.chapters.every(chapter => chapter.units[0].reading.join('').length > 100));
  assert.equal(multi.acceptance.layers.aiTeaching, 'not-run');
});

test('local import validates before commit, restores book/chapter/unit/version, and retains text only locally', async () => {
  const storage = memory(), store = createReadingStore(storage);
  const result = await store.importPackage(JSON.stringify(synthetic()), schemas, await loadBooks());
  assert.equal(result.valid, true); assert.equal(result.book.source, 'browser-local');
  const chapter = result.book.chapters[2]; store.setPosition(result.book, chapter.id, chapter.units[0].id); store.completeChapter(result.book, chapter);
  store.saveReflection(result.book, chapter.units[0].id, '合成思考');
  const restored = createReadingStore(storage), books = await restored.restoredBooks(schemas, await loadBooks());
  assert.equal(books.length, 1); assert.equal(restored.selected, bookKey(result.book));
  assert.equal(restoredPosition(books[0], restored.record(books[0])).chapterId, chapter.id);
  assert.equal(restored.record(books[0]).reflections[chapter.units[0].id], '合成思考');
});

test('malformed, unsupported, oversized and same-version conflicting imports leave books/progress unchanged', async () => {
  const storage = memory(), store = createReadingStore(storage), pkg = synthetic();
  const first = await store.importPackage(JSON.stringify(pkg), schemas, []); store.setPosition(first.book, first.book.chapters[1].id, first.book.chapters[1].units[0].id);
  const snapshot = storage.getItem('olb.reader.v1');
  for (const raw of ['{bad', JSON.stringify({ ...pkg, schemaVersion: '9.0.0' }), 'x'.repeat(8*1024*1024+1), JSON.stringify({ ...pkg, book: { ...pkg.book, title: '同版本不同内容' } })]) {
    assert.equal((await store.importPackage(raw, schemas, [])).valid, false);
    assert.equal(storage.getItem('olb.reader.v1'), snapshot);
  }
});

test('new versions keep independent records; explicit stable-ID position adoption copies no completions or reflections', async () => {
  const store = createReadingStore(memory());
  const old = (await store.importPackage(JSON.stringify(synthetic()), schemas, [])).book;
  store.setPosition(old, old.chapters[1].id, old.chapters[1].units[0].id); store.completeChapter(old, old.chapters[1]); store.saveReflection(old, old.chapters[1].units[0].id, '旧版思考');
  const next = (await store.importPackage(JSON.stringify(synthetic('0.2.0')), schemas, [])).book;
  assert.equal(store.record(next).chapterId, next.chapters[0].id); assert.deepEqual(store.record(next).completed, []);
  assert.equal(store.adoptPosition(old, next), true); assert.equal(store.record(next).chapterId, next.chapters[1].id);
  assert.deepEqual(store.record(next).completed, []); assert.deepEqual(store.record(next).reflections, {});
  assert.equal(store.record(old).completed.length, 1);
  const changed = structuredClone(next); changed.chapters[1].units[0].id = 'new-stable-id';
  assert.equal(store.adoptPosition(old, changed), false);
});

test('save failure rejects a new import atomically while keeping the current in-memory reading work', async () => {
  const storage = memory(), store = createReadingStore(storage);
  const old = (await store.importPackage(JSON.stringify(synthetic()), schemas, [])).book;
  const before = storage.getItem('olb.reader.v1'); storage.denied = true;
  assert.equal((await store.importPackage(JSON.stringify(synthetic('0.2.0')), schemas, [])).valid, false);
  assert.equal(storage.getItem('olb.reader.v1'), before);
  store.saveReflection(old, old.chapters[0].units[0].id, '尚未保存的新思考');
  assert.equal(store.record(old).reflections[old.chapters[0].units[0].id], '尚未保存的新思考'); assert.match(store.warning, /保存失败/);
});

test('private teaching transport never invokes HTTP and binds optional practice to book/chapter/version', async t => {
  let network = 0; t.mock.method(globalThis, 'fetch', () => { network++; throw new Error('network must not be used'); });
  const book = packageToBook(synthetic(), { local: true });
  const transport = localTeachingTransport(book);
  const create = body => transport('/api/teaching/sessions', { method: 'POST', body: JSON.stringify(body) });
  const body = { bookId: book.id, bookVersion: book.version, chapterId: book.chapters[1].id, unitId: book.chapters[1].units[0].id, mode: 'role-play', engine: 'demo' };
  assert.equal((await create({ ...body, bookVersion: '9.0.0' })).status, 400);
  assert.equal((await create({ ...body, engine: 'ai' })).status, 503);
  const session = await (await create(body)).json();
  const reply = await (await transport(`/api/teaching/sessions/${session.sessionId}/turns`, { method: 'POST', body: JSON.stringify({ requestId: 'local-test-1', message: '' }) })).json();
  assert.equal(reply.execution, 'browser-local'); assert.equal(reply.mode, 'scripted-demo'); assert.equal(network, 0);
});

test('damaged local reading storage is protected from startup migration, progress writes and new imports', async () => {
  const storage = memory(); storage.setItem('olb.reader.v1', '{unreadable-original');
  const store = createReadingStore(storage), book = (await loadBooks())[0];
  store.migrateLegacy(book, { completed: ['facts-and-stories'], reflection: '原型思考' });
  store.setPosition(book, book.chapters[0].id, book.chapters[0].units[1].id);
  assert.equal((await store.importPackage(JSON.stringify(synthetic()), schemas, [])).valid, false);
  assert.equal(storage.getItem('olb.reader.v1'), '{unreadable-original');
  assert.match(store.warning, /未覆盖/);
});
