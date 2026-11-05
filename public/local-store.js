export function createLocalStore(storage, key = 'olb.prototype.v1') {
  const value = { completed: [], reflection: '', draft: { title: '', audience: '', goal: '', body: '' } };
  let warning = '';
  try {
    const stored = JSON.parse(storage.getItem(key) || 'null');
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      value.completed = Array.isArray(stored.completed) ? stored.completed.filter(x => typeof x === 'string') : [];
      value.reflection = typeof stored.reflection === 'string' ? stored.reflection : '';
      for (const field of Object.keys(value.draft)) if (typeof stored.draft?.[field] === 'string') value.draft[field] = stored.draft[field];
    }
  } catch { warning = '浏览器本地记录无法读取。当前编辑仍可保留在页面中，请导出草稿。'; }
  return {
    value,
    get warning() { return warning; },
    save() {
      try { storage.setItem(key, JSON.stringify(value)); warning = ''; return true; }
      catch { warning = '浏览器保存失败。当前内容仍在页面中，关闭前请导出草稿或复制思考。'; return false; }
    }
  };
}
