import assert from 'node:assert/strict';
const base=process.env.HP_QA_BASE_URL||'http://127.0.0.1:4321';
const cases=[
 ['/',200],
 ['/robots.txt',200],
 ['/sitemap-index.xml',200],
 ['/control/content',404],
 ['/studio/editorial',404],
 ['/monographs/01-halkin-metrikleri.html',404],
 ['/monographs/03-on-yilda-bir-coken-kaleler.html',404],
 ['/monographs/04-hic-var-olmayan-mevkiler.html',404],
 ['/monographs/05-sahadan-hayata-siradisi-biyografi.html',404],
 ['/monographs/06-bilanconun-iki-yuzu.html',404],
 ['/monographs/07-kemik-yorgunlugu-biyolojik-sinir.html',404],
 ['/monographs/08-kulubenin-golgesi-ikinci-kaleci.html',404],
 ['/monographs/cies-super-lig-migration.html',404],
 ['/monographs/q-angle-spatial-intelligence.html',404]
];
const results=[];
for(const [path,expected] of cases){
 const res=await fetch(new URL(path,base),{redirect:'manual',signal:AbortSignal.timeout(12000)});
 const observed={path,status:res.status,expected,ok:res.status===expected};
 if(path==='/'){
  const h=res.headers;
  observed.headers={csp:!!h.get('content-security-policy'),hsts:!!h.get('strict-transport-security'),nosniff:h.get('x-content-type-options')==='nosniff',frame:h.get('x-frame-options')==='DENY'};
  observed.ok&&=Object.values(observed.headers).every(Boolean);
 }
 results.push(observed);
}
console.log(JSON.stringify({base,results},null,2));
assert.ok(results.every(x=>x.ok),'Build Worker HTTP gate did not pass');
