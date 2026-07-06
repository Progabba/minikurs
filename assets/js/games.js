/* ===== games.js — аркадные мини-игры ===== */

function popScore(host, x, y, text){
  const el=document.createElement('div'); el.className='pop-score'; el.textContent=text;
  el.style.left=x+'px'; el.style.top=y+'px';
  host.appendChild(el); setTimeout(()=>el.remove(),800);
}
function showCombo(text){
  const el=document.createElement('div'); el.className='combo show'; el.textContent=text;
  document.body.appendChild(el); setTimeout(()=>el.remove(),650);
}


/* ===== боевые эффекты для боссов ===== */
function shakeScreen(){
  const s=document.getElementById('screen');
  s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake');
  setTimeout(()=>s.classList.remove('shake'),400);
}
function pixelBurst(cx,cy,col){
  const screen=document.getElementById('screen');
  const cols=col||['#f8d800','#f83800','#fcfcfc','#3cbcfc'];
  for(let i=0;i<14;i++){
    const p=document.createElement('div');
    const cc=Array.isArray(cols)?cols[i%cols.length]:cols;
    p.style.cssText=`position:absolute;left:${cx}px;top:${cy}px;width:6px;height:6px;background:${cc};z-index:85;pointer-events:none;image-rendering:pixelated`;
    screen.appendChild(p);
    const a=Math.random()*6.28, sp=2+Math.random()*4;
    let vx=Math.cos(a)*sp, vy=Math.sin(a)*sp, life=0;
    (function fly(){ life++; p.style.left=(parseFloat(p.style.left)+vx)+'px'; p.style.top=(parseFloat(p.style.top)+vy)+'px'; vy+=0.3;
      if(life<24) requestAnimationFrame(fly); else p.remove(); })();
  }
}
/* HP-бар босса: возвращает {el, hit(), dead} */
function bossBar(host, name, hp){
  const wrap=document.createElement('div'); wrap.className='bossbar';
  wrap.innerHTML=`<div class="bossname">☠ ${name}</div><div class="hpouter"><i class="hpbar" style="width:100%"></i></div>
    <div class="bosssprite" id="bsp">${name.includes('ГОЛЕМ')?bossGolem():bossDragon()}</div>`;
  host.appendChild(wrap);
  const bar=wrap.querySelector('.hpbar'); const sp=wrap.querySelector('#bsp');
  let cur=hp;
  return {
    hit(){ cur--; bar.style.width=(cur/hp*100)+'%';
      if(cur/hp<0.35) bar.classList.add('low');
      const r=sp.getBoundingClientRect(); pixelBurst(r.left+r.width/2, r.top+r.height/2);
      shakeScreen(); sp.classList.remove('bosshit'); void sp.offsetWidth; sp.classList.add('bosshit');
      return cur<=0; },
    get hp(){ return cur; }
  };
}
function bossGolem(){ return `<svg viewBox="0 0 64 64" width="72" height="72" style="image-rendering:pixelated">
  <rect x="18" y="20" width="28" height="30" fill="#7c7c7c"/><rect x="14" y="24" width="8" height="18" fill="#5c5c5c"/><rect x="42" y="24" width="8" height="18" fill="#5c5c5c"/>
  <rect x="22" y="10" width="20" height="14" fill="#9c9c9c"/><rect x="26" y="14" width="4" height="4" fill="#f83800"/><rect x="34" y="14" width="4" height="4" fill="#f83800"/>
  <rect x="20" y="50" width="8" height="10" fill="#5c5c5c"/><rect x="36" y="50" width="8" height="10" fill="#5c5c5c"/>
  <rect x="24" y="30" width="16" height="4" fill="#3cbcfc"/></svg>`; }
function bossDragon(){ return `<svg viewBox="0 0 64 64" width="72" height="72" style="image-rendering:pixelated">
  <rect x="14" y="26" width="30" height="22" fill="#e40058"/><rect x="40" y="18" width="18" height="18" fill="#f83800"/>
  <rect x="52" y="22" width="4" height="4" fill="#f8d800"/><rect x="50" y="30" width="10" height="3" fill="#fca044"/>
  <rect x="8" y="30" width="12" height="8" fill="#f83800"/><rect x="20" y="46" width="6" height="8" fill="#e40058"/><rect x="32" y="46" width="6" height="8" fill="#e40058"/>
  <rect x="16" y="14" width="6" height="8" fill="#a0002a"/></svg>`; }

