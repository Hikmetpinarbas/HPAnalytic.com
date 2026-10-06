// Studio actions: the only place that combines store, engine, model and gate.
// Pages call handleAction() with the submitted form and redirect afterwards
// (POST → redirect → GET), so a reload never repeats an engine call.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  advance, createTopic, DESTINATIONS, DERIVATIVES, EVIDENCE_CLASSES, FAILURE_REASONS,
  HEADLINE_VARIANTS, SOURCE_ROLES, SOURCE_STANCES, transition,
} from './model.mjs';
import { evaluateGate, similarity, SIMILARITY_WARN } from './gate.mjs';
import {
  applyStep, discoverInput, engineStatus, normalizeDiscoveries, operatorBrief, parseJsonAnswer, runOnClaude, stepInput,
} from './engine.mjs';
import { foundryCandidates, readFoundryQueue, readUploadedFile, readUrl, parseUrl } from './intake.mjs';
import { buildPackage } from './export.mjs';

// Where each step leaves the topic on the editorial line.
const STEP_TARGET = {
  classify: 'DISCOVERED',
  research: 'SOURCE_READY',
  evidence: 'OUTLINE',
  draft: 'DRAFT',
  headlines: null,
  redteam: 'EDITORIAL_REVIEW',
};

const FROZEN = new Set(['HOLD', 'REJECTED', 'PUBLISHED']);

export function stepPrecondition(step, topic) {
  if (FROZEN.has(topic.state)) return `TOPIC_${topic.state}`;
  switch (step) {
    case 'research': return topic.research.core_question || topic.card.title ? null : 'NO_CORE_QUESTION';
    case 'evidence': return topic.research.sources.length > 0 ? null : 'NO_SOURCES';
    case 'draft': return topic.claims.length > 0 && topic.outline.thesis ? null : 'NO_EVIDENCE_MAP';
    case 'headlines':
    case 'redteam': return topic.draft.body_md ? null : 'NO_DRAFT';
    default: return null;
  }
}

const pdfPath = (store, id) => path.join(store.root, 'intake-files', `${id}.pdf`);
async function loadPdf(store, topic) {
  if (!topic.intake.has_pdf) return null;
  try { return await readFile(pdfPath(store, topic.id)); } catch { return null; }
}

function similarityWarnings(text, topics, failures, selfId, url = null) {
  const warnings = [];
  for (const t of topics) {
    if (t.id === selfId) continue;
    if (t.intake.url && t.intake.url === url) {
      warnings.push(`SAME_URL_AS_TOPIC:${t.id}`);
      continue;
    }
    const score = similarity(text, `${t.card.title} ${t.intake.raw}`);
    if (score >= SIMILARITY_WARN) warnings.push(`SIMILAR_TO_TOPIC:${t.id}:${score.toFixed(2)}`);
  }
  for (const f of failures) {
    const score = similarity(text, f.title);
    if (score >= SIMILARITY_WARN) warnings.push(`SIMILAR_TO_REJECTED:${f.reason}:${f.topic_id}:${score.toFixed(2)}`);
  }
  return warnings;
}

function stepContext(topics, failures) {
  return {
    existing: topics.slice(0, 80).map((t) => ({ id: t.id, title: t.card.title, state: t.state })),
    failures: failures.slice(-80).map((f) => ({ id: f.topic_id, title: f.title, reason: f.reason })),
  };
}

async function runStep(store, topic, step, { answer = null } = {}) {
  const blocked = stepPrecondition(step, topic);
  if (blocked) return { ok: false, topic, error: blocked };
  let result;
  let origin;
  if (answer !== null) {
    result = parseJsonAnswer(answer);
    origin = 'OPERATOR';
  } else {
    const status = await engineStatus();
    if (!status.available) return { ok: false, topic, error: `ENGINE_UNAVAILABLE:${status.reason}` };
    const [topics, failures, profile] = await Promise.all([store.listTopics(), store.failureMemory(), store.languageProfile()]);
    const input = stepInput(step, topic, stepContext(topics, failures));
    const pdf = step === 'classify' || step === 'research' ? await loadPdf(store, topic) : null;
    result = await runOnClaude(step, input, { profile, pdf });
    origin = 'ENGINE';
  }
  let next = applyStep(step, topic, result, { origin });
  const target = STEP_TARGET[step];
  const actor = origin === 'ENGINE' ? 'ENGINE' : 'HUMAN';
  if (target) {
    const moved = advance(next, target, { actor, note: `${step} (${origin})` });
    next = moved.topic;
  }
  await store.saveTopic(next);
  await store.log({ type: 'STEP', topic: topic.id, step, origin, state: next.state });
  return { ok: true, topic: next, error: null };
}

