const {test,expect}=require('@playwright/test');

async function runStress(page,viewport,label){
  await page.setViewportSize(viewport);
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  const metrics=await page.evaluate(async label=>{
    window.__riskTest.prepareXpTest(1,0);
    window.__riskTest.setVisualQuality('medium');
    window.__riskTest.setXpTestRunning(true);
    const beforeHeap=performance.memory&&performance.memory.usedJSHeapSize||0,frames=[],samples=[];
    let active=true,last=performance.now(),raf=0;
    function frame(now){if(!active)return;frames.push(now-last);last=now;raf=requestAnimationFrame(frame)}
    raf=requestAnimationFrame(frame);
    const batchCount=36;
    for(let batch=0;batch<batchCount;batch++){
      const ids=window.__riskTest.spawnXpPack(24,{type:'rusher',eliteEvery:12});
      window.__riskTest.killXpPack(ids,'spin');
      const state=window.__riskTest.xpState();
      samples.push({awards:state.telemetry.awards,hud:state.telemetry.hudUpdates,visuals:state.activeVisuals,nodes:state.visualNodes,pending:state.pendingAmount,persistTimer:state.persistTimer,effects:state.effects,particles:state.particles,enemies:state.enemies});
      await new Promise(resolve=>setTimeout(resolve,220))
    }
    active=false;cancelAnimationFrame(raf);
    const stressState=window.__riskTest.xpState(),recovery=[];
    let recoveryLast=performance.now(),recoveryActive=true,recoveryRaf=0;
    function recoveryFrame(now){if(!recoveryActive)return;recovery.push(now-recoveryLast);recoveryLast=now;recoveryRaf=requestAnimationFrame(recoveryFrame)}
    recoveryRaf=requestAnimationFrame(recoveryFrame);
    await new Promise(resolve=>setTimeout(resolve,1100));
    recoveryActive=false;cancelAnimationFrame(recoveryRaf);
    window.__riskTest.setXpTestRunning(false);
    const afterHeap=performance.memory&&performance.memory.usedJSHeapSize||0;
    const useful=frames.filter(value=>value>0&&value<1000),half=Math.max(1,Math.floor(useful.length/2));
    const fps=values=>values.length?1000/(values.reduce((sum,value)=>sum+value,0)/values.length):0;
    return{label,averageFps:fps(useful),firstHalfFps:fps(useful.slice(0,half)),secondHalfFps:fps(useful.slice(half)),lowestFps:useful.length?1000/Math.max(...useful):0,worstFrameMs:useful.length?Math.max(...useful):0,recoveryFps:fps(recovery.filter(value=>value>0&&value<1000)),beforeHeap,afterHeap,heapDelta:afterHeap&&beforeHeap?afterHeap-beforeHeap:0,state:stressState,maxVisuals:Math.max(0,...samples.map(sample=>sample.visuals)),maxNodes:Math.max(0,...samples.map(sample=>sample.nodes)),maxPersistTimers:Math.max(0,...samples.map(sample=>sample.persistTimer)),maxEffects:Math.max(0,...samples.map(sample=>sample.effects)),maxParticles:Math.max(0,...samples.map(sample=>sample.particles)),maxEnemies:Math.max(0,...samples.map(sample=>sample.enemies)),sampleCount:samples.length}
  },label);
  console.log('Immediate XP stress:',metrics);
  expect(metrics.state.telemetry.awards).toBe(864);
  expect(metrics.sampleCount).toBe(36);
  expect(metrics.state.run.total).toBe(metrics.state.progress.total);
  expect(metrics.maxVisuals).toBeLessThanOrEqual(1);
  expect(metrics.maxNodes).toBe(1);
  expect(metrics.maxPersistTimers).toBeLessThanOrEqual(1);
  expect(metrics.state.telemetry.hudUpdates).toBeLessThan(metrics.state.telemetry.awards);
  expect(metrics.maxEffects).toBeLessThanOrEqual(260);
  expect(metrics.maxParticles).toBeLessThanOrEqual(420);
  expect(metrics.maxEnemies).toBeLessThanOrEqual(24);
  expect(metrics.recoveryFps).toBeGreaterThan(0);
  expect(metrics.state.telemetry.persistWrites).toBeLessThan(6);
  return metrics
}

test.describe.configure({timeout:60000,mode:'serial'});

test('dense Spin XP remains bounded on desktop',async({page})=>{
  await runStress(page,{width:1366,height:768},'desktop')
});

test('dense Spin XP remains bounded on iPhone portrait',async({page})=>{
  await runStress(page,{width:390,height:844},'iphone')
});
