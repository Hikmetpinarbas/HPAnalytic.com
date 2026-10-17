// Editorial MVP contracts (editorial spec v0.1 scope): topic card, claim ledger,
// source independence and critical review. Human approval lives in approval.mjs
// because it needs the whole gate.
//
// Same rules as gate.mjs: computed only from what is recorded on the topic,
// fail closed, never inferred. Each function returns { pass, reasons }.

import { CONFIDENCE, RED_TEAM_CHECKS, TOPIC_KINDS } from './model.mjs';

// Epistemic classes a claim can carry (HP knowledge taxonomy). UNKNOWN is not a
// class: a claim whose class nobody decided does not enter the ledger.
export const CLAIM_CLASSES = [
  'FACT', 'DIRECT_OBSERVATION', 'DERIVED_OBSERVATION', 'PROXY',
  'INFERENCE', 'MODEL_OUTPUT', 'INTERPRETATION', 'HYPOTHESIS',
];

// Highest confidence a class may be stated with. A proxy or an inference can be
// well supported, but it is never stated as certain; a hypothesis stays LOW
// until it is tested and reclassified.
export const CONFIDENCE_CEILING = {
  FACT: 'HIGH',
  DIRECT_OBSERVATION: 'HIGH',
  DERIVED_OBSERVATION: 'HIGH',
  PROXY: 'MEDIUM',
  INFERENCE: 'MEDIUM',
  MODEL_OUTPUT: 'MEDIUM',
  INTERPRETATION: 'MEDIUM',
  HYPOTHESIS: 'LOW',
};

// Ledger status. DOWNGRADED / NARROWED record that a claim was weakened after
// review (claim ceiling actions); WITHDRAWN keeps it on record but out of the text.
export const CLAIM_STATUSES = ['ACTIVE', 'DOWNGRADED', 'NARROWED', 'WITHDRAWN'];

// A HIGH-confidence claim needs this many independent supporting origins.
export const MIN_ORIGINS_FOR_HIGH = 2;

// Human answers to a red-team WARN. FAIL has no disposition: fix, re-run.
export const REVIEW_DISPOSITIONS = ['FIXED', 'ACCEPTED_WITH_NOTE', 'DISPUTED'];

const RANK = { UNKNOWN: 0, LOW: 1, MEDIUM: 2, HIGH: 3 };
const filled = (value) => typeof value === 'string' && value.trim().length > 0;
const verdict = (reasons) => ({ pass: reasons.length === 0, reasons });
const label = (claim, i) => (filled(claim.id) ? claim.id : `#${i + 1}`);

export const isLive = (claim) => claim.status !== 'WITHDRAWN';
export const liveClaims = (topic) => (topic.claims ?? []).filter(isLive);
export const citedSourceIds = (body) => new Set([...String(body ?? '').matchAll(/\[(S\d+)\]/g)].map((m) => m[1]));
const isSupporting = (s) => s.stance !== 'COUNTER' && s.role !== 'COUNTEREVIDENCE';

// --- Topic card ------------------------------------------------------------

export function evaluateTopicCard(topic) {
  const card = topic.card ?? {};
  const reasons = [];
  if (!filled(card.title) || card.title === '(untitled)') reasons.push('CARD_TITLE_MISSING');
  if (!filled(card.one_line)) reasons.push('CARD_ONE_LINE_MISSING');
  if (!filled(card.why_now)) reasons.push('CARD_WHY_NOW_MISSING');
  if (!TOPIC_KINDS.includes(card.content_type)) reasons.push('CARD_CONTENT_TYPE_MISSING');
  if (!card.evidence_level || card.evidence_level === 'UNKNOWN') reasons.push('CARD_EVIDENCE_LEVEL_UNKNOWN');
  if (!filled(topic.research?.core_question)) reasons.push('CARD_CORE_QUESTION_MISSING');
  if (!filled(topic.destination?.primary)) reasons.push('CARD_DESTINATION_MISSING');
  return verdict(reasons);
}

// --- Claim ledger ----------------------------------------------------------

