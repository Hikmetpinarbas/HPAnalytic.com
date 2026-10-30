import * as d3 from 'd3';
import { gsap } from 'gsap';

const TEAM_COLORS = { GS: '#FF6B35', FB: '#B4FF39' };
const TYPE_META = {
  'Goal':       { r: 9,  stroke: 2,   label: 'GOL',       op: 1,    shape: 'star' },
  'On Target':  { r: 7,  stroke: 1.5, label: 'İSABETLİ',  op: 0.95, shape: 'circle' },
  'Off Target': { r: 5.5,stroke: 1.5, label: 'İSABETSİZ', op: 0.7,  shape: 'x' },
  'Blocked':    { r: 5,  stroke: 1.2, label: 'BLOKE',     op: 0.55, shape: 'square' },
};

let DATA = null;
let state = { team: 'all', type: 'all', player: null };

export async function initShotMap(containerId, filtersId) {
  const container = document.getElementById(containerId);
  if (!container || container.querySelector('svg')) return;
  container.innerHTML = '';

  if (!DATA) DATA = await fetch('/assets/data/shot_map.json').then(r => r.json());
  if (!DATA || !DATA.length) { container.textContent = 'Veri yok'; return; }

  const PITCH_L = 105, PITCH_W = 68, M = 8, K = 6.2;
  const offsetX = M * K, offsetY = M * K;
  const w = PITCH_L * K, h = PITCH_W * K;
  const totalW = w + 2 * offsetX, totalH = h + 2 * offsetY;

  // ── SVG ──
  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${totalW} ${totalH}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto')
    .style('max-height', '560px');

  // ── Katman 1: Saha ──
  const pitch = svg.append('g');
  pitch.append('rect')
    .attr('x', offsetX).attr('y', offsetY)
    .attr('width', w).attr('height', h)
    .attr('fill', '#0A0A0C').attr('stroke', '#2E271C').attr('stroke-width', 1.5);
  pitch.append('line')
    .attr('x1', offsetX + w/2).attr('y1', offsetY)
    .attr('x2', offsetX + w/2).attr('y2', offsetY + h)
    .attr('stroke', '#2E271C').attr('stroke-width', 1);
  pitch.append('circle')
    .attr('cx', offsetX + w/2).attr('cy', offsetY + h/2).attr('r', 9.15 * K)
    .attr('fill', 'none').attr('stroke', '#2E271C').attr('stroke-width', 1);
  pitch.append('circle')
    .attr('cx', offsetX + w/2).attr('cy', offsetY + h/2).attr('r', 1.8)
    .attr('fill', '#2E271C');
  [0, 1].forEach(side => {
    const bx = side === 0 ? offsetX : offsetX + w - 16.5 * K;
    pitch.append('rect')
      .attr('x', bx).attr('y', offsetY + (h - 40.32 * K) / 2)
      .attr('width', 16.5 * K).attr('height', 40.32 * K)
      .attr('fill', 'none').attr('stroke', '#2E271C').attr('stroke-width', 1);
    const gx = side === 0 ? offsetX : offsetX + w - 5.5 * K;
    pitch.append('rect')
      .attr('x', gx).attr('y', offsetY + (h - 18.32 * K) / 2)
      .attr('width', 5.5 * K).attr('height', 18.32 * K)
      .attr('fill', 'none').attr('stroke', '#2E271C').attr('stroke-width', 1);
    const goalX = side === 0 ? offsetX - 4 : offsetX + w;
    pitch.append('rect')
      .attr('x', goalX).attr('y', offsetY + (h - 7.32 * K) / 2)
      .attr('width', 4).attr('height', 7.32 * K)
      .attr('fill', '#2E271C').attr('stroke', '#2E271C');
  });

  // ── Katman 2: Isı yoğunluk (SVG filter) ──
  const defs = svg.append('defs');
  const glow = defs.append('filter').attr('id', 'shotGlow');
  glow.append('feGaussianBlur').attr('stdDeviation', 3).attr('result', 'blur');
  const merge = glow.append('feMerge');
  merge.append('feMergeNode').attr('in', 'blur');
  merge.append('feMergeNode').attr('in', 'SourceGraphic');

  // ── Katman 3: Şutlar ──
  const shotsLayer = svg.append('g').attr('class', 'shots-layer');

  // ── Tooltip ──
  const tip = document.createElement('div');
  tip.className = 'shot-tooltip';
  container.style.position = 'relative';
  container.appendChild(tip);

  // ── Filter helpers ──
  function matches(s) {
    if (state.team !== 'all' && s.team !== state.team) return false;
    if (state.type !== 'all' && s.type !== state.type) return false;
    if (state.player && s.player !== state.player) return false;
    return true;
  }

  // ── Render ──
  function render(animate = false) {
    const filtered = DATA.filter(matches);

    // Jitter çakışma çözümü
    const counter = {};
    const pos = filtered.map(s => {
      const key = `${s.x.toFixed(1)},${s.y.toFixed(1)},${s.player}`;
      counter[key] = (counter[key] || 0) + 1;
      const n = counter[key];
      const jitter = n > 1 ? (n - 1) * 1.4 : 0;
      const ja = (n * 2.4) % (Math.PI * 2);
      return {
        ...s,
        px: offsetX + s.x * K + Math.cos(ja) * jitter,
        py: offsetY + s.y * K + Math.sin(ja) * jitter,
      };
    });

    // Sort: Goal en üstte
    const order = { 'Off Target': 1, 'Blocked': 2, 'On Target': 3, 'Goal': 4 };
    pos.sort((a, b) => (order[a.type] || 0) - (order[b.type] || 0));

    // Data join
    const sel = shotsLayer.selectAll('g.shot').data(pos, d => `${d.player}-${d.x}-${d.y}-${d.type}-${Math.random()}`);

    // EXIT
    sel.exit().transition().duration(300).style('opacity', 0).remove();

    // ENTER
    const enter = sel.enter().append('g')
      .attr('class', 'shot')
      .style('cursor', 'pointer')
      .style('opacity', 0);

    enter.each(function(d) {
      const g = d3.select(this);
      const meta = TYPE_META[d.type] || TYPE_META['Off Target'];
      const color = TEAM_COLORS[d.team] || '#8A8A93';

      if (meta.shape === 'star') {
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const ang = (Math.PI / 5) * i - Math.PI / 2;
          const rad = i % 2 === 0 ? meta.r : meta.r * 0.45;
          pts.push([Math.cos(ang) * rad, Math.sin(ang) * rad]);
        }
        g.append('polygon')
          .attr('points', pts.map(p => p.join(',')).join(' '))
          .attr('fill', color)
          .attr('stroke', '#0A0A0C').attr('stroke-width', 1.5);
      } else if (meta.shape === 'circle') {
        g.append('circle').attr('r', meta.r)
          .attr('fill', color).attr('fill-opacity', 0.7)
          .attr('stroke', color).attr('stroke-width', meta.stroke);
      } else if (meta.shape === 'x') {
        const s = meta.r;
        g.append('line').attr('x1', -s).attr('y1', -s).attr('x2', s).attr('y2', s)
          .attr('stroke', color).attr('stroke-width', meta.stroke).attr('stroke-linecap', 'round');
        g.append('line').attr('x1', -s).attr('y1', s).attr('x2', s).attr('y2', -s)
          .attr('stroke', color).attr('stroke-width', meta.stroke).attr('stroke-linecap', 'round');
      } else if (meta.shape === 'square') {
        g.append('rect')
          .attr('x', -meta.r).attr('y', -meta.r)
          .attr('width', meta.r*2).attr('height', meta.r*2)
          .attr('fill', 'none').attr('stroke', color).attr('stroke-width', meta.stroke);
      }

      // Hit area
      g.append('circle').attr('r', 12).attr('fill', 'transparent').style('pointer-events', 'all');
    });

    // MERGE
    const merged = enter.merge(sel)
      .attr('transform', d => `translate(${d.px},${d.py})`);

    // Animate in
    if (animate) {
      merged.style('opacity', 0);
      gsap.to(merged.nodes(), {
        opacity: 1,
        duration: 0.35,
        stagger: 0.008,
        ease: 'power2.out',
      });
    } else {
      merged.style('opacity', 1);
    }

    // Hover + click
    merged
      .on('mouseenter', function(e, d) {
        d3.select(this).select('circle').attr('r', 14);
        d3.select(this).raise();
        const color = TEAM_COLORS[d.team] || '#8A8A93';
        const meta = TYPE_META[d.type] || TYPE_META['Off Target'];
        const r = this.getBoundingClientRect();
        tip.innerHTML = `
          <div style="color:${color};font-family:var(--mono);font-size:9px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:6px;">${d.team} · ${meta.label}</div>
          <div style="color:#F4F2EC;font-family:var(--serif);font-size:16px;margin-bottom:2px;">${d.player.split(' (')[0]}</div>
        `;
        tip.style.left = (r.left - container.getBoundingClientRect().left + r.width/2) + 'px';
        tip.style.top = (r.top - container.getBoundingClientRect().top - 8) + 'px';
        tip.classList.add('on');
      })
      .on('mouseleave', function() {
        d3.select(this).select('circle').attr('r', 12);
        tip.classList.remove('on');
      })
      .on('click', function(e, d) {
        e.stopPropagation();
        if (state.player === d.player) {
          state.player = null;
        } else {
          state.player = d.player;
        }
        updatePlayerDisplay();
        render(true);
      });

    // Özet sayaç
    updateStats(pos);
  }

  // ── Stats bar ──
  function updateStats(filtered) {
    const counts = { total: filtered.length, goals: 0, on: 0, off: 0, blocked: 0 };
    filtered.forEach(s => {
      if (s.type === 'Goal') counts.goals++;
      else if (s.type === 'On Target') counts.on++;
      else if (s.type === 'Off Target') counts.off++;
      else if (s.type === 'Blocked') counts.blocked++;
    });
    const statsEl = document.getElementById('shot-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <span class="shs"><b>${counts.total}</b> şut</span>
        <span class="shs" style="color:var(--neon);"><b>${counts.goals}</b> gol</span>
        <span class="shs"><b>${counts.on}</b> isabetli</span>
        <span class="shs"><b>${counts.off}</b> isabetsiz</span>
        <span class="shs"><b>${counts.blocked}</b> bloke</span>
      `;
    }
  }

  // ── Player filter indicator ──
  function updatePlayerDisplay() {
    const disp = document.getElementById('shot-player-filter');
    if (!disp) return;
    if (state.player) {
      disp.classList.add('on');
      disp.innerHTML = `Oyuncu: <b>${state.player.split(' (')[0]}</b> <button onclick="document.getElementById('shot-player-filter').click()">×</button>`;
      disp.onclick = () => {
        state.player = null;
        updatePlayerDisplay();
        render(true);
      };
    } else {
      disp.classList.remove('on');
      disp.innerHTML = '';
    }
  }

  // ── Type filter buttons ──
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

  // Type chips (inject)
  const typeBar = document.createElement('div');
  typeBar.className = 'shot-type-bar';
  typeBar.innerHTML = `
    <button class="type-chip active" data-type="all">TÜMÜ</button>
    <button class="type-chip" data-type="Goal" style="--c:#B4FF39">GOL</button>
    <button class="type-chip" data-type="On Target" style="--c:#F4F2EC">İSABETLİ</button>
    <button class="type-chip" data-type="Off Target" style="--c:#7A7368">İSABETSİZ</button>
    <button class="type-chip" data-type="Blocked" style="--c:#FF6B35">BLOKE</button>
  `;
  const typeBarWrap = document.createElement('div');
  typeBarWrap.className = 'shot-type-wrap';
  typeBarWrap.appendChild(typeBar);
  if (filters && filters.parentNode) {
    filters.parentNode.insertBefore(typeBarWrap, filters.nextSibling);
  }

  typeBar.querySelectorAll('.type-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      typeBar.querySelectorAll('.type-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.type = chip.dataset.type;
      render(true);
    });
  });

  // Stats bar (inject)
  const statsBar = document.createElement('div');
  statsBar.id = 'shot-stats';
  statsBar.className = 'shot-stats';
  if (filters && filters.parentNode) {
    filters.parentNode.insertBefore(statsBar, typeBarWrap.nextSibling);
  }

  // Player filter display (inject)
  const playerDisp = document.createElement('div');
  playerDisp.id = 'shot-player-filter';
  playerDisp.className = 'shot-player-filter';
  if (filters && filters.parentNode) {
    filters.parentNode.insertBefore(playerDisp, statsBar.nextSibling);
  }

  // Initial render (animated)
  render(true);
}
