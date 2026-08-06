const {test,expect,devices}=require('@playwright/test');
const path=require('path');

async function openEquipment(page,viewport){
  if(viewport)await page.setViewportSize(viewport);
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(()=>{
    window.__riskTest.previewGearSet('stormrunner');
    window.__riskTest.previewGearSet('stormrunner');
  });
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
  await expect(page.locator('#gearCharacterStage')).toBeVisible();
  await expect(page.locator('#gearGrid')).toBeVisible();
}

async function unequippedItem(page,slot,excludeUid){
  return page.evaluate(({slot,excludeUid})=>window.__riskTest.equipmentInventory()
    .find(item=>item.slot===slot&&!item.equipped&&item.uid!==excludeUid),{slot,excludeUid});
}

test('desktop unified equipment keeps the equipped character stable while comparing and equipping',async({page})=>{
  test.setTimeout(45000);
  await openEquipment(page,{width:1440,height:960});

  let candidate=await unequippedItem(page,'hat');
  expect(candidate).toBeTruthy();
  const source=page.locator('#gearGrid [data-item="'+candidate.uid+'"]');
  const hero=page.locator('#gearCharacterStage .gearCharacterHero');
  const equippedImage=await hero.evaluate(element=>element.style.backgroundImage);
  await source.hover();
  await expect(page.locator('#gearCharacterStage')).not.toHaveClass(/gearPreviewing/);
  expect(await hero.evaluate(element=>element.style.backgroundImage)).toBe(equippedImage);
  await expect(page.locator('#gearDetail .gearComparison')).toBeVisible();
  await expect(page.locator('#gearDetail .gearCompareRows > span')).toHaveCount(5);
  await expect(page.locator('#gearDetail .gearDecisionSet')).toBeVisible();
  expect((await page.evaluate(()=>window.__riskTest.equipmentState())).previewing).toBe(false);
  await page.mouse.move(2,2);
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentState().previewing)).toBe(false);

  const beforeSort=await page.evaluate(()=>window.__riskTest.equipmentState().gearSort);
  await page.locator('#gearSortButton').click();
  const afterSort=await page.evaluate(()=>window.__riskTest.equipmentState().gearSort);
  expect(afterSort).not.toBe(beforeSort);
  await page.locator('#gearSortButton').click();
  await page.locator('#gearSortButton').click();
  expect((await page.evaluate(()=>window.__riskTest.equipmentState())).gearSort).toBe('newest');
  await page.locator('#gearFilters button').nth(1).click();
  expect((await page.evaluate(()=>window.__riskTest.equipmentState())).gearFilter).not.toBe('all');
  await page.locator('#gearFilters button').first().click();
  await page.locator('#gearRarityFilters button').filter({hasText:'EPIC'}).click();
  expect((await page.evaluate(()=>window.__riskTest.equipmentState())).gearRarityFilter).toBe('epic');
  await page.locator('#gearRarityFilters button').first().click();

  candidate=await unequippedItem(page,'hat');
  await page.locator('#gearGrid [data-item="'+candidate.uid+'"]').dragTo(
    page.locator('.gearLoadoutSlot[data-display-slot="hat"]')
  );
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentState().equipped.hat)).toBe(candidate.uid);

  let quick=await unequippedItem(page,'boots');
  await page.locator('#gearGrid [data-item="'+quick.uid+'"]').dblclick();
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentState().equipped.boots)).toBe(quick.uid);

  quick=await unequippedItem(page,'weapon');
  await page.locator('#gearGrid [data-item="'+quick.uid+'"]').click({button:'right'});
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentState().equipped.weapon)).toBe(quick.uid);

  quick=await unequippedItem(page,'scarf');
  await page.locator('#gearGrid [data-item="'+quick.uid+'"]').dragTo(page.locator('#gearCharacterStage'));
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentState().equipped.scarf)).toBe(quick.uid);

  const equippedHat=page.locator('.gearLoadoutSlot[data-display-slot="hat"]');
  await equippedHat.dragTo(page.locator('.equipmentInventoryDrop'));
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentState().equipped.hat)).toBeNull();

  const bounds=await page.locator('#gearPanel').evaluate(element=>({
    left:element.getBoundingClientRect().left,
    right:element.getBoundingClientRect().right,
    viewport:document.documentElement.clientWidth,
    overflow:element.scrollWidth-element.clientWidth
  }));
  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewport);
  expect(bounds.overflow).toBeLessThanOrEqual(1);
  await page.locator('#gearPanel').screenshot({
    path:path.join('docs','screenshots','equipment-redesign','after-desktop.png')
  });
});

test('mobile uses tap-select and tap-equip without horizontal overflow',async({browser})=>{
  test.setTimeout(45000);
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await openEquipment(page);

  let candidate=await unequippedItem(page,'scarf');
  let entry=page.locator('#gearGrid [data-item="'+candidate.uid+'"]');
  await entry.tap();
  let state=await page.evaluate(()=>window.__riskTest.equipmentState());
  expect(state.selectedGearUid).toBe(candidate.uid);
  expect(state.equipped.scarf).not.toBe(candidate.uid);
  await expect(page.locator('#mobileGearComparison > span')).toHaveCount(5);
  await expect(page.locator('#mobileGearSet')).not.toBeEmpty();
  await expect(page.locator('#mobileGearEquip')).toHaveText(/EQUIP|REPLACE/);
  await page.locator('#mobileGearEquip').tap();
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentState().equipped.scarf)).toBe(candidate.uid);
  await expect(page.locator('#helpTooltip')).not.toHaveClass(/show/);

  candidate=await unequippedItem(page,'boots');
  await page.locator('#gearGrid [data-item="'+candidate.uid+'"]').tap();
  await page.locator('#mobileGearEquip').tap();
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentState().equipped.boots)).toBe(candidate.uid);
  await expect(page.locator('#helpTooltip')).not.toHaveClass(/show/);

  const layout=await page.locator('#gearPanel').evaluate(element=>({
    left:element.getBoundingClientRect().left,
    right:element.getBoundingClientRect().right,
    viewport:document.documentElement.clientWidth,
    documentOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    panelOverflow:element.scrollWidth-element.clientWidth
  }));
  expect(layout.left).toBeGreaterThanOrEqual(0);
  expect(layout.right).toBeLessThanOrEqual(layout.viewport);
  expect(layout.documentOverflow).toBeLessThanOrEqual(1);
  expect(layout.panelOverflow).toBeLessThanOrEqual(1);
  await page.evaluate(()=>{document.querySelector('#gearPanel').scrollTop=0});
  await page.screenshot({
    path:path.join('docs','screenshots','equipment-redesign','after-mobile.png')
  });
  await context.close();
});
