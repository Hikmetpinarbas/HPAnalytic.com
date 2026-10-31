const W = 600, H = 600;

function init() {
  const svg = document.querySelector('.dl-vis');
  if (!svg || svg.dataset.ready === '1') return;
  svg.dataset.ready = '1';

  const nodesG = svg.querySelector('#dl-nodes');
  const linksG = svg.querySelector('#dl-links');
  if (!nodesG || !linksG) return;

  // 11 oyuncu — sahanın iki yarısında
  const nodes = [];
  for (let i = 0; i < 11; i++) {
    const side = i < 5 ? 'L' : (i < 10 ? 'R' : 'M');
    const x = side === 'L' ? 80 + Math.random() * 200 : (side === 'R' ? 320 + Math.random() * 200 : 280 + Math.random() * 40);
    const y = 100 + Math.random() * 400;
    const col = side === 'L' ? '#B4FF39' : (side === 'R' ? '#FF6B35' : '#E8A0BF');
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', x);
    c.setAttribute('cy', y);
    c.setAttribute('r', 5 + Math.random() * 4);
    c.setAttribute('fill', col);
    c.setAttribute('class', 'node');
    c.setAttribute('opacity', '0.9');
    nodesG.appendChild(c);
    nodes.push({ el: c, x, y, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, col });
  }

  // Bağlantı çizgileri
  const links = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() > 0.35) continue;
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('stroke', nodes[i].col);
      l.setAttribute('stroke-width', '0.8');
      l.setAttribute('class', 'link');
      l.setAttribute('opacity', '0.3');
      linksG.appendChild(l);
      links.push({ el: l, a: i, b: j });
    }
  }

  function frame() {
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 40 || n.x > W - 40) n.vx *= -1;
      if (n.y < 40 || n.y > H - 40) n.vy *= -1;
      n.el.setAttribute('cx', n.x.toFixed(1));
      n.el.setAttribute('cy', n.y.toFixed(1));
    }
    for (const l of links) {
      const A = nodes[l.a], B = nodes[l.b];
      const dx = A.x - B.x, dy = A.y - B.y;
      const dist = Math.hypot(dx, dy);
      const op = Math.max(0, 1 - dist / 350);
      l.el.setAttribute('x1', A.x.toFixed(1));
      l.el.setAttribute('y1', A.y.toFixed(1));
      l.el.setAttribute('x2', B.x.toFixed(1));
      l.el.setAttribute('y2', B.y.toFixed(1));
      l.el.setAttribute('opacity', (op * 0.5).toFixed(2));
    }
    requestAnimationFrame(frame);
  }
  frame();
}

(function boot() {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 100));
  else setTimeout(init, 200);
  if (import.meta && import.meta.hot) import.meta.hot.accept(() => init());
})();
