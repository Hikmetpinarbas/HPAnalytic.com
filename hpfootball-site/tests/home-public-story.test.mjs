import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const home = await readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');

test.skip('homepage promotes the newest admitted public story even when no analysis story is published', () => {
  assert.match(home, /const featuredStory=.*\?\? articles\[0\]/);
  assert.match(home, /featuredStory\.data\.title/);
});

test('homepage does not render empty or duplicate archive scaffolding', () => {
  assert.doesNotMatch(home, /Yeni analizler yayınlandığında burada görünecek/);
  assert.doesNotMatch(home, /Postmatch first\./);
  assert.doesNotMatch(home, /Living football archive\./);
});
