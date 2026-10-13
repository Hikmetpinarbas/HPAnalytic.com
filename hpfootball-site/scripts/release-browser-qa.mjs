import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base=process.env.HP_QA_BASE_URL || 'http://127.0.0.1:4321';
const out='qa-artifacts';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});

async function inspect(name,viewport,{text200=false,reducedMotion='no-preference',route='/'}={}){
  const context=await browser.newContext({viewport,reducedMotion});
  const page=await context.newPage();
  const consoleErrors=[];
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  await page.goto(new URL(route,base).toString(),{waitUntil:'networkidle'});
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
  if(focus.width>focus.client+1){
    const offenders=await page.evaluate(()=>[...document.querySelectorAll('body *')].map(el=>{
      const r=el.getBoundingClientRect();
      return {tag:el.tagName,cls:String(el.className||'').slice(0,80),left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width)};
    }).filter(x=>x.right>innerWidth+2&&x.width>0).sort((a,b)=>b.right-a.right).slice(0,15));
    console.log('OVERFLOW_ELEMENTS',JSON.stringify(offenders));
  }
  assert.ok(focus.width<=focus.client+1,`horizontal overflow: ${focus.width} > ${focus.client}`);
  assert.deepEqual(consoleErrors,[],`console errors: ${consoleErrors.join(' | ')}`);
  await page.screenshot({path:`${out}/${name}.png`,fullPage:true});
  await context.close();
}

await inspect('mobile-320',{width:320,height:812});
await inspect('mobile-375',{width:375,height:812});
await inspect('mobile-420',{width:420,height:812});
await inspect('mobile-430',{width:430,height:812});
// Route-level smoke coverage: avoid treating homepage-only QA as site-wide acceptance.
await inspect('analysis-mobile-375',{width:375,height:812},{route:'/analysis'});
await inspect('scouting-mobile-375',{width:375,height:812},{route:'/scouting'});
await inspect('research-mobile-375',{width:375,height:812},{route:'/research'});
await inspect('visual-lab-mobile-375',{width:375,height:812},{route:'/visual-lab'});
await inspect('archive-mobile-375',{width:375,height:812},{route:'/archive'});
await inspect('search-mobile-375',{width:375,height:812},{route:'/search?q=role'});
await inspect('desktop-1440',{width:1440,height:1000});
await inspect('text-200-mobile',{width:375,height:812},{text200:true});
await inspect('reduced-motion',{width:1440,height:1000},{reducedMotion:'reduce'});
await browser.close();
console.log('BROWSER_QA_PASS');
