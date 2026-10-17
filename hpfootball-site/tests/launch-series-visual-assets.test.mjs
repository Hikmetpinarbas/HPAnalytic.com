import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const assets = [
  ['kamera-kanit-siniri.svg', ['OBSERVED FRAME', 'UNKNOWN', 'CLAIM CEILING']],
  ['baski-baglamlari.svg', ['ETİKET', 'GÖZLEM', 'MEKANİZMA?', 'CLAIM CEILING']],
  ['karsi-pres-bes-saniye.svg', ['TOP KAYBI', '5 sn', 'TOP KAZANIMI', 'UNKNOWN']],
];

for (const [file, requiredText] of assets) {
  test(`${file} is a usable accessible explanatory SVG`, () => {
    const svg = readFileSync(new URL(`../public/visuals/launch-series-01/${file}`, import.meta.url), 'utf8');
    assert.match(svg, /^<svg\b/);
    assert.match(svg, /role="img"/);
    assert.match(svg, /aria-labelledby="[^"]+"/);
    assert.match(svg, /<title\b[^>]*>[^<]+<\/title>/);
    assert.match(svg, /<desc\b[^>]*>[^<]+<\/desc>/);
    assert.match(svg, /data-truth-role="EXPLANATORY_SCHEMATIC"/);
    for (const label of requiredText) assert.ok(svg.includes(label), `missing semantic label: ${label}`);
  });
}
