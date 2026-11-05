import { readFile } from 'node:fs/promises';

export async function loadEvaluation() {
  return Promise.all(['development', 'comparison'].map(async split => JSON.parse(await readFile(new URL(`../evals/facts-and-stories/${split}.json`, import.meta.url), 'utf8'))));
}

export function validateEvaluation(sets) {
  const ids = new Set(), scenarios = new Set();
  if (sets.map(set => set.split).sort().join(',') !== 'comparison,development') throw new Error('Keep development and comparison separate');
  for (const set of sets) {
    if (set.schemaVersion !== 1 || !set.version || set.unitId !== 'facts-and-stories' || set.cases.length < 3) throw new Error('Invalid evaluation set');
    for (const item of set.cases) {
      if (!item.id || ids.has(item.id) || !item.scenario || scenarios.has(item.scenario.trim()) || !item.task) throw new Error('Duplicate or incomplete evaluation case');
      ids.add(item.id); scenarios.add(item.scenario.trim());
      for (const key of ['facts', 'unknowns', 'commonMistakes', 'reasonableAlternatives', 'consistencyChecks', 'unsupportedJudgments']) if (!Array.isArray(item[key]) || !item[key].length || !item[key].every(value => typeof value === 'string' && value.trim())) throw new Error(`Missing ${key}`);
      if (set.split === 'development' && (!item.syntheticResponses?.some(response => response.kind === 'mistake') || !item.syntheticResponses?.some(response => response.kind === 'reasonable-alternative'))) throw new Error('Development cases need contrasting synthetic examples');
    }
  }
  if (!sets.find(set => set.split === 'comparison').cases.some(item => item.independent && item.assistance === 'none')) throw new Error('Independent transfer task required');
  return { cases: ids.size, learningResults: 'not-evaluated' };
}

// Review flags only: semantic consistency, correctness and learning still require independent human judgment.
export function reviewFeedback({ reply, feedback = [], learnerTexts = [] }) {
  const flags = [];
  if (/情商.{0,4}[分\d]|人格.{0,4}[分\d]|掌握率|证明.{0,6}学会|一定.{0,6}(懒惰|不诚实|不尊重)/u.test(reply || '')) flags.push('possible-unsupported-judgment');
  for (const item of feedback) if (typeof item.evidence !== 'string' || !item.evidence.trim() || !learnerTexts.some(text => text.includes(item.evidence))) flags.push('unsupported-evidence');
  return { flags: [...new Set(flags)], requiresHumanReview: true, learningResults: 'not-evaluated' };
}
