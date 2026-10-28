/* ===== core (shared with the pre-match premier page: plate factory, options menu, zone text, cover) ===== */
const NS='http://www.w3.org/2000/svg';
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
function S(tag,at,par){const e=document.createElementNS(NS,tag);if(at)for(const k in at)e.setAttribute(k,at[k]);if(par)par.appendChild(e);return e}
function T(par,x,y,s,at){const e=S('text',Object.assign({x:x,y:y},at||{}),par);e.textContent=s;return e}
const fmt=(v,d)=>{d=d==null?1:d;return Number(v).toLocaleString('tr-TR',{minimumFractionDigits:d,maximumFractionDigits:d})};
const pct=(v,d)=>'%'+fmt(v*100,d==null?1:d);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let REDUCED=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const COL={gs:'#E9DCBD',fb:'#5DAFAA',gold:'#F5B82E',ink:'#E9E0CE',mut:'#B3AB9B',night:'#0D0B09',dim:'rgba(233,224,206,.22)'};
const D=window.__DATA__;
const TEAM={GS:{name:'Galatasaray',col:COL.gs,code:'GAL'},FB:{name:'Fenerbahçe',col:COL.fb,code:'FEN'}};
const NAME={ALA:'Alanyaspor',AS:'Amed SK',BAŞ:'Başakşehir',BEŞ:'Beşiktaş',COR:'Çorum FK',CR:'Rizespor',ERZ:'Erzurumspor',EYÜ:'Eyüpspor',FEN:'Fenerbahçe',GAL:'Galatasaray',GAZ:'Gaziantep FK',GEN:'Gençlerbirliği',GÖZ:'Göztepe',KAS:'Kasımpaşa',KOC:'Kocaelispor',KON:'Konyaspor',SAM:'Samsunspor',TRA:'Trabzonspor'};
/* football minute from the clock minute (28.15 -> 29'); first-half stoppage 45+n, second-half 90+n */
function minLabel(m,half){const n=Math.floor(m)+1;if(half===1&&n>45)return '45+'+(n-45)+'’';if(n>90)return '90+'+(n-90)+'’';return n+'’'}
function sur(p){return p.replace(/^.* /,'')}

/* team markers: colour never carries meaning alone (GS circle, FB square) */
function mark(par,team,cx,cy,r,at){
  at=Object.assign({fill:TEAM[team].col,stroke:COL.night,'stroke-width':1.4},at||{});
  if(team==='GS')return S('circle',Object.assign({cx:cx,cy:cy,r:r},at),par);
  return S('rect',Object.assign({x:cx-r*.9,y:cy-r*.9,width:r*1.8,height:r*1.8},at),par)}
function star(par,cx,cy,r,at){const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;p.push((cx+Math.cos(a)*q).toFixed(1)+','+(cy+Math.sin(a)*q).toFixed(1))}return S('polygon',Object.assign({points:p.join(' ')},at||{}),par)}

/* ----- options menu (thin, hidden until opened) ----- */
const ICON='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true"><path d="M2 4.5h7M12 4.5h2M2 11.5h2M7 11.5h7"/><circle cx="10.5" cy="4.5" r="1.6"/><circle cx="5.5" cy="11.5" r="1.6"/></svg>';
let MENUID=0;
function buildMenu(host,groups,state,onChange){
  const id='m'+(++MENUID);
  host.innerHTML='<button class="optbtn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="'+id+'">'+ICON+'<span>Seçenekler</span></button><div class="optmenu" id="'+id+'" hidden></div>';
  const btn=host.firstChild,menu=host.lastChild;
  groups.forEach(g=>{
    const fs=document.createElement('fieldset');const lg=document.createElement('legend');lg.textContent=g.label;fs.appendChild(lg);
    g.opts.forEach(o=>{const lb=document.createElement('label');const inp=document.createElement('input');inp.type='radio';inp.name=id+g.id;inp.value=o[0];inp.checked=String(state[g.id])===String(o[0]);
      inp.addEventListener('change',()=>{state[g.id]=o[0];onChange(g.id,o[0])});
      const sp=document.createElement('span');sp.textContent=o[1];lb.appendChild(inp);lb.appendChild(sp);fs.appendChild(lb)});
    menu.appendChild(fs)});
  const close=()=>{menu.hidden=true;btn.setAttribute('aria-expanded','false')};
  btn.addEventListener('click',e=>{e.stopPropagation();const open=menu.hidden;$$('.optmenu').forEach(m=>{m.hidden=true});$$('.optbtn').forEach(b=>b.setAttribute('aria-expanded','false'));if(open){menu.hidden=false;btn.setAttribute('aria-expanded','true')}});
  menu.addEventListener('click',e=>e.stopPropagation());
  host.addEventListener('keydown',e=>{if(e.key==='Escape'){close();btn.focus()}});
  return{close,sync(){$$('input',menu).forEach(i=>{const gid=i.name.slice(id.length);i.checked=String(state[gid])===i.value})}}}
document.addEventListener('click',()=>{$$('.optmenu').forEach(m=>{m.hidden=true});$$('.optbtn').forEach(b=>b.setAttribute('aria-expanded','false'))});

/* ----- plate factory ----- */
const CHARTS={},CTX={};
function mountPlate(fig){
  const name=fig.dataset.chart,def=CHARTS[name];if(!def)return;
  fig.innerHTML='';
  const h=document.createElement('div');h.className='pl-h';
  h.innerHTML='<div><h3></h3><p></p></div><div class="opt"></div>';
  h.querySelector('h3').textContent=fig.dataset.title;h.querySelector('p').textContent=fig.dataset.sub;
  fig.appendChild(h);
  const body=document.createElement('div');body.className='pl-fig';
  const stage=document.createElement('div');stage.className='stage';body.appendChild(stage);fig.appendChild(body);
  const ro=document.createElement('div');ro.className='readout';ro.setAttribute('aria-live','polite');fig.appendChild(ro);
  const f=document.createElement('div');f.className='pl-f';
  f.innerHTML='<span>'+(fig.dataset.src||'')+'</span><span></span>';
  if(fig.dataset.hk){f.lastChild.innerHTML='Görsel yaklaşım: <a href="https://github.com/harshkrishna17" target="_blank" rel="noopener">Harsh Krishna</a>'}
  fig.appendChild(f);
  const ctx={fig:fig,stage:stage,state:Object.assign({},def.state||{}),w:0,
    say(html){ro.innerHTML=html},
    redraw(){if(ctx.w>0)def.draw(ctx)}};
  if(def.groups){ctx.menu=buildMenu(h.querySelector('.opt'),def.groups,ctx.state,()=>{def.onOption?def.onOption(ctx):ctx.redraw()})}
  else h.querySelector('.opt').remove();
  def.mount&&def.mount(ctx);
  let raf=0,lastW=0;
  const run=()=>{raf=0;const w=Math.floor(stage.clientWidth);if(w>0&&w!==lastW){lastW=w;ctx.w=w;def.draw(ctx)}};
  new ResizeObserver(()=>{if(!raf)raf=requestAnimationFrame(run)}).observe(stage);
  run();CTX[fig.id||name]=ctx;
  return ctx}

/* zone-aware heading colour: align the viewport-wide gradient with each element */
function alignZones(){$$('.zt').forEach(e=>{const r=e.getBoundingClientRect();e.style.setProperty('--zx',(-(r.left+window.scrollX))+'px')})}
window.addEventListener('resize',alignZones);window.addEventListener('load',alignZones);

function whenVisible(el,on,off){
  if(!('IntersectionObserver' in window)){on();return}
  new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?on():off&&off()),{rootMargin:'120px'}).observe(el)}

function mkSvg(ctx,h){ctx.stage.innerHTML='';return S('svg',{viewBox:'0 0 '+ctx.w+' '+h,width:ctx.w,height:h,role:'img'},ctx.stage)}
function aria(svg,t){svg.setAttribute('aria-label',t)}
function hover(g,fn){g.addEventListener('mouseenter',fn);g.addEventListener('focus',fn);g.addEventListener('click',fn)}

/* pitch in the common frame: Galatasaray attacks left -> right, Galatasaray's right flank (= Fenerbahçe's left) at the bottom */
function pitch(g,x0,y0,pw,col){
  const s=pw/105,ph=68*s,A={fill:'none',stroke:col||'rgba(245,184,46,.42)','stroke-width':1};
  S('rect',Object.assign({x:x0,y:y0,width:pw,height:ph},A),g);S('line',Object.assign({x1:x0+pw/2,x2:x0+pw/2,y1:y0,y2:y0+ph},A),g);S('circle',Object.assign({cx:x0+pw/2,cy:y0+ph/2,r:9.15*s},A),g);
  [0,1].forEach(side=>{const sg=side?-1:1,bx=side?x0+pw:x0;
    S('rect',Object.assign({x:side?bx-16.5*s:bx,y:y0+ph/2-20.16*s,width:16.5*s,height:40.32*s},A),g);
    S('rect',Object.assign({x:side?bx-5.5*s:bx,y:y0+ph/2-9.16*s,width:5.5*s,height:18.32*s},A),g);
    S('rect',Object.assign({x:side?bx:bx-2.4*s,y:y0+ph/2-3.66*s,width:2.4*s,height:7.32*s},A),g);
    S('circle',{cx:bx+sg*11*s,cy:y0+ph/2,r:1.4,fill:col||'rgba(245,184,46,.5)'},g)});
  return{s:s,ph:ph,P:(gx,gy)=>[x0+gx*s,y0+(68-gy)*s]}}

/* ===== cover: rotating star field + backlight (raw WebGL), same instrument as the pre-match page ===== */
function initCover(){
  const cv=$('#stars'),lit=$('#lit');if(!cv)return;
  const gl=cv.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true});
  if(!gl){return}
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
  const pr=(v,f)=>{const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,v));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);return p};
  const pb=pr('attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,0.,1.);}',
   'precision mediump float;varying vec2 v;uniform float a,asp,t;void main(){vec2 q=vec2(v.x*asp,v.y);float r=length(q);float ang=atan(q.y,q.x);'+
   'float b=pow(max(0.,cos(3.*(ang-a))),22.)+.7*pow(max(0.,cos(3.*(ang-a)+2.094)),30.);float fall=exp(-r*1.5);'+
   'vec3 c=vec3(1.,.72,.28)*(b*fall*.55)+vec3(1.,.82,.45)*exp(-r*r*5.)*.26+vec3(.5,.18,.12)*exp(-r*1.1)*.10;gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}');
  const pstar=pr('attribute vec3 p;attribute float s;uniform float a,asp,t,dpr;varying float tw;varying float k;'+
   'void main(){float ca=cos(a),sa=sin(a);vec2 xy=vec2(p.x*ca-p.y*sa,p.x*sa+p.y*ca);float tilt=.62;float y=xy.y*cos(tilt)-p.z*sin(tilt);float z=xy.y*sin(tilt)+p.z*cos(tilt);'+
   'gl_Position=vec4(xy.x*.55/asp*1.9,y*.55*1.9,0.,1.);float d=.55+.45*(z*.5+.5);tw=.55+.45*sin(t*(1.2+s*3.)+s*40.);k=s;gl_PointSize=(1.2+4.2*s*s)*d*dpr*(1.+.15*tw);}',
   'precision mediump float;varying float tw;varying float k;void main(){vec2 c=gl_PointCoord-.5;float d=length(c);float g=smoothstep(.5,0.,d);float core=smoothstep(.16,0.,d);'+
   'vec3 col=mix(vec3(1.,.86,.55),vec3(.78,.86,1.),fract(k*7.3));gl_FragColor=vec4(col*(g*.55+core*.9)*tw,g*tw);}');
  const N=2600,arr=new Float32Array(N*4);let rs=2610026;const rnd=()=>{rs=(rs*16807)%2147483647;return rs/2147483647};
  for(let i=0;i<N;i++){const arm=Math.floor(rnd()*3),r=Math.pow(rnd(),.62),th=arm*2.094+r*5.2+(rnd()-.5)*.55*(1.2-r),z=(rnd()-.5)*.18*(1.1-r);
    arr[i*4]=Math.cos(th)*r;arr[i*4+1]=Math.sin(th)*r;arr[i*4+2]=z;arr[i*4+3]=Math.pow(rnd(),2.2)}
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);
  const tri=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,tri);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  let W=0,H=0;const dpr=Math.min(2,window.devicePixelRatio||1);
  const size=()=>{const r=cv.getBoundingClientRect();W=Math.max(2,Math.floor(r.width*dpr));H=Math.max(2,Math.floor(r.height*dpr));cv.width=W;cv.height=H;gl.viewport(0,0,W,H)};
  size();window.addEventListener('resize',size);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
  const draw=ms=>{
    const t=ms/1000,a=REDUCED?.6:t*.11;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(pb);gl.bindBuffer(gl.ARRAY_BUFFER,tri);let loc=gl.getAttribLocation(pb,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    gl.uniform1f(gl.getUniformLocation(pb,'a'),-a*1.7);gl.uniform1f(gl.getUniformLocation(pb,'asp'),W/H);gl.uniform1f(gl.getUniformLocation(pb,'t'),t);gl.drawArrays(gl.TRIANGLES,0,3);
    gl.useProgram(pstar);gl.bindBuffer(gl.ARRAY_BUFFER,buf);loc=gl.getAttribLocation(pstar,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,16,0);
    const ls=gl.getAttribLocation(pstar,'s');gl.enableVertexAttribArray(ls);gl.vertexAttribPointer(ls,1,gl.FLOAT,false,16,12);
    gl.uniform1f(gl.getUniformLocation(pstar,'a'),a);gl.uniform1f(gl.getUniformLocation(pstar,'asp'),W/H);gl.uniform1f(gl.getUniformLocation(pstar,'t'),t);gl.uniform1f(gl.getUniformLocation(pstar,'dpr'),dpr);
    gl.drawArrays(gl.POINTS,0,N);
    lit&&lit.style.setProperty('--a',((-a*1.7)*180/Math.PI+30)%360+'deg')};
  let vis=true,raf=0;
  const loop=ms=>{raf=0;if(!vis)return;draw(ms);raf=requestAnimationFrame(loop)};
  if(REDUCED){draw(0);return}
  whenVisible(cv,()=>{vis=true;if(!raf)raf=requestAnimationFrame(loop)},()=>{vis=false});
}

