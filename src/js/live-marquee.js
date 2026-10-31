const FACTS = [
  "2005 İstanbul: Milan 3-0 öndeydi. 6 dakikada 3 gol. Futbol skorla bitmez.",
  "Kadın futbolcuların eklem esnekliği daha yüksek. Dar alanda çalım avantajı.",
  "Mesut Özil: Türkiye'de hiç oynamadı. Ama Real Madrid'e gitti.",
  "Leicester City: 5000'e 1 oran. Model değil, mekanizma kazandı.",
  "Türk voleybolu: 2023 Milletler Ligi şampiyonluğu bir sistemin sonucu.",
  "2002 Dünya Kupası: Savunma bir mesafe hesabıydı.",
  "Filenin Sultanları: Vargas 41 sayı. Arkasında pas kalitesi vardı."
];
const MATCHES = [
  { label: 'GS 3 — FB ? (Derbi)' },
  { label: 'Lille 2 — 4 GS (UCL)' },
  { label: 'Konya 0 — 4 GS (Süper Lig)' }
];
export function initLiveMarquee() {
  const jersey = document.querySelector('.jersey-section');
  if (!jersey) return;
  const old = document.querySelector('.marquee-section');
  if (old) old.remove();
  const createHTML = (t) => `<span style="padding:0 4rem;font-size:11px;letter-spacing:.15em;color:var(--ink-soft);display:inline-flex;align-items:center;">${t}</span><span style="padding:0 4rem;font-size:11px;letter-spacing:.15em;color:var(--ink-soft);display:inline-flex;align-items:center;">${t}</span>`;
  const pool = [...MATCHES.map(m => `📊 ${m.label}`), ...FACTS];
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
