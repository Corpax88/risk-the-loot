const {test,expect,devices}=require('@playwright/test');

async function boot(page){
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest&&window.RiskLootInventoryV2Bridge))).toBe(true)
}

async function expectPreviewMatchesEquipment(page){
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentPreviewState().matches),{timeout:10000}).toBe(true);
  const state=await page.evaluate(()=>({equipment:window.__riskTest.equipmentState().equipped,preview:window.__riskTest.equipmentPreviewState()}));
  for(const [slot,uid] of Object.entries(state.equipment))expect(state.preview.equipped[slot]&&state.preview.equipped[slot].uid||null).toBe(uid||null);
  const visible=Object.values(state.preview.equipped).filter(Boolean);
  expect(new Set(visible.map(item=>item.uid)).size).toBe(visible.length);
  expect(state.preview.domKey).toBe(state.preview.loadoutKey);
  expect(state.preview.atlas).toBeTruthy();
  return state.preview
}

async function prepareTwoStormcallerCopies(page){
  await page.evaluate(()=>{
    window.__riskTest.previewGearSet('stormrunner');
    window.__riskTest.previewGearSet('stormrunner')
  });
  await expectPreviewMatchesEquipment(page)
}

test('preview follows equip, unequip, swap and protected disposal',async({page})=>{
  test.setTimeout(60000);
  await boot(page);
  await prepareTwoStormcallerCopies(page);

  let before=await page.evaluate(()=>window.__riskTest.equipmentPreviewState());
  expect(before.fullSetId).toBe('stormrunner');
  const equippedWeapon=before.equipped.weapon.uid;

  await page.evaluate(()=>window.RiskLootInventoryV2Bridge.unequip('weapon'));
  let unequipped=await expectPreviewMatchesEquipment(page);
  expect(unequipped.equipped.weapon).toBeNull();
  expect(unequipped.fullSetId).toBeNull();
  expect(unequipped.loadoutKey).not.toBe(before.loadoutKey);

  const replacement=await page.evaluate(()=>window.__riskTest.equipmentInventory().find(item=>item.slot==='weapon'&&!item.equipped));
  expect(replacement).toBeTruthy();
  await page.evaluate(uid=>window.RiskLootInventoryV2Bridge.equip(uid),replacement.uid);
  let swapped=await expectPreviewMatchesEquipment(page);
  expect(swapped.equipped.weapon.uid).toBe(replacement.uid);
  expect(swapped.fullSetId).toBe('stormrunner');

  await page.evaluate(uid=>window.RiskLootInventoryV2Bridge.equip(uid),equippedWeapon);
  swapped=await expectPreviewMatchesEquipment(page);
  expect(swapped.equipped.weapon.uid).toBe(equippedWeapon);

  const sell=await page.evaluate(uid=>window.RiskLootInventoryV2Bridge.dispose(uid,'sell'),equippedWeapon);
  expect(sell.reason).toBe('equipped');
  const salvage=await page.evaluate(uid=>window.RiskLootInventoryV2Bridge.dispose(uid,'salvage'),equippedWeapon);
  expect(salvage.reason).toBe('equipped');
  await expectPreviewMatchesEquipment(page);
  await expect(page.locator('.gearCharacterHero')).toHaveCount(1)
});

test('preview survives rapid swaps, inventory lifecycle, save and refresh',async({page})=>{
  test.setTimeout(90000);
  await boot(page);
  await prepareTwoStormcallerCopies(page);
  const weapons=await page.evaluate(()=>window.__riskTest.equipmentInventory().filter(item=>item.slot==='weapon').slice(0,3).map(item=>item.uid));
  expect(weapons.length).toBeGreaterThanOrEqual(2);

  for(let index=0;index<20;index++){
    await page.evaluate(uid=>window.RiskLootInventoryV2Bridge.equip(uid),weapons[index%weapons.length]);
    await expectPreviewMatchesEquipment(page)
  }

  await page.locator('#closeGear').click();
  await expect(page.locator('#gearOverlay')).not.toHaveClass(/show/);
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentPreviewState().runtimeMatches)).toBe(true);
  await page.locator('#gearLockerButton').click();
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
  await expectPreviewMatchesEquipment(page);

  await page.evaluate(()=>window.RiskLootInventoryV2Bridge.flush());
  const saved=await page.evaluate(()=>window.__riskTest.equipmentState().equipped);
  await page.reload();
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest&&window.RiskLootInventoryV2Bridge))).toBe(true);
  await expect.poll(()=>page.evaluate(expected=>JSON.stringify(window.__riskTest.equipmentState().equipped)===JSON.stringify(expected),saved)).toBe(true);
  const refreshed=await expectPreviewMatchesEquipment(page);
  expect(refreshed.equipped.weapon&&refreshed.equipped.weapon.uid).toBe(saved.weapon)
});

test('iPhone tap equipment updates slots and preview in the same interaction',async({browser})=>{
  test.setTimeout(60000);
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await boot(page);
  await prepareTwoStormcallerCopies(page);
  const candidate=await page.evaluate(()=>window.__riskTest.equipmentInventory().find(item=>item.slot==='boots'&&!item.equipped));
  expect(candidate).toBeTruthy();
  await page.locator(`.gearBagSlot[data-item="${candidate.uid}"]`).tap();
  await expect(page.locator('#mobileGearEquip')).toHaveText('REPLACE');
  await page.locator('#mobileGearEquip').tap();
  let state=await expectPreviewMatchesEquipment(page);
  expect(state.equipped.boots.uid).toBe(candidate.uid);
  await page.locator('.gearLoadoutSlot[data-display-slot="boots"]').tap();
  state=await expectPreviewMatchesEquipment(page);
  expect(state.equipped.boots).toBeNull();
  await context.close()
});
