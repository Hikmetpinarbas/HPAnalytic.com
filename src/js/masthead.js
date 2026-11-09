/**
 * HP//Analytic Masthead State Machine — Hafta 2-3
 *
 * States: IDLE → SCROLLED → COMPACT
 * Features:
 *   - Sticky shrink (72px → 56px)
 *   - Context indicator (page type)
 *   - ⌘K / Ctrl+K keycap (platform-aware)
 *   - Index button (+ → × morph)
 */
import { gsap } from 'gsap';
import { ease, duration } from './motion-tokens.js';

const HEIGHTS = { full: 72, compact: 56 };
const SCROLL_THRESHOLD = 80;
const HIDE_THRESHOLD = 300;

const STATE = { IDLE: 'idle', SCROLLED: 'scrolled', COMPACT: 'compact', HIDDEN: 'hidden' };

const PAGE_CONTEXTS = {
  mac:      'Maç Dosyası',
  articles: 'Analiz',
  portraits:'Portre',
  lab:      'Data Lab',
  lig:      'Süper Lig',
  top5:     'Top 5',
  avrupa:   'Avrupa',
  kadinlar: 'Kadınlar',
};

function detectPlatform() {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  if (/Mac|iPhone|iPad|iPod/.test(platform) || /Macintosh/.test(ua)) return 'mac';
  return 'other';
}

function detectPageContext() {
  const path = window.location.pathname;
  for (const [key, label] of Object.entries(PAGE_CONTEXTS)) {
    if (path.includes(key)) return label;
  }
  if (path === '/' || path === '/index.html') return null;
  return null;
}

export function initMasthead() {
  const header = document.getElementById('header');
  if (!header) return;

  let currentState = STATE.IDLE;
  let lastY = 0;
  let scrollDir = 'up';
  let indexOpen = false;

  // --- Platform-aware keycap ---
  const kbdEl = header.querySelector('.cmd-btn kbd');
  if (kbdEl) {
    const isMac = detectPlatform() === 'mac';
    kbdEl.textContent = isMac ? '⌘K' : 'Ctrl K';
    kbdEl.setAttribute('aria-label', isMac ? 'Command + K' : 'Control + K');
  }

  // --- Context indicator ---
  const contextLabel = detectPageContext();
  let contextEl = null;
  if (contextLabel) {
    contextEl = document.createElement('span');
    contextEl.className = 'masthead-context';
    contextEl.textContent = contextLabel;
    const logo = header.querySelector('.logo');
    if (logo) logo.after(contextEl);
  }

  // --- Index button (+ → ×) ---
  const actions = header.querySelector('.nav-actions');
  let indexBtn = null;
  if (actions) {
    indexBtn = document.createElement('button');
    indexBtn.className = 'index-btn';
    indexBtn.setAttribute('aria-label', 'İçindekiler');
    indexBtn.innerHTML = '<span class="index-icon"></span>';
    actions.insertBefore(indexBtn, actions.firstChild);

    indexBtn.addEventListener('click', () => {
      indexOpen = !indexOpen;
      indexBtn.classList.toggle('is-open', indexOpen);
      indexBtn.setAttribute('aria-expanded', String(indexOpen));
      const icon = indexBtn.querySelector('.index-icon');
      if (icon) {
        gsap.to(icon, {
          rotation: indexOpen ? 45 : 0,
          duration: duration.ui,
          ease: ease.structural,
        });
      }
      document.dispatchEvent(new CustomEvent('masthead:index', { detail: { open: indexOpen } }));
    });
  }

  // --- State machine tick ---
  function transition(next) {
    if (next === currentState) return;
    const prev = currentState;
    currentState = next;
    header.dataset.mastheadState = next;

    switch (next) {
      case STATE.IDLE:
        gsap.to(header, {
          height: HEIGHTS.full,
          y: 0,
          duration: duration.ui,
          ease: ease.structural,
        });
        header.classList.remove('is-scrolled', 'is-compact');
        if (contextEl) gsap.to(contextEl, { opacity: 0, duration: duration.micro, ease: ease.exit });
        break;

      case STATE.SCROLLED:
        gsap.to(header, {
          height: HEIGHTS.full,
          y: 0,
          duration: duration.ui,
          ease: ease.structural,
        });
        header.classList.add('is-scrolled');
        header.classList.remove('is-compact');
        if (contextEl) gsap.to(contextEl, { opacity: 0, duration: duration.micro, ease: ease.exit });
        break;

      case STATE.COMPACT:
        gsap.to(header, {
          height: HEIGHTS.compact,
          y: 0,
          duration: duration.ui,
          ease: ease.structural,
        });
        header.classList.add('is-scrolled', 'is-compact');
        if (contextEl) gsap.to(contextEl, { opacity: 1, duration: duration.ui, ease: ease.editorial });
        break;

      case STATE.HIDDEN:
        gsap.to(header, {
          y: -HEIGHTS.compact,
          duration: duration.ui,
          ease: ease.exit,
        });
        break;
    }
  }

  function onScroll() {
    const y = window.scrollY;
    scrollDir = y > lastY ? 'down' : 'up';

    if (y <= 10) {
      transition(STATE.IDLE);
    } else if (y <= SCROLL_THRESHOLD) {
      transition(STATE.SCROLLED);
    } else if (scrollDir === 'down' && y > HIDE_THRESHOLD) {
      transition(STATE.HIDDEN);
    } else if (scrollDir === 'up') {
      transition(STATE.COMPACT);
    }

    lastY = y;
  }

  // Throttle via rAF
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  // Initial state
  header.style.height = HEIGHTS.full + 'px';
  header.dataset.mastheadState = STATE.IDLE;
  onScroll();
}
