// Canlı bülten besleme adaptörü — gerçek kaynak → hpa.live_ticker.v1.
//
// Kaynaklar (hepsi gerçek, uydurma yok):
//   1. Yayın defteri: content/yazilar/*.md — yalnızca geçerli tarih (YYYY-MM-DD)
//      ve slug taşıyan yayındaki makaleler; tip etiketi korunur.
//   2. HPA_TICKER_SOURCE_URL (isteğe bağlı): sözleşmeye uyan harici JSON.
//      Sözleşme denetimi src/js/ticker-contract.mjs ile yapılır; uymayan
//      madde sessizce düşmez — raporlanır ve yayınlanmaz.
//
// Fail-closed: hiç geçerli madde yoksa veya --publish verilmediyse çıktı
// available=false seed'dir. Uydurma skor/içerik üretilmez.
//
// Kullanım:
//   node scripts/ticker-feed.mjs            → fail-closed seed yazar
//   node scripts/ticker-feed.mjs --publish  → geçerli maddelerle yayınlar
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TICKER_SCHEMA, auditItems } from '../src/js/ticker-contract.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = join(ROOT, 'content', 'yazilar');
const OUT = join(ROOT, 'public', 'assets', 'data', 'live-ticker.json');

const publish = process.argv.includes('--publish');
const TYPE_LABELS = {
  mac: 'HPAnalytic maç raporu',
  articles: 'HPAnalytic analizi',
  portraits: 'HPAnalytic portresi',
  seriler: 'HPAnalytic serisi'
};

function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    meta[kv[1].toLowerCase()] = v;
  }
  return meta;
}

function localItems() {
  if (!existsSync(CONTENT_DIR)) return [];
  const items = [];
  for (const file of readdirSync(CONTENT_DIR)) {
    if (!file.endsWith('.md')) continue;
    const meta = parseFrontmatter(readFileSync(join(CONTENT_DIR, file), 'utf8'));
    const slug = meta.slug || file.replace(/\.md$/, '');
    if (!/^[a-z0-9-]+$/.test(slug)) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date || '')) continue;
    if (!meta.title) continue;
    const type = meta.type || 'articles';
    items.push({
      text: meta.title,
      kaynak: TYPE_LABELS[type] || 'HPAnalytic yayını',
      tarih: meta.date,
      dogrulama: 'dogrulanmis',
      href: `/yazi/${slug}.html`
    });
  }
  return items.sort((a, b) => b.tarih.localeCompare(a.tarih));
}

async function externalItems() {
  const url = process.env.HPA_TICKER_SOURCE_URL;
  if (!url) return { items: [], notes: [] };
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return { items: [], notes: [`harici kaynak HTTP ${res.status} — atlandı`] };
    const json = await res.json();
    const audit = auditItems(json, Date.now());
    return {
      items: audit.kept,
      notes: [
        ...audit.dropped.map((d) => `harici madde #${d.index}: ${d.reason} — yayınlanmaz`),
        ...(audit.dropped.some((d) => d.index === -1) ? [] : [])
      ]
    };
  } catch (e) {
    return { items: [], notes: [`harici kaynak erişilemedi (${e.message}) — atlandı`] };
  }
}

function seed() {
  return {
    schema: TICKER_SCHEMA,
    available: false,
    reason: 'SEED_NO_SOURCE',
    fetched_at: null,
    publication_authorized: false,
    items: []
  };
}

const local = localItems();
const external = await externalItems();
const items = [...external.items, ...local];

console.log(`ticker-feed: yerel ${local.length} makale, harici ${external.items.length} madde`);
for (const n of external.notes) console.log(`  not: ${n}`);

if (!publish || items.length === 0) {
  writeFileSync(OUT, JSON.stringify(seed(), null, 2) + '\n');
  console.log('ticker-feed: fail-closed seed yazıldı (available=false)');
  process.exit(0);
}

const candidate = {
  schema: TICKER_SCHEMA,
  available: true,
  reason: null,
  fetched_at: new Date().toISOString(),
  publication_authorized: true,
  ttl_minutes: 30,
  items
};

const audit = auditItems(candidate, Date.now());
if (!audit.fresh || audit.dropped.length > 0 || audit.kept.length === 0) {
  writeFileSync(OUT, JSON.stringify(seed(), null, 2) + '\n');
  console.error('ticker-feed: aday feed sözleşmeye aykırı — fail-closed seed yazıldı');
  for (const d of audit.dropped) console.error(`  düşen: #${d.index} ${d.reason}`);
  process.exit(1);
}

writeFileSync(OUT, JSON.stringify(candidate, null, 2) + '\n');
console.log(`ticker-feed: ${candidate.items.length} maddeyle yayın feed'i yazıldı (TTL ${candidate.ttl_minutes} dk)`);
