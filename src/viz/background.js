// HPAnalytic — Arka Plan Dokusu (DeepSeek üretimi)
const BG_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" class="hp-bg-svg" style="position:fixed;top:0;left:0;z-index:-1;pointer-events:none;">
  <defs>
    <pattern id="hpIsoGrid" width="64" height="36.95" patternUnits="userSpaceOnUse">
      <path d="M0 18.475 L32 0 L64 18.475 L32 36.95 Z" fill="none" stroke="#B4FF39" stroke-width="0.4"/>
    </pattern>
    <pattern id="hpDotGrid" width="24" height="13.856" patternUnits="userSpaceOnUse">
      <circle cx="0" cy="0" r="0.9" fill="#B4FF39"/>
      <circle cx="12" cy="6.928" r="0.9" fill="#B4FF39"/>
    </pattern>
    <pattern id="hpFlow" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
      <line x1="0" y1="10" x2="40" y2="10" stroke="#B4FF39" stroke-width="0.6" stroke-opacity="0.7"/>
      <line x1="55" y1="30" x2="80" y2="30" stroke="#FF6B35" stroke-width="0.6" stroke-opacity="0.5"/>
      <line x1="15" y1="50" x2="70" y2="50" stroke="#B4FF39" stroke-width="0.6" stroke-opacity="0.4"/>
      <line x1="0" y1="70" x2="35" y2="70" stroke="#B4FF39" stroke-width="0.6" stroke-opacity="0.5"/>
    </pattern>
    <radialGradient id="hpGlowGreen" cx="20%" cy="30%" r="45%">
      <stop offset="0%" stop-color="#B4FF39" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#B4FF39" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hpGlowOrange" cx="85%" cy="70%" r="40%">
      <stop offset="0%" stop-color="#FF6B35" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#FF6B35" stop-opacity="0"/>
    </radialGradient>
    <filter id="hpGrain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/>
      <feColorMatrix values="0 0 0 0 0.9  0 0 0 0 0.9  0 0 0 0 0.9  0 0 0 0.04 0"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="#0A0A0A"/>
  <rect class="hp-bg-grid" width="100%" height="100%" fill="url(#hpIsoGrid)" opacity="0.08"/>
  <rect class="hp-bg-dots" width="100%" height="100%" fill="url(#hpDotGrid)" opacity="0.12"/>
  <rect class="hp-bg-flow" width="100%" height="100%" fill="url(#hpFlow)" opacity="0.10"/>
  <rect width="100%" height="100%" fill="url(#hpGlowGreen)"/>
  <rect width="100%" height="100%" fill="url(#hpGlowOrange)"/>
  <rect width="100%" height="100%" filter="url(#hpGrain)"/>
</svg>`;

export function applyBackground() {
  if (document.getElementById('hp-bg-mount')) return;
  const mount = document.createElement('div');
  mount.id = 'hp-bg-mount';
  mount.innerHTML = BG_SVG;
  document.body.appendChild(mount);
}
