import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const route = await readFile(new URL('../src/pages/api/youtube.json.ts', import.meta.url), 'utf8');

test('youtube endpoint reads Worker env from cloudflare:workers, not the removed locals.runtime', () => {
  assert.match(route, /from 'cloudflare:workers'/);
  assert.doesNotMatch(route, /\(locals as any\)|locals\)?\.runtime\?/);
});

test('youtube endpoint fails closed: 503 without key, 502 when upstream is unreachable', () => {
  assert.match(route, /not_configured[\s\S]*?,503\)/);
  assert.match(route, /catch[\s\S]*upstream_unavailable[\s\S]*?,502\)/);
});
