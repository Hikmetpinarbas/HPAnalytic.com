// HPAnalytic — Event / Pres Animasyonu
import { gsap } from 'gsap';
import { DNA } from './theme.js';

export function renderEventAnimation(container) {
  const uid = 'anim-' + Math.random().toString(36).substr(2, 6);
  
  container.innerHTML = `
    <div class="hp-event-anim" style="background:${DNA.panel}; border:1px solid ${DNA.grid}; max-width:800px; margin:0 auto; border-radius:4px; overflow:hidden;">
      <svg viewBox="0 0 800 400" width="100%" height="100%">
        <!-- Saha Çizgileri -->
        <rect x="20" y="20" width="760" height="360" fill="none" stroke="${DNA.grid}" stroke-width="2"/>
        <line x1="400" y1="20" x2="400" y2="380" stroke="${DNA.grid}" stroke-width="2"/>
        <circle cx="400" cy="200" r="60" fill="none" stroke="${DNA.grid}" stroke-width="2"/>
        
        <!-- Pas Çizgisi -->
        <path id="${uid}-line" d="M 120 200 L 320 160 L 520 240 L 680 200" fill="none" stroke="${DNA.neon}" stroke-width="2" stroke-dasharray="6 6" opacity="0"/>
        
        <!-- Pres Efekti (Halka) -->
        <circle id="${uid}-ring" cx="320" cy="160" r="0" fill="none" stroke="${DNA.orange}" stroke-width="2" opacity="0"/>
        
        <!-- Top -->
        <circle id="${uid}-ball" cx="120" cy="200" r="6" fill="${DNA.ink}"/>
      </svg>
    </div>
  `;

  const ball = container.querySelector(`#${uid}-ball`);
  const ring = container.querySelector(`#${uid}-ring`);
  const line = container.querySelector(`#${uid}-line`);

  // GSAP Zaman Çizelgesi (Sonsuz Döngü)
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });

  // 1. Top pas atıyor (çizgi beliriyor)
  tl.to(line, { opacity: 1, duration: 0.2 })
    // 2. Top 1. noktaya gidiyor
    .to(ball, { attr: { cx: 320, cy: 160 }, duration: 0.8, ease: "power2.inOut" }, "<")
    // 3. Yüksek pres anı (Halka patlıyor)
    .to(ring, { opacity: 1, attr: { r: 30 }, duration: 0.4, ease: "power2.out" })
    .to(ring, { opacity: 0, attr: { r: 0 }, duration: 0.2 }, "-=0.1")
    // 4. Top renk değiştiriyor (Kazanım)
    .to(ball, { fill: DNA.neon, duration: 0.1 })
    // 5. Top hücum koridorunda ilerliyor
    .to(ball, { attr: { cx: 520, cy: 240 }, duration: 0.6, ease: "power2.inOut" })
    .to(ball, { attr: { cx: 680, cy: 200 }, duration: 0.6, ease: "power2.inOut" })
    // 6. Sıfırlama
    .to([ball, line], { opacity: 0, duration: 0.3 })
    .set(ball, { attr: { cx: 120, cy: 200 }, fill: DNA.ink, opacity: 1 })
    .set(line, { opacity: 0 });
}
