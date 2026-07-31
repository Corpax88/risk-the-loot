const {test,expect,devices}=require('@playwright/test');

const RAPID_SPIN_MS=30000;

async function installProbe(page){
  await page.addInitScript(()=>{
    localStorage.clear();
    const probe=window.__spinBrowserProbe={listenerAdds:0,listenerRemoves:0,timeOuts:new Set(),intervals:new Set(),rafs:new Set(),toDataUrls:0,drawImages:0};
    const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener;
    EventTarget.prototype.addEventListener=function(){probe.listenerAdds++;return Reflect.apply(add,this,arguments)};
    EventTarget.prototype.removeEventListener=function(){probe.listenerRemoves++;return Reflect.apply(remove,this,arguments)};
    const setTimeoutOriginal=window.setTimeout,clearTimeoutOriginal=window.clearTimeout;
    window.setTimeout=function(callback,delay,...args){let id;id=Reflect.apply(setTimeoutOriginal,window,[function(){probe.timeOuts.delete(id);return typeof callback==='function'?callback.apply(this,arguments):undefined},delay,...args]);probe.timeOuts.add(id);return id};
    window.clearTimeout=function(id){probe.timeOuts.delete(id);return Reflect.apply(clearTimeoutOriginal,window,[id])};
    const setIntervalOriginal=window.setInterval,clearIntervalOriginal=window.clearInterval;
    window.setInterval=function(callback,delay,...args){let id=Reflect.apply(setIntervalOriginal,window,[callback,delay,...args]);probe.intervals.add(id);return id};
    window.clearInterval=function(id){probe.intervals.delete(id);return Reflect.apply(clearIntervalOriginal,window,[id])};
    const requestAnimationFrameOriginal=window.requestAnimationFrame,cancelAnimationFrameOriginal=window.cancelAnimationFrame;
    window.requestAnimationFrame=function(callback){let id;id=Reflect.apply(requestAnimationFrameOriginal,window,[time=>{probe.rafs.delete(id);callback(time)}]);probe.rafs.add(id);return id};
    window.cancelAnimationFrame=function(id){probe.rafs.delete(id);return Reflect.apply(cancelAnimationFrameOriginal,window,[id])};
    const toDataUrlOriginal=HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL=function(){probe.toDataUrls++;return Reflect.apply(toDataUrlOriginal,this,arguments)};
    const drawImageOriginal=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage=function(){probe.drawImages++;return Reflect.apply(drawImageOriginal,this,arguments)};
  });
}

async function openPlaytest(page){
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(()=>window.__riskTest.setVisualQuality('medium'));
}

