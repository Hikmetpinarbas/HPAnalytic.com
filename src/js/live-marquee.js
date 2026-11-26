// Canlı bülten ticker'ı — kaynak, tarih, doğrulama ve TTL tabanlı.
// Veri sözleşmesi: docs/TICKER-VERI-SOZLESME.md (hpa.live_ticker.v1)
// Fail-closed: veri yoksa, yayın yetkisi yoksa, TTL dolmuşsa veya zorunlu
// alanlar eksikse hiçbir içerik iddiası gösterilmez; nötr yetenek şeridine dönülür.
import {
  VERIFICATION,
  FALLBACK_TEXT,
  REFETCH_MS,
  formatTR,
  collectItems
} from './ticker-contract.mjs';

const TICKER_URL = '/assets/data/live-ticker.json';

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

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
    if (i === 1) {
      group.setAttribute('aria-hidden', 'true');
      group.inert = true;
    }
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
  track.append(group);
  // Reduced-motion'da animasyon kapalıdır; ikinci kopya yalnızca tekrar
  // olur — klon hiç render edilmez. Animasyonlu durumda klon aria-hidden
  // + inert yapılır; klondaki bağlantılar klavye odağı alamaz.
  if (prefersReducedMotion()) return;
  const clone = group.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  clone.inert = true;
  clone.querySelectorAll('a').forEach(a => { a.tabIndex = -1; });
  track.append(clone);
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

function watchReducedMotion(section, rerender) {
  if (typeof window.matchMedia !== 'function') return;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onChange = () => rerender();
  if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange);
  else if (typeof mq.addListener === 'function') mq.addListener(onChange);
}

export function initLiveMarquee() {
  const section = ensureSection();
  if (!section) return;
  if (section.dataset.tickerBound === '1') return;
  section.dataset.tickerBound = '1';

  let lastItems = null;
  const rerender = () => {
    if (lastItems === null || lastItems.length === 0) renderFallback(section);
    else renderLive(section, lastItems);
  };

  renderFallback(section);
  watchVisibility(section);
  watchReducedMotion(section, rerender);

  const refresh = async () => {
    try {
      const res = await fetch(TICKER_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      const items = collectItems(json, Date.now());
      lastItems = items;
      if (items === null || items.length === 0) renderFallback(section);
      else renderLive(section, items);
    } catch {
      lastItems = null;
      renderFallback(section);
    }
  };

  refresh();
  setInterval(refresh, REFETCH_MS);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiveMarquee);
  } else {
    initLiveMarquee();
  }
}
