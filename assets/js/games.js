/* ===== games.js — интерактивы-игры ===== */

/* --- И1: собери путь проекта --- */
function gameOrder(host,i){
  const STAGES=['Задание + ТУ','Стадия «П»','Экспертиза','Стадия «Р»','Монтаж и надзор'];
  let pos=0,mist=0;
  const c=document.createElement('div');c.className='game';
  c.innerHTML=`<div class="ghead"><div class="gtitle">🧩 Собери путь проекта</div><div class="gscore" id="gs">ошибок: 0</div></div>
   <p class="gsub">Нажимай этапы в правильном порядке — от старта до стройки.</p>
   <div class="seq" id="seq"></div><div class="pillrow" id="tray"></div><div class="gfb" id="gfb"></div>`;
  host.appendChild(c);
  const tray=c.querySelector('#tray'),seq=c.querySelector('#seq'),gs=c.querySelector('#gs'),fb=c.querySelector('#gfb');
  [...STAGES].map((t,k)=>({t,k})).sort(()=>Math.random()-.5).forEach(o=>{
    const b=document.createElement('button');b.className='pill';b.textContent=o.t;
    b.onclick=()=>{if(o.k===pos){b.classList.add('right','used');
        const tk=document.createElement('span');tk.className='tok';tk.textContent=(pos+1)+'. '+o.t;seq.appendChild(tk);pos++;
        if(pos===STAGES.length){fb.className='gfb show good';
          fb.innerHTML=mist===0?'<b>Безупречно!</b> Жизненный цикл проекта собран без единой ошибки.':'Готово! Ошибок: '+mist+'. Теперь порядок точно не забудешь.';
          host.appendChild(completeBtn(i));}}
      else{mist++;gs.textContent='ошибок: '+mist;b.classList.add('wrongp');setTimeout(()=>b.classList.remove('wrongp'),450);}};
    tray.appendChild(b);});
}

/* --- И2: собери щит --- */
function gamePanel(host,i){
  const SLOTS=[{l:'Ввод в квартиру',a:'АВ 40 А (вводной)'},{l:'Учёт электроэнергии',a:'Счётчик'},
    {l:'Группа розеток',a:'АВ 16 А + УЗО 30 мА'},{l:'Группа освещения',a:'АВ 10 А'},{l:'Электроплита',a:'АВ 32 А (отд. линия)'}];
  const PARTS=[...SLOTS.map(s=>s.a)].sort(()=>Math.random()-.5);
  let active=-1,mist=0,placed=0;
  const c=document.createElement('div');c.className='game';
  c.innerHTML=`<div class="ghead"><div class="gtitle">🛠 Собери щит</div><div class="gscore" id="gs">ошибок: 0</div></div>
   <p class="gsub">Выбери место в щите, затем — правильный аппарат из лотка.</p>
   <div class="slots" id="slots">${SLOTS.map((s,k)=>`<div class="slot" data-k="${k}"><span class="sl">${s.l}</span><span class="sv">— пусто —</span></div>`).join('')}</div>
   <div class="pillrow" id="tray">${PARTS.map(p=>`<button class="pill" data-p="${p}">${p}</button>`).join('')}</div>
   <div class="gfb" id="gfb"></div>`;
  host.appendChild(c);
  const slots=[...c.querySelectorAll('.slot')],gs=c.querySelector('#gs'),fb=c.querySelector('#gfb');
  slots.forEach(s=>s.onclick=()=>{if(s.classList.contains('ok'))return;
    slots.forEach(x=>x.classList.remove('active'));s.classList.add('active');active=+s.dataset.k;});
  c.querySelectorAll('#tray .pill').forEach(b=>b.onclick=()=>{
    if(active<0){fb.className='gfb show bad';fb.textContent='Сначала выбери место в щите.';return;}
    const need=SLOTS[active].a;
    if(b.dataset.p===need){const s=slots[active];s.classList.remove('active');s.classList.add('ok');
      s.querySelector('.sv').textContent=need;b.classList.add('used');active=-1;placed++;fb.className='gfb';
      if(placed===SLOTS.length){fb.className='gfb show good';
        fb.innerHTML=(mist===0?'<b>Щит собран идеально!</b> ':'Щит собран! Ошибок: '+mist+'. ')+'Логика: розетки — всегда с УЗО 30 мА, мощная техника — отдельной линией.';
        host.appendChild(completeBtn(i));}}
    else{mist++;gs.textContent='ошибок: '+mist;b.classList.add('wrongp');setTimeout(()=>b.classList.remove('wrongp'),450);}});
}

