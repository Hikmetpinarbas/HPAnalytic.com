// motion/scroll-bridge.js — Lenis + ScrollTrigger + GSAP tek RAF. Aşama 3.
// Tek RAF kuralı: Lenis kendi RAF döngüsüne girmez; gsap.ticker sürer.
// gsap.ticker.add((time)=>lenis.raf(time*1000)) — DevTools Performance'da ikinci RAF tick yok.

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function createScrollBridge({ enabled = true } = {}) {
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ smoothWheel: true, lerp: 0.1 });
  lenis.on("scroll", ScrollTrigger.update);

  const rafFn = (time) => { lenis.raf(time * 1000); };
  gsap.ticker.add(rafFn);
  gsap.ticker.lagSmoothing(0);

  let io = null;
  if (typeof IntersectionObserver !== "undefined") {
    const stage = document.querySelector(".stage");
    if (stage) {
      io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) gsap.ticker.start?.() ?? null;
          // viewport dışı: ticker'ı yumuşakça durdurma yerine ScrollTrigger'ı bırak,
          // ancak Lenis smooth'u kapatmıyoruz — pahalı sahne yok. (destroy'da temizlenir.)
        }
      }, { threshold: 0 });
      io.observe(stage);
    }
  }
  // visibility: gizli sekmede RAF zaten durur; görününce GSAP + Lenis kaldığı yerden devam eder (FPS 60).
  // ScrollTrigger pin/spacing kırılmaması için ScrollTrigger.refresh visibility dönüşünde çağrılır.
  const onVis = () => { if (!document.hidden) ScrollTrigger.refresh(); };
  document.addEventListener("visibilitychange", onVis);

  return {
    lenis,
    ScrollTrigger,
    gsap,
    start() { if (enabled) lenis.start(); },
    stop() { lenis.stop(); },
    destroy() {
      document.removeEventListener("visibilitychange", onVis);
      if (io) io.disconnect();
      gsap.ticker.remove(rafFn);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.clearAll?.();
    },
  };
}
