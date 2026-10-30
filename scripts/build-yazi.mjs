import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { marked } from 'marked';

const SRC = resolve('content/yazilar');
const OUT = resolve('public/yazi');
mkdirSync(OUT, { recursive: true });

const TYPE_LABEL = { mac: 'Maç Dosyası', metrik: 'Metrik', portre: 'Portre', scouting: 'Scouting', kultur: 'Kültür', articles: 'Analiz', portraits: 'Portre' };
const TYPE_COLOR = { mac: '#B4FF39', metrik: '#D4A548', portre: '#FF6B35', scouting: '#6B9FE8', kultur: '#9B7BB8', articles: '#B4FF39', portraits: '#FF6B35' };

function esc(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#08090B;--bg-elev:#0D0E12;--ink:#F4F2EC;--ink-soft:#8A8A93;--ink-faint:#4A4A52;--line:#1B1B21;--line-bright:#2A2B33;--neon:#B4FF39;--orange:#FF6B35;--serif:'Newsreader',Georgia,serif;--mono:'JetBrains Mono',monospace;--sans:'Hanken Grotesk',system-ui,sans-serif}
html{background:var(--bg);-webkit-font-smoothing:antialiased;scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:var(--sans);line-height:1.6;min-height:100vh;background-image:radial-gradient(ellipse 60% 40% at 15% -10%,rgba(180,255,57,0.06),transparent 60%);cursor:auto}
a{color:inherit;text-decoration:none}
::selection{background:var(--neon);color:var(--bg)}

/* Reading Progress */
.progress-bar{position:fixed;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--neon),var(--orange));z-index:1000;width:0%;transition:width .1s}

/* Back */
.back{position:fixed;top:20px;left:20px;z-index:10;font-family:var(--mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-soft);padding:8px 14px;border:1px solid var(--line);background:rgba(10,10,12,.85);backdrop-filter:blur(12px);transition:all .2s;border-radius:4px}
.back:hover{color:var(--neon);border-color:var(--neon)}

/* Hero */
.hero{padding:100px 24px 48px;max-width:1200px;margin:0 auto;border-bottom:1px solid var(--line)}
@media(min-width:768px){.hero{padding:130px 48px 64px}}
.hero-top{display:flex;gap:16px;align-items:center;margin-bottom:28px;flex-wrap:wrap}
.type-badge{font-family:var(--mono);font-size:10px;letter-spacing:.24em;text-transform:uppercase;padding:6px 12px;border:1px solid;border-radius:2px}
.hero-date{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-faint)}
.hero-read{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-faint)}
.hero h1{font-family:var(--serif);font-weight:400;font-size:clamp(32px,6vw,64px);line-height:1.05;letter-spacing:-.025em;color:var(--ink);margin-bottom:24px}
@media(min-width:768px){.hero h1{font-size:clamp(40px,7vw,80px);letter-spacing:-.03em}}
.hero .lede{font-family:var(--serif);font-size:clamp(18px,2.5vw,24px);line-height:1.5;font-style:italic;color:var(--ink-soft);max-width:820px}

/* Layout */
.layout{display:grid;grid-template-columns:1fr;gap:0;max-width:1200px;margin:0 auto;padding:48px 24px 80px}
@media(min-width:1024px){.layout{grid-template-columns:220px 1fr;gap:80px;padding:64px 48px 96px}}

/* TOC */
.toc{display:none}
@media(min-width:1024px){.toc{display:block;position:sticky;top:100px;align-self:start;max-height:calc(100vh - 140px);overflow-y:auto}}
.toc-label{font-family:var(--mono);font-size:9px;letter-spacing:.24em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:16px}
.toc ol{list-style:none;display:flex;flex-direction:column;gap:2px;border-left:1px solid var(--line);padding-left:0}
.toc li{padding:6px 0 6px 16px;font-family:var(--sans);font-size:13px;line-height:1.4;border-left:2px solid transparent;margin-left:-1px;transition:all .2s}
.toc a{color:var(--ink-soft);display:block}
.toc li:hover a{color:var(--ink)}
.toc li.active{border-left-color:var(--neon)}
.toc li.active a{color:var(--neon)}

