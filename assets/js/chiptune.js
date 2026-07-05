/* ===== chiptune.js — 8-битный звук через Web Audio API ===== */
const Chip = (function(){
  let ctx=null, master=null, enabled=true, musicTimer=null, musicOn=false;

  function init(){
    if(ctx) return;
    ctx = new (window.AudioContext||window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.25;
    master.connect(ctx.destination);
  }
  function resume(){ if(ctx && ctx.state==='suspended') ctx.resume(); }

  // одиночная нота с заданной формой волны
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
  // шумовой удар (для "взрыва"/ошибки)
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

  const N={C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88,
    C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,A5:880,B5:987.77,
    C6:1046.5,E6:1318.5,G6:1568,C3:130.81,G3:196,E3:164.81,A3:220};

  // эффекты
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

  // фоновая мелодия (простой луп)
  const MELODY = [
    ['E5',1],['G5',1],['A5',2],['G5',1],['E5',1],['C5',2],
    ['D5',1],['E5',1],['G5',2],['E5',1],['C5',1],['D5',3],
    ['C5',1],['E5',1],['G5',2],['A5',1],['G5',1],['E5',2],
    ['D5',1],['C5',1],['D5',1],['E5',1],['C5',3],['G4',1]
  ];
  const BASS = ['C3','C3','G3','G3','A3','A3','E3','G3'];
  function startMusic(){
    if(!ctx||musicOn||!enabled) return;
    musicOn=true;
    const beat=0.19; let i=0, bi=0;
    function step(){
      if(!musicOn) return;
      const [note,len]=MELODY[i%MELODY.length];
      tone(N[note], beat*len*0.9, 'square', 0.16);
      if(i%2===0){ tone(N[BASS[bi%BASS.length]]/2, beat*1.8, 'triangle', 0.22); bi++; }
      i++;
      musicTimer=setTimeout(step, beat*len*1000);
    }
    step();
  }
  function stopMusic(){ musicOn=false; if(musicTimer) clearTimeout(musicTimer); }

  return {
    init, resume,
    sfx,
    play(name){ resume(); if(sfx[name]) sfx[name](); },
    startMusic, stopMusic,
    setEnabled(v){ enabled=v; if(!v) stopMusic(); },
    isEnabled(){ return enabled; },
    get music(){ return musicOn; }
  };
})();
