const story = document.querySelector('.v-story');
if (story) {
 const media = matchMedia('(prefers-reduced-motion: reduce)');
 const $ = (q, root = story) => root.querySelector(q);
 const $$ = (q, root = story) => [...root.querySelectorAll(q)];
 // Native overflow remains available without JavaScript, on touch and by keyboard.
 $$('.v-carousel').forEach(module => {
  const rail = $('.v-rail', module);
  const move = direction => {
   const cards = [...rail.children];
   const nearest = cards.reduce((best, el, i) => Math.abs(el.offsetLeft - cards[0].offsetLeft - rail.scrollLeft) < best.distance ? {i, distance: Math.abs(el.offsetLeft - cards[0].offsetLeft - rail.scrollLeft)} : best, {i:0,distance:Infinity}).i;
   const index = Math.max(0, Math.min(cards.length - 1, nearest + direction));
   rail.scrollTo({left:cards[index].offsetLeft - cards[0].offsetLeft, behavior:media.matches?'instant':'smooth'});
   const selectable = cards[index].matches('button');
   if(selectable) cards[index].click();
  };
  $('[data-prev]', module).addEventListener('click', () => move(-1));
  $('[data-next]', module).addEventListener('click', () => move(1));
  rail.addEventListener('keydown', e => {if (e.target !== rail) return; if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
  let drag = null;
  rail.addEventListener('pointerdown', e => {if(e.pointerType==='mouse'&&e.button===0)drag={x:e.clientX,left:rail.scrollLeft,moved:false};});
  rail.addEventListener('pointermove', e => {if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>6){drag.moved=true;rail.classList.add('is-dragging');rail.scrollLeft=drag.left-dx;}});
  const finish=()=>{if(drag?.moved){rail.dataset.dragged='true';setTimeout(()=>delete rail.dataset.dragged,0);}drag=null;rail.classList.remove('is-dragging');};
  rail.addEventListener('pointerup',finish);rail.addEventListener('pointerleave',finish);
  rail.addEventListener('click',e=>{if(rail.dataset.dragged){e.preventDefault();e.stopImmediatePropagation();}},true);
 });
 const selectCard = (cards, card, context) => {cards.forEach(c=>c.setAttribute('aria-pressed',String(c===card)));context.textContent=$('small',card).textContent;};
 const careers=$$('[data-career]');
 careers.forEach(card=>{const select=()=>selectCard(careers,card,$('#career-context'));card.addEventListener('click',select);card.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')select();});card.addEventListener('focus',select);});
 const journey=$$('[data-journey-step]');
 journey.forEach(card=>{const select=()=>{selectCard(journey,card,$('#journey-context'));$$('[data-flow-node]').forEach(n=>n.classList.toggle('is-active',n.dataset.flowNode===card.dataset.journeyStep));const line=$('.v-flow-line');line.style.strokeDashoffset=String(-Number(card.dataset.journeyStep)*30);};card.addEventListener('click',select);card.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')select();});card.addEventListener('focus',select);});
 const keeper=$('[data-keeper]');
 const poses=[
  {head:[247,149],shoulder:[248,205],torso:[248,184],hip:[250,270],rearKnee:[215,325],rearFoot:[185,380],frontKnee:[290,325],frontFoot:[310,380],elbowA:[200,240],handA:[178,210],elbowB:[300,235],handB:[324,205],com:[250,252]},
  {head:[320,134],shoulder:[305,187],torso:[309,167],hip:[283,251],rearKnee:[236,303],rearFoot:[190,379],frontKnee:[338,289],frontFoot:[363,349],elbowA:[299,138],handA:[335,104],elbowB:[367,178],handB:[402,140],com:[305,231]},
  {head:[454,122],shoulder:[428,170],torso:[430,158],hip:[364,217],rearKnee:[303,253],rearFoot:[250,298],frontKnee:[378,282],frontFoot:[417,312],elbowA:[461,120],handA:[510,85],elbowB:[489,171],handB:[540,132],com:[400,196]},
  {head:[595,156],shoulder:[561,192],torso:[554,184],hip:[465,215],rearKnee:[395,243],rearFoot:[331,265],frontKnee:[448,282],frontFoot:[491,314],elbowA:[606,145],handA:[661,126],elbowB:[624,192],handB:[674,158],com:[512,201]}
 ];
 const phaseNames=['Başlangıç','İtiş','Yatay ilerleme','Uzanış'];
 const phaseText=['Dalış, elin topa uzanmasından önce başlar. Hazırlık duruşu hareketin üretileceği koşulları belirler.','Sağa dalışta karşı bacak soldur. İtiş katkısı kontrollü biyomekanik çalışmaların araştırma konusudur.','Yatay ilerleme, bacakların ve eklemlerin birlikte ürettiği hareketle ilişkilidir. Ok uzunluğu bir hız ölçüsü değildir.','Elin uzanışı görünür sonuçtur. Bu çizim maç performansı veya 42 cm’lik ölçülmüş erişim artışı göstermez.'];
 let manualKeeper=false;
 function setPose(progress, manual=false){
  if(manual)manualKeeper=true;
  const p=Math.max(0,Math.min(3,progress*3)),lo=Math.floor(p),hi=Math.min(3,lo+1),f=p-lo;
  const o=Object.fromEntries(Object.keys(poses[0]).map(key=>[key,poses[lo][key].map((v,i)=>v+(poses[hi][key][i]-v)*f)]));
  const path=(id,points)=>$(id).setAttribute('d',points.map((q,i)=>(i?'L':'M')+q.join(' ')).join(''));
  path('#keeper-rear-leg',[o.hip,o.rearKnee,o.rearFoot]);path('#keeper-front-leg',[o.hip,o.frontKnee,o.frontFoot]);path('#keeper-torso',[o.torso,o.hip]);
  $('#keeper-arms').setAttribute('d',`M${o.shoulder}L${o.elbowA}L${o.handA}M${o.shoulder}L${o.elbowB}L${o.handB}`);
  path('#keeper-shorts',[[o.hip[0]-17,o.hip[1]-2],o.hip,[o.hip[0]+17,o.hip[1]-2]]);
  [['#keeper-head',o.head],['#keeper-glove-a',o.handA],['#keeper-glove-b',o.handB],['#keeper-com',o.com],['#joint-hip',o.hip],['#joint-knee',o.rearKnee],['#joint-ankle',o.rearFoot]].forEach(([id,point])=>{$(id).setAttribute('cx',point[0]);$(id).setAttribute('cy',point[1]);});
  const index=Math.round(p);$$('[data-phase]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.phase)===index)));
  $('.v-phase-readout').textContent=`0${index+1} / ${phaseNames[index]}`;$('#keeper-context').textContent=phaseText[index];
  $('input',keeper).value=String(progress*100);keeper.dataset.activePhase=String(index);
 }
 $$('[data-phase]').forEach(b=>b.addEventListener('click',()=>setPose(Number(b.dataset.phase)/3,true)));
 $('input',keeper).addEventListener('input',e=>setPose(Number(e.target.value)/100,true));
 const layerTexts={stance:'Başlangıç duruşu: 2019 ve 2024 çalışmalarının farklı örneklemlerinde aynı avantaj bulunmadı. Tek bir evrensel öneri çıkarılamaz.',push:'Karşı bacak: sağa dalışta sol bacak. Ok kavramsal katkıyı gösterir; ölçülmüş kuvvet vektörü değildir.',com:'Kütle merkezi: kesikli iz temsili bir yoldur. Gerçek motion-capture kaydı değildir.',velocity:'Yatay hız: 11 kalecinin 12 haftalık müdahalesinde ortalama +0,82 m/s raporlandı. Buradaki ok niceliksel ölçek taşımaz.',joints:'Eklem gücü: 7 kalecili çalışmada kalça, diz ve ayak bileği kinetiği incelendi. +523 W, ayrı müdahale çalışmasındaki karşı bacak gücü değişimidir.'};
 $$('[data-layer-toggle]').forEach(b=>{const explain=()=>$('#keeper-context').textContent=layerTexts[b.dataset.layerToggle];b.addEventListener('click',()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));$(`[data-layer="${b.dataset.layerToggle}"]`).classList.toggle('is-muted',!on);explain();});b.addEventListener('pointerenter',explain);b.addEventListener('focus',explain);});
 const gaze=$('[data-gaze]');let focus='target',outcome='hit';
 const metrics={target:{hit:886,miss:488},ball:{hit:627,miss:513}};
 function showGaze(){const n=metrics[focus][outcome],other=metrics[focus][outcome==='hit'?'miss':'hit'];$$('[data-focus]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.focus===focus)));$$('[data-outcome]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.outcome===outcome)));$('.v-gaze-number').innerHTML=`${n} <small>ms</small>`;$('.v-gaze-result-label').textContent=`${focus==='target'?'Hedefe':'Topa'} bakış · ${outcome==='hit'?'isabetli':'isabetsiz'} denemeler`;$('.v-gaze-other').textContent=`${outcome==='hit'?'İsabetsiz':'İsabetli'}: ${other} ms.`;$('.v-duration-track span').style.width=`${n/10}%`;$('#gaze-focus').setAttribute('d',focus==='target'?'M229 280L570 80':'M229 280L300 379');$('#gaze-context').textContent=`${focus==='target'?'Hedefe sabit bakış':'Topa bakış'}: isabetli ${metrics[focus].hit} ms, isabetsiz ${metrics[focus].miss} ms. Toplu ortalamalar; tek bir denemenin sırası veya zamanlaması değildir.`;gaze.dataset.activeFocus=focus;gaze.dataset.activeOutcome=outcome;}
 $$('[data-focus]').forEach(b=>b.addEventListener('click',()=>{focus=b.dataset.focus;showGaze();}));$$('[data-outcome]').forEach(b=>b.addEventListener('click',()=>{outcome=b.dataset.outcome;showGaze();}));
 const phaseObserver=new IntersectionObserver(entries=>{if(media.matches||manualKeeper)return;entries.filter(e=>e.isIntersecting).forEach(e=>setPose(Number(e.target.dataset.scrollPhase)/3));},{rootMargin:'-20% 0px -35% 0px',threshold:.1});
 $$('[data-scroll-phase]').forEach(s=>phaseObserver.observe(s));
 let queued=false;
 function frame(){queued=false;const active=$$('[data-scene]').filter(s=>s.getBoundingClientRect().top<=Math.max(160,innerHeight*.35)).at(-1)||$('[data-scene]');$$('.v-scene-nav a').forEach(a=>{if(a.hash==='#'+active.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});const d=document.documentElement;$('.v-progress span').style.transform=`scaleX(${d.scrollTop/Math.max(1,d.scrollHeight-innerHeight)})`;if(media.matches){story.style.setProperty('--hero-shift','0px');return;}
  const hero=$('.v-hero').getBoundingClientRect();story.style.setProperty('--hero-shift',Math.max(0,Math.min(35,-hero.top*.045))+'px');
  const beyond=$('[data-beyond]').getBoundingClientRect(),t=Math.max(0,Math.min(1,(innerHeight-beyond.top)/(innerHeight*.85)));story.style.setProperty('--track-progress',String(t));
 }
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(frame);}},{passive:true});addEventListener('resize',frame);media.addEventListener('change',frame);frame();
}