/* --- И3: инженерный тренажёр + песочница --- */
const AMPTAB=[[1.5,19],[2.5,27],[4,38],[6,46],[10,70],[16,85],[25,115]];
const BRKROW=[6,10,16,20,25,32,40,50,63];
function engCalc(P,ph,L,mat){
  const cos=.95,U=ph===1?220:380;
  const I=ph===1?P*1000/(U*cos):P*1000/(1.732*U*cos);
  const tab=mat==='cu'?AMPTAB:AMPTAB.map(([s,a])=>[s,Math.round(a*.77)]);
  const rho=mat==='cu'?0.0175:0.0283,k=ph===1?2:1.732;
  let ch=null;
  for(const[S,Id]of tab){if(Id>=I){const du=(k*I*L*rho/S)/U*100;if(du<=5){ch={S,Id,du};break;}}}
  if(!ch){const l=tab[tab.length-1];ch={S:l[0],Id:l[1],du:(k*I*L*rho/l[0])/U*100};}
  const brk=BRKROW.find(b=>b>=I&&b<=ch.Id)||null;
  return{I,S:ch.S,Id:ch.Id,du:ch.du,brk};
}
function gameSizing(host,i){
  const TASKS=[
    {t:'Розеточная группа кухни: 3,5 кВт, 1 фаза, медь, 18 м. Какое сечение заложить?',P:3.5,ph:1,L:18,mat:'cu',opts:[1.5,2.5,4],
     exp:'I ≈ 16,7 А. 1,5 мм² (19 А) — впритык и не согласуется с защитой; берём 2,5 мм² (27 А). Для розеток по СП — АВ 16 А: запас в обе стороны.'},
    {t:'Электроплита 7 кВт, 1 фаза, медь, 12 м. Сечение?',P:7,ph:1,L:12,mat:'cu',opts:[2.5,4,6],
     exp:'I ≈ 33,5 А. У 4 мм² Iдоп 38 А, но стандартный АВ 32 А < 33,5 А — не защитит режим. Правильно 6 мм² (46 А) с АВ 40 А.'},
    {t:'Мастерская: 12 кВт, 3 фазы, медь, 40 м. Сечение фазной жилы?',P:12,ph:3,L:40,mat:'cu',opts:[2.5,4,6],
     exp:'I ≈ 19,2 А на фазу — три фазы делят нагрузку! 2,5 мм² (27 А) проходит и по ΔU (≈1,9%). Вот зачем большим мощностям 380 В.'}];
  let r=0,score=0;
  const c=document.createElement('div');c.className='game';host.appendChild(c);
  function round(){
    const T=TASKS[r];
    c.innerHTML=`<div class="ghead"><div class="gtitle">⚙️ Инженерный тренажёр</div><div class="gscore">задача ${r+1}/3 · очки ${score}</div></div>
     <p class="bigq">${T.t}</p><div class="pillrow">${T.opts.map(o=>`<button class="pill" data-o="${o}">${o} мм²</button>`).join('')}</div><div class="gfb" id="gfb"></div>`;
    const fb=c.querySelector('#gfb'),res=engCalc(T.P,T.ph,T.L,T.mat);
    c.querySelectorAll('.pill').forEach(b=>b.onclick=()=>{
      c.querySelectorAll('.pill').forEach(x=>x.style.pointerEvents='none');
      const ok=+b.dataset.o===res.S;
      if(ok){b.classList.add('right');score++;}
      else{b.classList.add('wrongp');[...c.querySelectorAll('.pill')].find(x=>+x.dataset.o===res.S).classList.add('right');}
      fb.className='gfb show '+(ok?'good':'bad');
      fb.innerHTML=`<b>${ok?'Верно!':'Правильный ответ: '+res.S+' мм².'}</b> ${T.exp}<br><span style="color:var(--muted);font-size:12.5px">Расчёт: I = ${res.I.toFixed(1)} А · Iдоп ${res.Id} А · ΔU ${res.du.toFixed(1)}% · АВ ${res.brk||'—'} А</span>`;
      const nx=document.createElement('button');nx.className='btn btn-ghost';nx.style.marginTop='14px';
      nx.textContent=r<2?'Следующая задача →':'Итог + песочница';
      nx.onclick=()=>{r++;r<3?round():sandbox();};c.appendChild(nx);});}
  function sandbox(){
    c.innerHTML=`<div class="ghead"><div class="gtitle">⚙️ Итог: ${score}/3</div><div class="gscore">${score===3?'уровень: инженер ✦':'уровень: практикант'}</div></div>
     <p class="gsub">${score===3?'Ты чувствуешь связку ток→сечение→автомат. ':'Разбор выше — половина успеха. '}Теперь песочница — введи любые значения:</p>
     <div class="calc"><div class="row"><div class="f"><label>Мощность, кВт</label><input id="c_p" type="number" value="5" min="0.1" step="0.1"></div>
      <div class="f"><label>Сеть</label><select id="c_ph"><option value="1">1 фаза · 220 В</option><option value="3">3 фазы · 380 В</option></select></div></div>
     <div class="row"><div class="f"><label>Длина, м</label><input id="c_l" type="number" value="20" min="1"></div>
      <div class="f"><label>Материал</label><select id="c_mat"><option value="cu">Медь</option><option value="al">Алюминий</option></select></div></div>
     <div class="out"><div class="o"><small>Ток</small><b id="o_i">—</b></div><div class="o"><small>Сечение</small><b id="o_s">—</b></div>
      <div class="o"><small>Автомат</small><b id="o_b">—</b></div><div class="o" id="o_du_box"><small>Потеря U</small><b id="o_du">—</b></div></div>
     <div class="load"><div class="ll"><span>Загрузка кабеля</span><span id="l_txt">—</span></div><div class="loadbar"><i id="l_bar"></i></div></div>
     <p class="disc">Учебное упрощение (прокладка в воздухе, cosφ 0,95, ΔU ≤ 5%). В проекте — ПУЭ гл. 1.3 с поправками на способ прокладки и группировку.</p></div>`;
    function upd(){
      const P=+c.querySelector('#c_p').value||0,ph=+c.querySelector('#c_ph').value,
            L=+c.querySelector('#c_l').value||0,mat=c.querySelector('#c_mat').value;
      const r2=engCalc(P,ph,L,mat);
      countTo(c.querySelector('#o_i'),r2.I,1,' А');
      c.querySelector('#o_s').textContent=r2.S+' мм²';
      c.querySelector('#o_b').textContent=(r2.brk||'—')+' А';
      countTo(c.querySelector('#o_du'),r2.du,1,' %');
      c.querySelector('#o_du_box').className='o '+(r2.du<=5?'ok':'warn');
      const load=Math.min(100,Math.round(r2.I/r2.Id*100));
      c.querySelector('#l_bar').style.width=load+'%';
      c.querySelector('#l_txt').textContent=load+'% · Iдоп '+r2.Id+' А';
      c.querySelector('#l_bar').style.background=load<70?'linear-gradient(90deg,#6fcf97,#8fd)':(load<90?'linear-gradient(90deg,#d8b877,#e0a35a)':'linear-gradient(90deg,#e08a7a,#e05a5a)');}
    c.querySelectorAll('input,select').forEach(e=>e.addEventListener('input',upd));upd();
    host.appendChild(completeBtn(i));}
  round();
}