async function measureSpin(page,mode,duration,pointerType){
  return page.evaluate(async({mode,duration,pointerType})=>{
    const button=document.querySelector('#spinButton'),rect=button.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2,probe=window.__spinBrowserProbe;
    const before={listeners:probe.listenerAdds-probe.listenerRemoves,timeOuts:probe.timeOuts.size,intervals:probe.intervals.size,rafs:probe.rafs.size,toDataUrls:probe.toDataUrls,drawImages:probe.drawImages,heap:performance.memory&&performance.memory.usedJSHeapSize||0};
    const frames=[],samples=[];let running=true,pointerId=1000,inputCount=0,mutationCount=0,longTasks=[];
    const mutations=new MutationObserver(records=>mutationCount+=records.length);mutations.observe(document.documentElement,{attributes:true,childList:true,subtree:true,characterData:true});
    let longTaskObserver=null;try{longTaskObserver=new PerformanceObserver(list=>{for(const entry of list.getEntries())longTasks.push(entry.duration)});longTaskObserver.observe({entryTypes:['longtask']})}catch(error){}
    function emit(type,id,clientX=x,clientY=y){button.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:id,pointerType,isPrimary:true,button:0,buttons:type==='pointerup'||type==='pointercancel'?0:1,clientX,clientY,pressure:type==='pointerup'||type==='pointercancel'?0:.5}))}
    let raf=0,last=0;function frame(now){if(last)frames.push(now-last);last=now;if(running)raf=requestAnimationFrame(frame)}raf=requestAnimationFrame(frame);
    let sampleTimer=setInterval(()=>{let state=window.__riskTest.spinPerformanceState(),perf=window.__riskTest.performanceState();samples.push({effects:state.effects,particles:state.particles,projectiles:state.enemyProjectiles,pending:state.pending,instances:state.activeInstances,timeOuts:probe.timeOuts.size,rafs:probe.rafs.size,heap:performance.memory&&performance.memory.usedJSHeapSize||0,quality:perf.active})},100);
    let inputTimer=0,heldId=0;
    if(mode==='hold'){heldId=++pointerId;emit('pointerdown',heldId);inputCount++}
    else if(mode!=='idle'){let cadence=mode==='rapid'?38:330;inputTimer=setInterval(()=>{let id=++pointerId;emit('pointerdown',id);inputCount++;setTimeout(()=>emit('pointerup',id),mode==='rapid'?9:70)},cadence)}
    await new Promise(resolve=>setTimeout(resolve,duration));
    if(inputTimer)clearInterval(inputTimer);if(heldId)emit('pointerup',heldId);running=false;cancelAnimationFrame(raf);clearInterval(sampleTimer);mutations.disconnect();if(longTaskObserver)longTaskObserver.disconnect();
    await new Promise(resolve=>setTimeout(resolve,500));
    const state=window.__riskTest.spinPerformanceState(),perf=window.__riskTest.performanceState(),after={listeners:probe.listenerAdds-probe.listenerRemoves,timeOuts:probe.timeOuts.size,intervals:probe.intervals.size,rafs:probe.rafs.size,toDataUrls:probe.toDataUrls,drawImages:probe.drawImages,heap:performance.memory&&performance.memory.usedJSHeapSize||0};
    const usable=frames.filter(value=>value>0&&value<2000),sorted=usable.slice().sort((a,b)=>a-b),averageFrame=usable.reduce((sum,value)=>sum+value,0)/Math.max(1,usable.length),worstFrame=Math.max(0,...usable),middle=Math.floor(usable.length/2),halfFps=half=>{let list=half?usable.slice(middle):usable.slice(0,middle),total=list.reduce((sum,value)=>sum+value,0);return total?list.length*1000/total:0},maxOf=key=>Math.max(0,...samples.map(sample=>sample[key]||0));
    return{mode,duration,inputCount,frames:usable.length,averageFps:Math.round(100000/averageFrame)/100,lowestFps:worstFrame?Math.round(100000/worstFrame)/100:0,averageFrameMs:Math.round(averageFrame*100)/100,worstFrameMs:Math.round(worstFrame*100)/100,p99FrameMs:Math.round((sorted[Math.floor(sorted.length*.99)]||0)*100)/100,long16:usable.filter(value=>value>16.7).length,long33:usable.filter(value=>value>33).length,longTasks:longTasks.length,longTaskMs:Math.round(longTasks.reduce((sum,value)=>sum+value,0)*100)/100,firstHalfFps:Math.round(halfFps(0)*100)/100,secondHalfFps:Math.round(halfFps(1)*100)/100,maxEffects:maxOf('effects'),maxParticles:maxOf('particles'),maxProjectiles:maxOf('projectiles'),maxPending:maxOf('pending'),maxInstances:maxOf('instances'),maxTimers:maxOf('timeOuts'),maxRafs:maxOf('rafs'),heapGrowth:after.heap&&before.heap?after.heap-before.heap:0,domMutations:mutationCount,drawImages:after.drawImages-before.drawImages,drawImagesPerFrame:Math.round((after.drawImages-before.drawImages)/Math.max(1,usable.length)*100)/100,toDataUrlDelta:after.toDataUrls-before.toDataUrls,listenerDelta:after.listeners-before.listeners,timeoutDelta:after.timeOuts-before.timeOuts,intervalDelta:after.intervals-before.intervals,rafDelta:after.rafs-before.rafs,state,profile:perf.profile};
  },{mode,duration,pointerType});
}

