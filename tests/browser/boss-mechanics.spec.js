const {test,expect}=require('@playwright/test');

async function openPlaytest(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

test('each Champion exposes a distinct readable arena mechanic',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.setViewportSize({width:390,height:844});
  await openPlaytest(page);

  expect(await page.evaluate(()=>window.__riskTest.fightBoss('warden'))).toBe('warden');
  let state=await page.evaluate(()=>window.__riskTest.triggerBossPattern(2,1));
  expect(state.hazards).toEqual(['vaultSeal','vaultSeal','vaultSeal']);
  state=await page.evaluate(()=>window.__riskTest.triggerBossPattern(3,1));
  expect(state).toMatchObject({canAttack:true});
  expect(state.hazards).toContain('wardenLock');

  expect(await page.evaluate(()=>window.__riskTest.fightBoss('tyrant'))).toBe('tyrant');
  state=await page.evaluate(()=>window.__riskTest.triggerBossPattern(1,2));
  expect(state.hazards).toContain('crimsonCleave');

  expect(await page.evaluate(()=>window.__riskTest.fightBoss('leviathan'))).toBe('leviathan');
  state=await page.evaluate(()=>window.__riskTest.triggerBossPattern(3,0));
  expect(state.hazards.filter(type=>type==='tidalLane')).toHaveLength(2);
  expect(state.hazards.filter(type=>type==='lagoonPool')).toHaveLength(4);

  expect(pageErrors).toEqual([]);
});