/* --- И4: норма-спринт --- */
function gameSprint(host,i){
  const CARDS=[
    {q:'Кабель для СОУЭ (оповещение о пожаре)',o:['нг(А)-FRLS','нг(А)-HF','нг(А)-LS'],a:0},
    {q:'Кабель на пути эвакуации ТЦ',o:['нг(А)-LS','нг(А)-HF','ВВГ'],a:1},
    {q:'Допустимые длительные токи кабелей',o:['ГОСТ 31565','ПУЭ гл. 1.3','СП 76'],a:1},
    {q:'УЗО 30 мА на розеточные группы жилья',o:['СП 256 / ПУЭ 7.1','ГОСТ 21.613','ФЗ-384'],a:0},
    {q:'Состав проектной документации (стадия П)',o:['ПП РФ №87','СП 52','ГОСТ Р 50345'],a:0},
    {q:'Кабельные линии противопожарных систем',o:['СП 6.13130','СП 256','ГОСТ 32144'],a:0},
    {q:'Характеристики автоматов B/C/D',o:['ГОСТ Р 50345','ПУЭ гл. 7.1','СП 76'],a:0},
    {q:'Нормы освещённости помещений',o:['СП 52.13330','ПУЭ гл. 1.3','РД 34.21.122'],a:0}];
  let idx=0,score=0,combo=0,best=0,timeLeft=60,tint=null,finished=false;
  const deck=[...CARDS].sort(()=>Math.random()-.5);
  const c=document.createElement('div');c.className='game';host.appendChild(c);
  c.innerHTML=`<div class="ghead"><div class="gtitle">⚡ Норма-спринт</div><div class="gscore" id="gs">⏱ 60с · очки 0</div></div>
   <div class="combo" id="cmb"></div>
   <p class="gsub">60 секунд. Три верных подряд — комбо ×2. Какой документ / марка отвечает на вопрос?</p>
   <div class="timerbar"><i id="tb"></i></div><p class="bigq" id="bq"></p><div class="pillrow" id="pr"></div>`;
  const gs=c.querySelector('#gs'),tb=c.querySelector('#tb');
  function card(){
    if(idx>=deck.length){finish();return;}
    const C=deck[idx];c.querySelector('#bq').textContent=C.q;
    const pr=c.querySelector('#pr');
    pr.innerHTML=C.o.map((o,k)=>`<button class="pill" data-k="${k}">${o}</button>`).join('');
    pr.querySelectorAll('.pill').forEach(b=>b.onclick=()=>{
      if(finished)return;
      const ok=+b.dataset.k===C.a;
      if(ok){combo++;best=Math.max(best,combo);score+=combo>=3?2:1;b.classList.add('right');
        if(combo>=3){const cmb=c.querySelector('#cmb');cmb.textContent='COMBO ×2 🔥';cmb.classList.add('show');
          setTimeout(()=>cmb.classList.remove('show'),700);}}
      else{combo=0;b.classList.add('wrongp');pr.querySelectorAll('.pill')[C.a].classList.add('right');}
      gs.textContent=`⏱ ${timeLeft}с · очки ${score}`;
      pr.querySelectorAll('.pill').forEach(x=>x.style.pointerEvents='none');
      setTimeout(()=>{idx++;card();},650);});}
  card();
  tint=setInterval(()=>{timeLeft--;gs.textContent=`⏱ ${timeLeft}с · очки ${score}`;
    tb.style.width=(timeLeft/60*100)+'%';if(timeLeft<=0)finish();},1000);
  function finish(){
    if(finished)return;finished=true;clearInterval(tint);
    const rank=score>=9?'⚡ Нормоконтролёр':score>=6?'✦ Уверенный инженер':'Практикант — вернись к теории и попробуй ещё';
    c.innerHTML=`<div class="ghead"><div class="gtitle">⚡ Норма-спринт · финиш</div></div>
     <div style="text-align:center;padding:10px 0 4px">
      <div style="font-family:var(--serif);font-size:30px;color:var(--gold)">${score} очков</div>
      <p style="color:var(--muted);margin:6px 0 2px">лучшее комбо: ×${best} подряд</p>
      <p style="font-weight:700;margin:8px 0 0">${rank}</p></div>
     <button class="btn btn-ghost" id="rep" style="margin-top:14px">↻ Сыграть ещё раз</button>`;
    c.querySelector('#rep').onclick=()=>{host.innerHTML='';gameSprint(host,i);};
    host.appendChild(completeBtn(i));}
}

