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
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('response',r=>{if(r.status()>=400) consoleErrors.push('HTTP '+r.status()+' '+r.url())});
  page.on('pageerror',e=>consoleErrors.push('PAGE '+e.message));

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
// Evidence carousel acceptance: exercise real DOM, scroll and disabled boundary state.
const carouselContext=await browser.newContext({viewport:{width:375,height:812},reducedMotion:'reduce'});
const carouselPage=await carouselContext.newPage();
await carouselPage.goto(base,{waitUntil:'networkidle'});
const carousel=carouselPage.locator('[data-editorial-carousel]');
let carouselVerdict='NO_PUBLISHED_CAROUSEL';
if(await carousel.count()){
  const track=carousel.locator('.hpa-carousel-track');
  const cardCount=await carousel.locator('.hpa-carousel-card').count();
  const dimensions=await track.evaluate(el=>({scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));
  if(cardCount>1 && dimensions.scrollWidth>dimensions.clientWidth+2){
    const previous=carousel.locator('[data-carousel-previous]');
    const next=carousel.locator('[data-carousel-next]');
    assert.ok(await previous.isDisabled(),'previous navigation enabled at first card');
    assert.ok(await next.isEnabled(),'next navigation disabled before end');
    const initial=await track.evaluate(el=>el.scrollLeft);
    await next.click();
    await carouselPage.waitForTimeout(100);
    const moved=await track.evaluate(el=>el.scrollLeft);
    assert.ok(moved>initial+2,'next click did not advance scroll position');
    await previous.click();
    await carouselPage.waitForTimeout(100);
    const returned=await track.evaluate(el=>el.scrollLeft);
    assert.ok(returned<moved-2,'previous click did not reverse scroll position');
    carouselVerdict='PASS';
  } else {
    carouselVerdict='NO_OVERFLOW';
  }
}
await carouselContext.close();
console.log('CAROUSEL_BROWSER_QA:'+carouselVerdict);
await browser.close();
console.log('BROWSER_QA_PASS');
