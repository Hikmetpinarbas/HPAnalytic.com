// Floodlight v3 design-system contracts (replaces the v2 visual-lock tests listed in tests/retired/RETIRED.md).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { MATCH_PREVIEWS, featuredMatch } from '../src/data/match-previews.mjs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const css = read('src/styles/global.css');
const block = (sel) => css.match(new RegExp(`\\[data-club="${sel}"\\] \\{([^}]*)\\}`))?.[1] ?? '';

test('site palette and club themes are declared once in the single CSS owner', () => {
  assert.match(css, /--bg: #08090B;/);
  assert.match(css, /--amber: #F2A33A;/);
  for (const club of ['fenerbahce', 'galatasaray', 'besiktas', 'trabzonspor']) assert.ok(block(club), `[data-club="${club}"]`);
});

test('colour policy: Fenerbahçe theme carries no red; club pages use their own club theme', () => {
  const fb = block('fenerbahce');
  assert.match(fb, /--amber: #FFD31A/);
  assert.doesNotMatch(fb, /#(A9|E5|C8|D0|B0)[0-9A-F]{4}\b/i, 'no red family in the Fenerbahçe theme');
  for (const m of MATCH_PREVIEWS) {
    const page = read(`src/pages/mac/${m.slug}.astro`);
    assert.match(page, new RegExp(`club="${m.club}"`), `${m.slug} renders in its club theme`);
  }
});

test('every registered match page exists, has a real kickoff and a valid club', () => {
  for (const m of MATCH_PREVIEWS) {
    assert.ok(existsSync(new URL(`../src/pages/mac/${m.slug}.astro`, import.meta.url)), m.slug);
    assert.ok(!Number.isNaN(Date.parse(m.kickoff)), `${m.slug} kickoff`);
    assert.equal(m.href, `/mac/${m.slug}`);
    assert.ok(['fenerbahce', 'galatasaray', 'besiktas', 'trabzonspor'].includes(m.club));
  }
});

test('featured match is the next kickoff, then the most recent one', () => {
  const first = MATCH_PREVIEWS.map((m) => Date.parse(m.kickoff)).sort((a, b) => a - b);
  assert.equal(Date.parse(featuredMatch(first[0] - 1).kickoff), first[0]);
  assert.equal(Date.parse(featuredMatch(first.at(-1) + 1).kickoff), first.at(-1));
});

test('match pages never use CSS case transforms (Turkish dotted İ)', () => {
  for (const m of MATCH_PREVIEWS) assert.doesNotMatch(read(`src/pages/mac/${m.slug}.astro`), /text-transform\s*:/, m.slug);
});

test('only published match previews are advertised', () => {
  const src = read('src/data/match-previews.mjs');
  assert.match(src, /PUBLIC_MATCH_PREVIEWS = MATCH_PREVIEWS\.filter\(\(m\) => m\.status === 'published'\)/);
  for (const m of MATCH_PREVIEWS) assert.ok(['published', 'draft'].includes(m.status), m.slug);
  assert.match(read('src/pages/analysis.astro'), /PUBLIC_MATCH_PREVIEWS/);
});

test('approved HP monogram + wordmark, shared by header and footer', () => {
  const logo = read('src/components/Logo.astro');
  assert.match(logo, /data-testid="brand-logo"/);
  assert.match(logo, /hp-wordmark__name/);
  assert.match(logo, /src="\/brand\/hp-mark\.svg" alt=""/);
  assert.match(read('public/brand/hp-mark.svg'), /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(read('public/favicon.svg'), /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(read('src/components/EditorialHeader.astro'), /<Logo /);
  assert.match(read('src/layouts/BaseLayout.astro'), /<Logo variant="footer" \/>/);
});

test('mega menu is a disclosure: state, target, Escape and outside close', () => {
  const header = read('src/components/EditorialHeader.astro');
  assert.match(header, /class:list=\{\['mainnav__toggle'[\s\S]*aria-expanded="false" aria-controls=\{`megamenu-\$\{i\}`\}/);
  assert.match(header, /id=\{`megamenu-\$\{i\}`\} hidden/);
  assert.match(header, /e\.key !== 'Escape'/);
  assert.match(header, /addEventListener\('pointerdown'/);
  assert.match(header, /mainnav__fallback/, 'no-JS fallback link per group');
});

test('entry motion leaves content visible at rest and honours reduced motion', () => {
  const layout = read('src/layouts/BaseLayout.astro');
  assert.match(layout, /window\.setTimeout\(\(\) => targets\.forEach\(show\), 2500\)/);
  assert.match(css, /\.reveal, \.js \.reveal \{ opacity: 1 !important; transform: none !important; \}/);
  assert.match(read('src/pages/index.astro'), /prefers-reduced-motion: reduce/);
});

test('monograph surfaces read only public entries', () => {
  for (const p of ['src/pages/index.astro', 'src/pages/monographs/index.astro', 'src/pages/monographs/[slug].astro']) {
    for (const call of read(p).match(/getCollection\([^)]*\)/g) ?? []) assert.match(call, /isPublic/, `${p}: ${call}`);
  }
});

test('match pages satisfy their declared visual contract and evidence rules', () => {
  const js = read('public/js/hp-match-charts.js');
  assert.doesNotMatch(js, /marker-end|arrowhead/, 'no pass arrows without a verified receiver (HPA-LOZA K3)');
  assert.match(js, /stroke-dasharray/, 'team B is distinguished by stroke, not colour alone');
  for (const m of MATCH_PREVIEWS) {
    const page = read(`src/pages/mac/${m.slug}.astro`);
    // Visual contracts are selected by declared renderer capability, not by match slug.
    if (page.includes('data-visual-contract="editorial-svg-v1"')) {
      const figures = [...page.matchAll(/<figure class="hpc-figure">([\s\S]*?)<\/figure>/g)];
      assert.ok(figures.length >= 1, `${m.slug}: editorial SVG requires figures`);
      const sources = new Set();
      for (const [, figure] of figures) {
        const src = figure.match(/<img\s+src=\{`\$\{FIG\}\/([^`]+)`\}/)?.[1];
        assert.ok(src && /^[a-zA-Z0-9_-]+\.svg$/.test(src), `${m.slug}: SVG source must be static and local`);
        assert.ok(!sources.has(src), `${m.slug}: duplicate SVG ${src}`);
        sources.add(src);
        const dir = page.match(/const FIG = '\/figures\/([a-zA-Z0-9_/-]+)'/)?.[1];
        assert.ok(dir, `${m.slug}: missing local SVG directory`);
        assert.ok(existsSync(new URL(`../public/figures/${dir}/${src}`, import.meta.url)), `${m.slug}: missing ${src}`);
        assert.match(figure, /\balt="[^"]+"/, `${m.slug}: missing descriptive alt`);
        assert.match(figure, /<figcaption>[\s\S]*?[^\s<][\s\S]*?<\/figcaption>/, `${m.slug}: missing explanatory caption`);
      }
      assert.match(page, /Veri: SportsBase/, `${m.slug}: evidence source required`);
      continue;
    }
    for (const kind of ['teamradar', 'momentum', 'network', 'playerradar']) assert.match(page, new RegExp(`data-hpc="${kind}"`), `${m.slug}: ${kind}`);
    assert.match(page, /id="hpc-data"/);
    assert.match(page, /<span class="ev hyp">TAHMİNİ<\/span>Veride pası alan oyuncu yok/, `${m.slug}: proxy network labelled`);
    assert.match(page, /<details class="hpc-det"><summary>Kaynaklar<\/summary>/, `${m.slug}: sources collapsed`);
    const data = JSON.parse(page.match(/id="hpc-data" is:inline>(.*?)<\/script>/s)[1].replace(/<\\\//g, '</'));
    assert.ok(data.players.players.length >= 10 && data.team.teams[data.keys.a] && data.team.teams[data.keys.b]);
  }
});
