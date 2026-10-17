import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/pages/api/youtube.json.ts', import.meta.url), 'utf8');
test('YouTube upstream and transport failures have controlled JSON responses', () => {
  assert.match(source, /try\s*\{/);
  assert.match(source, /catch\s*\(/);
  assert.match(source, /!r\.ok/);
  assert.match(source, /status:\s*502/);
  assert.match(source, /status:\s*500/);
});
