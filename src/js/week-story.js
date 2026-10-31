const FEATURED = {
  slug: 'mac-lille-galatasaray-2026-10-21',
  title: 'Lille — Galatasaray: oyun kurulumunu <em>yükselte</em> boğmak',
  excerpt: 'Lille kendi yarısında Avrupa\'da en çok top kaybeden ikinci takım. Galatasaray bu kayıpları değerlendirebilir mi?',
  tag: 'MAÇ DOSYASI',
  date: '21.10.2026',
  read: '9 dk okuma',
  href: '/yazi/mac-lille-galatasaray-2026-10-21.html',
};

const PITCH_SVG = `
<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="380" height="240" rx="2" fill="none" stroke="rgba(180,255,57,0.25)" stroke-width="1"/>
  <line x1="200" y1="10" x2="200" y2="250" stroke="rgba(180,255,57,0.2)" stroke-width="1"/>
  <circle cx="200" cy="130" r="26" fill="none" stroke="rgba(180,255,57,0.2)" stroke-width="1"/>
  <rect x="10" y="70" width="44" height="120" fill="none" stroke="rgba(180,255,57,0.2)" stroke-width="1"/>
  <rect x="346" y="70" width="44" height="120" fill="none" stroke="rgba(180,255,57,0.2)" stroke-width="1"/>

  <line x1="80" y1="180" x2="130" y2="110" stroke="rgba(180,255,57,0.55)" stroke-width="1.2"/>
  <line x1="130" y1="110" x2="175" y2="160" stroke="rgba(180,255,57,0.5)" stroke-width="1.2"/>
  <line x1="175" y1="160" x2="220" y2="90" stroke="rgba(180,255,57,0.5)" stroke-width="1.2"/>
  <line x1="220" y1="90" x2="280" y2="140" stroke="rgba(255,107,53,0.55)" stroke-width="1.2"/>
  <line x1="280" y1="140" x2="330" y2="80" stroke="rgba(255,107,53,0.5)" stroke-width="1.2"/>
  <line x1="90" y1="70" x2="150" y2="130" stroke="rgba(180,255,57,0.4)" stroke-width="1"/>
  <line x1="250" y1="200" x2="320" y2="180" stroke="rgba(255,107,53,0.4)" stroke-width="1"/>

  <circle cx="80" cy="180" r="5" fill="#B4FF39"/>
  <circle cx="130" cy="110" r="4" fill="#B4FF39"/>
  <circle cx="175" cy="160" r="4" fill="#B4FF39"/>
  <circle cx="220" cy="90" r="4" fill="#B4FF39"/>
  <circle cx="90" cy="70" r="3" fill="#B4FF39"/>
  <circle cx="150" cy="130" r="3" fill="#B4FF39"/>

  <circle cx="280" cy="140" r="5" fill="#FF6B35"/>
  <circle cx="330" cy="80" r="4" fill="#FF6B35"/>
  <circle cx="250" cy="200" r="4" fill="#FF6B35"/>
  <circle cx="320" cy="180" r="3" fill="#FF6B35"/>
</svg>`;

function render() {
  const el = document.getElementById('ws-inner');
  if (!el) return;
  el.innerHTML = `
    <div class="ws-card">
      <div>
        <div class="ws-meta">
          <span class="ws-tag">${FEATURED.tag}</span>
          <span class="ws-date">${FEATURED.date}</span>
          <span class="ws-read">${FEATURED.read}</span>
        </div>
        <h2 class="ws-title">${FEATURED.title}</h2>
        <p class="ws-excerpt">${FEATURED.excerpt}</p>
        <a href="${FEATURED.href}" class="ws-cta">
          <span>Hikâyeyi oku</span><span>→</span>
        </a>
      </div>
      <div class="ws-graphic">${PITCH_SVG}</div>
    </div>`;
}

(function boot() {
  const go = () => render();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else setTimeout(go, 100);
})();
