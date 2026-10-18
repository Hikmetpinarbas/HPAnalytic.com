import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

function listFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

test('middleware exists and blocks every /control path', () => {
  const middleware = readFileSync(join(root, 'src/middleware.ts'), 'utf8');
  assert.match(middleware, /export const onRequest/);
  assert.match(middleware, /context\.url\.pathname === '\/control' \|\| context\.url\.pathname\.startsWith\('\/control\/'\)/);
  assert.match(middleware, /status: 404/);
});

test('no public page or layout links to /control', () => {
  const files = [
    ...listFiles(join(root, 'src/layouts')),
    ...listFiles(join(root, 'src/components')),
    ...listFiles(join(root, 'src/pages')).filter((f) => !f.includes('/control/')),
  ];
  for (const f of files) {
    const text = readFileSync(f, 'utf8');
    assert.ok(!/href="\/control/.test(text), `${f} links to /control`);
  }
});

test('middleware sets the baseline security headers', () => {
  const middleware = readFileSync(join(root, 'src/middleware.ts'), 'utf8');
  for (const h of ['Strict-Transport-Security', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'X-Frame-Options', 'Content-Security-Policy']) {
    assert.match(middleware, new RegExp(h));
  }
});
