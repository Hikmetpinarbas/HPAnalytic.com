import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { normalizeContentIntelligenceArticle } from '../src/lib/article-intake-contract.mjs';
import { evaluateAdmission, admitLocalContent } from '../src/lib/site-admission.mjs';

function readyItem(){
  const bundle={
    packet:{
      status:'EDITORIAL_DRAFT_PACKET_READY',
      topic:'Counter-press after possession loss',
      canonical_content:{content_id:'HP-counter-press-001'},
      claim_ceilings:['SOURCE_LEVEL_RESEARCH_ONLY'],
      claim_contract:{status:'READY',decomposition_required:false,claim_registry:[
        {claim_id:'CLM-1',source_id:'S1',text:'Claim one',status:'EXTRACTED_SOURCE_STATEMENT_NOT_VALIDATED',source_span:{start:0,end:9}}
      ],decomposition_backlog:[]},
      admitted_sources:[
        {source_id:'S1',title:'Source One',rights:'SUMMARY_TRANSFORM_ATTRIBUTE',claim_ceiling:'SOURCE_LEVEL_RESEARCH_ONLY',provenance:{locator:'https://example.com/1'}}
      ],
      counterevidence:['Game-state may alter the interpretation.'],
    },
    review:{
      status:'REVIEW_PACKAGE_READY',
      quality_gate:{status:'EDITORIAL_REVIEW_READY',blockers:[]},
      exports:{status:'EXPORT_READY',generated_at:'2026-10-06T12:00:00Z',single_editorial_identity:true,web:{
        content_id:'HP-counter-press-001',
        title:'Top kaybından sonra ne oluyor?',
        description:'Özgün analiz.',
        body:'Birinci paragraf.\n\nİkinci paragraf.',
        claim_ceiling:'SOURCE_LEVEL_RESEARCH_ONLY',
      }},
    },
    editorial:{section:'analysis',article_kind:'DEEP_ANALYSIS',language:'tr',author:'Hikmet Pınarbaş',topics:['counter-press','transition']},
  };
  const item=normalizeContentIntelligenceArticle(bundle).item;
  item.article_meta.psychology_status='PASS';
  return item;
}

test('editorial article readiness is admissible only after explicit human approval', () => {
  const item=readyItem();
  assert.equal(evaluateAdmission(item,{human_approval:'REVIEW_READY'}).allowed,false);
  assert.equal(evaluateAdmission(item,{human_approval:'HUMAN_APPROVED'}).allowed,true);
});

test('content-intelligence article routes to analysis collection', () => {
  const item=readyItem();
  const gate=evaluateAdmission(item,{human_approval:'HUMAN_APPROVED'});
  assert.deepEqual(gate.destination,{collection:'articles',section:'analysis'});
});

test('site serialization preserves article contract metadata and remains human-approved only', async () => {
  const root=await mkdtemp(path.join(tmpdir(),'hp-article-admit-'));
  const item=readyItem();
  const result=await admitLocalContent(item,{human_approval:'HUMAN_APPROVED',collectionRoot:root});
  assert.equal(result.status,'SITE_ADMITTED');
  const text=await readFile(path.join(root,result.relativePath),'utf8');
  for(const key of ['articleKind:','author:','language:','topics:','sourceRefs:','sourceRights:','claimIds:','counterevidence:','readingMinutes:','truthAuthority:','sourceClaimsValidated:']) {
    assert.match(text,new RegExp('^'+key,'m'));
  }
  assert.match(text,/articleKind: "DEEP_ANALYSIS"/);
  assert.match(text,/author: "Hikmet Pınarbaş"/);
  assert.match(text,/readingMinutes: 1/);
  assert.match(text,/truthAuthority: false/);
  assert.match(text,/sourceClaimsValidated: false/);
  assert.doesNotMatch(text,/editorial_status:\s*"PUBLISHED"[\s\S]*auto.?publish/i);
});

test('site does not admit content-intelligence article with unresolved claim state', async () => {
  const root=await mkdtemp(path.join(tmpdir(),'hp-article-block-'));
  const item={...readyItem(),claim_readiness:'REVIEW_REQUIRED'};
  const result=await admitLocalContent(item,{human_approval:'HUMAN_APPROVED',collectionRoot:root});
  assert.equal(result.status,'BLOCKED');
  assert.ok(result.reasons.includes('PROFESSIONAL_OUTPUT_NOT_READY')||result.reasons.includes('EDITORIAL_OUTPUT_NOT_READY'));
});
