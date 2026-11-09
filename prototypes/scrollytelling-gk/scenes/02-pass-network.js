// scenes/02-pass-network.js — Akt 2: pas çizgileri scroll ile sırayla oluşuyor.
// Sadece stroke-dashoffset animasyonu (layout değil). real_sequence=false rozeti HTML'de.

export function buildPassNetwork(tl, linksSel, labels = []) {
  const nodes = linksSel.nodes();
  nodes.forEach((node, i) => {
    const len = node.getTotalLength ? node.getTotalLength() : 100;
    node.style.strokeDasharray = String(len);
    node.style.strokeDashoffset = String(len);
  });
  tl.to(nodes, {
    strokeDashoffset: 0,
    duration: 0.5,
    ease: "power1.out",
    stagger: 0.12,
  }, 0);
  return tl;
}

export function strongLabel(count, isMobile) {
  if (!isMobile) return null;
  return `en güçlü ${count} bağlantı`;
}
