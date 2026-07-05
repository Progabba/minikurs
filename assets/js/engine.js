/* ===== engine.js — анимационный движок курса ===== */
const REDUCE = matchMedia('(prefers-reduced-motion:reduce)').matches;
const SVGNS = 'http://www.w3.org/2000/svg';

/* --- фоновые частицы --- */
function initStars(){
  const c=document.getElementById('stars'); if(!c) return;
  const x=c.getContext('2d'); let W,H,P=[];
  function rs(){W=c.width=innerWidth;H=c.height=innerHeight;
    P=Array.from({length:Math.min(46,Math.floor(W*H/34000))},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+.4,vy:Math.random()*.15+.03,a:Math.random()*.35+.05}));}
  rs(); addEventListener('resize',rs);
  (function loop(){x.clearRect(0,0,W,H);
    P.forEach(p=>{if(!REDUCE){p.y-=p.vy;if(p.y<-5){p.y=H+5;p.x=Math.random()*W;}}
      x.beginPath();x.arc(p.x,p.y,p.r,0,6.28);x.fillStyle='rgba(216,184,119,'+p.a+')';x.fill();});
    if(!REDUCE)requestAnimationFrame(loop);})();
}

/* --- конфетти --- */
function confettiBurst(){
  if(REDUCE) return;
  const c=document.getElementById('fx'),x=c.getContext('2d');
  c.width=innerWidth;c.height=innerHeight;
  const cols=['#d8b877','#c2a05f','#6f9bc0','#eef1f4','#6fcf97'];
  const cx=innerWidth/2,cy=innerHeight*0.28;
  let P=Array.from({length:80},(_,k)=>{const a=Math.random()*6.28,sp=2+Math.random()*7;
    return{x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2,g:.16,s:2+Math.random()*3,c:cols[k%cols.length],life:1};});
  let t=0;(function loop(){t++;x.clearRect(0,0,c.width,c.height);let alive=false;
    P.forEach(p=>{p.life-=.012;if(p.life<=0)return;alive=true;p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.vx*=.99;
      x.globalAlpha=Math.max(0,p.life);x.fillStyle=p.c;x.fillRect(p.x,p.y,p.s,p.s*1.6);});
    if(alive&&t<170)requestAnimationFrame(loop);else x.clearRect(0,0,c.width,c.height);})();
}

/* --- частицы вдоль SVG-пути ---
   flowAlong(svgRoot, '#pathId', {n, dur, r, color, glow}) -> stop() */
function flowAlong(svgRoot, pathSel, opts={}){
  const path = typeof pathSel==='string' ? svgRoot.querySelector(pathSel) : pathSel;
  if(!path) return ()=>{};
  const {n=3, dur=1600, r=2.6, color='#d8b877', glow=true, reverse=false, trail=0}=opts;
  const L=path.getTotalLength();
  const dots=[];
  for(let k=0;k<n;k++){
    const c=document.createElementNS(SVGNS,'circle');
    c.setAttribute('r',r); c.setAttribute('fill',color); c.setAttribute('class','flowdot');
    if(glow) c.style.filter=`drop-shadow(0 0 4px ${color})`;
    path.parentNode.appendChild(c);
    const t=[];
    if(trail>0){for(let j=0;j<trail;j++){const tc=document.createElementNS(SVGNS,'circle');
      tc.setAttribute('r',r*(1-(j+1)*0.28)); tc.setAttribute('fill',color); tc.setAttribute('opacity',String(.5-(j+1)*.14));
      tc.setAttribute('class','flowdot'); path.parentNode.appendChild(tc); t.push(tc);}}
    dots.push({c, t, off:k/n});
  }
  let raf, t0=performance.now(), stopped=false;
  function place(frac,d){
    let f=((frac+d.off)%1+1)%1; if(reverse) f=1-f;
    const p=path.getPointAtLength(f*L);
    d.c.setAttribute('cx',p.x); d.c.setAttribute('cy',p.y);
    d.t.forEach((tc,j)=>{let ff=f-(j+1)*0.03*(reverse?-1:1); ff=((ff%1)+1)%1;
      const tp=path.getPointAtLength(ff*L); tc.setAttribute('cx',tp.x); tc.setAttribute('cy',tp.y);});
  }
  if(REDUCE){dots.forEach((d,k)=>place(k/n,d));}
  else{
    const tick=t=>{if(stopped)return;const e=(t-t0)/dur;dots.forEach(d=>place(e,d));raf=requestAnimationFrame(tick);};
    raf=requestAnimationFrame(tick);
  }
  return ()=>{stopped=true;cancelAnimationFrame(raf);dots.forEach(d=>{d.c.remove();d.t.forEach(tc=>tc.remove());});};
}

