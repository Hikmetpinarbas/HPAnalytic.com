// scenes/01-formation.js — Akt 1: oyuncular sıralı yerleşiyor (stagger 60ms). Sadece transform.

export function buildFormation(tl, playersSel, players) {
  tl.fromTo(
    playersSel.nodes(),
    { x: (i, el) => { const d = players[i]; return (d.x_from - d.x); },
      y: (i, el) => { const d = players[i]; return (d.y_from - d.y); },
      opacity: 0 },
    { x: 0, y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.06 },
    0
  );
  return tl;
}
