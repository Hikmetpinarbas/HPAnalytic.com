import {articles} from '../data.mjs';
import {updateSaved} from './cards.mjs';
export function initReading(){
 const body=document.querySelector('[data-reading-body]');if(!body)return;
 const id=new URLSearchParams(location.search).get('id'),item=articles.find(a=>a.id===id);
 if(item){document.querySelector('[data-article-title]').textContent=item.title;document.querySelector('[data-article-description]').textContent=item.description;document.querySelector('[data-article-topic]').textContent=item.topic;const b=document.querySelector('.article-byline [data-save]');b.dataset.save=item.id;updateSaved();document.title=item.title+' — HPAnalytic demonstrasyon';}
 const links=[...document.querySelectorAll('[data-section-link]')],sections=[...body.querySelectorAll('[data-reading-section]')],progress=document.querySelector('[data-reading-progress]'),percent=document.querySelector('[data-reading-percent]');let frame=0;
 function update(){frame=0;const rect=body.getBoundingClientRect(),total=Math.max(1,rect.height-innerHeight+120),p=Math.max(0,Math.min(100,(120-rect.top)/total*100));progress.style.width=p+'%';percent.textContent=Math.round(p);const active=[...sections].reverse().find(s=>s.getBoundingClientRect().top<=190)||sections[0];links.forEach(l=>l.setAttribute('aria-current',String(l.dataset.sectionLink===active.id)));}
 window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});window.addEventListener('resize',update);new ResizeObserver(update).observe(body);
 const details=document.querySelector('.reading-toc details'),mobile=matchMedia('(max-width:800px)');const sync=()=>details.open=!mobile.matches;mobile.addEventListener('change',sync);sync();
 links.forEach(l=>l.addEventListener('click',()=>{if(mobile.matches)details.open=false;}));update();
}
