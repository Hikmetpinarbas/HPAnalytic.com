import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const UNKNOWN_VALUES=new Set(['UNKNOWN','NOT_AVAILABLE','']);
const ACCEPTABLE_RIGHTS=new Set(['OWNED','LICENSED','EMBEDDABLE','ATTRIBUTION_REQUIRED']);
const ACCEPTABLE_FRESHNESS=new Set(['PASS','CURRENT','FRESH']);
const ACCEPTABLE_CLAIM_READINESS=new Set(['PROFESSIONAL_CLAIM_OUTPUT_READY','EDITORIAL_CLAIM_OUTPUT_READY']);

const ROUTES={
  MATCH_ANALYSIS:{collection:'articles',section:'analysis'},
  PREMATCH:{collection:'articles',section:'analysis'},
  POSTMATCH:{collection:'articles',section:'analysis'},
  PLAYER_ANALYSIS:{collection:'articles',section:'scouting'},
  SCOUTING:{collection:'articles',section:'scouting'},
  RESEARCH:{collection:'research',section:null},
  CULTURE:{collection:'articles',section:'culture'},
  VISUAL_STORY:{collection:'visuals',section:null},
  ARTICLE_ANALYSIS:{collection:'articles',section:'analysis'},
  ARTICLE_SCOUTING:{collection:'articles',section:'scouting'},
  ARTICLE_CULTURE:{collection:'articles',section:'culture'},
  ARTICLE_METHOD:{collection:'articles',section:'method'},
};

export function routeDestination(contentType){
  return ROUTES[contentType]||null;
}

function validText(value){return typeof value==='string'&&!UNKNOWN_VALUES.has(value.trim());}
function hasBlockingWarning(warnings=[]){return warnings.some(w=>/BLOCKING|BLOCKED|SOURCE_CONFLICT/i.test(String(w)));}
function evidenceRole(item){
  const value=item.evidence_status?.evidence_class;
  return Array.isArray(value)?value.join(','):value||'UNKNOWN';
}

export function evaluateAdmission(item,{human_approval}={}){
  const destination=routeDestination(item?.content_type);
  const reasons=[];
  if(human_approval!=='HUMAN_APPROVED')reasons.push('HUMAN_APPROVAL_REQUIRED');
  if(!ACCEPTABLE_CLAIM_READINESS.has(item?.claim_readiness)){
    reasons.push(item?.source_system==='HP_CONTENT_INTELLIGENCE'?'EDITORIAL_OUTPUT_NOT_READY':'PROFESSIONAL_OUTPUT_NOT_READY');
  }
  if(item?.truth_status==='BLOCKED'||item?.truth_status==='REVIEW_REQUIRED')reasons.push('CLAIM_STATE_BLOCKS_ADMISSION');
  if(!ACCEPTABLE_FRESHNESS.has(item?.freshness))reasons.push('FRESHNESS_NOT_ACCEPTABLE');
  if(item?.currentness!=='CURRENT')reasons.push('NOT_CURRENT');
  if(!ACCEPTABLE_RIGHTS.has(item?.rights_status))reasons.push('RIGHTS_NOT_ACCEPTABLE');
  if(hasBlockingWarning(item?.warnings))reasons.push('BLOCKING_WARNING');
  if(item?.source_system==='HP_CONTENT_INTELLIGENCE'&&item?.article_meta?.psychology_status!=='PASS')reasons.push('PSYCHOLOGY_GATE_REQUIRED');
  if(!destination)reasons.push('DESTINATION_UNKNOWN');
  if(!validText(item?.title))reasons.push('TITLE_REQUIRED');
  if(!validText(item?.body))reasons.push('HUMAN_BODY_REQUIRED');
  if(!validText(item?.provenance))reasons.push('PROVENANCE_REQUIRED');
  if(item?.visual_required===true){
    if(item?.visual_status?.admitted_visual!==true)reasons.push('VISUAL_NOT_ADMITTED');
    if(!ACCEPTABLE_RIGHTS.has(item?.visual_status?.rights))reasons.push('VISUAL_RIGHTS_NOT_ACCEPTABLE');
  }
  return {allowed:reasons.length===0,reasons,destination};
}

