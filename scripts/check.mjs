import { spawnSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { loadBooks } from '../lib/content.mjs';

async function files(dir) {
  const result = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (item.name.startsWith('.') || item.name === 'node_modules') continue;
    const path = `${dir}/${item.name}`;
    if (item.isDirectory()) result.push(...await files(path));
    else if (/\.(?:mjs|js)$/.test(path)) result.push(path);
  }
  return result;
}
for (const path of await files('.')) {
  const check = spawnSync(process.execPath, ['--check', path], { stdio: 'inherit' });
  if (check.status !== 0) process.exit(check.status || 1);
}
const books = await loadBooks();
for (const book of books) {
  if (book.schemaVersion !== 1 || !book.id || !book.title || !book.chapters?.length) throw new Error('Invalid book');
  const ids = new Set();
  for (const unit of book.chapters.flatMap(chapter => chapter.units)) {
    if (!unit.id || ids.has(unit.id) || !unit.reading?.every(x => typeof x === 'string')) throw new Error('Invalid unit');
    ids.add(unit.id);
    if (unit.quiz && !unit.quiz.options[unit.quiz.correctIndex]) throw new Error('Invalid quiz');
  }
}
console.log('Syntax and book content checks passed.');
