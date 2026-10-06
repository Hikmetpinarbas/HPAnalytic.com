import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadArticleInbox } from '../src/lib/article-inbox.mjs';

test('article inbox exposes review metadata without raw local paths or body dump', async () => {
  const root=await mkdtemp(path.join(tmpdir(),'hp-article-inbox-'));
  const inbox=path.join(root,'editorial','inbox');
  await mkdir(inbox,{recursive:true});
  await writeFile(path.join(inbox,'candidate.json'),JSON.stringify({
    status:'ARTICLE_REVIEW_READY',
    staged_at:'2026-10-06T12:00:00Z',
    approval_required:'HUMAN_APPROVED',
    item:{
      id:'HP-1',title:'Test article',target:'Topic',content_type:'ARTICLE_ANALYSIS',
      claim_ceiling:'SOURCE_LEVEL_ONLY',rights_status:'ATTRIBUTION_REQUIRED',
      article_meta:{source_count:3,claim_ids:['C1','C2'],topics:['pressing'],reading_minutes:5,quality_status:'EDITORIAL_REVIEW_READY'},
      body:'Long private draft body that should not be dumped into inbox summary.',
    }
  }));
  const items=await loadArticleInbox({workspaceRoot:root});
  assert.equal(items.length,1);
  assert.equal(items[0].id,'HP-1');
  assert.equal(items[0].source_count,3);
  assert.equal(items[0].claim_count,2);
  assert.equal(items[0].reading_minutes,5);
  const serialized=JSON.stringify(items);
  assert.doesNotMatch(serialized,/Long private draft body/);
  assert.doesNotMatch(serialized,/\/data\/data|\/storage\/emulated/);
});

test('content control page includes read-only article inbox surface', async () => {
  const route=await readFile(new URL('../src/pages/control/content.astro',import.meta.url),'utf8');
  assert.match(route,/loadArticleInbox/);
  assert.match(route,/ARTICLE INBOX/);
  assert.match(route,/approval_required/);
  assert.doesNotMatch(route,/publishStagedArticle|article:publish/);
});
