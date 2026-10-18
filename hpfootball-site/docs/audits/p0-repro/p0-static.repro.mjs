// P0 Astro integration audit — static reproductions (source only, no build needed).
// Each test asserts the CORRECT contract, so it FAILS while the defect exists.
// Deliberately outside `tests/*.test.mjs` so `npm test` / CI stay green until a fix lands.
// Run from hpfootball-site/:  node --test docs/audits/p0-repro/p0-static.repro.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

// ---- WCAG helpers --------------------------------------------------------
const hex = (value) => { const h = value.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const channel = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const css = read('src/styles/global.css');
const rootVars = Object.fromEntries([...css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
// Last `color:` declared for a selector wins (cascade order, equal specificity).
const RULES = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selectors: m[1].split(',').map((x) => x.trim()), body: m[2] }));
function lastColor(selector) {
  const colors = RULES.filter((r) => r.selectors.includes(selector))
    .flatMap((r) => [...r.body.matchAll(/(?:^|;)\s*color:\s*([^;]+)/g)].map((m) => m[1].trim()));
  const value = colors.at(-1);
  if (!value) return null;
  const v = value.match(/var\(--([a-z0-9-]+)\)/i);
  return v ? rootVars[v[1]] : value;
}

test('F01 article meta text on the light shell meets WCAG AA 4.5:1', () => {
  const bg = hex(rootVars.bg);
  for (const selector of ['.article-topics span', '.article-disclosure summary', '.article-counterevidence li']) {
    const color = lastColor(selector);
    assert.ok(color, `${selector} has a color`);
    const ratio = contrast(hex(color), bg);
    assert.ok(ratio >= 4.5, `${selector} ${color} on ${rootVars.bg} = ${ratio.toFixed(2)}:1 (< 4.5)`);
  }
});

test('F02 open evidence disclosure does not paint a dark-theme panel on the light shell', () => {
  const m = css.match(/\.article-disclosure\[open\] \.disclosure-ghost\{([^}]*)\}/);
  assert.ok(m, 'rule present');
  assert.doesNotMatch(m[1], /background:rgba\(12,10,7/, 'legacy dark ghost background still applied');
});

// ---- Visual admission (Grafik Fabrikası) ---------------------------------
const ADMITTED = ['OWNED', 'LICENSED', 'EDITORIAL_LICENSED', 'PUBLIC_DOMAIN', 'ORIGINAL'];
const front = (md) => md.split(/^---$/m)[1] ?? '';
const isPublished = (fm) => /editorial_status:\s*PUBLISHED/.test(fm) && /qualityStatus:\s*HUMAN_APPROVED/.test(fm) && /sourceClaimsValidated:\s*true/.test(fm) && !/draft:\s*true/.test(fm);

test('F03 every image in a public article body passes the same rights admission as visualAssets', () => {
  const dir = new URL('src/content/articles/', root);
  for (const file of readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
    const md = readFileSync(new URL(file, dir), 'utf8');
    const fm = front(md);
    if (!isPublished(fm)) continue;
    const body = md.split(/^---$/m).slice(2).join('---');
    const inline = [...body.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)].map((m) => m[1]);
    for (const src of inline) {
      const block = fm.match(new RegExp(`src:\\s*["']?${src.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}["']?[\\s\\S]*?rights_status:\\s*["']?([A-Z_]+)`));
      assert.ok(block && ADMITTED.includes(block[1]), `${file}: ${src} rendered without a visualAssets rights record`);
    }
  }
});

test('F04 the visual export gate is enforced on a public render or build path', () => {
  const files = [];
  const walk = (url) => { for (const e of readdirSync(url, { withFileTypes: true })) { const u = new URL(e.name + (e.isDirectory() ? '/' : ''), url); e.isDirectory() ? walk(u) : files.push(u); } };
  walk(new URL('src/', root)); walk(new URL('scripts/', root));
  const users = files.filter((u) => !u.pathname.endsWith('visual-export-gate.mjs') && /assessVisualExport|visual-export-gate/.test(readFileSync(u, 'utf8')));
  assert.ok(users.length > 0, 'assessVisualExport is only referenced by its own unit test');
});

test('F05 service worker serves cache-first only for content-hashed assets', () => {
  const sw = read('public/sw.js');
  const navigateEnd = sw.indexOf('return;', sw.indexOf("request.mode === 'navigate'"));
  const cacheFirst = sw.slice(navigateEnd + 'return;'.length);
  assert.match(cacheFirst, /_astro\//, 'cache-first branch must be limited to /_astro/* (hashed); /visuals/*, /social-card.png and /api/* are pinned forever today');
});

test('F08 TacticalCanvas ids are unique per instance (carousel / repeated-use readiness)', () => {
  const src = read('src/components/TacticalCanvas.astro');
  const literalIds = [...src.matchAll(/\sid="([^"{]+)"/g)].map((m) => m[1]);
  assert.deepEqual(literalIds, [], `hard-coded ids collide when rendered twice: ${literalIds.join(', ')}`);
});
