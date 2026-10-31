const COLOR = { GS: '#FF6B35', LIL: '#6B9FE8' };
const SHAPE = { 'Goal': 'star', 'Own Goal': 'star-own', 'On Target': 'circle', 'Off Target': 'x' };
const LABEL = { 'Goal': 'GOL', 'Own Goal': 'KK', 'On Target': 'İSABETLİ', 'Off Target': 'İSABETSİZ' };

export async function render(container) {
  const data = await fetch('/assets/data/lille-gs/shot_map.json').then(r => r.json());
  const W = 800, H = 520, PAD = 40;
  const sx = (W - PAD*2) / 105, sy = (H - PAD*2) / 68;
  const px = x => PAD + x*sx, py = y => PAD + y*sy;

  let svg = `<svg viewBox="0 0 ${W} ${H}" class="lgs-svg" xmlns="http://www.w3.org/2000/svg">
    <rect x="${PAD}" y="${PAD}" width="${W-PAD*2}" height="${H-PAD*2}" fill="none" stroke="rgba(180,255,57,0.18)" stroke-width="1"/>
    <line x1="${W/2}" y1="${PAD}" x2="${W/2}" y2="${H-PAD}" stroke="rgba(180,255,57,0.12)"/>
    <circle cx="${W/2}" cy="${H/2}" r="26" fill="none" stroke="rgba(180,255,57,0.12)"/>
    <rect x="${PAD}" y="${H/2-90}" width="80" height="180" fill="none" stroke="rgba(180,255,57,0.12)"/>
    <rect x="${W-PAD-80}" y="${H/2-90}" width="80" height="180" fill="none" stroke="rgba(180,255,57,0.12)"/>`;

  for (const s of data) {
    const cx = px(s.x), cy = py(s.y);
    const c = COLOR[s.team];
    let el = '';
    if (s.type === 'Goal') {
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI / 5) - Math.PI / 2;
        const r = i % 2 === 0 ? 10 : 4.5;
        pts.push(`${cx+Math.cos(a)*r},${cy+Math.sin(a)*r}`);
      }
      el = `<polygon points="${pts.join(' ')}" fill="${c}"/>`;
    } else if (s.type === 'Own Goal') {
      el = `<polygon points="${cx},${cy-10} ${cx+10},${cy} ${cx},${cy+10} ${cx-10},${cy}" fill="none" stroke="#FF6B35" stroke-width="2.5" stroke-dasharray="3,2"/>`;
    } else if (s.type === 'On Target') {
      el = `<circle cx="${cx}" cy="${cy}" r="7" fill="${c}"/>`;
    } else {
      el = `<g stroke="${c}" stroke-width="2" stroke-linecap="round"><line x1="${cx-5}" y1="${cy-5}" x2="${cx+5}" y2="${cy+5}"/><line x1="${cx-5}" y1="${cy+5}" x2="${cx+5}" y2="${cy-5}"/></g>`;
    }
    svg += `<g class="lgs-shot" data-team="${s.team}" data-type="${s.type}" data-min="${s.minute}">${el}</g>`;
  }
  svg += '</svg>';

  const byTeam = { GS: 0, LIL: 0 };
  const byType = {};
  data.forEach(s => { byTeam[s.team]++; byType[s.type] = (byType[s.type] || 0) + 1; });

  container.innerHTML = `
    <div class="lgs-stats">
      <div class="lgs-s"><span class="n" style="color:${COLOR.GS}">${byTeam.GS}</span><span class="l">Galatasaray şutu</span></div>
      <div class="lgs-s"><span class="n" style="color:${COLOR.LIL}">${byTeam.LIL}</span><span class="l">Lille şutu</span></div>
      <div class="lgs-s"><span class="n">${byType['Goal'] || 0}</span><span class="l">gol</span></div>
      <div class="lgs-s"><span class="n">${byType['Own Goal'] || 0}</span><span class="l">kendi kalesine</span></div>
    </div>
    <div class="lgs-stage">${svg}</div>
    <div class="lgs-legend">
      <span style="color:${COLOR.GS}">★ GS gol</span>
      <span style="color:${COLOR.LIL}">★ Lille gol</span>
      <span style="color:#FF6B35">◇ Kendi kalesine</span>
      <span style="color:${COLOR.GS}">● / × isabetli / isabetsiz</span>
    </div>`;

  const tip = document.createElement('div');
  tip.className = 'lgs-tip';
  document.body.appendChild(tip);
  container.querySelectorAll('.lgs-shot').forEach(g => {
    g.addEventListener('mouseenter', e => {
      const t = g.dataset.type;
      tip.innerHTML = `<b>${LABEL[t]}</b><br>${g.dataset.min}' · ${g.dataset.team === 'GS' ? 'Galatasaray' : 'Lille'}`;
      tip.classList.add('show');
    });
    g.addEventListener('mousemove', e => {
      tip.style.left = e.clientX + 12 + 'px';
      tip.style.top = e.clientY + 12 + 'px';
    });
    g.addEventListener('mouseleave', () => tip.classList.remove('show'));
  });
}
