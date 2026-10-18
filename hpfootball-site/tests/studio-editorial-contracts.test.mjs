// Editorial MVP contracts (spec v0.1 scope): topic card, claim ledger, source
// independence, critical review, human approval. Each test breaks exactly one
// thing on a candidate that otherwise passes the whole gate.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CLAIM_CLASSES, evaluateClaimLedger, evaluateCriticalReview, evaluateSourceIndependence, evaluateTopicCard, sourceOrigin,
} from '../src/studio/lib/contracts.mjs';
import { contentFingerprint, createApproval, evaluateApproval } from '../src/studio/lib/approval.mjs';
import { evaluateGate, GATE_CHECKS } from '../src/studio/lib/gate.mjs';
import { transition } from '../src/studio/lib/model.mjs';
import { applyStep, SCHEMAS } from '../src/studio/lib/engine.mjs';
import { buildPackage, exportProblems } from '../src/studio/lib/export.mjs';
import { readyCandidate } from './fixtures/studio-topic.mjs';

const now = new Date('2026-10-15T10:00:00Z');
const reasons = (v) => v.reasons;

test('the gate carries all five editorial contracts', () => {
  for (const name of ['TOPIC_CARD', 'CLAIM_LEDGER', 'SOURCE_INDEPENDENCE', 'CRITICAL_REVIEW']) assert.ok(GATE_CHECKS.includes(name), name);
  assert.deepEqual(evaluateGate(readyCandidate()).failed, []);
});

// --- Topic card ------------------------------------------------------------

test('topic card: every field the editor decides on is required', () => {
  assert.deepEqual(reasons(evaluateTopicCard(readyCandidate())), []);
  const t = readyCandidate();
  t.card.title = '(untitled)';
  t.card.one_line = '';
  t.card.why_now = ' ';
  t.card.content_type = null;
  t.card.evidence_level = 'UNKNOWN';
  t.research.core_question = '';
  t.destination.primary = null;
  assert.deepEqual(reasons(evaluateTopicCard(t)), [
    'CARD_TITLE_MISSING', 'CARD_ONE_LINE_MISSING', 'CARD_WHY_NOW_MISSING', 'CARD_CONTENT_TYPE_MISSING',
    'CARD_EVIDENCE_LEVEL_UNKNOWN', 'CARD_CORE_QUESTION_MISSING', 'CARD_DESTINATION_MISSING',
  ]);
  assert.ok(evaluateGate(t).failed.includes('TOPIC_CARD'));
});

// --- Claim ledger ----------------------------------------------------------

test('claim ledger: ids, epistemic class and status are mandatory', () => {
  assert.deepEqual(reasons(evaluateClaimLedger(readyCandidate())), []);
  const t = readyCandidate();
  t.claims = [{ ...t.claims[0], id: '', claim_class: 'UNKNOWN', status: 'MAYBE' }, { ...t.claims[0], id: 'C1' }, { ...t.claims[0], id: 'C1' }];
  const r = reasons(evaluateClaimLedger(t));
  assert.ok(r.includes('CLAIM_ID_MISSING:#1'), r.join());
  assert.ok(r.includes('CLAIM_CLASS_UNKNOWN:#1'), r.join());
  assert.ok(r.includes('CLAIM_STATUS_UNKNOWN:#1'), r.join());
  assert.ok(r.includes('CLAIM_ID_DUPLICATE:C1'), r.join());
  assert.deepEqual(reasons(evaluateClaimLedger({ ...readyCandidate(), claims: [] })), ['NO_CLAIM_LEDGER']);
});

test('claim ledger: confidence may not exceed the epistemic class ceiling', () => {
  assert.ok(CLAIM_CLASSES.includes('HYPOTHESIS'));
  const t = readyCandidate();
  t.claims[0] = { ...t.claims[0], claim_class: 'HYPOTHESIS', confidence: 'MEDIUM' };
  assert.deepEqual(reasons(evaluateClaimLedger(t)), ['CLAIM_CONFIDENCE_ABOVE_CLASS_CEILING:C1:HYPOTHESIS:MEDIUM>LOW']);
  t.claims[0].confidence = 'LOW';
  assert.deepEqual(reasons(evaluateClaimLedger(t)), []);
  const p = readyCandidate();
  p.claims[0] = { ...p.claims[0], claim_class: 'PROXY', confidence: 'HIGH' };
  assert.deepEqual(reasons(evaluateClaimLedger(p)), ['CLAIM_CONFIDENCE_ABOVE_CLASS_CEILING:C1:PROXY:HIGH>MEDIUM']);
});

