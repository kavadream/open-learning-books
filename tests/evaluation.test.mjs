import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEvaluation, validateEvaluation, reviewFeedback } from '../lib/evaluation.mjs';

test('evaluation separates unseen comparison scenarios and an unaided transfer task', async () => {
  const sets = await loadEvaluation();
  assert.deepEqual(validateEvaluation(sets), { cases: 6, learningResults: 'not-evaluated' });
  const leaked = structuredClone(sets);
  leaked[1].cases[0].scenario = leaked[0].cases[0].scenario;
  assert.throws(() => validateEvaluation(leaked), /Duplicate/);
  const assisted = structuredClone(sets);
  assisted[1].cases.at(-1).assistance = 'hint';
  assert.throws(() => validateEvaluation(assisted), /Independent/);
});

test('review flags unsupported quotes and overclaims without turning heuristics into learning results', () => {
  const reviewed = reviewFeedback({ reply: '你的情商100分，证明你已学会。', feedback: [{ evidence: '我会调整旧表格' }], learnerTexts: ['请解释一下'] });
  assert.deepEqual(reviewed.flags, ['possible-unsupported-judgment', 'unsupported-evidence']);
  assert.equal(reviewed.learningResults, 'not-evaluated');
  assert.equal(reviewed.requiresHumanReview, true);
  const reasonable = reviewFeedback({ reply: '拒绝可以有具体依据；还需要了解访问范围。', learnerTexts: ['我先核实访问范围'], feedback: [{ evidence: '核实访问范围' }] });
  assert.deepEqual(reasonable.flags, []);
  assert.equal(reasonable.requiresHumanReview, true);
});
