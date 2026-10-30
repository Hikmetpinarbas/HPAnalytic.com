(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.__ambientLoaded) return;
  window.__ambientLoaded = true;

  const style = document.createElement('style');
  style.textContent = `
    #ambient-canvas {
      position: fixed; inset: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 1;
      opacity: 0;
      transition: opacity 1.6s ease;
    }
    body > header,
    body > section,
    body > footer,
    body > div:not(#ambient-canvas):not(#lightbox) {
      position: relative;
      z-index: 2;
    }
  `;
  document.head.appendChild(style);

  const canvas = document.createElement('canvas');
  canvas.id = 'ambient-canvas';
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d', { alpha: true });
  let w, h, dpr;
  const mouse = { x: -2000, y: -2000 };
  const target = { x: -2000, y: -2000 };
  let t = 0;
  let running = true;
  let rafId;

  const isMobile = window.innerWidth < 768;
  const spacing = isMobile ? 65 : 50;
  const glowRadius = isMobile ? 180 : 260;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    if (!running) return;
    rafId = requestAnimationFrame(draw);

    t += 0.004;
    mouse.x += (target.x - mouse.x) * 0.12;
    mouse.y += (target.y - mouse.y) * 0.12;

    ctx.clearRect(0, 0, w, h);

    const drift = Math.sin(t) * 8;
    const cols = Math.ceil(w / spacing) + 2;
    const rows = Math.ceil(h / spacing) + 2;
    const g2 = glowRadius * glowRadius;

    // Pass 1: base dots (batched color)
    ctx.fillStyle = 'rgba(180, 255, 57, 0.08)';
    for (let i = 0; i < cols; i++) {
      const bx = i * spacing + drift;
      for (let j = 0; j < rows; j++) {
        const y = j * spacing + Math.sin(t * 1.5 + i * 0.18 + j * 0.14) * 3;
        const dx = bx - mouse.x;
        const dy = y - mouse.y;
        if (dx * dx + dy * dy < g2) continue;
        ctx.fillRect(bx, y, 1, 1);
      }
    }

    // Pass 2: cursor-boosted dots
    for (let i = 0; i < cols; i++) {
      const bx = i * spacing + drift;
      for (let j = 0; j < rows; j++) {
        const y = j * spacing + Math.sin(t * 1.5 + i * 0.18 + j * 0.14) * 3;
        const dx = bx - mouse.x;
        const dy = y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 >= g2) continue;
        const boost = 1 - Math.sqrt(d2) / glowRadius;
        const size = 1 + boost * 3;
        ctx.fillStyle = 'rgba(180, 255, 57, ' + (0.08 + boost * 0.55) + ')';
        ctx.fillRect(bx - size / 2, y - size / 2, size, size);
      }
    }

    // Cursor glow
    if (mouse.x > -1000) {
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, glowRadius);
      g.addColorStop(0, 'rgba(180, 255, 57, 0.055)');
      g.addColorStop(0.4, 'rgba(180, 255, 57, 0.018)');
      g.addColorStop(1, 'rgba(180, 255, 57, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(mouse.x - glowRadius, mouse.y - glowRadius, glowRadius * 2, glowRadius * 2);
    }
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', function (e) {
    target.x = e.clientX; target.y = e.clientY;
  });
  window.addEventListener('touchmove', function (e) {
    const tt = e.touches[0];
    if (tt) { target.x = tt.clientX; target.y = tt.clientY; }
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { running = false; cancelAnimationFrame(rafId); }
    else { running = true; draw(); }
  });

  resize();
  draw();
  setTimeout(function () { canvas.style.opacity = '1'; }, 100);
})();
