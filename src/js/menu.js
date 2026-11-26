// Mega Menü
document.querySelectorAll('[data-mega]').forEach(item => {
  const btn = item.querySelector('.nav-btn');
  if (!btn) return;
  let timer;
  item.addEventListener('mouseenter', () => {
    clearTimeout(timer);
    document.querySelectorAll('[data-mega]').forEach(i => { if (i !== item) i.classList.remove('is-open'); });
    item.classList.add('is-open');
  });
  item.addEventListener('mouseleave', () => {
    timer = setTimeout(() => item.classList.remove('is-open'), 160);
  });
  btn.addEventListener('click', (e) => { e.preventDefault(); item.classList.toggle('is-open'); });
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('[data-mega]')) document.querySelectorAll('[data-mega]').forEach(i => i.classList.remove('is-open'));
});

// ── Tema ──
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.style.colorScheme = t;
  try { localStorage.setItem('hpa-theme', t); } catch(e) {}
}
function currentTheme() { return document.documentElement.getAttribute('data-theme') || 'dark'; }
function toggleTheme() { setTheme(currentTheme() === 'dark' ? 'light' : 'dark'); }
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

// ── Dil ──
const I18N = {
  tr: { nav_analiz:'Analizler', nav_mek:'Mekanizma', nav_seri:'Seriler', nav_data:'Data Lab',
        hero_meta:'Pas ağları · xG haritaları · Mekanizma raporları', hero_kaydir:'Kaydır', md_tema:'Tema Değiştir' },
  en: { nav_analiz:'Analysis', nav_mek:'Mechanism', nav_seri:'Series', nav_data:'Data Lab',
        hero_meta:'Pass networks · xG maps · Mechanism reports', hero_kaydir:'Scroll', md_tema:'Toggle Theme' }
};
function applyI18n(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = I18N[lang]?.[key];
    if (val) {
      const svg = el.querySelector('svg');
      if (svg && el.childNodes.length > 0) {
        el.childNodes[0].textContent = val + ' ';
      } else {
        el.textContent = val;
      }
    }
  });
  const cur = document.querySelector('.lang-current');
  const oth = document.querySelector('.lang-other');
  if (cur && oth) {
    cur.textContent = lang.toUpperCase();
    oth.textContent = lang === 'tr' ? 'EN' : 'TR';
  }
}
let currentLang = 'tr';
try { currentLang = localStorage.getItem('hpa-lang') || 'tr'; } catch(e) {}
applyI18n(currentLang);
const langBtn = document.getElementById('lang-toggle');
if (langBtn) langBtn.addEventListener('click', () => {
  currentLang = currentLang === 'tr' ? 'en' : 'tr';
  try { localStorage.setItem('hpa-lang', currentLang); } catch(e) {}
  applyI18n(currentLang);
});

// ── i18n tag'leme ──
document.querySelectorAll('.nav-main .nav-link').forEach(a => {
  const href = a.getAttribute('href');
  if (href === '#explore') a.dataset.i18n = 'nav_analiz';
  else if (href === '#mechanism') a.dataset.i18n = 'nav_mek';
  else if (href === '#series') a.dataset.i18n = 'nav_seri';
  else if (href === '/lab/') a.dataset.i18n = 'nav_data';
});
document.querySelectorAll('.hero-meta > span').forEach(el => {
  const t = el.textContent.trim();
  if (t.startsWith('Pas ağları') || t.startsWith('Pass networks')) el.dataset.i18n = 'hero_meta';
  else if (el.classList.contains('hero-scroll')) el.dataset.i18n = 'hero_kaydir';
});
applyI18n(currentLang);

// ── Mobile Drawer ──
const burger = document.getElementById('mobile-burger');
if (burger && !document.querySelector('.mobile-drawer')) {
  const drawer = document.createElement('div');
  drawer.className = 'mobile-drawer';
  drawer.innerHTML = `
    <div class="md-header">
      <span class="md-brand">HP<span class="a">A</span>NAL<span class="logo-y">Y</span>TIC</span>
      <button class="md-close" aria-label="Kapat">×</button>
    </div>
    <nav class="md-nav">
      <a href="#explore">Analizler</a>
      <a href="#mechanism">Mekanizma</a>
      <a href="#series">Seriler</a>
      <a href="#women">Portre</a>
      <a href="/lab/">Data Lab</a>
    </nav>
    <div class="md-footer">
      <button class="md-theme" data-i18n="md_tema">Tema Değiştir</button>
    </div>
  `;
  document.body.appendChild(drawer);
  const close = () => {
    drawer.classList.remove('open');
    document.body.style.overflow = '';
    burger.focus();
  };
  burger.addEventListener('click', () => {
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    drawer.querySelector('.md-close').focus();
  });
  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
  drawer.querySelector('.md-close').addEventListener('click', close);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  drawer.querySelector('.md-theme').addEventListener('click', toggleTheme);
  applyI18n(currentLang);
}

