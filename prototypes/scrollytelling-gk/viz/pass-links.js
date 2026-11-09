// viz/pass-links.js — SVG pas çizgileri. Aşama 4.
// Klavye: Tab ile çizgiler arasında gezinme, Enter ile tooltip.
// Mobil bütçe: en güçlü 15 bağlantı (maxLinks). Metin "en güçlü 15 bağlantı" der.

export function topLinks(links, maxLinks = Infinity) {
  return [...links].sort((a, b) => b.value - a.value).slice(0, maxLinks);
}

export function renderPassLinks(svg, links, byId, { maxLinks = Infinity, tooltipEl = null } = {}) {
  const d3 = globalThis.d3;
  if (!d3) throw new Error("d3 global missing");
  const shown = topLinks(links, maxLinks);
  const g = d3.select(svg).append("g").attr("class", "passlinks-layer");
  const sel = g.selectAll("line.pass-link").data(shown, (d) => `${d.from}-${d.to}`).join("line")
    .attr("class", "pass-link")
    .attr("x1", (d) => byId[d.from].x).attr("y1", (d) => byId[d.from].y)
    .attr("x2", (d) => byId[d.to].x).attr("y2", (d) => byId[d.to].y)
    .attr("stroke-width", (d) => 0.5 + (d.value / 100) * 1.6)
    .attr("opacity", (d) => 0.35 + (d.value / 100) * 0.6)
    .attr("tabindex", "0")
    .attr("role", "button")
    .attr("aria-label", (d) => `${byId[d.from].name} → ${byId[d.to].name}, güç ${d.value}`)
    .attr("data-from", (d) => d.from).attr("data-to", (d) => d.to);

  // tooltip (Enter / click / focus)
  function showTip(d, el) {
    if (!tooltipEl) return;
    tooltipEl.hidden = false;
    tooltipEl.textContent = `${byId[d.from].name} → ${byId[d.to].name} (güç ${d.value})`;
    const box = el.closest(".viz-box");
    if (box) {
      const boxRect = box.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      tooltipEl.style.left = `${r.left - boxRect.left + 8}px`;
      tooltipEl.style.top = `${r.top - boxRect.top + 8}px`;
    } else {
      tooltipEl.style.left = "12px"; tooltipEl.style.top = "12px";
    }
  }
  function hideTip() { if (tooltipEl) tooltipEl.hidden = true; }
  sel.on("keydown", (event, d) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); showTip(d, event.currentTarget); }
    if (event.key === "Escape") hideTip();
  }).on("click", (event, d) => showTip(d, event.currentTarget))
    .on("mouseenter", (event, d) => showTip(d, event.currentTarget))
    .on("mouseleave", () => hideTip())
    .on("focus", (event, d) => showTip(d, event.currentTarget))
    .on("blur", () => hideTip());
  return { group: g, selection: sel, shown };
}
