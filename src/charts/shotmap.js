import * as d3 from 'd3';

const TEAM_COLORS = { GS: '#FF6B35', FB: '#B4FF39' };
const TYPE_STYLE = {
  'Goal':       { shape: 'star',   r: 8, opacity: 1,    stroke: 2,   label: 'GOL' },
  'On Target':  { shape: 'circle', r: 6, opacity: 0.95, stroke: 1.5, label: 'İSABETLİ' },
  'Off Target': { shape: 'x',      r: 5, opacity: 0.75, stroke: 1.5, label: 'İSABETSİZ' },
  'Blocked':    { shape: 'square', r: 4, opacity: 0.6,  stroke: 1.2, label: 'BLOKE' },
};

export async function initShotMap(containerId, filtersId) {
  const container = document.getElementById(containerId);
  if (!container || container.querySelector('svg')) return;
  container.innerHTML = '';

  let data;
  try {
    data = await fetch('/assets/data/shot_map.json').then(r => r.json());
  } catch { container.textContent = 'Veri yüklenemedi'; return; }

  let currentTeam = 'all';

  // Gerçek saha 105×68, K=6.2 ölçek
  const PITCH_L = 105, PITCH_W = 68, M = 8, K = 6.2;
  const offsetX = M * K, offsetY = M * K;
  const w = PITCH_L * K, h = PITCH_W * K;
  const totalW = w + 2 * offsetX, totalH = h + 2 * offsetY;

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${totalW} ${totalH}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('role', 'img')
    .attr('aria-label', 'Şut haritası')
    .style('width', '100%')
    .style('height', 'auto')
    .style('max-height', '560px');

  // SAHA — GÖRÜNÜR, KOYU YEŞİL
  const pitch = svg.append('g');

  // Çim tabanı — KOYU YEŞİL
  pitch.append('rect')
    .attr('x', offsetX).attr('y', offsetY).attr('width', w).attr('height', h)
    .attr('fill', '#0F1F14');

  // Biçme şeritleri (dikey)
  for (let i = 0; i < 14; i++) {
    const sw = w / 14;
    pitch.append('rect')
      .attr('x', offsetX + i * sw).attr('y', offsetY)
      .attr('width', sw).attr('height', h)
      .attr('fill', i % 2 === 0 ? '#0F1F14' : '#132619');
  }

  // Dış çerçeve
  pitch.append('rect')
    .attr('x', offsetX).attr('y', offsetY).attr('width', w).attr('height', h)
    .attr('fill', 'none')
    .attr('stroke', '#5A7A5A').attr('stroke-width', 2);

  // Orta çizgi
  pitch.append('line')
    .attr('x1', offsetX + w/2).attr('y1', offsetY)
    .attr('x2', offsetX + w/2).attr('y2', offsetY + h)
    .attr('stroke', '#5A7A5A').attr('stroke-width', 2);

  // Orta yuvarlak
  pitch.append('circle')
    .attr('cx', offsetX + w/2).attr('cy', offsetY + h/2).attr('r', 9.15 * K)
    .attr('fill', 'none').attr('stroke', '#5A7A5A').attr('stroke-width', 2);

  // Orta nokta
  pitch.append('circle')
    .attr('cx', offsetX + w/2).attr('cy', offsetY + h/2).attr('r', 2.5)
    .attr('fill', '#5A7A5A');

  // Ceza sahaları + kale sahaları + kaleler + penaltı noktaları + yaylar
  [0, 1].forEach(side => {
    const isLeft = side === 0;
    const bx = isLeft ? offsetX : offsetX + w - 16.5 * K;
    const gx = isLeft ? offsetX : offsetX + w - 5.5 * K;
    const goalX = isLeft ? offsetX - 3 : offsetX + w;
    const spotX = isLeft ? offsetX + 11 * K : offsetX + w - 11 * K;

    // Ceza sahası
    pitch.append('rect')
      .attr('x', bx).attr('y', offsetY + (h - 40.32 * K) / 2)
      .attr('width', 16.5 * K).attr('height', 40.32 * K)
      .attr('fill', 'none').attr('stroke', '#5A7A5A').attr('stroke-width', 2);

    // Kale sahası
    pitch.append('rect')
      .attr('x', gx).attr('y', offsetY + (h - 18.32 * K) / 2)
      .attr('width', 5.5 * K).attr('height', 18.32 * K)
      .attr('fill', 'none').attr('stroke', '#5A7A5A').attr('stroke-width', 2);

    // Kale
    pitch.append('rect')
      .attr('x', goalX).attr('y', offsetY + (h - 7.32 * K) / 2)
      .attr('width', 3).attr('height', 7.32 * K)
      .attr('fill', '#7A9A7A').attr('stroke', '#5A7A5A').attr('stroke-width', 1);

    // Penaltı noktası
    pitch.append('circle')
      .attr('cx', spotX).attr('cy', offsetY + h/2).attr('r', 2)
      .attr('fill', '#5A7A5A');

    // Penaltı yayı
    const arcCenter = isLeft ? offsetX + 11 * K : offsetX + w - 11 * K;
    const arcAngle = isLeft ? -60 : 120;
    pitch.append('path')
      .attr('d', `M ${arcCenter + Math.cos(arcAngle * Math.PI/180) * 9.15 * K} ${offsetY + h/2 + Math.sin(arcAngle * Math.PI/180) * 9.15 * K} A ${9.15 * K} ${9.15 * K} 0 0 ${isLeft ? 0 : 1} ${arcCenter + Math.cos((arcAngle + (isLeft ? 120 : -120)) * Math.PI/180) * 9.15 * K} ${offsetY + h/2 + Math.sin((arcAngle + (isLeft ? 120 : -120)) * Math.PI/180) * 9.15 * K}`)
      .attr('fill', 'none').attr('stroke', '#5A7A5A').attr('stroke-width', 2);
  });

  // Köşe yayları
  [[offsetX, offsetY, 0], [offsetX + w, offsetY, 90],
   [offsetX + w, offsetY + h, 180], [offsetX, offsetY + h, 270]].forEach(([cx2, cy2, rot]) => {
    pitch.append('path')
      .attr('d', `M ${cx2} ${cy2} m 0 0 a ${1 * K} ${1 * K} 0 0 1 ${1 * K} 0`)
      .attr('transform', `rotate(${rot} ${cx2} ${cy2})`)
      .attr('fill', 'none').attr('stroke', '#5A7A5A').attr('stroke-width', 2);
  });

  const shotsGroup = svg.append('g');

  function render() {
    shotsGroup.selectAll('*').remove();
    const filtered = currentTeam === 'all' ? data : data.filter(d => d.team === currentTeam);

    const order = { 'Off Target': 1, 'Blocked': 2, 'On Target': 3, 'Goal': 4 };
    const sorted = [...filtered].sort((a, b) => (order[a.type] || 0) - (order[b.type] || 0));
    const counter = {};

    sorted.forEach(shot => {
      const color = TEAM_COLORS[shot.team] || '#8A8A93';
      const style = TYPE_STYLE[shot.type] || TYPE_STYLE['Off Target'];

      // Jitter — çakışmayı çöz
      const key = `${shot.x.toFixed(1)},${shot.y.toFixed(1)},${shot.player}`;
      counter[key] = (counter[key] || 0) + 1;
      const n = counter[key];
      const jitter = n > 1 ? (n - 1) * 1.3 : 0;
      const ja = (n * 2.4) % (Math.PI * 2);
      const px = offsetX + shot.x * K + Math.cos(ja) * jitter;
      const py = offsetY + shot.y * K + Math.sin(ja) * jitter;

      const g = shotsGroup.append('g').attr('opacity', style.opacity).style('cursor', 'pointer');

      if (style.shape === 'circle') {
        g.append('circle').attr('cx', px).attr('cy', py).attr('r', style.r)
          .attr('fill', color).attr('fill-opacity', 0.7)
          .attr('stroke', color).attr('stroke-width', style.stroke);
      } else if (style.shape === 'x') {
        const s = style.r;
        g.append('line').attr('x1', px-s).attr('y1', py-s).attr('x2', px+s).attr('y2', py+s)
          .attr('stroke', color).attr('stroke-width', style.stroke).attr('stroke-linecap', 'round');
        g.append('line').attr('x1', px-s).attr('y1', py+s).attr('x2', px+s).attr('y2', py-s)
          .attr('stroke', color).attr('stroke-width', style.stroke).attr('stroke-linecap', 'round');
      } else if (style.shape === 'square') {
        g.append('rect').attr('x', px-style.r).attr('y', py-style.r)
          .attr('width', style.r*2).attr('height', style.r*2)
          .attr('fill', 'none').attr('stroke', color).attr('stroke-width', style.stroke);
      } else if (style.shape === 'star') {
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const a = (Math.PI / 5) * i - Math.PI / 2;
          const rad = i % 2 === 0 ? style.r : style.r * 0.45;
          pts.push([px + Math.cos(a) * rad, py + Math.sin(a) * rad]);
        }
        g.append('polygon').attr('points', pts.map(p => p.join(',')).join(' '))
          .attr('fill', color).attr('stroke', '#0A0A0C').attr('stroke-width', 1.5);
      }

      // Hit alanı
      g.append('circle')
        .attr('cx', px).attr('cy', py).attr('r', 11)
        .attr('fill', 'transparent');

      g.append('title')
        .text(`${shot.player}\n${shot.team} · ${style.label}`);
    });
  }

  render();

  // Filtre butonları
  const filters = document.getElementById(filtersId);
  if (filters) {
    filters.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentTeam = btn.getAttribute('data-team');
        render();
      });
    });
  }
}
