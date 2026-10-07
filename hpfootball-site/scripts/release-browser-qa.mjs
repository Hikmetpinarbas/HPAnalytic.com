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
  const tabbable=page.locator('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
  assert.ok(await tabbable.count()>=2,'page exposes fewer than two keyboard targets');
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

await inspect('mobile-375',{width:375,height:812});
await inspect('desktop-1440',{width:1440,height:1000});
await inspect('text-200-mobile',{width:375,height:812},{text200:true});
await inspect('reduced-motion',{width:1440,height:1000},{reducedMotion:'reduce'});
await browser.close();
console.log('BROWSER_QA_PASS');
