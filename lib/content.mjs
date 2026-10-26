import { readFile } from 'node:fs/promises';
import { checkPackageFile } from './book-package.mjs';
import { packageToBook, teachingForPackage } from '../public/reader-model.js';

export async function loadPublicPackages() {
  // Explicit public fixture only. Never scan working folders, uploads or private manuscripts.
  const { pkg, report } = await checkPackageFile(new URL('../content/packages/public-reader-demo.package.json', import.meta.url));
  if (report.layers.format !== 'passed') throw new Error('Invalid public book package');
  return [pkg];
}

export async function loadBooks() {
  const book = JSON.parse(await readFile(new URL('../content/books/human-nature.zh-CN.json', import.meta.url), 'utf8'));
  book.source = 'public-prototype';
  book.acceptance = { layers: { format: 'legacy-compatible', contentReview: 'not-run', aiTeaching: 'not-run' }, publication: 'not-published' };
  for (const unit of book.chapters.flatMap(chapter => chapter.units)) unit.modes = unit.practice ? ['explanation', 'role-play', 'feedback'] : ['explanation', 'feedback'];
  return [book, ...(await loadPublicPackages()).map(pkg => packageToBook(pkg))];
}

export async function loadTeaching() {
  const config = JSON.parse(await readFile(new URL('../content/teaching/human-nature.zh-CN.json', import.meta.url), 'utf8'));
  return [config, ...(await loadPublicPackages()).map(pkg => teachingForPackage(pkg))];
}

export function findUnit(books, bookId, unitId) {
  const book = books.find(item => item.id === bookId);
  const chapter = book?.chapters.find(chapter => chapter.units.some(item => item.id === unitId));
  const unit = chapter?.units.find(item => item.id === unitId);
  return { book, chapter, unit };
}
