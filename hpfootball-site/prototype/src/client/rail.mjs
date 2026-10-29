export function initRails(){document.querySelectorAll('[data-rail]').forEach(root=>{
 const track=root.querySelector('[data-rail-track]'),items=[...track.children],prev=root.querySelector('[data-rail-prev]'),next=root.querySelector('[data-rail-next]'),count=root.querySelector('[data-rail-count]'),progress=root.querySelector('[data-rail-progress]'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const step=()=>items[1]?items[1].offsetLeft-items[0].offsetLeft:track.clientWidth;
 function update(){const max=Math.max(0,track.scrollWidth-track.clientWidth),i=Math.min(items.length-1,Math.round(track.scrollLeft/step()));prev.disabled=track.scrollLeft<2;next.disabled=track.scrollLeft>=max-2;count.textContent=`${i+1} / ${items.length}`;progress.style.width=`${max?20+80*track.scrollLeft/max:100}%`;}
 const move=delta=>track.scrollBy({left:delta*step(),behavior:reduced.matches?'instant':'smooth'});
 prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
 track.addEventListener('keydown',ev=>{if(ev.target!==track)return;if(['ArrowLeft','ArrowRight','Home','End'].includes(ev.key)){ev.preventDefault();if(ev.key==='Home'||ev.key==='End')track.scrollTo({left:ev.key==='Home'?0:track.scrollWidth,behavior:reduced.matches?'instant':'smooth'});else move(ev.key==='ArrowRight'?1:-1);}});
 let frame=0,drag=null,moved=false;
 track.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;update();});},{passive:true});new ResizeObserver(update).observe(track);
 track.addEventListener('pointerdown',ev=>{if(ev.pointerType!=='mouse'||ev.button!==0||ev.target.closest('button,input,select'))return;drag={x:ev.clientX,start:track.scrollLeft,id:ev.pointerId};moved=false;});
 track.addEventListener('pointermove',ev=>{if(!drag)return;const delta=ev.clientX-drag.x;if(Math.abs(delta)>6){moved=true;track.classList.add('is-dragging');track.setPointerCapture(ev.pointerId);track.scrollLeft=drag.start-delta;ev.preventDefault();}});
 const stop=()=>{drag=null;track.classList.remove('is-dragging');};track.addEventListener('pointerup',stop);track.addEventListener('pointercancel',stop);track.addEventListener('click',ev=>{if(moved){ev.preventDefault();ev.stopPropagation();moved=false;}},true);track.addEventListener('dragstart',ev=>ev.preventDefault());update();
 });}