/* ===== maç sonu charts — every chart answers one question; numbers live here, not in the prose ===== */
const H1=D.meta.half_end['1'],H2=D.meta.half_end['2'],GAP=2.2;
const TT=H1+GAP+(H2-45);
const tx=(m,h)=>h===1?m:H1+GAP+(m-45);
const GOALS=D.goals,SHOTS=D.shots,CARDS=D.cards;
const lastName=p=>{const m={'Victor Osimhen':'Osimhen','Barış Alper Yılmaz':'Barış Alper','İrfan Can Kahveci':'İrfan Can','Davinson Sánchez':'Sánchez','Ismail Jakobs':'Jakobs','Oğuz Aydın':'Oğuz Aydın','Kerem Akturkoglu':'Kerem','Archie Brown':'Brown','Abdülkerim Bardakcı':'Abdülkerim','Mattéo Guendouzi':'Guendouzi','Ngolo Kante':'Kanté','Lucas Torreira':'Torreira','Yunus Akgün':'Yunus','Roland Sallai':'Sallai','Rafael Leão':'Leão','Leroy Sané':'Sané','Aleksei Batrakov':'Batrakov','Romelu Lukaku':'Lukaku','Milan Skriniar':'Škriniar','Mason Greenwood':'Greenwood','Levent Mercan':'Levent Mercan','Kojo Oppong':'Oppong','Mert Hakan Yandaş':'Mert Hakan','Dorgeles Nene':'Nene','Vedat Muriqi':'Muriqi','Eren Elmalı':'Eren Elmalı','Gabriel Sara':'Sara','Wilfried Singo':'Singo','Mario Lemina':'Lemina','Nelson Semedo':'Semedo'};return m[p]||sur(p)};

/* ---------- 1. maçın nabzı (sticky, scroll-driven) ---------- */
function parseWin(s){if(!s)return null;const m=s.match(/^(\d):([\d.]+)-([\d.]+)$/);return m?{h:+m[1],a:+m[2],b:+m[3]}:null}
function inWin(w,h,m){if(!w)return true;if(w.h===1&&h===1)return m>=w.a&&m<w.b;if(w.h===2&&h===2)return m>=w.a&&m<w.b;return false}
CHARTS.pulse={state:{m:'ft',win:''},
groups:[{id:'m',label:'Ölçü (üç dakikalık dilim)',opts:[['ft','Son üçüncü bölgede topla aksiyon'],['box','Rakip ceza sahasında topla aksiyon']]}],
draw(ctx){
  const w=ctx.w,st=ctx.state,narrow=w<560,k=ctx.k||0,full=clamp(w*.5,300,430),H=Math.round(full+(88-full)*k),L=narrow?26:34,R=10,Tp=Math.round(40-24*k),B=Math.round(44-30*k),pw=w-L-R,ph=H-Tp-B,mid=Tp+ph/2,fade=clamp(1-k*4,0,1);
  const svg=mkSvg(ctx,H);aria(svg,'Maçın nabzı: üç dakikalık dilimlerde iki takımın son üçüncü bölgedeki topla aksiyonları, gol, değişiklik ve kart anları');
  const bins=st.m==='box'?D.momentum_box:D.momentum,mx=Math.max(4,...bins.map(b=>Math.max(b.GS,b.FB))),sx=t=>L+t/TT*pw,amp=ph/2-Math.round(14-10*k);
  const win=parseWin(st.win);
  if(win){const a=sx(tx(win.a,win.h)),b=sx(tx(Math.min(win.b,win.h===1?H1:H2),win.h));S('rect',{x:a,y:Tp-6,width:Math.max(3,b-a),height:ph+12,fill:'rgba(245,184,46,.07)',stroke:'rgba(245,184,46,.55)','stroke-width':1},svg)}
  // axis
  [[1,0],[1,15],[1,30],[1,45],[2,60],[2,75],[2,90]].forEach(q=>{const x=sx(tx(q[1],q[0]));S('line',{x1:x,x2:x,y1:Tp,y2:Tp+ph,class:'grid'},svg);if(fade>0)T(svg,x,Tp+ph+16,q[1]+'’',{'text-anchor':'middle','font-size':11,class:'mut',opacity:fade})});
  S('line',{x1:L,x2:L+pw,y1:mid,y2:mid,class:'ax'},svg);
  const hx=sx(H1+GAP/2);if(fade>0)T(svg,hx,Tp+ph+16,'İY',{'text-anchor':'middle','font-size':10,class:'mut'});
  S('rect',{x:sx(H1),y:Tp,width:sx(H1+GAP)-sx(H1),height:ph,fill:'rgba(11,13,20,.85)'},svg);
  // bars
  bins.forEach(b=>{const x0=sx(tx(b.a,b.h)),x1=sx(tx(b.b,b.h)),bw=Math.max(1,x1-x0-1.4),on=!win||(b.h===win.h&&b.b>win.a&&b.a<win.b);
    const g=S('g',{class:'hit',tabindex:0,role:'img','aria-label':Math.floor(b.a)+'-'+Math.ceil(b.b)+'. dakika: Galatasaray '+b.GS+', Fenerbahçe '+b.FB},svg);
    if(b.GS)S('rect',{x:x0+.7,y:mid-b.GS/mx*amp,width:bw,height:b.GS/mx*amp,fill:COL.gs,opacity:on?.95:.22},g);
    if(b.FB)S('rect',{x:x0+.7,y:mid,width:bw,height:b.FB/mx*amp,fill:COL.fb,opacity:on?.95:.22},g);
    S('rect',{x:x0,y:Tp,width:x1-x0,height:ph,fill:'transparent'},g);
    hover(g,()=>ctx.say('<b>'+Math.floor(b.a)+'–'+Math.ceil(b.b)+'. dakika</b> ('+(b.h===1?'ilk':'ikinci')+' yarı): Galatasaray <b>'+b.GS+'</b>, Fenerbahçe <b>'+b.FB+'</b> '+(st.m==='box'?'ceza sahası':'son üçüncü bölge')+' aksiyonu.'))});
  if(fade>0)T(svg,L+2,Tp-22,'Galatasaray ↑',{'font-size':11.5,style:'fill:'+COL.gs+';font-weight:600'});
  if(fade>0)T(svg,L+2,Tp+ph+32,'Fenerbahçe ↓',{'font-size':11.5,style:'fill:'+COL.fb+';font-weight:600'});
  // shot ticks on the edges: up = Galatasaray, down = Fenerbahçe
  SHOTS.forEach(s=>{const x=sx(tx(s.min,s.half)),up=s.team==='GS',y=up?Tp-8:Tp+ph+6,on=inWin(win,s.half,s.min),op=on?1:.3;
    if(s.res==='gol')star(svg,x,y,6.5,{fill:COL.gold,stroke:COL.night,'stroke-width':1,opacity:op});
    else if(s.res==='isabetli')mark(svg,s.team,x,y,3.2,{opacity:op});
    else mark(svg,s.team,x,y,3.2,{fill:'none',stroke:TEAM[s.team].col,'stroke-width':1.2,opacity:op})});
  // goals
  const lastLab={GS:-1e9,FB:-1e9},row={GS:0,FB:0};
  GOALS.forEach(g=>{const x=sx(tx(g.min,g.half));S('line',{x1:x,x2:x,y1:Tp,y2:Tp+ph,stroke:COL.gold,'stroke-width':1.2,'stroke-dasharray':'2 3'},svg);
    const up=g.team==='GS',lab=(narrow?'':lastName(g.player)+' ')+minLabel(g.min,g.half);
    row[g.team]=x-lastLab[g.team]<(narrow?40:110)?row[g.team]+1:0;lastLab[g.team]=x;
    const yy=up?Tp+12+row[g.team]*15:Tp+ph-6-row[g.team]*15,right=x>L+pw*.85;
    if(fade>.05)T(svg,right?x-4:x+4,yy,lab,{'font-size':narrow?10.5:12,style:'fill:#FFF3D6;font-weight:700;paint-order:stroke;stroke:#0D0B09;stroke-width:3px','text-anchor':right?'end':'start',opacity:fade})});
  // substitutions (triangles on the centre line) and red cards
  D.subs.forEach(su=>{if(!su.ins.length)return;const x=sx(tx(su.min,2)),up=su.team==='GS';
    const g=S('g',{class:'hit',tabindex:0,role:'img','aria-label':TEAM[su.team].name+' değişiklik '+su.min},svg);
    S('path',{d:up?`M${x-5} ${mid-2} L${x+5} ${mid-2} L${x} ${mid-10}Z`:`M${x-5} ${mid+2} L${x+5} ${mid+2} L${x} ${mid+10}Z`,fill:'#FFF3D6',stroke:TEAM[su.team].col,'stroke-width':1.4},g);
    S('circle',{cx:x,cy:mid,r:12,fill:'transparent'},g);
    hover(g,()=>ctx.say('<b>'+TEAM[su.team].name+' ≈'+su.min+'’</b>: '+su.ins.map(lastName).join(', ')+' girdi · '+su.outs.map(lastName).join(', ')+' çıktı.'))});
  CARDS.filter(c=>c.c==='K').forEach((c,i)=>{const x=sx(tx(c.min,c.half))-i*9;S('rect',{x:x-3,y:mid-24-i*0,width:6,height:9,fill:'#B8433A',stroke:COL.night},svg)});
  if(!ctx.said){const tot={GS:0,FB:0};bins.forEach(b=>{if(!win||(b.h===win.h&&b.b>win.a&&b.a<win.b)){tot.GS+=b.GS;tot.FB+=b.FB}});
    ctx.say((win?'<b>Seçili dilim</b>: ':'<b>Maç boyu</b>: ')+'Galatasaray <b>'+tot.GS+'</b> · Fenerbahçe <b>'+tot.FB+'</b> '+(st.m==='box'?'ceza sahası':'son üçüncü bölge')+' aksiyonu. Üstte ve altta şutlar (dolu = isabetli, boş = isabetsiz, yıldız = gol); ortadaki üçgenler oyuncu değişikliği, kırmızı dikdörtgenler kırmızı kart.')}
  ctx.said=false},
onOption(ctx){ctx.redraw()}};

