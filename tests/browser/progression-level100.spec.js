const {test,expect}=require('@playwright/test');

async function boot(page,init){
  if(init)await page.addInitScript(init);
  else await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest&&window.RiskLootProgression))).toBe(true)
}

test('fresh and old-schema saves start cleanly at Level 1',async({page})=>{
  await boot(page,()=>{
    localStorage.clear();
    localStorage.setItem('scrapbound_prototype_v1',JSON.stringify({version:11,level:88,xp:999999,scrap:12345}))
  });
  const state=await page.evaluate(()=>window.__riskTest.progressionState());
  expect(state).toMatchObject({maxLevel:100,totalXpToMax:173388,saveVersion:16,progress:{level:1,current:0,required:120,capped:false}});
  await expect(page.locator('#pappaLevel')).toHaveText('1');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('scrapbound_prototype_v1')));
  expect(saved.version).toBe(16);
  expect(saved.level).toBe(1)
});

test('exact, multi-level and capped XP updates stay synchronized',async({page})=>{
  await boot(page);
  const firstThreshold=await page.evaluate(()=>window.RiskLootProgression.xpRequiredForNextLevel(1));
  let state=await page.evaluate(value=>window.__riskTest.setProgress(1,value-1),firstThreshold);
  expect(state.progress).toMatchObject({level:1,current:119,required:120,capped:false});
  state=await page.evaluate(()=>window.__riskTest.grantPlayerXp(1));
  expect(state.progress).toMatchObject({level:2,current:0,capped:false});
  expect(state.levelsGained).toBe(1);

  state=await page.evaluate(()=>window.__riskTest.setProgress(1,window.RiskLootProgression.totalXpForLevel(20)+5));
  expect(state.progress.level).toBe(20);
  expect(state.progress.level).toBeLessThan(100);

  state=await page.evaluate(()=>{
    const needed=window.RiskLootProgression.xpRequiredForNextLevel(99);
    return window.__riskTest.setProgress(99,needed-1)
  });
  const beforeCap=state.progress;
  expect(beforeCap.level).toBe(99);
  expect(beforeCap.current).toBe(beforeCap.required-1);
  expect(beforeCap.capped).toBe(false);
  state=await page.evaluate(()=>window.__riskTest.grantPlayerXp(1));
  expect(state.progress).toMatchObject({level:100,current:0,required:0,percent:1,capped:true});
  await expect(page.locator('#pappaLevel')).toHaveText('100');

  state=await page.evaluate(()=>window.__riskTest.grantPlayerXp(999999999));
  expect(state.progress).toMatchObject({level:100,current:0,required:0,percent:1,capped:true});
  expect(state.levelsGained).toBe(0)
});

test('all generated item levels and Level 100 scaling stay valid',async({page})=>{
  await boot(page);
  const report=await page.evaluate(()=>({
    gear:window.__riskTest.rollGearLevels(Array.from({length:104},(_,index)=>index-1)),
    samples:[1,20,40,60,80,99,100].map(level=>window.__riskTest.levelScaling(level)),
    unlocks:window.__riskTest.progressionState()
  }));
  expect(report.gear.every(entry=>entry.level>=1&&entry.level<=100&&entry.value>0&&entry.finite)).toBe(true);
  expect(report.gear[0].level).toBe(1);
  expect(report.gear.at(-1).level).toBe(100);
  for(const sample of report.samples){
    const values=[sample.player.hp,sample.player.damage,sample.enemy.hp,sample.enemy.damage,sample.boss.hp,sample.boss.damage,sample.gear,sample.value];
    expect(values.every(value=>Number.isFinite(value)&&value>0)).toBe(true)
  }
  expect(report.unlocks.maps).toEqual({guild:1,foundry:15,moonfall:35,skyglass:60,summit:80});
  expect(Object.values(report.unlocks.sets).every(level=>level>=1&&level<=100)).toBe(true)
});

test('Level 100 UI fits desktop and iPhone portrait without Level 101 messaging',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await boot(page);
  await page.evaluate(()=>window.__riskTest.setProgress(100,999999));
  await page.locator('#startButton').click();
  await expect(page.locator('#mapOverlay')).toHaveClass(/show/);
  await expect(page.locator('#mapPappaLevel')).toHaveText('100');
  await expect(page.locator('#nextMapUnlock')).toHaveText('ALL DESTINATIONS UNLOCKED');
  const atlasBounds=await page.locator('.mapLevelReadout').boundingBox();
  expect(atlasBounds.x).toBeGreaterThanOrEqual(0);
  expect(atlasBounds.x+atlasBounds.width).toBeLessThanOrEqual(390);

  await page.locator('#closeMaps').click();
  await page.evaluate(()=>window.__riskTest.openMap('guild'));
  await expect(page.locator('#xpHud')).toBeVisible();
  await expect(page.locator('#xpLevel')).toHaveText('100');
  await expect(page.locator('#xpText')).toHaveText('MAX LEVEL');
  await expect(page.locator('#xpHud')).toHaveClass(/maxLevel/);
  const mobileBounds=await page.locator('#xpHud').boundingBox();
  expect(mobileBounds.x).toBeGreaterThanOrEqual(0);
  expect(mobileBounds.x+mobileBounds.width).toBeLessThanOrEqual(390);
  const mobileOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(mobileOverflow).toBeLessThanOrEqual(1);

  await page.setViewportSize({width:1366,height:768});
  const desktopBounds=await page.locator('#xpHud').boundingBox();
  expect(desktopBounds.x).toBeGreaterThanOrEqual(0);
  expect(desktopBounds.x+desktopBounds.width).toBeLessThanOrEqual(1366);
  await expect(page.locator('body')).not.toContainText(/LEVEL 101|TO LEVEL 101/i)
});
