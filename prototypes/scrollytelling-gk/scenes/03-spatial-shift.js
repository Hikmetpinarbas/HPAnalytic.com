// scenes/03-spatial-shift.js — Akt 3: oyuncular x_from/y_from → x_to/y_to.
// Sadece transform: translate (GSAP x/y). Layout thrash yok. real_trajectory=false rozeti HTML'de.

export function buildSpatialShift(tl, playersSel, players) {
  tl.to(playersSel.nodes(), {
    x: (i) => (players[i].x_to - players[i].x),
    y: (i) => (players[i].y_to - players[i].y),
    duration: 0.8,
    ease: "power2.inOut",
    stagger: 0.05,
  }, 0);
  return tl;
}
