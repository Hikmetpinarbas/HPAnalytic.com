// motion/timeline.js — master timeline (Aşama 3). Paused başlar; ScrollTrigger scrub ile sürülür.

import { gsap } from "gsap";

export function createMasterTimeline(builders = []) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
  for (const b of builders) {
    if (typeof b === "function") b(tl);
  }
  return tl;
}