function initScrolly(){
  const steps=$$('.step[data-win]'),ctx=CTX.pulse,sc=$('.dock-anchor'),dock=$('.sticky');
  if(!steps.length||!ctx||!dock)return;
  const fig=ctx.fig;let full=0,strip=0,lastK=-1,tick=0;
  const apply=k=>{const q=Math.round(k*30)/30;fig.style.setProperty('--k',k.toFixed(3));if(q!==lastK){lastK=q;ctx.k=q;ctx.redraw()}};
  const update=()=>{tick=0;const r=sc.getBoundingClientRect(),span=Math.max(1,full-strip);apply(clamp(-(r.top+20),0,span)/span)};
  const measure=()=>{dock.style.height='';lastK=-1;apply(0);full=fig.offsetHeight;dock.style.height=full+'px';lastK=-1;apply(1);strip=fig.offsetHeight;lastK=-1;update()};
  const req=()=>{if(!tick)tick=requestAnimationFrame(update)};
  window.addEventListener('scroll',req,{passive:true});
  let rt=0;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(measure,150)});
  window.addEventListener('load',measure);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
  measure();
  const set=el=>{steps.forEach(s=>s.classList.toggle('on',s===el));ctx.state.win=el.dataset.win||'';ctx.redraw()};
  const clear=()=>{if(ctx.state.win){steps.forEach(s=>s.classList.remove('on'));ctx.state.win='';ctx.redraw()}};
  if(!('IntersectionObserver' in window))return;
  const io=new IntersectionObserver(es=>{es.filter(e=>e.isIntersecting).forEach(e=>set(e.target))},{rootMargin:'-42% 0px -42% 0px'});
  steps.forEach(s=>io.observe(s));
  new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting))clear()},{rootMargin:'-42% 0px -42% 0px'}).observe($('#s2'));
  steps.forEach(s=>s.addEventListener('click',()=>set(s)));
}

/* ---------- 2. saha: katmanlı (top kazanımı / şut / alan) ---------- */
const WINS={all:['Tüm maç',()=>true],m15:['İlk 15 dakika',(h,m)=>h===1&&m<15],h1:['İlk yarı',(h)=>h===1],h2:['İkinci yarı',(h)=>h===2],after:['2–1’den sonra',(h,m)=>h===2&&m>=61.58]};
/* ---------- 2a. atlas: magma 12x8 küçük çoklu paneller (Source Atlas dili; şut-haritası gelenekleri için Harsh Krishna'ya borçlu, kod kopyalanmadı) ---------- */
const MAGMA=[[0,[6,5,14]],[.16,[38,16,86]],[.36,[112,31,129]],[.56,[190,55,112]],[.76,[246,110,92]],[.9,[254,188,118]],[1,[252,253,191]]];
function magma(v){v=clamp(v,0,1);for(let i=1;i<MAGMA.length;i++){if(v<=MAGMA[i][0]){const a=MAGMA[i-1],b=MAGMA[i],f=(v-a[0])/(b[0]-a[0]);return a[1].map((c,q)=>Math.round(c+(b[1][q]-c)*f))}}return MAGMA[MAGMA.length-1][1]}
const SLATE='rgba(158,172,190,.55)';
const own=(team,x,y)=>team==='GS'?[x,y]:[105-x,68-y];
CHARTS.atlas={state:{win:'all'},
groups:[{id:'win',label:'Zaman',opts:Object.keys(WINS).map(k=>[k,WINS[k][0]])}],
draw(ctx){
  const w=ctx.w,st=ctx.state,wide=w>=760,narrow=w<560,ok=WINS[st.win][1],gap=18,padX=narrow?10:18;
  const pw=wide?Math.floor((w-gap-padX*2)/2):w-padX*2,s=pw/105,ph=68*s,head=36,blk=head+ph+26,H=(wide?1:2)*blk+(wide?0:8)+46;
  const svg=mkSvg(ctx,H);aria(svg,'Topla aksiyonun 12 x 8 haritası; iki takım, kendi hücum yönünde; şutlar ve goller işaretli');
  const NX=12,NY=8,G={GS:Array.from({length:NY},()=>Array(NX).fill(0)),FB:Array.from({length:NY},()=>Array(NX).fill(0))},n={GS:0,FB:0},ft={GS:0,FB:0};
  D.acts.forEach(a=>{const t=a[0]?'FB':'GS';if(!ok(a[1],a[2]))return;const [ox,oy]=own(t,a[3],a[4]);G[t][Math.min(NY-1,Math.floor((68-oy)/68*NY))][Math.min(NX-1,Math.floor(ox/105*NX))]++;n[t]++;if(ox>=70)ft[t]++});
  const mx=Math.max(1,...G.GS.flat(),...G.FB.flat());
  const defs=S('defs',{},svg),lg=S('linearGradient',{id:'mg',x1:0,x2:1,y1:0,y2:0},defs);for(let i=0;i<=10;i++){const c=magma(i/10);S('stop',{offset:(i*10)+'%','stop-color':'rgb('+c.join(',')+')'},lg)}
  const cw=pw/NX,ch=ph/NY,sh={GS:0,FB:0};
  ['GS','FB'].forEach((t,p)=>{
    const x0=wide?padX+p*(pw+gap):padX,y0=(wide?0:p*(blk+8))+head;
    T(svg,x0,y0-12,TEAM[t].name.toUpperCase(),{'font-size':20,style:'fill:'+TEAM[t].col+';font-weight:800;letter-spacing:.07em;font-family:var(--f-disp)'});
    T(svg,x0+pw,y0-12,n[t]+' topla aksiyon',{'font-size':12,'text-anchor':'end',style:'fill:#B9B2A2'});
    for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const v=G[t][j][i],c=magma(Math.sqrt(v/mx)),g=S('g',{class:'hit'},svg);
      S('rect',{x:x0+i*cw+.6,y:y0+j*ch+.6,width:cw-1.2,height:ch-1.2,fill:'rgb('+c.join(',')+')'},g);
      if(v&&cw>=34)T(g,x0+i*cw+cw/2,y0+j*ch+ch/2+4,v,{'font-size':10.5,'text-anchor':'middle',style:'fill:'+((c[0]+c[1]+c[2])/3>120?'#1A0F1F':'#F3EAD8')+';opacity:.8'});
      hover(g,()=>ctx.say('<b>'+TEAM[t].name+'</b>, bu hücrede <b>'+v+'</b> topla aksiyon (kendi hücum yönünde '+fmt(i*105/NX,0)+'–'+fmt((i+1)*105/NX,0)+' m). <span class="tg">'+WINS[st.win][0]+'</span>'))}
    const P=pitch(svg,x0,y0,pw,SLATE);
    T(svg,x0,y0+ph+16,'saldırı yönü →',{'font-size':11,style:'fill:#8F9AAA'});
    SHOTS.filter(q=>q.team===t&&ok(q.half,q.min)).forEach(q=>{const [ox,oy]=own(t,q.gx,q.gy),[cx,cy]=P.P(ox,oy),r=narrow?4.4:5.6,g=S('g',{class:'hit',tabindex:0,role:'img','aria-label':lastName(q.player)+' şut '+q.res},svg);
      if(q.res==='gol')star(g,cx,cy,r*1.9,{fill:COL.gold,stroke:'#0D0B09','stroke-width':1.2});
      else{S('circle',{cx:cx,cy:cy,r:r,fill:'rgba(8,6,12,.35)',stroke:'#F3EAD8','stroke-width':q.res==='isabetli'?2:1.3},g);if(q.res==='isabetli')S('circle',{cx:cx,cy:cy,r:1.6,fill:'#F3EAD8'},g)}
      S('circle',{cx:cx,cy:cy,r:12,fill:'transparent'},g);
      hover(g,()=>ctx.say('<b>'+lastName(q.player)+'</b> · '+TEAM[t].name+' · '+minLabel(q.min,q.half)+' · '+(q.fk?'serbest vuruş · ':'')+q.res+'.'))});
    sh[t]=n[t]?ft[t]/n[t]:0});
  const ly=H-18,lx=padX;S('rect',{x:lx,y:ly-8,width:150,height:9,fill:'url(#mg)',stroke:SLATE,'stroke-width':.8},svg);
  T(svg,lx,ly+12,'az',{'font-size':11,style:'fill:#8F9AAA'});T(svg,lx+150,ly+12,mx+' aksiyon',{'font-size':11,'text-anchor':'end',style:'fill:#8F9AAA'});
  const mxl=lx+176;S('circle',{cx:mxl+6,cy:ly-3,r:5,fill:'none',stroke:'#F3EAD8','stroke-width':1.3},svg);T(svg,mxl+16,ly,'şut',{'font-size':11.5});
  S('circle',{cx:mxl+66,cy:ly-3,r:5,fill:'none',stroke:'#F3EAD8','stroke-width':2},svg);S('circle',{cx:mxl+66,cy:ly-3,r:1.6,fill:'#F3EAD8'},svg);T(svg,mxl+76,ly,'isabetli',{'font-size':11.5});
  star(svg,mxl+146,ly-3,8,{fill:COL.gold,stroke:'#0D0B09','stroke-width':1});T(svg,mxl+158,ly,'gol',{'font-size':11.5});
  ctx.say('Her takım kendi hücum yönünde, soldan sağa. Hücre rengi topla aksiyon sayısı; iki panel aynı ölçeği kullanır, yani parlaklık farkı hacim farkıdır. Son üçüncü bölgenin payı: Galatasaray <b>'+pct(sh.GS,0)+'</b>, Fenerbahçe <b>'+pct(sh.FB,0)+'</b>. Şutlar yalnız konumu kayıtta olanlar. <span class="tg">'+WINS[st.win][0]+'</span>')},
onOption(ctx){ctx.redraw()}};

/* ---------- 2b. top kazanımı yoğunluğu: zamanla büyüyen çekirdek yoğunluğu (KDE), olay sayacıyla ---------- */
const KCW=70,KCH=46,KBW=8;
function kdeField(evs,u,out){out.fill(0);const r=3*KBW,cx=105/KCW,cy=68/KCH;
  evs.forEach(e=>{if(e.te>u)return;const wt=Math.min(1,(u-e.te)/(TT*.012)),i0=Math.max(0,Math.floor((e.x-r)/cx)),i1=Math.min(KCW-1,Math.ceil((e.x+r)/cx)),j0=Math.max(0,Math.floor((68-e.y-r)/cy)),j1=Math.min(KCH-1,Math.ceil((68-e.y+r)/cy));
    for(let j=j0;j<=j1;j++){const dy=(68-(j+.5)*cy)-e.y;for(let i=i0;i<=i1;i++){const dx=(i+.5)*cx-e.x;out[j*KCW+i]+=wt*Math.exp(-(dx*dx+dy*dy)/(2*KBW*KBW))}}})}
function kdeRender(ctx){
  if(!ctx.panels||!ctx.buf)return;const u=ctx.t;
  ctx.panels.forEach(p=>{const evs=ctx.ev[p.t];kdeField(evs,u,ctx.buf);
    const oc=p.off.getContext('2d'),img=p.img||(p.img=oc.createImageData(KCW,KCH)),d=img.data;
    for(let q=0;q<ctx.buf.length;q++){const v=Math.pow(clamp(ctx.buf[q]/ctx.kmax,0,1),.72),c=magma(v);d[q*4]=c[0];d[q*4+1]=c[1];d[q*4+2]=c[2];d[q*4+3]=Math.round(255*clamp(v*3,0,1))}
    oc.putImageData(img,0,0);const g=p.cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,p.cv.width,p.cv.height);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(p.off,0,0,p.cv.width,p.cv.height);
    p.rings.textContent='';let cnt=0;
    evs.forEach(e=>{if(e.te<=u){cnt++;const a=(u-e.te)/(TT*.035);if(a<1)S('circle',{cx:e.x*p.s,cy:(68-e.y)*p.s,r:3+a*15,fill:'none',stroke:'#FCFDBF','stroke-width':1.4,opacity:(1-a).toFixed(2)},p.rings)}});
    p.n.textContent=cnt+' / '+evs.length+' kazanım'});
  ctx.scrub.value=Math.round(u/TT*1000);
  ctx.clock.textContent=u<=0.01?'0’':u<=H1?minLabel(u,1):u<H1+GAP?'İY':minLabel(Math.min(H2,u-H1-GAP+45),2)}
