(function () {
  if (window.__piLoaded) return;
  window.__piLoaded = true;

  // ── PROGRESS BAR ──
  const bar = document.createElement('div');
  bar.className = 'hpa-progress';
  document.body.appendChild(bar);

  let ticking = false;
  function updateProgress() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? (window.scrollY / h) * 100 : 0;
    bar.style.width = p + '%';
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateProgress);
  }, { passive: true });
  updateProgress();

  // ── SECTION INDICATOR ──
  const SECTION_MAP = [
    { id: 'header', label: 'Hero' },
    { id: 'featured', label: 'Öne Çıkan' },
    { id: 'latest', label: 'Son Yazılar' },
    { id: 'journal', label: 'Günlük' },
    { id: 'mac', label: 'Maç' },
    { id: 'metrik', label: 'Metrik' },
    { id: 'portre', label: 'Portre' },
    { id: 'lab', label: 'Data Lab' }
  ];

  const indicator = document.createElement('div');
  indicator.className = 'hpa-indicator';
  document.body.appendChild(indicator);

  const dots = [];
  SECTION_MAP.forEach(sec => {
    const el = document.getElementById(sec.id);
    if (!el) return;
    const dot = document.createElement('button');
    dot.className = 'hpa-indicator-dot';
    dot.dataset.label = sec.label;
    dot.dataset.target = sec.id;
    dot.setAttribute('aria-label', sec.label);
    dot.addEventListener('click', () => {
      const target = document.getElementById(sec.id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    indicator.appendChild(dot);
    dots.push({ dot, el });
  });

  if (dots.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          dots.forEach(d => d.dot.classList.toggle('active', d.el === e.target));
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    dots.forEach(d => io.observe(d.el));
  }

  // ── SKELETON LOADER (Data Lab için) ──
  const chartContainers = ['radar-container', 'shotmap-container', 'passnet-container'];
  chartContainers.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    // İçerik boşsa skeleton ekle
    if (!el.querySelector('svg')) {
      const sk = document.createElement('div');
      sk.className = 'hpa-skeleton-wrap';
      sk.innerHTML = `
        <div class="hpa-skeleton hpa-skeleton-line" style="width:40%;margin-bottom:16px"></div>
        <div class="hpa-skeleton hpa-skeleton-chart"></div>
        <div class="hpa-skeleton hpa-skeleton-line"></div>
        <div class="hpa-skeleton hpa-skeleton-line"></div>
      `;
      el.appendChild(sk);
      // 2sn sonra skeleton'ı kaldır (grafik yüklenince kendini gösterir)
      setTimeout(() => {
        if (el.querySelector('svg')) sk.remove();
      }, 2000);
    }
  });
})();
