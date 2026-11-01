// HPAnalytic — Sprint / Fitness Bar Grafiği (D3 + GSAP)
import * as d3 from 'd3';
import { gsap } from 'gsap';
import { DNA } from './theme.js';

export function renderSprintChart(container, data) {
  // data.player_radar.players'tan sprint/mesafe çek
  const players = data.player_radar.players;
  const list = Object.entries(players)
    .map(([name, p]) => ({
      name,
      value: p.sprints || p._norm?.sprints || 0
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  if (list.length === 0) {
    container.innerHTML = '<div class="viz-error">Sprint verisi bulunamadı.</div>';
    return;
  }

  const width = Math.min(container.clientWidth || 600, 700);
  const height = 320;
  const margin = { top: 20, right: 40, bottom: 20, left: 140 };

  container.innerHTML = '';
  const svg = d3.select(container).append('svg')
    .attr('width', width).attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const x = d3.scaleLinear()
    .domain([0, d3.max(list, d => d.value)])
    .range([0, innerW]);

  const y = d3.scaleBand()
    .domain(list.map(d => d.name))
    .range([0, innerH])
    .padding(0.3);

  // Sol eksen (oyuncu isimleri)
  g.append('g')
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll('text')
    .attr('fill', DNA.ink)
    .attr('font-family', DNA.font)
    .attr('font-size', '12px');

  g.selectAll('.domain').attr('stroke', DNA.grid);

  // Barlar (başlangıçta width=0)
  const bars = g.selectAll('.bar')
    .data(list)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', d => y(d.name))
    .attr('width', 0)
    .attr('height', y.bandwidth())
    .attr('fill', DNA.neon)
    .attr('rx', 2);

  // GSAP ile doldur
  gsap.to(bars.nodes(), {
    attr: { width: d => x(d.value) },
    duration: 1.2,
    ease: 'power3.out',
    stagger: 0.08
  });

  // Değer etiketleri
  const labels = g.selectAll('.val')
    .data(list)
    .enter()
    .append('text')
    .attr('class', 'val')
    .attr('x', 4)
    .attr('y', d => y(d.name) + y.bandwidth() / 2 + 4)
    .attr('fill', DNA.bg)
    .attr('font-family', DNA.font)
    .attr('font-size', '11px')
    .attr('font-weight', '600')
    .attr('opacity', 0)
    .text(d => d.value);

  gsap.to(labels.nodes(), {
    opacity: 1,
    duration: 0.5,
    stagger: 0.08,
    delay: 0.6
  });
}
