const {test,expect,devices}=require('@playwright/test');

async function openPerformanceArmory(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(()=>{
    for(const setId of ['hammerChoir','blackHole','stormrunner','fatebound'])window.__riskTest.previewGearSet(setId);
    window.__riskTest.resetEquipmentRenderMetrics();
    window.__riskTest.resetEquipmentPerformance();
    window.__equipVisualProbe={layoutShift:0,mutations:0,emptyCharacterFrames:0};
    if(typeof PerformanceObserver==='function'){
      const observer=new PerformanceObserver(list=>{
        for(const entry of list.getEntries())if(!entry.hadRecentInput)window.__equipVisualProbe.layoutShift+=entry.value
      });
      try{observer.observe({type:'layout-shift',buffered:false});window.__equipVisualProbe.layoutObserver=observer}catch(error){}
    }
    const stage=document.querySelector('#gearCharacterStage');
    const observer=new MutationObserver(records=>{
      window.__equipVisualProbe.mutations+=records.length;
      const hero=document.querySelector('.gearCharacterHero');
      if(hero&&getComputedStyle(hero).backgroundImage==='none')window.__equipVisualProbe.emptyCharacterFrames++
    });
    observer.observe(document.querySelector('#gearPanel'),{subtree:true,attributes:true,childList:true,attributeFilter:['class','style','data-item']});
    window.__equipVisualProbe.mutationObserver=observer
  });
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
}

async function latestCompletedRecord(page,count){
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentPerformance().filter(record=>record.total!=null).length)).toBe(count);
  return page.evaluate(()=>window.__riskTest.equipmentPerformance().at(-1));
}

async function equipDesktop(page,gear,index){
  await page.locator(`#gearGrid [data-item="${gear.uid}"]`).click();
  const before=await page.evaluate(()=>window.__riskTest.equipmentPerformance().length);
  await page.locator('#gearDetail .equipGear').click();
  const record=await latestCompletedRecord(page,before+1);
  await expect(page.locator(`.gearLoadoutSlot[data-slot="${gear.slot}"][data-item="${gear.uid}"]`).first()).toBeVisible();
  await expect(page.locator(`#gearGrid [data-item="${gear.uid}"]`)).toHaveClass(/equipped/);
  await expect(page.locator('#gearDetail .gearDetailCard')).toHaveClass(/equipped/);
  return Object.assign({index},record)
}

async function equipMobile(page,gear,index){
  await page.locator(`#gearGrid [data-item="${gear.uid}"]`).tap();
  const before=await page.evaluate(()=>window.__riskTest.equipmentPerformance().length);
  await page.locator('#mobileGearEquip').tap();
  const record=await latestCompletedRecord(page,before+1);
  await expect(page.locator(`.gearLoadoutSlot[data-slot="${gear.slot}"][data-item="${gear.uid}"]`).first()).toBeVisible();
  await expect(page.locator(`#gearGrid [data-item="${gear.uid}"]`)).toHaveClass(/equipped/);
  return Object.assign({index},record)
}

function timingSummary(records){
  const values=key=>records.map(record=>record[key]||0);
  const max=list=>Math.max(...list);
  const average=list=>Math.round(list.reduce((sum,value)=>sum+value,0)/list.length*100)/100;
  const steps={};
  for(const record of records)for(const [name,value] of Object.entries(record.steps))steps[name]=(steps[name]||0)+value;
  return{
    equips:records.length,
    inputToVisualAverage:average(records.map(record=>Math.max(record.marks.character,record.marks.slot,record.marks.stats,record.marks.card,record.marks.comparison))),
    inputToVisualMax:max(records.map(record=>Math.max(record.marks.character,record.marks.slot,record.marks.stats,record.marks.card,record.marks.comparison))),
    completionAverage:average(values('total')),
    completionMax:max(values('total')),
    slowestStep:Object.entries(steps).sort((a,b)=>b[1]-a[1])[0]
  }
}

function visibleUpdateTime(record){
  return Math.max(record.marks.character,record.marks.slot,record.marks.stats,record.marks.card,record.marks.comparison)
}

test('desktop equip pipeline updates every visible surface in one responsive commit',async({page},testInfo)=>{
  test.skip(testInfo.config.workers>1,'Performance benchmarks run in isolation via npm run test:equip-performance');
  test.setTimeout(60000);
  await page.setViewportSize({width:1440,height:960});
  await openPerformanceArmory(page);
  const inventory=await page.evaluate(()=>window.__riskTest.equipmentInventory());
  const candidate=inventory.find(item=>!item.equipped&&item.slot==='coat');
  const beforeVisualKey=await page.locator('.gearCharacterHero').getAttribute('data-gear-visual-key');
  const record=await equipDesktop(page,candidate,0);
  const afterVisualKey=await page.locator('.gearCharacterHero').getAttribute('data-gear-visual-key');
  const visibleMarks=['character','slot','stats','card','comparison'].map(name=>record.marks[name]);
  console.log('EQUIP_PERF_DESKTOP',JSON.stringify(record));
  expect(afterVisualKey).not.toBe(beforeVisualKey);
  const concurrent=testInfo.config.workers>1;
  expect(visibleUpdateTime(record)).toBeLessThan(concurrent?150:100);
  expect(Math.max(...visibleMarks)-Math.min(...visibleMarks)).toBeLessThan(concurrent?70:40);
  expect(record.total).toBeLessThan(concurrent?320:200);
  expect(record.renders.incrementalRenders).toBe(1);
  expect(record.renders.fullRenders).toBe(0);
  expect(record.renders.gridRenders).toBe(0);
  expect(record.renders.paperDollBuilds).toBe(0);
  await page.locator('#closeGear').click();
  const persistedUid=await page.evaluate(slot=>JSON.parse(localStorage.getItem('scrapbound_prototype_v1')).equipped[slot],candidate.slot);
  expect(persistedUid).toBe(candidate.uid);
});

