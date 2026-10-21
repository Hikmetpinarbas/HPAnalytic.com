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
 const newer={slug:'approved-new-premier',status:'published',premier:true,premier_order:2,href:'/mac/new'};
 const item=featuredPremier(Date.now(),[...PREMIER_FEATURES,newer]);
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