async function createFromIntake(store, { kind, raw, url = null, fileName = null, foundry = null, extracted = null, pdf = null }) {
  let topic = createTopic({ kind, raw, url, fileName, foundry });
  if (extracted) {
    topic.intake.extracted_title = extracted.title || null;
    topic.intake.extracted_text = extracted.text || null;
    topic.intake.warnings = [...extracted.warnings];
    if (extracted.title && !raw) topic.card.title = extracted.title.slice(0, 140);
  }
  if (pdf) {
    await mkdir(path.dirname(pdfPath(store, topic.id)), { recursive: true });
    await writeFile(pdfPath(store, topic.id), pdf);
    topic.intake.has_pdf = true;
  }
  if (!raw && !extracted?.title) topic.card.title = (url || fileName || topic.card.title).slice(0, 140);
  const [topics, failures] = await Promise.all([store.listTopics(), store.failureMemory()]);
  topic.intake.warnings.push(...similarityWarnings(`${topic.card.title} ${raw}`, topics, failures, topic.id, url));
  await store.saveTopic(topic);
  await store.log({ type: 'INTAKE', topic: topic.id, kind });

  // Classification runs immediately when an engine is available; otherwise the
  // topic waits in the inbox as IDEA with an operator brief ready.
  if ((await engineStatus()).available) {
    try {
      const r = await runStep(store, topic, 'classify');
      topic = r.topic;
    } catch (error) {
      topic.intake.warnings.push(`CLASSIFY_FAILED:${error.message}`);
      await store.saveTopic(topic);
    }
  }
  return topic;
}

const field = (form, name) => String(form.get(name) ?? '').trim();

