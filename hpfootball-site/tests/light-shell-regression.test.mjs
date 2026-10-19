import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The light header regressed once because a later rule re-declared a dark background.
// The cascade winner is the last declaration of the same selector, so check the last one.
const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const lastBackground = (selector) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rules = [...css.matchAll(new RegExp(`(?:^|[}\\s])${esc}\\s*\\{([^}]*)\\}`, 'g'))].map((m) => m[1]);
  const withBg = rules.filter((r) => /background\s*:/.test(r));
  assert.ok(withBg.length, `${selector} declares a background`);
  return /background\s*:\s*([^;]+)/.exec(withBg.at(-1))[1].trim();
};
const isDark = (v) => /^#(?:0[0-9a-f]{5}|1[0-9a-f]{5})$/i.test(v.trim()) || /^rgba?\(\s*11\s*,\s*15\s*,\s*18\s*[,)]/i.test(v.trim());

for (const sel of ['.site-header', '.publication-masthead']) {
  test(`${sel}: the winning background is dark`, () => {
    const raw = lastBackground(sel); const bg = raw === 'var(--surface)' ? '#141B20' : raw;
    assert.ok(isDark(bg), `${sel} ends on a dark background: ${bg}`);
  });
}

test('pitch disclaimer is not left on the page ink over the dark pitch canvas', () => {
  assert.match(css, /\.hp-pitch__disclaimer\s*\{[^}]*color\s*:\s*#e7e2d6/i);
});

test('home copy is bound to accessible dark theme text tokens', () => {
  assert.match(css, /\.featured-story>p:not\(\.featured-meta\), \.featured-story>p:last-of-type, \.featured-question p \{ color: var\(--ink-2\); \}/);
  assert.match(css, /\.launch-directory__links a>span:last-child \{ color: var\(--gold\); \}/);
});
