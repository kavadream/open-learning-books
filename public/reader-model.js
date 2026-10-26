import { validateBookPackage, packageReport } from './book-package.js';

export const bookKey = book => `${book.id}@${book.version}`;
export const allUnits = book => book?.chapters.flatMap(chapter => chapter.units) || [];
export const chapterFor = (book, unitId) => book.chapters.find(chapter => chapter.units.some(unit => unit.id === unitId));

export function packageToBook(pkg, { local = false, digest = '' } = {}) {
  const configurations = Object.fromEntries((pkg.teaching?.units || []).map(item => [item.unitId, item]));
  return {
    schemaVersion: 1, id: pkg.book.id, version: pkg.book.version, title: pkg.book.title, author: pkg.book.authors.map(item => item.name).join('、'), language: pkg.book.language,
    description: pkg.book.audience, source: local ? 'browser-local' : 'public-package', digest,
    capabilityLevel: pkg.book.capabilityLevel, acceptance: packageReport(pkg, { valid: true, errors: [] }),
    chapters: pkg.chapters.map(chapter => ({ id: chapter.id, title: chapter.title, units: chapter.units.map(unit => {
      const config = configurations[unit.id];
      const modes = [...new Set((config?.modes || []).map(mode => mode === 'question-answering' ? 'explanation' : mode))];
      return { id: unit.id, title: unit.title, reading: unit.body.text.split(/\n\s*\n/u), capabilityLevel: unit.capabilityLevel, modes,
        ...(config?.role ? { practice: { role: config.role.name, learnerRole: config.role.learnerRole, goal: config.knowledge.scope } } : {}),
        exercises: pkg.exercises.filter(item => item.unitId === unit.id) };
    }) })),
    localTeaching: local ? configurations : undefined
  };
}

export function teachingForPackage(pkg) {
  return { schemaVersion: 1, version: pkg.teaching?.version || '0.0.0', bookId: pkg.book.id, bookVersion: pkg.book.version,
    units: Object.fromEntries((pkg.teaching?.units || []).map(item => [item.unitId, {
      ...item, modes: [...new Set(item.modes.map(mode => mode === 'question-answering' ? 'explanation' : mode))], objective: item.knowledge.scope,
      ...(item.role ? { role: item.role.name, learnerRole: item.role.learnerRole, stableFacts: item.role.stableFacts, roleBehavior: item.role.behavior } : {}),
      criteria: item.completionCriteria
    }])) };
}

export function restoredPosition(book, record) {
  const unit = allUnits(book).find(unit => unit.id === record?.unitId);
  const chapter = unit ? chapterFor(book, unit.id) : book.chapters.find(chapter => chapter.id === record?.chapterId) || book.chapters[0];
  return { chapterId: chapter.id, unitId: unit?.id || chapter.units[0].id };
}

