const TEAM_COLOR = { GS: '#FF6B35', FB: '#B4FF39' };

export async function renderPassNetwork(container) {
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
