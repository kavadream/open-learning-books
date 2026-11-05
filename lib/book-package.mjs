import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { validateBookPackage, validateAcceptanceRecord, packageReport } from '../public/book-package.js';

export const packageLimitBytes = 8 * 1024 * 1024;
export async function loadPackageSchemas() {
  const [book, acceptance] = await Promise.all(['book-package', 'acceptance-record'].map(async name => JSON.parse(await readFile(new URL(`../schemas/${name}/1.0.0.schema.json`, import.meta.url), 'utf8'))));
  return { book, acceptance };
}
export async function checkPackageFile(path, recordPath) {
  if ((await stat(path)).size > packageLimitBytes) throw new Error('Package exceeds 8 MiB local validator limit');
  const raw = await readFile(path);
  if (raw.length > packageLimitBytes) throw new Error('Package exceeds 8 MiB local validator limit');
  const pkg = JSON.parse(raw.toString('utf8'));
  const schemas = await loadPackageSchemas();
  const result = validateBookPackage(pkg, schemas.book);
  const report = packageReport(pkg, result);
  if (recordPath && result.valid) {
    if ((await stat(recordPath)).size > packageLimitBytes) throw new Error('Acceptance record too large');
    const record = JSON.parse(await readFile(recordPath, 'utf8'));
    report.acceptanceRecord = validateAcceptanceRecord(record, pkg, schemas.acceptance, createHash('sha256').update(raw).digest('hex'));
  }
  return { pkg, report };
}