function kdeLoop(ctx){const f=ts=>{if(!ctx.playing)return;if(!ctx.last)ctx.last=ts;const dt=Math.min(.1,(ts-ctx.last)/1000);ctx.last=ts;ctx.t=Math.min(TT,ctx.t+dt*TT/16);kdeRender(ctx);if(ctx.t>=TT){ctx.playing=false;ctx.btn.textContent='Yeniden';return}requestAnimationFrame(f)};requestAnimationFrame(f)}
CHARTS.kde={state:{},
mount(ctx){
  const bar=document.createElement('div');bar.className='kbar';
  bar.innerHTML='<button type="button" class="chip kplay">Oynat</button><input class="kscrub" type="range" min="0" max="1000" step="1" value="1000" aria-label="Maç zamanı"><span class="kclock">90’</span>';
  ctx.stage.parentNode.insertBefore(bar,ctx.stage);
  ctx.t=TT;ctx.playing=false;ctx.btn=bar.querySelector('.kplay');ctx.scrub=bar.querySelector('.kscrub');ctx.clock=bar.querySelector('.kclock');
  ctx.btn.addEventListener('click',()=>{if(ctx.playing){ctx.playing=false;ctx.btn.textContent='Oynat';return}if(ctx.t>=TT-1e-6)ctx.t=0;ctx.playing=true;ctx.btn.textContent='Duraklat';ctx.last=0;kdeLoop(ctx)});
  ctx.scrub.addEventListener('input',()=>{ctx.playing=false;ctx.btn.textContent='Oynat';ctx.t=ctx.scrub.value/1000*TT;kdeRender(ctx)});
  /* Reader-initiated playback; no automatic start. */},
draw(ctx){
  const w=ctx.w,wide=w>=760,gap=16,pad=clamp(w*.02,8,20),pw=wide?Math.floor((w-gap-pad*2)/2):w-pad*2,ph=Math.round(pw*68/105);
  ctx.stage.innerHTML='';const wrap=document.createElement('div');wrap.className='kwrap';ctx.stage.appendChild(wrap);
  ctx.ev={};ctx.panels=[];ctx.buf=new Float32Array(KCW*KCH);
  ['GS','FB'].forEach(t=>{
    ctx.ev[t]=D.recov.filter(r=>r.team===t).map(r=>({te:tx(r.min,r.half),x:r.x,y:r.y}));
    const box=document.createElement('div');box.style.cssText='width:'+pw+'px;flex:none';
    const hd=document.createElement('div');hd.className='khd';hd.innerHTML='<span style="color:'+TEAM[t].col+'">'+TEAM[t].name.toUpperCase()+'</span><span class="kn"></span>';box.appendChild(hd);
    const cvw=document.createElement('div');cvw.style.cssText='position:relative;height:'+ph+'px;background:#08060C;border:0';box.appendChild(cvw);
    const dpr=Math.min(2,window.devicePixelRatio||1),cv=document.createElement('canvas');cv.width=Math.round(pw*dpr);cv.height=Math.round(ph*dpr);cv.style.cssText='position:absolute;left:0;top:0;width:'+pw+'px;height:'+ph+'px';cvw.appendChild(cv);
    const svg=S('svg',{viewBox:'0 0 '+pw+' '+ph,width:pw,height:ph,role:'img','aria-label':TEAM[t].name+' top kazanımlarının yoğunluk haritası'},cvw);svg.style.cssText='position:absolute;left:0;top:0';
    pitch(svg,0,0,pw,SLATE);const rings=S('g',{},svg);
    T(svg,6,ph-6,'saldırı yönü →',{'font-size':10.5,style:'fill:#8F9AAA'});
    wrap.appendChild(box);const off=document.createElement('canvas');off.width=KCW;off.height=KCH;
    ctx.panels.push({t:t,cv:cv,off:off,rings:rings,n:hd.querySelector('.kn'),s:pw/105})});
  const fin=new Float32Array(KCW*KCH);ctx.kmax=1e-6;['GS','FB'].forEach(t=>{kdeField(ctx.ev[t],TT+1,fin);for(let q=0;q<fin.length;q++)if(fin[q]>ctx.kmax)ctx.kmax=fin[q]});
  const opp={GS:ctx.ev.GS.filter(e=>e.x>=52.5).length,FB:ctx.ev.FB.filter(e=>e.x>=52.5).length};
  ctx.say('<b>Galatasaray</b>: '+ctx.ev.GS.length+' top kazanımı, <b>'+opp.GS+'</b> tanesi rakip yarı sahada · <b>Fenerbahçe</b>: '+ctx.ev.FB.length+', <b>'+opp.FB+'</b> tanesi rakip yarı sahada. Parlaklık, 8 m çekirdekli yoğunluk tahmini; iki panel ortak ölçekte. Halka, o an gerçekleşen kazanım. Yoğunluk, kayıttaki noktalardan yumuşatılarak üretilir; kayıtta olmayan bir alan bilgisi eklemez.');
  kdeRender(ctx)}};

CHARTS.field={state:{layer:'recov',who:'both',win:'all'},
groups:[{id:'layer',label:'Katman',opts:[['recov','Top kazanımları'],['shots','Şutlar'],['heat','Topla aksiyon yoğunluğu']]},
        {id:'who',label:'Takım',opts:[['both','İki takım'],['GS','Galatasaray'],['FB','Fenerbahçe']]},
        {id:'win',label:'Zaman',opts:Object.keys(WINS).map(k=>[k,WINS[k][0]])}],
draw(ctx){
  const w=ctx.w,st=ctx.state,narrow=w<560,pw=Math.min(w-20,880),x0=(w-pw)/2,s=pw/105,ph=68*s,y0=28,H=y0+ph+52;
  const svg=mkSvg(ctx,H);aria(svg,'Saha: '+st.layer+' katmanı');
  const P=pitch(svg,x0,y0,pw);
  const ok=WINS[st.win][1],teams=st.who==='both'?['GS','FB']:[st.who];
  T(svg,x0,y0-10,'Galatasaray saldırı yönü →',{'font-size':11.5,style:'fill:'+COL.gs});
  T(svg,x0+pw,y0-10,'← Fenerbahçe saldırı yönü',{'font-size':11.5,'text-anchor':'end',style:'fill:'+COL.fb});
  T(svg,x0+pw/2,y0+ph+16,'GÜNEY · Galatasaray’ın sağı = Fenerbahçe’nin solu',{'text-anchor':'middle','font-size':narrow?10:11.5,style:'fill:#F7D98A','letter-spacing':'.04em'});
  if(st.layer==='recov'){
    const R=D.recov;
    const rs=R.filter(r=>teams.includes(r.team)&&ok(r.half,r.min));
    const stat={};
    teams.forEach(t=>{const a=rs.filter(r=>r.team===t),opp=a.filter(r=>t==='GS'?r.gx>=52.5:r.gx<=52.5).length,mean=a.length?a.reduce((q,r)=>q+r.gx,0)/a.length:null;stat[t]={n:a.length,opp:opp,mean:mean};
      if(mean!=null){const [mx]=P.P(mean,0);S('line',{x1:mx,x2:mx,y1:y0,y2:y0+ph,stroke:TEAM[t].col,'stroke-width':1.6,'stroke-dasharray':'6 5',opacity:.9},svg);
        T(svg,mx+(t==='GS'?5:-5),y0+14+(t==='FB'?14:0),'ort. '+fmt(t==='GS'?mean:105-mean,0)+' m',{'font-size':11,'text-anchor':t==='GS'?'start':'end',style:'fill:'+TEAM[t].col+';font-weight:600'})}});
    rs.forEach(r=>{const [cx,cy]=P.P(r.gx,r.gy),g=S('g',{class:'hit',tabindex:0,role:'img','aria-label':lastName(r.player)+' top kazanımı '+minLabel(r.min,r.half)},svg);mark(g,r.team,cx,cy,narrow?4:5.2);S('circle',{cx:cx,cy:cy,r:12,fill:'transparent'},g);
      hover(g,()=>ctx.say('<b>'+lastName(r.player)+'</b> · '+TEAM[r.team].name+' · top kazanımı · '+minLabel(r.min,r.half)+' · kendi kalesinden '+fmt(r.x,0)+' m.'))});
    ctx.say(teams.map(t=>'<b>'+TEAM[t].name+'</b>: '+stat[t].n+' top kazanımı, <b>'+stat[t].opp+'</b> tanesi rakip yarı sahada'+(stat[t].mean!=null?', ortalama kendi kalesinden '+fmt(t==='GS'?stat[t].mean:105-stat[t].mean,1)+' m':'')).join(' · ')+'. <span class="tg">'+WINS[st.win][0]+'</span>');
  }else if(st.layer==='shots'){
    const ss=SHOTS.filter(q=>teams.includes(q.team)&&ok(q.half,q.min));
    ss.forEach(q=>{const [cx,cy]=P.P(q.gx,q.gy),g=S('g',{class:'hit',tabindex:0,role:'img','aria-label':lastName(q.player)+' şut '+q.res},svg),r=narrow?5:6.5;
      if(q.res==='gol')star(g,cx,cy,r*1.7,{fill:COL.gold,stroke:COL.night,'stroke-width':1.2});
      else if(q.res==='isabetli')mark(g,q.team,cx,cy,r);
      else if(q.res==='direk'){S('path',{d:`M${cx} ${cy-r*1.2} L${cx+r*1.2} ${cy} L${cx} ${cy+r*1.2} L${cx-r*1.2} ${cy}Z`,fill:TEAM[q.team].col,stroke:'#FFF3D6','stroke-width':1.2},g)}
      else mark(g,q.team,cx,cy,r,{fill:'rgba(11,13,20,.6)',stroke:TEAM[q.team].col,'stroke-width':1.6});
      S('circle',{cx:cx,cy:cy,r:13,fill:'transparent'},g);
      hover(g,()=>ctx.say('<b>'+lastName(q.player)+'</b> · '+minLabel(q.min,q.half)+' · '+(q.fk?'serbest vuruş · ':'')+q.res+' · kaleye '+fmt(Math.hypot(105-(q.team==='GS'?q.gx:105-q.gx),34-(q.team==='GS'?q.gy:68-q.gy)),0)+' m.'))});
    const c=D.coverage;
    ctx.say(teams.map(t=>'<b>'+TEAM[t].name+'</b>: kayıtta konumlu '+ss.filter(q=>q.team===t).length+' şut').join(' · ')+'. Takım toplamı Galatasaray '+c.GS.team+', Fenerbahçe '+c.FB.team+'; bloke edilen şutların bir kısmının konumu kayıtta yok. Şut başına xG kaynakta yok: işaretlerin büyüklüğü sabit. Yıldız gol, dolu isabetli, boş isabetsiz, eşkenar dörtgen direk.');
  }else{
    const NX=12,NY=8,cw=pw/NX,ch=ph/NY,G={GS:[],FB:[]};
    ['GS','FB'].forEach(t=>{G[t]=Array.from({length:NY},()=>Array(NX).fill(0))});
    let n={GS:0,FB:0},ft={GS:0,FB:0};
    D.acts.forEach(a=>{const t=a[0]?'FB':'GS',h=a[1],m=a[2];if(!ok(h,m))return;const i=Math.min(NX-1,Math.floor(a[3]/105*NX)),j=Math.min(NY-1,Math.floor((68-a[4])/68*NY));G[t][j][i]++;n[t]++;
      if(t==='GS'?a[3]>=70:a[3]<=35)ft[t]++});
    const mx=Math.max(1,...[].concat(...G.GS.map((r,j)=>r.map((v,i)=>st.who==='both'?v+G.FB[j][i]:G[st.who][j][i]))));
    for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const a=G.GS[j][i],b=G.FB[j][i];let fill,op;
      if(st.who==='both'){const tot=a+b;if(!tot)continue;const sh=a/tot;fill=sh>=.5?COL.gs:COL.fb;op=.12+.78*Math.sqrt(tot/mx)*Math.abs(sh-.5)*2}
      else{const v=st.who==='GS'?a:b;if(!v)continue;fill=TEAM[st.who].col;op=.08+.8*Math.sqrt(v/mx)}
      const g=S('g',{class:'hit'},svg);S('rect',{x:x0+i*cw+.5,y:y0+j*ch+.5,width:cw-1,height:ch-1,fill:fill,opacity:op.toFixed(3)},g);
      hover(g,()=>ctx.say('Bu hücrede Galatasaray <b>'+a+'</b>, Fenerbahçe <b>'+b+'</b> topla aksiyon. <span class="tg">'+WINS[st.win][0]+'</span>'))}
    pitch(svg,x0,y0,pw,'rgba(245,184,46,.55)');
    const tot=ft.GS+ft.FB;
    ctx.say('Topla aksiyonların yeri (tekilleştirilmiş: aynı oyuncu ve aynı an tek aksiyon). İki takım seçiliyken hücre rengi o hücrede kimin çoğunlukta olduğunu, koyuluğu fark ve yoğunluğu gösterir. Son üçüncü bölgedeki aksiyonların <b>'+(tot?pct(ft.GS/tot,0):'–')+'</b>’i Galatasaray’ın. <span class="tg">'+WINS[st.win][0]+'</span>');
  }
  // legend
  const ly=H-12;mark(svg,'GS',x0+6,ly-4,5);T(svg,x0+16,ly,'Galatasaray',{'font-size':12});mark(svg,'FB',x0+108,ly-4,5);T(svg,x0+118,ly,'Fenerbahçe',{'font-size':12});
},
onOption(ctx){ctx.redraw()}};

