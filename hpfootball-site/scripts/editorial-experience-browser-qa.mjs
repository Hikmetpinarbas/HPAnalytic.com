import assert from 'node:assert/strict';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
const origin = process.env.HPA_RELEASE_BASE || 'http://127.0.0.1:4322';
const widths = [320,360,390,430,768,1024,1280,1440];
const output = 'qa-artifacts/editorial-experience';
await mkdir(output, { recursive:true });
async function routes(dir, prefix='') {
  const result=[];
  for(const entry of await readdir(dir,{withFileTypes:true})) {
    const relative=path.posix.join(prefix,entry.name);
    if(entry.isDirectory()) result.push(...await routes(path.join(dir,entry.name),relative));
    else if(entry.name.endsWith('.html') && !relative.startsWith('control/') && relative!=='404.html') result.push('/'+relative.replace(/index\.html$/,'').replace(/\.html$/,''));
  }
  return result;
}
const pages=await routes('dist/client');
assert.ok(pages.includes('/'),'Prerendered homepage is missing');
const browser=await chromium.launch({headless:true});
const failures=[], checks=[];
try {
 for(const width of widths) {
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',hasTouch:width<768,isMobile:width<768});
  for(const route of pages) {
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   try {
    const response=await page.goto(origin+route,{waitUntil:'networkidle'});
    assert.equal(response.status(),200,route);
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('main h1').count(),1,'Expected one page heading');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page overflows horizontally');
    if(route==='/') {
     const tabs=page.locator('[data-story-tab]');
     assert.ok(await tabs.count()>1);
     await page.locator('[data-story-next]').click();
     await page.waitForFunction(()=>document.querySelectorAll('[data-story-tab]')[1]?.getAttribute('aria-selected')==='true');
     await tabs.nth(1).focus();
     await page.keyboard.press('End');
     assert.equal(await tabs.last().getAttribute('aria-selected'),'true');
     assert.equal(await page.locator('[data-story-next]').isDisabled(),true);
     await page.keyboard.press('Home');
     assert.equal(await tabs.first().getAttribute('aria-selected'),'true');
     assert.equal(await page.locator('[data-story-panel]:not([inert])').count(),1);
     if(width<768) {
      const track=page.locator('[data-story-track]');
      const rect=await track.boundingBox();
      const client=await context.newCDPSession(page);
      await client.send('Input.synthesizeScrollGesture',{x:Math.round(rect.x+rect.width*.8),y:Math.round(rect.y+Math.min(rect.height/2,200)),xDistance:-Math.round(rect.width*.8),yDistance:0,gestureSourceType:'touch',speed:800});
      await page.waitForFunction(()=>document.querySelector('[data-story-track]').scrollLeft>0);
      await client.detach();
     }
     const trigger=page.locator('.mobile-nav-trigger');
     if(await trigger.isVisible()) {
      await trigger.click();
      assert.equal(await trigger.getAttribute('aria-expanded'),'true');
      await page.keyboard.press('Escape');
      assert.equal(await trigger.getAttribute('aria-expanded'),'false');
      assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);
     } else {
      const toggle=page.locator('.mainnav__toggle').first();
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'),'true');
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'),'false');
     }
     await page.screenshot({path:`${output}/home-${width}.png`,fullPage:true});
    }
    assert.deepEqual(errors,[],'Browser errors');
    checks.push({route,width,status:'passed'});
   } catch(error) { failures.push({route,width,error:error.message}); }
   await page.close();
  }
  await context.close();
 }
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 const page=await nojs.newPage();
 await page.goto(origin+'/');
 assert.ok(await page.locator('.lead-story h2 a').count()>1,'No-JS story links missing');
 assert.equal(await page.locator('[data-story-panel][inert]').count(),0);
 await nojs.close();
} finally {
 await browser.close();
 await writeFile(`${output}/report.json`,JSON.stringify({checks,failures},null,2));
}
assert.equal(failures.length,0,JSON.stringify(failures,null,2));
console.log(`${checks.length} viewport/page checks passed; no-JS links checked.`);
