import { gsap } from 'gsap';
import { ease, duration, getStagger } from './motion-tokens.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function showImmediately(elements) {
  elements.forEach(element => {
    element.style.opacity = '1';
    element.style.transform = 'none';
  });
}

function runLabIndexEntrance() {
  const hub = document.querySelector('.hub');
  if (!hub) return false;

  const stag = getStagger('medium');
  const kicker = hub.querySelector('.hub-kicker');
  const h1 = hub.querySelector('h1');
  const lede = hub.querySelector('.hub-lede');
  const gates = hub.querySelectorAll('.gate');
  const footer = hub.querySelector('.hub-footer');

  const hubEls = [kicker, h1, lede].filter(Boolean);
  gsap.set(hubEls, { autoAlpha: 0, y: 24 });
  gsap.set(gates, { autoAlpha: 0, y: 30, scale: 0.98 });
  if (footer) gsap.set(footer, { autoAlpha: 0 });

  const tl = gsap.timeline({ delay: 0.1 });

  hubEls.forEach((el, i) => {
    tl.to(el, {
      autoAlpha: 1, y: 0,
      duration: duration.reveal,
      ease: ease.editorial,
    }, i * stag.each * 5);
  });

  tl.to(gates, {
    autoAlpha: 1, y: 0, scale: 1,
    duration: duration.reveal,
    ease: ease.cinematic,
    stagger: stag,
  }, `-=${duration.reveal * 0.3}`);

  if (footer) {
    tl.to(footer, {
      autoAlpha: 1,
      duration: duration.ui,
      ease: ease.ui,
    }, '-=0.3');
  }

  return true;
}

function runLabSubpageEntrance() {
  const stag = getStagger('medium');
  const contentEls = document.querySelectorAll(
    '.article > h2, .article > h3, .article > p, ' +
    '.article > blockquote, .article > .gate-grid, .article > hr, ' +
    '.article > table, .article > .sec-num, ' +
    'header, .grid > .card, .stat'
  );

  if (!contentEls.length) return;

  gsap.set(contentEls, { autoAlpha: 0, y: 18 });

  let batch = [];
  let timer = null;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      batch.push(entry.target);
      clearTimeout(timer);
      timer = setTimeout(() => {
        gsap.to(batch.splice(0), {
          autoAlpha: 1, y: 0,
          duration: duration.reveal * 0.7,
          ease: ease.editorial,
          stagger: stag.each,
        });
      }, 60);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  contentEls.forEach(el => io.observe(el));
}

function initReveal() {
  const elements = Array.from(document.querySelectorAll('.reveal'));
  if (!elements.length) return;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    showImmediately(elements);
    return;
  }

  gsap.set(elements, { autoAlpha: 0, y: 18 });
  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      gsap.to(entry.target, {
        autoAlpha: 1,
        y: 0,
        ease: ease.editorial,
        duration: duration.reveal,
      });
      instance.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  elements.forEach(element => observer.observe(element));
}

function initHover() {
  const buttons = Array.from(document.querySelectorAll('button, [data-hover]'));
  const cards = Array.from(document.querySelectorAll('.card'));
  if (reduceMotion) {
    showImmediately([...buttons, ...cards]);
    return;
  }

  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, { scale: 1.03, ease: 'back.out(3)', duration: 0.3 });
    });
    button.addEventListener('mouseleave', () => {
      gsap.to(button, { scale: 1, ease: ease.ui, duration: 0.2 });
    });
  });

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { y: -3, ease: 'power2.out', duration: 0.4 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { y: 0, ease: ease.ui, duration: 0.3 });
    });
  });
}

if (!reduceMotion) {
  if (!runLabIndexEntrance()) {
    runLabSubpageEntrance();
  }
}
initHover();
initReveal();
