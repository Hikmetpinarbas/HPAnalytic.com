// Canlı bülten ticker'ı — kaynak, tarih, doğrulama ve TTL tabanlı.
// Veri sözleşmesi: docs/TICKER-VERI-SOZLESME.md (hpa.live_ticker.v1)
// Fail-closed: veri yoksa, yayın yetkisi yoksa, TTL dolmuşsa veya zorunlu
// alanlar eksikse hiçbir içerik iddiası gösterilmez; nötr yetenek şeridine dönülür.

const TICKER_URL = '/assets/data/live-ticker.json';
import { collectItems } from './ticker-contract.mjs';

function buildItemNode(item) {
  const verif = VERIFICATION[item.dogrulama];
  const node = document.createElement(item.href ? 'a' : 'span');
  node.className = `ticker-item ${verif.cls}`;
  if (item.href) node.href = item.href;

  const badge = document.createElement('span');
  badge.className = 'ticker-verif';
  badge.textContent = verif.label;

  const text = document.createElement('span');
  text.className = 'ticker-text';
  text.textContent = item.text.trim();

  const meta = document.createElement('span');
  meta.className = 'ticker-meta';
  meta.textContent = `${item.kaynak.trim()} · ${formatTR(item.tarih)}`;

  node.append(badge, text, meta);
  return node;
}

function renderFallback(section) {
  section.dataset.state = 'fallback';
  const track = section.querySelector('.marquee-track');
  if (!track) return;
  track.replaceChildren();
  for (let i = 0; i < 2; i++) {
    const group = document.createElement('span');
    if (i === 1) group.setAttribute('aria-hidden', 'true');
    group.textContent = FALLBACK_TEXT;
    track.appendChild(group);
  }
}

function renderLive(section, items) {
  section.dataset.state = 'live';
  const track = section.querySelector('.marquee-track');
  if (!track) return;
  track.replaceChildren();
  const group = document.createElement('span');
  group.className = 'ticker-group';
  items.forEach(item => group.appendChild(buildItemNode(item)));
  const clone = group.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  track.append(group, clone);
}

function ensureSection() {
  let section = document.querySelector('.marquee-section');
  if (section) return section;
  const anchor = document.querySelector('.jersey-section') || document.querySelector('main');
  if (!anchor) return null;
  section = document.createElement('section');
  section.className = 'marquee-section ticker-section';
  section.setAttribute('role', 'region');
  section.setAttribute('aria-label', 'Canlı bülten');
  section.innerHTML = '<div class="marquee-track"></div>';
  if (anchor.classList.contains('jersey-section')) anchor.insertAdjacentElement('afterend', section);
  else anchor.prepend(section);
  return section;
}

function watchVisibility(section) {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      section.classList.toggle('is-offscreen', !entry.isIntersecting);
    });
  }, { threshold: 0 });
  io.observe(section);
}

export function initLiveMarquee() {
  const section = ensureSection();
  if (!section) return;
  if (section.dataset.tickerBound === '1') return;
  section.dataset.tickerBound = '1';

  renderFallback(section);
  watchVisibility(section);

  const refresh = async () => {
    try {
      const res = await fetch(TICKER_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      const items = collectItems(json, Date.now());
      if (items === null || items.length === 0) renderFallback(section);
      else renderLive(section, items);
    } catch {
      renderFallback(section);
    }
  };

  refresh();
  setInterval(refresh, REFETCH_MS);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLiveMarquee);
} else {
  initLiveMarquee();
}
