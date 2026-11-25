import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {auditRelease} from '../scripts/release-security-gate.mjs';
const digest=s=>createHash('sha256').update(s).digest('hex');
function fixture(fn){
 const root=mkdtempSync(join(tmpdir(),'hpa-release-gate-'));
 const write=(rel,content)=>{const p=join(root,rel);mkdirSync(p.slice(0,p.lastIndexOf('/')),{recursive:true});writeFileSync(p,content)};
 try{
  const slug='approved-article',source='---\nstatus: approved\n---\n\n# Approved';
  write('content/yazilar/'+slug+'.md',source);
  write('content/yayin-defteri.json',JSON.stringify({schema:'hpa.publication_ledger.v1',entries:[{slug,source:slug+'.md',source_sha256:digest(source),basis:'LIVE_BASELINE',status:'approved'}]}));
  write('dist/index.html','<!doctype html><html><head><title>Safe</title></head><body>Ready</body></html>');
  write('dist/yazi/'+slug+'.html','<html>Article</html>');
  write('dist/feed.xml','<rss><channel><item><link>https://hpanalytic.com/yazi/'+slug+'.html</link></item></channel></rss>');
  fn({root,write,slug});
 }finally{rmSync(root,{recursive:true,force:true})}
}
test('safe reviewed article and feed pass',()=>fixture(({root})=>assert.equal(auditRelease(root).approvedArticles,1)));
test('missing independent approval ledger fails closed',()=>fixture(({root})=>{rmSync(join(root,'content/yayin-defteri.json'));assert.throws(()=>auditRelease(root),/LEDGER_MISSING/)}));
test('tampered editorial markdown hash fails',()=>fixture(({root,write})=>{write('content/yazilar/approved-article.md','changed');assert.throws(()=>auditRelease(root),/SOURCE_HASH_DRIFT/)}));
test('unapproved article HTML rejected',()=>fixture(({root,write})=>{write('dist/yazi/draft.html','<html></html>');assert.throws(()=>auditRelease(root),/UNAPPROVED_HTML/)}));
test('raw match CSV rejected',()=>fixture(({root,write})=>{write('dist/assets/data/gs-stuttgart/players.csv','ID,start');assert.throws(()=>auditRelease(root),/SENSITIVE_FILE/)}));
test('device storage path leak rejected',()=>fixture(({root,write})=>{write('dist/assets/data/analysis.json','{"location":"/data/data/com.termux/files/home"}');assert.throws(()=>auditRelease(root),/PRIVATE_PATH/)})); // hpa:allow-path: tarama fixture'ı, cihaz yolu değil
test('internal hazine audit rejected',()=>fixture(({root,write})=>{write('dist/hazine/SCHEMA_CONFLICTS.json','{}');assert.throws(()=>auditRelease(root),/SENSITIVE_FILE/)}));
test('feed cannot advertise blocked draft',()=>fixture(({root,write})=>{write('dist/feed.xml','<link>https://hpanalytic.com/yazi/unapproved.html</link>');assert.throws(()=>auditRelease(root),/FEED_UNAPPROVED/)}));

test('existing live-baseline approval ledger does not require status field',()=>fixture(({root,write,slug})=>{
 const source='---\nstatus: approved\n---\n\n# Approved';
 write('content/yayin-defteri.json',JSON.stringify({schema:'hpa.publication_ledger.v1',entries:[{slug,source:slug+'.md',source_sha256:digest(source),basis:'LIVE_BASELINE',source_changed_since_deployed_commit:false}]}));
 assert.equal(auditRelease(root).approvedArticles,1);
}));
test('changed live-baseline source is not silently publishable',()=>fixture(({root,write,slug})=>{
 const source='---\nstatus: approved\n---\n\n# Approved';
 write('content/yayin-defteri.json',JSON.stringify({schema:'hpa.publication_ledger.v1',entries:[{slug,source:slug+'.md',source_sha256:digest(source),basis:'LIVE_BASELINE',source_changed_since_deployed_commit:true}]}));
 assert.throws(()=>auditRelease(root),/CHANGED_SINCE_APPROVAL/);
}));
