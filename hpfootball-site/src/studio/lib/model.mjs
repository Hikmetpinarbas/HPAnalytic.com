// HPAnalytic Editorial Studio — data/state model (P1).
//
// The Studio is a private working surface. Nothing here is public content and
// nothing here can publish: the furthest an automated actor (ENGINE) can move a
// topic is READY. APPROVED and PUBLISHED are human-only transitions.

export const STATES = [
  'IDEA',
  'DISCOVERED',
  'RESEARCHING',
  'SOURCE_READY',
  'EVIDENCE_READY',
  'OUTLINE',
  'DRAFTING',
  'DRAFT',
  'RED_TEAM',
  'EDITORIAL_REVIEW',
  'READY',
  'APPROVED',
  'PUBLISHED',
  'HOLD',
  'REJECTED',
];

// Forward path. HOLD and REJECTED are reachable from any non-terminal state;
// HOLD returns to the state it was parked from (see transition()).
const FORWARD = {
  IDEA: ['DISCOVERED', 'RESEARCHING'],
  DISCOVERED: ['RESEARCHING'],
  RESEARCHING: ['SOURCE_READY'],
  SOURCE_READY: ['EVIDENCE_READY', 'RESEARCHING'],
  EVIDENCE_READY: ['OUTLINE', 'RESEARCHING'],
  OUTLINE: ['DRAFTING', 'EVIDENCE_READY'],
  DRAFTING: ['DRAFT'],
  DRAFT: ['RED_TEAM', 'DRAFTING'],
  RED_TEAM: ['EDITORIAL_REVIEW', 'DRAFTING'],
  EDITORIAL_REVIEW: ['READY', 'DRAFTING', 'RESEARCHING'],
  READY: ['APPROVED', 'EDITORIAL_REVIEW'],
  APPROVED: ['PUBLISHED', 'EDITORIAL_REVIEW'],
  PUBLISHED: [],
  HOLD: [],
  REJECTED: [],
};

export const HUMAN_ONLY_TARGETS = new Set(['APPROVED', 'PUBLISHED']);
const TERMINAL = new Set(['PUBLISHED', 'REJECTED']);

// UI columns. Not a kanban of equal buckets: each column is a stage of the
// editorial line, and the states inside it are shown as the topic's position.
export const COLUMNS = [
  { key: 'inbox', label: 'TOPIC INBOX', states: ['IDEA', 'DISCOVERED'] },
  { key: 'research', label: 'RESEARCHING', states: ['RESEARCHING', 'SOURCE_READY', 'EVIDENCE_READY'] },
  { key: 'drafting', label: 'DRAFTING', states: ['OUTLINE', 'DRAFTING', 'DRAFT'] },
  { key: 'review', label: 'EDITORIAL REVIEW', states: ['RED_TEAM', 'EDITORIAL_REVIEW'] },
  { key: 'ready', label: 'READY', states: ['READY', 'APPROVED'] },
  { key: 'published', label: 'PUBLISHED', states: ['PUBLISHED'] },
];

export function columnOf(state) {
  return COLUMNS.find((c) => c.states.includes(state))?.key ?? 'parked';
}

// Public publication layers (Ops ledger: canonical public architecture).
// `collection` is where an accepted piece would land in the Astro site. `blog`
// has no collection yet (route inventory V1: MISSING), so its exports stay in
// the outbox until the collection exists.
export const DESTINATIONS = {
  BLOG: { collection: null, section: null, route: '/blog' },
  ANALYSIS: { collection: 'articles', section: 'analysis', route: '/analysis' },
  RESEARCH: { collection: 'research', section: null, route: '/research' },
  SCOUTING: { collection: 'articles', section: 'scouting', route: '/scouting' },
  CULTURE: { collection: 'articles', section: 'culture', route: '/culture' },
  VISUAL: { collection: 'visuals', section: null, route: '/visual' },
};

export const DERIVATIVES = ['X_POST', 'X_THREAD', 'INSTAGRAM_CAROUSEL', 'REELS_SCRIPT', 'YOUTUBE_SHORTS_SCRIPT', 'TV_TALKING_POINTS'];

// §8 topic discovery categories.
export const TOPIC_KINDS = [
  'CONTRADICTION', 'MISUNDERSTOOD_METRIC', 'TACTICAL_MECHANISM', 'SCOUTING_PROBLEM',
  'TRANSFER_QUESTION', 'ROLE_FIT', 'COACHING_IDEA', 'DATA_VS_EYE', 'MEDIA_MYTH',
  'ACADEMIC_FINDING', 'REPORT_FINDING', 'COUNTERINTUITIVE_RESULT', 'HISTORICAL_CONNECTION',
  'BOOK_IDEA', 'MATCH_PATTERN', 'PLAYER_DEVELOPMENT', 'SQUAD_BUILDING', 'RECRUITMENT',
  'FOOTBALL_CULTURE',
];

