import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('package exposes explicit stage and publish operator commands', async () => {
  const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
  assert.match(pkg.scripts['article:stage'],/article-stage\.mjs/);
  assert.match(pkg.scripts['article:publish'],/article-publish\.mjs/);
});

test('publish CLI requires explicit HUMAN_APPROVED token', async () => {
  const source=await readFile(new URL('../scripts/article-publish.mjs',import.meta.url),'utf8');
  assert.match(source,/HUMAN_APPROVED/);
  assert.match(source,/--approve/);
  assert.doesNotMatch(source,/humanApproval:\s*['"]HUMAN_APPROVED['"][\s\S]*default/i);
});

test('stage CLI has no publication call', async () => {
  const source=await readFile(new URL('../scripts/article-stage.mjs',import.meta.url),'utf8');
  assert.match(source,/stageArticleRun/);
  assert.doesNotMatch(source,/publishStagedArticle|HUMAN_APPROVED/);
});
