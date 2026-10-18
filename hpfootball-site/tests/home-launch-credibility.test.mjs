import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getUpcomingMatches} from '../src/lib/football-data.mjs';
import {validMatchRows, shouldShowMatchCentre, heroPrimaryCta, launchDirectoryLinks} from '../src/lib/home-surfaces.mjs';
const home=readFileSync(new URL('../src/pages/index.astro',import.meta.url),'utf8');

test('match centre section is wrapped in READY + valid rows condition',()=>{
 assert.match(home,/const showMatchCentre=shouldShowMatchCentre\(matchCentre\)/);
 assert.match(home,/\{showMatchCentre && <section class="match-centre"/);
 assert.match(home,/const matchRows=validMatchRows\(matchCentre\)/);
});
test('homepage carries no unavailable-source panel or empty fixture placeholder',()=>{
 assert.doesNotMatch(home,/KAYNAK KULLANILAMIYOR/);
 assert.doesNotMatch(home,/fixture-empty/);
 assert.doesNotMatch(home,/DOĞRULANMIŞ MAÇ VERİSİ ŞU ANDA GÖSTERİLEMİYOR/);
});
test('missing token hides the match centre and fabricates no fixtures',async()=>{
 const r=await getUpcomingMatches({token:'',fetcher:()=>{throw new Error('must not fetch')}});
 assert.equal(shouldShowMatchCentre(r),false);
 assert.deepEqual(validMatchRows(r),[]);
});
test('match centre requires READY status and at least one valid row',()=>{
 const row={competition:'PL',utcDate:'2026-10-18T14:00:00Z',home:'A',away:'B',status:'SCHEDULED'};
 assert.equal(shouldShowMatchCentre({status:'READY',matches:[]}),false);
 assert.equal(shouldShowMatchCentre({status:'UNAVAILABLE',matches:[row]}),false);
 assert.equal(shouldShowMatchCentre({status:'READY',matches:[{...row,home:''},{...row,utcDate:'not-a-date'},null]}),false);
 assert.equal(shouldShowMatchCentre({status:'READY',matches:[row]}),true);
 assert.deepEqual(validMatchRows({status:'READY',matches:[row,{...row,away:''}]}),[row]);
});
test('primary CTA goes to the working archive when no public analysis exists',()=>{
 assert.deepEqual(heroPrimaryCta(0),{href:'/archive',label:'YAYIMLANANLARI OKU'});
 assert.deepEqual(heroPrimaryCta(2),{href:'/analysis',label:'ANALİZLERİ KEŞFET'});
 assert.notEqual(heroPrimaryCta(0).label,'YENİ YAZIYI OKU');
 assert.doesNotMatch(home,/href="\/analysis">ANALİZLERİ KEŞFET/);
 assert.match(home,/const publicAnalysisCount=articles\.filter\(a=>a\.data\.section==='analysis'\)\.length/);
});
test('launch directory advertises analysis only when public analysis exists and labels methods as methods',()=>{
 const empty=launchDirectoryLinks(0);
 assert.equal(empty.some(l=>l.href==='/analysis'),false);
 assert.deepEqual(empty.map(l=>l.href),['/research','/scouting','/archive']);
 assert.deepEqual(empty.map(l=>l.index),['01','02','03']);
 for(const l of empty.filter(l=>l.href!=='/archive')){ assert.match(l.kind,/YÖNTEM/); assert.match(l.note,/^Yöntem notu/); assert.doesNotMatch(l.note,/[Yy]ayımlanmış/); }
 assert.equal(launchDirectoryLinks(1)[0].href,'/analysis');
 assert.match(home,/directoryLinks\.map\(/);
 assert.doesNotMatch(home,/<a href="\/analysis"><span>01 \/ ANALİZ/);
});
