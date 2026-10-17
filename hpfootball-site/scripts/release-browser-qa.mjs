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
await inspect('mobile-420',{width:420,height:900});
await inspect('desktop-1440',{width:1440,height:1000});
await inspect('text-200-mobile',{width:375,height:812},{text200:true});
await inspect('reduced-motion',{width:1440,height:1000},{reducedMotion:'reduce'});
// Interaction regression: mobile disclosure, Escape focus return, search GET, and critical routes.
{
  const context=await browser.newContext({viewport:{width:375,height:812}});
  const page=await context.newPage();
  const failedRequests=[];
  page.on('requestfailed',r=>failedRequests.push(`${r.method()} ${r.url()} ${r.failure()?.errorText}`));
  await page.goto(base,{waitUntil:'networkidle'});
  const trigger=page.locator('.mobile-nav-trigger');
  await assert.doesNotReject(()=>trigger.click());
  assert.equal(await trigger.getAttribute('aria-expanded'),'true','mobile menu failed to open');
  assert.equal(await page.locator('#mobile-nav-panel').isVisible(),true,'mobile panel hidden after open');
  await page.keyboard.press('Escape');
  assert.equal(await trigger.getAttribute('aria-expanded'),'false','Escape did not close mobile menu');
  assert.equal(await trigger.evaluate(el=>el===document.activeElement),true,'Escape did not restore focus');
  await page.goto(new URL('/search',base).toString(),{waitUntil:'networkidle'});
  await page.locator('input[name=q]').fill('futbol');
  await Promise.all([page.waitForURL(/\/search\/?\?q=futbol/),page.locator('button[type=submit]').click()]);
  assert.ok((await page.locator('[role=status]').innerText()).includes('futbol'),'search status missing');
  for(const route of ['/analysis','/research','/scouting','/about','/archive']){
    const response=await page.goto(new URL(route,base).toString(),{waitUntil:'domcontentloaded'});
    assert.equal(response?.status(),200,`critical route ${route} returned ${response?.status()}`);
  }
  assert.deepEqual(failedRequests,[],'failed browser network requests');
  await page.screenshot({path:`${out}/interaction-regression.png`,fullPage:true});
  await context.close();
}

await browser.close();
console.log('BROWSER_QA_PASS');
