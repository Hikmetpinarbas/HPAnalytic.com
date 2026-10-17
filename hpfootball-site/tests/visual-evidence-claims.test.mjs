import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Epistemic contract for public visuals (HP Visual Foundry V0): statistical marks need units AND
// source lineage; nothing may be shown as verified without a source; no invented precision.
const src = new URL('../src/', import.meta.url);

async function astroFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) { if (entry.name !== 'studio') out.push(...(await astroFiles(p))); }
    else if (entry.name.endsWith('.astro')) out.push(p);
  }
  return out;
}
const files = await astroFiles(src.pathname);
const read = async (p) => [p.slice(src.pathname.length), await readFile(p, 'utf8')];
const sources = await Promise.all(files.map(read));

test('no public component hardcodes a metric as verified without a source id', () => {
  for (const [name, text] of sources) {
    for (const obj of text.match(/\{[^{}]*status:\s*['"]verified['"][^{}]*\}/g) ?? []) {
      assert.match(obj, /source(Id|_id)\s*:/, `${name}: verified metric without source lineage: ${obj.slice(0, 120)}`);
    }
  }
});

test('public pages do not hardcode decimal measurements with units as evidence', () => {
  for (const [name, text] of sources.filter(([n]) => n.startsWith('pages/'))) {
    assert.doesNotMatch(text, /value:\s*['"][±+-]?\d+\.\d+['"]\s*,\s*unit:/, `${name}: literal measured value in page source`);
  }
});

test('the rejected line-break monogram is not reintroduced outside the current production logo', () => {
  for (const [name, text] of sources) {
    if (name === 'components/Logo.astro') continue;
    assert.doesNotMatch(text, /class="hp-break"/, `${name}: reuses the rejected HP line-break monogram`);
  }
});
