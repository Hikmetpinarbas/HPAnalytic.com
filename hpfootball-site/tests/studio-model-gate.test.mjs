import test from 'node:test';
import assert from 'node:assert/strict';
import { advance, allowedTargets, createTopic, forwardPath, transition, columnOf, slugify } from '../src/studio/lib/model.mjs';
import { evaluateGate, verbatimOverlaps, clicheHits, similarity } from '../src/studio/lib/gate.mjs';
import { createApproval } from '../src/studio/lib/approval.mjs';
import { readyCandidate } from './fixtures/studio-topic.mjs';

const now = new Date('2026-10-06T12:00:00Z');

test('engine can never approve or publish', () => {
  const t = { ...readyCandidate(), state: 'READY' };
  assert.equal(transition(t, 'APPROVED', { actor: 'ENGINE' }).error, 'HUMAN_ONLY:APPROVED');
  assert.equal(transition({ ...t, state: 'APPROVED', public_url: 'https://hpanalytic.com/x' }, 'PUBLISHED', { actor: 'ENGINE' }).error, 'HUMAN_ONLY:PUBLISHED');
  assert.equal(transition(t, 'APPROVED', { actor: 'HUMAN' }).error, 'HUMAN_APPROVAL_RECORD_REQUIRED');
  const { approval } = createApproval(t, { approver: 'Hikmet Pınarbaş' });
  assert.ok(transition(t, 'APPROVED', { actor: 'HUMAN', approval, gate: evaluateGate(t) }).ok);
});

test('READY requires a passing gate; PUBLISHED requires a public URL', () => {
  const t = readyCandidate();
  assert.equal(transition(t, 'READY').error, 'GATE_REQUIRED');
  assert.ok(transition(t, 'READY', { gate: evaluateGate(t) }).ok);
  const bad = { ...t, attestations: { voice_checked: false, sources_checked: true } };
  assert.match(transition(bad, 'READY', { gate: evaluateGate(bad) }).error, /^GATE_FAILED:HP_LANGUAGE/);
  assert.equal(transition({ ...t, state: 'APPROVED' }, 'PUBLISHED').error, 'PUBLIC_URL_REQUIRED');
});

test('illegal jumps, terminal states, HOLD round-trip and rejection reason', () => {
  const t = createTopic({ now, id: 'ET-20261006-aaaa' });
  assert.equal(transition(t, 'DRAFT').error, 'ILLEGAL_TRANSITION:IDEA->DRAFT');
  const held = transition(t, 'HOLD').topic;
  assert.equal(held.parked_from, 'IDEA');
  assert.deepEqual(allowedTargets(held), ['IDEA', 'REJECTED']);
  assert.equal(transition(held, 'IDEA').topic.state, 'IDEA');
  assert.equal(transition(t, 'REJECTED').error, 'REJECTION_REASON_REQUIRED');
  const rejected = transition(t, 'REJECTED', { note: 'TOO_GENERIC' }).topic;
  assert.equal(transition(rejected, 'IDEA').error, 'TERMINAL_STATE:REJECTED');
  assert.equal(t.state, 'IDEA', 'transition must not mutate its input');
});

test('advance walks the editorial line and records every step', () => {
  assert.deepEqual(forwardPath('IDEA', 'SOURCE_READY'), ['RESEARCHING', 'SOURCE_READY']);
  const r = advance(createTopic({ now, id: 'ET-20261006-bbbb' }), 'DRAFT', { actor: 'ENGINE' });
  assert.ok(r.ok);
  assert.deepEqual(r.topic.history.map((h) => h.to), ['RESEARCHING', 'SOURCE_READY', 'EVIDENCE_READY', 'OUTLINE', 'DRAFTING', 'DRAFT']);
  const blocked = advance({ ...readyCandidate(), attestations: {} }, 'READY', { actor: 'ENGINE' });
  assert.equal(blocked.ok, false);
  assert.equal(columnOf('APPROVED'), 'ready');
});

test('gate passes the complete candidate', () => {
  const g = evaluateGate(readyCandidate());
  assert.deepEqual(g.failed, []);
});

