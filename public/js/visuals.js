(function(){
const RENDERERS = {};
// === shot-map ===
(function() {
const TEAM_COLOR = { GS: '#FF6B35', FB: '#B4FF39' };
const TYPE_SHAPE = { 'Goal': 'star', 'On Target': 'circle', 'Off Target': 'x', 'Post': 'diamond', 'Blocked': 'square' };
const TYPE_LABEL = { 'Goal': 'GOL', 'On Target': 'İSABETLİ', 'Off Target': 'İSABETSİZ', 'Post': 'DİREK', 'Blocked': 'BLOKE' };

async function renderShotMap(container) {
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

  RENDERERS["shot-map"] = typeof render !== "undefined" ? render : (typeof init !== "undefined" ? init : null);
})();
// === pass-network ===
(function() {
const TEAM_COLOR = { GS: '#FF6B35', FB: '#B4FF39' };

async function renderPassNetwork(container) {
  const data = await fetch('/assets/data/pass_network.json').then(r => r.json());
  if (!data || !data.nodes) return;

  const nodes = data.nodes.filter(n => n.is_main);
  const ids = new Set(nodes.map(n => n.id));
  const links = data.links.filter(l => ids.has(l.source) && ids.has(l.target));
  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));

  const W = 800, H = 520, PAD = 40;
  const sx = (W - PAD * 2) / 105, sy = (H - PAD * 2) / 68;
  const px = x => PAD + x * sx, py = y => PAD + y * sy;

  const passes = {};
  links.forEach(l => {
    passes[l.source] = (passes[l.source] || 0) + (l.weight || l.value || 1);
    passes[l.target] = (passes[l.target] || 0) + (l.weight || l.value || 1);
  });
  const maxP = Math.max(...Object.values(passes), 1);
  const maxW = Math.max(...links.map(l => l.weight || l.value || 1), 1);

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="pnl-svg">
    <rect x="${PAD}" y="${PAD}" width="${W-PAD*2}" height="${H-PAD*2}" rx="2" fill="none" stroke="rgba(180,255,57,0.15)" stroke-width="1"/>
    <line x1="${W/2}" y1="${PAD}" x2="${W/2}" y2="${H-PAD}" stroke="rgba(180,255,57,0.1)" stroke-width="1"/>
    <circle cx="${W/2}" cy="${H/2}" r="26" fill="none" stroke="rgba(180,255,57,0.1)" stroke-width="1"/>`;

  for (const l of links) {
    const a = nodeById[l.source], b = nodeById[l.target];
    if (!a || !b) continue;
    const w = (l.weight || l.value || 1) / maxW;
    const col = a.team === 'GS' ? `rgba(255,107,53,${0.2+w*0.5})` : `rgba(180,255,57,${0.2+w*0.5})`;
    svg += `<line x1="${px(a.x)}" y1="${py(a.y)}" x2="${px(b.x)}" y2="${py(b.y)}" stroke="${col}" stroke-width="${0.6+w*2}" class="pnl-link" data-a="${l.source}" data-b="${l.target}"/>`;
  }

  for (const n of nodes) {
    const r = 6 + (passes[n.id] || 0) / maxP * 12;
    const col = TEAM_COLOR[n.team] || '#8A8A93';
    const name = n.id.split(' (')[0];
    const lastName = name.split(' ').pop();
    svg += `<g class="pnl-node" data-id="${n.id}">
      <circle cx="${px(n.x)}" cy="${py(n.y)}" r="${r}" fill="${col}" opacity="0.9"/>
      <text x="${px(n.x)}" y="${py(n.y) - r - 6}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="${col}" style="text-transform:uppercase;letter-spacing:0.1em">${lastName}</text>
    </g>`;
  }
  svg += '</svg>';

  container.innerHTML = `
    <div class="pnl-wrap">
      <div class="pnl-stage">${svg}</div>
      <div class="pnl-legend">
        <span style="color:${TEAM_COLOR.GS}">■ Galatasaray</span>
        <span style="color:${TEAM_COLOR.FB}">■ Fenerbahçe</span>
        <span style="color:var(--ink-faint);font-size:9px">Daire büyüdükçe pas sayısı artar. Çizgi kalınlaştıkça pas bağlantısı güçlenir.</span>
      </div>
    </div>`;

  // Oyuncuya tıklayınca bağlantıları vurgula
  container.querySelectorAll('.pnl-node').forEach(g => {
    g.addEventListener('click', () => {
      const id = g.dataset.id;
      container.querySelectorAll('.pnl-node').forEach(n => n.style.opacity = n.dataset.id === id ? '1' : '0.3');
      container.querySelectorAll('.pnl-link').forEach(l => {
        const active = l.dataset.a === id || l.dataset.b === id;
        l.style.opacity = active ? '1' : '0.1';
      });
    });
  });
  container.addEventListener('click', (e) => {
    if (!e.target.closest('.pnl-node')) {
      container.querySelectorAll('.pnl-node, .pnl-link').forEach(el => el.style.opacity = '');
    }
  });
}

  RENDERERS["pass-network"] = typeof render !== "undefined" ? render : (typeof init !== "undefined" ? init : null);
})();
// === attack-flow ===
(function() {
const GOALS = [
  { minute: '27\'', player: 'Yunus Akgün', type: 'Pas + taşıma', steps: ['Jakobs pas', 'Barış Alper taşıma', 'Yunus bitiriş'] },
  { minute: '38\'', player: 'Batrakov', type: 'Taşıma + kilit pas', steps: ['Sallai taşıma', 'Sallai kilit pas', 'Batrakov bitiriş'] },
  { minute: '58\'', player: 'Bentaleb (KK)', type: 'Ceza sahası girişi', steps: ['Sara pas', 'Kutu girişi', 'KK'] },
  { minute: '73\'', player: 'Osimhen', type: 'Top kazanımı + hızlı hücum', steps: ['Bardakcı kazanım', 'Batrakov taşıma', 'Barış Alper pas', 'Osimhen bitiriş'] },
];

function renderAttackFlow(container) {
  container.innerHTML = `
    <div class="af-wrap">
      <div class="af-grid">
        ${GOALS.map((g, i) => `
          <div class="af-goal" data-idx="${i}">
            <div class="af-head">
              <span class="af-min">${g.minute}</span>
              <span class="af-player">${g.player}</span>
            </div>
            <div class="af-type">${g.type}</div>
            <div class="af-steps">
              ${g.steps.map((s, j) => `<span class="af-step">${j+1}. ${s}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <p class="af-note">Dört gol dört farklı mekanizma. Dördüncü golün ayrımı hız değil: kazanım → taşıma → son pas zinciri.</p>
    </div>`;
}

  RENDERERS["attack-flow"] = typeof render !== "undefined" ? render : (typeof init !== "undefined" ? init : null);
})();
// === lgs-shot ===
(function() {
const COLOR = { GS: '#FF6B35', LIL: '#6B9FE8' };
const SHAPE = { 'Goal': 'star', 'Own Goal': 'star-own', 'On Target': 'circle', 'Off Target': 'x' };
const LABEL = { 'Goal': 'GOL', 'Own Goal': 'KK', 'On Target': 'İSABETLİ', 'Off Target': 'İSABETSİZ' };

async function render(container) {
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

  RENDERERS["lgs-shot"] = typeof render !== "undefined" ? render : (typeof init !== "undefined" ? init : null);
})();
// === lgs-rhythm ===
(function() {
const COLOR = { GS: '#FF6B35', LIL: '#6B9FE8' };

async function render(container) {
  const data = await fetch('/assets/data/lille-gs/rhythm.json').then(r => r.json());
  const blocks = data.map(d => d.range);
  const actions = ['Pas', 'Şut', 'Top Kazanımı', 'Top Kaybı', 'Dribling', 'İkili Mücadele'];

  // Toplam aksiyon per blok per takım
  const gsTotals = data.map(b => Object.values(b.GS).reduce((a,c)=>a+c, 0));
  const lilTotals = data.map(b => Object.values(b.LIL).reduce((a,c)=>a+c, 0));
  const max = Math.max(...gsTotals, ...lilTotals, 1);

  const W = 900, H = 340, PAD = 40;
  const bw = (W - PAD*2) / data.length;

  let svg = `<svg viewBox="0 0 ${W} ${H}" class="lg-rhythm-svg" xmlns="http://www.w3.org/2000/svg">`;
  // Grid çizgileri
  for (let i = 0; i <= 4; i++) {
    const y = PAD + (H-PAD*2) * i / 4;
    svg += `<line x1="${PAD}" y1="${y}" x2="${W-PAD}" y2="${y}" stroke="rgba(180,255,57,0.06)" stroke-width="1"/>`;
  }

  data.forEach((b, i) => {
    const x = PAD + bw * i;
    const cw = bw * 0.35;
    const gh = (gsTotals[i] / max) * (H-PAD*2);
    const lh = (lilTotals[i] / max) * (H-PAD*2);
    svg += `<rect class="lg-bar" data-idx="${i}" x="${x + bw*0.08}" y="${H-PAD-gh}" width="${cw}" height="${gh}" fill="${COLOR.GS}" opacity="0.85"/>`;
    svg += `<rect class="lg-bar" data-idx="${i}" x="${x + bw*0.52}" y="${H-PAD-lh}" width="${cw}" height="${lh}" fill="${COLOR.LIL}" opacity="0.85"/>`;
    svg += `<text x="${x + bw/2}" y="${H-PAD+18}" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="var(--ink-faint)">${b.range}'</text>`;
    svg += `<text x="${x + bw*0.08 + cw/2}" y="${H-PAD-gh-6}" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="${COLOR.GS}">${gsTotals[i]}</text>`;
    svg += `<text x="${x + bw*0.52 + cw/2}" y="${H-PAD-lh-6}" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="${COLOR.LIL}">${lilTotals[i]}</text>`;
  });
  svg += '</svg>';

  container.innerHTML = `
    <div class="lg-rhythm">
      <div class="lg-rhythm-legend">
        <span style="color:${COLOR.GS}">■ Galatasaray</span>
        <span style="color:${COLOR.LIL}">■ Lille</span>
        <span style="color:var(--ink-faint);font-size:9px">Toplam takım aksiyonu (pas, şut, kazanım, kayıp, dribling, mücadele)</span>
      </div>
      <div class="lg-rhythm-stage">${svg}</div>
      <div class="lg-rhythm-detail" id="lg-rd">
        <div class="lg-rd-inner">
          <span class="lg-rd-lbl">Detay için blok üstüne gel</span>
        </div>
      </div>
    </div>`;

  const detail = container.querySelector('#lg-rd');
  container.querySelectorAll('.lg-bar').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const idx = +el.dataset.idx;
      const b = data[idx];
      detail.innerHTML = `<div class="lg-rd-inner">
        <div class="lg-rd-blk">${b.range}'</div>
        <div class="lg-rd-row" style="color:${COLOR.GS}">
          <b>Galatasaray</b> · ${Object.entries(b.GS).map(([k,v])=>`${k}: ${v}`).join(' · ') || '—'}
        </div>
        <div class="lg-rd-row" style="color:${COLOR.LIL}">
          <b>Lille</b> · ${Object.entries(b.LIL).map(([k,v])=>`${k}: ${v}`).join(' · ') || '—'}
        </div>
      </div>`;
    });
  });
}

  RENDERERS["lgs-rhythm"] = typeof render !== "undefined" ? render : (typeof init !== "undefined" ? init : null);
})();
// === lgs-corridor ===
(function() {
const COLOR = { GS: '#FF6B35', LIL: '#6B9FE8' };

async function render(container) {
  const data = await fetch('/assets/data/lille-gs/corridor.json').then(r => r.json());
  const total = data.reduce((a,c)=>a+c.GS+c.LIL, 0);

  let rows = '';
  data.forEach(d => {
    const sum = d.GS + d.LIL;
    const gsPct = sum > 0 ? (d.GS / sum * 100) : 50;
    rows += `<div class="lg-cor-row">
      <div class="lg-cor-lbl">${d.corridor}</div>
      <div class="lg-cor-bar">
        <div class="lg-cor-gs" style="width:${gsPct}%"></div>
        <div class="lg-cor-lil" style="width:${100-gsPct}%"></div>
      </div>
      <div class="lg-cor-vals">
        <span style="color:${COLOR.GS}">${d.GS}</span>
        <span style="color:${COLOR.LIL}">${d.LIL}</span>
      </div>
    </div>`;
  });

  container.innerHTML = `
    <div class="lg-cor">
      <div class="lg-cor-head">
        <span style="color:${COLOR.GS}">■ GS</span>
        <span style="color:${COLOR.LIL}">■ Lille</span>
        <span style="font-family:var(--mono);font-size:9px;letter-spacing:.14em;color:var(--ink-faint)">Toplam ${total} aksiyon · 5 dilim</span>
      </div>
      <div class="lg-cor-body">${rows}</div>
    </div>`;
}

  RENDERERS["lgs-corridor"] = typeof render !== "undefined" ? render : (typeof init !== "undefined" ? init : null);
})();
// === lgs-zone ===
(function() {
const COLOR = { GS: '#FF6B35', LIL: '#6B9FE8' };

async function render(container) {
  const data = await fetch('/assets/data/lille-gs/zone.json').then(r => r.json());
  const total = data.reduce((a,c)=>a+c.GS+c.LIL, 0);
  let cards = '';
  data.forEach((d, i) => {
    const sum = d.GS + d.LIL;
    const gsPct = sum > 0 ? Math.round(d.GS/sum*100) : 0;
    const lilPct = 100 - gsPct;
    cards += `<div class="lg-zone-card">
      <div class="lg-zone-idx">0${i+1}</div>
      <div class="lg-zone-lbl">${d.zone}</div>
      <div class="lg-zone-bar">
        <div class="lg-zone-gs" style="height:${gsPct}%"></div>
        <div class="lg-zone-lil" style="height:${lilPct}%"></div>
      </div>
      <div class="lg-zone-nums">
        <span style="color:${COLOR.GS}">${d.GS}</span>
        <span style="color:${COLOR.LIL}">${d.LIL}</span>
      </div>
    </div>`;
  });
  container.innerHTML = `
    <div class="lg-zone">
      <div class="lg-zone-head">
        <span style="color:${COLOR.GS}">■ Galatasaray</span>
        <span style="color:${COLOR.LIL}">■ Lille</span>
        <span style="font-family:var(--mono);font-size:9px;color:var(--ink-faint);letter-spacing:.14em">${total} aksiyon · 3 bölge</span>
      </div>
      <div class="lg-zone-grid">${cards}</div>
    </div>`;
}

  RENDERERS["lgs-zone"] = typeof render !== "undefined" ? render : (typeof init !== "undefined" ? init : null);
})();
// === xt-grid ===
(function() {
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

async function render(container) {
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

  RENDERERS["xt-grid"] = typeof render !== "undefined" ? render : (typeof init !== "undefined" ? init : null);
})();
// === xg-flow ===
(function() {
const COLOR = { GS: '#FF6B35', LIL: '#6B9FE8' };

async function render(container) {
  const data = await fetch('/assets/data/lille-gs/xg_flow.json').then(r => r.json());
  const gs = data.GS, lil = data.LIL;
  const maxMin = Math.max(...gs.map(p=>p.minute), ...lil.map(p=>p.minute), 90);
  const maxXg = Math.max(...gs.map(p=>p.cumulative), ...lil.map(p=>p.cumulative), 1) * 1.1;

  const W = 900, H = 420, PAD = 50;
  const sx = (W - PAD*2) / maxMin;
  const sy = (H - PAD*2) / maxXg;
  const px = m => PAD + m * sx;
  const py = v => H - PAD - v * sy;

  let gsPath = `M ${px(0)} ${py(0)}`;
  for (const p of gs) gsPath += ` L ${px(p.minute)} ${py(p.cumulative)}`;
  gsPath += ` L ${px(maxMin)} ${py(gs[gs.length-1].cumulative)}`;

  let lilPath = `M ${px(0)} ${py(0)}`;
  for (const p of lil) lilPath += ` L ${px(p.minute)} ${py(p.cumulative)}`;
  lilPath += ` L ${px(maxMin)} ${py(lil[lil.length-1].cumulative)}`;

  let svg = `<svg viewBox="0 0 ${W} ${H}" class="xgf-svg" xmlns="http://www.w3.org/2000/svg">`;

  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = PAD + (H-PAD*2) * i / 4;
    svg += `<line x1="${PAD}" y1="${y}" x2="${W-PAD}" y2="${y}" stroke="rgba(180,255,57,0.06)"/>`;
    svg += `<text x="${PAD-8}" y="${y+4}" text-anchor="end" font-family="JetBrains Mono" font-size="9" fill="var(--ink-faint)">${(maxXg*(1-i/4)).toFixed(1)}</text>`;
  }
  for (let m = 0; m <= maxMin; m += 15) {
    svg += `<text x="${px(m)}" y="${H-PAD+16}" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="var(--ink-faint)">${m}'</text>`;
  }

  // Çizgiler
  svg += `<path d="${gsPath}" fill="none" stroke="${COLOR.GS}" stroke-width="2.5"/>`;
  svg += `<path d="${lilPath}" fill="none" stroke="${COLOR.LIL}" stroke-width="2.5"/>`;

  // Şut noktaları + gol yıldızları
  for (const p of gs) {
    if (p.is_goal) {
      const cx = px(p.minute), cy = py(p.cumulative);
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI / 5) - Math.PI / 2;
        const r = i % 2 === 0 ? 7 : 3.2;
        pts.push(`${cx+Math.cos(a)*r},${cy+Math.sin(a)*r}`);
      }
      svg += `<polygon points="${pts.join(' ')}" fill="${COLOR.GS}"/>`;
    } else {
      svg += `<circle cx="${px(p.minute)}" cy="${py(p.cumulative)}" r="3" fill="${COLOR.GS}" opacity="0.7"/>`;
    }
  }
  for (const p of lil) {
    if (p.is_goal) {
      const cx = px(p.minute), cy = py(p.cumulative);
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI / 5) - Math.PI / 2;
        const r = i % 2 === 0 ? 7 : 3.2;
        pts.push(`${cx+Math.cos(a)*r},${cy+Math.sin(a)*r}`);
      }
      svg += `<polygon points="${pts.join(' ')}" fill="${COLOR.LIL}"/>`;
    } else {
      svg += `<circle cx="${px(p.minute)}" cy="${py(p.cumulative)}" r="3" fill="${COLOR.LIL}" opacity="0.7"/>`;
    }
  }

  svg += '</svg>';

  container.innerHTML = `
    <div class="xgf-wrap">
      <div class="xgf-head">
        <div class="xgf-tot"><span class="n" style="color:${COLOR.GS}">${data.totals.GS}</span><span class="l">GS xG</span></div>
        <div class="xgf-tot"><span class="n" style="color:${COLOR.LIL}">${data.totals.LIL}</span><span class="l">Lille xG</span></div>
        <div class="xgf-tot"><span class="n">4-2</span><span class="l">skor</span></div>
        <div class="xgf-tot"><span class="n">+${(4 - data.totals.GS).toFixed(1)}</span><span class="l">GS finishing</span></div>
      </div>
      <div class="xgf-stage">${svg}</div>
      <div class="xgf-legend">
        <span style="color:${COLOR.GS}">─ Galatasaray xG akışı</span>
        <span style="color:${COLOR.LIL}">─ Lille xG akışı</span>
        <span style="color:var(--ink-faint);font-size:9px">★ = gol · ● = şut</span>
      </div>
      <div class="xgf-note">xG vekil: XLSX oyuncu xG'si / oyuncu şut sayısı. Kümülatif eğri, maç boyu ne zaman tehdit ürettiğini gösterir. GS 4 gol, 1.58 xG → +2.4 finishing farkı.</div>
    </div>`;
}

  RENDERERS["xg-flow"] = typeof render !== "undefined" ? render : (typeof init !== "undefined" ? init : null);
})();

async function init() {
  for (const el of document.querySelectorAll('[data-visual-body]')) {
    const fn = RENDERERS[el.dataset.visualBody];
    if (!fn) { el.innerHTML = '<div style="padding:40px;text-align:center;color:#FF6B35;font-family:monospace;font-size:11px">Yüklenemedi: ' + el.dataset.visualBody + '</div>'; continue; }
    try { await fn(el); }
    catch (e) { el.innerHTML = '<div style="padding:40px;text-align:center;color:#FF6B35;font-family:monospace;font-size:11px">Hata: ' + e.message + '</div>'; console.error(e); }
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();
