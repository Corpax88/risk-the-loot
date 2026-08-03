const {test,expect,devices}=require('@playwright/test');

async function boot(page){
  await page.addInitScript(()=>{
    window.__gearHaptics=[];
    try{Object.defineProperty(navigator,'vibrate',{configurable:true,value:pattern=>{window.__gearHaptics.push(pattern);return true}})}catch(error){}
  });
  await page.goto('/?playwright');
  await page.evaluate(()=>localStorage.clear());
  await page.reload();
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest&&window.RiskLootInventoryV2Bridge))).toBe(true)
}

async function seedMixedGear(page){
  await boot(page);
  await page.evaluate(()=>{
    window.__riskTest.previewGearRarity('common');
    window.__riskTest.previewGearRarity('rare');
    window.__riskTest.persistNow()
  });
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/)
}

async function selectV1(page,uid){
  const card=page.locator(`.gearBagSlot[data-item="${uid}"]`);
  await card.click();
  await expect(card).toHaveAttribute('aria-selected','true');
  await expect(page.locator('#gearBulkActionBar')).toHaveClass(/show/);
  return card
}

test('desktop Sell and Salvage update exact resources, inventory and save data',async({page})=>{
  await seedMixedGear(page);
  let inventory=await page.evaluate(()=>window.__riskTest.equipmentInventory());
  const candidates=inventory.filter(item=>item.rarity==='common'&&!item.equipped);
  expect(candidates.length).toBeGreaterThanOrEqual(2);
  const before=await page.evaluate(()=>window.__riskTest.inventoryResources());

  await selectV1(page,candidates[0].uid);
  await page.locator('#sellFilteredGear').click();
  await page.locator('#sellFilteredGear').click();
  await expect.poll(()=>page.evaluate(uid=>!window.__riskTest.equipmentInventory().some(item=>item.uid===uid),candidates[0].uid)).toBe(true);
  let resources=await page.evaluate(()=>window.__riskTest.inventoryResources());
  expect(resources.scrap-before.scrap).toBe(candidates[0].value);
  expect(resources.materials).toBe(before.materials);

  await selectV1(page,candidates[1].uid);
  await page.locator('#salvageSelectedGear').click();
  await page.locator('#salvageSelectedGear').click();
  await expect.poll(()=>page.evaluate(uid=>!window.__riskTest.equipmentInventory().some(item=>item.uid===uid),candidates[1].uid)).toBe(true);
  resources=await page.evaluate(()=>window.__riskTest.inventoryResources());
  expect(resources.materials-before.materials).toBe(candidates[1].salvage.materials);
  expect(resources.legendaryCores-before.legendaryCores).toBe(0);

  await page.reload();
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  expect(await page.evaluate(uids=>uids.every(uid=>!window.__riskTest.equipmentInventory().some(item=>item.uid===uid)),[candidates[0].uid,candidates[1].uid])).toBe(true);
  expect(await page.evaluate(()=>window.__riskTest.inventoryResources())).toEqual(resources)
});

test('Legendary actions require confirmation and equipped or locked gear stays protected',async({page})=>{
  await boot(page);
  await page.evaluate(()=>{
    window.__riskTest.previewGearSet('blackHole');
    window.__riskTest.previewGearSet('stormrunner')
  });
  const inventory=await page.evaluate(()=>window.__riskTest.equipmentInventory());
  const equipped=inventory.find(item=>item.equipped);
  const candidate=inventory.find(item=>item.rarity==='legendary'&&!item.equipped);
  const locked=inventory.find(item=>!item.equipped&&item.uid!==candidate.uid);
  expect(equipped&&candidate&&locked).toBeTruthy();

  const equippedCard=page.locator(`.gearBagSlot[data-item="${equipped.uid}"]`);
  await equippedCard.click();
  await expect(equippedCard).toHaveAttribute('aria-selected','false');
  await expect(page.locator('#gearBulkActionBar')).not.toHaveClass(/show/);

  expect(await page.evaluate(uid=>window.__riskTest.setGearLocked(uid,true),locked.uid)).toBe(true);
  const lockedCard=page.locator(`.gearBagSlot[data-item="${locked.uid}"]`);
  await lockedCard.click();
  await expect(lockedCard).toHaveAttribute('aria-selected','false');
  await expect(page.locator('#gearBulkActionBar')).not.toHaveClass(/show/);

  const before=await page.evaluate(()=>window.__riskTest.inventoryResources());
  await selectV1(page,candidate.uid);
  await page.locator('#salvageSelectedGear').click();
  await expect(page.locator('#salvageSelectedGear')).toContainText('CONFIRM');
  expect(await page.evaluate(uid=>window.__riskTest.equipmentInventory().some(item=>item.uid===uid),candidate.uid)).toBe(true);
  await page.locator('#salvageSelectedGear').click();
  await expect.poll(()=>page.evaluate(uid=>!window.__riskTest.equipmentInventory().some(item=>item.uid===uid),candidate.uid)).toBe(true);
  const after=await page.evaluate(()=>window.__riskTest.inventoryResources());
  expect(after.materials-before.materials).toBe(25);
  expect(after.legendaryCores-before.legendaryCores).toBe(1)
});