// §22 source hierarchy.
export const SOURCE_ROLES = ['PRIMARY', 'SECONDARY', 'ACADEMIC', 'INSTITUTIONAL', 'TECHNICAL', 'MEDIA', 'OPINION', 'INTERNAL', 'COUNTEREVIDENCE'];
export const SOURCE_STANCES = ['SUPPORTS', 'COUNTER', 'CONTEXT', 'METHOD'];
export const CONFIDENCE = ['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'];
export const EVIDENCE_LEVELS = ['STRONG', 'MODERATE', 'WEAK', 'UNKNOWN'];

// §35 failure memory reasons.
export const FAILURE_REASONS = ['DUPLICATE', 'WEAK_EVIDENCE', 'BAD_SOURCE', 'NO_HP_ANGLE', 'COPYRIGHT_ISSUE', 'OUTDATED', 'TOO_GENERIC', 'NO_READER_VALUE'];

// §29 editorial score dimensions (0–10 each).
export const SCORE_DIMENSIONS = ['ORIGINALITY', 'EVIDENCE', 'MECHANISM', 'CLARITY', 'READABILITY', 'HP_VOICE', 'HEADLINE', 'READER_VALUE', 'VISUAL_POTENTIAL', 'SOURCE_QUALITY'];

export const HEADLINE_VARIANTS = {
  A: 'STRAIGHT / EDITORIAL',
  B: 'QUESTION',
  C: 'CONTRARIAN',
  D: 'EVIDENCE-LED',
  E: 'HIGH-CURIOSITY',
};

export const ACTORS = ['HUMAN', 'ENGINE'];

// Independent-review checks. Every one must be answered on the current draft
// (contracts.mjs#evaluateCriticalReview); engine.mjs asks for exactly these.
export const RED_TEAM_CHECKS = [
  'THESIS_PROVEN', 'MECHANISM', 'DATA_TO_CAUSATION', 'SMALL_SAMPLE', 'COUNTEREVIDENCE',
  'SOURCE_QUALITY', 'RETELLING', 'HP_VALUE', 'HEADLINE_VS_TEXT', 'JARGON', 'AI_CLICHE',
];

// Mirrors the articles collection schema (src/content.config.ts).
export const EVIDENCE_CLASSES = ['DIRECT', 'DERIVED', 'PROXY', 'EDITORIAL'];

const pad = (n) => String(n).padStart(2, '0');

