const SAFE_SOURCE_RIGHTS=new Set([
  'OWNED','LICENSED','PUBLIC_DOMAIN','SUMMARY_TRANSFORM_ATTRIBUTE','ORIGINAL','ATTRIBUTION_REQUIRED'
]);
const SECTION_TO_TYPE={
  analysis:'ARTICLE_ANALYSIS',
  scouting:'ARTICLE_SCOUTING',
  culture:'ARTICLE_CULTURE',
  method:'ARTICLE_METHOD',
  research:'RESEARCH',
};
const SERIOUS_SECTIONS=new Set(['analysis','scouting','method','research']);
const TURKISH_TOPIC_LABELS={
  shots:'şut',
  shot:'şut',
  xg:'xG',
  'game-state':'skor durumu',
  'game state':'skor durumu',
  process:'süreç',
  counterevidence:'karşı kanıt',
  tracking:'oyuncu ve top takip verisi',
  possession:'topa sahip olma',
  'shot quality':'şut kalitesi',
  'shot volume':'şut hacmi',
};

const text=(v)=>String(v??'').trim();
const list=(v)=>Array.isArray(v)?v:[];

function safeLocator(value){
  const v=text(value);
  return /^https?:\/\//i.test(v)?v:'INTERNAL_OR_NONPUBLIC_SOURCE';
}

function sourceRefs(packet={}){
  return list(packet.admitted_sources).map((s)=>({
    source_id:text(s?.source_id)||'UNKNOWN',
    title:text(s?.display_title)||text(s?.title)||'Untitled source',
    locator:safeLocator(s?.provenance?.locator),
    rights:text(s?.rights)||'UNKNOWN',
    claim_ceiling:text(s?.claim_ceiling)||'UNKNOWN',
  }));
}

function readingMinutes(body){
  const words=text(body).split(/\s+/).filter(Boolean).length;
  return Math.max(1,Math.ceil(words/220));
}

function displayTopics(topics,language){
  const rows=list(topics).map(text).filter(Boolean);
  if(text(language).toLowerCase()!=='tr')return rows;
  return rows.map((topic)=>TURKISH_TOPIC_LABELS[topic.toLowerCase()]||topic);
}

export function evaluateArticleBundle(bundle={}){
  const packet=bundle.packet||{};
  const review=bundle.review||{};
  const exports=review.exports||{};
  const web=exports.web||{};
  const editorial=bundle.editorial||{};
  const section=text(editorial.section).toLowerCase();
  const contract=packet.claim_contract||{};
  const reasons=[];

  if(packet.status!=='EDITORIAL_DRAFT_PACKET_READY')reasons.push('EDITORIAL_PACKET_NOT_READY');
  if(contract.decomposition_required===true||contract.status!=='READY')reasons.push('CLAIM_DECOMPOSITION_REQUIRED');
  if(list(contract.claim_registry).length===0)reasons.push('CLAIM_REGISTRY_EMPTY');
  if(review.status!=='REVIEW_PACKAGE_READY')reasons.push('REVIEW_PACKAGE_NOT_READY');
  if(review.quality_gate?.status!=='EDITORIAL_REVIEW_READY')reasons.push('EDITORIAL_QUALITY_NOT_READY');
  if(exports.status!=='EXPORT_READY')reasons.push('EXPORT_NOT_READY');
  if(!text(web.content_id)||!text(web.title)||!text(web.body))reasons.push('ARTICLE_CONTENT_MISSING');
  if(!SECTION_TO_TYPE[section])reasons.push('ARTICLE_SECTION_UNKNOWN');

  const sources=list(packet.admitted_sources);
  if(sources.length===0)reasons.push('ADMITTED_SOURCE_REQUIRED');
  if(sources.some((s)=>!SAFE_SOURCE_RIGHTS.has(text(s?.rights).toUpperCase())))reasons.push('SOURCE_RIGHTS_NOT_ADMITTED');

  if(SERIOUS_SECTIONS.has(section)&&list(packet.counterevidence).length===0)reasons.push('COUNTEREVIDENCE_REQUIRED');

  return {
    allowed:reasons.length===0,
    reasons:[...new Set(reasons)],
    destination_type:SECTION_TO_TYPE[section]||null,
  };
}

export function normalizeContentIntelligenceArticle(bundle={}){
  const gate=evaluateArticleBundle(bundle);
  if(!gate.allowed)return {status:'BLOCKED',publish_allowed:false,reasons:gate.reasons,item:null};

  const packet=bundle.packet||{};
  const review=bundle.review||{};
  const web=review.exports.web||{};
  const editorial=bundle.editorial||{};
  const claims=list(packet.claim_contract?.claim_registry);
  const sources=sourceRefs(packet);
  const sourceRights=[...new Set(sources.map((s)=>s.rights))];
  const rightsStatus=sourceRights.every((x)=>x==='OWNED'||x==='ORIGINAL')?'OWNED':'ATTRIBUTION_REQUIRED';
  const claimCeiling=text(web.claim_ceiling)||list(packet.claim_ceilings).map(text).filter(Boolean).join(' | ')||'UNKNOWN';
  const counterevidence=list(packet.counterevidence).map(text).filter(Boolean);

  const item={
    id:text(web.content_id),
    title:text(web.title),
    target:text(packet.topic)||text(web.title),
    content_type:gate.destination_type,
    source_system:'HP_CONTENT_INTELLIGENCE',
    generated_at:text(review.exports.generated_at)||new Date().toISOString(),
    freshness:'PASS',
    currentness:'CURRENT',
    truth_status:'EDITORIAL_CLAIM_OUTPUT_READY',
    claim_readiness:'EDITORIAL_CLAIM_OUTPUT_READY',
    claim_ceiling:claimCeiling,
    rights_status:rightsStatus,
    evidence_status:{
      evidence_class:'EDITORIAL',
      provenance:'HP CONTENT INTELLIGENCE → CLAIM CONTRACT → EDITORIAL REVIEW',
      canonical_source_available:sources.length>0,
      source_count:sources.length,
      unresolved_source_conflict:false,
    },
    visual_status:{
      admitted_visual:false,
      rights:'UNKNOWN',
      visual_claim_ceiling:claimCeiling,
      product:'UNKNOWN',
    },
    body:text(web.body),
    provenance:'HP Content Intelligence claim-first synthesis; site admission does not upgrade source claims.',
    warnings:[],
    social_status:{},
    article_meta:{
      section:text(editorial.section).toLowerCase(),
      description:text(web.description),
      article_kind:text(editorial.article_kind)||'DEEP_ANALYSIS',
      series:text(editorial.series)||'',
      visual_assets:list(editorial.visual_assets),
      data_insights:list(editorial.data_insights),
      language:text(editorial.language)||'tr',
      author:text(editorial.author)||'Hikmet Pınarbaş',
      topics:displayTopics(editorial.topics,editorial.language||'tr'),
      source_count:sources.length,
      source_refs:sources,
      source_rights:sourceRights,
      claim_ids:claims.map((c)=>text(c?.claim_id)).filter(Boolean),
      counterevidence,
      reading_minutes:readingMinutes(web.body),
      truth_authority:false,
      source_claims_validated:false,
      single_editorial_identity:review.exports.single_editorial_identity===true,
      quality_status:text(review.quality_gate?.status),
    },
  };

  return {status:'ARTICLE_REVIEW_READY',publish_allowed:false,reasons:[],item};
}
