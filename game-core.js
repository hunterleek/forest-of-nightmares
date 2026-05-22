// ═══════════════════════════════════════════
//  FOREST OF NIGHTMARES — Complete Horror Game
// ═══════════════════════════════════════════

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = 1100, H = 620;
canvas.width = W; canvas.height = H;

// Scale to fit screen
function resize(){const s=Math.min(window.innerWidth/W,window.innerHeight/H,1);canvas.style.width=W*s+'px';canvas.style.height=H*s+'px'}
window.addEventListener('resize',resize);resize();

// ═══════════════ AUDIO ═══════════════
const AudioCtx=window.AudioContext||window.webkitAudioContext;let actx;
function audio(){if(!actx)actx=new AudioCtx();return actx}
function sfx(f,t,d,v=.12,g=0){try{const a=audio(),o=a.createOscillator(),gn=a.createGain(),tm=a.currentTime;o.type=t;o.frequency.setValueAtTime(f,tm);if(g)o.frequency.linearRampToValueAtTime(f+g,tm+d);gn.gain.setValueAtTime(v,tm);gn.gain.exponentialRampToValueAtTime(.001,tm+d);o.connect(gn);gn.connect(a.destination);o.start(tm);o.stop(tm+d)}catch(e){}}
function sHit(){sfx(60,'sawtooth',.15,.25);sfx(30,'square',.08,.2)}
function sPower(){sfx(200,'sine',.08,.04);sfx(400,'sine',.08,.04);sfx(800,'sine',.12,.06);setTimeout(()=>sfx(1400,'triangle',.18,.15,300),80)}
function sStretch(){sfx(45,'sawtooth',.15,.5,25);sfx(70,'square',.1,.35)}
function sRoar(){sfx(25,'sawtooth',.25,.7,12);sfx(40,'square',.15,.5);sfx(55,'triangle',.1,.4)}
function sAmbient(){sfx(110,'triangle',.06,1.5);setTimeout(()=>sfx(165,'triangle',.06,1.2),400);setTimeout(()=>sfx(140,'triangle',.05,1.8),800)}
function sDance(){sfx(523,'square',.06,.12);setTimeout(()=>sfx(659,'square',.06,.12),130);setTimeout(()=>sfx(784,'square',.06,.12),260);setTimeout(()=>sfx(1047,'square',.08,.18),390)}
function sSSJ(){for(let i=0;i<8;i++)setTimeout(()=>sfx(300+i*100,'sine',.08,.06),i*60);sfx(60,'sawtooth',.2,.5,80)}
function sScream(){sfx(35,'sawtooth',.3,.8);sfx(50,'square',.2,.6);sfx(70,'sawtooth',.15,.5)}
function sWin(){for(let i=0;i<12;i++)setTimeout(()=>sfx(260+i*80,'triangle',.06,.1),i*100)}

// ═══════════════ INPUT ═══════════════
const keys={};const touchInput={};let mouse={x:0,y:0,down:false};
// Touch input bridge — set by mobile version
function mergeTouchInput(){for(const k of Object.keys(touchInput)){if(touchInput[k])keys[k]=true}}
window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if([' ','arrowup'].includes(e.key.toLowerCase()))e.preventDefault();audio()});
window.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
canvas.addEventListener('mousedown',e=>{audio();mouse.down=true;const r=canvas.getBoundingClientRect();mouse.x=(e.clientX-r.left)*(W/canvas.offsetWidth);mouse.y=(e.clientY-r.top)*(H/canvas.offsetHeight)});
canvas.addEventListener('mouseup',()=>mouse.down=false);
canvas.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();mouse.x=(e.clientX-r.left)*(W/canvas.offsetWidth);mouse.y=(e.clientY-r.top)*(H/canvas.offsetHeight)});
canvas.addEventListener('click',audio);

// ═══════════════ PARTICLES ═══════════════
const particles=[];
function pSpawn(x,y,n,color,spd=3,life=40,size=3){
    for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=Math.random()*spd+spd*.4;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-gravity*0.2,life:life+Math.random()*20,mlife:life+20,color,size:Math.random()*size+1})}
}
function pUpdate(dt){
    for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;p.vy+=100*dt;p.life-=dt*60;if(p.life<=0)particles.splice(i,1)}
}
function pDraw(ctx){
    for(const p of particles){const a=Math.max(0,p.life/p.mlife);ctx.globalAlpha=a;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size*a,0,Math.PI*2);ctx.fill();ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size*a*2.5,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1
}

// ═══════════════ ENVIRONMENT ═══════════════
const gravity=500;
let shakeX=0,shakeY=0,shakeI=0;
function shake(i=10,d=15){shakeI=Math.max(shakeI,i)}

// Fog
const fog=[];
for(let i=0;i<80;i++)fog.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.25,s:Math.random()*130+50,a:Math.random()*.1+.02});
function fogUpdate(dt){for(const f of fog){f.x+=f.vx*dt*60;f.y+=f.vy*dt*60;if(f.x<-f.s)f.x=W+f.s;if(f.x>W+f.s)f.x=-f.s;if(f.y<-f.s)f.y=H+f.s;if(f.y>H+f.s)f.y=-f.s}}

// Trees
const trees=[];
function genTrees(){trees.length=0;for(let i=0;i<50;i++)trees.push({x:Math.random()*W,l:Math.floor(Math.random()*3),h:Math.random()*140+90,w:Math.random()*12+8,sw:Math.random()*.35+.1,so:Math.random()*Math.PI*2});trees.sort((a,b)=>a.l-b.l)}
genTrees();

// Lightning
let lightning={active:false,timer:0,alpha:0,x:0};
function triggerLightning(){lightning.active=true;lightning.timer=8;lightning.alpha=1;lightning.x=100+Math.random()*(W-200)}
function lightningUpdate(){if(lightning.timer>0){lightning.timer--;lightning.alpha=lightning.timer/8;if(lightning.timer<=0)lightning.active=false}}

// ═══════════════ GAME STATE ═══════════════
const ST={TITLE:0,FOREST:1,CAT_INTRO:2,CAT_BOSS:3,FOREST2:4,SIREN_INTRO:5,SIREN_BOSS:6,ENDING:7,GAMEOVER:8};
let gs=ST.TITLE,st=0,fc=0,lt=performance.now();
let ambientTimer=0;

// Dialog
let dlg={t:'',tm:0,act:false};
function dialog(t,d=140){dlg.t=t;dlg.tm=d;dlg.act=true}

// ═══════════════ PLAYER ═══════════════
const pl={
    x:80,y:400,w:28,h:48,
    vx:0,vy:0,spd:220,jf:-420,
    grd:false,hp:100,mhp:100,
    fc:1,at:0,inv:0,
    att:false,attT:0,attCd:0,
    dmg:15,alive:true
};

// ═══════════════ CARTOON CAT BOSS ═══════════════
const cat={
    x:780,y:360,w:90,h:110,by:360,
    hp:250,mhp:250,
    ph:0,atk:0,atkCd:70,cAtk:0,
    str:{ext:false,sx:0,sy:0,tx:0,ty:0,len:0,maxLen:220},
    eGlow:0,fo:0,def:false,
    lunge:false,lvx:0,lvy:0
};

// ═══════════════ SIREN HEAD BOSS ═══════════════
const sir={
    x:800,y:270,w:45,h:220,by:270,
    hp:400,mhp:400,
    ph:0,atk:0,atkCd:55,cAtk:0,
    ssj:false,ssjT:0,ssjA:0,
    scr:{act:false,r:0,mr:320},
    def:false,
    rush:false,rvx:0
};

// ═══════════════ ENDING CHARACTERS ═══════════════
const bendy={
    x:220,y:360,w:38,h:58,
    gp:0,gt:0,db:0,spark:0
};
const cup={
    x:780,y:370,w:34,h:52,
    pzT:0,pzB:0,ojP:0,ojT:0,pzV:false,spark:0
};
const krabs={
    x:550,y:340,w:55,h:70,
    phase:0,timer:0,flash:0,
    fryLevel:0,fryTimer:0,frySmoke:0,
    moneyRain:0,moneyText:0,
    visible:false
};

// ═══════════════ RESET ═══════════════
function resetGame(){
    pl.x=80;pl.y=400;pl.vx=0;pl.vy=0;pl.hp=100;pl.inv=0;pl.att=false;pl.attT=0;pl.attCd=0;pl.alive=true;
    cat.x=780;cat.y=360;cat.hp=250;cat.ph=0;cat.atk=0;cat.atkCd=70;cat.cAtk=0;cat.str.ext=false;cat.def=false;cat.fo=0;cat.eGlow=0;cat.lunge=false;
    sir.x=800;sir.y=270;sir.hp=400;sir.ph=0;sir.atk=0;sir.atkCd=55;sir.ssj=false;sir.ssjT=0;sir.def=false;sir.scr.act=false;sir.rush=false;
    bendy.gp=0;bendy.gt=0;bendy.db=0;bendy.spark=0;
    cup.pzT=0;cup.pzB=0;cup.ojP=0;cup.ojT=0;cup.pzV=false;cup.spark=0;
    krabs.phase=0;krabs.timer=0;krabs.fryLevel=0;krabs.fryTimer=0;krabs.frySmoke=0;krabs.moneyRain=0;krabs.moneyText=0;krabs.visible=false;krabs.flash=0;
    particles.length=0;dlg.act=false;gs=ST.FOREST;st=0;ambientTimer=0;
    genTrees();for(const f of fog){f.x=Math.random()*W;f.y=Math.random()*H}
}

// ═══════════════ DRAWING HELPERS ═══════════════
function roundRect(x,y,w,h,r){
    ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);
    ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.fill()
}

