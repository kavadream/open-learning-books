import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { loadPackageSchemas, checkPackageFile } from '../lib/book-package.mjs';
import { checkSchema, validateBookPackage, validateAcceptanceRecord } from '../public/book-package.js';

const schemas = await loadPackageSchemas();
const raw = await readFile(new URL('../content/packages/human-nature.package.json', import.meta.url));
const sample = JSON.parse(raw);
const record = JSON.parse(await readFile(new URL('../content/packages/human-nature.acceptance.example.json', import.meta.url), 'utf8'));
const digest = createHash('sha256').update(raw).digest('hex');
const validate = value => validateBookPackage(value, schemas.book);
const has = (result, code) => result.errors.some(error => error.code === code);

test('public example validates without promoting any content, AI, intake or publication state', async () => {
  const { report } = await checkPackageFile(new URL('../content/packages/human-nature.package.json', import.meta.url), new URL('../content/packages/human-nature.acceptance.example.json', import.meta.url));
  assert.equal(report.layers.format, 'passed');
  assert.equal(report.layers.contentReview, 'not-run'); assert.equal(report.layers.aiTeaching, 'not-run');
  assert.equal(report.intake, 'not-indexed'); assert.equal(report.publication, 'not-published');
  assert.equal(report.acceptanceRecord.valid, true); assert.equal(report.acceptanceRecord.claimsVerified, false);
  assert.equal(record.layers.aiTeaching.status, 'not-run');
});

test('read-only and question-answering books require neither a role nor forced exercises', () => {
  const readable = structuredClone(sample);
  readable.book.capabilityLevel = 'readable'; delete readable.teaching;
  readable.exercises = []; readable.evaluation.cases = [];
  readable.chapters.forEach(chapter => chapter.units.forEach(unit => { unit.capabilityLevel = 'readable'; }));
  assert.equal(validate(readable).valid, true);
  const qa = structuredClone(sample);
  qa.book.capabilityLevel = 'question-answering'; qa.exercises = [];
  qa.chapters.forEach(chapter => chapter.units.forEach(unit => { unit.capabilityLevel = 'question-answering'; }));
  qa.teaching.units.forEach(unit => { unit.modes = ['question-answering', 'feedback']; delete unit.role; });
  assert.equal(validate(qa).valid, true);
});

test('complete text, rights, stable identities, order and references are required independently of style', () => {
  for (const mutate of [pkg => { pkg.chapters[0].units[0].body.text = '   '; }, pkg => { delete pkg.book.rights; }, pkg => { pkg.chapters[0].units[1].id = pkg.chapters[0].units[0].id; }, pkg => { pkg.chapters[0].units[1].order = 10; }, pkg => { pkg.chapters[0].units[0].sourceIds = ['missing-source']; }, pkg => { pkg.teaching.bookVersion = '9.0.0'; }]) {
    const pkg = structuredClone(sample); mutate(pkg); assert.equal(validate(pkg).valid, false);
  }
  const prose = structuredClone(sample); prose.chapters[0].units[0].body.text = '一页叙事、技术手册、诗歌或表格均可自定；平台不要求某一本书的文风。';
  assert.equal(validate(prose).valid, true);
});

test('unsafe media paths, mismatched roles and unsupported package/schema fields fail closed', () => {
  for (const path of ['../private.jpg', '/tmp/private.jpg', 'https://example.invalid/pixel', 'assets/%2e%2e/a.jpg', 'C:\\secret.jpg']) {
    const pkg = structuredClone(sample);
    pkg.media = [{ id: 'test-image', kind: 'image', path, description: '合成图', textAlternative: '合成图说明', sourceIds: ['public-sample'], rightsStatement: '仅测试' }];
    assert.equal(has(validate(pkg), 'UNSAFE_PATH'), true);
  }
  const pkg = structuredClone(sample); pkg.teaching.units[0].modes.push('role-play'); assert.equal(has(validate(pkg), 'ROLE_CONTRACT'), true);
  const future = structuredClone(sample); future.schemaVersion = '1.1.0'; assert.equal(validate(future).valid, false);
  const forged = structuredClone(sample); forged.overallScore = 100; assert.equal(has(validate(forged), 'UNKNOWN_FIELD'), true);
  const schema = structuredClone(schemas.book); schema.not = {}; assert.throws(() => checkSchema(sample, schema), /Unsupported schema keyword/);
});

