const {test,expect,devices}=require('@playwright/test');

async function boot(page){
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest&&window.RiskLootInventoryV2Bridge))).toBe(true)
}

async function expectPreviewMatchesEquipment(page){
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentPreviewState().matches),{timeout:10000}).toBe(true);
  const state=await page.evaluate(()=>({equipment:window.__riskTest.equipmentState().equipped,preview:window.__riskTest.equipmentPreviewState()}));
  for(const [slot,uid] of Object.entries(state.equipment))expect(state.preview.equipped[slot]&&state.preview.equipped[slot].uid||null).toBe(uid||null);
  expect(new Set(Object.values(state.preview.equipped).filter(Boolean).map(item=>item.uid)).size).toBe(Object.values(state.preview.equipped).filter(Boolean).length);
  expect(state.preview.domKey).toBe(state.preview.loadoutKey);
  expect(state.preview.atlas).toBeTruthy();
  return state.preview
}

async function prepareTwoSets(page){
  await page.evaluate(()=>{
    window.__riskTest.previewGearSet('hammerChoir');
    window.__riskTest.previewGearSet('blackHole')
  });
  await expectPreviewMatchesEquipment(page)
}

test('preview follows equip, unequip, swap, protected disposal and full-set break',async({page})=>{
  test.setTimeout(60000);
  await boot(page);
  await prepareTwoSets(page);

  let before=await page.evaluate(()=>window.__riskTest.equipmentPreviewState());
  expect(before.fullSetId).toBe('blackHole');
  const blackHoleHammer=before.equipped.weapon.uid;

  await page.evaluate(()=>window.RiskLootInventoryV2Bridge.unequip('weapon'));
  let unequipped=await expectPreviewMatchesEquipment(page);
  expect(unequipped.equipped.weapon).toBeNull();
  expect(unequipped.fullSetId).toBeNull();
  expect(unequipped.loadoutKey).not.toBe(before.loadoutKey);

  const replacement=await page.evaluate(()=>window.__riskTest.equipmentInventory().find(item=>item.slot==='weapon'&&!item.equipped&&item.uid!==window.__riskTest.equipmentPreviewState().equipped.weapon?.uid));
  await page.evaluate(uid=>window.RiskLootInventoryV2Bridge.equip(uid),replacement.uid);
  let swapped=await expectPreviewMatchesEquipment(page);
  expect(swapped.equipped.weapon.uid).toBe(replacement.uid);

  await page.evaluate(uid=>window.RiskLootInventoryV2Bridge.equip(uid),blackHoleHammer);
  swapped=await expectPreviewMatchesEquipment(page);
  expect(swapped.equipped.weapon.uid).toBe(blackHoleHammer);
  expect(swapped.fullSetId).toBe('blackHole');

  const sell=await page.evaluate(uid=>window.RiskLootInventoryV2Bridge.dispose(uid,'sell'),blackHoleHammer);
  expect(sell.reason).toBe('equipped');
  const salvage=await page.evaluate(uid=>window.RiskLootInventoryV2Bridge.dispose(uid,'salvage'),blackHoleHammer);
  expect(salvage.reason).toBe('equipped');
  await expectPreviewMatchesEquipment(page);
  await expect(page.locator('.gearCharacterHero')).toHaveCount(1)
});

test('preview survives rapid swaps, inventory lifecycle, save and refresh',async({page})=>{
  test.setTimeout(90000);
  await boot(page);
  await prepareTwoSets(page);
  const hammers=await page.evaluate(()=>window.__riskTest.equipmentInventory().filter(item=>item.slot==='weapon').slice(0,3).map(item=>item.uid));
  expect(hammers.length).toBeGreaterThanOrEqual(2);

  for(let index=0;index<20;index++){
    await page.evaluate(uid=>window.RiskLootInventoryV2Bridge.equip(uid),hammers[index%hammers.length]);
    await expectPreviewMatchesEquipment(page)
  }

  await page.locator('#closeGear').click();
  await page.locator('#inventoryV2Button').click();
  await expect(page.locator('#inventoryV2Overlay')).toHaveClass(/show/);
  await expectPreviewMatchesEquipment(page);
  await page.locator('#inventoryV2Close').click();
  await page.evaluate(()=>window.RiskLootInventoryV2Bridge.openLegacy());
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
  await prepareTwoSets(page);
  await page.locator('#closeGear').tap();
  await page.locator('#inventoryV2Button').tap();
  const candidate=await page.evaluate(()=>window.__riskTest.equipmentInventory().find(item=>item.slot==='boots'&&!item.equipped));
  await page.locator(`.inventoryV2Card[data-uid="${candidate.uid}"]`).tap();
  await page.locator('#inventoryV2Equip').tap();
  const state=await expectPreviewMatchesEquipment(page);
  expect(state.equipped.boots.uid).toBe(candidate.uid);
  await page.locator('#inventoryV2Equip').tap();
  const removed=await expectPreviewMatchesEquipment(page);
  expect(removed.equipped.boots).toBeNull();
  await context.close()
});
