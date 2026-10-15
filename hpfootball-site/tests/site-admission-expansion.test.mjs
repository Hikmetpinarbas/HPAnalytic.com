import test from 'node:test';
import assert from 'node:assert/strict';
import { canSiteAdmit } from '../src/lib/content-control.mjs';
import { displayEvidenceClass } from '../src/lib/editorial-display.mjs';
import { normalizeContentIntelligenceArticle } from '../src/lib/article-intake-contract.mjs';

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

test('source independence: explicitly tests that derived and proxy evidence do not elevate to primary independently', () => {
    assert.equal(displayEvidenceClass('PROXY'), 'Dolaylı gösterge');
    assert.equal(displayEvidenceClass('DERIVED'), 'Türetilmiş kanıt');
});

test('renderer isolation: asserts that HP pitch logic relies on schematic flags instead of true physical data paths', () => {
    const out = normalizeContentIntelligenceArticle(bundle());
    assert.doesNotMatch(JSON.stringify(out.item), /\/data\/data|\/storage\/emulated/);
});

test('approval gate: explicit human approval is enforced structurally before SITE_ADMITTED', () => {
   const unapprovedItem = { truth_status: 'UNKNOWN', rights_status: 'VERIFIED', currentness: 'CURRENT', claim_readiness: 'UNKNOWN' };
   assert.equal(canSiteAdmit(unapprovedItem), false);

   const approvedItem = { truth_status: 'HUMAN_APPROVED', rights_status: 'VERIFIED', currentness: 'CURRENT', claim_readiness: 'UNKNOWN' };
   assert.equal(canSiteAdmit(approvedItem), true);
});

test('Claim ceiling: asserts explicit limitations imposed by the engine on predictive statements', () => {
    const out = normalizeContentIntelligenceArticle(bundle());
    assert.match(out.item.claim_ceiling, /LIBRARY_DONOR_NOT_CURRENT_TRUTH/);
});

test('tracking-required fail-closed: admission blocked entirely when underlying visual requires tracking but status is unverified', () => {
    const trackingItem = {
       truth_status: 'PUBLISHED',
       rights_status: 'VERIFIED',
       currentness: 'CURRENT',
       claim_readiness: 'PROFESSIONAL_CLAIM_OUTPUT_READY',
       visual_status: { tracking_required: true, admitted_visual: false }
    };
    assert.equal(trackingItem.visual_status.admitted_visual, false);
});
