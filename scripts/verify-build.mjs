import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';

const DIST = resolve('dist');
let failures = 0;
const ok = (name) => console.log(`  PASS ${name}`);
const fail = (name, detail) => { failures++; console.error(`  FAIL ${name} ${detail || ''}`); };

const SPA_ROUTES = ['/seri/', '/top-5'];
const KNOWN_MISSING = [
  { ref: '/assets/images/pass_net_Liverpool_FC.png', page: '/yazi/2026-11-04-fenerbahce-vs-liverpool-fc.html', reason: 'main dalindan devralinan eksik gorsel; pass_network_v2.json gorsellestirmesi ayri gorev' },
  { ref: '/scroll-build.js', page: '/lab/manifesto.html', reason: 'main dalindan devralinan eksik script' },
  { refPrefix: 'vendor/vega', page: '/assets/data/gs-fb-20261026/dashboard.html', reason: 'main dalindan devralinan eksik vega vendor dosyalari' },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

const files = walk(DIST);
const html = files.filter((f) => f.endsWith('.html'));

console.log('1) Build çıktısı mevcut');
existsSync(join(DIST, 'index.html')) ? ok('dist/index.html') : fail('dist/index.html yok');
html.length > 0 ? ok(`${html.length} HTML sayfası`) : fail('HTML yok');

console.log('2) Geçici/test içeriği dist dışı');
for (const banned of ['draft.html', 'test-visuals.html', 'test-pitch.html', 'test-pitch-layers.html', 'interaktif-test.html', 'banner-343.html', 'js/visuals.js']) {
  existsSync(join(DIST, banned)) ? fail(`kalıntı: ${banned}`) : ok(`yok: ${banned}`);
}
const hasBak = files.some((f) => /\.bak|\.bozuk/.test(f));
hasBak ? fail('.bak dosyası dist içinde') : ok('dist içinde .bak yok');

console.log('3) Yerel link/asset bütünlüğü');
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
    const page = f.replace(DIST, '');
    const known = KNOWN_MISSING.some((k) => (k.ref ? k.ref === (target.startsWith('/') ? target : ref) : k.refPrefix && ref.startsWith(k.refPrefix)) && page.endsWith(k.page));
    if (known) continue;
    checked++;
    const candidate = resolve(dirname(f), decodeURIComponent(target));
    if (!existsSync(candidate) && !existsSync(join(DIST, target.replace(/^\//, '')))) { broken++; console.error(`    kırık: ${f.replace(DIST, '')} -> ${ref}`); }
  }
}
broken === 0 ? ok(`${checked} yerel referans sağlam`) : fail(`${broken} kırık referans`);

console.log('3b) main dalından devralınan bilinen eksikler (uyarı, build fail değil)');
for (const k of KNOWN_MISSING) {
  const hit = files.some((f) => f.endsWith(k.page) && readFileSync(f, 'utf8').includes(k.ref || k.refPrefix));
  hit ? console.log(`  KNOWN ${k.ref || k.refPrefix} — ${k.reason}`) : ok(`artık yok: ${k.ref || k.refPrefix}`);
}

console.log('4) Mobil uyumluluk (viewport + responsive)');
let missingViewport = 0;
for (const f of html) {
  const src = readFileSync(f, 'utf8');
  if (!src.includes('name="viewport"')) { missingViewport++; console.error(`    viewport eksik: ${f.replace(DIST, '')}`); }
}
missingViewport === 0 ? ok(`${html.length} sayfada viewport meta`) : fail(`${missingViewport} sayfada viewport eksik`);
const cssFiles = files.filter((f) => f.endsWith('.css'));
const mediaCount = cssFiles.reduce((n, f) => n + (readFileSync(f, 'utf8').match(/@media/g) || []).length, 0);
mediaCount > 0 ? ok(`${cssFiles.length} CSS dosyasında ${mediaCount} @media bloğu`) : fail('responsive @media yok');

console.log('5) Route listesi');
const routes = html.map((f) => f.replace(DIST, '').replace('index.html', ''));
console.log(`  ${routes.length} route üretildi`);

if (failures > 0) { console.error(`\n${failures} DOĞRULAMA BAŞARISIZ`); process.exit(1); }
console.log('\nTÜM DOĞRULAMALAR GEÇTİ');
