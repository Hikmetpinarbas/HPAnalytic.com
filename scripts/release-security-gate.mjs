// Fail-closed security and editorial allowlist gate before any GitHub Pages upload.
// This gate does not authorize release: workflow_dispatch human approval is separate.
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,lstatSync,existsSync} from 'node:fs';
import {join,resolve,relative,sep,extname} from 'node:path';
import {pathToFileURL} from 'node:url';

const sha=s=>createHash('sha256').update(s).digest('hex');
const deny=(code,detail='')=>{throw Error(code+(detail?':'+detail:''))};
const privatePath=/(?:\/data\/data\/com\.termux|\/storage\/emulated\/|\/sdcard\/|\/root\/HP_WORKSPACE|\/root\/AI_WRITER_LAB)/i; // hpa:allow-path: tarama desen tanımı, cihaz yolu değil
const credential=/(?:sk-proj-[a-zA-Z0-9_-]{12,}|ghp_[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9_-]{30,})/; // hpa:allow-path: tarama desen tanımı, sır değildir
const disallowed=/^(?:hazine\/|assets\/hazine(?:\/|-manifest)|.*(?:data\.bak_|\.bak(?:\.|$)|\.tmp$|\.env(?:\.|$)|\.pem$|\.key$)|(?:test|pilot|draft|taslak|_pn3d)[\w-]*\.html$)/i;

function filesUnder(base){
 if(!existsSync(base))deny('DIST_MISSING');
 const out=[],stack=[base];
 while(stack.length){
  const dir=stack.pop();
  for(const name of readdirSync(dir)){
   const f=join(dir,name);const st=lstatSync(f);
   if(st.isSymbolicLink())deny('DIST_SYMLINK',relative(base,f));
   if(st.isDirectory())stack.push(f);
   else if(st.isFile())out.push(f);
   else deny('DIST_SPECIAL_FILE',relative(base,f));
  }
 }
 return out;
}

export function auditRelease(root='.',dir='dist'){
 const absolute=resolve(root),dist=resolve(root,dir);
 if(dist!==absolute&&relative(absolute,dist).startsWith('..'))deny('DIST_OUTSIDE_ROOT');
 const ledgerFile=join(absolute,'content/yayin-defteri.json');
 if(!existsSync(ledgerFile))deny('LEDGER_MISSING');
 let ledger;
 try{ledger=JSON.parse(readFileSync(ledgerFile,'utf8'))}catch{deny('LEDGER_INVALID_JSON')}
 if(ledger?.schema!=='hpa.publication_ledger.v1'||!Array.isArray(ledger.entries))deny('LEDGER_SCHEMA_INVALID');
 const allowed=new Set();
 for(const e of ledger.entries){
  if(!e||(e.status!==undefined&&!['approved','published','yayinda','yayında'].includes(String(e.status).toLowerCase())))continue;
  if(!/^[a-z0-9-]+$/.test(e.slug||'')||!/^[-\w]+\.md$/.test(e.source||'')||!['LIVE_BASELINE','HUMAN_APPROVAL'].includes(e.basis))deny('APPROVAL_INVALID');
  if(e.source_changed_since_deployed_commit===true)deny('CHANGED_SINCE_APPROVAL',e.slug);
  if(allowed.has(e.slug))deny('LEDGER_DUPLICATE',e.slug);
  const source=join(absolute,'content/yazilar',e.source);
  if(!existsSync(source))deny('SOURCE_MISSING',e.source);
  if(!/^[a-f0-9]{64}$/.test(e.source_sha256||'')||sha(readFileSync(source))!==e.source_sha256)deny('SOURCE_HASH_DRIFT',e.source);
  allowed.add(e.slug);
 }
 if(!allowed.size)deny('NO_APPROVED_ARTICLES');
 const files=filesUnder(dist);
 for(const f of files){
  const rel=relative(dist,f).split(sep).join('/');
  if(disallowed.test(rel)||/\.(?:csv|xlsx|zip)$/i.test(rel)||(rel.endsWith('.xml')&&rel!=='feed.xml'&&rel!=='sitemap.xml'))deny('SENSITIVE_FILE',rel);
  if(rel.startsWith('yazi/')&&rel.endsWith('.html')&&!allowed.has(rel.slice(5,-5)))deny('UNAPPROVED_HTML',rel);
  if(/\.(?:html|js|css|json|xml|svg|txt|md|csv)$/i.test(rel)){
   const txt=readFileSync(f,'utf8');
   if(privatePath.test(txt))deny('PRIVATE_PATH',rel);
   if(credential.test(txt))deny('CREDENTIAL_LEAK',rel);
  }
 }
 for(const slug of allowed){if(!existsSync(join(dist,'yazi',slug+'.html')))deny('APPROVED_PAGE_MISSING',slug)}
 const feed=join(dist,'feed.xml');
 if(!existsSync(feed))deny('FEED_MISSING');
 const links=[...readFileSync(feed,'utf8').matchAll(/<link>\s*[^<]*\/yazi\/([^/<>\s]+)\.html\s*<\/link>/g)].map(m=>m[1]);
 for(const slug of links){if(!allowed.has(slug))deny('FEED_UNAPPROVED',slug)}
 if(!links.length)deny('FEED_NO_APPROVED_LINKS');
 return {status:'SECURITY_REVIEW_PASS',filesChecked:files.length,approvedArticles:allowed.size,feedArticlesChecked:links.length,publicationAuthorized:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{console.log(JSON.stringify(auditRelease(process.cwd(),process.argv[2]||'dist')))}
 catch(e){console.error('RELEASE_BLOCKED:'+e.message);process.exitCode=1}
}
