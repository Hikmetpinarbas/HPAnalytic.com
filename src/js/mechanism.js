async function getJSON(p) {
  try { const r = await fetch(p); return r.ok ? r.json() : null; } catch { return null; }
}

function drawTeaser(data, el) {
  if (!data || !data.nodes || !data.links) {
    el.innerHTML = '<div class="mech-loading">Veri yok</div>';
    return;
  }
  const nodes = data.nodes.filter(n => n.is_main);
  const nodeIds = new Set(nodes.map(n => n.id));
  const links = data.links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));

  // Basit D3 olmadan SVG render
  const W = 800, H = 500;
  const PAD = 60;
  const sx = (W - PAD * 2) / 105;
  const sy = (H - PAD * 2) / 68;
  const px = x => PAD + x * sx;
  const py = y => PAD + y * sy;

  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="${W-40}" height="${H-40}" rx="2" fill="none" stroke="rgba(180,255,57,0.15)" stroke-width="1"/>
    <line x1="${W/2}" y1="20" x2="${W/2}" y2="${H-20}" stroke="rgba(180,255,57,0.12)" stroke-width="1"/>
    <circle cx="${W/2}" cy="${H/2}" r="42" fill="none" stroke="rgba(180,255,57,0.12)" stroke-width="1"/>
    <rect x="20" y="${H/2 - 90}" width="80" height="180" fill="none" stroke="rgba(180,255,57,0.12)" stroke-width="1"/>
    <rect x="${W-100}" y="${H/2 - 90}" width="80" height="180" fill="none" stroke="rgba(180,255,57,0.12)" stroke-width="1"/>`;

  const maxW = Math.max(...links.map(l => l.weight || l.value || 1), 1);
  for (const l of links) {
    const a = nodeById[l.source], b = nodeById[l.target];
    if (!a || !b) continue;
    const w = (l.weight || l.value || 1) / maxW;
    const col = a.team === 'GS' ? `rgba(255,107,53,${0.15 + w * 0.4})` : `rgba(180,255,57,${0.15 + w * 0.4})`;
    svg += `<line x1="${px(a.x)}" y1="${py(a.y)}" x2="${px(b.x)}" y2="${py(b.y)}" stroke="${col}" stroke-width="${0.5 + w * 1.5}"/>`;
  }

  const passes = {};
  for (const l of links) {
    passes[l.source] = (passes[l.source] || 0) + (l.weight || l.value || 1);
    passes[l.target] = (passes[l.target] || 0) + (l.weight || l.value || 1);
  }
  const maxPass = Math.max(...Object.values(passes), 1);

  for (const n of nodes) {
    const r = 4 + (passes[n.id] || 0) / maxPass * 8;
    const col = n.team === 'GS' ? '#FF6B35' : '#B4FF39';
    svg += `<circle cx="${px(n.x)}" cy="${py(n.y)}" r="${r}" fill="${col}" opacity="0.9"/>`;
  }

  svg += '</svg>';
  el.innerHTML = svg;
}

async function init() {
  const el = document.getElementById('mech-teaser');
  if (!el || el.dataset.ready === '1') return;
  el.dataset.ready = '1';
  const data = await getJSON('/assets/data/pass_network.json');
  drawTeaser(data, el);
}

(function boot() {
  const go = () => init();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else setTimeout(go, 300);
  if (import.meta && import.meta.hot) import.meta.hot.accept(() => go());
})();
