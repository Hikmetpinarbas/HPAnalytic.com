import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const route = await readFile(new URL('../src/pages/control/content.astro', import.meta.url), 'utf8');

test('internal content control answers 404 in production before loading local sources', () => {
  const guard = route.indexOf('if(import.meta.env.PROD) return new Response(null,{status:404');
  assert.ok(guard > 0, 'production guard missing');
  for (const loader of ['content-control.mjs', 'article-inbox.mjs']) {
    const at = route.indexOf(loader);
    assert.ok(at > guard, `${loader} must load only after the production guard`);
  }
  assert.doesNotMatch(route, /^import\s.*(content-control|article-inbox)\.mjs/m, 'local loaders must not be static imports');
});
