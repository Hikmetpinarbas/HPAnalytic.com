import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVisibleNavigation } from '../src/lib/site-surfaces.mjs';

test('hides surfaces that have no real content', () => {
  const nav = buildVisibleNavigation({
    articleSections: { analysis: 2, culture: 1, scouting: 0 },
    researchCount: 0,
    visualCount: 0,
  });
  assert.deepEqual(nav.map(x => x.href), ['/analysis', '/culture', '/about']);
});

test('reveals a surface automatically when real content exists', () => {
  const nav = buildVisibleNavigation({
    articleSections: { analysis: 2, culture: 1, scouting: 1 },
    researchCount: 1,
    visualCount: 1,
  });
  assert.deepEqual(nav.map(x => x.href), [
    '/analysis',
    '/scouting',
    '/visual-lab',
    '/research',
    '/culture',
    '/about',
  ]);
});

test('about remains available even when editorial collections are empty', () => {
  const nav = buildVisibleNavigation({
    articleSections: {},
    researchCount: 0,
    visualCount: 0,
  });
  assert.deepEqual(nav.map(x => x.href), ['/about']);
});

import { buildUtilityNavigation, currentState } from '../src/lib/site-surfaces.mjs';

test('archive and search appear only when the editorial corpus is non-empty', () => {
  assert.deepEqual(buildUtilityNavigation({ articleCount: 0 }), []);
  assert.deepEqual(buildUtilityNavigation({ articleCount: 4 }).map((x) => x.href), ['/archive', '/search']);
});

test('current-page state follows GOV.UK semantics (page vs ancestor)', () => {
  assert.equal(currentState('/analysis', '/analysis'), 'page');
  assert.equal(currentState('/analysis', '/analysis/'), 'page');
  assert.equal(currentState('/analysis', '/analysis/deep'), 'true');
  assert.equal(currentState('/analysis', '/analysis-x'), undefined);
  assert.equal(currentState('/', '/about'), undefined);
});
