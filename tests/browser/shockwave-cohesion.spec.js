const {test,expect}=require('@playwright/test');

async function openPlaytest(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

test('shockwaves preserve horde cohesion and expose future displacement modes',async({page})=>{
  await openPlaytest(page);

  const modes=await page.evaluate(()=>window.__riskTest.displacementModes());
  expect(modes).toEqual(['none','pull','vortex','knockback','strongKnockback']);

  const samples=await page.evaluate(()=>Object.fromEntries(
    window.__riskTest.displacementModes().map(mode=>[mode,window.__riskTest.shockwaveProbe(mode)])
  ));

  expect(samples.none.velocityX).toBe(0);
  expect(samples.none.duration).toBe(0);
  expect(samples.pull.velocityX).toBeLessThan(0);
  expect(samples.vortex.velocityX).toBeLessThan(samples.pull.velocityX);
  expect(samples.knockback.velocityX).toBeGreaterThan(0);
  expect(samples.strongKnockback.velocityX).toBeGreaterThan(samples.knockback.velocityX);

  for(const sample of Object.values(samples)){
    expect(sample.damaged).toBe(true);
    expect(sample.effects).toContain('pressureWave');
  }
});
