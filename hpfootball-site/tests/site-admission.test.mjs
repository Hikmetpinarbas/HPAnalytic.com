import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadControlItems } from '../src/lib/content-control.mjs';
import { buildVisibleNavigation } from '../src/lib/site-surfaces.mjs';
import {
  routeDestination,
  evaluateAdmission,
  admitLocalContent,
  withdrawLocalContent,
  listPublicLocalContent,
  readEditorialHistory,
} from '../src/lib/site-admission.mjs';

function baseItem(overrides={}) {
  return {
    id:'analysis_state::POSTMATCH::Turkey - Italy',
    title:'Turkey - Italy — POSTMATCH',
    target:'Turkey - Italy',
    content_type:'POSTMATCH',
    source_system:'HPA_CURRENT_ANALYSIS',
    generated_at:'2026-10-05T15:54:23Z',
    freshness:'PASS',
    currentness:'CURRENT',
    truth_status:'PROFESSIONAL_CLAIM_OUTPUT_READY',
    claim_readiness:'PROFESSIONAL_CLAIM_OUTPUT_READY',
    rights_status:'OWNED',
    evidence_status:{evidence_class:'HPA_CANONICAL_CURRENT',provenance:'HPA CURRENT ANALYSIS → CURRENT HUMAN ARTIFACT'},
    visual_status:{admitted_visual:false,rights:'UNKNOWN',visual_claim_ceiling:'MIXED'},
    body:'Human-readable analysis body.',
    provenance:'Current analysis authority with current human-delivery status.',
    warnings:[],
    social_status:{X:'DRAFT_READY'},
    ...overrides,
  };
}

test('content types route to the required public collections', () => {
  assert.equal(routeDestination('POSTMATCH').collection,'articles');
  assert.equal(routeDestination('POSTMATCH').section,'analysis');
  assert.equal(routeDestination('PLAYER_ANALYSIS').section,'scouting');
  assert.equal(routeDestination('RESEARCH').collection,'research');
  assert.equal(routeDestination('CULTURE').section,'culture');
  assert.equal(routeDestination('VISUAL_STORY').collection,'visuals');
});

test('admission requires human approval and all publication gates', () => {
  assert.equal(evaluateAdmission(baseItem(),{human_approval:'HUMAN_APPROVED'}).allowed,true);
  for(const item of [
    baseItem({claim_readiness:'REVIEW_REQUIRED'}),
    baseItem({rights_status:'BLOCKED'}),
    baseItem({freshness:'STALE'}),
    baseItem({currentness:'STALE'}),
    baseItem({body:'NOT_AVAILABLE'}),
    baseItem({provenance:'UNKNOWN'}),
    baseItem({warnings:['BLOCKING:SOURCE_CONFLICT']}),
  ]) assert.equal(evaluateAdmission(item,{human_approval:'HUMAN_APPROVED'}).allowed,false);
  assert.equal(evaluateAdmission(baseItem(),{human_approval:'REVIEW_READY'}).allowed,false);
});

