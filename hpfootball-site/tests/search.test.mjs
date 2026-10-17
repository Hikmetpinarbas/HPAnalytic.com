import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText, tokenize, searchDocuments, paginateResults } from '../src/lib/search.mjs';

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

test('pagination preserves all ranked matches without overlap', () => {
  const results = Array.from({ length: 45 }, (_, id) => ({ id }));
  const first = paginateResults(results, '1');
  const second = paginateResults(results, '2');
  const third = paginateResults(results, '3');
  assert.deepEqual([first.items.length, second.items.length, third.items.length], [20, 20, 5]);
  assert.equal(first.total, 45);
  assert.equal(third.totalPages, 3);
  assert.deepEqual([...first.items, ...second.items, ...third.items], results);
});

test('pagination rejects invalid pages and clamps out-of-range requests', () => {
  const results = Array.from({ length: 3 }, (_, id) => ({ id }));
  for (const value of ['-1', 'NaN', '1.5', 'Infinity', '0', 'abc']) {
    assert.equal(paginateResults(results, value, 2).page, 1);
  }
  assert.equal(paginateResults(results, '999', 2).page, 2);
  assert.equal(paginateResults([], '99').page, 1);
  assert.equal(paginateResults(results, '1', 0).items.length, 3);
});