test('claim ledger: the draft may only cite sources that back a live claim', () => {
  const t = readyCandidate();
  t.draft.body_md += ' Ayrıca karşı çalışma da var. [S2]';
  assert.deepEqual(reasons(evaluateClaimLedger(t)), ['DRAFT_CITES_SOURCE_OUTSIDE_LEDGER:S2']);
  const w = readyCandidate();
  w.claims[0].status = 'WITHDRAWN';
  const r = reasons(evaluateClaimLedger(w));
  assert.ok(r.includes('NO_LIVE_CLAIM'), r.join());
  assert.ok(r.includes('DRAFT_CITES_SOURCE_OUTSIDE_LEDGER:S1'), r.join());
});

test('claim ledger: withdrawn claims are not held to evidence rules but stay on record', () => {
  const t = readyCandidate();
  t.claims.push({ id: 'C2', claim: 'Eski güçlü iddia', evidence: '', source_ids: [], confidence: 'HIGH', claim_class: 'INTERPRETATION', status: 'WITHDRAWN', counterevidence: '' });
  assert.deepEqual(reasons(evaluateClaimLedger(t)), []);
  assert.deepEqual(evaluateGate(t).failed, []);
  assert.equal(t.claims.length, 2);
});

// --- Source independence ---------------------------------------------------

test('source independence: origin follows derived_from to the root and fails closed', () => {
  const t = readyCandidate();
  const byId = new Map(t.research.sources.map((s) => [s.id, s]));
  assert.equal(sourceOrigin(byId.get('S3'), byId).origin, 'uefa-2025-report');
  t.research.sources.find((s) => s.id === 'S1').independence_key = '';
  // Unknown origin cannot count as independent: the HIGH claim loses its second origin too.
  assert.deepEqual(reasons(evaluateSourceIndependence(t)), ['SOURCE_ORIGIN_UNKNOWN:S1', 'HIGH_CONFIDENCE_SINGLE_ORIGIN:C1:1']);
});

test('source independence: a HIGH claim needs two independent supporting origins', () => {
  const t = readyCandidate();
  // S3 is a media write-up of the same UEFA report as S1: two sources, one origin.
  t.claims[0].source_ids = ['S1', 'S3'];
  assert.deepEqual(reasons(evaluateSourceIndependence(t)), ['HIGH_CONFIDENCE_SINGLE_ORIGIN:C1:1']);
  t.claims[0].confidence = 'MEDIUM';
  assert.deepEqual(reasons(evaluateSourceIndependence(t)), []);
});

test('source independence: counter sources and unverified sources do not count as support', () => {
  const t = readyCandidate();
  t.claims[0].source_ids = ['S1', 'S2'];
  assert.deepEqual(reasons(evaluateSourceIndependence(t)), ['HIGH_CONFIDENCE_SINGLE_ORIGIN:C1:1']);
  const u = readyCandidate();
  u.research.sources.find((s) => s.id === 'S4').verified = false;
  assert.deepEqual(reasons(evaluateSourceIndependence(u)), ['HIGH_CONFIDENCE_SINGLE_ORIGIN:C1:1']);
});

test('source independence: derivation cycles and dangling parents are reported', () => {
  const t = readyCandidate();
  const s1 = t.research.sources.find((s) => s.id === 'S1');
  s1.derived_from = 'S3';
  assert.ok(reasons(evaluateSourceIndependence(t)).includes('SOURCE_DERIVATION_CYCLE:S1'));
  const d = readyCandidate();
  d.research.sources.find((s) => s.id === 'S4').derived_from = 'S9';
  assert.ok(reasons(evaluateSourceIndependence(d)).includes('SOURCE_DERIVED_FROM_MISSING:S4:S9'));
});

// --- Critical review -------------------------------------------------------

