import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { marked } from 'marked';

const SRC = resolve('content/yazilar');
const OUT = resolve('public/yazi');
mkdirSync(OUT, { recursive: true });

const TYPE_LABEL = { mac: 'Maç Dosyası', articles: 'Analiz', portraits: 'Portre', scouting: 'Scouting', culture: 'Kültür' };

function esc(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

const CSS = `*{box-sizing:border-box;margin:0;padding:0}html{background:#0A0A0C;-webkit-font-smoothing:antialiased}body{background:#0A0A0C;color:#F4F2EC;font-family:'Hanken Grotesk',system-ui,sans-serif;line-height:1.6;min-height:100vh;background-image:radial-gradient(ellipse 60% 40% at 15% -10%,rgba(180,255,57,0.06),transparent 60%)}a{color:inherit;text-decoration:none}.back{position:fixed;top:20px;left:20px;z-index:10;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#8A8A93;padding:8px 14px;border:1px solid #1B1B21;background:rgba(10,10,12,.7);backdrop-filter:blur(12px);transition:color .2s,border-color .2s}.back:hover{color:#B4FF39;border-color:#B4FF39}.header{padding:24px 24px 0;max-width:760px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}.brand{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:500;letter-spacing:.18em;display:inline-flex;align-items:center;gap:10px}.brand::before{content:'';width:9px;height:9px;background:#B4FF39;border-radius:2px;box-shadow:0 0 14px #B4FF39}.type-badge{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:#FF6B35;padding:6px 12px;border:1px solid #FF6B35;opacity:.7}.article{max-width:760px;margin:0 auto;padding:48px 24px 80px}.article h1{font-family:'Newsreader',Georgia,serif;font-weight:400;font-size:clamp(32px,6vw,64px);line-height:1.05;letter-spacing:-.025em;margin-bottom:24px;color:#F4F2EC}.lead{font-family:'Hanken Grotesk',sans-serif;font-size:18px;line-height:1.6;color:#8A8A93;margin-bottom:40px;padding-bottom:40px;border-bottom:1px solid #1B1B21}.body{font-size:17px;line-height:1.75;color:#E4E2DC}.body h2{font-family:'Newsreader',Georgia,serif;font-weight:400;font-size:32px;line-height:1.15;letter-spacing:-.02em;margin:56px 0 20px;color:#F4F2EC}.body h3{font-family:'Newsreader',Georgia,serif;font-weight:500;font-size:24px;line-height:1.2;margin:40px 0 16px;color:#F4F2EC}.body p{margin:0 0 20px}.body strong{color:#F4F2EC;font-weight:600}.body em{font-family:'Newsreader',Georgia,serif;font-style:italic}.body a{color:#B4FF39;text-decoration:underline;text-underline-offset:3px}.body ul,.body ol{margin:0 0 24px 24px}.body li{margin-bottom:8px}.body blockquote{border-left:2px solid #B4FF39;padding:8px 0 8px 24px;margin:24px 0;font-family:'Newsreader',Georgia,serif;font-style:italic;font-size:20px;color:#B4FF39;line-height:1.5}.body code{font-family:'JetBrains Mono',monospace;font-size:.9em;background:#1B1B21;padding:2px 6px;border-radius:2px}.body hr{border:none;border-top:1px solid #1B1B21;margin:40px 0}.footer{max-width:760px;margin:0 auto;padding:32px 24px;border-top:1px solid #1B1B21;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#4A4A52}.footer a{color:#8A8A93}.footer a:hover{color:#B4FF39}@media(min-width:768px){.header,.article,.footer{padding-left:48px;padding-right:48px}.back{top:32px;left:32px}}`;

function page({ title, bodyHtml, typeLabel, source, excerpt }) {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/><meta name="theme-color" content="#0A0A0C"/><title>${esc(title)} — HP//Analytic</title><meta name="description" content="${esc(excerpt || title)}"/><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" rel="stylesheet"><style>${CSS}</style></head><body><a href="/" class="back">← Ana sayfa</a><header class="header"><div class="brand">HP//ANALYTIC</div><div class="type-badge">${esc(typeLabel)}</div></header><main class="article"><h1>${esc(title)}</h1>${excerpt ? `<p class="lead">${esc(excerpt)}</p>` : ''}<article class="body">${bodyHtml}</article></main><footer class="footer"><span>© 2026 HP//Analytic</span>${source ? `<a href="${esc(source)}" target="_blank" rel="noopener">Orijinal kaynak ↗</a>` : ''}</footer></body></html>`;
}

const files = readdirSync(SRC).filter(f => f.endsWith('.md'));
for (const file of files) {
  const raw = readFileSync(resolve(SRC, file), 'utf-8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n\n?([\s\S]*)$/);
  if (!m) { console.log('✗ ' + file + ' frontmatter yok'); continue; }
  const meta = {};
  m[1].split('\n').forEach(line => {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  });
  const slug = meta.slug || file.replace('.md', '');
  const title = meta.title || slug;
  const type = meta.type || 'yazi';
  const source = meta.source || '';
  const excerpt = meta.excerpt || '';
  const typeLabel = TYPE_LABEL[type] || 'Yazı';
  let body = m[2].trim().replace(/^#\s+.*$/m, '').trim();
  const bodyHtml = marked.parse(body);
  writeFileSync(resolve(OUT, slug + '.html'), page({ title, bodyHtml, typeLabel, source, excerpt }), 'utf-8');
  console.log('✓ ' + slug + '.html · ' + bodyHtml.length + ' bytes');
}
console.log('\n── Build tamamlandı ──');