/* общий каркас арены */
function arena(host, g, onWin){
  const wrap=document.createElement('div'); wrap.className='box '+(g.type==='expert'?'red':'blue');
  wrap.innerHTML=`<div class="q">${g.title}</div><div class="pixtext sm hl-gray" style="margin-bottom:12px">${g.hint}</div><div class="arena" id="arena"></div>`;
  host.appendChild(wrap);
  return {wrap, arena:wrap.querySelector('#arena'), onWin};
}

/* --- ORDER: собери путь --- */
function gameOrder(host,g,onWin){
  const {arena}=arenaBase(host,g,onWin);
  let pos=0, mistakes=0;
  const seq=document.createElement('div'); seq.className='slots';
  const tray=document.createElement('div'); tray.className='parts';
  const fb=fbEl();
  arena.append(seq,tray,fb);
  [...g.stages].map((t,k)=>({t,k})).sort(()=>Math.random()-.5).forEach(o=>{
    const b=document.createElement('button'); b.className='part'; b.textContent=o.t;
    b.onclick=()=>{
      if(o.k===pos){ Chip.play('coin'); b.classList.add('used');
        const s=document.createElement('div'); s.className='slot ok'; s.innerHTML=`<span>${pos+1}. ${o.t}</span><span class="v">OK</span>`; seq.appendChild(s);
        pos++;
        if(pos===g.stages.length){ Chip.play('levelup'); showFb(fb,true, mistakes===0?"ИДЕАЛЬНО! Путь проекта собран!":"Готово! Ошибок: "+mistakes); winBtn(arena,onWin); }
      } else { Chip.play('wrong'); mistakes++; b.classList.add('no'); setTimeout(()=>b.classList.remove('no'),250); }
    };
    tray.appendChild(b);
  });
}

/* --- BUILD / MATCH: слот -> деталь --- */
function gameSlots(host,g,onWin){
  const {arena}=arenaBase(host,g,onWin);
  let active=-1, placed=0, mistakes=0;
  const slotsEl=document.createElement('div'); slotsEl.className='slots';
  const partsEl=document.createElement('div'); partsEl.className='parts';
  const fb=fbEl();
  arena.append(slotsEl,partsEl,fb);
  const slots=g.slots.map((s,k)=>{
    const el=document.createElement('div'); el.className='slot';
    el.innerHTML=`<span>${s.l}</span><span class="v">- ? -</span>`;
    el.onclick=()=>{ if(el.classList.contains('ok'))return; Chip.play('select');
      slots.forEach(x=>x.el.classList.remove('active')); el.classList.add('active'); active=k; };
    slotsEl.appendChild(el); return {el, a:s.a};
  });
  [...g.slots.map(s=>s.a)].sort(()=>Math.random()-.5).forEach(a=>{
    const b=document.createElement('button'); b.className='part'; b.textContent=a;
    b.onclick=()=>{
      if(active<0){ Chip.play('wrong'); showFb(fb,false,"Сначала выбери слот!"); return; }
      if(slots[active].a===a){ Chip.play('coin'); const s=slots[active];
        s.el.classList.remove('active'); s.el.classList.add('ok'); s.el.querySelector('.v').textContent=a;
        b.classList.add('used'); active=-1; placed++; hideFb(fb);
        if(placed===slots.length){ Chip.play('levelup'); showFb(fb,true, mistakes===0?"БЕЗУПРЕЧНО! Всё на местах!":"Собрано! Ошибок: "+mistakes); winBtn(arena,onWin); }
      } else { Chip.play('wrong'); mistakes++; b.classList.add('no'); setTimeout(()=>b.classList.remove('no'),250); }
    };
    partsEl.appendChild(b);
  });
}

