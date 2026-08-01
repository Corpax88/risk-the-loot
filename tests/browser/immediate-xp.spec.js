const {test,expect}=require('@playwright/test');

async function boot(page,viewport={width:1280,height:720}){
  await page.setViewportSize(viewport);
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true)
}

test('normal, elite, boss and cleanup XP use one exact-once death path',async({page})=>{
  await boot(page);
  await page.evaluate(()=>window.__riskTest.prepareXpTest(1,0));

  const normal=await page.evaluate(()=>window.__riskTest.spawnXpEnemy({type:'rusher'}));
  let state=await page.evaluate(id=>window.__riskTest.killXpEnemy(id,'normal',3),normal.id);
  expect(state.progress.total).toBe(normal.reward);
  expect(state.run).toMatchObject({enemy:normal.reward,elite:0,boss:0,total:normal.reward});
  expect(state.telemetry.duplicateSkips).toBe(2);

  const elite=await page.evaluate(()=>window.__riskTest.spawnXpEnemy({type:'rusher',elite:true}));
  state=await page.evaluate(id=>window.__riskTest.killXpEnemy(id),elite.id);
  expect(elite.reward).toBeGreaterThan(normal.reward);
  expect(state.run.elite).toBe(elite.reward);

  const cleanup=await page.evaluate(()=>window.__riskTest.spawnXpEnemy({type:'brute'}));
  const beforeCleanup=state.progress.total;
  state=await page.evaluate(id=>window.__riskTest.cleanupXpEnemy(id),cleanup.id);
  expect(state.progress.total).toBe(beforeCleanup);

  const boss=await page.evaluate(()=>window.__riskTest.spawnXpEnemy({boss:true}));
  state=await page.evaluate(id=>window.__riskTest.killXpEnemy(id,'normal',2),boss.id);
  expect(state.run.boss).toBe(boss.reward);
  expect(state.run.total).toBe(normal.reward+elite.reward+boss.reward);
  expect(state.telemetry.duplicateSkips).toBe(3)
});

test('Spin, chain lightning and a 100-kill frame lose no XP and keep visuals bounded',async({page})=>{
  await boot(page,{width:390,height:844});
  await page.evaluate(()=>window.__riskTest.prepareXpTest(1,0));

  const spin=await page.evaluate(()=>window.__riskTest.spawnXpPack(10,{type:'rusher'}));
  let state=await page.evaluate(ids=>window.__riskTest.killXpPack(ids,'spin'),spin);
  expect(state.progress.total).toBe(10);

  const lightning=await page.evaluate(()=>window.__riskTest.spawnXpPack(10,{type:'shooter'}));
  state=await page.evaluate(ids=>window.__riskTest.killXpPack(ids,'lightning'),lightning);
  expect(state.progress.total).toBe(20);

  const dense=await page.evaluate(()=>window.__riskTest.spawnXpPack(100,{type:'rusher'}));
  state=await page.evaluate(ids=>window.__riskTest.killXpPack(ids,'spin'),dense);
  expect(state.progress.total).toBe(120);
  expect(state.target.total).toBe(120);
  expect(state.pendingAmount).toBe(120);
  expect(state.visualNodes).toBe(1);
  expect(state.telemetry.awards).toBe(120);

  state=await page.evaluate(()=>window.__riskTest.advanceXpPresentation(220));
  expect(state.notice).toBe('+120 XP');
  expect(state.activeVisuals).toBe(1);
  expect(state.telemetry.maxActiveVisuals).toBe(1);
  expect(state.telemetry.notificationBatches).toBe(1);
  await expect(page.locator('#xpHud')).toBeVisible();
  const bounds=await page.locator('#xpHud').boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x+bounds.width).toBeLessThanOrEqual(390)
});

test('XP added during animation carries through level boundaries and multiple levels',async({page})=>{
  await boot(page);
  await page.evaluate(()=>window.__riskTest.prepareXpTest(1,9));
  const first=await page.evaluate(()=>window.__riskTest.spawnXpEnemy({type:'rusher'}));
  let state=await page.evaluate(id=>window.__riskTest.killXpEnemy(id),first.id);
  expect(state.progress).toMatchObject({level:2,current:0,total:10});
  expect(state.display.total).toBe(9);

  const more=await page.evaluate(()=>window.__riskTest.spawnXpPack(8,{type:'rusher'}));
  state=await page.evaluate(ids=>window.__riskTest.killXpPack(ids,'spin'),more);
  expect(state.progress).toMatchObject({level:2,current:8,total:18});
  expect(state.target.total).toBe(18);
  state=await page.evaluate(()=>window.__riskTest.advanceXpPresentation(900));
  expect(state.display.total).toBeCloseTo(18,3);
  expect(state.display.level).toBe(2);
  expect(state.levelNotice).toContain('LEVEL UP');

  await page.evaluate(()=>window.__riskTest.prepareXpTest(1,0));
  const multi=await page.evaluate(()=>window.__riskTest.grantPlayerXp(window.RiskLootProgression.totalXpForLevel(8)+3));
  expect(multi.progress).toMatchObject({level:8,current:3});
  state=await page.evaluate(()=>window.__riskTest.advanceXpPresentation(2400));
  expect(state.display.level).toBe(8);
  expect(state.display.current).toBeCloseTo(3,3);
  expect(state.telemetry.maxActiveVisuals).toBeLessThanOrEqual(1)
});

test('results summarize already-awarded XP and Level 100 remains capped',async({page})=>{
  await boot(page);
  await page.evaluate(()=>window.__riskTest.prepareXpTest(3,0));
  const ids=await page.evaluate(()=>window.__riskTest.spawnXpPack(5,{type:'brute',eliteEvery:3}));
  const earned=await page.evaluate(ids=>window.__riskTest.killXpPack(ids,'lightning'),ids);
  const summary=await page.evaluate(()=>window.__riskTest.xpResultSummary());
  expect(summary.after).toBe(summary.before);
  expect(Number(summary.total)).toBe(earned.run.total);
  expect(Number(summary.enemy)+Number(summary.elite)+Number(summary.boss)+Number(summary.completion)).toBe(Number(summary.total));

  const needed=await page.evaluate(()=>window.RiskLootProgression.xpRequiredForNextLevel(99));
  await page.evaluate(value=>window.__riskTest.prepareXpTest(99,value-1),needed);
  const finalEnemy=await page.evaluate(()=>window.__riskTest.spawnXpEnemy({type:'rusher'}));
  let state=await page.evaluate(id=>window.__riskTest.killXpEnemy(id),finalEnemy.id);
  expect(state.progress).toMatchObject({level:100,current:0,capped:true});
  await page.evaluate(()=>window.__riskTest.advanceXpPresentation(500));
  await expect(page.locator('#xpText')).toHaveText('MAX LEVEL');

  const cappedEnemy=await page.evaluate(()=>window.__riskTest.spawnXpEnemy({type:'brute',elite:true}));
  state=await page.evaluate(id=>window.__riskTest.killXpEnemy(id),cappedEnemy.id);
  expect(state.progress).toMatchObject({level:100,current:0,capped:true});
  expect(state.pendingAmount).toBe(0)
});
