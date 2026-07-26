const {test,expect}=require('@playwright/test');

async function openPlaytest(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

test('Hammerstorm dives into a pack, launches enemies and rewards the full surround set',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.setViewportSize({width:1280,height:800});
  await openPlaytest(page);

  let state=await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(20,{fragile:true}));
  expect(state.living).toBe(20);
  const startX=state.player.x;
  const triggered=await page.evaluate(()=>window.__riskTest.triggerHammerstorm());
  expect(triggered.started).toBe(true);
  expect(triggered.state.spin.pack).toBe(20);
  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.43));
  expect(state.player.x).toBeGreaterThan(startX+70);
  expect(state.effects).toContain('spinArc');
  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.27));
  expect(state.spin.hits).toBeGreaterThanOrEqual(16);
  expect(state.spin.kills).toBeGreaterThanOrEqual(16);
  expect(state.launched).toBeGreaterThanOrEqual(16);
  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.8));
  expect(state.spin.cd).toBeGreaterThan(0);

  state=await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(24,{durable:true,hurt:true,fullRiskreaver:true}));
  const woundedHp=state.player.hp;
  const maxHeal=state.player.maxHp*.12;
  expect((await page.evaluate(()=>window.__riskTest.triggerHammerstorm())).started).toBe(true);
  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(1.6));
  expect(state.spin.hits).toBeGreaterThan(24);
  expect(state.spin.heal).toBeGreaterThan(0);
  expect(state.spin.heal).toBeLessThanOrEqual(maxHeal+.01);
  expect(state.player.hp).toBeGreaterThan(woundedHp);
  expect(state.player.hp).toBeLessThanOrEqual(woundedHp+maxHeal+.01);
  expect(pageErrors).toEqual([]);
});
