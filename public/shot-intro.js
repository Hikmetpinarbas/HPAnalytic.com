(function() {
  if (window.__shotIntroLoaded) return;
  window.__shotIntroLoaded = true;

  // Eski preloader'ı gizle
  const s = document.createElement('style');
  s.textContent = '#preloader{display:none!important}';
  document.head.appendChild(s);

  const overlay = document.createElement('div');
  overlay.id = 'shot-intro';
  overlay.innerHTML = `
    <div class="si-ball"></div>
    <div class="si-flash"></div>
    <svg class="si-crack" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#B4FF39" stop-opacity="0.85"/>
          <stop offset="40%" stop-color="#B4FF39" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#B4FF39" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="500" cy="500" r="180" fill="url(#cg)" opacity="0.6"/>
      <g stroke="#B4FF39" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.95">
        <line x1="500" y1="500" x2="500" y2="0"/>
        <line x1="500" y1="500" x2="500" y2="1000"/>
        <line x1="500" y1="500" x2="0" y2="500"/>
        <line x1="500" y1="500" x2="1000" y2="500"/>
        <line x1="500" y1="500" x2="140" y2="140"/>
        <line x1="500" y1="500" x2="860" y2="140"/>
        <line x1="500" y1="500" x2="140" y2="860"/>
        <line x1="500" y1="500" x2="860" y2="860"/>
        <line x1="500" y1="500" x2="230" y2="30"/>
        <line x1="500" y1="500" x2="770" y2="30"/>
        <line x1="500" y1="500" x2="30" y2="230"/>
        <line x1="500" y1="500" x2="970" y2="230"/>
        <line x1="500" y1="500" x2="30" y2="770"/>
        <line x1="500" y1="500" x2="970" y2="770"/>
        <line x1="500" y1="500" x2="230" y2="970"/>
        <line x1="500" y1="500" x2="770" y2="970"/>
      </g>
      <g stroke="#FF6B35" stroke-width="1.5" fill="none" opacity="0.85">
        <line x1="500" y1="500" x2="350" y2="200"/>
        <line x1="500" y1="500" x2="650" y2="200"/>
        <line x1="500" y1="500" x2="350" y2="800"/>
        <line x1="500" y1="500" x2="650" y2="800"/>
        <line x1="500" y1="500" x2="200" y2="400"/>
        <line x1="500" y1="500" x2="800" y2="400"/>
        <line x1="500" y1="500" x2="200" y2="600"/>
        <line x1="500" y1="500" x2="800" y2="600"/>
      </g>
      <g stroke="#F4F2EC" stroke-width="1" fill="none" opacity="0.55">
        <circle cx="500" cy="500" r="60"/>
        <circle cx="500" cy="500" r="120"/>
        <circle cx="500" cy="500" r="200"/>
        <circle cx="500" cy="500" r="300"/>
        <circle cx="500" cy="500" r="420"/>
      </g>
    </svg>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  void overlay.offsetWidth;
  requestAnimationFrame(() => overlay.classList.add('si-go'));

  setTimeout(() => {
    overlay.remove();
    document.body.style.overflow = '';
  }, 1200);
})();
