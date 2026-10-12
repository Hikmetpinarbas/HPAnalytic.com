import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenize, searchDocuments } from '../src/lib/search.mjs';

test('search ignores punctuation between terms', () => {
  assert.deepEqual(tokenize('pres, geçiş'), ['pres', 'gecis']);
  assert.deepEqual(tokenize('“position” / “role”'), ['position', 'role']);
});

test('punctuated queries still match editorial documents', () => {
  const docs = [{ id: 'role', title: 'Position and role', description: 'Pres geçiş', meta: '', body: '' }];
  assert.deepEqual(searchDocuments(docs, 'position, role').map(({ id }) => id), ['role']);
});
