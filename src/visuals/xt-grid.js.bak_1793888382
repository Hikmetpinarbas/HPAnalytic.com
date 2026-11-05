const COLOR_STOPS = [
  { t: 0.00, c: [12, 16, 24] },     // koyu zemin
  { t: 0.15, c: [30, 55, 25] },     // koyu yeşil
  { t: 0.30, c: [120, 200, 40] },   // neon
  { t: 0.44, c: [255, 107, 53] },   // turuncu
];

function colorFor(v) {
  const max = 0.44;
  const t = Math.min(1, v / max);
  let a = COLOR_STOPS[0], b = COLOR_STOPS[COLOR_STOPS.length-1];
  for (let i = 0; i < COLOR_STOPS.length-1; i++) {
    if (t >= COLOR_STOPS[i].t && t <= COLOR_STOPS[i+1].t) {
      a = COLOR_STOPS[i]; b = COLOR_STOPS[i+1]; break;
    }
  }
  const span = b.t - a.t || 1;
  const p = (t - a.t) / span;
  const r = Math.round(a.c[0] + (b.c[0]-a.c[0])*p);
  const g = Math.round(a.c[1] + (b.c[1]-a.c[1])*p);
  const bl = Math.round(a.c[2] + (b.c[2]-a.c[2])*p);
  return `rgb(${r},${g},${bl})`;
}

