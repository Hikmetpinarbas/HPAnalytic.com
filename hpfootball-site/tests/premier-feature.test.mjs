import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {featuredPremier,premierCarousel,PREMIER_FEATURES} from '../src/data/premier-features.mjs';
const home=readFileSync(new URL('../src/pages/index.astro',import.meta.url),'utf8');

test('premier carousel carries all three approved pieces, newest editorial priority first',()=>{
 const slugs=premierCarousel().map(x=>x.slug);
 assert.deepEqual(slugs,[
  'galatasaray-fenerbahce-2026-10-26',
  'lille-galatasaray-2026-10-21-mac-sonu',
  'fenerbahce-slavia-prag-2026-10-20-mac-sonu',
  'besiktas-crystal-palace-2026-10-22',
 ]);
});
test('featuredPremier returns the carousel leader',()=>{
 const item=featuredPremier();
 assert.equal(item.slug,'galatasaray-fenerbahce-2026-10-26');
 assert.equal(item.status,'published');
});
test('superseded preview is excluded from the carousel but kept for history',()=>{
 const superseded=PREMIER_FEATURES.find(x=>x.slug==='lille-galatasaray-2026-10-21');
 assert.equal(superseded.premier,false);
 assert.ok(!premierCarousel().some(x=>x.slug==='lille-galatasaray-2026-10-21'));
});
test('newer premier can supersede current leadership without match date heuristics',()=>{
 const newer={slug:'approved-new-premier',status:'published',premier:true,premier_order:9,href:'/mac/new',category:'PREMIER',team:'Takım A × Takım B',title:'Yeni analiz',description:'Doğrulanmış açıklama',club:'galatasaray',turkishSide:'home',home:'Takım A',away:'Takım B'};
 const item=featuredPremier(Date.now(),[...PREMIER_FEATURES,newer],[{slug:'approved-new-premier',status:'published'}]);
 assert.equal(item.slug,'approved-new-premier');
});
test('draft premier is never public or promoted',()=>{
 const newer={slug:'draft-premier',status:'draft',premier:true,premier_order:20,href:'/draft'};
 assert.equal(featuredPremier(Date.now(),[...PREMIER_FEATURES,newer]).slug,'galatasaray-fenerbahce-2026-10-26');
});
test('homepage features the premier carousel prominently before other editorial cards',()=>{
 assert.match(home,/premierCarousel\(\)/);
 assert.match(home,/id="premier-feature"/);
 assert.match(home,/PREMIER/);
});

test('withdrawn match cannot remain promoted as premier',()=>{
 const registry=[{slug:'galatasaray-fenerbahce-2026-10-26',status:'draft'},{slug:'lille-galatasaray-2026-10-21-mac-sonu',status:'draft'},{slug:'fenerbahce-slavia-prag-2026-10-20-mac-sonu',status:'draft'},{slug:'besiktas-crystal-palace-2026-10-22',status:'draft'}];
 assert.equal(featuredPremier(Date.now(),PREMIER_FEATURES,registry),null);
});
test('incomplete higher order premier cannot displace complete features',()=>{
 const incomplete={slug:'missing-copy',status:'published',premier:true,premier_order:999,href:'/missing'};
 assert.equal(featuredPremier(Date.now(),[...PREMIER_FEATURES,incomplete]).slug,'galatasaray-fenerbahce-2026-10-26');
});
test('CTA accessible name retains visible label',()=>{
 assert.doesNotMatch(home,/aria-label={premier\.title \+ ' premier analizini oku'}/);
 assert.match(home,/PREMIER DOSYASINI KEŞFET/);
});

test('each carousel slide uses a data-bound club theme with its own rotating star scene, keyed off turkishSide',()=>{
 assert.match(home,/p\.turkishSide === 'home' \? 'hpa-premier__turkish' : 'hpa-premier__foreign'/);
 assert.match(home,/p\.turkishSide === 'away' \? 'hpa-premier__turkish' : 'hpa-premier__foreign'/);
 assert.doesNotMatch(home,/Ev sahibi · Lille|Konuk · Galatasaray|hpa-premier__matchup/);
 assert.match(home,/hpa-premier__stars/);
 assert.match(home,/data-club={p\.club}/);
 assert.match(home,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
 assert.doesNotMatch(home,/football-logos\.cc|seeklogo\.com/);
});

test('premier carousel is keyboard- and swipe-accessible like the other home rails',()=>{
 assert.match(home,/role="tablist" aria-label="Premier dosyaları"/);
 assert.match(home,/role="tabpanel"/);
 assert.match(home,/data-premier-track/);
 assert.match(home,/data-premier-dot/);
 assert.match(home,/scroll-snap-type:x mandatory/);
});

test('actual match article uses the same Lille-white Galatasaray-yellow editorial masthead',()=>{
 const article=readFileSync(new URL('../src/pages/mac/lille-galatasaray-2026-10-21.astro',import.meta.url),'utf8');
 assert.match(article,/class="hpa-match-stars"/);
 assert.match(article,/class="hpa-match-away"/);
 assert.match(article,/class="hpa-match-home"/);
 assert.doesNotMatch(article,/<span class="v">deplasmanda<\/span>/);
 assert.match(article,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
