import { readFile } from 'node:fs/promises';
import { loadEvaluation, validateEvaluation, reviewFeedback } from '../lib/evaluation.mjs';

const summary = validateEvaluation(await loadEvaluation());
console.log(JSON.stringify(summary, null, 2));
// Optional local, consented/synthetic output file. This script never calls a provider or uploads records.
if (process.argv[2]) {
  const records = JSON.parse(await readFile(process.argv[2], 'utf8'));
  if (!Array.isArray(records) || records.length > 100) throw new Error('Use a JSON array with at most 100 review records');
  for (const record of records) console.log(JSON.stringify({ caseId: record.caseId, ...reviewFeedback(record) }));
}
