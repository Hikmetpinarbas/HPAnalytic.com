import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { normalizeContentIntelligenceArticle } from './article-intake-contract.mjs';
import { admitLocalContent } from './site-admission.mjs';

const SITE_ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'../..');

async function readJson(file){
  try{return {ok:true,value:JSON.parse(await readFile(file,'utf8'))};}
  catch(error){return {ok:false,error:error?.code==='ENOENT'?'UNAVAILABLE':'INVALID_OR_UNREADABLE'};}
}

function stableCandidateName(id){
  const hash=createHash('sha256').update(String(id||'article')).digest('hex').slice(0,12);
  return 'article--'+hash+'.json';
}

export async function stageArticleRun(runDir,{workspaceRoot=SITE_ROOT,editorial={}}={}){
  const packetPath=path.join(runDir,'EDITORIAL_PACKET.json');
  const reviewPath=path.join(runDir,'ARTICLE_REVIEW_PACKAGE.json');
  const [packet,review]=await Promise.all([readJson(packetPath),readJson(reviewPath)]);
  const reasons=[];
  if(!packet.ok)reasons.push('EDITORIAL_PACKET_UNAVAILABLE');
  if(!review.ok)reasons.push('ARTICLE_REVIEW_PACKAGE_UNAVAILABLE');
  if(reasons.length)return {status:'BLOCKED',publish_allowed:false,reasons};

  const normalized=normalizeContentIntelligenceArticle({
    packet:packet.value,
    review:review.value,
    editorial:{
      section:editorial.section||'analysis',
      article_kind:editorial.article_kind||'DEEP_ANALYSIS',
      language:editorial.language||'tr',
      author:editorial.author||'Hikmet Pınarbaş',
      topics:Array.isArray(editorial.topics)?editorial.topics:[],
      series:editorial.series||'',
      visual_assets:Array.isArray(editorial.visual_assets)?editorial.visual_assets:[],
      data_insights:Array.isArray(editorial.data_insights)?editorial.data_insights:[],
    },
  });
  if(normalized.status!=='ARTICLE_REVIEW_READY'){
    return {status:'BLOCKED',publish_allowed:false,reasons:normalized.reasons||['ARTICLE_NOT_READY']};
  }

  const inbox=path.join(workspaceRoot,'editorial','inbox');
  await mkdir(inbox,{recursive:true});
  const candidatePath=path.join(inbox,stableCandidateName(normalized.item.id));
  const staged={
    ...normalized,
    staged_at:new Date().toISOString(),
    source_run:'CONTENT_INTELLIGENCE_RUN',
    publish_allowed:false,
    approval_required:'HUMAN_APPROVED',
  };
  await writeFile(candidatePath,JSON.stringify(staged,null,2)+'\n','utf8');
  return {status:'STAGED',publish_allowed:false,candidatePath,item:normalized.item};
}

export async function publishStagedArticle(candidatePath,{workspaceRoot=SITE_ROOT,humanApproval}={}){
  const staged=await readJson(candidatePath);
  if(!staged.ok)return {status:'BLOCKED',reasons:['STAGED_CANDIDATE_UNAVAILABLE']};
  const candidate=staged.value||{};
  if(candidate.status!=='ARTICLE_REVIEW_READY'||!candidate.item){
    return {status:'BLOCKED',reasons:['STAGED_CANDIDATE_NOT_READY']};
  }
  if(humanApproval!=='HUMAN_APPROVED'){
    return {status:'BLOCKED',reasons:['HUMAN_APPROVAL_REQUIRED']};
  }
  return admitLocalContent(candidate.item,{
    human_approval:humanApproval,
    collectionRoot:path.join(workspaceRoot,'src','content'),
  });
}
