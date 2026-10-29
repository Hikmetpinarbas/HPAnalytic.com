import {articles,facets} from '../data.mjs';
import {parseFilters,serializeFilters,filterArticles,escapeHTML as e} from '../state.mjs';
import {card} from '../card-ui.mjs';
import {getSaved,initCards} from './cards.mjs';
import {icon} from '../icons.mjs';
export function initFilters(){
 if(!document.querySelector('[data-archive-results]'))return;
 let state=parseFilters(location.search);const results=document.querySelector('[data-archive-results]'),query=document.querySelector('[data-filter-query]');
 function render(write=false){const matches=filterArticles(articles,state,getSaved());results.innerHTML=matches.map(a=>card(a)).join('');results.dataset.view=state.view;document.querySelector('[data-result-count]').textContent=matches.length;document.querySelector('[data-results-status]').textContent=`${matches.length} dosya bulundu.`;document.querySelector('[data-empty]').hidden=matches.length!==0;document.querySelectorAll('[data-facet]').forEach(el=>el.checked=state[el.dataset.facet].includes(el.value));document.querySelector('[data-saved-filter]').checked=state.saved;query.value=state.q;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
 const chips=facets.flatMap(f=>state[f.key].map(v=>`<button class="filter-chip" data-remove-facet="${f.key}" data-value="${e(v)}" aria-label="${e(f.label)}: ${e(v)} filtresini kaldır">${e(v)} ${icon('close')}</button>`));if(state.saved)chips.push('<button class="filter-chip" data-remove-saved>Seçkim ×</button>');if(state.q)chips.push(`<button class="filter-chip" data-remove-query>Arama: ${e(state.q)} ×</button>`);document.querySelector('[data-active-filters]').innerHTML=chips.join('');initCards(results);if(write){const s=serializeFilters(state);history.pushState(null,'',location.pathname+(s?'?'+s:''));}}
 document.querySelectorAll('[data-facet]').forEach(el=>el.addEventListener('change',()=>{state[el.dataset.facet]=el.checked?[...state[el.dataset.facet],el.value]:state[el.dataset.facet].filter(v=>v!==el.value);render(true);}));
 document.querySelectorAll('[data-filter-clear]').forEach(b=>b.addEventListener('click',()=>{state={...parseFilters(),view:state.view};render(true);}));
 document.querySelector('[data-saved-filter]').addEventListener('change',ev=>{state.saved=ev.target.checked;render(true);});
 document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.view;render(true);}));
 document.querySelector('[data-active-filters]').addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;if(b.dataset.removeFacet)state[b.dataset.removeFacet]=state[b.dataset.removeFacet].filter(v=>v!==b.dataset.value);if(b.hasAttribute('data-remove-saved'))state.saved=false;if(b.hasAttribute('data-remove-query'))state.q='';render(true);document.querySelector('[data-filter-clear]').focus();});
 let timeout;query.addEventListener('input',()=>{clearTimeout(timeout);timeout=setTimeout(()=>{const pos=query.selectionStart;state.q=query.value;render(true);query.focus();if(query.type!=='search')query.setSelectionRange(pos,pos);},220);});
 window.addEventListener('popstate',()=>{state=parseFilters(location.search);render();});document.addEventListener('selectionchange',()=>{if(state.saved)render();});render();
}
