import test from 'node:test';
import assert from 'node:assert/strict';
import { GET } from '../src/pages/api/youtube.json.ts';

test('youtube API fails gracefully when network request fails', async () => {
  const locals = { runtime: { env: { YOUTUBE_API_KEY: 'test-key' } } };

  // mock fetch
  global.fetch = async () => { throw new TypeError('fetch failed'); };

  const res = await GET({ locals });
  assert.equal(res.status, 500);
  const data = await res.json();
  assert.equal(data.status, 'error');
});

test('youtube API fails gracefully when non-JSON is returned', async () => {
  const locals = { runtime: { env: { YOUTUBE_API_KEY: 'test-key' } } };

  // mock fetch
  global.fetch = async () => ({
    ok: true,
    status: 200,
    text: async () => '<html>bad gateway</html>',
    json: async () => { throw new SyntaxError('Unexpected token < in JSON at position 0'); }
  });

  const res = await GET({ locals });
  assert.equal(res.status, 500);
  const data = await res.json();
  assert.equal(data.status, 'error');
});

test('youtube API handles fetch failure code properly', async () => {
  const locals = { runtime: { env: { YOUTUBE_API_KEY: 'test-key' } } };

  // mock fetch
  global.fetch = async () => ({
    ok: false,
    status: 403,
    text: async () => 'error',
    json: async () => ({ error: { message: "forbidden" } })
  });

  const res = await GET({ locals });
  assert.equal(res.status, 502);
  const data = await res.json();
  assert.equal(data.status, 'error');
});

test('youtube API works when ok and valid json', async () => {
  const locals = { runtime: { env: { YOUTUBE_API_KEY: 'test-key' } } };

  // mock fetch
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ items: [] })
  });

  const res = await GET({ locals });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.items?.length, 0);
});
