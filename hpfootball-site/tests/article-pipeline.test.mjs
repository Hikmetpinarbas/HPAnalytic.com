import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { stageArticleRun, publishStagedArticle } from '../src/lib/article-pipeline.mjs';

const psychologyReview={status:'PASS',reviewer_scope:'EDITORIAL_PSYCHOLOGY_COGNITIVE_SAFETY',dimensions:{observation_intention_boundary:'PASS',evidence_perception_boundary:'PASS',autonomy_safety:'PASS',cognitive_integrity:'PASS',visual_truth_boundary:'PASS'},rationale:['fixture review']};

async function fixtureRun(){
  const run=await mkdtemp(path.join(tmpdir(),'hp-ci-run-'));
  const packet={
    status:'EDITORIAL_DRAFT_PACKET_READY',
    topic:'Counter-press after possession loss',
    canonical_content:{content_id:'HP-counter-press-002'},
    claim_ceilings:['SOURCE_LEVEL_RESEARCH_ONLY'],
    claim_contract:{status:'READY',decomposition_required:false,claim_registry:[
      {claim_id:'CLM-A',source_id:'S1',text:'Claim',status:'EXTRACTED_SOURCE_STATEMENT_NOT_VALIDATED',source_span:{start:0,end:5}}
    ],decomposition_backlog:[]},
    admitted_sources:[{source_id:'S1',title:'Source One',rights:'SUMMARY_TRANSFORM_ATTRIBUTE',claim_ceiling:'SOURCE_LEVEL_RESEARCH_ONLY',provenance:{locator:'https://example.com/source'}}],
    counterevidence:['Opponent/game-state context can alter the mechanism.'],
  };
  const review={
    status:'REVIEW_PACKAGE_READY',
    publish_allowed:false,
    quality_gate:{status:'EDITORIAL_REVIEW_READY',blockers:[]},
    exports:{status:'EXPORT_READY',generated_at:'2026-10-06T12:00:00Z',single_editorial_identity:true,web:{
      content_id:'HP-counter-press-002',
      title:'Counter-press: ilk saniyelerde ne değişiyor?',
      description:'Mekanizma ve sınır odaklı analiz.',
      body:'Birinci paragraf.\n\nİkinci paragraf.',
      claim_ceiling:'SOURCE_LEVEL_RESEARCH_ONLY',
    }},
  };
  await writeFile(path.join(run,'EDITORIAL_PACKET.json'),JSON.stringify(packet));
  await writeFile(path.join(run,'ARTICLE_REVIEW_PACKAGE.json'),JSON.stringify(review));
  return run;
}

test('staging creates review candidate in inbox and never writes public article', async () => {
  const run=await fixtureRun();
  const workspace=await mkdtemp(path.join(tmpdir(),'hp-site-workspace-'));
  const out=await stageArticleRun(run,{workspaceRoot:workspace,editorial:{section:'analysis',article_kind:'DEEP_ANALYSIS',topics:['counter-press']}});
  assert.equal(out.status,'STAGED');
  assert.match(out.candidatePath,/editorial\/inbox/);
  const candidate=JSON.parse(await readFile(out.candidatePath,'utf8'));
  assert.equal(candidate.status,'ARTICLE_REVIEW_READY');
  assert.equal(candidate.item.id,'HP-counter-press-002');
  await assert.rejects(readFile(path.join(workspace,'src/content/articles','anything.md'),'utf8'));
});

test('staging fails closed when final review package is missing', async () => {
  const run=await mkdtemp(path.join(tmpdir(),'hp-ci-incomplete-'));
  await writeFile(path.join(run,'EDITORIAL_PACKET.json'),JSON.stringify({status:'EDITORIAL_DRAFT_PACKET_READY'}));
  const workspace=await mkdtemp(path.join(tmpdir(),'hp-site-workspace-'));
  const out=await stageArticleRun(run,{workspaceRoot:workspace,editorial:{section:'analysis'}});
  assert.equal(out.status,'BLOCKED');
  assert.ok(out.reasons.includes('ARTICLE_REVIEW_PACKAGE_UNAVAILABLE'));
});

test('publishing staged candidate requires explicit HUMAN_APPROVED and writes one article', async () => {
  const run=await fixtureRun();
  const workspace=await mkdtemp(path.join(tmpdir(),'hp-site-workspace-'));
  const staged=await stageArticleRun(run,{workspaceRoot:workspace,editorial:{section:'analysis',article_kind:'DEEP_ANALYSIS'}});
  const denied=await publishStagedArticle(staged.candidatePath,{workspaceRoot:workspace,humanApproval:'REVIEW_READY'});
  assert.equal(denied.status,'BLOCKED');
  const approved=await publishStagedArticle(staged.candidatePath,{workspaceRoot:workspace,humanApproval:'HUMAN_APPROVED',psychologyReview,sourceClaimsValidated:true});
  assert.equal(approved.status,'SITE_ADMITTED');
  const files=await readdir(path.join(workspace,'src/content/articles'));
  assert.equal(files.filter(x=>x.endsWith('.md')).length,1);
});

test('pipeline stores editorial history while keeping inbox candidate immutable', async () => {
  const run=await fixtureRun();
  const workspace=await mkdtemp(path.join(tmpdir(),'hp-site-workspace-'));
  const staged=await stageArticleRun(run,{workspaceRoot:workspace,editorial:{section:'analysis'}});
  const before=await readFile(staged.candidatePath,'utf8');
  await publishStagedArticle(staged.candidatePath,{workspaceRoot:workspace,humanApproval:'HUMAN_APPROVED',psychologyReview,sourceClaimsValidated:true});
  const after=await readFile(staged.candidatePath,'utf8');
  assert.equal(after,before);
  const histDir=path.join(workspace,'src/content','.editorial-history');
  assert.ok((await readdir(histDir)).some(x=>x.endsWith('.json')));
});


test('staging carries series data insights and review-only visual metadata through article intake', async () => {
  const run=await fixtureRun();
  const workspace=await mkdtemp(path.join(tmpdir(),'hp-site-workspace-'));
  const out=await stageArticleRun(run,{workspaceRoot:workspace,editorial:{
    section:'analysis',
    article_kind:'DEEP_ANALYSIS',
    series:'METRIC_EXPLAINER',
    topics:['şut'],
    visual_assets:[{visual_id:'V-HOLD',src:'/tmp/v.jpg',caption:'İç inceleme',claim_supported:'İddia',rights_status:'RIGHTS_REVIEW_REQUIRED',truth_role:'OBSERVED_FRAME',visual_role:'INLINE_EVIDENCE'}],
    data_insights:[{question:'Ne görüyoruz?',metric:'22 → 28 şut',interpretation:'Hacim aynı anlamı taşımaz.',limit:'İki maçlık örnek.',source_label:'HP iç veri'}],
  }});
  assert.equal(out.status,'STAGED');
  const candidate=JSON.parse(await readFile(out.candidatePath,'utf8'));
  assert.equal(candidate.item.article_meta.series,'METRIC_EXPLAINER');
  assert.equal(candidate.item.article_meta.data_insights.length,1);
  assert.equal(candidate.item.article_meta.visual_assets.length,1);
  assert.equal(candidate.publish_allowed,false);
});
