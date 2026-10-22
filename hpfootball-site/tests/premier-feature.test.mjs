import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {featuredPremier,PREMIER_FEATURES} from '../src/data/premier-features.mjs';
const home=readFileSync(new URL('../src/pages/index.astro',import.meta.url),'utf8');
test('latest approved premier remains selected independent of match kickoff',()=>{
 const item=featuredPremier(new Date('2026-11-01T00:00:00Z').getTime());
 assert.equal(item.slug,'besiktas-crystal-palace-2026-10-22');
 assert.equal(item.status,'published');
});
test('newer premier can supersede current selection without match date heuristics',()=>{
 const newer={slug:'approved-new-premier',status:'published',premier:true,premier_order:3,href:'/mac/new',category:'PREMIER',team:'Takım A × Takım B',title:'Yeni analiz',description:'Doğrulanmış açıklama',club:'galatasaray'};
 const item=featuredPremier(Date.now(),[...PREMIER_FEATURES,newer],[{slug:'lille-galatasaray-2026-10-21',status:'published'},{slug:'approved-new-premier',status:'published'}]);
 assert.equal(item.slug,'approved-new-premier');
});
test('draft premier is never public or promoted',()=>{
 const newer={slug:'draft-premier',status:'draft',premier:true,premier_order:20,href:'/draft'};
 assert.equal(featuredPremier(Date.now(),[...PREMIER_FEATURES,newer]).slug,'besiktas-crystal-palace-2026-10-22');
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
 assert.equal(featuredPremier(Date.now(),[...PREMIER_FEATURES,incomplete]).slug,'besiktas-crystal-palace-2026-10-22');
});
test('CTA accessible name retains visible label',()=>{
 assert.doesNotMatch(home,/aria-label={premier\.title \+ ' premier analizini oku'}/);
 assert.match(home,/PREMIER DOSYASINI KEŞFET/);
});

test('approved premier uses data-bound team headline with local rotating star scene',()=>{
 assert.match(home,/premier.club === 'galatasaray' \? 'hpa-premier__foreign' : 'hpa-premier__turkish'/);
 assert.match(home,/premier.club === 'galatasaray' \? 'hpa-premier__turkish' : 'hpa-premier__foreign'/);
 assert.doesNotMatch(home,/Ev sahibi · Lille|Konuk · Galatasaray|hpa-premier__matchup/);
 assert.match(home,/hpa-premier__stars/);
 assert.match(home,/data-club={premier\?\.club/);
 assert.match(home,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
 assert.doesNotMatch(home,/football-logos\.cc|seeklogo\.com/);
});

test('actual match article uses the same Lille-white Galatasaray-yellow editorial masthead',()=>{
 const article=readFileSync(new URL('../src/pages/mac/lille-galatasaray-2026-10-21.astro',import.meta.url),'utf8');
 assert.match(article,/class="hpa-match-stars"/);
 assert.match(article,/class="hpa-match-away"/);
 assert.match(article,/class="hpa-match-home"/);
 assert.doesNotMatch(article,/<span class="v">deplasmanda<\/span>/);
 assert.match(article,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
