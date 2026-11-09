// motion/motion-guard.js — prefers-reduced-motion. Açıkken animasyon yok, statik + tam bilgi.

export function isReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function shouldAnimate() { return !isReducedMotion(); }

export function onReducedMotionChange(cb) {
  if (!window.matchMedia) return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handler = () => cb(isReducedMotion());
  mq.addEventListener ? mq.addEventListener("change", handler) : mq.addListener(handler);
  return () => { mq.removeEventListener ? mq.removeEventListener("change", handler) : mq.removeListener(handler); };
}

// reduced-motion'da final statik durumu uygula: oyuncular son konumda, çizgiler tam görünür
export function applyStaticState(playersSel, linksSel, players) {
  const d3 = globalThis.d3;
  if (d3 && playersSel) {
    playersSel.attr("transform", (d) => `translate(${d.x_to},${d.y_to})`);
  }
  if (linksSel) {
    // dash sıfırla — çizgiler tam çizili
    linksSel.attr("stroke-dashoffset", "0").attr("stroke-dasharray", "none");
  }
}
