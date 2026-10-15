// Publication gate (§30) and the deterministic checks behind it.
//
// Every check is computed from what is recorded on the topic. Nothing is
// inferred: an unverified source, an UNKNOWN confidence or a missing human
// attestation fails closed. The engine's own red-team verdicts are inputs, not
// overrides — a human-written draft can still pass without an engine.

import { normalizeText } from '../../lib/search.mjs';
import {
  evaluateClaimLedger, evaluateCriticalReview, evaluateSourceIndependence, evaluateTopicCard, liveClaims,
} from './contracts.mjs';

export const GATE_CHECKS = [
  'TOPIC_CARD',
  'SOURCE_TRACEABILITY',
  'CLAIM_LEDGER',
  'SOURCE_INDEPENDENCE',
  'CLAIM_DISCIPLINE',
  'COUNTEREVIDENCE',
  'COPYRIGHT_SAFETY',
  'HP_LANGUAGE',
  'ORIGINAL_VALUE',
  'HEADLINE_HONESTY',
  'CRITICAL_REVIEW',
];

// Phrases that mark generic AI / filler prose in Turkish and English. Matched on
// folded text, so "Günümüz futbolunda" and "gunumuz futbolunda" both hit.
// This is a floor, not a voice model: passing it does not make prose "HP".
export const CLICHE_PHRASES = [
  'gunumuz futbolunda', 'modern futbolun degisen dinamikleri', 'sonuc olarak sunu soyleyebiliriz',
  'kesinlikle', 'sunu belirtmek gerekir ki', 'unutulmamalidir ki', 'oyunun kurallarini degistirdi',
  'goz ardi edilmemeli', 'derinlemesine bir bakis', 'heyecan verici',
  'it is important to note', 'in todays fast-paced', 'game-changer', 'game changer', 'delve into',
  'in conclusion', 'a testament to', 'navigate the complexities', 'rich tapestry', 'unlock the potential',
];

const SHINGLE = 12;

function words(text) {
  return normalizeText(text).replace(/[^a-z0-9]+/g, ' ').split(' ').filter(Boolean);
}

// Long verbatim overlap with any source text. 12 consecutive folded words is
// well past incidental phrasing and short enough to catch copied sentences.
export function verbatimOverlaps(draft, sourceTexts, size = SHINGLE) {
  const draftWords = words(draft);
  if (draftWords.length < size) return [];
  const sourceShingles = new Set();
  for (const text of sourceTexts) {
    const w = words(text);
    for (let i = 0; i + size <= w.length; i += 1) sourceShingles.add(w.slice(i, i + size).join(' '));
  }
  const hits = [];
  for (let i = 0; i + size <= draftWords.length; i += 1) {
    const shingle = draftWords.slice(i, i + size).join(' ');
    if (sourceShingles.has(shingle)) {
      hits.push(shingle);
      i += size - 1;
    }
  }
  return hits;
}

export function clicheHits(text) {
  const folded = ` ${normalizeText(text).replace(/[^a-z0-9 -]/g, ' ')} `;
  return CLICHE_PHRASES.filter((phrase) => folded.includes(` ${phrase} `));
}

// Token-set Jaccard on folded text: used for duplicate and failure-memory
// warnings. A warning, never an automatic rejection.
export function similarity(a, b) {
  const sa = new Set(words(a).filter((t) => t.length > 2));
  const sb = new Set(words(b).filter((t) => t.length > 2));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter += 1;
  return inter / (sa.size + sb.size - inter);
}

export const SIMILARITY_WARN = 0.5;

const verdict = (pass, reasons) => ({ pass, reasons });
const filled = (value) => typeof value === 'string' && value.trim().length > 0;
const redTeam = (topic, check) => topic.red_team?.findings?.find((f) => f.check === check);

function sourceTraceability(topic) {
  const reasons = [];
  const sources = topic.research?.sources ?? [];
  const byId = new Map(sources.map((s) => [s.id, s]));
  if (sources.length === 0) reasons.push('NO_SOURCES');
  for (const s of sources) {
    if (!filled(s.url) && !filled(s.internal_ref)) reasons.push(`SOURCE_WITHOUT_LOCATOR:${s.id}`);
  }
  const claims = liveClaims(topic);
  if (claims.length === 0) reasons.push('NO_CLAIM_MAP');
  for (const [i, c] of claims.entries()) {
    const ids = c.source_ids ?? [];
    if (ids.length === 0) reasons.push(`CLAIM_WITHOUT_SOURCE:${i + 1}`);
    for (const id of ids) {
      const s = byId.get(id);
      if (!s) reasons.push(`CLAIM_CITES_MISSING_SOURCE:${i + 1}:${id}`);
      else if (!s.verified) reasons.push(`CLAIM_CITES_UNVERIFIED_SOURCE:${i + 1}:${id}`);
    }
  }
  if (!topic.attestations?.sources_checked) reasons.push('HUMAN_SOURCE_CHECK_MISSING');
  return verdict(reasons.length === 0, reasons);
}