/* --- анимированный счётчик числа --- */
function countTo(el,to,dec=0,suf=''){
  const from=parseFloat(el.dataset.v||'0'); el.dataset.v=to;
  if(REDUCE){el.textContent=to.toFixed(dec)+suf;return;}
  const t0=performance.now(),dur=460;
  (function s(t){const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);
    el.textContent=(from+(to-from)*e).toFixed(dec)+suf;
    if(k<1)requestAnimationFrame(s);})(t0);
}

/* --- плеер сцен ---
   scene = {svg, caps:[html...], dur, flows:{stepIdx:[{path,opts}]}, hooks:{stepIdx:fn(svg)->cleanup}} */
function mountScene(root, scene){
  root.innerHTML=`<div class="story">
    <div class="svgwrap">${scene.svg}</div>
    <div class="scap"></div>
    <div class="srow">
      <div class="sdots">${scene.caps.map((_,k)=>`<i data-k="${k}"></i>`).join('')}</div>
      <button class="sbtn" data-a="play" title="Пауза/пуск">⏸</button>
      <button class="sbtn" data-a="replay" title="Сначала">↻</button>
    </div></div>`;
  const svg=root.querySelector('svg');
  const cap=root.querySelector('.scap');
  const dots=[...root.querySelectorAll('.sdots i')];
  const playBtn=root.querySelector('[data-a=play]');
  const dur=scene.dur||3400;
  root.style.setProperty('--sd',dur+'ms');
  let k=-1, timer=null, playing=!REDUCE, cleanups=[];

  function clearFx(){cleanups.forEach(fn=>{try{fn();}catch(e){}});cleanups=[];}
  function show(n){
    k=n; clearFx();
    svg.querySelectorAll('.stg').forEach(g=>{
      const s=+g.dataset.s;
      const solo=g.classList.contains('solo');
      g.classList.toggle('on', solo ? s===k : s<=k);
    });
    dots.forEach((d,i)=>{d.classList.toggle('on',i===k);d.style.setProperty('--sd',dur+'ms');});
    cap.style.opacity=0;
    setTimeout(()=>{cap.innerHTML=scene.caps[k];cap.style.opacity=1;},180);
    (scene.flows&&scene.flows[k]||[]).forEach(f=>cleanups.push(flowAlong(svg,f.path,f.opts)));
    if(scene.hooks&&scene.hooks[k]){const c=scene.hooks[k](svg);if(c)cleanups.push(c);}
  }
  function schedule(){clearInterval(timer);
    if(playing&&!REDUCE) timer=setInterval(()=>show((k+1)%scene.caps.length),dur);}
  dots.forEach(d=>d.onclick=()=>{show(+d.dataset.k);schedule();});
  playBtn.onclick=()=>{playing=!playing;playBtn.textContent=playing?'⏸':'▶';schedule();};
  root.querySelector('[data-a=replay]').onclick=()=>{show(0);schedule();};
  if(REDUCE){playBtn.style.display='none';}
  show(0);schedule();
  return ()=>{clearInterval(timer);clearFx();};
}

/* --- стаггер появления --- */
function revealStagger(scope){
  scope.querySelectorAll('.rv').forEach((e,i)=>{e.style.animationDelay=(i*0.05)+'s';});
}
