const {test,expect,devices}=require('@playwright/test');

const SAMPLE_MS=5000;

async function installPerformanceProbe(page){
  await page.addInitScript(()=>{
    localStorage.clear();
    const probe=window.__stormcallerPerfProbe={toDataUrls:0,drawImages:0,canvasCreates:0};
    const originalCreate=document.createElement.bind(document);
    document.createElement=function(name,...args){
      if(String(name).toLowerCase()==='canvas')probe.canvasCreates++;
      return originalCreate(name,...args)
    };
    const originalToDataUrl=HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL=function(){probe.toDataUrls++;return Reflect.apply(originalToDataUrl,this,arguments)};
    const originalDrawImage=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage=function(){probe.drawImages++;return Reflect.apply(originalDrawImage,this,arguments)};
  });
}

async function openGame(page){
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest&&window.RiskLootInventoryV2Bridge))).toBe(true);
}

async function waitForCanvasQuiescence(page){
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentPrewarmState()),{timeout:15000}).toMatchObject({ready:true,pending:0,missing:0,active:false});
  await page.waitForFunction(async()=>{
    const probe=window.__stormcallerPerfProbe;
    if(!probe)return false;
    const before=probe.canvasCreates;
    await new Promise(resolve=>setTimeout(resolve,650));
    return probe.canvasCreates===before
  },null,{timeout:6000,polling:750})
}

async function measureFrames(page,duration,lightning){
  return page.evaluate(async({duration,lightning})=>{
    const probe=window.__stormcallerPerfProbe;
    const before={
      heap:performance.memory?.usedJSHeapSize||0,
      toDataUrls:probe.toDataUrls,
      drawImages:probe.drawImages,
      canvasCreates:probe.canvasCreates
    };
    const frames=[],longTasks=[],layoutShifts=[];
    let mutations=0,running=true,last=0,raf=0,attackTimer=0;
    const mutationObserver=new MutationObserver(records=>mutations+=records.length);
    mutationObserver.observe(document.documentElement,{attributes:true,childList:true,subtree:true,characterData:true});
    let longTaskObserver=null,layoutObserver=null;
    try{longTaskObserver=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(entry=>entry.duration)));longTaskObserver.observe({entryTypes:['longtask']})}catch(error){}
    try{layoutObserver=new PerformanceObserver(list=>layoutShifts.push(...list.getEntries().filter(entry=>!entry.hadRecentInput).map(entry=>entry.value)));layoutObserver.observe({type:'layout-shift',buffered:false})}catch(error){}
    function frame(now){if(last)frames.push(now-last);last=now;if(running)raf=requestAnimationFrame(frame)}
    raf=requestAnimationFrame(frame);
    if(lightning)attackTimer=setInterval(()=>window.__riskTest.pressLightning(),125);
    await new Promise(resolve=>setTimeout(resolve,duration));
    if(attackTimer)clearInterval(attackTimer);
    running=false;cancelAnimationFrame(raf);mutationObserver.disconnect();longTaskObserver?.disconnect();layoutObserver?.disconnect();
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const usable=frames.filter(value=>value>0&&value<1000),sorted=usable.slice().sort((a,b)=>a-b),total=usable.reduce((sum,value)=>sum+value,0),percentile=value=>sorted[Math.min(sorted.length-1,Math.floor(sorted.length*value))]||0;
    const after={heap:performance.memory?.usedJSHeapSize||0,toDataUrls:probe.toDataUrls,drawImages:probe.drawImages,canvasCreates:probe.canvasCreates};
    return{
      frames:usable.length,
      averageFps:total?Math.round(usable.length*100000/total)/100:0,
      averageFrameMs:total?Math.round(total/usable.length*100)/100:0,
      p95FrameMs:Math.round(percentile(.95)*100)/100,
      p99FrameMs:Math.round(percentile(.99)*100)/100,
      worstFrameMs:Math.round(Math.max(0,...usable)*100)/100,
      over33ms:usable.filter(value=>value>33.4).length,
      over50ms:usable.filter(value=>value>50).length,
      longTasks:longTasks.length,
      longTaskMs:Math.round(longTasks.reduce((sum,value)=>sum+value,0)*100)/100,
      layoutShift:Math.round(layoutShifts.reduce((sum,value)=>sum+value,0)*10000)/10000,
      mutations,
      heapGrowth:after.heap&&before.heap?after.heap-before.heap:0,
      toDataUrls:after.toDataUrls-before.toDataUrls,
      drawImages:after.drawImages-before.drawImages,
      canvasCreates:after.canvasCreates-before.canvasCreates,
      quality:window.__riskTest.performanceState(),
      combat:window.__riskTest.combatPerformanceState()
    }
  },{duration,lightning});
}