/* --- CALC: БОСС с HP-баром --- */
function gameCalc(host,g,onWin){
  const {arena}=arenaBase(host,g,onWin);
  const boss=bossBar(arena, g.boss||'РАСЧЁТ-ГОЛЕМ', g.tasks.length);
  const zone=document.createElement('div'); arena.appendChild(zone);
  let r=0, score=0;
  function round(){
    const T=g.tasks[r];
    zone.innerHTML=`<div class="pixtext" style="margin:10px 0">УДАР ${r+1}/${g.tasks.length}</div><div class="q" style="font-size:clamp(7px,2vw,10px);color:var(--nes-white);line-height:2">${T.q}</div><div class="opts" id="o"></div>`;
    const fb=fbEl(); zone.appendChild(fb);
    const oc=zone.querySelector('#o');
    T.opts.forEach(v=>{
      const b=document.createElement('button'); b.className='opt'; b.textContent=v+' мм2';
      b.onclick=()=>{
        oc.querySelectorAll('.opt').forEach(x=>x.style.pointerEvents='none');
        if(v===T.ans){ Chip.play('correct'); b.classList.add('ok'); score++;
          const dead=boss.hit(); Chip.play('hit'); }
        else { Chip.play('wrong'); b.classList.add('no'); [...oc.children].find(x=>x.textContent.startsWith(T.ans+' ')).classList.add('ok'); }
        showFb(fb, v===T.ans, (v===T.ans?"ПОПАДАНИЕ! ":"Мимо! Ответ: "+T.ans+"мм2. ")+T.fb);
        const nx=document.createElement('button'); nx.className='btn sm blue'; nx.style.marginTop='12px';
        nx.textContent = r<g.tasks.length-1 ? 'ДАЛЕЕ >' : 'ДОБИТЬ';
        nx.onclick=()=>{ Chip.play('select'); r++; r<g.tasks.length?round():finish(); };
        zone.appendChild(nx);
      };
      oc.appendChild(b);
    });
  }
  function finish(){
    Chip.play(score===g.tasks.length?'powerup':'coin');
    const beaten = boss.hp<=0;
    zone.innerHTML=`<div class="center" style="min-height:auto;gap:12px">
      <div class="stars8">${'★'.repeat(score)}${'☆'.repeat(g.tasks.length-score)}</div>
      <div class="q">${beaten?'БОСС ПОВЕРЖЕН!':'БОСС ВЫЖИЛ ('+score+'/'+g.tasks.length+')'}</div>
      <div class="pixtext sm hl-gray">${score===g.tasks.length?'Ты чувствуешь ток->сечение->автомат!':'Разбор выше — половина успеха.'}</div></div>`;
    if(beaten) pixelBurst(innerWidth/2, innerHeight*0.4);
    winBtn(zone,onWin);
  }
  round();
}

/* --- SPRINT: на время + комбо --- */
function gameSprint(host,g,onWin){
  const {arena}=arenaBase(host,g,onWin);
  let idx=0, score=0, combo=0, best=0, timeLeft=g.time, finished=false, tickInt=null;
  const deck=[...g.cards].sort(()=>Math.random()-.5);
  const timer=document.createElement('div'); timer.className='timer'; timer.innerHTML='<i></i>';
  const stat=document.createElement('div'); stat.className='pixtext sm'; stat.innerHTML=`ВРЕМЯ <span class="hl-r">${timeLeft}</span> · ОЧКИ <span class="hl-y">0</span>`;
  const q=document.createElement('div'); q.className='q';
  const opts=document.createElement('div'); opts.className='opts';
  arena.append(stat,timer,q,opts);
  const bar=timer.querySelector('i');
  function refresh(){ stat.innerHTML=`ВРЕМЯ <span class="hl-r">${timeLeft}</span> · ОЧКИ <span class="hl-y">${score}</span>${combo>=2?' · <span class="hl-g">x'+ (combo>=3?2:1) +'</span>':''}`; }
  function card(){
    if(idx>=deck.length){ finish(); return; }
    const C=deck[idx]; q.textContent=C.q; opts.innerHTML='';
    C.o.forEach((o,k)=>{
      const b=document.createElement('button'); b.className='opt'; b.textContent=o;
      b.onclick=()=>{
        if(finished) return;
        opts.querySelectorAll('.opt').forEach(x=>x.style.pointerEvents='none');
        if(k===C.a){ combo++; best=Math.max(best,combo); const pts=combo>=3?2:1; score+=pts; b.classList.add('ok');
          Chip.play(combo>=3?'combo':'correct'); if(combo>=3) showCombo('COMBO x2!'); }
        else { combo=0; b.classList.add('no'); opts.children[C.a].classList.add('ok'); Chip.play('wrong'); }
        refresh();
        setTimeout(()=>{ idx++; card(); },500);
      };
      opts.appendChild(b);
    });
  }
  card();
  tickInt=setInterval(()=>{ timeLeft--; bar.style.width=(timeLeft/g.time*100)+'%';
    if(timeLeft<=5){ bar.classList.add('warn'); Chip.play('tick'); }
    refresh(); if(timeLeft<=0) finish(); },1000);
  function finish(){
    if(finished) return; finished=true; clearInterval(tickInt);
    Chip.play('win');
    const rank = score>=9?'НОРМОКОНТРОЛЁР':score>=5?'ИНЖЕНЕР':'ПРАКТИКАНТ';
    arena.innerHTML=`<div class="center" style="min-height:auto;gap:14px">
      <div class="q hl-y">${score} ОЧКОВ</div>
      <div class="pixtext sm">ЛУЧШЕЕ КОМБО: x${best}</div>
      <div class="q" style="color:var(--nes-green2)">${rank}</div>
      <button class="btn sm gray" id="again">↻ ЕЩЁ РАЗ</button></div>`;
    arena.querySelector('#again').onclick=()=>{ Chip.play('select'); host.innerHTML=''; gameSprint(host,g,onWin); };
    winBtn(arena,onWin);
  }
}

