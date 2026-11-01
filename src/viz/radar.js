import * as d3 from 'd3';
import { gsap } from 'gsap';
import { DNA } from './theme.js';
import { initTooltip, showTooltip, hideTooltip, moveTooltip } from './utils.js';

const METRICS = [
  { key: 'shots', label: 'ŞUT', max: 10 },
  { key: 'goals', label: 'GOL', max: 5 },
  { key: 'passes', label: 'PAS', max: 100 },
  { key: 'distance', label: 'MESAFE', max: 100, from: '_norm' },
  { key: 'sprints', label: 'SPRINT', max: 100, from: '_norm' },
  { key: 'max_speed', label: 'HIZ', max: 100, from: '_norm' }
];

export function renderRadar(container, playerData, playerName = '') {
  const width = 400;
  const height = 400;
  const margin = 60;
  const radius = (width - margin * 2) / 2;
  const angleSlice = (Math.PI * 2) / METRICS.length;
  
  container.innerHTML = '';
  const svg = d3.select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const g = svg.append('g').attr('transform', `translate(${width/2},${height/2})`);

  // Arka plan Grid
  const levels = 4;
  for (let i = 1; i <= levels; i++) {
    g.append('circle')
      .attr('r', (radius / levels) * i)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(30, 33, 29, 0.8)')
      .attr('stroke-width', i === levels ? 2 : 1)
      .attr('stroke-dasharray', i === levels ? 'none' : '3,3');
  }

  // Eksenler ve Etiketler
  METRICS.forEach((m, i) => {
    const angle = i * angleSlice - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', x).attr('y2', y)
      .attr('stroke', 'rgba(30, 33, 29, 1)').attr('stroke-width', 1);

    const labelRadius = radius + 25;
    g.append('text')
      .attr('x', Math.cos(angle) * labelRadius)
      .attr('y', Math.sin(angle) * labelRadius)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
      .attr('fill', DNA.dim).attr('font-family', DNA.font).attr('font-size', '10px')
      .attr('font-weight', 'bold').text(m.label);
  });

  // Veri Noktalarını Hesapla
  const points = METRICS.map((m, i) => {
    let val = 0;
    if (m.from === '_norm' && playerData._norm) val = playerData._norm[m.key] || 0;
    else val = playerData[m.key] || 0;
    
    // Normalize
    const pct = Math.min(val / m.max, 1);
    return {
      value: pct * radius,
      raw: Math.round(val * 10) / 10,
      label: m.label,
      angle: i * angleSlice - Math.PI / 2
    };
  });

  const radarLine = d3.lineRadial().radius(d => d.value).angle(d => d.angle).curve(d3.curveLinearClosed);

  // Poligon (Işıltılı Dolgu)
  const path = g.append('path')
    .datum(points)
    .attr('d', radarLine)
    .attr('fill', `${DNA.neon}33`) // %20 saydam yeşil
    .attr('stroke', DNA.neon)
    .attr('stroke-width', 2)
    .attr('filter', 'drop-shadow(0 0 8px rgba(180,255,57,0.5))');

  // Noktalar (İnteraktif)
  const dots = g.selectAll('.radar-dot').data(points).enter().append('circle')
    .attr('r', 4).attr('fill', DNA.bg).attr('stroke', DNA.neon).attr('stroke-width', 2)
    .attr('cx', d => Math.cos(d.angle) * d.value)
    .attr('cy', d => Math.sin(d.angle) * d.value)
    .style('cursor', 'crosshair');

  initTooltip();
  dots.on('mouseover', function(e, d) {
    d3.select(this).transition().duration(150).attr('r', 7).attr('fill', DNA.neon);
    showTooltip(`<strong>${d.label}</strong><br/>${d.raw}`, e);
  }).on('mousemove', (e) => moveTooltip(e))
    .on('mouseout', function() {
    d3.select(this).transition().duration(150).attr('r', 4).attr('fill', DNA.bg);
    hideTooltip();
  });

  // GSAP Çizim Animasyonu
  const pathLength = path.node().getTotalLength();
  path.attr('stroke-dasharray', pathLength).attr('stroke-dashoffset', pathLength);
  gsap.to(path.node(), { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' });
  gsap.from(dots.nodes(), { scale: 0, transformOrigin: 'center', duration: 0.5, stagger: 0.1, delay: 0.5, ease: 'back.out(2)' });
}