export async function render(container) {
  const data = await fetch('/assets/data/lille-gs/xt_grid.json').then(r => r.json());
  const cells = data.cells;
  const traces = data.traces || [];

  const W = 900, H = 580, PAD = 40;
  const cw = (W - PAD*2) / 10;
  const ch = (H - PAD*2) / 8;

  let cellSvg = '';
  let labelSvg = '';
  cells.forEach((c, i) => {
    const x = PAD + c.col * cw;
    const y = PAD + (7 - c.row) * ch;
    const fill = colorFor(c.xT);
    cellSvg += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${fill}" opacity="0" class="xtg-cell-anim" data-row="${c.row}" data-col="${c.col}" data-xt="${c.xT}" data-events="${c.events}" data-idx="${i}"/>`;
    labelSvg += `<text x="${x+cw/2}" y="${y+ch/2+3.5}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="rgba(255,255,255,0.9)" pointer-events="none" opacity="0" class="xtg-num-anim" data-idx="${i}" data-val="${c.xT}">0.00</text>`;
  });

  const svg = `
    <svg viewBox="0 0 ${W} ${H}" class="xtg-svg" xmlns="http://www.w3.org/2000/svg">
      <g id="xtg-cells">${cellSvg}</g>
      <g fill="none" stroke="rgba(180,255,57,0.18)" stroke-width="1" pointer-events="none">
        <rect x="${PAD}" y="${PAD}" width="${W-PAD*2}" height="${H-PAD*2}"/>
        <line x1="${PAD+cw*5}" y1="${PAD}" x2="${PAD+cw*5}" y2="${H-PAD}"/>
        <circle cx="${PAD+cw*5}" cy="${PAD+ch*4}" r="${ch*1.2}"/>
        <rect x="${PAD}" y="${PAD+ch*2.5}" width="${cw*1.2}" height="${ch*3}"/>
        <rect x="${W-PAD-cw*1.2}" y="${PAD+ch*2.5}" width="${cw*1.2}" height="${ch*3}"/>
      </g>
      <g id="xtg-labels">${labelSvg}</g>
      <g id="xtg-traces"></g>
    </svg>`;

  container.innerHTML = `
    <div class="xtg-wrap">
      <div class="xtg-head">
        <div class="xtg-stat"><span class="n" style="color:#FF6B35">${Math.max(...cells.map(c=>c.xT)).toFixed(2)}</span><span class="l">en yüksek xT</span></div>
        <div class="xtg-stat"><span class="n" style="color:#B4FF39">${(cells.reduce((a,c)=>a+c.xT,0)/cells.length).toFixed(2)}</span><span class="l">ortalama xT</span></div>
        <div class="xtg-stat"><span class="n">${traces.length}</span><span class="l">gol trace</span></div>
      </div>
      <div class="xtg-stage">${svg}</div>
      <div class="xtg-legend">
        <div class="xtg-gradient"></div>
        <div class="xtg-scale"><span>0.00 kendi kale</span><span>0.15</span><span>0.30</span><span>0.44 rakip</span></div>
      </div>
      <div class="xtg-note">xT vekil: mesafe + açı (Karstens-Zaman yaklaşımı) · lokal kalibrasyon ×%25. Hover: hücre olay sayısı.</div>
    </div>`;

  // Tooltip
  const tip = document.createElement('div');
  tip.className = 'xtg-tip';
  document.body.appendChild(tip);
  container.querySelectorAll('.xtg-cell-anim').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('mouseenter', e => {
      tip.innerHTML = `<b>xT ${el.dataset.xt}</b><br>${el.dataset.events} olay`;
      tip.classList.add('show');
    });
    el.addEventListener('mousemove', e => {
      tip.style.left = e.clientX + 12 + 'px';
      tip.style.top = e.clientY + 12 + 'px';
    });
    el.addEventListener('mouseleave', () => tip.classList.remove('show'));
  });

  // ── ANİMASYON ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      animateIn(container);
    });
  }, { threshold: 0.3 });
  observer.observe(container);

  function animateIn(root) {
    const cells = root.querySelectorAll('.xtg-cell-anim');
    const labels = root.querySelectorAll('.xtg-num-anim');

    // 1. Hücreler merkezden dışa doğru belirsin
    const center = { r: 3.5, c: 4.5 };
    const sorted = Array.from(cells).sort((a, b) => {
      const da = Math.hypot(a.dataset.row - center.r, a.dataset.col - center.c);
      const db = Math.hypot(b.dataset.row - center.r, b.dataset.col - center.c);
      return da - db;
    });

    sorted.forEach((cell, i) => {
      setTimeout(() => {
        cell.style.transition = 'opacity 400ms ease-out';
        cell.style.opacity = '0.92';
      }, i * 22);
    });

    // 2. Sayılar merkezden dışa doğru sayılsın
    const labelsSorted = Array.from(labels).sort((a, b) => {
      const cellA = cells[+a.dataset.idx];
      const cellB = cells[+b.dataset.idx];
      const da = Math.hypot(cellA.dataset.row - center.r, cellA.dataset.col - center.c);
      const db = Math.hypot(cellB.dataset.row - center.r, cellB.dataset.col - center.c);
      return da - db;
    });

    labelsSorted.forEach((lbl, i) => {
      setTimeout(() => {
        lbl.style.transition = 'opacity 200ms';
        lbl.style.opacity = '1';
        const target = parseFloat(lbl.dataset.val);
        const start = performance.now();
        const dur = 400;
        function step(now) {
          const p = Math.min(1, (now - start) / dur);
          const v = target * p;
          lbl.textContent = v.toFixed(2);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }, 300 + i * 22);
    });

    // 3. Gol trace'leri sırayla yürüsün
    const tracesG = root.querySelector('#xtg-traces');
    if (!tracesG || !traces.length) return;
    traces.forEach((tr, ti) => {
      const cellsData = tr.cells || [];
      if (!cellsData.length) continue;
      // Her trace için nokta + iz bırakan çizgi
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `xtg-trace xtg-trace-${ti}`);
      g.style.opacity = '0';
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '6');
      dot.setAttribute('fill', tr.team === 'GS' ? '#FF6B35' : '#6B9FE8');
      dot.setAttribute('stroke', 'white');
      dot.setAttribute('stroke-width', '1.5');
      g.appendChild(dot);
      tracesG.appendChild(g);

      // Sırayla hücrelerde yürüt
      setTimeout(() => {
        g.style.transition = 'opacity 300ms';
        g.style.opacity = '1';
        let stepIdx = 0;
        function stepTo() {
          if (stepIdx >= cellsData.length) {
            // Trace bitti, sonraki trace
            setTimeout(() => { g.style.opacity = '0'; }, 800);
            return;
          }
          const c = cellsData[stepIdx];
          const x = PAD + c.col * cw + cw/2;
          const y = PAD + (7 - c.row) * ch + ch/2;
          const start = performance.now();
          const startX = parseFloat(dot.getAttribute('cx') || x);
          const startY = parseFloat(dot.getAttribute('cy') || y);
          const dur = 400;
          function frame(now) {
            const p = Math.min(1, (now - start) / dur);
            const px = startX + (x - startX) * p;
            const py = startY + (y - startY) * p;
            dot.setAttribute('cx', px);
            dot.setAttribute('cy', py);
            if (p < 1) requestAnimationFrame(frame);
            else { stepIdx++; setTimeout(stepTo, 150); }
          }
          requestAnimationFrame(frame);
        }
        stepTo();
      }, 2000 + ti * 1200);
    });
  }
}
