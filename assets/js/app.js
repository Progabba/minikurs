/* ===== app.js — движок Денди-курса ===== */
const screen = document.getElementById('screen');
const stage = document.getElementById('stage');
const hud = document.getElementById('hud');
const LS_KEY = 'alfa_dendy_v1';
const N = WORLDS.length;

const State = load();
function load(){
  try{ const d=JSON.parse(localStorage.getItem(LS_KEY));
    if(d && Array.isArray(d.done) && d.done.length===N) return d;
  }catch(e){}
  return { done:Array(N).fill(false), coins:0, lives:3, current:0 };
}
function save(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(State)); }catch(e){} }

let sceneCleanup=null;
const REDUCE = matchMedia('(prefers-reduced-motion:reduce)').matches;
if(REDUCE) document.body.classList.add('noflicker');

/* ---------- HUD ---------- */
function updateHUD(show){
  hud.classList.toggle('hidden', !show);
  if(!show) return;
  const cleared = State.done.filter(Boolean).length;
  hud.innerHTML = `
    <div class="l">
      <span class="stat">МИР <b>${cleared}/${N}</b></span>
      <span class="stat coin">◉ ${State.coins}</span>
      <span class="stat heart">${'♥'.repeat(State.lives)}</span>
    </div>
    <div class="r">
      <button class="hudbtn" id="mapBtn">КАРТА</button>
      <button class="hudbtn" id="sndBtn">${Chip.isEnabled()?'♪ ON':'♪ OFF'}</button>
    </div>`;
  hud.querySelector('#mapBtn').onclick=()=>{ Chip.play('select'); showMap(); };
  hud.querySelector('#sndBtn').onclick=()=>{
    const on=!Chip.isEnabled(); Chip.setEnabled(on);
    if(on){ Chip.resume(); Chip.startMusic(Chip.track); } else { Chip.stopMusic(); }
    updateHUD(true);
  };
}

/* ---------- 1. СТАРТ + звук-гейт ---------- */
function showStart(){
  updateHUD(false);
  stage.innerHTML = `<div class="view"><div class="center">
    <div class="logo-spark">⚡</div>
    <div class="title">АЛЬФА ИНЖЕНЕР</div>
    <div class="subtitle">Q U E S T &nbsp;·&nbsp; ЭОМ 8-BIT</div>
    <div class="pixtext" style="max-width:520px;margin-top:6px">Пройди 7 миров, собери щит, обуздай молнию и победи БОССА-ЭКСПЕРТИЗУ. Проектируй как герой!</div>
    <button class="btn" id="press" style="margin-top:10px">▶ PRESS START</button>
    <div class="copyfoot">(C) ${new Date().getFullYear()} АЛЬФА ИНЖЕНЕР · ОБУЧАЮЩАЯ ИГРА<br>Ведёт Альберт Габдуллин — основатель и директор проектного бюро</div>
  </div></div>`;
  stage.querySelector('#press').onclick=()=>{
    Chip.init(); Chip.resume(); Chip.play('start');
    showMap();
    setTimeout(()=>{ if(Chip.isEnabled()) Chip.startMusic(Chip.track); }, 500);
  };
}

/* ---------- 2. КАРТА-МИР ---------- */
function showMap(){
  if(sceneCleanup){ sceneCleanup(); sceneCleanup=null; }
  if(Chip.isEnabled()){ if(Chip.music) Chip.setTrack("map"); else Chip.startMusic("map"); }
  // текущий = первый непройденный
  let cur = State.done.findIndex(d=>!d);
  if(cur<0) cur = N-1;
  State.current = cur; save();
  updateHUD(true);
  const allDone = State.done.every(Boolean);
  stage.innerHTML = `<div class="view"><div style="text-align:center;margin-bottom:12px">
      <div class="title" style="font-size:clamp(12px,3.4vw,20px)">${allDone?'★ ВСЕ МИРЫ ПРОЙДЕНЫ ★':'ВЫБЕРИ УРОВЕНЬ'}</div></div>
    <div id="mapHost"></div>
    <div class="mini-map-legend">✓ пройдено · ● доступно · 🔒 закрыто${allDone?'':' · пройди по порядку'}</div>
    ${allDone?'<div class="btnrow" style="justify-content:center"><button class="btn green" id="fin">★ ФИНАЛ И КУБОК ★</button></div>':''}
  </div>`;
  renderWorldMap(document.getElementById('mapHost'), {
    done:State.done, current:cur, onPick:(i)=>enterLevel(i)
  });
  const fin=document.getElementById('fin');
  if(fin) fin.onclick=()=>{ Chip.play('powerup'); showVictory(); };
}

