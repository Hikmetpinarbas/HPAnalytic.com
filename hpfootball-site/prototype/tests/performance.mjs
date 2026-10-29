import {execFileSync} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const out=new URL('../qa/',import.meta.url);await mkdir(out,{recursive:true});const report=[];
for(const page of ['index','article','archive','analysis']){
 const runs=[];for(let i=0;i<3;i++){const file=new URL(`lighthouse-${page}-${i}.json`,out);execFileSync(process.env.HPA_LH_BIN||'lighthouse',[`http://127.0.0.1:8099/${page}.html`,'--quiet','--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage','--output=json','--output-path='+file.pathname],{stdio:'inherit',timeout:90000});const r=JSON.parse(await readFile(file,'utf8'));runs.push({performance:r.categories.performance.score*100,accessibility:r.categories.accessibility.score*100,lcp:r.audits['largest-contentful-paint'].numericValue,cls:r.audits['cumulative-layout-shift'].numericValue,tbt:r.audits['total-blocking-time'].numericValue});}
 const median=key=>runs.map(r=>r[key]).sort((a,b)=>a-b)[1];const result={page,runs,median:Object.fromEntries(['performance','accessibility','lcp','cls','tbt'].map(k=>[k,median(k)]))};report.push(result);console.log(JSON.stringify(result));}
await writeFile(new URL('performance.json',out),JSON.stringify(report,null,2));if(report.some(r=>r.median.performance<90||r.median.accessibility<95||r.median.cls>.1))process.exitCode=1;