test('iPhone double tap equips and removes every slot while one tap selects and inspects',async({browser})=>{
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await boot(page);
  await page.evaluate(()=>{
    window.__riskTest.previewGearSet('hammerChoir');
    window.__riskTest.previewGearSet('blackHole')
  });
  const candidates=await page.evaluate(()=>window.__riskTest.equipmentInventory().filter(item=>item.setId==='hammerChoir'&&!item.equipped));
  expect(new Set(candidates.map(item=>item.slot)).size).toBe(5);

  for(const item of candidates){
    const card=page.locator(`.gearBagSlot[data-item="${item.uid}"]`);
    await card.tap();
    expect(await page.evaluate(uid=>window.__riskTest.equipmentInventory().find(entry=>entry.uid===uid).equipped,item.uid)).toBe(false);
    await page.waitForTimeout(560);
    await page.evaluate(uid=>{const card=document.querySelector(`.gearBagSlot[data-item="${uid}"]`);card.click();card.click()},item.uid);
    await expect.poll(()=>page.evaluate(uid=>window.__riskTest.equipmentInventory().find(entry=>entry.uid===uid).equipped,item.uid)).toBe(true);
    await expect.poll(()=>page.evaluate(()=>window.__gearHaptics.length)).toBeGreaterThan(0);
    await page.waitForTimeout(380)
  }

  const first=candidates[0];
  await page.evaluate(uid=>{const card=document.querySelector(`.gearBagSlot[data-item="${uid}"]`);card.click();card.click()},first.uid);
  await expect.poll(()=>page.evaluate(uid=>window.__riskTest.equipmentInventory().find(entry=>entry.uid===uid).equipped,first.uid)).toBe(false);
  await context.close()
});

test('iPhone touch multi-select stays clear, reachable, and cancellable',async({browser},testInfo)=>{
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await boot(page);
  await page.evaluate(()=>window.__riskTest.previewGearSetPieces('hammerChoir',0));
  const cards=page.locator('#gearGrid .gearBagSlot:not(.equipped)');
  await cards.nth(0).tap();
  await cards.nth(1).tap();
  await expect(page.locator('#gearBulkCount')).toContainText('2 SELECTED');
  await expect(page.locator('#gearHoverPreview')).not.toHaveClass(/show/);
  const bar=await page.locator('#gearBulkActionBar').boundingBox();
  expect(bar).toBeTruthy();
  expect(bar.x).toBeGreaterThanOrEqual(0);
  expect(bar.x+bar.width).toBeLessThanOrEqual(390);
  expect(bar.y+bar.height).toBeLessThanOrEqual(844);
  await page.screenshot({path:testInfo.outputPath('iphone-touch-selection.png'),fullPage:true});
  await page.locator('#cancelGearSelection').tap();
  await expect(page.locator('#gearBulkActionBar')).not.toHaveClass(/show/);
  await expect(page.locator('#gearGrid .gearBagSlot.bulkSelected')).toHaveCount(0);
  await context.close()
});

test('Inventory V2 disposes one duplicate at a time and clears stale confirmation',async({page})=>{
  await boot(page);
  await page.evaluate(()=>{
    window.__riskTest.previewGearSet('blackHole');
    window.__riskTest.previewGearSet('blackHole');
    window.__riskTest.previewGearSet('stormrunner');
    window.InventoryV2.open()
  });
  await expect(page.locator('#inventoryV2Overlay')).toHaveClass(/show/);
  const duplicate=await page.evaluate(()=>{
    const inventory=window.__riskTest.equipmentInventory(),counts=new Map();
    for(const item of inventory)counts.set(item.itemId,(counts.get(item.itemId)||0)+1);
    return inventory.find(item=>!item.equipped&&counts.get(item.itemId)>1)
  });
  const matchingBefore=await page.evaluate(itemId=>window.__riskTest.equipmentInventory().filter(item=>item.itemId===itemId).length,duplicate.itemId);
  await page.locator(`.inventoryV2Card[data-uid="${duplicate.uid}"]`).click();
  await page.locator('#inventoryV2Sell').click();
  await expect(page.locator('#inventoryV2Sell')).toContainText('CONFIRM');
  await page.locator('#inventoryV2Sell').click();
  await expect.poll(()=>page.evaluate(uid=>!window.__riskTest.equipmentInventory().some(item=>item.uid===uid),duplicate.uid)).toBe(true);
  expect(await page.evaluate(itemId=>window.__riskTest.equipmentInventory().filter(item=>item.itemId===itemId).length,duplicate.itemId)).toBe(matchingBefore-1);

  const next=await page.evaluate(()=>window.RiskLootInventoryV2Bridge.snapshot().gear.find(item=>!item.equipped));
  await page.locator(`.inventoryV2Card[data-uid="${next.uid}"]`).click();
  await page.locator('#inventoryV2Salvage').click();
  await expect(page.locator('#inventoryV2Salvage')).toContainText('CONFIRM');
  await page.locator('#inventoryV2Close').click();
  await page.evaluate(()=>window.InventoryV2.open());
  await page.locator(`.inventoryV2Card[data-uid="${next.uid}"]`).click();
  await expect(page.locator('#inventoryV2Salvage')).not.toContainText('CONFIRM')
});
