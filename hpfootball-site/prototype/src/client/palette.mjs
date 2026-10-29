import {entities} from '../data.mjs';
import {searchEntities,escapeHTML as e} from '../state.mjs';
import {showDialog} from './menu.mjs';
import {icon} from '../icons.mjs';
export function initPalette(){
 const dialog=document.querySelector('#command-dialog'),query=document.querySelector('#command-query'),results=document.querySelector('#command-results'),status=document.querySelector('#command-status');
 function render(){const matches=searchEntities(entities,query.value),groups=[...new Set(matches.map(x=>x.group))];results.innerHTML=matches.length?groups.map(g=>`<section><h3>${e(g)}</h3>${matches.filter(x=>x.group===g).map(x=>`<a href="${e(x.href)}"><span>${e(x.title)}<small>${e(x.description)}</small></span>${icon('up')}</a>`).join('')}</section>`).join(''):'<div class="command-empty"><p>Bu aramada sonuç yok.</p><p>Başka bir konu veya daha kısa bir ifade dene.</p></div>';status.textContent=`${matches.length} sonuç, ${groups.length} kategori.`;}
 function open(){const mobile=document.querySelector('#mobile-menu');if(mobile.open)mobile.close();if(!dialog.open)showDialog(dialog);query.value='';render();query.focus();}
 document.querySelectorAll('[data-search-open]').forEach(b=>b.addEventListener('click',open));query.addEventListener('input',render);
 document.addEventListener('keydown',ev=>{if((ev.metaKey||ev.ctrlKey)&&ev.key.toLowerCase()==='k'){ev.preventDefault();if(dialog.open)dialog.close();else open();}});
 dialog.addEventListener('keydown',ev=>{const links=[...results.querySelectorAll('a')],i=links.indexOf(document.activeElement);if(ev.key==='ArrowDown'){ev.preventDefault();links[Math.min(links.length-1,i+1)]?.focus();}if(ev.key==='ArrowUp'){ev.preventDefault();if(i<=0)query.focus();else links[i-1].focus();}if(ev.key==='Enter'&&ev.target===query){ev.preventDefault();links[0]?.click();}});
}