/* Article */
.article{max-width:720px;font-size:17px;line-height:1.8;color:#E4E2DC}
@media(min-width:768px){.article{font-size:18px}}
.article > p:first-of-type::first-letter{font-family:var(--serif);font-size:5em;line-height:1;float:left;padding:6px 12px 0 0;color:var(--neon);font-weight:500}
.article h2{font-family:var(--serif);font-weight:400;font-size:clamp(26px,4vw,40px);line-height:1.15;letter-spacing:-.02em;margin:64px 0 20px;color:var(--ink);scroll-margin-top:100px}
.article h3{font-family:var(--serif);font-weight:500;font-size:clamp(20px,3vw,26px);line-height:1.25;margin:40px 0 16px;color:var(--ink);scroll-margin-top:100px}
.article p{margin:0 0 24px}
.article strong{color:var(--ink);font-weight:600}
.article em{font-family:var(--serif);font-style:italic}
.article a{color:var(--neon);text-decoration:underline;text-underline-offset:3px}
.article ul,.article ol{margin:0 0 24px 24px}
.article li{margin-bottom:10px}
.article blockquote{border-left:2px solid var(--neon);padding:12px 0 12px 28px;margin:32px 0;font-family:var(--serif);font-style:italic;font-size:clamp(20px,2.5vw,26px);color:var(--neon);line-height:1.5}
.article code{font-family:var(--mono);font-size:.9em;background:var(--line);padding:2px 6px;border-radius:2px}
.article hr{border:none;border-top:1px solid var(--line);margin:48px 0}
.article img{max-width:100%;height:auto;display:block;margin:24px 0;border:1px solid var(--line)}
.article table{width:100%;border-collapse:collapse;margin:24px 0;font-size:14px}
.article th,.article td{padding:10px 12px;border:1px solid var(--line);text-align:left}
.article th{background:var(--bg-elev);font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft)}

/* Author + Share */









/* Related */
.related{padding:0 24px 80px;max-width:1200px;margin:0 auto;border-top:1px solid var(--line);padding-top:64px}
@media(min-width:768px){.related{padding:0 48px 96px;padding-top:64px}}
.related-title{font-family:var(--serif);font-size:clamp(24px,3vw,32px);font-weight:400;margin-bottom:32px;color:var(--ink)}
.related-grid{display:grid;grid-template-columns:1fr;gap:1px;background:var(--line);border:1px solid var(--line)}
@media(min-width:768px){.related-grid{grid-template-columns:repeat(3,1fr)}}
.rel-card{background:var(--bg);padding:24px;display:flex;flex-direction:column;gap:10px;transition:background .2s;min-height:200px}
.rel-card:hover{background:var(--bg-elev)}
.rel-tag{font-family:var(--mono);font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-faint)}
.rel-card h4{font-family:var(--serif);font-size:18px;font-weight:500;line-height:1.25;color:var(--ink);flex:1}
.rel-cta{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--neon)}

/* Footer */
.site-footer{max-width:1200px;margin:0 auto;padding:32px 24px;border-top:1px solid var(--line);display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-family:var(--mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-faint)}
.site-footer a{color:var(--ink-soft)}
.site-footer a:hover{color:var(--neon)}
@media(min-width:768px){.site-footer{padding:32px 48px}}

