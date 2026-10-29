import { normalizeText } from './search.mjs';
import { facets } from './data.mjs';
export const filterKeys = new Set(facets.map(f=>f.key));
export function parseFilters(search='') {
 const p=new URLSearchParams(search),state={};
 for(const f of facets) state[f.key]=[...new Set(p.getAll(f.key))].filter(x=>f.values.includes(x));
 state.q=(p.get('q')||'').replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,120);
 state.saved=p.get('saved')==='1'; state.view=p.get('view')==='list'?'list':'grid';
 return state;
}
export function filterArticles(items,state,saved=[]) {
 const tokens=normalizeText(state.q).split(' ').filter(Boolean);
 return items.filter(a=>(!state.saved||saved.includes(a.id))&&tokens.every(t=>normalizeText(`${a.title} ${a.description} ${a.topic}`).includes(t))&&facets.every(f=>!state[f.key]?.length||state[f.key].some(v=>f.key==='team'?a.teams.includes(v):f.key==='date'?a.date.startsWith(v):a[f.key]===v)));
}
export function serializeFilters(state) {
 const p=new URLSearchParams(); for(const f of facets)for(const v of state[f.key]||[])if(f.values.includes(v))p.append(f.key,v);
 if(state.q?.trim())p.set('q',state.q.trim().slice(0,120));if(state.saved)p.set('saved','1');if(state.view==='list')p.set('view','list');
 return p.toString();
}
export function searchEntities(items,query) {
 const tokens=normalizeText(query).split(' ').filter(Boolean);
 return items.filter(e=>tokens.every(t=>normalizeText(`${e.title} ${e.description} ${e.group}`).includes(t))).slice(0,30);
}
export function playbackIndex(events,time){return Math.max(0,events.findLastIndex(e=>e.t<=time));}
export function clamp(value,min,max){return Math.min(max,Math.max(min,value));}
export function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
