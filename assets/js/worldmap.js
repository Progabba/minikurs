/* ===== worldmap.js — анимированная карта-мир (canvas) ===== */

const MAP_NODES = [
  {x:70,  y:300},
  {x:150, y:230},
  {x:235, y:290},
  {x:320, y:210},
  {x:400, y:270},
  {x:470, y:190},
  {x:540, y:120}
];

let _mapStop=null;
function renderWorldMap(host, {done, current, onPick}){
  if(_mapStop){ _mapStop(); _mapStop=null; }
  host.innerHTML='';
  const W=600, H=375;
  const c=document.createElement('canvas'); c.width=W; c.height=H;
  c.style.cssText='width:100%;height:auto;display:block;image-rendering:pixelated;border:4px solid #fcfcfc;box-shadow:0 0 0 4px #0d0b16;cursor:pointer';
  host.appendChild(c);
  const x=c.getContext('2d');
  let t=0, raf=null, stopped=false;

  // позиция героя: над текущим узлом; при движении интерполируем
  const cur = MAP_NODES[current] || MAP_NODES[0];
  const hero = {x:cur.x, y:cur.y-34, step:0};

  function isoBlock(X,Y,s,top,side,front){
    // псевдо-3D изометрический кубик
    x.fillStyle=top; x.beginPath();
    x.moveTo(X,Y-s*0.5); x.lineTo(X+s,Y); x.lineTo(X,Y+s*0.5); x.lineTo(X-s,Y); x.closePath(); x.fill();
    x.fillStyle=side; x.beginPath();
    x.moveTo(X-s,Y); x.lineTo(X,Y+s*0.5); x.lineTo(X,Y+s*0.5+s*0.7); x.lineTo(X-s,Y+s*0.7); x.closePath(); x.fill();
    x.fillStyle=front; x.beginPath();
    x.moveTo(X+s,Y); x.lineTo(X,Y+s*0.5); x.lineTo(X,Y+s*0.5+s*0.7); x.lineTo(X+s,Y+s*0.7); x.closePath(); x.fill();
  }

  function draw(){
    // небо
    const g=x.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#10306a'); g.addColorStop(0.55,'#3a6ea5'); g.addColorStop(0.56,'#0f7a3a'); g.addColorStop(1,'#0a5a2a');
    x.fillStyle=g; x.fillRect(0,0,W,H);
    // солнце
    x.fillStyle='#f8d800'; x.fillRect(520,30,34,34); x.fillStyle='#fca044'; x.fillRect(524,34,26,26);
    // облака (плывут)
    x.fillStyle='rgba(252,252,252,0.85)';
    for(let i=0;i<4;i++){
      let cx=((i*170 + t*0.3)% (W+80))-60, cy=40+i*22;
      x.fillRect(cx,cy,50,12); x.fillRect(cx+12,cy-8,30,10);
    }
    // холмы на заднем плане
    x.fillStyle='#0a5a2a';
    for(let i=0;i<5;i++){ let hx=i*140-40; x.beginPath(); x.arc(hx,H*0.56+10,60,Math.PI,0); x.fill(); }
    // тропа-пунктир между узлами
    for(let i=0;i<MAP_NODES.length-1;i++){
      const a=MAP_NODES[i], b=MAP_NODES[i+1];
      const reached=done[i];
      x.strokeStyle=reached?'#fcfcfc':'#3a3a5a'; x.lineWidth=5; x.setLineDash([5,9]); x.lineDashOffset=-(t*0.6);
      x.beginPath(); x.moveTo(a.x,a.y); x.lineTo(b.x,b.y); x.stroke();
    }
    x.setLineDash([]);
    // узлы уровней как изо-блоки
    MAP_NODES.forEach((n,i)=>{
      const isDone=done[i], isCur=i===current, locked=i>0 && !done[i-1] && !done[i];
      let top,side,front;
      if(isDone){ top='#58f898'; side='#00b800'; front='#0a7a3a'; }
      else if(locked){ top='#9c9c9c'; side='#5c5c5c'; front='#3c3c3c'; }
      else { top='#3cbcfc'; side='#0078f8'; front='#0050b0'; }
      const pop = isCur? Math.sin(t*0.1)*3 : 0;
      isoBlock(n.x, n.y-pop, 20, top, side, front);
      // подсветка текущего
      if(isCur){ x.strokeStyle='#f8d800'; x.lineWidth=2; x.setLineDash([3,3]); x.lineDashOffset=-(t); 
        x.strokeRect(n.x-24,n.y-26,48,44); x.setLineDash([]); }
      // номер/галка
      x.fillStyle=isDone?'#0d0b16':'#fcfcfc'; x.font="10px 'Press Start 2P', monospace"; x.textAlign='center';
      x.fillText(isDone?'V':(locked?'X':String(i+1)), n.x, n.y+4);
      // код уровня
      x.fillStyle='#fcfcfc'; x.font="8px 'Press Start 2P', monospace";
      x.fillText(WORLDS[i].code, n.x, n.y+30);
      // флажок на пройденных
      if(isDone){ x.fillStyle='#f83800'; x.fillRect(n.x+14,n.y-30,12,8); x.fillStyle='#7c7c7c'; x.fillRect(n.x+13,n.y-30,2,16); }
      x.textAlign='left';
    });
    // герой над текущим узлом (шагает на месте)
    drawHero(x, hero.x, hero.y + (Math.floor(t/8)%2?0:-2), t);
    // подсказка
    x.fillStyle='#fcfcfc'; x.font="8px 'Press Start 2P', monospace"; x.textAlign='center';
    if(Math.floor(t/20)%2) x.fillText('^ ВЫБЕРИ СВЕТЯЩИЙСЯ УРОВЕНЬ', W/2, H-14);
    x.textAlign='left';
  }

  function loop(){ if(stopped)return; draw(); t++; raf=requestAnimationFrame(loop); }
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){ draw(); } else loop();

  // клики по узлам
  c.onclick=(e)=>{
    const r=c.getBoundingClientRect();
    const mx=(e.clientX-r.left)*(W/r.width), my=(e.clientY-r.top)*(H/r.height);
    MAP_NODES.forEach((n,i)=>{
      if(Math.abs(mx-n.x)<26 && Math.abs(my-n.y)<28){
        const locked=i>0 && !done[i-1] && !done[i];
        if(locked){ Chip.play('wrong'); return; }
        Chip.play('coin'); onPick(i);
      }
    });
  };
  _mapStop=()=>{ stopped=true; cancelAnimationFrame(raf); };
  return _mapStop;
}

