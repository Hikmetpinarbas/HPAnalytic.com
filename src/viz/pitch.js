import { gsap } from 'gsap';
// HPAnalytic — İzometrik Taktik Saha
const PITCH_SVG = `
<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg"
     class="hp-pitch" role="img" aria-label="İzometrik taktik saha">
  <defs>
    <radialGradient id="pitchAura" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#B4FF39" stop-opacity="0.09"/>
      <stop offset="55%" stop-color="#B4FF39" stop-opacity="0.02"/>
      <stop offset="100%" stop-color="#B4FF39" stop-opacity="0"/>
    </radialGradient>
    <pattern id="tacticalZones" width="21" height="22.67" patternUnits="userSpaceOnUse">
      <path d="M21 0V22.67M0 22.67H21" stroke="#B4FF39" stroke-width="0.15" stroke-opacity="0.4" fill="none"/>
    </pattern>
    <filter id="pitchGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.1" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="400" cy="230" rx="380" ry="200" fill="url(#pitchAura)"/>
  <g transform="matrix(2.8, 1.6, -2.8, 1.6, 400, 80)">
    <rect x="0" y="0" width="105" height="68" fill="url(#tacticalZones)"/>
    <g id="pitch-lines" fill="none" stroke="#B4FF39" stroke-width="0.35"
       stroke-opacity="0.95" stroke-linecap="round" stroke-linejoin="round"
       filter="url(#pitchGlow)">
      <rect class="pitch-el" x="0" y="0" width="105" height="68"/>
      <line class="pitch-el" x1="52.5" y1="0" x2="52.5" y2="68"/>
      <circle class="pitch-el" cx="52.5" cy="34" r="9.15"/>
      <circle cx="52.5" cy="34" r="0.6" fill="#B4FF39" stroke="none"/>
      <rect class="pitch-el" x="0" y="13.84" width="16.5" height="40.32"/>
      <rect class="pitch-el" x="0" y="24.84" width="5.5" height="18.32"/>
      <circle cx="11" cy="34" r="0.4" fill="#B4FF39" stroke="none"/>
      <path class="pitch-el" d="M16.5 26.69 A9.15 9.15 0 0 1 16.5 41.31"/>
      <rect class="pitch-el" x="88.5" y="13.84" width="16.5" height="40.32"/>
      <rect class="pitch-el" x="99.5" y="24.84" width="5.5" height="18.32"/>
      <circle cx="94" cy="34" r="0.4" fill="#B4FF39" stroke="none"/>
      <path class="pitch-el" d="M88.5 26.69 A9.15 9.15 0 0 0 88.5 41.31"/>
    </g>
  </g>
  <g id="pitch-heatmap" style="mix-blend-mode:screen;"></g>
</svg>`;

export function renderPitch(container) {
  container.innerHTML = PITCH_SVG;
  const pitch = container.querySelector('.hp-pitch');
  if (!pitch) return;

  // GSAP: Saha çizgilerini çizerek getir
  const els = pitch.querySelectorAll('.pitch-el');
  els.forEach(el => {
    try {
      const len = el.getTotalLength ? el.getTotalLength() : 200;
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
    } catch(e) {}
  });

  gsap.to(els, {
    strokeDashoffset: 0,
    duration: 1.2,
    stagger: 0.05,
    ease: 'power2.inOut',
  });

  // Etkileşim: fare üzerindeyken hafif paralaks
  pitch.addEventListener('mousemove', (e) => {
    const rect = pitch.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(pitch, { rotateY: x * 4, rotateX: -y * 4, duration: 0.6, ease: 'power2.out' });
  });
  pitch.addEventListener('mouseleave', () => {
    gsap.to(pitch, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power2.out' });
  });
  pitch.style.transformStyle = 'preserve-3d';
  pitch.style.perspective = '1200px';
  pitch.style.willChange = 'transform';

  return pitch;
}
