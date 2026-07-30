const {test,expect}=require('@playwright/test');

async function openPlaytest(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

function average(values){
  return values.reduce((sum,value)=>sum+value,0)/Math.max(1,values.length);
}

test('Black Hole gathers and orbits a large pack without using knockback state',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.setViewportSize({width:390,height:844});
  await openPlaytest(page);

  let state=await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(48,{vortexTest:true,fullBlackHole:true,eliteEvery:7,immuneBoss:true}));
  const initialAverage=average(state.enemyDistances);
  expect((await page.evaluate(()=>window.__riskTest.triggerHammerstorm())).started).toBe(true);
  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.72));

  expect(state.spin.visual).toBe('blackHole');
  expect(state.spin.vortex.pulling).toBeGreaterThanOrEqual(35);
  expect(state.spin.vortex.orbiting).toBeGreaterThanOrEqual(8);
  expect(state.knocked).toBe(0);
  expect(average(state.enemyDistances)).toBeLessThan(initialAverage);
  expect(state.enemyVortex.filter(enemy=>enemy.elite&&enemy.influence>0).length).toBeGreaterThan(0);
  expect(state.enemyVortex.find(enemy=>enemy.boss)).toMatchObject({influence:0,orbiting:false});
  expect(pageErrors).toEqual([]);
});

test('regular Hammerstorm does not apply the Black Hole passive',async({page})=>{
  await page.setViewportSize({width:1280,height:800});
  await openPlaytest(page);
  await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(32,{durable:true}));
  expect((await page.evaluate(()=>window.__riskTest.triggerHammerstorm())).started).toBe(true);
  const state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.62));

  expect(state.spin.visual).toBe('hammerstorm');
  expect(state.spin.vortex.pulling).toBe(0);
  expect(state.spin.vortex.orbiting).toBe(0);
  expect(state.knocked).toBe(0);
});