// ═══════════════ FOREST BACKGROUND ═══════════════
function drawForest(time){
    // Sky
    const sg=ctx.createLinearGradient(0,0,0,H);
    sg.addColorStop(0,'#070714');sg.addColorStop(.25,'#0d0d24');sg.addColorStop(.5,'#150d18');sg.addColorStop(.75,'#0a0505');sg.addColorStop(1,'#020000');
    ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);

    // Stars
    for(let i=0;i<100;i++){const sx=(i*173+41)%W,sy=(i*251+17)%(H*.35),ss=(i%4)*.35+.25,fl=.55+.45*Math.sin(time*.0015+i*1.9);ctx.globalAlpha=fl*.7;ctx.fillStyle='#ffffff';ctx.fillRect(sx,sy,ss,ss)}ctx.globalAlpha=1;

    // Moon
    const mx=800,my=70;
    ctx.fillStyle='#ffe8d0';ctx.shadowColor='#ffe8d0';ctx.shadowBlur=50;
    ctx.beginPath();ctx.arc(mx,my,38,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#eed8c0';ctx.beginPath();ctx.arc(mx-8,my-7,5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(mx+10,my+9,7,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(mx+3,my-13,4,0,Math.PI*2);ctx.fill();

    // Lightning bolt
    if(lightning.active){
        ctx.strokeStyle=`rgba(255,255,255,${lightning.alpha})`;
        ctx.shadowColor=`rgba(200,200,255,${lightning.alpha})`;
        ctx.shadowBlur=30;
        ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(lightning.x,0);
        let ly=0;let lx=lightning.x;
        while(ly<H*.4){lx+=(Math.random()-.5)*40;ly+=20+Math.random()*25;ctx.lineTo(lx,ly)}
        ctx.stroke();ctx.shadowBlur=0;
    }

    // Distant mountains
    ctx.fillStyle='#0a0d12';
    ctx.beginPath();ctx.moveTo(0,H-140);
    for(let x=0;x<=W;x+=60)ctx.lineTo(x,H-140-Math.sin(x*.004+1)*30-Math.sin(x*.012)*20);
    ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();

    // Back trees (layer 2)
    for(const t of trees.filter(tr=>tr.l===2)){
        const sw=Math.sin(time*.0008+t.so)*t.sw*2;
        ctx.fillStyle='#0a100d';ctx.fillRect(t.x,H-170-t.h,t.w+2,t.h+170);
        ctx.beginPath();ctx.moveTo(t.x-t.w*2,H-170-t.h);ctx.lineTo(t.x+t.w/2+sw,H-185-t.h-25);ctx.lineTo(t.x+t.w*3,H-170-t.h);ctx.fillStyle='#081008';ctx.fill();
    }

    // Mid trees (layer 1)
    for(const t of trees.filter(tr=>tr.l===1)){
        const sw=Math.sin(time*.0012+t.so)*t.sw*3;
        ctx.fillStyle='#0e0b06';ctx.fillRect(t.x,H-150-t.h*.8,t.w+4,t.h*.8+150);
        ctx.strokeStyle='#0e0b06';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(t.x+t.w/2+sw,H-150-t.h*.55);ctx.lineTo(t.x-22+sw,H-145-t.h*.45-12);ctx.stroke();
        ctx.beginPath();ctx.moveTo(t.x+t.w/2+sw,H-150-t.h*.35);ctx.lineTo(t.x+24+sw,H-140-t.h*.3-15);ctx.stroke();
    }

    // Ground
    const gg=ctx.createLinearGradient(0,H-140,0,H);
    gg.addColorStop(0,'#1a1408');gg.addColorStop(.3,'#0f0c04');gg.addColorStop(1,'#040201');
    ctx.fillStyle=gg;ctx.fillRect(0,H-140,W,140);
    ctx.fillStyle='#0c0904';for(let i=0;i<60;i++)ctx.fillRect(i*20,H-135+Math.sin(i*3.5)*3,16,4);
    ctx.fillStyle='#1a1208';ctx.beginPath();ctx.moveTo(0,H-125);for(let i=0;i<=W;i+=25)ctx.lineTo(i,H-125+Math.sin(i*.018)*4);ctx.lineTo(W,H-140);ctx.lineTo(0,H-140);ctx.fill();
    ctx.fillStyle='#0f0c04';for(let i=0;i<35;i++){const gx=(i*157+37)%W;ctx.fillRect(gx,H-128,3,7+Math.sin(i*2.7)*3)}

    // Foreground trees (layer 0)
    for(const t of trees.filter(tr=>tr.l===0)){
        const sw=Math.sin(time*.0018+t.so)*t.sw*4;
        ctx.fillStyle='#16140c';ctx.fillRect(t.x,H-140-t.h,t.w+6,t.h+140);
        ctx.strokeStyle='#16140c';ctx.lineWidth=4;
        ctx.beginPath();ctx.moveTo(t.x+t.w/2+sw,H-140-t.h*.5);ctx.lineTo(t.x-28+sw,H-135-t.h*.38-18);ctx.moveTo(t.x-22+sw,H-135-t.h*.38-18);ctx.lineTo(t.x-38+sw,H-120-t.h*.2-28);ctx.stroke();
    }

    // Ground details - grass
    ctx.strokeStyle='#1a1508';ctx.lineWidth=1;
    for(let i=0;i<60;i++){const gx=i*18+Math.sin(i)*5,gh=4+Math.sin(i*2.3)*3;ctx.beginPath();ctx.moveTo(gx,H-130);ctx.lineTo(gx-2,H-130-gh);ctx.moveTo(gx+3,H-130);ctx.lineTo(gx+5,H-130-gh*1.2);ctx.stroke()}

    // Fog overlay
    for(const f of fog){ctx.fillStyle=`rgba(18,12,8,${f.a})`;ctx.beginPath();ctx.arc(f.x,f.y,f.s,0,Math.PI*2);ctx.fill()}
}

