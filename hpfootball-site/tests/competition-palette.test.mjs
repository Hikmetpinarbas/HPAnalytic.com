import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveEditorialPalette } from '../src/lib/competition-palette.mjs';

for (const club of ['galatasaray', 'fenerbahce', 'besiktas', 'trabzonspor', 'turkiye']) {
  test(`${club}: European/international content uses club palette`, () => {
    assert.deepEqual(resolveEditorialPalette({ club, competitionScope: 'europe' }), { palette: 'club', club });
  });
  test(`${club}: domestic league content uses HPAnalytic palette`, () => {
    assert.deepEqual(resolveEditorialPalette({ club, competitionScope: 'league' }), { palette: 'editorial', club: undefined });
  });
}

test('international competition supports the national palette', () => {
  assert.deepEqual(resolveEditorialPalette({ club: 'turkiye', competitionScope: 'international' }), { palette: 'club', club: 'turkiye' });
});

test('unknown scope and unknown club remain on editorial palette', () => {
  assert.deepEqual(resolveEditorialPalette({ club: 'galatasaray' }), { palette: 'editorial', club: undefined });
  assert.deepEqual(resolveEditorialPalette({ club: 'other', competitionScope: 'europe' }), { palette: 'editorial', club: undefined });
});

test('layout and stylesheet only enable team palette via explicit competition scope', async () => {
  const layout = await readFile(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');
  assert.match(layout, /data-palette=\{palette\.palette\}/);
  assert.match(css, /\[data-palette="club"\]\[data-club="turkiye"\]/);
  assert.match(css, /\[data-palette="club"\]\[data-club="galatasaray"\]/);
});

test('all five colour pairs exist in the shared CSS design tokens', async () => {
  const css = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');
  for (const club of ['galatasaray', 'fenerbahce', 'besiktas', 'trabzonspor', 'turkiye']) {
    assert.ok(css.includes(`data-club="${club}"] {`) && css.includes(`--club-primary:`) && css.includes(`--club-secondary:`));
  }
  assert.match(css, /border-image: linear-gradient\(90deg, var\(--club-primary\) 50%, var\(--club-secondary\) 50%\) 1/);
});