function claimDiscipline(topic) {
  const reasons = [];
  for (const [i, c] of liveClaims(topic).entries()) {
    if (!filled(c.claim)) reasons.push(`EMPTY_CLAIM:${i + 1}`);
    if (!filled(c.evidence)) reasons.push(`CLAIM_WITHOUT_EVIDENCE:${i + 1}`);
    if (!c.confidence || c.confidence === 'UNKNOWN') reasons.push(`CLAIM_CONFIDENCE_UNKNOWN:${i + 1}`);
  }
  if (liveClaims(topic).length === 0) reasons.push('NO_CLAIM_MAP');
  const causation = redTeam(topic, 'DATA_TO_CAUSATION');
  if (causation?.verdict === 'FAIL') reasons.push('RED_TEAM:DATA_TO_CAUSATION');
  if (!topic.red_team?.ran_at) reasons.push('RED_TEAM_NOT_RUN');
  else if (topic.red_team.draft_version !== topic.draft?.version) reasons.push('RED_TEAM_STALE_DRAFT_CHANGED');
  const sample = redTeam(topic, 'SMALL_SAMPLE');
  if (sample?.verdict === 'FAIL') reasons.push('RED_TEAM:SMALL_SAMPLE');
  return verdict(reasons.length === 0, reasons);
}

function counterevidence(topic) {
  const reasons = [];
  const counterSource = (topic.research?.sources ?? []).some((s) => s.stance === 'COUNTER' || s.role === 'COUNTEREVIDENCE');
  const claims = liveClaims(topic);
  const everyClaimCountered = claims.length > 0 && claims.every((c) => filled(c.counterevidence));
  if (!counterSource && !everyClaimCountered) reasons.push('NO_COUNTEREVIDENCE');
  if (!filled(topic.outline?.counterargument)) reasons.push('OUTLINE_WITHOUT_COUNTERARGUMENT');
  return verdict(reasons.length === 0, reasons);
}

function copyrightSafety(topic) {
  const reasons = [];
  const texts = [topic.intake?.extracted_text, ...(topic.research?.sources ?? []).map((s) => s.excerpt)].filter(filled);
  const hits = verbatimOverlaps(topic.draft?.body_md ?? '', texts);
  if (hits.length > 0) reasons.push(`VERBATIM_OVERLAP:${hits.length}`);
  if (redTeam(topic, 'RETELLING')?.verdict === 'FAIL') reasons.push('RED_TEAM:RETELLING');
  return verdict(reasons.length === 0, reasons);
}

function hpLanguage(topic) {
  const reasons = [];
  const hits = clicheHits(`${topic.draft?.standfirst ?? ''} ${topic.draft?.body_md ?? ''}`);
  if (hits.length > 0) reasons.push(`CLICHE:${hits.join('|')}`);
  if (redTeam(topic, 'AI_CLICHE')?.verdict === 'FAIL') reasons.push('RED_TEAM:AI_CLICHE');
  if (!topic.attestations?.voice_checked) reasons.push('HUMAN_VOICE_CHECK_MISSING');
  return verdict(reasons.length === 0, reasons);
}

function originalValue(topic) {
  const reasons = [];
  if (!filled(topic.outline?.hp_angle)) reasons.push('NO_HP_ANGLE');
  const originality = topic.score?.ORIGINALITY;
  if (typeof originality !== 'number') reasons.push('ORIGINALITY_NOT_SCORED');
  else if (originality < 6) reasons.push(`ORIGINALITY_BELOW_6:${originality}`);
  if (redTeam(topic, 'HP_VALUE')?.verdict === 'FAIL') reasons.push('RED_TEAM:HP_VALUE');
  return verdict(reasons.length === 0, reasons);
}

function headlineHonesty(topic) {
  const reasons = [];
  const selected = topic.headlines?.find((h) => h.variant === topic.selected_headline);
  if (!selected) reasons.push('NO_SELECTED_HEADLINE');
  else if (topic.headlines_draft_version !== topic.draft?.version) reasons.push('HEADLINES_STALE_DRAFT_CHANGED');
  else {
    const s = selected.safety ?? {};
    if (s.answers !== true) reasons.push('ARTICLE_DOES_NOT_ANSWER_HEADLINE');
    if (s.stronger_than_evidence !== false) reasons.push('HEADLINE_STRONGER_THAN_EVIDENCE');
    if (s.misleading !== false) reasons.push('HEADLINE_MISLEADING');
  }
  if (redTeam(topic, 'HEADLINE_VS_TEXT')?.verdict === 'FAIL') reasons.push('RED_TEAM:HEADLINE_VS_TEXT');
  return verdict(reasons.length === 0, reasons);
}

const CHECKS = {
  TOPIC_CARD: evaluateTopicCard,
  SOURCE_TRACEABILITY: sourceTraceability,
  CLAIM_LEDGER: evaluateClaimLedger,
  SOURCE_INDEPENDENCE: evaluateSourceIndependence,
  CLAIM_DISCIPLINE: claimDiscipline,
  COUNTEREVIDENCE: counterevidence,
  COPYRIGHT_SAFETY: copyrightSafety,
  HP_LANGUAGE: hpLanguage,
  ORIGINAL_VALUE: originalValue,
  HEADLINE_HONESTY: headlineHonesty,
  CRITICAL_REVIEW: evaluateCriticalReview,
};

export function evaluateGate(topic) {
  const checks = {};
  for (const name of GATE_CHECKS) checks[name] = CHECKS[name](topic);
  if (!filled(topic.draft?.body_md)) checks.SOURCE_TRACEABILITY = verdict(false, ['NO_DRAFT', ...checks.SOURCE_TRACEABILITY.reasons]);
  const failed = GATE_CHECKS.filter((name) => !checks[name].pass);
  return { pass: failed.length === 0, failed, checks };
}
