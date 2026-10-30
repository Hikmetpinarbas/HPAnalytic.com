import * as d3 from 'd3';

const TEAM_COLORS = { GS: '#B4FF39', FB: '#FF6B35' };

export async function initPassNet(containerId, filtersId) {
  const container = document.getElementById(containerId);
  if (!container || container.querySelector('svg')) return;
  container.innerHTML = '';

  let data;
  try {
    data = await fetch('/assets/data/pass_network.json').then(r => r.json());
  } catch { container.textContent = 'Veri yüklenemedi'; return; }

  // 11 as oyuncu (is_main:true)
  const nodes = data.nodes.filter(n => n.is_main !== false);
  const nodeIds = new Set(nodes.map(n => n.id));
  const links = data.links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));
  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));

  // YÖN DÜZELT: GS sol yarı, FB sağ yarı (her takım kendi kalesinden)
  const X_MAX = 80;
  const scaleX = 52.5 / X_MAX;
  function getX(n) { return n.team === 'FB' ? 105 - n.x * scaleX : n.x * scaleX; }

  // Numara (GS 1-11, FB 1-11)
  const numbers = {}; let gsN = 1, fbN = 1;
  nodes.forEach(n => { numbers[n.id] = n.team === 'GS' ? gsN++ : fbN++; });

  const passCount = {};
  nodes.forEach(n => passCount[n.id] = 0);
  links.forEach(l => {
    passCount[l.source] = (passCount[l.source] || 0) + (l.value || 1);
    passCount[l.target] = (passCount[l.target] || 0) + (l.value || 1);
  });
  const maxPass = Math.max(...Object.values(passCount));
  const sizeScale = d3.scaleSqrt().domain([1, maxPass]).range([10, 24]);

  // Saha
  const PITCH_L = 105, PITCH_W = 68, M = 8, K = 6.2;
  const offsetX = M * K, offsetY = M * K;
  const w = PITCH_L * K, h = PITCH_W * K;
  const totalW = w + 2 * offsetX, totalH = h + 2 * offsetY;

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${totalW} ${totalH}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('role', 'img')
    .attr('aria-label', 'Pas ağı')
    .style('width', '100%')
    .style('height', 'auto')
    .style('max-height', '560px');

  // SAHA — GÖRÜNÜR, KOYU YEŞİL
  const pitchBg = svg.append('g');
  pitchBg.append('rect')
    .attr('x', offsetX).attr('y', offsetY).attr('width', w).attr('height', h)
    .attr('fill', '#0F1F14');
  for (let i = 0; i < 14; i++) {
    const sw = w / 14;
    pitchBg.append('rect')
      .attr('x', offsetX + i * sw).attr('y', offsetY)
      .attr('width', sw).attr('height', h)
      .attr('fill', i % 2 === 0 ? '#0F1F14' : '#132619');
  }
  pitchBg.append('rect')
    .attr('x', offsetX).attr('y', offsetY).attr('width', w).attr('height', h)
    .attr('fill', 'none').attr('stroke', '#5A7A5A').attr('stroke-width', 2);
  pitchBg.append('line')
    .attr('x1', offsetX + w/2).attr('y1', offsetY)
    .attr('x2', offsetX + w/2).attr('y2', offsetY + h)
    .attr('stroke', '#5A7A5A').attr('stroke-width', 2);
  pitchBg.append('circle')
    .attr('cx', offsetX + w/2).attr('cy', offsetY + h/2).attr('r', 9.15 * K)
    .attr('fill', 'none').attr('stroke', '#5A7A5A').attr('stroke-width', 2);
  pitchBg.append('circle')
    .attr('cx', offsetX + w/2).attr('cy', offsetY + h/2).attr('r', 2.5)
    .attr('fill', '#5A7A5A');
  [0, 1].forEach(side => {
    const bx = side === 0 ? offsetX : offsetX + w - 16.5 * K;
    const gx = side === 0 ? offsetX : offsetX + w - 5.5 * K;
    const goalX = side === 0 ? offsetX - 3 : offsetX + w;
    const spotX = side === 0 ? offsetX + 11 * K : offsetX + w - 11 * K;
    pitchBg.append('rect')
      .attr('x', bx).attr('y', offsetY + (h - 40.32 * K) / 2)
      .attr('width', 16.5 * K).attr('height', 40.32 * K)
      .attr('fill', 'none').attr('stroke', '#5A7A5A').attr('stroke-width', 2);
    pitchBg.append('rect')
      .attr('x', gx).attr('y', offsetY + (h - 18.32 * K) / 2)
      .attr('width', 5.5 * K).attr('height', 18.32 * K)
      .attr('fill', 'none').attr('stroke', '#5A7A5A').attr('stroke-width', 2);
    pitchBg.append('rect')
      .attr('x', goalX).attr('y', offsetY + (h - 7.32 * K) / 2)
      .attr('width', 3).attr('height', 7.32 * K)
      .attr('fill', '#7A9A7A').attr('stroke', '#5A7A5A').attr('stroke-width', 1);
    pitchBg.append('circle')
      .attr('cx', spotX).attr('cy', offsetY + h/2).attr('r', 2)
      .attr('fill', '#5A7A5A');
  });

  const linksG = svg.append('g');
  const nodesG = svg.append('g');
  let currentTeam = 'all';

  function render() {
    linksG.selectAll('*').remove();
    nodesG.selectAll('*').remove();

    const filtNodes = currentTeam === 'all' ? nodes : nodes.filter(n => n.team === currentTeam);
    const filtIds = new Set(filtNodes.map(n => n.id));
    const filtLinks = links.filter(l => filtIds.has(l.source) && filtIds.has(l.target));

    // Link'ler
    const linkSel = linksG.selectAll('line').data(filtLinks).join('line')
      .attr('stroke', d => {
        const s = nodeById[d.source];
        return s ? (TEAM_COLORS[s.team] || '#8A8A93') : '#8A8A93';
      })
      .attr('stroke-opacity', 0.35)
      .attr('stroke-width', d => Math.max(0.6, Math.sqrt(d.value || 1) * 0.9))
      .attr('x1', d => offsetX + getX(nodeById[d.source]) * K)
      .attr('y1', d => offsetY + nodeById[d.source].y * K)
      .attr('x2', d => offsetX + getX(nodeById[d.target]) * K)
      .attr('y2', d => offsetY + nodeById[d.target].y * K);

    // Node'lar
    const nodeSel = nodesG.selectAll('g').data(filtNodes).join('g')
      .attr('transform', d => `translate(${offsetX + getX(d) * K},${offsetY + d.y * K})`)
      .style('cursor', 'pointer');

    nodeSel.append('circle')
      .attr('r', d => sizeScale(passCount[d.id] || 1))
      .attr('fill', d => TEAM_COLORS[d.team] || '#8A8A93')
      .attr('fill-opacity', d => d.is_main ? 1 : 0.45)
      .attr('stroke', '#0A0A0C').attr('stroke-width', 2);

    nodeSel.append('text')
      .attr('text-anchor', 'middle').attr('dy', '0.35em')
      .attr('fill', '#0A0A0C')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', d => Math.max(10, sizeScale(passCount[d.id] || 1) * 0.6))
      .attr('font-weight', 700).attr('pointer-events', 'none')
      .text(d => numbers[d.id]);

    // Hover: komşu vurgula
    nodeSel.on('mouseenter', (event, d) => {
      const neighbors = new Set([d.id]);
      filtLinks.forEach(l => {
        if (l.source === d.id) neighbors.add(l.target);
        if (l.target === d.id) neighbors.add(l.source);
      });
      nodeSel.style('opacity', n => neighbors.has(n.id) ? 1 : 0.15);
      linkSel.style('stroke-opacity', l =>
        (l.source === d.id || l.target === d.id) ? 0.9 : 0.05
      );
    }).on('mouseleave', () => {
      nodeSel.style('opacity', 1);
      linkSel.style('stroke-opacity', 0.35);
    });

    // Tooltip
    nodeSel.append('title').text(d => {
      const name = d.id.split(' (')[0];
      return `#${numbers[d.id]} ${name}
${d.team} · ${passCount[d.id]} pas`;
    });
  }

  const detailBox = document.getElementById('passnet-detail');
  nodeSel.on('click', (e, d) => {
    if (!detailBox) return;
    const name = d.id.split(' (')[0];
    const passes = passCount[d.id];
    const pct = Math.round(passes / maxPass * 100);
    detailBox.innerHTML = `
      <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--line);">
        <span style="font-family:var(--serif);font-size:32px;color:${TEAM_COLORS[d.team]};font-weight:500;">#${numbers[d.id]}</span>
        <span style="font-family:var(--sans);font-size:18px;color:var(--ink);font-weight:500;">${name}</span>
        <span style="margin-left:auto;font-family:var(--mono);font-size:10px;letter-spacing:0.16em;color:${TEAM_COLORS[d.team]};">${d.team}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
        <div><div style="font-family:var(--mono);font-size:9px;letter-spacing:0.2em;color:var(--ink-faint);margin-bottom:6px;">PAS</div><div style="font-family:var(--serif);font-size:28px;color:var(--ink);">${passes}</div></div>
        <div><div style="font-family:var(--mono);font-size:9px;letter-spacing:0.2em;color:var(--ink-faint);margin-bottom:6px;">YOĞUNLUK</div><div style="font-family:var(--serif);font-size:28px;color:${TEAM_COLORS[d.team]};">%${pct}</div></div>
        <div><div style="font-family:var(--mono);font-size:9px;letter-spacing:0.2em;color:var(--ink-faint);margin-bottom:6px;">POZİSYON</div><div style="font-family:var(--mono);font-size:14px;color:var(--ink-soft);">x:${d.x.toFixed(0)} y:${d.y.toFixed(0)}</div></div>
      </div>
    `;
    detailBox.classList.add('on');
  });

  render();

  // Filtre butonları
  const filters = document.getElementById(filtersId);
  if (filters) {
    filters.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentTeam = btn.getAttribute('data-team');
        const detailBox = document.getElementById('passnet-detail');
  nodeSel.on('click', (e, d) => {
    if (!detailBox) return;
    const name = d.id.split(' (')[0];
    const passes = passCount[d.id];
    const pct = Math.round(passes / maxPass * 100);
    detailBox.innerHTML = `
      <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--line);">
        <span style="font-family:var(--serif);font-size:32px;color:${TEAM_COLORS[d.team]};font-weight:500;">#${numbers[d.id]}</span>
        <span style="font-family:var(--sans);font-size:18px;color:var(--ink);font-weight:500;">${name}</span>
        <span style="margin-left:auto;font-family:var(--mono);font-size:10px;letter-spacing:0.16em;color:${TEAM_COLORS[d.team]};">${d.team}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
        <div><div style="font-family:var(--mono);font-size:9px;letter-spacing:0.2em;color:var(--ink-faint);margin-bottom:6px;">PAS</div><div style="font-family:var(--serif);font-size:28px;color:var(--ink);">${passes}</div></div>
        <div><div style="font-family:var(--mono);font-size:9px;letter-spacing:0.2em;color:var(--ink-faint);margin-bottom:6px;">YOĞUNLUK</div><div style="font-family:var(--serif);font-size:28px;color:${TEAM_COLORS[d.team]};">%${pct}</div></div>
        <div><div style="font-family:var(--mono);font-size:9px;letter-spacing:0.2em;color:var(--ink-faint);margin-bottom:6px;">POZİSYON</div><div style="font-family:var(--mono);font-size:14px;color:var(--ink-soft);">x:${d.x.toFixed(0)} y:${d.y.toFixed(0)}</div></div>
      </div>
    `;
    detailBox.classList.add('on');
  });

  render();
      });
    });
  }
}
