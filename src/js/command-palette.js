export function initCommandPalette() {
  const items = [
    { label: 'Ana Sayfa', url: '/HPAnalytic.com/', tag: 'sayfa' },
    { label: 'Maç Dosyaları', url: '/HPAnalytic.com/mac-dosyalari', tag: 'sayfa' },
    { label: 'Süper Lig', url: '/HPAnalytic.com/super-lig', tag: 'lig' },
    { label: 'Top 5 Ligler', url: '/HPAnalytic.com/top-5', tag: 'lig' },
    { label: 'Avrupa', url: '/HPAnalytic.com/avrupa', tag: 'lig' },
    { label: 'Kadınlar', url: '/HPAnalytic.com/women', tag: 'sayfa' },
    { label: 'Data Lab', url: '/HPAnalytic.com/lab', tag: 'sayfa' },
    { label: 'Lille — Galatasaray', url: '/HPAnalytic.com/yazi/mac-lille-galatasaray-2026-10-21.html', tag: 'yazı' },
    { label: '2002 Dünya Kupası', url: '/HPAnalytic.com/yazi/t-rk-futbolunun-2002-d-nya-kupas-ndaki-ba-ar-s-n-n-mekanizmas.html', tag: 'yazı' },
    { label: 'Vosse de Boode', url: '/HPAnalytic.com/yazi/portraits-vosse-de-boode.html', tag: 'portre' },
    { label: 'Matematik Yalan Söylemez', url: '/HPAnalytic.com/yazi/articles-matematik-yalan-soylemeyi-bilmez.html', tag: 'yazı' },
    { label: 'Lobanovskyi', url: '/HPAnalytic.com/yazi/articles-valeriy-lobanovskyi-takimin-zekasini-tasarlamak.html', tag: 'yazı' }
  ];

  const overlay = document.createElement('div');
  overlay.className = 'cmdk-overlay';
  overlay.innerHTML = `
    <div class="cmdk-box">
      <input type="text" class="cmdk-input" placeholder="Ara... (yazı, lig, sayfa)" autocomplete="off">
      <ul class="cmdk-list"></ul>
      <div class="cmdk-hint">↑↓ gezin · Enter seç · Esc kapat</div>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('.cmdk-input');
  const list = overlay.querySelector('.cmdk-list');
  let filtered = [...items, ...(window.__searchExtra||[])];
  let activeIdx = 0;

  function render() {
    list.innerHTML = filtered.map((item, i) =>
      `<li class="cmdk-item ${i === activeIdx ? 'active' : ''}" data-url="${item.url}">
        <span class="cmdk-label">${item.label}</span>
        <span class="cmdk-tag">${item.tag}</span>
      </li>`
    ).join('');
  }

  function open() {
    overlay.classList.add('open');
    input.value = '';
    filtered = [...items, ...(window.__searchExtra||[])];
    activeIdx = 0;
    render();
    setTimeout(() => input.focus(), 50);
  }

  function close() {
    overlay.classList.remove('open');
    input.blur();
  }

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    const all=[...items,...(window.__searchExtra||[])]; filtered = q ? all.filter(i => i.label.toLowerCase().includes(q) || i.tag.includes(q)) : all;
    activeIdx = 0;
    render();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, filtered.length - 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[activeIdx]) location.href = filtered[activeIdx].url; }
    else if (e.key === 'Escape') close();
  });

  list.addEventListener('click', (e) => {
    const li = e.target.closest('.cmdk-item');
    if (li) location.href = li.dataset.url;
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open(); }
    else if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });

  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  // Mobilde arama butonu için global fonksiyon
  window.__openCmdk = open;
}

// Search index'i yükle
fetch('/search-index.json').then(r => r.json()).then(yazilar => {
  yazilar.forEach(y => {
    window.__searchExtra = window.__searchExtra || [];
    window.__searchExtra.push({ label: y.title, url: y.url, tag: 'yazı' });
  });
}).catch(() => {});

// Mobil arama butonu header'a ekle
document.addEventListener('DOMContentLoaded', () => {
  const actions = document.querySelector('.nav-actions');
  if (!actions || document.getElementById('mobile-search-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'mobile-search-btn';
  btn.className = 'search-btn';
  btn.setAttribute('aria-label', 'Ara');
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>';
  btn.addEventListener('click', () => window.__openCmdk && window.__openCmdk());
  actions.insertBefore(btn, actions.firstChild);
});
