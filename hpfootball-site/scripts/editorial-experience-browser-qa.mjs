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
    else if(entry.name==='index.html' && !relative.startsWith('control/')) result.push('/'+relative.replace(/index\.html$/,'').replace(/\.html$/,''));
  }
  return result;
}
const pages=await routes('dist/client');
assert.ok(pages.includes('/'),'Prerendered homepage is missing');
const browser=await chromium.launch({headless:true});
const failures=[], checks=[], accessibility=[];
try {
 for(const width of widths) {
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',hasTouch:width<768,isMobile:width<768});
  for(const route of pages) {
   const page=await context.newPage();
   const errors=[];
   let stage='navigation';
   page.on('pageerror',error=>errors.push(error.message));
   try {
    const response=await page.goto(origin+route,{waitUntil:'networkidle',timeout:20000});
    assert.equal(response.status(),200,route);
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('h1').count(),1,'Expected one page heading');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page overflows horizontally');
    if(route==='/') {
     const sitemap=await (await fetch(origin+'/sitemap-0.xml')).text();
     for(const href of await page.locator('.lead-story h2 a').evaluateAll(links=>links.map(a=>new URL(a.href).pathname))) assert.ok(sitemap.includes('https://www.hpanalytic.com'+href),`Featured article missing from sitemap: ${href}`);
     const tabs=page.locator('[data-story-tab]');
     assert.ok(await tabs.count()>1);
     stage='carousel-next';
     await page.locator('[data-story-next]').click();
     await page.waitForFunction(()=>document.querySelectorAll('[data-story-tab]')[1]?.getAttribute('aria-selected')==='true');
     stage='carousel-keyboard';
     await tabs.nth(1).focus();
     await page.keyboard.press('End');
     assert.equal(await tabs.last().getAttribute('aria-selected'),'true');
     assert.equal(await page.locator('[data-story-next]').isDisabled(),true);
     await page.keyboard.press('Home');
     assert.equal(await tabs.first().getAttribute('aria-selected'),'true');
     assert.equal(await page.locator('[data-story-panel]:not([inert])').count(),1);
     if(width<768) {
      stage='carousel-touch';
      const track=page.locator('[data-story-track]');
      await track.scrollIntoViewIfNeeded();
      const rect=await track.boundingBox();
      const client=await context.newCDPSession(page);
      const top=Math.max(80,rect.y),bottom=Math.min(850,rect.y+rect.height);
      assert.ok(bottom>top,'Touch scroll surface is outside the viewport');
      const x=Math.round(rect.x+rect.width*.85),y=Math.round((top+bottom)/2);
      await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
      for(let step=1;step<=10;step++) {
       await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:Math.round(x-rect.width*.7*step/10),y}]});
       await new Promise(resolve=>setTimeout(resolve,20));
      }
      await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await page.waitForFunction(()=>document.querySelector('[data-story-track]').scrollLeft>0,{},{timeout:5000});
      await client.detach();
     }
     stage='navigation-disclosure';
     const trigger=page.locator('.mobile-nav-trigger');
     if(await trigger.isVisible()) {
      await trigger.click();
      assert.equal(await trigger.getAttribute('aria-expanded'),'true');
      await page.keyboard.press('Escape');
      assert.equal(await trigger.getAttribute('aria-expanded'),'false');
      assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);
     } else {
      const toggle=page.locator('.mainnav__toggle').first();
      await toggle.hover();
      assert.equal(await toggle.getAttribute('aria-expanded'),'true','Desktop hover must disclose navigation');
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'),'false');
      await page.keyboard.press('Enter');
      assert.equal(await toggle.getAttribute('aria-expanded'),'true','Keyboard must disclose navigation');
      await page.keyboard.press('Escape');
     }
     if([390,1440].includes(width)) {
      stage='homepage-accessibility';
      assert.ok(process.env.HPA_AXE_PATH,'axe-core path must be configured');
      await page.addScriptTag({path:process.env.HPA_AXE_PATH});
      const violations=await page.evaluate(async()=>{const result=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return result.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}));});
      accessibility.push({route,width,violations});
      assert.deepEqual(violations,[],'Homepage accessibility violations');
     }
     await page.screenshot({path:`${output}/home-${width}.png`,fullPage:true});
    }
    if(route==='/mac/galatasaray-fenerbahce-2026-10-26-mac-sonu/' && [390,1440].includes(width)) {
     const use=page.locator('.film-panel:not([hidden]) use[href="#goal-film-model-grid"]');
     if(await use.count()) {const bounds=await use.evaluate(el=>{const b=el.getBBox();return {width:b.width,height:b.height};});assert.ok(bounds.width>100&&bounds.height>67,'Shared xT grid must render at pitch scale');}
    }
    assert.deepEqual(errors,[],'Browser errors');
    checks.push({route,width,status:'passed'});
   } catch(error) { failures.push({route,width,stage,error:error.message}); }
   console.log(JSON.stringify({route,width,status:failures.some(x=>x.route===route&&x.width===width)?'failed':'passed'}));
   await writeFile(`${output}/report.json`,JSON.stringify({checks,failures,accessibility},null,2));
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
 await writeFile(`${output}/report.json`,JSON.stringify({checks,failures,accessibility},null,2));
}
assert.equal(failures.length,0,JSON.stringify(failures,null,2));
console.log(`${checks.length} viewport/page checks passed; no-JS links checked.`);