/* ---------- 3. kanallar: derbi vs 8 haftalık ortalama ---------- */
CHARTS.flank={state:{m:'att'},
groups:[{id:'m',label:'Ölçü',opts:[['att','Hücum sayısı'],['shot','Şutla biten hücum']]}],
draw(ctx){
  const w=ctx.w,m=ctx.state.m,narrow=w<560,pw=w-24,ph=Math.min(pw*68/105,470),H=ph+92,x0=12,y0=34;
  const K=m==='att'?['Left flank attacks','Attacks through the center','Right flank attacks']:['Left flank attacks with shots','Attacks through the center with shots','Right flank attacks with shots'];
  const L=D.league,V={GS:K.map(k=>L[k].GS.v),FB:K.map(k=>L[k].FB.v)},A={GS:K.map(k=>L[k].GS.prev_mean),FB:K.map(k=>L[k].FB.prev_mean)};
  const svg=mkSvg(ctx,H);aria(svg,'Galatasaray ve Fenerbahçe kanal hücumları, derbi ve sekiz haftalık ortalama');
  const laneH=ph/3,mx=Math.max(...V.GS,...V.FB,...A.GS,...A.FB),maxL=pw*.46,th=Math.max(10,Math.min(20,laneH*.24));
  S('rect',{x:x0,y:y0+2*laneH,width:pw,height:laneH,fill:'rgba(245,184,46,.10)'},svg);
  const s=pw/105;pitch(svg,x0,y0,pw);
  [1,2].forEach(i=>S('line',{x1:x0,x2:x0+pw,y1:y0+i*laneH,y2:y0+i*laneH,stroke:'rgba(243,235,221,.18)','stroke-dasharray':'3 5'},svg));
  T(svg,x0+pw/2,y0-10,'KUZEY',{'text-anchor':'middle','font-size':10,class:'mut','letter-spacing':'.2em'});
  T(svg,x0+pw/2,y0+ph+18,'GÜNEY · ORTAK KENAR: GS sağ ↔ FB sol',{'text-anchor':'middle','font-size':11.5,style:'fill:#F7D98A','letter-spacing':'.06em'});
  const gsIdx=[0,1,2],fbIdx=[2,1,0],nm=['sol','orta','sağ'];
  const all=K.map(k=>L[k].all.map(r=>r[2]).sort((a,b)=>b-a));
  const mk=(team,i)=>{
    const col=TEAM[team].col,lane=team==='GS'?gsIdx[i]:fbIdx[i],val=V[team][i],avg=A[team][i],len=Math.max(6,val/mx*maxL),y=y0+lane*laneH+laneH*(team==='GS'?.32:.68);
    const east=team==='GS',xa=east?x0+10:x0+pw-10,xb=east?xa+len:xa-len,hd=th*1.1,dir=east?1:-1;
    const g=S('g',{tabindex:0,class:'hit',role:'img','aria-label':TEAM[team].name+' '+nm[i]+' '+val},svg);
    S('path',{d:'M'+xa+' '+(y-th/2)+' L'+(xb-dir*hd)+' '+(y-th/2)+' L'+(xb-dir*hd)+' '+(y-th*.9)+' L'+xb+' '+y+' L'+(xb-dir*hd)+' '+(y+th*.9)+' L'+(xb-dir*hd)+' '+(y+th/2)+' L'+xa+' '+(y+th/2)+'Z',fill:col,opacity:.93,stroke:COL.night,'stroke-width':1},g);
    T(g,east?xa+6:xa-6,y+4,nm[i],{'text-anchor':east?'start':'end','font-size':Math.max(10,th*.6),style:'fill:#0D0B09;font-weight:700'});
    T(g,east?xb+8:xb-8,y+5,fmt(val,0),{'text-anchor':east?'start':'end',class:'dsp',style:'fill:'+col+';font-size:'+(narrow?15:18)+'px'});
    // 8-week average notch
    const ax=xa+dir*Math.max(6,avg/mx*maxL);S('line',{x1:ax,x2:ax,y1:y-th*1.25,y2:y+th*1.25,stroke:'#FFF3D6','stroke-width':2},g);
    if(i===2&&team==='GS')T(g,ax,y-th*1.25-4,'8 hafta ort.',{'text-anchor':'middle','font-size':10,class:'mut'});
    S('rect',{x:Math.min(xa,xb)-4,y:y-th*1.3,width:len+8,height:th*2.6,fill:'transparent'},g);
    hover(g,()=>{const rk=1+all[i].filter(v=>v>val).length;ctx.say('<b>'+TEAM[team].name+' '+nm[i]+'</b>: derbide <b>'+fmt(val,0)+'</b> · önceki 8 maç ortalaması '+fmt(avg,1)+' · sezonun 160 takım-maçı içinde <b>'+rk+'.</b> sırada.')})};
  [0,1,2].forEach(i=>{mk('GS',i);mk('FB',i)});
  T(svg,x0+4,H-8,'Galatasaray saldırı yönü →',{'font-size':12,style:'fill:'+COL.gs});T(svg,x0+pw-4,H-8,'← Fenerbahçe saldırı yönü',{'text-anchor':'end','font-size':12,style:'fill:'+COL.fb});
  ctx.say(m==='att'?'Güney kanalda iki ok yine birbirine bakıyor. Beyaz çentik her kanalın önceki sekiz maç ortalaması. Bir oka dokunun, sezon içindeki sırasını görün.':'Şutla biten hücumlar: Fenerbahçe’nin bütün maçta kanatlardan şuta dönen tek hücumu güney kenardan geldi.');
},
onOption(ctx){ctx.redraw()}};

/* ---------- 4. gol sekansları (kayıt izi; pas oku değil) ---------- */
CHARTS.goals={state:{g:'0'},
groups:[{id:'g',label:'Gol',opts:D.goal_seqs.map((q,i)=>[String(i),(i===2?'2–1 · ':i===1?'2–0 · ':'1–0 · ')+lastName(q.goal.player)+' '+minLabel(q.goal.min,q.goal.half)])}],
mount(ctx){
  const bar=document.createElement('div');bar.className='gbar';
  bar.innerHTML=D.goal_seqs.map((q,i)=>'<button type="button" class="chip" data-g="'+i+'">'+(i===2?'2–1':i===1?'2–0':'1–0')+'</button>').join('')+'<button type="button" class="btn replay">Yeniden oynat</button>';
  ctx.stage.parentNode.insertBefore(bar,ctx.stage);
  bar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.g!=null){ctx.state.g=b.dataset.g;ctx.menu&&ctx.menu.sync()}ctx.play=true;ctx.redraw()});
  ctx.bar=bar;ctx.play=true;
  whenVisible(ctx.fig,()=>{if(!ctx.seen){ctx.seen=true;ctx.play=true;ctx.redraw()}})},
draw(ctx){
  const w=ctx.w,narrow=w<700,pw=Math.min(w-20,880),x0=(w-pw)/2,s=pw/105,ph=68*s,y0=22,H=y0+ph+30;
  const gi=+ctx.state.g,G=D.goal_seqs[gi],seq=G.seq,team=G.goal.team;
  $$('.chip',ctx.bar).forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.g===gi)));
  cancelAnimationFrame(ctx.raf||0);
  const svg=mkSvg(ctx,H);aria(svg,'Gol sekansı '+(gi+1)+': kayıttaki aksiyon konumları sırasıyla');
  const P=pitch(svg,x0,y0,pw);
  T(svg,x0,y0-7,team==='GS'?'Galatasaray saldırı yönü →':'← Fenerbahçe saldırı yönü',{'font-size':11.5,style:'fill:'+TEAM[team].col,'text-anchor':team==='GS'?'start':'start'});
  const trail=S('g',{},svg),dots=S('g',{},svg),labs=S('g',{},svg);
  const pts=seq.map(e=>P.P(e.x,e.y));
  const steps=seq.map((e,i)=>({e:e,p:pts[i],dt:i?Math.max(0,(e.min-seq[i-1].min)*60):0}));
  const gapS=8;
  const ball=S('circle',{r:5.5,fill:'#FFF3D6',stroke:COL.gold,'stroke-width':2,opacity:0},svg);
  const placeLab=(i)=>{const st=steps[i],e=st.e,[cx,cy]=st.p,up=(i%2===0);
    if(e.lab==='GOL')star(dots,cx,cy,12,{fill:COL.gold,stroke:COL.night,'stroke-width':1.4});else mark(dots,e.team,cx,cy,narrow?4.5:5.5);
    const tx_=cx+(cx>x0+pw*.78?-8:8),anchor=cx>x0+pw*.78?'end':'start',ty=clamp(cy+(up?-10:18),y0+12,y0+ph-6);
    const txt=narrow&&e.lab!=='GOL'?String(i+1):(i+1)+' · '+lastName(e.player)+' · '+e.lab;
    const t=T(labs,tx_,ty,txt,{'font-size':narrow?10:11.5,'text-anchor':anchor,style:'fill:'+(e.lab==='GOL'?'#FFF3D6':TEAM[e.team].col)+';font-weight:'+(e.lab==='GOL'?800:600)+';paint-order:stroke;stroke:#0D0B09;stroke-width:3px'});return t};
  const seg=(i)=>{const a=steps[i-1],b=steps[i];if(b.dt>gapS)return null;return S('line',{x1:a.p[0],y1:a.p[1],x2:b.p[0],y2:b.p[1],stroke:COL.gold,'stroke-width':1.6,'stroke-dasharray':'4 4',opacity:.85},trail)};
  const list=steps.map((st,i)=>(i&&st.dt>gapS?'<li class="gap">… kayıtta '+fmt(st.dt,0)+' sn boşluk …</li>':'')+'<li><b>'+(i+1)+'</b> · '+minLabel(st.e.min,st.e.half)+' '+lastName(st.e.player)+' <span style="color:'+TEAM[st.e.team].col+'">●</span> '+st.e.lab+'</li>').join('');
  const span=((seq[seq.length-1].min-seq[0].min)*60);
  const summary=['Kurulu hücum: Osimhen topu son üçüncü bölgenin girişinde Barış Alper’e verdi, Barış Alper’in pası (kayıtta asist) üç saniye sonra Osimhen’i ceza sahasında buldu. Öncesinde kayıtta bir boşluk var: atak, kesintiden sonra yeniden kuruldu.',
    'Duran top (taç): Brown’un uzaklaştırmasından sonra Jakobs uzun taçla topu ceza sahasına gönderdi. İlk hava topunu Fenerbahçe kazandı (takım kaydı), top ceza sahası yayına düştü; Sánchez’in oradan geri çevirdiği top (kayıtta asist) Osimhen’i kale önünde buldu.',
    'Kontra: Yunus Akgün sağ çizgide topu kontrol edemedi, Brown aynı çizgide kazandı; Guendouzi ve Kanté ileri taşıdı, Kerem sol taraftan ceza sahasına gönderdi, Oğuz Aydın’ın pasından (asist) İrfan Can vurdu. Kazanımdan gole '+fmt((seq[seq.length-1].min-seq[1].min)*60,0)+' saniye.'][gi];
  ctx.say(summary+'<ol class="seq">'+list+'</ol><span class="note">Çizgi, topun kayıttaki konumlarını sırayla birleştirir; pas oku değildir (pası alan oyuncu kayıtta yok).</span>');
  if(REDUCED||!ctx.play||!ctx.seen){steps.forEach((st,i)=>{placeLab(i)});return}
  ctx.play=false;
  // timeline: real seconds compressed; long gaps squeezed to 0.9 s
  const dur=steps.map((st,i)=>i?(st.dt>gapS?900:clamp(st.dt*620,380,1500)):0);let total=0;const at=dur.map(d=>total+=d);
  let started=null,shown=-1;
  const tick=now=>{if(started==null)started=now;const el=now-started;
    while(shown+1<steps.length&&el>=at[shown+1]){shown++;placeLab(shown)}
    const i=Math.min(steps.length-1,shown+1),a=steps[Math.max(0,shown)].p,b=steps[i].p,k=i>shown?clamp((el-(at[i]-dur[i]))/Math.max(1,dur[i]),0,1):1;
    ball.setAttribute('cx',a[0]+(b[0]-a[0])*k);ball.setAttribute('cy',a[1]+(b[1]-a[1])*k);ball.setAttribute('opacity',1);
    if(shown<steps.length-1)ctx.raf=requestAnimationFrame(tick);else ball.setAttribute('opacity',0)};
  ctx.raf=requestAnimationFrame(tick)},
