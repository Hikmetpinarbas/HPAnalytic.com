import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base=process.env.HP_QA_BASE_URL || 'http://127.0.0.1:4321';
const out='qa-artifacts';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});

async function inspect(name,viewport,{text200=false,reducedMotion='no-preference'}={}){
  const context=await browser.newContext({viewport,reducedMotion});
  const page=await context.newPage();
  const consoleErrors=[];
  page.on('console', (m) => {
    if (m.type() === 'error') {
      const text = m.text();
      if (text.includes("Error while running audit's match function") || text.includes("Failed to fetch")) {
        return;
      }
      consoleErrors.push(text);
    }
  });
  await page.goto(base,{waitUntil:'networkidle'});
  if(text200) await page.evaluate(()=>{document.documentElement.style.fontSize='200%'});
  await page.screenshot({path:`${out}/${name}-precheck.png`,fullPage:true});
  const tabbable=page.locator('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
  const targetCount=await tabbable.count();
  const pageTitle=await page.title();
  assert.ok(targetCount>=2,`page exposes fewer than two keyboard targets (${targetCount}); title=${pageTitle}; url=${page.url()}`);
  await tabbable.first().focus();
  await page.keyboard.press('Tab');
  const focus=await page.evaluate(()=>{
    const el=document.activeElement;
    const s=el?getComputedStyle(el):null;
    return {tag:el?.tagName||'',outline:s?.outlineStyle||'',width:document.documentElement.scrollWidth,client:document.documentElement.clientWidth};
  });
  assert.ok(focus.tag && !['BODY','HTML'].includes(focus.tag),'keyboard Tab did not advance to an interactive target');
  assert.notEqual(focus.outline,'none','focused target has no visible outline');
  assert.ok(focus.width<=focus.client+1,`horizontal overflow: ${focus.width} > ${focus.client}`);
  assert.deepEqual(consoleErrors,[],`console errors: ${consoleErrors.join(' | ')}`);
  await page.screenshot({path:`${out}/${name}.png`,fullPage:true});
  await context.close();
}

await inspect('mobile-320',{width:320,height:740});
await inspect('mobile-375',{width:375,height:812});
await inspect('mobile-390',{width:390,height:844});
await inspect('desktop-1440',{width:1440,height:1000});
await inspect('text-200-mobile',{width:375,height:812},{text200:true});
await inspect('reduced-motion',{width:1440,height:1000},{reducedMotion:'reduce'});
// Disclosed mobile menu must open, close on Escape and remain in viewport.
const menuContext=await browser.newContext({viewport:{width:320,height:740},reducedMotion:'reduce'});
const menuPage=await menuContext.newPage();
await menuPage.goto(base,{waitUntil:'networkidle'});
const menuButton=menuPage.locator('.mobile-nav-trigger');
assert.ok(await menuButton.isVisible(),'mobile menu trigger is invisible at 320px');
await menuButton.click();
assert.equal(await menuButton.getAttribute('aria-expanded'),'true','mobile menu fails to open');
assert.ok(await menuPage.locator('#mobile-nav-panel').isVisible(),'mobile menu panel stays hidden');
await menuPage.keyboard.press('Escape');
assert.equal(await menuButton.getAttribute('aria-expanded'),'false','Escape fails to close mobile menu');
await menuContext.close();
// Chart filters are now compact popovers: open the accessible menu before choosing a button.
async function chooseChartFilter(page,selector){
  const option=page.locator(selector);
  const parent=option.locator('xpath=ancestor::details[contains(@class,"hpa-menu-filter")][1]');
  if(await parent.count()) await parent.locator('summary').click();
  await option.click();
}
// Dedicated Lille–Galatasaray article evidence: static render and actual interactions.
for (const [suffix, viewport] of [['mobile',{width:390,height:844}],['desktop',{width:1440,height:900}]]) {
 const context=await browser.newContext({viewport,reducedMotion:'reduce'});
 const page=await context.newPage();
 await page.goto(base+'/mac/lille-galatasaray-2026-10-21/',{waitUntil:'networkidle'});
 assert.ok(await page.locator('#hpa-evidence-atlas').isVisible(),'article atlas missing');
 assert.ok(await page.locator('#hpa-scenario-next').isVisible(),'article carousel missing');
 await page.screenshot({path:`${out}/lille-article-${suffix}-full.png`,fullPage:true});
 await page.locator('#hpa-evidence-atlas').screenshot({path:`${out}/lille-atlas-${suffix}-before.png`});
 await chooseChartFilter(page,'[data-atlas-event="ars"]');
 await chooseChartFilter(page,'[data-atlas-zone="2"]');
 assert.equal(await page.locator('[data-atlas-zone="2"]').getAttribute('aria-pressed'),'true','zone selection failed');
 await page.locator('#hpa-evidence-atlas').screenshot({path:`${out}/lille-atlas-${suffix}-selected.png`});
 const prior=await page.locator('#hpa-scenario-counter').innerText();
 await page.locator('#hpa-scenario-next').click();
 const after=await page.locator('#hpa-scenario-counter').innerText();
 assert.notEqual(after,prior,'scenario carousel did not advance');
 await page.locator('#hpa-scenario-counter').screenshot({path:`${out}/lille-carousel-${suffix}-advanced.png`});
 await page.locator('#ticker-pause').click();
 assert.equal(await page.locator('#ticker-pause').getAttribute('aria-pressed'),'true','ticker did not pause');
 await context.close();
}

for (const viewport of [{width:390,height:844},{width:1440,height:900}]) {
 const context=await browser.newContext({viewport,reducedMotion:'reduce'});
 const page=await context.newPage();
 await page.goto(base+'/mac/besiktas-crystal-palace-2026-10-22/',{waitUntil:'domcontentloaded'});
 const frame=page.frameLocator('#hpa-interactive-frame');
 await frame.locator('[data-view="pitch"]').waitFor({state:'visible',timeout:20000});
 await frame.locator('#main svg').count().catch(()=>0);
 await frame.locator('[data-view="radar"]').click();
 assert.equal(await frame.locator('[data-view="radar"]').getAttribute('aria-pressed'),'true','Premier radar tab failed');
 await frame.locator('[data-view="pitch"]').click();
 assert.equal(await frame.locator('[data-view="pitch"]').getAttribute('aria-pressed'),'true','Premier pitch tab failed');
 assert.ok(await page.getByText('Beşiktaş oyunu nerede kuruyor?').count(),'Premier article prose missing');
 await page.screenshot({path:`${out}/besiktas-interactive-${viewport.width}.png`,fullPage:false});
 await context.close();
}
await browser.close();
console.log('BROWSER_QA_PASS');
