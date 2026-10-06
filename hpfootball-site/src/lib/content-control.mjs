import { readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

export const STATUS_FLOW=['INTAKE','VALIDATED','REVIEW_READY','HUMAN_APPROVED','SITE_ADMITTED','PUBLISHED'];
const UNKNOWN='UNKNOWN';
const NOT_AVAILABLE='NOT_AVAILABLE';
const SOCIAL={X:'x_single',Thread:'x_thread','Instagram Carousel':'instagram_carousel',Reel:'reel_script','YouTube Short':'youtube_short_script'};
const present=(v,f=UNKNOWN)=>v===undefined||v===null||v===''?f:v;
const same=(a,b)=>String(a||'').trim().toLowerCase()===String(b||'').trim().toLowerCase();
const logical=(name)=>name;

async function readJson(filePath,label){
  try{return {value:JSON.parse(await readFile(filePath,'utf8')),warning:null};}
  catch(error){
    const code=error instanceof SyntaxError?'INVALID_JSON':(error?.code==='ENOENT'?NOT_AVAILABLE:'READ_ERROR');
    return {value:{},warning:'SOURCE:'+label+':'+code};
  }
}
async function readText(filePath,label){
  try{return {value:await readFile(filePath,'utf8'),warning:null};}
  catch(error){return {value:'',warning:'SOURCE:'+label+':'+(error?.code==='ENOENT'?NOT_AVAILABLE:'READ_ERROR')};}
}
function socialStatus(social={},enabled=true){
  const out={};
  for(const [label,key] of Object.entries(SOCIAL))out[label]=enabled?present(social.derivatives?.[key]?.status):UNKNOWN;
  out['Visual Brief']=enabled?present(social.derivatives?.visual_brief?.status):UNKNOWN;
  return out;
}
function emptyEvidence(){return {canonical_source_available:UNKNOWN,source_count:UNKNOWN,evidence_class:UNKNOWN,provenance:UNKNOWN,unresolved_source_conflict:UNKNOWN};}
function safeWarnings(values){return values.filter(Boolean).map(x=>String(x).replace(/\/(?:data|storage|home)\/[^\s:]*/g,'[LOCAL_PATH]'));}

export function canSiteAdmit(item){
  if(!item)return false;
  if(['BLOCKED','REVIEW_REQUIRED',UNKNOWN,NOT_AVAILABLE].includes(item.rights_status))return false;
  if(['BLOCKED','REVIEW_REQUIRED',UNKNOWN,NOT_AVAILABLE].includes(item.truth_status))return false;
  if(['STALE','SUPERSEDED',UNKNOWN].includes(item.currentness))return false;
  return ['HUMAN_APPROVED','SITE_ADMITTED','PUBLISHED','PROFESSIONAL_CLAIM_OUTPUT_READY'].includes(item.truth_status)||item.claim_readiness==='PROFESSIONAL_CLAIM_OUTPUT_READY';
}

export function normalizeControlItem({master={},social={},admission={},context={},visual={},sourcePath=UNKNOWN,warnings=[]}={}){
  const truth_status=master.status==='BLOCKED'?'BLOCKED':master.web_route?.quality_status==='REVIEW_REQUIRED'||master.status==='REVIEW_READY'?'REVIEW_REQUIRED':present(master.status);
  const rights_status=present(master.rights_status||admission.rights_status);
  let site_admission=present(master.site_admission||admission.site_admission);
  const item={id:present(master.content_id),title:present(master.title),content_type:present(master.content_type||social.job_type),target:present(master.target||social.target),source_system:present(master.source_type||social.truth_source),source_path:sourcePath===UNKNOWN?UNKNOWN:logical('EDITORIAL_CURRENT'),generated_at:present(master.generated_at||social.generated_at||admission.generated_at),freshness:present(context.human_delivery?.semantic_freshness?.status),current_status:present(master.status),currentness:present(master.currentness),truth_status,claim_readiness:present(master.claim_readiness),evidence_status:emptyEvidence(),rights_status,visual_status:{admitted_visual:UNKNOWN,renderer_status:present(visual.status),visual_claim_ceiling:present(master.claim_ceiling),asset_available:UNKNOWN,production_pending:present(visual.production_pending),package_status:present(visual.status),product:present(visual.product),rights:UNKNOWN},site_admission,social_status:socialStatus(social),public_url:present(master.public_url),destination:present(master.destination),body:present(master.body),provenance:present(master.provenance),warnings:safeWarnings(warnings)};
  if(site_admission==='APPROVED_FOR_SITE'&&!canSiteAdmit(item))item.site_admission=truth_status==='BLOCKED'||rights_status==='BLOCKED'?'BLOCKED':'REVIEW_READY';
  return item;
}

function currentItem({analysis,context,lineage,meta,social,visual,humanText,warnings}){
  const target=present(analysis.target);
  const mode=present(analysis.job_type||lineage.active_work_context?.mode||meta.mode);
  const aligned=same(lineage.active_work_context?.target,target)&&same(lineage.active_work_context?.mode,mode)&&lineage.active_work_context?.authority==='CURRENT_ANALYSIS_STATE';
  const human=context.human_delivery||{};
  const humanAligned=same(human.semantic_freshness?.target,target)&&same(human.semantic_freshness?.mode,mode);
  const socialAligned=same(social.target,target)&&same(social.job_type,mode);
  const readiness=humanAligned?present(human.semantic_freshness?.authority||human.authority):same(meta.target,target)&&same(meta.mode,mode)?present(meta.authority):UNKNOWN;
  const freshness=humanAligned?present(human.semantic_freshness?.status):UNKNOWN;
  const truth=readiness==='PROFESSIONAL_CLAIM_OUTPUT_READY'?'PROFESSIONAL_CLAIM_OUTPUT_READY':UNKNOWN;
  const item={
    id:target!==UNKNOWN&&mode!==UNKNOWN?'analysis_state::'+mode+'::'+target:UNKNOWN,
    title:target!==UNKNOWN&&mode!==UNKNOWN?target+' — '+mode:UNKNOWN,
    content_type:mode,target,source_system:'HPA_CURRENT_ANALYSIS',source_path:logical('HPA CURRENT ANALYSIS'),
    generated_at:present(meta.generated_at),freshness,current_status:present(context.status),currentness:aligned?'CURRENT':UNKNOWN,
    truth_status:truth,claim_readiness:readiness,
    evidence_status:{canonical_source_available:analysis.target?true:UNKNOWN,source_count:Array.isArray(analysis.contributions)?analysis.contributions.length:UNKNOWN,evidence_class:'HPA_CANONICAL_CURRENT',provenance:'HPA CURRENT ANALYSIS → CURRENT HUMAN ARTIFACT',unresolved_source_conflict:UNKNOWN},
    rights_status:UNKNOWN,
    visual_status:{admitted_visual:visual.status==='ACCEPTED',renderer_status:present(visual.physical_gate?.status),visual_claim_ceiling:present(analysis.claim_ceiling||meta.claim_ceiling),asset_available:visual.status==='ACCEPTED',production_pending:UNKNOWN,package_status:present(visual.status),product:present(visual.product||lineage.visual_product),rights:UNKNOWN},
    site_admission:readiness==='PROFESSIONAL_CLAIM_OUTPUT_READY'?'REVIEW_READY':'UNKNOWN',
    social_status:socialStatus(social,socialAligned),public_url:UNKNOWN,destination:UNKNOWN,
    body:humanText||NOT_AVAILABLE,
    provenance:'Current analysis authority with current human-delivery status; site does not upgrade truth.',
    warnings:safeWarnings([...warnings,...(!socialAligned&&social.target?['SOCIAL_TARGET_OR_MODE_MISMATCH']:[]),...(aligned?[]:['CURRENT_AUTHORITY_NOT_CONFIRMED'])]),
  };
  return item;
}

function staleItems({master,lineage,currentTarget}){
  const out=[];
  if(master.target&& !same(master.target,currentTarget))out.push({...normalizeControlItem({master}),currentness:'SUPERSEDED',source_path:'EDITORIAL CONTENT MASTER',site_admission:'NOT_ADMITTED',warnings:['EDITORIAL_POINTER_DOES_NOT_MATCH_CURRENT_AUTHORITY']});
  const pub=lineage.publication_product||{};
  if(pub.target&&!same(pub.target,currentTarget))out.push({id:'publication::'+present(pub.kind)+'::'+pub.target,title:pub.target+' — '+present(pub.kind),content_type:present(pub.kind),target:pub.target,source_system:'HPA_PUBLICATION_POINTER',source_path:'HPA PUBLICATION POINTER',generated_at:UNKNOWN,freshness:present(pub.semantic_freshness?.status),current_status:present(pub.role),currentness:'STALE',truth_status:UNKNOWN,claim_readiness:UNKNOWN,evidence_status:emptyEvidence(),rights_status:UNKNOWN,visual_status:{admitted_visual:UNKNOWN,renderer_status:UNKNOWN,visual_claim_ceiling:UNKNOWN,asset_available:UNKNOWN,production_pending:UNKNOWN,package_status:UNKNOWN,product:UNKNOWN,rights:UNKNOWN},site_admission:'NOT_ADMITTED',social_status:socialStatus({},false),public_url:UNKNOWN,destination:UNKNOWN,body:NOT_AVAILABLE,provenance:'Historical publication pointer; not current authority.',warnings:['STALE_PUBLICATION_POINTER']});
  return out;
}

export async function loadControlItems({stateRoot=process.env.HPA_STATE_ROOT||path.join(os.homedir(),'PHONE_AUTOMATION','state'),humanRoot='/storage/emulated/0/Documents/HPA'}={}){
  const specs={analysis:['analysis_state_current.json','ANALYSIS_STATE_CURRENT'],context:['HPA_CURRENT_CONTEXT.json','HPA_CURRENT_CONTEXT'],lineage:['HPA_ARTIFACT_LINEAGE_CURRENT.json','HPA_ARTIFACT_LINEAGE_CURRENT'],meta:['HPA_POSTMATCH_CURRENT.meta.json','HPA_POSTMATCH_CURRENT_META'],master:['social_content/HPA_CONTENT_MASTER_CURRENT.json','HPA_CONTENT_MASTER_CURRENT'],social:['social_content/HPA_SOCIAL_PACKAGE_CURRENT.json','HPA_SOCIAL_PACKAGE_CURRENT'],visual:['visual_physical_acceptance_current.json','HPA_VISUAL_ACCEPTANCE_CURRENT'],admission:['content_foundry_admission_current.json','CONTENT_FOUNDRY_ADMISSION_CURRENT']};
  const loaded={}; const warnings=[];
  for(const [key,[rel,label]] of Object.entries(specs)){const r=await readJson(path.join(stateRoot,rel),label);loaded[key]=r.value;if(r.warning)warnings.push(r.warning);}
  const humanFile=(loaded.context.human_delivery?.files||[]).find(x=>String(x).toLowerCase().endsWith('.txt'));
  let humanText='';
  if(humanFile){const r=await readText(path.join(humanRoot,path.basename(humanFile)),'CURRENT_HUMAN_TEXT');humanText=r.value;if(r.warning)warnings.push(r.warning);}else warnings.push('CURRENT_HUMAN_TEXT:'+NOT_AVAILABLE);
  const current=currentItem({...loaded,humanText,warnings});
  const items=[current,...staleItems({master:loaded.master,lineage:loaded.lineage,currentTarget:current.target})];
  if(current.target===UNKNOWN&&loaded.master.content_id)return [normalizeControlItem({master:loaded.master,social:loaded.social,admission:loaded.admission,context:loaded.context,visual:loaded.visual,warnings})];
  return items;
}