html{opacity:1;transition:opacity .22s cubic-bezier(.2,.9,.3,1)}html.page-leaving{opacity:0}@keyframes pageFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}body{animation:pageFadeIn .4s cubic-bezier(.2,.9,.3,1)}
`;


function processBlocks(md) {
  let out = md;
  // Stat: :::stat VALUE|LABEL|SUB (satır içi, 1-N satır)
  out = out.replace(/^:::stat\s+([^|\n]+)\|([^|\n]+)\|([^\n]+)$/gm, (m, val, label, sub) =>
    `<div class="blk-stat-item"><div class="bs-val">${val.trim()}</div><div class="bs-label">${label.trim()}</div><div class="bs-sub">${sub.trim()}</div></div>`);
  // Stat group: :::stats ... :::
  out = out.replace(/:::stats\n([\s\S]*?)\n:::/g, (m, body) => `<div class="blk-stat">${body}</div>`);
  // Quote
  out = out.replace(/:::quote\n([\s\S]*?)\n:::/g, (m, body) => {
    const lines = body.split('\n');
    const citeIdx = lines.findIndex(l => l.startsWith('—') || l.startsWith('--'));
    let txt = body, cite = '';
    if (citeIdx >= 0) {
      txt = lines.slice(0, citeIdx).join('\n');
      cite = lines.slice(citeIdx).join(' ').replace(/^[—-]+\s*/, '');
    }
    return `<blockquote class="blk-quote">${txt}${cite ? `<cite>— ${cite}</cite>` : ''}</blockquote>`;
  });
  // Callout
  out = out.replace(/:::note\s+([^\n]+)\n([\s\S]*?)\n:::/g, (m, title, body) =>
    `<div class="blk-callout"><div class="bc-title">${title}</div><div class="bc-body">${body}</div></div>`);
  out = out.replace(/:::warn\s+([^\n]+)\n([\s\S]*?)\n:::/g, (m, title, body) =>
    `<div class="blk-callout warn"><div class="bc-title">${title}</div><div class="bc-body">${body}</div></div>`);
  // Chart
  out = out.replace(/:::chart\s+([^|]+)\|([^|]+)\|([^\n]+)\n([\s\S]*?)\n:::/g, (m, type, title, note, body) =>
    `<div class="blk-chart"><div class="bc-head"><span class="bc-type">${type.trim()}</span><span class="bc-title">${title.trim()}</span></div><div class="bc-body">${body.trim()}</div><div class="bc-note">${note.trim()}</div></div>`);
  // Image
  out = out.replace(/:::image\s+([^|]+)\|([^|]+)\|([^\n]+)/g, (m, src, alt, cap) =>
    `<figure class="blk-image"><img src="${src.trim()}" alt="${alt.trim()}" loading="lazy"><figcaption>${cap.trim()}</figcaption></figure>`);
  // Compare
  out = out.replace(/:::compare\s+([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^\n]+)/g, (m, lA, vA, lB, vB, cap) =>
    `<div class="blk-compare"><div class="c-col is-left"><div class="c-label">${lA.trim()}</div><div class="c-val">${vA.trim()}</div></div><div class="c-vs">vs</div><div class="c-col is-right"><div class="c-label">${lB.trim()}</div><div class="c-val">${vB.trim()}</div></div><div class="c-caption">${cap.trim()}</div></div>`);
  return out;
}

function buildTOC(html) {
  const headings = [...html.matchAll(/<h([23])[^>]*>(.*?)<\/h\1>/g)];
  if (headings.length < 2) return { html, toc: '' };
  let tocItems = '';
  const newHtml = html.replace(/<h([23])[^>]*>(.*?)<\/h\1>/g, (m, level, text) => {
    const id = 'h-' + text.replace(/<[^>]+>/g, '').trim().toLowerCase().replace(/[^a-z0-9şğıöçü]+/g, '-').slice(0, 40);
    tocItems += `<li data-level="${level}"><a href="#${id}">${text}</a></li>`;
    return `<h${level} id="${id}">${text}</h${level}>`;
  });
  return { html: newHtml, toc: tocItems };
}

function page({ title, bodyHtml, type, typeLabel, typeColor, date, read, excerpt, source, related }) {
  const { html: articleHtml, toc } = buildTOC(bodyHtml);
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"/><style>html{background:#08090B}body{background:#08090B;color:#F4F2EC;margin:0}</style><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/><meta name="theme-color" content="#08090B"/><title>${esc(title)} — HP//Analytic</title><meta name="description" content="${esc(excerpt || title)}"/><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet"><style>${CSS}</style></head><body>
<div class="progress-bar" id="progress"></div>
<a href="/" class="back">← Ana sayfa</a>
<section class="hero">
  <div class="hero-top">
    <span class="type-badge" style="color:${typeColor};border-color:${typeColor}">${esc(typeLabel)}</span>
    <span class="hero-date">${esc(date || '')}</span>
    ${read ? `<span class="hero-read">${read} dk okuma</span>` : ''}
  </div>
  <h1>${esc(title)}</h1>
  ${excerpt ? `<p class="lede">${esc(excerpt)}</p>` : ''}
</section>
<div class="layout">
  ${toc ? `<aside class="toc"><div class="toc-label">İçindekiler</div><ol>${toc}</ol></aside>` : '<div></div>'}
  <article class="article">
    ${articleHtml}
    </article>
</div>
${related && related.length ? `<section class="related"><h2 class="related-title">Benzer Yazılar</h2><div class="related-grid">${related.map(r => `<a href="/yazi/${r.slug}.html" class="rel-card"><span class="rel-tag">${esc(r.typeLabel)}</span><h4>${esc(r.title)}</h4><span class="rel-cta">Oku →</span></a>`).join('')}</div></section>` : ''}
<footer class="site-footer"><span>© 2026 HP//Analytic</span><a href="/">Ana sayfa</a></footer>
<script>
const bar = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (window.scrollY / h * 100) + '%';
}, { passive: true });
// TOC active state
const tocLinks = document.querySelectorAll('.toc a');
const headings = [...document.querySelectorAll('.article h2, .article h3')];
if (tocLinks.length && headings.length) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        tocLinks.forEach(l => l.parentElement.classList.remove('active'));
        const active = document.querySelector('.toc a[href="#' + e.target.id + '"]');
        if (active) active.parentElement.classList.add('active');
      }
    });
  }, { rootMargin: '-100px 0px -70% 0px' });
  headings.forEach(h => obs.observe(h));
}
</script>
<script src="/page-transition.js" defer></script>
<script src="/extras2.js" defer></script>
</body></html>`;
}

