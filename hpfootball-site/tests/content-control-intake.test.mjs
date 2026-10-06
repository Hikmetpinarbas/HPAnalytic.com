import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadControlItems, canSiteAdmit } from '../src/lib/content-control.mjs';

async function put(root, rel, value) {
  const file=path.join(root, rel);
  await mkdir(path.dirname(file), {recursive:true});
  await writeFile(file, typeof value==='string'?value:JSON.stringify(value));
  return file;
}

function fixtureCurrent() {
  return {
    analysis:{job_type:'POSTMATCH',target:'Turkey - Italy',claim_ceiling:'MIXED',findings:[{status:'EMIT'}]},
    context:{status:'CURRENT_ANALYSIS_STATE_ALIGNED',human_delivery:{files:['HPA_POSTMATCH_ANALIZI_CURRENT.txt','POSTMATCH_CURRENT.pdf'],semantic_freshness:{status:'PASS',authority:'PROFESSIONAL_CLAIM_OUTPUT_READY',target:'Turkey - Italy',mode:'POSTMATCH'},authority:'PROFESSIONAL_CLAIM_OUTPUT_READY'}},
    lineage:{active_work_context:{target:'Turkey - Italy',mode:'POSTMATCH',authority:'CURRENT_ANALYSIS_STATE'},publication_product:{target:'Italy - Turkey',kind:'PREMATCH',semantic_freshness:{status:'UNRESOLVED_REPUBLISH_REQUIRED'},role:'STALE_PUBLISHED_HUMAN_PRODUCT_REPUBLISH_REQUIRED'},visual_product:'MATCH_EXPLANATION_MAP_V3'},
    meta:{schema:'HPA_POSTMATCH_CURRENT_V1',generated_at:'2026-10-05T15:54:23Z',target:'Turkey - Italy',mode:'POSTMATCH',authority:'PROFESSIONAL_CLAIM_OUTPUT_READY',claim_ceiling:'MIXED'},
    master:{content_id:'analysis_state::POSTMATCH::A - B',title:'A - B — POSTMATCH',status:'REVIEW_READY',target:'A - B',source_type:'ANALYSIS_STATE_ADMITTED',web_route:{quality_status:'REVIEW_REQUIRED'}},
    social:{schema:'HPA_SOCIAL_DERIVATIVE_PACKAGE_V1',generated_at:'2026-10-05T16:02:08Z',status:'DRAFT_READY',target:'Turkey - Italy',job_type:'POSTMATCH',derivatives:{x_single:{status:'DRAFT_READY'},x_thread:{status:'DRAFT_READY'},instagram_carousel:{status:'DRAFT_READY'},reel_script:{status:'DRAFT_READY'},youtube_short_script:{status:'DRAFT_READY'}}},
    visual:{schema:'HPA_VISUAL_ACCEPTANCE_CURRENT',status:'ACCEPTED',product:'MATCH_EXPLANATION_MAP',publication_status:'ACCEPTED_FOR_HPA_INTERNAL_AND_HUMAN_REVIEW_NOT_AUTO_PUBLISHED'},
    admission:{schema:'HPA_CONTENT_FOUNDRY_ADMISSION_V1',release_status:'TRIAGED_NOT_PUBLISHED',production_authority:false,publication_authority:false,source_count:127},
  };
}

async function makeFixture() {
  const root=await mkdtemp(path.join(tmpdir(),'hp-intake-'));
  const f=fixtureCurrent();
  await put(root,'analysis_state_current.json',f.analysis);
  await put(root,'HPA_CURRENT_CONTEXT.json',f.context);
  await put(root,'HPA_ARTIFACT_LINEAGE_CURRENT.json',f.lineage);
  await put(root,'HPA_POSTMATCH_CURRENT.meta.json',f.meta);
  await put(root,'social_content/HPA_CONTENT_MASTER_CURRENT.json',f.master);
  await put(root,'social_content/HPA_SOCIAL_PACKAGE_CURRENT.json',f.social);
  await put(root,'visual_physical_acceptance_current.json',f.visual);
  await put(root,'content_foundry_admission_current.json',f.admission);
  await put(root,'human/HPA_POSTMATCH_ANALIZI_CURRENT.txt','HPA — POSTMATCH ANALİZİ\nTurkey - Italy\n\nHuman-readable body');
  return root;
}

test('current HPA item appears from current authority rather than editorial master', async () => {
  const root=await makeFixture();
  const items=await loadControlItems({stateRoot:root,humanRoot:path.join(root,'human')});
  const current=items.find(x=>x.currentness==='CURRENT');
  assert.equal(current?.target,'Turkey - Italy');
  assert.equal(current?.content_type,'POSTMATCH');
  assert.equal(current?.claim_readiness,'PROFESSIONAL_CLAIM_OUTPUT_READY');
});