test('critical review: an empty red team no longer passes', () => {
  assert.deepEqual(reasons(evaluateCriticalReview(readyCandidate())), []);
  const t = readyCandidate();
  t.red_team.findings = [];
  const r = reasons(evaluateCriticalReview(t));
  assert.ok(r.includes('RED_TEAM_CHECK_MISSING:THESIS_PROVEN'), r.join());
  assert.ok(r.includes('RED_TEAM_CHECK_MISSING:AI_CLICHE'), r.join());
});

test('critical review: any FAIL blocks, WARN needs a human disposition for this red-team run', () => {
  const t = readyCandidate();
  t.red_team.findings.find((f) => f.check === 'JARGON').verdict = 'FAIL';
  assert.deepEqual(reasons(evaluateCriticalReview(t)), ['RED_TEAM_FAIL:JARGON']);

  const w = readyCandidate();
  w.red_team.findings.find((f) => f.check === 'MECHANISM').verdict = 'WARN';
  assert.deepEqual(reasons(evaluateCriticalReview(w)), ['WARN_WITHOUT_DISPOSITION:MECHANISM']);
  w.critical_review.dispositions.MECHANISM = { disposition: 'FIXED', note: 'Mekanizma paragrafı eklendi.', by: 'Hikmet', red_team_ran_at: 'older-run' };
  assert.deepEqual(reasons(evaluateCriticalReview(w)), ['WARN_WITHOUT_DISPOSITION:MECHANISM'], 'disposition from an older run does not count');
  w.critical_review.dispositions.MECHANISM.red_team_ran_at = w.red_team.ran_at;
  w.critical_review.dispositions.MECHANISM.note = '';
  assert.deepEqual(reasons(evaluateCriticalReview(w)), ['WARN_DISPOSITION_NOTE_MISSING:MECHANISM']);
  w.critical_review.dispositions.MECHANISM.note = 'Mekanizma paragrafı eklendi.';
  assert.deepEqual(reasons(evaluateCriticalReview(w)), []);
});

test('critical review: a named human sign-off bound to the current draft is required', () => {
  const t = readyCandidate();
  t.critical_review.sign_off = null;
  assert.deepEqual(reasons(evaluateCriticalReview(t)), ['HUMAN_CRITICAL_REVIEW_MISSING']);
  const s = readyCandidate();
  s.critical_review.sign_off.draft_version = 0;
  assert.deepEqual(reasons(evaluateCriticalReview(s)), ['HUMAN_CRITICAL_REVIEW_STALE']);
  const n = readyCandidate();
  n.critical_review.sign_off.reviewer = ' ';
  assert.deepEqual(reasons(evaluateCriticalReview(n)), ['HUMAN_CRITICAL_REVIEW_MISSING']);
});

// --- Human approval --------------------------------------------------------

test('human approval: APPROVED needs a named approver and a passing gate at that moment', () => {
  const t = { ...readyCandidate(), state: 'READY' };
  assert.equal(transition(t, 'APPROVED', { actor: 'HUMAN' }).error, 'HUMAN_APPROVAL_RECORD_REQUIRED');
  assert.equal(createApproval(t, { approver: '', now }).error, 'APPROVER_REQUIRED');
  const broken = { ...t, attestations: { voice_checked: false, sources_checked: true } };
  assert.match(createApproval(broken, { approver: 'Hikmet Pınarbaş', now }).error, /^GATE_FAILED:HP_LANGUAGE/);
  assert.equal(createApproval({ ...t, state: 'EDITORIAL_REVIEW' }, { approver: 'Hikmet Pınarbaş', now }).error, 'APPROVAL_REQUIRES_READY:EDITORIAL_REVIEW');

  const { approval } = createApproval(t, { approver: 'Hikmet Pınarbaş', note: 'Yayına uygun.', now });
  assert.equal(approval.fingerprint, contentFingerprint(t));
  const r = transition(t, 'APPROVED', { actor: 'HUMAN', approval, gate: evaluateGate(t) });
  assert.ok(r.ok, r.error);
  assert.equal(r.topic.approval.approver, 'Hikmet Pınarbaş');
  assert.equal(transition(t, 'APPROVED', { actor: 'ENGINE', approval, gate: evaluateGate(t) }).error, 'HUMAN_ONLY:APPROVED');
});

