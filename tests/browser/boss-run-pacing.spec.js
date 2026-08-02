const {test,expect}=require('@playwright/test');

test.use({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});

test('boss arrives within the pacing target and preserves the active horde through cleanup',async({page})=>{
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);

  const pacing=await page.evaluate(()=>window.__riskTest.state());
  expect(pacing.bossTargetSeconds).toBeGreaterThanOrEqual(120);
  expect(pacing.bossTargetSeconds).toBeLessThanOrEqual(180);
  expect(pacing.depthThresholds).toEqual([0,32,68,108,150]);

  const horde=await page.evaluate(()=>window.__riskTest.startHordeWave(1));
  expect(horde.living).toBeGreaterThanOrEqual(30);

  expect(await page.evaluate(()=>window.__riskTest.fightBoss('warden'))).toBe('warden');
  let state=await page.evaluate(()=>window.__riskTest.state());
  expect(state).toMatchObject({bossActive:true,spawningLocked:true,wavePhase:'locked',waveQueued:0});
  expect(state.regularEnemies).toBe(horde.living);
  expect(await page.evaluate(()=>window.__riskTest.attemptEnemySpawn())).toBe(false);

  await page.waitForTimeout(250);
  state=await page.evaluate(()=>window.__riskTest.state());
  expect(state.regularEnemies).toBe(horde.living);

  expect(await page.evaluate(()=>window.__riskTest.defeatChampion())).toBe(true);
  state=await page.evaluate(()=>window.__riskTest.state());
  expect(state).toMatchObject({bossActive:false,bossDefeated:true,cleanupActive:true,spawningLocked:true,lootOrbReady:false});
  expect(state.regularEnemies).toBe(horde.living);
  expect(await page.evaluate(()=>window.__riskTest.bossLootOrbPoint())).toBeNull();
  expect(await page.evaluate(()=>window.__riskTest.attemptEnemySpawn())).toBe(false);

  await page.waitForTimeout(250);
  expect((await page.evaluate(()=>window.__riskTest.state())).regularEnemies).toBe(horde.living);

  await page.evaluate(()=>window.__riskTest.cullHordeTo(0));
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.state().cleanupActive)).toBe(false);
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.state().lootOrbReady),{timeout:4000}).toBe(true);
  state=await page.evaluate(()=>window.__riskTest.state());
  expect(state.regularEnemies).toBe(0);
  expect(await page.evaluate(()=>window.__riskTest.bossLootOrbPoint())).not.toBeNull();
});
