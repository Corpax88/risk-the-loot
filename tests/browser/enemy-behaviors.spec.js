const {test,expect}=require('@playwright/test');

async function openPlaytest(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

test('enemy roles expose distinct threatening attack rhythms',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.setViewportSize({width:1280,height:800});
  await openPlaytest(page);

  let state=await page.evaluate(()=>window.__riskTest.fightEnemy('brute',380));
  expect(state.type).toBe('brute');
  expect(state.charge).toBeGreaterThan(0);
  expect(state.lockDistance).toBeGreaterThan(360);
  state=await page.evaluate(()=>window.__riskTest.advanceEnemy(1.14));
  expect(state.dashTime).toBeGreaterThan(0);
  expect(state.dashDistance).toBeGreaterThan(state.lockDistance);
  state=await page.evaluate(()=>window.__riskTest.advanceEnemy(.8));
  expect(state.playerInv).toBeGreaterThan(0);
  expect(state.recover).toBeGreaterThan(0);

  state=await page.evaluate(()=>window.__riskTest.fightEnemy('lancer',340));
  expect(state.charge).toBeGreaterThan(0);
  state=await page.evaluate(()=>window.__riskTest.advanceEnemy(.84));
  expect(state.dashTime).toBeGreaterThan(0);
  expect(state.dashDistance).toBeGreaterThan(360);

  state=await page.evaluate(()=>window.__riskTest.fightEnemy('rusher',165));
  expect(state.charge).toBeGreaterThan(0);
  state=await page.evaluate(()=>window.__riskTest.advanceEnemy(.48));
  expect(state.dashTime).toBeGreaterThan(0);

  state=await page.evaluate(()=>window.__riskTest.fightEnemy('shooter',280,1));
  expect(state.charge).toBeGreaterThan(0);
  state=await page.evaluate(()=>window.__riskTest.advanceEnemy(.6));
  expect(state.bullets).toBe(3);

  expect(pageErrors).toEqual([]);
});
