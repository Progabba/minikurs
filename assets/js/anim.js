/* ===== anim.js — пиксельные canvas-анимации по темам ===== */
/* Каждая сцена рисуется на canvas в стиле NES. Возвращает stop(). */

const PAL = {
  black:'#0d0b16', navy:'#14122a', navy2:'#1c1a3a',
  blue:'#3cbcfc', blue2:'#0078f8', red:'#f83800', red2:'#e40058',
  green:'#00b800', green2:'#58f898', yellow:'#f8d800', gold:'#fca044',
  white:'#fcfcfc', gray:'#7c7c7c', purple:'#6844fc', brown:'#a44200', skin:'#fcd8a8'
};

function mkCanvas(host, w, h){
  const c=document.createElement('canvas');
  c.width=w; c.height=h;
  c.style.cssText='width:100%;height:auto;display:block;image-rendering:pixelated;border:4px solid '+PAL.white+';box-shadow:0 0 0 4px '+PAL.black+';background:'+PAL.black;
  host.appendChild(c);
  return {c, x:c.getContext('2d')};
}
function px(x, X,Y,W,H, col){ x.fillStyle=col; x.fillRect(X|0,Y|0,W|0,H|0); }
// пиксельный текст-заглушка (мелкие блоки) не нужен — используем fillText с моно
function label(x, text, X, Y, col, size){ x.fillStyle=col; x.font=(size||8)+"px 'Press Start 2P', monospace"; x.textBaseline='top'; x.fillText(text, X, Y); }
function labelC(x, text, cx, Y, col, size){ x.fillStyle=col; x.font=(size||8)+"px 'Press Start 2P', monospace"; x.textAlign='center'; x.textBaseline='top'; x.fillText(text, cx, Y); x.textAlign='left'; }

const REDUCE_A = matchMedia('(prefers-reduced-motion:reduce)').matches;

function runScene(host, key){
  host.innerHTML='';
  const W=320, H=180;
  const {c,x}=mkCanvas(host, W, H);
  let t=0, raf=null, stopped=false;
  const draw = SCENE_FN[key] || SCENE_FN.a1;
  function loop(){
    if(stopped) return;
    x.clearRect(0,0,W,H);
    draw(x, t, W, H);
    t++;
    raf=requestAnimationFrame(loop);
  }
  if(REDUCE_A){ draw(x, 30, W, H); }
  else loop();
  return ()=>{ stopped=true; cancelAnimationFrame(raf); };
}

/* ---------- helpers ---------- */
function electron(x, X, Y, col){ px(x, X-2,Y-2,4,4, col||PAL.yellow); px(x,X-1,Y-3,2,1,PAL.white); }
function flowDots(x, x0,y0,x1,y1, t, speed, col, n){
  n=n||3;
  for(let i=0;i<n;i++){
    let f=((t*speed + i/n)%1);
    electron(x, x0+(x1-x0)*f, y0+(y1-y0)*f, col);
  }
}
function bolt(x, X, Y, len, t){
  x.strokeStyle=PAL.yellow; x.lineWidth=2; x.beginPath();
  let yy=Y; x.moveTo(X,yy);
  for(let i=0;i<4;i++){ X += (i%2? 6:-6); yy+=len/4; x.lineTo(X,yy); }
  x.stroke();
  // мерцание
  if(t%6<3){ x.strokeStyle=PAL.white; x.stroke(); }
}

