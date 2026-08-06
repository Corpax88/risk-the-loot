const {test,expect}=require('@playwright/test');

async function boot(page,viewport={width:390,height:844}){
  await page.setViewportSize(viewport);
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

test('iPhone HUD, minimap markers, and result action remain readable',async({page},testInfo)=>{
  await boot(page);
  const markerState=await page.evaluate(()=>window.__riskTest.prepareUiMarkerTest());
  expect(markerState.caches.sort()).toEqual(['bossReward','common','rare']);
  await expect(page.locator('#miniMapCacheCount')).toContainText('3');
  await expect(page.locator('#pappaCombatHud')).toBeVisible();
  const layout=await page.evaluate(()=>{
    const box=id=>document.getElementById(id).getBoundingClientRect().toJSON();
    const hp=document.getElementById('healthText');
    return{viewport:{w:innerWidth,h:innerHeight},hud:box('pappaCombatHud'),map:box('miniMap'),hp:{client:hp.clientWidth,scroll:hp.scrollWidth,text:hp.textContent}};
  });
  expect(layout.hud.width).toBeLessThanOrEqual(250);
  expect(layout.map.width).toBeLessThanOrEqual(96);
  expect(layout.map.height).toBeLessThanOrEqual(68);
  expect(layout.hp.scroll).toBeLessThanOrEqual(layout.hp.client);
  expect(layout.hp.text).toMatch(/\d+\s*\/\s*\d+/);
  await page.evaluate(()=>window.__riskTest.showUiResultTest());
  await expect(page.locator('#resultOverlay')).toHaveClass(/show/);
  const resultButton=await page.locator('#closeResult').boundingBox();
  expect(resultButton).toBeTruthy();
  expect(resultButton.y).toBeGreaterThanOrEqual(0);
  expect(resultButton.y+resultButton.height).toBeLessThanOrEqual(844);
  await expect(page.locator('#closeResult')).toContainText('BACK TO WORKSHOP');
  await page.screenshot({path:testInfo.outputPath('iphone-ui-flow.png'),fullPage:true});
});

test('inventory tap selection slides up one action flow and protects equipped items',async({page},testInfo)=>{
  await boot(page);
  await page.evaluate(()=>{
    window.__riskTest.previewGearSet('stormrunner');
    window.__riskTest.previewGearSet('stormrunner');
  });
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
  const initial=await page.evaluate(()=>window.__riskTest.equipmentInventory().length);
  await expect(page.locator('#selectGearItems')).toHaveCount(0);
  const cards=page.locator('#gearGrid .gearBagSlot:not(.equipped)');
  await expect(cards).toHaveCount(7);
  await cards.nth(0).click();
  await expect(page.locator('#gearBulkActionBar')).toHaveClass(/show/);
  await expect(cards.nth(0)).toHaveClass(/bulkSelected/);
  await cards.nth(1).click();
  await expect(page.locator('#gearBulkCount')).toContainText('2 SELECTED');
  await page.screenshot({path:testInfo.outputPath('inventory-selection-actions.png'),fullPage:true});
  // Keep this multi-select test outside the separate double-tap equip gesture.
  await page.waitForTimeout(760);
  await cards.nth(1).click();
  await expect(page.locator('#gearBulkCount')).toContainText('1 SELECTED');
  // Separate this tap from the intentional mobile double-tap equip gesture.
  await page.waitForTimeout(760);
  await cards.nth(1).click();
  await expect(page.locator('#gearBulkCount')).toContainText('2 SELECTED');
  await page.locator('#cancelGearSelection').click();
  await expect(page.locator('#gearBulkActionBar')).not.toHaveClass(/show/);
  await expect(page.locator('#gearGrid .gearBagSlot.bulkSelected')).toHaveCount(0);
  await cards.nth(0).click();
  await cards.nth(1).click();
  await page.locator('#sellFilteredGear').click();
  await expect(page.locator('#sellFilteredLabel')).toHaveText('CONFIRM SELL');
  expect(await page.evaluate(()=>window.__riskTest.equipmentInventory().length)).toBe(initial);
  await page.locator('#sellFilteredGear').click();
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentInventory().length)).toBe(initial-2);
  await expect(page.locator('#gearBulkActionBar')).not.toHaveClass(/show/);

  const remaining=page.locator('#gearGrid .gearBagSlot:not(.equipped)');
  await remaining.nth(0).click();
  const materialsBefore=await page.locator('#materialCount').textContent();
  await page.locator('#salvageSelectedGear').click();
  await expect(page.locator('#salvageSelectedLabel')).toHaveText('CONFIRM SALVAGE');
  await page.locator('#salvageSelectedGear').click();
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentInventory().length)).toBe(initial-3);
  expect(await page.locator('#materialCount').textContent()).not.toBe(materialsBefore);
  await page.screenshot({path:testInfo.outputPath('inventory-bulk-actions.png'),fullPage:true});
});