// Returns { redirect, flash } — flash is a short status code shown once.
export async function handleAction(store, form) {
  const action = field(form, 'action');
  const id = field(form, 'id');
  const back = (flash, topicId = id) => ({ redirect: topicId ? `/studio/editorial/${topicId}` : '/studio/editorial', flash });

  try {
    switch (action) {
      case 'intake': {
        const text = field(form, 'text');
        const file = form.get('file');
        if (file && typeof file === 'object' && file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const read = readUploadedFile(file.name, buffer);
          const topic = await createFromIntake(store, {
            kind: 'FILE', raw: text, fileName: file.name, pdf: read.pdf,
            extracted: { title: file.name, text: read.text, warnings: read.warnings },
          });
          return back('INTAKE_FILE_OK', topic.id);
        }
        if (!text) return back('INTAKE_EMPTY', '');
        if (parseUrl(text) && !/\s/.test(text)) {
          const read = await readUrl(text);
          const topic = await createFromIntake(store, { kind: 'URL', raw: '', url: text, extracted: read, pdf: read.pdf });
          return back('INTAKE_URL_OK', topic.id);
        }
        const topic = await createFromIntake(store, { kind: 'IDEA', raw: text });
        return back('INTAKE_IDEA_OK', topic.id);
      }

      case 'import_foundry': {
        const queue = await readFoundryQueue();
        const item = queue.items.find((x) => x.id === field(form, 'foundry_id'));
        if (!item) return back('FOUNDRY_ITEM_NOT_FOUND', '');
        const topics = await store.listTopics();
        const existing = topics.find((t) => t.intake.foundry_id === item.id);
        if (existing) return back('FOUNDRY_ALREADY_IMPORTED', existing.id);
        const topic = await createFromIntake(store, { kind: 'FOUNDRY', raw: item.seed, foundry: item });
        return back('FOUNDRY_IMPORTED', topic.id);
      }

      case 'discover': {
        const status = await engineStatus();
        if (!status.available) return back(`ENGINE_UNAVAILABLE:${status.reason}`, '');
        const [topics, failures, queue, profile] = await Promise.all([store.listTopics(), store.failureMemory(), readFoundryQueue(), store.languageProfile()]);
        const imported = new Set(topics.map((t) => t.intake.foundry_id).filter(Boolean));
        const ctx = stepContext(topics, failures);
        const input = discoverInput({ candidates: foundryCandidates(queue.items, imported), existing: ctx.existing, failures: ctx.failures });
        const suggestions = normalizeDiscoveries(await runOnClaude('discover', input, { profile }));
        await store.saveSuggestions({ at: new Date().toISOString(), suggestions });
        await store.log({ type: 'DISCOVER', count: suggestions.length });
        return back('DISCOVER_OK', '');
      }

      case 'accept_suggestion': {
        const saved = await store.suggestions();
        const index = Number(field(form, 'index'));
        const s = saved?.suggestions?.[index];
        if (!s) return back('SUGGESTION_NOT_FOUND', '');
        const queue = s.foundry_id ? await readFoundryQueue() : { items: [] };
        const foundry = queue.items.find((x) => x.id === s.foundry_id) ?? null;
        let topic = createTopic({ kind: foundry ? 'FOUNDRY' : 'IDEA', raw: s.title, foundry });
        topic = applyStep('classify', topic, {
          title: s.title, one_line: s.one_line, why_now: s.why_now, content_type: s.content_type, evidence_level: s.evidence_level,
          originality: s.originality, hp_fit: s.hp_fit, reader_value: s.reader_value, visual_potential: null, next_action: 'RESEARCH',
          destination: s.destination, derivatives: [], core_question: s.title, working_thesis: '', what_is_this: s.origin,
          what_is_useful: '', possible_articles: [], duplicate_of: '',
        }, { origin: 'ENGINE' });
        topic.card.source_origin = `KONU BUL — ${s.origin}`;
        topic = advance(topic, 'DISCOVERED', { actor: 'HUMAN', note: 'accepted from KONU BUL' }).topic;
        saved.suggestions.splice(index, 1);
        await store.saveSuggestions(saved);
        await store.saveTopic(topic);
        await store.log({ type: 'SUGGESTION_ACCEPTED', topic: topic.id });
        return back('SUGGESTION_ACCEPTED', topic.id);
      }

      case 'dismiss_suggestion': {
        const saved = await store.suggestions();
        const index = Number(field(form, 'index'));
        const s = saved?.suggestions?.[index];
        if (s) {
          const reason = FAILURE_REASONS.includes(field(form, 'reason')) ? field(form, 'reason') : 'TOO_GENERIC';
          await store.rememberFailure({ at: new Date().toISOString(), topic_id: null, title: s.title, reason, note: 'dismissed suggestion' });
          saved.suggestions.splice(index, 1);
          await store.saveSuggestions(saved);
        }
        return back('SUGGESTION_DISMISSED', '');
      }
    }

    // Everything below acts on one topic.
    const topic = await store.getTopic(id);
    if (!topic) return back('TOPIC_NOT_FOUND', '');
    const save = async (next, flash, log = {}) => {
      next.updated_at = new Date().toISOString();
      await store.saveTopic(next);
      await store.log({ type: action.toUpperCase(), topic: id, ...log });
      return back(flash);
    };

    switch (action) {
      case 'run_step': {
        const r = await runStep(store, topic, field(form, 'step'));
        return back(r.ok ? `STEP_OK:${field(form, 'step')}` : r.error);
      }
      case 'paste_step': {
        const r = await runStep(store, topic, field(form, 'step'), { answer: field(form, 'answer') });
        return back(r.ok ? `STEP_OK:${field(form, 'step')}` : r.error);
      }
      case 'transition': {
        const to = field(form, 'to');
        const reason = field(form, 'reason');
        const note = to === 'REJECTED' ? (FAILURE_REASONS.includes(reason) ? reason : '') : field(form, 'note');
        const r = transition(topic, to, { actor: 'HUMAN', note, gate: to === 'READY' ? evaluateGate(topic) : undefined });
        if (!r.ok) return back(r.error);
        if (to === 'REJECTED') {
          await store.rememberFailure({ at: new Date().toISOString(), topic_id: id, title: topic.card.title, reason: note, note: field(form, 'note') });
        }
        return save(r.topic, `STATE:${to}`, { from: topic.state, to });
      }
      case 'set_destination': {
        const primary = field(form, 'primary');
        if (!DESTINATIONS[primary]) return back('DESTINATION_INVALID');
        const derivatives = form.getAll('derivatives').map(String).filter((d) => DERIVATIVES.includes(d));
        return save({ ...topic, destination: { primary, derivatives, multi_format: derivatives.length > 0 } }, 'DESTINATION_SET', { primary });
      }
      case 'set_question': {
        return save({ ...topic, research: { ...topic.research, core_question: field(form, 'core_question'), working_thesis: field(form, 'working_thesis') } }, 'QUESTION_SET');
      }
      case 'add_source': {
        const url = field(form, 'url');
        const internalRef = field(form, 'internal_ref');
        if (!url && !internalRef) return back('SOURCE_LOCATOR_REQUIRED');
        const sources = topic.research.sources;
        const nextId = `S${sources.reduce((m, s) => Math.max(m, Number(s.id.slice(1)) || 0), 0) + 1}`;
        const source = {
          id: nextId, title: field(form, 'title') || url || internalRef, url, internal_ref: internalRef,
          publisher: field(form, 'publisher'), year: field(form, 'year'),
          role: SOURCE_ROLES.includes(field(form, 'role')) ? field(form, 'role') : 'INTERNAL',
          stance: SOURCE_STANCES.includes(field(form, 'stance')) ? field(form, 'stance') : 'CONTEXT',
          opened_by_engine: false, academic: null,
          what_it_proves: field(form, 'what_it_proves'), what_it_does_not: field(form, 'what_it_does_not'), football_relevance: '',
          excerpt: field(form, 'excerpt'),
          verified: true, // added and checked by a human
          origin: 'HUMAN', added_at: new Date().toISOString(),
        };
        return save({ ...topic, research: { ...topic.research, sources: [...sources, source] } }, 'SOURCE_ADDED', { source: nextId });
      }
      case 'verify_source':
      case 'unverify_source': {
        const sid = field(form, 'source_id');
        const sources = topic.research.sources.map((s) => (s.id === sid ? { ...s, verified: action === 'verify_source', verified_at: new Date().toISOString() } : s));
        return save({ ...topic, research: { ...topic.research, sources } }, action.toUpperCase(), { source: sid });
      }
      case 'remove_source': {
        const sid = field(form, 'source_id');
        const sources = topic.research.sources.filter((s) => s.id !== sid);
        const claims = topic.claims.map((c) => ({ ...c, source_ids: c.source_ids.filter((x) => x !== sid) }));
        return save({ ...topic, research: { ...topic.research, sources }, claims }, 'SOURCE_REMOVED', { source: sid });
      }
      case 'attest': {
        const attestations = { ...topic.attestations, [field(form, 'key')]: field(form, 'value') === 'true' };
        if (!['voice_checked', 'sources_checked'].includes(field(form, 'key'))) return back('ATTESTATION_INVALID');
        return save({ ...topic, attestations }, 'ATTESTED', attestations);
      }
      case 'select_headline': {
        const variant = field(form, 'variant');
        if (!HEADLINE_VARIANTS[variant] || !topic.headlines.some((h) => h.variant === variant)) return back('HEADLINE_INVALID');
        return save({ ...topic, selected_headline: variant }, 'HEADLINE_SELECTED', { variant });
      }
      case 'edit_draft': {
        const body = String(form.get('body_md') ?? '');
        const draft = { standfirst: field(form, 'standfirst'), body_md: body, version: topic.draft.version + 1, updated_at: new Date().toISOString(), origin: 'HUMAN' };
        let next = { ...topic, draft, attestations: { ...topic.attestations, voice_checked: false } };
        if (['OUTLINE', 'DRAFTING'].includes(topic.state) && body.trim()) next = advance(next, 'DRAFT', { actor: 'HUMAN', note: 'human draft' }).topic;
        return save(next, 'DRAFT_SAVED', { version: draft.version });
      }
      case 'set_public_meta': {
        const evidence = field(form, 'evidence_class');
        const tags = field(form, 'tags').split(',').map((t) => t.trim()).filter(Boolean).slice(0, 12);
        return save({ ...topic, public_meta: { evidence_class: EVIDENCE_CLASSES.includes(evidence) ? evidence : null, claim_ceiling: field(form, 'claim_ceiling'), tags } }, 'PUBLIC_META_SET');
      }
      case 'set_public_url': {
        const url = parseUrl(field(form, 'public_url'));
        if (!url || !/(^|\.)hpanalytic\.com$/.test(url.hostname)) return back('PUBLIC_URL_MUST_BE_HPANALYTIC');
        return save({ ...topic, public_url: url.href }, 'PUBLIC_URL_SET');
      }
      case 'export': {
        const pkg = buildPackage(topic);
        if (!pkg.ok) return back(`EXPORT_BLOCKED:${pkg.problems.join(',')}`);
        const file = await store.writeOutbox(pkg.relativePath, pkg.content);
        return save({ ...topic, export: { at: new Date().toISOString(), path: pkg.relativePath, target_collection: pkg.targetCollection, draft: true } }, 'EXPORTED', { file: path.relative(store.root, file) });
      }
      default:
        return back(`UNKNOWN_ACTION:${action}`);
    }
  } catch (error) {
    await store.log({ type: 'ERROR', action, topic: id || null, error: String(error?.message ?? error) });
    return back(`ERROR:${String(error?.message ?? error).slice(0, 160)}`);
  }
}

export async function operatorBriefFor(store, topic, step) {
  const [topics, failures, profile] = await Promise.all([store.listTopics(), store.failureMemory(), store.languageProfile()]);
  return operatorBrief(step, stepInput(step, topic, stepContext(topics, failures)), profile);
}
