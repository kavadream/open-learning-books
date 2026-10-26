import { readFile } from 'node:fs/promises';

export async function loadBooks() {
  const book = JSON.parse(await readFile(new URL('../content/books/human-nature.zh-CN.json', import.meta.url), 'utf8'));
  return [book];
}

export function findUnit(books, bookId, unitId) {
  const book = books.find(item => item.id === bookId);
  const unit = book?.chapters.flatMap(chapter => chapter.units).find(item => item.id === unitId);
  return { book, unit };
}