async function exerciseSlideOver(page,pointerType){
  return page.evaluate(async pointerType=>{
    const spin=document.querySelector('#spinButton'),dash=document.querySelector('#dashButton'),spinRect=spin.getBoundingClientRect(),dashRect=dash.getBoundingClientRect(),id=8787;
    const emit=(type,x,y)=>spin.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:id,pointerType,isPrimary:true,button:0,buttons:type==='pointerup'?0:1,clientX:x,clientY:y,pressure:type==='pointerup'?0:.5}));
    emit('pointerdown',spinRect.left+spinRect.width/2,spinRect.top+spinRect.height/2);await new Promise(resolve=>setTimeout(resolve,260));
    const before=window.__riskTest.skillGestureState();emit('pointermove',dashRect.left+dashRect.width/2,dashRect.top+dashRect.height/2);await new Promise(resolve=>setTimeout(resolve,40));
    const during=window.__riskTest.skillGestureState();emit('pointerup',dashRect.left+dashRect.width/2,dashRect.top+dashRect.height/2);await new Promise(resolve=>setTimeout(resolve,300));
    return{before,during,after:window.__riskTest.skillGestureState()}
  },pointerType);
}

async function runStressCase(page,label,pointerType){
  const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
  await openPlaytest(page);
  await page.evaluate(()=>{window.__riskTest.spawnHammerstormPack(6,{vortexTest:true});window.__riskTest.resetSpinPerformance()});
  const normal=await measureSpin(page,'normal',1800,pointerType);
  await page.evaluate(()=>{window.__riskTest.spawnHammerstormPack(12,{vortexTest:true});window.__riskTest.resetSpinPerformance()});
  const hold=await measureSpin(page,'hold',2600,pointerType);
  await page.evaluate(()=>{window.__riskTest.spawnHammerstormPack(64,{vortexTest:true,immuneBoss:true});window.__riskTest.addSpinTestLoot(16);window.__riskTest.resetSpinPerformance()});
  const rapid=await measureSpin(page,'rapid',RAPID_SPIN_MS,pointerType);
  const slide=await exerciseSlideOver(page,pointerType);
  await new Promise(resolve=>setTimeout(resolve,700));
  const recovery=await measureSpin(page,'idle',1200,pointerType);
  console.log('SPIN_PERFORMANCE '+JSON.stringify({label,normal,hold,rapid,recovery}));

  expect(pageErrors).toEqual([]);
  expect(rapid.inputCount).toBeGreaterThan(150);
  expect(rapid.state.requests).toBe(rapid.inputCount);
  expect(rapid.state.coalesced).toBeGreaterThan(0);
  expect(rapid.state.starts).toBeLessThan(rapid.state.requests);
  expect(rapid.maxPending).toBeLessThanOrEqual(rapid.state.maxPending);
  expect(rapid.maxInstances).toBeLessThanOrEqual(1);
  expect(rapid.state.maxActiveInstances).toBeLessThanOrEqual(1);
  expect(rapid.state.activeInstances).toBeLessThanOrEqual(1);
  expect(rapid.maxEffects).toBeLessThanOrEqual(rapid.profile.effects);
  expect(rapid.maxParticles).toBeLessThanOrEqual(rapid.profile.particles);
  expect(rapid.toDataUrlDelta).toBe(0);
  expect(rapid.listenerDelta).toBe(0);
  expect(rapid.intervalDelta).toBe(0);
  expect(rapid.timeoutDelta).toBeLessThanOrEqual(1);
  expect(rapid.heapGrowth).toBeLessThan(32*1024*1024);
  expect(rapid.secondHalfFps).toBeGreaterThan(rapid.firstHalfFps*.5);
  expect(recovery.averageFps).toBeGreaterThan(10);
  expect(recovery.state.activeInstances).toBe(0);
  expect(slide.before.spinHeld).toBe(true);
  expect(slide.during.spinHeld).toBe(true);
  expect(slide.during.dashTime).toBeGreaterThan(0);
  expect(slide.after.pointerId).toBeNull();
  expect(slide.after.spinHeld).toBe(false);
}

test('desktop rapid normal Spin remains bounded for 30 seconds',async({page})=>{
  test.setTimeout(70000);
  await installProbe(page);
  await page.setViewportSize({width:1366,height:768});
  await runStressCase(page,'desktop','mouse');
});

test('iPhone rapid normal Spin remains bounded for 30 seconds',async({browser})=>{
  test.setTimeout(70000);
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await installProbe(page);
  await runStressCase(page,'iphone-13','touch');
  await context.close();
});
