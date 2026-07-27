const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');
const visualDir=path.join('test-results','melee-identity');

async function openPlaytest(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

test('Pappa only damages at melee range and never creates player projectiles',async({page})=>{
  fs.mkdirSync(visualDir,{recursive:true});
  await page.setViewportSize({width:1280,height:800});
  await openPlaytest(page);

  let state=await page.evaluate(()=>window.__riskTest.spawnMeleeTarget(260));
  const distantHp=state.enemyHp;
  state=await page.evaluate(()=>window.__riskTest.advanceMelee(1.2));
  expect(state.enemyHp).toBe(distantHp);
  expect(state.projectiles).toBe(0);

  state=await page.evaluate(()=>window.__riskTest.spawnMeleeTarget(76));
  const closeHp=state.enemyHp;
  state=await page.evaluate(()=>window.__riskTest.advanceMelee(.25));
  expect(state.enemyHp).toBeLessThan(closeHp);
  expect(state.projectiles).toBe(0);
  expect(state.effects).toContain('groundCrack');
  await page.screenshot({path:path.join(visualDir,'desktop-hammer-impact.png')});
});

test('Hammerstorm is hold-driven and immediately reusable',async({page})=>{
  fs.mkdirSync(visualDir,{recursive:true});
  await page.setViewportSize({width:390,height:844});
  await openPlaytest(page);
  await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(32,{durable:true}));
  expect((await page.evaluate(()=>window.__riskTest.triggerHammerstorm())).started).toBe(true);
  let state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(1.5));
  expect(state.spin.held).toBe(true);
  expect(state.spin.time).toBeGreaterThan(.8);
  expect(state.playerProjectiles).toBe(0);
  await page.screenshot({path:path.join(visualDir,'mobile-held-hammerstorm.png')});

  await page.evaluate(()=>window.__riskTest.releaseHammerstorm());
  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.3));
  expect(state.spin.time).toBe(0);
  expect(state.spin.cd).toBe(0);
  expect((await page.evaluate(()=>window.__riskTest.triggerHammerstorm())).started).toBe(true);
});
