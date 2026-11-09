// viz/flow-arrows.js — mekânsal değişimi gösteren oklar. Aşama 5. Sadece transform ile hareket (layout değil).

export function renderFlowArrows(svg, players) {
  const d3 = globalThis.d3;
  if (!d3) throw new Error("d3 global missing");
  const defs = d3.select(svg).append("defs");
  defs.append("marker").attr("id", "arrow-head").attr("viewBox", "0 0 10 10")
    .attr("refX", 8).attr("refY", 5).attr("markerWidth", 6).attr("markerHeight", 6)
    .attr("orient", "auto-start-reverse").append("path").attr("d", "M0,0 L10,5 L0,10 z").attr("fill", "#ffd166");
  const g = d3.select(svg).append("g").attr("class", "flow-layer");
  const sel = g.selectAll("line.flow-arrow").data(players, (d) => d.id).join("line")
    .attr("class", "flow-arrow")
    .attr("x1", (d) => d.x_from).attr("y1", (d) => d.y_from)
    .attr("x2", (d) => d.x_to).attr("y2", (d) => d.y_to)
    .attr("marker-end", "url(#arrow-head)")
    .attr("stroke-dasharray", (d) => {
      const len = Math.hypot(d.x_to - d.x_from, d.y_to - d.y_from);
      return len > 0 ? "0" : "0";
    });
  return { group: g, selection: sel };
}
