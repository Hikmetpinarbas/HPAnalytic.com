import * as d3 from 'd3';
import { gsap } from 'gsap';

const TEAM_COLORS = { GS: '#FF6B35', FB: '#B4FF39' };

let DATA = null;
let state = { team: 'all' };

export async function initPassNet(containerId, filtersId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!DATA) DATA = await fetch('/assets/data/pass_network.json').then(r => r.json());
  if (!DATA || !DATA.nodes) { container.textContent = 'Veri yok'; return; }

  // As oyuncular
  const allNodes = DATA.nodes.filter(n => n.is_main === true);
  const nodeIds = new Set(allNodes.map(n => n.id));
  const allLinks = DATA.links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));
  const nodeById = Object.fromEntries(allNodes.map(n => [n.id, n]));

  // Pas sayısı → node boyutu
  const passCount = {};
  allNodes.forEach(n => passCount[n.id] = 0);
  allLinks.forEach(l => {
    passCount[l.source] = (passCount[l.source] || 0) + (l.value || 1);
    passCount[l.target] = (passCount[l.target] || 0) + (l.value || 1);
  });
  const maxPass = Math.max(...Object.values(passCount));
  const sizeScale = d3.scaleSqrt().domain([1, maxPass]).range([10, 26]);

  // Koordinat dönüşümü — GS sola, FB sağa hücum
  const X_MAX = 80;
  const scaleX = 52.5 / X_MAX;
  const getX = (n) => n.team === 'GS' ? 105 - (n.x * scaleX) : (n.x * scaleX);

  // Saha
  const PITCH_L = 105, PITCH_W = 68, M = 8, K = 6.2;
  const offsetX = M * K, offsetY = M * K;
  const w = PITCH_L * K, h = PITCH_W * K;
  const totalW = w + 2 * offsetX, totalH = h + 2 * offsetY;

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${totalW} ${totalH}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto')
    .style('max-height', '560px');

  // Saha çizimleri
  svg.append('rect')
    .attr('x', offsetX).attr('y', offsetY).attr('width', w).attr('height', h)
    .attr('fill', '#0A0A0C').attr('stroke', '#2E271C').attr('stroke-width', 1.5);
  svg.append('line')
    .attr('x1', offsetX + w/2).attr('y1', offsetY)
    .attr('x2', offsetX + w/2).attr('y2', offsetY + h)
    .attr('stroke', '#2E271C').attr('stroke-width', 1);
  svg.append('circle')
    .attr('cx', offsetX + w/2).attr('cy', offsetY + h/2).attr('r', 9.15 * K)
    .attr('fill', 'none').attr('stroke', '#2E271C').attr('stroke-width', 1);
  svg.append('circle')
    .attr('cx', offsetX + w/2).attr('cy', offsetY + h/2).attr('r', 1.8)
    .attr('fill', '#2E271C');
  [0, 1].forEach(side => {
    const bx = side === 0 ? offsetX : offsetX + w - 16.5 * K;
    svg.append('rect')
      .attr('x', bx).attr('y', offsetY + (h - 40.32 * K) / 2)
      .attr('width', 16.5 * K).attr('height', 40.32 * K)
      .attr('fill', 'none').attr('stroke', '#2E271C').attr('stroke-width', 1);
  });

  const linksG = svg.append('g');
  const nodesG = svg.append('g');

  // Tooltip
  const tip = document.createElement('div');
  tip.className = 'pass-tooltip';
  container.style.position = 'relative';
  container.appendChild(tip);

  // Detay paneli
  const detail = document.createElement('div');
  detail.className = 'pass-detail';
  detail.id = 'pass-detail';
  detail.innerHTML = '<div class="pd-hint">Oyuncuya tıkla → bilgiler</div>';
  container.parentNode.insertBefore(detail, container.nextSibling);

  function render(animate = false) {
    linksG.selectAll('*').remove();
    nodesG.selectAll('*').remove();

    const filtNodes = state.team === 'all' ? allNodes : allNodes.filter(n => n.team === state.team);
    const filtIds = new Set(filtNodes.map(n => n.id));
    const filtLinks = allLinks.filter(l => filtIds.has(l.source) && filtIds.has(l.target));

    // Link'ler
    linksG.selectAll('line').data(filtLinks).join('line')
      .attr('stroke', d => TEAM_COLORS[nodeById[d.source]?.team] || '#8A8A93')
      .attr('stroke-opacity', 0.28)
      .attr('stroke-width', d => Math.max(0.6, Math.sqrt(d.value || 1) * 0.85))
      .attr('x1', d => offsetX + getX(nodeById[d.source]) * K)
      .attr('y1', d => offsetY + nodeById[d.source].y * K)
      .attr('x2', d => offsetX + getX(nodeById[d.target]) * K)
      .attr('y2', d => offsetY + nodeById[d.target].y * K);

    // Node'lar
    const nodeSel = nodesG.selectAll('g').data(filtNodes).join('g')
      .attr('transform', d => `translate(${offsetX + getX(d) * K},${offsetY + d.y * K})`)
      .style('cursor', 'pointer')
      .style('opacity', animate ? 0 : 1);

    nodeSel.append('circle')
      .attr('r', d => sizeScale(passCount[d.id] || 1))
      .attr('fill', d => TEAM_COLORS[d.team] || '#8A8A93')
      .attr('stroke', '#0A0A0C').attr('stroke-width', 2);

    nodeSel.append('text')
      .attr('text-anchor', 'middle').attr('dy', '0.32em')
      .attr('fill', '#0A0A0C')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', d => Math.max(8, sizeScale(passCount[d.id] || 1) * 0.55))
      .attr('font-weight', 700)
      .attr('pointer-events', 'none')
      .text(d => {
        const name = d.id.split(' (')[0];
        const parts = name.split(' ');
        return parts.length > 1 ? parts[parts.length - 1].slice(0, 3).toUpperCase() : name.slice(0, 3).toUpperCase();
      });

    // Hover
    nodeSel.on('mouseenter', function(e, d) {
      const neighbors = new Set([d.id]);
      filtLinks.forEach(l => {
        if (l.source === d.id) neighbors.add(l.target);
        if (l.target === d.id) neighbors.add(l.source);
      });
      nodeSel.style('opacity', n => neighbors.has(n.id) ? 1 : 0.2);
      linksG.selectAll('line').style('stroke-opacity', l =>
        (l.source === d.id || l.target === d.id) ? 0.85 : 0.05
      );

      const name = d.id.split(' (')[0];
      const r = this.getBoundingClientRect();
      const cr = container.getBoundingClientRect();
      tip.innerHTML = `
        <div style="color:${TEAM_COLORS[d.team]};font-family:var(--mono);font-size:9px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:6px;">${d.team}</div>
        <div style="color:#F4F2EC;font-family:var(--serif);font-size:16px;margin-bottom:2px;">${name}</div>
        <div style="color:#7A7368;font-family:var(--mono);font-size:10px;letter-spacing:0.16em;">${passCount[d.id] || 0} pas</div>
      `;
      tip.style.left = (r.left - cr.left + r.width/2) + 'px';
      tip.style.top = (r.top - cr.top - 8) + 'px';
      tip.classList.add('on');
    }).on('click', function(e, d) {
      e.stopPropagation();
      const name = d.id.split(' (')[0];
      const passes = passCount[d.id] || 0;
      const links_from = filtLinks.filter(l => l.source === d.id).length;
      const links_to = filtLinks.filter(l => l.target === d.id).length;
      const pct = Math.round(passes / maxPass * 100);
      const color = TEAM_COLORS[d.team];
      detail.innerHTML = `
        <div class="pd-top" style="border-left-color:${color};">
          <div class="pd-name">${name}</div>
          <div class="pd-meta">
            <span style="color:${color};">${d.team}</span>
            <span>·</span>
            <span>As oyuncu</span>
          </div>
        </div>
        <div class="pd-stats">
          <div><span class="pd-k">Toplam Pas</span><span class="pd-v">${passes}</span></div>
          <div><span class="pd-k">Yoğunluk</span><span class="pd-v" style="color:${color};">%${pct}</span></div>
          <div><span class="pd-k">Verdiği</span><span class="pd-v">${links_from}</span></div>
          <div><span class="pd-k">Aldığı</span><span class="pd-v">${links_to}</span></div>
        </div>
        <button class="pd-close" onclick="document.getElementById('pass-detail').classList.remove('on')">×</button>
      `;
      detail.classList.add('on');
    }).on('mouseleave', function() {
      nodeSel.style('opacity', 1);
      linksG.selectAll('line').style('stroke-opacity', 0.28);
      tip.classList.remove('on');
    });

    if (animate) {
      gsap.to(nodeSel.nodes(), {
        opacity: 1,
        duration: 0.4,
        stagger: 0.025,
        ease: 'power2.out',
      });
    }
  }

  // Filtre
  const filters = document.getElementById(filtersId);
  if (filters) {
    filters.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.team = btn.getAttribute('data-team') || 'all';
        render(true);
      });
    });
  }

  render(true);
}
