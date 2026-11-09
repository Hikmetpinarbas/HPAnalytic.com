// viz/pitch.js — D3 ile SVG saha: orta çizgi, ceza sahası, kale. Animasyon yok (Aşama 2).
// d3 UMD globali index.html'de ../../node_modules/d3/dist/d3.min.js üzerinden yüklenir.

export function renderPitch(svg, { width = 105, height = 68 } = {}) {
  const d3 = globalThis.d3;
  if (!d3) throw new Error("d3 global missing — d3.min.js yuklenmedi");
  const layer = d3.select(svg).append("g").attr("class", "pitch-layer");
  // saha dış sınırı
  layer.append("rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height)
    .attr("class", "pitch-line");
  // orta çizgi + orta nokta + çember
  layer.append("line").attr("class", "pitch-line")
    .attr("x1", width / 2).attr("y1", 0).attr("x2", width / 2).attr("y2", height);
  layer.append("circle").attr("class", "pitch-line")
    .attr("cx", width / 2).attr("cy", height / 2).attr("r", 9.15);
  layer.append("circle").attr("fill", "rgba(255,255,255,.9)").attr("r", 0.6)
    .attr("cx", width / 2).attr("cy", height / 2);
  // ceza sahası (16.5m) + kale sahası (5.5m + 11m)
  const penW = 16.5, penH = 40.32, sixW = 5.5, sixH = 18.32, penR = 11;
  // sol
  layer.append("rect").attr("class", "pitch-line").attr("x", 0).attr("y", (height - penH) / 2).attr("width", penW).attr("height", penH);
  layer.append("rect").attr("class", "pitch-line").attr("x", 0).attr("y", (height - sixH) / 2).attr("width", sixW).attr("height", sixH);
  layer.append("path").attr("class", "pitch-line")
    .attr("d", `M ${penW},${height / 2 - 6} A ${penR},${penR} 0 0 0 ${penW},${height / 2 + 6}`);
  // sağ
  layer.append("rect").attr("class", "pitch-line").attr("x", width - penW).attr("y", (height - penH) / 2).attr("width", penW).attr("height", penH);
  layer.append("rect").attr("class", "pitch-line").attr("x", width - sixW).attr("y", (height - sixH) / 2).attr("width", sixW).attr("height", sixH);
  layer.append("path").attr("class", "pitch-line")
    .attr("d", `M ${width - penW},${height / 2 - 6} A ${penR},${penR} 0 0 1 ${width - penW},${height / 2 + 6}`);
  // kaleler (demo: küçük çizgiler)
  layer.append("line").attr("class", "pitch-goal").attr("x1", -2).attr("x2", -2)
    .attr("y1", height / 2 - 3.66).attr("y2", height / 2 + 3.66);
  layer.append("line").attr("class", "pitch-goal").attr("x1", width + 2).attr("x2", width + 2)
    .attr("y1", height / 2 - 3.66).attr("y2", height / 2 + 3.66);
  return layer;
}
