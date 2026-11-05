// HPAnalytic Pass Network v2 — D3.js bağımsız, SVG tabanlı
// Hem v1 (links) hem v2 (edges) formatını destekler
const TEAM_COLORS = {
  'Galatasaray': '#FF6B35',
  'VfB Stuttgart': '#B4FF39',
  'Fenerbahce': '#FFCC00',
  'Liverpool': '#C8102E',
  'Liverpool FC': '#C8102E',
};

export async function renderPassNetwork(container) {
  // data-match attribute'dan slug al (yoksa default GS)
  const slug = container.dataset.match || 'gs-stuttgart';
  const urls = [
    `/assets/data/${slug}/pass_network_v2.json`,
    `/assets/data/${slug}/pass_network.json`,
  ];
  
  let data = null, usedUrl = null;
  for (const url of urls) {
    try {
      const r = await fetch(url);
      if (r.ok) { data = await r.json(); usedUrl = url; break; }
    } catch(e) {}
  }
  
  if (!data) {
    container.innerHTML = `<div style="padding:20px;color:#888;font-family:monospace;font-size:12px">Pas ağı verisi bulunamadı: ${slug}</div>`;
    return;
  }
  
  // v2 (edges) veya v1 (links) formatını normalize et
  let nodesArr, edgesArr;
  if (data.nodes && !Array.isArray(data.nodes)) {
    // v2: nodes dict
    nodesArr = Object.entries(data.nodes).map(([key, n]) => ({
      id: key,
      team: n.team,
      name: n.name,
      x: n.x, y: n.y,
      passes: n.passes || 0,
    }));
    edgesArr = (data.edges || []).map(e => ({
      source: e.from, target: e.to,
      weight: e.weight || e.correlation_pct || 1,
    }));
  } else {
    // v1: nodes array, links array
    nodesArr = (data.nodes || []).filter(n => n.is_main !== false);
    edgesArr = data.links || [];
  }
  
  if (!nodesArr.length) {
    container.innerHTML = `<div style="padding:20px;color:#888">Pas ağı verisi boş</div>`;
    return;
  }
  
  const W = 800, H = 520, PAD = 40;
  const sx = (W - PAD * 2) / 105, sy = (H - PAD * 2) / 68;
  const px = x => PAD + x * sx, py = y => PAD + y * sy;
  
  const passes = {};
  edgesArr.forEach(e => {
    passes[e.source] = (passes[e.source] || 0) + (e.weight || 1);
    passes[e.target] = (passes[e.target] || 0) + (e.weight || 1);
  });
  const maxP = Math.max(...Object.values(passes), 1);
  const maxW = Math.max(...edgesArr.map(e => e.weight || 1), 1);
  
  const nodeById = Object.fromEntries(nodesArr.map(n => [n.id, n]));
  const colorOf = t => TEAM_COLORS[t] || '#8A8A93';
  
  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="pnl-svg">
    <rect x="${PAD}" y="${PAD}" width="${W-PAD*2}" height="${H-PAD*2}" rx="2" fill="none" stroke="rgba(180,255,57,0.15)" stroke-width="1"/>
    <line x1="${W/2}" y1="${PAD}" x2="${W/2}" y2="${H-PAD}" stroke="rgba(180,255,57,0.1)" stroke-width="1"/>
    <circle cx="${W/2}" cy="${H/2}" r="26" fill="none" stroke="rgba(180,255,57,0.1)" stroke-width="1"/>`;
  
  for (const e of edgesArr) {
    const a = nodeById[e.source], b = nodeById[e.target];
    if (!a || !b) continue;
    const w = (e.weight || 1) / maxW;
    const col = colorOf(a.team);
    const opacity = 0.15 + w * 0.5;
    svg += `<line x1="${px(a.x)}" y1="${py(a.y)}" x2="${px(b.x)}" y2="${py(b.y)}" stroke="${col}" stroke-opacity="${opacity}" stroke-width="${0.6+w*2.2}" class="pnl-link" data-a="${e.source}" data-b="${e.target}"/>`;
  }
  
  for (const n of nodesArr) {
    const r = 6 + (passes[n.id] || 0) / maxP * 14;
    const col = colorOf(n.team);
    const name = n.name || n.id.split('|').pop() || n.id;
    const lastName = name.split(' ').pop();
    svg += `<g class="pnl-node" data-id="${n.id}" style="cursor:pointer">
      <circle cx="${px(n.x)}" cy="${py(n.y)}" r="${r}" fill="${col}" opacity="0.92"/>
      <text x="${px(n.x)}" y="${py(n.y) - r - 6}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="${col}" style="text-transform:uppercase;letter-spacing:0.08em;pointer-events:none">${lastName}</text>
    </g>`;
  }
  svg += '</svg>';
  
  // Legend: takımları ayır
  const teams = [...new Set(nodesArr.map(n => n.team))];
  const legend = teams.map(t => `<span style="color:${colorOf(t)}">■ ${t}</span>`).join('');
  
  container.innerHTML = `
    <div class="pnl-wrap">
      <div class="pnl-stage">${svg}</div>
      <div class="pnl-legend" style="display:flex;flex-wrap:wrap;gap:16px;margin-top:12px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.08em">
        ${legend}
        <span style="color:var(--ink-faint,#888);font-size:9px">Daire büyüdükçe pas sayısı artar. Çizgi kalınlaştıkça bağlantı güçlenir.</span>
      </div>
    </div>`;
  
  // Hover: bir oyuncuya tıkla → diğerleri soluklaşsın
  container.querySelectorAll('.pnl-node').forEach(g => {
    g.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const id = g.dataset.id;
      const isActive = g.dataset.active === '1';
      container.querySelectorAll('.pnl-node').forEach(n => {
        n.dataset.active = isActive ? '' : (n.dataset.id === id ? '1' : '');
        n.style.opacity = !isActive && n.dataset.id !== id ? '0.25' : '1';
      });
      container.querySelectorAll('.pnl-link').forEach(l => {
        const active = !isActive && (l.dataset.a === id || l.dataset.b === id);
        l.style.opacity = !isActive && !active ? '0.05' : '1';
      });
    });
  });
  
  console.log(`[pass-network] ${slug} → ${nodesArr.length} nodes, ${edgesArr.length} edges`);
}
