import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'../..');
const clean=(v,f='UNKNOWN')=>v===undefined||v===null||v===''?f:String(v);

export async function loadArticleInbox({workspaceRoot=SITE_ROOT}={}){
  const dir=path.join(workspaceRoot,'editorial','inbox');
  let files=[];
  try{files=(await readdir(dir)).filter(x=>x.endsWith('.json')).sort();}
  catch{return [];}
  const out=[];
  for(const file of files){
    try{
      const staged=JSON.parse(await readFile(path.join(dir,file),'utf8'));
      if(staged?.status!=='ARTICLE_REVIEW_READY'||!staged?.item)continue;
      const item=staged.item;
      const meta=item.article_meta||{};
      out.push({
        id:clean(item.id),
        title:clean(item.title),
        target:clean(item.target),
        content_type:clean(item.content_type),
        staged_at:clean(staged.staged_at),
        approval_required:clean(staged.approval_required),
        rights_status:clean(item.rights_status),
        claim_ceiling:clean(item.claim_ceiling),
        quality_status:clean(meta.quality_status),
        source_count:Number(meta.source_count||0),
        claim_count:Array.isArray(meta.claim_ids)?meta.claim_ids.length:0,
        reading_minutes:Number(meta.reading_minutes||0),
        topics:Array.isArray(meta.topics)?meta.topics.map(String):[],
        publish_allowed:false,
      });
    }catch{
      continue;
    }
  }
  return out;
}
