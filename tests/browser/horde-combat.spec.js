const {test,expect}=require('@playwright/test');

async function openPlaytest(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

test('horde director maintains large overlapping packs',async({page})=>{
  await openPlaytest(page);
  let state=await page.evaluate(()=>window.__riskTest.startHordeWave(1));
  expect(state.number).toBe(1);
  expect(state.target).toBeGreaterThanOrEqual(30);
  expect(state.living).toBe(state.target);
  expect(state.types.rusher).toBeGreaterThan(state.types.shooter||0);

  state=await page.evaluate(()=>window.__riskTest.cullHordeTo(12));
  expect(state.number).toBe(2);
  expect(state.target).toBeGreaterThan(30);
  expect(state.living).toBe(state.target);

  state=await page.evaluate(()=>window.__riskTest.cullHordeTo(14));
  expect(state.number).toBe(3);
  expect(state.target).toBeGreaterThanOrEqual(36);
  expect(state.living).toBeLessThanOrEqual(60);
});

test('danger directly increases Hammerstorm payoff',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await openPlaytest(page);

  const small=await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(8,{durable:true}));
  const large=await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(40,{durable:true}));
  expect(large.spin.damage).toBeGreaterThan(small.spin.damage);
  expect(large.spin.radius).toBeGreaterThan(small.spin.radius);

  await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(40,{fragile:true}));
  expect((await page.evaluate(()=>window.__riskTest.triggerHammerstorm())).started).toBe(true);
  const start=Date.now();
  let result=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.7));
  expect(Date.now()-start).toBeLessThan(1500);
  expect(result.spin.kills).toBeGreaterThanOrEqual(30);
  expect(result.launched).toBeGreaterThanOrEqual(30);
  await page.evaluate(()=>window.__riskTest.releaseHammerstorm());
  result=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.3));
  expect(result.spin.cd).toBe(0);
  expect(result.effects).toContain('packClear');
});
