const {test,expect,devices}=require('@playwright/test');

async function boot(page){
  await page.addInitScript(()=>{
    if(!sessionStorage.getItem('__rtlInventoryActionsBooted')){
      localStorage.clear();
      sessionStorage.setItem('__rtlInventoryActionsBooted','1')
    }
    window.__gearHaptics=[];
    try{Object.defineProperty(navigator,'vibrate',{configurable:true,value:pattern=>{window.__gearHaptics.push(pattern);return true}})}catch(error){}
  });
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest&&window.RiskLootInventoryV2Bridge))).toBe(true)
}

async function seedDuplicateStormcaller(page){
  await boot(page);
  await page.evaluate(()=>{
    window.__riskTest.previewGearSet('stormrunner');
    window.__riskTest.previewGearSet('stormrunner');
    window.__riskTest.persistNow()
  });
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/)
}

async function selectGear(page,uid,touch=false){
  const card=page.locator(`.gearBagSlot[data-item="${uid}"]`);
  touch?await card.tap():await card.click();
  await expect(card).toHaveAttribute('aria-selected','true');
  await expect(page.locator('#gearBulkActionBar')).toHaveClass(/show/);
  return card
}

test('desktop Sell and Salvage update resources, inventory and persisted state',async({page})=>{
  await seedDuplicateStormcaller(page);
  const candidates=await page.evaluate(()=>window.__riskTest.equipmentInventory().filter(item=>!item.equipped));
  expect(candidates.length).toBeGreaterThanOrEqual(2);
  const before=await page.evaluate(()=>window.__riskTest.inventoryResources());

  await selectGear(page,candidates[0].uid);
  await page.locator('#sellFilteredGear').click();
  await expect(page.locator('#sellFilteredLabel')).toContainText('CONFIRM');
  await page.locator('#sellFilteredGear').click();
  await expect.poll(()=>page.evaluate(uid=>!window.__riskTest.equipmentInventory().some(item=>item.uid===uid),candidates[0].uid)).toBe(true);
  let resources=await page.evaluate(()=>window.__riskTest.inventoryResources());
  expect(resources.scrap-before.scrap).toBe(candidates[0].value);
  expect(resources.materials).toBe(before.materials);

  await selectGear(page,candidates[1].uid);
  await page.locator('#salvageSelectedGear').click();
  await expect(page.locator('#salvageSelectedLabel')).toContainText('CONFIRM');
  await page.locator('#salvageSelectedGear').click();
  await expect.poll(()=>page.evaluate(uid=>!window.__riskTest.equipmentInventory().some(item=>item.uid===uid),candidates[1].uid)).toBe(true);
  resources=await page.evaluate(()=>window.__riskTest.inventoryResources());
  expect(resources.materials-before.materials).toBe(candidates[1].salvage.materials);
  expect(resources.legendaryCores-before.legendaryCores).toBe(candidates[1].salvage.cores);

  await page.reload();
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  expect(await page.evaluate(uids=>uids.every(uid=>!window.__riskTest.equipmentInventory().some(item=>item.uid===uid)),[candidates[0].uid,candidates[1].uid])).toBe(true);
  expect(await page.evaluate(()=>window.__riskTest.inventoryResources())).toEqual(resources)
});

test('equipped and locked gear remain protected while Legendary disposal requires confirmation',async({page})=>{
  await seedDuplicateStormcaller(page);
  const inventory=await page.evaluate(()=>window.__riskTest.equipmentInventory());
  const equipped=inventory.find(item=>item.equipped);
  const candidates=inventory.filter(item=>!item.equipped);
  const [locked,salvage]=candidates;
  expect(equipped&&locked&&salvage).toBeTruthy();

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
  await selectGear(page,salvage.uid);
  await page.locator('#salvageSelectedGear').click();
  await expect(page.locator('#salvageSelectedLabel')).toContainText('CONFIRM');
  expect(await page.evaluate(uid=>window.__riskTest.equipmentInventory().some(item=>item.uid===uid),salvage.uid)).toBe(true);
  await page.locator('#salvageSelectedGear').click();
  await expect.poll(()=>page.evaluate(uid=>!window.__riskTest.equipmentInventory().some(item=>item.uid===uid),salvage.uid)).toBe(true);
  const after=await page.evaluate(()=>window.__riskTest.inventoryResources());
  expect(after.materials-before.materials).toBe(salvage.salvage.materials);
  expect(after.legendaryCores-before.legendaryCores).toBe(salvage.salvage.cores)
});

