import {sequences} from '../data.mjs';
import {clamp,playbackIndex} from '../state.mjs';
import {icon} from '../icons.mjs';
export function initPlayback(){
 const play=document.querySelector('#play-toggle'),scrub=document.querySelector('#play-time'),clock=document.querySelector('#play-clock'),readout=document.querySelector('#event-readout'),speed=document.querySelector('#play-speed'),sequence=document.querySelector('#sequence-select'),player=document.querySelector('#player-select'),motion=matchMedia('(prefers-reduced-motion:reduce)'),note=document.querySelector('#motion-note'),prev=document.querySelector('#event-prev'),next=document.querySelector('#event-next');
 let seq=sequences[0],time=0,playing=false,frame=0,last=0,index=0,lastIndex=-1;
 const duration=()=>seq.events.at(-1).t;
 function pause(){playing=false;cancelAnimationFrame(frame);frame=0;last=0;play.setAttribute('aria-pressed','false');play.setAttribute('aria-label','Kayıtları oynat');play.innerHTML=icon('play');}
 function draw(){index=playbackIndex(seq.events,time);scrub.value=time;scrub.max=duration();scrub.setAttribute('aria-valuetext',`${time.toFixed(1)} saniye; ${index+1}. demonstrasyon kaydı`);clock.textContent=`${time.toFixed(1)} / ${duration()} sn`;prev.disabled=index===0;next.disabled=index===seq.events.length-1;const r=seq.events[index];if(index!==lastIndex){readout.textContent=`Kayıt ${index+1} / ${seq.events.length} · Oyuncu ${r.player} · ${r.action}`;lastIndex=index;}document.dispatchEvent(new CustomEvent('prototype:playback',{detail:{sequence:seq,index,player:player.value}}));}
 function tick(stamp){if(!playing)return;if(last)time=clamp(time+(stamp-last)/1000*+speed.value,0,duration());last=stamp;draw();if(time>=duration())pause();else frame=requestAnimationFrame(tick);}
 play.addEventListener('click',()=>{if(playing){pause();return;}if(motion.matches)return;if(time>=duration())time=0;playing=true;last=0;play.setAttribute('aria-pressed','true');play.setAttribute('aria-label','Kayıtları durdur');play.innerHTML=icon('pause');frame=requestAnimationFrame(tick);});
 scrub.addEventListener('input',()=>{pause();time=+scrub.value;draw();});
 const jump=i=>{pause();index=clamp(i,0,seq.events.length-1);time=seq.events[index].t;draw();};
 prev.addEventListener('click',()=>jump(index-1));next.addEventListener('click',()=>jump(index+1));document.addEventListener('prototype:select-event',ev=>jump(ev.detail));
 sequence.addEventListener('change',()=>{pause();seq=sequences.find(s=>s.id===sequence.value)||sequences[0];time=0;lastIndex=-1;draw();});
 const initial=new URLSearchParams(location.search).get('player');if(['4','7','9'].includes(initial))player.value=initial;player.addEventListener('change',draw);
 const syncMotion=()=>{pause();play.disabled=motion.matches;note.hidden=!motion.matches;};motion.addEventListener('change',syncMotion);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',pause);syncMotion();draw();
}