onOption(ctx){ctx.play=true;ctx.redraw()}};

/* ---------- 5. sezonun neresinde (160 takım-maçı) ---------- */
const BEE=[["Ball recoveries in opponent's half"],['Shots'],['xG (expected goals)'],["Entries to the opponent's box"],["Actions in opponent's box"],['Progressive passes accurate'],['Passes accurate'],['High pressing'],['PPDA'],['Average distance to the goal at ball recoveries'],['Right flank attacks']];
CHARTS.bee={state:{k:"Ball recoveries in opponent's half"},
groups:[{id:'k',label:'Ölçü',opts:BEE.map(b=>[b[0],D.league[b[0]].tr])}],
draw(ctx){
  const w=ctx.w,narrow=w<560,k=ctx.state.k,E=D.league[k],L=14,R=14,H=narrow?300:330,Tp=50,B=46,pw=w-L-R,mid=Tp+(H-Tp-B)/2;
  const svg=mkSvg(ctx,H);aria(svg,'Sezonun 160 takım-maçı içinde derbi değerleri: '+E.tr);
  const vals=E.all.map(r=>r[2]),lo=Math.min(...vals),hi=Math.max(...vals),pad=(hi-lo)*.04||1,sx=v=>L+(v-lo+pad)/(hi-lo+2*pad)*pw;
  const isPct=/%/.test(k),f=v=>isPct?pct(v,0):fmt(v,Number.isInteger(v)?0:2);
  // ticks
  const nt=narrow?4:6;for(let i=0;i<=nt;i++){const v=lo+(hi-lo)*i/nt,x=sx(v);S('line',{x1:x,x2:x,y1:Tp-6,y2:H-B+6,class:'grid'},svg);T(svg,x,H-B+22,f(isPct?v:Math.round(v*100)/100),{'text-anchor':'middle','font-size':11,class:'mut'})}
  T(svg,L,Tp-30,E.tr+(E.dir<0?' · düşük değer sol tarafta (bu ölçüde düşük = '+(k==='PPDA'?'yoğun baskı':'rakip kaleye yakın kazanım')+')':''),{'font-size':12,class:'ttl'});
  // beeswarm placement
  const r=narrow?3.4:4.2,rows=E.all.map(q=>({team:q[0],date:q[1],v:q[2],x:sx(q[2])})).sort((a,b)=>a.x-b.x),placed=[];
  rows.forEach(p=>{let dy=0,sgn=1,n=0;while(placed.some(q=>Math.abs(q.x-p.x)<2*r+.6&&Math.abs(q.y-(mid+dy))<2*r+.6)){n++;dy=Math.ceil(n/2)*(2*r+.7)*(n%2?1:-1)}p.y=mid+dy;placed.push(p)});
  const derby=p=>p.date==='26.10.26'&&(p.team==='GAL'||p.team==='FEN');
  rows.forEach(p=>{if(derby(p))return;const own=p.team==='GAL'?'GS':p.team==='FEN'?'FB':null;
    if(own)mark(svg,own,p.x,p.y,r*.95,{fill:'none',stroke:TEAM[own].col,'stroke-width':1.5});else S('circle',{cx:p.x,cy:p.y,r:r*.85,fill:'rgba(233,224,206,.30)'},svg)});
  ['GS','FB'].forEach(t=>{const p=rows.find(q=>derby(q)&&q.team===TEAM[t].code);if(!p)return;const g=S('g',{class:'hit',tabindex:0,role:'img','aria-label':TEAM[t].name+' derbi '+f(p.v)},svg);
    S('line',{x1:p.x,x2:p.x,y1:p.y,y2:t==='GS'?Tp-8:H-B+4,stroke:TEAM[t].col,'stroke-width':1.2},g);mark(g,t,p.x,p.y,r*2,{});
    const anchor=p.x<L+pw*.2?'start':p.x>L+pw*.8?'end':'middle';
    T(g,p.x,t==='GS'?Tp-12:H-B+18+(narrow?0:0),TEAM[t].name+' derbide '+f(p.v),{'text-anchor':anchor,'font-size':12,style:'fill:'+TEAM[t].col+';font-weight:700;paint-order:stroke;stroke:#0D0B09;stroke-width:3px',dy:t==='FB'?16:0})});
  const n=vals.length,rk=(v,desc)=>1+vals.filter(x=>desc?x>v:x<v).length;
  const say=t=>{const e=E[t],hiR=rk(e.v,true),loR=rk(e.v,false),pos=hiR<=loR?'en yüksek '+hiR+'.':'en düşük '+loR+'.';return '<b>'+TEAM[t].name+'</b> derbide '+f(e.v)+' (önceki 8 maç ortalaması '+f(e.prev_mean)+', aralık '+f(e.prev_min)+'–'+f(e.prev_max)+') · sezonun '+n+' takım-maçı içinde <b>'+pos+'</b>'};
  ctx.say(say('FB')+'<br>'+say('GS')+'<br><span class="note">Gri nokta ligdeki bir takım-maçı; boş daire ve kareler iki takımın önceki maçları.</span>');
},
onOption(ctx){ctx.redraw()}};

/* ---------- 6. evreler: kırılma nerede? ---------- */
CHARTS.phases={state:{m:'ft'},
groups:[{id:'m',label:'Ölçü (10 dakikaya oranlı)',opts:[['ft','Son üçüncü bölgede topla aksiyon'],['box','Rakip ceza sahasında topla aksiyon'],['pa','İsabetli pas'],['shots','Şut (sayı)']]}],
draw(ctx){
  const w=ctx.w,narrow=w<620,m=ctx.state.m,L=narrow?30:40,R=8,Tp=30,B=narrow?40:64,H=clamp(w*.46,300,400),pw=w-L-R,ph=H-Tp-B,mid=Tp+ph/2;
  const svg=mkSvg(ctx,H);aria(svg,'Yedi evrede iki takımın üretimi');
  const PHS=D.phases.filter(p=>p.span>0),tot=PHS.reduce((a,p)=>a+p.span,0),gap=4,uw=(pw-gap*(PHS.length-1))/tot;
  const val=(p,t)=>m==='shots'?p[t].shots:p[t][m]/p.span*10;
  const mx=Math.max(...PHS.map(p=>Math.max(val(p,'GS'),val(p,'FB'))))||1,amp=ph/2-12;
  S('line',{x1:L,x2:L+pw,y1:mid,y2:mid,class:'ax'},svg);
  let x=L;
  PHS.forEach((p,i)=>{const cw=p.span*uw,g=S('g',{class:'hit',tabindex:0,role:'img','aria-label':p.name},svg);
    const a=val(p,'GS'),b=val(p,'FB');
    S('rect',{x:x,y:Tp,width:cw,height:ph,fill:i%2?'rgba(243,235,221,.025)':'rgba(243,235,221,.05)'},g);
    S('rect',{x:x+cw*.14,y:mid-a/mx*amp,width:cw*.72,height:a/mx*amp,fill:COL.gs,opacity:.95},g);
    S('rect',{x:x+cw*.14,y:mid,width:cw*.72,height:b/mx*amp,fill:COL.fb,opacity:.95},g);
    if(cw>26){T(g,x+cw/2,mid-a/mx*amp-5,m==='shots'?a:fmt(a,0),{'text-anchor':'middle','font-size':11,style:'fill:'+COL.gs+';font-weight:700'});T(g,x+cw/2,mid+b/mx*amp+14,m==='shots'?b:fmt(b,0),{'text-anchor':'middle','font-size':11,style:'fill:'+COL.fb+';font-weight:700'})}
    T(g,x+cw/2,Tp+ph+14,String(i+1),{'text-anchor':'middle','font-size':12,class:'ttl'});
    if(!narrow&&cw>70){const words=p.name.split(' ');const l1=words.slice(0,Math.ceil(words.length/2)).join(' '),l2=words.slice(Math.ceil(words.length/2)).join(' ');T(g,x+cw/2,Tp+ph+30,l1,{'text-anchor':'middle','font-size':10.5,class:'mut'});T(g,x+cw/2,Tp+ph+43,l2,{'text-anchor':'middle','font-size':10.5,class:'mut'})}
    hover(g,()=>ctx.say('<b>'+(i+1)+'. '+p.name+'</b> ('+fmt(p.span,1)+' dk): Galatasaray '+p.GS.ft+' son üçüncü bölge, '+p.GS.box+' ceza sahası aksiyonu, '+p.GS.shots+' şut · Fenerbahçe '+p.FB.ft+' / '+p.FB.box+' / '+p.FB.shots+'.'+(p.span<8?' <b>Kısa evre: küçük örnek.</b>':'')));
    if(i===4){S('line',{x1:x-gap/2,x2:x-gap/2,y1:Tp-8,y2:Tp+ph,stroke:COL.fb,'stroke-width':1.4,'stroke-dasharray':'3 3'},svg);T(svg,x-gap/2+4,Tp-10,'FB çift değişiklik',{'font-size':10.5,style:'fill:'+COL.fb})}
    if(i===3){S('line',{x1:x-gap/2,x2:x-gap/2,y1:Tp-8,y2:Tp+ph,stroke:'#FFF3D6','stroke-width':1.2,'stroke-dasharray':'3 3'},svg);T(svg,x-gap/2-4,Tp-10,'devre arası',{'font-size':10.5,'text-anchor':'end',class:'mut'})}
    x+=cw+gap});
  T(svg,4,Tp+10,'GS',{'font-size':11,style:'fill:'+COL.gs+';font-weight:700'});T(svg,4,Tp+ph-2,'FB',{'font-size':11,style:'fill:'+COL.fb+';font-weight:700'});
  const p4=PHS[3],p5=PHS[4];
  ctx.say('Sütun genişliği evrenin süresi. Fenerbahçe’nin en güçlü evresi <b>4. evre</b> (ikinci yarının ilk on dakikası): son üçüncü bölge aksiyonunda Galatasaray’ı geçti (ham sayı '+p4.FB.ft+'–'+p4.GS.ft+'). Bu, çift değişiklikten <b>önce</b>. Değişiklik sonrası 5. evrede oran yeniden Galatasaray’a döndü ('+p5.GS.ft+'–'+p5.FB.ft+'). Evrelere dokunun.');
},
onOption(ctx){ctx.redraw()}};

