import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { isPublicEditorialItem } from '../src/lib/site-editorial-status.mjs';
import { resolvePublicNextQuestion } from '../src/lib/next-question.mjs';

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
  assert.match(page, /resolvePublicNextQuestion\(nextQuestion, publicArticleIds\)/);
  assert.match(page, /\{safeNextQuestion&&<aside/);
  const admitted = new Set([...entries].filter(([, entry]) => isPublicEditorialItem(entry.data)).map(([id]) => id));
  for (const [id, article] of entries) {
    if (!isPublicEditorialItem(article.data) || !article.target) continue;
    assert.match(article.target, /^\/articles\/[a-z0-9-]+$/, `Invalid nextQuestion destination in ${id}`);
    const targetId = article.target.slice('/articles/'.length);
    const destination = entries.get(targetId);
    if (!destination || !isPublicEditorialItem(destination.data)) {
      assert.equal(resolvePublicNextQuestion({href: article.target}, admitted), null, `${id} must suppress unadmitted target ${targetId}`);
    } else {
      assert.equal(resolvePublicNextQuestion({href: article.target}, admitted)?.href, article.target);
    }
  }
});

test('nextQuestion rejects external, malformed, and unadmitted paths', () => {
  const ids = new Set(['admitted']);
  for (const href of ['https://evil.test/articles/admitted', '//evil.test', '/articles/../admitted', '/articles/missing', '/articles/admitted?x=1', '/articles/admitted/']) {
    assert.equal(resolvePublicNextQuestion({href}, ids), null, href);
  }
  assert.equal(resolvePublicNextQuestion({href:'/articles/admitted'}, ids)?.href, '/articles/admitted');
});
