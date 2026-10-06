import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeContentIntelligenceArticle,
  evaluateArticleBundle,
} from '../src/lib/article-intake-contract.mjs';

function bundle(overrides={}) {
  const base={
    packet:{
      status:'EDITORIAL_DRAFT_PACKET_READY',
      topic:'Counter-press after possession loss',
      canonical_content:{content_id:'HP-counter-press-001'},
      claim_ceilings:['LIBRARY_DONOR_NOT_CURRENT_TRUTH','SOURCE_LEVEL_RESEARCH_ONLY'],
      claim_contract:{
        status:'READY',
        decomposition_required:false,
        claim_registry:[
          {claim_id:'CLM-1',source_id:'S1',text:'Claim one',status:'EXTRACTED_SOURCE_STATEMENT_NOT_VALIDATED',source_span:{start:0,end:9}},
          {claim_id:'CLM-2',source_id:'S2',text:'Claim two',status:'SOURCE_DECLARED_NOT_SYNTHESIZED',source_span:{start:10,end:19}},
        ],
        decomposition_backlog:[],
      },
      admitted_sources:[
        {source_id:'S1',title:'Source One',rights:'SUMMARY_TRANSFORM_ATTRIBUTE',provenance:{locator:'https://example.com/1'}},
        {source_id:'S2',title:'Source Two',rights:'OWNED',provenance:{locator:'INTERNAL_INTEL'}},
      ],
      held_sources:[],
      counterevidence:['Game-state may change the interpretation.'],
    },
    review:{
      status:'REVIEW_PACKAGE_READY',
      publish_allowed:false,
      quality_gate:{status:'EDITORIAL_REVIEW_READY',blockers:[]},
      exports:{
        status:'EXPORT_READY',
        web:{
          content_id:'HP-counter-press-001',
          title:'Top kaybından sonra ne oluyor?',
          description:'Counter-pressi mekanizma ve kanıt sınırıyla okuyan özgün analiz.',
          body:'İlk paragraf.\n\nİkinci paragraf.',
          claim_ceiling:'LIBRARY_DONOR_NOT_CURRENT_TRUTH | SOURCE_LEVEL_RESEARCH_ONLY',
          publication_status:'DRAFT_REVIEW_REQUIRED',
          source_count:2,
        },
      },
    },
    editorial:{
      section:'analysis',
      article_kind:'DEEP_ANALYSIS',
      language:'tr',
      author:'Hikmet Pınarbaş',
      topics:['counter-press','transition'],
    },
  };
  return {...base,...overrides};
}

test('ready bundle normalizes to one site article candidate without publishing', () => {
  const out=normalizeContentIntelligenceArticle(bundle());
  assert.equal(out.status,'ARTICLE_REVIEW_READY');
  assert.equal(out.publish_allowed,false);
  assert.equal(out.item.id,'HP-counter-press-001');
  assert.equal(out.item.content_type,'ARTICLE_ANALYSIS');
  assert.equal(out.item.claim_readiness,'EDITORIAL_CLAIM_OUTPUT_READY');
  assert.equal(out.item.rights_status,'ATTRIBUTION_REQUIRED');
  assert.equal(out.item.currentness,'CURRENT');
  assert.equal(out.item.freshness,'PASS');
  assert.equal(out.item.article_meta.source_count,2);
  assert.deepEqual(out.item.article_meta.claim_ids,['CLM-1','CLM-2']);
  assert.equal(out.item.article_meta.reading_minutes,1);
});

test('claim decomposition backlog blocks article readiness', () => {
  const b=bundle();
  b.packet.claim_contract={status:'DECOMPOSITION_REQUIRED',decomposition_required:true,claim_registry:[],decomposition_backlog:['S1']};
  const gate=evaluateArticleBundle(b);
  assert.equal(gate.allowed,false);
  assert.ok(gate.reasons.includes('CLAIM_DECOMPOSITION_REQUIRED'));
});

test('quality gate and export must both be ready', () => {
  const b=bundle();
  b.review.quality_gate={status:'REWRITE_REQUIRED',blockers:['SOURCE_SIMILARITY']};
  b.review.exports.status='HOLD';
  const gate=evaluateArticleBundle(b);
  assert.equal(gate.allowed,false);
  assert.ok(gate.reasons.includes('EDITORIAL_QUALITY_NOT_READY'));
  assert.ok(gate.reasons.includes('EXPORT_NOT_READY'));
});

test('unknown or unsafe source rights fail closed', () => {
  const b=bundle();
  b.packet.admitted_sources[0].rights='FULL_REPUBLICATION_UNKNOWN';
  const gate=evaluateArticleBundle(b);
  assert.equal(gate.allowed,false);
  assert.ok(gate.reasons.includes('SOURCE_RIGHTS_NOT_ADMITTED'));
});

test('missing counterevidence blocks serious analytical article', () => {
  const b=bundle();
  b.packet.counterevidence=[];
  const gate=evaluateArticleBundle(b);
  assert.equal(gate.allowed,false);
  assert.ok(gate.reasons.includes('COUNTEREVIDENCE_REQUIRED'));
});

test('article contract never upgrades source claim ceiling or truth authority', () => {
  const out=normalizeContentIntelligenceArticle(bundle());
  assert.match(out.item.claim_ceiling,/LIBRARY_DONOR_NOT_CURRENT_TRUTH/);
  assert.equal(out.item.truth_status,'EDITORIAL_CLAIM_OUTPUT_READY');
  assert.equal(out.item.article_meta.truth_authority,false);
  assert.equal(out.item.article_meta.source_claims_validated,false);
});


test('Turkish article normalizes reader-facing technical topics to Turkish labels', () => {
  const b=bundle();
  b.editorial.language='tr';
  b.editorial.topics=['shots','xg','game-state','process','counterevidence'];
  const out=normalizeContentIntelligenceArticle(b);
  assert.deepEqual(out.item.article_meta.topics,['şut','xG','skor durumu','süreç','karşı kanıt']);
});


test('source references prefer Turkish display title while preserving original source identity', () => {
  const b=bundle();
  b.packet.admitted_sources[0].display_title='Türkçe görünen kaynak başlığı';
  const out=normalizeContentIntelligenceArticle(b);
  assert.equal(out.item.article_meta.source_refs[0].title,'Türkçe görünen kaynak başlığı');
  assert.equal(out.item.article_meta.source_refs[0].source_id,'S1');
});
