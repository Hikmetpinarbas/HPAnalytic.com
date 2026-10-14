import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildKnowledgePath } from '../src/lib/knowledge-relations.mjs';

const admitted = (id, axes = {}, extra = {}) => ({
  id,
  data: {
    title: `Başlık ${id}`,
    description: `Açıklama ${id}`,
    relations: { mechanisms: [], teams: [], roles: [], researchLines: [], ...axes },
    editorial_status: 'PUBLISHED',
    qualityStatus: 'HUMAN_APPROVED',
    sourceClaimsValidated: true,
    ...extra,
  },
});

const current = admitted('a', {
  mechanisms: ['build-up'],
  teams: ['Team A'],
  roles: ['fullback'],
  researchLines: ['event-boundary'],
});

test('builds a multi-axis football discovery path with explicit reasons', () => {
  const items = [
    admitted('b', { mechanisms: ['build-up'] }),
    admitted('c', { roles: ['fullback'] }),
    admitted('d', { researchLines: ['event-boundary'] }),
  ];
  const out = buildKnowledgePath(current, items);
  assert.deepEqual(out.map((x) => x.reason), ['AYNI MEKANİZMA', 'AYNI ROL', 'AYNI ARAŞTIRMA HATTI']);
  assert.equal(new Set(out.map((x) => x.article.id)).size, out.length);
});

test('path never invents a relation when authored axes do not intersect', () => {
  const out = buildKnowledgePath(current, [admitted('z', { mechanisms: ['press'], teams: ['Team Z'], roles: ['striker'], researchLines: ['other'] })]);
  assert.deepEqual(out, []);
});

test('path only includes published and accepted articles', () => {
  const items = [
    admitted('draft', { mechanisms: ['build-up'] }, { draft: true }),
    admitted('withdrawn', { mechanisms: ['build-up'] }, { editorial_status: 'WITHDRAWN' }),
    admitted('unapproved', { roles: ['fullback'] }, { qualityStatus: 'PENDING' }),
    admitted('unvalidated', { researchLines: ['event-boundary'] }, { sourceClaimsValidated: false }),
  ];
  assert.deepEqual(buildKnowledgePath(current, items), []);
});

test('path skips candidates that are not admitted and keeps admitted ones', () => {
  const items = [
    admitted('draft', { mechanisms: ['build-up'] }, { draft: true }),
    admitted('c', { roles: ['fullback'] }),
  ];
  const out = buildKnowledgePath(current, items);
  assert.deepEqual(out.map((x) => x.article.id), ['c']);
});

test('path takes one article per axis and respects the limit', () => {
  const items = [
    admitted('b', { mechanisms: ['build-up'] }),
    admitted('b2', { mechanisms: ['build-up'] }),
    admitted('c', { roles: ['fullback'] }),
  ];
  const out = buildKnowledgePath(current, items, 2);
  assert.equal(out.length, 2);
  assert.deepEqual(out.map((x) => x.article.id), ['b', 'c']);
});

test('knowledge path UI explains movement at the canonical article URL', async () => {
  const source = await readFile(new URL('../src/components/KnowledgePath.astro', import.meta.url), 'utf8');
  assert.match(source, /FUTBOL BİLGİ AĞI/);
  assert.match(source, /BAĞLANTI NEDENİ/);
  assert.match(source, /'\/articles\/' \+ item\.article\.id/);
  assert.match(source, /tavsiye algoritması değil/);
  assert.doesNotMatch(source, /recommended|önerilen|kişiselleştiril/i);
});
