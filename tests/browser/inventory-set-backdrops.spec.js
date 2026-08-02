const {test,expect}=require('@playwright/test');

const sets=[
  {id:'natureSet',asset:'nature.png'},
  {id:'lavaSet',asset:'lava.png'},
  {id:'stormrunner',asset:'stormcaller.png'},
  {id:'blackHole',asset:'black-hole.png'}
];

async function boot(page){
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest&&window.InventoryV2))).toBe(true)
}

async function seedSets(page){
  await page.evaluate(ids=>ids.forEach(id=>window.__riskTest.previewGearSet(id)),sets.map(set=>set.id));
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/)
}

async function setItemUid(page,setId){
  return page.evaluate(id=>window.RiskLootInventoryV2Bridge.snapshot().gear.find(item=>item.set&&item.set.id===id).uid,setId)
}

async function expectBackdrop(locator,set){
  await expect(locator).toHaveAttribute('data-inventory-backdrop',set.id);
  await expect.poll(()=>locator.evaluate(element=>getComputedStyle(element).backgroundImage)).toContain(set.asset)
}

test('Inventory V1 previews every supplied set scene without changing equipment',async({page},testInfo)=>{
  await page.setViewportSize({width:1440,height:900});
  await boot(page);
  await seedSets(page);

  for(const set of sets){
    const uid=await setItemUid(page,set.id),card=page.locator(`.gearBagSlot[data-item="${uid}"]`);
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await expectBackdrop(page.locator('#gearCharacterStage'),set);
    if(set.id==='stormrunner')await page.locator('#gearCharacterStage').screenshot({path:testInfo.outputPath('inventory-v1-stormcaller.png')})
  }

  await page.locator('#gearCharacterStage').screenshot({path:testInfo.outputPath('inventory-v1-black-hole.png')})
});

test('Inventory V2 switches set scenes on iPhone-sized touch selection',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await boot(page);
  await seedSets(page);
  await page.locator('#closeGear').click();
  await page.locator('#inventoryV2Button').click();
  await expect(page.locator('#inventoryV2Overlay')).toHaveClass(/show/);

  for(const set of sets){
    const uid=await setItemUid(page,set.id),card=page.locator(`.inventoryV2Card[data-uid="${uid}"]`);
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await expectBackdrop(page.locator('.inventoryV2Portrait'),set);
    if(set.id==='stormrunner')await page.locator('.inventoryV2Character').screenshot({path:testInfo.outputPath('inventory-v2-stormcaller-mobile.png')})
  }

  await page.locator('.inventoryV2Character').screenshot({path:testInfo.outputPath('inventory-v2-black-hole-mobile.png')});
  const overflow=await page.locator('#inventoryV2Overlay').evaluate(element=>element.scrollWidth-element.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1)
});