export function newTopicId(now = new Date(), random = Math.random) {
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}`;
  const suffix = Math.floor(random() * 36 ** 4).toString(36).padStart(4, '0');
  return `ET-${stamp}-${suffix}`;
}

export function createTopic({ kind = 'IDEA', raw = '', url = null, fileName = null, foundry = null, now = new Date(), id } = {}) {
  const at = now.toISOString();
  const text = String(raw ?? '').trim();
  return {
    schema: 'HP_EDITORIAL_TOPIC_V1',
    id: id ?? newTopicId(now),
    created_at: at,
    updated_at: at,
    state: 'IDEA',
    parked_from: null,
    intake: {
      kind,
      raw: text,
      url,
      file_name: fileName,
      foundry_id: foundry?.id ?? null,
      foundry: foundry ? {
        type: foundry.type ?? null,
        provenance: foundry.provenance ?? null,
        source_lead: foundry.source_lead ?? null,
        claim_ceiling: foundry.claim_ceiling ?? null,
      } : null,
      extracted_title: null,
      extracted_text: null,
      warnings: [],
    },
    card: {
      title: text ? text.slice(0, 140) : '(untitled)',
      one_line: '',
      why_now: '',
      source_origin: kind === 'FOUNDRY' ? `CONTENT FOUNDRY ${foundry?.id ?? ''}`.trim() : kind,
      content_type: null,
      evidence_level: 'UNKNOWN',
      originality: null,
      hp_fit: null,
      reader_value: null,
      visual_potential: null,
      next_action: 'CLASSIFY',
    },
    destination: { primary: null, derivatives: [], multi_format: false },
    research: {
      core_question: '',
      working_thesis: '',
      sources: [],
      match_examples: [],
      data_needed: [],
      open_questions: [],
      plan: [],
    },
    claims: [], // claim ledger: { id, claim, claim_class, status, confidence, evidence, source_ids, counterevidence, interpretation }
    outline: { question: '', thesis: '', structure: [], mechanism: '', counterargument: '', limitations: '', hp_angle: '' },
    headlines: [],
    selected_headline: null,
    headlines_draft_version: null,
    draft: { standfirst: '', body_md: '', version: 0, updated_at: null, origin: null },
    red_team: { findings: [], ran_at: null, origin: null },
    // Human side of the critical review: answers to red-team WARNs and a named
    // sign-off on the current draft (contracts.mjs#evaluateCriticalReview).
    critical_review: { dispositions: {}, sign_off: null },
    approval: null,
    score: {},
    attestations: { voice_checked: false, sources_checked: false },
    derivatives: {},
    // Public metadata the site schema needs. Set by a human: the Studio does not
    // decide a piece's evidence class or claim ceiling.
    public_meta: { evidence_class: null, claim_ceiling: '', tags: [] },
    export: null,
    public_url: null,
    history: [],
  };
}

// Pure transition. Returns { ok, topic, error }. Never mutates the input.
export function transition(topic, to, { actor = 'HUMAN', note = '', now = new Date(), gate, approval, approvalCheck } = {}) {
  const from = topic.state;
  const fail = (error) => ({ ok: false, topic, error });

  if (!STATES.includes(to)) return fail(`UNKNOWN_STATE:${to}`);
  if (!ACTORS.includes(actor)) return fail(`UNKNOWN_ACTOR:${actor}`);
  if (TERMINAL.has(from)) return fail(`TERMINAL_STATE:${from}`);
  if (HUMAN_ONLY_TARGETS.has(to) && actor !== 'HUMAN') return fail(`HUMAN_ONLY:${to}`);

  let allowed;
  if (to === 'HOLD' || to === 'REJECTED') allowed = from !== to;
  else if (from === 'HOLD') allowed = to === topic.parked_from;
  else allowed = FORWARD[from]?.includes(to) ?? false;
  if (!allowed) return fail(`ILLEGAL_TRANSITION:${from}->${to}`);

  if (to === 'APPROVED') {
    // A human approval is a record built by approval.mjs#createApproval, bound
    // to the draft version it was given for.
    if (!approval?.approver || !approval.fingerprint) return fail('HUMAN_APPROVAL_RECORD_REQUIRED');
    if (approval.draft_version !== topic.draft?.version) return fail('HUMAN_APPROVAL_RECORD_STALE');
  }
  if (to === 'READY' || to === 'APPROVED') {
    if (!gate) return fail('GATE_REQUIRED');
    if (!gate.pass) return fail(`GATE_FAILED:${gate.failed.join(',')}`);
  }
  if (to === 'PUBLISHED' && !topic.public_url) return fail('PUBLIC_URL_REQUIRED');
  if (to === 'PUBLISHED' && !approvalCheck?.valid) return fail(`APPROVAL_INVALID:${(approvalCheck?.reasons ?? ['NOT_CHECKED']).join(',')}`);
  if (to === 'REJECTED' && !note) return fail('REJECTION_REASON_REQUIRED');

  const at = now.toISOString();
  const next = {
    ...topic,
    state: to,
    parked_from: to === 'HOLD' ? from : from === 'HOLD' ? null : topic.parked_from,
    // Leaving APPROVED (except into PUBLISHED) drops the approval: re-approve.
    approval: to === 'APPROVED' ? approval : from === 'APPROVED' && to !== 'PUBLISHED' ? null : topic.approval ?? null,
    updated_at: at,
    history: [...topic.history, { at, from, to, actor, note }],
  };
  return { ok: true, topic: next, error: null };
}

// Shortest forward path (excluding HOLD/REJECTED) from the current state to
// `target`, e.g. DISCOVERED → [RESEARCHING, SOURCE_READY]. [] if unreachable.
export function forwardPath(from, target) {
  if (from === target) return [];
  const queue = [[from, []]];
  const seen = new Set([from]);
  while (queue.length) {
    const [state, trail] = queue.shift();
    for (const next of FORWARD[state] ?? []) {
      if (seen.has(next)) continue;
      const nextTrail = [...trail, next];
      if (next === target) return nextTrail;
      seen.add(next);
      queue.push([next, nextTrail]);
    }
  }
  return [];
}

// Moves forward along forwardPath, one legal transition at a time. Stops (and
// reports) at the first refusal, e.g. a READY gate failure.
export function advance(topic, target, options = {}) {
  let current = topic;
  for (const step of forwardPath(topic.state, target)) {
    const result = transition(current, step, options);
    if (!result.ok) return { ok: false, topic: current, error: result.error };
    current = result.topic;
  }
  return { ok: current.state === target, topic: current, error: current.state === target ? null : `UNREACHABLE:${topic.state}->${target}` };
}

export function allowedTargets(topic) {
  if (TERMINAL.has(topic.state)) return [];
  const forward = topic.state === 'HOLD' ? [topic.parked_from].filter(Boolean) : FORWARD[topic.state] ?? [];
  return [...forward, ...(topic.state === 'HOLD' ? [] : ['HOLD']), 'REJECTED'];
}

export function slugify(value) {
  return String(value ?? '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[ışğçöüâîû]/g, (ch) => ({ ı: 'i', ş: 's', ğ: 'g', ç: 'c', ö: 'o', ü: 'u', â: 'a', î: 'i', û: 'u' })[ch])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'untitled';
}