/* ================= СЦЕНЫ ================= */
const SCENE_FN = {

/* 1-1 конвейер стадий проекта */
a1(x,t,W,H){
  px(x,0,0,W,H,PAL.navy);
  // конвейерная лента
  px(x,0,120,W,20,PAL.gray);
  for(let i=0;i<W;i+=16){ px(x,(i - (t*1.5)%16)|0,120,8,20,PAL.navy2); }
  const stages=['ТУ','П','ЭКС','Р','МОН'];
  const cols=[PAL.blue,PAL.yellow,PAL.gold,PAL.green2,PAL.green];
  // движущиеся ящики-документы
  for(let i=0;i<5;i++){
    let bx = ((t*0.8 + i*70) % (W+60)) - 40;
    px(x,bx,92,28,26,PAL.white);
    px(x,bx+2,94,24,22,cols[i]);
    labelC(x, stages[i], bx+14, 100, PAL.black, 7);
  }
  labelC(x,'КОНВЕЙЕР ПРОЕКТА', W/2, 14, PAL.yellow, 9);
  labelC(x,'ЗАДАНИЕ -> П -> ЭКСПЕРТИЗА -> Р -> МОНТАЖ', W/2, 40, PAL.blue, 6);
  // рука-кран сверху опускается
  let cy=50+Math.sin(t*0.06)*8;
  px(x,W/2-2,30,4,cy-30,PAL.gray); px(x,W/2-10,cy,20,8,PAL.red);
},

/* 1-2 щит: ток течёт, КЗ на розетках -> отключение группы */
a2(x,t,W,H){
  px(x,0,0,W,H,PAL.navy);
  labelC(x,'ОДНОЛИНЕЙНАЯ СХЕМА', W/2, 8, PAL.yellow, 9);
  // ввод сверху
  const busY=70;
  px(x,30,28,16,10,PAL.white); px(x,32,30,12,6,PAL.blue); label(x,'ВВОД',52,28,PAL.gray,6);
  // вертикаль ввода к шине
  px(x,36,38,3,busY-38,PAL.gray);
  flowDots(x,37,38,37,busY,t,0.01,PAL.yellow,2);
  // шина
  px(x,30,busY,220,5,PAL.gray);
  // три группы
  const grp=[{x:70,c:PAL.blue,n:'СВЕТ'},{x:140,c:PAL.yellow,n:'РОЗ'},{x:210,c:PAL.blue,n:'ПЛИТА'}];
  const fault = (t%240)>120; // периодическое КЗ на розетках
  grp.forEach((g,i)=>{
    const off = (i===1 && fault);
    px(x,g.x-3,busY+5,3,30,off?PAL.red:PAL.gray);
    px(x,g.x-12,busY+35,24,14,PAL.white);
    px(x,g.x-10,busY+37,20,10, off?PAL.red2 : g.c);
    labelC(x,g.n,g.x,busY+70,off?PAL.red:PAL.gray,6);
    // ток по группе (если не отключена)
    if(!off) flowDots(x,g.x-1,busY+5,g.x-1,busY+35,t,0.012,PAL.yellow,1);
    // прибор снизу
    px(x,g.x-6,busY+52,12,12, off?PAL.navy2:g.c);
  });
  // ток по шине
  if(true) flowDots(x,30,busY+2,250,busY+2,t,0.006,PAL.yellow,4);
  if(fault){
    // искра КЗ
    if(t%8<4){ bolt(x,140,busY+50,16,t); }
    labelC(x,'КЗ! ОТКЛЮЧИЛАСЬ ТОЛЬКО ГРУППА РОЗЕТОК', W/2, 158, PAL.red, 6);
  } else {
    labelC(x,'СЕЛЕКТИВНОСТЬ: НОМИНАЛЫ РАСТУТ К ВВОДУ', W/2, 158, PAL.green2, 6);
  }
},

/* 1-3 нагрев кабеля: тонкий греется, толстый ок */
a3(x,t,W,H){
  px(x,0,0,W,H,PAL.navy);
  labelC(x,'СЕЧЕНИЕ РЕШАЕТ', W/2, 10, PAL.yellow, 9);
  // тонкий кабель
  label(x,'1.5 mm2  Iдоп 19А < 24А',30,40,PAL.gray,6);
  const heat = (Math.sin(t*0.08)+1)/2; // 0..1
  const hr = Math.floor(90+heat*160);
  px(x,30,52,200,6, `rgb(${hr},${Math.floor(120-heat*100)},${Math.floor(150-heat*140)})`);
  // волны жара
  if(heat>0.5){ for(let i=0;i<5;i++){ const wx=50+i*40; const wy=48-((t+i*7)%14); px(x,wx,wy,2,4,PAL.red); } }
  labelC(x, heat>0.6?'ПЕРЕГРЕВ! ОГОНЬ!':'греется...', 260, 50, PAL.red, 6);
  // толстый кабель
  label(x,'6 mm2  Iдоп 46А > 24А',30,95,PAL.gray,6);
  px(x,30,107,200,12,PAL.blue2);
  flowDots(x,30,113,230,113,t,0.01,PAL.yellow,4);
  labelC(x,'ОК', 260, 106, PAL.green2, 7);
  // формула
  labelC(x,'I = P / (U x cosф)', W/2, 140, PAL.blue, 7);
  labelC(x,'Iрасч <= Iавт <= Iдоп кабеля', W/2, 158, PAL.green2, 6);
},

/* 2-1 кабели по ТИПУ ЗДАНИЯ */
a4(x,t,W,H){
  px(x,0,0,W,H,PAL.navy);
  labelC(x,'МАРКА КАБЕЛЯ = ТИП ЗДАНИЯ', W/2, 8, PAL.yellow, 8);
  const items=[
    {b:'ЖИЛЬЁ/ОФИС', m:'нг(А)-LS', c:PAL.blue},
    {b:'ТЦ/ВОКЗАЛ/МЕТРО', m:'нг(А)-HF', c:PAL.green2},
    {b:'ДЕТСАД/ШКОЛА/БОЛЬН.', m:'+ LTx', c:PAL.gold},
    {b:'ПОЖ.СИСТЕМЫ (АПС/СОУЭ)', m:'нг(А)-FRLS', c:PAL.red}
  ];
  const active = Math.floor(t/60)%4;
  items.forEach((it,i)=>{
    const y=32+i*34; const on=(i===active);
    // домик-иконка
    px(x,24,y,20,20, on?it.c:PAL.navy2);
    px(x,22,y-6,24,8, on?PAL.gray:PAL.navy2); // крыша
    px(x,30,y+8,8,12, PAL.black); // дверь
    label(x,it.b, 54, y-2, on?PAL.white:PAL.gray, 6);
    label(x,'-> '+it.m, 54, y+10, on?it.c:PAL.gray, 7);
    // бегущий кабель к домику при активности
    if(on){ flowDots(x,W-20,y+10,50,y+10,t,0.02,it.c,3); px(x,W-24,y+2,16,16,it.c); }
  });
},

/* 2-2 молния уходит в землю через токоотвод */
a5(x,t,W,H){
  // небо-градиент имитация
  px(x,0,0,W,90,PAL.navy2);
  px(x,0,90,W,H-90,'#0a1a10');
  labelC(x,'МОЛНИЯ УХОДИТ В ЗЕМЛЮ', W/2, 8, PAL.yellow, 8);
  // туча
  px(x,60,24,80,16,PAL.gray); px(x,80,18,50,12,PAL.white);
  // дом
  px(x,120,90,70,50,PAL.navy); px(x,120,90,70,4,PAL.blue);
  px(x,110,90,90,-24,PAL.navy2);
  // молниеприёмник (штырь)
  px(x,153,60,3,30,PAL.gray);
  // молния бьёт периодически
  const strike = (t%120)<20;
  if(strike){ x.strokeStyle=PAL.yellow; x.lineWidth=3; x.beginPath();
    let X=110,Y=40; x.moveTo(X,Y);
    for(let i=0;i<3;i++){ X+=(i%2?14:-6); Y+=8; x.lineTo(X,Y);} x.lineTo(154,60); x.stroke();
    if(t%4<2){ x.strokeStyle=PAL.white; x.stroke(); }
  }
  // токоотвод вниз + заземлитель
  px(x,153,90,3,50,PAL.gold);
  if(strike) flowDots(x,154,60,154,150,t,0.05,PAL.yellow,4);
  px(x,140,150,30,4,PAL.gold);
  px(x,145,156,20,3,PAL.gold); px(x,150,161,10,3,PAL.gold);
  labelC(x,'приёмник -> токоотвод -> заземлитель  <=4 Ом', W/2, 168, PAL.green2, 6);
},

/* 2-3 свет: лампы зажигаются, растут люксы */
a6(x,t,W,H){
  px(x,0,0,W,H,'#05040a');
  labelC(x,'СВЕТ ПО НОРМАМ (лк)', W/2, 8, PAL.yellow, 8);
  // комната
  px(x,40,40,240,110,PAL.navy);
  px(x,40,40,240,4,PAL.gray);
  const phase=Math.floor(t/70)%3;
  const lampsOn = phase>=1?2 : 1;
  const lux = phase===0?150 : phase===1?300 : 1;
  // лампы + конус
  const lampX = lampsOn===1?[160]:[100,220];
  lampX.forEach(lx=>{
    px(x,lx-8,44,16,6,PAL.gold);
    // конус света
    x.fillStyle='rgba(248,216,0,0.15)';
    x.beginPath(); x.moveTo(lx,50); x.lineTo(lx-40,140); x.lineTo(lx+40,140); x.closePath(); x.fill();
    px(x,lx-3,50,6,4,PAL.white);
  });
  if(phase===2){
    // аварийка: темно + выход
    px(x,40,40,240,110,'rgba(5,4,10,0.6)');
    px(x,130,90,60,20,PAL.green); labelC(x,'ВЫХОД >',160,96,PAL.white,7);
    labelC(x,'АВАРИЙНОЕ: >=1 лк, кабель FRLS', W/2, 160, PAL.green2, 6);
  } else {
    labelC(x, (phase===0?'КОМНАТА 150 лк':'ОФИС 300 лк'), W/2, 160, PAL.gold, 7);
  }
  // люксметр
  px(x,W/2-24,132,48,16,PAL.black); px(x,W/2-24,132,48,16,PAL.navy2);
  labelC(x, lux+' лк', W/2, 134, PAL.yellow, 8);
},

/* 3-1 дракон-экспертиза сканирует лист */
a7(x,t,W,H){
  px(x,0,0,W,H,'#1a0a0a');
  labelC(x,'БОСС: ЭКСПЕРТ-ДРАКОН', W/2, 8, PAL.red, 8);
  // лист проекта
  px(x,40,40,90,110,PAL.white);
  for(let i=0;i<8;i++) px(x,48,50+i*12,74,3,PAL.gray);
  // луч сканера
  const sy=40+((t*1.2)%110);
  px(x,40,sy,90,3,PAL.blue);
  // дракон справа (пиксельный)
  const dx=200, dy=60+Math.sin(t*0.08)*6;
  px(x,dx,dy,60,50,PAL.red2);         // тело
  px(x,dx+50,dy-10,26,26,PAL.red);    // голова
  px(x,dx+68,dy-2,6,6,PAL.yellow);    // глаз
  px(x,dx+70,dy+10,14,4,PAL.gold);    // пасть
  px(x,dx-14,dy+6,18,10,PAL.red);     // крыло
  // огненное дыхание замечаний
  if(t%80<40){ for(let i=0;i<4;i++){ const fx=dx+74-(t%40); px(x,fx- i*10, dy+8+i*2, 6,3, i%2?PAL.gold:PAL.yellow); } }
  labelC(x,'НАЙДИ ВСЕ ОШИБКИ -> УДАР ПО БОССУ', W/2, 166, PAL.yellow, 6);
}
};
