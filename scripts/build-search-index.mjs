import fs from 'fs';
import path from 'path';

const dir = 'content/yazilar';
const out = 'public/search-index.json';
const items = [];

fs.readdirSync(dir).filter(f => f.endsWith('.md')).forEach(f => {
  const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
  const title = (raw.match(/^title:\s*"(.*?)"/m) || [])[1] || f;
  const slug = f.replace('.md', '');
  const body = raw.replace(/^---[\s\S]*?---/, '').trim();
  const excerpt = body.split('\n').find(l => l.trim().length > 40)?.slice(0, 160) || '';
  items.push({
    title,
    slug,
    url: `/HPAnalytic.com/yazi/${slug}.html`,
    excerpt: excerpt.replace(/\*\*/g, '').replace(/\*/g, '')
  });
});

fs.writeFileSync(out, JSON.stringify(items, null, 2));
console.log(`✓ ${items.length} yazı → ${out}`);
