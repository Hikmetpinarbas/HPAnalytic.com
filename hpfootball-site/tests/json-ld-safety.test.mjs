import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const src = new URL('../src/', import.meta.url);
const hostile = {
  '@type': 'Article',
  headline: 'Pres </script><script>window.__hpInjected=1</script>',
  description: '<!-- yorum --> & </SCRIPT > \u2028satır\u2029',
};

test('JSON-LD serializer cannot close the surrounding script element', async () => {
  const { serializeJsonLd } = await import('../src/lib/json-ld.mjs');
  const out = serializeJsonLd(hostile);
  assert.doesNotMatch(out, /<\/?script/i, 'raw </script> survives');
  assert.doesNotMatch(out, /<!--/, 'raw HTML comment opener survives');
  assert.doesNotMatch(out, /[<>\u2028\u2029]/, 'unescaped <, > or line separators');
  assert.deepEqual(JSON.parse(out), hostile, 'escaping must not change the data');
});

test('every JSON-LD block in src goes through serializeJsonLd', async () => {
  const offenders = [];
  for (const entry of await readdir(src, { recursive: true })) {
    const name = String(entry);
    if (!/\.astro$/.test(name)) continue;
    const source = await readFile(join(src.pathname, name), 'utf8');
    for (const block of source.match(/<script[^>]*ld\+json[^>]*>/g) ?? []) {
      if (!/set:html=\{serializeJsonLd\(/.test(block)) offenders.push(`${name}: ${block}`);
    }
  }
  assert.deepEqual(offenders, []);
});