test('human approval: changing approved content invalidates the approval', () => {
  const t = { ...readyCandidate(), state: 'READY' };
  const { approval } = createApproval(t, { approver: 'Hikmet Pınarbaş', now });
  const approved = transition(t, 'APPROVED', { approval, gate: evaluateGate(t) }).topic;
  assert.deepEqual(evaluateApproval(approved).reasons, []);

  const edited = structuredClone(approved);
  edited.draft.body_md += ' Yeni cümle.';
  assert.ok(evaluateApproval(edited).reasons.includes('APPROVAL_STALE_CONTENT_CHANGED'));
  const reclaimed = structuredClone(approved);
  reclaimed.claims[0].confidence = 'LOW';
  assert.ok(evaluateApproval(reclaimed).reasons.includes('APPROVAL_STALE_CONTENT_CHANGED'));
  const unverified = structuredClone(approved);
  unverified.research.sources[0].verified = false;
  assert.ok(evaluateApproval(unverified).reasons.includes('GATE_NO_LONGER_PASSES'));

  const back = transition(approved, 'EDITORIAL_REVIEW', { note: 'yeniden açıldı' }).topic;
  assert.equal(back.approval, null, 'leaving APPROVED drops the approval');
});

test('human approval: PUBLISHED and the approved package require a valid approval', () => {
  const t = { ...readyCandidate(), state: 'READY' };
  const { approval } = createApproval(t, { approver: 'Hikmet Pınarbaş', now });
  const approved = { ...transition(t, 'APPROVED', { approval, gate: evaluateGate(t) }).topic, public_url: 'https://hpanalytic.com/x' };
  approved.public_meta = { evidence_class: 'EDITORIAL', claim_ceiling: 'CONCEPTUAL', tags: [] };

  assert.match(transition(approved, 'PUBLISHED').error, /^APPROVAL_INVALID/);
  assert.ok(transition(approved, 'PUBLISHED', { approvalCheck: evaluateApproval(approved) }).ok);

  const pkg = buildPackage(approved, { now });
  assert.ok(pkg.ok, pkg.problems?.join());
  assert.match(pkg.content, /\napprovedBy: "Hikmet Pınarbaş"\n/);
  assert.match(pkg.content, /\ndraft: true\n/);

  const stale = structuredClone(approved);
  stale.draft.standfirst = 'Değişti.';
  assert.ok(exportProblems(stale).includes('APPROVAL_STALE_CONTENT_CHANGED'));
  assert.match(transition(stale, 'PUBLISHED', { approvalCheck: evaluateApproval(stale) }).error, /APPROVAL_STALE_CONTENT_CHANGED/);
});

// --- Engine / operator path feeds the ledger --------------------------------

test('evidence step writes ledger ids, class and ACTIVE status; unknown class fails closed', () => {
  const props = SCHEMAS.evidence.properties.claims.items.properties;
  assert.deepEqual(props.claim_class.enum, CLAIM_CLASSES);
  let t = applyStep('research', readyCandidate(), { sources: [] });
  t = applyStep('evidence', t, {
    claims: [
      { claim: 'a', evidence: 'e', source_ids: ['S1'], confidence: 'MEDIUM', claim_class: 'INFERENCE' },
      { claim: 'b', evidence: 'e', source_ids: ['S1'], confidence: 'LOW', claim_class: 'GUESS' },
    ],
    thesis: 't',
  });
  assert.deepEqual(t.claims.map((c) => [c.id, c.claim_class, c.status]), [['C1', 'INFERENCE', 'ACTIVE'], ['C2', null, 'ACTIVE']]);
  assert.ok(evaluateClaimLedger(t).reasons.includes('CLAIM_CLASS_UNKNOWN:C2'));
});

test('engine-found sources never carry an origin key', () => {
  const t = applyStep('research', { ...readyCandidate(), research: { ...readyCandidate().research, sources: [] } }, {
    sources: [{ title: 'X', url: 'https://x.org', role: 'MEDIA', stance: 'SUPPORTS' }],
  });
  assert.equal(t.research.sources[0].independence_key, '');
  assert.equal(t.research.sources[0].derived_from, '');
});
