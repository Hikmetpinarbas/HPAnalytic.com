(function () {
  if (window.__revealLoaded) return;
  window.__revealLoaded = true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity .9s cubic-bezier(.2,.9,.3,1),
                  transform .9s cubic-bezier(.2,.9,.3,1);
      will-change: opacity, transform;
    }
    .reveal.in {
      opacity: 1;
      transform: translateY(0);
    }
    .reveal.delay-1 { transition-delay: .08s; }
    .reveal.delay-2 { transition-delay: .16s; }
    .reveal.delay-3 { transition-delay: .24s; }
  `;
  document.head.appendChild(style);

  const targets = document.querySelectorAll(
    '.art-card, .article-card, .featured-card, .rel-card, ' +
    '.carousel-card, .section-bar, .hero, .featured-tag, .lab-card'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    const idx = i % 4;
    if (idx > 0) el.classList.add('delay-' + idx);
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add('in'));
  }
})();
