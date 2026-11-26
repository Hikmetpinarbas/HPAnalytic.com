// Yayın defteri kabul envanteri — gerçek build çıktısından üretilir.
// Kullanım: npm run build && node scripts/make-acceptance-inventory.mjs
import { readdirSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve2();
function resolve2() {
  return new URL('..', import.meta.url).pathname;
}
const OUT_PATH = join(ROOT, 'docs', 'YAYIN-DEFTERI-KABUL-ENVANTERI.md');

function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
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

const dir = join(ROOT, 'content', 'yazilar');
const rows = [];
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.md')) continue;
  const meta = parseFrontmatter(readFileSync(join(dir, f), 'utf8'));
  if (!meta) { rows.push({ file: f }); continue; }
  const slug = meta.slug || f.replace(/\.md$/, '');
  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(meta.date || '');
  const distHtml = existsSync(join(ROOT, 'dist', 'yazi', slug + '.html'));
  const dataPkg = existsSync(join(ROOT, 'public', 'assets', 'data', slug));
  rows.push({
    file: f, slug, title: meta.title, type: meta.type || 'articles',
    date: meta.date || '', dateOk, distHtml, dataPkg,
    valid: !!distHtml && !!meta.title
  });
}
rows.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

let out = '# Yayın Defteri — Kabul Envanteri\n\n';
out += '- Kaynak: `content/yazilar/*.md` → build: `dist/yazi/<slug>.html`\n';
out += '- Üretim: ' + new Date().toISOString() + ' (build çıktısından; veri uydurulmaz)\n';
out += '- Kabul kuralı (build-yazi.mjs sözleşmesi): title + geçerli slug + dist çıktısı.\n';
out += '- Tarih kuralı: frontmatter `date` YYYY-MM-DD ise makale ana sayfa "Son Analizler" (HPA_LATEST) akışına girer; eksikse sayfa yayınlanır ama akışa giremez — ticker besleme adaptörü de yalnızca tarihli makaleyi kullanır.\n';
out += '- Veri paketi sütunu: `public/assets/data/<slug>/` varlığı (bilgi amaçlı; paketi olmayan makaleler reddedilmez).\n\n';
out += '| # | Başlık | Tür | Tarih | Slug | dist HTML | Veri paketi | Akış | Durum |\n|---|---|---|---|---|---|---|---|---|\n';
let i = 0, accepted = 0, rejected = 0, noFlow = 0;
for (const r of rows) {
  if (!r.slug) { out += '| — | (okunamayan dosya) | — | — | ' + r.file + ' | — | — | — | RED (frontmatter yok) |\n'; rejected++; continue; }
  i++;
  const status = r.valid ? 'KABUL' : 'RED';
  if (r.valid) accepted++; else rejected++;
  const flow = r.dateOk ? 'var' : 'YOK (tarih eksik)';
  if (r.valid && !r.dateOk) noFlow++;
  out += '| ' + i + ' | ' + (r.title || '—').replace(/\|/g, '/') + ' | ' + r.type + ' | ' + (r.dateOk ? r.date : 'eksik') + ' | ' + r.slug + ' | ' + (r.distHtml ? 'var' : 'YOK') + ' | ' + (r.dataPkg ? 'var' : '—') + ' | ' + flow + ' | ' + status + ' |\n';
}
out += '\nToplam: ' + rows.length + ' kaynak dosya → ' + accepted + ' kabul (' + noFlow + ' tanesi tarih eksikliğiyle derleme akışı dışı), ' + rejected + ' red.\n';
out += '\n## Aksiyon önerisi\n\n';
out += '- Tarih eksikliği olan maç dosyalarına frontmatter `date` (YYYY-MM-DD) eklendiğinde hem ana sayfa akışına girer hem ticker beslemesine otomatik düşer.\n';
out += '- Bu envanter statik bir anlık görüntüdür; yeniden üretim için build sonrası `node scripts/make-acceptance-inventory.mjs` çalıştırılmalıdır.\n';
writeFileSync(OUT_PATH, out);
console.log('kabul envanteri yazıldı: kabul=' + accepted + ' red=' + rejected + ' akış-dışı=' + noFlow);
