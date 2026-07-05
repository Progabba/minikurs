/* ===== app.js — экраны и логика курса ===== */
const app=document.getElementById('app');
const LS_KEY='alfa_minikurs_v1';
const N=MODULES.length;
let done=loadProgress();
let view={s:'cover',m:0};
let sceneCleanup=null;

function loadProgress(){
  try{const d=JSON.parse(localStorage.getItem(LS_KEY));
    if(Array.isArray(d)&&d.length===N)return d;}catch(e){}
  return Array(N).fill(false);
}
function saveProgress(){try{localStorage.setItem(LS_KEY,JSON.stringify(done));}catch(e){}}

document.getElementById('yr').textContent=new Date().getFullYear();
document.getElementById('homeBtn').onclick=()=>{view={s:'map'};render();};
initStars();

function setGP(){document.getElementById('gp').style.width=(done.filter(Boolean).length/N*100)+'%';}

function render(){
  if(sceneCleanup){sceneCleanup();sceneCleanup=null;}
  setGP();
  if(view.s==='cover')cover();
  else if(view.s==='map')map();
  else if(view.s==='module')moduleView(view.m);
  else finalView();
  revealStagger(app);
}

function cover(){
  const n=done.filter(Boolean).length;
  app.innerHTML=`<div class="screen">
    <div class="ey rv">Бесплатный мини-курс</div>
    <h1 class="rv">Первый шаг в проектирование ЭОМ</h1>
    <p class="lead rv">7 модулей: анимированная теория на реальных нормах (ПУЭ, СП 256, ГОСТ 31565, СП 6, СП 52) и 7 игр — соберёшь щит, рассчитаешь линию, защитишь дом от молнии и проведёшь «экспертизу».</p>
    <div class="chips"><span class="chip rv"><b>7</b> модулей</span><span class="chip rv">анимации-истории</span><span class="chip rv"><b>7</b> игр</span><span class="chip rv"><b>0 ₽</b></span></div>
    <button class="btn btn-gold full rv" id="go">${n>0?'Продолжить курс →':'Начать курс →'}</button>
    <div class="hair"></div>
    <p class="rv" style="color:var(--muted);font-size:14px;margin:0">Ведёт <b style="color:var(--ink)">Альберт Габдуллин</b> — основатель и директор проектного бюро «Альфа Инженер». За плечами бюро — 500+ проектов в 17+ регионах России.</p></div>`;
  document.getElementById('go').onclick=()=>{view={s:'map'};render();};
}

function map(){
  const n=done.filter(Boolean).length;
  app.innerHTML=`<div class="screen">
    <div class="ey rv">Программа курса</div>
    <h2 class="rv">${n===N?'Курс пройден 🎉':'Выбери модуль'}</h2>
    <p class="lead rv" style="font-size:15px">${n}/${N} пройдено. Сначала теория с анимацией, затем игра на закрепление. Прогресс сохраняется.</p>
    <div class="mods">${MODULES.map((m,i)=>{
      const unlocked=i===0||done[i-1]||done[i],isDone=done[i];
      return `<div class="mod rv ${isDone?'done':''}" data-i="${i}" aria-disabled="${!unlocked}">
        <div class="mnum">${isDone?'✓':m.icon}</div>
        <div class="mtext"><h3>${m.title}</h3><p>${m.sub}</p></div>
        <div class="mstate ${isDone?'ok':''}">${isDone?'Пройдено':(unlocked?'Открыть →':'🔒')}</div></div>`;}).join('')}</div>
    ${n===N?`<div style="margin-top:20px"><button class="btn btn-gold full rv" id="final">К финалу и сертификату →</button></div>`:''}</div>`;
  app.querySelectorAll('.mod').forEach(el=>{
    if(el.getAttribute('aria-disabled')==='true')return;
    el.onclick=()=>{view={s:'module',m:+el.dataset.i};render();};});
  const f=document.getElementById('final');
  if(f)f.onclick=()=>{view={s:'done'};render();};
}