export function createReadingStore(storage) {
  const key = 'olb.reader.v1';
  let value = { selected: null, records: {}, packages: {} };
  let warning = '';
  let protectOriginal = false;
  try {
    const stored = JSON.parse(storage.getItem(key) || 'null');
    if (stored !== null && (!stored || typeof stored !== 'object' || Array.isArray(stored) || !stored.records || typeof stored.records !== 'object' || Array.isArray(stored.records) || !stored.packages || typeof stored.packages !== 'object' || Array.isArray(stored.packages))) throw new Error('Unknown reader-store shape');
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      value = { selected: typeof stored.selected === 'string' ? stored.selected : null, records: {}, packages: {} };
      if (stored.records && typeof stored.records === 'object' && !Array.isArray(stored.records)) {
        for (const [id, item] of Object.entries(stored.records)) if (item && typeof item === 'object') value.records[id] = {
          chapterId: typeof item.chapterId === 'string' ? item.chapterId : '', unitId: typeof item.unitId === 'string' ? item.unitId : '',
          completed: Array.isArray(item.completed) ? item.completed.filter(id => typeof id === 'string') : [],
          reflections: item.reflections && typeof item.reflections === 'object' && !Array.isArray(item.reflections) ? Object.fromEntries(Object.entries(item.reflections).filter(([, text]) => typeof text === 'string')) : {},
          updatedAt: Number.isFinite(item.updatedAt) ? item.updatedAt : 0
        };
      }
      if (stored.packages && typeof stored.packages === 'object' && !Array.isArray(stored.packages)) value.packages = stored.packages;
    }
  } catch { protectOriginal = true; warning = '阅读保存无法读取；已保护原始数据，当前仍可阅读。请先备份并修复本机保存。'; }
  function persist(next = value) {
    if (protectOriginal) { warning = '原始阅读保存无法读取，未覆盖。当前进度留在页面中，请先备份并修复本机保存。'; return false; }
    try { storage.setItem(key, JSON.stringify(next)); warning = ''; return true; }
    catch { warning = '浏览器保存失败；当前进度仍在页面中，关闭后可能无法恢复。原有保存未被替换。'; return false; }
  }
  const record = book => value.records[bookKey(book)] || { ...restoredPosition(book), completed: [], reflections: {}, updatedAt: 0 };
  const sha256 = async raw => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw)))].map(byte => byte.toString(16).padStart(2, '0')).join('');
  async function parse(raw, schemas) {
    if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > 8 * 1024 * 1024) return { valid: false, errors: [{ path: '/', code: 'SIZE_LIMIT' }] };
    let pkg;
    try { pkg = JSON.parse(raw); } catch { return { valid: false, errors: [{ path: '/', code: 'INVALID_JSON' }] }; }
    const validation = validateBookPackage(pkg, schemas.book);
    if (!validation.valid) return { ...validation, report: packageReport(pkg, validation) };
    const digest = await sha256(raw);
    return { valid: true, pkg, digest, book: packageToBook(pkg, { local: true, digest }), report: packageReport(pkg, validation) };
  }
  return {
    get selected() { return value.selected; }, get warning() { return warning; }, record,
    async restoredBooks(schemas, publicBooks) {
      const books = [];
      for (const item of Object.values(value.packages)) {
        const parsed = await parse(item?.raw, schemas);
        if (parsed.valid && !publicBooks.some(book => bookKey(book) === bookKey(parsed.book))) books.push(parsed.book);
        else warning = '部分本地书籍无法校验或与公开版本冲突，已保留原始保存但暂不加载。';
      }
      return books;
    },
    async importPackage(raw, schemas, publicBooks) {
      const parsed = await parse(raw, schemas);
      if (!parsed.valid) return parsed;
      const id = bookKey(parsed.book);
      if (publicBooks.some(book => bookKey(book) === id) || (value.packages[id] && value.packages[id].digest !== parsed.digest)) return { valid: false, errors: [{ path: '/book/version', code: 'VERSION_CONFLICT' }] };
      const next = { ...value, selected: id, packages: { ...value.packages, [id]: { raw, digest: parsed.digest } } };
      if (!persist(next)) return { valid: false, errors: [{ path: '/', code: 'SAVE_FAILED' }] };
      value = next;
      return parsed;
    },
    setPosition(book, chapterId, unitId) {
      const position = restoredPosition(book, { chapterId, unitId });
      value.selected = bookKey(book); value.records[bookKey(book)] = { ...record(book), ...position, updatedAt: Date.now() }; persist();
    },
    completeChapter(book, chapter) {
      const current = record(book);
      value.records[bookKey(book)] = { ...current, completed: [...new Set([...current.completed, ...chapter.units.map(unit => unit.id)])], updatedAt: Date.now() }; persist();
    },
    saveReflection(book, unitId, text) {
      const current = record(book);
      value.records[bookKey(book)] = { ...current, reflections: { ...current.reflections, [unitId]: text }, updatedAt: Date.now() }; persist();
    },
    adoptPosition(from, to) {
      const previous = record(from);
      if (!allUnits(to).some(unit => unit.id === previous.unitId)) return false;
      const position = restoredPosition(to, previous);
      this.setPosition(to, position.chapterId, position.unitId);
      return true;
    },
    migrateLegacy(book, legacy) {
      if (value.records[bookKey(book)] || book.id !== 'human-nature' || book.version !== '0.1.0') return;
      value.records[bookKey(book)] = { ...record(book), completed: legacy.completed, reflections: { transfer: legacy.reflection }, updatedAt: 0 };
      persist();
    }
  };
}