function safeSlug(input){
  return String(input||'content').normalize('NFKD').replace(/[^\w\s-]/g,'').trim().toLowerCase().replace(/[\s_]+/g,'-').replace(/-+/g,'-').slice(0,64)||'content';
}
function stableName(item){
  const hash=createHash('sha256').update(String(item.id)).digest('hex').slice(0,10);
  return safeSlug(item.title)+'--'+hash+'.md';
}
function q(value){return JSON.stringify(String(value??''));}
function dateOnly(value){
  const raw=validText(value)?String(value):new Date(0).toISOString();
  return /^\d{4}-\d{2}-\d{2}/.test(raw)?raw.slice(0,10):'1970-01-01';
}
function summaryFrom(item){
  const body=String(item.body||'').replace(/\s+/g,' ').trim();
  return body.length>220?body.slice(0,217)+'...':body;
}
function visualRefs(item){
  if(item.visual_status?.admitted_visual!==true)return [];
  const product=item.visual_status?.product;
  return validText(product)?[product]:[];
}

function serialize(item,destination,status='PUBLISHED'){
  const lines=[
    '---',
    'title: '+q(item.title),
    'description: '+q(item.article_meta?.description||summaryFrom(item)),
    'date: '+q(dateOnly(item.generated_at)),
  ];
  if(destination.collection==='articles'){
    const meta=item.article_meta||{};
    lines.push('section: '+q(destination.section));
    lines.push('evidenceClass: '+q(['DIRECT','DERIVED','PROXY','EDITORIAL'].includes(evidenceRole(item))?evidenceRole(item):'EDITORIAL'));
    lines.push('claimCeiling: '+q(item.visual_status?.visual_claim_ceiling||item.claim_ceiling||item.truth_status));
    lines.push('featured: false');
    if(item.source_system==='HP_CONTENT_INTELLIGENCE'){
      lines.push('articleKind: '+q(meta.article_kind||'DEEP_ANALYSIS'));
      if(meta.series)lines.push('series: '+q(meta.series));
      const safeVisualRights=new Set(['OWNED','LICENSED','EDITORIAL_LICENSED','PUBLIC_DOMAIN','ORIGINAL']);
      const publicVisualAssets=(meta.visual_assets||[]).filter(v=>safeVisualRights.has(String(v?.rights_status||'').toUpperCase()));
      if(publicVisualAssets.length)lines.push('visualAssets: '+JSON.stringify(publicVisualAssets));
      if((meta.data_insights||[]).length)lines.push('dataInsights: '+JSON.stringify(meta.data_insights));
      lines.push('author: '+q(meta.author||'Hikmet Pınarbaş'));
      lines.push('language: '+q(meta.language||'tr'));
      lines.push('topics: '+JSON.stringify(meta.topics||[]));
      lines.push('sourceRefs: '+JSON.stringify(meta.source_refs||[]));
      lines.push('sourceRights: '+JSON.stringify(meta.source_rights||[]));
      lines.push('claimIds: '+JSON.stringify(meta.claim_ids||[]));
      lines.push('counterevidence: '+JSON.stringify(meta.counterevidence||[]));
      lines.push('readingMinutes: '+Number(meta.reading_minutes||1));
      lines.push('truthAuthority: '+Boolean(meta.truth_authority));
      lines.push('sourceClaimsValidated: '+Boolean(meta.source_claims_validated));
      lines.push('qualityStatus: '+q(meta.quality_status||'UNKNOWN'));
    }
  }else if(destination.collection==='research'){
    lines.push('claimCeiling: '+q(item.visual_status?.visual_claim_ceiling||item.claim_ceiling||item.truth_status));
    lines.push('featured: false');
  }else if(destination.collection==='visuals'){
    lines.push('visualClass: '+q(item.visual_class||'DATA_VISUAL'));
    lines.push('claimCeiling: '+q(item.visual_status?.visual_claim_ceiling||item.claim_ceiling||item.truth_status));
    lines.push('featured: false');
  }
  lines.push(
    'target: '+q(item.target),
    'content_type: '+q(item.content_type),
    'source_system: '+q(item.source_system),
    'claim_status: '+q(item.claim_readiness),
    'evidence_role: '+q(evidenceRole(item)),
    'rights_status: '+q(item.rights_status),
    'canonical_content_id: '+q(item.id),
    'visual_refs: '+JSON.stringify(visualRefs(item)),
    'summary: '+q(summaryFrom(item)),
    'body: '+q(item.body),
    'provenance: '+q(item.provenance),
    'editorial_status: '+q(status),
    '---','',String(item.body).trim(),'','---','Editorial provenance retained. Claim metadata is inherited from HPA and is not upgraded by site admission.',''
  );
  return lines.join('\n');
}

