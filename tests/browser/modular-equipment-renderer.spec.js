const {test,expect,devices}=require('@playwright/test');
const path=require('path');

async function boot(page,width=1280,height=900){
  await page.setViewportSize({width,height});
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

async function expectModularState(page){
  const state=await page.evaluate(()=>window.__riskTest.gearVisualState(true));
  expect(state.usesProductionSkin).toBe(false);
  expect(state.usesModularLayers).toBe(true);
  expect(state.layers.map(layer=>layer.id)).toEqual(['cape','legs','boots','chest','scarf','hat','weapon']);
  expect(state.atlases.idle.corners.every(alpha=>alpha===0)).toBe(true);
  return state;
}

test('base and every equipment channel remain independently addressable',async({page})=>{
  test.setTimeout(90000);
  await boot(page);
  const before=await page.evaluate(()=>window.__riskTest.equipmentRenderMetrics());
  await page.evaluate(()=>window.__riskTest.previewGearSetPieces('hammerChoir',0));
  let state=await expectModularState(page);
  expect(state.layers.every(layer=>!layer.visible)).toBe(true);

  const visibility={1:['hat'],2:['scarf','hat'],3:['chest','scarf','hat'],4:['boots','chest','scarf','hat'],5:['boots','chest','scarf','hat','weapon']};
  for(let count=1;count<=5;count++){
    await page.evaluate(value=>window.__riskTest.previewGearSetPieces('hammerChoir',value),count);
    state=await expectModularState(page);
    expect(state.layers.filter(layer=>layer.visible).map(layer=>layer.id)).toEqual(visibility[count]);
  }
  const after=await page.evaluate(()=>window.__riskTest.equipmentRenderMetrics());
  expect(after.layerBuilds-before.layerBuilds).toBeGreaterThanOrEqual(6);
  expect(after.layerBuilds-before.layerBuilds).toBeLessThanOrEqual(18);
});

test('mixed loadout, swap, unequip and refresh keep one live visual per slot',async({page})=>{
  test.setTimeout(90000);
  await boot(page);
  await page.evaluate(()=>window.__riskTest.previewGearSet('hammerChoir'));
  await page.evaluate(()=>window.__riskTest.previewGearItems(['stormrunner-hat','lavaSet-scarf','grandVault-coat','blackHole-hammer','natureSet-boots']));
  let preview=await page.evaluate(()=>window.__riskTest.equipmentPreviewState());
  expect(preview.matches).toBe(true);
  expect(Object.values(preview.visualChannels).filter(channel=>channel.visible)).toHaveLength(5);

  const replacement=await page.evaluate(()=>window.__riskTest.equipmentInventory().find(item=>item.slot==='weapon'&&!item.equipped));
  await page.evaluate(uid=>window.RiskLootInventoryV2Bridge.equip(uid),replacement.uid);
  await expect.poll(()=>page.evaluate(uid=>window.__riskTest.equipmentPreviewState().equipped.weapon.uid===uid,replacement.uid)).toBe(true);
  await page.evaluate(()=>window.RiskLootInventoryV2Bridge.unequip('weapon'));
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentPreviewState().visualChannels.weapon.visible)).toBe(false);
  await expect(page.locator('.gearDragGhost')).toHaveCount(0);

  await page.evaluate(()=>window.__riskTest.persistNow());
  await page.reload();
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  preview=await page.evaluate(()=>window.__riskTest.equipmentPreviewState());
  expect(preview.matches).toBe(true);
  expect(preview.equipped.weapon).toBeNull();
  expect(preview.visualChannels.weapon.visible).toBe(false);
});

test('modular character stays framed on desktop and iPhone',async({browser})=>{
  test.setTimeout(90000);
  for(const setup of [{name:'desktop',viewport:{width:1280,height:900}},{name:'iphone',device:devices['iPhone 13']}]){
    const context=await browser.newContext(setup.device||{viewport:setup.viewport});
    const page=await context.newPage();
    await page.goto('/?playwright');
    await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
    await page.evaluate(()=>window.__riskTest.previewGearSet('blackHole'));
    await expectModularState(page);
    const stage=page.locator('#gearCharacterStage');
    await expect(stage).toBeVisible();
    const layout=await stage.evaluate(element=>{const rect=element.getBoundingClientRect(),hero=element.querySelector('.gearCharacterHero').getBoundingClientRect();return{stage:{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom},hero:{left:hero.left,right:hero.right,top:hero.top,bottom:hero.bottom},viewport:document.documentElement.clientWidth}});
    expect(layout.stage.left).toBeGreaterThanOrEqual(0);
    expect(layout.stage.right).toBeLessThanOrEqual(layout.viewport+1);
    expect(layout.hero.right).toBeGreaterThan(layout.hero.left);
    await stage.screenshot({path:path.join('test-results','modular-equipment',setup.name+'-black-hole.png')});
    await context.close();
  }
});
