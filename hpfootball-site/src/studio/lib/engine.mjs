// Studio engine: the steps that turn an intake into a READY candidate.
//
// Two ways to run every step, sharing ONE validation/apply path:
//   1. ENGINE   — Claude API call from the local Studio server.
//   2. OPERATOR — no credentials (or Hikmet prefers another AI): the Studio shows
//      a copy-ready brief for the step; the JSON answer is pasted back and goes
//      through the same applyStep() validation.
// Neither path can move a topic past READY or mark a source as verified.

import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  CONFIDENCE, DERIVATIVES, RED_TEAM_CHECKS, DESTINATIONS, EVIDENCE_LEVELS, HEADLINE_VARIANTS, SCORE_DIMENSIONS,
  SOURCE_ROLES, SOURCE_STANCES, TOPIC_KINDS,
} from './model.mjs';
import { ROLES, systemPrompt } from './prompts.mjs';
import { CLAIM_CLASSES, CONFIDENCE_CEILING } from './contracts.mjs';

export const MODEL = 'claude-opus-5-5';

export const STEPS = ['classify', 'research', 'evidence', 'draft', 'headlines', 'redteam'];

export { RED_TEAM_CHECKS };

// ---------------------------------------------------------------------------
// JSON schemas (structured outputs require every property listed in `required`
// and additionalProperties:false).

const str = { type: 'string' };
const int = { type: 'integer' };
const bool = { type: 'boolean' };
const arr = (items) => ({ type: 'array', items });
const en = (values) => ({ type: 'string', enum: values });
const obj = (properties) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });

const SCORE = obj(Object.fromEntries(SCORE_DIMENSIONS.map((d) => [d, int])));

export const SCHEMAS = {
  classify: obj({
    title: str,
    one_line: str,
    why_now: str,
    content_type: en(TOPIC_KINDS),
    evidence_level: en(EVIDENCE_LEVELS),
    originality: int,
    hp_fit: int,
    reader_value: int,
    visual_potential: int,
    next_action: str,
    destination: en(Object.keys(DESTINATIONS)),
    derivatives: arr(en(DERIVATIVES)),
    core_question: str,
    working_thesis: str,
    what_is_this: str,
    what_is_useful: str,
    possible_articles: arr(str),
    duplicate_of: str,
  }),
  research: obj({
    sources: arr(obj({
      title: str, url: str, publisher: str, year: str,
      role: en(SOURCE_ROLES), stance: en(SOURCE_STANCES),
      opened: bool,
      research_question: str, data: str, method: str, result: str, limitations: str,
      what_it_proves: str, what_it_does_not: str, football_relevance: str,
    })),
    institution_notes: arr(str),
    match_examples: arr(str),
    data_needed: arr(str),
    open_questions: arr(str),
  }),
  evidence: obj({
    claims: arr(obj({ claim: str, claim_class: en(CLAIM_CLASSES), evidence: str, source_ids: arr(str), confidence: en(CONFIDENCE), counterevidence: str, interpretation: str })),
    question: str,
    thesis: str,
    structure: arr(str),
    mechanism: str,
    counterargument: str,
    limitations: str,
    hp_angle: str,
  }),
  draft: obj({ standfirst: str, body_md: str }),
  headlines: obj({
    headlines: arr(obj({
      variant: en(Object.keys(HEADLINE_VARIANTS)),
      text: str,
      mechanism: str,
      answers: bool, stronger_than_evidence: bool, misleading: bool, generic: bool,
      click_value: int, editorial_quality: int, hp_fit: int,
    })),
  }),
  redteam: obj({
    findings: arr(obj({ check: en(RED_TEAM_CHECKS), verdict: en(['PASS', 'WARN', 'FAIL']), note: str })),
    scores: SCORE,
    summary: str,
  }),
  discover: obj({
    topics: arr(obj({
      title: str, one_line: str, why_now: str, content_type: en(TOPIC_KINDS), destination: en(Object.keys(DESTINATIONS)),
      origin: str, foundry_id: str, evidence_level: en(EVIDENCE_LEVELS), originality: int, hp_fit: int, reader_value: int,
    })),
  }),
};

const STEP_EFFORT = { classify: 'medium', research: 'high', evidence: 'high', draft: 'high', headlines: 'medium', redteam: 'high', discover: 'high' };
const WEB_STEPS = new Set(['research', 'discover']);