async function historyPath(collectionRoot,id){
  const hash=createHash('sha256').update(String(id)).digest('hex');
  return path.join(collectionRoot,'.editorial-history',hash+'.json');
}
async function readHistoryFile(collectionRoot,id){
  const file=await historyPath(collectionRoot,id);
  try{return JSON.parse(await readFile(file,'utf8'));}catch{return [];}
}
async function writeHistory(collectionRoot,id,events){
  const file=await historyPath(collectionRoot,id);
  await mkdir(path.dirname(file),{recursive:true});
  await writeFile(file,JSON.stringify(events,null,2));
}

export async function admitLocalContent(item,{human_approval,collectionRoot,testFixture=false}={}){
  const gate=evaluateAdmission(item,{human_approval});
  if(!gate.allowed)return {status:'BLOCKED',reasons:gate.reasons};
  const folder=path.join(collectionRoot,gate.destination.collection);
  await mkdir(folder,{recursive:true});
  const relativePath=path.join(gate.destination.collection,stableName(item));
  const fullPath=path.join(collectionRoot,relativePath);
  await writeFile(fullPath,serialize(item,gate.destination,'PUBLISHED'));
  const history=await readHistoryFile(collectionRoot,item.id);
  history.push({status:'PUBLISHED',canonical_content_id:item.id,relativePath,source_system:item.source_system,test_fixture:Boolean(testFixture)});
  await writeHistory(collectionRoot,item.id,history);
  return {status:'SITE_ADMITTED',relativePath,destination:gate.destination,testFixture:Boolean(testFixture)};
}

function parseFrontmatter(text){
  const match=text.match(/^---\n([\s\S]*?)\n---/);
  if(!match)return {};
  const out={};
  for(const line of match[1].split('\n')){
    const i=line.indexOf(':'); if(i<0)continue;
    const key=line.slice(0,i).trim(); const raw=line.slice(i+1).trim();
    try{out[key]=JSON.parse(raw);}catch{out[key]=raw;}
  }
  return out;
}

export async function listPublicLocalContent(collectionRoot){
  const result=[];
  for(const collection of ['articles','research','visuals']){
    const dir=path.join(collectionRoot,collection);
    let files=[]; try{files=await readdir(dir);}catch{continue;}
    for(const file of files.filter(x=>x.endsWith('.md'))){
      const data=parseFrontmatter(await readFile(path.join(dir,file),'utf8'));
      if(data.editorial_status!=='PUBLISHED')continue;
      result.push({collection,section:data.section||null,canonical_content_id:data.canonical_content_id,relativePath:path.join(collection,file)});
    }
  }
  return result;
}

export async function withdrawLocalContent(canonicalContentId,{collectionRoot,reason='WITHDRAWN'}={}){
  for(const collection of ['articles','research','visuals']){
    const dir=path.join(collectionRoot,collection);
    let files=[]; try{files=await readdir(dir);}catch{continue;}
    for(const file of files.filter(x=>x.endsWith('.md'))){
      const full=path.join(dir,file); const text=await readFile(full,'utf8'); const data=parseFrontmatter(text);
      if(data.canonical_content_id!==canonicalContentId)continue;
      const updated=text.replace(/editorial_status:\s*"?PUBLISHED"?/,'editorial_status: "WITHDRAWN"');
      await writeFile(full,updated);
      const relativePath=path.join(collection,file);
      const history=await readHistoryFile(collectionRoot,canonicalContentId);
      history.push({status:'WITHDRAWN',canonical_content_id:canonicalContentId,relativePath,reason});
      await writeHistory(collectionRoot,canonicalContentId,history);
      return {status:'WITHDRAWN',relativePath};
    }
  }
  return {status:'NOT_AVAILABLE'};
}

export async function readEditorialHistory(canonicalContentId,{collectionRoot}={}){
  return readHistoryFile(collectionRoot,canonicalContentId);
}