/* ---------- 7. xG kimden geldi ---------- */
CHARTS.xg={state:{},
draw(ctx){
  const w=ctx.w,narrow=w<560,rows=['GS','FB'].map(t=>D.players.filter(p=>p.team===t&&(p.xg>0||p.shots>0)).sort((a,b)=>b.xg-a.xg));
  const lh=narrow?26:28,gapH=34,H=30+rows[0].length*lh+gapH+rows[1].length*lh+20,nameW=narrow?92:128,L=nameW+10,R=narrow?70:110,pw=w-L-R;
  const svg=mkSvg(ctx,H);aria(svg,'Oyuncu xG katkıları');
  const mx=Math.max(...D.players.map(p=>p.xg)),sx=v=>v/mx*pw;let y=24;
  ['GS','FB'].forEach((t,ti)=>{const tot=rows[ti].reduce((a,p)=>a+p.xg,0);
    T(svg,0,y,TEAM[t].name.toUpperCase()+' · xG '+fmt(tot,2),{'font-size':12,class:'dsp',style:'fill:'+TEAM[t].col+';font-size:15px'});y+=10;
    rows[ti].forEach(p=>{y+=lh;const g=S('g',{class:'hit',tabindex:0,role:'img','aria-label':p.player+' xG '+p.xg},svg);
      T(g,nameW,y-lh*.32,lastName(p.player),{'text-anchor':'end','font-size':narrow?11.5:12.5});
      S('rect',{x:L,y:y-lh*.62,width:Math.max(1.5,sx(p.xg)),height:lh*.46,fill:TEAM[t].col,opacity:.92},g);
      let cx=L+sx(p.xg)+8;T(g,cx,y-lh*.3,fmt(p.xg,2),{'font-size':12,style:'font-weight:700;fill:#FFF3D6'});cx+=34;
      for(let i=0;i<p.shots;i++){const isG=i<p.goals,ox=cx+i*(narrow?8:10);if(isG)star(g,ox,y-lh*.38,5.2,{fill:COL.gold,stroke:COL.night});else mark(g,t,ox,y-lh*.38,2.8,{fill:'none',stroke:TEAM[t].col,'stroke-width':1.2})}
      S('rect',{x:0,y:y-lh*.8,width:w,height:lh,fill:'transparent'},g);
      hover(g,()=>ctx.say('<b>'+p.player+'</b> ('+p.pos+', '+p.min+' dk): '+p.shots+' şut, '+p.sot+' isabetli, <b>'+fmt(p.xg,2)+' xG</b> ('+pct(p.xg/tot,0)+' takım payı)'+(p.goals?', '+p.goals+' gol':'')+(p.assists?', '+p.assists+' asist':'')+'. Oyuncu toplamı; şut başına xG kaynakta yok.'))});
    y+=gapH-10});
  const os=D.players.find(p=>p.player==='Victor Osimhen'),gt=rows[0].reduce((a,p)=>a+p.xg,0);
  ctx.say('Galatasaray’ın xG’sinin <b>'+pct(1-os.xg/gt,0)+'</b>’i Osimhen dışındaki oyunculardan geldi. Çubuk xG, sağdaki işaretler şutlar (yıldız gol). Fenerbahçe’de oyuncu tablosu Lukaku’ya iki şut yazıyor, takım toplamı dört şut; aradaki fark kaynakta.');
}};

/* ---------- 8. model ne bildi ---------- */
CHARTS.model={state:{sc:'blend'},
groups:[{id:'sc',label:'Maç önü senaryosu',opts:D.model.map(s=>[s.id,s.name])}],
draw(ctx){
  const w=ctx.w,sc=D.model.find(s=>s.id===ctx.state.sc),wide=w>=760,narrow=w<480;
  const mw=wide?Math.min(430,w*.46):w-8,cs=(mw-50)/7,mh=cs*7+76,rx=wide?mw+30:8,rw=wide?w-rx-8:w-16,rh=262,H=wide?Math.max(mh,rh)+10:mh+rh+20;
  const svg=mkSvg(ctx,H);aria(svg,'Maç önü skor matrisi ve sonuç olasılıkları');
  const M=sc.matrix,mxp=Math.max(...M.flat()),ox=44,oy=40;
  T(svg,ox+cs*3.5,16,'Fenerbahçe golü →',{'text-anchor':'middle','font-size':11.5,style:'fill:'+COL.fb});
  T(svg,14,oy+cs*3.5,'Galatasaray golü →',{'text-anchor':'middle','font-size':11.5,style:'fill:'+COL.gs,transform:'rotate(90 14 '+(oy+cs*3.5)+')'});
  for(let j=0;j<7;j++)T(svg,ox+j*cs+cs/2,oy-6,j,{'text-anchor':'middle','font-size':11,class:'mut'});
  for(let i=0;i<7;i++){T(svg,ox-8,oy+i*cs+cs/2+4,i,{'text-anchor':'end','font-size':11,class:'mut'});
    for(let j=0;j<7;j++){const p=M[i][j],col=i>j?COL.gs:i===j?'#CFC7B4':COL.fb,g=S('g',{class:'hit',tabindex:0,role:'img','aria-label':i+'-'+j+' '+pct(p,1)},svg);
      S('rect',{x:ox+j*cs+1,y:oy+i*cs+1,width:cs-2,height:cs-2,fill:col,opacity:(.06+.9*Math.sqrt(p/mxp)).toFixed(3)},g);
      if(cs>34&&p>=.005)T(g,ox+j*cs+cs/2,oy+i*cs+cs/2+4,fmt(p*100,p>=.1?0:1),{'text-anchor':'middle','font-size':cs>48?11.5:10,style:'fill:#0D0B09;font-weight:700'});
      hover(g,()=>ctx.say('<b>'+i+'–'+j+'</b> skoru için '+sc.name.toLowerCase()+' olasılığı <b>'+pct(p,1)+'</b>.'+(i===2&&j===1?' Gerçekleşen skor.':'')))}}
  S('rect',{x:ox+cs+.5,y:oy+2*cs+.5,width:cs-1,height:cs-1,fill:'none',stroke:'#FFF3D6','stroke-width':2.6},svg);
  S('rect',{x:ox,y:oy+7*cs+12,width:12,height:12,fill:'none',stroke:'#FFF3D6','stroke-width':2.2},svg);T(svg,ox+18,oy+7*cs+22,narrow?'gerçekleşen skor (2–1)':'gerçekleşen skor (2–1) · hücre: o skorun olasılığı, %',{'font-size':11});
  // right side: outcome bars + λ vs xG
  const by=wide?oy:mh+16;let y=by;
  const bar=(lab,h,d,a,yy)=>{T(svg,rx,yy,lab,{'font-size':11.5,class:'ttl'});const bw=rw,yb=yy+8;[[h,COL.gs,'GS'],[d,'#CFC7B4','B'],[a,COL.fb,'FB']].reduce((x,q)=>{const ww=q[0]*bw;S('rect',{x:x,y:yb,width:Math.max(0,ww-1),height:26,fill:q[1]},svg);if(ww>44)T(svg,x+ww/2,yb+17,pct(q[0],0),{'text-anchor':'middle','font-size':12,style:'fill:#0D0B09;font-weight:700'});return x+ww},rx)};
  bar('Maç önü: '+sc.name,sc.h,sc.d,sc.a,y);y+=56;
  bar('Maç sonu: gerçekleşen xG ile (Poisson)',D.xg_res.h,D.xg_res.d,D.xg_res.a,y);y+=66;
  T(svg,rx,y,'Beklenen gol (λ) → gerçekleşen xG',{'font-size':11.5,class:'ttl'});y+=14;
  const mxv=3.2,lx=v=>rx+v/mxv*rw;
  [0,1,2,3].forEach(v=>{S('line',{x1:lx(v),x2:lx(v),y1:y,y2:y+70,class:'grid'},svg);T(svg,lx(v),y+84,v,{'text-anchor':'middle','font-size':10.5,class:'mut'})});
  [['GS',sc.lamH,D.team.GS['xG (expected goals)']],['FB',sc.lamA,D.team.FB['xG (expected goals)']]].forEach((q,i)=>{const yy=y+24+i*34,a=lx(q[1]),b=lx(q[2]);
    S('line',{x1:a,x2:b,y1:yy,y2:yy,stroke:TEAM[q[0]].col,'stroke-width':2.4},svg);S('circle',{cx:a,cy:yy,r:5,fill:'none',stroke:TEAM[q[0]].col,'stroke-width':2},svg);mark(svg,q[0],b,yy,5.5);
    T(svg,rx,yy-9,TEAM[q[0]].name+' · λ '+fmt(q[1],2)+' → xG '+fmt(q[2],2),{'font-size':11.5,style:'fill:'+TEAM[q[0]].col+';font-weight:700'})});
  T(svg,rx,y+108,narrow?'○ maç önü λ · dolu: maçtaki xG':'○ maç önü beklenen gol (λ) · dolu işaret: maçta gerçekleşen xG',{'font-size':10.5,class:'mut'});
  ctx.say('<b>'+sc.name+'</b>: Galatasaray galibiyeti '+pct(sc.h,0)+', beraberlik '+pct(sc.d,0)+', Fenerbahçe galibiyeti '+pct(sc.a,0)+'. 2–1 bu senaryoda en olası '+sc.rank21+'. skor ('+pct(sc.p21,1)+'). Asıl sapma Fenerbahçe’nin üretiminde: maç önü beklenti '+fmt(sc.lamA,2)+' gol, gerçekleşen xG '+fmt(D.team.FB['xG (expected goals)'],2)+'. Tek maç bir modeli doğrulamaz ya da çürütmez.');
}};

/* ---------- 9. pas akışı (VEKİL; Edd Webster yöntemi uyarlaması) ---------- */
function buildField(vecs,sig){
  const NX=29,NY=19,dx=105/(NX-1),dy=68/(NY-1),U=new Float32Array(NX*NY),V=new Float32Array(NX*NY),Wt=new Float32Array(NX*NY),s2=2*sig*sig;
  for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const cx=i*dx,cy=j*dy;let su=0,sv=0,sw=0;
    for(let k=0;k<vecs.length;k++){const v=vecs[k],ddx=v[0]-cx,ddy=v[1]-cy,d2=ddx*ddx+ddy*ddy;if(d2>(3.2*sig)*(3.2*sig))continue;const w=Math.exp(-d2/s2);su+=w*v[2];sv+=w*v[3];sw+=w}
    const o=j*NX+i;Wt[o]=sw;if(sw>1e-6){U[o]=su/sw;V[o]=sv/sw}}
  return{NX:NX,NY:NY,dx:dx,dy:dy,U:U,V:V,W:Wt}}
function sampleField(f,x,y){const gx=x/f.dx,gy=y/f.dy,i=Math.floor(gx),j=Math.floor(gy);if(i<0||j<0||i>=f.NX-1||j>=f.NY-1)return null;
  const tx_=gx-i,ty=gy-j,o=j*f.NX+i,w=[f.W[o],f.W[o+1],f.W[o+f.NX],f.W[o+f.NX+1]];if(Math.min.apply(null,w)<1.4)return null;
  const bl=A=>A[o]*(1-tx_)*(1-ty)+A[o+1]*tx_*(1-ty)+A[o+f.NX]*(1-tx_)*ty+A[o+f.NX+1]*tx_*ty;return[bl(f.U),bl(f.V)]}
