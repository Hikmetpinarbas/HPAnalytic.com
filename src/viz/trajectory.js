// HPAnalytic — 3D GOL YÖRÜNGESİ (Bogachev esintili).
// WebGL yok. GSAP + SVG stroke-dash + CSS perspective.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function initTrajectory() {
  const stage = document.querySelector('[data-hp-trajectory]');
  if (!stage) return;
  const container = stage.querySelector('.hp-traj-stage');
  const paths = stage.querySelectorAll('path.hp-traj');
  if (!container || !paths.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  paths.forEach((p, i) => {
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
    gsap.to(p, {
      strokeDashoffset: 0,
      opacity: 1,
      duration: 1.6,
      delay: i * 0.35,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: stage, start: 'top 70%', once: true }
    });
  });

  if (reduce || !hasMouse) return;

  const rxTo = gsap.quickTo(container, 'rotationX', { duration: 0.9, ease: 'power3' });
  const ryTo = gsap.quickTo(container, 'rotationY', { duration: 0.9, ease: 'power3' });
  stage.addEventListener('mousemove', (e) => {
    const r = stage.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width/2)) / r.width;
    const dy = (e.clientY - (r.top + r.height/2)) / r.height;
    ryTo(dx * 12);
    rxTo(-dy * 10);
  });
  stage.addEventListener('mouseleave', () => { rxTo(0); ryTo(0); });
}