/* --- И5: защити дом (match) --- */
function gameProtect(host,i){
  const SLOTS=[
    {l:'Фаза пробила на корпус бойлера',a:'PE-проводник + УЗО 30 мА'},
    {l:'Гроза: прямой удар в кровлю',a:'Молниеприёмник + токоотвод'},
    {l:'Разные потенциалы ванны и труб',a:'Дополнительная СУП'},
    {l:'Ввод в здание: PEN приходит от ВЛ',a:'Разделение PEN → PE + N (TN-C-S)'}];
  const PARTS=[...SLOTS.map(s=>s.a)].sort(()=>Math.random()-.5);
  let active=-1,mist=0,placed=0;
  const c=document.createElement('div');c.className='game';
  c.innerHTML=`<div class="ghead"><div class="gtitle">🛡 Защити дом</div><div class="gscore" id="gs">ошибок: 0</div></div>
   <p class="gsub">Подбери к каждой угрозе правильную меру защиты: выбери ситуацию, затем решение.</p>
   <div class="slots">${SLOTS.map((s,k)=>`<div class="slot" data-k="${k}"><span class="sl">${s.l}</span><span class="sv">— ? —</span></div>`).join('')}</div>
   <div class="pillrow" id="tray">${PARTS.map(p=>`<button class="pill" data-p="${p}">${p}</button>`).join('')}</div>
   <div class="gfb" id="gfb"></div>`;
  host.appendChild(c);
  const slots=[...c.querySelectorAll('.slot')],gs=c.querySelector('#gs'),fb=c.querySelector('#gfb');
  slots.forEach(s=>s.onclick=()=>{if(s.classList.contains('ok'))return;
    slots.forEach(x=>x.classList.remove('active'));s.classList.add('active');active=+s.dataset.k;});
  c.querySelectorAll('#tray .pill').forEach(b=>b.onclick=()=>{
    if(active<0){fb.className='gfb show bad';fb.textContent='Сначала выбери ситуацию.';return;}
    const need=SLOTS[active].a;
    if(b.dataset.p===need){const s=slots[active];s.classList.remove('active');s.classList.add('ok');
      s.querySelector('.sv').textContent=need;b.classList.add('used');active=-1;placed++;fb.className='gfb';
      if(placed===SLOTS.length){fb.className='gfb show good';
        fb.innerHTML=(mist===0?'<b>Дом защищён идеально!</b> ':'Дом защищён! Ошибок: '+mist+'. ')+'Запомни принцип: PE уводит ток, УЗО отключает, СУП уравнивает, молниеотвод перехватывает.';
        host.appendChild(completeBtn(i));}}
    else{mist++;gs.textContent='ошибок: '+mist;b.classList.add('wrongp');setTimeout(()=>b.classList.remove('wrongp'),450);}});
}