async function measureInventory(page){
  const opening=await page.evaluate(async()=>{
    window.__riskTest.resetEquipmentPerformance();
    window.__riskTest.resetEquipmentRenderMetrics();
    const probe=window.__stormcallerPerfProbe,before={toDataUrls:probe.toDataUrls,canvasCreates:probe.canvasCreates,drawImages:probe.drawImages},started=performance.now();
    const setup=window.__riskTest.previewGearSetPieces('stormrunner',5);
    const syncMs=performance.now()-started;
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    return{syncMs,totalMs:performance.now()-started,setup,before,after:{toDataUrls:probe.toDataUrls,canvasCreates:probe.canvasCreates,drawImages:probe.drawImages}}
  });
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.gearVisualState().inventoryFigureVariant)).toBe('full');
  await waitForCanvasQuiescence(page);
  const idle=await measureFrames(page,SAMPLE_MS,false);
  const swaps=await page.evaluate(async()=>{
    const bridge=window.RiskLootInventoryV2Bridge,inventory=window.__riskTest.equipmentInventory(),weapon=inventory.find(item=>item.slot==='weapon'&&item.equipped),durations=[];
    if(!weapon)return{durations,missing:true};
    for(let index=0;index<20;index++){
      let started=performance.now();bridge.unequip('weapon');bridge.equip(weapon.uid);await new Promise(resolve=>requestAnimationFrame(resolve));durations.push(performance.now()-started)
    }
    durations.sort((a,b)=>a-b);
    return{missing:false,average:durations.reduce((sum,value)=>sum+value,0)/durations.length,p95:durations[Math.floor(durations.length*.95)]||0,worst:Math.max(...durations),preview:window.__riskTest.equipmentPreviewState(),render:window.__riskTest.equipmentRenderMetrics(),records:window.__riskTest.equipmentPerformance()}
  });
  return{opening,idle,swaps}
}

async function measureCombat(page,quality){
  await page.evaluate(quality=>window.__riskTest.setVisualQuality(quality),quality);
  await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(64,{fullLightning:true,durable:true}));
  await page.waitForTimeout(quality==='auto'?7000:700);
  await waitForCanvasQuiescence(page);
  return measureFrames(page,SAMPLE_MS,true)
}

function assertStable(result,isMobile){
  expect(result.idle.averageFps).toBeGreaterThanOrEqual(isMobile?45:50);
  expect(result.idle.p95FrameMs).toBeLessThan(30);
  expect(result.idle.toDataUrls).toBe(0);
  expect(result.idle.canvasCreates).toBe(0);
  expect(result.swaps.missing).toBe(false);
  expect(result.swaps.p95).toBeLessThan(250);
  expect(result.swaps.preview.matches).toBe(true);
  expect(result.combat.averageFps).toBeGreaterThanOrEqual(isMobile?38:45);
  expect(result.combat.p95FrameMs).toBeLessThan(isMobile?42:35);
  expect(result.combat.quality.effects).toBeLessThanOrEqual(result.combat.quality.profile.effects);
  expect(result.combat.quality.particles).toBeLessThanOrEqual(result.combat.quality.profile.particles);
  expect(result.combat.toDataUrls).toBe(0);
  expect(result.combat.canvasCreates).toBe(0)
}

function compactFrameSample(sample){
  return{
    fps:sample.averageFps,averageMs:sample.averageFrameMs,p95Ms:sample.p95FrameMs,p99Ms:sample.p99FrameMs,
    worstMs:sample.worstFrameMs,over33ms:sample.over33ms,longTasks:sample.longTasks,longTaskMs:sample.longTaskMs,
    heapGrowth:sample.heapGrowth,drawImages:sample.drawImages,canvasCreates:sample.canvasCreates,toDataUrls:sample.toDataUrls,
    quality:sample.quality?.active,particles:sample.combat?.particles,effects:sample.combat?.effects,lightning:sample.combat?.lightning
  }
}

function compactResult(target,result){
  const record=result.swaps.records?.at(-1);
  return{
    target,
    inventoryOpen:{syncMs:Math.round(result.opening.syncMs*10)/10,totalMs:Math.round(result.opening.totalMs*10)/10,canvasCreates:result.opening.after.canvasCreates-result.opening.before.canvasCreates,toDataUrls:result.opening.after.toDataUrls-result.opening.before.toDataUrls},
    inventoryIdle:compactFrameSample(result.idle),
    swaps:{averageMs:Math.round(result.swaps.average*10)/10,p95Ms:Math.round(result.swaps.p95*10)/10,worstMs:Math.round(result.swaps.worst*10)/10,matches:result.swaps.preview.matches,last:record&&{stateMs:record.stateMs,characterMs:record.characterMs,feedbackMs:record.feedbackMs,totalMs:record.totalMs}},
    combat:compactFrameSample(result.combat)
  }
}

test('Stormcaller stays frame-stable on desktop',async({page})=>{
  test.setTimeout(90000);
  await installPerformanceProbe(page);
  await page.setViewportSize({width:1440,height:900});
  await openGame(page);
  const inventory=await measureInventory(page);
  await page.locator('#closeGear').click();
  const combat=await measureCombat(page,'auto');
  const result=Object.assign({},inventory,{combat});
  console.log('STORMCALLER_FPS '+JSON.stringify(compactResult('desktop',result)));
  assertStable(result,false)
});

test('Stormcaller stays frame-stable on iPhone portrait',async({browser})=>{
  test.setTimeout(90000);
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await installPerformanceProbe(page);
  await openGame(page);
  const inventory=await measureInventory(page);
  await page.locator('#closeGear').click();
  const combat=await measureCombat(page,'auto');
  const result=Object.assign({},inventory,{combat});
  console.log('STORMCALLER_FPS '+JSON.stringify(compactResult('iphone-13',result)));
  assertStable(result,true);
  await context.close()
});