/* ---------- 3. УРОВЕНЬ: интро-диалог -> игра ---------- */
function enterLevel(i){
  const w = WORLDS[i];
  updateHUD(true);
  if(Chip.isEnabled()){ if(Chip.music) Chip.setTrack('m'+(i+1)); else Chip.startMusic('m'+(i+1)); }
  Chip.play('levelup');
  // "заставка мира" на миг
  stage.innerHTML = `<div class="view"><div class="center">
    <div class="pixtext hl-b">МИР ${w.code}</div>
    <div class="title" style="font-size:clamp(14px,4vw,24px)">${w.name}</div>
    <div class="stars8">${'★'.repeat(3)}</div>
  </div></div>`;
  setTimeout(()=>dialog(i,0), 1100);
}

/* печать текста реплик тренёра */
function dialog(i, line){
  const w=WORLDS[i];
  const total=w.intro.length;
  stage.innerHTML = `<div class="view">
    <div style="margin-bottom:12px"><span class="pixtext hl-b">МИР ${w.code}</span> <span class="pixtext hl-y">${w.name}</span></div>
    <div id="sceneBox" style="margin-bottom:12px"></div>
    <div class="box blue">
      <div class="dlg">
        ${sparkAvatar()}
        <div class="speech">
          <div class="name">ИСКРА</div>
          <div class="txt typed" id="txt"></div>
        </div>
      </div>
      <div class="progressbar"><i style="width:${(line/total*100)}%"></i></div>
      <div class="btnrow" style="justify-content:space-between">
        <button class="btn sm gray" id="skip">ПРОПУСТИТЬ</button>
        <button class="btn sm" id="next">${line<total-1?'ДАЛЕЕ >':'НАЧАТЬ ИГРУ >'}</button>
      </div>
    </div>
    <div class="norms"><div class="h">📘 НОРМЫ МИРА</div>${w.norms.map(n=>'§ '+n).join('<br>')}</div>
  </div>`;
  const txtEl=stage.querySelector('#txt');
  typeText(txtEl, w.intro[line]);
  if(sceneCleanup){ sceneCleanup(); sceneCleanup=null; }
  sceneCleanup = runScene(document.getElementById('sceneBox'), w.anim);
  const goGame=()=>startGame(i);
  stage.querySelector('#next').onclick=()=>{ Chip.play('select');
    if(line<total-1) dialog(i,line+1); else goGame(); };
  stage.querySelector('#skip').onclick=()=>{ Chip.play('select'); goGame(); };
}

let typeTimer=null;
function typeText(el, text){
  clearInterval(typeTimer);
  if(REDUCE){ el.textContent=text; el.classList.remove('typed'); return; }
  el.textContent=''; el.classList.add('typed');
  let k=0;
  typeTimer=setInterval(()=>{
    el.textContent = text.slice(0,k+1);
    if(k%2===0) Chip.play('tick');
    k++;
    if(k>=text.length){ clearInterval(typeTimer); el.classList.remove('typed'); }
  }, 28);
}

/* ---------- игра мира ---------- */
function startGame(i){
  clearInterval(typeTimer);
  if(sceneCleanup){ sceneCleanup(); sceneCleanup=null; }
  const w=WORLDS[i];
  updateHUD(true);
  stage.innerHTML=`<div class="view">
    <div style="margin-bottom:12px"><span class="pixtext hl-b">МИР ${w.code}</span> <span class="pixtext hl-y">${w.name}</span></div>
    <div id="gameHost"></div>
  </div>`;
  const host=document.getElementById('gameHost');
  const fn = GAME_FN[w.game.type];
  fn(host, w.game, ()=>completeLevel(i));
}

function completeLevel(i){
  if(!State.done[i]){
    State.done[i]=true;
    State.coins += 100;
    save();
  }
  Chip.play('win');
  const w=WORLDS[i];
  const allDone=State.done.every(Boolean);
  updateHUD(true);
  stage.innerHTML=`<div class="view"><div class="center" style="gap:16px">
    <div class="stars8">★ ★ ★</div>
    <div class="title" style="font-size:clamp(12px,3.4vw,20px)">МИР ${w.code} ПРОЙДЕН!</div>
    <div class="pixtext hl-y">+100 ◉  (всего ${State.coins})</div>
    <div class="pixtext sm hl-gray" style="max-width:440px">${w.norms[0]}</div>
    <div class="btnrow" style="justify-content:center">
      ${allDone?'<button class="btn green" id="go">★ К ФИНАЛУ ★</button>'
               :'<button class="btn" id="go">СЛЕДУЮЩИЙ МИР ></button>'}
      <button class="btn gray sm" id="map">КАРТА</button>
    </div>
  </div></div>`;
  stage.querySelector('#go').onclick=()=>{ Chip.play('select'); allDone?showVictory():showMap(); };
  stage.querySelector('#map').onclick=()=>{ Chip.play('select'); showMap(); };
}