// ---------------------------------------------------------------------------
// Inputs per step. Kept as plain text so the OPERATOR brief and the API call
// see exactly the same material.

const clip = (text, n) => {
  const s = String(text ?? '');
  return s.length > n ? `${s.slice(0, n)}\n[…clipped at ${n} chars]` : s;
};

function sourcesForPrompt(topic) {
  return (topic.research.sources ?? []).map((s) => ({
    id: s.id, title: s.title, url: s.url || s.internal_ref, role: s.role, stance: s.stance,
    verified: Boolean(s.verified), origin: s.independence_key || null, derived_from: s.derived_from || null,
    what_it_proves: s.what_it_proves, what_it_does_not: s.what_it_does_not,
  }));
}

export function stepInput(step, topic, context = {}) {
  const intake = {
    kind: topic.intake.kind,
    idea_or_note: topic.intake.raw,
    url: topic.intake.url,
    file: topic.intake.file_name,
    foundry: topic.intake.foundry,
    extracted_title: topic.intake.extracted_title,
    extracted_text: clip(topic.intake.extracted_text, 24_000),
    intake_warnings: topic.intake.warnings,
  };
  switch (step) {
    case 'classify':
      return [
        'Classify this intake for the editorial line. For URLs and files answer WHAT IS THIS / WHAT IS USEFUL / WHAT ARTICLES CAN COME FROM IT.',
        'Scores originality, hp_fit, reader_value, visual_potential are integers 0–10. Pick ONE primary public destination.',
        'derivatives: only formats that would genuinely carry the idea; [] is a valid answer.',
        'duplicate_of: the id of an existing topic or failure-memory entry this repeats, else "".',
        `INTAKE:\n${JSON.stringify(intake, null, 2)}`,
        `EXISTING TOPICS:\n${JSON.stringify(context.existing ?? [], null, 2)}`,
        `FAILURE MEMORY (ideas already rejected — do not resurrect without a new angle):\n${JSON.stringify(context.failures ?? [], null, 2)}`,
      ].join('\n\n');
    case 'research':
      return [
        'Build the source map for this topic. Use web search / fetch to OPEN sources; set opened=true only for sources you actually fetched or whose search result you read in this session.',
        'Follow the HP research chain where it is relevant (not forced): HP corpus → FIFA → UEFA → CIES → academic literature → coach/analyst views → world football media → counter-views → data / match examples.',
        'If an institution has said nothing meaningful on this topic, record that in institution_notes instead of padding the source list.',
        'For ACADEMIC sources fill research_question, data, method, result, limitations; for others put "" where not applicable.',
        'At least one source must be COUNTER stance if any credible counterevidence exists; if none exists, say so in open_questions.',
        'Every source needs a real url. Never invent one.',
        `CORE QUESTION: ${topic.research.core_question || topic.card.title}`,
        `WORKING THESIS: ${topic.research.working_thesis || '(none yet)'}`,
        `INTAKE:\n${JSON.stringify(intake, null, 2)}`,
        `SOURCES ALREADY ON FILE:\n${JSON.stringify(sourcesForPrompt(topic), null, 2)}`,
      ].join('\n\n');
    case 'evidence':
      return [
        'Build the claim/evidence map and the argument structure. No prose article yet.',
        'Each claim cites source ids from the list below (e.g. "S2"). A claim without a source is not allowed; drop it or move it to limitations.',
        'confidence reflects the evidence, not how much you like the claim. Mark interpretation separately from evidence.',
        `claim_class: what kind of statement it is (${CLAIM_CLASSES.join(', ')}). confidence may not exceed the class ceiling: ${JSON.stringify(CONFIDENCE_CEILING)}. HIGH also needs two independent supporting origins — two articles reporting the same study are one origin.`,
        'structure: ordered section beats (HOOK, QUESTION, COMMON BELIEF, EVIDENCE, MECHANISM, CONTEXT, COUNTEREVIDENCE, EXAMPLE, IMPLICATION, HP VERDICT) — only the beats this piece needs, each with one line of content.',
        'hp_angle: what HP adds that the sources do not already say. If nothing, say so.',
        `CORE QUESTION: ${topic.research.core_question}`,
        `WORKING THESIS: ${topic.research.working_thesis}`,
        `DESTINATION: ${topic.destination.primary}`,
        `SOURCES:\n${JSON.stringify(sourcesForPrompt(topic), null, 2)}`,
        `MATCH EXAMPLES: ${JSON.stringify(topic.research.match_examples)}\nOPEN QUESTIONS: ${JSON.stringify(topic.research.open_questions)}`,
        `FOUNDRY CLAIM CEILING (if any): ${topic.intake.foundry?.claim_ceiling ?? 'none'}`,
      ].join('\n\n');
    case 'draft':
      return [
        `Write the ${topic.destination.primary} piece in Markdown. Editorial, precise, analytical, human, football-native, readable. Not an academic paper, not a generic AI blog post.`,
        'The first paragraph must open a strong question, show a contradiction, or break a common belief. No context dump.',
        'Use the structure beats as an internal skeleton; do NOT turn them into visible template headings. Use at most a few headings, only where a long piece needs navigation.',
        'Cite with inline markers like [S1] right after the sentence a source supports. Use only claims from the map; keep their confidence.',
        'Put counterevidence inside the argument. End with the HP verdict only if the evidence earns it; otherwise end with the exact open question.',
        'standfirst: one or two sentences, no hype.',
        `OUTLINE:\n${JSON.stringify(topic.outline, null, 2)}`,
        `CLAIM MAP:\n${JSON.stringify(topic.claims, null, 2)}`,
        `SOURCES:\n${JSON.stringify(sourcesForPrompt(topic), null, 2)}`,
        topic.draft.body_md ? `PREVIOUS DRAFT (revise, do not restart unless it is unusable):\n${topic.draft.body_md}` : '',
        topic.red_team.findings.length ? `RED TEAM FINDINGS TO ADDRESS:\n${JSON.stringify(topic.red_team.findings, null, 2)}` : '',
      ].filter(Boolean).join('\n\n');
    case 'headlines':
      return [
        'Write exactly five headlines, one per variant: A STRAIGHT/EDITORIAL, B QUESTION, C CONTRARIAN, D EVIDENCE-LED, E HIGH-CURIOSITY.',
        'Goal: editorial curiosity, not cheap clickbait. The tension in the headline must be answered by the article; no claim stronger than the evidence; not misleading; not generic.',
        'mechanism: which curiosity mechanism it uses (COMMON BELIEF VS EVIDENCE, QUESTION VS ANSWER, VISIBLE RESULT VS HIDDEN MECHANISM, METRIC VS REALITY, PLAYER QUALITY VS ROLE FIT, DATA VS INTERPRETATION).',
        'Run the safety test honestly for each: answers, stronger_than_evidence, misleading, generic (booleans) and click_value, editorial_quality, hp_fit (integers 1–10).',
        `STANDFIRST: ${topic.draft.standfirst}`,
        `ARTICLE:\n${topic.draft.body_md}`,
        `CLAIM MAP:\n${JSON.stringify(topic.claims, null, 2)}`,
      ].join('\n\n');
    case 'redteam':
      return [
        'Independent review. You did not write this. Return one finding per check:',
        RED_TEAM_CHECKS.join(', '),
        'THESIS_PROVEN: is the thesis supported? MECHANISM: is there a mechanism, not just a result? DATA_TO_CAUSATION: any causal leap from data? SMALL_SAMPLE: sample problems? COUNTEREVIDENCE: present and fairly handled? SOURCE_QUALITY: good enough for the claims? RETELLING: is this a re-telling of another piece? HP_VALUE: does HP add something? HEADLINE_VS_TEXT: is the selected headline stronger than the text? JARGON: too much? AI_CLICHE: any generic AI phrasing?',
        'FAIL blocks publication; use it when the problem is real. WARN for fixable weaknesses. Note must say exactly where and how to fix.',
        'scores: integers 0–10 for each dimension. Be calibrated: 8+ is rare.',
        `SELECTED HEADLINE: ${topic.headlines.find((h) => h.variant === topic.selected_headline)?.text ?? '(none selected)'}`,
        `STANDFIRST: ${topic.draft.standfirst}`,
        `ARTICLE:\n${topic.draft.body_md}`,
        `CLAIM MAP:\n${JSON.stringify(topic.claims, null, 2)}`,
        `SOURCES:\n${JSON.stringify(sourcesForPrompt(topic), null, 2)}`,
      ].join('\n\n');
    default:
      throw new Error(`UNKNOWN_STEP:${step}`);
  }
}

