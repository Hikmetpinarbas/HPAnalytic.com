const SURFACES = [
  { href: '/analysis', label: 'ANALİZ', kind: 'article', key: 'analysis' },
  { href: '/scouting', label: 'SCOUTING', kind: 'article', key: 'scouting' },
  { href: '/visual-lab', label: 'GÖRSEL KANIT', kind: 'collection', key: 'visualCount' },
  { href: '/research', label: 'ARAŞTIRMA', kind: 'collection', key: 'researchCount' },
  { href: '/culture', label: 'KÜLTÜR', kind: 'article', key: 'culture' },
  { href: '/about', label: 'HIKMET', kind: 'always', key: 'about' },
];

export const SECTION_LABELS = {
  analysis: 'ANALYSIS',
  scouting: 'SCOUTING',
  culture: 'CULTURE',
  method: 'METHOD',
};

// Sections that have their own listing route. `method` articles live only in
// the archive until a method surface exists.
export const SECTION_ROUTES = {
  analysis: '/analysis',
  scouting: '/scouting',
  culture: '/culture',
};

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

// Archive and search are capabilities over the whole editorial corpus:
// they exist only while at least one article exists (EMPTY SURFACE = HIDDEN SURFACE).
export function buildUtilityNavigation({ articleCount = 0 } = {}) {
  if (Number(articleCount) <= 0) return [];
  return [
    { href: '/archive', label: 'ARŞİV' },
    { href: '/search', label: 'ARA' },
  ];
}

// aria-current support (GOV.UK service-navigation pattern): exact match is
// "page", a parent surface of the current route is "true".
export function currentState(href, pathname) {
  const clean = (value) => (value.length > 1 ? value.replace(/\/+$/, '') : value);
  const path = clean(String(pathname || '/'));
  const target = clean(href);
  if (path === target) return 'page';
  if (target !== '/' && path.startsWith(target + '/')) return 'true';
  return undefined;
}
