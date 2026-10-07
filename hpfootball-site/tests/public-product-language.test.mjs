import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const files = {
  mechanism: await readFile(new URL('../src/components/MechanismCard.astro', import.meta.url), 'utf8'),
  research: await readFile(new URL('../src/pages/research.astro', import.meta.url), 'utf8'),
  visual: await readFile(new URL('../src/pages/visual-lab.astro', import.meta.url), 'utf8'),
  archive: await readFile(new URL('../src/pages/archive.astro', import.meta.url), 'utf8'),
  scouting: await readFile(new URL('../src/pages/scouting.astro', import.meta.url), 'utf8'),
};

test('public evidence object does not expose internal presentation-model jargon', () => {
  assert.doesNotMatch(files.mechanism, /PRESENTATION VIEW MODEL|Provenance:/);
  assert.match(files.mechanism, /KANIT NESNESİ/);
  assert.match(files.mechanism, /Kaynak zinciri:/);
});

test('core product surfaces use reader-facing Turkish headings', () => {
  assert.doesNotMatch(files.research, /Question first|Source pool dynamic|Admission fixed/);
  assert.doesNotMatch(files.visual, /2D football intelligence|without false certainty/);
  assert.doesNotMatch(files.archive, /Living football archive/);
  assert.doesNotMatch(files.scouting, />REPORTS</);
});