export function discoverInput({ candidates = [], existing = [], failures = [] } = {}) {
  return [
    'Find at most FIVE strong topics for Hikmet to write next. Not 100 ideas. The best five, or fewer if fewer are strong.',
    'Draw on: the Content Foundry candidates below (internal corpus seeds), recent institutional reports (FIFA, UEFA, CIES — search for what is new), and academic findings.',
    'Prefer: CONTRADICTION, MISUNDERSTOOD METRIC, TACTICAL MECHANISM, SCOUTING PROBLEM, ROLE FIT, DATA VS EYE, MEDIA MYTH, COUNTERINTUITIVE RESULT.',
    'Do not repeat existing topics or failure-memory entries. foundry_id: the Foundry item id when the topic comes from it, else "". origin: where it comes from in one line.',
    `FOUNDRY CANDIDATES:\n${JSON.stringify(candidates.map((c) => ({ id: c.id, type: c.type, seed: c.seed, claim_ceiling: c.claim_ceiling })), null, 2)}`,
    `EXISTING TOPICS:\n${JSON.stringify(existing, null, 2)}`,
    `FAILURE MEMORY:\n${JSON.stringify(failures, null, 2)}`,
  ].join('\n\n');
}

// Copy-ready brief for the OPERATOR path (any capable assistant).
export function operatorBrief(step, input, profile) {
  return [
    '=== HPAnalytic EDITORIAL STUDIO — OPERATOR BRIEF ===',
    `STEP: ${step.toUpperCase()}`,
    systemPrompt(ROLES[step], profile),
    '--- TASK ---',
    input,
    '--- OUTPUT CONTRACT ---',
    'Reply with ONE JSON object only, matching this JSON Schema exactly (no prose before or after):',
    JSON.stringify(SCHEMAS[step]),
  ].join('\n\n');
}

