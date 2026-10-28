import {existsSync,readFileSync} from 'node:fs';
for(const name of ['derby-before-2','derby-after-2','vosse-after-2','match-preview-2']) {
 const file=`qa-artifacts/${name==='match-preview-2'?'general-performance':'paired-performance'}/${name}.json`;
 if(!existsSync(file)) continue;
 const d=JSON.parse(readFileSync(file,'utf8'));
 const audits=d.audits;
 console.log(JSON.stringify({name,lcp:audits['largest-contentful-paint']?.numericValue,breakdown:audits['lcp-breakdown-insight']?.details,discovery:audits['lcp-discovery-insight']?.details,blocking:audits['render-blocking-insight']?.details,requests:audits['network-requests']?.details?.items?.map(x=>({url:x.url,resourceType:x.resourceType,transferSize:x.transferSize,networkRequestTime:x.networkRequestTime,networkEndTime:x.networkEndTime}))}));
}
const report='qa-artifacts/editorial-experience/report.json';
if(existsSync(report)) {
 const d=JSON.parse(readFileSync(report,'utf8'));
 console.log(JSON.stringify({wholeSiteChecks:d.checks?.length,wholeSiteFailures:d.failures}));
}