/* --- EXPERT: БОСС-ДРАКОН, найди ошибки --- */
function gameExpert(host,g,onWin){
  const {arena}=arenaBase(host,g,onWin);
  const badCount=g.rows.filter(r=>r.bad).length;
  const boss=bossBar(arena, g.boss||'ЭКСПЕРТ-ДРАКОН', badCount);
  let checked=false;
  const list=document.createElement('div'); list.className='slots';
  const rows=g.rows.map((r,k)=>{
    const el=document.createElement('div'); el.className='slot';
    el.innerHTML=`<span>${r.t}</span><span class="v">[ ]</span>`;
    el.onclick=()=>{ if(checked)return; Chip.play('select'); el.classList.toggle('marked');
      el.querySelector('.v').textContent=el.classList.contains('marked')?'[X]':'[ ]';
      el.style.borderColor=el.classList.contains('marked')?'var(--nes-red)':''; };
    list.appendChild(el); return {el, r};
  });
  const check=document.createElement('button'); check.className='btn full red'; check.style.marginTop='6px'; check.textContent='⚔ АТАКОВАТЬ';
  const fb=fbEl();
  arena.append(list,check,fb);
  check.onclick=()=>{
    if(checked)return; checked=true;
    let hits=0,fp=0;
    rows.forEach(({el,r})=>{
      const marked=el.classList.contains('marked');
      if(r.bad&&marked){hits++;el.classList.add('ok'); boss.hit();}
      else if(!r.bad&&marked){fp++;el.style.borderColor='var(--nes-red)';}
      else if(r.bad&&!marked){el.style.borderColor='var(--nes-yellow)';}
      const why=document.createElement('div'); why.className='pixtext sm'; why.style.cssText='width:100%;margin-top:6px;color:var(--nes-gray)';
      why.textContent=(r.bad?'! ':'v ')+r.fb; el.appendChild(why);
    });
    const perfect=hits===badCount&&fp===0;
    Chip.play(perfect?'powerup':'wrong');
    if(perfect) pixelBurst(innerWidth/2, innerHeight*0.35);
    showFb(fb,perfect, perfect?`ДРАКОН ПОВЕРЖЕН! Все ${badCount} ошибки найдены!`:`Попаданий: ${hits}/${badCount}${fp?', промахов: '+fp:''}. Разбор под строками.`);
    check.style.display='none';
    winBtn(arena,onWin);
  };
}

/* ===== хелперы ===== */
function arenaBase(host,g,onWin){
  const wrap=document.createElement('div'); wrap.className='box '+(g.type==='expert'?'red':(g.type==='sprint'?'gold':'blue'));
  wrap.innerHTML=`<div class="q">${g.title}</div><div class="pixtext sm hl-gray" style="margin-bottom:14px">${g.hint}</div><div class="arena" id="arena"></div>`;
  host.appendChild(wrap);
  return {wrap, arena:wrap.querySelector('#arena')};
}
function fbEl(){ const d=document.createElement('div'); d.className='fb'; return d; }
function showFb(el,good,txt){ el.className='fb show '+(good?'good':'bad'); el.textContent=txt; }
function hideFb(el){ el.className='fb'; }
function winBtn(arena,onWin){
  const b=document.createElement('button'); b.className='btn full green'; b.style.marginTop='14px';
  b.textContent='ПРОЙДЕНО! ДАЛЕЕ >';
  b.onclick=()=>{ Chip.play('levelup'); onWin(); };
  arena.appendChild(b);
}

const GAME_FN = { order:gameOrder, build:gameSlots, match:gameSlots, calc:gameCalc, sprint:gameSprint, expert:gameExpert };
