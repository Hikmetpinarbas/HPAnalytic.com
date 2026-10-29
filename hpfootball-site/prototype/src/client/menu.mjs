export function initMenus(){
 const menus=[...document.querySelectorAll('[data-menu]')];
 const close=(menu,focus=false)=>{clearTimeout(menu._timer);menu.dataset.pinned='false';menu.querySelector('button').setAttribute('aria-expanded','false');menu.querySelector('.mega').hidden=true;if(focus)menu.querySelector('button').focus();};
 const open=menu=>{menus.filter(m=>m!==menu).forEach(m=>close(m));clearTimeout(menu._timer);menu.querySelector('button').setAttribute('aria-expanded','true');menu.querySelector('.mega').hidden=false;};
 menus.forEach(menu=>{
  const toggle=menu.querySelector('button');menu.dataset.pinned='false';
  toggle.addEventListener('click',()=>{if(menu.dataset.pinned==='true')close(menu);else{open(menu);menu.dataset.pinned='true';}});
  menu.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse')return;clearTimeout(menu._timer);menu._timer=setTimeout(()=>open(menu),100);});
  menu.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&menu.dataset.pinned!=='true')menu._timer=setTimeout(()=>close(menu),180);});
  menu.addEventListener('focusout',e=>{if(!menu.contains(e.relatedTarget))close(menu);});
  toggle.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();open(menu);menu.querySelector('.mega a').focus();}if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const i=menus.indexOf(menu);menus[(i+(e.key==='ArrowRight'?1:menus.length-1))%menus.length].querySelector('button').focus();}});
  menu.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close(menu,true);}});
 });
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-menu]'))menus.forEach(m=>close(m));});
 matchMedia('(max-width:800px)').addEventListener('change',()=>menus.forEach(m=>close(m)));
 const mobile=document.querySelector('#mobile-menu');
 document.querySelector('[data-mobile-open]').addEventListener('click',()=>{menus.forEach(m=>close(m));showDialog(mobile);});
 document.querySelectorAll('[data-dialog-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
 document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});d.addEventListener('close',()=>{document.documentElement.style.overflow='';d._returnFocus?.focus();});});
 matchMedia('(min-width:801px)').addEventListener('change',e=>{if(e.matches&&mobile.open)mobile.close();});
}
export function showDialog(dialog){dialog._returnFocus=document.activeElement;document.documentElement.style.overflow='hidden';dialog.showModal();}
