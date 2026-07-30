const {test,expect,devices}=require('@playwright/test');

async function ready(page){
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

test('visual quality budgets cap pooled effects without changing gameplay state',async({page})=>{
  await ready(page);
  const before=await page.evaluate(()=>window.__riskTest.state());
  const low=await page.evaluate(()=>{
    window.__riskTest.setVisualQuality('low');
    return window.__riskTest.floodVisuals(900);
  });
  expect(low.active).toBe('low');
  expect(low.particles).toBeLessThanOrEqual(low.profile.particles);
  expect(low.effects).toBeLessThanOrEqual(low.profile.effects);
  expect(low.lightning).toBeLessThanOrEqual(low.profile.lightning);
  expect(low.dpr).toBeLessThanOrEqual(low.profile.dpr);
  const after=await page.evaluate(()=>window.__riskTest.state());
  expect(after.materials).toBe(before.materials);
  expect(after.legendaryCores).toBe(before.legendaryCores);
});

test('quality preference persists and fixed quality never adapts',async({page})=>{
  await ready(page);
  await page.evaluate(()=>window.__riskTest.setVisualQuality('medium'));
  await page.reload();
  await expect.poll(()=>page.evaluate(()=>window.__riskTest&&window.__riskTest.performanceState().requested)).toBe('medium');
  const state=await page.evaluate(()=>window.__riskTest.simulateFramePerformance(70,1200));
  expect(state.active).toBe('medium');
});

test('auto quality uses hysteresis to reduce and restore only visual work',async({page})=>{
  await ready(page);
  let state=await page.evaluate(()=>{
    window.__riskTest.setVisualQuality('auto');
    window.__riskTest.setVisualQuality('high');
    window.__riskTest.setVisualQuality('auto');
    return window.__riskTest.simulateFramePerformance(70,500);
  });
  expect(state.requested).toBe('auto');
  expect(state.active).toBe('medium');
  state=await page.evaluate(()=>window.__riskTest.simulateFramePerformance(12,1800,'medium'));
  expect(state.active).toBe('high');
});

test('iPhone can lock low quality and keeps readable effect budgets',async({browser})=>{
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await ready(page);
  const state=await page.evaluate(()=>{
    window.__riskTest.setVisualQuality('low');
    window.__riskTest.spawnHammerstormPack(64,{durable:true,fullBlackHole:true});
    window.__riskTest.triggerHammerstorm();
    window.__riskTest.advanceHammerstorm(.7);
    return window.__riskTest.performanceState();
  });
  expect(state.active).toBe('low');
  expect(state.particles).toBeLessThanOrEqual(120);
  expect(state.effects).toBeLessThanOrEqual(70);
  expect(state.lightning).toBeLessThanOrEqual(26);
  await expect(page.locator('#spinButton')).toBeVisible();
  await context.close();
});
