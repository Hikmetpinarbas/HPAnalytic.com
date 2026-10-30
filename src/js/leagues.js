const LEAGUES = [
  { code: 'PL',  name: 'Premier League',   country: 'İNGİLTERE', tint: 'rgba(180,255,57,.10)' },
  { code: 'PD',  name: 'La Liga',           country: 'İSPANYA',   tint: 'rgba(255,107,53,.10)' },
  { code: 'SA',  name: 'Serie A',           country: 'İTALYA',    tint: 'rgba(107,159,232,.10)' },
  { code: 'BL1', name: 'Bundesliga',        country: 'ALMANYA',   tint: 'rgba(255,107,53,.10)' },
  { code: 'FL1', name: 'Ligue 1',           country: 'FRANSA',    tint: 'rgba(155,123,184,.10)' },
  { code: 'CL',  name: 'Şampiyonlar Ligi',  country: 'UEFA',      tint: 'rgba(212,165,72,.10)' },
];

const SHORT = {
  'FC': '', ' AFC': '', '& Hove Albion': '', ' FC Barcelona': 'Barcelona',
  'Real Madrid CF': 'Real Madrid', 'Club Atlético de Madrid': 'Atlético',
  'Paris Saint-Germain FC': 'PSG', 'FC Bayern München': 'Bayern',
  'Bayer 04 Leverkusen': 'Leverkusen', 'Borussia Dortmund': 'Dortmund',
  'FC Internazionale Milano': 'Inter', 'AC Milan': 'Milan',
  'SSC Napoli': 'Napoli', 'Juventus FC': 'Juventus',
  'Arsenal FC': 'Arsenal', 'Liverpool FC': 'Liverpool',
  'Manchester City FC': 'Man City', 'Chelsea FC': 'Chelsea',
};

function shortName(n) {
  if (SHORT[n]) return SHORT[n];
  return n.replace(/ FC$/, '').replace(/^FC /, '').replace(/ AFC$/, '')
          .replace(/& Hove Albion/, '').replace(/ CF$/, '')
          .replace(/^Real /, 'Real ').replace(/ de Madrid$/, '');
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
}

async function getJSON(path) {
  try {
    const r = await fetch(path);
    if (!r.ok) return null;
    return r.json();
  } catch { return null; }
}


function computeMetrics(st, sc) {
  const table = st?.standings?.[0]?.table || [];
  if (!table.length) return [];
  const m = [];

  const attack = table.reduce((a, b) => (b.goalsFor ?? 0) > (a.goalsFor ?? 0) ? b : a);
  if (attack?.goalsFor) m.push({ lbl: 'EN GOLCÜ TAKIM', who: shortName(attack.team.name), val: attack.goalsFor, suf: 'gol' });

  const def = table.reduce((a, b) => (b.goalsAgainst ?? 99) < (a.goalsAgainst ?? 99) ? b : a);
  if (def?.goalsAgainst !== undefined) m.push({ lbl: 'EN İYİ SAVUNMA', who: shortName(def.team.name), val: def.goalsAgainst, suf: 'yedi' });

  const wins = table.reduce((a, b) => (b.won ?? 0) > (a.won ?? 0) ? b : a);
  if (wins?.won) m.push({ lbl: 'EN ÇOK GALİBİYET', who: shortName(wins.team.name), val: wins.won, suf: 'galibiyet' });

  const scorer = sc?.scorers?.[0];
  if (scorer?.goals) m.push({ lbl: 'GOL KRALI', who: scorer.player?.name || '—', val: scorer.goals, suf: 'gol' });

  const asst = sc?.scorers?.reduce((a, b) => (b.assists ?? 0) > (a.assists ?? 0) ? b : a);
  if (asst?.assists) m.push({ lbl: 'ASİST KRALI', who: asst.player?.name || '—', val: asst.assists, suf: 'asist' });

  return m;
}

function renderTicker(metrics) {
  if (!metrics.length) return '';
  const items = metrics.map(m =>
    `<span>${m.lbl} · <b>${m.who}</b> <em>${m.val}</em> ${m.suf}</span>`
  ).join('<span class="sep">◆</span>');
  // Marquee icin 2x kopya
  return `<div class="story-ticker"><div class="story-ticker-inner">${items}<span class="sep">◆</span>${items}</div></div>`;
}

function renderUclZones(table) {
  const z1 = table.filter(t => t.position <= 8).length;
  const z2 = table.filter(t => t.position >= 9 && t.position <= 16).length;
  const z3 = table.filter(t => t.position >= 17 && t.position <= 24).length;
  const z4 = table.filter(t => t.position >= 25).length;
  return `<div class="ucl-zones">
    <div class="z1"><span class="z-num">${z1}</span><span class="z-lbl">Son 16</span></div>
    <div class="z2"><span class="z-num">${z2}</span><span class="z-lbl">Playoff ev</span></div>
    <div class="z3"><span class="z-num">${z3}</span><span class="z-lbl">Playoff dep.</span></div>
    <div class="z4"><span class="z-num">${z4}</span><span class="z-lbl">Elendi</span></div>
  </div>`;
}

