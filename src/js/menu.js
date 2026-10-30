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
  tr: { nav_analiz:'Analiz', nav_data:'Data Lab', nav_gunluk:'Günlük', nav_hak:'Hakkımda',
        hero_meta:'Pas ağları · xG haritaları · Mekanizma raporları', hero_kaydir:'Kaydır', md_tema:'Tema Değiştir' },
  en: { nav_analiz:'Analysis', nav_data:'Data Lab', nav_gunluk:'Journal', nav_hak:'About',
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
document.querySelectorAll('.nav-main .nav-btn').forEach(b => b.dataset.i18n = 'nav_analiz');
document.querySelectorAll('.nav-main .nav-link').forEach(a => {
  const href = a.getAttribute('href');
  if (href === '#lab') a.dataset.i18n = 'nav_data';
  else if (href === '#journal') a.dataset.i18n = 'nav_gunluk';
  else if (href === '/hakkinda') a.dataset.i18n = 'nav_hak';
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
      <span class="md-brand">HP<span class="a">A</span>NALYTIC</span>
      <button class="md-close" aria-label="Kapat">×</button>
    </div>
    <nav class="md-nav">
      <a href="#mac">Maç Dosyaları</a>
      <a href="#metrik">Metrik</a>
      <a href="#portre">Portre</a>
      <a href="#lab">Data Lab</a>
      <a href="#journal">Günlük</a>
      <a href="/hakkinda">Hakkımda</a>
    </nav>
    <div class="md-footer">
      <button class="md-theme" data-i18n="md_tema">Tema Değiştir</button>
    </div>
  `;
  document.body.appendChild(drawer);
  const close = () => { drawer.classList.remove('open'); document.body.style.overflow = ''; };
  burger.addEventListener('click', () => { drawer.classList.add('open'); document.body.style.overflow = 'hidden'; });
  drawer.querySelector('.md-close').addEventListener('click', close);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  drawer.querySelector('.md-theme').addEventListener('click', toggleTheme);
  applyI18n(currentLang);
}
