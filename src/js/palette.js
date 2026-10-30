import { gsap } from 'gsap';

const COMMANDS = [
  { id: 'top',      label: 'Başlangıç',              hint: 'Hero',       icon: '↑', action: () => window.scrollTo({top:0,behavior:'smooth'}) },
  { id: 'onball',   label: 'On-Ball Manifesto',      hint: 'Bölüm 01',   icon: '⚡', action: () => go('onball') },
  { id: 'radar',    label: 'Radar Profilleri',       hint: 'Bölüm 02',   icon: '◇', action: () => go('radar') },
  { id: 'shotmap',  label: 'Şut Haritası',           hint: 'Bölüm 03',   icon: '◎', action: () => go('shotmap') },
  { id: 'passnet',  label: 'Pas Ağı',                hint: 'Bölüm 04',   icon: '◈', action: () => go('passnet') },
  { id: 'journal',  label: 'Mekanizma Günlüğü',      hint: 'Bölüm 05',   icon: '▤', action: () => go('journal') },
  { id: 'glossary', label: 'Sözlük',                 hint: 'Bölüm 06',   icon: '§', action: () => go('glossary') },
  { id: 'claim',    label: 'Claim Ceiling nedir?',   hint: 'Kavram',     icon: '⊤', action: () => go('glossary') },
  { id: 'counter',  label: 'Counter-Evidence nedir?',hint: 'Kavram',     icon: '⊘', action: () => go('glossary') },
  { id: 'phase',    label: 'Oyun Fazları',           hint: 'Kavram',     icon: '◐', action: () => go('glossary') },
];

function go(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function fuzzy(q, t) {
  q = q.toLowerCase(); t = t.toLowerCase();
  if (!q) return true;
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) if (t[i] === q[qi]) qi++;
  return qi === q.length;
}

export function initPalette() {
  const overlay = document.getElementById('cmd-overlay');
  const input   = document.getElementById('cmd-input');
  const list    = document.getElementById('cmd-list');
  const count   = document.getElementById('cmd-count');
  const openBtn = document.getElementById('cmd-open');
  if (!overlay || !input || !list) return;

  let items = [];
  let activeIdx = 0;

  function render(query = '') {
    items = COMMANDS.filter(c => fuzzy(query, c.label + ' ' + c.hint));
    activeIdx = 0;
    list.innerHTML = items.length
      ? items.map((c, i) => `
          <div class="cmd-item${i===0?' active':''}" data-idx="${i}">
            <span class="ci">${c.icon}</span>
            <span class="cn">${c.label}</span>
            <span class="ch">${c.hint}</span>
          </div>`).join('')
      : `<div class="cmd-empty">Sonuç yok</div>`;
    count.textContent = items.length + ' sonuç';
    bindItems();
  }

  function bindItems() {
    list.querySelectorAll('.cmd-item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        activeIdx = parseInt(el.dataset.idx);
        updateActive();
      });
      el.addEventListener('click', () => execute());
    });
  }

  function updateActive() {
    list.querySelectorAll('.cmd-item').forEach((el, i) => {
      el.classList.toggle('active', i === activeIdx);
    });
    const el = list.querySelector('.cmd-item.active');
    if (el) el.scrollIntoView({ block: 'nearest' });
  }

  function execute() {
    const c = items[activeIdx];
    if (!c) return;
    close();
    setTimeout(() => c.action(), 100);
  }

  function open() {
    overlay.classList.add('on');
    document.body.style.overflow = 'hidden';
    input.value = '';
    render('');
    setTimeout(() => input.focus(), 50);
  }

  function close() {
    overlay.classList.remove('on');
    document.body.style.overflow = '';
  }

  // Events
  if (openBtn) openBtn.addEventListener('click', open);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  input.addEventListener('input', () => render(input.value));

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = (activeIdx + 1) % items.length; updateActive(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = (activeIdx - 1 + items.length) % items.length; updateActive(); }
    else if (e.key === 'Enter') { e.preventDefault(); execute(); }
    else if (e.key === 'Escape') { close(); }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      overlay.classList.contains('on') ? close() : open();
    }
    if (e.key === 'Escape' && overlay.classList.contains('on')) close();
  });
}

export function initSectionIndicator() {
  const indicator = document.getElementById('section-indicator');
  if (!indicator) return;
  const links = indicator.querySelectorAll('a');
  const sections = [...links].map(a => document.getElementById(a.dataset.sec)).filter(Boolean);

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('on', l.dataset.sec === e.target.id));
      }
    });
  }, { threshold: 0.4, rootMargin: '-20% 0px -20% 0px' });

  sections.forEach(s => obs.observe(s));
  links.forEach(l => l.addEventListener('click', (e) => {
    e.preventDefault();
    const el = document.getElementById(l.dataset.sec);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }));
}

export function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  let rafId = null;
  window.addEventListener('scroll', () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = p + '%';
      rafId = null;
    });
  }, { passive: true });
}
