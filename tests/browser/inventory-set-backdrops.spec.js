const {test,expect}=require('@playwright/test');

async function boot(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest&&window.RiskLootEquipmentBridge))).toBe(true);
}

test('the active Stormcaller scene follows touch selection without changing equipment',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await boot(page);
  await page.evaluate(()=>window.__riskTest.previewGearSet('stormrunner'));
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
  const before=await page.evaluate(()=>window.__riskTest.equipmentState().equipped);
  const uid=await page.evaluate(()=>window.__riskTest.equipmentInventory().find(item=>item.setId==='stormrunner').uid);
  const card=page.locator(`.gearBagSlot[data-item="${uid}"]`);
  await card.scrollIntoViewIfNeeded();
  await card.click();
  await expect(page.locator('#gearCharacterStage')).toHaveAttribute('data-inventory-backdrop','stormrunner');
  await expect.poll(()=>page.locator('#gearCharacterStage').evaluate(element=>getComputedStyle(element).backgroundImage)).toContain('stormcaller.png');
  expect(await page.evaluate(()=>window.__riskTest.equipmentState().equipped)).toEqual(before);
  await page.locator('#gearCharacterStage').screenshot({path:testInfo.outputPath('armory-stormcaller-mobile.png')});
  expect(await page.locator('#gearPanel').evaluate(element=>element.scrollWidth-element.clientWidth)).toBeLessThanOrEqual(1);
});
