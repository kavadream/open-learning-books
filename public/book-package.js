// Shared offline contract checks. No network, file access, model calls or publication.
const keywords = new Set(['$schema', '$id', '$defs', '$ref', 'title', 'description', 'type', 'const', 'enum', 'required', 'properties', 'additionalProperties', 'items', 'minItems', 'maxItems', 'uniqueItems', 'minLength', 'maxLength', 'pattern', 'minimum', 'maximum']);
const levels = ['readable', 'question-answering', 'practice'];
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const canonical = value => JSON.stringify(isObject(value) ? Object.fromEntries(Object.keys(value).sort().map(key => [key, JSON.parse(canonical(value[key]))])) : Array.isArray(value) ? value.map(item => JSON.parse(canonical(item))) : value);

// Intentionally supports only the keywords used in the two checked-in 1.0.0 schemas.
// Unsupported schema keywords fail closed; this is not a general JSON Schema implementation.
export function checkSchema(value, root) {
  function supported(schema) {
    for (const key of Object.keys(schema)) if (!keywords.has(key)) throw new Error(`Unsupported schema keyword: ${key}`);
    for (const map of [schema.$defs, schema.properties]) if (map) for (const child of Object.values(map)) supported(child);
    if (schema.items) supported(schema.items);
    if (schema.$ref && !/^#\/\$defs\/[A-Za-z0-9-]+$/.test(schema.$ref)) throw new Error('Only local schema definitions are supported');
  }
  supported(root);
  const errors = [];
  const fail = (path, code) => { if (errors.length < 50) errors.push({ path: path || '/', code }); };
  const matches = (data, type) => type === 'object' ? isObject(data) : type === 'array' ? Array.isArray(data) : type === 'null' ? data === null : type === 'integer' ? Number.isSafeInteger(data) : typeof data === type;
  function visit(data, schema, path = '') {
    if (errors.length >= 50) return;
    if (schema.$ref) return visit(data, root.$defs[schema.$ref.split('/').at(-1)], path);
    if (schema.type && ![].concat(schema.type).some(type => matches(data, type))) return fail(path, 'TYPE');
    if (Object.hasOwn(schema, 'const') && canonical(data) !== canonical(schema.const)) fail(path, 'CONST');
    if (schema.enum && !schema.enum.some(item => canonical(item) === canonical(data))) fail(path, 'ENUM');
    if (typeof data === 'string') {
      const length = [...data].length;
      if (length < (schema.minLength ?? 0) || length > (schema.maxLength ?? Infinity)) fail(path, 'STRING_LENGTH');
      if (schema.pattern && !new RegExp(schema.pattern, 'u').test(data)) fail(path, 'PATTERN');
    }
    if (typeof data === 'number' && (data < (schema.minimum ?? -Infinity) || data > (schema.maximum ?? Infinity))) fail(path, 'NUMBER_RANGE');
    if (Array.isArray(data)) {
      if (data.length < (schema.minItems ?? 0) || data.length > (schema.maxItems ?? Infinity)) fail(path, 'ARRAY_LENGTH');
      if (schema.uniqueItems && new Set(data.map(canonical)).size !== data.length) fail(path, 'DUPLICATE_ITEM');
      if (schema.items) data.forEach((item, index) => visit(item, schema.items, `${path}/${index}`));
    }
    if (isObject(data)) {
      for (const key of schema.required || []) if (!Object.hasOwn(data, key)) fail(`${path}/${key}`, 'REQUIRED');
      for (const [key, item] of Object.entries(data)) {
        if (Object.hasOwn(schema.properties || {}, key)) visit(item, schema.properties[key], `${path}/${key}`);
        else if (schema.additionalProperties === false) fail(`${path}/${key}`, 'UNKNOWN_FIELD');
      }
    }
  }
  visit(value, root);
  return errors;
}

export function validateBookPackage(pkg, schema) {
  const errors = checkSchema(pkg, schema);
  if (errors.length) return { valid: false, errors };
  const fail = (path, code) => { if (errors.length < 50) errors.push({ path, code }); };
  const unique = (items, path, field = 'id') => {
    const seen = new Set();
    items.forEach((item, index) => { if (seen.has(item[field])) fail(`${path}/${index}/${field}`, 'DUPLICATE_ID'); seen.add(item[field]); });
    return seen;
  };
  const ordered = (items, path) => items.forEach((item, index) => { if (index && item.order <= items[index - 1].order) fail(`${path}/${index}/order`, 'ORDER'); });
  const units = pkg.chapters.flatMap(chapter => chapter.units);
  unique(pkg.book.authors, '/book/authors');
  unique(pkg.chapters, '/chapters'); ordered(pkg.chapters, '/chapters');
  pkg.chapters.forEach((chapter, index) => ordered(chapter.units, `/chapters/${index}/units`));
  const unitIds = unique(units, '/units');
  const objectives = unique(pkg.learningObjectives, '/learningObjectives');
  const sources = unique(pkg.sources, '/sources');
  const media = unique(pkg.media, '/media');
  unique(pkg.exercises, '/exercises'); unique(pkg.evaluation.cases, '/evaluation/cases');
  const refs = (ids, allowed, path) => ids.forEach((id, index) => { if (!allowed.has(id)) fail(`${path}/${index}`, 'UNKNOWN_REFERENCE'); });
  units.forEach((unit, index) => {
    refs(unit.objectiveIds, objectives, `/units/${index}/objectiveIds`);
    refs(unit.sourceIds, sources, `/units/${index}/sourceIds`); refs(unit.mediaIds, media, `/units/${index}/mediaIds`);
  });
  pkg.media.forEach((item, index) => {
    refs(item.sourceIds, sources, `/media/${index}/sourceIds`);
    if (!safePackagePath(item.path)) fail(`/media/${index}/path`, 'UNSAFE_PATH');
  });
  const highest = units.reduce((highest, unit) => Math.max(highest, levels.indexOf(unit.capabilityLevel)), 0);
  if (levels.indexOf(pkg.book.capabilityLevel) !== highest) fail('/book/capabilityLevel', 'CAPABILITY_MISMATCH');
  if (!pkg.book.modalities.includes('text')) fail('/book/modalities', 'TEXT_REQUIRED');
  const teaching = pkg.teaching?.units || [];
  unique(teaching, '/teaching/units', 'unitId');
  if (pkg.teaching && pkg.teaching.bookVersion !== pkg.book.version) fail('/teaching/bookVersion', 'VERSION_MISMATCH');
  teaching.forEach((item, index) => {
    refs([item.unitId], unitIds, `/teaching/units/${index}/unitId`);
    refs(item.knowledge.sourceIds, sources, `/teaching/units/${index}/knowledge/sourceIds`);
    if (item.modes.includes('role-play') !== Boolean(item.role)) fail(`/teaching/units/${index}/role`, 'ROLE_CONTRACT');
  });
  pkg.exercises.forEach((item, index) => {
    refs([item.unitId], unitIds, `/exercises/${index}/unitId`); refs(item.objectiveIds, objectives, `/exercises/${index}/objectiveIds`);
    const unit = units.find(unit => unit.id === item.unitId);
    if (unit && item.objectiveIds.some(id => !unit.objectiveIds.includes(id))) fail(`/exercises/${index}/objectiveIds`, 'OBJECTIVE_SCOPE');
    if (item.kind === 'role-play' && !teaching.find(config => config.unitId === item.unitId)?.role) fail(`/exercises/${index}/kind`, 'ROLE_CONTRACT');
  });
  pkg.evaluation.cases.forEach((item, index) => {
    refs([item.unitId], unitIds, `/evaluation/cases/${index}/unitId`);
    if (item.categories.includes('independent-transfer') && item.assistance !== 'none') fail(`/evaluation/cases/${index}/assistance`, 'UNAIDED_REQUIRED');
    const prior = pkg.evaluation.cases.slice(0, index);
    if (prior.some(other => other.scenario.trim() === item.scenario.trim())) fail(`/evaluation/cases/${index}/scenario`, 'CASE_LEAKAGE');
  });
  units.forEach((unit, index) => {
    if (unit.capabilityLevel !== 'readable' && (!teaching.some(item => item.unitId === unit.id) || !pkg.evaluation.cases.some(item => item.unitId === unit.id))) fail(`/units/${index}`, 'TEACHING_REQUIRED');
    if (unit.capabilityLevel === 'practice' && !pkg.exercises.some(item => item.unitId === unit.id)) fail(`/units/${index}`, 'EXERCISE_REQUIRED');
  });
  if (highest > 0) {
    for (const category of ['unfamiliar', 'misconception', 'boundary', 'counterexample']) if (!pkg.evaluation.cases.some(item => item.categories.includes(category))) fail('/evaluation/cases', 'CASE_COVERAGE');
    for (const split of ['development', 'comparison']) if (!pkg.evaluation.cases.some(item => item.split === split)) fail('/evaluation/cases', 'SPLIT_REQUIRED');
  }
  return { valid: errors.length === 0, errors };
}

export function safePackagePath(path) {
  return !path.startsWith('/') && !/[:\\?#%\u0000-\u001f]/u.test(path) && path.split('/').every(part => part && part !== '.' && part !== '..');
}

export function validateAcceptanceRecord(record, pkg, schema, manifestSha256) {
  const errors = checkSchema(record, schema);
  if (errors.length) return { valid: false, errors, claimsVerified: false };
  const fail = (path, code) => errors.push({ path, code });
  if (!manifestSha256 || record.package.manifestSha256 !== manifestSha256 || record.package.bookId !== pkg.book.id || record.package.bookVersion !== pkg.book.version) fail('/package', 'BINDING_MISMATCH');
  const { format, contentReview, aiTeaching } = record.layers;
  const findings = Object.values(record.layers).flatMap(layer => layer.findings);
  const critical = findings.some(item => item.severity === 'critical' && !item.resolved);
  const has = (layer, kind) => layer.evidence.some(item => item.kind === kind);
  for (const [name, layer] of Object.entries(record.layers)) {
    if (layer.status === 'passed' && (layer.findings.some(item => item.severity === 'critical' && !item.resolved) || !layer.evidence.length || !layer.reviewerId)) fail(`/layers/${name}`, 'PASS_EVIDENCE_REQUIRED');
  }
  if (format.status === 'not-applicable' || contentReview.status === 'not-applicable') fail('/layers', 'INVALID_EXEMPTION');
  if (format.status === 'passed' && !has(format, 'validator-run')) fail('/layers/format', 'FORMAT_EVIDENCE_REQUIRED');
  if (contentReview.status === 'passed' && (format.status !== 'passed' || !has(contentReview, 'content-review') || !has(contentReview, 'rights-review') || critical)) fail('/layers/contentReview', 'CONTENT_REVIEW_REQUIRED');
  const actual = record.aiTest;
  if (aiTeaching.status === 'passed' && (format.status !== 'passed' || contentReview.status !== 'passed' || critical || actual.runKind !== 'live' || actual.callCount < 1 || !actual.modelSnapshot || actual.teachingVersion !== pkg.teaching?.version || actual.evaluationVersion !== pkg.evaluation.version || actual.readerTrial.status !== 'completed' || !actual.readerTrial.independent || !actual.readerTrial.evidenceRefs.length || !has(aiTeaching, 'live-ai-run') || !has(aiTeaching, 'independent-reader-trial') || !has(aiTeaching, 'review-decision'))) fail('/layers/aiTeaching', 'LIVE_AND_READER_EVIDENCE_REQUIRED');
  if (aiTeaching.status === 'not-applicable' && pkg.book.capabilityLevel !== 'readable') fail('/layers/aiTeaching', 'INVALID_EXEMPTION');
  if (record.learningClaims.length && aiTeaching.status !== 'passed') fail('/learningClaims', 'NO_UNTESTED_LEARNING_CLAIMS');
  if (record.publication.status === 'published' && (format.status !== 'passed' || contentReview.status !== 'passed' || critical || !record.publication.decisionRef || (pkg.book.capabilityLevel !== 'readable' && aiTeaching.status !== 'passed'))) fail('/publication', 'PUBLICATION_GATE');
  return { valid: errors.length === 0, errors, claimsVerified: false };
}

export function packageReport(pkg, result) {
  return { schemaVersion: '1.0.0', layers: { format: result.valid ? 'passed' : 'failed', contentReview: 'not-run', aiTeaching: pkg?.book?.capabilityLevel === 'readable' ? 'not-applicable' : 'not-run' }, intake: 'not-indexed', publication: 'not-published', errors: result.errors };
}
