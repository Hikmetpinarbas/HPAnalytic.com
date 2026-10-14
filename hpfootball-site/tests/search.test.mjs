import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText, tokenize, searchDocuments } from '../src/lib/search.mjs';

const docs = [
  { id: 'event', title: 'Event-only boundary: Gördüğümüz ile görmediğimizi ayırmak', description: 'Pass, shot ve recovery', meta: 'Method DIRECT', body: 'off-ball positioning' },
  { id: 'role', title: 'Position ≠ Role', description: 'Oyuncunun nerede durduğu', meta: 'Analysis EDITORIAL', body: 'İç bağlantı kurabilir; rest-defence' },
  { id: 'prod', title: 'Production ≠ Consequence', description: 'İlerleme hacmi', meta: 'Analysis DERIVED', body: 'role of progression' },
];

test('Turkish case and diacritics fold to a shared form', () => {
  assert.equal(normalizeText('İÇ BAĞLANTI'), 'ic baglanti');
  assert.equal(normalizeText('ırmak IŞIK'), 'irmak isik');
  assert.equal(normalizeText('Gördüğümüz'), 'gordugumuz');
  assert.equal(normalizeText('**bold** _x_'), 'bold x');
});

test('tokenize drops one-letter noise and duplicates', () => {
  assert.deepEqual(tokenize('a role ROLE  x'), ['role']);
  assert.deepEqual(tokenize('   '), []);
});

test('ASCII query finds Turkish text', () => {
  assert.deepEqual(searchDocuments(docs, 'gordugumuz').map((r) => r.id), ['event']);
  assert.deepEqual(searchDocuments(docs, 'ic baglanti').map((r) => r.id), ['role']);
});

test('all tokens must match (AND semantics)', () => {
  assert.deepEqual(searchDocuments(docs, 'role defence').map((r) => r.id), ['role']);
  assert.deepEqual(searchDocuments(docs, 'role nonexistent'), []);
});

test('title matches outrank body matches', () => {
  assert.deepEqual(searchDocuments(docs, 'role').map((r) => r.id), ['role', 'prod']);
});

test('empty query returns nothing rather than everything', () => {
  assert.deepEqual(searchDocuments(docs, ''), []);
});

test('punctuation separates search terms without losing Turkish folding', () => {
  assert.deepEqual(tokenize('Pres, geçiş'), ['pres', 'gecis']);
  assert.deepEqual(tokenize('role-based'), ['role', 'based']);
  assert.deepEqual(searchDocuments(docs, 'role, defence').map((r) => r.id), ['role']);
  assert.deepEqual(searchDocuments(docs, 'role-based').map((r) => r.id), []);
});

// --- Pagination (ported from feat/night-search-query-20261012) -------------
import { paginateResults } from '../src/lib/search.mjs';

test('pagination clamps untrusted page numbers and keeps stable slices', () => {
  const rows = Array.from({ length: 45 }, (_, i) => i);
  assert.deepEqual(paginateResults(rows, '2').items, rows.slice(20, 40));
  assert.equal(paginateResults(rows, '999').page, 3);
  assert.equal(paginateResults(rows, '1e3').page, 3, 'numeric notation clamps like any large page');
  for (const bad of ['0', '-1', '1.5', 'abc', null, ' ']) assert.equal(paginateResults(rows, bad).page, 1);
  assert.deepEqual(paginateResults([], '3'), { page: 1, totalPages: 1, total: 0, items: [] });
  assert.equal(paginateResults(rows, 1, 1000).items.length, 45);
});

test('search total is not capped by the default result limit', () => {
  const many = Array.from({ length: 60 }, (_, i) => ({ id: `d${i}`, title: 'pres', description: '', meta: '', body: '' }));
  assert.equal(searchDocuments(many, 'pres').length, 50);
  assert.equal(searchDocuments(many, 'pres', { limit: many.length }).length, 60);
});
