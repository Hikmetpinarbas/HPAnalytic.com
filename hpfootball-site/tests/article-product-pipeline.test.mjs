import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeContentIntelligenceArticle} from '../src/lib/article-intake-contract.mjs';
import {mkdtemp,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {admitLocalContent} from '../src/lib/site-admission.mjs';

function bundle(){
  return {
    packet:{
      status:'EDITORIAL_DRAFT_PACKET_READY',topic:'shots',
      claim_contract:{status:'READY',decomposition_required:false,claim_registry:[{claim_id:'C1'}],decomposition_backlog:[]},
      admitted_sources:[{source_id:'S1',title:'Kaynak',rights:'OWNED',claim_ceiling:'SOURCE_LEVEL',provenance:{locator:'INTERNAL'}}],
      counterevidence:['Sınır görünür.'],
    },
    review:{
      status:'REVIEW_PACKAGE_READY',
      quality_gate:{status:'EDITORIAL_REVIEW_READY',blockers:[]},
      exports:{status:'EXPORT_READY',single_editorial_identity:true,web:{content_id:'HP-X',title:'Başlık',description:'Açıklama',body:'Yeterince uzun Türkçe yazı gövdesi burada yer alır ve test için kullanılır.',claim_ceiling:'SOURCE_LEVEL'}},
    },
    editorial:{
      section:'analysis',article_kind:'DEEP_ANALYSIS',series:'METRIC_EXPLAINER',language:'tr',
      visual_assets:[
        {visual_id:'V1',src:'/media/v1.jpg',caption:'Kare',claim_supported:'İddia',rights_status:'EDITORIAL_LICENSED',truth_role:'OBSERVED_FRAME',visual_role:'INLINE_EVIDENCE'},
        {visual_id:'V2',src:'/media/v2.jpg',caption:'İç inceleme',claim_supported:'İddia',rights_status:'RIGHTS_REVIEW_REQUIRED',truth_role:'OBSERVED_FRAME',visual_role:'INLINE_EVIDENCE'},
      ],
      data_insights:[{question:'Ne görüyoruz?',metric:'22 → 28 şut',interpretation:'Hacim aynı anlamı taşımaz.',limit:'İki maçlık örnek.',source_label:'HP iç veri'}],
    }
  };
}

test('article intake carries series visual assets and data insights without publishing them',()=>{
  const out=normalizeContentIntelligenceArticle(bundle());
  assert.equal(out.item.article_meta.series,'METRIC_EXPLAINER');
  assert.equal(out.item.article_meta.visual_assets.length,2);
  assert.equal(out.item.article_meta.data_insights.length,1);
  assert.equal(out.publish_allowed,false);
});

test('site admission serializes only rights-cleared visual assets',async()=>{
  const item=normalizeContentIntelligenceArticle(bundle()).item;
  const root=await mkdtemp(path.join(tmpdir(),'hp-product-'));
  const out=await admitLocalContent(item,{human_approval:'HUMAN_APPROVED',collectionRoot:root});
  const text=await readFile(path.join(root,out.relativePath),'utf8');
  assert.match(text,/series: "METRIC_EXPLAINER"/);
  assert.match(text,/visualAssets:/);
  assert.match(text,/V1/);
  assert.doesNotMatch(text,/V2/);
  assert.match(text,/dataInsights:/);
  assert.match(text,/22 → 28 şut/);
});