// ═══════════════ PLAYER RENDER ═══════════════
function drawPlayer(time){
    if(pl.inv>0&&Math.floor(pl.inv/4)%2===0)return;
    const x=pl.x,y=pl.y;
    ctx.save();ctx.translate(x+pl.w/2,y+pl.h/2);ctx.scale(pl.fc,1);

    // Shadow
    ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(0,pl.h/2,pl.w/2+3,4,0,0,Math.PI*2);ctx.fill();

    // Boots
    ctx.fillStyle='#2a1a0a';roundRect(-12,pl.h/2-13,24,15,3);

    // Legs
    const la=Math.sin(time*.009)*(pl.grd?9:4);
    ctx.fillStyle='#1a2a40';roundRect(-8,-4,7,pl.h/2-6,2);roundRect(1,-4,7,pl.h/2-6,2);

    // Body
    ctx.fillStyle='#2a3a50';roundRect(-10,-pl.h/2+5,20,pl.h/2-5,3);
    ctx.fillStyle='#1a2838';ctx.fillRect(-10,-pl.h/2+5,20,7);
    ctx.fillStyle='#3a4a58';ctx.fillRect(-2,-pl.h/2+9,4,pl.h/2-14);

    // Backpack / gear
    ctx.fillStyle='#1a2818';roundRect(-14,-pl.h/2+2,6,14,2);

    // Arms
    const asw=Math.sin(time*.012)*6;
    ctx.fillStyle='#2a3a50';roundRect(-18-asw,-pl.h/2+6+asw,8,pl.h/2-10,2);
    roundRect(10+asw,-pl.h/2+6-asw,8,pl.h/2-10,2);

    // Attack arm
    if(pl.att){ctx.fillStyle='#3a4a58';const ax=10-32*(pl.attT/18);ctx.fillRect(ax,-pl.h/2+3,34,5)}

    // Head
    ctx.fillStyle='#e0c0a0';ctx.beginPath();ctx.arc(0,-pl.h/2-1,10,0,Math.PI*2);ctx.fill();

    // Hair
    ctx.fillStyle='#3a2810';ctx.beginPath();ctx.arc(0,-pl.h/2-7,11,Math.PI,0);ctx.fill();
    ctx.fillStyle='#4a3820';ctx.beginPath();ctx.moveTo(-2,-pl.h/2-12);ctx.lineTo(4,-pl.h/2-22);ctx.lineTo(10,-pl.h/2-13);ctx.fill();

    // Eyes
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-3,-pl.h/2-3,3.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(3,-pl.h/2-3,3.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#111';ctx.beginPath();ctx.arc(-2,-pl.h/2-3,1.8,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(4,-pl.h/2-3,1.8,0,Math.PI*2);ctx.fill();

    // Mouth
    ctx.strokeStyle='#a07050';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,-pl.h/2+2,3.5,.1,Math.PI-.1);ctx.stroke();

    // Flashlight beam (facing right)
    if(pl.fc===1){
        const bg=ctx.createLinearGradient(14,-pl.h/2+8,140,-pl.h/2+8);
        bg.addColorStop(0,'rgba(255,255,180,.15)');bg.addColorStop(1,'rgba(255,255,180,0)');
        ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(14,-pl.h/2+4);ctx.lineTo(140,-pl.h/2-20);ctx.lineTo(140,-pl.h/2+30);ctx.lineTo(14,-pl.h/2+12);ctx.fill();
    }
    // Flashlight
    ctx.fillStyle='#444';ctx.fillRect(6,-pl.h/2+7+asw,14,4);
    ctx.fillStyle='#ffe';ctx.shadowColor='#ffe';ctx.shadowBlur=12;
    ctx.beginPath();ctx.arc(20,-pl.h/2+9+asw,3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;

    ctx.restore();
}

// ═══════════════ CARTOON CAT RENDER ═══════════════
function drawCartoonCat(time){
    if(cat.def)return;
    const x=cat.x,y=cat.y+cat.fo;
    ctx.save();

    // Shadow
    ctx.fillStyle='rgba(0,0,0,.5)';ctx.beginPath();ctx.ellipse(x,H-132,cat.w/2+12,6,0,0,Math.PI*2);ctx.fill();

    // Eye glow aura
    const eg=.55+.45*Math.sin(time*.004);
    if(cat.eGlow>0){ctx.fillStyle=`rgba(255,255,0,${eg*.4})`;ctx.shadowColor='#ff0';ctx.shadowBlur=30;ctx.beginPath();ctx.arc(x,y-18,35,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}

    // Body
    const bg=ctx.createLinearGradient(x-cat.w/2,y-cat.h,x+cat.w/2,y);
    bg.addColorStop(0,'#1c1c1c');bg.addColorStop(.5,'#2e2e2e');bg.addColorStop(1,'#111');
    ctx.fillStyle=bg;
    ctx.beginPath();ctx.ellipse(x,y,cat.w/2,cat.h/2,0,0,Math.PI*2);ctx.fill();

    // Body stripes
    ctx.strokeStyle='#252525';ctx.lineWidth=2;
    for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(x+i*12-cat.w/3,y-cat.h/2+10);ctx.lineTo(x+i*12-cat.w/3,y+cat.h/2-10);ctx.stroke()}

    // Ears
    ctx.fillStyle='#1c1c1c';
    ctx.beginPath();ctx.moveTo(x-22,y-cat.h/2+8);ctx.lineTo(x-38,y-cat.h/2-45);ctx.lineTo(x-6,y-cat.h/2+5);ctx.fill();
    ctx.beginPath();ctx.moveTo(x+22,y-cat.h/2+8);ctx.lineTo(x+38,y-cat.h/2-45);ctx.lineTo(x+6,y-cat.h/2+5);ctx.fill();
    // Inner ears
    ctx.fillStyle='#2a1515';
    ctx.beginPath();ctx.moveTo(x-20,y-cat.h/2+6);ctx.lineTo(x-33,y-cat.h/2-33);ctx.lineTo(x-9,y-cat.h/2+3);ctx.fill();
    ctx.beginPath();ctx.moveTo(x+20,y-cat.h/2+6);ctx.lineTo(x+33,y-cat.h/2-33);ctx.lineTo(x+9,y-cat.h/2+3);ctx.fill();

    // Big glowing eyes
    ctx.fillStyle='#ffff00';ctx.shadowColor='#ffff00';ctx.shadowBlur=28*eg;
    ctx.beginPath();ctx.ellipse(x-16,y-18,13,15,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffbb00';ctx.shadowColor='#ffbb00';ctx.shadowBlur=32*eg;
    ctx.beginPath();ctx.ellipse(x+16,y-16,14,16,0,0,Math.PI*2);ctx.fill();
    // Pupils tracking player
    const pt=Math.min(4,Math.max(-4,(pl.x-x)*.025));
    ctx.fillStyle='#000';ctx.shadowBlur=0;
    ctx.beginPath();ctx.ellipse(x-16+pt,y-18,3.5,5,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(x+16+pt,y-16,3.5,5,0,0,Math.PI*2);ctx.fill();
    // Eye highlights
    ctx.fillStyle='#fff';ctx.globalAlpha=.6;
    ctx.beginPath();ctx.arc(x-19,y-23,2.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+13,y-21,2.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;

    // Wide creepy grin
    ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.shadowColor='#ff0000';ctx.shadowBlur=12;
    ctx.beginPath();ctx.arc(x,y+6,28,.15,Math.PI-.15);ctx.stroke();ctx.shadowBlur=0;
    // Sharp teeth
    ctx.fillStyle='#fff';
    for(let i=-22;i<=22;i+=7){ctx.beginPath();ctx.moveTo(x+i,y+6);ctx.lineTo(x+i-4,y+18);ctx.lineTo(x+i+4,y+18);ctx.fill()}

    // Whiskers
    ctx.strokeStyle='#444';ctx.lineWidth=1.5;
    for(let s=-1;s<=1;s+=2){
        for(let j=-1;j<=1;j++){ctx.beginPath();ctx.moveTo(x+s*10,y-5);ctx.lineTo(x+s*35,y-5+j*15);ctx.stroke()}
    }

    // STRETCH ARM
    if(cat.str.ext){
        const armX=x+(cat.str.tx>x?cat.w/2:-cat.w/2);
        // Arm shadow
        ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=16;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(armX,y-8);ctx.lineTo(cat.str.tx+3,cat.str.ty+3);ctx.stroke();
        // Arm
        const stretchGrad=ctx.createLinearGradient(armX,y-8,cat.str.tx,cat.str.ty);
        stretchGrad.addColorStop(0,'#1c1c1c');stretchGrad.addColorStop(.5,'#333');stretchGrad.addColorStop(1,'#1c1c1c');
        ctx.strokeStyle=stretchGrad;ctx.lineWidth=12;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(armX,y-8);ctx.lineTo(cat.str.tx,cat.str.ty);ctx.stroke();
        // Claw at end
        ctx.fillStyle='#333';ctx.beginPath();ctx.arc(cat.str.tx,cat.str.ty,9,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#555';ctx.beginPath();ctx.arc(cat.str.tx,cat.str.ty,6,0,Math.PI*2);ctx.fill();
        // Claw marks
        for(let i=0;i<4;i++){const ca=-Math.PI/2+(i-1.5)*.45;ctx.strokeStyle='#777';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(cat.str.tx,cat.str.ty);ctx.lineTo(cat.str.tx+Math.cos(ca)*14,cat.str.ty+Math.sin(ca)*14);ctx.stroke()}
    }

    // Normal arms
    if(!cat.str.ext){
        const aw=Math.sin(time*.006)*4;
        ctx.strokeStyle='#1c1c1c';ctx.lineWidth=10;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(x-cat.w/2+5,y-8);ctx.lineTo(x-cat.w/2-22+aw,y-32+aw);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x+cat.w/2-5,y-8);ctx.lineTo(x+cat.w/2+22-aw,y-32-aw);ctx.stroke();
        // Paws
        ctx.fillStyle='#222';ctx.beginPath();ctx.arc(x-cat.w/2-22+aw,y-32+aw,8,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(x+cat.w/2+22-aw,y-32-aw,8,0,Math.PI*2);ctx.fill();
        // Claws retracted
        for(let s=-1;s<=1;s+=2){ctx.fillStyle='#444';ctx.beginPath();ctx.arc(x+s*(cat.w/2+22)-aw*0.5,y-32-s*aw,5,0,Math.PI*2);ctx.fill()}
    }

    // Tail
    const tailW=Math.sin(time*.005)*10;
    ctx.strokeStyle='#1c1c1c';ctx.lineWidth=7;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(x-cat.w/2+5,y+15);ctx.quadraticCurveTo(x-cat.w/2-30+tailW,y-10+tailW,x-cat.w/2-20+tailW,y-40+tailW);ctx.stroke();

    ctx.restore();
}

// ═══════════════ SIREN HEAD RENDER ═══════════════
function drawSirenHead(time){
    if(sir.def)return;
    const x=sir.x,y=sir.y;
    ctx.save();

    // Super Saiyan Aura
    if(sir.ssj){
        const aa=.25+.2*Math.sin(time*.012);
        const ag=ctx.createRadialGradient(x,y-sir.h/2,15,x,y-sir.h/2,140);
        ag.addColorStop(0,`rgba(255,215,0,${aa+.25})`);ag.addColorStop(.4,`rgba(255,180,0,${aa})`);ag.addColorStop(.7,`rgba(255,140,0,${aa*.5})`);ag.addColorStop(1,'rgba(255,100,0,0)');
        ctx.fillStyle=ag;ctx.beginPath();ctx.arc(x,y-sir.h/2,140,0,Math.PI*2);ctx.fill();

        // Energy lines
        ctx.strokeStyle=`rgba(255,200,0,${aa*.6})`;ctx.lineWidth=2.5;
        for(let i=0;i<10;i++){const a=time*.004+i*Math.PI/5,r=90+Math.sin(time*.01+i)*25;ctx.beginPath();ctx.moveTo(x,y-sir.h/2);ctx.lineTo(x+Math.cos(a)*r,y-sir.h/2+Math.sin(a)*r);ctx.stroke()}

        // Rising rocks
        for(let i=0;i<6;i++){const rx=x+(i-2.5)*30,ry=H-135-Math.abs(Math.sin(time*.004+i))*25;ctx.fillStyle=`rgba(139,90,43,${aa})`;ctx.beginPath();ctx.arc(rx+Math.sin(time*.006+i)*5,ry,3+Math.random()*3,0,Math.PI*2);ctx.fill()}
    }

    // Shadow
    ctx.fillStyle='rgba(0,0,0,.5)';ctx.beginPath();ctx.ellipse(x,H-132,sir.w/2+10,5,0,0,Math.PI*2);ctx.fill();

    // Legs
    const lg=ctx.createLinearGradient(x-sir.w/2,0,x+sir.w/2,0);
    lg.addColorStop(0,'#352818');lg.addColorStop(.5,'#4a3825');lg.addColorStop(1,'#2a1d10');
    ctx.fillStyle=lg;ctx.fillRect(x-14,y+25,11,H-132-y-25);ctx.fillRect(x+3,y+25,11,H-132-y-25);

    // Body
    const bg2=ctx.createLinearGradient(x-sir.w/2,y,x+sir.w/2,y);
    bg2.addColorStop(0,'#453020');bg2.addColorStop(.5,'#5a4530');bg2.addColorStop(1,'#352015');
    ctx.fillStyle=bg2;roundRect(x-sir.w/2,y-sir.h/2-20,sir.w,sir.h/2+20,6);

    // Ribcage detail
    ctx.strokeStyle='#2a1a10';ctx.lineWidth=2.5;
    for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(x-sir.w/2+6,y-sir.h/2+5+i*14);ctx.lineTo(x+sir.w/2-6,y-sir.h/2+5+i*14);ctx.stroke()}

    // Arms
    const armSw=Math.sin(time*.005)*5;
    ctx.fillStyle='#453020';ctx.fillRect(x-sir.w/2-17,y-sir.h/2-armSw,11,sir.h/2.5);ctx.fillRect(x+sir.w/2+6,y-sir.h/2+armSw,11,sir.h/2.5);
    // Hands
    ctx.fillStyle='#352015';ctx.beginPath();ctx.arc(x-sir.w/2-11,y-sir.h/2-armSw+sir.h/2.5,7,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+sir.w/2+11,y-sir.h/2+armSw+sir.h/2.5,7,0,Math.PI*2);ctx.fill();

    // Neck
    ctx.fillStyle='#5a4530';ctx.fillRect(x-9,y-sir.h/2-90,18,70);

    // Siren heads
    drawSirenSpeaker(x-24,y-sir.h/2-100,time,sir.ssj);
    drawSirenSpeaker(x+24,y-sir.h/2-100,time,sir.ssj);

    // SSJ hair spikes
    if(sir.ssj){
        ctx.fillStyle='#ffd700';ctx.shadowColor='#ffd700';ctx.shadowBlur=18;
        for(let i=0;i<8;i++){const ha=-Math.PI/2+(i-3.5)*.25+Math.sin(time*.012+i)*.15;ctx.beginPath();ctx.moveTo(x-25+i*7,y-sir.h/2-110);ctx.lineTo(x-25+i*7+Math.cos(ha)*18,y-sir.h/2-135+Math.sin(ha)*18);ctx.strokeStyle='#ffd700';ctx.lineWidth=3.5;ctx.stroke()}
        ctx.shadowBlur=0;
    }

    // Body eyes
    const eg2=.45+.55*Math.sin(time*.003);
    ctx.fillStyle='#ff0000';ctx.shadowColor='#ff0000';ctx.shadowBlur=18*eg2;
    ctx.beginPath();ctx.arc(x-7,y-sir.h/2-8,5.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+7,y-sir.h/2-8,5.5,0,Math.PI*2);ctx.fill();
    if(sir.ssj){ctx.fillStyle='#ffd700';ctx.shadowColor='#ffd700';ctx.shadowBlur=20;ctx.beginPath();ctx.arc(x-7,y-sir.h/2-8,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+7,y-sir.h/2-8,4,0,Math.PI*2);ctx.fill()}
    ctx.shadowBlur=0;

    // Scream waves
    if(sir.scr.act){
        const scx=x-24,scy=y-sir.h/2-80;
        for(let i=0;i<4;i++){ctx.strokeStyle=`rgba(255,80,30,${.55-i*.1})`;ctx.lineWidth=3-i*.5;ctx.beginPath();ctx.arc(scx,scy,sir.scr.r*.5+i*18,-.6,.6);ctx.stroke()}
        const scx2=x+24;
        for(let i=0;i<4;i++){ctx.strokeStyle=`rgba(255,80,30,${.55-i*.1})`;ctx.lineWidth=3-i*.5;ctx.beginPath();ctx.arc(scx2,scy,sir.scr.r*.5+i*18,Math.PI-.6,Math.PI+.6);ctx.stroke()}
    }

    ctx.restore();
}

function drawSirenSpeaker(sx,sy,time,isSSJ){
    ctx.save();
    ctx.fillStyle=isSSJ?'#9a8060':'#6a5040';
    ctx.beginPath();ctx.moveTo(sx-18,sy);ctx.lineTo(sx+18,sy);ctx.lineTo(sx+22,sy-45);ctx.lineTo(sx-22,sy-45);ctx.fill();
    ctx.strokeStyle=isSSJ?'#b09070':'#806050';ctx.lineWidth=2.5;ctx.stroke();

    // Grill
    ctx.fillStyle='#151515';ctx.fillRect(sx-14,sy-40,28,35);
    for(let i=0;i<5;i++){ctx.fillStyle='#2a2a2a';ctx.fillRect(sx-12,sy-34+i*7,24,2)}

    // Warning light on top
    const blink=.5+.5*Math.sin(time*.015);
    ctx.fillStyle=`rgba(255,${Math.floor(30+blink*225)},0,${.6+blink*.4})`;
    ctx.shadowColor='#f00';ctx.shadowBlur=8*blink;
    ctx.beginPath();ctx.arc(sx,sy-50,4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;

    // Horn
    ctx.fillStyle=isSSJ?'#b09070':'#806050';
    ctx.beginPath();ctx.moveTo(sx-6,sy-45);ctx.lineTo(sx+6,sy-45);ctx.lineTo(sx,sy-62);ctx.fill();

    ctx.restore();
}

// ═══════════════ BENDY RENDER ═══════════════
function drawBendy(time){
    const x=bendy.x,y=bendy.y;
    ctx.save();

    // Griddy animation
    const isG=gs===ST.ENDING&&bendy.gp>0;
    let by=0,aa1=0,aa2=0,la=0;
    if(isG){const bt=bendy.gt*.07;by=Math.abs(Math.sin(bt))*18;aa1=Math.sin(bt)*.7;aa2=Math.cos(bt)*.55;la=Math.sin(bt)*.45}

    // Shadow
    ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(x,y+bendy.h/2+4,bendy.w/2,3,0,0,Math.PI*2);ctx.fill();

    // Legs
    ctx.fillStyle='#0d0d0d';ctx.fillRect(x-13,y+8+by,10,bendy.h/2-5);ctx.fillRect(x+3,y+8-by*.5,10,bendy.h/2-5);
    // Boots
    ctx.fillStyle='#1a1a1a';roundRect(x-14,y+bendy.h/2-10+by,12,10,2);roundRect(x+2,y+bendy.h/2-10-by*.5,12,10,2);

    // Body
    ctx.fillStyle='#0d0d0d';roundRect(x-15,y-bendy.h/2+4,30,bendy.h/2,12);

    // Bow tie
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.moveTo(x,y-bendy.h/2+13);ctx.lineTo(x-11,y-bendy.h/2+5);ctx.lineTo(x-11,y-bendy.h/2+21);ctx.lineTo(x,y-bendy.h/2+13);ctx.fill();
    ctx.beginPath();ctx.moveTo(x,y-bendy.h/2+13);ctx.lineTo(x+11,y-bendy.h/2+5);ctx.lineTo(x+11,y-bendy.h/2+21);ctx.lineTo(x,y-bendy.h/2+13);ctx.fill();
    ctx.fillStyle='#ddd';ctx.beginPath();ctx.arc(x,y-bendy.h/2+13,3,0,Math.PI*2);ctx.fill();

    // Arms
    ctx.save();ctx.translate(x-15,y-bendy.h/2+11);ctx.rotate(aa1);ctx.fillStyle='#0d0d0d';ctx.fillRect(-5,0,10,28);ctx.restore();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-15+Math.sin(aa1)*28,y-bendy.h/2+11+Math.cos(aa1)*28,7,0,Math.PI*2);ctx.fill();

    ctx.save();ctx.translate(x+15,y-bendy.h/2+11);ctx.rotate(aa2);ctx.fillStyle='#0d0d0d';ctx.fillRect(-5,0,10,28);ctx.restore();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+15+Math.sin(aa2)*28,y-bendy.h/2+11+Math.cos(aa2)*28,7,0,Math.PI*2);ctx.fill();

    // Head
    ctx.fillStyle='#0d0d0d';ctx.beginPath();ctx.arc(x,y-bendy.h/2-12+by*.3,19,0,Math.PI*2);ctx.fill();

    // Horns
    ctx.fillStyle='#1a1a1a';
    ctx.beginPath();ctx.moveTo(x-12,y-bendy.h/2-25+by*.3);ctx.lineTo(x-8,y-bendy.h/2-40+by*.3);ctx.lineTo(x-4,y-bendy.h/2-22+by*.3);ctx.fill();
    ctx.beginPath();ctx.moveTo(x+12,y-bendy.h/2-25+by*.3);ctx.lineTo(x+8,y-bendy.h/2-40+by*.3);ctx.lineTo(x+4,y-bendy.h/2-22+by*.3);ctx.fill();

    // Eyes (pie cut)
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(x-6,y-bendy.h/2-15+by*.3,7.5,Math.PI,0);ctx.fill();
    ctx.beginPath();ctx.arc(x+6,y-bendy.h/2-15+by*.3,7.5,Math.PI,0);ctx.fill();
    ctx.fillStyle='#0d0d0d';ctx.beginPath();ctx.arc(x-4,y-bendy.h/2-13+by*.3,3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+4,y-bendy.h/2-13+by*.3,3,0,Math.PI*2);ctx.fill();

    // Grin
    ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y-bendy.h/2-4+by*.3,11,.2,Math.PI-.2);ctx.stroke();

    // Ink drip
    ctx.fillStyle='#0d0d0d';ctx.beginPath();ctx.moveTo(x-8,y-bendy.h/2-30+by*.3);ctx.lineTo(x-3,y-bendy.h/2-38+by*.3);ctx.lineTo(x-1,y-bendy.h/2-30+by*.3);ctx.fill();

    // Griddy effects
    if(isG&&bendy.gp>1){
        // Dance floor glow
        const dg=ctx.createRadialGradient(x,y,5,x,y,60);
        dg.addColorStop(0,'rgba(255,255,255,.15)');dg.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=dg;ctx.beginPath();ctx.arc(x,y,60,0,Math.PI*2);ctx.fill();

        // Sparkles
        for(let i=0;i<6;i++){const sx=x+Math.sin(time*.006+i*2)*35,sy=y+Math.cos(time*.007+i)*32;ctx.fillStyle=`rgba(255,255,255,${.25+Math.sin(time*.012+i)*.2})`;ctx.beginPath();ctx.arc(sx,sy,2.5,0,Math.PI*2);ctx.fill()}
        // Music notes
        for(let i=0;i<3;i++){const nx=x+(i-1)*25,ny=y-50-Math.sin(time*.005+i)*15;ctx.fillStyle=`rgba(255,255,255,${.4+.3*Math.sin(time*.008+i)})`;ctx.font='16px Arial';ctx.textAlign='center';ctx.fillText('♪',nx,ny)}
    }

    if(isG&&bendy.gp>2){ctx.fillStyle=`rgba(255,255,255,${.5+.4*Math.sin(time*.006)})`;ctx.font='bold 22px "Courier New"';ctx.textAlign='center';ctx.fillText('🔥 HITTIN THE GRIDDY! 🔥',x,y-bendy.h/2-50+by*.3)}

    ctx.restore();
}

// ═══════════════ CUPHEAD RENDER ═══════════════
function drawCuphead(time){
    const x=cup.x,y=cup.y;
    ctx.save();

    const isOJ=gs===ST.ENDING&&cup.ojP>0;

    // Shadow
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(x,y+cup.h/2+4,cup.w/2+5,4,0,0,Math.PI*2);ctx.fill();

    // Legs
    ctx.fillStyle='#c81818';ctx.fillRect(x-11,y+4,8,cup.h/2-10);ctx.fillRect(x+3,y+4,8,cup.h/2-10);
    // Shoes
    ctx.fillStyle='#6b3010';roundRect(x-13,y+cup.h/2-10,12,10,2);roundRect(x+1,y+cup.h/2-10,12,10,2);

    // Body
    ctx.fillStyle='#c81818';roundRect(x-14,y-cup.h/2+6,28,cup.h/2,7);

    // Buttons
    ctx.fillStyle='#ffd700';ctx.beginPath();ctx.arc(x,y-cup.h/2+18,3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x,y-cup.h/2+30,3,0,Math.PI*2);ctx.fill();

    // Straw
    ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x+4,y-cup.h/2);ctx.lineTo(x+16,y-cup.h/2-32);ctx.stroke();
    ctx.fillStyle='#f00';ctx.fillRect(x+4,y-cup.h/2-3,12,4);

    // Arms
    ctx.fillStyle='#c81818';roundRect(x-23,y-cup.h/2+9,10,22,3);roundRect(x+13,y-cup.h/2+9,10,22,3);
    // Gloves
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-18,y-cup.h/2+33,7.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+18,y-cup.h/2+33,7.5,0,Math.PI*2);ctx.fill();

    // Cup head
    ctx.fillStyle='#e8dcc8';ctx.strokeStyle='#b89868';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(x,y-cup.h/2-7,cup.w/2,0,Math.PI*2);ctx.fill();ctx.stroke();

    // Cup rim
    ctx.fillStyle='#f0e8d8';ctx.beginPath();ctx.ellipse(x,y-cup.h/2-7-cup.w/2+3,cup.w/2,5,0,0,Math.PI*2);ctx.fill();

    // Face
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-7,y-cup.h/2-10,7.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+7,y-cup.h/2-10,7.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#111';ctx.beginPath();ctx.arc(x-5,y-cup.h/2-9,3.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+5,y-cup.h/2-9,3.2,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#111';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y-cup.h/2,5.5,.1,Math.PI-.1);ctx.stroke();
    ctx.fillStyle='#c89848';ctx.beginPath();ctx.arc(x,y-cup.h/2-5,3,0,Math.PI*2);ctx.fill();

    // CENSORED PIZZA
    if(cup.pzV){
        const px=x+32,py=y-cup.h/2+22;
        // Pizza triangle shape
        ctx.fillStyle='#cc8800';ctx.beginPath();ctx.moveTo(px,py-20);ctx.lineTo(px+22,py+12);ctx.lineTo(px-22,py+12);ctx.fill();
        // CENSOR BAR
        ctx.fillStyle='#000';ctx.fillRect(px-24,py-14,48,28);
        ctx.strokeStyle='#ff0';ctx.lineWidth=2;ctx.strokeRect(px-24,py-14,48,28);
        ctx.fillStyle='#ff0';ctx.font='bold 13px Arial';ctx.textAlign='center';
        ctx.fillText('CENSORED',px,py+2);
        ctx.fillStyle='#fff';ctx.font='bold 10px Arial';
        ctx.fillText('[ PIZZA ]',px,py+14);
    }

    // Orange Justice effects
    if(isOJ&&cup.ojP>1){
        const obt=cup.ojT*.09;
        for(let i=0;i<5;i++){const sx=x+Math.sin(obt+i*2.2)*38,sy=y+Math.cos(obt+i*2.8)*35;ctx.fillStyle=`rgba(255,140,0,${.35+Math.sin(obt+i)*.25})`;ctx.beginPath();ctx.arc(sx,sy,3.5,0,Math.PI*2);ctx.fill()}
        // Arm wave
        for(let i=0;i<3;i++){const ax=x+(i-1)*20,ay=y-40-Math.sin(obt+i)*18;ctx.fillStyle=`rgba(255,165,0,${.5})`;ctx.font='14px Arial';ctx.textAlign='center';ctx.fillText('🟠',ax,ay)}
    }
    if(isOJ&&cup.ojP>2){ctx.fillStyle=`rgba(255,140,0,${.55+.35*Math.sin(time*.006)})`;ctx.font='bold 18px "Courier New"';ctx.textAlign='center';ctx.fillText('🟠 ORANGE JUSTICE! 🟠',x,y-cup.h/2-35)}

    ctx.restore();
}

