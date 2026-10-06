import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { EVIDENCE_CLASSES, evidenceMeta, humanizeCeiling } from '../src/lib/evidence.mjs';

test('every content-schema evidence class has a visual mapping', async () => {
  const schema = await readFile(new URL('../src/content.config.ts', import.meta.url), 'utf8');
  const declared = schema.match(/evidenceClass:z\.enum\(\[([^\]]+)\]/)[1].match(/'([A-Z_]+)'/g).map((s) => s.slice(1, -1));
  assert.deepEqual(Object.keys(EVIDENCE_CLASSES).sort(), declared.sort());
});

test('evidence classes never look identical (Contract §6): distinct stroke per class', () => {
  const strokes = Object.values(EVIDENCE_CLASSES).map((c) => c.stroke);
  assert.equal(new Set(strokes).size, strokes.length);
});

test('every non-solid stroke has a CSS rule', async () => {
  const css = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');
  for (const { stroke } of Object.values(EVIDENCE_CLASSES)) {
    if (stroke === 'solid') continue;
    assert.match(css, new RegExp(`\\.evidence\\[data-stroke="${stroke}"\\]`));
  }
});

test('unknown classes fall back to the weakest claim, not the strongest', () => {
  assert.equal(evidenceMeta('NOT_A_CLASS').label, 'EDITORIAL');
});

test('claim ceilings are humanized for readers', () => {
  assert.equal(humanizeCeiling('EVENT_OBSERVABLE_ONLY'), 'Event observable only');
  assert.equal(humanizeCeiling(''), '');
});
