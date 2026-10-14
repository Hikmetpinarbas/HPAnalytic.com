import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../src/middleware.ts';

test('middleware exists and allows public access', async () => {
  const next = async () => new Response('ok', { status: 200 });
  const ctx = {
    url: new URL('https://hpanalytic.com/articles/some-article'),
    locals: { runtime: { env: {} } },
    cookies: { get: () => undefined },
  };
  const res = await onRequest(ctx, next);
  assert.equal(res.status, 200);
});

test('middleware blocks unauthenticated access to /control paths', async () => {
  const next = async () => new Response('ok', { status: 200 });
  for (const p of ['/control', '/control/', '/control/content']) {
    const ctx = {
      url: new URL(`https://hpanalytic.com${p}`),
      locals: { runtime: { env: {} } },
      cookies: { get: () => undefined },
    };
    const res = await onRequest(ctx, next);
    assert.equal(res.status, 401, `Failed to block ${p}`);
  }
});

test('middleware allows authenticated access to /control paths', async () => {
  const next = async () => new Response('ok', { status: 200 });
  const ctx = {
    url: new URL('https://hpanalytic.com/control/content'),
    locals: { runtime: { env: { HPA_EDITORIAL_TOKEN: 'secret123' } } },
    cookies: { get: (name) => name === 'HPA_EDITORIAL_TOKEN' ? { value: 'secret123' } : undefined },
  };
  const res = await onRequest(ctx, next);
  assert.equal(res.status, 200);
});
