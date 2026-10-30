import { initPassNet } from '../charts/passnet.js';
import { initShotMap } from '../charts/shotmap.js';
import { initRadar } from '../charts/radar.js';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initPalette, initSectionIndicator, initScrollProgress } from './palette.js';

gsap.registerPlugin(ScrollTrigger);

async function runPreloader() {
  const pre = document.getElementById('preloader');
  if (!pre) return;
  return new Promise(resolve => {
    const tl = gsap.timeline({ onComplete: () => { pre.style.display='none'; resolve(); } });
    pre.querySelectorAll('.pre-pitch path, .pre-pitch rect, .pre-pitch line, .pre-pitch circle').forEach(el => {
      const len = el.getTotalLength ? el.getTotalLength() : 200;
      el.style.strokeDasharray = len; el.style.strokeDashoffset = len;
      tl.to(el, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, 0);
    });
    tl.to('.pre-letter', { y: 0, opacity: 1, duration: 0.5, stagger: 0.02, ease: 'expo.out' }, 0.15);
    const counter = pre.querySelector('.pre-count');
    const obj = { v: 0 };
    tl.to(obj, { v: 100, duration: 1.0, ease: 'power2.inOut', onUpdate: () => { if (counter) counter.textContent = Math.round(obj.v) + '%'; } }, 0.1);
    tl.to(pre, { opacity: 0, duration: 0.4, ease: 'power2.in' }, '+=0.1');
  });
}

await runPreloader();

const lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, smoothTouch: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const header = document.getElementById('header');
let lastScroll = 0;
ScrollTrigger.create({
  start: 'top -100', end: 99999,
  onUpdate: () => {
    const s = window.scrollY;
    if (s > lastScroll && s > 200) header.style.transform = 'translateY(-100%)';
    else header.style.transform = 'translateY(0)';
    lastScroll = s;
    header.classList.toggle('is-scrolled', s > 60);
  }
});

const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
if (window.matchMedia('(hover:hover)').matches && dot && ring) {
  let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  const tick = () => {
    rx += (mx-rx)*0.15; ry += (my-ry)*0.15;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(tick);
  };
  tick();
  document.querySelectorAll('a, button, .carousel-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('on-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('on-hover'));
  });
  document.querySelectorAll('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.dataset.cursor = el.dataset.cursor);
    el.addEventListener('mouseleave', () => document.body.dataset.cursor = '');
  });
}

const heroTl = gsap.timeline({ defaults: { ease: 'expo.out' } });
heroTl.from('.logo, .status, .nav a', { y: -20, opacity: 0, duration: 0.8, stagger: 0.04 }, 0.1);
heroTl.from('.hero-kicker', { y: 20, opacity: 0, duration: 0.8 }, 0.2);
heroTl.to('.hero h1 .word', { y: 0, duration: 1.2, stagger: 0.12 }, 0.3);
heroTl.to('.hero-lede', { opacity: 1, y: 0, duration: 0.8 }, 0.9);
heroTl.to('.hero-meta', { opacity: 1, duration: 0.8 }, 1.1);

gsap.utils.toArray('.section, .glossary-group, .carousel-card').forEach(el => {
  gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 88%' }, y: 30, opacity: 0, duration: 1, ease: 'power3.out' });
});

document.querySelectorAll('.filter-group').forEach(group => {
  const ind = group.querySelector('.filter-indicator');
  const btns = group.querySelectorAll('.filter-btn');
  if (!ind || !btns.length) return;
  const update = (btn, animate = true) => {
    const gr = group.getBoundingClientRect(), br = btn.getBoundingClientRect();
    const opts = { x: br.left - gr.left, width: br.width, duration: animate ? 0.5 : 0, ease: 'expo.out' };
    if (animate) gsap.to(ind, opts); else gsap.set(ind, opts);
  };
  const active = group.querySelector('.filter-btn.active') || btns[0];
  requestAnimationFrame(() => { ind.style.opacity = '1'; update(active, false); });
  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); update(btn);
  }));
  window.addEventListener('resize', () => update(group.querySelector('.filter-btn.active') || btns[0], false));
});

document.querySelectorAll('.carousel').forEach(c => {
  let down = false, sx = 0, ss = 0, moved = 0;
  c.addEventListener('pointerdown', e => {
    if (e.target.closest('a, button')) return;
    down = true; moved = 0; sx = e.clientX; ss = c.scrollLeft; c.style.cursor = 'grabbing';
  });
  c.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; moved = Math.abs(dx); c.scrollLeft = ss - dx * 1.2; });
  const end = () => { down = false; c.style.cursor = 'grab'; };
  c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end); c.addEventListener('pointerleave', end);
  c.addEventListener('click', e => { if (moved > 6) e.preventDefault(); }, true);
});

const journalData = [
  { tag: 'Mekanizma · 22.10.2026', title: 'Beşiktaş 2–2 Palace: Skoru ceza sahası önündeki <em>son 15 metre</em> belirledi.', meta: '70 hücum · 4 şut · 2 gol', badge: '🟢 Doğrulanmış', cls: '' },
  { tag: 'Mekanizma · 24.10.2026', title: 'Lille 2–4 Galatasaray: Farklı gol yolları, sürdürülebilir <em>davranış</em>.', meta: '4 gol · 3 farklı yol', badge: '🟢 Doğrulanmış', cls: 'is-orange' },
  { tag: 'Analiz · 20.10.2026', title: 'Fenerbahçe 2–2 Slavia: Rakip yanıtı, ilk planın değerini nasıl değiştirdi?', meta: 'Adaptation · Karşı kanıt', badge: '🟡 Proxy', cls: '' },
  { tag: 'Manifesto · 19.10.2026', title: 'Tracking aramayın: On-ball veri düşündüğünüzden <em>fazlasını</em> anlatır.', meta: 'Claim ceiling · Karar değeri', badge: '🟢 Doğrulanmış', cls: 'is-orange' },
  { tag: 'Hipotez · 18.10.2026', title: 'Yüksek hat, düşük risk: modern presin anatomisi — <em>test edilecek</em> çerçeve.', meta: 'Yanlışsam ne görmeliyim?', badge: '🔴 Hipotez', cls: '' },
];
const carousel = document.getElementById('journal-carousel');
if (carousel) {
  carousel.innerHTML = journalData.map(d => `
    <article class="carousel-card ${d.cls}">
      <span class="tag">${d.tag}</span>
      <h3>${d.title}</h3>
      <div class="meta"><span>${d.meta}</span><span class="badge ${d.cls ? 'proxy' : ''}">${d.badge}</span></div>
    </article>
  `).join('');
}

const clock = document.getElementById('footer-clock');
if (clock) {
  const tick = () => { clock.textContent = new Date().toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }); };
  tick(); setInterval(tick, 60000);
}

initPalette();
initSectionIndicator();
initScrollProgress();

ScrollTrigger.create({
  trigger: '#radar-container',
  start: 'top 90%',
  once: true,
  onEnter: () => initRadar('radar-container'),
});

ScrollTrigger.create({
  trigger: '#shotmap-container',
  start: 'top 90%',
  once: true,
  onEnter: () => initShotMap('shotmap-container', 'shot-filters'),
});

ScrollTrigger.create({
  trigger: '#passnet-container',
  start: 'top 90%',
  once: true,
  onEnter: () => initPassNet('passnet-container', 'passnet-filters'),
});

console.log('✓ HP//Analytic v2.0 — 3 GRAFİK HAZIR');

document.querySelectorAll('.lab-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.lab-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.lab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const t = document.getElementById(tab.dataset.target);
    if (t) t.classList.add('active');
  });
});