export function evaluateClaimLedger(topic) {
  const claims = topic.claims ?? [];
  if (claims.length === 0) return verdict(['NO_CLAIM_LEDGER']);
  const reasons = [];
  const seen = new Set();
  for (const [i, c] of claims.entries()) {
    const id = label(c, i);
    if (!filled(c.id)) reasons.push(`CLAIM_ID_MISSING:${id}`);
    else if (seen.has(c.id)) reasons.push(`CLAIM_ID_DUPLICATE:${c.id}`);
    else seen.add(c.id);
    if (!CLAIM_STATUSES.includes(c.status)) reasons.push(`CLAIM_STATUS_UNKNOWN:${id}`);
    if (!isLive(c)) continue;
    if (!CLAIM_CLASSES.includes(c.claim_class)) reasons.push(`CLAIM_CLASS_UNKNOWN:${id}`);
    else if (CONFIDENCE.includes(c.confidence) && RANK[c.confidence] > RANK[CONFIDENCE_CEILING[c.claim_class]]) {
      reasons.push(`CLAIM_CONFIDENCE_ABOVE_CLASS_CEILING:${id}:${c.claim_class}:${c.confidence}>${CONFIDENCE_CEILING[c.claim_class]}`);
    }
  }
  const live = liveClaims(topic);
  if (live.length === 0) reasons.push('NO_LIVE_CLAIM');
  // Every [Sx] in the text must back a live claim; otherwise the prose asserts
  // something the ledger does not hold.
  const backed = new Set(live.flatMap((c) => c.source_ids ?? []));
  for (const sid of citedSourceIds(topic.draft?.body_md)) {
    if (!backed.has(sid)) reasons.push(`DRAFT_CITES_SOURCE_OUTSIDE_LEDGER:${sid}`);
  }
  return verdict(reasons);
}

// --- Source independence ---------------------------------------------------

// Where a source's evidence was originally produced. A source derived from
// another (a news piece on a paper, a thread on a report) inherits the root's
// origin, so restating the same evidence never counts twice.
export function sourceOrigin(source, byId) {
  const seen = new Set();
  let current = source;
  while (filled(current.derived_from)) {
    if (seen.has(current.id)) return { origin: null, problem: `SOURCE_DERIVATION_CYCLE:${source.id}` };
    seen.add(current.id);
    const parent = byId.get(current.derived_from);
    if (!parent) return { origin: null, problem: `SOURCE_DERIVED_FROM_MISSING:${current.id}:${current.derived_from}` };
    current = parent;
  }
  return filled(current.independence_key)
    ? { origin: current.independence_key.trim().toLowerCase(), problem: null }
    : { origin: null, problem: `SOURCE_ORIGIN_UNKNOWN:${current.id}` };
}

export function supportingOrigins(topic, claim) {
  const byId = new Map((topic.research?.sources ?? []).map((s) => [s.id, s]));
  const origins = new Set();
  for (const sid of claim.source_ids ?? []) {
    const s = byId.get(sid);
    if (!s || !s.verified || !isSupporting(s)) continue;
    const { origin } = sourceOrigin(s, byId);
    if (origin) origins.add(origin);
  }
  return origins;
}

export function evaluateSourceIndependence(topic) {
  const byId = new Map((topic.research?.sources ?? []).map((s) => [s.id, s]));
  const problems = new Set();
  const high = [];
  for (const [i, c] of (topic.claims ?? []).entries()) {
    if (!isLive(c)) continue;
    for (const sid of c.source_ids ?? []) {
      const s = byId.get(sid);
      if (!s) continue; // SOURCE_TRACEABILITY reports missing sources
      const { problem } = sourceOrigin(s, byId);
      if (problem) problems.add(problem);
    }
    if (c.confidence === 'HIGH') {
      const n = supportingOrigins(topic, c).size;
      if (n < MIN_ORIGINS_FOR_HIGH) high.push(`HIGH_CONFIDENCE_SINGLE_ORIGIN:${label(c, i)}:${n}`);
    }
  }
  return verdict([...problems, ...high]);
}

// --- Critical review -------------------------------------------------------

export function evaluateCriticalReview(topic) {
  const reasons = [];
  const rt = topic.red_team ?? {};
  const review = topic.critical_review ?? {};
  if (!rt.ran_at) reasons.push('RED_TEAM_NOT_RUN');
  else {
    if (rt.draft_version !== topic.draft?.version) reasons.push('RED_TEAM_STALE_DRAFT_CHANGED');
    const findings = new Map((rt.findings ?? []).map((f) => [f.check, f]));
    // An absent check is an unreviewed risk, not a pass.
    for (const check of RED_TEAM_CHECKS) if (!findings.has(check)) reasons.push(`RED_TEAM_CHECK_MISSING:${check}`);
    for (const check of RED_TEAM_CHECKS) {
      const f = findings.get(check);
      if (f?.verdict === 'FAIL') reasons.push(`RED_TEAM_FAIL:${check}`);
      if (f?.verdict !== 'WARN') continue;
      const d = review.dispositions?.[check];
      if (!d || d.red_team_ran_at !== rt.ran_at || !REVIEW_DISPOSITIONS.includes(d.disposition)) reasons.push(`WARN_WITHOUT_DISPOSITION:${check}`);
      else if (!filled(d.note)) reasons.push(`WARN_DISPOSITION_NOTE_MISSING:${check}`);
    }
  }
  const sign = review.sign_off;
  if (!sign || !filled(sign.reviewer) || !filled(sign.note)) reasons.push('HUMAN_CRITICAL_REVIEW_MISSING');
  else if (sign.draft_version !== topic.draft?.version) reasons.push('HUMAN_CRITICAL_REVIEW_STALE');
  return verdict(reasons);
}
