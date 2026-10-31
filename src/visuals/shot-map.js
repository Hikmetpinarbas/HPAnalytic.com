const TEAM_COLOR = { GS: '#FF6B35', FB: '#B4FF39' };
const TYPE_SHAPE = { 'Goal': 'star', 'On Target': 'circle', 'Off Target': 'x', 'Post': 'diamond', 'Blocked': 'square' };
const TYPE_LABEL = { 'Goal': 'GOL', 'On Target': 'İSABETLİ', 'Off Target': 'İSABETSİZ', 'Post': 'DİREK', 'Blocked': 'BLOKE' };

export async function renderShotMap(container) {
  const data = await fetch('/assets/data/shot_map.json').then(r => r.json());
  if (!data) return;

  const W = 800, H = 520, PAD = 40;
  const PITCH_L = 105, PITCH_W = 68;
  const sx = (W - PAD * 2) / PITCH_L;
  const sy = (H - PAD * 2) / PITCH_W;
  const px = x => PAD + x * sx;
  const py = y => PAD + y * sy;

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="sml-svg">
    <rect x="${PAD}" y="${PAD}" width="${W-PAD*2}" height="${H-PAD*2}" rx="2" fill="none" stroke="rgba(180,255,57,0.2)" stroke-width="1"/>
    <line x1="${W/2}" y1="${PAD}" x2="${W/2}" y2="${H-PAD}" stroke="rgba(180,255,57,0.15)" stroke-width="1"/>
    <circle cx="${W/2}" cy="${H/2}" r="26" fill="none" stroke="rgba(180,255,57,0.15)" stroke-width="1"/>
    <rect x="${PAD}" y="${H/2-90}" width="80" height="180" fill="none" stroke="rgba(180,255,57,0.15)" stroke-width="1"/>
    <rect x="${W-PAD-80}" y="${H/2-90}" width="80" height="180" fill="none" stroke="rgba(180,255,57,0.15)" stroke-width="1"/>`;

  for (const s of data) {
    const cx = px(s.x), cy = py(s.y);
    const col = TEAM_COLOR[s.team] || '#8A8A93';
    const shape = TYPE_SHAPE[s.type] || 'circle';
    let el = '';
    if (shape === 'star') {
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI / 5) - Math.PI / 2;
        const r = i % 2 === 0 ? 9 : 4;
        pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
      }
      el = `<polygon points="${pts.join(' ')}" fill="${col}" class="shot"/>`;
    } else if (shape === 'circle') {
      el = `<circle cx="${cx}" cy="${cy}" r="7" fill="${col}" class="shot"/>`;
    } else if (shape === 'x') {
      el = `<g class="shot"><line x1="${cx-5}" y1="${cy-5}" x2="${cx+5}" y2="${cy+5}" stroke="${col}" stroke-width="2"/><line x1="${cx-5}" y1="${cy+5}" x2="${cx+5}" y2="${cy-5}" stroke="${col}" stroke-width="2"/></g>`;
    } else if (shape === 'diamond') {
      el = `<polygon points="${cx},${cy-7} ${cx+7},${cy} ${cx},${cy+7} ${cx-7},${cy}" fill="${col}" class="shot"/>`;
    } else if (shape === 'square') {
      el = `<rect x="${cx-5}" y="${cy-5}" width="10" height="10" fill="${col}" opacity="0.7" class="shot"/>`;
    }
    svg += `<g data-player="${s.player}" data-type="${s.type}" data-team="${s.team}">${el}</g>`;
  }
  svg += '</svg>';

  // Filter chips
  const chips = ['TÜMÜ', 'GOL', 'İSABETLİ', 'İSABETSİZ', 'DİREK'].map(l =>
    `<button class="sml-chip${l === 'TÜMÜ' ? ' active' : ''}" data-type="${l === 'TÜMÜ' ? 'all' : l}">${l}</button>`
  ).join('');

  container.innerHTML = `
    <div class="sml-wrap">
      <div class="sml-filters">${chips}</div>
      <div class="sml-stage">${svg}</div>
      <div class="sml-tip" id="sml-tip">Şutun üstüne gel</div>
    </div>`;

  // Hover tooltip
  const tip = container.querySelector('#sml-tip');
  container.querySelectorAll('[data-player]').forEach(g => {
    g.addEventListener('mouseenter', (e) => {
      const p = g.dataset.player, t = g.dataset.type, tm = g.dataset.team;
      tip.innerHTML = `<b>${p.split('(')[0]}</b><br><span style="color:${TEAM_COLOR[tm]}">${TYPE_LABEL[t]}</span>`;
      tip.classList.add('show');
    });
    g.addEventListener('mouseleave', () => tip.classList.remove('show'));
  });

  // Filter
  container.querySelectorAll('.sml-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.sml-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const f = chip.dataset.type;
      container.querySelectorAll('[data-type]').forEach(g => {
        if (!g.hasAttribute('data-player')) return;
        if (f === 'all' || TYPE_LABEL[g.dataset.type] === f) g.style.opacity = '1';
        else g.style.opacity = '0.1';
      });
    });
  });
}
