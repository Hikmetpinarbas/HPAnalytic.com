// main.js — init/start/pause/resume/destroy sözleşmesi (Aşama 6).
// Aşama 1: console.log("shell ok") korundu.

import { renderPitch } from "./viz/pitch.js";
import { renderPlayers, playersById } from "./viz/player-dots.js";
import { renderPassLinks } from "./viz/pass-links.js";
import { renderFlowArrows } from "./viz/flow-arrows.js";
import { createScrollBridge } from "./motion/scroll-bridge.js";
import { createMasterTimeline } from "./motion/timeline.js";
import { buildFormation } from "./scenes/01-formation.js";
import { buildPassNetwork } from "./scenes/02-pass-network.js";
import { buildSpatialShift } from "./scenes/03-spatial-shift.js";
import { isReducedMotion, shouldAnimate, onReducedMotionChange, applyStaticState } from "./motion/motion-guard.js";
import { gsap } from "gsap";

console.log("shell ok");

let bridge = null;
let timeline = null;
let svgEl = null;
let data = null;
let playersSel = null;
let linksSel = null;
let rafActive = false;
let destroyed = false;

async function loadData() {
  const res = await fetch("./data/sample-formation.json");
  return res.json();
}

function isMobile() {
  return window.innerWidth <= 768;
}

export async function init() {
  destroyed = false;
  data = await loadData();
  svgEl = document.getElementById("pitch");
  if (!svgEl) throw new Error("#pitch bulunamadı");
  svgEl.setAttribute("viewBox", "-3 -3 111 74");
  const W = 105, H = 68;
  renderPitch(svgEl, { width: W, height: H });
  renderFlowArrows(svgEl, data.players);
  const byId = playersById(data.players);
  const g = renderPlayers(svgEl, data.players);
  playersSel = g.selectAll("g.player-dot");
  const tooltipEl = document.getElementById("tooltip");
  const maxLinks = isMobile() ? 15 : Infinity;
  const res = renderPassLinks(svgEl, data.pass_network, byId, { maxLinks, tooltipEl });
  linksSel = res.selection;

  // rozetler: real_sequence/real_trajectory false → rozet göster
  document.getElementById("badge-flow")?.toggleAttribute("hidden", data.real_sequence !== false);
  document.getElementById("badge-move")?.toggleAttribute("hidden", data.real_trajectory !== false);
  const flowNote = document.getElementById("flow-note");
  if (flowNote) {
    flowNote.textContent = isMobile()
      ? `Temsili akış — en güçlü ${res.shown.length} bağlantı (mobil bütçe)`
      : "Temsili akış";
  }
  const moveNote = document.getElementById("move-note");
  if (moveNote) moveNote.textContent = "Temsili hareket";

  if (!shouldAnimate()) {
    applyStaticState(playersSel, linksSel, data.players);
    return;
  }

  bridge = createScrollBridge();
  const { ScrollTrigger } = bridge;

  timeline = createMasterTimeline([
    (tl) => buildFormation(tl, playersSel, data.players),
    (tl) => buildPassNetwork(tl, linksSel),
    (tl) => buildSpatialShift(tl, playersSel, data.players),
  ]);
  timeline.timeScale(1);

  // Act bazlı scrub: her adım kendi ScrollTrigger'ına bağlı, master tek timeline
  ScrollTrigger.create({
    trigger: "#step-1", start: "top 70%", end: "bottom 30%", scrub: 0.5,
    animation: gsap.timeline({ paused: true }).add(timeline, 0.0),
    onEnterBack: () => ScrollTrigger.refresh(),
  });

  start();
  onReducedMotionChange((reduced) => {
    if (reduced) { timeline?.pause(1); applyStaticState(playersSel, linksSel, data.players); }
    else { timeline?.play(); ScrollTrigger.refresh(); }
  });
}

export function start() {
  if (destroyed) return;
  bridge?.lenis?.start?.();
  timeline?.play();
  rafActive = true;
}
export function pause() {
  bridge?.lenis?.stop?.();
  timeline?.pause();
  rafActive = false;
}
export function resume() { start(); }

export function destroy() {
  if (destroyed) return;
  destroyed = true;
  try {
    timeline?.kill();
    bridge?.destroy();
    gsap.globalTimeline?.clear?.();
  } finally {
    timeline = null; bridge = null;
    if (svgEl) svgEl.innerHTML = "";
    playersSel = null; linksSel = null; rafActive = false;
  }
}

// dışa dönük test kancaları (Gemini ölçümü için)
window.__SCROLLY__ = { init, start, pause, resume, destroy, get rafActive() { return rafActive; } };

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => init().catch((e) => console.error(e)));
} else {
  init().catch((e) => console.error(e));
}
