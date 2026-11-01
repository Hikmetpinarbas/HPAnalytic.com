import { gsap } from 'gsap';
// HPAnalytic — Görsel Araçlar (Tooltip)
import { DNA } from './theme.js';

let tooltipEl;
let xTo, yTo;

export function initTooltip() {
  if (document.getElementById('hp-viz-tooltip')) return;
  
  tooltipEl = document.createElement('div');
  tooltipEl.id = 'hp-viz-tooltip';
  
  Object.assign(tooltipEl.style, {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 9999,
    background: DNA.panel,
    border: `1px solid ${DNA.neon}`,
    color: DNA.ink,
    fontFamily: DNA.font,
    fontSize: '12px',
    padding: '8px 12px',
    borderRadius: '4px',
    boxShadow: `0 4px 20px rgba(0,0,0,0.8), 0 0 10px ${DNA.neon}44`,
    opacity: 0,
    transform: 'translate(-50%, -120%)',
    transition: 'opacity 0.2s ease',
    whiteSpace: 'nowrap'
  });
  
  document.body.appendChild(tooltipEl);

  // GSAP quickTo ile fareyi gecikmesiz takip
  xTo = gsap.quickTo(tooltipEl, "left", { duration: 0.15, ease: "power2.out" });
  yTo = gsap.quickTo(tooltipEl, "top", { duration: 0.15, ease: "power2.out" });
}

export function showTooltip(html, e) {
  if (!tooltipEl) initTooltip();
  tooltipEl.innerHTML = html;
  tooltipEl.style.opacity = 1;
  moveTooltip(e);
}

export function moveTooltip(e) {
  if (!tooltipEl) return;
  xTo(e.clientX);
  yTo(e.clientY - 15);
}

export function hideTooltip() {
  if (tooltipEl) tooltipEl.style.opacity = 0;
}
