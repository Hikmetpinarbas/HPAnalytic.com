(function () {
  if (window.__extrasLoaded) return;
  window.__extrasLoaded = true;

  // ── 1. SCROLL-TO-TOP ──
  const topBtn = document.createElement('button');
  topBtn.className = 'hpa-top';
  topBtn.setAttribute('aria-label', 'Yukarı çık');
  topBtn.innerHTML = '↑';
  document.body.appendChild(topBtn);

  let ticking = false;
  function updateTop() {
    if (window.scrollY > 400) topBtn.classList.add('show');
    else topBtn.classList.remove('show');
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateTop);
  }, { passive: true });
  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (navigator.vibrate) navigator.vibrate(10);
  });
  updateTop();

  // ── 2. BÖLÜM NUMARALARI ──
  const SECTIONS = [
    { sel: '#featured', num: '01' },
    { sel: '#latest', num: '02' },
    { sel: '#journal', num: '03' },
    { sel: '#mac', num: '04' },
    { sel: '#metrik', num: '05' },
    { sel: '#portre', num: '06' },
    { sel: '#lab', num: '07' }
  ];
  SECTIONS.forEach(({ sel, num }) => {
    const el = document.querySelector(sel);
    if (!el) return;
    if (el.querySelector('.hpa-section-num')) return;
    const span = document.createElement('div');
    span.className = 'hpa-section-num';
    span.textContent = num;
    span.setAttribute('aria-hidden', 'true');
    el.appendChild(span);
  });

  // ── 3. MARQUEE CANLI NOKTA ──
  const marquee = document.querySelector('.marquee, [class*="marquee"]');
  if (marquee) {
    const firstSpan = marquee.querySelector('span');
    if (firstSpan && !firstSpan.querySelector('.hpa-live-dot')) {
      const dot = document.createElement('span');
      dot.className = 'hpa-live-dot';
      firstSpan.prepend(dot);
    }
  }
})();