test('SOURCE_TRACEABILITY fails on unverified, missing or uncited sources', () => {
  const t = readyCandidate();
  t.research.sources[0].verified = false;
  assert.ok(evaluateGate(t).checks.SOURCE_TRACEABILITY.reasons.includes('CLAIM_CITES_UNVERIFIED_SOURCE:1:S1'));
  const u = readyCandidate();
  u.claims[0].source_ids = ['S9'];
  assert.ok(evaluateGate(u).checks.SOURCE_TRACEABILITY.reasons.includes('CLAIM_CITES_MISSING_SOURCE:1:S9'));
  const v = readyCandidate();
  v.attestations.sources_checked = false;
  assert.equal(evaluateGate(v).checks.SOURCE_TRACEABILITY.pass, false);
});

test('CLAIM_DISCIPLINE fails on UNKNOWN confidence, causal leap, or a stale red team', () => {
  const t = readyCandidate();
  t.claims[0].confidence = 'UNKNOWN';
  assert.equal(evaluateGate(t).checks.CLAIM_DISCIPLINE.pass, false);
  const c = readyCandidate();
  c.red_team.findings = [{ check: 'DATA_TO_CAUSATION', verdict: 'FAIL', note: '' }];
  assert.ok(evaluateGate(c).checks.CLAIM_DISCIPLINE.reasons.includes('RED_TEAM:DATA_TO_CAUSATION'));
  const s = readyCandidate();
  s.draft.version = 2;
  assert.ok(evaluateGate(s).checks.CLAIM_DISCIPLINE.reasons.includes('RED_TEAM_STALE_DRAFT_CHANGED'));
  assert.ok(evaluateGate(s).checks.HEADLINE_HONESTY.reasons.includes('HEADLINES_STALE_DRAFT_CHANGED'));
});

test('COUNTEREVIDENCE requires a counter source or per-claim counterevidence', () => {
  const t = readyCandidate();
  t.research.sources[1].stance = 'CONTEXT';
  t.research.sources[1].role = 'MEDIA';
  assert.equal(evaluateGate(t).checks.COUNTEREVIDENCE.pass, true, 'per-claim counterevidence suffices');
  t.claims[0].counterevidence = '';
  assert.equal(evaluateGate(t).checks.COUNTEREVIDENCE.pass, false);
});

test('COPYRIGHT_SAFETY catches 12-word verbatim reuse, Turkish-fold insensitive', () => {
  const source = 'Bu analiz pres yoğunluğunun takımın top kazanma bölgesini nasıl yukarı taşıdığını açıkça gösteriyor ve sonucu değiştiriyor.';
  const t = readyCandidate();
  t.research.sources[0].excerpt = source;
  t.draft.body_md = `Giriş. ${source.toUpperCase()} Son.`;
  assert.equal(evaluateGate(t).checks.COPYRIGHT_SAFETY.pass, false);
  assert.equal(verbatimOverlaps('kısa metin', [source]).length, 0);
});

test('HP_LANGUAGE flags generic AI phrasing and needs a human voice check', () => {
  assert.deepEqual(clicheHits('Günümüz futbolunda her şey değişti. Kesinlikle.'), ['gunumuz futbolunda', 'kesinlikle']);
  const t = readyCandidate();
  t.draft.body_md += ' Günümüz futbolunda bu böyle.';
  assert.equal(evaluateGate(t).checks.HP_LANGUAGE.pass, false);
});

test('ORIGINAL_VALUE and HEADLINE_HONESTY fail closed', () => {
  const t = readyCandidate();
  delete t.score.ORIGINALITY;
  assert.ok(evaluateGate(t).checks.ORIGINAL_VALUE.reasons.includes('ORIGINALITY_NOT_SCORED'));
  const h = readyCandidate();
  h.headlines[0].safety.stronger_than_evidence = true;
  assert.equal(evaluateGate(h).checks.HEADLINE_HONESTY.pass, false);
});

test('similarity and slug helpers are Turkish-aware', () => {
  assert.ok(similarity('Pas ağı merkeziliği oyuncu önemini ölçer mi', 'pas agi merkeziligi oyuncu onemini olcer mi?') > 0.9);
  assert.equal(slugify('Pas ağının merkezindeki oyuncu en önemlisi mi?'), 'pas-aginin-merkezindeki-oyuncu-en-onemlisi-mi');
});
