(function(){
  'use strict';
  var section=document.getElementById('hpa6');
  if(!section)return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tracks=section.querySelectorAll('.hpa6-track');
  var totalEl=document.getElementById('hpa6-total');
  var TOTAL=6841;
  var lit=false;

  function activate(){
    if(lit)return; lit=true;
    tracks.forEach(function(t,i){setTimeout(function(){t.style.opacity='1';t.style.transform='translateX(0)'},reduce?0:i*90)});
    section.classList.add('is-lit');
    if(reduce){totalEl.textContent=TOTAL.toLocaleString('tr-TR');return}
    var start=performance.now(),dur=1400;
    function step(now){
      var p=Math.min(1,(now-start)/dur);
      totalEl.textContent=Math.floor(p*TOTAL).toLocaleString('tr-TR');
      if(p<1)requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if(window.ScrollTrigger){
    ScrollTrigger.create({trigger:section,start:'top 75%',once:true,onEnter:activate});
  } else if(window.IntersectionObserver){
    var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){activate();io.disconnect()}})},{threshold:.2});
    io.observe(section);
  } else { activate(); }

  tracks.forEach(function(t){
    t.addEventListener('mouseenter',function(){tracks.forEach(function(x){x.classList.remove('is-active')});t.classList.add('is-active')});
    t.addEventListener('focus',function(){tracks.forEach(function(x){x.classList.remove('is-active')});t.classList.add('is-active')});
  });
})();
