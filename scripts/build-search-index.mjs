import fs from 'fs';
import path from 'path';

const dir = 'content/yazilar';
const out = 'public/search-index.json';
const items = [];

fs.readdirSync(dir).filter(f => f.endsWith('.md') && !f.endsWith('.bak')).forEach(f => {
  const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
  const meta = {};
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (m) {
    m[1].split('\n').forEach(line => {
      const i = line.indexOf(':');
      if (i > 0) meta[line.slice(0, i).trim()] = (line.slice(i + 1).trim() || '').replace(/^["']|["']$/g, '');
    });
  }
  const status = (meta.status || 'yayin').toLowerCase();
  if (status !== 'yayin' || meta.noindex === 'true') return;
  const title = meta.title || (raw.match(/^title:\s*"(.*?)"/m) || [])[1] || f;
  const slug = meta.slug || f.replace('.md', '');
  if (!/^[a-z0-9-]+$/.test(slug)) return;
  const body = raw.replace(/^---[\s\S]*?---/, '').trim();
  const excerpt = body.split('\n').find(l => l.trim().length > 40)?.slice(0, 160) || '';
  items.push({
    title,
    slug,
    url: `/yazi/${slug}.html`,
    excerpt: excerpt.replace(/\*\*/g, '').replace(/\*/g, '')
  });
});

items.sort((a, b) => a.slug.localeCompare(b.slug));
fs.writeFileSync(out, JSON.stringify(items, null, 2));
console.log(`\u2713 ${items.length} yaz\u0131 \u2192 ${out} (inceleme/iptal d\u0131\u015fta)`);
