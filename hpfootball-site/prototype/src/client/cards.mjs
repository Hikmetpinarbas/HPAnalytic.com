import {articles} from '../data.mjs';
export function getSaved(){try{const v=JSON.parse(localStorage.getItem('hpa-prototype-selection')||'[]');return Array.isArray(v)?v.filter(x=>articles.some(a=>a.id===x)):[];}catch{return [];}}
let timer;
export function notify(text){const el=document.querySelector('#toast');el.textContent=text;el.hidden=false;clearTimeout(timer);timer=setTimeout(()=>el.hidden=true,3200);}
export function updateSaved(){const saved=getSaved();document.querySelectorAll('[data-save]').forEach(b=>{const a=articles.find(a=>a.id===b.dataset.save),on=saved.includes(b.dataset.save);b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',`${a.title} — ${on?'seçkiden çıkar':'seçkiye ekle'}`);});}
export function initCards(root=document){
 root.querySelectorAll('[data-save]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>{let saved=getSaved();const exists=saved.includes(b.dataset.save);saved=exists?saved.filter(x=>x!==b.dataset.save):[...saved,b.dataset.save];try{localStorage.setItem('hpa-prototype-selection',JSON.stringify(saved));notify(exists?'Dosya seçkinden çıkarıldı.':'Dosya seçkine eklendi.');}catch{notify('Bu tarayıcıda seçki saklanamadı. Depolama iznini kontrol edin.');}updateSaved();document.dispatchEvent(new CustomEvent('prototype:selectionchange'));});});
 root.querySelectorAll('[data-preview]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';const card=b.closest('.story-card'),panel=card.querySelector('.card-preview');let pinned=false,t;
  const set=on=>{b.setAttribute('aria-expanded',String(on));panel.hidden=!on;};
  b.addEventListener('click',()=>{pinned=!pinned;set(pinned);});
  card.addEventListener('pointerenter',ev=>{if(ev.pointerType==='mouse'){clearTimeout(t);t=setTimeout(()=>set(true),180);}});
  card.addEventListener('pointerleave',ev=>{if(ev.pointerType==='mouse'){clearTimeout(t);if(!pinned&&!card.contains(document.activeElement))set(false);}});
  b.addEventListener('focus',()=>set(true));card.addEventListener('focusout',ev=>{if(!card.contains(ev.relatedTarget)&&!pinned)set(false);});
  card.addEventListener('keydown',ev=>{if(ev.key==='Escape'){clearTimeout(t);pinned=false;b.focus();set(false);}});
 });updateSaved();
}
