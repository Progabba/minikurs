/* ===== worldmap.js — карта-мир как в Марио ===== */

/* координаты узлов на карте (в % от 1000x625 viewBox) */
const MAP_NODES = [
  {x:110, y:470}, // 1-1
  {x:250, y:380}, // 1-2
  {x:400, y:460}, // 1-3
  {x:540, y:330}, // 2-1
  {x:670, y:430}, // 2-2
  {x:800, y:300}, // 2-3
  {x:900, y:180}  // 3-1
];

function renderWorldMap(host, {done, current, onPick}){
  const W=1000, H=625;
  const parts=[];

  // фон: холмы, облака, звёзды пиксельные
  parts.push(`
    <rect x="0" y="0" width="${W}" height="${H}" fill="#0a1a3a"/>
    <rect x="0" y="0" width="${W}" height="250" fill="#10306a"/>
    ${[120,300,520,760,880].map((cx,i)=>`
      <g fill="#1c2a5a" opacity="0.8">
        <rect x="${cx}" y="${40+i*12}" width="70" height="16"/>
        <rect x="${cx-12}" y="${52+i*12}" width="94" height="14"/>
      </g>`).join('')}
    ${[80,200,340,470,600,730,860,960].map((x,i)=>`<rect x="${x}" y="${20+((i*37)%120)}" width="4" height="4" fill="#fcfcfc" opacity="0.7"/>`).join('')}
    <!-- земля -->
    <rect x="0" y="250" width="${W}" height="${H-250}" fill="#0f7a3a"/>
    <rect x="0" y="250" width="${W}" height="18" fill="#58f898"/>
    ${[60,180,320,460,610,760,900].map((x,i)=>`
      <g fill="#0a5a2a"><rect x="${x}" y="${300+((i*53)%180)}" width="40" height="40"/>
      <rect x="${x-8}" y="${312+((i*53)%180)}" width="56" height="28"/></g>`).join('')}
  `);

  // тропинки-пунктир между узлами
  for(let i=0;i<MAP_NODES.length-1;i++){
    const a=MAP_NODES[i], b=MAP_NODES[i+1];
    const reached = done[i]; // путь открыт, если пройден предыдущий
    parts.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"
       stroke="${reached?'#fcfcfc':'#3a3a5a'}" stroke-width="6" stroke-dasharray="4 10" stroke-linecap="round"/>`);
  }

  // узлы
  MAP_NODES.forEach((n,i)=>{
    const isDone=done[i], isCurrent=i===current, locked = i>0 && !done[i-1] && !done[i];
    const col = isDone ? '#58f898' : (isCurrent ? '#f8d800' : (locked?'#7c7c7c':'#3cbcfc'));
    const label = WORLDS[i].code;
    parts.push(`
      <g class="mapnode ${isCurrent?'current':''} ${locked?'locked':''}" data-i="${i}">
        <circle class="halo" cx="${n.x}" cy="${n.y}" r="34" fill="none" stroke="#f8d800" stroke-width="3"/>
        <rect x="${n.x-22}" y="${n.y-22}" width="44" height="44" fill="#14122a" stroke="${col}" stroke-width="4"/>
        <rect x="${n.x-14}" y="${n.y-14}" width="28" height="28" fill="${col}" opacity="${isDone?1:0.85}"/>
        ${isDone?`<text x="${n.x}" y="${n.y+7}" text-anchor="middle" font-family="'Press Start 2P',monospace" font-size="18" fill="#0d0b16">✓</text>`
                :`<text x="${n.x}" y="${n.y+6}" text-anchor="middle" font-family="'Press Start 2P',monospace" font-size="12" fill="${locked?'#0d0b16':'#0d0b16'}">${locked?'🔒'.length?'':'':''}${i+1}</text>`}
        <text x="${n.x}" y="${n.y+40}" text-anchor="middle" font-family="'Press Start 2P',monospace" font-size="9" fill="#fcfcfc">${label}</text>
      </g>`);
  });

  // спрайт игрока над текущим узлом
  const cur=MAP_NODES[current] || MAP_NODES[0];
  parts.push(playerSprite(cur.x, cur.y-46));

  host.innerHTML = `<div id="worldmap"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${parts.join('')}</svg>
    <div class="map-hint"><span class="blink">▲</span> Выбери светящийся уровень</div></div>`;

  host.querySelectorAll('.mapnode').forEach(node=>{
    const i=+node.dataset.i;
    const locked = i>0 && !done[i-1] && !done[i];
    if(locked){ node.onclick=()=>Chip.play('wrong'); return; }
    node.onclick=()=>{ Chip.play('coin'); onPick(i); };
  });
}

/* пиксельный спрайт героя-искры (каска + молния) */
function playerSprite(x,y){
  return `<g class="player-sprite" transform="translate(${x-16},${y-16})">
    <!-- тело -->
    <rect x="10" y="14" width="12" height="12" fill="#3cbcfc"/>
    <rect x="8" y="16" width="16" height="8" fill="#0078f8"/>
    <!-- каска -->
    <rect x="8" y="6" width="16" height="8" fill="#f8d800"/>
    <rect x="10" y="3" width="12" height="4" fill="#fca044"/>
    <!-- лицо -->
    <rect x="11" y="9" width="10" height="5" fill="#fcd8a8"/>
    <rect x="13" y="10" width="2" height="2" fill="#0d0b16"/>
    <rect x="17" y="10" width="2" height="2" fill="#0d0b16"/>
    <!-- ноги -->
    <rect x="10" y="26" width="4" height="5" fill="#0d0b16"/>
    <rect x="18" y="26" width="4" height="5" fill="#0d0b16"/>
    <!-- молния в руке -->
    <path d="M25 14 l-4 6 h3 l-3 6" stroke="#f8d800" stroke-width="2" fill="none"/>
  </g>`;
}
