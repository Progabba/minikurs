/* ===== chiptune.js — 8-битный звук + мелодии для каждого уровня ===== */
const Chip = (function(){
  let ctx=null, master=null, enabled=true, musicTimer=null, musicOn=false, curTrack='map';

  function init(){
    if(ctx) return;
    ctx = new (window.AudioContext||window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.25;
    master.connect(ctx.destination);
  }
  function resume(){ if(ctx && ctx.state==='suspended') ctx.resume(); }

  function tone(freq, dur, type='square', vol=0.5, when=0){
    if(!ctx||!enabled) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0+0.008);
    g.gain.exponentialRampToValueAtTime(0.0008, t0+dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0+dur+0.02);
  }
  function noise(dur=0.15, vol=0.4){
    if(!ctx||!enabled) return;
    const buf = ctx.createBuffer(1, ctx.sampleRate*dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length);
    const src = ctx.createBufferSource(); src.buffer=buf;
    const g = ctx.createGain(); g.gain.value=vol;
    const f = ctx.createBiquadFilter(); f.type='highpass'; f.frequency.value=800;
    src.connect(f); f.connect(g); g.connect(master); src.start();
  }

  const N={C3:130.81,D3:146.83,E3:164.81,F3:174.61,G3:196,A3:220,B3:246.94,
    C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88,
    C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,A5:880,B5:987.77,
    C6:1046.5,D6:1174.7,E6:1318.5,G6:1568, R:0};

  const sfx = {
    select(){ tone(N.E5,0.06,'square',0.4); },
    move(){ tone(N.G5,0.05,'square',0.3); tone(N.C6,0.05,'square',0.3,0.05); },
    coin(){ tone(N.B5,0.07,'square',0.5); tone(N.E6,0.14,'square',0.5,0.07); },
    correct(){ tone(N.C5,0.08,'square',0.5); tone(N.E5,0.08,'square',0.5,0.08); tone(N.G5,0.16,'square',0.5,0.16); },
    wrong(){ tone(N.A3,0.12,'sawtooth',0.4); tone(N.E3,0.2,'sawtooth',0.4,0.1); noise(0.1,0.2); },
    powerup(){ [N.C5,N.E5,N.G5,N.C6,N.E6].forEach((n,i)=>tone(n,0.09,'square',0.45,i*0.06)); },
    levelup(){ [N.G4,N.C5,N.E5,N.G5,N.C6].forEach((n,i)=>tone(n,0.1,'square',0.5,i*0.08)); },
    start(){ [N.C5,N.C5,N.C5,N.G4,N.C5].forEach((n,i)=>tone(n,0.1,'square',0.5,i*0.11)); },
    hit(){ noise(0.12,0.3); tone(N.C3,0.15,'sawtooth',0.3); },
    tick(){ tone(N.G5,0.03,'square',0.2); },
    win(){ [N.C5,N.E5,N.G5,N.C6,N.G5,N.C6,N.E6,N.C6].forEach((n,i)=>tone(n,0.12,'square',0.5,i*0.13)); },
    combo(){ [N.E5,N.G5,N.C6].forEach((n,i)=>tone(n,0.06,'square',0.5,i*0.05)); }
  };

  /* ===== МЕЛОДИИ: [нота, длит]; у каждого трека свой темп/бас/форма ===== */
  const TRACKS = {
    // экран старта — героический марш
    start: { beat:0.20, wave:'square', lead:[
      ['C5',1],['C5',1],['G5',2],['E5',1],['C5',1],['G4',2],
      ['A4',1],['C5',1],['E5',2],['D5',1],['C5',1],['G4',2] ],
      bass:['C3','G3','A3','G3'] },
    // карта-мир — бодрый оверворлд
    map: { beat:0.19, wave:'square', lead:[
      ['E5',1],['G5',1],['A5',2],['G5',1],['E5',1],['C5',2],
      ['D5',1],['E5',1],['G5',2],['E5',1],['C5',1],['D5',3],['R',1] ],
      bass:['C3','C3','G3','G3','A3','A3','E3','G3'] },
    // 1-1 старт проекта — спокойный, светлый
    m1: { beat:0.22, wave:'triangle', lead:[
      ['C5',2],['E5',2],['G5',2],['E5',2],['F5',2],['E5',2],['D5',3],['R',1] ],
      bass:['C3','E3','F3','G3'] },
    // 1-2 замок щита — маршевый, чёткий
    m2: { beat:0.17, wave:'square', lead:[
      ['G4',1],['G4',1],['C5',1],['E5',1],['G5',2],['E5',1],['C5',1],
      ['D5',1],['D5',1],['G5',2],['E5',1],['C5',1] ],
      bass:['G3','G3','C3','C3'] },
    // 1-3 пещера расчёта — минорный, "боссовый"
    m3: { beat:0.16, wave:'sawtooth', lead:[
      ['A4',1],['C5',1],['E5',1],['A5',2],['G5',1],['E5',1],['C5',2],
      ['B4',1],['D5',1],['F5',1],['A5',2],['R',1] ],
      bass:['A3','A3','F3','G3'] },
    // 2-1 библиотека норм — любопытный, «умный»
    m4: { beat:0.18, wave:'square', lead:[
      ['E5',1],['F5',1],['G5',1],['A5',1],['G5',1],['F5',1],['E5',2],
      ['D5',1],['E5',1],['F5',1],['D5',2],['R',1] ],
      bass:['C3','D3','E3','D3'] },
    // 2-2 грозовая башня — напряжённый, тревожный
    m5: { beat:0.15, wave:'sawtooth', lead:[
      ['D5',1],['R',1],['D5',1],['F5',1],['E5',2],['C5',1],['E5',1],
      ['G5',2],['F5',1],['D5',1],['A4',2] ],
      bass:['D3','D3','A3','A3','B3','B3','F3','F3'] },
    // 2-3 световой мир — светлый, парящий
    m6: { beat:0.21, wave:'triangle', lead:[
      ['G5',1],['A5',1],['B5',2],['A5',1],['G5',1],['E5',2],
      ['G5',1],['C6',1],['B5',2],['A5',1],['G5',1],['E5',3],['R',1] ],
      bass:['C3','G3','E3','G3'] },
    // 3-1 крепость экспертизы — финальный босс, эпичный минор
    m7: { beat:0.15, wave:'sawtooth', lead:[
      ['E5',1],['E5',1],['F5',1],['G5',2],['F5',1],['E5',1],['D5',2],
      ['C5',1],['D5',1],['E5',2],['D5',1],['C5',1],['B4',2],['R',1] ],
      bass:['E3','E3','C3','C3','D3','D3','G3','B3'] },
    // финал-победа — торжественный
    win: { beat:0.20, wave:'square', lead:[
      ['C5',1],['E5',1],['G5',1],['C6',2],['G5',1],['A5',1],['G5',1],['E5',2],
      ['F5',1],['A5',1],['C6',2],['G5',1],['C6',3],['R',1] ],
      bass:['C3','G3','A3','F3','C3','G3','C3','C3'] }
  };

  function startMusic(track){
    if(track) curTrack=track;
    if(!ctx||!enabled) return;
    stopMusic();
    const T = TRACKS[curTrack] || TRACKS.map;
    musicOn=true;
    let i=0, bi=0;
    function step(){
      if(!musicOn) return;
      const [note,len]=T.lead[i%T.lead.length];
      if(note!=='R') tone(N[note], T.beat*len*0.9, T.wave, 0.15);
      if(i%2===0){ tone(N[T.bass[bi%T.bass.length]]/2, T.beat*1.8, 'triangle', 0.20); bi++; }
      i++;
      musicTimer=setTimeout(step, T.beat*len*1000);
    }
    step();
  }
  function stopMusic(){ musicOn=false; if(musicTimer){ clearTimeout(musicTimer); musicTimer=null; } }
  function setTrack(track){
    if(curTrack===track) return;
    curTrack=track;
    if(musicOn && enabled){ startMusic(track); }
  }

  return {
    init, resume, sfx,
    play(name){ resume(); if(sfx[name]) sfx[name](); },
    startMusic, stopMusic, setTrack,
    setEnabled(v){ enabled=v; if(!v) stopMusic(); },
    isEnabled(){ return enabled; },
    get music(){ return musicOn; },
    get track(){ return curTrack; }
  };
})();