function streamlines(f,rev){
  const lines=[],occ=new Uint8Array(36*24),cs=3,sgn=rev?-1:1,cell=(x,y)=>Math.floor(y/cs)*36+Math.floor(x/cs);
  const trace=(x,y,dir)=>{const pts=[],ds=.7;for(let n=0;n<90;n++){const v=sampleField(f,x,y);if(!v)break;const sp=Math.hypot(v[0],v[1]);if(sp<.5)break;
      const hx=x+dir*sgn*v[0]/sp*ds*.5,hy=y+dir*sgn*v[1]/sp*ds*.5,v2=sampleField(f,hx,hy);if(!v2)break;const sp2=Math.hypot(v2[0],v2[1]);if(sp2<.5)break;
      x+=dir*sgn*v2[0]/sp2*ds;y+=dir*sgn*v2[1]/sp2*ds;if(x<0||y<0||x>105||y>68)break;const c=cell(x,y);if(occ[c]>2&&n>3)break;occ[c]++;pts.push([x,y,Math.hypot(v2[0],v2[1])])}return pts};
  const seeds=[];for(let y=2.5;y<68;y+=4.6)for(let x=2.5;x<105;x+=4.6)seeds.push([x+((x*7+y*3)%2.3)-1.1,y+((x*5+y*11)%2.3)-1.1]);
  let ph=.37;seeds.forEach(s=>{if(occ[cell(s[0],s[1])]>0)return;const a=trace(s[0],s[1],-1).reverse(),b=trace(s[0],s[1],1),pts=a.concat([[s[0],s[1],0]]).concat(b);
    if(pts.length<12)return;let L=0;const cum=[0];for(let i=1;i<pts.length;i++){L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);cum.push(L)}
    if(L<9)return;ph=(ph*9.13+.271)%1;lines.push({pts:pts,cum:cum,L:L,ph:ph})});
  return lines}
function interp(l,a,i){while(i<l.cum.length-2&&l.cum[i+1]<a)i++;const d=l.cum[i+1]-l.cum[i]||1,t=clamp((a-l.cum[i])/d,0,1);return[l.pts[i][0]+(l.pts[i+1][0]-l.pts[i][0])*t,l.pts[i][1]+(l.pts[i+1][1]-l.pts[i][1])*t]}
CHARTS.flow={state:{dir:'norm'},
groups:[{id:'dir',label:'Akış yönü',opts:[['norm','Normal: topun gittiği yer'],['rev','Ters: topun geldiği yer']]}],
mount(ctx){const bl=document.createElement('div');bl.className='brandline';
  bl.innerHTML='<span><b>SPORTSBASE</b> · Pass-Flow uyarlaması · akış çizgileri, 6,5 m çekirdekli ortalama yer değiştirme alanından</span><span>Created by Edd Webster</span>';
  ctx.stage.parentNode.appendChild(bl);ctx.items=[]},
draw(ctx){
  const w=ctx.w,wide=w>=780,pwid=wide?Math.floor((w-14)/2):w,ph=Math.round((pwid-16)*68/105),ch=ph+62;
  ctx.stage.innerHTML='';ctx.items=[];
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-wrap:wrap;gap:14px;width:100%';ctx.stage.appendChild(wrap);
  ['GS','FB'].forEach(t=>{const ev=D.flow[t],cv=document.createElement('canvas');cv.style.cssText='width:'+pwid+'px;height:'+ch+'px;flex:none';wrap.appendChild(cv);
    const dpr=Math.min(2,window.devicePixelRatio||1);cv.width=pwid*dpr;cv.height=ch*dpr;cv.setAttribute('role','img');cv.setAttribute('aria-label',TEAM[t].name+' pas akışı, kendi saldırı yönünde');
    const lines=streamlines(buildField(ev.vec,6.5),ctx.state.dir==='rev');let sp=[];lines.forEach(l=>l.pts.forEach(p=>sp.push(p[2])));sp.sort((a,b)=>a-b);
    ctx.items.push({cv:cv,dpr:dpr,W:pwid,H:ch,ph:ph,lines:lines,s95:sp[Math.floor(sp.length*.95)]||5,col:TEAM[t].col,name:TEAM[t].name,ev:ev})});
  const a=D.flow.GS,b=D.flow.FB;
  ctx.say('<b>Galatasaray</b>: '+a.nVec+' hareket, hareket başına ortalama ileri yer değiştirme <b>+'+fmt(a.meanDx,2)+' m</b> · <b>Fenerbahçe</b>: '+b.nVec+' hareket, <b>+'+fmt(b.meanDx,2)+' m</b>. Fenerbahçe’nin hareketleri daha az ama daha dikey: kısa dizilerle doğrudan ileri. İki saha da takımın kendi saldırı yönünde (soldan sağa), sağ kanat altta. Kayıtta pasın bitiş noktası yok; aynı takımın ardışık hareketleri (en çok 10 sn arayla, arada rakip olayı yok) kullanıldı.');
  startFlow(ctx)},
onOption(ctx){ctx.redraw()}};
let FLOWCTX=null,FLOWRAF=0,FLOWVIS=false;
function startFlow(ctx){FLOWCTX=ctx;if(!ctx.hooked){ctx.hooked=true;whenVisible(ctx.fig,()=>{FLOWVIS=true;loopFlow()},()=>{FLOWVIS=false})}drawFlowFrame(ctx,1000);if(FLOWVIS&&!REDUCED)loopFlow()}
function loopFlow(){if(FLOWRAF||REDUCED)return;const f=t=>{FLOWRAF=0;if(!FLOWVIS||!FLOWCTX)return;drawFlowFrame(FLOWCTX,t);FLOWRAF=requestAnimationFrame(f)};FLOWRAF=requestAnimationFrame(f)}
function drawFlowFrame(ctx,tms){
  const t=tms/1000;
  ctx.items.forEach(it=>{const g=it.cv.getContext('2d');g.setTransform(it.dpr,0,0,it.dpr,0,0);g.clearRect(0,0,it.W,it.H);
    const x0=8,y0=30,pw=it.W-16,ph=it.ph,s=pw/105;
    g.font='800 21px "Barlow Condensed",sans-serif';g.textBaseline='alphabetic';g.fillStyle=it.col;g.fillText(it.name.toUpperCase(),x0,22);
    g.font='600 10px Inter,sans-serif';g.fillStyle='#F7D98A';g.textAlign='right';g.fillText('SPORTSBASE',x0+pw,20);g.textAlign='left';
    g.strokeStyle='rgba(245,184,46,.38)';g.lineWidth=1;g.strokeRect(x0,y0,pw,ph);g.beginPath();g.moveTo(x0+pw/2,y0);g.lineTo(x0+pw/2,y0+ph);g.stroke();
    g.beginPath();g.arc(x0+pw/2,y0+ph/2,9.15*s,0,7);g.stroke();
    [0,1].forEach(sd=>{const bx=sd?x0+pw:x0;g.strokeRect(sd?bx-16.5*s:bx,y0+ph/2-20.16*s,16.5*s,40.32*s);g.strokeRect(sd?bx-5.5*s:bx,y0+ph/2-9.16*s,5.5*s,18.32*s)});
    const P=(x,y)=>[x0+x*s,y0+y*s];
    it.lines.forEach(l=>{g.strokeStyle=it.col;g.globalAlpha=.20;g.lineWidth=1.1;g.beginPath();l.pts.forEach((p,i)=>{const q=P(p[0],p[1]);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])});g.stroke();
      const dash=Math.min(9,l.L*.5),gap=l.L+dash,pos=REDUCED?(l.ph*gap):((t*7.5+l.ph*gap)%gap),seg=10;
      for(let k=0;k<seg;k++){const a0=pos-dash+dash*k/seg,a1=pos-dash+dash*(k+1)/seg;if(a1<0||a0>l.L)continue;const A=Math.max(0,a0),B=Math.min(l.L,a1);if(B<=A)continue;
        let i0=0;while(i0<l.cum.length-2&&l.cum[i0+1]<A)i0++;g.beginPath();let q=interp(l,A,i0);g.moveTo.apply(g,P(q[0],q[1]));
        let i=i0+1;while(i<l.cum.length&&l.cum[i]<B){const pp=P(l.pts[i][0],l.pts[i][1]);g.lineTo(pp[0],pp[1]);i++}q=interp(l,B,Math.max(0,i-1));g.lineTo.apply(g,P(q[0],q[1]));
        const mid=(A+B)/2,sp=l.pts[Math.min(l.pts.length-1,Math.round(mid/l.L*(l.pts.length-1)))][2];
        g.globalAlpha=.15+.85*(k+1)/seg;g.lineWidth=1.2+Math.min(1,sp/it.s95)*2.4;g.strokeStyle=k>seg-3?'#FFF3D6':it.col;g.lineCap='round';g.stroke()}});
    g.globalAlpha=1;g.font='500 10.5px Inter,sans-serif';g.fillStyle='rgba(233,224,206,.75)';g.fillText('saldırı yönü →  ·  sağ kanat altta',x0,y0+ph+16);
    g.textAlign='right';g.fillText('n = '+it.ev.nVec+' hareket',x0+pw,y0+ph+16);g.textAlign='left'})}

/* ===== boot ===== */
function boot(){
  const figures=$$('figure.plate[data-chart]');
  const mountOnce=fig=>{if(fig.dataset.hpaMounted)return;fig.dataset.hpaMounted='true';mountPlate(fig);document.dispatchEvent(new CustomEvent('hpa:chart-mounted',{detail:{chart:fig.dataset.chart}}));};
  if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){mountOnce(e.target);io.unobserve(e.target)}},{rootMargin:'500px 0px'});figures.forEach(fig=>io.observe(fig));}
  else figures.forEach(mountOnce);
  window.addEventListener('beforeprint',()=>figures.forEach(mountOnce));
  initScrolly();alignZones();
  // glance panel from data (numbers stay out of the prose)
  const g=D.team,set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
  set('gl-xg',fmt(g.GS['xG (expected goals)'],2)+' – '+fmt(g.FB['xG (expected goals)'],2));
  set('gl-sh',g.GS.Shots+' – '+g.FB.Shots);set('gl-sot',g.GS['Shots on target']+' – '+g.FB['Shots on target']);
  set('gl-pos',pct(g.GS['Ball possession, %'],0)+' – '+pct(g.FB['Ball possession, %'],0));
  set('gl-box',g.GS["Actions in opponent's box"]+' – '+g.FB["Actions in opponent's box"]);
  set('gl-ppda',fmt(g.GS.PPDA,2)+' – '+fmt(g.FB.PPDA,2));
  set('gl-rec',g.GS["Ball recoveries in opponent's half"]+' – '+g.FB["Ball recoveries in opponent's half"]);
  const b=D.model.find(s=>s.id==='blend');set('gl-model','%'+fmt(b.h*100,0)+' / %'+fmt(b.d*100,0)+' / %'+fmt(b.a*100,0));
  $$('a[href^="#s"]').forEach(a=>a.addEventListener('click',e=>{const t=document.getElementById(a.getAttribute('href').slice(1));if(t){e.preventDefault();t.scrollIntoView({behavior:REDUCED?'auto':'smooth',block:'start'})}}));
  // reading progress on the contents rail
  const secs=$$('section.sec[id]'),links=$$('.rail.l a');
  if('IntersectionObserver' in window&&links.length){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(l=>l.setAttribute('aria-current',String(l.getAttribute('href')==='#'+e.target.id)))}),{rootMargin:'-20% 0px -70% 0px'});secs.forEach(s=>io.observe(s))}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

;(()=>{const pause=()=>{for(const c of Object.values(CTX)){if(c.playing){c.playing=false;if(c.btn){c.btn.textContent='Oynat';c.btn.setAttribute('aria-pressed','false');}}}};document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});document.addEventListener('hpa:motionchange',pause);const m=matchMedia('(prefers-reduced-motion: reduce)');m.addEventListener('change',()=>{REDUCED=m.matches;if(REDUCED)pause();});function enhance(){const c=CTX.kde;if(c&&!c.hpaEnhanced){c.hpaEnhanced=true;new MutationObserver(()=>c.btn.setAttribute('aria-pressed',String(c.playing))).observe(c.btn,{childList:true,subtree:true});c.btn.setAttribute('aria-pressed','false');c.scrub.addEventListener('input',()=>c.scrub.setAttribute('aria-valuetext',c.clock.textContent));c.scrub.setAttribute('aria-label','Top kazanımı kayıtlarını zaman içinde incele');c.scrub.setAttribute('aria-describedby','preserved-kde-scope');c.btn.addEventListener('click',()=>{if(REDUCED||document.documentElement.dataset.motion==='paused')pause();c.btn.setAttribute('aria-pressed',String(c.playing));});}}document.addEventListener('hpa:chart-mounted',enhance);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance);else enhance();})();