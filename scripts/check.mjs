import { spawnSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { loadBooks, loadTeaching } from '../lib/content.mjs';
import { loadEvaluation, validateEvaluation } from '../lib/evaluation.mjs';
import { checkPackageFile } from '../lib/book-package.mjs';

async function files(dir) {
  const result = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (item.name.startsWith('.') || ['node_modules', 'runtime'].includes(item.name)) continue;
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
  if (book.schemaVersion !== 1 || !book.version || !book.id || !book.title || !book.chapters?.length) throw new Error('Invalid book');
  const ids = new Set();
  for (const unit of book.chapters.flatMap(chapter => chapter.units)) {
    if (!unit.id || ids.has(unit.id) || !unit.reading?.every(x => typeof x === 'string')) throw new Error('Invalid unit');
    ids.add(unit.id);
    if (unit.quiz && !unit.quiz.options[unit.quiz.correctIndex]) throw new Error('Invalid quiz');
  }
}
for (const config of await loadTeaching()) {
  const book = books.find(book => book.id === config.bookId && book.version === config.bookVersion);
  if (!book || config.schemaVersion !== 1 || !config.version) throw new Error('Invalid teaching version');
  const ids = book.chapters.flatMap(chapter => chapter.units).map(unit => unit.id);
  for (const [id, unit] of Object.entries(config.units)) if (!ids.includes(id) || !unit.objective || !unit.criteria?.length || !unit.modes?.length || !unit.modes.every(mode => ['explanation', 'role-play', 'feedback'].includes(mode))) throw new Error('Invalid teaching configuration');
}
validateEvaluation(await loadEvaluation());
for (const name of ['human-nature', 'public-reader-demo']) {
  const { report } = await checkPackageFile(new URL(`../content/packages/${name}.package.json`, import.meta.url), name === 'human-nature' ? new URL('../content/packages/human-nature.acceptance.example.json', import.meta.url) : undefined);
  if (report.layers.format !== 'passed' || report.acceptanceRecord?.valid === false) throw new Error('Invalid package contract');
}
console.log('Syntax, versioned content, teaching configuration, package contracts and evaluation checks passed.');
