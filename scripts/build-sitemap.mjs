import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const defteri = JSON.parse(readFileSync('content/yayin-defteri.json', 'utf-8'));
const adaylar = JSON.parse(readFileSync('content/yayin-adaylari.json', 'utf-8'));
const Beklenen = new Set(defteri.entries.map(e => e.slug));
const Aday = new Set(adaylar.inceleme_adaylari.map(a => a.slug));

const OZEL = [
  { loc: 'https://hpanalytic.com/', title: 'HPAnalytic' },
  { loc: 'https://hpanalytic.com/lab', title: 'Data Lab' }
];

const satirlar = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
for (const o of OZEL) satirlar.push(`  <url><loc>${o.loc}</loc></url>`);
for (const slug of [...Beklenen].sort()) {
  satirlar.push(`  <url><loc>https://hpanalytic.com/yazi/${slug}.html</loc></url>`);
}
satirlar.push('</urlset>', '');
writeFileSync('dist/sitemap.xml', satirlar.join('\n'), 'utf-8');
const h = createHash('sha256').update(satirlar.join('\n')).digest('hex');
console.log(`\u2713 dist/sitemap.xml: ${Beklenen.size} makale + ${OZEL.length} \u00f6zel yol (gozden gecirme adayi disarda: ${Aday.size})`);
