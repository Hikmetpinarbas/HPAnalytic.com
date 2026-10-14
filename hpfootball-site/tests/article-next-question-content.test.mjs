import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { isPublicEditorialItem } from '../src/lib/site-editorial-status.mjs';

const directory = new URL('../src/content/articles/', import.meta.url);
const entries = new Map(readdirSync(directory).filter(name => name.endsWith('.md')).map(name => {
  const source = readFileSync(new URL(name, directory), 'utf8');
  const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---/m)?.[1] ?? '';
  const field = key => frontmatter.match(new RegExp('^' + key + ':\\s*(.+)$', 'm'))?.[1]?.trim();
  const target = frontmatter.match(/^nextQuestion:\s*\n(?:[ \t]+.*\n)*?[ \t]+href:\s*["']?([^"'\s]+)["']?/m)?.[1];
  return [name.slice(0, -3), {data: {
    editorial_status: field('editorial_status'),
    qualityStatus: field('qualityStatus'),
    sourceClaimsValidated: field('sourceClaimsValidated') === 'true',
  }, target}];
}));

test('public article nextQuestion destinations must be admitted or suppressed by guard', () => {
  const page = readFileSync(new URL('../src/pages/articles/[...id].astro', import.meta.url), 'utf8');
  assert.match(page, /publicArticleIds\.has\(nextQuestion\.href\.slice/);
  assert.match(page, /\{safeNextQuestion&&<aside/);
  for (const [id, article] of entries) {
    if (!isPublicEditorialItem(article.data) || !article.target) continue;
    assert.match(article.target, /^\/articles\/[a-z0-9-]+$/, `Invalid nextQuestion destination in ${id}`);
    const targetId = article.target.slice('/articles/'.length);
    const destination = entries.get(targetId);
    if (!destination || !isPublicEditorialItem(destination.data)) {
      assert.ok(page.includes('safeNextQuestion'), `${id} must fail closed for unadmitted target ${targetId}`);
    }
  }
});