test('iPhone touch equip begins immediately and stays visually coherent',async({browser},testInfo)=>{
  test.skip(testInfo.config.workers>1,'Performance benchmarks run in isolation via npm run test:equip-performance');
  test.setTimeout(60000);
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await openPerformanceArmory(page);
  const inventory=await page.evaluate(()=>window.__riskTest.equipmentInventory());
  const candidate=inventory.find(item=>!item.equipped&&item.slot==='hammer');
  const record=await equipMobile(page,candidate,0);
  const probe=await page.evaluate(()=>({layoutShift:window.__equipVisualProbe.layoutShift,emptyCharacterFrames:window.__equipVisualProbe.emptyCharacterFrames}));
  console.log('EQUIP_PERF_IPHONE',JSON.stringify(record));
  const concurrent=testInfo.config.workers>1;
  expect(visibleUpdateTime(record)).toBeLessThan(concurrent?150:100);
  expect(record.total).toBeLessThan(concurrent?320:200);
  expect(probe.emptyCharacterFrames).toBe(0);
  expect(probe.layoutShift).toBeLessThan(.03);
  await context.close();
});

test('20 sequential equips and full-figure transitions avoid duplicate work or stale UI',async({page},testInfo)=>{
  test.skip(testInfo.config.workers>1,'Performance benchmarks run in isolation via npm run test:equip-performance');
  test.setTimeout(120000);
  await page.setViewportSize({width:1440,height:960});
  await openPerformanceArmory(page);
  const inventory=await page.evaluate(()=>window.__riskTest.equipmentInventory());
  const grouped=['blackHole','hammerChoir','stormrunner','fatebound'].flatMap(setId=>inventory.filter(item=>item.setId===setId));
  expect(grouped.length).toBeGreaterThanOrEqual(20);
  const before=await page.evaluate(()=>window.__riskTest.equipmentPerformance().length);
  for(const item of grouped.slice(0,20))await page.locator(`#gearGrid [data-item="${item.uid}"]`).click({button:'right'});
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentPerformance().filter(record=>record.total!=null).length)).toBe(before+20);
  const records=await page.evaluate(()=>window.__riskTest.equipmentPerformance().slice(-20));
  const summary=timingSummary(records),metrics=await page.evaluate(()=>window.__riskTest.equipmentRenderMetrics()),probe=await page.evaluate(()=>({layoutShift:window.__equipVisualProbe.layoutShift,emptyCharacterFrames:window.__equipVisualProbe.emptyCharacterFrames}));
  const slowest=records.slice().sort((a,b)=>b.total-a.total).slice(0,3).map(record=>({itemId:record.itemId,total:record.total,visual:visibleUpdateTime(record),slowestStep:record.slowestStep,steps:record.steps}));
  console.log('EQUIP_PERF_STRESS',JSON.stringify({summary,metrics,probe,slowest}));
  const concurrent=testInfo.config.workers>1;
  expect(summary.inputToVisualMax).toBeLessThan(concurrent?180:120);
  expect(summary.completionMax).toBeLessThan(concurrent?400:250);
  expect(metrics.incrementalRenders).toBe(20);
  expect(metrics.fullRenders).toBe(0);
  expect(metrics.gridRenders).toBe(0);
  expect(metrics.paperDollBuilds).toBe(0);
  expect(records.some(record=>record.visualSetId==='blackHole'&&record.usesProductionSkin)).toBe(true);
  expect(records.some(record=>record.visualSetId==='hammerChoir'&&record.usesProductionSkin)).toBe(true);
  expect(records.some(record=>record.visualSetId==='fatebound'&&!record.usesProductionSkin)).toBe(true);
  expect(probe.emptyCharacterFrames).toBe(0);
  expect(await page.locator('.gearDragGhost').count()).toBe(0);
});

test('repeated Armory open and close leaves no blocked input or duplicated UI',async({page},testInfo)=>{
  test.skip(testInfo.config.workers>1,'Performance benchmarks run in isolation via npm run test:equip-performance');
  await page.setViewportSize({width:1440,height:960});
  await openPerformanceArmory(page);
  for(let index=0;index<8;index++){
    await page.locator('#closeGear').click();
    await expect(page.locator('#gearOverlay')).not.toHaveClass(/show/);
    await page.locator('#gearLockerButton').click();
    await expect(page.locator('#gearOverlay')).toHaveClass(/show/)
  }
  await expect(page.locator('#gearPanel')).toHaveCount(1);
  await expect(page.locator('#gearGrid')).toHaveCount(1);
  await expect(page.locator('.gearDragGhost')).toHaveCount(0);
  await expect(page.locator('#gearGrid .gearBagSlot').first()).toBeEnabled();
});
