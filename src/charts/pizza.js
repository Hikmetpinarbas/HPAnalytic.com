import * as d3 from 'd3';

const TEAM_COLORS = { GS: '#FF6B35', FB: '#B4FF39', BJK: '#F4F2EC', TS: '#7B9FEA' };
const DEF_COLOR = '#8A8A93';

let DATA = null;

export async function initPizza(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!DATA) DATA = await fetch('/assets/data/radar_data.json').then(r => r.json());
  if (!DATA || !DATA.players) { container.textContent = 'Veri yok'; return; }

  const labels = DATA.labels;
  const players = DATA.players;
  const names = Object.keys(players);

  // Kontrol paneli
  const panel = document.createElement('div');
  panel.className = 'pizza-controls';
  panel.innerHTML = `
    <div class="pizza-filters">
      <select id="pz-team" class="radar-select"><option value="">Tüm Takımlar</option></select>
      <input id="pz-search" class="radar-input" type="text" placeholder="Oyuncu ara...">
    </div>
    <div class="pizza-list" id="pz-list"></div>
  `;
  container.parentElement.insertBefore(panel, container);

  // Takım listesi
  const teams = [...new Set(names.map(n => players[n].team))].sort();
  const teamSel = panel.querySelector('#pz-team');
  teams.forEach(t => {
    const o = document.createElement('option');
    o.value = t; o.textContent = t;
    teamSel.appendChild(o);
  });

  // SVG
  const W = 600, H = 600;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) / 2 - 100;
  const N = labels.length;
  const sliceAngle = (Math.PI * 2) / N;
  const radial = d3.scaleLinear().domain([0, 100]).range([0, R]);

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto')
    .style('max-height', '560px');

  // Arka plan dilimleri
  const gBg = svg.append('g');
  for (let i = 0; i < N; i++) {
    const a0 = i * sliceAngle - Math.PI / 2 - sliceAngle / 2;
    const a1 = a0 + sliceAngle;
    const arc = d3.arc().innerRadius(0).outerRadius(R).startAngle(a0).endAngle(a1);
    gBg.append('path').attr('d', arc()).attr('fill', '#121216').attr('stroke', '#1B1B21').attr('stroke-width', 1);
  }

  // Halkalar
  [20, 40, 60, 80, 100].forEach(r => {
    svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', radial(r))
      .attr('fill', 'none').attr('stroke', '#2E271C').attr('stroke-width', 1)
      .attr('stroke-dasharray', r === 100 ? null : '2 6');
  });

  // Etiketler
  labels.forEach((label, i) => {
    const a = i * sliceAngle - Math.PI / 2;
    const lx = cx + Math.cos(a) * (R + 30);
    const ly = cy + Math.sin(a) * (R + 30);
    svg.append('text').attr('x', lx).attr('y', ly)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
      .attr('fill', '#8A8A93').attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', 9).attr('letter-spacing', '0.1em')
      .text(label.toUpperCase());
  });

  // Oyuncu grubu
  const gPlayer = svg.append('g');

  function drawPlayer(name) {
    gPlayer.selectAll('*').remove();
    const p = players[name];
    if (!p) return;

    const color = TEAM_COLORS[p.team] || DEF_COLOR;

    // Merkez isim
    svg.selectAll('.pz-name').remove();
    svg.append('text').attr('class', 'pz-name')
      .attr('x', cx).attr('y', cy).attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#F4F2EC').attr('font-family', 'Newsreader, serif')
      .attr('font-size', 18).attr('font-weight', 500)
      .text(name.split(' (')[0]);

    // Pizza dilimleri
    p.norm.forEach((v, i) => {
      const r = Math.max(4, radial(v));
      const a0 = i * sliceAngle - Math.PI / 2 - sliceAngle / 2 + 0.03;
      const a1 = a0 + sliceAngle - 0.06;
      const arc = d3.arc().innerRadius(0).outerRadius(r).startAngle(a0).endAngle(a1);
      gPlayer.append('path')
        .attr('d', arc())
        .attr('fill', color)
        .attr('fill-opacity', 0.7)
        .attr('stroke', color)
        .attr('stroke-width', 1.5)
        .attr('stroke-linejoin', 'round');
    });
  }

  // Liste
  const listEl = panel.querySelector('#pz-list');
  const searchInp = panel.querySelector('#pz-search');

  function renderList() {
    const t = teamSel.value;
    const q = searchInp.value.toLowerCase();
    const filtered = names.filter(n => {
      if (t && players[n].team !== t) return false;
      if (q && !n.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => {
      const oa = players[a].norm.reduce((x,y)=>x+y,0)/players[a].norm.length;
      const ob = players[b].norm.reduce((x,y)=>x+y,0)/players[b].norm.length;
      return ob - oa;
    });
    listEl.innerHTML = filtered.slice(0, 30).map(n => {
      const p = players[n];
      const score = (p.norm.reduce((x,y)=>x+y,0)/p.norm.length).toFixed(0);
      return `<button class="pz-item" data-name="${n}">
        <span class="pz-n">${n.split(' (')[0]}</span>
        <span class="pz-t">${p.team}</span>
        <span class="pz-s">${score}</span>
      </button>`;
    }).join('');
    listEl.querySelectorAll('.pz-item').forEach(btn => {
      btn.addEventListener('click', () => {
        listEl.querySelectorAll('.pz-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        drawPlayer(btn.dataset.name);
      });
    });
    if (filtered[0]) {
      const first = listEl.querySelector('.pz-item');
      if (first) first.click();
    }
  }

  teamSel.addEventListener('change', renderList);
  searchInp.addEventListener('input', renderList);
  renderList();
}