const files = readdirSync(SRC).filter(f => f.endsWith('.md'));
const all = [];
for (const file of files) {
  const raw = readFileSync(resolve(SRC, file), 'utf-8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n\n?([\s\S]*)$/);
  if (!m) { console.log('✗ ' + file); continue; }
  const meta = {};
  m[1].split('\n').forEach(line => {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  });
  all.push({ slug: meta.slug || file.replace('.md', ''), title: meta.title || '', type: meta.type || 'articles', excerpt: meta.excerpt || '', date: meta.date || '', read: meta.read ? Number(meta.read) : Math.ceil(m[2].split(' ').length / 200), source: meta.source || '', body: m[2].trim().replace(/^#\s+.*$/m, '').trim() });
}

for (const a of all) {
  const typeLabel = TYPE_LABEL[a.type] || 'Yazı';
  const typeColor = TYPE_COLOR[a.type] || '#B4FF39';
  const related = all.filter(x => x.slug !== a.slug && x.type === a.type).slice(0, 3);
  if (related.length < 3) {
    const extra = all.filter(x => x.slug !== a.slug && x.type !== a.type).slice(0, 3 - related.length);
    related.push(...extra);
  }
  const relatedData = related.map(r => ({ slug: r.slug, title: r.title, typeLabel: TYPE_LABEL[r.type] || 'Yazı' }));
  const bodyHtml = marked.parse(processBlocks(a.body));
  const out = page({ title: a.title, bodyHtml, type: a.type, typeLabel, typeColor, date: a.date, read: a.read, excerpt: a.excerpt, source: a.source, related: relatedData });
  writeFileSync(resolve(OUT, a.slug + '.html'), out, 'utf-8');
  console.log('✓ ' + a.slug + ' · ' + out.length + ' bytes');
}
console.log('\n── ' + all.length + ' yazı yeniden üretildi ──');
