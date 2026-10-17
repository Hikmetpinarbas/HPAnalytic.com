import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const logo = await readFile(new URL('../src/components/Logo.astro', import.meta.url), 'utf8');
const mobileNav = await readFile(new URL('../src/components/MobileNavigation.astro', import.meta.url), 'utf8');
const article = await readFile(new URL('../src/pages/articles/[...id].astro', import.meta.url), 'utf8');

test('Logo accessibility defect: aria-label overrides visible text (Label in Name violation)', () => {
  // If the logo link has aria-label, it overrides the visual brand name.
  // The fix is to remove the aria-label from the <a> tag since the text inside is sufficient.
  assert.doesNotMatch(logo, /<a[^>]*aria-label="[^"]*"[^>]*class="brand"/);
});

test('Mobile navigation accessibility defect: aria-label overrides visible MENU text', () => {
  // The button text is "MENU" but aria-label="Menüyü aç" overrides it.
  assert.doesNotMatch(mobileNav, /aria-label="Menüyü aç"/);
});

test('Article page accessibility defect: div with aria-label lacks a valid role', () => {
  // div cannot have aria-label without a role. Should be a <section>, <nav>, or role="group"/"region".
  assert.doesNotMatch(article, /<div(?![^>]*role=)[^>]*class="article-reader-tools"[^>]*aria-label=/);
  // Expect it to be a <nav> or <section> or have role="group" if it uses aria-label
});

test('Article page accessibility defect: button aria-label overrides visible text', () => {
  // Share button visible text is "YAZIYI PAYLAŞ" but aria-label overrides it.
  assert.doesNotMatch(article, /<button[^>]*class="article-share-button"[^>]*aria-label=/);
});
