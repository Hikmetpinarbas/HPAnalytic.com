import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';

const DIST = resolve('dist');
let failures = 0;
const ok = (name) => console.log(`  PASS ${name}`);
const fail = (name, detail) => { failures++; console.error(`  FAIL ${name} ${detail || ''}`); };

const SPA_ROUTES = ['/seri/', '/top-5'];

const AGENT_TAG_RE = /\b(openai|groq|claude|copilot|codex|mistral|gemini|deepseek|qwen|ollama|llama-[0-9]|gpt-[0-9a-z]|zai-glm|vibe-code)\b/i;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

const files = walk(DIST);
const html = files.filter((f) => f.endsWith('.html'));
const textFiles = files.filter((f) => /\.(html|js|css|json|xml|txt|mjs)$/.test(f));

console.log('1) Build çıktısı mevcut');
existsSync(join(DIST, 'index.html')) ? ok('dist/index.html') : fail('dist/index.html yok');
html.length > 0 ? ok(`${html.length} HTML sayfası`) : fail('HTML yok');

console.log('2) Geçici/test içeriği dist dışı (kalıcı gate)');
for (const banned of ['draft.html', 'test-visuals.html', 'test-pitch.html', 'test-pitch-layers.html', 'interaktif-test.html', 'banner-343.html', 'js/visuals.js']) {
  existsSync(join(DIST, banned)) ? fail(`kalıntı: ${banned}`) : ok(`yok: ${banned}`);
}
const tempFiles = files.filter((f) => /\.(bak|bozuk|old|tmp)(\.|$)|(^|\/)draft[-_.]|[-_]test[-_.]/.test(f.replace(DIST, '')));
tempFiles.length === 0 ? ok('geçici dosya adı yok') : fail(`geçici dosya adları: ${tempFiles.slice(0, 6).join(', ')}`);

console.log('3) Kullanıcıya görünür ajan/etiket taraması (kalıcı gate)');
const tagged = [];
for (const f of textFiles) {
  const m = readFileSync(f, 'utf8').match(AGENT_TAG_RE);
  if (m) tagged.push(`${f.replace(DIST, '')} (${m[0]})`);
}
tagged.length === 0 ? ok(`${textFiles.length} metin dosyası temiz`) : fail(`ajan etiketi sızdı: ${tagged.slice(0, 6).join(', ')}`);

console.log('4) Yerel link/asset bütünlüğü');
let checked = 0; let broken = 0;
for (const f of html) {
  const src = readFileSync(f, 'utf8');
  const refs = [...src.matchAll(/(?:href|src)="([^"#]+?)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|data:|\/\/)/.test(ref)) continue;
    if (ref.includes('${')) continue;
    if (SPA_ROUTES.some((r) => ref.startsWith(r))) continue;
    const target = ref.split('?')[0].split('#')[0];
    if (!target) continue;
    checked++;
    const candidate = resolve(dirname(f), decodeURIComponent(target));
    if (!existsSync(candidate) && !existsSync(join(DIST, target.replace(/^\//, '')))) { broken++; console.error(`    kırık: ${f.replace(DIST, '')} -> ${ref}`); }
  }
}
broken === 0 ? ok(`${checked} yerel referans sağlam`) : fail(`${broken} kırık referans`);

console.log('5) Mobil uyumluluk (viewport + responsive)');
let missingViewport = 0;
for (const f of html) {
  const src = readFileSync(f, 'utf8');
  if (!src.includes('name="viewport"')) { missingViewport++; console.error(`    viewport eksik: ${f.replace(DIST, '')}`); }
}
missingViewport === 0 ? ok(`${html.length} sayfada viewport meta`) : fail(`${missingViewport} sayfada viewport eksik`);
const cssFiles = files.filter((f) => f.endsWith('.css'));
const mediaCount = cssFiles.reduce((n, f) => n + (readFileSync(f, 'utf8').match(/@media/g) || []).length, 0);
mediaCount > 0 ? ok(`${cssFiles.length} CSS dosyasında ${mediaCount} @media bloğu`) : fail('responsive @media yok');

console.log('6) Canlı ticker sözleşmesi (fail-closed)');
const tickerPath = join(DIST, 'assets/data/live-ticker.json');
if (!existsSync(tickerPath)) {
  ok('ticker JSON yok (opsiyonel)');
} else {
  try {
    const j = JSON.parse(readFileSync(tickerPath, 'utf8'));
    if (j.schema !== 'hpa.live_ticker.v1') {
      fail('ticker schema beklenmedik:', j.schema);
    } else if (j.available !== true || j.publication_authorized !== true) {
      ok(`fail-closed seed (available=${j.available}, authorized=${j.publication_authorized})`);
    } else {
      if (!j.fetched_at || Number.isNaN(Date.parse(j.fetched_at))) fail('ticker fetched_at geçersiz');
      const items = Array.isArray(j.items) ? j.items : [];
      const bad = items.filter((it) =>
        !it || typeof it.text !== 'string' || !it.text.trim()
        || typeof it.kaynak !== 'string' || !it.kaynak.trim()
        || !/^\d{4}-\d{2}-\d{2}$/.test(it.tarih || '')
        || !['dogrulanmis', 'proxy', 'hipotez'].includes(it.dogrulama));
      if (!Number.isNaN(Date.parse(j.fetched_at)) && bad.length === 0) {
        ok(`${items.length} ticker maddesi kaynak/tarih/doğrulama alanlarıyla geçerli`);
      } else if (bad.length) {
        fail(`${bad.length} ticker maddesi zorunlu alanları (text/kaynak/tarih/doğrulama) eksik`);
      }
    }
  } catch (e) {
    fail('ticker JSON bozuk:', e.message);
  }
}

if (failures > 0) { console.error(`\n${failures} DOĞRULAMA BAŞARISIZ`); process.exit(1); }
console.log('\nTÜM DOĞRULAMALAR GEÇTİ');
