#!/usr/bin/env node
import { stageArticleRun } from '../src/lib/article-pipeline.mjs';

const args=process.argv.slice(2);
const runDir=args[0];
if(!runDir){
  console.error('usage: npm run article:stage -- <CONTENT_INTELLIGENCE_RUN_DIR> [--section analysis] [--kind DEEP_ANALYSIS] [--topic tag]');
  process.exit(2);
}
const get=(flag,fallback)=>{
  const i=args.indexOf(flag);
  return i>=0&&args[i+1]?args[i+1]:fallback;
};
const topics=[];
for(let i=0;i<args.length;i++)if(args[i]==='--topic'&&args[i+1])topics.push(args[i+1]);

const out=await stageArticleRun(runDir,{
  editorial:{
    section:get('--section','analysis'),
    article_kind:get('--kind','DEEP_ANALYSIS'),
    language:get('--language','tr'),
    author:get('--author','Hikmet Pınarbaş'),
    topics,
  },
});
console.log(JSON.stringify(out,null,2));
process.exit(out.status==='STAGED'?0:1);
