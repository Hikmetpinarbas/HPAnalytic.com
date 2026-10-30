import * as d3 from 'd3';

let DATA = null;

export async function initRadar(containerId) {
  const container = document.getElementById(containerId);
  if (!container || container.querySelector('svg')) return;
  container.innerHTML = '';

  if (!DATA) {
    DATA = await fetch('/assets/data/radar_data.json').then(r => r.json());
  }

  const labels = DATA.labels;
  const players = DATA.players;
  const names = Object.keys(players);
  const N = labels.length;
  const angleFor = i => (Math.PI * 2 * i / N) - Math.PI / 2;

  // === KONTROL PANELİ ===
  const teams = [...new Set(names.map(n => players[n].team))].sort();
  const groups = ['FW','W','MF','FB','CB'];

  const panel = document.createElement('div');
  panel.className = 'radar-controls';
  panel.innerHTML = `
    <div class="radar-filters">
      <select id="rf-team" class="radar-select"><option value="">Tüm Takımlar (${teams.length})</option>${teams.map(t => `<option>${t}</option>`).join('')}</select>
      <select id="rf-group" class="radar-select"><option value="">Tüm Pozisyonlar</option>${groups.map(g => `<option>${g}</option>`).join('')}</select>
      <input id="rf-search" class="radar-input" type="text" placeholder="Oyuncu ara...">
    </div>
    <div class="radar-list" id="rf-list"></div>
  `;
  container.appendChild(panel);

  // === SVG ===
  const W = 640, H = 640;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) / 2 - 100;
  const radial = d3.scaleLinear().domain([0, 100]).range([0, R]);

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%').style('height', 'auto').style('max-height', '560px');

  // Bantlar
  const bands = ['#121216','#18181E','#1F1F26','#26262E','#2D2D36'];
  labels.forEach((_, i) => {
    const a1 = angleFor(i), a2 = angleFor(i + 1);
    bands.forEach((c, bi) => {
      const r1 = radial(bi * 20), r2 = radial((bi + 1) * 20);
      svg.append('polygon')
        .attr('points', [[cx + Math.cos(a1)*r1, cy + Math.sin(a1)*r1],
                         [cx + Math.cos(a1)*r2, cy + Math.sin(a1)*r2],
                         [cx + Math.cos(a2)*r2, cy + Math.sin(a2)*r2],
                         [cx + Math.cos(a2)*r1, cy + Math.sin(a2)*r1]]
          .map(p => p.join(',')).join(' '))
        .attr('fill', c);
    });
  });

  [20,40,60,80,100].forEach(r => {
    svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', radial(r))
      .attr('fill', 'none').attr('stroke', '#2A2B33')
      .attr('stroke-width', r === 100 ? 1.5 : 0.5)
      .attr('stroke-dasharray', r === 100 ? null : '2 6');
  });

  labels.forEach((label, i) => {
    const a = angleFor(i);
    svg.append('line').attr('x1', cx).attr('y1', cy)
      .attr('x2', cx + Math.cos(a) * R).attr('y2', cy + Math.sin(a) * R)
      .attr('stroke', '#2A2B33').attr('stroke-width', 1);
    const short = label;
    const lx = cx + Math.cos(a) * (R + 38);
    const ly = cy + Math.sin(a) * (R + 38);
    const cosA = Math.cos(a);
    const anchor = cosA > 0.15 ? 'start' : cosA < -0.15 ? 'end' : 'middle';
    svg.append('text').attr('x', lx).attr('y', ly)
      .attr('text-anchor', anchor).attr('dominant-baseline', 'middle')
      .attr('fill', '#B0B0B8')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', 10.5).attr('letter-spacing', '0.16em')
      .text(short.toUpperCase());
  });

  // Oyuncu merkez: isim + takım
  const labelGroup = svg.append('g').attr('transform', `translate(${cx}, ${cy})`);
  const playerLabel = labelGroup.append('text')
    .attr('text-anchor', 'middle').attr('y', 4)
    .attr('fill', '#F4F2EC').attr('font-family', 'Newsreader, serif')
    .attr('font-size', 22).attr('font-weight', 500).attr('opacity', 0);

  const playerGroup = svg.append('g');

  function drawPlayer(name) {
    playerGroup.selectAll('*').remove();
    if (!name || !players[name]) {
      playerLabel.attr('opacity', 0);
      return;
    }
    const p = players[name];
    const color = p.team === 'Galatasaray' ? '#FF6B35' : p.team === 'Fenerbahce' ? '#B4FF39' : '#B4FF39';

    const points = p.norm.map((v, i) => {
      const val = Math.max(0, Math.min(100, v));
      const r = radial(val);
      const a = angleFor(i);
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    });

    playerGroup.append('polygon')
      .attr('points', points.map(p => p.join(',')).join(' '))
      .attr('fill', color).attr('fill-opacity', 0.14)
      .attr('stroke', color).attr('stroke-width', 2.5)
      .attr('stroke-linejoin', 'round');

    points.forEach(pt => {
      playerGroup.append('circle')
        .attr('cx', pt[0]).attr('cy', pt[1]).attr('r', 5)
        .attr('fill', color).attr('stroke', '#0A0A0C').attr('stroke-width', 2);
    });

    playerLabel.attr('opacity', 0.5)
      .text(name.split(' (')[0]);
  }

  // Liste render
  const listEl = panel.querySelector('#rf-list');
  const teamSel = panel.querySelector('#rf-team');
  const groupSel = panel.querySelector('#rf-group');
  const searchInp = panel.querySelector('#rf-search');

  function renderList() {
    const t = teamSel.value;
    const g = groupSel.value;
    const q = searchInp.value.toLowerCase();
    const filtered = names.filter(n => {
      const p = players[n];
      if (t && p.team !== t) return false;
      if (g && p.pos_group !== g) return false;
      if (q && !n.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => {
      const oa = players[a].norm.reduce((x,y)=>x+y,0)/6;
      const ob = players[b].norm.reduce((x,y)=>x+y,0)/6;
      return ob - oa;
    });
    listEl.innerHTML = filtered.slice(0, 40).map(n => {
      const p = players[n];
      const score = (p.norm.reduce((x,y)=>x+y,0)/6).toFixed(0);
      return `<button class="radar-item" data-name="${n}">
        <span class="ri-name">${n.split(' (')[0]}</span>
        <span class="ri-team">${p.team}</span>
        <span class="ri-pos">${p.position}</span>
        <span class="ri-score">${score}</span>
      </button>`;
    }).join('');
    listEl.querySelectorAll('.radar-item').forEach(btn => {
      btn.addEventListener('click', () => {
        listEl.querySelectorAll('.radar-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        drawPlayer(btn.dataset.name);
      });
    });
    if (filtered[0]) {
      const first = listEl.querySelector('.radar-item');
      if (first) first.click();
    }
  }

  teamSel.addEventListener('change', renderList);
  groupSel.addEventListener('change', renderList);
  searchInp.addEventListener('input', renderList);
  renderList();
}