// ── Mobil Tam Ekran Menü ──
const mobileBurger = document.getElementById('mobile-burger');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileBurger && mobileMenu) {
  mobileBurger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    document.body.classList.toggle('menu-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    });
  });
}

// ── İçindekiler / Bölüm menüsü (masthead index düğmesine bağlı) ──
const INDEX_SECTIONS = [
  { id: 'explore', label: 'Son Analizler' },
  { id: 'mechanism', label: 'Mekanizma' },
  { id: 'week-story', label: 'Haftanın Hikâyesi' },
  { id: 'series', label: 'Seriler' },
  { id: 'women', label: 'Sahanın Dışındaki Kadınlar' },
  { id: 'dl-teaser', label: 'Data Lab Teaser' }
];

function buildIndexPanel() {
  let panel = document.getElementById('site-index');
  if (panel) return panel;

  panel = document.createElement('div');
  panel.id = 'site-index';
  panel.className = 'site-index';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'İçindekiler');

  const inner = document.createElement('div');
  inner.className = 'site-index-inner';

  const head = document.createElement('div');
  head.className = 'si-head';
  head.innerHTML = '<span class="kicker">İÇİNDEKİLER</span>';
  inner.appendChild(head);

  const sections = INDEX_SECTIONS
    .map(s => ({ ...s, el: document.getElementById(s.id) }))
    .filter(s => s.el);
  if (sections.length) {
    const nav = document.createElement('nav');
    nav.className = 'si-group';
    nav.setAttribute('aria-label', 'Bölümler');
    sections.forEach(s => {
      const a = document.createElement('a');
      a.href = `#${s.id}`;
      a.className = 'si-link';
      a.textContent = s.label;
      nav.appendChild(a);
    });
    inner.appendChild(nav);
  }

  const latest = document.getElementById('explore-latest');
  const liveLinks = latest
    ? [...latest.querySelectorAll('a[href^="/yazi/"]')].slice(0, 4)
    : [];
  if (liveLinks.length) {
    const label = document.createElement('span');
    label.className = 'si-label';
    label.textContent = 'GÜNCEL MAÇ ANALİZLERİ';
    inner.appendChild(label);
    const nav = document.createElement('nav');
    nav.className = 'si-group';
    nav.setAttribute('aria-label', 'Güncel maç analizleri');
    liveLinks.forEach(src => {
      const a = document.createElement('a');
      a.href = src.getAttribute('href');
      a.className = 'si-link';
      const title = src.querySelector('.ec-title');
      const date = src.querySelector('.ec-date');
      a.innerHTML = `<span>${title ? title.textContent : ''}</span><small>${date ? date.textContent : ''}</small>`;
      nav.appendChild(a);
    });
    inner.appendChild(nav);
  }

  const labLink = document.createElement('a');
  labLink.href = '/lab/';
  labLink.className = 'si-link si-lab';
  labLink.textContent = 'Data Lab →';
  inner.appendChild(labLink);

  panel.appendChild(inner);
  document.body.appendChild(panel);
  return panel;
}

let siteIndexOpen = false;
let siteIndexTrigger = null;

function syncTrigger(open) {
  const btn = document.querySelector('.index-btn');
  if (!btn) return;
  btn.classList.toggle('is-open', open);
  btn.setAttribute('aria-expanded', String(open));
}

function toggleSiteIndex(open) {
  const panel = buildIndexPanel();
  if (!panel) return;
  const next = typeof open === 'boolean' ? open : !siteIndexOpen;
  if (next === siteIndexOpen) return;
  siteIndexOpen = next;
  panel.hidden = !siteIndexOpen;
  document.body.classList.toggle('site-index-open', siteIndexOpen);
  syncTrigger(siteIndexOpen);
  if (siteIndexOpen) {
    siteIndexTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const first = panel.querySelector('a, button');
    if (first) requestAnimationFrame(() => first.focus());
  } else if (siteIndexTrigger && document.contains(siteIndexTrigger)) {
    siteIndexTrigger.focus();
  }
  siteIndexTrigger = siteIndexOpen ? siteIndexTrigger : null;
}

document.addEventListener('masthead:index', (e) => toggleSiteIndex(!!e.detail?.open));

document.addEventListener('keydown', (e) => {
  if (!siteIndexOpen) return;
  const panel = document.getElementById('site-index');
  if (!panel) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    toggleSiteIndex(false);
    return;
  }
  if (e.key !== 'Tab') return;
  const focusables = [...panel.querySelectorAll('a[href], button:not([disabled])')]
    .filter(el => el.offsetParent !== null || el === document.activeElement);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

document.addEventListener('click', (e) => {
  if (!siteIndexOpen) return;
  if (e.target.closest('#site-index a')) { toggleSiteIndex(false); return; }
  if (!e.target.closest('#site-index') && !e.target.closest('.index-btn')) toggleSiteIndex(false);
});
