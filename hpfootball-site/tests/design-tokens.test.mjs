import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { typeScale, passesResizeRule } from '../src/lib/fluid-type.mjs';

const css = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const token = (name) => css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();

function luminance(hex) {
  const [r, g, b] = hex.match(/[0-9a-f]{2}/gi).map((h) => parseInt(h, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('text tokens meet WCAG AA (4.5:1) on page and surface backgrounds', () => {
  for (const fg of ['ink', 'ink-2', 'muted', 'faint', 'gold-2', 'gold', 'blue']) {
    for (const bg of ['bg', 'surface', 'surface-2']) {
      const ratio = contrast(token(fg), token(bg));
      assert.ok(ratio >= 4.5, `--${fg} on --${bg} = ${ratio.toFixed(2)}`);
    }
  }
});

test('focus indicator meets 3:1 non-text contrast against the page', () => {
  assert.ok(contrast(token('focus'), token('bg')) >= 3);
  assert.ok(contrast(token('focus'), token('focus-ink')) >= 4.5);
});

test('CSS type scale is exactly the generated fluid scale', () => {
  for (const step of typeScale()) {
    assert.equal(token(`step-${step.step}`), step.clamp, `--step-${step.step}`);
  }
});

test('every fluid step stays zoomable to 200% (WCAG 1.4.4)', () => {
  for (const step of typeScale()) assert.ok(passesResizeRule(step), `step ${step.step}`);
});

test('no text is set below 12px (Contract §7: avoid tiny copy)', () => {
  const pxSizes = [...css.matchAll(/font-size:\s*([\d.]+)px/g)].map((m) => Number(m[1]));
  const remSizes = [...css.matchAll(/(?:font-size|--label):\s*([\d.]+)rem/g)].map((m) => Number(m[1]) * 16);
  for (const size of [...pxSizes, ...remSizes]) assert.ok(size >= 12, `${size}px`);
  const svgLabel = Number(css.match(/\.node-label \{ font: \d+ (\d+)px/)[1]);
  assert.ok(svgLabel >= 12);
});

test('no CSS case transforms: lang="tr" would render English "i" as "İ" (ANALYSİS)', () => {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(withoutComments, /text-transform\s*:/);
});

test('large headings may wrap long tokens under 200% text resize', () => {
  assert.match(css, /h1, h2, h3 \{[^}]*overflow-wrap:\s*break-word/s);
});
