import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { buildVisibleNavigation } from '../src/lib/site-surfaces.mjs';
import { isPublicEditorialItem } from '../src/lib/site-editorial-status.mjs';

// P0 closure (2026-10-15): empty sections stay out of the main menu. The rule lives in
// buildVisibleNavigation; these tests stop a hard-coded section link from bypassing it.
const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
const SECTION_HREFS = ['/analysis', '/scouting', '/visual-lab', '/research', '/culture'];

const navBlocks = [
  ...layout.matchAll(/<nav class="desktop-nav"[\s\S]*?<\/nav>/g),
  ...layout.matchAll(/<nav class="footer-nav" aria-label="Site bölümleri"[\s\S]*?<\/nav>/g),
].map((m) => m[0]);

test('desktop and footer section menus render only the computed navigation', () => {
  assert.equal(navBlocks.length, 2);
  for (const block of navBlocks) {
    assert.match(block, /navigation\]?\.map\(/);
    for (const href of SECTION_HREFS) assert.ok(!block.includes(`href="${href}"`), `${href} is hard-coded in a menu`);
  }
});

test('mobile menu is fed from the same computed navigation', () => {
  assert.match(layout, /<MobileNavigation navigation=\{archiveLink \? \[\.\.\.navigation, archiveLink\] : navigation\} \/>/);
});

// Mirror of BaseLayout's admission: a section is listed only if it has a public article.
function frontMatter(file) {
  const raw = readFileSync(new URL(`../src/content/articles/${file}`, import.meta.url), 'utf8');
  const fm = raw.match(/^---\n([\s\S]*?)\n---/)[1];
  const value = (k) => (fm.match(new RegExp(`^${k}:\\s*(.+)$`, 'm')) || [])[1]?.replace(/^"|"$/g, '').trim();
  return {
    section: value('section'),
    draft: value('draft') === 'true',
    editorial_status: value('editorial_status'),
    qualityStatus: value('qualityStatus'),
    sourceClaimsValidated: value('sourceClaimsValidated') === 'true',
  };
}

test('with the current corpus, no menu item points to an empty section', () => {
  const sections = {};
  for (const file of readdirSync(new URL('../src/content/articles/', import.meta.url)).filter((f) => f.endsWith('.md'))) {
    const data = frontMatter(file);
    if (data.draft || !isPublicEditorialItem(data)) continue;
    sections[data.section] = (sections[data.section] || 0) + 1;
  }
  const nav = buildVisibleNavigation({ articleSections: sections, researchCount: 0, visualCount: 0 }).map((x) => x.href);
  for (const href of nav) {
    if (href === '/about') continue;
    const key = href.slice(1);
    assert.ok((sections[key] || 0) > 0, `${href} is in the menu but has no public article`);
  }
  assert.ok(nav.includes('/about'));
});