test('evaluation covers unfamiliar, mistaken, boundary and counterexample cases with split isolation', () => {
  const leaked = structuredClone(sample); leaked.evaluation.cases[3].scenario = leaked.evaluation.cases[0].scenario;
  assert.equal(has(validate(leaked), 'CASE_LEAKAGE'), true);
  const assisted = structuredClone(sample); assisted.evaluation.cases.find(item => item.categories.includes('independent-transfer')).assistance = 'allowed';
  assert.equal(has(validate(assisted), 'UNAIDED_REQUIRED'), true);
  const noBoundary = structuredClone(sample); noBoundary.evaluation.cases.forEach(item => { item.categories = item.categories.filter(category => category !== 'boundary'); });
  assert.equal(validate(noBoundary).valid, false);
});

function declaredPass() {
  const value = structuredClone(record);
  for (const [name, layer] of Object.entries(value.layers)) {
    layer.status = 'passed'; layer.reviewerId = 'synthetic-reviewer';
    layer.evidence = (name === 'format' ? ['validator-run'] : name === 'contentReview' ? ['content-review','rights-review'] : ['live-ai-run','independent-reader-trial','review-decision']).map((kind,index) => ({ id: `evidence-${index}`, kind, reference: 'synthetic-test-only', summary: '仅用于元数据契约回归，并非真实结果。' }));
  }
  value.aiTest = { runKind: 'live', modelSnapshot: 'synthetic-snapshot', teachingVersion: sample.teaching.version, evaluationVersion: sample.evaluation.version, callCount: 1, readerTrial: { status: 'completed', independent: true, evidenceRefs: ['synthetic-test-only'] } };
  return value;
}
test('AI teaching passes require live-call and independent reader evidence; metadata is never proof', () => {
  const check = value => validateAcceptanceRecord(value, sample, schemas.acceptance, digest);
  assert.equal(check(declaredPass()).claimsVerified, false);
  for (const mutate of [value => { value.aiTest.runKind = 'offline-fixture'; }, value => { value.aiTest.callCount = 0; }, value => { value.aiTest.readerTrial.status = 'not-run'; }, value => { value.aiTest.readerTrial.independent = false; }, value => { value.aiTest.modelSnapshot = null; }]) {
    const value = declaredPass(); mutate(value); assert.equal(has(check(value), 'LIVE_AND_READER_EVIDENCE_REQUIRED'), true);
  }
  const changed = structuredClone(record); changed.package.bookVersion = '0.2.0'; assert.equal(has(check(changed), 'BINDING_MISMATCH'), true);
  const claimed = structuredClone(record); claimed.learningClaims = ['已经证明学习有效']; assert.equal(has(check(claimed), 'NO_UNTESTED_LEARNING_CLAIMS'), true);
});

test('critical facts, rights or safety findings block downstream passes and publication without averages', () => {
  for (const category of ['facts', 'rights', 'safety']) {
    const value = declaredPass();
    value.layers.contentReview.findings.push({ id: 'blocking-finding', severity: 'critical', category, description: '合成的关键错误，不能由其他得分抵消。', resolved: false, evidenceRefs: ['synthetic-test-only'] });
    value.publication = { status: 'published', decisionRef: 'synthetic-decision' };
    const result = validateAcceptanceRecord(value, sample, schemas.acceptance, digest);
    assert.equal(has(result, 'CONTENT_REVIEW_REQUIRED'), true); assert.equal(has(result, 'PUBLICATION_GATE'), true);
  }
});
