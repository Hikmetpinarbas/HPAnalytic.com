const ARTICLES = [
  { slug: 'mac-lille-galatasaray-2026-10-21', title: 'Lille — Galatasaray: oyun kurulumunu yükselte boğmak', type: 'MAÇ DOSYASI', date: '21.10.2026', read: 9 },
  { slug: 'mac-besiktas-crystal-palace-2026-10-22', title: 'Kristal köşk nasıl yıkılır?', type: 'MAÇ DOSYASI', date: '22.10.2026', read: 8 },
  { slug: 'mac-fenerbahce-slavia-prag-2026-10-20', title: 'Fenerbahçe — Slavia Prag: ilk pres hattını geçmek', type: 'MAÇ DOSYASI', date: '20.10.2026', read: 10 },
  { slug: 'articles-matematik-yalan-soylemeyi-bilmez', title: 'Matematik yalan söylemeyi bilmez', type: 'METRİK', date: '29.10.2026', read: 10 },
];

const TYPE_COLOR = {
  'MAÇ DOSYASI': 'var(--neon)',
  'METRİK': 'var(--orange)',
  'TARİHTEN': '#6B7A99',
  'PORTRE': '#E8A0BF',
};

function render() {
  const el = document.getElementById('explore-latest');
  if (!el) return;
  el.innerHTML = ARTICLES.map(a => `
    <a href="/yazi/${a.slug}.html" class="explore-card">
      <div class="ec-meta">
        <span class="ec-type" style="color:${TYPE_COLOR[a.type] || 'var(--ink-soft)'}">${a.type}</span>
        <span class="ec-date">${a.date}</span>
      </div>
      <h3 class="ec-title">${a.title}</h3>
      <span class="ec-read">${a.read} dk okuma →</span>
    </a>`).join('');
}

(function boot() {
  const go = () => render();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else setTimeout(go, 100);
})();
