const SURFACES = [
  { href: '/analysis', label: 'ANALYSIS', kind: 'article', key: 'analysis' },
  { href: '/scouting', label: 'SCOUTING', kind: 'article', key: 'scouting' },
  { href: '/visual-lab', label: 'VISUAL LAB', kind: 'collection', key: 'visualCount' },
  { href: '/research', label: 'RESEARCH', kind: 'collection', key: 'researchCount' },
  { href: '/culture', label: 'CULTURE', kind: 'article', key: 'culture' },
  { href: '/about', label: 'HIKMET', kind: 'always', key: 'about' },
];

export function buildVisibleNavigation({
  articleSections = {},
  researchCount = 0,
  visualCount = 0,
} = {}) {
  const collectionCounts = { researchCount, visualCount };

  return SURFACES
    .filter((surface) => {
      if (surface.kind === 'always') return true;
      if (surface.kind === 'article') return Number(articleSections[surface.key] || 0) > 0;
      return Number(collectionCounts[surface.key] || 0) > 0;
    })
    .map(({ href, label }) => ({ href, label }));
}
