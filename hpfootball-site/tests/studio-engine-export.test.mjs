import test from 'node:test';
import assert from 'node:assert/strict';
import { applyStep, operatorBrief, parseJsonAnswer, SCHEMAS, stepInput, STEPS } from '../src/studio/lib/engine.mjs';
import { buildPackage } from '../src/studio/lib/export.mjs';
import { createTopic } from '../src/studio/lib/model.mjs';
import { readyCandidate } from './fixtures/studio-topic.mjs';

const topic = () => createTopic({ raw: 'idea', id: 'ET-20261006-eeee', now: new Date('2026-10-06T00:00:00Z') });

test('every step schema is strict (structured outputs contract)', () => {
  const walk = (schema) => {
    if (schema.type === 'object') {
      assert.equal(schema.additionalProperties, false);
      assert.deepEqual([...schema.required].sort(), Object.keys(schema.properties).sort());
      Object.values(schema.properties).forEach(walk);
    }
    if (schema.type === 'array') walk(schema.items);
  };
  Object.values(SCHEMAS).forEach(walk);
});

test('research: urlless sources are dropped, engine sources start unverified', () => {
  const t = applyStep('research', topic(), {
    sources: [
      { title: 'Real', url: 'https://example.org/x', role: 'ACADEMIC', stance: 'SUPPORTS', opened: true },
      { title: 'Invented', url: '', role: 'MEDIA', stance: 'CONTEXT' },
      { title: 'Dup', url: 'https://example.org/x', role: 'MEDIA', stance: 'CONTEXT' },
    ],
  });
  assert.equal(t.research.sources.length, 1);
  assert.equal(t.research.sources[0].id, 'S1');
  assert.equal(t.research.sources[0].verified, false);
});

test('evidence: citations to unknown source ids are removed, bad enums become UNKNOWN', () => {
  let t = applyStep('research', topic(), { sources: [{ title: 'A', url: 'https://a.org', role: 'PRIMARY', stance: 'SUPPORTS' }] });
  t = applyStep('evidence', t, { claims: [{ claim: 'c', evidence: 'e', source_ids: ['S1', 'S7'], confidence: 'CERTAIN' }], thesis: 't' });
  assert.deepEqual(t.claims[0].source_ids, ['S1']);
  assert.equal(t.claims[0].confidence, 'UNKNOWN');
});

test('headlines: missing safety answers default to the unsafe side', () => {
  const t = applyStep('headlines', { ...topic(), draft: { ...topic().draft, version: 3 } }, { headlines: [{ variant: 'C', text: 'Başlık' }, { variant: 'Z', text: 'x' }] });
  assert.equal(t.headlines.length, 1);
  assert.deepEqual(
    { a: t.headlines[0].safety.answers, s: t.headlines[0].safety.stronger_than_evidence, m: t.headlines[0].safety.misleading },
    { a: false, s: true, m: true },
  );
  assert.equal(t.headlines_draft_version, 3);
});

test('draft: a new draft clears the human voice check', () => {
  const t = applyStep('draft', { ...topic(), attestations: { voice_checked: true, sources_checked: true } }, { standfirst: 's', body_md: 'metin' });
  assert.equal(t.draft.version, 1);
  assert.equal(t.attestations.voice_checked, false);
  assert.throws(() => applyStep('draft', topic(), { standfirst: '', body_md: '  ' }), /DRAFT_EMPTY/);
});

test('parseJsonAnswer reads fenced, bare and wrapped JSON', () => {
  assert.deepEqual(parseJsonAnswer('notes\n```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(parseJsonAnswer('{"a":2}'), { a: 2 });
  assert.deepEqual(parseJsonAnswer('Here: {"a":3} done'), { a: 3 });
  assert.throws(() => parseJsonAnswer('no json'), /ANSWER_IS_NOT_JSON/);
});

test('operator brief carries the role, the task and the output schema', () => {
  for (const step of STEPS) {
    const t = readyCandidate();
    const brief = operatorBrief(step, stepInput(step, t), null);
    assert.match(brief, /OUTPUT CONTRACT/);
    assert.match(brief, /HP LANGUAGE — SEED v0/);
    assert.ok(brief.includes(JSON.stringify(SCHEMAS[step])));
  }
});

test('package is always draft:true, cites only used sources, and is blocked before READY', () => {
  const t = { ...readyCandidate(), state: 'READY', destination: { primary: 'ANALYSIS', derivatives: [], multi_format: false }, public_meta: { evidence_class: 'EDITORIAL', claim_ceiling: 'CONCEPTUAL', tags: ['network'] } };
  const pkg = buildPackage(t, { now: new Date('2026-10-06T00:00:00Z') });
  assert.ok(pkg.ok, pkg.problems.join());
  assert.match(pkg.content, /^---\n[\s\S]*\ndraft: true\n/);
  assert.match(pkg.content, /section: analysis\nevidenceClass: EDITORIAL/);
  assert.match(pkg.content, /- id: S1/);
  assert.doesNotMatch(pkg.content, /- id: S2/);
  assert.match(pkg.content, /## Kaynaklar/);
  assert.equal(pkg.relativePath, 'articles/2026-10-06-pas-aginin-merkezindeki-oyuncu-en-onemlisi-mi.md');
  assert.deepEqual(buildPackage({ ...t, state: 'DRAFT' }).problems, ['STATE_NOT_EXPORTABLE:DRAFT']);
  assert.ok(buildPackage({ ...t, public_meta: { evidence_class: null, claim_ceiling: '' } }).problems.includes('EVIDENCE_CLASS_MISSING'));
});
