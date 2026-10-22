// Visual identity follows competition context, not article type.
const CLUBS = new Set(['galatasaray', 'fenerbahce', 'besiktas', 'trabzonspor', 'turkiye']);
export function resolveEditorialPalette({ club, competitionScope } = {}) {
  return ['europe', 'international'].includes(competitionScope) && CLUBS.has(club)
    ? { palette: 'club', club }
    : { palette: 'editorial', club: undefined };
}
