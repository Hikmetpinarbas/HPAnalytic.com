import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const headersFile = await readFile(new URL('../public/_headers', import.meta.url), 'utf8');
const middleware = await readFile(new URL('../src/middleware.ts', import.meta.url), 'utf8');

const fromMiddleware = Object.fromEntries(
  [...middleware.matchAll(/'([A-Za-z-]+)':\s*(?:\n\s*)?"([^"]+)"|'([A-Za-z-]+)':\s*'([^']+)'/g)]
    .map((m) => [m[1] ?? m[3], m[2] ?? m[4]]),
);
const fromStatic = Object.fromEntries(
  headersFile.split('\n').filter((l) => /^\s+[A-Za-z-]+:/.test(l)).map((l) => {
    const i = l.indexOf(':');
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  }),
);

test('prerendered pages declare the same security headers as the middleware', () => {
  assert.match(headersFile, /^\/\*$/m);
  for (const name of ['Strict-Transport-Security', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'X-Frame-Options', 'Content-Security-Policy']) {
    assert.ok(fromMiddleware[name], `middleware sets ${name}`);
    assert.equal(fromStatic[name], fromMiddleware[name], `${name} matches`);
  }
});
