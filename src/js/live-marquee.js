// HP-MISTRAL-WAVE1-SITE-01 — Canlı skor şeridi.
// Kural: Doğrulanabilir güncel skor yoksa skor GÖSTERİLMEZ, uydurulmaz ve
// eski skor asla güncelmiş gibi dönmez (fail-closed).
const FACTS = [
  "2005 \u0130stanbul: Milan 3-0 \u00f6ndeydi. 6 dakikada 3 gol. Futbol skorla bitmez.",
  "Kad\u0131n futbolcular\u0131n eklem esnekli\u011fi daha y\u00fcksek. Dar alanda \u00e7al\u0131m avantaj\u0131.",
  "Mesut \u00d6zil: T\u00fcrkiye'de hi\u00e7 oynamad\u0131. Ama Real Madrid'e gitti.",
  "Leicester City: 5000'e 1 oran. Model de\u011fil, mekanizma kazand\u0131.",
  "T\u00fcrk voleybolu: 2023 Milletler Ligi \u015fampiyonlu\u011fu bir sistemin sonucu.",
  "2002 D\u00fcnya Kupas\u0131: Savunma bir mesafe hesab\u0131yd\u0131.",
  "Filenin Sultanlar\u0131: Vargas 41 say\u0131. Arkas\u0131nda pas kalitesi vard\u0131."
];

const NO_DATA_NOTE = "\ud83d\udcca Canl\u0131 do\u011frulanm\u0131\u015f skor yok \u2014 say\u0131 uydurulmaz, sadece analiz yay\u0131nlan\u0131r.";

export const TICKER_URL = '/assets/data/live-ticker.json';
export const MAX_AGE_MS = 48 * 60 * 60 * 1000;
const SCORE_RE = /^\d+\s*[-\u2013\u2014]\s*\d+$/;

export function isFresh(fetchedAt, now) {
  if (typeof fetchedAt !== 'string' || !fetchedAt) return false;
  const t = Date.parse(fetchedAt);
  if (!Number.isFinite(t)) return false;
  return (now - t) >= 0 && (now - t) <= MAX_AGE_MS;
}

export function verifiedMatchLabels(data, now = Date.now()) {
  if (!data || data.available !== true || !Array.isArray(data.items)) return [];
  if (!isFresh(data.fetched_at, now)) return [];
  const labels = [];
  for (const item of data.items) {
    if (!item || typeof item !== 'object') continue;
    if (typeof item.home !== 'string' || typeof item.away !== 'string') continue;
    const dateOk = typeof item.date === 'string' && Number.isFinite(Date.parse(item.date));
    if (!dateOk) continue;
    if (item.status === 'live' || item.status === 'final') {
      if (SCORE_RE.test(String(item.score || ''))) {
        const tag = item.status === 'live' ? 'L\u0130VE' : 'MS';
        labels.push(`${item.home} ${item.score} ${item.away} (${tag})`);
      }
    } else if (item.status === 'scheduled') {
      const d = new Date(item.date);
      const day = d.toISOString().slice(0, 10).split('-').reverse().join('.');
      labels.push(`${item.home} \u2014 ${item.away} \u00b7 ${day} (Beklenen)`);
    }
  }
  return labels;
}

export function buildPool(data, now = Date.now()) {
  const labels = verifiedMatchLabels(data, now);
  const items = [...labels.map(label => `\ud83d\udcca ${label}`), ...FACTS];
  if (labels.length === 0) items.splice(1, 0, NO_DATA_NOTE);
  return items;
}

async function loadTicker(url = TICKER_URL) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export function initLiveMarquee(ticker) {
  const jersey = document.querySelector('.jersey-section');
  if (!jersey) return;
  const old = document.querySelector('.marquee-section');
  if (old) old.remove();
  const createHTML = (t) => `<span style="padding:0 4rem;font-size:11px;letter-spacing:.15em;color:var(--ink-soft);display:inline-flex;align-items:center;">${t}</span><span style="padding:0 4rem;font-size:11px;letter-spacing:.15em;color:var(--ink-soft);display:inline-flex;align-items:center;">${t}</span>`;
  const pool = buildPool(ticker);
  const section = document.createElement('section');
  section.className = 'marquee-section';
  section.innerHTML = `<div class="marquee-track">${createHTML(pool[0])}</div>`;
  jersey.insertAdjacentElement('afterend', section);
  let idx = 0;
  setInterval(() => {
    const active = document.querySelector('.marquee-section');
    if (!active) return;
    idx = (idx + 1) % pool.length;
    active.style.opacity = '0';
    setTimeout(() => {
      active.innerHTML = `<div class="marquee-track">${createHTML(pool[idx])}</div>`;
      active.style.opacity = '1';
    }, 400);
  }, 15000);
}

export async function initLiveMarqueeAsync() {
  initLiveMarquee(await loadTicker());
}
