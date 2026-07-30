const {test,expect,devices}=require('@playwright/test');
const path=require('path');

async function openBlackHoleSet(page){
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(()=>window.__riskTest.previewGearSet('blackHole'));
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.gearVisualState().setId)).toBe('blackHole');
}

test('Black Hole set owns a dedicated Armory and combat presentation',async({page})=>{
  test.setTimeout(60000);
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.setViewportSize({width:1440,height:960});
  await openBlackHoleSet(page);

  await expect(page.locator('.adventureBagHeader')).toHaveCount(0);
  const characterBox=await page.locator('#gearCharacterStage').boundingBox();
  expect(characterBox.height).toBeGreaterThan(430);
  await page.locator('#gearPanel').screenshot({
    path:path.join('test-results','black-hole-v2','armory-desktop.png')
  });

  await page.locator('#closeGear').click();
  await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(36,{durable:true}));
  expect((await page.evaluate(()=>window.__riskTest.triggerHammerstorm())).started).toBe(true);
  let state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.48));
  expect(state.spin.visual).toBe('blackHole');
  expect(['pull','pulse']).toContain(state.spin.phase);
  expect(state.gravityMotes).toBeGreaterThan(0);
  expect(Object.values(state.blackHoleSheets).every(Boolean)).toBe(true);
  expect(state.effects).not.toContain('spinArc');
  await page.locator('#world').screenshot({
    path:path.join('test-results','black-hole-v2','active-pull-desktop.png')
  });

  const beforeX=state.player.x;
  const dash=await page.evaluate(()=>window.__riskTest.dashDuringHammerstorm(1,0));
  expect(dash.started).toBe(true);
  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.06));
  expect(state.spin.phase).toBe('dash');
  expect(state.player.x).toBeGreaterThan(beforeX+20);
  expect(state.spin.vortex).toMatchObject({x:state.player.x,y:state.player.y});
  await page.locator('#world').screenshot({
    path:path.join('test-results','black-hole-v2','dash-desktop.png')
  });

  await page.evaluate(()=>window.__riskTest.releaseHammerstorm());
  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.12));
  expect(state.effects).toContain('blackHoleCollapse');
  expect(state.effects).not.toContain('packClear');
  await page.locator('#world').screenshot({
    path:path.join('test-results','black-hole-v2','collapse-desktop.png')
  });
  expect(pageErrors).toEqual([]);
});

test('Black Hole Armory and vortex remain readable on iPhone',async({browser})=>{
  test.setTimeout(60000);
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await openBlackHoleSet(page);

  await expect(page.locator('.adventureBagHeader')).toHaveCount(0);
  const panelBox=await page.locator('#gearPanel').boundingBox();
  const characterBox=await page.locator('#gearCharacterStage').boundingBox();
  expect(panelBox.width).toBeLessThanOrEqual(390);
  expect(characterBox.height).toBeGreaterThan(210);
  await page.locator('#gearPanel').screenshot({
    path:path.join('test-results','black-hole-v2','armory-mobile.png')
  });

  await page.locator('#closeGear').tap();
  await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(30,{durable:true}));
  await page.evaluate(()=>window.__riskTest.triggerHammerstorm());
  const state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.5));
  expect(state.spin.visual).toBe('blackHole');
  expect(state.gravityMotes).toBeGreaterThan(0);
  expect(state.gravityMotes).toBeLessThanOrEqual(220);
  await page.locator('#world').screenshot({
    path:path.join('test-results','black-hole-v2','active-pull-mobile.png')
  });
  expect(pageErrors).toEqual([]);
  await context.close();
});