test('approved item writes to the correct local collection and preserves required metadata', async () => {
  const root=await mkdtemp(path.join(tmpdir(),'hp-site-admit-'));
  const result=await admitLocalContent(baseItem(),{human_approval:'HUMAN_APPROVED',collectionRoot:root});
  assert.equal(result.status,'SITE_ADMITTED');
  assert.match(result.relativePath,/^articles\//);
  const text=await readFile(path.join(root,result.relativePath),'utf8');
  for(const key of ['title:','date:','target:','content_type:','source_system:','claim_status:','evidence_role:','rights_status:','canonical_content_id:','visual_refs:','summary:']) assert.match(text,new RegExp('^'+key,'m'));
  assert.match(text,/claim_status: \"PROFESSIONAL_CLAIM_OUTPUT_READY\"/);
  assert.match(text,/rights_status: \"OWNED\"/);
  assert.match(text,/canonical_content_id: \"analysis_state::POSTMATCH::Turkey - Italy\"/);
  assert.match(text,/Human-readable analysis body/);
  assert.doesNotMatch(text,/\/data\/data|\/storage\/emulated|api[_-]?key|token|secret|password/i);
});

test('blocked/review/rights-blocked items do not write collection files', async () => {
  for(const item of [baseItem({truth_status:'BLOCKED'}),baseItem({claim_readiness:'REVIEW_REQUIRED'}),baseItem({rights_status:'BLOCKED'})]) {
    const root=await mkdtemp(path.join(tmpdir(),'hp-site-deny-'));
    const result=await admitLocalContent(item,{human_approval:'HUMAN_APPROVED',collectionRoot:root});
    assert.equal(result.status,'BLOCKED');
    assert.deepEqual(await readdir(root),[]);
  }
});

test('same canonical content id updates one file instead of creating a duplicate', async () => {
  const root=await mkdtemp(path.join(tmpdir(),'hp-site-idempotent-'));
  const first=await admitLocalContent(baseItem(),{human_approval:'HUMAN_APPROVED',collectionRoot:root});
  const second=await admitLocalContent(baseItem({body:'Updated human body.'}),{human_approval:'HUMAN_APPROVED',collectionRoot:root});
  assert.equal(second.relativePath,first.relativePath);
  const files=await readdir(path.join(root,'articles'));
  assert.equal(files.filter(x=>x.endsWith('.md')).length,1);
  assert.match(await readFile(path.join(root,second.relativePath),'utf8'),/Updated human body/);
});

test('first admitted analysis item makes Analysis navigation visible by existing navigation truth', async () => {
  const root=await mkdtemp(path.join(tmpdir(),'hp-site-nav-'));
  await admitLocalContent(baseItem(),{human_approval:'HUMAN_APPROVED',collectionRoot:root});
  const publicItems=await listPublicLocalContent(root);
  const articleSections={analysis:publicItems.filter(x=>x.collection==='articles'&&x.section==='analysis').length};
  const nav=buildVisibleNavigation({articleSections,researchCount:0,visualCount:0});
  assert.ok(nav.some(x=>x.href==='/analysis'));
});

test('withdrawal keeps history but removes item from public collection view', async () => {
  const root=await mkdtemp(path.join(tmpdir(),'hp-site-withdraw-'));
  const published=await admitLocalContent(baseItem(),{human_approval:'HUMAN_APPROVED',collectionRoot:root});
  const withdrawn=await withdrawLocalContent(baseItem().id,{collectionRoot:root,reason:'LOCAL_TEST'});
  assert.equal(withdrawn.status,'WITHDRAWN');
  assert.equal((await listPublicLocalContent(root)).length,0);
  const history=await readEditorialHistory(baseItem().id,{collectionRoot:root});
  assert.deepEqual(history.map(x=>x.status),['PUBLISHED','WITHDRAWN']);
  assert.equal(withdrawn.relativePath,published.relativePath);
});

test('claim metadata is preserved and social is never auto-published', async () => {
  const root=await mkdtemp(path.join(tmpdir(),'hp-site-claim-'));
  const item=baseItem();
  const result=await admitLocalContent(item,{human_approval:'HUMAN_APPROVED',collectionRoot:root});
  const text=await readFile(path.join(root,result.relativePath),'utf8');
  assert.match(text,/claim_status: \"PROFESSIONAL_CLAIM_OUTPUT_READY\"/);
  assert.match(text,/evidence_role: \"HPA_CANONICAL_CURRENT\"/);
  assert.doesNotMatch(text,/social.*PUBLISHED|auto.?publish/i);
});

test('real HPA current item can traverse only a local human-approved test fixture, without changing real intake', async () => {
  const real=(await loadControlItems()).find(x=>x.currentness==='CURRENT');
  if (!real) return;
  assert.equal(real.target,'Turkey - Italy');
  const root=await mkdtemp(path.join(tmpdir(),'hp-site-real-fixture-'));
  const fixture={...real,rights_status:'OWNED',freshness:'CURRENT',warnings:[]};
  const result=await admitLocalContent(fixture,{human_approval:'HUMAN_APPROVED',collectionRoot:root,testFixture:true});
  assert.equal(result.status,'SITE_ADMITTED');
  assert.match(result.relativePath,/^articles\//);
  const reread=(await loadControlItems()).find(x=>x.currentness==='CURRENT');
  assert.equal(reread.rights_status,'UNKNOWN');
  assert.equal(reread.site_admission,'REVIEW_READY');
});

test('site public surfaces explicitly exclude withdrawn and superseded editorial items', async () => {
  const config=await readFile(new URL('../src/content.config.ts',import.meta.url),'utf8');
  const layout=await readFile(new URL('../src/layouts/BaseLayout.astro',import.meta.url),'utf8');
  const index=await readFile(new URL('../src/pages/index.astro',import.meta.url),'utf8');
  const analysis=await readFile(new URL('../src/pages/analysis.astro',import.meta.url),'utf8');
  const detail=await readFile(new URL('../src/pages/articles/[...id].astro',import.meta.url),'utf8');
  assert.match(config,/editorial_status/);
  for(const source of [layout,index,analysis,detail]) assert.match(source,/isPublicEditorialItem/);
});

test("public editorial admission is fail-closed and every public article projection applies it", async () => {
  const gate = await import("../src/lib/site-editorial-status.mjs");
  assert.equal(gate.isPublicEditorialItem({}), false);
  assert.equal(gate.isPublicEditorialItem({ editorial_status: "" }), false);
  assert.equal(gate.isPublicEditorialItem({ editorial_status: "WITHDRAWN" }), false);
  assert.equal(gate.isPublicEditorialItem({ editorial_status: "SUPERSEDED" }), false);
  assert.equal(gate.isPublicEditorialItem({ editorial_status: "PUBLISHED" }), true);

  for (const file of ["src/pages/archive.astro", "src/pages/search.astro", "src/components/SectionListing.astro"]) {
    const source = await readFile(new URL("../" + file, import.meta.url), "utf8");
    assert.match(source, /isPublicEditorialItem/);
  }
});