function rowClassUcl(pos) {
  if (pos <= 8) return 'story-row ucl-q1';
  if (pos <= 16) return 'story-row ucl-q2';
  if (pos <= 24) return 'story-row ucl-q3';
  return 'story-row ucl-out';
}

function renderCard(lg, st, rec, sc) {
  const card = document.createElement('div');
  card.className = 'story-card';
  card.style.setProperty('--team-tint', lg.tint);

  const table = st?.standings?.[0]?.table || [];
  const top5 = table.slice(0, 5);
  const leader = table[0];

  const top = `<div class="story-top">
    <span class="story-league">${lg.name}</span>
    <span class="story-country">${lg.country}</span>
  </div>`;

  let leaderEl = '';
  if (leader) {
    const pts = leader.points ?? 0;
    const gd = leader.goalDifference > 0 ? `+${leader.goalDifference}` : String(leader.goalDifference ?? 0);
    leaderEl = `<h3 class="story-leader">${shortName(leader.team.name)}</h3>
      <div class="story-leader-meta"><b>${pts}</b> puan · <b>${gd}</b> averaj · ${leader.playedGames ?? '?'} maç</div>`;
  }

  const isUcl = lg.code === 'CL';
  const rows = top5.map((t, i) => {
    const nm = shortName(t.team.name);
    const pts = t.points ?? 0;
    const cls = isUcl ? rowClassUcl(t.position) : 'story-row';
    return `<div class="${cls}"><span class="pos">${t.position}</span><span class="nm">${nm}</span><span class="pt">${pts}</span></div>`;
  }).join('');

  let tableEl = `<div class="story-table">${rows}</div>`;
  if (lg.code === 'CL') tableEl = renderUclZones(table) + tableEl;
  const metrics = computeMetrics(st, sc);
  const tickerEl = renderTicker(metrics);

  let scorerEl = '';
  const topScorer = sc?.scorers?.[0];
  if (topScorer) {
    scorerEl = `<div class="story-scorer">
      <span class="sc-name">${topScorer.player?.name || '—'}</span>
      <span class="sc-goals"><b>${topScorer.goals ?? 0}</b> gol</span>
    </div>`;
  }

  const last = rec?.recent?.[0];
  let lastEl = `<div class="story-lastmatch"><span>Son maç</span><span class="lm-score">—</span></div>`;
  if (last) {
    const h = shortName(last.homeTeam.name);
    const a = shortName(last.awayTeam.name);
    const hs = last.score?.fullTime?.home ?? '–';
    const as = last.score?.fullTime?.away ?? '–';
    lastEl = `<div class="story-lastmatch">
      <span>${fmtDate(last.utcDate)}</span>
      <span class="lm-score">${h} ${hs}–${as} ${a}</span>
    </div>`;
  }

  card.innerHTML = top + leaderEl + tableEl + scorerEl + lastEl + tickerEl;
  return card;
}

export async function initLeagues(trackId, dotsId) {
  const track = document.getElementById(trackId);
  const dots = document.getElementById(dotsId);
  if (!track) return;
  track.innerHTML = '';

  const results = await Promise.all(LEAGUES.map(async lg => {
    const [st, rec, sc] = await Promise.all([
      getJSON(`/assets/data/fdorg/${lg.code}-standings.json`),
      getJSON(`/assets/data/fdorg/${lg.code}-recent.json`),
      getJSON(`/assets/data/fdorg/${lg.code}-scorers.json`),
    ]);
    return { lg, st, rec, sc };
  }));

  results.forEach(({ lg, st, rec, sc }) => {
    if (st) track.appendChild(renderCard(lg, st, rec, sc));
  });

  // dots
  if (dots) {
    dots.innerHTML = '';
    const cardCount = track.children.length;
    for (let i = 0; i < cardCount; i++) {
      const d = document.createElement('span');
      if (i === 0) d.className = 'on';
      dots.appendChild(d);
    }
    const dotEls = dots.children;
    let rafId = null;
    track.addEventListener('scroll', () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const cards = Array.from(track.children);
        const centerX = track.scrollLeft + track.clientWidth / 2;
        let best = 0, bestDist = Infinity;
        cards.forEach((c, i) => {
          const cardCenter = c.offsetLeft + c.offsetWidth / 2;
          const dist = Math.abs(cardCenter - centerX);
          if (dist < bestDist) { bestDist = dist; best = i; }
        });
        Array.from(dotEls).forEach((d, i) => d.className = i === best ? 'on' : '');
      });
    }, { passive: true });
  }
}