test('iPhone single tap inspects and double tap equips or removes every visual slot',async({browser})=>{
  test.setTimeout(60000);
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await seedDuplicateStormcaller(page);
  const candidates=await page.evaluate(()=>window.__riskTest.equipmentInventory().filter(item=>item.setId==='stormrunner'&&!item.equipped));
  expect(new Set(candidates.map(item=>item.slot))).toEqual(new Set(['hat','cape','chest','legs','boots','scarf','weapon']));

  for(const item of candidates){
    const card=page.locator(`.gearBagSlot[data-item="${item.uid}"]`);
    await card.tap();
    expect(await page.evaluate(uid=>window.__riskTest.equipmentInventory().find(entry=>entry.uid===uid).equipped,item.uid)).toBe(false);
    await expect(page.locator('#mobileGearSelectionName')).toHaveText(item.name);
    await page.waitForTimeout(40);
    await card.tap();
    await expect.poll(()=>page.evaluate(uid=>window.__riskTest.equipmentInventory().find(entry=>entry.uid===uid).equipped,item.uid)).toBe(true);
    await page.waitForTimeout(380)
  }

  const first=candidates[0],firstCard=page.locator(`.gearBagSlot[data-item="${first.uid}"]`);
  await firstCard.tap();
  await page.waitForTimeout(40);
  await firstCard.tap();
  await expect.poll(()=>page.evaluate(uid=>window.__riskTest.equipmentInventory().find(entry=>entry.uid===uid).equipped,first.uid)).toBe(false);
  expect(await page.evaluate(()=>window.__gearHaptics.length)).toBeGreaterThan(0);
  await context.close()
});

test('iPhone multi-select stays reachable, updates count and cancels cleanly',async({browser},testInfo)=>{
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await seedDuplicateStormcaller(page);
  const candidates=await page.evaluate(()=>window.__riskTest.equipmentInventory().filter(item=>!item.equipped).slice(0,2));
  await selectGear(page,candidates[0].uid,true);
  await selectGear(page,candidates[1].uid,true);
  await expect(page.locator('#gearBulkCount')).toContainText('2 SELECTED');
  await expect(page.locator('#gearHoverPreview')).not.toHaveClass(/show/);
  const bar=await page.locator('#gearBulkActionBar').boundingBox();
  expect(bar).toBeTruthy();
  expect(bar.x).toBeGreaterThanOrEqual(0);
  expect(bar.x+bar.width).toBeLessThanOrEqual(390);
  expect(bar.y+bar.height).toBeLessThanOrEqual(844);
  await page.screenshot({path:testInfo.outputPath('iphone-touch-selection.png'),animations:'disabled'});
  await page.locator('#cancelGearSelection').tap();
  await expect(page.locator('#gearBulkActionBar')).not.toHaveClass(/show/);
  await expect(page.locator('#gearGrid .gearBagSlot.bulkSelected')).toHaveCount(0);
  await context.close()
});

test('duplicate disposal removes one copy and closing the Armory clears stale confirmation',async({page})=>{
  await seedDuplicateStormcaller(page);
  const duplicate=await page.evaluate(()=>{
    const inventory=window.__riskTest.equipmentInventory(),counts=new Map();
    for(const item of inventory)counts.set(item.itemId,(counts.get(item.itemId)||0)+1);
    return inventory.find(item=>!item.equipped&&counts.get(item.itemId)>1)
  });
  const matchingBefore=await page.evaluate(itemId=>window.__riskTest.equipmentInventory().filter(item=>item.itemId===itemId).length,duplicate.itemId);
  await selectGear(page,duplicate.uid);
  await page.locator('#sellFilteredGear').click();
  await expect(page.locator('#sellFilteredLabel')).toContainText('CONFIRM');
  await page.locator('#sellFilteredGear').click();
  await expect.poll(()=>page.evaluate(uid=>!window.__riskTest.equipmentInventory().some(item=>item.uid===uid),duplicate.uid)).toBe(true);
  expect(await page.evaluate(itemId=>window.__riskTest.equipmentInventory().filter(item=>item.itemId===itemId).length,duplicate.itemId)).toBe(matchingBefore-1);

  const next=await page.evaluate(()=>window.__riskTest.equipmentInventory().find(item=>!item.equipped&&!item.locked));
  await selectGear(page,next.uid);
  await page.locator('#salvageSelectedGear').click();
  await expect(page.locator('#salvageSelectedLabel')).toContainText('CONFIRM');
  await page.locator('#closeGear').click();
  await expect(page.locator('#gearOverlay')).not.toHaveClass(/show/);
  await page.evaluate(()=>window.RiskLootInventoryV2Bridge.openLegacy());
  await selectGear(page,next.uid);
  await expect(page.locator('#salvageSelectedLabel')).not.toContainText('CONFIRM')
});
