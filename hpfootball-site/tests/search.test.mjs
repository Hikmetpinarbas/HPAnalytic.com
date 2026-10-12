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