test('stale editorial/publication pointers cannot override current authority', async () => {
  const root=await makeFixture();
  const items=await loadControlItems({stateRoot:root,humanRoot:path.join(root,'human')});
  const current=items.find(x=>x.currentness==='CURRENT');
  assert.equal(current.target,'Turkey - Italy');
  assert.ok(items.some(x=>x.target==='A - B' && ['STALE','SUPERSEDED'].includes(x.currentness)));
  assert.ok(items.some(x=>x.target==='Italy - Turkey' && x.currentness==='STALE'));
});

test('missing paths fail soft without crashing', async () => {
  const root=await mkdtemp(path.join(tmpdir(),'hp-intake-missing-'));
  const items=await loadControlItems({stateRoot:root,humanRoot:path.join(root,'human')});
  assert.ok(items.length>=1);
  assert.ok(items[0].warnings.length>0);
});

test('invalid JSON fails soft and exposes no raw local path', async () => {
  const root=await mkdtemp(path.join(tmpdir(),'hp-intake-badjson-'));
  await put(root,'analysis_state_current.json','{not-json');
  const items=await loadControlItems({stateRoot:root,humanRoot:path.join(root,'human')});
  const text=JSON.stringify(items);
  assert.match(text,/INVALID_JSON|NOT_AVAILABLE/);
  assert.doesNotMatch(text,/\/data\/data|\/storage\/emulated/);
});

test('blocked or unknown rights cannot look publishable', async () => {
  const root=await makeFixture();
  const items=await loadControlItems({stateRoot:root,humanRoot:path.join(root,'human')});
  const current=items.find(x=>x.currentness==='CURRENT');
  assert.ok(['UNKNOWN','REVIEW_REQUIRED'].includes(current.rights_status));
  assert.equal(canSiteAdmit(current),false);
  assert.notEqual(current.site_admission,'APPROVED_FOR_SITE');
});

test('accepted visual package is linked as package state without inventing asset rights', async () => {
  const root=await makeFixture();
  const items=await loadControlItems({stateRoot:root,humanRoot:path.join(root,'human')});
  const current=items.find(x=>x.currentness==='CURRENT');
  assert.equal(current.visual_status.package_status,'ACCEPTED');
  assert.equal(current.visual_status.product,'MATCH_EXPLANATION_MAP');
  assert.equal(current.visual_status.rights,'UNKNOWN');
});

test('social derivatives link only when target and mode match current authority', async () => {
  const root=await makeFixture();
  const items=await loadControlItems({stateRoot:root,humanRoot:path.join(root,'human')});
  const current=items.find(x=>x.currentness==='CURRENT');
  assert.equal(current.social_status.X,'DRAFT_READY');
  assert.equal(current.social_status.Reel,'DRAFT_READY');
});

test('read-only intake does not mutate source files', async () => {
  const root=await makeFixture();
  const file=path.join(root,'analysis_state_current.json');
  const beforeText=await readFile(file,'utf8');
  const beforeStat=await stat(file);
  await loadControlItems({stateRoot:root,humanRoot:path.join(root,'human')});
  const afterText=await readFile(file,'utf8');
  const afterStat=await stat(file);
  assert.equal(afterText,beforeText);
  assert.equal(afterStat.mtimeMs,beforeStat.mtimeMs);
});

test('normalized output contains no raw machine paths, API keys, tokens or secrets', async () => {
  const root=await makeFixture();
  const items=await loadControlItems({stateRoot:root,humanRoot:path.join(root,'human')});
  const text=JSON.stringify(items);
  assert.doesNotMatch(text,/\/data\/data|\/storage\/emulated|authorization\s*[:=]|bearer\s+|sk-[A-Za-z0-9]|api[_-]?key|password|secret/i);
});

test('control UI exposes read-only review intent, required filters, and human detail without raw JSON', async () => {
  const route=await readFile(new URL('../src/pages/control/content.astro', import.meta.url),'utf8');
  assert.match(route,/READ-ONLY CONTROL SURFACE/);
  for(const label of ['All','Ready','Review','Blocked','Stale','Analysis','Research','Visual','Social']) assert.match(route,new RegExp('>'+label+'<','i'));
  for(const action of ['REVIEW','APPROVE','BLOCK']) assert.match(route,new RegExp('>'+action+'<'));
  assert.match(route,/<details[^>]*class="control-detail"/);
  assert.match(route,/Advanced \/ Technical/);
  assert.doesNotMatch(route,/JSON\.stringify|<pre/);
  assert.doesNotMatch(route,/\/data\/data|\/storage\/emulated/);
});
