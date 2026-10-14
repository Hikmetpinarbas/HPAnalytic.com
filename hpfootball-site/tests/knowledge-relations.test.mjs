import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveKnowledgeRelations, isLinkableArticle } from '../src/lib/knowledge-relations.mjs';
import { isPublic } from '../src/lib/public-content.mjs';
import { isPublicEditorialItem } from '../src/lib/site-editorial-status.mjs';

const relations = (overrides = {}) => ({
  mechanisms: [], teams: [], roles: [], researchLines: [], ...overrides,
});

const admitted = (id, axes = {}, extra = {}) => ({
  id,
  data: {
    title: `Başlık ${id}`,
    description: `Açıklama ${id}`,
    relations: relations(axes),
    editorial_status: 'PUBLISHED',
    qualityStatus: 'HUMAN_APPROVED',
    sourceClaimsValidated: true,
    ...extra,
  },
});

const current = admitted('a', { mechanisms: ['build-up'], teams: ['Team A'], roles: ['fullback'], researchLines: ['event-boundary'] });

test('returns only explicitly shared authored axes', () => {
  const candidates = [
    admitted('b', { mechanisms: ['build-up'] }),
    admitted('c', { roles: ['fullback'] }),
    admitted('d', { teams: ['Team Z'] }),
  ];
  const out = resolveKnowledgeRelations(current, candidates);
  assert.equal(out.length, 2);
  assert.deepEqual(out.map((x) => x.reason), ['AYNI MEKANİZMA', 'AYNI ROL']);
  assert.deepEqual(out.map((x) => x.article.id), ['b', 'c']);
});

test('never relates an article to itself', () => {
  assert.equal(resolveKnowledgeRelations(current, [current]).length, 0);
});

test('compares authored values case- and whitespace-insensitively', () => {
  const out = resolveKnowledgeRelations(current, [admitted('b', { roles: ['  FULLBACK  '] })]);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0].shared, ['fullback']);
});

test('links a candidate on at most one axis', () => {
  const out = resolveKnowledgeRelations(current, [admitted('b', { mechanisms: ['build-up'], roles: ['fullback'] })]);
  assert.equal(out.length, 1);
  assert.equal(out[0].reason, 'AYNI MEKANİZMA');
});

test('honours the relation limit', () => {
  const candidates = [
    admitted('b', { mechanisms: ['build-up'] }),
    admitted('c', { roles: ['fullback'] }),
    admitted('d', { teams: ['Team A'] }),
    admitted('e', { researchLines: ['event-boundary'] }),
  ];
  assert.equal(resolveKnowledgeRelations(current, candidates, 2).length, 2);
});

test('only links published and accepted articles', () => {
  const candidate = admitted('b', { mechanisms: ['build-up'] });
  assert.equal(resolveKnowledgeRelations(current, [candidate]).length, 1);

  const unaccepted = [
    admitted('draft', { mechanisms: ['build-up'] }, { draft: true }),
    admitted('unpublished', { mechanisms: ['build-up'] }, { editorial_status: 'WITHDRAWN' }),
    admitted('no-status', { mechanisms: ['build-up'] }, { editorial_status: undefined }),
    admitted('unapproved', { mechanisms: ['build-up'] }, { qualityStatus: 'PENDING' }),
    admitted('unvalidated', { mechanisms: ['build-up'] }, { sourceClaimsValidated: false }),
    { id: 'empty', data: {} },
    undefined,
    null,
  ];
  assert.deepEqual(resolveKnowledgeRelations(current, unaccepted), []);
});

test('admission is the shared public + accepted editorial standard', () => {
  const candidate = admitted('b');
  assert.equal(isLinkableArticle(candidate), isPublic(candidate) && isPublicEditorialItem(candidate.data));
  assert.equal(isLinkableArticle(admitted('c', {}, { draft: true })), false);
  assert.equal(isLinkableArticle(admitted('d', {}, { qualityStatus: 'PENDING' })), false);
});

test('resolves same-team and same-research-line axes', () => {
  const teams = resolveKnowledgeRelations(current, [admitted('b', { teams: ['Team A'] })]);
  assert.equal(teams[0].reason, 'AYNI TAKIM');
  const lines = resolveKnowledgeRelations(current, [admitted('b', { researchLines: ['event-boundary'] })]);
  assert.equal(lines[0].reason, 'AYNI ARAŞTIRMA HATTI');
});

test('component renders editorial relation reasons at the canonical article URL', async () => {
  const source = await readFile(new URL('../src/components/KnowledgeRelations.astro', import.meta.url), 'utf8');
  assert.match(source, /NEDEN BAĞLANTILI/);
  assert.match(source, /'\/articles\/' \+ article\.id/);
  assert.doesNotMatch(source, /önerilen|recommended|personalized|kişiselleştir/i);
});

test('article schema exposes the four authored relation axes', async () => {
  const schema = await readFile(new URL('../src/content.config.ts', import.meta.url), 'utf8');
  assert.match(
    schema,
    /relations\s*:\s*z\.object\(\{[\s\S]*mechanisms[\s\S]*teams[\s\S]*roles[\s\S]*researchLines[\s\S]*\}\)/,
  );
});
