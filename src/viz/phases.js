import * as d3 from 'd3';
import { gsap } from 'gsap';
import { DNA } from './theme.js';
import { initTooltip, showTooltip, hideTooltip, moveTooltip } from './utils.js';

const LABELS = {
  build_up: 'Kendi Yarı', set_attack: 'Rakip Yarı', transition_attack: 'Geçiş Hüc.',
  set_defense: 'Savunma', transition_defense: 'Geç. Sav.'
};

export function renderPhases(container, data) {
  const phases = data.four_phases.phases;
  const keys = Object.keys(phases);
  
  // Boyut zorlaması (Boş çizimi engeller)
  const width = container.clientWidth || 600;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };

  container.innerHTML = '';
  const svg = d3.select(container).append('svg')
    .attr('width', '100%').attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const x = d3.scaleBand().domain(keys).range([0, innerW]).padding(0.4);
  const maxPct = d3.max(keys, k => phases[k].energy_pct || 0) || 50;
  const y = d3.scaleLinear().domain([0, maxPct * 1.2]).range([innerH, 0]);

  // Eksen
  g.append('g').attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickFormat(k => LABELS[k] || k))
    .selectAll('text').attr('fill', DNA.dim).attr('font-family', DNA.font).attr('font-size', '11px').attr('text-anchor', 'middle');
  
  g.selectAll('.domain, .tick line').attr('stroke', 'rgba(30, 33, 29, 0.8)');

  initTooltip();

  // Barlar
  const bars = g.selectAll('.bar').data(keys).enter().append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d))
    .attr('width', x.bandwidth())
    .attr('y', innerH).attr('height', 0)
    .attr('fill', (d, i) => i === 0 || i === 2 ? DNA.neon : DNA.orange)
    .attr('rx', 2)
    .style('cursor', 'pointer')
    .on('mouseover', function(e, d) {
      d3.select(this).attr('opacity', 0.8);
      showTooltip(`<strong>${LABELS[d]}</strong><br/>%${phases[d].energy_pct}`, e);
    })
    .on('mousemove', (e) => moveTooltip(e))
    .on('mouseout', function() {
      d3.select(this).attr('opacity', 1);
      hideTooltip();
    });

  // Etiketler
  const labels = g.selectAll('.val').data(keys).enter().append('text')
    .attr('x', d => x(d) + x.bandwidth() / 2)
    .attr('y', innerH - 10).attr('text-anchor', 'middle')
    .attr('fill', DNA.ink).attr('font-family', DNA.font).attr('font-size', '12px').attr('font-weight', 'bold')
    .attr('opacity', 0).text(d => `%${phases[d].energy_pct}`);

  // GSAP Animasyon (Aşağıdan yukarı dolsun)
  gsap.to(bars.nodes(), {
    attr: { y: d => y(phases[d].energy_pct), height: d => innerH - y(phases[d].energy_pct) },
    duration: 1, stagger: 0.1, ease: 'power3.out'
  });
  gsap.to(labels.nodes(), {
    opacity: 1, y: d => y(phases[d].energy_pct) - 8, duration: 0.6, stagger: 0.1, delay: 0.4
  });
}