function moduleView(i){
  const m=MODULES[i];
  app.innerHTML=`<div class="screen">
    <div class="ey rv">Модуль ${m.icon} · ${done.filter(Boolean).length}/${N}</div>
    <h2 class="rv">${m.title}</h2>
    <p class="sect-label rv" style="margin-top:4px">Как это работает · анимация</p>
    <div id="storybox"></div>
    <div class="card les" id="les">${m.lesson}</div>
    <div class="hair"></div>
    <p class="sect-label rv">Игра на закрепление</p>
    <div id="act"></div></div>`;
  sceneCleanup=mountScene(document.getElementById('storybox'),SCENES[m.scene]);
  document.getElementById('les').querySelectorAll('p,h4,li,.note,.norm').forEach(e=>e.classList.add('rv'));
  GAMES[m.game](document.getElementById('act'),i);
  revealStagger(app);
}

function completeBtn(i){
  const wrap=document.createElement('div');wrap.style.marginTop='18px';
  const b=document.createElement('button');b.className='btn btn-gold full';
  b.textContent=i<N-1?'Модуль пройден · дальше →':'Модуль пройден · к финалу →';
  b.onclick=()=>{done[i]=true;saveProgress();view=(i<N-1)?{s:'module',m:i+1}:{s:'done'};render();};
  wrap.appendChild(b);
  const back=document.createElement('button');back.className='btn btn-ghost';back.style.marginTop='10px';
  back.textContent='← К программе';
  back.onclick=()=>{done[i]=true;saveProgress();view={s:'map'};render();};
  wrap.appendChild(back);
  return wrap;
}

function finalView(){
  app.innerHTML=`<div class="screen">
    <div class="cert rv"><div class="seal">◆ Альфа Инженер ◆</div>
    <div class="ring"><svg width="150" height="150" viewBox="0 0 150 150">
      <circle cx="75" cy="75" r="66" fill="none" stroke="#2a323b" stroke-width="8"/>
      <circle id="rc" cx="75" cy="75" r="66" fill="none" stroke="#d8b877" stroke-width="8" stroke-linecap="round"
        stroke-dasharray="0 999" transform="rotate(-90 75 75)"
        style="transition:stroke-dasharray 1.3s cubic-bezier(.2,.8,.2,1);filter:drop-shadow(0 0 6px rgba(216,184,119,.5))"/></svg>
      <div class="v"><b id="pctv">0%</b><span style="font-size:10px;color:var(--muted);letter-spacing:.15em">ПРОЙДЕНО</span></div></div>
    <h2 style="margin:6px 0 8px">Мини-курс пройден!</h2>
    <p style="color:#cdd5dd;margin:0 auto;max-width:46ch">Ты собрал щит, рассчитал линии, защитил дом от молнии, нормировал свет и провёл «экспертизу» — это настоящая база проектировщика ЭОМ. Дальше — глубина и реальные проекты.</p></div>
    <div class="offer rv"><div class="ey" style="margin-bottom:8px">Следующий шаг</div>
      <h3>Полный курс «Проектирование систем электроснабжения»</h3>
      <p>Здесь ты попробовал в миниатюре. На полном курсе — реальные проекты от задания до сдачи в экспертизу, шаблоны, наставник и первый проект в портфолио.</p>
      <a class="btn btn-gold full" href="${COURSE_URL}" target="_blank" rel="noopener">Забрать курс со скидкой →</a>
      <button class="btn btn-ghost" id="restart" style="margin-top:10px">↻ Пройти мини-курс заново</button></div></div>`;
  const circ=2*Math.PI*66;
  requestAnimationFrame(()=>document.getElementById('rc').setAttribute('stroke-dasharray',`${circ} 999`));
  const pv=document.getElementById('pctv');let cur=0;
  const ci=setInterval(()=>{cur=Math.min(100,cur+3);pv.textContent=cur+'%';if(cur>=100)clearInterval(ci);},22);
  confettiBurst();
  document.getElementById('restart').onclick=()=>{
    done=Array(N).fill(false);saveProgress();view={s:'cover'};render();};
}

render();
