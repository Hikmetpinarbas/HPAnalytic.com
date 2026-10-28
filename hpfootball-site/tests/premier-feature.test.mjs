import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {featuredPremier,premierCarousel,PREMIER_FEATURES} from '../src/data/premier-features.mjs';
const front=readFileSync(new URL('../src/components/EditorialFront.astro',import.meta.url),'utf8');
const carousel=readFileSync(new URL('../src/lib/editorial-carousel.ts',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles/editorial-experience.css',import.meta.url),'utf8');
const home=readFileSync(new URL('../src/pages/index.astro',import.meta.url),'utf8');

test('premier carousel carries all three approved pieces, newest editorial priority first',()=>{
 const slugs=premierCarousel().map(x=>x.slug);
 assert.deepEqual(slugs,[
  'galatasaray-fenerbahce-2026-10-26-mac-sonu',
  'lille-galatasaray-2026-10-21-mac-sonu',
  'fenerbahce-slavia-prag-2026-10-20-mac-sonu',
  'besiktas-crystal-palace-2026-10-22',
 ]);
});
test('featuredPremier returns the carousel leader',()=>{
 const item=featuredPremier();
 assert.equal(item.slug,'galatasaray-fenerbahce-2026-10-26-mac-sonu');
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
 assert.equal(featuredPremier(Date.now(),[...PREMIER_FEATURES,newer]).slug,'galatasaray-fenerbahce-2026-10-26-mac-sonu');
});
test('homepage promotes the admitted premier collection before secondary rails',()=>{
 assert.ok(home.indexOf('<EditorialFront />') < home.indexOf('id="mac-sonu-rail"'));
 assert.match(front,/premierCarousel\(\)/);
 assert.match(front,/href={story.href}/);
});

test('withdrawn match cannot remain promoted as premier',()=>{
 const registry=[{slug:'galatasaray-fenerbahce-2026-10-26-mac-sonu',status:'draft'},{slug:'galatasaray-fenerbahce-2026-10-26',status:'draft'},{slug:'lille-galatasaray-2026-10-21-mac-sonu',status:'draft'},{slug:'fenerbahce-slavia-prag-2026-10-20-mac-sonu',status:'draft'},{slug:'besiktas-crystal-palace-2026-10-22',status:'draft'}];
 assert.equal(featuredPremier(Date.now(),PREMIER_FEATURES,registry),null);
});
test('incomplete higher order premier cannot displace complete features',()=>{
 const incomplete={slug:'missing-copy',status:'published',premier:true,premier_order:999,href:'/missing'};
 assert.equal(featuredPremier(Date.now(),[...PREMIER_FEATURES,incomplete]).slug,'galatasaray-fenerbahce-2026-10-26-mac-sonu');
});
test('story links expose the actual headline and a visible reading label',()=>{
 assert.match(front,/<h2><a href={story.href}>{story.title}<\/a><\/h2>/);
 assert.match(front,/Dosyayı oku/);
 assert.doesNotMatch(front,/aria-label={story.title}/);
});

test('decorative cover art never substitutes fabricated match measurements',()=>{
 const cover=readFileSync(new URL('../src/components/EditorialCover.astro',import.meta.url),'utf8');
 assert.match(cover,/aria-hidden="true"/);
 assert.doesNotMatch(cover,/Math.random|xG|xT|setInterval/);
 assert.doesNotMatch(front,/football-logos\.cc|seeklogo\.com|setInterval|requestAnimationFrame/);
});

test('carousel retains keyboard, swipe and reduced motion paths after extraction',()=>{
 assert.match(front,/role="tablist"/);
 assert.match(front,/role="tabpanel"/);
 assert.match(front,/aria-controls={`story-panel-/);
 assert.match(front,/data-story-track/);
 for(const key of ['ArrowLeft','ArrowRight','Home','End']) assert.ok(carousel.includes(key));
 assert.match(carousel,/prefers-reduced-motion: reduce/);
 assert.match(carousel,/panel.inert = i !== active/);
 assert.match(css,/scroll-snap-type:x mandatory/);
});

test('actual match article uses the same Lille-white Galatasaray-yellow editorial masthead',()=>{
 const article=readFileSync(new URL('../src/pages/mac/lille-galatasaray-2026-10-21.astro',import.meta.url),'utf8');
 assert.match(article,/class="hpa-match-stars"/);
 assert.match(article,/class="hpa-match-away"/);
 assert.match(article,/class="hpa-match-home"/);
 assert.doesNotMatch(article,/<span class="v">deplasmanda<\/span>/);
 assert.match(article,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
