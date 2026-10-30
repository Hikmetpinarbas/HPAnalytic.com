(async function () {
  if (window.__carouselLoaded) return;
  window.__carouselLoaded = true;

  const track = document.getElementById('journal-carousel');
  if (!track) return;

  let articles = [];
  try {
    const res = await fetch('/assets/data/articles.json');
    articles = await res.json();
  } catch (e) {
    articles = [
      { slug: 'mac-besiktas-crystal-palace-2026-10-22', type: 'mac', date: '22.10.2026', title: 'Kristal köşk nasıl yıkılır?', excerpt: "Palace'ın en sık tekrarlayan pas zinciri geriye gidiyor.", read: 8 },
      { slug: 'mac-lille-galatasaray-2026-10-21', type: 'mac', date: '21.10.2026', title: 'Lille — Galatasaray', excerpt: 'Lille topu kendi yarısında Avrupa\'da en çok kaybeden ikinci takım.', read: 9 },
      { slug: 'articles-matematik-yalan-soylemeyi-bilmez', type: 'metrik', date: '29.10.2026', title: 'Matematik yalan söylemeyi bilmez', excerpt: 'Tukey, Box ve Goodhart ile istatistik ve yorumun sınırları.', read: 10 },
      { slug: 'portraits-vosse-de-boode', type: 'portre', date: '28.10.2026', title: 'Vosse de Boode', excerpt: 'Bilimin sahayla buluştuğu yer.', read: 6 },
    ];
  }

  const LABEL = { mac: 'MAÇ DOSYASI', metrik: 'METRİK', portre: 'PORTRE', scouting: 'SCOUTING', kultur: 'KÜLTÜR', articles: 'ANALİZ', portraits: 'PORTRE' };
  const items = articles.slice(0, 12);

  track.innerHTML = items.map(a => `
    <a href="/yazi/${a.slug}.html" class="c-card">
      <div class="c-card-meta">
        <span class="c-card-type">${LABEL[a.type] || 'YAZI'}</span>
        <span class="c-card-date">${a.date || ''}</span>
      </div>
      <h3 class="c-card-title">${a.title}</h3>
      <p class="c-card-excerpt">${a.excerpt || ''}</p>
      <div class="c-card-foot">
        <span>${a.read || 5} dk</span>
        <span class="c-card-cta">Oku →</span>
      </div>
    </a>
  `).join('');

  let isDown = false, startX = 0, startScroll = 0, moved = 0;

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDown = true;
    moved = 0;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.classList.add('is-grabbing');
    try { track.setPointerCapture(e.pointerId); } catch {}
  });

  track.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    track.scrollLeft = startScroll - dx;
  });

  const release = (e) => {
    if (!isDown) return;
    isDown = false;
    track.classList.remove('is-grabbing');
    try { track.releasePointerCapture(e.pointerId); } catch {}
    if (navigator.vibrate && moved > 10) navigator.vibrate(6);
  };

  track.addEventListener('pointerup', release);
  track.addEventListener('pointercancel', release);
  track.addEventListener('pointerleave', release);

  track.addEventListener('click', (e) => {
    if (moved > 8) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  document.querySelectorAll('.jnav').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = parseInt(btn.dataset.dir);
      const card = track.querySelector('.c-card');
      const step = card ? (card.offsetWidth + 16) * dir * 1.5 : 320 * dir;
      track.scrollBy({ left: step, behavior: 'smooth' });
    });
  });
})();
