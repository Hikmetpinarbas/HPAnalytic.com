import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const config = await readFile(new URL('../astro.config.mjs', import.meta.url), 'utf8');

test('unused SESSION KV and IMAGES bindings stay out of the generated Worker config', () => {
  // `session` is an Astro option, not an adapter option: inside cloudflare({...}) it is ignored.
  assert.match(config, /^\s*session\s*:\s*false\s*,/m);
  assert.doesNotMatch(config, /cloudflare\(\{[^}]*session/);
  assert.match(config, /imageService\s*:\s*'passthrough'/);
});
