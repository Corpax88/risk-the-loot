(function(){
  'use strict';

  const $=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d');
  const ui={base:$('baseView'),expedition:$('expeditionView'),bank:$('bankScrap'),best:$('bestDepth'),chassisLevel:$('chassisLevel'),weaponLevel:$('weaponLevel'),salvageLevel:$('salvageLevel'),maxHp:$('maxHpStat'),damage:$('damageStat'),magnet:$('magnetStat'),chassisCost:$('chassisCost'),weaponCost:$('weaponCost'),salvageCost:$('salvageCost'),upgradeChassis:$('upgradeChassis'),upgradeWeapon:$('upgradeWeapon'),upgradeSalvage:$('upgradeSalvage'),start:$('startButton'),notice:$('baseNotice'),healthText:$('healthText'),healthFill:$('healthFill'),runScrap:$('runScrap'),depth:$('depthText'),risk:$('riskText'),extract:$('extractButton'),extractOverlay:$('extractOverlay'),extractCount:$('extractCount'),cancelExtract:$('cancelExtract'),riskOverlay:$('riskOverlay'),riskScrap:$('riskScrap'),nextMultiplier:$('nextMultiplier'),riskExtract:$('riskExtract'),riskPush:$('riskPush'),sound:$('soundButton'),joystick:$('joystick'),knob:$('joystickKnob'),dash:$('dashButton')};
  const SAVE_KEY='scrapbound_prototype_v1',WORLD={w:2400,h:1600};
  let save=loadSave(),mode='base',W=960,H=540,dpr=1,last=0,elapsed=0,spawnClock=0,shake=0,flash=0,depthPulse=0,extracting=0,runScrap=0,depth=1,riskTier=0,decision=false;
  let player,enemies=[],bullets=[],enemyBullets=[],scraps=[],particles=[],decor=[];
  const keys={},stick={active:false,id:null,x:0,y:0},audio={ctx:null,enabled:true};

  function loadSave(){
    try{let data=Object.assign({scrap:0,rig:0,best:0},JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')),legacy=Math.max(0,Number(data.rig)||0);data.chassis=data.chassis==null?legacy:Number(data.chassis)||0;data.weapon=data.weapon==null?legacy:Number(data.weapon)||0;data.salvage=data.salvage==null?0:Number(data.salvage)||0;return data}
    catch(e){return {scrap:0,best:0,chassis:0,weapon:0,salvage:0}}
  }
  function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch(e){}}
  function upgradePrice(type){let base=type==='chassis'?30:type==='weapon'?35:40;return Math.floor(base*Math.pow(1.62,save[type]||0))}
  function maxHp(){return 100+save.chassis*18}
  function shotDamage(){return 8+save.weapon*2}
  function magnetRange(){return 85+save.salvage*12}
  function lootMultiplier(nextTier){return (1+(depth-1)*.12)*(1+(nextTier==null?riskTier:nextTier)*.35)*(1+save.salvage*.06)}

  function resize(){
    const r=canvas.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);W=Math.max(1,r.width);H=Math.max(1,r.height);
    canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function setView(next){mode=next;ui.base.classList.toggle('active',next==='base');ui.expedition.classList.toggle('active',next==='run');if(next==='run')requestAnimationFrame(()=>{resize();last=performance.now()})}
  function refreshBase(){ui.bank.textContent=Math.floor(save.scrap);ui.best.textContent=save.best;ui.chassisLevel.textContent=save.chassis;ui.weaponLevel.textContent=save.weapon;ui.salvageLevel.textContent=save.salvage;ui.maxHp.textContent=maxHp();ui.damage.textContent=shotDamage();ui.magnet.textContent=magnetRange();for(const type of ['chassis','weapon','salvage']){let button=ui['upgrade'+type[0].toUpperCase()+type.slice(1)],cost=upgradePrice(type);ui[type+'Cost'].textContent=cost;button.disabled=save.scrap<cost}}
  function notice(text,tone){ui.notice.textContent=text;ui.notice.style.borderColor=tone||'';ui.notice.classList.add('show');clearTimeout(notice.t);notice.t=setTimeout(()=>ui.notice.classList.remove('show'),1800)}

  function sound(name){
    if(!audio.enabled)return;try{audio.ctx=audio.ctx||new (window.AudioContext||window.webkitAudioContext)();let a=audio.ctx,o=a.createOscillator(),g=a.createGain(),t=a.currentTime,f=name==='hit'?95:name==='pickup'?620:name==='shoot'?240:name==='hurt'?70:name==='upgrade'?420:160;o.type=name==='pickup'||name==='upgrade'?'triangle':'square';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,f*(name==='hurt'?.45:1.7)),t+.09);g.gain.setValueAtTime(.035,t);g.gain.exponentialRampToValueAtTime(.0001,t+.11);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+.12)}catch(e){}
  }

  function startRun(){
    player={x:WORLD.w/2,y:WORLD.h/2,r:18,hp:maxHp(),maxHp:maxHp(),speed:235,fire:0,inv:0,angle:0,dashCd:0,dashTime:0,dashX:1,dashY:0,lastX:1,lastY:0};
    enemies=[];bullets=[];enemyBullets=[];scraps=[];particles=[];decor=[];elapsed=0;spawnClock=.4;runScrap=0;depth=1;riskTier=0;decision=false;depthPulse=0;extracting=0;shake=0;flash=0;
    for(let i=0;i<85;i++)decor.push({x:80+Math.random()*(WORLD.w-160),y:80+Math.random()*(WORLD.h-160),r:8+Math.random()*24,type:Math.floor(Math.random()*4),rot:Math.random()*6});
    for(let i=0;i<22;i++)spawnScrap(100+Math.random()*(WORLD.w-200),100+Math.random()*(WORLD.h-200),1+Math.floor(Math.random()*3),false);
    ui.extractOverlay.classList.remove('show');ui.riskOverlay.classList.remove('show');setView('run');updateHud();sound('start');
  }
  function returnBase(survived){
    if(survived){save.scrap+=runScrap;save.best=Math.max(save.best,depth);persist();notice('+'+runScrap+' SCRAP SECURED','#47c5b6')}
    else notice(runScrap+' SCRAP LOST','#ef5350');
    decision=false;extracting=0;ui.riskOverlay.classList.remove('show');ui.extractOverlay.classList.remove('show');setView('base');refreshBase();
  }
  function beginExtract(){if(mode!=='run'||extracting)return;extracting=3.25;ui.extractOverlay.classList.add('show');sound('pickup')}
  function cancelExtract(){extracting=0;ui.extractOverlay.classList.remove('show')}
  function showRiskDecision(){decision=true;ui.riskScrap.textContent=runScrap;ui.nextMultiplier.textContent='x'+lootMultiplier(riskTier+1).toFixed(2);ui.riskOverlay.classList.add('show');sound('upgrade')}
  function pushDeeper(){if(!decision)return;decision=false;riskTier++;ui.riskOverlay.classList.remove('show');depthPulse=1.15;spawnEnemy(true);for(let i=0;i<Math.min(4,1+riskTier);i++)spawnEnemy(false,'rusher');shake=7;sound('start');updateHud()}
  function extractFromRisk(){if(!decision)return;decision=false;ui.riskOverlay.classList.remove('show');beginExtract()}
  function tryDash(){if(mode!=='run'||decision||!player||player.dashCd>0)return;let move=movement(),dx=move.x||player.lastX||Math.cos(player.angle),dy=move.y||player.lastY||Math.sin(player.angle),l=Math.hypot(dx,dy)||1;player.dashX=dx/l;player.dashY=dy/l;player.dashTime=.16;player.dashCd=2.2;player.inv=Math.max(player.inv,.24);shake=3;burst(player.x,player.y,'#47c5b6',10,.8);sound('pickup')}

  function spawnEnemy(elite,forcedType){
    let x=player.x,y=player.y;for(let tries=0;tries<8;tries++){let a=Math.random()*Math.PI*2,d=540+Math.random()*260;x=Math.max(35,Math.min(WORLD.w-35,player.x+Math.cos(a)*d));y=Math.max(35,Math.min(WORLD.h-35,player.y+Math.sin(a)*d));if(Math.hypot(x-player.x,y-player.y)>390)break}
    let roll=Math.random(),type=forcedType||(depth>=3&&roll<.24?'brute':depth>=2&&roll<.48?'shooter':'rusher'),base=type==='brute'?{r:24,hp:44,speed:52,damage:18}:{r:type==='shooter'?17:15,hp:type==='shooter'?23:15,speed:type==='shooter'?68:108,damage:type==='shooter'?9:10},scale=1+(depth-1)*.17+riskTier*.12;
    enemies.push({x,y,r:base.r*(elite?1.18:1),hp:base.hp*scale*(elite?2.25:1),max:base.hp*scale*(elite?2.25:1),speed:base.speed*(1+depth*.018)*(elite?1.08:1),damage:base.damage*(elite?1.35:1),hit:0,attack:0,fire:.8+Math.random(),charge:0,type,elite:!!elite,angle:0,strafe:Math.random()<.5?-1:1});
  }
  function spawnScrap(x,y,value,burst){
    scraps.push({x:x+(burst?(Math.random()-.5)*24:0),y:y+(burst?(Math.random()-.5)*24:0),r:7,value,spin:Math.random()*6,vx:burst?(Math.random()-.5)*110:0,vy:burst?(Math.random()-.5)*110:0});
  }
  function burst(x,y,color,count,power){for(let i=0;i<count;i++){let a=Math.random()*Math.PI*2,s=(20+Math.random()*80)*(power||1);particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.25+Math.random()*.35,max:.6,r:1.5+Math.random()*3,color})}}

  function movement(){
    let x=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0)+stick.x,y=(keys.ArrowDown||keys.KeyS?1:0)-(keys.ArrowUp||keys.KeyW?1:0)+stick.y,l=Math.hypot(x,y);return l>.05?{x:x/l,y:y/l}:{x:0,y:0};
  }
  function nearestEnemy(range){let best=null,dist=range*range;for(const e of enemies){let dx=e.x-player.x,dy=e.y-player.y,d=dx*dx+dy*dy;if(d<dist){dist=d;best=e}}return best}
  function damagePlayer(amount){if(player.inv>0)return false;player.hp-=amount;player.inv=.6;shake=10;flash=.16;burst(player.x,player.y,'#ef5350',12,1);sound('hurt');if(player.hp<=0){player.hp=0;updateHud();returnBase(false);return true}return false}

  function update(dt){
    if(mode!=='run'||decision)return;elapsed+=dt;let nextDepth=1+Math.floor(elapsed/18);if(nextDepth>depth){depth=nextDepth;depthPulse=1.15;sound('upgrade');if(!extracting&&depth%2===0){showRiskDecision();updateHud();return}}
    let move=movement();player.inv=Math.max(0,player.inv-dt);player.fire-=dt;player.dashCd=Math.max(0,player.dashCd-dt);if(player.dashTime>0){player.dashTime-=dt;player.x+=player.dashX*820*dt;player.y+=player.dashY*820*dt;if(Math.random()<.72)particles.push({x:player.x-player.dashX*18,y:player.y-player.dashY*18,vx:-player.dashX*40,vy:-player.dashY*40,life:.22,max:.22,r:7,color:'#47c5b6'})}else{player.x+=move.x*player.speed*dt;player.y+=move.y*player.speed*dt;if(move.x||move.y){player.lastX=move.x;player.lastY=move.y;player.angle=Math.atan2(move.y,move.x)}}player.x=Math.max(player.r,Math.min(WORLD.w-player.r,player.x));player.y=Math.max(player.r,Math.min(WORLD.h-player.r,player.y));
    spawnClock-=dt;let interval=Math.max(.24,1.12-depth*.065-riskTier*.035);if(spawnClock<=0){spawnClock=interval*(.72+Math.random()*.55);spawnEnemy();if(depth>=5&&Math.random()<.18)spawnEnemy()}
    let target=nearestEnemy(430);if(target&&player.fire<=0){let dx=target.x-player.x,dy=target.y-player.y,l=Math.hypot(dx,dy)||1;player.angle=Math.atan2(dy,dx);player.fire=Math.max(.2,.48-save.weapon*.018);bullets.push({x:player.x+dx/l*24,y:player.y+dy/l*24,vx:dx/l*520,vy:dy/l*520,r:5,life:1.1,damage:shotDamage()});sound('shoot')}
    for(const b of bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;for(const e of enemies){if(e.dead||b.dead)continue;let dx=e.x-b.x,dy=e.y-b.y;if(dx*dx+dy*dy<(e.r+b.r)*(e.r+b.r)){e.hp-=b.damage;e.hit=.12;b.dead=true;burst(b.x,b.y,'#f2c14f',5,.7);sound('hit');if(e.hp<=0){e.dead=true;shake=Math.max(shake,e.elite?7:3);let reward=(e.type==='brute'?4:e.type==='shooter'?2:1)+(e.elite?7:0)+Math.floor((depth-1)*.24);for(let i=0;i<reward;i++)spawnScrap(e.x,e.y,1,true);burst(e.x,e.y,e.elite?'#f2c14f':e.type==='brute'?'#d7863b':'#ef5350',e.elite?24:12,e.elite?1.5:1)}}}}
    bullets=bullets.filter(b=>!b.dead&&b.life>0);
    for(const e of enemies){if(e.dead)continue;e.hit=Math.max(0,e.hit-dt);e.attack=Math.max(0,e.attack-dt);e.fire-=dt;let dx=player.x-e.x,dy=player.y-e.y,l=Math.hypot(dx,dy)||1,nx=dx/l,ny=dy/l;e.angle=Math.atan2(dy,dx);if(e.type==='shooter'){let approach=l>315?1:l<205?-1:0;e.x+=(nx*approach-ny*.48*e.strafe)*e.speed*dt;e.y+=(ny*approach+nx*.48*e.strafe)*e.speed*dt;if(e.charge>0){e.charge-=dt;if(e.charge<=0){let speed=205+depth*5;enemyBullets.push({x:e.x+nx*22,y:e.y+ny*22,vx:nx*speed,vy:ny*speed,r:e.elite?8:6,life:3.4,damage:e.damage});sound('shoot')}}else if(e.fire<=0){e.charge=.48;e.fire=Math.max(.8,2.2-depth*.055-riskTier*.08)}}else{e.x+=nx*e.speed*dt;e.y+=ny*e.speed*dt}if(l<e.r+player.r+3&&e.attack<=0){e.attack=.72;if(damagePlayer(e.damage))return}}
    enemies=enemies.filter(e=>!e.dead);
    for(const b of enemyBullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;let dx=b.x-player.x,dy=b.y-player.y;if(dx*dx+dy*dy<(b.r+player.r)*(b.r+player.r)){b.dead=true;if(damagePlayer(b.damage))return}}enemyBullets=enemyBullets.filter(b=>!b.dead&&b.life>0&&b.x>-30&&b.y>-30&&b.x<WORLD.w+30&&b.y<WORLD.h+30);
    const magnet=magnetRange();for(const s of scraps){s.spin+=dt*4;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vx*=Math.pow(.02,dt);s.vy*=Math.pow(.02,dt);let dx=player.x-s.x,dy=player.y-s.y,l=Math.hypot(dx,dy)||1;if(l<magnet){let pull=(1-l/magnet)*820;s.x+=dx/l*pull*dt;s.y+=dy/l*pull*dt}if(l<player.r+s.r+5){s.dead=true;runScrap+=Math.max(1,Math.ceil(s.value*lootMultiplier()));burst(s.x,s.y,'#47c5b6',5,.45);sound('pickup')}}scraps=scraps.filter(s=>!s.dead);
    for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.06,dt);p.vy*=Math.pow(.06,dt);p.life-=dt}particles=particles.filter(p=>p.life>0);shake*=Math.pow(.02,dt);flash=Math.max(0,flash-dt);depthPulse=Math.max(0,depthPulse-dt);
    if(extracting>0){extracting-=dt;ui.extractCount.textContent=Math.max(1,Math.ceil(extracting));if(extracting<=0){ui.extractOverlay.classList.remove('show');returnBase(true);return}}
    updateHud();
  }

  function camera(){return{x:Math.max(W/2,Math.min(WORLD.w-W/2,player.x)),y:Math.max(H/2,Math.min(WORLD.h-H/2,player.y))}}
  function worldToScreen(x,y,cam){return{x:x-cam.x+W/2,y:y-cam.y+H/2}}
  function roundedRect(x,y,w,h,r){
    ctx.beginPath();
    if(ctx.roundRect){ctx.roundRect(x,y,w,h,r);return}
    r=Math.min(r,w/2,h/2);ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
  }
  function drawGear(x,y,r,rot,color){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle=color;for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.fillRect(r*.72,-r*.14,r*.42,r*.28)}ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#131719';ctx.beginPath();ctx.arc(0,0,r*.38,0,Math.PI*2);ctx.fill();ctx.restore()}

  function draw(){
    if(mode!=='run')return;ctx.clearRect(0,0,W,H);let cam=camera(),sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;ctx.save();ctx.translate(sx,sy);let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#20292a');g.addColorStop(1,'#101516');ctx.fillStyle=g;ctx.fillRect(-10,-10,W+20,H+20);
    let grid=80,ox=(-cam.x+W/2)%grid,oy=(-cam.y+H/2)%grid;ctx.strokeStyle='#75808412';ctx.lineWidth=1;for(let x=ox;x<W;x+=grid){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=oy;y<H;y+=grid){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    for(const d of decor){let p=worldToScreen(d.x,d.y,cam);if(p.x<-60||p.x>W+60||p.y<-60||p.y>H+60)continue;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(d.rot);if(d.type===0)drawGear(0,0,d.r,d.rot,'#3d4547');else if(d.type===1){ctx.fillStyle='#463425';ctx.fillRect(-d.r,-d.r*.55,d.r*2,d.r*1.1);ctx.strokeStyle='#72543a';ctx.strokeRect(-d.r,-d.r*.55,d.r*2,d.r*1.1)}else if(d.type===2){ctx.strokeStyle='#48575a';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,d.r,-2.5,1.4);ctx.stroke()}else{ctx.fillStyle='#2b3437';ctx.beginPath();ctx.moveTo(-d.r,d.r);ctx.lineTo(0,-d.r);ctx.lineTo(d.r,d.r);ctx.fill()}ctx.restore()}
    for(const s of scraps){let p=worldToScreen(s.x,s.y,cam);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(s.spin);ctx.fillStyle='#4bd5c3';ctx.strokeStyle='#172a29';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<6;i++){let a=i*Math.PI/3;ctx.lineTo(Math.cos(a)*s.r,Math.sin(a)*s.r)}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#dffbf5';ctx.fillRect(-1,-4,2,5);ctx.restore()}
    for(const b of bullets){let p=worldToScreen(b.x,b.y,cam);ctx.strokeStyle='#f2c14f66';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(p.x-b.vx*.025,p.y-b.vy*.025);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.fillStyle='#fff2ac';ctx.beginPath();ctx.arc(p.x,p.y,b.r,0,Math.PI*2);ctx.fill()}
    for(const b of enemyBullets){let p=worldToScreen(b.x,b.y,cam);ctx.strokeStyle='#ef535055';ctx.lineWidth=b.r*1.2;ctx.beginPath();ctx.moveTo(p.x-b.vx*.04,p.y-b.vy*.04);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.fillStyle='#ff6b62';ctx.beginPath();ctx.arc(p.x,p.y,b.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffd0b0';ctx.beginPath();ctx.arc(p.x-2,p.y-2,b.r*.35,0,Math.PI*2);ctx.fill()}
    for(const e of enemies){let p=worldToScreen(e.x,e.y,cam);if(e.charge>0){let aim=worldToScreen(player.x,player.y,cam);ctx.strokeStyle='rgba(239,83,80,'+(.25+(.48-e.charge)*.9)+')';ctx.lineWidth=2;ctx.setLineDash([7,7]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(aim.x,aim.y);ctx.stroke();ctx.setLineDash([])}ctx.save();ctx.translate(p.x,p.y);ctx.rotate(e.angle);if(e.elite){ctx.strokeStyle='#f2c14f88';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,e.r*1.45,0,Math.PI*2);ctx.stroke()}ctx.fillStyle=e.hit?'#fff0c2':e.type==='brute'?'#7d482d':e.type==='shooter'?'#49324e':'#642f2d';ctx.strokeStyle=e.elite?'#f2c14f':'#101315';ctx.lineWidth=4;if(e.type==='shooter'){ctx.beginPath();ctx.moveTo(e.r,0);ctx.lineTo(0,e.r*.82);ctx.lineTo(-e.r,0);ctx.lineTo(0,-e.r*.82);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#2a3032';ctx.fillRect(e.r*.3,-4,e.r*1.05,8);ctx.fillStyle=e.charge>0?'#fff0c2':'#ef5350';ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill()}else{roundedRect(-e.r,-e.r*.72,e.r*2,e.r*1.44,e.type==='brute'?8:5);ctx.fill();ctx.stroke();ctx.fillStyle='#ef5350';ctx.beginPath();ctx.arc(e.r*.35,-e.r*.18,e.elite?4.5:3.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2a3032';ctx.fillRect(-e.r*1.25,-4,e.r*.7,8);if(e.type==='brute')drawGear(-e.r*.55,0,e.r*.45,elapsed*2,'#a76a35')}ctx.restore();let hp=e.hp/e.max;if(hp<1||e.elite){ctx.fillStyle='#2a1717';ctx.fillRect(p.x-e.r,p.y-e.r-11,e.r*2,4);ctx.fillStyle=e.elite?'#f2c14f':'#ef5350';ctx.fillRect(p.x-e.r,p.y-e.r-11,e.r*2*hp,4)}}
    let pp=worldToScreen(player.x,player.y,cam);ctx.save();ctx.translate(pp.x,pp.y);ctx.rotate(player.angle);if(player.inv>0&&player.dashTime<=0&&Math.floor(player.inv*16)%2===0)ctx.globalAlpha=.4;if(player.dashTime>0){ctx.strokeStyle='#47c5b6aa';ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,player.r+6,0,Math.PI*2);ctx.stroke()}ctx.fillStyle='#283438';ctx.strokeStyle='#0a0d0e';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,player.r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#47c5b6';ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.shadowColor='#47c5b6';ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#d7863b';ctx.fillRect(8,-5,22,10);ctx.fillStyle='#f2c14f';ctx.beginPath();ctx.arc(5,-7,3,0,Math.PI*2);ctx.arc(5,7,3,0,Math.PI*2);ctx.fill();ctx.restore();
    for(const p of particles){let q=worldToScreen(p.x,p.y,cam);ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.fillRect(q.x-p.r/2,q.y-p.r/2,p.r,p.r)}ctx.globalAlpha=1;
    let vignette=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.72);vignette.addColorStop(.55,'#0000');vignette.addColorStop(1,'#0009');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);if(flash>0){ctx.fillStyle='rgba(239,83,80,'+(flash*1.8)+')';ctx.fillRect(0,0,W,H)}ctx.restore();
    if(depthPulse>0){let a=Math.min(1,depthPulse*1.8),scale=1+(1.15-depthPulse)*.08;ctx.save();ctx.globalAlpha=a;ctx.translate(W/2,H*.22);ctx.scale(scale,scale);ctx.textAlign='center';ctx.font='900 12px Segoe UI,Arial';ctx.fillStyle='#9aa5aa';ctx.fillText('DESCENT',0,-13);ctx.font='900 34px Segoe UI,Arial';ctx.fillStyle='#f2c14f';ctx.fillText('DEPTH '+depth,0,22);ctx.restore()}
  }

  function updateHud(){let hp=Math.max(0,player?player.hp:0),max=player?player.maxHp:maxHp(),danger=depth+riskTier*2,mult=lootMultiplier();ui.healthText.textContent=Math.ceil(hp)+' / '+max;ui.healthFill.style.width=(hp/max*100)+'%';ui.runScrap.textContent=runScrap;ui.depth.textContent=depth;let risk=danger<3?'LOW':danger<7?'RISING':danger<11?'HIGH':'EXTREME';ui.risk.textContent=risk+' x'+mult.toFixed(1);ui.risk.style.color=danger<3?'#7ccf63':danger<7?'#f2c14f':'#ef5350';if(player){let ready=Math.max(0,1-player.dashCd/2.2);ui.dash.style.setProperty('--ready',ready*360+'deg');ui.dash.classList.toggle('cooling',player.dashCd>0)}}
  function loop(now){let dt=Math.min(.033,(now-last)/1000||0);last=now;update(dt);draw();requestAnimationFrame(loop)}

  function buyUpgrade(type){let cost=upgradePrice(type);if(save.scrap<cost)return;save.scrap-=cost;save[type]++;persist();refreshBase();notice(type.toUpperCase()+' UPGRADED','#f2c14f');sound('upgrade')}
  ui.start.addEventListener('click',startRun);ui.extract.addEventListener('click',beginExtract);ui.cancelExtract.addEventListener('click',cancelExtract);ui.riskExtract.addEventListener('click',extractFromRisk);ui.riskPush.addEventListener('click',pushDeeper);ui.upgradeChassis.addEventListener('click',()=>buyUpgrade('chassis'));ui.upgradeWeapon.addEventListener('click',()=>buyUpgrade('weapon'));ui.upgradeSalvage.addEventListener('click',()=>buyUpgrade('salvage'));ui.dash.addEventListener('pointerdown',e=>{e.preventDefault();tryDash()});ui.sound.addEventListener('click',()=>{audio.enabled=!audio.enabled;ui.sound.textContent=audio.enabled?'♪':'×';if(audio.enabled)sound('pickup')});
  window.addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='Space'&&!e.repeat)tryDash();if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault()});window.addEventListener('keyup',e=>keys[e.code]=false);window.addEventListener('resize',resize);
  function stickMove(e){let r=ui.joystick.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2),m=r.width*.34,l=Math.hypot(x,y)||1,cl=Math.min(m,l);stick.x=x/l*(cl/m);stick.y=y/l*(cl/m);ui.knob.style.transform='translate('+(stick.x*m)+'px,'+(stick.y*m)+'px)'}
  ui.joystick.addEventListener('pointerdown',e=>{stick.active=true;stick.id=e.pointerId;ui.joystick.setPointerCapture(e.pointerId);stickMove(e)});ui.joystick.addEventListener('pointermove',e=>{if(stick.active&&e.pointerId===stick.id)stickMove(e)});function stickEnd(e){if(e.pointerId!==stick.id)return;stick.active=false;stick.x=stick.y=0;ui.knob.style.transform=''}ui.joystick.addEventListener('pointerup',stickEnd);ui.joystick.addEventListener('pointercancel',stickEnd);
  let lastTouchEnd=0,lastTouchTarget=null;document.addEventListener('touchend',e=>{let now=Date.now(),button=e.target.closest&&e.target.closest('button');if(now-lastTouchEnd<340&&e.target===lastTouchTarget){e.preventDefault();if(button&&!button.disabled)button.click()}lastTouchEnd=now;lastTouchTarget=e.target},{passive:false});for(const event of ['gesturestart','gesturechange','gestureend','dblclick'])document.addEventListener(event,e=>e.preventDefault(),{passive:false});
  document.addEventListener('contextmenu',e=>e.preventDefault());refreshBase();setView('base');requestAnimationFrame(loop);
})();
