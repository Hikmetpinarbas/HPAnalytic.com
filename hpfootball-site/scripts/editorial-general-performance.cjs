const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const out='qa-artifacts/general-performance';fs.mkdirSync(out,{recursive:true});
const pages=[['home','/'],['match-preview','/mac/lille-galatasaray-2026-10-21/'],['reading','/articles/event-only-boundary/']];
const rows=[];const median=xs=>xs.sort((a,b)=>a-b)[Math.floor(xs.length/2)];
for(const [name,path] of pages) for(let cycle=1;cycle<=3;cycle++) {
 const file=`${out}/${name}-${cycle}.json`;
 const r=spawnSync(process.env.HPA_LH_BIN,[`http://127.0.0.1:4322${path}`,'--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage','--only-categories=performance,accessibility,best-practices,seo','--output=json',`--output-path=${file}`,'--quiet','--max-wait-for-load=30000'],{encoding:'utf8',timeout:120000});
 if(r.status!==0) throw Error(r.stderr||r.error||'Lighthouse did not finish');
 const d=JSON.parse(fs.readFileSync(file,'utf8'));if(d.runtimeError)throw Error(JSON.stringify(d.runtimeError));
 const row={name,path,cycle,scores:Object.fromEntries(Object.entries(d.categories).map(([k,v])=>[k,Math.round(v.score*100)])),lcp:d.audits['largest-contentful-paint'].numericValue,tbt:d.audits['total-blocking-time'].numericValue,cls:d.audits['cumulative-layout-shift'].numericValue};rows.push(row);console.log(JSON.stringify(row));
 fs.writeFileSync(`${out}/runs.json`,JSON.stringify(rows,null,2));
}
const summary=pages.map(([name,path])=>{const group=rows.filter(x=>x.name===name);return{name,path,runs:3,scores:Object.fromEntries(Object.keys(group[0].scores).map(k=>[k,median(group.map(x=>x.scores[k]))])),lcp:median(group.map(x=>x.lcp)),tbt:median(group.map(x=>x.tbt)),cls:median(group.map(x=>x.cls))};});
const failures=[];for(const row of summary){if(row.scores.performance<90)failures.push(`${row.name}: mobile performance below 90`);for(const key of ['accessibility','best-practices','seo'])if(row.scores[key]<95)failures.push(`${row.name}: ${key} below 95`);}
fs.writeFileSync(`${out}/summary.json`,JSON.stringify({method:'Three mobile Lighthouse runs per production route; median; existing article performance thresholds remain independent.',summary,failures},null,2));console.log(JSON.stringify({summary,failures}));if(failures.length)throw Error(failures.join('\n'));