// ---------------------------------------------------------------------------
// Validation and apply. Shared by both paths.

const clamp10 = (n) => (Number.isFinite(Number(n)) ? Math.max(0, Math.min(10, Math.round(Number(n)))) : null);
const text = (v) => (typeof v === 'string' ? v.trim() : '');
const list = (v) => (Array.isArray(v) ? v : []);
const oneOf = (v, values, fallback) => (values.includes(v) ? v : fallback);

export function parseJsonAnswer(raw) {
  const s = String(raw ?? '').trim();
  const fenced = [...s.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)].map((m) => m[1]);
  const candidates = [...fenced.reverse(), s, s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1)];
  for (const c of candidates) {
    try {
      const value = JSON.parse(c);
      if (value && typeof value === 'object') return value;
    } catch { /* try next */ }
  }
  throw new Error('ANSWER_IS_NOT_JSON');
}

function nextSourceId(sources) {
  const max = sources.reduce((m, s) => Math.max(m, Number(String(s.id).replace(/^S/, '')) || 0), 0);
  return `S${max + 1}`;
}

// Returns a NEW topic. `origin` is 'ENGINE' or 'OPERATOR'.
export function applyStep(step, topic, result, { origin = 'ENGINE', now = new Date() } = {}) {
  const t = structuredClone(topic);
  const at = now.toISOString();
  switch (step) {
    case 'classify': {
      t.card = {
        ...t.card,
        title: text(result.title) || t.card.title,
        one_line: text(result.one_line),
        why_now: text(result.why_now),
        content_type: oneOf(result.content_type, TOPIC_KINDS, null),
        evidence_level: oneOf(result.evidence_level, EVIDENCE_LEVELS, 'UNKNOWN'),
        originality: clamp10(result.originality),
        hp_fit: clamp10(result.hp_fit),
        reader_value: clamp10(result.reader_value),
        visual_potential: clamp10(result.visual_potential),
        next_action: text(result.next_action) || 'RESEARCH',
      };
      const derivatives = list(result.derivatives).filter((d) => DERIVATIVES.includes(d));
      t.destination = { primary: oneOf(result.destination, Object.keys(DESTINATIONS), null), derivatives, multi_format: derivatives.length > 0 };
      t.research.core_question = text(result.core_question) || t.research.core_question;
      t.research.working_thesis = text(result.working_thesis) || t.research.working_thesis;
      t.intake.assessment = {
        what_is_this: text(result.what_is_this),
        what_is_useful: text(result.what_is_useful),
        possible_articles: list(result.possible_articles).map(text).filter(Boolean),
        duplicate_of: text(result.duplicate_of),
        origin,
        at,
      };
      break;
    }
    case 'research': {
      const sources = [...t.research.sources];
      for (const s of list(result.sources)) {
        const url = text(s.url);
        if (!/^https?:\/\//.test(url)) continue; // no locator → not a source
        if (sources.some((x) => x.url === url)) continue;
        sources.push({
          id: nextSourceId(sources),
          title: text(s.title), url, internal_ref: '', publisher: text(s.publisher), year: text(s.year),
          role: oneOf(s.role, SOURCE_ROLES, 'SECONDARY'), stance: oneOf(s.stance, SOURCE_STANCES, 'CONTEXT'),
          opened_by_engine: s.opened === true,
          academic: { research_question: text(s.research_question), data: text(s.data), method: text(s.method), result: text(s.result), limitations: text(s.limitations) },
          what_it_proves: text(s.what_it_proves), what_it_does_not: text(s.what_it_does_not), football_relevance: text(s.football_relevance),
          excerpt: '',
          verified: false, // only a human verifies (gate: SOURCE_TRACEABILITY)
          independence_key: '', derived_from: '', // only a human states origin (gate: SOURCE_INDEPENDENCE)
          origin,
          added_at: at,
        });
      }
      t.research.sources = sources;
      t.research.institution_notes = list(result.institution_notes).map(text).filter(Boolean);
      t.research.match_examples = list(result.match_examples).map(text).filter(Boolean);
      t.research.data_needed = list(result.data_needed).map(text).filter(Boolean);
      t.research.open_questions = list(result.open_questions).map(text).filter(Boolean);
      break;
    }
    case 'evidence': {
      const ids = new Set(t.research.sources.map((s) => s.id));
      t.claims = list(result.claims).filter((c) => text(c.claim)).map((c, i) => ({
        id: `C${i + 1}`,
        claim: text(c.claim),
        claim_class: oneOf(c.claim_class, CLAIM_CLASSES, null),
        status: 'ACTIVE',
        evidence: text(c.evidence),
        source_ids: list(c.source_ids).map(text).filter((id) => ids.has(id)),
        confidence: oneOf(c.confidence, CONFIDENCE, 'UNKNOWN'),
        counterevidence: text(c.counterevidence),
        interpretation: text(c.interpretation),
      }));
      t.outline = {
        question: text(result.question),
        thesis: text(result.thesis),
        structure: list(result.structure).map(text).filter(Boolean),
        mechanism: text(result.mechanism),
        counterargument: text(result.counterargument),
        limitations: text(result.limitations),
        hp_angle: text(result.hp_angle),
      };
      break;
    }
    case 'draft': {
      const body = text(result.body_md);
      if (!body) throw new Error('DRAFT_EMPTY');
      t.draft = { standfirst: text(result.standfirst), body_md: body, version: (t.draft.version ?? 0) + 1, updated_at: at, origin };
      t.attestations = { ...t.attestations, voice_checked: false }; // new text → re-check voice
      break;
    }
    case 'headlines': {
      const seen = new Set();
      t.headlines = list(result.headlines)
        .filter((h) => HEADLINE_VARIANTS[h.variant] && text(h.text) && !seen.has(h.variant) && seen.add(h.variant))
        .map((h) => ({
          variant: h.variant,
          text: text(h.text),
          mechanism: text(h.mechanism),
          safety: {
            answers: h.answers === true,
            stronger_than_evidence: h.stronger_than_evidence !== false,
            misleading: h.misleading !== false,
            generic: h.generic !== false,
            click_value: clamp10(h.click_value),
            editorial_quality: clamp10(h.editorial_quality),
            hp_fit: clamp10(h.hp_fit),
          },
          origin,
        }))
        .sort((a, b) => a.variant.localeCompare(b.variant));
      if (!t.headlines.some((h) => h.variant === t.selected_headline)) t.selected_headline = null;
      t.headlines_draft_version = t.draft.version; // safety test is only valid for this text
      break;
    }
    case 'redteam': {
      t.red_team = {
        findings: list(result.findings)
          .filter((f) => RED_TEAM_CHECKS.includes(f.check))
          .map((f) => ({ check: f.check, verdict: oneOf(f.verdict, ['PASS', 'WARN', 'FAIL'], 'WARN'), note: text(f.note) })),
        summary: text(result.summary),
        ran_at: at,
        origin,
        draft_version: t.draft.version,
      };
      const scores = result.scores ?? {};
      t.score = Object.fromEntries(SCORE_DIMENSIONS.map((d) => [d, clamp10(scores[d])]).filter(([, v]) => v !== null));
      break;
    }
    default:
      throw new Error(`UNKNOWN_STEP:${step}`);
  }
  t.updated_at = at;
  return t;
}

export function normalizeDiscoveries(result) {
  return list(result.topics).slice(0, 5).map((d) => ({
    title: text(d.title),
    one_line: text(d.one_line),
    why_now: text(d.why_now),
    content_type: oneOf(d.content_type, TOPIC_KINDS, null),
    destination: oneOf(d.destination, Object.keys(DESTINATIONS), null),
    origin: text(d.origin),
    foundry_id: text(d.foundry_id),
    evidence_level: oneOf(d.evidence_level, EVIDENCE_LEVELS, 'UNKNOWN'),
    originality: clamp10(d.originality),
    hp_fit: clamp10(d.hp_fit),
    reader_value: clamp10(d.reader_value),
  })).filter((d) => d.title);
}

// ---------------------------------------------------------------------------
// Claude API path.

export async function engineStatus(env = process.env) {
  if (env.HP_STUDIO_ENGINE === 'off') return { available: false, reason: 'ENGINE_DISABLED' };
  let sdk = false;
  try {
    await import('@anthropic-ai/sdk');
    sdk = true;
  } catch { /* not installed */ }
  if (!sdk) return { available: false, reason: 'SDK_NOT_INSTALLED' };
  if (env.ANTHROPIC_API_KEY || env.ANTHROPIC_AUTH_TOKEN || env.ANTHROPIC_PROFILE) return { available: true, reason: 'ENV_CREDENTIALS' };
  try {
    await readFile(path.join(os.homedir(), '.config', 'anthropic', 'config.json'));
    return { available: true, reason: 'ANT_PROFILE' };
  } catch {
    return { available: false, reason: 'NO_CREDENTIALS' };
  }
}

function content(input, pdf) {
  const blocks = [];
  if (pdf) blocks.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdf.toString('base64') } });
  blocks.push({ type: 'text', text: input });
  return blocks;
}

