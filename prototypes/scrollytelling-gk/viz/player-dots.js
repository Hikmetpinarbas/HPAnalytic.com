// viz/player-dots.js — 11 oyuncu noktası, data/sample-formation.json'dan. Statik duruş (Aşama 2).
// Erişilebilirlik: merkezi oyuncular hem renk (turuncu) hem kenarlık (beyaz kalın) hem etikette "★" ile ayrışır.

export function renderPlayers(svg, players, { r = 3.2 } = {}) {
  const d3 = globalThis.d3;
  if (!d3) throw new Error("d3 global missing");
  const g = d3.select(svg).append("g").attr("class", "players-layer");
  const sel = g.selectAll("g.player-dot").data(players, (d) => d.id).join("g")
    .attr("class", (d) => (d.central ? "player-dot central" : "player-dot"))
    .attr("data-id", (d) => d.id)
    .attr("tabindex", "0")
    .attr("role", "button")
    .attr("aria-label", (d) => (d.central ? `${d.name} — merkezi oyuncu` : d.name))
    .attr("transform", (d) => `translate(${d.x},${d.y})`);
  sel.append("circle").attr("class", "core").attr("r", r);
  sel.append("text").attr("text-anchor", "middle").attr("dy", 1).text((d) => (d.central ? `${d.name}★` : d.name));
  return g;
}

export function playersById(players) {
  return Object.fromEntries(players.map((p) => [p.id, p]));
}