function drawHero(x, X, Y, t){
  // тень
  x.fillStyle='rgba(0,0,0,0.3)'; x.fillRect(X-8,Y+18,16,3);
  // ноги (анимация шага)
  const sw=(Math.floor(t/8)%2)?2:-2;
  x.fillStyle='#0d0b16'; x.fillRect(X-5,Y+12,4,6); x.fillRect(X+1+sw,Y+12,4,6);
  // тело
  x.fillStyle='#0078f8'; x.fillRect(X-6,Y+2,12,12);
  x.fillStyle='#3cbcfc'; x.fillRect(X-5,Y,10,6);
  // лицо
  x.fillStyle='#fcd8a8'; x.fillRect(X-4,Y-6,8,6);
  x.fillStyle='#0d0b16'; x.fillRect(X-2,Y-4,2,2); x.fillRect(X+2,Y-4,2,2);
  // каска
  x.fillStyle='#f8d800'; x.fillRect(X-6,Y-10,12,5);
  x.fillStyle='#fca044'; x.fillRect(X-4,Y-12,8,3);
  // молния в руке
  x.strokeStyle='#f8d800'; x.lineWidth=2; x.beginPath();
  x.moveTo(X+8,Y); x.lineTo(X+5,Y+5); x.lineTo(X+9,Y+5); x.lineTo(X+6,Y+11); x.stroke();
}
