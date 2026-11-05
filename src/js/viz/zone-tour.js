// Zone tour — pas noktaları + hull + oyuncu dolaşması
const PH = 68;
const flipY = y => PH - y;

export function renderZoneTour(svg, zones, key, accent) {
  svg.selectAll('.pn-zone, .pn-passpoint').remove();
  if (!key) return [];
  const zone = zones?.[key];
  if (!zone || !zone.hull || zone.hull.length < 3) return [];

  // Heat polygon
  const hullPts = zone.hull.map(p => [p[0], flipY(p[1])]);
  const gradId = 'pn-heat-' + Math.random().toString(36).slice(2, 9);
  svg.select('defs').append('radialGradient')
    .attr('id', gradId).attr('cx', '50%').attr('cy', '50%').attr('r', '70%')
    .html(
      `<stop offset="0%" stop-color="${accent}" stop-opacity="0.32"/>` +
      `<stop offset="55%" stop-color="${accent}" stop-opacity="0.12"/>` +
      `<stop offset="100%" stop-color="${accent}" stop-opacity="0.01"/>`
    );

  svg.insert('polygon', '.pn-edges')
    .attr('class', 'pn-zone')
    .attr('points', hullPts.map(p => p.join(',')).join(' '))
    .attr('fill', `url(#${gradId})`)
    .attr('stroke', accent).attr('stroke-width', 0.15).attr('stroke-opacity', 0.4)
    .style('pointer-events', 'none')
    .attr('opacity', 0)
    .transition().duration(400).attr('opacity', 1);

  // Pass points
  const pg = svg.append('g').attr('class', 'pn-passpoint').style('pointer-events', 'none');
  zone.pass_points.slice(0, 40).forEach((p, i) => {
    pg.append('circle')
      .attr('cx', p.x).attr('cy', flipY(p.y)).attr('r', 0)
      .attr('fill', '#fff').attr('opacity', 0)
      .transition().delay(i * 15).duration(250)
      .attr('r', 0.35).attr('opacity', 0.55);
  });

  return zone.pass_points.slice(0, 12).map(p => [p.x, flipY(p.y)]);
}

export function tourNode(svg, key, points) {
  const nodeEl = svg.select(`.pn-node[data-key="${key}"]`);
  if (nodeEl.empty() || points.length < 2) return () => {};
  const circle = nodeEl.select('circle');
  const rect = nodeEl.select('rect');
  const text = nodeEl.select('text');

  let frameId, startTime;
  const segDur = 450;
  const totalDur = (points.length - 1) * segDur;

  function step(now) {
    if (!startTime) startTime = now;
    const t = Math.min(1, (now - startTime) / totalDur);
    const seg = Math.min(points.length - 2, Math.floor(t * (points.length - 1)));
    const st = t * (points.length - 1) - seg;
    const a = points[seg], b = points[seg + 1];
    const cx = a[0] + (b[0] - a[0]) * st;
    const cy = a[1] + (b[1] - a[1]) * st;
    if (!circle.empty()) circle.attr('cx', cx).attr('cy', cy);
    if (!rect.empty()) {
      const size = parseFloat(rect.attr('width')) || 2;
      rect.attr('x', cx - size / 2).attr('y', cy - size / 2);
    }
    if (!text.empty()) text.attr('x', cx).attr('y', cy - 2);
    if (t < 1) frameId = requestAnimationFrame(step);
  }
  frameId = requestAnimationFrame(step);
  return () => { if (frameId) cancelAnimationFrame(frameId); };
}

export function clearZoneTour(svg) {
  svg.selectAll('.pn-zone, .pn-passpoint').remove();
}
