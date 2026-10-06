#!/usr/bin/env node
import { publishStagedArticle } from '../src/lib/article-pipeline.mjs';

const args=process.argv.slice(2);
const candidatePath=args[0];
const i=args.indexOf('--approve');
const approval=i>=0?args[i+1]:undefined;
if(!candidatePath){
  console.error('usage: npm run article:publish -- <STAGED_CANDIDATE_JSON> --approve HUMAN_APPROVED');
  process.exit(2);
}
if(approval!=='HUMAN_APPROVED'){
  console.error('BLOCKED: explicit --approve HUMAN_APPROVED is required.');
  process.exit(3);
}
const out=await publishStagedArticle(candidatePath,{humanApproval:approval});
console.log(JSON.stringify(out,null,2));
process.exit(out.status==='SITE_ADMITTED'?0:1);