/* --- И6: нормировщик света (match) --- */
function gameLux(host,i){
  const SLOTS=[
    {l:'Лестничная площадка',a:'20 лк'},
    {l:'Коридор квартиры',a:'50 лк'},
    {l:'Жилая комната',a:'150 лк'},
    {l:'Офис с компьютерами',a:'300 лк'},
    {l:'Учебный класс',a:'400 лк'}];
  const PARTS=[...SLOTS.map(s=>s.a)].sort(()=>Math.random()-.5);
  let active=-1,mist=0,placed=0;
  const c=document.createElement('div');c.className='game';
  c.innerHTML=`<div class="ghead"><div class="gtitle">💡 Нормировщик света</div><div class="gscore" id="gs">ошибок: 0</div></div>
   <p class="gsub">Назначь каждому помещению нормируемую освещённость (СП 52.13330 / СанПиН): помещение → люксы.</p>
   <div class="slots">${SLOTS.map((s,k)=>`<div class="slot" data-k="${k}"><span class="sl">${s.l}</span><span class="sv">— ? —</span></div>`).join('')}</div>
   <div class="pillrow" id="tray">${PARTS.map(p=>`<button class="pill" data-p="${p}">${p}</button>`).join('')}</div>
   <div class="gfb" id="gfb"></div>`;
  host.appendChild(c);
  const slots=[...c.querySelectorAll('.slot')],gs=c.querySelector('#gs'),fb=c.querySelector('#gfb');
  slots.forEach(s=>s.onclick=()=>{if(s.classList.contains('ok'))return;
    slots.forEach(x=>x.classList.remove('active'));s.classList.add('active');active=+s.dataset.k;});
  c.querySelectorAll('#tray .pill').forEach(b=>b.onclick=()=>{
    if(active<0){fb.className='gfb show bad';fb.textContent='Сначала выбери помещение.';return;}
    const need=SLOTS[active].a;
    if(b.dataset.p===need){const s=slots[active];s.classList.remove('active');s.classList.add('ok');
      s.querySelector('.sv').textContent=need;b.classList.add('used');active=-1;placed++;fb.className='gfb';
      if(placed===SLOTS.length){fb.className='gfb show good';
        fb.innerHTML=(mist===0?'<b>Все нормы точно!</b> ':'Готово! Ошибок: '+mist+'. ')+'Чем точнее зрительная работа — тем выше люксы: от 20 лк на лестнице до 400 лк в классе.';
        host.appendChild(completeBtn(i));}}
    else{mist++;gs.textContent='ошибок: '+mist;b.classList.add('wrongp');setTimeout(()=>b.classList.remove('wrongp'),450);}});
}

