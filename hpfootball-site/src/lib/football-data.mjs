export const FOOTBALL_SCOPE = Object.freeze({
  footballData: ['PL','PD','SA','BL1','FL1','CL'],
  labels: ['PREMIER LEAGUE','LA LIGA','SERIE A','BUNDESLIGA','LIGUE 1','SÜPER LİG','UEFA']
});

const clean = (value) => typeof value === 'string' ? value.trim() : '';

export function normalizeFootballDataMatches(payload, now = new Date(), limit = 6) {
  const matches = Array.isArray(payload?.matches) ? payload.matches : [];
  return matches
    .filter((m) => m?.utcDate && new Date(m.utcDate).getTime() >= now.getTime())
    .map((m) => ({
      id: String(m.id ?? ''),
      competition: clean(m.competition?.name) || 'COMPETITION',
      code: clean(m.competition?.code),
      utcDate: m.utcDate,
      home: clean(m.homeTeam?.shortName || m.homeTeam?.name) || 'TBD',
      away: clean(m.awayTeam?.shortName || m.awayTeam?.name) || 'TBD',
      status: clean(m.status) || 'SCHEDULED'
    }))
    .sort((a,b) => new Date(a.utcDate) - new Date(b.utcDate))
    .slice(0, limit);
}

/**
 * @param {{token?: string, fetcher?: typeof fetch, now?: Date, limit?: number}} [options]
 */
export async function getUpcomingMatches({ token, fetcher = fetch, now = new Date(), limit = 6 } = {}) {
  if (!token) return { status:'UNAVAILABLE', source:'football-data.org', updatedAt:null, matches:[], reason:'SOURCE_NOT_CONFIGURED' };
  const dateFrom = now.toISOString().slice(0,10);
  const dateTo = new Date(now.getTime() + 7*86400000).toISOString().slice(0,10);
  const competitions = FOOTBALL_SCOPE.footballData.join(',');
  try {
    const response = await fetcher(`https://api.football-data.org/v4/matches?competitions=${competitions}&dateFrom=${dateFrom}&dateTo=${dateTo}`, { headers:{ 'X-Auth-Token':token } });
    if (!response.ok) return { status:'UNAVAILABLE', source:'football-data.org', updatedAt:new Date().toISOString(), matches:[], reason:`HTTP_${response.status}` };
    const data = await response.json();
    return { status:'READY', source:'football-data.org', updatedAt:new Date().toISOString(), matches:normalizeFootballDataMatches(data, now, limit), reason:null };
  } catch {
    return { status:'UNAVAILABLE', source:'football-data.org', updatedAt:new Date().toISOString(), matches:[], reason:'FETCH_FAILED' };
  }
}

// Labels a provider code actually covers. FOOTBALL_SCOPE.labels is the target
// scope; only covered labels may be shown as the current source scope.
export const FOOTBALL_DATA_COVERAGE = Object.freeze({
  PL:'PREMIER LEAGUE', PD:'LA LIGA', SA:'SERIE A', BL1:'BUNDESLIGA', FL1:'LIGUE 1', CL:'UEFA ŞAMPİYONLAR LİGİ'
});

const STATUS_LABELS = Object.freeze({
  SCHEDULED:'PLANLANDI', TIMED:'SAATİ BELLİ', IN_PLAY:'OYNANIYOR', PAUSED:'DEVRE ARASI', LIVE:'OYNANIYOR',
  FINISHED:'BİTTİ', POSTPONED:'ERTELENDİ', SUSPENDED:'DURDURULDU', CANCELLED:'İPTAL', AWARDED:'HÜKMEN'
});

/**
 * Public view of a Match Centre result. The home page is prerendered, so the
 * rows are a snapshot taken at build time: the data time is always shown and
 * an unavailable source hides the surface instead of advertising it.
 * @param {{status:string, updatedAt:string|null, matches:any[]}} result
 */
export function matchCentreView(result, { timeZone = 'Europe/Istanbul' } = {}) {
  const ready = result?.status === 'READY' && Boolean(result.updatedAt);
  if (!ready) return { visible:false, rows:[], dataTime:null, coveredLabels:[] };
  const fmt = new Intl.DateTimeFormat('tr-TR', { timeZone, day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
  return {
    visible:true,
    dataTime:fmt.format(new Date(result.updatedAt)),
    coveredLabels:FOOTBALL_SCOPE.footballData.map((code) => FOOTBALL_DATA_COVERAGE[code]).filter(Boolean),
    rows:(result.matches || []).map((m) => ({ ...m, time:fmt.format(new Date(m.utcDate)), statusLabel:STATUS_LABELS[m.status] || m.status })),
  };
}