/* ---------- ФИНАЛ ---------- */
function showVictory(){
  updateHUD(true);
  Chip.stopMusic(); Chip.play('win');
  setTimeout(()=>{ if(Chip.isEnabled()) Chip.startMusic('win'); }, 1600);
  confettiPixels();
  stage.innerHTML=`<div class="view"><div class="center" style="gap:16px">
    <div class="trophy">🏆</div>
    <div class="stars8">★ ★ ★ ★ ★</div>
    <div class="title" style="font-size:clamp(14px,4vw,24px)">ПОБЕДА!</div>
    <div class="pixtext" style="max-width:500px;line-height:2.2">Ты прошёл все 7 миров: собрал щит, рассчитал линии, укротил молнию, нормировал свет и одолел БОССА-ЭКСПЕРТИЗУ. Это настоящая база проектировщика ЭОМ!</div>
    <div class="pixtext hl-y">СЧЁТ: ${State.coins} ◉</div>
    <div class="box gold" style="max-width:520px;margin-top:6px">
      <div class="pixtext hl-o" style="margin-bottom:10px">СЛЕДУЮЩИЙ УРОВЕНЬ РЕАЛЕН:</div>
      <div class="pixtext sm" style="line-height:2">Полный курс «Проектирование систем электроснабжения» — реальные проекты от задания до экспертизы, шаблоны и наставник.</div>
      <a class="btn full green" style="margin-top:14px;text-decoration:none;display:block" href="${COURSE_URL}" target="_blank" rel="noopener">★ ЗАБРАТЬ КУРС ★</a>
    </div>
    <button class="btn gray sm" id="restart" style="margin-top:8px">↻ НАЧАТЬ ЗАНОВО</button>
  </div></div>`;
  stage.querySelector('#restart').onclick=()=>{
    Chip.play('select');
    State.done=Array(N).fill(false); State.coins=0; State.current=0; save();
    showMap();
  };
}

/* ---------- пиксельное конфетти ---------- */
function confettiPixels(){
  if(REDUCE) return;
  const c=document.createElement('canvas');
  c.style.cssText='position:absolute;inset:0;z-index:95;pointer-events:none';
  screen.appendChild(c);
  const x=c.getContext('2d'); c.width=innerWidth; c.height=innerHeight;
  const cols=['#f8d800','#3cbcfc','#58f898','#f83800','#6844fc','#fcfcfc'];
  let P=Array.from({length:90},()=>({x:Math.random()*c.width,y:-10-Math.random()*c.height,
    s:4+Math.random()*4,vy:2+Math.random()*4,vx:(Math.random()-.5)*2,c:cols[(Math.random()*cols.length)|0]}));
  let t=0;
  (function loop(){ t++; x.clearRect(0,0,c.width,c.height);
    P.forEach(p=>{ p.y+=p.vy; p.x+=p.vx; if(p.y>c.height) p.y=-10;
      x.fillStyle=p.c; x.fillRect(p.x|0,p.y|0,p.s,p.s); });
    if(t<260) requestAnimationFrame(loop); else c.remove();
  })();
}

/* ---------- спрайты для диалога ---------- */
function sparkAvatar(){
  return `<svg class="avatar" viewBox="0 0 32 32">
    <rect x="10" y="12" width="12" height="12" fill="#3cbcfc"/>
    <rect x="8" y="14" width="16" height="8" fill="#0078f8"/>
    <rect x="8" y="4" width="16" height="8" fill="#f8d800"/>
    <rect x="10" y="1" width="12" height="4" fill="#fca044"/>
    <rect x="11" y="7" width="10" height="5" fill="#fcd8a8"/>
    <rect x="13" y="8" width="2" height="2" fill="#0d0b16"/>
    <rect x="17" y="8" width="2" height="2" fill="#0d0b16"/>
    <rect x="14" y="11" width="4" height="1" fill="#0d0b16"/>
  </svg>`;
}

/* ---------- запуск ---------- */
showStart();
