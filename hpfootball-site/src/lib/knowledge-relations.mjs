// Editorial knowledge relations engine.
//
// Connections are authored, not inferred: every axis below is populated by
// the editorial team in the article front matter. The engine only *resolves*
// authored overlaps; it never guesses a relation from reading behaviour, team
// proximity or popularity. That keeps HPAnalytic's discovery surface
// editorial, not algorithmic.
//
// Admission is the same standard the rest of the public product uses: an
// article is linkable only when it is public (not a draft) and carries the
// accepted editorial status. We reuse the shared predicates instead of
// re-implementing them so the evidence standard stays single-sourced.
import { isPublic } from './public-content.mjs';
import { isPublicEditorialItem } from './site-editorial-status.mjs';

const AXES = [
  ['mechanisms', 'AYNI MEKANİZMA'],
  ['teams', 'AYNI TAKIM'],
  ['roles', 'AYNI ROL'],
  ['researchLines', 'AYNI ARAŞTIRMA HATTI'],
];

const axisValues = (entry, key) => new Set(
  ((entry?.data?.relations?.[key]) || [])
    .map((value) => String(value).trim().toLocaleLowerCase('tr-TR'))
    .filter(Boolean),
);

// Published and accepted: the single admission standard for a link target.
export function isLinkableArticle(entry) {
  return Boolean(entry) && isPublic(entry) && isPublicEditorialItem(entry.data);
}

export function resolveKnowledgeRelations(current, candidates = [], limit = 4) {
  const out = [];
  for (const candidate of candidates) {
    if (!candidate || candidate.id === current?.id) continue;
    if (!isLinkableArticle(candidate)) continue;
    for (const [axis, reason] of AXES) {
      const a = axisValues(current, axis);
      const b = axisValues(candidate, axis);
      const shared = [...a].filter((value) => b.has(value));
      if (shared.length) {
        out.push({ article: candidate, reason, axis, shared });
        break;
      }
    }
  }
  return out.slice(0, limit);
}

export function buildKnowledgePath(current, candidates = [], limit = 4) {
  const used = new Set();
  const path = [];
  for (const [axis, reason] of AXES) {
    const a = axisValues(current, axis);
    if (!a.size) continue;
    const candidate = candidates.find((item) => {
      if (!item || item.id === current?.id || used.has(item.id)) return false;
      if (!isLinkableArticle(item)) return false;
      const b = axisValues(item, axis);
      return [...a].some((value) => b.has(value));
    });
    if (!candidate) continue;
    const b = axisValues(candidate, axis);
    const shared = [...a].filter((value) => b.has(value));
    used.add(candidate.id);
    path.push({ article: candidate, reason, axis, shared });
    if (path.length >= limit) break;
  }
  return path;
}
