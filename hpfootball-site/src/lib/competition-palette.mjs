// Visual identity follows competition context, not article type.
const CLUBS = new Set(['galatasaray', 'fenerbahce', 'besiktas', 'trabzonspor', 'turkiye']);
export function resolveEditorialPalette({ club, competitionScope } = {}) {
  return (competitionScope === 'europe' || (competitionScope === 'international' && club === 'turkiye')) && CLUBS.has(club)
    ? { palette: 'club', club }
    : { palette: 'editorial', club: undefined };
}
