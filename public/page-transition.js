(function () {
  if (window.__ptLoaded) return;
  window.__ptLoaded = true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const KEY = 'hpa-pt';

  function mkCurtain() {
    if (document.getElementById('page-curtain')) return document.getElementById('page-curtain');
    const c = document.createElement('div');
    c.id = 'page-curtain';
    c.innerHTML = '<div class="pc-mark"><span class="pc-ring"></span><span class="pc-dot"></span></div><div class="pc-label">HPANALYTIC</div>';
    document.body.appendChild(c);
    requestAnimationFrame(() => c.classList.add('on'));
    return c;
  }

  // Varış: bir önceki sayfadan geldiysek, curtain'i kısa süre göster
  if (sessionStorage.getItem(KEY) === '1') {
    sessionStorage.removeItem(KEY);
    const c = mkCurtain();
    setTimeout(() => {
      c.classList.remove('on');
      setTimeout(() => c.remove(), 250);
    }, 100);
  }

  // Tıklama: curtain in → flag → navigate
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    if (a.target === '_blank') return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    const href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return;
    if (href.startsWith('http') && !href.startsWith(location.origin)) return;

    e.preventDefault();
    if (navigator.vibrate) navigator.vibrate(8);
    mkCurtain();
    sessionStorage.setItem(KEY, '1');
    setTimeout(() => { window.location.href = a.href; }, 380);
  });
})();
