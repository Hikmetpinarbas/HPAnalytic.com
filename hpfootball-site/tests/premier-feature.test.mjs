import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {featuredPremier,PREMIER_FEATURES} from '../src/data/premier-features.mjs';
const home=readFileSync(new URL('../src/pages/index.astro',import.meta.url),'utf8');
test('Lille–Galatasaray remains editorial premier independent of match kickoff',()=>{
 const item=featuredPremier(new Date('2026-11-01T00:00:00Z').getTime());
 assert.equal(item.slug,'lille-galatasaray-2026-10-21');
 assert.equal(item.status,'published');
});
test('newer premier can supersede current selection without match date heuristics',()=>{
 const newer={slug:'approved-new-premier',status:'published',premier:true,premier_order:2,href:'/mac/new',category:'PREMIER',team:'Takım A × Takım B',title:'Yeni analiz',description:'Doğrulanmış açıklama',club:'galatasaray'};
 const item=featuredPremier(Date.now(),[...PREMIER_FEATURES,newer],[{slug:'lille-galatasaray-2026-10-21',status:'published'},{slug:'approved-new-premier',status:'published'}]);
 assert.equal(item.slug,'approved-new-premier');
});
test('draft premier is never public or promoted',()=>{
 const newer={slug:'draft-premier',status:'draft',premier:true,premier_order:20,href:'/draft'};
 assert.equal(featuredPremier(Date.now(),[...PREMIER_FEATURES,newer]).slug,'lille-galatasaray-2026-10-21');
});
test('homepage features premier prominently before other editorial cards',()=>{
 assert.match(home,/featuredPremier\(/);
 assert.match(home,/id="premier-feature"/);
 assert.match(home,/PREMIER/);
});

test('withdrawn match cannot remain promoted as premier',()=>{
 const registry=[{slug:'lille-galatasaray-2026-10-21',status:'draft'}];
 assert.equal(featuredPremier(Date.now(),PREMIER_FEATURES,registry),null);
});
test('incomplete higher order premier cannot displace complete feature',()=>{
 const incomplete={slug:'missing-copy',status:'published',premier:true,premier_order:999,href:'/missing'};
 assert.equal(featuredPremier(Date.now(),[...PREMIER_FEATURES,incomplete]).slug,'lille-galatasaray-2026-10-21');
});
test('CTA accessible name retains visible label',()=>{
 assert.doesNotMatch(home,/aria-label={premier\.title \+ ' premier analizini oku'}/);
 assert.match(home,/PREMIER DOSYASINI KEŞFET/);
});

test('home side is Lille, away side Galatasaray and orbital background obeys reduced motion',()=>{
 const first=home.indexOf('<strong>LOSC LILLE</strong>');
 const second=home.indexOf('<strong>GALATASARAY</strong>');
 assert.ok(first>0&&second>first,'home Lille must appear before away Galatasaray');
 assert.match(home,/Ev sahibi · Lille/);
 assert.match(home,/Konuk · Galatasaray/);
 assert.match(home,/hpa-premier__orbit/);
 assert.match(home,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
 assert.doesNotMatch(home,/football-logos\.cc|seeklogo\.com/);
});