// Runs one step on Claude and returns the parsed JSON result.
export async function runOnClaude(step, input, { profile = null, pdf = null, client } = {}) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const api = client ?? new Anthropic();
  const web = WEB_STEPS.has(step);
  const messages = [{ role: 'user', content: content(input, pdf) }];
  const params = {
    model: MODEL,
    max_tokens: step === 'draft' ? 48_000 : 24_000,
    system: systemPrompt(ROLES[step], profile),
    thinking: { type: 'adaptive' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
  };
  if (web) {
    // Server tools; structured output is not combined with them. The answer is
    // requested as a JSON block and validated by applyStep.
    params.tools = [
      { type: 'web_search_20260209', name: 'web_search', max_uses: 8 },
      { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 8 },
    ];
    params.output_config = { effort: STEP_EFFORT[step] };
    messages[0].content.push({ type: 'text', text: `Finish with ONE JSON object in a \`\`\`json block matching this schema:\n${JSON.stringify(SCHEMAS[step])}` });
  } else {
    params.output_config = { effort: STEP_EFFORT[step], format: { type: 'json_schema', schema: SCHEMAS[step] } };
  }

  let response;
  for (let turn = 0; turn < 6; turn += 1) {
    response = await api.beta.messages.stream({ ...params, messages }).finalMessage();
    if (response.stop_reason !== 'pause_turn') break;
    messages.push({ role: 'assistant', content: response.content });
  }
  if (response.stop_reason === 'refusal') {
    throw new Error(`ENGINE_REFUSAL:${response.stop_details?.category ?? 'unknown'}`);
  }
  if (response.stop_reason === 'max_tokens') throw new Error('ENGINE_MAX_TOKENS');
  const textOut = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  return parseJsonAnswer(textOut);
}
