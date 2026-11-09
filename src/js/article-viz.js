import { gsap } from 'gsap';
import { ease, duration, getArticleConfig, getStagger } from './motion-tokens.js';
import { initPassNetwork } from './viz/pass-network.js';
import { initTacticalMap } from './viz/tactical-map.js';
import { initGKDistribution } from './viz/gk-distribution.js';
import { initXgTimeline } from './viz/xg-timeline.js';
import { initPitchLayersView } from './viz/pitch-layers-view.js';

const HP_COLORS = {
  primary: '#B4FF39',
  accent:  '#FF6B35',
};

const VIZ_REGISTRY = {
  'pass-network':    initPassNetwork,
  'tactical-map':    initTacticalMap,
  'gk-distribution': initGKDistribution,
  'xg-timeline':     initXgTimeline,
  'pitch-layers':    initPitchLayersView,
};

const articleType = document.body.dataset.articleType || 'default';
const articleConfig = getArticleConfig(articleType);
const articleStagger = getStagger(articleConfig.stagger);

function runArticleEntrance() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const revealEase = ease[articleConfig.revealEase] || ease.editorial;
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const heroTop = hero.querySelector('.hero-top');
  const heroH1 = hero.querySelector('h1');
  const heroLede = hero.querySelector('.lede');
  const toc = document.querySelector('.toc');
  const articleEl = document.querySelector('.article');
  const related = document.querySelector('.related');

  const heroEls = [heroTop, heroH1, heroLede].filter(Boolean);
  gsap.set(heroEls, { autoAlpha: 0, y: 24 });
  if (toc) gsap.set(toc, { autoAlpha: 0, x: -16 });

  const tl = gsap.timeline({ delay: 0.15 });

  heroEls.forEach((el, i) => {
    tl.to(el, {
      autoAlpha: 1, y: 0,
      duration: duration.reveal,
      ease: revealEase,
    }, i * articleStagger.each * 5);
  });

  if (toc) {
    tl.to(toc, {
      autoAlpha: 1, x: 0,
      duration: duration.reveal * 0.8,
      ease: ease.structural,
    }, `-=${duration.reveal * 0.4}`);
  }

  if (articleEl) {
    const contentEls = articleEl.querySelectorAll('h2, h3, p, blockquote, table, ul, ol, hr');
    gsap.set(contentEls, { autoAlpha: 0, y: 18 });

    let batch = [];
    let timer = null;
    const contentIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        contentIO.unobserve(entry.target);
        batch.push(entry.target);
        clearTimeout(timer);
        timer = setTimeout(() => {
          gsap.to(batch.splice(0), {
            autoAlpha: 1, y: 0,
            duration: duration.reveal * 0.7,
            ease: revealEase,
            stagger: articleStagger.each,
          });
        }, 60);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    contentEls.forEach(el => contentIO.observe(el));
  }

  if (related) {
    gsap.set(related, { autoAlpha: 0, y: 24 });
    const relIO = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      gsap.to(related, {
        autoAlpha: 1, y: 0,
        duration: duration.reveal,
        ease: revealEase,
      });
      relIO.disconnect();
    }, { threshold: 0.08 });
    relIO.observe(related);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  runArticleEntrance();

  const targets = document.querySelectorAll('[data-visual-body]');
  const maxLayers = articleConfig.maxConcurrentLayers;
  let activeLayers = 0;

  console.log(`✓ articleConfig: type=${articleType}, maxLayers=${maxLayers}, preloaderDuration=${articleConfig.preloaderDuration}, stagger=${articleConfig.stagger}`);

  targets.forEach((el, i) => {
    const type = el.dataset.visualBody;
    const renderer = VIZ_REGISTRY[type];
    el.classList.add('viz-loading');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (activeLayers >= maxLayers) return;
        observer.disconnect();
        activeLayers++;

        try {
          el.classList.remove('viz-loading');
          el.classList.add('viz-active');
          el.innerHTML = '';

          if (renderer) {
            renderer(el);
            gsap.fromTo(el,
              { opacity: 0, y: 24, scale: 0.985 },
              { opacity: 1, y: 0, scale: 1, duration: articleConfig.preloaderDuration * 0.4, ease: ease[articleConfig.revealEase] || ease.cinematic, delay: i * articleStagger.each }
            );
          } else {
            el.parentElement.style.display = 'none';
            activeLayers--;
          }
        } catch (err) {
          console.error('Viz Hatası:', type, err);
          el.innerHTML = `<div style="color:${HP_COLORS.accent};font-size:12px;">Görsel yüklenemedi: ${err.message}</div>`;
          activeLayers--;
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
  });
});