// ═══════════════ MR KRABS RENDER ═══════════════
function drawMrKrabs(time){
    if(!krabs.visible)return;
    const k=krabs,x=k.x,y=k.y;
    ctx.save();

    // Shadow
    ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(x,H-112,k.w/2+6,5,0,0,Math.PI*2);ctx.fill();

    // Fry effect overlay
    if(k.fryLevel>0){
        const fryAlpha=k.fryLevel/100;
        // Red heat glow
        const fg=ctx.createRadialGradient(x,y,10,x,y,120);
        fg.addColorStop(0,`rgba(255,${Math.floor(100-fryAlpha*100)},0,${fryAlpha})`);
        fg.addColorStop(.5,`rgba(255,${Math.floor(60-fryAlpha*60)},0,${fryAlpha*.6})`);
        fg.addColorStop(1,'rgba(255,20,0,0)');
        ctx.fillStyle=fg;ctx.beginPath();ctx.arc(x,y,120,0,Math.PI*2);ctx.fill();

        // Fire particles rising
        for(let i=0;i<8;i++){
            const fx=x+(Math.sin(time*.01+i*1.5))*40,fy=y-30-i*12-Math.abs(Math.sin(time*.008+i))*25;
            ctx.fillStyle=`rgba(255,${Math.floor(100+Math.sin(time*.02+i)*100)},0,${.5+.5*Math.sin(time*.015+i)})`;
            ctx.beginPath();ctx.arc(fx,fy,4+Math.sin(time*.02+i)*3,0,Math.PI*2);ctx.fill();
            // Flame tips
            ctx.fillStyle=`rgba(255,${Math.floor(200+Math.sin(time*.025+i)*55)},0,${.7})`;
            ctx.beginPath();ctx.moveTo(fx,fy-6);ctx.lineTo(fx-4,fy+6);ctx.lineTo(fx+4,fy+6);ctx.fill();
        }

        // Smoke clouds
        for(let i=0;i<4;i++){
            const sx=x+(Math.sin(time*.007+i*1.8))*35,sy=y-60-i*18;
            ctx.fillStyle=`rgba(80,80,80,${.3+.2*Math.sin(time*.01+i)})`;
            ctx.beginPath();ctx.arc(sx,sy,8+Math.sin(time*.01+i)*4,0,Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.arc(sx+8,sy-3,6,0,Math.PI*2);ctx.fill();
        }

        // "GETTING FRIED" text
        if(k.fryLevel>30){
            const sizzle=.5+.5*Math.sin(time*.01);
            ctx.fillStyle=`rgba(255,${Math.floor(80+sizzle*175)},0,${.7+sizzle*.3})`;
            ctx.font='bold 24px "Courier New"';ctx.textAlign='center';
            ctx.fillText('🦀 GETTING FRIED & COOKED! 🔥',x,y-90);
        }
    }

    // Legs
    ctx.fillStyle='#d42020';const lw=Math.sin(time*.005)*3;
    for(let i=0;i<4;i++){
        const lx=x-12+i*8,ly=y+30;
        ctx.fillStyle='#d42020';ctx.fillRect(lx-3,ly,6,20);
        ctx.fillStyle='#b01818';ctx.beginPath();ctx.arc(lx,ly+20,4,0,Math.PI,true);ctx.fill();
    }

    // Body (crab shape - wide oval)
    const bodyGrad=ctx.createLinearGradient(x-k.w/2,y,x+k.w/2,y);
    bodyGrad.addColorStop(0,'#cc1010');bodyGrad.addColorStop(.3,'#e82020');bodyGrad.addColorStop(.7,'#d41818');bodyGrad.addColorStop(1,'#aa0808');
    ctx.fillStyle=bodyGrad;
    ctx.beginPath();ctx.ellipse(x,y,k.w/2,k.h/2.5,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#880000';ctx.lineWidth=2;ctx.stroke();

    // Body segments
    for(let i=0;i<3;i++){ctx.strokeStyle='#990000';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-k.w/2+10,y-10+i*10);ctx.lineTo(x+k.w/2-10,y-10+i*10);ctx.stroke()}

    // Apron/belly
    ctx.fillStyle='#ffe8c0';ctx.beginPath();ctx.ellipse(x,y+5,22,14,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#d4a860';ctx.lineWidth=1;ctx.stroke();

    // Big claws
    for(let s=-1;s<=1;s+=2){
        const cx=x+s*(k.w/2+5),cy=y-8;
        // Arm
        ctx.strokeStyle='#d41818';ctx.lineWidth=8;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(x+s*k.w/2,cy-2);ctx.lineTo(cx+s*15,cy-10);ctx.stroke();
        // Claw
        ctx.fillStyle='#e82020';
        ctx.beginPath();ctx.arc(cx+s*15,cy-10,14,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#990000';ctx.lineWidth=2;ctx.stroke();
        // Claw split
        ctx.fillStyle='#ff4444';ctx.beginPath();ctx.arc(cx+s*15,cy-10,8,0,Math.PI*2);ctx.fill();
        // Claw pincers
        ctx.fillStyle='#ff8888';
        ctx.beginPath();ctx.moveTo(cx+s*15-6,cy-10);ctx.lineTo(cx+s*20,cy-20);ctx.lineTo(cx+s*15+2,cy-12);ctx.fill();
        ctx.beginPath();ctx.moveTo(cx+s*15+6,cy-10);ctx.lineTo(cx+s*20,cy-22);ctx.lineTo(cx+s*15-2,cy-14);ctx.fill();
    }

    // Money bags floating around
    if(k.moneyRain>0){
        const mrAlpha=k.moneyRain/100;
        for(let i=0;i<6;i++){
            const mx=x+(Math.sin(time*.006+i*1.3))*60,my=y-40-Math.abs(Math.sin(time*.007+i))*50;
            // Dollar bag
            ctx.fillStyle=`rgba(85,165,50,${mrAlpha})`;
            ctx.beginPath();ctx.arc(mx,my,8,0,Math.PI*2);ctx.fill();
            ctx.fillStyle=`rgba(0,150,0,${mrAlpha})`;ctx.font='10px Arial';ctx.textAlign='center';ctx.fillText('$',mx,my+4);
            // Bag top
            ctx.strokeStyle=`rgba(85,165,50,${mrAlpha})`;ctx.lineWidth=2;
            ctx.beginPath();ctx.moveTo(mx-4,my-6);ctx.lineTo(mx+4,my-6);ctx.lineTo(mx,my-12);ctx.lineTo(mx-4,my-6);ctx.stroke();
        }
    }

    // Eyes on stalks
    for(let s=-1;s<=1;s+=2){
        const ex=x+s*13,ey=y-22;
        // Stalk
        ctx.strokeStyle='#d41818';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+s*10,y-15);ctx.lineTo(ex,ey);ctx.stroke();
        // Eye
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex,ey,7,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#111';ctx.beginPath();ctx.arc(ex+s*2,ey-1,3.5,0,Math.PI*2);ctx.fill();
        // Dollar sign in eyes
        if(k.moneyRain>0){ctx.fillStyle='#0a0';ctx.font='bold 8px Arial';ctx.textAlign='center';ctx.fillText('$',ex,ey+3)}
    }

    // Mouth (greedy grin)
    ctx.strokeStyle='#660000';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(x,y-2,15,.1,Math.PI-.1);ctx.stroke();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y-2,12,.1,Math.PI-.1);ctx.fill();
    // Teeth
    ctx.fillStyle='#fff';
    for(let i=-8;i<=8;i+=5){ctx.fillRect(x+i-2,y-2,4,5)}

    // Nose
    ctx.fillStyle='#cc0000';ctx.beginPath();ctx.arc(x,y-10,3,0,Math.PI*2);ctx.fill();

    // "I LOVE MONEY" speech bubble
    if(k.moneyText>0){
        const mtAlpha=Math.min(1,k.moneyText/80);
        const bx=x+30,by=y-70;
        // Bubble
        ctx.fillStyle=`rgba(255,255,255,${mtAlpha*.9})`;
        ctx.beginPath();ctx.ellipse(bx,by,65,28,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle=`rgba(0,0,0,${mtAlpha*.6})`;ctx.lineWidth=2;ctx.stroke();
        // Bubble tail
        ctx.beginPath();ctx.moveTo(bx-30,by+18);ctx.lineTo(bx-45,by+40);ctx.lineTo(bx-15,by+25);ctx.fill();
        // Text
        ctx.fillStyle=`rgba(0,0,0,${mtAlpha})`;ctx.font='bold 16px "Courier New"';ctx.textAlign='center';
        ctx.fillText('💰 I LOVE MONEY! 💰',bx,by+6);
    }

    // Price tag floating
    if(k.moneyRain>50){
        ctx.fillStyle='#ff0';ctx.font='bold 14px "Courier New"';ctx.textAlign='center';
        const tagBlink=.5+.5*Math.sin(time*.008);
        ctx.fillText('$1,000,000',x,y-55);
    }

    // Getting fried text overlay
    if(k.fryLevel>60){
        ctx.fillStyle=`rgba(255,200,0,${.6+.4*Math.sin(time*.012)})`;
        ctx.font='bold 22px "Courier New"';ctx.textAlign='center';
        ctx.fillText('🍳 KRABS IS COOKED! 🍳',x,y-70);
    }

    ctx.restore();
}
function drawHUD(){
    // Health bar bg
    ctx.fillStyle='rgba(0,0,0,.75)';roundRect(18,18,210,26,5);
    ctx.strokeStyle='#332200';ctx.lineWidth=2;ctx.stroke();

    // Health bar
    const hpP=pl.hp/pl.mhp;
    const hpG=ctx.createLinearGradient(20,0,228,0);
    if(hpP>.5){hpG.addColorStop(0,`rgb(${Math.floor((1-hpP)*2*255)},255,0)`);hpG.addColorStop(1,'#0f0')}
    else{hpG.addColorStop(0,'#f00');hpG.addColorStop(1,`rgb(255,${Math.floor(hpP*2*255)},0)`)}
    ctx.fillStyle=hpG;roundRect(20,20,206*hpP,22,3);

    // HP text
    ctx.fillStyle='#fff';ctx.font='bold 12px "Courier New"';ctx.textAlign='center';ctx.fillText(`HP ${Math.ceil(pl.hp)}/${pl.mhp}`,123,36);

    // Boss health bar
    if(gs===ST.CAT_BOSS||gs===ST.SIREN_BOSS){
        const boss=gs===ST.CAT_BOSS?cat:sir;
        const bhpP=boss.hp/boss.mhp;
        const bName=gs===ST.CAT_BOSS?'🐱 CARTOON CAT':'📢 SIREN HEAD';
        const ssjLabel=gs===ST.SIREN_BOSS&&sir.ssj?' ⚡SSJ!':'';
        const ssjColor=gs===ST.SIREN_BOSS&&sir.ssj?'#ffd700':'#ff2222';

        ctx.fillStyle='rgba(0,0,0,.75)';roundRect(W-240,18,222,34,5);
        ctx.strokeStyle=ssjColor;ctx.lineWidth=2;ctx.stroke();

        ctx.fillStyle=ssjColor;roundRect(W-238,20,218*bhpP,13,2);

        ctx.fillStyle='#fff';ctx.font='bold 11px "Courier New"';ctx.textAlign='center';
        ctx.fillText(bName+ssjLabel,W-129,32);
        ctx.fillText(`${Math.ceil(boss.hp)}/${boss.mhp}`,W-129,47);
    }

    // Controls
    ctx.fillStyle='rgba(255,255,255,.35)';ctx.font='10px "Courier New"';ctx.textAlign='right';
    ctx.fillText('WASD: Move | SPACE: Jump | E: Attack',W-20,H-12);
}

// ═══════════════ DIALOG ═══════════════
function drawDialog(){
    if(!dlg.act)return;
    // Darken background
    ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,H-150,W,150);

    ctx.fillStyle='rgba(0,0,0,.9)';roundRect(W/2-340,H-155,680,65,8);
    ctx.strokeStyle='#ff4400';ctx.lineWidth=2.5;ctx.stroke();

    ctx.fillStyle='#fff';ctx.font='bold 15px "Courier New"';ctx.textAlign='center';
    const maxWidth=640;
    const words=dlg.t.split(' ');let line='',lines=[];
    for(const w of words){
        if(ctx.measureText(line+w).width>maxWidth){lines.push(line);line=w+' '}else{line+=w+' '}
    }lines.push(line);
    for(let i=0;i<lines.length;i++){ctx.fillText(lines[i],W/2,H-133+i*18)}

    if(dlg.tm<60){ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='11px "Courier New"';ctx.fillText('[Click or press any key to continue]',W/2,H-95)}
}

// ═══════════════ TITLE SCREEN ═══════════════
function drawTitle(time){
    // Dark bg
    ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);

    // Trees silhouette
    for(let i=0;i<18;i++){ctx.fillStyle='#070707';ctx.fillRect(i*65-5,H-210-Math.sin(i)*35,22,230);ctx.beginPath();ctx.moveTo(i*65-22,H-210-Math.sin(i)*35);ctx.lineTo(i*65+6,H-265-Math.sin(i)*35-35);ctx.lineTo(i*65+44,H-210-Math.sin(i)*35);ctx.fill()}
    ctx.fillStyle='#050505';ctx.fillRect(0,H-100,W,100);

    // Fog
    for(const f of fog){ctx.fillStyle=`rgba(25,15,8,${f.a*1.8})`;ctx.beginPath();ctx.arc(f.x,f.y,f.s*1.3,0,Math.PI*2);ctx.fill()}

    // Title glow
    const tg=.65+.35*Math.sin(time*.0025);
    ctx.shadowColor='#ff4400';ctx.shadowBlur=35*tg;
    ctx.fillStyle='#ff3300';ctx.font='bold 68px "Courier New"';ctx.textAlign='center';
    ctx.fillText('FOREST OF',W/2,150);ctx.fillText('NIGHTMARES',W/2,225);
    ctx.shadowBlur=0;

    // Subtitle
    ctx.fillStyle='#994400';ctx.font='bold 18px "Courier New"';ctx.fillText('🌲 A HORROR SURVIVAL GAME 🌲',W/2,270);

    // Flashing prompt
    if(Math.floor(time/520)%2===0){ctx.fillStyle='#ff6622';ctx.font='bold 30px "Courier New"';ctx.fillText('PRESS ENTER OR CLICK',W/2,370);ctx.fillText('TO START',W/2,400)}

    // Controls info
    ctx.fillStyle='rgba(255,200,150,.5)';ctx.font='13px "Courier New"';
    ctx.fillText('WASD = Move | SPACE = Jump | E = Attack',W/2,460);

    // Hidden eyes
    const ef=Math.sin(time*.0035);
    if(ef>.25){ctx.fillStyle='#ff0';ctx.shadowColor='#ff0';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(220,320,3+ef*3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(820,310,3+ef*3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(880,315,2+ef*2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}

    // Version text
    ctx.fillStyle='rgba(255,255,255,.2)';ctx.font='10px "Courier New"';ctx.fillText('v2.0 — Featuring Cartoon Cat, Siren Head, Bendy & Cuphead',W/2,H-20);
}

// ═══════════════ ENDING SCREEN ═══════════════
function drawEnding(time){
    const sg=ctx.createLinearGradient(0,0,0,H);
    sg.addColorStop(0,'#1a0a30');sg.addColorStop(.5,'#2a1540');sg.addColorStop(1,'#0a0000');
    ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);

    // Party lights / fireflies
    for(let i=0;i<50;i++){const fx=(i*173+137)%W,fy=(i*257+73)%(H-110)+50,fl=.35+.65*Math.sin(time*.004+i*2.7);ctx.fillStyle=`rgba(255,${140+i*4},${40+(i%3)*35},${fl*.75})`;ctx.beginPath();ctx.arc(fx,fy,2+fl*2.5,0,Math.PI*2);ctx.fill()}

    // Ground
    ctx.fillStyle='#150a05';ctx.fillRect(0,H-110,W,110);
    ctx.fillStyle='#1a1008';for(let i=0;i<50;i++)ctx.fillRect(i*24,H-105+Math.sin(i*4)*3,20,3);

    // Victory text
    ctx.shadowColor='#ffaa00';ctx.shadowBlur=45;
    ctx.fillStyle='#ffcc00';ctx.font='bold 42px "Courier New"';ctx.textAlign='center';
    ctx.fillText('🌲 YOU SURVIVED THE',W/2,65);
    ctx.fillText('FOREST OF NIGHTMARES! 🌲',W/2,115);
    ctx.shadowBlur=0;

    ctx.fillStyle='#ff8844';ctx.font='bold 20px "Courier New"';ctx.fillText('★ ★ ★  CONGRATULATIONS  ★ ★ ★',W/2,155);

    // Draw characters — Bendy and Cuphead first
    drawBendy(time);
    drawCuphead(time);
    // Mr. Krabs appears later
    if(st>120)drawMrKrabs(time);

    // Party text
    if(st>180){ctx.fillStyle=`rgba(255,200,100,${.5+.4*Math.sin(time*.006)})`;ctx.font='bold 16px "Courier New"';ctx.textAlign='center';ctx.fillText('THE FOREST IS SAFE... FOR NOW.',W/2,H-65)}

    // Censored pizza label
    if(cup.pzV&&st>120){ctx.fillStyle='rgba(0,0,0,.85)';ctx.fillRect(W/2-160,H-105,320,32);ctx.strokeStyle='#ff0';ctx.lineWidth=2;ctx.strokeRect(W/2-160,H-105,320,32);ctx.fillStyle='#ff0';ctx.font='bold 14px "Courier New"';ctx.textAlign='center';ctx.fillText('⚠️ PIZZA CONSUMPTION CENSORED ⚠️',W/2,H-83)}

    // Censored: crab getting fried
    if(krabs.fryLevel>30&&st>140){ctx.fillStyle='rgba(0,0,0,.85)';ctx.fillRect(W/2-200,H-140,400,28);ctx.strokeStyle='#ff4400';ctx.lineWidth=2;ctx.strokeRect(W/2-200,H-140,400,28);ctx.fillStyle='#ff4400';ctx.font='bold 13px "Courier New"';ctx.textAlign='center';ctx.fillText('⚠️ [CENSORED] CRAB BEING FRIED ALIVE — GRAPHIC CONTENT ⚠️',W/2,H-122)}

    // Restart
    if(st>250&&Math.floor(time/650)%2===0){ctx.fillStyle='#ff6622';ctx.font='bold 22px "Courier New"';ctx.fillText('PRESS ENTER TO PLAY AGAIN',W/2,H-25)}
}

// ═══════════════ UPDATE LOGIC ═══════════════
function update(dt){
    if(dt>.1)dt=.1;
    mergeTouchInput(); // Touch input bridge
    fc++;st++;

    // Fog
    fogUpdate(dt);

    // Lightning
    lightningUpdate();
    if(Math.random()<.001&&(gs===ST.CAT_BOSS||gs===ST.SIREN_BOSS))triggerLightning();

    // Screen shake
    if(shakeI>0){shakeX=(Math.random()-.5)*shakeI*2;shakeY=(Math.random()-.5)*shakeI*2;shakeI*=.85;if(shakeI<.3)shakeI=0}else{shakeX=0;shakeY=0}

    // Dialog
    if(dlg.act){dlg.tm--;if(dlg.tm<=0)dlg.act=false}

    // Player invincibility
    if(pl.inv>0)pl.inv--;

    // Check player death
    if(gs!==ST.TITLE&&gs!==ST.ENDING&&gs!==ST.GAMEOVER&&pl.hp<=0){
        pl.hp=0;pl.alive=false;
        shake(30);sRoar();sHit();
        pSpawn(pl.x+pl.w/2,pl.y+pl.h/2,50,'#ff0000',8,70);
        pSpawn(pl.x+pl.w/2,pl.y+pl.h/2,30,'#ff4444',6,50);
        gs=ST.GAMEOVER;st=0;
    }

    // Ambient sound
    ambientTimer++;if(ambientTimer>300){ambientTimer=0;sAmbient()}

    switch(gs){
        case ST.TITLE:updateTitle(dt);break;
        case ST.FOREST:case ST.FOREST2:updateForest(dt);break;
        case ST.CAT_INTRO:updateCatIntro(dt);break;
        case ST.CAT_BOSS:updateCatBoss(dt);break;
        case ST.SIREN_INTRO:updateSirenIntro(dt);break;
        case ST.SIREN_BOSS:updateSirenBoss(dt);break;
        case ST.ENDING:updateEnding(dt);break;
        case ST.GAMEOVER:updateGameOver(dt);break;
    }

    pUpdate(dt);
}

function updateTitle(dt){
    if(keys['enter']||mouse.down){mouse.down=false;resetGame();gs=ST.FOREST;st=0;sAmbient()}
}

function playerMove(dt){
    let mx=0;
    if(keys['a']||keys['arrowleft'])mx=-1;
    if(keys['d']||keys['arrowright'])mx=1;
    pl.vx=mx*pl.spd;if(mx!==0)pl.fc=mx;
    pl.vy+=gravity*dt;if(pl.vy>650)pl.vy=650;
    if((keys[' ']||keys['arrowup'])&&pl.grd){pl.vy=pl.jf;pl.grd=false;sfx(140,'sine',.04,.08)}
    pl.x+=pl.vx*dt;pl.y+=pl.vy*dt;
    pl.x=Math.max(20,Math.min(W-20,pl.x));
    const gy=430;if(pl.y+pl.h>=gy){pl.y=gy-pl.h;pl.vy=0;pl.grd=true}
    if(keys['e']&&pl.attCd<=0){pl.att=true;pl.attT=18;pl.attCd=28;sfx(40,'sawtooth',.06,.12)}
    if(pl.attT>0)pl.attT--;if(pl.attT<=0)pl.att=false;if(pl.attCd>0)pl.attCd--;
}

function updateForest(dt){
    playerMove(dt);
    if(gs===ST.FOREST&&pl.x>W-60&&!dlg.act){gs=ST.CAT_INTRO;st=0;pl.x=W-100;dialog('🐱 CARTOON CAT: "Well, well... a lost little human in MY forest. You look absolutely delicious. Let me STRETCH my arms a bit..."',180);sRoar()}
    if(gs===ST.FOREST2&&pl.x>W-60&&!dlg.act){gs=ST.SIREN_INTRO;st=0;pl.x=W-100;dialog('📢 SIREN HEAD: *DEAFENING SIREN SCREECH* ...I sense your power... but can you handle... SUPER SAIYAN?!',180);sRoar()}
}

function updateCatIntro(dt){
    if(!dlg.act&&st>40){gs=ST.CAT_BOSS;st=0;pl.x=150;dialog('⚔️ BOSS FIGHT! Cartoon Cat — Beware his STRETCH attacks! ⚔️',120)}
}

function updateCatBoss(dt){
    playerMove(dt);
    const c=cat;
    c.fo=Math.sin(fc*.018)*6;

    // Stretch arm update
    if(c.str.ext){
        const dx=c.str.tx-c.str.sx,dy=c.str.ty-c.str.sy,dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<6||c.str.len>c.str.maxLen){c.str.ext=false;const hdx=c.str.tx-pl.x,hdy=c.str.ty-pl.y;if(Math.abs(hdx)<45&&Math.abs(hdy)<45&&pl.inv<=0){pl.hp-=18;pl.inv=45;shake(14);sHit();pSpawn(pl.x+pl.w/2,pl.y+pl.h/2,15,'#ff0',5,35)}}
        else{c.str.sx+=dx/dist*9*dt*60;c.str.sy+=dy/dist*9*dt*60;c.str.len+=2.5}
    }

    // AI
    c.atk++;if(c.atk>c.atkCd&&!c.str.ext&&!c.lunge){
        c.atk=0;c.cAtk=Math.random();
        if(c.cAtk<.45){c.str.ext=true;c.str.sx=c.x;c.str.sy=c.y-8;c.str.tx=pl.x+pl.w/2;c.str.ty=pl.y+pl.h/2;c.str.len=0;sStretch();pSpawn(c.x,c.y-8,8,'#ff0',3,25)}
        else if(c.cAtk<.75){c.lunge=true;c.lvx=(pl.x>c.x?180:-180);c.lvy=-250;if(c.lvx>0)c.fc_cache=1;else c.fc_cache=-1;pSpawn(c.x,c.y,20,'#fff',5,30);sRoar()}
        else{c.eGlow=35;pSpawn(c.x-16,c.y-18,10,'#ff0',3,30);pSpawn(c.x+16,c.y-16,10,'#ff0',3,30);if(Math.abs(pl.x-c.x)<160&&pl.inv<=0){pl.hp-=12;pl.inv=35;shake(10)}}
        c.atkCd=55+Math.random()*50
    }

    // Lunge
    if(c.lunge){c.x+=c.lvx*dt;c.y+=c.lvy*dt;c.lvy+=400*dt;if(c.y>=c.by){c.y=c.by;c.lunge=false}if(c.x<100||c.x>W-100)c.lvx*=-1;if(Math.abs(pl.x-c.x)<55&&pl.inv<=0){pl.hp-=20;pl.inv=50;shake(18);sHit();c.lunge=false}}

    // Eye glow
    if(c.eGlow>0)c.eGlow--;

    // Player hits boss
    if(pl.att&&Math.abs(pl.x-c.x)<85&&Math.abs(pl.y-c.y)<100){c.hp-=pl.dmg;pl.att=false;pl.attT=0;sHit();shake(8);pSpawn(c.x,c.y-20,15,'#ff4400',5,35);
        if(c.hp<=0){c.def=true;pSpawn(c.x,c.y,60,'#ff4400',9,70);pSpawn(c.x,c.y,40,'#ffaa00',7,55);sPower();shake(22);dialog('💀 CARTOON CAT DEFEATED! But... something MUCH worse lurks deeper in the forest...',180);setTimeout(()=>{gs=ST.FOREST2;pl.x=50;pl.hp=Math.min(pl.mhp,pl.hp+60);pSpawn(pl.x,pl.y,20,'#0f0',4,30)},2200)}
    }
}

function updateSirenIntro(dt){
    if(!dlg.act&&st>40){gs=ST.SIREN_BOSS;st=0;pl.x=150;dialog('⚔️ FINAL BOSS! Siren Head — When enraged he goes SUPER SAIYAN! ⚔️',120)}
}

function updateSirenBoss(dt){
    playerMove(dt);
    const s=sir;

    // SSJ check
    if(s.hp<s.mhp*.35&&!s.ssj){s.ssj=true;s.ssjT=0;sSSJ();shake(18);pSpawn(s.x,s.y-s.h/2,50,'#ffd700',9,60);dialog('⚡⚡ SIREN HEAD GOES SUPER SAIYAN!!! ⚡⚡',130)}

    if(s.ssj){s.ssjT++;s.atkCd=Math.max(22,s.atkCd-.4)}

    // Scream wave
    if(s.scr.act){s.scr.r+=5*dt*60;if(s.scr.r>s.scr.mr){s.scr.act=false;s.scr.r=0}if(s.scr.act&&Math.abs(pl.x-s.x)<s.scr.r+55&&pl.inv<=0){const d=s.ssj?22:14;pl.hp-=d;pl.inv=55;shake(d);sHit();pSpawn(pl.x+pl.w/2,pl.y+pl.h/2,18,'#ff6600',5,40)}}

    // AI
    s.atk++;if(s.atk>s.atkCd&&!s.scr.act&&!s.rush){
        s.atk=0;s.cAtk=Math.random();
        if(s.cAtk<.55){s.scr.act=true;s.scr.r=8;sScream();pSpawn(s.x-24,s.y-s.h/2-80,12,'#ff5500',4,35);pSpawn(s.x+24,s.y-s.h/2-80,12,'#ff5500',4,35)}
        else if(s.cAtk<.82){shake(12);pSpawn(s.x,H-132,25,'#6b4a20',7,40);if(pl.grd&&Math.abs(pl.x-s.x)<220&&pl.inv<=0){pl.hp-=(s.ssj?16:11);pl.inv=40}}
        else{s.rush=true;s.rvx=(pl.x>s.x?160:-160);pSpawn(s.x,s.y,12,'#453020',5,30)}
        s.atkCd=45+Math.random()*55
    }

    // Rush
    if(s.rush){s.x+=s.rvx*dt;if(s.x<130||s.x>W-50)s.rvx*=-1;if(Math.abs(pl.x-s.x)<55&&pl.inv<=0){pl.hp-=(s.ssj?24:18);pl.inv=50;shake(16);sHit();s.rush=false}}

    // Player hits boss
    if(pl.att&&Math.abs(pl.x-s.x)<65&&Math.abs(pl.y-s.y)<160){s.hp-=pl.dmg;pl.att=false;pl.attT=0;sHit();shake(6);const sc=s.ssj?'#ffd700':'#ff4400';pSpawn(s.x,s.y-50,12,sc,4,30);
        if(s.hp<=0){s.def=true;pSpawn(s.x,s.y,80,'#ffd700',11,90);pSpawn(s.x,s.y,60,'#ff4400',9,70);sPower();shake(28);dialog('🏆 SIREN HEAD DEFEATED! The nightmare is over! Time to celebrate! 🏆',200);
            setTimeout(()=>{gs=ST.ENDING;st=0;bendy.gp=1;bendy.gt=0;cup.ojP=1;cup.ojT=0;cup.pzV=true;sWin();
                setTimeout(()=>bendy.gp=2,1500);setTimeout(()=>bendy.gp=3,3000);
                setTimeout(()=>cup.ojP=2,2000);setTimeout(()=>cup.ojP=3,4000)},2200)}
    }
}

function updateGameOver(dt){
    st++;
    if(st>120&&(keys['enter']||mouse.down)){mouse.down=false;fullReset();sAmbient()}
}

function updateEnding(dt){
    st++;bendy.gt++;cup.ojT++;
    if(bendy.gt%22===0&&bendy.gp>=1)sDance();

    // Mr. Krabs sequence
    if(st>130&&!krabs.visible){krabs.visible=true;krabs.phase=1;krabs.timer=0;sfxRoar()}
    if(krabs.visible){
        krabs.timer++;
        // Phase 1: Appears with money text
        if(krabs.timer>40&&krabs.phase===1){krabs.phase=2;krabs.moneyText=100;krabs.moneyRain=100;sfxPower()}
        // Phase 2: Starts getting fried
        if(krabs.timer>80&&krabs.phase===2){krabs.phase=3;krabs.fryLevel=1}
        // Phase 3: Progressively fried
        if(krabs.phase>=3){if(krabs.fryLevel<100)krabs.fryLevel+=.8;if(krabs.fryLevel>50&&krabs.fryTimer%30===0)sfx(30,'sawtooth',.1,.3);krabs.fryTimer++}
        // Money text fade
        if(krabs.moneyText>0)krabs.moneyText-=.5;
        if(krabs.moneyRain>0)krabs.moneyRain-=.3;
        // Sizzle sound
        if(krabs.fryLevel>20&&krabs.fryTimer%15===0)sfx(25,'sawtooth',.05,.2);
    }

    if(st>250&&(keys['enter']||mouse.down)){mouse.down=false;fullReset();sAmbient()}
}

function fullReset(){
    pl.x=80;pl.y=400;pl.vx=0;pl.vy=0;pl.hp=100;pl.inv=0;pl.att=false;pl.attT=0;pl.attCd=0;pl.alive=true;
    cat.x=780;cat.y=360;cat.hp=250;cat.ph=0;cat.atk=0;cat.atkCd=70;cat.cAtk=0;cat.str.ext=false;cat.def=false;cat.fo=0;cat.eGlow=0;cat.lunge=false;
    sir.x=800;sir.y=270;sir.hp=400;sir.ph=0;sir.atk=0;sir.atkCd=55;sir.ssj=false;sir.ssjT=0;sir.def=false;sir.scr.act=false;sir.rush=false;
    bendy.gp=0;bendy.gt=0;bendy.db=0;bendy.spark=0;
    cup.pzT=0;cup.pzB=0;cup.ojP=0;cup.ojT=0;cup.pzV=false;cup.spark=0;
    krabs.phase=0;krabs.timer=0;krabs.fryLevel=0;krabs.fryTimer=0;krabs.frySmoke=0;krabs.moneyRain=0;krabs.moneyText=0;krabs.visible=false;krabs.flash=0;
    particles.length=0;dlg.act=false;gs=ST.TITLE;st=0;fc=0;ambientTimer=0;
    genTrees();for(const f of fog){f.x=Math.random()*W;f.y=Math.random()*H}
}

// ═══════════════ GAME OVER SCREEN ═══════════════
function drawGameOver(time){
    ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
    // Blood red vignette
    const rv=ctx.createRadialGradient(W/2,H/2,W*.25,W/2,H/2,W*.8);
    rv.addColorStop(0,'rgba(80,0,0,.3)');rv.addColorStop(.5,'rgba(40,0,0,.5)');rv.addColorStop(1,'rgba(0,0,0,.9)');
    ctx.fillStyle=rv;ctx.fillRect(0,0,W,H);

    // Trees silhouette
    for(let i=0;i<12;i++){ctx.fillStyle='#0a0000';ctx.fillRect(i*95-3,H-180-Math.sin(i)*25,18,200);ctx.beginPath();ctx.moveTo(i*95-18,H-180-Math.sin(i)*25);ctx.lineTo(i*95+6,H-230-Math.sin(i)*25-30);ctx.lineTo(i*95+36,H-180-Math.sin(i)*25);ctx.fill()}

    // Fog
    for(const f of fog){ctx.fillStyle=`rgba(40,10,5,${f.a*2})`;ctx.beginPath();ctx.arc(f.x,f.y,f.s*1.2,0,Math.PI*2);ctx.fill()}

    // Game over text
    const goGlow=.6+.4*Math.sin(time*.003);
    ctx.shadowColor='#ff0000';ctx.shadowBlur=40*goGlow;
    ctx.fillStyle='#cc0000';ctx.font='bold 72px "Courier New"';ctx.textAlign='center';
    ctx.fillText('GAME OVER',W/2,200);
    ctx.shadowBlur=0;

    ctx.fillStyle='#ff4444';ctx.font='bold 20px "Courier New"';
    ctx.fillText('The Forest Claims Another Victim...',W/2,250);

    // Blood drips
    for(let i=0;i<8;i++){const dx=100+Math.sin(i*1.5)*300,dy=270+i*30,dl=20+Math.sin(time*.002+i)*10;ctx.strokeStyle='#660000';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(dx,dy);ctx.lineTo(dx,dy+dl);ctx.stroke();for(let j=0;j<3;j++){ctx.fillStyle='#440000';ctx.beginPath();ctx.arc(dx+Math.sin(time*.01+j)*5,dy+dl+j*8,2+j,0,Math.PI*2);ctx.fill()}}

    if(st>60&&Math.floor(time/550)%2===0){ctx.fillStyle='#ff6644';ctx.font='bold 26px "Courier New"';ctx.fillText('PRESS ENTER TO TRY AGAIN',W/2,370)}

    ctx.fillStyle='rgba(255,150,100,.4)';ctx.font='14px "Courier New"';ctx.fillText('You were so close... The forest remembers.',W/2,420);
}

// ═══════════════ RENDER ═══════════════
function render(time){
    ctx.clearRect(0,0,W,H);
    ctx.save();ctx.translate(shakeX,shakeY);

    switch(gs){
        case ST.TITLE:drawTitle(time);break;
        case ST.FOREST:case ST.FOREST2:drawForest(time);drawPlayer(time);break;
        case ST.CAT_INTRO:drawForest(time);drawPlayer(time);drawCartoonCat(time);break;
        case ST.CAT_BOSS:drawForest(time);drawPlayer(time);drawCartoonCat(time);break;
        case ST.SIREN_INTRO:drawForest(time);drawPlayer(time);drawSirenHead(time);break;
        case ST.SIREN_BOSS:drawForest(time);drawPlayer(time);drawSirenHead(time);break;
        case ST.ENDING:drawEnding(time);break;
        case ST.GAMEOVER:drawGameOver(time);break;
    }

    pDraw(ctx);
    ctx.restore();
    if(gs!==ST.GAMEOVER)drawHUD();
    drawDialog();

    // Vignette
    if(gs!==ST.GAMEOVER){
        const vg=ctx.createRadialGradient(W/2,H/2,W*.3,W/2,H/2,W*.75);
        vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.5)');
        ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    }
}

// ═══════════════ MAIN LOOP ═══════════════
function gameLoop(timestamp){
    const dt=Math.min(.1,(timestamp-lt)/1000);lt=timestamp;
    update(dt);render(timestamp);requestAnimationFrame(gameLoop);
}

// Skip dialog on key
window.addEventListener('keydown',e=>{if(dlg.act&&dlg.tm<110){dlg.act=false;e.stopPropagation()}});
canvas.addEventListener('click',e=>{if(dlg.act&&dlg.tm<110)dlg.act=false});

// Start
gs=ST.TITLE;lt=performance.now();
requestAnimationFrame(gameLoop);
console.log('🌲 FOREST OF NIGHTMARES v2.0 - READY');
console.log('🎮 Controls: WASD move | SPACE jump | E attack');
console.log('🐱 Boss 1: Cartoon Cat — Stretch limb attacks');
console.log('📢 Boss 2: Siren Head — Super Saiyan transformation');
console.log('🕺 Ending: Bendy hits the Griddy + Cuphead Orange Justice & 🍕');
