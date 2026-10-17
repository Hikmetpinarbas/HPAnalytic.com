import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSearchHref, classifyIntents, DISCOVERY_INTENTS, parseIntent, sanitizeQuery, searchDocuments, summarizeIntents, tokenize } from '../src/lib/search.mjs';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const page = read('../src/pages/search.astro');
const component = read('../src/components/IntentDiscovery.astro');

test('four football intents: match, player, mechanism, research', () => {
  assert.deepEqual(DISCOVERY_INTENTS.map((i) => i.id), ['mac', 'oyuncu', 'mekanizma', 'arastirma']);
});

test('structured fields classify before text', () => {
  assert.deepEqual(classifyIntents({ section: 'scouting', title: 'X' }), ['oyuncu']);
  assert.deepEqual(classifyIntents({ section: 'analysis', series: 'MATCH_ANALYSIS', title: 'X' }), ['mac']);
  assert.deepEqual(classifyIntents({ section: 'analysis', series: 'METRIC_EXPLAINER', title: 'X' }), ['mekanizma']);
  assert.deepEqual(classifyIntents({ section: 'method', title: 'X' }), ['arastirma']);
  assert.deepEqual(classifyIntents({ section: 'culture', title: 'Futbol nedir?' }), []);
});

test('Turkish stems match through case and suffixes, not unrelated words', () => {
  assert.ok(classifyIntents({ title: 'MAÇIN KIRILMA ANI' }).includes('mac'));
  assert.ok(classifyIntents({ title: 'Oyuncunun rolü' }).includes('oyuncu'));
  assert.ok(classifyIntents({ topics: ['Verinin sınırı'] }).includes('arastirma'));
  assert.ok(classifyIntents({ description: 'Mekanizmayı çöz' }).includes('mekanizma'));
  assert.deepEqual(classifyIntents({ title: 'Bir macera', description: 'Bu bize fikir verir.' }), []);
  assert.deepEqual(classifyIntents({ title: 'Roller coaster' }).includes('oyuncu'), true, 'plural "roller" is still a role word');
});

test('body text never assigns an intent', () => {
  assert.deepEqual(classifyIntents({ section: 'culture', title: 'Kültür', body: 'maç oyuncu veri mekanizma' }), []);
});

test('intents without public documents are hidden; counts are per intent', () => {
  const docs = [{ intents: ['mac', 'arastirma'] }, { intents: ['arastirma'] }, { intents: [] }];
  assert.deepEqual(summarizeIntents(docs).map((i) => [i.id, i.count]), [['mac', 1], ['arastirma', 2]]);
  assert.deepEqual(summarizeIntents([]), []);
});

test('intent parameter is a strict whitelist', () => {
  assert.equal(parseIntent('mac'), 'mac');
  for (const bad of ['MAC', 'maç', ' mac ', '__proto__', 'constructor', 'mac&x=1', '<script>', '', null, undefined]) {
    assert.equal(parseIntent(bad), bad === ' mac ' ? 'mac' : null, String(bad));
  }
});

test('empty and whitespace queries produce no search and no results', () => {
  for (const q of ['', '   ', '\n\t', 'a', '?', '—', '!!']) {
    assert.deepEqual(tokenize(sanitizeQuery(q)), [], JSON.stringify(q));
    assert.deepEqual(searchDocuments([{ id: 'x', title: 'a ? —' }], q), []);
  }
});

test('query sanitizing bounds length and removes control characters', () => {
  assert.equal(sanitizeQuery('  pres\r\nSet-Cookie: x\u0000 '), 'pres Set-Cookie: x');
  assert.equal(sanitizeQuery('ş'.repeat(500)).length, 120);
  assert.equal(sanitizeQuery(null), '');
  assert.equal(sanitizeQuery('İç bağlantı'), 'İç bağlantı', 'Turkish letters are preserved for display');
});

test('search links are same-origin, encoded and whitelisted', () => {
  assert.equal(buildSearchHref(), '/search');
  assert.equal(buildSearchHref({ query: '  ' }), '/search');
  assert.equal(buildSearchHref({ query: 'İç bağlantı', intent: 'oyuncu', page: 2 }), '/search?q=%C4%B0%C3%A7+ba%C4%9Flant%C4%B1&intent=oyuncu&page=2');
  assert.equal(buildSearchHref({ query: 'x', intent: 'javascript:alert(1)', page: 1 }), '/search?q=x');
  const hostile = buildSearchHref({ query: '"><script>alert(1)</script>&intent=mac#\r\nx', page: '-3' });
  assert.match(hostile, /^\/search\?q=[^&#<>"\s]+$/);
  assert.equal(new URL(hostile, 'https://hpanalytic.com').searchParams.get('q'), '"><script>alert(1)</script>&intent=mac# x');
  assert.equal(new URL(hostile, 'https://hpanalytic.com').searchParams.get('intent'), null);
  for (const p of [0, -1, 1.5, 'NaN', Infinity, '2abc']) assert.doesNotMatch(buildSearchHref({ query: 'x', page: p }), /page=/);
});

test('search page indexes only published, editorially admitted articles', () => {
  assert.match(page, /getCollection\('articles', isPublic\)\)\.filter\(\(entry\) => isPublicEditorialItem\(entry\.data\)\)/);
  assert.match(page, /const intents = summarizeIntents\(documents\)/);
  assert.match(page, /intents\.some\(\(i\) => i\.id === requestedIntent\)/, 'an intent with no public article is ignored');
  assert.doesNotMatch(page, /getCollection\('articles'\)(?!\s*,\s*isPublic)/);
});

test('search page builds links only through buildSearchHref and keeps SSR GET form', () => {
  assert.match(page, /export const prerender = false/);
  assert.match(page, /method="get" role="search"/);
  assert.doesNotMatch(page, /`\/search\?/);
  assert.match(page, /sanitizeQuery\(Astro\.url\.searchParams\.get\('q'\)\)/);
  assert.match(page, /noindex=\{Boolean\(query \|\| intent\)\}/);
});

test('intent discovery is static, labelled, keyboard reachable and never advertises unfinished features', () => {
  assert.doesNotMatch(component, /client:|<script|onclick|setInterval/i);
  assert.match(component, /aria-labelledby="hp-intent-title"/);
  assert.match(component, /aria-label="Sonuçları niyete göre daralt"/);
  assert.match(component, /aria-current=/);
  assert.match(component, /min-height: 44px/);
  assert.match(component, /:focus-visible/);
  assert.doesNotMatch(component, /ASK HPA|HENÜZ YAYINDA|yakında/i);
  assert.doesNotMatch(component, /href=\{?["'`]\/(analysis|scouting|research|visual-lab)/, 'intents filter search; they do not link to possibly empty sections');
  assert.match(component, /buildSearchHref/);
});