/* --- И7: ты — эксперт --- */
function gameReview(host,i){
  const ROWS=[
    {t:'Путь эвакуации: кабель ВВГнг(А)-LS',bad:true,fb:'На путях эвакуации и в местах массового пребывания — безгалогенный нг(А)-HF (ГОСТ 31565, табл. 2).'},
    {t:'Розеточные группы: АВ 16 А + УЗО 30 мА',bad:false,fb:'Соответствует СП 256 и ПУЭ 7.1.79.'},
    {t:'Линия СОУЭ: кабель нг(А)-LS',bad:true,fb:'Противопожарные системы — огнестойкие линии нг(А)-FRLS/FRHF (СП 6.13130).'},
    {t:'Кабель 2,5 мм² (Iдоп 27 А) защищён АВ 32 А',bad:true,fb:'Автомат больше Iдоп кабеля — линия не защищена. Нужно Iном ≤ 27 А, т.е. АВ 25 А.'},
    {t:'Внутренние сети жилого дома — медные жилы',bad:false,fb:'Верно: внутренние сети жилых зданий выполняются медью (СП 256).'},
    {t:'Аварийное освещение на пути эвакуации: 1 лк, кабель нг(А)-FRLS',bad:false,fb:'Верно: ≥1 лк по СП 52.13330, питание огнестойкой линией по СП 6.13130.'},
    {t:'Групповая сеть санузлов выполнена по системе TN-C',bad:true,fb:'TN-C для групповых сетей запрещена — нужен отдельный PE (TN-C-S/TN-S, ПУЭ гл. 1.7, 7.1).'}];
  let checked=false;
  const c=document.createElement('div');c.className='game';
  c.innerHTML=`<div class="ghead"><div class="gtitle">🔍 Ты — эксперт</div><div class="gscore">найди 4 замечания</div></div>
   <p class="gsub">Перед тобой решения из проекта. Отметь ошибочные (⚠), корректные не трогай — затем «Выдать заключение».</p>
   <div class="sheet">${ROWS.map((r,k)=>`<div class="srowg" data-k="${k}"><div class="top"><span class="chk">⚠</span><span>${r.t}</span></div></div>`).join('')}</div>
   <button class="btn btn-ghost" id="check">Выдать заключение</button><div class="gfb" id="gfb"></div>`;
  host.appendChild(c);
  c.querySelectorAll('.srowg').forEach(r=>r.onclick=()=>{if(checked)return;r.classList.toggle('mark');});
  c.querySelector('#check').onclick=()=>{
    if(checked)return;checked=true;
    let hits=0,fp=0;
    c.querySelectorAll('.srowg').forEach(r=>{
      const k=+r.dataset.k,marked=r.classList.contains('mark'),bad=ROWS[k].bad;
      if(bad&&marked){hits++;r.classList.add('hitok');}
      else if(!bad&&marked){fp++;r.classList.add('hitbad');}
      else if(bad&&!marked){r.classList.add('missed');}
      const note=document.createElement('div');note.className='why';
      note.textContent=(bad?'⚠ ':'✓ ')+ROWS[k].fb;r.appendChild(note);});
    const fb=c.querySelector('#gfb');
    const perfect=hits===4&&fp===0;
    fb.className='gfb show '+(perfect?'good':'bad');
    fb.innerHTML=perfect?'<b>Заключение точное!</b> Все 4 замечания найдены, ложных нет. Экспертиза бы тобой гордилась.'
      :`Найдено замечаний: ${hits}/4${fp?', ложных: '+fp:''}. Разбор под каждым пунктом — так учатся видеть проект глазами эксперта.`;
    c.querySelector('#check').style.display='none';
    host.appendChild(completeBtn(i));};
}

const GAMES={order:gameOrder,panel:gamePanel,sizing:gameSizing,sprint:gameSprint,protect:gameProtect,lux:gameLux,review:gameReview};
