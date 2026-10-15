// Blog/public-content package (§32). Always draft:true.
//
// The package is written to the Studio outbox, never into src/content: moving
// it into the public site is a separate, human, reviewed step (commit + PR).
// Even if copied as-is, `draft: true` keeps it out of every public listing,
// route and search (see src/lib/public-content.mjs).

import { DESTINATIONS, slugify } from './model.mjs';
import { evaluateApproval } from './approval.mjs';

const q = (value) => JSON.stringify(String(value ?? ''));

export const EXPORTABLE_STATES = new Set(['READY', 'APPROVED']);

export function exportProblems(topic) {
  const problems = [];
  if (!EXPORTABLE_STATES.has(topic.state)) problems.push(`STATE_NOT_EXPORTABLE:${topic.state}`);
  const destination = DESTINATIONS[topic.destination?.primary];
  if (!destination) problems.push('DESTINATION_MISSING');
  if (!topic.headlines?.some((h) => h.variant === topic.selected_headline)) problems.push('NO_SELECTED_HEADLINE');
  if (!topic.draft?.body_md) problems.push('NO_DRAFT');
  if (destination?.collection === 'articles') {
    if (!topic.public_meta?.evidence_class) problems.push('EVIDENCE_CLASS_MISSING');
    if (!topic.public_meta?.claim_ceiling) problems.push('CLAIM_CEILING_MISSING');
  }
  if (destination?.collection === 'research' && !topic.public_meta?.claim_ceiling) problems.push('CLAIM_CEILING_MISSING');
  // A package that claims to be approved must carry a still-valid approval.
  if (topic.state === 'APPROVED') problems.push(...evaluateApproval(topic).reasons);
  return problems;
}

function referenceList(topic) {
  const cited = new Set([...(topic.draft.body_md.matchAll(/\[(S\d+)\]/g))].map((m) => m[1]));
  const sources = topic.research.sources.filter((s) => cited.has(s.id));
  if (sources.length === 0) return '';
  const lines = sources.map((s) => {
    const meta = [s.publisher, s.year].filter(Boolean).join(', ');
    return `- **[${s.id}]** ${s.title}${meta ? ` — ${meta}` : ''}. ${s.url || s.internal_ref}`;
  });
  return `\n\n## Kaynaklar\n\n${lines.join('\n')}\n`;
}

export function buildPackage(topic, { now = new Date(), author = 'Hikmet Pınarbaş' } = {}) {
  const problems = exportProblems(topic);
  if (problems.length > 0) return { ok: false, problems };

  const destination = DESTINATIONS[topic.destination.primary];
  const headline = topic.headlines.find((h) => h.variant === topic.selected_headline).text;
  const slug = slugify(headline);
  const date = now.toISOString().slice(0, 10);
  const citedIds = new Set([...(topic.draft.body_md.matchAll(/\[(S\d+)\]/g))].map((m) => m[1]));

  const lines = [
    '---',
    `title: ${q(headline)}`,
    `slug: ${q(slug)}`,
    `date: ${date}`,
    `description: ${q(topic.draft.standfirst || topic.card.one_line)}`,
    `author: ${q(author)}`,
    `tags: [${(topic.public_meta?.tags ?? []).map(q).join(', ')}]`,
    `contentType: ${q(topic.destination.primary)}`,
    'draft: true',
  ];
  if (destination.section) lines.push(`section: ${destination.section}`);
  if (destination.collection === 'articles') lines.push(`evidenceClass: ${topic.public_meta.evidence_class}`);
  if (topic.public_meta?.claim_ceiling) lines.push(`claimCeiling: ${q(topic.public_meta.claim_ceiling)}`);
  lines.push('sources:');
  const sources = topic.research.sources.filter((s) => citedIds.has(s.id));
  if (sources.length === 0) lines[lines.length - 1] = 'sources: []';
  for (const s of sources) {
    lines.push(`  - id: ${s.id}`, `    title: ${q(s.title)}`, `    url: ${q(s.url || s.internal_ref)}`, `    role: ${s.role}`);
  }
  lines.push('cover: null', `studioTopic: ${q(topic.id)}`, `editorialState: ${topic.state}`);
  if (topic.state === 'APPROVED') {
    lines.push(`approvedBy: ${q(topic.approval.approver)}`, `approvedAt: ${q(topic.approval.at)}`, `approvalFingerprint: ${q(topic.approval.fingerprint)}`);
  }
  lines.push('---', '');

  const body = `${topic.draft.body_md.trim()}${referenceList(topic)}`;
  const folder = destination.collection ?? 'blog';
  return {
    ok: true,
    problems: [],
    slug,
    relativePath: `${folder}/${date}-${slug}.md`,
    targetCollection: destination.collection,
    content: `${lines.join('\n')}\n${body}\n`,
  };
}
